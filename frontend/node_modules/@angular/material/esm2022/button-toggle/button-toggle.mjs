/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, SPACE, ENTER } from '@angular/cdk/keycodes';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Input, Optional, Output, QueryList, ViewChild, ViewEncapsulation, InjectionToken, Inject, booleanAttribute, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRipple, MatPseudoCheckbox } from '@angular/material/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "@angular/cdk/a11y";
/**
 * Injection token that can be used to configure the
 * default options for all button toggles within an app.
 */
export const MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS = new InjectionToken('MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS', {
    providedIn: 'root',
    factory: MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY,
});
export function MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY() {
    return {
        hideSingleSelectionIndicator: false,
        hideMultipleSelectionIndicator: false,
        disabledInteractive: false,
    };
}
/**
 * Injection token that can be used to reference instances of `MatButtonToggleGroup`.
 * It serves as alternative token to the actual `MatButtonToggleGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_BUTTON_TOGGLE_GROUP = new InjectionToken('MatButtonToggleGroup');
/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatButtonToggleGroup),
    multi: true,
};
// Counter used to generate unique IDs.
let uniqueIdCounter = 0;
/** Change event object emitted by button toggle. */
export class MatButtonToggleChange {
    constructor(
    /** The button toggle that emits the event. */
    source, 
    /** The value assigned to the button toggle. */
    value) {
        this.source = source;
        this.value = value;
    }
}
/** Exclusive selection button toggle group that behaves like a radio-button group. */
export class MatButtonToggleGroup {
    /** `name` attribute for the underlying `input` element. */
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
        this._markButtonsForCheck();
    }
    /** Value of the toggle group. */
    get value() {
        const selected = this._selectionModel ? this._selectionModel.selected : [];
        if (this.multiple) {
            return selected.map(toggle => toggle.value);
        }
        return selected[0] ? selected[0].value : undefined;
    }
    set value(newValue) {
        this._setSelectionByValue(newValue);
        this.valueChange.emit(this.value);
    }
    /** Selected button toggles in the group. */
    get selected() {
        const selected = this._selectionModel ? this._selectionModel.selected : [];
        return this.multiple ? selected : selected[0] || null;
    }
    /** Whether multiple button toggles can be selected. */
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._multiple = value;
        this._markButtonsForCheck();
    }
    /** Whether multiple button toggle group is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._markButtonsForCheck();
    }
    /** Whether buttons in the group should be interactive while they're disabled. */
    get disabledInteractive() {
        return this._disabledInteractive;
    }
    set disabledInteractive(value) {
        this._disabledInteractive = value;
        this._markButtonsForCheck();
    }
    /** The layout direction of the toggle button group. */
    get dir() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Whether checkmark indicator for single-selection button toggle groups is hidden. */
    get hideSingleSelectionIndicator() {
        return this._hideSingleSelectionIndicator;
    }
    set hideSingleSelectionIndicator(value) {
        this._hideSingleSelectionIndicator = value;
        this._markButtonsForCheck();
    }
    /** Whether checkmark indicator for multiple-selection button toggle groups is hidden. */
    get hideMultipleSelectionIndicator() {
        return this._hideMultipleSelectionIndicator;
    }
    set hideMultipleSelectionIndicator(value) {
        this._hideMultipleSelectionIndicator = value;
        this._markButtonsForCheck();
    }
    constructor(_changeDetector, defaultOptions, _dir) {
        this._changeDetector = _changeDetector;
        this._dir = _dir;
        this._multiple = false;
        this._disabled = false;
        this._disabledInteractive = false;
        /**
         * The method to be called in order to update ngModel.
         * Now `ngModel` binding is not supported in multiple selection mode.
         */
        this._controlValueAccessorChangeFn = () => { };
        /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
        this._onTouched = () => { };
        this._name = `mat-button-toggle-group-${uniqueIdCounter++}`;
        /**
         * Event that emits whenever the value of the group changes.
         * Used to facilitate two-way data binding.
         * @docs-private
         */
        this.valueChange = new EventEmitter();
        /** Event emitted when the group's value changes. */
        this.change = new EventEmitter();
        this.appearance =
            defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
        this.hideSingleSelectionIndicator = defaultOptions?.hideSingleSelectionIndicator ?? false;
        this.hideMultipleSelectionIndicator = defaultOptions?.hideMultipleSelectionIndicator ?? false;
    }
    ngOnInit() {
        this._selectionModel = new SelectionModel(this.multiple, undefined, false);
    }
    ngAfterContentInit() {
        this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
        if (!this.multiple) {
            this._initializeTabIndex();
        }
    }
    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value Value to be set to the model.
     */
    writeValue(value) {
        this.value = value;
        this._changeDetector.markForCheck();
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
        this._controlValueAccessorChangeFn = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /** Handle keydown event calling to single-select button toggle. */
    _keydown(event) {
        if (this.multiple || this.disabled) {
            return;
        }
        const target = event.target;
        const buttonId = target.id;
        const index = this._buttonToggles.toArray().findIndex(toggle => {
            return toggle.buttonId === buttonId;
        });
        let nextButton = null;
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                nextButton = this._buttonToggles.get(index) || null;
                break;
            case UP_ARROW:
                nextButton = this._getNextButton(index, -1);
                break;
            case LEFT_ARROW:
                nextButton = this._getNextButton(index, this.dir === 'ltr' ? -1 : 1);
                break;
            case DOWN_ARROW:
                nextButton = this._getNextButton(index, 1);
                break;
            case RIGHT_ARROW:
                nextButton = this._getNextButton(index, this.dir === 'ltr' ? 1 : -1);
                break;
            default:
                return;
        }
        if (nextButton) {
            event.preventDefault();
            nextButton._onButtonClick();
            nextButton.focus();
        }
    }
    /** Dispatch change event with current selection and group value. */
    _emitChangeEvent(toggle) {
        const event = new MatButtonToggleChange(toggle, this.value);
        this._rawValue = event.value;
        this._controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }
    /**
     * Syncs a button toggle's selected state with the model value.
     * @param toggle Toggle to be synced.
     * @param select Whether the toggle should be selected.
     * @param isUserInput Whether the change was a result of a user interaction.
     * @param deferEvents Whether to defer emitting the change events.
     */
    _syncButtonToggle(toggle, select, isUserInput = false, deferEvents = false) {
        // Deselect the currently-selected toggle, if we're in single-selection
        // mode and the button being toggled isn't selected at the moment.
        if (!this.multiple && this.selected && !toggle.checked) {
            this.selected.checked = false;
        }
        if (this._selectionModel) {
            if (select) {
                this._selectionModel.select(toggle);
            }
            else {
                this._selectionModel.deselect(toggle);
            }
        }
        else {
            deferEvents = true;
        }
        // We need to defer in some cases in order to avoid "changed after checked errors", however
        // the side-effect is that we may end up updating the model value out of sequence in others
        // The `deferEvents` flag allows us to decide whether to do it on a case-by-case basis.
        if (deferEvents) {
            Promise.resolve().then(() => this._updateModelValue(toggle, isUserInput));
        }
        else {
            this._updateModelValue(toggle, isUserInput);
        }
    }
    /** Checks whether a button toggle is selected. */
    _isSelected(toggle) {
        return this._selectionModel && this._selectionModel.isSelected(toggle);
    }
    /** Determines whether a button toggle should be checked on init. */
    _isPrechecked(toggle) {
        if (typeof this._rawValue === 'undefined') {
            return false;
        }
        if (this.multiple && Array.isArray(this._rawValue)) {
            return this._rawValue.some(value => toggle.value != null && value === toggle.value);
        }
        return toggle.value === this._rawValue;
    }
    /** Initializes the tabindex attribute using the radio pattern. */
    _initializeTabIndex() {
        this._buttonToggles.forEach(toggle => {
            toggle.tabIndex = -1;
        });
        if (this.selected) {
            this.selected.tabIndex = 0;
        }
        else {
            for (let i = 0; i < this._buttonToggles.length; i++) {
                const toggle = this._buttonToggles.get(i);
                if (!toggle.disabled) {
                    toggle.tabIndex = 0;
                    break;
                }
            }
        }
        this._markButtonsForCheck();
    }
    /** Obtain the subsequent toggle to which the focus shifts. */
    _getNextButton(startIndex, offset) {
        const items = this._buttonToggles;
        for (let i = 1; i <= items.length; i++) {
            const index = (startIndex + offset * i + items.length) % items.length;
            const item = items.get(index);
            if (item && !item.disabled) {
                return item;
            }
        }
        return null;
    }
    /** Updates the selection state of the toggles in the group based on a value. */
    _setSelectionByValue(value) {
        this._rawValue = value;
        if (!this._buttonToggles) {
            return;
        }
        if (this.multiple && value) {
            if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Value must be an array in multiple-selection mode.');
            }
            this._clearSelection();
            value.forEach((currentValue) => this._selectValue(currentValue));
        }
        else {
            this._clearSelection();
            this._selectValue(value);
        }
    }
    /** Clears the selected toggles. */
    _clearSelection() {
        this._selectionModel.clear();
        this._buttonToggles.forEach(toggle => {
            toggle.checked = false;
            // If the button toggle is in single select mode, initialize the tabIndex.
            if (!this.multiple) {
                toggle.tabIndex = -1;
            }
        });
    }
    /** Selects a value if there's a toggle that corresponds to it. */
    _selectValue(value) {
        const correspondingOption = this._buttonToggles.find(toggle => {
            return toggle.value != null && toggle.value === value;
        });
        if (correspondingOption) {
            correspondingOption.checked = true;
            this._selectionModel.select(correspondingOption);
            if (!this.multiple) {
                // If the button toggle is in single select mode, reset the tabIndex.
                correspondingOption.tabIndex = 0;
            }
        }
    }
    /** Syncs up the group's value with the model and emits the change event. */
    _updateModelValue(toggle, isUserInput) {
        // Only emit the change event for user input.
        if (isUserInput) {
            this._emitChangeEvent(toggle);
        }
        // Note: we emit this one no matter whether it was a user interaction, because
        // it is used by Angular to sync up the two-way data binding.
        this.valueChange.emit(this.value);
    }
    /** Marks all of the child button toggles to be checked. */
    _markButtonsForCheck() {
        this._buttonToggles?.forEach(toggle => toggle._markForCheck());
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggleGroup, deps: [{ token: i0.ChangeDetectorRef }, { token: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS, optional: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatButtonToggleGroup, isStandalone: true, selector: "mat-button-toggle-group", inputs: { appearance: "appearance", name: "name", vertical: ["vertical", "vertical", booleanAttribute], value: "value", multiple: ["multiple", "multiple", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute], disabledInteractive: ["disabledInteractive", "disabledInteractive", booleanAttribute], hideSingleSelectionIndicator: ["hideSingleSelectionIndicator", "hideSingleSelectionIndicator", booleanAttribute], hideMultipleSelectionIndicator: ["hideMultipleSelectionIndicator", "hideMultipleSelectionIndicator", booleanAttribute] }, outputs: { valueChange: "valueChange", change: "change" }, host: { listeners: { "keydown": "_keydown($event)" }, properties: { "attr.role": "multiple ? 'group' : 'radiogroup'", "attr.aria-disabled": "disabled", "class.mat-button-toggle-vertical": "vertical", "class.mat-button-toggle-group-appearance-standard": "appearance === \"standard\"" }, classAttribute: "mat-button-toggle-group" }, providers: [
            MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
            { provide: MAT_BUTTON_TOGGLE_GROUP, useExisting: MatButtonToggleGroup },
        ], queries: [{ propertyName: "_buttonToggles", predicate: i0.forwardRef(() => MatButtonToggle), descendants: true }], exportAs: ["matButtonToggleGroup"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggleGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-button-toggle-group',
                    providers: [
                        MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
                        { provide: MAT_BUTTON_TOGGLE_GROUP, useExisting: MatButtonToggleGroup },
                    ],
                    host: {
                        'class': 'mat-button-toggle-group',
                        '(keydown)': '_keydown($event)',
                        '[attr.role]': "multiple ? 'group' : 'radiogroup'",
                        '[attr.aria-disabled]': 'disabled',
                        '[class.mat-button-toggle-vertical]': 'vertical',
                        '[class.mat-button-toggle-group-appearance-standard]': 'appearance === "standard"',
                    },
                    exportAs: 'matButtonToggleGroup',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { _buttonToggles: [{
                type: ContentChildren,
                args: [forwardRef(() => MatButtonToggle), {
                        // Note that this would technically pick up toggles
                        // from nested groups, but that's not a case that we support.
                        descendants: true,
                    }]
            }], appearance: [{
                type: Input
            }], name: [{
                type: Input
            }], vertical: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], value: [{
                type: Input
            }], valueChange: [{
                type: Output
            }], multiple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabledInteractive: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], change: [{
                type: Output
            }], hideSingleSelectionIndicator: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hideMultipleSelectionIndicator: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
/** Single button inside of a toggle group. */
export class MatButtonToggle {
    /** Unique ID for the underlying `button` element. */
    get buttonId() {
        return `${this.id}-button`;
    }
    /** Tabindex of the toggle. */
    get tabIndex() {
        return this._tabIndex;
    }
    set tabIndex(value) {
        this._tabIndex = value;
        this._markForCheck();
    }
    /** The appearance style of the button. */
    get appearance() {
        return this.buttonToggleGroup ? this.buttonToggleGroup.appearance : this._appearance;
    }
    set appearance(value) {
        this._appearance = value;
    }
    /** Whether the button is checked. */
    get checked() {
        return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
    }
    set checked(value) {
        if (value !== this._checked) {
            this._checked = value;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked);
            }
            this._changeDetectorRef.markForCheck();
        }
    }
    /** Whether the button is disabled. */
    get disabled() {
        return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
    }
    set disabled(value) {
        this._disabled = value;
    }
    /** Whether the button should remain interactive when it is disabled. */
    get disabledInteractive() {
        return (this._disabledInteractive ||
            (this.buttonToggleGroup !== null && this.buttonToggleGroup.disabledInteractive));
    }
    set disabledInteractive(value) {
        this._disabledInteractive = value;
    }
    constructor(toggleGroup, _changeDetectorRef, _elementRef, _focusMonitor, defaultTabIndex, defaultOptions) {
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._focusMonitor = _focusMonitor;
        this._checked = false;
        /**
         * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
         */
        this.ariaLabelledby = null;
        this._disabled = false;
        /** Event emitted when the group value changes. */
        this.change = new EventEmitter();
        const parsedTabIndex = Number(defaultTabIndex);
        this.tabIndex = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
        this.buttonToggleGroup = toggleGroup;
        this.appearance =
            defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
        this.disabledInteractive = defaultOptions?.disabledInteractive ?? false;
    }
    ngOnInit() {
        const group = this.buttonToggleGroup;
        this.id = this.id || `mat-button-toggle-${uniqueIdCounter++}`;
        if (group) {
            if (group._isPrechecked(this)) {
                this.checked = true;
            }
            else if (group._isSelected(this) !== this._checked) {
                // As side effect of the circular dependency between the toggle group and the button,
                // we may end up in a state where the button is supposed to be checked on init, but it
                // isn't, because the checked value was assigned too early. This can happen when Ivy
                // assigns the static input value before the `ngOnInit` has run.
                group._syncButtonToggle(this, this._checked);
            }
        }
    }
    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true);
    }
    ngOnDestroy() {
        const group = this.buttonToggleGroup;
        this._focusMonitor.stopMonitoring(this._elementRef);
        // Remove the toggle from the selection once it's destroyed. Needs to happen
        // on the next tick in order to avoid "changed after checked" errors.
        if (group && group._isSelected(this)) {
            group._syncButtonToggle(this, false, false, true);
        }
    }
    /** Focuses the button. */
    focus(options) {
        this._buttonElement.nativeElement.focus(options);
    }
    /** Checks the button toggle due to an interaction with the underlying native button. */
    _onButtonClick() {
        if (this.disabled) {
            return;
        }
        const newChecked = this.isSingleSelector() ? true : !this._checked;
        if (newChecked !== this._checked) {
            this._checked = newChecked;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
                this.buttonToggleGroup._onTouched();
            }
        }
        if (this.isSingleSelector()) {
            const focusable = this.buttonToggleGroup._buttonToggles.find(toggle => {
                return toggle.tabIndex === 0;
            });
            // Modify the tabindex attribute of the last focusable button toggle to -1.
            if (focusable) {
                focusable.tabIndex = -1;
            }
            // Modify the tabindex attribute of the presently selected button toggle to 0.
            this.tabIndex = 0;
        }
        // Emit a change event when it's the single selector
        this.change.emit(new MatButtonToggleChange(this, this.value));
    }
    /**
     * Marks the button toggle as needing checking for change detection.
     * This method is exposed because the parent button toggle group will directly
     * update bound properties of the radio button.
     */
    _markForCheck() {
        // When the group value changes, the button will not be notified.
        // Use `markForCheck` to explicit update button toggle's status.
        this._changeDetectorRef.markForCheck();
    }
    /** Gets the name that should be assigned to the inner DOM node. */
    _getButtonName() {
        if (this.isSingleSelector()) {
            return this.buttonToggleGroup.name;
        }
        return this.name || null;
    }
    /** Whether the toggle is in single selection mode. */
    isSingleSelector() {
        return this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggle, deps: [{ token: MAT_BUTTON_TOGGLE_GROUP, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i2.FocusMonitor }, { token: 'tabindex', attribute: true }, { token: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatButtonToggle, isStandalone: true, selector: "mat-button-toggle", inputs: { ariaLabel: ["aria-label", "ariaLabel"], ariaLabelledby: ["aria-labelledby", "ariaLabelledby"], id: "id", name: "name", value: "value", tabIndex: "tabIndex", disableRipple: ["disableRipple", "disableRipple", booleanAttribute], appearance: "appearance", checked: ["checked", "checked", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute], disabledInteractive: ["disabledInteractive", "disabledInteractive", booleanAttribute] }, outputs: { change: "change" }, host: { attributes: { "role": "presentation" }, listeners: { "focus": "focus()" }, properties: { "class.mat-button-toggle-standalone": "!buttonToggleGroup", "class.mat-button-toggle-checked": "checked", "class.mat-button-toggle-disabled": "disabled", "class.mat-button-toggle-disabled-interactive": "disabledInteractive", "class.mat-button-toggle-appearance-standard": "appearance === \"standard\"", "attr.aria-label": "null", "attr.aria-labelledby": "null", "attr.id": "id", "attr.name": "null" }, classAttribute: "mat-button-toggle" }, viewQueries: [{ propertyName: "_buttonElement", first: true, predicate: ["button"], descendants: true }], exportAs: ["matButtonToggle"], ngImport: i0, template: "<button #button class=\"mat-button-toggle-button mat-focus-indicator\"\n        type=\"button\"\n        [id]=\"buttonId\"\n        [attr.role]=\"isSingleSelector() ? 'radio' : 'button'\"\n        [attr.tabindex]=\"disabled && !disabledInteractive ? -1 : tabIndex\"\n        [attr.aria-pressed]=\"!isSingleSelector() ? checked : null\"\n        [attr.aria-checked]=\"isSingleSelector() ? checked : null\"\n        [disabled]=\"(disabled && !disabledInteractive) || null\"\n        [attr.name]=\"_getButtonName()\"\n        [attr.aria-label]=\"ariaLabel\"\n        [attr.aria-labelledby]=\"ariaLabelledby\"\n        [attr.aria-disabled]=\"disabled && disabledInteractive ? 'true' : null\"\n        (click)=\"_onButtonClick()\">\n  <span class=\"mat-button-toggle-label-content\">\n    <!-- Render checkmark at the beginning for single-selection. -->\n    @if (buttonToggleGroup && checked && !buttonToggleGroup.multiple && !buttonToggleGroup.hideSingleSelectionIndicator) {\n      <mat-pseudo-checkbox\n          class=\"mat-mdc-option-pseudo-checkbox\"\n          [disabled]=\"disabled\"\n          state=\"checked\"\n          aria-hidden=\"true\"\n          appearance=\"minimal\"></mat-pseudo-checkbox>\n    }\n    <!-- Render checkmark at the beginning for multiple-selection. -->\n    @if (buttonToggleGroup && checked && buttonToggleGroup.multiple && !buttonToggleGroup.hideMultipleSelectionIndicator) {\n      <mat-pseudo-checkbox\n          class=\"mat-mdc-option-pseudo-checkbox\"\n          [disabled]=\"disabled\"\n          state=\"checked\"\n          aria-hidden=\"true\"\n          appearance=\"minimal\"></mat-pseudo-checkbox>\n    }\n    <ng-content></ng-content>\n  </span>\n</button>\n\n<span class=\"mat-button-toggle-focus-overlay\"></span>\n<span class=\"mat-button-toggle-ripple\" matRipple\n     [matRippleTrigger]=\"button\"\n     [matRippleDisabled]=\"this.disableRipple || this.disabled\">\n</span>\n", styles: [".mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;-webkit-tap-highlight-color:rgba(0,0,0,0);transform:translateZ(0);border-radius:var(--mat-legacy-button-toggle-shape)}.mat-button-toggle-standalone:not([class*=mat-elevation-z]),.mat-button-toggle-group:not([class*=mat-elevation-z]){box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)}.cdk-high-contrast-active .mat-button-toggle-standalone,.cdk-high-contrast-active .mat-button-toggle-group{outline:solid 1px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full));border:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard .mat-pseudo-checkbox,.mat-button-toggle-group-appearance-standard .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-app-on-secondary-container))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard:not([class*=mat-elevation-z]),.mat-button-toggle-group-appearance-standard:not([class*=mat-elevation-z]){box-shadow:none}.cdk-high-contrast-active .mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.cdk-high-contrast-active .mat-button-toggle-group-appearance-standard{outline:0}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative;color:var(--mat-legacy-button-toggle-text-color);font-family:var(--mat-legacy-button-toggle-label-text-font);font-size:var(--mat-legacy-button-toggle-label-text-size);line-height:var(--mat-legacy-button-toggle-label-text-line-height);font-weight:var(--mat-legacy-button-toggle-label-text-weight);letter-spacing:var(--mat-legacy-button-toggle-label-text-tracking);--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-legacy-button-toggle-selected-state-text-color)}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-legacy-button-toggle-focus-state-layer-opacity)}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle .mat-pseudo-checkbox{margin-right:12px}[dir=rtl] .mat-button-toggle .mat-pseudo-checkbox{margin-right:0;margin-left:12px}.mat-button-toggle-checked{color:var(--mat-legacy-button-toggle-selected-state-text-color);background-color:var(--mat-legacy-button-toggle-selected-state-background-color)}.mat-button-toggle-disabled{pointer-events:none;color:var(--mat-legacy-button-toggle-disabled-state-text-color);background-color:var(--mat-legacy-button-toggle-disabled-state-background-color);--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-legacy-button-toggle-disabled-state-text-color)}.mat-button-toggle-disabled.mat-button-toggle-checked{background-color:var(--mat-legacy-button-toggle-disabled-selected-state-background-color)}.mat-button-toggle-disabled-interactive{pointer-events:auto}.mat-button-toggle-appearance-standard{color:var(--mat-standard-button-toggle-text-color, var(--mat-app-on-surface));background-color:var(--mat-standard-button-toggle-background-color);font-family:var(--mat-standard-button-toggle-label-text-font, var(--mat-app-label-large-font));font-size:var(--mat-standard-button-toggle-label-text-size, var(--mat-app-label-large-size));line-height:var(--mat-standard-button-toggle-label-text-line-height, var(--mat-app-label-large-line-height));font-weight:var(--mat-standard-button-toggle-label-text-weight, var(--mat-app-label-large-weight));letter-spacing:var(--mat-standard-button-toggle-label-text-tracking, var(--mat-app-label-large-tracking))}.mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}[dir=rtl] .mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:none;border-top:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}.mat-button-toggle-appearance-standard.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-app-on-secondary-container));background-color:var(--mat-standard-button-toggle-selected-state-background-color, var(--mat-app-secondary-container))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled{color:var(--mat-standard-button-toggle-disabled-state-text-color);background-color:var(--mat-standard-button-toggle-disabled-state-background-color)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-standard-button-toggle-disabled-selected-state-text-color)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-disabled-selected-state-text-color);background-color:var(--mat-standard-button-toggle-disabled-selected-state-background-color)}.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{background-color:var(--mat-standard-button-toggle-state-layer-color, var(--mat-app-on-surface))}.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-hover-state-layer-opacity, var(--mat-app-hover-state-layer-opacity))}.mat-button-toggle-appearance-standard.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-focus-state-layer-opacity, var(--mat-app-focus-state-layer-opacity))}@media(hover: none){.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;user-select:none;display:inline-block;padding:0 16px;line-height:var(--mat-legacy-button-toggle-height);position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px;line-height:var(--mat-standard-button-toggle-height)}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:inherit;pointer-events:none;opacity:0;background-color:var(--mat-legacy-button-toggle-state-layer-color)}.cdk-high-contrast-active .mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 500px;opacity:.5;height:0}.cdk-high-contrast-active .mat-button-toggle-checked:hover .mat-button-toggle-focus-overlay{opacity:.6}.cdk-high-contrast-active .mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard{--mat-focus-indicator-border-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full))}.mat-button-toggle-group-appearance-standard .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full));border-bottom-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full))}.mat-button-toggle-group-appearance-standard .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full));border-bottom-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full))}"], dependencies: [{ kind: "directive", type: MatRipple, selector: "[mat-ripple], [matRipple]", inputs: ["matRippleColor", "matRippleUnbounded", "matRippleCentered", "matRippleRadius", "matRippleAnimation", "matRippleDisabled", "matRippleTrigger"], exportAs: ["matRipple"] }, { kind: "component", type: MatPseudoCheckbox, selector: "mat-pseudo-checkbox", inputs: ["state", "disabled", "appearance"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggle, decorators: [{
            type: Component,
            args: [{ selector: 'mat-button-toggle', encapsulation: ViewEncapsulation.None, exportAs: 'matButtonToggle', changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class.mat-button-toggle-standalone]': '!buttonToggleGroup',
                        '[class.mat-button-toggle-checked]': 'checked',
                        '[class.mat-button-toggle-disabled]': 'disabled',
                        '[class.mat-button-toggle-disabled-interactive]': 'disabledInteractive',
                        '[class.mat-button-toggle-appearance-standard]': 'appearance === "standard"',
                        'class': 'mat-button-toggle',
                        '[attr.aria-label]': 'null',
                        '[attr.aria-labelledby]': 'null',
                        '[attr.id]': 'id',
                        '[attr.name]': 'null',
                        '(focus)': 'focus()',
                        'role': 'presentation',
                    }, standalone: true, imports: [MatRipple, MatPseudoCheckbox], template: "<button #button class=\"mat-button-toggle-button mat-focus-indicator\"\n        type=\"button\"\n        [id]=\"buttonId\"\n        [attr.role]=\"isSingleSelector() ? 'radio' : 'button'\"\n        [attr.tabindex]=\"disabled && !disabledInteractive ? -1 : tabIndex\"\n        [attr.aria-pressed]=\"!isSingleSelector() ? checked : null\"\n        [attr.aria-checked]=\"isSingleSelector() ? checked : null\"\n        [disabled]=\"(disabled && !disabledInteractive) || null\"\n        [attr.name]=\"_getButtonName()\"\n        [attr.aria-label]=\"ariaLabel\"\n        [attr.aria-labelledby]=\"ariaLabelledby\"\n        [attr.aria-disabled]=\"disabled && disabledInteractive ? 'true' : null\"\n        (click)=\"_onButtonClick()\">\n  <span class=\"mat-button-toggle-label-content\">\n    <!-- Render checkmark at the beginning for single-selection. -->\n    @if (buttonToggleGroup && checked && !buttonToggleGroup.multiple && !buttonToggleGroup.hideSingleSelectionIndicator) {\n      <mat-pseudo-checkbox\n          class=\"mat-mdc-option-pseudo-checkbox\"\n          [disabled]=\"disabled\"\n          state=\"checked\"\n          aria-hidden=\"true\"\n          appearance=\"minimal\"></mat-pseudo-checkbox>\n    }\n    <!-- Render checkmark at the beginning for multiple-selection. -->\n    @if (buttonToggleGroup && checked && buttonToggleGroup.multiple && !buttonToggleGroup.hideMultipleSelectionIndicator) {\n      <mat-pseudo-checkbox\n          class=\"mat-mdc-option-pseudo-checkbox\"\n          [disabled]=\"disabled\"\n          state=\"checked\"\n          aria-hidden=\"true\"\n          appearance=\"minimal\"></mat-pseudo-checkbox>\n    }\n    <ng-content></ng-content>\n  </span>\n</button>\n\n<span class=\"mat-button-toggle-focus-overlay\"></span>\n<span class=\"mat-button-toggle-ripple\" matRipple\n     [matRippleTrigger]=\"button\"\n     [matRippleDisabled]=\"this.disableRipple || this.disabled\">\n</span>\n", styles: [".mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;-webkit-tap-highlight-color:rgba(0,0,0,0);transform:translateZ(0);border-radius:var(--mat-legacy-button-toggle-shape)}.mat-button-toggle-standalone:not([class*=mat-elevation-z]),.mat-button-toggle-group:not([class*=mat-elevation-z]){box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)}.cdk-high-contrast-active .mat-button-toggle-standalone,.cdk-high-contrast-active .mat-button-toggle-group{outline:solid 1px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full));border:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard .mat-pseudo-checkbox,.mat-button-toggle-group-appearance-standard .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-app-on-secondary-container))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard:not([class*=mat-elevation-z]),.mat-button-toggle-group-appearance-standard:not([class*=mat-elevation-z]){box-shadow:none}.cdk-high-contrast-active .mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.cdk-high-contrast-active .mat-button-toggle-group-appearance-standard{outline:0}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative;color:var(--mat-legacy-button-toggle-text-color);font-family:var(--mat-legacy-button-toggle-label-text-font);font-size:var(--mat-legacy-button-toggle-label-text-size);line-height:var(--mat-legacy-button-toggle-label-text-line-height);font-weight:var(--mat-legacy-button-toggle-label-text-weight);letter-spacing:var(--mat-legacy-button-toggle-label-text-tracking);--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-legacy-button-toggle-selected-state-text-color)}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-legacy-button-toggle-focus-state-layer-opacity)}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle .mat-pseudo-checkbox{margin-right:12px}[dir=rtl] .mat-button-toggle .mat-pseudo-checkbox{margin-right:0;margin-left:12px}.mat-button-toggle-checked{color:var(--mat-legacy-button-toggle-selected-state-text-color);background-color:var(--mat-legacy-button-toggle-selected-state-background-color)}.mat-button-toggle-disabled{pointer-events:none;color:var(--mat-legacy-button-toggle-disabled-state-text-color);background-color:var(--mat-legacy-button-toggle-disabled-state-background-color);--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-legacy-button-toggle-disabled-state-text-color)}.mat-button-toggle-disabled.mat-button-toggle-checked{background-color:var(--mat-legacy-button-toggle-disabled-selected-state-background-color)}.mat-button-toggle-disabled-interactive{pointer-events:auto}.mat-button-toggle-appearance-standard{color:var(--mat-standard-button-toggle-text-color, var(--mat-app-on-surface));background-color:var(--mat-standard-button-toggle-background-color);font-family:var(--mat-standard-button-toggle-label-text-font, var(--mat-app-label-large-font));font-size:var(--mat-standard-button-toggle-label-text-size, var(--mat-app-label-large-size));line-height:var(--mat-standard-button-toggle-label-text-line-height, var(--mat-app-label-large-line-height));font-weight:var(--mat-standard-button-toggle-label-text-weight, var(--mat-app-label-large-weight));letter-spacing:var(--mat-standard-button-toggle-label-text-tracking, var(--mat-app-label-large-tracking))}.mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}[dir=rtl] .mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:none;border-top:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-app-outline))}.mat-button-toggle-appearance-standard.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-app-on-secondary-container));background-color:var(--mat-standard-button-toggle-selected-state-background-color, var(--mat-app-secondary-container))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled{color:var(--mat-standard-button-toggle-disabled-state-text-color);background-color:var(--mat-standard-button-toggle-disabled-state-background-color)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-standard-button-toggle-disabled-selected-state-text-color)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-disabled-selected-state-text-color);background-color:var(--mat-standard-button-toggle-disabled-selected-state-background-color)}.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{background-color:var(--mat-standard-button-toggle-state-layer-color, var(--mat-app-on-surface))}.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-hover-state-layer-opacity, var(--mat-app-hover-state-layer-opacity))}.mat-button-toggle-appearance-standard.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-focus-state-layer-opacity, var(--mat-app-focus-state-layer-opacity))}@media(hover: none){.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;user-select:none;display:inline-block;padding:0 16px;line-height:var(--mat-legacy-button-toggle-height);position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px;line-height:var(--mat-standard-button-toggle-height)}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:inherit;pointer-events:none;opacity:0;background-color:var(--mat-legacy-button-toggle-state-layer-color)}.cdk-high-contrast-active .mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 500px;opacity:.5;height:0}.cdk-high-contrast-active .mat-button-toggle-checked:hover .mat-button-toggle-focus-overlay{opacity:.6}.cdk-high-contrast-active .mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard{--mat-focus-indicator-border-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full))}.mat-button-toggle-group-appearance-standard .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full));border-bottom-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full))}.mat-button-toggle-group-appearance-standard .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full));border-bottom-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-app-corner-full))}"] }]
        }], ctorParameters: () => [{ type: MatButtonToggleGroup, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_BUTTON_TOGGLE_GROUP]
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i2.FocusMonitor }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['tabindex']
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS]
                }] }], propDecorators: { ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], ariaLabelledby: [{
                type: Input,
                args: ['aria-labelledby']
            }], _buttonElement: [{
                type: ViewChild,
                args: ['button']
            }], id: [{
                type: Input
            }], name: [{
                type: Input
            }], value: [{
                type: Input
            }], tabIndex: [{
                type: Input
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], appearance: [{
                type: Input
            }], checked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabledInteractive: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXRvZ2dsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9idXR0b24tdG9nZ2xlL2J1dHRvbi10b2dnbGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYnV0dG9uLXRvZ2dsZS9idXR0b24tdG9nZ2xlLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRyxPQUFPLEVBRUwsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsS0FBSyxFQUdMLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsY0FBYyxFQUNkLE1BQU0sRUFFTixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7Ozs7QUE2QnBFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlDQUFpQyxHQUFHLElBQUksY0FBYyxDQUNqRSxtQ0FBbUMsRUFDbkM7SUFDRSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsK0NBQStD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QkFDNUIsbUJBQW1CLEVBQUUsTUFBTTt3QkFDM0Isd0JBQXdCLEVBQUUsTUFBTTt3QkFDaEMsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLGFBQWEsRUFBRSxNQUFNO3dCQUNyQixTQUFTLEVBQUUsU0FBUzt3QkFDcEIsTUFBTSxFQUFFLGNBQWM7cUJBQ3ZCLGNBQ1csSUFBSSxXQUNQLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDOzswQkF5R3BDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsdUJBQXVCOzswQkFJMUMsU0FBUzsyQkFBQyxVQUFVOzswQkFDcEIsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxpQ0FBaUM7eUNBdEd0QixTQUFTO3NCQUE3QixLQUFLO3VCQUFDLFlBQVk7Z0JBS08sY0FBYztzQkFBdkMsS0FBSzt1QkFBQyxpQkFBaUI7Z0JBR0gsY0FBYztzQkFBbEMsU0FBUzt1QkFBQyxRQUFRO2dCQVdWLEVBQUU7c0JBQVYsS0FBSztnQkFHRyxJQUFJO3NCQUFaLEtBQUs7Z0JBR0csS0FBSztzQkFBYixLQUFLO2dCQUlGLFFBQVE7c0JBRFgsS0FBSztnQkFXZ0MsYUFBYTtzQkFBbEQsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFJaEMsVUFBVTtzQkFEYixLQUFLO2dCQVdGLE9BQU87c0JBRFYsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFrQmhDLFFBQVE7c0JBRFgsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFXaEMsbUJBQW1CO3NCQUR0QixLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQWFqQixNQUFNO3NCQUF4QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9jdXNNb25pdG9yfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1NlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtET1dOX0FSUk9XLCBMRUZUX0FSUk9XLCBSSUdIVF9BUlJPVywgVVBfQVJST1csIFNQQUNFLCBFTlRFUn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0LFxuICBBZnRlclZpZXdJbml0LFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7TWF0UmlwcGxlLCBNYXRQc2V1ZG9DaGVja2JveH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIHVzZWQuXG4gKiBAYnJlYWtpbmctY2hhbmdlIDExLjAuMFxuICovXG5leHBvcnQgdHlwZSBUb2dnbGVUeXBlID0gJ2NoZWNrYm94JyB8ICdyYWRpbyc7XG5cbi8qKiBQb3NzaWJsZSBhcHBlYXJhbmNlIHN0eWxlcyBmb3IgdGhlIGJ1dHRvbiB0b2dnbGUuICovXG5leHBvcnQgdHlwZSBNYXRCdXR0b25Ub2dnbGVBcHBlYXJhbmNlID0gJ2xlZ2FjeScgfCAnc3RhbmRhcmQnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGJ1dHRvbiB0b2dnbGUgdGhhdCBjYW4gYmUgY29uZmlndXJlZFxuICogdXNpbmcgdGhlIGBNQVRfQlVUVE9OX1RPR0dMRV9ERUZBVUxUX09QVElPTlNgIGluamVjdGlvbiB0b2tlbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRCdXR0b25Ub2dnbGVEZWZhdWx0T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IGFwcGVhcmFuY2UgdG8gYmUgdXNlZCBieSBidXR0b24gdG9nZ2xlcy4gQ2FuIGJlIG92ZXJyaWRkZW4gYnkgZXhwbGljaXRseVxuICAgKiBzZXR0aW5nIGFuIGFwcGVhcmFuY2Ugb24gYSBidXR0b24gdG9nZ2xlIG9yIGdyb3VwLlxuICAgKi9cbiAgYXBwZWFyYW5jZT86IE1hdEJ1dHRvblRvZ2dsZUFwcGVhcmFuY2U7XG4gIC8qKiBXaGV0aGVyIGljb24gaW5kaWNhdG9ycyBzaG91bGQgYmUgaGlkZGVuIGZvciBzaW5nbGUtc2VsZWN0aW9uIGJ1dHRvbiB0b2dnbGUgZ3JvdXBzLiAqL1xuICBoaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgaWNvbiBpbmRpY2F0b3JzIHNob3VsZCBiZSBoaWRkZW4gZm9yIG11bHRpcGxlLXNlbGVjdGlvbiBidXR0b24gdG9nZ2xlIGdyb3Vwcy4gKi9cbiAgaGlkZU11bHRpcGxlU2VsZWN0aW9uSW5kaWNhdG9yPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgZGlzYWJsZWQgdG9nZ2xlIGJ1dHRvbnMgc2hvdWxkIGJlIGludGVyYWN0aXZlLiAqL1xuICBkaXNhYmxlZEludGVyYWN0aXZlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlXG4gKiBkZWZhdWx0IG9wdGlvbnMgZm9yIGFsbCBidXR0b24gdG9nZ2xlcyB3aXRoaW4gYW4gYXBwLlxuICovXG5leHBvcnQgY29uc3QgTUFUX0JVVFRPTl9UT0dHTEVfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPE1hdEJ1dHRvblRvZ2dsZURlZmF1bHRPcHRpb25zPihcbiAgJ01BVF9CVVRUT05fVE9HR0xFX0RFRkFVTFRfT1BUSU9OUycsXG4gIHtcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogTUFUX0JVVFRPTl9UT0dHTEVfR1JPVVBfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlksXG4gIH0sXG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gTUFUX0JVVFRPTl9UT0dHTEVfR1JPVVBfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogTWF0QnV0dG9uVG9nZ2xlRGVmYXVsdE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIGhpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3I6IGZhbHNlLFxuICAgIGhpZGVNdWx0aXBsZVNlbGVjdGlvbkluZGljYXRvcjogZmFsc2UsXG4gICAgZGlzYWJsZWRJbnRlcmFjdGl2ZTogZmFsc2UsXG4gIH07XG59XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgTWF0QnV0dG9uVG9nZ2xlR3JvdXBgLlxuICogSXQgc2VydmVzIGFzIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYE1hdEJ1dHRvblRvZ2dsZUdyb3VwYCBjbGFzcyB3aGljaFxuICogY291bGQgY2F1c2UgdW5uZWNlc3NhcnkgcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGNvbXBvbmVudCBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9CVVRUT05fVE9HR0xFX0dST1VQID0gbmV3IEluamVjdGlvblRva2VuPE1hdEJ1dHRvblRvZ2dsZUdyb3VwPihcbiAgJ01hdEJ1dHRvblRvZ2dsZUdyb3VwJyxcbik7XG5cbi8qKlxuICogUHJvdmlkZXIgRXhwcmVzc2lvbiB0aGF0IGFsbG93cyBtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCB0byByZWdpc3RlciBhcyBhIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICogVGhpcyBhbGxvd3MgaXQgdG8gc3VwcG9ydCBbKG5nTW9kZWwpXS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9CVVRUT05fVE9HR0xFX0dST1VQX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRCdXR0b25Ub2dnbGVHcm91cCksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuLy8gQ291bnRlciB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMuXG5sZXQgdW5pcXVlSWRDb3VudGVyID0gMDtcblxuLyoqIENoYW5nZSBldmVudCBvYmplY3QgZW1pdHRlZCBieSBidXR0b24gdG9nZ2xlLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEJ1dHRvblRvZ2dsZUNoYW5nZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgYnV0dG9uIHRvZ2dsZSB0aGF0IGVtaXRzIHRoZSBldmVudC4gKi9cbiAgICBwdWJsaWMgc291cmNlOiBNYXRCdXR0b25Ub2dnbGUsXG5cbiAgICAvKiogVGhlIHZhbHVlIGFzc2lnbmVkIHRvIHRoZSBidXR0b24gdG9nZ2xlLiAqL1xuICAgIHB1YmxpYyB2YWx1ZTogYW55LFxuICApIHt9XG59XG5cbi8qKiBFeGNsdXNpdmUgc2VsZWN0aW9uIGJ1dHRvbiB0b2dnbGUgZ3JvdXAgdGhhdCBiZWhhdmVzIGxpa2UgYSByYWRpby1idXR0b24gZ3JvdXAuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCcsXG4gIHByb3ZpZGVyczogW1xuICAgIE1BVF9CVVRUT05fVE9HR0xFX0dST1VQX1ZBTFVFX0FDQ0VTU09SLFxuICAgIHtwcm92aWRlOiBNQVRfQlVUVE9OX1RPR0dMRV9HUk9VUCwgdXNlRXhpc3Rpbmc6IE1hdEJ1dHRvblRvZ2dsZUdyb3VwfSxcbiAgXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCcsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnW2F0dHIucm9sZV0nOiBcIm11bHRpcGxlID8gJ2dyb3VwJyA6ICdyYWRpb2dyb3VwJ1wiLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5tYXQtYnV0dG9uLXRvZ2dsZS12ZXJ0aWNhbF0nOiAndmVydGljYWwnLFxuICAgICdbY2xhc3MubWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXAtYXBwZWFyYW5jZS1zdGFuZGFyZF0nOiAnYXBwZWFyYW5jZSA9PT0gXCJzdGFuZGFyZFwiJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdtYXRCdXR0b25Ub2dnbGVHcm91cCcsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEJ1dHRvblRvZ2dsZUdyb3VwIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCwgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIHByaXZhdGUgX211bHRpcGxlID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rpc2FibGVkSW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfc2VsZWN0aW9uTW9kZWw6IFNlbGVjdGlvbk1vZGVsPE1hdEJ1dHRvblRvZ2dsZT47XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgcmF3IHZhbHVlIHRoYXQgdGhlIGNvbnN1bWVyIHRyaWVkIHRvIGFzc2lnbi4gVGhlIHJlYWxcbiAgICogdmFsdWUgd2lsbCBleGNsdWRlIGFueSB2YWx1ZXMgZnJvbSB0aGlzIG9uZSB0aGF0IGRvbid0IGNvcnJlc3BvbmQgdG8gYVxuICAgKiB0b2dnbGUuIFVzZWZ1bCBmb3IgdGhlIGNhc2VzIHdoZXJlIHRoZSB2YWx1ZSBpcyBhc3NpZ25lZCBiZWZvcmUgdGhlIHRvZ2dsZXNcbiAgICogaGF2ZSBiZWVuIGluaXRpYWxpemVkIG9yIGF0IHRoZSBzYW1lIHRoYXQgdGhleSdyZSBiZWluZyBzd2FwcGVkIG91dC5cbiAgICovXG4gIHByaXZhdGUgX3Jhd1ZhbHVlOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgdG8gYmUgY2FsbGVkIGluIG9yZGVyIHRvIHVwZGF0ZSBuZ01vZGVsLlxuICAgKiBOb3cgYG5nTW9kZWxgIGJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBtdWx0aXBsZSBzZWxlY3Rpb24gbW9kZS5cbiAgICovXG4gIF9jb250cm9sVmFsdWVBY2Nlc3NvckNoYW5nZUZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBvblRvdWNoIGZ1bmN0aW9uIHJlZ2lzdGVyZWQgdmlhIHJlZ2lzdGVyT25Ub3VjaCAoQ29udHJvbFZhbHVlQWNjZXNzb3IpLiAqL1xuICBfb25Ub3VjaGVkOiAoKSA9PiBhbnkgPSAoKSA9PiB7fTtcblxuICAvKiogQ2hpbGQgYnV0dG9uIHRvZ2dsZSBidXR0b25zLiAqL1xuICBAQ29udGVudENoaWxkcmVuKGZvcndhcmRSZWYoKCkgPT4gTWF0QnV0dG9uVG9nZ2xlKSwge1xuICAgIC8vIE5vdGUgdGhhdCB0aGlzIHdvdWxkIHRlY2huaWNhbGx5IHBpY2sgdXAgdG9nZ2xlc1xuICAgIC8vIGZyb20gbmVzdGVkIGdyb3VwcywgYnV0IHRoYXQncyBub3QgYSBjYXNlIHRoYXQgd2Ugc3VwcG9ydC5cbiAgICBkZXNjZW5kYW50czogdHJ1ZSxcbiAgfSlcbiAgX2J1dHRvblRvZ2dsZXM6IFF1ZXJ5TGlzdDxNYXRCdXR0b25Ub2dnbGU+O1xuXG4gIC8qKiBUaGUgYXBwZWFyYW5jZSBmb3IgYWxsIHRoZSBidXR0b25zIGluIHRoZSBncm91cC4gKi9cbiAgQElucHV0KCkgYXBwZWFyYW5jZTogTWF0QnV0dG9uVG9nZ2xlQXBwZWFyYW5jZTtcblxuICAvKiogYG5hbWVgIGF0dHJpYnV0ZSBmb3IgdGhlIHVuZGVybHlpbmcgYGlucHV0YCBlbGVtZW50LiAqL1xuICBASW5wdXQoKVxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHNldCBuYW1lKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9uYW1lID0gdmFsdWU7XG4gICAgdGhpcy5fbWFya0J1dHRvbnNGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX25hbWUgPSBgbWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXAtJHt1bmlxdWVJZENvdW50ZXIrK31gO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0b2dnbGUgZ3JvdXAgaXMgdmVydGljYWwuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgdmVydGljYWw6IGJvb2xlYW47XG5cbiAgLyoqIFZhbHVlIG9mIHRoZSB0b2dnbGUgZ3JvdXAuICovXG4gIEBJbnB1dCgpXG4gIGdldCB2YWx1ZSgpOiBhbnkge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5fc2VsZWN0aW9uTW9kZWwgPyB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZCA6IFtdO1xuXG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiBzZWxlY3RlZC5tYXAodG9nZ2xlID0+IHRvZ2dsZS52YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGVkWzBdID8gc2VsZWN0ZWRbMF0udmFsdWUgOiB1bmRlZmluZWQ7XG4gIH1cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9zZXRTZWxlY3Rpb25CeVZhbHVlKG5ld1ZhbHVlKTtcbiAgICB0aGlzLnZhbHVlQ2hhbmdlLmVtaXQodGhpcy52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgdmFsdWUgb2YgdGhlIGdyb3VwIGNoYW5nZXMuXG4gICAqIFVzZWQgdG8gZmFjaWxpdGF0ZSB0d28td2F5IGRhdGEgYmluZGluZy5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZhbHVlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgLyoqIFNlbGVjdGVkIGJ1dHRvbiB0b2dnbGVzIGluIHRoZSBncm91cC4gKi9cbiAgZ2V0IHNlbGVjdGVkKCk6IE1hdEJ1dHRvblRvZ2dsZSB8IE1hdEJ1dHRvblRvZ2dsZVtdIHtcbiAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuX3NlbGVjdGlvbk1vZGVsID8gdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQgOiBbXTtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBsZSA/IHNlbGVjdGVkIDogc2VsZWN0ZWRbMF0gfHwgbnVsbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIG11bHRpcGxlIGJ1dHRvbiB0b2dnbGVzIGNhbiBiZSBzZWxlY3RlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgbXVsdGlwbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX211bHRpcGxlO1xuICB9XG4gIHNldCBtdWx0aXBsZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX211bHRpcGxlID0gdmFsdWU7XG4gICAgdGhpcy5fbWFya0J1dHRvbnNGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgbXVsdGlwbGUgYnV0dG9uIHRvZ2dsZSBncm91cCBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgdGhpcy5fbWFya0J1dHRvbnNGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgYnV0dG9ucyBpbiB0aGUgZ3JvdXAgc2hvdWxkIGJlIGludGVyYWN0aXZlIHdoaWxlIHRoZXkncmUgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkSW50ZXJhY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkSW50ZXJhY3RpdmU7XG4gIH1cbiAgc2V0IGRpc2FibGVkSW50ZXJhY3RpdmUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZEludGVyYWN0aXZlID0gdmFsdWU7XG4gICAgdGhpcy5fbWFya0J1dHRvbnNGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIFRoZSBsYXlvdXQgZGlyZWN0aW9uIG9mIHRoZSB0b2dnbGUgYnV0dG9uIGdyb3VwLiAqL1xuICBnZXQgZGlyKCk6IERpcmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpciAmJiB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnID8gJ3J0bCcgOiAnbHRyJztcbiAgfVxuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIGdyb3VwJ3MgdmFsdWUgY2hhbmdlcy4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNoYW5nZTogRXZlbnRFbWl0dGVyPE1hdEJ1dHRvblRvZ2dsZUNoYW5nZT4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8TWF0QnV0dG9uVG9nZ2xlQ2hhbmdlPigpO1xuXG4gIC8qKiBXaGV0aGVyIGNoZWNrbWFyayBpbmRpY2F0b3IgZm9yIHNpbmdsZS1zZWxlY3Rpb24gYnV0dG9uIHRvZ2dsZSBncm91cHMgaXMgaGlkZGVuLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBoaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yO1xuICB9XG4gIHNldCBoaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5faGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvciA9IHZhbHVlO1xuICAgIHRoaXMuX21hcmtCdXR0b25zRm9yQ2hlY2soKTtcbiAgfVxuICBwcml2YXRlIF9oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIGNoZWNrbWFyayBpbmRpY2F0b3IgZm9yIG11bHRpcGxlLXNlbGVjdGlvbiBidXR0b24gdG9nZ2xlIGdyb3VwcyBpcyBoaWRkZW4uICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGhpZGVNdWx0aXBsZVNlbGVjdGlvbkluZGljYXRvcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGlkZU11bHRpcGxlU2VsZWN0aW9uSW5kaWNhdG9yO1xuICB9XG4gIHNldCBoaWRlTXVsdGlwbGVTZWxlY3Rpb25JbmRpY2F0b3IodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9oaWRlTXVsdGlwbGVTZWxlY3Rpb25JbmRpY2F0b3IgPSB2YWx1ZTtcbiAgICB0aGlzLl9tYXJrQnV0dG9uc0ZvckNoZWNrKCk7XG4gIH1cbiAgcHJpdmF0ZSBfaGlkZU11bHRpcGxlU2VsZWN0aW9uSW5kaWNhdG9yOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoTUFUX0JVVFRPTl9UT0dHTEVfREVGQVVMVF9PUFRJT05TKVxuICAgIGRlZmF1bHRPcHRpb25zPzogTWF0QnV0dG9uVG9nZ2xlRGVmYXVsdE9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICkge1xuICAgIHRoaXMuYXBwZWFyYW5jZSA9XG4gICAgICBkZWZhdWx0T3B0aW9ucyAmJiBkZWZhdWx0T3B0aW9ucy5hcHBlYXJhbmNlID8gZGVmYXVsdE9wdGlvbnMuYXBwZWFyYW5jZSA6ICdzdGFuZGFyZCc7XG4gICAgdGhpcy5oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yID0gZGVmYXVsdE9wdGlvbnM/LmhpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3IgPz8gZmFsc2U7XG4gICAgdGhpcy5oaWRlTXVsdGlwbGVTZWxlY3Rpb25JbmRpY2F0b3IgPSBkZWZhdWx0T3B0aW9ucz8uaGlkZU11bHRpcGxlU2VsZWN0aW9uSW5kaWNhdG9yID8/IGZhbHNlO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwgPSBuZXcgU2VsZWN0aW9uTW9kZWw8TWF0QnV0dG9uVG9nZ2xlPih0aGlzLm11bHRpcGxlLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoLi4udGhpcy5fYnV0dG9uVG9nZ2xlcy5maWx0ZXIodG9nZ2xlID0+IHRvZ2dsZS5jaGVja2VkKSk7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICB0aGlzLl9pbml0aWFsaXplVGFiSW5kZXgoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbW9kZWwgdmFsdWUuIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBiZSBzZXQgdG8gdGhlIG1vZGVsLlxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvckNoYW5nZUZuID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KSB7XG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBIYW5kbGUga2V5ZG93biBldmVudCBjYWxsaW5nIHRvIHNpbmdsZS1zZWxlY3QgYnV0dG9uIHRvZ2dsZS4gKi9cbiAgcHJvdGVjdGVkIF9rZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMubXVsdGlwbGUgfHwgdGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBjb25zdCBidXR0b25JZCA9IHRhcmdldC5pZDtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2J1dHRvblRvZ2dsZXMudG9BcnJheSgpLmZpbmRJbmRleCh0b2dnbGUgPT4ge1xuICAgICAgcmV0dXJuIHRvZ2dsZS5idXR0b25JZCA9PT0gYnV0dG9uSWQ7XG4gICAgfSk7XG5cbiAgICBsZXQgbmV4dEJ1dHRvbjogTWF0QnV0dG9uVG9nZ2xlIHwgbnVsbCA9IG51bGw7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgICAgbmV4dEJ1dHRvbiA9IHRoaXMuX2J1dHRvblRvZ2dsZXMuZ2V0KGluZGV4KSB8fCBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICAgIG5leHRCdXR0b24gPSB0aGlzLl9nZXROZXh0QnV0dG9uKGluZGV4LCAtMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBuZXh0QnV0dG9uID0gdGhpcy5fZ2V0TmV4dEJ1dHRvbihpbmRleCwgdGhpcy5kaXIgPT09ICdsdHInID8gLTEgOiAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIG5leHRCdXR0b24gPSB0aGlzLl9nZXROZXh0QnV0dG9uKGluZGV4LCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBuZXh0QnV0dG9uID0gdGhpcy5fZ2V0TmV4dEJ1dHRvbihpbmRleCwgdGhpcy5kaXIgPT09ICdsdHInID8gMSA6IC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5leHRCdXR0b24pIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBuZXh0QnV0dG9uLl9vbkJ1dHRvbkNsaWNrKCk7XG4gICAgICBuZXh0QnV0dG9uLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERpc3BhdGNoIGNoYW5nZSBldmVudCB3aXRoIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCBncm91cCB2YWx1ZS4gKi9cbiAgX2VtaXRDaGFuZ2VFdmVudCh0b2dnbGU6IE1hdEJ1dHRvblRvZ2dsZSk6IHZvaWQge1xuICAgIGNvbnN0IGV2ZW50ID0gbmV3IE1hdEJ1dHRvblRvZ2dsZUNoYW5nZSh0b2dnbGUsIHRoaXMudmFsdWUpO1xuICAgIHRoaXMuX3Jhd1ZhbHVlID0gZXZlbnQudmFsdWU7XG4gICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JDaGFuZ2VGbihldmVudC52YWx1ZSk7XG4gICAgdGhpcy5jaGFuZ2UuZW1pdChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogU3luY3MgYSBidXR0b24gdG9nZ2xlJ3Mgc2VsZWN0ZWQgc3RhdGUgd2l0aCB0aGUgbW9kZWwgdmFsdWUuXG4gICAqIEBwYXJhbSB0b2dnbGUgVG9nZ2xlIHRvIGJlIHN5bmNlZC5cbiAgICogQHBhcmFtIHNlbGVjdCBXaGV0aGVyIHRoZSB0b2dnbGUgc2hvdWxkIGJlIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gaXNVc2VySW5wdXQgV2hldGhlciB0aGUgY2hhbmdlIHdhcyBhIHJlc3VsdCBvZiBhIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAqIEBwYXJhbSBkZWZlckV2ZW50cyBXaGV0aGVyIHRvIGRlZmVyIGVtaXR0aW5nIHRoZSBjaGFuZ2UgZXZlbnRzLlxuICAgKi9cbiAgX3N5bmNCdXR0b25Ub2dnbGUoXG4gICAgdG9nZ2xlOiBNYXRCdXR0b25Ub2dnbGUsXG4gICAgc2VsZWN0OiBib29sZWFuLFxuICAgIGlzVXNlcklucHV0ID0gZmFsc2UsXG4gICAgZGVmZXJFdmVudHMgPSBmYWxzZSxcbiAgKSB7XG4gICAgLy8gRGVzZWxlY3QgdGhlIGN1cnJlbnRseS1zZWxlY3RlZCB0b2dnbGUsIGlmIHdlJ3JlIGluIHNpbmdsZS1zZWxlY3Rpb25cbiAgICAvLyBtb2RlIGFuZCB0aGUgYnV0dG9uIGJlaW5nIHRvZ2dsZWQgaXNuJ3Qgc2VsZWN0ZWQgYXQgdGhlIG1vbWVudC5cbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgdGhpcy5zZWxlY3RlZCAmJiAhdG9nZ2xlLmNoZWNrZWQpIHtcbiAgICAgICh0aGlzLnNlbGVjdGVkIGFzIE1hdEJ1dHRvblRvZ2dsZSkuY2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zZWxlY3Rpb25Nb2RlbCkge1xuICAgICAgaWYgKHNlbGVjdCkge1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3QodG9nZ2xlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsLmRlc2VsZWN0KHRvZ2dsZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmVyRXZlbnRzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIGRlZmVyIGluIHNvbWUgY2FzZXMgaW4gb3JkZXIgdG8gYXZvaWQgXCJjaGFuZ2VkIGFmdGVyIGNoZWNrZWQgZXJyb3JzXCIsIGhvd2V2ZXJcbiAgICAvLyB0aGUgc2lkZS1lZmZlY3QgaXMgdGhhdCB3ZSBtYXkgZW5kIHVwIHVwZGF0aW5nIHRoZSBtb2RlbCB2YWx1ZSBvdXQgb2Ygc2VxdWVuY2UgaW4gb3RoZXJzXG4gICAgLy8gVGhlIGBkZWZlckV2ZW50c2AgZmxhZyBhbGxvd3MgdXMgdG8gZGVjaWRlIHdoZXRoZXIgdG8gZG8gaXQgb24gYSBjYXNlLWJ5LWNhc2UgYmFzaXMuXG4gICAgaWYgKGRlZmVyRXZlbnRzKSB7XG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuX3VwZGF0ZU1vZGVsVmFsdWUodG9nZ2xlLCBpc1VzZXJJbnB1dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl91cGRhdGVNb2RlbFZhbHVlKHRvZ2dsZSwgaXNVc2VySW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGJ1dHRvbiB0b2dnbGUgaXMgc2VsZWN0ZWQuICovXG4gIF9pc1NlbGVjdGVkKHRvZ2dsZTogTWF0QnV0dG9uVG9nZ2xlKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvbk1vZGVsICYmIHRoaXMuX3NlbGVjdGlvbk1vZGVsLmlzU2VsZWN0ZWQodG9nZ2xlKTtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBidXR0b24gdG9nZ2xlIHNob3VsZCBiZSBjaGVja2VkIG9uIGluaXQuICovXG4gIF9pc1ByZWNoZWNrZWQodG9nZ2xlOiBNYXRCdXR0b25Ub2dnbGUpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3Jhd1ZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm11bHRpcGxlICYmIEFycmF5LmlzQXJyYXkodGhpcy5fcmF3VmFsdWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmF3VmFsdWUuc29tZSh2YWx1ZSA9PiB0b2dnbGUudmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA9PT0gdG9nZ2xlLnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9nZ2xlLnZhbHVlID09PSB0aGlzLl9yYXdWYWx1ZTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplcyB0aGUgdGFiaW5kZXggYXR0cmlidXRlIHVzaW5nIHRoZSByYWRpbyBwYXR0ZXJuLiAqL1xuICBwcml2YXRlIF9pbml0aWFsaXplVGFiSW5kZXgoKSB7XG4gICAgdGhpcy5fYnV0dG9uVG9nZ2xlcy5mb3JFYWNoKHRvZ2dsZSA9PiB7XG4gICAgICB0b2dnbGUudGFiSW5kZXggPSAtMTtcbiAgICB9KTtcbiAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgKHRoaXMuc2VsZWN0ZWQgYXMgTWF0QnV0dG9uVG9nZ2xlKS50YWJJbmRleCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYnV0dG9uVG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0b2dnbGUgPSB0aGlzLl9idXR0b25Ub2dnbGVzLmdldChpKSE7XG5cbiAgICAgICAgaWYgKCF0b2dnbGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICB0b2dnbGUudGFiSW5kZXggPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX21hcmtCdXR0b25zRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBPYnRhaW4gdGhlIHN1YnNlcXVlbnQgdG9nZ2xlIHRvIHdoaWNoIHRoZSBmb2N1cyBzaGlmdHMuICovXG4gIHByaXZhdGUgX2dldE5leHRCdXR0b24oc3RhcnRJbmRleDogbnVtYmVyLCBvZmZzZXQ6IG51bWJlcik6IE1hdEJ1dHRvblRvZ2dsZSB8IG51bGwge1xuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fYnV0dG9uVG9nZ2xlcztcblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpbmRleCA9IChzdGFydEluZGV4ICsgb2Zmc2V0ICogaSArIGl0ZW1zLmxlbmd0aCkgJSBpdGVtcy5sZW5ndGg7XG4gICAgICBjb25zdCBpdGVtID0gaXRlbXMuZ2V0KGluZGV4KTtcblxuICAgICAgaWYgKGl0ZW0gJiYgIWl0ZW0uZGlzYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgc2VsZWN0aW9uIHN0YXRlIG9mIHRoZSB0b2dnbGVzIGluIHRoZSBncm91cCBiYXNlZCBvbiBhIHZhbHVlLiAqL1xuICBwcml2YXRlIF9zZXRTZWxlY3Rpb25CeVZhbHVlKHZhbHVlOiBhbnkgfCBhbnlbXSkge1xuICAgIHRoaXMuX3Jhd1ZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAoIXRoaXMuX2J1dHRvblRvZ2dsZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiB2YWx1ZSkge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICB0aHJvdyBFcnJvcignVmFsdWUgbXVzdCBiZSBhbiBhcnJheSBpbiBtdWx0aXBsZS1zZWxlY3Rpb24gbW9kZS4nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xlYXJTZWxlY3Rpb24oKTtcbiAgICAgIHZhbHVlLmZvckVhY2goKGN1cnJlbnRWYWx1ZTogYW55KSA9PiB0aGlzLl9zZWxlY3RWYWx1ZShjdXJyZW50VmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTZWxlY3Rpb24oKTtcbiAgICAgIHRoaXMuX3NlbGVjdFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xlYXJzIHRoZSBzZWxlY3RlZCB0b2dnbGVzLiAqL1xuICBwcml2YXRlIF9jbGVhclNlbGVjdGlvbigpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5jbGVhcigpO1xuICAgIHRoaXMuX2J1dHRvblRvZ2dsZXMuZm9yRWFjaCh0b2dnbGUgPT4ge1xuICAgICAgdG9nZ2xlLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIC8vIElmIHRoZSBidXR0b24gdG9nZ2xlIGlzIGluIHNpbmdsZSBzZWxlY3QgbW9kZSwgaW5pdGlhbGl6ZSB0aGUgdGFiSW5kZXguXG4gICAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgdG9nZ2xlLnRhYkluZGV4ID0gLTE7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogU2VsZWN0cyBhIHZhbHVlIGlmIHRoZXJlJ3MgYSB0b2dnbGUgdGhhdCBjb3JyZXNwb25kcyB0byBpdC4gKi9cbiAgcHJpdmF0ZSBfc2VsZWN0VmFsdWUodmFsdWU6IGFueSkge1xuICAgIGNvbnN0IGNvcnJlc3BvbmRpbmdPcHRpb24gPSB0aGlzLl9idXR0b25Ub2dnbGVzLmZpbmQodG9nZ2xlID0+IHtcbiAgICAgIHJldHVybiB0b2dnbGUudmFsdWUgIT0gbnVsbCAmJiB0b2dnbGUudmFsdWUgPT09IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgaWYgKGNvcnJlc3BvbmRpbmdPcHRpb24pIHtcbiAgICAgIGNvcnJlc3BvbmRpbmdPcHRpb24uY2hlY2tlZCA9IHRydWU7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoY29ycmVzcG9uZGluZ09wdGlvbik7XG4gICAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgLy8gSWYgdGhlIGJ1dHRvbiB0b2dnbGUgaXMgaW4gc2luZ2xlIHNlbGVjdCBtb2RlLCByZXNldCB0aGUgdGFiSW5kZXguXG4gICAgICAgIGNvcnJlc3BvbmRpbmdPcHRpb24udGFiSW5kZXggPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBTeW5jcyB1cCB0aGUgZ3JvdXAncyB2YWx1ZSB3aXRoIHRoZSBtb2RlbCBhbmQgZW1pdHMgdGhlIGNoYW5nZSBldmVudC4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlTW9kZWxWYWx1ZSh0b2dnbGU6IE1hdEJ1dHRvblRvZ2dsZSwgaXNVc2VySW5wdXQ6IGJvb2xlYW4pIHtcbiAgICAvLyBPbmx5IGVtaXQgdGhlIGNoYW5nZSBldmVudCBmb3IgdXNlciBpbnB1dC5cbiAgICBpZiAoaXNVc2VySW5wdXQpIHtcbiAgICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudCh0b2dnbGUpO1xuICAgIH1cblxuICAgIC8vIE5vdGU6IHdlIGVtaXQgdGhpcyBvbmUgbm8gbWF0dGVyIHdoZXRoZXIgaXQgd2FzIGEgdXNlciBpbnRlcmFjdGlvbiwgYmVjYXVzZVxuICAgIC8vIGl0IGlzIHVzZWQgYnkgQW5ndWxhciB0byBzeW5jIHVwIHRoZSB0d28td2F5IGRhdGEgYmluZGluZy5cbiAgICB0aGlzLnZhbHVlQ2hhbmdlLmVtaXQodGhpcy52YWx1ZSk7XG4gIH1cblxuICAvKiogTWFya3MgYWxsIG9mIHRoZSBjaGlsZCBidXR0b24gdG9nZ2xlcyB0byBiZSBjaGVja2VkLiAqL1xuICBwcml2YXRlIF9tYXJrQnV0dG9uc0ZvckNoZWNrKCkge1xuICAgIHRoaXMuX2J1dHRvblRvZ2dsZXM/LmZvckVhY2godG9nZ2xlID0+IHRvZ2dsZS5fbWFya0ZvckNoZWNrKCkpO1xuICB9XG59XG5cbi8qKiBTaW5nbGUgYnV0dG9uIGluc2lkZSBvZiBhIHRvZ2dsZSBncm91cC4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1idXR0b24tdG9nZ2xlJyxcbiAgdGVtcGxhdGVVcmw6ICdidXR0b24tdG9nZ2xlLmh0bWwnLFxuICBzdHlsZVVybDogJ2J1dHRvbi10b2dnbGUuY3NzJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgZXhwb3J0QXM6ICdtYXRCdXR0b25Ub2dnbGUnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MubWF0LWJ1dHRvbi10b2dnbGUtc3RhbmRhbG9uZV0nOiAnIWJ1dHRvblRvZ2dsZUdyb3VwJyxcbiAgICAnW2NsYXNzLm1hdC1idXR0b24tdG9nZ2xlLWNoZWNrZWRdJzogJ2NoZWNrZWQnLFxuICAgICdbY2xhc3MubWF0LWJ1dHRvbi10b2dnbGUtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLm1hdC1idXR0b24tdG9nZ2xlLWRpc2FibGVkLWludGVyYWN0aXZlXSc6ICdkaXNhYmxlZEludGVyYWN0aXZlJyxcbiAgICAnW2NsYXNzLm1hdC1idXR0b24tdG9nZ2xlLWFwcGVhcmFuY2Utc3RhbmRhcmRdJzogJ2FwcGVhcmFuY2UgPT09IFwic3RhbmRhcmRcIicsXG4gICAgJ2NsYXNzJzogJ21hdC1idXR0b24tdG9nZ2xlJyxcbiAgICAnW2F0dHIuYXJpYS1sYWJlbF0nOiAnbnVsbCcsXG4gICAgJ1thdHRyLmFyaWEtbGFiZWxsZWRieV0nOiAnbnVsbCcsXG4gICAgJ1thdHRyLmlkXSc6ICdpZCcsXG4gICAgJ1thdHRyLm5hbWVdJzogJ251bGwnLFxuICAgICcoZm9jdXMpJzogJ2ZvY3VzKCknLFxuICAgICdyb2xlJzogJ3ByZXNlbnRhdGlvbicsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtNYXRSaXBwbGUsIE1hdFBzZXVkb0NoZWNrYm94XSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0QnV0dG9uVG9nZ2xlIGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9jaGVja2VkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVkIHRvIHRoZSBhcmlhLWxhYmVsIGF0dHJpYnV0ZSBvZiB0aGUgaG9zdCBlbGVtZW50LiBJbiBtb3N0IGNhc2VzLCBhcmlhLWxhYmVsbGVkYnkgd2lsbFxuICAgKiB0YWtlIHByZWNlZGVuY2Ugc28gdGhpcyBtYXkgYmUgb21pdHRlZC5cbiAgICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBVc2VycyBjYW4gc3BlY2lmeSB0aGUgYGFyaWEtbGFiZWxsZWRieWAgYXR0cmlidXRlIHdoaWNoIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoZSBpbnB1dCBlbGVtZW50XG4gICAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWxsZWRieScpIGFyaWFMYWJlbGxlZGJ5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKiogVW5kZXJseWluZyBuYXRpdmUgYGJ1dHRvbmAgZWxlbWVudC4gKi9cbiAgQFZpZXdDaGlsZCgnYnV0dG9uJykgX2J1dHRvbkVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEJ1dHRvbkVsZW1lbnQ+O1xuXG4gIC8qKiBUaGUgcGFyZW50IGJ1dHRvbiB0b2dnbGUgZ3JvdXAgKGV4Y2x1c2l2ZSBzZWxlY3Rpb24pLiBPcHRpb25hbC4gKi9cbiAgYnV0dG9uVG9nZ2xlR3JvdXA6IE1hdEJ1dHRvblRvZ2dsZUdyb3VwO1xuXG4gIC8qKiBVbmlxdWUgSUQgZm9yIHRoZSB1bmRlcmx5aW5nIGBidXR0b25gIGVsZW1lbnQuICovXG4gIGdldCBidXR0b25JZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmlkfS1idXR0b25gO1xuICB9XG5cbiAgLyoqIFRoZSB1bmlxdWUgSUQgZm9yIHRoaXMgYnV0dG9uIHRvZ2dsZS4gKi9cbiAgQElucHV0KCkgaWQ6IHN0cmluZztcblxuICAvKiogSFRNTCdzICduYW1lJyBhdHRyaWJ1dGUgdXNlZCB0byBncm91cCByYWRpb3MgZm9yIHVuaXF1ZSBzZWxlY3Rpb24uICovXG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcblxuICAvKiogTWF0QnV0dG9uVG9nZ2xlR3JvdXAgcmVhZHMgdGhpcyB0byBhc3NpZ24gaXRzIG93biB2YWx1ZS4gKi9cbiAgQElucHV0KCkgdmFsdWU6IGFueTtcblxuICAvKiogVGFiaW5kZXggb2YgdGhlIHRvZ2dsZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHRhYkluZGV4KCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl90YWJJbmRleDtcbiAgfVxuICBzZXQgdGFiSW5kZXgodmFsdWU6IG51bWJlciB8IG51bGwpIHtcbiAgICB0aGlzLl90YWJJbmRleCA9IHZhbHVlO1xuICAgIHRoaXMuX21hcmtGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX3RhYkluZGV4OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHJpcHBsZXMgYXJlIGRpc2FibGVkIG9uIHRoZSBidXR0b24gdG9nZ2xlLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGRpc2FibGVSaXBwbGU6IGJvb2xlYW47XG5cbiAgLyoqIFRoZSBhcHBlYXJhbmNlIHN0eWxlIG9mIHRoZSBidXR0b24uICovXG4gIEBJbnB1dCgpXG4gIGdldCBhcHBlYXJhbmNlKCk6IE1hdEJ1dHRvblRvZ2dsZUFwcGVhcmFuY2Uge1xuICAgIHJldHVybiB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwID8gdGhpcy5idXR0b25Ub2dnbGVHcm91cC5hcHBlYXJhbmNlIDogdGhpcy5fYXBwZWFyYW5jZTtcbiAgfVxuICBzZXQgYXBwZWFyYW5jZSh2YWx1ZTogTWF0QnV0dG9uVG9nZ2xlQXBwZWFyYW5jZSkge1xuICAgIHRoaXMuX2FwcGVhcmFuY2UgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9hcHBlYXJhbmNlOiBNYXRCdXR0b25Ub2dnbGVBcHBlYXJhbmNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBidXR0b24gaXMgY2hlY2tlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgY2hlY2tlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5idXR0b25Ub2dnbGVHcm91cCA/IHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAuX2lzU2VsZWN0ZWQodGhpcykgOiB0aGlzLl9jaGVja2VkO1xuICB9XG4gIHNldCBjaGVja2VkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9jaGVja2VkKSB7XG4gICAgICB0aGlzLl9jaGVja2VkID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwKSB7XG4gICAgICAgIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAuX3N5bmNCdXR0b25Ub2dnbGUodGhpcywgdGhpcy5fY2hlY2tlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBidXR0b24gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCB8fCAodGhpcy5idXR0b25Ub2dnbGVHcm91cCAmJiB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwLmRpc2FibGVkKTtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJ1dHRvbiBzaG91bGQgcmVtYWluIGludGVyYWN0aXZlIHdoZW4gaXQgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkSW50ZXJhY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX2Rpc2FibGVkSW50ZXJhY3RpdmUgfHxcbiAgICAgICh0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwICE9PSBudWxsICYmIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAuZGlzYWJsZWRJbnRlcmFjdGl2ZSlcbiAgICApO1xuICB9XG4gIHNldCBkaXNhYmxlZEludGVyYWN0aXZlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWRJbnRlcmFjdGl2ZSA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkSW50ZXJhY3RpdmU6IGJvb2xlYW47XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgZ3JvdXAgdmFsdWUgY2hhbmdlcy4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNoYW5nZTogRXZlbnRFbWl0dGVyPE1hdEJ1dHRvblRvZ2dsZUNoYW5nZT4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8TWF0QnV0dG9uVG9nZ2xlQ2hhbmdlPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX0JVVFRPTl9UT0dHTEVfR1JPVVApIHRvZ2dsZUdyb3VwOiBNYXRCdXR0b25Ub2dnbGVHcm91cCxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfZm9jdXNNb25pdG9yOiBGb2N1c01vbml0b3IsXG4gICAgQEF0dHJpYnV0ZSgndGFiaW5kZXgnKSBkZWZhdWx0VGFiSW5kZXg6IHN0cmluZyxcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoTUFUX0JVVFRPTl9UT0dHTEVfREVGQVVMVF9PUFRJT05TKVxuICAgIGRlZmF1bHRPcHRpb25zPzogTWF0QnV0dG9uVG9nZ2xlRGVmYXVsdE9wdGlvbnMsXG4gICkge1xuICAgIGNvbnN0IHBhcnNlZFRhYkluZGV4ID0gTnVtYmVyKGRlZmF1bHRUYWJJbmRleCk7XG4gICAgdGhpcy50YWJJbmRleCA9IHBhcnNlZFRhYkluZGV4IHx8IHBhcnNlZFRhYkluZGV4ID09PSAwID8gcGFyc2VkVGFiSW5kZXggOiBudWxsO1xuICAgIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAgPSB0b2dnbGVHcm91cDtcbiAgICB0aGlzLmFwcGVhcmFuY2UgPVxuICAgICAgZGVmYXVsdE9wdGlvbnMgJiYgZGVmYXVsdE9wdGlvbnMuYXBwZWFyYW5jZSA/IGRlZmF1bHRPcHRpb25zLmFwcGVhcmFuY2UgOiAnc3RhbmRhcmQnO1xuICAgIHRoaXMuZGlzYWJsZWRJbnRlcmFjdGl2ZSA9IGRlZmF1bHRPcHRpb25zPy5kaXNhYmxlZEludGVyYWN0aXZlID8/IGZhbHNlO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgY29uc3QgZ3JvdXAgPSB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwO1xuICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IGBtYXQtYnV0dG9uLXRvZ2dsZS0ke3VuaXF1ZUlkQ291bnRlcisrfWA7XG5cbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIGlmIChncm91cC5faXNQcmVjaGVja2VkKHRoaXMpKSB7XG4gICAgICAgIHRoaXMuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGdyb3VwLl9pc1NlbGVjdGVkKHRoaXMpICE9PSB0aGlzLl9jaGVja2VkKSB7XG4gICAgICAgIC8vIEFzIHNpZGUgZWZmZWN0IG9mIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5IGJldHdlZW4gdGhlIHRvZ2dsZSBncm91cCBhbmQgdGhlIGJ1dHRvbixcbiAgICAgICAgLy8gd2UgbWF5IGVuZCB1cCBpbiBhIHN0YXRlIHdoZXJlIHRoZSBidXR0b24gaXMgc3VwcG9zZWQgdG8gYmUgY2hlY2tlZCBvbiBpbml0LCBidXQgaXRcbiAgICAgICAgLy8gaXNuJ3QsIGJlY2F1c2UgdGhlIGNoZWNrZWQgdmFsdWUgd2FzIGFzc2lnbmVkIHRvbyBlYXJseS4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gSXZ5XG4gICAgICAgIC8vIGFzc2lnbnMgdGhlIHN0YXRpYyBpbnB1dCB2YWx1ZSBiZWZvcmUgdGhlIGBuZ09uSW5pdGAgaGFzIHJ1bi5cbiAgICAgICAgZ3JvdXAuX3N5bmNCdXR0b25Ub2dnbGUodGhpcywgdGhpcy5fY2hlY2tlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5tb25pdG9yKHRoaXMuX2VsZW1lbnRSZWYsIHRydWUpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgY29uc3QgZ3JvdXAgPSB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwO1xuXG4gICAgdGhpcy5fZm9jdXNNb25pdG9yLnN0b3BNb25pdG9yaW5nKHRoaXMuX2VsZW1lbnRSZWYpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSB0b2dnbGUgZnJvbSB0aGUgc2VsZWN0aW9uIG9uY2UgaXQncyBkZXN0cm95ZWQuIE5lZWRzIHRvIGhhcHBlblxuICAgIC8vIG9uIHRoZSBuZXh0IHRpY2sgaW4gb3JkZXIgdG8gYXZvaWQgXCJjaGFuZ2VkIGFmdGVyIGNoZWNrZWRcIiBlcnJvcnMuXG4gICAgaWYgKGdyb3VwICYmIGdyb3VwLl9pc1NlbGVjdGVkKHRoaXMpKSB7XG4gICAgICBncm91cC5fc3luY0J1dHRvblRvZ2dsZSh0aGlzLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBidXR0b24uICovXG4gIGZvY3VzKG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLl9idXR0b25FbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZm9jdXMob3B0aW9ucyk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHRoZSBidXR0b24gdG9nZ2xlIGR1ZSB0byBhbiBpbnRlcmFjdGlvbiB3aXRoIHRoZSB1bmRlcmx5aW5nIG5hdGl2ZSBidXR0b24uICovXG4gIF9vbkJ1dHRvbkNsaWNrKCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbmV3Q2hlY2tlZCA9IHRoaXMuaXNTaW5nbGVTZWxlY3RvcigpID8gdHJ1ZSA6ICF0aGlzLl9jaGVja2VkO1xuXG4gICAgaWYgKG5ld0NoZWNrZWQgIT09IHRoaXMuX2NoZWNrZWQpIHtcbiAgICAgIHRoaXMuX2NoZWNrZWQgPSBuZXdDaGVja2VkO1xuICAgICAgaWYgKHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXApIHtcbiAgICAgICAgdGhpcy5idXR0b25Ub2dnbGVHcm91cC5fc3luY0J1dHRvblRvZ2dsZSh0aGlzLCB0aGlzLl9jaGVja2VkLCB0cnVlKTtcbiAgICAgICAgdGhpcy5idXR0b25Ub2dnbGVHcm91cC5fb25Ub3VjaGVkKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNTaW5nbGVTZWxlY3RvcigpKSB7XG4gICAgICBjb25zdCBmb2N1c2FibGUgPSB0aGlzLmJ1dHRvblRvZ2dsZUdyb3VwLl9idXR0b25Ub2dnbGVzLmZpbmQodG9nZ2xlID0+IHtcbiAgICAgICAgcmV0dXJuIHRvZ2dsZS50YWJJbmRleCA9PT0gMDtcbiAgICAgIH0pO1xuICAgICAgLy8gTW9kaWZ5IHRoZSB0YWJpbmRleCBhdHRyaWJ1dGUgb2YgdGhlIGxhc3QgZm9jdXNhYmxlIGJ1dHRvbiB0b2dnbGUgdG8gLTEuXG4gICAgICBpZiAoZm9jdXNhYmxlKSB7XG4gICAgICAgIGZvY3VzYWJsZS50YWJJbmRleCA9IC0xO1xuICAgICAgfVxuICAgICAgLy8gTW9kaWZ5IHRoZSB0YWJpbmRleCBhdHRyaWJ1dGUgb2YgdGhlIHByZXNlbnRseSBzZWxlY3RlZCBidXR0b24gdG9nZ2xlIHRvIDAuXG4gICAgICB0aGlzLnRhYkluZGV4ID0gMDtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGEgY2hhbmdlIGV2ZW50IHdoZW4gaXQncyB0aGUgc2luZ2xlIHNlbGVjdG9yXG4gICAgdGhpcy5jaGFuZ2UuZW1pdChuZXcgTWF0QnV0dG9uVG9nZ2xlQ2hhbmdlKHRoaXMsIHRoaXMudmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgYnV0dG9uIHRvZ2dsZSBhcyBuZWVkaW5nIGNoZWNraW5nIGZvciBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBleHBvc2VkIGJlY2F1c2UgdGhlIHBhcmVudCBidXR0b24gdG9nZ2xlIGdyb3VwIHdpbGwgZGlyZWN0bHlcbiAgICogdXBkYXRlIGJvdW5kIHByb3BlcnRpZXMgb2YgdGhlIHJhZGlvIGJ1dHRvbi5cbiAgICovXG4gIF9tYXJrRm9yQ2hlY2soKSB7XG4gICAgLy8gV2hlbiB0aGUgZ3JvdXAgdmFsdWUgY2hhbmdlcywgdGhlIGJ1dHRvbiB3aWxsIG5vdCBiZSBub3RpZmllZC5cbiAgICAvLyBVc2UgYG1hcmtGb3JDaGVja2AgdG8gZXhwbGljaXQgdXBkYXRlIGJ1dHRvbiB0b2dnbGUncyBzdGF0dXMuXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmFtZSB0aGF0IHNob3VsZCBiZSBhc3NpZ25lZCB0byB0aGUgaW5uZXIgRE9NIG5vZGUuICovXG4gIF9nZXRCdXR0b25OYW1lKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0aGlzLmlzU2luZ2xlU2VsZWN0b3IoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAubmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmFtZSB8fCBudWxsO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvZ2dsZSBpcyBpbiBzaW5nbGUgc2VsZWN0aW9uIG1vZGUuICovXG4gIGlzU2luZ2xlU2VsZWN0b3IoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAgJiYgIXRoaXMuYnV0dG9uVG9nZ2xlR3JvdXAubXVsdGlwbGU7XG4gIH1cbn1cbiIsIjxidXR0b24gI2J1dHRvbiBjbGFzcz1cIm1hdC1idXR0b24tdG9nZ2xlLWJ1dHRvbiBtYXQtZm9jdXMtaW5kaWNhdG9yXCJcbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIFtpZF09XCJidXR0b25JZFwiXG4gICAgICAgIFthdHRyLnJvbGVdPVwiaXNTaW5nbGVTZWxlY3RvcigpID8gJ3JhZGlvJyA6ICdidXR0b24nXCJcbiAgICAgICAgW2F0dHIudGFiaW5kZXhdPVwiZGlzYWJsZWQgJiYgIWRpc2FibGVkSW50ZXJhY3RpdmUgPyAtMSA6IHRhYkluZGV4XCJcbiAgICAgICAgW2F0dHIuYXJpYS1wcmVzc2VkXT1cIiFpc1NpbmdsZVNlbGVjdG9yKCkgPyBjaGVja2VkIDogbnVsbFwiXG4gICAgICAgIFthdHRyLmFyaWEtY2hlY2tlZF09XCJpc1NpbmdsZVNlbGVjdG9yKCkgPyBjaGVja2VkIDogbnVsbFwiXG4gICAgICAgIFtkaXNhYmxlZF09XCIoZGlzYWJsZWQgJiYgIWRpc2FibGVkSW50ZXJhY3RpdmUpIHx8IG51bGxcIlxuICAgICAgICBbYXR0ci5uYW1lXT1cIl9nZXRCdXR0b25OYW1lKClcIlxuICAgICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbFwiXG4gICAgICAgIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJhcmlhTGFiZWxsZWRieVwiXG4gICAgICAgIFthdHRyLmFyaWEtZGlzYWJsZWRdPVwiZGlzYWJsZWQgJiYgZGlzYWJsZWRJbnRlcmFjdGl2ZSA/ICd0cnVlJyA6IG51bGxcIlxuICAgICAgICAoY2xpY2spPVwiX29uQnV0dG9uQ2xpY2soKVwiPlxuICA8c3BhbiBjbGFzcz1cIm1hdC1idXR0b24tdG9nZ2xlLWxhYmVsLWNvbnRlbnRcIj5cbiAgICA8IS0tIFJlbmRlciBjaGVja21hcmsgYXQgdGhlIGJlZ2lubmluZyBmb3Igc2luZ2xlLXNlbGVjdGlvbi4gLS0+XG4gICAgQGlmIChidXR0b25Ub2dnbGVHcm91cCAmJiBjaGVja2VkICYmICFidXR0b25Ub2dnbGVHcm91cC5tdWx0aXBsZSAmJiAhYnV0dG9uVG9nZ2xlR3JvdXAuaGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvcikge1xuICAgICAgPG1hdC1wc2V1ZG8tY2hlY2tib3hcbiAgICAgICAgICBjbGFzcz1cIm1hdC1tZGMtb3B0aW9uLXBzZXVkby1jaGVja2JveFwiXG4gICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkXCJcbiAgICAgICAgICBzdGF0ZT1cImNoZWNrZWRcIlxuICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgYXBwZWFyYW5jZT1cIm1pbmltYWxcIj48L21hdC1wc2V1ZG8tY2hlY2tib3g+XG4gICAgfVxuICAgIDwhLS0gUmVuZGVyIGNoZWNrbWFyayBhdCB0aGUgYmVnaW5uaW5nIGZvciBtdWx0aXBsZS1zZWxlY3Rpb24uIC0tPlxuICAgIEBpZiAoYnV0dG9uVG9nZ2xlR3JvdXAgJiYgY2hlY2tlZCAmJiBidXR0b25Ub2dnbGVHcm91cC5tdWx0aXBsZSAmJiAhYnV0dG9uVG9nZ2xlR3JvdXAuaGlkZU11bHRpcGxlU2VsZWN0aW9uSW5kaWNhdG9yKSB7XG4gICAgICA8bWF0LXBzZXVkby1jaGVja2JveFxuICAgICAgICAgIGNsYXNzPVwibWF0LW1kYy1vcHRpb24tcHNldWRvLWNoZWNrYm94XCJcbiAgICAgICAgICBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuICAgICAgICAgIHN0YXRlPVwiY2hlY2tlZFwiXG4gICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgICAgICBhcHBlYXJhbmNlPVwibWluaW1hbFwiPjwvbWF0LXBzZXVkby1jaGVja2JveD5cbiAgICB9XG4gICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICA8L3NwYW4+XG48L2J1dHRvbj5cblxuPHNwYW4gY2xhc3M9XCJtYXQtYnV0dG9uLXRvZ2dsZS1mb2N1cy1vdmVybGF5XCI+PC9zcGFuPlxuPHNwYW4gY2xhc3M9XCJtYXQtYnV0dG9uLXRvZ2dsZS1yaXBwbGVcIiBtYXRSaXBwbGVcbiAgICAgW21hdFJpcHBsZVRyaWdnZXJdPVwiYnV0dG9uXCJcbiAgICAgW21hdFJpcHBsZURpc2FibGVkXT1cInRoaXMuZGlzYWJsZVJpcHBsZSB8fCB0aGlzLmRpc2FibGVkXCI+XG48L3NwYW4+XG4iXX0=