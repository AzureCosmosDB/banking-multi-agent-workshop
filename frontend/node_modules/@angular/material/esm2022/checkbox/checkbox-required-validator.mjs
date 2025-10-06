/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, forwardRef } from '@angular/core';
import { CheckboxRequiredValidator, NG_VALIDATORS } from '@angular/forms';
import * as i0 from "@angular/core";
/**
 * @deprecated No longer used, `MatCheckbox` implements required validation directly.
 * @breaking-change 19.0.0
 */
export const MAT_CHECKBOX_REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MatCheckboxRequiredValidator),
    multi: true,
};
/**
 * Validator for Material checkbox's required attribute in template-driven checkbox.
 * Current CheckboxRequiredValidator only work with `input type=checkbox` and does not
 * work with `mat-checkbox`.
 *
 * @deprecated No longer used, `MatCheckbox` implements required validation directly.
 * @breaking-change 19.0.0
 */
export class MatCheckboxRequiredValidator extends CheckboxRequiredValidator {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCheckboxRequiredValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCheckboxRequiredValidator, isStandalone: true, selector: "mat-checkbox[required][formControlName],\n             mat-checkbox[required][formControl], mat-checkbox[required][ngModel]", providers: [MAT_CHECKBOX_REQUIRED_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCheckboxRequiredValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: `mat-checkbox[required][formControlName],
             mat-checkbox[required][formControl], mat-checkbox[required][ngModel]`,
                    providers: [MAT_CHECKBOX_REQUIRED_VALIDATOR],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3gtcmVxdWlyZWQtdmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoZWNrYm94L2NoZWNrYm94LXJlcXVpcmVkLXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBVyxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBRXhFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFhO0lBQ3ZELE9BQU8sRUFBRSxhQUFhO0lBQ3RCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsNEJBQTRCLENBQUM7SUFDM0QsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDO0FBRUY7Ozs7Ozs7R0FPRztBQU9ILE1BQU0sT0FBTyw0QkFBNkIsU0FBUSx5QkFBeUI7cUhBQTlELDRCQUE0Qjt5R0FBNUIsNEJBQTRCLDBLQUg1QixDQUFDLCtCQUErQixDQUFDOztrR0FHakMsNEJBQTRCO2tCQU54QyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRTtrRkFDc0U7b0JBQ2hGLFNBQVMsRUFBRSxDQUFDLCtCQUErQixDQUFDO29CQUM1QyxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvciwgTkdfVkFMSURBVE9SU30gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIE5vIGxvbmdlciB1c2VkLCBgTWF0Q2hlY2tib3hgIGltcGxlbWVudHMgcmVxdWlyZWQgdmFsaWRhdGlvbiBkaXJlY3RseS5cbiAqIEBicmVha2luZy1jaGFuZ2UgMTkuMC4wXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQ0hFQ0tCT1hfUkVRVUlSRURfVkFMSURBVE9SOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0Q2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvciksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuLyoqXG4gKiBWYWxpZGF0b3IgZm9yIE1hdGVyaWFsIGNoZWNrYm94J3MgcmVxdWlyZWQgYXR0cmlidXRlIGluIHRlbXBsYXRlLWRyaXZlbiBjaGVja2JveC5cbiAqIEN1cnJlbnQgQ2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvciBvbmx5IHdvcmsgd2l0aCBgaW5wdXQgdHlwZT1jaGVja2JveGAgYW5kIGRvZXMgbm90XG4gKiB3b3JrIHdpdGggYG1hdC1jaGVja2JveGAuXG4gKlxuICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIHVzZWQsIGBNYXRDaGVja2JveGAgaW1wbGVtZW50cyByZXF1aXJlZCB2YWxpZGF0aW9uIGRpcmVjdGx5LlxuICogQGJyZWFraW5nLWNoYW5nZSAxOS4wLjBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiBgbWF0LWNoZWNrYm94W3JlcXVpcmVkXVtmb3JtQ29udHJvbE5hbWVdLFxuICAgICAgICAgICAgIG1hdC1jaGVja2JveFtyZXF1aXJlZF1bZm9ybUNvbnRyb2xdLCBtYXQtY2hlY2tib3hbcmVxdWlyZWRdW25nTW9kZWxdYCxcbiAgcHJvdmlkZXJzOiBbTUFUX0NIRUNLQk9YX1JFUVVJUkVEX1ZBTElEQVRPUl0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENoZWNrYm94UmVxdWlyZWRWYWxpZGF0b3IgZXh0ZW5kcyBDaGVja2JveFJlcXVpcmVkVmFsaWRhdG9yIHt9XG4iXX0=