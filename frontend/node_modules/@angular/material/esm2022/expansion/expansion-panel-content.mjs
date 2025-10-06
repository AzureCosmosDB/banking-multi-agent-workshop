/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef, Inject, Optional } from '@angular/core';
import { MAT_EXPANSION_PANEL } from './expansion-panel-base';
import * as i0 from "@angular/core";
/**
 * Expansion panel content that will be rendered lazily
 * after the panel is opened for the first time.
 */
export class MatExpansionPanelContent {
    constructor(_template, _expansionPanel) {
        this._template = _template;
        this._expansionPanel = _expansionPanel;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatExpansionPanelContent, deps: [{ token: i0.TemplateRef }, { token: MAT_EXPANSION_PANEL, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatExpansionPanelContent, isStandalone: true, selector: "ng-template[matExpansionPanelContent]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatExpansionPanelContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[matExpansionPanelContent]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_EXPANSION_PANEL]
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5zaW9uLXBhbmVsLWNvbnRlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZXhwYW5zaW9uL2V4cGFuc2lvbi1wYW5lbC1jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkUsT0FBTyxFQUFDLG1CQUFtQixFQUF3QixNQUFNLHdCQUF3QixDQUFDOztBQUVsRjs7O0dBR0c7QUFLSCxNQUFNLE9BQU8sd0JBQXdCO0lBQ25DLFlBQ1MsU0FBMkIsRUFDYyxlQUF1QztRQURoRixjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUNjLG9CQUFlLEdBQWYsZUFBZSxDQUF3QjtJQUN0RixDQUFDO3FIQUpPLHdCQUF3Qiw2Q0FHekIsbUJBQW1CO3lHQUhsQix3QkFBd0I7O2tHQUF4Qix3QkFBd0I7a0JBSnBDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVDQUF1QztvQkFDakQsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkFJSSxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQUcsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgVGVtcGxhdGVSZWYsIEluamVjdCwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNQVRfRVhQQU5TSU9OX1BBTkVMLCBNYXRFeHBhbnNpb25QYW5lbEJhc2V9IGZyb20gJy4vZXhwYW5zaW9uLXBhbmVsLWJhc2UnO1xuXG4vKipcbiAqIEV4cGFuc2lvbiBwYW5lbCBjb250ZW50IHRoYXQgd2lsbCBiZSByZW5kZXJlZCBsYXppbHlcbiAqIGFmdGVyIHRoZSBwYW5lbCBpcyBvcGVuZWQgZm9yIHRoZSBmaXJzdCB0aW1lLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICduZy10ZW1wbGF0ZVttYXRFeHBhbnNpb25QYW5lbENvbnRlbnRdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RXhwYW5zaW9uUGFuZWxDb250ZW50IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PixcbiAgICBASW5qZWN0KE1BVF9FWFBBTlNJT05fUEFORUwpIEBPcHRpb25hbCgpIHB1YmxpYyBfZXhwYW5zaW9uUGFuZWw/OiBNYXRFeHBhbnNpb25QYW5lbEJhc2UsXG4gICkge31cbn1cbiJdfQ==