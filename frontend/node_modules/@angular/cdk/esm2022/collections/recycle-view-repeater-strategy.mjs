/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { _ViewRepeaterOperation, } from './view-repeater';
/**
 * A repeater that caches views when they are removed from a
 * {@link ViewContainerRef}. When new items are inserted into the container,
 * the repeater will reuse one of the cached views instead of creating a new
 * embedded view. Recycling cached views reduces the quantity of expensive DOM
 * inserts.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export class _RecycleViewRepeaterStrategy {
    constructor() {
        /**
         * The size of the cache used to store unused views.
         * Setting the cache size to `0` will disable caching. Defaults to 20 views.
         */
        this.viewCacheSize = 20;
        /**
         * View cache that stores embedded view instances that have been previously stamped out,
         * but don't are not currently rendered. The view repeater will reuse these views rather than
         * creating brand new ones.
         *
         * TODO(michaeljamesparsons) Investigate whether using a linked list would improve performance.
         */
        this._viewCache = [];
    }
    /** Apply changes to the DOM. */
    applyChanges(changes, viewContainerRef, itemContextFactory, itemValueResolver, itemViewChanged) {
        // Rearrange the views to put them in the right location.
        changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
            let view;
            let operation;
            if (record.previousIndex == null) {
                // Item added.
                const viewArgsFactory = () => itemContextFactory(record, adjustedPreviousIndex, currentIndex);
                view = this._insertView(viewArgsFactory, currentIndex, viewContainerRef, itemValueResolver(record));
                operation = view ? _ViewRepeaterOperation.INSERTED : _ViewRepeaterOperation.REPLACED;
            }
            else if (currentIndex == null) {
                // Item removed.
                this._detachAndCacheView(adjustedPreviousIndex, viewContainerRef);
                operation = _ViewRepeaterOperation.REMOVED;
            }
            else {
                // Item moved.
                view = this._moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, itemValueResolver(record));
                operation = _ViewRepeaterOperation.MOVED;
            }
            if (itemViewChanged) {
                itemViewChanged({
                    context: view?.context,
                    operation,
                    record,
                });
            }
        });
    }
    detach() {
        for (const view of this._viewCache) {
            view.destroy();
        }
        this._viewCache = [];
    }
    /**
     * Inserts a view for a new item, either from the cache or by creating a new
     * one. Returns `undefined` if the item was inserted into a cached view.
     */
    _insertView(viewArgsFactory, currentIndex, viewContainerRef, value) {
        const cachedView = this._insertViewFromCache(currentIndex, viewContainerRef);
        if (cachedView) {
            cachedView.context.$implicit = value;
            return undefined;
        }
        const viewArgs = viewArgsFactory();
        return viewContainerRef.createEmbeddedView(viewArgs.templateRef, viewArgs.context, viewArgs.index);
    }
    /** Detaches the view at the given index and inserts into the view cache. */
    _detachAndCacheView(index, viewContainerRef) {
        const detachedView = viewContainerRef.detach(index);
        this._maybeCacheView(detachedView, viewContainerRef);
    }
    /** Moves view at the previous index to the current index. */
    _moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, value) {
        const view = viewContainerRef.get(adjustedPreviousIndex);
        viewContainerRef.move(view, currentIndex);
        view.context.$implicit = value;
        return view;
    }
    /**
     * Cache the given detached view. If the cache is full, the view will be
     * destroyed.
     */
    _maybeCacheView(view, viewContainerRef) {
        if (this._viewCache.length < this.viewCacheSize) {
            this._viewCache.push(view);
        }
        else {
            const index = viewContainerRef.indexOf(view);
            // The host component could remove views from the container outside of
            // the view repeater. It's unlikely this will occur, but just in case,
            // destroy the view on its own, otherwise destroy it through the
            // container to ensure that all the references are removed.
            if (index === -1) {
                view.destroy();
            }
            else {
                viewContainerRef.remove(index);
            }
        }
    }
    /** Inserts a recycled view from the cache at the given index. */
    _insertViewFromCache(index, viewContainerRef) {
        const cachedView = this._viewCache.pop();
        if (cachedView) {
            viewContainerRef.insert(cachedView, index);
        }
        return cachedView || null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjeWNsZS12aWV3LXJlcGVhdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9yZWN5Y2xlLXZpZXctcmVwZWF0ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBUUgsT0FBTyxFQU9MLHNCQUFzQixHQUN2QixNQUFNLGlCQUFpQixDQUFDO0FBRXpCOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLE9BQU8sNEJBQTRCO0lBQXpDO1FBR0U7OztXQUdHO1FBQ0gsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFFM0I7Ozs7OztXQU1HO1FBQ0ssZUFBVSxHQUF5QixFQUFFLENBQUM7SUEySWhELENBQUM7SUF6SUMsZ0NBQWdDO0lBQ2hDLFlBQVksQ0FDVixPQUEyQixFQUMzQixnQkFBa0MsRUFDbEMsa0JBQTRELEVBQzVELGlCQUF1RCxFQUN2RCxlQUFnRDtRQUVoRCx5REFBeUQ7UUFDekQsT0FBTyxDQUFDLGdCQUFnQixDQUN0QixDQUNFLE1BQStCLEVBQy9CLHFCQUFvQyxFQUNwQyxZQUEyQixFQUMzQixFQUFFO1lBQ0YsSUFBSSxJQUFvQyxDQUFDO1lBQ3pDLElBQUksU0FBaUMsQ0FBQztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2pDLGNBQWM7Z0JBQ2QsTUFBTSxlQUFlLEdBQUcsR0FBRyxFQUFFLENBQzNCLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQ3JCLGVBQWUsRUFDZixZQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUMxQixDQUFDO2dCQUNGLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDO1lBQ3ZGLENBQUM7aUJBQU0sSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2hDLGdCQUFnQjtnQkFDaEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHFCQUFzQixFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ25FLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLENBQUM7WUFDN0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLGNBQWM7Z0JBQ2QsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQ25CLHFCQUFzQixFQUN0QixZQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUMxQixDQUFDO2dCQUNGLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDM0MsQ0FBQztZQUVELElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLGVBQWUsQ0FBQztvQkFDZCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU87b0JBQ3RCLFNBQVM7b0JBQ1QsTUFBTTtpQkFDUCxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTTtRQUNKLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFdBQVcsQ0FDakIsZUFBcUQsRUFDckQsWUFBb0IsRUFDcEIsZ0JBQWtDLEVBQ2xDLEtBQVE7UUFFUixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDOUUsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNmLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUNyQyxPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsZUFBZSxFQUFFLENBQUM7UUFDbkMsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FDeEMsUUFBUSxDQUFDLFdBQVcsRUFDcEIsUUFBUSxDQUFDLE9BQU8sRUFDaEIsUUFBUSxDQUFDLEtBQUssQ0FDZixDQUFDO0lBQ0osQ0FBQztJQUVELDRFQUE0RTtJQUNwRSxtQkFBbUIsQ0FBQyxLQUFhLEVBQUUsZ0JBQWtDO1FBQzNFLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQXVCLENBQUM7UUFDMUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsNkRBQTZEO0lBQ3JELFNBQVMsQ0FDZixxQkFBNkIsRUFDN0IsWUFBb0IsRUFDcEIsZ0JBQWtDLEVBQ2xDLEtBQVE7UUFFUixNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUJBQXNCLENBQXVCLENBQUM7UUFDaEYsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssZUFBZSxDQUFDLElBQXdCLEVBQUUsZ0JBQWtDO1FBQ2xGLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdDLHNFQUFzRTtZQUN0RSxzRUFBc0U7WUFDdEUsZ0VBQWdFO1lBQ2hFLDJEQUEyRDtZQUMzRCxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxpRUFBaUU7SUFDekQsb0JBQW9CLENBQzFCLEtBQWEsRUFDYixnQkFBa0M7UUFFbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2YsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsT0FBTyxVQUFVLElBQUksSUFBSSxDQUFDO0lBQzVCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLFxuICBJdGVyYWJsZUNoYW5nZXMsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgX1ZpZXdSZXBlYXRlcixcbiAgX1ZpZXdSZXBlYXRlckl0ZW1DaGFuZ2VkLFxuICBfVmlld1JlcGVhdGVySXRlbUNvbnRleHQsXG4gIF9WaWV3UmVwZWF0ZXJJdGVtQ29udGV4dEZhY3RvcnksXG4gIF9WaWV3UmVwZWF0ZXJJdGVtSW5zZXJ0QXJncyxcbiAgX1ZpZXdSZXBlYXRlckl0ZW1WYWx1ZVJlc29sdmVyLFxuICBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLFxufSBmcm9tICcuL3ZpZXctcmVwZWF0ZXInO1xuXG4vKipcbiAqIEEgcmVwZWF0ZXIgdGhhdCBjYWNoZXMgdmlld3Mgd2hlbiB0aGV5IGFyZSByZW1vdmVkIGZyb20gYVxuICoge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9LiBXaGVuIG5ldyBpdGVtcyBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgY29udGFpbmVyLFxuICogdGhlIHJlcGVhdGVyIHdpbGwgcmV1c2Ugb25lIG9mIHRoZSBjYWNoZWQgdmlld3MgaW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ld1xuICogZW1iZWRkZWQgdmlldy4gUmVjeWNsaW5nIGNhY2hlZCB2aWV3cyByZWR1Y2VzIHRoZSBxdWFudGl0eSBvZiBleHBlbnNpdmUgRE9NXG4gKiBpbnNlcnRzLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIGZvciB0aGUgZW1iZWRkZWQgdmlldydzICRpbXBsaWNpdCBwcm9wZXJ0eS5cbiAqIEB0ZW1wbGF0ZSBSIFRoZSB0eXBlIGZvciB0aGUgaXRlbSBpbiBlYWNoIEl0ZXJhYmxlRGlmZmVyIGNoYW5nZSByZWNvcmQuXG4gKiBAdGVtcGxhdGUgQyBUaGUgdHlwZSBmb3IgdGhlIGNvbnRleHQgcGFzc2VkIHRvIGVhY2ggZW1iZWRkZWQgdmlldy5cbiAqL1xuZXhwb3J0IGNsYXNzIF9SZWN5Y2xlVmlld1JlcGVhdGVyU3RyYXRlZ3k8VCwgUiwgQyBleHRlbmRzIF9WaWV3UmVwZWF0ZXJJdGVtQ29udGV4dDxUPj5cbiAgaW1wbGVtZW50cyBfVmlld1JlcGVhdGVyPFQsIFIsIEM+XG57XG4gIC8qKlxuICAgKiBUaGUgc2l6ZSBvZiB0aGUgY2FjaGUgdXNlZCB0byBzdG9yZSB1bnVzZWQgdmlld3MuXG4gICAqIFNldHRpbmcgdGhlIGNhY2hlIHNpemUgdG8gYDBgIHdpbGwgZGlzYWJsZSBjYWNoaW5nLiBEZWZhdWx0cyB0byAyMCB2aWV3cy5cbiAgICovXG4gIHZpZXdDYWNoZVNpemU6IG51bWJlciA9IDIwO1xuXG4gIC8qKlxuICAgKiBWaWV3IGNhY2hlIHRoYXQgc3RvcmVzIGVtYmVkZGVkIHZpZXcgaW5zdGFuY2VzIHRoYXQgaGF2ZSBiZWVuIHByZXZpb3VzbHkgc3RhbXBlZCBvdXQsXG4gICAqIGJ1dCBkb24ndCBhcmUgbm90IGN1cnJlbnRseSByZW5kZXJlZC4gVGhlIHZpZXcgcmVwZWF0ZXIgd2lsbCByZXVzZSB0aGVzZSB2aWV3cyByYXRoZXIgdGhhblxuICAgKiBjcmVhdGluZyBicmFuZCBuZXcgb25lcy5cbiAgICpcbiAgICogVE9ETyhtaWNoYWVsamFtZXNwYXJzb25zKSBJbnZlc3RpZ2F0ZSB3aGV0aGVyIHVzaW5nIGEgbGlua2VkIGxpc3Qgd291bGQgaW1wcm92ZSBwZXJmb3JtYW5jZS5cbiAgICovXG4gIHByaXZhdGUgX3ZpZXdDYWNoZTogRW1iZWRkZWRWaWV3UmVmPEM+W10gPSBbXTtcblxuICAvKiogQXBwbHkgY2hhbmdlcyB0byB0aGUgRE9NLiAqL1xuICBhcHBseUNoYW5nZXMoXG4gICAgY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFI+LFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgaXRlbUNvbnRleHRGYWN0b3J5OiBfVmlld1JlcGVhdGVySXRlbUNvbnRleHRGYWN0b3J5PFQsIFIsIEM+LFxuICAgIGl0ZW1WYWx1ZVJlc29sdmVyOiBfVmlld1JlcGVhdGVySXRlbVZhbHVlUmVzb2x2ZXI8VCwgUj4sXG4gICAgaXRlbVZpZXdDaGFuZ2VkPzogX1ZpZXdSZXBlYXRlckl0ZW1DaGFuZ2VkPFIsIEM+LFxuICApIHtcbiAgICAvLyBSZWFycmFuZ2UgdGhlIHZpZXdzIHRvIHB1dCB0aGVtIGluIHRoZSByaWdodCBsb2NhdGlvbi5cbiAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oXG4gICAgICAoXG4gICAgICAgIHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Uj4sXG4gICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgY3VycmVudEluZGV4OiBudW1iZXIgfCBudWxsLFxuICAgICAgKSA9PiB7XG4gICAgICAgIGxldCB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8Qz4gfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBvcGVyYXRpb246IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb247XG4gICAgICAgIGlmIChyZWNvcmQucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gSXRlbSBhZGRlZC5cbiAgICAgICAgICBjb25zdCB2aWV3QXJnc0ZhY3RvcnkgPSAoKSA9PlxuICAgICAgICAgICAgaXRlbUNvbnRleHRGYWN0b3J5KHJlY29yZCwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgIHZpZXcgPSB0aGlzLl9pbnNlcnRWaWV3KFxuICAgICAgICAgICAgdmlld0FyZ3NGYWN0b3J5LFxuICAgICAgICAgICAgY3VycmVudEluZGV4ISxcbiAgICAgICAgICAgIHZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICBpdGVtVmFsdWVSZXNvbHZlcihyZWNvcmQpLFxuICAgICAgICAgICk7XG4gICAgICAgICAgb3BlcmF0aW9uID0gdmlldyA/IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uSU5TRVJURUQgOiBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLlJFUExBQ0VEO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gSXRlbSByZW1vdmVkLlxuICAgICAgICAgIHRoaXMuX2RldGFjaEFuZENhY2hlVmlldyhhZGp1c3RlZFByZXZpb3VzSW5kZXghLCB2aWV3Q29udGFpbmVyUmVmKTtcbiAgICAgICAgICBvcGVyYXRpb24gPSBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLlJFTU9WRUQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSXRlbSBtb3ZlZC5cbiAgICAgICAgICB2aWV3ID0gdGhpcy5fbW92ZVZpZXcoXG4gICAgICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXghLFxuICAgICAgICAgICAgY3VycmVudEluZGV4ISxcbiAgICAgICAgICAgIHZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICBpdGVtVmFsdWVSZXNvbHZlcihyZWNvcmQpLFxuICAgICAgICAgICk7XG4gICAgICAgICAgb3BlcmF0aW9uID0gX1ZpZXdSZXBlYXRlck9wZXJhdGlvbi5NT1ZFRDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpdGVtVmlld0NoYW5nZWQpIHtcbiAgICAgICAgICBpdGVtVmlld0NoYW5nZWQoe1xuICAgICAgICAgICAgY29udGV4dDogdmlldz8uY29udGV4dCxcbiAgICAgICAgICAgIG9wZXJhdGlvbixcbiAgICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIGZvciAoY29uc3QgdmlldyBvZiB0aGlzLl92aWV3Q2FjaGUpIHtcbiAgICAgIHZpZXcuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl92aWV3Q2FjaGUgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnRzIGEgdmlldyBmb3IgYSBuZXcgaXRlbSwgZWl0aGVyIGZyb20gdGhlIGNhY2hlIG9yIGJ5IGNyZWF0aW5nIGEgbmV3XG4gICAqIG9uZS4gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB0aGUgaXRlbSB3YXMgaW5zZXJ0ZWQgaW50byBhIGNhY2hlZCB2aWV3LlxuICAgKi9cbiAgcHJpdmF0ZSBfaW5zZXJ0VmlldyhcbiAgICB2aWV3QXJnc0ZhY3Rvcnk6ICgpID0+IF9WaWV3UmVwZWF0ZXJJdGVtSW5zZXJ0QXJnczxDPixcbiAgICBjdXJyZW50SW5kZXg6IG51bWJlcixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHZhbHVlOiBULFxuICApOiBFbWJlZGRlZFZpZXdSZWY8Qz4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNhY2hlZFZpZXcgPSB0aGlzLl9pbnNlcnRWaWV3RnJvbUNhY2hlKGN1cnJlbnRJbmRleCEsIHZpZXdDb250YWluZXJSZWYpO1xuICAgIGlmIChjYWNoZWRWaWV3KSB7XG4gICAgICBjYWNoZWRWaWV3LmNvbnRleHQuJGltcGxpY2l0ID0gdmFsdWU7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdBcmdzID0gdmlld0FyZ3NGYWN0b3J5KCk7XG4gICAgcmV0dXJuIHZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgdmlld0FyZ3MudGVtcGxhdGVSZWYsXG4gICAgICB2aWV3QXJncy5jb250ZXh0LFxuICAgICAgdmlld0FyZ3MuaW5kZXgsXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBEZXRhY2hlcyB0aGUgdmlldyBhdCB0aGUgZ2l2ZW4gaW5kZXggYW5kIGluc2VydHMgaW50byB0aGUgdmlldyBjYWNoZS4gKi9cbiAgcHJpdmF0ZSBfZGV0YWNoQW5kQ2FjaGVWaWV3KGluZGV4OiBudW1iZXIsIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcbiAgICBjb25zdCBkZXRhY2hlZFZpZXcgPSB2aWV3Q29udGFpbmVyUmVmLmRldGFjaChpbmRleCkgYXMgRW1iZWRkZWRWaWV3UmVmPEM+O1xuICAgIHRoaXMuX21heWJlQ2FjaGVWaWV3KGRldGFjaGVkVmlldywgdmlld0NvbnRhaW5lclJlZik7XG4gIH1cblxuICAvKiogTW92ZXMgdmlldyBhdCB0aGUgcHJldmlvdXMgaW5kZXggdG8gdGhlIGN1cnJlbnQgaW5kZXguICovXG4gIHByaXZhdGUgX21vdmVWaWV3KFxuICAgIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLFxuICAgIGN1cnJlbnRJbmRleDogbnVtYmVyLFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgdmFsdWU6IFQsXG4gICk6IEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgY29uc3QgdmlldyA9IHZpZXdDb250YWluZXJSZWYuZ2V0KGFkanVzdGVkUHJldmlvdXNJbmRleCEpIGFzIEVtYmVkZGVkVmlld1JlZjxDPjtcbiAgICB2aWV3Q29udGFpbmVyUmVmLm1vdmUodmlldywgY3VycmVudEluZGV4KTtcbiAgICB2aWV3LmNvbnRleHQuJGltcGxpY2l0ID0gdmFsdWU7XG4gICAgcmV0dXJuIHZpZXc7XG4gIH1cblxuICAvKipcbiAgICogQ2FjaGUgdGhlIGdpdmVuIGRldGFjaGVkIHZpZXcuIElmIHRoZSBjYWNoZSBpcyBmdWxsLCB0aGUgdmlldyB3aWxsIGJlXG4gICAqIGRlc3Ryb3llZC5cbiAgICovXG4gIHByaXZhdGUgX21heWJlQ2FjaGVWaWV3KHZpZXc6IEVtYmVkZGVkVmlld1JlZjxDPiwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIGlmICh0aGlzLl92aWV3Q2FjaGUubGVuZ3RoIDwgdGhpcy52aWV3Q2FjaGVTaXplKSB7XG4gICAgICB0aGlzLl92aWV3Q2FjaGUucHVzaCh2aWV3KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSB2aWV3Q29udGFpbmVyUmVmLmluZGV4T2Yodmlldyk7XG5cbiAgICAgIC8vIFRoZSBob3N0IGNvbXBvbmVudCBjb3VsZCByZW1vdmUgdmlld3MgZnJvbSB0aGUgY29udGFpbmVyIG91dHNpZGUgb2ZcbiAgICAgIC8vIHRoZSB2aWV3IHJlcGVhdGVyLiBJdCdzIHVubGlrZWx5IHRoaXMgd2lsbCBvY2N1ciwgYnV0IGp1c3QgaW4gY2FzZSxcbiAgICAgIC8vIGRlc3Ryb3kgdGhlIHZpZXcgb24gaXRzIG93biwgb3RoZXJ3aXNlIGRlc3Ryb3kgaXQgdGhyb3VnaCB0aGVcbiAgICAgIC8vIGNvbnRhaW5lciB0byBlbnN1cmUgdGhhdCBhbGwgdGhlIHJlZmVyZW5jZXMgYXJlIHJlbW92ZWQuXG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHZpZXcuZGVzdHJveSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmlld0NvbnRhaW5lclJlZi5yZW1vdmUoaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBJbnNlcnRzIGEgcmVjeWNsZWQgdmlldyBmcm9tIHRoZSBjYWNoZSBhdCB0aGUgZ2l2ZW4gaW5kZXguICovXG4gIHByaXZhdGUgX2luc2VydFZpZXdGcm9tQ2FjaGUoXG4gICAgaW5kZXg6IG51bWJlcixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICApOiBFbWJlZGRlZFZpZXdSZWY8Qz4gfCBudWxsIHtcbiAgICBjb25zdCBjYWNoZWRWaWV3ID0gdGhpcy5fdmlld0NhY2hlLnBvcCgpO1xuICAgIGlmIChjYWNoZWRWaWV3KSB7XG4gICAgICB2aWV3Q29udGFpbmVyUmVmLmluc2VydChjYWNoZWRWaWV3LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBjYWNoZWRWaWV3IHx8IG51bGw7XG4gIH1cbn1cbiJdfQ==