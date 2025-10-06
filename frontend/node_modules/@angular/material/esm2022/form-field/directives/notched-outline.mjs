/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, ViewChild, ViewEncapsulation, } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Internal component that creates an instance of the MDC notched-outline component.
 *
 * The component sets up the HTML structure and styles for the notched-outline. It provides
 * inputs to toggle the notch state and width.
 */
export class MatFormFieldNotchedOutline {
    constructor(_elementRef, _ngZone) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        /** Whether the notch should be opened. */
        this.open = false;
    }
    ngAfterViewInit() {
        const label = this._elementRef.nativeElement.querySelector('.mdc-floating-label');
        if (label) {
            this._elementRef.nativeElement.classList.add('mdc-notched-outline--upgraded');
            if (typeof requestAnimationFrame === 'function') {
                label.style.transitionDuration = '0s';
                this._ngZone.runOutsideAngular(() => {
                    requestAnimationFrame(() => (label.style.transitionDuration = ''));
                });
            }
        }
        else {
            this._elementRef.nativeElement.classList.add('mdc-notched-outline--no-label');
        }
    }
    _setNotchWidth(labelWidth) {
        if (!this.open || !labelWidth) {
            this._notch.nativeElement.style.width = '';
        }
        else {
            const NOTCH_ELEMENT_PADDING = 8;
            const NOTCH_ELEMENT_BORDER = 1;
            this._notch.nativeElement.style.width = `calc(${labelWidth}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + ${NOTCH_ELEMENT_PADDING + NOTCH_ELEMENT_BORDER}px)`;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldNotchedOutline, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldNotchedOutline, isStandalone: true, selector: "div[matFormFieldNotchedOutline]", inputs: { open: ["matFormFieldNotchedOutlineOpen", "open"] }, host: { properties: { "class.mdc-notched-outline--notched": "open" }, classAttribute: "mdc-notched-outline" }, viewQueries: [{ propertyName: "_notch", first: true, predicate: ["notch"], descendants: true }], ngImport: i0, template: "<div class=\"mat-mdc-notch-piece mdc-notched-outline__leading\"></div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__notch\" #notch>\n  <ng-content></ng-content>\n</div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__trailing\"></div>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldNotchedOutline, decorators: [{
            type: Component,
            args: [{ selector: 'div[matFormFieldNotchedOutline]', host: {
                        'class': 'mdc-notched-outline',
                        // Besides updating the notch state through the MDC component, we toggle this class through
                        // a host binding in order to ensure that the notched-outline renders correctly on the server.
                        '[class.mdc-notched-outline--notched]': 'open',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, template: "<div class=\"mat-mdc-notch-piece mdc-notched-outline__leading\"></div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__notch\" #notch>\n  <ng-content></ng-content>\n</div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__trailing\"></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { open: [{
                type: Input,
                args: ['matFormFieldNotchedOutlineOpen']
            }], _notch: [{
                type: ViewChild,
                args: ['notch']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90Y2hlZC1vdXRsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvZGlyZWN0aXZlcy9ub3RjaGVkLW91dGxpbmUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZm9ybS1maWVsZC9kaXJlY3RpdmVzL25vdGNoZWQtb3V0bGluZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7O0FBRXZCOzs7OztHQUtHO0FBY0gsTUFBTSxPQUFPLDBCQUEwQjtJQU1yQyxZQUNVLFdBQW9DLEVBQ3BDLE9BQWU7UUFEZixnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQVB6QiwwQ0FBMEM7UUFDRCxTQUFJLEdBQVksS0FBSyxDQUFDO0lBTzVELENBQUM7SUFFSixlQUFlO1FBQ2IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFjLHFCQUFxQixDQUFDLENBQUM7UUFDL0YsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUU5RSxJQUFJLE9BQU8scUJBQXFCLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ2hELEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtvQkFDbEMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7SUFDSCxDQUFDO0lBRUQsY0FBYyxDQUFDLFVBQWtCO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDN0MsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQztZQUNoQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsVUFBVSwrREFDeEQscUJBQXFCLEdBQUcsb0JBQzFCLEtBQUssQ0FBQztRQUNSLENBQUM7SUFDSCxDQUFDO3FIQXJDVSwwQkFBMEI7eUdBQTFCLDBCQUEwQix5V0N0Q3ZDLCtQQUtBOztrR0RpQ2EsMEJBQTBCO2tCQWJ0QyxTQUFTOytCQUNFLGlDQUFpQyxRQUVyQzt3QkFDSixPQUFPLEVBQUUscUJBQXFCO3dCQUM5QiwyRkFBMkY7d0JBQzNGLDhGQUE4Rjt3QkFDOUYsc0NBQXNDLEVBQUUsTUFBTTtxQkFDL0MsbUJBQ2dCLHVCQUF1QixDQUFDLE1BQU0saUJBQ2hDLGlCQUFpQixDQUFDLElBQUksY0FDekIsSUFBSTtvR0FJeUIsSUFBSTtzQkFBNUMsS0FBSzt1QkFBQyxnQ0FBZ0M7Z0JBRW5CLE1BQU07c0JBQXpCLFNBQVM7dUJBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBJbnRlcm5hbCBjb21wb25lbnQgdGhhdCBjcmVhdGVzIGFuIGluc3RhbmNlIG9mIHRoZSBNREMgbm90Y2hlZC1vdXRsaW5lIGNvbXBvbmVudC5cbiAqXG4gKiBUaGUgY29tcG9uZW50IHNldHMgdXAgdGhlIEhUTUwgc3RydWN0dXJlIGFuZCBzdHlsZXMgZm9yIHRoZSBub3RjaGVkLW91dGxpbmUuIEl0IHByb3ZpZGVzXG4gKiBpbnB1dHMgdG8gdG9nZ2xlIHRoZSBub3RjaCBzdGF0ZSBhbmQgd2lkdGguXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2RpdlttYXRGb3JtRmllbGROb3RjaGVkT3V0bGluZV0nLFxuICB0ZW1wbGF0ZVVybDogJy4vbm90Y2hlZC1vdXRsaW5lLmh0bWwnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21kYy1ub3RjaGVkLW91dGxpbmUnLFxuICAgIC8vIEJlc2lkZXMgdXBkYXRpbmcgdGhlIG5vdGNoIHN0YXRlIHRocm91Z2ggdGhlIE1EQyBjb21wb25lbnQsIHdlIHRvZ2dsZSB0aGlzIGNsYXNzIHRocm91Z2hcbiAgICAvLyBhIGhvc3QgYmluZGluZyBpbiBvcmRlciB0byBlbnN1cmUgdGhhdCB0aGUgbm90Y2hlZC1vdXRsaW5lIHJlbmRlcnMgY29ycmVjdGx5IG9uIHRoZSBzZXJ2ZXIuXG4gICAgJ1tjbGFzcy5tZGMtbm90Y2hlZC1vdXRsaW5lLS1ub3RjaGVkXSc6ICdvcGVuJyxcbiAgfSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEZvcm1GaWVsZE5vdGNoZWRPdXRsaW5lIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gIC8qKiBXaGV0aGVyIHRoZSBub3RjaCBzaG91bGQgYmUgb3BlbmVkLiAqL1xuICBASW5wdXQoJ21hdEZvcm1GaWVsZE5vdGNoZWRPdXRsaW5lT3BlbicpIG9wZW46IGJvb2xlYW4gPSBmYWxzZTtcblxuICBAVmlld0NoaWxkKCdub3RjaCcpIF9ub3RjaDogRWxlbWVudFJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PignLm1kYy1mbG9hdGluZy1sYWJlbCcpO1xuICAgIGlmIChsYWJlbCkge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21kYy1ub3RjaGVkLW91dGxpbmUtLXVwZ3JhZGVkJyk7XG5cbiAgICAgIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGxhYmVsLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcwcyc7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IChsYWJlbC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnJykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21kYy1ub3RjaGVkLW91dGxpbmUtLW5vLWxhYmVsJyk7XG4gICAgfVxuICB9XG5cbiAgX3NldE5vdGNoV2lkdGgobGFiZWxXaWR0aDogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLm9wZW4gfHwgIWxhYmVsV2lkdGgpIHtcbiAgICAgIHRoaXMuX25vdGNoLm5hdGl2ZUVsZW1lbnQuc3R5bGUud2lkdGggPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgTk9UQ0hfRUxFTUVOVF9QQURESU5HID0gODtcbiAgICAgIGNvbnN0IE5PVENIX0VMRU1FTlRfQk9SREVSID0gMTtcbiAgICAgIHRoaXMuX25vdGNoLm5hdGl2ZUVsZW1lbnQuc3R5bGUud2lkdGggPSBgY2FsYygke2xhYmVsV2lkdGh9cHggKiB2YXIoLS1tYXQtbWRjLWZvcm0tZmllbGQtZmxvYXRpbmctbGFiZWwtc2NhbGUsIDAuNzUpICsgJHtcbiAgICAgICAgTk9UQ0hfRUxFTUVOVF9QQURESU5HICsgTk9UQ0hfRUxFTUVOVF9CT1JERVJcbiAgICAgIH1weClgO1xuICAgIH1cbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cIm1hdC1tZGMtbm90Y2gtcGllY2UgbWRjLW5vdGNoZWQtb3V0bGluZV9fbGVhZGluZ1wiPjwvZGl2PlxuPGRpdiBjbGFzcz1cIm1hdC1tZGMtbm90Y2gtcGllY2UgbWRjLW5vdGNoZWQtb3V0bGluZV9fbm90Y2hcIiAjbm90Y2g+XG4gIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbjwvZGl2PlxuPGRpdiBjbGFzcz1cIm1hdC1tZGMtbm90Y2gtcGllY2UgbWRjLW5vdGNoZWQtb3V0bGluZV9fdHJhaWxpbmdcIj48L2Rpdj5cbiJdfQ==