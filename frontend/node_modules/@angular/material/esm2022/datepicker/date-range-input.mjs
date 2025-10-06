/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, Inject, Input, Optional, Self, ViewEncapsulation, booleanAttribute, signal, } from '@angular/core';
import { ControlContainer, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription, merge } from 'rxjs';
import { MAT_DATE_RANGE_INPUT_PARENT, MatEndDate, MatStartDate, } from './date-range-input-parts';
import { createMissingDateImplError } from './datepicker-errors';
import { dateInputsHaveChanged } from './datepicker-input-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/core";
let nextUniqueId = 0;
export class MatDateRangeInput {
    /** Current value of the range input. */
    get value() {
        return this._model ? this._model.selection : null;
    }
    /** Whether the control's label should float. */
    get shouldLabelFloat() {
        return this.focused || !this.empty;
    }
    /**
     * Implemented as a part of `MatFormFieldControl`.
     * Set the placeholder attribute on `matStartDate` and `matEndDate`.
     * @docs-private
     */
    get placeholder() {
        const start = this._startInput?._getPlaceholder() || '';
        const end = this._endInput?._getPlaceholder() || '';
        return start || end ? `${start} ${this.separator} ${end}` : '';
    }
    /** The range picker that this input is associated with. */
    get rangePicker() {
        return this._rangePicker;
    }
    set rangePicker(rangePicker) {
        if (rangePicker) {
            this._model = rangePicker.registerInput(this);
            this._rangePicker = rangePicker;
            this._closedSubscription.unsubscribe();
            this._openedSubscription.unsubscribe();
            this._ariaOwns.set(this.rangePicker.opened ? rangePicker.id : null);
            this._closedSubscription = rangePicker.closedStream.subscribe(() => {
                this._startInput?._onTouched();
                this._endInput?._onTouched();
                this._ariaOwns.set(null);
            });
            this._openedSubscription = rangePicker.openedStream.subscribe(() => {
                this._ariaOwns.set(rangePicker.id);
            });
            this._registerModel(this._model);
        }
    }
    /** Whether the input is required. */
    get required() {
        return (this._required ??
            (this._isTargetRequired(this) ||
                this._isTargetRequired(this._startInput) ||
                this._isTargetRequired(this._endInput)) ??
            false);
    }
    set required(value) {
        this._required = value;
    }
    /** Function that can be used to filter out dates within the date range picker. */
    get dateFilter() {
        return this._dateFilter;
    }
    set dateFilter(value) {
        const start = this._startInput;
        const end = this._endInput;
        const wasMatchingStart = start && start._matchesFilter(start.value);
        const wasMatchingEnd = end && end._matchesFilter(start.value);
        this._dateFilter = value;
        if (start && start._matchesFilter(start.value) !== wasMatchingStart) {
            start._validatorOnChange();
        }
        if (end && end._matchesFilter(end.value) !== wasMatchingEnd) {
            end._validatorOnChange();
        }
    }
    /** The minimum valid date. */
    get min() {
        return this._min;
    }
    set min(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._min)) {
            this._min = validValue;
            this._revalidate();
        }
    }
    /** The maximum valid date. */
    get max() {
        return this._max;
    }
    set max(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._max)) {
            this._max = validValue;
            this._revalidate();
        }
    }
    /** Whether the input is disabled. */
    get disabled() {
        return this._startInput && this._endInput
            ? this._startInput.disabled && this._endInput.disabled
            : this._groupDisabled;
    }
    set disabled(value) {
        if (value !== this._groupDisabled) {
            this._groupDisabled = value;
            this.stateChanges.next(undefined);
        }
    }
    /** Whether the input is in an error state. */
    get errorState() {
        if (this._startInput && this._endInput) {
            return this._startInput.errorState || this._endInput.errorState;
        }
        return false;
    }
    /** Whether the datepicker input is empty. */
    get empty() {
        const startEmpty = this._startInput ? this._startInput.isEmpty() : false;
        const endEmpty = this._endInput ? this._endInput.isEmpty() : false;
        return startEmpty && endEmpty;
    }
    constructor(_changeDetectorRef, _elementRef, control, _dateAdapter, _formField) {
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._dateAdapter = _dateAdapter;
        this._formField = _formField;
        this._closedSubscription = Subscription.EMPTY;
        this._openedSubscription = Subscription.EMPTY;
        /** Unique ID for the group. */
        this.id = `mat-date-range-input-${nextUniqueId++}`;
        /** Whether the control is focused. */
        this.focused = false;
        /** Name of the form control. */
        this.controlType = 'mat-date-range-input';
        /** The id of the panel owned by this input. */
        this._ariaOwns = signal(null);
        this._groupDisabled = false;
        /** Value for the `aria-describedby` attribute of the inputs. */
        this._ariaDescribedBy = null;
        /** Separator text to be shown between the inputs. */
        this.separator = '–';
        /** Start of the comparison range that should be shown in the calendar. */
        this.comparisonStart = null;
        /** End of the comparison range that should be shown in the calendar. */
        this.comparisonEnd = null;
        /** Emits when the input's state has changed. */
        this.stateChanges = new Subject();
        /**
         * Disable the automatic labeling to avoid issues like #27241.
         * @docs-private
         */
        this.disableAutomaticLabeling = true;
        if (!_dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw createMissingDateImplError('DateAdapter');
        }
        // The datepicker module can be used both with MDC and non-MDC form fields. We have
        // to conditionally add the MDC input class so that the range picker looks correctly.
        if (_formField?._elementRef.nativeElement.classList.contains('mat-mdc-form-field')) {
            _elementRef.nativeElement.classList.add('mat-mdc-input-element', 'mat-mdc-form-field-input-control', 'mdc-text-field__input');
        }
        // TODO(crisbeto): remove `as any` after #18206 lands.
        this.ngControl = control;
    }
    /**
     * Implemented as a part of `MatFormFieldControl`.
     * @docs-private
     */
    setDescribedByIds(ids) {
        this._ariaDescribedBy = ids.length ? ids.join(' ') : null;
    }
    /**
     * Implemented as a part of `MatFormFieldControl`.
     * @docs-private
     */
    onContainerClick() {
        if (!this.focused && !this.disabled) {
            if (!this._model || !this._model.selection.start) {
                this._startInput.focus();
            }
            else {
                this._endInput.focus();
            }
        }
    }
    ngAfterContentInit() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._startInput) {
                throw Error('mat-date-range-input must contain a matStartDate input');
            }
            if (!this._endInput) {
                throw Error('mat-date-range-input must contain a matEndDate input');
            }
        }
        if (this._model) {
            this._registerModel(this._model);
        }
        // We don't need to unsubscribe from this, because we
        // know that the input streams will be completed on destroy.
        merge(this._startInput.stateChanges, this._endInput.stateChanges).subscribe(() => {
            this.stateChanges.next(undefined);
        });
    }
    ngOnChanges(changes) {
        if (dateInputsHaveChanged(changes, this._dateAdapter)) {
            this.stateChanges.next(undefined);
        }
    }
    ngOnDestroy() {
        this._closedSubscription.unsubscribe();
        this._openedSubscription.unsubscribe();
        this.stateChanges.complete();
    }
    /** Gets the date at which the calendar should start. */
    getStartValue() {
        return this.value ? this.value.start : null;
    }
    /** Gets the input's theme palette. */
    getThemePalette() {
        return this._formField ? this._formField.color : undefined;
    }
    /** Gets the element to which the calendar overlay should be attached. */
    getConnectedOverlayOrigin() {
        return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
    }
    /** Gets the ID of an element that should be used a description for the calendar overlay. */
    getOverlayLabelId() {
        return this._formField ? this._formField.getLabelId() : null;
    }
    /** Gets the value that is used to mirror the state input. */
    _getInputMirrorValue(part) {
        const input = part === 'start' ? this._startInput : this._endInput;
        return input ? input.getMirrorValue() : '';
    }
    /** Whether the input placeholders should be hidden. */
    _shouldHidePlaceholders() {
        return this._startInput ? !this._startInput.isEmpty() : false;
    }
    /** Handles the value in one of the child inputs changing. */
    _handleChildValueChange() {
        this.stateChanges.next(undefined);
        this._changeDetectorRef.markForCheck();
    }
    /** Opens the date range picker associated with the input. */
    _openDatepicker() {
        if (this._rangePicker) {
            this._rangePicker.open();
        }
    }
    /** Whether the separate text should be hidden. */
    _shouldHideSeparator() {
        return ((!this._formField ||
            (this._formField.getLabelId() && !this._formField._shouldLabelFloat())) &&
            this.empty);
    }
    /** Gets the value for the `aria-labelledby` attribute of the inputs. */
    _getAriaLabelledby() {
        const formField = this._formField;
        return formField && formField._hasFloatingLabel() ? formField._labelId : null;
    }
    _getStartDateAccessibleName() {
        return this._startInput._getAccessibleName();
    }
    _getEndDateAccessibleName() {
        return this._endInput._getAccessibleName();
    }
    /** Updates the focused state of the range input. */
    _updateFocus(origin) {
        this.focused = origin !== null;
        this.stateChanges.next();
    }
    /** Re-runs the validators on the start/end inputs. */
    _revalidate() {
        if (this._startInput) {
            this._startInput._validatorOnChange();
        }
        if (this._endInput) {
            this._endInput._validatorOnChange();
        }
    }
    /** Registers the current date selection model with the start/end inputs. */
    _registerModel(model) {
        if (this._startInput) {
            this._startInput._registerModel(model);
        }
        if (this._endInput) {
            this._endInput._registerModel(model);
        }
    }
    /** Checks whether a specific range input directive is required. */
    _isTargetRequired(target) {
        return target?.ngControl?.control?.hasValidator(Validators.required);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateRangeInput, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.ControlContainer, optional: true, self: true }, { token: i2.DateAdapter, optional: true }, { token: MAT_FORM_FIELD, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatDateRangeInput, isStandalone: true, selector: "mat-date-range-input", inputs: { rangePicker: "rangePicker", required: ["required", "required", booleanAttribute], dateFilter: "dateFilter", min: "min", max: "max", disabled: ["disabled", "disabled", booleanAttribute], separator: "separator", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd" }, host: { attributes: { "role": "group" }, properties: { "class.mat-date-range-input-hide-placeholders": "_shouldHidePlaceholders()", "class.mat-date-range-input-required": "required", "attr.id": "id", "attr.aria-labelledby": "_getAriaLabelledby()", "attr.aria-describedby": "_ariaDescribedBy", "attr.data-mat-calendar": "rangePicker ? rangePicker.id : null" }, classAttribute: "mat-date-range-input" }, providers: [
            { provide: MatFormFieldControl, useExisting: MatDateRangeInput },
            { provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput },
        ], queries: [{ propertyName: "_startInput", first: true, predicate: MatStartDate, descendants: true }, { propertyName: "_endInput", first: true, predicate: MatEndDate, descendants: true }], exportAs: ["matDateRangeInput"], usesOnChanges: true, ngImport: i0, template: "<div\n  class=\"mat-date-range-input-container\"\n  cdkMonitorSubtreeFocus\n  (cdkFocusChange)=\"_updateFocus($event)\">\n  <div class=\"mat-date-range-input-wrapper\">\n    <ng-content select=\"input[matStartDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('start')}}</span>\n  </div>\n\n  <span\n    class=\"mat-date-range-input-separator\"\n    [class.mat-date-range-input-separator-hidden]=\"_shouldHideSeparator()\">{{separator}}</span>\n\n  <div class=\"mat-date-range-input-wrapper mat-date-range-input-end-wrapper\">\n    <ng-content select=\"input[matEndDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('end')}}</span>\n  </div>\n</div>\n\n", styles: [".mat-date-range-input{display:block;width:100%}.mat-date-range-input-container{display:flex;align-items:center}.mat-date-range-input-separator{transition:opacity 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);margin:0 4px;color:var(--mat-datepicker-range-input-separator-color, var(--mat-app-on-surface))}.mat-form-field-disabled .mat-date-range-input-separator{color:var(--mat-datepicker-range-input-disabled-state-separator-color)}._mat-animation-noopable .mat-date-range-input-separator{transition:none}.mat-date-range-input-separator-hidden{-webkit-user-select:none;user-select:none;opacity:0;transition:none}.mat-date-range-input-wrapper{position:relative;overflow:hidden;max-width:calc(50% - 4px)}.mat-date-range-input-end-wrapper{flex-grow:1}.mat-date-range-input-inner{position:absolute;top:0;left:0;font:inherit;background:rgba(0,0,0,0);color:currentColor;border:none;outline:none;padding:0;margin:0;vertical-align:bottom;text-align:inherit;-webkit-appearance:none;width:100%;height:100%}.mat-date-range-input-inner:-moz-ui-invalid{box-shadow:none}.mat-date-range-input-inner::placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-moz-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-webkit-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner:-ms-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner[disabled]{color:var(--mat-datepicker-range-input-disabled-state-text-color)}.mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{opacity:0}._mat-animation-noopable .mat-date-range-input-inner::placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-moz-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-webkit-input-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner:-ms-input-placeholder{transition:none}.mat-date-range-input-mirror{-webkit-user-select:none;user-select:none;visibility:hidden;white-space:nowrap;display:inline-block;min-width:2px}.mat-mdc-form-field-type-mat-date-range-input .mat-mdc-form-field-infix{width:200px}"], dependencies: [{ kind: "directive", type: CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateRangeInput, decorators: [{
            type: Component,
            args: [{ selector: 'mat-date-range-input', exportAs: 'matDateRangeInput', host: {
                        'class': 'mat-date-range-input',
                        '[class.mat-date-range-input-hide-placeholders]': '_shouldHidePlaceholders()',
                        '[class.mat-date-range-input-required]': 'required',
                        '[attr.id]': 'id',
                        'role': 'group',
                        '[attr.aria-labelledby]': '_getAriaLabelledby()',
                        '[attr.aria-describedby]': '_ariaDescribedBy',
                        // Used by the test harness to tie this input to its calendar. We can't depend on
                        // `aria-owns` for this, because it's only defined while the calendar is open.
                        '[attr.data-mat-calendar]': 'rangePicker ? rangePicker.id : null',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [
                        { provide: MatFormFieldControl, useExisting: MatDateRangeInput },
                        { provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput },
                    ], standalone: true, imports: [CdkMonitorFocus], template: "<div\n  class=\"mat-date-range-input-container\"\n  cdkMonitorSubtreeFocus\n  (cdkFocusChange)=\"_updateFocus($event)\">\n  <div class=\"mat-date-range-input-wrapper\">\n    <ng-content select=\"input[matStartDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('start')}}</span>\n  </div>\n\n  <span\n    class=\"mat-date-range-input-separator\"\n    [class.mat-date-range-input-separator-hidden]=\"_shouldHideSeparator()\">{{separator}}</span>\n\n  <div class=\"mat-date-range-input-wrapper mat-date-range-input-end-wrapper\">\n    <ng-content select=\"input[matEndDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue('end')}}</span>\n  </div>\n</div>\n\n", styles: [".mat-date-range-input{display:block;width:100%}.mat-date-range-input-container{display:flex;align-items:center}.mat-date-range-input-separator{transition:opacity 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);margin:0 4px;color:var(--mat-datepicker-range-input-separator-color, var(--mat-app-on-surface))}.mat-form-field-disabled .mat-date-range-input-separator{color:var(--mat-datepicker-range-input-disabled-state-separator-color)}._mat-animation-noopable .mat-date-range-input-separator{transition:none}.mat-date-range-input-separator-hidden{-webkit-user-select:none;user-select:none;opacity:0;transition:none}.mat-date-range-input-wrapper{position:relative;overflow:hidden;max-width:calc(50% - 4px)}.mat-date-range-input-end-wrapper{flex-grow:1}.mat-date-range-input-inner{position:absolute;top:0;left:0;font:inherit;background:rgba(0,0,0,0);color:currentColor;border:none;outline:none;padding:0;margin:0;vertical-align:bottom;text-align:inherit;-webkit-appearance:none;width:100%;height:100%}.mat-date-range-input-inner:-moz-ui-invalid{box-shadow:none}.mat-date-range-input-inner::placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-moz-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-webkit-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner:-ms-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner[disabled]{color:var(--mat-datepicker-range-input-disabled-state-text-color)}.mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{opacity:0}.mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{-webkit-user-select:none;user-select:none;color:rgba(0,0,0,0) !important;-webkit-text-fill-color:rgba(0,0,0,0);transition:none}.cdk-high-contrast-active .mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.cdk-high-contrast-active .mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{opacity:0}._mat-animation-noopable .mat-date-range-input-inner::placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-moz-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner::-webkit-input-placeholder{transition:none}._mat-animation-noopable .mat-date-range-input-inner:-ms-input-placeholder{transition:none}.mat-date-range-input-mirror{-webkit-user-select:none;user-select:none;visibility:hidden;white-space:nowrap;display:inline-block;min-width:2px}.mat-mdc-form-field-type-mat-date-range-input .mat-mdc-form-field-infix{width:200px}"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.ControlContainer, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }, { type: i2.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_FORM_FIELD]
                }] }], propDecorators: { rangePicker: [{
                type: Input
            }], required: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], dateFilter: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], separator: [{
                type: Input
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], _startInput: [{
                type: ContentChild,
                args: [MatStartDate]
            }], _endInput: [{
                type: ContentChild,
                args: [MatEndDate]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2RhdGUtcmFuZ2UtaW5wdXQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlLXJhbmdlLWlucHV0Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQy9ELE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLElBQUksRUFFSixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsZ0JBQWdCLEVBQWEsVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFDLFdBQVcsRUFBZSxNQUFNLHdCQUF3QixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNqRixPQUFPLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxFQUNMLDJCQUEyQixFQUUzQixVQUFVLEVBQ1YsWUFBWSxHQUNiLE1BQU0sMEJBQTBCLENBQUM7QUFJbEMsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDL0QsT0FBTyxFQUFxQyxxQkFBcUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDOzs7O0FBRWxHLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQTRCckIsTUFBTSxPQUFPLGlCQUFpQjtJQWE1Qix3Q0FBd0M7SUFDeEMsSUFBSSxLQUFL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RSxzQkFBc0I7d0JBQy9CLGdEQUFnRCxFQUFFLDJCQUEyQjt3QkFDN0UsdUNBQXVDLEVBQUUsVUFBVTt3QkFDbkQsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLE1BQU0sRUFBRSxPQUFPO3dCQUNmLHdCQUF3QixFQUFFLHNCQUFzQjt3QkFDaEQseUJBQXlCLEVBQUUsa0JBQWtCO3dCQUM3QyxpRkFBaUY7d0JBQ2pGLDhFQUE4RTt3QkFDOUUsMEJBQTBCLEVBQUUscUNBQXFDO3FCQUNsRSxtQkFDZ0IsdUJBQXVCLENBQUMsTUFBTSxpQkFDaEMsaUJBQWlCLENBQUMsSUFBSSxhQUMxQjt3QkFDVCxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxXQUFXLG1CQUFtQixFQUFDO3dCQUM5RCxFQUFDLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxXQUFXLG1CQUFtQixFQUFDO3FCQUN2RSxjQUNXLElBQUksV0FDUCxDQUFDLGVBQWUsQ0FBQzs7MEJBaU52QixRQUFROzswQkFBSSxJQUFJOzswQkFDaEIsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxjQUFjO3lDQXBLaEMsV0FBVztzQkFEZCxLQUFLO2dCQTZCRixRQUFRO3NCQURYLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBaUJoQyxVQUFVO3NCQURiLEtBQUs7Z0JBdUJGLEdBQUc7c0JBRE4sS0FBSztnQkFnQkYsR0FBRztzQkFETixLQUFLO2dCQWdCRixRQUFRO3NCQURYLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBcUMzQixTQUFTO3NCQUFqQixLQUFLO2dCQUdHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBR0csYUFBYTtzQkFBckIsS0FBSztnQkFFc0IsV0FBVztzQkFBdEMsWUFBWTt1QkFBQyxZQUFZO2dCQUNBLFNBQVM7c0JBQWxDLFlBQVk7dUJBQUMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka01vbml0b3JGb2N1cywgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgU2VsZixcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIHNpZ25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXIsIE5nQ29udHJvbCwgVmFsaWRhdG9yc30gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtEYXRlQWRhcHRlciwgVGhlbWVQYWxldHRlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TUFUX0ZPUk1fRklFTEQsIE1hdEZvcm1GaWVsZENvbnRyb2x9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb24sIG1lcmdlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIE1BVF9EQVRFX1JBTkdFX0lOUFVUX1BBUkVOVCxcbiAgTWF0RGF0ZVJhbmdlSW5wdXRQYXJlbnQsXG4gIE1hdEVuZERhdGUsXG4gIE1hdFN0YXJ0RGF0ZSxcbn0gZnJvbSAnLi9kYXRlLXJhbmdlLWlucHV0LXBhcnRzJztcbmltcG9ydCB7TWF0RGF0ZVJhbmdlUGlja2VySW5wdXR9IGZyb20gJy4vZGF0ZS1yYW5nZS1waWNrZXInO1xuaW1wb3J0IHtEYXRlUmFuZ2UsIE1hdERhdGVTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJDb250cm9sLCBNYXREYXRlcGlja2VyUGFuZWx9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcbmltcG9ydCB7Y3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3J9IGZyb20gJy4vZGF0ZXBpY2tlci1lcnJvcnMnO1xuaW1wb3J0IHtEYXRlRmlsdGVyRm4sIF9NYXRGb3JtRmllbGRQYXJ0aWFsLCBkYXRlSW5wdXRzSGF2ZUNoYW5nZWR9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dC1iYXNlJztcblxubGV0IG5leHRVbmlxdWVJZCA9IDA7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1kYXRlLXJhbmdlLWlucHV0JyxcbiAgdGVtcGxhdGVVcmw6ICdkYXRlLXJhbmdlLWlucHV0Lmh0bWwnLFxuICBzdHlsZVVybDogJ2RhdGUtcmFuZ2UtaW5wdXQuY3NzJyxcbiAgZXhwb3J0QXM6ICdtYXREYXRlUmFuZ2VJbnB1dCcsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWRhdGUtcmFuZ2UtaW5wdXQnLFxuICAgICdbY2xhc3MubWF0LWRhdGUtcmFuZ2UtaW5wdXQtaGlkZS1wbGFjZWhvbGRlcnNdJzogJ19zaG91bGRIaWRlUGxhY2Vob2xkZXJzKCknLFxuICAgICdbY2xhc3MubWF0LWRhdGUtcmFuZ2UtaW5wdXQtcmVxdWlyZWRdJzogJ3JlcXVpcmVkJyxcbiAgICAnW2F0dHIuaWRdJzogJ2lkJyxcbiAgICAncm9sZSc6ICdncm91cCcsXG4gICAgJ1thdHRyLmFyaWEtbGFiZWxsZWRieV0nOiAnX2dldEFyaWFMYWJlbGxlZGJ5KCknLFxuICAgICdbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XSc6ICdfYXJpYURlc2NyaWJlZEJ5JyxcbiAgICAvLyBVc2VkIGJ5IHRoZSB0ZXN0IGhhcm5lc3MgdG8gdGllIHRoaXMgaW5wdXQgdG8gaXRzIGNhbGVuZGFyLiBXZSBjYW4ndCBkZXBlbmQgb25cbiAgICAvLyBgYXJpYS1vd25zYCBmb3IgdGhpcywgYmVjYXVzZSBpdCdzIG9ubHkgZGVmaW5lZCB3aGlsZSB0aGUgY2FsZW5kYXIgaXMgb3Blbi5cbiAgICAnW2F0dHIuZGF0YS1tYXQtY2FsZW5kYXJdJzogJ3JhbmdlUGlja2VyID8gcmFuZ2VQaWNrZXIuaWQgOiBudWxsJyxcbiAgfSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBNYXRGb3JtRmllbGRDb250cm9sLCB1c2VFeGlzdGluZzogTWF0RGF0ZVJhbmdlSW5wdXR9LFxuICAgIHtwcm92aWRlOiBNQVRfREFURV9SQU5HRV9JTlBVVF9QQVJFTlQsIHVzZUV4aXN0aW5nOiBNYXREYXRlUmFuZ2VJbnB1dH0sXG4gIF0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDZGtNb25pdG9yRm9jdXNdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlUmFuZ2VJbnB1dDxEPlxuICBpbXBsZW1lbnRzXG4gICAgTWF0Rm9ybUZpZWxkQ29udHJvbDxEYXRlUmFuZ2U8RD4+LFxuICAgIE1hdERhdGVwaWNrZXJDb250cm9sPEQ+LFxuICAgIE1hdERhdGVSYW5nZUlucHV0UGFyZW50PEQ+LFxuICAgIE1hdERhdGVSYW5nZVBpY2tlcklucHV0PEQ+LFxuICAgIEFmdGVyQ29udGVudEluaXQsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveVxue1xuICBwcml2YXRlIF9jbG9zZWRTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX29wZW5lZFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogQ3VycmVudCB2YWx1ZSBvZiB0aGUgcmFuZ2UgaW5wdXQuICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWwgPyB0aGlzLl9tb2RlbC5zZWxlY3Rpb24gOiBudWxsO1xuICB9XG5cbiAgLyoqIFVuaXF1ZSBJRCBmb3IgdGhlIGdyb3VwLiAqL1xuICBpZCA9IGBtYXQtZGF0ZS1yYW5nZS1pbnB1dC0ke25leHRVbmlxdWVJZCsrfWA7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbnRyb2wgaXMgZm9jdXNlZC4gKi9cbiAgZm9jdXNlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb250cm9sJ3MgbGFiZWwgc2hvdWxkIGZsb2F0LiAqL1xuICBnZXQgc2hvdWxkTGFiZWxGbG9hdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5mb2N1c2VkIHx8ICF0aGlzLmVtcHR5O1xuICB9XG5cbiAgLyoqIE5hbWUgb2YgdGhlIGZvcm0gY29udHJvbC4gKi9cbiAgY29udHJvbFR5cGUgPSAnbWF0LWRhdGUtcmFuZ2UtaW5wdXQnO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBhIHBhcnQgb2YgYE1hdEZvcm1GaWVsZENvbnRyb2xgLlxuICAgKiBTZXQgdGhlIHBsYWNlaG9sZGVyIGF0dHJpYnV0ZSBvbiBgbWF0U3RhcnREYXRlYCBhbmQgYG1hdEVuZERhdGVgLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBnZXQgcGxhY2Vob2xkZXIoKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLl9zdGFydElucHV0Py5fZ2V0UGxhY2Vob2xkZXIoKSB8fCAnJztcbiAgICBjb25zdCBlbmQgPSB0aGlzLl9lbmRJbnB1dD8uX2dldFBsYWNlaG9sZGVyKCkgfHwgJyc7XG4gICAgcmV0dXJuIHN0YXJ0IHx8IGVuZCA/IGAke3N0YXJ0fSAke3RoaXMuc2VwYXJhdG9yfSAke2VuZH1gIDogJyc7XG4gIH1cblxuICAvKiogVGhlIHJhbmdlIHBpY2tlciB0aGF0IHRoaXMgaW5wdXQgaXMgYXNzb2NpYXRlZCB3aXRoLiAqL1xuICBASW5wdXQoKVxuICBnZXQgcmFuZ2VQaWNrZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhbmdlUGlja2VyO1xuICB9XG4gIHNldCByYW5nZVBpY2tlcihyYW5nZVBpY2tlcjogTWF0RGF0ZXBpY2tlclBhbmVsPE1hdERhdGVwaWNrZXJDb250cm9sPEQ+LCBEYXRlUmFuZ2U8RD4sIEQ+KSB7XG4gICAgaWYgKHJhbmdlUGlja2VyKSB7XG4gICAgICB0aGlzLl9tb2RlbCA9IHJhbmdlUGlja2VyLnJlZ2lzdGVySW5wdXQodGhpcyk7XG4gICAgICB0aGlzLl9yYW5nZVBpY2tlciA9IHJhbmdlUGlja2VyO1xuICAgICAgdGhpcy5fY2xvc2VkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl9vcGVuZWRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX2FyaWFPd25zLnNldCh0aGlzLnJhbmdlUGlja2VyLm9wZW5lZCA/IHJhbmdlUGlja2VyLmlkIDogbnVsbCk7XG4gICAgICB0aGlzLl9jbG9zZWRTdWJzY3JpcHRpb24gPSByYW5nZVBpY2tlci5jbG9zZWRTdHJlYW0uc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fc3RhcnRJbnB1dD8uX29uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLl9lbmRJbnB1dD8uX29uVG91Y2hlZCgpO1xuICAgICAgICB0aGlzLl9hcmlhT3ducy5zZXQobnVsbCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX29wZW5lZFN1YnNjcmlwdGlvbiA9IHJhbmdlUGlja2VyLm9wZW5lZFN0cmVhbS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9hcmlhT3ducy5zZXQocmFuZ2VQaWNrZXIuaWQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZWdpc3Rlck1vZGVsKHRoaXMuX21vZGVsISk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3JhbmdlUGlja2VyOiBNYXREYXRlcGlja2VyUGFuZWw8TWF0RGF0ZXBpY2tlckNvbnRyb2w8RD4sIERhdGVSYW5nZTxEPiwgRD47XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgcGFuZWwgb3duZWQgYnkgdGhpcyBpbnB1dC4gKi9cbiAgX2FyaWFPd25zID0gc2lnbmFsPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBpbnB1dCBpcyByZXF1aXJlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgcmVxdWlyZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX3JlcXVpcmVkID8/XG4gICAgICAodGhpcy5faXNUYXJnZXRSZXF1aXJlZCh0aGlzKSB8fFxuICAgICAgICB0aGlzLl9pc1RhcmdldFJlcXVpcmVkKHRoaXMuX3N0YXJ0SW5wdXQpIHx8XG4gICAgICAgIHRoaXMuX2lzVGFyZ2V0UmVxdWlyZWQodGhpcy5fZW5kSW5wdXQpKSA/P1xuICAgICAgZmFsc2VcbiAgICApO1xuICB9XG4gIHNldCByZXF1aXJlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3JlcXVpcmVkID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfcmVxdWlyZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmlsdGVyIG91dCBkYXRlcyB3aXRoaW4gdGhlIGRhdGUgcmFuZ2UgcGlja2VyLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZGF0ZUZpbHRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUZpbHRlcjtcbiAgfVxuICBzZXQgZGF0ZUZpbHRlcih2YWx1ZTogRGF0ZUZpbHRlckZuPEQ+KSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLl9zdGFydElucHV0O1xuICAgIGNvbnN0IGVuZCA9IHRoaXMuX2VuZElucHV0O1xuICAgIGNvbnN0IHdhc01hdGNoaW5nU3RhcnQgPSBzdGFydCAmJiBzdGFydC5fbWF0Y2hlc0ZpbHRlcihzdGFydC52YWx1ZSk7XG4gICAgY29uc3Qgd2FzTWF0Y2hpbmdFbmQgPSBlbmQgJiYgZW5kLl9tYXRjaGVzRmlsdGVyKHN0YXJ0LnZhbHVlKTtcbiAgICB0aGlzLl9kYXRlRmlsdGVyID0gdmFsdWU7XG5cbiAgICBpZiAoc3RhcnQgJiYgc3RhcnQuX21hdGNoZXNGaWx0ZXIoc3RhcnQudmFsdWUpICE9PSB3YXNNYXRjaGluZ1N0YXJ0KSB7XG4gICAgICBzdGFydC5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBpZiAoZW5kICYmIGVuZC5fbWF0Y2hlc0ZpbHRlcihlbmQudmFsdWUpICE9PSB3YXNNYXRjaGluZ0VuZCkge1xuICAgICAgZW5kLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kYXRlRmlsdGVyOiBEYXRlRmlsdGVyRm48RD47XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHZhbGlkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW4oKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cbiAgc2V0IG1pbih2YWx1ZTogRCB8IG51bGwpIHtcbiAgICBjb25zdCB2YWxpZFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG5cbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKHZhbGlkVmFsdWUsIHRoaXMuX21pbikpIHtcbiAgICAgIHRoaXMuX21pbiA9IHZhbGlkVmFsdWU7XG4gICAgICB0aGlzLl9yZXZhbGlkYXRlKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX21pbjogRCB8IG51bGw7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHZhbGlkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXgoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cbiAgc2V0IG1heCh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICBjb25zdCB2YWxpZFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG5cbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKHZhbGlkVmFsdWUsIHRoaXMuX21heCkpIHtcbiAgICAgIHRoaXMuX21heCA9IHZhbGlkVmFsdWU7XG4gICAgICB0aGlzLl9yZXZhbGlkYXRlKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX21heDogRCB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnRJbnB1dCAmJiB0aGlzLl9lbmRJbnB1dFxuICAgICAgPyB0aGlzLl9zdGFydElucHV0LmRpc2FibGVkICYmIHRoaXMuX2VuZElucHV0LmRpc2FibGVkXG4gICAgICA6IHRoaXMuX2dyb3VwRGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9ncm91cERpc2FibGVkKSB7XG4gICAgICB0aGlzLl9ncm91cERpc2FibGVkID0gdmFsdWU7XG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG4gIF9ncm91cERpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGlucHV0IGlzIGluIGFuIGVycm9yIHN0YXRlLiAqL1xuICBnZXQgZXJyb3JTdGF0ZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fc3RhcnRJbnB1dCAmJiB0aGlzLl9lbmRJbnB1dCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0SW5wdXQuZXJyb3JTdGF0ZSB8fCB0aGlzLl9lbmRJbnB1dC5lcnJvclN0YXRlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIGlucHV0IGlzIGVtcHR5LiAqL1xuICBnZXQgZW1wdHkoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3RhcnRFbXB0eSA9IHRoaXMuX3N0YXJ0SW5wdXQgPyB0aGlzLl9zdGFydElucHV0LmlzRW1wdHkoKSA6IGZhbHNlO1xuICAgIGNvbnN0IGVuZEVtcHR5ID0gdGhpcy5fZW5kSW5wdXQgPyB0aGlzLl9lbmRJbnB1dC5pc0VtcHR5KCkgOiBmYWxzZTtcbiAgICByZXR1cm4gc3RhcnRFbXB0eSAmJiBlbmRFbXB0eTtcbiAgfVxuXG4gIC8qKiBWYWx1ZSBmb3IgdGhlIGBhcmlhLWRlc2NyaWJlZGJ5YCBhdHRyaWJ1dGUgb2YgdGhlIGlucHV0cy4gKi9cbiAgX2FyaWFEZXNjcmliZWRCeTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIERhdGUgc2VsZWN0aW9uIG1vZGVsIGN1cnJlbnRseSByZWdpc3RlcmVkIHdpdGggdGhlIGlucHV0LiAqL1xuICBwcml2YXRlIF9tb2RlbDogTWF0RGF0ZVNlbGVjdGlvbk1vZGVsPERhdGVSYW5nZTxEPj4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFNlcGFyYXRvciB0ZXh0IHRvIGJlIHNob3duIGJldHdlZW4gdGhlIGlucHV0cy4gKi9cbiAgQElucHV0KCkgc2VwYXJhdG9yID0gJ+KAkyc7XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlIHRoYXQgc2hvdWxkIGJlIHNob3duIGluIHRoZSBjYWxlbmRhci4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvblN0YXJ0OiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZSB0aGF0IHNob3VsZCBiZSBzaG93biBpbiB0aGUgY2FsZW5kYXIuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25FbmQ6IEQgfCBudWxsID0gbnVsbDtcblxuICBAQ29udGVudENoaWxkKE1hdFN0YXJ0RGF0ZSkgX3N0YXJ0SW5wdXQ6IE1hdFN0YXJ0RGF0ZTxEPjtcbiAgQENvbnRlbnRDaGlsZChNYXRFbmREYXRlKSBfZW5kSW5wdXQ6IE1hdEVuZERhdGU8RD47XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIGEgcGFydCBvZiBgTWF0Rm9ybUZpZWxkQ29udHJvbGAuXG4gICAqIFRPRE8oY3Jpc2JldG8pOiBjaGFuZ2UgdHlwZSB0byBgQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlYCBhZnRlciAjMTgyMDYgbGFuZHMuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIG5nQ29udHJvbDogTmdDb250cm9sIHwgbnVsbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgaW5wdXQncyBzdGF0ZSBoYXMgY2hhbmdlZC4gKi9cbiAgcmVhZG9ubHkgc3RhdGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogRGlzYWJsZSB0aGUgYXV0b21hdGljIGxhYmVsaW5nIHRvIGF2b2lkIGlzc3VlcyBsaWtlICMyNzI0MS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVhZG9ubHkgZGlzYWJsZUF1dG9tYXRpY0xhYmVsaW5nID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBjb250cm9sOiBDb250cm9sQ29udGFpbmVyLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9GT1JNX0ZJRUxEKSBwcml2YXRlIF9mb3JtRmllbGQ/OiBfTWF0Rm9ybUZpZWxkUGFydGlhbCxcbiAgKSB7XG4gICAgaWYgKCFfZGF0ZUFkYXB0ZXIgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEYXRlQWRhcHRlcicpO1xuICAgIH1cblxuICAgIC8vIFRoZSBkYXRlcGlja2VyIG1vZHVsZSBjYW4gYmUgdXNlZCBib3RoIHdpdGggTURDIGFuZCBub24tTURDIGZvcm0gZmllbGRzLiBXZSBoYXZlXG4gICAgLy8gdG8gY29uZGl0aW9uYWxseSBhZGQgdGhlIE1EQyBpbnB1dCBjbGFzcyBzbyB0aGF0IHRoZSByYW5nZSBwaWNrZXIgbG9va3MgY29ycmVjdGx5LlxuICAgIGlmIChfZm9ybUZpZWxkPy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWF0LW1kYy1mb3JtLWZpZWxkJykpIHtcbiAgICAgIF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcbiAgICAgICAgJ21hdC1tZGMtaW5wdXQtZWxlbWVudCcsXG4gICAgICAgICdtYXQtbWRjLWZvcm0tZmllbGQtaW5wdXQtY29udHJvbCcsXG4gICAgICAgICdtZGMtdGV4dC1maWVsZF9faW5wdXQnLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIGBhcyBhbnlgIGFmdGVyICMxODIwNiBsYW5kcy5cbiAgICB0aGlzLm5nQ29udHJvbCA9IGNvbnRyb2wgYXMgYW55O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIGEgcGFydCBvZiBgTWF0Rm9ybUZpZWxkQ29udHJvbGAuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldERlc2NyaWJlZEJ5SWRzKGlkczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVkQnkgPSBpZHMubGVuZ3RoID8gaWRzLmpvaW4oJyAnKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgYSBwYXJ0IG9mIGBNYXRGb3JtRmllbGRDb250cm9sYC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgb25Db250YWluZXJDbGljaygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZm9jdXNlZCAmJiAhdGhpcy5kaXNhYmxlZCkge1xuICAgICAgaWYgKCF0aGlzLl9tb2RlbCB8fCAhdGhpcy5fbW9kZWwuc2VsZWN0aW9uLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5wdXQuZm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2VuZElucHV0LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5fc3RhcnRJbnB1dCkge1xuICAgICAgICB0aHJvdyBFcnJvcignbWF0LWRhdGUtcmFuZ2UtaW5wdXQgbXVzdCBjb250YWluIGEgbWF0U3RhcnREYXRlIGlucHV0Jyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fZW5kSW5wdXQpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ21hdC1kYXRlLXJhbmdlLWlucHV0IG11c3QgY29udGFpbiBhIG1hdEVuZERhdGUgaW5wdXQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcbiAgICAgIHRoaXMuX3JlZ2lzdGVyTW9kZWwodGhpcy5fbW9kZWwpO1xuICAgIH1cblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gdW5zdWJzY3JpYmUgZnJvbSB0aGlzLCBiZWNhdXNlIHdlXG4gICAgLy8ga25vdyB0aGF0IHRoZSBpbnB1dCBzdHJlYW1zIHdpbGwgYmUgY29tcGxldGVkIG9uIGRlc3Ryb3kuXG4gICAgbWVyZ2UodGhpcy5fc3RhcnRJbnB1dC5zdGF0ZUNoYW5nZXMsIHRoaXMuX2VuZElucHV0LnN0YXRlQ2hhbmdlcykuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoZGF0ZUlucHV0c0hhdmVDaGFuZ2VkKGNoYW5nZXMsIHRoaXMuX2RhdGVBZGFwdGVyKSkge1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Nsb3NlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX29wZW5lZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGF0ZSBhdCB3aGljaCB0aGUgY2FsZW5kYXIgc2hvdWxkIHN0YXJ0LiAqL1xuICBnZXRTdGFydFZhbHVlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA/IHRoaXMudmFsdWUuc3RhcnQgOiBudWxsO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGlucHV0J3MgdGhlbWUgcGFsZXR0ZS4gKi9cbiAgZ2V0VGhlbWVQYWxldHRlKCk6IFRoZW1lUGFsZXR0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX2Zvcm1GaWVsZCA/IHRoaXMuX2Zvcm1GaWVsZC5jb2xvciA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBlbGVtZW50IHRvIHdoaWNoIHRoZSBjYWxlbmRhciBvdmVybGF5IHNob3VsZCBiZSBhdHRhY2hlZC4gKi9cbiAgZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkID8gdGhpcy5fZm9ybUZpZWxkLmdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKSA6IHRoaXMuX2VsZW1lbnRSZWY7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgSUQgb2YgYW4gZWxlbWVudCB0aGF0IHNob3VsZCBiZSB1c2VkIGEgZGVzY3JpcHRpb24gZm9yIHRoZSBjYWxlbmRhciBvdmVybGF5LiAqL1xuICBnZXRPdmVybGF5TGFiZWxJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkID8gdGhpcy5fZm9ybUZpZWxkLmdldExhYmVsSWQoKSA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgdGhhdCBpcyB1c2VkIHRvIG1pcnJvciB0aGUgc3RhdGUgaW5wdXQuICovXG4gIF9nZXRJbnB1dE1pcnJvclZhbHVlKHBhcnQ6ICdzdGFydCcgfCAnZW5kJykge1xuICAgIGNvbnN0IGlucHV0ID0gcGFydCA9PT0gJ3N0YXJ0JyA/IHRoaXMuX3N0YXJ0SW5wdXQgOiB0aGlzLl9lbmRJbnB1dDtcbiAgICByZXR1cm4gaW5wdXQgPyBpbnB1dC5nZXRNaXJyb3JWYWx1ZSgpIDogJyc7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgaW5wdXQgcGxhY2Vob2xkZXJzIHNob3VsZCBiZSBoaWRkZW4uICovXG4gIF9zaG91bGRIaWRlUGxhY2Vob2xkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGFydElucHV0ID8gIXRoaXMuX3N0YXJ0SW5wdXQuaXNFbXB0eSgpIDogZmFsc2U7XG4gIH1cblxuICAvKiogSGFuZGxlcyB0aGUgdmFsdWUgaW4gb25lIG9mIHRoZSBjaGlsZCBpbnB1dHMgY2hhbmdpbmcuICovXG4gIF9oYW5kbGVDaGlsZFZhbHVlQ2hhbmdlKCkge1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgZGF0ZSByYW5nZSBwaWNrZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnB1dC4gKi9cbiAgX29wZW5EYXRlcGlja2VyKCkge1xuICAgIGlmICh0aGlzLl9yYW5nZVBpY2tlcikge1xuICAgICAgdGhpcy5fcmFuZ2VQaWNrZXIub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzZXBhcmF0ZSB0ZXh0IHNob3VsZCBiZSBoaWRkZW4uICovXG4gIF9zaG91bGRIaWRlU2VwYXJhdG9yKCkge1xuICAgIHJldHVybiAoXG4gICAgICAoIXRoaXMuX2Zvcm1GaWVsZCB8fFxuICAgICAgICAodGhpcy5fZm9ybUZpZWxkLmdldExhYmVsSWQoKSAmJiAhdGhpcy5fZm9ybUZpZWxkLl9zaG91bGRMYWJlbEZsb2F0KCkpKSAmJlxuICAgICAgdGhpcy5lbXB0eVxuICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgZm9yIHRoZSBgYXJpYS1sYWJlbGxlZGJ5YCBhdHRyaWJ1dGUgb2YgdGhlIGlucHV0cy4gKi9cbiAgX2dldEFyaWFMYWJlbGxlZGJ5KCkge1xuICAgIGNvbnN0IGZvcm1GaWVsZCA9IHRoaXMuX2Zvcm1GaWVsZDtcbiAgICByZXR1cm4gZm9ybUZpZWxkICYmIGZvcm1GaWVsZC5faGFzRmxvYXRpbmdMYWJlbCgpID8gZm9ybUZpZWxkLl9sYWJlbElkIDogbnVsbDtcbiAgfVxuXG4gIF9nZXRTdGFydERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdGFydElucHV0Ll9nZXRBY2Nlc3NpYmxlTmFtZSgpO1xuICB9XG5cbiAgX2dldEVuZERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lbmRJbnB1dC5fZ2V0QWNjZXNzaWJsZU5hbWUoKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBmb2N1c2VkIHN0YXRlIG9mIHRoZSByYW5nZSBpbnB1dC4gKi9cbiAgX3VwZGF0ZUZvY3VzKG9yaWdpbjogRm9jdXNPcmlnaW4pIHtcbiAgICB0aGlzLmZvY3VzZWQgPSBvcmlnaW4gIT09IG51bGw7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICB9XG5cbiAgLyoqIFJlLXJ1bnMgdGhlIHZhbGlkYXRvcnMgb24gdGhlIHN0YXJ0L2VuZCBpbnB1dHMuICovXG4gIHByaXZhdGUgX3JldmFsaWRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0SW5wdXQpIHtcbiAgICAgIHRoaXMuX3N0YXJ0SW5wdXQuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2VuZElucHV0KSB7XG4gICAgICB0aGlzLl9lbmRJbnB1dC5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVnaXN0ZXJzIHRoZSBjdXJyZW50IGRhdGUgc2VsZWN0aW9uIG1vZGVsIHdpdGggdGhlIHN0YXJ0L2VuZCBpbnB1dHMuICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyTW9kZWwobW9kZWw6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxEYXRlUmFuZ2U8RD4+KSB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0SW5wdXQpIHtcbiAgICAgIHRoaXMuX3N0YXJ0SW5wdXQuX3JlZ2lzdGVyTW9kZWwobW9kZWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9lbmRJbnB1dCkge1xuICAgICAgdGhpcy5fZW5kSW5wdXQuX3JlZ2lzdGVyTW9kZWwobW9kZWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIHNwZWNpZmljIHJhbmdlIGlucHV0IGRpcmVjdGl2ZSBpcyByZXF1aXJlZC4gKi9cbiAgcHJpdmF0ZSBfaXNUYXJnZXRSZXF1aXJlZCh0YXJnZXQ6IHtuZ0NvbnRyb2w6IE5nQ29udHJvbCB8IG51bGx9IHwgbnVsbCk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0YXJnZXQ/Lm5nQ29udHJvbD8uY29udHJvbD8uaGFzVmFsaWRhdG9yKFZhbGlkYXRvcnMucmVxdWlyZWQpO1xuICB9XG59XG4iLCI8ZGl2XG4gIGNsYXNzPVwibWF0LWRhdGUtcmFuZ2UtaW5wdXQtY29udGFpbmVyXCJcbiAgY2RrTW9uaXRvclN1YnRyZWVGb2N1c1xuICAoY2RrRm9jdXNDaGFuZ2UpPVwiX3VwZGF0ZUZvY3VzKCRldmVudClcIj5cbiAgPGRpdiBjbGFzcz1cIm1hdC1kYXRlLXJhbmdlLWlucHV0LXdyYXBwZXJcIj5cbiAgICA8bmctY29udGVudCBzZWxlY3Q9XCJpbnB1dFttYXRTdGFydERhdGVdXCI+PC9uZy1jb250ZW50PlxuICAgIDxzcGFuXG4gICAgICBjbGFzcz1cIm1hdC1kYXRlLXJhbmdlLWlucHV0LW1pcnJvclwiXG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIj57e19nZXRJbnB1dE1pcnJvclZhbHVlKCdzdGFydCcpfX08L3NwYW4+XG4gIDwvZGl2PlxuXG4gIDxzcGFuXG4gICAgY2xhc3M9XCJtYXQtZGF0ZS1yYW5nZS1pbnB1dC1zZXBhcmF0b3JcIlxuICAgIFtjbGFzcy5tYXQtZGF0ZS1yYW5nZS1pbnB1dC1zZXBhcmF0b3ItaGlkZGVuXT1cIl9zaG91bGRIaWRlU2VwYXJhdG9yKClcIj57e3NlcGFyYXRvcn19PC9zcGFuPlxuXG4gIDxkaXYgY2xhc3M9XCJtYXQtZGF0ZS1yYW5nZS1pbnB1dC13cmFwcGVyIG1hdC1kYXRlLXJhbmdlLWlucHV0LWVuZC13cmFwcGVyXCI+XG4gICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiaW5wdXRbbWF0RW5kRGF0ZV1cIj48L25nLWNvbnRlbnQ+XG4gICAgPHNwYW5cbiAgICAgIGNsYXNzPVwibWF0LWRhdGUtcmFuZ2UtaW5wdXQtbWlycm9yXCJcbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPnt7X2dldElucHV0TWlycm9yVmFsdWUoJ2VuZCcpfX08L3NwYW4+XG4gIDwvZGl2PlxuPC9kaXY+XG5cbiJdfQ==