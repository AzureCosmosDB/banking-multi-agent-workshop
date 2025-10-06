/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Directive, ElementRef, NgZone, Optional } from '@angular/core';
import { ScrollDispatcher } from './scroll-dispatcher';
import { CdkVirtualScrollable, VIRTUAL_SCROLLABLE } from './virtual-scrollable';
import * as i0 from "@angular/core";
import * as i1 from "./scroll-dispatcher";
import * as i2 from "@angular/cdk/bidi";
/**
 * Provides a virtual scrollable for the element it is attached to.
 */
export class CdkVirtualScrollableElement extends CdkVirtualScrollable {
    constructor(elementRef, scrollDispatcher, ngZone, dir) {
        super(elementRef, scrollDispatcher, ngZone, dir);
    }
    measureBoundingClientRectWithScrollOffset(from) {
        return (this.getElementRef().nativeElement.getBoundingClientRect()[from] -
            this.measureScrollOffset(from));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkVirtualScrollableElement, deps: [{ token: i0.ElementRef }, { token: i1.ScrollDispatcher }, { token: i0.NgZone }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkVirtualScrollableElement, isStandalone: true, selector: "[cdkVirtualScrollingElement]", host: { classAttribute: "cdk-virtual-scrollable" }, providers: [{ provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableElement }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkVirtualScrollableElement, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkVirtualScrollingElement]',
                    providers: [{ provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableElement }],
                    standalone: true,
                    host: {
                        'class': 'cdk-virtual-scrollable',
                    },
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.ScrollDispatcher }, { type: i0.NgZone }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGxhYmxlLWVsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy92aXJ0dWFsLXNjcm9sbGFibGUtZWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN0RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQzs7OztBQUU5RTs7R0FFRztBQVNILE1BQU0sT0FBTywyQkFBNEIsU0FBUSxvQkFBb0I7SUFDbkUsWUFDRSxVQUFzQixFQUN0QixnQkFBa0MsRUFDbEMsTUFBYyxFQUNGLEdBQW1CO1FBRS9CLEtBQUssQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFUSx5Q0FBeUMsQ0FDaEQsSUFBeUM7UUFFekMsT0FBTyxDQUNMLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDaEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUMvQixDQUFDO0lBQ0osQ0FBQztxSEFqQlUsMkJBQTJCO3lHQUEzQiwyQkFBMkIsK0hBTjNCLENBQUMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLDJCQUEyQixFQUFDLENBQUM7O2tHQU16RSwyQkFBMkI7a0JBUnZDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDhCQUE4QjtvQkFDeEMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyw2QkFBNkIsRUFBQyxDQUFDO29CQUNwRixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSx3QkFBd0I7cUJBQ2xDO2lCQUNGOzswQkFNSSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U2Nyb2xsRGlzcGF0Y2hlcn0gZnJvbSAnLi9zY3JvbGwtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0Nka1ZpcnR1YWxTY3JvbGxhYmxlLCBWSVJUVUFMX1NDUk9MTEFCTEV9IGZyb20gJy4vdmlydHVhbC1zY3JvbGxhYmxlJztcblxuLyoqXG4gKiBQcm92aWRlcyBhIHZpcnR1YWwgc2Nyb2xsYWJsZSBmb3IgdGhlIGVsZW1lbnQgaXQgaXMgYXR0YWNoZWQgdG8uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtWaXJ0dWFsU2Nyb2xsaW5nRWxlbWVudF0nLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogVklSVFVBTF9TQ1JPTExBQkxFLCB1c2VFeGlzdGluZzogQ2RrVmlydHVhbFNjcm9sbGFibGVFbGVtZW50fV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLXZpcnR1YWwtc2Nyb2xsYWJsZScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka1ZpcnR1YWxTY3JvbGxhYmxlRWxlbWVudCBleHRlbmRzIENka1ZpcnR1YWxTY3JvbGxhYmxlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxuICAgIG5nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIGRpcjogRGlyZWN0aW9uYWxpdHksXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIHNjcm9sbERpc3BhdGNoZXIsIG5nWm9uZSwgZGlyKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG1lYXN1cmVCb3VuZGluZ0NsaWVudFJlY3RXaXRoU2Nyb2xsT2Zmc2V0KFxuICAgIGZyb206ICdsZWZ0JyB8ICd0b3AnIHwgJ3JpZ2h0JyB8ICdib3R0b20nLFxuICApOiBudW1iZXIge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmdldEVsZW1lbnRSZWYoKS5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW2Zyb21dIC1cbiAgICAgIHRoaXMubWVhc3VyZVNjcm9sbE9mZnNldChmcm9tKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==