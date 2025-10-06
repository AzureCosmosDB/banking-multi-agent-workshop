/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Internal shared component used as a container in form field controls.
 * Not to be confused with `mat-form-field` which MDC calls a "text field".
 * @docs-private
 */
export class _MatInternalFormField {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatInternalFormField, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: _MatInternalFormField, isStandalone: true, selector: "div[mat-internal-form-field]", inputs: { labelPosition: "labelPosition" }, host: { properties: { "class.mdc-form-field--align-end": "labelPosition === \"before\"" }, classAttribute: "mdc-form-field mat-internal-form-field" }, ngImport: i0, template: '<ng-content></ng-content>', isInline: true, styles: [".mat-internal-form-field{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-flex;align-items:center;vertical-align:middle}.mat-internal-form-field>label{margin-left:0;margin-right:auto;padding-left:4px;padding-right:0;order:0}[dir=rtl] .mat-internal-form-field>label{margin-left:auto;margin-right:0;padding-left:0;padding-right:4px}.mdc-form-field--align-end>label{margin-left:auto;margin-right:0;padding-left:0;padding-right:4px;order:-1}[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label{margin-left:0;margin-right:auto;padding-left:4px;padding-right:0}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatInternalFormField, decorators: [{
            type: Component,
            args: [{ selector: 'div[mat-internal-form-field]', standalone: true, template: '<ng-content></ng-content>', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        'class': 'mdc-form-field mat-internal-form-field',
                        '[class.mdc-form-field--align-end]': 'labelPosition === "before"',
                    }, styles: [".mat-internal-form-field{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-flex;align-items:center;vertical-align:middle}.mat-internal-form-field>label{margin-left:0;margin-right:auto;padding-left:4px;padding-right:0;order:0}[dir=rtl] .mat-internal-form-field>label{margin-left:auto;margin-right:0;padding-left:0;padding-right:4px}.mdc-form-field--align-end>label{margin-left:auto;margin-right:0;padding-left:0;padding-right:4px;order:-1}[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label{margin-left:0;margin-right:auto;padding-left:4px;padding-right:0}"] }]
        }], propDecorators: { labelPosition: [{
                type: Input,
                args: [{ required: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJuYWwtZm9ybS1maWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL2ludGVybmFsLWZvcm0tZmllbGQvaW50ZXJuYWwtZm9ybS1maWVsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFM0Y7Ozs7R0FJRztBQWNILE1BQU0sT0FBTyxxQkFBcUI7cUhBQXJCLHFCQUFxQjt5R0FBckIscUJBQXFCLDJSQVR0QiwyQkFBMkI7O2tHQVMxQixxQkFBcUI7a0JBYmpDLFNBQVM7K0JBRUUsOEJBQThCLGNBQzVCLElBQUksWUFDTiwyQkFBMkIsaUJBRXRCLGlCQUFpQixDQUFDLElBQUksbUJBQ3BCLHVCQUF1QixDQUFDLE1BQU0sUUFDekM7d0JBQ0osT0FBTyxFQUFFLHdDQUF3Qzt3QkFDakQsbUNBQW1DLEVBQUUsNEJBQTRCO3FCQUNsRTs4QkFJd0IsYUFBYTtzQkFBckMsS0FBSzt1QkFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBJbnB1dCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEludGVybmFsIHNoYXJlZCBjb21wb25lbnQgdXNlZCBhcyBhIGNvbnRhaW5lciBpbiBmb3JtIGZpZWxkIGNvbnRyb2xzLlxuICogTm90IHRvIGJlIGNvbmZ1c2VkIHdpdGggYG1hdC1mb3JtLWZpZWxkYCB3aGljaCBNREMgY2FsbHMgYSBcInRleHQgZmllbGRcIi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIC8vIFVzZSBhIGBkaXZgIHNlbGVjdG9yIHRvIG1hdGNoIHRoZSBvbGQgbWFya3VwIGNsb3Nlci5cbiAgc2VsZWN0b3I6ICdkaXZbbWF0LWludGVybmFsLWZvcm0tZmllbGRdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgdGVtcGxhdGU6ICc8bmctY29udGVudD48L25nLWNvbnRlbnQ+JyxcbiAgc3R5bGVVcmw6ICdpbnRlcm5hbC1mb3JtLWZpZWxkLmNzcycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21kYy1mb3JtLWZpZWxkIG1hdC1pbnRlcm5hbC1mb3JtLWZpZWxkJyxcbiAgICAnW2NsYXNzLm1kYy1mb3JtLWZpZWxkLS1hbGlnbi1lbmRdJzogJ2xhYmVsUG9zaXRpb24gPT09IFwiYmVmb3JlXCInLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBfTWF0SW50ZXJuYWxGb3JtRmllbGQge1xuICAvKiogUG9zaXRpb24gb2YgdGhlIGxhYmVsIHJlbGF0aXZlIHRvIHRoZSBjb250ZW50LiAqL1xuICBASW5wdXQoe3JlcXVpcmVkOiB0cnVlfSkgbGFiZWxQb3NpdGlvbjogJ2JlZm9yZScgfCAnYWZ0ZXInO1xufVxuIl19