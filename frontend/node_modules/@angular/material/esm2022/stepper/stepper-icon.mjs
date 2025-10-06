/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Template to be used to override the icons inside the step header.
 */
export class MatStepperIcon {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIcon, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepperIcon, isStandalone: true, selector: "ng-template[matStepperIcon]", inputs: { name: ["matStepperIcon", "name"] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIcon, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[matStepperIcon]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }], propDecorators: { name: [{
                type: Input,
                args: ['matStepperIcon']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1pY29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3N0ZXBwZXIvc3RlcHBlci1pY29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFhNUQ7O0dBRUc7QUFLSCxNQUFNLE9BQU8sY0FBYztJQUl6QixZQUFtQixXQUErQztRQUEvQyxnQkFBVyxHQUFYLFdBQVcsQ0FBb0M7SUFBRyxDQUFDO3FIQUozRCxjQUFjO3lHQUFkLGNBQWM7O2tHQUFkLGNBQWM7a0JBSjFCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDZCQUE2QjtvQkFDdkMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2dGQUcwQixJQUFJO3NCQUE1QixLQUFLO3VCQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXQsIFRlbXBsYXRlUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3RlcFN0YXRlfSBmcm9tICdAYW5ndWxhci9jZGsvc3RlcHBlcic7XG5cbi8qKiBUZW1wbGF0ZSBjb250ZXh0IGF2YWlsYWJsZSB0byBhbiBhdHRhY2hlZCBgbWF0U3RlcHBlckljb25gLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRTdGVwcGVySWNvbkNvbnRleHQge1xuICAvKiogSW5kZXggb2YgdGhlIHN0ZXAuICovXG4gIGluZGV4OiBudW1iZXI7XG4gIC8qKiBXaGV0aGVyIHRoZSBzdGVwIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHN0ZXAgaXMgb3B0aW9uYWwuICovXG4gIG9wdGlvbmFsOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFRlbXBsYXRlIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGljb25zIGluc2lkZSB0aGUgc3RlcCBoZWFkZXIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ25nLXRlbXBsYXRlW21hdFN0ZXBwZXJJY29uXScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFN0ZXBwZXJJY29uIHtcbiAgLyoqIE5hbWUgb2YgdGhlIGljb24gdG8gYmUgb3ZlcnJpZGRlbi4gKi9cbiAgQElucHV0KCdtYXRTdGVwcGVySWNvbicpIG5hbWU6IFN0ZXBTdGF0ZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE1hdFN0ZXBwZXJJY29uQ29udGV4dD4pIHt9XG59XG4iXX0=