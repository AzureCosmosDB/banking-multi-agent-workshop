/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, NgZone } from '@angular/core';
import * as i0 from "@angular/core";
/** Class added when the line ripple is active. */
const ACTIVATE_CLASS = 'mdc-line-ripple--active';
/** Class added when the line ripple is being deactivated. */
const DEACTIVATING_CLASS = 'mdc-line-ripple--deactivating';
/**
 * Internal directive that creates an instance of the MDC line-ripple component. Using a
 * directive allows us to conditionally render a line-ripple in the template without having
 * to manually create and destroy the `MDCLineRipple` component whenever the condition changes.
 *
 * The directive sets up the styles for the line-ripple and provides an API for activating
 * and deactivating the line-ripple.
 */
export class MatFormFieldLineRipple {
    constructor(_elementRef, ngZone) {
        this._elementRef = _elementRef;
        this._handleTransitionEnd = (event) => {
            const classList = this._elementRef.nativeElement.classList;
            const isDeactivating = classList.contains(DEACTIVATING_CLASS);
            if (event.propertyName === 'opacity' && isDeactivating) {
                classList.remove(ACTIVATE_CLASS, DEACTIVATING_CLASS);
            }
        };
        ngZone.runOutsideAngular(() => {
            _elementRef.nativeElement.addEventListener('transitionend', this._handleTransitionEnd);
        });
    }
    activate() {
        const classList = this._elementRef.nativeElement.classList;
        classList.remove(DEACTIVATING_CLASS);
        classList.add(ACTIVATE_CLASS);
    }
    deactivate() {
        this._elementRef.nativeElement.classList.add(DEACTIVATING_CLASS);
    }
    ngOnDestroy() {
        this._elementRef.nativeElement.removeEventListener('transitionend', this._handleTransitionEnd);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldLineRipple, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldLineRipple, isStandalone: true, selector: "div[matFormFieldLineRipple]", host: { classAttribute: "mdc-line-ripple" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldLineRipple, decorators: [{
            type: Directive,
            args: [{
                    selector: 'div[matFormFieldLineRipple]',
                    host: {
                        'class': 'mdc-line-ripple',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS1yaXBwbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZm9ybS1maWVsZC9kaXJlY3RpdmVzL2xpbmUtcmlwcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBWSxNQUFNLGVBQWUsQ0FBQzs7QUFFdkUsa0RBQWtEO0FBQ2xELE1BQU0sY0FBYyxHQUFHLHlCQUF5QixDQUFDO0FBRWpELDZEQUE2RDtBQUM3RCxNQUFNLGtCQUFrQixHQUFHLCtCQUErQixDQUFDO0FBRTNEOzs7Ozs7O0dBT0c7QUFRSCxNQUFNLE9BQU8sc0JBQXNCO0lBQ2pDLFlBQ1UsV0FBb0MsRUFDNUMsTUFBYztRQUROLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQWtCdEMseUJBQW9CLEdBQUcsQ0FBQyxLQUFzQixFQUFFLEVBQUU7WUFDeEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1lBQzNELE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUU5RCxJQUFJLEtBQUssQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUN2RCxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3ZELENBQUM7UUFDSCxDQUFDLENBQUM7UUF0QkEsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUM1QixXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUN6RixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ04sTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1FBQzNELFNBQVMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNyQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFXRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7cUhBL0JVLHNCQUFzQjt5R0FBdEIsc0JBQXNCOztrR0FBdEIsc0JBQXNCO2tCQVBsQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSw2QkFBNkI7b0JBQ3ZDLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsaUJBQWlCO3FCQUMzQjtvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqIENsYXNzIGFkZGVkIHdoZW4gdGhlIGxpbmUgcmlwcGxlIGlzIGFjdGl2ZS4gKi9cbmNvbnN0IEFDVElWQVRFX0NMQVNTID0gJ21kYy1saW5lLXJpcHBsZS0tYWN0aXZlJztcblxuLyoqIENsYXNzIGFkZGVkIHdoZW4gdGhlIGxpbmUgcmlwcGxlIGlzIGJlaW5nIGRlYWN0aXZhdGVkLiAqL1xuY29uc3QgREVBQ1RJVkFUSU5HX0NMQVNTID0gJ21kYy1saW5lLXJpcHBsZS0tZGVhY3RpdmF0aW5nJztcblxuLyoqXG4gKiBJbnRlcm5hbCBkaXJlY3RpdmUgdGhhdCBjcmVhdGVzIGFuIGluc3RhbmNlIG9mIHRoZSBNREMgbGluZS1yaXBwbGUgY29tcG9uZW50LiBVc2luZyBhXG4gKiBkaXJlY3RpdmUgYWxsb3dzIHVzIHRvIGNvbmRpdGlvbmFsbHkgcmVuZGVyIGEgbGluZS1yaXBwbGUgaW4gdGhlIHRlbXBsYXRlIHdpdGhvdXQgaGF2aW5nXG4gKiB0byBtYW51YWxseSBjcmVhdGUgYW5kIGRlc3Ryb3kgdGhlIGBNRENMaW5lUmlwcGxlYCBjb21wb25lbnQgd2hlbmV2ZXIgdGhlIGNvbmRpdGlvbiBjaGFuZ2VzLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgc2V0cyB1cCB0aGUgc3R5bGVzIGZvciB0aGUgbGluZS1yaXBwbGUgYW5kIHByb3ZpZGVzIGFuIEFQSSBmb3IgYWN0aXZhdGluZ1xuICogYW5kIGRlYWN0aXZhdGluZyB0aGUgbGluZS1yaXBwbGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2RpdlttYXRGb3JtRmllbGRMaW5lUmlwcGxlXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWRjLWxpbmUtcmlwcGxlJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Rm9ybUZpZWxkTGluZVJpcHBsZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIG5nWm9uZTogTmdab25lLFxuICApIHtcbiAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgdGhpcy5faGFuZGxlVHJhbnNpdGlvbkVuZCk7XG4gICAgfSk7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICBjb25zdCBjbGFzc0xpc3QgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0O1xuICAgIGNsYXNzTGlzdC5yZW1vdmUoREVBQ1RJVkFUSU5HX0NMQVNTKTtcbiAgICBjbGFzc0xpc3QuYWRkKEFDVElWQVRFX0NMQVNTKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoREVBQ1RJVkFUSU5HX0NMQVNTKTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZVRyYW5zaXRpb25FbmQgPSAoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3Q7XG4gICAgY29uc3QgaXNEZWFjdGl2YXRpbmcgPSBjbGFzc0xpc3QuY29udGFpbnMoREVBQ1RJVkFUSU5HX0NMQVNTKTtcblxuICAgIGlmIChldmVudC5wcm9wZXJ0eU5hbWUgPT09ICdvcGFjaXR5JyAmJiBpc0RlYWN0aXZhdGluZykge1xuICAgICAgY2xhc3NMaXN0LnJlbW92ZShBQ1RJVkFURV9DTEFTUywgREVBQ1RJVkFUSU5HX0NMQVNTKTtcbiAgICB9XG4gIH07XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCB0aGlzLl9oYW5kbGVUcmFuc2l0aW9uRW5kKTtcbiAgfVxufVxuIl19