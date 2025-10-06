/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatRecycleRows, MatTable } from './table';
import { CdkTableModule } from '@angular/cdk/table';
import { MatCell, MatCellDef, MatColumnDef, MatFooterCell, MatFooterCellDef, MatHeaderCell, MatHeaderCellDef, } from './cell';
import { MatFooterRow, MatFooterRowDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow, } from './row';
import { MatTextColumn } from './text-column';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [
    // Table
    MatTable,
    MatRecycleRows,
    // Template defs
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatColumnDef,
    MatCellDef,
    MatRowDef,
    MatFooterCellDef,
    MatFooterRowDef,
    // Cell directives
    MatHeaderCell,
    MatCell,
    MatFooterCell,
    // Row directives
    MatHeaderRow,
    MatRow,
    MatFooterRow,
    MatNoDataRow,
    MatTextColumn,
];
export class MatTableModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTableModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTableModule, imports: [MatCommonModule, CdkTableModule, 
            // Table
            MatTable,
            MatRecycleRows,
            // Template defs
            MatHeaderCellDef,
            MatHeaderRowDef,
            MatColumnDef,
            MatCellDef,
            MatRowDef,
            MatFooterCellDef,
            MatFooterRowDef,
            // Cell directives
            MatHeaderCell,
            MatCell,
            MatFooterCell,
            // Row directives
            MatHeaderRow,
            MatRow,
            MatFooterRow,
            MatNoDataRow,
            MatTextColumn], exports: [MatCommonModule, 
            // Table
            MatTable,
            MatRecycleRows,
            // Template defs
            MatHeaderCellDef,
            MatHeaderRowDef,
            MatColumnDef,
            MatCellDef,
            MatRowDef,
            MatFooterCellDef,
            MatFooterRowDef,
            // Cell directives
            MatHeaderCell,
            MatCell,
            MatFooterCell,
            // Row directives
            MatHeaderRow,
            MatRow,
            MatFooterRow,
            MatNoDataRow,
            MatTextColumn] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTableModule, imports: [MatCommonModule, CdkTableModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTableModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, CdkTableModule, ...EXPORTED_DECLARATIONS],
                    exports: [MatCommonModule, EXPORTED_DECLARATIONS],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYmxlL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUNMLE9BQU8sRUFDUCxVQUFVLEVBQ1YsWUFBWSxFQUNaLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLGdCQUFnQixHQUNqQixNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQ0wsWUFBWSxFQUNaLGVBQWUsRUFDZixZQUFZLEVBQ1osZUFBZSxFQUNmLE1BQU0sRUFDTixTQUFTLEVBQ1QsWUFBWSxHQUNiLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFNUMsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixRQUFRO0lBQ1IsUUFBUTtJQUNSLGNBQWM7SUFFZCxnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGVBQWU7SUFDZixZQUFZO0lBQ1osVUFBVTtJQUNWLFNBQVM7SUFDVCxnQkFBZ0I7SUFDaEIsZUFBZTtJQUVmLGtCQUFrQjtJQUNsQixhQUFhO0lBQ2IsT0FBTztJQUNQLGFBQWE7SUFFYixpQkFBaUI7SUFDakIsWUFBWTtJQUNaLE1BQU07SUFDTixZQUFZO0lBQ1osWUFBWTtJQUVaLGFBQWE7Q0FDZCxDQUFDO0FBTUYsTUFBTSxPQUFPLGNBQWM7cUhBQWQsY0FBYztzSEFBZCxjQUFjLFlBSGYsZUFBZSxFQUFFLGNBQWM7WUE1QnpDLFFBQVE7WUFDUixRQUFRO1lBQ1IsY0FBYztZQUVkLGdCQUFnQjtZQUNoQixnQkFBZ0I7WUFDaEIsZUFBZTtZQUNmLFlBQVk7WUFDWixVQUFVO1lBQ1YsU0FBUztZQUNULGdCQUFnQjtZQUNoQixlQUFlO1lBRWYsa0JBQWtCO1lBQ2xCLGFBQWE7WUFDYixPQUFPO1lBQ1AsYUFBYTtZQUViLGlCQUFpQjtZQUNqQixZQUFZO1lBQ1osTUFBTTtZQUNOLFlBQVk7WUFDWixZQUFZO1lBRVosYUFBYSxhQUtILGVBQWU7WUE3QnpCLFFBQVE7WUFDUixRQUFRO1lBQ1IsY0FBYztZQUVkLGdCQUFnQjtZQUNoQixnQkFBZ0I7WUFDaEIsZUFBZTtZQUNmLFlBQVk7WUFDWixVQUFVO1lBQ1YsU0FBUztZQUNULGdCQUFnQjtZQUNoQixlQUFlO1lBRWYsa0JBQWtCO1lBQ2xCLGFBQWE7WUFDYixPQUFPO1lBQ1AsYUFBYTtZQUViLGlCQUFpQjtZQUNqQixZQUFZO1lBQ1osTUFBTTtZQUNOLFlBQVk7WUFDWixZQUFZO1lBRVosYUFBYTtzSEFPRixjQUFjLFlBSGYsZUFBZSxFQUFFLGNBQWMsRUFDL0IsZUFBZTs7a0dBRWQsY0FBYztrQkFKMUIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLEdBQUcscUJBQXFCLENBQUM7b0JBQ3BFLE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQztpQkFDbEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdFJlY3ljbGVSb3dzLCBNYXRUYWJsZX0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQge0Nka1RhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtcbiAgTWF0Q2VsbCxcbiAgTWF0Q2VsbERlZixcbiAgTWF0Q29sdW1uRGVmLFxuICBNYXRGb290ZXJDZWxsLFxuICBNYXRGb290ZXJDZWxsRGVmLFxuICBNYXRIZWFkZXJDZWxsLFxuICBNYXRIZWFkZXJDZWxsRGVmLFxufSBmcm9tICcuL2NlbGwnO1xuaW1wb3J0IHtcbiAgTWF0Rm9vdGVyUm93LFxuICBNYXRGb290ZXJSb3dEZWYsXG4gIE1hdEhlYWRlclJvdyxcbiAgTWF0SGVhZGVyUm93RGVmLFxuICBNYXRSb3csXG4gIE1hdFJvd0RlZixcbiAgTWF0Tm9EYXRhUm93LFxufSBmcm9tICcuL3Jvdyc7XG5pbXBvcnQge01hdFRleHRDb2x1bW59IGZyb20gJy4vdGV4dC1jb2x1bW4nO1xuXG5jb25zdCBFWFBPUlRFRF9ERUNMQVJBVElPTlMgPSBbXG4gIC8vIFRhYmxlXG4gIE1hdFRhYmxlLFxuICBNYXRSZWN5Y2xlUm93cyxcblxuICAvLyBUZW1wbGF0ZSBkZWZzXG4gIE1hdEhlYWRlckNlbGxEZWYsXG4gIE1hdEhlYWRlclJvd0RlZixcbiAgTWF0Q29sdW1uRGVmLFxuICBNYXRDZWxsRGVmLFxuICBNYXRSb3dEZWYsXG4gIE1hdEZvb3RlckNlbGxEZWYsXG4gIE1hdEZvb3RlclJvd0RlZixcblxuICAvLyBDZWxsIGRpcmVjdGl2ZXNcbiAgTWF0SGVhZGVyQ2VsbCxcbiAgTWF0Q2VsbCxcbiAgTWF0Rm9vdGVyQ2VsbCxcblxuICAvLyBSb3cgZGlyZWN0aXZlc1xuICBNYXRIZWFkZXJSb3csXG4gIE1hdFJvdyxcbiAgTWF0Rm9vdGVyUm93LFxuICBNYXROb0RhdGFSb3csXG5cbiAgTWF0VGV4dENvbHVtbixcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtNYXRDb21tb25Nb2R1bGUsIENka1RhYmxlTW9kdWxlLCAuLi5FWFBPUlRFRF9ERUNMQVJBVElPTlNdLFxuICBleHBvcnRzOiBbTWF0Q29tbW9uTW9kdWxlLCBFWFBPUlRFRF9ERUNMQVJBVElPTlNdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUYWJsZU1vZHVsZSB7fVxuIl19