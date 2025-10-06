/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Optional } from '@angular/core';
import { LIST_OPTION } from './list-option-types';
import * as i0 from "@angular/core";
/**
 * Directive capturing the title of a list item. A list item usually consists of a
 * title and optional secondary or tertiary lines.
 *
 * Text content for the title never wraps. There can only be a single title per list item.
 */
export class MatListItemTitle {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemTitle, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatListItemTitle, isStandalone: true, selector: "[matListItemTitle]", host: { classAttribute: "mat-mdc-list-item-title mdc-list-item__primary-text" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemTitle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matListItemTitle]',
                    host: { 'class': 'mat-mdc-list-item-title mdc-list-item__primary-text' },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });
/**
 * Directive capturing a line in a list item. A list item usually consists of a
 * title and optional secondary or tertiary lines.
 *
 * Text content inside a line never wraps. There can be at maximum two lines per list item.
 */
export class MatListItemLine {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemLine, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatListItemLine, isStandalone: true, selector: "[matListItemLine]", host: { classAttribute: "mat-mdc-list-item-line mdc-list-item__secondary-text" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemLine, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matListItemLine]',
                    host: { 'class': 'mat-mdc-list-item-line mdc-list-item__secondary-text' },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });
/**
 * Directive matching an optional meta section for list items.
 *
 * List items can reserve space at the end of an item to display a control,
 * button or additional text content.
 */
export class MatListItemMeta {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemMeta, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatListItemMeta, isStandalone: true, selector: "[matListItemMeta]", host: { classAttribute: "mat-mdc-list-item-meta mdc-list-item__end" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemMeta, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matListItemMeta]',
                    host: { 'class': 'mat-mdc-list-item-meta mdc-list-item__end' },
                    standalone: true,
                }]
        }] });
/**
 * @docs-private
 *
 * MDC uses the very intuitively named classes `.mdc-list-item__start` and `.mat-list-item__end` to
 * position content such as icons or checkboxes/radios that comes either before or after the text
 * content respectively. This directive detects the placement of the checkbox/radio and applies the
 * correct MDC class to position the icon/avatar on the opposite side.
 */
export class _MatListItemGraphicBase {
    constructor(_listOption) {
        this._listOption = _listOption;
    }
    _isAlignedAtStart() {
        // By default, in all list items the graphic is aligned at start. In list options,
        // the graphic is only aligned at start if the checkbox/radio is at the end.
        return !this._listOption || this._listOption?._getTogglePosition() === 'after';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatListItemGraphicBase, deps: [{ token: LIST_OPTION, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: _MatListItemGraphicBase, isStandalone: true, host: { properties: { "class.mdc-list-item__start": "_isAlignedAtStart()", "class.mdc-list-item__end": "!_isAlignedAtStart()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatListItemGraphicBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        // MDC uses intuitively named classes `.mdc-list-item__start` and `.mat-list-item__end` to
                        // position content such as icons or checkboxes/radios that comes either before or after the
                        // text content respectively. This directive detects the placement of the checkbox/radio and
                        // applies the correct MDC class to position the icon/avatar on the opposite side.
                        '[class.mdc-list-item__start]': '_isAlignedAtStart()',
                        '[class.mdc-list-item__end]': '!_isAlignedAtStart()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [LIST_OPTION]
                }] }] });
/**
 * Directive matching an optional avatar within a list item.
 *
 * List items can reserve space at the beginning of an item to display an avatar.
 */
export class MatListItemAvatar extends _MatListItemGraphicBase {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemAvatar, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatListItemAvatar, isStandalone: true, selector: "[matListItemAvatar]", host: { classAttribute: "mat-mdc-list-item-avatar" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemAvatar, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matListItemAvatar]',
                    host: { 'class': 'mat-mdc-list-item-avatar' },
                    standalone: true,
                }]
        }] });
/**
 * Directive matching an optional icon within a list item.
 *
 * List items can reserve space at the beginning of an item to display an icon.
 */
export class MatListItemIcon extends _MatListItemGraphicBase {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemIcon, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatListItemIcon, isStandalone: true, selector: "[matListItemIcon]", host: { classAttribute: "mat-mdc-list-item-icon" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatListItemIcon, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matListItemIcon]',
                    host: { 'class': 'mat-mdc-list-item-icon' },
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1pdGVtLXNlY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2xpc3QvbGlzdC1pdGVtLXNlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEUsT0FBTyxFQUFDLFdBQVcsRUFBYSxNQUFNLHFCQUFxQixDQUFDOztBQUU1RDs7Ozs7R0FLRztBQU1ILE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0IsWUFBbUIsV0FBb0M7UUFBcEMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO0lBQUcsQ0FBQztxSEFEaEQsZ0JBQWdCO3lHQUFoQixnQkFBZ0I7O2tHQUFoQixnQkFBZ0I7a0JBTDVCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLHFEQUFxRCxFQUFDO29CQUN0RSxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBS0Q7Ozs7O0dBS0c7QUFNSCxNQUFNLE9BQU8sZUFBZTtJQUMxQixZQUFtQixXQUFvQztRQUFwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7SUFBRyxDQUFDO3FIQURoRCxlQUFlO3lHQUFmLGVBQWU7O2tHQUFmLGVBQWU7a0JBTDNCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLHNEQUFzRCxFQUFDO29CQUN2RSxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBS0Q7Ozs7O0dBS0c7QUFNSCxNQUFNLE9BQU8sZUFBZTtxSEFBZixlQUFlO3lHQUFmLGVBQWU7O2tHQUFmLGVBQWU7a0JBTDNCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLDJDQUEyQyxFQUFDO29CQUM1RCxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBR0Q7Ozs7Ozs7R0FPRztBQVlILE1BQU0sT0FBTyx1QkFBdUI7SUFDbEMsWUFBb0QsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7SUFBRyxDQUFDO0lBRS9FLGlCQUFpQjtRQUNmLGtGQUFrRjtRQUNsRiw0RUFBNEU7UUFDNUUsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLE9BQU8sQ0FBQztJQUNqRixDQUFDO3FIQVBVLHVCQUF1QixrQkFDRixXQUFXO3lHQURoQyx1QkFBdUI7O2tHQUF2Qix1QkFBdUI7a0JBWG5DLFNBQVM7bUJBQUM7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLDBGQUEwRjt3QkFDMUYsNEZBQTRGO3dCQUM1Riw0RkFBNEY7d0JBQzVGLGtGQUFrRjt3QkFDbEYsOEJBQThCLEVBQUUscUJBQXFCO3dCQUNyRCw0QkFBNEIsRUFBRSxzQkFBc0I7cUJBQ3JEO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBRWMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxXQUFXOztBQVM3Qzs7OztHQUlHO0FBTUgsTUFBTSxPQUFPLGlCQUFrQixTQUFRLHVCQUF1QjtxSEFBakQsaUJBQWlCO3lHQUFqQixpQkFBaUI7O2tHQUFqQixpQkFBaUI7a0JBTDdCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLDBCQUEwQixFQUFDO29CQUMzQyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBR0Q7Ozs7R0FJRztBQU1ILE1BQU0sT0FBTyxlQUFnQixTQUFRLHVCQUF1QjtxSEFBL0MsZUFBZTt5R0FBZixlQUFlOztrR0FBZixlQUFlO2tCQUwzQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSx3QkFBd0IsRUFBQztvQkFDekMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TElTVF9PUFRJT04sIExpc3RPcHRpb259IGZyb20gJy4vbGlzdC1vcHRpb24tdHlwZXMnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSBjYXB0dXJpbmcgdGhlIHRpdGxlIG9mIGEgbGlzdCBpdGVtLiBBIGxpc3QgaXRlbSB1c3VhbGx5IGNvbnNpc3RzIG9mIGFcbiAqIHRpdGxlIGFuZCBvcHRpb25hbCBzZWNvbmRhcnkgb3IgdGVydGlhcnkgbGluZXMuXG4gKlxuICogVGV4dCBjb250ZW50IGZvciB0aGUgdGl0bGUgbmV2ZXIgd3JhcHMuIFRoZXJlIGNhbiBvbmx5IGJlIGEgc2luZ2xlIHRpdGxlIHBlciBsaXN0IGl0ZW0uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRMaXN0SXRlbVRpdGxlXScsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1saXN0LWl0ZW0tdGl0bGUgbWRjLWxpc3QtaXRlbV9fcHJpbWFyeS10ZXh0J30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdExpc3RJdGVtVGl0bGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KSB7fVxufVxuXG4vKipcbiAqIERpcmVjdGl2ZSBjYXB0dXJpbmcgYSBsaW5lIGluIGEgbGlzdCBpdGVtLiBBIGxpc3QgaXRlbSB1c3VhbGx5IGNvbnNpc3RzIG9mIGFcbiAqIHRpdGxlIGFuZCBvcHRpb25hbCBzZWNvbmRhcnkgb3IgdGVydGlhcnkgbGluZXMuXG4gKlxuICogVGV4dCBjb250ZW50IGluc2lkZSBhIGxpbmUgbmV2ZXIgd3JhcHMuIFRoZXJlIGNhbiBiZSBhdCBtYXhpbXVtIHR3byBsaW5lcyBwZXIgbGlzdCBpdGVtLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0TGlzdEl0ZW1MaW5lXScsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1saXN0LWl0ZW0tbGluZSBtZGMtbGlzdC1pdGVtX19zZWNvbmRhcnktdGV4dCd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRMaXN0SXRlbUxpbmUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KSB7fVxufVxuXG4vKipcbiAqIERpcmVjdGl2ZSBtYXRjaGluZyBhbiBvcHRpb25hbCBtZXRhIHNlY3Rpb24gZm9yIGxpc3QgaXRlbXMuXG4gKlxuICogTGlzdCBpdGVtcyBjYW4gcmVzZXJ2ZSBzcGFjZSBhdCB0aGUgZW5kIG9mIGFuIGl0ZW0gdG8gZGlzcGxheSBhIGNvbnRyb2wsXG4gKiBidXR0b24gb3IgYWRkaXRpb25hbCB0ZXh0IGNvbnRlbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRMaXN0SXRlbU1ldGFdJyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWxpc3QtaXRlbS1tZXRhIG1kYy1saXN0LWl0ZW1fX2VuZCd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRMaXN0SXRlbU1ldGEge31cblxuLyoqXG4gKiBAZG9jcy1wcml2YXRlXG4gKlxuICogTURDIHVzZXMgdGhlIHZlcnkgaW50dWl0aXZlbHkgbmFtZWQgY2xhc3NlcyBgLm1kYy1saXN0LWl0ZW1fX3N0YXJ0YCBhbmQgYC5tYXQtbGlzdC1pdGVtX19lbmRgIHRvXG4gKiBwb3NpdGlvbiBjb250ZW50IHN1Y2ggYXMgaWNvbnMgb3IgY2hlY2tib3hlcy9yYWRpb3MgdGhhdCBjb21lcyBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSB0ZXh0XG4gKiBjb250ZW50IHJlc3BlY3RpdmVseS4gVGhpcyBkaXJlY3RpdmUgZGV0ZWN0cyB0aGUgcGxhY2VtZW50IG9mIHRoZSBjaGVja2JveC9yYWRpbyBhbmQgYXBwbGllcyB0aGVcbiAqIGNvcnJlY3QgTURDIGNsYXNzIHRvIHBvc2l0aW9uIHRoZSBpY29uL2F2YXRhciBvbiB0aGUgb3Bwb3NpdGUgc2lkZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIGhvc3Q6IHtcbiAgICAvLyBNREMgdXNlcyBpbnR1aXRpdmVseSBuYW1lZCBjbGFzc2VzIGAubWRjLWxpc3QtaXRlbV9fc3RhcnRgIGFuZCBgLm1hdC1saXN0LWl0ZW1fX2VuZGAgdG9cbiAgICAvLyBwb3NpdGlvbiBjb250ZW50IHN1Y2ggYXMgaWNvbnMgb3IgY2hlY2tib3hlcy9yYWRpb3MgdGhhdCBjb21lcyBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZVxuICAgIC8vIHRleHQgY29udGVudCByZXNwZWN0aXZlbHkuIFRoaXMgZGlyZWN0aXZlIGRldGVjdHMgdGhlIHBsYWNlbWVudCBvZiB0aGUgY2hlY2tib3gvcmFkaW8gYW5kXG4gICAgLy8gYXBwbGllcyB0aGUgY29ycmVjdCBNREMgY2xhc3MgdG8gcG9zaXRpb24gdGhlIGljb24vYXZhdGFyIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLlxuICAgICdbY2xhc3MubWRjLWxpc3QtaXRlbV9fc3RhcnRdJzogJ19pc0FsaWduZWRBdFN0YXJ0KCknLFxuICAgICdbY2xhc3MubWRjLWxpc3QtaXRlbV9fZW5kXSc6ICchX2lzQWxpZ25lZEF0U3RhcnQoKScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIF9NYXRMaXN0SXRlbUdyYXBoaWNCYXNlIHtcbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQEluamVjdChMSVNUX09QVElPTikgcHVibGljIF9saXN0T3B0aW9uOiBMaXN0T3B0aW9uKSB7fVxuXG4gIF9pc0FsaWduZWRBdFN0YXJ0KCkge1xuICAgIC8vIEJ5IGRlZmF1bHQsIGluIGFsbCBsaXN0IGl0ZW1zIHRoZSBncmFwaGljIGlzIGFsaWduZWQgYXQgc3RhcnQuIEluIGxpc3Qgb3B0aW9ucyxcbiAgICAvLyB0aGUgZ3JhcGhpYyBpcyBvbmx5IGFsaWduZWQgYXQgc3RhcnQgaWYgdGhlIGNoZWNrYm94L3JhZGlvIGlzIGF0IHRoZSBlbmQuXG4gICAgcmV0dXJuICF0aGlzLl9saXN0T3B0aW9uIHx8IHRoaXMuX2xpc3RPcHRpb24/Ll9nZXRUb2dnbGVQb3NpdGlvbigpID09PSAnYWZ0ZXInO1xuICB9XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIG1hdGNoaW5nIGFuIG9wdGlvbmFsIGF2YXRhciB3aXRoaW4gYSBsaXN0IGl0ZW0uXG4gKlxuICogTGlzdCBpdGVtcyBjYW4gcmVzZXJ2ZSBzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIGFuIGl0ZW0gdG8gZGlzcGxheSBhbiBhdmF0YXIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRMaXN0SXRlbUF2YXRhcl0nLFxuICBob3N0OiB7J2NsYXNzJzogJ21hdC1tZGMtbGlzdC1pdGVtLWF2YXRhcid9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRMaXN0SXRlbUF2YXRhciBleHRlbmRzIF9NYXRMaXN0SXRlbUdyYXBoaWNCYXNlIHt9XG5cbi8qKlxuICogRGlyZWN0aXZlIG1hdGNoaW5nIGFuIG9wdGlvbmFsIGljb24gd2l0aGluIGEgbGlzdCBpdGVtLlxuICpcbiAqIExpc3QgaXRlbXMgY2FuIHJlc2VydmUgc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiBhbiBpdGVtIHRvIGRpc3BsYXkgYW4gaWNvbi5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdExpc3RJdGVtSWNvbl0nLFxuICBob3N0OiB7J2NsYXNzJzogJ21hdC1tZGMtbGlzdC1pdGVtLWljb24nfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TGlzdEl0ZW1JY29uIGV4dGVuZHMgX01hdExpc3RJdGVtR3JhcGhpY0Jhc2Uge31cbiJdfQ==