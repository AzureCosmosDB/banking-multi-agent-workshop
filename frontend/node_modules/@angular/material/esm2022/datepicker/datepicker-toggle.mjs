/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Directive, Input, ViewEncapsulation, ViewChild, booleanAttribute, } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { merge, of as observableOf, Subscription } from 'rxjs';
import { MatDatepickerIntl } from './datepicker-intl';
import * as i0 from "@angular/core";
import * as i1 from "./datepicker-intl";
/** Can be used to override the icon of a `matDatepickerToggle`. */
export class MatDatepickerToggleIcon {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerToggleIcon, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDatepickerToggleIcon, isStandalone: true, selector: "[matDatepickerToggleIcon]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerToggleIcon, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matDatepickerToggleIcon]',
                    standalone: true,
                }]
        }] });
export class MatDatepickerToggle {
    /** Whether the toggle button is disabled. */
    get disabled() {
        if (this._disabled === undefined && this.datepicker) {
            return this.datepicker.disabled;
        }
        return !!this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    constructor(_intl, _changeDetectorRef, defaultTabIndex) {
        this._intl = _intl;
        this._changeDetectorRef = _changeDetectorRef;
        this._stateChanges = Subscription.EMPTY;
        const parsedTabIndex = Number(defaultTabIndex);
        this.tabIndex = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
    }
    ngOnChanges(changes) {
        if (changes['datepicker']) {
            this._watchStateChanges();
        }
    }
    ngOnDestroy() {
        this._stateChanges.unsubscribe();
    }
    ngAfterContentInit() {
        this._watchStateChanges();
    }
    _open(event) {
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            event.stopPropagation();
        }
    }
    _watchStateChanges() {
        const datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : observableOf();
        const inputStateChanged = this.datepicker && this.datepicker.datepickerInput
            ? this.datepicker.datepickerInput.stateChanges
            : observableOf();
        const datepickerToggled = this.datepicker
            ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
            : observableOf();
        this._stateChanges.unsubscribe();
        this._stateChanges = merge(this._intl.changes, datepickerStateChanged, inputStateChanged, datepickerToggled).subscribe(() => this._changeDetectorRef.markForCheck());
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerToggle, deps: [{ token: i1.MatDatepickerIntl }, { token: i0.ChangeDetectorRef }, { token: 'tabindex', attribute: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatDatepickerToggle, isStandalone: true, selector: "mat-datepicker-toggle", inputs: { datepicker: ["for", "datepicker"], tabIndex: "tabIndex", ariaLabel: ["aria-label", "ariaLabel"], disabled: ["disabled", "disabled", booleanAttribute], disableRipple: "disableRipple" }, host: { listeners: { "click": "_open($event)" }, properties: { "attr.tabindex": "null", "class.mat-datepicker-toggle-active": "datepicker && datepicker.opened", "class.mat-accent": "datepicker && datepicker.color === \"accent\"", "class.mat-warn": "datepicker && datepicker.color === \"warn\"", "attr.data-mat-calendar": "datepicker ? datepicker.id : null" }, classAttribute: "mat-datepicker-toggle" }, queries: [{ propertyName: "_customIcon", first: true, predicate: MatDatepickerToggleIcon, descendants: true }], viewQueries: [{ propertyName: "_button", first: true, predicate: ["button"], descendants: true }], exportAs: ["matDatepickerToggle"], usesOnChanges: true, ngImport: i0, template: "<button\n  #button\n  mat-icon-button\n  type=\"button\"\n  [attr.aria-haspopup]=\"datepicker ? 'dialog' : null\"\n  [attr.aria-label]=\"ariaLabel || _intl.openCalendarLabel\"\n  [attr.tabindex]=\"disabled ? -1 : tabIndex\"\n  [disabled]=\"disabled\"\n  [disableRipple]=\"disableRipple\">\n\n  @if (!_customIcon) {\n    <svg\n      class=\"mat-datepicker-toggle-default-icon\"\n      viewBox=\"0 0 24 24\"\n      width=\"24px\"\n      height=\"24px\"\n      fill=\"currentColor\"\n      focusable=\"false\"\n      aria-hidden=\"true\">\n      <path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"/>\n    </svg>\n  }\n\n  <ng-content select=\"[matDatepickerToggleIcon]\"></ng-content>\n</button>\n", styles: [".mat-datepicker-toggle{pointer-events:auto;color:var(--mat-datepicker-toggle-icon-color, var(--mat-app-on-surface-variant))}.mat-datepicker-toggle-active{color:var(--mat-datepicker-toggle-active-state-icon-color, var(--mat-app-on-surface-variant))}.cdk-high-contrast-active .mat-datepicker-toggle-default-icon{color:CanvasText}"], dependencies: [{ kind: "component", type: MatIconButton, selector: "button[mat-icon-button]", exportAs: ["matButton"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerToggle, decorators: [{
            type: Component,
            args: [{ selector: 'mat-datepicker-toggle', host: {
                        'class': 'mat-datepicker-toggle',
                        '[attr.tabindex]': 'null',
                        '[class.mat-datepicker-toggle-active]': 'datepicker && datepicker.opened',
                        '[class.mat-accent]': 'datepicker && datepicker.color === "accent"',
                        '[class.mat-warn]': 'datepicker && datepicker.color === "warn"',
                        // Used by the test harness to tie this toggle to its datepicker.
                        '[attr.data-mat-calendar]': 'datepicker ? datepicker.id : null',
                        // Bind the `click` on the host, rather than the inner `button`, so that we can call
                        // `stopPropagation` on it without affecting the user's `click` handlers. We need to stop
                        // it so that the input doesn't get focused automatically by the form field (See #21836).
                        '(click)': '_open($event)',
                    }, exportAs: 'matDatepickerToggle', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [MatIconButton], template: "<button\n  #button\n  mat-icon-button\n  type=\"button\"\n  [attr.aria-haspopup]=\"datepicker ? 'dialog' : null\"\n  [attr.aria-label]=\"ariaLabel || _intl.openCalendarLabel\"\n  [attr.tabindex]=\"disabled ? -1 : tabIndex\"\n  [disabled]=\"disabled\"\n  [disableRipple]=\"disableRipple\">\n\n  @if (!_customIcon) {\n    <svg\n      class=\"mat-datepicker-toggle-default-icon\"\n      viewBox=\"0 0 24 24\"\n      width=\"24px\"\n      height=\"24px\"\n      fill=\"currentColor\"\n      focusable=\"false\"\n      aria-hidden=\"true\">\n      <path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"/>\n    </svg>\n  }\n\n  <ng-content select=\"[matDatepickerToggleIcon]\"></ng-content>\n</button>\n", styles: [".mat-datepicker-toggle{pointer-events:auto;color:var(--mat-datepicker-toggle-icon-color, var(--mat-app-on-surface-variant))}.mat-datepicker-toggle-active{color:var(--mat-datepicker-toggle-active-state-icon-color, var(--mat-app-on-surface-variant))}.cdk-high-contrast-active .mat-datepicker-toggle-default-icon{color:CanvasText}"] }]
        }], ctorParameters: () => [{ type: i1.MatDatepickerIntl }, { type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['tabindex']
                }] }], propDecorators: { datepicker: [{
                type: Input,
                args: ['for']
            }], tabIndex: [{
                type: Input
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disableRipple: [{
                type: Input
            }], _customIcon: [{
                type: ContentChild,
                args: [MatDatepickerToggleIcon]
            }], _button: [{
                type: ViewChild,
                args: ['button']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b2dnbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlcGlja2VyLXRvZ2dsZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2RhdGVwaWNrZXItdG9nZ2xlLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osU0FBUyxFQUNULEtBQUssRUFJTCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxLQUFLLEVBQWMsRUFBRSxJQUFJLFlBQVksRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7OztBQUdwRCxtRUFBbUU7QUFLbkUsTUFBTSxPQUFPLHVCQUF1QjtxSEFBdkIsdUJBQXVCO3lHQUF2Qix1QkFBdUI7O2tHQUF2Qix1QkFBdUI7a0JBSm5DLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOztBQTBCRCxNQUFNLE9BQU8sbUJBQW1CO0lBWTlCLDZDQUE2QztJQUM3QyxJQUNJLFFBQVE7UUFDVixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFZRCxZQUNTLEtBQXdCLEVBQ3ZCLGtCQUFxQyxFQUN0QixlQUF1QjtRQUZ2QyxVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBcEN2QyxrQkFBYSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUF1Q3pDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNqRixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBWTtRQUNoQixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFFTyxrQkFBa0I7UUFDeEIsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0YsTUFBTSxpQkFBaUIsR0FDckIsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWU7WUFDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVk7WUFDOUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVU7WUFDdkMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUNuRSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQ2xCLHNCQUEwQyxFQUMxQyxpQkFBaUIsRUFDakIsaUJBQWlCLENBQ2xCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQzVELENBQUM7cUhBbEZVLG1CQUFtQixvRkFzQ2pCLFVBQVU7eUdBdENaLG1CQUFtQix1TUFhWCxnQkFBZ0IseWZBaUJyQix1QkFBdUIsMk1DekZ2QyxveEJBeUJBLGlZRGdDWSxhQUFhOztrR0FFWixtQkFBbUI7a0JBdkIvQixTQUFTOytCQUNFLHVCQUF1QixRQUczQjt3QkFDSixPQUFPLEVBQUUsdUJBQXVCO3dCQUNoQyxpQkFBaUIsRUFBRSxNQUFNO3dCQUN6QixzQ0FBc0MsRUFBRSxpQ0FBaUM7d0JBQ3pFLG9CQUFvQixFQUFFLDZDQUE2Qzt3QkFDbkUsa0JBQWtCLEVBQUUsMkNBQTJDO3dCQUMvRCxpRUFBaUU7d0JBQ2pFLDBCQUEwQixFQUFFLG1DQUFtQzt3QkFDL0Qsb0ZBQW9GO3dCQUNwRix5RkFBeUY7d0JBQ3pGLHlGQUF5Rjt3QkFDekYsU0FBUyxFQUFFLGVBQWU7cUJBQzNCLFlBQ1MscUJBQXFCLGlCQUNoQixpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNLGNBQ25DLElBQUksV0FDUCxDQUFDLGFBQWEsQ0FBQzs7MEJBd0NyQixTQUFTOzJCQUFDLFVBQVU7eUNBbENULFVBQVU7c0JBQXZCLEtBQUs7dUJBQUMsS0FBSztnQkFHSCxRQUFRO3NCQUFoQixLQUFLO2dCQUdlLFNBQVM7c0JBQTdCLEtBQUs7dUJBQUMsWUFBWTtnQkFJZixRQUFRO3NCQURYLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBYzNCLGFBQWE7c0JBQXJCLEtBQUs7Z0JBR2lDLFdBQVc7c0JBQWpELFlBQVk7dUJBQUMsdUJBQXVCO2dCQUdoQixPQUFPO3NCQUEzQixTQUFTO3VCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIFZpZXdDaGlsZCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEJ1dHRvbiwgTWF0SWNvbkJ1dHRvbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcbmltcG9ydCB7bWVyZ2UsIE9ic2VydmFibGUsIG9mIGFzIG9ic2VydmFibGVPZiwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckludGx9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnRsJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckNvbnRyb2wsIE1hdERhdGVwaWNrZXJQYW5lbH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xuXG4vKiogQ2FuIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGljb24gb2YgYSBgbWF0RGF0ZXBpY2tlclRvZ2dsZWAuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0RGF0ZXBpY2tlclRvZ2dsZUljb25dJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGF0ZXBpY2tlclRvZ2dsZUljb24ge31cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWRhdGVwaWNrZXItdG9nZ2xlJyxcbiAgdGVtcGxhdGVVcmw6ICdkYXRlcGlja2VyLXRvZ2dsZS5odG1sJyxcbiAgc3R5bGVVcmw6ICdkYXRlcGlja2VyLXRvZ2dsZS5jc3MnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1kYXRlcGlja2VyLXRvZ2dsZScsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdudWxsJyxcbiAgICAnW2NsYXNzLm1hdC1kYXRlcGlja2VyLXRvZ2dsZS1hY3RpdmVdJzogJ2RhdGVwaWNrZXIgJiYgZGF0ZXBpY2tlci5vcGVuZWQnLFxuICAgICdbY2xhc3MubWF0LWFjY2VudF0nOiAnZGF0ZXBpY2tlciAmJiBkYXRlcGlja2VyLmNvbG9yID09PSBcImFjY2VudFwiJyxcbiAgICAnW2NsYXNzLm1hdC13YXJuXSc6ICdkYXRlcGlja2VyICYmIGRhdGVwaWNrZXIuY29sb3IgPT09IFwid2FyblwiJyxcbiAgICAvLyBVc2VkIGJ5IHRoZSB0ZXN0IGhhcm5lc3MgdG8gdGllIHRoaXMgdG9nZ2xlIHRvIGl0cyBkYXRlcGlja2VyLlxuICAgICdbYXR0ci5kYXRhLW1hdC1jYWxlbmRhcl0nOiAnZGF0ZXBpY2tlciA/IGRhdGVwaWNrZXIuaWQgOiBudWxsJyxcbiAgICAvLyBCaW5kIHRoZSBgY2xpY2tgIG9uIHRoZSBob3N0LCByYXRoZXIgdGhhbiB0aGUgaW5uZXIgYGJ1dHRvbmAsIHNvIHRoYXQgd2UgY2FuIGNhbGxcbiAgICAvLyBgc3RvcFByb3BhZ2F0aW9uYCBvbiBpdCB3aXRob3V0IGFmZmVjdGluZyB0aGUgdXNlcidzIGBjbGlja2AgaGFuZGxlcnMuIFdlIG5lZWQgdG8gc3RvcFxuICAgIC8vIGl0IHNvIHRoYXQgdGhlIGlucHV0IGRvZXNuJ3QgZ2V0IGZvY3VzZWQgYXV0b21hdGljYWxseSBieSB0aGUgZm9ybSBmaWVsZCAoU2VlICMyMTgzNikuXG4gICAgJyhjbGljayknOiAnX29wZW4oJGV2ZW50KScsXG4gIH0sXG4gIGV4cG9ydEFzOiAnbWF0RGF0ZXBpY2tlclRvZ2dsZScsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbTWF0SWNvbkJ1dHRvbl0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdERhdGVwaWNrZXJUb2dnbGU8RD4gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3N0YXRlQ2hhbmdlcyA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogRGF0ZXBpY2tlciBpbnN0YW5jZSB0aGF0IHRoZSBidXR0b24gd2lsbCB0b2dnbGUuICovXG4gIEBJbnB1dCgnZm9yJykgZGF0ZXBpY2tlcjogTWF0RGF0ZXBpY2tlclBhbmVsPE1hdERhdGVwaWNrZXJDb250cm9sPGFueT4sIEQ+O1xuXG4gIC8qKiBUYWJpbmRleCBmb3IgdGhlIHRvZ2dsZS4gKi9cbiAgQElucHV0KCkgdGFiSW5kZXg6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFNjcmVlbi1yZWFkZXIgbGFiZWwgZm9yIHRoZSBidXR0b24uICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0b2dnbGUgYnV0dG9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgPT09IHVuZGVmaW5lZCAmJiB0aGlzLmRhdGVwaWNrZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGVwaWNrZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciByaXBwbGVzIG9uIHRoZSB0b2dnbGUgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKSBkaXNhYmxlUmlwcGxlOiBib29sZWFuO1xuXG4gIC8qKiBDdXN0b20gaWNvbiBzZXQgYnkgdGhlIGNvbnN1bWVyLiAqL1xuICBAQ29udGVudENoaWxkKE1hdERhdGVwaWNrZXJUb2dnbGVJY29uKSBfY3VzdG9tSWNvbjogTWF0RGF0ZXBpY2tlclRvZ2dsZUljb247XG5cbiAgLyoqIFVuZGVybHlpbmcgYnV0dG9uIGVsZW1lbnQuICovXG4gIEBWaWV3Q2hpbGQoJ2J1dHRvbicpIF9idXR0b246IE1hdEJ1dHRvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgX2ludGw6IE1hdERhdGVwaWNrZXJJbnRsLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAQXR0cmlidXRlKCd0YWJpbmRleCcpIGRlZmF1bHRUYWJJbmRleDogc3RyaW5nLFxuICApIHtcbiAgICBjb25zdCBwYXJzZWRUYWJJbmRleCA9IE51bWJlcihkZWZhdWx0VGFiSW5kZXgpO1xuICAgIHRoaXMudGFiSW5kZXggPSBwYXJzZWRUYWJJbmRleCB8fCBwYXJzZWRUYWJJbmRleCA9PT0gMCA/IHBhcnNlZFRhYkluZGV4IDogbnVsbDtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlc1snZGF0ZXBpY2tlciddKSB7XG4gICAgICB0aGlzLl93YXRjaFN0YXRlQ2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3dhdGNoU3RhdGVDaGFuZ2VzKCk7XG4gIH1cblxuICBfb3BlbihldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kYXRlcGlja2VyICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmRhdGVwaWNrZXIub3BlbigpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfd2F0Y2hTdGF0ZUNoYW5nZXMoKSB7XG4gICAgY29uc3QgZGF0ZXBpY2tlclN0YXRlQ2hhbmdlZCA9IHRoaXMuZGF0ZXBpY2tlciA/IHRoaXMuZGF0ZXBpY2tlci5zdGF0ZUNoYW5nZXMgOiBvYnNlcnZhYmxlT2YoKTtcbiAgICBjb25zdCBpbnB1dFN0YXRlQ2hhbmdlZCA9XG4gICAgICB0aGlzLmRhdGVwaWNrZXIgJiYgdGhpcy5kYXRlcGlja2VyLmRhdGVwaWNrZXJJbnB1dFxuICAgICAgICA/IHRoaXMuZGF0ZXBpY2tlci5kYXRlcGlja2VySW5wdXQuc3RhdGVDaGFuZ2VzXG4gICAgICAgIDogb2JzZXJ2YWJsZU9mKCk7XG4gICAgY29uc3QgZGF0ZXBpY2tlclRvZ2dsZWQgPSB0aGlzLmRhdGVwaWNrZXJcbiAgICAgID8gbWVyZ2UodGhpcy5kYXRlcGlja2VyLm9wZW5lZFN0cmVhbSwgdGhpcy5kYXRlcGlja2VyLmNsb3NlZFN0cmVhbSlcbiAgICAgIDogb2JzZXJ2YWJsZU9mKCk7XG5cbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMgPSBtZXJnZShcbiAgICAgIHRoaXMuX2ludGwuY2hhbmdlcyxcbiAgICAgIGRhdGVwaWNrZXJTdGF0ZUNoYW5nZWQgYXMgT2JzZXJ2YWJsZTx2b2lkPixcbiAgICAgIGlucHV0U3RhdGVDaGFuZ2VkLFxuICAgICAgZGF0ZXBpY2tlclRvZ2dsZWQsXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCkpO1xuICB9XG59XG4iLCI8YnV0dG9uXG4gICNidXR0b25cbiAgbWF0LWljb24tYnV0dG9uXG4gIHR5cGU9XCJidXR0b25cIlxuICBbYXR0ci5hcmlhLWhhc3BvcHVwXT1cImRhdGVwaWNrZXIgPyAnZGlhbG9nJyA6IG51bGxcIlxuICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbCB8fCBfaW50bC5vcGVuQ2FsZW5kYXJMYWJlbFwiXG4gIFthdHRyLnRhYmluZGV4XT1cImRpc2FibGVkID8gLTEgOiB0YWJJbmRleFwiXG4gIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiXG4gIFtkaXNhYmxlUmlwcGxlXT1cImRpc2FibGVSaXBwbGVcIj5cblxuICBAaWYgKCFfY3VzdG9tSWNvbikge1xuICAgIDxzdmdcbiAgICAgIGNsYXNzPVwibWF0LWRhdGVwaWNrZXItdG9nZ2xlLWRlZmF1bHQtaWNvblwiXG4gICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgIHdpZHRoPVwiMjRweFwiXG4gICAgICBoZWlnaHQ9XCIyNHB4XCJcbiAgICAgIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE5IDNoLTFWMWgtMnYySDhWMUg2djJINWMtMS4xMSAwLTEuOTkuOS0xLjk5IDJMMyAxOWMwIDEuMS44OSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yem0wIDE2SDVWOGgxNHYxMXpNNyAxMGg1djVIN3pcIi8+XG4gICAgPC9zdmc+XG4gIH1cblxuICA8bmctY29udGVudCBzZWxlY3Q9XCJbbWF0RGF0ZXBpY2tlclRvZ2dsZUljb25dXCI+PC9uZy1jb250ZW50PlxuPC9idXR0b24+XG4iXX0=