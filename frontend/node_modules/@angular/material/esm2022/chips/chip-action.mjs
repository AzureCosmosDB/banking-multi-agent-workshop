/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Input, booleanAttribute, numberAttribute, } from '@angular/core';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { MAT_CHIP } from './tokens';
import * as i0 from "@angular/core";
/**
 * Section within a chip.
 * @docs-private
 */
export class MatChipAction {
    /** Whether the action is disabled. */
    get disabled() {
        return this._disabled || this._parentChip.disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    /**
     * Determine the value of the disabled attribute for this chip action.
     */
    _getDisabledAttribute() {
        // When this chip action is disabled and focusing disabled chips is not permitted, return empty
        // string to indicate that disabled attribute should be included.
        return this.disabled && !this._allowFocusWhenDisabled ? '' : null;
    }
    /**
     * Determine the value of the tabindex attribute for this chip action.
     */
    _getTabindex() {
        return (this.disabled && !this._allowFocusWhenDisabled) || !this.isInteractive
            ? null
            : this.tabIndex.toString();
    }
    constructor(_elementRef, _parentChip) {
        this._elementRef = _elementRef;
        this._parentChip = _parentChip;
        /** Whether the action is interactive. */
        this.isInteractive = true;
        /** Whether this is the primary action in the chip. */
        this._isPrimary = true;
        this._disabled = false;
        /** Tab index of the action. */
        this.tabIndex = -1;
        /**
         * Private API to allow focusing this chip when it is disabled.
         */
        this._allowFocusWhenDisabled = false;
        if (_elementRef.nativeElement.nodeName === 'BUTTON') {
            _elementRef.nativeElement.setAttribute('type', 'button');
        }
    }
    focus() {
        this._elementRef.nativeElement.focus();
    }
    _handleClick(event) {
        if (!this.disabled && this.isInteractive && this._isPrimary) {
            event.preventDefault();
            this._parentChip._handlePrimaryActionInteraction();
        }
    }
    _handleKeydown(event) {
        if ((event.keyCode === ENTER || event.keyCode === SPACE) &&
            !this.disabled &&
            this.isInteractive &&
            this._isPrimary &&
            !this._parentChip._isEditing) {
            event.preventDefault();
            this._parentChip._handlePrimaryActionInteraction();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipAction, deps: [{ token: i0.ElementRef }, { token: MAT_CHIP }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatChipAction, isStandalone: true, selector: "[matChipAction]", inputs: { isInteractive: "isInteractive", disabled: ["disabled", "disabled", booleanAttribute], tabIndex: ["tabIndex", "tabIndex", (value) => (value == null ? -1 : numberAttribute(value))], _allowFocusWhenDisabled: "_allowFocusWhenDisabled" }, host: { listeners: { "click": "_handleClick($event)", "keydown": "_handleKeydown($event)" }, properties: { "class.mdc-evolution-chip__action--primary": "_isPrimary", "class.mdc-evolution-chip__action--presentational": "!isInteractive", "class.mdc-evolution-chip__action--trailing": "!_isPrimary", "attr.tabindex": "_getTabindex()", "attr.disabled": "_getDisabledAttribute()", "attr.aria-disabled": "disabled" }, classAttribute: "mdc-evolution-chip__action mat-mdc-chip-action" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipAction, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matChipAction]',
                    host: {
                        'class': 'mdc-evolution-chip__action mat-mdc-chip-action',
                        '[class.mdc-evolution-chip__action--primary]': '_isPrimary',
                        '[class.mdc-evolution-chip__action--presentational]': '!isInteractive',
                        '[class.mdc-evolution-chip__action--trailing]': '!_isPrimary',
                        '[attr.tabindex]': '_getTabindex()',
                        '[attr.disabled]': '_getDisabledAttribute()',
                        '[attr.aria-disabled]': 'disabled',
                        '(click)': '_handleClick($event)',
                        '(keydown)': '_handleKeydown($event)',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_CHIP]
                }] }], propDecorators: { isInteractive: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], tabIndex: [{
                type: Input,
                args: [{
                        transform: (value) => (value == null ? -1 : numberAttribute(value)),
                    }]
            }], _allowFocusWhenDisabled: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1hY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2hpcHMvY2hpcC1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFDTCxnQkFBZ0IsRUFDaEIsZUFBZSxHQUNoQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ25ELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRWxDOzs7R0FHRztBQWdCSCxNQUFNLE9BQU8sYUFBYTtJQU94QixzQ0FBc0M7SUFDdEMsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3JELENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFlRDs7T0FFRztJQUNPLHFCQUFxQjtRQUM3QiwrRkFBK0Y7UUFDL0YsaUVBQWlFO1FBQ2pFLE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDcEUsQ0FBQztJQUVEOztPQUVHO0lBQ08sWUFBWTtRQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWE7WUFDNUUsQ0FBQyxDQUFDLElBQUk7WUFDTixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFD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ZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RU5URVIsIFNQQUNFfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtNQVRfQ0hJUH0gZnJvbSAnLi90b2tlbnMnO1xuXG4vKipcbiAqIFNlY3Rpb24gd2l0aGluIGEgY2hpcC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdENoaXBBY3Rpb25dJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtZGMtZXZvbHV0aW9uLWNoaXBfX2FjdGlvbiBtYXQtbWRjLWNoaXAtYWN0aW9uJyxcbiAgICAnW2NsYXNzLm1kYy1ldm9sdXRpb24tY2hpcF9fYWN0aW9uLS1wcmltYXJ5XSc6ICdfaXNQcmltYXJ5JyxcbiAgICAnW2NsYXNzLm1kYy1ldm9sdXRpb24tY2hpcF9fYWN0aW9uLS1wcmVzZW50YXRpb25hbF0nOiAnIWlzSW50ZXJhY3RpdmUnLFxuICAgICdbY2xhc3MubWRjLWV2b2x1dGlvbi1jaGlwX19hY3Rpb24tLXRyYWlsaW5nXSc6ICchX2lzUHJpbWFyeScsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiaW5kZXgoKScsXG4gICAgJ1thdHRyLmRpc2FibGVkXSc6ICdfZ2V0RGlzYWJsZWRBdHRyaWJ1dGUoKScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnKGNsaWNrKSc6ICdfaGFuZGxlQ2xpY2soJGV2ZW50KScsXG4gICAgJyhrZXlkb3duKSc6ICdfaGFuZGxlS2V5ZG93bigkZXZlbnQpJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcEFjdGlvbiB7XG4gIC8qKiBXaGV0aGVyIHRoZSBhY3Rpb24gaXMgaW50ZXJhY3RpdmUuICovXG4gIEBJbnB1dCgpIGlzSW50ZXJhY3RpdmUgPSB0cnVlO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgaXMgdGhlIHByaW1hcnkgYWN0aW9uIGluIHRoZSBjaGlwLiAqL1xuICBfaXNQcmltYXJ5ID0gdHJ1ZTtcblxuICAvKiogV2hldGhlciB0aGUgYWN0aW9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQgfHwgdGhpcy5fcGFyZW50Q2hpcC5kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIFRhYiBpbmRleCBvZiB0aGUgYWN0aW9uLiAqL1xuICBASW5wdXQoe1xuICAgIHRyYW5zZm9ybTogKHZhbHVlOiB1bmtub3duKSA9PiAodmFsdWUgPT0gbnVsbCA/IC0xIDogbnVtYmVyQXR0cmlidXRlKHZhbHVlKSksXG4gIH0pXG4gIHRhYkluZGV4OiBudW1iZXIgPSAtMTtcblxuICAvKipcbiAgICogUHJpdmF0ZSBBUEkgdG8gYWxsb3cgZm9jdXNpbmcgdGhpcyBjaGlwIHdoZW4gaXQgaXMgZGlzYWJsZWQuXG4gICAqL1xuICBASW5wdXQoKVxuICBwcml2YXRlIF9hbGxvd0ZvY3VzV2hlbkRpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlIGRpc2FibGVkIGF0dHJpYnV0ZSBmb3IgdGhpcyBjaGlwIGFjdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0RGlzYWJsZWRBdHRyaWJ1dGUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8gV2hlbiB0aGlzIGNoaXAgYWN0aW9uIGlzIGRpc2FibGVkIGFuZCBmb2N1c2luZyBkaXNhYmxlZCBjaGlwcyBpcyBub3QgcGVybWl0dGVkLCByZXR1cm4gZW1wdHlcbiAgICAvLyBzdHJpbmcgdG8gaW5kaWNhdGUgdGhhdCBkaXNhYmxlZCBhdHRyaWJ1dGUgc2hvdWxkIGJlIGluY2x1ZGVkLlxuICAgIHJldHVybiB0aGlzLmRpc2FibGVkICYmICF0aGlzLl9hbGxvd0ZvY3VzV2hlbkRpc2FibGVkID8gJycgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlIHRhYmluZGV4IGF0dHJpYnV0ZSBmb3IgdGhpcyBjaGlwIGFjdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiaW5kZXgoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuICh0aGlzLmRpc2FibGVkICYmICF0aGlzLl9hbGxvd0ZvY3VzV2hlbkRpc2FibGVkKSB8fCAhdGhpcy5pc0ludGVyYWN0aXZlXG4gICAgICA/IG51bGxcbiAgICAgIDogdGhpcy50YWJJbmRleC50b1N0cmluZygpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBASW5qZWN0KE1BVF9DSElQKVxuICAgIHByb3RlY3RlZCBfcGFyZW50Q2hpcDoge1xuICAgICAgX2hhbmRsZVByaW1hcnlBY3Rpb25JbnRlcmFjdGlvbigpOiB2b2lkO1xuICAgICAgcmVtb3ZlKCk6IHZvaWQ7XG4gICAgICBkaXNhYmxlZDogYm9vbGVhbjtcbiAgICAgIF9pc0VkaXRpbmc/OiBib29sZWFuO1xuICAgIH0sXG4gICkge1xuICAgIGlmIChfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm5vZGVOYW1lID09PSAnQlVUVE9OJykge1xuICAgICAgX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgfVxuICB9XG5cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICBfaGFuZGxlQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgdGhpcy5pc0ludGVyYWN0aXZlICYmIHRoaXMuX2lzUHJpbWFyeSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuX3BhcmVudENoaXAuX2hhbmRsZVByaW1hcnlBY3Rpb25JbnRlcmFjdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKFxuICAgICAgKGV2ZW50LmtleUNvZGUgPT09IEVOVEVSIHx8IGV2ZW50LmtleUNvZGUgPT09IFNQQUNFKSAmJlxuICAgICAgIXRoaXMuZGlzYWJsZWQgJiZcbiAgICAgIHRoaXMuaXNJbnRlcmFjdGl2ZSAmJlxuICAgICAgdGhpcy5faXNQcmltYXJ5ICYmXG4gICAgICAhdGhpcy5fcGFyZW50Q2hpcC5faXNFZGl0aW5nXG4gICAgKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fcGFyZW50Q2hpcC5faGFuZGxlUHJpbWFyeUFjdGlvbkludGVyYWN0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iXX0=