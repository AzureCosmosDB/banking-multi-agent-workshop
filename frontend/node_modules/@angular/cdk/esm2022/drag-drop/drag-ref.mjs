/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { _getEventTarget, _getShadowRoot, normalizePassiveListenerOptions, } from '@angular/cdk/platform';
import { signal, } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { deepCloneNode } from './dom/clone-node';
import { adjustDomRect, getMutableClientRect } from './dom/dom-rect';
import { ParentPositionTracker } from './dom/parent-position-tracker';
import { getRootNode } from './dom/root-node';
import { combineTransforms, getTransform, toggleNativeDragInteractions, toggleVisibility, } from './dom/styling';
import { PreviewRef } from './preview-ref';
/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({ passive: false });
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true,
});
/**
 * Time in milliseconds for which to ignore mouse events, after
 * receiving a touch event. Used to avoid doing double work for
 * touch devices where the browser fires fake mouse events, in
 * addition to touch events.
 */
const MOUSE_EVENT_IGNORE_TIME = 800;
/** Inline styles to be set as `!important` while dragging. */
const dragImportantProperties = new Set([
    // Needs to be important, because some `mat-table` sets `position: sticky !important`. See #22781.
    'position',
]);
/**
 * Reference to a draggable item. Used to manipulate or dispose of the item.
 */
export class DragRef {
    /** Whether starting to drag this element is disabled. */
    get disabled() {
        return this._disabled || !!(this._dropContainer && this._dropContainer.disabled);
    }
    set disabled(value) {
        if (value !== this._disabled) {
            this._disabled = value;
            this._toggleNativeDragInteractions();
            this._handles.forEach(handle => toggleNativeDragInteractions(handle, value));
        }
    }
    constructor(element, _config, _document, _ngZone, _viewportRuler, _dragDropRegistry) {
        this._config = _config;
        this._document = _document;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
        /**
         * CSS `transform` applied to the element when it isn't being dragged. We need a
         * passive transform in order for the dragged element to retain its new position
         * after the user has stopped dragging and because we need to know the relative
         * position in case they start dragging again. This corresponds to `element.style.transform`.
         */
        this._passiveTransform = { x: 0, y: 0 };
        /** CSS `transform` that is applied to the element while it's being dragged. */
        this._activeTransform = { x: 0, y: 0 };
        /**
         * Whether the dragging sequence has been started. Doesn't
         * necessarily mean that the element has been moved.
         */
        this._hasStartedDragging = signal(false);
        /** Emits when the item is being moved. */
        this._moveEvents = new Subject();
        /** Subscription to pointer movement events. */
        this._pointerMoveSubscription = Subscription.EMPTY;
        /** Subscription to the event that is dispatched when the user lifts their pointer. */
        this._pointerUpSubscription = Subscription.EMPTY;
        /** Subscription to the viewport being scrolled. */
        this._scrollSubscription = Subscription.EMPTY;
        /** Subscription to the viewport being resized. */
        this._resizeSubscription = Subscription.EMPTY;
        /** Cached reference to the boundary element. */
        this._boundaryElement = null;
        /** Whether the native dragging interactions have been enabled on the root element. */
        this._nativeInteractionsEnabled = true;
        /** Elements that can be used to drag the draggable item. */
        this._handles = [];
        /** Registered handles that are currently disabled. */
        this._disabledHandles = new Set();
        /** Layout direction of the item. */
        this._direction = 'ltr';
        /**
         * Amount of milliseconds to wait after the user has put their
         * pointer down before starting to drag the element.
         */
        this.dragStartDelay = 0;
        /**
         * If the parent of the dragged element has a `scale` transform, it can throw off the
         * positioning when the user starts dragging. Use this input to notify the CDK of the scale.
         */
        this.scale = 1;
        this._disabled = false;
        /** Emits as the drag sequence is being prepared. */
        this.beforeStarted = new Subject();
        /** Emits when the user starts dragging the item. */
        this.started = new Subject();
        /** Emits when the user has released a drag item, before any animations have started. */
        this.released = new Subject();
        /** Emits when the user stops dragging an item in the container. */
        this.ended = new Subject();
        /** Emits when the user has moved the item into a new container. */
        this.entered = new Subject();
        /** Emits when the user removes the item its container by dragging it into another container. */
        this.exited = new Subject();
        /** Emits when the user drops the item inside a container. */
        this.dropped = new Subject();
        /**
         * Emits as the user is dragging the item. Use with caution,
         * because this event will fire for every pixel that the user has dragged.
         */
        this.moved = this._moveEvents;
        /** Handler for the `mousedown`/`touchstart` events. */
        this._pointerDown = (event) => {
            this.beforeStarted.next();
            // Delegate the event based on whether it started from a handle or the element itself.
            if (this._handles.length) {
                const targetHandle = this._getTargetHandle(event);
                if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
                    this._initializeDragSequence(targetHandle, event);
                }
            }
            else if (!this.disabled) {
                this._initializeDragSequence(this._rootElement, event);
            }
        };
        /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
        this._pointerMove = (event) => {
            const pointerPosition = this._getPointerPositionOnPage(event);
            if (!this._hasStartedDragging()) {
                const distanceX = Math.abs(pointerPosition.x - this._pickupPositionOnPage.x);
                const distanceY = Math.abs(pointerPosition.y - this._pickupPositionOnPage.y);
                const isOverThreshold = distanceX + distanceY >= this._config.dragStartThreshold;
                // Only start dragging after the user has moved more than the minimum distance in either
                // direction. Note that this is preferable over doing something like `skip(minimumDistance)`
                // in the `pointerMove` subscription, because we're not guaranteed to have one move event
                // per pixel of movement (e.g. if the user moves their pointer quickly).
                if (isOverThreshold) {
                    const isDelayElapsed = Date.now() >= this._dragStartTime + this._getDragStartDelay(event);
                    const container = this._dropContainer;
                    if (!isDelayElapsed) {
                        this._endDragSequence(event);
                        return;
                    }
                    // Prevent other drag sequences from starting while something in the container is still
                    // being dragged. This can happen while we're waiting for the drop animation to finish
                    // and can cause errors, because some elements might still be moving around.
                    if (!container || (!container.isDragging() && !container.isReceiving())) {
                        // Prevent the default action as soon as the dragging sequence is considered as
                        // "started" since waiting for the next event can allow the device to begin scrolling.
                        if (event.cancelable) {
                            event.preventDefault();
                        }
                        this._hasStartedDragging.set(true);
                        this._ngZone.run(() => this._startDragSequence(event));
                    }
                }
                return;
            }
            // We prevent the default action down here so that we know that dragging has started. This is
            // important for touch devices where doing this too early can unnecessarily block scrolling,
            // if there's a dragging delay.
            if (event.cancelable) {
                event.preventDefault();
            }
            const constrainedPointerPosition = this._getConstrainedPointerPosition(pointerPosition);
            this._hasMoved = true;
            this._lastKnownPointerPosition = pointerPosition;
            this._updatePointerDirectionDelta(constrainedPointerPosition);
            if (this._dropContainer) {
                this._updateActiveDropContainer(constrainedPointerPosition, pointerPosition);
            }
            else {
                // If there's a position constraint function, we want the element's top/left to be at the
                // specific position on the page. Use the initial position as a reference if that's the case.
                const offset = this.constrainPosition ? this._initialDomRect : this._pickupPositionOnPage;
                const activeTransform = this._activeTransform;
                activeTransform.x = constrainedPointerPosition.x - offset.x + this._passiveTransform.x;
                activeTransform.y = constrainedPointerPosition.y - offset.y + this._passiveTransform.y;
                this._applyRootElementTransform(activeTransform.x, activeTransform.y);
            }
            // Since this event gets fired for every pixel while dragging, we only
            // want to fire it if the consumer opted into it. Also we have to
            // re-enter the zone because we run all of the events on the outside.
            if (this._moveEvents.observers.length) {
                this._ngZone.run(() => {
                    this._moveEvents.next({
                        source: this,
                        pointerPosition: constrainedPointerPosition,
                        event,
                        distance: this._getDragDistance(constrainedPointerPosition),
                        delta: this._pointerDirectionDelta,
                    });
                });
            }
        };
        /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
        this._pointerUp = (event) => {
            this._endDragSequence(event);
        };
        /** Handles a native `dragstart` event. */
        this._nativeDragStart = (event) => {
            if (this._handles.length) {
                const targetHandle = this._getTargetHandle(event);
                if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
                    event.preventDefault();
                }
            }
            else if (!this.disabled) {
                // Usually this isn't necessary since the we prevent the default action in `pointerDown`,
                // but some cases like dragging of links can slip through (see #24403).
                event.preventDefault();
            }
        };
        this.withRootElement(element).withParent(_config.parentDragRef || null);
        this._parentPositions = new ParentPositionTracker(_document);
        _dragDropRegistry.registerDragItem(this);
    }
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     */
    getPlaceholderElement() {
        return this._placeholder;
    }
    /** Returns the root draggable element. */
    getRootElement() {
        return this._rootElement;
    }
    /**
     * Gets the currently-visible element that represents the drag item.
     * While dragging this is the placeholder, otherwise it's the root element.
     */
    getVisibleElement() {
        return this.isDragging() ? this.getPlaceholderElement() : this.getRootElement();
    }
    /** Registers the handles that can be used to drag the element. */
    withHandles(handles) {
        this._handles = handles.map(handle => coerceElement(handle));
        this._handles.forEach(handle => toggleNativeDragInteractions(handle, this.disabled));
        this._toggleNativeDragInteractions();
        // Delete any lingering disabled handles that may have been destroyed. Note that we re-create
        // the set, rather than iterate over it and filter out the destroyed handles, because while
        // the ES spec allows for sets to be modified while they're being iterated over, some polyfills
        // use an array internally which may throw an error.
        const disabledHandles = new Set();
        this._disabledHandles.forEach(handle => {
            if (this._handles.indexOf(handle) > -1) {
                disabledHandles.add(handle);
            }
        });
        this._disabledHandles = disabledHandles;
        return this;
    }
    /**
     * Registers the template that should be used for the drag preview.
     * @param template Template that from which to stamp out the preview.
     */
    withPreviewTemplate(template) {
        this._previewTemplate = template;
        return this;
    }
    /**
     * Registers the template that should be used for the drag placeholder.
     * @param template Template that from which to stamp out the placeholder.
     */
    withPlaceholderTemplate(template) {
        this._placeholderTemplate = template;
        return this;
    }
    /**
     * Sets an alternate drag root element. The root element is the element that will be moved as
     * the user is dragging. Passing an alternate root element is useful when trying to enable
     * dragging on an element that you might not have access to.
     */
    withRootElement(rootElement) {
        const element = coerceElement(rootElement);
        if (element !== this._rootElement) {
            if (this._rootElement) {
                this._removeRootElementListeners(this._rootElement);
            }
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
                element.addEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
                element.addEventListener('dragstart', this._nativeDragStart, activeEventListenerOptions);
            });
            this._initialTransform = undefined;
            this._rootElement = element;
        }
        if (typeof SVGElement !== 'undefined' && this._rootElement instanceof SVGElement) {
            this._ownerSVGElement = this._rootElement.ownerSVGElement;
        }
        return this;
    }
    /**
     * Element to which the draggable's position will be constrained.
     */
    withBoundaryElement(boundaryElement) {
        this._boundaryElement = boundaryElement ? coerceElement(boundaryElement) : null;
        this._resizeSubscription.unsubscribe();
        if (boundaryElement) {
            this._resizeSubscription = this._viewportRuler
                .change(10)
                .subscribe(() => this._containInsideBoundaryOnResize());
        }
        return this;
    }
    /** Sets the parent ref that the ref is nested in.  */
    withParent(parent) {
        this._parentDragRef = parent;
        return this;
    }
    /** Removes the dragging functionality from the DOM element. */
    dispose() {
        this._removeRootElementListeners(this._rootElement);
        // Do this check before removing from the registry since it'll
        // stop being considered as dragged once it is removed.
        if (this.isDragging()) {
            // Since we move out the element to the end of the body while it's being
            // dragged, we have to make sure that it's removed if it gets destroyed.
            this._rootElement?.remove();
        }
        this._anchor?.remove();
        this._destroyPreview();
        this._destroyPlaceholder();
        this._dragDropRegistry.removeDragItem(this);
        this._removeListeners();
        this.beforeStarted.complete();
        this.started.complete();
        this.released.complete();
        this.ended.complete();
        this.entered.complete();
        this.exited.complete();
        this.dropped.complete();
        this._moveEvents.complete();
        this._handles = [];
        this._disabledHandles.clear();
        this._dropContainer = undefined;
        this._resizeSubscription.unsubscribe();
        this._parentPositions.clear();
        this._boundaryElement =
            this._rootElement =
                this._ownerSVGElement =
                    this._placeholderTemplate =
                        this._previewTemplate =
                            this._anchor =
                                this._parentDragRef =
                                    null;
    }
    /** Checks whether the element is currently being dragged. */
    isDragging() {
        return this._hasStartedDragging() && this._dragDropRegistry.isDragging(this);
    }
    /** Resets a standalone drag item to its initial position. */
    reset() {
        this._rootElement.style.transform = this._initialTransform || '';
        this._activeTransform = { x: 0, y: 0 };
        this._passiveTransform = { x: 0, y: 0 };
    }
    /**
     * Sets a handle as disabled. While a handle is disabled, it'll capture and interrupt dragging.
     * @param handle Handle element that should be disabled.
     */
    disableHandle(handle) {
        if (!this._disabledHandles.has(handle) && this._handles.indexOf(handle) > -1) {
            this._disabledHandles.add(handle);
            toggleNativeDragInteractions(handle, true);
        }
    }
    /**
     * Enables a handle, if it has been disabled.
     * @param handle Handle element to be enabled.
     */
    enableHandle(handle) {
        if (this._disabledHandles.has(handle)) {
            this._disabledHandles.delete(handle);
            toggleNativeDragInteractions(handle, this.disabled);
        }
    }
    /** Sets the layout direction of the draggable item. */
    withDirection(direction) {
        this._direction = direction;
        return this;
    }
    /** Sets the container that the item is part of. */
    _withDropContainer(container) {
        this._dropContainer = container;
    }
    /**
     * Gets the current position in pixels the draggable outside of a drop container.
     */
    getFreeDragPosition() {
        const position = this.isDragging() ? this._activeTransform : this._passiveTransform;
        return { x: position.x, y: position.y };
    }
    /**
     * Sets the current position in pixels the draggable outside of a drop container.
     * @param value New position to be set.
     */
    setFreeDragPosition(value) {
        this._activeTransform = { x: 0, y: 0 };
        this._passiveTransform.x = value.x;
        this._passiveTransform.y = value.y;
        if (!this._dropContainer) {
            this._applyRootElementTransform(value.x, value.y);
        }
        return this;
    }
    /**
     * Sets the container into which to insert the preview element.
     * @param value Container into which to insert the preview.
     */
    withPreviewContainer(value) {
        this._previewContainer = value;
        return this;
    }
    /** Updates the item's sort order based on the last-known pointer position. */
    _sortFromLastPointerPosition() {
        const position = this._lastKnownPointerPosition;
        if (position && this._dropContainer) {
            this._updateActiveDropContainer(this._getConstrainedPointerPosition(position), position);
        }
    }
    /** Unsubscribes from the global subscriptions. */
    _removeListeners() {
        this._pointerMoveSubscription.unsubscribe();
        this._pointerUpSubscription.unsubscribe();
        this._scrollSubscription.unsubscribe();
        this._getShadowRoot()?.removeEventListener('selectstart', shadowDomSelectStart, activeCapturingEventOptions);
    }
    /** Destroys the preview element and its ViewRef. */
    _destroyPreview() {
        this._preview?.destroy();
        this._preview = null;
    }
    /** Destroys the placeholder element and its ViewRef. */
    _destroyPlaceholder() {
        this._placeholder?.remove();
        this._placeholderRef?.destroy();
        this._placeholder = this._placeholderRef = null;
    }
    /**
     * Clears subscriptions and stops the dragging sequence.
     * @param event Browser event object that ended the sequence.
     */
    _endDragSequence(event) {
        // Note that here we use `isDragging` from the service, rather than from `this`.
        // The difference is that the one from the service reflects whether a dragging sequence
        // has been initiated, whereas the one on `this` includes whether the user has passed
        // the minimum dragging threshold.
        if (!this._dragDropRegistry.isDragging(this)) {
            return;
        }
        this._removeListeners();
        this._dragDropRegistry.stopDragging(this);
        this._toggleNativeDragInteractions();
        if (this._handles) {
            this._rootElement.style.webkitTapHighlightColor =
                this._rootElementTapHighlight;
        }
        if (!this._hasStartedDragging()) {
            return;
        }
        this.released.next({ source: this, event });
        if (this._dropContainer) {
            // Stop scrolling immediately, instead of waiting for the animation to finish.
            this._dropContainer._stopScrolling();
            this._animatePreviewToPlaceholder().then(() => {
                this._cleanupDragArtifacts(event);
                this._cleanupCachedDimensions();
                this._dragDropRegistry.stopDragging(this);
            });
        }
        else {
            // Convert the active transform into a passive one. This means that next time
            // the user starts dragging the item, its position will be calculated relatively
            // to the new passive transform.
            this._passiveTransform.x = this._activeTransform.x;
            const pointerPosition = this._getPointerPositionOnPage(event);
            this._passiveTransform.y = this._activeTransform.y;
            this._ngZone.run(() => {
                this.ended.next({
                    source: this,
                    distance: this._getDragDistance(pointerPosition),
                    dropPoint: pointerPosition,
                    event,
                });
            });
            this._cleanupCachedDimensions();
            this._dragDropRegistry.stopDragging(this);
        }
    }
    /** Starts the dragging sequence. */
    _startDragSequence(event) {
        if (isTouchEvent(event)) {
            this._lastTouchEventTime = Date.now();
        }
        this._toggleNativeDragInteractions();
        // Needs to happen before the root element is moved.
        const shadowRoot = this._getShadowRoot();
        const dropContainer = this._dropContainer;
        if (shadowRoot) {
            // In some browsers the global `selectstart` that we maintain in the `DragDropRegistry`
            // doesn't cross the shadow boundary so we have to prevent it at the shadow root (see #28792).
            this._ngZone.runOutsideAngular(() => {
                shadowRoot.addEventListener('selectstart', shadowDomSelectStart, activeCapturingEventOptions);
            });
        }
        if (dropContainer) {
            const element = this._rootElement;
            const parent = element.parentNode;
            const placeholder = (this._placeholder = this._createPlaceholderElement());
            const anchor = (this._anchor =
                this._anchor ||
                    this._document.createComment(typeof ngDevMode === 'undefined' || ngDevMode ? 'cdk-drag-anchor' : ''));
            // Insert an anchor node so that we can restore the element's position in the DOM.
            parent.insertBefore(anchor, element);
            // There's no risk of transforms stacking when inside a drop container so
            // we can keep the initial transform up to date any time dragging starts.
            this._initialTransform = element.style.transform || '';
            // Create the preview after the initial transform has
            // been cached, because it can be affected by the transform.
            this._preview = new PreviewRef(this._document, this._rootElement, this._direction, this._initialDomRect, this._previewTemplate || null, this.previewClass || null, this._pickupPositionOnPage, this._initialTransform, this._config.zIndex || 1000);
            this._preview.attach(this._getPreviewInsertionPoint(parent, shadowRoot));
            // We move the element out at the end of the body and we make it hidden, because keeping it in
            // place will throw off the consumer's `:last-child` selectors. We can't remove the element
            // from the DOM completely, because iOS will stop firing all subsequent events in the chain.
            toggleVisibility(element, false, dragImportantProperties);
            this._document.body.appendChild(parent.replaceChild(placeholder, element));
            this.started.next({ source: this, event }); // Emit before notifying the container.
            dropContainer.start();
            this._initialContainer = dropContainer;
            this._initialIndex = dropContainer.getItemIndex(this);
        }
        else {
            this.started.next({ source: this, event });
            this._initialContainer = this._initialIndex = undefined;
        }
        // Important to run after we've called `start` on the parent container
        // so that it has had time to resolve its scrollable parents.
        this._parentPositions.cache(dropContainer ? dropContainer.getScrollableParents() : []);
    }
    /**
     * Sets up the different variables and subscriptions
     * that will be necessary for the dragging sequence.
     * @param referenceElement Element that started the drag sequence.
     * @param event Browser event object that started the sequence.
     */
    _initializeDragSequence(referenceElement, event) {
        // Stop propagation if the item is inside another
        // draggable so we don't start multiple drag sequences.
        if (this._parentDragRef) {
            event.stopPropagation();
        }
        const isDragging = this.isDragging();
        const isTouchSequence = isTouchEvent(event);
        const isAuxiliaryMouseButton = !isTouchSequence && event.button !== 0;
        const rootElement = this._rootElement;
        const target = _getEventTarget(event);
        const isSyntheticEvent = !isTouchSequence &&
            this._lastTouchEventTime &&
            this._lastTouchEventTime + MOUSE_EVENT_IGNORE_TIME > Date.now();
        const isFakeEvent = isTouchSequence
            ? isFakeTouchstartFromScreenReader(event)
            : isFakeMousedownFromScreenReader(event);
        // If the event started from an element with the native HTML drag&drop, it'll interfere
        // with our own dragging (e.g. `img` tags do it by default). Prevent the default action
        // to stop it from happening. Note that preventing on `dragstart` also seems to work, but
        // it's flaky and it fails if the user drags it away quickly. Also note that we only want
        // to do this for `mousedown` since doing the same for `touchstart` will stop any `click`
        // events from firing on touch devices.
        if (target && target.draggable && event.type === 'mousedown') {
            event.preventDefault();
        }
        // Abort if the user is already dragging or is using a mouse button other than the primary one.
        if (isDragging || isAuxiliaryMouseButton || isSyntheticEvent || isFakeEvent) {
            return;
        }
        // If we've got handles, we need to disable the tap highlight on the entire root element,
        // otherwise iOS will still add it, even though all the drag interactions on the handle
        // are disabled.
        if (this._handles.length) {
            const rootStyles = rootElement.style;
            this._rootElementTapHighlight = rootStyles.webkitTapHighlightColor || '';
            rootStyles.webkitTapHighlightColor = 'transparent';
        }
        this._hasMoved = false;
        this._hasStartedDragging.set(this._hasMoved);
        // Avoid multiple subscriptions and memory leaks when multi touch
        // (isDragging check above isn't enough because of possible temporal and/or dimensional delays)
        this._removeListeners();
        this._initialDomRect = this._rootElement.getBoundingClientRect();
        this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
        this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
        this._scrollSubscription = this._dragDropRegistry
            .scrolled(this._getShadowRoot())
            .subscribe(scrollEvent => this._updateOnScroll(scrollEvent));
        if (this._boundaryElement) {
            this._boundaryRect = getMutableClientRect(this._boundaryElement);
        }
        // If we have a custom preview we can't know ahead of time how large it'll be so we position
        // it next to the cursor. The exception is when the consumer has opted into making the preview
        // the same size as the root element, in which case we do know the size.
        const previewTemplate = this._previewTemplate;
        this._pickupPositionInElement =
            previewTemplate && previewTemplate.template && !previewTemplate.matchSize
                ? { x: 0, y: 0 }
                : this._getPointerPositionInElement(this._initialDomRect, referenceElement, event);
        const pointerPosition = (this._pickupPositionOnPage =
            this._lastKnownPointerPosition =
                this._getPointerPositionOnPage(event));
        this._pointerDirectionDelta = { x: 0, y: 0 };
        this._pointerPositionAtLastDirectionChange = { x: pointerPosition.x, y: pointerPosition.y };
        this._dragStartTime = Date.now();
        this._dragDropRegistry.startDragging(this, event);
    }
    /** Cleans up the DOM artifacts that were added to facilitate the element being dragged. */
    _cleanupDragArtifacts(event) {
        // Restore the element's visibility and insert it at its old position in the DOM.
        // It's important that we maintain the position, because moving the element around in the DOM
        // can throw off `NgFor` which does smart diffing and re-creates elements only when necessary,
        // while moving the existing elements in all other cases.
        toggleVisibility(this._rootElement, true, dragImportantProperties);
        this._anchor.parentNode.replaceChild(this._rootElement, this._anchor);
        this._destroyPreview();
        this._destroyPlaceholder();
        this._initialDomRect =
            this._boundaryRect =
                this._previewRect =
                    this._initialTransform =
                        undefined;
        // Re-enter the NgZone since we bound `document` events on the outside.
        this._ngZone.run(() => {
            const container = this._dropContainer;
            const currentIndex = container.getItemIndex(this);
            const pointerPosition = this._getPointerPositionOnPage(event);
            const distance = this._getDragDistance(pointerPosition);
            const isPointerOverContainer = container._isOverContainer(pointerPosition.x, pointerPosition.y);
            this.ended.next({ source: this, distance, dropPoint: pointerPosition, event });
            this.dropped.next({
                item: this,
                currentIndex,
                previousIndex: this._initialIndex,
                container: container,
                previousContainer: this._initialContainer,
                isPointerOverContainer,
                distance,
                dropPoint: pointerPosition,
                event,
            });
            container.drop(this, currentIndex, this._initialIndex, this._initialContainer, isPointerOverContainer, distance, pointerPosition, event);
            this._dropContainer = this._initialContainer;
        });
    }
    /**
     * Updates the item's position in its drop container, or moves it
     * into a new one, depending on its current drag position.
     */
    _updateActiveDropContainer({ x, y }, { x: rawX, y: rawY }) {
        // Drop container that draggable has been moved into.
        let newContainer = this._initialContainer._getSiblingContainerFromPosition(this, x, y);
        // If we couldn't find a new container to move the item into, and the item has left its
        // initial container, check whether the it's over the initial container. This handles the
        // case where two containers are connected one way and the user tries to undo dragging an
        // item into a new container.
        if (!newContainer &&
            this._dropContainer !== this._initialContainer &&
            this._initialContainer._isOverContainer(x, y)) {
            newContainer = this._initialContainer;
        }
        if (newContainer && newContainer !== this._dropContainer) {
            this._ngZone.run(() => {
                // Notify the old container that the item has left.
                this.exited.next({ item: this, container: this._dropContainer });
                this._dropContainer.exit(this);
                // Notify the new container that the item has entered.
                this._dropContainer = newContainer;
                this._dropContainer.enter(this, x, y, newContainer === this._initialContainer &&
                    // If we're re-entering the initial container and sorting is disabled,
                    // put item the into its starting index to begin with.
                    newContainer.sortingDisabled
                    ? this._initialIndex
                    : undefined);
                this.entered.next({
                    item: this,
                    container: newContainer,
                    currentIndex: newContainer.getItemIndex(this),
                });
            });
        }
        // Dragging may have been interrupted as a result of the events above.
        if (this.isDragging()) {
            this._dropContainer._startScrollingIfNecessary(rawX, rawY);
            this._dropContainer._sortItem(this, x, y, this._pointerDirectionDelta);
            if (this.constrainPosition) {
                this._applyPreviewTransform(x, y);
            }
            else {
                this._applyPreviewTransform(x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
            }
        }
    }
    /**
     * Animates the preview element from its current position to the location of the drop placeholder.
     * @returns Promise that resolves when the animation completes.
     */
    _animatePreviewToPlaceholder() {
        // If the user hasn't moved yet, the transitionend event won't fire.
        if (!this._hasMoved) {
            return Promise.resolve();
        }
        const placeholderRect = this._placeholder.getBoundingClientRect();
        // Apply the class that adds a transition to the preview.
        this._preview.addClass('cdk-drag-animating');
        // Move the preview to the placeholder position.
        this._applyPreviewTransform(placeholderRect.left, placeholderRect.top);
        // If the element doesn't have a `transition`, the `transitionend` event won't fire. Since
        // we need to trigger a style recalculation in order for the `cdk-drag-animating` class to
        // apply its style, we take advantage of the available info to figure out whether we need to
        // bind the event in the first place.
        const duration = this._preview.getTransitionDuration();
        if (duration === 0) {
            return Promise.resolve();
        }
        return this._ngZone.runOutsideAngular(() => {
            return new Promise(resolve => {
                const handler = ((event) => {
                    if (!event ||
                        (this._preview &&
                            _getEventTarget(event) === this._preview.element &&
                            event.propertyName === 'transform')) {
                        this._preview?.removeEventListener('transitionend', handler);
                        resolve();
                        clearTimeout(timeout);
                    }
                });
                // If a transition is short enough, the browser might not fire the `transitionend` event.
                // Since we know how long it's supposed to take, add a timeout with a 50% buffer that'll
                // fire if the transition hasn't completed when it was supposed to.
                const timeout = setTimeout(handler, duration * 1.5);
                this._preview.addEventListener('transitionend', handler);
            });
        });
    }
    /** Creates an element that will be shown instead of the current element while dragging. */
    _createPlaceholderElement() {
        const placeholderConfig = this._placeholderTemplate;
        const placeholderTemplate = placeholderConfig ? placeholderConfig.template : null;
        let placeholder;
        if (placeholderTemplate) {
            this._placeholderRef = placeholderConfig.viewContainer.createEmbeddedView(placeholderTemplate, placeholderConfig.context);
            this._placeholderRef.detectChanges();
            placeholder = getRootNode(this._placeholderRef, this._document);
        }
        else {
            placeholder = deepCloneNode(this._rootElement);
        }
        // Stop pointer events on the preview so the user can't
        // interact with it while the preview is animating.
        placeholder.style.pointerEvents = 'none';
        placeholder.classList.add('cdk-drag-placeholder');
        return placeholder;
    }
    /**
     * Figures out the coordinates at which an element was picked up.
     * @param referenceElement Element that initiated the dragging.
     * @param event Event that initiated the dragging.
     */
    _getPointerPositionInElement(elementRect, referenceElement, event) {
        const handleElement = referenceElement === this._rootElement ? null : referenceElement;
        const referenceRect = handleElement ? handleElement.getBoundingClientRect() : elementRect;
        const point = isTouchEvent(event) ? event.targetTouches[0] : event;
        const scrollPosition = this._getViewportScrollPosition();
        const x = point.pageX - referenceRect.left - scrollPosition.left;
        const y = point.pageY - referenceRect.top - scrollPosition.top;
        return {
            x: referenceRect.left - elementRect.left + x,
            y: referenceRect.top - elementRect.top + y,
        };
    }
    /** Determines the point of the page that was touched by the user. */
    _getPointerPositionOnPage(event) {
        const scrollPosition = this._getViewportScrollPosition();
        const point = isTouchEvent(event)
            ? // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
                // Also note that on real devices we're guaranteed for either `touches` or `changedTouches`
                // to have a value, but Firefox in device emulation mode has a bug where both can be empty
                // for `touchstart` and `touchend` so we fall back to a dummy object in order to avoid
                // throwing an error. The value returned here will be incorrect, but since this only
                // breaks inside a developer tool and the value is only used for secondary information,
                // we can get away with it. See https://bugzilla.mozilla.org/show_bug.cgi?id=1615824.
                event.touches[0] || event.changedTouches[0] || { pageX: 0, pageY: 0 }
            : event;
        const x = point.pageX - scrollPosition.left;
        const y = point.pageY - scrollPosition.top;
        // if dragging SVG element, try to convert from the screen coordinate system to the SVG
        // coordinate system
        if (this._ownerSVGElement) {
            const svgMatrix = this._ownerSVGElement.getScreenCTM();
            if (svgMatrix) {
                const svgPoint = this._ownerSVGElement.createSVGPoint();
                svgPoint.x = x;
                svgPoint.y = y;
                return svgPoint.matrixTransform(svgMatrix.inverse());
            }
        }
        return { x, y };
    }
    /** Gets the pointer position on the page, accounting for any position constraints. */
    _getConstrainedPointerPosition(point) {
        const dropContainerLock = this._dropContainer ? this._dropContainer.lockAxis : null;
        let { x, y } = this.constrainPosition
            ? this.constrainPosition(point, this, this._initialDomRect, this._pickupPositionInElement)
            : point;
        if (this.lockAxis === 'x' || dropContainerLock === 'x') {
            y =
                this._pickupPositionOnPage.y -
                    (this.constrainPosition ? this._pickupPositionInElement.y : 0);
        }
        else if (this.lockAxis === 'y' || dropContainerLock === 'y') {
            x =
                this._pickupPositionOnPage.x -
                    (this.constrainPosition ? this._pickupPositionInElement.x : 0);
        }
        if (this._boundaryRect) {
            // If not using a custom constrain we need to account for the pickup position in the element
            // otherwise we do not need to do this, as it has already been accounted for
            const { x: pickupX, y: pickupY } = !this.constrainPosition
                ? this._pickupPositionInElement
                : { x: 0, y: 0 };
            const boundaryRect = this._boundaryRect;
            const { width: previewWidth, height: previewHeight } = this._getPreviewRect();
            const minY = boundaryRect.top + pickupY;
            const maxY = boundaryRect.bottom - (previewHeight - pickupY);
            const minX = boundaryRect.left + pickupX;
            const maxX = boundaryRect.right - (previewWidth - pickupX);
            x = clamp(x, minX, maxX);
            y = clamp(y, minY, maxY);
        }
        return { x, y };
    }
    /** Updates the current drag delta, based on the user's current pointer position on the page. */
    _updatePointerDirectionDelta(pointerPositionOnPage) {
        const { x, y } = pointerPositionOnPage;
        const delta = this._pointerDirectionDelta;
        const positionSinceLastChange = this._pointerPositionAtLastDirectionChange;
        // Amount of pixels the user has dragged since the last time the direction changed.
        const changeX = Math.abs(x - positionSinceLastChange.x);
        const changeY = Math.abs(y - positionSinceLastChange.y);
        // Because we handle pointer events on a per-pixel basis, we don't want the delta
        // to change for every pixel, otherwise anything that depends on it can look erratic.
        // To make the delta more consistent, we track how much the user has moved since the last
        // delta change and we only update it after it has reached a certain threshold.
        if (changeX > this._config.pointerDirectionChangeThreshold) {
            delta.x = x > positionSinceLastChange.x ? 1 : -1;
            positionSinceLastChange.x = x;
        }
        if (changeY > this._config.pointerDirectionChangeThreshold) {
            delta.y = y > positionSinceLastChange.y ? 1 : -1;
            positionSinceLastChange.y = y;
        }
        return delta;
    }
    /** Toggles the native drag interactions, based on how many handles are registered. */
    _toggleNativeDragInteractions() {
        if (!this._rootElement || !this._handles) {
            return;
        }
        const shouldEnable = this._handles.length > 0 || !this.isDragging();
        if (shouldEnable !== this._nativeInteractionsEnabled) {
            this._nativeInteractionsEnabled = shouldEnable;
            toggleNativeDragInteractions(this._rootElement, shouldEnable);
        }
    }
    /** Removes the manually-added event listeners from the root element. */
    _removeRootElementListeners(element) {
        element.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
        element.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
        element.removeEventListener('dragstart', this._nativeDragStart, activeEventListenerOptions);
    }
    /**
     * Applies a `transform` to the root element, taking into account any existing transforms on it.
     * @param x New transform value along the X axis.
     * @param y New transform value along the Y axis.
     */
    _applyRootElementTransform(x, y) {
        const scale = 1 / this.scale;
        const transform = getTransform(x * scale, y * scale);
        const styles = this._rootElement.style;
        // Cache the previous transform amount only after the first drag sequence, because
        // we don't want our own transforms to stack on top of each other.
        // Should be excluded none because none + translate3d(x, y, x) is invalid css
        if (this._initialTransform == null) {
            this._initialTransform =
                styles.transform && styles.transform != 'none' ? styles.transform : '';
        }
        // Preserve the previous `transform` value, if there was one. Note that we apply our own
        // transform before the user's, because things like rotation can affect which direction
        // the element will be translated towards.
        styles.transform = combineTransforms(transform, this._initialTransform);
    }
    /**
     * Applies a `transform` to the preview, taking into account any existing transforms on it.
     * @param x New transform value along the X axis.
     * @param y New transform value along the Y axis.
     */
    _applyPreviewTransform(x, y) {
        // Only apply the initial transform if the preview is a clone of the original element, otherwise
        // it could be completely different and the transform might not make sense anymore.
        const initialTransform = this._previewTemplate?.template ? undefined : this._initialTransform;
        const transform = getTransform(x, y);
        this._preview.setTransform(combineTransforms(transform, initialTransform));
    }
    /**
     * Gets the distance that the user has dragged during the current drag sequence.
     * @param currentPosition Current position of the user's pointer.
     */
    _getDragDistance(currentPosition) {
        const pickupPosition = this._pickupPositionOnPage;
        if (pickupPosition) {
            return { x: currentPosition.x - pickupPosition.x, y: currentPosition.y - pickupPosition.y };
        }
        return { x: 0, y: 0 };
    }
    /** Cleans up any cached element dimensions that we don't need after dragging has stopped. */
    _cleanupCachedDimensions() {
        this._boundaryRect = this._previewRect = undefined;
        this._parentPositions.clear();
    }
    /**
     * Checks whether the element is still inside its boundary after the viewport has been resized.
     * If not, the position is adjusted so that the element fits again.
     */
    _containInsideBoundaryOnResize() {
        let { x, y } = this._passiveTransform;
        if ((x === 0 && y === 0) || this.isDragging() || !this._boundaryElement) {
            return;
        }
        // Note: don't use `_clientRectAtStart` here, because we want the latest position.
        const elementRect = this._rootElement.getBoundingClientRect();
        const boundaryRect = this._boundaryElement.getBoundingClientRect();
        // It's possible that the element got hidden away after dragging (e.g. by switching to a
        // different tab). Don't do anything in this case so we don't clear the user's position.
        if ((boundaryRect.width === 0 && boundaryRect.height === 0) ||
            (elementRect.width === 0 && elementRect.height === 0)) {
            return;
        }
        const leftOverflow = boundaryRect.left - elementRect.left;
        const rightOverflow = elementRect.right - boundaryRect.right;
        const topOverflow = boundaryRect.top - elementRect.top;
        const bottomOverflow = elementRect.bottom - boundaryRect.bottom;
        // If the element has become wider than the boundary, we can't
        // do much to make it fit so we just anchor it to the left.
        if (boundaryRect.width > elementRect.width) {
            if (leftOverflow > 0) {
                x += leftOverflow;
            }
            if (rightOverflow > 0) {
                x -= rightOverflow;
            }
        }
        else {
            x = 0;
        }
        // If the element has become taller than the boundary, we can't
        // do much to make it fit so we just anchor it to the top.
        if (boundaryRect.height > elementRect.height) {
            if (topOverflow > 0) {
                y += topOverflow;
            }
            if (bottomOverflow > 0) {
                y -= bottomOverflow;
            }
        }
        else {
            y = 0;
        }
        if (x !== this._passiveTransform.x || y !== this._passiveTransform.y) {
            this.setFreeDragPosition({ y, x });
        }
    }
    /** Gets the drag start delay, based on the event type. */
    _getDragStartDelay(event) {
        const value = this.dragStartDelay;
        if (typeof value === 'number') {
            return value;
        }
        else if (isTouchEvent(event)) {
            return value.touch;
        }
        return value ? value.mouse : 0;
    }
    /** Updates the internal state of the draggable element when scrolling has occurred. */
    _updateOnScroll(event) {
        const scrollDifference = this._parentPositions.handleScroll(event);
        if (scrollDifference) {
            const target = _getEventTarget(event);
            // DOMRect dimensions are based on the scroll position of the page and its parent
            // node so we have to update the cached boundary DOMRect if the user has scrolled.
            if (this._boundaryRect &&
                target !== this._boundaryElement &&
                target.contains(this._boundaryElement)) {
                adjustDomRect(this._boundaryRect, scrollDifference.top, scrollDifference.left);
            }
            this._pickupPositionOnPage.x += scrollDifference.left;
            this._pickupPositionOnPage.y += scrollDifference.top;
            // If we're in free drag mode, we have to update the active transform, because
            // it isn't relative to the viewport like the preview inside a drop list.
            if (!this._dropContainer) {
                this._activeTransform.x -= scrollDifference.left;
                this._activeTransform.y -= scrollDifference.top;
                this._applyRootElementTransform(this._activeTransform.x, this._activeTransform.y);
            }
        }
    }
    /** Gets the scroll position of the viewport. */
    _getViewportScrollPosition() {
        return (this._parentPositions.positions.get(this._document)?.scrollPosition ||
            this._parentPositions.getViewportScrollPosition());
    }
    /**
     * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
     * than saving it in property directly on init, because we want to resolve it as late as possible
     * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
     * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
     */
    _getShadowRoot() {
        if (this._cachedShadowRoot === undefined) {
            this._cachedShadowRoot = _getShadowRoot(this._rootElement);
        }
        return this._cachedShadowRoot;
    }
    /** Gets the element into which the drag preview should be inserted. */
    _getPreviewInsertionPoint(initialParent, shadowRoot) {
        const previewContainer = this._previewContainer || 'global';
        if (previewContainer === 'parent') {
            return initialParent;
        }
        if (previewContainer === 'global') {
            const documentRef = this._document;
            // We can't use the body if the user is in fullscreen mode,
            // because the preview will render under the fullscreen element.
            // TODO(crisbeto): dedupe this with the `FullscreenOverlayContainer` eventually.
            return (shadowRoot ||
                documentRef.fullscreenElement ||
                documentRef.webkitFullscreenElement ||
                documentRef.mozFullScreenElement ||
                documentRef.msFullscreenElement ||
                documentRef.body);
        }
        return coerceElement(previewContainer);
    }
    /** Lazily resolves and returns the dimensions of the preview. */
    _getPreviewRect() {
        // Cache the preview element rect if we haven't cached it already or if
        // we cached it too early before the element dimensions were computed.
        if (!this._previewRect || (!this._previewRect.width && !this._previewRect.height)) {
            this._previewRect = this._preview
                ? this._preview.getBoundingClientRect()
                : this._initialDomRect;
        }
        return this._previewRect;
    }
    /** Gets a handle that is the target of an event. */
    _getTargetHandle(event) {
        return this._handles.find(handle => {
            return event.target && (event.target === handle || handle.contains(event.target));
        });
    }
}
/** Clamps a value between a minimum and a maximum. */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/** Determines whether an event is a touch event. */
function isTouchEvent(event) {
    // This function is called for every pixel that the user has dragged so we need it to be
    // as fast as possible. Since we only bind mouse events and touch events, we can assume
    // that if the event's name starts with `t`, it's a touch event.
    return event.type[0] === 't';
}
/** Callback invoked for `selectstart` events inside the shadow DOM. */
function shadowDomSelectStart(event) {
    event.preventDefault();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9kcmFnLXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsK0JBQStCLEVBQUUsZ0NBQWdDLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUNMLGVBQWUsRUFDZixjQUFjLEVBQ2QsK0JBQStCLEdBQ2hDLE1BQU0sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxFQU1MLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWEsT0FBTyxFQUFFLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25FLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWiw0QkFBNEIsRUFDNUIsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBc0IsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBdUI5RCxpRUFBaUU7QUFDakUsTUFBTSwyQkFBMkIsR0FBRywrQkFBK0IsQ0FBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBRXJGLGlFQUFpRTtBQUNqRSxNQUFNLDBCQUEwQixHQUFHLCtCQUErQixDQUFDLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFFckYseUVBQXlFO0FBQ3pF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LEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNGYWtlTW91c2Vkb3duRnJvbVNjcmVlblJlYWRlciwgaXNGYWtlVG91Y2hzdGFydEZyb21TY3JlZW5SZWFkZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge2NvZXJjZUVsZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBfZ2V0RXZlbnRUYXJnZXQsXG4gIF9nZXRTaGFkb3dSb290LFxuICBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zLFxufSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7XG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgTmdab25lLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgc2lnbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGVlcENsb25lTm9kZX0gZnJvbSAnLi9kb20vY2xvbmUtbm9kZSc7XG5pbXBvcnQge2FkanVzdERvbVJlY3QsIGdldE11dGFibGVDbGllbnRSZWN0fSBmcm9tICcuL2RvbS9kb20tcmVjdCc7XG5pbXBvcnQge1BhcmVudFBvc2l0aW9uVHJhY2tlcn0gZnJvbSAnLi9kb20vcGFyZW50LXBvc2l0aW9uLXRyYWNrZXInO1xuaW1wb3J0IHtnZXRSb290Tm9kZX0gZnJvbSAnLi9kb20vcm9vdC1ub2RlJztcbmltcG9ydCB7XG4gIERyYWdDU1NTdHlsZURlY2xhcmF0aW9uLFxuICBjb21iaW5lVHJhbnNmb3JtcyxcbiAgZ2V0VHJhbnNmb3JtLFxuICB0b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zLFxuICB0b2dnbGVWaXNpYmlsaXR5LFxufSBmcm9tICcuL2RvbS9zdHlsaW5nJztcbmltcG9ydCB7RHJhZ0Ryb3BSZWdpc3RyeX0gZnJvbSAnLi9kcmFnLWRyb3AtcmVnaXN0cnknO1xuaW1wb3J0IHR5cGUge0Ryb3BMaXN0UmVmfSBmcm9tICcuL2Ryb3AtbGlzdC1yZWYnO1xuaW1wb3J0IHtEcmFnUHJldmlld1RlbXBsYXRlLCBQcmV2aWV3UmVmfSBmcm9tICcuL3ByZXZpZXctcmVmJztcblxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgYmVoYXZpb3Igb2YgRHJhZ1JlZi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1JlZkNvbmZpZyB7XG4gIC8qKlxuICAgKiBNaW5pbXVtIGFtb3VudCBvZiBwaXhlbHMgdGhhdCB0aGUgdXNlciBzaG91bGRcbiAgICogZHJhZywgYmVmb3JlIHRoZSBDREsgaW5pdGlhdGVzIGEgZHJhZyBzZXF1ZW5jZS5cbiAgICovXG4gIGRyYWdTdGFydFRocmVzaG9sZDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBbW91bnQgdGhlIHBpeGVscyB0aGUgdXNlciBzaG91bGQgZHJhZyBiZWZvcmUgdGhlIENES1xuICAgKiBjb25zaWRlcnMgdGhlbSB0byBoYXZlIGNoYW5nZWQgdGhlIGRyYWcgZGlyZWN0aW9uLlxuICAgKi9cbiAgcG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZDogbnVtYmVyO1xuXG4gIC8qKiBgei1pbmRleGAgZm9yIHRoZSBhYnNvbHV0ZWx5LXBvc2l0aW9uZWQgZWxlbWVudHMgdGhhdCBhcmUgY3JlYXRlZCBieSB0aGUgZHJhZyBpdGVtLiAqL1xuICB6SW5kZXg/OiBudW1iZXI7XG5cbiAgLyoqIFJlZiB0aGF0IHRoZSBjdXJyZW50IGRyYWcgaXRlbSBpcyBuZXN0ZWQgaW4uICovXG4gIHBhcmVudERyYWdSZWY/OiBEcmFnUmVmO1xufVxuXG4vKiogT3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYSBwYXNzaXZlIGV2ZW50IGxpc3RlbmVyLiAqL1xuY29uc3QgcGFzc2l2ZUV2ZW50TGlzdGVuZXJPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7cGFzc2l2ZTogdHJ1ZX0pO1xuXG4vKiogT3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYW4gYWN0aXZlIGV2ZW50IGxpc3RlbmVyLiAqL1xuY29uc3QgYWN0aXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtwYXNzaXZlOiBmYWxzZX0pO1xuXG4vKiogRXZlbnQgb3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYW4gYWN0aXZlLCBjYXB0dXJpbmcgZXZlbnQuICovXG5jb25zdCBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtcbiAgcGFzc2l2ZTogZmFsc2UsXG4gIGNhcHR1cmU6IHRydWUsXG59KTtcblxuLyoqXG4gKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBmb3Igd2hpY2ggdG8gaWdub3JlIG1vdXNlIGV2ZW50cywgYWZ0ZXJcbiAqIHJlY2VpdmluZyBhIHRvdWNoIGV2ZW50LiBVc2VkIHRvIGF2b2lkIGRvaW5nIGRvdWJsZSB3b3JrIGZvclxuICogdG91Y2ggZGV2aWNlcyB3aGVyZSB0aGUgYnJvd3NlciBmaXJlcyBmYWtlIG1vdXNlIGV2ZW50cywgaW5cbiAqIGFkZGl0aW9uIHRvIHRvdWNoIGV2ZW50cy5cbiAqL1xuY29uc3QgTU9VU0VfRVZFTlRfSUdOT1JFX1RJTUUgPSA4MDA7XG5cbi8vIFRPRE8oY3Jpc2JldG8pOiBhZGQgYW4gQVBJIGZvciBtb3ZpbmcgYSBkcmFnZ2FibGUgdXAvZG93biB0aGVcbi8vIGxpc3QgcHJvZ3JhbW1hdGljYWxseS4gVXNlZnVsIGZvciBrZXlib2FyZCBjb250cm9scy5cblxuLyoqIFRlbXBsYXRlIHRoYXQgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGEgZHJhZyBoZWxwZXIgZWxlbWVudCAoZS5nLiBhIHByZXZpZXcgb3IgYSBwbGFjZWhvbGRlcikuICovXG5pbnRlcmZhY2UgRHJhZ0hlbHBlclRlbXBsYXRlPFQgPSBhbnk+IHtcbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFQ+IHwgbnVsbDtcbiAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZjtcbiAgY29udGV4dDogVDtcbn1cblxuLyoqIFBvaW50IG9uIHRoZSBwYWdlIG9yIHdpdGhpbiBhbiBlbGVtZW50LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG4vKiogSW5saW5lIHN0eWxlcyB0byBiZSBzZXQgYXMgYCFpbXBvcnRhbnRgIHdoaWxlIGRyYWdnaW5nLiAqL1xuY29uc3QgZHJhZ0ltcG9ydGFudFByb3BlcnRpZXMgPSBuZXcgU2V0KFtcbiAgLy8gTmVlZHMgdG8gYmUgaW1wb3J0YW50LCBiZWNhdXNlIHNvbWUgYG1hdC10YWJsZWAgc2V0cyBgcG9zaXRpb246IHN0aWNreSAhaW1wb3J0YW50YC4gU2VlICMyMjc4MS5cbiAgJ3Bvc2l0aW9uJyxcbl0pO1xuXG4vKipcbiAqIFBvc3NpYmxlIHBsYWNlcyBpbnRvIHdoaWNoIHRoZSBwcmV2aWV3IG9mIGEgZHJhZyBpdGVtIGNhbiBiZSBpbnNlcnRlZC5cbiAqIC0gYGdsb2JhbGAgLSBQcmV2aWV3IHdpbGwgYmUgaW5zZXJ0ZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgYDxib2R5PmAuIFRoZSBhZHZhbnRhZ2UgaXMgdGhhdFxuICogeW91IGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgYG92ZXJmbG93OiBoaWRkZW5gIG9yIGB6LWluZGV4YCwgYnV0IHRoZSBpdGVtIHdvbid0IHJldGFpblxuICogaXRzIGluaGVyaXRlZCBzdHlsZXMuXG4gKiAtIGBwYXJlbnRgIC0gUHJldmlldyB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIHBhcmVudCBvZiB0aGUgZHJhZyBpdGVtLiBUaGUgYWR2YW50YWdlIGlzIHRoYXRcbiAqIGluaGVyaXRlZCBzdHlsZXMgd2lsbCBiZSBwcmVzZXJ2ZWQsIGJ1dCBpdCBtYXkgYmUgY2xpcHBlZCBieSBgb3ZlcmZsb3c6IGhpZGRlbmAgb3Igbm90IGJlXG4gKiB2aXNpYmxlIGR1ZSB0byBgei1pbmRleGAuIEZ1cnRoZXJtb3JlLCB0aGUgcHJldmlldyBpcyBnb2luZyB0byBoYXZlIGFuIGVmZmVjdCBvdmVyIHNlbGVjdG9yc1xuICogbGlrZSBgOm50aC1jaGlsZGAgYW5kIHNvbWUgZmxleGJveCBjb25maWd1cmF0aW9ucy5cbiAqIC0gYEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnRgIC0gUHJldmlldyB3aWxsIGJlIGluc2VydGVkIGludG8gYSBzcGVjaWZpYyBlbGVtZW50LlxuICogU2FtZSBhZHZhbnRhZ2VzIGFuZCBkaXNhZHZhbnRhZ2VzIGFzIGBwYXJlbnRgLlxuICovXG5leHBvcnQgdHlwZSBQcmV2aWV3Q29udGFpbmVyID0gJ2dsb2JhbCcgfCAncGFyZW50JyB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnQ7XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIGEgZHJhZ2dhYmxlIGl0ZW0uIFVzZWQgdG8gbWFuaXB1bGF0ZSBvciBkaXNwb3NlIG9mIHRoZSBpdGVtLlxuICovXG5leHBvcnQgY2xhc3MgRHJhZ1JlZjxUID0gYW55PiB7XG4gIC8qKiBFbGVtZW50IGRpc3BsYXllZCBuZXh0IHRvIHRoZSB1c2VyJ3MgcG9pbnRlciB3aGlsZSB0aGUgZWxlbWVudCBpcyBkcmFnZ2VkLiAqL1xuICBwcml2YXRlIF9wcmV2aWV3OiBQcmV2aWV3UmVmIHwgbnVsbDtcblxuICAvKiogQ29udGFpbmVyIGludG8gd2hpY2ggdG8gaW5zZXJ0IHRoZSBwcmV2aWV3LiAqL1xuICBwcml2YXRlIF9wcmV2aWV3Q29udGFpbmVyOiBQcmV2aWV3Q29udGFpbmVyIHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHZpZXcgb2YgdGhlIHBsYWNlaG9sZGVyIGVsZW1lbnQuICovXG4gIHByaXZhdGUgX3BsYWNlaG9sZGVyUmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PiB8IG51bGw7XG5cbiAgLyoqIEVsZW1lbnQgdGhhdCBpcyByZW5kZXJlZCBpbnN0ZWFkIG9mIHRoZSBkcmFnZ2FibGUgaXRlbSB3aGlsZSBpdCBpcyBiZWluZyBzb3J0ZWQuICovXG4gIHByaXZhdGUgX3BsYWNlaG9sZGVyOiBIVE1MRWxlbWVudDtcblxuICAvKiogQ29vcmRpbmF0ZXMgd2l0aGluIHRoZSBlbGVtZW50IGF0IHdoaWNoIHRoZSB1c2VyIHBpY2tlZCB1cCB0aGUgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfcGlja3VwUG9zaXRpb25JbkVsZW1lbnQ6IFBvaW50O1xuXG4gIC8qKiBDb29yZGluYXRlcyBvbiB0aGUgcGFnZSBhdCB3aGljaCB0aGUgdXNlciBwaWNrZWQgdXAgdGhlIGVsZW1lbnQuICovXG4gIHByaXZhdGUgX3BpY2t1cFBvc2l0aW9uT25QYWdlOiBQb2ludDtcblxuICAvKipcbiAgICogQW5jaG9yIG5vZGUgdXNlZCB0byBzYXZlIHRoZSBwbGFjZSBpbiB0aGUgRE9NIHdoZXJlIHRoZSBlbGVtZW50IHdhc1xuICAgKiBwaWNrZWQgdXAgc28gdGhhdCBpdCBjYW4gYmUgcmVzdG9yZWQgYXQgdGhlIGVuZCBvZiB0aGUgZHJhZyBzZXF1ZW5jZS5cbiAgICovXG4gIHByaXZhdGUgX2FuY2hvcjogQ29tbWVudDtcblxuICAvKipcbiAgICogQ1NTIGB0cmFuc2Zvcm1gIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgd2hlbiBpdCBpc24ndCBiZWluZyBkcmFnZ2VkLiBXZSBuZWVkIGFcbiAgICogcGFzc2l2ZSB0cmFuc2Zvcm0gaW4gb3JkZXIgZm9yIHRoZSBkcmFnZ2VkIGVsZW1lbnQgdG8gcmV0YWluIGl0cyBuZXcgcG9zaXRpb25cbiAgICogYWZ0ZXIgdGhlIHVzZXIgaGFzIHN0b3BwZWQgZHJhZ2dpbmcgYW5kIGJlY2F1c2Ugd2UgbmVlZCB0byBrbm93IHRoZSByZWxhdGl2ZVxuICAgKiBwb3NpdGlvbiBpbiBjYXNlIHRoZXkgc3RhcnQgZHJhZ2dpbmcgYWdhaW4uIFRoaXMgY29ycmVzcG9uZHMgdG8gYGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtYC5cbiAgICovXG4gIHByaXZhdGUgX3Bhc3NpdmVUcmFuc2Zvcm06IFBvaW50ID0ge3g6IDAsIHk6IDB9O1xuXG4gIC8qKiBDU1MgYHRyYW5zZm9ybWAgdGhhdCBpcyBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IHdoaWxlIGl0J3MgYmVpbmcgZHJhZ2dlZC4gKi9cbiAgcHJpdmF0ZSBfYWN0aXZlVHJhbnNmb3JtOiBQb2ludCA9IHt4OiAwLCB5OiAwfTtcblxuICAvKiogSW5saW5lIGB0cmFuc2Zvcm1gIHZhbHVlIHRoYXQgdGhlIGVsZW1lbnQgaGFkIGJlZm9yZSB0aGUgZmlyc3QgZHJhZ2dpbmcgc2VxdWVuY2UuICovXG4gIHByaXZhdGUgX2luaXRpYWxUcmFuc2Zvcm0/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRyYWdnaW5nIHNlcXVlbmNlIGhhcyBiZWVuIHN0YXJ0ZWQuIERvZXNuJ3RcbiAgICogbmVjZXNzYXJpbHkgbWVhbiB0aGF0IHRoZSBlbGVtZW50IGhhcyBiZWVuIG1vdmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGFzU3RhcnRlZERyYWdnaW5nID0gc2lnbmFsKGZhbHNlKTtcblxuICAvKiogV2hldGhlciB0aGUgZWxlbWVudCBoYXMgbW92ZWQgc2luY2UgdGhlIHVzZXIgc3RhcnRlZCBkcmFnZ2luZyBpdC4gKi9cbiAgcHJpdmF0ZSBfaGFzTW92ZWQ6IGJvb2xlYW47XG5cbiAgLyoqIERyb3AgY29udGFpbmVyIGluIHdoaWNoIHRoZSBEcmFnUmVmIHJlc2lkZWQgd2hlbiBkcmFnZ2luZyBiZWdhbi4gKi9cbiAgcHJpdmF0ZSBfaW5pdGlhbENvbnRhaW5lcjogRHJvcExpc3RSZWY7XG5cbiAgLyoqIEluZGV4IGF0IHdoaWNoIHRoZSBpdGVtIHN0YXJ0ZWQgaW4gaXRzIGluaXRpYWwgY29udGFpbmVyLiAqL1xuICBwcml2YXRlIF9pbml0aWFsSW5kZXg6IG51bWJlcjtcblxuICAvKiogQ2FjaGVkIHBvc2l0aW9ucyBvZiBzY3JvbGxhYmxlIHBhcmVudCBlbGVtZW50cy4gKi9cbiAgcHJpdmF0ZSBfcGFyZW50UG9zaXRpb25zOiBQYXJlbnRQb3NpdGlvblRyYWNrZXI7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGl0ZW0gaXMgYmVpbmcgbW92ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX21vdmVFdmVudHMgPSBuZXcgU3ViamVjdDx7XG4gICAgc291cmNlOiBEcmFnUmVmO1xuICAgIHBvaW50ZXJQb3NpdGlvbjoge3g6IG51bWJlcjsgeTogbnVtYmVyfTtcbiAgICBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQ7XG4gICAgZGlzdGFuY2U6IFBvaW50O1xuICAgIGRlbHRhOiB7eDogLTEgfCAwIHwgMTsgeTogLTEgfCAwIHwgMX07XG4gIH0+KCk7XG5cbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHVzZXIgaXMgZHJhZ2dpbmcgYWxvbmcgZWFjaCBheGlzLiAqL1xuICBwcml2YXRlIF9wb2ludGVyRGlyZWN0aW9uRGVsdGE6IHt4OiAtMSB8IDAgfCAxOyB5OiAtMSB8IDAgfCAxfTtcblxuICAvKiogUG9pbnRlciBwb3NpdGlvbiBhdCB3aGljaCB0aGUgbGFzdCBjaGFuZ2UgaW4gdGhlIGRlbHRhIG9jY3VycmVkLiAqL1xuICBwcml2YXRlIF9wb2ludGVyUG9zaXRpb25BdExhc3REaXJlY3Rpb25DaGFuZ2U6IFBvaW50O1xuXG4gIC8qKiBQb3NpdGlvbiBvZiB0aGUgcG9pbnRlciBhdCB0aGUgbGFzdCBwb2ludGVyIGV2ZW50LiAqL1xuICBwcml2YXRlIF9sYXN0S25vd25Qb2ludGVyUG9zaXRpb246IFBvaW50O1xuXG4gIC8qKlxuICAgKiBSb290IERPTSBub2RlIG9mIHRoZSBkcmFnIGluc3RhbmNlLiBUaGlzIGlzIHRoZSBlbGVtZW50IHRoYXQgd2lsbFxuICAgKiBiZSBtb3ZlZCBhcm91bmQgYXMgdGhlIHVzZXIgaXMgZHJhZ2dpbmcuXG4gICAqL1xuICBwcml2YXRlIF9yb290RWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIE5lYXJlc3QgYW5jZXN0b3IgU1ZHLCByZWxhdGl2ZSB0byB3aGljaCBjb29yZGluYXRlcyBhcmUgY2FsY3VsYXRlZCBpZiBkcmFnZ2luZyBTVkdFbGVtZW50XG4gICAqL1xuICBwcml2YXRlIF9vd25lclNWR0VsZW1lbnQ6IFNWR1NWR0VsZW1lbnQgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBJbmxpbmUgc3R5bGUgdmFsdWUgb2YgYC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcmAgYXQgdGhlIHRpbWUgdGhlXG4gICAqIGRyYWdnaW5nIHdhcyBzdGFydGVkLiBVc2VkIHRvIHJlc3RvcmUgdGhlIHZhbHVlIG9uY2Ugd2UncmUgZG9uZSBkcmFnZ2luZy5cbiAgICovXG4gIHByaXZhdGUgX3Jvb3RFbGVtZW50VGFwSGlnaGxpZ2h0OiBzdHJpbmc7XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byBwb2ludGVyIG1vdmVtZW50IGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlck1vdmVTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0aGUgZXZlbnQgdGhhdCBpcyBkaXNwYXRjaGVkIHdoZW4gdGhlIHVzZXIgbGlmdHMgdGhlaXIgcG9pbnRlci4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclVwU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gdGhlIHZpZXdwb3J0IGJlaW5nIHNjcm9sbGVkLiAqL1xuICBwcml2YXRlIF9zY3JvbGxTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0aGUgdmlld3BvcnQgYmVpbmcgcmVzaXplZC4gKi9cbiAgcHJpdmF0ZSBfcmVzaXplU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBsYXN0IHRvdWNoIGV2ZW50IG9jY3VycmVkLiBVc2VkIHRvIGF2b2lkIGZpcmluZyB0aGUgc2FtZVxuICAgKiBldmVudHMgbXVsdGlwbGUgdGltZXMgb24gdG91Y2ggZGV2aWNlcyB3aGVyZSB0aGUgYnJvd3NlciB3aWxsIGZpcmUgYSBmYWtlXG4gICAqIG1vdXNlIGV2ZW50IGZvciBlYWNoIHRvdWNoIGV2ZW50LCBhZnRlciBhIGNlcnRhaW4gdGltZS5cbiAgICovXG4gIHByaXZhdGUgX2xhc3RUb3VjaEV2ZW50VGltZTogbnVtYmVyO1xuXG4gIC8qKiBUaW1lIGF0IHdoaWNoIHRoZSBsYXN0IGRyYWdnaW5nIHNlcXVlbmNlIHdhcyBzdGFydGVkLiAqL1xuICBwcml2YXRlIF9kcmFnU3RhcnRUaW1lOiBudW1iZXI7XG5cbiAgLyoqIENhY2hlZCByZWZlcmVuY2UgdG8gdGhlIGJvdW5kYXJ5IGVsZW1lbnQuICovXG4gIHByaXZhdGUgX2JvdW5kYXJ5RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogV2hldGhlciB0aGUgbmF0aXZlIGRyYWdnaW5nIGludGVyYWN0aW9ucyBoYXZlIGJlZW4gZW5hYmxlZCBvbiB0aGUgcm9vdCBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9uYXRpdmVJbnRlcmFjdGlvbnNFbmFibGVkID0gdHJ1ZTtcblxuICAvKiogQ2xpZW50IHJlY3Qgb2YgdGhlIHJvb3QgZWxlbWVudCB3aGVuIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZSBoYXMgc3RhcnRlZC4gKi9cbiAgcHJpdmF0ZSBfaW5pdGlhbERvbVJlY3Q/OiBET01SZWN0O1xuXG4gIC8qKiBDYWNoZWQgZGltZW5zaW9ucyBvZiB0aGUgcHJldmlldyBlbGVtZW50LiBTaG91bGQgYmUgcmVhZCB2aWEgYF9nZXRQcmV2aWV3UmVjdGAuICovXG4gIHByaXZhdGUgX3ByZXZpZXdSZWN0PzogRE9NUmVjdDtcblxuICAvKiogQ2FjaGVkIGRpbWVuc2lvbnMgb2YgdGhlIGJvdW5kYXJ5IGVsZW1lbnQuICovXG4gIHByaXZhdGUgX2JvdW5kYXJ5UmVjdD86IERPTVJlY3Q7XG5cbiAgLyoqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSB0byBjcmVhdGUgdGhlIGRyYWdnYWJsZSBpdGVtJ3MgcHJldmlldy4gKi9cbiAgcHJpdmF0ZSBfcHJldmlld1RlbXBsYXRlPzogRHJhZ1ByZXZpZXdUZW1wbGF0ZSB8IG51bGw7XG5cbiAgLyoqIFRlbXBsYXRlIGZvciBwbGFjZWhvbGRlciBlbGVtZW50IHJlbmRlcmVkIHRvIHNob3cgd2hlcmUgYSBkcmFnZ2FibGUgd291bGQgYmUgZHJvcHBlZC4gKi9cbiAgcHJpdmF0ZSBfcGxhY2Vob2xkZXJUZW1wbGF0ZT86IERyYWdIZWxwZXJUZW1wbGF0ZSB8IG51bGw7XG5cbiAgLyoqIEVsZW1lbnRzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZHJhZyB0aGUgZHJhZ2dhYmxlIGl0ZW0uICovXG4gIHByaXZhdGUgX2hhbmRsZXM6IEhUTUxFbGVtZW50W10gPSBbXTtcblxuICAvKiogUmVnaXN0ZXJlZCBoYW5kbGVzIHRoYXQgYXJlIGN1cnJlbnRseSBkaXNhYmxlZC4gKi9cbiAgcHJpdmF0ZSBfZGlzYWJsZWRIYW5kbGVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcblxuICAvKiogRHJvcHBhYmxlIGNvbnRhaW5lciB0aGF0IHRoZSBkcmFnZ2FibGUgaXMgYSBwYXJ0IG9mLiAqL1xuICBwcml2YXRlIF9kcm9wQ29udGFpbmVyPzogRHJvcExpc3RSZWY7XG5cbiAgLyoqIExheW91dCBkaXJlY3Rpb24gb2YgdGhlIGl0ZW0uICovXG4gIHByaXZhdGUgX2RpcmVjdGlvbjogRGlyZWN0aW9uID0gJ2x0cic7XG5cbiAgLyoqIFJlZiB0aGF0IHRoZSBjdXJyZW50IGRyYWcgaXRlbSBpcyBuZXN0ZWQgaW4uICovXG4gIHByaXZhdGUgX3BhcmVudERyYWdSZWY6IERyYWdSZWY8dW5rbm93bj4gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBDYWNoZWQgc2hhZG93IHJvb3QgdGhhdCB0aGUgZWxlbWVudCBpcyBwbGFjZWQgaW4uIGBudWxsYCBtZWFucyB0aGF0IHRoZSBlbGVtZW50IGlzbid0IGluXG4gICAqIHRoZSBzaGFkb3cgRE9NIGFuZCBgdW5kZWZpbmVkYCBtZWFucyB0aGF0IGl0IGhhc24ndCBiZWVuIHJlc29sdmVkIHlldC4gU2hvdWxkIGJlIHJlYWQgdmlhXG4gICAqIGBfZ2V0U2hhZG93Um9vdGAsIG5vdCBkaXJlY3RseS5cbiAgICovXG4gIHByaXZhdGUgX2NhY2hlZFNoYWRvd1Jvb3Q6IFNoYWRvd1Jvb3QgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBBeGlzIGFsb25nIHdoaWNoIGRyYWdnaW5nIGlzIGxvY2tlZC4gKi9cbiAgbG9ja0F4aXM6ICd4JyB8ICd5JztcblxuICAvKipcbiAgICogQW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGFmdGVyIHRoZSB1c2VyIGhhcyBwdXQgdGhlaXJcbiAgICogcG9pbnRlciBkb3duIGJlZm9yZSBzdGFydGluZyB0byBkcmFnIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgZHJhZ1N0YXJ0RGVsYXk6IG51bWJlciB8IHt0b3VjaDogbnVtYmVyOyBtb3VzZTogbnVtYmVyfSA9IDA7XG5cbiAgLyoqIENsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBwcmV2aWV3IGVsZW1lbnQuICovXG4gIHByZXZpZXdDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIElmIHRoZSBwYXJlbnQgb2YgdGhlIGRyYWdnZWQgZWxlbWVudCBoYXMgYSBgc2NhbGVgIHRyYW5zZm9ybSwgaXQgY2FuIHRocm93IG9mZiB0aGVcbiAgICogcG9zaXRpb25pbmcgd2hlbiB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcuIFVzZSB0aGlzIGlucHV0IHRvIG5vdGlmeSB0aGUgQ0RLIG9mIHRoZSBzY2FsZS5cbiAgICovXG4gIHNjYWxlOiBudW1iZXIgPSAxO1xuXG4gIC8qKiBXaGV0aGVyIHN0YXJ0aW5nIHRvIGRyYWcgdGhpcyBlbGVtZW50IGlzIGRpc2FibGVkLiAqL1xuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkIHx8ICEhKHRoaXMuX2Ryb3BDb250YWluZXIgJiYgdGhpcy5fZHJvcENvbnRhaW5lci5kaXNhYmxlZCk7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgICAgIHRoaXMuX3RvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoKTtcbiAgICAgIHRoaXMuX2hhbmRsZXMuZm9yRWFjaChoYW5kbGUgPT4gdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhoYW5kbGUsIHZhbHVlKSk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIEVtaXRzIGFzIHRoZSBkcmFnIHNlcXVlbmNlIGlzIGJlaW5nIHByZXBhcmVkLiAqL1xuICByZWFkb25seSBiZWZvcmVTdGFydGVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgdGhlIGl0ZW0uICovXG4gIHJlYWRvbmx5IHN0YXJ0ZWQgPSBuZXcgU3ViamVjdDx7c291cmNlOiBEcmFnUmVmOyBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnR9PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGhhcyByZWxlYXNlZCBhIGRyYWcgaXRlbSwgYmVmb3JlIGFueSBhbmltYXRpb25zIGhhdmUgc3RhcnRlZC4gKi9cbiAgcmVhZG9ubHkgcmVsZWFzZWQgPSBuZXcgU3ViamVjdDx7c291cmNlOiBEcmFnUmVmOyBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnR9PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHN0b3BzIGRyYWdnaW5nIGFuIGl0ZW0gaW4gdGhlIGNvbnRhaW5lci4gKi9cbiAgcmVhZG9ubHkgZW5kZWQgPSBuZXcgU3ViamVjdDx7XG4gICAgc291cmNlOiBEcmFnUmVmO1xuICAgIGRpc3RhbmNlOiBQb2ludDtcbiAgICBkcm9wUG9pbnQ6IFBvaW50O1xuICAgIGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudDtcbiAgfT4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBoYXMgbW92ZWQgdGhlIGl0ZW0gaW50byBhIG5ldyBjb250YWluZXIuICovXG4gIHJlYWRvbmx5IGVudGVyZWQgPSBuZXcgU3ViamVjdDx7Y29udGFpbmVyOiBEcm9wTGlzdFJlZjsgaXRlbTogRHJhZ1JlZjsgY3VycmVudEluZGV4OiBudW1iZXJ9PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHJlbW92ZXMgdGhlIGl0ZW0gaXRzIGNvbnRhaW5lciBieSBkcmFnZ2luZyBpdCBpbnRvIGFub3RoZXIgY29udGFpbmVyLiAqL1xuICByZWFkb25seSBleGl0ZWQgPSBuZXcgU3ViamVjdDx7Y29udGFpbmVyOiBEcm9wTGlzdFJlZjsgaXRlbTogRHJhZ1JlZn0+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgZHJvcHMgdGhlIGl0ZW0gaW5zaWRlIGEgY29udGFpbmVyLiAqL1xuICByZWFkb25seSBkcm9wcGVkID0gbmV3IFN1YmplY3Q8e1xuICAgIHByZXZpb3VzSW5kZXg6IG51bWJlcjtcbiAgICBjdXJyZW50SW5kZXg6IG51bWJlcjtcbiAgICBpdGVtOiBEcmFnUmVmO1xuICAgIGNvbnRhaW5lcjogRHJvcExpc3RSZWY7XG4gICAgcHJldmlvdXNDb250YWluZXI6IERyb3BMaXN0UmVmO1xuICAgIGRpc3RhbmNlOiBQb2ludDtcbiAgICBkcm9wUG9pbnQ6IFBvaW50O1xuICAgIGlzUG9pbnRlck92ZXJDb250YWluZXI6IGJvb2xlYW47XG4gICAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50O1xuICB9PigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhcyB0aGUgdXNlciBpcyBkcmFnZ2luZyB0aGUgaXRlbS4gVXNlIHdpdGggY2F1dGlvbixcbiAgICogYmVjYXVzZSB0aGlzIGV2ZW50IHdpbGwgZmlyZSBmb3IgZXZlcnkgcGl4ZWwgdGhhdCB0aGUgdXNlciBoYXMgZHJhZ2dlZC5cbiAgICovXG4gIHJlYWRvbmx5IG1vdmVkOiBPYnNlcnZhYmxlPHtcbiAgICBzb3VyY2U6IERyYWdSZWY7XG4gICAgcG9pbnRlclBvc2l0aW9uOiB7eDogbnVtYmVyOyB5OiBudW1iZXJ9O1xuICAgIGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudDtcbiAgICBkaXN0YW5jZTogUG9pbnQ7XG4gICAgZGVsdGE6IHt4OiAtMSB8IDAgfCAxOyB5OiAtMSB8IDAgfCAxfTtcbiAgfT4gPSB0aGlzLl9tb3ZlRXZlbnRzO1xuXG4gIC8qKiBBcmJpdHJhcnkgZGF0YSB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byB0aGUgZHJhZyBpdGVtLiAqL1xuICBkYXRhOiBUO1xuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgbG9naWMgb2YgaG93IHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyBpdGVtXG4gICAqIGlzIGxpbWl0ZWQgd2hpbGUgaXQncyBiZWluZyBkcmFnZ2VkLiBHZXRzIGNhbGxlZCB3aXRoIGEgcG9pbnQgY29udGFpbmluZyB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgKiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgb24gdGhlIHBhZ2UsIGEgcmVmZXJlbmNlIHRvIHRoZSBpdGVtIGJlaW5nIGRyYWdnZWQgYW5kIGl0cyBkaW1lbnNpb25zLlxuICAgKiBTaG91bGQgcmV0dXJuIGEgcG9pbnQgZGVzY3JpYmluZyB3aGVyZSB0aGUgaXRlbSBzaG91bGQgYmUgcmVuZGVyZWQuXG4gICAqL1xuICBjb25zdHJhaW5Qb3NpdGlvbj86IChcbiAgICB1c2VyUG9pbnRlclBvc2l0aW9uOiBQb2ludCxcbiAgICBkcmFnUmVmOiBEcmFnUmVmLFxuICAgIGRpbWVuc2lvbnM6IERPTVJlY3QsXG4gICAgcGlja3VwUG9zaXRpb25JbkVsZW1lbnQ6IFBvaW50LFxuICApID0+IFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnQsXG4gICAgcHJpdmF0ZSBfY29uZmlnOiBEcmFnUmVmQ29uZmlnLFxuICAgIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLFxuICAgIHByaXZhdGUgX2RyYWdEcm9wUmVnaXN0cnk6IERyYWdEcm9wUmVnaXN0cnksXG4gICkge1xuICAgIHRoaXMud2l0aFJvb3RFbGVtZW50KGVsZW1lbnQpLndpdGhQYXJlbnQoX2NvbmZpZy5wYXJlbnREcmFnUmVmIHx8IG51bGwpO1xuICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucyA9IG5ldyBQYXJlbnRQb3NpdGlvblRyYWNrZXIoX2RvY3VtZW50KTtcbiAgICBfZHJhZ0Ryb3BSZWdpc3RyeS5yZWdpc3RlckRyYWdJdGVtKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVsZW1lbnQgdGhhdCBpcyBiZWluZyB1c2VkIGFzIGEgcGxhY2Vob2xkZXJcbiAgICogd2hpbGUgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBiZWluZyBkcmFnZ2VkLlxuICAgKi9cbiAgZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgcm9vdCBkcmFnZ2FibGUgZWxlbWVudC4gKi9cbiAgZ2V0Um9vdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9yb290RWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50bHktdmlzaWJsZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyB0aGUgZHJhZyBpdGVtLlxuICAgKiBXaGlsZSBkcmFnZ2luZyB0aGlzIGlzIHRoZSBwbGFjZWhvbGRlciwgb3RoZXJ3aXNlIGl0J3MgdGhlIHJvb3QgZWxlbWVudC5cbiAgICovXG4gIGdldFZpc2libGVFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5pc0RyYWdnaW5nKCkgPyB0aGlzLmdldFBsYWNlaG9sZGVyRWxlbWVudCgpIDogdGhpcy5nZXRSb290RWxlbWVudCgpO1xuICB9XG5cbiAgLyoqIFJlZ2lzdGVycyB0aGUgaGFuZGxlcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRyYWcgdGhlIGVsZW1lbnQuICovXG4gIHdpdGhIYW5kbGVzKGhhbmRsZXM6IChIVE1MRWxlbWVudCB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KVtdKTogdGhpcyB7XG4gICAgdGhpcy5faGFuZGxlcyA9IGhhbmRsZXMubWFwKGhhbmRsZSA9PiBjb2VyY2VFbGVtZW50KGhhbmRsZSkpO1xuICAgIHRoaXMuX2hhbmRsZXMuZm9yRWFjaChoYW5kbGUgPT4gdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhoYW5kbGUsIHRoaXMuZGlzYWJsZWQpKTtcbiAgICB0aGlzLl90b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zKCk7XG5cbiAgICAvLyBEZWxldGUgYW55IGxpbmdlcmluZyBkaXNhYmxlZCBoYW5kbGVzIHRoYXQgbWF5IGhhdmUgYmVlbiBkZXN0cm95ZWQuIE5vdGUgdGhhdCB3ZSByZS1jcmVhdGVcbiAgICAvLyB0aGUgc2V0LCByYXRoZXIgdGhhbiBpdGVyYXRlIG92ZXIgaXQgYW5kIGZpbHRlciBvdXQgdGhlIGRlc3Ryb3llZCBoYW5kbGVzLCBiZWNhdXNlIHdoaWxlXG4gICAgLy8gdGhlIEVTIHNwZWMgYWxsb3dzIGZvciBzZXRzIHRvIGJlIG1vZGlmaWVkIHdoaWxlIHRoZXkncmUgYmVpbmcgaXRlcmF0ZWQgb3Zlciwgc29tZSBwb2x5ZmlsbHNcbiAgICAvLyB1c2UgYW4gYXJyYXkgaW50ZXJuYWxseSB3aGljaCBtYXkgdGhyb3cgYW4gZXJyb3IuXG4gICAgY29uc3QgZGlzYWJsZWRIYW5kbGVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcbiAgICB0aGlzLl9kaXNhYmxlZEhhbmRsZXMuZm9yRWFjaChoYW5kbGUgPT4ge1xuICAgICAgaWYgKHRoaXMuX2hhbmRsZXMuaW5kZXhPZihoYW5kbGUpID4gLTEpIHtcbiAgICAgICAgZGlzYWJsZWRIYW5kbGVzLmFkZChoYW5kbGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcyA9IGRpc2FibGVkSGFuZGxlcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIHRlbXBsYXRlIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIHRoZSBkcmFnIHByZXZpZXcuXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZSBUZW1wbGF0ZSB0aGF0IGZyb20gd2hpY2ggdG8gc3RhbXAgb3V0IHRoZSBwcmV2aWV3LlxuICAgKi9cbiAgd2l0aFByZXZpZXdUZW1wbGF0ZSh0ZW1wbGF0ZTogRHJhZ1ByZXZpZXdUZW1wbGF0ZSB8IG51bGwpOiB0aGlzIHtcbiAgICB0aGlzLl9wcmV2aWV3VGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIHRlbXBsYXRlIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIHRoZSBkcmFnIHBsYWNlaG9sZGVyLlxuICAgKiBAcGFyYW0gdGVtcGxhdGUgVGVtcGxhdGUgdGhhdCBmcm9tIHdoaWNoIHRvIHN0YW1wIG91dCB0aGUgcGxhY2Vob2xkZXIuXG4gICAqL1xuICB3aXRoUGxhY2Vob2xkZXJUZW1wbGF0ZSh0ZW1wbGF0ZTogRHJhZ0hlbHBlclRlbXBsYXRlIHwgbnVsbCk6IHRoaXMge1xuICAgIHRoaXMuX3BsYWNlaG9sZGVyVGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGFsdGVybmF0ZSBkcmFnIHJvb3QgZWxlbWVudC4gVGhlIHJvb3QgZWxlbWVudCBpcyB0aGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgbW92ZWQgYXNcbiAgICogdGhlIHVzZXIgaXMgZHJhZ2dpbmcuIFBhc3NpbmcgYW4gYWx0ZXJuYXRlIHJvb3QgZWxlbWVudCBpcyB1c2VmdWwgd2hlbiB0cnlpbmcgdG8gZW5hYmxlXG4gICAqIGRyYWdnaW5nIG9uIGFuIGVsZW1lbnQgdGhhdCB5b3UgbWlnaHQgbm90IGhhdmUgYWNjZXNzIHRvLlxuICAgKi9cbiAgd2l0aFJvb3RFbGVtZW50KHJvb3RFbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgY29uc3QgZWxlbWVudCA9IGNvZXJjZUVsZW1lbnQocm9vdEVsZW1lbnQpO1xuXG4gICAgaWYgKGVsZW1lbnQgIT09IHRoaXMuX3Jvb3RFbGVtZW50KSB7XG4gICAgICBpZiAodGhpcy5fcm9vdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlUm9vdEVsZW1lbnRMaXN0ZW5lcnModGhpcy5fcm9vdEVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX3BvaW50ZXJEb3duLCBwYXNzaXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuX25hdGl2ZURyYWdTdGFydCwgYWN0aXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9pbml0aWFsVHJhbnNmb3JtID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcm9vdEVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgU1ZHRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5fcm9vdEVsZW1lbnQgaW5zdGFuY2VvZiBTVkdFbGVtZW50KSB7XG4gICAgICB0aGlzLl9vd25lclNWR0VsZW1lbnQgPSB0aGlzLl9yb290RWxlbWVudC5vd25lclNWR0VsZW1lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRWxlbWVudCB0byB3aGljaCB0aGUgZHJhZ2dhYmxlJ3MgcG9zaXRpb24gd2lsbCBiZSBjb25zdHJhaW5lZC5cbiAgICovXG4gIHdpdGhCb3VuZGFyeUVsZW1lbnQoYm91bmRhcnlFbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50IHwgbnVsbCk6IHRoaXMge1xuICAgIHRoaXMuX2JvdW5kYXJ5RWxlbWVudCA9IGJvdW5kYXJ5RWxlbWVudCA/IGNvZXJjZUVsZW1lbnQoYm91bmRhcnlFbGVtZW50KSA6IG51bGw7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgaWYgKGJvdW5kYXJ5RWxlbWVudCkge1xuICAgICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uID0gdGhpcy5fdmlld3BvcnRSdWxlclxuICAgICAgICAuY2hhbmdlKDEwKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2NvbnRhaW5JbnNpZGVCb3VuZGFyeU9uUmVzaXplKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBwYXJlbnQgcmVmIHRoYXQgdGhlIHJlZiBpcyBuZXN0ZWQgaW4uICAqL1xuICB3aXRoUGFyZW50KHBhcmVudDogRHJhZ1JlZjx1bmtub3duPiB8IG51bGwpOiB0aGlzIHtcbiAgICB0aGlzLl9wYXJlbnREcmFnUmVmID0gcGFyZW50O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgdGhlIGRyYWdnaW5nIGZ1bmN0aW9uYWxpdHkgZnJvbSB0aGUgRE9NIGVsZW1lbnQuICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcmVtb3ZlUm9vdEVsZW1lbnRMaXN0ZW5lcnModGhpcy5fcm9vdEVsZW1lbnQpO1xuXG4gICAgLy8gRG8gdGhpcyBjaGVjayBiZWZvcmUgcmVtb3ZpbmcgZnJvbSB0aGUgcmVnaXN0cnkgc2luY2UgaXQnbGxcbiAgICAvLyBzdG9wIGJlaW5nIGNvbnNpZGVyZWQgYXMgZHJhZ2dlZCBvbmNlIGl0IGlzIHJlbW92ZWQuXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZygpKSB7XG4gICAgICAvLyBTaW5jZSB3ZSBtb3ZlIG91dCB0aGUgZWxlbWVudCB0byB0aGUgZW5kIG9mIHRoZSBib2R5IHdoaWxlIGl0J3MgYmVpbmdcbiAgICAgIC8vIGRyYWdnZWQsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgaXQncyByZW1vdmVkIGlmIGl0IGdldHMgZGVzdHJveWVkLlxuICAgICAgdGhpcy5fcm9vdEVsZW1lbnQ/LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2FuY2hvcj8ucmVtb3ZlKCk7XG4gICAgdGhpcy5fZGVzdHJveVByZXZpZXcoKTtcbiAgICB0aGlzLl9kZXN0cm95UGxhY2Vob2xkZXIoKTtcbiAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnJlbW92ZURyYWdJdGVtKHRoaXMpO1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuICAgIHRoaXMuYmVmb3JlU3RhcnRlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuc3RhcnRlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMucmVsZWFzZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmVuZGVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5lbnRlcmVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5leGl0ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmRyb3BwZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLl9tb3ZlRXZlbnRzLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5faGFuZGxlcyA9IFtdO1xuICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcy5jbGVhcigpO1xuICAgIHRoaXMuX2Ryb3BDb250YWluZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcGFyZW50UG9zaXRpb25zLmNsZWFyKCk7XG4gICAgdGhpcy5fYm91bmRhcnlFbGVtZW50ID1cbiAgICAgIHRoaXMuX3Jvb3RFbGVtZW50ID1cbiAgICAgIHRoaXMuX293bmVyU1ZHRWxlbWVudCA9XG4gICAgICB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlID1cbiAgICAgIHRoaXMuX3ByZXZpZXdUZW1wbGF0ZSA9XG4gICAgICB0aGlzLl9hbmNob3IgPVxuICAgICAgdGhpcy5fcGFyZW50RHJhZ1JlZiA9XG4gICAgICAgIG51bGwhO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLiAqL1xuICBpc0RyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGFydGVkRHJhZ2dpbmcoKSAmJiB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LmlzRHJhZ2dpbmcodGhpcyk7XG4gIH1cblxuICAvKiogUmVzZXRzIGEgc3RhbmRhbG9uZSBkcmFnIGl0ZW0gdG8gaXRzIGluaXRpYWwgcG9zaXRpb24uICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3Jvb3RFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHRoaXMuX2luaXRpYWxUcmFuc2Zvcm0gfHwgJyc7XG4gICAgdGhpcy5fYWN0aXZlVHJhbnNmb3JtID0ge3g6IDAsIHk6IDB9O1xuICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0gPSB7eDogMCwgeTogMH07XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIGhhbmRsZSBhcyBkaXNhYmxlZC4gV2hpbGUgYSBoYW5kbGUgaXMgZGlzYWJsZWQsIGl0J2xsIGNhcHR1cmUgYW5kIGludGVycnVwdCBkcmFnZ2luZy5cbiAgICogQHBhcmFtIGhhbmRsZSBIYW5kbGUgZWxlbWVudCB0aGF0IHNob3VsZCBiZSBkaXNhYmxlZC5cbiAgICovXG4gIGRpc2FibGVIYW5kbGUoaGFuZGxlOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghdGhpcy5fZGlzYWJsZWRIYW5kbGVzLmhhcyhoYW5kbGUpICYmIHRoaXMuX2hhbmRsZXMuaW5kZXhPZihoYW5kbGUpID4gLTEpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcy5hZGQoaGFuZGxlKTtcbiAgICAgIHRvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoaGFuZGxlLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlcyBhIGhhbmRsZSwgaWYgaXQgaGFzIGJlZW4gZGlzYWJsZWQuXG4gICAqIEBwYXJhbSBoYW5kbGUgSGFuZGxlIGVsZW1lbnQgdG8gYmUgZW5hYmxlZC5cbiAgICovXG4gIGVuYWJsZUhhbmRsZShoYW5kbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkSGFuZGxlcy5oYXMoaGFuZGxlKSkge1xuICAgICAgdGhpcy5fZGlzYWJsZWRIYW5kbGVzLmRlbGV0ZShoYW5kbGUpO1xuICAgICAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhoYW5kbGUsIHRoaXMuZGlzYWJsZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBsYXlvdXQgZGlyZWN0aW9uIG9mIHRoZSBkcmFnZ2FibGUgaXRlbS4gKi9cbiAgd2l0aERpcmVjdGlvbihkaXJlY3Rpb246IERpcmVjdGlvbik6IHRoaXMge1xuICAgIHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBjb250YWluZXIgdGhhdCB0aGUgaXRlbSBpcyBwYXJ0IG9mLiAqL1xuICBfd2l0aERyb3BDb250YWluZXIoY29udGFpbmVyOiBEcm9wTGlzdFJlZikge1xuICAgIHRoaXMuX2Ryb3BDb250YWluZXIgPSBjb250YWluZXI7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBwb3NpdGlvbiBpbiBwaXhlbHMgdGhlIGRyYWdnYWJsZSBvdXRzaWRlIG9mIGEgZHJvcCBjb250YWluZXIuXG4gICAqL1xuICBnZXRGcmVlRHJhZ1Bvc2l0aW9uKCk6IFJlYWRvbmx5PFBvaW50PiB7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmlzRHJhZ2dpbmcoKSA/IHRoaXMuX2FjdGl2ZVRyYW5zZm9ybSA6IHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm07XG4gICAgcmV0dXJuIHt4OiBwb3NpdGlvbi54LCB5OiBwb3NpdGlvbi55fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHBpeGVscyB0aGUgZHJhZ2dhYmxlIG91dHNpZGUgb2YgYSBkcm9wIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHZhbHVlIE5ldyBwb3NpdGlvbiB0byBiZSBzZXQuXG4gICAqL1xuICBzZXRGcmVlRHJhZ1Bvc2l0aW9uKHZhbHVlOiBQb2ludCk6IHRoaXMge1xuICAgIHRoaXMuX2FjdGl2ZVRyYW5zZm9ybSA9IHt4OiAwLCB5OiAwfTtcbiAgICB0aGlzLl9wYXNzaXZlVHJhbnNmb3JtLnggPSB2YWx1ZS54O1xuICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueSA9IHZhbHVlLnk7XG5cbiAgICBpZiAoIXRoaXMuX2Ryb3BDb250YWluZXIpIHtcbiAgICAgIHRoaXMuX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm0odmFsdWUueCwgdmFsdWUueSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29udGFpbmVyIGludG8gd2hpY2ggdG8gaW5zZXJ0IHRoZSBwcmV2aWV3IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB2YWx1ZSBDb250YWluZXIgaW50byB3aGljaCB0byBpbnNlcnQgdGhlIHByZXZpZXcuXG4gICAqL1xuICB3aXRoUHJldmlld0NvbnRhaW5lcih2YWx1ZTogUHJldmlld0NvbnRhaW5lcik6IHRoaXMge1xuICAgIHRoaXMuX3ByZXZpZXdDb250YWluZXIgPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBpdGVtJ3Mgc29ydCBvcmRlciBiYXNlZCBvbiB0aGUgbGFzdC1rbm93biBwb2ludGVyIHBvc2l0aW9uLiAqL1xuICBfc29ydEZyb21MYXN0UG9pbnRlclBvc2l0aW9uKCkge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5fbGFzdEtub3duUG9pbnRlclBvc2l0aW9uO1xuXG4gICAgaWYgKHBvc2l0aW9uICYmIHRoaXMuX2Ryb3BDb250YWluZXIpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZURyb3BDb250YWluZXIodGhpcy5fZ2V0Q29uc3RyYWluZWRQb2ludGVyUG9zaXRpb24ocG9zaXRpb24pLCBwb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVuc3Vic2NyaWJlcyBmcm9tIHRoZSBnbG9iYWwgc3Vic2NyaXB0aW9ucy4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuX3BvaW50ZXJNb3ZlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcG9pbnRlclVwU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fc2Nyb2xsU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fZ2V0U2hhZG93Um9vdCgpPy5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgJ3NlbGVjdHN0YXJ0JyxcbiAgICAgIHNoYWRvd0RvbVNlbGVjdFN0YXJ0LFxuICAgICAgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zLFxuICAgICk7XG4gIH1cblxuICAvKiogRGVzdHJveXMgdGhlIHByZXZpZXcgZWxlbWVudCBhbmQgaXRzIFZpZXdSZWYuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lQcmV2aWV3KCkge1xuICAgIHRoaXMuX3ByZXZpZXc/LmRlc3Ryb3koKTtcbiAgICB0aGlzLl9wcmV2aWV3ID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBEZXN0cm95cyB0aGUgcGxhY2Vob2xkZXIgZWxlbWVudCBhbmQgaXRzIFZpZXdSZWYuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lQbGFjZWhvbGRlcigpIHtcbiAgICB0aGlzLl9wbGFjZWhvbGRlcj8ucmVtb3ZlKCk7XG4gICAgdGhpcy5fcGxhY2Vob2xkZXJSZWY/LmRlc3Ryb3koKTtcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHRoaXMuX3BsYWNlaG9sZGVyUmVmID0gbnVsbCE7XG4gIH1cblxuICAvKiogSGFuZGxlciBmb3IgdGhlIGBtb3VzZWRvd25gL2B0b3VjaHN0YXJ0YCBldmVudHMuICovXG4gIHByaXZhdGUgX3BvaW50ZXJEb3duID0gKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuICAgIHRoaXMuYmVmb3JlU3RhcnRlZC5uZXh0KCk7XG5cbiAgICAvLyBEZWxlZ2F0ZSB0aGUgZXZlbnQgYmFzZWQgb24gd2hldGhlciBpdCBzdGFydGVkIGZyb20gYSBoYW5kbGUgb3IgdGhlIGVsZW1lbnQgaXRzZWxmLlxuICAgIGlmICh0aGlzLl9oYW5kbGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0SGFuZGxlID0gdGhpcy5fZ2V0VGFyZ2V0SGFuZGxlKGV2ZW50KTtcblxuICAgICAgaWYgKHRhcmdldEhhbmRsZSAmJiAhdGhpcy5fZGlzYWJsZWRIYW5kbGVzLmhhcyh0YXJnZXRIYW5kbGUpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVEcmFnU2VxdWVuY2UodGFyZ2V0SGFuZGxlLCBldmVudCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZURyYWdTZXF1ZW5jZSh0aGlzLl9yb290RWxlbWVudCwgZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICAvKiogSGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGVpciBwb2ludGVyIGFmdGVyIHRoZXkndmUgaW5pdGlhdGVkIGEgZHJhZy4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlck1vdmUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG4gICAgY29uc3QgcG9pbnRlclBvc2l0aW9uID0gdGhpcy5fZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50KTtcblxuICAgIGlmICghdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nKCkpIHtcbiAgICAgIGNvbnN0IGRpc3RhbmNlWCA9IE1hdGguYWJzKHBvaW50ZXJQb3NpdGlvbi54IC0gdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueCk7XG4gICAgICBjb25zdCBkaXN0YW5jZVkgPSBNYXRoLmFicyhwb2ludGVyUG9zaXRpb24ueSAtIHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlLnkpO1xuICAgICAgY29uc3QgaXNPdmVyVGhyZXNob2xkID0gZGlzdGFuY2VYICsgZGlzdGFuY2VZID49IHRoaXMuX2NvbmZpZy5kcmFnU3RhcnRUaHJlc2hvbGQ7XG5cbiAgICAgIC8vIE9ubHkgc3RhcnQgZHJhZ2dpbmcgYWZ0ZXIgdGhlIHVzZXIgaGFzIG1vdmVkIG1vcmUgdGhhbiB0aGUgbWluaW11bSBkaXN0YW5jZSBpbiBlaXRoZXJcbiAgICAgIC8vIGRpcmVjdGlvbi4gTm90ZSB0aGF0IHRoaXMgaXMgcHJlZmVyYWJsZSBvdmVyIGRvaW5nIHNvbWV0aGluZyBsaWtlIGBza2lwKG1pbmltdW1EaXN0YW5jZSlgXG4gICAgICAvLyBpbiB0aGUgYHBvaW50ZXJNb3ZlYCBzdWJzY3JpcHRpb24sIGJlY2F1c2Ugd2UncmUgbm90IGd1YXJhbnRlZWQgdG8gaGF2ZSBvbmUgbW92ZSBldmVudFxuICAgICAgLy8gcGVyIHBpeGVsIG9mIG1vdmVtZW50IChlLmcuIGlmIHRoZSB1c2VyIG1vdmVzIHRoZWlyIHBvaW50ZXIgcXVpY2tseSkuXG4gICAgICBpZiAoaXNPdmVyVGhyZXNob2xkKSB7XG4gICAgICAgIGNvbnN0IGlzRGVsYXlFbGFwc2VkID0gRGF0ZS5ub3coKSA+PSB0aGlzLl9kcmFnU3RhcnRUaW1lICsgdGhpcy5fZ2V0RHJhZ1N0YXJ0RGVsYXkoZXZlbnQpO1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9kcm9wQ29udGFpbmVyO1xuXG4gICAgICAgIGlmICghaXNEZWxheUVsYXBzZWQpIHtcbiAgICAgICAgICB0aGlzLl9lbmREcmFnU2VxdWVuY2UoZXZlbnQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFByZXZlbnQgb3RoZXIgZHJhZyBzZXF1ZW5jZXMgZnJvbSBzdGFydGluZyB3aGlsZSBzb21ldGhpbmcgaW4gdGhlIGNvbnRhaW5lciBpcyBzdGlsbFxuICAgICAgICAvLyBiZWluZyBkcmFnZ2VkLiBUaGlzIGNhbiBoYXBwZW4gd2hpbGUgd2UncmUgd2FpdGluZyBmb3IgdGhlIGRyb3AgYW5pbWF0aW9uIHRvIGZpbmlzaFxuICAgICAgICAvLyBhbmQgY2FuIGNhdXNlIGVycm9ycywgYmVjYXVzZSBzb21lIGVsZW1lbnRzIG1pZ2h0IHN0aWxsIGJlIG1vdmluZyBhcm91bmQuXG4gICAgICAgIGlmICghY29udGFpbmVyIHx8ICghY29udGFpbmVyLmlzRHJhZ2dpbmcoKSAmJiAhY29udGFpbmVyLmlzUmVjZWl2aW5nKCkpKSB7XG4gICAgICAgICAgLy8gUHJldmVudCB0aGUgZGVmYXVsdCBhY3Rpb24gYXMgc29vbiBhcyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UgaXMgY29uc2lkZXJlZCBhc1xuICAgICAgICAgIC8vIFwic3RhcnRlZFwiIHNpbmNlIHdhaXRpbmcgZm9yIHRoZSBuZXh0IGV2ZW50IGNhbiBhbGxvdyB0aGUgZGV2aWNlIHRvIGJlZ2luIHNjcm9sbGluZy5cbiAgICAgICAgICBpZiAoZXZlbnQuY2FuY2VsYWJsZSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nLnNldCh0cnVlKTtcbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuX3N0YXJ0RHJhZ1NlcXVlbmNlKGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdlIHByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIGRvd24gaGVyZSBzbyB0aGF0IHdlIGtub3cgdGhhdCBkcmFnZ2luZyBoYXMgc3RhcnRlZC4gVGhpcyBpc1xuICAgIC8vIGltcG9ydGFudCBmb3IgdG91Y2ggZGV2aWNlcyB3aGVyZSBkb2luZyB0aGlzIHRvbyBlYXJseSBjYW4gdW5uZWNlc3NhcmlseSBibG9jayBzY3JvbGxpbmcsXG4gICAgLy8gaWYgdGhlcmUncyBhIGRyYWdnaW5nIGRlbGF5LlxuICAgIGlmIChldmVudC5jYW5jZWxhYmxlKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uID0gdGhpcy5fZ2V0Q29uc3RyYWluZWRQb2ludGVyUG9zaXRpb24ocG9pbnRlclBvc2l0aW9uKTtcbiAgICB0aGlzLl9oYXNNb3ZlZCA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEtub3duUG9pbnRlclBvc2l0aW9uID0gcG9pbnRlclBvc2l0aW9uO1xuICAgIHRoaXMuX3VwZGF0ZVBvaW50ZXJEaXJlY3Rpb25EZWx0YShjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbik7XG5cbiAgICBpZiAodGhpcy5fZHJvcENvbnRhaW5lcikge1xuICAgICAgdGhpcy5fdXBkYXRlQWN0aXZlRHJvcENvbnRhaW5lcihjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbiwgcG9pbnRlclBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlcmUncyBhIHBvc2l0aW9uIGNvbnN0cmFpbnQgZnVuY3Rpb24sIHdlIHdhbnQgdGhlIGVsZW1lbnQncyB0b3AvbGVmdCB0byBiZSBhdCB0aGVcbiAgICAgIC8vIHNwZWNpZmljIHBvc2l0aW9uIG9uIHRoZSBwYWdlLiBVc2UgdGhlIGluaXRpYWwgcG9zaXRpb24gYXMgYSByZWZlcmVuY2UgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5jb25zdHJhaW5Qb3NpdGlvbiA/IHRoaXMuX2luaXRpYWxEb21SZWN0ISA6IHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlO1xuICAgICAgY29uc3QgYWN0aXZlVHJhbnNmb3JtID0gdGhpcy5fYWN0aXZlVHJhbnNmb3JtO1xuICAgICAgYWN0aXZlVHJhbnNmb3JtLnggPSBjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbi54IC0gb2Zmc2V0LnggKyB0aGlzLl9wYXNzaXZlVHJhbnNmb3JtLng7XG4gICAgICBhY3RpdmVUcmFuc2Zvcm0ueSA9IGNvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uLnkgLSBvZmZzZXQueSArIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueTtcbiAgICAgIHRoaXMuX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm0oYWN0aXZlVHJhbnNmb3JtLngsIGFjdGl2ZVRyYW5zZm9ybS55KTtcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB0aGlzIGV2ZW50IGdldHMgZmlyZWQgZm9yIGV2ZXJ5IHBpeGVsIHdoaWxlIGRyYWdnaW5nLCB3ZSBvbmx5XG4gICAgLy8gd2FudCB0byBmaXJlIGl0IGlmIHRoZSBjb25zdW1lciBvcHRlZCBpbnRvIGl0LiBBbHNvIHdlIGhhdmUgdG9cbiAgICAvLyByZS1lbnRlciB0aGUgem9uZSBiZWNhdXNlIHdlIHJ1biBhbGwgb2YgdGhlIGV2ZW50cyBvbiB0aGUgb3V0c2lkZS5cbiAgICBpZiAodGhpcy5fbW92ZUV2ZW50cy5vYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5fbW92ZUV2ZW50cy5uZXh0KHtcbiAgICAgICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICAgICAgcG9pbnRlclBvc2l0aW9uOiBjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbixcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBkaXN0YW5jZTogdGhpcy5fZ2V0RHJhZ0Rpc3RhbmNlKGNvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uKSxcbiAgICAgICAgICBkZWx0YTogdGhpcy5fcG9pbnRlckRpcmVjdGlvbkRlbHRhLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKiogSGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbiB0aGUgdXNlciBsaWZ0cyB0aGVpciBwb2ludGVyIHVwLCBhZnRlciBpbml0aWF0aW5nIGEgZHJhZy4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclVwID0gKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuICAgIHRoaXMuX2VuZERyYWdTZXF1ZW5jZShldmVudCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFycyBzdWJzY3JpcHRpb25zIGFuZCBzdG9wcyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UuXG4gICAqIEBwYXJhbSBldmVudCBCcm93c2VyIGV2ZW50IG9iamVjdCB0aGF0IGVuZGVkIHRoZSBzZXF1ZW5jZS5cbiAgICovXG4gIHByaXZhdGUgX2VuZERyYWdTZXF1ZW5jZShldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcbiAgICAvLyBOb3RlIHRoYXQgaGVyZSB3ZSB1c2UgYGlzRHJhZ2dpbmdgIGZyb20gdGhlIHNlcnZpY2UsIHJhdGhlciB0aGFuIGZyb20gYHRoaXNgLlxuICAgIC8vIFRoZSBkaWZmZXJlbmNlIGlzIHRoYXQgdGhlIG9uZSBmcm9tIHRoZSBzZXJ2aWNlIHJlZmxlY3RzIHdoZXRoZXIgYSBkcmFnZ2luZyBzZXF1ZW5jZVxuICAgIC8vIGhhcyBiZWVuIGluaXRpYXRlZCwgd2hlcmVhcyB0aGUgb25lIG9uIGB0aGlzYCBpbmNsdWRlcyB3aGV0aGVyIHRoZSB1c2VyIGhhcyBwYXNzZWRcbiAgICAvLyB0aGUgbWluaW11bSBkcmFnZ2luZyB0aHJlc2hvbGQuXG4gICAgaWYgKCF0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LmlzRHJhZ2dpbmcodGhpcykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnN0b3BEcmFnZ2luZyh0aGlzKTtcbiAgICB0aGlzLl90b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zKCk7XG5cbiAgICBpZiAodGhpcy5faGFuZGxlcykge1xuICAgICAgKHRoaXMuX3Jvb3RFbGVtZW50LnN0eWxlIGFzIERyYWdDU1NTdHlsZURlY2xhcmF0aW9uKS53ZWJraXRUYXBIaWdobGlnaHRDb2xvciA9XG4gICAgICAgIHRoaXMuX3Jvb3RFbGVtZW50VGFwSGlnaGxpZ2h0O1xuICAgIH1cblxuICAgIGlmICghdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlbGVhc2VkLm5leHQoe3NvdXJjZTogdGhpcywgZXZlbnR9KTtcblxuICAgIGlmICh0aGlzLl9kcm9wQ29udGFpbmVyKSB7XG4gICAgICAvLyBTdG9wIHNjcm9sbGluZyBpbW1lZGlhdGVseSwgaW5zdGVhZCBvZiB3YWl0aW5nIGZvciB0aGUgYW5pbWF0aW9uIHRvIGZpbmlzaC5cbiAgICAgIHRoaXMuX2Ryb3BDb250YWluZXIuX3N0b3BTY3JvbGxpbmcoKTtcbiAgICAgIHRoaXMuX2FuaW1hdGVQcmV2aWV3VG9QbGFjZWhvbGRlcigpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLl9jbGVhbnVwRHJhZ0FydGlmYWN0cyhldmVudCk7XG4gICAgICAgIHRoaXMuX2NsZWFudXBDYWNoZWREaW1lbnNpb25zKCk7XG4gICAgICAgIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuc3RvcERyYWdnaW5nKHRoaXMpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENvbnZlcnQgdGhlIGFjdGl2ZSB0cmFuc2Zvcm0gaW50byBhIHBhc3NpdmUgb25lLiBUaGlzIG1lYW5zIHRoYXQgbmV4dCB0aW1lXG4gICAgICAvLyB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgdGhlIGl0ZW0sIGl0cyBwb3NpdGlvbiB3aWxsIGJlIGNhbGN1bGF0ZWQgcmVsYXRpdmVseVxuICAgICAgLy8gdG8gdGhlIG5ldyBwYXNzaXZlIHRyYW5zZm9ybS5cbiAgICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueCA9IHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS54O1xuICAgICAgY29uc3QgcG9pbnRlclBvc2l0aW9uID0gdGhpcy5fZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50KTtcbiAgICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueSA9IHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS55O1xuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgIHRoaXMuZW5kZWQubmV4dCh7XG4gICAgICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgICAgIGRpc3RhbmNlOiB0aGlzLl9nZXREcmFnRGlzdGFuY2UocG9pbnRlclBvc2l0aW9uKSxcbiAgICAgICAgICBkcm9wUG9pbnQ6IHBvaW50ZXJQb3NpdGlvbixcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2NsZWFudXBDYWNoZWREaW1lbnNpb25zKCk7XG4gICAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnN0b3BEcmFnZ2luZyh0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKiogU3RhcnRzIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZS4gKi9cbiAgcHJpdmF0ZSBfc3RhcnREcmFnU2VxdWVuY2UoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG4gICAgaWYgKGlzVG91Y2hFdmVudChldmVudCkpIHtcbiAgICAgIHRoaXMuX2xhc3RUb3VjaEV2ZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgfVxuXG4gICAgdGhpcy5fdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucygpO1xuXG4gICAgLy8gTmVlZHMgdG8gaGFwcGVuIGJlZm9yZSB0aGUgcm9vdCBlbGVtZW50IGlzIG1vdmVkLlxuICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSB0aGlzLl9nZXRTaGFkb3dSb290KCk7XG4gICAgY29uc3QgZHJvcENvbnRhaW5lciA9IHRoaXMuX2Ryb3BDb250YWluZXI7XG5cbiAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgLy8gSW4gc29tZSBicm93c2VycyB0aGUgZ2xvYmFsIGBzZWxlY3RzdGFydGAgdGhhdCB3ZSBtYWludGFpbiBpbiB0aGUgYERyYWdEcm9wUmVnaXN0cnlgXG4gICAgICAvLyBkb2Vzbid0IGNyb3NzIHRoZSBzaGFkb3cgYm91bmRhcnkgc28gd2UgaGF2ZSB0byBwcmV2ZW50IGl0IGF0IHRoZSBzaGFkb3cgcm9vdCAoc2VlICMyODc5MikuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBzaGFkb3dSb290LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgJ3NlbGVjdHN0YXJ0JyxcbiAgICAgICAgICBzaGFkb3dEb21TZWxlY3RTdGFydCxcbiAgICAgICAgICBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMsXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZHJvcENvbnRhaW5lcikge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX3Jvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50O1xuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSAodGhpcy5fcGxhY2Vob2xkZXIgPSB0aGlzLl9jcmVhdGVQbGFjZWhvbGRlckVsZW1lbnQoKSk7XG4gICAgICBjb25zdCBhbmNob3IgPSAodGhpcy5fYW5jaG9yID1cbiAgICAgICAgdGhpcy5fYW5jaG9yIHx8XG4gICAgICAgIHRoaXMuX2RvY3VtZW50LmNyZWF0ZUNvbW1lbnQoXG4gICAgICAgICAgdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlID8gJ2Nkay1kcmFnLWFuY2hvcicgOiAnJyxcbiAgICAgICAgKSk7XG5cbiAgICAgIC8vIEluc2VydCBhbiBhbmNob3Igbm9kZSBzbyB0aGF0IHdlIGNhbiByZXN0b3JlIHRoZSBlbGVtZW50J3MgcG9zaXRpb24gaW4gdGhlIERPTS5cbiAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoYW5jaG9yLCBlbGVtZW50KTtcblxuICAgICAgLy8gVGhlcmUncyBubyByaXNrIG9mIHRyYW5zZm9ybXMgc3RhY2tpbmcgd2hlbiBpbnNpZGUgYSBkcm9wIGNvbnRhaW5lciBzb1xuICAgICAgLy8gd2UgY2FuIGtlZXAgdGhlIGluaXRpYWwgdHJhbnNmb3JtIHVwIHRvIGRhdGUgYW55IHRpbWUgZHJhZ2dpbmcgc3RhcnRzLlxuICAgICAgdGhpcy5faW5pdGlhbFRyYW5zZm9ybSA9IGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtIHx8ICcnO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHByZXZpZXcgYWZ0ZXIgdGhlIGluaXRpYWwgdHJhbnNmb3JtIGhhc1xuICAgICAgLy8gYmVlbiBjYWNoZWQsIGJlY2F1c2UgaXQgY2FuIGJlIGFmZmVjdGVkIGJ5IHRoZSB0cmFuc2Zvcm0uXG4gICAgICB0aGlzLl9wcmV2aWV3ID0gbmV3IFByZXZpZXdSZWYoXG4gICAgICAgIHRoaXMuX2RvY3VtZW50LFxuICAgICAgICB0aGlzLl9yb290RWxlbWVudCxcbiAgICAgICAgdGhpcy5fZGlyZWN0aW9uLFxuICAgICAgICB0aGlzLl9pbml0aWFsRG9tUmVjdCEsXG4gICAgICAgIHRoaXMuX3ByZXZpZXdUZW1wbGF0ZSB8fCBudWxsLFxuICAgICAgICB0aGlzLnByZXZpZXdDbGFzcyB8fCBudWxsLFxuICAgICAgICB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZSxcbiAgICAgICAgdGhpcy5faW5pdGlhbFRyYW5zZm9ybSxcbiAgICAgICAgdGhpcy5fY29uZmlnLnpJbmRleCB8fCAxMDAwLFxuICAgICAgKTtcbiAgICAgIHRoaXMuX3ByZXZpZXcuYXR0YWNoKHRoaXMuX2dldFByZXZpZXdJbnNlcnRpb25Qb2ludChwYXJlbnQsIHNoYWRvd1Jvb3QpKTtcblxuICAgICAgLy8gV2UgbW92ZSB0aGUgZWxlbWVudCBvdXQgYXQgdGhlIGVuZCBvZiB0aGUgYm9keSBhbmQgd2UgbWFrZSBpdCBoaWRkZW4sIGJlY2F1c2Uga2VlcGluZyBpdCBpblxuICAgICAgLy8gcGxhY2Ugd2lsbCB0aHJvdyBvZmYgdGhlIGNvbnN1bWVyJ3MgYDpsYXN0LWNoaWxkYCBzZWxlY3RvcnMuIFdlIGNhbid0IHJlbW92ZSB0aGUgZWxlbWVudFxuICAgICAgLy8gZnJvbSB0aGUgRE9NIGNvbXBsZXRlbHksIGJlY2F1c2UgaU9TIHdpbGwgc3RvcCBmaXJpbmcgYWxsIHN1YnNlcXVlbnQgZXZlbnRzIGluIHRoZSBjaGFpbi5cbiAgICAgIHRvZ2dsZVZpc2liaWxpdHkoZWxlbWVudCwgZmFsc2UsIGRyYWdJbXBvcnRhbnRQcm9wZXJ0aWVzKTtcbiAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocGFyZW50LnJlcGxhY2VDaGlsZChwbGFjZWhvbGRlciwgZWxlbWVudCkpO1xuICAgICAgdGhpcy5zdGFydGVkLm5leHQoe3NvdXJjZTogdGhpcywgZXZlbnR9KTsgLy8gRW1pdCBiZWZvcmUgbm90aWZ5aW5nIHRoZSBjb250YWluZXIuXG4gICAgICBkcm9wQ29udGFpbmVyLnN0YXJ0KCk7XG4gICAgICB0aGlzLl9pbml0aWFsQ29udGFpbmVyID0gZHJvcENvbnRhaW5lcjtcbiAgICAgIHRoaXMuX2luaXRpYWxJbmRleCA9IGRyb3BDb250YWluZXIuZ2V0SXRlbUluZGV4KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0ZWQubmV4dCh7c291cmNlOiB0aGlzLCBldmVudH0pO1xuICAgICAgdGhpcy5faW5pdGlhbENvbnRhaW5lciA9IHRoaXMuX2luaXRpYWxJbmRleCA9IHVuZGVmaW5lZCE7XG4gICAgfVxuXG4gICAgLy8gSW1wb3J0YW50IHRvIHJ1biBhZnRlciB3ZSd2ZSBjYWxsZWQgYHN0YXJ0YCBvbiB0aGUgcGFyZW50IGNvbnRhaW5lclxuICAgIC8vIHNvIHRoYXQgaXQgaGFzIGhhZCB0aW1lIHRvIHJlc29sdmUgaXRzIHNjcm9sbGFibGUgcGFyZW50cy5cbiAgICB0aGlzLl9wYXJlbnRQb3NpdGlvbnMuY2FjaGUoZHJvcENvbnRhaW5lciA/IGRyb3BDb250YWluZXIuZ2V0U2Nyb2xsYWJsZVBhcmVudHMoKSA6IFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIHRoZSBkaWZmZXJlbnQgdmFyaWFibGVzIGFuZCBzdWJzY3JpcHRpb25zXG4gICAqIHRoYXQgd2lsbCBiZSBuZWNlc3NhcnkgZm9yIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZS5cbiAgICogQHBhcmFtIHJlZmVyZW5jZUVsZW1lbnQgRWxlbWVudCB0aGF0IHN0YXJ0ZWQgdGhlIGRyYWcgc2VxdWVuY2UuXG4gICAqIEBwYXJhbSBldmVudCBCcm93c2VyIGV2ZW50IG9iamVjdCB0aGF0IHN0YXJ0ZWQgdGhlIHNlcXVlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZURyYWdTZXF1ZW5jZShyZWZlcmVuY2VFbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG4gICAgLy8gU3RvcCBwcm9wYWdhdGlvbiBpZiB0aGUgaXRlbSBpcyBpbnNpZGUgYW5vdGhlclxuICAgIC8vIGRyYWdnYWJsZSBzbyB3ZSBkb24ndCBzdGFydCBtdWx0aXBsZSBkcmFnIHNlcXVlbmNlcy5cbiAgICBpZiAodGhpcy5fcGFyZW50RHJhZ1JlZikge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgY29uc3QgaXNEcmFnZ2luZyA9IHRoaXMuaXNEcmFnZ2luZygpO1xuICAgIGNvbnN0IGlzVG91Y2hTZXF1ZW5jZSA9IGlzVG91Y2hFdmVudChldmVudCk7XG4gICAgY29uc3QgaXNBdXhpbGlhcnlNb3VzZUJ1dHRvbiA9ICFpc1RvdWNoU2VxdWVuY2UgJiYgKGV2ZW50IGFzIE1vdXNlRXZlbnQpLmJ1dHRvbiAhPT0gMDtcbiAgICBjb25zdCByb290RWxlbWVudCA9IHRoaXMuX3Jvb3RFbGVtZW50O1xuICAgIGNvbnN0IHRhcmdldCA9IF9nZXRFdmVudFRhcmdldChldmVudCk7XG4gICAgY29uc3QgaXNTeW50aGV0aWNFdmVudCA9XG4gICAgICAhaXNUb3VjaFNlcXVlbmNlICYmXG4gICAgICB0aGlzLl9sYXN0VG91Y2hFdmVudFRpbWUgJiZcbiAgICAgIHRoaXMuX2xhc3RUb3VjaEV2ZW50VGltZSArIE1PVVNFX0VWRU5UX0lHTk9SRV9USU1FID4gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBpc0Zha2VFdmVudCA9IGlzVG91Y2hTZXF1ZW5jZVxuICAgICAgPyBpc0Zha2VUb3VjaHN0YXJ0RnJvbVNjcmVlblJlYWRlcihldmVudCBhcyBUb3VjaEV2ZW50KVxuICAgICAgOiBpc0Zha2VNb3VzZWRvd25Gcm9tU2NyZWVuUmVhZGVyKGV2ZW50IGFzIE1vdXNlRXZlbnQpO1xuXG4gICAgLy8gSWYgdGhlIGV2ZW50IHN0YXJ0ZWQgZnJvbSBhbiBlbGVtZW50IHdpdGggdGhlIG5hdGl2ZSBIVE1MIGRyYWcmZHJvcCwgaXQnbGwgaW50ZXJmZXJlXG4gICAgLy8gd2l0aCBvdXIgb3duIGRyYWdnaW5nIChlLmcuIGBpbWdgIHRhZ3MgZG8gaXQgYnkgZGVmYXVsdCkuIFByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uXG4gICAgLy8gdG8gc3RvcCBpdCBmcm9tIGhhcHBlbmluZy4gTm90ZSB0aGF0IHByZXZlbnRpbmcgb24gYGRyYWdzdGFydGAgYWxzbyBzZWVtcyB0byB3b3JrLCBidXRcbiAgICAvLyBpdCdzIGZsYWt5IGFuZCBpdCBmYWlscyBpZiB0aGUgdXNlciBkcmFncyBpdCBhd2F5IHF1aWNrbHkuIEFsc28gbm90ZSB0aGF0IHdlIG9ubHkgd2FudFxuICAgIC8vIHRvIGRvIHRoaXMgZm9yIGBtb3VzZWRvd25gIHNpbmNlIGRvaW5nIHRoZSBzYW1lIGZvciBgdG91Y2hzdGFydGAgd2lsbCBzdG9wIGFueSBgY2xpY2tgXG4gICAgLy8gZXZlbnRzIGZyb20gZmlyaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRhcmdldCAmJiAodGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5kcmFnZ2FibGUgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgLy8gQWJvcnQgaWYgdGhlIHVzZXIgaXMgYWxyZWFkeSBkcmFnZ2luZyBvciBpcyB1c2luZyBhIG1vdXNlIGJ1dHRvbiBvdGhlciB0aGFuIHRoZSBwcmltYXJ5IG9uZS5cbiAgICBpZiAoaXNEcmFnZ2luZyB8fCBpc0F1eGlsaWFyeU1vdXNlQnV0dG9uIHx8IGlzU3ludGhldGljRXZlbnQgfHwgaXNGYWtlRXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSd2ZSBnb3QgaGFuZGxlcywgd2UgbmVlZCB0byBkaXNhYmxlIHRoZSB0YXAgaGlnaGxpZ2h0IG9uIHRoZSBlbnRpcmUgcm9vdCBlbGVtZW50LFxuICAgIC8vIG90aGVyd2lzZSBpT1Mgd2lsbCBzdGlsbCBhZGQgaXQsIGV2ZW4gdGhvdWdoIGFsbCB0aGUgZHJhZyBpbnRlcmFjdGlvbnMgb24gdGhlIGhhbmRsZVxuICAgIC8vIGFyZSBkaXNhYmxlZC5cbiAgICBpZiAodGhpcy5faGFuZGxlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHJvb3RTdHlsZXMgPSByb290RWxlbWVudC5zdHlsZSBhcyBEcmFnQ1NTU3R5bGVEZWNsYXJhdGlvbjtcbiAgICAgIHRoaXMuX3Jvb3RFbGVtZW50VGFwSGlnaGxpZ2h0ID0gcm9vdFN0eWxlcy53ZWJraXRUYXBIaWdobGlnaHRDb2xvciB8fCAnJztcbiAgICAgIHJvb3RTdHlsZXMud2Via2l0VGFwSGlnaGxpZ2h0Q29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICAgIH1cblxuICAgIHRoaXMuX2hhc01vdmVkID0gZmFsc2U7XG4gICAgdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nLnNldCh0aGlzLl9oYXNNb3ZlZCk7XG5cbiAgICAvLyBBdm9pZCBtdWx0aXBsZSBzdWJzY3JpcHRpb25zIGFuZCBtZW1vcnkgbGVha3Mgd2hlbiBtdWx0aSB0b3VjaFxuICAgIC8vIChpc0RyYWdnaW5nIGNoZWNrIGFib3ZlIGlzbid0IGVub3VnaCBiZWNhdXNlIG9mIHBvc3NpYmxlIHRlbXBvcmFsIGFuZC9vciBkaW1lbnNpb25hbCBkZWxheXMpXG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5faW5pdGlhbERvbVJlY3QgPSB0aGlzLl9yb290RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0aGlzLl9wb2ludGVyTW92ZVN1YnNjcmlwdGlvbiA9IHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkucG9pbnRlck1vdmUuc3Vic2NyaWJlKHRoaXMuX3BvaW50ZXJNb3ZlKTtcbiAgICB0aGlzLl9wb2ludGVyVXBTdWJzY3JpcHRpb24gPSB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnBvaW50ZXJVcC5zdWJzY3JpYmUodGhpcy5fcG9pbnRlclVwKTtcbiAgICB0aGlzLl9zY3JvbGxTdWJzY3JpcHRpb24gPSB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5XG4gICAgICAuc2Nyb2xsZWQodGhpcy5fZ2V0U2hhZG93Um9vdCgpKVxuICAgICAgLnN1YnNjcmliZShzY3JvbGxFdmVudCA9PiB0aGlzLl91cGRhdGVPblNjcm9sbChzY3JvbGxFdmVudCkpO1xuXG4gICAgaWYgKHRoaXMuX2JvdW5kYXJ5RWxlbWVudCkge1xuICAgICAgdGhpcy5fYm91bmRhcnlSZWN0ID0gZ2V0TXV0YWJsZUNsaWVudFJlY3QodGhpcy5fYm91bmRhcnlFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGEgY3VzdG9tIHByZXZpZXcgd2UgY2FuJ3Qga25vdyBhaGVhZCBvZiB0aW1lIGhvdyBsYXJnZSBpdCdsbCBiZSBzbyB3ZSBwb3NpdGlvblxuICAgIC8vIGl0IG5leHQgdG8gdGhlIGN1cnNvci4gVGhlIGV4Y2VwdGlvbiBpcyB3aGVuIHRoZSBjb25zdW1lciBoYXMgb3B0ZWQgaW50byBtYWtpbmcgdGhlIHByZXZpZXdcbiAgICAvLyB0aGUgc2FtZSBzaXplIGFzIHRoZSByb290IGVsZW1lbnQsIGluIHdoaWNoIGNhc2Ugd2UgZG8ga25vdyB0aGUgc2l6ZS5cbiAgICBjb25zdCBwcmV2aWV3VGVtcGxhdGUgPSB0aGlzLl9wcmV2aWV3VGVtcGxhdGU7XG4gICAgdGhpcy5fcGlja3VwUG9zaXRpb25JbkVsZW1lbnQgPVxuICAgICAgcHJldmlld1RlbXBsYXRlICYmIHByZXZpZXdUZW1wbGF0ZS50ZW1wbGF0ZSAmJiAhcHJldmlld1RlbXBsYXRlLm1hdGNoU2l6ZVxuICAgICAgICA/IHt4OiAwLCB5OiAwfVxuICAgICAgICA6IHRoaXMuX2dldFBvaW50ZXJQb3NpdGlvbkluRWxlbWVudCh0aGlzLl9pbml0aWFsRG9tUmVjdCwgcmVmZXJlbmNlRWxlbWVudCwgZXZlbnQpO1xuICAgIGNvbnN0IHBvaW50ZXJQb3NpdGlvbiA9XG4gICAgICAodGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UgPVxuICAgICAgdGhpcy5fbGFzdEtub3duUG9pbnRlclBvc2l0aW9uID1cbiAgICAgICAgdGhpcy5fZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50KSk7XG4gICAgdGhpcy5fcG9pbnRlckRpcmVjdGlvbkRlbHRhID0ge3g6IDAsIHk6IDB9O1xuICAgIHRoaXMuX3BvaW50ZXJQb3NpdGlvbkF0TGFzdERpcmVjdGlvbkNoYW5nZSA9IHt4OiBwb2ludGVyUG9zaXRpb24ueCwgeTogcG9pbnRlclBvc2l0aW9uLnl9O1xuICAgIHRoaXMuX2RyYWdTdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuc3RhcnREcmFnZ2luZyh0aGlzLCBldmVudCk7XG4gIH1cblxuICAvKiogQ2xlYW5zIHVwIHRoZSBET00gYXJ0aWZhY3RzIHRoYXQgd2VyZSBhZGRlZCB0byBmYWNpbGl0YXRlIHRoZSBlbGVtZW50IGJlaW5nIGRyYWdnZWQuICovXG4gIHByaXZhdGUgX2NsZWFudXBEcmFnQXJ0aWZhY3RzKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICAgIC8vIFJlc3RvcmUgdGhlIGVsZW1lbnQncyB2aXNpYmlsaXR5IGFuZCBpbnNlcnQgaXQgYXQgaXRzIG9sZCBwb3NpdGlvbiBpbiB0aGUgRE9NLlxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHRoYXQgd2UgbWFpbnRhaW4gdGhlIHBvc2l0aW9uLCBiZWNhdXNlIG1vdmluZyB0aGUgZWxlbWVudCBhcm91bmQgaW4gdGhlIERPTVxuICAgIC8vIGNhbiB0aHJvdyBvZmYgYE5nRm9yYCB3aGljaCBkb2VzIHNtYXJ0IGRpZmZpbmcgYW5kIHJlLWNyZWF0ZXMgZWxlbWVudHMgb25seSB3aGVuIG5lY2Vzc2FyeSxcbiAgICAvLyB3aGlsZSBtb3ZpbmcgdGhlIGV4aXN0aW5nIGVsZW1lbnRzIGluIGFsbCBvdGhlciBjYXNlcy5cbiAgICB0b2dnbGVWaXNpYmlsaXR5KHRoaXMuX3Jvb3RFbGVtZW50LCB0cnVlLCBkcmFnSW1wb3J0YW50UHJvcGVydGllcyk7XG4gICAgdGhpcy5fYW5jaG9yLnBhcmVudE5vZGUhLnJlcGxhY2VDaGlsZCh0aGlzLl9yb290RWxlbWVudCwgdGhpcy5fYW5jaG9yKTtcblxuICAgIHRoaXMuX2Rlc3Ryb3lQcmV2aWV3KCk7XG4gICAgdGhpcy5fZGVzdHJveVBsYWNlaG9sZGVyKCk7XG4gICAgdGhpcy5faW5pdGlhbERvbVJlY3QgPVxuICAgICAgdGhpcy5fYm91bmRhcnlSZWN0ID1cbiAgICAgIHRoaXMuX3ByZXZpZXdSZWN0ID1cbiAgICAgIHRoaXMuX2luaXRpYWxUcmFuc2Zvcm0gPVxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAvLyBSZS1lbnRlciB0aGUgTmdab25lIHNpbmNlIHdlIGJvdW5kIGBkb2N1bWVudGAgZXZlbnRzIG9uIHRoZSBvdXRzaWRlLlxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5fZHJvcENvbnRhaW5lciE7XG4gICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBjb250YWluZXIuZ2V0SXRlbUluZGV4KHRoaXMpO1xuICAgICAgY29uc3QgcG9pbnRlclBvc2l0aW9uID0gdGhpcy5fZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50KTtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5fZ2V0RHJhZ0Rpc3RhbmNlKHBvaW50ZXJQb3NpdGlvbik7XG4gICAgICBjb25zdCBpc1BvaW50ZXJPdmVyQ29udGFpbmVyID0gY29udGFpbmVyLl9pc092ZXJDb250YWluZXIoXG4gICAgICAgIHBvaW50ZXJQb3NpdGlvbi54LFxuICAgICAgICBwb2ludGVyUG9zaXRpb24ueSxcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuZW5kZWQubmV4dCh7c291cmNlOiB0aGlzLCBkaXN0YW5jZSwgZHJvcFBvaW50OiBwb2ludGVyUG9zaXRpb24sIGV2ZW50fSk7XG4gICAgICB0aGlzLmRyb3BwZWQubmV4dCh7XG4gICAgICAgIGl0ZW06IHRoaXMsXG4gICAgICAgIGN1cnJlbnRJbmRleCxcbiAgICAgICAgcHJldmlvdXNJbmRleDogdGhpcy5faW5pdGlhbEluZGV4LFxuICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgcHJldmlvdXNDb250YWluZXI6IHRoaXMuX2luaXRpYWxDb250YWluZXIsXG4gICAgICAgIGlzUG9pbnRlck92ZXJDb250YWluZXIsXG4gICAgICAgIGRpc3RhbmNlLFxuICAgICAgICBkcm9wUG9pbnQ6IHBvaW50ZXJQb3NpdGlvbixcbiAgICAgICAgZXZlbnQsXG4gICAgICB9KTtcbiAgICAgIGNvbnRhaW5lci5kcm9wKFxuICAgICAgICB0aGlzLFxuICAgICAgICBjdXJyZW50SW5kZXgsXG4gICAgICAgIHRoaXMuX2luaXRpYWxJbmRleCxcbiAgICAgICAgdGhpcy5faW5pdGlhbENvbnRhaW5lcixcbiAgICAgICAgaXNQb2ludGVyT3ZlckNvbnRhaW5lcixcbiAgICAgICAgZGlzdGFuY2UsXG4gICAgICAgIHBvaW50ZXJQb3NpdGlvbixcbiAgICAgICAgZXZlbnQsXG4gICAgICApO1xuICAgICAgdGhpcy5fZHJvcENvbnRhaW5lciA9IHRoaXMuX2luaXRpYWxDb250YWluZXI7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgaXRlbSdzIHBvc2l0aW9uIGluIGl0cyBkcm9wIGNvbnRhaW5lciwgb3IgbW92ZXMgaXRcbiAgICogaW50byBhIG5ldyBvbmUsIGRlcGVuZGluZyBvbiBpdHMgY3VycmVudCBkcmFnIHBvc2l0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlQWN0aXZlRHJvcENvbnRhaW5lcih7eCwgeX06IFBvaW50LCB7eDogcmF3WCwgeTogcmF3WX06IFBvaW50KSB7XG4gICAgLy8gRHJvcCBjb250YWluZXIgdGhhdCBkcmFnZ2FibGUgaGFzIGJlZW4gbW92ZWQgaW50by5cbiAgICBsZXQgbmV3Q29udGFpbmVyID0gdGhpcy5faW5pdGlhbENvbnRhaW5lci5fZ2V0U2libGluZ0NvbnRhaW5lckZyb21Qb3NpdGlvbih0aGlzLCB4LCB5KTtcblxuICAgIC8vIElmIHdlIGNvdWxkbid0IGZpbmQgYSBuZXcgY29udGFpbmVyIHRvIG1vdmUgdGhlIGl0ZW0gaW50bywgYW5kIHRoZSBpdGVtIGhhcyBsZWZ0IGl0c1xuICAgIC8vIGluaXRpYWwgY29udGFpbmVyLCBjaGVjayB3aGV0aGVyIHRoZSBpdCdzIG92ZXIgdGhlIGluaXRpYWwgY29udGFpbmVyLiBUaGlzIGhhbmRsZXMgdGhlXG4gICAgLy8gY2FzZSB3aGVyZSB0d28gY29udGFpbmVycyBhcmUgY29ubmVjdGVkIG9uZSB3YXkgYW5kIHRoZSB1c2VyIHRyaWVzIHRvIHVuZG8gZHJhZ2dpbmcgYW5cbiAgICAvLyBpdGVtIGludG8gYSBuZXcgY29udGFpbmVyLlxuICAgIGlmIChcbiAgICAgICFuZXdDb250YWluZXIgJiZcbiAgICAgIHRoaXMuX2Ryb3BDb250YWluZXIgIT09IHRoaXMuX2luaXRpYWxDb250YWluZXIgJiZcbiAgICAgIHRoaXMuX2luaXRpYWxDb250YWluZXIuX2lzT3ZlckNvbnRhaW5lcih4LCB5KVxuICAgICkge1xuICAgICAgbmV3Q29udGFpbmVyID0gdGhpcy5faW5pdGlhbENvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBpZiAobmV3Q29udGFpbmVyICYmIG5ld0NvbnRhaW5lciAhPT0gdGhpcy5fZHJvcENvbnRhaW5lcikge1xuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgIC8vIE5vdGlmeSB0aGUgb2xkIGNvbnRhaW5lciB0aGF0IHRoZSBpdGVtIGhhcyBsZWZ0LlxuICAgICAgICB0aGlzLmV4aXRlZC5uZXh0KHtpdGVtOiB0aGlzLCBjb250YWluZXI6IHRoaXMuX2Ryb3BDb250YWluZXIhfSk7XG4gICAgICAgIHRoaXMuX2Ryb3BDb250YWluZXIhLmV4aXQodGhpcyk7XG4gICAgICAgIC8vIE5vdGlmeSB0aGUgbmV3IGNvbnRhaW5lciB0aGF0IHRoZSBpdGVtIGhhcyBlbnRlcmVkLlxuICAgICAgICB0aGlzLl9kcm9wQ29udGFpbmVyID0gbmV3Q29udGFpbmVyITtcbiAgICAgICAgdGhpcy5fZHJvcENvbnRhaW5lci5lbnRlcihcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHgsXG4gICAgICAgICAgeSxcbiAgICAgICAgICBuZXdDb250YWluZXIgPT09IHRoaXMuX2luaXRpYWxDb250YWluZXIgJiZcbiAgICAgICAgICAgIC8vIElmIHdlJ3JlIHJlLWVudGVyaW5nIHRoZSBpbml0aWFsIGNvbnRhaW5lciBhbmQgc29ydGluZyBpcyBkaXNhYmxlZCxcbiAgICAgICAgICAgIC8vIHB1dCBpdGVtIHRoZSBpbnRvIGl0cyBzdGFydGluZyBpbmRleCB0byBiZWdpbiB3aXRoLlxuICAgICAgICAgICAgbmV3Q29udGFpbmVyLnNvcnRpbmdEaXNhYmxlZFxuICAgICAgICAgICAgPyB0aGlzLl9pbml0aWFsSW5kZXhcbiAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmVudGVyZWQubmV4dCh7XG4gICAgICAgICAgaXRlbTogdGhpcyxcbiAgICAgICAgICBjb250YWluZXI6IG5ld0NvbnRhaW5lciEsXG4gICAgICAgICAgY3VycmVudEluZGV4OiBuZXdDb250YWluZXIhLmdldEl0ZW1JbmRleCh0aGlzKSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEcmFnZ2luZyBtYXkgaGF2ZSBiZWVuIGludGVycnVwdGVkIGFzIGEgcmVzdWx0IG9mIHRoZSBldmVudHMgYWJvdmUuXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZygpKSB7XG4gICAgICB0aGlzLl9kcm9wQ29udGFpbmVyIS5fc3RhcnRTY3JvbGxpbmdJZk5lY2Vzc2FyeShyYXdYLCByYXdZKTtcbiAgICAgIHRoaXMuX2Ryb3BDb250YWluZXIhLl9zb3J0SXRlbSh0aGlzLCB4LCB5LCB0aGlzLl9wb2ludGVyRGlyZWN0aW9uRGVsdGEpO1xuXG4gICAgICBpZiAodGhpcy5jb25zdHJhaW5Qb3NpdGlvbikge1xuICAgICAgICB0aGlzLl9hcHBseVByZXZpZXdUcmFuc2Zvcm0oeCwgeSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hcHBseVByZXZpZXdUcmFuc2Zvcm0oXG4gICAgICAgICAgeCAtIHRoaXMuX3BpY2t1cFBvc2l0aW9uSW5FbGVtZW50LngsXG4gICAgICAgICAgeSAtIHRoaXMuX3BpY2t1cFBvc2l0aW9uSW5FbGVtZW50LnksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuaW1hdGVzIHRoZSBwcmV2aWV3IGVsZW1lbnQgZnJvbSBpdHMgY3VycmVudCBwb3NpdGlvbiB0byB0aGUgbG9jYXRpb24gb2YgdGhlIGRyb3AgcGxhY2Vob2xkZXIuXG4gICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBhbmltYXRpb24gY29tcGxldGVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfYW5pbWF0ZVByZXZpZXdUb1BsYWNlaG9sZGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIElmIHRoZSB1c2VyIGhhc24ndCBtb3ZlZCB5ZXQsIHRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50IHdvbid0IGZpcmUuXG4gICAgaWYgKCF0aGlzLl9oYXNNb3ZlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYWNlaG9sZGVyUmVjdCA9IHRoaXMuX3BsYWNlaG9sZGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gQXBwbHkgdGhlIGNsYXNzIHRoYXQgYWRkcyBhIHRyYW5zaXRpb24gdG8gdGhlIHByZXZpZXcuXG4gICAgdGhpcy5fcHJldmlldyEuYWRkQ2xhc3MoJ2Nkay1kcmFnLWFuaW1hdGluZycpO1xuXG4gICAgLy8gTW92ZSB0aGUgcHJldmlldyB0byB0aGUgcGxhY2Vob2xkZXIgcG9zaXRpb24uXG4gICAgdGhpcy5fYXBwbHlQcmV2aWV3VHJhbnNmb3JtKHBsYWNlaG9sZGVyUmVjdC5sZWZ0LCBwbGFjZWhvbGRlclJlY3QudG9wKTtcblxuICAgIC8vIElmIHRoZSBlbGVtZW50IGRvZXNuJ3QgaGF2ZSBhIGB0cmFuc2l0aW9uYCwgdGhlIGB0cmFuc2l0aW9uZW5kYCBldmVudCB3b24ndCBmaXJlLiBTaW5jZVxuICAgIC8vIHdlIG5lZWQgdG8gdHJpZ2dlciBhIHN0eWxlIHJlY2FsY3VsYXRpb24gaW4gb3JkZXIgZm9yIHRoZSBgY2RrLWRyYWctYW5pbWF0aW5nYCBjbGFzcyB0b1xuICAgIC8vIGFwcGx5IGl0cyBzdHlsZSwgd2UgdGFrZSBhZHZhbnRhZ2Ugb2YgdGhlIGF2YWlsYWJsZSBpbmZvIHRvIGZpZ3VyZSBvdXQgd2hldGhlciB3ZSBuZWVkIHRvXG4gICAgLy8gYmluZCB0aGUgZXZlbnQgaW4gdGhlIGZpcnN0IHBsYWNlLlxuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5fcHJldmlldyEuZ2V0VHJhbnNpdGlvbkR1cmF0aW9uKCk7XG5cbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9ICgoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFldmVudCB8fFxuICAgICAgICAgICAgKHRoaXMuX3ByZXZpZXcgJiZcbiAgICAgICAgICAgICAgX2dldEV2ZW50VGFyZ2V0KGV2ZW50KSA9PT0gdGhpcy5fcHJldmlldy5lbGVtZW50ICYmXG4gICAgICAgICAgICAgIGV2ZW50LnByb3BlcnR5TmFtZSA9PT0gJ3RyYW5zZm9ybScpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3Py5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgaGFuZGxlcik7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSBhcyBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0O1xuXG4gICAgICAgIC8vIElmIGEgdHJhbnNpdGlvbiBpcyBzaG9ydCBlbm91Z2gsIHRoZSBicm93c2VyIG1pZ2h0IG5vdCBmaXJlIHRoZSBgdHJhbnNpdGlvbmVuZGAgZXZlbnQuXG4gICAgICAgIC8vIFNpbmNlIHdlIGtub3cgaG93IGxvbmcgaXQncyBzdXBwb3NlZCB0byB0YWtlLCBhZGQgYSB0aW1lb3V0IHdpdGggYSA1MCUgYnVmZmVyIHRoYXQnbGxcbiAgICAgICAgLy8gZmlyZSBpZiB0aGUgdHJhbnNpdGlvbiBoYXNuJ3QgY29tcGxldGVkIHdoZW4gaXQgd2FzIHN1cHBvc2VkIHRvLlxuICAgICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dChoYW5kbGVyIGFzIEZ1bmN0aW9uLCBkdXJhdGlvbiAqIDEuNSk7XG4gICAgICAgIHRoaXMuX3ByZXZpZXchLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYW4gZWxlbWVudCB0aGF0IHdpbGwgYmUgc2hvd24gaW5zdGVhZCBvZiB0aGUgY3VycmVudCBlbGVtZW50IHdoaWxlIGRyYWdnaW5nLiAqL1xuICBwcml2YXRlIF9jcmVhdGVQbGFjZWhvbGRlckVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyQ29uZmlnID0gdGhpcy5fcGxhY2Vob2xkZXJUZW1wbGF0ZTtcbiAgICBjb25zdCBwbGFjZWhvbGRlclRlbXBsYXRlID0gcGxhY2Vob2xkZXJDb25maWcgPyBwbGFjZWhvbGRlckNvbmZpZy50ZW1wbGF0ZSA6IG51bGw7XG4gICAgbGV0IHBsYWNlaG9sZGVyOiBIVE1MRWxlbWVudDtcblxuICAgIGlmIChwbGFjZWhvbGRlclRlbXBsYXRlKSB7XG4gICAgICB0aGlzLl9wbGFjZWhvbGRlclJlZiA9IHBsYWNlaG9sZGVyQ29uZmlnIS52aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgcGxhY2Vob2xkZXJUZW1wbGF0ZSxcbiAgICAgICAgcGxhY2Vob2xkZXJDb25maWchLmNvbnRleHQsXG4gICAgICApO1xuICAgICAgdGhpcy5fcGxhY2Vob2xkZXJSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgcGxhY2Vob2xkZXIgPSBnZXRSb290Tm9kZSh0aGlzLl9wbGFjZWhvbGRlclJlZiwgdGhpcy5fZG9jdW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwbGFjZWhvbGRlciA9IGRlZXBDbG9uZU5vZGUodGhpcy5fcm9vdEVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8vIFN0b3AgcG9pbnRlciBldmVudHMgb24gdGhlIHByZXZpZXcgc28gdGhlIHVzZXIgY2FuJ3RcbiAgICAvLyBpbnRlcmFjdCB3aXRoIGl0IHdoaWxlIHRoZSBwcmV2aWV3IGlzIGFuaW1hdGluZy5cbiAgICBwbGFjZWhvbGRlci5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgIHBsYWNlaG9sZGVyLmNsYXNzTGlzdC5hZGQoJ2Nkay1kcmFnLXBsYWNlaG9sZGVyJyk7XG4gICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpZ3VyZXMgb3V0IHRoZSBjb29yZGluYXRlcyBhdCB3aGljaCBhbiBlbGVtZW50IHdhcyBwaWNrZWQgdXAuXG4gICAqIEBwYXJhbSByZWZlcmVuY2VFbGVtZW50IEVsZW1lbnQgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdnaW5nLlxuICAgKiBAcGFyYW0gZXZlbnQgRXZlbnQgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdnaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UG9pbnRlclBvc2l0aW9uSW5FbGVtZW50KFxuICAgIGVsZW1lbnRSZWN0OiBET01SZWN0LFxuICAgIHJlZmVyZW5jZUVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCxcbiAgKTogUG9pbnQge1xuICAgIGNvbnN0IGhhbmRsZUVsZW1lbnQgPSByZWZlcmVuY2VFbGVtZW50ID09PSB0aGlzLl9yb290RWxlbWVudCA/IG51bGwgOiByZWZlcmVuY2VFbGVtZW50O1xuICAgIGNvbnN0IHJlZmVyZW5jZVJlY3QgPSBoYW5kbGVFbGVtZW50ID8gaGFuZGxlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IGVsZW1lbnRSZWN0O1xuICAgIGNvbnN0IHBvaW50ID0gaXNUb3VjaEV2ZW50KGV2ZW50KSA/IGV2ZW50LnRhcmdldFRvdWNoZXNbMF0gOiBldmVudDtcbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHRoaXMuX2dldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTtcbiAgICBjb25zdCB4ID0gcG9pbnQucGFnZVggLSByZWZlcmVuY2VSZWN0LmxlZnQgLSBzY3JvbGxQb3NpdGlvbi5sZWZ0O1xuICAgIGNvbnN0IHkgPSBwb2ludC5wYWdlWSAtIHJlZmVyZW5jZVJlY3QudG9wIC0gc2Nyb2xsUG9zaXRpb24udG9wO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHJlZmVyZW5jZVJlY3QubGVmdCAtIGVsZW1lbnRSZWN0LmxlZnQgKyB4LFxuICAgICAgeTogcmVmZXJlbmNlUmVjdC50b3AgLSBlbGVtZW50UmVjdC50b3AgKyB5LFxuICAgIH07XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgcG9pbnQgb2YgdGhlIHBhZ2UgdGhhdCB3YXMgdG91Y2hlZCBieSB0aGUgdXNlci4gKi9cbiAgcHJpdmF0ZSBfZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCk6IFBvaW50IHtcbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHRoaXMuX2dldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTtcbiAgICBjb25zdCBwb2ludCA9IGlzVG91Y2hFdmVudChldmVudClcbiAgICAgID8gLy8gYHRvdWNoZXNgIHdpbGwgYmUgZW1wdHkgZm9yIHN0YXJ0L2VuZCBldmVudHMgc28gd2UgaGF2ZSB0byBmYWxsIGJhY2sgdG8gYGNoYW5nZWRUb3VjaGVzYC5cbiAgICAgICAgLy8gQWxzbyBub3RlIHRoYXQgb24gcmVhbCBkZXZpY2VzIHdlJ3JlIGd1YXJhbnRlZWQgZm9yIGVpdGhlciBgdG91Y2hlc2Agb3IgYGNoYW5nZWRUb3VjaGVzYFxuICAgICAgICAvLyB0byBoYXZlIGEgdmFsdWUsIGJ1dCBGaXJlZm94IGluIGRldmljZSBlbXVsYXRpb24gbW9kZSBoYXMgYSBidWcgd2hlcmUgYm90aCBjYW4gYmUgZW1wdHlcbiAgICAgICAgLy8gZm9yIGB0b3VjaHN0YXJ0YCBhbmQgYHRvdWNoZW5kYCBzbyB3ZSBmYWxsIGJhY2sgdG8gYSBkdW1teSBvYmplY3QgaW4gb3JkZXIgdG8gYXZvaWRcbiAgICAgICAgLy8gdGhyb3dpbmcgYW4gZXJyb3IuIFRoZSB2YWx1ZSByZXR1cm5lZCBoZXJlIHdpbGwgYmUgaW5jb3JyZWN0LCBidXQgc2luY2UgdGhpcyBvbmx5XG4gICAgICAgIC8vIGJyZWFrcyBpbnNpZGUgYSBkZXZlbG9wZXIgdG9vbCBhbmQgdGhlIHZhbHVlIGlzIG9ubHkgdXNlZCBmb3Igc2Vjb25kYXJ5IGluZm9ybWF0aW9uLFxuICAgICAgICAvLyB3ZSBjYW4gZ2V0IGF3YXkgd2l0aCBpdC4gU2VlIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTE2MTU4MjQuXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0gfHwge3BhZ2VYOiAwLCBwYWdlWTogMH1cbiAgICAgIDogZXZlbnQ7XG5cbiAgICBjb25zdCB4ID0gcG9pbnQucGFnZVggLSBzY3JvbGxQb3NpdGlvbi5sZWZ0O1xuICAgIGNvbnN0IHkgPSBwb2ludC5wYWdlWSAtIHNjcm9sbFBvc2l0aW9uLnRvcDtcblxuICAgIC8vIGlmIGRyYWdnaW5nIFNWRyBlbGVtZW50LCB0cnkgdG8gY29udmVydCBmcm9tIHRoZSBzY3JlZW4gY29vcmRpbmF0ZSBzeXN0ZW0gdG8gdGhlIFNWR1xuICAgIC8vIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgaWYgKHRoaXMuX293bmVyU1ZHRWxlbWVudCkge1xuICAgICAgY29uc3Qgc3ZnTWF0cml4ID0gdGhpcy5fb3duZXJTVkdFbGVtZW50LmdldFNjcmVlbkNUTSgpO1xuICAgICAgaWYgKHN2Z01hdHJpeCkge1xuICAgICAgICBjb25zdCBzdmdQb2ludCA9IHRoaXMuX293bmVyU1ZHRWxlbWVudC5jcmVhdGVTVkdQb2ludCgpO1xuICAgICAgICBzdmdQb2ludC54ID0geDtcbiAgICAgICAgc3ZnUG9pbnQueSA9IHk7XG4gICAgICAgIHJldHVybiBzdmdQb2ludC5tYXRyaXhUcmFuc2Zvcm0oc3ZnTWF0cml4LmludmVyc2UoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHt4LCB5fTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBwb2ludGVyIHBvc2l0aW9uIG9uIHRoZSBwYWdlLCBhY2NvdW50aW5nIGZvciBhbnkgcG9zaXRpb24gY29uc3RyYWludHMuICovXG4gIHByaXZhdGUgX2dldENvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uKHBvaW50OiBQb2ludCk6IFBvaW50IHtcbiAgICBjb25zdCBkcm9wQ29udGFpbmVyTG9jayA9IHRoaXMuX2Ryb3BDb250YWluZXIgPyB0aGlzLl9kcm9wQ29udGFpbmVyLmxvY2tBeGlzIDogbnVsbDtcbiAgICBsZXQge3gsIHl9ID0gdGhpcy5jb25zdHJhaW5Qb3NpdGlvblxuICAgICAgPyB0aGlzLmNvbnN0cmFpblBvc2l0aW9uKHBvaW50LCB0aGlzLCB0aGlzLl9pbml0aWFsRG9tUmVjdCEsIHRoaXMuX3BpY2t1cFBvc2l0aW9uSW5FbGVtZW50KVxuICAgICAgOiBwb2ludDtcblxuICAgIGlmICh0aGlzLmxvY2tBeGlzID09PSAneCcgfHwgZHJvcENvbnRhaW5lckxvY2sgPT09ICd4Jykge1xuICAgICAgeSA9XG4gICAgICAgIHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlLnkgLVxuICAgICAgICAodGhpcy5jb25zdHJhaW5Qb3NpdGlvbiA/IHRoaXMuX3BpY2t1cFBvc2l0aW9uSW5FbGVtZW50LnkgOiAwKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubG9ja0F4aXMgPT09ICd5JyB8fCBkcm9wQ29udGFpbmVyTG9jayA9PT0gJ3knKSB7XG4gICAgICB4ID1cbiAgICAgICAgdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueCAtXG4gICAgICAgICh0aGlzLmNvbnN0cmFpblBvc2l0aW9uID8gdGhpcy5fcGlja3VwUG9zaXRpb25JbkVsZW1lbnQueCA6IDApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ib3VuZGFyeVJlY3QpIHtcbiAgICAgIC8vIElmIG5vdCB1c2luZyBhIGN1c3RvbSBjb25zdHJhaW4gd2UgbmVlZCB0byBhY2NvdW50IGZvciB0aGUgcGlja3VwIHBvc2l0aW9uIGluIHRoZSBlbGVtZW50XG4gICAgICAvLyBvdGhlcndpc2Ugd2UgZG8gbm90IG5lZWQgdG8gZG8gdGhpcywgYXMgaXQgaGFzIGFscmVhZHkgYmVlbiBhY2NvdW50ZWQgZm9yXG4gICAgICBjb25zdCB7eDogcGlja3VwWCwgeTogcGlja3VwWX0gPSAhdGhpcy5jb25zdHJhaW5Qb3NpdGlvblxuICAgICAgICA/IHRoaXMuX3BpY2t1cFBvc2l0aW9uSW5FbGVtZW50XG4gICAgICAgIDoge3g6IDAsIHk6IDB9O1xuXG4gICAgICBjb25zdCBib3VuZGFyeVJlY3QgPSB0aGlzLl9ib3VuZGFyeVJlY3Q7XG4gICAgICBjb25zdCB7d2lkdGg6IHByZXZpZXdXaWR0aCwgaGVpZ2h0OiBwcmV2aWV3SGVpZ2h0fSA9IHRoaXMuX2dldFByZXZpZXdSZWN0KCk7XG4gICAgICBjb25zdCBtaW5ZID0gYm91bmRhcnlSZWN0LnRvcCArIHBpY2t1cFk7XG4gICAgICBjb25zdCBtYXhZID0gYm91bmRhcnlSZWN0LmJvdHRvbSAtIChwcmV2aWV3SGVpZ2h0IC0gcGlja3VwWSk7XG4gICAgICBjb25zdCBtaW5YID0gYm91bmRhcnlSZWN0LmxlZnQgKyBwaWNrdXBYO1xuICAgICAgY29uc3QgbWF4WCA9IGJvdW5kYXJ5UmVjdC5yaWdodCAtIChwcmV2aWV3V2lkdGggLSBwaWNrdXBYKTtcblxuICAgICAgeCA9IGNsYW1wKHgsIG1pblgsIG1heFgpO1xuICAgICAgeSA9IGNsYW1wKHksIG1pblksIG1heFkpO1xuICAgIH1cblxuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgY3VycmVudCBkcmFnIGRlbHRhLCBiYXNlZCBvbiB0aGUgdXNlcidzIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBvbiB0aGUgcGFnZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUG9pbnRlckRpcmVjdGlvbkRlbHRhKHBvaW50ZXJQb3NpdGlvbk9uUGFnZTogUG9pbnQpIHtcbiAgICBjb25zdCB7eCwgeX0gPSBwb2ludGVyUG9zaXRpb25PblBhZ2U7XG4gICAgY29uc3QgZGVsdGEgPSB0aGlzLl9wb2ludGVyRGlyZWN0aW9uRGVsdGE7XG4gICAgY29uc3QgcG9zaXRpb25TaW5jZUxhc3RDaGFuZ2UgPSB0aGlzLl9wb2ludGVyUG9zaXRpb25BdExhc3REaXJlY3Rpb25DaGFuZ2U7XG5cbiAgICAvLyBBbW91bnQgb2YgcGl4ZWxzIHRoZSB1c2VyIGhhcyBkcmFnZ2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRpcmVjdGlvbiBjaGFuZ2VkLlxuICAgIGNvbnN0IGNoYW5nZVggPSBNYXRoLmFicyh4IC0gcG9zaXRpb25TaW5jZUxhc3RDaGFuZ2UueCk7XG4gICAgY29uc3QgY2hhbmdlWSA9IE1hdGguYWJzKHkgLSBwb3NpdGlvblNpbmNlTGFzdENoYW5nZS55KTtcblxuICAgIC8vIEJlY2F1c2Ugd2UgaGFuZGxlIHBvaW50ZXIgZXZlbnRzIG9uIGEgcGVyLXBpeGVsIGJhc2lzLCB3ZSBkb24ndCB3YW50IHRoZSBkZWx0YVxuICAgIC8vIHRvIGNoYW5nZSBmb3IgZXZlcnkgcGl4ZWwsIG90aGVyd2lzZSBhbnl0aGluZyB0aGF0IGRlcGVuZHMgb24gaXQgY2FuIGxvb2sgZXJyYXRpYy5cbiAgICAvLyBUbyBtYWtlIHRoZSBkZWx0YSBtb3JlIGNvbnNpc3RlbnQsIHdlIHRyYWNrIGhvdyBtdWNoIHRoZSB1c2VyIGhhcyBtb3ZlZCBzaW5jZSB0aGUgbGFzdFxuICAgIC8vIGRlbHRhIGNoYW5nZSBhbmQgd2Ugb25seSB1cGRhdGUgaXQgYWZ0ZXIgaXQgaGFzIHJlYWNoZWQgYSBjZXJ0YWluIHRocmVzaG9sZC5cbiAgICBpZiAoY2hhbmdlWCA+IHRoaXMuX2NvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkKSB7XG4gICAgICBkZWx0YS54ID0geCA+IHBvc2l0aW9uU2luY2VMYXN0Q2hhbmdlLnggPyAxIDogLTE7XG4gICAgICBwb3NpdGlvblNpbmNlTGFzdENoYW5nZS54ID0geDtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlWSA+IHRoaXMuX2NvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkKSB7XG4gICAgICBkZWx0YS55ID0geSA+IHBvc2l0aW9uU2luY2VMYXN0Q2hhbmdlLnkgPyAxIDogLTE7XG4gICAgICBwb3NpdGlvblNpbmNlTGFzdENoYW5nZS55ID0geTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVsdGE7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgbmF0aXZlIGRyYWcgaW50ZXJhY3Rpb25zLCBiYXNlZCBvbiBob3cgbWFueSBoYW5kbGVzIGFyZSByZWdpc3RlcmVkLiAqL1xuICBwcml2YXRlIF90b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zKCkge1xuICAgIGlmICghdGhpcy5fcm9vdEVsZW1lbnQgfHwgIXRoaXMuX2hhbmRsZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzaG91bGRFbmFibGUgPSB0aGlzLl9oYW5kbGVzLmxlbmd0aCA+IDAgfHwgIXRoaXMuaXNEcmFnZ2luZygpO1xuXG4gICAgaWYgKHNob3VsZEVuYWJsZSAhPT0gdGhpcy5fbmF0aXZlSW50ZXJhY3Rpb25zRW5hYmxlZCkge1xuICAgICAgdGhpcy5fbmF0aXZlSW50ZXJhY3Rpb25zRW5hYmxlZCA9IHNob3VsZEVuYWJsZTtcbiAgICAgIHRvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnModGhpcy5fcm9vdEVsZW1lbnQsIHNob3VsZEVuYWJsZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZXMgdGhlIG1hbnVhbGx5LWFkZGVkIGV2ZW50IGxpc3RlbmVycyBmcm9tIHRoZSByb290IGVsZW1lbnQuICovXG4gIHByaXZhdGUgX3JlbW92ZVJvb3RFbGVtZW50TGlzdGVuZXJzKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9wb2ludGVyRG93biwgYWN0aXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX3BvaW50ZXJEb3duLCBwYXNzaXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5fbmF0aXZlRHJhZ1N0YXJ0LCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhIGB0cmFuc2Zvcm1gIHRvIHRoZSByb290IGVsZW1lbnQsIHRha2luZyBpbnRvIGFjY291bnQgYW55IGV4aXN0aW5nIHRyYW5zZm9ybXMgb24gaXQuXG4gICAqIEBwYXJhbSB4IE5ldyB0cmFuc2Zvcm0gdmFsdWUgYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHkgTmV3IHRyYW5zZm9ybSB2YWx1ZSBhbG9uZyB0aGUgWSBheGlzLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlSb290RWxlbWVudFRyYW5zZm9ybSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGNvbnN0IHNjYWxlID0gMSAvIHRoaXMuc2NhbGU7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gZ2V0VHJhbnNmb3JtKHggKiBzY2FsZSwgeSAqIHNjYWxlKTtcbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLl9yb290RWxlbWVudC5zdHlsZTtcblxuICAgIC8vIENhY2hlIHRoZSBwcmV2aW91cyB0cmFuc2Zvcm0gYW1vdW50IG9ubHkgYWZ0ZXIgdGhlIGZpcnN0IGRyYWcgc2VxdWVuY2UsIGJlY2F1c2VcbiAgICAvLyB3ZSBkb24ndCB3YW50IG91ciBvd24gdHJhbnNmb3JtcyB0byBzdGFjayBvbiB0b3Agb2YgZWFjaCBvdGhlci5cbiAgICAvLyBTaG91bGQgYmUgZXhjbHVkZWQgbm9uZSBiZWNhdXNlIG5vbmUgKyB0cmFuc2xhdGUzZCh4LCB5LCB4KSBpcyBpbnZhbGlkIGNzc1xuICAgIGlmICh0aGlzLl9pbml0aWFsVHJhbnNmb3JtID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2luaXRpYWxUcmFuc2Zvcm0gPVxuICAgICAgICBzdHlsZXMudHJhbnNmb3JtICYmIHN0eWxlcy50cmFuc2Zvcm0gIT0gJ25vbmUnID8gc3R5bGVzLnRyYW5zZm9ybSA6ICcnO1xuICAgIH1cblxuICAgIC8vIFByZXNlcnZlIHRoZSBwcmV2aW91cyBgdHJhbnNmb3JtYCB2YWx1ZSwgaWYgdGhlcmUgd2FzIG9uZS4gTm90ZSB0aGF0IHdlIGFwcGx5IG91ciBvd25cbiAgICAvLyB0cmFuc2Zvcm0gYmVmb3JlIHRoZSB1c2VyJ3MsIGJlY2F1c2UgdGhpbmdzIGxpa2Ugcm90YXRpb24gY2FuIGFmZmVjdCB3aGljaCBkaXJlY3Rpb25cbiAgICAvLyB0aGUgZWxlbWVudCB3aWxsIGJlIHRyYW5zbGF0ZWQgdG93YXJkcy5cbiAgICBzdHlsZXMudHJhbnNmb3JtID0gY29tYmluZVRyYW5zZm9ybXModHJhbnNmb3JtLCB0aGlzLl9pbml0aWFsVHJhbnNmb3JtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgYHRyYW5zZm9ybWAgdG8gdGhlIHByZXZpZXcsIHRha2luZyBpbnRvIGFjY291bnQgYW55IGV4aXN0aW5nIHRyYW5zZm9ybXMgb24gaXQuXG4gICAqIEBwYXJhbSB4IE5ldyB0cmFuc2Zvcm0gdmFsdWUgYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHkgTmV3IHRyYW5zZm9ybSB2YWx1ZSBhbG9uZyB0aGUgWSBheGlzLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlQcmV2aWV3VHJhbnNmb3JtKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgLy8gT25seSBhcHBseSB0aGUgaW5pdGlhbCB0cmFuc2Zvcm0gaWYgdGhlIHByZXZpZXcgaXMgYSBjbG9uZSBvZiB0aGUgb3JpZ2luYWwgZWxlbWVudCwgb3RoZXJ3aXNlXG4gICAgLy8gaXQgY291bGQgYmUgY29tcGxldGVseSBkaWZmZXJlbnQgYW5kIHRoZSB0cmFuc2Zvcm0gbWlnaHQgbm90IG1ha2Ugc2Vuc2UgYW55bW9yZS5cbiAgICBjb25zdCBpbml0aWFsVHJhbnNmb3JtID0gdGhpcy5fcHJldmlld1RlbXBsYXRlPy50ZW1wbGF0ZSA/IHVuZGVmaW5lZCA6IHRoaXMuX2luaXRpYWxUcmFuc2Zvcm07XG4gICAgY29uc3QgdHJhbnNmb3JtID0gZ2V0VHJhbnNmb3JtKHgsIHkpO1xuICAgIHRoaXMuX3ByZXZpZXchLnNldFRyYW5zZm9ybShjb21iaW5lVHJhbnNmb3Jtcyh0cmFuc2Zvcm0sIGluaXRpYWxUcmFuc2Zvcm0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkaXN0YW5jZSB0aGF0IHRoZSB1c2VyIGhhcyBkcmFnZ2VkIGR1cmluZyB0aGUgY3VycmVudCBkcmFnIHNlcXVlbmNlLlxuICAgKiBAcGFyYW0gY3VycmVudFBvc2l0aW9uIEN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RHJhZ0Rpc3RhbmNlKGN1cnJlbnRQb3NpdGlvbjogUG9pbnQpOiBQb2ludCB7XG4gICAgY29uc3QgcGlja3VwUG9zaXRpb24gPSB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZTtcblxuICAgIGlmIChwaWNrdXBQb3NpdGlvbikge1xuICAgICAgcmV0dXJuIHt4OiBjdXJyZW50UG9zaXRpb24ueCAtIHBpY2t1cFBvc2l0aW9uLngsIHk6IGN1cnJlbnRQb3NpdGlvbi55IC0gcGlja3VwUG9zaXRpb24ueX07XG4gICAgfVxuXG4gICAgcmV0dXJuIHt4OiAwLCB5OiAwfTtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgYW55IGNhY2hlZCBlbGVtZW50IGRpbWVuc2lvbnMgdGhhdCB3ZSBkb24ndCBuZWVkIGFmdGVyIGRyYWdnaW5nIGhhcyBzdG9wcGVkLiAqL1xuICBwcml2YXRlIF9jbGVhbnVwQ2FjaGVkRGltZW5zaW9ucygpIHtcbiAgICB0aGlzLl9ib3VuZGFyeVJlY3QgPSB0aGlzLl9wcmV2aWV3UmVjdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9wYXJlbnRQb3NpdGlvbnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZWxlbWVudCBpcyBzdGlsbCBpbnNpZGUgaXRzIGJvdW5kYXJ5IGFmdGVyIHRoZSB2aWV3cG9ydCBoYXMgYmVlbiByZXNpemVkLlxuICAgKiBJZiBub3QsIHRoZSBwb3NpdGlvbiBpcyBhZGp1c3RlZCBzbyB0aGF0IHRoZSBlbGVtZW50IGZpdHMgYWdhaW4uXG4gICAqL1xuICBwcml2YXRlIF9jb250YWluSW5zaWRlQm91bmRhcnlPblJlc2l6ZSgpIHtcbiAgICBsZXQge3gsIHl9ID0gdGhpcy5fcGFzc2l2ZVRyYW5zZm9ybTtcblxuICAgIGlmICgoeCA9PT0gMCAmJiB5ID09PSAwKSB8fCB0aGlzLmlzRHJhZ2dpbmcoKSB8fCAhdGhpcy5fYm91bmRhcnlFbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTm90ZTogZG9uJ3QgdXNlIGBfY2xpZW50UmVjdEF0U3RhcnRgIGhlcmUsIGJlY2F1c2Ugd2Ugd2FudCB0aGUgbGF0ZXN0IHBvc2l0aW9uLlxuICAgIGNvbnN0IGVsZW1lbnRSZWN0ID0gdGhpcy5fcm9vdEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgYm91bmRhcnlSZWN0ID0gdGhpcy5fYm91bmRhcnlFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHRoZSBlbGVtZW50IGdvdCBoaWRkZW4gYXdheSBhZnRlciBkcmFnZ2luZyAoZS5nLiBieSBzd2l0Y2hpbmcgdG8gYVxuICAgIC8vIGRpZmZlcmVudCB0YWIpLiBEb24ndCBkbyBhbnl0aGluZyBpbiB0aGlzIGNhc2Ugc28gd2UgZG9uJ3QgY2xlYXIgdGhlIHVzZXIncyBwb3NpdGlvbi5cbiAgICBpZiAoXG4gICAgICAoYm91bmRhcnlSZWN0LndpZHRoID09PSAwICYmIGJvdW5kYXJ5UmVjdC5oZWlnaHQgPT09IDApIHx8XG4gICAgICAoZWxlbWVudFJlY3Qud2lkdGggPT09IDAgJiYgZWxlbWVudFJlY3QuaGVpZ2h0ID09PSAwKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxlZnRPdmVyZmxvdyA9IGJvdW5kYXJ5UmVjdC5sZWZ0IC0gZWxlbWVudFJlY3QubGVmdDtcbiAgICBjb25zdCByaWdodE92ZXJmbG93ID0gZWxlbWVudFJlY3QucmlnaHQgLSBib3VuZGFyeVJlY3QucmlnaHQ7XG4gICAgY29uc3QgdG9wT3ZlcmZsb3cgPSBib3VuZGFyeVJlY3QudG9wIC0gZWxlbWVudFJlY3QudG9wO1xuICAgIGNvbnN0IGJvdHRvbU92ZXJmbG93ID0gZWxlbWVudFJlY3QuYm90dG9tIC0gYm91bmRhcnlSZWN0LmJvdHRvbTtcblxuICAgIC8vIElmIHRoZSBlbGVtZW50IGhhcyBiZWNvbWUgd2lkZXIgdGhhbiB0aGUgYm91bmRhcnksIHdlIGNhbid0XG4gICAgLy8gZG8gbXVjaCB0byBtYWtlIGl0IGZpdCBzbyB3ZSBqdXN0IGFuY2hvciBpdCB0byB0aGUgbGVmdC5cbiAgICBpZiAoYm91bmRhcnlSZWN0LndpZHRoID4gZWxlbWVudFJlY3Qud2lkdGgpIHtcbiAgICAgIGlmIChsZWZ0T3ZlcmZsb3cgPiAwKSB7XG4gICAgICAgIHggKz0gbGVmdE92ZXJmbG93O1xuICAgICAgfVxuXG4gICAgICBpZiAocmlnaHRPdmVyZmxvdyA+IDApIHtcbiAgICAgICAgeCAtPSByaWdodE92ZXJmbG93O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB4ID0gMDtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgYmVjb21lIHRhbGxlciB0aGFuIHRoZSBib3VuZGFyeSwgd2UgY2FuJ3RcbiAgICAvLyBkbyBtdWNoIHRvIG1ha2UgaXQgZml0IHNvIHdlIGp1c3QgYW5jaG9yIGl0IHRvIHRoZSB0b3AuXG4gICAgaWYgKGJvdW5kYXJ5UmVjdC5oZWlnaHQgPiBlbGVtZW50UmVjdC5oZWlnaHQpIHtcbiAgICAgIGlmICh0b3BPdmVyZmxvdyA+IDApIHtcbiAgICAgICAgeSArPSB0b3BPdmVyZmxvdztcbiAgICAgIH1cblxuICAgICAgaWYgKGJvdHRvbU92ZXJmbG93ID4gMCkge1xuICAgICAgICB5IC09IGJvdHRvbU92ZXJmbG93O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB5ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoeCAhPT0gdGhpcy5fcGFzc2l2ZVRyYW5zZm9ybS54IHx8IHkgIT09IHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueSkge1xuICAgICAgdGhpcy5zZXRGcmVlRHJhZ1Bvc2l0aW9uKHt5LCB4fSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRyYWcgc3RhcnQgZGVsYXksIGJhc2VkIG9uIHRoZSBldmVudCB0eXBlLiAqL1xuICBwcml2YXRlIF9nZXREcmFnU3RhcnREZWxheShldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpOiBudW1iZXIge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5kcmFnU3RhcnREZWxheTtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChpc1RvdWNoRXZlbnQoZXZlbnQpKSB7XG4gICAgICByZXR1cm4gdmFsdWUudG91Y2g7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUubW91c2UgOiAwO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIGludGVybmFsIHN0YXRlIG9mIHRoZSBkcmFnZ2FibGUgZWxlbWVudCB3aGVuIHNjcm9sbGluZyBoYXMgb2NjdXJyZWQuICovXG4gIHByaXZhdGUgX3VwZGF0ZU9uU2Nyb2xsKGV2ZW50OiBFdmVudCkge1xuICAgIGNvbnN0IHNjcm9sbERpZmZlcmVuY2UgPSB0aGlzLl9wYXJlbnRQb3NpdGlvbnMuaGFuZGxlU2Nyb2xsKGV2ZW50KTtcblxuICAgIGlmIChzY3JvbGxEaWZmZXJlbmNlKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQ8SFRNTEVsZW1lbnQgfCBEb2N1bWVudD4oZXZlbnQpITtcblxuICAgICAgLy8gRE9NUmVjdCBkaW1lbnNpb25zIGFyZSBiYXNlZCBvbiB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSBwYWdlIGFuZCBpdHMgcGFyZW50XG4gICAgICAvLyBub2RlIHNvIHdlIGhhdmUgdG8gdXBkYXRlIHRoZSBjYWNoZWQgYm91bmRhcnkgRE9NUmVjdCBpZiB0aGUgdXNlciBoYXMgc2Nyb2xsZWQuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2JvdW5kYXJ5UmVjdCAmJlxuICAgICAgICB0YXJnZXQgIT09IHRoaXMuX2JvdW5kYXJ5RWxlbWVudCAmJlxuICAgICAgICB0YXJnZXQuY29udGFpbnModGhpcy5fYm91bmRhcnlFbGVtZW50KVxuICAgICAgKSB7XG4gICAgICAgIGFkanVzdERvbVJlY3QodGhpcy5fYm91bmRhcnlSZWN0LCBzY3JvbGxEaWZmZXJlbmNlLnRvcCwgc2Nyb2xsRGlmZmVyZW5jZS5sZWZ0KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueCArPSBzY3JvbGxEaWZmZXJlbmNlLmxlZnQ7XG4gICAgICB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZS55ICs9IHNjcm9sbERpZmZlcmVuY2UudG9wO1xuXG4gICAgICAvLyBJZiB3ZSdyZSBpbiBmcmVlIGRyYWcgbW9kZSwgd2UgaGF2ZSB0byB1cGRhdGUgdGhlIGFjdGl2ZSB0cmFuc2Zvcm0sIGJlY2F1c2VcbiAgICAgIC8vIGl0IGlzbid0IHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydCBsaWtlIHRoZSBwcmV2aWV3IGluc2lkZSBhIGRyb3AgbGlzdC5cbiAgICAgIGlmICghdGhpcy5fZHJvcENvbnRhaW5lcikge1xuICAgICAgICB0aGlzLl9hY3RpdmVUcmFuc2Zvcm0ueCAtPSBzY3JvbGxEaWZmZXJlbmNlLmxlZnQ7XG4gICAgICAgIHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS55IC09IHNjcm9sbERpZmZlcmVuY2UudG9wO1xuICAgICAgICB0aGlzLl9hcHBseVJvb3RFbGVtZW50VHJhbnNmb3JtKHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS54LCB0aGlzLl9hY3RpdmVUcmFuc2Zvcm0ueSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2dldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5wb3NpdGlvbnMuZ2V0KHRoaXMuX2RvY3VtZW50KT8uc2Nyb2xsUG9zaXRpb24gfHxcbiAgICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIExhemlseSByZXNvbHZlcyBhbmQgcmV0dXJucyB0aGUgc2hhZG93IHJvb3Qgb2YgdGhlIGVsZW1lbnQuIFdlIGRvIHRoaXMgaW4gYSBmdW5jdGlvbiwgcmF0aGVyXG4gICAqIHRoYW4gc2F2aW5nIGl0IGluIHByb3BlcnR5IGRpcmVjdGx5IG9uIGluaXQsIGJlY2F1c2Ugd2Ugd2FudCB0byByZXNvbHZlIGl0IGFzIGxhdGUgYXMgcG9zc2libGVcbiAgICogaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaGFzIGJlZW4gbW92ZWQgaW50byB0aGUgc2hhZG93IERPTS4gRG9pbmcgaXQgaW5zaWRlIHRoZVxuICAgKiBjb25zdHJ1Y3RvciBtaWdodCBiZSB0b28gZWFybHkgaWYgdGhlIGVsZW1lbnQgaXMgaW5zaWRlIG9mIHNvbWV0aGluZyBsaWtlIGBuZ0ZvcmAgb3IgYG5nSWZgLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0U2hhZG93Um9vdCgpOiBTaGFkb3dSb290IHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZFNoYWRvd1Jvb3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY2FjaGVkU2hhZG93Um9vdCA9IF9nZXRTaGFkb3dSb290KHRoaXMuX3Jvb3RFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkU2hhZG93Um9vdDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBlbGVtZW50IGludG8gd2hpY2ggdGhlIGRyYWcgcHJldmlldyBzaG91bGQgYmUgaW5zZXJ0ZWQuICovXG4gIHByaXZhdGUgX2dldFByZXZpZXdJbnNlcnRpb25Qb2ludChcbiAgICBpbml0aWFsUGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBzaGFkb3dSb290OiBTaGFkb3dSb290IHwgbnVsbCxcbiAgKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHByZXZpZXdDb250YWluZXIgPSB0aGlzLl9wcmV2aWV3Q29udGFpbmVyIHx8ICdnbG9iYWwnO1xuXG4gICAgaWYgKHByZXZpZXdDb250YWluZXIgPT09ICdwYXJlbnQnKSB7XG4gICAgICByZXR1cm4gaW5pdGlhbFBhcmVudDtcbiAgICB9XG5cbiAgICBpZiAocHJldmlld0NvbnRhaW5lciA9PT0gJ2dsb2JhbCcpIHtcbiAgICAgIGNvbnN0IGRvY3VtZW50UmVmID0gdGhpcy5fZG9jdW1lbnQ7XG5cbiAgICAgIC8vIFdlIGNhbid0IHVzZSB0aGUgYm9keSBpZiB0aGUgdXNlciBpcyBpbiBmdWxsc2NyZWVuIG1vZGUsXG4gICAgICAvLyBiZWNhdXNlIHRoZSBwcmV2aWV3IHdpbGwgcmVuZGVyIHVuZGVyIHRoZSBmdWxsc2NyZWVuIGVsZW1lbnQuXG4gICAgICAvLyBUT0RPKGNyaXNiZXRvKTogZGVkdXBlIHRoaXMgd2l0aCB0aGUgYEZ1bGxzY3JlZW5PdmVybGF5Q29udGFpbmVyYCBldmVudHVhbGx5LlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgc2hhZG93Um9vdCB8fFxuICAgICAgICBkb2N1bWVudFJlZi5mdWxsc2NyZWVuRWxlbWVudCB8fFxuICAgICAgICAoZG9jdW1lbnRSZWYgYXMgYW55KS53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCB8fFxuICAgICAgICAoZG9jdW1lbnRSZWYgYXMgYW55KS5tb3pGdWxsU2NyZWVuRWxlbWVudCB8fFxuICAgICAgICAoZG9jdW1lbnRSZWYgYXMgYW55KS5tc0Z1bGxzY3JlZW5FbGVtZW50IHx8XG4gICAgICAgIGRvY3VtZW50UmVmLmJvZHlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZXJjZUVsZW1lbnQocHJldmlld0NvbnRhaW5lcik7XG4gIH1cblxuICAvKiogTGF6aWx5IHJlc29sdmVzIGFuZCByZXR1cm5zIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBwcmV2aWV3LiAqL1xuICBwcml2YXRlIF9nZXRQcmV2aWV3UmVjdCgpOiBET01SZWN0IHtcbiAgICAvLyBDYWNoZSB0aGUgcHJldmlldyBlbGVtZW50IHJlY3QgaWYgd2UgaGF2ZW4ndCBjYWNoZWQgaXQgYWxyZWFkeSBvciBpZlxuICAgIC8vIHdlIGNhY2hlZCBpdCB0b28gZWFybHkgYmVmb3JlIHRoZSBlbGVtZW50IGRpbWVuc2lvbnMgd2VyZSBjb21wdXRlZC5cbiAgICBpZiAoIXRoaXMuX3ByZXZpZXdSZWN0IHx8ICghdGhpcy5fcHJldmlld1JlY3Qud2lkdGggJiYgIXRoaXMuX3ByZXZpZXdSZWN0LmhlaWdodCkpIHtcbiAgICAgIHRoaXMuX3ByZXZpZXdSZWN0ID0gdGhpcy5fcHJldmlld1xuICAgICAgICA/IHRoaXMuX3ByZXZpZXchLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIDogdGhpcy5faW5pdGlhbERvbVJlY3QhO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wcmV2aWV3UmVjdDtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGEgbmF0aXZlIGBkcmFnc3RhcnRgIGV2ZW50LiAqL1xuICBwcml2YXRlIF9uYXRpdmVEcmFnU3RhcnQgPSAoZXZlbnQ6IERyYWdFdmVudCkgPT4ge1xuICAgIGlmICh0aGlzLl9oYW5kbGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgdGFyZ2V0SGFuZGxlID0gdGhpcy5fZ2V0VGFyZ2V0SGFuZGxlKGV2ZW50KTtcblxuICAgICAgaWYgKHRhcmdldEhhbmRsZSAmJiAhdGhpcy5fZGlzYWJsZWRIYW5kbGVzLmhhcyh0YXJnZXRIYW5kbGUpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgLy8gVXN1YWxseSB0aGlzIGlzbid0IG5lY2Vzc2FyeSBzaW5jZSB0aGUgd2UgcHJldmVudCB0aGUgZGVmYXVsdCBhY3Rpb24gaW4gYHBvaW50ZXJEb3duYCxcbiAgICAgIC8vIGJ1dCBzb21lIGNhc2VzIGxpa2UgZHJhZ2dpbmcgb2YgbGlua3MgY2FuIHNsaXAgdGhyb3VnaCAoc2VlICMyNDQwMykuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfTtcblxuICAvKiogR2V0cyBhIGhhbmRsZSB0aGF0IGlzIHRoZSB0YXJnZXQgb2YgYW4gZXZlbnQuICovXG4gIHByaXZhdGUgX2dldFRhcmdldEhhbmRsZShldmVudDogRXZlbnQpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbmRsZXMuZmluZChoYW5kbGUgPT4ge1xuICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldCAmJiAoZXZlbnQudGFyZ2V0ID09PSBoYW5kbGUgfHwgaGFuZGxlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCBhcyBOb2RlKSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqIENsYW1wcyBhIHZhbHVlIGJldHdlZW4gYSBtaW5pbXVtIGFuZCBhIG1heGltdW0uICovXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xufVxuXG4vKiogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGV2ZW50IGlzIGEgdG91Y2ggZXZlbnQuICovXG5mdW5jdGlvbiBpc1RvdWNoRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogZXZlbnQgaXMgVG91Y2hFdmVudCB7XG4gIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGZvciBldmVyeSBwaXhlbCB0aGF0IHRoZSB1c2VyIGhhcyBkcmFnZ2VkIHNvIHdlIG5lZWQgaXQgdG8gYmVcbiAgLy8gYXMgZmFzdCBhcyBwb3NzaWJsZS4gU2luY2Ugd2Ugb25seSBiaW5kIG1vdXNlIGV2ZW50cyBhbmQgdG91Y2ggZXZlbnRzLCB3ZSBjYW4gYXNzdW1lXG4gIC8vIHRoYXQgaWYgdGhlIGV2ZW50J3MgbmFtZSBzdGFydHMgd2l0aCBgdGAsIGl0J3MgYSB0b3VjaCBldmVudC5cbiAgcmV0dXJuIGV2ZW50LnR5cGVbMF0gPT09ICd0Jztcbn1cblxuLyoqIENhbGxiYWNrIGludm9rZWQgZm9yIGBzZWxlY3RzdGFydGAgZXZlbnRzIGluc2lkZSB0aGUgc2hhZG93IERPTS4gKi9cbmZ1bmN0aW9uIHNoYWRvd0RvbVNlbGVjdFN0YXJ0KGV2ZW50OiBFdmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufVxuIl19