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
export const MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MatSlideToggleRequiredValidator),
    multi: true,
};
/**
 * Validator for Material slide-toggle components with the required attribute in a
 * template-driven form. The default validator for required form controls asserts
 * that the control value is not undefined but that is not appropriate for a slide-toggle
 * where the value is always defined.
 *
 * Required slide-toggle form controls are valid when checked.
 *
 * @deprecated No longer used, `MatCheckbox` implements required validation directly.
 * @breaking-change 19.0.0
 */
export class MatSlideToggleRequiredValidator extends CheckboxRequiredValidator {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlideToggleRequiredValidator, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatSlideToggleRequiredValidator, isStandalone: true, selector: "mat-slide-toggle[required][formControlName],\n             mat-slide-toggle[required][formControl], mat-slide-toggle[required][ngModel]", providers: [MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlideToggleRequiredValidator, decorators: [{
            type: Directive,
            args: [{
                    selector: `mat-slide-toggle[required][formControlName],
             mat-slide-toggle[required][formControl], mat-slide-toggle[required][ngModel]`,
                    providers: [MAT_SLIDE_TOGGLE_REQUIRED_VALIDATOR],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGUtdG9nZ2xlLXJlcXVpcmVkLXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbGlkZS10b2dnbGUvc2xpZGUtdG9nZ2xlLXJlcXVpcmVkLXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBVyxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBRXhFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1DQUFtQyxHQUFhO0lBQzNELE9BQU8sRUFBRSxhQUFhO0lBQ3RCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsK0JBQStCLENBQUM7SUFDOUQsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDO0FBRUY7Ozs7Ozs7Ozs7R0FVRztBQU9ILE1BQU0sT0FBTywrQkFBZ0MsU0FBUSx5QkFBeUI7cUhBQWpFLCtCQUErQjt5R0FBL0IsK0JBQStCLHNMQUgvQixDQUFDLG1DQUFtQyxDQUFDOztrR0FHckMsK0JBQStCO2tCQU4zQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRTswRkFDOEU7b0JBQ3hGLFNBQVMsRUFBRSxDQUFDLG1DQUFtQyxDQUFDO29CQUNoRCxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvciwgTkdfVkFMSURBVE9SU30gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIE5vIGxvbmdlciB1c2VkLCBgTWF0Q2hlY2tib3hgIGltcGxlbWVudHMgcmVxdWlyZWQgdmFsaWRhdGlvbiBkaXJlY3RseS5cbiAqIEBicmVha2luZy1jaGFuZ2UgMTkuMC4wXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfU0xJREVfVE9HR0xFX1JFUVVJUkVEX1ZBTElEQVRPUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hdFNsaWRlVG9nZ2xlUmVxdWlyZWRWYWxpZGF0b3IpLFxuICBtdWx0aTogdHJ1ZSxcbn07XG5cbi8qKlxuICogVmFsaWRhdG9yIGZvciBNYXRlcmlhbCBzbGlkZS10b2dnbGUgY29tcG9uZW50cyB3aXRoIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgaW4gYVxuICogdGVtcGxhdGUtZHJpdmVuIGZvcm0uIFRoZSBkZWZhdWx0IHZhbGlkYXRvciBmb3IgcmVxdWlyZWQgZm9ybSBjb250cm9scyBhc3NlcnRzXG4gKiB0aGF0IHRoZSBjb250cm9sIHZhbHVlIGlzIG5vdCB1bmRlZmluZWQgYnV0IHRoYXQgaXMgbm90IGFwcHJvcHJpYXRlIGZvciBhIHNsaWRlLXRvZ2dsZVxuICogd2hlcmUgdGhlIHZhbHVlIGlzIGFsd2F5cyBkZWZpbmVkLlxuICpcbiAqIFJlcXVpcmVkIHNsaWRlLXRvZ2dsZSBmb3JtIGNvbnRyb2xzIGFyZSB2YWxpZCB3aGVuIGNoZWNrZWQuXG4gKlxuICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIHVzZWQsIGBNYXRDaGVja2JveGAgaW1wbGVtZW50cyByZXF1aXJlZCB2YWxpZGF0aW9uIGRpcmVjdGx5LlxuICogQGJyZWFraW5nLWNoYW5nZSAxOS4wLjBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiBgbWF0LXNsaWRlLXRvZ2dsZVtyZXF1aXJlZF1bZm9ybUNvbnRyb2xOYW1lXSxcbiAgICAgICAgICAgICBtYXQtc2xpZGUtdG9nZ2xlW3JlcXVpcmVkXVtmb3JtQ29udHJvbF0sIG1hdC1zbGlkZS10b2dnbGVbcmVxdWlyZWRdW25nTW9kZWxdYCxcbiAgcHJvdmlkZXJzOiBbTUFUX1NMSURFX1RPR0dMRV9SRVFVSVJFRF9WQUxJREFUT1JdLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTbGlkZVRvZ2dsZVJlcXVpcmVkVmFsaWRhdG9yIGV4dGVuZHMgQ2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvciB7fVxuIl19