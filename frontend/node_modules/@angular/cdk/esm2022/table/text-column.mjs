/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Inject, Input, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
import { CdkCellDef, CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCell } from './cell';
import { CdkTable } from './table';
import { getTableTextColumnMissingParentTableError, getTableTextColumnMissingNameError, } from './table-errors';
import { TEXT_COLUMN_OPTIONS } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "./table";
/**
 * Column that simply shows text content for the header and row cells. Assumes that the table
 * is using the native table implementation (`<table>`).
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the text justification to the start or end using the `justify`
 * input.
 */
export class CdkTextColumn {
    /** Column name that should be used to reference this column. */
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        // With Ivy, inputs can be initialized before static query results are
        // available. In that case, we defer the synchronization until "ngOnInit" fires.
        this._syncColumnDefName();
    }
    constructor(
    // `CdkTextColumn` is always requiring a table, but we just assert it manually
    // for better error reporting.
    // tslint:disable-next-line: lightweight-tokens
    _table, _options) {
        this._table = _table;
        this._options = _options;
        /** Alignment of the cell values. */
        this.justify = 'start';
        this._options = _options || {};
    }
    ngOnInit() {
        this._syncColumnDefName();
        if (this.headerText === undefined) {
            this.headerText = this._createDefaultHeaderText();
        }
        if (!this.dataAccessor) {
            this.dataAccessor =
                this._options.defaultDataAccessor || ((data, name) => data[name]);
        }
        if (this._table) {
            // Provide the cell and headerCell directly to the table with the static `ViewChild` query,
            // since the columnDef will not pick up its content by the time the table finishes checking
            // its content and initializing the rows.
            this.columnDef.cell = this.cell;
            this.columnDef.headerCell = this.headerCell;
            this._table.addColumnDef(this.columnDef);
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getTableTextColumnMissingParentTableError();
        }
    }
    ngOnDestroy() {
        if (this._table) {
            this._table.removeColumnDef(this.columnDef);
        }
    }
    /**
     * Creates a default header text. Use the options' header text transformation function if one
     * has been provided. Otherwise simply capitalize the column name.
     */
    _createDefaultHeaderText() {
        const name = this.name;
        if (!name && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableTextColumnMissingNameError();
        }
        if (this._options && this._options.defaultHeaderTextTransform) {
            return this._options.defaultHeaderTextTransform(name);
        }
        return name[0].toUpperCase() + name.slice(1);
    }
    /** Synchronizes the column definition name with the text column name. */
    _syncColumnDefName() {
        if (this.columnDef) {
            this.columnDef.name = this.name;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTextColumn, deps: [{ token: i1.CdkTable, optional: true }, { token: TEXT_COLUMN_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkTextColumn, isStandalone: true, selector: "cdk-text-column", inputs: { name: "name", headerText: "headerText", dataAccessor: "dataAccessor", justify: "justify" }, viewQueries: [{ propertyName: "columnDef", first: true, predicate: CdkColumnDef, descendants: true, static: true }, { propertyName: "cell", first: true, predicate: CdkCellDef, descendants: true, static: true }, { propertyName: "headerCell", first: true, predicate: CdkHeaderCellDef, descendants: true, static: true }], ngImport: i0, template: `
    <ng-container cdkColumnDef>
      <th cdk-header-cell *cdkHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td cdk-cell *cdkCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
    </ng-container>
  `, isInline: true, dependencies: [{ kind: "directive", type: CdkColumnDef, selector: "[cdkColumnDef]", inputs: ["cdkColumnDef", "sticky", "stickyEnd"] }, { kind: "directive", type: CdkHeaderCellDef, selector: "[cdkHeaderCellDef]" }, { kind: "directive", type: CdkHeaderCell, selector: "cdk-header-cell, th[cdk-header-cell]" }, { kind: "directive", type: CdkCellDef, selector: "[cdkCellDef]" }, { kind: "directive", type: CdkCell, selector: "cdk-cell, td[cdk-cell]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTextColumn, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-text-column',
                    template: `
    <ng-container cdkColumnDef>
      <th cdk-header-cell *cdkHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td cdk-cell *cdkCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
    </ng-container>
  `,
                    encapsulation: ViewEncapsulation.None,
                    // Change detection is intentionally not set to OnPush. This component's template will be provided
                    // to the table to be inserted into its view. This is problematic when change detection runs since
                    // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
                    // mean's the template in the table's view will not have the updated value (and in fact will cause
                    // an ExpressionChangedAfterItHasBeenCheckedError).
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: ChangeDetectionStrategy.Default,
                    standalone: true,
                    imports: [CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCellDef, CdkCell],
                }]
        }], ctorParameters: () => [{ type: i1.CdkTable, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [TEXT_COLUMN_OPTIONS]
                }] }], propDecorators: { name: [{
                type: Input
            }], headerText: [{
                type: Input
            }], dataAccessor: [{
                type: Input
            }], justify: [{
                type: Input
            }], columnDef: [{
                type: ViewChild,
                args: [CdkColumnDef, { static: true }]
            }], cell: [{
                type: ViewChild,
                args: [CdkCellDef, { static: true }]
            }], headerCell: [{
                type: ViewChild,
                args: [CdkHeaderCellDef, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1jb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RhYmxlL3RleHQtY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMxRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQ2pDLE9BQU8sRUFDTCx5Q0FBeUMsRUFDekMsa0NBQWtDLEdBQ25DLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFDLG1CQUFtQixFQUFvQixNQUFNLFVBQVUsQ0FBQzs7O0FBRWhFOzs7Ozs7OztHQVFHO0FBd0JILE1BQU0sT0FBTyxhQUFhO0lBQ3hCLGdFQUFnRTtJQUNoRSxJQUNJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUNELElBQUksSUFBSSxDQUFDLElBQVk7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFbEIsc0VBQXNFO1FBQ3RFLGdGQUFnRjtRQUNoRixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBeUNEO0lBQ0UsOEVBQThFO0lBQzlFLDhCQUE4QjtJQUM5QiwrQ0FBK0M7SUFDM0IsTUFBbUIsRUFDVSxRQUE4QjtRQUQzRCxXQUFNLEdBQU4sTUFBTSxDQUFhO1FBQ1UsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUE3QmpGLG9DQUFvQztRQUMzQixZQUFPLEdBQStCLE9BQU8sQ0FBQztRQThCckQsSUFBSSxD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b0JBQ2hELFVBQVUsRUFBRSxJQUFJO29CQUNoQixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUM7aUJBQzlFOzswQkEwREksUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxtQkFBbUI7eUNBdkRyQyxJQUFJO3NCQURQLEtBQUs7Z0JBaUJHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBUUcsWUFBWTtzQkFBcEIsS0FBSztnQkFHRyxPQUFPO3NCQUFmLEtBQUs7Z0JBR21DLFNBQVM7c0JBQWpELFNBQVM7dUJBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQztnQkFTQSxJQUFJO3NCQUExQyxTQUFTO3VCQUFDLFVBQVUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUM7Z0JBU1EsVUFBVTtzQkFBdEQsU0FBUzt1QkFBQyxnQkFBZ0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrQ2VsbERlZiwgQ2RrQ29sdW1uRGVmLCBDZGtIZWFkZXJDZWxsRGVmLCBDZGtIZWFkZXJDZWxsLCBDZGtDZWxsfSBmcm9tICcuL2NlbGwnO1xuaW1wb3J0IHtDZGtUYWJsZX0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQge1xuICBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nUGFyZW50VGFibGVFcnJvcixcbiAgZ2V0VGFibGVUZXh0Q29sdW1uTWlzc2luZ05hbWVFcnJvcixcbn0gZnJvbSAnLi90YWJsZS1lcnJvcnMnO1xuaW1wb3J0IHtURVhUX0NPTFVNTl9PUFRJT05TLCBUZXh0Q29sdW1uT3B0aW9uc30gZnJvbSAnLi90b2tlbnMnO1xuXG4vKipcbiAqIENvbHVtbiB0aGF0IHNpbXBseSBzaG93cyB0ZXh0IGNvbnRlbnQgZm9yIHRoZSBoZWFkZXIgYW5kIHJvdyBjZWxscy4gQXNzdW1lcyB0aGF0IHRoZSB0YWJsZVxuICogaXMgdXNpbmcgdGhlIG5hdGl2ZSB0YWJsZSBpbXBsZW1lbnRhdGlvbiAoYDx0YWJsZT5gKS5cbiAqXG4gKiBCeSBkZWZhdWx0LCB0aGUgbmFtZSBvZiB0aGlzIGNvbHVtbiB3aWxsIGJlIHRoZSBoZWFkZXIgdGV4dCBhbmQgZGF0YSBwcm9wZXJ0eSBhY2Nlc3Nvci5cbiAqIFRoZSBoZWFkZXIgdGV4dCBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoZSBgaGVhZGVyVGV4dGAgaW5wdXQuIENlbGwgdmFsdWVzIGNhbiBiZSBvdmVycmlkZGVuIHdpdGhcbiAqIHRoZSBgZGF0YUFjY2Vzc29yYCBpbnB1dC4gQ2hhbmdlIHRoZSB0ZXh0IGp1c3RpZmljYXRpb24gdG8gdGhlIHN0YXJ0IG9yIGVuZCB1c2luZyB0aGUgYGp1c3RpZnlgXG4gKiBpbnB1dC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLXRleHQtY29sdW1uJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctY29udGFpbmVyIGNka0NvbHVtbkRlZj5cbiAgICAgIDx0aCBjZGstaGVhZGVyLWNlbGwgKmNka0hlYWRlckNlbGxEZWYgW3N0eWxlLnRleHQtYWxpZ25dPVwianVzdGlmeVwiPlxuICAgICAgICB7e2hlYWRlclRleHR9fVxuICAgICAgPC90aD5cbiAgICAgIDx0ZCBjZGstY2VsbCAqY2RrQ2VsbERlZj1cImxldCBkYXRhXCIgW3N0eWxlLnRleHQtYWxpZ25dPVwianVzdGlmeVwiPlxuICAgICAgICB7e2RhdGFBY2Nlc3NvcihkYXRhLCBuYW1lKX19XG4gICAgICA8L3RkPlxuICAgIDwvbmctY29udGFpbmVyPlxuICBgLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAvLyBDaGFuZ2UgZGV0ZWN0aW9uIGlzIGludGVudGlvbmFsbHkgbm90IHNldCB0byBPblB1c2guIFRoaXMgY29tcG9uZW50J3MgdGVtcGxhdGUgd2lsbCBiZSBwcm92aWRlZFxuICAvLyB0byB0aGUgdGFibGUgdG8gYmUgaW5zZXJ0ZWQgaW50byBpdHMgdmlldy4gVGhpcyBpcyBwcm9ibGVtYXRpYyB3aGVuIGNoYW5nZSBkZXRlY3Rpb24gcnVucyBzaW5jZVxuICAvLyB0aGUgYmluZGluZ3MgaW4gdGhpcyB0ZW1wbGF0ZSB3aWxsIGJlIGV2YWx1YXRlZCBfYWZ0ZXJfIHRoZSB0YWJsZSdzIHZpZXcgaXMgZXZhbHVhdGVkLCB3aGljaFxuICAvLyBtZWFuJ3MgdGhlIHRlbXBsYXRlIGluIHRoZSB0YWJsZSdzIHZpZXcgd2lsbCBub3QgaGF2ZSB0aGUgdXBkYXRlZCB2YWx1ZSAoYW5kIGluIGZhY3Qgd2lsbCBjYXVzZVxuICAvLyBhbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yKS5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbQ2RrQ29sdW1uRGVmLCBDZGtIZWFkZXJDZWxsRGVmLCBDZGtIZWFkZXJDZWxsLCBDZGtDZWxsRGVmLCBDZGtDZWxsXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVGV4dENvbHVtbjxUPiBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgLyoqIENvbHVtbiBuYW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gcmVmZXJlbmNlIHRoaXMgY29sdW1uLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuXG4gICAgLy8gV2l0aCBJdnksIGlucHV0cyBjYW4gYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIHN0YXRpYyBxdWVyeSByZXN1bHRzIGFyZVxuICAgIC8vIGF2YWlsYWJsZS4gSW4gdGhhdCBjYXNlLCB3ZSBkZWZlciB0aGUgc3luY2hyb25pemF0aW9uIHVudGlsIFwibmdPbkluaXRcIiBmaXJlcy5cbiAgICB0aGlzLl9zeW5jQ29sdW1uRGVmTmFtZSgpO1xuICB9XG4gIF9uYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRleHQgbGFiZWwgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIuIElmIHRoaXMgcHJvcGVydHkgaXMgbm90XG4gICAqIHNldCwgdGhlIGhlYWRlciB0ZXh0IHdpbGwgZGVmYXVsdCB0byB0aGUgY29sdW1uIG5hbWUgd2l0aCBpdHMgZmlyc3QgbGV0dGVyIGNhcGl0YWxpemVkLlxuICAgKi9cbiAgQElucHV0KCkgaGVhZGVyVGV4dDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBY2Nlc3NvciBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgZGF0YSByZW5kZXJlZCBmb3IgZWFjaCBjZWxsLiBJZiB0aGlzXG4gICAqIHByb3BlcnR5IGlzIG5vdCBzZXQsIHRoZSBkYXRhIGNlbGxzIHdpbGwgcmVuZGVyIHRoZSB2YWx1ZSBmb3VuZCBpbiB0aGUgZGF0YSdzIHByb3BlcnR5IG1hdGNoaW5nXG4gICAqIHRoZSBjb2x1bW4ncyBuYW1lLiBGb3IgZXhhbXBsZSwgaWYgdGhlIGNvbHVtbiBpcyBuYW1lZCBgaWRgLCB0aGVuIHRoZSByZW5kZXJlZCB2YWx1ZSB3aWxsIGJlXG4gICAqIHZhbHVlIGRlZmluZWQgYnkgdGhlIGRhdGEncyBgaWRgIHByb3BlcnR5LlxuICAgKi9cbiAgQElucHV0KCkgZGF0YUFjY2Vzc29yOiAoZGF0YTogVCwgbmFtZTogc3RyaW5nKSA9PiBzdHJpbmc7XG5cbiAgLyoqIEFsaWdubWVudCBvZiB0aGUgY2VsbCB2YWx1ZXMuICovXG4gIEBJbnB1dCgpIGp1c3RpZnk6ICdzdGFydCcgfCAnZW5kJyB8ICdjZW50ZXInID0gJ3N0YXJ0JztcblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICBAVmlld0NoaWxkKENka0NvbHVtbkRlZiwge3N0YXRpYzogdHJ1ZX0pIGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmO1xuXG4gIC8qKlxuICAgKiBUaGUgY29sdW1uIGNlbGwgaXMgcHJvdmlkZWQgdG8gdGhlIGNvbHVtbiBkdXJpbmcgYG5nT25Jbml0YCB3aXRoIGEgc3RhdGljIHF1ZXJ5LlxuICAgKiBOb3JtYWxseSwgdGhpcyB3aWxsIGJlIHJldHJpZXZlZCBieSB0aGUgY29sdW1uIHVzaW5nIGBDb250ZW50Q2hpbGRgLCBidXQgdGhhdCBhc3N1bWVzIHRoZVxuICAgKiBjb2x1bW4gZGVmaW5pdGlvbiB3YXMgcHJvdmlkZWQgaW4gdGhlIHNhbWUgdmlldyBhcyB0aGUgdGFibGUsIHdoaWNoIGlzIG5vdCB0aGUgY2FzZSB3aXRoIHRoaXNcbiAgICogY29tcG9uZW50LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBAVmlld0NoaWxkKENka0NlbGxEZWYsIHtzdGF0aWM6IHRydWV9KSBjZWxsOiBDZGtDZWxsRGVmO1xuXG4gIC8qKlxuICAgKiBUaGUgY29sdW1uIGhlYWRlckNlbGwgaXMgcHJvdmlkZWQgdG8gdGhlIGNvbHVtbiBkdXJpbmcgYG5nT25Jbml0YCB3aXRoIGEgc3RhdGljIHF1ZXJ5LlxuICAgKiBOb3JtYWxseSwgdGhpcyB3aWxsIGJlIHJldHJpZXZlZCBieSB0aGUgY29sdW1uIHVzaW5nIGBDb250ZW50Q2hpbGRgLCBidXQgdGhhdCBhc3N1bWVzIHRoZVxuICAgKiBjb2x1bW4gZGVmaW5pdGlvbiB3YXMgcHJvdmlkZWQgaW4gdGhlIHNhbWUgdmlldyBhcyB0aGUgdGFibGUsIHdoaWNoIGlzIG5vdCB0aGUgY2FzZSB3aXRoIHRoaXNcbiAgICogY29tcG9uZW50LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBAVmlld0NoaWxkKENka0hlYWRlckNlbGxEZWYsIHtzdGF0aWM6IHRydWV9KSBoZWFkZXJDZWxsOiBDZGtIZWFkZXJDZWxsRGVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIGBDZGtUZXh0Q29sdW1uYCBpcyBhbHdheXMgcmVxdWlyaW5nIGEgdGFibGUsIGJ1dCB3ZSBqdXN0IGFzc2VydCBpdCBtYW51YWxseVxuICAgIC8vIGZvciBiZXR0ZXIgZXJyb3IgcmVwb3J0aW5nLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfdGFibGU6IENka1RhYmxlPFQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVYVF9DT0xVTU5fT1BUSU9OUykgcHJpdmF0ZSBfb3B0aW9uczogVGV4dENvbHVtbk9wdGlvbnM8VD4sXG4gICkge1xuICAgIHRoaXMuX29wdGlvbnMgPSBfb3B0aW9ucyB8fCB7fTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XG5cbiAgICBpZiAodGhpcy5oZWFkZXJUZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuaGVhZGVyVGV4dCA9IHRoaXMuX2NyZWF0ZURlZmF1bHRIZWFkZXJUZXh0KCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmRhdGFBY2Nlc3Nvcikge1xuICAgICAgdGhpcy5kYXRhQWNjZXNzb3IgPVxuICAgICAgICB0aGlzLl9vcHRpb25zLmRlZmF1bHREYXRhQWNjZXNzb3IgfHwgKChkYXRhOiBULCBuYW1lOiBzdHJpbmcpID0+IChkYXRhIGFzIGFueSlbbmFtZV0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90YWJsZSkge1xuICAgICAgLy8gUHJvdmlkZSB0aGUgY2VsbCBhbmQgaGVhZGVyQ2VsbCBkaXJlY3RseSB0byB0aGUgdGFibGUgd2l0aCB0aGUgc3RhdGljIGBWaWV3Q2hpbGRgIHF1ZXJ5LFxuICAgICAgLy8gc2luY2UgdGhlIGNvbHVtbkRlZiB3aWxsIG5vdCBwaWNrIHVwIGl0cyBjb250ZW50IGJ5IHRoZSB0aW1lIHRoZSB0YWJsZSBmaW5pc2hlcyBjaGVja2luZ1xuICAgICAgLy8gaXRzIGNvbnRlbnQgYW5kIGluaXRpYWxpemluZyB0aGUgcm93cy5cbiAgICAgIHRoaXMuY29sdW1uRGVmLmNlbGwgPSB0aGlzLmNlbGw7XG4gICAgICB0aGlzLmNvbHVtbkRlZi5oZWFkZXJDZWxsID0gdGhpcy5oZWFkZXJDZWxsO1xuICAgICAgdGhpcy5fdGFibGUuYWRkQ29sdW1uRGVmKHRoaXMuY29sdW1uRGVmKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3cgZ2V0VGFibGVUZXh0Q29sdW1uTWlzc2luZ1BhcmVudFRhYmxlRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fdGFibGUpIHtcbiAgICAgIHRoaXMuX3RhYmxlLnJlbW92ZUNvbHVtbkRlZih0aGlzLmNvbHVtbkRlZik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZWZhdWx0IGhlYWRlciB0ZXh0LiBVc2UgdGhlIG9wdGlvbnMnIGhlYWRlciB0ZXh0IHRyYW5zZm9ybWF0aW9uIGZ1bmN0aW9uIGlmIG9uZVxuICAgKiBoYXMgYmVlbiBwcm92aWRlZC4gT3RoZXJ3aXNlIHNpbXBseSBjYXBpdGFsaXplIHRoZSBjb2x1bW4gbmFtZS5cbiAgICovXG4gIF9jcmVhdGVEZWZhdWx0SGVhZGVyVGV4dCgpIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5uYW1lO1xuXG4gICAgaWYgKCFuYW1lICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nTmFtZUVycm9yKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMgJiYgdGhpcy5fb3B0aW9ucy5kZWZhdWx0SGVhZGVyVGV4dFRyYW5zZm9ybSkge1xuICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuZGVmYXVsdEhlYWRlclRleHRUcmFuc2Zvcm0obmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVbMF0udG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG4gIH1cblxuICAvKiogU3luY2hyb25pemVzIHRoZSBjb2x1bW4gZGVmaW5pdGlvbiBuYW1lIHdpdGggdGhlIHRleHQgY29sdW1uIG5hbWUuICovXG4gIHByaXZhdGUgX3N5bmNDb2x1bW5EZWZOYW1lKCkge1xuICAgIGlmICh0aGlzLmNvbHVtbkRlZikge1xuICAgICAgdGhpcy5jb2x1bW5EZWYubmFtZSA9IHRoaXMubmFtZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==