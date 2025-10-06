/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { _getShadowRoot } from '@angular/cdk/platform';
import { moveItemInArray } from '../drag-utils';
/**
 * Strategy that only supports sorting on a list that might wrap.
 * Items are reordered by moving their DOM nodes around.
 * @docs-private
 */
export class MixedSortStrategy {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4ZWQtc29ydC1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL3NvcnRpbmcvbWl4ZWQtc29ydC1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUs5Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQW1DNUIsWUFDVSxTQUFtQixFQUNuQixpQkFBbUM7UUFEbkMsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBcEI3Qzs7OztXQUlHO1FBQ0ssa0JBQWEsR0FBRztZQUN0QixJQUFJLEVBQUUsSUFBc0I7WUFDNUIsTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLEVBQUUsQ0FBQztZQUNULFFBQVEsRUFBRSxLQUFLO1NBQ2hCLENBQUM7UUFFRjs7O1dBR0c7UUFDSyxrQkFBYSxHQUE2QyxFQUFFLENBQUM7SUFLbEUsQ0FBQztJQUVKOzs7T0FHRztJQUNILEtBQUssQ0FBQyxLQUF5QjtRQUM3QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUM1QyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUV4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNDLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztR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QixFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRXhELElBQUksUUFBUSxHQUFHLFdBQVcsRUFBRSxDQUFDO29CQUMzQixXQUFXLEdBQUcsUUFBUSxDQUFDO29CQUN2QixRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge19nZXRTaGFkb3dSb290fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHttb3ZlSXRlbUluQXJyYXl9IGZyb20gJy4uL2RyYWctdXRpbHMnO1xuaW1wb3J0IHtEcm9wTGlzdFNvcnRTdHJhdGVneSwgU29ydFByZWRpY2F0ZX0gZnJvbSAnLi9kcm9wLWxpc3Qtc29ydC1zdHJhdGVneSc7XG5pbXBvcnQge0RyYWdEcm9wUmVnaXN0cnl9IGZyb20gJy4uL2RyYWctZHJvcC1yZWdpc3RyeSc7XG5pbXBvcnQgdHlwZSB7RHJhZ1JlZn0gZnJvbSAnLi4vZHJhZy1yZWYnO1xuXG4vKipcbiAqIFN0cmF0ZWd5IHRoYXQgb25seSBzdXBwb3J0cyBzb3J0aW5nIG9uIGEgbGlzdCB0aGF0IG1pZ2h0IHdyYXAuXG4gKiBJdGVtcyBhcmUgcmVvcmRlcmVkIGJ5IG1vdmluZyB0aGVpciBET00gbm9kZXMgYXJvdW5kLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgTWl4ZWRTb3J0U3RyYXRlZ3kgaW1wbGVtZW50cyBEcm9wTGlzdFNvcnRTdHJhdGVneSB7XG4gIC8qKiBSb290IGVsZW1lbnQgY29udGFpbmVyIG9mIHRoZSBkcm9wIGxpc3QuICovXG4gIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGRldGVybWluZSBpZiBhbiBpdGVtIGNhbiBiZSBzb3J0ZWQgaW50byBhIHNwZWNpZmljIGluZGV4LiAqL1xuICBwcml2YXRlIF9zb3J0UHJlZGljYXRlOiBTb3J0UHJlZGljYXRlPERyYWdSZWY+O1xuXG4gIC8qKiBMYXppbHktcmVzb2x2ZWQgcm9vdCBub2RlIGNvbnRhaW5pbmcgdGhlIGxpc3QuIFVzZSBgX2dldFJvb3ROb2RlYCB0byByZWFkIHRoaXMuICovXG4gIHByaXZhdGUgX3Jvb3ROb2RlOiBEb2N1bWVudE9yU2hhZG93Um9vdCB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogRHJhZ2dhYmxlIGl0ZW1zIHRoYXQgYXJlIGN1cnJlbnRseSBhY3RpdmUgaW5zaWRlIHRoZSBjb250YWluZXIuIEluY2x1ZGVzIHRoZSBpdGVtc1xuICAgKiB0aGF0IHdlcmUgdGhlcmUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZXF1ZW5jZSwgYXMgd2VsbCBhcyBhbnkgaXRlbXMgdGhhdCBoYXZlIGJlZW4gZHJhZ2dlZFxuICAgKiBpbiwgYnV0IGhhdmVuJ3QgYmVlbiBkcm9wcGVkIHlldC5cbiAgICovXG4gIHByaXZhdGUgX2FjdGl2ZUl0ZW1zOiBEcmFnUmVmW107XG5cbiAgLyoqXG4gICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBpdGVtIHRoYXQgd2FzIGxhc3Qgc3dhcHBlZCB3aXRoIHRoZSBkcmFnZ2VkIGl0ZW0sIGFzIHdlbGwgYXMgd2hhdCBkaXJlY3Rpb25cbiAgICogdGhlIHBvaW50ZXIgd2FzIG1vdmluZyBpbiB3aGVuIHRoZSBzd2FwIG9jY3VycmVkIGFuZCB3aGV0aGVyIHRoZSB1c2VyJ3MgcG9pbnRlciBjb250aW51ZWQgdG9cbiAgICogb3ZlcmxhcCB3aXRoIHRoZSBzd2FwcGVkIGl0ZW0gYWZ0ZXIgdGhlIHN3YXBwaW5nIG9jY3VycmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcHJldmlvdXNTd2FwID0ge1xuICAgIGRyYWc6IG51bGwgYXMgRHJhZ1JlZiB8IG51bGwsXG4gICAgZGVsdGFYOiAwLFxuICAgIGRlbHRhWTogMCxcbiAgICBvdmVybGFwczogZmFsc2UsXG4gIH07XG5cbiAgLyoqXG4gICAqIEtlZXBzIHRyYWNrIG9mIHRoZSByZWxhdGlvbnNoaXAgYmV0d2VlbiBhIG5vZGUgYW5kIGl0cyBuZXh0IHNpYmxpbmcuIFRoaXMgaW5mb3JtYXRpb25cbiAgICogaXMgdXNlZCB0byByZXN0b3JlIHRoZSBET00gdG8gdGhlIG9yZGVyIGl0IHdhcyBpbiBiZWZvcmUgZHJhZ2dpbmcgc3RhcnRlZC5cbiAgICovXG4gIHByaXZhdGUgX3JlbGF0ZWROb2RlczogW25vZGU6IE5vZGUsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbF1bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgICBwcml2YXRlIF9kcmFnRHJvcFJlZ2lzdHJ5OiBEcmFnRHJvcFJlZ2lzdHJ5LFxuICApIHt9XG5cbiAgLyoqXG4gICAqIFRvIGJlIGNhbGxlZCB3aGVuIHRoZSBkcmFnIHNlcXVlbmNlIHN0YXJ0cy5cbiAgICogQHBhcmFtIGl0ZW1zIEl0ZW1zIHRoYXQgYXJlIGN1cnJlbnRseSBpbiB0aGUgbGlzdC5cbiAgICovXG4gIHN0YXJ0KGl0ZW1zOiByZWFkb25seSBEcmFnUmVmW10pOiB2b2lkIHtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gdGhpcy5fZWxlbWVudC5jaGlsZE5vZGVzO1xuICAgIHRoaXMuX3JlbGF0ZWROb2RlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlID0gY2hpbGROb2Rlc1tpXTtcbiAgICAgIHRoaXMuX3JlbGF0ZWROb2Rlcy5wdXNoKFtub2RlLCBub2RlLm5leHRTaWJsaW5nXSk7XG4gICAgfVxuXG4gICAgdGhpcy53aXRoSXRlbXMoaXRlbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvIGJlIGNhbGxlZCB3aGVuIGFuIGl0ZW0gaXMgYmVpbmcgc29ydGVkLlxuICAgKiBAcGFyYW0gaXRlbSBJdGVtIHRvIGJlIHNvcnRlZC5cbiAgICogQHBhcmFtIHBvaW50ZXJYIFBvc2l0aW9uIG9mIHRoZSBpdGVtIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWSBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlckRlbHRhIERpcmVjdGlvbiBpbiB3aGljaCB0aGUgcG9pbnRlciBpcyBtb3ZpbmcgYWxvbmcgZWFjaCBheGlzLlxuICAgKi9cbiAgc29ydChcbiAgICBpdGVtOiBEcmFnUmVmLFxuICAgIHBvaW50ZXJYOiBudW1iZXIsXG4gICAgcG9pbnRlclk6IG51bWJlcixcbiAgICBwb2ludGVyRGVsdGE6IHt4OiBudW1iZXI7IHk6IG51bWJlcn0sXG4gICk6IHtwcmV2aW91c0luZGV4OiBudW1iZXI7IGN1cnJlbnRJbmRleDogbnVtYmVyfSB8IG51bGwge1xuICAgIGNvbnN0IG5ld0luZGV4ID0gdGhpcy5fZ2V0SXRlbUluZGV4RnJvbVBvaW50ZXJQb3NpdGlvbihpdGVtLCBwb2ludGVyWCwgcG9pbnRlclkpO1xuICAgIGNvbnN0IHByZXZpb3VzU3dhcCA9IHRoaXMuX3ByZXZpb3VzU3dhcDtcblxuICAgIGlmIChuZXdJbmRleCA9PT0gLTEgfHwgdGhpcy5fYWN0aXZlSXRlbXNbbmV3SW5kZXhdID09PSBpdGVtKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB0b1N3YXBXaXRoID0gdGhpcy5fYWN0aXZlSXRlbXNbbmV3SW5kZXhdO1xuXG4gICAgLy8gUHJldmVudCB0b28gbWFueSBzd2FwcyBvdmVyIHRoZSBzYW1lIGl0ZW0uXG4gICAgaWYgKFxuICAgICAgcHJldmlvdXNTd2FwLmRyYWcgPT09IHRvU3dhcFdpdGggJiZcbiAgICAgIHByZXZpb3VzU3dhcC5vdmVybGFwcyAmJlxuICAgICAgcHJldmlvdXNTd2FwLmRlbHRhWCA9PT0gcG9pbnRlckRlbHRhLnggJiZcbiAgICAgIHByZXZpb3VzU3dhcC5kZWx0YVkgPT09IHBvaW50ZXJEZWx0YS55XG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c0luZGV4ID0gdGhpcy5nZXRJdGVtSW5kZXgoaXRlbSk7XG4gICAgY29uc3QgY3VycmVudCA9IGl0ZW0uZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCk7XG4gICAgY29uc3Qgb3ZlcmxhcEVsZW1lbnQgPSB0b1N3YXBXaXRoLmdldFJvb3RFbGVtZW50KCk7XG5cbiAgICBpZiAobmV3SW5kZXggPiBwcmV2aW91c0luZGV4KSB7XG4gICAgICBvdmVybGFwRWxlbWVudC5hZnRlcihjdXJyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3ZlcmxhcEVsZW1lbnQuYmVmb3JlKGN1cnJlbnQpO1xuICAgIH1cblxuICAgIG1vdmVJdGVtSW5BcnJheSh0aGlzLl9hY3RpdmVJdGVtcywgcHJldmlvdXNJbmRleCwgbmV3SW5kZXgpO1xuXG4gICAgY29uc3QgbmV3T3ZlcmxhcEVsZW1lbnQgPSB0aGlzLl9nZXRSb290Tm9kZSgpLmVsZW1lbnRGcm9tUG9pbnQocG9pbnRlclgsIHBvaW50ZXJZKTtcbiAgICAvLyBOb3RlOiBpdCdzIHRlbXB0aW5nIHRvIHNhdmUgdGhlIGVudGlyZSBgcG9pbnRlckRlbHRhYCBvYmplY3QgaGVyZSwgaG93ZXZlciB0aGF0J2xsXG4gICAgLy8gYnJlYWsgdGhpcyBmdW5jdGlvbmFsaXR5LCBiZWNhdXNlIHRoZSBzYW1lIG9iamVjdCBpcyBwYXNzZWQgZm9yIGFsbCBgc29ydGAgY2FsbHMuXG4gICAgcHJldmlvdXNTd2FwLmRlbHRhWCA9IHBvaW50ZXJEZWx0YS54O1xuICAgIHByZXZpb3VzU3dhcC5kZWx0YVkgPSBwb2ludGVyRGVsdGEueTtcbiAgICBwcmV2aW91c1N3YXAuZHJhZyA9IHRvU3dhcFdpdGg7XG4gICAgcHJldmlvdXNTd2FwLm92ZXJsYXBzID1cbiAgICAgIG92ZXJsYXBFbGVtZW50ID09PSBuZXdPdmVybGFwRWxlbWVudCB8fCBvdmVybGFwRWxlbWVudC5jb250YWlucyhuZXdPdmVybGFwRWxlbWVudCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJldmlvdXNJbmRleCxcbiAgICAgIGN1cnJlbnRJbmRleDogbmV3SW5kZXgsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhbiBpdGVtIGlzIGJlaW5nIG1vdmVkIGludG8gdGhlIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0aGF0IHdhcyBtb3ZlZCBpbnRvIHRoZSBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb2ludGVyWCBQb3NpdGlvbiBvZiB0aGUgaXRlbSBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIGl0ZW0gYWxvbmcgdGhlIFkgYXhpcy5cbiAgICogQHBhcmFtIGluZGV4IEluZGV4IGF0IHdoaWNoIHRoZSBpdGVtIGVudGVyZWQuIElmIG9taXR0ZWQsIHRoZSBjb250YWluZXIgd2lsbCB0cnkgdG8gZmlndXJlIGl0XG4gICAqICAgb3V0IGF1dG9tYXRpY2FsbHkuXG4gICAqL1xuICBlbnRlcihpdGVtOiBEcmFnUmVmLCBwb2ludGVyWDogbnVtYmVyLCBwb2ludGVyWTogbnVtYmVyLCBpbmRleD86IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBlbnRlckluZGV4ID1cbiAgICAgIGluZGV4ID09IG51bGwgfHwgaW5kZXggPCAwXG4gICAgICAgID8gdGhpcy5fZ2V0SXRlbUluZGV4RnJvbVBvaW50ZXJQb3NpdGlvbihpdGVtLCBwb2ludGVyWCwgcG9pbnRlclkpXG4gICAgICAgIDogaW5kZXg7XG5cbiAgICAvLyBJbiBzb21lIGNhc2VzIChlLmcuIHdoZW4gdGhlIGNvbnRhaW5lciBoYXMgcGFkZGluZykgd2UgbWlnaHQgbm90IGJlIGFibGUgdG8gZmlndXJlXG4gICAgLy8gb3V0IHdoaWNoIGl0ZW0gdG8gaW5zZXJ0IHRoZSBkcmFnZ2VkIGl0ZW0gbmV4dCB0bywgYmVjYXVzZSB0aGUgcG9pbnRlciBkaWRuJ3Qgb3ZlcmxhcFxuICAgIC8vIHdpdGggYW55dGhpbmcuIEluIHRoYXQgY2FzZSB3ZSBmaW5kIHRoZSBpdGVtIHRoYXQncyBjbG9zZXN0IHRvIHRoZSBwb2ludGVyLlxuICAgIGlmIChlbnRlckluZGV4ID09PSAtMSkge1xuICAgICAgZW50ZXJJbmRleCA9IHRoaXMuX2dldENsb3Nlc3RJdGVtSW5kZXhUb1BvaW50ZXIoaXRlbSwgcG9pbnRlclgsIHBvaW50ZXJZKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdGhpcy5fYWN0aXZlSXRlbXNbZW50ZXJJbmRleF0gYXMgRHJhZ1JlZiB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSB0aGlzLl9hY3RpdmVJdGVtcy5pbmRleE9mKGl0ZW0pO1xuXG4gICAgaWYgKGN1cnJlbnRJbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLl9hY3RpdmVJdGVtcy5zcGxpY2UoY3VycmVudEluZGV4LCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0SXRlbSAmJiAhdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5pc0RyYWdnaW5nKHRhcmdldEl0ZW0pKSB7XG4gICAgICB0aGlzLl9hY3RpdmVJdGVtcy5zcGxpY2UoZW50ZXJJbmRleCwgMCwgaXRlbSk7XG4gICAgICB0YXJnZXRJdGVtLmdldFJvb3RFbGVtZW50KCkuYmVmb3JlKGl0ZW0uZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hY3RpdmVJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChpdGVtLmdldFBsYWNlaG9sZGVyRWxlbWVudCgpKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgaXRlbXMgdGhhdCBhcmUgY3VycmVudGx5IHBhcnQgb2YgdGhlIGxpc3QuICovXG4gIHdpdGhJdGVtcyhpdGVtczogcmVhZG9ubHkgRHJhZ1JlZltdKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZlSXRlbXMgPSBpdGVtcy5zbGljZSgpO1xuICB9XG5cbiAgLyoqIEFzc2lnbnMgYSBzb3J0IHByZWRpY2F0ZSB0byB0aGUgc3RyYXRlZ3kuICovXG4gIHdpdGhTb3J0UHJlZGljYXRlKHByZWRpY2F0ZTogU29ydFByZWRpY2F0ZTxEcmFnUmVmPik6IHZvaWQge1xuICAgIHRoaXMuX3NvcnRQcmVkaWNhdGUgPSBwcmVkaWNhdGU7XG4gIH1cblxuICAvKiogUmVzZXRzIHRoZSBzdHJhdGVneSB0byBpdHMgaW5pdGlhbCBzdGF0ZSBiZWZvcmUgZHJhZ2dpbmcgd2FzIHN0YXJ0ZWQuICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3QgPSB0aGlzLl9lbGVtZW50O1xuICAgIGNvbnN0IHByZXZpb3VzU3dhcCA9IHRoaXMuX3ByZXZpb3VzU3dhcDtcblxuICAgIC8vIE1vdmluZyBlbGVtZW50cyBhcm91bmQgaW4gdGhlIERPTSBjYW4gYnJlYWsgdGhpbmdzIGxpa2UgdGhlIGBAZm9yYCBsb29wLCBiZWNhdXNlIGl0XG4gICAgLy8gdXNlcyBjb21tZW50IG5vZGVzIHRvIGtub3cgd2hlcmUgdG8gaW5zZXJ0IGVsZW1lbnRzLiBUbyBhdm9pZCBzdWNoIGlzc3Vlcywgd2UgcmVzdG9yZVxuICAgIC8vIHRoZSBET00gbm9kZXMgaW4gdGhlIGxpc3QgdG8gdGhlaXIgb3JpZ2luYWwgb3JkZXIgd2hlbiB0aGUgbGlzdCBpcyByZXNldC5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBjb3VsZCBiZSBzaW1wbGVyIGlmIHdlIGp1c3Qgc2F2ZWQgYWxsIHRoZSBub2RlcywgY2xlYXJlZCB0aGUgcm9vdFxuICAgIC8vIGFuZCB0aGVuIGFwcGVuZGVkIHRoZW0gaW4gdGhlIG9yaWdpbmFsIG9yZGVyLiBXZSBkb24ndCBkbyBpdCwgYmVjYXVzZSBpdCBjYW4gYnJlYWtcbiAgICAvLyBkb3duIGRlcGVuZGluZyBvbiB3aGVuIHRoZSBzbmFwc2hvdCB3YXMgdGFrZW4uIEUuZy4gd2UgbWF5IGVuZCB1cCBzbmFwc2hvdHRpbmcgdGhlXG4gICAgLy8gcGxhY2Vob2xkZXIgZWxlbWVudCB3aGljaCBpcyByZW1vdmVkIGFmdGVyIGRyYWdnaW5nLlxuICAgIGZvciAobGV0IGkgPSB0aGlzLl9yZWxhdGVkTm9kZXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgIGNvbnN0IFtub2RlLCBuZXh0U2libGluZ10gPSB0aGlzLl9yZWxhdGVkTm9kZXNbaV07XG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlID09PSByb290ICYmIG5vZGUubmV4dFNpYmxpbmcgIT09IG5leHRTaWJsaW5nKSB7XG4gICAgICAgIGlmIChuZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dFNpYmxpbmcucGFyZW50Tm9kZSA9PT0gcm9vdCkge1xuICAgICAgICAgIHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHRTaWJsaW5nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3JlbGF0ZWROb2RlcyA9IFtdO1xuICAgIHRoaXMuX2FjdGl2ZUl0ZW1zID0gW107XG4gICAgcHJldmlvdXNTd2FwLmRyYWcgPSBudWxsO1xuICAgIHByZXZpb3VzU3dhcC5kZWx0YVggPSBwcmV2aW91c1N3YXAuZGVsdGFZID0gMDtcbiAgICBwcmV2aW91c1N3YXAub3ZlcmxhcHMgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc25hcHNob3Qgb2YgaXRlbXMgY3VycmVudGx5IGluIHRoZSBsaXN0LlxuICAgKiBDYW4gaW5jbHVkZSBpdGVtcyB0aGF0IHdlIGRyYWdnZWQgaW4gZnJvbSBhbm90aGVyIGxpc3QuXG4gICAqL1xuICBnZXRBY3RpdmVJdGVtc1NuYXBzaG90KCk6IHJlYWRvbmx5IERyYWdSZWZbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUl0ZW1zO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGluZGV4IG9mIGEgc3BlY2lmaWMgaXRlbS4gKi9cbiAgZ2V0SXRlbUluZGV4KGl0ZW06IERyYWdSZWYpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVJdGVtcy5pbmRleE9mKGl0ZW0pO1xuICB9XG5cbiAgLyoqIFVzZWQgdG8gbm90aWZ5IHRoZSBzdHJhdGVneSB0aGF0IHRoZSBzY3JvbGwgcG9zaXRpb24gaGFzIGNoYW5nZWQuICovXG4gIHVwZGF0ZU9uU2Nyb2xsKCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2ZUl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAodGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5pc0RyYWdnaW5nKGl0ZW0pKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gcmUtc29ydCB0aGUgaXRlbSBtYW51YWxseSwgYmVjYXVzZSB0aGUgcG9pbnRlciBtb3ZlXG4gICAgICAgIC8vIGV2ZW50cyB3b24ndCBiZSBkaXNwYXRjaGVkIHdoaWxlIHRoZSB1c2VyIGlzIHNjcm9sbGluZy5cbiAgICAgICAgaXRlbS5fc29ydEZyb21MYXN0UG9pbnRlclBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB3aXRoRWxlbWVudENvbnRhaW5lcihjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKGNvbnRhaW5lciAhPT0gdGhpcy5fZWxlbWVudCkge1xuICAgICAgdGhpcy5fZWxlbWVudCA9IGNvbnRhaW5lcjtcbiAgICAgIHRoaXMuX3Jvb3ROb2RlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbmRleCBvZiBhbiBpdGVtIGluIHRoZSBkcm9wIGNvbnRhaW5lciwgYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlci5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0aGF0IGlzIGJlaW5nIHNvcnRlZC5cbiAgICogQHBhcmFtIHBvaW50ZXJYIFBvc2l0aW9uIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBhbG9uZyB0aGUgWCBheGlzLlxuICAgKiBAcGFyYW0gcG9pbnRlclkgUG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyIGFsb25nIHRoZSBZIGF4aXMuXG4gICAqIEBwYXJhbSBkZWx0YSBEaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHVzZXIgaXMgbW92aW5nIHRoZWlyIHBvaW50ZXIuXG4gICAqL1xuICBwcml2YXRlIF9nZXRJdGVtSW5kZXhGcm9tUG9pbnRlclBvc2l0aW9uKFxuICAgIGl0ZW06IERyYWdSZWYsXG4gICAgcG9pbnRlclg6IG51bWJlcixcbiAgICBwb2ludGVyWTogbnVtYmVyLFxuICApOiBudW1iZXIge1xuICAgIGNvbnN0IGVsZW1lbnRBdFBvaW50ID0gdGhpcy5fZ2V0Um9vdE5vZGUoKS5lbGVtZW50RnJvbVBvaW50KFxuICAgICAgTWF0aC5mbG9vcihwb2ludGVyWCksXG4gICAgICBNYXRoLmZsb29yKHBvaW50ZXJZKSxcbiAgICApO1xuICAgIGNvbnN0IGluZGV4ID0gZWxlbWVudEF0UG9pbnRcbiAgICAgID8gdGhpcy5fYWN0aXZlSXRlbXMuZmluZEluZGV4KGl0ZW0gPT4ge1xuICAgICAgICAgIGNvbnN0IHJvb3QgPSBpdGVtLmdldFJvb3RFbGVtZW50KCk7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnRBdFBvaW50ID09PSByb290IHx8IHJvb3QuY29udGFpbnMoZWxlbWVudEF0UG9pbnQpO1xuICAgICAgICB9KVxuICAgICAgOiAtMTtcbiAgICByZXR1cm4gaW5kZXggPT09IC0xIHx8ICF0aGlzLl9zb3J0UHJlZGljYXRlKGluZGV4LCBpdGVtKSA/IC0xIDogaW5kZXg7XG4gIH1cblxuICAvKiogTGF6aWx5IHJlc29sdmVzIHRoZSBsaXN0J3Mgcm9vdCBub2RlLiAqL1xuICBwcml2YXRlIF9nZXRSb290Tm9kZSgpOiBEb2N1bWVudE9yU2hhZG93Um9vdCB7XG4gICAgLy8gUmVzb2x2ZSB0aGUgcm9vdCBub2RlIGxhemlseSB0byBlbnN1cmUgdGhhdCB0aGUgZHJvcCBsaXN0IGlzIGluIGl0cyBmaW5hbCBwbGFjZSBpbiB0aGUgRE9NLlxuICAgIGlmICghdGhpcy5fcm9vdE5vZGUpIHtcbiAgICAgIHRoaXMuX3Jvb3ROb2RlID0gX2dldFNoYWRvd1Jvb3QodGhpcy5fZWxlbWVudCkgfHwgdGhpcy5fZG9jdW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yb290Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgaW5kZXggb2YgdGhlIGl0ZW0gdGhhdCdzIGNsb3Nlc3QgdG8gdGhlIGl0ZW0gYmVpbmcgZHJhZ2dlZC5cbiAgICogQHBhcmFtIGl0ZW0gSXRlbSBiZWluZyBkcmFnZ2VkLlxuICAgKiBAcGFyYW0gcG9pbnRlclggUG9zaXRpb24gb2YgdGhlIHVzZXIncyBwb2ludGVyIGFsb25nIHRoZSBYIGF4aXMuXG4gICAqIEBwYXJhbSBwb2ludGVyWSBQb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgYWxvbmcgdGhlIFkgYXhpcy5cbiAgICovXG4gIHByaXZhdGUgX2dldENsb3Nlc3RJdGVtSW5kZXhUb1BvaW50ZXIoaXRlbTogRHJhZ1JlZiwgcG9pbnRlclg6IG51bWJlciwgcG9pbnRlclk6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZUl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9hY3RpdmVJdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGxldCBtaW5EaXN0YW5jZSA9IEluZmluaXR5O1xuICAgIGxldCBtaW5JbmRleCA9IC0xO1xuXG4gICAgLy8gRmluZCB0aGUgRXVjbGlkZWFuIGRpc3RhbmNlIChodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FdWNsaWRlYW5fZGlzdGFuY2UpIGJldHdlZW4gZWFjaFxuICAgIC8vIGl0ZW0gYW5kIHRoZSBwb2ludGVyLCBhbmQgcmV0dXJuIHRoZSBzbWFsbGVzdCBvbmUuIE5vdGUgdGhhdCB0aGlzIGlzIGEgYml0IGZsYXdlZCBpbiB0aGF0IERPTVxuICAgIC8vIG5vZGVzIGFyZSByZWN0YW5nbGVzLCBub3QgcG9pbnRzLCBzbyB3ZSB1c2UgdGhlIHRvcC9sZWZ0IGNvb3JkaW5hdGVzLiBJdCBzaG91bGQgYmUgZW5vdWdoXG4gICAgLy8gZm9yIG91ciBwdXJwb3Nlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2FjdGl2ZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5fYWN0aXZlSXRlbXNbaV07XG4gICAgICBpZiAoY3VycmVudCAhPT0gaXRlbSkge1xuICAgICAgICBjb25zdCB7eCwgeX0gPSBjdXJyZW50LmdldFJvb3RFbGVtZW50KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5oeXBvdChwb2ludGVyWCAtIHgsIHBvaW50ZXJZIC0geSk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWluRGlzdGFuY2UpIHtcbiAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIG1pbkluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtaW5JbmRleDtcbiAgfVxufVxuIl19