/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isObservable } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { BaseTreeControl } from './base-tree-control';
/**
 * Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type.
 *
 * @deprecated Use one of levelAccessor or childrenAccessor instead. To be removed in a future
 * version.
 * @breaking-change 21.0.0
 */
export class NestedTreeControl extends BaseTreeControl {
    /** Construct with nested tree function getChildren. */
    constructor(getChildren, options) {
        super();
        this.getChildren = getChildren;
        this.options = options;
        if (this.options) {
            this.trackBy = this.options.trackBy;
        }
        if (this.options?.isExpandable) {
            this.isExpandable = this.options.isExpandable;
        }
    }
    /**
     * Expands all dataNodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all root level
     * data nodes of the tree.
     */
    expandAll() {
        this.expansionModel.clear();
        const allNodes = this.dataNodes.reduce((accumulator, dataNode) => [...accumulator, ...this.getDescendants(dataNode), dataNode], []);
        this.expansionModel.select(...allNodes.map(node => this._trackByValue(node)));
    }
    /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
    getDescendants(dataNode) {
        const descendants = [];
        this._getDescendants(descendants, dataNode);
        // Remove the node itself
        return descendants.splice(1);
    }
    /** A helper function to get descendants recursively. */
    _getDescendants(descendants, dataNode) {
        descendants.push(dataNode);
        const childrenNodes = this.getChildren(dataNode);
        if (Array.isArray(childrenNodes)) {
            childrenNodes.forEach((child) => this._getDescendants(descendants, child));
        }
        else if (isObservable(childrenNodes)) {
            // TypeScript as of version 3.5 doesn't seem to treat `Boolean` like a function that
            // returns a `boolean` specifically in the context of `filter`, so we manually clarify that.
            childrenNodes.pipe(take(1), filter(Boolean)).subscribe(children => {
                for (const child of children) {
                    this._getDescendants(descendants, child);
                }
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkLXRyZWUtY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS9jb250cm9sL25lc3RlZC10cmVlLWNvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFhLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM5QyxPQUFPLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQVNwRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8saUJBQTRCLFNBQVEsZUFBcUI7SUFDcEUsdURBQXVEO0lBQ3ZELFlBQ2tCLFdBQXNFLEVBQy9FLE9BQXdDO1FBRS9DLEtBQUssRUFBRSxDQUFDO1FBSFEsZ0JBQVcsR0FBWCxXQUFXLENBQTJEO1FBQy9FLFlBQU8sR0FBUCxPQUFPLENBQWlDO1FBSS9DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTO1FBQ1AsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FDcEMsQ0FBQyxXQUFnQixFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQzVGLEVBQUUsQ0FDSCxDQUFDO1FBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELDhGQUE4RjtJQUM5RixjQUFjLENBQUMsUUFBVztRQUN4QixNQUFNLFdBQVcsR0FBUSxFQUFFLENBQUM7UUFFNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUMseUJBQXlCO1FBQ3pCLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsd0RBQXdEO0lBQzlDLGVBQWUsQ0FBQyxXQUFnQixFQUFFLFFBQVc7UUFDckQsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQ2pDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQzthQUFNLElBQUksWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7WUFDdkMsb0ZBQW9GO1lBQ3BGLDRGQUE0RjtZQUM1RixhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBd0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNqRixLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUM3QixJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBpc09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7QmFzZVRyZWVDb250cm9sfSBmcm9tICcuL2Jhc2UtdHJlZS1jb250cm9sJztcblxuLyoqIE9wdGlvbmFsIHNldCBvZiBjb25maWd1cmF0aW9uIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHRvIHRoZSBOZXN0ZWRUcmVlQ29udHJvbC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmVzdGVkVHJlZUNvbnRyb2xPcHRpb25zPFQsIEs+IHtcbiAgLyoqIEZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiB0aGUgcHJvdmlkZWQgbm9kZSBpcyBleHBhbmRhYmxlLiAqL1xuICBpc0V4cGFuZGFibGU/OiAoZGF0YU5vZGU6IFQpID0+IGJvb2xlYW47XG4gIHRyYWNrQnk/OiAoZGF0YU5vZGU6IFQpID0+IEs7XG59XG5cbi8qKlxuICogTmVzdGVkIHRyZWUgY29udHJvbC4gQWJsZSB0byBleHBhbmQvY29sbGFwc2UgYSBzdWJ0cmVlIHJlY3Vyc2l2ZWx5IGZvciBOZXN0ZWROb2RlIHR5cGUuXG4gKlxuICogQGRlcHJlY2F0ZWQgVXNlIG9uZSBvZiBsZXZlbEFjY2Vzc29yIG9yIGNoaWxkcmVuQWNjZXNzb3IgaW5zdGVhZC4gVG8gYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZVxuICogdmVyc2lvbi5cbiAqIEBicmVha2luZy1jaGFuZ2UgMjEuMC4wXG4gKi9cbmV4cG9ydCBjbGFzcyBOZXN0ZWRUcmVlQ29udHJvbDxULCBLID0gVD4gZXh0ZW5kcyBCYXNlVHJlZUNvbnRyb2w8VCwgSz4ge1xuICAvKiogQ29uc3RydWN0IHdpdGggbmVzdGVkIHRyZWUgZnVuY3Rpb24gZ2V0Q2hpbGRyZW4uICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDaGlsZHJlbjogKGRhdGFOb2RlOiBUKSA9PiBPYnNlcnZhYmxlPFRbXT4gfCBUW10gfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyBvcHRpb25zPzogTmVzdGVkVHJlZUNvbnRyb2xPcHRpb25zPFQsIEs+LFxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgdGhpcy50cmFja0J5ID0gdGhpcy5vcHRpb25zLnRyYWNrQnk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucz8uaXNFeHBhbmRhYmxlKSB7XG4gICAgICB0aGlzLmlzRXhwYW5kYWJsZSA9IHRoaXMub3B0aW9ucy5pc0V4cGFuZGFibGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIGRhdGFOb2RlcyBpbiB0aGUgdHJlZS5cbiAgICpcbiAgICogVG8gbWFrZSB0aGlzIHdvcmtpbmcsIHRoZSBgZGF0YU5vZGVzYCB2YXJpYWJsZSBvZiB0aGUgVHJlZUNvbnRyb2wgbXVzdCBiZSBzZXQgdG8gYWxsIHJvb3QgbGV2ZWxcbiAgICogZGF0YSBub2RlcyBvZiB0aGUgdHJlZS5cbiAgICovXG4gIGV4cGFuZEFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmV4cGFuc2lvbk1vZGVsLmNsZWFyKCk7XG4gICAgY29uc3QgYWxsTm9kZXMgPSB0aGlzLmRhdGFOb2Rlcy5yZWR1Y2UoXG4gICAgICAoYWNjdW11bGF0b3I6IFRbXSwgZGF0YU5vZGUpID0+IFsuLi5hY2N1bXVsYXRvciwgLi4udGhpcy5nZXREZXNjZW5kYW50cyhkYXRhTm9kZSksIGRhdGFOb2RlXSxcbiAgICAgIFtdLFxuICAgICk7XG4gICAgdGhpcy5leHBhbnNpb25Nb2RlbC5zZWxlY3QoLi4uYWxsTm9kZXMubWFwKG5vZGUgPT4gdGhpcy5fdHJhY2tCeVZhbHVlKG5vZGUpKSk7XG4gIH1cblxuICAvKiogR2V0cyBhIGxpc3Qgb2YgZGVzY2VuZGFudCBkYXRhTm9kZXMgb2YgYSBzdWJ0cmVlIHJvb3RlZCBhdCBnaXZlbiBkYXRhIG5vZGUgcmVjdXJzaXZlbHkuICovXG4gIGdldERlc2NlbmRhbnRzKGRhdGFOb2RlOiBUKTogVFtdIHtcbiAgICBjb25zdCBkZXNjZW5kYW50czogVFtdID0gW107XG5cbiAgICB0aGlzLl9nZXREZXNjZW5kYW50cyhkZXNjZW5kYW50cywgZGF0YU5vZGUpO1xuICAgIC8vIFJlbW92ZSB0aGUgbm9kZSBpdHNlbGZcbiAgICByZXR1cm4gZGVzY2VuZGFudHMuc3BsaWNlKDEpO1xuICB9XG5cbiAgLyoqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGdldCBkZXNjZW5kYW50cyByZWN1cnNpdmVseS4gKi9cbiAgcHJvdGVjdGVkIF9nZXREZXNjZW5kYW50cyhkZXNjZW5kYW50czogVFtdLCBkYXRhTm9kZTogVCk6IHZvaWQge1xuICAgIGRlc2NlbmRhbnRzLnB1c2goZGF0YU5vZGUpO1xuICAgIGNvbnN0IGNoaWxkcmVuTm9kZXMgPSB0aGlzLmdldENoaWxkcmVuKGRhdGFOb2RlKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbk5vZGVzKSkge1xuICAgICAgY2hpbGRyZW5Ob2Rlcy5mb3JFYWNoKChjaGlsZDogVCkgPT4gdGhpcy5fZ2V0RGVzY2VuZGFudHMoZGVzY2VuZGFudHMsIGNoaWxkKSk7XG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoY2hpbGRyZW5Ob2RlcykpIHtcbiAgICAgIC8vIFR5cGVTY3JpcHQgYXMgb2YgdmVyc2lvbiAzLjUgZG9lc24ndCBzZWVtIHRvIHRyZWF0IGBCb29sZWFuYCBsaWtlIGEgZnVuY3Rpb24gdGhhdFxuICAgICAgLy8gcmV0dXJucyBhIGBib29sZWFuYCBzcGVjaWZpY2FsbHkgaW4gdGhlIGNvbnRleHQgb2YgYGZpbHRlcmAsIHNvIHdlIG1hbnVhbGx5IGNsYXJpZnkgdGhhdC5cbiAgICAgIGNoaWxkcmVuTm9kZXMucGlwZSh0YWtlKDEpLCBmaWx0ZXIoQm9vbGVhbiBhcyAoKSA9PiBib29sZWFuKSkuc3Vic2NyaWJlKGNoaWxkcmVuID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgICAgIHRoaXMuX2dldERlc2NlbmRhbnRzKGRlc2NlbmRhbnRzLCBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19