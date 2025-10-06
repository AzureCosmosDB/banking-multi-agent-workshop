/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, ViewEncapsulation, ElementRef, Input, Optional, ContentChildren, QueryList, Directive, ChangeDetectionStrategy, Inject, } from '@angular/core';
import { MatLine, setLines } from '@angular/material/core';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { MAT_GRID_LIST } from './grid-list-base';
import * as i0 from "@angular/core";
export class MatGridTile {
    constructor(_element, _gridList) {
        this._element = _element;
        this._gridList = _gridList;
        this._rowspan = 1;
        this._colspan = 1;
    }
    /** Amount of rows that the grid tile takes up. */
    get rowspan() {
        return this._rowspan;
    }
    set rowspan(value) {
        this._rowspan = Math.round(coerceNumberProperty(value));
    }
    /** Amount of columns that the grid tile takes up. */
    get colspan() {
        return this._colspan;
    }
    set colspan(value) {
        this._colspan = Math.round(coerceNumberProperty(value));
    }
    /**
     * Sets the style of the grid-tile element.  Needs to be set manually to avoid
     * "Changed after checked" errors that would occur with HostBinding.
     */
    _setStyle(property, value) {
        this._element.nativeElement.style[property] = value;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTile, deps: [{ token: i0.ElementRef }, { token: MAT_GRID_LIST, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatGridTile, isStandalone: true, selector: "mat-grid-tile", inputs: { rowspan: "rowspan", colspan: "colspan" }, host: { properties: { "attr.rowspan": "rowspan", "attr.colspan": "colspan" }, classAttribute: "mat-grid-tile" }, exportAs: ["matGridTile"], ngImport: i0, template: "<div class=\"mat-grid-tile-content\">\n  <ng-content></ng-content>\n</div>\n", styles: [".mat-grid-list{display:block;position:relative}.mat-grid-tile{display:block;position:absolute;overflow:hidden}.mat-grid-tile .mat-grid-tile-header,.mat-grid-tile .mat-grid-tile-footer{display:flex;align-items:center;height:48px;color:#fff;background:rgba(0,0,0,.38);overflow:hidden;padding:0 16px;position:absolute;left:0;right:0}.mat-grid-tile .mat-grid-tile-header>*,.mat-grid-tile .mat-grid-tile-footer>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-grid-tile .mat-grid-tile-header.mat-2-line,.mat-grid-tile .mat-grid-tile-footer.mat-2-line{height:68px}.mat-grid-tile .mat-grid-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden}.mat-grid-tile .mat-grid-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-grid-tile .mat-grid-list-text:empty{display:none}.mat-grid-tile .mat-grid-tile-header{top:0}.mat-grid-tile .mat-grid-tile-footer{bottom:0}.mat-grid-tile .mat-grid-avatar{padding-right:16px}[dir=rtl] .mat-grid-tile .mat-grid-avatar{padding-right:0;padding-left:16px}.mat-grid-tile .mat-grid-avatar:empty{display:none}.mat-grid-tile-header{font-size:var(--mat-grid-list-tile-header-primary-text-size, var(--mat-app-body-large))}.mat-grid-tile-header .mat-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;box-sizing:border-box}.mat-grid-tile-header .mat-line:nth-child(n+2){font-size:var(--mat-grid-list-tile-header-secondary-text-size, var(--mat-app-body-medium))}.mat-grid-tile-footer{font-size:var(--mat-grid-list-tile-footer-primary-text-size, var(--mat-app-body-large))}.mat-grid-tile-footer .mat-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;box-sizing:border-box}.mat-grid-tile-footer .mat-line:nth-child(n+2){font-size:var(--mat-grid-list-tile-footer-secondary-text-size, var(--mat-app-body-medium))}.mat-grid-tile-content{top:0;left:0;right:0;bottom:0;position:absolute;display:flex;align-items:center;justify-content:center;height:100%;padding:0;margin:0}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTile, decorators: [{
            type: Component,
            args: [{ selector: 'mat-grid-tile', exportAs: 'matGridTile', host: {
                        'class': 'mat-grid-tile',
                        // Ensures that the "rowspan" and "colspan" input value is reflected in
                        // the DOM. This is needed for the grid-tile harness.
                        '[attr.rowspan]': 'rowspan',
                        '[attr.colspan]': 'colspan',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, template: "<div class=\"mat-grid-tile-content\">\n  <ng-content></ng-content>\n</div>\n", styles: [".mat-grid-list{display:block;position:relative}.mat-grid-tile{display:block;position:absolute;overflow:hidden}.mat-grid-tile .mat-grid-tile-header,.mat-grid-tile .mat-grid-tile-footer{display:flex;align-items:center;height:48px;color:#fff;background:rgba(0,0,0,.38);overflow:hidden;padding:0 16px;position:absolute;left:0;right:0}.mat-grid-tile .mat-grid-tile-header>*,.mat-grid-tile .mat-grid-tile-footer>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-grid-tile .mat-grid-tile-header.mat-2-line,.mat-grid-tile .mat-grid-tile-footer.mat-2-line{height:68px}.mat-grid-tile .mat-grid-list-text{display:flex;flex-direction:column;flex:auto;box-sizing:border-box;overflow:hidden}.mat-grid-tile .mat-grid-list-text>*{margin:0;padding:0;font-weight:normal;font-size:inherit}.mat-grid-tile .mat-grid-list-text:empty{display:none}.mat-grid-tile .mat-grid-tile-header{top:0}.mat-grid-tile .mat-grid-tile-footer{bottom:0}.mat-grid-tile .mat-grid-avatar{padding-right:16px}[dir=rtl] .mat-grid-tile .mat-grid-avatar{padding-right:0;padding-left:16px}.mat-grid-tile .mat-grid-avatar:empty{display:none}.mat-grid-tile-header{font-size:var(--mat-grid-list-tile-header-primary-text-size, var(--mat-app-body-large))}.mat-grid-tile-header .mat-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;box-sizing:border-box}.mat-grid-tile-header .mat-line:nth-child(n+2){font-size:var(--mat-grid-list-tile-header-secondary-text-size, var(--mat-app-body-medium))}.mat-grid-tile-footer{font-size:var(--mat-grid-list-tile-footer-primary-text-size, var(--mat-app-body-large))}.mat-grid-tile-footer .mat-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;box-sizing:border-box}.mat-grid-tile-footer .mat-line:nth-child(n+2){font-size:var(--mat-grid-list-tile-footer-secondary-text-size, var(--mat-app-body-medium))}.mat-grid-tile-content{top:0;left:0;right:0;bottom:0;position:absolute;display:flex;align-items:center;justify-content:center;height:100%;padding:0;margin:0}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_GRID_LIST]
                }] }], propDecorators: { rowspan: [{
                type: Input
            }], colspan: [{
                type: Input
            }] } });
export class MatGridTileText {
    constructor(_element) {
        this._element = _element;
    }
    ngAfterContentInit() {
        setLines(this._lines, this._element);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTileText, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatGridTileText, isStandalone: true, selector: "mat-grid-tile-header, mat-grid-tile-footer", queries: [{ propertyName: "_lines", predicate: MatLine, descendants: true }], ngImport: i0, template: "<ng-content select=\"[mat-grid-avatar], [matGridAvatar]\"></ng-content>\n<div class=\"mat-grid-list-text\"><ng-content select=\"[mat-line], [matLine]\"></ng-content></div>\n<ng-content></ng-content>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTileText, decorators: [{
            type: Component,
            args: [{ selector: 'mat-grid-tile-header, mat-grid-tile-footer', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, template: "<ng-content select=\"[mat-grid-avatar], [matGridAvatar]\"></ng-content>\n<div class=\"mat-grid-list-text\"><ng-content select=\"[mat-line], [matLine]\"></ng-content></div>\n<ng-content></ng-content>\n" }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { _lines: [{
                type: ContentChildren,
                args: [MatLine, { descendants: true }]
            }] } });
/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
export class MatGridAvatarCssMatStyler {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridAvatarCssMatStyler, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatGridAvatarCssMatStyler, isStandalone: true, selector: "[mat-grid-avatar], [matGridAvatar]", host: { classAttribute: "mat-grid-avatar" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridAvatarCssMatStyler, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-grid-avatar], [matGridAvatar]',
                    host: { 'class': 'mat-grid-avatar' },
                    standalone: true,
                }]
        }] });
/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
export class MatGridTileHeaderCssMatStyler {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTileHeaderCssMatStyler, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatGridTileHeaderCssMatStyler, isStandalone: true, selector: "mat-grid-tile-header", host: { classAttribute: "mat-grid-tile-header" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTileHeaderCssMatStyler, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-grid-tile-header',
                    host: { 'class': 'mat-grid-tile-header' },
                    standalone: true,
                }]
        }] });
/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
export class MatGridTileFooterCssMatStyler {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTileFooterCssMatStyler, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatGridTileFooterCssMatStyler, isStandalone: true, selector: "mat-grid-tile-footer", host: { classAttribute: "mat-grid-tile-footer" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridTileFooterCssMatStyler, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-grid-tile-footer',
                    host: { 'class': 'mat-grid-tile-footer' },
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC10aWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2dyaWQtbGlzdC9ncmlkLXRpbGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZ3JpZC1saXN0L2dyaWQtdGlsZS5odG1sIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2dyaWQtbGlzdC9ncmlkLXRpbGUtdGV4dC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsaUJBQWlCLEVBQ2pCLFVBQVUsRUFDVixLQUFLLEVBQ0wsUUFBUSxFQUNSLGVBQWUsRUFDZixTQUFTLEVBRVQsU0FBUyxFQUNULHVCQUF1QixFQUN2QixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLEVBQUMsYUFBYSxFQUFrQixNQUFNLGtCQUFrQixDQUFDOztBQWtCaEUsTUFBTSxPQUFPLFdBQVc7SUFJdEIsWUFDVSxRQUFpQyxFQUNDLFNBQTJCO1FBRDdELGFBQVEsR0FBUixRQUFRLENBQXlCO1FBQ0MsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFMdkUsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO0lBS2xCLENBQUM7SUFFSixrREFBa0Q7SUFDbEQsSUFDSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFrQjtRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQscURBQXFEO0lBQ3JELElBQ0ksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBa0I7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxRQUFnQixFQUFFLEtBQVU7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUMvRCxDQUFDO3FIQWpDVSxXQUFXLDRDQU1BLGFBQWE7eUdBTnhCLFdBQVcseVFDekN4Qiw4RUFHQTs7a0dEc0NhLFdBQVc7a0JBaEJ2QixTQUFTOytCQUNFLGVBQWUsWUFDZixhQUFhLFFBQ2pCO3dCQUNKLE9BQU8sRUFBRSxlQUFlO3dCQUN4Qix1RUFBdUU7d0JBQ3ZFLHFEQUFxRDt3QkFDckQsZ0JBQWdCLEVBQUUsU0FBUzt3QkFDM0IsZ0JBQWdCLEVBQUUsU0FBUztxQkFDNUIsaUJBR2MsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJOzswQkFRYixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7eUNBSy9CLE9BQU87c0JBRFYsS0FBSztnQkFVRixPQUFPO3NCQURWLEtBQUs7O0FBd0JSLE1BQU0sT0FBTyxlQUFlO0lBRzFCLFlBQW9CLFFBQWlDO1FBQWpDLGFBQVEsR0FBUixRQUFRLENBQXlCO0lBQUcsQ0FBQztJQUV6RCxrQkFBa0I7UUFDaEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7cUhBUFUsZUFBZTt5R0FBZixlQUFlLDZIQUNULE9BQU8sZ0RFckYxQiwwTUFHQTs7a0dGaUZhLGVBQWU7a0JBUDNCLFNBQVM7K0JBQ0UsNENBQTRDLG1CQUVyQyx1QkFBdUIsQ0FBQyxNQUFNLGlCQUNoQyxpQkFBaUIsQ0FBQyxJQUFJLGNBQ3pCLElBQUk7K0VBRytCLE1BQU07c0JBQXBELGVBQWU7dUJBQUMsT0FBTyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs7QUFTL0M7OztHQUdHO0FBTUgsTUFBTSxPQUFPLHlCQUF5QjtxSEFBekIseUJBQXlCO3lHQUF6Qix5QkFBeUI7O2tHQUF6Qix5QkFBeUI7a0JBTHJDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG9DQUFvQztvQkFDOUMsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFDO29CQUNsQyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBR0Q7OztHQUdHO0FBTUgsTUFBTSxPQUFPLDZCQUE2QjtxSEFBN0IsNkJBQTZCO3lHQUE3Qiw2QkFBNkI7O2tHQUE3Qiw2QkFBNkI7a0JBTHpDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFDO29CQUN2QyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBR0Q7OztHQUdHO0FBTUgsTUFBTSxPQUFPLDZCQUE2QjtxSEFBN0IsNkJBQTZCO3lHQUE3Qiw2QkFBNkI7O2tHQUE3Qiw2QkFBNkI7a0JBTHpDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFDO29CQUN2QyxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgRWxlbWVudFJlZixcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIFF1ZXJ5TGlzdCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgSW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0TGluZSwgc2V0TGluZXN9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge01BVF9HUklEX0xJU1QsIE1hdEdyaWRMaXN0QmFzZX0gZnJvbSAnLi9ncmlkLWxpc3QtYmFzZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1ncmlkLXRpbGUnLFxuICBleHBvcnRBczogJ21hdEdyaWRUaWxlJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtZ3JpZC10aWxlJyxcbiAgICAvLyBFbnN1cmVzIHRoYXQgdGhlIFwicm93c3BhblwiIGFuZCBcImNvbHNwYW5cIiBpbnB1dCB2YWx1ZSBpcyByZWZsZWN0ZWQgaW5cbiAgICAvLyB0aGUgRE9NLiBUaGlzIGlzIG5lZWRlZCBmb3IgdGhlIGdyaWQtdGlsZSBoYXJuZXNzLlxuICAgICdbYXR0ci5yb3dzcGFuXSc6ICdyb3dzcGFuJyxcbiAgICAnW2F0dHIuY29sc3Bhbl0nOiAnY29sc3BhbicsXG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnZ3JpZC10aWxlLmh0bWwnLFxuICBzdHlsZVVybDogJ2dyaWQtbGlzdC5jc3MnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0R3JpZFRpbGUge1xuICBfcm93c3BhbjogbnVtYmVyID0gMTtcbiAgX2NvbHNwYW46IG51bWJlciA9IDE7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfR1JJRF9MSVNUKSBwdWJsaWMgX2dyaWRMaXN0PzogTWF0R3JpZExpc3RCYXNlLFxuICApIHt9XG5cbiAgLyoqIEFtb3VudCBvZiByb3dzIHRoYXQgdGhlIGdyaWQgdGlsZSB0YWtlcyB1cC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHJvd3NwYW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcm93c3BhbjtcbiAgfVxuICBzZXQgcm93c3Bhbih2YWx1ZTogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9yb3dzcGFuID0gTWF0aC5yb3VuZChjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSkpO1xuICB9XG5cbiAgLyoqIEFtb3VudCBvZiBjb2x1bW5zIHRoYXQgdGhlIGdyaWQgdGlsZSB0YWtlcyB1cC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGNvbHNwYW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29sc3BhbjtcbiAgfVxuICBzZXQgY29sc3Bhbih2YWx1ZTogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9jb2xzcGFuID0gTWF0aC5yb3VuZChjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0eWxlIG9mIHRoZSBncmlkLXRpbGUgZWxlbWVudC4gIE5lZWRzIHRvIGJlIHNldCBtYW51YWxseSB0byBhdm9pZFxuICAgKiBcIkNoYW5nZWQgYWZ0ZXIgY2hlY2tlZFwiIGVycm9ycyB0aGF0IHdvdWxkIG9jY3VyIHdpdGggSG9zdEJpbmRpbmcuXG4gICAqL1xuICBfc2V0U3R5bGUocHJvcGVydHk6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgICh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuc3R5bGUgYXMgYW55KVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZ3JpZC10aWxlLWhlYWRlciwgbWF0LWdyaWQtdGlsZS1mb290ZXInLFxuICB0ZW1wbGF0ZVVybDogJ2dyaWQtdGlsZS10ZXh0Lmh0bWwnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0R3JpZFRpbGVUZXh0IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIEBDb250ZW50Q2hpbGRyZW4oTWF0TGluZSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX2xpbmVzOiBRdWVyeUxpc3Q8TWF0TGluZT47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4pIHt9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHNldExpbmVzKHRoaXMuX2xpbmVzLCB0aGlzLl9lbGVtZW50KTtcbiAgfVxufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB3aG9zZSBwdXJwb3NlIGlzIHRvIGFkZCB0aGUgbWF0LSBDU1Mgc3R5bGluZyB0byB0aGlzIHNlbGVjdG9yLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0LWdyaWQtYXZhdGFyXSwgW21hdEdyaWRBdmF0YXJdJyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtZ3JpZC1hdmF0YXInfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0R3JpZEF2YXRhckNzc01hdFN0eWxlciB7fVxuXG4vKipcbiAqIERpcmVjdGl2ZSB3aG9zZSBwdXJwb3NlIGlzIHRvIGFkZCB0aGUgbWF0LSBDU1Mgc3R5bGluZyB0byB0aGlzIHNlbGVjdG9yLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtZ3JpZC10aWxlLWhlYWRlcicsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LWdyaWQtdGlsZS1oZWFkZXInfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0R3JpZFRpbGVIZWFkZXJDc3NNYXRTdHlsZXIge31cblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hvc2UgcHVycG9zZSBpcyB0byBhZGQgdGhlIG1hdC0gQ1NTIHN0eWxpbmcgdG8gdGhpcyBzZWxlY3Rvci5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LWdyaWQtdGlsZS1mb290ZXInLFxuICBob3N0OiB7J2NsYXNzJzogJ21hdC1ncmlkLXRpbGUtZm9vdGVyJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEdyaWRUaWxlRm9vdGVyQ3NzTWF0U3R5bGVyIHt9XG4iLCI8ZGl2IGNsYXNzPVwibWF0LWdyaWQtdGlsZS1jb250ZW50XCI+XG4gIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbjwvZGl2PlxuIiwiPG5nLWNvbnRlbnQgc2VsZWN0PVwiW21hdC1ncmlkLWF2YXRhcl0sIFttYXRHcmlkQXZhdGFyXVwiPjwvbmctY29udGVudD5cbjxkaXYgY2xhc3M9XCJtYXQtZ3JpZC1saXN0LXRleHRcIj48bmctY29udGVudCBzZWxlY3Q9XCJbbWF0LWxpbmVdLCBbbWF0TGluZV1cIj48L25nLWNvbnRlbnQ+PC9kaXY+XG48bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4iXX0=