/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { DOWN_ARROW, hasModifierKey, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, Input, Optional, Output, QueryList, Self, ViewEncapsulation, } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, Validators, } from '@angular/forms';
import { _ErrorStateTracker, ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatChipRow } from './chip-row';
import { MatChipSet } from './chip-set';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/material/core";
/** Change event object that is emitted when the chip grid value has changed. */
export class MatChipGridChange {
    constructor(
    /** Chip grid that emitted the event. */
    source, 
    /** Value of the chip grid when the event was emitted. */
    value) {
        this.source = source;
        this.value = value;
    }
}
/**
 * An extension of the MatChipSet component used with MatChipRow chips and
 * the matChipInputFor directive.
 */
export class MatChipGrid extends MatChipSet {
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get disabled() {
        return this.ngControl ? !!this.ngControl.disabled : this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._syncChipsState();
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get id() {
        return this._chipInput.id;
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get empty() {
        return ((!this._chipInput || this._chipInput.empty) && (!this._chips || this._chips.length === 0));
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get placeholder() {
        return this._chipInput ? this._chipInput.placeholder : this._placeholder;
    }
    set placeholder(value) {
        this._placeholder = value;
        this.stateChanges.next();
    }
    /** Whether any chips or the matChipInput inside of this chip-grid has focus. */
    get focused() {
        return this._chipInput.focused || this._hasFocusedChip();
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get required() {
        return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
    }
    set required(value) {
        this._required = value;
        this.stateChanges.next();
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get shouldLabelFloat() {
        return !this.empty || this.focused;
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    /** An object used to control when error messages are shown. */
    get errorStateMatcher() {
        return this._errorStateTracker.matcher;
    }
    set errorStateMatcher(value) {
        this._errorStateTracker.matcher = value;
    }
    /** Combined stream of all of the child chips' blur events. */
    get chipBlurChanges() {
        return this._getChipStream(chip => chip._onBlur);
    }
    /** Whether the chip grid is in an error state. */
    get errorState() {
        return this._errorStateTracker.errorState;
    }
    set errorState(value) {
        this._errorStateTracker.errorState = value;
    }
    constructor(elementRef, changeDetectorRef, dir, parentForm, parentFormGroup, defaultErrorStateMatcher, ngControl) {
        super(elementRef, changeDetectorRef, dir);
        this.ngControl = ngControl;
        /**
         * Implemented as part of MatFormFieldControl.
         * @docs-private
         */
        this.controlType = 'mat-chip-grid';
        this._defaultRole = 'grid';
        /**
         * List of element ids to propagate to the chipInput's aria-describedby attribute.
         */
        this._ariaDescribedbyIds = [];
        /**
         * Function when touched. Set as part of ControlValueAccessor implementation.
         * @docs-private
         */
        this._onTouched = () => { };
        /**
         * Function when changed. Set as part of ControlValueAccessor implementation.
         * @docs-private
         */
        this._onChange = () => { };
        this._value = [];
        /** Emits when the chip grid value has been changed by the user. */
        this.change = new EventEmitter();
        /**
         * Emits whenever the raw value of the chip-grid changes. This is here primarily
         * to facilitate the two-way binding for the `value` input.
         * @docs-private
         */
        this.valueChange = new EventEmitter();
        this._chips = undefined;
        /**
         * Emits whenever the component state changes and should cause the parent
         * form-field to update. Implemented as part of `MatFormFieldControl`.
         * @docs-private
         */
        this.stateChanges = new Subject();
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
        this._errorStateTracker = new _ErrorStateTracker(defaultErrorStateMatcher, ngControl, parentFormGroup, parentForm, this.stateChanges);
    }
    ngAfterContentInit() {
        this.chipBlurChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this._blur();
            this.stateChanges.next();
        });
        merge(this.chipFocusChanges, this._chips.changes)
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.stateChanges.next());
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (!this._chipInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('mat-chip-grid must be used in combination with matChipInputFor.');
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
    ngOnDestroy() {
        super.ngOnDestroy();
        this.stateChanges.complete();
    }
    /** Associates an HTML input element with this chip grid. */
    registerInput(inputElement) {
        this._chipInput = inputElement;
        this._chipInput.setDescribedByIds(this._ariaDescribedbyIds);
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    onContainerClick(event) {
        if (!this.disabled && !this._originatesFromChip(event)) {
            this.focus();
        }
    }
    /**
     * Focuses the first chip in this chip grid, or the associated input when there
     * are no eligible chips.
     */
    focus() {
        if (this.disabled || this._chipInput.focused) {
            return;
        }
        if (!this._chips.length || this._chips.first.disabled) {
            // Delay until the next tick, because this can cause a "changed after checked"
            // error if the input does something on focus (e.g. opens an autocomplete).
            Promise.resolve().then(() => this._chipInput.focus());
        }
        else {
            const activeItem = this._keyManager.activeItem;
            if (activeItem) {
                activeItem.focus();
            }
            else {
                this._keyManager.setFirstItemActive();
            }
        }
        this.stateChanges.next();
    }
    /**
     * Implemented as part of MatFormFieldControl.
     * @docs-private
     */
    setDescribedByIds(ids) {
        // We must keep this up to date to handle the case where ids are set
        // before the chip input is registered.
        this._ariaDescribedbyIds = ids;
        this._chipInput?.setDescribedByIds(ids);
    }
    /**
     * Implemented as part of ControlValueAccessor.
     * @docs-private
     */
    writeValue(value) {
        // The user is responsible for creating the child chips, so we just store the value.
        this._value = value;
    }
    /**
     * Implemented as part of ControlValueAccessor.
     * @docs-private
     */
    registerOnChange(fn) {
        this._onChange = fn;
    }
    /**
     * Implemented as part of ControlValueAccessor.
     * @docs-private
     */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /**
     * Implemented as part of ControlValueAccessor.
     * @docs-private
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        this.stateChanges.next();
    }
    /** Refreshes the error state of the chip grid. */
    updateErrorState() {
        this._errorStateTracker.updateErrorState();
    }
    /** When blurred, mark the field as touched when focus moved outside the chip grid. */
    _blur() {
        if (!this.disabled) {
            // Check whether the focus moved to chip input.
            // If the focus is not moved to chip input, mark the field as touched. If the focus moved
            // to chip input, do nothing.
            // Timeout is needed to wait for the focus() event trigger on chip input.
            setTimeout(() => {
                if (!this.focused) {
                    this._propagateChanges();
                    this._markAsTouched();
                }
            });
        }
    }
    /**
     * Removes the `tabindex` from the chip grid and resets it back afterwards, allowing the
     * user to tab out of it. This prevents the grid from capturing focus and redirecting
     * it back to the first chip, creating a focus trap, if it user tries to tab away.
     */
    _allowFocusEscape() {
        if (!this._chipInput.focused) {
            super._allowFocusEscape();
        }
    }
    /** Handles custom keyboard events. */
    _handleKeydown(event) {
        const keyCode = event.keyCode;
        const activeItem = this._keyManager.activeItem;
        if (keyCode === TAB) {
            if (this._chipInput.focused &&
                hasModifierKey(event, 'shiftKey') &&
                this._chips.length &&
                !this._chips.last.disabled) {
                event.preventDefault();
                if (activeItem) {
                    this._keyManager.setActiveItem(activeItem);
                }
                else {
                    this._focusLastChip();
                }
            }
            else {
                // Use the super method here since it doesn't check for the input
                // focused state. This allows focus to escape if there's only one
                // disabled chip left in the list.
                super._allowFocusEscape();
            }
        }
        else if (!this._chipInput.focused) {
            // The up and down arrows are supposed to navigate between the individual rows in the grid.
            // We do this by filtering the actions down to the ones that have the same `_isPrimary`
            // flag as the active action and moving focus between them ourseles instead of delegating
            // to the key manager. For more information, see #29359 and:
            // https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/#ex2_label
            if ((keyCode === UP_ARROW || keyCode === DOWN_ARROW) && activeItem) {
                const eligibleActions = this._chipActions.filter(action => action._isPrimary === activeItem._isPrimary && !this._skipPredicate(action));
                const currentIndex = eligibleActions.indexOf(activeItem);
                const delta = event.keyCode === UP_ARROW ? -1 : 1;
                event.preventDefault();
                if (currentIndex > -1 && this._isValidIndex(currentIndex + delta)) {
                    this._keyManager.setActiveItem(eligibleActions[currentIndex + delta]);
                }
            }
            else {
                super._handleKeydown(event);
            }
        }
        this.stateChanges.next();
    }
    _focusLastChip() {
        if (this._chips.length) {
            this._chips.last.focus();
        }
    }
    /** Emits change event to set the model value. */
    _propagateChanges() {
        const valueToEmit = this._chips.length ? this._chips.toArray().map(chip => chip.value) : [];
        this._value = valueToEmit;
        this.change.emit(new MatChipGridChange(this, valueToEmit));
        this.valueChange.emit(valueToEmit);
        this._onChange(valueToEmit);
        this._changeDetectorRef.markForCheck();
    }
    /** Mark the field as touched */
    _markAsTouched() {
        this._onTouched();
        this._changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipGrid, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.Directionality, optional: true }, { token: i2.NgForm, optional: true }, { token: i2.FormGroupDirective, optional: true }, { token: i3.ErrorStateMatcher }, { token: i2.NgControl, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatChipGrid, isStandalone: true, selector: "mat-chip-grid", inputs: { disabled: ["disabled", "disabled", booleanAttribute], placeholder: "placeholder", required: ["required", "required", booleanAttribute], value: "value", errorStateMatcher: "errorStateMatcher" }, outputs: { change: "change", valueChange: "valueChange" }, host: { listeners: { "focus": "focus()", "blur": "_blur()" }, properties: { "attr.role": "role", "attr.tabindex": "(disabled || (_chips && _chips.length === 0)) ? -1 : tabIndex", "attr.aria-disabled": "disabled.toString()", "attr.aria-invalid": "errorState", "class.mat-mdc-chip-list-disabled": "disabled", "class.mat-mdc-chip-list-invalid": "errorState", "class.mat-mdc-chip-list-required": "required" }, classAttribute: "mat-mdc-chip-set mat-mdc-chip-grid mdc-evolution-chip-set" }, providers: [{ provide: MatFormFieldControl, useExisting: MatChipGrid }], queries: [{ propertyName: "_chips", predicate: MatChipRow, descendants: true }], usesInheritance: true, ngImport: i0, template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [".mat-mdc-chip-set{display:flex}.mat-mdc-chip-set:focus{outline:none}.mat-mdc-chip-set .mdc-evolution-chip-set__chips{min-width:100%;margin-left:-8px;margin-right:0}.mat-mdc-chip-set .mdc-evolution-chip{margin:4px 0 4px 8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips{margin-left:0;margin-right:-8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip{margin-left:0;margin-right:8px}.mdc-evolution-chip-set__chips{display:flex;flex-flow:wrap;min-width:0}.mat-mdc-chip-set-stacked{flex-direction:column;align-items:flex-start}.mat-mdc-chip-set-stacked .mat-mdc-chip{width:100%}.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic{flex-grow:0}.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary{flex-basis:100%;justify-content:start}input.mat-mdc-chip-input{flex:1 0 150px;margin-left:8px}[dir=rtl] input.mat-mdc-chip-input{margin-left:0;margin-right:8px}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipGrid, decorators: [{
            type: Component,
            args: [{ selector: 'mat-chip-grid', template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `, host: {
                        'class': 'mat-mdc-chip-set mat-mdc-chip-grid mdc-evolution-chip-set',
                        '[attr.role]': 'role',
                        '[attr.tabindex]': '(disabled || (_chips && _chips.length === 0)) ? -1 : tabIndex',
                        '[attr.aria-disabled]': 'disabled.toString()',
                        '[attr.aria-invalid]': 'errorState',
                        '[class.mat-mdc-chip-list-disabled]': 'disabled',
                        '[class.mat-mdc-chip-list-invalid]': 'errorState',
                        '[class.mat-mdc-chip-list-required]': 'required',
                        '(focus)': 'focus()',
                        '(blur)': '_blur()',
                    }, providers: [{ provide: MatFormFieldControl, useExisting: MatChipGrid }], encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, styles: [".mat-mdc-chip-set{display:flex}.mat-mdc-chip-set:focus{outline:none}.mat-mdc-chip-set .mdc-evolution-chip-set__chips{min-width:100%;margin-left:-8px;margin-right:0}.mat-mdc-chip-set .mdc-evolution-chip{margin:4px 0 4px 8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips{margin-left:0;margin-right:-8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip{margin-left:0;margin-right:8px}.mdc-evolution-chip-set__chips{display:flex;flex-flow:wrap;min-width:0}.mat-mdc-chip-set-stacked{flex-direction:column;align-items:flex-start}.mat-mdc-chip-set-stacked .mat-mdc-chip{width:100%}.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic{flex-grow:0}.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary{flex-basis:100%;justify-content:start}input.mat-mdc-chip-input{flex:1 0 150px;margin-left:8px}[dir=rtl] input.mat-mdc-chip-input{margin-left:0;margin-right:8px}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.NgForm, decorators: [{
                    type: Optional
                }] }, { type: i2.FormGroupDirective, decorators: [{
                    type: Optional
                }] }, { type: i3.ErrorStateMatcher }, { type: i2.NgControl, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }], propDecorators: { disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], placeholder: [{
                type: Input
            }], required: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], value: [{
                type: Input
            }], errorStateMatcher: [{
                type: Input
            }], change: [{
                type: Output
            }], valueChange: [{
                type: Output
            }], _chips: [{
                type: ContentChildren,
                args: [MatChipRow, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true,
                    }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1ncmlkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoaXBzL2NoaXAtZ3JpZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hGLE9BQU8sRUFHTCxnQkFBZ0IsRUFDaEIsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsZUFBZSxFQUVmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULElBQUksRUFDSixpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUVMLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsTUFBTSxFQUNOLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzdFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxZQUFZLENBQUM7Ozs7O0FBR3RDLGdGQUFnRjtBQUNoRixNQUFNLE9BQU8saUJBQWlCO0lBQzVCO0lBQ0Usd0NBQXdDO0lBQ2pDLE1BQW1CO0lBQzFCLHlEQUF5RDtJQUNsRCxLQUFVO1FBRlYsV0FBTSxH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QkFDaEQsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLFFBQVEsRUFBRSxTQUFTO3FCQUNwQixhQUNVLENBQUMsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxhQUFhLEVBQUMsQ0FBQyxpQkFDdEQsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJOzswQkFpTGIsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBRVIsUUFBUTs7MEJBQUksSUFBSTt5Q0F2SU4sUUFBUTtzQkFEcEIsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFnQ2hDLFdBQVc7c0JBRGQsS0FBSztnQkFvQkYsUUFBUTtzQkFEWCxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQXVCaEMsS0FBSztzQkFEUixLQUFLO2dCQVdGLGlCQUFpQjtzQkFEcEIsS0FBSztnQkFjYSxNQUFNO3NCQUF4QixNQUFNO2dCQVFZLFdBQVc7c0JBQTdCLE1BQU07Z0JBUUUsTUFBTTtzQkFOZCxlQUFlO3VCQUFDLFVBQVUsRUFBRTt3QkFDM0IsdUVBQXVFO3dCQUN2RSw4Q0FBOEM7d0JBQzlDLFdBQVcsRUFBRSxJQUFJO3FCQUNsQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0RPV05fQVJST1csIGhhc01vZGlmaWVyS2V5LCBUQUIsIFVQX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG4gIFNlbGYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIENvbnRyb2xWYWx1ZUFjY2Vzc29yLFxuICBGb3JtR3JvdXBEaXJlY3RpdmUsXG4gIE5nQ29udHJvbCxcbiAgTmdGb3JtLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge19FcnJvclN0YXRlVHJhY2tlciwgRXJyb3JTdGF0ZU1hdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtNYXRGb3JtRmllbGRDb250cm9sfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7bWVyZ2UsIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TWF0Q2hpcEV2ZW50fSBmcm9tICcuL2NoaXAnO1xuaW1wb3J0IHtNYXRDaGlwUm93fSBmcm9tICcuL2NoaXAtcm93JztcbmltcG9ydCB7TWF0Q2hpcFNldH0gZnJvbSAnLi9jaGlwLXNldCc7XG5pbXBvcnQge01hdENoaXBUZXh0Q29udHJvbH0gZnJvbSAnLi9jaGlwLXRleHQtY29udHJvbCc7XG5cbi8qKiBDaGFuZ2UgZXZlbnQgb2JqZWN0IHRoYXQgaXMgZW1pdHRlZCB3aGVuIHRoZSBjaGlwIGdyaWQgdmFsdWUgaGFzIGNoYW5nZWQuICovXG5leHBvcnQgY2xhc3MgTWF0Q2hpcEdyaWRDaGFuZ2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQ2hpcCBncmlkIHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gICAgcHVibGljIHNvdXJjZTogTWF0Q2hpcEdyaWQsXG4gICAgLyoqIFZhbHVlIG9mIHRoZSBjaGlwIGdyaWQgd2hlbiB0aGUgZXZlbnQgd2FzIGVtaXR0ZWQuICovXG4gICAgcHVibGljIHZhbHVlOiBhbnksXG4gICkge31cbn1cblxuLyoqXG4gKiBBbiBleHRlbnNpb24gb2YgdGhlIE1hdENoaXBTZXQgY29tcG9uZW50IHVzZWQgd2l0aCBNYXRDaGlwUm93IGNoaXBzIGFuZFxuICogdGhlIG1hdENoaXBJbnB1dEZvciBkaXJlY3RpdmUuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1jaGlwLWdyaWQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJtZGMtZXZvbHV0aW9uLWNoaXAtc2V0X19jaGlwc1wiIHJvbGU9XCJwcmVzZW50YXRpb25cIj5cbiAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgc3R5bGVVcmw6ICdjaGlwLXNldC5jc3MnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtY2hpcC1zZXQgbWF0LW1kYy1jaGlwLWdyaWQgbWRjLWV2b2x1dGlvbi1jaGlwLXNldCcsXG4gICAgJ1thdHRyLnJvbGVdJzogJ3JvbGUnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnKGRpc2FibGVkIHx8IChfY2hpcHMgJiYgX2NoaXBzLmxlbmd0aCA9PT0gMCkpID8gLTEgOiB0YWJJbmRleCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkLnRvU3RyaW5nKCknLFxuICAgICdbYXR0ci5hcmlhLWludmFsaWRdJzogJ2Vycm9yU3RhdGUnLFxuICAgICdbY2xhc3MubWF0LW1kYy1jaGlwLWxpc3QtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtY2hpcC1saXN0LWludmFsaWRdJzogJ2Vycm9yU3RhdGUnLFxuICAgICdbY2xhc3MubWF0LW1kYy1jaGlwLWxpc3QtcmVxdWlyZWRdJzogJ3JlcXVpcmVkJyxcbiAgICAnKGZvY3VzKSc6ICdmb2N1cygpJyxcbiAgICAnKGJsdXIpJzogJ19ibHVyKCknLFxuICB9LFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTWF0Rm9ybUZpZWxkQ29udHJvbCwgdXNlRXhpc3Rpbmc6IE1hdENoaXBHcmlkfV0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDaGlwR3JpZFxuICBleHRlbmRzIE1hdENoaXBTZXRcbiAgaW1wbGVtZW50c1xuICAgIEFmdGVyQ29udGVudEluaXQsXG4gICAgQWZ0ZXJWaWV3SW5pdCxcbiAgICBDb250cm9sVmFsdWVBY2Nlc3NvcixcbiAgICBEb0NoZWNrLFxuICAgIE1hdEZvcm1GaWVsZENvbnRyb2w8YW55PixcbiAgICBPbkRlc3Ryb3lcbntcbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgTWF0Rm9ybUZpZWxkQ29udHJvbC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVhZG9ubHkgY29udHJvbFR5cGU6IHN0cmluZyA9ICdtYXQtY2hpcC1ncmlkJztcblxuICAvKiogVGhlIGNoaXAgaW5wdXQgdG8gYWRkIG1vcmUgY2hpcHMgKi9cbiAgcHJvdGVjdGVkIF9jaGlwSW5wdXQ6IE1hdENoaXBUZXh0Q29udHJvbDtcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2RlZmF1bHRSb2xlID0gJ2dyaWQnO1xuICBwcml2YXRlIF9lcnJvclN0YXRlVHJhY2tlcjogX0Vycm9yU3RhdGVUcmFja2VyO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGVsZW1lbnQgaWRzIHRvIHByb3BhZ2F0ZSB0byB0aGUgY2hpcElucHV0J3MgYXJpYS1kZXNjcmliZWRieSBhdHRyaWJ1dGUuXG4gICAqL1xuICBwcml2YXRlIF9hcmlhRGVzY3JpYmVkYnlJZHM6IHN0cmluZ1tdID0gW107XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHdoZW4gdG91Y2hlZC4gU2V0IGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50YXRpb24uXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIF9vblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICAvKipcbiAgICogRnVuY3Rpb24gd2hlbiBjaGFuZ2VkLiBTZXQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRhdGlvbi5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgX29uQ2hhbmdlOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIE1hdEZvcm1GaWVsZENvbnRyb2wuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgb3ZlcnJpZGUgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5nQ29udHJvbCA/ICEhdGhpcy5uZ0NvbnRyb2wuZGlzYWJsZWQgOiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBvdmVycmlkZSBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICAgIHRoaXMuX3N5bmNDaGlwc1N0YXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBNYXRGb3JtRmllbGRDb250cm9sLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBnZXQgaWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpcElucHV0LmlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgTWF0Rm9ybUZpZWxkQ29udHJvbC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgb3ZlcnJpZGUgZ2V0IGVtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAoIXRoaXMuX2NoaXBJbnB1dCB8fCB0aGlzLl9jaGlwSW5wdXQuZW1wdHkpICYmICghdGhpcy5fY2hpcHMgfHwgdGhpcy5fY2hpcHMubGVuZ3RoID09PSAwKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBNYXRGb3JtRmllbGRDb250cm9sLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgcGxhY2Vob2xkZXIoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpcElucHV0ID8gdGhpcy5fY2hpcElucHV0LnBsYWNlaG9sZGVyIDogdGhpcy5fcGxhY2Vob2xkZXI7XG4gIH1cbiAgc2V0IHBsYWNlaG9sZGVyKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHZhbHVlO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQoKTtcbiAgfVxuICBwcm90ZWN0ZWQgX3BsYWNlaG9sZGVyOiBzdHJpbmc7XG5cbiAgLyoqIFdoZXRoZXIgYW55IGNoaXBzIG9yIHRoZSBtYXRDaGlwSW5wdXQgaW5zaWRlIG9mIHRoaXMgY2hpcC1ncmlkIGhhcyBmb2N1cy4gKi9cbiAgb3ZlcnJpZGUgZ2V0IGZvY3VzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NoaXBJbnB1dC5mb2N1c2VkIHx8IHRoaXMuX2hhc0ZvY3VzZWRDaGlwKCk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBNYXRGb3JtRmllbGRDb250cm9sLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCByZXF1aXJlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWlyZWQgPz8gdGhpcy5uZ0NvbnRyb2w/LmNvbnRyb2w/Lmhhc1ZhbGlkYXRvcihWYWxpZGF0b3JzLnJlcXVpcmVkKSA/PyBmYWxzZTtcbiAgfVxuICBzZXQgcmVxdWlyZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9yZXF1aXJlZCA9IHZhbHVlO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQoKTtcbiAgfVxuICBwcm90ZWN0ZWQgX3JlcXVpcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIE1hdEZvcm1GaWVsZENvbnRyb2wuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGdldCBzaG91bGRMYWJlbEZsb2F0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5lbXB0eSB8fCB0aGlzLmZvY3VzZWQ7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBNYXRGb3JtRmllbGRDb250cm9sLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHByb3RlY3RlZCBfdmFsdWU6IGFueVtdID0gW107XG5cbiAgLyoqIEFuIG9iamVjdCB1c2VkIHRvIGNvbnRyb2wgd2hlbiBlcnJvciBtZXNzYWdlcyBhcmUgc2hvd24uICovXG4gIEBJbnB1dCgpXG4gIGdldCBlcnJvclN0YXRlTWF0Y2hlcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZXJyb3JTdGF0ZVRyYWNrZXIubWF0Y2hlcjtcbiAgfVxuICBzZXQgZXJyb3JTdGF0ZU1hdGNoZXIodmFsdWU6IEVycm9yU3RhdGVNYXRjaGVyKSB7XG4gICAgdGhpcy5fZXJyb3JTdGF0ZVRyYWNrZXIubWF0Y2hlciA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIENvbWJpbmVkIHN0cmVhbSBvZiBhbGwgb2YgdGhlIGNoaWxkIGNoaXBzJyBibHVyIGV2ZW50cy4gKi9cbiAgZ2V0IGNoaXBCbHVyQ2hhbmdlcygpOiBPYnNlcnZhYmxlPE1hdENoaXBFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRDaGlwU3RyZWFtKGNoaXAgPT4gY2hpcC5fb25CbHVyKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjaGlwIGdyaWQgdmFsdWUgaGFzIGJlZW4gY2hhbmdlZCBieSB0aGUgdXNlci4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNoYW5nZTogRXZlbnRFbWl0dGVyPE1hdENoaXBHcmlkQ2hhbmdlPiA9XG4gICAgbmV3IEV2ZW50RW1pdHRlcjxNYXRDaGlwR3JpZENoYW5nZT4oKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbmV2ZXIgdGhlIHJhdyB2YWx1ZSBvZiB0aGUgY2hpcC1ncmlkIGNoYW5nZXMuIFRoaXMgaXMgaGVyZSBwcmltYXJpbHlcbiAgICogdG8gZmFjaWxpdGF0ZSB0aGUgdHdvLXdheSBiaW5kaW5nIGZvciB0aGUgYHZhbHVlYCBpbnB1dC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZhbHVlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIEBDb250ZW50Q2hpbGRyZW4oTWF0Q2hpcFJvdywge1xuICAgIC8vIFdlIG5lZWQgdG8gdXNlIGBkZXNjZW5kYW50czogdHJ1ZWAsIGJlY2F1c2UgSXZ5IHdpbGwgbm8gbG9uZ2VyIG1hdGNoXG4gICAgLy8gaW5kaXJlY3QgZGVzY2VuZGFudHMgaWYgaXQncyBsZWZ0IGFzIGZhbHNlLlxuICAgIGRlc2NlbmRhbnRzOiB0cnVlLFxuICB9KVxuICAvLyBXZSBuZWVkIGFuIGluaXRpYWxpemVyIGhlcmUgdG8gYXZvaWQgYSBUUyBlcnJvci4gVGhlIHZhbHVlIHdpbGwgYmUgc2V0IGluIGBuZ0FmdGVyVmlld0luaXRgLlxuICBvdmVycmlkZSBfY2hpcHM6IFF1ZXJ5TGlzdDxNYXRDaGlwUm93PiA9IHVuZGVmaW5lZCE7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW5ldmVyIHRoZSBjb21wb25lbnQgc3RhdGUgY2hhbmdlcyBhbmQgc2hvdWxkIGNhdXNlIHRoZSBwYXJlbnRcbiAgICogZm9ybS1maWVsZCB0byB1cGRhdGUuIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgYE1hdEZvcm1GaWVsZENvbnRyb2xgLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICByZWFkb25seSBzdGF0ZUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGlwIGdyaWQgaXMgaW4gYW4gZXJyb3Igc3RhdGUuICovXG4gIGdldCBlcnJvclN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9lcnJvclN0YXRlVHJhY2tlci5lcnJvclN0YXRlO1xuICB9XG4gIHNldCBlcnJvclN0YXRlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZXJyb3JTdGF0ZVRyYWNrZXIuZXJyb3JTdGF0ZSA9IHZhbHVlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQE9wdGlvbmFsKCkgZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICBAT3B0aW9uYWwoKSBwYXJlbnRGb3JtOiBOZ0Zvcm0sXG4gICAgQE9wdGlvbmFsKCkgcGFyZW50Rm9ybUdyb3VwOiBGb3JtR3JvdXBEaXJlY3RpdmUsXG4gICAgZGVmYXVsdEVycm9yU3RhdGVNYXRjaGVyOiBFcnJvclN0YXRlTWF0Y2hlcixcbiAgICBAT3B0aW9uYWwoKSBAU2VsZigpIHB1YmxpYyBuZ0NvbnRyb2w6IE5nQ29udHJvbCxcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgY2hhbmdlRGV0ZWN0b3JSZWYsIGRpcik7XG5cbiAgICBpZiAodGhpcy5uZ0NvbnRyb2wpIHtcbiAgICAgIHRoaXMubmdDb250cm9sLnZhbHVlQWNjZXNzb3IgPSB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX2Vycm9yU3RhdGVUcmFja2VyID0gbmV3IF9FcnJvclN0YXRlVHJhY2tlcihcbiAgICAgIGRlZmF1bHRFcnJvclN0YXRlTWF0Y2hlcixcbiAgICAgIG5nQ29udHJvbCxcbiAgICAgIHBhcmVudEZvcm1Hcm91cCxcbiAgICAgIHBhcmVudEZvcm0sXG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcyxcbiAgICApO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuY2hpcEJsdXJDaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9ibHVyKCk7XG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gICAgfSk7XG5cbiAgICBtZXJnZSh0aGlzLmNoaXBGb2N1c0NoYW5nZXMsIHRoaXMuX2NoaXBzLmNoYW5nZXMpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcblxuICAgIGlmICghdGhpcy5fY2hpcElucHV0ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignbWF0LWNoaXAtZ3JpZCBtdXN0IGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBtYXRDaGlwSW5wdXRGb3IuJyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmICh0aGlzLm5nQ29udHJvbCkge1xuICAgICAgLy8gV2UgbmVlZCB0byByZS1ldmFsdWF0ZSB0aGlzIG9uIGV2ZXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUsIGJlY2F1c2UgdGhlcmUgYXJlIHNvbWVcbiAgICAgIC8vIGVycm9yIHRyaWdnZXJzIHRoYXQgd2UgY2FuJ3Qgc3Vic2NyaWJlIHRvIChlLmcuIHBhcmVudCBmb3JtIHN1Ym1pc3Npb25zKS4gVGhpcyBtZWFuc1xuICAgICAgLy8gdGhhdCB3aGF0ZXZlciBsb2dpYyBpcyBpbiBoZXJlIGhhcyB0byBiZSBzdXBlciBsZWFuIG9yIHdlIHJpc2sgZGVzdHJveWluZyB0aGUgcGVyZm9ybWFuY2UuXG4gICAgICB0aGlzLnVwZGF0ZUVycm9yU3RhdGUoKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogQXNzb2NpYXRlcyBhbiBIVE1MIGlucHV0IGVsZW1lbnQgd2l0aCB0aGlzIGNoaXAgZ3JpZC4gKi9cbiAgcmVnaXN0ZXJJbnB1dChpbnB1dEVsZW1lbnQ6IE1hdENoaXBUZXh0Q29udHJvbCk6IHZvaWQge1xuICAgIHRoaXMuX2NoaXBJbnB1dCA9IGlucHV0RWxlbWVudDtcbiAgICB0aGlzLl9jaGlwSW5wdXQuc2V0RGVzY3JpYmVkQnlJZHModGhpcy5fYXJpYURlc2NyaWJlZGJ5SWRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIE1hdEZvcm1GaWVsZENvbnRyb2wuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIG9uQ29udGFpbmVyQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgIXRoaXMuX29yaWdpbmF0ZXNGcm9tQ2hpcChldmVudCkpIHtcbiAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgZmlyc3QgY2hpcCBpbiB0aGlzIGNoaXAgZ3JpZCwgb3IgdGhlIGFzc29jaWF0ZWQgaW5wdXQgd2hlbiB0aGVyZVxuICAgKiBhcmUgbm8gZWxpZ2libGUgY2hpcHMuXG4gICAqL1xuICBvdmVycmlkZSBmb2N1cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCB0aGlzLl9jaGlwSW5wdXQuZm9jdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fY2hpcHMubGVuZ3RoIHx8IHRoaXMuX2NoaXBzLmZpcnN0LmRpc2FibGVkKSB7XG4gICAgICAvLyBEZWxheSB1bnRpbCB0aGUgbmV4dCB0aWNrLCBiZWNhdXNlIHRoaXMgY2FuIGNhdXNlIGEgXCJjaGFuZ2VkIGFmdGVyIGNoZWNrZWRcIlxuICAgICAgLy8gZXJyb3IgaWYgdGhlIGlucHV0IGRvZXMgc29tZXRoaW5nIG9uIGZvY3VzIChlLmcuIG9wZW5zIGFuIGF1dG9jb21wbGV0ZSkuXG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuX2NoaXBJbnB1dC5mb2N1cygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuX2tleU1hbmFnZXIuYWN0aXZlSXRlbTtcblxuICAgICAgaWYgKGFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgYWN0aXZlSXRlbS5mb2N1cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBNYXRGb3JtRmllbGRDb250cm9sLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXREZXNjcmliZWRCeUlkcyhpZHM6IHN0cmluZ1tdKSB7XG4gICAgLy8gV2UgbXVzdCBrZWVwIHRoaXMgdXAgdG8gZGF0ZSB0byBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgaWRzIGFyZSBzZXRcbiAgICAvLyBiZWZvcmUgdGhlIGNoaXAgaW5wdXQgaXMgcmVnaXN0ZXJlZC5cbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVkYnlJZHMgPSBpZHM7XG4gICAgdGhpcy5fY2hpcElucHV0Py5zZXREZXNjcmliZWRCeUlkcyhpZHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vIFRoZSB1c2VyIGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyB0aGUgY2hpbGQgY2hpcHMsIHNvIHdlIGp1c3Qgc3RvcmUgdGhlIHZhbHVlLlxuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICB9XG5cbiAgLyoqIFJlZnJlc2hlcyB0aGUgZXJyb3Igc3RhdGUgb2YgdGhlIGNoaXAgZ3JpZC4gKi9cbiAgdXBkYXRlRXJyb3JTdGF0ZSgpIHtcbiAgICB0aGlzLl9lcnJvclN0YXRlVHJhY2tlci51cGRhdGVFcnJvclN0YXRlKCk7XG4gIH1cblxuICAvKiogV2hlbiBibHVycmVkLCBtYXJrIHRoZSBmaWVsZCBhcyB0b3VjaGVkIHdoZW4gZm9jdXMgbW92ZWQgb3V0c2lkZSB0aGUgY2hpcCBncmlkLiAqL1xuICBfYmx1cigpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGZvY3VzIG1vdmVkIHRvIGNoaXAgaW5wdXQuXG4gICAgICAvLyBJZiB0aGUgZm9jdXMgaXMgbm90IG1vdmVkIHRvIGNoaXAgaW5wdXQsIG1hcmsgdGhlIGZpZWxkIGFzIHRvdWNoZWQuIElmIHRoZSBmb2N1cyBtb3ZlZFxuICAgICAgLy8gdG8gY2hpcCBpbnB1dCwgZG8gbm90aGluZy5cbiAgICAgIC8vIFRpbWVvdXQgaXMgbmVlZGVkIHRvIHdhaXQgZm9yIHRoZSBmb2N1cygpIGV2ZW50IHRyaWdnZXIgb24gY2hpcCBpbnB1dC5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgIHRoaXMuX3Byb3BhZ2F0ZUNoYW5nZXMoKTtcbiAgICAgICAgICB0aGlzLl9tYXJrQXNUb3VjaGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBgdGFiaW5kZXhgIGZyb20gdGhlIGNoaXAgZ3JpZCBhbmQgcmVzZXRzIGl0IGJhY2sgYWZ0ZXJ3YXJkcywgYWxsb3dpbmcgdGhlXG4gICAqIHVzZXIgdG8gdGFiIG91dCBvZiBpdC4gVGhpcyBwcmV2ZW50cyB0aGUgZ3JpZCBmcm9tIGNhcHR1cmluZyBmb2N1cyBhbmQgcmVkaXJlY3RpbmdcbiAgICogaXQgYmFjayB0byB0aGUgZmlyc3QgY2hpcCwgY3JlYXRpbmcgYSBmb2N1cyB0cmFwLCBpZiBpdCB1c2VyIHRyaWVzIHRvIHRhYiBhd2F5LlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIF9hbGxvd0ZvY3VzRXNjYXBlKCkge1xuICAgIGlmICghdGhpcy5fY2hpcElucHV0LmZvY3VzZWQpIHtcbiAgICAgIHN1cGVyLl9hbGxvd0ZvY3VzRXNjYXBlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEhhbmRsZXMgY3VzdG9tIGtleWJvYXJkIGV2ZW50cy4gKi9cbiAgb3ZlcnJpZGUgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICBjb25zdCBhY3RpdmVJdGVtID0gdGhpcy5fa2V5TWFuYWdlci5hY3RpdmVJdGVtO1xuXG4gICAgaWYgKGtleUNvZGUgPT09IFRBQikge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9jaGlwSW5wdXQuZm9jdXNlZCAmJlxuICAgICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JykgJiZcbiAgICAgICAgdGhpcy5fY2hpcHMubGVuZ3RoICYmXG4gICAgICAgICF0aGlzLl9jaGlwcy5sYXN0LmRpc2FibGVkXG4gICAgICApIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoYWN0aXZlSXRlbSkge1xuICAgICAgICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShhY3RpdmVJdGVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9mb2N1c0xhc3RDaGlwKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzZSB0aGUgc3VwZXIgbWV0aG9kIGhlcmUgc2luY2UgaXQgZG9lc24ndCBjaGVjayBmb3IgdGhlIGlucHV0XG4gICAgICAgIC8vIGZvY3VzZWQgc3RhdGUuIFRoaXMgYWxsb3dzIGZvY3VzIHRvIGVzY2FwZSBpZiB0aGVyZSdzIG9ubHkgb25lXG4gICAgICAgIC8vIGRpc2FibGVkIGNoaXAgbGVmdCBpbiB0aGUgbGlzdC5cbiAgICAgICAgc3VwZXIuX2FsbG93Rm9jdXNFc2NhcGUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9jaGlwSW5wdXQuZm9jdXNlZCkge1xuICAgICAgLy8gVGhlIHVwIGFuZCBkb3duIGFycm93cyBhcmUgc3VwcG9zZWQgdG8gbmF2aWdhdGUgYmV0d2VlbiB0aGUgaW5kaXZpZHVhbCByb3dzIGluIHRoZSBncmlkLlxuICAgICAgLy8gV2UgZG8gdGhpcyBieSBmaWx0ZXJpbmcgdGhlIGFjdGlvbnMgZG93biB0byB0aGUgb25lcyB0aGF0IGhhdmUgdGhlIHNhbWUgYF9pc1ByaW1hcnlgXG4gICAgICAvLyBmbGFnIGFzIHRoZSBhY3RpdmUgYWN0aW9uIGFuZCBtb3ZpbmcgZm9jdXMgYmV0d2VlbiB0aGVtIG91cnNlbGVzIGluc3RlYWQgb2YgZGVsZWdhdGluZ1xuICAgICAgLy8gdG8gdGhlIGtleSBtYW5hZ2VyLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlICMyOTM1OSBhbmQ6XG4gICAgICAvLyBodHRwczovL3d3dy53My5vcmcvV0FJL0FSSUEvYXBnL3BhdHRlcm5zL2dyaWQvZXhhbXBsZXMvbGF5b3V0LWdyaWRzLyNleDJfbGFiZWxcbiAgICAgIGlmICgoa2V5Q29kZSA9PT0gVVBfQVJST1cgfHwga2V5Q29kZSA9PT0gRE9XTl9BUlJPVykgJiYgYWN0aXZlSXRlbSkge1xuICAgICAgICBjb25zdCBlbGlnaWJsZUFjdGlvbnMgPSB0aGlzLl9jaGlwQWN0aW9ucy5maWx0ZXIoXG4gICAgICAgICAgYWN0aW9uID0+IGFjdGlvbi5faXNQcmltYXJ5ID09PSBhY3RpdmVJdGVtLl9pc1ByaW1hcnkgJiYgIXRoaXMuX3NraXBQcmVkaWNhdGUoYWN0aW9uKSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gZWxpZ2libGVBY3Rpb25zLmluZGV4T2YoYWN0aXZlSXRlbSk7XG4gICAgICAgIGNvbnN0IGRlbHRhID0gZXZlbnQua2V5Q29kZSA9PT0gVVBfQVJST1cgPyAtMSA6IDE7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJbmRleCA+IC0xICYmIHRoaXMuX2lzVmFsaWRJbmRleChjdXJyZW50SW5kZXggKyBkZWx0YSkpIHtcbiAgICAgICAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oZWxpZ2libGVBY3Rpb25zW2N1cnJlbnRJbmRleCArIGRlbHRhXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1cGVyLl9oYW5kbGVLZXlkb3duKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICBfZm9jdXNMYXN0Q2hpcCgpIHtcbiAgICBpZiAodGhpcy5fY2hpcHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9jaGlwcy5sYXN0LmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEVtaXRzIGNoYW5nZSBldmVudCB0byBzZXQgdGhlIG1vZGVsIHZhbHVlLiAqL1xuICBwcml2YXRlIF9wcm9wYWdhdGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IHZhbHVlVG9FbWl0ID0gdGhpcy5fY2hpcHMubGVuZ3RoID8gdGhpcy5fY2hpcHMudG9BcnJheSgpLm1hcChjaGlwID0+IGNoaXAudmFsdWUpIDogW107XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZVRvRW1pdDtcbiAgICB0aGlzLmNoYW5nZS5lbWl0KG5ldyBNYXRDaGlwR3JpZENoYW5nZSh0aGlzLCB2YWx1ZVRvRW1pdCkpO1xuICAgIHRoaXMudmFsdWVDaGFuZ2UuZW1pdCh2YWx1ZVRvRW1pdCk7XG4gICAgdGhpcy5fb25DaGFuZ2UodmFsdWVUb0VtaXQpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIE1hcmsgdGhlIGZpZWxkIGFzIHRvdWNoZWQgKi9cbiAgcHJpdmF0ZSBfbWFya0FzVG91Y2hlZCgpIHtcbiAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cbn1cbiJdfQ==