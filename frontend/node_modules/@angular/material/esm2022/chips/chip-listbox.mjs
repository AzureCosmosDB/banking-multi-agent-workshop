/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, forwardRef, inject, Input, Output, QueryList, ViewEncapsulation, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { startWith, takeUntil } from 'rxjs/operators';
import { TAB } from '@angular/cdk/keycodes';
import { MatChipOption } from './chip-option';
import { MatChipSet } from './chip-set';
import { MAT_CHIPS_DEFAULT_OPTIONS } from './tokens';
import * as i0 from "@angular/core";
/** Change event object that is emitted when the chip listbox value has changed. */
export class MatChipListboxChange {
    constructor(
    /** Chip listbox that emitted the event. */
    source, 
    /** Value of the chip listbox when the event was emitted. */
    value) {
        this.source = source;
        this.value = value;
    }
}
/**
 * Provider Expression that allows mat-chip-listbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatChipListbox),
    multi: true,
};
/**
 * An extension of the MatChipSet component that supports chip selection.
 * Used with MatChipOption chips.
 */
export class MatChipListbox extends MatChipSet {
    constructor() {
        super(...arguments);
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
        // TODO: MDC uses `grid` here
        this._defaultRole = 'listbox';
        /** Default chip options. */
        this._defaultOptions = inject(MAT_CHIPS_DEFAULT_OPTIONS, { optional: true });
        this._multiple = false;
        /** Orientation of the chip list. */
        this.ariaOrientation = 'horizontal';
        this._selectable = true;
        /**
         * A function to compare the option values with the selected values. The first argument
         * is a value from an option. The second is a value from the selection. A boolean
         * should be returned.
         */
        this.compareWith = (o1, o2) => o1 === o2;
        /** Whether this chip listbox is required. */
        this.required = false;
        this._hideSingleSelectionIndicator = this._defaultOptions?.hideSingleSelectionIndicator ?? false;
        /** Event emitted when the selected chip listbox value has been changed by the user. */
        this.change = new EventEmitter();
        this._chips = undefined;
    }
    /** Whether the user should be allowed to select multiple chips. */
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._multiple = value;
        this._syncListboxProperties();
    }
    /** The array of selected chips inside the chip listbox. */
    get selected() {
        const selectedChips = this._chips.toArray().filter(chip => chip.selected);
        return this.multiple ? selectedChips : selectedChips[0];
    }
    /**
     * Whether or not this chip listbox is selectable.
     *
     * When a chip listbox is not selectable, the selected states for all
     * the chips inside the chip listbox are always ignored.
     */
    get selectable() {
        return this._selectable;
    }
    set selectable(value) {
        this._selectable = value;
        this._syncListboxProperties();
    }
    /** Whether checkmark indicator for single-selection options is hidden. */
    get hideSingleSelectionIndicator() {
        return this._hideSingleSelectionIndicator;
    }
    set hideSingleSelectionIndicator(value) {
        this._hideSingleSelectionIndicator = value;
        this._syncListboxProperties();
    }
    /** Combined stream of all of the child chips' selection change events. */
    get chipSelectionChanges() {
        return this._getChipStream(chip => chip.selectionChange);
    }
    /** Combined stream of all of the child chips' blur events. */
    get chipBlurChanges() {
        return this._getChipStream(chip => chip._onBlur);
    }
    /** The value of the listbox, which is the combined value of the selected chips. */
    get value() {
        return this._value;
    }
    set value(value) {
        this.writeValue(value);
        this._value = value;
    }
    ngAfterContentInit() {
        if (this._pendingInitialValue !== undefined) {
            Promise.resolve().then(() => {
                this._setSelectionByValue(this._pendingInitialValue, false);
                this._pendingInitialValue = undefined;
            });
        }
        this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
            // Update listbox selectable/multiple properties on chips
            this._syncListboxProperties();
        });
        this.chipBlurChanges.pipe(takeUntil(this._destroyed)).subscribe(() => this._blur());
        this.chipSelectionChanges.pipe(takeUntil(this._destroyed)).subscribe(event => {
            if (!this.multiple) {
                this._chips.forEach(chip => {
                    if (chip !== event.source) {
                        chip._setSelectedState(false, false, false);
                    }
                });
            }
            if (event.isUserInput) {
                this._propagateChanges();
            }
        });
    }
    /**
     * Focuses the first selected chip in this chip listbox, or the first non-disabled chip when there
     * are no selected chips.
     */
    focus() {
        if (this.disabled) {
            return;
        }
        const firstSelectedChip = this._getFirstSelectedChip();
        if (firstSelectedChip && !firstSelectedChip.disabled) {
            firstSelectedChip.focus();
        }
        else if (this._chips.length > 0) {
            this._keyManager.setFirstItemActive();
        }
        else {
            this._elementRef.nativeElement.focus();
        }
    }
    /**
     * Implemented as part of ControlValueAccessor.
     * @docs-private
     */
    writeValue(value) {
        if (this._chips) {
            this._setSelectionByValue(value, false);
        }
        else if (value != null) {
            this._pendingInitialValue = value;
        }
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
    }
    /** Selects all chips with value. */
    _setSelectionByValue(value, isUserInput = true) {
        this._clearSelection();
        if (Array.isArray(value)) {
            value.forEach(currentValue => this._selectValue(currentValue, isUserInput));
        }
        else {
            this._selectValue(value, isUserInput);
        }
    }
    /** When blurred, marks the field as touched when focus moved outside the chip listbox. */
    _blur() {
        if (!this.disabled) {
            // Wait to see if focus moves to an individual chip.
            setTimeout(() => {
                if (!this.focused) {
                    this._markAsTouched();
                }
            });
        }
    }
    _keydown(event) {
        if (event.keyCode === TAB) {
            super._allowFocusEscape();
        }
    }
    /** Marks the field as touched */
    _markAsTouched() {
        this._onTouched();
        this._changeDetectorRef.markForCheck();
    }
    /** Emits change event to set the model value. */
    _propagateChanges() {
        let valueToEmit = null;
        if (Array.isArray(this.selected)) {
            valueToEmit = this.selected.map(chip => chip.value);
        }
        else {
            valueToEmit = this.selected ? this.selected.value : undefined;
        }
        this._value = valueToEmit;
        this.change.emit(new MatChipListboxChange(this, valueToEmit));
        this._onChange(valueToEmit);
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Deselects every chip in the listbox.
     * @param skip Chip that should not be deselected.
     */
    _clearSelection(skip) {
        this._chips.forEach(chip => {
            if (chip !== skip) {
                chip.deselect();
            }
        });
    }
    /**
     * Finds and selects the chip based on its value.
     * @returns Chip that has the corresponding value.
     */
    _selectValue(value, isUserInput) {
        const correspondingChip = this._chips.find(chip => {
            return chip.value != null && this.compareWith(chip.value, value);
        });
        if (correspondingChip) {
            isUserInput ? correspondingChip.selectViaInteraction() : correspondingChip.select();
        }
        return correspondingChip;
    }
    /** Syncs the chip-listbox selection state with the individual chips. */
    _syncListboxProperties() {
        if (this._chips) {
            // Defer setting the value in order to avoid the "Expression
            // has changed after it was checked" errors from Angular.
            Promise.resolve().then(() => {
                this._chips.forEach(chip => {
                    chip._chipListMultiple = this.multiple;
                    chip.chipListSelectable = this._selectable;
                    chip._chipListHideSingleSelectionIndicator = this.hideSingleSelectionIndicator;
                    chip._changeDetectorRef.markForCheck();
                });
            });
        }
    }
    /** Returns the first selected chip in this listbox, or undefined if no chips are selected. */
    _getFirstSelectedChip() {
        if (Array.isArray(this.selected)) {
            return this.selected.length ? this.selected[0] : undefined;
        }
        else {
            return this.selected;
        }
    }
    /**
     * Determines if key manager should avoid putting a given chip action in the tab index. Skip
     * non-interactive actions since the user can't do anything with them.
     */
    _skipPredicate(action) {
        // Override the skip predicate in the base class to avoid skipping disabled chips. Allow
        // disabled chip options to receive focus to align with WAI ARIA recommendation. Normally WAI
        // ARIA's instructions are to exclude disabled items from the tab order, but it makes a few
        // exceptions for compound widgets.
        //
        // From [Developing a Keyboard Interface](
        // https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
        //   "For the following composite widget elements, keep them focusable when disabled: Options in a
        //   Listbox..."
        return !action.isInteractive;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipListbox, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatChipListbox, isStandalone: true, selector: "mat-chip-listbox", inputs: { multiple: ["multiple", "multiple", booleanAttribute], ariaOrientation: ["aria-orientation", "ariaOrientation"], selectable: ["selectable", "selectable", booleanAttribute], compareWith: "compareWith", required: ["required", "required", booleanAttribute], hideSingleSelectionIndicator: ["hideSingleSelectionIndicator", "hideSingleSelectionIndicator", booleanAttribute], value: "value" }, outputs: { change: "change" }, host: { listeners: { "focus": "focus()", "blur": "_blur()", "keydown": "_keydown($event)" }, properties: { "attr.role": "role", "tabIndex": "(disabled || empty) ? -1 : tabIndex", "attr.aria-describedby": "_ariaDescribedby || null", "attr.aria-required": "role ? required : null", "attr.aria-disabled": "disabled.toString()", "attr.aria-multiselectable": "multiple", "attr.aria-orientation": "ariaOrientation", "class.mat-mdc-chip-list-disabled": "disabled", "class.mat-mdc-chip-list-required": "required" }, classAttribute: "mdc-evolution-chip-set mat-mdc-chip-listbox" }, providers: [MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR], queries: [{ propertyName: "_chips", predicate: MatChipOption, descendants: true }], usesInheritance: true, ngImport: i0, template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [".mat-mdc-chip-set{display:flex}.mat-mdc-chip-set:focus{outline:none}.mat-mdc-chip-set .mdc-evolution-chip-set__chips{min-width:100%;margin-left:-8px;margin-right:0}.mat-mdc-chip-set .mdc-evolution-chip{margin:4px 0 4px 8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips{margin-left:0;margin-right:-8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip{margin-left:0;margin-right:8px}.mdc-evolution-chip-set__chips{display:flex;flex-flow:wrap;min-width:0}.mat-mdc-chip-set-stacked{flex-direction:column;align-items:flex-start}.mat-mdc-chip-set-stacked .mat-mdc-chip{width:100%}.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic{flex-grow:0}.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary{flex-basis:100%;justify-content:start}input.mat-mdc-chip-input{flex:1 0 150px;margin-left:8px}[dir=rtl] input.mat-mdc-chip-input{margin-left:0;margin-right:8px}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipListbox, decorators: [{
            type: Component,
            args: [{ selector: 'mat-chip-listbox', template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `, host: {
                        'class': 'mdc-evolution-chip-set mat-mdc-chip-listbox',
                        '[attr.role]': 'role',
                        '[tabIndex]': '(disabled || empty) ? -1 : tabIndex',
                        // TODO: replace this binding with use of AriaDescriber
                        '[attr.aria-describedby]': '_ariaDescribedby || null',
                        '[attr.aria-required]': 'role ? required : null',
                        '[attr.aria-disabled]': 'disabled.toString()',
                        '[attr.aria-multiselectable]': 'multiple',
                        '[attr.aria-orientation]': 'ariaOrientation',
                        '[class.mat-mdc-chip-list-disabled]': 'disabled',
                        '[class.mat-mdc-chip-list-required]': 'required',
                        '(focus)': 'focus()',
                        '(blur)': '_blur()',
                        '(keydown)': '_keydown($event)',
                    }, providers: [MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR], encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, styles: [".mat-mdc-chip-set{display:flex}.mat-mdc-chip-set:focus{outline:none}.mat-mdc-chip-set .mdc-evolution-chip-set__chips{min-width:100%;margin-left:-8px;margin-right:0}.mat-mdc-chip-set .mdc-evolution-chip{margin:4px 0 4px 8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips{margin-left:0;margin-right:-8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip{margin-left:0;margin-right:8px}.mdc-evolution-chip-set__chips{display:flex;flex-flow:wrap;min-width:0}.mat-mdc-chip-set-stacked{flex-direction:column;align-items:flex-start}.mat-mdc-chip-set-stacked .mat-mdc-chip{width:100%}.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic{flex-grow:0}.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary{flex-basis:100%;justify-content:start}input.mat-mdc-chip-input{flex:1 0 150px;margin-left:8px}[dir=rtl] input.mat-mdc-chip-input{margin-left:0;margin-right:8px}"] }]
        }], propDecorators: { multiple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], ariaOrientation: [{
                type: Input,
                args: ['aria-orientation']
            }], selectable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], compareWith: [{
                type: Input
            }], required: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hideSingleSelectionIndicator: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], value: [{
                type: Input
            }], change: [{
                type: Output
            }], _chips: [{
                type: ContentChildren,
                args: [MatChipOption, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true,
                    }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1saXN0Ym94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoaXBzL2NoaXAtbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZ0JBQWdCLEVBQ2hCLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsZUFBZSxFQUNmLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxFQUNULGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUMsT0FBTyxFQUFDLGFBQWEsRUFBeUIsTUFBTSxlQUFlLENBQUM7QUFDcEUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV0QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRW5ELG1GQUFtRjtBQUNuRixNQUFNLE9BQU8sb0JBQW9CO0lBQy9CO0lBQ0UsMkNBQTJDO0lBQ3BDLE1BQXNCO0lBQzdCLDREQUE0RDtJQUNyRCxLQUFVO1FBRlYsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFFdEIsVUFBSyxHQUFMLEtBQUssQ0FBSztJQUNoQixDQUFDO0NBQ0w7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUNBQXVDLEdBQVE7SUFDMUQsT0FBTyxFQUFFLGlCQUFpQjtJQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQztJQUM3QyxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRjs7O0dBR0c7QUE4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QUFFLGdCQUFnQixFQUFDO2dCQWlCVCxlQUFlO3NCQUF6QyxLQUFLO3VCQUFDLGtCQUFrQjtnQkFTckIsVUFBVTtzQkFEYixLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQWUzQixXQUFXO3NCQUFuQixLQUFLO2dCQUlOLFFBQVE7c0JBRFAsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFLaEMsNEJBQTRCO3NCQUQvQixLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQXVCaEMsS0FBSztzQkFEUixLQUFLO2dCQVdhLE1BQU07c0JBQXhCLE1BQU07Z0JBU0UsTUFBTTtzQkFOZCxlQUFlO3VCQUFDLGFBQWEsRUFBRTt3QkFDOUIsdUVBQXVFO3dCQUN2RSw4Q0FBOEM7d0JBQzlDLFdBQVcsRUFBRSxJQUFJO3FCQUNsQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBib29sZWFuQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgaW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1RBQn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7TWF0Q2hpcCwgTWF0Q2hpcEV2ZW50fSBmcm9tICcuL2NoaXAnO1xuaW1wb3J0IHtNYXRDaGlwT3B0aW9uLCBNYXRDaGlwU2VsZWN0aW9uQ2hhbmdlfSBmcm9tICcuL2NoaXAtb3B0aW9uJztcbmltcG9ydCB7TWF0Q2hpcFNldH0gZnJvbSAnLi9jaGlwLXNldCc7XG5pbXBvcnQge01hdENoaXBBY3Rpb259IGZyb20gJy4vY2hpcC1hY3Rpb24nO1xuaW1wb3J0IHtNQVRfQ0hJUFNfREVGQVVMVF9PUFRJT05TfSBmcm9tICcuL3Rva2Vucyc7XG5cbi8qKiBDaGFuZ2UgZXZlbnQgb2JqZWN0IHRoYXQgaXMgZW1pdHRlZCB3aGVuIHRoZSBjaGlwIGxpc3Rib3ggdmFsdWUgaGFzIGNoYW5nZWQuICovXG5leHBvcnQgY2xhc3MgTWF0Q2hpcExpc3Rib3hDaGFuZ2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQ2hpcCBsaXN0Ym94IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gICAgcHVibGljIHNvdXJjZTogTWF0Q2hpcExpc3Rib3gsXG4gICAgLyoqIFZhbHVlIG9mIHRoZSBjaGlwIGxpc3Rib3ggd2hlbiB0aGUgZXZlbnQgd2FzIGVtaXR0ZWQuICovXG4gICAgcHVibGljIHZhbHVlOiBhbnksXG4gICkge31cbn1cblxuLyoqXG4gKiBQcm92aWRlciBFeHByZXNzaW9uIHRoYXQgYWxsb3dzIG1hdC1jaGlwLWxpc3Rib3ggdG8gcmVnaXN0ZXIgYXMgYSBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAqIFRoaXMgYWxsb3dzIGl0IHRvIHN1cHBvcnQgWyhuZ01vZGVsKV0uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQ0hJUF9MSVNUQk9YX0NPTlRST0xfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hdENoaXBMaXN0Ym94KSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEFuIGV4dGVuc2lvbiBvZiB0aGUgTWF0Q2hpcFNldCBjb21wb25lbnQgdGhhdCBzdXBwb3J0cyBjaGlwIHNlbGVjdGlvbi5cbiAqIFVzZWQgd2l0aCBNYXRDaGlwT3B0aW9uIGNoaXBzLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtY2hpcC1saXN0Ym94JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwibWRjLWV2b2x1dGlvbi1jaGlwLXNldF9fY2hpcHNcIiByb2xlPVwicHJlc2VudGF0aW9uXCI+XG4gICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlVXJsOiAnY2hpcC1zZXQuY3NzJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtZGMtZXZvbHV0aW9uLWNoaXAtc2V0IG1hdC1tZGMtY2hpcC1saXN0Ym94JyxcbiAgICAnW2F0dHIucm9sZV0nOiAncm9sZScsXG4gICAgJ1t0YWJJbmRleF0nOiAnKGRpc2FibGVkIHx8IGVtcHR5KSA/IC0xIDogdGFiSW5kZXgnLFxuICAgIC8vIFRPRE86IHJlcGxhY2UgdGhpcyBiaW5kaW5nIHdpdGggdXNlIG9mIEFyaWFEZXNjcmliZXJcbiAgICAnW2F0dHIuYXJpYS1kZXNjcmliZWRieV0nOiAnX2FyaWFEZXNjcmliZWRieSB8fCBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1yZXF1aXJlZF0nOiAncm9sZSA/IHJlcXVpcmVkIDogbnVsbCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkLnRvU3RyaW5nKCknLFxuICAgICdbYXR0ci5hcmlhLW11bHRpc2VsZWN0YWJsZV0nOiAnbXVsdGlwbGUnLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdhcmlhT3JpZW50YXRpb24nLFxuICAgICdbY2xhc3MubWF0LW1kYy1jaGlwLWxpc3QtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtY2hpcC1saXN0LXJlcXVpcmVkXSc6ICdyZXF1aXJlZCcsXG4gICAgJyhmb2N1cyknOiAnZm9jdXMoKScsXG4gICAgJyhibHVyKSc6ICdfYmx1cigpJyxcbiAgICAnKGtleWRvd24pJzogJ19rZXlkb3duKCRldmVudCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtNQVRfQ0hJUF9MSVNUQk9YX0NPTlRST0xfVkFMVUVfQUNDRVNTT1JdLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcExpc3Rib3hcbiAgZXh0ZW5kcyBNYXRDaGlwU2V0XG4gIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95LCBDb250cm9sVmFsdWVBY2Nlc3Nvclxue1xuICAvKipcbiAgICogRnVuY3Rpb24gd2hlbiB0b3VjaGVkLiBTZXQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRhdGlvbi5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB3aGVuIGNoYW5nZWQuIFNldCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGltcGxlbWVudGF0aW9uLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBfb25DaGFuZ2U6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgLy8gVE9ETzogTURDIHVzZXMgYGdyaWRgIGhlcmVcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIF9kZWZhdWx0Um9sZSA9ICdsaXN0Ym94JztcblxuICAvKiogVmFsdWUgdGhhdCB3YXMgYXNzaWduZWQgYmVmb3JlIHRoZSBsaXN0Ym94IHdhcyBpbml0aWFsaXplZC4gKi9cbiAgcHJpdmF0ZSBfcGVuZGluZ0luaXRpYWxWYWx1ZTogYW55O1xuXG4gIC8qKiBEZWZhdWx0IGNoaXAgb3B0aW9ucy4gKi9cbiAgcHJpdmF0ZSBfZGVmYXVsdE9wdGlvbnMgPSBpbmplY3QoTUFUX0NISVBTX0RFRkFVTFRfT1BUSU9OUywge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgc2hvdWxkIGJlIGFsbG93ZWQgdG8gc2VsZWN0IG11bHRpcGxlIGNoaXBzLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlwbGU7XG4gIH1cbiAgc2V0IG11bHRpcGxlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbXVsdGlwbGUgPSB2YWx1ZTtcbiAgICB0aGlzLl9zeW5jTGlzdGJveFByb3BlcnRpZXMoKTtcbiAgfVxuICBwcml2YXRlIF9tdWx0aXBsZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgYXJyYXkgb2Ygc2VsZWN0ZWQgY2hpcHMgaW5zaWRlIHRoZSBjaGlwIGxpc3Rib3guICovXG4gIGdldCBzZWxlY3RlZCgpOiBNYXRDaGlwT3B0aW9uW10gfCBNYXRDaGlwT3B0aW9uIHtcbiAgICBjb25zdCBzZWxlY3RlZENoaXBzID0gdGhpcy5fY2hpcHMudG9BcnJheSgpLmZpbHRlcihjaGlwID0+IGNoaXAuc2VsZWN0ZWQpO1xuICAgIHJldHVybiB0aGlzLm11bHRpcGxlID8gc2VsZWN0ZWRDaGlwcyA6IHNlbGVjdGVkQ2hpcHNbMF07XG4gIH1cblxuICAvKiogT3JpZW50YXRpb24gb2YgdGhlIGNoaXAgbGlzdC4gKi9cbiAgQElucHV0KCdhcmlhLW9yaWVudGF0aW9uJykgYXJpYU9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ2hvcml6b250YWwnO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGlzIGNoaXAgbGlzdGJveCBpcyBzZWxlY3RhYmxlLlxuICAgKlxuICAgKiBXaGVuIGEgY2hpcCBsaXN0Ym94IGlzIG5vdCBzZWxlY3RhYmxlLCB0aGUgc2VsZWN0ZWQgc3RhdGVzIGZvciBhbGxcbiAgICogdGhlIGNoaXBzIGluc2lkZSB0aGUgY2hpcCBsaXN0Ym94IGFyZSBhbHdheXMgaWdub3JlZC5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IHNlbGVjdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGFibGU7XG4gIH1cbiAgc2V0IHNlbGVjdGFibGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9zZWxlY3RhYmxlID0gdmFsdWU7XG4gICAgdGhpcy5fc3luY0xpc3Rib3hQcm9wZXJ0aWVzKCk7XG4gIH1cbiAgcHJvdGVjdGVkIF9zZWxlY3RhYmxlOiBib29sZWFuID0gdHJ1ZTtcblxuICAvKipcbiAgICogQSBmdW5jdGlvbiB0byBjb21wYXJlIHRoZSBvcHRpb24gdmFsdWVzIHdpdGggdGhlIHNlbGVjdGVkIHZhbHVlcy4gVGhlIGZpcnN0IGFyZ3VtZW50XG4gICAqIGlzIGEgdmFsdWUgZnJvbSBhbiBvcHRpb24uIFRoZSBzZWNvbmQgaXMgYSB2YWx1ZSBmcm9tIHRoZSBzZWxlY3Rpb24uIEEgYm9vbGVhblxuICAgKiBzaG91bGQgYmUgcmV0dXJuZWQuXG4gICAqL1xuICBASW5wdXQoKSBjb21wYXJlV2l0aDogKG8xOiBhbnksIG8yOiBhbnkpID0+IGJvb2xlYW4gPSAobzE6IGFueSwgbzI6IGFueSkgPT4gbzEgPT09IG8yO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgY2hpcCBsaXN0Ym94IGlzIHJlcXVpcmVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIHJlcXVpcmVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgY2hlY2ttYXJrIGluZGljYXRvciBmb3Igc2luZ2xlLXNlbGVjdGlvbiBvcHRpb25zIGlzIGhpZGRlbi4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgaGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvcjtcbiAgfVxuICBzZXQgaGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvcih2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2hpZGVTaW5nbGVTZWxlY3Rpb25JbmRpY2F0b3IgPSB2YWx1ZTtcbiAgICB0aGlzLl9zeW5jTGlzdGJveFByb3BlcnRpZXMoKTtcbiAgfVxuICBwcml2YXRlIF9oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yOiBib29sZWFuID1cbiAgICB0aGlzLl9kZWZhdWx0T3B0aW9ucz8uaGlkZVNpbmdsZVNlbGVjdGlvbkluZGljYXRvciA/PyBmYWxzZTtcblxuICAvKiogQ29tYmluZWQgc3RyZWFtIG9mIGFsbCBvZiB0aGUgY2hpbGQgY2hpcHMnIHNlbGVjdGlvbiBjaGFuZ2UgZXZlbnRzLiAqL1xuICBnZXQgY2hpcFNlbGVjdGlvbkNoYW5nZXMoKTogT2JzZXJ2YWJsZTxNYXRDaGlwU2VsZWN0aW9uQ2hhbmdlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENoaXBTdHJlYW08TWF0Q2hpcFNlbGVjdGlvbkNoYW5nZSwgTWF0Q2hpcE9wdGlvbj4oY2hpcCA9PiBjaGlwLnNlbGVjdGlvbkNoYW5nZSk7XG4gIH1cblxuICAvKiogQ29tYmluZWQgc3RyZWFtIG9mIGFsbCBvZiB0aGUgY2hpbGQgY2hpcHMnIGJsdXIgZXZlbnRzLiAqL1xuICBnZXQgY2hpcEJsdXJDaGFuZ2VzKCk6IE9ic2VydmFibGU8TWF0Q2hpcEV2ZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENoaXBTdHJlYW0oY2hpcCA9PiBjaGlwLl9vbkJsdXIpO1xuICB9XG5cbiAgLyoqIFRoZSB2YWx1ZSBvZiB0aGUgbGlzdGJveCwgd2hpY2ggaXMgdGhlIGNvbWJpbmVkIHZhbHVlIG9mIHRoZSBzZWxlY3RlZCBjaGlwcy4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy53cml0ZVZhbHVlKHZhbHVlKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHByb3RlY3RlZCBfdmFsdWU6IGFueTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBzZWxlY3RlZCBjaGlwIGxpc3Rib3ggdmFsdWUgaGFzIGJlZW4gY2hhbmdlZCBieSB0aGUgdXNlci4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNoYW5nZTogRXZlbnRFbWl0dGVyPE1hdENoaXBMaXN0Ym94Q2hhbmdlPiA9XG4gICAgbmV3IEV2ZW50RW1pdHRlcjxNYXRDaGlwTGlzdGJveENoYW5nZT4oKTtcblxuICBAQ29udGVudENoaWxkcmVuKE1hdENoaXBPcHRpb24sIHtcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSBgZGVzY2VuZGFudHM6IHRydWVgLCBiZWNhdXNlIEl2eSB3aWxsIG5vIGxvbmdlciBtYXRjaFxuICAgIC8vIGluZGlyZWN0IGRlc2NlbmRhbnRzIGlmIGl0J3MgbGVmdCBhcyBmYWxzZS5cbiAgICBkZXNjZW5kYW50czogdHJ1ZSxcbiAgfSlcbiAgLy8gV2UgbmVlZCBhbiBpbml0aWFsaXplciBoZXJlIHRvIGF2b2lkIGEgVFMgZXJyb3IuIFRoZSB2YWx1ZSB3aWxsIGJlIHNldCBpbiBgbmdBZnRlclZpZXdJbml0YC5cbiAgb3ZlcnJpZGUgX2NoaXBzOiBRdWVyeUxpc3Q8TWF0Q2hpcE9wdGlvbj4gPSB1bmRlZmluZWQhO1xuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBpZiAodGhpcy5fcGVuZGluZ0luaXRpYWxWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0aW9uQnlWYWx1ZSh0aGlzLl9wZW5kaW5nSW5pdGlhbFZhbHVlLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdJbml0aWFsVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGlwcy5jaGFuZ2VzLnBpcGUoc3RhcnRXaXRoKG51bGwpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIC8vIFVwZGF0ZSBsaXN0Ym94IHNlbGVjdGFibGUvbXVsdGlwbGUgcHJvcGVydGllcyBvbiBjaGlwc1xuICAgICAgdGhpcy5fc3luY0xpc3Rib3hQcm9wZXJ0aWVzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNoaXBCbHVyQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fYmx1cigpKTtcbiAgICB0aGlzLmNoaXBTZWxlY3Rpb25DaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5fY2hpcHMuZm9yRWFjaChjaGlwID0+IHtcbiAgICAgICAgICBpZiAoY2hpcCAhPT0gZXZlbnQuc291cmNlKSB7XG4gICAgICAgICAgICBjaGlwLl9zZXRTZWxlY3RlZFN0YXRlKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudC5pc1VzZXJJbnB1dCkge1xuICAgICAgICB0aGlzLl9wcm9wYWdhdGVDaGFuZ2VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgZmlyc3Qgc2VsZWN0ZWQgY2hpcCBpbiB0aGlzIGNoaXAgbGlzdGJveCwgb3IgdGhlIGZpcnN0IG5vbi1kaXNhYmxlZCBjaGlwIHdoZW4gdGhlcmVcbiAgICogYXJlIG5vIHNlbGVjdGVkIGNoaXBzLlxuICAgKi9cbiAgb3ZlcnJpZGUgZm9jdXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaXJzdFNlbGVjdGVkQ2hpcCA9IHRoaXMuX2dldEZpcnN0U2VsZWN0ZWRDaGlwKCk7XG5cbiAgICBpZiAoZmlyc3RTZWxlY3RlZENoaXAgJiYgIWZpcnN0U2VsZWN0ZWRDaGlwLmRpc2FibGVkKSB7XG4gICAgICBmaXJzdFNlbGVjdGVkQ2hpcC5mb2N1cygpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fY2hpcHMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jaGlwcykge1xuICAgICAgdGhpcy5fc2V0U2VsZWN0aW9uQnlWYWx1ZSh2YWx1ZSwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcGVuZGluZ0luaXRpYWxWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBTZWxlY3RzIGFsbCBjaGlwcyB3aXRoIHZhbHVlLiAqL1xuICBfc2V0U2VsZWN0aW9uQnlWYWx1ZSh2YWx1ZTogYW55LCBpc1VzZXJJbnB1dDogYm9vbGVhbiA9IHRydWUpIHtcbiAgICB0aGlzLl9jbGVhclNlbGVjdGlvbigpO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKGN1cnJlbnRWYWx1ZSA9PiB0aGlzLl9zZWxlY3RWYWx1ZShjdXJyZW50VmFsdWUsIGlzVXNlcklucHV0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NlbGVjdFZhbHVlKHZhbHVlLCBpc1VzZXJJbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZW4gYmx1cnJlZCwgbWFya3MgdGhlIGZpZWxkIGFzIHRvdWNoZWQgd2hlbiBmb2N1cyBtb3ZlZCBvdXRzaWRlIHRoZSBjaGlwIGxpc3Rib3guICovXG4gIF9ibHVyKCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgLy8gV2FpdCB0byBzZWUgaWYgZm9jdXMgbW92ZXMgdG8gYW4gaW5kaXZpZHVhbCBjaGlwLlxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgdGhpcy5fbWFya0FzVG91Y2hlZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfa2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBUQUIpIHtcbiAgICAgIHN1cGVyLl9hbGxvd0ZvY3VzRXNjYXBlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIE1hcmtzIHRoZSBmaWVsZCBhcyB0b3VjaGVkICovXG4gIHByaXZhdGUgX21hcmtBc1RvdWNoZWQoKSB7XG4gICAgdGhpcy5fb25Ub3VjaGVkKCk7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogRW1pdHMgY2hhbmdlIGV2ZW50IHRvIHNldCB0aGUgbW9kZWwgdmFsdWUuICovXG4gIHByaXZhdGUgX3Byb3BhZ2F0ZUNoYW5nZXMoKTogdm9pZCB7XG4gICAgbGV0IHZhbHVlVG9FbWl0OiBhbnkgPSBudWxsO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5zZWxlY3RlZCkpIHtcbiAgICAgIHZhbHVlVG9FbWl0ID0gdGhpcy5zZWxlY3RlZC5tYXAoY2hpcCA9PiBjaGlwLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVUb0VtaXQgPSB0aGlzLnNlbGVjdGVkID8gdGhpcy5zZWxlY3RlZC52YWx1ZSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZVRvRW1pdDtcbiAgICB0aGlzLmNoYW5nZS5lbWl0KG5ldyBNYXRDaGlwTGlzdGJveENoYW5nZSh0aGlzLCB2YWx1ZVRvRW1pdCkpO1xuICAgIHRoaXMuX29uQ2hhbmdlKHZhbHVlVG9FbWl0KTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlbGVjdHMgZXZlcnkgY2hpcCBpbiB0aGUgbGlzdGJveC5cbiAgICogQHBhcmFtIHNraXAgQ2hpcCB0aGF0IHNob3VsZCBub3QgYmUgZGVzZWxlY3RlZC5cbiAgICovXG4gIHByaXZhdGUgX2NsZWFyU2VsZWN0aW9uKHNraXA/OiBNYXRDaGlwKTogdm9pZCB7XG4gICAgdGhpcy5fY2hpcHMuZm9yRWFjaChjaGlwID0+IHtcbiAgICAgIGlmIChjaGlwICE9PSBza2lwKSB7XG4gICAgICAgIGNoaXAuZGVzZWxlY3QoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbmQgc2VsZWN0cyB0aGUgY2hpcCBiYXNlZCBvbiBpdHMgdmFsdWUuXG4gICAqIEByZXR1cm5zIENoaXAgdGhhdCBoYXMgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWUuXG4gICAqL1xuICBwcml2YXRlIF9zZWxlY3RWYWx1ZSh2YWx1ZTogYW55LCBpc1VzZXJJbnB1dDogYm9vbGVhbik6IE1hdENoaXAgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNvcnJlc3BvbmRpbmdDaGlwID0gdGhpcy5fY2hpcHMuZmluZChjaGlwID0+IHtcbiAgICAgIHJldHVybiBjaGlwLnZhbHVlICE9IG51bGwgJiYgdGhpcy5jb21wYXJlV2l0aChjaGlwLnZhbHVlLCB2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICBpZiAoY29ycmVzcG9uZGluZ0NoaXApIHtcbiAgICAgIGlzVXNlcklucHV0ID8gY29ycmVzcG9uZGluZ0NoaXAuc2VsZWN0VmlhSW50ZXJhY3Rpb24oKSA6IGNvcnJlc3BvbmRpbmdDaGlwLnNlbGVjdCgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb3JyZXNwb25kaW5nQ2hpcDtcbiAgfVxuXG4gIC8qKiBTeW5jcyB0aGUgY2hpcC1saXN0Ym94IHNlbGVjdGlvbiBzdGF0ZSB3aXRoIHRoZSBpbmRpdmlkdWFsIGNoaXBzLiAqL1xuICBwcml2YXRlIF9zeW5jTGlzdGJveFByb3BlcnRpZXMoKSB7XG4gICAgaWYgKHRoaXMuX2NoaXBzKSB7XG4gICAgICAvLyBEZWZlciBzZXR0aW5nIHRoZSB2YWx1ZSBpbiBvcmRlciB0byBhdm9pZCB0aGUgXCJFeHByZXNzaW9uXG4gICAgICAvLyBoYXMgY2hhbmdlZCBhZnRlciBpdCB3YXMgY2hlY2tlZFwiIGVycm9ycyBmcm9tIEFuZ3VsYXIuXG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5fY2hpcHMuZm9yRWFjaChjaGlwID0+IHtcbiAgICAgICAgICBjaGlwLl9jaGlwTGlzdE11bHRpcGxlID0gdGhpcy5tdWx0aXBsZTtcbiAgICAgICAgICBjaGlwLmNoaXBMaXN0U2VsZWN0YWJsZSA9IHRoaXMuX3NlbGVjdGFibGU7XG4gICAgICAgICAgY2hpcC5fY2hpcExpc3RIaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yID0gdGhpcy5oaWRlU2luZ2xlU2VsZWN0aW9uSW5kaWNhdG9yO1xuICAgICAgICAgIGNoaXAuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBmaXJzdCBzZWxlY3RlZCBjaGlwIGluIHRoaXMgbGlzdGJveCwgb3IgdW5kZWZpbmVkIGlmIG5vIGNoaXBzIGFyZSBzZWxlY3RlZC4gKi9cbiAgcHJpdmF0ZSBfZ2V0Rmlyc3RTZWxlY3RlZENoaXAoKTogTWF0Q2hpcE9wdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5zZWxlY3RlZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkLmxlbmd0aCA/IHRoaXMuc2VsZWN0ZWRbMF0gOiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGtleSBtYW5hZ2VyIHNob3VsZCBhdm9pZCBwdXR0aW5nIGEgZ2l2ZW4gY2hpcCBhY3Rpb24gaW4gdGhlIHRhYiBpbmRleC4gU2tpcFxuICAgKiBub24taW50ZXJhY3RpdmUgYWN0aW9ucyBzaW5jZSB0aGUgdXNlciBjYW4ndCBkbyBhbnl0aGluZyB3aXRoIHRoZW0uXG4gICAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX3NraXBQcmVkaWNhdGUoYWN0aW9uOiBNYXRDaGlwQWN0aW9uKTogYm9vbGVhbiB7XG4gICAgLy8gT3ZlcnJpZGUgdGhlIHNraXAgcHJlZGljYXRlIGluIHRoZSBiYXNlIGNsYXNzIHRvIGF2b2lkIHNraXBwaW5nIGRpc2FibGVkIGNoaXBzLiBBbGxvd1xuICAgIC8vIGRpc2FibGVkIGNoaXAgb3B0aW9ucyB0byByZWNlaXZlIGZvY3VzIHRvIGFsaWduIHdpdGggV0FJIEFSSUEgcmVjb21tZW5kYXRpb24uIE5vcm1hbGx5IFdBSVxuICAgIC8vIEFSSUEncyBpbnN0cnVjdGlvbnMgYXJlIHRvIGV4Y2x1ZGUgZGlzYWJsZWQgaXRlbXMgZnJvbSB0aGUgdGFiIG9yZGVyLCBidXQgaXQgbWFrZXMgYSBmZXdcbiAgICAvLyBleGNlcHRpb25zIGZvciBjb21wb3VuZCB3aWRnZXRzLlxuICAgIC8vXG4gICAgLy8gRnJvbSBbRGV2ZWxvcGluZyBhIEtleWJvYXJkIEludGVyZmFjZV0oXG4gICAgLy8gaHR0cHM6Ly93d3cudzMub3JnL1dBSS9BUklBL2FwZy9wcmFjdGljZXMva2V5Ym9hcmQtaW50ZXJmYWNlLyk6XG4gICAgLy8gICBcIkZvciB0aGUgZm9sbG93aW5nIGNvbXBvc2l0ZSB3aWRnZXQgZWxlbWVudHMsIGtlZXAgdGhlbSBmb2N1c2FibGUgd2hlbiBkaXNhYmxlZDogT3B0aW9ucyBpbiBhXG4gICAgLy8gICBMaXN0Ym94Li4uXCJcbiAgICByZXR1cm4gIWFjdGlvbi5pc0ludGVyYWN0aXZlO1xuICB9XG59XG4iXX0=