/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { ConnectedOverlayPositionChange, validateHorizontalPosition, validateVerticalPosition, } from './connected-position';
import { Subscription, Subject } from 'rxjs';
import { isElementScrolledOutsideView, isElementClippedByScrolling } from './scroll-clip';
import { coerceCssPixelValue, coerceArray } from '@angular/cdk/coercion';
// TODO: refactor clipping detection into a separate thing (part of scrolling module)
// TODO: doesn't handle both flexible width and height when it has to scroll along both axis.
/** Class to be added to the overlay bounding box. */
const boundingBoxClass = 'cdk-overlay-connected-position-bounding-box';
/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
export class FlexibleConnectedPositionStrategy {
    /** Ordered list of preferred positions, from most to least desirable. */
    get positions() {
        return this._preferredPositions;
    }
    constructor(connectedTo, _viewportRuler, _document, _platform, _overlayContainer) {
        this._viewportRuler = _viewportRuler;
        this._document = _document;
        this._platform = _platform;
        this._overlayContainer = _overlayContainer;
        /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
        this._lastBoundingBoxSize = { width: 0, height: 0 };
        /** Whether the overlay was pushed in a previous positioning. */
        this._isPushed = false;
        /** Whether the overlay can be pushed on-screen on the initial open. */
        this._canPush = true;
        /** Whether the overlay can grow via flexible width/height after the initial open. */
        this._growAfterOpen = false;
        /** Whether the overlay's width and height can be constrained to fit within the viewport. */
        this._hasFlexibleDimensions = true;
        /** Whether the overlay position is locked. */
        this._positionLocked = false;
        /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
        this._viewportMargin = 0;
        /** The Scrollable containers used to check scrollable view properties on position change. */
        this._scrollables = [];
        /** Ordered list of preferred positions, from most to least desirable. */
        this._preferredPositions = [];
        /** Subject that emits whenever the position changes. */
        this._positionChanges = new Subject();
        /** Subscription to viewport size changes. */
        this._resizeSubscription = Subscription.EMPTY;
        /** Default offset for the overlay along the x axis. */
        this._offsetX = 0;
        /** Default offset for the overlay along the y axis. */
        this._offsetY = 0;
        /** Keeps track of the CSS classes that the position strategy has applied on the overlay panel. */
        this._appliedPanelClasses = [];
        /** Observable sequence of position changes. */
        this.positionChanges = this._positionChanges;
        this.setOrigin(connectedTo);
    }
    /** Attaches this position strategy to an overlay. */
    attach(overlayRef) {
        if (this._overlayRef &&
            overlayRef !== this._overlayRef &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('This position strategy is already attached to an overlay');
        }
        this._validatePositions();
        overlayRef.hostElement.classList.add(boundingBoxClass);
        this._overlayRef = overlayRef;
        this._boundingBox = overlayRef.hostElement;
        this._pane = overlayRef.overlayElement;
        this._isDisposed = false;
        this._isInitialRender = true;
        this._lastPosition = null;
        this._resizeSubscription.unsubscribe();
        this._resizeSubscription = this._viewportRuler.change().subscribe(() => {
            // When the window is resized, we want to trigger the next reposition as if it
            // was an initial render, in order for the strategy to pick a new optimal position,
            // otherwise position locking will cause it to stay at the old one.
            this._isInitialRender = true;
            this.apply();
        });
    }
    /**
     * Updates the position of the overlay element, using whichever preferred position relative
     * to the origin best fits on-screen.
     *
     * The selection of a position goes as follows:
     *  - If any positions fit completely within the viewport as-is,
     *      choose the first position that does so.
     *  - If flexible dimensions are enabled and at least one satisfies the given minimum width/height,
     *      choose the position with the greatest available size modified by the positions' weight.
     *  - If pushing is enabled, take the position that went off-screen the least and push it
     *      on-screen.
     *  - If none of the previous criteria were met, use the position that goes off-screen the least.
     * @docs-private
     */
    apply() {
        // We shouldn't do anything if the strategy was disposed or we're on the server.
        if (this._isDisposed || !this._platform.isBrowser) {
            return;
        }
        // If the position has been applied already (e.g. when the overlay was opened) and the
        // consumer opted into locking in the position, re-use the old position, in order to
        // prevent the overlay from jumping around.
        if (!this._isInitialRender && this._positionLocked && this._lastPosition) {
            this.reapplyLastPosition();
            return;
        }
        this._clearPanelClasses();
        this._resetOverlayElementStyles();
        this._resetBoundingBoxStyles();
        // We need the bounding rects for the origin, the overlay and the container to determine how to position
        // the overlay relative to the origin.
        // We use the viewport rect to determine whether a position would go off-screen.
        this._viewportRect = this._getNarrowedViewportRect();
        this._originRect = this._getOriginRect();
        this._overlayRect = this._pane.getBoundingClientRect();
        this._containerRect = this._overlayContainer.getContainerElement().getBoundingClientRect();
        const originRect = this._originRect;
        const overlayRect = this._overlayRect;
        const viewportRect = this._viewportRect;
        const containerRect = this._containerRect;
        // Positions where the overlay will fit with flexible dimensions.
        const flexibleFits = [];
        // Fallback if none of the preferred positions fit within the viewport.
        let fallback;
        // Go through each of the preferred positions looking for a good fit.
        // If a good fit is found, it will be applied immediately.
        for (let pos of this._preferredPositions) {
            // Get the exact (x, y) coordinate for the point-of-origin on the origin element.
            let originPoint = this._getOriginPoint(originRect, containerRect, pos);
            // From that point-of-origin, get the exact (x, y) coordinate for the top-left corner of the
            // overlay in this position. We use the top-left corner for calculations and later translate
            // this into an appropriate (top, left, bottom, right) style.
            let overlayPoint = this._getOverlayPoint(originPoint, overlayRect, pos);
            // Calculate how well the overlay would fit into the viewport with this point.
            let overlayFit = this._getOverlayFit(overlayPoint, overlayRect, viewportRect, pos);
            // If the overlay, without any further work, fits into the viewport, use this position.
            if (overlayFit.isCompletelyWithinViewport) {
                this._isPushed = false;
                this._applyPosition(pos, originPoint);
                return;
            }
            // If the overlay has flexible dimensions, we can use this position
            // so long as there's enough space for the minimum dimensions.
            if (this._canFitWithFlexibleDimensions(overlayFit, overlayPoint, viewportRect)) {
                // Save positions where the overlay will fit with flexible dimensions. We will use these
                // if none of the positions fit *without* flexible dimensions.
                flexibleFits.push({
                    position: pos,
                    origin: originPoint,
                    overlayRect,
                    boundingBoxRect: this._calculateBoundingBoxRect(originPoint, pos),
                });
                continue;
            }
            // If the current preferred position does not fit on the screen, remember the position
            // if it has more visible area on-screen than we've seen and move onto the next preferred
            // position.
            if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
                fallback = { overlayFit, overlayPoint, originPoint, position: pos, overlayRect };
            }
        }
        // If there are any positions where the overlay would fit with flexible dimensions, choose the
        // one that has the greatest area available modified by the position's weight
        if (flexibleFits.length) {
            let bestFit = null;
            let bestScore = -1;
            for (const fit of flexibleFits) {
                const score = fit.boundingBoxRect.width * fit.boundingBoxRect.height * (fit.position.weight || 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestFit = fit;
                }
            }
            this._isPushed = false;
            this._applyPosition(bestFit.position, bestFit.origin);
            return;
        }
        // When none of the preferred positions fit within the viewport, take the position
        // that went off-screen the least and attempt to push it on-screen.
        if (this._canPush) {
            // TODO(jelbourn): after pushing, the opening "direction" of the overlay might not make sense.
            this._isPushed = true;
            this._applyPosition(fallback.position, fallback.originPoint);
            return;
        }
        // All options for getting the overlay within the viewport have been exhausted, so go with the
        // position that went off-screen the least.
        this._applyPosition(fallback.position, fallback.originPoint);
    }
    detach() {
        this._clearPanelClasses();
        this._lastPosition = null;
        this._previousPushAmount = null;
        this._resizeSubscription.unsubscribe();
    }
    /** Cleanup after the element gets destroyed. */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        // We can't use `_resetBoundingBoxStyles` here, because it resets
        // some properties to zero, rather than removing them.
        if (this._boundingBox) {
            extendStyles(this._boundingBox.style, {
                top: '',
                left: '',
                right: '',
                bottom: '',
                height: '',
                width: '',
                alignItems: '',
                justifyContent: '',
            });
        }
        if (this._pane) {
            this._resetOverlayElementStyles();
        }
        if (this._overlayRef) {
            this._overlayRef.hostElement.classList.remove(boundingBoxClass);
        }
        this.detach();
        this._positionChanges.complete();
        this._overlayRef = this._boundingBox = null;
        this._isDisposed = true;
    }
    /**
     * This re-aligns the overlay element with the trigger in its last calculated position,
     * even if a position higher in the "preferred positions" list would now fit. This
     * allows one to re-align the panel without changing the orientation of the panel.
     */
    reapplyLastPosition() {
        if (this._isDisposed || !this._platform.isBrowser) {
            return;
        }
        const lastPosition = this._lastPosition;
        if (lastPosition) {
            this._originRect = this._getOriginRect();
            this._overlayRect = this._pane.getBoundingClientRect();
            this._viewportRect = this._getNarrowedViewportRect();
            this._containerRect = this._overlayContainer.getContainerElement().getBoundingClientRect();
            const originPoint = this._getOriginPoint(this._originRect, this._containerRect, lastPosition);
            this._applyPosition(lastPosition, originPoint);
        }
        else {
            this.apply();
        }
    }
    /**
     * Sets the list of Scrollable containers that host the origin element so that
     * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
     * Scrollable must be an ancestor element of the strategy's origin element.
     */
    withScrollableContainers(scrollables) {
        this._scrollables = scrollables;
        return this;
    }
    /**
     * Adds new preferred positions.
     * @param positions List of positions options for this overlay.
     */
    withPositions(positions) {
        this._preferredPositions = positions;
        // If the last calculated position object isn't part of the positions anymore, clear
        // it in order to avoid it being picked up if the consumer tries to re-apply.
        if (positions.indexOf(this._lastPosition) === -1) {
            this._lastPosition = null;
        }
        this._validatePositions();
        return this;
    }
    /**
     * Sets a minimum distance the overlay may be positioned to the edge of the viewport.
     * @param margin Required margin between the overlay and the viewport edge in pixels.
     */
    withViewportMargin(margin) {
        this._viewportMargin = margin;
        return this;
    }
    /** Sets whether the overlay's width and height can be constrained to fit within the viewport. */
    withFlexibleDimensions(flexibleDimensions = true) {
        this._hasFlexibleDimensions = flexibleDimensions;
        return this;
    }
    /** Sets whether the overlay can grow after the initial open via flexible width/height. */
    withGrowAfterOpen(growAfterOpen = true) {
        this._growAfterOpen = growAfterOpen;
        return this;
    }
    /** Sets whether the overlay can be pushed on-screen if none of the provided positions fit. */
    withPush(canPush = true) {
        this._canPush = canPush;
        return this;
    }
    /**
     * Sets whether the overlay's position should be locked in after it is positioned
     * initially. When an overlay is locked in, it won't attempt to reposition itself
     * when the position is re-applied (e.g. when the user scrolls away).
     * @param isLocked Whether the overlay should locked in.
     */
    withLockedPosition(isLocked = true) {
        this._positionLocked = isLocked;
        return this;
    }
    /**
     * Sets the origin, relative to which to position the overlay.
     * Using an element origin is useful for building components that need to be positioned
     * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
     * used for cases like contextual menus which open relative to the user's pointer.
     * @param origin Reference to the new origin.
     */
    setOrigin(origin) {
        this._origin = origin;
        return this;
    }
    /**
     * Sets the default offset for the overlay's connection point on the x-axis.
     * @param offset New offset in the X axis.
     */
    withDefaultOffsetX(offset) {
        this._offsetX = offset;
        return this;
    }
    /**
     * Sets the default offset for the overlay's connection point on the y-axis.
     * @param offset New offset in the Y axis.
     */
    withDefaultOffsetY(offset) {
        this._offsetY = offset;
        return this;
    }
    /**
     * Configures that the position strategy should set a `transform-origin` on some elements
     * inside the overlay, depending on the current position that is being applied. This is
     * useful for the cases where the origin of an animation can change depending on the
     * alignment of the overlay.
     * @param selector CSS selector that will be used to find the target
     *    elements onto which to set the transform origin.
     */
    withTransformOriginOn(selector) {
        this._transformOriginSelector = selector;
        return this;
    }
    /**
     * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
     */
    _getOriginPoint(originRect, containerRect, pos) {
        let x;
        if (pos.originX == 'center') {
            // Note: when centering we should always use the `left`
            // offset, otherwise the position will be wrong in RTL.
            x = originRect.left + originRect.width / 2;
        }
        else {
            const startX = this._isRtl() ? originRect.right : originRect.left;
            const endX = this._isRtl() ? originRect.left : originRect.right;
            x = pos.originX == 'start' ? startX : endX;
        }
        // When zooming in Safari the container rectangle contains negative values for the position
        // and we need to re-add them to the calculated coordinates.
        if (containerRect.left < 0) {
            x -= containerRect.left;
        }
        let y;
        if (pos.originY == 'center') {
            y = originRect.top + originRect.height / 2;
        }
        else {
            y = pos.originY == 'top' ? originRect.top : originRect.bottom;
        }
        // Normally the containerRect's top value would be zero, however when the overlay is attached to an input
        // (e.g. in an autocomplete), mobile browsers will shift everything in order to put the input in the middle
        // of the screen and to make space for the virtual keyboard. We need to account for this offset,
        // otherwise our positioning will be thrown off.
        // Additionally, when zooming in Safari this fixes the vertical position.
        if (containerRect.top < 0) {
            y -= containerRect.top;
        }
        return { x, y };
    }
    /**
     * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
     * origin point to which the overlay should be connected.
     */
    _getOverlayPoint(originPoint, overlayRect, pos) {
        // Calculate the (overlayStartX, overlayStartY), the start of the
        // potential overlay position relative to the origin point.
        let overlayStartX;
        if (pos.overlayX == 'center') {
            overlayStartX = -overlayRect.width / 2;
        }
        else if (pos.overlayX === 'start') {
            overlayStartX = this._isRtl() ? -overlayRect.width : 0;
        }
        else {
            overlayStartX = this._isRtl() ? 0 : -overlayRect.width;
        }
        let overlayStartY;
        if (pos.overlayY == 'center') {
            overlayStartY = -overlayRect.height / 2;
        }
        else {
            overlayStartY = pos.overlayY == 'top' ? 0 : -overlayRect.height;
        }
        // The (x, y) coordinates of the overlay.
        return {
            x: originPoint.x + overlayStartX,
            y: originPoint.y + overlayStartY,
        };
    }
    /** Gets how well an overlay at the given point will fit within the viewport. */
    _getOverlayFit(point, rawOverlayRect, viewport, position) {
        // Round the overlay rect when comparing against the
        // viewport, because the viewport is always rounded.
        const overlay = getRoundedBoundingClientRect(rawOverlayRect);
        let { x, y } = point;
        let offsetX = this._getOffset(position, 'x');
        let offsetY = this._getOffset(position, 'y');
        // Account for the offsets since they could push the overlay out of the viewport.
        if (offsetX) {
            x += offsetX;
        }
        if (offsetY) {
            y += offsetY;
        }
        // How much the overlay would overflow at this position, on each side.
        let leftOverflow = 0 - x;
        let rightOverflow = x + overlay.width - viewport.width;
        let topOverflow = 0 - y;
        let bottomOverflow = y + overlay.height - viewport.height;
        // Visible parts of the element on each axis.
        let visibleWidth = this._subtractOverflows(overlay.width, leftOverflow, rightOverflow);
        let visibleHeight = this._subtractOverflows(overlay.height, topOverflow, bottomOverflow);
        let visibleArea = visibleWidth * visibleHeight;
        return {
            visibleArea,
            isCompletelyWithinViewport: overlay.width * overlay.height === visibleArea,
            fitsInViewportVertically: visibleHeight === overlay.height,
            fitsInViewportHorizontally: visibleWidth == overlay.width,
        };
    }
    /**
     * Whether the overlay can fit within the viewport when it may resize either its width or height.
     * @param fit How well the overlay fits in the viewport at some position.
     * @param point The (x, y) coordinates of the overlay at some position.
     * @param viewport The geometry of the viewport.
     */
    _canFitWithFlexibleDimensions(fit, point, viewport) {
        if (this._hasFlexibleDimensions) {
            const availableHeight = viewport.bottom - point.y;
            const availableWidth = viewport.right - point.x;
            const minHeight = getPixelValue(this._overlayRef.getConfig().minHeight);
            const minWidth = getPixelValue(this._overlayRef.getConfig().minWidth);
            const verticalFit = fit.fitsInViewportVertically || (minHeight != null && minHeight <= availableHeight);
            const horizontalFit = fit.fitsInViewportHorizontally || (minWidth != null && minWidth <= availableWidth);
            return verticalFit && horizontalFit;
        }
        return false;
    }
    /**
     * Gets the point at which the overlay can be "pushed" on-screen. If the overlay is larger than
     * the viewport, the top-left corner will be pushed on-screen (with overflow occurring on the
     * right and bottom).
     *
     * @param start Starting point from which the overlay is pushed.
     * @param rawOverlayRect Dimensions of the overlay.
     * @param scrollPosition Current viewport scroll position.
     * @returns The point at which to position the overlay after pushing. This is effectively a new
     *     originPoint.
     */
    _pushOverlayOnScreen(start, rawOverlayRect, scrollPosition) {
        // If the position is locked and we've pushed the overlay already, reuse the previous push
        // amount, rather than pushing it again. If we were to continue pushing, the element would
        // remain in the viewport, which goes against the expectations when position locking is enabled.
        if (this._previousPushAmount && this._positionLocked) {
            return {
                x: start.x + this._previousPushAmount.x,
                y: start.y + this._previousPushAmount.y,
            };
        }
        // Round the overlay rect when comparing against the
        // viewport, because the viewport is always rounded.
        const overlay = getRoundedBoundingClientRect(rawOverlayRect);
        const viewport = this._viewportRect;
        // Determine how much the overlay goes outside the viewport on each
        // side, which we'll use to decide which direction to push it.
        const overflowRight = Math.max(start.x + overlay.width - viewport.width, 0);
        const overflowBottom = Math.max(start.y + overlay.height - viewport.height, 0);
        const overflowTop = Math.max(viewport.top - scrollPosition.top - start.y, 0);
        const overflowLeft = Math.max(viewport.left - scrollPosition.left - start.x, 0);
        // Amount by which to push the overlay in each axis such that it remains on-screen.
        let pushX = 0;
        let pushY = 0;
        // If the overlay fits completely within the bounds of the viewport, push it from whichever
        // direction is goes off-screen. Otherwise, push the top-left corner such that its in the
        // viewport and allow for the trailing end of the overlay to go out of bounds.
        if (overlay.width <= viewport.width) {
            pushX = overflowLeft || -overflowRight;
        }
        else {
            pushX = start.x < this._viewportMargin ? viewport.left - scrollPosition.left - start.x : 0;
        }
        if (overlay.height <= viewport.height) {
            pushY = overflowTop || -overflowBottom;
        }
        else {
            pushY = start.y < this._viewportMargin ? viewport.top - scrollPosition.top - start.y : 0;
        }
        this._previousPushAmount = { x: pushX, y: pushY };
        return {
            x: start.x + pushX,
            y: start.y + pushY,
        };
    }
    /**
     * Applies a computed position to the overlay and emits a position change.
     * @param position The position preference
     * @param originPoint The point on the origin element where the overlay is connected.
     */
    _applyPosition(position, originPoint) {
        this._setTransformOrigin(position);
        this._setOverlayElementStyles(originPoint, position);
        this._setBoundingBoxStyles(originPoint, position);
        if (position.panelClass) {
            this._addPanelClasses(position.panelClass);
        }
        // Notify that the position has been changed along with its change properties.
        // We only emit if we've got any subscriptions, because the scroll visibility
        // calculations can be somewhat expensive.
        if (this._positionChanges.observers.length) {
            const scrollVisibility = this._getScrollVisibility();
            // We're recalculating on scroll, but we only want to emit if anything
            // changed since downstream code might be hitting the `NgZone`.
            if (position !== this._lastPosition ||
                !this._lastScrollVisibility ||
                !compareScrollVisibility(this._lastScrollVisibility, scrollVisibility)) {
                const changeEvent = new ConnectedOverlayPositionChange(position, scrollVisibility);
                this._positionChanges.next(changeEvent);
            }
            this._lastScrollVisibility = scrollVisibility;
        }
        // Save the last connected position in case the position needs to be re-calculated.
        this._lastPosition = position;
        this._isInitialRender = false;
    }
    /** Sets the transform origin based on the configured selector and the passed-in position.  */
    _setTransformOrigin(position) {
        if (!this._transformOriginSelector) {
            return;
        }
        const elements = this._boundingBox.querySelectorAll(this._transformOriginSelector);
        let xOrigin;
        let yOrigin = position.overlayY;
        if (position.overlayX === 'center') {
            xOrigin = 'center';
        }
        else if (this._isRtl()) {
            xOrigin = position.overlayX === 'start' ? 'right' : 'left';
        }
        else {
            xOrigin = position.overlayX === 'start' ? 'left' : 'right';
        }
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.transformOrigin = `${xOrigin} ${yOrigin}`;
        }
    }
    /**
     * Gets the position and size of the overlay's sizing container.
     *
     * This method does no measuring and applies no styles so that we can cheaply compute the
     * bounds for all positions and choose the best fit based on these results.
     */
    _calculateBoundingBoxRect(origin, position) {
        const viewport = this._viewportRect;
        const isRtl = this._isRtl();
        let height, top, bottom;
        if (position.overlayY === 'top') {
            // Overlay is opening "downward" and thus is bound by the bottom viewport edge.
            top = origin.y;
            height = viewport.height - top + this._viewportMargin;
        }
        else if (position.overlayY === 'bottom') {
            // Overlay is opening "upward" and thus is bound by the top viewport edge. We need to add
            // the viewport margin back in, because the viewport rect is narrowed down to remove the
            // margin, whereas the `origin` position is calculated based on its `DOMRect`.
            bottom = viewport.height - origin.y + this._viewportMargin * 2;
            height = viewport.height - bottom + this._viewportMargin;
        }
        else {
            // If neither top nor bottom, it means that the overlay is vertically centered on the
            // origin point. Note that we want the position relative to the viewport, rather than
            // the page, which is why we don't use something like `viewport.bottom - origin.y` and
            // `origin.y - viewport.top`.
            const smallestDistanceToViewportEdge = Math.min(viewport.bottom - origin.y + viewport.top, origin.y);
            const previousHeight = this._lastBoundingBoxSize.height;
            height = smallestDistanceToViewportEdge * 2;
            top = origin.y - smallestDistanceToViewportEdge;
            if (height > previousHeight && !this._isInitialRender && !this._growAfterOpen) {
                top = origin.y - previousHeight / 2;
            }
        }
        // The overlay is opening 'right-ward' (the content flows to the right).
        const isBoundedByRightViewportEdge = (position.overlayX === 'start' && !isRtl) || (position.overlayX === 'end' && isRtl);
        // The overlay is opening 'left-ward' (the content flows to the left).
        const isBoundedByLeftViewportEdge = (position.overlayX === 'end' && !isRtl) || (position.overlayX === 'start' && isRtl);
        let width, left, right;
        if (isBoundedByLeftViewportEdge) {
            right = viewport.width - origin.x + this._viewportMargin * 2;
            width = origin.x - this._viewportMargin;
        }
        else if (isBoundedByRightViewportEdge) {
            left = origin.x;
            width = viewport.right - origin.x;
        }
        else {
            // If neither start nor end, it means that the overlay is horizontally centered on the
            // origin point. Note that we want the position relative to the viewport, rather than
            // the page, which is why we don't use something like `viewport.right - origin.x` and
            // `origin.x - viewport.left`.
            const smallestDistanceToViewportEdge = Math.min(viewport.right - origin.x + viewport.left, origin.x);
            const previousWidth = this._lastBoundingBoxSize.width;
            width = smallestDistanceToViewportEdge * 2;
            left = origin.x - smallestDistanceToViewportEdge;
            if (width > previousWidth && !this._isInitialRender && !this._growAfterOpen) {
                left = origin.x - previousWidth / 2;
            }
        }
        return { top: top, left: left, bottom: bottom, right: right, width, height };
    }
    /**
     * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
     * origin's connection point and stretches to the bounds of the viewport.
     *
     * @param origin The point on the origin element where the overlay is connected.
     * @param position The position preference
     */
    _setBoundingBoxStyles(origin, position) {
        const boundingBoxRect = this._calculateBoundingBoxRect(origin, position);
        // It's weird if the overlay *grows* while scrolling, so we take the last size into account
        // when applying a new size.
        if (!this._isInitialRender && !this._growAfterOpen) {
            boundingBoxRect.height = Math.min(boundingBoxRect.height, this._lastBoundingBoxSize.height);
            boundingBoxRect.width = Math.min(boundingBoxRect.width, this._lastBoundingBoxSize.width);
        }
        const styles = {};
        if (this._hasExactPosition()) {
            styles.top = styles.left = '0';
            styles.bottom = styles.right = styles.maxHeight = styles.maxWidth = '';
            styles.width = styles.height = '100%';
        }
        else {
            const maxHeight = this._overlayRef.getConfig().maxHeight;
            const maxWidth = this._overlayRef.getConfig().maxWidth;
            styles.height = coerceCssPixelValue(boundingBoxRect.height);
            styles.top = coerceCssPixelValue(boundingBoxRect.top);
            styles.bottom = coerceCssPixelValue(boundingBoxRect.bottom);
            styles.width = coerceCssPixelValue(boundingBoxRect.width);
            styles.left = coerceCssPixelValue(boundingBoxRect.left);
            styles.right = coerceCssPixelValue(boundingBoxRect.right);
            // Push the pane content towards the proper direction.
            if (position.overlayX === 'center') {
                styles.alignItems = 'center';
            }
            else {
                styles.alignItems = position.overlayX === 'end' ? 'flex-end' : 'flex-start';
            }
            if (position.overlayY === 'center') {
                styles.justifyContent = 'center';
            }
            else {
                styles.justifyContent = position.overlayY === 'bottom' ? 'flex-end' : 'flex-start';
            }
            if (maxHeight) {
                styles.maxHeight = coerceCssPixelValue(maxHeight);
            }
            if (maxWidth) {
                styles.maxWidth = coerceCssPixelValue(maxWidth);
            }
        }
        this._lastBoundingBoxSize = boundingBoxRect;
        extendStyles(this._boundingBox.style, styles);
    }
    /** Resets the styles for the bounding box so that a new positioning can be computed. */
    _resetBoundingBoxStyles() {
        extendStyles(this._boundingBox.style, {
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            height: '',
            width: '',
            alignItems: '',
            justifyContent: '',
        });
    }
    /** Resets the styles for the overlay pane so that a new positioning can be computed. */
    _resetOverlayElementStyles() {
        extendStyles(this._pane.style, {
            top: '',
            left: '',
            bottom: '',
            right: '',
            position: '',
            transform: '',
        });
    }
    /** Sets positioning styles to the overlay element. */
    _setOverlayElementStyles(originPoint, position) {
        const styles = {};
        const hasExactPosition = this._hasExactPosition();
        const hasFlexibleDimensions = this._hasFlexibleDimensions;
        const config = this._overlayRef.getConfig();
        if (hasExactPosition) {
            const scrollPosition = this._viewportRuler.getViewportScrollPosition();
            extendStyles(styles, this._getExactOverlayY(position, originPoint, scrollPosition));
            extendStyles(styles, this._getExactOverlayX(position, originPoint, scrollPosition));
        }
        else {
            styles.position = 'static';
        }
        // Use a transform to apply the offsets. We do this because the `center` positions rely on
        // being in the normal flex flow and setting a `top` / `left` at all will completely throw
        // off the position. We also can't use margins, because they won't have an effect in some
        // cases where the element doesn't have anything to "push off of". Finally, this works
        // better both with flexible and non-flexible positioning.
        let transformString = '';
        let offsetX = this._getOffset(position, 'x');
        let offsetY = this._getOffset(position, 'y');
        if (offsetX) {
            transformString += `translateX(${offsetX}px) `;
        }
        if (offsetY) {
            transformString += `translateY(${offsetY}px)`;
        }
        styles.transform = transformString.trim();
        // If a maxWidth or maxHeight is specified on the overlay, we remove them. We do this because
        // we need these values to both be set to "100%" for the automatic flexible sizing to work.
        // The maxHeight and maxWidth are set on the boundingBox in order to enforce the constraint.
        // Note that this doesn't apply when we have an exact position, in which case we do want to
        // apply them because they'll be cleared from the bounding box.
        if (config.maxHeight) {
            if (hasExactPosition) {
                styles.maxHeight = coerceCssPixelValue(config.maxHeight);
            }
            else if (hasFlexibleDimensions) {
                styles.maxHeight = '';
            }
        }
        if (config.maxWidth) {
            if (hasExactPosition) {
                styles.maxWidth = coerceCssPixelValue(config.maxWidth);
            }
            else if (hasFlexibleDimensions) {
                styles.maxWidth = '';
            }
        }
        extendStyles(this._pane.style, styles);
    }
    /** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
    _getExactOverlayY(position, originPoint, scrollPosition) {
        // Reset any existing styles. This is necessary in case the
        // preferred position has changed since the last `apply`.
        let styles = { top: '', bottom: '' };
        let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);
        if (this._isPushed) {
            overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition);
        }
        // We want to set either `top` or `bottom` based on whether the overlay wants to appear
        // above or below the origin and the direction in which the element will expand.
        if (position.overlayY === 'bottom') {
            // When using `bottom`, we adjust the y position such that it is the distance
            // from the bottom of the viewport rather than the top.
            const documentHeight = this._document.documentElement.clientHeight;
            styles.bottom = `${documentHeight - (overlayPoint.y + this._overlayRect.height)}px`;
        }
        else {
            styles.top = coerceCssPixelValue(overlayPoint.y);
        }
        return styles;
    }
    /** Gets the exact left/right for the overlay when not using flexible sizing or when pushing. */
    _getExactOverlayX(position, originPoint, scrollPosition) {
        // Reset any existing styles. This is necessary in case the preferred position has
        // changed since the last `apply`.
        let styles = { left: '', right: '' };
        let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);
        if (this._isPushed) {
            overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition);
        }
        // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
        // or "after" the origin, which determines the direction in which the element will expand.
        // For the horizontal axis, the meaning of "before" and "after" change based on whether the
        // page is in RTL or LTR.
        let horizontalStyleProperty;
        if (this._isRtl()) {
            horizontalStyleProperty = position.overlayX === 'end' ? 'left' : 'right';
        }
        else {
            horizontalStyleProperty = position.overlayX === 'end' ? 'right' : 'left';
        }
        // When we're setting `right`, we adjust the x position such that it is the distance
        // from the right edge of the viewport rather than the left edge.
        if (horizontalStyleProperty === 'right') {
            const documentWidth = this._document.documentElement.clientWidth;
            styles.right = `${documentWidth - (overlayPoint.x + this._overlayRect.width)}px`;
        }
        else {
            styles.left = coerceCssPixelValue(overlayPoint.x);
        }
        return styles;
    }
    /**
     * Gets the view properties of the trigger and overlay, including whether they are clipped
     * or completely outside the view of any of the strategy's scrollables.
     */
    _getScrollVisibility() {
        // Note: needs fresh rects since the position could've changed.
        const originBounds = this._getOriginRect();
        const overlayBounds = this._pane.getBoundingClientRect();
        // TODO(jelbourn): instead of needing all of the client rects for these scrolling containers
        // every time, we should be able to use the scrollTop of the containers if the size of those
        // containers hasn't changed.
        const scrollContainerBounds = this._scrollables.map(scrollable => {
            return scrollable.getElementRef().nativeElement.getBoundingClientRect();
        });
        return {
            isOriginClipped: isElementClippedByScrolling(originBounds, scrollContainerBounds),
            isOriginOutsideView: isElementScrolledOutsideView(originBounds, scrollContainerBounds),
            isOverlayClipped: isElementClippedByScrolling(overlayBounds, scrollContainerBounds),
            isOverlayOutsideView: isElementScrolledOutsideView(overlayBounds, scrollContainerBounds),
        };
    }
    /** Subtracts the amount that an element is overflowing on an axis from its length. */
    _subtractOverflows(length, ...overflows) {
        return overflows.reduce((currentValue, currentOverflow) => {
            return currentValue - Math.max(currentOverflow, 0);
        }, length);
    }
    /** Narrows the given viewport rect by the current _viewportMargin. */
    _getNarrowedViewportRect() {
        // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
        // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
        // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
        // and `innerHeight` that do. This is necessary, because the overlay container uses
        // 100% `width` and `height` which don't include the scrollbar either.
        const width = this._document.documentElement.clientWidth;
        const height = this._document.documentElement.clientHeight;
        const scrollPosition = this._viewportRuler.getViewportScrollPosition();
        return {
            top: scrollPosition.top + this._viewportMargin,
            left: scrollPosition.left + this._viewportMargin,
            right: scrollPosition.left + width - this._viewportMargin,
            bottom: scrollPosition.top + height - this._viewportMargin,
            width: width - 2 * this._viewportMargin,
            height: height - 2 * this._viewportMargin,
        };
    }
    /** Whether the we're dealing with an RTL context */
    _isRtl() {
        return this._overlayRef.getDirection() === 'rtl';
    }
    /** Determines whether the overlay uses exact or flexible positioning. */
    _hasExactPosition() {
        return !this._hasFlexibleDimensions || this._isPushed;
    }
    /** Retrieves the offset of a position along the x or y axis. */
    _getOffset(position, axis) {
        if (axis === 'x') {
            // We don't do something like `position['offset' + axis]` in
            // order to avoid breaking minifiers that rename properties.
            return position.offsetX == null ? this._offsetX : position.offsetX;
        }
        return position.offsetY == null ? this._offsetY : position.offsetY;
    }
    /** Validates that the current position match the expected values. */
    _validatePositions() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._preferredPositions.length) {
                throw Error('FlexibleConnectedPositionStrategy: At least one position is required.');
            }
            // TODO(crisbeto): remove these once Angular's template type
            // checking is advanced enough to catch these cases.
            this._preferredPositions.forEach(pair => {
                validateHorizontalPosition('originX', pair.originX);
                validateVerticalPosition('originY', pair.originY);
                validateHorizontalPosition('overlayX', pair.overlayX);
                validateVerticalPosition('overlayY', pair.overlayY);
            });
        }
    }
    /** Adds a single CSS class or an array of classes on the overlay panel. */
    _addPanelClasses(cssClasses) {
        if (this._pane) {
            coerceArray(cssClasses).forEach(cssClass => {
                if (cssClass !== '' && this._appliedPanelClasses.indexOf(cssClass) === -1) {
                    this._appliedPanelClasses.push(cssClass);
                    this._pane.classList.add(cssClass);
                }
            });
        }
    }
    /** Clears the classes that the position strategy has applied from the overlay panel. */
    _clearPanelClasses() {
        if (this._pane) {
            this._appliedPanelClasses.forEach(cssClass => {
                this._pane.classList.remove(cssClass);
            });
            this._appliedPanelClasses = [];
        }
    }
    /** Returns the DOMRect of the current origin. */
    _getOriginRect() {
        const origin = this._origin;
        if (origin instanceof ElementRef) {
            return origin.nativeElement.getBoundingClientRect();
        }
        // Check for Element so SVG elements are also supported.
        if (origin instanceof Element) {
            return origin.getBoundingClientRect();
        }
        const width = origin.width || 0;
        const height = origin.height || 0;
        // If the origin is a point, return a client rect as if it was a 0x0 element at the point.
        return {
            top: origin.y,
            bottom: origin.y + height,
            left: origin.x,
            right: origin.x + width,
            height,
            width,
        };
    }
}
/** Shallow-extends a stylesheet object with another stylesheet object. */
function extendStyles(destination, source) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            destination[key] = source[key];
        }
    }
    return destination;
}
/**
 * Extracts the pixel value as a number from a value, if it's a number
 * or a CSS pixel string (e.g. `1337px`). Otherwise returns null.
 */
function getPixelValue(input) {
    if (typeof input !== 'number' && input != null) {
        const [value, units] = input.split(cssUnitPattern);
        return !units || units === 'px' ? parseFloat(value) : null;
    }
    return input || null;
}
/**
 * Gets a version of an element's bounding `DOMRect` where all the values are rounded down to
 * the nearest pixel. This allows us to account for the cases where there may be sub-pixel
 * deviations in the `DOMRect` returned by the browser (e.g. when zoomed in with a percentage
 * size, see #21350).
 */
function getRoundedBoundingClientRect(clientRect) {
    return {
        top: Math.floor(clientRect.top),
        right: Math.floor(clientRect.right),
        bottom: Math.floor(clientRect.bottom),
        left: Math.floor(clientRect.left),
        width: Math.floor(clientRect.width),
        height: Math.floor(clientRect.height),
    };
}
/** Returns whether two `ScrollingVisibility` objects are identical. */
function compareScrollVisibility(a, b) {
    if (a === b) {
        return true;
    }
    return (a.isOriginClipped === b.isOriginClipped &&
        a.isOriginOutsideView === b.isOriginOutsideView &&
        a.isOverlayClipped === b.isOverlayClipped &&
        a.isOverlayOutsideView === b.isOverlayOutsideView);
}
export const STANDARD_DROPDOWN_BELOW_POSITIONS = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];
export const STANDARD_DROPDOWN_ADJACENT_POSITIONS = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleGlibGUtY29ubmVjdGVkLXBvc2l0aW9uLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Bvc2l0aW9uL2ZsZXhpYmxlLWNvbm5lY3RlZC1wb3NpdGlvbi1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFDTCw4QkFBOEIsRUFHOUIsMEJBQTBCLEVBQzFCLHdCQUF3QixHQUN6QixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBYSxZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyw0QkFBNEIsRUFBRSwyQkFBMkIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4RixPQUFPLEVBQUMsbUJBQW1CLEVBQUUsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFLdkUscUZBQXFGO0FBQ3JGLDZGQUE2RjtBQUU3RixxREFBcUQ7QUFDckQsTUFBTSxnQkFBZ0IsR0FBRyw2Q0FBNkMsQ0FBQztBQUV2RSxxREFBcUQ7QUFDckQsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDO0FBY3ZDOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxpQ0FBaUM7SUEyRjVDLHlFQUF5RTtJQUN6RSxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztJQUNsQyxDQUFDO0lBRUQsWUFDRSxXQUFvRCxFQUM1QyxjQUE2QixFQUM3QixTQUFtQixFQUNuQixTQUFtQixFQUNuQixpQkFBbUM7UUFIbkMsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0IsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQ25CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUE5RjdD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QUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO0lBQ3JFLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQztDQUN0RSxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sb0NBQW9DLEdBQXdCO0lBQ3ZFLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztJQUNwRSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUM7SUFDMUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO0lBQ3BFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQztDQUMzRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UG9zaXRpb25TdHJhdGVneX0gZnJvbSAnLi9wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtWaWV3cG9ydFJ1bGVyLCBDZGtTY3JvbGxhYmxlLCBWaWV3cG9ydFNjcm9sbFBvc2l0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZSxcbiAgQ29ubmVjdGlvblBvc2l0aW9uUGFpcixcbiAgU2Nyb2xsaW5nVmlzaWJpbGl0eSxcbiAgdmFsaWRhdGVIb3Jpem9udGFsUG9zaXRpb24sXG4gIHZhbGlkYXRlVmVydGljYWxQb3NpdGlvbixcbn0gZnJvbSAnLi9jb25uZWN0ZWQtcG9zaXRpb24nO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJzY3JpcHRpb24sIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtpc0VsZW1lbnRTY3JvbGxlZE91dHNpZGVWaWV3LCBpc0VsZW1lbnRDbGlwcGVkQnlTY3JvbGxpbmd9IGZyb20gJy4vc2Nyb2xsLWNsaXAnO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlLCBjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge092ZXJsYXlDb250YWluZXJ9IGZyb20gJy4uL292ZXJsYXktY29udGFpbmVyJztcbmltcG9ydCB7T3ZlcmxheVJlZn0gZnJvbSAnLi4vb3ZlcmxheS1yZWYnO1xuXG4vLyBUT0RPOiByZWZhY3RvciBjbGlwcGluZyBkZXRlY3Rpb24gaW50byBhIHNlcGFyYXRlIHRoaW5nIChwYXJ0IG9mIHNjcm9sbGluZyBtb2R1bGUpXG4vLyBUT0RPOiBkb2Vzbid0IGhhbmRsZSBib3RoIGZsZXhpYmxlIHdpZHRoIGFuZCBoZWlnaHQgd2hlbiBpdCBoYXMgdG8gc2Nyb2xsIGFsb25nIGJvdGggYXhpcy5cblxuLyoqIENsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBvdmVybGF5IGJvdW5kaW5nIGJveC4gKi9cbmNvbnN0IGJvdW5kaW5nQm94Q2xhc3MgPSAnY2RrLW92ZXJsYXktY29ubmVjdGVkLXBvc2l0aW9uLWJvdW5kaW5nLWJveCc7XG5cbi8qKiBSZWdleCB1c2VkIHRvIHNwbGl0IGEgc3RyaW5nIG9uIGl0cyBDU1MgdW5pdHMuICovXG5jb25zdCBjc3NVbml0UGF0dGVybiA9IC8oW0EtWmEteiVdKykkLztcblxuLyoqIFBvc3NpYmxlIHZhbHVlcyB0aGF0IGNhbiBiZSBzZXQgYXMgdGhlIG9yaWdpbiBvZiBhIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneS4gKi9cbmV4cG9ydCB0eXBlIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneU9yaWdpbiA9XG4gIHwgRWxlbWVudFJlZlxuICB8IEVsZW1lbnRcbiAgfCAoUG9pbnQgJiB7XG4gICAgICB3aWR0aD86IG51bWJlcjtcbiAgICAgIGhlaWdodD86IG51bWJlcjtcbiAgICB9KTtcblxuLyoqIEVxdWl2YWxlbnQgb2YgYERPTVJlY3RgIHdpdGhvdXQgc29tZSBvZiB0aGUgcHJvcGVydGllcyB3ZSBkb24ndCBjYXJlIGFib3V0LiAqL1xudHlwZSBEaW1lbnNpb25zID0gT21pdDxET01SZWN0LCAneCcgfCAneScgfCAndG9KU09OJz47XG5cbi8qKlxuICogQSBzdHJhdGVneSBmb3IgcG9zaXRpb25pbmcgb3ZlcmxheXMuIFVzaW5nIHRoaXMgc3RyYXRlZ3ksIGFuIG92ZXJsYXkgaXMgZ2l2ZW4gYW5cbiAqIGltcGxpY2l0IHBvc2l0aW9uIHJlbGF0aXZlIHNvbWUgb3JpZ2luIGVsZW1lbnQuIFRoZSByZWxhdGl2ZSBwb3NpdGlvbiBpcyBkZWZpbmVkIGluIHRlcm1zIG9mXG4gKiBhIHBvaW50IG9uIHRoZSBvcmlnaW4gZWxlbWVudCB0aGF0IGlzIGNvbm5lY3RlZCB0byBhIHBvaW50IG9uIHRoZSBvdmVybGF5IGVsZW1lbnQuIEZvciBleGFtcGxlLFxuICogYSBiYXNpYyBkcm9wZG93biBpcyBjb25uZWN0aW5nIHRoZSBib3R0b20tbGVmdCBjb3JuZXIgb2YgdGhlIG9yaWdpbiB0byB0aGUgdG9wLWxlZnQgY29ybmVyXG4gKiBvZiB0aGUgb3ZlcmxheS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSBpbXBsZW1lbnRzIFBvc2l0aW9uU3RyYXRlZ3kge1xuICAvKiogVGhlIG92ZXJsYXkgdG8gd2hpY2ggdGhpcyBzdHJhdGVneSBpcyBhdHRhY2hlZC4gKi9cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZjtcblxuICAvKiogV2hldGhlciB3ZSdyZSBwZXJmb3JtaW5nIHRoZSB2ZXJ5IGZpcnN0IHBvc2l0aW9uaW5nIG9mIHRoZSBvdmVybGF5LiAqL1xuICBwcml2YXRlIF9pc0luaXRpYWxSZW5kZXI6IGJvb2xlYW47XG5cbiAgLyoqIExhc3Qgc2l6ZSB1c2VkIGZvciB0aGUgYm91bmRpbmcgYm94LiBVc2VkIHRvIGF2b2lkIHJlc2l6aW5nIHRoZSBvdmVybGF5IGFmdGVyIG9wZW4uICovXG4gIHByaXZhdGUgX2xhc3RCb3VuZGluZ0JveFNpemUgPSB7d2lkdGg6IDAsIGhlaWdodDogMH07XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG92ZXJsYXkgd2FzIHB1c2hlZCBpbiBhIHByZXZpb3VzIHBvc2l0aW9uaW5nLiAqL1xuICBwcml2YXRlIF9pc1B1c2hlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGNhbiBiZSBwdXNoZWQgb24tc2NyZWVuIG9uIHRoZSBpbml0aWFsIG9wZW4uICovXG4gIHByaXZhdGUgX2NhblB1c2ggPSB0cnVlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGNhbiBncm93IHZpYSBmbGV4aWJsZSB3aWR0aC9oZWlnaHQgYWZ0ZXIgdGhlIGluaXRpYWwgb3Blbi4gKi9cbiAgcHJpdmF0ZSBfZ3Jvd0FmdGVyT3BlbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5J3Mgd2lkdGggYW5kIGhlaWdodCBjYW4gYmUgY29uc3RyYWluZWQgdG8gZml0IHdpdGhpbiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2hhc0ZsZXhpYmxlRGltZW5zaW9ucyA9IHRydWU7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG92ZXJsYXkgcG9zaXRpb24gaXMgbG9ja2VkLiAqL1xuICBwcml2YXRlIF9wb3NpdGlvbkxvY2tlZCA9IGZhbHNlO1xuXG4gIC8qKiBDYWNoZWQgb3JpZ2luIGRpbWVuc2lvbnMgKi9cbiAgcHJpdmF0ZSBfb3JpZ2luUmVjdDogRGltZW5zaW9ucztcblxuICAvKiogQ2FjaGVkIG92ZXJsYXkgZGltZW5zaW9ucyAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVjdDogRGltZW5zaW9ucztcblxuICAvKiogQ2FjaGVkIHZpZXdwb3J0IGRpbWVuc2lvbnMgKi9cbiAgcHJpdmF0ZSBfdmlld3BvcnRSZWN0OiBEaW1lbnNpb25zO1xuXG4gIC8qKiBDYWNoZWQgY29udGFpbmVyIGRpbWVuc2lvbnMgKi9cbiAgcHJpdmF0ZSBfY29udGFpbmVyUmVjdDogRGltZW5zaW9ucztcblxuICAvKiogQW1vdW50IG9mIHNwYWNlIHRoYXQgbXVzdCBiZSBtYWludGFpbmVkIGJldHdlZW4gdGhlIG92ZXJsYXkgYW5kIHRoZSBlZGdlIG9mIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfdmlld3BvcnRNYXJnaW4gPSAwO1xuXG4gIC8qKiBUaGUgU2Nyb2xsYWJsZSBjb250YWluZXJzIHVzZWQgdG8gY2hlY2sgc2Nyb2xsYWJsZSB2aWV3IHByb3BlcnRpZXMgb24gcG9zaXRpb24gY2hhbmdlLiAqL1xuICBwcml2YXRlIF9zY3JvbGxhYmxlczogQ2RrU2Nyb2xsYWJsZVtdID0gW107XG5cbiAgLyoqIE9yZGVyZWQgbGlzdCBvZiBwcmVmZXJyZWQgcG9zaXRpb25zLCBmcm9tIG1vc3QgdG8gbGVhc3QgZGVzaXJhYmxlLiAqL1xuICBfcHJlZmVycmVkUG9zaXRpb25zOiBDb25uZWN0aW9uUG9zaXRpb25QYWlyW10gPSBbXTtcblxuICAvKiogVGhlIG9yaWdpbiBlbGVtZW50IGFnYWluc3Qgd2hpY2ggdGhlIG92ZXJsYXkgd2lsbCBiZSBwb3NpdGlvbmVkLiAqL1xuICBfb3JpZ2luOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lPcmlnaW47XG5cbiAgLyoqIFRoZSBvdmVybGF5IHBhbmUgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfcGFuZTogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHN0cmF0ZWd5IGhhcyBiZWVuIGRpc3Bvc2VkIG9mIGFscmVhZHkuICovXG4gIHByaXZhdGUgX2lzRGlzcG9zZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFBhcmVudCBlbGVtZW50IGZvciB0aGUgb3ZlcmxheSBwYW5lbCB1c2VkIHRvIGNvbnN0cmFpbiB0aGUgb3ZlcmxheSBwYW5lbCdzIHNpemUgdG8gZml0XG4gICAqIHdpdGhpbiB0aGUgdmlld3BvcnQuXG4gICAqL1xuICBwcml2YXRlIF9ib3VuZGluZ0JveDogSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbGFzdCBwb3NpdGlvbiB0byBoYXZlIGJlZW4gY2FsY3VsYXRlZCBhcyB0aGUgYmVzdCBmaXQgcG9zaXRpb24uICovXG4gIHByaXZhdGUgX2xhc3RQb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24gfCBudWxsO1xuXG4gIC8qKiBUaGUgbGFzdCBjYWxjdWxhdGVkIHNjcm9sbCB2aXNpYmlsaXR5LiBPbmx5IHRyYWNrZWQgICovXG4gIHByaXZhdGUgX2xhc3RTY3JvbGxWaXNpYmlsaXR5OiBTY3JvbGxpbmdWaXNpYmlsaXR5IHwgbnVsbDtcblxuICAvKiogU3ViamVjdCB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSBwb3NpdGlvbiBjaGFuZ2VzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9wb3NpdGlvbkNoYW5nZXMgPSBuZXcgU3ViamVjdDxDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25DaGFuZ2U+KCk7XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB2aWV3cG9ydCBzaXplIGNoYW5nZXMuICovXG4gIHByaXZhdGUgX3Jlc2l6ZVN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogRGVmYXVsdCBvZmZzZXQgZm9yIHRoZSBvdmVybGF5IGFsb25nIHRoZSB4IGF4aXMuICovXG4gIHByaXZhdGUgX29mZnNldFggPSAwO1xuXG4gIC8qKiBEZWZhdWx0IG9mZnNldCBmb3IgdGhlIG92ZXJsYXkgYWxvbmcgdGhlIHkgYXhpcy4gKi9cbiAgcHJpdmF0ZSBfb2Zmc2V0WSA9IDA7XG5cbiAgLyoqIFNlbGVjdG9yIHRvIGJlIHVzZWQgd2hlbiBmaW5kaW5nIHRoZSBlbGVtZW50cyBvbiB3aGljaCB0byBzZXQgdGhlIHRyYW5zZm9ybSBvcmlnaW4uICovXG4gIHByaXZhdGUgX3RyYW5zZm9ybU9yaWdpblNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBDU1MgY2xhc3NlcyB0aGF0IHRoZSBwb3NpdGlvbiBzdHJhdGVneSBoYXMgYXBwbGllZCBvbiB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cbiAgcHJpdmF0ZSBfYXBwbGllZFBhbmVsQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogQW1vdW50IGJ5IHdoaWNoIHRoZSBvdmVybGF5IHdhcyBwdXNoZWQgaW4gZWFjaCBheGlzIGR1cmluZyB0aGUgbGFzdCB0aW1lIGl0IHdhcyBwb3NpdGlvbmVkLiAqL1xuICBwcml2YXRlIF9wcmV2aW91c1B1c2hBbW91bnQ6IHt4OiBudW1iZXI7IHk6IG51bWJlcn0gfCBudWxsO1xuXG4gIC8qKiBPYnNlcnZhYmxlIHNlcXVlbmNlIG9mIHBvc2l0aW9uIGNoYW5nZXMuICovXG4gIHBvc2l0aW9uQ2hhbmdlczogT2JzZXJ2YWJsZTxDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25DaGFuZ2U+ID0gdGhpcy5fcG9zaXRpb25DaGFuZ2VzO1xuXG4gIC8qKiBPcmRlcmVkIGxpc3Qgb2YgcHJlZmVycmVkIHBvc2l0aW9ucywgZnJvbSBtb3N0IHRvIGxlYXN0IGRlc2lyYWJsZS4gKi9cbiAgZ2V0IHBvc2l0aW9ucygpOiBDb25uZWN0aW9uUG9zaXRpb25QYWlyW10ge1xuICAgIHJldHVybiB0aGlzLl9wcmVmZXJyZWRQb3NpdGlvbnM7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBjb25uZWN0ZWRUbzogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5T3JpZ2luLFxuICAgIHByaXZhdGUgX3ZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXG4gICAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBwcml2YXRlIF9vdmVybGF5Q29udGFpbmVyOiBPdmVybGF5Q29udGFpbmVyLFxuICApIHtcbiAgICB0aGlzLnNldE9yaWdpbihjb25uZWN0ZWRUbyk7XG4gIH1cblxuICAvKiogQXR0YWNoZXMgdGhpcyBwb3NpdGlvbiBzdHJhdGVneSB0byBhbiBvdmVybGF5LiAqL1xuICBhdHRhY2gob3ZlcmxheVJlZjogT3ZlcmxheVJlZik6IHZvaWQge1xuICAgIGlmIChcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgJiZcbiAgICAgIG92ZXJsYXlSZWYgIT09IHRoaXMuX292ZXJsYXlSZWYgJiZcbiAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBwb3NpdGlvbiBzdHJhdGVneSBpcyBhbHJlYWR5IGF0dGFjaGVkIHRvIGFuIG92ZXJsYXknKTtcbiAgICB9XG5cbiAgICB0aGlzLl92YWxpZGF0ZVBvc2l0aW9ucygpO1xuXG4gICAgb3ZlcmxheVJlZi5ob3N0RWxlbWVudC5jbGFzc0xpc3QuYWRkKGJvdW5kaW5nQm94Q2xhc3MpO1xuXG4gICAgdGhpcy5fb3ZlcmxheVJlZiA9IG92ZXJsYXlSZWY7XG4gICAgdGhpcy5fYm91bmRpbmdCb3ggPSBvdmVybGF5UmVmLmhvc3RFbGVtZW50O1xuICAgIHRoaXMuX3BhbmUgPSBvdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50O1xuICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0luaXRpYWxSZW5kZXIgPSB0cnVlO1xuICAgIHRoaXMuX2xhc3RQb3NpdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uID0gdGhpcy5fdmlld3BvcnRSdWxlci5jaGFuZ2UoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgd2luZG93IGlzIHJlc2l6ZWQsIHdlIHdhbnQgdG8gdHJpZ2dlciB0aGUgbmV4dCByZXBvc2l0aW9uIGFzIGlmIGl0XG4gICAgICAvLyB3YXMgYW4gaW5pdGlhbCByZW5kZXIsIGluIG9yZGVyIGZvciB0aGUgc3RyYXRlZ3kgdG8gcGljayBhIG5ldyBvcHRpbWFsIHBvc2l0aW9uLFxuICAgICAgLy8gb3RoZXJ3aXNlIHBvc2l0aW9uIGxvY2tpbmcgd2lsbCBjYXVzZSBpdCB0byBzdGF5IGF0IHRoZSBvbGQgb25lLlxuICAgICAgdGhpcy5faXNJbml0aWFsUmVuZGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuYXBwbHkoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3ZlcmxheSBlbGVtZW50LCB1c2luZyB3aGljaGV2ZXIgcHJlZmVycmVkIHBvc2l0aW9uIHJlbGF0aXZlXG4gICAqIHRvIHRoZSBvcmlnaW4gYmVzdCBmaXRzIG9uLXNjcmVlbi5cbiAgICpcbiAgICogVGhlIHNlbGVjdGlvbiBvZiBhIHBvc2l0aW9uIGdvZXMgYXMgZm9sbG93czpcbiAgICogIC0gSWYgYW55IHBvc2l0aW9ucyBmaXQgY29tcGxldGVseSB3aXRoaW4gdGhlIHZpZXdwb3J0IGFzLWlzLFxuICAgKiAgICAgIGNob29zZSB0aGUgZmlyc3QgcG9zaXRpb24gdGhhdCBkb2VzIHNvLlxuICAgKiAgLSBJZiBmbGV4aWJsZSBkaW1lbnNpb25zIGFyZSBlbmFibGVkIGFuZCBhdCBsZWFzdCBvbmUgc2F0aXNmaWVzIHRoZSBnaXZlbiBtaW5pbXVtIHdpZHRoL2hlaWdodCxcbiAgICogICAgICBjaG9vc2UgdGhlIHBvc2l0aW9uIHdpdGggdGhlIGdyZWF0ZXN0IGF2YWlsYWJsZSBzaXplIG1vZGlmaWVkIGJ5IHRoZSBwb3NpdGlvbnMnIHdlaWdodC5cbiAgICogIC0gSWYgcHVzaGluZyBpcyBlbmFibGVkLCB0YWtlIHRoZSBwb3NpdGlvbiB0aGF0IHdlbnQgb2ZmLXNjcmVlbiB0aGUgbGVhc3QgYW5kIHB1c2ggaXRcbiAgICogICAgICBvbi1zY3JlZW4uXG4gICAqICAtIElmIG5vbmUgb2YgdGhlIHByZXZpb3VzIGNyaXRlcmlhIHdlcmUgbWV0LCB1c2UgdGhlIHBvc2l0aW9uIHRoYXQgZ29lcyBvZmYtc2NyZWVuIHRoZSBsZWFzdC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHkoKTogdm9pZCB7XG4gICAgLy8gV2Ugc2hvdWxkbid0IGRvIGFueXRoaW5nIGlmIHRoZSBzdHJhdGVneSB3YXMgZGlzcG9zZWQgb3Igd2UncmUgb24gdGhlIHNlcnZlci5cbiAgICBpZiAodGhpcy5faXNEaXNwb3NlZCB8fCAhdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHBvc2l0aW9uIGhhcyBiZWVuIGFwcGxpZWQgYWxyZWFkeSAoZS5nLiB3aGVuIHRoZSBvdmVybGF5IHdhcyBvcGVuZWQpIGFuZCB0aGVcbiAgICAvLyBjb25zdW1lciBvcHRlZCBpbnRvIGxvY2tpbmcgaW4gdGhlIHBvc2l0aW9uLCByZS11c2UgdGhlIG9sZCBwb3NpdGlvbiwgaW4gb3JkZXIgdG9cbiAgICAvLyBwcmV2ZW50IHRoZSBvdmVybGF5IGZyb20ganVtcGluZyBhcm91bmQuXG4gICAgaWYgKCF0aGlzLl9pc0luaXRpYWxSZW5kZXIgJiYgdGhpcy5fcG9zaXRpb25Mb2NrZWQgJiYgdGhpcy5fbGFzdFBvc2l0aW9uKSB7XG4gICAgICB0aGlzLnJlYXBwbHlMYXN0UG9zaXRpb24oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhclBhbmVsQ2xhc3NlcygpO1xuICAgIHRoaXMuX3Jlc2V0T3ZlcmxheUVsZW1lbnRTdHlsZXMoKTtcbiAgICB0aGlzLl9yZXNldEJvdW5kaW5nQm94U3R5bGVzKCk7XG5cbiAgICAvLyBXZSBuZWVkIHRoZSBib3VuZGluZyByZWN0cyBmb3IgdGhlIG9yaWdpbiwgdGhlIG92ZXJsYXkgYW5kIHRoZSBjb250YWluZXIgdG8gZGV0ZXJtaW5lIGhvdyB0byBwb3NpdGlvblxuICAgIC8vIHRoZSBvdmVybGF5IHJlbGF0aXZlIHRvIHRoZSBvcmlnaW4uXG4gICAgLy8gV2UgdXNlIHRoZSB2aWV3cG9ydCByZWN0IHRvIGRldGVybWluZSB3aGV0aGVyIGEgcG9zaXRpb24gd291bGQgZ28gb2ZmLXNjcmVlbi5cbiAgICB0aGlzLl92aWV3cG9ydFJlY3QgPSB0aGlzLl9nZXROYXJyb3dlZFZpZXdwb3J0UmVjdCgpO1xuICAgIHRoaXMuX29yaWdpblJlY3QgPSB0aGlzLl9nZXRPcmlnaW5SZWN0KCk7XG4gICAgdGhpcy5fb3ZlcmxheVJlY3QgPSB0aGlzLl9wYW5lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHRoaXMuX2NvbnRhaW5lclJlY3QgPSB0aGlzLl9vdmVybGF5Q29udGFpbmVyLmdldENvbnRhaW5lckVsZW1lbnQoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGNvbnN0IG9yaWdpblJlY3QgPSB0aGlzLl9vcmlnaW5SZWN0O1xuICAgIGNvbnN0IG92ZXJsYXlSZWN0ID0gdGhpcy5fb3ZlcmxheVJlY3Q7XG4gICAgY29uc3Qgdmlld3BvcnRSZWN0ID0gdGhpcy5fdmlld3BvcnRSZWN0O1xuICAgIGNvbnN0IGNvbnRhaW5lclJlY3QgPSB0aGlzLl9jb250YWluZXJSZWN0O1xuXG4gICAgLy8gUG9zaXRpb25zIHdoZXJlIHRoZSBvdmVybGF5IHdpbGwgZml0IHdpdGggZmxleGlibGUgZGltZW5zaW9ucy5cbiAgICBjb25zdCBmbGV4aWJsZUZpdHM6IEZsZXhpYmxlRml0W10gPSBbXTtcblxuICAgIC8vIEZhbGxiYWNrIGlmIG5vbmUgb2YgdGhlIHByZWZlcnJlZCBwb3NpdGlvbnMgZml0IHdpdGhpbiB0aGUgdmlld3BvcnQuXG4gICAgbGV0IGZhbGxiYWNrOiBGYWxsYmFja1Bvc2l0aW9uIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gR28gdGhyb3VnaCBlYWNoIG9mIHRoZSBwcmVmZXJyZWQgcG9zaXRpb25zIGxvb2tpbmcgZm9yIGEgZ29vZCBmaXQuXG4gICAgLy8gSWYgYSBnb29kIGZpdCBpcyBmb3VuZCwgaXQgd2lsbCBiZSBhcHBsaWVkIGltbWVkaWF0ZWx5LlxuICAgIGZvciAobGV0IHBvcyBvZiB0aGlzLl9wcmVmZXJyZWRQb3NpdGlvbnMpIHtcbiAgICAgIC8vIEdldCB0aGUgZXhhY3QgKHgsIHkpIGNvb3JkaW5hdGUgZm9yIHRoZSBwb2ludC1vZi1vcmlnaW4gb24gdGhlIG9yaWdpbiBlbGVtZW50LlxuICAgICAgbGV0IG9yaWdpblBvaW50ID0gdGhpcy5fZ2V0T3JpZ2luUG9pbnQob3JpZ2luUmVjdCwgY29udGFpbmVyUmVjdCwgcG9zKTtcblxuICAgICAgLy8gRnJvbSB0aGF0IHBvaW50LW9mLW9yaWdpbiwgZ2V0IHRoZSBleGFjdCAoeCwgeSkgY29vcmRpbmF0ZSBmb3IgdGhlIHRvcC1sZWZ0IGNvcm5lciBvZiB0aGVcbiAgICAgIC8vIG92ZXJsYXkgaW4gdGhpcyBwb3NpdGlvbi4gV2UgdXNlIHRoZSB0b3AtbGVmdCBjb3JuZXIgZm9yIGNhbGN1bGF0aW9ucyBhbmQgbGF0ZXIgdHJhbnNsYXRlXG4gICAgICAvLyB0aGlzIGludG8gYW4gYXBwcm9wcmlhdGUgKHRvcCwgbGVmdCwgYm90dG9tLCByaWdodCkgc3R5bGUuXG4gICAgICBsZXQgb3ZlcmxheVBvaW50ID0gdGhpcy5fZ2V0T3ZlcmxheVBvaW50KG9yaWdpblBvaW50LCBvdmVybGF5UmVjdCwgcG9zKTtcblxuICAgICAgLy8gQ2FsY3VsYXRlIGhvdyB3ZWxsIHRoZSBvdmVybGF5IHdvdWxkIGZpdCBpbnRvIHRoZSB2aWV3cG9ydCB3aXRoIHRoaXMgcG9pbnQuXG4gICAgICBsZXQgb3ZlcmxheUZpdCA9IHRoaXMuX2dldE92ZXJsYXlGaXQob3ZlcmxheVBvaW50LCBvdmVybGF5UmVjdCwgdmlld3BvcnRSZWN0LCBwb3MpO1xuXG4gICAgICAvLyBJZiB0aGUgb3ZlcmxheSwgd2l0aG91dCBhbnkgZnVydGhlciB3b3JrLCBmaXRzIGludG8gdGhlIHZpZXdwb3J0LCB1c2UgdGhpcyBwb3NpdGlvbi5cbiAgICAgIGlmIChvdmVybGF5Rml0LmlzQ29tcGxldGVseVdpdGhpblZpZXdwb3J0KSB7XG4gICAgICAgIHRoaXMuX2lzUHVzaGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2FwcGx5UG9zaXRpb24ocG9zLCBvcmlnaW5Qb2ludCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIG92ZXJsYXkgaGFzIGZsZXhpYmxlIGRpbWVuc2lvbnMsIHdlIGNhbiB1c2UgdGhpcyBwb3NpdGlvblxuICAgICAgLy8gc28gbG9uZyBhcyB0aGVyZSdzIGVub3VnaCBzcGFjZSBmb3IgdGhlIG1pbmltdW0gZGltZW5zaW9ucy5cbiAgICAgIGlmICh0aGlzLl9jYW5GaXRXaXRoRmxleGlibGVEaW1lbnNpb25zKG92ZXJsYXlGaXQsIG92ZXJsYXlQb2ludCwgdmlld3BvcnRSZWN0KSkge1xuICAgICAgICAvLyBTYXZlIHBvc2l0aW9ucyB3aGVyZSB0aGUgb3ZlcmxheSB3aWxsIGZpdCB3aXRoIGZsZXhpYmxlIGRpbWVuc2lvbnMuIFdlIHdpbGwgdXNlIHRoZXNlXG4gICAgICAgIC8vIGlmIG5vbmUgb2YgdGhlIHBvc2l0aW9ucyBmaXQgKndpdGhvdXQqIGZsZXhpYmxlIGRpbWVuc2lvbnMuXG4gICAgICAgIGZsZXhpYmxlRml0cy5wdXNoKHtcbiAgICAgICAgICBwb3NpdGlvbjogcG9zLFxuICAgICAgICAgIG9yaWdpbjogb3JpZ2luUG9pbnQsXG4gICAgICAgICAgb3ZlcmxheVJlY3QsXG4gICAgICAgICAgYm91bmRpbmdCb3hSZWN0OiB0aGlzLl9jYWxjdWxhdGVCb3VuZGluZ0JveFJlY3Qob3JpZ2luUG9pbnQsIHBvcyksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgY3VycmVudCBwcmVmZXJyZWQgcG9zaXRpb24gZG9lcyBub3QgZml0IG9uIHRoZSBzY3JlZW4sIHJlbWVtYmVyIHRoZSBwb3NpdGlvblxuICAgICAgLy8gaWYgaXQgaGFzIG1vcmUgdmlzaWJsZSBhcmVhIG9uLXNjcmVlbiB0aGFuIHdlJ3ZlIHNlZW4gYW5kIG1vdmUgb250byB0aGUgbmV4dCBwcmVmZXJyZWRcbiAgICAgIC8vIHBvc2l0aW9uLlxuICAgICAgaWYgKCFmYWxsYmFjayB8fCBmYWxsYmFjay5vdmVybGF5Rml0LnZpc2libGVBcmVhIDwgb3ZlcmxheUZpdC52aXNpYmxlQXJlYSkge1xuICAgICAgICBmYWxsYmFjayA9IHtvdmVybGF5Rml0LCBvdmVybGF5UG9pbnQsIG9yaWdpblBvaW50LCBwb3NpdGlvbjogcG9zLCBvdmVybGF5UmVjdH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGFueSBwb3NpdGlvbnMgd2hlcmUgdGhlIG92ZXJsYXkgd291bGQgZml0IHdpdGggZmxleGlibGUgZGltZW5zaW9ucywgY2hvb3NlIHRoZVxuICAgIC8vIG9uZSB0aGF0IGhhcyB0aGUgZ3JlYXRlc3QgYXJlYSBhdmFpbGFibGUgbW9kaWZpZWQgYnkgdGhlIHBvc2l0aW9uJ3Mgd2VpZ2h0XG4gICAgaWYgKGZsZXhpYmxlRml0cy5sZW5ndGgpIHtcbiAgICAgIGxldCBiZXN0Rml0OiBGbGV4aWJsZUZpdCB8IG51bGwgPSBudWxsO1xuICAgICAgbGV0IGJlc3RTY29yZSA9IC0xO1xuICAgICAgZm9yIChjb25zdCBmaXQgb2YgZmxleGlibGVGaXRzKSB7XG4gICAgICAgIGNvbnN0IHNjb3JlID1cbiAgICAgICAgICBmaXQuYm91bmRpbmdCb3hSZWN0LndpZHRoICogZml0LmJvdW5kaW5nQm94UmVjdC5oZWlnaHQgKiAoZml0LnBvc2l0aW9uLndlaWdodCB8fCAxKTtcbiAgICAgICAgaWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgICAgYmVzdFNjb3JlID0gc2NvcmU7XG4gICAgICAgICAgYmVzdEZpdCA9IGZpdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9pc1B1c2hlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fYXBwbHlQb3NpdGlvbihiZXN0Rml0IS5wb3NpdGlvbiwgYmVzdEZpdCEub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBXaGVuIG5vbmUgb2YgdGhlIHByZWZlcnJlZCBwb3NpdGlvbnMgZml0IHdpdGhpbiB0aGUgdmlld3BvcnQsIHRha2UgdGhlIHBvc2l0aW9uXG4gICAgLy8gdGhhdCB3ZW50IG9mZi1zY3JlZW4gdGhlIGxlYXN0IGFuZCBhdHRlbXB0IHRvIHB1c2ggaXQgb24tc2NyZWVuLlxuICAgIGlmICh0aGlzLl9jYW5QdXNoKSB7XG4gICAgICAvLyBUT0RPKGplbGJvdXJuKTogYWZ0ZXIgcHVzaGluZywgdGhlIG9wZW5pbmcgXCJkaXJlY3Rpb25cIiBvZiB0aGUgb3ZlcmxheSBtaWdodCBub3QgbWFrZSBzZW5zZS5cbiAgICAgIHRoaXMuX2lzUHVzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2FwcGx5UG9zaXRpb24oZmFsbGJhY2shLnBvc2l0aW9uLCBmYWxsYmFjayEub3JpZ2luUG9pbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEFsbCBvcHRpb25zIGZvciBnZXR0aW5nIHRoZSBvdmVybGF5IHdpdGhpbiB0aGUgdmlld3BvcnQgaGF2ZSBiZWVuIGV4aGF1c3RlZCwgc28gZ28gd2l0aCB0aGVcbiAgICAvLyBwb3NpdGlvbiB0aGF0IHdlbnQgb2ZmLXNjcmVlbiB0aGUgbGVhc3QuXG4gICAgdGhpcy5fYXBwbHlQb3NpdGlvbihmYWxsYmFjayEucG9zaXRpb24sIGZhbGxiYWNrIS5vcmlnaW5Qb2ludCk7XG4gIH1cblxuICBkZXRhY2goKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJQYW5lbENsYXNzZXMoKTtcbiAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBudWxsO1xuICAgIHRoaXMuX3ByZXZpb3VzUHVzaEFtb3VudCA9IG51bGw7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKiogQ2xlYW51cCBhZnRlciB0aGUgZWxlbWVudCBnZXRzIGRlc3Ryb3llZC4gKi9cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdlIGNhbid0IHVzZSBgX3Jlc2V0Qm91bmRpbmdCb3hTdHlsZXNgIGhlcmUsIGJlY2F1c2UgaXQgcmVzZXRzXG4gICAgLy8gc29tZSBwcm9wZXJ0aWVzIHRvIHplcm8sIHJhdGhlciB0aGFuIHJlbW92aW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2JvdW5kaW5nQm94KSB7XG4gICAgICBleHRlbmRTdHlsZXModGhpcy5fYm91bmRpbmdCb3guc3R5bGUsIHtcbiAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgbGVmdDogJycsXG4gICAgICAgIHJpZ2h0OiAnJyxcbiAgICAgICAgYm90dG9tOiAnJyxcbiAgICAgICAgaGVpZ2h0OiAnJyxcbiAgICAgICAgd2lkdGg6ICcnLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnJyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICcnLFxuICAgICAgfSBhcyBDU1NTdHlsZURlY2xhcmF0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFuZSkge1xuICAgICAgdGhpcy5fcmVzZXRPdmVybGF5RWxlbWVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmhvc3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYm91bmRpbmdCb3hDbGFzcyk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXRhY2goKTtcbiAgICB0aGlzLl9wb3NpdGlvbkNoYW5nZXMuY29tcGxldGUoKTtcbiAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fYm91bmRpbmdCb3ggPSBudWxsITtcbiAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHJlLWFsaWducyB0aGUgb3ZlcmxheSBlbGVtZW50IHdpdGggdGhlIHRyaWdnZXIgaW4gaXRzIGxhc3QgY2FsY3VsYXRlZCBwb3NpdGlvbixcbiAgICogZXZlbiBpZiBhIHBvc2l0aW9uIGhpZ2hlciBpbiB0aGUgXCJwcmVmZXJyZWQgcG9zaXRpb25zXCIgbGlzdCB3b3VsZCBub3cgZml0LiBUaGlzXG4gICAqIGFsbG93cyBvbmUgdG8gcmUtYWxpZ24gdGhlIHBhbmVsIHdpdGhvdXQgY2hhbmdpbmcgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBwYW5lbC5cbiAgICovXG4gIHJlYXBwbHlMYXN0UG9zaXRpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzRGlzcG9zZWQgfHwgIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RQb3NpdGlvbiA9IHRoaXMuX2xhc3RQb3NpdGlvbjtcblxuICAgIGlmIChsYXN0UG9zaXRpb24pIHtcbiAgICAgIHRoaXMuX29yaWdpblJlY3QgPSB0aGlzLl9nZXRPcmlnaW5SZWN0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVjdCA9IHRoaXMuX3BhbmUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB0aGlzLl92aWV3cG9ydFJlY3QgPSB0aGlzLl9nZXROYXJyb3dlZFZpZXdwb3J0UmVjdCgpO1xuICAgICAgdGhpcy5fY29udGFpbmVyUmVjdCA9IHRoaXMuX292ZXJsYXlDb250YWluZXIuZ2V0Q29udGFpbmVyRWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBjb25zdCBvcmlnaW5Qb2ludCA9IHRoaXMuX2dldE9yaWdpblBvaW50KHRoaXMuX29yaWdpblJlY3QsIHRoaXMuX2NvbnRhaW5lclJlY3QsIGxhc3RQb3NpdGlvbik7XG4gICAgICB0aGlzLl9hcHBseVBvc2l0aW9uKGxhc3RQb3NpdGlvbiwgb3JpZ2luUG9pbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGx5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxpc3Qgb2YgU2Nyb2xsYWJsZSBjb250YWluZXJzIHRoYXQgaG9zdCB0aGUgb3JpZ2luIGVsZW1lbnQgc28gdGhhdFxuICAgKiBvbiByZXBvc2l0aW9uIHdlIGNhbiBldmFsdWF0ZSBpZiBpdCBvciB0aGUgb3ZlcmxheSBoYXMgYmVlbiBjbGlwcGVkIG9yIG91dHNpZGUgdmlldy4gRXZlcnlcbiAgICogU2Nyb2xsYWJsZSBtdXN0IGJlIGFuIGFuY2VzdG9yIGVsZW1lbnQgb2YgdGhlIHN0cmF0ZWd5J3Mgb3JpZ2luIGVsZW1lbnQuXG4gICAqL1xuICB3aXRoU2Nyb2xsYWJsZUNvbnRhaW5lcnMoc2Nyb2xsYWJsZXM6IENka1Njcm9sbGFibGVbXSk6IHRoaXMge1xuICAgIHRoaXMuX3Njcm9sbGFibGVzID0gc2Nyb2xsYWJsZXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBuZXcgcHJlZmVycmVkIHBvc2l0aW9ucy5cbiAgICogQHBhcmFtIHBvc2l0aW9ucyBMaXN0IG9mIHBvc2l0aW9ucyBvcHRpb25zIGZvciB0aGlzIG92ZXJsYXkuXG4gICAqL1xuICB3aXRoUG9zaXRpb25zKHBvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXSk6IHRoaXMge1xuICAgIHRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucyA9IHBvc2l0aW9ucztcblxuICAgIC8vIElmIHRoZSBsYXN0IGNhbGN1bGF0ZWQgcG9zaXRpb24gb2JqZWN0IGlzbid0IHBhcnQgb2YgdGhlIHBvc2l0aW9ucyBhbnltb3JlLCBjbGVhclxuICAgIC8vIGl0IGluIG9yZGVyIHRvIGF2b2lkIGl0IGJlaW5nIHBpY2tlZCB1cCBpZiB0aGUgY29uc3VtZXIgdHJpZXMgdG8gcmUtYXBwbHkuXG4gICAgaWYgKHBvc2l0aW9ucy5pbmRleE9mKHRoaXMuX2xhc3RQb3NpdGlvbiEpID09PSAtMSkge1xuICAgICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl92YWxpZGF0ZVBvc2l0aW9ucygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIG1pbmltdW0gZGlzdGFuY2UgdGhlIG92ZXJsYXkgbWF5IGJlIHBvc2l0aW9uZWQgdG8gdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0gbWFyZ2luIFJlcXVpcmVkIG1hcmdpbiBiZXR3ZWVuIHRoZSBvdmVybGF5IGFuZCB0aGUgdmlld3BvcnQgZWRnZSBpbiBwaXhlbHMuXG4gICAqL1xuICB3aXRoVmlld3BvcnRNYXJnaW4obWFyZ2luOiBudW1iZXIpOiB0aGlzIHtcbiAgICB0aGlzLl92aWV3cG9ydE1hcmdpbiA9IG1hcmdpbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBTZXRzIHdoZXRoZXIgdGhlIG92ZXJsYXkncyB3aWR0aCBhbmQgaGVpZ2h0IGNhbiBiZSBjb25zdHJhaW5lZCB0byBmaXQgd2l0aGluIHRoZSB2aWV3cG9ydC4gKi9cbiAgd2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmbGV4aWJsZURpbWVuc2lvbnMgPSB0cnVlKTogdGhpcyB7XG4gICAgdGhpcy5faGFzRmxleGlibGVEaW1lbnNpb25zID0gZmxleGlibGVEaW1lbnNpb25zO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIFNldHMgd2hldGhlciB0aGUgb3ZlcmxheSBjYW4gZ3JvdyBhZnRlciB0aGUgaW5pdGlhbCBvcGVuIHZpYSBmbGV4aWJsZSB3aWR0aC9oZWlnaHQuICovXG4gIHdpdGhHcm93QWZ0ZXJPcGVuKGdyb3dBZnRlck9wZW4gPSB0cnVlKTogdGhpcyB7XG4gICAgdGhpcy5fZ3Jvd0FmdGVyT3BlbiA9IGdyb3dBZnRlck9wZW47XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogU2V0cyB3aGV0aGVyIHRoZSBvdmVybGF5IGNhbiBiZSBwdXNoZWQgb24tc2NyZWVuIGlmIG5vbmUgb2YgdGhlIHByb3ZpZGVkIHBvc2l0aW9ucyBmaXQuICovXG4gIHdpdGhQdXNoKGNhblB1c2ggPSB0cnVlKTogdGhpcyB7XG4gICAgdGhpcy5fY2FuUHVzaCA9IGNhblB1c2g7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoZSBvdmVybGF5J3MgcG9zaXRpb24gc2hvdWxkIGJlIGxvY2tlZCBpbiBhZnRlciBpdCBpcyBwb3NpdGlvbmVkXG4gICAqIGluaXRpYWxseS4gV2hlbiBhbiBvdmVybGF5IGlzIGxvY2tlZCBpbiwgaXQgd29uJ3QgYXR0ZW1wdCB0byByZXBvc2l0aW9uIGl0c2VsZlxuICAgKiB3aGVuIHRoZSBwb3NpdGlvbiBpcyByZS1hcHBsaWVkIChlLmcuIHdoZW4gdGhlIHVzZXIgc2Nyb2xscyBhd2F5KS5cbiAgICogQHBhcmFtIGlzTG9ja2VkIFdoZXRoZXIgdGhlIG92ZXJsYXkgc2hvdWxkIGxvY2tlZCBpbi5cbiAgICovXG4gIHdpdGhMb2NrZWRQb3NpdGlvbihpc0xvY2tlZCA9IHRydWUpOiB0aGlzIHtcbiAgICB0aGlzLl9wb3NpdGlvbkxvY2tlZCA9IGlzTG9ja2VkO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG9yaWdpbiwgcmVsYXRpdmUgdG8gd2hpY2ggdG8gcG9zaXRpb24gdGhlIG92ZXJsYXkuXG4gICAqIFVzaW5nIGFuIGVsZW1lbnQgb3JpZ2luIGlzIHVzZWZ1bCBmb3IgYnVpbGRpbmcgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgcG9zaXRpb25lZFxuICAgKiByZWxhdGl2ZWx5IHRvIGEgdHJpZ2dlciAoZS5nLiBkcm9wZG93biBtZW51cyBvciB0b29sdGlwcyksIHdoZXJlYXMgdXNpbmcgYSBwb2ludCBjYW4gYmVcbiAgICogdXNlZCBmb3IgY2FzZXMgbGlrZSBjb250ZXh0dWFsIG1lbnVzIHdoaWNoIG9wZW4gcmVsYXRpdmUgdG8gdGhlIHVzZXIncyBwb2ludGVyLlxuICAgKiBAcGFyYW0gb3JpZ2luIFJlZmVyZW5jZSB0byB0aGUgbmV3IG9yaWdpbi5cbiAgICovXG4gIHNldE9yaWdpbihvcmlnaW46IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneU9yaWdpbik6IHRoaXMge1xuICAgIHRoaXMuX29yaWdpbiA9IG9yaWdpbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IG9mZnNldCBmb3IgdGhlIG92ZXJsYXkncyBjb25uZWN0aW9uIHBvaW50IG9uIHRoZSB4LWF4aXMuXG4gICAqIEBwYXJhbSBvZmZzZXQgTmV3IG9mZnNldCBpbiB0aGUgWCBheGlzLlxuICAgKi9cbiAgd2l0aERlZmF1bHRPZmZzZXRYKG9mZnNldDogbnVtYmVyKTogdGhpcyB7XG4gICAgdGhpcy5fb2Zmc2V0WCA9IG9mZnNldDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IG9mZnNldCBmb3IgdGhlIG92ZXJsYXkncyBjb25uZWN0aW9uIHBvaW50IG9uIHRoZSB5LWF4aXMuXG4gICAqIEBwYXJhbSBvZmZzZXQgTmV3IG9mZnNldCBpbiB0aGUgWSBheGlzLlxuICAgKi9cbiAgd2l0aERlZmF1bHRPZmZzZXRZKG9mZnNldDogbnVtYmVyKTogdGhpcyB7XG4gICAgdGhpcy5fb2Zmc2V0WSA9IG9mZnNldDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoYXQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IHNob3VsZCBzZXQgYSBgdHJhbnNmb3JtLW9yaWdpbmAgb24gc29tZSBlbGVtZW50c1xuICAgKiBpbnNpZGUgdGhlIG92ZXJsYXksIGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCBwb3NpdGlvbiB0aGF0IGlzIGJlaW5nIGFwcGxpZWQuIFRoaXMgaXNcbiAgICogdXNlZnVsIGZvciB0aGUgY2FzZXMgd2hlcmUgdGhlIG9yaWdpbiBvZiBhbiBhbmltYXRpb24gY2FuIGNoYW5nZSBkZXBlbmRpbmcgb24gdGhlXG4gICAqIGFsaWdubWVudCBvZiB0aGUgb3ZlcmxheS5cbiAgICogQHBhcmFtIHNlbGVjdG9yIENTUyBzZWxlY3RvciB0aGF0IHdpbGwgYmUgdXNlZCB0byBmaW5kIHRoZSB0YXJnZXRcbiAgICogICAgZWxlbWVudHMgb250byB3aGljaCB0byBzZXQgdGhlIHRyYW5zZm9ybSBvcmlnaW4uXG4gICAqL1xuICB3aXRoVHJhbnNmb3JtT3JpZ2luT24oc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMuX3RyYW5zZm9ybU9yaWdpblNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgKHgsIHkpIGNvb3JkaW5hdGUgb2YgYSBjb25uZWN0aW9uIHBvaW50IG9uIHRoZSBvcmlnaW4gYmFzZWQgb24gYSByZWxhdGl2ZSBwb3NpdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldE9yaWdpblBvaW50KFxuICAgIG9yaWdpblJlY3Q6IERpbWVuc2lvbnMsXG4gICAgY29udGFpbmVyUmVjdDogRGltZW5zaW9ucyxcbiAgICBwb3M6IENvbm5lY3RlZFBvc2l0aW9uLFxuICApOiBQb2ludCB7XG4gICAgbGV0IHg6IG51bWJlcjtcbiAgICBpZiAocG9zLm9yaWdpblggPT0gJ2NlbnRlcicpIHtcbiAgICAgIC8vIE5vdGU6IHdoZW4gY2VudGVyaW5nIHdlIHNob3VsZCBhbHdheXMgdXNlIHRoZSBgbGVmdGBcbiAgICAgIC8vIG9mZnNldCwgb3RoZXJ3aXNlIHRoZSBwb3NpdGlvbiB3aWxsIGJlIHdyb25nIGluIFJUTC5cbiAgICAgIHggPSBvcmlnaW5SZWN0LmxlZnQgKyBvcmlnaW5SZWN0LndpZHRoIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3RhcnRYID0gdGhpcy5faXNSdGwoKSA/IG9yaWdpblJlY3QucmlnaHQgOiBvcmlnaW5SZWN0LmxlZnQ7XG4gICAgICBjb25zdCBlbmRYID0gdGhpcy5faXNSdGwoKSA/IG9yaWdpblJlY3QubGVmdCA6IG9yaWdpblJlY3QucmlnaHQ7XG4gICAgICB4ID0gcG9zLm9yaWdpblggPT0gJ3N0YXJ0JyA/IHN0YXJ0WCA6IGVuZFg7XG4gICAgfVxuXG4gICAgLy8gV2hlbiB6b29taW5nIGluIFNhZmFyaSB0aGUgY29udGFpbmVyIHJlY3RhbmdsZSBjb250YWlucyBuZWdhdGl2ZSB2YWx1ZXMgZm9yIHRoZSBwb3NpdGlvblxuICAgIC8vIGFuZCB3ZSBuZWVkIHRvIHJlLWFkZCB0aGVtIHRvIHRoZSBjYWxjdWxhdGVkIGNvb3JkaW5hdGVzLlxuICAgIGlmIChjb250YWluZXJSZWN0LmxlZnQgPCAwKSB7XG4gICAgICB4IC09IGNvbnRhaW5lclJlY3QubGVmdDtcbiAgICB9XG5cbiAgICBsZXQgeTogbnVtYmVyO1xuICAgIGlmIChwb3Mub3JpZ2luWSA9PSAnY2VudGVyJykge1xuICAgICAgeSA9IG9yaWdpblJlY3QudG9wICsgb3JpZ2luUmVjdC5oZWlnaHQgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICB5ID0gcG9zLm9yaWdpblkgPT0gJ3RvcCcgPyBvcmlnaW5SZWN0LnRvcCA6IG9yaWdpblJlY3QuYm90dG9tO1xuICAgIH1cblxuICAgIC8vIE5vcm1hbGx5IHRoZSBjb250YWluZXJSZWN0J3MgdG9wIHZhbHVlIHdvdWxkIGJlIHplcm8sIGhvd2V2ZXIgd2hlbiB0aGUgb3ZlcmxheSBpcyBhdHRhY2hlZCB0byBhbiBpbnB1dFxuICAgIC8vIChlLmcuIGluIGFuIGF1dG9jb21wbGV0ZSksIG1vYmlsZSBicm93c2VycyB3aWxsIHNoaWZ0IGV2ZXJ5dGhpbmcgaW4gb3JkZXIgdG8gcHV0IHRoZSBpbnB1dCBpbiB0aGUgbWlkZGxlXG4gICAgLy8gb2YgdGhlIHNjcmVlbiBhbmQgdG8gbWFrZSBzcGFjZSBmb3IgdGhlIHZpcnR1YWwga2V5Ym9hcmQuIFdlIG5lZWQgdG8gYWNjb3VudCBmb3IgdGhpcyBvZmZzZXQsXG4gICAgLy8gb3RoZXJ3aXNlIG91ciBwb3NpdGlvbmluZyB3aWxsIGJlIHRocm93biBvZmYuXG4gICAgLy8gQWRkaXRpb25hbGx5LCB3aGVuIHpvb21pbmcgaW4gU2FmYXJpIHRoaXMgZml4ZXMgdGhlIHZlcnRpY2FsIHBvc2l0aW9uLlxuICAgIGlmIChjb250YWluZXJSZWN0LnRvcCA8IDApIHtcbiAgICAgIHkgLT0gY29udGFpbmVyUmVjdC50b3A7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt4LCB5fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSAoeCwgeSkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSBvdmVybGF5IGdpdmVuIGEgZ2l2ZW4gcG9zaXRpb24gYW5kXG4gICAqIG9yaWdpbiBwb2ludCB0byB3aGljaCB0aGUgb3ZlcmxheSBzaG91bGQgYmUgY29ubmVjdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvaW50KFxuICAgIG9yaWdpblBvaW50OiBQb2ludCxcbiAgICBvdmVybGF5UmVjdDogRGltZW5zaW9ucyxcbiAgICBwb3M6IENvbm5lY3RlZFBvc2l0aW9uLFxuICApOiBQb2ludCB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSAob3ZlcmxheVN0YXJ0WCwgb3ZlcmxheVN0YXJ0WSksIHRoZSBzdGFydCBvZiB0aGVcbiAgICAvLyBwb3RlbnRpYWwgb3ZlcmxheSBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgb3JpZ2luIHBvaW50LlxuICAgIGxldCBvdmVybGF5U3RhcnRYOiBudW1iZXI7XG4gICAgaWYgKHBvcy5vdmVybGF5WCA9PSAnY2VudGVyJykge1xuICAgICAgb3ZlcmxheVN0YXJ0WCA9IC1vdmVybGF5UmVjdC53aWR0aCAvIDI7XG4gICAgfSBlbHNlIGlmIChwb3Mub3ZlcmxheVggPT09ICdzdGFydCcpIHtcbiAgICAgIG92ZXJsYXlTdGFydFggPSB0aGlzLl9pc1J0bCgpID8gLW92ZXJsYXlSZWN0LndpZHRoIDogMDtcbiAgICB9IGVsc2Uge1xuICAgICAgb3ZlcmxheVN0YXJ0WCA9IHRoaXMuX2lzUnRsKCkgPyAwIDogLW92ZXJsYXlSZWN0LndpZHRoO1xuICAgIH1cblxuICAgIGxldCBvdmVybGF5U3RhcnRZOiBudW1iZXI7XG4gICAgaWYgKHBvcy5vdmVybGF5WSA9PSAnY2VudGVyJykge1xuICAgICAgb3ZlcmxheVN0YXJ0WSA9IC1vdmVybGF5UmVjdC5oZWlnaHQgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdmVybGF5U3RhcnRZID0gcG9zLm92ZXJsYXlZID09ICd0b3AnID8gMCA6IC1vdmVybGF5UmVjdC5oZWlnaHQ7XG4gICAgfVxuXG4gICAgLy8gVGhlICh4LCB5KSBjb29yZGluYXRlcyBvZiB0aGUgb3ZlcmxheS5cbiAgICByZXR1cm4ge1xuICAgICAgeDogb3JpZ2luUG9pbnQueCArIG92ZXJsYXlTdGFydFgsXG4gICAgICB5OiBvcmlnaW5Qb2ludC55ICsgb3ZlcmxheVN0YXJ0WSxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEdldHMgaG93IHdlbGwgYW4gb3ZlcmxheSBhdCB0aGUgZ2l2ZW4gcG9pbnQgd2lsbCBmaXQgd2l0aGluIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUZpdChcbiAgICBwb2ludDogUG9pbnQsXG4gICAgcmF3T3ZlcmxheVJlY3Q6IERpbWVuc2lvbnMsXG4gICAgdmlld3BvcnQ6IERpbWVuc2lvbnMsXG4gICAgcG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uLFxuICApOiBPdmVybGF5Rml0IHtcbiAgICAvLyBSb3VuZCB0aGUgb3ZlcmxheSByZWN0IHdoZW4gY29tcGFyaW5nIGFnYWluc3QgdGhlXG4gICAgLy8gdmlld3BvcnQsIGJlY2F1c2UgdGhlIHZpZXdwb3J0IGlzIGFsd2F5cyByb3VuZGVkLlxuICAgIGNvbnN0IG92ZXJsYXkgPSBnZXRSb3VuZGVkQm91bmRpbmdDbGllbnRSZWN0KHJhd092ZXJsYXlSZWN0KTtcbiAgICBsZXQge3gsIHl9ID0gcG9pbnQ7XG4gICAgbGV0IG9mZnNldFggPSB0aGlzLl9nZXRPZmZzZXQocG9zaXRpb24sICd4Jyk7XG4gICAgbGV0IG9mZnNldFkgPSB0aGlzLl9nZXRPZmZzZXQocG9zaXRpb24sICd5Jyk7XG5cbiAgICAvLyBBY2NvdW50IGZvciB0aGUgb2Zmc2V0cyBzaW5jZSB0aGV5IGNvdWxkIHB1c2ggdGhlIG92ZXJsYXkgb3V0IG9mIHRoZSB2aWV3cG9ydC5cbiAgICBpZiAob2Zmc2V0WCkge1xuICAgICAgeCArPSBvZmZzZXRYO1xuICAgIH1cblxuICAgIGlmIChvZmZzZXRZKSB7XG4gICAgICB5ICs9IG9mZnNldFk7XG4gICAgfVxuXG4gICAgLy8gSG93IG11Y2ggdGhlIG92ZXJsYXkgd291bGQgb3ZlcmZsb3cgYXQgdGhpcyBwb3NpdGlvbiwgb24gZWFjaCBzaWRlLlxuICAgIGxldCBsZWZ0T3ZlcmZsb3cgPSAwIC0geDtcbiAgICBsZXQgcmlnaHRPdmVyZmxvdyA9IHggKyBvdmVybGF5LndpZHRoIC0gdmlld3BvcnQud2lkdGg7XG4gICAgbGV0IHRvcE92ZXJmbG93ID0gMCAtIHk7XG4gICAgbGV0IGJvdHRvbU92ZXJmbG93ID0geSArIG92ZXJsYXkuaGVpZ2h0IC0gdmlld3BvcnQuaGVpZ2h0O1xuXG4gICAgLy8gVmlzaWJsZSBwYXJ0cyBvZiB0aGUgZWxlbWVudCBvbiBlYWNoIGF4aXMuXG4gICAgbGV0IHZpc2libGVXaWR0aCA9IHRoaXMuX3N1YnRyYWN0T3ZlcmZsb3dzKG92ZXJsYXkud2lkdGgsIGxlZnRPdmVyZmxvdywgcmlnaHRPdmVyZmxvdyk7XG4gICAgbGV0IHZpc2libGVIZWlnaHQgPSB0aGlzLl9zdWJ0cmFjdE92ZXJmbG93cyhvdmVybGF5LmhlaWdodCwgdG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KTtcbiAgICBsZXQgdmlzaWJsZUFyZWEgPSB2aXNpYmxlV2lkdGggKiB2aXNpYmxlSGVpZ2h0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZpc2libGVBcmVhLFxuICAgICAgaXNDb21wbGV0ZWx5V2l0aGluVmlld3BvcnQ6IG92ZXJsYXkud2lkdGggKiBvdmVybGF5LmhlaWdodCA9PT0gdmlzaWJsZUFyZWEsXG4gICAgICBmaXRzSW5WaWV3cG9ydFZlcnRpY2FsbHk6IHZpc2libGVIZWlnaHQgPT09IG92ZXJsYXkuaGVpZ2h0LFxuICAgICAgZml0c0luVmlld3BvcnRIb3Jpem9udGFsbHk6IHZpc2libGVXaWR0aCA9PSBvdmVybGF5LndpZHRoLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgb3ZlcmxheSBjYW4gZml0IHdpdGhpbiB0aGUgdmlld3BvcnQgd2hlbiBpdCBtYXkgcmVzaXplIGVpdGhlciBpdHMgd2lkdGggb3IgaGVpZ2h0LlxuICAgKiBAcGFyYW0gZml0IEhvdyB3ZWxsIHRoZSBvdmVybGF5IGZpdHMgaW4gdGhlIHZpZXdwb3J0IGF0IHNvbWUgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb2ludCBUaGUgKHgsIHkpIGNvb3JkaW5hdGVzIG9mIHRoZSBvdmVybGF5IGF0IHNvbWUgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB2aWV3cG9ydCBUaGUgZ2VvbWV0cnkgb2YgdGhlIHZpZXdwb3J0LlxuICAgKi9cbiAgcHJpdmF0ZSBfY2FuRml0V2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmaXQ6IE92ZXJsYXlGaXQsIHBvaW50OiBQb2ludCwgdmlld3BvcnQ6IERpbWVuc2lvbnMpIHtcbiAgICBpZiAodGhpcy5faGFzRmxleGlibGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zdCBhdmFpbGFibGVIZWlnaHQgPSB2aWV3cG9ydC5ib3R0b20gLSBwb2ludC55O1xuICAgICAgY29uc3QgYXZhaWxhYmxlV2lkdGggPSB2aWV3cG9ydC5yaWdodCAtIHBvaW50Lng7XG4gICAgICBjb25zdCBtaW5IZWlnaHQgPSBnZXRQaXhlbFZhbHVlKHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkubWluSGVpZ2h0KTtcbiAgICAgIGNvbnN0IG1pbldpZHRoID0gZ2V0UGl4ZWxWYWx1ZSh0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLm1pbldpZHRoKTtcblxuICAgICAgY29uc3QgdmVydGljYWxGaXQgPVxuICAgICAgICBmaXQuZml0c0luVmlld3BvcnRWZXJ0aWNhbGx5IHx8IChtaW5IZWlnaHQgIT0gbnVsbCAmJiBtaW5IZWlnaHQgPD0gYXZhaWxhYmxlSGVpZ2h0KTtcbiAgICAgIGNvbnN0IGhvcml6b250YWxGaXQgPVxuICAgICAgICBmaXQuZml0c0luVmlld3BvcnRIb3Jpem9udGFsbHkgfHwgKG1pbldpZHRoICE9IG51bGwgJiYgbWluV2lkdGggPD0gYXZhaWxhYmxlV2lkdGgpO1xuXG4gICAgICByZXR1cm4gdmVydGljYWxGaXQgJiYgaG9yaXpvbnRhbEZpdDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHBvaW50IGF0IHdoaWNoIHRoZSBvdmVybGF5IGNhbiBiZSBcInB1c2hlZFwiIG9uLXNjcmVlbi4gSWYgdGhlIG92ZXJsYXkgaXMgbGFyZ2VyIHRoYW5cbiAgICogdGhlIHZpZXdwb3J0LCB0aGUgdG9wLWxlZnQgY29ybmVyIHdpbGwgYmUgcHVzaGVkIG9uLXNjcmVlbiAod2l0aCBvdmVyZmxvdyBvY2N1cnJpbmcgb24gdGhlXG4gICAqIHJpZ2h0IGFuZCBib3R0b20pLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgU3RhcnRpbmcgcG9pbnQgZnJvbSB3aGljaCB0aGUgb3ZlcmxheSBpcyBwdXNoZWQuXG4gICAqIEBwYXJhbSByYXdPdmVybGF5UmVjdCBEaW1lbnNpb25zIG9mIHRoZSBvdmVybGF5LlxuICAgKiBAcGFyYW0gc2Nyb2xsUG9zaXRpb24gQ3VycmVudCB2aWV3cG9ydCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBwb2ludCBhdCB3aGljaCB0byBwb3NpdGlvbiB0aGUgb3ZlcmxheSBhZnRlciBwdXNoaW5nLiBUaGlzIGlzIGVmZmVjdGl2ZWx5IGEgbmV3XG4gICAqICAgICBvcmlnaW5Qb2ludC5cbiAgICovXG4gIHByaXZhdGUgX3B1c2hPdmVybGF5T25TY3JlZW4oXG4gICAgc3RhcnQ6IFBvaW50LFxuICAgIHJhd092ZXJsYXlSZWN0OiBEaW1lbnNpb25zLFxuICAgIHNjcm9sbFBvc2l0aW9uOiBWaWV3cG9ydFNjcm9sbFBvc2l0aW9uLFxuICApOiBQb2ludCB7XG4gICAgLy8gSWYgdGhlIHBvc2l0aW9uIGlzIGxvY2tlZCBhbmQgd2UndmUgcHVzaGVkIHRoZSBvdmVybGF5IGFscmVhZHksIHJldXNlIHRoZSBwcmV2aW91cyBwdXNoXG4gICAgLy8gYW1vdW50LCByYXRoZXIgdGhhbiBwdXNoaW5nIGl0IGFnYWluLiBJZiB3ZSB3ZXJlIHRvIGNvbnRpbnVlIHB1c2hpbmcsIHRoZSBlbGVtZW50IHdvdWxkXG4gICAgLy8gcmVtYWluIGluIHRoZSB2aWV3cG9ydCwgd2hpY2ggZ29lcyBhZ2FpbnN0IHRoZSBleHBlY3RhdGlvbnMgd2hlbiBwb3NpdGlvbiBsb2NraW5nIGlzIGVuYWJsZWQuXG4gICAgaWYgKHRoaXMuX3ByZXZpb3VzUHVzaEFtb3VudCAmJiB0aGlzLl9wb3NpdGlvbkxvY2tlZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogc3RhcnQueCArIHRoaXMuX3ByZXZpb3VzUHVzaEFtb3VudC54LFxuICAgICAgICB5OiBzdGFydC55ICsgdGhpcy5fcHJldmlvdXNQdXNoQW1vdW50LnksXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFJvdW5kIHRoZSBvdmVybGF5IHJlY3Qgd2hlbiBjb21wYXJpbmcgYWdhaW5zdCB0aGVcbiAgICAvLyB2aWV3cG9ydCwgYmVjYXVzZSB0aGUgdmlld3BvcnQgaXMgYWx3YXlzIHJvdW5kZWQuXG4gICAgY29uc3Qgb3ZlcmxheSA9IGdldFJvdW5kZWRCb3VuZGluZ0NsaWVudFJlY3QocmF3T3ZlcmxheVJlY3QpO1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnRSZWN0O1xuXG4gICAgLy8gRGV0ZXJtaW5lIGhvdyBtdWNoIHRoZSBvdmVybGF5IGdvZXMgb3V0c2lkZSB0aGUgdmlld3BvcnQgb24gZWFjaFxuICAgIC8vIHNpZGUsIHdoaWNoIHdlJ2xsIHVzZSB0byBkZWNpZGUgd2hpY2ggZGlyZWN0aW9uIHRvIHB1c2ggaXQuXG4gICAgY29uc3Qgb3ZlcmZsb3dSaWdodCA9IE1hdGgubWF4KHN0YXJ0LnggKyBvdmVybGF5LndpZHRoIC0gdmlld3BvcnQud2lkdGgsIDApO1xuICAgIGNvbnN0IG92ZXJmbG93Qm90dG9tID0gTWF0aC5tYXgoc3RhcnQueSArIG92ZXJsYXkuaGVpZ2h0IC0gdmlld3BvcnQuaGVpZ2h0LCAwKTtcbiAgICBjb25zdCBvdmVyZmxvd1RvcCA9IE1hdGgubWF4KHZpZXdwb3J0LnRvcCAtIHNjcm9sbFBvc2l0aW9uLnRvcCAtIHN0YXJ0LnksIDApO1xuICAgIGNvbnN0IG92ZXJmbG93TGVmdCA9IE1hdGgubWF4KHZpZXdwb3J0LmxlZnQgLSBzY3JvbGxQb3NpdGlvbi5sZWZ0IC0gc3RhcnQueCwgMCk7XG5cbiAgICAvLyBBbW91bnQgYnkgd2hpY2ggdG8gcHVzaCB0aGUgb3ZlcmxheSBpbiBlYWNoIGF4aXMgc3VjaCB0aGF0IGl0IHJlbWFpbnMgb24tc2NyZWVuLlxuICAgIGxldCBwdXNoWCA9IDA7XG4gICAgbGV0IHB1c2hZID0gMDtcblxuICAgIC8vIElmIHRoZSBvdmVybGF5IGZpdHMgY29tcGxldGVseSB3aXRoaW4gdGhlIGJvdW5kcyBvZiB0aGUgdmlld3BvcnQsIHB1c2ggaXQgZnJvbSB3aGljaGV2ZXJcbiAgICAvLyBkaXJlY3Rpb24gaXMgZ29lcyBvZmYtc2NyZWVuLiBPdGhlcndpc2UsIHB1c2ggdGhlIHRvcC1sZWZ0IGNvcm5lciBzdWNoIHRoYXQgaXRzIGluIHRoZVxuICAgIC8vIHZpZXdwb3J0IGFuZCBhbGxvdyBmb3IgdGhlIHRyYWlsaW5nIGVuZCBvZiB0aGUgb3ZlcmxheSB0byBnbyBvdXQgb2YgYm91bmRzLlxuICAgIGlmIChvdmVybGF5LndpZHRoIDw9IHZpZXdwb3J0LndpZHRoKSB7XG4gICAgICBwdXNoWCA9IG92ZXJmbG93TGVmdCB8fCAtb3ZlcmZsb3dSaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHVzaFggPSBzdGFydC54IDwgdGhpcy5fdmlld3BvcnRNYXJnaW4gPyB2aWV3cG9ydC5sZWZ0IC0gc2Nyb2xsUG9zaXRpb24ubGVmdCAtIHN0YXJ0LnggOiAwO1xuICAgIH1cblxuICAgIGlmIChvdmVybGF5LmhlaWdodCA8PSB2aWV3cG9ydC5oZWlnaHQpIHtcbiAgICAgIHB1c2hZID0gb3ZlcmZsb3dUb3AgfHwgLW92ZXJmbG93Qm90dG9tO1xuICAgIH0gZWxzZSB7XG4gICAgICBwdXNoWSA9IHN0YXJ0LnkgPCB0aGlzLl92aWV3cG9ydE1hcmdpbiA/IHZpZXdwb3J0LnRvcCAtIHNjcm9sbFBvc2l0aW9uLnRvcCAtIHN0YXJ0LnkgOiAwO1xuICAgIH1cblxuICAgIHRoaXMuX3ByZXZpb3VzUHVzaEFtb3VudCA9IHt4OiBwdXNoWCwgeTogcHVzaFl9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHN0YXJ0LnggKyBwdXNoWCxcbiAgICAgIHk6IHN0YXJ0LnkgKyBwdXNoWSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBjb21wdXRlZCBwb3NpdGlvbiB0byB0aGUgb3ZlcmxheSBhbmQgZW1pdHMgYSBwb3NpdGlvbiBjaGFuZ2UuXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgcG9zaXRpb24gcHJlZmVyZW5jZVxuICAgKiBAcGFyYW0gb3JpZ2luUG9pbnQgVGhlIHBvaW50IG9uIHRoZSBvcmlnaW4gZWxlbWVudCB3aGVyZSB0aGUgb3ZlcmxheSBpcyBjb25uZWN0ZWQuXG4gICAqL1xuICBwcml2YXRlIF9hcHBseVBvc2l0aW9uKHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbiwgb3JpZ2luUG9pbnQ6IFBvaW50KSB7XG4gICAgdGhpcy5fc2V0VHJhbnNmb3JtT3JpZ2luKHBvc2l0aW9uKTtcbiAgICB0aGlzLl9zZXRPdmVybGF5RWxlbWVudFN0eWxlcyhvcmlnaW5Qb2ludCwgcG9zaXRpb24pO1xuICAgIHRoaXMuX3NldEJvdW5kaW5nQm94U3R5bGVzKG9yaWdpblBvaW50LCBwb3NpdGlvbik7XG5cbiAgICBpZiAocG9zaXRpb24ucGFuZWxDbGFzcykge1xuICAgICAgdGhpcy5fYWRkUGFuZWxDbGFzc2VzKHBvc2l0aW9uLnBhbmVsQ2xhc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdGlmeSB0aGF0IHRoZSBwb3NpdGlvbiBoYXMgYmVlbiBjaGFuZ2VkIGFsb25nIHdpdGggaXRzIGNoYW5nZSBwcm9wZXJ0aWVzLlxuICAgIC8vIFdlIG9ubHkgZW1pdCBpZiB3ZSd2ZSBnb3QgYW55IHN1YnNjcmlwdGlvbnMsIGJlY2F1c2UgdGhlIHNjcm9sbCB2aXNpYmlsaXR5XG4gICAgLy8gY2FsY3VsYXRpb25zIGNhbiBiZSBzb21ld2hhdCBleHBlbnNpdmUuXG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uQ2hhbmdlcy5vYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBzY3JvbGxWaXNpYmlsaXR5ID0gdGhpcy5fZ2V0U2Nyb2xsVmlzaWJpbGl0eSgpO1xuXG4gICAgICAvLyBXZSdyZSByZWNhbGN1bGF0aW5nIG9uIHNjcm9sbCwgYnV0IHdlIG9ubHkgd2FudCB0byBlbWl0IGlmIGFueXRoaW5nXG4gICAgICAvLyBjaGFuZ2VkIHNpbmNlIGRvd25zdHJlYW0gY29kZSBtaWdodCBiZSBoaXR0aW5nIHRoZSBgTmdab25lYC5cbiAgICAgIGlmIChcbiAgICAgICAgcG9zaXRpb24gIT09IHRoaXMuX2xhc3RQb3NpdGlvbiB8fFxuICAgICAgICAhdGhpcy5fbGFzdFNjcm9sbFZpc2liaWxpdHkgfHxcbiAgICAgICAgIWNvbXBhcmVTY3JvbGxWaXNpYmlsaXR5KHRoaXMuX2xhc3RTY3JvbGxWaXNpYmlsaXR5LCBzY3JvbGxWaXNpYmlsaXR5KVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZUV2ZW50ID0gbmV3IENvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZShwb3NpdGlvbiwgc2Nyb2xsVmlzaWJpbGl0eSk7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uQ2hhbmdlcy5uZXh0KGNoYW5nZUV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbGFzdFNjcm9sbFZpc2liaWxpdHkgPSBzY3JvbGxWaXNpYmlsaXR5O1xuICAgIH1cblxuICAgIC8vIFNhdmUgdGhlIGxhc3QgY29ubmVjdGVkIHBvc2l0aW9uIGluIGNhc2UgdGhlIHBvc2l0aW9uIG5lZWRzIHRvIGJlIHJlLWNhbGN1bGF0ZWQuXG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5faXNJbml0aWFsUmVuZGVyID0gZmFsc2U7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgdHJhbnNmb3JtIG9yaWdpbiBiYXNlZCBvbiB0aGUgY29uZmlndXJlZCBzZWxlY3RvciBhbmQgdGhlIHBhc3NlZC1pbiBwb3NpdGlvbi4gICovXG4gIHByaXZhdGUgX3NldFRyYW5zZm9ybU9yaWdpbihwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24pIHtcbiAgICBpZiAoIXRoaXMuX3RyYW5zZm9ybU9yaWdpblNlbGVjdG9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gdGhpcy5fYm91bmRpbmdCb3ghLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICB0aGlzLl90cmFuc2Zvcm1PcmlnaW5TZWxlY3RvcixcbiAgICApO1xuICAgIGxldCB4T3JpZ2luOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2NlbnRlcic7XG4gICAgbGV0IHlPcmlnaW46ICd0b3AnIHwgJ2JvdHRvbScgfCAnY2VudGVyJyA9IHBvc2l0aW9uLm92ZXJsYXlZO1xuXG4gICAgaWYgKHBvc2l0aW9uLm92ZXJsYXlYID09PSAnY2VudGVyJykge1xuICAgICAgeE9yaWdpbiA9ICdjZW50ZXInO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNSdGwoKSkge1xuICAgICAgeE9yaWdpbiA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICB9IGVsc2Uge1xuICAgICAgeE9yaWdpbiA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBlbGVtZW50c1tpXS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBgJHt4T3JpZ2lufSAke3lPcmlnaW59YDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcG9zaXRpb24gYW5kIHNpemUgb2YgdGhlIG92ZXJsYXkncyBzaXppbmcgY29udGFpbmVyLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkb2VzIG5vIG1lYXN1cmluZyBhbmQgYXBwbGllcyBubyBzdHlsZXMgc28gdGhhdCB3ZSBjYW4gY2hlYXBseSBjb21wdXRlIHRoZVxuICAgKiBib3VuZHMgZm9yIGFsbCBwb3NpdGlvbnMgYW5kIGNob29zZSB0aGUgYmVzdCBmaXQgYmFzZWQgb24gdGhlc2UgcmVzdWx0cy5cbiAgICovXG4gIHByaXZhdGUgX2NhbGN1bGF0ZUJvdW5kaW5nQm94UmVjdChvcmlnaW46IFBvaW50LCBwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24pOiBCb3VuZGluZ0JveFJlY3Qge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnRSZWN0O1xuICAgIGNvbnN0IGlzUnRsID0gdGhpcy5faXNSdGwoKTtcbiAgICBsZXQgaGVpZ2h0OiBudW1iZXIsIHRvcDogbnVtYmVyLCBib3R0b206IG51bWJlcjtcblxuICAgIGlmIChwb3NpdGlvbi5vdmVybGF5WSA9PT0gJ3RvcCcpIHtcbiAgICAgIC8vIE92ZXJsYXkgaXMgb3BlbmluZyBcImRvd253YXJkXCIgYW5kIHRodXMgaXMgYm91bmQgYnkgdGhlIGJvdHRvbSB2aWV3cG9ydCBlZGdlLlxuICAgICAgdG9wID0gb3JpZ2luLnk7XG4gICAgICBoZWlnaHQgPSB2aWV3cG9ydC5oZWlnaHQgLSB0b3AgKyB0aGlzLl92aWV3cG9ydE1hcmdpbjtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uLm92ZXJsYXlZID09PSAnYm90dG9tJykge1xuICAgICAgLy8gT3ZlcmxheSBpcyBvcGVuaW5nIFwidXB3YXJkXCIgYW5kIHRodXMgaXMgYm91bmQgYnkgdGhlIHRvcCB2aWV3cG9ydCBlZGdlLiBXZSBuZWVkIHRvIGFkZFxuICAgICAgLy8gdGhlIHZpZXdwb3J0IG1hcmdpbiBiYWNrIGluLCBiZWNhdXNlIHRoZSB2aWV3cG9ydCByZWN0IGlzIG5hcnJvd2VkIGRvd24gdG8gcmVtb3ZlIHRoZVxuICAgICAgLy8gbWFyZ2luLCB3aGVyZWFzIHRoZSBgb3JpZ2luYCBwb3NpdGlvbiBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIGl0cyBgRE9NUmVjdGAuXG4gICAgICBib3R0b20gPSB2aWV3cG9ydC5oZWlnaHQgLSBvcmlnaW4ueSArIHRoaXMuX3ZpZXdwb3J0TWFyZ2luICogMjtcbiAgICAgIGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodCAtIGJvdHRvbSArIHRoaXMuX3ZpZXdwb3J0TWFyZ2luO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBuZWl0aGVyIHRvcCBub3IgYm90dG9tLCBpdCBtZWFucyB0aGF0IHRoZSBvdmVybGF5IGlzIHZlcnRpY2FsbHkgY2VudGVyZWQgb24gdGhlXG4gICAgICAvLyBvcmlnaW4gcG9pbnQuIE5vdGUgdGhhdCB3ZSB3YW50IHRoZSBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgdmlld3BvcnQsIHJhdGhlciB0aGFuXG4gICAgICAvLyB0aGUgcGFnZSwgd2hpY2ggaXMgd2h5IHdlIGRvbid0IHVzZSBzb21ldGhpbmcgbGlrZSBgdmlld3BvcnQuYm90dG9tIC0gb3JpZ2luLnlgIGFuZFxuICAgICAgLy8gYG9yaWdpbi55IC0gdmlld3BvcnQudG9wYC5cbiAgICAgIGNvbnN0IHNtYWxsZXN0RGlzdGFuY2VUb1ZpZXdwb3J0RWRnZSA9IE1hdGgubWluKFxuICAgICAgICB2aWV3cG9ydC5ib3R0b20gLSBvcmlnaW4ueSArIHZpZXdwb3J0LnRvcCxcbiAgICAgICAgb3JpZ2luLnksXG4gICAgICApO1xuXG4gICAgICBjb25zdCBwcmV2aW91c0hlaWdodCA9IHRoaXMuX2xhc3RCb3VuZGluZ0JveFNpemUuaGVpZ2h0O1xuXG4gICAgICBoZWlnaHQgPSBzbWFsbGVzdERpc3RhbmNlVG9WaWV3cG9ydEVkZ2UgKiAyO1xuICAgICAgdG9wID0gb3JpZ2luLnkgLSBzbWFsbGVzdERpc3RhbmNlVG9WaWV3cG9ydEVkZ2U7XG5cbiAgICAgIGlmIChoZWlnaHQgPiBwcmV2aW91c0hlaWdodCAmJiAhdGhpcy5faXNJbml0aWFsUmVuZGVyICYmICF0aGlzLl9ncm93QWZ0ZXJPcGVuKSB7XG4gICAgICAgIHRvcCA9IG9yaWdpbi55IC0gcHJldmlvdXNIZWlnaHQgLyAyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZSBvdmVybGF5IGlzIG9wZW5pbmcgJ3JpZ2h0LXdhcmQnICh0aGUgY29udGVudCBmbG93cyB0byB0aGUgcmlnaHQpLlxuICAgIGNvbnN0IGlzQm91bmRlZEJ5UmlnaHRWaWV3cG9ydEVkZ2UgPVxuICAgICAgKHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnICYmICFpc1J0bCkgfHwgKHBvc2l0aW9uLm92ZXJsYXlYID09PSAnZW5kJyAmJiBpc1J0bCk7XG5cbiAgICAvLyBUaGUgb3ZlcmxheSBpcyBvcGVuaW5nICdsZWZ0LXdhcmQnICh0aGUgY29udGVudCBmbG93cyB0byB0aGUgbGVmdCkuXG4gICAgY29uc3QgaXNCb3VuZGVkQnlMZWZ0Vmlld3BvcnRFZGdlID1cbiAgICAgIChwb3NpdGlvbi5vdmVybGF5WCA9PT0gJ2VuZCcgJiYgIWlzUnRsKSB8fCAocG9zaXRpb24ub3ZlcmxheVggPT09ICdzdGFydCcgJiYgaXNSdGwpO1xuXG4gICAgbGV0IHdpZHRoOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlcjtcblxuICAgIGlmIChpc0JvdW5kZWRCeUxlZnRWaWV3cG9ydEVkZ2UpIHtcbiAgICAgIHJpZ2h0ID0gdmlld3BvcnQud2lkdGggLSBvcmlnaW4ueCArIHRoaXMuX3ZpZXdwb3J0TWFyZ2luICogMjtcbiAgICAgIHdpZHRoID0gb3JpZ2luLnggLSB0aGlzLl92aWV3cG9ydE1hcmdpbjtcbiAgICB9IGVsc2UgaWYgKGlzQm91bmRlZEJ5UmlnaHRWaWV3cG9ydEVkZ2UpIHtcbiAgICAgIGxlZnQgPSBvcmlnaW4ueDtcbiAgICAgIHdpZHRoID0gdmlld3BvcnQucmlnaHQgLSBvcmlnaW4ueDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgbmVpdGhlciBzdGFydCBub3IgZW5kLCBpdCBtZWFucyB0aGF0IHRoZSBvdmVybGF5IGlzIGhvcml6b250YWxseSBjZW50ZXJlZCBvbiB0aGVcbiAgICAgIC8vIG9yaWdpbiBwb2ludC4gTm90ZSB0aGF0IHdlIHdhbnQgdGhlIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydCwgcmF0aGVyIHRoYW5cbiAgICAgIC8vIHRoZSBwYWdlLCB3aGljaCBpcyB3aHkgd2UgZG9uJ3QgdXNlIHNvbWV0aGluZyBsaWtlIGB2aWV3cG9ydC5yaWdodCAtIG9yaWdpbi54YCBhbmRcbiAgICAgIC8vIGBvcmlnaW4ueCAtIHZpZXdwb3J0LmxlZnRgLlxuICAgICAgY29uc3Qgc21hbGxlc3REaXN0YW5jZVRvVmlld3BvcnRFZGdlID0gTWF0aC5taW4oXG4gICAgICAgIHZpZXdwb3J0LnJpZ2h0IC0gb3JpZ2luLnggKyB2aWV3cG9ydC5sZWZ0LFxuICAgICAgICBvcmlnaW4ueCxcbiAgICAgICk7XG4gICAgICBjb25zdCBwcmV2aW91c1dpZHRoID0gdGhpcy5fbGFzdEJvdW5kaW5nQm94U2l6ZS53aWR0aDtcblxuICAgICAgd2lkdGggPSBzbWFsbGVzdERpc3RhbmNlVG9WaWV3cG9ydEVkZ2UgKiAyO1xuICAgICAgbGVmdCA9IG9yaWdpbi54IC0gc21hbGxlc3REaXN0YW5jZVRvVmlld3BvcnRFZGdlO1xuXG4gICAgICBpZiAod2lkdGggPiBwcmV2aW91c1dpZHRoICYmICF0aGlzLl9pc0luaXRpYWxSZW5kZXIgJiYgIXRoaXMuX2dyb3dBZnRlck9wZW4pIHtcbiAgICAgICAgbGVmdCA9IG9yaWdpbi54IC0gcHJldmlvdXNXaWR0aCAvIDI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHt0b3A6IHRvcCEsIGxlZnQ6IGxlZnQhLCBib3R0b206IGJvdHRvbSEsIHJpZ2h0OiByaWdodCEsIHdpZHRoLCBoZWlnaHR9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIGFuZCBzaXplIG9mIHRoZSBvdmVybGF5J3Mgc2l6aW5nIHdyYXBwZXIuIFRoZSB3cmFwcGVyIGlzIHBvc2l0aW9uZWQgb24gdGhlXG4gICAqIG9yaWdpbidzIGNvbm5lY3Rpb24gcG9pbnQgYW5kIHN0cmV0Y2hlcyB0byB0aGUgYm91bmRzIG9mIHRoZSB2aWV3cG9ydC5cbiAgICpcbiAgICogQHBhcmFtIG9yaWdpbiBUaGUgcG9pbnQgb24gdGhlIG9yaWdpbiBlbGVtZW50IHdoZXJlIHRoZSBvdmVybGF5IGlzIGNvbm5lY3RlZC5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBwb3NpdGlvbiBwcmVmZXJlbmNlXG4gICAqL1xuICBwcml2YXRlIF9zZXRCb3VuZGluZ0JveFN0eWxlcyhvcmlnaW46IFBvaW50LCBwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24pOiB2b2lkIHtcbiAgICBjb25zdCBib3VuZGluZ0JveFJlY3QgPSB0aGlzLl9jYWxjdWxhdGVCb3VuZGluZ0JveFJlY3Qob3JpZ2luLCBwb3NpdGlvbik7XG5cbiAgICAvLyBJdCdzIHdlaXJkIGlmIHRoZSBvdmVybGF5ICpncm93cyogd2hpbGUgc2Nyb2xsaW5nLCBzbyB3ZSB0YWtlIHRoZSBsYXN0IHNpemUgaW50byBhY2NvdW50XG4gICAgLy8gd2hlbiBhcHBseWluZyBhIG5ldyBzaXplLlxuICAgIGlmICghdGhpcy5faXNJbml0aWFsUmVuZGVyICYmICF0aGlzLl9ncm93QWZ0ZXJPcGVuKSB7XG4gICAgICBib3VuZGluZ0JveFJlY3QuaGVpZ2h0ID0gTWF0aC5taW4oYm91bmRpbmdCb3hSZWN0LmhlaWdodCwgdGhpcy5fbGFzdEJvdW5kaW5nQm94U2l6ZS5oZWlnaHQpO1xuICAgICAgYm91bmRpbmdCb3hSZWN0LndpZHRoID0gTWF0aC5taW4oYm91bmRpbmdCb3hSZWN0LndpZHRoLCB0aGlzLl9sYXN0Qm91bmRpbmdCb3hTaXplLndpZHRoKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZXMgPSB7fSBhcyBDU1NTdHlsZURlY2xhcmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuX2hhc0V4YWN0UG9zaXRpb24oKSkge1xuICAgICAgc3R5bGVzLnRvcCA9IHN0eWxlcy5sZWZ0ID0gJzAnO1xuICAgICAgc3R5bGVzLmJvdHRvbSA9IHN0eWxlcy5yaWdodCA9IHN0eWxlcy5tYXhIZWlnaHQgPSBzdHlsZXMubWF4V2lkdGggPSAnJztcbiAgICAgIHN0eWxlcy53aWR0aCA9IHN0eWxlcy5oZWlnaHQgPSAnMTAwJSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1heEhlaWdodCA9IHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkubWF4SGVpZ2h0O1xuICAgICAgY29uc3QgbWF4V2lkdGggPSB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLm1heFdpZHRoO1xuXG4gICAgICBzdHlsZXMuaGVpZ2h0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShib3VuZGluZ0JveFJlY3QuaGVpZ2h0KTtcbiAgICAgIHN0eWxlcy50b3AgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKGJvdW5kaW5nQm94UmVjdC50b3ApO1xuICAgICAgc3R5bGVzLmJvdHRvbSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoYm91bmRpbmdCb3hSZWN0LmJvdHRvbSk7XG4gICAgICBzdHlsZXMud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKGJvdW5kaW5nQm94UmVjdC53aWR0aCk7XG4gICAgICBzdHlsZXMubGVmdCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoYm91bmRpbmdCb3hSZWN0LmxlZnQpO1xuICAgICAgc3R5bGVzLnJpZ2h0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShib3VuZGluZ0JveFJlY3QucmlnaHQpO1xuXG4gICAgICAvLyBQdXNoIHRoZSBwYW5lIGNvbnRlbnQgdG93YXJkcyB0aGUgcHJvcGVyIGRpcmVjdGlvbi5cbiAgICAgIGlmIChwb3NpdGlvbi5vdmVybGF5WCA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgc3R5bGVzLmFsaWduSXRlbXMgPSAnY2VudGVyJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0eWxlcy5hbGlnbkl0ZW1zID0gcG9zaXRpb24ub3ZlcmxheVggPT09ICdlbmQnID8gJ2ZsZXgtZW5kJyA6ICdmbGV4LXN0YXJ0JztcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uLm92ZXJsYXlZID09PSAnY2VudGVyJykge1xuICAgICAgICBzdHlsZXMuanVzdGlmeUNvbnRlbnQgPSAnY2VudGVyJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0eWxlcy5qdXN0aWZ5Q29udGVudCA9IHBvc2l0aW9uLm92ZXJsYXlZID09PSAnYm90dG9tJyA/ICdmbGV4LWVuZCcgOiAnZmxleC1zdGFydCc7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXhIZWlnaHQpIHtcbiAgICAgICAgc3R5bGVzLm1heEhlaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUobWF4SGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1heFdpZHRoKSB7XG4gICAgICAgIHN0eWxlcy5tYXhXaWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUobWF4V2lkdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2xhc3RCb3VuZGluZ0JveFNpemUgPSBib3VuZGluZ0JveFJlY3Q7XG5cbiAgICBleHRlbmRTdHlsZXModGhpcy5fYm91bmRpbmdCb3ghLnN0eWxlLCBzdHlsZXMpO1xuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgc3R5bGVzIGZvciB0aGUgYm91bmRpbmcgYm94IHNvIHRoYXQgYSBuZXcgcG9zaXRpb25pbmcgY2FuIGJlIGNvbXB1dGVkLiAqL1xuICBwcml2YXRlIF9yZXNldEJvdW5kaW5nQm94U3R5bGVzKCkge1xuICAgIGV4dGVuZFN0eWxlcyh0aGlzLl9ib3VuZGluZ0JveCEuc3R5bGUsIHtcbiAgICAgIHRvcDogJzAnLFxuICAgICAgbGVmdDogJzAnLFxuICAgICAgcmlnaHQ6ICcwJyxcbiAgICAgIGJvdHRvbTogJzAnLFxuICAgICAgaGVpZ2h0OiAnJyxcbiAgICAgIHdpZHRoOiAnJyxcbiAgICAgIGFsaWduSXRlbXM6ICcnLFxuICAgICAganVzdGlmeUNvbnRlbnQ6ICcnLFxuICAgIH0gYXMgQ1NTU3R5bGVEZWNsYXJhdGlvbik7XG4gIH1cblxuICAvKiogUmVzZXRzIHRoZSBzdHlsZXMgZm9yIHRoZSBvdmVybGF5IHBhbmUgc28gdGhhdCBhIG5ldyBwb3NpdGlvbmluZyBjYW4gYmUgY29tcHV0ZWQuICovXG4gIHByaXZhdGUgX3Jlc2V0T3ZlcmxheUVsZW1lbnRTdHlsZXMoKSB7XG4gICAgZXh0ZW5kU3R5bGVzKHRoaXMuX3BhbmUuc3R5bGUsIHtcbiAgICAgIHRvcDogJycsXG4gICAgICBsZWZ0OiAnJyxcbiAgICAgIGJvdHRvbTogJycsXG4gICAgICByaWdodDogJycsXG4gICAgICBwb3NpdGlvbjogJycsXG4gICAgICB0cmFuc2Zvcm06ICcnLFxuICAgIH0gYXMgQ1NTU3R5bGVEZWNsYXJhdGlvbik7XG4gIH1cblxuICAvKiogU2V0cyBwb3NpdGlvbmluZyBzdHlsZXMgdG8gdGhlIG92ZXJsYXkgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfc2V0T3ZlcmxheUVsZW1lbnRTdHlsZXMob3JpZ2luUG9pbnQ6IFBvaW50LCBwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24pOiB2b2lkIHtcbiAgICBjb25zdCBzdHlsZXMgPSB7fSBhcyBDU1NTdHlsZURlY2xhcmF0aW9uO1xuICAgIGNvbnN0IGhhc0V4YWN0UG9zaXRpb24gPSB0aGlzLl9oYXNFeGFjdFBvc2l0aW9uKCk7XG4gICAgY29uc3QgaGFzRmxleGlibGVEaW1lbnNpb25zID0gdGhpcy5faGFzRmxleGlibGVEaW1lbnNpb25zO1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCk7XG5cbiAgICBpZiAoaGFzRXhhY3RQb3NpdGlvbikge1xuICAgICAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTtcbiAgICAgIGV4dGVuZFN0eWxlcyhzdHlsZXMsIHRoaXMuX2dldEV4YWN0T3ZlcmxheVkocG9zaXRpb24sIG9yaWdpblBvaW50LCBzY3JvbGxQb3NpdGlvbikpO1xuICAgICAgZXh0ZW5kU3R5bGVzKHN0eWxlcywgdGhpcy5fZ2V0RXhhY3RPdmVybGF5WChwb3NpdGlvbiwgb3JpZ2luUG9pbnQsIHNjcm9sbFBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlcy5wb3NpdGlvbiA9ICdzdGF0aWMnO1xuICAgIH1cblxuICAgIC8vIFVzZSBhIHRyYW5zZm9ybSB0byBhcHBseSB0aGUgb2Zmc2V0cy4gV2UgZG8gdGhpcyBiZWNhdXNlIHRoZSBgY2VudGVyYCBwb3NpdGlvbnMgcmVseSBvblxuICAgIC8vIGJlaW5nIGluIHRoZSBub3JtYWwgZmxleCBmbG93IGFuZCBzZXR0aW5nIGEgYHRvcGAgLyBgbGVmdGAgYXQgYWxsIHdpbGwgY29tcGxldGVseSB0aHJvd1xuICAgIC8vIG9mZiB0aGUgcG9zaXRpb24uIFdlIGFsc28gY2FuJ3QgdXNlIG1hcmdpbnMsIGJlY2F1c2UgdGhleSB3b24ndCBoYXZlIGFuIGVmZmVjdCBpbiBzb21lXG4gICAgLy8gY2FzZXMgd2hlcmUgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGFueXRoaW5nIHRvIFwicHVzaCBvZmYgb2ZcIi4gRmluYWxseSwgdGhpcyB3b3Jrc1xuICAgIC8vIGJldHRlciBib3RoIHdpdGggZmxleGlibGUgYW5kIG5vbi1mbGV4aWJsZSBwb3NpdGlvbmluZy5cbiAgICBsZXQgdHJhbnNmb3JtU3RyaW5nID0gJyc7XG4gICAgbGV0IG9mZnNldFggPSB0aGlzLl9nZXRPZmZzZXQocG9zaXRpb24sICd4Jyk7XG4gICAgbGV0IG9mZnNldFkgPSB0aGlzLl9nZXRPZmZzZXQocG9zaXRpb24sICd5Jyk7XG5cbiAgICBpZiAob2Zmc2V0WCkge1xuICAgICAgdHJhbnNmb3JtU3RyaW5nICs9IGB0cmFuc2xhdGVYKCR7b2Zmc2V0WH1weCkgYDtcbiAgICB9XG5cbiAgICBpZiAob2Zmc2V0WSkge1xuICAgICAgdHJhbnNmb3JtU3RyaW5nICs9IGB0cmFuc2xhdGVZKCR7b2Zmc2V0WX1weClgO1xuICAgIH1cblxuICAgIHN0eWxlcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1TdHJpbmcudHJpbSgpO1xuXG4gICAgLy8gSWYgYSBtYXhXaWR0aCBvciBtYXhIZWlnaHQgaXMgc3BlY2lmaWVkIG9uIHRoZSBvdmVybGF5LCB3ZSByZW1vdmUgdGhlbS4gV2UgZG8gdGhpcyBiZWNhdXNlXG4gICAgLy8gd2UgbmVlZCB0aGVzZSB2YWx1ZXMgdG8gYm90aCBiZSBzZXQgdG8gXCIxMDAlXCIgZm9yIHRoZSBhdXRvbWF0aWMgZmxleGlibGUgc2l6aW5nIHRvIHdvcmsuXG4gICAgLy8gVGhlIG1heEhlaWdodCBhbmQgbWF4V2lkdGggYXJlIHNldCBvbiB0aGUgYm91bmRpbmdCb3ggaW4gb3JkZXIgdG8gZW5mb3JjZSB0aGUgY29uc3RyYWludC5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBkb2Vzbid0IGFwcGx5IHdoZW4gd2UgaGF2ZSBhbiBleGFjdCBwb3NpdGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBkbyB3YW50IHRvXG4gICAgLy8gYXBwbHkgdGhlbSBiZWNhdXNlIHRoZXknbGwgYmUgY2xlYXJlZCBmcm9tIHRoZSBib3VuZGluZyBib3guXG4gICAgaWYgKGNvbmZpZy5tYXhIZWlnaHQpIHtcbiAgICAgIGlmIChoYXNFeGFjdFBvc2l0aW9uKSB7XG4gICAgICAgIHN0eWxlcy5tYXhIZWlnaHQgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKGNvbmZpZy5tYXhIZWlnaHQpO1xuICAgICAgfSBlbHNlIGlmIChoYXNGbGV4aWJsZURpbWVuc2lvbnMpIHtcbiAgICAgICAgc3R5bGVzLm1heEhlaWdodCA9ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb25maWcubWF4V2lkdGgpIHtcbiAgICAgIGlmIChoYXNFeGFjdFBvc2l0aW9uKSB7XG4gICAgICAgIHN0eWxlcy5tYXhXaWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoY29uZmlnLm1heFdpZHRoKTtcbiAgICAgIH0gZWxzZSBpZiAoaGFzRmxleGlibGVEaW1lbnNpb25zKSB7XG4gICAgICAgIHN0eWxlcy5tYXhXaWR0aCA9ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4dGVuZFN0eWxlcyh0aGlzLl9wYW5lLnN0eWxlLCBzdHlsZXMpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGV4YWN0IHRvcC9ib3R0b20gZm9yIHRoZSBvdmVybGF5IHdoZW4gbm90IHVzaW5nIGZsZXhpYmxlIHNpemluZyBvciB3aGVuIHB1c2hpbmcuICovXG4gIHByaXZhdGUgX2dldEV4YWN0T3ZlcmxheVkoXG4gICAgcG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uLFxuICAgIG9yaWdpblBvaW50OiBQb2ludCxcbiAgICBzY3JvbGxQb3NpdGlvbjogVmlld3BvcnRTY3JvbGxQb3NpdGlvbixcbiAgKSB7XG4gICAgLy8gUmVzZXQgYW55IGV4aXN0aW5nIHN0eWxlcy4gVGhpcyBpcyBuZWNlc3NhcnkgaW4gY2FzZSB0aGVcbiAgICAvLyBwcmVmZXJyZWQgcG9zaXRpb24gaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYGFwcGx5YC5cbiAgICBsZXQgc3R5bGVzID0ge3RvcDogJycsIGJvdHRvbTogJyd9IGFzIENTU1N0eWxlRGVjbGFyYXRpb247XG4gICAgbGV0IG92ZXJsYXlQb2ludCA9IHRoaXMuX2dldE92ZXJsYXlQb2ludChvcmlnaW5Qb2ludCwgdGhpcy5fb3ZlcmxheVJlY3QsIHBvc2l0aW9uKTtcblxuICAgIGlmICh0aGlzLl9pc1B1c2hlZCkge1xuICAgICAgb3ZlcmxheVBvaW50ID0gdGhpcy5fcHVzaE92ZXJsYXlPblNjcmVlbihvdmVybGF5UG9pbnQsIHRoaXMuX292ZXJsYXlSZWN0LCBzY3JvbGxQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2FudCB0byBzZXQgZWl0aGVyIGB0b3BgIG9yIGBib3R0b21gIGJhc2VkIG9uIHdoZXRoZXIgdGhlIG92ZXJsYXkgd2FudHMgdG8gYXBwZWFyXG4gICAgLy8gYWJvdmUgb3IgYmVsb3cgdGhlIG9yaWdpbiBhbmQgdGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0aGUgZWxlbWVudCB3aWxsIGV4cGFuZC5cbiAgICBpZiAocG9zaXRpb24ub3ZlcmxheVkgPT09ICdib3R0b20nKSB7XG4gICAgICAvLyBXaGVuIHVzaW5nIGBib3R0b21gLCB3ZSBhZGp1c3QgdGhlIHkgcG9zaXRpb24gc3VjaCB0aGF0IGl0IGlzIHRoZSBkaXN0YW5jZVxuICAgICAgLy8gZnJvbSB0aGUgYm90dG9tIG9mIHRoZSB2aWV3cG9ydCByYXRoZXIgdGhhbiB0aGUgdG9wLlxuICAgICAgY29uc3QgZG9jdW1lbnRIZWlnaHQgPSB0aGlzLl9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhLmNsaWVudEhlaWdodDtcbiAgICAgIHN0eWxlcy5ib3R0b20gPSBgJHtkb2N1bWVudEhlaWdodCAtIChvdmVybGF5UG9pbnQueSArIHRoaXMuX292ZXJsYXlSZWN0LmhlaWdodCl9cHhgO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZXMudG9wID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShvdmVybGF5UG9pbnQueSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBleGFjdCBsZWZ0L3JpZ2h0IGZvciB0aGUgb3ZlcmxheSB3aGVuIG5vdCB1c2luZyBmbGV4aWJsZSBzaXppbmcgb3Igd2hlbiBwdXNoaW5nLiAqL1xuICBwcml2YXRlIF9nZXRFeGFjdE92ZXJsYXlYKFxuICAgIHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbixcbiAgICBvcmlnaW5Qb2ludDogUG9pbnQsXG4gICAgc2Nyb2xsUG9zaXRpb246IFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24sXG4gICkge1xuICAgIC8vIFJlc2V0IGFueSBleGlzdGluZyBzdHlsZXMuIFRoaXMgaXMgbmVjZXNzYXJ5IGluIGNhc2UgdGhlIHByZWZlcnJlZCBwb3NpdGlvbiBoYXNcbiAgICAvLyBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IGBhcHBseWAuXG4gICAgbGV0IHN0eWxlcyA9IHtsZWZ0OiAnJywgcmlnaHQ6ICcnfSBhcyBDU1NTdHlsZURlY2xhcmF0aW9uO1xuICAgIGxldCBvdmVybGF5UG9pbnQgPSB0aGlzLl9nZXRPdmVybGF5UG9pbnQob3JpZ2luUG9pbnQsIHRoaXMuX292ZXJsYXlSZWN0LCBwb3NpdGlvbik7XG5cbiAgICBpZiAodGhpcy5faXNQdXNoZWQpIHtcbiAgICAgIG92ZXJsYXlQb2ludCA9IHRoaXMuX3B1c2hPdmVybGF5T25TY3JlZW4ob3ZlcmxheVBvaW50LCB0aGlzLl9vdmVybGF5UmVjdCwgc2Nyb2xsUG9zaXRpb24pO1xuICAgIH1cblxuICAgIC8vIFdlIHdhbnQgdG8gc2V0IGVpdGhlciBgbGVmdGAgb3IgYHJpZ2h0YCBiYXNlZCBvbiB3aGV0aGVyIHRoZSBvdmVybGF5IHdhbnRzIHRvIGFwcGVhciBcImJlZm9yZVwiXG4gICAgLy8gb3IgXCJhZnRlclwiIHRoZSBvcmlnaW4sIHdoaWNoIGRldGVybWluZXMgdGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0aGUgZWxlbWVudCB3aWxsIGV4cGFuZC5cbiAgICAvLyBGb3IgdGhlIGhvcml6b250YWwgYXhpcywgdGhlIG1lYW5pbmcgb2YgXCJiZWZvcmVcIiBhbmQgXCJhZnRlclwiIGNoYW5nZSBiYXNlZCBvbiB3aGV0aGVyIHRoZVxuICAgIC8vIHBhZ2UgaXMgaW4gUlRMIG9yIExUUi5cbiAgICBsZXQgaG9yaXpvbnRhbFN0eWxlUHJvcGVydHk6ICdsZWZ0JyB8ICdyaWdodCc7XG5cbiAgICBpZiAodGhpcy5faXNSdGwoKSkge1xuICAgICAgaG9yaXpvbnRhbFN0eWxlUHJvcGVydHkgPSBwb3NpdGlvbi5vdmVybGF5WCA9PT0gJ2VuZCcgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3Jpem9udGFsU3R5bGVQcm9wZXJ0eSA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnZW5kJyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgfVxuXG4gICAgLy8gV2hlbiB3ZSdyZSBzZXR0aW5nIGByaWdodGAsIHdlIGFkanVzdCB0aGUgeCBwb3NpdGlvbiBzdWNoIHRoYXQgaXQgaXMgdGhlIGRpc3RhbmNlXG4gICAgLy8gZnJvbSB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgdmlld3BvcnQgcmF0aGVyIHRoYW4gdGhlIGxlZnQgZWRnZS5cbiAgICBpZiAoaG9yaXpvbnRhbFN0eWxlUHJvcGVydHkgPT09ICdyaWdodCcpIHtcbiAgICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSB0aGlzLl9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhLmNsaWVudFdpZHRoO1xuICAgICAgc3R5bGVzLnJpZ2h0ID0gYCR7ZG9jdW1lbnRXaWR0aCAtIChvdmVybGF5UG9pbnQueCArIHRoaXMuX292ZXJsYXlSZWN0LndpZHRoKX1weGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlcy5sZWZ0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShvdmVybGF5UG9pbnQueCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB2aWV3IHByb3BlcnRpZXMgb2YgdGhlIHRyaWdnZXIgYW5kIG92ZXJsYXksIGluY2x1ZGluZyB3aGV0aGVyIHRoZXkgYXJlIGNsaXBwZWRcbiAgICogb3IgY29tcGxldGVseSBvdXRzaWRlIHRoZSB2aWV3IG9mIGFueSBvZiB0aGUgc3RyYXRlZ3kncyBzY3JvbGxhYmxlcy5cbiAgICovXG4gIHByaXZhdGUgX2dldFNjcm9sbFZpc2liaWxpdHkoKTogU2Nyb2xsaW5nVmlzaWJpbGl0eSB7XG4gICAgLy8gTm90ZTogbmVlZHMgZnJlc2ggcmVjdHMgc2luY2UgdGhlIHBvc2l0aW9uIGNvdWxkJ3ZlIGNoYW5nZWQuXG4gICAgY29uc3Qgb3JpZ2luQm91bmRzID0gdGhpcy5fZ2V0T3JpZ2luUmVjdCgpO1xuICAgIGNvbnN0IG92ZXJsYXlCb3VuZHMgPSB0aGlzLl9wYW5lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gVE9ETyhqZWxib3Vybik6IGluc3RlYWQgb2YgbmVlZGluZyBhbGwgb2YgdGhlIGNsaWVudCByZWN0cyBmb3IgdGhlc2Ugc2Nyb2xsaW5nIGNvbnRhaW5lcnNcbiAgICAvLyBldmVyeSB0aW1lLCB3ZSBzaG91bGQgYmUgYWJsZSB0byB1c2UgdGhlIHNjcm9sbFRvcCBvZiB0aGUgY29udGFpbmVycyBpZiB0aGUgc2l6ZSBvZiB0aG9zZVxuICAgIC8vIGNvbnRhaW5lcnMgaGFzbid0IGNoYW5nZWQuXG4gICAgY29uc3Qgc2Nyb2xsQ29udGFpbmVyQm91bmRzID0gdGhpcy5fc2Nyb2xsYWJsZXMubWFwKHNjcm9sbGFibGUgPT4ge1xuICAgICAgcmV0dXJuIHNjcm9sbGFibGUuZ2V0RWxlbWVudFJlZigpLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNPcmlnaW5DbGlwcGVkOiBpc0VsZW1lbnRDbGlwcGVkQnlTY3JvbGxpbmcob3JpZ2luQm91bmRzLCBzY3JvbGxDb250YWluZXJCb3VuZHMpLFxuICAgICAgaXNPcmlnaW5PdXRzaWRlVmlldzogaXNFbGVtZW50U2Nyb2xsZWRPdXRzaWRlVmlldyhvcmlnaW5Cb3VuZHMsIHNjcm9sbENvbnRhaW5lckJvdW5kcyksXG4gICAgICBpc092ZXJsYXlDbGlwcGVkOiBpc0VsZW1lbnRDbGlwcGVkQnlTY3JvbGxpbmcob3ZlcmxheUJvdW5kcywgc2Nyb2xsQ29udGFpbmVyQm91bmRzKSxcbiAgICAgIGlzT3ZlcmxheU91dHNpZGVWaWV3OiBpc0VsZW1lbnRTY3JvbGxlZE91dHNpZGVWaWV3KG92ZXJsYXlCb3VuZHMsIHNjcm9sbENvbnRhaW5lckJvdW5kcyksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBTdWJ0cmFjdHMgdGhlIGFtb3VudCB0aGF0IGFuIGVsZW1lbnQgaXMgb3ZlcmZsb3dpbmcgb24gYW4gYXhpcyBmcm9tIGl0cyBsZW5ndGguICovXG4gIHByaXZhdGUgX3N1YnRyYWN0T3ZlcmZsb3dzKGxlbmd0aDogbnVtYmVyLCAuLi5vdmVyZmxvd3M6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgICByZXR1cm4gb3ZlcmZsb3dzLnJlZHVjZSgoY3VycmVudFZhbHVlOiBudW1iZXIsIGN1cnJlbnRPdmVyZmxvdzogbnVtYmVyKSA9PiB7XG4gICAgICByZXR1cm4gY3VycmVudFZhbHVlIC0gTWF0aC5tYXgoY3VycmVudE92ZXJmbG93LCAwKTtcbiAgICB9LCBsZW5ndGgpO1xuICB9XG5cbiAgLyoqIE5hcnJvd3MgdGhlIGdpdmVuIHZpZXdwb3J0IHJlY3QgYnkgdGhlIGN1cnJlbnQgX3ZpZXdwb3J0TWFyZ2luLiAqL1xuICBwcml2YXRlIF9nZXROYXJyb3dlZFZpZXdwb3J0UmVjdCgpOiBEaW1lbnNpb25zIHtcbiAgICAvLyBXZSByZWNhbGN1bGF0ZSB0aGUgdmlld3BvcnQgcmVjdCBoZXJlIG91cnNlbHZlcywgcmF0aGVyIHRoYW4gdXNpbmcgdGhlIFZpZXdwb3J0UnVsZXIsXG4gICAgLy8gYmVjYXVzZSB3ZSB3YW50IHRvIHVzZSB0aGUgYGNsaWVudFdpZHRoYCBhbmQgYGNsaWVudEhlaWdodGAgYXMgdGhlIGJhc2UuIFRoZSBkaWZmZXJlbmNlXG4gICAgLy8gYmVpbmcgdGhhdCB0aGUgY2xpZW50IHByb3BlcnRpZXMgZG9uJ3QgaW5jbHVkZSB0aGUgc2Nyb2xsYmFyLCBhcyBvcHBvc2VkIHRvIGBpbm5lcldpZHRoYFxuICAgIC8vIGFuZCBgaW5uZXJIZWlnaHRgIHRoYXQgZG8uIFRoaXMgaXMgbmVjZXNzYXJ5LCBiZWNhdXNlIHRoZSBvdmVybGF5IGNvbnRhaW5lciB1c2VzXG4gICAgLy8gMTAwJSBgd2lkdGhgIGFuZCBgaGVpZ2h0YCB3aGljaCBkb24ndCBpbmNsdWRlIHRoZSBzY3JvbGxiYXIgZWl0aGVyLlxuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5fZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IS5jbGllbnRXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLl9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhLmNsaWVudEhlaWdodDtcbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHRoaXMuX3ZpZXdwb3J0UnVsZXIuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogc2Nyb2xsUG9zaXRpb24udG9wICsgdGhpcy5fdmlld3BvcnRNYXJnaW4sXG4gICAgICBsZWZ0OiBzY3JvbGxQb3NpdGlvbi5sZWZ0ICsgdGhpcy5fdmlld3BvcnRNYXJnaW4sXG4gICAgICByaWdodDogc2Nyb2xsUG9zaXRpb24ubGVmdCArIHdpZHRoIC0gdGhpcy5fdmlld3BvcnRNYXJnaW4sXG4gICAgICBib3R0b206IHNjcm9sbFBvc2l0aW9uLnRvcCArIGhlaWdodCAtIHRoaXMuX3ZpZXdwb3J0TWFyZ2luLFxuICAgICAgd2lkdGg6IHdpZHRoIC0gMiAqIHRoaXMuX3ZpZXdwb3J0TWFyZ2luLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgLSAyICogdGhpcy5fdmlld3BvcnRNYXJnaW4sXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB3ZSdyZSBkZWFsaW5nIHdpdGggYW4gUlRMIGNvbnRleHQgKi9cbiAgcHJpdmF0ZSBfaXNSdGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYuZ2V0RGlyZWN0aW9uKCkgPT09ICdydGwnO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgd2hldGhlciB0aGUgb3ZlcmxheSB1c2VzIGV4YWN0IG9yIGZsZXhpYmxlIHBvc2l0aW9uaW5nLiAqL1xuICBwcml2YXRlIF9oYXNFeGFjdFBvc2l0aW9uKCkge1xuICAgIHJldHVybiAhdGhpcy5faGFzRmxleGlibGVEaW1lbnNpb25zIHx8IHRoaXMuX2lzUHVzaGVkO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlcyB0aGUgb2Zmc2V0IG9mIGEgcG9zaXRpb24gYWxvbmcgdGhlIHggb3IgeSBheGlzLiAqL1xuICBwcml2YXRlIF9nZXRPZmZzZXQocG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uLCBheGlzOiAneCcgfCAneScpIHtcbiAgICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgICAvLyBXZSBkb24ndCBkbyBzb21ldGhpbmcgbGlrZSBgcG9zaXRpb25bJ29mZnNldCcgKyBheGlzXWAgaW5cbiAgICAgIC8vIG9yZGVyIHRvIGF2b2lkIGJyZWFraW5nIG1pbmlmaWVycyB0aGF0IHJlbmFtZSBwcm9wZXJ0aWVzLlxuICAgICAgcmV0dXJuIHBvc2l0aW9uLm9mZnNldFggPT0gbnVsbCA/IHRoaXMuX29mZnNldFggOiBwb3NpdGlvbi5vZmZzZXRYO1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbi5vZmZzZXRZID09IG51bGwgPyB0aGlzLl9vZmZzZXRZIDogcG9zaXRpb24ub2Zmc2V0WTtcbiAgfVxuXG4gIC8qKiBWYWxpZGF0ZXMgdGhhdCB0aGUgY3VycmVudCBwb3NpdGlvbiBtYXRjaCB0aGUgZXhwZWN0ZWQgdmFsdWVzLiAqL1xuICBwcml2YXRlIF92YWxpZGF0ZVBvc2l0aW9ucygpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0ZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneTogQXQgbGVhc3Qgb25lIHBvc2l0aW9uIGlzIHJlcXVpcmVkLicpO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIHRoZXNlIG9uY2UgQW5ndWxhcidzIHRlbXBsYXRlIHR5cGVcbiAgICAgIC8vIGNoZWNraW5nIGlzIGFkdmFuY2VkIGVub3VnaCB0byBjYXRjaCB0aGVzZSBjYXNlcy5cbiAgICAgIHRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucy5mb3JFYWNoKHBhaXIgPT4ge1xuICAgICAgICB2YWxpZGF0ZUhvcml6b250YWxQb3NpdGlvbignb3JpZ2luWCcsIHBhaXIub3JpZ2luWCk7XG4gICAgICAgIHZhbGlkYXRlVmVydGljYWxQb3NpdGlvbignb3JpZ2luWScsIHBhaXIub3JpZ2luWSk7XG4gICAgICAgIHZhbGlkYXRlSG9yaXpvbnRhbFBvc2l0aW9uKCdvdmVybGF5WCcsIHBhaXIub3ZlcmxheVgpO1xuICAgICAgICB2YWxpZGF0ZVZlcnRpY2FsUG9zaXRpb24oJ292ZXJsYXlZJywgcGFpci5vdmVybGF5WSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkcyBhIHNpbmdsZSBDU1MgY2xhc3Mgb3IgYW4gYXJyYXkgb2YgY2xhc3NlcyBvbiB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cbiAgcHJpdmF0ZSBfYWRkUGFuZWxDbGFzc2VzKGNzc0NsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gICAgaWYgKHRoaXMuX3BhbmUpIHtcbiAgICAgIGNvZXJjZUFycmF5KGNzc0NsYXNzZXMpLmZvckVhY2goY3NzQ2xhc3MgPT4ge1xuICAgICAgICBpZiAoY3NzQ2xhc3MgIT09ICcnICYmIHRoaXMuX2FwcGxpZWRQYW5lbENsYXNzZXMuaW5kZXhPZihjc3NDbGFzcykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZFBhbmVsQ2xhc3Nlcy5wdXNoKGNzc0NsYXNzKTtcbiAgICAgICAgICB0aGlzLl9wYW5lLmNsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xlYXJzIHRoZSBjbGFzc2VzIHRoYXQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGhhcyBhcHBsaWVkIGZyb20gdGhlIG92ZXJsYXkgcGFuZWwuICovXG4gIHByaXZhdGUgX2NsZWFyUGFuZWxDbGFzc2VzKCkge1xuICAgIGlmICh0aGlzLl9wYW5lKSB7XG4gICAgICB0aGlzLl9hcHBsaWVkUGFuZWxDbGFzc2VzLmZvckVhY2goY3NzQ2xhc3MgPT4ge1xuICAgICAgICB0aGlzLl9wYW5lLmNsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9hcHBsaWVkUGFuZWxDbGFzc2VzID0gW107XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIERPTVJlY3Qgb2YgdGhlIGN1cnJlbnQgb3JpZ2luLiAqL1xuICBwcml2YXRlIF9nZXRPcmlnaW5SZWN0KCk6IERpbWVuc2lvbnMge1xuICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMuX29yaWdpbjtcblxuICAgIGlmIChvcmlnaW4gaW5zdGFuY2VvZiBFbGVtZW50UmVmKSB7XG4gICAgICByZXR1cm4gb3JpZ2luLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIEVsZW1lbnQgc28gU1ZHIGVsZW1lbnRzIGFyZSBhbHNvIHN1cHBvcnRlZC5cbiAgICBpZiAob3JpZ2luIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgcmV0dXJuIG9yaWdpbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9XG5cbiAgICBjb25zdCB3aWR0aCA9IG9yaWdpbi53aWR0aCB8fCAwO1xuICAgIGNvbnN0IGhlaWdodCA9IG9yaWdpbi5oZWlnaHQgfHwgMDtcblxuICAgIC8vIElmIHRoZSBvcmlnaW4gaXMgYSBwb2ludCwgcmV0dXJuIGEgY2xpZW50IHJlY3QgYXMgaWYgaXQgd2FzIGEgMHgwIGVsZW1lbnQgYXQgdGhlIHBvaW50LlxuICAgIHJldHVybiB7XG4gICAgICB0b3A6IG9yaWdpbi55LFxuICAgICAgYm90dG9tOiBvcmlnaW4ueSArIGhlaWdodCxcbiAgICAgIGxlZnQ6IG9yaWdpbi54LFxuICAgICAgcmlnaHQ6IG9yaWdpbi54ICsgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB3aWR0aCxcbiAgICB9O1xuICB9XG59XG5cbi8qKiBBIHNpbXBsZSAoeCwgeSkgY29vcmRpbmF0ZS4gKi9cbmludGVyZmFjZSBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG4vKiogUmVjb3JkIG9mIG1lYXN1cmVtZW50cyBmb3IgaG93IGFuIG92ZXJsYXkgKGF0IGEgZ2l2ZW4gcG9zaXRpb24pIGZpdHMgaW50byB0aGUgdmlld3BvcnQuICovXG5pbnRlcmZhY2UgT3ZlcmxheUZpdCB7XG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGZpdHMgY29tcGxldGVseSBpbiB0aGUgdmlld3BvcnQuICovXG4gIGlzQ29tcGxldGVseVdpdGhpblZpZXdwb3J0OiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGZpdHMgaW4gdGhlIHZpZXdwb3J0IG9uIHRoZSB5LWF4aXMuICovXG4gIGZpdHNJblZpZXdwb3J0VmVydGljYWxseTogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0aGUgb3ZlcmxheSBmaXRzIGluIHRoZSB2aWV3cG9ydCBvbiB0aGUgeC1heGlzLiAqL1xuICBmaXRzSW5WaWV3cG9ydEhvcml6b250YWxseTogYm9vbGVhbjtcblxuICAvKiogVGhlIHRvdGFsIHZpc2libGUgYXJlYSAoaW4gcHheMikgb2YgdGhlIG92ZXJsYXkgaW5zaWRlIHRoZSB2aWV3cG9ydC4gKi9cbiAgdmlzaWJsZUFyZWE6IG51bWJlcjtcbn1cblxuLyoqIFJlY29yZCBvZiB0aGUgbWVhc3VyZW1lbnRzIGRldGVybWluaW5nIHdoZXRoZXIgYW4gb3ZlcmxheSB3aWxsIGZpdCBpbiBhIHNwZWNpZmljIHBvc2l0aW9uLiAqL1xuaW50ZXJmYWNlIEZhbGxiYWNrUG9zaXRpb24ge1xuICBwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb247XG4gIG9yaWdpblBvaW50OiBQb2ludDtcbiAgb3ZlcmxheVBvaW50OiBQb2ludDtcbiAgb3ZlcmxheUZpdDogT3ZlcmxheUZpdDtcbiAgb3ZlcmxheVJlY3Q6IERpbWVuc2lvbnM7XG59XG5cbi8qKiBQb3NpdGlvbiBhbmQgc2l6ZSBvZiB0aGUgb3ZlcmxheSBzaXppbmcgd3JhcHBlciBmb3IgYSBzcGVjaWZpYyBwb3NpdGlvbi4gKi9cbmludGVyZmFjZSBCb3VuZGluZ0JveFJlY3Qge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICBib3R0b206IG51bWJlcjtcbiAgcmlnaHQ6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG59XG5cbi8qKiBSZWNvcmQgb2YgbWVhc3VyZXMgZGV0ZXJtaW5pbmcgaG93IHdlbGwgYSBnaXZlbiBwb3NpdGlvbiB3aWxsIGZpdCB3aXRoIGZsZXhpYmxlIGRpbWVuc2lvbnMuICovXG5pbnRlcmZhY2UgRmxleGlibGVGaXQge1xuICBwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb247XG4gIG9yaWdpbjogUG9pbnQ7XG4gIG92ZXJsYXlSZWN0OiBEaW1lbnNpb25zO1xuICBib3VuZGluZ0JveFJlY3Q6IEJvdW5kaW5nQm94UmVjdDtcbn1cblxuLyoqIEEgY29ubmVjdGVkIHBvc2l0aW9uIGFzIHNwZWNpZmllZCBieSB0aGUgdXNlci4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29ubmVjdGVkUG9zaXRpb24ge1xuICBvcmlnaW5YOiAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJztcbiAgb3JpZ2luWTogJ3RvcCcgfCAnY2VudGVyJyB8ICdib3R0b20nO1xuXG4gIG92ZXJsYXlYOiAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJztcbiAgb3ZlcmxheVk6ICd0b3AnIHwgJ2NlbnRlcicgfCAnYm90dG9tJztcblxuICB3ZWlnaHQ/OiBudW1iZXI7XG4gIG9mZnNldFg/OiBudW1iZXI7XG4gIG9mZnNldFk/OiBudW1iZXI7XG4gIHBhbmVsQ2xhc3M/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbn1cblxuLyoqIFNoYWxsb3ctZXh0ZW5kcyBhIHN0eWxlc2hlZXQgb2JqZWN0IHdpdGggYW5vdGhlciBzdHlsZXNoZWV0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIGV4dGVuZFN0eWxlcyhcbiAgZGVzdGluYXRpb246IENTU1N0eWxlRGVjbGFyYXRpb24sXG4gIHNvdXJjZTogQ1NTU3R5bGVEZWNsYXJhdGlvbixcbik6IENTU1N0eWxlRGVjbGFyYXRpb24ge1xuICBmb3IgKGxldCBrZXkgaW4gc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBwaXhlbCB2YWx1ZSBhcyBhIG51bWJlciBmcm9tIGEgdmFsdWUsIGlmIGl0J3MgYSBudW1iZXJcbiAqIG9yIGEgQ1NTIHBpeGVsIHN0cmluZyAoZS5nLiBgMTMzN3B4YCkuIE90aGVyd2lzZSByZXR1cm5zIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGdldFBpeGVsVmFsdWUoaW5wdXQ6IG51bWJlciB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIgfCBudWxsIHtcbiAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ251bWJlcicgJiYgaW5wdXQgIT0gbnVsbCkge1xuICAgIGNvbnN0IFt2YWx1ZSwgdW5pdHNdID0gaW5wdXQuc3BsaXQoY3NzVW5pdFBhdHRlcm4pO1xuICAgIHJldHVybiAhdW5pdHMgfHwgdW5pdHMgPT09ICdweCcgPyBwYXJzZUZsb2F0KHZhbHVlKSA6IG51bGw7XG4gIH1cblxuICByZXR1cm4gaW5wdXQgfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBHZXRzIGEgdmVyc2lvbiBvZiBhbiBlbGVtZW50J3MgYm91bmRpbmcgYERPTVJlY3RgIHdoZXJlIGFsbCB0aGUgdmFsdWVzIGFyZSByb3VuZGVkIGRvd24gdG9cbiAqIHRoZSBuZWFyZXN0IHBpeGVsLiBUaGlzIGFsbG93cyB1cyB0byBhY2NvdW50IGZvciB0aGUgY2FzZXMgd2hlcmUgdGhlcmUgbWF5IGJlIHN1Yi1waXhlbFxuICogZGV2aWF0aW9ucyBpbiB0aGUgYERPTVJlY3RgIHJldHVybmVkIGJ5IHRoZSBicm93c2VyIChlLmcuIHdoZW4gem9vbWVkIGluIHdpdGggYSBwZXJjZW50YWdlXG4gKiBzaXplLCBzZWUgIzIxMzUwKS5cbiAqL1xuZnVuY3Rpb24gZ2V0Um91bmRlZEJvdW5kaW5nQ2xpZW50UmVjdChjbGllbnRSZWN0OiBEaW1lbnNpb25zKTogRGltZW5zaW9ucyB7XG4gIHJldHVybiB7XG4gICAgdG9wOiBNYXRoLmZsb29yKGNsaWVudFJlY3QudG9wKSxcbiAgICByaWdodDogTWF0aC5mbG9vcihjbGllbnRSZWN0LnJpZ2h0KSxcbiAgICBib3R0b206IE1hdGguZmxvb3IoY2xpZW50UmVjdC5ib3R0b20pLFxuICAgIGxlZnQ6IE1hdGguZmxvb3IoY2xpZW50UmVjdC5sZWZ0KSxcbiAgICB3aWR0aDogTWF0aC5mbG9vcihjbGllbnRSZWN0LndpZHRoKSxcbiAgICBoZWlnaHQ6IE1hdGguZmxvb3IoY2xpZW50UmVjdC5oZWlnaHQpLFxuICB9O1xufVxuXG4vKiogUmV0dXJucyB3aGV0aGVyIHR3byBgU2Nyb2xsaW5nVmlzaWJpbGl0eWAgb2JqZWN0cyBhcmUgaWRlbnRpY2FsLiAqL1xuZnVuY3Rpb24gY29tcGFyZVNjcm9sbFZpc2liaWxpdHkoYTogU2Nyb2xsaW5nVmlzaWJpbGl0eSwgYjogU2Nyb2xsaW5nVmlzaWJpbGl0eSk6IGJvb2xlYW4ge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICBhLmlzT3JpZ2luQ2xpcHBlZCA9PT0gYi5pc09yaWdpbkNsaXBwZWQgJiZcbiAgICBhLmlzT3JpZ2luT3V0c2lkZVZpZXcgPT09IGIuaXNPcmlnaW5PdXRzaWRlVmlldyAmJlxuICAgIGEuaXNPdmVybGF5Q2xpcHBlZCA9PT0gYi5pc092ZXJsYXlDbGlwcGVkICYmXG4gICAgYS5pc092ZXJsYXlPdXRzaWRlVmlldyA9PT0gYi5pc092ZXJsYXlPdXRzaWRlVmlld1xuICApO1xufVxuXG5leHBvcnQgY29uc3QgU1RBTkRBUkRfRFJPUERPV05fQkVMT1dfUE9TSVRJT05TOiBDb25uZWN0ZWRQb3NpdGlvbltdID0gW1xuICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdib3R0b20nfSxcbl07XG5cbmV4cG9ydCBjb25zdCBTVEFOREFSRF9EUk9QRE9XTl9BREpBQ0VOVF9QT1NJVElPTlM6IENvbm5lY3RlZFBvc2l0aW9uW10gPSBbXG4gIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuXTtcbiJdfQ==