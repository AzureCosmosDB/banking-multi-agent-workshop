/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { booleanAttribute, Directive, ElementRef, inject, InjectionToken, Input, NgZone, numberAttribute, } from '@angular/core';
import { MatRippleLoader } from '@angular/material/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Injection token that can be used to provide the default options the button component. */
export const MAT_BUTTON_CONFIG = new InjectionToken('MAT_BUTTON_CONFIG');
/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
    '[attr.disabled]': '_getDisabledAttribute()',
    '[attr.aria-disabled]': '_getAriaDisabled()',
    '[class.mat-mdc-button-disabled]': 'disabled',
    '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    // MDC automatically applies the primary theme color to the button, but we want to support
    // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
    // select and style this "theme".
    '[class.mat-unthemed]': '!color',
    // Add a class that applies to all buttons. This makes it easier to target if somebody
    // wants to target all Material buttons.
    '[class.mat-mdc-button-base]': 'true',
    '[class]': 'color ? "mat-" + color : ""',
};
/** List of classes to add to buttons instances based on host attribute selector. */
const HOST_SELECTOR_MDC_CLASS_PAIR = [
    {
        attribute: 'mat-button',
        mdcClasses: ['mdc-button', 'mat-mdc-button'],
    },
    {
        attribute: 'mat-flat-button',
        mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
    },
    {
        attribute: 'mat-raised-button',
        mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
    },
    {
        attribute: 'mat-stroked-button',
        mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
    },
    {
        attribute: 'mat-fab',
        mdcClasses: ['mdc-fab', 'mat-mdc-fab-base', 'mat-mdc-fab'],
    },
    {
        attribute: 'mat-mini-fab',
        mdcClasses: ['mdc-fab', 'mat-mdc-fab-base', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
    },
    {
        attribute: 'mat-icon-button',
        mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
    },
];
/** Base class for all buttons.  */
export class MatButtonBase {
    /**
     * Reference to the MatRipple instance of the button.
     * @deprecated Considered an implementation detail. To be removed.
     * @breaking-change 17.0.0
     */
    get ripple() {
        return this._rippleLoader?.getRipple(this._elementRef.nativeElement);
    }
    set ripple(v) {
        this._rippleLoader?.attachRipple(this._elementRef.nativeElement, v);
    }
    /** Whether the ripple effect is disabled or not. */
    get disableRipple() {
        return this._disableRipple;
    }
    set disableRipple(value) {
        this._disableRipple = value;
        this._updateRippleDisabled();
    }
    /** Whether the button is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._updateRippleDisabled();
    }
    constructor(_elementRef, _platform, _ngZone, _animationMode) {
        this._elementRef = _elementRef;
        this._platform = _platform;
        this._ngZone = _ngZone;
        this._animationMode = _animationMode;
        this._focusMonitor = inject(FocusMonitor);
        /**
         * Handles the lazy creation of the MatButton ripple.
         * Used to improve initial load time of large applications.
         */
        this._rippleLoader = inject(MatRippleLoader);
        /** Whether this button is a FAB. Used to apply the correct class on the ripple. */
        this._isFab = false;
        this._disableRipple = false;
        this._disabled = false;
        const config = inject(MAT_BUTTON_CONFIG, { optional: true });
        const element = _elementRef.nativeElement;
        const classList = element.classList;
        this.disabledInteractive = config?.disabledInteractive ?? false;
        this.color = config?.color ?? null;
        this._rippleLoader?.configureRipple(element, { className: 'mat-mdc-button-ripple' });
        // For each of the variant selectors that is present in the button's host
        // attributes, add the correct corresponding MDC classes.
        for (const { attribute, mdcClasses } of HOST_SELECTOR_MDC_CLASS_PAIR) {
            if (element.hasAttribute(attribute)) {
                classList.add(...mdcClasses);
            }
        }
    }
    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true);
    }
    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef);
        this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);
    }
    /** Focuses the button. */
    focus(origin = 'program', options) {
        if (origin) {
            this._focusMonitor.focusVia(this._elementRef.nativeElement, origin, options);
        }
        else {
            this._elementRef.nativeElement.focus(options);
        }
    }
    _getAriaDisabled() {
        if (this.ariaDisabled != null) {
            return this.ariaDisabled;
        }
        return this.disabled && this.disabledInteractive ? true : null;
    }
    _getDisabledAttribute() {
        return this.disabledInteractive || !this.disabled ? null : true;
    }
    _updateRippleDisabled() {
        this._rippleLoader?.setDisabled(this._elementRef.nativeElement, this.disableRipple || this.disabled);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonBase, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatButtonBase, inputs: { color: "color", disableRipple: ["disableRipple", "disableRipple", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute], ariaDisabled: ["aria-disabled", "ariaDisabled", booleanAttribute], disabledInteractive: ["disabledInteractive", "disabledInteractive", booleanAttribute] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Platform }, { type: i0.NgZone }, { type: undefined }], propDecorators: { color: [{
                type: Input
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], ariaDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute, alias: 'aria-disabled' }]
            }], disabledInteractive: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
/** Shared host configuration for buttons using the `<a>` tag. */
export const MAT_ANCHOR_HOST = {
    // Note that this is basically a noop on anchors,
    // but it appears that some internal apps depend on it.
    '[attr.disabled]': '_getDisabledAttribute()',
    '[class.mat-mdc-button-disabled]': 'disabled',
    '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    // Note that we ignore the user-specified tabindex when it's disabled for
    // consistency with the `mat-button` applied on native buttons where even
    // though they have an index, they're not tabbable.
    '[attr.tabindex]': 'disabled && !disabledInteractive ? -1 : tabIndex',
    '[attr.aria-disabled]': '_getAriaDisabled()',
    // MDC automatically applies the primary theme color to the button, but we want to support
    // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
    // select and style this "theme".
    '[class.mat-unthemed]': '!color',
    // Add a class that applies to all buttons. This makes it easier to target if somebody
    // wants to target all Material buttons.
    '[class.mat-mdc-button-base]': 'true',
    '[class]': 'color ? "mat-" + color : ""',
};
/**
 * Anchor button base.
 */
export class MatAnchorBase extends MatButtonBase {
    constructor(elementRef, platform, ngZone, animationMode) {
        super(elementRef, platform, ngZone, animationMode);
        this._haltDisabledEvents = (event) => {
            // A disabled button shouldn't apply any actions
            if (this.disabled) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
    }
    ngOnInit() {
        this._ngZone.runOutsideAngular(() => {
            this._elementRef.nativeElement.addEventListener('click', this._haltDisabledEvents);
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._elementRef.nativeElement.removeEventListener('click', this._haltDisabledEvents);
    }
    _getAriaDisabled() {
        if (this.ariaDisabled != null) {
            return this.ariaDisabled;
        }
        return this.disabled || null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAnchorBase, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatAnchorBase, inputs: { tabIndex: ["tabIndex", "tabIndex", (value) => {
                    return value == null ? undefined : numberAttribute(value);
                }] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAnchorBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Platform }, { type: i0.NgZone }, { type: undefined }], propDecorators: { tabIndex: [{
                type: Input,
                args: [{
                        transform: (value) => {
                            return value == null ? undefined : numberAttribute(value);
                        },
                    }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYnV0dG9uL2J1dHRvbi1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUVMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEdBR2hCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBWSxlQUFlLEVBQWUsTUFBTSx3QkFBd0IsQ0FBQzs7O0FBV2hGLDRGQUE0RjtBQUM1RixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGNBQWMsQ0FBa0IsbUJBQW1CLENBQUMsQ0FBQztBQUUxRixnREFBZ0Q7QUFDaEQsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHO0lBQzdCLGlCQUFpQixFQUFFLHlCQUF5QjtJQUM1QyxzQkFBc0IsRUFBRSxvQkFBb0I7SUFDNUMsaUNBQWlDLEVBQUUsVUFBVTtJQUM3Qyw2Q0FBNkMsRUFBRSxxQkFBcUI7SUFDcEUsaUNBQWlDLEVBQUUscUNBQXFDO0lBQ3hFLDBGQUEwRjtJQUMxRixzRkFBc0Y7SUFDdEYsaUNBQWlDO0lBQ2pDLHNCQUFzQixFQUFFLFFBQVE7SUFDaEMsc0ZBQXNGO0lBQ3RGLHdDQUF3QztJQUN4Qyw2QkFBNkIsRUFBRSxNQUFNO0lBQ3JDLFNBQVMsRUFBRSw2QkFBNkI7Q0FDekMsQ0FBQztBQUVGLG9GQUFvRjtBQUNwRixNQUFNLDRCQUE0QixHQUFnRDtJQUNoRjtRQUNFLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQztL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QUFJLENBQUMsWUFBWSxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztJQUMvQixDQUFDO3FIQXBDVSxhQUFhO3lHQUFiLGFBQWEsK0NBRVgsQ0FBQyxLQUFjLEVBQUUsRUFBRTtvQkFDNUIsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUQsQ0FBQzs7a0dBSlEsYUFBYTtrQkFEekIsU0FBUztnSkFPUixRQUFRO3NCQUxQLEtBQUs7dUJBQUM7d0JBQ0wsU0FBUyxFQUFFLENBQUMsS0FBYyxFQUFFLEVBQUU7NEJBQzVCLE9BQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzVELENBQUM7cUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtGb2N1c01vbml0b3IsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBpbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBudW1iZXJBdHRyaWJ1dGUsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0UmlwcGxlLCBNYXRSaXBwbGVMb2FkZXIsIFRoZW1lUGFsZXR0ZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGJ1dHRvbiBjb21wb25lbnQuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdEJ1dHRvbkNvbmZpZyB7XG4gIC8qKiBXaGV0aGVyIGRpc2FibGVkIGJ1dHRvbnMgc2hvdWxkIGJlIGludGVyYWN0aXZlLiAqL1xuICBkaXNhYmxlZEludGVyYWN0aXZlPzogYm9vbGVhbjtcblxuICAvKiogRGVmYXVsdCBwYWxldHRlIGNvbG9yIHRvIGFwcGx5IHRvIGJ1dHRvbnMuICovXG4gIGNvbG9yPzogVGhlbWVQYWxldHRlO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIHRoZSBidXR0b24gY29tcG9uZW50LiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9CVVRUT05fQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuPE1hdEJ1dHRvbkNvbmZpZz4oJ01BVF9CVVRUT05fQ09ORklHJyk7XG5cbi8qKiBTaGFyZWQgaG9zdCBjb25maWd1cmF0aW9uIGZvciBhbGwgYnV0dG9ucyAqL1xuZXhwb3J0IGNvbnN0IE1BVF9CVVRUT05fSE9TVCA9IHtcbiAgJ1thdHRyLmRpc2FibGVkXSc6ICdfZ2V0RGlzYWJsZWRBdHRyaWJ1dGUoKScsXG4gICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdfZ2V0QXJpYURpc2FibGVkKCknLFxuICAnW2NsYXNzLm1hdC1tZGMtYnV0dG9uLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICdbY2xhc3MubWF0LW1kYy1idXR0b24tZGlzYWJsZWQtaW50ZXJhY3RpdmVdJzogJ2Rpc2FibGVkSW50ZXJhY3RpdmUnLFxuICAnW2NsYXNzLl9tYXQtYW5pbWF0aW9uLW5vb3BhYmxlXSc6ICdfYW5pbWF0aW9uTW9kZSA9PT0gXCJOb29wQW5pbWF0aW9uc1wiJyxcbiAgLy8gTURDIGF1dG9tYXRpY2FsbHkgYXBwbGllcyB0aGUgcHJpbWFyeSB0aGVtZSBjb2xvciB0byB0aGUgYnV0dG9uLCBidXQgd2Ugd2FudCB0byBzdXBwb3J0XG4gIC8vIGFuIHVudGhlbWVkIHZlcnNpb24uIElmIGNvbG9yIGlzIHVuZGVmaW5lZCwgYXBwbHkgYSBDU1MgY2xhc3MgdGhhdCBtYWtlcyBpdCBlYXN5IHRvXG4gIC8vIHNlbGVjdCBhbmQgc3R5bGUgdGhpcyBcInRoZW1lXCIuXG4gICdbY2xhc3MubWF0LXVudGhlbWVkXSc6ICchY29sb3InLFxuICAvLyBBZGQgYSBjbGFzcyB0aGF0IGFwcGxpZXMgdG8gYWxsIGJ1dHRvbnMuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvIHRhcmdldCBpZiBzb21lYm9keVxuICAvLyB3YW50cyB0byB0YXJnZXQgYWxsIE1hdGVyaWFsIGJ1dHRvbnMuXG4gICdbY2xhc3MubWF0LW1kYy1idXR0b24tYmFzZV0nOiAndHJ1ZScsXG4gICdbY2xhc3NdJzogJ2NvbG9yID8gXCJtYXQtXCIgKyBjb2xvciA6IFwiXCInLFxufTtcblxuLyoqIExpc3Qgb2YgY2xhc3NlcyB0byBhZGQgdG8gYnV0dG9ucyBpbnN0YW5jZXMgYmFzZWQgb24gaG9zdCBhdHRyaWJ1dGUgc2VsZWN0b3IuICovXG5jb25zdCBIT1NUX1NFTEVDVE9SX01EQ19DTEFTU19QQUlSOiB7YXR0cmlidXRlOiBzdHJpbmc7IG1kY0NsYXNzZXM6IHN0cmluZ1tdfVtdID0gW1xuICB7XG4gICAgYXR0cmlidXRlOiAnbWF0LWJ1dHRvbicsXG4gICAgbWRjQ2xhc3NlczogWydtZGMtYnV0dG9uJywgJ21hdC1tZGMtYnV0dG9uJ10sXG4gIH0sXG4gIHtcbiAgICBhdHRyaWJ1dGU6ICdtYXQtZmxhdC1idXR0b24nLFxuICAgIG1kY0NsYXNzZXM6IFsnbWRjLWJ1dHRvbicsICdtZGMtYnV0dG9uLS11bmVsZXZhdGVkJywgJ21hdC1tZGMtdW5lbGV2YXRlZC1idXR0b24nXSxcbiAgfSxcbiAge1xuICAgIGF0dHJpYnV0ZTogJ21hdC1yYWlzZWQtYnV0dG9uJyxcbiAgICBtZGNDbGFzc2VzOiBbJ21kYy1idXR0b24nLCAnbWRjLWJ1dHRvbi0tcmFpc2VkJywgJ21hdC1tZGMtcmFpc2VkLWJ1dHRvbiddLFxuICB9LFxuICB7XG4gICAgYXR0cmlidXRlOiAnbWF0LXN0cm9rZWQtYnV0dG9uJyxcbiAgICBtZGNDbGFzc2VzOiBbJ21kYy1idXR0b24nLCAnbWRjLWJ1dHRvbi0tb3V0bGluZWQnLCAnbWF0LW1kYy1vdXRsaW5lZC1idXR0b24nXSxcbiAgfSxcbiAge1xuICAgIGF0dHJpYnV0ZTogJ21hdC1mYWInLFxuICAgIG1kY0NsYXNzZXM6IFsnbWRjLWZhYicsICdtYXQtbWRjLWZhYi1iYXNlJywgJ21hdC1tZGMtZmFiJ10sXG4gIH0sXG4gIHtcbiAgICBhdHRyaWJ1dGU6ICdtYXQtbWluaS1mYWInLFxuICAgIG1kY0NsYXNzZXM6IFsnbWRjLWZhYicsICdtYXQtbWRjLWZhYi1iYXNlJywgJ21kYy1mYWItLW1pbmknLCAnbWF0LW1kYy1taW5pLWZhYiddLFxuICB9LFxuICB7XG4gICAgYXR0cmlidXRlOiAnbWF0LWljb24tYnV0dG9uJyxcbiAgICBtZGNDbGFzc2VzOiBbJ21kYy1pY29uLWJ1dHRvbicsICdtYXQtbWRjLWljb24tYnV0dG9uJ10sXG4gIH0sXG5dO1xuXG4vKiogQmFzZSBjbGFzcyBmb3IgYWxsIGJ1dHRvbnMuICAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgTWF0QnV0dG9uQmFzZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZvY3VzTW9uaXRvciA9IGluamVjdChGb2N1c01vbml0b3IpO1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBsYXp5IGNyZWF0aW9uIG9mIHRoZSBNYXRCdXR0b24gcmlwcGxlLlxuICAgKiBVc2VkIHRvIGltcHJvdmUgaW5pdGlhbCBsb2FkIHRpbWUgb2YgbGFyZ2UgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgX3JpcHBsZUxvYWRlcjogTWF0UmlwcGxlTG9hZGVyID0gaW5qZWN0KE1hdFJpcHBsZUxvYWRlcik7XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBidXR0b24gaXMgYSBGQUIuIFVzZWQgdG8gYXBwbHkgdGhlIGNvcnJlY3QgY2xhc3Mgb24gdGhlIHJpcHBsZS4gKi9cbiAgX2lzRmFiID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgTWF0UmlwcGxlIGluc3RhbmNlIG9mIHRoZSBidXR0b24uXG4gICAqIEBkZXByZWNhdGVkIENvbnNpZGVyZWQgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsLiBUbyBiZSByZW1vdmVkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE3LjAuMFxuICAgKi9cbiAgZ2V0IHJpcHBsZSgpOiBNYXRSaXBwbGUge1xuICAgIHJldHVybiB0aGlzLl9yaXBwbGVMb2FkZXI/LmdldFJpcHBsZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpITtcbiAgfVxuICBzZXQgcmlwcGxlKHY6IE1hdFJpcHBsZSkge1xuICAgIHRoaXMuX3JpcHBsZUxvYWRlcj8uYXR0YWNoUmlwcGxlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdik7XG4gIH1cblxuICAvKipcbiAgICogVGhlbWUgY29sb3Igb2YgdGhlIGJ1dHRvbi4gVGhpcyBBUEkgaXMgc3VwcG9ydGVkIGluIE0yIHRoZW1lcyBvbmx5LCBpdCBoYXNcbiAgICogbm8gZWZmZWN0IGluIE0zIHRoZW1lcy5cbiAgICpcbiAgICogRm9yIGluZm9ybWF0aW9uIG9uIGFwcGx5aW5nIGNvbG9yIHZhcmlhbnRzIGluIE0zLCBzZWVcbiAgICogaHR0cHM6Ly9tYXRlcmlhbC5hbmd1bGFyLmlvL2d1aWRlL3RoZW1pbmcjdXNpbmctY29tcG9uZW50LWNvbG9yLXZhcmlhbnRzLlxuICAgKi9cbiAgQElucHV0KCkgY29sb3I/OiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSByaXBwbGUgZWZmZWN0IGlzIGRpc2FibGVkIG9yIG5vdC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzYWJsZVJpcHBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZVJpcHBsZTtcbiAgfVxuICBzZXQgZGlzYWJsZVJpcHBsZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fZGlzYWJsZVJpcHBsZSA9IHZhbHVlO1xuICAgIHRoaXMuX3VwZGF0ZVJpcHBsZURpc2FibGVkKCk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZVJpcHBsZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBidXR0b24gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGFueSkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgdGhpcy5fdXBkYXRlUmlwcGxlRGlzYWJsZWQoKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBgYXJpYS1kaXNhYmxlZGAgdmFsdWUgb2YgdGhlIGJ1dHRvbi4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUsIGFsaWFzOiAnYXJpYS1kaXNhYmxlZCd9KVxuICBhcmlhRGlzYWJsZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIE5hdGl2ZWx5IGRpc2FibGVkIGJ1dHRvbnMgcHJldmVudCBmb2N1cyBhbmQgYW55IHBvaW50ZXIgZXZlbnRzIGZyb20gcmVhY2hpbmcgdGhlIGJ1dHRvbi5cbiAgICogSW4gc29tZSBzY2VuYXJpb3MgdGhpcyBtaWdodCBub3QgYmUgZGVzaXJhYmxlLCBiZWNhdXNlIGl0IGNhbiBwcmV2ZW50IHVzZXJzIGZyb20gZmluZGluZyBvdXRcbiAgICogd2h5IHRoZSBidXR0b24gaXMgZGlzYWJsZWQgKGUuZy4gdmlhIHRvb2x0aXApLlxuICAgKlxuICAgKiBFbmFibGluZyB0aGlzIGlucHV0IHdpbGwgY2hhbmdlIHRoZSBidXR0b24gc28gdGhhdCBpdCBpcyBzdHlsZWQgdG8gYmUgZGlzYWJsZWQgYW5kIHdpbGwgYmVcbiAgICogbWFya2VkIGFzIGBhcmlhLWRpc2FibGVkYCwgYnV0IGl0IHdpbGwgYWxsb3cgdGhlIGJ1dHRvbiB0byByZWNlaXZlIGV2ZW50cyBhbmQgZm9jdXMuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBieSBlbmFibGluZyB0aGlzLCB5b3UgbmVlZCB0byBzZXQgdGhlIGB0YWJpbmRleGAgeW91cnNlbGYgaWYgdGhlIGJ1dHRvbiBpc24ndFxuICAgKiBtZWFudCB0byBiZSB0YWJiYWJsZSBhbmQgeW91IGhhdmUgdG8gcHJldmVudCB0aGUgYnV0dG9uIGFjdGlvbiAoZS5nLiBmb3JtIHN1Ym1pc3Npb25zKS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZGlzYWJsZWRJbnRlcmFjdGl2ZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgcHVibGljIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwdWJsaWMgX2FuaW1hdGlvbk1vZGU/OiBzdHJpbmcsXG4gICkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGluamVjdChNQVRfQlVUVE9OX0NPTkZJRywge29wdGlvbmFsOiB0cnVlfSk7XG4gICAgY29uc3QgZWxlbWVudCA9IF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgY2xhc3NMaXN0ID0gKGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdDtcblxuICAgIHRoaXMuZGlzYWJsZWRJbnRlcmFjdGl2ZSA9IGNvbmZpZz8uZGlzYWJsZWRJbnRlcmFjdGl2ZSA/PyBmYWxzZTtcbiAgICB0aGlzLmNvbG9yID0gY29uZmlnPy5jb2xvciA/PyBudWxsO1xuICAgIHRoaXMuX3JpcHBsZUxvYWRlcj8uY29uZmlndXJlUmlwcGxlKGVsZW1lbnQsIHtjbGFzc05hbWU6ICdtYXQtbWRjLWJ1dHRvbi1yaXBwbGUnfSk7XG5cbiAgICAvLyBGb3IgZWFjaCBvZiB0aGUgdmFyaWFudCBzZWxlY3RvcnMgdGhhdCBpcyBwcmVzZW50IGluIHRoZSBidXR0b24ncyBob3N0XG4gICAgLy8gYXR0cmlidXRlcywgYWRkIHRoZSBjb3JyZWN0IGNvcnJlc3BvbmRpbmcgTURDIGNsYXNzZXMuXG4gICAgZm9yIChjb25zdCB7YXR0cmlidXRlLCBtZGNDbGFzc2VzfSBvZiBIT1NUX1NFTEVDVE9SX01EQ19DTEFTU19QQUlSKSB7XG4gICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgICAgICBjbGFzc0xpc3QuYWRkKC4uLm1kY0NsYXNzZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9mb2N1c01vbml0b3IubW9uaXRvcih0aGlzLl9lbGVtZW50UmVmLCB0cnVlKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5zdG9wTW9uaXRvcmluZyh0aGlzLl9lbGVtZW50UmVmKTtcbiAgICB0aGlzLl9yaXBwbGVMb2FkZXI/LmRlc3Ryb3lSaXBwbGUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBidXR0b24uICovXG4gIGZvY3VzKG9yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScsIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICB0aGlzLl9mb2N1c01vbml0b3IuZm9jdXNWaWEodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBvcmlnaW4sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMob3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIF9nZXRBcmlhRGlzYWJsZWQoKSB7XG4gICAgaWYgKHRoaXMuYXJpYURpc2FibGVkICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmFyaWFEaXNhYmxlZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCAmJiB0aGlzLmRpc2FibGVkSW50ZXJhY3RpdmUgPyB0cnVlIDogbnVsbDtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZ2V0RGlzYWJsZWRBdHRyaWJ1dGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWRJbnRlcmFjdGl2ZSB8fCAhdGhpcy5kaXNhYmxlZCA/IG51bGwgOiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlUmlwcGxlRGlzYWJsZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fcmlwcGxlTG9hZGVyPy5zZXREaXNhYmxlZChcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCxcbiAgICAgIHRoaXMuZGlzYWJsZVJpcHBsZSB8fCB0aGlzLmRpc2FibGVkLFxuICAgICk7XG4gIH1cbn1cblxuLyoqIFNoYXJlZCBob3N0IGNvbmZpZ3VyYXRpb24gZm9yIGJ1dHRvbnMgdXNpbmcgdGhlIGA8YT5gIHRhZy4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQU5DSE9SX0hPU1QgPSB7XG4gIC8vIE5vdGUgdGhhdCB0aGlzIGlzIGJhc2ljYWxseSBhIG5vb3Agb24gYW5jaG9ycyxcbiAgLy8gYnV0IGl0IGFwcGVhcnMgdGhhdCBzb21lIGludGVybmFsIGFwcHMgZGVwZW5kIG9uIGl0LlxuICAnW2F0dHIuZGlzYWJsZWRdJzogJ19nZXREaXNhYmxlZEF0dHJpYnV0ZSgpJyxcbiAgJ1tjbGFzcy5tYXQtbWRjLWJ1dHRvbi1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAnW2NsYXNzLm1hdC1tZGMtYnV0dG9uLWRpc2FibGVkLWludGVyYWN0aXZlXSc6ICdkaXNhYmxlZEludGVyYWN0aXZlJyxcbiAgJ1tjbGFzcy5fbWF0LWFuaW1hdGlvbi1ub29wYWJsZV0nOiAnX2FuaW1hdGlvbk1vZGUgPT09IFwiTm9vcEFuaW1hdGlvbnNcIicsXG5cbiAgLy8gTm90ZSB0aGF0IHdlIGlnbm9yZSB0aGUgdXNlci1zcGVjaWZpZWQgdGFiaW5kZXggd2hlbiBpdCdzIGRpc2FibGVkIGZvclxuICAvLyBjb25zaXN0ZW5jeSB3aXRoIHRoZSBgbWF0LWJ1dHRvbmAgYXBwbGllZCBvbiBuYXRpdmUgYnV0dG9ucyB3aGVyZSBldmVuXG4gIC8vIHRob3VnaCB0aGV5IGhhdmUgYW4gaW5kZXgsIHRoZXkncmUgbm90IHRhYmJhYmxlLlxuICAnW2F0dHIudGFiaW5kZXhdJzogJ2Rpc2FibGVkICYmICFkaXNhYmxlZEludGVyYWN0aXZlID8gLTEgOiB0YWJJbmRleCcsXG4gICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdfZ2V0QXJpYURpc2FibGVkKCknLFxuICAvLyBNREMgYXV0b21hdGljYWxseSBhcHBsaWVzIHRoZSBwcmltYXJ5IHRoZW1lIGNvbG9yIHRvIHRoZSBidXR0b24sIGJ1dCB3ZSB3YW50IHRvIHN1cHBvcnRcbiAgLy8gYW4gdW50aGVtZWQgdmVyc2lvbi4gSWYgY29sb3IgaXMgdW5kZWZpbmVkLCBhcHBseSBhIENTUyBjbGFzcyB0aGF0IG1ha2VzIGl0IGVhc3kgdG9cbiAgLy8gc2VsZWN0IGFuZCBzdHlsZSB0aGlzIFwidGhlbWVcIi5cbiAgJ1tjbGFzcy5tYXQtdW50aGVtZWRdJzogJyFjb2xvcicsXG4gIC8vIEFkZCBhIGNsYXNzIHRoYXQgYXBwbGllcyB0byBhbGwgYnV0dG9ucy4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG8gdGFyZ2V0IGlmIHNvbWVib2R5XG4gIC8vIHdhbnRzIHRvIHRhcmdldCBhbGwgTWF0ZXJpYWwgYnV0dG9ucy5cbiAgJ1tjbGFzcy5tYXQtbWRjLWJ1dHRvbi1iYXNlXSc6ICd0cnVlJyxcbiAgJ1tjbGFzc10nOiAnY29sb3IgPyBcIm1hdC1cIiArIGNvbG9yIDogXCJcIicsXG59O1xuXG4vKipcbiAqIEFuY2hvciBidXR0b24gYmFzZS5cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgTWF0QW5jaG9yQmFzZSBleHRlbmRzIE1hdEJ1dHRvbkJhc2UgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCh7XG4gICAgdHJhbnNmb3JtOiAodmFsdWU6IHVua25vd24pID0+IHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gdW5kZWZpbmVkIDogbnVtYmVyQXR0cmlidXRlKHZhbHVlKTtcbiAgICB9LFxuICB9KVxuICB0YWJJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHBsYXRmb3JtOiBQbGF0Zm9ybSwgbmdab25lOiBOZ1pvbmUsIGFuaW1hdGlvbk1vZGU/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBwbGF0Zm9ybSwgbmdab25lLCBhbmltYXRpb25Nb2RlKTtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYWx0RGlzYWJsZWRFdmVudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYWx0RGlzYWJsZWRFdmVudHMpO1xuICB9XG5cbiAgX2hhbHREaXNhYmxlZEV2ZW50cyA9IChldmVudDogRXZlbnQpOiB2b2lkID0+IHtcbiAgICAvLyBBIGRpc2FibGVkIGJ1dHRvbiBzaG91bGRuJ3QgYXBwbHkgYW55IGFjdGlvbnNcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfTtcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2dldEFyaWFEaXNhYmxlZCgpIHtcbiAgICBpZiAodGhpcy5hcmlhRGlzYWJsZWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXJpYURpc2FibGVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCB8fCBudWxsO1xuICB9XG59XG4iXX0=