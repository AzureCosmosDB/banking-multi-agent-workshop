/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { SimpleSnackBar } from './simple-snack-bar';
import { MatSnackBarContainer } from './snack-bar-container';
import { MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel } from './snack-bar-content';
import { MatSnackBar } from './snack-bar';
import * as i0 from "@angular/core";
const DIRECTIVES = [MatSnackBarContainer, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction];
export class MatSnackBarModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBarModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBarModule, imports: [OverlayModule,
            PortalModule,
            MatButtonModule,
            MatCommonModule,
            SimpleSnackBar, MatSnackBarContainer, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction], exports: [MatCommonModule, MatSnackBarContainer, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBarModule, providers: [MatSnackBar], imports: [OverlayModule,
            PortalModule,
            MatButtonModule,
            MatCommonModule,
            SimpleSnackBar, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBarModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        OverlayModule,
                        PortalModule,
                        MatButtonModule,
                        MatCommonModule,
                        SimpleSnackBar,
                        ...DIRECTIVES,
                    ],
                    exports: [MatCommonModule, ...DIRECTIVES],
                    providers: [MatSnackBar],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NuYWNrLWJhci9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFdkQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzNELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzVGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7O0FBRXhDLE1BQU0sVUFBVSxHQUFHLENBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQWNuRyxNQUFNLE9BQU8saUJBQWlCO3FIQUFqQixpQkFBaUI7c0hBQWpCLGlCQUFpQixZQVYxQixhQUFhO1lBQ2IsWUFBWTtZQUNaLGVBQWU7WUFDZixlQUFlO1lBQ2YsY0FBYyxFQVJFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixhQVdyRixlQUFlLEVBWFAsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCO3NIQWNwRixpQkFBaUIsYUFGakIsQ0FBQyxXQUFXLENBQUMsWUFSdEIsYUFBYTtZQUNiLFlBQVk7WUFDWixlQUFlO1lBQ2YsZUFBZTtZQUNmLGNBQWMsRUFHTixlQUFlOztrR0FHZCxpQkFBaUI7a0JBWjdCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLGFBQWE7d0JBQ2IsWUFBWTt3QkFDWixlQUFlO3dCQUNmLGVBQWU7d0JBQ2YsY0FBYzt3QkFDZCxHQUFHLFVBQVU7cUJBQ2Q7b0JBQ0QsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLEdBQUcsVUFBVSxDQUFDO29CQUN6QyxTQUFTLEVBQUUsQ0FBQyxXQUFXLENBQUM7aUJBQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtQb3J0YWxNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEJ1dHRvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcblxuaW1wb3J0IHtTaW1wbGVTbmFja0Jhcn0gZnJvbSAnLi9zaW1wbGUtc25hY2stYmFyJztcbmltcG9ydCB7TWF0U25hY2tCYXJDb250YWluZXJ9IGZyb20gJy4vc25hY2stYmFyLWNvbnRhaW5lcic7XG5pbXBvcnQge01hdFNuYWNrQmFyQWN0aW9uLCBNYXRTbmFja0JhckFjdGlvbnMsIE1hdFNuYWNrQmFyTGFiZWx9IGZyb20gJy4vc25hY2stYmFyLWNvbnRlbnQnO1xuaW1wb3J0IHtNYXRTbmFja0Jhcn0gZnJvbSAnLi9zbmFjay1iYXInO1xuXG5jb25zdCBESVJFQ1RJVkVTID0gW01hdFNuYWNrQmFyQ29udGFpbmVyLCBNYXRTbmFja0JhckxhYmVsLCBNYXRTbmFja0JhckFjdGlvbnMsIE1hdFNuYWNrQmFyQWN0aW9uXTtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIE92ZXJsYXlNb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIE1hdEJ1dHRvbk1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgU2ltcGxlU25hY2tCYXIsXG4gICAgLi4uRElSRUNUSVZFUyxcbiAgXSxcbiAgZXhwb3J0czogW01hdENvbW1vbk1vZHVsZSwgLi4uRElSRUNUSVZFU10sXG4gIHByb3ZpZGVyczogW01hdFNuYWNrQmFyXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U25hY2tCYXJNb2R1bGUge31cbiJdfQ==