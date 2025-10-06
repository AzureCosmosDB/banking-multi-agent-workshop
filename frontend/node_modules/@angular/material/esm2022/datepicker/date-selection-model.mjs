/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/core";
/** A class representing a range of dates. */
export class DateRange {
    constructor(
    /** The start date of the range. */
    start, 
    /** The end date of the range. */
    end) {
        this.start = start;
        this.end = end;
    }
}
/**
 * A selection model containing a date selection.
 * @docs-private
 */
export class MatDateSelectionModel {
    constructor(
    /** The current selection. */
    selection, _adapter) {
        this.selection = selection;
        this._adapter = _adapter;
        this._selectionChanged = new Subject();
        /** Emits when the selection has changed. */
        this.selectionChanged = this._selectionChanged;
        this.selection = selection;
    }
    /**
     * Updates the current selection in the model.
     * @param value New selection that should be assigned.
     * @param source Object that triggered the selection change.
     */
    updateSelection(value, source) {
        const oldValue = this.selection;
        this.selection = value;
        this._selectionChanged.next({ selection: value, source, oldValue });
    }
    ngOnDestroy() {
        this._selectionChanged.complete();
    }
    _isValidDateInstance(date) {
        return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateSelectionModel, deps: "invalid", target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateSelectionModel }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined }, { type: i1.DateAdapter }] });
/**
 * A selection model that contains a single date.
 * @docs-private
 */
export class MatSingleDateSelectionModel extends MatDateSelectionModel {
    constructor(adapter) {
        super(null, adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a single date selection, the added date
     * simply overwrites the previous selection
     */
    add(date) {
        super.updateSelection(date, this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        return this.selection != null && this._isValidDateInstance(this.selection);
    }
    /**
     * Checks whether the current selection is complete. In the case of a single date selection, this
     * is true if the current selection is not null.
     */
    isComplete() {
        return this.selection != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new MatSingleDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSingleDateSelectionModel, deps: [{ token: i1.DateAdapter }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSingleDateSelectionModel }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSingleDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.DateAdapter }] });
/**
 * A selection model that contains a date range.
 * @docs-private
 */
export class MatRangeDateSelectionModel extends MatDateSelectionModel {
    constructor(adapter) {
        super(new DateRange(null, null), adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a date range selection, the added date
     * fills in the next `null` value in the range. If both the start and the end already have a date,
     * the selection is reset so that the given date is the new `start` and the `end` is null.
     */
    add(date) {
        let { start, end } = this.selection;
        if (start == null) {
            start = date;
        }
        else if (end == null) {
            end = date;
        }
        else {
            start = date;
            end = null;
        }
        super.updateSelection(new DateRange(start, end), this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        const { start, end } = this.selection;
        // Empty ranges are valid.
        if (start == null && end == null) {
            return true;
        }
        // Complete ranges are only valid if both dates are valid and the start is before the end.
        if (start != null && end != null) {
            return (this._isValidDateInstance(start) &&
                this._isValidDateInstance(end) &&
                this._adapter.compareDate(start, end) <= 0);
        }
        // Partial ranges are valid if the start/end is valid.
        return ((start == null || this._isValidDateInstance(start)) &&
            (end == null || this._isValidDateInstance(end)));
    }
    /**
     * Checks whether the current selection is complete. In the case of a date range selection, this
     * is true if the current selection has a non-null `start` and `end`.
     */
    isComplete() {
        return this.selection.start != null && this.selection.end != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new MatRangeDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatRangeDateSelectionModel, deps: [{ token: i1.DateAdapter }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatRangeDateSelectionModel }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatRangeDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.DateAdapter }] });
/** @docs-private */
export function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new MatSingleDateSelectionModel(adapter);
}
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
export const MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: MatDateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
    useFactory: MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
/** @docs-private */
export function MAT_RANGE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new MatRangeDateSelectionModel(adapter);
}
/**
 * Used to provide a range selection model to a component.
 * @docs-private
 */
export const MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: MatDateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
    useFactory: MAT_RANGE_DATE_SELECTION_MODEL_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1zZWxlY3Rpb24tbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlLXNlbGVjdGlvbi1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7QUFFekMsNkNBQTZDO0FBQzdDLE1BQU0sT0FBTyxTQUFTO0lBUXBCO0lBQ0UsbUNBQW1DO0lBQzFCLEtBQWU7SUFDeEIsaUNBQWlDO0lBQ3hCLEdBQWE7UUFGYixVQUFLLEdBQUwsS0FBSyxDQUFVO1FBRWYsUUFBRyxHQUFILEdBQUcsQ0FBVTtJQUNyQixDQUFDO0NBQ0w7QUF1QkQ7OztHQUdHO0FBRUgsTUFBTSxPQUFnQixxQkFBcUI7SUFRekM7SUFDRSw2QkFBNkI7SUFDcEIsU0FBWSxFQUNYLFFBQXdCO1FBRHpCLGNBQVMsR0FBVCxTQUFTLENBQUc7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQVJuQixzQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBK0IsQ0FBQztRQUVoRiw0Q0FBNEM7UUFDNUMscUJBQWdCLEdBQTRDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQU9qRixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBQyxLQUFRLEVBQUUsTUFBZTtRQUN2QyxNQUFNLFFBQVEsR0FBSSxJQUF1QixDQUFDLFNBQVMsQ0FBQztRQUNuRCxJQUF1QixDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDM0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElB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QUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLHFCQUFxQixDQUFDLEVBQUUsV0FBVyxDQUFDO0lBQzVFLFVBQVUsRUFBRSx1Q0FBdUM7Q0FDcEQsQ0FBQztBQUVGLG9CQUFvQjtBQUNwQixNQUFNLFVBQVUsc0NBQXNDLENBQ3BELE1BQTRDLEVBQzVDLE9BQTZCO0lBRTdCLE9BQU8sTUFBTSxJQUFJLElBQUksMEJBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVDQUF1QyxHQUFvQjtJQUN0RSxPQUFPLEVBQUUscUJBQXFCO0lBQzlCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLHFCQUFxQixDQUFDLEVBQUUsV0FBVyxDQUFDO0lBQzVFLFVBQVUsRUFBRSxzQ0FBc0M7Q0FDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZhY3RvcnlQcm92aWRlciwgSW5qZWN0YWJsZSwgT3B0aW9uYWwsIFNraXBTZWxmLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEYXRlQWRhcHRlcn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogQSBjbGFzcyByZXByZXNlbnRpbmcgYSByYW5nZSBvZiBkYXRlcy4gKi9cbmV4cG9ydCBjbGFzcyBEYXRlUmFuZ2U8RD4ge1xuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IG9iamVjdHMgd2l0aCBhIGBzdGFydGAgYW5kIGBlbmRgIHByb3BlcnR5IGNhbid0IGJlIGFzc2lnbmVkIHRvIGEgdmFyaWFibGUgdGhhdFxuICAgKiBleHBlY3RzIGEgYERhdGVSYW5nZWBcbiAgICovXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnVzZWQtdmFyaWFibGVcbiAgcHJpdmF0ZSBfZGlzYWJsZVN0cnVjdHVyYWxFcXVpdmFsZW5jeTogbmV2ZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBzdGFydCBkYXRlIG9mIHRoZSByYW5nZS4gKi9cbiAgICByZWFkb25seSBzdGFydDogRCB8IG51bGwsXG4gICAgLyoqIFRoZSBlbmQgZGF0ZSBvZiB0aGUgcmFuZ2UuICovXG4gICAgcmVhZG9ubHkgZW5kOiBEIHwgbnVsbCxcbiAgKSB7fVxufVxuXG4vKipcbiAqIENvbmRpdGlvbmFsbHkgcGlja3MgdGhlIGRhdGUgdHlwZSwgaWYgYSBEYXRlUmFuZ2UgaXMgcGFzc2VkIGluLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFQ+ID0gVCBleHRlbmRzIERhdGVSYW5nZTxpbmZlciBEPiA/IEQgOiBOb25OdWxsYWJsZTxUPjtcblxuLyoqXG4gKiBFdmVudCBlbWl0dGVkIGJ5IHRoZSBkYXRlIHNlbGVjdGlvbiBtb2RlbCB3aGVuIGl0cyBzZWxlY3Rpb24gY2hhbmdlcy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4ge1xuICAvKiogTmV3IHZhbHVlIGZvciB0aGUgc2VsZWN0aW9uLiAqL1xuICBzZWxlY3Rpb246IFM7XG5cbiAgLyoqIE9iamVjdCB0aGF0IHRyaWdnZXJlZCB0aGUgY2hhbmdlLiAqL1xuICBzb3VyY2U6IHVua25vd247XG5cbiAgLyoqIFByZXZpb3VzIHZhbHVlICovXG4gIG9sZFZhbHVlPzogUztcbn1cblxuLyoqXG4gKiBBIHNlbGVjdGlvbiBtb2RlbCBjb250YWluaW5nIGEgZGF0ZSBzZWxlY3Rpb24uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRCA9IEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248Uz4+XG4gIGltcGxlbWVudHMgT25EZXN0cm95XG57XG4gIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbkNoYW5nZWQgPSBuZXcgU3ViamVjdDxEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHNlbGVjdGlvbiBoYXMgY2hhbmdlZC4gKi9cbiAgc2VsZWN0aW9uQ2hhbmdlZDogT2JzZXJ2YWJsZTxEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4+ID0gdGhpcy5fc2VsZWN0aW9uQ2hhbmdlZDtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBjdXJyZW50IHNlbGVjdGlvbi4gKi9cbiAgICByZWFkb25seSBzZWxlY3Rpb246IFMsXG4gICAgcHJvdGVjdGVkIF9hZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgKSB7XG4gICAgdGhpcy5zZWxlY3Rpb24gPSBzZWxlY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gaW4gdGhlIG1vZGVsLlxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IHNlbGVjdGlvbiB0aGF0IHNob3VsZCBiZSBhc3NpZ25lZC5cbiAgICogQHBhcmFtIHNvdXJjZSBPYmplY3QgdGhhdCB0cmlnZ2VyZWQgdGhlIHNlbGVjdGlvbiBjaGFuZ2UuXG4gICAqL1xuICB1cGRhdGVTZWxlY3Rpb24odmFsdWU6IFMsIHNvdXJjZTogdW5rbm93bikge1xuICAgIGNvbnN0IG9sZFZhbHVlID0gKHRoaXMgYXMge3NlbGVjdGlvbjogU30pLnNlbGVjdGlvbjtcbiAgICAodGhpcyBhcyB7c2VsZWN0aW9uOiBTfSkuc2VsZWN0aW9uID0gdmFsdWU7XG4gICAgdGhpcy5fc2VsZWN0aW9uQ2hhbmdlZC5uZXh0KHtzZWxlY3Rpb246IHZhbHVlLCBzb3VyY2UsIG9sZFZhbHVlfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2lzVmFsaWREYXRlSW5zdGFuY2UoZGF0ZTogRCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hZGFwdGVyLmlzRGF0ZUluc3RhbmNlKGRhdGUpICYmIHRoaXMuX2FkYXB0ZXIuaXNWYWxpZChkYXRlKTtcbiAgfVxuXG4gIC8qKiBBZGRzIGEgZGF0ZSB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uICovXG4gIGFic3RyYWN0IGFkZChkYXRlOiBEIHwgbnVsbCk6IHZvaWQ7XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyB2YWxpZC4gKi9cbiAgYWJzdHJhY3QgaXNWYWxpZCgpOiBib29sZWFuO1xuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgY29tcGxldGUuICovXG4gIGFic3RyYWN0IGlzQ29tcGxldGUoKTogYm9vbGVhbjtcblxuICAvKiogQ2xvbmVzIHRoZSBzZWxlY3Rpb24gbW9kZWwuICovXG4gIGFic3RyYWN0IGNsb25lKCk6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPjtcbn1cblxuLyoqXG4gKiBBIHNlbGVjdGlvbiBtb2RlbCB0aGF0IGNvbnRhaW5zIGEgc2luZ2xlIGRhdGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNYXRTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8RD4gZXh0ZW5kcyBNYXREYXRlU2VsZWN0aW9uTW9kZWw8RCB8IG51bGwsIEQ+IHtcbiAgY29uc3RydWN0b3IoYWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4pIHtcbiAgICBzdXBlcihudWxsLCBhZGFwdGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZGF0ZSB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uIEluIHRoZSBjYXNlIG9mIGEgc2luZ2xlIGRhdGUgc2VsZWN0aW9uLCB0aGUgYWRkZWQgZGF0ZVxuICAgKiBzaW1wbHkgb3ZlcndyaXRlcyB0aGUgcHJldmlvdXMgc2VsZWN0aW9uXG4gICAqL1xuICBhZGQoZGF0ZTogRCB8IG51bGwpIHtcbiAgICBzdXBlci51cGRhdGVTZWxlY3Rpb24oZGF0ZSwgdGhpcyk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIHZhbGlkLiAqL1xuICBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbiAhPSBudWxsICYmIHRoaXMuX2lzVmFsaWREYXRlSW5zdGFuY2UodGhpcy5zZWxlY3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyBjb21wbGV0ZS4gSW4gdGhlIGNhc2Ugb2YgYSBzaW5nbGUgZGF0ZSBzZWxlY3Rpb24sIHRoaXNcbiAgICogaXMgdHJ1ZSBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgbm90IG51bGwuXG4gICAqL1xuICBpc0NvbXBsZXRlKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbiAhPSBudWxsO1xuICB9XG5cbiAgLyoqIENsb25lcyB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBjbG9uZSgpIHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBNYXRTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8RD4odGhpcy5fYWRhcHRlcik7XG4gICAgY2xvbmUudXBkYXRlU2VsZWN0aW9uKHRoaXMuc2VsZWN0aW9uLCB0aGlzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHNlbGVjdGlvbiBtb2RlbCB0aGF0IGNvbnRhaW5zIGEgZGF0ZSByYW5nZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1hdFJhbmdlRGF0ZVNlbGVjdGlvbk1vZGVsPEQ+IGV4dGVuZHMgTWF0RGF0ZVNlbGVjdGlvbk1vZGVsPERhdGVSYW5nZTxEPiwgRD4ge1xuICBjb25zdHJ1Y3RvcihhZGFwdGVyOiBEYXRlQWRhcHRlcjxEPikge1xuICAgIHN1cGVyKG5ldyBEYXRlUmFuZ2U8RD4obnVsbCwgbnVsbCksIGFkYXB0ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBkYXRlIHRvIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gSW4gdGhlIGNhc2Ugb2YgYSBkYXRlIHJhbmdlIHNlbGVjdGlvbiwgdGhlIGFkZGVkIGRhdGVcbiAgICogZmlsbHMgaW4gdGhlIG5leHQgYG51bGxgIHZhbHVlIGluIHRoZSByYW5nZS4gSWYgYm90aCB0aGUgc3RhcnQgYW5kIHRoZSBlbmQgYWxyZWFkeSBoYXZlIGEgZGF0ZSxcbiAgICogdGhlIHNlbGVjdGlvbiBpcyByZXNldCBzbyB0aGF0IHRoZSBnaXZlbiBkYXRlIGlzIHRoZSBuZXcgYHN0YXJ0YCBhbmQgdGhlIGBlbmRgIGlzIG51bGwuXG4gICAqL1xuICBhZGQoZGF0ZTogRCB8IG51bGwpOiB2b2lkIHtcbiAgICBsZXQge3N0YXJ0LCBlbmR9ID0gdGhpcy5zZWxlY3Rpb247XG5cbiAgICBpZiAoc3RhcnQgPT0gbnVsbCkge1xuICAgICAgc3RhcnQgPSBkYXRlO1xuICAgIH0gZWxzZSBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgIGVuZCA9IGRhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gZGF0ZTtcbiAgICAgIGVuZCA9IG51bGw7XG4gICAgfVxuXG4gICAgc3VwZXIudXBkYXRlU2VsZWN0aW9uKG5ldyBEYXRlUmFuZ2U8RD4oc3RhcnQsIGVuZCksIHRoaXMpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyB2YWxpZC4gKi9cbiAgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSB0aGlzLnNlbGVjdGlvbjtcblxuICAgIC8vIEVtcHR5IHJhbmdlcyBhcmUgdmFsaWQuXG4gICAgaWYgKHN0YXJ0ID09IG51bGwgJiYgZW5kID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIENvbXBsZXRlIHJhbmdlcyBhcmUgb25seSB2YWxpZCBpZiBib3RoIGRhdGVzIGFyZSB2YWxpZCBhbmQgdGhlIHN0YXJ0IGlzIGJlZm9yZSB0aGUgZW5kLlxuICAgIGlmIChzdGFydCAhPSBudWxsICYmIGVuZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKHN0YXJ0KSAmJlxuICAgICAgICB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKGVuZCkgJiZcbiAgICAgICAgdGhpcy5fYWRhcHRlci5jb21wYXJlRGF0ZShzdGFydCwgZW5kKSA8PSAwXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFBhcnRpYWwgcmFuZ2VzIGFyZSB2YWxpZCBpZiB0aGUgc3RhcnQvZW5kIGlzIHZhbGlkLlxuICAgIHJldHVybiAoXG4gICAgICAoc3RhcnQgPT0gbnVsbCB8fCB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKHN0YXJ0KSkgJiZcbiAgICAgIChlbmQgPT0gbnVsbCB8fCB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKGVuZCkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgY29tcGxldGUuIEluIHRoZSBjYXNlIG9mIGEgZGF0ZSByYW5nZSBzZWxlY3Rpb24sIHRoaXNcbiAgICogaXMgdHJ1ZSBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGFzIGEgbm9uLW51bGwgYHN0YXJ0YCBhbmQgYGVuZGAuXG4gICAqL1xuICBpc0NvbXBsZXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5zdGFydCAhPSBudWxsICYmIHRoaXMuc2VsZWN0aW9uLmVuZCAhPSBudWxsO1xuICB9XG5cbiAgLyoqIENsb25lcyB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBjbG9uZSgpIHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBNYXRSYW5nZURhdGVTZWxlY3Rpb25Nb2RlbDxEPih0aGlzLl9hZGFwdGVyKTtcbiAgICBjbG9uZS51cGRhdGVTZWxlY3Rpb24odGhpcy5zZWxlY3Rpb24sIHRoaXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9TSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWShcbiAgcGFyZW50OiBNYXRTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8dW5rbm93bj4sXG4gIGFkYXB0ZXI6IERhdGVBZGFwdGVyPHVua25vd24+LFxuKSB7XG4gIHJldHVybiBwYXJlbnQgfHwgbmV3IE1hdFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbChhZGFwdGVyKTtcbn1cblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSBzaW5nbGUgc2VsZWN0aW9uIG1vZGVsIHRvIGEgY29tcG9uZW50LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgTUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUjogRmFjdG9yeVByb3ZpZGVyID0ge1xuICBwcm92aWRlOiBNYXREYXRlU2VsZWN0aW9uTW9kZWwsXG4gIGRlcHM6IFtbbmV3IE9wdGlvbmFsKCksIG5ldyBTa2lwU2VsZigpLCBNYXREYXRlU2VsZWN0aW9uTW9kZWxdLCBEYXRlQWRhcHRlcl0sXG4gIHVzZUZhY3Rvcnk6IE1BVF9TSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWSxcbn07XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFUX1JBTkdFX0RBVEVfU0VMRUNUSU9OX01PREVMX0ZBQ1RPUlkoXG4gIHBhcmVudDogTWF0U2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsPHVua25vd24+LFxuICBhZGFwdGVyOiBEYXRlQWRhcHRlcjx1bmtub3duPixcbikge1xuICByZXR1cm4gcGFyZW50IHx8IG5ldyBNYXRSYW5nZURhdGVTZWxlY3Rpb25Nb2RlbChhZGFwdGVyKTtcbn1cblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSByYW5nZSBzZWxlY3Rpb24gbW9kZWwgdG8gYSBjb21wb25lbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVI6IEZhY3RvcnlQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogTWF0RGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgTWF0RGF0ZVNlbGVjdGlvbk1vZGVsXSwgRGF0ZUFkYXB0ZXJdLFxuICB1c2VGYWN0b3J5OiBNQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWSxcbn07XG4iXX0=