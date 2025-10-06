/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, Inject, InjectionToken, Input, Output, QueryList, TemplateRef, ViewChild, ViewEncapsulation, booleanAttribute, } from '@angular/core';
import { MAT_OPTGROUP, MAT_OPTION_PARENT_COMPONENT, MatOption, } from '@angular/material/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { panelAnimation } from './animations';
import { Subscription } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueAutocompleteIdCounter = 0;
/** Event object that is emitted when an autocomplete option is selected. */
export class MatAutocompleteSelectedEvent {
    constructor(
    /** Reference to the autocomplete panel that emitted the event. */
    source, 
    /** Option that was selected. */
    option) {
        this.source = source;
        this.option = option;
    }
}
/** Injection token to be used to override the default options for `mat-autocomplete`. */
export const MAT_AUTOCOMPLETE_DEFAULT_OPTIONS = new InjectionToken('mat-autocomplete-default-options', {
    providedIn: 'root',
    factory: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,
});
/** @docs-private */
export function MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY() {
    return {
        autoActiveFirstOption: false,
        autoSelectActiveOption: false,
        hideSingleSelectionIndicator: false,
        requireSelection: false,
    };
}
/** Autocomplete component. */
export class MatAutocomplete {
    /** Whether the autocomplete panel is open. */
    get isOpen() {
        return this._isOpen && this.showPanel;
    }
    /** @docs-private Sets the theme color of the panel. */
    _setColor(value) {
        this._color = value;
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Takes classes set on the host mat-autocomplete element and applies them to the panel
     * inside the overlay container to allow for easy styling.
     */
    set classList(value) {
        this._classList = value;
        this._elementRef.nativeElement.className = '';
    }
    /** Whether checkmark indicator for single-selection options is hidden. */
    get hideSingleSelectionIndicator() {
        return this._hideSingleSelectionIndicator;
    }
    set hideSingleSelectionIndicator(value) {
        this._hideSingleSelectionIndicator = value;
        this._syncParentProperties();
    }
    /** Syncs the parent state with the individual options. */
    _syncParentProperties() {
        if (this.options) {
            for (const option of this.options) {
                option._changeDetectorRef.markForCheck();
            }
        }
    }
    constructor(_changeDetectorRef, _elementRef, _defaults, platform) {
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._defaults = _defaults;
        this._activeOptionChanges = Subscription.EMPTY;
        /** Emits when the panel animation is done. Null if the panel doesn't animate. */
        this._animationDone = new EventEmitter();
        /** Whether the autocomplete panel should be visible, depending on option length. */
        this.showPanel = false;
        this._isOpen = false;
        /** Function that maps an option's control value to its display value in the trigger. */
        this.displayWith = null;
        /** Event that is emitted whenever an option from the list is selected. */
        this.optionSelected = new EventEmitter();
        /** Event that is emitted when the autocomplete panel is opened. */
        this.opened = new EventEmitter();
        /** Event that is emitted when the autocomplete panel is closed. */
        this.closed = new EventEmitter();
        /** Emits whenever an option is activated. */
        this.optionActivated = new EventEmitter();
        /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
        this.id = `mat-autocomplete-${_uniqueAutocompleteIdCounter++}`;
        // TODO(crisbeto): the problem that the `inertGroups` option resolves is only present on
        // Safari using VoiceOver. We should occasionally check back to see whether the bug
        // wasn't resolved in VoiceOver, and if it has, we can remove this and the `inertGroups`
        // option altogether.
        this.inertGroups = platform?.SAFARI || false;
        this.autoActiveFirstOption = !!_defaults.autoActiveFirstOption;
        this.autoSelectActiveOption = !!_defaults.autoSelectActiveOption;
        this.requireSelection = !!_defaults.requireSelection;
        this._hideSingleSelectionIndicator = this._defaults.hideSingleSelectionIndicator ?? false;
    }
    ngAfterContentInit() {
        this._keyManager = new ActiveDescendantKeyManager(this.options)
            .withWrap()
            .skipPredicate(this._skipPredicate);
        this._activeOptionChanges = this._keyManager.change.subscribe(index => {
            if (this.isOpen) {
                this.optionActivated.emit({ source: this, option: this.options.toArray()[index] || null });
            }
        });
        // Set the initial visibility state.
        this._setVisibility();
    }
    ngOnDestroy() {
        this._keyManager?.destroy();
        this._activeOptionChanges.unsubscribe();
        this._animationDone.complete();
    }
    /**
     * Sets the panel scrollTop. This allows us to manually scroll to display options
     * above or below the fold, as they are not actually being focused when active.
     */
    _setScrollTop(scrollTop) {
        if (this.panel) {
            this.panel.nativeElement.scrollTop = scrollTop;
        }
    }
    /** Returns the panel's scrollTop. */
    _getScrollTop() {
        return this.panel ? this.panel.nativeElement.scrollTop : 0;
    }
    /** Panel should hide itself when the option list is empty. */
    _setVisibility() {
        this.showPanel = !!this.options.length;
        this._changeDetectorRef.markForCheck();
    }
    /** Emits the `select` event. */
    _emitSelectEvent(option) {
        const event = new MatAutocompleteSelectedEvent(this, option);
        this.optionSelected.emit(event);
    }
    /** Gets the aria-labelledby for the autocomplete panel. */
    _getPanelAriaLabelledby(labelId) {
        if (this.ariaLabel) {
            return null;
        }
        const labelExpression = labelId ? labelId + ' ' : '';
        return this.ariaLabelledby ? labelExpression + this.ariaLabelledby : labelId;
    }
    // `skipPredicate` determines if key manager should avoid putting a given option in the tab
    // order. Allow disabled list items to receive focus via keyboard to align with WAI ARIA
    // recommendation.
    //
    // Normally WAI ARIA's instructions are to exclude disabled items from the tab order, but it
    // makes a few exceptions for compound widgets.
    //
    // From [Developing a Keyboard Interface](
    // https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
    //   "For the following composite widget elements, keep them focusable when disabled: Options in a
    //   Listbox..."
    //
    // The user can focus disabled options using the keyboard, but the user cannot click disabled
    // options.
    _skipPredicate() {
        return false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocomplete, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS }, { token: i1.Platform }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatAutocomplete, isStandalone: true, selector: "mat-autocomplete", inputs: { ariaLabel: ["aria-label", "ariaLabel"], ariaLabelledby: ["aria-labelledby", "ariaLabelledby"], displayWith: "displayWith", autoActiveFirstOption: ["autoActiveFirstOption", "autoActiveFirstOption", booleanAttribute], autoSelectActiveOption: ["autoSelectActiveOption", "autoSelectActiveOption", booleanAttribute], requireSelection: ["requireSelection", "requireSelection", booleanAttribute], panelWidth: "panelWidth", disableRipple: ["disableRipple", "disableRipple", booleanAttribute], classList: ["class", "classList"], hideSingleSelectionIndicator: ["hideSingleSelectionIndicator", "hideSingleSelectionIndicator", booleanAttribute] }, outputs: { optionSelected: "optionSelected", opened: "opened", closed: "closed", optionActivated: "optionActivated" }, host: { classAttribute: "mat-mdc-autocomplete" }, providers: [{ provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatAutocomplete }], queries: [{ propertyName: "options", predicate: MatOption, descendants: true }, { propertyName: "optionGroups", predicate: MAT_OPTGROUP, descendants: true }], viewQueries: [{ propertyName: "template", first: true, predicate: TemplateRef, descendants: true, static: true }, { propertyName: "panel", first: true, predicate: ["panel"], descendants: true }], exportAs: ["matAutocomplete"], ngImport: i0, template: "<ng-template let-formFieldId=\"id\">\n  <div\n    class=\"mat-mdc-autocomplete-panel mdc-menu-surface mdc-menu-surface--open\"\n    role=\"listbox\"\n    [id]=\"id\"\n    [class]=\"_classList\"\n    [class.mat-mdc-autocomplete-visible]=\"showPanel\"\n    [class.mat-mdc-autocomplete-hidden]=\"!showPanel\"\n    [class.mat-primary]=\"_color === 'primary'\"\n    [class.mat-accent]=\"_color === 'accent'\"\n    [class.mat-warn]=\"_color === 'warn'\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"_getPanelAriaLabelledby(formFieldId)\"\n    [@panelAnimation]=\"isOpen ? 'visible' : 'hidden'\"\n    (@panelAnimation.done)=\"_animationDone.next($event)\"\n    #panel>\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n", styles: ["div.mat-mdc-autocomplete-panel{width:100%;max-height:256px;visibility:hidden;transform-origin:center top;overflow:auto;padding:8px 0;box-sizing:border-box;position:static;border-radius:var(--mat-autocomplete-container-shape, var(--mat-app-corner-extra-small));box-shadow:var(--mat-autocomplete-container-elevation-shadow);background-color:var(--mat-autocomplete-background-color, var(--mat-app-surface-container))}.cdk-high-contrast-active div.mat-mdc-autocomplete-panel{outline:solid 1px}.cdk-overlay-pane:not(.mat-mdc-autocomplete-panel-above) div.mat-mdc-autocomplete-panel{border-top-left-radius:0;border-top-right-radius:0}.mat-mdc-autocomplete-panel-above div.mat-mdc-autocomplete-panel{border-bottom-left-radius:0;border-bottom-right-radius:0;transform-origin:center bottom}div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-visible{visibility:visible}div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-hidden{visibility:hidden;pointer-events:none}mat-autocomplete{display:none}"], animations: [panelAnimation], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocomplete, decorators: [{
            type: Component,
            args: [{ selector: 'mat-autocomplete', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, exportAs: 'matAutocomplete', host: {
                        'class': 'mat-mdc-autocomplete',
                    }, providers: [{ provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatAutocomplete }], animations: [panelAnimation], standalone: true, template: "<ng-template let-formFieldId=\"id\">\n  <div\n    class=\"mat-mdc-autocomplete-panel mdc-menu-surface mdc-menu-surface--open\"\n    role=\"listbox\"\n    [id]=\"id\"\n    [class]=\"_classList\"\n    [class.mat-mdc-autocomplete-visible]=\"showPanel\"\n    [class.mat-mdc-autocomplete-hidden]=\"!showPanel\"\n    [class.mat-primary]=\"_color === 'primary'\"\n    [class.mat-accent]=\"_color === 'accent'\"\n    [class.mat-warn]=\"_color === 'warn'\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"_getPanelAriaLabelledby(formFieldId)\"\n    [@panelAnimation]=\"isOpen ? 'visible' : 'hidden'\"\n    (@panelAnimation.done)=\"_animationDone.next($event)\"\n    #panel>\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n", styles: ["div.mat-mdc-autocomplete-panel{width:100%;max-height:256px;visibility:hidden;transform-origin:center top;overflow:auto;padding:8px 0;box-sizing:border-box;position:static;border-radius:var(--mat-autocomplete-container-shape, var(--mat-app-corner-extra-small));box-shadow:var(--mat-autocomplete-container-elevation-shadow);background-color:var(--mat-autocomplete-background-color, var(--mat-app-surface-container))}.cdk-high-contrast-active div.mat-mdc-autocomplete-panel{outline:solid 1px}.cdk-overlay-pane:not(.mat-mdc-autocomplete-panel-above) div.mat-mdc-autocomplete-panel{border-top-left-radius:0;border-top-right-radius:0}.mat-mdc-autocomplete-panel-above div.mat-mdc-autocomplete-panel{border-bottom-left-radius:0;border-bottom-right-radius:0;transform-origin:center bottom}div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-visible{visibility:visible}div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-hidden{visibility:hidden;pointer-events:none}mat-autocomplete{display:none}"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_AUTOCOMPLETE_DEFAULT_OPTIONS]
                }] }, { type: i1.Platform }], propDecorators: { template: [{
                type: ViewChild,
                args: [TemplateRef, { static: true }]
            }], panel: [{
                type: ViewChild,
                args: ['panel']
            }], options: [{
                type: ContentChildren,
                args: [MatOption, { descendants: true }]
            }], optionGroups: [{
                type: ContentChildren,
                args: [MAT_OPTGROUP, { descendants: true }]
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], ariaLabelledby: [{
                type: Input,
                args: ['aria-labelledby']
            }], displayWith: [{
                type: Input
            }], autoActiveFirstOption: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], autoSelectActiveOption: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], requireSelection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], panelWidth: [{
                type: Input
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], optionSelected: [{
                type: Output
            }], opened: [{
                type: Output
            }], closed: [{
                type: Output
            }], optionActivated: [{
                type: Output
            }], classList: [{
                type: Input,
                args: ['class']
            }], hideSingleSelectionIndicator: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2F1dG9jb21wbGV0ZS9hdXRvY29tcGxldGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxFQUNULFdBQVcsRUFDWCxTQUFTLEVBQ1QsaUJBQWlCLEVBQ2pCLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQ0wsWUFBWSxFQUNaLDJCQUEyQixFQUUzQixTQUFTLEdBRVYsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM1QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7QUFFbEM7OztHQUdHO0FBQ0gsSUFBSSw0QkFBNEIsR0FBRyxDQUFDLENBQUM7QUFFckMsNEVBQTRFO0FBQzVFLE1BQU0sT0FBTyw0QkFBNEI7SUFDdkM7SUFDRSxrRUFBa0U7SUFDM0QsTUFBdUI7SUFDOUIsZ0NBQWdDO0lBQ3pCLE1BQWlCO1FBRmpCLFdBQU0sR0FBTixNQUFNLENBQWlCO1FBRXZCLFdBQU0sR0FBTixNQUFNLENBQVc7SUFDdkIsQ0FBQztDQUNMO0FBZ0NELHlGQUF5RjtBQUN6RixNQUFNLENBQUMsTUFBTSxn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bkIsS0FBSztnQkFNZ0MscUJBQXFCO3NCQUExRCxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQUdFLHNCQUFzQjtzQkFBM0QsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFRRSxnQkFBZ0I7c0JBQXJELEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBTTNCLFVBQVU7c0JBQWxCLEtBQUs7Z0JBR2dDLGFBQWE7c0JBQWxELEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBR2pCLGNBQWM7c0JBQWhDLE1BQU07Z0JBSVksTUFBTTtzQkFBeEIsTUFBTTtnQkFHWSxNQUFNO3NCQUF4QixNQUFNO2dCQUdZLGVBQWU7c0JBQWpDLE1BQU07Z0JBUUgsU0FBUztzQkFEWixLQUFLO3VCQUFDLE9BQU87Z0JBU1YsNEJBQTRCO3NCQUQvQixLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QW5pbWF0aW9uRXZlbnR9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtcbiAgTUFUX09QVEdST1VQLFxuICBNQVRfT1BUSU9OX1BBUkVOVF9DT01QT05FTlQsXG4gIE1hdE9wdGdyb3VwLFxuICBNYXRPcHRpb24sXG4gIFRoZW1lUGFsZXR0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0FjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtwYW5lbEFuaW1hdGlvbn0gZnJvbSAnLi9hbmltYXRpb25zJztcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBBdXRvY29tcGxldGUgSURzIG5lZWQgdG8gYmUgdW5pcXVlIGFjcm9zcyBjb21wb25lbnRzLCBzbyB0aGlzIGNvdW50ZXIgZXhpc3RzIG91dHNpZGUgb2ZcbiAqIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi5cbiAqL1xubGV0IF91bmlxdWVBdXRvY29tcGxldGVJZENvdW50ZXIgPSAwO1xuXG4vKiogRXZlbnQgb2JqZWN0IHRoYXQgaXMgZW1pdHRlZCB3aGVuIGFuIGF1dG9jb21wbGV0ZSBvcHRpb24gaXMgc2VsZWN0ZWQuICovXG5leHBvcnQgY2xhc3MgTWF0QXV0b2NvbXBsZXRlU2VsZWN0ZWRFdmVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGF1dG9jb21wbGV0ZSBwYW5lbCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICAgIHB1YmxpYyBzb3VyY2U6IE1hdEF1dG9jb21wbGV0ZSxcbiAgICAvKiogT3B0aW9uIHRoYXQgd2FzIHNlbGVjdGVkLiAqL1xuICAgIHB1YmxpYyBvcHRpb246IE1hdE9wdGlvbixcbiAgKSB7fVxufVxuXG4vKiogRXZlbnQgb2JqZWN0IHRoYXQgaXMgZW1pdHRlZCB3aGVuIGFuIGF1dG9jb21wbGV0ZSBvcHRpb24gaXMgYWN0aXZhdGVkLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRBdXRvY29tcGxldGVBY3RpdmF0ZWRFdmVudCB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGF1dG9jb21wbGV0ZSBwYW5lbCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICBzb3VyY2U6IE1hdEF1dG9jb21wbGV0ZTtcblxuICAvKiogT3B0aW9uIHRoYXQgd2FzIHNlbGVjdGVkLiAqL1xuICBvcHRpb246IE1hdE9wdGlvbiB8IG51bGw7XG59XG5cbi8qKiBEZWZhdWx0IGBtYXQtYXV0b2NvbXBsZXRlYCBvcHRpb25zIHRoYXQgY2FuIGJlIG92ZXJyaWRkZW4uICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdEF1dG9jb21wbGV0ZURlZmF1bHRPcHRpb25zIHtcbiAgLyoqIFdoZXRoZXIgdGhlIGZpcnN0IG9wdGlvbiBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQgd2hlbiBhbiBhdXRvY29tcGxldGUgcGFuZWwgaXMgb3BlbmVkLiAqL1xuICBhdXRvQWN0aXZlRmlyc3RPcHRpb24/OiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBhY3RpdmUgb3B0aW9uIHNob3VsZCBiZSBzZWxlY3RlZCBhcyB0aGUgdXNlciBpcyBuYXZpZ2F0aW5nLiAqL1xuICBhdXRvU2VsZWN0QWN0aXZlT3B0aW9uPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdXNlciBpcyByZXF1aXJlZCB0byBtYWtlIGEgc2VsZWN0aW9uIHdoZW5cbiAgICogdGhleSdyZSBpbnRlcmFjdGluZyB3aXRoIHRoZSBhdXRvY29tcGxldGUuXG4gICAqL1xuICByZXF1aXJlU2VsZWN0aW9uPzogYm9vbGVhbjtcblxuICAvKiogQ2xhc3Mgb3IgbGlzdCBvZiBjbGFzc2VzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGF1dG9jb21wbGV0ZSdzIG92ZXJsYXkgcGFuZWwuICovXG4gIG92ZXJsYXlQYW5lbENsYXNzPzogc3RyaW5nIHwgc3RyaW5nW107XG5cbiAgLyoqIFdoZXRlciBpY29uIGluZGljYXRvcnMgc2hvdWxkIGJlIGhpZGRlbiBmb3Igc2luZ2xlLXNlbGVjdGlvbi4gKi9cbiAgaGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvcj86IGJvb2xlYW47XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdG8gYmUgdXNlZCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgbWF0LWF1dG9jb21wbGV0ZWAuICovXG5leHBvcnQgY29uc3QgTUFUX0FVVE9DT01QTEVURV9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0QXV0b2NvbXBsZXRlRGVmYXVsdE9wdGlvbnM+KFxuICAnbWF0LWF1dG9jb21wbGV0ZS1kZWZhdWx0LW9wdGlvbnMnLFxuICB7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6IE1BVF9BVVRPQ09NUExFVEVfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlksXG4gIH0sXG4pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9BVVRPQ09NUExFVEVfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogTWF0QXV0b2NvbXBsZXRlRGVmYXVsdE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIGF1dG9BY3RpdmVGaXJzdE9wdGlvbjogZmFsc2UsXG4gICAgYXV0b1NlbGVjdEFjdGl2ZU9wdGlvbjogZmFsc2UsXG4gICAgaGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvcjogZmFsc2UsXG4gICAgcmVxdWlyZVNlbGVjdGlvbjogZmFsc2UsXG4gIH07XG59XG5cbi8qKiBBdXRvY29tcGxldGUgY29tcG9uZW50LiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWF1dG9jb21wbGV0ZScsXG4gIHRlbXBsYXRlVXJsOiAnYXV0b2NvbXBsZXRlLmh0bWwnLFxuICBzdHlsZVVybDogJ2F1dG9jb21wbGV0ZS5jc3MnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZXhwb3J0QXM6ICdtYXRBdXRvY29tcGxldGUnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtYXV0b2NvbXBsZXRlJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9PUFRJT05fUEFSRU5UX0NPTVBPTkVOVCwgdXNlRXhpc3Rpbmc6IE1hdEF1dG9jb21wbGV0ZX1dLFxuICBhbmltYXRpb25zOiBbcGFuZWxBbmltYXRpb25dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRBdXRvY29tcGxldGUgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9hY3RpdmVPcHRpb25DaGFuZ2VzID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBwYW5lbCBhbmltYXRpb24gaXMgZG9uZS4gTnVsbCBpZiB0aGUgcGFuZWwgZG9lc24ndCBhbmltYXRlLiAqL1xuICBfYW5pbWF0aW9uRG9uZSA9IG5ldyBFdmVudEVtaXR0ZXI8QW5pbWF0aW9uRXZlbnQ+KCk7XG5cbiAgLyoqIE1hbmFnZXMgYWN0aXZlIGl0ZW0gaW4gb3B0aW9uIGxpc3QgYmFzZWQgb24ga2V5IGV2ZW50cy4gKi9cbiAgX2tleU1hbmFnZXI6IEFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyPE1hdE9wdGlvbj47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF1dG9jb21wbGV0ZSBwYW5lbCBzaG91bGQgYmUgdmlzaWJsZSwgZGVwZW5kaW5nIG9uIG9wdGlvbiBsZW5ndGguICovXG4gIHNob3dQYW5lbDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdXRvY29tcGxldGUgcGFuZWwgaXMgb3Blbi4gKi9cbiAgZ2V0IGlzT3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNPcGVuICYmIHRoaXMuc2hvd1BhbmVsO1xuICB9XG4gIF9pc09wZW46IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogTGF0ZXN0IHRyaWdnZXIgdGhhdCBvcGVuZWQgdGhlIGF1dG9jb21wbGV0ZS4gKi9cbiAgX2xhdGVzdE9wZW5pbmdUcmlnZ2VyOiB1bmtub3duO1xuXG4gIC8qKiBAZG9jcy1wcml2YXRlIFNldHMgdGhlIHRoZW1lIGNvbG9yIG9mIHRoZSBwYW5lbC4gKi9cbiAgX3NldENvbG9yKHZhbHVlOiBUaGVtZVBhbGV0dGUpIHtcbiAgICB0aGlzLl9jb2xvciA9IHZhbHVlO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG4gIC8qKiBAZG9jcy1wcml2YXRlIHRoZW1lIGNvbG9yIG9mIHRoZSBwYW5lbCAqL1xuICBwcm90ZWN0ZWQgX2NvbG9yOiBUaGVtZVBhbGV0dGU7XG5cbiAgLy8gVGhlIEBWaWV3Q2hpbGQgcXVlcnkgZm9yIFRlbXBsYXRlUmVmIGhlcmUgbmVlZHMgdG8gYmUgc3RhdGljIGJlY2F1c2Ugc29tZSBjb2RlIHBhdGhzXG4gIC8vIGxlYWQgdG8gdGhlIG92ZXJsYXkgYmVpbmcgY3JlYXRlZCBiZWZvcmUgY2hhbmdlIGRldGVjdGlvbiBoYXMgZmluaXNoZWQgZm9yIHRoaXMgY29tcG9uZW50LlxuICAvLyBOb3RhYmx5LCBhbm90aGVyIGNvbXBvbmVudCBtYXkgdHJpZ2dlciBgZm9jdXNgIG9uIHRoZSBhdXRvY29tcGxldGUtdHJpZ2dlci5cblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICBAVmlld0NoaWxkKFRlbXBsYXRlUmVmLCB7c3RhdGljOiB0cnVlfSkgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgLyoqIEVsZW1lbnQgZm9yIHRoZSBwYW5lbCBjb250YWluaW5nIHRoZSBhdXRvY29tcGxldGUgb3B0aW9ucy4gKi9cbiAgQFZpZXdDaGlsZCgncGFuZWwnKSBwYW5lbDogRWxlbWVudFJlZjtcblxuICAvKiogUmVmZXJlbmNlIHRvIGFsbCBvcHRpb25zIHdpdGhpbiB0aGUgYXV0b2NvbXBsZXRlLiAqL1xuICBAQ29udGVudENoaWxkcmVuKE1hdE9wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgb3B0aW9uczogUXVlcnlMaXN0PE1hdE9wdGlvbj47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byBhbGwgb3B0aW9uIGdyb3VwcyB3aXRoaW4gdGhlIGF1dG9jb21wbGV0ZS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihNQVRfT1BUR1JPVVAsIHtkZXNjZW5kYW50czogdHJ1ZX0pIG9wdGlvbkdyb3VwczogUXVlcnlMaXN0PE1hdE9wdGdyb3VwPjtcblxuICAvKiogQXJpYSBsYWJlbCBvZiB0aGUgYXV0b2NvbXBsZXRlLiAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWwnKSBhcmlhTGFiZWw6IHN0cmluZztcblxuICAvKiogSW5wdXQgdGhhdCBjYW4gYmUgdXNlZCB0byBzcGVjaWZ5IHRoZSBgYXJpYS1sYWJlbGxlZGJ5YCBhdHRyaWJ1dGUuICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbGxlZGJ5JykgYXJpYUxhYmVsbGVkYnk6IHN0cmluZztcblxuICAvKiogRnVuY3Rpb24gdGhhdCBtYXBzIGFuIG9wdGlvbidzIGNvbnRyb2wgdmFsdWUgdG8gaXRzIGRpc3BsYXkgdmFsdWUgaW4gdGhlIHRyaWdnZXIuICovXG4gIEBJbnB1dCgpIGRpc3BsYXlXaXRoOiAoKHZhbHVlOiBhbnkpID0+IHN0cmluZykgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZmlyc3Qgb3B0aW9uIHNob3VsZCBiZSBoaWdobGlnaHRlZCB3aGVuIHRoZSBhdXRvY29tcGxldGUgcGFuZWwgaXMgb3BlbmVkLlxuICAgKiBDYW4gYmUgY29uZmlndXJlZCBnbG9iYWxseSB0aHJvdWdoIHRoZSBgTUFUX0FVVE9DT01QTEVURV9ERUZBVUxUX09QVElPTlNgIHRva2VuLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBhdXRvQWN0aXZlRmlyc3RPcHRpb246IGJvb2xlYW47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGFjdGl2ZSBvcHRpb24gc2hvdWxkIGJlIHNlbGVjdGVkIGFzIHRoZSB1c2VyIGlzIG5hdmlnYXRpbmcuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgYXV0b1NlbGVjdEFjdGl2ZU9wdGlvbjogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdXNlciBpcyByZXF1aXJlZCB0byBtYWtlIGEgc2VsZWN0aW9uIHdoZW4gdGhleSdyZSBpbnRlcmFjdGluZyB3aXRoIHRoZVxuICAgKiBhdXRvY29tcGxldGUuIElmIHRoZSB1c2VyIG1vdmVzIGF3YXkgZnJvbSB0aGUgYXV0b2NvbXBsZXRlIHdpdGhvdXQgc2VsZWN0aW5nIGFuIG9wdGlvbiBmcm9tXG4gICAqIHRoZSBsaXN0LCB0aGUgdmFsdWUgd2lsbCBiZSByZXNldC4gSWYgdGhlIHVzZXIgb3BlbnMgdGhlIHBhbmVsIGFuZCBjbG9zZXMgaXQgd2l0aG91dFxuICAgKiBpbnRlcmFjdGluZyBvciBzZWxlY3RpbmcgYSB2YWx1ZSwgdGhlIGluaXRpYWwgdmFsdWUgd2lsbCBiZSBrZXB0LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSByZXF1aXJlU2VsZWN0aW9uOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSB3aWR0aCBvZiB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsLiAgQ2FuIGJlIGFueSBDU1Mgc2l6aW5nIHZhbHVlLCBvdGhlcndpc2UgaXQgd2lsbFxuICAgKiBtYXRjaCB0aGUgd2lkdGggb2YgaXRzIGhvc3QuXG4gICAqL1xuICBASW5wdXQoKSBwYW5lbFdpZHRoOiBzdHJpbmcgfCBudW1iZXI7XG5cbiAgLyoqIFdoZXRoZXIgcmlwcGxlcyBhcmUgZGlzYWJsZWQgd2l0aGluIHRoZSBhdXRvY29tcGxldGUgcGFuZWwuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZVJpcHBsZTogYm9vbGVhbjtcblxuICAvKiogRXZlbnQgdGhhdCBpcyBlbWl0dGVkIHdoZW5ldmVyIGFuIG9wdGlvbiBmcm9tIHRoZSBsaXN0IGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgb3B0aW9uU2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxNYXRBdXRvY29tcGxldGVTZWxlY3RlZEV2ZW50PiA9XG4gICAgbmV3IEV2ZW50RW1pdHRlcjxNYXRBdXRvY29tcGxldGVTZWxlY3RlZEV2ZW50PigpO1xuXG4gIC8qKiBFdmVudCB0aGF0IGlzIGVtaXR0ZWQgd2hlbiB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsIGlzIG9wZW5lZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBFdmVudCB0aGF0IGlzIGVtaXR0ZWQgd2hlbiB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsIGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuZXZlciBhbiBvcHRpb24gaXMgYWN0aXZhdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgb3B0aW9uQWN0aXZhdGVkOiBFdmVudEVtaXR0ZXI8TWF0QXV0b2NvbXBsZXRlQWN0aXZhdGVkRXZlbnQ+ID1cbiAgICBuZXcgRXZlbnRFbWl0dGVyPE1hdEF1dG9jb21wbGV0ZUFjdGl2YXRlZEV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBUYWtlcyBjbGFzc2VzIHNldCBvbiB0aGUgaG9zdCBtYXQtYXV0b2NvbXBsZXRlIGVsZW1lbnQgYW5kIGFwcGxpZXMgdGhlbSB0byB0aGUgcGFuZWxcbiAgICogaW5zaWRlIHRoZSBvdmVybGF5IGNvbnRhaW5lciB0byBhbGxvdyBmb3IgZWFzeSBzdHlsaW5nLlxuICAgKi9cbiAgQElucHV0KCdjbGFzcycpXG4gIHNldCBjbGFzc0xpc3QodmFsdWU6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5fY2xhc3NMaXN0ID0gdmFsdWU7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTmFtZSA9ICcnO1xuICB9XG4gIF9jbGFzc0xpc3Q6IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gIC8qKiBXaGV0aGVyIGNoZWNrbWFyayBpbmRpY2F0b3IgZm9yIHNpbmdsZS1zZWxlY3Rpb24gb3B0aW9ucyBpcyBoaWRkZW4uICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGhpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3IoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2hpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3I7XG4gIH1cbiAgc2V0IGhpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3IodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yID0gdmFsdWU7XG4gICAgdGhpcy5fc3luY1BhcmVudFByb3BlcnRpZXMoKTtcbiAgfVxuICBwcml2YXRlIF9oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yOiBib29sZWFuO1xuXG4gIC8qKiBTeW5jcyB0aGUgcGFyZW50IHN0YXRlIHdpdGggdGhlIGluZGl2aWR1YWwgb3B0aW9ucy4gKi9cbiAgX3N5bmNQYXJlbnRQcm9wZXJ0aWVzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcbiAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHRoaXMub3B0aW9ucykge1xuICAgICAgICBvcHRpb24uX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBVbmlxdWUgSUQgdG8gYmUgdXNlZCBieSBhdXRvY29tcGxldGUgdHJpZ2dlcidzIFwiYXJpYS1vd25zXCIgcHJvcGVydHkuICovXG4gIGlkOiBzdHJpbmcgPSBgbWF0LWF1dG9jb21wbGV0ZS0ke191bmlxdWVBdXRvY29tcGxldGVJZENvdW50ZXIrK31gO1xuXG4gIC8qKlxuICAgKiBUZWxscyBhbnkgZGVzY2VuZGFudCBgbWF0LW9wdGdyb3VwYCB0byB1c2UgdGhlIGluZXJ0IGExMXkgcGF0dGVybi5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVhZG9ubHkgaW5lcnRHcm91cHM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoTUFUX0FVVE9DT01QTEVURV9ERUZBVUxUX09QVElPTlMpIHByb3RlY3RlZCBfZGVmYXVsdHM6IE1hdEF1dG9jb21wbGV0ZURlZmF1bHRPcHRpb25zLFxuICAgIHBsYXRmb3JtPzogUGxhdGZvcm0sXG4gICkge1xuICAgIC8vIFRPRE8oY3Jpc2JldG8pOiB0aGUgcHJvYmxlbSB0aGF0IHRoZSBgaW5lcnRHcm91cHNgIG9wdGlvbiByZXNvbHZlcyBpcyBvbmx5IHByZXNlbnQgb25cbiAgICAvLyBTYWZhcmkgdXNpbmcgVm9pY2VPdmVyLiBXZSBzaG91bGQgb2NjYXNpb25hbGx5IGNoZWNrIGJhY2sgdG8gc2VlIHdoZXRoZXIgdGhlIGJ1Z1xuICAgIC8vIHdhc24ndCByZXNvbHZlZCBpbiBWb2ljZU92ZXIsIGFuZCBpZiBpdCBoYXMsIHdlIGNhbiByZW1vdmUgdGhpcyBhbmQgdGhlIGBpbmVydEdyb3Vwc2BcbiAgICAvLyBvcHRpb24gYWx0b2dldGhlci5cbiAgICB0aGlzLmluZXJ0R3JvdXBzID0gcGxhdGZvcm0/LlNBRkFSSSB8fCBmYWxzZTtcbiAgICB0aGlzLmF1dG9BY3RpdmVGaXJzdE9wdGlvbiA9ICEhX2RlZmF1bHRzLmF1dG9BY3RpdmVGaXJzdE9wdGlvbjtcbiAgICB0aGlzLmF1dG9TZWxlY3RBY3RpdmVPcHRpb24gPSAhIV9kZWZhdWx0cy5hdXRvU2VsZWN0QWN0aXZlT3B0aW9uO1xuICAgIHRoaXMucmVxdWlyZVNlbGVjdGlvbiA9ICEhX2RlZmF1bHRzLnJlcXVpcmVTZWxlY3Rpb247XG4gICAgdGhpcy5faGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvciA9IHRoaXMuX2RlZmF1bHRzLmhpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3IgPz8gZmFsc2U7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxNYXRPcHRpb24+KHRoaXMub3B0aW9ucylcbiAgICAgIC53aXRoV3JhcCgpXG4gICAgICAuc2tpcFByZWRpY2F0ZSh0aGlzLl9za2lwUHJlZGljYXRlKTtcbiAgICB0aGlzLl9hY3RpdmVPcHRpb25DaGFuZ2VzID0gdGhpcy5fa2V5TWFuYWdlci5jaGFuZ2Uuc3Vic2NyaWJlKGluZGV4ID0+IHtcbiAgICAgIGlmICh0aGlzLmlzT3Blbikge1xuICAgICAgICB0aGlzLm9wdGlvbkFjdGl2YXRlZC5lbWl0KHtzb3VyY2U6IHRoaXMsIG9wdGlvbjogdGhpcy5vcHRpb25zLnRvQXJyYXkoKVtpbmRleF0gfHwgbnVsbH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU2V0IHRoZSBpbml0aWFsIHZpc2liaWxpdHkgc3RhdGUuXG4gICAgdGhpcy5fc2V0VmlzaWJpbGl0eSgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlcj8uZGVzdHJveSgpO1xuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbkNoYW5nZXMudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcGFuZWwgc2Nyb2xsVG9wLiBUaGlzIGFsbG93cyB1cyB0byBtYW51YWxseSBzY3JvbGwgdG8gZGlzcGxheSBvcHRpb25zXG4gICAqIGFib3ZlIG9yIGJlbG93IHRoZSBmb2xkLCBhcyB0aGV5IGFyZSBub3QgYWN0dWFsbHkgYmVpbmcgZm9jdXNlZCB3aGVuIGFjdGl2ZS5cbiAgICovXG4gIF9zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgcGFuZWwncyBzY3JvbGxUb3AuICovXG4gIF9nZXRTY3JvbGxUb3AoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wYW5lbCA/IHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgOiAwO1xuICB9XG5cbiAgLyoqIFBhbmVsIHNob3VsZCBoaWRlIGl0c2VsZiB3aGVuIHRoZSBvcHRpb24gbGlzdCBpcyBlbXB0eS4gKi9cbiAgX3NldFZpc2liaWxpdHkoKSB7XG4gICAgdGhpcy5zaG93UGFuZWwgPSAhIXRoaXMub3B0aW9ucy5sZW5ndGg7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogRW1pdHMgdGhlIGBzZWxlY3RgIGV2ZW50LiAqL1xuICBfZW1pdFNlbGVjdEV2ZW50KG9wdGlvbjogTWF0T3B0aW9uKTogdm9pZCB7XG4gICAgY29uc3QgZXZlbnQgPSBuZXcgTWF0QXV0b2NvbXBsZXRlU2VsZWN0ZWRFdmVudCh0aGlzLCBvcHRpb24pO1xuICAgIHRoaXMub3B0aW9uU2VsZWN0ZWQuZW1pdChldmVudCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgYXJpYS1sYWJlbGxlZGJ5IGZvciB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsLiAqL1xuICBfZ2V0UGFuZWxBcmlhTGFiZWxsZWRieShsYWJlbElkOiBzdHJpbmcgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuYXJpYUxhYmVsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBsYWJlbEV4cHJlc3Npb24gPSBsYWJlbElkID8gbGFiZWxJZCArICcgJyA6ICcnO1xuICAgIHJldHVybiB0aGlzLmFyaWFMYWJlbGxlZGJ5ID8gbGFiZWxFeHByZXNzaW9uICsgdGhpcy5hcmlhTGFiZWxsZWRieSA6IGxhYmVsSWQ7XG4gIH1cblxuICAvLyBgc2tpcFByZWRpY2F0ZWAgZGV0ZXJtaW5lcyBpZiBrZXkgbWFuYWdlciBzaG91bGQgYXZvaWQgcHV0dGluZyBhIGdpdmVuIG9wdGlvbiBpbiB0aGUgdGFiXG4gIC8vIG9yZGVyLiBBbGxvdyBkaXNhYmxlZCBsaXN0IGl0ZW1zIHRvIHJlY2VpdmUgZm9jdXMgdmlhIGtleWJvYXJkIHRvIGFsaWduIHdpdGggV0FJIEFSSUFcbiAgLy8gcmVjb21tZW5kYXRpb24uXG4gIC8vXG4gIC8vIE5vcm1hbGx5IFdBSSBBUklBJ3MgaW5zdHJ1Y3Rpb25zIGFyZSB0byBleGNsdWRlIGRpc2FibGVkIGl0ZW1zIGZyb20gdGhlIHRhYiBvcmRlciwgYnV0IGl0XG4gIC8vIG1ha2VzIGEgZmV3IGV4Y2VwdGlvbnMgZm9yIGNvbXBvdW5kIHdpZGdldHMuXG4gIC8vXG4gIC8vIEZyb20gW0RldmVsb3BpbmcgYSBLZXlib2FyZCBJbnRlcmZhY2VdKFxuICAvLyBodHRwczovL3d3dy53My5vcmcvV0FJL0FSSUEvYXBnL3ByYWN0aWNlcy9rZXlib2FyZC1pbnRlcmZhY2UvKTpcbiAgLy8gICBcIkZvciB0aGUgZm9sbG93aW5nIGNvbXBvc2l0ZSB3aWRnZXQgZWxlbWVudHMsIGtlZXAgdGhlbSBmb2N1c2FibGUgd2hlbiBkaXNhYmxlZDogT3B0aW9ucyBpbiBhXG4gIC8vICAgTGlzdGJveC4uLlwiXG4gIC8vXG4gIC8vIFRoZSB1c2VyIGNhbiBmb2N1cyBkaXNhYmxlZCBvcHRpb25zIHVzaW5nIHRoZSBrZXlib2FyZCwgYnV0IHRoZSB1c2VyIGNhbm5vdCBjbGljayBkaXNhYmxlZFxuICAvLyBvcHRpb25zLlxuICBwcm90ZWN0ZWQgX3NraXBQcmVkaWNhdGUoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCI8bmctdGVtcGxhdGUgbGV0LWZvcm1GaWVsZElkPVwiaWRcIj5cbiAgPGRpdlxuICAgIGNsYXNzPVwibWF0LW1kYy1hdXRvY29tcGxldGUtcGFuZWwgbWRjLW1lbnUtc3VyZmFjZSBtZGMtbWVudS1zdXJmYWNlLS1vcGVuXCJcbiAgICByb2xlPVwibGlzdGJveFwiXG4gICAgW2lkXT1cImlkXCJcbiAgICBbY2xhc3NdPVwiX2NsYXNzTGlzdFwiXG4gICAgW2NsYXNzLm1hdC1tZGMtYXV0b2NvbXBsZXRlLXZpc2libGVdPVwic2hvd1BhbmVsXCJcbiAgICBbY2xhc3MubWF0LW1kYy1hdXRvY29tcGxldGUtaGlkZGVuXT1cIiFzaG93UGFuZWxcIlxuICAgIFtjbGFzcy5tYXQtcHJpbWFyeV09XCJfY29sb3IgPT09ICdwcmltYXJ5J1wiXG4gICAgW2NsYXNzLm1hdC1hY2NlbnRdPVwiX2NvbG9yID09PSAnYWNjZW50J1wiXG4gICAgW2NsYXNzLm1hdC13YXJuXT1cIl9jb2xvciA9PT0gJ3dhcm4nXCJcbiAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbCB8fCBudWxsXCJcbiAgICBbYXR0ci5hcmlhLWxhYmVsbGVkYnldPVwiX2dldFBhbmVsQXJpYUxhYmVsbGVkYnkoZm9ybUZpZWxkSWQpXCJcbiAgICBbQHBhbmVsQW5pbWF0aW9uXT1cImlzT3BlbiA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nXCJcbiAgICAoQHBhbmVsQW5pbWF0aW9uLmRvbmUpPVwiX2FuaW1hdGlvbkRvbmUubmV4dCgkZXZlbnQpXCJcbiAgICAjcGFuZWw+XG4gICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICA8L2Rpdj5cbjwvbmctdGVtcGxhdGU+XG4iXX0=