/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Directive, ElementRef, NgZone, Optional } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScrollDispatcher } from './scroll-dispatcher';
import { CdkVirtualScrollable, VIRTUAL_SCROLLABLE } from './virtual-scrollable';
import * as i0 from "@angular/core";
import * as i1 from "./scroll-dispatcher";
import * as i2 from "@angular/cdk/bidi";
/**
 * Provides as virtual scrollable for the global / window scrollbar.
 */
export class CdkVirtualScrollableWindow extends CdkVirtualScrollable {
    constructor(scrollDispatcher, ngZone, dir) {
        super(new ElementRef(document.documentElement), scrollDispatcher, ngZone, dir);
        this._elementScrolled = new Observable((observer) => this.ngZone.runOutsideAngular(() => fromEvent(document, 'scroll').pipe(takeUntil(this._destroyed)).subscribe(observer)));
    }
    measureBoundingClientRectWithScrollOffset(from) {
        return this.getElementRef().nativeElement.getBoundingClientRect()[from];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkVirtualScrollableWindow, deps: [{ token: i1.ScrollDispatcher }, { token: i0.NgZone }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkVirtualScrollableWindow, isStandalone: true, selector: "cdk-virtual-scroll-viewport[scrollWindow]", providers: [{ provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableWindow }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkVirtualScrollableWindow, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-virtual-scroll-viewport[scrollWindow]',
                    providers: [{ provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableWindow }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.ScrollDispatcher }, { type: i0.NgZone }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGxhYmxlLXdpbmRvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL3ZpcnR1YWwtc2Nyb2xsYWJsZS13aW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFDckQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDOzs7O0FBRTlFOztHQUVHO0FBTUgsTUFBTSxPQUFPLDBCQUEyQixTQUFRLG9CQUFvQjtJQVFsRSxZQUFZLGdCQUFrQyxFQUFFLE1BQWMsRUFBYyxHQUFtQjtRQUM3RixLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQVI5RCxxQkFBZ0IsR0FBc0IsSUFBSSxVQUFVLENBQ3JFLENBQUMsUUFBeUIsRUFBRSxFQUFFLENBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQ2pDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQ25GLENBQ0osQ0FBQztJQUlGLENBQUM7SUFFUSx5Q0FBeUMsQ0FDaEQsSUFBeUM7UUFFekMsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUUsQ0FBQztxSEFoQlUsMEJBQTBCO3lHQUExQiwwQkFBMEIsd0ZBSDFCLENBQUMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLDBCQUEwQixFQUFDLENBQUM7O2tHQUd4RSwwQkFBMEI7a0JBTHRDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDJDQUEyQztvQkFDckQsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyw0QkFBNEIsRUFBQyxDQUFDO29CQUNuRixVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQVNrRSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyfSBmcm9tICcuL3Njcm9sbC1kaXNwYXRjaGVyJztcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbGFibGUsIFZJUlRVQUxfU0NST0xMQUJMRX0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbGFibGUnO1xuXG4vKipcbiAqIFByb3ZpZGVzIGFzIHZpcnR1YWwgc2Nyb2xsYWJsZSBmb3IgdGhlIGdsb2JhbCAvIHdpbmRvdyBzY3JvbGxiYXIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay12aXJ0dWFsLXNjcm9sbC12aWV3cG9ydFtzY3JvbGxXaW5kb3ddJyxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFZJUlRVQUxfU0NST0xMQUJMRSwgdXNlRXhpc3Rpbmc6IENka1ZpcnR1YWxTY3JvbGxhYmxlV2luZG93fV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1ZpcnR1YWxTY3JvbGxhYmxlV2luZG93IGV4dGVuZHMgQ2RrVmlydHVhbFNjcm9sbGFibGUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2VsZW1lbnRTY3JvbGxlZDogT2JzZXJ2YWJsZTxFdmVudD4gPSBuZXcgT2JzZXJ2YWJsZShcbiAgICAob2JzZXJ2ZXI6IE9ic2VydmVyPEV2ZW50PikgPT5cbiAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgIGZyb21FdmVudChkb2N1bWVudCwgJ3Njcm9sbCcpLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShvYnNlcnZlciksXG4gICAgICApLFxuICApO1xuXG4gIGNvbnN0cnVjdG9yKHNjcm9sbERpc3BhdGNoZXI6IFNjcm9sbERpc3BhdGNoZXIsIG5nWm9uZTogTmdab25lLCBAT3B0aW9uYWwoKSBkaXI6IERpcmVjdGlvbmFsaXR5KSB7XG4gICAgc3VwZXIobmV3IEVsZW1lbnRSZWYoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSwgc2Nyb2xsRGlzcGF0Y2hlciwgbmdab25lLCBkaXIpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbWVhc3VyZUJvdW5kaW5nQ2xpZW50UmVjdFdpdGhTY3JvbGxPZmZzZXQoXG4gICAgZnJvbTogJ2xlZnQnIHwgJ3RvcCcgfCAncmlnaHQnIHwgJ2JvdHRvbScsXG4gICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudFJlZigpLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbZnJvbV07XG4gIH1cbn1cbiJdfQ==