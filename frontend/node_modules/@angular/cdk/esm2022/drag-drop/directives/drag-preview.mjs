/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken, Input, TemplateRef, booleanAttribute, inject, } from '@angular/core';
import { CDK_DRAG_PARENT } from '../drag-parent';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `CdkDragPreview`. It serves as
 * alternative token to the actual `CdkDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PREVIEW = new InjectionToken('CdkDragPreview');
/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 */
export class CdkDragPreview {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._drag = inject(CDK_DRAG_PARENT, { optional: true });
        /** Whether the preview should preserve the same size as the item that is being dragged. */
        this.matchSize = false;
        this._drag?._setPreviewTemplate(this);
    }
    ngOnDestroy() {
        this._drag?._resetPreviewTemplate(this);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPreview, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkDragPreview, isStandalone: true, selector: "ng-template[cdkDragPreview]", inputs: { data: "data", matchSize: ["matchSize", "matchSize", booleanAttribute] }, providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPreview, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkDragPreview]',
                    standalone: true,
                    providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }],
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }], propDecorators: { data: [{
                type: Input
            }], matchSize: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wcmV2aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZGlyZWN0aXZlcy9kcmFnLXByZXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxjQUFjLEVBQ2QsS0FBSyxFQUVMLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFFL0M7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFpQixnQkFBZ0IsQ0FBQyxDQUFDO0FBRXJGOzs7R0FHRztBQU1ILE1BQU0sT0FBTyxjQUFjO0lBU3pCLFlBQW1CLFdBQTJCO1FBQTNCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQVJ0QyxVQUFLLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBSzFELDJGQUEyRjtRQUNyRCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBRy9ELElBQUksQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7cUhBZlUsY0FBYzt5R0FBZCxjQUFjLDZIQU9OLGdCQUFnQixnQkFUeEIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFDLENBQUM7O2tHQUUxRCxjQUFjO2tCQUwxQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSw2QkFBNkI7b0JBQ3ZDLFVBQVUsRUFBRSxJQUFJO29CQUNoQixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLGdCQUFnQixFQUFDLENBQUM7aUJBQ3RFO2dGQUtVLElBQUk7c0JBQVosS0FBSztnQkFHZ0MsU0FBUztzQkFBOUMsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgaW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q0RLX0RSQUdfUEFSRU5UfSBmcm9tICcuLi9kcmFnLXBhcmVudCc7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgQ2RrRHJhZ1ByZXZpZXdgLiBJdCBzZXJ2ZXMgYXNcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYENka0RyYWdQcmV2aWV3YCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IENES19EUkFHX1BSRVZJRVcgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrRHJhZ1ByZXZpZXc+KCdDZGtEcmFnUHJldmlldycpO1xuXG4vKipcbiAqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgdGhlIHByZXZpZXdcbiAqIG9mIGEgQ2RrRHJhZyB3aGVuIGl0IGlzIGJlaW5nIGRyYWdnZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ25nLXRlbXBsYXRlW2Nka0RyYWdQcmV2aWV3XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBDREtfRFJBR19QUkVWSUVXLCB1c2VFeGlzdGluZzogQ2RrRHJhZ1ByZXZpZXd9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRHJhZ1ByZXZpZXc8VCA9IGFueT4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kcmFnID0gaW5qZWN0KENES19EUkFHX1BBUkVOVCwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIENvbnRleHQgZGF0YSB0byBiZSBhZGRlZCB0byB0aGUgcHJldmlldyB0ZW1wbGF0ZSBpbnN0YW5jZS4gKi9cbiAgQElucHV0KCkgZGF0YTogVDtcblxuICAvKiogV2hldGhlciB0aGUgcHJldmlldyBzaG91bGQgcHJlc2VydmUgdGhlIHNhbWUgc2l6ZSBhcyB0aGUgaXRlbSB0aGF0IGlzIGJlaW5nIGRyYWdnZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgbWF0Y2hTaXplOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxUPikge1xuICAgIHRoaXMuX2RyYWc/Ll9zZXRQcmV2aWV3VGVtcGxhdGUodGhpcyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kcmFnPy5fcmVzZXRQcmV2aWV3VGVtcGxhdGUodGhpcyk7XG4gIH1cbn1cbiJdfQ==