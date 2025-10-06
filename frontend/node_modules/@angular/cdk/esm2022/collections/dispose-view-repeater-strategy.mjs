/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { _ViewRepeaterOperation, } from './view-repeater';
/**
 * A repeater that destroys views when they are removed from a
 * {@link ViewContainerRef}. When new items are inserted into the container,
 * the repeater will always construct a new embedded view for each item.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export class _DisposeViewRepeaterStrategy {
    applyChanges(changes, viewContainerRef, itemContextFactory, itemValueResolver, itemViewChanged) {
        changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
            let view;
            let operation;
            if (record.previousIndex == null) {
                const insertContext = itemContextFactory(record, adjustedPreviousIndex, currentIndex);
                view = viewContainerRef.createEmbeddedView(insertContext.templateRef, insertContext.context, insertContext.index);
                operation = _ViewRepeaterOperation.INSERTED;
            }
            else if (currentIndex == null) {
                viewContainerRef.remove(adjustedPreviousIndex);
                operation = _ViewRepeaterOperation.REMOVED;
            }
            else {
                view = viewContainerRef.get(adjustedPreviousIndex);
                viewContainerRef.move(view, currentIndex);
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
    detach() { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcG9zZS12aWV3LXJlcGVhdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9kaXNwb3NlLXZpZXctcmVwZWF0ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBUUgsT0FBTyxFQU1MLHNCQUFzQixHQUN2QixNQUFNLGlCQUFpQixDQUFDO0FBRXpCOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxPQUFPLDRCQUE0QjtJQUd2QyxZQUFZLENBQ1YsT0FBMkIsRUFDM0IsZ0JBQWtDLEVBQ2xDLGtCQUE0RCxFQUM1RCxpQkFBdUQsRUFDdkQsZUFBZ0Q7UUFFaEQsT0FBTyxDQUFDLGdCQUFnQixDQUN0QixDQUNFLE1BQStCLEVBQy9CLHFCQUFvQyxFQUNwQyxZQUEyQixFQUMzQixFQUFFO1lBQ0YsSUFBSSxJQUFvQyxDQUFDO1lBQ3pDLElBQUksU0FBaUMsQ0FBQztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDdEYsSUFBSSxHQUFHLGdCQUFnQixDQUFDLGtCQUFrQixDQUN4QyxhQUFhLENBQUMsV0FBVyxFQUN6QixhQUFhLENBQUMsT0FBTyxFQUNyQixhQUFhLENBQUMsS0FBSyxDQUNwQixDQUFDO2dCQUNGLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLENBQUM7WUFDOUMsQ0FBQztpQkFBTSxJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDaEMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLHFCQUFzQixDQUFDLENBQUM7Z0JBQ2hELFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLENBQUM7WUFDN0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUJBQXNCLENBQXVCLENBQUM7Z0JBQzFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQzNDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDM0MsQ0FBQztZQUVELElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLGVBQWUsQ0FBQztvQkFDZCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU87b0JBQ3RCLFNBQVM7b0JBQ1QsTUFBTTtpQkFDUCxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxLQUFJLENBQUM7Q0FDWiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLFxuICBJdGVyYWJsZUNoYW5nZXMsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgX1ZpZXdSZXBlYXRlcixcbiAgX1ZpZXdSZXBlYXRlckl0ZW1DaGFuZ2VkLFxuICBfVmlld1JlcGVhdGVySXRlbUNvbnRleHQsXG4gIF9WaWV3UmVwZWF0ZXJJdGVtQ29udGV4dEZhY3RvcnksXG4gIF9WaWV3UmVwZWF0ZXJJdGVtVmFsdWVSZXNvbHZlcixcbiAgX1ZpZXdSZXBlYXRlck9wZXJhdGlvbixcbn0gZnJvbSAnLi92aWV3LXJlcGVhdGVyJztcblxuLyoqXG4gKiBBIHJlcGVhdGVyIHRoYXQgZGVzdHJveXMgdmlld3Mgd2hlbiB0aGV5IGFyZSByZW1vdmVkIGZyb20gYVxuICoge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9LiBXaGVuIG5ldyBpdGVtcyBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgY29udGFpbmVyLFxuICogdGhlIHJlcGVhdGVyIHdpbGwgYWx3YXlzIGNvbnN0cnVjdCBhIG5ldyBlbWJlZGRlZCB2aWV3IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgZm9yIHRoZSBlbWJlZGRlZCB2aWV3J3MgJGltcGxpY2l0IHByb3BlcnR5LlxuICogQHRlbXBsYXRlIFIgVGhlIHR5cGUgZm9yIHRoZSBpdGVtIGluIGVhY2ggSXRlcmFibGVEaWZmZXIgY2hhbmdlIHJlY29yZC5cbiAqIEB0ZW1wbGF0ZSBDIFRoZSB0eXBlIGZvciB0aGUgY29udGV4dCBwYXNzZWQgdG8gZWFjaCBlbWJlZGRlZCB2aWV3LlxuICovXG5leHBvcnQgY2xhc3MgX0Rpc3Bvc2VWaWV3UmVwZWF0ZXJTdHJhdGVneTxULCBSLCBDIGV4dGVuZHMgX1ZpZXdSZXBlYXRlckl0ZW1Db250ZXh0PFQ+PlxuICBpbXBsZW1lbnRzIF9WaWV3UmVwZWF0ZXI8VCwgUiwgQz5cbntcbiAgYXBwbHlDaGFuZ2VzKFxuICAgIGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxSPixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIGl0ZW1Db250ZXh0RmFjdG9yeTogX1ZpZXdSZXBlYXRlckl0ZW1Db250ZXh0RmFjdG9yeTxULCBSLCBDPixcbiAgICBpdGVtVmFsdWVSZXNvbHZlcjogX1ZpZXdSZXBlYXRlckl0ZW1WYWx1ZVJlc29sdmVyPFQsIFI+LFxuICAgIGl0ZW1WaWV3Q2hhbmdlZD86IF9WaWV3UmVwZWF0ZXJJdGVtQ2hhbmdlZDxSLCBDPixcbiAgKSB7XG4gICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKFxuICAgICAgKFxuICAgICAgICByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFI+LFxuICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciB8IG51bGwsXG4gICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICkgPT4ge1xuICAgICAgICBsZXQgdmlldzogRW1iZWRkZWRWaWV3UmVmPEM+IHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgb3BlcmF0aW9uOiBfVmlld1JlcGVhdGVyT3BlcmF0aW9uO1xuICAgICAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGluc2VydENvbnRleHQgPSBpdGVtQ29udGV4dEZhY3RvcnkocmVjb3JkLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgdmlldyA9IHZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgICAgICAgaW5zZXJ0Q29udGV4dC50ZW1wbGF0ZVJlZixcbiAgICAgICAgICAgIGluc2VydENvbnRleHQuY29udGV4dCxcbiAgICAgICAgICAgIGluc2VydENvbnRleHQuaW5kZXgsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBvcGVyYXRpb24gPSBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLklOU0VSVEVEO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgdmlld0NvbnRhaW5lclJlZi5yZW1vdmUoYWRqdXN0ZWRQcmV2aW91c0luZGV4ISk7XG4gICAgICAgICAgb3BlcmF0aW9uID0gX1ZpZXdSZXBlYXRlck9wZXJhdGlvbi5SRU1PVkVEO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZpZXcgPSB2aWV3Q29udGFpbmVyUmVmLmdldChhZGp1c3RlZFByZXZpb3VzSW5kZXghKSBhcyBFbWJlZGRlZFZpZXdSZWY8Qz47XG4gICAgICAgICAgdmlld0NvbnRhaW5lclJlZi5tb3ZlKHZpZXchLCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgIG9wZXJhdGlvbiA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uTU9WRUQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXRlbVZpZXdDaGFuZ2VkKSB7XG4gICAgICAgICAgaXRlbVZpZXdDaGFuZ2VkKHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHZpZXc/LmNvbnRleHQsXG4gICAgICAgICAgICBvcGVyYXRpb24sXG4gICAgICAgICAgICByZWNvcmQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIGRldGFjaCgpIHt9XG59XG4iXX0=