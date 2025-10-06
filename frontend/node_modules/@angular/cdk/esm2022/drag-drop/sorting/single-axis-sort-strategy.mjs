/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { moveItemInArray } from '../drag-utils';
import { combineTransforms } from '../dom/styling';
import { adjustDomRect, getMutableClientRect, isInsideClientRect } from '../dom/dom-rect';
/**
 * Strategy that only supports sorting along a single axis.
 * Items are reordered using CSS transforms which allows for sorting to be animated.
 * @docs-private
 */
export class SingleAxisSortStrategy {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL3NvcnRpbmcvc2luZ2xlLWF4aXMtc29ydC1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxhQUFhLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQW1CeEY7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUF1QmpDLFlBQW9CLGlCQUFtQztRQUFuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBaEJ2RCxxRUFBcUU7UUFDN0QsbUJBQWMsR0FBa0MsRUFBRSxDQUFDO1FBUzNELCtDQUErQztRQUMvQyxnQkFBVyxHQUE4QixVQUFVLENBQUM7UUFPcEQ7Ozs7V0FJRztRQUNLLGtCQUFhLEdBQUc7WUFDdEIsSUFBSSxFQUFFLElBQXNCO1lBQzVCLEtBQUssRUFBRSxDQUFDO1lBQ1IsUUFBUSxFQUFFLEtBQUs7U0FDaEIsQ0FBQztJQVh3RCxDQUFDO0lBYTNEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxLQUF5QjtRQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJQUFJLENBQUMsSUFBYSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQztRQUMxRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFB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QUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekYsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3hFLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtEcmFnRHJvcFJlZ2lzdHJ5fSBmcm9tICcuLi9kcmFnLWRyb3AtcmVnaXN0cnknO1xuaW1wb3J0IHttb3ZlSXRlbUluQXJyYXl9IGZyb20gJy4uL2RyYWctdXRpbHMnO1xuaW1wb3J0IHtjb21iaW5lVHJhbnNmb3Jtc30gZnJvbSAnLi4vZG9tL3N0eWxpbmcnO1xuaW1wb3J0IHthZGp1c3REb21SZWN0LCBnZXRNdXRhYmxlQ2xpZW50UmVjdCwgaXNJbnNpZGVDbGllbnRSZWN0fSBmcm9tICcuLi9kb20vZG9tLXJlY3QnO1xuaW1wb3J0IHtEcm9wTGlzdFNvcnRTdHJhdGVneSwgU29ydFByZWRpY2F0ZX0gZnJvbSAnLi9kcm9wLWxpc3Qtc29ydC1zdHJhdGVneSc7XG5pbXBvcnQgdHlwZSB7RHJhZ1JlZn0gZnJvbSAnLi4vZHJhZy1yZWYnO1xuXG4vKipcbiAqIEVudHJ5IGluIHRoZSBwb3NpdGlvbiBjYWNoZSBmb3IgZHJhZ2dhYmxlIGl0ZW1zLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5pbnRlcmZhY2UgQ2FjaGVkSXRlbVBvc2l0aW9uPFQ+IHtcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBkcmFnIGl0ZW0uICovXG4gIGRyYWc6IFQ7XG4gIC8qKiBEaW1lbnNpb25zIG9mIHRoZSBpdGVtLiAqL1xuICBjbGllbnRSZWN0OiBET01SZWN0O1xuICAvKiogQW1vdW50IGJ5IHdoaWNoIHRoZSBpdGVtIGhhcyBiZWVuIG1vdmVkIHNpbmNlIGRyYWdnaW5nIHN0YXJ0ZWQuICovXG4gIG9mZnNldDogbnVtYmVyO1xuICAvKiogSW5saW5lIHRyYW5zZm9ybSB0aGF0IHRoZSBkcmFnIGl0ZW0gaGFkIHdoZW4gZHJhZ2dpbmcgc3RhcnRlZC4gKi9cbiAgaW5pdGlhbFRyYW5zZm9ybTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cmF0ZWd5IHRoYXQgb25seSBzdXBwb3J0cyBzb3J0aW5nIGFsb25nIGEgc2luZ2xlIGF4aXMuXG4gKiBJdGVtcyBhcmUgcmVvcmRlcmVkIHVzaW5nIENTUyB0cmFuc2Zvcm1zIHdoaWNoIGFsbG93cyBmb3Igc29ydGluZyB0byBiZSBhbmltYXRlZC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFNpbmdsZUF4aXNTb3J0U3RyYXRlZ3kgaW1wbGVtZW50cyBEcm9wTGlzdFNvcnRTdHJhdGVneSB7XG4gIC8qKiBSb290IGVsZW1lbnQgY29udGFpbmVyIG9mIHRoZSBkcm9wIGxpc3QuICovXG4gIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGRldGVybWluZSBpZiBhbiBpdGVtIGNhbiBiZSBzb3J0ZWQgaW50byBhIHNwZWNpZmljIGluZGV4LiAqL1xuICBwcml2YXRlIF9zb3J0UHJlZGljYXRlOiBTb3J0UHJlZGljYXRlPERyYWdSZWY+O1xuXG4gIC8qKiBDYWNoZSBvZiB0aGUgZGltZW5zaW9ucyBvZiBhbGwgdGhlIGl0ZW1zIGluc2lkZSB0aGUgY29udGFpbmVyLiAqL1xuICBwcml2YXRlIF9pdGVtUG9zaXRpb25zOiBDYWNoZWRJdGVtUG9zaXRpb248RHJhZ1JlZj5bXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBEcmFnZ2FibGUgaXRlbXMgdGhhdCBhcmUgY3VycmVudGx5IGFjdGl2ZSBpbnNpZGUgdGhlIGNvbnRhaW5lci4gSW5jbHVkZXMgdGhlIGl0ZW1zXG4gICAqIHRoYXQgd2VyZSB0aGVyZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlcXVlbmNlLCBhcyB3ZWxsIGFzIGFueSBpdGVtcyB0aGF0IGhhdmUgYmVlbiBkcmFnZ2VkXG4gICAqIGluLCBidXQgaGF2ZW4ndCBiZWVuIGRyb3BwZWQgeWV0LlxuICAgKi9cbiAgcHJpdmF0ZSBfYWN0aXZlRHJhZ2dhYmxlczogRHJhZ1JlZltdO1xuXG4gIC8qKiBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIGxpc3QgaXMgb3JpZW50ZWQuICovXG4gIG9yaWVudGF0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogTGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgZHJvcCBsaXN0LiAqL1xuICBkaXJlY3Rpb246IERpcmVjdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kcmFnRHJvcFJlZ2lzdHJ5OiBEcmFnRHJvcFJlZ2lzdHJ5KSB7fVxuXG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgaXRlbSB0aGF0IHdhcyBsYXN0IHN3YXBwZWQgd2l0aCB0aGUgZHJhZ2dlZCBpdGVtLCBhcyB3ZWxsIGFzIHdoYXQgZGlyZWN0aW9uXG4gICAqIHRoZSBwb2ludGVyIHdhcyBtb3ZpbmcgaW4gd2hlbiB0aGUgc3dhcCBvY2N1cnJlZCBhbmQgd2hldGhlciB0aGUgdXNlcidzIHBvaW50ZXIgY29udGludWVkIHRvXG4gICAqIG92ZXJsYXAgd2l0aCB0aGUgc3dhcHBlZCBpdGVtIGFmdGVyIHRoZSBzd2FwcGluZyBvY2N1cnJlZC5cbiAgICovXG4gIHByaXZhdGUgX3ByZXZpb3VzU3dhcCA9IHtcbiAgICBkcmFnOiBudWxsIGFzIERyYWdSZWYgfCBudWxsLFxuICAgIGRlbHRhOiAwLFxuICAgIG92ZXJsYXBzOiBmYWxzZSxcbiAgfTtcblxuICAvKipcbiAgICogVG8gYmUgY2FsbGVkIHdoZW4gdGhlIGRyYWcgc2VxdWVuY2Ugc3RhcnRzLlxuICAgKiBAcGFyYW0gaXRlbXMgSXRlbXMgdGhhdCBhcmUgY3VycmVudGx5IGluIHRoZSBsaXN0LlxuICAgKi9cbiAgc3RhcnQoaXRlbXM6IHJlYWRvbmx5IERyYWdSZWZbXSkge1xuICAgIHRoaXMud2l0aEl0ZW1zKGl0ZW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUbyBiZSBjYWxsZWQgd2hlbiBhbiBpdGVtIGlzIGJlaW5nIHNvcnRlZC5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0byBiZSBzb3J0ZWQuXG4gICAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFkgYXhpcy5cbiAgICogQHBhcmFtIHBvaW50ZXJEZWx0YSBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHBvaW50ZXIgaXMgbW92aW5nIGFsb25nIGVhY2ggYXhpcy5cbiAgICovXG4gIHNvcnQoaXRlbTogRHJhZ1JlZiwgcG9pbnRlclg6IG51bWJlciwgcG9pbnRlclk6IG51bWJlciwgcG9pbnRlckRlbHRhOiB7eDogbnVtYmVyOyB5OiBudW1iZXJ9KSB7XG4gICAgY29uc3Qgc2libGluZ3MgPSB0aGlzLl9pdGVtUG9zaXRpb25zO1xuICAgIGNvbnN0IG5ld0luZGV4ID0gdGhpcy5fZ2V0SXRlbUluZGV4RnJvbVBvaW50ZXJQb3NpdGlvbihpdGVtLCBwb2ludGVyWCwgcG9pbnRlclksIHBvaW50ZXJEZWx0YSk7XG5cbiAgICBpZiAobmV3SW5kZXggPT09IC0xICYmIHNpYmxpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzaWJsaW5ncy5maW5kSW5kZXgoY3VycmVudEl0ZW0gPT4gY3VycmVudEl0ZW0uZHJhZyA9PT0gaXRlbSk7XG4gICAgY29uc3Qgc2libGluZ0F0TmV3UG9zaXRpb24gPSBzaWJsaW5nc1tuZXdJbmRleF07XG4gICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gc2libGluZ3NbY3VycmVudEluZGV4XS5jbGllbnRSZWN0O1xuICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gc2libGluZ0F0TmV3UG9zaXRpb24uY2xpZW50UmVjdDtcbiAgICBjb25zdCBkZWx0YSA9IGN1cnJlbnRJbmRleCA+IG5ld0luZGV4ID8gMSA6IC0xO1xuXG4gICAgLy8gSG93IG1hbnkgcGl4ZWxzIHRoZSBpdGVtJ3MgcGxhY2Vob2xkZXIgc2hvdWxkIGJlIG9mZnNldC5cbiAgICBjb25zdCBpdGVtT2Zmc2V0ID0gdGhpcy5fZ2V0SXRlbU9mZnNldFB4KGN1cnJlbnRQb3NpdGlvbiwgbmV3UG9zaXRpb24sIGRlbHRhKTtcblxuICAgIC8vIEhvdyBtYW55IHBpeGVscyBhbGwgdGhlIG90aGVyIGl0ZW1zIHNob3VsZCBiZSBvZmZzZXQuXG4gICAgY29uc3Qgc2libGluZ09mZnNldCA9IHRoaXMuX2dldFNpYmxpbmdPZmZzZXRQeChjdXJyZW50SW5kZXgsIHNpYmxpbmdzLCBkZWx0YSk7XG5cbiAgICAvLyBTYXZlIHRoZSBwcmV2aW91cyBvcmRlciBvZiB0aGUgaXRlbXMgYmVmb3JlIG1vdmluZyB0aGUgaXRlbSB0byBpdHMgbmV3IGluZGV4LlxuICAgIC8vIFdlIHVzZSB0aGlzIHRvIGNoZWNrIHdoZXRoZXIgYW4gaXRlbSBoYXMgYmVlbiBtb3ZlZCBhcyBhIHJlc3VsdCBvZiB0aGUgc29ydGluZy5cbiAgICBjb25zdCBvbGRPcmRlciA9IHNpYmxpbmdzLnNsaWNlKCk7XG5cbiAgICAvLyBTaHVmZmxlIHRoZSBhcnJheSBpbiBwbGFjZS5cbiAgICBtb3ZlSXRlbUluQXJyYXkoc2libGluZ3MsIGN1cnJlbnRJbmRleCwgbmV3SW5kZXgpO1xuXG4gICAgc2libGluZ3MuZm9yRWFjaCgoc2libGluZywgaW5kZXgpID0+IHtcbiAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIHRoZSBwb3NpdGlvbiBoYXNuJ3QgY2hhbmdlZC5cbiAgICAgIGlmIChvbGRPcmRlcltpbmRleF0gPT09IHNpYmxpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc0RyYWdnZWRJdGVtID0gc2libGluZy5kcmFnID09PSBpdGVtO1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gaXNEcmFnZ2VkSXRlbSA/IGl0ZW1PZmZzZXQgOiBzaWJsaW5nT2Zmc2V0O1xuICAgICAgY29uc3QgZWxlbWVudFRvT2Zmc2V0ID0gaXNEcmFnZ2VkSXRlbVxuICAgICAgICA/IGl0ZW0uZ2V0UGxhY2Vob2xkZXJFbGVtZW50KClcbiAgICAgICAgOiBzaWJsaW5nLmRyYWcuZ2V0Um9vdEVsZW1lbnQoKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBvZmZzZXQgdG8gcmVmbGVjdCB0aGUgbmV3IHBvc2l0aW9uLlxuICAgICAgc2libGluZy5vZmZzZXQgKz0gb2Zmc2V0O1xuXG4gICAgICBjb25zdCB0cmFuc2Zvcm1BbW91bnQgPSBNYXRoLnJvdW5kKHNpYmxpbmcub2Zmc2V0ICogKDEgLyBzaWJsaW5nLmRyYWcuc2NhbGUpKTtcblxuICAgICAgLy8gU2luY2Ugd2UncmUgbW92aW5nIHRoZSBpdGVtcyB3aXRoIGEgYHRyYW5zZm9ybWAsIHdlIG5lZWQgdG8gYWRqdXN0IHRoZWlyIGNhY2hlZFxuICAgICAgLy8gY2xpZW50IHJlY3RzIHRvIHJlZmxlY3QgdGhlaXIgbmV3IHBvc2l0aW9uLCBhcyB3ZWxsIGFzIHN3YXAgdGhlaXIgcG9zaXRpb25zIGluIHRoZSBjYWNoZS5cbiAgICAgIC8vIE5vdGUgdGhhdCB3ZSBzaG91bGRuJ3QgdXNlIGBnZXRCb3VuZGluZ0NsaWVudFJlY3RgIGhlcmUgdG8gdXBkYXRlIHRoZSBjYWNoZSwgYmVjYXVzZSB0aGVcbiAgICAgIC8vIGVsZW1lbnRzIG1heSBiZSBtaWQtYW5pbWF0aW9uIHdoaWNoIHdpbGwgZ2l2ZSB1cyBhIHdyb25nIHJlc3VsdC5cbiAgICAgIGlmIChpc0hvcml6b250YWwpIHtcbiAgICAgICAgLy8gUm91bmQgdGhlIHRyYW5zZm9ybXMgc2luY2Ugc29tZSBicm93c2VycyB3aWxsXG4gICAgICAgIC8vIGJsdXIgdGhlIGVsZW1lbnRzLCBmb3Igc3ViLXBpeGVsIHRyYW5zZm9ybXMuXG4gICAgICAgIGVsZW1lbnRUb09mZnNldC5zdHlsZS50cmFuc2Zvcm0gPSBjb21iaW5lVHJhbnNmb3JtcyhcbiAgICAgICAgICBgdHJhbnNsYXRlM2QoJHt0cmFuc2Zvcm1BbW91bnR9cHgsIDAsIDApYCxcbiAgICAgICAgICBzaWJsaW5nLmluaXRpYWxUcmFuc2Zvcm0sXG4gICAgICAgICk7XG4gICAgICAgIGFkanVzdERvbVJlY3Qoc2libGluZy5jbGllbnRSZWN0LCAwLCBvZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudFRvT2Zmc2V0LnN0eWxlLnRyYW5zZm9ybSA9IGNvbWJpbmVUcmFuc2Zvcm1zKFxuICAgICAgICAgIGB0cmFuc2xhdGUzZCgwLCAke3RyYW5zZm9ybUFtb3VudH1weCwgMClgLFxuICAgICAgICAgIHNpYmxpbmcuaW5pdGlhbFRyYW5zZm9ybSxcbiAgICAgICAgKTtcbiAgICAgICAgYWRqdXN0RG9tUmVjdChzaWJsaW5nLmNsaWVudFJlY3QsIG9mZnNldCwgMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlIHRoYXQgaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkbyB0aGlzIGFmdGVyIHRoZSBjbGllbnQgcmVjdHMgaGF2ZSBiZWVuIGFkanVzdGVkLlxuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5vdmVybGFwcyA9IGlzSW5zaWRlQ2xpZW50UmVjdChuZXdQb3NpdGlvbiwgcG9pbnRlclgsIHBvaW50ZXJZKTtcbiAgICB0aGlzLl9wcmV2aW91c1N3YXAuZHJhZyA9IHNpYmxpbmdBdE5ld1Bvc2l0aW9uLmRyYWc7XG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLmRlbHRhID0gaXNIb3Jpem9udGFsID8gcG9pbnRlckRlbHRhLnggOiBwb2ludGVyRGVsdGEueTtcblxuICAgIHJldHVybiB7cHJldmlvdXNJbmRleDogY3VycmVudEluZGV4LCBjdXJyZW50SW5kZXg6IG5ld0luZGV4fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhbiBpdGVtIGlzIGJlaW5nIG1vdmVkIGludG8gdGhlIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0aGF0IHdhcyBtb3ZlZCBpbnRvIHRoZSBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFkgYXhpcy5cbiAgICogQHBhcmFtIGluZGV4IEluZGV4IGF0IHdoaWNoIHRoZSBpdGVtIGVudGVyZWQuIElmIG9taXR0ZWQsIHRoZSBjb250YWluZXIgd2lsbCB0cnkgdG8gZmlndXJlIGl0XG4gICAqICAgb3V0IGF1dG9tYXRpY2FsbHkuXG4gICAqL1xuICBlbnRlcihpdGVtOiBEcmFnUmVmLCBwb2ludGVyWDogbnVtYmVyLCBwb2ludGVyWTogbnVtYmVyLCBpbmRleD86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IG5ld0luZGV4ID1cbiAgICAgIGluZGV4ID09IG51bGwgfHwgaW5kZXggPCAwXG4gICAgICAgID8gLy8gV2UgdXNlIHRoZSBjb29yZGluYXRlcyBvZiB3aGVyZSB0aGUgaXRlbSBlbnRlcmVkIHRoZSBkcm9wXG4gICAgICAgICAgLy8gem9uZSB0byBmaWd1cmUgb3V0IGF0IHdoaWNoIGluZGV4IGl0IHNob3VsZCBiZSBpbnNlcnRlZC5cbiAgICAgICAgICB0aGlzLl9nZXRJdGVtSW5kZXhGcm9tUG9pbnRlclBvc2l0aW9uKGl0ZW0sIHBvaW50ZXJYLCBwb2ludGVyWSlcbiAgICAgICAgOiBpbmRleDtcblxuICAgIGNvbnN0IGFjdGl2ZURyYWdnYWJsZXMgPSB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzO1xuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IGFjdGl2ZURyYWdnYWJsZXMuaW5kZXhPZihpdGVtKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IGl0ZW0uZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCk7XG4gICAgbGV0IG5ld1Bvc2l0aW9uUmVmZXJlbmNlOiBEcmFnUmVmIHwgdW5kZWZpbmVkID0gYWN0aXZlRHJhZ2dhYmxlc1tuZXdJbmRleF07XG5cbiAgICAvLyBJZiB0aGUgaXRlbSBhdCB0aGUgbmV3IHBvc2l0aW9uIGlzIHRoZSBzYW1lIGFzIHRoZSBpdGVtIHRoYXQgaXMgYmVpbmcgZHJhZ2dlZCxcbiAgICAvLyBpdCBtZWFucyB0aGF0IHdlJ3JlIHRyeWluZyB0byByZXN0b3JlIHRoZSBpdGVtIHRvIGl0cyBpbml0aWFsIHBvc2l0aW9uLiBJbiB0aGlzXG4gICAgLy8gY2FzZSB3ZSBzaG91bGQgdXNlIHRoZSBuZXh0IGl0ZW0gZnJvbSB0aGUgbGlzdCBhcyB0aGUgcmVmZXJlbmNlLlxuICAgIGlmIChuZXdQb3NpdGlvblJlZmVyZW5jZSA9PT0gaXRlbSkge1xuICAgICAgbmV3UG9zaXRpb25SZWZlcmVuY2UgPSBhY3RpdmVEcmFnZ2FibGVzW25ld0luZGV4ICsgMV07XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZGlkbid0IGZpbmQgYSBuZXcgcG9zaXRpb24gcmVmZXJlbmNlLCBpdCBtZWFucyB0aGF0IGVpdGhlciB0aGUgaXRlbSBkaWRuJ3Qgc3RhcnQgb2ZmXG4gICAgLy8gaW4gdGhpcyBjb250YWluZXIsIG9yIHRoYXQgdGhlIGl0ZW0gcmVxdWVzdGVkIHRvIGJlIGluc2VydGVkIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gICAgaWYgKFxuICAgICAgIW5ld1Bvc2l0aW9uUmVmZXJlbmNlICYmXG4gICAgICAobmV3SW5kZXggPT0gbnVsbCB8fCBuZXdJbmRleCA9PT0gLTEgfHwgbmV3SW5kZXggPCBhY3RpdmVEcmFnZ2FibGVzLmxlbmd0aCAtIDEpICYmXG4gICAgICB0aGlzLl9zaG91bGRFbnRlckFzRmlyc3RDaGlsZChwb2ludGVyWCwgcG9pbnRlclkpXG4gICAgKSB7XG4gICAgICBuZXdQb3NpdGlvblJlZmVyZW5jZSA9IGFjdGl2ZURyYWdnYWJsZXNbMF07XG4gICAgfVxuXG4gICAgLy8gU2luY2UgdGhlIGl0ZW0gbWF5IGJlIGluIHRoZSBgYWN0aXZlRHJhZ2dhYmxlc2AgYWxyZWFkeSAoZS5nLiBpZiB0aGUgdXNlciBkcmFnZ2VkIGl0XG4gICAgLy8gaW50byBhbm90aGVyIGNvbnRhaW5lciBhbmQgYmFjayBhZ2FpbiksIHdlIGhhdmUgdG8gZW5zdXJlIHRoYXQgaXQgaXNuJ3QgZHVwbGljYXRlZC5cbiAgICBpZiAoY3VycmVudEluZGV4ID4gLTEpIHtcbiAgICAgIGFjdGl2ZURyYWdnYWJsZXMuc3BsaWNlKGN1cnJlbnRJbmRleCwgMSk7XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgdXNlIGl0ZW1zIHRoYXQgYXJlIGJlaW5nIGRyYWdnZWQgYXMgYSByZWZlcmVuY2UsIGJlY2F1c2VcbiAgICAvLyB0aGVpciBlbGVtZW50IGhhcyBiZWVuIG1vdmVkIGRvd24gdG8gdGhlIGJvdHRvbSBvZiB0aGUgYm9keS5cbiAgICBpZiAobmV3UG9zaXRpb25SZWZlcmVuY2UgJiYgIXRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuaXNEcmFnZ2luZyhuZXdQb3NpdGlvblJlZmVyZW5jZSkpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBuZXdQb3NpdGlvblJlZmVyZW5jZS5nZXRSb290RWxlbWVudCgpO1xuICAgICAgZWxlbWVudC5wYXJlbnRFbGVtZW50IS5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIGVsZW1lbnQpO1xuICAgICAgYWN0aXZlRHJhZ2dhYmxlcy5zcGxpY2UobmV3SW5kZXgsIDAsIGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHBsYWNlaG9sZGVyKTtcbiAgICAgIGFjdGl2ZURyYWdnYWJsZXMucHVzaChpdGVtKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgdHJhbnNmb3JtIG5lZWRzIHRvIGJlIGNsZWFyZWQgc28gaXQgZG9lc24ndCB0aHJvdyBvZmYgdGhlIG1lYXN1cmVtZW50cy5cbiAgICBwbGFjZWhvbGRlci5zdHlsZS50cmFuc2Zvcm0gPSAnJztcblxuICAgIC8vIE5vdGUgdGhhdCB1c3VhbGx5IGBzdGFydGAgaXMgY2FsbGVkIHRvZ2V0aGVyIHdpdGggYGVudGVyYCB3aGVuIGFuIGl0ZW0gZ29lcyBpbnRvIGEgbmV3XG4gICAgLy8gY29udGFpbmVyLiBUaGlzIHdpbGwgY2FjaGUgaXRlbSBwb3NpdGlvbnMsIGJ1dCB3ZSBuZWVkIHRvIHJlZnJlc2ggdGhlbSBzaW5jZSB0aGUgYW1vdW50XG4gICAgLy8gb2YgaXRlbXMgaGFzIGNoYW5nZWQuXG4gICAgdGhpcy5fY2FjaGVJdGVtUG9zaXRpb25zKCk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgaXRlbXMgdGhhdCBhcmUgY3VycmVudGx5IHBhcnQgb2YgdGhlIGxpc3QuICovXG4gIHdpdGhJdGVtcyhpdGVtczogcmVhZG9ubHkgRHJhZ1JlZltdKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlRHJhZ2dhYmxlcyA9IGl0ZW1zLnNsaWNlKCk7XG4gICAgdGhpcy5fY2FjaGVJdGVtUG9zaXRpb25zKCk7XG4gIH1cblxuICAvKiogQXNzaWducyBhIHNvcnQgcHJlZGljYXRlIHRvIHRoZSBzdHJhdGVneS4gKi9cbiAgd2l0aFNvcnRQcmVkaWNhdGUocHJlZGljYXRlOiBTb3J0UHJlZGljYXRlPERyYWdSZWY+KTogdm9pZCB7XG4gICAgdGhpcy5fc29ydFByZWRpY2F0ZSA9IHByZWRpY2F0ZTtcbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIHN0cmF0ZWd5IHRvIGl0cyBpbml0aWFsIHN0YXRlIGJlZm9yZSBkcmFnZ2luZyB3YXMgc3RhcnRlZC4gKi9cbiAgcmVzZXQoKSB7XG4gICAgLy8gVE9ETyhjcmlzYmV0byk6IG1heSBoYXZlIHRvIHdhaXQgZm9yIHRoZSBhbmltYXRpb25zIHRvIGZpbmlzaC5cbiAgICB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzPy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpdGVtLmdldFJvb3RFbGVtZW50KCk7XG5cbiAgICAgIGlmIChyb290RWxlbWVudCkge1xuICAgICAgICBjb25zdCBpbml0aWFsVHJhbnNmb3JtID0gdGhpcy5faXRlbVBvc2l0aW9ucy5maW5kKHAgPT4gcC5kcmFnID09PSBpdGVtKT8uaW5pdGlhbFRyYW5zZm9ybTtcbiAgICAgICAgcm9vdEVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gaW5pdGlhbFRyYW5zZm9ybSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2l0ZW1Qb3NpdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzID0gW107XG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLmRyYWcgPSBudWxsO1xuICAgIHRoaXMuX3ByZXZpb3VzU3dhcC5kZWx0YSA9IDA7XG4gICAgdGhpcy5fcHJldmlvdXNTd2FwLm92ZXJsYXBzID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHNuYXBzaG90IG9mIGl0ZW1zIGN1cnJlbnRseSBpbiB0aGUgbGlzdC5cbiAgICogQ2FuIGluY2x1ZGUgaXRlbXMgdGhhdCB3ZSBkcmFnZ2VkIGluIGZyb20gYW5vdGhlciBsaXN0LlxuICAgKi9cbiAgZ2V0QWN0aXZlSXRlbXNTbmFwc2hvdCgpOiByZWFkb25seSBEcmFnUmVmW10ge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEcmFnZ2FibGVzO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGluZGV4IG9mIGEgc3BlY2lmaWMgaXRlbS4gKi9cbiAgZ2V0SXRlbUluZGV4KGl0ZW06IERyYWdSZWYpOiBudW1iZXIge1xuICAgIC8vIEl0ZW1zIGFyZSBzb3J0ZWQgYWx3YXlzIGJ5IHRvcC9sZWZ0IGluIHRoZSBjYWNoZSwgaG93ZXZlciB0aGV5IGZsb3cgZGlmZmVyZW50bHkgaW4gUlRMLlxuICAgIC8vIFRoZSByZXN0IG9mIHRoZSBsb2dpYyBzdGlsbCBzdGFuZHMgbm8gbWF0dGVyIHdoYXQgb3JpZW50YXRpb24gd2UncmUgaW4sIGhvd2V2ZXJcbiAgICAvLyB3ZSBuZWVkIHRvIGludmVydCB0aGUgYXJyYXkgd2hlbiBkZXRlcm1pbmluZyB0aGUgaW5kZXguXG4gICAgY29uc3QgaXRlbXMgPVxuICAgICAgdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICYmIHRoaXMuZGlyZWN0aW9uID09PSAncnRsJ1xuICAgICAgICA/IHRoaXMuX2l0ZW1Qb3NpdGlvbnMuc2xpY2UoKS5yZXZlcnNlKClcbiAgICAgICAgOiB0aGlzLl9pdGVtUG9zaXRpb25zO1xuXG4gICAgcmV0dXJuIGl0ZW1zLmZpbmRJbmRleChjdXJyZW50SXRlbSA9PiBjdXJyZW50SXRlbS5kcmFnID09PSBpdGVtKTtcbiAgfVxuXG4gIC8qKiBVc2VkIHRvIG5vdGlmeSB0aGUgc3RyYXRlZ3kgdGhhdCB0aGUgc2Nyb2xsIHBvc2l0aW9uIGhhcyBjaGFuZ2VkLiAqL1xuICB1cGRhdGVPblNjcm9sbCh0b3BEaWZmZXJlbmNlOiBudW1iZXIsIGxlZnREaWZmZXJlbmNlOiBudW1iZXIpIHtcbiAgICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBhbW91bnQgdGhhdCB0aGUgdXNlciBoYXMgc2Nyb2xsZWQgd2UgY2FuIHNoaWZ0IGFsbCBvZiB0aGVcbiAgICAvLyBjbGllbnQgcmVjdGFuZ2xlcyBvdXJzZWx2ZXMuIFRoaXMgaXMgY2hlYXBlciB0aGFuIHJlLW1lYXN1cmluZyBldmVyeXRoaW5nIGFuZFxuICAgIC8vIHdlIGNhbiBhdm9pZCBpbmNvbnNpc3RlbnQgYmVoYXZpb3Igd2hlcmUgd2UgbWlnaHQgYmUgbWVhc3VyaW5nIHRoZSBlbGVtZW50IGJlZm9yZVxuICAgIC8vIGl0cyBwb3NpdGlvbiBoYXMgY2hhbmdlZC5cbiAgICB0aGlzLl9pdGVtUG9zaXRpb25zLmZvckVhY2goKHtjbGllbnRSZWN0fSkgPT4ge1xuICAgICAgYWRqdXN0RG9tUmVjdChjbGllbnRSZWN0LCB0b3BEaWZmZXJlbmNlLCBsZWZ0RGlmZmVyZW5jZSk7XG4gICAgfSk7XG5cbiAgICAvLyBXZSBuZWVkIHR3byBsb29wcyBmb3IgdGhpcywgYmVjYXVzZSB3ZSB3YW50IGFsbCBvZiB0aGUgY2FjaGVkXG4gICAgLy8gcG9zaXRpb25zIHRvIGJlIHVwLXRvLWRhdGUgYmVmb3JlIHdlIHJlLXNvcnQgdGhlIGl0ZW0uXG4gICAgdGhpcy5faXRlbVBvc2l0aW9ucy5mb3JFYWNoKCh7ZHJhZ30pID0+IHtcbiAgICAgIGlmICh0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LmlzRHJhZ2dpbmcoZHJhZykpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byByZS1zb3J0IHRoZSBpdGVtIG1hbnVhbGx5LCBiZWNhdXNlIHRoZSBwb2ludGVyIG1vdmVcbiAgICAgICAgLy8gZXZlbnRzIHdvbid0IGJlIGRpc3BhdGNoZWQgd2hpbGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nLlxuICAgICAgICBkcmFnLl9zb3J0RnJvbUxhc3RQb2ludGVyUG9zaXRpb24oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHdpdGhFbGVtZW50Q29udGFpbmVyKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9lbGVtZW50ID0gY29udGFpbmVyO1xuICB9XG5cbiAgLyoqIFJlZnJlc2hlcyB0aGUgcG9zaXRpb24gY2FjaGUgb2YgdGhlIGl0ZW1zIGFuZCBzaWJsaW5nIGNvbnRhaW5lcnMuICovXG4gIHByaXZhdGUgX2NhY2hlSXRlbVBvc2l0aW9ucygpIHtcbiAgICBjb25zdCBpc0hvcml6b250YWwgPSB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG5cbiAgICB0aGlzLl9pdGVtUG9zaXRpb25zID0gdGhpcy5fYWN0aXZlRHJhZ2dhYmxlc1xuICAgICAgLm1hcChkcmFnID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudFRvTWVhc3VyZSA9IGRyYWcuZ2V0VmlzaWJsZUVsZW1lbnQoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkcmFnLFxuICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICBpbml0aWFsVHJhbnNmb3JtOiBlbGVtZW50VG9NZWFzdXJlLnN0eWxlLnRyYW5zZm9ybSB8fCAnJyxcbiAgICAgICAgICBjbGllbnRSZWN0OiBnZXRNdXRhYmxlQ2xpZW50UmVjdChlbGVtZW50VG9NZWFzdXJlKSxcbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXNIb3Jpem9udGFsXG4gICAgICAgICAgPyBhLmNsaWVudFJlY3QubGVmdCAtIGIuY2xpZW50UmVjdC5sZWZ0XG4gICAgICAgICAgOiBhLmNsaWVudFJlY3QudG9wIC0gYi5jbGllbnRSZWN0LnRvcDtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG9mZnNldCBpbiBwaXhlbHMgYnkgd2hpY2ggdGhlIGl0ZW0gdGhhdCBpcyBiZWluZyBkcmFnZ2VkIHNob3VsZCBiZSBtb3ZlZC5cbiAgICogQHBhcmFtIGN1cnJlbnRQb3NpdGlvbiBDdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBpdGVtLlxuICAgKiBAcGFyYW0gbmV3UG9zaXRpb24gUG9zaXRpb24gb2YgdGhlIGl0ZW0gd2hlcmUgdGhlIGN1cnJlbnQgaXRlbSBzaG91bGQgYmUgbW92ZWQuXG4gICAqIEBwYXJhbSBkZWx0YSBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHVzZXIgaXMgbW92aW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SXRlbU9mZnNldFB4KGN1cnJlbnRQb3NpdGlvbjogRE9NUmVjdCwgbmV3UG9zaXRpb246IERPTVJlY3QsIGRlbHRhOiAxIHwgLTEpIHtcbiAgICBjb25zdCBpc0hvcml6b250YWwgPSB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgbGV0IGl0ZW1PZmZzZXQgPSBpc0hvcml6b250YWxcbiAgICAgID8gbmV3UG9zaXRpb24ubGVmdCAtIGN1cnJlbnRQb3NpdGlvbi5sZWZ0XG4gICAgICA6IG5ld1Bvc2l0aW9uLnRvcCAtIGN1cnJlbnRQb3NpdGlvbi50b3A7XG5cbiAgICAvLyBBY2NvdW50IGZvciBkaWZmZXJlbmNlcyBpbiB0aGUgaXRlbSB3aWR0aC9oZWlnaHQuXG4gICAgaWYgKGRlbHRhID09PSAtMSkge1xuICAgICAgaXRlbU9mZnNldCArPSBpc0hvcml6b250YWxcbiAgICAgICAgPyBuZXdQb3NpdGlvbi53aWR0aCAtIGN1cnJlbnRQb3NpdGlvbi53aWR0aFxuICAgICAgICA6IG5ld1Bvc2l0aW9uLmhlaWdodCAtIGN1cnJlbnRQb3NpdGlvbi5oZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1PZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgb2Zmc2V0IGluIHBpeGVscyBieSB3aGljaCB0aGUgaXRlbXMgdGhhdCBhcmVuJ3QgYmVpbmcgZHJhZ2dlZCBzaG91bGQgYmUgbW92ZWQuXG4gICAqIEBwYXJhbSBjdXJyZW50SW5kZXggSW5kZXggb2YgdGhlIGl0ZW0gY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuXG4gICAqIEBwYXJhbSBzaWJsaW5ncyBBbGwgb2YgdGhlIGl0ZW1zIGluIHRoZSBsaXN0LlxuICAgKiBAcGFyYW0gZGVsdGEgRGlyZWN0aW9uIGluIHdoaWNoIHRoZSB1c2VyIGlzIG1vdmluZy5cbiAgICovXG4gIHByaXZhdGUgX2dldFNpYmxpbmdPZmZzZXRQeChcbiAgICBjdXJyZW50SW5kZXg6IG51bWJlcixcbiAgICBzaWJsaW5nczogQ2FjaGVkSXRlbVBvc2l0aW9uPERyYWdSZWY+W10sXG4gICAgZGVsdGE6IDEgfCAtMSxcbiAgKSB7XG4gICAgY29uc3QgaXNIb3Jpem9udGFsID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IHNpYmxpbmdzW2N1cnJlbnRJbmRleF0uY2xpZW50UmVjdDtcbiAgICBjb25zdCBpbW1lZGlhdGVTaWJsaW5nID0gc2libGluZ3NbY3VycmVudEluZGV4ICsgZGVsdGEgKiAtMV07XG4gICAgbGV0IHNpYmxpbmdPZmZzZXQgPSBjdXJyZW50UG9zaXRpb25baXNIb3Jpem9udGFsID8gJ3dpZHRoJyA6ICdoZWlnaHQnXSAqIGRlbHRhO1xuXG4gICAgaWYgKGltbWVkaWF0ZVNpYmxpbmcpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gaXNIb3Jpem9udGFsID8gJ2xlZnQnIDogJ3RvcCc7XG4gICAgICBjb25zdCBlbmQgPSBpc0hvcml6b250YWwgPyAncmlnaHQnIDogJ2JvdHRvbSc7XG5cbiAgICAgIC8vIEdldCB0aGUgc3BhY2luZyBiZXR3ZWVuIHRoZSBzdGFydCBvZiB0aGUgY3VycmVudCBpdGVtIGFuZCB0aGUgZW5kIG9mIHRoZSBvbmUgaW1tZWRpYXRlbHlcbiAgICAgIC8vIGFmdGVyIGl0IGluIHRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHVzZXIgaXMgZHJhZ2dpbmcsIG9yIHZpY2UgdmVyc2EuIFdlIGFkZCBpdCB0byB0aGVcbiAgICAgIC8vIG9mZnNldCBpbiBvcmRlciB0byBwdXNoIHRoZSBlbGVtZW50IHRvIHdoZXJlIGl0IHdpbGwgYmUgd2hlbiBpdCdzIGlubGluZSBhbmQgaXMgaW5mbHVlbmNlZFxuICAgICAgLy8gYnkgdGhlIGBtYXJnaW5gIG9mIGl0cyBzaWJsaW5ncy5cbiAgICAgIGlmIChkZWx0YSA9PT0gLTEpIHtcbiAgICAgICAgc2libGluZ09mZnNldCAtPSBpbW1lZGlhdGVTaWJsaW5nLmNsaWVudFJlY3Rbc3RhcnRdIC0gY3VycmVudFBvc2l0aW9uW2VuZF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWJsaW5nT2Zmc2V0ICs9IGN1cnJlbnRQb3NpdGlvbltzdGFydF0gLSBpbW1lZGlhdGVTaWJsaW5nLmNsaWVudFJlY3RbZW5kXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2libGluZ09mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgcG9pbnRlciBpcyBlbnRlcmluZyBpbiB0aGUgZmlyc3QgcG9zaXRpb25cbiAgICogQHBhcmFtIHBvaW50ZXJYIFBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqL1xuICBwcml2YXRlIF9zaG91bGRFbnRlckFzRmlyc3RDaGlsZChwb2ludGVyWDogbnVtYmVyLCBwb2ludGVyWTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmVEcmFnZ2FibGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW1Qb3NpdGlvbnMgPSB0aGlzLl9pdGVtUG9zaXRpb25zO1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcblxuICAgIC8vIGBpdGVtUG9zaXRpb25zYCBhcmUgc29ydGVkIGJ5IHBvc2l0aW9uIHdoaWxlIGBhY3RpdmVEcmFnZ2FibGVzYCBhcmUgc29ydGVkIGJ5IGNoaWxkIGluZGV4XG4gICAgLy8gY2hlY2sgaWYgY29udGFpbmVyIGlzIHVzaW5nIHNvbWUgc29ydCBvZiBcInJldmVyc2VcIiBvcmRlcmluZyAoZWc6IGZsZXgtZGlyZWN0aW9uOiByb3ctcmV2ZXJzZSlcbiAgICBjb25zdCByZXZlcnNlZCA9IGl0ZW1Qb3NpdGlvbnNbMF0uZHJhZyAhPT0gdGhpcy5fYWN0aXZlRHJhZ2dhYmxlc1swXTtcbiAgICBpZiAocmV2ZXJzZWQpIHtcbiAgICAgIGNvbnN0IGxhc3RJdGVtUmVjdCA9IGl0ZW1Qb3NpdGlvbnNbaXRlbVBvc2l0aW9ucy5sZW5ndGggLSAxXS5jbGllbnRSZWN0O1xuICAgICAgcmV0dXJuIGlzSG9yaXpvbnRhbCA/IHBvaW50ZXJYID49IGxhc3RJdGVtUmVjdC5yaWdodCA6IHBvaW50ZXJZID49IGxhc3RJdGVtUmVjdC5ib3R0b207XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZpcnN0SXRlbVJlY3QgPSBpdGVtUG9zaXRpb25zWzBdLmNsaWVudFJlY3Q7XG4gICAgICByZXR1cm4gaXNIb3Jpem9udGFsID8gcG9pbnRlclggPD0gZmlyc3RJdGVtUmVjdC5sZWZ0IDogcG9pbnRlclkgPD0gZmlyc3RJdGVtUmVjdC50b3A7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIGFuIGl0ZW0gaW4gdGhlIGRyb3AgY29udGFpbmVyLCBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIHRoYXQgaXMgYmVpbmcgc29ydGVkLlxuICAgKiBAcGFyYW0gcG9pbnRlclggUG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIFkgYXhpcy5cbiAgICogQHBhcmFtIGRlbHRhIERpcmVjdGlvbiBpbiB3aGljaCB0aGUgdXNlciBpcyBtb3ZpbmcgdGhlaXIgcG9pbnRlci5cbiAgICovXG4gIHByaXZhdGUgX2dldEl0ZW1JbmRleEZyb21Qb2ludGVyUG9zaXRpb24oXG4gICAgaXRlbTogRHJhZ1JlZixcbiAgICBwb2ludGVyWDogbnVtYmVyLFxuICAgIHBvaW50ZXJZOiBudW1iZXIsXG4gICAgZGVsdGE/OiB7eDogbnVtYmVyOyB5OiBudW1iZXJ9LFxuICApOiBudW1iZXIge1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2l0ZW1Qb3NpdGlvbnMuZmluZEluZGV4KCh7ZHJhZywgY2xpZW50UmVjdH0pID0+IHtcbiAgICAgIC8vIFNraXAgdGhlIGl0ZW0gaXRzZWxmLlxuICAgICAgaWYgKGRyYWcgPT09IGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVsdGEpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gaXNIb3Jpem9udGFsID8gZGVsdGEueCA6IGRlbHRhLnk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgc3RpbGwgaG92ZXJpbmcgb3ZlciB0aGUgc2FtZSBpdGVtIGFzIGxhc3QgdGltZSwgdGhlaXIgY3Vyc29yIGhhc24ndCBsZWZ0XG4gICAgICAgIC8vIHRoZSBpdGVtIGFmdGVyIHdlIG1hZGUgdGhlIHN3YXAsIGFuZCB0aGV5IGRpZG4ndCBjaGFuZ2UgdGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0aGV5J3JlXG4gICAgICAgIC8vIGRyYWdnaW5nLCB3ZSBkb24ndCBjb25zaWRlciBpdCBhIGRpcmVjdGlvbiBzd2FwLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZHJhZyA9PT0gdGhpcy5fcHJldmlvdXNTd2FwLmRyYWcgJiZcbiAgICAgICAgICB0aGlzLl9wcmV2aW91c1N3YXAub3ZlcmxhcHMgJiZcbiAgICAgICAgICBkaXJlY3Rpb24gPT09IHRoaXMuX3ByZXZpb3VzU3dhcC5kZWx0YVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGlzSG9yaXpvbnRhbFxuICAgICAgICA/IC8vIFJvdW5kIHRoZXNlIGRvd24gc2luY2UgbW9zdCBicm93c2VycyByZXBvcnQgY2xpZW50IHJlY3RzIHdpdGhcbiAgICAgICAgICAvLyBzdWItcGl4ZWwgcHJlY2lzaW9uLCB3aGVyZWFzIHRoZSBwb2ludGVyIGNvb3JkaW5hdGVzIGFyZSByb3VuZGVkIHRvIHBpeGVscy5cbiAgICAgICAgICBwb2ludGVyWCA+PSBNYXRoLmZsb29yKGNsaWVudFJlY3QubGVmdCkgJiYgcG9pbnRlclggPCBNYXRoLmZsb29yKGNsaWVudFJlY3QucmlnaHQpXG4gICAgICAgIDogcG9pbnRlclkgPj0gTWF0aC5mbG9vcihjbGllbnRSZWN0LnRvcCkgJiYgcG9pbnRlclkgPCBNYXRoLmZsb29yKGNsaWVudFJlY3QuYm90dG9tKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBpbmRleCA9PT0gLTEgfHwgIXRoaXMuX3NvcnRQcmVkaWNhdGUoaW5kZXgsIGl0ZW0pID8gLTEgOiBpbmRleDtcbiAgfVxufVxuIl19