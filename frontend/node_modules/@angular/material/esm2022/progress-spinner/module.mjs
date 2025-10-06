/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatProgressSpinner, MatSpinner } from './progress-spinner';
import { CommonModule } from '@angular/common';
import * as i0 from "@angular/core";
export class MatProgressSpinnerModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatProgressSpinnerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatProgressSpinnerModule, imports: [CommonModule, MatProgressSpinner, MatSpinner], exports: [MatProgressSpinner, MatSpinner, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatProgressSpinnerModule, imports: [CommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatProgressSpinnerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, MatProgressSpinner, MatSpinner],
                    exports: [MatProgressSpinner, MatSpinner, MatCommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3Byb2dyZXNzLXNwaW5uZXIvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7O0FBTTdDLE1BQU0sT0FBTyx3QkFBd0I7cUhBQXhCLHdCQUF3QjtzSEFBeEIsd0JBQXdCLFlBSHpCLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxVQUFVLGFBQzVDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxlQUFlO3NIQUU5Qyx3QkFBd0IsWUFIekIsWUFBWSxFQUNvQixlQUFlOztrR0FFOUMsd0JBQXdCO2tCQUpwQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUM7b0JBQ3ZELE9BQU8sRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUM7aUJBQzNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtNYXRQcm9ncmVzc1NwaW5uZXIsIE1hdFNwaW5uZXJ9IGZyb20gJy4vcHJvZ3Jlc3Mtc3Bpbm5lcic7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgTWF0UHJvZ3Jlc3NTcGlubmVyLCBNYXRTcGlubmVyXSxcbiAgZXhwb3J0czogW01hdFByb2dyZXNzU3Bpbm5lciwgTWF0U3Bpbm5lciwgTWF0Q29tbW9uTW9kdWxlXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0UHJvZ3Jlc3NTcGlubmVyTW9kdWxlIHt9XG4iXX0=