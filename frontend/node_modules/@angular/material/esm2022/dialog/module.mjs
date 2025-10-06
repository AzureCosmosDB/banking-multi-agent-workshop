/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DialogModule } from '@angular/cdk/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatDialog } from './dialog';
import { MatDialogContainer } from './dialog-container';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from './dialog-content-directives';
import * as i0 from "@angular/core";
const DIRECTIVES = [
    MatDialogContainer,
    MatDialogClose,
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
];
export class MatDialogModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogModule, imports: [DialogModule, OverlayModule, PortalModule, MatCommonModule, MatDialogContainer,
            MatDialogClose,
            MatDialogTitle,
            MatDialogActions,
            MatDialogContent], exports: [MatCommonModule, MatDialogContainer,
            MatDialogClose,
            MatDialogTitle,
            MatDialogActions,
            MatDialogContent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogModule, providers: [MatDialog], imports: [DialogModule, OverlayModule, PortalModule, MatCommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [DialogModule, OverlayModule, PortalModule, MatCommonModule, ...DIRECTIVES],
                    exports: [MatCommonModule, ...DIRECTIVES],
                    providers: [MatDialog],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RpYWxvZy9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGNBQWMsRUFDZCxnQkFBZ0IsRUFDaEIsY0FBYyxHQUNmLE1BQU0sNkJBQTZCLENBQUM7O0FBRXJDLE1BQU0sVUFBVSxHQUFHO0lBQ2pCLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsY0FBYztJQUNkLGdCQUFnQjtJQUNoQixnQkFBZ0I7Q0FDakIsQ0FBQztBQU9GLE1BQU0sT0FBTyxlQUFlO3FIQUFmLGVBQWU7c0hBQWYsZUFBZSxZQUpoQixZQUFZLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBUnBFLGtCQUFrQjtZQUNsQixjQUFjO1lBQ2QsY0FBYztZQUNkLGdCQUFnQjtZQUNoQixnQkFBZ0IsYUFLTixlQUFlLEVBVHpCLGtCQUFrQjtZQUNsQixjQUFjO1lBQ2QsY0FBYztZQUNkLGdCQUFnQjtZQUNoQixnQkFBZ0I7c0hBUUwsZUFBZSxhQUZmLENBQUMsU0FBUyxDQUFDLFlBRlosWUFBWSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUMxRCxlQUFlOztrR0FHZCxlQUFlO2tCQUwzQixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxHQUFHLFVBQVUsQ0FBQztvQkFDcEYsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLEdBQUcsVUFBVSxDQUFDO29CQUN6QyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUM7aUJBQ3ZCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlhbG9nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvZGlhbG9nJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtQb3J0YWxNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdERpYWxvZ30gZnJvbSAnLi9kaWFsb2cnO1xuaW1wb3J0IHtNYXREaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5pbXBvcnQge1xuICBNYXREaWFsb2dBY3Rpb25zLFxuICBNYXREaWFsb2dDbG9zZSxcbiAgTWF0RGlhbG9nQ29udGVudCxcbiAgTWF0RGlhbG9nVGl0bGUsXG59IGZyb20gJy4vZGlhbG9nLWNvbnRlbnQtZGlyZWN0aXZlcyc7XG5cbmNvbnN0IERJUkVDVElWRVMgPSBbXG4gIE1hdERpYWxvZ0NvbnRhaW5lcixcbiAgTWF0RGlhbG9nQ2xvc2UsXG4gIE1hdERpYWxvZ1RpdGxlLFxuICBNYXREaWFsb2dBY3Rpb25zLFxuICBNYXREaWFsb2dDb250ZW50LFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0RpYWxvZ01vZHVsZSwgT3ZlcmxheU1vZHVsZSwgUG9ydGFsTW9kdWxlLCBNYXRDb21tb25Nb2R1bGUsIC4uLkRJUkVDVElWRVNdLFxuICBleHBvcnRzOiBbTWF0Q29tbW9uTW9kdWxlLCAuLi5ESVJFQ1RJVkVTXSxcbiAgcHJvdmlkZXJzOiBbTWF0RGlhbG9nXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGlhbG9nTW9kdWxlIHt9XG4iXX0=