/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTreeNodePadding } from '@angular/cdk/tree';
import { Directive, Input, numberAttribute } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
export class MatTreeNodePadding extends CdkTreeNodePadding {
    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    get level() {
        return this._level;
    }
    set level(value) {
        this._setLevelInput(value);
    }
    /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
    get indent() {
        return this._indent;
    }
    set indent(indent) {
        this._setIndentInput(indent);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTreeNodePadding, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatTreeNodePadding, isStandalone: true, selector: "[matTreeNodePadding]", inputs: { level: ["matTreeNodePadding", "level", numberAttribute], indent: ["matTreeNodePaddingIndent", "indent"] }, providers: [{ provide: CdkTreeNodePadding, useExisting: MatTreeNodePadding }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTreeNodePadding, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matTreeNodePadding]',
                    providers: [{ provide: CdkTreeNodePadding, useExisting: MatTreeNodePadding }],
                    standalone: true,
                }]
        }], propDecorators: { level: [{
                type: Input,
                args: [{ alias: 'matTreeNodePadding', transform: numberAttribute }]
            }], indent: [{
                type: Input,
                args: ['matTreeNodePaddingIndent']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL3BhZGRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDckQsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUVoRTs7R0FFRztBQU1ILE1BQU0sT0FBTyxrQkFBNkIsU0FBUSxrQkFBd0I7SUFDeEUsd0ZBQXdGO0lBQ3hGLElBQ2EsS0FBSztRQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUNELElBQWEsS0FBSyxDQUFDLEtBQWE7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsOEZBQThGO0lBQzlGLElBQ2EsTUFBTTtRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUNELElBQWEsTUFBTSxDQUFDLE1BQXVCO1FBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztxSEFqQlUsa0JBQWtCO3lHQUFsQixrQkFBa0IseUdBRW1CLGVBQWUsZ0VBTHBELENBQUMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLENBQUM7O2tHQUdoRSxrQkFBa0I7a0JBTDlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxvQkFBb0IsRUFBQyxDQUFDO29CQUMzRSxVQUFVLEVBQUUsSUFBSTtpQkFDakI7OEJBSWMsS0FBSztzQkFEakIsS0FBSzt1QkFBQyxFQUFDLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFDO2dCQVVuRCxNQUFNO3NCQURsQixLQUFLO3VCQUFDLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDZGtUcmVlTm9kZVBhZGRpbmd9IGZyb20gJ0Bhbmd1bGFyL2Nkay90cmVlJztcbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dCwgbnVtYmVyQXR0cmlidXRlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVHJlZSBwYWRkaW5nIHdpdGggTWF0ZXJpYWwgZGVzaWduIHN0eWxlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdFRyZWVOb2RlUGFkZGluZ10nLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ2RrVHJlZU5vZGVQYWRkaW5nLCB1c2VFeGlzdGluZzogTWF0VHJlZU5vZGVQYWRkaW5nfV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRyZWVOb2RlUGFkZGluZzxULCBLID0gVD4gZXh0ZW5kcyBDZGtUcmVlTm9kZVBhZGRpbmc8VCwgSz4ge1xuICAvKiogVGhlIGxldmVsIG9mIGRlcHRoIG9mIHRoZSB0cmVlIG5vZGUuIFRoZSBwYWRkaW5nIHdpbGwgYmUgYGxldmVsICogaW5kZW50YCBwaXhlbHMuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdtYXRUcmVlTm9kZVBhZGRpbmcnLCB0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pXG4gIG92ZXJyaWRlIGdldCBsZXZlbCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9sZXZlbDtcbiAgfVxuICBvdmVycmlkZSBzZXQgbGV2ZWwodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX3NldExldmVsSW5wdXQodmFsdWUpO1xuICB9XG5cbiAgLyoqIFRoZSBpbmRlbnQgZm9yIGVhY2ggbGV2ZWwuIERlZmF1bHQgbnVtYmVyIDQwcHggZnJvbSBtYXRlcmlhbCBkZXNpZ24gbWVudSBzdWItbWVudSBzcGVjLiAqL1xuICBASW5wdXQoJ21hdFRyZWVOb2RlUGFkZGluZ0luZGVudCcpXG4gIG92ZXJyaWRlIGdldCBpbmRlbnQoKTogbnVtYmVyIHwgc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faW5kZW50O1xuICB9XG4gIG92ZXJyaWRlIHNldCBpbmRlbnQoaW5kZW50OiBudW1iZXIgfCBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZXRJbmRlbnRJbnB1dChpbmRlbnQpO1xuICB9XG59XG4iXX0=