/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { _DisposeViewRepeaterStrategy, _RecycleViewRepeaterStrategy, isDataSource, _VIEW_REPEATER_STRATEGY, _ViewRepeaterOperation, } from '@angular/cdk/collections';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, ElementRef, EmbeddedViewRef, EventEmitter, Inject, Input, IterableDiffers, NgZone, Optional, Output, QueryList, SkipSelf, ViewContainerRef, ViewEncapsulation, booleanAttribute, inject, afterNextRender, Injector, } from '@angular/core';
import { BehaviorSubject, isObservable, of as observableOf, Subject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkColumnDef } from './cell';
import { _CoalescedStyleScheduler, _COALESCED_STYLE_SCHEDULER } from './coalesced-style-scheduler';
import { CdkCellOutlet, CdkFooterRowDef, CdkHeaderRowDef, CdkNoDataRow, CdkRowDef, } from './row';
import { StickyStyler } from './sticky-styler';
import { getTableDuplicateColumnNameError, getTableMissingMatchingRowDefError, getTableMissingRowDefsError, getTableMultipleDefaultRowDefsError, getTableUnknownColumnError, getTableUnknownDataSourceError, } from './table-errors';
import { STICKY_POSITIONING_LISTENER } from './sticky-position-listener';
import { CDK_TABLE } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "@angular/cdk/platform";
import * as i3 from "@angular/cdk/scrolling";
import * as i4 from "./coalesced-style-scheduler";
/**
 * Enables the recycle view repeater strategy, which reduces rendering latency. Not compatible with
 * tables that animate rows.
 */
export class CdkRecycleRows {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkRecycleRows, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkRecycleRows, isStandalone: true, selector: "cdk-table[recycleRows], table[cdk-table][recycleRows]", providers: [{ provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkRecycleRows, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-table[recycleRows], table[cdk-table][recycleRows]',
                    providers: [{ provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy }],
                    standalone: true,
                }]
        }] });
/**
 * Provides a handle for the table to grab the view container's ng-container to insert data rows.
 * @docs-private
 */
export class DataRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
        const table = inject(CDK_TABLE);
        table._rowOutlet = this;
        table._outletAssigned();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DataRowOutlet, deps: [{ token: i0.ViewContainerRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: DataRowOutlet, isStandalone: true, selector: "[rowOutlet]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DataRowOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[rowOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.ElementRef }] });
/**
 * Provides a handle for the table to grab the view container's ng-container to insert the header.
 * @docs-private
 */
export class HeaderRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
        const table = inject(CDK_TABLE);
        table._headerRowOutlet = this;
        table._outletAssigned();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: HeaderRowOutlet, deps: [{ token: i0.ViewContainerRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: HeaderRowOutlet, isStandalone: true, selector: "[headerRowOutlet]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: HeaderRowOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[headerRowOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.ElementRef }] });
/**
 * Provides a handle for the table to grab the view container's ng-container to insert the footer.
 * @docs-private
 */
export class FooterRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
        const table = inject(CDK_TABLE);
        table._footerRowOutlet = this;
        table._outletAssigned();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: FooterRowOutlet, deps: [{ token: i0.ViewContainerRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: FooterRowOutlet, isStandalone: true, selector: "[footerRowOutlet]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: FooterRowOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[footerRowOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.ElementRef }] });
/**
 * Provides a handle for the table to grab the view
 * container's ng-container to insert the no data row.
 * @docs-private
 */
export class NoDataRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
        const table = inject(CDK_TABLE);
        table._noDataRowOutlet = this;
        table._outletAssigned();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: NoDataRowOutlet, deps: [{ token: i0.ViewContainerRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: NoDataRowOutlet, isStandalone: true, selector: "[noDataRowOutlet]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: NoDataRowOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[noDataRowOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.ElementRef }] });
/**
 * The table template that can be used by the mat-table. Should not be used outside of the
 * material library.
 * @docs-private
 */
export const CDK_TABLE_TEMPLATE = 
// Note that according to MDN, the `caption` element has to be projected as the **first**
// element in the table. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption
`
  <ng-content select="caption"/>
  <ng-content select="colgroup, col"/>

  <!--
    Unprojected content throws a hydration error so we need this to capture it.
    It gets removed on the client so it doesn't affect the layout.
  -->
  @if (_isServer) {
    <ng-content/>
  }

  @if (_isNativeHtmlTable) {
    <thead role="rowgroup">
      <ng-container headerRowOutlet/>
    </thead>
    <tbody role="rowgroup">
      <ng-container rowOutlet/>
      <ng-container noDataRowOutlet/>
    </tbody>
    <tfoot role="rowgroup">
      <ng-container footerRowOutlet/>
    </tfoot>
  } @else {
    <ng-container headerRowOutlet/>
    <ng-container rowOutlet/>
    <ng-container noDataRowOutlet/>
    <ng-container footerRowOutlet/>
  }
`;
/**
 * Class used to conveniently type the embedded view ref for rows with a context.
 * @docs-private
 */
class RowViewRef extends EmbeddedViewRef {
}
/**
 * A data table that can render a header row, data rows, and a footer row.
 * Uses the dataSource input to determine the data to be rendered. The data can be provided either
 * as a data array, an Observable stream that emits the data array to render, or a DataSource with a
 * connect function that will return an Observable stream that emits the data array to render.
 */
export class CdkTable {
    /** Aria role to apply to the table's cells based on the table's own role. */
    _getCellRole() {
        // Perform this lazily in case the table's role was updated by a directive after construction.
        if (this._cellRoleInternal === undefined) {
            // Note that we set `role="cell"` even on native `td` elements,
            // because some browsers seem to require it. See #29784.
            const tableRole = this._elementRef.nativeElement.getAttribute('role');
            return tableRole === 'grid' || tableRole === 'treegrid' ? 'gridcell' : 'cell';
        }
        return this._cellRoleInternal;
    }
    /**
     * Tracking function that will be used to check the differences in data changes. Used similarly
     * to `ngFor` `trackBy` function. Optimize row operations by identifying a row based on its data
     * relative to the function to know if a row should be added/removed/moved.
     * Accepts a function that takes two parameters, `index` and `item`.
     */
    get trackBy() {
        return this._trackByFn;
    }
    set trackBy(fn) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && fn != null && typeof fn !== 'function') {
            console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.`);
        }
        this._trackByFn = fn;
    }
    /**
     * The table's source of data, which can be provided in three ways (in order of complexity):
     *   - Simple data array (each object represents one table row)
     *   - Stream that emits a data array each time the array changes
     *   - `DataSource` object that implements the connect/disconnect interface.
     *
     * If a data array is provided, the table must be notified when the array's objects are
     * added, removed, or moved. This can be done by calling the `renderRows()` function which will
     * render the diff since the last table render. If the data array reference is changed, the table
     * will automatically trigger an update to the rows.
     *
     * When providing an Observable stream, the table will trigger an update automatically when the
     * stream emits a new array of data.
     *
     * Finally, when providing a `DataSource` object, the table will use the Observable stream
     * provided by the connect function and trigger updates when that stream emits new data array
     * values. During the table's ngOnDestroy or when the data source is removed from the table, the
     * table will call the DataSource's `disconnect` function (may be useful for cleaning up any
     * subscriptions registered during the connect process).
     */
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(dataSource) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    /**
     * Whether to allow multiple rows per data object by evaluating which rows evaluate their 'when'
     * predicate to true. If `multiTemplateDataRows` is false, which is the default value, then each
     * dataobject will render the first row that evaluates its when predicate to true, in the order
     * defined in the table, or otherwise the default row which does not have a when predicate.
     */
    get multiTemplateDataRows() {
        return this._multiTemplateDataRows;
    }
    set multiTemplateDataRows(value) {
        this._multiTemplateDataRows = value;
        // In Ivy if this value is set via a static attribute (e.g. <table multiTemplateDataRows>),
        // this setter will be invoked before the row outlet has been defined hence the null check.
        if (this._rowOutlet && this._rowOutlet.viewContainer.length) {
            this._forceRenderDataRows();
            this.updateStickyColumnStyles();
        }
    }
    /**
     * Whether to use a fixed table layout. Enabling this option will enforce consistent column widths
     * and optimize rendering sticky styles for native tables. No-op for flex tables.
     */
    get fixedLayout() {
        return this._fixedLayout;
    }
    set fixedLayout(value) {
        this._fixedLayout = value;
        // Toggling `fixedLayout` may change column widths. Sticky column styles should be recalculated.
        this._forceRecalculateCellWidths = true;
        this._stickyColumnStylesNeedReset = true;
    }
    constructor(_differs, _changeDetectorRef, _elementRef, role, _dir, _document, _platform, _viewRepeater, _coalescedStyleScheduler, _viewportRuler, 
    /**
     * @deprecated `_stickyPositioningListener` parameter to become required.
     * @breaking-change 13.0.0
     */
    _stickyPositioningListener, 
    /**
     * @deprecated `_unusedNgZone` parameter to be removed.
     * @breaking-change 19.0.0
     */
    _unusedNgZone) {
        this._differs = _differs;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._dir = _dir;
        this._platform = _platform;
        this._viewRepeater = _viewRepeater;
        this._coalescedStyleScheduler = _coalescedStyleScheduler;
        this._viewportRuler = _viewportRuler;
        this._stickyPositioningListener = _stickyPositioningListener;
        /** Subject that emits when the component has been destroyed. */
        this._onDestroy = new Subject();
        /**
         * Map of all the user's defined columns (header, data, and footer cell template) identified by
         * name. Collection populated by the column definitions gathered by `ContentChildren` as well as
         * any custom column definitions added to `_customColumnDefs`.
         */
        this._columnDefsByName = new Map();
        /**
         * Column definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has
         * column definitions as *its* content child.
         */
        this._customColumnDefs = new Set();
        /**
         * Data row definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has
         * built-in data rows as *its* content child.
         */
        this._customRowDefs = new Set();
        /**
         * Header row definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has
         * built-in header rows as *its* content child.
         */
        this._customHeaderRowDefs = new Set();
        /**
         * Footer row definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has a
         * built-in footer row as *its* content child.
         */
        this._customFooterRowDefs = new Set();
        /**
         * Whether the header row definition has been changed. Triggers an update to the header row after
         * content is checked. Initialized as true so that the table renders the initial set of rows.
         */
        this._headerRowDefChanged = true;
        /**
         * Whether the footer row definition has been changed. Triggers an update to the footer row after
         * content is checked. Initialized as true so that the table renders the initial set of rows.
         */
        this._footerRowDefChanged = true;
        /**
         * Whether the sticky column styles need to be updated. Set to `true` when the visible columns
         * change.
         */
        this._stickyColumnStylesNeedReset = true;
        /**
         * Whether the sticky styler should recalculate cell widths when applying sticky styles. If
         * `false`, cached values will be used instead. This is only applicable to tables with
         * {@link fixedLayout} enabled. For other tables, cell widths will always be recalculated.
         */
        this._forceRecalculateCellWidths = true;
        /**
         * Cache of the latest rendered `RenderRow` objects as a map for easy retrieval when constructing
         * a new list of `RenderRow` objects for rendering rows. Since the new list is constructed with
         * the cached `RenderRow` objects when possible, the row identity is preserved when the data
         * and row template matches, which allows the `IterableDiffer` to check rows by reference
         * and understand which rows are added/moved/removed.
         *
         * Implemented as a map of maps where the first key is the `data: T` object and the second is the
         * `CdkRowDef<T>` object. With the two keys, the cache points to a `RenderRow<T>` object that
         * contains an array of created pairs. The array is necessary to handle cases where the data
         * array contains multiple duplicate data objects and each instantiated `RenderRow` must be
         * stored.
         */
        this._cachedRenderRowsMap = new Map();
        /**
         * CSS class added to any row or cell that has sticky positioning applied. May be overridden by
         * table subclasses.
         */
        this.stickyCssClass = 'cdk-table-sticky';
        /**
         * Whether to manually add position: sticky to all sticky cell elements. Not needed if
         * the position is set in a selector associated with the value of stickyCssClass. May be
         * overridden by table subclasses
         */
        this.needsPositionStickyOnElement = true;
        /** Whether the no data row is currently showing anything. */
        this._isShowingNoDataRow = false;
        /** Whether the table has rendered out all the outlets for the first time. */
        this._hasAllOutlets = false;
        /** Whether the table is done initializing. */
        this._hasInitialized = false;
        this._cellRoleInternal = undefined;
        this._multiTemplateDataRows = false;
        this._fixedLayout = false;
        /**
         * Emits when the table completes rendering a set of data rows based on the latest data from the
         * data source, even if the set of rows is empty.
         */
        this.contentChanged = new EventEmitter();
        // TODO(andrewseguin): Remove max value as the end index
        //   and instead calculate the view on init and scroll.
        /**
         * Stream containing the latest information on what rows are being displayed on screen.
         * Can be used by the data source to as a heuristic of what data should be provided.
         *
         * @docs-private
         */
        this.viewChange = new BehaviorSubject({
            start: 0,
            end: Number.MAX_VALUE,
        });
        this._injector = inject(Injector);
        if (!role) {
            _elementRef.nativeElement.setAttribute('role', 'table');
        }
        this._document = _document;
        this._isServer = !_platform.isBrowser;
        this._isNativeHtmlTable = _elementRef.nativeElement.nodeName === 'TABLE';
    }
    ngOnInit() {
        this._setupStickyStyler();
        // Set up the trackBy function so that it uses the `RenderRow` as its identity by default. If
        // the user has provided a custom trackBy, return the result of that function as evaluated
        // with the values of the `RenderRow`'s data and index.
        this._dataDiffer = this._differs.find([]).create((_i, dataRow) => {
            return this.trackBy ? this.trackBy(dataRow.dataIndex, dataRow.data) : dataRow;
        });
        this._viewportRuler
            .change()
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
            this._forceRecalculateCellWidths = true;
        });
    }
    ngAfterContentInit() {
        this._hasInitialized = true;
    }
    ngAfterContentChecked() {
        // Only start re-rendering in `ngAfterContentChecked` after the first render.
        if (this._canRender()) {
            this._render();
        }
    }
    ngOnDestroy() {
        [
            this._rowOutlet?.viewContainer,
            this._headerRowOutlet?.viewContainer,
            this._footerRowOutlet?.viewContainer,
            this._cachedRenderRowsMap,
            this._customColumnDefs,
            this._customRowDefs,
            this._customHeaderRowDefs,
            this._customFooterRowDefs,
            this._columnDefsByName,
        ].forEach((def) => {
            def?.clear();
        });
        this._headerRowDefs = [];
        this._footerRowDefs = [];
        this._defaultRowDef = null;
        this._onDestroy.next();
        this._onDestroy.complete();
        if (isDataSource(this.dataSource)) {
            this.dataSource.disconnect(this);
        }
    }
    /**
     * Renders rows based on the table's latest set of data, which was either provided directly as an
     * input or retrieved through an Observable stream (directly or from a DataSource).
     * Checks for differences in the data since the last diff to perform only the necessary
     * changes (add/remove/move rows).
     *
     * If the table's data source is a DataSource or Observable, this will be invoked automatically
     * each time the provided Observable stream emits a new data array. Otherwise if your data is
     * an array, this function will need to be called to render any changes.
     */
    renderRows() {
        this._renderRows = this._getAllRenderRows();
        const changes = this._dataDiffer.diff(this._renderRows);
        if (!changes) {
            this._updateNoDataRow();
            this.contentChanged.next();
            return;
        }
        const viewContainer = this._rowOutlet.viewContainer;
        this._viewRepeater.applyChanges(changes, viewContainer, (record, _adjustedPreviousIndex, currentIndex) => this._getEmbeddedViewArgs(record.item, currentIndex), record => record.item.data, (change) => {
            if (change.operation === _ViewRepeaterOperation.INSERTED && change.context) {
                this._renderCellTemplateForItem(change.record.item.rowDef, change.context);
            }
        });
        // Update the meta context of a row's context data (index, count, first, last, ...)
        this._updateRowIndexContext();
        // Update rows that did not get added/removed/moved but may have had their identity changed,
        // e.g. if trackBy matched data on some property but the actual data reference changed.
        changes.forEachIdentityChange((record) => {
            const rowView = viewContainer.get(record.currentIndex);
            rowView.context.$implicit = record.item.data;
        });
        this._updateNoDataRow();
        afterNextRender(() => {
            this.updateStickyColumnStyles();
        }, { injector: this._injector });
        this.contentChanged.next();
    }
    /** Adds a column definition that was not included as part of the content children. */
    addColumnDef(columnDef) {
        this._customColumnDefs.add(columnDef);
    }
    /** Removes a column definition that was not included as part of the content children. */
    removeColumnDef(columnDef) {
        this._customColumnDefs.delete(columnDef);
    }
    /** Adds a row definition that was not included as part of the content children. */
    addRowDef(rowDef) {
        this._customRowDefs.add(rowDef);
    }
    /** Removes a row definition that was not included as part of the content children. */
    removeRowDef(rowDef) {
        this._customRowDefs.delete(rowDef);
    }
    /** Adds a header row definition that was not included as part of the content children. */
    addHeaderRowDef(headerRowDef) {
        this._customHeaderRowDefs.add(headerRowDef);
        this._headerRowDefChanged = true;
    }
    /** Removes a header row definition that was not included as part of the content children. */
    removeHeaderRowDef(headerRowDef) {
        this._customHeaderRowDefs.delete(headerRowDef);
        this._headerRowDefChanged = true;
    }
    /** Adds a footer row definition that was not included as part of the content children. */
    addFooterRowDef(footerRowDef) {
        this._customFooterRowDefs.add(footerRowDef);
        this._footerRowDefChanged = true;
    }
    /** Removes a footer row definition that was not included as part of the content children. */
    removeFooterRowDef(footerRowDef) {
        this._customFooterRowDefs.delete(footerRowDef);
        this._footerRowDefChanged = true;
    }
    /** Sets a no data row definition that was not included as a part of the content children. */
    setNoDataRow(noDataRow) {
        this._customNoDataRow = noDataRow;
    }
    /**
     * Updates the header sticky styles. First resets all applied styles with respect to the cells
     * sticking to the top. Then, evaluating which cells need to be stuck to the top. This is
     * automatically called when the header row changes its displayed set of columns, or if its
     * sticky input changes. May be called manually for cases where the cell content changes outside
     * of these events.
     */
    updateStickyHeaderRowStyles() {
        const headerRows = this._getRenderedRows(this._headerRowOutlet);
        // Hide the thead element if there are no header rows. This is necessary to satisfy
        // overzealous a11y checkers that fail because the `rowgroup` element does not contain
        // required child `row`.
        if (this._isNativeHtmlTable) {
            const thead = closestTableSection(this._headerRowOutlet, 'thead');
            if (thead) {
                thead.style.display = headerRows.length ? '' : 'none';
            }
        }
        const stickyStates = this._headerRowDefs.map(def => def.sticky);
        this._stickyStyler.clearStickyPositioning(headerRows, ['top']);
        this._stickyStyler.stickRows(headerRows, stickyStates, 'top');
        // Reset the dirty state of the sticky input change since it has been used.
        this._headerRowDefs.forEach(def => def.resetStickyChanged());
    }
    /**
     * Updates the footer sticky styles. First resets all applied styles with respect to the cells
     * sticking to the bottom. Then, evaluating which cells need to be stuck to the bottom. This is
     * automatically called when the footer row changes its displayed set of columns, or if its
     * sticky input changes. May be called manually for cases where the cell content changes outside
     * of these events.
     */
    updateStickyFooterRowStyles() {
        const footerRows = this._getRenderedRows(this._footerRowOutlet);
        // Hide the tfoot element if there are no footer rows. This is necessary to satisfy
        // overzealous a11y checkers that fail because the `rowgroup` element does not contain
        // required child `row`.
        if (this._isNativeHtmlTable) {
            const tfoot = closestTableSection(this._footerRowOutlet, 'tfoot');
            if (tfoot) {
                tfoot.style.display = footerRows.length ? '' : 'none';
            }
        }
        const stickyStates = this._footerRowDefs.map(def => def.sticky);
        this._stickyStyler.clearStickyPositioning(footerRows, ['bottom']);
        this._stickyStyler.stickRows(footerRows, stickyStates, 'bottom');
        this._stickyStyler.updateStickyFooterContainer(this._elementRef.nativeElement, stickyStates);
        // Reset the dirty state of the sticky input change since it has been used.
        this._footerRowDefs.forEach(def => def.resetStickyChanged());
    }
    /**
     * Updates the column sticky styles. First resets all applied styles with respect to the cells
     * sticking to the left and right. Then sticky styles are added for the left and right according
     * to the column definitions for each cell in each row. This is automatically called when
     * the data source provides a new set of data or when a column definition changes its sticky
     * input. May be called manually for cases where the cell content changes outside of these events.
     */
    updateStickyColumnStyles() {
        const headerRows = this._getRenderedRows(this._headerRowOutlet);
        const dataRows = this._getRenderedRows(this._rowOutlet);
        const footerRows = this._getRenderedRows(this._footerRowOutlet);
        // For tables not using a fixed layout, the column widths may change when new rows are rendered.
        // In a table using a fixed layout, row content won't affect column width, so sticky styles
        // don't need to be cleared unless either the sticky column config changes or one of the row
        // defs change.
        if ((this._isNativeHtmlTable && !this._fixedLayout) || this._stickyColumnStylesNeedReset) {
            // Clear the left and right positioning from all columns in the table across all rows since
            // sticky columns span across all table sections (header, data, footer)
            this._stickyStyler.clearStickyPositioning([...headerRows, ...dataRows, ...footerRows], ['left', 'right']);
            this._stickyColumnStylesNeedReset = false;
        }
        // Update the sticky styles for each header row depending on the def's sticky state
        headerRows.forEach((headerRow, i) => {
            this._addStickyColumnStyles([headerRow], this._headerRowDefs[i]);
        });
        // Update the sticky styles for each data row depending on its def's sticky state
        this._rowDefs.forEach(rowDef => {
            // Collect all the rows rendered with this row definition.
            const rows = [];
            for (let i = 0; i < dataRows.length; i++) {
                if (this._renderRows[i].rowDef === rowDef) {
                    rows.push(dataRows[i]);
                }
            }
            this._addStickyColumnStyles(rows, rowDef);
        });
        // Update the sticky styles for each footer row depending on the def's sticky state
        footerRows.forEach((footerRow, i) => {
            this._addStickyColumnStyles([footerRow], this._footerRowDefs[i]);
        });
        // Reset the dirty state of the sticky input change since it has been used.
        Array.from(this._columnDefsByName.values()).forEach(def => def.resetStickyChanged());
    }
    /** Invoked whenever an outlet is created and has been assigned to the table. */
    _outletAssigned() {
        // Trigger the first render once all outlets have been assigned. We do it this way, as
        // opposed to waiting for the next `ngAfterContentChecked`, because we don't know when
        // the next change detection will happen.
        // Also we can't use queries to resolve the outlets, because they're wrapped in a
        // conditional, so we have to rely on them being assigned via DI.
        if (!this._hasAllOutlets &&
            this._rowOutlet &&
            this._headerRowOutlet &&
            this._footerRowOutlet &&
            this._noDataRowOutlet) {
            this._hasAllOutlets = true;
            // In some setups this may fire before `ngAfterContentInit`
            // so we need a check here. See #28538.
            if (this._canRender()) {
                this._render();
            }
        }
    }
    /** Whether the table has all the information to start rendering. */
    _canRender() {
        return this._hasAllOutlets && this._hasInitialized;
    }
    /** Renders the table if its state has changed. */
    _render() {
        // Cache the row and column definitions gathered by ContentChildren and programmatic injection.
        this._cacheRowDefs();
        this._cacheColumnDefs();
        // Make sure that the user has at least added header, footer, or data row def.
        if (!this._headerRowDefs.length &&
            !this._footerRowDefs.length &&
            !this._rowDefs.length &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableMissingRowDefsError();
        }
        // Render updates if the list of columns have been changed for the header, row, or footer defs.
        const columnsChanged = this._renderUpdatedColumns();
        const rowDefsChanged = columnsChanged || this._headerRowDefChanged || this._footerRowDefChanged;
        // Ensure sticky column styles are reset if set to `true` elsewhere.
        this._stickyColumnStylesNeedReset = this._stickyColumnStylesNeedReset || rowDefsChanged;
        this._forceRecalculateCellWidths = rowDefsChanged;
        // If the header row definition has been changed, trigger a render to the header row.
        if (this._headerRowDefChanged) {
            this._forceRenderHeaderRows();
            this._headerRowDefChanged = false;
        }
        // If the footer row definition has been changed, trigger a render to the footer row.
        if (this._footerRowDefChanged) {
            this._forceRenderFooterRows();
            this._footerRowDefChanged = false;
        }
        // If there is a data source and row definitions, connect to the data source unless a
        // connection has already been made.
        if (this.dataSource && this._rowDefs.length > 0 && !this._renderChangeSubscription) {
            this._observeRenderChanges();
        }
        else if (this._stickyColumnStylesNeedReset) {
            // In the above case, _observeRenderChanges will result in updateStickyColumnStyles being
            // called when it row data arrives. Otherwise, we need to call it proactively.
            this.updateStickyColumnStyles();
        }
        this._checkStickyStates();
    }
    /**
     * Get the list of RenderRow objects to render according to the current list of data and defined
     * row definitions. If the previous list already contained a particular pair, it should be reused
     * so that the differ equates their references.
     */
    _getAllRenderRows() {
        const renderRows = [];
        // Store the cache and create a new one. Any re-used RenderRow objects will be moved into the
        // new cache while unused ones can be picked up by garbage collection.
        const prevCachedRenderRows = this._cachedRenderRowsMap;
        this._cachedRenderRowsMap = new Map();
        // For each data object, get the list of rows that should be rendered, represented by the
        // respective `RenderRow` object which is the pair of `data` and `CdkRowDef`.
        for (let i = 0; i < this._data.length; i++) {
            let data = this._data[i];
            const renderRowsForData = this._getRenderRowsForData(data, i, prevCachedRenderRows.get(data));
            if (!this._cachedRenderRowsMap.has(data)) {
                this._cachedRenderRowsMap.set(data, new WeakMap());
            }
            for (let j = 0; j < renderRowsForData.length; j++) {
                let renderRow = renderRowsForData[j];
                const cache = this._cachedRenderRowsMap.get(renderRow.data);
                if (cache.has(renderRow.rowDef)) {
                    cache.get(renderRow.rowDef).push(renderRow);
                }
                else {
                    cache.set(renderRow.rowDef, [renderRow]);
                }
                renderRows.push(renderRow);
            }
        }
        return renderRows;
    }
    /**
     * Gets a list of `RenderRow<T>` for the provided data object and any `CdkRowDef` objects that
     * should be rendered for this data. Reuses the cached RenderRow objects if they match the same
     * `(T, CdkRowDef)` pair.
     */
    _getRenderRowsForData(data, dataIndex, cache) {
        const rowDefs = this._getRowDefs(data, dataIndex);
        return rowDefs.map(rowDef => {
            const cachedRenderRows = cache && cache.has(rowDef) ? cache.get(rowDef) : [];
            if (cachedRenderRows.length) {
                const dataRow = cachedRenderRows.shift();
                dataRow.dataIndex = dataIndex;
                return dataRow;
            }
            else {
                return { data, rowDef, dataIndex };
            }
        });
    }
    /** Update the map containing the content's column definitions. */
    _cacheColumnDefs() {
        this._columnDefsByName.clear();
        const columnDefs = mergeArrayAndSet(this._getOwnDefs(this._contentColumnDefs), this._customColumnDefs);
        columnDefs.forEach(columnDef => {
            if (this._columnDefsByName.has(columnDef.name) &&
                (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getTableDuplicateColumnNameError(columnDef.name);
            }
            this._columnDefsByName.set(columnDef.name, columnDef);
        });
    }
    /** Update the list of all available row definitions that can be used. */
    _cacheRowDefs() {
        this._headerRowDefs = mergeArrayAndSet(this._getOwnDefs(this._contentHeaderRowDefs), this._customHeaderRowDefs);
        this._footerRowDefs = mergeArrayAndSet(this._getOwnDefs(this._contentFooterRowDefs), this._customFooterRowDefs);
        this._rowDefs = mergeArrayAndSet(this._getOwnDefs(this._contentRowDefs), this._customRowDefs);
        // After all row definitions are determined, find the row definition to be considered default.
        const defaultRowDefs = this._rowDefs.filter(def => !def.when);
        if (!this.multiTemplateDataRows &&
            defaultRowDefs.length > 1 &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableMultipleDefaultRowDefsError();
        }
        this._defaultRowDef = defaultRowDefs[0];
    }
    /**
     * Check if the header, data, or footer rows have changed what columns they want to display or
     * whether the sticky states have changed for the header or footer. If there is a diff, then
     * re-render that section.
     */
    _renderUpdatedColumns() {
        const columnsDiffReducer = (acc, def) => {
            // The differ should be run for every column, even if `acc` is already
            // true (see #29922)
            const diff = !!def.getColumnsDiff();
            return acc || diff;
        };
        // Force re-render data rows if the list of column definitions have changed.
        const dataColumnsChanged = this._rowDefs.reduce(columnsDiffReducer, false);
        if (dataColumnsChanged) {
            this._forceRenderDataRows();
        }
        // Force re-render header/footer rows if the list of column definitions have changed.
        const headerColumnsChanged = this._headerRowDefs.reduce(columnsDiffReducer, false);
        if (headerColumnsChanged) {
            this._forceRenderHeaderRows();
        }
        const footerColumnsChanged = this._footerRowDefs.reduce(columnsDiffReducer, false);
        if (footerColumnsChanged) {
            this._forceRenderFooterRows();
        }
        return dataColumnsChanged || headerColumnsChanged || footerColumnsChanged;
    }
    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the row outlet. Otherwise start listening for new data.
     */
    _switchDataSource(dataSource) {
        this._data = [];
        if (isDataSource(this.dataSource)) {
            this.dataSource.disconnect(this);
        }
        // Stop listening for data from the previous data source.
        if (this._renderChangeSubscription) {
            this._renderChangeSubscription.unsubscribe();
            this._renderChangeSubscription = null;
        }
        if (!dataSource) {
            if (this._dataDiffer) {
                this._dataDiffer.diff([]);
            }
            if (this._rowOutlet) {
                this._rowOutlet.viewContainer.clear();
            }
        }
        this._dataSource = dataSource;
    }
    /** Set up a subscription for the data provided by the data source. */
    _observeRenderChanges() {
        // If no data source has been set, there is nothing to observe for changes.
        if (!this.dataSource) {
            return;
        }
        let dataStream;
        if (isDataSource(this.dataSource)) {
            dataStream = this.dataSource.connect(this);
        }
        else if (isObservable(this.dataSource)) {
            dataStream = this.dataSource;
        }
        else if (Array.isArray(this.dataSource)) {
            dataStream = observableOf(this.dataSource);
        }
        if (dataStream === undefined && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableUnknownDataSourceError();
        }
        this._renderChangeSubscription = dataStream
            .pipe(takeUntil(this._onDestroy))
            .subscribe(data => {
            this._data = data || [];
            this.renderRows();
        });
    }
    /**
     * Clears any existing content in the header row outlet and creates a new embedded view
     * in the outlet using the header row definition.
     */
    _forceRenderHeaderRows() {
        // Clear the header row outlet if any content exists.
        if (this._headerRowOutlet.viewContainer.length > 0) {
            this._headerRowOutlet.viewContainer.clear();
        }
        this._headerRowDefs.forEach((def, i) => this._renderRow(this._headerRowOutlet, def, i));
        this.updateStickyHeaderRowStyles();
    }
    /**
     * Clears any existing content in the footer row outlet and creates a new embedded view
     * in the outlet using the footer row definition.
     */
    _forceRenderFooterRows() {
        // Clear the footer row outlet if any content exists.
        if (this._footerRowOutlet.viewContainer.length > 0) {
            this._footerRowOutlet.viewContainer.clear();
        }
        this._footerRowDefs.forEach((def, i) => this._renderRow(this._footerRowOutlet, def, i));
        this.updateStickyFooterRowStyles();
    }
    /** Adds the sticky column styles for the rows according to the columns' stick states. */
    _addStickyColumnStyles(rows, rowDef) {
        const columnDefs = Array.from(rowDef.columns || []).map(columnName => {
            const columnDef = this._columnDefsByName.get(columnName);
            if (!columnDef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getTableUnknownColumnError(columnName);
            }
            return columnDef;
        });
        const stickyStartStates = columnDefs.map(columnDef => columnDef.sticky);
        const stickyEndStates = columnDefs.map(columnDef => columnDef.stickyEnd);
        this._stickyStyler.updateStickyColumns(rows, stickyStartStates, stickyEndStates, !this._fixedLayout || this._forceRecalculateCellWidths);
    }
    /** Gets the list of rows that have been rendered in the row outlet. */
    _getRenderedRows(rowOutlet) {
        const renderedRows = [];
        for (let i = 0; i < rowOutlet.viewContainer.length; i++) {
            const viewRef = rowOutlet.viewContainer.get(i);
            renderedRows.push(viewRef.rootNodes[0]);
        }
        return renderedRows;
    }
    /**
     * Get the matching row definitions that should be used for this row data. If there is only
     * one row definition, it is returned. Otherwise, find the row definitions that has a when
     * predicate that returns true with the data. If none return true, return the default row
     * definition.
     */
    _getRowDefs(data, dataIndex) {
        if (this._rowDefs.length == 1) {
            return [this._rowDefs[0]];
        }
        let rowDefs = [];
        if (this.multiTemplateDataRows) {
            rowDefs = this._rowDefs.filter(def => !def.when || def.when(dataIndex, data));
        }
        else {
            let rowDef = this._rowDefs.find(def => def.when && def.when(dataIndex, data)) || this._defaultRowDef;
            if (rowDef) {
                rowDefs.push(rowDef);
            }
        }
        if (!rowDefs.length && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableMissingMatchingRowDefError(data);
        }
        return rowDefs;
    }
    _getEmbeddedViewArgs(renderRow, index) {
        const rowDef = renderRow.rowDef;
        const context = { $implicit: renderRow.data };
        return {
            templateRef: rowDef.template,
            context,
            index,
        };
    }
    /**
     * Creates a new row template in the outlet and fills it with the set of cell templates.
     * Optionally takes a context to provide to the row and cells, as well as an optional index
     * of where to place the new row template in the outlet.
     */
    _renderRow(outlet, rowDef, index, context = {}) {
        // TODO(andrewseguin): enforce that one outlet was instantiated from createEmbeddedView
        const view = outlet.viewContainer.createEmbeddedView(rowDef.template, context, index);
        this._renderCellTemplateForItem(rowDef, context);
        return view;
    }
    _renderCellTemplateForItem(rowDef, context) {
        for (let cellTemplate of this._getCellTemplates(rowDef)) {
            if (CdkCellOutlet.mostRecentCellOutlet) {
                CdkCellOutlet.mostRecentCellOutlet._viewContainer.createEmbeddedView(cellTemplate, context);
            }
        }
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Updates the index-related context for each row to reflect any changes in the index of the rows,
     * e.g. first/last/even/odd.
     */
    _updateRowIndexContext() {
        const viewContainer = this._rowOutlet.viewContainer;
        for (let renderIndex = 0, count = viewContainer.length; renderIndex < count; renderIndex++) {
            const viewRef = viewContainer.get(renderIndex);
            const context = viewRef.context;
            context.count = count;
            context.first = renderIndex === 0;
            context.last = renderIndex === count - 1;
            context.even = renderIndex % 2 === 0;
            context.odd = !context.even;
            if (this.multiTemplateDataRows) {
                context.dataIndex = this._renderRows[renderIndex].dataIndex;
                context.renderIndex = renderIndex;
            }
            else {
                context.index = this._renderRows[renderIndex].dataIndex;
            }
        }
    }
    /** Gets the column definitions for the provided row def. */
    _getCellTemplates(rowDef) {
        if (!rowDef || !rowDef.columns) {
            return [];
        }
        return Array.from(rowDef.columns, columnId => {
            const column = this._columnDefsByName.get(columnId);
            if (!column && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getTableUnknownColumnError(columnId);
            }
            return rowDef.extractCellTemplate(column);
        });
    }
    /**
     * Forces a re-render of the data rows. Should be called in cases where there has been an input
     * change that affects the evaluation of which rows should be rendered, e.g. toggling
     * `multiTemplateDataRows` or adding/removing row definitions.
     */
    _forceRenderDataRows() {
        this._dataDiffer.diff([]);
        this._rowOutlet.viewContainer.clear();
        this.renderRows();
    }
    /**
     * Checks if there has been a change in sticky states since last check and applies the correct
     * sticky styles. Since checking resets the "dirty" state, this should only be performed once
     * during a change detection and after the inputs are settled (after content check).
     */
    _checkStickyStates() {
        const stickyCheckReducer = (acc, d) => {
            return acc || d.hasStickyChanged();
        };
        // Note that the check needs to occur for every definition since it notifies the definition
        // that it can reset its dirty state. Using another operator like `some` may short-circuit
        // remaining definitions and leave them in an unchecked state.
        if (this._headerRowDefs.reduce(stickyCheckReducer, false)) {
            this.updateStickyHeaderRowStyles();
        }
        if (this._footerRowDefs.reduce(stickyCheckReducer, false)) {
            this.updateStickyFooterRowStyles();
        }
        if (Array.from(this._columnDefsByName.values()).reduce(stickyCheckReducer, false)) {
            this._stickyColumnStylesNeedReset = true;
            this.updateStickyColumnStyles();
        }
    }
    /**
     * Creates the sticky styler that will be used for sticky rows and columns. Listens
     * for directionality changes and provides the latest direction to the styler. Re-applies column
     * stickiness when directionality changes.
     */
    _setupStickyStyler() {
        const direction = this._dir ? this._dir.value : 'ltr';
        this._stickyStyler = new StickyStyler(this._isNativeHtmlTable, this.stickyCssClass, direction, this._coalescedStyleScheduler, this._platform.isBrowser, this.needsPositionStickyOnElement, this._stickyPositioningListener);
        (this._dir ? this._dir.change : observableOf())
            .pipe(takeUntil(this._onDestroy))
            .subscribe(value => {
            this._stickyStyler.direction = value;
            this.updateStickyColumnStyles();
        });
    }
    /** Filters definitions that belong to this table from a QueryList. */
    _getOwnDefs(items) {
        return items.filter(item => !item._table || item._table === this);
    }
    /** Creates or removes the no data row, depending on whether any data is being shown. */
    _updateNoDataRow() {
        const noDataRow = this._customNoDataRow || this._noDataRow;
        if (!noDataRow) {
            return;
        }
        const shouldShow = this._rowOutlet.viewContainer.length === 0;
        if (shouldShow === this._isShowingNoDataRow) {
            return;
        }
        const container = this._noDataRowOutlet.viewContainer;
        if (shouldShow) {
            const view = container.createEmbeddedView(noDataRow.templateRef);
            const rootNode = view.rootNodes[0];
            // Only add the attributes if we have a single root node since it's hard
            // to figure out which one to add it to when there are multiple.
            if (view.rootNodes.length === 1 && rootNode?.nodeType === this._document.ELEMENT_NODE) {
                rootNode.setAttribute('role', 'row');
                rootNode.classList.add(noDataRow._contentClassName);
            }
        }
        else {
            container.clear();
        }
        this._isShowingNoDataRow = shouldShow;
        this._changeDetectorRef.markForCheck();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTable, deps: [{ token: i0.IterableDiffers }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: 'role', attribute: true }, { token: i1.Directionality, optional: true }, { token: DOCUMENT }, { token: i2.Platform }, { token: _VIEW_REPEATER_STRATEGY }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i3.ViewportRuler }, { token: STICKY_POSITIONING_LISTENER, optional: true, skipSelf: true }, { token: i0.NgZone, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: CdkTable, isStandalone: true, selector: "cdk-table, table[cdk-table]", inputs: { trackBy: "trackBy", dataSource: "dataSource", multiTemplateDataRows: ["multiTemplateDataRows", "multiTemplateDataRows", booleanAttribute], fixedLayout: ["fixedLayout", "fixedLayout", booleanAttribute] }, outputs: { contentChanged: "contentChanged" }, host: { properties: { "class.cdk-table-fixed-layout": "fixedLayout" }, classAttribute: "cdk-table" }, providers: [
            { provide: CDK_TABLE, useExisting: CdkTable },
            { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
            { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
            // Prevent nested tables from seeing this table's StickyPositioningListener.
            { provide: STICKY_POSITIONING_LISTENER, useValue: null },
        ], queries: [{ propertyName: "_noDataRow", first: true, predicate: CdkNoDataRow, descendants: true }, { propertyName: "_contentColumnDefs", predicate: CdkColumnDef, descendants: true }, { propertyName: "_contentRowDefs", predicate: CdkRowDef, descendants: true }, { propertyName: "_contentHeaderRowDefs", predicate: CdkHeaderRowDef, descendants: true }, { propertyName: "_contentFooterRowDefs", predicate: CdkFooterRowDef, descendants: true }], exportAs: ["cdkTable"], ngImport: i0, template: "\n  <ng-content select=\"caption\"/>\n  <ng-content select=\"colgroup, col\"/>\n\n  <!--\n    Unprojected content throws a hydration error so we need this to capture it.\n    It gets removed on the client so it doesn't affect the layout.\n  -->\n  @if (_isServer) {\n    <ng-content/>\n  }\n\n  @if (_isNativeHtmlTable) {\n    <thead role=\"rowgroup\">\n      <ng-container headerRowOutlet/>\n    </thead>\n    <tbody role=\"rowgroup\">\n      <ng-container rowOutlet/>\n      <ng-container noDataRowOutlet/>\n    </tbody>\n    <tfoot role=\"rowgroup\">\n      <ng-container footerRowOutlet/>\n    </tfoot>\n  } @else {\n    <ng-container headerRowOutlet/>\n    <ng-container rowOutlet/>\n    <ng-container noDataRowOutlet/>\n    <ng-container footerRowOutlet/>\n  }\n", isInline: true, styles: [".cdk-table-fixed-layout{table-layout:fixed}"], dependencies: [{ kind: "directive", type: HeaderRowOutlet, selector: "[headerRowOutlet]" }, { kind: "directive", type: DataRowOutlet, selector: "[rowOutlet]" }, { kind: "directive", type: NoDataRowOutlet, selector: "[noDataRowOutlet]" }, { kind: "directive", type: FooterRowOutlet, selector: "[footerRowOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTable, decorators: [{
            type: Component,
            args: [{ selector: 'cdk-table, table[cdk-table]', exportAs: 'cdkTable', template: CDK_TABLE_TEMPLATE, host: {
                        'class': 'cdk-table',
                        '[class.cdk-table-fixed-layout]': 'fixedLayout',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, providers: [
                        { provide: CDK_TABLE, useExisting: CdkTable },
                        { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
                        { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
                        // Prevent nested tables from seeing this table's StickyPositioningListener.
                        { provide: STICKY_POSITIONING_LISTENER, useValue: null },
                    ], standalone: true, imports: [HeaderRowOutlet, DataRowOutlet, NoDataRowOutlet, FooterRowOutlet], styles: [".cdk-table-fixed-layout{table-layout:fixed}"] }]
        }], ctorParameters: () => [{ type: i0.IterableDiffers }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['role']
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.Platform }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_VIEW_REPEATER_STRATEGY]
                }] }, { type: i4._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i3.ViewportRuler }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Inject,
                    args: [STICKY_POSITIONING_LISTENER]
                }] }, { type: i0.NgZone, decorators: [{
                    type: Optional
                }] }], propDecorators: { trackBy: [{
                type: Input
            }], dataSource: [{
                type: Input
            }], multiTemplateDataRows: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], fixedLayout: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], contentChanged: [{
                type: Output
            }], _contentColumnDefs: [{
                type: ContentChildren,
                args: [CdkColumnDef, { descendants: true }]
            }], _contentRowDefs: [{
                type: ContentChildren,
                args: [CdkRowDef, { descendants: true }]
            }], _contentHeaderRowDefs: [{
                type: ContentChildren,
                args: [CdkHeaderRowDef, {
                        descendants: true,
                    }]
            }], _contentFooterRowDefs: [{
                type: ContentChildren,
                args: [CdkFooterRowDef, {
                        descendants: true,
                    }]
            }], _noDataRow: [{
                type: ContentChild,
                args: [CdkNoDataRow]
            }] } });
/** Utility function that gets a merged list of the entries in an array and values of a Set. */
function mergeArrayAndSet(array, set) {
    return array.concat(Array.from(set));
}
/**
 * Finds the closest table section to an outlet. We can't use `HTMLElement.closest` for this,
 * because the node representing the outlet is a comment.
 */
function closestTableSection(outlet, section) {
    const uppercaseSection = section.toUpperCase();
    let current = outlet.viewContainer.element.nativeElement;
    while (current) {
        // 1 is an element node.
        const nodeName = current.nodeType === 1 ? current.nodeName : null;
        if (nodeName === uppercaseSection) {
            return current;
        }
        else if (nodeName === 'TABLE') {
            // Stop traversing past the `table` node.
            break;
        }
        current = current.parentNode;
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RhYmxlL3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBWSxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBR0wsNEJBQTRCLEVBQzVCLDRCQUE0QixFQUM1QixZQUFZLEVBQ1osdUJBQXVCLEVBSXZCLHNCQUFzQixHQUN2QixNQUFNLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFHTCxTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsWUFBWSxFQUNaLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLGVBQWUsRUFDZixZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFHTCxlQUFlLEVBQ2YsTUFBTSxFQUdOLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFFBQVEsRUFHUixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUNoQixNQUFNLEVBQ04sZUFBZSxFQUNmLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsZUFBZSxFQUNmLFlBQVksRUFFWixFQUFFLElBQUksWUFBWSxFQUNsQixPQUFPLEdBRVIsTUFBTSxNQUFNLENBQUM7QUFDZCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUNwQyxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsMEJBQTBCLEVBQUMsTUFB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QUFPLE9BQXNCLENBQUM7UUFDaEMsQ0FBQzthQUFNLElBQUksUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLHlDQUF5QztZQUN6QyxNQUFNO1FBQ1IsQ0FBQztRQUNELE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1xuICBDb2xsZWN0aW9uVmlld2VyLFxuICBEYXRhU291cmNlLFxuICBfRGlzcG9zZVZpZXdSZXBlYXRlclN0cmF0ZWd5LFxuICBfUmVjeWNsZVZpZXdSZXBlYXRlclN0cmF0ZWd5LFxuICBpc0RhdGFTb3VyY2UsXG4gIF9WSUVXX1JFUEVBVEVSX1NUUkFURUdZLFxuICBfVmlld1JlcGVhdGVyLFxuICBfVmlld1JlcGVhdGVySXRlbUNoYW5nZSxcbiAgX1ZpZXdSZXBlYXRlckl0ZW1JbnNlcnRBcmdzLFxuICBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLFxuICBJdGVyYWJsZURpZmZlcixcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG4gIFNraXBTZWxmLFxuICBUZW1wbGF0ZVJlZixcbiAgVHJhY2tCeUZ1bmN0aW9uLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgaW5qZWN0LFxuICBhZnRlck5leHRSZW5kZXIsXG4gIEluamVjdG9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJlaGF2aW9yU3ViamVjdCxcbiAgaXNPYnNlcnZhYmxlLFxuICBPYnNlcnZhYmxlLFxuICBvZiBhcyBvYnNlcnZhYmxlT2YsXG4gIFN1YmplY3QsXG4gIFN1YnNjcmlwdGlvbixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtDb2x1bW5EZWZ9IGZyb20gJy4vY2VsbCc7XG5pbXBvcnQge19Db2FsZXNjZWRTdHlsZVNjaGVkdWxlciwgX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVJ9IGZyb20gJy4vY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlcic7XG5pbXBvcnQge1xuICBCYXNlUm93RGVmLFxuICBDZGtDZWxsT3V0bGV0LFxuICBDZGtDZWxsT3V0bGV0TXVsdGlSb3dDb250ZXh0LFxuICBDZGtDZWxsT3V0bGV0Um93Q29udGV4dCxcbiAgQ2RrRm9vdGVyUm93RGVmLFxuICBDZGtIZWFkZXJSb3dEZWYsXG4gIENka05vRGF0YVJvdyxcbiAgQ2RrUm93RGVmLFxufSBmcm9tICcuL3Jvdyc7XG5pbXBvcnQge1N0aWNreVN0eWxlcn0gZnJvbSAnLi9zdGlja3ktc3R5bGVyJztcbmltcG9ydCB7XG4gIGdldFRhYmxlRHVwbGljYXRlQ29sdW1uTmFtZUVycm9yLFxuICBnZXRUYWJsZU1pc3NpbmdNYXRjaGluZ1Jvd0RlZkVycm9yLFxuICBnZXRUYWJsZU1pc3NpbmdSb3dEZWZzRXJyb3IsXG4gIGdldFRhYmxlTXVsdGlwbGVEZWZhdWx0Um93RGVmc0Vycm9yLFxuICBnZXRUYWJsZVVua25vd25Db2x1bW5FcnJvcixcbiAgZ2V0VGFibGVVbmtub3duRGF0YVNvdXJjZUVycm9yLFxufSBmcm9tICcuL3RhYmxlLWVycm9ycyc7XG5pbXBvcnQge1NUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUiwgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcn0gZnJvbSAnLi9zdGlja3ktcG9zaXRpb24tbGlzdGVuZXInO1xuaW1wb3J0IHtDREtfVEFCTEV9IGZyb20gJy4vdG9rZW5zJztcblxuLyoqXG4gKiBFbmFibGVzIHRoZSByZWN5Y2xlIHZpZXcgcmVwZWF0ZXIgc3RyYXRlZ3ksIHdoaWNoIHJlZHVjZXMgcmVuZGVyaW5nIGxhdGVuY3kuIE5vdCBjb21wYXRpYmxlIHdpdGhcbiAqIHRhYmxlcyB0aGF0IGFuaW1hdGUgcm93cy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXRhYmxlW3JlY3ljbGVSb3dzXSwgdGFibGVbY2RrLXRhYmxlXVtyZWN5Y2xlUm93c10nLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogX1ZJRVdfUkVQRUFURVJfU1RSQVRFR1ksIHVzZUNsYXNzOiBfUmVjeWNsZVZpZXdSZXBlYXRlclN0cmF0ZWd5fV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1JlY3ljbGVSb3dzIHt9XG5cbi8qKiBJbnRlcmZhY2UgdXNlZCB0byBwcm92aWRlIGFuIG91dGxldCBmb3Igcm93cyB0byBiZSBpbnNlcnRlZCBpbnRvLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb3dPdXRsZXQge1xuICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xufVxuXG4vKiogUG9zc2libGUgdHlwZXMgdGhhdCBjYW4gYmUgc2V0IGFzIHRoZSBkYXRhIHNvdXJjZSBmb3IgYSBgQ2RrVGFibGVgLiAqL1xuZXhwb3J0IHR5cGUgQ2RrVGFibGVEYXRhU291cmNlSW5wdXQ8VD4gPSByZWFkb25seSBUW10gfCBEYXRhU291cmNlPFQ+IHwgT2JzZXJ2YWJsZTxyZWFkb25seSBUW10+O1xuXG4vKipcbiAqIFByb3ZpZGVzIGEgaGFuZGxlIGZvciB0aGUgdGFibGUgdG8gZ3JhYiB0aGUgdmlldyBjb250YWluZXIncyBuZy1jb250YWluZXIgdG8gaW5zZXJ0IGRhdGEgcm93cy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3Jvd091dGxldF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRhUm93T3V0bGV0IGltcGxlbWVudHMgUm93T3V0bGV0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICkge1xuICAgIGNvbnN0IHRhYmxlID0gaW5qZWN0PENka1RhYmxlPHVua25vd24+PihDREtfVEFCTEUpO1xuICAgIHRhYmxlLl9yb3dPdXRsZXQgPSB0aGlzO1xuICAgIHRhYmxlLl9vdXRsZXRBc3NpZ25lZCgpO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYSBoYW5kbGUgZm9yIHRoZSB0YWJsZSB0byBncmFiIHRoZSB2aWV3IGNvbnRhaW5lcidzIG5nLWNvbnRhaW5lciB0byBpbnNlcnQgdGhlIGhlYWRlci5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2hlYWRlclJvd091dGxldF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBIZWFkZXJSb3dPdXRsZXQgaW1wbGVtZW50cyBSb3dPdXRsZXQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgKSB7XG4gICAgY29uc3QgdGFibGUgPSBpbmplY3Q8Q2RrVGFibGU8dW5rbm93bj4+KENES19UQUJMRSk7XG4gICAgdGFibGUuX2hlYWRlclJvd091dGxldCA9IHRoaXM7XG4gICAgdGFibGUuX291dGxldEFzc2lnbmVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlcyBhIGhhbmRsZSBmb3IgdGhlIHRhYmxlIHRvIGdyYWIgdGhlIHZpZXcgY29udGFpbmVyJ3MgbmctY29udGFpbmVyIHRvIGluc2VydCB0aGUgZm9vdGVyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbZm9vdGVyUm93T3V0bGV0XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIEZvb3RlclJvd091dGxldCBpbXBsZW1lbnRzIFJvd091dGxldCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICApIHtcbiAgICBjb25zdCB0YWJsZSA9IGluamVjdDxDZGtUYWJsZTx1bmtub3duPj4oQ0RLX1RBQkxFKTtcbiAgICB0YWJsZS5fZm9vdGVyUm93T3V0bGV0ID0gdGhpcztcbiAgICB0YWJsZS5fb3V0bGV0QXNzaWduZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIGEgaGFuZGxlIGZvciB0aGUgdGFibGUgdG8gZ3JhYiB0aGUgdmlld1xuICogY29udGFpbmVyJ3MgbmctY29udGFpbmVyIHRvIGluc2VydCB0aGUgbm8gZGF0YSByb3cuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tub0RhdGFSb3dPdXRsZXRdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTm9EYXRhUm93T3V0bGV0IGltcGxlbWVudHMgUm93T3V0bGV0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICkge1xuICAgIGNvbnN0IHRhYmxlID0gaW5qZWN0PENka1RhYmxlPHVua25vd24+PihDREtfVEFCTEUpO1xuICAgIHRhYmxlLl9ub0RhdGFSb3dPdXRsZXQgPSB0aGlzO1xuICAgIHRhYmxlLl9vdXRsZXRBc3NpZ25lZCgpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHRhYmxlIHRlbXBsYXRlIHRoYXQgY2FuIGJlIHVzZWQgYnkgdGhlIG1hdC10YWJsZS4gU2hvdWxkIG5vdCBiZSB1c2VkIG91dHNpZGUgb2YgdGhlXG4gKiBtYXRlcmlhbCBsaWJyYXJ5LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgQ0RLX1RBQkxFX1RFTVBMQVRFID1cbiAgLy8gTm90ZSB0aGF0IGFjY29yZGluZyB0byBNRE4sIHRoZSBgY2FwdGlvbmAgZWxlbWVudCBoYXMgdG8gYmUgcHJvamVjdGVkIGFzIHRoZSAqKmZpcnN0KipcbiAgLy8gZWxlbWVudCBpbiB0aGUgdGFibGUuIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0VsZW1lbnQvY2FwdGlvblxuICBgXG4gIDxuZy1jb250ZW50IHNlbGVjdD1cImNhcHRpb25cIi8+XG4gIDxuZy1jb250ZW50IHNlbGVjdD1cImNvbGdyb3VwLCBjb2xcIi8+XG5cbiAgPCEtLVxuICAgIFVucHJvamVjdGVkIGNvbnRlbnQgdGhyb3dzIGEgaHlkcmF0aW9uIGVycm9yIHNvIHdlIG5lZWQgdGhpcyB0byBjYXB0dXJlIGl0LlxuICAgIEl0IGdldHMgcmVtb3ZlZCBvbiB0aGUgY2xpZW50IHNvIGl0IGRvZXNuJ3QgYWZmZWN0IHRoZSBsYXlvdXQuXG4gIC0tPlxuICBAaWYgKF9pc1NlcnZlcikge1xuICAgIDxuZy1jb250ZW50Lz5cbiAgfVxuXG4gIEBpZiAoX2lzTmF0aXZlSHRtbFRhYmxlKSB7XG4gICAgPHRoZWFkIHJvbGU9XCJyb3dncm91cFwiPlxuICAgICAgPG5nLWNvbnRhaW5lciBoZWFkZXJSb3dPdXRsZXQvPlxuICAgIDwvdGhlYWQ+XG4gICAgPHRib2R5IHJvbGU9XCJyb3dncm91cFwiPlxuICAgICAgPG5nLWNvbnRhaW5lciByb3dPdXRsZXQvPlxuICAgICAgPG5nLWNvbnRhaW5lciBub0RhdGFSb3dPdXRsZXQvPlxuICAgIDwvdGJvZHk+XG4gICAgPHRmb290IHJvbGU9XCJyb3dncm91cFwiPlxuICAgICAgPG5nLWNvbnRhaW5lciBmb290ZXJSb3dPdXRsZXQvPlxuICAgIDwvdGZvb3Q+XG4gIH0gQGVsc2Uge1xuICAgIDxuZy1jb250YWluZXIgaGVhZGVyUm93T3V0bGV0Lz5cbiAgICA8bmctY29udGFpbmVyIHJvd091dGxldC8+XG4gICAgPG5nLWNvbnRhaW5lciBub0RhdGFSb3dPdXRsZXQvPlxuICAgIDxuZy1jb250YWluZXIgZm9vdGVyUm93T3V0bGV0Lz5cbiAgfVxuYDtcblxuLyoqXG4gKiBJbnRlcmZhY2UgdXNlZCB0byBjb252ZW5pZW50bHkgdHlwZSB0aGUgcG9zc2libGUgY29udGV4dCBpbnRlcmZhY2VzIGZvciB0aGUgcmVuZGVyIHJvdy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb3dDb250ZXh0PFQ+XG4gIGV4dGVuZHMgQ2RrQ2VsbE91dGxldE11bHRpUm93Q29udGV4dDxUPixcbiAgICBDZGtDZWxsT3V0bGV0Um93Q29udGV4dDxUPiB7fVxuXG4vKipcbiAqIENsYXNzIHVzZWQgdG8gY29udmVuaWVudGx5IHR5cGUgdGhlIGVtYmVkZGVkIHZpZXcgcmVmIGZvciByb3dzIHdpdGggYSBjb250ZXh0LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5hYnN0cmFjdCBjbGFzcyBSb3dWaWV3UmVmPFQ+IGV4dGVuZHMgRW1iZWRkZWRWaWV3UmVmPFJvd0NvbnRleHQ8VD4+IHt9XG5cbi8qKlxuICogU2V0IG9mIHByb3BlcnRpZXMgdGhhdCByZXByZXNlbnRzIHRoZSBpZGVudGl0eSBvZiBhIHNpbmdsZSByZW5kZXJlZCByb3cuXG4gKlxuICogV2hlbiB0aGUgdGFibGUgbmVlZHMgdG8gZGV0ZXJtaW5lIHRoZSBsaXN0IG9mIHJvd3MgdG8gcmVuZGVyLCBpdCB3aWxsIGRvIHNvIGJ5IGl0ZXJhdGluZyB0aHJvdWdoXG4gKiBlYWNoIGRhdGEgb2JqZWN0IGFuZCBldmFsdWF0aW5nIGl0cyBsaXN0IG9mIHJvdyB0ZW1wbGF0ZXMgdG8gZGlzcGxheSAod2hlbiBtdWx0aVRlbXBsYXRlRGF0YVJvd3NcbiAqIGlzIGZhbHNlLCB0aGVyZSBpcyBvbmx5IG9uZSB0ZW1wbGF0ZSBwZXIgZGF0YSBvYmplY3QpLiBGb3IgZWFjaCBwYWlyIG9mIGRhdGEgb2JqZWN0IGFuZCByb3dcbiAqIHRlbXBsYXRlLCBhIGBSZW5kZXJSb3dgIGlzIGFkZGVkIHRvIHRoZSBsaXN0IG9mIHJvd3MgdG8gcmVuZGVyLiBJZiB0aGUgZGF0YSBvYmplY3QgYW5kIHJvd1xuICogdGVtcGxhdGUgcGFpciBoYXMgYWxyZWFkeSBiZWVuIHJlbmRlcmVkLCB0aGUgcHJldmlvdXNseSB1c2VkIGBSZW5kZXJSb3dgIGlzIGFkZGVkOyBlbHNlIGEgbmV3XG4gKiBgUmVuZGVyUm93YCBpcyAqIGNyZWF0ZWQuIE9uY2UgdGhlIGxpc3QgaXMgY29tcGxldGUgYW5kIGFsbCBkYXRhIG9iamVjdHMgaGF2ZSBiZWVuIGl0ZXJhdGVkXG4gKiB0aHJvdWdoLCBhIGRpZmYgaXMgcGVyZm9ybWVkIHRvIGRldGVybWluZSB0aGUgY2hhbmdlcyB0aGF0IG5lZWQgdG8gYmUgbWFkZSB0byB0aGUgcmVuZGVyZWQgcm93cy5cbiAqXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyUm93PFQ+IHtcbiAgZGF0YTogVDtcbiAgZGF0YUluZGV4OiBudW1iZXI7XG4gIHJvd0RlZjogQ2RrUm93RGVmPFQ+O1xufVxuXG4vKipcbiAqIEEgZGF0YSB0YWJsZSB0aGF0IGNhbiByZW5kZXIgYSBoZWFkZXIgcm93LCBkYXRhIHJvd3MsIGFuZCBhIGZvb3RlciByb3cuXG4gKiBVc2VzIHRoZSBkYXRhU291cmNlIGlucHV0IHRvIGRldGVybWluZSB0aGUgZGF0YSB0byBiZSByZW5kZXJlZC4gVGhlIGRhdGEgY2FuIGJlIHByb3ZpZGVkIGVpdGhlclxuICogYXMgYSBkYXRhIGFycmF5LCBhbiBPYnNlcnZhYmxlIHN0cmVhbSB0aGF0IGVtaXRzIHRoZSBkYXRhIGFycmF5IHRvIHJlbmRlciwgb3IgYSBEYXRhU291cmNlIHdpdGggYVxuICogY29ubmVjdCBmdW5jdGlvbiB0aGF0IHdpbGwgcmV0dXJuIGFuIE9ic2VydmFibGUgc3RyZWFtIHRoYXQgZW1pdHMgdGhlIGRhdGEgYXJyYXkgdG8gcmVuZGVyLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstdGFibGUsIHRhYmxlW2Nkay10YWJsZV0nLFxuICBleHBvcnRBczogJ2Nka1RhYmxlJyxcbiAgdGVtcGxhdGU6IENES19UQUJMRV9URU1QTEFURSxcbiAgc3R5bGVVcmw6ICd0YWJsZS5jc3MnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay10YWJsZScsXG4gICAgJ1tjbGFzcy5jZGstdGFibGUtZml4ZWQtbGF5b3V0XSc6ICdmaXhlZExheW91dCcsXG4gIH0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIC8vIFRoZSBcIk9uUHVzaFwiIHN0YXR1cyBmb3IgdGhlIGBNYXRUYWJsZWAgY29tcG9uZW50IGlzIGVmZmVjdGl2ZWx5IGEgbm9vcCwgc28gd2UgYXJlIHJlbW92aW5nIGl0LlxuICAvLyBUaGUgdmlldyBmb3IgYE1hdFRhYmxlYCBjb25zaXN0cyBlbnRpcmVseSBvZiB0ZW1wbGF0ZXMgZGVjbGFyZWQgaW4gb3RoZXIgdmlld3MuIEFzIHRoZXkgYXJlXG4gIC8vIGRlY2xhcmVkIGVsc2V3aGVyZSwgdGhleSBhcmUgY2hlY2tlZCB3aGVuIHRoZWlyIGRlY2xhcmF0aW9uIHBvaW50cyBhcmUgY2hlY2tlZC5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ0RLX1RBQkxFLCB1c2VFeGlzdGluZzogQ2RrVGFibGV9LFxuICAgIHtwcm92aWRlOiBfVklFV19SRVBFQVRFUl9TVFJBVEVHWSwgdXNlQ2xhc3M6IF9EaXNwb3NlVmlld1JlcGVhdGVyU3RyYXRlZ3l9LFxuICAgIHtwcm92aWRlOiBfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUiwgdXNlQ2xhc3M6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcn0sXG4gICAgLy8gUHJldmVudCBuZXN0ZWQgdGFibGVzIGZyb20gc2VlaW5nIHRoaXMgdGFibGUncyBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLlxuICAgIHtwcm92aWRlOiBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsIHVzZVZhbHVlOiBudWxsfSxcbiAgXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0hlYWRlclJvd091dGxldCwgRGF0YVJvd091dGxldCwgTm9EYXRhUm93T3V0bGV0LCBGb290ZXJSb3dPdXRsZXRdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZTxUPlxuICBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIEFmdGVyQ29udGVudENoZWNrZWQsIENvbGxlY3Rpb25WaWV3ZXIsIE9uRGVzdHJveSwgT25Jbml0XG57XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICAvKiogTGF0ZXN0IGRhdGEgcHJvdmlkZWQgYnkgdGhlIGRhdGEgc291cmNlLiAqL1xuICBwcm90ZWN0ZWQgX2RhdGE6IHJlYWRvbmx5IFRbXTtcblxuICAvKiogU3ViamVjdCB0aGF0IGVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX29uRGVzdHJveSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIExpc3Qgb2YgdGhlIHJlbmRlcmVkIHJvd3MgYXMgaWRlbnRpZmllZCBieSB0aGVpciBgUmVuZGVyUm93YCBvYmplY3QuICovXG4gIHByaXZhdGUgX3JlbmRlclJvd3M6IFJlbmRlclJvdzxUPltdO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdGhhdCBsaXN0ZW5zIGZvciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbDtcblxuICAvKipcbiAgICogTWFwIG9mIGFsbCB0aGUgdXNlcidzIGRlZmluZWQgY29sdW1ucyAoaGVhZGVyLCBkYXRhLCBhbmQgZm9vdGVyIGNlbGwgdGVtcGxhdGUpIGlkZW50aWZpZWQgYnlcbiAgICogbmFtZS4gQ29sbGVjdGlvbiBwb3B1bGF0ZWQgYnkgdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBnYXRoZXJlZCBieSBgQ29udGVudENoaWxkcmVuYCBhcyB3ZWxsIGFzXG4gICAqIGFueSBjdXN0b20gY29sdW1uIGRlZmluaXRpb25zIGFkZGVkIHRvIGBfY3VzdG9tQ29sdW1uRGVmc2AuXG4gICAqL1xuICBwcml2YXRlIF9jb2x1bW5EZWZzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIENka0NvbHVtbkRlZj4oKTtcblxuICAvKipcbiAgICogU2V0IG9mIGFsbCByb3cgZGVmaW5pdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGlzIHRhYmxlLiBQb3B1bGF0ZWQgYnkgdGhlIHJvd3MgZ2F0aGVyZWQgYnlcbiAgICogdXNpbmcgYENvbnRlbnRDaGlsZHJlbmAgYXMgd2VsbCBhcyBhbnkgY3VzdG9tIHJvdyBkZWZpbml0aW9ucyBhZGRlZCB0byBgX2N1c3RvbVJvd0RlZnNgLlxuICAgKi9cbiAgcHJpdmF0ZSBfcm93RGVmczogQ2RrUm93RGVmPFQ+W107XG5cbiAgLyoqXG4gICAqIFNldCBvZiBhbGwgaGVhZGVyIHJvdyBkZWZpbml0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoaXMgdGFibGUuIFBvcHVsYXRlZCBieSB0aGUgcm93c1xuICAgKiBnYXRoZXJlZCBieSB1c2luZyBgQ29udGVudENoaWxkcmVuYCBhcyB3ZWxsIGFzIGFueSBjdXN0b20gcm93IGRlZmluaXRpb25zIGFkZGVkIHRvXG4gICAqIGBfY3VzdG9tSGVhZGVyUm93RGVmc2AuXG4gICAqL1xuICBwcml2YXRlIF9oZWFkZXJSb3dEZWZzOiBDZGtIZWFkZXJSb3dEZWZbXTtcblxuICAvKipcbiAgICogU2V0IG9mIGFsbCByb3cgZGVmaW5pdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGlzIHRhYmxlLiBQb3B1bGF0ZWQgYnkgdGhlIHJvd3MgZ2F0aGVyZWQgYnlcbiAgICogdXNpbmcgYENvbnRlbnRDaGlsZHJlbmAgYXMgd2VsbCBhcyBhbnkgY3VzdG9tIHJvdyBkZWZpbml0aW9ucyBhZGRlZCB0b1xuICAgKiBgX2N1c3RvbUZvb3RlclJvd0RlZnNgLlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9vdGVyUm93RGVmczogQ2RrRm9vdGVyUm93RGVmW107XG5cbiAgLyoqIERpZmZlciB1c2VkIHRvIGZpbmQgdGhlIGNoYW5nZXMgaW4gdGhlIGRhdGEgcHJvdmlkZWQgYnkgdGhlIGRhdGEgc291cmNlLiAqL1xuICBwcml2YXRlIF9kYXRhRGlmZmVyOiBJdGVyYWJsZURpZmZlcjxSZW5kZXJSb3c8VD4+O1xuXG4gIC8qKiBTdG9yZXMgdGhlIHJvdyBkZWZpbml0aW9uIHRoYXQgZG9lcyBub3QgaGF2ZSBhIHdoZW4gcHJlZGljYXRlLiAqL1xuICBwcml2YXRlIF9kZWZhdWx0Um93RGVmOiBDZGtSb3dEZWY8VD4gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBDb2x1bW4gZGVmaW5pdGlvbnMgdGhhdCB3ZXJlIGRlZmluZWQgb3V0c2lkZSBvZiB0aGUgZGlyZWN0IGNvbnRlbnQgY2hpbGRyZW4gb2YgdGhlIHRhYmxlLlxuICAgKiBUaGVzZSB3aWxsIGJlIGRlZmluZWQgd2hlbiwgZS5nLiwgY3JlYXRpbmcgYSB3cmFwcGVyIGFyb3VuZCB0aGUgY2RrVGFibGUgdGhhdCBoYXNcbiAgICogY29sdW1uIGRlZmluaXRpb25zIGFzICppdHMqIGNvbnRlbnQgY2hpbGQuXG4gICAqL1xuICBwcml2YXRlIF9jdXN0b21Db2x1bW5EZWZzID0gbmV3IFNldDxDZGtDb2x1bW5EZWY+KCk7XG5cbiAgLyoqXG4gICAqIERhdGEgcm93IGRlZmluaXRpb25zIHRoYXQgd2VyZSBkZWZpbmVkIG91dHNpZGUgb2YgdGhlIGRpcmVjdCBjb250ZW50IGNoaWxkcmVuIG9mIHRoZSB0YWJsZS5cbiAgICogVGhlc2Ugd2lsbCBiZSBkZWZpbmVkIHdoZW4sIGUuZy4sIGNyZWF0aW5nIGEgd3JhcHBlciBhcm91bmQgdGhlIGNka1RhYmxlIHRoYXQgaGFzXG4gICAqIGJ1aWx0LWluIGRhdGEgcm93cyBhcyAqaXRzKiBjb250ZW50IGNoaWxkLlxuICAgKi9cbiAgcHJpdmF0ZSBfY3VzdG9tUm93RGVmcyA9IG5ldyBTZXQ8Q2RrUm93RGVmPFQ+PigpO1xuXG4gIC8qKlxuICAgKiBIZWFkZXIgcm93IGRlZmluaXRpb25zIHRoYXQgd2VyZSBkZWZpbmVkIG91dHNpZGUgb2YgdGhlIGRpcmVjdCBjb250ZW50IGNoaWxkcmVuIG9mIHRoZSB0YWJsZS5cbiAgICogVGhlc2Ugd2lsbCBiZSBkZWZpbmVkIHdoZW4sIGUuZy4sIGNyZWF0aW5nIGEgd3JhcHBlciBhcm91bmQgdGhlIGNka1RhYmxlIHRoYXQgaGFzXG4gICAqIGJ1aWx0LWluIGhlYWRlciByb3dzIGFzICppdHMqIGNvbnRlbnQgY2hpbGQuXG4gICAqL1xuICBwcml2YXRlIF9jdXN0b21IZWFkZXJSb3dEZWZzID0gbmV3IFNldDxDZGtIZWFkZXJSb3dEZWY+KCk7XG5cbiAgLyoqXG4gICAqIEZvb3RlciByb3cgZGVmaW5pdGlvbnMgdGhhdCB3ZXJlIGRlZmluZWQgb3V0c2lkZSBvZiB0aGUgZGlyZWN0IGNvbnRlbnQgY2hpbGRyZW4gb2YgdGhlIHRhYmxlLlxuICAgKiBUaGVzZSB3aWxsIGJlIGRlZmluZWQgd2hlbiwgZS5nLiwgY3JlYXRpbmcgYSB3cmFwcGVyIGFyb3VuZCB0aGUgY2RrVGFibGUgdGhhdCBoYXMgYVxuICAgKiBidWlsdC1pbiBmb290ZXIgcm93IGFzICppdHMqIGNvbnRlbnQgY2hpbGQuXG4gICAqL1xuICBwcml2YXRlIF9jdXN0b21Gb290ZXJSb3dEZWZzID0gbmV3IFNldDxDZGtGb290ZXJSb3dEZWY+KCk7XG5cbiAgLyoqIE5vIGRhdGEgcm93IHRoYXQgd2FzIGRlZmluZWQgb3V0c2lkZSBvZiB0aGUgZGlyZWN0IGNvbnRlbnQgY2hpbGRyZW4gb2YgdGhlIHRhYmxlLiAqL1xuICBwcml2YXRlIF9jdXN0b21Ob0RhdGFSb3c6IENka05vRGF0YVJvdyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGhlYWRlciByb3cgZGVmaW5pdGlvbiBoYXMgYmVlbiBjaGFuZ2VkLiBUcmlnZ2VycyBhbiB1cGRhdGUgdG8gdGhlIGhlYWRlciByb3cgYWZ0ZXJcbiAgICogY29udGVudCBpcyBjaGVja2VkLiBJbml0aWFsaXplZCBhcyB0cnVlIHNvIHRoYXQgdGhlIHRhYmxlIHJlbmRlcnMgdGhlIGluaXRpYWwgc2V0IG9mIHJvd3MuXG4gICAqL1xuICBwcml2YXRlIF9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZm9vdGVyIHJvdyBkZWZpbml0aW9uIGhhcyBiZWVuIGNoYW5nZWQuIFRyaWdnZXJzIGFuIHVwZGF0ZSB0byB0aGUgZm9vdGVyIHJvdyBhZnRlclxuICAgKiBjb250ZW50IGlzIGNoZWNrZWQuIEluaXRpYWxpemVkIGFzIHRydWUgc28gdGhhdCB0aGUgdGFibGUgcmVuZGVycyB0aGUgaW5pdGlhbCBzZXQgb2Ygcm93cy5cbiAgICovXG4gIHByaXZhdGUgX2Zvb3RlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzdGlja3kgY29sdW1uIHN0eWxlcyBuZWVkIHRvIGJlIHVwZGF0ZWQuIFNldCB0byBgdHJ1ZWAgd2hlbiB0aGUgdmlzaWJsZSBjb2x1bW5zXG4gICAqIGNoYW5nZS5cbiAgICovXG4gIHByaXZhdGUgX3N0aWNreUNvbHVtblN0eWxlc05lZWRSZXNldCA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHN0aWNreSBzdHlsZXIgc2hvdWxkIHJlY2FsY3VsYXRlIGNlbGwgd2lkdGhzIHdoZW4gYXBwbHlpbmcgc3RpY2t5IHN0eWxlcy4gSWZcbiAgICogYGZhbHNlYCwgY2FjaGVkIHZhbHVlcyB3aWxsIGJlIHVzZWQgaW5zdGVhZC4gVGhpcyBpcyBvbmx5IGFwcGxpY2FibGUgdG8gdGFibGVzIHdpdGhcbiAgICoge0BsaW5rIGZpeGVkTGF5b3V0fSBlbmFibGVkLiBGb3Igb3RoZXIgdGFibGVzLCBjZWxsIHdpZHRocyB3aWxsIGFsd2F5cyBiZSByZWNhbGN1bGF0ZWQuXG4gICAqL1xuICBwcml2YXRlIF9mb3JjZVJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWU7XG5cbiAgLyoqXG4gICAqIENhY2hlIG9mIHRoZSBsYXRlc3QgcmVuZGVyZWQgYFJlbmRlclJvd2Agb2JqZWN0cyBhcyBhIG1hcCBmb3IgZWFzeSByZXRyaWV2YWwgd2hlbiBjb25zdHJ1Y3RpbmdcbiAgICogYSBuZXcgbGlzdCBvZiBgUmVuZGVyUm93YCBvYmplY3RzIGZvciByZW5kZXJpbmcgcm93cy4gU2luY2UgdGhlIG5ldyBsaXN0IGlzIGNvbnN0cnVjdGVkIHdpdGhcbiAgICogdGhlIGNhY2hlZCBgUmVuZGVyUm93YCBvYmplY3RzIHdoZW4gcG9zc2libGUsIHRoZSByb3cgaWRlbnRpdHkgaXMgcHJlc2VydmVkIHdoZW4gdGhlIGRhdGFcbiAgICogYW5kIHJvdyB0ZW1wbGF0ZSBtYXRjaGVzLCB3aGljaCBhbGxvd3MgdGhlIGBJdGVyYWJsZURpZmZlcmAgdG8gY2hlY2sgcm93cyBieSByZWZlcmVuY2VcbiAgICogYW5kIHVuZGVyc3RhbmQgd2hpY2ggcm93cyBhcmUgYWRkZWQvbW92ZWQvcmVtb3ZlZC5cbiAgICpcbiAgICogSW1wbGVtZW50ZWQgYXMgYSBtYXAgb2YgbWFwcyB3aGVyZSB0aGUgZmlyc3Qga2V5IGlzIHRoZSBgZGF0YTogVGAgb2JqZWN0IGFuZCB0aGUgc2Vjb25kIGlzIHRoZVxuICAgKiBgQ2RrUm93RGVmPFQ+YCBvYmplY3QuIFdpdGggdGhlIHR3byBrZXlzLCB0aGUgY2FjaGUgcG9pbnRzIHRvIGEgYFJlbmRlclJvdzxUPmAgb2JqZWN0IHRoYXRcbiAgICogY29udGFpbnMgYW4gYXJyYXkgb2YgY3JlYXRlZCBwYWlycy4gVGhlIGFycmF5IGlzIG5lY2Vzc2FyeSB0byBoYW5kbGUgY2FzZXMgd2hlcmUgdGhlIGRhdGFcbiAgICogYXJyYXkgY29udGFpbnMgbXVsdGlwbGUgZHVwbGljYXRlIGRhdGEgb2JqZWN0cyBhbmQgZWFjaCBpbnN0YW50aWF0ZWQgYFJlbmRlclJvd2AgbXVzdCBiZVxuICAgKiBzdG9yZWQuXG4gICAqL1xuICBwcml2YXRlIF9jYWNoZWRSZW5kZXJSb3dzTWFwID0gbmV3IE1hcDxULCBXZWFrTWFwPENka1Jvd0RlZjxUPiwgUmVuZGVyUm93PFQ+W10+PigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0YWJsZSBpcyBhcHBsaWVkIHRvIGEgbmF0aXZlIGA8dGFibGU+YC4gKi9cbiAgcHJvdGVjdGVkIF9pc05hdGl2ZUh0bWxUYWJsZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogVXRpbGl0eSBjbGFzcyB0aGF0IGlzIHJlc3BvbnNpYmxlIGZvciBhcHBseWluZyB0aGUgYXBwcm9wcmlhdGUgc3RpY2t5IHBvc2l0aW9uaW5nIHN0eWxlcyB0b1xuICAgKiB0aGUgdGFibGUncyByb3dzIGFuZCBjZWxscy5cbiAgICovXG4gIHByaXZhdGUgX3N0aWNreVN0eWxlcjogU3RpY2t5U3R5bGVyO1xuXG4gIC8qKlxuICAgKiBDU1MgY2xhc3MgYWRkZWQgdG8gYW55IHJvdyBvciBjZWxsIHRoYXQgaGFzIHN0aWNreSBwb3NpdGlvbmluZyBhcHBsaWVkLiBNYXkgYmUgb3ZlcnJpZGRlbiBieVxuICAgKiB0YWJsZSBzdWJjbGFzc2VzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHN0aWNreUNzc0NsYXNzOiBzdHJpbmcgPSAnY2RrLXRhYmxlLXN0aWNreSc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gbWFudWFsbHkgYWRkIHBvc2l0aW9uOiBzdGlja3kgdG8gYWxsIHN0aWNreSBjZWxsIGVsZW1lbnRzLiBOb3QgbmVlZGVkIGlmXG4gICAqIHRoZSBwb3NpdGlvbiBpcyBzZXQgaW4gYSBzZWxlY3RvciBhc3NvY2lhdGVkIHdpdGggdGhlIHZhbHVlIG9mIHN0aWNreUNzc0NsYXNzLiBNYXkgYmVcbiAgICogb3ZlcnJpZGRlbiBieSB0YWJsZSBzdWJjbGFzc2VzXG4gICAqL1xuICBwcm90ZWN0ZWQgbmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCA9IHRydWU7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBiZWluZyByZW5kZXJlZCBvbiB0aGUgc2VydmVyLiAqL1xuICBwcm90ZWN0ZWQgX2lzU2VydmVyOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBubyBkYXRhIHJvdyBpcyBjdXJyZW50bHkgc2hvd2luZyBhbnl0aGluZy4gKi9cbiAgcHJpdmF0ZSBfaXNTaG93aW5nTm9EYXRhUm93ID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYmxlIGhhcyByZW5kZXJlZCBvdXQgYWxsIHRoZSBvdXRsZXRzIGZvciB0aGUgZmlyc3QgdGltZS4gKi9cbiAgcHJpdmF0ZSBfaGFzQWxsT3V0bGV0cyA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0YWJsZSBpcyBkb25lIGluaXRpYWxpemluZy4gKi9cbiAgcHJpdmF0ZSBfaGFzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAvKiogQXJpYSByb2xlIHRvIGFwcGx5IHRvIHRoZSB0YWJsZSdzIGNlbGxzIGJhc2VkIG9uIHRoZSB0YWJsZSdzIG93biByb2xlLiAqL1xuICBfZ2V0Q2VsbFJvbGUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8gUGVyZm9ybSB0aGlzIGxhemlseSBpbiBjYXNlIHRoZSB0YWJsZSdzIHJvbGUgd2FzIHVwZGF0ZWQgYnkgYSBkaXJlY3RpdmUgYWZ0ZXIgY29uc3RydWN0aW9uLlxuICAgIGlmICh0aGlzLl9jZWxsUm9sZUludGVybmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB3ZSBzZXQgYHJvbGU9XCJjZWxsXCJgIGV2ZW4gb24gbmF0aXZlIGB0ZGAgZWxlbWVudHMsXG4gICAgICAvLyBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgc2VlbSB0byByZXF1aXJlIGl0LiBTZWUgIzI5Nzg0LlxuICAgICAgY29uc3QgdGFibGVSb2xlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgncm9sZScpO1xuICAgICAgcmV0dXJuIHRhYmxlUm9sZSA9PT0gJ2dyaWQnIHx8IHRhYmxlUm9sZSA9PT0gJ3RyZWVncmlkJyA/ICdncmlkY2VsbCcgOiAnY2VsbCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NlbGxSb2xlSW50ZXJuYWw7XG4gIH1cbiAgcHJpdmF0ZSBfY2VsbFJvbGVJbnRlcm5hbDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gY2hlY2sgdGhlIGRpZmZlcmVuY2VzIGluIGRhdGEgY2hhbmdlcy4gVXNlZCBzaW1pbGFybHlcbiAgICogdG8gYG5nRm9yYCBgdHJhY2tCeWAgZnVuY3Rpb24uIE9wdGltaXplIHJvdyBvcGVyYXRpb25zIGJ5IGlkZW50aWZ5aW5nIGEgcm93IGJhc2VkIG9uIGl0cyBkYXRhXG4gICAqIHJlbGF0aXZlIHRvIHRoZSBmdW5jdGlvbiB0byBrbm93IGlmIGEgcm93IHNob3VsZCBiZSBhZGRlZC9yZW1vdmVkL21vdmVkLlxuICAgKiBBY2NlcHRzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0d28gcGFyYW1ldGVycywgYGluZGV4YCBhbmQgYGl0ZW1gLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IHRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xuICB9XG4gIHNldCB0cmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgZm4gIT0gbnVsbCAmJiB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybihgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uYCk7XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xuICB9XG4gIHByaXZhdGUgX3RyYWNrQnlGbjogVHJhY2tCeUZ1bmN0aW9uPFQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgdGFibGUncyBzb3VyY2Ugb2YgZGF0YSwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGluIHRocmVlIHdheXMgKGluIG9yZGVyIG9mIGNvbXBsZXhpdHkpOlxuICAgKiAgIC0gU2ltcGxlIGRhdGEgYXJyYXkgKGVhY2ggb2JqZWN0IHJlcHJlc2VudHMgb25lIHRhYmxlIHJvdylcbiAgICogICAtIFN0cmVhbSB0aGF0IGVtaXRzIGEgZGF0YSBhcnJheSBlYWNoIHRpbWUgdGhlIGFycmF5IGNoYW5nZXNcbiAgICogICAtIGBEYXRhU291cmNlYCBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIHRoZSBjb25uZWN0L2Rpc2Nvbm5lY3QgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBJZiBhIGRhdGEgYXJyYXkgaXMgcHJvdmlkZWQsIHRoZSB0YWJsZSBtdXN0IGJlIG5vdGlmaWVkIHdoZW4gdGhlIGFycmF5J3Mgb2JqZWN0cyBhcmVcbiAgICogYWRkZWQsIHJlbW92ZWQsIG9yIG1vdmVkLiBUaGlzIGNhbiBiZSBkb25lIGJ5IGNhbGxpbmcgdGhlIGByZW5kZXJSb3dzKClgIGZ1bmN0aW9uIHdoaWNoIHdpbGxcbiAgICogcmVuZGVyIHRoZSBkaWZmIHNpbmNlIHRoZSBsYXN0IHRhYmxlIHJlbmRlci4gSWYgdGhlIGRhdGEgYXJyYXkgcmVmZXJlbmNlIGlzIGNoYW5nZWQsIHRoZSB0YWJsZVxuICAgKiB3aWxsIGF1dG9tYXRpY2FsbHkgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHJvd3MuXG4gICAqXG4gICAqIFdoZW4gcHJvdmlkaW5nIGFuIE9ic2VydmFibGUgc3RyZWFtLCB0aGUgdGFibGUgd2lsbCB0cmlnZ2VyIGFuIHVwZGF0ZSBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlXG4gICAqIHN0cmVhbSBlbWl0cyBhIG5ldyBhcnJheSBvZiBkYXRhLlxuICAgKlxuICAgKiBGaW5hbGx5LCB3aGVuIHByb3ZpZGluZyBhIGBEYXRhU291cmNlYCBvYmplY3QsIHRoZSB0YWJsZSB3aWxsIHVzZSB0aGUgT2JzZXJ2YWJsZSBzdHJlYW1cbiAgICogcHJvdmlkZWQgYnkgdGhlIGNvbm5lY3QgZnVuY3Rpb24gYW5kIHRyaWdnZXIgdXBkYXRlcyB3aGVuIHRoYXQgc3RyZWFtIGVtaXRzIG5ldyBkYXRhIGFycmF5XG4gICAqIHZhbHVlcy4gRHVyaW5nIHRoZSB0YWJsZSdzIG5nT25EZXN0cm95IG9yIHdoZW4gdGhlIGRhdGEgc291cmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgdGFibGUsIHRoZVxuICAgKiB0YWJsZSB3aWxsIGNhbGwgdGhlIERhdGFTb3VyY2UncyBgZGlzY29ubmVjdGAgZnVuY3Rpb24gKG1heSBiZSB1c2VmdWwgZm9yIGNsZWFuaW5nIHVwIGFueVxuICAgKiBzdWJzY3JpcHRpb25zIHJlZ2lzdGVyZWQgZHVyaW5nIHRoZSBjb25uZWN0IHByb2Nlc3MpLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRhdGFTb3VyY2UoKTogQ2RrVGFibGVEYXRhU291cmNlSW5wdXQ8VD4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xuICB9XG4gIHNldCBkYXRhU291cmNlKGRhdGFTb3VyY2U6IENka1RhYmxlRGF0YVNvdXJjZUlucHV0PFQ+KSB7XG4gICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UgIT09IGRhdGFTb3VyY2UpIHtcbiAgICAgIHRoaXMuX3N3aXRjaERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2RhdGFTb3VyY2U6IENka1RhYmxlRGF0YVNvdXJjZUlucHV0PFQ+O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGFsbG93IG11bHRpcGxlIHJvd3MgcGVyIGRhdGEgb2JqZWN0IGJ5IGV2YWx1YXRpbmcgd2hpY2ggcm93cyBldmFsdWF0ZSB0aGVpciAnd2hlbidcbiAgICogcHJlZGljYXRlIHRvIHRydWUuIElmIGBtdWx0aVRlbXBsYXRlRGF0YVJvd3NgIGlzIGZhbHNlLCB3aGljaCBpcyB0aGUgZGVmYXVsdCB2YWx1ZSwgdGhlbiBlYWNoXG4gICAqIGRhdGFvYmplY3Qgd2lsbCByZW5kZXIgdGhlIGZpcnN0IHJvdyB0aGF0IGV2YWx1YXRlcyBpdHMgd2hlbiBwcmVkaWNhdGUgdG8gdHJ1ZSwgaW4gdGhlIG9yZGVyXG4gICAqIGRlZmluZWQgaW4gdGhlIHRhYmxlLCBvciBvdGhlcndpc2UgdGhlIGRlZmF1bHQgcm93IHdoaWNoIGRvZXMgbm90IGhhdmUgYSB3aGVuIHByZWRpY2F0ZS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IG11bHRpVGVtcGxhdGVEYXRhUm93cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlUZW1wbGF0ZURhdGFSb3dzO1xuICB9XG4gIHNldCBtdWx0aVRlbXBsYXRlRGF0YVJvd3ModmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9tdWx0aVRlbXBsYXRlRGF0YVJvd3MgPSB2YWx1ZTtcblxuICAgIC8vIEluIEl2eSBpZiB0aGlzIHZhbHVlIGlzIHNldCB2aWEgYSBzdGF0aWMgYXR0cmlidXRlIChlLmcuIDx0YWJsZSBtdWx0aVRlbXBsYXRlRGF0YVJvd3M+KSxcbiAgICAvLyB0aGlzIHNldHRlciB3aWxsIGJlIGludm9rZWQgYmVmb3JlIHRoZSByb3cgb3V0bGV0IGhhcyBiZWVuIGRlZmluZWQgaGVuY2UgdGhlIG51bGwgY2hlY2suXG4gICAgaWYgKHRoaXMuX3Jvd091dGxldCAmJiB0aGlzLl9yb3dPdXRsZXQudmlld0NvbnRhaW5lci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKTtcbiAgICAgIHRoaXMudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgfVxuICB9XG4gIF9tdWx0aVRlbXBsYXRlRGF0YVJvd3M6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogV2hldGhlciB0byB1c2UgYSBmaXhlZCB0YWJsZSBsYXlvdXQuIEVuYWJsaW5nIHRoaXMgb3B0aW9uIHdpbGwgZW5mb3JjZSBjb25zaXN0ZW50IGNvbHVtbiB3aWR0aHNcbiAgICogYW5kIG9wdGltaXplIHJlbmRlcmluZyBzdGlja3kgc3R5bGVzIGZvciBuYXRpdmUgdGFibGVzLiBOby1vcCBmb3IgZmxleCB0YWJsZXMuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBmaXhlZExheW91dCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZml4ZWRMYXlvdXQ7XG4gIH1cbiAgc2V0IGZpeGVkTGF5b3V0KHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZml4ZWRMYXlvdXQgPSB2YWx1ZTtcblxuICAgIC8vIFRvZ2dsaW5nIGBmaXhlZExheW91dGAgbWF5IGNoYW5nZSBjb2x1bW4gd2lkdGhzLiBTdGlja3kgY29sdW1uIHN0eWxlcyBzaG91bGQgYmUgcmVjYWxjdWxhdGVkLlxuICAgIHRoaXMuX2ZvcmNlUmVjYWxjdWxhdGVDZWxsV2lkdGhzID0gdHJ1ZTtcbiAgICB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgPSB0cnVlO1xuICB9XG4gIHByaXZhdGUgX2ZpeGVkTGF5b3V0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIHRhYmxlIGNvbXBsZXRlcyByZW5kZXJpbmcgYSBzZXQgb2YgZGF0YSByb3dzIGJhc2VkIG9uIHRoZSBsYXRlc3QgZGF0YSBmcm9tIHRoZVxuICAgKiBkYXRhIHNvdXJjZSwgZXZlbiBpZiB0aGUgc2V0IG9mIHJvd3MgaXMgZW1wdHkuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgcmVhZG9ubHkgY29udGVudENoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLy8gVE9ETyhhbmRyZXdzZWd1aW4pOiBSZW1vdmUgbWF4IHZhbHVlIGFzIHRoZSBlbmQgaW5kZXhcbiAgLy8gICBhbmQgaW5zdGVhZCBjYWxjdWxhdGUgdGhlIHZpZXcgb24gaW5pdCBhbmQgc2Nyb2xsLlxuICAvKipcbiAgICogU3RyZWFtIGNvbnRhaW5pbmcgdGhlIGxhdGVzdCBpbmZvcm1hdGlvbiBvbiB3aGF0IHJvd3MgYXJlIGJlaW5nIGRpc3BsYXllZCBvbiBzY3JlZW4uXG4gICAqIENhbiBiZSB1c2VkIGJ5IHRoZSBkYXRhIHNvdXJjZSB0byBhcyBhIGhldXJpc3RpYyBvZiB3aGF0IGRhdGEgc2hvdWxkIGJlIHByb3ZpZGVkLlxuICAgKlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICByZWFkb25seSB2aWV3Q2hhbmdlID0gbmV3IEJlaGF2aW9yU3ViamVjdDx7c3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXJ9Pih7XG4gICAgc3RhcnQ6IDAsXG4gICAgZW5kOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICB9KTtcblxuICAvLyBPdXRsZXRzIGluIHRoZSB0YWJsZSdzIHRlbXBsYXRlIHdoZXJlIHRoZSBoZWFkZXIsIGRhdGEgcm93cywgYW5kIGZvb3RlciB3aWxsIGJlIGluc2VydGVkLlxuICBfcm93T3V0bGV0OiBEYXRhUm93T3V0bGV0O1xuICBfaGVhZGVyUm93T3V0bGV0OiBIZWFkZXJSb3dPdXRsZXQ7XG4gIF9mb290ZXJSb3dPdXRsZXQ6IEZvb3RlclJvd091dGxldDtcbiAgX25vRGF0YVJvd091dGxldDogTm9EYXRhUm93T3V0bGV0O1xuXG4gIC8qKlxuICAgKiBUaGUgY29sdW1uIGRlZmluaXRpb25zIHByb3ZpZGVkIGJ5IHRoZSB1c2VyIHRoYXQgY29udGFpbiB3aGF0IHRoZSBoZWFkZXIsIGRhdGEsIGFuZCBmb290ZXJcbiAgICogY2VsbHMgc2hvdWxkIHJlbmRlciBmb3IgZWFjaCBjb2x1bW4uXG4gICAqL1xuICBAQ29udGVudENoaWxkcmVuKENka0NvbHVtbkRlZiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX2NvbnRlbnRDb2x1bW5EZWZzOiBRdWVyeUxpc3Q8Q2RrQ29sdW1uRGVmPjtcblxuICAvKiogU2V0IG9mIGRhdGEgcm93IGRlZmluaXRpb25zIHRoYXQgd2VyZSBwcm92aWRlZCB0byB0aGUgdGFibGUgYXMgY29udGVudCBjaGlsZHJlbi4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtSb3dEZWYsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9jb250ZW50Um93RGVmczogUXVlcnlMaXN0PENka1Jvd0RlZjxUPj47XG5cbiAgLyoqIFNldCBvZiBoZWFkZXIgcm93IGRlZmluaXRpb25zIHRoYXQgd2VyZSBwcm92aWRlZCB0byB0aGUgdGFibGUgYXMgY29udGVudCBjaGlsZHJlbi4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtIZWFkZXJSb3dEZWYsIHtcbiAgICBkZXNjZW5kYW50czogdHJ1ZSxcbiAgfSlcbiAgX2NvbnRlbnRIZWFkZXJSb3dEZWZzOiBRdWVyeUxpc3Q8Q2RrSGVhZGVyUm93RGVmPjtcblxuICAvKiogU2V0IG9mIGZvb3RlciByb3cgZGVmaW5pdGlvbnMgdGhhdCB3ZXJlIHByb3ZpZGVkIHRvIHRoZSB0YWJsZSBhcyBjb250ZW50IGNoaWxkcmVuLiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka0Zvb3RlclJvd0RlZiwge1xuICAgIGRlc2NlbmRhbnRzOiB0cnVlLFxuICB9KVxuICBfY29udGVudEZvb3RlclJvd0RlZnM6IFF1ZXJ5TGlzdDxDZGtGb290ZXJSb3dEZWY+O1xuXG4gIC8qKiBSb3cgZGVmaW5pdGlvbiB0aGF0IHdpbGwgb25seSBiZSByZW5kZXJlZCBpZiB0aGVyZSdzIG5vIGRhdGEgaW4gdGhlIHRhYmxlLiAqL1xuICBAQ29udGVudENoaWxkKENka05vRGF0YVJvdykgX25vRGF0YVJvdzogQ2RrTm9EYXRhUm93O1xuXG4gIHByaXZhdGUgX2luamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgQEF0dHJpYnV0ZSgncm9sZScpIHJvbGU6IHN0cmluZyxcbiAgICBAT3B0aW9uYWwoKSBwcm90ZWN0ZWQgcmVhZG9ubHkgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksXG4gICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgIEBJbmplY3QoX1ZJRVdfUkVQRUFURVJfU1RSQVRFR1kpXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3UmVwZWF0ZXI6IF9WaWV3UmVwZWF0ZXI8VCwgUmVuZGVyUm93PFQ+LCBSb3dDb250ZXh0PFQ+PixcbiAgICBASW5qZWN0KF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSKVxuICAgIHByb3RlY3RlZCByZWFkb25seSBfY29hbGVzY2VkU3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLFxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIGBfc3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcmAgcGFyYW1ldGVyIHRvIGJlY29tZSByZXF1aXJlZC5cbiAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDEzLjAuMFxuICAgICAqL1xuICAgIEBPcHRpb25hbCgpXG4gICAgQFNraXBTZWxmKClcbiAgICBASW5qZWN0KFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUilcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3N0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXI6IFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgYF91bnVzZWROZ1pvbmVgIHBhcmFtZXRlciB0byBiZSByZW1vdmVkLlxuICAgICAqIEBicmVha2luZy1jaGFuZ2UgMTkuMC4wXG4gICAgICovXG4gICAgQE9wdGlvbmFsKCkgX3VudXNlZE5nWm9uZT86IE5nWm9uZSxcbiAgKSB7XG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICd0YWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xuICAgIHRoaXMuX2lzU2VydmVyID0gIV9wbGF0Zm9ybS5pc0Jyb3dzZXI7XG4gICAgdGhpcy5faXNOYXRpdmVIdG1sVGFibGUgPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm5vZGVOYW1lID09PSAnVEFCTEUnO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2V0dXBTdGlja3lTdHlsZXIoKTtcblxuICAgIC8vIFNldCB1cCB0aGUgdHJhY2tCeSBmdW5jdGlvbiBzbyB0aGF0IGl0IHVzZXMgdGhlIGBSZW5kZXJSb3dgIGFzIGl0cyBpZGVudGl0eSBieSBkZWZhdWx0LiBJZlxuICAgIC8vIHRoZSB1c2VyIGhhcyBwcm92aWRlZCBhIGN1c3RvbSB0cmFja0J5LCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGF0IGZ1bmN0aW9uIGFzIGV2YWx1YXRlZFxuICAgIC8vIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYFJlbmRlclJvd2AncyBkYXRhIGFuZCBpbmRleC5cbiAgICB0aGlzLl9kYXRhRGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKFtdKS5jcmVhdGUoKF9pOiBudW1iZXIsIGRhdGFSb3c6IFJlbmRlclJvdzxUPikgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tCeSA/IHRoaXMudHJhY2tCeShkYXRhUm93LmRhdGFJbmRleCwgZGF0YVJvdy5kYXRhKSA6IGRhdGFSb3c7XG4gICAgfSk7XG5cbiAgICB0aGlzLl92aWV3cG9ydFJ1bGVyXG4gICAgICAuY2hhbmdlKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2ZvcmNlUmVjYWxjdWxhdGVDZWxsV2lkdGhzID0gdHJ1ZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX2hhc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICAvLyBPbmx5IHN0YXJ0IHJlLXJlbmRlcmluZyBpbiBgbmdBZnRlckNvbnRlbnRDaGVja2VkYCBhZnRlciB0aGUgZmlyc3QgcmVuZGVyLlxuICAgIGlmICh0aGlzLl9jYW5SZW5kZXIoKSkge1xuICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgW1xuICAgICAgdGhpcy5fcm93T3V0bGV0Py52aWV3Q29udGFpbmVyLFxuICAgICAgdGhpcy5faGVhZGVyUm93T3V0bGV0Py52aWV3Q29udGFpbmVyLFxuICAgICAgdGhpcy5fZm9vdGVyUm93T3V0bGV0Py52aWV3Q29udGFpbmVyLFxuICAgICAgdGhpcy5fY2FjaGVkUmVuZGVyUm93c01hcCxcbiAgICAgIHRoaXMuX2N1c3RvbUNvbHVtbkRlZnMsXG4gICAgICB0aGlzLl9jdXN0b21Sb3dEZWZzLFxuICAgICAgdGhpcy5fY3VzdG9tSGVhZGVyUm93RGVmcyxcbiAgICAgIHRoaXMuX2N1c3RvbUZvb3RlclJvd0RlZnMsXG4gICAgICB0aGlzLl9jb2x1bW5EZWZzQnlOYW1lLFxuICAgIF0uZm9yRWFjaCgoZGVmOiBWaWV3Q29udGFpbmVyUmVmIHwgU2V0PHVua25vd24+IHwgTWFwPHVua25vd24sIHVua25vd24+IHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgICBkZWY/LmNsZWFyKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9oZWFkZXJSb3dEZWZzID0gW107XG4gICAgdGhpcy5fZm9vdGVyUm93RGVmcyA9IFtdO1xuICAgIHRoaXMuX2RlZmF1bHRSb3dEZWYgPSBudWxsO1xuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XG5cbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuZGF0YVNvdXJjZSkpIHtcbiAgICAgIHRoaXMuZGF0YVNvdXJjZS5kaXNjb25uZWN0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHJvd3MgYmFzZWQgb24gdGhlIHRhYmxlJ3MgbGF0ZXN0IHNldCBvZiBkYXRhLCB3aGljaCB3YXMgZWl0aGVyIHByb3ZpZGVkIGRpcmVjdGx5IGFzIGFuXG4gICAqIGlucHV0IG9yIHJldHJpZXZlZCB0aHJvdWdoIGFuIE9ic2VydmFibGUgc3RyZWFtIChkaXJlY3RseSBvciBmcm9tIGEgRGF0YVNvdXJjZSkuXG4gICAqIENoZWNrcyBmb3IgZGlmZmVyZW5jZXMgaW4gdGhlIGRhdGEgc2luY2UgdGhlIGxhc3QgZGlmZiB0byBwZXJmb3JtIG9ubHkgdGhlIG5lY2Vzc2FyeVxuICAgKiBjaGFuZ2VzIChhZGQvcmVtb3ZlL21vdmUgcm93cykuXG4gICAqXG4gICAqIElmIHRoZSB0YWJsZSdzIGRhdGEgc291cmNlIGlzIGEgRGF0YVNvdXJjZSBvciBPYnNlcnZhYmxlLCB0aGlzIHdpbGwgYmUgaW52b2tlZCBhdXRvbWF0aWNhbGx5XG4gICAqIGVhY2ggdGltZSB0aGUgcHJvdmlkZWQgT2JzZXJ2YWJsZSBzdHJlYW0gZW1pdHMgYSBuZXcgZGF0YSBhcnJheS4gT3RoZXJ3aXNlIGlmIHlvdXIgZGF0YSBpc1xuICAgKiBhbiBhcnJheSwgdGhpcyBmdW5jdGlvbiB3aWxsIG5lZWQgdG8gYmUgY2FsbGVkIHRvIHJlbmRlciBhbnkgY2hhbmdlcy5cbiAgICovXG4gIHJlbmRlclJvd3MoKSB7XG4gICAgdGhpcy5fcmVuZGVyUm93cyA9IHRoaXMuX2dldEFsbFJlbmRlclJvd3MoKTtcbiAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGF0YURpZmZlci5kaWZmKHRoaXMuX3JlbmRlclJvd3MpO1xuICAgIGlmICghY2hhbmdlcykge1xuICAgICAgdGhpcy5fdXBkYXRlTm9EYXRhUm93KCk7XG4gICAgICB0aGlzLmNvbnRlbnRDaGFuZ2VkLm5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgdmlld0NvbnRhaW5lciA9IHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyO1xuXG4gICAgdGhpcy5fdmlld1JlcGVhdGVyLmFwcGx5Q2hhbmdlcyhcbiAgICAgIGNoYW5nZXMsXG4gICAgICB2aWV3Q29udGFpbmVyLFxuICAgICAgKFxuICAgICAgICByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFJlbmRlclJvdzxUPj4sXG4gICAgICAgIF9hZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciB8IG51bGwsXG4gICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICkgPT4gdGhpcy5fZ2V0RW1iZWRkZWRWaWV3QXJncyhyZWNvcmQuaXRlbSwgY3VycmVudEluZGV4ISksXG4gICAgICByZWNvcmQgPT4gcmVjb3JkLml0ZW0uZGF0YSxcbiAgICAgIChjaGFuZ2U6IF9WaWV3UmVwZWF0ZXJJdGVtQ2hhbmdlPFJlbmRlclJvdzxUPiwgUm93Q29udGV4dDxUPj4pID0+IHtcbiAgICAgICAgaWYgKGNoYW5nZS5vcGVyYXRpb24gPT09IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uSU5TRVJURUQgJiYgY2hhbmdlLmNvbnRleHQpIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJDZWxsVGVtcGxhdGVGb3JJdGVtKGNoYW5nZS5yZWNvcmQuaXRlbS5yb3dEZWYsIGNoYW5nZS5jb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBtZXRhIGNvbnRleHQgb2YgYSByb3cncyBjb250ZXh0IGRhdGEgKGluZGV4LCBjb3VudCwgZmlyc3QsIGxhc3QsIC4uLilcbiAgICB0aGlzLl91cGRhdGVSb3dJbmRleENvbnRleHQoKTtcblxuICAgIC8vIFVwZGF0ZSByb3dzIHRoYXQgZGlkIG5vdCBnZXQgYWRkZWQvcmVtb3ZlZC9tb3ZlZCBidXQgbWF5IGhhdmUgaGFkIHRoZWlyIGlkZW50aXR5IGNoYW5nZWQsXG4gICAgLy8gZS5nLiBpZiB0cmFja0J5IG1hdGNoZWQgZGF0YSBvbiBzb21lIHByb3BlcnR5IGJ1dCB0aGUgYWN0dWFsIGRhdGEgcmVmZXJlbmNlIGNoYW5nZWQuXG4gICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8UmVuZGVyUm93PFQ+PikgPT4ge1xuICAgICAgY29uc3Qgcm93VmlldyA9IDxSb3dWaWV3UmVmPFQ+PnZpZXdDb250YWluZXIuZ2V0KHJlY29yZC5jdXJyZW50SW5kZXghKTtcbiAgICAgIHJvd1ZpZXcuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbS5kYXRhO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fdXBkYXRlTm9EYXRhUm93KCk7XG5cbiAgICBhZnRlck5leHRSZW5kZXIoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgICB9LFxuICAgICAge2luamVjdG9yOiB0aGlzLl9pbmplY3Rvcn0sXG4gICAgKTtcblxuICAgIHRoaXMuY29udGVudENoYW5nZWQubmV4dCgpO1xuICB9XG5cbiAgLyoqIEFkZHMgYSBjb2x1bW4gZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cbiAgYWRkQ29sdW1uRGVmKGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmKSB7XG4gICAgdGhpcy5fY3VzdG9tQ29sdW1uRGVmcy5hZGQoY29sdW1uRGVmKTtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGEgY29sdW1uIGRlZmluaXRpb24gdGhhdCB3YXMgbm90IGluY2x1ZGVkIGFzIHBhcnQgb2YgdGhlIGNvbnRlbnQgY2hpbGRyZW4uICovXG4gIHJlbW92ZUNvbHVtbkRlZihjb2x1bW5EZWY6IENka0NvbHVtbkRlZikge1xuICAgIHRoaXMuX2N1c3RvbUNvbHVtbkRlZnMuZGVsZXRlKGNvbHVtbkRlZik7XG4gIH1cblxuICAvKiogQWRkcyBhIHJvdyBkZWZpbml0aW9uIHRoYXQgd2FzIG5vdCBpbmNsdWRlZCBhcyBwYXJ0IG9mIHRoZSBjb250ZW50IGNoaWxkcmVuLiAqL1xuICBhZGRSb3dEZWYocm93RGVmOiBDZGtSb3dEZWY8VD4pIHtcbiAgICB0aGlzLl9jdXN0b21Sb3dEZWZzLmFkZChyb3dEZWYpO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgYSByb3cgZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cbiAgcmVtb3ZlUm93RGVmKHJvd0RlZjogQ2RrUm93RGVmPFQ+KSB7XG4gICAgdGhpcy5fY3VzdG9tUm93RGVmcy5kZWxldGUocm93RGVmKTtcbiAgfVxuXG4gIC8qKiBBZGRzIGEgaGVhZGVyIHJvdyBkZWZpbml0aW9uIHRoYXQgd2FzIG5vdCBpbmNsdWRlZCBhcyBwYXJ0IG9mIHRoZSBjb250ZW50IGNoaWxkcmVuLiAqL1xuICBhZGRIZWFkZXJSb3dEZWYoaGVhZGVyUm93RGVmOiBDZGtIZWFkZXJSb3dEZWYpIHtcbiAgICB0aGlzLl9jdXN0b21IZWFkZXJSb3dEZWZzLmFkZChoZWFkZXJSb3dEZWYpO1xuICAgIHRoaXMuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgYSBoZWFkZXIgcm93IGRlZmluaXRpb24gdGhhdCB3YXMgbm90IGluY2x1ZGVkIGFzIHBhcnQgb2YgdGhlIGNvbnRlbnQgY2hpbGRyZW4uICovXG4gIHJlbW92ZUhlYWRlclJvd0RlZihoZWFkZXJSb3dEZWY6IENka0hlYWRlclJvd0RlZikge1xuICAgIHRoaXMuX2N1c3RvbUhlYWRlclJvd0RlZnMuZGVsZXRlKGhlYWRlclJvd0RlZik7XG4gICAgdGhpcy5faGVhZGVyUm93RGVmQ2hhbmdlZCA9IHRydWU7XG4gIH1cblxuICAvKiogQWRkcyBhIGZvb3RlciByb3cgZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cbiAgYWRkRm9vdGVyUm93RGVmKGZvb3RlclJvd0RlZjogQ2RrRm9vdGVyUm93RGVmKSB7XG4gICAgdGhpcy5fY3VzdG9tRm9vdGVyUm93RGVmcy5hZGQoZm9vdGVyUm93RGVmKTtcbiAgICB0aGlzLl9mb290ZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGEgZm9vdGVyIHJvdyBkZWZpbml0aW9uIHRoYXQgd2FzIG5vdCBpbmNsdWRlZCBhcyBwYXJ0IG9mIHRoZSBjb250ZW50IGNoaWxkcmVuLiAqL1xuICByZW1vdmVGb290ZXJSb3dEZWYoZm9vdGVyUm93RGVmOiBDZGtGb290ZXJSb3dEZWYpIHtcbiAgICB0aGlzLl9jdXN0b21Gb290ZXJSb3dEZWZzLmRlbGV0ZShmb290ZXJSb3dEZWYpO1xuICAgIHRoaXMuX2Zvb3RlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIFNldHMgYSBubyBkYXRhIHJvdyBkZWZpbml0aW9uIHRoYXQgd2FzIG5vdCBpbmNsdWRlZCBhcyBhIHBhcnQgb2YgdGhlIGNvbnRlbnQgY2hpbGRyZW4uICovXG4gIHNldE5vRGF0YVJvdyhub0RhdGFSb3c6IENka05vRGF0YVJvdyB8IG51bGwpIHtcbiAgICB0aGlzLl9jdXN0b21Ob0RhdGFSb3cgPSBub0RhdGFSb3c7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgaGVhZGVyIHN0aWNreSBzdHlsZXMuIEZpcnN0IHJlc2V0cyBhbGwgYXBwbGllZCBzdHlsZXMgd2l0aCByZXNwZWN0IHRvIHRoZSBjZWxsc1xuICAgKiBzdGlja2luZyB0byB0aGUgdG9wLiBUaGVuLCBldmFsdWF0aW5nIHdoaWNoIGNlbGxzIG5lZWQgdG8gYmUgc3R1Y2sgdG8gdGhlIHRvcC4gVGhpcyBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IGNhbGxlZCB3aGVuIHRoZSBoZWFkZXIgcm93IGNoYW5nZXMgaXRzIGRpc3BsYXllZCBzZXQgb2YgY29sdW1ucywgb3IgaWYgaXRzXG4gICAqIHN0aWNreSBpbnB1dCBjaGFuZ2VzLiBNYXkgYmUgY2FsbGVkIG1hbnVhbGx5IGZvciBjYXNlcyB3aGVyZSB0aGUgY2VsbCBjb250ZW50IGNoYW5nZXMgb3V0c2lkZVxuICAgKiBvZiB0aGVzZSBldmVudHMuXG4gICAqL1xuICB1cGRhdGVTdGlja3lIZWFkZXJSb3dTdHlsZXMoKTogdm9pZCB7XG4gICAgY29uc3QgaGVhZGVyUm93cyA9IHRoaXMuX2dldFJlbmRlcmVkUm93cyh0aGlzLl9oZWFkZXJSb3dPdXRsZXQpO1xuXG4gICAgLy8gSGlkZSB0aGUgdGhlYWQgZWxlbWVudCBpZiB0aGVyZSBhcmUgbm8gaGVhZGVyIHJvd3MuIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHNhdGlzZnlcbiAgICAvLyBvdmVyemVhbG91cyBhMTF5IGNoZWNrZXJzIHRoYXQgZmFpbCBiZWNhdXNlIHRoZSBgcm93Z3JvdXBgIGVsZW1lbnQgZG9lcyBub3QgY29udGFpblxuICAgIC8vIHJlcXVpcmVkIGNoaWxkIGByb3dgLlxuICAgIGlmICh0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSkge1xuICAgICAgY29uc3QgdGhlYWQgPSBjbG9zZXN0VGFibGVTZWN0aW9uKHRoaXMuX2hlYWRlclJvd091dGxldCwgJ3RoZWFkJyk7XG4gICAgICBpZiAodGhlYWQpIHtcbiAgICAgICAgdGhlYWQuc3R5bGUuZGlzcGxheSA9IGhlYWRlclJvd3MubGVuZ3RoID8gJycgOiAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RpY2t5U3RhdGVzID0gdGhpcy5faGVhZGVyUm93RGVmcy5tYXAoZGVmID0+IGRlZi5zdGlja3kpO1xuICAgIHRoaXMuX3N0aWNreVN0eWxlci5jbGVhclN0aWNreVBvc2l0aW9uaW5nKGhlYWRlclJvd3MsIFsndG9wJ10pO1xuICAgIHRoaXMuX3N0aWNreVN0eWxlci5zdGlja1Jvd3MoaGVhZGVyUm93cywgc3RpY2t5U3RhdGVzLCAndG9wJyk7XG5cbiAgICAvLyBSZXNldCB0aGUgZGlydHkgc3RhdGUgb2YgdGhlIHN0aWNreSBpbnB1dCBjaGFuZ2Ugc2luY2UgaXQgaGFzIGJlZW4gdXNlZC5cbiAgICB0aGlzLl9oZWFkZXJSb3dEZWZzLmZvckVhY2goZGVmID0+IGRlZi5yZXNldFN0aWNreUNoYW5nZWQoKSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZm9vdGVyIHN0aWNreSBzdHlsZXMuIEZpcnN0IHJlc2V0cyBhbGwgYXBwbGllZCBzdHlsZXMgd2l0aCByZXNwZWN0IHRvIHRoZSBjZWxsc1xuICAgKiBzdGlja2luZyB0byB0aGUgYm90dG9tLiBUaGVuLCBldmFsdWF0aW5nIHdoaWNoIGNlbGxzIG5lZWQgdG8gYmUgc3R1Y2sgdG8gdGhlIGJvdHRvbS4gVGhpcyBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IGNhbGxlZCB3aGVuIHRoZSBmb290ZXIgcm93IGNoYW5nZXMgaXRzIGRpc3BsYXllZCBzZXQgb2YgY29sdW1ucywgb3IgaWYgaXRzXG4gICAqIHN0aWNreSBpbnB1dCBjaGFuZ2VzLiBNYXkgYmUgY2FsbGVkIG1hbnVhbGx5IGZvciBjYXNlcyB3aGVyZSB0aGUgY2VsbCBjb250ZW50IGNoYW5nZXMgb3V0c2lkZVxuICAgKiBvZiB0aGVzZSBldmVudHMuXG4gICAqL1xuICB1cGRhdGVTdGlja3lGb290ZXJSb3dTdHlsZXMoKTogdm9pZCB7XG4gICAgY29uc3QgZm9vdGVyUm93cyA9IHRoaXMuX2dldFJlbmRlcmVkUm93cyh0aGlzLl9mb290ZXJSb3dPdXRsZXQpO1xuXG4gICAgLy8gSGlkZSB0aGUgdGZvb3QgZWxlbWVudCBpZiB0aGVyZSBhcmUgbm8gZm9vdGVyIHJvd3MuIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHNhdGlzZnlcbiAgICAvLyBvdmVyemVhbG91cyBhMTF5IGNoZWNrZXJzIHRoYXQgZmFpbCBiZWNhdXNlIHRoZSBgcm93Z3JvdXBgIGVsZW1lbnQgZG9lcyBub3QgY29udGFpblxuICAgIC8vIHJlcXVpcmVkIGNoaWxkIGByb3dgLlxuICAgIGlmICh0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSkge1xuICAgICAgY29uc3QgdGZvb3QgPSBjbG9zZXN0VGFibGVTZWN0aW9uKHRoaXMuX2Zvb3RlclJvd091dGxldCwgJ3Rmb290Jyk7XG4gICAgICBpZiAodGZvb3QpIHtcbiAgICAgICAgdGZvb3Quc3R5bGUuZGlzcGxheSA9IGZvb3RlclJvd3MubGVuZ3RoID8gJycgOiAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RpY2t5U3RhdGVzID0gdGhpcy5fZm9vdGVyUm93RGVmcy5tYXAoZGVmID0+IGRlZi5zdGlja3kpO1xuICAgIHRoaXMuX3N0aWNreVN0eWxlci5jbGVhclN0aWNreVBvc2l0aW9uaW5nKGZvb3RlclJvd3MsIFsnYm90dG9tJ10pO1xuICAgIHRoaXMuX3N0aWNreVN0eWxlci5zdGlja1Jvd3MoZm9vdGVyUm93cywgc3RpY2t5U3RhdGVzLCAnYm90dG9tJyk7XG4gICAgdGhpcy5fc3RpY2t5U3R5bGVyLnVwZGF0ZVN0aWNreUZvb3RlckNvbnRhaW5lcih0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHN0aWNreVN0YXRlcyk7XG5cbiAgICAvLyBSZXNldCB0aGUgZGlydHkgc3RhdGUgb2YgdGhlIHN0aWNreSBpbnB1dCBjaGFuZ2Ugc2luY2UgaXQgaGFzIGJlZW4gdXNlZC5cbiAgICB0aGlzLl9mb290ZXJSb3dEZWZzLmZvckVhY2goZGVmID0+IGRlZi5yZXNldFN0aWNreUNoYW5nZWQoKSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY29sdW1uIHN0aWNreSBzdHlsZXMuIEZpcnN0IHJlc2V0cyBhbGwgYXBwbGllZCBzdHlsZXMgd2l0aCByZXNwZWN0IHRvIHRoZSBjZWxsc1xuICAgKiBzdGlja2luZyB0byB0aGUgbGVmdCBhbmQgcmlnaHQuIFRoZW4gc3RpY2t5IHN0eWxlcyBhcmUgYWRkZWQgZm9yIHRoZSBsZWZ0IGFuZCByaWdodCBhY2NvcmRpbmdcbiAgICogdG8gdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBmb3IgZWFjaCBjZWxsIGluIGVhY2ggcm93LiBUaGlzIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIHdoZW5cbiAgICogdGhlIGRhdGEgc291cmNlIHByb3ZpZGVzIGEgbmV3IHNldCBvZiBkYXRhIG9yIHdoZW4gYSBjb2x1bW4gZGVmaW5pdGlvbiBjaGFuZ2VzIGl0cyBzdGlja3lcbiAgICogaW5wdXQuIE1heSBiZSBjYWxsZWQgbWFudWFsbHkgZm9yIGNhc2VzIHdoZXJlIHRoZSBjZWxsIGNvbnRlbnQgY2hhbmdlcyBvdXRzaWRlIG9mIHRoZXNlIGV2ZW50cy5cbiAgICovXG4gIHVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpIHtcbiAgICBjb25zdCBoZWFkZXJSb3dzID0gdGhpcy5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMuX2hlYWRlclJvd091dGxldCk7XG4gICAgY29uc3QgZGF0YVJvd3MgPSB0aGlzLl9nZXRSZW5kZXJlZFJvd3ModGhpcy5fcm93T3V0bGV0KTtcbiAgICBjb25zdCBmb290ZXJSb3dzID0gdGhpcy5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMuX2Zvb3RlclJvd091dGxldCk7XG5cbiAgICAvLyBGb3IgdGFibGVzIG5vdCB1c2luZyBhIGZpeGVkIGxheW91dCwgdGhlIGNvbHVtbiB3aWR0aHMgbWF5IGNoYW5nZSB3aGVuIG5ldyByb3dzIGFyZSByZW5kZXJlZC5cbiAgICAvLyBJbiBhIHRhYmxlIHVzaW5nIGEgZml4ZWQgbGF5b3V0LCByb3cgY29udGVudCB3b24ndCBhZmZlY3QgY29sdW1uIHdpZHRoLCBzbyBzdGlja3kgc3R5bGVzXG4gICAgLy8gZG9uJ3QgbmVlZCB0byBiZSBjbGVhcmVkIHVubGVzcyBlaXRoZXIgdGhlIHN0aWNreSBjb2x1bW4gY29uZmlnIGNoYW5nZXMgb3Igb25lIG9mIHRoZSByb3dcbiAgICAvLyBkZWZzIGNoYW5nZS5cbiAgICBpZiAoKHRoaXMuX2lzTmF0aXZlSHRtbFRhYmxlICYmICF0aGlzLl9maXhlZExheW91dCkgfHwgdGhpcy5fc3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0KSB7XG4gICAgICAvLyBDbGVhciB0aGUgbGVmdCBhbmQgcmlnaHQgcG9zaXRpb25pbmcgZnJvbSBhbGwgY29sdW1ucyBpbiB0aGUgdGFibGUgYWNyb3NzIGFsbCByb3dzIHNpbmNlXG4gICAgICAvLyBzdGlja3kgY29sdW1ucyBzcGFuIGFjcm9zcyBhbGwgdGFibGUgc2VjdGlvbnMgKGhlYWRlciwgZGF0YSwgZm9vdGVyKVxuICAgICAgdGhpcy5fc3RpY2t5U3R5bGVyLmNsZWFyU3RpY2t5UG9zaXRpb25pbmcoXG4gICAgICAgIFsuLi5oZWFkZXJSb3dzLCAuLi5kYXRhUm93cywgLi4uZm9vdGVyUm93c10sXG4gICAgICAgIFsnbGVmdCcsICdyaWdodCddLFxuICAgICAgKTtcbiAgICAgIHRoaXMuX3N0aWNreUNvbHVtblN0eWxlc05lZWRSZXNldCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgc3RpY2t5IHN0eWxlcyBmb3IgZWFjaCBoZWFkZXIgcm93IGRlcGVuZGluZyBvbiB0aGUgZGVmJ3Mgc3RpY2t5IHN0YXRlXG4gICAgaGVhZGVyUm93cy5mb3JFYWNoKChoZWFkZXJSb3csIGkpID0+IHtcbiAgICAgIHRoaXMuX2FkZFN0aWNreUNvbHVtblN0eWxlcyhbaGVhZGVyUm93XSwgdGhpcy5faGVhZGVyUm93RGVmc1tpXSk7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHN0aWNreSBzdHlsZXMgZm9yIGVhY2ggZGF0YSByb3cgZGVwZW5kaW5nIG9uIGl0cyBkZWYncyBzdGlja3kgc3RhdGVcbiAgICB0aGlzLl9yb3dEZWZzLmZvckVhY2gocm93RGVmID0+IHtcbiAgICAgIC8vIENvbGxlY3QgYWxsIHRoZSByb3dzIHJlbmRlcmVkIHdpdGggdGhpcyByb3cgZGVmaW5pdGlvbi5cbiAgICAgIGNvbnN0IHJvd3M6IEhUTUxFbGVtZW50W10gPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YVJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlclJvd3NbaV0ucm93RGVmID09PSByb3dEZWYpIHtcbiAgICAgICAgICByb3dzLnB1c2goZGF0YVJvd3NbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FkZFN0aWNreUNvbHVtblN0eWxlcyhyb3dzLCByb3dEZWYpO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzdGlja3kgc3R5bGVzIGZvciBlYWNoIGZvb3RlciByb3cgZGVwZW5kaW5nIG9uIHRoZSBkZWYncyBzdGlja3kgc3RhdGVcbiAgICBmb290ZXJSb3dzLmZvckVhY2goKGZvb3RlclJvdywgaSkgPT4ge1xuICAgICAgdGhpcy5fYWRkU3RpY2t5Q29sdW1uU3R5bGVzKFtmb290ZXJSb3ddLCB0aGlzLl9mb290ZXJSb3dEZWZzW2ldKTtcbiAgICB9KTtcblxuICAgIC8vIFJlc2V0IHRoZSBkaXJ0eSBzdGF0ZSBvZiB0aGUgc3RpY2t5IGlucHV0IGNoYW5nZSBzaW5jZSBpdCBoYXMgYmVlbiB1c2VkLlxuICAgIEFycmF5LmZyb20odGhpcy5fY29sdW1uRGVmc0J5TmFtZS52YWx1ZXMoKSkuZm9yRWFjaChkZWYgPT4gZGVmLnJlc2V0U3RpY2t5Q2hhbmdlZCgpKTtcbiAgfVxuXG4gIC8qKiBJbnZva2VkIHdoZW5ldmVyIGFuIG91dGxldCBpcyBjcmVhdGVkIGFuZCBoYXMgYmVlbiBhc3NpZ25lZCB0byB0aGUgdGFibGUuICovXG4gIF9vdXRsZXRBc3NpZ25lZCgpOiB2b2lkIHtcbiAgICAvLyBUcmlnZ2VyIHRoZSBmaXJzdCByZW5kZXIgb25jZSBhbGwgb3V0bGV0cyBoYXZlIGJlZW4gYXNzaWduZWQuIFdlIGRvIGl0IHRoaXMgd2F5LCBhc1xuICAgIC8vIG9wcG9zZWQgdG8gd2FpdGluZyBmb3IgdGhlIG5leHQgYG5nQWZ0ZXJDb250ZW50Q2hlY2tlZGAsIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyB3aGVuXG4gICAgLy8gdGhlIG5leHQgY2hhbmdlIGRldGVjdGlvbiB3aWxsIGhhcHBlbi5cbiAgICAvLyBBbHNvIHdlIGNhbid0IHVzZSBxdWVyaWVzIHRvIHJlc29sdmUgdGhlIG91dGxldHMsIGJlY2F1c2UgdGhleSdyZSB3cmFwcGVkIGluIGFcbiAgICAvLyBjb25kaXRpb25hbCwgc28gd2UgaGF2ZSB0byByZWx5IG9uIHRoZW0gYmVpbmcgYXNzaWduZWQgdmlhIERJLlxuICAgIGlmIChcbiAgICAgICF0aGlzLl9oYXNBbGxPdXRsZXRzICYmXG4gICAgICB0aGlzLl9yb3dPdXRsZXQgJiZcbiAgICAgIHRoaXMuX2hlYWRlclJvd091dGxldCAmJlxuICAgICAgdGhpcy5fZm9vdGVyUm93T3V0bGV0ICYmXG4gICAgICB0aGlzLl9ub0RhdGFSb3dPdXRsZXRcbiAgICApIHtcbiAgICAgIHRoaXMuX2hhc0FsbE91dGxldHMgPSB0cnVlO1xuXG4gICAgICAvLyBJbiBzb21lIHNldHVwcyB0aGlzIG1heSBmaXJlIGJlZm9yZSBgbmdBZnRlckNvbnRlbnRJbml0YFxuICAgICAgLy8gc28gd2UgbmVlZCBhIGNoZWNrIGhlcmUuIFNlZSAjMjg1MzguXG4gICAgICBpZiAodGhpcy5fY2FuUmVuZGVyKCkpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYmxlIGhhcyBhbGwgdGhlIGluZm9ybWF0aW9uIHRvIHN0YXJ0IHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSBfY2FuUmVuZGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNBbGxPdXRsZXRzICYmIHRoaXMuX2hhc0luaXRpYWxpemVkO1xuICB9XG5cbiAgLyoqIFJlbmRlcnMgdGhlIHRhYmxlIGlmIGl0cyBzdGF0ZSBoYXMgY2hhbmdlZC4gKi9cbiAgcHJpdmF0ZSBfcmVuZGVyKCk6IHZvaWQge1xuICAgIC8vIENhY2hlIHRoZSByb3cgYW5kIGNvbHVtbiBkZWZpbml0aW9ucyBnYXRoZXJlZCBieSBDb250ZW50Q2hpbGRyZW4gYW5kIHByb2dyYW1tYXRpYyBpbmplY3Rpb24uXG4gICAgdGhpcy5fY2FjaGVSb3dEZWZzKCk7XG4gICAgdGhpcy5fY2FjaGVDb2x1bW5EZWZzKCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgdXNlciBoYXMgYXQgbGVhc3QgYWRkZWQgaGVhZGVyLCBmb290ZXIsIG9yIGRhdGEgcm93IGRlZi5cbiAgICBpZiAoXG4gICAgICAhdGhpcy5faGVhZGVyUm93RGVmcy5sZW5ndGggJiZcbiAgICAgICF0aGlzLl9mb290ZXJSb3dEZWZzLmxlbmd0aCAmJlxuICAgICAgIXRoaXMuX3Jvd0RlZnMubGVuZ3RoICYmXG4gICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKVxuICAgICkge1xuICAgICAgdGhyb3cgZ2V0VGFibGVNaXNzaW5nUm93RGVmc0Vycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gUmVuZGVyIHVwZGF0ZXMgaWYgdGhlIGxpc3Qgb2YgY29sdW1ucyBoYXZlIGJlZW4gY2hhbmdlZCBmb3IgdGhlIGhlYWRlciwgcm93LCBvciBmb290ZXIgZGVmcy5cbiAgICBjb25zdCBjb2x1bW5zQ2hhbmdlZCA9IHRoaXMuX3JlbmRlclVwZGF0ZWRDb2x1bW5zKCk7XG4gICAgY29uc3Qgcm93RGVmc0NoYW5nZWQgPSBjb2x1bW5zQ2hhbmdlZCB8fCB0aGlzLl9oZWFkZXJSb3dEZWZDaGFuZ2VkIHx8IHRoaXMuX2Zvb3RlclJvd0RlZkNoYW5nZWQ7XG4gICAgLy8gRW5zdXJlIHN0aWNreSBjb2x1bW4gc3R5bGVzIGFyZSByZXNldCBpZiBzZXQgdG8gYHRydWVgIGVsc2V3aGVyZS5cbiAgICB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgPSB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgfHwgcm93RGVmc0NoYW5nZWQ7XG4gICAgdGhpcy5fZm9yY2VSZWNhbGN1bGF0ZUNlbGxXaWR0aHMgPSByb3dEZWZzQ2hhbmdlZDtcblxuICAgIC8vIElmIHRoZSBoZWFkZXIgcm93IGRlZmluaXRpb24gaGFzIGJlZW4gY2hhbmdlZCwgdHJpZ2dlciBhIHJlbmRlciB0byB0aGUgaGVhZGVyIHJvdy5cbiAgICBpZiAodGhpcy5faGVhZGVyUm93RGVmQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fZm9yY2VSZW5kZXJIZWFkZXJSb3dzKCk7XG4gICAgICB0aGlzLl9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGZvb3RlciByb3cgZGVmaW5pdGlvbiBoYXMgYmVlbiBjaGFuZ2VkLCB0cmlnZ2VyIGEgcmVuZGVyIHRvIHRoZSBmb290ZXIgcm93LlxuICAgIGlmICh0aGlzLl9mb290ZXJSb3dEZWZDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9mb3JjZVJlbmRlckZvb3RlclJvd3MoKTtcbiAgICAgIHRoaXMuX2Zvb3RlclJvd0RlZkNoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIGRhdGEgc291cmNlIGFuZCByb3cgZGVmaW5pdGlvbnMsIGNvbm5lY3QgdG8gdGhlIGRhdGEgc291cmNlIHVubGVzcyBhXG4gICAgLy8gY29ubmVjdGlvbiBoYXMgYWxyZWFkeSBiZWVuIG1hZGUuXG4gICAgaWYgKHRoaXMuZGF0YVNvdXJjZSAmJiB0aGlzLl9yb3dEZWZzLmxlbmd0aCA+IDAgJiYgIXRoaXMuX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fb2JzZXJ2ZVJlbmRlckNoYW5nZXMoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3N0aWNreUNvbHVtblN0eWxlc05lZWRSZXNldCkge1xuICAgICAgLy8gSW4gdGhlIGFib3ZlIGNhc2UsIF9vYnNlcnZlUmVuZGVyQ2hhbmdlcyB3aWxsIHJlc3VsdCBpbiB1cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMgYmVpbmdcbiAgICAgIC8vIGNhbGxlZCB3aGVuIGl0IHJvdyBkYXRhIGFycml2ZXMuIE90aGVyd2lzZSwgd2UgbmVlZCB0byBjYWxsIGl0IHByb2FjdGl2ZWx5LlxuICAgICAgdGhpcy51cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja1N0aWNreVN0YXRlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGlzdCBvZiBSZW5kZXJSb3cgb2JqZWN0cyB0byByZW5kZXIgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGxpc3Qgb2YgZGF0YSBhbmQgZGVmaW5lZFxuICAgKiByb3cgZGVmaW5pdGlvbnMuIElmIHRoZSBwcmV2aW91cyBsaXN0IGFscmVhZHkgY29udGFpbmVkIGEgcGFydGljdWxhciBwYWlyLCBpdCBzaG91bGQgYmUgcmV1c2VkXG4gICAqIHNvIHRoYXQgdGhlIGRpZmZlciBlcXVhdGVzIHRoZWlyIHJlZmVyZW5jZXMuXG4gICAqL1xuICBwcml2YXRlIF9nZXRBbGxSZW5kZXJSb3dzKCk6IFJlbmRlclJvdzxUPltdIHtcbiAgICBjb25zdCByZW5kZXJSb3dzOiBSZW5kZXJSb3c8VD5bXSA9IFtdO1xuXG4gICAgLy8gU3RvcmUgdGhlIGNhY2hlIGFuZCBjcmVhdGUgYSBuZXcgb25lLiBBbnkgcmUtdXNlZCBSZW5kZXJSb3cgb2JqZWN0cyB3aWxsIGJlIG1vdmVkIGludG8gdGhlXG4gICAgLy8gbmV3IGNhY2hlIHdoaWxlIHVudXNlZCBvbmVzIGNhbiBiZSBwaWNrZWQgdXAgYnkgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIGNvbnN0IHByZXZDYWNoZWRSZW5kZXJSb3dzID0gdGhpcy5fY2FjaGVkUmVuZGVyUm93c01hcDtcbiAgICB0aGlzLl9jYWNoZWRSZW5kZXJSb3dzTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gRm9yIGVhY2ggZGF0YSBvYmplY3QsIGdldCB0aGUgbGlzdCBvZiByb3dzIHRoYXQgc2hvdWxkIGJlIHJlbmRlcmVkLCByZXByZXNlbnRlZCBieSB0aGVcbiAgICAvLyByZXNwZWN0aXZlIGBSZW5kZXJSb3dgIG9iamVjdCB3aGljaCBpcyB0aGUgcGFpciBvZiBgZGF0YWAgYW5kIGBDZGtSb3dEZWZgLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGRhdGEgPSB0aGlzLl9kYXRhW2ldO1xuICAgICAgY29uc3QgcmVuZGVyUm93c0ZvckRhdGEgPSB0aGlzLl9nZXRSZW5kZXJSb3dzRm9yRGF0YShkYXRhLCBpLCBwcmV2Q2FjaGVkUmVuZGVyUm93cy5nZXQoZGF0YSkpO1xuXG4gICAgICBpZiAoIXRoaXMuX2NhY2hlZFJlbmRlclJvd3NNYXAuaGFzKGRhdGEpKSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZFJlbmRlclJvd3NNYXAuc2V0KGRhdGEsIG5ldyBXZWFrTWFwKCkpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlbmRlclJvd3NGb3JEYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCByZW5kZXJSb3cgPSByZW5kZXJSb3dzRm9yRGF0YVtqXTtcblxuICAgICAgICBjb25zdCBjYWNoZSA9IHRoaXMuX2NhY2hlZFJlbmRlclJvd3NNYXAuZ2V0KHJlbmRlclJvdy5kYXRhKSE7XG4gICAgICAgIGlmIChjYWNoZS5oYXMocmVuZGVyUm93LnJvd0RlZikpIHtcbiAgICAgICAgICBjYWNoZS5nZXQocmVuZGVyUm93LnJvd0RlZikhLnB1c2gocmVuZGVyUm93KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWNoZS5zZXQocmVuZGVyUm93LnJvd0RlZiwgW3JlbmRlclJvd10pO1xuICAgICAgICB9XG4gICAgICAgIHJlbmRlclJvd3MucHVzaChyZW5kZXJSb3cpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZW5kZXJSb3dzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGBSZW5kZXJSb3c8VD5gIGZvciB0aGUgcHJvdmlkZWQgZGF0YSBvYmplY3QgYW5kIGFueSBgQ2RrUm93RGVmYCBvYmplY3RzIHRoYXRcbiAgICogc2hvdWxkIGJlIHJlbmRlcmVkIGZvciB0aGlzIGRhdGEuIFJldXNlcyB0aGUgY2FjaGVkIFJlbmRlclJvdyBvYmplY3RzIGlmIHRoZXkgbWF0Y2ggdGhlIHNhbWVcbiAgICogYChULCBDZGtSb3dEZWYpYCBwYWlyLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UmVuZGVyUm93c0ZvckRhdGEoXG4gICAgZGF0YTogVCxcbiAgICBkYXRhSW5kZXg6IG51bWJlcixcbiAgICBjYWNoZT86IFdlYWtNYXA8Q2RrUm93RGVmPFQ+LCBSZW5kZXJSb3c8VD5bXT4sXG4gICk6IFJlbmRlclJvdzxUPltdIHtcbiAgICBjb25zdCByb3dEZWZzID0gdGhpcy5fZ2V0Um93RGVmcyhkYXRhLCBkYXRhSW5kZXgpO1xuXG4gICAgcmV0dXJuIHJvd0RlZnMubWFwKHJvd0RlZiA9PiB7XG4gICAgICBjb25zdCBjYWNoZWRSZW5kZXJSb3dzID0gY2FjaGUgJiYgY2FjaGUuaGFzKHJvd0RlZikgPyBjYWNoZS5nZXQocm93RGVmKSEgOiBbXTtcbiAgICAgIGlmIChjYWNoZWRSZW5kZXJSb3dzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBkYXRhUm93ID0gY2FjaGVkUmVuZGVyUm93cy5zaGlmdCgpITtcbiAgICAgICAgZGF0YVJvdy5kYXRhSW5kZXggPSBkYXRhSW5kZXg7XG4gICAgICAgIHJldHVybiBkYXRhUm93O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtkYXRhLCByb3dEZWYsIGRhdGFJbmRleH07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBtYXAgY29udGFpbmluZyB0aGUgY29udGVudCdzIGNvbHVtbiBkZWZpbml0aW9ucy4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVDb2x1bW5EZWZzKCkge1xuICAgIHRoaXMuX2NvbHVtbkRlZnNCeU5hbWUuY2xlYXIoKTtcblxuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSBtZXJnZUFycmF5QW5kU2V0KFxuICAgICAgdGhpcy5fZ2V0T3duRGVmcyh0aGlzLl9jb250ZW50Q29sdW1uRGVmcyksXG4gICAgICB0aGlzLl9jdXN0b21Db2x1bW5EZWZzLFxuICAgICk7XG4gICAgY29sdW1uRGVmcy5mb3JFYWNoKGNvbHVtbkRlZiA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2NvbHVtbkRlZnNCeU5hbWUuaGFzKGNvbHVtbkRlZi5uYW1lKSAmJlxuICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IGdldFRhYmxlRHVwbGljYXRlQ29sdW1uTmFtZUVycm9yKGNvbHVtbkRlZi5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbHVtbkRlZnNCeU5hbWUuc2V0KGNvbHVtbkRlZi5uYW1lLCBjb2x1bW5EZWYpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgbGlzdCBvZiBhbGwgYXZhaWxhYmxlIHJvdyBkZWZpbml0aW9ucyB0aGF0IGNhbiBiZSB1c2VkLiAqL1xuICBwcml2YXRlIF9jYWNoZVJvd0RlZnMoKSB7XG4gICAgdGhpcy5faGVhZGVyUm93RGVmcyA9IG1lcmdlQXJyYXlBbmRTZXQoXG4gICAgICB0aGlzLl9nZXRPd25EZWZzKHRoaXMuX2NvbnRlbnRIZWFkZXJSb3dEZWZzKSxcbiAgICAgIHRoaXMuX2N1c3RvbUhlYWRlclJvd0RlZnMsXG4gICAgKTtcbiAgICB0aGlzLl9mb290ZXJSb3dEZWZzID0gbWVyZ2VBcnJheUFuZFNldChcbiAgICAgIHRoaXMuX2dldE93bkRlZnModGhpcy5fY29udGVudEZvb3RlclJvd0RlZnMpLFxuICAgICAgdGhpcy5fY3VzdG9tRm9vdGVyUm93RGVmcyxcbiAgICApO1xuICAgIHRoaXMuX3Jvd0RlZnMgPSBtZXJnZUFycmF5QW5kU2V0KHRoaXMuX2dldE93bkRlZnModGhpcy5fY29udGVudFJvd0RlZnMpLCB0aGlzLl9jdXN0b21Sb3dEZWZzKTtcblxuICAgIC8vIEFmdGVyIGFsbCByb3cgZGVmaW5pdGlvbnMgYXJlIGRldGVybWluZWQsIGZpbmQgdGhlIHJvdyBkZWZpbml0aW9uIHRvIGJlIGNvbnNpZGVyZWQgZGVmYXVsdC5cbiAgICBjb25zdCBkZWZhdWx0Um93RGVmcyA9IHRoaXMuX3Jvd0RlZnMuZmlsdGVyKGRlZiA9PiAhZGVmLndoZW4pO1xuICAgIGlmIChcbiAgICAgICF0aGlzLm11bHRpVGVtcGxhdGVEYXRhUm93cyAmJlxuICAgICAgZGVmYXVsdFJvd0RlZnMubGVuZ3RoID4gMSAmJlxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSlcbiAgICApIHtcbiAgICAgIHRocm93IGdldFRhYmxlTXVsdGlwbGVEZWZhdWx0Um93RGVmc0Vycm9yKCk7XG4gICAgfVxuICAgIHRoaXMuX2RlZmF1bHRSb3dEZWYgPSBkZWZhdWx0Um93RGVmc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgaGVhZGVyLCBkYXRhLCBvciBmb290ZXIgcm93cyBoYXZlIGNoYW5nZWQgd2hhdCBjb2x1bW5zIHRoZXkgd2FudCB0byBkaXNwbGF5IG9yXG4gICAqIHdoZXRoZXIgdGhlIHN0aWNreSBzdGF0ZXMgaGF2ZSBjaGFuZ2VkIGZvciB0aGUgaGVhZGVyIG9yIGZvb3Rlci4gSWYgdGhlcmUgaXMgYSBkaWZmLCB0aGVuXG4gICAqIHJlLXJlbmRlciB0aGF0IHNlY3Rpb24uXG4gICAqL1xuICBwcml2YXRlIF9yZW5kZXJVcGRhdGVkQ29sdW1ucygpOiBib29sZWFuIHtcbiAgICBjb25zdCBjb2x1bW5zRGlmZlJlZHVjZXIgPSAoYWNjOiBib29sZWFuLCBkZWY6IEJhc2VSb3dEZWYpID0+IHtcbiAgICAgIC8vIFRoZSBkaWZmZXIgc2hvdWxkIGJlIHJ1biBmb3IgZXZlcnkgY29sdW1uLCBldmVuIGlmIGBhY2NgIGlzIGFscmVhZHlcbiAgICAgIC8vIHRydWUgKHNlZSAjMjk5MjIpXG4gICAgICBjb25zdCBkaWZmID0gISFkZWYuZ2V0Q29sdW1uc0RpZmYoKTtcbiAgICAgIHJldHVybiBhY2MgfHwgZGlmZjtcbiAgICB9O1xuXG4gICAgLy8gRm9yY2UgcmUtcmVuZGVyIGRhdGEgcm93cyBpZiB0aGUgbGlzdCBvZiBjb2x1bW4gZGVmaW5pdGlvbnMgaGF2ZSBjaGFuZ2VkLlxuICAgIGNvbnN0IGRhdGFDb2x1bW5zQ2hhbmdlZCA9IHRoaXMuX3Jvd0RlZnMucmVkdWNlKGNvbHVtbnNEaWZmUmVkdWNlciwgZmFsc2UpO1xuICAgIGlmIChkYXRhQ29sdW1uc0NoYW5nZWQpIHtcbiAgICAgIHRoaXMuX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKTtcbiAgICB9XG5cbiAgICAvLyBGb3JjZSByZS1yZW5kZXIgaGVhZGVyL2Zvb3RlciByb3dzIGlmIHRoZSBsaXN0IG9mIGNvbHVtbiBkZWZpbml0aW9ucyBoYXZlIGNoYW5nZWQuXG4gICAgY29uc3QgaGVhZGVyQ29sdW1uc0NoYW5nZWQgPSB0aGlzLl9oZWFkZXJSb3dEZWZzLnJlZHVjZShjb2x1bW5zRGlmZlJlZHVjZXIsIGZhbHNlKTtcbiAgICBpZiAoaGVhZGVyQ29sdW1uc0NoYW5nZWQpIHtcbiAgICAgIHRoaXMuX2ZvcmNlUmVuZGVySGVhZGVyUm93cygpO1xuICAgIH1cblxuICAgIGNvbnN0IGZvb3RlckNvbHVtbnNDaGFuZ2VkID0gdGhpcy5fZm9vdGVyUm93RGVmcy5yZWR1Y2UoY29sdW1uc0RpZmZSZWR1Y2VyLCBmYWxzZSk7XG4gICAgaWYgKGZvb3RlckNvbHVtbnNDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9mb3JjZVJlbmRlckZvb3RlclJvd3MoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YUNvbHVtbnNDaGFuZ2VkIHx8IGhlYWRlckNvbHVtbnNDaGFuZ2VkIHx8IGZvb3RlckNvbHVtbnNDaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIFN3aXRjaCB0byB0aGUgcHJvdmlkZWQgZGF0YSBzb3VyY2UgYnkgcmVzZXR0aW5nIHRoZSBkYXRhIGFuZCB1bnN1YnNjcmliaW5nIGZyb20gdGhlIGN1cnJlbnRcbiAgICogcmVuZGVyIGNoYW5nZSBzdWJzY3JpcHRpb24gaWYgb25lIGV4aXN0cy4gSWYgdGhlIGRhdGEgc291cmNlIGlzIG51bGwsIGludGVycHJldCB0aGlzIGJ5XG4gICAqIGNsZWFyaW5nIHRoZSByb3cgb3V0bGV0LiBPdGhlcndpc2Ugc3RhcnQgbGlzdGVuaW5nIGZvciBuZXcgZGF0YS5cbiAgICovXG4gIHByaXZhdGUgX3N3aXRjaERhdGFTb3VyY2UoZGF0YVNvdXJjZTogQ2RrVGFibGVEYXRhU291cmNlSW5wdXQ8VD4pIHtcbiAgICB0aGlzLl9kYXRhID0gW107XG5cbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuZGF0YVNvdXJjZSkpIHtcbiAgICAgIHRoaXMuZGF0YVNvdXJjZS5kaXNjb25uZWN0KHRoaXMpO1xuICAgIH1cblxuICAgIC8vIFN0b3AgbGlzdGVuaW5nIGZvciBkYXRhIGZyb20gdGhlIHByZXZpb3VzIGRhdGEgc291cmNlLlxuICAgIGlmICh0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5fcmVuZGVyQ2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgIGlmICh0aGlzLl9kYXRhRGlmZmVyKSB7XG4gICAgICAgIHRoaXMuX2RhdGFEaWZmZXIuZGlmZihbXSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fcm93T3V0bGV0KSB7XG4gICAgICAgIHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gIH1cblxuICAvKiogU2V0IHVwIGEgc3Vic2NyaXB0aW9uIGZvciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX29ic2VydmVSZW5kZXJDaGFuZ2VzKCkge1xuICAgIC8vIElmIG5vIGRhdGEgc291cmNlIGhhcyBiZWVuIHNldCwgdGhlcmUgaXMgbm90aGluZyB0byBvYnNlcnZlIGZvciBjaGFuZ2VzLlxuICAgIGlmICghdGhpcy5kYXRhU291cmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGRhdGFTdHJlYW06IE9ic2VydmFibGU8cmVhZG9ubHkgVFtdPiB8IHVuZGVmaW5lZDtcblxuICAgIGlmIChpc0RhdGFTb3VyY2UodGhpcy5kYXRhU291cmNlKSkge1xuICAgICAgZGF0YVN0cmVhbSA9IHRoaXMuZGF0YVNvdXJjZS5jb25uZWN0KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHRoaXMuZGF0YVNvdXJjZSkpIHtcbiAgICAgIGRhdGFTdHJlYW0gPSB0aGlzLmRhdGFTb3VyY2U7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMuZGF0YVNvdXJjZSkpIHtcbiAgICAgIGRhdGFTdHJlYW0gPSBvYnNlcnZhYmxlT2YodGhpcy5kYXRhU291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YVN0cmVhbSA9PT0gdW5kZWZpbmVkICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBnZXRUYWJsZVVua25vd25EYXRhU291cmNlRXJyb3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24gPSBkYXRhU3RyZWFtIVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXG4gICAgICAuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICB0aGlzLl9kYXRhID0gZGF0YSB8fCBbXTtcbiAgICAgICAgdGhpcy5yZW5kZXJSb3dzKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYW55IGV4aXN0aW5nIGNvbnRlbnQgaW4gdGhlIGhlYWRlciByb3cgb3V0bGV0IGFuZCBjcmVhdGVzIGEgbmV3IGVtYmVkZGVkIHZpZXdcbiAgICogaW4gdGhlIG91dGxldCB1c2luZyB0aGUgaGVhZGVyIHJvdyBkZWZpbml0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9yY2VSZW5kZXJIZWFkZXJSb3dzKCkge1xuICAgIC8vIENsZWFyIHRoZSBoZWFkZXIgcm93IG91dGxldCBpZiBhbnkgY29udGVudCBleGlzdHMuXG4gICAgaWYgKHRoaXMuX2hlYWRlclJvd091dGxldC52aWV3Q29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2hlYWRlclJvd091dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5faGVhZGVyUm93RGVmcy5mb3JFYWNoKChkZWYsIGkpID0+IHRoaXMuX3JlbmRlclJvdyh0aGlzLl9oZWFkZXJSb3dPdXRsZXQsIGRlZiwgaSkpO1xuICAgIHRoaXMudXBkYXRlU3RpY2t5SGVhZGVyUm93U3R5bGVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFueSBleGlzdGluZyBjb250ZW50IGluIHRoZSBmb290ZXIgcm93IG91dGxldCBhbmQgY3JlYXRlcyBhIG5ldyBlbWJlZGRlZCB2aWV3XG4gICAqIGluIHRoZSBvdXRsZXQgdXNpbmcgdGhlIGZvb3RlciByb3cgZGVmaW5pdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2ZvcmNlUmVuZGVyRm9vdGVyUm93cygpIHtcbiAgICAvLyBDbGVhciB0aGUgZm9vdGVyIHJvdyBvdXRsZXQgaWYgYW55IGNvbnRlbnQgZXhpc3RzLlxuICAgIGlmICh0aGlzLl9mb290ZXJSb3dPdXRsZXQudmlld0NvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9mb290ZXJSb3dPdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgIH1cblxuICAgIHRoaXMuX2Zvb3RlclJvd0RlZnMuZm9yRWFjaCgoZGVmLCBpKSA9PiB0aGlzLl9yZW5kZXJSb3codGhpcy5fZm9vdGVyUm93T3V0bGV0LCBkZWYsIGkpKTtcbiAgICB0aGlzLnVwZGF0ZVN0aWNreUZvb3RlclJvd1N0eWxlcygpO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHN0aWNreSBjb2x1bW4gc3R5bGVzIGZvciB0aGUgcm93cyBhY2NvcmRpbmcgdG8gdGhlIGNvbHVtbnMnIHN0aWNrIHN0YXRlcy4gKi9cbiAgcHJpdmF0ZSBfYWRkU3RpY2t5Q29sdW1uU3R5bGVzKHJvd3M6IEhUTUxFbGVtZW50W10sIHJvd0RlZjogQmFzZVJvd0RlZikge1xuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSBBcnJheS5mcm9tKHJvd0RlZi5jb2x1bW5zIHx8IFtdKS5tYXAoY29sdW1uTmFtZSA9PiB7XG4gICAgICBjb25zdCBjb2x1bW5EZWYgPSB0aGlzLl9jb2x1bW5EZWZzQnlOYW1lLmdldChjb2x1bW5OYW1lKTtcbiAgICAgIGlmICghY29sdW1uRGVmICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICAgIHRocm93IGdldFRhYmxlVW5rbm93bkNvbHVtbkVycm9yKGNvbHVtbk5hbWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbHVtbkRlZiE7XG4gICAgfSk7XG4gICAgY29uc3Qgc3RpY2t5U3RhcnRTdGF0ZXMgPSBjb2x1bW5EZWZzLm1hcChjb2x1bW5EZWYgPT4gY29sdW1uRGVmLnN0aWNreSk7XG4gICAgY29uc3Qgc3RpY2t5RW5kU3RhdGVzID0gY29sdW1uRGVmcy5tYXAoY29sdW1uRGVmID0+IGNvbHVtbkRlZi5zdGlja3lFbmQpO1xuICAgIHRoaXMuX3N0aWNreVN0eWxlci51cGRhdGVTdGlja3lDb2x1bW5zKFxuICAgICAgcm93cyxcbiAgICAgIHN0aWNreVN0YXJ0U3RhdGVzLFxuICAgICAgc3RpY2t5RW5kU3RhdGVzLFxuICAgICAgIXRoaXMuX2ZpeGVkTGF5b3V0IHx8IHRoaXMuX2ZvcmNlUmVjYWxjdWxhdGVDZWxsV2lkdGhzLFxuICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbGlzdCBvZiByb3dzIHRoYXQgaGF2ZSBiZWVuIHJlbmRlcmVkIGluIHRoZSByb3cgb3V0bGV0LiAqL1xuICBfZ2V0UmVuZGVyZWRSb3dzKHJvd091dGxldDogUm93T3V0bGV0KTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgcmVuZGVyZWRSb3dzOiBIVE1MRWxlbWVudFtdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd091dGxldC52aWV3Q29udGFpbmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB2aWV3UmVmID0gcm93T3V0bGV0LnZpZXdDb250YWluZXIuZ2V0KGkpISBhcyBFbWJlZGRlZFZpZXdSZWY8YW55PjtcbiAgICAgIHJlbmRlcmVkUm93cy5wdXNoKHZpZXdSZWYucm9vdE5vZGVzWzBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVuZGVyZWRSb3dzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbWF0Y2hpbmcgcm93IGRlZmluaXRpb25zIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIHRoaXMgcm93IGRhdGEuIElmIHRoZXJlIGlzIG9ubHlcbiAgICogb25lIHJvdyBkZWZpbml0aW9uLCBpdCBpcyByZXR1cm5lZC4gT3RoZXJ3aXNlLCBmaW5kIHRoZSByb3cgZGVmaW5pdGlvbnMgdGhhdCBoYXMgYSB3aGVuXG4gICAqIHByZWRpY2F0ZSB0aGF0IHJldHVybnMgdHJ1ZSB3aXRoIHRoZSBkYXRhLiBJZiBub25lIHJldHVybiB0cnVlLCByZXR1cm4gdGhlIGRlZmF1bHQgcm93XG4gICAqIGRlZmluaXRpb24uXG4gICAqL1xuICBfZ2V0Um93RGVmcyhkYXRhOiBULCBkYXRhSW5kZXg6IG51bWJlcik6IENka1Jvd0RlZjxUPltdIHtcbiAgICBpZiAodGhpcy5fcm93RGVmcy5sZW5ndGggPT0gMSkge1xuICAgICAgcmV0dXJuIFt0aGlzLl9yb3dEZWZzWzBdXTtcbiAgICB9XG5cbiAgICBsZXQgcm93RGVmczogQ2RrUm93RGVmPFQ+W10gPSBbXTtcbiAgICBpZiAodGhpcy5tdWx0aVRlbXBsYXRlRGF0YVJvd3MpIHtcbiAgICAgIHJvd0RlZnMgPSB0aGlzLl9yb3dEZWZzLmZpbHRlcihkZWYgPT4gIWRlZi53aGVuIHx8IGRlZi53aGVuKGRhdGFJbmRleCwgZGF0YSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcm93RGVmID1cbiAgICAgICAgdGhpcy5fcm93RGVmcy5maW5kKGRlZiA9PiBkZWYud2hlbiAmJiBkZWYud2hlbihkYXRhSW5kZXgsIGRhdGEpKSB8fCB0aGlzLl9kZWZhdWx0Um93RGVmO1xuICAgICAgaWYgKHJvd0RlZikge1xuICAgICAgICByb3dEZWZzLnB1c2gocm93RGVmKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXJvd0RlZnMubGVuZ3RoICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBnZXRUYWJsZU1pc3NpbmdNYXRjaGluZ1Jvd0RlZkVycm9yKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dEZWZzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RW1iZWRkZWRWaWV3QXJncyhcbiAgICByZW5kZXJSb3c6IFJlbmRlclJvdzxUPixcbiAgICBpbmRleDogbnVtYmVyLFxuICApOiBfVmlld1JlcGVhdGVySXRlbUluc2VydEFyZ3M8Um93Q29udGV4dDxUPj4ge1xuICAgIGNvbnN0IHJvd0RlZiA9IHJlbmRlclJvdy5yb3dEZWY7XG4gICAgY29uc3QgY29udGV4dDogUm93Q29udGV4dDxUPiA9IHskaW1wbGljaXQ6IHJlbmRlclJvdy5kYXRhfTtcbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGVSZWY6IHJvd0RlZi50ZW1wbGF0ZSxcbiAgICAgIGNvbnRleHQsXG4gICAgICBpbmRleCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgcm93IHRlbXBsYXRlIGluIHRoZSBvdXRsZXQgYW5kIGZpbGxzIGl0IHdpdGggdGhlIHNldCBvZiBjZWxsIHRlbXBsYXRlcy5cbiAgICogT3B0aW9uYWxseSB0YWtlcyBhIGNvbnRleHQgdG8gcHJvdmlkZSB0byB0aGUgcm93IGFuZCBjZWxscywgYXMgd2VsbCBhcyBhbiBvcHRpb25hbCBpbmRleFxuICAgKiBvZiB3aGVyZSB0byBwbGFjZSB0aGUgbmV3IHJvdyB0ZW1wbGF0ZSBpbiB0aGUgb3V0bGV0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyUm93KFxuICAgIG91dGxldDogUm93T3V0bGV0LFxuICAgIHJvd0RlZjogQmFzZVJvd0RlZixcbiAgICBpbmRleDogbnVtYmVyLFxuICAgIGNvbnRleHQ6IFJvd0NvbnRleHQ8VD4gPSB7fSxcbiAgKTogRW1iZWRkZWRWaWV3UmVmPFJvd0NvbnRleHQ8VD4+IHtcbiAgICAvLyBUT0RPKGFuZHJld3NlZ3Vpbik6IGVuZm9yY2UgdGhhdCBvbmUgb3V0bGV0IHdhcyBpbnN0YW50aWF0ZWQgZnJvbSBjcmVhdGVFbWJlZGRlZFZpZXdcbiAgICBjb25zdCB2aWV3ID0gb3V0bGV0LnZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KHJvd0RlZi50ZW1wbGF0ZSwgY29udGV4dCwgaW5kZXgpO1xuICAgIHRoaXMuX3JlbmRlckNlbGxUZW1wbGF0ZUZvckl0ZW0ocm93RGVmLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIHByaXZhdGUgX3JlbmRlckNlbGxUZW1wbGF0ZUZvckl0ZW0ocm93RGVmOiBCYXNlUm93RGVmLCBjb250ZXh0OiBSb3dDb250ZXh0PFQ+KSB7XG4gICAgZm9yIChsZXQgY2VsbFRlbXBsYXRlIG9mIHRoaXMuX2dldENlbGxUZW1wbGF0ZXMocm93RGVmKSkge1xuICAgICAgaWYgKENka0NlbGxPdXRsZXQubW9zdFJlY2VudENlbGxPdXRsZXQpIHtcbiAgICAgICAgQ2RrQ2VsbE91dGxldC5tb3N0UmVjZW50Q2VsbE91dGxldC5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcoY2VsbFRlbXBsYXRlLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBpbmRleC1yZWxhdGVkIGNvbnRleHQgZm9yIGVhY2ggcm93IHRvIHJlZmxlY3QgYW55IGNoYW5nZXMgaW4gdGhlIGluZGV4IG9mIHRoZSByb3dzLFxuICAgKiBlLmcuIGZpcnN0L2xhc3QvZXZlbi9vZGQuXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVSb3dJbmRleENvbnRleHQoKSB7XG4gICAgY29uc3Qgdmlld0NvbnRhaW5lciA9IHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyO1xuICAgIGZvciAobGV0IHJlbmRlckluZGV4ID0gMCwgY291bnQgPSB2aWV3Q29udGFpbmVyLmxlbmd0aDsgcmVuZGVySW5kZXggPCBjb3VudDsgcmVuZGVySW5kZXgrKykge1xuICAgICAgY29uc3Qgdmlld1JlZiA9IHZpZXdDb250YWluZXIuZ2V0KHJlbmRlckluZGV4KSBhcyBSb3dWaWV3UmVmPFQ+O1xuICAgICAgY29uc3QgY29udGV4dCA9IHZpZXdSZWYuY29udGV4dCBhcyBSb3dDb250ZXh0PFQ+O1xuICAgICAgY29udGV4dC5jb3VudCA9IGNvdW50O1xuICAgICAgY29udGV4dC5maXJzdCA9IHJlbmRlckluZGV4ID09PSAwO1xuICAgICAgY29udGV4dC5sYXN0ID0gcmVuZGVySW5kZXggPT09IGNvdW50IC0gMTtcbiAgICAgIGNvbnRleHQuZXZlbiA9IHJlbmRlckluZGV4ICUgMiA9PT0gMDtcbiAgICAgIGNvbnRleHQub2RkID0gIWNvbnRleHQuZXZlbjtcblxuICAgICAgaWYgKHRoaXMubXVsdGlUZW1wbGF0ZURhdGFSb3dzKSB7XG4gICAgICAgIGNvbnRleHQuZGF0YUluZGV4ID0gdGhpcy5fcmVuZGVyUm93c1tyZW5kZXJJbmRleF0uZGF0YUluZGV4O1xuICAgICAgICBjb250ZXh0LnJlbmRlckluZGV4ID0gcmVuZGVySW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0LmluZGV4ID0gdGhpcy5fcmVuZGVyUm93c1tyZW5kZXJJbmRleF0uZGF0YUluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMgZm9yIHRoZSBwcm92aWRlZCByb3cgZGVmLiAqL1xuICBwcml2YXRlIF9nZXRDZWxsVGVtcGxhdGVzKHJvd0RlZjogQmFzZVJvd0RlZik6IFRlbXBsYXRlUmVmPGFueT5bXSB7XG4gICAgaWYgKCFyb3dEZWYgfHwgIXJvd0RlZi5jb2x1bW5zKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKHJvd0RlZi5jb2x1bW5zLCBjb2x1bW5JZCA9PiB7XG4gICAgICBjb25zdCBjb2x1bW4gPSB0aGlzLl9jb2x1bW5EZWZzQnlOYW1lLmdldChjb2x1bW5JZCk7XG5cbiAgICAgIGlmICghY29sdW1uICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICAgIHRocm93IGdldFRhYmxlVW5rbm93bkNvbHVtbkVycm9yKGNvbHVtbklkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvd0RlZi5leHRyYWN0Q2VsbFRlbXBsYXRlKGNvbHVtbiEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlcyBhIHJlLXJlbmRlciBvZiB0aGUgZGF0YSByb3dzLiBTaG91bGQgYmUgY2FsbGVkIGluIGNhc2VzIHdoZXJlIHRoZXJlIGhhcyBiZWVuIGFuIGlucHV0XG4gICAqIGNoYW5nZSB0aGF0IGFmZmVjdHMgdGhlIGV2YWx1YXRpb24gb2Ygd2hpY2ggcm93cyBzaG91bGQgYmUgcmVuZGVyZWQsIGUuZy4gdG9nZ2xpbmdcbiAgICogYG11bHRpVGVtcGxhdGVEYXRhUm93c2Agb3IgYWRkaW5nL3JlbW92aW5nIHJvdyBkZWZpbml0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKSB7XG4gICAgdGhpcy5fZGF0YURpZmZlci5kaWZmKFtdKTtcbiAgICB0aGlzLl9yb3dPdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgIHRoaXMucmVuZGVyUm93cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGVyZSBoYXMgYmVlbiBhIGNoYW5nZSBpbiBzdGlja3kgc3RhdGVzIHNpbmNlIGxhc3QgY2hlY2sgYW5kIGFwcGxpZXMgdGhlIGNvcnJlY3RcbiAgICogc3RpY2t5IHN0eWxlcy4gU2luY2UgY2hlY2tpbmcgcmVzZXRzIHRoZSBcImRpcnR5XCIgc3RhdGUsIHRoaXMgc2hvdWxkIG9ubHkgYmUgcGVyZm9ybWVkIG9uY2VcbiAgICogZHVyaW5nIGEgY2hhbmdlIGRldGVjdGlvbiBhbmQgYWZ0ZXIgdGhlIGlucHV0cyBhcmUgc2V0dGxlZCAoYWZ0ZXIgY29udGVudCBjaGVjaykuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja1N0aWNreVN0YXRlcygpIHtcbiAgICBjb25zdCBzdGlja3lDaGVja1JlZHVjZXIgPSAoXG4gICAgICBhY2M6IGJvb2xlYW4sXG4gICAgICBkOiBDZGtIZWFkZXJSb3dEZWYgfCBDZGtGb290ZXJSb3dEZWYgfCBDZGtDb2x1bW5EZWYsXG4gICAgKSA9PiB7XG4gICAgICByZXR1cm4gYWNjIHx8IGQuaGFzU3RpY2t5Q2hhbmdlZCgpO1xuICAgIH07XG5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIGNoZWNrIG5lZWRzIHRvIG9jY3VyIGZvciBldmVyeSBkZWZpbml0aW9uIHNpbmNlIGl0IG5vdGlmaWVzIHRoZSBkZWZpbml0aW9uXG4gICAgLy8gdGhhdCBpdCBjYW4gcmVzZXQgaXRzIGRpcnR5IHN0YXRlLiBVc2luZyBhbm90aGVyIG9wZXJhdG9yIGxpa2UgYHNvbWVgIG1heSBzaG9ydC1jaXJjdWl0XG4gICAgLy8gcmVtYWluaW5nIGRlZmluaXRpb25zIGFuZCBsZWF2ZSB0aGVtIGluIGFuIHVuY2hlY2tlZCBzdGF0ZS5cblxuICAgIGlmICh0aGlzLl9oZWFkZXJSb3dEZWZzLnJlZHVjZShzdGlja3lDaGVja1JlZHVjZXIsIGZhbHNlKSkge1xuICAgICAgdGhpcy51cGRhdGVTdGlja3lIZWFkZXJSb3dTdHlsZXMoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZm9vdGVyUm93RGVmcy5yZWR1Y2Uoc3RpY2t5Q2hlY2tSZWR1Y2VyLCBmYWxzZSkpIHtcbiAgICAgIHRoaXMudXBkYXRlU3RpY2t5Rm9vdGVyUm93U3R5bGVzKCk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmZyb20odGhpcy5fY29sdW1uRGVmc0J5TmFtZS52YWx1ZXMoKSkucmVkdWNlKHN0aWNreUNoZWNrUmVkdWNlciwgZmFsc2UpKSB7XG4gICAgICB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgPSB0cnVlO1xuICAgICAgdGhpcy51cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgc3RpY2t5IHN0eWxlciB0aGF0IHdpbGwgYmUgdXNlZCBmb3Igc3RpY2t5IHJvd3MgYW5kIGNvbHVtbnMuIExpc3RlbnNcbiAgICogZm9yIGRpcmVjdGlvbmFsaXR5IGNoYW5nZXMgYW5kIHByb3ZpZGVzIHRoZSBsYXRlc3QgZGlyZWN0aW9uIHRvIHRoZSBzdHlsZXIuIFJlLWFwcGxpZXMgY29sdW1uXG4gICAqIHN0aWNraW5lc3Mgd2hlbiBkaXJlY3Rpb25hbGl0eSBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0dXBTdGlja3lTdHlsZXIoKSB7XG4gICAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSB0aGlzLl9kaXIgPyB0aGlzLl9kaXIudmFsdWUgOiAnbHRyJztcbiAgICB0aGlzLl9zdGlja3lTdHlsZXIgPSBuZXcgU3RpY2t5U3R5bGVyKFxuICAgICAgdGhpcy5faXNOYXRpdmVIdG1sVGFibGUsXG4gICAgICB0aGlzLnN0aWNreUNzc0NsYXNzLFxuICAgICAgZGlyZWN0aW9uLFxuICAgICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsXG4gICAgICB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIsXG4gICAgICB0aGlzLm5lZWRzUG9zaXRpb25TdGlja3lPbkVsZW1lbnQsXG4gICAgICB0aGlzLl9zdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLFxuICAgICk7XG4gICAgKHRoaXMuX2RpciA/IHRoaXMuX2Rpci5jaGFuZ2UgOiBvYnNlcnZhYmxlT2Y8RGlyZWN0aW9uPigpKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXG4gICAgICAuc3Vic2NyaWJlKHZhbHVlID0+IHtcbiAgICAgICAgdGhpcy5fc3RpY2t5U3R5bGVyLmRpcmVjdGlvbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogRmlsdGVycyBkZWZpbml0aW9ucyB0aGF0IGJlbG9uZyB0byB0aGlzIHRhYmxlIGZyb20gYSBRdWVyeUxpc3QuICovXG4gIHByaXZhdGUgX2dldE93bkRlZnM8SSBleHRlbmRzIHtfdGFibGU/OiBhbnl9PihpdGVtczogUXVlcnlMaXN0PEk+KTogSVtdIHtcbiAgICByZXR1cm4gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gIWl0ZW0uX3RhYmxlIHx8IGl0ZW0uX3RhYmxlID09PSB0aGlzKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIG9yIHJlbW92ZXMgdGhlIG5vIGRhdGEgcm93LCBkZXBlbmRpbmcgb24gd2hldGhlciBhbnkgZGF0YSBpcyBiZWluZyBzaG93bi4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlTm9EYXRhUm93KCkge1xuICAgIGNvbnN0IG5vRGF0YVJvdyA9IHRoaXMuX2N1c3RvbU5vRGF0YVJvdyB8fCB0aGlzLl9ub0RhdGFSb3c7XG5cbiAgICBpZiAoIW5vRGF0YVJvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNob3VsZFNob3cgPSB0aGlzLl9yb3dPdXRsZXQudmlld0NvbnRhaW5lci5sZW5ndGggPT09IDA7XG5cbiAgICBpZiAoc2hvdWxkU2hvdyA9PT0gdGhpcy5faXNTaG93aW5nTm9EYXRhUm93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5fbm9EYXRhUm93T3V0bGV0LnZpZXdDb250YWluZXI7XG5cbiAgICBpZiAoc2hvdWxkU2hvdykge1xuICAgICAgY29uc3QgdmlldyA9IGNvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcobm9EYXRhUm93LnRlbXBsYXRlUmVmKTtcbiAgICAgIGNvbnN0IHJvb3ROb2RlOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IHZpZXcucm9vdE5vZGVzWzBdO1xuXG4gICAgICAvLyBPbmx5IGFkZCB0aGUgYXR0cmlidXRlcyBpZiB3ZSBoYXZlIGEgc2luZ2xlIHJvb3Qgbm9kZSBzaW5jZSBpdCdzIGhhcmRcbiAgICAgIC8vIHRvIGZpZ3VyZSBvdXQgd2hpY2ggb25lIHRvIGFkZCBpdCB0byB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZS5cbiAgICAgIGlmICh2aWV3LnJvb3ROb2Rlcy5sZW5ndGggPT09IDEgJiYgcm9vdE5vZGU/Lm5vZGVUeXBlID09PSB0aGlzLl9kb2N1bWVudC5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgcm9vdE5vZGUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3JvdycpO1xuICAgICAgICByb290Tm9kZS5jbGFzc0xpc3QuYWRkKG5vRGF0YVJvdy5fY29udGVudENsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5jbGVhcigpO1xuICAgIH1cblxuICAgIHRoaXMuX2lzU2hvd2luZ05vRGF0YVJvdyA9IHNob3VsZFNob3c7XG5cbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuXG4vKiogVXRpbGl0eSBmdW5jdGlvbiB0aGF0IGdldHMgYSBtZXJnZWQgbGlzdCBvZiB0aGUgZW50cmllcyBpbiBhbiBhcnJheSBhbmQgdmFsdWVzIG9mIGEgU2V0LiAqL1xuZnVuY3Rpb24gbWVyZ2VBcnJheUFuZFNldDxUPihhcnJheTogVFtdLCBzZXQ6IFNldDxUPik6IFRbXSB7XG4gIHJldHVybiBhcnJheS5jb25jYXQoQXJyYXkuZnJvbShzZXQpKTtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgY2xvc2VzdCB0YWJsZSBzZWN0aW9uIHRvIGFuIG91dGxldC4gV2UgY2FuJ3QgdXNlIGBIVE1MRWxlbWVudC5jbG9zZXN0YCBmb3IgdGhpcyxcbiAqIGJlY2F1c2UgdGhlIG5vZGUgcmVwcmVzZW50aW5nIHRoZSBvdXRsZXQgaXMgYSBjb21tZW50LlxuICovXG5mdW5jdGlvbiBjbG9zZXN0VGFibGVTZWN0aW9uKG91dGxldDogUm93T3V0bGV0LCBzZWN0aW9uOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICBjb25zdCB1cHBlcmNhc2VTZWN0aW9uID0gc2VjdGlvbi50b1VwcGVyQ2FzZSgpO1xuICBsZXQgY3VycmVudDogTm9kZSB8IG51bGwgPSBvdXRsZXQudmlld0NvbnRhaW5lci5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG5cbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAvLyAxIGlzIGFuIGVsZW1lbnQgbm9kZS5cbiAgICBjb25zdCBub2RlTmFtZSA9IGN1cnJlbnQubm9kZVR5cGUgPT09IDEgPyAoY3VycmVudCBhcyBIVE1MRWxlbWVudCkubm9kZU5hbWUgOiBudWxsO1xuICAgIGlmIChub2RlTmFtZSA9PT0gdXBwZXJjYXNlU2VjdGlvbikge1xuICAgICAgcmV0dXJuIGN1cnJlbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgfSBlbHNlIGlmIChub2RlTmFtZSA9PT0gJ1RBQkxFJykge1xuICAgICAgLy8gU3RvcCB0cmF2ZXJzaW5nIHBhc3QgdGhlIGB0YWJsZWAgbm9kZS5cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnROb2RlO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=