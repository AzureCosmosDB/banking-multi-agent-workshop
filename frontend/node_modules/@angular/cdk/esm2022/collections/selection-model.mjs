/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
/**
 * Class to be used to power selecting one or more options from a list.
 */
export class SelectionModel {
    /** Selected values. */
    get selected() {
        if (!this._selected) {
            this._selected = Array.from(this._selection.values());
        }
        return this._selected;
    }
    constructor(_multiple = false, initiallySelectedValues, _emitChanges = true, compareWith) {
        this._multiple = _multiple;
        this._emitChanges = _emitChanges;
        this.compareWith = compareWith;
        /** Currently-selected values. */
        this._selection = new Set();
        /** Keeps track of the deselected options that haven't been emitted by the change event. */
        this._deselectedToEmit = [];
        /** Keeps track of the selected options that haven't been emitted by the change event. */
        this._selectedToEmit = [];
        /** Event emitted when the value has changed. */
        this.changed = new Subject();
        if (initiallySelectedValues && initiallySelectedValues.length) {
            if (_multiple) {
                initiallySelectedValues.forEach(value => this._markSelected(value));
            }
            else {
                this._markSelected(initiallySelectedValues[0]);
            }
            // Clear the array in order to avoid firing the change event for preselected values.
            this._selectedToEmit.length = 0;
        }
    }
    /**
     * Selects a value or an array of values.
     * @param values The values to select
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    select(...values) {
        this._verifyValueAssignment(values);
        values.forEach(value => this._markSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }
    /**
     * Deselects a value or an array of values.
     * @param values The values to deselect
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    deselect(...values) {
        this._verifyValueAssignment(values);
        values.forEach(value => this._unmarkSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }
    /**
     * Sets the selected values
     * @param values The new selected values
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    setSelection(...values) {
        this._verifyValueAssignment(values);
        const oldValues = this.selected;
        const newSelectedSet = new Set(values);
        values.forEach(value => this._markSelected(value));
        oldValues
            .filter(value => !newSelectedSet.has(this._getConcreteValue(value, newSelectedSet)))
            .forEach(value => this._unmarkSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }
    /**
     * Toggles a value between selected and deselected.
     * @param value The value to toggle
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    toggle(value) {
        return this.isSelected(value) ? this.deselect(value) : this.select(value);
    }
    /**
     * Clears all of the selected values.
     * @param flushEvent Whether to flush the changes in an event.
     *   If false, the changes to the selection will be flushed along with the next event.
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    clear(flushEvent = true) {
        this._unmarkAll();
        const changed = this._hasQueuedChanges();
        if (flushEvent) {
            this._emitChangeEvent();
        }
        return changed;
    }
    /**
     * Determines whether a value is selected.
     */
    isSelected(value) {
        return this._selection.has(this._getConcreteValue(value));
    }
    /**
     * Determines whether the model does not have a value.
     */
    isEmpty() {
        return this._selection.size === 0;
    }
    /**
     * Determines whether the model has a value.
     */
    hasValue() {
        return !this.isEmpty();
    }
    /**
     * Sorts the selected values based on a predicate function.
     */
    sort(predicate) {
        if (this._multiple && this.selected) {
            this._selected.sort(predicate);
        }
    }
    /**
     * Gets whether multiple values can be selected.
     */
    isMultipleSelection() {
        return this._multiple;
    }
    /** Emits a change event and clears the records of selected and deselected values. */
    _emitChangeEvent() {
        // Clear the selected values so they can be re-cached.
        this._selected = null;
        if (this._selectedToEmit.length || this._deselectedToEmit.length) {
            this.changed.next({
                source: this,
                added: this._selectedToEmit,
                removed: this._deselectedToEmit,
            });
            this._deselectedToEmit = [];
            this._selectedToEmit = [];
        }
    }
    /** Selects a value. */
    _markSelected(value) {
        value = this._getConcreteValue(value);
        if (!this.isSelected(value)) {
            if (!this._multiple) {
                this._unmarkAll();
            }
            if (!this.isSelected(value)) {
                this._selection.add(value);
            }
            if (this._emitChanges) {
                this._selectedToEmit.push(value);
            }
        }
    }
    /** Deselects a value. */
    _unmarkSelected(value) {
        value = this._getConcreteValue(value);
        if (this.isSelected(value)) {
            this._selection.delete(value);
            if (this._emitChanges) {
                this._deselectedToEmit.push(value);
            }
        }
    }
    /** Clears out the selected values. */
    _unmarkAll() {
        if (!this.isEmpty()) {
            this._selection.forEach(value => this._unmarkSelected(value));
        }
    }
    /**
     * Verifies the value assignment and throws an error if the specified value array is
     * including multiple values while the selection model is not supporting multiple values.
     */
    _verifyValueAssignment(values) {
        if (values.length > 1 && !this._multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMultipleValuesInSingleSelectionError();
        }
    }
    /** Whether there are queued up change to be emitted. */
    _hasQueuedChanges() {
        return !!(this._deselectedToEmit.length || this._selectedToEmit.length);
    }
    /** Returns a value that is comparable to inputValue by applying compareWith function, returns the same inputValue otherwise. */
    _getConcreteValue(inputValue, selection) {
        if (!this.compareWith) {
            return inputValue;
        }
        else {
            selection = selection ?? this._selection;
            for (let selectedValue of selection) {
                if (this.compareWith(inputValue, selectedValue)) {
                    return selectedValue;
                }
            }
            return inputValue;
        }
    }
}
/**
 * Returns an error that reports that multiple values are passed into a selection model
 * with a single value.
 * @docs-private
 */
export function getMultipleValuesInSingleSelectionError() {
    return Error('Cannot pass multiple values into SelectionModel with single-value mode.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9zZWxlY3Rpb24tbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3Qjs7R0FFRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBYXpCLHVCQUF1QjtJQUN2QixJQUFJLFFBQVE7UUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBS0QsWUFDVSxZQUFZLEtBQUssRUFDekIsdUJBQTZCLEVBQ3JCLGVBQWUsSUFBSSxFQUNwQixXQUF1QztRQUh0QyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBRWpCLGlCQUFZLEdBQVosWUFBWSxDQUFPO1FBQ3BCLGdCQUFXLEdBQVgsV0FBVyxDQUE0QjtRQTVCaEQsaUNBQWlDO1FBQ3pCLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO1FBRWxDLDJGQUEyRjtRQUNuRixzQkFBaUIsR0FBUSxFQUFFLENBQUM7UUFFcEMseUZBQXlGO1FBQ2pGLG9CQUFlLEdBQVEsRUFBRSxDQUFDO1FBY2xDLGdEQUFnRDtRQUN2QyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQXNCLENBQUM7UUFRbkQsSUFBSSx1QkFBdUIsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5RCxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNkLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FB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SyxzQkFBc0IsQ0FBQyxNQUFXO1FBQ3hDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDNUYsTUFBTSx1Q0FBdUMsRUFBRSxDQUFDO1FBQ2xELENBQUM7SUFDSCxDQUFDO0lBRUQsd0RBQXdEO0lBQ2hELGlCQUFpQjtRQUN2QixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQsZ0lBQWdJO0lBQ3hILGlCQUFpQixDQUFDLFVBQWEsRUFBRSxTQUFrQjtRQUN6RCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sVUFBVSxDQUFDO1FBQ3BCLENBQUM7YUFBTSxDQUFDO1lBQ04sU0FBUyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3pDLEtBQUssSUFBSSxhQUFhLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ3BDLElBQUksSUFBSSxDQUFDLFdBQVksQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQkFDakQsT0FBTyxhQUFhLENBQUM7Z0JBQ3ZCLENBQUM7WUFDSCxDQUFDO1lBQ0QsT0FBTyxVQUFVLENBQUM7UUFDcEIsQ0FBQztJQUNILENBQUM7Q0FDRjtBQWVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsdUNBQXVDO0lBQ3JELE9BQU8sS0FBSyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7QUFDMUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIENsYXNzIHRvIGJlIHVzZWQgdG8gcG93ZXIgc2VsZWN0aW5nIG9uZSBvciBtb3JlIG9wdGlvbnMgZnJvbSBhIGxpc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWxlY3Rpb25Nb2RlbDxUPiB7XG4gIC8qKiBDdXJyZW50bHktc2VsZWN0ZWQgdmFsdWVzLiAqL1xuICBwcml2YXRlIF9zZWxlY3Rpb24gPSBuZXcgU2V0PFQ+KCk7XG5cbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBkZXNlbGVjdGVkIG9wdGlvbnMgdGhhdCBoYXZlbid0IGJlZW4gZW1pdHRlZCBieSB0aGUgY2hhbmdlIGV2ZW50LiAqL1xuICBwcml2YXRlIF9kZXNlbGVjdGVkVG9FbWl0OiBUW10gPSBbXTtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIHNlbGVjdGVkIG9wdGlvbnMgdGhhdCBoYXZlbid0IGJlZW4gZW1pdHRlZCBieSB0aGUgY2hhbmdlIGV2ZW50LiAqL1xuICBwcml2YXRlIF9zZWxlY3RlZFRvRW1pdDogVFtdID0gW107XG5cbiAgLyoqIENhY2hlIGZvciB0aGUgYXJyYXkgdmFsdWUgb2YgdGhlIHNlbGVjdGVkIGl0ZW1zLiAqL1xuICBwcml2YXRlIF9zZWxlY3RlZDogVFtdIHwgbnVsbDtcblxuICAvKiogU2VsZWN0ZWQgdmFsdWVzLiAqL1xuICBnZXQgc2VsZWN0ZWQoKTogVFtdIHtcbiAgICBpZiAoIXRoaXMuX3NlbGVjdGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IEFycmF5LmZyb20odGhpcy5fc2VsZWN0aW9uLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gIH1cblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZC4gKi9cbiAgcmVhZG9ubHkgY2hhbmdlZCA9IG5ldyBTdWJqZWN0PFNlbGVjdGlvbkNoYW5nZTxUPj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9tdWx0aXBsZSA9IGZhbHNlLFxuICAgIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzPzogVFtdLFxuICAgIHByaXZhdGUgX2VtaXRDaGFuZ2VzID0gdHJ1ZSxcbiAgICBwdWJsaWMgY29tcGFyZVdpdGg/OiAobzE6IFQsIG8yOiBUKSA9PiBib29sZWFuLFxuICApIHtcbiAgICBpZiAoaW5pdGlhbGx5U2VsZWN0ZWRWYWx1ZXMgJiYgaW5pdGlhbGx5U2VsZWN0ZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICBpZiAoX211bHRpcGxlKSB7XG4gICAgICAgIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzLmZvckVhY2godmFsdWUgPT4gdGhpcy5fbWFya1NlbGVjdGVkKHZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXJrU2VsZWN0ZWQoaW5pdGlhbGx5U2VsZWN0ZWRWYWx1ZXNbMF0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhciB0aGUgYXJyYXkgaW4gb3JkZXIgdG8gYXZvaWQgZmlyaW5nIHRoZSBjaGFuZ2UgZXZlbnQgZm9yIHByZXNlbGVjdGVkIHZhbHVlcy5cbiAgICAgIHRoaXMuX3NlbGVjdGVkVG9FbWl0Lmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG4gICAqIEBwYXJhbSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBzZWxlY3RcbiAgICogQHJldHVybiBXaGV0aGVyIHRoZSBzZWxlY3Rpb24gY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiB0aGlzIGNhbGxcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxNi4wLjAgbWFrZSByZXR1cm4gdHlwZSBib29sZWFuXG4gICAqL1xuICBzZWxlY3QoLi4udmFsdWVzOiBUW10pOiBib29sZWFuIHwgdm9pZCB7XG4gICAgdGhpcy5fdmVyaWZ5VmFsdWVBc3NpZ25tZW50KHZhbHVlcyk7XG4gICAgdmFsdWVzLmZvckVhY2godmFsdWUgPT4gdGhpcy5fbWFya1NlbGVjdGVkKHZhbHVlKSk7XG4gICAgY29uc3QgY2hhbmdlZCA9IHRoaXMuX2hhc1F1ZXVlZENoYW5nZXMoKTtcbiAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoKTtcbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlbGVjdHMgYSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG4gICAqIEBwYXJhbSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBkZXNlbGVjdFxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHRoaXMgY2FsbFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE2LjAuMCBtYWtlIHJldHVybiB0eXBlIGJvb2xlYW5cbiAgICovXG4gIGRlc2VsZWN0KC4uLnZhbHVlczogVFtdKTogYm9vbGVhbiB8IHZvaWQge1xuICAgIHRoaXMuX3ZlcmlmeVZhbHVlQXNzaWdubWVudCh2YWx1ZXMpO1xuICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHRoaXMuX3VubWFya1NlbGVjdGVkKHZhbHVlKSk7XG4gICAgY29uc3QgY2hhbmdlZCA9IHRoaXMuX2hhc1F1ZXVlZENoYW5nZXMoKTtcbiAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoKTtcbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzZWxlY3RlZCB2YWx1ZXNcbiAgICogQHBhcmFtIHZhbHVlcyBUaGUgbmV3IHNlbGVjdGVkIHZhbHVlc1xuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHRoaXMgY2FsbFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE2LjAuMCBtYWtlIHJldHVybiB0eXBlIGJvb2xlYW5cbiAgICovXG4gIHNldFNlbGVjdGlvbiguLi52YWx1ZXM6IFRbXSk6IGJvb2xlYW4gfCB2b2lkIHtcbiAgICB0aGlzLl92ZXJpZnlWYWx1ZUFzc2lnbm1lbnQodmFsdWVzKTtcbiAgICBjb25zdCBvbGRWYWx1ZXMgPSB0aGlzLnNlbGVjdGVkO1xuICAgIGNvbnN0IG5ld1NlbGVjdGVkU2V0ID0gbmV3IFNldCh2YWx1ZXMpO1xuICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHRoaXMuX21hcmtTZWxlY3RlZCh2YWx1ZSkpO1xuICAgIG9sZFZhbHVlc1xuICAgICAgLmZpbHRlcih2YWx1ZSA9PiAhbmV3U2VsZWN0ZWRTZXQuaGFzKHRoaXMuX2dldENvbmNyZXRlVmFsdWUodmFsdWUsIG5ld1NlbGVjdGVkU2V0KSkpXG4gICAgICAuZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLl91bm1hcmtTZWxlY3RlZCh2YWx1ZSkpO1xuICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLl9oYXNRdWV1ZWRDaGFuZ2VzKCk7XG4gICAgdGhpcy5fZW1pdENoYW5nZUV2ZW50KCk7XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyBhIHZhbHVlIGJldHdlZW4gc2VsZWN0ZWQgYW5kIGRlc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdG9nZ2xlXG4gICAqIEByZXR1cm4gV2hldGhlciB0aGUgc2VsZWN0aW9uIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgdGhpcyBjYWxsXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTYuMC4wIG1ha2UgcmV0dXJuIHR5cGUgYm9vbGVhblxuICAgKi9cbiAgdG9nZ2xlKHZhbHVlOiBUKTogYm9vbGVhbiB8IHZvaWQge1xuICAgIHJldHVybiB0aGlzLmlzU2VsZWN0ZWQodmFsdWUpID8gdGhpcy5kZXNlbGVjdCh2YWx1ZSkgOiB0aGlzLnNlbGVjdCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBvZiB0aGUgc2VsZWN0ZWQgdmFsdWVzLlxuICAgKiBAcGFyYW0gZmx1c2hFdmVudCBXaGV0aGVyIHRvIGZsdXNoIHRoZSBjaGFuZ2VzIGluIGFuIGV2ZW50LlxuICAgKiAgIElmIGZhbHNlLCB0aGUgY2hhbmdlcyB0byB0aGUgc2VsZWN0aW9uIHdpbGwgYmUgZmx1c2hlZCBhbG9uZyB3aXRoIHRoZSBuZXh0IGV2ZW50LlxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHRoaXMgY2FsbFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE2LjAuMCBtYWtlIHJldHVybiB0eXBlIGJvb2xlYW5cbiAgICovXG4gIGNsZWFyKGZsdXNoRXZlbnQgPSB0cnVlKTogYm9vbGVhbiB8IHZvaWQge1xuICAgIHRoaXMuX3VubWFya0FsbCgpO1xuICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLl9oYXNRdWV1ZWRDaGFuZ2VzKCk7XG4gICAgaWYgKGZsdXNoRXZlbnQpIHtcbiAgICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSB2YWx1ZSBpcyBzZWxlY3RlZC5cbiAgICovXG4gIGlzU2VsZWN0ZWQodmFsdWU6IFQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0aW9uLmhhcyh0aGlzLl9nZXRDb25jcmV0ZVZhbHVlKHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBtb2RlbCBkb2VzIG5vdCBoYXZlIGEgdmFsdWUuXG4gICAqL1xuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb24uc2l6ZSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG1vZGVsIGhhcyBhIHZhbHVlLlxuICAgKi9cbiAgaGFzVmFsdWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLmlzRW1wdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0cyB0aGUgc2VsZWN0ZWQgdmFsdWVzIGJhc2VkIG9uIGEgcHJlZGljYXRlIGZ1bmN0aW9uLlxuICAgKi9cbiAgc29ydChwcmVkaWNhdGU/OiAoYTogVCwgYjogVCkgPT4gbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX211bHRpcGxlICYmIHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkIS5zb3J0KHByZWRpY2F0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgd2hldGhlciBtdWx0aXBsZSB2YWx1ZXMgY2FuIGJlIHNlbGVjdGVkLlxuICAgKi9cbiAgaXNNdWx0aXBsZVNlbGVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlwbGU7XG4gIH1cblxuICAvKiogRW1pdHMgYSBjaGFuZ2UgZXZlbnQgYW5kIGNsZWFycyB0aGUgcmVjb3JkcyBvZiBzZWxlY3RlZCBhbmQgZGVzZWxlY3RlZCB2YWx1ZXMuICovXG4gIHByaXZhdGUgX2VtaXRDaGFuZ2VFdmVudCgpIHtcbiAgICAvLyBDbGVhciB0aGUgc2VsZWN0ZWQgdmFsdWVzIHNvIHRoZXkgY2FuIGJlIHJlLWNhY2hlZC5cbiAgICB0aGlzLl9zZWxlY3RlZCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRUb0VtaXQubGVuZ3RoIHx8IHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXQubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNoYW5nZWQubmV4dCh7XG4gICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgYWRkZWQ6IHRoaXMuX3NlbGVjdGVkVG9FbWl0LFxuICAgICAgICByZW1vdmVkOiB0aGlzLl9kZXNlbGVjdGVkVG9FbWl0LFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXQgPSBbXTtcbiAgICAgIHRoaXMuX3NlbGVjdGVkVG9FbWl0ID0gW107XG4gICAgfVxuICB9XG5cbiAgLyoqIFNlbGVjdHMgYSB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfbWFya1NlbGVjdGVkKHZhbHVlOiBUKSB7XG4gICAgdmFsdWUgPSB0aGlzLl9nZXRDb25jcmV0ZVZhbHVlKHZhbHVlKTtcbiAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZCh2YWx1ZSkpIHtcbiAgICAgIGlmICghdGhpcy5fbXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5fdW5tYXJrQWxsKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKHZhbHVlKSkge1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb24uYWRkKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2VtaXRDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkVG9FbWl0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXNlbGVjdHMgYSB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfdW5tYXJrU2VsZWN0ZWQodmFsdWU6IFQpIHtcbiAgICB2YWx1ZSA9IHRoaXMuX2dldENvbmNyZXRlVmFsdWUodmFsdWUpO1xuICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQodmFsdWUpKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb24uZGVsZXRlKHZhbHVlKTtcblxuICAgICAgaWYgKHRoaXMuX2VtaXRDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFycyBvdXQgdGhlIHNlbGVjdGVkIHZhbHVlcy4gKi9cbiAgcHJpdmF0ZSBfdW5tYXJrQWxsKCkge1xuICAgIGlmICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi5mb3JFYWNoKHZhbHVlID0+IHRoaXMuX3VubWFya1NlbGVjdGVkKHZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoZSB2YWx1ZSBhc3NpZ25tZW50IGFuZCB0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBhcnJheSBpc1xuICAgKiBpbmNsdWRpbmcgbXVsdGlwbGUgdmFsdWVzIHdoaWxlIHRoZSBzZWxlY3Rpb24gbW9kZWwgaXMgbm90IHN1cHBvcnRpbmcgbXVsdGlwbGUgdmFsdWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfdmVyaWZ5VmFsdWVBc3NpZ25tZW50KHZhbHVlczogVFtdKSB7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPiAxICYmICF0aGlzLl9tdWx0aXBsZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgZ2V0TXVsdGlwbGVWYWx1ZXNJblNpbmdsZVNlbGVjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlcmUgYXJlIHF1ZXVlZCB1cCBjaGFuZ2UgdG8gYmUgZW1pdHRlZC4gKi9cbiAgcHJpdmF0ZSBfaGFzUXVldWVkQ2hhbmdlcygpIHtcbiAgICByZXR1cm4gISEodGhpcy5fZGVzZWxlY3RlZFRvRW1pdC5sZW5ndGggfHwgdGhpcy5fc2VsZWN0ZWRUb0VtaXQubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgdmFsdWUgdGhhdCBpcyBjb21wYXJhYmxlIHRvIGlucHV0VmFsdWUgYnkgYXBwbHlpbmcgY29tcGFyZVdpdGggZnVuY3Rpb24sIHJldHVybnMgdGhlIHNhbWUgaW5wdXRWYWx1ZSBvdGhlcndpc2UuICovXG4gIHByaXZhdGUgX2dldENvbmNyZXRlVmFsdWUoaW5wdXRWYWx1ZTogVCwgc2VsZWN0aW9uPzogU2V0PFQ+KTogVCB7XG4gICAgaWYgKCF0aGlzLmNvbXBhcmVXaXRoKSB7XG4gICAgICByZXR1cm4gaW5wdXRWYWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uID8/IHRoaXMuX3NlbGVjdGlvbjtcbiAgICAgIGZvciAobGV0IHNlbGVjdGVkVmFsdWUgb2Ygc2VsZWN0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbXBhcmVXaXRoIShpbnB1dFZhbHVlLCBzZWxlY3RlZFZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBzZWxlY3RlZFZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5wdXRWYWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHZhbHVlIG9mIGEgTWF0U2VsZWN0aW9uTW9kZWwgaGFzIGNoYW5nZWQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0aW9uQ2hhbmdlPFQ+IHtcbiAgLyoqIE1vZGVsIHRoYXQgZGlzcGF0Y2hlZCB0aGUgZXZlbnQuICovXG4gIHNvdXJjZTogU2VsZWN0aW9uTW9kZWw8VD47XG4gIC8qKiBPcHRpb25zIHRoYXQgd2VyZSBhZGRlZCB0byB0aGUgbW9kZWwuICovXG4gIGFkZGVkOiBUW107XG4gIC8qKiBPcHRpb25zIHRoYXQgd2VyZSByZW1vdmVkIGZyb20gdGhlIG1vZGVsLiAqL1xuICByZW1vdmVkOiBUW107XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBlcnJvciB0aGF0IHJlcG9ydHMgdGhhdCBtdWx0aXBsZSB2YWx1ZXMgYXJlIHBhc3NlZCBpbnRvIGEgc2VsZWN0aW9uIG1vZGVsXG4gKiB3aXRoIGEgc2luZ2xlIHZhbHVlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TXVsdGlwbGVWYWx1ZXNJblNpbmdsZVNlbGVjdGlvbkVycm9yKCkge1xuICByZXR1cm4gRXJyb3IoJ0Nhbm5vdCBwYXNzIG11bHRpcGxlIHZhbHVlcyBpbnRvIFNlbGVjdGlvbk1vZGVsIHdpdGggc2luZ2xlLXZhbHVlIG1vZGUuJyk7XG59XG4iXX0=