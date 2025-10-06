/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * To modify the labels and text displayed, create a new instance of MatPaginatorIntl and
 * include it in a custom provider
 */
export class MatPaginatorIntl {
    constructor() {
        /**
         * Stream to emit from when labels are changed. Use this to notify components when the labels have
         * changed after initialization.
         */
        this.changes = new Subject();
        /** A label for the page size selector. */
        this.itemsPerPageLabel = 'Items per page:';
        /** A label for the button that increments the current page. */
        this.nextPageLabel = 'Next page';
        /** A label for the button that decrements the current page. */
        this.previousPageLabel = 'Previous page';
        /** A label for the button that moves to the first page. */
        this.firstPageLabel = 'First page';
        /** A label for the button that moves to the last page. */
        this.lastPageLabel = 'Last page';
        /** A label for the range of items within the current page and the length of the whole list. */
        this.getRangeLabel = (page, pageSize, length) => {
            if (length == 0 || pageSize == 0) {
                return `0 of ${length}`;
            }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} of ${length}`;
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPaginatorIntl, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPaginatorIntl, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPaginatorIntl, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/** @docs-private */
export function MAT_PAGINATOR_INTL_PROVIDER_FACTORY(parentIntl) {
    return parentIntl || new MatPaginatorIntl();
}
/** @docs-private */
export const MAT_PAGINATOR_INTL_PROVIDER = {
    // If there is already an MatPaginatorIntl available, use that. Otherwise, provide a new one.
    provide: MatPaginatorIntl,
    deps: [[new Optional(), new SkipSelf(), MatPaginatorIntl]],
    useFactory: MAT_PAGINATOR_INTL_PROVIDER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdG9yLWludGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvcGFnaW5hdG9yL3BhZ2luYXRvci1pbnRsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQUU3Qjs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBRDdCO1FBRUU7OztXQUdHO1FBQ00sWUFBTyxHQUFrQixJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRXRELDBDQUEwQztRQUMxQyxzQkFBaUIsR0FBVyxpQkFBaUIsQ0FBQztRQUU5QywrREFBK0Q7UUFDL0Qsa0JBQWEsR0FBVyxXQUFXLENBQUM7UUFFcEMsK0RBQStEO1FBQy9ELHNCQUFpQixHQUFXLGVBQWUsQ0FBQztRQUU1QywyREFBMkQ7UUFDM0QsbUJBQWMsR0FBVyxZQUFZLENBQUM7UUFFdEMsMERBQTBEO1FBQzFELGtCQUFhLEdBQVcsV0FBVyxDQUFDO1FBRXBDLCtGQUErRjtRQUMvRixrQkFBYSxHQUErRCxDQUMxRSxJQUFZLEVBQ1osUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLEVBQUU7WUFDRixJQUFJLE1BQU0sSUFBSSxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDMUIsQ0FBQztZQUVELE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU3QixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBRW5DLDJGQUEyRjtZQUMzRixNQUFNLFFBQVEsR0FDWixVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7WUFFeEYsT0FBTyxHQUFHLFVBQVUsR0FBRyxDQUFDLE1BQU0sUUFBUSxPQUFPLE1BQU0sRUFBRSxDQUFDO1FBQ3hELENBQUMsQ0FBQztLQUNIO3FIQTFDWSxnQkFBZ0I7eUhBQWhCLGdCQUFnQixjQURKLE1BQU07O2tHQUNsQixnQkFBZ0I7a0JBRDVCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOztBQTZDaEMsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSxtQ0FBbUMsQ0FBQyxVQUE0QjtJQUM5RSxPQUFPLFVBQVUsSUFBSSxJQUFJLGdCQUFnQixFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUVELG9CQUFvQjtBQUNwQixNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRztJQUN6Qyw2RkFBNkY7SUFDN0YsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzFELFVBQVUsRUFBRSxtQ0FBbUM7Q0FDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE9wdGlvbmFsLCBTa2lwU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFRvIG1vZGlmeSB0aGUgbGFiZWxzIGFuZCB0ZXh0IGRpc3BsYXllZCwgY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIE1hdFBhZ2luYXRvckludGwgYW5kXG4gKiBpbmNsdWRlIGl0IGluIGEgY3VzdG9tIHByb3ZpZGVyXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE1hdFBhZ2luYXRvckludGwge1xuICAvKipcbiAgICogU3RyZWFtIHRvIGVtaXQgZnJvbSB3aGVuIGxhYmVscyBhcmUgY2hhbmdlZC4gVXNlIHRoaXMgdG8gbm90aWZ5IGNvbXBvbmVudHMgd2hlbiB0aGUgbGFiZWxzIGhhdmVcbiAgICogY2hhbmdlZCBhZnRlciBpbml0aWFsaXphdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGNoYW5nZXM6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgcGFnZSBzaXplIHNlbGVjdG9yLiAqL1xuICBpdGVtc1BlclBhZ2VMYWJlbDogc3RyaW5nID0gJ0l0ZW1zIHBlciBwYWdlOic7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBidXR0b24gdGhhdCBpbmNyZW1lbnRzIHRoZSBjdXJyZW50IHBhZ2UuICovXG4gIG5leHRQYWdlTGFiZWw6IHN0cmluZyA9ICdOZXh0IHBhZ2UnO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgYnV0dG9uIHRoYXQgZGVjcmVtZW50cyB0aGUgY3VycmVudCBwYWdlLiAqL1xuICBwcmV2aW91c1BhZ2VMYWJlbDogc3RyaW5nID0gJ1ByZXZpb3VzIHBhZ2UnO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgYnV0dG9uIHRoYXQgbW92ZXMgdG8gdGhlIGZpcnN0IHBhZ2UuICovXG4gIGZpcnN0UGFnZUxhYmVsOiBzdHJpbmcgPSAnRmlyc3QgcGFnZSc7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBidXR0b24gdGhhdCBtb3ZlcyB0byB0aGUgbGFzdCBwYWdlLiAqL1xuICBsYXN0UGFnZUxhYmVsOiBzdHJpbmcgPSAnTGFzdCBwYWdlJztcblxuICAvKiogQSBsYWJlbCBmb3IgdGhlIHJhbmdlIG9mIGl0ZW1zIHdpdGhpbiB0aGUgY3VycmVudCBwYWdlIGFuZCB0aGUgbGVuZ3RoIG9mIHRoZSB3aG9sZSBsaXN0LiAqL1xuICBnZXRSYW5nZUxhYmVsOiAocGFnZTogbnVtYmVyLCBwYWdlU2l6ZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlcikgPT4gc3RyaW5nID0gKFxuICAgIHBhZ2U6IG51bWJlcixcbiAgICBwYWdlU2l6ZTogbnVtYmVyLFxuICAgIGxlbmd0aDogbnVtYmVyLFxuICApID0+IHtcbiAgICBpZiAobGVuZ3RoID09IDAgfHwgcGFnZVNpemUgPT0gMCkge1xuICAgICAgcmV0dXJuIGAwIG9mICR7bGVuZ3RofWA7XG4gICAgfVxuXG4gICAgbGVuZ3RoID0gTWF0aC5tYXgobGVuZ3RoLCAwKTtcblxuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBwYWdlICogcGFnZVNpemU7XG5cbiAgICAvLyBJZiB0aGUgc3RhcnQgaW5kZXggZXhjZWVkcyB0aGUgbGlzdCBsZW5ndGgsIGRvIG5vdCB0cnkgYW5kIGZpeCB0aGUgZW5kIGluZGV4IHRvIHRoZSBlbmQuXG4gICAgY29uc3QgZW5kSW5kZXggPVxuICAgICAgc3RhcnRJbmRleCA8IGxlbmd0aCA/IE1hdGgubWluKHN0YXJ0SW5kZXggKyBwYWdlU2l6ZSwgbGVuZ3RoKSA6IHN0YXJ0SW5kZXggKyBwYWdlU2l6ZTtcblxuICAgIHJldHVybiBgJHtzdGFydEluZGV4ICsgMX0g4oCTICR7ZW5kSW5kZXh9IG9mICR7bGVuZ3RofWA7XG4gIH07XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFUX1BBR0lOQVRPUl9JTlRMX1BST1ZJREVSX0ZBQ1RPUlkocGFyZW50SW50bDogTWF0UGFnaW5hdG9ySW50bCkge1xuICByZXR1cm4gcGFyZW50SW50bCB8fCBuZXcgTWF0UGFnaW5hdG9ySW50bCgpO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IE1BVF9QQUdJTkFUT1JfSU5UTF9QUk9WSURFUiA9IHtcbiAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBNYXRQYWdpbmF0b3JJbnRsIGF2YWlsYWJsZSwgdXNlIHRoYXQuIE90aGVyd2lzZSwgcHJvdmlkZSBhIG5ldyBvbmUuXG4gIHByb3ZpZGU6IE1hdFBhZ2luYXRvckludGwsXG4gIGRlcHM6IFtbbmV3IE9wdGlvbmFsKCksIG5ldyBTa2lwU2VsZigpLCBNYXRQYWdpbmF0b3JJbnRsXV0sXG4gIHVzZUZhY3Rvcnk6IE1BVF9QQUdJTkFUT1JfSU5UTF9QUk9WSURFUl9GQUNUT1JZLFxufTtcbiJdfQ==