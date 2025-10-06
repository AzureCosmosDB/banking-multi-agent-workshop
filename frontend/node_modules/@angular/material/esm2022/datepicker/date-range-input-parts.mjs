/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { BACKSPACE, LEFT_ARROW, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { Directive, ElementRef, Inject, InjectionToken, Injector, Input, Optional, inject, } from '@angular/core';
import { FormGroupDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, NgForm, Validators, } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, _ErrorStateTracker, } from '@angular/material/core';
import { _computeAriaAccessibleName } from './aria-accessible-name';
import { DateRange } from './date-selection-model';
import { MatDatepickerInputBase } from './datepicker-input-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/core";
import * as i2 from "@angular/forms";
/**
 * Used to provide the date range input wrapper component
 * to the parts without circular dependencies.
 */
export const MAT_DATE_RANGE_INPUT_PARENT = new InjectionToken('MAT_DATE_RANGE_INPUT_PARENT');
/**
 * Base class for the individual inputs that can be projected inside a `mat-date-range-input`.
 */
class MatDateRangeInputPartBase extends MatDatepickerInputBase {
    /** Object used to control when error messages are shown. */
    get errorStateMatcher() {
        return this._errorStateTracker.matcher;
    }
    set errorStateMatcher(value) {
        this._errorStateTracker.matcher = value;
    }
    /** Whether the input is in an error state. */
    get errorState() {
        return this._errorStateTracker.errorState;
    }
    set errorState(value) {
        this._errorStateTracker.errorState = value;
    }
    constructor(_rangeInput, _elementRef, _defaultErrorStateMatcher, _injector, _parentForm, _parentFormGroup, dateAdapter, dateFormats) {
        super(_elementRef, dateAdapter, dateFormats);
        this._rangeInput = _rangeInput;
        this._elementRef = _elementRef;
        this._defaultErrorStateMatcher = _defaultErrorStateMatcher;
        this._injector = _injector;
        this._parentForm = _parentForm;
        this._parentFormGroup = _parentFormGroup;
        this._dir = inject(Directionality, { optional: true });
        this._errorStateTracker = new _ErrorStateTracker(this._defaultErrorStateMatcher, null, this._parentFormGroup, this._parentForm, this.stateChanges);
    }
    ngOnInit() {
        // We need the date input to provide itself as a `ControlValueAccessor` and a `Validator`, while
        // injecting its `NgControl` so that the error state is handled correctly. This introduces a
        // circular dependency, because both `ControlValueAccessor` and `Validator` depend on the input
        // itself. Usually we can work around it for the CVA, but there's no API to do it for the
        // validator. We work around it here by injecting the `NgControl` in `ngOnInit`, after
        // everything has been resolved.
        const ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
        if (ngControl) {
            this.ngControl = ngControl;
            this._errorStateTracker.ngControl = ngControl;
        }
    }
    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }
    /** Gets whether the input is empty. */
    isEmpty() {
        return this._elementRef.nativeElement.value.length === 0;
    }
    /** Gets the placeholder of the input. */
    _getPlaceholder() {
        return this._elementRef.nativeElement.placeholder;
    }
    /** Focuses the input. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    /** Gets the value that should be used when mirroring the input's size. */
    getMirrorValue() {
        const element = this._elementRef.nativeElement;
        const value = element.value;
        return value.length > 0 ? value : element.placeholder;
    }
    /** Refreshes the error state of the input. */
    updateErrorState() {
        this._errorStateTracker.updateErrorState();
    }
    /** Handles `input` events on the input element. */
    _onInput(value) {
        super._onInput(value);
        this._rangeInput._handleChildValueChange();
    }
    /** Opens the datepicker associated with the input. */
    _openPopup() {
        this._rangeInput._openDatepicker();
    }
    /** Gets the minimum date from the range input. */
    _getMinDate() {
        return this._rangeInput.min;
    }
    /** Gets the maximum date from the range input. */
    _getMaxDate() {
        return this._rangeInput.max;
    }
    /** Gets the date filter function from the range input. */
    _getDateFilter() {
        return this._rangeInput.dateFilter;
    }
    _parentDisabled() {
        return this._rangeInput._groupDisabled;
    }
    _shouldHandleChangeEvent({ source }) {
        return source !== this._rangeInput._startInput && source !== this._rangeInput._endInput;
    }
    _assignValueProgrammatically(value) {
        super._assignValueProgrammatically(value);
        const opposite = (this === this._rangeInput._startInput
            ? this._rangeInput._endInput
            : this._rangeInput._startInput);
        opposite?._validatorOnChange();
    }
    /** return the ARIA accessible name of the input element */
    _getAccessibleName() {
        return _computeAriaAccessibleName(this._elementRef.nativeElement);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateRangeInputPartBase, deps: [{ token: MAT_DATE_RANGE_INPUT_PARENT }, { token: i0.ElementRef }, { token: i1.ErrorStateMatcher }, { token: i0.Injector }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i1.DateAdapter, optional: true }, { token: MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDateRangeInputPartBase, isStandalone: true, inputs: { errorStateMatcher: "errorStateMatcher" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateRangeInputPartBase, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DATE_RANGE_INPUT_PARENT]
                }] }, { type: i0.ElementRef }, { type: i1.ErrorStateMatcher }, { type: i0.Injector }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_FORMATS]
                }] }], propDecorators: { errorStateMatcher: [{
                type: Input
            }] } });
/** Input for entering the start date in a `mat-date-range-input`. */
export class MatStartDate extends MatDateRangeInputPartBase {
    constructor(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) {
        super(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats);
        /** Validator that checks that the start date isn't after the end date. */
        this._startValidator = (control) => {
            const start = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const end = this._model ? this._model.selection.end : null;
            return !start || !end || this._dateAdapter.compareDate(start, end) <= 0
                ? null
                : { 'matStartDateInvalid': { 'end': end, 'actual': start } };
        };
        this._validator = Validators.compose([...super._getValidators(), this._startValidator]);
    }
    _getValueFromModel(modelValue) {
        return modelValue.start;
    }
    _shouldHandleChangeEvent(change) {
        if (!super._shouldHandleChangeEvent(change)) {
            return false;
        }
        else {
            return !change.oldValue?.start
                ? !!change.selection.start
                : !change.selection.start ||
                    !!this._dateAdapter.compareDate(change.oldValue.start, change.selection.start);
        }
    }
    _assignValueToModel(value) {
        if (this._model) {
            const range = new DateRange(value, this._model.selection.end);
            this._model.updateSelection(range, this);
        }
    }
    _formatValue(value) {
        super._formatValue(value);
        // Any time the input value is reformatted we need to tell the parent.
        this._rangeInput._handleChildValueChange();
    }
    _onKeydown(event) {
        const endInput = this._rangeInput._endInput;
        const element = this._elementRef.nativeElement;
        const isLtr = this._dir?.value !== 'rtl';
        // If the user hits RIGHT (LTR) when at the end of the input (and no
        // selection), move the cursor to the start of the end input.
        if (((event.keyCode === RIGHT_ARROW && isLtr) || (event.keyCode === LEFT_ARROW && !isLtr)) &&
            element.selectionStart === element.value.length &&
            element.selectionEnd === element.value.length) {
            event.preventDefault();
            endInput._elementRef.nativeElement.setSelectionRange(0, 0);
            endInput.focus();
        }
        else {
            super._onKeydown(event);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStartDate, deps: [{ token: MAT_DATE_RANGE_INPUT_PARENT }, { token: i0.ElementRef }, { token: i1.ErrorStateMatcher }, { token: i0.Injector }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i1.DateAdapter, optional: true }, { token: MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStartDate, isStandalone: true, selector: "input[matStartDate]", outputs: { dateChange: "dateChange", dateInput: "dateInput" }, host: { attributes: { "type": "text" }, listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "keydown": "_onKeydown($event)", "blur": "_onBlur()" }, properties: { "disabled": "disabled", "attr.aria-haspopup": "_rangeInput.rangePicker ? \"dialog\" : null", "attr.aria-owns": "_rangeInput._ariaOwns\n        ? _rangeInput._ariaOwns()\n        : (_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null", "attr.min": "_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null", "attr.max": "_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null" }, classAttribute: "mat-start-date mat-date-range-input-inner" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: MatStartDate, multi: true },
            { provide: NG_VALIDATORS, useExisting: MatStartDate, multi: true },
        ], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStartDate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[matStartDate]',
                    host: {
                        'class': 'mat-start-date mat-date-range-input-inner',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(keydown)': '_onKeydown($event)',
                        '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
                        '[attr.aria-owns]': `_rangeInput._ariaOwns
        ? _rangeInput._ariaOwns()
        : (_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null`,
                        '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
                        '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
                        '(blur)': '_onBlur()',
                        'type': 'text',
                    },
                    providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: MatStartDate, multi: true },
                        { provide: NG_VALIDATORS, useExisting: MatStartDate, multi: true },
                    ],
                    // These need to be specified explicitly, because some tooling doesn't
                    // seem to pick them up from the base class. See #20932.
                    outputs: ['dateChange', 'dateInput'],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DATE_RANGE_INPUT_PARENT]
                }] }, { type: i0.ElementRef }, { type: i1.ErrorStateMatcher }, { type: i0.Injector }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_FORMATS]
                }] }] });
/** Input for entering the end date in a `mat-date-range-input`. */
export class MatEndDate extends MatDateRangeInputPartBase {
    constructor(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) {
        super(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats);
        /** Validator that checks that the end date isn't before the start date. */
        this._endValidator = (control) => {
            const end = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
            const start = this._model ? this._model.selection.start : null;
            return !end || !start || this._dateAdapter.compareDate(end, start) >= 0
                ? null
                : { 'matEndDateInvalid': { 'start': start, 'actual': end } };
        };
        this._validator = Validators.compose([...super._getValidators(), this._endValidator]);
    }
    _getValueFromModel(modelValue) {
        return modelValue.end;
    }
    _shouldHandleChangeEvent(change) {
        if (!super._shouldHandleChangeEvent(change)) {
            return false;
        }
        else {
            return !change.oldValue?.end
                ? !!change.selection.end
                : !change.selection.end ||
                    !!this._dateAdapter.compareDate(change.oldValue.end, change.selection.end);
        }
    }
    _assignValueToModel(value) {
        if (this._model) {
            const range = new DateRange(this._model.selection.start, value);
            this._model.updateSelection(range, this);
        }
    }
    _moveCaretToEndOfStartInput() {
        const startInput = this._rangeInput._startInput._elementRef.nativeElement;
        const value = startInput.value;
        if (value.length > 0) {
            startInput.setSelectionRange(value.length, value.length);
        }
        startInput.focus();
    }
    _onKeydown(event) {
        const element = this._elementRef.nativeElement;
        const isLtr = this._dir?.value !== 'rtl';
        // If the user is pressing backspace on an empty end input, move focus back to the start.
        if (event.keyCode === BACKSPACE && !element.value) {
            this._moveCaretToEndOfStartInput();
        }
        // If the user hits LEFT (LTR) when at the start of the input (and no
        // selection), move the cursor to the end of the start input.
        else if (((event.keyCode === LEFT_ARROW && isLtr) || (event.keyCode === RIGHT_ARROW && !isLtr)) &&
            element.selectionStart === 0 &&
            element.selectionEnd === 0) {
            event.preventDefault();
            this._moveCaretToEndOfStartInput();
        }
        else {
            super._onKeydown(event);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatEndDate, deps: [{ token: MAT_DATE_RANGE_INPUT_PARENT }, { token: i0.ElementRef }, { token: i1.ErrorStateMatcher }, { token: i0.Injector }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i1.DateAdapter, optional: true }, { token: MAT_DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatEndDate, isStandalone: true, selector: "input[matEndDate]", outputs: { dateChange: "dateChange", dateInput: "dateInput" }, host: { attributes: { "type": "text" }, listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "keydown": "_onKeydown($event)", "blur": "_onBlur()" }, properties: { "disabled": "disabled", "attr.aria-haspopup": "_rangeInput.rangePicker ? \"dialog\" : null", "attr.aria-owns": "_rangeInput._ariaOwns\n        ? _rangeInput._ariaOwns()\n        : (_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null", "attr.min": "_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null", "attr.max": "_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null" }, classAttribute: "mat-end-date mat-date-range-input-inner" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: MatEndDate, multi: true },
            { provide: NG_VALIDATORS, useExisting: MatEndDate, multi: true },
        ], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatEndDate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[matEndDate]',
                    host: {
                        'class': 'mat-end-date mat-date-range-input-inner',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(keydown)': '_onKeydown($event)',
                        '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
                        '[attr.aria-owns]': `_rangeInput._ariaOwns
        ? _rangeInput._ariaOwns()
        : (_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null`,
                        '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
                        '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
                        '(blur)': '_onBlur()',
                        'type': 'text',
                    },
                    providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: MatEndDate, multi: true },
                        { provide: NG_VALIDATORS, useExisting: MatEndDate, multi: true },
                    ],
                    // These need to be specified explicitly, because some tooling doesn't
                    // seem to pick them up from the base class. See #20932.
                    outputs: ['dateChange', 'dateInput'],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DATE_RANGE_INPUT_PARENT]
                }] }, { type: i0.ElementRef }, { type: i1.ErrorStateMatcher }, { type: i0.Injector }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_FORMATS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1pbnB1dC1wYXJ0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2RhdGUtcmFuZ2UtaW5wdXQtcGFydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3pFLE9BQU8sRUFDTCxTQUFTLEVBRVQsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsUUFBUSxFQUNSLEtBQUssRUFFTCxRQUFRLEVBRVIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFFTCxrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsTUFBTSxFQUdOLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFDTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUVoQixrQkFBa0IsR0FDbkIsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRSxPQUFPLEVBQUMsU0FBUyxFQUEyQixNQUFNLHdCQUF3QixDQUFDO0FBQzNFLE9BQU8sRUFBZSxzQkFBc0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDOzs7O0FBcUI3RTs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLGNBQWMsQ0FDM0QsNkJBQTZCLENBQzlCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQ2UseUJBQ2IsU0FBUSxzQkFBb0M7SUFlNUMsNERBQTREO0lBQzVELElBQ0ksaUJBQWlCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztJQUN6QyxDQUFDO0lBQ0QsSUFBSSxpQkFBaUIsQ0FBQyxLQUF3QjtRQUM1QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUMxQyxDQUFDO0lBRUQsOENBQThDO0lBQzlDLElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsSUFBSSxVQUFVLENBQUMsS0FBYztRQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUM3QyxDQUFDO0lBRUQsWUFDOEMsV0FBdUMsRUFDbkUsV0FBeUMsRUFDbEQseUJBQTRDLEVBQzNDLFNBQW1CLEVBQ1IsV0FBbUIsRUFDbkIsZ0JBQW9DLEVBQzNDLFdBQTJCLEVBQ0QsV0FBMkI7UUFFakUsS0FBSyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFURCxnQkFBVyxHQUFYLFdBQVcsQ0FBNEI7UUFDbkUsZ0JBQVcsR0FBWCxXQUFXLENBQThCO1FBQ2xELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBbUI7UUFDM0MsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNSLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0I7UUExQnRDLFNBQUksR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUErQmpFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixDQUM5QyxJQUFJLENBQUMseUJBQXlCLEVBQzlCLElBQUksRUFDSixJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQyxXQUFXLEVBQ2hCLElBQUksQ0FBQyxZQUFZLENBQ2xCLENBQUM7SUFDSixDQUFDO0lBRUQsUUFBUTtRQUNOLGdHQUFnRztRQUNoRyw0RkFBNEY7UUFDNUYsK0ZBQStGO1FBQy9GLHlGQUF5RjtRQUN6RixzRkFBc0Y7UUFDdEYsZ0NBQWdDO1FBQ2hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRXBGLElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixzRkFBc0Y7WUFDdEYsdUZBQXVGO1lBQ3ZGLDZGQUE2RjtZQUM3RixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMxQixDQUFDO0lBQ0gsQ0FBQztJQUVELHVDQUF1QztJQUN2QyxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztJQUNwRCxDQUFDO0lBRUQseUJBQXlCO0lBQ3pCLEtBQUs7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsMEVBQTBFO0lBQzFFLGNBQWM7UUFDWixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUN4RCxDQUFDO0lBRUQsOENBQThDO0lBQzlDLGdCQUFnQjtRQUNkLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFRCxtREFBbUQ7SUFDMUMsUUFBUSxDQUFDLEtBQWE7UUFDN0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFDN0MsQ0FBQztJQUVELHNEQUFzRDtJQUM1QyxVQUFVO1FBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztJQUM5QixDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0lBQzlCLENBQUM7SUFFRCwwREFBMEQ7SUFDaEQsY0FBYztRQUN0QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO0lBQ3JDLENBQUM7SUFFa0IsZUFBZTtRQUNoQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDO0lBQ3pDLENBQUM7SUFFUyx3QkFBd0IsQ0FBQyxFQUFDLE1BQU0sRUFBeUM7UUFDakYsT0FBTyxNQUFNLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO0lBQzFGLENBQUM7SUFFa0IsNEJBQTRCLENBQUMsS0FBZTtRQUM3RCxLQUFLLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsQ0FDZixJQUFJLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXO1lBQ25DLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVM7WUFDNUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUNXLENBQUM7UUFDOUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELDJEQUEyRDtJQUMzRCxrQkFBa0I7UUFDaEIsT0FBTywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7cUhBdkpZLHlCQUF5QixrQkFrQzVCLDJCQUEyQixtT0FPZixnQkFBZ0I7eUdBekN6Qix5QkFBeUI7O2tHQUF6Qix5QkFBeUI7a0JBRHZDLFNBQVM7bUJBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDOzswQkFtQ3hCLE1BQU07MkJBQUMsMkJBQTJCOzswQkFJbEMsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxnQkFBZ0I7eUNBdkJsQyxpQkFBaUI7c0JBRHBCLEtBQUs7O0FBeUlSLHFFQUFxRTtBQTJCckUsTUFBTSxPQUFPLFlBQWdCLFNBQVEseUJBQTRCO0lBWS9ELFlBQ3VDLFVBQXNDLEVBQzNFLFVBQXdDLEVBQ3hDLHdCQUEyQyxFQUMzQyxRQUFrQixFQUNOLFVBQWtCLEVBQ2xCLGVBQW1DLEVBQ25DLFdBQTJCLEVBQ0QsV0FBMkI7UUFFakUsS0FBSyxDQUNILFVBQVUsRUFDVixVQUFVLEVBQ1Ysd0JBQXdCLEVBQ3hCLFFBQVEsRUFDUixVQUFVLEVBQ1YsZUFBZSxFQUNmLFdBQVcsRUFDWCxXQUFXLENBQ1osQ0FBQztRQTlCSiwwRUFBMEU7UUFDbEUsb0JBQWUsR0FBZ0IsQ0FBQyxPQUF3QixFQUEyQixFQUFFO1lBQzNGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FDN0MsQ0FBQztZQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzNELE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3JFLENBQUMsQ0FBQyxJQUFJO2dCQUNOLENBQUMsQ0FBQyxFQUFDLHFCQUFxQixFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDLEVBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUM7UUF3QlEsZUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUY3RixDQUFDO0lBSVMsa0JBQWtCLENBQUMsVUFBd0I7UUFDbkQsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFa0Isd0JBQXdCLENBQ3pDLE1BQThDO1FBRTlDLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUM1QyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSztnQkFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUs7Z0JBQzFCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSztvQkFDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkYsQ0FBQztJQUNILENBQUM7SUFFUyxtQkFBbUIsQ0FBQyxLQUFlO1FBQzNDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hCLE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNILENBQUM7SUFFa0IsWUFBWSxDQUFDLEtBQWU7UUFDN0MsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixzRUFBc0U7UUFDdEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFUSxVQUFVLENBQUMsS0FBb0I7UUFDdEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFDL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEtBQUssS0FBSyxDQUFDO1FBRXpDLG9FQUFvRTtRQUNwRSw2REFBNkQ7UUFDN0QsSUFDRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxXQUFXLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLFVBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RGLE9BQU8sQ0FBQyxjQUFjLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQy9DLE9BQU8sQ0FBQyxZQUFZLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQzdDLENBQUM7WUFDRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNELFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQixDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7cUhBckZVLFlBQVksa0JBYWIsMkJBQTJCLG1PQU9mLGdCQUFnQjt5R0FwQjNCLFlBQVksc3hCQVRaO1lBQ1QsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1lBQ3BFLEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7U0FDakU7O2tHQU1VLFlBQVk7a0JBMUJ4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsMkNBQTJDO3dCQUNwRCxZQUFZLEVBQUUsVUFBVTt3QkFDeEIsU0FBUyxFQUFFLCtCQUErQjt3QkFDMUMsVUFBVSxFQUFFLGFBQWE7d0JBQ3pCLFdBQVcsRUFBRSxvQkFBb0I7d0JBQ2pDLHNCQUFzQixFQUFFLDJDQUEyQzt3QkFDbkUsa0JBQWtCLEVBQUU7O2tGQUUwRDt3QkFDOUUsWUFBWSxFQUFFLDhEQUE4RDt3QkFDNUUsWUFBWSxFQUFFLDhEQUE4RDt3QkFDNUUsUUFBUSxFQUFFLFdBQVc7d0JBQ3JCLE1BQU0sRUFBRSxNQUFNO3FCQUNmO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLGNBQWMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO3dCQUNwRSxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxjQUFjLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztxQkFDakU7b0JBQ0Qsc0VBQXNFO29CQUN0RSx3REFBd0Q7b0JBQ3hELE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7b0JBQ3BDLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBY0ksTUFBTTsyQkFBQywyQkFBMkI7OzBCQUlsQyxRQUFROzswQkFDUixRQUFROzswQkFDUixRQUFROzswQkFDUixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGdCQUFnQjs7QUFvRXhDLG1FQUFtRTtBQTJCbkUsTUFBTSxPQUFPLFVBQWMsU0FBUSx5QkFBNEI7SUFVN0QsWUFDdUMsVUFBc0MsRUFDM0UsVUFBd0MsRUFDeEMsd0JBQTJDLEVBQzNDLFFBQWtCLEVBQ04sVUFBa0IsRUFDbEIsZUFBbUMsRUFDbkMsV0FBMkIsRUFDRCxXQUEyQjtRQUVqRSxLQUFLLENBQ0gsVUFBVSxFQUNWLFVBQVUsRUFDVix3QkFBd0IsRUFDeEIsUUFBUSxFQUNSLFVBQVUsRUFDVixlQUFlLEVBQ2YsV0FBVyxFQUNYLFdBQVcsQ0FDWixDQUFDO1FBNUJKLDJFQUEyRTtRQUNuRSxrQkFBYSxHQUFnQixDQUFDLE9BQXdCLEVBQTJCLEVBQUU7WUFDekYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMvRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMvRCxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNyRSxDQUFDLENBQUMsSUFBSTtnQkFDTixDQUFDLENBQUMsRUFBQyxtQkFBbUIsRUFBRSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBQyxFQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDO1FBd0JRLGVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFGM0YsQ0FBQztJQUlTLGtCQUFrQixDQUFDLFVBQXdCO1FBQ25ELE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQztJQUN4QixDQUFDO0lBRWtCLHdCQUF3QixDQUN6QyxNQUE4QztRQUU5QyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDNUMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUc7Z0JBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHO2dCQUN4QixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUc7b0JBQ25CLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25GLENBQUM7SUFDSCxDQUFDO0lBRVMsbUJBQW1CLENBQUMsS0FBZTtRQUMzQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDSCxDQUFDO0lBRU8sMkJBQTJCO1FBQ2pDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFDMUUsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUUvQixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckIsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVRLFVBQVUsQ0FBQyxLQUFvQjtRQUN0QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssS0FBSyxLQUFLLENBQUM7UUFFekMseUZBQXlGO1FBQ3pGLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDckMsQ0FBQztRQUNELHFFQUFxRTtRQUNyRSw2REFBNkQ7YUFDeEQsSUFDSCxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RGLE9BQU8sQ0FBQyxjQUFjLEtBQUssQ0FBQztZQUM1QixPQUFPLENBQUMsWUFBWSxLQUFLLENBQUMsRUFDMUIsQ0FBQztZQUNELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNyQyxDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7cUhBekZVLFVBQVUsa0JBV1gsMkJBQTJCLG1PQU9mLGdCQUFnQjt5R0FsQjNCLFVBQVUsa3hCQVRWO1lBQ1QsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO1lBQ2xFLEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7U0FDL0Q7O2tHQU1VLFVBQVU7a0JBMUJ0QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUseUNBQXlDO3dCQUNsRCxZQUFZLEVBQUUsVUFBVTt3QkFDeEIsU0FBUyxFQUFFLCtCQUErQjt3QkFDMUMsVUFBVSxFQUFFLGFBQWE7d0JBQ3pCLFdBQVcsRUFBRSxvQkFBb0I7d0JBQ2pDLHNCQUFzQixFQUFFLDJDQUEyQzt3QkFDbkUsa0JBQWtCLEVBQUU7O2tGQUUwRDt3QkFDOUUsWUFBWSxFQUFFLDhEQUE4RDt3QkFDNUUsWUFBWSxFQUFFLDhEQUE4RDt3QkFDNUUsUUFBUSxFQUFFLFdBQVc7d0JBQ3JCLE1BQU0sRUFBRSxNQUFNO3FCQUNmO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO3dCQUNsRSxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztxQkFDL0Q7b0JBQ0Qsc0VBQXNFO29CQUN0RSx3REFBd0Q7b0JBQ3hELE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7b0JBQ3BDLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBWUksTUFBTTsyQkFBQywyQkFBMkI7OzBCQUlsQyxRQUFROzswQkFDUixRQUFROzswQkFDUixRQUFROzswQkFDUixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0JBQ0tTUEFDRSwgTEVGVF9BUlJPVywgUklHSFRfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgU2lnbmFsLFxuICBpbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQWJzdHJhY3RDb250cm9sLFxuICBGb3JtR3JvdXBEaXJlY3RpdmUsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBOZ0NvbnRyb2wsXG4gIE5nRm9ybSxcbiAgVmFsaWRhdGlvbkVycm9ycyxcbiAgVmFsaWRhdG9yRm4sXG4gIFZhbGlkYXRvcnMsXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7XG4gIERhdGVBZGFwdGVyLFxuICBFcnJvclN0YXRlTWF0Y2hlcixcbiAgTUFUX0RBVEVfRk9STUFUUyxcbiAgTWF0RGF0ZUZvcm1hdHMsXG4gIF9FcnJvclN0YXRlVHJhY2tlcixcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge19jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lfSBmcm9tICcuL2FyaWEtYWNjZXNzaWJsZS1uYW1lJztcbmltcG9ydCB7RGF0ZVJhbmdlLCBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2V9IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuaW1wb3J0IHtEYXRlRmlsdGVyRm4sIE1hdERhdGVwaWNrZXJJbnB1dEJhc2V9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dC1iYXNlJztcblxuLyoqIFBhcmVudCBjb21wb25lbnQgdGhhdCBzaG91bGQgYmUgd3JhcHBlZCBhcm91bmQgYE1hdFN0YXJ0RGF0ZWAgYW5kIGBNYXRFbmREYXRlYC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0RGF0ZVJhbmdlSW5wdXRQYXJlbnQ8RD4ge1xuICBpZDogc3RyaW5nO1xuICBtaW46IEQgfCBudWxsO1xuICBtYXg6IEQgfCBudWxsO1xuICBkYXRlRmlsdGVyOiBEYXRlRmlsdGVyRm48RD47XG4gIHJhbmdlUGlja2VyOiB7XG4gICAgb3BlbmVkOiBib29sZWFuO1xuICAgIGlkOiBzdHJpbmc7XG4gIH07XG4gIC8vIEBicmVha2luZy1jaGFuZ2UgMjAuMC4wIHByb3BlcnR5IHRvIGJlY29tZSByZXF1aXJlZC5cbiAgX2FyaWFPd25zPzogU2lnbmFsPHN0cmluZyB8IG51bGw+O1xuICBfc3RhcnRJbnB1dDogTWF0RGF0ZVJhbmdlSW5wdXRQYXJ0QmFzZTxEPjtcbiAgX2VuZElucHV0OiBNYXREYXRlUmFuZ2VJbnB1dFBhcnRCYXNlPEQ+O1xuICBfZ3JvdXBEaXNhYmxlZDogYm9vbGVhbjtcbiAgX2hhbmRsZUNoaWxkVmFsdWVDaGFuZ2UoKTogdm9pZDtcbiAgX29wZW5EYXRlcGlja2VyKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogVXNlZCB0byBwcm92aWRlIHRoZSBkYXRlIHJhbmdlIGlucHV0IHdyYXBwZXIgY29tcG9uZW50XG4gKiB0byB0aGUgcGFydHMgd2l0aG91dCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0RGF0ZVJhbmdlSW5wdXRQYXJlbnQ8dW5rbm93bj4+KFxuICAnTUFUX0RBVEVfUkFOR0VfSU5QVVRfUEFSRU5UJyxcbik7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgdGhlIGluZGl2aWR1YWwgaW5wdXRzIHRoYXQgY2FuIGJlIHByb2plY3RlZCBpbnNpZGUgYSBgbWF0LWRhdGUtcmFuZ2UtaW5wdXRgLlxuICovXG5ARGlyZWN0aXZlKHtzdGFuZGFsb25lOiB0cnVlfSlcbmFic3RyYWN0IGNsYXNzIE1hdERhdGVSYW5nZUlucHV0UGFydEJhc2U8RD5cbiAgZXh0ZW5kcyBNYXREYXRlcGlja2VySW5wdXRCYXNlPERhdGVSYW5nZTxEPj5cbiAgaW1wbGVtZW50cyBPbkluaXQsIERvQ2hlY2tcbntcbiAgLyoqXG4gICAqIEZvcm0gY29udHJvbCBib3VuZCB0byB0aGlzIGlucHV0IHBhcnQuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIG5nQ29udHJvbDogTmdDb250cm9sO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBvdmVycmlkZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiB8IG51bGw7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBvdmVycmlkZSBfYXNzaWduVmFsdWVUb01vZGVsKHZhbHVlOiBEIHwgbnVsbCk6IHZvaWQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBvdmVycmlkZSBfZ2V0VmFsdWVGcm9tTW9kZWwobW9kZWxWYWx1ZTogRGF0ZVJhbmdlPEQ+KTogRCB8IG51bGw7XG4gIHByb3RlY3RlZCByZWFkb25seSBfZGlyID0gaW5qZWN0KERpcmVjdGlvbmFsaXR5LCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgcHJpdmF0ZSBfZXJyb3JTdGF0ZVRyYWNrZXI6IF9FcnJvclN0YXRlVHJhY2tlcjtcblxuICAvKiogT2JqZWN0IHVzZWQgdG8gY29udHJvbCB3aGVuIGVycm9yIG1lc3NhZ2VzIGFyZSBzaG93bi4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGVycm9yU3RhdGVNYXRjaGVyKCkge1xuICAgIHJldHVybiB0aGlzLl9lcnJvclN0YXRlVHJhY2tlci5tYXRjaGVyO1xuICB9XG4gIHNldCBlcnJvclN0YXRlTWF0Y2hlcih2YWx1ZTogRXJyb3JTdGF0ZU1hdGNoZXIpIHtcbiAgICB0aGlzLl9lcnJvclN0YXRlVHJhY2tlci5tYXRjaGVyID0gdmFsdWU7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgaW5wdXQgaXMgaW4gYW4gZXJyb3Igc3RhdGUuICovXG4gIGdldCBlcnJvclN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9lcnJvclN0YXRlVHJhY2tlci5lcnJvclN0YXRlO1xuICB9XG4gIHNldCBlcnJvclN0YXRlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZXJyb3JTdGF0ZVRyYWNrZXIuZXJyb3JTdGF0ZSA9IHZhbHVlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQpIHB1YmxpYyBfcmFuZ2VJbnB1dDogTWF0RGF0ZVJhbmdlSW5wdXRQYXJlbnQ8RD4sXG4gICAgcHVibGljIG92ZXJyaWRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxuICAgIHB1YmxpYyBfZGVmYXVsdEVycm9yU3RhdGVNYXRjaGVyOiBFcnJvclN0YXRlTWF0Y2hlcixcbiAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgQE9wdGlvbmFsKCkgcHVibGljIF9wYXJlbnRGb3JtOiBOZ0Zvcm0sXG4gICAgQE9wdGlvbmFsKCkgcHVibGljIF9wYXJlbnRGb3JtR3JvdXA6IEZvcm1Hcm91cERpcmVjdGl2ZSxcbiAgICBAT3B0aW9uYWwoKSBkYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfREFURV9GT1JNQVRTKSBkYXRlRm9ybWF0czogTWF0RGF0ZUZvcm1hdHMsXG4gICkge1xuICAgIHN1cGVyKF9lbGVtZW50UmVmLCBkYXRlQWRhcHRlciwgZGF0ZUZvcm1hdHMpO1xuICAgIHRoaXMuX2Vycm9yU3RhdGVUcmFja2VyID0gbmV3IF9FcnJvclN0YXRlVHJhY2tlcihcbiAgICAgIHRoaXMuX2RlZmF1bHRFcnJvclN0YXRlTWF0Y2hlcixcbiAgICAgIG51bGwsXG4gICAgICB0aGlzLl9wYXJlbnRGb3JtR3JvdXAsXG4gICAgICB0aGlzLl9wYXJlbnRGb3JtLFxuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMsXG4gICAgKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIFdlIG5lZWQgdGhlIGRhdGUgaW5wdXQgdG8gcHJvdmlkZSBpdHNlbGYgYXMgYSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGFuZCBhIGBWYWxpZGF0b3JgLCB3aGlsZVxuICAgIC8vIGluamVjdGluZyBpdHMgYE5nQ29udHJvbGAgc28gdGhhdCB0aGUgZXJyb3Igc3RhdGUgaXMgaGFuZGxlZCBjb3JyZWN0bHkuIFRoaXMgaW50cm9kdWNlcyBhXG4gICAgLy8gY2lyY3VsYXIgZGVwZW5kZW5jeSwgYmVjYXVzZSBib3RoIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgYW5kIGBWYWxpZGF0b3JgIGRlcGVuZCBvbiB0aGUgaW5wdXRcbiAgICAvLyBpdHNlbGYuIFVzdWFsbHkgd2UgY2FuIHdvcmsgYXJvdW5kIGl0IGZvciB0aGUgQ1ZBLCBidXQgdGhlcmUncyBubyBBUEkgdG8gZG8gaXQgZm9yIHRoZVxuICAgIC8vIHZhbGlkYXRvci4gV2Ugd29yayBhcm91bmQgaXQgaGVyZSBieSBpbmplY3RpbmcgdGhlIGBOZ0NvbnRyb2xgIGluIGBuZ09uSW5pdGAsIGFmdGVyXG4gICAgLy8gZXZlcnl0aGluZyBoYXMgYmVlbiByZXNvbHZlZC5cbiAgICBjb25zdCBuZ0NvbnRyb2wgPSB0aGlzLl9pbmplY3Rvci5nZXQoTmdDb250cm9sLCBudWxsLCB7b3B0aW9uYWw6IHRydWUsIHNlbGY6IHRydWV9KTtcblxuICAgIGlmIChuZ0NvbnRyb2wpIHtcbiAgICAgIHRoaXMubmdDb250cm9sID0gbmdDb250cm9sO1xuICAgICAgdGhpcy5fZXJyb3JTdGF0ZVRyYWNrZXIubmdDb250cm9sID0gbmdDb250cm9sO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAodGhpcy5uZ0NvbnRyb2wpIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gcmUtZXZhbHVhdGUgdGhpcyBvbiBldmVyeSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlLCBiZWNhdXNlIHRoZXJlIGFyZSBzb21lXG4gICAgICAvLyBlcnJvciB0cmlnZ2VycyB0aGF0IHdlIGNhbid0IHN1YnNjcmliZSB0byAoZS5nLiBwYXJlbnQgZm9ybSBzdWJtaXNzaW9ucykuIFRoaXMgbWVhbnNcbiAgICAgIC8vIHRoYXQgd2hhdGV2ZXIgbG9naWMgaXMgaW4gaGVyZSBoYXMgdG8gYmUgc3VwZXIgbGVhbiBvciB3ZSByaXNrIGRlc3Ryb3lpbmcgdGhlIHBlcmZvcm1hbmNlLlxuICAgICAgdGhpcy51cGRhdGVFcnJvclN0YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgaW5wdXQgaXMgZW1wdHkuICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZS5sZW5ndGggPT09IDA7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcGxhY2Vob2xkZXIgb2YgdGhlIGlucHV0LiAqL1xuICBfZ2V0UGxhY2Vob2xkZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5wbGFjZWhvbGRlcjtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBpbnB1dC4gKi9cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIG1pcnJvcmluZyB0aGUgaW5wdXQncyBzaXplLiAqL1xuICBnZXRNaXJyb3JWYWx1ZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPiAwID8gdmFsdWUgOiBlbGVtZW50LnBsYWNlaG9sZGVyO1xuICB9XG5cbiAgLyoqIFJlZnJlc2hlcyB0aGUgZXJyb3Igc3RhdGUgb2YgdGhlIGlucHV0LiAqL1xuICB1cGRhdGVFcnJvclN0YXRlKCkge1xuICAgIHRoaXMuX2Vycm9yU3RhdGVUcmFja2VyLnVwZGF0ZUVycm9yU3RhdGUoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGBpbnB1dGAgZXZlbnRzIG9uIHRoZSBpbnB1dCBlbGVtZW50LiAqL1xuICBvdmVycmlkZSBfb25JbnB1dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgc3VwZXIuX29uSW5wdXQodmFsdWUpO1xuICAgIHRoaXMuX3JhbmdlSW5wdXQuX2hhbmRsZUNoaWxkVmFsdWVDaGFuZ2UoKTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgZGF0ZXBpY2tlciBhc3NvY2lhdGVkIHdpdGggdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgX29wZW5Qb3B1cCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yYW5nZUlucHV0Ll9vcGVuRGF0ZXBpY2tlcigpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1pbmltdW0gZGF0ZSBmcm9tIHRoZSByYW5nZSBpbnB1dC4gKi9cbiAgX2dldE1pbkRhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhbmdlSW5wdXQubWluO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1heGltdW0gZGF0ZSBmcm9tIHRoZSByYW5nZSBpbnB1dC4gKi9cbiAgX2dldE1heERhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhbmdlSW5wdXQubWF4O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRhdGUgZmlsdGVyIGZ1bmN0aW9uIGZyb20gdGhlIHJhbmdlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgX2dldERhdGVGaWx0ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhbmdlSW5wdXQuZGF0ZUZpbHRlcjtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfcGFyZW50RGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhbmdlSW5wdXQuX2dyb3VwRGlzYWJsZWQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KHtzb3VyY2V9OiBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8RGF0ZVJhbmdlPEQ+Pik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzb3VyY2UgIT09IHRoaXMuX3JhbmdlSW5wdXQuX3N0YXJ0SW5wdXQgJiYgc291cmNlICE9PSB0aGlzLl9yYW5nZUlucHV0Ll9lbmRJbnB1dDtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHN1cGVyLl9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodmFsdWUpO1xuICAgIGNvbnN0IG9wcG9zaXRlID0gKFxuICAgICAgdGhpcyA9PT0gdGhpcy5fcmFuZ2VJbnB1dC5fc3RhcnRJbnB1dFxuICAgICAgICA/IHRoaXMuX3JhbmdlSW5wdXQuX2VuZElucHV0XG4gICAgICAgIDogdGhpcy5fcmFuZ2VJbnB1dC5fc3RhcnRJbnB1dFxuICAgICkgYXMgTWF0RGF0ZVJhbmdlSW5wdXRQYXJ0QmFzZTxEPiB8IHVuZGVmaW5lZDtcbiAgICBvcHBvc2l0ZT8uX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gIH1cblxuICAvKiogcmV0dXJuIHRoZSBBUklBIGFjY2Vzc2libGUgbmFtZSBvZiB0aGUgaW5wdXQgZWxlbWVudCAqL1xuICBfZ2V0QWNjZXNzaWJsZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgfVxufVxuXG4vKiogSW5wdXQgZm9yIGVudGVyaW5nIHRoZSBzdGFydCBkYXRlIGluIGEgYG1hdC1kYXRlLXJhbmdlLWlucHV0YC4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2lucHV0W21hdFN0YXJ0RGF0ZV0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1zdGFydC1kYXRlIG1hdC1kYXRlLXJhbmdlLWlucHV0LWlubmVyJyxcbiAgICAnW2Rpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJyhpbnB1dCknOiAnX29uSW5wdXQoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoY2hhbmdlKSc6ICdfb25DaGFuZ2UoKScsXG4gICAgJyhrZXlkb3duKSc6ICdfb25LZXlkb3duKCRldmVudCknLFxuICAgICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICdfcmFuZ2VJbnB1dC5yYW5nZVBpY2tlciA/IFwiZGlhbG9nXCIgOiBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1vd25zXSc6IGBfcmFuZ2VJbnB1dC5fYXJpYU93bnNcbiAgICAgICAgPyBfcmFuZ2VJbnB1dC5fYXJpYU93bnMoKVxuICAgICAgICA6IChfcmFuZ2VJbnB1dC5yYW5nZVBpY2tlcj8ub3BlbmVkICYmIF9yYW5nZUlucHV0LnJhbmdlUGlja2VyLmlkKSB8fCBudWxsYCxcbiAgICAnW2F0dHIubWluXSc6ICdfZ2V0TWluRGF0ZSgpID8gX2RhdGVBZGFwdGVyLnRvSXNvODYwMShfZ2V0TWluRGF0ZSgpKSA6IG51bGwnLFxuICAgICdbYXR0ci5tYXhdJzogJ19nZXRNYXhEYXRlKCkgPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKF9nZXRNYXhEYXRlKCkpIDogbnVsbCcsXG4gICAgJyhibHVyKSc6ICdfb25CbHVyKCknLFxuICAgICd0eXBlJzogJ3RleHQnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsIHVzZUV4aXN0aW5nOiBNYXRTdGFydERhdGUsIG11bHRpOiB0cnVlfSxcbiAgICB7cHJvdmlkZTogTkdfVkFMSURBVE9SUywgdXNlRXhpc3Rpbmc6IE1hdFN0YXJ0RGF0ZSwgbXVsdGk6IHRydWV9LFxuICBdLFxuICAvLyBUaGVzZSBuZWVkIHRvIGJlIHNwZWNpZmllZCBleHBsaWNpdGx5LCBiZWNhdXNlIHNvbWUgdG9vbGluZyBkb2Vzbid0XG4gIC8vIHNlZW0gdG8gcGljayB0aGVtIHVwIGZyb20gdGhlIGJhc2UgY2xhc3MuIFNlZSAjMjA5MzIuXG4gIG91dHB1dHM6IFsnZGF0ZUNoYW5nZScsICdkYXRlSW5wdXQnXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U3RhcnREYXRlPEQ+IGV4dGVuZHMgTWF0RGF0ZVJhbmdlSW5wdXRQYXJ0QmFzZTxEPiB7XG4gIC8qKiBWYWxpZGF0b3IgdGhhdCBjaGVja3MgdGhhdCB0aGUgc3RhcnQgZGF0ZSBpc24ndCBhZnRlciB0aGUgZW5kIGRhdGUuICovXG4gIHByaXZhdGUgX3N0YXJ0VmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKSxcbiAgICApO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMuX21vZGVsID8gdGhpcy5fbW9kZWwuc2VsZWN0aW9uLmVuZCA6IG51bGw7XG4gICAgcmV0dXJuICFzdGFydCB8fCAhZW5kIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKHN0YXJ0LCBlbmQpIDw9IDBcbiAgICAgID8gbnVsbFxuICAgICAgOiB7J21hdFN0YXJ0RGF0ZUludmFsaWQnOiB7J2VuZCc6IGVuZCwgJ2FjdHVhbCc6IHN0YXJ0fX07XG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQpIHJhbmdlSW5wdXQ6IE1hdERhdGVSYW5nZUlucHV0UGFyZW50PEQ+LFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTElucHV0RWxlbWVudD4sXG4gICAgZGVmYXVsdEVycm9yU3RhdGVNYXRjaGVyOiBFcnJvclN0YXRlTWF0Y2hlcixcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgQE9wdGlvbmFsKCkgcGFyZW50Rm9ybTogTmdGb3JtLFxuICAgIEBPcHRpb25hbCgpIHBhcmVudEZvcm1Hcm91cDogRm9ybUdyb3VwRGlyZWN0aXZlLFxuICAgIEBPcHRpb25hbCgpIGRhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9EQVRFX0ZPUk1BVFMpIGRhdGVGb3JtYXRzOiBNYXREYXRlRm9ybWF0cyxcbiAgKSB7XG4gICAgc3VwZXIoXG4gICAgICByYW5nZUlucHV0LFxuICAgICAgZWxlbWVudFJlZixcbiAgICAgIGRlZmF1bHRFcnJvclN0YXRlTWF0Y2hlcixcbiAgICAgIGluamVjdG9yLFxuICAgICAgcGFyZW50Rm9ybSxcbiAgICAgIHBhcmVudEZvcm1Hcm91cCxcbiAgICAgIGRhdGVBZGFwdGVyLFxuICAgICAgZGF0ZUZvcm1hdHMsXG4gICAgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5jb21wb3NlKFsuLi5zdXBlci5fZ2V0VmFsaWRhdG9ycygpLCB0aGlzLl9zdGFydFZhbGlkYXRvcl0pO1xuXG4gIHByb3RlY3RlZCBfZ2V0VmFsdWVGcm9tTW9kZWwobW9kZWxWYWx1ZTogRGF0ZVJhbmdlPEQ+KSB7XG4gICAgcmV0dXJuIG1vZGVsVmFsdWUuc3RhcnQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KFxuICAgIGNoYW5nZTogRGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPERhdGVSYW5nZTxEPj4sXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmICghc3VwZXIuX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGNoYW5nZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICFjaGFuZ2Uub2xkVmFsdWU/LnN0YXJ0XG4gICAgICAgID8gISFjaGFuZ2Uuc2VsZWN0aW9uLnN0YXJ0XG4gICAgICAgIDogIWNoYW5nZS5zZWxlY3Rpb24uc3RhcnQgfHxcbiAgICAgICAgICAgICEhdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoY2hhbmdlLm9sZFZhbHVlLnN0YXJ0LCBjaGFuZ2Uuc2VsZWN0aW9uLnN0YXJ0KTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgX2Fzc2lnblZhbHVlVG9Nb2RlbCh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gbmV3IERhdGVSYW5nZSh2YWx1ZSwgdGhpcy5fbW9kZWwuc2VsZWN0aW9uLmVuZCk7XG4gICAgICB0aGlzLl9tb2RlbC51cGRhdGVTZWxlY3Rpb24ocmFuZ2UsIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfZm9ybWF0VmFsdWUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgc3VwZXIuX2Zvcm1hdFZhbHVlKHZhbHVlKTtcblxuICAgIC8vIEFueSB0aW1lIHRoZSBpbnB1dCB2YWx1ZSBpcyByZWZvcm1hdHRlZCB3ZSBuZWVkIHRvIHRlbGwgdGhlIHBhcmVudC5cbiAgICB0aGlzLl9yYW5nZUlucHV0Ll9oYW5kbGVDaGlsZFZhbHVlQ2hhbmdlKCk7XG4gIH1cblxuICBvdmVycmlkZSBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3QgZW5kSW5wdXQgPSB0aGlzLl9yYW5nZUlucHV0Ll9lbmRJbnB1dDtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGlzTHRyID0gdGhpcy5fZGlyPy52YWx1ZSAhPT0gJ3J0bCc7XG5cbiAgICAvLyBJZiB0aGUgdXNlciBoaXRzIFJJR0hUIChMVFIpIHdoZW4gYXQgdGhlIGVuZCBvZiB0aGUgaW5wdXQgKGFuZCBub1xuICAgIC8vIHNlbGVjdGlvbiksIG1vdmUgdGhlIGN1cnNvciB0byB0aGUgc3RhcnQgb2YgdGhlIGVuZCBpbnB1dC5cbiAgICBpZiAoXG4gICAgICAoKGV2ZW50LmtleUNvZGUgPT09IFJJR0hUX0FSUk9XICYmIGlzTHRyKSB8fCAoZXZlbnQua2V5Q29kZSA9PT0gTEVGVF9BUlJPVyAmJiAhaXNMdHIpKSAmJlxuICAgICAgZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gZWxlbWVudC52YWx1ZS5sZW5ndGggJiZcbiAgICAgIGVsZW1lbnQuc2VsZWN0aW9uRW5kID09PSBlbGVtZW50LnZhbHVlLmxlbmd0aFxuICAgICkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGVuZElucHV0Ll9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgMCk7XG4gICAgICBlbmRJbnB1dC5mb2N1cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5fb25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIElucHV0IGZvciBlbnRlcmluZyB0aGUgZW5kIGRhdGUgaW4gYSBgbWF0LWRhdGUtcmFuZ2UtaW5wdXRgLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW5wdXRbbWF0RW5kRGF0ZV0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1lbmQtZGF0ZSBtYXQtZGF0ZS1yYW5nZS1pbnB1dC1pbm5lcicsXG4gICAgJ1tkaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICcoaW5wdXQpJzogJ19vbklucHV0KCRldmVudC50YXJnZXQudmFsdWUpJyxcbiAgICAnKGNoYW5nZSknOiAnX29uQ2hhbmdlKCknLFxuICAgICcoa2V5ZG93biknOiAnX29uS2V5ZG93bigkZXZlbnQpJyxcbiAgICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnX3JhbmdlSW5wdXQucmFuZ2VQaWNrZXIgPyBcImRpYWxvZ1wiIDogbnVsbCcsXG4gICAgJ1thdHRyLmFyaWEtb3duc10nOiBgX3JhbmdlSW5wdXQuX2FyaWFPd25zXG4gICAgICAgID8gX3JhbmdlSW5wdXQuX2FyaWFPd25zKClcbiAgICAgICAgOiAoX3JhbmdlSW5wdXQucmFuZ2VQaWNrZXI/Lm9wZW5lZCAmJiBfcmFuZ2VJbnB1dC5yYW5nZVBpY2tlci5pZCkgfHwgbnVsbGAsXG4gICAgJ1thdHRyLm1pbl0nOiAnX2dldE1pbkRhdGUoKSA/IF9kYXRlQWRhcHRlci50b0lzbzg2MDEoX2dldE1pbkRhdGUoKSkgOiBudWxsJyxcbiAgICAnW2F0dHIubWF4XSc6ICdfZ2V0TWF4RGF0ZSgpID8gX2RhdGVBZGFwdGVyLnRvSXNvODYwMShfZ2V0TWF4RGF0ZSgpKSA6IG51bGwnLFxuICAgICcoYmx1ciknOiAnX29uQmx1cigpJyxcbiAgICAndHlwZSc6ICd0ZXh0JyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLCB1c2VFeGlzdGluZzogTWF0RW5kRGF0ZSwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBOR19WQUxJREFUT1JTLCB1c2VFeGlzdGluZzogTWF0RW5kRGF0ZSwgbXVsdGk6IHRydWV9LFxuICBdLFxuICAvLyBUaGVzZSBuZWVkIHRvIGJlIHNwZWNpZmllZCBleHBsaWNpdGx5LCBiZWNhdXNlIHNvbWUgdG9vbGluZyBkb2Vzbid0XG4gIC8vIHNlZW0gdG8gcGljayB0aGVtIHVwIGZyb20gdGhlIGJhc2UgY2xhc3MuIFNlZSAjMjA5MzIuXG4gIG91dHB1dHM6IFsnZGF0ZUNoYW5nZScsICdkYXRlSW5wdXQnXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RW5kRGF0ZTxEPiBleHRlbmRzIE1hdERhdGVSYW5nZUlucHV0UGFydEJhc2U8RD4ge1xuICAvKiogVmFsaWRhdG9yIHRoYXQgY2hlY2tzIHRoYXQgdGhlIGVuZCBkYXRlIGlzbid0IGJlZm9yZSB0aGUgc3RhcnQgZGF0ZS4gKi9cbiAgcHJpdmF0ZSBfZW5kVmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgZW5kID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpKTtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuX21vZGVsID8gdGhpcy5fbW9kZWwuc2VsZWN0aW9uLnN0YXJ0IDogbnVsbDtcbiAgICByZXR1cm4gIWVuZCB8fCAhc3RhcnQgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoZW5kLCBzdGFydCkgPj0gMFxuICAgICAgPyBudWxsXG4gICAgICA6IHsnbWF0RW5kRGF0ZUludmFsaWQnOiB7J3N0YXJ0Jzogc3RhcnQsICdhY3R1YWwnOiBlbmR9fTtcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KE1BVF9EQVRFX1JBTkdFX0lOUFVUX1BBUkVOVCkgcmFuZ2VJbnB1dDogTWF0RGF0ZVJhbmdlSW5wdXRQYXJlbnQ8RD4sXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PixcbiAgICBkZWZhdWx0RXJyb3JTdGF0ZU1hdGNoZXI6IEVycm9yU3RhdGVNYXRjaGVyLFxuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBAT3B0aW9uYWwoKSBwYXJlbnRGb3JtOiBOZ0Zvcm0sXG4gICAgQE9wdGlvbmFsKCkgcGFyZW50Rm9ybUdyb3VwOiBGb3JtR3JvdXBEaXJlY3RpdmUsXG4gICAgQE9wdGlvbmFsKCkgZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX0RBVEVfRk9STUFUUykgZGF0ZUZvcm1hdHM6IE1hdERhdGVGb3JtYXRzLFxuICApIHtcbiAgICBzdXBlcihcbiAgICAgIHJhbmdlSW5wdXQsXG4gICAgICBlbGVtZW50UmVmLFxuICAgICAgZGVmYXVsdEVycm9yU3RhdGVNYXRjaGVyLFxuICAgICAgaW5qZWN0b3IsXG4gICAgICBwYXJlbnRGb3JtLFxuICAgICAgcGFyZW50Rm9ybUdyb3VwLFxuICAgICAgZGF0ZUFkYXB0ZXIsXG4gICAgICBkYXRlRm9ybWF0cyxcbiAgICApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF92YWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2UoWy4uLnN1cGVyLl9nZXRWYWxpZGF0b3JzKCksIHRoaXMuX2VuZFZhbGlkYXRvcl0pO1xuXG4gIHByb3RlY3RlZCBfZ2V0VmFsdWVGcm9tTW9kZWwobW9kZWxWYWx1ZTogRGF0ZVJhbmdlPEQ+KSB7XG4gICAgcmV0dXJuIG1vZGVsVmFsdWUuZW5kO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIF9zaG91bGRIYW5kbGVDaGFuZ2VFdmVudChcbiAgICBjaGFuZ2U6IERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxEYXRlUmFuZ2U8RD4+LFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoIXN1cGVyLl9zaG91bGRIYW5kbGVDaGFuZ2VFdmVudChjaGFuZ2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAhY2hhbmdlLm9sZFZhbHVlPy5lbmRcbiAgICAgICAgPyAhIWNoYW5nZS5zZWxlY3Rpb24uZW5kXG4gICAgICAgIDogIWNoYW5nZS5zZWxlY3Rpb24uZW5kIHx8XG4gICAgICAgICAgICAhIXRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKGNoYW5nZS5vbGRWYWx1ZS5lbmQsIGNoYW5nZS5zZWxlY3Rpb24uZW5kKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgX2Fzc2lnblZhbHVlVG9Nb2RlbCh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gbmV3IERhdGVSYW5nZSh0aGlzLl9tb2RlbC5zZWxlY3Rpb24uc3RhcnQsIHZhbHVlKTtcbiAgICAgIHRoaXMuX21vZGVsLnVwZGF0ZVNlbGVjdGlvbihyYW5nZSwgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbW92ZUNhcmV0VG9FbmRPZlN0YXJ0SW5wdXQoKSB7XG4gICAgY29uc3Qgc3RhcnRJbnB1dCA9IHRoaXMuX3JhbmdlSW5wdXQuX3N0YXJ0SW5wdXQuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCB2YWx1ZSA9IHN0YXJ0SW5wdXQudmFsdWU7XG5cbiAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgc3RhcnRJbnB1dC5zZXRTZWxlY3Rpb25SYW5nZSh2YWx1ZS5sZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgc3RhcnRJbnB1dC5mb2N1cygpO1xuICB9XG5cbiAgb3ZlcnJpZGUgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgaXNMdHIgPSB0aGlzLl9kaXI/LnZhbHVlICE9PSAncnRsJztcblxuICAgIC8vIElmIHRoZSB1c2VyIGlzIHByZXNzaW5nIGJhY2tzcGFjZSBvbiBhbiBlbXB0eSBlbmQgaW5wdXQsIG1vdmUgZm9jdXMgYmFjayB0byB0aGUgc3RhcnQuXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEJBQ0tTUEFDRSAmJiAhZWxlbWVudC52YWx1ZSkge1xuICAgICAgdGhpcy5fbW92ZUNhcmV0VG9FbmRPZlN0YXJ0SW5wdXQoKTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIHVzZXIgaGl0cyBMRUZUIChMVFIpIHdoZW4gYXQgdGhlIHN0YXJ0IG9mIHRoZSBpbnB1dCAoYW5kIG5vXG4gICAgLy8gc2VsZWN0aW9uKSwgbW92ZSB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHN0YXJ0IGlucHV0LlxuICAgIGVsc2UgaWYgKFxuICAgICAgKChldmVudC5rZXlDb2RlID09PSBMRUZUX0FSUk9XICYmIGlzTHRyKSB8fCAoZXZlbnQua2V5Q29kZSA9PT0gUklHSFRfQVJST1cgJiYgIWlzTHRyKSkgJiZcbiAgICAgIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09IDAgJiZcbiAgICAgIGVsZW1lbnQuc2VsZWN0aW9uRW5kID09PSAwXG4gICAgKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fbW92ZUNhcmV0VG9FbmRPZlN0YXJ0SW5wdXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuX29uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG59XG4iXX0=