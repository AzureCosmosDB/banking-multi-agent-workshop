/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Attribute, Directive, ElementRef, InjectionToken, Input } from '@angular/core';
import * as i0 from "@angular/core";
let nextUniqueId = 0;
/**
 * Injection token that can be used to reference instances of `MatError`. It serves as
 * alternative token to the actual `MatError` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_ERROR = new InjectionToken('MatError');
/** Single error message to be shown underneath the form-field. */
export class MatError {
    constructor(ariaLive, elementRef) {
        this.id = `mat-mdc-error-${nextUniqueId++}`;
        // If no aria-live value is set add 'polite' as a default. This is preferred over setting
        // role='alert' so that screen readers do not interrupt the current task to read this aloud.
        if (!ariaLive) {
            elementRef.nativeElement.setAttribute('aria-live', 'polite');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatError, deps: [{ token: 'aria-live', attribute: true }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatError, isStandalone: true, selector: "mat-error, [matError]", inputs: { id: "id" }, host: { attributes: { "aria-atomic": "true" }, properties: { "id": "id" }, classAttribute: "mat-mdc-form-field-error mat-mdc-form-field-bottom-align" }, providers: [{ provide: MAT_ERROR, useExisting: MatError }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatError, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-error, [matError]',
                    host: {
                        'class': 'mat-mdc-form-field-error mat-mdc-form-field-bottom-align',
                        'aria-atomic': 'true',
                        '[id]': 'id',
                    },
                    providers: [{ provide: MAT_ERROR, useExisting: MatError }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['aria-live']
                }] }, { type: i0.ElementRef }], propDecorators: { id: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZm9ybS1maWVsZC9kaXJlY3RpdmVzL2Vycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUV0RixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFFckI7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBVyxVQUFVLENBQUMsQ0FBQztBQUVsRSxrRUFBa0U7QUFXbEUsTUFBTSxPQUFPLFFBQVE7SUFHbkIsWUFBb0MsUUFBZ0IsRUFBRSxVQUFzQjtRQUZuRSxPQUFFLEdBQVcsaUJBQWlCLFlBQVksRUFBRSxFQUFFLENBQUM7UUFHdEQseUZBQXlGO1FBQ3pGLDRGQUE0RjtRQUM1RixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxVQUFVLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0QsQ0FBQztJQUNILENBQUM7cUhBVFUsUUFBUSxrQkFHSSxXQUFXO3lHQUh2QixRQUFRLG1QQUhSLENBQUMsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUMsQ0FBQzs7a0dBRzdDLFFBQVE7a0JBVnBCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSwwREFBMEQ7d0JBQ25FLGFBQWEsRUFBRSxNQUFNO3dCQUNyQixNQUFNLEVBQUUsSUFBSTtxQkFDYjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxVQUFVLEVBQUMsQ0FBQztvQkFDeEQsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkFJYyxTQUFTOzJCQUFDLFdBQVc7a0VBRnpCLEVBQUU7c0JBQVYsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0F0dHJpYnV0ZSwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3Rpb25Ub2tlbiwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5sZXQgbmV4dFVuaXF1ZUlkID0gMDtcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byByZWZlcmVuY2UgaW5zdGFuY2VzIG9mIGBNYXRFcnJvcmAuIEl0IHNlcnZlcyBhc1xuICogYWx0ZXJuYXRpdmUgdG9rZW4gdG8gdGhlIGFjdHVhbCBgTWF0RXJyb3JgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgTUFUX0VSUk9SID0gbmV3IEluamVjdGlvblRva2VuPE1hdEVycm9yPignTWF0RXJyb3InKTtcblxuLyoqIFNpbmdsZSBlcnJvciBtZXNzYWdlIHRvIGJlIHNob3duIHVuZGVybmVhdGggdGhlIGZvcm0tZmllbGQuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtZXJyb3IsIFttYXRFcnJvcl0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtZm9ybS1maWVsZC1lcnJvciBtYXQtbWRjLWZvcm0tZmllbGQtYm90dG9tLWFsaWduJyxcbiAgICAnYXJpYS1hdG9taWMnOiAndHJ1ZScsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICB9LFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTUFUX0VSUk9SLCB1c2VFeGlzdGluZzogTWF0RXJyb3J9XSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RXJyb3Ige1xuICBASW5wdXQoKSBpZDogc3RyaW5nID0gYG1hdC1tZGMtZXJyb3ItJHtuZXh0VW5pcXVlSWQrK31gO1xuXG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScpIGFyaWFMaXZlOiBzdHJpbmcsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAvLyBJZiBubyBhcmlhLWxpdmUgdmFsdWUgaXMgc2V0IGFkZCAncG9saXRlJyBhcyBhIGRlZmF1bHQuIFRoaXMgaXMgcHJlZmVycmVkIG92ZXIgc2V0dGluZ1xuICAgIC8vIHJvbGU9J2FsZXJ0JyBzbyB0aGF0IHNjcmVlbiByZWFkZXJzIGRvIG5vdCBpbnRlcnJ1cHQgdGhlIGN1cnJlbnQgdGFzayB0byByZWFkIHRoaXMgYWxvdWQuXG4gICAgaWYgKCFhcmlhTGl2ZSkge1xuICAgICAgZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgIH1cbiAgfVxufVxuIl19