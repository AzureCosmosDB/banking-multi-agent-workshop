/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BidiModule } from '@angular/cdk/bidi';
import { NgModule } from '@angular/core';
import { CdkFixedSizeVirtualScroll } from './fixed-size-virtual-scroll';
import { CdkScrollable } from './scrollable';
import { CdkVirtualForOf } from './virtual-for-of';
import { CdkVirtualScrollViewport } from './virtual-scroll-viewport';
import { CdkVirtualScrollableElement } from './virtual-scrollable-element';
import { CdkVirtualScrollableWindow } from './virtual-scrollable-window';
import * as i0 from "@angular/core";
export class CdkScrollableModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkScrollableModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkScrollableModule, imports: [CdkScrollable], exports: [CdkScrollable] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkScrollableModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkScrollableModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [CdkScrollable],
                    imports: [CdkScrollable],
                }]
        }] });
/**
 * @docs-primary-export
 */
export class ScrollingModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollingModule, imports: [BidiModule, CdkScrollableModule, CdkVirtualScrollViewport,
            CdkFixedSizeVirtualScroll,
            CdkVirtualForOf,
            CdkVirtualScrollableWindow,
            CdkVirtualScrollableElement], exports: [BidiModule, CdkScrollableModule, CdkFixedSizeVirtualScroll,
            CdkVirtualForOf,
            CdkVirtualScrollViewport,
            CdkVirtualScrollableWindow,
            CdkVirtualScrollableElement] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollingModule, imports: [BidiModule,
            CdkScrollableModule, BidiModule, CdkScrollableModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollingModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        BidiModule,
                        CdkScrollableModule,
                        CdkVirtualScrollViewport,
                        CdkFixedSizeVirtualScroll,
                        CdkVirtualForOf,
                        CdkVirtualScrollableWindow,
                        CdkVirtualScrollableElement,
                    ],
                    exports: [
                        BidiModule,
                        CdkScrollableModule,
                        CdkFixedSizeVirtualScroll,
                        CdkVirtualForOf,
                        CdkVirtualScrollViewport,
                        CdkVirtualScrollableWindow,
                        CdkVirtualScrollableElement,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL3Njcm9sbGluZy1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMzQyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDbkUsT0FBTyxFQUFDLDJCQUEyQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDekUsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7O0FBTXZFLE1BQU0sT0FBTyxtQkFBbUI7cUhBQW5CLG1CQUFtQjtzSEFBbkIsbUJBQW1CLFlBRnBCLGFBQWEsYUFEYixhQUFhO3NIQUdaLG1CQUFtQjs7a0dBQW5CLG1CQUFtQjtrQkFKL0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ3hCLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztpQkFDekI7O0FBR0Q7O0dBRUc7QUFxQkgsTUFBTSxPQUFPLGVBQWU7cUhBQWYsZUFBZTtzSEFBZixlQUFlLFlBbEJ4QixVQUFVLEVBUEQsbUJBQW1CLEVBUzVCLHdCQUF3QjtZQUN4Qix5QkFBeUI7WUFDekIsZUFBZTtZQUNmLDBCQUEwQjtZQUMxQiwyQkFBMkIsYUFHM0IsVUFBVSxFQWhCRCxtQkFBbUIsRUFrQjVCLHlCQUF5QjtZQUN6QixlQUFlO1lBQ2Ysd0JBQXdCO1lBQ3hCLDBCQUEwQjtZQUMxQiwyQkFBMkI7c0hBR2xCLGVBQWUsWUFsQnhCLFVBQVU7WUFDVixtQkFBbUIsRUFRbkIsVUFBVSxFQWhCRCxtQkFBbUI7O2tHQXlCbkIsZUFBZTtrQkFwQjNCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLFVBQVU7d0JBQ1YsbUJBQW1CO3dCQUNuQix3QkFBd0I7d0JBQ3hCLHlCQUF5Qjt3QkFDekIsZUFBZTt3QkFDZiwwQkFBMEI7d0JBQzFCLDJCQUEyQjtxQkFDNUI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLFVBQVU7d0JBQ1YsbUJBQW1CO3dCQUNuQix5QkFBeUI7d0JBQ3pCLGVBQWU7d0JBQ2Ysd0JBQXdCO3dCQUN4QiwwQkFBMEI7d0JBQzFCLDJCQUEyQjtxQkFDNUI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCaWRpTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbH0gZnJvbSAnLi9maXhlZC1zaXplLXZpcnR1YWwtc2Nyb2xsJztcbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZX0gZnJvbSAnLi9zY3JvbGxhYmxlJztcbmltcG9ydCB7Q2RrVmlydHVhbEZvck9mfSBmcm9tICcuL3ZpcnR1YWwtZm9yLW9mJztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0fSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0JztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbGFibGVFbGVtZW50fSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsYWJsZS1lbGVtZW50JztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbGFibGVXaW5kb3d9IGZyb20gJy4vdmlydHVhbC1zY3JvbGxhYmxlLXdpbmRvdyc7XG5cbkBOZ01vZHVsZSh7XG4gIGV4cG9ydHM6IFtDZGtTY3JvbGxhYmxlXSxcbiAgaW1wb3J0czogW0Nka1Njcm9sbGFibGVdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTY3JvbGxhYmxlTW9kdWxlIHt9XG5cbi8qKlxuICogQGRvY3MtcHJpbWFyeS1leHBvcnRcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEJpZGlNb2R1bGUsXG4gICAgQ2RrU2Nyb2xsYWJsZU1vZHVsZSxcbiAgICBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQsXG4gICAgQ2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbCxcbiAgICBDZGtWaXJ0dWFsRm9yT2YsXG4gICAgQ2RrVmlydHVhbFNjcm9sbGFibGVXaW5kb3csXG4gICAgQ2RrVmlydHVhbFNjcm9sbGFibGVFbGVtZW50LFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgQmlkaU1vZHVsZSxcbiAgICBDZGtTY3JvbGxhYmxlTW9kdWxlLFxuICAgIENka0ZpeGVkU2l6ZVZpcnR1YWxTY3JvbGwsXG4gICAgQ2RrVmlydHVhbEZvck9mLFxuICAgIENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCxcbiAgICBDZGtWaXJ0dWFsU2Nyb2xsYWJsZVdpbmRvdyxcbiAgICBDZGtWaXJ0dWFsU2Nyb2xsYWJsZUVsZW1lbnQsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFNjcm9sbGluZ01vZHVsZSB7fVxuIl19