/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef, Input, InjectionToken, inject } from '@angular/core';
import { CDK_DRAG_PARENT } from '../drag-parent';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `CdkDragPlaceholder`. It serves as
 * alternative token to the actual `CdkDragPlaceholder` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PLACEHOLDER = new InjectionToken('CdkDragPlaceholder');
/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
export class CdkDragPlaceholder {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._drag = inject(CDK_DRAG_PARENT, { optional: true });
        this._drag?._setPlaceholderTemplate(this);
    }
    ngOnDestroy() {
        this._drag?._resetPlaceholderTemplate(this);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPlaceholder, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkDragPlaceholder, isStandalone: true, selector: "ng-template[cdkDragPlaceholder]", inputs: { data: "data" }, providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDragPlaceholder, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkDragPlaceholder]',
                    standalone: true,
                    providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }],
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }], propDecorators: { data: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wbGFjZWhvbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RpcmVjdGl2ZXMvZHJhZy1wbGFjZWhvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUMvRixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBRS9DOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGNBQWMsQ0FBcUIsb0JBQW9CLENBQUMsQ0FBQztBQUVqRzs7O0dBR0c7QUFNSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQW1CLFdBQTJCO1FBQTNCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUx0QyxVQUFLLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBTXhELElBQUksQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7cUhBWlUsa0JBQWtCO3lHQUFsQixrQkFBa0Isd0dBRmxCLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLENBQUM7O2tHQUVsRSxrQkFBa0I7a0JBTDlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGlDQUFpQztvQkFDM0MsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsb0JBQW9CLEVBQUMsQ0FBQztpQkFDOUU7Z0ZBS1UsSUFBSTtzQkFBWixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiwgSW5wdXQsIEluamVjdGlvblRva2VuLCBpbmplY3QsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NES19EUkFHX1BBUkVOVH0gZnJvbSAnLi4vZHJhZy1wYXJlbnQnO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0RyYWdQbGFjZWhvbGRlcmAuIEl0IHNlcnZlcyBhc1xuICogYWx0ZXJuYXRpdmUgdG9rZW4gdG8gdGhlIGFjdHVhbCBgQ2RrRHJhZ1BsYWNlaG9sZGVyYCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IENES19EUkFHX1BMQUNFSE9MREVSID0gbmV3IEluamVjdGlvblRva2VuPENka0RyYWdQbGFjZWhvbGRlcj4oJ0Nka0RyYWdQbGFjZWhvbGRlcicpO1xuXG4vKipcbiAqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgdGhlIHBsYWNlaG9sZGVyIG9mIGEgQ2RrRHJhZyB3aGVuXG4gKiBpdCBpcyBiZWluZyBkcmFnZ2VkLiBUaGUgcGxhY2Vob2xkZXIgaXMgZGlzcGxheWVkIGluIHBsYWNlIG9mIHRoZSBlbGVtZW50IGJlaW5nIGRyYWdnZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ25nLXRlbXBsYXRlW2Nka0RyYWdQbGFjZWhvbGRlcl0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfUExBQ0VIT0xERVIsIHVzZUV4aXN0aW5nOiBDZGtEcmFnUGxhY2Vob2xkZXJ9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRHJhZ1BsYWNlaG9sZGVyPFQgPSBhbnk+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZHJhZyA9IGluamVjdChDREtfRFJBR19QQVJFTlQsIHtvcHRpb25hbDogdHJ1ZX0pO1xuXG4gIC8qKiBDb250ZXh0IGRhdGEgdG8gYmUgYWRkZWQgdG8gdGhlIHBsYWNlaG9sZGVyIHRlbXBsYXRlIGluc3RhbmNlLiAqL1xuICBASW5wdXQoKSBkYXRhOiBUO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8VD4pIHtcbiAgICB0aGlzLl9kcmFnPy5fc2V0UGxhY2Vob2xkZXJUZW1wbGF0ZSh0aGlzKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2RyYWc/Ll9yZXNldFBsYWNlaG9sZGVyVGVtcGxhdGUodGhpcyk7XG4gIH1cbn1cbiJdfQ==