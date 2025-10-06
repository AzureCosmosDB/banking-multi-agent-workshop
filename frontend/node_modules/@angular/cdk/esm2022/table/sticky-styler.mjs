/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * List of all possible directions that can be used for sticky positioning.
 * @docs-private
 */
export const STICKY_DIRECTIONS = ['top', 'bottom', 'left', 'right'];
/**
 * Applies and removes sticky positioning styles to the `CdkTable` rows and columns cells.
 * @docs-private
 */
export class StickyStyler {
    /**
     * @param _isNativeHtmlTable Whether the sticky logic should be based on a table
     *     that uses the native `<table>` element.
     * @param _stickCellCss The CSS class that will be applied to every row/cell that has
     *     sticky positioning applied.
     * @param direction The directionality context of the table (ltr/rtl); affects column positioning
     *     by reversing left/right positions.
     * @param _isBrowser Whether the table is currently being rendered on the server or the client.
     * @param _needsPositionStickyOnElement Whether we need to specify position: sticky on cells
     *     using inline styles. If false, it is assumed that position: sticky is included in
     *     the component stylesheet for _stickCellCss.
     * @param _positionListener A listener that is notified of changes to sticky rows/columns
     *     and their dimensions.
     */
    constructor(_isNativeHtmlTable, _stickCellCss, direction, _coalescedStyleScheduler, _isBrowser = true, _needsPositionStickyOnElement = true, _positionListener) {
        this._isNativeHtmlTable = _isNativeHtmlTable;
        this._stickCellCss = _stickCellCss;
        this.direction = direction;
        this._coalescedStyleScheduler = _coalescedStyleScheduler;
        this._isBrowser = _isBrowser;
        this._needsPositionStickyOnElement = _needsPositionStickyOnElement;
        this._positionListener = _positionListener;
        this._elemSizeCache = new WeakMap();
        this._resizeObserver = globalThis?.ResizeObserver
            ? new globalThis.ResizeObserver(entries => this._updateCachedSizes(entries))
            : null;
        this._updatedStickyColumnsParamsToReplay = [];
        this._stickyColumnsReplayTimeout = null;
        this._cachedCellWidths = [];
        this._borderCellCss = {
            'top': `${_stickCellCss}-border-elem-top`,
            'bottom': `${_stickCellCss}-border-elem-bottom`,
            'left': `${_stickCellCss}-border-elem-left`,
            'right': `${_stickCellCss}-border-elem-right`,
        };
    }
    /**
     * Clears the sticky positioning styles from the row and its cells by resetting the `position`
     * style, setting the zIndex to 0, and unsetting each provided sticky direction.
     * @param rows The list of rows that should be cleared from sticking in the provided directions
     * @param stickyDirections The directions that should no longer be set as sticky on the rows.
     */
    clearStickyPositioning(rows, stickyDirections) {
        if (stickyDirections.includes('left') || stickyDirections.includes('right')) {
            this._removeFromStickyColumnReplayQueue(rows);
        }
        const elementsToClear = [];
        for (const row of rows) {
            // If the row isn't an element (e.g. if it's an `ng-container`),
            // it won't have inline styles or `children` so we skip it.
            if (row.nodeType !== row.ELEMENT_NODE) {
                continue;
            }
            elementsToClear.push(row);
            for (let i = 0; i < row.children.length; i++) {
                elementsToClear.push(row.children[i]);
            }
        }
        // Coalesce with sticky row/column updates (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            for (const element of elementsToClear) {
                this._removeStickyStyle(element, stickyDirections);
            }
        });
    }
    /**
     * Applies sticky left and right positions to the cells of each row according to the sticky
     * states of the rendered column definitions.
     * @param rows The rows that should have its set of cells stuck according to the sticky states.
     * @param stickyStartStates A list of boolean states where each state represents whether the cell
     *     in this index position should be stuck to the start of the row.
     * @param stickyEndStates A list of boolean states where each state represents whether the cell
     *     in this index position should be stuck to the end of the row.
     * @param recalculateCellWidths Whether the sticky styler should recalculate the width of each
     *     column cell. If `false` cached widths will be used instead.
     * @param replay Whether to enqueue this call for replay after a ResizeObserver update.
     */
    updateStickyColumns(rows, stickyStartStates, stickyEndStates, recalculateCellWidths = true, replay = true) {
        if (replay) {
            this._updateStickyColumnReplayQueue({
                rows: [...rows],
                stickyStartStates: [...stickyStartStates],
                stickyEndStates: [...stickyEndStates],
            });
        }
        if (!rows.length ||
            !this._isBrowser ||
            !(stickyStartStates.some(state => state) || stickyEndStates.some(state => state))) {
            if (this._positionListener) {
                this._positionListener.stickyColumnsUpdated({ sizes: [] });
                this._positionListener.stickyEndColumnsUpdated({ sizes: [] });
            }
            return;
        }
        // Coalesce with sticky row updates (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            const firstRow = rows[0];
            const numCells = firstRow.children.length;
            const cellWidths = this._getCellWidths(firstRow, recalculateCellWidths);
            const startPositions = this._getStickyStartColumnPositions(cellWidths, stickyStartStates);
            const endPositions = this._getStickyEndColumnPositions(cellWidths, stickyEndStates);
            const lastStickyStart = stickyStartStates.lastIndexOf(true);
            const firstStickyEnd = stickyEndStates.indexOf(true);
            const isRtl = this.direction === 'rtl';
            const start = isRtl ? 'right' : 'left';
            const end = isRtl ? 'left' : 'right';
            for (const row of rows) {
                for (let i = 0; i < numCells; i++) {
                    const cell = row.children[i];
                    if (stickyStartStates[i]) {
                        this._addStickyStyle(cell, start, startPositions[i], i === lastStickyStart);
                    }
                    if (stickyEndStates[i]) {
                        this._addStickyStyle(cell, end, endPositions[i], i === firstStickyEnd);
                    }
                }
            }
            if (this._positionListener) {
                this._positionListener.stickyColumnsUpdated({
                    sizes: lastStickyStart === -1
                        ? []
                        : cellWidths
                            .slice(0, lastStickyStart + 1)
                            .map((width, index) => (stickyStartStates[index] ? width : null)),
                });
                this._positionListener.stickyEndColumnsUpdated({
                    sizes: firstStickyEnd === -1
                        ? []
                        : cellWidths
                            .slice(firstStickyEnd)
                            .map((width, index) => (stickyEndStates[index + firstStickyEnd] ? width : null))
                            .reverse(),
                });
            }
        });
    }
    /**
     * Applies sticky positioning to the row's cells if using the native table layout, and to the
     * row itself otherwise.
     * @param rowsToStick The list of rows that should be stuck according to their corresponding
     *     sticky state and to the provided top or bottom position.
     * @param stickyStates A list of boolean states where each state represents whether the row
     *     should be stuck in the particular top or bottom position.
     * @param position The position direction in which the row should be stuck if that row should be
     *     sticky.
     *
     */
    stickRows(rowsToStick, stickyStates, position) {
        // Since we can't measure the rows on the server, we can't stick the rows properly.
        if (!this._isBrowser) {
            return;
        }
        // Coalesce with other sticky row updates (top/bottom), sticky columns updates
        // (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            // If positioning the rows to the bottom, reverse their order when evaluating the sticky
            // position such that the last row stuck will be "bottom: 0px" and so on. Note that the
            // sticky states need to be reversed as well.
            const rows = position === 'bottom' ? rowsToStick.slice().reverse() : rowsToStick;
            const states = position === 'bottom' ? stickyStates.slice().reverse() : stickyStates;
            // Measure row heights all at once before adding sticky styles to reduce layout thrashing.
            const stickyOffsets = [];
            const stickyCellHeights = [];
            const elementsToStick = [];
            for (let rowIndex = 0, stickyOffset = 0; rowIndex < rows.length; rowIndex++) {
                if (!states[rowIndex]) {
                    continue;
                }
                stickyOffsets[rowIndex] = stickyOffset;
                const row = rows[rowIndex];
                elementsToStick[rowIndex] = this._isNativeHtmlTable
                    ? Array.from(row.children)
                    : [row];
                const height = this._retrieveElementSize(row).height;
                stickyOffset += height;
                stickyCellHeights[rowIndex] = height;
            }
            const borderedRowIndex = states.lastIndexOf(true);
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                if (!states[rowIndex]) {
                    continue;
                }
                const offset = stickyOffsets[rowIndex];
                const isBorderedRowIndex = rowIndex === borderedRowIndex;
                for (const element of elementsToStick[rowIndex]) {
                    this._addStickyStyle(element, position, offset, isBorderedRowIndex);
                }
            }
            if (position === 'top') {
                this._positionListener?.stickyHeaderRowsUpdated({
                    sizes: stickyCellHeights,
                    offsets: stickyOffsets,
                    elements: elementsToStick,
                });
            }
            else {
                this._positionListener?.stickyFooterRowsUpdated({
                    sizes: stickyCellHeights,
                    offsets: stickyOffsets,
                    elements: elementsToStick,
                });
            }
        });
    }
    /**
     * When using the native table in Safari, sticky footer cells do not stick. The only way to stick
     * footer rows is to apply sticky styling to the tfoot container. This should only be done if
     * all footer rows are sticky. If not all footer rows are sticky, remove sticky positioning from
     * the tfoot element.
     */
    updateStickyFooterContainer(tableElement, stickyStates) {
        if (!this._isNativeHtmlTable) {
            return;
        }
        // Coalesce with other sticky updates (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            const tfoot = tableElement.querySelector('tfoot');
            if (tfoot) {
                if (stickyStates.some(state => !state)) {
                    this._removeStickyStyle(tfoot, ['bottom']);
                }
                else {
                    this._addStickyStyle(tfoot, 'bottom', 0, false);
                }
            }
        });
    }
    /**
     * Removes the sticky style on the element by removing the sticky cell CSS class, re-evaluating
     * the zIndex, removing each of the provided sticky directions, and removing the
     * sticky position if there are no more directions.
     */
    _removeStickyStyle(element, stickyDirections) {
        for (const dir of stickyDirections) {
            element.style[dir] = '';
            element.classList.remove(this._borderCellCss[dir]);
        }
        // If the element no longer has any more sticky directions, remove sticky positioning and
        // the sticky CSS class.
        // Short-circuit checking element.style[dir] for stickyDirections as they
        // were already removed above.
        const hasDirection = STICKY_DIRECTIONS.some(dir => stickyDirections.indexOf(dir) === -1 && element.style[dir]);
        if (hasDirection) {
            element.style.zIndex = this._getCalculatedZIndex(element);
        }
        else {
            // When not hasDirection, _getCalculatedZIndex will always return ''.
            element.style.zIndex = '';
            if (this._needsPositionStickyOnElement) {
                element.style.position = '';
            }
            element.classList.remove(this._stickCellCss);
        }
    }
    /**
     * Adds the sticky styling to the element by adding the sticky style class, changing position
     * to be sticky (and -webkit-sticky), setting the appropriate zIndex, and adding a sticky
     * direction and value.
     */
    _addStickyStyle(element, dir, dirValue, isBorderElement) {
        element.classList.add(this._stickCellCss);
        if (isBorderElement) {
            element.classList.add(this._borderCellCss[dir]);
        }
        element.style[dir] = `${dirValue}px`;
        element.style.zIndex = this._getCalculatedZIndex(element);
        if (this._needsPositionStickyOnElement) {
            element.style.cssText += 'position: -webkit-sticky; position: sticky; ';
        }
    }
    /**
     * Calculate what the z-index should be for the element, depending on what directions (top,
     * bottom, left, right) have been set. It should be true that elements with a top direction
     * should have the highest index since these are elements like a table header. If any of those
     * elements are also sticky in another direction, then they should appear above other elements
     * that are only sticky top (e.g. a sticky column on a sticky header). Bottom-sticky elements
     * (e.g. footer rows) should then be next in the ordering such that they are below the header
     * but above any non-sticky elements. Finally, left/right sticky elements (e.g. sticky columns)
     * should minimally increment so that they are above non-sticky elements but below top and bottom
     * elements.
     */
    _getCalculatedZIndex(element) {
        const zIndexIncrements = {
            top: 100,
            bottom: 10,
            left: 1,
            right: 1,
        };
        let zIndex = 0;
        // Use `Iterable` instead of `Array` because TypeScript, as of 3.6.3,
        // loses the array generic type in the `for of`. But we *also* have to use `Array` because
        // typescript won't iterate over an `Iterable` unless you compile with `--downlevelIteration`
        for (const dir of STICKY_DIRECTIONS) {
            if (element.style[dir]) {
                zIndex += zIndexIncrements[dir];
            }
        }
        return zIndex ? `${zIndex}` : '';
    }
    /** Gets the widths for each cell in the provided row. */
    _getCellWidths(row, recalculateCellWidths = true) {
        if (!recalculateCellWidths && this._cachedCellWidths.length) {
            return this._cachedCellWidths;
        }
        const cellWidths = [];
        const firstRowCells = row.children;
        for (let i = 0; i < firstRowCells.length; i++) {
            const cell = firstRowCells[i];
            cellWidths.push(this._retrieveElementSize(cell).width);
        }
        this._cachedCellWidths = cellWidths;
        return cellWidths;
    }
    /**
     * Determines the left and right positions of each sticky column cell, which will be the
     * accumulation of all sticky column cell widths to the left and right, respectively.
     * Non-sticky cells do not need to have a value set since their positions will not be applied.
     */
    _getStickyStartColumnPositions(widths, stickyStates) {
        const positions = [];
        let nextPosition = 0;
        for (let i = 0; i < widths.length; i++) {
            if (stickyStates[i]) {
                positions[i] = nextPosition;
                nextPosition += widths[i];
            }
        }
        return positions;
    }
    /**
     * Determines the left and right positions of each sticky column cell, which will be the
     * accumulation of all sticky column cell widths to the left and right, respectively.
     * Non-sticky cells do not need to have a value set since their positions will not be applied.
     */
    _getStickyEndColumnPositions(widths, stickyStates) {
        const positions = [];
        let nextPosition = 0;
        for (let i = widths.length; i > 0; i--) {
            if (stickyStates[i]) {
                positions[i] = nextPosition;
                nextPosition += widths[i];
            }
        }
        return positions;
    }
    /**
     * Retreives the most recently observed size of the specified element from the cache, or
     * meaures it directly if not yet cached.
     */
    _retrieveElementSize(element) {
        const cachedSize = this._elemSizeCache.get(element);
        if (cachedSize) {
            return cachedSize;
        }
        const clientRect = element.getBoundingClientRect();
        const size = { width: clientRect.width, height: clientRect.height };
        if (!this._resizeObserver) {
            return size;
        }
        this._elemSizeCache.set(element, size);
        this._resizeObserver.observe(element, { box: 'border-box' });
        return size;
    }
    /**
     * Conditionally enqueue the requested sticky update and clear previously queued updates
     * for the same rows.
     */
    _updateStickyColumnReplayQueue(params) {
        this._removeFromStickyColumnReplayQueue(params.rows);
        // No need to replay if a flush is pending.
        if (this._stickyColumnsReplayTimeout) {
            return;
        }
        this._updatedStickyColumnsParamsToReplay.push(params);
    }
    /** Remove updates for the specified rows from the queue. */
    _removeFromStickyColumnReplayQueue(rows) {
        const rowsSet = new Set(rows);
        for (const update of this._updatedStickyColumnsParamsToReplay) {
            update.rows = update.rows.filter(row => !rowsSet.has(row));
        }
        this._updatedStickyColumnsParamsToReplay = this._updatedStickyColumnsParamsToReplay.filter(update => !!update.rows.length);
    }
    /** Update _elemSizeCache with the observed sizes. */
    _updateCachedSizes(entries) {
        let needsColumnUpdate = false;
        for (const entry of entries) {
            const newEntry = entry.borderBoxSize?.length
                ? {
                    width: entry.borderBoxSize[0].inlineSize,
                    height: entry.borderBoxSize[0].blockSize,
                }
                : {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                };
            if (newEntry.width !== this._elemSizeCache.get(entry.target)?.width &&
                isCell(entry.target)) {
                needsColumnUpdate = true;
            }
            this._elemSizeCache.set(entry.target, newEntry);
        }
        if (needsColumnUpdate && this._updatedStickyColumnsParamsToReplay.length) {
            if (this._stickyColumnsReplayTimeout) {
                clearTimeout(this._stickyColumnsReplayTimeout);
            }
            this._stickyColumnsReplayTimeout = setTimeout(() => {
                for (const update of this._updatedStickyColumnsParamsToReplay) {
                    this.updateStickyColumns(update.rows, update.stickyStartStates, update.stickyEndStates, true, false);
                }
                this._updatedStickyColumnsParamsToReplay = [];
                this._stickyColumnsReplayTimeout = null;
            }, 0);
        }
    }
}
function isCell(element) {
    return ['cdk-cell', 'cdk-header-cell', 'cdk-footer-cell'].some(klass => element.classList.contains(klass));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5LXN0eWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvc3RpY2t5LXN0eWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFrQkg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQXNCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFdkY7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFlBQVk7SUFVdkI7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNILFlBQ1Usa0JBQTJCLEVBQzNCLGFBQXFCLEVBQ3RCLFNBQW9CLEVBQ25CLHdCQUFrRCxFQUNsRCxhQUFhLElBQUksRUFDUixnQ0FBZ0MsSUFBSSxFQUNwQyxpQkFBNkM7UUFOdEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFTO1FBQzNCLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDbkIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQ1Isa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFPO1FBQ3BDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNEI7UUE5QnhELG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQWdELENBQUM7UUFDN0Usb0JBQWUsR0FBRyxVQUFVLEVBQUUsY0FBYztZQUNsRCxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVFLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDRCx3Q0FBbUMsR0FBZ0MsRUFBRSxDQUFDO1FBQ3RFLGdDQUEyQixHQUFrQixJQUFJLENBQUM7UUFDbEQsc0JBQWlCLEdBQWEsRUFBRSxDQUFDO1FBMEJ2QyxJ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QixDQUFDO1lBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQXFCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUksaUJBQWlCLElBQUksSUFBSSxDQUFDLG1DQUFtQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pFLElBQUksSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ3JDLFlBQVksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBRUQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pELEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7b0JBQzlELElBQUksQ0FBQyxtQkFBbUIsQ0FDdEIsTUFBTSxDQUFDLElBQUksRUFDWCxNQUFNLENBQUMsaUJBQWlCLEVBQ3hCLE1BQU0sQ0FBQyxlQUFlLEVBQ3RCLElBQUksRUFDSixLQUFLLENBQ04sQ0FBQztnQkFDSixDQUFDO2dCQUNELElBQUksQ0FBQyxtQ0FBbUMsR0FBRyxFQUFFLENBQUM7Z0JBQzlDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFDMUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1IsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUVELFNBQVMsTUFBTSxDQUFDLE9BQWdCO0lBQzlCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDckUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQ2xDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogRGlyZWN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHdoZW4gc2V0dGluZyBzdGlja3kgcG9zaXRpb25pbmcuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge19Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcn0gZnJvbSAnLi9jb2FsZXNjZWQtc3R5bGUtc2NoZWR1bGVyJztcbmltcG9ydCB7U3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcn0gZnJvbSAnLi9zdGlja3ktcG9zaXRpb24tbGlzdGVuZXInO1xuXG5leHBvcnQgdHlwZSBTdGlja3lEaXJlY3Rpb24gPSAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxuaW50ZXJmYWNlIFVwZGF0ZVN0aWNreUNvbHVtbnNQYXJhbXMge1xuICByb3dzOiBIVE1MRWxlbWVudFtdO1xuICBzdGlja3lTdGFydFN0YXRlczogYm9vbGVhbltdO1xuICBzdGlja3lFbmRTdGF0ZXM6IGJvb2xlYW5bXTtcbn1cblxuLyoqXG4gKiBMaXN0IG9mIGFsbCBwb3NzaWJsZSBkaXJlY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgZm9yIHN0aWNreSBwb3NpdGlvbmluZy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IFNUSUNLWV9ESVJFQ1RJT05TOiBTdGlja3lEaXJlY3Rpb25bXSA9IFsndG9wJywgJ2JvdHRvbScsICdsZWZ0JywgJ3JpZ2h0J107XG5cbi8qKlxuICogQXBwbGllcyBhbmQgcmVtb3ZlcyBzdGlja3kgcG9zaXRpb25pbmcgc3R5bGVzIHRvIHRoZSBgQ2RrVGFibGVgIHJvd3MgYW5kIGNvbHVtbnMgY2VsbHMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGlja3lTdHlsZXIge1xuICBwcml2YXRlIF9lbGVtU2l6ZUNhY2hlID0gbmV3IFdlYWtNYXA8SFRNTEVsZW1lbnQsIHt3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcn0+KCk7XG4gIHByaXZhdGUgX3Jlc2l6ZU9ic2VydmVyID0gZ2xvYmFsVGhpcz8uUmVzaXplT2JzZXJ2ZXJcbiAgICA/IG5ldyBnbG9iYWxUaGlzLlJlc2l6ZU9ic2VydmVyKGVudHJpZXMgPT4gdGhpcy5fdXBkYXRlQ2FjaGVkU2l6ZXMoZW50cmllcykpXG4gICAgOiBudWxsO1xuICBwcml2YXRlIF91cGRhdGVkU3RpY2t5Q29sdW1uc1BhcmFtc1RvUmVwbGF5OiBVcGRhdGVTdGlja3lDb2x1bW5zUGFyYW1zW10gPSBbXTtcbiAgcHJpdmF0ZSBfc3RpY2t5Q29sdW1uc1JlcGxheVRpbWVvdXQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9jYWNoZWRDZWxsV2lkdGhzOiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IF9ib3JkZXJDZWxsQ3NzOiBSZWFkb25seTx7W2QgaW4gU3RpY2t5RGlyZWN0aW9uXTogc3RyaW5nfT47XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBfaXNOYXRpdmVIdG1sVGFibGUgV2hldGhlciB0aGUgc3RpY2t5IGxvZ2ljIHNob3VsZCBiZSBiYXNlZCBvbiBhIHRhYmxlXG4gICAqICAgICB0aGF0IHVzZXMgdGhlIG5hdGl2ZSBgPHRhYmxlPmAgZWxlbWVudC5cbiAgICogQHBhcmFtIF9zdGlja0NlbGxDc3MgVGhlIENTUyBjbGFzcyB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byBldmVyeSByb3cvY2VsbCB0aGF0IGhhc1xuICAgKiAgICAgc3RpY2t5IHBvc2l0aW9uaW5nIGFwcGxpZWQuXG4gICAqIEBwYXJhbSBkaXJlY3Rpb24gVGhlIGRpcmVjdGlvbmFsaXR5IGNvbnRleHQgb2YgdGhlIHRhYmxlIChsdHIvcnRsKTsgYWZmZWN0cyBjb2x1bW4gcG9zaXRpb25pbmdcbiAgICogICAgIGJ5IHJldmVyc2luZyBsZWZ0L3JpZ2h0IHBvc2l0aW9ucy5cbiAgICogQHBhcmFtIF9pc0Jyb3dzZXIgV2hldGhlciB0aGUgdGFibGUgaXMgY3VycmVudGx5IGJlaW5nIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXIgb3IgdGhlIGNsaWVudC5cbiAgICogQHBhcmFtIF9uZWVkc1Bvc2l0aW9uU3RpY2t5T25FbGVtZW50IFdoZXRoZXIgd2UgbmVlZCB0byBzcGVjaWZ5IHBvc2l0aW9uOiBzdGlja3kgb24gY2VsbHNcbiAgICogICAgIHVzaW5nIGlubGluZSBzdHlsZXMuIElmIGZhbHNlLCBpdCBpcyBhc3N1bWVkIHRoYXQgcG9zaXRpb246IHN0aWNreSBpcyBpbmNsdWRlZCBpblxuICAgKiAgICAgdGhlIGNvbXBvbmVudCBzdHlsZXNoZWV0IGZvciBfc3RpY2tDZWxsQ3NzLlxuICAgKiBAcGFyYW0gX3Bvc2l0aW9uTGlzdGVuZXIgQSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIG9mIGNoYW5nZXMgdG8gc3RpY2t5IHJvd3MvY29sdW1uc1xuICAgKiAgICAgYW5kIHRoZWlyIGRpbWVuc2lvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9pc05hdGl2ZUh0bWxUYWJsZTogYm9vbGVhbixcbiAgICBwcml2YXRlIF9zdGlja0NlbGxDc3M6IHN0cmluZyxcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgcHJpdmF0ZSBfY29hbGVzY2VkU3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcbiAgICBwcml2YXRlIF9pc0Jyb3dzZXIgPSB0cnVlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25lZWRzUG9zaXRpb25TdGlja3lPbkVsZW1lbnQgPSB0cnVlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3Bvc2l0aW9uTGlzdGVuZXI/OiBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLFxuICApIHtcbiAgICB0aGlzLl9ib3JkZXJDZWxsQ3NzID0ge1xuICAgICAgJ3RvcCc6IGAke19zdGlja0NlbGxDc3N9LWJvcmRlci1lbGVtLXRvcGAsXG4gICAgICAnYm90dG9tJzogYCR7X3N0aWNrQ2VsbENzc30tYm9yZGVyLWVsZW0tYm90dG9tYCxcbiAgICAgICdsZWZ0JzogYCR7X3N0aWNrQ2VsbENzc30tYm9yZGVyLWVsZW0tbGVmdGAsXG4gICAgICAncmlnaHQnOiBgJHtfc3RpY2tDZWxsQ3NzfS1ib3JkZXItZWxlbS1yaWdodGAsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIHN0aWNreSBwb3NpdGlvbmluZyBzdHlsZXMgZnJvbSB0aGUgcm93IGFuZCBpdHMgY2VsbHMgYnkgcmVzZXR0aW5nIHRoZSBgcG9zaXRpb25gXG4gICAqIHN0eWxlLCBzZXR0aW5nIHRoZSB6SW5kZXggdG8gMCwgYW5kIHVuc2V0dGluZyBlYWNoIHByb3ZpZGVkIHN0aWNreSBkaXJlY3Rpb24uXG4gICAqIEBwYXJhbSByb3dzIFRoZSBsaXN0IG9mIHJvd3MgdGhhdCBzaG91bGQgYmUgY2xlYXJlZCBmcm9tIHN0aWNraW5nIGluIHRoZSBwcm92aWRlZCBkaXJlY3Rpb25zXG4gICAqIEBwYXJhbSBzdGlja3lEaXJlY3Rpb25zIFRoZSBkaXJlY3Rpb25zIHRoYXQgc2hvdWxkIG5vIGxvbmdlciBiZSBzZXQgYXMgc3RpY2t5IG9uIHRoZSByb3dzLlxuICAgKi9cbiAgY2xlYXJTdGlja3lQb3NpdGlvbmluZyhyb3dzOiBIVE1MRWxlbWVudFtdLCBzdGlja3lEaXJlY3Rpb25zOiBTdGlja3lEaXJlY3Rpb25bXSkge1xuICAgIGlmIChzdGlja3lEaXJlY3Rpb25zLmluY2x1ZGVzKCdsZWZ0JykgfHwgc3RpY2t5RGlyZWN0aW9ucy5pbmNsdWRlcygncmlnaHQnKSkge1xuICAgICAgdGhpcy5fcmVtb3ZlRnJvbVN0aWNreUNvbHVtblJlcGxheVF1ZXVlKHJvd3MpO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRzVG9DbGVhcjogSFRNTEVsZW1lbnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgIC8vIElmIHRoZSByb3cgaXNuJ3QgYW4gZWxlbWVudCAoZS5nLiBpZiBpdCdzIGFuIGBuZy1jb250YWluZXJgKSxcbiAgICAgIC8vIGl0IHdvbid0IGhhdmUgaW5saW5lIHN0eWxlcyBvciBgY2hpbGRyZW5gIHNvIHdlIHNraXAgaXQuXG4gICAgICBpZiAocm93Lm5vZGVUeXBlICE9PSByb3cuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBlbGVtZW50c1RvQ2xlYXIucHVzaChyb3cpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3cuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNUb0NsZWFyLnB1c2gocm93LmNoaWxkcmVuW2ldIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb2FsZXNjZSB3aXRoIHN0aWNreSByb3cvY29sdW1uIHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXG4gICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzVG9DbGVhcikge1xuICAgICAgICB0aGlzLl9yZW1vdmVTdGlja3lTdHlsZShlbGVtZW50LCBzdGlja3lEaXJlY3Rpb25zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHN0aWNreSBsZWZ0IGFuZCByaWdodCBwb3NpdGlvbnMgdG8gdGhlIGNlbGxzIG9mIGVhY2ggcm93IGFjY29yZGluZyB0byB0aGUgc3RpY2t5XG4gICAqIHN0YXRlcyBvZiB0aGUgcmVuZGVyZWQgY29sdW1uIGRlZmluaXRpb25zLlxuICAgKiBAcGFyYW0gcm93cyBUaGUgcm93cyB0aGF0IHNob3VsZCBoYXZlIGl0cyBzZXQgb2YgY2VsbHMgc3R1Y2sgYWNjb3JkaW5nIHRvIHRoZSBzdGlja3kgc3RhdGVzLlxuICAgKiBAcGFyYW0gc3RpY2t5U3RhcnRTdGF0ZXMgQSBsaXN0IG9mIGJvb2xlYW4gc3RhdGVzIHdoZXJlIGVhY2ggc3RhdGUgcmVwcmVzZW50cyB3aGV0aGVyIHRoZSBjZWxsXG4gICAqICAgICBpbiB0aGlzIGluZGV4IHBvc2l0aW9uIHNob3VsZCBiZSBzdHVjayB0byB0aGUgc3RhcnQgb2YgdGhlIHJvdy5cbiAgICogQHBhcmFtIHN0aWNreUVuZFN0YXRlcyBBIGxpc3Qgb2YgYm9vbGVhbiBzdGF0ZXMgd2hlcmUgZWFjaCBzdGF0ZSByZXByZXNlbnRzIHdoZXRoZXIgdGhlIGNlbGxcbiAgICogICAgIGluIHRoaXMgaW5kZXggcG9zaXRpb24gc2hvdWxkIGJlIHN0dWNrIHRvIHRoZSBlbmQgb2YgdGhlIHJvdy5cbiAgICogQHBhcmFtIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyBXaGV0aGVyIHRoZSBzdGlja3kgc3R5bGVyIHNob3VsZCByZWNhbGN1bGF0ZSB0aGUgd2lkdGggb2YgZWFjaFxuICAgKiAgICAgY29sdW1uIGNlbGwuIElmIGBmYWxzZWAgY2FjaGVkIHdpZHRocyB3aWxsIGJlIHVzZWQgaW5zdGVhZC5cbiAgICogQHBhcmFtIHJlcGxheSBXaGV0aGVyIHRvIGVucXVldWUgdGhpcyBjYWxsIGZvciByZXBsYXkgYWZ0ZXIgYSBSZXNpemVPYnNlcnZlciB1cGRhdGUuXG4gICAqL1xuICB1cGRhdGVTdGlja3lDb2x1bW5zKFxuICAgIHJvd3M6IEhUTUxFbGVtZW50W10sXG4gICAgc3RpY2t5U3RhcnRTdGF0ZXM6IGJvb2xlYW5bXSxcbiAgICBzdGlja3lFbmRTdGF0ZXM6IGJvb2xlYW5bXSxcbiAgICByZWNhbGN1bGF0ZUNlbGxXaWR0aHMgPSB0cnVlLFxuICAgIHJlcGxheSA9IHRydWUsXG4gICkge1xuICAgIGlmIChyZXBsYXkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0aWNreUNvbHVtblJlcGxheVF1ZXVlKHtcbiAgICAgICAgcm93czogWy4uLnJvd3NdLFxuICAgICAgICBzdGlja3lTdGFydFN0YXRlczogWy4uLnN0aWNreVN0YXJ0U3RhdGVzXSxcbiAgICAgICAgc3RpY2t5RW5kU3RhdGVzOiBbLi4uc3RpY2t5RW5kU3RhdGVzXSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICFyb3dzLmxlbmd0aCB8fFxuICAgICAgIXRoaXMuX2lzQnJvd3NlciB8fFxuICAgICAgIShzdGlja3lTdGFydFN0YXRlcy5zb21lKHN0YXRlID0+IHN0YXRlKSB8fCBzdGlja3lFbmRTdGF0ZXMuc29tZShzdGF0ZSA9PiBzdGF0ZSkpXG4gICAgKSB7XG4gICAgICBpZiAodGhpcy5fcG9zaXRpb25MaXN0ZW5lcikge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbkxpc3RlbmVyLnN0aWNreUNvbHVtbnNVcGRhdGVkKHtzaXplczogW119KTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lci5zdGlja3lFbmRDb2x1bW5zVXBkYXRlZCh7c2l6ZXM6IFtdfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDb2FsZXNjZSB3aXRoIHN0aWNreSByb3cgdXBkYXRlcyAoYW5kIHBvdGVudGlhbGx5IG90aGVyIGNoYW5nZXMgbGlrZSBjb2x1bW4gcmVzaXplKS5cbiAgICB0aGlzLl9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICBjb25zdCBmaXJzdFJvdyA9IHJvd3NbMF07XG4gICAgICBjb25zdCBudW1DZWxscyA9IGZpcnN0Um93LmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgIGNvbnN0IGNlbGxXaWR0aHM6IG51bWJlcltdID0gdGhpcy5fZ2V0Q2VsbFdpZHRocyhmaXJzdFJvdywgcmVjYWxjdWxhdGVDZWxsV2lkdGhzKTtcblxuICAgICAgY29uc3Qgc3RhcnRQb3NpdGlvbnMgPSB0aGlzLl9nZXRTdGlja3lTdGFydENvbHVtblBvc2l0aW9ucyhjZWxsV2lkdGhzLCBzdGlja3lTdGFydFN0YXRlcyk7XG4gICAgICBjb25zdCBlbmRQb3NpdGlvbnMgPSB0aGlzLl9nZXRTdGlja3lFbmRDb2x1bW5Qb3NpdGlvbnMoY2VsbFdpZHRocywgc3RpY2t5RW5kU3RhdGVzKTtcblxuICAgICAgY29uc3QgbGFzdFN0aWNreVN0YXJ0ID0gc3RpY2t5U3RhcnRTdGF0ZXMubGFzdEluZGV4T2YodHJ1ZSk7XG4gICAgICBjb25zdCBmaXJzdFN0aWNreUVuZCA9IHN0aWNreUVuZFN0YXRlcy5pbmRleE9mKHRydWUpO1xuXG4gICAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyZWN0aW9uID09PSAncnRsJztcbiAgICAgIGNvbnN0IHN0YXJ0ID0gaXNSdGwgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgY29uc3QgZW5kID0gaXNSdGwgPyAnbGVmdCcgOiAncmlnaHQnO1xuXG4gICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2VsbHM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuY2hpbGRyZW5baV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgaWYgKHN0aWNreVN0YXJ0U3RhdGVzW2ldKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZShjZWxsLCBzdGFydCwgc3RhcnRQb3NpdGlvbnNbaV0sIGkgPT09IGxhc3RTdGlja3lTdGFydCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN0aWNreUVuZFN0YXRlc1tpXSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkU3RpY2t5U3R5bGUoY2VsbCwgZW5kLCBlbmRQb3NpdGlvbnNbaV0sIGkgPT09IGZpcnN0U3RpY2t5RW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lci5zdGlja3lDb2x1bW5zVXBkYXRlZCh7XG4gICAgICAgICAgc2l6ZXM6XG4gICAgICAgICAgICBsYXN0U3RpY2t5U3RhcnQgPT09IC0xXG4gICAgICAgICAgICAgID8gW11cbiAgICAgICAgICAgICAgOiBjZWxsV2lkdGhzXG4gICAgICAgICAgICAgICAgICAuc2xpY2UoMCwgbGFzdFN0aWNreVN0YXJ0ICsgMSlcbiAgICAgICAgICAgICAgICAgIC5tYXAoKHdpZHRoLCBpbmRleCkgPT4gKHN0aWNreVN0YXJ0U3RhdGVzW2luZGV4XSA/IHdpZHRoIDogbnVsbCkpLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lci5zdGlja3lFbmRDb2x1bW5zVXBkYXRlZCh7XG4gICAgICAgICAgc2l6ZXM6XG4gICAgICAgICAgICBmaXJzdFN0aWNreUVuZCA9PT0gLTFcbiAgICAgICAgICAgICAgPyBbXVxuICAgICAgICAgICAgICA6IGNlbGxXaWR0aHNcbiAgICAgICAgICAgICAgICAgIC5zbGljZShmaXJzdFN0aWNreUVuZClcbiAgICAgICAgICAgICAgICAgIC5tYXAoKHdpZHRoLCBpbmRleCkgPT4gKHN0aWNreUVuZFN0YXRlc1tpbmRleCArIGZpcnN0U3RpY2t5RW5kXSA/IHdpZHRoIDogbnVsbCkpXG4gICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHN0aWNreSBwb3NpdGlvbmluZyB0byB0aGUgcm93J3MgY2VsbHMgaWYgdXNpbmcgdGhlIG5hdGl2ZSB0YWJsZSBsYXlvdXQsIGFuZCB0byB0aGVcbiAgICogcm93IGl0c2VsZiBvdGhlcndpc2UuXG4gICAqIEBwYXJhbSByb3dzVG9TdGljayBUaGUgbGlzdCBvZiByb3dzIHRoYXQgc2hvdWxkIGJlIHN0dWNrIGFjY29yZGluZyB0byB0aGVpciBjb3JyZXNwb25kaW5nXG4gICAqICAgICBzdGlja3kgc3RhdGUgYW5kIHRvIHRoZSBwcm92aWRlZCB0b3Agb3IgYm90dG9tIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gc3RpY2t5U3RhdGVzIEEgbGlzdCBvZiBib29sZWFuIHN0YXRlcyB3aGVyZSBlYWNoIHN0YXRlIHJlcHJlc2VudHMgd2hldGhlciB0aGUgcm93XG4gICAqICAgICBzaG91bGQgYmUgc3R1Y2sgaW4gdGhlIHBhcnRpY3VsYXIgdG9wIG9yIGJvdHRvbSBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBwb3NpdGlvbiBkaXJlY3Rpb24gaW4gd2hpY2ggdGhlIHJvdyBzaG91bGQgYmUgc3R1Y2sgaWYgdGhhdCByb3cgc2hvdWxkIGJlXG4gICAqICAgICBzdGlja3kuXG4gICAqXG4gICAqL1xuICBzdGlja1Jvd3Mocm93c1RvU3RpY2s6IEhUTUxFbGVtZW50W10sIHN0aWNreVN0YXRlczogYm9vbGVhbltdLCBwb3NpdGlvbjogJ3RvcCcgfCAnYm90dG9tJykge1xuICAgIC8vIFNpbmNlIHdlIGNhbid0IG1lYXN1cmUgdGhlIHJvd3Mgb24gdGhlIHNlcnZlciwgd2UgY2FuJ3Qgc3RpY2sgdGhlIHJvd3MgcHJvcGVybHkuXG4gICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDb2FsZXNjZSB3aXRoIG90aGVyIHN0aWNreSByb3cgdXBkYXRlcyAodG9wL2JvdHRvbSksIHN0aWNreSBjb2x1bW5zIHVwZGF0ZXNcbiAgICAvLyAoYW5kIHBvdGVudGlhbGx5IG90aGVyIGNoYW5nZXMgbGlrZSBjb2x1bW4gcmVzaXplKS5cbiAgICB0aGlzLl9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICAvLyBJZiBwb3NpdGlvbmluZyB0aGUgcm93cyB0byB0aGUgYm90dG9tLCByZXZlcnNlIHRoZWlyIG9yZGVyIHdoZW4gZXZhbHVhdGluZyB0aGUgc3RpY2t5XG4gICAgICAvLyBwb3NpdGlvbiBzdWNoIHRoYXQgdGhlIGxhc3Qgcm93IHN0dWNrIHdpbGwgYmUgXCJib3R0b206IDBweFwiIGFuZCBzbyBvbi4gTm90ZSB0aGF0IHRoZVxuICAgICAgLy8gc3RpY2t5IHN0YXRlcyBuZWVkIHRvIGJlIHJldmVyc2VkIGFzIHdlbGwuXG4gICAgICBjb25zdCByb3dzID0gcG9zaXRpb24gPT09ICdib3R0b20nID8gcm93c1RvU3RpY2suc2xpY2UoKS5yZXZlcnNlKCkgOiByb3dzVG9TdGljaztcbiAgICAgIGNvbnN0IHN0YXRlcyA9IHBvc2l0aW9uID09PSAnYm90dG9tJyA/IHN0aWNreVN0YXRlcy5zbGljZSgpLnJldmVyc2UoKSA6IHN0aWNreVN0YXRlcztcblxuICAgICAgLy8gTWVhc3VyZSByb3cgaGVpZ2h0cyBhbGwgYXQgb25jZSBiZWZvcmUgYWRkaW5nIHN0aWNreSBzdHlsZXMgdG8gcmVkdWNlIGxheW91dCB0aHJhc2hpbmcuXG4gICAgICBjb25zdCBzdGlja3lPZmZzZXRzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgY29uc3Qgc3RpY2t5Q2VsbEhlaWdodHM6IChudW1iZXIgfCB1bmRlZmluZWQpW10gPSBbXTtcbiAgICAgIGNvbnN0IGVsZW1lbnRzVG9TdGljazogSFRNTEVsZW1lbnRbXVtdID0gW107XG5cbiAgICAgIGZvciAobGV0IHJvd0luZGV4ID0gMCwgc3RpY2t5T2Zmc2V0ID0gMDsgcm93SW5kZXggPCByb3dzLmxlbmd0aDsgcm93SW5kZXgrKykge1xuICAgICAgICBpZiAoIXN0YXRlc1tyb3dJbmRleF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0aWNreU9mZnNldHNbcm93SW5kZXhdID0gc3RpY2t5T2Zmc2V0O1xuICAgICAgICBjb25zdCByb3cgPSByb3dzW3Jvd0luZGV4XTtcbiAgICAgICAgZWxlbWVudHNUb1N0aWNrW3Jvd0luZGV4XSA9IHRoaXMuX2lzTmF0aXZlSHRtbFRhYmxlXG4gICAgICAgICAgPyAoQXJyYXkuZnJvbShyb3cuY2hpbGRyZW4pIGFzIEhUTUxFbGVtZW50W10pXG4gICAgICAgICAgOiBbcm93XTtcblxuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLl9yZXRyaWV2ZUVsZW1lbnRTaXplKHJvdykuaGVpZ2h0O1xuICAgICAgICBzdGlja3lPZmZzZXQgKz0gaGVpZ2h0O1xuICAgICAgICBzdGlja3lDZWxsSGVpZ2h0c1tyb3dJbmRleF0gPSBoZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJvcmRlcmVkUm93SW5kZXggPSBzdGF0ZXMubGFzdEluZGV4T2YodHJ1ZSk7XG5cbiAgICAgIGZvciAobGV0IHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCByb3dzLmxlbmd0aDsgcm93SW5kZXgrKykge1xuICAgICAgICBpZiAoIXN0YXRlc1tyb3dJbmRleF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHN0aWNreU9mZnNldHNbcm93SW5kZXhdO1xuICAgICAgICBjb25zdCBpc0JvcmRlcmVkUm93SW5kZXggPSByb3dJbmRleCA9PT0gYm9yZGVyZWRSb3dJbmRleDtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzVG9TdGlja1tyb3dJbmRleF0pIHtcbiAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZShlbGVtZW50LCBwb3NpdGlvbiwgb2Zmc2V0LCBpc0JvcmRlcmVkUm93SW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lcj8uc3RpY2t5SGVhZGVyUm93c1VwZGF0ZWQoe1xuICAgICAgICAgIHNpemVzOiBzdGlja3lDZWxsSGVpZ2h0cyxcbiAgICAgICAgICBvZmZzZXRzOiBzdGlja3lPZmZzZXRzLFxuICAgICAgICAgIGVsZW1lbnRzOiBlbGVtZW50c1RvU3RpY2ssXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lcj8uc3RpY2t5Rm9vdGVyUm93c1VwZGF0ZWQoe1xuICAgICAgICAgIHNpemVzOiBzdGlja3lDZWxsSGVpZ2h0cyxcbiAgICAgICAgICBvZmZzZXRzOiBzdGlja3lPZmZzZXRzLFxuICAgICAgICAgIGVsZW1lbnRzOiBlbGVtZW50c1RvU3RpY2ssXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIG5hdGl2ZSB0YWJsZSBpbiBTYWZhcmksIHN0aWNreSBmb290ZXIgY2VsbHMgZG8gbm90IHN0aWNrLiBUaGUgb25seSB3YXkgdG8gc3RpY2tcbiAgICogZm9vdGVyIHJvd3MgaXMgdG8gYXBwbHkgc3RpY2t5IHN0eWxpbmcgdG8gdGhlIHRmb290IGNvbnRhaW5lci4gVGhpcyBzaG91bGQgb25seSBiZSBkb25lIGlmXG4gICAqIGFsbCBmb290ZXIgcm93cyBhcmUgc3RpY2t5LiBJZiBub3QgYWxsIGZvb3RlciByb3dzIGFyZSBzdGlja3ksIHJlbW92ZSBzdGlja3kgcG9zaXRpb25pbmcgZnJvbVxuICAgKiB0aGUgdGZvb3QgZWxlbWVudC5cbiAgICovXG4gIHVwZGF0ZVN0aWNreUZvb3RlckNvbnRhaW5lcih0YWJsZUVsZW1lbnQ6IEVsZW1lbnQsIHN0aWNreVN0YXRlczogYm9vbGVhbltdKSB7XG4gICAgaWYgKCF0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvYWxlc2NlIHdpdGggb3RoZXIgc3RpY2t5IHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXG4gICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgY29uc3QgdGZvb3QgPSB0YWJsZUVsZW1lbnQucXVlcnlTZWxlY3RvcigndGZvb3QnKSE7XG5cbiAgICAgIGlmICh0Zm9vdCkge1xuICAgICAgICBpZiAoc3RpY2t5U3RhdGVzLnNvbWUoc3RhdGUgPT4gIXN0YXRlKSkge1xuICAgICAgICAgIHRoaXMuX3JlbW92ZVN0aWNreVN0eWxlKHRmb290LCBbJ2JvdHRvbSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZSh0Zm9vdCwgJ2JvdHRvbScsIDAsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHN0aWNreSBzdHlsZSBvbiB0aGUgZWxlbWVudCBieSByZW1vdmluZyB0aGUgc3RpY2t5IGNlbGwgQ1NTIGNsYXNzLCByZS1ldmFsdWF0aW5nXG4gICAqIHRoZSB6SW5kZXgsIHJlbW92aW5nIGVhY2ggb2YgdGhlIHByb3ZpZGVkIHN0aWNreSBkaXJlY3Rpb25zLCBhbmQgcmVtb3ZpbmcgdGhlXG4gICAqIHN0aWNreSBwb3NpdGlvbiBpZiB0aGVyZSBhcmUgbm8gbW9yZSBkaXJlY3Rpb25zLlxuICAgKi9cbiAgX3JlbW92ZVN0aWNreVN0eWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzdGlja3lEaXJlY3Rpb25zOiBTdGlja3lEaXJlY3Rpb25bXSkge1xuICAgIGZvciAoY29uc3QgZGlyIG9mIHN0aWNreURpcmVjdGlvbnMpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGVbZGlyXSA9ICcnO1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX2JvcmRlckNlbGxDc3NbZGlyXSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgbm8gbG9uZ2VyIGhhcyBhbnkgbW9yZSBzdGlja3kgZGlyZWN0aW9ucywgcmVtb3ZlIHN0aWNreSBwb3NpdGlvbmluZyBhbmRcbiAgICAvLyB0aGUgc3RpY2t5IENTUyBjbGFzcy5cbiAgICAvLyBTaG9ydC1jaXJjdWl0IGNoZWNraW5nIGVsZW1lbnQuc3R5bGVbZGlyXSBmb3Igc3RpY2t5RGlyZWN0aW9ucyBhcyB0aGV5XG4gICAgLy8gd2VyZSBhbHJlYWR5IHJlbW92ZWQgYWJvdmUuXG4gICAgY29uc3QgaGFzRGlyZWN0aW9uID0gU1RJQ0tZX0RJUkVDVElPTlMuc29tZShcbiAgICAgIGRpciA9PiBzdGlja3lEaXJlY3Rpb25zLmluZGV4T2YoZGlyKSA9PT0gLTEgJiYgZWxlbWVudC5zdHlsZVtkaXJdLFxuICAgICk7XG4gICAgaWYgKGhhc0RpcmVjdGlvbikge1xuICAgICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLl9nZXRDYWxjdWxhdGVkWkluZGV4KGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXaGVuIG5vdCBoYXNEaXJlY3Rpb24sIF9nZXRDYWxjdWxhdGVkWkluZGV4IHdpbGwgYWx3YXlzIHJldHVybiAnJy5cbiAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gJyc7XG4gICAgICBpZiAodGhpcy5fbmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJyc7XG4gICAgICB9XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fc3RpY2tDZWxsQ3NzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgc3RpY2t5IHN0eWxpbmcgdG8gdGhlIGVsZW1lbnQgYnkgYWRkaW5nIHRoZSBzdGlja3kgc3R5bGUgY2xhc3MsIGNoYW5naW5nIHBvc2l0aW9uXG4gICAqIHRvIGJlIHN0aWNreSAoYW5kIC13ZWJraXQtc3RpY2t5KSwgc2V0dGluZyB0aGUgYXBwcm9wcmlhdGUgekluZGV4LCBhbmQgYWRkaW5nIGEgc3RpY2t5XG4gICAqIGRpcmVjdGlvbiBhbmQgdmFsdWUuXG4gICAqL1xuICBfYWRkU3RpY2t5U3R5bGUoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgZGlyOiBTdGlja3lEaXJlY3Rpb24sXG4gICAgZGlyVmFsdWU6IG51bWJlcixcbiAgICBpc0JvcmRlckVsZW1lbnQ6IGJvb2xlYW4sXG4gICkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLl9zdGlja0NlbGxDc3MpO1xuICAgIGlmIChpc0JvcmRlckVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLl9ib3JkZXJDZWxsQ3NzW2Rpcl0pO1xuICAgIH1cbiAgICBlbGVtZW50LnN0eWxlW2Rpcl0gPSBgJHtkaXJWYWx1ZX1weGA7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLl9nZXRDYWxjdWxhdGVkWkluZGV4KGVsZW1lbnQpO1xuICAgIGlmICh0aGlzLl9uZWVkc1Bvc2l0aW9uU3RpY2t5T25FbGVtZW50KSB7XG4gICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgKz0gJ3Bvc2l0aW9uOiAtd2Via2l0LXN0aWNreTsgcG9zaXRpb246IHN0aWNreTsgJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHdoYXQgdGhlIHotaW5kZXggc2hvdWxkIGJlIGZvciB0aGUgZWxlbWVudCwgZGVwZW5kaW5nIG9uIHdoYXQgZGlyZWN0aW9ucyAodG9wLFxuICAgKiBib3R0b20sIGxlZnQsIHJpZ2h0KSBoYXZlIGJlZW4gc2V0LiBJdCBzaG91bGQgYmUgdHJ1ZSB0aGF0IGVsZW1lbnRzIHdpdGggYSB0b3AgZGlyZWN0aW9uXG4gICAqIHNob3VsZCBoYXZlIHRoZSBoaWdoZXN0IGluZGV4IHNpbmNlIHRoZXNlIGFyZSBlbGVtZW50cyBsaWtlIGEgdGFibGUgaGVhZGVyLiBJZiBhbnkgb2YgdGhvc2VcbiAgICogZWxlbWVudHMgYXJlIGFsc28gc3RpY2t5IGluIGFub3RoZXIgZGlyZWN0aW9uLCB0aGVuIHRoZXkgc2hvdWxkIGFwcGVhciBhYm92ZSBvdGhlciBlbGVtZW50c1xuICAgKiB0aGF0IGFyZSBvbmx5IHN0aWNreSB0b3AgKGUuZy4gYSBzdGlja3kgY29sdW1uIG9uIGEgc3RpY2t5IGhlYWRlcikuIEJvdHRvbS1zdGlja3kgZWxlbWVudHNcbiAgICogKGUuZy4gZm9vdGVyIHJvd3MpIHNob3VsZCB0aGVuIGJlIG5leHQgaW4gdGhlIG9yZGVyaW5nIHN1Y2ggdGhhdCB0aGV5IGFyZSBiZWxvdyB0aGUgaGVhZGVyXG4gICAqIGJ1dCBhYm92ZSBhbnkgbm9uLXN0aWNreSBlbGVtZW50cy4gRmluYWxseSwgbGVmdC9yaWdodCBzdGlja3kgZWxlbWVudHMgKGUuZy4gc3RpY2t5IGNvbHVtbnMpXG4gICAqIHNob3VsZCBtaW5pbWFsbHkgaW5jcmVtZW50IHNvIHRoYXQgdGhleSBhcmUgYWJvdmUgbm9uLXN0aWNreSBlbGVtZW50cyBidXQgYmVsb3cgdG9wIGFuZCBib3R0b21cbiAgICogZWxlbWVudHMuXG4gICAqL1xuICBfZ2V0Q2FsY3VsYXRlZFpJbmRleChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHN0cmluZyB7XG4gICAgY29uc3QgekluZGV4SW5jcmVtZW50cyA9IHtcbiAgICAgIHRvcDogMTAwLFxuICAgICAgYm90dG9tOiAxMCxcbiAgICAgIGxlZnQ6IDEsXG4gICAgICByaWdodDogMSxcbiAgICB9O1xuXG4gICAgbGV0IHpJbmRleCA9IDA7XG4gICAgLy8gVXNlIGBJdGVyYWJsZWAgaW5zdGVhZCBvZiBgQXJyYXlgIGJlY2F1c2UgVHlwZVNjcmlwdCwgYXMgb2YgMy42LjMsXG4gICAgLy8gbG9zZXMgdGhlIGFycmF5IGdlbmVyaWMgdHlwZSBpbiB0aGUgYGZvciBvZmAuIEJ1dCB3ZSAqYWxzbyogaGF2ZSB0byB1c2UgYEFycmF5YCBiZWNhdXNlXG4gICAgLy8gdHlwZXNjcmlwdCB3b24ndCBpdGVyYXRlIG92ZXIgYW4gYEl0ZXJhYmxlYCB1bmxlc3MgeW91IGNvbXBpbGUgd2l0aCBgLS1kb3dubGV2ZWxJdGVyYXRpb25gXG4gICAgZm9yIChjb25zdCBkaXIgb2YgU1RJQ0tZX0RJUkVDVElPTlMgYXMgSXRlcmFibGU8U3RpY2t5RGlyZWN0aW9uPiAmIFN0aWNreURpcmVjdGlvbltdKSB7XG4gICAgICBpZiAoZWxlbWVudC5zdHlsZVtkaXJdKSB7XG4gICAgICAgIHpJbmRleCArPSB6SW5kZXhJbmNyZW1lbnRzW2Rpcl07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHpJbmRleCA/IGAke3pJbmRleH1gIDogJyc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgd2lkdGhzIGZvciBlYWNoIGNlbGwgaW4gdGhlIHByb3ZpZGVkIHJvdy4gKi9cbiAgX2dldENlbGxXaWR0aHMocm93OiBIVE1MRWxlbWVudCwgcmVjYWxjdWxhdGVDZWxsV2lkdGhzID0gdHJ1ZSk6IG51bWJlcltdIHtcbiAgICBpZiAoIXJlY2FsY3VsYXRlQ2VsbFdpZHRocyAmJiB0aGlzLl9jYWNoZWRDZWxsV2lkdGhzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZENlbGxXaWR0aHM7XG4gICAgfVxuXG4gICAgY29uc3QgY2VsbFdpZHRoczogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBmaXJzdFJvd0NlbGxzID0gcm93LmNoaWxkcmVuO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlyc3RSb3dDZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2VsbCA9IGZpcnN0Um93Q2VsbHNbaV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICBjZWxsV2lkdGhzLnB1c2godGhpcy5fcmV0cmlldmVFbGVtZW50U2l6ZShjZWxsKS53aWR0aCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2FjaGVkQ2VsbFdpZHRocyA9IGNlbGxXaWR0aHM7XG4gICAgcmV0dXJuIGNlbGxXaWR0aHM7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB0aGUgbGVmdCBhbmQgcmlnaHQgcG9zaXRpb25zIG9mIGVhY2ggc3RpY2t5IGNvbHVtbiBjZWxsLCB3aGljaCB3aWxsIGJlIHRoZVxuICAgKiBhY2N1bXVsYXRpb24gb2YgYWxsIHN0aWNreSBjb2x1bW4gY2VsbCB3aWR0aHMgdG8gdGhlIGxlZnQgYW5kIHJpZ2h0LCByZXNwZWN0aXZlbHkuXG4gICAqIE5vbi1zdGlja3kgY2VsbHMgZG8gbm90IG5lZWQgdG8gaGF2ZSBhIHZhbHVlIHNldCBzaW5jZSB0aGVpciBwb3NpdGlvbnMgd2lsbCBub3QgYmUgYXBwbGllZC5cbiAgICovXG4gIF9nZXRTdGlja3lTdGFydENvbHVtblBvc2l0aW9ucyh3aWR0aHM6IG51bWJlcltdLCBzdGlja3lTdGF0ZXM6IGJvb2xlYW5bXSk6IG51bWJlcltdIHtcbiAgICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gICAgbGV0IG5leHRQb3NpdGlvbiA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdpZHRocy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0aWNreVN0YXRlc1tpXSkge1xuICAgICAgICBwb3NpdGlvbnNbaV0gPSBuZXh0UG9zaXRpb247XG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB3aWR0aHNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHRoZSBsZWZ0IGFuZCByaWdodCBwb3NpdGlvbnMgb2YgZWFjaCBzdGlja3kgY29sdW1uIGNlbGwsIHdoaWNoIHdpbGwgYmUgdGhlXG4gICAqIGFjY3VtdWxhdGlvbiBvZiBhbGwgc3RpY2t5IGNvbHVtbiBjZWxsIHdpZHRocyB0byB0aGUgbGVmdCBhbmQgcmlnaHQsIHJlc3BlY3RpdmVseS5cbiAgICogTm9uLXN0aWNreSBjZWxscyBkbyBub3QgbmVlZCB0byBoYXZlIGEgdmFsdWUgc2V0IHNpbmNlIHRoZWlyIHBvc2l0aW9ucyB3aWxsIG5vdCBiZSBhcHBsaWVkLlxuICAgKi9cbiAgX2dldFN0aWNreUVuZENvbHVtblBvc2l0aW9ucyh3aWR0aHM6IG51bWJlcltdLCBzdGlja3lTdGF0ZXM6IGJvb2xlYW5bXSk6IG51bWJlcltdIHtcbiAgICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gICAgbGV0IG5leHRQb3NpdGlvbiA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gd2lkdGhzLmxlbmd0aDsgaSA+IDA7IGktLSkge1xuICAgICAgaWYgKHN0aWNreVN0YXRlc1tpXSkge1xuICAgICAgICBwb3NpdGlvbnNbaV0gPSBuZXh0UG9zaXRpb247XG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB3aWR0aHNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyZWl2ZXMgdGhlIG1vc3QgcmVjZW50bHkgb2JzZXJ2ZWQgc2l6ZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgZnJvbSB0aGUgY2FjaGUsIG9yXG4gICAqIG1lYXVyZXMgaXQgZGlyZWN0bHkgaWYgbm90IHlldCBjYWNoZWQuXG4gICAqL1xuICBwcml2YXRlIF9yZXRyaWV2ZUVsZW1lbnRTaXplKGVsZW1lbnQ6IEhUTUxFbGVtZW50KToge3dpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyfSB7XG4gICAgY29uc3QgY2FjaGVkU2l6ZSA9IHRoaXMuX2VsZW1TaXplQ2FjaGUuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChjYWNoZWRTaXplKSB7XG4gICAgICByZXR1cm4gY2FjaGVkU2l6ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGllbnRSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBzaXplID0ge3dpZHRoOiBjbGllbnRSZWN0LndpZHRoLCBoZWlnaHQ6IGNsaWVudFJlY3QuaGVpZ2h0fTtcblxuICAgIGlmICghdGhpcy5fcmVzaXplT2JzZXJ2ZXIpIHtcbiAgICAgIHJldHVybiBzaXplO1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1TaXplQ2FjaGUuc2V0KGVsZW1lbnQsIHNpemUpO1xuICAgIHRoaXMuX3Jlc2l6ZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudCwge2JveDogJ2JvcmRlci1ib3gnfSk7XG4gICAgcmV0dXJuIHNpemU7XG4gIH1cblxuICAvKipcbiAgICogQ29uZGl0aW9uYWxseSBlbnF1ZXVlIHRoZSByZXF1ZXN0ZWQgc3RpY2t5IHVwZGF0ZSBhbmQgY2xlYXIgcHJldmlvdXNseSBxdWV1ZWQgdXBkYXRlc1xuICAgKiBmb3IgdGhlIHNhbWUgcm93cy5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZVN0aWNreUNvbHVtblJlcGxheVF1ZXVlKHBhcmFtczogVXBkYXRlU3RpY2t5Q29sdW1uc1BhcmFtcykge1xuICAgIHRoaXMuX3JlbW92ZUZyb21TdGlja3lDb2x1bW5SZXBsYXlRdWV1ZShwYXJhbXMucm93cyk7XG5cbiAgICAvLyBObyBuZWVkIHRvIHJlcGxheSBpZiBhIGZsdXNoIGlzIHBlbmRpbmcuXG4gICAgaWYgKHRoaXMuX3N0aWNreUNvbHVtbnNSZXBsYXlUaW1lb3V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlZFN0aWNreUNvbHVtbnNQYXJhbXNUb1JlcGxheS5wdXNoKHBhcmFtcyk7XG4gIH1cblxuICAvKiogUmVtb3ZlIHVwZGF0ZXMgZm9yIHRoZSBzcGVjaWZpZWQgcm93cyBmcm9tIHRoZSBxdWV1ZS4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlRnJvbVN0aWNreUNvbHVtblJlcGxheVF1ZXVlKHJvd3M6IEhUTUxFbGVtZW50W10pIHtcbiAgICBjb25zdCByb3dzU2V0ID0gbmV3IFNldChyb3dzKTtcbiAgICBmb3IgKGNvbnN0IHVwZGF0ZSBvZiB0aGlzLl91cGRhdGVkU3RpY2t5Q29sdW1uc1BhcmFtc1RvUmVwbGF5KSB7XG4gICAgICB1cGRhdGUucm93cyA9IHVwZGF0ZS5yb3dzLmZpbHRlcihyb3cgPT4gIXJvd3NTZXQuaGFzKHJvdykpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVkU3RpY2t5Q29sdW1uc1BhcmFtc1RvUmVwbGF5ID0gdGhpcy5fdXBkYXRlZFN0aWNreUNvbHVtbnNQYXJhbXNUb1JlcGxheS5maWx0ZXIoXG4gICAgICB1cGRhdGUgPT4gISF1cGRhdGUucm93cy5sZW5ndGgsXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgX2VsZW1TaXplQ2FjaGUgd2l0aCB0aGUgb2JzZXJ2ZWQgc2l6ZXMuICovXG4gIHByaXZhdGUgX3VwZGF0ZUNhY2hlZFNpemVzKGVudHJpZXM6IFJlc2l6ZU9ic2VydmVyRW50cnlbXSkge1xuICAgIGxldCBuZWVkc0NvbHVtblVwZGF0ZSA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgY29uc3QgbmV3RW50cnkgPSBlbnRyeS5ib3JkZXJCb3hTaXplPy5sZW5ndGhcbiAgICAgICAgPyB7XG4gICAgICAgICAgICB3aWR0aDogZW50cnkuYm9yZGVyQm94U2l6ZVswXS5pbmxpbmVTaXplLFxuICAgICAgICAgICAgaGVpZ2h0OiBlbnRyeS5ib3JkZXJCb3hTaXplWzBdLmJsb2NrU2l6ZSxcbiAgICAgICAgICB9XG4gICAgICAgIDoge1xuICAgICAgICAgICAgd2lkdGg6IGVudHJ5LmNvbnRlbnRSZWN0LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBlbnRyeS5jb250ZW50UmVjdC5oZWlnaHQsXG4gICAgICAgICAgfTtcblxuICAgICAgaWYgKFxuICAgICAgICBuZXdFbnRyeS53aWR0aCAhPT0gdGhpcy5fZWxlbVNpemVDYWNoZS5nZXQoZW50cnkudGFyZ2V0IGFzIEhUTUxFbGVtZW50KT8ud2lkdGggJiZcbiAgICAgICAgaXNDZWxsKGVudHJ5LnRhcmdldClcbiAgICAgICkge1xuICAgICAgICBuZWVkc0NvbHVtblVwZGF0ZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VsZW1TaXplQ2FjaGUuc2V0KGVudHJ5LnRhcmdldCBhcyBIVE1MRWxlbWVudCwgbmV3RW50cnkpO1xuICAgIH1cblxuICAgIGlmIChuZWVkc0NvbHVtblVwZGF0ZSAmJiB0aGlzLl91cGRhdGVkU3RpY2t5Q29sdW1uc1BhcmFtc1RvUmVwbGF5Lmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuX3N0aWNreUNvbHVtbnNSZXBsYXlUaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zdGlja3lDb2x1bW5zUmVwbGF5VGltZW91dCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3N0aWNreUNvbHVtbnNSZXBsYXlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgdXBkYXRlIG9mIHRoaXMuX3VwZGF0ZWRTdGlja3lDb2x1bW5zUGFyYW1zVG9SZXBsYXkpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0aWNreUNvbHVtbnMoXG4gICAgICAgICAgICB1cGRhdGUucm93cyxcbiAgICAgICAgICAgIHVwZGF0ZS5zdGlja3lTdGFydFN0YXRlcyxcbiAgICAgICAgICAgIHVwZGF0ZS5zdGlja3lFbmRTdGF0ZXMsXG4gICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVkU3RpY2t5Q29sdW1uc1BhcmFtc1RvUmVwbGF5ID0gW107XG4gICAgICAgIHRoaXMuX3N0aWNreUNvbHVtbnNSZXBsYXlUaW1lb3V0ID0gbnVsbDtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NlbGwoZWxlbWVudDogRWxlbWVudCkge1xuICByZXR1cm4gWydjZGstY2VsbCcsICdjZGstaGVhZGVyLWNlbGwnLCAnY2RrLWZvb3Rlci1jZWxsJ10uc29tZShrbGFzcyA9PlxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGtsYXNzKSxcbiAgKTtcbn1cbiJdfQ==