/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Directive } from '@angular/core';
import { MatChipAction } from './chip-action';
import { MAT_CHIP_AVATAR, MAT_CHIP_REMOVE, MAT_CHIP_TRAILING_ICON } from './tokens';
import * as i0 from "@angular/core";
/** Avatar image within a chip. */
export class MatChipAvatar {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipAvatar, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatChipAvatar, isStandalone: true, selector: "mat-chip-avatar, [matChipAvatar]", host: { attributes: { "role": "img" }, classAttribute: "mat-mdc-chip-avatar mdc-evolution-chip__icon mdc-evolution-chip__icon--primary" }, providers: [{ provide: MAT_CHIP_AVATAR, useExisting: MatChipAvatar }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipAvatar, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-chip-avatar, [matChipAvatar]',
                    host: {
                        'class': 'mat-mdc-chip-avatar mdc-evolution-chip__icon mdc-evolution-chip__icon--primary',
                        'role': 'img',
                    },
                    providers: [{ provide: MAT_CHIP_AVATAR, useExisting: MatChipAvatar }],
                    standalone: true,
                }]
        }] });
/** Non-interactive trailing icon in a chip. */
export class MatChipTrailingIcon extends MatChipAction {
    constructor() {
        super(...arguments);
        /**
         * MDC considers all trailing actions as a remove icon,
         * but we support non-interactive trailing icons.
         */
        this.isInteractive = false;
        this._isPrimary = false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipTrailingIcon, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatChipTrailingIcon, isStandalone: true, selector: "mat-chip-trailing-icon, [matChipTrailingIcon]", host: { attributes: { "aria-hidden": "true" }, classAttribute: "mat-mdc-chip-trailing-icon mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing" }, providers: [{ provide: MAT_CHIP_TRAILING_ICON, useExisting: MatChipTrailingIcon }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipTrailingIcon, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-chip-trailing-icon, [matChipTrailingIcon]',
                    host: {
                        'class': 'mat-mdc-chip-trailing-icon mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing',
                        'aria-hidden': 'true',
                    },
                    providers: [{ provide: MAT_CHIP_TRAILING_ICON, useExisting: MatChipTrailingIcon }],
                    standalone: true,
                }]
        }] });
/**
 * Directive to remove the parent chip when the trailing icon is clicked or
 * when the ENTER key is pressed on it.
 *
 * Recommended for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 * ```
 * <mat-chip>
 *   <mat-icon matChipRemove>cancel</mat-icon>
 * </mat-chip>
 * ```
 */
export class MatChipRemove extends MatChipAction {
    constructor() {
        super(...arguments);
        this._isPrimary = false;
    }
    _handleClick(event) {
        if (!this.disabled) {
            event.stopPropagation();
            event.preventDefault();
            this._parentChip.remove();
        }
    }
    _handleKeydown(event) {
        if ((event.keyCode === ENTER || event.keyCode === SPACE) && !this.disabled) {
            event.stopPropagation();
            event.preventDefault();
            this._parentChip.remove();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipRemove, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatChipRemove, isStandalone: true, selector: "[matChipRemove]", host: { attributes: { "role": "button" }, properties: { "attr.aria-hidden": "null" }, classAttribute: "mat-mdc-chip-remove mat-mdc-chip-trailing-icon mat-mdc-focus-indicator mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing" }, providers: [{ provide: MAT_CHIP_REMOVE, useExisting: MatChipRemove }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipRemove, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matChipRemove]',
                    host: {
                        'class': 'mat-mdc-chip-remove mat-mdc-chip-trailing-icon mat-mdc-focus-indicator ' +
                            'mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing',
                        'role': 'button',
                        '[attr.aria-hidden]': 'null',
                    },
                    providers: [{ provide: MAT_CHIP_REMOVE, useExisting: MatChipRemove }],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1pY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jaGlwcy9jaGlwLWljb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLHNCQUFzQixFQUFDLE1BQU0sVUFBVSxDQUFDOztBQUVsRixrQ0FBa0M7QUFVbEMsTUFBTSxPQUFPLGFBQWE7cUhBQWIsYUFBYTt5R0FBYixhQUFhLDBOQUhiLENBQUMsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUMsQ0FBQzs7a0dBR3hELGFBQWE7a0JBVHpCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGtDQUFrQztvQkFDNUMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxnRkFBZ0Y7d0JBQ3pGLE1BQU0sRUFBRSxLQUFLO3FCQUNkO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLGVBQWUsRUFBQyxDQUFDO29CQUNuRSxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBR0QsK0NBQStDO0FBVy9DLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxhQUFhO0lBVnREOztRQVdFOzs7V0FHRztRQUNNLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBRXRCLGVBQVUsR0FBRyxLQUFLLENBQUM7S0FDN0I7cUhBUlksbUJBQW1CO3lHQUFuQixtQkFBbUIsdVBBSG5CLENBQUMsRUFBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFDLENBQUM7O2tHQUdyRSxtQkFBbUI7a0JBVi9CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLCtDQUErQztvQkFDekQsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFDTCx3RkFBd0Y7d0JBQzFGLGFBQWEsRUFBRSxNQUFNO3FCQUN0QjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxXQUFXLHFCQUFxQixFQUFDLENBQUM7b0JBQ2hGLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7QUFXRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQWNILE1BQU0sT0FBTyxhQUFjLFNBQVEsYUFBYTtJQVpoRDs7UUFhVyxlQUFVLEdBQUcsS0FBSyxDQUFDO0tBaUI3QjtJQWZVLFlBQVksQ0FBQyxLQUFpQjtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25CLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4QixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUVRLGNBQWMsQ0FBQyxLQUFvQjtRQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMzRSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDeEIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7cUhBakJVLGFBQWE7eUdBQWIsYUFBYSw0U0FIYixDQUFDLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFDLENBQUM7O2tHQUd4RCxhQUFhO2tCQVp6QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQ0wseUVBQXlFOzRCQUN6RSw2REFBNkQ7d0JBQy9ELE1BQU0sRUFBRSxRQUFRO3dCQUNoQixvQkFBb0IsRUFBRSxNQUFNO3FCQUM3QjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxlQUFlLEVBQUMsQ0FBQztvQkFDbkUsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RU5URVIsIFNQQUNFfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtEaXJlY3RpdmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRDaGlwQWN0aW9ufSBmcm9tICcuL2NoaXAtYWN0aW9uJztcbmltcG9ydCB7TUFUX0NISVBfQVZBVEFSLCBNQVRfQ0hJUF9SRU1PVkUsIE1BVF9DSElQX1RSQUlMSU5HX0lDT059IGZyb20gJy4vdG9rZW5zJztcblxuLyoqIEF2YXRhciBpbWFnZSB3aXRoaW4gYSBjaGlwLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LWNoaXAtYXZhdGFyLCBbbWF0Q2hpcEF2YXRhcl0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtY2hpcC1hdmF0YXIgbWRjLWV2b2x1dGlvbi1jaGlwX19pY29uIG1kYy1ldm9sdXRpb24tY2hpcF9faWNvbi0tcHJpbWFyeScsXG4gICAgJ3JvbGUnOiAnaW1nJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9DSElQX0FWQVRBUiwgdXNlRXhpc3Rpbmc6IE1hdENoaXBBdmF0YXJ9XSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcEF2YXRhciB7fVxuXG4vKiogTm9uLWludGVyYWN0aXZlIHRyYWlsaW5nIGljb24gaW4gYSBjaGlwLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LWNoaXAtdHJhaWxpbmctaWNvbiwgW21hdENoaXBUcmFpbGluZ0ljb25dJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6XG4gICAgICAnbWF0LW1kYy1jaGlwLXRyYWlsaW5nLWljb24gbWRjLWV2b2x1dGlvbi1jaGlwX19pY29uIG1kYy1ldm9sdXRpb24tY2hpcF9faWNvbi0tdHJhaWxpbmcnLFxuICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9DSElQX1RSQUlMSU5HX0lDT04sIHVzZUV4aXN0aW5nOiBNYXRDaGlwVHJhaWxpbmdJY29ufV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENoaXBUcmFpbGluZ0ljb24gZXh0ZW5kcyBNYXRDaGlwQWN0aW9uIHtcbiAgLyoqXG4gICAqIE1EQyBjb25zaWRlcnMgYWxsIHRyYWlsaW5nIGFjdGlvbnMgYXMgYSByZW1vdmUgaWNvbixcbiAgICogYnV0IHdlIHN1cHBvcnQgbm9uLWludGVyYWN0aXZlIHRyYWlsaW5nIGljb25zLlxuICAgKi9cbiAgb3ZlcnJpZGUgaXNJbnRlcmFjdGl2ZSA9IGZhbHNlO1xuXG4gIG92ZXJyaWRlIF9pc1ByaW1hcnkgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBEaXJlY3RpdmUgdG8gcmVtb3ZlIHRoZSBwYXJlbnQgY2hpcCB3aGVuIHRoZSB0cmFpbGluZyBpY29uIGlzIGNsaWNrZWQgb3JcbiAqIHdoZW4gdGhlIEVOVEVSIGtleSBpcyBwcmVzc2VkIG9uIGl0LlxuICpcbiAqIFJlY29tbWVuZGVkIGZvciB1c2Ugd2l0aCB0aGUgTWF0ZXJpYWwgRGVzaWduIFwiY2FuY2VsXCIgaWNvblxuICogYXZhaWxhYmxlIGF0IGh0dHBzOi8vbWF0ZXJpYWwuaW8vaWNvbnMvI2ljX2NhbmNlbC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogPG1hdC1jaGlwPlxuICogICA8bWF0LWljb24gbWF0Q2hpcFJlbW92ZT5jYW5jZWw8L21hdC1pY29uPlxuICogPC9tYXQtY2hpcD5cbiAqIGBgYFxuICovXG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRDaGlwUmVtb3ZlXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOlxuICAgICAgJ21hdC1tZGMtY2hpcC1yZW1vdmUgbWF0LW1kYy1jaGlwLXRyYWlsaW5nLWljb24gbWF0LW1kYy1mb2N1cy1pbmRpY2F0b3IgJyArXG4gICAgICAnbWRjLWV2b2x1dGlvbi1jaGlwX19pY29uIG1kYy1ldm9sdXRpb24tY2hpcF9faWNvbi0tdHJhaWxpbmcnLFxuICAgICdyb2xlJzogJ2J1dHRvbicsXG4gICAgJ1thdHRyLmFyaWEtaGlkZGVuXSc6ICdudWxsJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9DSElQX1JFTU9WRSwgdXNlRXhpc3Rpbmc6IE1hdENoaXBSZW1vdmV9XSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcFJlbW92ZSBleHRlbmRzIE1hdENoaXBBY3Rpb24ge1xuICBvdmVycmlkZSBfaXNQcmltYXJ5ID0gZmFsc2U7XG5cbiAgb3ZlcnJpZGUgX2hhbmRsZUNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLl9wYXJlbnRDaGlwLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKChldmVudC5rZXlDb2RlID09PSBFTlRFUiB8fCBldmVudC5rZXlDb2RlID09PSBTUEFDRSkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuX3BhcmVudENoaXAucmVtb3ZlKCk7XG4gICAgfVxuICB9XG59XG4iXX0=