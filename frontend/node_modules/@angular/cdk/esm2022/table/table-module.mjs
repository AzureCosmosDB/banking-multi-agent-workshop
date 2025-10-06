/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { HeaderRowOutlet, DataRowOutlet, CdkTable, CdkRecycleRows, FooterRowOutlet, NoDataRowOutlet, } from './table';
import { CdkCellOutlet, CdkFooterRow, CdkFooterRowDef, CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef, CdkNoDataRow, } from './row';
import { CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCell, CdkCellDef, CdkFooterCellDef, CdkFooterCell, } from './cell';
import { CdkTextColumn } from './text-column';
import { ScrollingModule } from '@angular/cdk/scrolling';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [
    CdkTable,
    CdkRowDef,
    CdkCellDef,
    CdkCellOutlet,
    CdkHeaderCellDef,
    CdkFooterCellDef,
    CdkColumnDef,
    CdkCell,
    CdkRow,
    CdkHeaderCell,
    CdkFooterCell,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkFooterRow,
    CdkFooterRowDef,
    DataRowOutlet,
    HeaderRowOutlet,
    FooterRowOutlet,
    CdkTextColumn,
    CdkNoDataRow,
    CdkRecycleRows,
    NoDataRowOutlet,
];
export class CdkTableModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTableModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTableModule, imports: [ScrollingModule, CdkTable,
            CdkRowDef,
            CdkCellDef,
            CdkCellOutlet,
            CdkHeaderCellDef,
            CdkFooterCellDef,
            CdkColumnDef,
            CdkCell,
            CdkRow,
            CdkHeaderCell,
            CdkFooterCell,
            CdkHeaderRow,
            CdkHeaderRowDef,
            CdkFooterRow,
            CdkFooterRowDef,
            DataRowOutlet,
            HeaderRowOutlet,
            FooterRowOutlet,
            CdkTextColumn,
            CdkNoDataRow,
            CdkRecycleRows,
            NoDataRowOutlet], exports: [CdkTable,
            CdkRowDef,
            CdkCellDef,
            CdkCellOutlet,
            CdkHeaderCellDef,
            CdkFooterCellDef,
            CdkColumnDef,
            CdkCell,
            CdkRow,
            CdkHeaderCell,
            CdkFooterCell,
            CdkHeaderRow,
            CdkHeaderRowDef,
            CdkFooterRow,
            CdkFooterRowDef,
            DataRowOutlet,
            HeaderRowOutlet,
            FooterRowOutlet,
            CdkTextColumn,
            CdkNoDataRow,
            CdkRecycleRows,
            NoDataRowOutlet] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTableModule, imports: [ScrollingModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTableModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: EXPORTED_DECLARATIONS,
                    imports: [ScrollingModule, ...EXPORTED_DECLARATIONS],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90YWJsZS90YWJsZS1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixRQUFRLEVBQ1IsY0FBYyxFQUNkLGVBQWUsRUFDZixlQUFlLEdBQ2hCLE1BQU0sU0FBUyxDQUFDO0FBQ2pCLE9BQU8sRUFDTCxhQUFhLEVBQ2IsWUFBWSxFQUNaLGVBQWUsRUFDZixZQUFZLEVBQ1osZUFBZSxFQUNmLE1BQU0sRUFDTixTQUFTLEVBQ1QsWUFBWSxHQUNiLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUNMLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLE9BQU8sRUFDUCxVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLGFBQWEsR0FDZCxNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQzs7QUFFdkQsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixRQUFRO0lBQ1IsU0FBUztJQUNULFVBQVU7SUFDVixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixZQUFZO0lBQ1osT0FBTztJQUNQLE1BQU07SUFDTixhQUFhO0lBQ2IsYUFBYTtJQUNiLFlBQVk7SUFDWixlQUFlO0lBQ2YsWUFBWTtJQUNaLGVBQWU7SUFDZixhQUFhO0lBQ2IsZUFBZTtJQUNmLGVBQWU7SUFDZixhQUFhO0lBQ2IsWUFBWTtJQUNaLGNBQWM7SUFDZCxlQUFlO0NBQ2hCLENBQUM7QUFNRixNQUFNLE9BQU8sY0FBYztxSEFBZCxjQUFjO3NIQUFkLGNBQWMsWUFGZixlQUFlLEVBMUJ6QixRQUFRO1lBQ1IsU0FBUztZQUNULFVBQVU7WUFDVixhQUFhO1lBQ2IsZ0JBQWdCO1lBQ2hCLGdCQUFnQjtZQUNoQixZQUFZO1lBQ1osT0FBTztZQUNQLE1BQU07WUFDTixhQUFhO1lBQ2IsYUFBYTtZQUNiLFlBQVk7WUFDWixlQUFlO1lBQ2YsWUFBWTtZQUNaLGVBQWU7WUFDZixhQUFhO1lBQ2IsZUFBZTtZQUNmLGVBQWU7WUFDZixhQUFhO1lBQ2IsWUFBWTtZQUNaLGNBQWM7WUFDZCxlQUFlLGFBckJmLFFBQVE7WUFDUixTQUFTO1lBQ1QsVUFBVTtZQUNWLGFBQWE7WUFDYixnQkFBZ0I7WUFDaEIsZ0JBQWdCO1lBQ2hCLFlBQVk7WUFDWixPQUFPO1lBQ1AsTUFBTTtZQUNOLGFBQWE7WUFDYixhQUFhO1lBQ2IsWUFBWTtZQUNaLGVBQWU7WUFDZixZQUFZO1lBQ1osZUFBZTtZQUNmLGFBQWE7WUFDYixlQUFlO1lBQ2YsZUFBZTtZQUNmLGFBQWE7WUFDYixZQUFZO1lBQ1osY0FBYztZQUNkLGVBQWU7c0hBT0osY0FBYyxZQUZmLGVBQWU7O2tHQUVkLGNBQWM7a0JBSjFCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtvQkFDOUIsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLEdBQUcscUJBQXFCLENBQUM7aUJBQ3JEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgSGVhZGVyUm93T3V0bGV0LFxuICBEYXRhUm93T3V0bGV0LFxuICBDZGtUYWJsZSxcbiAgQ2RrUmVjeWNsZVJvd3MsXG4gIEZvb3RlclJvd091dGxldCxcbiAgTm9EYXRhUm93T3V0bGV0LFxufSBmcm9tICcuL3RhYmxlJztcbmltcG9ydCB7XG4gIENka0NlbGxPdXRsZXQsXG4gIENka0Zvb3RlclJvdyxcbiAgQ2RrRm9vdGVyUm93RGVmLFxuICBDZGtIZWFkZXJSb3csXG4gIENka0hlYWRlclJvd0RlZixcbiAgQ2RrUm93LFxuICBDZGtSb3dEZWYsXG4gIENka05vRGF0YVJvdyxcbn0gZnJvbSAnLi9yb3cnO1xuaW1wb3J0IHtcbiAgQ2RrQ29sdW1uRGVmLFxuICBDZGtIZWFkZXJDZWxsRGVmLFxuICBDZGtIZWFkZXJDZWxsLFxuICBDZGtDZWxsLFxuICBDZGtDZWxsRGVmLFxuICBDZGtGb290ZXJDZWxsRGVmLFxuICBDZGtGb290ZXJDZWxsLFxufSBmcm9tICcuL2NlbGwnO1xuaW1wb3J0IHtDZGtUZXh0Q29sdW1ufSBmcm9tICcuL3RleHQtY29sdW1uJztcbmltcG9ydCB7U2Nyb2xsaW5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcblxuY29uc3QgRVhQT1JURURfREVDTEFSQVRJT05TID0gW1xuICBDZGtUYWJsZSxcbiAgQ2RrUm93RGVmLFxuICBDZGtDZWxsRGVmLFxuICBDZGtDZWxsT3V0bGV0LFxuICBDZGtIZWFkZXJDZWxsRGVmLFxuICBDZGtGb290ZXJDZWxsRGVmLFxuICBDZGtDb2x1bW5EZWYsXG4gIENka0NlbGwsXG4gIENka1JvdyxcbiAgQ2RrSGVhZGVyQ2VsbCxcbiAgQ2RrRm9vdGVyQ2VsbCxcbiAgQ2RrSGVhZGVyUm93LFxuICBDZGtIZWFkZXJSb3dEZWYsXG4gIENka0Zvb3RlclJvdyxcbiAgQ2RrRm9vdGVyUm93RGVmLFxuICBEYXRhUm93T3V0bGV0LFxuICBIZWFkZXJSb3dPdXRsZXQsXG4gIEZvb3RlclJvd091dGxldCxcbiAgQ2RrVGV4dENvbHVtbixcbiAgQ2RrTm9EYXRhUm93LFxuICBDZGtSZWN5Y2xlUm93cyxcbiAgTm9EYXRhUm93T3V0bGV0LFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgZXhwb3J0czogRVhQT1JURURfREVDTEFSQVRJT05TLFxuICBpbXBvcnRzOiBbU2Nyb2xsaW5nTW9kdWxlLCAuLi5FWFBPUlRFRF9ERUNMQVJBVElPTlNdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZU1vZHVsZSB7fVxuIl19