/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatSortHeader } from './sort-header';
import { MatSort } from './sort';
import { MAT_SORT_HEADER_INTL_PROVIDER } from './sort-header-intl';
import { MatCommonModule } from '@angular/material/core';
import * as i0 from "@angular/core";
export class MatSortModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSortModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSortModule, imports: [MatCommonModule, MatSort, MatSortHeader], exports: [MatSort, MatSortHeader] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSortModule, providers: [MAT_SORT_HEADER_INTL_PROVIDER], imports: [MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSortModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, MatSort, MatSortHeader],
                    exports: [MatSort, MatSortHeader],
                    providers: [MAT_SORT_HEADER_INTL_PROVIDER],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc29ydC9zb3J0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMvQixPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNqRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7O0FBT3ZELE1BQU0sT0FBTyxhQUFhO3FIQUFiLGFBQWE7c0hBQWIsYUFBYSxZQUpkLGVBQWUsRUFBRSxPQUFPLEVBQUUsYUFBYSxhQUN2QyxPQUFPLEVBQUUsYUFBYTtzSEFHckIsYUFBYSxhQUZiLENBQUMsNkJBQTZCLENBQUMsWUFGaEMsZUFBZTs7a0dBSWQsYUFBYTtrQkFMekIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQztvQkFDbEQsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQztvQkFDakMsU0FBUyxFQUFFLENBQUMsNkJBQTZCLENBQUM7aUJBQzNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRTb3J0SGVhZGVyfSBmcm9tICcuL3NvcnQtaGVhZGVyJztcbmltcG9ydCB7TWF0U29ydH0gZnJvbSAnLi9zb3J0JztcbmltcG9ydCB7TUFUX1NPUlRfSEVBREVSX0lOVExfUFJPVklERVJ9IGZyb20gJy4vc29ydC1oZWFkZXItaW50bCc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtNYXRDb21tb25Nb2R1bGUsIE1hdFNvcnQsIE1hdFNvcnRIZWFkZXJdLFxuICBleHBvcnRzOiBbTWF0U29ydCwgTWF0U29ydEhlYWRlcl0sXG4gIHByb3ZpZGVyczogW01BVF9TT1JUX0hFQURFUl9JTlRMX1BST1ZJREVSXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U29ydE1vZHVsZSB7fVxuIl19