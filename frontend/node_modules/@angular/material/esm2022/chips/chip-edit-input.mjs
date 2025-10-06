/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
/**
 * A directive that makes a span editable and exposes functions to modify and retrieve the
 * element's contents.
 */
export class MatChipEditInput {
    constructor(_elementRef, _document) {
        this._elementRef = _elementRef;
        this._document = _document;
    }
    initialize(initialValue) {
        this.getNativeElement().focus();
        this.setValue(initialValue);
    }
    getNativeElement() {
        return this._elementRef.nativeElement;
    }
    setValue(value) {
        this.getNativeElement().textContent = value;
        this._moveCursorToEndOfInput();
    }
    getValue() {
        return this.getNativeElement().textContent || '';
    }
    _moveCursorToEndOfInput() {
        const range = this._document.createRange();
        range.selectNodeContents(this.getNativeElement());
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipEditInput, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatChipEditInput, isStandalone: true, selector: "span[matChipEditInput]", host: { attributes: { "role": "textbox", "tabindex": "-1", "contenteditable": "true" }, classAttribute: "mat-chip-edit-input" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipEditInput, decorators: [{
            type: Directive,
            args: [{
                    selector: 'span[matChipEditInput]',
                    host: {
                        'class': 'mat-chip-edit-input',
                        'role': 'textbox',
                        'tabindex': '-1',
                        'contenteditable': 'true',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1lZGl0LWlucHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoaXBzL2NoaXAtZWRpdC1pbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUV6Qzs7O0dBR0c7QUFXSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ21CLFdBQXVCLEVBQ0wsU0FBYztRQURoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUNMLGNBQVMsR0FBVCxTQUFTLENBQUs7SUFDaEQsQ0FBQztJQUVKLFVBQVUsQ0FBQyxZQUFvQjtRQUM3QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBYTtRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQzVDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUNsRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUcsQ0FBQztRQUNuQyxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QixDQUFDO3FIQS9CVSxnQkFBZ0IsNENBR2pCLFFBQVE7eUdBSFAsZ0JBQWdCOztrR0FBaEIsZ0JBQWdCO2tCQVY1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUscUJBQXFCO3dCQUM5QixNQUFNLEVBQUUsU0FBUzt3QkFDakIsVUFBVSxFQUFFLElBQUk7d0JBQ2hCLGlCQUFpQixFQUFFLE1BQU07cUJBQzFCO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBSUksTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IG1ha2VzIGEgc3BhbiBlZGl0YWJsZSBhbmQgZXhwb3NlcyBmdW5jdGlvbnMgdG8gbW9kaWZ5IGFuZCByZXRyaWV2ZSB0aGVcbiAqIGVsZW1lbnQncyBjb250ZW50cy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnc3BhblttYXRDaGlwRWRpdElucHV0XScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWNoaXAtZWRpdC1pbnB1dCcsXG4gICAgJ3JvbGUnOiAndGV4dGJveCcsXG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAnY29udGVudGVkaXRhYmxlJzogJ3RydWUnLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDaGlwRWRpdElucHV0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogYW55LFxuICApIHt9XG5cbiAgaW5pdGlhbGl6ZShpbml0aWFsVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2V0TmF0aXZlRWxlbWVudCgpLmZvY3VzKCk7XG4gICAgdGhpcy5zZXRWYWx1ZShpbml0aWFsVmFsdWUpO1xuICB9XG5cbiAgZ2V0TmF0aXZlRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgfVxuXG4gIHNldFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdldE5hdGl2ZUVsZW1lbnQoKS50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgIHRoaXMuX21vdmVDdXJzb3JUb0VuZE9mSW5wdXQoKTtcbiAgfVxuXG4gIGdldFZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TmF0aXZlRWxlbWVudCgpLnRleHRDb250ZW50IHx8ICcnO1xuICB9XG5cbiAgcHJpdmF0ZSBfbW92ZUN1cnNvclRvRW5kT2ZJbnB1dCgpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKHRoaXMuZ2V0TmF0aXZlRWxlbWVudCgpKTtcbiAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XG4gICAgY29uc3Qgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpITtcbiAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcbiAgfVxufVxuIl19