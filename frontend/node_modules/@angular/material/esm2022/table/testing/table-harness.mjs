/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate, parallel, } from '@angular/cdk/testing';
import { MatFooterRowHarness, MatHeaderRowHarness, MatRowHarness, } from './row-harness';
/** Harness for interacting with a mat-table in tests. */
export class MatTableHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._headerRowHarness = MatHeaderRowHarness;
        this._rowHarness = MatRowHarness;
        this._footerRowHarness = MatFooterRowHarness;
    }
    /** The selector for the host element of a `MatTableHarness` instance. */
    static { this.hostSelector = '.mat-mdc-table'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options);
    }
    /** Gets all the header rows in a table. */
    async getHeaderRows(filter = {}) {
        return this.locatorForAll(this._headerRowHarness.with(filter))();
    }
    /** Gets all the regular data rows in a table. */
    async getRows(filter = {}) {
        return this.locatorForAll(this._rowHarness.with(filter))();
    }
    /** Gets all the footer rows in a table. */
    async getFooterRows(filter = {}) {
        return this.locatorForAll(this._footerRowHarness.with(filter))();
    }
    /** Gets the text inside the entire table organized by rows. */
    async getCellTextByIndex() {
        const rows = await this.getRows();
        return parallel(() => rows.map(row => row.getCellTextByIndex()));
    }
    /** Gets the text inside the entire table organized by columns. */
    async getCellTextByColumnName() {
        const [headerRows, footerRows, dataRows] = await parallel(() => [
            this.getHeaderRows(),
            this.getFooterRows(),
            this.getRows(),
        ]);
        const text = {};
        const [headerData, footerData, rowsData] = await parallel(() => [
            parallel(() => headerRows.map(row => row.getCellTextByColumnName())),
            parallel(() => footerRows.map(row => row.getCellTextByColumnName())),
            parallel(() => dataRows.map(row => row.getCellTextByColumnName())),
        ]);
        rowsData.forEach(data => {
            Object.keys(data).forEach(columnName => {
                const cellText = data[columnName];
                if (!text[columnName]) {
                    text[columnName] = {
                        headerText: getCellTextsByColumn(headerData, columnName),
                        footerText: getCellTextsByColumn(footerData, columnName),
                        text: [],
                    };
                }
                text[columnName].text.push(cellText);
            });
        });
        return text;
    }
}
/** Extracts the text of cells only under a particular column. */
function getCellTextsByColumn(rowsData, column) {
    const columnTexts = [];
    rowsData.forEach(data => {
        Object.keys(data).forEach(columnName => {
            if (columnName === column) {
                columnTexts.push(data[columnName]);
            }
        });
    });
    return columnTexts;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJsZS90ZXN0aW5nL3RhYmxlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLGdDQUFnQyxFQUNoQyxnQkFBZ0IsRUFDaEIsUUFBUSxHQUNULE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixtQkFBbUIsRUFDbkIsYUFBYSxHQUVkLE1BQU0sZUFBZSxDQUFDO0FBWXZCLHlEQUF5RDtBQUN6RCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxnQ0FBd0M7SUFBN0U7O1FBR0Usc0JBQWlCLEdBQUcsbUJBQW1CLENBQUM7UUFDeEMsZ0JBQVcsR0FBRyxhQUFhLENBQUM7UUFDcEIsc0JBQWlCLEdBQUcsbUJBQW1CLENBQUM7SUFvRWxELENBQUM7SUF4RUMseUVBQXlFO2FBQ2xFLGlCQUFZLEdBQUcsZ0JBQWdCLEFBQW5CLENBQW9CO0lBS3ZDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUVULFVBQStCLEVBQUU7UUFFakMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBNEIsRUFBRTtRQUNoRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkUsQ0FBQztJQUVELGlEQUFpRDtJQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQTRCLEVBQUU7UUFDMUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUs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QUFDLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcyxcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgcGFyYWxsZWwsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7XG4gIE1hdEZvb3RlclJvd0hhcm5lc3MsXG4gIE1hdEhlYWRlclJvd0hhcm5lc3MsXG4gIE1hdFJvd0hhcm5lc3MsXG4gIE1hdFJvd0hhcm5lc3NDb2x1bW5zVGV4dCxcbn0gZnJvbSAnLi9yb3ctaGFybmVzcyc7XG5pbXBvcnQge1Jvd0hhcm5lc3NGaWx0ZXJzLCBUYWJsZUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3RhYmxlLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBUZXh0IGV4dHJhY3RlZCBmcm9tIGEgdGFibGUgb3JnYW5pemVkIGJ5IGNvbHVtbnMuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdFRhYmxlSGFybmVzc0NvbHVtbnNUZXh0IHtcbiAgW2NvbHVtbk5hbWU6IHN0cmluZ106IHtcbiAgICB0ZXh0OiBzdHJpbmdbXTtcbiAgICBoZWFkZXJUZXh0OiBzdHJpbmdbXTtcbiAgICBmb290ZXJUZXh0OiBzdHJpbmdbXTtcbiAgfTtcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBtYXQtdGFibGUgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0VGFibGVIYXJuZXNzIGV4dGVuZHMgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8c3RyaW5nPiB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0VGFibGVIYXJuZXNzYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy10YWJsZSc7XG4gIF9oZWFkZXJSb3dIYXJuZXNzID0gTWF0SGVhZGVyUm93SGFybmVzcztcbiAgX3Jvd0hhcm5lc3MgPSBNYXRSb3dIYXJuZXNzO1xuICBwcml2YXRlIF9mb290ZXJSb3dIYXJuZXNzID0gTWF0Rm9vdGVyUm93SGFybmVzcztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0YWJsZSB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGg8VCBleHRlbmRzIE1hdFRhYmxlSGFybmVzcz4oXG4gICAgdGhpczogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IFRhYmxlSGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIHRoZSBoZWFkZXIgcm93cyBpbiBhIHRhYmxlLiAqL1xuICBhc3luYyBnZXRIZWFkZXJSb3dzKGZpbHRlcjogUm93SGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8TWF0SGVhZGVyUm93SGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbCh0aGlzLl9oZWFkZXJSb3dIYXJuZXNzLndpdGgoZmlsdGVyKSkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCB0aGUgcmVndWxhciBkYXRhIHJvd3MgaW4gYSB0YWJsZS4gKi9cbiAgYXN5bmMgZ2V0Um93cyhmaWx0ZXI6IFJvd0hhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdFJvd0hhcm5lc3NbXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwodGhpcy5fcm93SGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgdGhlIGZvb3RlciByb3dzIGluIGEgdGFibGUuICovXG4gIGFzeW5jIGdldEZvb3RlclJvd3MoZmlsdGVyOiBSb3dIYXJuZXNzRmlsdGVycyA9IHt9KTogUHJvbWlzZTxNYXRGb290ZXJSb3dIYXJuZXNzW10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKHRoaXMuX2Zvb3RlclJvd0hhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgaW5zaWRlIHRoZSBlbnRpcmUgdGFibGUgb3JnYW5pemVkIGJ5IHJvd3MuICovXG4gIGFzeW5jIGdldENlbGxUZXh0QnlJbmRleCgpOiBQcm9taXNlPHN0cmluZ1tdW10+IHtcbiAgICBjb25zdCByb3dzID0gYXdhaXQgdGhpcy5nZXRSb3dzKCk7XG4gICAgcmV0dXJuIHBhcmFsbGVsKCgpID0+IHJvd3MubWFwKHJvdyA9PiByb3cuZ2V0Q2VsbFRleHRCeUluZGV4KCkpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0ZXh0IGluc2lkZSB0aGUgZW50aXJlIHRhYmxlIG9yZ2FuaXplZCBieSBjb2x1bW5zLiAqL1xuICBhc3luYyBnZXRDZWxsVGV4dEJ5Q29sdW1uTmFtZSgpOiBQcm9taXNlPE1hdFRhYmxlSGFybmVzc0NvbHVtbnNUZXh0PiB7XG4gICAgY29uc3QgW2hlYWRlclJvd3MsIGZvb3RlclJvd3MsIGRhdGFSb3dzXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFtcbiAgICAgIHRoaXMuZ2V0SGVhZGVyUm93cygpLFxuICAgICAgdGhpcy5nZXRGb290ZXJSb3dzKCksXG4gICAgICB0aGlzLmdldFJvd3MoKSxcbiAgICBdKTtcblxuICAgIGNvbnN0IHRleHQ6IE1hdFRhYmxlSGFybmVzc0NvbHVtbnNUZXh0ID0ge307XG4gICAgY29uc3QgW2hlYWRlckRhdGEsIGZvb3RlckRhdGEsIHJvd3NEYXRhXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFtcbiAgICAgIHBhcmFsbGVsKCgpID0+IGhlYWRlclJvd3MubWFwKHJvdyA9PiByb3cuZ2V0Q2VsbFRleHRCeUNvbHVtbk5hbWUoKSkpLFxuICAgICAgcGFyYWxsZWwoKCkgPT4gZm9vdGVyUm93cy5tYXAocm93ID0+IHJvdy5nZXRDZWxsVGV4dEJ5Q29sdW1uTmFtZSgpKSksXG4gICAgICBwYXJhbGxlbCgoKSA9PiBkYXRhUm93cy5tYXAocm93ID0+IHJvdy5nZXRDZWxsVGV4dEJ5Q29sdW1uTmFtZSgpKSksXG4gICAgXSk7XG5cbiAgICByb3dzRGF0YS5mb3JFYWNoKGRhdGEgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChjb2x1bW5OYW1lID0+IHtcbiAgICAgICAgY29uc3QgY2VsbFRleHQgPSBkYXRhW2NvbHVtbk5hbWVdO1xuXG4gICAgICAgIGlmICghdGV4dFtjb2x1bW5OYW1lXSkge1xuICAgICAgICAgIHRleHRbY29sdW1uTmFtZV0gPSB7XG4gICAgICAgICAgICBoZWFkZXJUZXh0OiBnZXRDZWxsVGV4dHNCeUNvbHVtbihoZWFkZXJEYXRhLCBjb2x1bW5OYW1lKSxcbiAgICAgICAgICAgIGZvb3RlclRleHQ6IGdldENlbGxUZXh0c0J5Q29sdW1uKGZvb3RlckRhdGEsIGNvbHVtbk5hbWUpLFxuICAgICAgICAgICAgdGV4dDogW10sXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHRbY29sdW1uTmFtZV0udGV4dC5wdXNoKGNlbGxUZXh0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbn1cblxuLyoqIEV4dHJhY3RzIHRoZSB0ZXh0IG9mIGNlbGxzIG9ubHkgdW5kZXIgYSBwYXJ0aWN1bGFyIGNvbHVtbi4gKi9cbmZ1bmN0aW9uIGdldENlbGxUZXh0c0J5Q29sdW1uKHJvd3NEYXRhOiBNYXRSb3dIYXJuZXNzQ29sdW1uc1RleHRbXSwgY29sdW1uOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGNvbHVtblRleHRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHJvd3NEYXRhLmZvckVhY2goZGF0YSA9PiB7XG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChjb2x1bW5OYW1lID0+IHtcbiAgICAgIGlmIChjb2x1bW5OYW1lID09PSBjb2x1bW4pIHtcbiAgICAgICAgY29sdW1uVGV4dHMucHVzaChkYXRhW2NvbHVtbk5hbWVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbHVtblRleHRzO1xufVxuIl19