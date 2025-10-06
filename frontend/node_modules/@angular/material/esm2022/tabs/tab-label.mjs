/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, InjectionToken, Optional, TemplateRef, ViewContainerRef, } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `MatTabLabel`. It serves as
 * alternative token to the actual `MatTabLabel` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_TAB_LABEL = new InjectionToken('MatTabLabel');
/**
 * Used to provide a tab label to a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB = new InjectionToken('MAT_TAB');
/** Used to flag tab labels for use with the portal directive */
export class MatTabLabel extends CdkPortal {
    constructor(templateRef, viewContainerRef, _closestTab) {
        super(templateRef, viewContainerRef);
        this._closestTab = _closestTab;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTabLabel, deps: [{ token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: MAT_TAB, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatTabLabel, isStandalone: true, selector: "[mat-tab-label], [matTabLabel]", providers: [{ provide: MAT_TAB_LABEL, useExisting: MatTabLabel }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTabLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-tab-label], [matTabLabel]',
                    providers: [{ provide: MAT_TAB_LABEL, useExisting: MatTabLabel }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_TAB]
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLWxhYmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEVBQ1IsV0FBVyxFQUNYLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0scUJBQXFCLENBQUM7O0FBRTlDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxjQUFjLENBQWMsYUFBYSxDQUFDLENBQUM7QUFFNUU7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLElBQUksY0FBYyxDQUFNLFNBQVMsQ0FBQyxDQUFDO0FBRTFELGdFQUFnRTtBQU1oRSxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFDeEMsWUFDRSxXQUE2QixFQUM3QixnQkFBa0MsRUFDRSxXQUFnQjtRQUVwRCxLQUFLLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFGRCxnQkFBVyxHQUFYLFdBQVcsQ0FBSztJQUd0RCxDQUFDO3FIQVBVLFdBQVcsNkVBSVosT0FBTzt5R0FKTixXQUFXLDZFQUhYLENBQUMsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUMsQ0FBQzs7a0dBR3BELFdBQVc7a0JBTHZCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGdDQUFnQztvQkFDMUMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsYUFBYSxFQUFDLENBQUM7b0JBQy9ELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBS0ksTUFBTTsyQkFBQyxPQUFPOzswQkFBRyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgT3B0aW9uYWwsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byByZWZlcmVuY2UgaW5zdGFuY2VzIG9mIGBNYXRUYWJMYWJlbGAuIEl0IHNlcnZlcyBhc1xuICogYWx0ZXJuYXRpdmUgdG9rZW4gdG8gdGhlIGFjdHVhbCBgTWF0VGFiTGFiZWxgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgTUFUX1RBQl9MQUJFTCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRUYWJMYWJlbD4oJ01hdFRhYkxhYmVsJyk7XG5cbi8qKlxuICogVXNlZCB0byBwcm92aWRlIGEgdGFiIGxhYmVsIHRvIGEgdGFiIHdpdGhvdXQgY2F1c2luZyBhIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfVEFCID0gbmV3IEluamVjdGlvblRva2VuPGFueT4oJ01BVF9UQUInKTtcblxuLyoqIFVzZWQgdG8gZmxhZyB0YWIgbGFiZWxzIGZvciB1c2Ugd2l0aCB0aGUgcG9ydGFsIGRpcmVjdGl2ZSAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdC10YWItbGFiZWxdLCBbbWF0VGFiTGFiZWxdJyxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9UQUJfTEFCRUwsIHVzZUV4aXN0aW5nOiBNYXRUYWJMYWJlbH1dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUYWJMYWJlbCBleHRlbmRzIENka1BvcnRhbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChNQVRfVEFCKSBAT3B0aW9uYWwoKSBwdWJsaWMgX2Nsb3Nlc3RUYWI6IGFueSxcbiAgKSB7XG4gICAgc3VwZXIodGVtcGxhdGVSZWYsIHZpZXdDb250YWluZXJSZWYpO1xuICB9XG59XG4iXX0=