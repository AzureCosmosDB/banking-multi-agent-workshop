/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceElement } from '@angular/cdk/coercion';
import { _getShadowRoot } from '@angular/cdk/platform';
import { Subject, Subscription, interval, animationFrameScheduler } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPointerNearDomRect, isInsideClientRect } from './dom/dom-rect';
import { ParentPositionTracker } from './dom/parent-position-tracker';
import { SingleAxisSortStrategy } from './sorting/single-axis-sort-strategy';
import { MixedSortStrategy } from './sorting/mixed-sort-strategy';
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
export class DropListRef {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcC1saXN0LXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2Ryb3AtbGlzdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXBELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDOUUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3pDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBR2hFOzs7R0FHRztBQUNILE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDO0FBRXRDOzs7R0FHRztBQUNILE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDO0FBRXhDLHNEQUFzRDtBQUN0RCxJQUFLLDJCQUlKO0FBSkQsV0FBSywyQkFBMkI7SUFDOUIsNkVBQUksQ0FBQTtJQUNKLHlFQUFFLENBQUE7SUFDRiw2RUFBSSxDQUFBO0FBQ04sQ0FBQyxFQUpJLDJCQUEyQixLQUEzQiwyQkFBMkIsUUFJL0I7QUFFRCx3REFBd0Q7QUFDeEQsSUFBSyw2QkFJSjtBQUpELFdBQUssNkJBQTZCO0lBQ2hDLGlGQUFJLENBQUE7SUFDSixpRkFBSSxDQUFBO0lBQ0osbUZBQUssQ0FBQTtBQUNQLENBQUMsRUFKSSw2QkFBNkIsS0FBN0IsNkJBQTZCLFFBSWpDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sV0FBVztJQXdJdEIsWUFDRSxPQUE4QyxFQUN0QyxpQkFBbUMsRUFDM0MsU0FBYyxFQUNOLE9BQWUsRUFDZixjQUE2QjtRQUg3QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBRW5DLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixtQkFBYyxHQUFkLGNBQWMsQ0FBZTtRQXpJdkMsNEVBQTRFO1FBQzVFLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIseURBQXlEO1FBQ3pELG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBS2pDOzs7V0FHRztRQUNILHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUVwQyxnRkFBZ0Y7UUFDaEYsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFFM0I7OztXQUdHO1FBQ0gsbUJBQWMsR0FBa0QsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO1FBRTNFLGdHQUFnRztRQUNoRyxrQkFBYSxHQUFpRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFFekYsK0NBQStDO1FBQ3RDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUU3Qzs7V0FFRztRQUNNLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBaUUsQ0FBQztRQUVoRzs7O1dBR0c7UUFDTSxXQUFNLEdBQUcsSUFBSSxPQUFPLEVBQTJDLENBQUM7UUFFekUsOERBQThEO1FBQ3JELFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFVMUIsQ0FBQztRQUVMLG1FQUFtRTtRQUMxRCxXQUFNLEdBQUcsSUFBSSxPQUFPLEVBS3pCLENBQUM7UUFFTCx3RkFBd0Y7UUFDL0UscUJBQWdCLEdBQUcsSUFBSSxPQUFPLEVBSW5DLENBQUM7UUFFTCwwRkFBMEY7UUFDakYscUJBQWdCLEdBQUcsSUFBSSxPQUFPLEVBR25DLENBQUM7UUFRTCxvREFBb0Q7UUFDNUMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFXNUIsd0NBQXdDO1FBQ2hDLGdCQUFXLEdBQXVCLEVBQUUsQ0FBQztRQUU3Qyx3REFBd0Q7UUFDaEQsY0FBUyxHQUEyQixFQUFFLENBQUM7UUFFL0MsNkRBQTZEO1FBQ3JELG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQUVqRCxpREFBaUQ7UUFDekMsZ0NBQTJCLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUV6RCxtRUFBbUU7UUFDM0QsNkJBQXdCLEdBQUcsMkJBQTJCLENBQUMsSUFBSSxDQUFDO1FBRXBFLHFFQUFxRTtRQUM3RCwrQkFBMEIsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUM7UUFLeEUsdUVBQXVFO1FBQ3RELHNCQUFpQixHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFekQsaUdBQWlHO1FBQ3pGLHNCQUFpQixHQUFnQyxJQUFJLENBQUM7UUFLOUQsZ0VBQWdFO1FBQ3hELHdCQUFtQixHQUFrQixFQUFFLENBQUM7UUFLaEQsc0NBQXNDO1FBQzlCLGVBQVUsR0FBYyxLQUFLLENBQUM7UUEyYXRDLDJEQUEyRDtRQUNuRCx5QkFBb0IsR0FBRyxHQUFHLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXRCLFFBQVEsQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLENBQUM7aUJBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQ3ZDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztnQkFFdkMsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEtBQUssMkJBQTJCLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3JFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsd0JBQXdCLEtBQUssMkJBQTJCLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQzlFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQixDQUFDO2dCQUVELElBQUksSUFBSSxDQUFDLDBCQUEwQixLQUFLLDZCQUE2QixDQUFDLElBQUksRUFBRSxDQUFDO29CQUMzRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO3FCQUFNLElBQUksSUFBSSxDQUFDLDBCQUEwQixLQUFLLDZCQUE2QixDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuRixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO1FBeGJBLE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RFLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxnRUFBZ0U7SUFDaEUsT0FBTztRQUNMLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsaUVBQWlFO0lBQ2pFLFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUVELCtCQUErQjtJQUMvQixLQUFLO1FBQ0gsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsSUFBYSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLHFFQUFxRTtRQUNyRSxpRUFBaUU7UUFDakUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTFELHVGQUF1RjtRQUN2RiwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFFN0IsNkZBQTZGO1FBQzdGLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJLENBQUMsSUFBYTtRQUNoQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsSUFBSSxDQUNGLElBQWEsRUFDYixZQUFvQixFQUNwQixhQUFxQixFQUNyQixpQkFBOEIsRUFDOUIsc0JBQStCLEVBQy9CLFFBQWUsRUFDZixTQUFnQixFQUNoQixRQUFpQyxFQUFTO1FBRTFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2hCLElBQUk7WUFDSixZQUFZO1lBQ1osYUFBYTtZQUNiLFNBQVMsRUFBRSxJQUFJO1lBQ2YsaUJBQWlCO1lBQ2pCLHNCQUFzQjtZQUN0QixRQUFRO1lBQ1IsU0FBUztZQUNULEtBQUs7U0FDTixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLEtBQWdCO1FBQ3hCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDdEIsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRXJFLGlEQUFpRDtZQUNqRCxrREFBa0Q7WUFDbEQsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pELENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELGFBQWEsQ0FBQyxTQUFvQjtRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLElBQUksQ0FBQyxhQUFhLFlBQVksc0JBQXNCLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0MsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXLENBQUMsV0FBMEI7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZUFBZSxDQUFDLFdBQWdDO1FBQzlDLElBQUksV0FBVyxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxRQUFRLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwRSxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDckMsUUFBUSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM3RixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSCxxQkFBcUIsQ0FBQyxRQUF1QjtRQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRWhDLHVEQUF1RDtRQUN2RCwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDLG1CQUFtQjtZQUN0QixRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0UsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsb0JBQW9CLENBQUMsU0FBc0I7UUFDekMsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFNUMsSUFDRSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUM7WUFDL0MsU0FBUyxLQUFLLE9BQU87WUFDckIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUM1QixDQUFDO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FDYix5R0FBeUcsQ0FDMUcsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV0RSxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxnRkFBZ0Y7SUFDaEYsb0JBQW9CO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLENBQUMsSUFBYTtRQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXO1lBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDdkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQVMsQ0FDUCxJQUFhLEVBQ2IsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsWUFBb0M7UUFFcEMsbUVBQW1FO1FBQ25FLElBQ0UsSUFBSSxDQUFDLGVBQWU7WUFDcEIsQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUNkLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQ2xGLENBQUM7WUFDRCxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRS9FLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDZixhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWE7Z0JBQ25DLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtnQkFDakMsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsSUFBSTthQUNMLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCwwQkFBMEIsQ0FBQyxRQUFnQixFQUFFLFFBQWdCO1FBQzNELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDNUIsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLFVBQTRDLENBQUM7UUFDakQsSUFBSSx1QkFBdUIsR0FBRywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7UUFDL0QsSUFBSSx5QkFBeUIsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUM7UUFFbkUsd0VBQXdFO1FBQ3hFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQzVELHdFQUF3RTtZQUN4RSx5RUFBeUU7WUFDekUsSUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ3JFLE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLHdCQUF3QixFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM1RixDQUFDLHVCQUF1QixFQUFFLHlCQUF5QixDQUFDLEdBQUcsMEJBQTBCLENBQy9FLE9BQXNCLEVBQ3RCLFFBQVEsQ0FBQyxVQUFVLEVBQ25CLElBQUksQ0FBQyxVQUFVLEVBQ2YsUUFBUSxFQUNSLFFBQVEsQ0FDVCxDQUFDO2dCQUVGLElBQUksdUJBQXVCLElBQUkseUJBQXlCLEVBQUUsQ0FBQztvQkFDekQsVUFBVSxHQUFHLE9BQXNCLENBQUM7Z0JBQ3RDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCwwREFBMEQ7UUFDMUQsSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUMzRCxNQUFNLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDOUQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsS0FBSztnQkFDTCxNQUFNO2dCQUNOLEdBQUcsRUFBRSxDQUFDO2dCQUNOLEtBQUssRUFBRSxLQUFLO2dCQUNaLE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxDQUFDO2FBQ0csQ0FBQztZQUNiLHVCQUF1QixHQUFHLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RSx5QkFBeUIsR0FBRyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUUsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFDRSxVQUFVO1lBQ1YsQ0FBQyx1QkFBdUIsS0FBSyxJQUFJLENBQUMsd0JBQXdCO2dCQUN4RCx5QkFBeUIsS0FBSyxJQUFJLENBQUMsMEJBQTBCO2dCQUM3RCxVQUFVLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUNsQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLHdCQUF3QixHQUFHLHVCQUF1QixDQUFDO1lBQ3hELElBQUksQ0FBQywwQkFBMEIsR0FBRyx5QkFBeUIsQ0FBQztZQUM1RCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUU5QixJQUFJLENBQUMsdUJBQXVCLElBQUkseUJBQXlCLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDekUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM1RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxjQUFjO1FBQ1osSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxvREFBb0Q7SUFDNUMsZ0JBQWdCO1FBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBZ0MsQ0FBQztRQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRXhCLElBQ0UsQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDO1lBQy9DLHNGQUFzRjtZQUN0RixvRkFBb0Y7WUFDcEYsSUFBSSxDQUFDLFVBQVUsS0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUMvQyxDQUFDO1lBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDbEYsTUFBTSxJQUFJLEtBQUssQ0FDYix5R0FBeUcsQ0FDMUcsQ0FBQztnQkFDSixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLHlEQUF5RDtRQUN6RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixJQUFJLE1BQU0sQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO1FBQ2pGLE1BQU0sQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztRQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCxpRUFBaUU7SUFDekQscUJBQXFCO1FBQzNCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFdEQseURBQXlEO1FBQ3pELG9EQUFvRDtRQUNwRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQyxVQUFXLENBQUM7SUFDcEYsQ0FBQztJQUVELGlEQUFpRDtJQUN6QyxNQUFNO1FBQ1osSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFnQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUUxRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUEwQkQ7Ozs7T0FJRztJQUNILGdCQUFnQixDQUFDLENBQVMsRUFBRSxDQUFTO1FBQ25DLE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILGdDQUFnQyxDQUFDLElBQWEsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNsRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsV0FBVyxDQUFDLElBQWEsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUM3QyxJQUNFLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDZCxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNoQyxDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBdUIsQ0FBQztRQUU1RixzREFBc0Q7UUFDdEQsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELCtFQUErRTtRQUMvRSxxRkFBcUY7UUFDckYscUZBQXFGO1FBQ3JGLDJGQUEyRjtRQUMzRiwyRkFBMkY7UUFDM0YsNEZBQTRGO1FBQzVGLE9BQU8sZ0JBQWdCLEtBQUssSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxlQUFlLENBQUMsT0FBb0IsRUFBRSxLQUFnQjtRQUNwRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBRTVDLElBQ0UsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUM1QixLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqQiwyRkFBMkY7Z0JBQzNGLHlGQUF5RjtnQkFDekYsdUZBQXVGO2dCQUN2RixnRkFBZ0Y7Z0JBQ2hGLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEYsQ0FBQyxDQUFDLEVBQ0YsQ0FBQztZQUNELGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQztnQkFDekIsU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLEtBQUs7YUFDTixDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxPQUFvQjtRQUNqQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHFCQUFxQjtRQUMzQixJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQjthQUN0RCxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQy9CLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUN0QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRW5FLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqRixDQUFDO1lBQ0gsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxjQUFjO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM1QixNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsQ0FBQztJQUVELG1FQUFtRTtJQUMzRCx3QkFBd0I7UUFDOUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWE7YUFDcEMsc0JBQXNCLEVBQUU7YUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7Q0FDRjtBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLDBCQUEwQixDQUFDLFVBQW1CLEVBQUUsUUFBZ0I7SUFDdkUsTUFBTSxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ3pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRywwQkFBMEIsQ0FBQztJQUV2RCxJQUFJLFFBQVEsSUFBSSxHQUFHLEdBQUcsVUFBVSxJQUFJLFFBQVEsSUFBSSxHQUFHLEdBQUcsVUFBVSxFQUFFLENBQUM7UUFDakUsT0FBTywyQkFBMkIsQ0FBQyxFQUFFLENBQUM7SUFDeEMsQ0FBQztTQUFNLElBQUksUUFBUSxJQUFJLE1BQU0sR0FBRyxVQUFVLElBQUksUUFBUSxJQUFJLE1BQU0sR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUM5RSxPQUFPLDJCQUEyQixDQUFDLElBQUksQ0FBQztJQUMxQyxDQUFDO0lBRUQsT0FBTywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7QUFDMUMsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLDRCQUE0QixDQUFDLFVBQW1CLEVBQUUsUUFBZ0I7SUFDekUsTUFBTSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ3hDLE1BQU0sVUFBVSxHQUFHLEtBQUssR0FBRywwQkFBMEIsQ0FBQztJQUV0RCxJQUFJLFFBQVEsSUFBSSxJQUFJLEdBQUcsVUFBVSxJQUFJLFFBQVEsSUFBSSxJQUFJLEdBQUcsVUFBVSxFQUFFLENBQUM7UUFDbkUsT0FBTyw2QkFBNkIsQ0FBQyxJQUFJLENBQUM7SUFDNUMsQ0FBQztTQUFNLElBQUksUUFBUSxJQUFJLEtBQUssR0FBRyxVQUFVLElBQUksUUFBUSxJQUFJLEtBQUssR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUM1RSxPQUFPLDZCQUE2QixDQUFDLEtBQUssQ0FBQztJQUM3QyxDQUFDO0lBRUQsT0FBTyw2QkFBNkIsQ0FBQyxJQUFJLENBQUM7QUFDNUMsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUywwQkFBMEIsQ0FDakMsT0FBb0IsRUFDcEIsVUFBbUIsRUFDbkIsU0FBb0IsRUFDcEIsUUFBZ0IsRUFDaEIsUUFBZ0I7SUFFaEIsTUFBTSxnQkFBZ0IsR0FBRywwQkFBMEIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUUsTUFBTSxrQkFBa0IsR0FBRyw0QkFBNEIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUUsSUFBSSx1QkFBdUIsR0FBRywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7SUFDL0QsSUFBSSx5QkFBeUIsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUM7SUFFbkUsOEZBQThGO0lBQzlGLDhGQUE4RjtJQUM5Riw2RkFBNkY7SUFDN0YsOEZBQThGO0lBQzlGLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztRQUNyQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBRXBDLElBQUksZ0JBQWdCLEtBQUssMkJBQTJCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDeEQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLHVCQUF1QixHQUFHLDJCQUEyQixDQUFDLEVBQUUsQ0FBQztZQUMzRCxDQUFDO1FBQ0gsQ0FBQzthQUFNLElBQUksT0FBTyxDQUFDLFlBQVksR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25FLHVCQUF1QixHQUFHLDJCQUEyQixDQUFDLElBQUksQ0FBQztRQUM3RCxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUN2QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBRXRDLElBQUksU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3hCLElBQUksa0JBQWtCLEtBQUssNkJBQTZCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9ELHNEQUFzRDtnQkFDdEQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ25CLHlCQUF5QixHQUFHLDZCQUE2QixDQUFDLEtBQUssQ0FBQztnQkFDbEUsQ0FBQztZQUNILENBQUM7aUJBQU0sSUFBSSxPQUFPLENBQUMsV0FBVyxHQUFHLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2xFLHlCQUF5QixHQUFHLDZCQUE2QixDQUFDLElBQUksQ0FBQztZQUNqRSxDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLGtCQUFrQixLQUFLLDZCQUE2QixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM5RCxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDbkIseUJBQXlCLEdBQUcsNkJBQTZCLENBQUMsSUFBSSxDQUFDO2dCQUNqRSxDQUFDO1lBQ0gsQ0FBQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEUseUJBQXlCLEdBQUcsNkJBQTZCLENBQUMsS0FBSyxDQUFDO1lBQ2xFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbGVtZW50UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Y29lcmNlRWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge19nZXRTaGFkb3dSb290fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb24sIGludGVydmFsLCBhbmltYXRpb25GcmFtZVNjaGVkdWxlcn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtEcmFnRHJvcFJlZ2lzdHJ5fSBmcm9tICcuL2RyYWctZHJvcC1yZWdpc3RyeSc7XG5pbXBvcnQgdHlwZSB7RHJhZ1JlZiwgUG9pbnR9IGZyb20gJy4vZHJhZy1yZWYnO1xuaW1wb3J0IHtpc1BvaW50ZXJOZWFyRG9tUmVjdCwgaXNJbnNpZGVDbGllbnRSZWN0fSBmcm9tICcuL2RvbS9kb20tcmVjdCc7XG5pbXBvcnQge1BhcmVudFBvc2l0aW9uVHJhY2tlcn0gZnJvbSAnLi9kb20vcGFyZW50LXBvc2l0aW9uLXRyYWNrZXInO1xuaW1wb3J0IHtEcmFnQ1NTU3R5bGVEZWNsYXJhdGlvbn0gZnJvbSAnLi9kb20vc3R5bGluZyc7XG5pbXBvcnQge0Ryb3BMaXN0U29ydFN0cmF0ZWd5fSBmcm9tICcuL3NvcnRpbmcvZHJvcC1saXN0LXNvcnQtc3RyYXRlZ3knO1xuaW1wb3J0IHtTaW5nbGVBeGlzU29ydFN0cmF0ZWd5fSBmcm9tICcuL3NvcnRpbmcvc2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneSc7XG5pbXBvcnQge01peGVkU29ydFN0cmF0ZWd5fSBmcm9tICcuL3NvcnRpbmcvbWl4ZWQtc29ydC1zdHJhdGVneSc7XG5pbXBvcnQge0Ryb3BMaXN0T3JpZW50YXRpb259IGZyb20gJy4vZGlyZWN0aXZlcy9jb25maWcnO1xuXG4vKipcbiAqIFByb3hpbWl0eSwgYXMgYSByYXRpbyB0byB3aWR0aC9oZWlnaHQsIGF0IHdoaWNoIGFcbiAqIGRyYWdnZWQgaXRlbSB3aWxsIGFmZmVjdCB0aGUgZHJvcCBjb250YWluZXIuXG4gKi9cbmNvbnN0IERST1BfUFJPWElNSVRZX1RIUkVTSE9MRCA9IDAuMDU7XG5cbi8qKlxuICogUHJveGltaXR5LCBhcyBhIHJhdGlvIHRvIHdpZHRoL2hlaWdodCBhdCB3aGljaCB0byBzdGFydCBhdXRvLXNjcm9sbGluZyB0aGUgZHJvcCBsaXN0IG9yIHRoZVxuICogdmlld3BvcnQuIFRoZSB2YWx1ZSBjb21lcyBmcm9tIHRyeWluZyBpdCBvdXQgbWFudWFsbHkgdW50aWwgaXQgZmVlbHMgcmlnaHQuXG4gKi9cbmNvbnN0IFNDUk9MTF9QUk9YSU1JVFlfVEhSRVNIT0xEID0gMC4wNTtcblxuLyoqIFZlcnRpY2FsIGRpcmVjdGlvbiBpbiB3aGljaCB3ZSBjYW4gYXV0by1zY3JvbGwuICovXG5lbnVtIEF1dG9TY3JvbGxWZXJ0aWNhbERpcmVjdGlvbiB7XG4gIE5PTkUsXG4gIFVQLFxuICBET1dOLFxufVxuXG4vKiogSG9yaXpvbnRhbCBkaXJlY3Rpb24gaW4gd2hpY2ggd2UgY2FuIGF1dG8tc2Nyb2xsLiAqL1xuZW51bSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbiB7XG4gIE5PTkUsXG4gIExFRlQsXG4gIFJJR0hULFxufVxuXG4vKipcbiAqIFJlZmVyZW5jZSB0byBhIGRyb3AgbGlzdC4gVXNlZCB0byBtYW5pcHVsYXRlIG9yIGRpc3Bvc2Ugb2YgdGhlIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNsYXNzIERyb3BMaXN0UmVmPFQgPSBhbnk+IHtcbiAgLyoqIEVsZW1lbnQgdGhhdCB0aGUgZHJvcCBsaXN0IGlzIGF0dGFjaGVkIHRvLiAqL1xuICBlbGVtZW50OiBIVE1MRWxlbWVudCB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuXG4gIC8qKiBXaGV0aGVyIHN0YXJ0aW5nIGEgZHJhZ2dpbmcgc2VxdWVuY2UgZnJvbSB0aGlzIGNvbnRhaW5lciBpcyBkaXNhYmxlZC4gKi9cbiAgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciBzb3J0aW5nIGl0ZW1zIHdpdGhpbiB0aGUgbGlzdCBpcyBkaXNhYmxlZC4gKi9cbiAgc29ydGluZ0Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIExvY2tzIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZ2dhYmxlIGVsZW1lbnRzIGluc2lkZSB0aGUgY29udGFpbmVyIGFsb25nIHRoZSBzcGVjaWZpZWQgYXhpcy4gKi9cbiAgbG9ja0F4aXM6ICd4JyB8ICd5JztcblxuICAvKipcbiAgICogV2hldGhlciBhdXRvLXNjcm9sbGluZyB0aGUgdmlldyB3aGVuIHRoZSB1c2VyXG4gICAqIG1vdmVzIHRoZWlyIHBvaW50ZXIgY2xvc2UgdG8gdGhlIGVkZ2VzIGlzIGRpc2FibGVkLlxuICAgKi9cbiAgYXV0b1Njcm9sbERpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIE51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIGZvciBlYWNoIGZyYW1lIHdoZW4gYXV0by1zY3JvbGxpbmcgYW4gZWxlbWVudC4gKi9cbiAgYXV0b1Njcm9sbFN0ZXA6IG51bWJlciA9IDI7XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBhbiBpdGVtXG4gICAqIGlzIGFsbG93ZWQgdG8gYmUgbW92ZWQgaW50byBhIGRyb3AgY29udGFpbmVyLlxuICAgKi9cbiAgZW50ZXJQcmVkaWNhdGU6IChkcmFnOiBEcmFnUmVmLCBkcm9wOiBEcm9wTGlzdFJlZikgPT4gYm9vbGVhbiA9ICgpID0+IHRydWU7XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBhbiBpdGVtIGNhbiBiZSBzb3J0ZWQgaW50byBhIHBhcnRpY3VsYXIgaW5kZXguICovXG4gIHNvcnRQcmVkaWNhdGU6IChpbmRleDogbnVtYmVyLCBkcmFnOiBEcmFnUmVmLCBkcm9wOiBEcm9wTGlzdFJlZikgPT4gYm9vbGVhbiA9ICgpID0+IHRydWU7XG5cbiAgLyoqIEVtaXRzIHJpZ2h0IGJlZm9yZSBkcmFnZ2luZyBoYXMgc3RhcnRlZC4gKi9cbiAgcmVhZG9ubHkgYmVmb3JlU3RhcnRlZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIHVzZXIgaGFzIG1vdmVkIGEgbmV3IGRyYWcgaXRlbSBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKi9cbiAgcmVhZG9ubHkgZW50ZXJlZCA9IG5ldyBTdWJqZWN0PHtpdGVtOiBEcmFnUmVmOyBjb250YWluZXI6IERyb3BMaXN0UmVmOyBjdXJyZW50SW5kZXg6IG51bWJlcn0+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIHVzZXIgcmVtb3ZlcyBhbiBpdGVtIGZyb20gdGhlIGNvbnRhaW5lclxuICAgKiBieSBkcmFnZ2luZyBpdCBpbnRvIGFub3RoZXIgY29udGFpbmVyLlxuICAgKi9cbiAgcmVhZG9ubHkgZXhpdGVkID0gbmV3IFN1YmplY3Q8e2l0ZW06IERyYWdSZWY7IGNvbnRhaW5lcjogRHJvcExpc3RSZWZ9PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGRyb3BzIGFuIGl0ZW0gaW5zaWRlIHRoZSBjb250YWluZXIuICovXG4gIHJlYWRvbmx5IGRyb3BwZWQgPSBuZXcgU3ViamVjdDx7XG4gICAgaXRlbTogRHJhZ1JlZjtcbiAgICBjdXJyZW50SW5kZXg6IG51bWJlcjtcbiAgICBwcmV2aW91c0luZGV4OiBudW1iZXI7XG4gICAgY29udGFpbmVyOiBEcm9wTGlzdFJlZjtcbiAgICBwcmV2aW91c0NvbnRhaW5lcjogRHJvcExpc3RSZWY7XG4gICAgaXNQb2ludGVyT3ZlckNvbnRhaW5lcjogYm9vbGVhbjtcbiAgICBkaXN0YW5jZTogUG9pbnQ7XG4gICAgZHJvcFBvaW50OiBQb2ludDtcbiAgICBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQ7XG4gIH0+KCk7XG5cbiAgLyoqIEVtaXRzIGFzIHRoZSB1c2VyIGlzIHN3YXBwaW5nIGl0ZW1zIHdoaWxlIGFjdGl2ZWx5IGRyYWdnaW5nLiAqL1xuICByZWFkb25seSBzb3J0ZWQgPSBuZXcgU3ViamVjdDx7XG4gICAgcHJldmlvdXNJbmRleDogbnVtYmVyO1xuICAgIGN1cnJlbnRJbmRleDogbnVtYmVyO1xuICAgIGNvbnRhaW5lcjogRHJvcExpc3RSZWY7XG4gICAgaXRlbTogRHJhZ1JlZjtcbiAgfT4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhIGRyYWdnaW5nIHNlcXVlbmNlIGlzIHN0YXJ0ZWQgaW4gYSBsaXN0IGNvbm5lY3RlZCB0byB0aGUgY3VycmVudCBvbmUuICovXG4gIHJlYWRvbmx5IHJlY2VpdmluZ1N0YXJ0ZWQgPSBuZXcgU3ViamVjdDx7XG4gICAgcmVjZWl2ZXI6IERyb3BMaXN0UmVmO1xuICAgIGluaXRpYXRvcjogRHJvcExpc3RSZWY7XG4gICAgaXRlbXM6IERyYWdSZWZbXTtcbiAgfT4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhIGRyYWdnaW5nIHNlcXVlbmNlIGlzIHN0b3BwZWQgZnJvbSBhIGxpc3QgY29ubmVjdGVkIHRvIHRoZSBjdXJyZW50IG9uZS4gKi9cbiAgcmVhZG9ubHkgcmVjZWl2aW5nU3RvcHBlZCA9IG5ldyBTdWJqZWN0PHtcbiAgICByZWNlaXZlcjogRHJvcExpc3RSZWY7XG4gICAgaW5pdGlhdG9yOiBEcm9wTGlzdFJlZjtcbiAgfT4oKTtcblxuICAvKiogQXJiaXRyYXJ5IGRhdGEgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIGRyb3AgbGlzdC4gKi9cbiAgZGF0YTogVDtcblxuICAvKiogRWxlbWVudCB0aGF0IGlzIHRoZSBkaXJlY3QgcGFyZW50IG9mIHRoZSBkcmFnIGl0ZW1zLiAqL1xuICBwcml2YXRlIF9jb250YWluZXI6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBXaGV0aGVyIGFuIGl0ZW0gaW4gdGhlIGxpc3QgaXMgYmVpbmcgZHJhZ2dlZC4gKi9cbiAgcHJpdmF0ZSBfaXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgcG9zaXRpb25zIG9mIGFueSBwYXJlbnQgc2Nyb2xsYWJsZSBlbGVtZW50cy4gKi9cbiAgcHJpdmF0ZSBfcGFyZW50UG9zaXRpb25zOiBQYXJlbnRQb3NpdGlvblRyYWNrZXI7XG5cbiAgLyoqIFN0cmF0ZWd5IGJlaW5nIHVzZWQgdG8gc29ydCBpdGVtcyB3aXRoaW4gdGhlIGxpc3QuICovXG4gIHByaXZhdGUgX3NvcnRTdHJhdGVneTogRHJvcExpc3RTb3J0U3RyYXRlZ3k7XG5cbiAgLyoqIENhY2hlZCBgRE9NUmVjdGAgb2YgdGhlIGRyb3AgbGlzdC4gKi9cbiAgcHJpdmF0ZSBfZG9tUmVjdDogRE9NUmVjdCB8IHVuZGVmaW5lZDtcblxuICAvKiogRHJhZ2dhYmxlIGl0ZW1zIGluIHRoZSBjb250YWluZXIuICovXG4gIHByaXZhdGUgX2RyYWdnYWJsZXM6IHJlYWRvbmx5IERyYWdSZWZbXSA9IFtdO1xuXG4gIC8qKiBEcm9wIGxpc3RzIHRoYXQgYXJlIGNvbm5lY3RlZCB0byB0aGUgY3VycmVudCBvbmUuICovXG4gIHByaXZhdGUgX3NpYmxpbmdzOiByZWFkb25seSBEcm9wTGlzdFJlZltdID0gW107XG5cbiAgLyoqIENvbm5lY3RlZCBzaWJsaW5ncyB0aGF0IGN1cnJlbnRseSBoYXZlIGEgZHJhZ2dlZCBpdGVtLiAqL1xuICBwcml2YXRlIF9hY3RpdmVTaWJsaW5ncyA9IG5ldyBTZXQ8RHJvcExpc3RSZWY+KCk7XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0aGUgd2luZG93IGJlaW5nIHNjcm9sbGVkLiAqL1xuICBwcml2YXRlIF92aWV3cG9ydFNjcm9sbFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogVmVydGljYWwgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBsaXN0IGlzIGN1cnJlbnRseSBzY3JvbGxpbmcuICovXG4gIHByaXZhdGUgX3ZlcnRpY2FsU2Nyb2xsRGlyZWN0aW9uID0gQXV0b1Njcm9sbFZlcnRpY2FsRGlyZWN0aW9uLk5PTkU7XG5cbiAgLyoqIEhvcml6b250YWwgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBsaXN0IGlzIGN1cnJlbnRseSBzY3JvbGxpbmcuICovXG4gIHByaXZhdGUgX2hvcml6b250YWxTY3JvbGxEaXJlY3Rpb24gPSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5OT05FO1xuXG4gIC8qKiBOb2RlIHRoYXQgaXMgYmVpbmcgYXV0by1zY3JvbGxlZC4gKi9cbiAgcHJpdmF0ZSBfc2Nyb2xsTm9kZTogSFRNTEVsZW1lbnQgfCBXaW5kb3c7XG5cbiAgLyoqIFVzZWQgdG8gc2lnbmFsIHRvIHRoZSBjdXJyZW50IGF1dG8tc2Nyb2xsIHNlcXVlbmNlIHdoZW4gdG8gc3RvcC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc3RvcFNjcm9sbFRpbWVycyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFNoYWRvdyByb290IG9mIHRoZSBjdXJyZW50IGVsZW1lbnQuIE5lY2Vzc2FyeSBmb3IgYGVsZW1lbnRGcm9tUG9pbnRgIHRvIHJlc29sdmUgY29ycmVjdGx5LiAqL1xuICBwcml2YXRlIF9jYWNoZWRTaGFkb3dSb290OiBEb2N1bWVudE9yU2hhZG93Um9vdCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRvY3VtZW50LiAqL1xuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIEVsZW1lbnRzIHRoYXQgY2FuIGJlIHNjcm9sbGVkIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nLiAqL1xuICBwcml2YXRlIF9zY3JvbGxhYmxlRWxlbWVudHM6IEhUTUxFbGVtZW50W10gPSBbXTtcblxuICAvKiogSW5pdGlhbCB2YWx1ZSBmb3IgdGhlIGVsZW1lbnQncyBgc2Nyb2xsLXNuYXAtdHlwZWAgc3R5bGUuICovXG4gIHByaXZhdGUgX2luaXRpYWxTY3JvbGxTbmFwOiBzdHJpbmc7XG5cbiAgLyoqIERpcmVjdGlvbiBvZiB0aGUgbGlzdCdzIGxheW91dC4gKi9cbiAgcHJpdmF0ZSBfZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSAnbHRyJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50LFxuICAgIHByaXZhdGUgX2RyYWdEcm9wUmVnaXN0cnk6IERyYWdEcm9wUmVnaXN0cnksXG4gICAgX2RvY3VtZW50OiBhbnksXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcbiAgKSB7XG4gICAgY29uc3QgY29lcmNlZEVsZW1lbnQgPSAodGhpcy5lbGVtZW50ID0gY29lcmNlRWxlbWVudChlbGVtZW50KSk7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gICAgdGhpcy53aXRoT3JpZW50YXRpb24oJ3ZlcnRpY2FsJykud2l0aEVsZW1lbnRDb250YWluZXIoY29lcmNlZEVsZW1lbnQpO1xuICAgIF9kcmFnRHJvcFJlZ2lzdHJ5LnJlZ2lzdGVyRHJvcENvbnRhaW5lcih0aGlzKTtcbiAgICB0aGlzLl9wYXJlbnRQb3NpdGlvbnMgPSBuZXcgUGFyZW50UG9zaXRpb25UcmFja2VyKF9kb2N1bWVudCk7XG4gIH1cblxuICAvKiogUmVtb3ZlcyB0aGUgZHJvcCBsaXN0IGZ1bmN0aW9uYWxpdHkgZnJvbSB0aGUgRE9NIGVsZW1lbnQuICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fc3RvcFNjcm9sbGluZygpO1xuICAgIHRoaXMuX3N0b3BTY3JvbGxUaW1lcnMuY29tcGxldGUoKTtcbiAgICB0aGlzLl92aWV3cG9ydFNjcm9sbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuYmVmb3JlU3RhcnRlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuZW50ZXJlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuZXhpdGVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5kcm9wcGVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5zb3J0ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnJlY2VpdmluZ1N0YXJ0ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnJlY2VpdmluZ1N0b3BwZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLl9hY3RpdmVTaWJsaW5ncy5jbGVhcigpO1xuICAgIHRoaXMuX3Njcm9sbE5vZGUgPSBudWxsITtcbiAgICB0aGlzLl9wYXJlbnRQb3NpdGlvbnMuY2xlYXIoKTtcbiAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnJlbW92ZURyb3BDb250YWluZXIodGhpcyk7XG4gIH1cblxuICAvKiogV2hldGhlciBhbiBpdGVtIGZyb20gdGhpcyBsaXN0IGlzIGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLiAqL1xuICBpc0RyYWdnaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0RyYWdnaW5nO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyBkcmFnZ2luZyBhbiBpdGVtLiAqL1xuICBzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kcmFnZ2luZ1N0YXJ0ZWQoKTtcbiAgICB0aGlzLl9ub3RpZnlSZWNlaXZpbmdTaWJsaW5ncygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIG1vdmUgYW4gaXRlbSBpbnRvIHRoZSBjb250YWluZXIuXG4gICAqIEBwYXJhbSBpdGVtIEl0ZW0gdGhhdCB3YXMgbW92ZWQgaW50byB0aGUgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9pbnRlclggUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJZIFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqIEBwYXJhbSBpbmRleCBJbmRleCBhdCB3aGljaCB0aGUgaXRlbSBlbnRlcmVkLiBJZiBvbWl0dGVkLCB0aGUgY29udGFpbmVyIHdpbGwgdHJ5IHRvIGZpZ3VyZSBpdFxuICAgKiAgIG91dCBhdXRvbWF0aWNhbGx5LlxuICAgKi9cbiAgZW50ZXIoaXRlbTogRHJhZ1JlZiwgcG9pbnRlclg6IG51bWJlciwgcG9pbnRlclk6IG51bWJlciwgaW5kZXg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9kcmFnZ2luZ1N0YXJ0ZWQoKTtcblxuICAgIC8vIElmIHNvcnRpbmcgaXMgZGlzYWJsZWQsIHdlIHdhbnQgdGhlIGl0ZW0gdG8gcmV0dXJuIHRvIGl0cyBzdGFydGluZ1xuICAgIC8vIHBvc2l0aW9uIGlmIHRoZSB1c2VyIGlzIHJldHVybmluZyBpdCB0byBpdHMgaW5pdGlhbCBjb250YWluZXIuXG4gICAgaWYgKGluZGV4ID09IG51bGwgJiYgdGhpcy5zb3J0aW5nRGlzYWJsZWQpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5fZHJhZ2dhYmxlcy5pbmRleE9mKGl0ZW0pO1xuICAgIH1cblxuICAgIHRoaXMuX3NvcnRTdHJhdGVneS5lbnRlcihpdGVtLCBwb2ludGVyWCwgcG9pbnRlclksIGluZGV4KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIHVzdWFsbHkgaGFwcGVucyBpbnNpZGUgYF9kcmFnZ2luZ1N0YXJ0ZWRgIGFzIHdlbGwsIGJ1dCB0aGUgZGltZW5zaW9uc1xuICAgIC8vIGNhbiBjaGFuZ2Ugd2hlbiB0aGUgc29ydCBzdHJhdGVneSBtb3ZlcyB0aGUgaXRlbSBhcm91bmQgaW5zaWRlIGBlbnRlcmAuXG4gICAgdGhpcy5fY2FjaGVQYXJlbnRQb3NpdGlvbnMoKTtcblxuICAgIC8vIE5vdGlmeSBzaWJsaW5ncyBhdCB0aGUgZW5kIHNvIHRoYXQgdGhlIGl0ZW0gaGFzIGJlZW4gaW5zZXJ0ZWQgaW50byB0aGUgYGFjdGl2ZURyYWdnYWJsZXNgLlxuICAgIHRoaXMuX25vdGlmeVJlY2VpdmluZ1NpYmxpbmdzKCk7XG4gICAgdGhpcy5lbnRlcmVkLm5leHQoe2l0ZW0sIGNvbnRhaW5lcjogdGhpcywgY3VycmVudEluZGV4OiB0aGlzLmdldEl0ZW1JbmRleChpdGVtKX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gaXRlbSBmcm9tIHRoZSBjb250YWluZXIgYWZ0ZXIgaXQgd2FzIGRyYWdnZWQgaW50byBhbm90aGVyIGNvbnRhaW5lciBieSB0aGUgdXNlci5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0aGF0IHdhcyBkcmFnZ2VkIG91dC5cbiAgICovXG4gIGV4aXQoaXRlbTogRHJhZ1JlZik6IHZvaWQge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgdGhpcy5leGl0ZWQubmV4dCh7aXRlbSwgY29udGFpbmVyOiB0aGlzfSk7XG4gIH1cblxuICAvKipcbiAgICogRHJvcHMgYW4gaXRlbSBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIGJlaW5nIGRyb3BwZWQgaW50byB0aGUgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gY3VycmVudEluZGV4IEluZGV4IGF0IHdoaWNoIHRoZSBpdGVtIHNob3VsZCBiZSBpbnNlcnRlZC5cbiAgICogQHBhcmFtIHByZXZpb3VzSW5kZXggSW5kZXggb2YgdGhlIGl0ZW0gd2hlbiBkcmFnZ2luZyBzdGFydGVkLlxuICAgKiBAcGFyYW0gcHJldmlvdXNDb250YWluZXIgQ29udGFpbmVyIGZyb20gd2hpY2ggdGhlIGl0ZW0gZ290IGRyYWdnZWQgaW4uXG4gICAqIEBwYXJhbSBpc1BvaW50ZXJPdmVyQ29udGFpbmVyIFdoZXRoZXIgdGhlIHVzZXIncyBwb2ludGVyIHdhcyBvdmVyIHRoZVxuICAgKiAgICBjb250YWluZXIgd2hlbiB0aGUgaXRlbSB3YXMgZHJvcHBlZC5cbiAgICogQHBhcmFtIGRpc3RhbmNlIERpc3RhbmNlIHRoZSB1c2VyIGhhcyBkcmFnZ2VkIHNpbmNlIHRoZSBzdGFydCBvZiB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UuXG4gICAqIEBwYXJhbSBldmVudCBFdmVudCB0aGF0IHRyaWdnZXJlZCB0aGUgZHJvcHBpbmcgc2VxdWVuY2UuXG4gICAqXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTUuMC4wIGBwcmV2aW91c0luZGV4YCBhbmQgYGV2ZW50YCBwYXJhbWV0ZXJzIHRvIGJlY29tZSByZXF1aXJlZC5cbiAgICovXG4gIGRyb3AoXG4gICAgaXRlbTogRHJhZ1JlZixcbiAgICBjdXJyZW50SW5kZXg6IG51bWJlcixcbiAgICBwcmV2aW91c0luZGV4OiBudW1iZXIsXG4gICAgcHJldmlvdXNDb250YWluZXI6IERyb3BMaXN0UmVmLFxuICAgIGlzUG9pbnRlck92ZXJDb250YWluZXI6IGJvb2xlYW4sXG4gICAgZGlzdGFuY2U6IFBvaW50LFxuICAgIGRyb3BQb2ludDogUG9pbnQsXG4gICAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50ID0ge30gYXMgYW55LFxuICApOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNldCgpO1xuICAgIHRoaXMuZHJvcHBlZC5uZXh0KHtcbiAgICAgIGl0ZW0sXG4gICAgICBjdXJyZW50SW5kZXgsXG4gICAgICBwcmV2aW91c0luZGV4LFxuICAgICAgY29udGFpbmVyOiB0aGlzLFxuICAgICAgcHJldmlvdXNDb250YWluZXIsXG4gICAgICBpc1BvaW50ZXJPdmVyQ29udGFpbmVyLFxuICAgICAgZGlzdGFuY2UsXG4gICAgICBkcm9wUG9pbnQsXG4gICAgICBldmVudCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkcmFnZ2FibGUgaXRlbXMgdGhhdCBhcmUgYSBwYXJ0IG9mIHRoaXMgbGlzdC5cbiAgICogQHBhcmFtIGl0ZW1zIEl0ZW1zIHRoYXQgYXJlIGEgcGFydCBvZiB0aGlzIGxpc3QuXG4gICAqL1xuICB3aXRoSXRlbXMoaXRlbXM6IERyYWdSZWZbXSk6IHRoaXMge1xuICAgIGNvbnN0IHByZXZpb3VzSXRlbXMgPSB0aGlzLl9kcmFnZ2FibGVzO1xuICAgIHRoaXMuX2RyYWdnYWJsZXMgPSBpdGVtcztcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5fd2l0aERyb3BDb250YWluZXIodGhpcykpO1xuXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZygpKSB7XG4gICAgICBjb25zdCBkcmFnZ2VkSXRlbXMgPSBwcmV2aW91c0l0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0uaXNEcmFnZ2luZygpKTtcblxuICAgICAgLy8gSWYgYWxsIG9mIHRoZSBpdGVtcyBiZWluZyBkcmFnZ2VkIHdlcmUgcmVtb3ZlZFxuICAgICAgLy8gZnJvbSB0aGUgbGlzdCwgYWJvcnQgdGhlIGN1cnJlbnQgZHJhZyBzZXF1ZW5jZS5cbiAgICAgIGlmIChkcmFnZ2VkSXRlbXMuZXZlcnkoaXRlbSA9PiBpdGVtcy5pbmRleE9mKGl0ZW0pID09PSAtMSkpIHtcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NvcnRTdHJhdGVneS53aXRoSXRlbXModGhpcy5fZHJhZ2dhYmxlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgbGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgZHJvcCBsaXN0LiAqL1xuICB3aXRoRGlyZWN0aW9uKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogdGhpcyB7XG4gICAgdGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIGlmICh0aGlzLl9zb3J0U3RyYXRlZ3kgaW5zdGFuY2VvZiBTaW5nbGVBeGlzU29ydFN0cmF0ZWd5KSB7XG4gICAgICB0aGlzLl9zb3J0U3RyYXRlZ3kuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb250YWluZXJzIHRoYXQgYXJlIGNvbm5lY3RlZCB0byB0aGlzIG9uZS4gV2hlbiB0d28gb3IgbW9yZSBjb250YWluZXJzIGFyZVxuICAgKiBjb25uZWN0ZWQsIHRoZSB1c2VyIHdpbGwgYmUgYWxsb3dlZCB0byB0cmFuc2ZlciBpdGVtcyBiZXR3ZWVuIHRoZW0uXG4gICAqIEBwYXJhbSBjb25uZWN0ZWRUbyBPdGhlciBjb250YWluZXJzIHRoYXQgdGhlIGN1cnJlbnQgY29udGFpbmVycyBzaG91bGQgYmUgY29ubmVjdGVkIHRvLlxuICAgKi9cbiAgY29ubmVjdGVkVG8oY29ubmVjdGVkVG86IERyb3BMaXN0UmVmW10pOiB0aGlzIHtcbiAgICB0aGlzLl9zaWJsaW5ncyA9IGNvbm5lY3RlZFRvLnNsaWNlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIG9yaWVudGF0aW9uIE5ldyBvcmllbnRhdGlvbiBmb3IgdGhlIGNvbnRhaW5lci5cbiAgICovXG4gIHdpdGhPcmllbnRhdGlvbihvcmllbnRhdGlvbjogRHJvcExpc3RPcmllbnRhdGlvbik6IHRoaXMge1xuICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ21peGVkJykge1xuICAgICAgdGhpcy5fc29ydFN0cmF0ZWd5ID0gbmV3IE1peGVkU29ydFN0cmF0ZWd5KHRoaXMuX2RvY3VtZW50LCB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3RyYXRlZ3kgPSBuZXcgU2luZ2xlQXhpc1NvcnRTdHJhdGVneSh0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5KTtcbiAgICAgIHN0cmF0ZWd5LmRpcmVjdGlvbiA9IHRoaXMuX2RpcmVjdGlvbjtcbiAgICAgIHN0cmF0ZWd5Lm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gICAgICB0aGlzLl9zb3J0U3RyYXRlZ3kgPSBzdHJhdGVneTtcbiAgICB9XG4gICAgdGhpcy5fc29ydFN0cmF0ZWd5LndpdGhFbGVtZW50Q29udGFpbmVyKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fc29ydFN0cmF0ZWd5LndpdGhTb3J0UHJlZGljYXRlKChpbmRleCwgaXRlbSkgPT4gdGhpcy5zb3J0UHJlZGljYXRlKGluZGV4LCBpdGVtLCB0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGljaCBwYXJlbnQgZWxlbWVudHMgYXJlIGNhbiBiZSBzY3JvbGxlZCB3aGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZy5cbiAgICogQHBhcmFtIGVsZW1lbnRzIEVsZW1lbnRzIHRoYXQgY2FuIGJlIHNjcm9sbGVkLlxuICAgKi9cbiAgd2l0aFNjcm9sbGFibGVQYXJlbnRzKGVsZW1lbnRzOiBIVE1MRWxlbWVudFtdKTogdGhpcyB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2NvbnRhaW5lcjtcblxuICAgIC8vIFdlIGFsd2F5cyBhbGxvdyB0aGUgY3VycmVudCBlbGVtZW50IHRvIGJlIHNjcm9sbGFibGVcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0IGl0J3MgaW4gdGhlIGFycmF5LlxuICAgIHRoaXMuX3Njcm9sbGFibGVFbGVtZW50cyA9XG4gICAgICBlbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpID09PSAtMSA/IFtlbGVtZW50LCAuLi5lbGVtZW50c10gOiBlbGVtZW50cy5zbGljZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGRyb3AgbGlzdCBzbyB0aGF0IGEgZGlmZmVyZW50IGVsZW1lbnQgaXMgdXNlZCBhcyB0aGUgY29udGFpbmVyIGZvciB0aGVcbiAgICogZHJhZ2dlZCBpdGVtcy4gVGhpcyBpcyB1c2VmdWwgZm9yIHRoZSBjYXNlcyB3aGVuIG9uZSBtaWdodCBub3QgaGF2ZSBjb250cm9sIG92ZXIgdGhlXG4gICAqIGZ1bGwgRE9NIHRoYXQgc2V0cyB1cCB0aGUgZHJhZ2dpbmcuXG4gICAqIE5vdGUgdGhhdCB0aGUgYWx0ZXJuYXRlIGNvbnRhaW5lciBuZWVkcyB0byBiZSBhIGRlc2NlbmRhbnQgb2YgdGhlIGRyb3AgbGlzdC5cbiAgICogQHBhcmFtIGNvbnRhaW5lciBOZXcgZWxlbWVudCBjb250YWluZXIgdG8gYmUgYXNzaWduZWQuXG4gICAqL1xuICB3aXRoRWxlbWVudENvbnRhaW5lcihjb250YWluZXI6IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgaWYgKGNvbnRhaW5lciA9PT0gdGhpcy5fY29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgaWYgKFxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgIGNvbnRhaW5lciAhPT0gZWxlbWVudCAmJlxuICAgICAgIWVsZW1lbnQuY29udGFpbnMoY29udGFpbmVyKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSW52YWxpZCBET00gc3RydWN0dXJlIGZvciBkcm9wIGxpc3QuIEFsdGVybmF0ZSBjb250YWluZXIgZWxlbWVudCBtdXN0IGJlIGEgZGVzY2VuZGFudCBvZiB0aGUgZHJvcCBsaXN0LicsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZENvbnRhaW5lckluZGV4ID0gdGhpcy5fc2Nyb2xsYWJsZUVsZW1lbnRzLmluZGV4T2YodGhpcy5fY29udGFpbmVyKTtcbiAgICBjb25zdCBuZXdDb250YWluZXJJbmRleCA9IHRoaXMuX3Njcm9sbGFibGVFbGVtZW50cy5pbmRleE9mKGNvbnRhaW5lcik7XG5cbiAgICBpZiAob2xkQ29udGFpbmVySW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5fc2Nyb2xsYWJsZUVsZW1lbnRzLnNwbGljZShvbGRDb250YWluZXJJbmRleCwgMSk7XG4gICAgfVxuXG4gICAgaWYgKG5ld0NvbnRhaW5lckluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMuX3Njcm9sbGFibGVFbGVtZW50cy5zcGxpY2UobmV3Q29udGFpbmVySW5kZXgsIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zb3J0U3RyYXRlZ3kpIHtcbiAgICAgIHRoaXMuX3NvcnRTdHJhdGVneS53aXRoRWxlbWVudENvbnRhaW5lcihjb250YWluZXIpO1xuICAgIH1cblxuICAgIHRoaXMuX2NhY2hlZFNoYWRvd1Jvb3QgPSBudWxsO1xuICAgIHRoaXMuX3Njcm9sbGFibGVFbGVtZW50cy51bnNoaWZ0KGNvbnRhaW5lcik7XG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNjcm9sbGFibGUgcGFyZW50cyB0aGF0IGFyZSByZWdpc3RlcmVkIHdpdGggdGhpcyBkcm9wIGNvbnRhaW5lci4gKi9cbiAgZ2V0U2Nyb2xsYWJsZVBhcmVudHMoKTogcmVhZG9ubHkgSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbGFibGVFbGVtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWd1cmVzIG91dCB0aGUgaW5kZXggb2YgYW4gaXRlbSBpbiB0aGUgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIHdob3NlIGluZGV4IHNob3VsZCBiZSBkZXRlcm1pbmVkLlxuICAgKi9cbiAgZ2V0SXRlbUluZGV4KGl0ZW06IERyYWdSZWYpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pc0RyYWdnaW5nXG4gICAgICA/IHRoaXMuX3NvcnRTdHJhdGVneS5nZXRJdGVtSW5kZXgoaXRlbSlcbiAgICAgIDogdGhpcy5fZHJhZ2dhYmxlcy5pbmRleE9mKGl0ZW0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGxpc3QgaXMgYWJsZSB0byByZWNlaXZlIHRoZSBpdGVtIHRoYXRcbiAgICogaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQgaW5zaWRlIGEgY29ubmVjdGVkIGRyb3AgbGlzdC5cbiAgICovXG4gIGlzUmVjZWl2aW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVTaWJsaW5ncy5zaXplID4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0cyBhbiBpdGVtIGluc2lkZSB0aGUgY29udGFpbmVyIGJhc2VkIG9uIGl0cyBwb3NpdGlvbi5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0byBiZSBzb3J0ZWQuXG4gICAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFkgYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJEZWx0YSBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHBvaW50ZXIgaXMgbW92aW5nIGFsb25nIGVhY2ggYXhpcy5cbiAgICovXG4gIF9zb3J0SXRlbShcbiAgICBpdGVtOiBEcmFnUmVmLFxuICAgIHBvaW50ZXJYOiBudW1iZXIsXG4gICAgcG9pbnRlclk6IG51bWJlcixcbiAgICBwb2ludGVyRGVsdGE6IHt4OiBudW1iZXI7IHk6IG51bWJlcn0sXG4gICk6IHZvaWQge1xuICAgIC8vIERvbid0IHNvcnQgdGhlIGl0ZW0gaWYgc29ydGluZyBpcyBkaXNhYmxlZCBvciBpdCdzIG91dCBvZiByYW5nZS5cbiAgICBpZiAoXG4gICAgICB0aGlzLnNvcnRpbmdEaXNhYmxlZCB8fFxuICAgICAgIXRoaXMuX2RvbVJlY3QgfHxcbiAgICAgICFpc1BvaW50ZXJOZWFyRG9tUmVjdCh0aGlzLl9kb21SZWN0LCBEUk9QX1BST1hJTUlUWV9USFJFU0hPTEQsIHBvaW50ZXJYLCBwb2ludGVyWSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zb3J0U3RyYXRlZ3kuc29ydChpdGVtLCBwb2ludGVyWCwgcG9pbnRlclksIHBvaW50ZXJEZWx0YSk7XG5cbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB0aGlzLnNvcnRlZC5uZXh0KHtcbiAgICAgICAgcHJldmlvdXNJbmRleDogcmVzdWx0LnByZXZpb3VzSW5kZXgsXG4gICAgICAgIGN1cnJlbnRJbmRleDogcmVzdWx0LmN1cnJlbnRJbmRleCxcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLFxuICAgICAgICBpdGVtLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSB1c2VyJ3MgcG9pbnRlciBpcyBjbG9zZSB0byB0aGUgZWRnZXMgb2YgZWl0aGVyIHRoZVxuICAgKiB2aWV3cG9ydCBvciB0aGUgZHJvcCBsaXN0IGFuZCBzdGFydHMgdGhlIGF1dG8tc2Nyb2xsIHNlcXVlbmNlLlxuICAgKiBAcGFyYW0gcG9pbnRlclggVXNlcidzIHBvaW50ZXIgcG9zaXRpb24gYWxvbmcgdGhlIHggYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJZIFVzZXIncyBwb2ludGVyIHBvc2l0aW9uIGFsb25nIHRoZSB5IGF4aXMuXG4gICAqL1xuICBfc3RhcnRTY3JvbGxpbmdJZk5lY2Vzc2FyeShwb2ludGVyWDogbnVtYmVyLCBwb2ludGVyWTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuYXV0b1Njcm9sbERpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNjcm9sbE5vZGU6IEhUTUxFbGVtZW50IHwgV2luZG93IHwgdW5kZWZpbmVkO1xuICAgIGxldCB2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiA9IEF1dG9TY3JvbGxWZXJ0aWNhbERpcmVjdGlvbi5OT05FO1xuICAgIGxldCBob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uID0gQXV0b1Njcm9sbEhvcml6b250YWxEaXJlY3Rpb24uTk9ORTtcblxuICAgIC8vIENoZWNrIHdoZXRoZXIgd2Ugc2hvdWxkIHN0YXJ0IHNjcm9sbGluZyBhbnkgb2YgdGhlIHBhcmVudCBjb250YWluZXJzLlxuICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5wb3NpdGlvbnMuZm9yRWFjaCgocG9zaXRpb24sIGVsZW1lbnQpID0+IHtcbiAgICAgIC8vIFdlIGhhdmUgc3BlY2lhbCBoYW5kbGluZyBmb3IgdGhlIGBkb2N1bWVudGAgYmVsb3cuIEFsc28gdGhpcyB3b3VsZCBiZVxuICAgICAgLy8gbmljZXIgd2l0aCBhICBmb3IuLi5vZiBsb29wLCBidXQgaXQgcmVxdWlyZXMgY2hhbmdpbmcgYSBjb21waWxlciBmbGFnLlxuICAgICAgaWYgKGVsZW1lbnQgPT09IHRoaXMuX2RvY3VtZW50IHx8ICFwb3NpdGlvbi5jbGllbnRSZWN0IHx8IHNjcm9sbE5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNQb2ludGVyTmVhckRvbVJlY3QocG9zaXRpb24uY2xpZW50UmVjdCwgRFJPUF9QUk9YSU1JVFlfVEhSRVNIT0xELCBwb2ludGVyWCwgcG9pbnRlclkpKSB7XG4gICAgICAgIFt2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiwgaG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbl0gPSBnZXRFbGVtZW50U2Nyb2xsRGlyZWN0aW9ucyhcbiAgICAgICAgICBlbGVtZW50IGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIHBvc2l0aW9uLmNsaWVudFJlY3QsXG4gICAgICAgICAgdGhpcy5fZGlyZWN0aW9uLFxuICAgICAgICAgIHBvaW50ZXJYLFxuICAgICAgICAgIHBvaW50ZXJZLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiB8fCBob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uKSB7XG4gICAgICAgICAgc2Nyb2xsTm9kZSA9IGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE90aGVyd2lzZSBjaGVjayBpZiB3ZSBjYW4gc3RhcnQgc2Nyb2xsaW5nIHRoZSB2aWV3cG9ydC5cbiAgICBpZiAoIXZlcnRpY2FsU2Nyb2xsRGlyZWN0aW9uICYmICFob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uKSB7XG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2l6ZSgpO1xuICAgICAgY29uc3QgZG9tUmVjdCA9IHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogd2lkdGgsXG4gICAgICAgIGJvdHRvbTogaGVpZ2h0LFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgfSBhcyBET01SZWN0O1xuICAgICAgdmVydGljYWxTY3JvbGxEaXJlY3Rpb24gPSBnZXRWZXJ0aWNhbFNjcm9sbERpcmVjdGlvbihkb21SZWN0LCBwb2ludGVyWSk7XG4gICAgICBob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uID0gZ2V0SG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbihkb21SZWN0LCBwb2ludGVyWCk7XG4gICAgICBzY3JvbGxOb2RlID0gd2luZG93O1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHNjcm9sbE5vZGUgJiZcbiAgICAgICh2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiAhPT0gdGhpcy5fdmVydGljYWxTY3JvbGxEaXJlY3Rpb24gfHxcbiAgICAgICAgaG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbiAhPT0gdGhpcy5faG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbiB8fFxuICAgICAgICBzY3JvbGxOb2RlICE9PSB0aGlzLl9zY3JvbGxOb2RlKVxuICAgICkge1xuICAgICAgdGhpcy5fdmVydGljYWxTY3JvbGxEaXJlY3Rpb24gPSB2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbjtcbiAgICAgIHRoaXMuX2hvcml6b250YWxTY3JvbGxEaXJlY3Rpb24gPSBob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uO1xuICAgICAgdGhpcy5fc2Nyb2xsTm9kZSA9IHNjcm9sbE5vZGU7XG5cbiAgICAgIGlmICgodmVydGljYWxTY3JvbGxEaXJlY3Rpb24gfHwgaG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbikgJiYgc2Nyb2xsTm9kZSkge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIodGhpcy5fc3RhcnRTY3JvbGxJbnRlcnZhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zdG9wU2Nyb2xsaW5nKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFN0b3BzIGFueSBjdXJyZW50bHktcnVubmluZyBhdXRvLXNjcm9sbCBzZXF1ZW5jZXMuICovXG4gIF9zdG9wU2Nyb2xsaW5nKCkge1xuICAgIHRoaXMuX3N0b3BTY3JvbGxUaW1lcnMubmV4dCgpO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2Ugd2l0aGluIHRoZSBsaXN0LiAqL1xuICBwcml2YXRlIF9kcmFnZ2luZ1N0YXJ0ZWQoKSB7XG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5fY29udGFpbmVyLnN0eWxlIGFzIERyYWdDU1NTdHlsZURlY2xhcmF0aW9uO1xuICAgIHRoaXMuYmVmb3JlU3RhcnRlZC5uZXh0KCk7XG4gICAgdGhpcy5faXNEcmFnZ2luZyA9IHRydWU7XG5cbiAgICBpZiAoXG4gICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgLy8gUHJldmVudCB0aGUgY2hlY2sgZnJvbSBydW5uaW5nIG9uIGFwcHMgbm90IHVzaW5nIGFuIGFsdGVybmF0ZSBjb250YWluZXIuIElkZWFsbHkgd2VcbiAgICAgIC8vIHdvdWxkIGFsd2F5cyBydW4gaXQsIGJ1dCBpbnRyb2R1Y2luZyBpdCBhdCB0aGlzIHN0YWdlIHdvdWxkIGJlIGEgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgdGhpcy5fY29udGFpbmVyICE9PSBjb2VyY2VFbGVtZW50KHRoaXMuZWxlbWVudClcbiAgICApIHtcbiAgICAgIGZvciAoY29uc3QgZHJhZyBvZiB0aGlzLl9kcmFnZ2FibGVzKSB7XG4gICAgICAgIGlmICghZHJhZy5pc0RyYWdnaW5nKCkgJiYgZHJhZy5nZXRWaXNpYmxlRWxlbWVudCgpLnBhcmVudE5vZGUgIT09IHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdJbnZhbGlkIERPTSBzdHJ1Y3R1cmUgZm9yIGRyb3AgbGlzdC4gQWxsIGl0ZW1zIG11c3QgYmUgcGxhY2VkIGRpcmVjdGx5IGluc2lkZSBvZiB0aGUgZWxlbWVudCBjb250YWluZXIuJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byBkaXNhYmxlIHNjcm9sbCBzbmFwcGluZyB3aGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZywgYmVjYXVzZSBpdCBicmVha3MgYXV0b21hdGljXG4gICAgLy8gc2Nyb2xsaW5nLiBUaGUgYnJvd3NlciBzZWVtcyB0byByb3VuZCB0aGUgdmFsdWUgYmFzZWQgb24gdGhlIHNuYXBwaW5nIHBvaW50cyB3aGljaCBtZWFuc1xuICAgIC8vIHRoYXQgd2UgY2FuJ3QgaW5jcmVtZW50L2RlY3JlbWVudCB0aGUgc2Nyb2xsIHBvc2l0aW9uLlxuICAgIHRoaXMuX2luaXRpYWxTY3JvbGxTbmFwID0gc3R5bGVzLm1zU2Nyb2xsU25hcFR5cGUgfHwgc3R5bGVzLnNjcm9sbFNuYXBUeXBlIHx8ICcnO1xuICAgIHN0eWxlcy5zY3JvbGxTbmFwVHlwZSA9IHN0eWxlcy5tc1Njcm9sbFNuYXBUeXBlID0gJ25vbmUnO1xuICAgIHRoaXMuX3NvcnRTdHJhdGVneS5zdGFydCh0aGlzLl9kcmFnZ2FibGVzKTtcbiAgICB0aGlzLl9jYWNoZVBhcmVudFBvc2l0aW9ucygpO1xuICAgIHRoaXMuX3ZpZXdwb3J0U2Nyb2xsU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fbGlzdGVuVG9TY3JvbGxFdmVudHMoKTtcbiAgfVxuXG4gIC8qKiBDYWNoZXMgdGhlIHBvc2l0aW9ucyBvZiB0aGUgY29uZmlndXJlZCBzY3JvbGxhYmxlIHBhcmVudHMuICovXG4gIHByaXZhdGUgX2NhY2hlUGFyZW50UG9zaXRpb25zKCkge1xuICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5jYWNoZSh0aGlzLl9zY3JvbGxhYmxlRWxlbWVudHMpO1xuXG4gICAgLy8gVGhlIGxpc3QgZWxlbWVudCBpcyBhbHdheXMgaW4gdGhlIGBzY3JvbGxhYmxlRWxlbWVudHNgXG4gICAgLy8gc28gd2UgY2FuIHRha2UgYWR2YW50YWdlIG9mIHRoZSBjYWNoZWQgYERPTVJlY3RgLlxuICAgIHRoaXMuX2RvbVJlY3QgPSB0aGlzLl9wYXJlbnRQb3NpdGlvbnMucG9zaXRpb25zLmdldCh0aGlzLl9jb250YWluZXIpIS5jbGllbnRSZWN0ITtcbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIGNvbnRhaW5lciB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gKi9cbiAgcHJpdmF0ZSBfcmVzZXQoKSB7XG4gICAgdGhpcy5faXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIGNvbnN0IHN0eWxlcyA9IHRoaXMuX2NvbnRhaW5lci5zdHlsZSBhcyBEcmFnQ1NTU3R5bGVEZWNsYXJhdGlvbjtcbiAgICBzdHlsZXMuc2Nyb2xsU25hcFR5cGUgPSBzdHlsZXMubXNTY3JvbGxTbmFwVHlwZSA9IHRoaXMuX2luaXRpYWxTY3JvbGxTbmFwO1xuXG4gICAgdGhpcy5fc2libGluZ3MuZm9yRWFjaChzaWJsaW5nID0+IHNpYmxpbmcuX3N0b3BSZWNlaXZpbmcodGhpcykpO1xuICAgIHRoaXMuX3NvcnRTdHJhdGVneS5yZXNldCgpO1xuICAgIHRoaXMuX3N0b3BTY3JvbGxpbmcoKTtcbiAgICB0aGlzLl92aWV3cG9ydFNjcm9sbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyB0aGUgaW50ZXJ2YWwgdGhhdCdsbCBhdXRvLXNjcm9sbCB0aGUgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfc3RhcnRTY3JvbGxJbnRlcnZhbCA9ICgpID0+IHtcbiAgICB0aGlzLl9zdG9wU2Nyb2xsaW5nKCk7XG5cbiAgICBpbnRlcnZhbCgwLCBhbmltYXRpb25GcmFtZVNjaGVkdWxlcilcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9zdG9wU2Nyb2xsVGltZXJzKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc2Nyb2xsTm9kZTtcbiAgICAgICAgY29uc3Qgc2Nyb2xsU3RlcCA9IHRoaXMuYXV0b1Njcm9sbFN0ZXA7XG5cbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2FsU2Nyb2xsRGlyZWN0aW9uID09PSBBdXRvU2Nyb2xsVmVydGljYWxEaXJlY3Rpb24uVVApIHtcbiAgICAgICAgICBub2RlLnNjcm9sbEJ5KDAsIC1zY3JvbGxTdGVwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl92ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiA9PT0gQXV0b1Njcm9sbFZlcnRpY2FsRGlyZWN0aW9uLkRPV04pIHtcbiAgICAgICAgICBub2RlLnNjcm9sbEJ5KDAsIHNjcm9sbFN0ZXApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2hvcml6b250YWxTY3JvbGxEaXJlY3Rpb24gPT09IEF1dG9TY3JvbGxIb3Jpem9udGFsRGlyZWN0aW9uLkxFRlQpIHtcbiAgICAgICAgICBub2RlLnNjcm9sbEJ5KC1zY3JvbGxTdGVwLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uID09PSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5SSUdIVCkge1xuICAgICAgICAgIG5vZGUuc2Nyb2xsQnkoc2Nyb2xsU3RlcCwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgdXNlcidzIHBvaW50ZXIgaXMgcG9zaXRpb25lZCBvdmVyIHRoZSBjb250YWluZXIuXG4gICAqIEBwYXJhbSB4IFBvaW50ZXIgcG9zaXRpb24gYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHkgUG9pbnRlciBwb3NpdGlvbiBhbG9uZyB0aGUgWSBheGlzLlxuICAgKi9cbiAgX2lzT3ZlckNvbnRhaW5lcih4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kb21SZWN0ICE9IG51bGwgJiYgaXNJbnNpZGVDbGllbnRSZWN0KHRoaXMuX2RvbVJlY3QsIHgsIHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpZ3VyZXMgb3V0IHdoZXRoZXIgYW4gaXRlbSBzaG91bGQgYmUgbW92ZWQgaW50byBhIHNpYmxpbmdcbiAgICogZHJvcCBjb250YWluZXIsIGJhc2VkIG9uIGl0cyBjdXJyZW50IHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gaXRlbSBEcmFnIGl0ZW0gdGhhdCBpcyBiZWluZyBtb3ZlZC5cbiAgICogQHBhcmFtIHggUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFggYXhpcy5cbiAgICogQHBhcmFtIHkgUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFkgYXhpcy5cbiAgICovXG4gIF9nZXRTaWJsaW5nQ29udGFpbmVyRnJvbVBvc2l0aW9uKGl0ZW06IERyYWdSZWYsIHg6IG51bWJlciwgeTogbnVtYmVyKTogRHJvcExpc3RSZWYgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9zaWJsaW5ncy5maW5kKHNpYmxpbmcgPT4gc2libGluZy5fY2FuUmVjZWl2ZShpdGVtLCB4LCB5KSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGRyb3AgbGlzdCBjYW4gcmVjZWl2ZSB0aGUgcGFzc2VkLWluIGl0ZW0uXG4gICAqIEBwYXJhbSBpdGVtIEl0ZW0gdGhhdCBpcyBiZWluZyBkcmFnZ2VkIGludG8gdGhlIGxpc3QuXG4gICAqIEBwYXJhbSB4IFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSB5IFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqL1xuICBfY2FuUmVjZWl2ZShpdGVtOiBEcmFnUmVmLCB4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICF0aGlzLl9kb21SZWN0IHx8XG4gICAgICAhaXNJbnNpZGVDbGllbnRSZWN0KHRoaXMuX2RvbVJlY3QsIHgsIHkpIHx8XG4gICAgICAhdGhpcy5lbnRlclByZWRpY2F0ZShpdGVtLCB0aGlzKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRGcm9tUG9pbnQgPSB0aGlzLl9nZXRTaGFkb3dSb290KCkuZWxlbWVudEZyb21Qb2ludCh4LCB5KSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgICAvLyBJZiB0aGVyZSdzIG5vIGVsZW1lbnQgYXQgdGhlIHBvaW50ZXIgcG9zaXRpb24sIHRoZW5cbiAgICAvLyB0aGUgY2xpZW50IHJlY3QgaXMgcHJvYmFibHkgc2Nyb2xsZWQgb3V0IG9mIHRoZSB2aWV3LlxuICAgIGlmICghZWxlbWVudEZyb21Qb2ludCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoZSBgRE9NUmVjdGAsIHRoYXQgd2UncmUgdXNpbmcgdG8gZmluZCB0aGUgY29udGFpbmVyIG92ZXIgd2hpY2ggdGhlIHVzZXIgaXNcbiAgICAvLyBob3ZlcmluZywgZG9lc24ndCBnaXZlIHVzIGFueSBpbmZvcm1hdGlvbiBvbiB3aGV0aGVyIHRoZSBlbGVtZW50IGhhcyBiZWVuIHNjcm9sbGVkXG4gICAgLy8gb3V0IG9mIHRoZSB2aWV3IG9yIHdoZXRoZXIgaXQncyBvdmVybGFwcGluZyB3aXRoIG90aGVyIGNvbnRhaW5lcnMuIFRoaXMgbWVhbnMgdGhhdFxuICAgIC8vIHdlIGNvdWxkIGVuZCB1cCB0cmFuc2ZlcnJpbmcgdGhlIGl0ZW0gaW50byBhIGNvbnRhaW5lciB0aGF0J3MgaW52aXNpYmxlIG9yIGlzIHBvc2l0aW9uZWRcbiAgICAvLyBiZWxvdyBhbm90aGVyIG9uZS4gV2UgdXNlIHRoZSByZXN1bHQgZnJvbSBgZWxlbWVudEZyb21Qb2ludGAgdG8gZ2V0IHRoZSB0b3AtbW9zdCBlbGVtZW50XG4gICAgLy8gYXQgdGhlIHBvaW50ZXIgcG9zaXRpb24gYW5kIHRvIGZpbmQgd2hldGhlciBpdCdzIG9uZSBvZiB0aGUgaW50ZXJzZWN0aW5nIGRyb3AgY29udGFpbmVycy5cbiAgICByZXR1cm4gZWxlbWVudEZyb21Qb2ludCA9PT0gdGhpcy5fY29udGFpbmVyIHx8IHRoaXMuX2NvbnRhaW5lci5jb250YWlucyhlbGVtZW50RnJvbVBvaW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgb25lIG9mIHRoZSBjb25uZWN0ZWQgZHJvcCBsaXN0cyB3aGVuIGEgZHJhZ2dpbmcgc2VxdWVuY2UgaGFzIHN0YXJ0ZWQuXG4gICAqIEBwYXJhbSBzaWJsaW5nIFNpYmxpbmcgaW4gd2hpY2ggZHJhZ2dpbmcgaGFzIHN0YXJ0ZWQuXG4gICAqL1xuICBfc3RhcnRSZWNlaXZpbmcoc2libGluZzogRHJvcExpc3RSZWYsIGl0ZW1zOiBEcmFnUmVmW10pIHtcbiAgICBjb25zdCBhY3RpdmVTaWJsaW5ncyA9IHRoaXMuX2FjdGl2ZVNpYmxpbmdzO1xuXG4gICAgaWYgKFxuICAgICAgIWFjdGl2ZVNpYmxpbmdzLmhhcyhzaWJsaW5nKSAmJlxuICAgICAgaXRlbXMuZXZlcnkoaXRlbSA9PiB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBoYXZlIHRvIGFkZCBhbiBleGNlcHRpb24gdG8gdGhlIGBlbnRlclByZWRpY2F0ZWAgZm9yIGl0ZW1zIHRoYXQgc3RhcnRlZCBvZmZcbiAgICAgICAgLy8gaW4gdGhpcyBkcm9wIGxpc3QuIFRoZSBkcmFnIHJlZiBoYXMgbG9naWMgdGhhdCBhbGxvd3MgYW4gaXRlbSB0byByZXR1cm4gdG8gaXRzIGluaXRpYWxcbiAgICAgICAgLy8gY29udGFpbmVyLCBpZiBpdCBoYXMgbGVmdCB0aGUgaW5pdGlhbCBjb250YWluZXIgYW5kIG5vbmUgb2YgdGhlIGNvbm5lY3RlZCBjb250YWluZXJzXG4gICAgICAgIC8vIGFsbG93IGl0IHRvIGVudGVyLiBTZWUgYERyYWdSZWYuX3VwZGF0ZUFjdGl2ZURyb3BDb250YWluZXJgIGZvciBtb3JlIGNvbnRleHQuXG4gICAgICAgIHJldHVybiB0aGlzLmVudGVyUHJlZGljYXRlKGl0ZW0sIHRoaXMpIHx8IHRoaXMuX2RyYWdnYWJsZXMuaW5kZXhPZihpdGVtKSA+IC0xO1xuICAgICAgfSlcbiAgICApIHtcbiAgICAgIGFjdGl2ZVNpYmxpbmdzLmFkZChzaWJsaW5nKTtcbiAgICAgIHRoaXMuX2NhY2hlUGFyZW50UG9zaXRpb25zKCk7XG4gICAgICB0aGlzLl9saXN0ZW5Ub1Njcm9sbEV2ZW50cygpO1xuICAgICAgdGhpcy5yZWNlaXZpbmdTdGFydGVkLm5leHQoe1xuICAgICAgICBpbml0aWF0b3I6IHNpYmxpbmcsXG4gICAgICAgIHJlY2VpdmVyOiB0aGlzLFxuICAgICAgICBpdGVtcyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgYSBjb25uZWN0ZWQgZHJvcCBsaXN0IHdoZW4gZHJhZ2dpbmcgaGFzIHN0b3BwZWQuXG4gICAqIEBwYXJhbSBzaWJsaW5nIFNpYmxpbmcgd2hvc2UgZHJhZ2dpbmcgaGFzIHN0b3BwZWQuXG4gICAqL1xuICBfc3RvcFJlY2VpdmluZyhzaWJsaW5nOiBEcm9wTGlzdFJlZikge1xuICAgIHRoaXMuX2FjdGl2ZVNpYmxpbmdzLmRlbGV0ZShzaWJsaW5nKTtcbiAgICB0aGlzLl92aWV3cG9ydFNjcm9sbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMucmVjZWl2aW5nU3RvcHBlZC5uZXh0KHtpbml0aWF0b3I6IHNpYmxpbmcsIHJlY2VpdmVyOiB0aGlzfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIGxpc3RlbmluZyB0byBzY3JvbGwgZXZlbnRzIG9uIHRoZSB2aWV3cG9ydC5cbiAgICogVXNlZCBmb3IgdXBkYXRpbmcgdGhlIGludGVybmFsIHN0YXRlIG9mIHRoZSBsaXN0LlxuICAgKi9cbiAgcHJpdmF0ZSBfbGlzdGVuVG9TY3JvbGxFdmVudHMoKSB7XG4gICAgdGhpcy5fdmlld3BvcnRTY3JvbGxTdWJzY3JpcHRpb24gPSB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5XG4gICAgICAuc2Nyb2xsZWQodGhpcy5fZ2V0U2hhZG93Um9vdCgpKVxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgIGNvbnN0IHNjcm9sbERpZmZlcmVuY2UgPSB0aGlzLl9wYXJlbnRQb3NpdGlvbnMuaGFuZGxlU2Nyb2xsKGV2ZW50KTtcblxuICAgICAgICAgIGlmIChzY3JvbGxEaWZmZXJlbmNlKSB7XG4gICAgICAgICAgICB0aGlzLl9zb3J0U3RyYXRlZ3kudXBkYXRlT25TY3JvbGwoc2Nyb2xsRGlmZmVyZW5jZS50b3AsIHNjcm9sbERpZmZlcmVuY2UubGVmdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNSZWNlaXZpbmcoKSkge1xuICAgICAgICAgIHRoaXMuX2NhY2hlUGFyZW50UG9zaXRpb25zKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExhemlseSByZXNvbHZlcyBhbmQgcmV0dXJucyB0aGUgc2hhZG93IHJvb3Qgb2YgdGhlIGVsZW1lbnQuIFdlIGRvIHRoaXMgaW4gYSBmdW5jdGlvbiwgcmF0aGVyXG4gICAqIHRoYW4gc2F2aW5nIGl0IGluIHByb3BlcnR5IGRpcmVjdGx5IG9uIGluaXQsIGJlY2F1c2Ugd2Ugd2FudCB0byByZXNvbHZlIGl0IGFzIGxhdGUgYXMgcG9zc2libGVcbiAgICogaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaGFzIGJlZW4gbW92ZWQgaW50byB0aGUgc2hhZG93IERPTS4gRG9pbmcgaXQgaW5zaWRlIHRoZVxuICAgKiBjb25zdHJ1Y3RvciBtaWdodCBiZSB0b28gZWFybHkgaWYgdGhlIGVsZW1lbnQgaXMgaW5zaWRlIG9mIHNvbWV0aGluZyBsaWtlIGBuZ0ZvcmAgb3IgYG5nSWZgLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0U2hhZG93Um9vdCgpOiBEb2N1bWVudE9yU2hhZG93Um9vdCB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZWRTaGFkb3dSb290KSB7XG4gICAgICBjb25zdCBzaGFkb3dSb290ID0gX2dldFNoYWRvd1Jvb3QodGhpcy5fY29udGFpbmVyKTtcbiAgICAgIHRoaXMuX2NhY2hlZFNoYWRvd1Jvb3QgPSBzaGFkb3dSb290IHx8IHRoaXMuX2RvY3VtZW50O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jYWNoZWRTaGFkb3dSb290O1xuICB9XG5cbiAgLyoqIE5vdGlmaWVzIGFueSBzaWJsaW5ncyB0aGF0IG1heSBwb3RlbnRpYWxseSByZWNlaXZlIHRoZSBpdGVtLiAqL1xuICBwcml2YXRlIF9ub3RpZnlSZWNlaXZpbmdTaWJsaW5ncygpIHtcbiAgICBjb25zdCBkcmFnZ2VkSXRlbXMgPSB0aGlzLl9zb3J0U3RyYXRlZ3lcbiAgICAgIC5nZXRBY3RpdmVJdGVtc1NuYXBzaG90KClcbiAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLmlzRHJhZ2dpbmcoKSk7XG4gICAgdGhpcy5fc2libGluZ3MuZm9yRWFjaChzaWJsaW5nID0+IHNpYmxpbmcuX3N0YXJ0UmVjZWl2aW5nKHRoaXMsIGRyYWdnZWRJdGVtcykpO1xuICB9XG59XG5cbi8qKlxuICogR2V0cyB3aGV0aGVyIHRoZSB2ZXJ0aWNhbCBhdXRvLXNjcm9sbCBkaXJlY3Rpb24gb2YgYSBub2RlLlxuICogQHBhcmFtIGNsaWVudFJlY3QgRGltZW5zaW9ucyBvZiB0aGUgbm9kZS5cbiAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIHkgYXhpcy5cbiAqL1xuZnVuY3Rpb24gZ2V0VmVydGljYWxTY3JvbGxEaXJlY3Rpb24oY2xpZW50UmVjdDogRE9NUmVjdCwgcG9pbnRlclk6IG51bWJlcikge1xuICBjb25zdCB7dG9wLCBib3R0b20sIGhlaWdodH0gPSBjbGllbnRSZWN0O1xuICBjb25zdCB5VGhyZXNob2xkID0gaGVpZ2h0ICogU0NST0xMX1BST1hJTUlUWV9USFJFU0hPTEQ7XG5cbiAgaWYgKHBvaW50ZXJZID49IHRvcCAtIHlUaHJlc2hvbGQgJiYgcG9pbnRlclkgPD0gdG9wICsgeVRocmVzaG9sZCkge1xuICAgIHJldHVybiBBdXRvU2Nyb2xsVmVydGljYWxEaXJlY3Rpb24uVVA7XG4gIH0gZWxzZSBpZiAocG9pbnRlclkgPj0gYm90dG9tIC0geVRocmVzaG9sZCAmJiBwb2ludGVyWSA8PSBib3R0b20gKyB5VGhyZXNob2xkKSB7XG4gICAgcmV0dXJuIEF1dG9TY3JvbGxWZXJ0aWNhbERpcmVjdGlvbi5ET1dOO1xuICB9XG5cbiAgcmV0dXJuIEF1dG9TY3JvbGxWZXJ0aWNhbERpcmVjdGlvbi5OT05FO1xufVxuXG4vKipcbiAqIEdldHMgd2hldGhlciB0aGUgaG9yaXpvbnRhbCBhdXRvLXNjcm9sbCBkaXJlY3Rpb24gb2YgYSBub2RlLlxuICogQHBhcmFtIGNsaWVudFJlY3QgRGltZW5zaW9ucyBvZiB0aGUgbm9kZS5cbiAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIHggYXhpcy5cbiAqL1xuZnVuY3Rpb24gZ2V0SG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbihjbGllbnRSZWN0OiBET01SZWN0LCBwb2ludGVyWDogbnVtYmVyKSB7XG4gIGNvbnN0IHtsZWZ0LCByaWdodCwgd2lkdGh9ID0gY2xpZW50UmVjdDtcbiAgY29uc3QgeFRocmVzaG9sZCA9IHdpZHRoICogU0NST0xMX1BST1hJTUlUWV9USFJFU0hPTEQ7XG5cbiAgaWYgKHBvaW50ZXJYID49IGxlZnQgLSB4VGhyZXNob2xkICYmIHBvaW50ZXJYIDw9IGxlZnQgKyB4VGhyZXNob2xkKSB7XG4gICAgcmV0dXJuIEF1dG9TY3JvbGxIb3Jpem9udGFsRGlyZWN0aW9uLkxFRlQ7XG4gIH0gZWxzZSBpZiAocG9pbnRlclggPj0gcmlnaHQgLSB4VGhyZXNob2xkICYmIHBvaW50ZXJYIDw9IHJpZ2h0ICsgeFRocmVzaG9sZCkge1xuICAgIHJldHVybiBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5SSUdIVDtcbiAgfVxuXG4gIHJldHVybiBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5OT05FO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGRpcmVjdGlvbnMgaW4gd2hpY2ggYW4gZWxlbWVudCBub2RlIHNob3VsZCBiZSBzY3JvbGxlZCxcbiAqIGFzc3VtaW5nIHRoYXQgdGhlIHVzZXIncyBwb2ludGVyIGlzIGFscmVhZHkgd2l0aGluIGl0IHNjcm9sbGFibGUgcmVnaW9uLlxuICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCBmb3Igd2hpY2ggd2Ugc2hvdWxkIGNhbGN1bGF0ZSB0aGUgc2Nyb2xsIGRpcmVjdGlvbi5cbiAqIEBwYXJhbSBjbGllbnRSZWN0IEJvdW5kaW5nIGNsaWVudCByZWN0YW5nbGUgb2YgdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0gZGlyZWN0aW9uIExheW91dCBkaXJlY3Rpb24gb2YgdGhlIGRyb3AgbGlzdC5cbiAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIHggYXhpcy5cbiAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIHkgYXhpcy5cbiAqL1xuZnVuY3Rpb24gZ2V0RWxlbWVudFNjcm9sbERpcmVjdGlvbnMoXG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICBjbGllbnRSZWN0OiBET01SZWN0LFxuICBkaXJlY3Rpb246IERpcmVjdGlvbixcbiAgcG9pbnRlclg6IG51bWJlcixcbiAgcG9pbnRlclk6IG51bWJlcixcbik6IFtBdXRvU2Nyb2xsVmVydGljYWxEaXJlY3Rpb24sIEF1dG9TY3JvbGxIb3Jpem9udGFsRGlyZWN0aW9uXSB7XG4gIGNvbnN0IGNvbXB1dGVkVmVydGljYWwgPSBnZXRWZXJ0aWNhbFNjcm9sbERpcmVjdGlvbihjbGllbnRSZWN0LCBwb2ludGVyWSk7XG4gIGNvbnN0IGNvbXB1dGVkSG9yaXpvbnRhbCA9IGdldEhvcml6b250YWxTY3JvbGxEaXJlY3Rpb24oY2xpZW50UmVjdCwgcG9pbnRlclgpO1xuICBsZXQgdmVydGljYWxTY3JvbGxEaXJlY3Rpb24gPSBBdXRvU2Nyb2xsVmVydGljYWxEaXJlY3Rpb24uTk9ORTtcbiAgbGV0IGhvcml6b250YWxTY3JvbGxEaXJlY3Rpb24gPSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5OT05FO1xuXG4gIC8vIE5vdGUgdGhhdCB3ZSBoZXJlIHdlIGRvIHNvbWUgZXh0cmEgY2hlY2tzIGZvciB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGFjdHVhbGx5IHNjcm9sbGFibGUgaW5cbiAgLy8gYSBjZXJ0YWluIGRpcmVjdGlvbiBhbmQgd2Ugb25seSBhc3NpZ24gdGhlIHNjcm9sbCBkaXJlY3Rpb24gaWYgaXQgaXMuIFdlIGRvIHRoaXMgc28gdGhhdCB3ZVxuICAvLyBjYW4gYWxsb3cgb3RoZXIgZWxlbWVudHMgdG8gYmUgc2Nyb2xsZWQsIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgY2FuJ3QgYmUgc2Nyb2xsZWQgYW55bW9yZS5cbiAgLy8gVGhpcyBhbGxvd3MgdXMgdG8gaGFuZGxlIGNhc2VzIHdoZXJlIHRoZSBzY3JvbGwgcmVnaW9ucyBvZiB0d28gc2Nyb2xsYWJsZSBlbGVtZW50cyBvdmVybGFwLlxuICBpZiAoY29tcHV0ZWRWZXJ0aWNhbCkge1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9IGVsZW1lbnQuc2Nyb2xsVG9wO1xuXG4gICAgaWYgKGNvbXB1dGVkVmVydGljYWwgPT09IEF1dG9TY3JvbGxWZXJ0aWNhbERpcmVjdGlvbi5VUCkge1xuICAgICAgaWYgKHNjcm9sbFRvcCA+IDApIHtcbiAgICAgICAgdmVydGljYWxTY3JvbGxEaXJlY3Rpb24gPSBBdXRvU2Nyb2xsVmVydGljYWxEaXJlY3Rpb24uVVA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChlbGVtZW50LnNjcm9sbEhlaWdodCAtIHNjcm9sbFRvcCA+IGVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICB2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiA9IEF1dG9TY3JvbGxWZXJ0aWNhbERpcmVjdGlvbi5ET1dOO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb21wdXRlZEhvcml6b250YWwpIHtcbiAgICBjb25zdCBzY3JvbGxMZWZ0ID0gZWxlbWVudC5zY3JvbGxMZWZ0O1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3J0bCcpIHtcbiAgICAgIGlmIChjb21wdXRlZEhvcml6b250YWwgPT09IEF1dG9TY3JvbGxIb3Jpem9udGFsRGlyZWN0aW9uLlJJR0hUKSB7XG4gICAgICAgIC8vIEluIFJUTCBgc2Nyb2xsTGVmdGAgd2lsbCBiZSBuZWdhdGl2ZSB3aGVuIHNjcm9sbGVkLlxuICAgICAgICBpZiAoc2Nyb2xsTGVmdCA8IDApIHtcbiAgICAgICAgICBob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uID0gQXV0b1Njcm9sbEhvcml6b250YWxEaXJlY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5zY3JvbGxXaWR0aCArIHNjcm9sbExlZnQgPiBlbGVtZW50LmNsaWVudFdpZHRoKSB7XG4gICAgICAgIGhvcml6b250YWxTY3JvbGxEaXJlY3Rpb24gPSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5MRUZUO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY29tcHV0ZWRIb3Jpem9udGFsID09PSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5MRUZUKSB7XG4gICAgICAgIGlmIChzY3JvbGxMZWZ0ID4gMCkge1xuICAgICAgICAgIGhvcml6b250YWxTY3JvbGxEaXJlY3Rpb24gPSBBdXRvU2Nyb2xsSG9yaXpvbnRhbERpcmVjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQuc2Nyb2xsV2lkdGggLSBzY3JvbGxMZWZ0ID4gZWxlbWVudC5jbGllbnRXaWR0aCkge1xuICAgICAgICBob3Jpem9udGFsU2Nyb2xsRGlyZWN0aW9uID0gQXV0b1Njcm9sbEhvcml6b250YWxEaXJlY3Rpb24uUklHSFQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFt2ZXJ0aWNhbFNjcm9sbERpcmVjdGlvbiwgaG9yaXpvbnRhbFNjcm9sbERpcmVjdGlvbl07XG59XG4iXX0=