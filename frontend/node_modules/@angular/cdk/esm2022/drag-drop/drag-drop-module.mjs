/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CdkDropList } from './directives/drop-list';
import { CdkDropListGroup } from './directives/drop-list-group';
import { CdkDrag } from './directives/drag';
import { CdkDragHandle } from './directives/drag-handle';
import { CdkDragPreview } from './directives/drag-preview';
import { CdkDragPlaceholder } from './directives/drag-placeholder';
import { DragDrop } from './drag-drop';
import * as i0 from "@angular/core";
const DRAG_DROP_DIRECTIVES = [
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
];
export class DragDropModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, imports: [CdkDropList,
            CdkDropListGroup,
            CdkDrag,
            CdkDragHandle,
            CdkDragPreview,
            CdkDragPlaceholder], exports: [CdkScrollableModule, CdkDropList,
            CdkDropListGroup,
            CdkDrag,
            CdkDragHandle,
            CdkDragPreview,
            CdkDragPlaceholder] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, providers: [DragDrop], imports: [CdkScrollableModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: DRAG_DROP_DIRECTIVES,
                    exports: [CdkScrollableModule, ...DRAG_DROP_DIRECTIVES],
                    providers: [DragDrop],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RyYWctZHJvcC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFFckMsTUFBTSxvQkFBb0IsR0FBRztJQUMzQixXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLE9BQU87SUFDUCxhQUFhO0lBQ2IsY0FBYztJQUNkLGtCQUFrQjtDQUNuQixDQUFDO0FBT0YsTUFBTSxPQUFPLGNBQWM7cUhBQWQsY0FBYztzSEFBZCxjQUFjLFlBYnpCLFdBQVc7WUFDWCxnQkFBZ0I7WUFDaEIsT0FBTztZQUNQLGFBQWE7WUFDYixjQUFjO1lBQ2Qsa0JBQWtCLGFBS1IsbUJBQW1CLEVBVjdCLFdBQVc7WUFDWCxnQkFBZ0I7WUFDaEIsT0FBTztZQUNQLGFBQWE7WUFDYixjQUFjO1lBQ2Qsa0JBQWtCO3NIQVFQLGNBQWMsYUFGZCxDQUFDLFFBQVEsQ0FBQyxZQURYLG1CQUFtQjs7a0dBR2xCLGNBQWM7a0JBTDFCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLG9CQUFvQjtvQkFDN0IsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQztvQkFDdkQsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO2lCQUN0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge0Nka0Ryb3BMaXN0fSBmcm9tICcuL2RpcmVjdGl2ZXMvZHJvcC1saXN0JztcbmltcG9ydCB7Q2RrRHJvcExpc3RHcm91cH0gZnJvbSAnLi9kaXJlY3RpdmVzL2Ryb3AtbGlzdC1ncm91cCc7XG5pbXBvcnQge0Nka0RyYWd9IGZyb20gJy4vZGlyZWN0aXZlcy9kcmFnJztcbmltcG9ydCB7Q2RrRHJhZ0hhbmRsZX0gZnJvbSAnLi9kaXJlY3RpdmVzL2RyYWctaGFuZGxlJztcbmltcG9ydCB7Q2RrRHJhZ1ByZXZpZXd9IGZyb20gJy4vZGlyZWN0aXZlcy9kcmFnLXByZXZpZXcnO1xuaW1wb3J0IHtDZGtEcmFnUGxhY2Vob2xkZXJ9IGZyb20gJy4vZGlyZWN0aXZlcy9kcmFnLXBsYWNlaG9sZGVyJztcbmltcG9ydCB7RHJhZ0Ryb3B9IGZyb20gJy4vZHJhZy1kcm9wJztcblxuY29uc3QgRFJBR19EUk9QX0RJUkVDVElWRVMgPSBbXG4gIENka0Ryb3BMaXN0LFxuICBDZGtEcm9wTGlzdEdyb3VwLFxuICBDZGtEcmFnLFxuICBDZGtEcmFnSGFuZGxlLFxuICBDZGtEcmFnUHJldmlldyxcbiAgQ2RrRHJhZ1BsYWNlaG9sZGVyLFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogRFJBR19EUk9QX0RJUkVDVElWRVMsXG4gIGV4cG9ydHM6IFtDZGtTY3JvbGxhYmxlTW9kdWxlLCAuLi5EUkFHX0RST1BfRElSRUNUSVZFU10sXG4gIHByb3ZpZGVyczogW0RyYWdEcm9wXSxcbn0pXG5leHBvcnQgY2xhc3MgRHJhZ0Ryb3BNb2R1bGUge31cbiJdfQ==