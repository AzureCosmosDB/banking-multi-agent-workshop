import * as i0 from '@angular/core';
import { signal, Component, ViewEncapsulation, ChangeDetectionStrategy, inject, ApplicationRef, EnvironmentInjector, createComponent, Injectable, Inject, InjectionToken, booleanAttribute, Directive, Optional, SkipSelf, Input, EventEmitter, Injector, afterNextRender, numberAttribute, Self, Output, NgModule } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as i1 from '@angular/cdk/scrolling';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { isFakeTouchstartFromScreenReader, isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';
import { coerceElement, coerceNumberProperty, coerceArray } from '@angular/cdk/coercion';
import { _getEventTarget, normalizePassiveListenerOptions, _getShadowRoot } from '@angular/cdk/platform';
import { Subject, Subscription, interval, animationFrameScheduler, Observable, merge, BehaviorSubject } from 'rxjs';
import { takeUntil, map, take, tap, switchMap, startWith } from 'rxjs/operators';
import * as i1$1 from '@angular/cdk/bidi';

/** Creates a deep clone of an element. */
function deepCloneNode(node) {
    const clone = node.cloneNode(true);
    const descendantsWithId = clone.querySelectorAll('[id]');
    const nodeName = node.nodeName.toLowerCase();
    // Remove the `id` to avoid having multiple elements with the same id on the page.
    clone.removeAttribute('id');
    for (let i = 0; i < descendantsWithId.length; i++) {
        descendantsWithId[i].removeAttribute('id');
    }
    if (nodeName === 'canvas') {
        transferCanvasData(node, clone);
    }
    else if (nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea') {
        transferInputData(node, clone);
    }
    transferData('canvas', node, clone, transferCanvasData);
    transferData('input, textarea, select', node, clone, transferInputData);
    return clone;
}
/** Matches elements between an element and its clone and allows for their data to be cloned. */
function transferData(selector, node, clone, callback) {
    const descendantElements = node.querySelectorAll(selector);
    if (descendantElements.length) {
        const cloneElements = clone.querySelectorAll(selector);
        for (let i = 0; i < descendantElements.length; i++) {
            callback(descendantElements[i], cloneElements[i]);
        }
    }
}
// Counter for unique cloned radio button names.
let cloneUniqueId = 0;
/** Transfers the data of one input element to another. */
function transferInputData(source, clone) {
    // Browsers throw an error when assigning the value of a file input programmatically.
    if (clone.type !== 'file') {
        clone.value = source.value;
    }
    // Radio button `name` attributes must be unique for radio button groups
    // otherwise original radio buttons can lose their checked state
    // once the clone is inserted in the DOM.
    if (clone.type === 'radio' && clone.name) {
        clone.name = `mat-clone-${clone.name}-${cloneUniqueId++}`;
    }
}
/** Transfers the data of one canvas element to another. */
function transferCanvasData(source, clone) {
    const context = clone.getContext('2d');
    if (context) {
        // In some cases `drawImage` can throw (e.g. if the canvas size is 0x0).
        // We can't do much about it so just ignore the error.
        try {
            context.drawImage(source, 0, 0);
        }
        catch { }
    }
}

/** Gets a mutable version of an element's bounding `DOMRect`. */
function getMutableClientRect(element) {
    const rect = element.getBoundingClientRect();
    // We need to clone the `clientRect` here, because all the values on it are readonly
    // and we need to be able to update them. Also we can't use a spread here, because
    // the values on a `DOMRect` aren't own properties. See:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect#Notes
    return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
    };
}
/**
 * Checks whether some coordinates are within a `DOMRect`.
 * @param clientRect DOMRect that is being checked.
 * @param x Coordinates along the X axis.
 * @param y Coordinates along the Y axis.
 */
function isInsideClientRect(clientRect, x, y) {
    const { top, bottom, left, right } = clientRect;
    return y >= top && y <= bottom && x >= left && x <= right;
}
/**
 * Updates the top/left positions of a `DOMRect`, as well as their bottom/right counterparts.
 * @param domRect `DOMRect` that should be updated.
 * @param top Amount to add to the `top` position.
 * @param left Amount to add to the `left` position.
 */
function adjustDomRect(domRect, top, left) {
    domRect.top += top;
    domRect.bottom = domRect.top + domRect.height;
    domRect.left += left;
    domRect.right = domRect.left + domRect.width;
}
/**
 * Checks whether the pointer coordinates are close to a DOMRect.
 * @param rect DOMRect to check against.
 * @param threshold Threshold around the DOMRect.
 * @param pointerX Coordinates along the X axis.
 * @param pointerY Coordinates along the Y axis.
 */
function isPointerNearDomRect(rect, threshold, pointerX, pointerY) {
    const { top, right, bottom, left, width, height } = rect;
    const xThreshold = width * threshold;
    const yThreshold = height * threshold;
    return (pointerY > top - yThreshold &&
        pointerY < bottom + yThreshold &&
        pointerX > left - xThreshold &&
        pointerX < right + xThreshold);
}

/** Keeps track of the scroll position and dimensions of the parents of an element. */
class ParentPositionTracker {
    constructor(_document) {
        this._document = _document;
        /** Cached positions of the scrollable parent elements. */
        this.positions = new Map();
    }
    /** Clears the cached positions. */
    clear() {
        this.positions.clear();
    }
    /** Caches the positions. Should be called at the beginning of a drag sequence. */
    cache(elements) {
        this.clear();
        this.positions.set(this._document, {
            scrollPosition: this.getViewportScrollPosition(),
        });
        elements.forEach(element => {
            this.positions.set(element, {
                scrollPosition: { top: element.scrollTop, left: element.scrollLeft },
                clientRect: getMutableClientRect(element),
            });
        });
    }
    /** Handles scrolling while a drag is taking place. */
    handleScroll(event) {
        const target = _getEventTarget(event);
        const cachedPosition = this.positions.get(target);
        if (!cachedPosition) {
            return null;
        }
        const scrollPosition = cachedPosition.scrollPosition;
        let newTop;
        let newLeft;
        if (target === this._document) {
            const viewportScrollPosition = this.getViewportScrollPosition();
            newTop = viewportScrollPosition.top;
            newLeft = viewportScrollPosition.left;
        }
        else {
            newTop = target.scrollTop;
            newLeft = target.scrollLeft;
        }
        const topDifference = scrollPosition.top - newTop;
        const leftDifference = scrollPosition.left - newLeft;
        // Go through and update the cached positions of the scroll
        // parents that are inside the element that was scrolled.
        this.positions.forEach((position, node) => {
            if (position.clientRect && target !== node && target.contains(node)) {
                adjustDomRect(position.clientRect, topDifference, leftDifference);
            }
        });
        scrollPosition.top = newTop;
        scrollPosition.left = newLeft;
        return { top: topDifference, left: leftDifference };
    }
    /**
     * Gets the scroll position of the viewport. Note that we use the scrollX and scrollY directly,
     * instead of going through the `ViewportRuler`, because the first value the ruler looks at is
     * the top/left offset of the `document.documentElement` which works for most cases, but breaks
     * if the element is offset by something like the `BlockScrollStrategy`.
     */
    getViewportScrollPosition() {
        return { top: window.scrollY, left: window.scrollX };
    }
}

/**
 * Gets the root HTML element of an embedded view.
 * If the root is not an HTML element it gets wrapped in one.
 */
function getRootNode(viewRef, _document) {
    const rootNodes = viewRef.rootNodes;
    if (rootNodes.length === 1 && rootNodes[0].nodeType === _document.ELEMENT_NODE) {
        return rootNodes[0];
    }
    const wrapper = _document.createElement('div');
    rootNodes.forEach(node => wrapper.appendChild(node));
    return wrapper;
}

/**
 * Shallow-extends a stylesheet object with another stylesheet-like object.
 * Note that the keys in `source` have to be dash-cased.
 * @docs-private
 */
function extendStyles(dest, source, importantProperties) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            const value = source[key];
            if (value) {
                dest.setProperty(key, value, importantProperties?.has(key) ? 'important' : '');
            }
            else {
                dest.removeProperty(key);
            }
        }
    }
    return dest;
}
/**
 * Toggles whether the native drag interactions should be enabled for an element.
 * @param element Element on which to toggle the drag interactions.
 * @param enable Whether the drag interactions should be enabled.
 * @docs-private
 */
function toggleNativeDragInteractions(element, enable) {
    const userSelect = enable ? '' : 'none';
    extendStyles(element.style, {
        'touch-action': enable ? '' : 'none',
        '-webkit-user-drag': enable ? '' : 'none',
        '-webkit-tap-highlight-color': enable ? '' : 'transparent',
        'user-select': userSelect,
        '-ms-user-select': userSelect,
        '-webkit-user-select': userSelect,
        '-moz-user-select': userSelect,
    });
}
/**
 * Toggles whether an element is visible while preserving its dimensions.
 * @param element Element whose visibility to toggle
 * @param enable Whether the element should be visible.
 * @param importantProperties Properties to be set as `!important`.
 * @docs-private
 */
function toggleVisibility(element, enable, importantProperties) {
    extendStyles(element.style, {
        position: enable ? '' : 'fixed',
        top: enable ? '' : '0',
        opacity: enable ? '' : '0',
        left: enable ? '' : '-999em',
    }, importantProperties);
}
/**
 * Combines a transform string with an optional other transform
 * that exited before the base transform was applied.
 */
function combineTransforms(transform, initialTransform) {
    return initialTransform && initialTransform != 'none'
        ? transform + ' ' + initialTransform
        : transform;
}
/**
 * Matches the target element's size to the source's size.
 * @param target Element that needs to be resized.
 * @param sourceRect Dimensions of the source element.
 */
function matchElementSize(target, sourceRect) {
    target.style.width = `${sourceRect.width}px`;
    target.style.height = `${sourceRect.height}px`;
    target.style.transform = getTransform(sourceRect.left, sourceRect.top);
}
/**
 * Gets a 3d `transform` that can be applied to an element.
 * @param x Desired position of the element along the X axis.
 * @param y Desired position of the element along the Y axis.
 */
function getTransform(x, y) {
    // Round the transforms since some browsers will
    // blur the elements for sub-pixel transforms.
    return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

/** Parses a CSS time value to milliseconds. */
function parseCssTimeUnitsToMs(value) {
    // Some browsers will return it in seconds, whereas others will return milliseconds.
    const multiplier = value.toLowerCase().indexOf('ms') > -1 ? 1 : 1000;
    return parseFloat(value) * multiplier;
}
/** Gets the transform transition duration, including the delay, of an element in milliseconds. */
function getTransformTransitionDurationInMs(element) {
    const computedStyle = getComputedStyle(element);
    const transitionedProperties = parseCssPropertyValue(computedStyle, 'transition-property');
    const property = transitionedProperties.find(prop => prop === 'transform' || prop === 'all');
    // If there's no transition for `all` or `transform`, we shouldn't do anything.
    if (!property) {
        return 0;
    }
    // Get the index of the property that we're interested in and match
    // it up to the same index in `transition-delay` and `transition-duration`.
    const propertyIndex = transitionedProperties.indexOf(property);
    const rawDurations = parseCssPropertyValue(computedStyle, 'transition-duration');
    const rawDelays = parseCssPropertyValue(computedStyle, 'transition-delay');
    return (parseCssTimeUnitsToMs(rawDurations[propertyIndex]) +
        parseCssTimeUnitsToMs(rawDelays[propertyIndex]));
}
/** Parses out multiple values from a computed style into an array. */
function parseCssPropertyValue(computedStyle, name) {
    const value = computedStyle.getPropertyValue(name);
    return value.split(',').map(part => part.trim());
}

/** Inline styles to be set as `!important` while dragging. */
const importantProperties = new Set([
    // Needs to be important, because some `mat-table` sets `position: sticky !important`. See #22781.
    'position',
]);
class PreviewRef {
    get element() {
        return this._preview;
    }
    constructor(_document, _rootElement, _direction, _initialDomRect, _previewTemplate, _previewClass, _pickupPositionOnPage, _initialTransform, _zIndex) {
        this._document = _document;
        this._rootElement = _rootElement;
        this._direction = _direction;
        this._initialDomRect = _initialDomRect;
        this._previewTemplate = _previewTemplate;
        this._previewClass = _previewClass;
        this._pickupPositionOnPage = _pickupPositionOnPage;
        this._initialTransform = _initialTransform;
        this._zIndex = _zIndex;
    }
    attach(parent) {
        this._preview = this._createPreview();
        parent.appendChild(this._preview);
        // The null check is necessary for browsers that don't support the popover API.
        // Note that we use a string access for compatibility with Closure.
        if (supportsPopover(this._preview)) {
            this._preview['showPopover']();
        }
    }
    destroy() {
        this._preview.remove();
        this._previewEmbeddedView?.destroy();
        this._preview = this._previewEmbeddedView = null;
    }
    setTransform(value) {
        this._preview.style.transform = value;
    }
    getBoundingClientRect() {
        return this._preview.getBoundingClientRect();
    }
    addClass(className) {
        this._preview.classList.add(className);
    }
    getTransitionDuration() {
        return getTransformTransitionDurationInMs(this._preview);
    }
    addEventListener(name, handler) {
        this._preview.addEventListener(name, handler);
    }
    removeEventListener(name, handler) {
        this._preview.removeEventListener(name, handler);
    }
    _createPreview() {
        const previewConfig = this._previewTemplate;
        const previewClass = this._previewClass;
        const previewTemplate = previewConfig ? previewConfig.template : null;
        let preview;
        if (previewTemplate && previewConfig) {
            // Measure the element before we've inserted the preview
            // since the insertion could throw off the measurement.
            const rootRect = previewConfig.matchSize ? this._initialDomRect : null;
            const viewRef = previewConfig.viewContainer.createEmbeddedView(previewTemplate, previewConfig.context);
            viewRef.detectChanges();
            preview = getRootNode(viewRef, this._document);
            this._previewEmbeddedView = viewRef;
            if (previewConfig.matchSize) {
                matchElementSize(preview, rootRect);
            }
            else {
                preview.style.transform = getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
            }
        }
        else {
            preview = deepCloneNode(this._rootElement);
            matchElementSize(preview, this._initialDomRect);
            if (this._initialTransform) {
                preview.style.transform = this._initialTransform;
            }
        }
        extendStyles(preview.style, {
            // It's important that we disable the pointer events on the preview, because
            // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
            'pointer-events': 'none',
            // If the preview has a margin, it can throw off our positioning so we reset it. The reset
            // value for `margin-right` needs to be `auto` when opened as a popover, because our
            // positioning is always top/left based, but native popover seems to position itself
            // to the top/right if `<html>` or `<body>` have `dir="rtl"` (see #29604). Setting it
            // to `auto` pushed it to the top/left corner in RTL and is a noop in LTR.
            'margin': supportsPopover(preview) ? '0 auto 0 0' : '0',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': this._zIndex + '',
        }, importantProperties);
        toggleNativeDragInteractions(preview, false);
        preview.classList.add('cdk-drag-preview');
        preview.setAttribute('popover', 'manual');
        preview.setAttribute('dir', this._direction);
        if (previewClass) {
            if (Array.isArray(previewClass)) {
                previewClass.forEach(className => preview.classList.add(className));
            }
            else {
                preview.classList.add(previewClass);
            }
        }
        return preview;
    }
}
/** Checks whether a specific element supports the popover API. */
function supportsPopover(element) {
    return 'showPopover' in element;
}

/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({ passive: false });
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions$1 = normalizePassiveListenerOptions({
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
class DragRef {
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
        this._getShadowRoot()?.removeEventListener('selectstart', shadowDomSelectStart, activeCapturingEventOptions$1);
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
                shadowRoot.addEventListener('selectstart', shadowDomSelectStart, activeCapturingEventOptions$1);
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
            x = clamp$1(x, minX, maxX);
            y = clamp$1(y, minY, maxY);
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
function clamp$1(value, min, max) {
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

/**
 * Moves an item one index in an array to another.
 * @param array Array in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which the item should be moved.
 */
function moveItemInArray(array, fromIndex, toIndex) {
    const from = clamp(fromIndex, array.length - 1);
    const to = clamp(toIndex, array.length - 1);
    if (from === to) {
        return;
    }
    const target = array[from];
    const delta = to < from ? -1 : 1;
    for (let i = from; i !== to; i += delta) {
        array[i] = array[i + delta];
    }
    array[to] = target;
}
/**
 * Moves an item from one array to another.
 * @param currentArray Array from which to transfer the item.
 * @param targetArray Array into which to put the item.
 * @param currentIndex Index of the item in its current array.
 * @param targetIndex Index at which to insert the item.
 */
function transferArrayItem(currentArray, targetArray, currentIndex, targetIndex) {
    const from = clamp(currentIndex, currentArray.length - 1);
    const to = clamp(targetIndex, targetArray.length);
    if (currentArray.length) {
        targetArray.splice(to, 0, currentArray.splice(from, 1)[0]);
    }
}
/**
 * Copies an item from one array to another, leaving it in its
 * original position in current array.
 * @param currentArray Array from which to copy the item.
 * @param targetArray Array into which is copy the item.
 * @param currentIndex Index of the item in its current array.
 * @param targetIndex Index at which to insert the item.
 *
 */
function copyArrayItem(currentArray, targetArray, currentIndex, targetIndex) {
    const to = clamp(targetIndex, targetArray.length);
    if (currentArray.length) {
        targetArray.splice(to, 0, currentArray[currentIndex]);
    }
}
/** Clamps a number between zero and a maximum. */
function clamp(value, max) {
    return Math.max(0, Math.min(max, value));
}

/**
 * Strategy that only supports sorting along a single axis.
 * Items are reordered using CSS transforms which allows for sorting to be animated.
 * @docs-private
 */
class SingleAxisSortStrategy {
    constructor(_dragDropRegistry) {
        this._dragDropRegistry = _dragDropRegistry;
        /** Cache of the dimensions of all the items inside the container. */
        this._itemPositions = [];
        /** Direction in which the list is oriented. */
        this.orientation = 'vertical';
        /**
         * Keeps track of the item that was last swapped with the dragged item, as well as what direction
         * the pointer was moving in when the swap occurred and whether the user's pointer continued to
         * overlap with the swapped item after the swapping occurred.
         */
        this._previousSwap = {
            drag: null,
            delta: 0,
            overlaps: false,
        };
    }
    /**
     * To be called when the drag sequence starts.
     * @param items Items that are currently in the list.
     */
    start(items) {
        this.withItems(items);
    }
    /**
     * To be called when an item is being sorted.
     * @param item Item to be sorted.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param pointerDelta Direction in which the pointer is moving along each axis.
     */
    sort(item, pointerX, pointerY, pointerDelta) {
        const siblings = this._itemPositions;
        const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);
        if (newIndex === -1 && siblings.length > 0) {
            return null;
        }
        const isHorizontal = this.orientation === 'horizontal';
        const currentIndex = siblings.findIndex(currentItem => currentItem.drag === item);
        const siblingAtNewPosition = siblings[newIndex];
        const currentPosition = siblings[currentIndex].clientRect;
        const newPosition = siblingAtNewPosition.clientRect;
        const delta = currentIndex > newIndex ? 1 : -1;
        // How many pixels the item's placeholder should be offset.
        const itemOffset = this._getItemOffsetPx(currentPosition, newPosition, delta);
        // How many pixels all the other items should be offset.
        const siblingOffset = this._getSiblingOffsetPx(currentIndex, siblings, delta);
        // Save the previous order of the items before moving the item to its new index.
        // We use this to check whether an item has been moved as a result of the sorting.
        const oldOrder = siblings.slice();
        // Shuffle the array in place.
        moveItemInArray(siblings, currentIndex, newIndex);
        siblings.forEach((sibling, index) => {
            // Don't do anything if the position hasn't changed.
            if (oldOrder[index] === sibling) {
                return;
            }
            const isDraggedItem = sibling.drag === item;
            const offset = isDraggedItem ? itemOffset : siblingOffset;
            const elementToOffset = isDraggedItem
                ? item.getPlaceholderElement()
                : sibling.drag.getRootElement();
            // Update the offset to reflect the new position.
            sibling.offset += offset;
            const transformAmount = Math.round(sibling.offset * (1 / sibling.drag.scale));
            // Since we're moving the items with a `transform`, we need to adjust their cached
            // client rects to reflect their new position, as well as swap their positions in the cache.
            // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
            // elements may be mid-animation which will give us a wrong result.
            if (isHorizontal) {
                // Round the transforms since some browsers will
                // blur the elements, for sub-pixel transforms.
                elementToOffset.style.transform = combineTransforms(`translate3d(${transformAmount}px, 0, 0)`, sibling.initialTransform);
                adjustDomRect(sibling.clientRect, 0, offset);
            }
            else {
                elementToOffset.style.transform = combineTransforms(`translate3d(0, ${transformAmount}px, 0)`, sibling.initialTransform);
                adjustDomRect(sibling.clientRect, offset, 0);
            }
        });
        // Note that it's important that we do this after the client rects have been adjusted.
        this._previousSwap.overlaps = isInsideClientRect(newPosition, pointerX, pointerY);
        this._previousSwap.drag = siblingAtNewPosition.drag;
        this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;
        return { previousIndex: currentIndex, currentIndex: newIndex };
    }
    /**
     * Called when an item is being moved into the container.
     * @param item Item that was moved into the container.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param index Index at which the item entered. If omitted, the container will try to figure it
     *   out automatically.
     */
    enter(item, pointerX, pointerY, index) {
        const newIndex = index == null || index < 0
            ? // We use the coordinates of where the item entered the drop
                // zone to figure out at which index it should be inserted.
                this._getItemIndexFromPointerPosition(item, pointerX, pointerY)
            : index;
        const activeDraggables = this._activeDraggables;
        const currentIndex = activeDraggables.indexOf(item);
        const placeholder = item.getPlaceholderElement();
        let newPositionReference = activeDraggables[newIndex];
        // If the item at the new position is the same as the item that is being dragged,
        // it means that we're trying to restore the item to its initial position. In this
        // case we should use the next item from the list as the reference.
        if (newPositionReference === item) {
            newPositionReference = activeDraggables[newIndex + 1];
        }
        // If we didn't find a new position reference, it means that either the item didn't start off
        // in this container, or that the item requested to be inserted at the end of the list.
        if (!newPositionReference &&
            (newIndex == null || newIndex === -1 || newIndex < activeDraggables.length - 1) &&
            this._shouldEnterAsFirstChild(pointerX, pointerY)) {
            newPositionReference = activeDraggables[0];
        }
        // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
        // into another container and back again), we have to ensure that it isn't duplicated.
        if (currentIndex > -1) {
            activeDraggables.splice(currentIndex, 1);
        }
        // Don't use items that are being dragged as a reference, because
        // their element has been moved down to the bottom of the body.
        if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
            const element = newPositionReference.getRootElement();
            element.parentElement.insertBefore(placeholder, element);
            activeDraggables.splice(newIndex, 0, item);
        }
        else {
            this._element.appendChild(placeholder);
            activeDraggables.push(item);
        }
        // The transform needs to be cleared so it doesn't throw off the measurements.
        placeholder.style.transform = '';
        // Note that usually `start` is called together with `enter` when an item goes into a new
        // container. This will cache item positions, but we need to refresh them since the amount
        // of items has changed.
        this._cacheItemPositions();
    }
    /** Sets the items that are currently part of the list. */
    withItems(items) {
        this._activeDraggables = items.slice();
        this._cacheItemPositions();
    }
    /** Assigns a sort predicate to the strategy. */
    withSortPredicate(predicate) {
        this._sortPredicate = predicate;
    }
    /** Resets the strategy to its initial state before dragging was started. */
    reset() {
        // TODO(crisbeto): may have to wait for the animations to finish.
        this._activeDraggables?.forEach(item => {
            const rootElement = item.getRootElement();
            if (rootElement) {
                const initialTransform = this._itemPositions.find(p => p.drag === item)?.initialTransform;
                rootElement.style.transform = initialTransform || '';
            }
        });
        this._itemPositions = [];
        this._activeDraggables = [];
        this._previousSwap.drag = null;
        this._previousSwap.delta = 0;
        this._previousSwap.overlaps = false;
    }
    /**
     * Gets a snapshot of items currently in the list.
     * Can include items that we dragged in from another list.
     */
    getActiveItemsSnapshot() {
        return this._activeDraggables;
    }
    /** Gets the index of a specific item. */
    getItemIndex(item) {
        // Items are sorted always by top/left in the cache, however they flow differently in RTL.
        // The rest of the logic still stands no matter what orientation we're in, however
        // we need to invert the array when determining the index.
        const items = this.orientation === 'horizontal' && this.direction === 'rtl'
            ? this._itemPositions.slice().reverse()
            : this._itemPositions;
        return items.findIndex(currentItem => currentItem.drag === item);
    }
    /** Used to notify the strategy that the scroll position has changed. */
    updateOnScroll(topDifference, leftDifference) {
        // Since we know the amount that the user has scrolled we can shift all of the
        // client rectangles ourselves. This is cheaper than re-measuring everything and
        // we can avoid inconsistent behavior where we might be measuring the element before
        // its position has changed.
        this._itemPositions.forEach(({ clientRect }) => {
            adjustDomRect(clientRect, topDifference, leftDifference);
        });
        // We need two loops for this, because we want all of the cached
        // positions to be up-to-date before we re-sort the item.
        this._itemPositions.forEach(({ drag }) => {
            if (this._dragDropRegistry.isDragging(drag)) {
                // We need to re-sort the item manually, because the pointer move
                // events won't be dispatched while the user is scrolling.
                drag._sortFromLastPointerPosition();
            }
        });
    }
    withElementContainer(container) {
        this._element = container;
    }
    /** Refreshes the position cache of the items and sibling containers. */
    _cacheItemPositions() {
        const isHorizontal = this.orientation === 'horizontal';
        this._itemPositions = this._activeDraggables
            .map(drag => {
            const elementToMeasure = drag.getVisibleElement();
            return {
                drag,
                offset: 0,
                initialTransform: elementToMeasure.style.transform || '',
                clientRect: getMutableClientRect(elementToMeasure),
            };
        })
            .sort((a, b) => {
            return isHorizontal
                ? a.clientRect.left - b.clientRect.left
                : a.clientRect.top - b.clientRect.top;
        });
    }
    /**
     * Gets the offset in pixels by which the item that is being dragged should be moved.
     * @param currentPosition Current position of the item.
     * @param newPosition Position of the item where the current item should be moved.
     * @param delta Direction in which the user is moving.
     */
    _getItemOffsetPx(currentPosition, newPosition, delta) {
        const isHorizontal = this.orientation === 'horizontal';
        let itemOffset = isHorizontal
            ? newPosition.left - currentPosition.left
            : newPosition.top - currentPosition.top;
        // Account for differences in the item width/height.
        if (delta === -1) {
            itemOffset += isHorizontal
                ? newPosition.width - currentPosition.width
                : newPosition.height - currentPosition.height;
        }
        return itemOffset;
    }
    /**
     * Gets the offset in pixels by which the items that aren't being dragged should be moved.
     * @param currentIndex Index of the item currently being dragged.
     * @param siblings All of the items in the list.
     * @param delta Direction in which the user is moving.
     */
    _getSiblingOffsetPx(currentIndex, siblings, delta) {
        const isHorizontal = this.orientation === 'horizontal';
        const currentPosition = siblings[currentIndex].clientRect;
        const immediateSibling = siblings[currentIndex + delta * -1];
        let siblingOffset = currentPosition[isHorizontal ? 'width' : 'height'] * delta;
        if (immediateSibling) {
            const start = isHorizontal ? 'left' : 'top';
            const end = isHorizontal ? 'right' : 'bottom';
            // Get the spacing between the start of the current item and the end of the one immediately
            // after it in the direction in which the user is dragging, or vice versa. We add it to the
            // offset in order to push the element to where it will be when it's inline and is influenced
            // by the `margin` of its siblings.
            if (delta === -1) {
                siblingOffset -= immediateSibling.clientRect[start] - currentPosition[end];
            }
            else {
                siblingOffset += currentPosition[start] - immediateSibling.clientRect[end];
            }
        }
        return siblingOffset;
    }
    /**
     * Checks if pointer is entering in the first position
     * @param pointerX Position of the user's pointer along the X axis.
     * @param pointerY Position of the user's pointer along the Y axis.
     */
    _shouldEnterAsFirstChild(pointerX, pointerY) {
        if (!this._activeDraggables.length) {
            return false;
        }
        const itemPositions = this._itemPositions;
        const isHorizontal = this.orientation === 'horizontal';
        // `itemPositions` are sorted by position while `activeDraggables` are sorted by child index
        // check if container is using some sort of "reverse" ordering (eg: flex-direction: row-reverse)
        const reversed = itemPositions[0].drag !== this._activeDraggables[0];
        if (reversed) {
            const lastItemRect = itemPositions[itemPositions.length - 1].clientRect;
            return isHorizontal ? pointerX >= lastItemRect.right : pointerY >= lastItemRect.bottom;
        }
        else {
            const firstItemRect = itemPositions[0].clientRect;
            return isHorizontal ? pointerX <= firstItemRect.left : pointerY <= firstItemRect.top;
        }
    }
    /**
     * Gets the index of an item in the drop container, based on the position of the user's pointer.
     * @param item Item that is being sorted.
     * @param pointerX Position of the user's pointer along the X axis.
     * @param pointerY Position of the user's pointer along the Y axis.
     * @param delta Direction in which the user is moving their pointer.
     */
    _getItemIndexFromPointerPosition(item, pointerX, pointerY, delta) {
        const isHorizontal = this.orientation === 'horizontal';
        const index = this._itemPositions.findIndex(({ drag, clientRect }) => {
            // Skip the item itself.
            if (drag === item) {
                return false;
            }
            if (delta) {
                const direction = isHorizontal ? delta.x : delta.y;
                // If the user is still hovering over the same item as last time, their cursor hasn't left
                // the item after we made the swap, and they didn't change the direction in which they're
                // dragging, we don't consider it a direction swap.
                if (drag === this._previousSwap.drag &&
                    this._previousSwap.overlaps &&
                    direction === this._previousSwap.delta) {
                    return false;
                }
            }
            return isHorizontal
                ? // Round these down since most browsers report client rects with
                    // sub-pixel precision, whereas the pointer coordinates are rounded to pixels.
                    pointerX >= Math.floor(clientRect.left) && pointerX < Math.floor(clientRect.right)
                : pointerY >= Math.floor(clientRect.top) && pointerY < Math.floor(clientRect.bottom);
        });
        return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
    }
}

/**
 * Strategy that only supports sorting on a list that might wrap.
 * Items are reordered by moving their DOM nodes around.
 * @docs-private
 */
class MixedSortStrategy {
    constructor(_document, _dragDropRegistry) {
        this._document = _document;
        this._dragDropRegistry = _dragDropRegistry;
        /**
         * Keeps track of the item that was last swapped with the dragged item, as well as what direction
         * the pointer was moving in when the swap occurred and whether the user's pointer continued to
         * overlap with the swapped item after the swapping occurred.
         */
        this._previousSwap = {
            drag: null,
            deltaX: 0,
            deltaY: 0,
            overlaps: false,
        };
        /**
         * Keeps track of the relationship between a node and its next sibling. This information
         * is used to restore the DOM to the order it was in before dragging started.
         */
        this._relatedNodes = [];
    }
    /**
     * To be called when the drag sequence starts.
     * @param items Items that are currently in the list.
     */
    start(items) {
        const childNodes = this._element.childNodes;
        this._relatedNodes = [];
        for (let i = 0; i < childNodes.length; i++) {
            const node = childNodes[i];
            this._relatedNodes.push([node, node.nextSibling]);
        }
        this.withItems(items);
    }
    /**
     * To be called when an item is being sorted.
     * @param item Item to be sorted.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param pointerDelta Direction in which the pointer is moving along each axis.
     */
    sort(item, pointerX, pointerY, pointerDelta) {
        const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
        const previousSwap = this._previousSwap;
        if (newIndex === -1 || this._activeItems[newIndex] === item) {
            return null;
        }
        const toSwapWith = this._activeItems[newIndex];
        // Prevent too many swaps over the same item.
        if (previousSwap.drag === toSwapWith &&
            previousSwap.overlaps &&
            previousSwap.deltaX === pointerDelta.x &&
            previousSwap.deltaY === pointerDelta.y) {
            return null;
        }
        const previousIndex = this.getItemIndex(item);
        const current = item.getPlaceholderElement();
        const overlapElement = toSwapWith.getRootElement();
        if (newIndex > previousIndex) {
            overlapElement.after(current);
        }
        else {
            overlapElement.before(current);
        }
        moveItemInArray(this._activeItems, previousIndex, newIndex);
        const newOverlapElement = this._getRootNode().elementFromPoint(pointerX, pointerY);
        // Note: it's tempting to save the entire `pointerDelta` object here, however that'll
        // break this functionality, because the same object is passed for all `sort` calls.
        previousSwap.deltaX = pointerDelta.x;
        previousSwap.deltaY = pointerDelta.y;
        previousSwap.drag = toSwapWith;
        previousSwap.overlaps =
            overlapElement === newOverlapElement || overlapElement.contains(newOverlapElement);
        return {
            previousIndex,
            currentIndex: newIndex,
        };
    }
    /**
     * Called when an item is being moved into the container.
     * @param item Item that was moved into the container.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param index Index at which the item entered. If omitted, the container will try to figure it
     *   out automatically.
     */
    enter(item, pointerX, pointerY, index) {
        let enterIndex = index == null || index < 0
            ? this._getItemIndexFromPointerPosition(item, pointerX, pointerY)
            : index;
        // In some cases (e.g. when the container has padding) we might not be able to figure
        // out which item to insert the dragged item next to, because the pointer didn't overlap
        // with anything. In that case we find the item that's closest to the pointer.
        if (enterIndex === -1) {
            enterIndex = this._getClosestItemIndexToPointer(item, pointerX, pointerY);
        }
        const targetItem = this._activeItems[enterIndex];
        const currentIndex = this._activeItems.indexOf(item);
        if (currentIndex > -1) {
            this._activeItems.splice(currentIndex, 1);
        }
        if (targetItem && !this._dragDropRegistry.isDragging(targetItem)) {
            this._activeItems.splice(enterIndex, 0, item);
            targetItem.getRootElement().before(item.getPlaceholderElement());
        }
        else {
            this._activeItems.push(item);
            this._element.appendChild(item.getPlaceholderElement());
        }
    }
    /** Sets the items that are currently part of the list. */
    withItems(items) {
        this._activeItems = items.slice();
    }
    /** Assigns a sort predicate to the strategy. */
    withSortPredicate(predicate) {
        this._sortPredicate = predicate;
    }
    /** Resets the strategy to its initial state before dragging was started. */
    reset() {
        const root = this._element;
        const previousSwap = this._previousSwap;
        // Moving elements around in the DOM can break things like the `@for` loop, because it
        // uses comment nodes to know where to insert elements. To avoid such issues, we restore
        // the DOM nodes in the list to their original order when the list is reset.
        // Note that this could be simpler if we just saved all the nodes, cleared the root
        // and then appended them in the original order. We don't do it, because it can break
        // down depending on when the snapshot was taken. E.g. we may end up snapshotting the
        // placeholder element which is removed after dragging.
        for (let i = this._relatedNodes.length - 1; i > -1; i--) {
            const [node, nextSibling] = this._relatedNodes[i];
            if (node.parentNode === root && node.nextSibling !== nextSibling) {
                if (nextSibling === null) {
                    root.appendChild(node);
                }
                else if (nextSibling.parentNode === root) {
                    root.insertBefore(node, nextSibling);
                }
            }
        }
        this._relatedNodes = [];
        this._activeItems = [];
        previousSwap.drag = null;
        previousSwap.deltaX = previousSwap.deltaY = 0;
        previousSwap.overlaps = false;
    }
    /**
     * Gets a snapshot of items currently in the list.
     * Can include items that we dragged in from another list.
     */
    getActiveItemsSnapshot() {
        return this._activeItems;
    }
    /** Gets the index of a specific item. */
    getItemIndex(item) {
        return this._activeItems.indexOf(item);
    }
    /** Used to notify the strategy that the scroll position has changed. */
    updateOnScroll() {
        this._activeItems.forEach(item => {
            if (this._dragDropRegistry.isDragging(item)) {
                // We need to re-sort the item manually, because the pointer move
                // events won't be dispatched while the user is scrolling.
                item._sortFromLastPointerPosition();
            }
        });
    }
    withElementContainer(container) {
        if (container !== this._element) {
            this._element = container;
            this._rootNode = undefined;
        }
    }
    /**
     * Gets the index of an item in the drop container, based on the position of the user's pointer.
     * @param item Item that is being sorted.
     * @param pointerX Position of the user's pointer along the X axis.
     * @param pointerY Position of the user's pointer along the Y axis.
     * @param delta Direction in which the user is moving their pointer.
     */
    _getItemIndexFromPointerPosition(item, pointerX, pointerY) {
        const elementAtPoint = this._getRootNode().elementFromPoint(Math.floor(pointerX), Math.floor(pointerY));
        const index = elementAtPoint
            ? this._activeItems.findIndex(item => {
                const root = item.getRootElement();
                return elementAtPoint === root || root.contains(elementAtPoint);
            })
            : -1;
        return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
    }
    /** Lazily resolves the list's root node. */
    _getRootNode() {
        // Resolve the root node lazily to ensure that the drop list is in its final place in the DOM.
        if (!this._rootNode) {
            this._rootNode = _getShadowRoot(this._element) || this._document;
        }
        return this._rootNode;
    }
    /**
     * Finds the index of the item that's closest to the item being dragged.
     * @param item Item being dragged.
     * @param pointerX Position of the user's pointer along the X axis.
     * @param pointerY Position of the user's pointer along the Y axis.
     */
    _getClosestItemIndexToPointer(item, pointerX, pointerY) {
        if (this._activeItems.length === 0) {
            return -1;
        }
        if (this._activeItems.length === 1) {
            return 0;
        }
        let minDistance = Infinity;
        let minIndex = -1;
        // Find the Euclidean distance (https://en.wikipedia.org/wiki/Euclidean_distance) between each
        // item and the pointer, and return the smallest one. Note that this is a bit flawed in that DOM
        // nodes are rectangles, not points, so we use the top/left coordinates. It should be enough
        // for our purposes.
        for (let i = 0; i < this._activeItems.length; i++) {
            const current = this._activeItems[i];
            if (current !== item) {
                const { x, y } = current.getRootElement().getBoundingClientRect();
                const distance = Math.hypot(pointerX - x, pointerY - y);
                if (distance < minDistance) {
                    minDistance = distance;
                    minIndex = i;
                }
            }
        }
        return minIndex;
    }
}

/**
 * Proximity, as a ratio to width/height, at which a
 * dragged item will affect the drop container.
 */
const DROP_PROXIMITY_THRESHOLD = 0.05;
/**
 * Proximity, as a ratio to width/height at which to start auto-scrolling the drop list or the
 * viewport. The value comes from trying it out manually until it feels right.
 */
const SCROLL_PROXIMITY_THRESHOLD = 0.05;
/** Vertical direction in which we can auto-scroll. */
var AutoScrollVerticalDirection;
(function (AutoScrollVerticalDirection) {
    AutoScrollVerticalDirection[AutoScrollVerticalDirection["NONE"] = 0] = "NONE";
    AutoScrollVerticalDirection[AutoScrollVerticalDirection["UP"] = 1] = "UP";
    AutoScrollVerticalDirection[AutoScrollVerticalDirection["DOWN"] = 2] = "DOWN";
})(AutoScrollVerticalDirection || (AutoScrollVerticalDirection = {}));
/** Horizontal direction in which we can auto-scroll. */
var AutoScrollHorizontalDirection;
(function (AutoScrollHorizontalDirection) {
    AutoScrollHorizontalDirection[AutoScrollHorizontalDirection["NONE"] = 0] = "NONE";
    AutoScrollHorizontalDirection[AutoScrollHorizontalDirection["LEFT"] = 1] = "LEFT";
    AutoScrollHorizontalDirection[AutoScrollHorizontalDirection["RIGHT"] = 2] = "RIGHT";
})(AutoScrollHorizontalDirection || (AutoScrollHorizontalDirection = {}));
/**
 * Reference to a drop list. Used to manipulate or dispose of the container.
 */
class DropListRef {
    constructor(element, _dragDropRegistry, _document, _ngZone, _viewportRuler) {
        this._dragDropRegistry = _dragDropRegistry;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        /** Whether starting a dragging sequence from this container is disabled. */
        this.disabled = false;
        /** Whether sorting items within the list is disabled. */
        this.sortingDisabled = false;
        /**
         * Whether auto-scrolling the view when the user
         * moves their pointer close to the edges is disabled.
         */
        this.autoScrollDisabled = false;
        /** Number of pixels to scroll for each frame when auto-scrolling an element. */
        this.autoScrollStep = 2;
        /**
         * Function that is used to determine whether an item
         * is allowed to be moved into a drop container.
         */
        this.enterPredicate = () => true;
        /** Function that is used to determine whether an item can be sorted into a particular index. */
        this.sortPredicate = () => true;
        /** Emits right before dragging has started. */
        this.beforeStarted = new Subject();
        /**
         * Emits when the user has moved a new drag item into this container.
         */
        this.entered = new Subject();
        /**
         * Emits when the user removes an item from the container
         * by dragging it into another container.
         */
        this.exited = new Subject();
        /** Emits when the user drops an item inside the container. */
        this.dropped = new Subject();
        /** Emits as the user is swapping items while actively dragging. */
        this.sorted = new Subject();
        /** Emits when a dragging sequence is started in a list connected to the current one. */
        this.receivingStarted = new Subject();
        /** Emits when a dragging sequence is stopped from a list connected to the current one. */
        this.receivingStopped = new Subject();
        /** Whether an item in the list is being dragged. */
        this._isDragging = false;
        /** Draggable items in the container. */
        this._draggables = [];
        /** Drop lists that are connected to the current one. */
        this._siblings = [];
        /** Connected siblings that currently have a dragged item. */
        this._activeSiblings = new Set();
        /** Subscription to the window being scrolled. */
        this._viewportScrollSubscription = Subscription.EMPTY;
        /** Vertical direction in which the list is currently scrolling. */
        this._verticalScrollDirection = AutoScrollVerticalDirection.NONE;
        /** Horizontal direction in which the list is currently scrolling. */
        this._horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
        /** Used to signal to the current auto-scroll sequence when to stop. */
        this._stopScrollTimers = new Subject();
        /** Shadow root of the current element. Necessary for `elementFromPoint` to resolve correctly. */
        this._cachedShadowRoot = null;
        /** Elements that can be scrolled while the user is dragging. */
        this._scrollableElements = [];
        /** Direction of the list's layout. */
        this._direction = 'ltr';
        /** Starts the interval that'll auto-scroll the element. */
        this._startScrollInterval = () => {
            this._stopScrolling();
            interval(0, animationFrameScheduler)
                .pipe(takeUntil(this._stopScrollTimers))
                .subscribe(() => {
                const node = this._scrollNode;
                const scrollStep = this.autoScrollStep;
                if (this._verticalScrollDirection === AutoScrollVerticalDirection.UP) {
                    node.scrollBy(0, -scrollStep);
                }
                else if (this._verticalScrollDirection === AutoScrollVerticalDirection.DOWN) {
                    node.scrollBy(0, scrollStep);
                }
                if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.LEFT) {
                    node.scrollBy(-scrollStep, 0);
                }
                else if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.RIGHT) {
                    node.scrollBy(scrollStep, 0);
                }
            });
        };
        const coercedElement = (this.element = coerceElement(element));
        this._document = _document;
        this.withOrientation('vertical').withElementContainer(coercedElement);
        _dragDropRegistry.registerDropContainer(this);
        this._parentPositions = new ParentPositionTracker(_document);
    }
    /** Removes the drop list functionality from the DOM element. */
    dispose() {
        this._stopScrolling();
        this._stopScrollTimers.complete();
        this._viewportScrollSubscription.unsubscribe();
        this.beforeStarted.complete();
        this.entered.complete();
        this.exited.complete();
        this.dropped.complete();
        this.sorted.complete();
        this.receivingStarted.complete();
        this.receivingStopped.complete();
        this._activeSiblings.clear();
        this._scrollNode = null;
        this._parentPositions.clear();
        this._dragDropRegistry.removeDropContainer(this);
    }
    /** Whether an item from this list is currently being dragged. */
    isDragging() {
        return this._isDragging;
    }
    /** Starts dragging an item. */
    start() {
        this._draggingStarted();
        this._notifyReceivingSiblings();
    }
    /**
     * Attempts to move an item into the container.
     * @param item Item that was moved into the container.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param index Index at which the item entered. If omitted, the container will try to figure it
     *   out automatically.
     */
    enter(item, pointerX, pointerY, index) {
        this._draggingStarted();
        // If sorting is disabled, we want the item to return to its starting
        // position if the user is returning it to its initial container.
        if (index == null && this.sortingDisabled) {
            index = this._draggables.indexOf(item);
        }
        this._sortStrategy.enter(item, pointerX, pointerY, index);
        // Note that this usually happens inside `_draggingStarted` as well, but the dimensions
        // can change when the sort strategy moves the item around inside `enter`.
        this._cacheParentPositions();
        // Notify siblings at the end so that the item has been inserted into the `activeDraggables`.
        this._notifyReceivingSiblings();
        this.entered.next({ item, container: this, currentIndex: this.getItemIndex(item) });
    }
    /**
     * Removes an item from the container after it was dragged into another container by the user.
     * @param item Item that was dragged out.
     */
    exit(item) {
        this._reset();
        this.exited.next({ item, container: this });
    }
    /**
     * Drops an item into this container.
     * @param item Item being dropped into the container.
     * @param currentIndex Index at which the item should be inserted.
     * @param previousIndex Index of the item when dragging started.
     * @param previousContainer Container from which the item got dragged in.
     * @param isPointerOverContainer Whether the user's pointer was over the
     *    container when the item was dropped.
     * @param distance Distance the user has dragged since the start of the dragging sequence.
     * @param event Event that triggered the dropping sequence.
     *
     * @breaking-change 15.0.0 `previousIndex` and `event` parameters to become required.
     */
    drop(item, currentIndex, previousIndex, previousContainer, isPointerOverContainer, distance, dropPoint, event = {}) {
        this._reset();
        this.dropped.next({
            item,
            currentIndex,
            previousIndex,
            container: this,
            previousContainer,
            isPointerOverContainer,
            distance,
            dropPoint,
            event,
        });
    }
    /**
     * Sets the draggable items that are a part of this list.
     * @param items Items that are a part of this list.
     */
    withItems(items) {
        const previousItems = this._draggables;
        this._draggables = items;
        items.forEach(item => item._withDropContainer(this));
        if (this.isDragging()) {
            const draggedItems = previousItems.filter(item => item.isDragging());
            // If all of the items being dragged were removed
            // from the list, abort the current drag sequence.
            if (draggedItems.every(item => items.indexOf(item) === -1)) {
                this._reset();
            }
            else {
                this._sortStrategy.withItems(this._draggables);
            }
        }
        return this;
    }
    /** Sets the layout direction of the drop list. */
    withDirection(direction) {
        this._direction = direction;
        if (this._sortStrategy instanceof SingleAxisSortStrategy) {
            this._sortStrategy.direction = direction;
        }
        return this;
    }
    /**
     * Sets the containers that are connected to this one. When two or more containers are
     * connected, the user will be allowed to transfer items between them.
     * @param connectedTo Other containers that the current containers should be connected to.
     */
    connectedTo(connectedTo) {
        this._siblings = connectedTo.slice();
        return this;
    }
    /**
     * Sets the orientation of the container.
     * @param orientation New orientation for the container.
     */
    withOrientation(orientation) {
        if (orientation === 'mixed') {
            this._sortStrategy = new MixedSortStrategy(this._document, this._dragDropRegistry);
        }
        else {
            const strategy = new SingleAxisSortStrategy(this._dragDropRegistry);
            strategy.direction = this._direction;
            strategy.orientation = orientation;
            this._sortStrategy = strategy;
        }
        this._sortStrategy.withElementContainer(this._container);
        this._sortStrategy.withSortPredicate((index, item) => this.sortPredicate(index, item, this));
        return this;
    }
    /**
     * Sets which parent elements are can be scrolled while the user is dragging.
     * @param elements Elements that can be scrolled.
     */
    withScrollableParents(elements) {
        const element = this._container;
        // We always allow the current element to be scrollable
        // so we need to ensure that it's in the array.
        this._scrollableElements =
            elements.indexOf(element) === -1 ? [element, ...elements] : elements.slice();
        return this;
    }
    /**
     * Configures the drop list so that a different element is used as the container for the
     * dragged items. This is useful for the cases when one might not have control over the
     * full DOM that sets up the dragging.
     * Note that the alternate container needs to be a descendant of the drop list.
     * @param container New element container to be assigned.
     */
    withElementContainer(container) {
        if (container === this._container) {
            return this;
        }
        const element = coerceElement(this.element);
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            container !== element &&
            !element.contains(container)) {
            throw new Error('Invalid DOM structure for drop list. Alternate container element must be a descendant of the drop list.');
        }
        const oldContainerIndex = this._scrollableElements.indexOf(this._container);
        const newContainerIndex = this._scrollableElements.indexOf(container);
        if (oldContainerIndex > -1) {
            this._scrollableElements.splice(oldContainerIndex, 1);
        }
        if (newContainerIndex > -1) {
            this._scrollableElements.splice(newContainerIndex, 1);
        }
        if (this._sortStrategy) {
            this._sortStrategy.withElementContainer(container);
        }
        this._cachedShadowRoot = null;
        this._scrollableElements.unshift(container);
        this._container = container;
        return this;
    }
    /** Gets the scrollable parents that are registered with this drop container. */
    getScrollableParents() {
        return this._scrollableElements;
    }
    /**
     * Figures out the index of an item in the container.
     * @param item Item whose index should be determined.
     */
    getItemIndex(item) {
        return this._isDragging
            ? this._sortStrategy.getItemIndex(item)
            : this._draggables.indexOf(item);
    }
    /**
     * Whether the list is able to receive the item that
     * is currently being dragged inside a connected drop list.
     */
    isReceiving() {
        return this._activeSiblings.size > 0;
    }
    /**
     * Sorts an item inside the container based on its position.
     * @param item Item to be sorted.
     * @param pointerX Position of the item along the X axis.
     * @param pointerY Position of the item along the Y axis.
     * @param pointerDelta Direction in which the pointer is moving along each axis.
     */
    _sortItem(item, pointerX, pointerY, pointerDelta) {
        // Don't sort the item if sorting is disabled or it's out of range.
        if (this.sortingDisabled ||
            !this._domRect ||
            !isPointerNearDomRect(this._domRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)) {
            return;
        }
        const result = this._sortStrategy.sort(item, pointerX, pointerY, pointerDelta);
        if (result) {
            this.sorted.next({
                previousIndex: result.previousIndex,
                currentIndex: result.currentIndex,
                container: this,
                item,
            });
        }
    }
    /**
     * Checks whether the user's pointer is close to the edges of either the
     * viewport or the drop list and starts the auto-scroll sequence.
     * @param pointerX User's pointer position along the x axis.
     * @param pointerY User's pointer position along the y axis.
     */
    _startScrollingIfNecessary(pointerX, pointerY) {
        if (this.autoScrollDisabled) {
            return;
        }
        let scrollNode;
        let verticalScrollDirection = AutoScrollVerticalDirection.NONE;
        let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
        // Check whether we should start scrolling any of the parent containers.
        this._parentPositions.positions.forEach((position, element) => {
            // We have special handling for the `document` below. Also this would be
            // nicer with a  for...of loop, but it requires changing a compiler flag.
            if (element === this._document || !position.clientRect || scrollNode) {
                return;
            }
            if (isPointerNearDomRect(position.clientRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)) {
                [verticalScrollDirection, horizontalScrollDirection] = getElementScrollDirections(element, position.clientRect, this._direction, pointerX, pointerY);
                if (verticalScrollDirection || horizontalScrollDirection) {
                    scrollNode = element;
                }
            }
        });
        // Otherwise check if we can start scrolling the viewport.
        if (!verticalScrollDirection && !horizontalScrollDirection) {
            const { width, height } = this._viewportRuler.getViewportSize();
            const domRect = {
                width,
                height,
                top: 0,
                right: width,
                bottom: height,
                left: 0,
            };
            verticalScrollDirection = getVerticalScrollDirection(domRect, pointerY);
            horizontalScrollDirection = getHorizontalScrollDirection(domRect, pointerX);
            scrollNode = window;
        }
        if (scrollNode &&
            (verticalScrollDirection !== this._verticalScrollDirection ||
                horizontalScrollDirection !== this._horizontalScrollDirection ||
                scrollNode !== this._scrollNode)) {
            this._verticalScrollDirection = verticalScrollDirection;
            this._horizontalScrollDirection = horizontalScrollDirection;
            this._scrollNode = scrollNode;
            if ((verticalScrollDirection || horizontalScrollDirection) && scrollNode) {
                this._ngZone.runOutsideAngular(this._startScrollInterval);
            }
            else {
                this._stopScrolling();
            }
        }
    }
    /** Stops any currently-running auto-scroll sequences. */
    _stopScrolling() {
        this._stopScrollTimers.next();
    }
    /** Starts the dragging sequence within the list. */
    _draggingStarted() {
        const styles = this._container.style;
        this.beforeStarted.next();
        this._isDragging = true;
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            // Prevent the check from running on apps not using an alternate container. Ideally we
            // would always run it, but introducing it at this stage would be a breaking change.
            this._container !== coerceElement(this.element)) {
            for (const drag of this._draggables) {
                if (!drag.isDragging() && drag.getVisibleElement().parentNode !== this._container) {
                    throw new Error('Invalid DOM structure for drop list. All items must be placed directly inside of the element container.');
                }
            }
        }
        // We need to disable scroll snapping while the user is dragging, because it breaks automatic
        // scrolling. The browser seems to round the value based on the snapping points which means
        // that we can't increment/decrement the scroll position.
        this._initialScrollSnap = styles.msScrollSnapType || styles.scrollSnapType || '';
        styles.scrollSnapType = styles.msScrollSnapType = 'none';
        this._sortStrategy.start(this._draggables);
        this._cacheParentPositions();
        this._viewportScrollSubscription.unsubscribe();
        this._listenToScrollEvents();
    }
    /** Caches the positions of the configured scrollable parents. */
    _cacheParentPositions() {
        this._parentPositions.cache(this._scrollableElements);
        // The list element is always in the `scrollableElements`
        // so we can take advantage of the cached `DOMRect`.
        this._domRect = this._parentPositions.positions.get(this._container).clientRect;
    }
    /** Resets the container to its initial state. */
    _reset() {
        this._isDragging = false;
        const styles = this._container.style;
        styles.scrollSnapType = styles.msScrollSnapType = this._initialScrollSnap;
        this._siblings.forEach(sibling => sibling._stopReceiving(this));
        this._sortStrategy.reset();
        this._stopScrolling();
        this._viewportScrollSubscription.unsubscribe();
        this._parentPositions.clear();
    }
    /**
     * Checks whether the user's pointer is positioned over the container.
     * @param x Pointer position along the X axis.
     * @param y Pointer position along the Y axis.
     */
    _isOverContainer(x, y) {
        return this._domRect != null && isInsideClientRect(this._domRect, x, y);
    }
    /**
     * Figures out whether an item should be moved into a sibling
     * drop container, based on its current position.
     * @param item Drag item that is being moved.
     * @param x Position of the item along the X axis.
     * @param y Position of the item along the Y axis.
     */
    _getSiblingContainerFromPosition(item, x, y) {
        return this._siblings.find(sibling => sibling._canReceive(item, x, y));
    }
    /**
     * Checks whether the drop list can receive the passed-in item.
     * @param item Item that is being dragged into the list.
     * @param x Position of the item along the X axis.
     * @param y Position of the item along the Y axis.
     */
    _canReceive(item, x, y) {
        if (!this._domRect ||
            !isInsideClientRect(this._domRect, x, y) ||
            !this.enterPredicate(item, this)) {
            return false;
        }
        const elementFromPoint = this._getShadowRoot().elementFromPoint(x, y);
        // If there's no element at the pointer position, then
        // the client rect is probably scrolled out of the view.
        if (!elementFromPoint) {
            return false;
        }
        // The `DOMRect`, that we're using to find the container over which the user is
        // hovering, doesn't give us any information on whether the element has been scrolled
        // out of the view or whether it's overlapping with other containers. This means that
        // we could end up transferring the item into a container that's invisible or is positioned
        // below another one. We use the result from `elementFromPoint` to get the top-most element
        // at the pointer position and to find whether it's one of the intersecting drop containers.
        return elementFromPoint === this._container || this._container.contains(elementFromPoint);
    }
    /**
     * Called by one of the connected drop lists when a dragging sequence has started.
     * @param sibling Sibling in which dragging has started.
     */
    _startReceiving(sibling, items) {
        const activeSiblings = this._activeSiblings;
        if (!activeSiblings.has(sibling) &&
            items.every(item => {
                // Note that we have to add an exception to the `enterPredicate` for items that started off
                // in this drop list. The drag ref has logic that allows an item to return to its initial
                // container, if it has left the initial container and none of the connected containers
                // allow it to enter. See `DragRef._updateActiveDropContainer` for more context.
                return this.enterPredicate(item, this) || this._draggables.indexOf(item) > -1;
            })) {
            activeSiblings.add(sibling);
            this._cacheParentPositions();
            this._listenToScrollEvents();
            this.receivingStarted.next({
                initiator: sibling,
                receiver: this,
                items,
            });
        }
    }
    /**
     * Called by a connected drop list when dragging has stopped.
     * @param sibling Sibling whose dragging has stopped.
     */
    _stopReceiving(sibling) {
        this._activeSiblings.delete(sibling);
        this._viewportScrollSubscription.unsubscribe();
        this.receivingStopped.next({ initiator: sibling, receiver: this });
    }
    /**
     * Starts listening to scroll events on the viewport.
     * Used for updating the internal state of the list.
     */
    _listenToScrollEvents() {
        this._viewportScrollSubscription = this._dragDropRegistry
            .scrolled(this._getShadowRoot())
            .subscribe(event => {
            if (this.isDragging()) {
                const scrollDifference = this._parentPositions.handleScroll(event);
                if (scrollDifference) {
                    this._sortStrategy.updateOnScroll(scrollDifference.top, scrollDifference.left);
                }
            }
            else if (this.isReceiving()) {
                this._cacheParentPositions();
            }
        });
    }
    /**
     * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
     * than saving it in property directly on init, because we want to resolve it as late as possible
     * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
     * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
     */
    _getShadowRoot() {
        if (!this._cachedShadowRoot) {
            const shadowRoot = _getShadowRoot(this._container);
            this._cachedShadowRoot = shadowRoot || this._document;
        }
        return this._cachedShadowRoot;
    }
    /** Notifies any siblings that may potentially receive the item. */
    _notifyReceivingSiblings() {
        const draggedItems = this._sortStrategy
            .getActiveItemsSnapshot()
            .filter(item => item.isDragging());
        this._siblings.forEach(sibling => sibling._startReceiving(this, draggedItems));
    }
}
/**
 * Gets whether the vertical auto-scroll direction of a node.
 * @param clientRect Dimensions of the node.
 * @param pointerY Position of the user's pointer along the y axis.
 */
function getVerticalScrollDirection(clientRect, pointerY) {
    const { top, bottom, height } = clientRect;
    const yThreshold = height * SCROLL_PROXIMITY_THRESHOLD;
    if (pointerY >= top - yThreshold && pointerY <= top + yThreshold) {
        return AutoScrollVerticalDirection.UP;
    }
    else if (pointerY >= bottom - yThreshold && pointerY <= bottom + yThreshold) {
        return AutoScrollVerticalDirection.DOWN;
    }
    return AutoScrollVerticalDirection.NONE;
}
/**
 * Gets whether the horizontal auto-scroll direction of a node.
 * @param clientRect Dimensions of the node.
 * @param pointerX Position of the user's pointer along the x axis.
 */
function getHorizontalScrollDirection(clientRect, pointerX) {
    const { left, right, width } = clientRect;
    const xThreshold = width * SCROLL_PROXIMITY_THRESHOLD;
    if (pointerX >= left - xThreshold && pointerX <= left + xThreshold) {
        return AutoScrollHorizontalDirection.LEFT;
    }
    else if (pointerX >= right - xThreshold && pointerX <= right + xThreshold) {
        return AutoScrollHorizontalDirection.RIGHT;
    }
    return AutoScrollHorizontalDirection.NONE;
}
/**
 * Gets the directions in which an element node should be scrolled,
 * assuming that the user's pointer is already within it scrollable region.
 * @param element Element for which we should calculate the scroll direction.
 * @param clientRect Bounding client rectangle of the element.
 * @param direction Layout direction of the drop list.
 * @param pointerX Position of the user's pointer along the x axis.
 * @param pointerY Position of the user's pointer along the y axis.
 */
function getElementScrollDirections(element, clientRect, direction, pointerX, pointerY) {
    const computedVertical = getVerticalScrollDirection(clientRect, pointerY);
    const computedHorizontal = getHorizontalScrollDirection(clientRect, pointerX);
    let verticalScrollDirection = AutoScrollVerticalDirection.NONE;
    let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
    // Note that we here we do some extra checks for whether the element is actually scrollable in
    // a certain direction and we only assign the scroll direction if it is. We do this so that we
    // can allow other elements to be scrolled, if the current element can't be scrolled anymore.
    // This allows us to handle cases where the scroll regions of two scrollable elements overlap.
    if (computedVertical) {
        const scrollTop = element.scrollTop;
        if (computedVertical === AutoScrollVerticalDirection.UP) {
            if (scrollTop > 0) {
                verticalScrollDirection = AutoScrollVerticalDirection.UP;
            }
        }
        else if (element.scrollHeight - scrollTop > element.clientHeight) {
            verticalScrollDirection = AutoScrollVerticalDirection.DOWN;
        }
    }
    if (computedHorizontal) {
        const scrollLeft = element.scrollLeft;
        if (direction === 'rtl') {
            if (computedHorizontal === AutoScrollHorizontalDirection.RIGHT) {
                // In RTL `scrollLeft` will be negative when scrolled.
                if (scrollLeft < 0) {
                    horizontalScrollDirection = AutoScrollHorizontalDirection.RIGHT;
                }
            }
            else if (element.scrollWidth + scrollLeft > element.clientWidth) {
                horizontalScrollDirection = AutoScrollHorizontalDirection.LEFT;
            }
        }
        else {
            if (computedHorizontal === AutoScrollHorizontalDirection.LEFT) {
                if (scrollLeft > 0) {
                    horizontalScrollDirection = AutoScrollHorizontalDirection.LEFT;
                }
            }
            else if (element.scrollWidth - scrollLeft > element.clientWidth) {
                horizontalScrollDirection = AutoScrollHorizontalDirection.RIGHT;
            }
        }
    }
    return [verticalScrollDirection, horizontalScrollDirection];
}

/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true,
});
/** Keeps track of the apps currently containing drag items. */
const activeApps = new Set();
/**
 * Component used to load the drag&drop reset styles.
 * @docs-private
 */
class _ResetsLoader {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _ResetsLoader, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: _ResetsLoader, isStandalone: true, selector: "ng-component", host: { attributes: { "cdk-drag-resets-container": "" } }, ngImport: i0, template: '', isInline: true, styles: ["@layer cdk-resets{.cdk-drag-preview{background:none;border:none;padding:0;color:inherit;inset:auto}}.cdk-drag-placeholder *,.cdk-drag-preview *{pointer-events:none !important}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _ResetsLoader, decorators: [{
            type: Component,
            args: [{ standalone: true, encapsulation: ViewEncapsulation.None, template: '', changeDetection: ChangeDetectionStrategy.OnPush, host: { 'cdk-drag-resets-container': '' }, styles: ["@layer cdk-resets{.cdk-drag-preview{background:none;border:none;padding:0;color:inherit;inset:auto}}.cdk-drag-placeholder *,.cdk-drag-preview *{pointer-events:none !important}"] }]
        }] });
// TODO(crisbeto): remove generics when making breaking changes.
/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * @docs-private
 */
class DragDropRegistry {
    constructor(_ngZone, _document) {
        this._ngZone = _ngZone;
        this._appRef = inject(ApplicationRef);
        this._environmentInjector = inject(EnvironmentInjector);
        /** Registered drop container instances. */
        this._dropInstances = new Set();
        /** Registered drag item instances. */
        this._dragInstances = new Set();
        /** Drag item instances that are currently being dragged. */
        this._activeDragInstances = signal([]);
        /** Keeps track of the event listeners that we've bound to the `document`. */
        this._globalListeners = new Map();
        /**
         * Predicate function to check if an item is being dragged.  Moved out into a property,
         * because it'll be called a lot and we don't want to create a new function every time.
         */
        this._draggingPredicate = (item) => item.isDragging();
        /**
         * Emits the `touchmove` or `mousemove` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerMove = new Subject();
        /**
         * Emits the `touchend` or `mouseup` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerUp = new Subject();
        /**
         * Emits when the viewport has been scrolled while the user is dragging an item.
         * @deprecated To be turned into a private member. Use the `scrolled` method instead.
         * @breaking-change 13.0.0
         */
        this.scroll = new Subject();
        /**
         * Event listener that will prevent the default browser action while the user is dragging.
         * @param event Event whose default action should be prevented.
         */
        this._preventDefaultWhileDragging = (event) => {
            if (this._activeDragInstances().length > 0) {
                event.preventDefault();
            }
        };
        /** Event listener for `touchmove` that is bound even if no dragging is happening. */
        this._persistentTouchmoveListener = (event) => {
            if (this._activeDragInstances().length > 0) {
                // Note that we only want to prevent the default action after dragging has actually started.
                // Usually this is the same time at which the item is added to the `_activeDragInstances`,
                // but it could be pushed back if the user has set up a drag delay or threshold.
                if (this._activeDragInstances().some(this._draggingPredicate)) {
                    event.preventDefault();
                }
                this.pointerMove.next(event);
            }
        };
        this._document = _document;
    }
    /** Adds a drop container to the registry. */
    registerDropContainer(drop) {
        if (!this._dropInstances.has(drop)) {
            this._dropInstances.add(drop);
        }
    }
    /** Adds a drag item instance to the registry. */
    registerDragItem(drag) {
        this._dragInstances.add(drag);
        // The `touchmove` event gets bound once, ahead of time, because WebKit
        // won't preventDefault on a dynamically-added `touchmove` listener.
        // See https://bugs.webkit.org/show_bug.cgi?id=184250.
        if (this._dragInstances.size === 1) {
            this._ngZone.runOutsideAngular(() => {
                // The event handler has to be explicitly active,
                // because newer browsers make it passive by default.
                this._document.addEventListener('touchmove', this._persistentTouchmoveListener, activeCapturingEventOptions);
            });
        }
    }
    /** Removes a drop container from the registry. */
    removeDropContainer(drop) {
        this._dropInstances.delete(drop);
    }
    /** Removes a drag item instance from the registry. */
    removeDragItem(drag) {
        this._dragInstances.delete(drag);
        this.stopDragging(drag);
        if (this._dragInstances.size === 0) {
            this._document.removeEventListener('touchmove', this._persistentTouchmoveListener, activeCapturingEventOptions);
        }
    }
    /**
     * Starts the dragging sequence for a drag instance.
     * @param drag Drag instance which is being dragged.
     * @param event Event that initiated the dragging.
     */
    startDragging(drag, event) {
        // Do not process the same drag twice to avoid memory leaks and redundant listeners
        if (this._activeDragInstances().indexOf(drag) > -1) {
            return;
        }
        this._loadResets();
        this._activeDragInstances.update(instances => [...instances, drag]);
        if (this._activeDragInstances().length === 1) {
            const isTouchEvent = event.type.startsWith('touch');
            // We explicitly bind __active__ listeners here, because newer browsers will default to
            // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
            // use `preventDefault` to prevent the page from scrolling while the user is dragging.
            this._globalListeners
                .set(isTouchEvent ? 'touchend' : 'mouseup', {
                handler: (e) => this.pointerUp.next(e),
                options: true,
            })
                .set('scroll', {
                handler: (e) => this.scroll.next(e),
                // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
                // the document. See https://github.com/angular/components/issues/17144.
                options: true,
            })
                // Preventing the default action on `mousemove` isn't enough to disable text selection
                // on Safari so we need to prevent the selection event as well. Alternatively this can
                // be done by setting `user-select: none` on the `body`, however it has causes a style
                // recalculation which can be expensive on pages with a lot of elements.
                .set('selectstart', {
                handler: this._preventDefaultWhileDragging,
                options: activeCapturingEventOptions,
            });
            // We don't have to bind a move event for touch drag sequences, because
            // we already have a persistent global one bound from `registerDragItem`.
            if (!isTouchEvent) {
                this._globalListeners.set('mousemove', {
                    handler: (e) => this.pointerMove.next(e),
                    options: activeCapturingEventOptions,
                });
            }
            this._ngZone.runOutsideAngular(() => {
                this._globalListeners.forEach((config, name) => {
                    this._document.addEventListener(name, config.handler, config.options);
                });
            });
        }
    }
    /** Stops dragging a drag item instance. */
    stopDragging(drag) {
        this._activeDragInstances.update(instances => {
            const index = instances.indexOf(drag);
            if (index > -1) {
                instances.splice(index, 1);
                return [...instances];
            }
            return instances;
        });
        if (this._activeDragInstances().length === 0) {
            this._clearGlobalListeners();
        }
    }
    /** Gets whether a drag item instance is currently being dragged. */
    isDragging(drag) {
        return this._activeDragInstances().indexOf(drag) > -1;
    }
    /**
     * Gets a stream that will emit when any element on the page is scrolled while an item is being
     * dragged.
     * @param shadowRoot Optional shadow root that the current dragging sequence started from.
     *   Top-level listeners won't pick up events coming from the shadow DOM so this parameter can
     *   be used to include an additional top-level listener at the shadow root level.
     */
    scrolled(shadowRoot) {
        const streams = [this.scroll];
        if (shadowRoot && shadowRoot !== this._document) {
            // Note that this is basically the same as `fromEvent` from rxjs, but we do it ourselves,
            // because we want to guarantee that the event is bound outside of the `NgZone`. With
            // `fromEvent` it'll only happen if the subscription is outside the `NgZone`.
            streams.push(new Observable((observer) => {
                return this._ngZone.runOutsideAngular(() => {
                    const eventOptions = true;
                    const callback = (event) => {
                        if (this._activeDragInstances().length) {
                            observer.next(event);
                        }
                    };
                    shadowRoot.addEventListener('scroll', callback, eventOptions);
                    return () => {
                        shadowRoot.removeEventListener('scroll', callback, eventOptions);
                    };
                });
            }));
        }
        return merge(...streams);
    }
    ngOnDestroy() {
        this._dragInstances.forEach(instance => this.removeDragItem(instance));
        this._dropInstances.forEach(instance => this.removeDropContainer(instance));
        this._clearGlobalListeners();
        this.pointerMove.complete();
        this.pointerUp.complete();
    }
    /** Clears out the global event listeners from the `document`. */
    _clearGlobalListeners() {
        this._globalListeners.forEach((config, name) => {
            this._document.removeEventListener(name, config.handler, config.options);
        });
        this._globalListeners.clear();
    }
    // TODO(crisbeto): abstract this away into something reusable.
    /** Loads the CSS resets needed for the module to work correctly. */
    _loadResets() {
        if (!activeApps.has(this._appRef)) {
            activeApps.add(this._appRef);
            const componentRef = createComponent(_ResetsLoader, {
                environmentInjector: this._environmentInjector,
            });
            this._appRef.onDestroy(() => {
                activeApps.delete(this._appRef);
                if (activeApps.size === 0) {
                    componentRef.destroy();
                }
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropRegistry, deps: [{ token: i0.NgZone }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropRegistry, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });

/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
    dragStartThreshold: 5,
    pointerDirectionChangeThreshold: 5,
};
/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
class DragDrop {
    constructor(_document, _ngZone, _viewportRuler, _dragDropRegistry) {
        this._document = _document;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
    }
    /**
     * Turns an element into a draggable item.
     * @param element Element to which to attach the dragging functionality.
     * @param config Object used to configure the dragging behavior.
     */
    createDrag(element, config = DEFAULT_CONFIG) {
        return new DragRef(element, config, this._document, this._ngZone, this._viewportRuler, this._dragDropRegistry);
    }
    /**
     * Turns an element into a drop list.
     * @param element Element to which to attach the drop list functionality.
     */
    createDropList(element) {
        return new DropListRef(element, this._dragDropRegistry, this._document, this._ngZone, this._viewportRuler);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDrop, deps: [{ token: DOCUMENT }, { token: i0.NgZone }, { token: i1.ViewportRuler }, { token: DragDropRegistry }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDrop, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDrop, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.NgZone }, { type: i1.ViewportRuler }, { type: DragDropRegistry }] });

/**
 * Injection token that can be used for a `CdkDrag` to provide itself as a parent to the
 * drag-specific child directive (`CdkDragHandle`, `CdkDragPreview` etc.). Used primarily
 * to avoid circular imports.
 * @docs-private
 */
const CDK_DRAG_PARENT = new InjectionToken('CDK_DRAG_PARENT');

/**
 * Asserts that a particular node is an element.
 * @param node Node to be checked.
 * @param name Name to attach to the error message.
 */
function assertElementNode(node, name) {
    if (node.nodeType !== 1) {
        throw Error(`${name} must be attached to an element node. ` + `Currently attached to "${node.nodeName}".`);
    }
}

/**
 * Injection token that can be used to reference instances of `CdkDragHandle`. It serves as
 * alternative token to the actual `CdkDragHandle` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const CDK_DRAG_HANDLE = new InjectionToken('CdkDragHandle');
/** Handle that can be used to drag a CdkDrag instance. */
class CdkDragHandle {
    /** Whether starting to drag through this handle is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._stateChanges.next(this);
    }
    constructor(element, _parentDrag) {
        this.element = element;
        this._parentDrag = _parentDrag;
        /** Emits when the state of the handle has changed. */
        this._stateChanges = new Subject();
        this._disabled = false;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            assertElementNode(element.nativeElement, 'cdkDragHandle');
        }
        _parentDrag?._addHandle(this);
    }
    ngOnDestroy() {
        this._parentDrag?._removeHandle(this);
        this._stateChanges.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragHandle, deps: [{ token: i0.ElementRef }, { token: CDK_DRAG_PARENT, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkDragHandle, isStandalone: true, selector: "[cdkDragHandle]", inputs: { disabled: ["cdkDragHandleDisabled", "disabled", booleanAttribute] }, host: { classAttribute: "cdk-drag-handle" }, providers: [{ provide: CDK_DRAG_HANDLE, useExisting: CdkDragHandle }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragHandle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkDragHandle]',
                    standalone: true,
                    host: {
                        'class': 'cdk-drag-handle',
                    },
                    providers: [{ provide: CDK_DRAG_HANDLE, useExisting: CdkDragHandle }],
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_DRAG_PARENT]
                }, {
                    type: Optional
                }, {
                    type: SkipSelf
                }] }], propDecorators: { disabled: [{
                type: Input,
                args: [{ alias: 'cdkDragHandleDisabled', transform: booleanAttribute }]
            }] } });

/**
 * Injection token that can be used to configure the
 * behavior of the drag&drop-related components.
 */
const CDK_DRAG_CONFIG = new InjectionToken('CDK_DRAG_CONFIG');

const DRAG_HOST_CLASS = 'cdk-drag';
/**
 * Injection token that can be used to reference instances of `CdkDropList`. It serves as
 * alternative token to the actual `CdkDropList` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const CDK_DROP_LIST = new InjectionToken('CdkDropList');
/** Element that can be moved inside a CdkDropList container. */
class CdkDrag {
    static { this._dragInstances = []; }
    /** Whether starting to drag this element is disabled. */
    get disabled() {
        return this._disabled || (this.dropContainer && this.dropContainer.disabled);
    }
    set disabled(value) {
        this._disabled = value;
        this._dragRef.disabled = this._disabled;
    }
    constructor(
    /** Element that the draggable is attached to. */
    element, 
    /** Droppable container that the draggable is a part of. */
    dropContainer, 
    /**
     * @deprecated `_document` parameter no longer being used and will be removed.
     * @breaking-change 12.0.0
     */
    _document, _ngZone, _viewContainerRef, config, _dir, dragDrop, _changeDetectorRef, _selfHandle, _parentDrag) {
        this.element = element;
        this.dropContainer = dropContainer;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._dir = _dir;
        this._changeDetectorRef = _changeDetectorRef;
        this._selfHandle = _selfHandle;
        this._parentDrag = _parentDrag;
        this._destroyed = new Subject();
        this._handles = new BehaviorSubject([]);
        /**
         * If the parent of the dragged element has a `scale` transform, it can throw off the
         * positioning when the user starts dragging. Use this input to notify the CDK of the scale.
         */
        this.scale = 1;
        /** Emits when the user starts dragging the item. */
        this.started = new EventEmitter();
        /** Emits when the user has released a drag item, before any animations have started. */
        this.released = new EventEmitter();
        /** Emits when the user stops dragging an item in the container. */
        this.ended = new EventEmitter();
        /** Emits when the user has moved the item into a new container. */
        this.entered = new EventEmitter();
        /** Emits when the user removes the item its container by dragging it into another container. */
        this.exited = new EventEmitter();
        /** Emits when the user drops the item inside a container. */
        this.dropped = new EventEmitter();
        /**
         * Emits as the user is dragging the item. Use with caution,
         * because this event will fire for every pixel that the user has dragged.
         */
        this.moved = new Observable((observer) => {
            const subscription = this._dragRef.moved
                .pipe(map(movedEvent => ({
                source: this,
                pointerPosition: movedEvent.pointerPosition,
                event: movedEvent.event,
                delta: movedEvent.delta,
                distance: movedEvent.distance,
            })))
                .subscribe(observer);
            return () => {
                subscription.unsubscribe();
            };
        });
        this._injector = inject(Injector);
        this._dragRef = dragDrop.createDrag(element, {
            dragStartThreshold: config && config.dragStartThreshold != null ? config.dragStartThreshold : 5,
            pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null
                ? config.pointerDirectionChangeThreshold
                : 5,
            zIndex: config?.zIndex,
        });
        this._dragRef.data = this;
        // We have to keep track of the drag instances in order to be able to match an element to
        // a drag instance. We can't go through the global registry of `DragRef`, because the root
        // element could be different.
        CdkDrag._dragInstances.push(this);
        if (config) {
            this._assignDefaults(config);
        }
        // Note that usually the container is assigned when the drop list is picks up the item, but in
        // some cases (mainly transplanted views with OnPush, see #18341) we may end up in a situation
        // where there are no items on the first change detection pass, but the items get picked up as
        // soon as the user triggers another pass by dragging. This is a problem, because the item would
        // have to switch from standalone mode to drag mode in the middle of the dragging sequence which
        // is too late since the two modes save different kinds of information. We work around it by
        // assigning the drop container both from here and the list.
        if (dropContainer) {
            this._dragRef._withDropContainer(dropContainer._dropListRef);
            dropContainer.addItem(this);
            // The drop container reads this so we need to sync it here.
            dropContainer._dropListRef.beforeStarted.pipe(takeUntil(this._destroyed)).subscribe(() => {
                this._dragRef.scale = this.scale;
            });
        }
        this._syncInputs(this._dragRef);
        this._handleEvents(this._dragRef);
    }
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     */
    getPlaceholderElement() {
        return this._dragRef.getPlaceholderElement();
    }
    /** Returns the root draggable element. */
    getRootElement() {
        return this._dragRef.getRootElement();
    }
    /** Resets a standalone drag item to its initial position. */
    reset() {
        this._dragRef.reset();
    }
    /**
     * Gets the pixel coordinates of the draggable outside of a drop container.
     */
    getFreeDragPosition() {
        return this._dragRef.getFreeDragPosition();
    }
    /**
     * Sets the current position in pixels the draggable outside of a drop container.
     * @param value New position to be set.
     */
    setFreeDragPosition(value) {
        this._dragRef.setFreeDragPosition(value);
    }
    ngAfterViewInit() {
        // We need to wait until after render, in order for the reference
        // element to be in the proper place in the DOM. This is mostly relevant
        // for draggable elements inside portals since they get stamped out in
        // their original DOM position, and then they get transferred to the portal.
        afterNextRender(() => {
            this._updateRootElement();
            this._setupHandlesListener();
            this._dragRef.scale = this.scale;
            if (this.freeDragPosition) {
                this._dragRef.setFreeDragPosition(this.freeDragPosition);
            }
        }, { injector: this._injector });
    }
    ngOnChanges(changes) {
        const rootSelectorChange = changes['rootElementSelector'];
        const positionChange = changes['freeDragPosition'];
        // We don't have to react to the first change since it's being
        // handled in the `afterNextRender` queued up in the constructor.
        if (rootSelectorChange && !rootSelectorChange.firstChange) {
            this._updateRootElement();
        }
        // Scale affects the free drag position so we need to sync it up here.
        this._dragRef.scale = this.scale;
        // Skip the first change since it's being handled in the `afterNextRender` queued up in the
        // constructor.
        if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
            this._dragRef.setFreeDragPosition(this.freeDragPosition);
        }
    }
    ngOnDestroy() {
        if (this.dropContainer) {
            this.dropContainer.removeItem(this);
        }
        const index = CdkDrag._dragInstances.indexOf(this);
        if (index > -1) {
            CdkDrag._dragInstances.splice(index, 1);
        }
        // Unnecessary in most cases, but used to avoid extra change detections with `zone-paths-rxjs`.
        this._ngZone.runOutsideAngular(() => {
            this._handles.complete();
            this._destroyed.next();
            this._destroyed.complete();
            this._dragRef.dispose();
        });
    }
    _addHandle(handle) {
        const handles = this._handles.getValue();
        handles.push(handle);
        this._handles.next(handles);
    }
    _removeHandle(handle) {
        const handles = this._handles.getValue();
        const index = handles.indexOf(handle);
        if (index > -1) {
            handles.splice(index, 1);
            this._handles.next(handles);
        }
    }
    _setPreviewTemplate(preview) {
        this._previewTemplate = preview;
    }
    _resetPreviewTemplate(preview) {
        if (preview === this._previewTemplate) {
            this._previewTemplate = null;
        }
    }
    _setPlaceholderTemplate(placeholder) {
        this._placeholderTemplate = placeholder;
    }
    _resetPlaceholderTemplate(placeholder) {
        if (placeholder === this._placeholderTemplate) {
            this._placeholderTemplate = null;
        }
    }
    /** Syncs the root element with the `DragRef`. */
    _updateRootElement() {
        const element = this.element.nativeElement;
        let rootElement = element;
        if (this.rootElementSelector) {
            rootElement =
                element.closest !== undefined
                    ? element.closest(this.rootElementSelector)
                    : // Comment tag doesn't have closest method, so use parent's one.
                        element.parentElement?.closest(this.rootElementSelector);
        }
        if (rootElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            assertElementNode(rootElement, 'cdkDrag');
        }
        this._dragRef.withRootElement(rootElement || element);
    }
    /** Gets the boundary element, based on the `boundaryElement` value. */
    _getBoundaryElement() {
        const boundary = this.boundaryElement;
        if (!boundary) {
            return null;
        }
        if (typeof boundary === 'string') {
            return this.element.nativeElement.closest(boundary);
        }
        return coerceElement(boundary);
    }
    /** Syncs the inputs of the CdkDrag with the options of the underlying DragRef. */
    _syncInputs(ref) {
        ref.beforeStarted.subscribe(() => {
            if (!ref.isDragging()) {
                const dir = this._dir;
                const dragStartDelay = this.dragStartDelay;
                const placeholder = this._placeholderTemplate
                    ? {
                        template: this._placeholderTemplate.templateRef,
                        context: this._placeholderTemplate.data,
                        viewContainer: this._viewContainerRef,
                    }
                    : null;
                const preview = this._previewTemplate
                    ? {
                        template: this._previewTemplate.templateRef,
                        context: this._previewTemplate.data,
                        matchSize: this._previewTemplate.matchSize,
                        viewContainer: this._viewContainerRef,
                    }
                    : null;
                ref.disabled = this.disabled;
                ref.lockAxis = this.lockAxis;
                ref.scale = this.scale;
                ref.dragStartDelay =
                    typeof dragStartDelay === 'object' && dragStartDelay
                        ? dragStartDelay
                        : coerceNumberProperty(dragStartDelay);
                ref.constrainPosition = this.constrainPosition;
                ref.previewClass = this.previewClass;
                ref
                    .withBoundaryElement(this._getBoundaryElement())
                    .withPlaceholderTemplate(placeholder)
                    .withPreviewTemplate(preview)
                    .withPreviewContainer(this.previewContainer || 'global');
                if (dir) {
                    ref.withDirection(dir.value);
                }
            }
        });
        // This only needs to be resolved once.
        ref.beforeStarted.pipe(take(1)).subscribe(() => {
            // If we managed to resolve a parent through DI, use it.
            if (this._parentDrag) {
                ref.withParent(this._parentDrag._dragRef);
                return;
            }
            // Otherwise fall back to resolving the parent by looking up the DOM. This can happen if
            // the item was projected into another item by something like `ngTemplateOutlet`.
            let parent = this.element.nativeElement.parentElement;
            while (parent) {
                if (parent.classList.contains(DRAG_HOST_CLASS)) {
                    ref.withParent(CdkDrag._dragInstances.find(drag => {
                        return drag.element.nativeElement === parent;
                    })?._dragRef || null);
                    break;
                }
                parent = parent.parentElement;
            }
        });
    }
    /** Handles the events from the underlying `DragRef`. */
    _handleEvents(ref) {
        ref.started.subscribe(startEvent => {
            this.started.emit({ source: this, event: startEvent.event });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.released.subscribe(releaseEvent => {
            this.released.emit({ source: this, event: releaseEvent.event });
        });
        ref.ended.subscribe(endEvent => {
            this.ended.emit({
                source: this,
                distance: endEvent.distance,
                dropPoint: endEvent.dropPoint,
                event: endEvent.event,
            });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.entered.subscribe(enterEvent => {
            this.entered.emit({
                container: enterEvent.container.data,
                item: this,
                currentIndex: enterEvent.currentIndex,
            });
        });
        ref.exited.subscribe(exitEvent => {
            this.exited.emit({
                container: exitEvent.container.data,
                item: this,
            });
        });
        ref.dropped.subscribe(dropEvent => {
            this.dropped.emit({
                previousIndex: dropEvent.previousIndex,
                currentIndex: dropEvent.currentIndex,
                previousContainer: dropEvent.previousContainer.data,
                container: dropEvent.container.data,
                isPointerOverContainer: dropEvent.isPointerOverContainer,
                item: this,
                distance: dropEvent.distance,
                dropPoint: dropEvent.dropPoint,
                event: dropEvent.event,
            });
        });
    }
    /** Assigns the default input values based on a provided config object. */
    _assignDefaults(config) {
        const { lockAxis, dragStartDelay, constrainPosition, previewClass, boundaryElement, draggingDisabled, rootElementSelector, previewContainer, } = config;
        this.disabled = draggingDisabled == null ? false : draggingDisabled;
        this.dragStartDelay = dragStartDelay || 0;
        if (lockAxis) {
            this.lockAxis = lockAxis;
        }
        if (constrainPosition) {
            this.constrainPosition = constrainPosition;
        }
        if (previewClass) {
            this.previewClass = previewClass;
        }
        if (boundaryElement) {
            this.boundaryElement = boundaryElement;
        }
        if (rootElementSelector) {
            this.rootElementSelector = rootElementSelector;
        }
        if (previewContainer) {
            this.previewContainer = previewContainer;
        }
    }
    /** Sets up the listener that syncs the handles with the drag ref. */
    _setupHandlesListener() {
        // Listen for any newly-added handles.
        this._handles
            .pipe(
        // Sync the new handles with the DragRef.
        tap(handles => {
            const handleElements = handles.map(handle => handle.element);
            // Usually handles are only allowed to be a descendant of the drag element, but if
            // the consumer defined a different drag root, we should allow the drag element
            // itself to be a handle too.
            if (this._selfHandle && this.rootElementSelector) {
                handleElements.push(this.element);
            }
            this._dragRef.withHandles(handleElements);
        }), 
        // Listen if the state of any of the handles changes.
        switchMap((handles) => {
            return merge(...handles.map(item => item._stateChanges.pipe(startWith(item))));
        }), takeUntil(this._destroyed))
            .subscribe(handleInstance => {
            // Enabled/disable the handle that changed in the DragRef.
            const dragRef = this._dragRef;
            const handle = handleInstance.element.nativeElement;
            handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDrag, deps: [{ token: i0.ElementRef }, { token: CDK_DROP_LIST, optional: true, skipSelf: true }, { token: DOCUMENT }, { token: i0.NgZone }, { token: i0.ViewContainerRef }, { token: CDK_DRAG_CONFIG, optional: true }, { token: i1$1.Directionality, optional: true }, { token: DragDrop }, { token: i0.ChangeDetectorRef }, { token: CDK_DRAG_HANDLE, optional: true, self: true }, { token: CDK_DRAG_PARENT, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkDrag, isStandalone: true, selector: "[cdkDrag]", inputs: { data: ["cdkDragData", "data"], lockAxis: ["cdkDragLockAxis", "lockAxis"], rootElementSelector: ["cdkDragRootElement", "rootElementSelector"], boundaryElement: ["cdkDragBoundary", "boundaryElement"], dragStartDelay: ["cdkDragStartDelay", "dragStartDelay"], freeDragPosition: ["cdkDragFreeDragPosition", "freeDragPosition"], disabled: ["cdkDragDisabled", "disabled", booleanAttribute], constrainPosition: ["cdkDragConstrainPosition", "constrainPosition"], previewClass: ["cdkDragPreviewClass", "previewClass"], previewContainer: ["cdkDragPreviewContainer", "previewContainer"], scale: ["cdkDragScale", "scale", numberAttribute] }, outputs: { started: "cdkDragStarted", released: "cdkDragReleased", ended: "cdkDragEnded", entered: "cdkDragEntered", exited: "cdkDragExited", dropped: "cdkDragDropped", moved: "cdkDragMoved" }, host: { properties: { "class.cdk-drag-disabled": "disabled", "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }], exportAs: ["cdkDrag"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDrag, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkDrag]',
                    exportAs: 'cdkDrag',
                    standalone: true,
                    host: {
                        'class': DRAG_HOST_CLASS,
                        '[class.cdk-drag-disabled]': 'disabled',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }],
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_DROP_LIST]
                }, {
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.NgZone }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }, { type: i1$1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: DragDrop }, { type: i0.ChangeDetectorRef }, { type: CdkDragHandle, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }, {
                    type: Inject,
                    args: [CDK_DRAG_HANDLE]
                }] }, { type: CdkDrag, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Inject,
                    args: [CDK_DRAG_PARENT]
                }] }], propDecorators: { data: [{
                type: Input,
                args: ['cdkDragData']
            }], lockAxis: [{
                type: Input,
                args: ['cdkDragLockAxis']
            }], rootElementSelector: [{
                type: Input,
                args: ['cdkDragRootElement']
            }], boundaryElement: [{
                type: Input,
                args: ['cdkDragBoundary']
            }], dragStartDelay: [{
                type: Input,
                args: ['cdkDragStartDelay']
            }], freeDragPosition: [{
                type: Input,
                args: ['cdkDragFreeDragPosition']
            }], disabled: [{
                type: Input,
                args: [{ alias: 'cdkDragDisabled', transform: booleanAttribute }]
            }], constrainPosition: [{
                type: Input,
                args: ['cdkDragConstrainPosition']
            }], previewClass: [{
                type: Input,
                args: ['cdkDragPreviewClass']
            }], previewContainer: [{
                type: Input,
                args: ['cdkDragPreviewContainer']
            }], scale: [{
                type: Input,
                args: [{ alias: 'cdkDragScale', transform: numberAttribute }]
            }], started: [{
                type: Output,
                args: ['cdkDragStarted']
            }], released: [{
                type: Output,
                args: ['cdkDragReleased']
            }], ended: [{
                type: Output,
                args: ['cdkDragEnded']
            }], entered: [{
                type: Output,
                args: ['cdkDragEntered']
            }], exited: [{
                type: Output,
                args: ['cdkDragExited']
            }], dropped: [{
                type: Output,
                args: ['cdkDragDropped']
            }], moved: [{
                type: Output,
                args: ['cdkDragMoved']
            }] } });

/**
 * Injection token that can be used to reference instances of `CdkDropListGroup`. It serves as
 * alternative token to the actual `CdkDropListGroup` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const CDK_DROP_LIST_GROUP = new InjectionToken('CdkDropListGroup');
/**
 * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
 * elements that are placed inside a `cdkDropListGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
 * from `cdkDropList`.
 */
class CdkDropListGroup {
    constructor() {
        /** Drop lists registered inside the group. */
        this._items = new Set();
        /** Whether starting a dragging sequence from inside this group is disabled. */
        this.disabled = false;
    }
    ngOnDestroy() {
        this._items.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDropListGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkDropListGroup, isStandalone: true, selector: "[cdkDropListGroup]", inputs: { disabled: ["cdkDropListGroupDisabled", "disabled", booleanAttribute] }, providers: [{ provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup }], exportAs: ["cdkDropListGroup"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDropListGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkDropListGroup]',
                    exportAs: 'cdkDropListGroup',
                    standalone: true,
                    providers: [{ provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup }],
                }]
        }], propDecorators: { disabled: [{
                type: Input,
                args: [{ alias: 'cdkDropListGroupDisabled', transform: booleanAttribute }]
            }] } });

/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;
/** Container that wraps a set of draggable items. */
class CdkDropList {
    /** Keeps track of the drop lists that are currently on the page. */
    static { this._dropLists = []; }
    /** Whether starting a dragging sequence from this container is disabled. */
    get disabled() {
        return this._disabled || (!!this._group && this._group.disabled);
    }
    set disabled(value) {
        // Usually we sync the directive and ref state right before dragging starts, in order to have
        // a single point of failure and to avoid having to use setters for everything. `disabled` is
        // a special case, because it can prevent the `beforeStarted` event from firing, which can lock
        // the user in a disabled state, so we also need to sync it as it's being set.
        this._dropListRef.disabled = this._disabled = value;
    }
    constructor(
    /** Element that the drop list is attached to. */
    element, dragDrop, _changeDetectorRef, _scrollDispatcher, _dir, _group, config) {
        this.element = element;
        this._changeDetectorRef = _changeDetectorRef;
        this._scrollDispatcher = _scrollDispatcher;
        this._dir = _dir;
        this._group = _group;
        /** Emits when the list has been destroyed. */
        this._destroyed = new Subject();
        /**
         * Other draggable containers that this container is connected to and into which the
         * container's items can be transferred. Can either be references to other drop containers,
         * or their unique IDs.
         */
        this.connectedTo = [];
        /**
         * Unique ID for the drop zone. Can be used as a reference
         * in the `connectedTo` of another `CdkDropList`.
         */
        this.id = `cdk-drop-list-${_uniqueIdCounter++}`;
        /**
         * Function that is used to determine whether an item
         * is allowed to be moved into a drop container.
         */
        this.enterPredicate = () => true;
        /** Functions that is used to determine whether an item can be sorted into a particular index. */
        this.sortPredicate = () => true;
        /** Emits when the user drops an item inside the container. */
        this.dropped = new EventEmitter();
        /**
         * Emits when the user has moved a new drag item into this container.
         */
        this.entered = new EventEmitter();
        /**
         * Emits when the user removes an item from the container
         * by dragging it into another container.
         */
        this.exited = new EventEmitter();
        /** Emits as the user is swapping items while actively dragging. */
        this.sorted = new EventEmitter();
        /**
         * Keeps track of the items that are registered with this container. Historically we used to
         * do this with a `ContentChildren` query, however queries don't handle transplanted views very
         * well which means that we can't handle cases like dragging the headers of a `mat-table`
         * correctly. What we do instead is to have the items register themselves with the container
         * and then we sort them based on their position in the DOM.
         */
        this._unsortedItems = new Set();
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            assertElementNode(element.nativeElement, 'cdkDropList');
        }
        this._dropListRef = dragDrop.createDropList(element);
        this._dropListRef.data = this;
        if (config) {
            this._assignDefaults(config);
        }
        this._dropListRef.enterPredicate = (drag, drop) => {
            return this.enterPredicate(drag.data, drop.data);
        };
        this._dropListRef.sortPredicate = (index, drag, drop) => {
            return this.sortPredicate(index, drag.data, drop.data);
        };
        this._setupInputSyncSubscription(this._dropListRef);
        this._handleEvents(this._dropListRef);
        CdkDropList._dropLists.push(this);
        if (_group) {
            _group._items.add(this);
        }
    }
    /** Registers an items with the drop list. */
    addItem(item) {
        this._unsortedItems.add(item);
        if (this._dropListRef.isDragging()) {
            this._syncItemsWithRef();
        }
    }
    /** Removes an item from the drop list. */
    removeItem(item) {
        this._unsortedItems.delete(item);
        if (this._dropListRef.isDragging()) {
            this._syncItemsWithRef();
        }
    }
    /** Gets the registered items in the list, sorted by their position in the DOM. */
    getSortedItems() {
        return Array.from(this._unsortedItems).sort((a, b) => {
            const documentPosition = a._dragRef
                .getVisibleElement()
                .compareDocumentPosition(b._dragRef.getVisibleElement());
            // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
            // tslint:disable-next-line:no-bitwise
            return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
    }
    ngOnDestroy() {
        const index = CdkDropList._dropLists.indexOf(this);
        if (index > -1) {
            CdkDropList._dropLists.splice(index, 1);
        }
        if (this._group) {
            this._group._items.delete(this);
        }
        this._unsortedItems.clear();
        this._dropListRef.dispose();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Syncs the inputs of the CdkDropList with the options of the underlying DropListRef. */
    _setupInputSyncSubscription(ref) {
        if (this._dir) {
            this._dir.change
                .pipe(startWith(this._dir.value), takeUntil(this._destroyed))
                .subscribe(value => ref.withDirection(value));
        }
        ref.beforeStarted.subscribe(() => {
            const siblings = coerceArray(this.connectedTo).map(drop => {
                if (typeof drop === 'string') {
                    const correspondingDropList = CdkDropList._dropLists.find(list => list.id === drop);
                    if (!correspondingDropList && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                        console.warn(`CdkDropList could not find connected drop list with id "${drop}"`);
                    }
                    return correspondingDropList;
                }
                return drop;
            });
            if (this._group) {
                this._group._items.forEach(drop => {
                    if (siblings.indexOf(drop) === -1) {
                        siblings.push(drop);
                    }
                });
            }
            // Note that we resolve the scrollable parents here so that we delay the resolution
            // as long as possible, ensuring that the element is in its final place in the DOM.
            if (!this._scrollableParentsResolved) {
                const scrollableParents = this._scrollDispatcher
                    .getAncestorScrollContainers(this.element)
                    .map(scrollable => scrollable.getElementRef().nativeElement);
                this._dropListRef.withScrollableParents(scrollableParents);
                // Only do this once since it involves traversing the DOM and the parents
                // shouldn't be able to change without the drop list being destroyed.
                this._scrollableParentsResolved = true;
            }
            if (this.elementContainerSelector) {
                const container = this.element.nativeElement.querySelector(this.elementContainerSelector);
                if (!container && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throw new Error(`CdkDropList could not find an element container matching the selector "${this.elementContainerSelector}"`);
                }
                ref.withElementContainer(container);
            }
            ref.disabled = this.disabled;
            ref.lockAxis = this.lockAxis;
            ref.sortingDisabled = this.sortingDisabled;
            ref.autoScrollDisabled = this.autoScrollDisabled;
            ref.autoScrollStep = coerceNumberProperty(this.autoScrollStep, 2);
            ref
                .connectedTo(siblings.filter(drop => drop && drop !== this).map(list => list._dropListRef))
                .withOrientation(this.orientation);
        });
    }
    /** Handles events from the underlying DropListRef. */
    _handleEvents(ref) {
        ref.beforeStarted.subscribe(() => {
            this._syncItemsWithRef();
            this._changeDetectorRef.markForCheck();
        });
        ref.entered.subscribe(event => {
            this.entered.emit({
                container: this,
                item: event.item.data,
                currentIndex: event.currentIndex,
            });
        });
        ref.exited.subscribe(event => {
            this.exited.emit({
                container: this,
                item: event.item.data,
            });
            this._changeDetectorRef.markForCheck();
        });
        ref.sorted.subscribe(event => {
            this.sorted.emit({
                previousIndex: event.previousIndex,
                currentIndex: event.currentIndex,
                container: this,
                item: event.item.data,
            });
        });
        ref.dropped.subscribe(dropEvent => {
            this.dropped.emit({
                previousIndex: dropEvent.previousIndex,
                currentIndex: dropEvent.currentIndex,
                previousContainer: dropEvent.previousContainer.data,
                container: dropEvent.container.data,
                item: dropEvent.item.data,
                isPointerOverContainer: dropEvent.isPointerOverContainer,
                distance: dropEvent.distance,
                dropPoint: dropEvent.dropPoint,
                event: dropEvent.event,
            });
            // Mark for check since all of these events run outside of change
            // detection and we're not guaranteed for something else to have triggered it.
            this._changeDetectorRef.markForCheck();
        });
        merge(ref.receivingStarted, ref.receivingStopped).subscribe(() => this._changeDetectorRef.markForCheck());
    }
    /** Assigns the default input values based on a provided config object. */
    _assignDefaults(config) {
        const { lockAxis, draggingDisabled, sortingDisabled, listAutoScrollDisabled, listOrientation } = config;
        this.disabled = draggingDisabled == null ? false : draggingDisabled;
        this.sortingDisabled = sortingDisabled == null ? false : sortingDisabled;
        this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;
        this.orientation = listOrientation || 'vertical';
        if (lockAxis) {
            this.lockAxis = lockAxis;
        }
    }
    /** Syncs up the registered drag items with underlying drop list ref. */
    _syncItemsWithRef() {
        this._dropListRef.withItems(this.getSortedItems().map(item => item._dragRef));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDropList, deps: [{ token: i0.ElementRef }, { token: DragDrop }, { token: i0.ChangeDetectorRef }, { token: i1.ScrollDispatcher }, { token: i1$1.Directionality, optional: true }, { token: CDK_DROP_LIST_GROUP, optional: true, skipSelf: true }, { token: CDK_DRAG_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkDropList, isStandalone: true, selector: "[cdkDropList], cdk-drop-list", inputs: { connectedTo: ["cdkDropListConnectedTo", "connectedTo"], data: ["cdkDropListData", "data"], orientation: ["cdkDropListOrientation", "orientation"], id: "id", lockAxis: ["cdkDropListLockAxis", "lockAxis"], disabled: ["cdkDropListDisabled", "disabled", booleanAttribute], sortingDisabled: ["cdkDropListSortingDisabled", "sortingDisabled", booleanAttribute], enterPredicate: ["cdkDropListEnterPredicate", "enterPredicate"], sortPredicate: ["cdkDropListSortPredicate", "sortPredicate"], autoScrollDisabled: ["cdkDropListAutoScrollDisabled", "autoScrollDisabled", booleanAttribute], autoScrollStep: ["cdkDropListAutoScrollStep", "autoScrollStep"], elementContainerSelector: ["cdkDropListElementContainer", "elementContainerSelector"] }, outputs: { dropped: "cdkDropListDropped", entered: "cdkDropListEntered", exited: "cdkDropListExited", sorted: "cdkDropListSorted" }, host: { properties: { "attr.id": "id", "class.cdk-drop-list-disabled": "disabled", "class.cdk-drop-list-dragging": "_dropListRef.isDragging()", "class.cdk-drop-list-receiving": "_dropListRef.isReceiving()" }, classAttribute: "cdk-drop-list" }, providers: [
            // Prevent child drop lists from picking up the same group as their parent.
            { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
            { provide: CDK_DROP_LIST, useExisting: CdkDropList },
        ], exportAs: ["cdkDropList"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDropList, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkDropList], cdk-drop-list',
                    exportAs: 'cdkDropList',
                    standalone: true,
                    providers: [
                        // Prevent child drop lists from picking up the same group as their parent.
                        { provide: CDK_DROP_LIST_GROUP, useValue: undefined },
                        { provide: CDK_DROP_LIST, useExisting: CdkDropList },
                    ],
                    host: {
                        'class': 'cdk-drop-list',
                        '[attr.id]': 'id',
                        '[class.cdk-drop-list-disabled]': 'disabled',
                        '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                        '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                    },
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: DragDrop }, { type: i0.ChangeDetectorRef }, { type: i1.ScrollDispatcher }, { type: i1$1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: CdkDropListGroup, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DROP_LIST_GROUP]
                }, {
                    type: SkipSelf
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }], propDecorators: { connectedTo: [{
                type: Input,
                args: ['cdkDropListConnectedTo']
            }], data: [{
                type: Input,
                args: ['cdkDropListData']
            }], orientation: [{
                type: Input,
                args: ['cdkDropListOrientation']
            }], id: [{
                type: Input
            }], lockAxis: [{
                type: Input,
                args: ['cdkDropListLockAxis']
            }], disabled: [{
                type: Input,
                args: [{ alias: 'cdkDropListDisabled', transform: booleanAttribute }]
            }], sortingDisabled: [{
                type: Input,
                args: [{ alias: 'cdkDropListSortingDisabled', transform: booleanAttribute }]
            }], enterPredicate: [{
                type: Input,
                args: ['cdkDropListEnterPredicate']
            }], sortPredicate: [{
                type: Input,
                args: ['cdkDropListSortPredicate']
            }], autoScrollDisabled: [{
                type: Input,
                args: [{ alias: 'cdkDropListAutoScrollDisabled', transform: booleanAttribute }]
            }], autoScrollStep: [{
                type: Input,
                args: ['cdkDropListAutoScrollStep']
            }], elementContainerSelector: [{
                type: Input,
                args: ['cdkDropListElementContainer']
            }], dropped: [{
                type: Output,
                args: ['cdkDropListDropped']
            }], entered: [{
                type: Output,
                args: ['cdkDropListEntered']
            }], exited: [{
                type: Output,
                args: ['cdkDropListExited']
            }], sorted: [{
                type: Output,
                args: ['cdkDropListSorted']
            }] } });

/**
 * Injection token that can be used to reference instances of `CdkDragPreview`. It serves as
 * alternative token to the actual `CdkDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const CDK_DRAG_PREVIEW = new InjectionToken('CdkDragPreview');
/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 */
class CdkDragPreview {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._drag = inject(CDK_DRAG_PARENT, { optional: true });
        /** Whether the preview should preserve the same size as the item that is being dragged. */
        this.matchSize = false;
        this._drag?._setPreviewTemplate(this);
    }
    ngOnDestroy() {
        this._drag?._resetPreviewTemplate(this);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPreview, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkDragPreview, isStandalone: true, selector: "ng-template[cdkDragPreview]", inputs: { data: "data", matchSize: ["matchSize", "matchSize", booleanAttribute] }, providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPreview, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkDragPreview]',
                    standalone: true,
                    providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }],
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }], propDecorators: { data: [{
                type: Input
            }], matchSize: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Injection token that can be used to reference instances of `CdkDragPlaceholder`. It serves as
 * alternative token to the actual `CdkDragPlaceholder` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const CDK_DRAG_PLACEHOLDER = new InjectionToken('CdkDragPlaceholder');
/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
class CdkDragPlaceholder {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._drag = inject(CDK_DRAG_PARENT, { optional: true });
        this._drag?._setPlaceholderTemplate(this);
    }
    ngOnDestroy() {
        this._drag?._resetPlaceholderTemplate(this);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPlaceholder, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkDragPlaceholder, isStandalone: true, selector: "ng-template[cdkDragPlaceholder]", inputs: { data: "data" }, providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPlaceholder, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkDragPlaceholder]',
                    standalone: true,
                    providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }],
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }], propDecorators: { data: [{
                type: Input
            }] } });

const DRAG_DROP_DIRECTIVES = [
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
];
class DragDropModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, imports: [CdkDropList,
            CdkDropListGroup,
            CdkDrag,
            CdkDragHandle,
            CdkDragPreview,
            CdkDragPlaceholder], exports: [CdkScrollableModule, CdkDropList,
            CdkDropListGroup,
            CdkDrag,
            CdkDragHandle,
            CdkDragPreview,
            CdkDragPlaceholder] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, providers: [DragDrop], imports: [CdkScrollableModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: DRAG_DROP_DIRECTIVES,
                    exports: [CdkScrollableModule, ...DRAG_DROP_DIRECTIVES],
                    providers: [DragDrop],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CDK_DRAG_CONFIG, CDK_DRAG_HANDLE, CDK_DRAG_PARENT, CDK_DRAG_PLACEHOLDER, CDK_DRAG_PREVIEW, CDK_DROP_LIST, CDK_DROP_LIST_GROUP, CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, CdkDropList, CdkDropListGroup, DragDrop, DragDropModule, DragDropRegistry, DragRef, DropListRef, copyArrayItem, moveItemInArray, transferArrayItem };
//# sourceMappingURL=drag-drop.mjs.map
