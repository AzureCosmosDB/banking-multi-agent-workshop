/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Inject, InjectionToken, Input, Optional, Output, booleanAttribute, } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { getSortDuplicateSortableIdError, getSortHeaderMissingIdError, getSortInvalidDirectionError, } from './sort-errors';
import * as i0 from "@angular/core";
/** Injection token to be used to override the default options for `mat-sort`. */
export const MAT_SORT_DEFAULT_OPTIONS = new InjectionToken('MAT_SORT_DEFAULT_OPTIONS');
/** Container for MatSortables to manage the sort state and provide default sort parameters. */
export class MatSort {
    /** The sort direction of the currently active MatSortable. */
    get direction() {
        return this._direction;
    }
    set direction(direction) {
        if (direction &&
            direction !== 'asc' &&
            direction !== 'desc' &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getSortInvalidDirectionError(direction);
        }
        this._direction = direction;
    }
    constructor(_defaultOptions) {
        this._defaultOptions = _defaultOptions;
        this._initializedStream = new ReplaySubject(1);
        /** Collection of all registered sortables that this directive manages. */
        this.sortables = new Map();
        /** Used to notify any child components listening to state changes. */
        this._stateChanges = new Subject();
        /**
         * The direction to set when an MatSortable is initially sorted.
         * May be overridden by the MatSortable's sort start.
         */
        this.start = 'asc';
        this._direction = '';
        /** Whether the sortable is disabled. */
        this.disabled = false;
        /** Event emitted when the user changes either the active sort or sort direction. */
        this.sortChange = new EventEmitter();
        /** Emits when the paginator is initialized. */
        this.initialized = this._initializedStream;
    }
    /**
     * Register function to be used by the contained MatSortables. Adds the MatSortable to the
     * collection of MatSortables.
     */
    register(sortable) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!sortable.id) {
                throw getSortHeaderMissingIdError();
            }
            if (this.sortables.has(sortable.id)) {
                throw getSortDuplicateSortableIdError(sortable.id);
            }
        }
        this.sortables.set(sortable.id, sortable);
    }
    /**
     * Unregister function to be used by the contained MatSortables. Removes the MatSortable from the
     * collection of contained MatSortables.
     */
    deregister(sortable) {
        this.sortables.delete(sortable.id);
    }
    /** Sets the active sort id and determines the new sort direction. */
    sort(sortable) {
        if (this.active != sortable.id) {
            this.active = sortable.id;
            this.direction = sortable.start ? sortable.start : this.start;
        }
        else {
            this.direction = this.getNextSortDirection(sortable);
        }
        this.sortChange.emit({ active: this.active, direction: this.direction });
    }
    /** Returns the next sort direction of the active sortable, checking for potential overrides. */
    getNextSortDirection(sortable) {
        if (!sortable) {
            return '';
        }
        // Get the sort direction cycle with the potential sortable overrides.
        const disableClear = sortable?.disableClear ?? this.disableClear ?? !!this._defaultOptions?.disableClear;
        let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);
        // Get and return the next direction in the cycle
        let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
        if (nextDirectionIndex >= sortDirectionCycle.length) {
            nextDirectionIndex = 0;
        }
        return sortDirectionCycle[nextDirectionIndex];
    }
    ngOnInit() {
        this._initializedStream.next();
    }
    ngOnChanges() {
        this._stateChanges.next();
    }
    ngOnDestroy() {
        this._stateChanges.complete();
        this._initializedStream.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSort, deps: [{ token: MAT_SORT_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatSort, isStandalone: true, selector: "[matSort]", inputs: { active: ["matSortActive", "active"], start: ["matSortStart", "start"], direction: ["matSortDirection", "direction"], disableClear: ["matSortDisableClear", "disableClear", booleanAttribute], disabled: ["matSortDisabled", "disabled", booleanAttribute] }, outputs: { sortChange: "matSortChange" }, host: { classAttribute: "mat-sort" }, exportAs: ["matSort"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSort, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matSort]',
                    exportAs: 'matSort',
                    host: {
                        'class': 'mat-sort',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_SORT_DEFAULT_OPTIONS]
                }] }], propDecorators: { active: [{
                type: Input,
                args: ['matSortActive']
            }], start: [{
                type: Input,
                args: ['matSortStart']
            }], direction: [{
                type: Input,
                args: ['matSortDirection']
            }], disableClear: [{
                type: Input,
                args: [{ alias: 'matSortDisableClear', transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ alias: 'matSortDisabled', transform: booleanAttribute }]
            }], sortChange: [{
                type: Output,
                args: ['matSortChange']
            }] } });
/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start, disableClear) {
    let sortOrder = ['asc', 'desc'];
    if (start == 'desc') {
        sortOrder.reverse();
    }
    if (!disableClear) {
        sortOrder.push('');
    }
    return sortOrder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zb3J0L3NvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBSUwsUUFBUSxFQUNSLE1BQU0sRUFDTixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFhLGFBQWEsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFeEQsT0FBTyxFQUNMLCtCQUErQixFQUMvQiwyQkFBMkIsRUFDM0IsNEJBQTRCLEdBQzdCLE1BQU0sZUFBZSxDQUFDOztBQWtDdkIsaUZBQWlGO0FBQ2pGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLElBQUksY0FBYyxDQUN4RCwwQkFBMEIsQ0FDM0IsQ0FBQztBQUVGLCtGQUErRjtBQVMvRixNQUFNLE9BQU8sT0FBTztJQWtCbEIsOERBQThEO0lBQzlELElBQ0ksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBQ0QsSUFBSSxTQUFTLENBQUMsU0FBd0I7UUFDcEMsSUFDRSxTQUFTO1lBQ1QsU0FBUyxLQUFLLEtBQUs7WUFDbkIsU0FBUyxLQUFLLE1BQU07WUFDcEIsQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQy9DLENBQUM7WUFDRCxNQUFNLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM5QixDQUFDO0lBb0JELFlBR1UsZUFBdUM7UUFBdkMsb0JBQWUsR0FBZixlQUFlLENBQXdCO1FBdkR6Qyx1QkFBa0IsR0FBRyxJQUFJLGFBQWEsQ0FBTyxDQUFDLENBQUMsQ0FBQztRQUV4RCwwRUFB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QUFNLEVBQUUsQ0FBQztRQUNwQixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFJlcGxheVN1YmplY3QsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtTb3J0RGlyZWN0aW9ufSBmcm9tICcuL3NvcnQtZGlyZWN0aW9uJztcbmltcG9ydCB7XG4gIGdldFNvcnREdXBsaWNhdGVTb3J0YWJsZUlkRXJyb3IsXG4gIGdldFNvcnRIZWFkZXJNaXNzaW5nSWRFcnJvcixcbiAgZ2V0U29ydEludmFsaWREaXJlY3Rpb25FcnJvcixcbn0gZnJvbSAnLi9zb3J0LWVycm9ycyc7XG5cbi8qKiBQb3NpdGlvbiBvZiB0aGUgYXJyb3cgdGhhdCBkaXNwbGF5cyB3aGVuIHNvcnRlZC4gKi9cbmV4cG9ydCB0eXBlIFNvcnRIZWFkZXJBcnJvd1Bvc2l0aW9uID0gJ2JlZm9yZScgfCAnYWZ0ZXInO1xuXG4vKiogSW50ZXJmYWNlIGZvciBhIGRpcmVjdGl2ZSB0aGF0IGhvbGRzIHNvcnRpbmcgc3RhdGUgY29uc3VtZWQgYnkgYE1hdFNvcnRIZWFkZXJgLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRTb3J0YWJsZSB7XG4gIC8qKiBUaGUgaWQgb2YgdGhlIGNvbHVtbiBiZWluZyBzb3J0ZWQuICovXG4gIGlkOiBzdHJpbmc7XG5cbiAgLyoqIFN0YXJ0aW5nIHNvcnQgZGlyZWN0aW9uLiAqL1xuICBzdGFydDogU29ydERpcmVjdGlvbjtcblxuICAvKiogV2hldGhlciB0byBkaXNhYmxlIGNsZWFyaW5nIHRoZSBzb3J0aW5nIHN0YXRlLiAqL1xuICBkaXNhYmxlQ2xlYXI6IGJvb2xlYW47XG59XG5cbi8qKiBUaGUgY3VycmVudCBzb3J0IHN0YXRlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTb3J0IHtcbiAgLyoqIFRoZSBpZCBvZiB0aGUgY29sdW1uIGJlaW5nIHNvcnRlZC4gKi9cbiAgYWN0aXZlOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBzb3J0IGRpcmVjdGlvbi4gKi9cbiAgZGlyZWN0aW9uOiBTb3J0RGlyZWN0aW9uO1xufVxuXG4vKiogRGVmYXVsdCBvcHRpb25zIGZvciBgbWF0LXNvcnRgLiAgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0U29ydERlZmF1bHRPcHRpb25zIHtcbiAgLyoqIFdoZXRoZXIgdG8gZGlzYWJsZSBjbGVhcmluZyB0aGUgc29ydGluZyBzdGF0ZS4gKi9cbiAgZGlzYWJsZUNsZWFyPzogYm9vbGVhbjtcbiAgLyoqIFBvc2l0aW9uIG9mIHRoZSBhcnJvdyB0aGF0IGRpc3BsYXlzIHdoZW4gc29ydGVkLiAqL1xuICBhcnJvd1Bvc2l0aW9uPzogU29ydEhlYWRlckFycm93UG9zaXRpb247XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdG8gYmUgdXNlZCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgbWF0LXNvcnRgLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9TT1JUX0RFRkFVTFRfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRTb3J0RGVmYXVsdE9wdGlvbnM+KFxuICAnTUFUX1NPUlRfREVGQVVMVF9PUFRJT05TJyxcbik7XG5cbi8qKiBDb250YWluZXIgZm9yIE1hdFNvcnRhYmxlcyB0byBtYW5hZ2UgdGhlIHNvcnQgc3RhdGUgYW5kIHByb3ZpZGUgZGVmYXVsdCBzb3J0IHBhcmFtZXRlcnMuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0U29ydF0nLFxuICBleHBvcnRBczogJ21hdFNvcnQnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1zb3J0JyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U29ydCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQge1xuICBwcml2YXRlIF9pbml0aWFsaXplZFN0cmVhbSA9IG5ldyBSZXBsYXlTdWJqZWN0PHZvaWQ+KDEpO1xuXG4gIC8qKiBDb2xsZWN0aW9uIG9mIGFsbCByZWdpc3RlcmVkIHNvcnRhYmxlcyB0aGF0IHRoaXMgZGlyZWN0aXZlIG1hbmFnZXMuICovXG4gIHNvcnRhYmxlcyA9IG5ldyBNYXA8c3RyaW5nLCBNYXRTb3J0YWJsZT4oKTtcblxuICAvKiogVXNlZCB0byBub3RpZnkgYW55IGNoaWxkIGNvbXBvbmVudHMgbGlzdGVuaW5nIHRvIHN0YXRlIGNoYW5nZXMuICovXG4gIHJlYWRvbmx5IF9zdGF0ZUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIG1vc3QgcmVjZW50bHkgc29ydGVkIE1hdFNvcnRhYmxlLiAqL1xuICBASW5wdXQoJ21hdFNvcnRBY3RpdmUnKSBhY3RpdmU6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGRpcmVjdGlvbiB0byBzZXQgd2hlbiBhbiBNYXRTb3J0YWJsZSBpcyBpbml0aWFsbHkgc29ydGVkLlxuICAgKiBNYXkgYmUgb3ZlcnJpZGRlbiBieSB0aGUgTWF0U29ydGFibGUncyBzb3J0IHN0YXJ0LlxuICAgKi9cbiAgQElucHV0KCdtYXRTb3J0U3RhcnQnKSBzdGFydDogU29ydERpcmVjdGlvbiA9ICdhc2MnO1xuXG4gIC8qKiBUaGUgc29ydCBkaXJlY3Rpb24gb2YgdGhlIGN1cnJlbnRseSBhY3RpdmUgTWF0U29ydGFibGUuICovXG4gIEBJbnB1dCgnbWF0U29ydERpcmVjdGlvbicpXG4gIGdldCBkaXJlY3Rpb24oKTogU29ydERpcmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbjtcbiAgfVxuICBzZXQgZGlyZWN0aW9uKGRpcmVjdGlvbjogU29ydERpcmVjdGlvbikge1xuICAgIGlmIChcbiAgICAgIGRpcmVjdGlvbiAmJlxuICAgICAgZGlyZWN0aW9uICE9PSAnYXNjJyAmJlxuICAgICAgZGlyZWN0aW9uICE9PSAnZGVzYycgJiZcbiAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBnZXRTb3J0SW52YWxpZERpcmVjdGlvbkVycm9yKGRpcmVjdGlvbik7XG4gICAgfVxuICAgIHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgfVxuICBwcml2YXRlIF9kaXJlY3Rpb246IFNvcnREaXJlY3Rpb24gPSAnJztcblxuICAvKipcbiAgICogV2hldGhlciB0byBkaXNhYmxlIHRoZSB1c2VyIGZyb20gY2xlYXJpbmcgdGhlIHNvcnQgYnkgZmluaXNoaW5nIHRoZSBzb3J0IGRpcmVjdGlvbiBjeWNsZS5cbiAgICogTWF5IGJlIG92ZXJyaWRkZW4gYnkgdGhlIE1hdFNvcnRhYmxlJ3MgZGlzYWJsZSBjbGVhciBpbnB1dC5cbiAgICovXG4gIEBJbnB1dCh7YWxpYXM6ICdtYXRTb3J0RGlzYWJsZUNsZWFyJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZGlzYWJsZUNsZWFyOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBzb3J0YWJsZSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHthbGlhczogJ21hdFNvcnREaXNhYmxlZCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGRpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgdXNlciBjaGFuZ2VzIGVpdGhlciB0aGUgYWN0aXZlIHNvcnQgb3Igc29ydCBkaXJlY3Rpb24uICovXG4gIEBPdXRwdXQoJ21hdFNvcnRDaGFuZ2UnKSByZWFkb25seSBzb3J0Q2hhbmdlOiBFdmVudEVtaXR0ZXI8U29ydD4gPSBuZXcgRXZlbnRFbWl0dGVyPFNvcnQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHBhZ2luYXRvciBpcyBpbml0aWFsaXplZC4gKi9cbiAgaW5pdGlhbGl6ZWQ6IE9ic2VydmFibGU8dm9pZD4gPSB0aGlzLl9pbml0aWFsaXplZFN0cmVhbTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoTUFUX1NPUlRfREVGQVVMVF9PUFRJT05TKVxuICAgIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zPzogTWF0U29ydERlZmF1bHRPcHRpb25zLFxuICApIHt9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGZ1bmN0aW9uIHRvIGJlIHVzZWQgYnkgdGhlIGNvbnRhaW5lZCBNYXRTb3J0YWJsZXMuIEFkZHMgdGhlIE1hdFNvcnRhYmxlIHRvIHRoZVxuICAgKiBjb2xsZWN0aW9uIG9mIE1hdFNvcnRhYmxlcy5cbiAgICovXG4gIHJlZ2lzdGVyKHNvcnRhYmxlOiBNYXRTb3J0YWJsZSk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghc29ydGFibGUuaWQpIHtcbiAgICAgICAgdGhyb3cgZ2V0U29ydEhlYWRlck1pc3NpbmdJZEVycm9yKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNvcnRhYmxlcy5oYXMoc29ydGFibGUuaWQpKSB7XG4gICAgICAgIHRocm93IGdldFNvcnREdXBsaWNhdGVTb3J0YWJsZUlkRXJyb3Ioc29ydGFibGUuaWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc29ydGFibGVzLnNldChzb3J0YWJsZS5pZCwgc29ydGFibGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgZnVuY3Rpb24gdG8gYmUgdXNlZCBieSB0aGUgY29udGFpbmVkIE1hdFNvcnRhYmxlcy4gUmVtb3ZlcyB0aGUgTWF0U29ydGFibGUgZnJvbSB0aGVcbiAgICogY29sbGVjdGlvbiBvZiBjb250YWluZWQgTWF0U29ydGFibGVzLlxuICAgKi9cbiAgZGVyZWdpc3Rlcihzb3J0YWJsZTogTWF0U29ydGFibGUpOiB2b2lkIHtcbiAgICB0aGlzLnNvcnRhYmxlcy5kZWxldGUoc29ydGFibGUuaWQpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBzb3J0IGlkIGFuZCBkZXRlcm1pbmVzIHRoZSBuZXcgc29ydCBkaXJlY3Rpb24uICovXG4gIHNvcnQoc29ydGFibGU6IE1hdFNvcnRhYmxlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWN0aXZlICE9IHNvcnRhYmxlLmlkKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHNvcnRhYmxlLmlkO1xuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBzb3J0YWJsZS5zdGFydCA/IHNvcnRhYmxlLnN0YXJ0IDogdGhpcy5zdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXJlY3Rpb24gPSB0aGlzLmdldE5leHRTb3J0RGlyZWN0aW9uKHNvcnRhYmxlKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvcnRDaGFuZ2UuZW1pdCh7YWN0aXZlOiB0aGlzLmFjdGl2ZSwgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbn0pO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIG5leHQgc29ydCBkaXJlY3Rpb24gb2YgdGhlIGFjdGl2ZSBzb3J0YWJsZSwgY2hlY2tpbmcgZm9yIHBvdGVudGlhbCBvdmVycmlkZXMuICovXG4gIGdldE5leHRTb3J0RGlyZWN0aW9uKHNvcnRhYmxlOiBNYXRTb3J0YWJsZSk6IFNvcnREaXJlY3Rpb24ge1xuICAgIGlmICghc29ydGFibGUpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHNvcnQgZGlyZWN0aW9uIGN5Y2xlIHdpdGggdGhlIHBvdGVudGlhbCBzb3J0YWJsZSBvdmVycmlkZXMuXG4gICAgY29uc3QgZGlzYWJsZUNsZWFyID1cbiAgICAgIHNvcnRhYmxlPy5kaXNhYmxlQ2xlYXIgPz8gdGhpcy5kaXNhYmxlQ2xlYXIgPz8gISF0aGlzLl9kZWZhdWx0T3B0aW9ucz8uZGlzYWJsZUNsZWFyO1xuICAgIGxldCBzb3J0RGlyZWN0aW9uQ3ljbGUgPSBnZXRTb3J0RGlyZWN0aW9uQ3ljbGUoc29ydGFibGUuc3RhcnQgfHwgdGhpcy5zdGFydCwgZGlzYWJsZUNsZWFyKTtcblxuICAgIC8vIEdldCBhbmQgcmV0dXJuIHRoZSBuZXh0IGRpcmVjdGlvbiBpbiB0aGUgY3ljbGVcbiAgICBsZXQgbmV4dERpcmVjdGlvbkluZGV4ID0gc29ydERpcmVjdGlvbkN5Y2xlLmluZGV4T2YodGhpcy5kaXJlY3Rpb24pICsgMTtcbiAgICBpZiAobmV4dERpcmVjdGlvbkluZGV4ID49IHNvcnREaXJlY3Rpb25DeWNsZS5sZW5ndGgpIHtcbiAgICAgIG5leHREaXJlY3Rpb25JbmRleCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBzb3J0RGlyZWN0aW9uQ3ljbGVbbmV4dERpcmVjdGlvbkluZGV4XTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2luaXRpYWxpemVkU3RyZWFtLm5leHQoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgICB0aGlzLl9pbml0aWFsaXplZFN0cmVhbS5jb21wbGV0ZSgpO1xuICB9XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBzb3J0IGRpcmVjdGlvbiBjeWNsZSB0byB1c2UgZ2l2ZW4gdGhlIHByb3ZpZGVkIHBhcmFtZXRlcnMgb2Ygb3JkZXIgYW5kIGNsZWFyLiAqL1xuZnVuY3Rpb24gZ2V0U29ydERpcmVjdGlvbkN5Y2xlKHN0YXJ0OiBTb3J0RGlyZWN0aW9uLCBkaXNhYmxlQ2xlYXI6IGJvb2xlYW4pOiBTb3J0RGlyZWN0aW9uW10ge1xuICBsZXQgc29ydE9yZGVyOiBTb3J0RGlyZWN0aW9uW10gPSBbJ2FzYycsICdkZXNjJ107XG4gIGlmIChzdGFydCA9PSAnZGVzYycpIHtcbiAgICBzb3J0T3JkZXIucmV2ZXJzZSgpO1xuICB9XG4gIGlmICghZGlzYWJsZUNsZWFyKSB7XG4gICAgc29ydE9yZGVyLnB1c2goJycpO1xuICB9XG5cbiAgcmV0dXJuIHNvcnRPcmRlcjtcbn1cbiJdfQ==