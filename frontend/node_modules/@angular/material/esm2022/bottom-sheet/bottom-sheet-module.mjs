/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DialogModule } from '@angular/cdk/dialog';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatBottomSheetContainer } from './bottom-sheet-container';
import { MatBottomSheet } from './bottom-sheet';
import * as i0 from "@angular/core";
export class MatBottomSheetModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, imports: [DialogModule, MatCommonModule, PortalModule, MatBottomSheetContainer], exports: [MatBottomSheetContainer, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, providers: [MatBottomSheet], imports: [DialogModule, MatCommonModule, PortalModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [DialogModule, MatCommonModule, PortalModule, MatBottomSheetContainer],
                    exports: [MatBottomSheetContainer, MatCommonModule],
                    providers: [MatBottomSheet],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90dG9tLXNoZWV0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9ib3R0b20tc2hlZXQvYm90dG9tLXNoZWV0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFPOUMsTUFBTSxPQUFPLG9CQUFvQjtxSEFBcEIsb0JBQW9CO3NIQUFwQixvQkFBb0IsWUFKckIsWUFBWSxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsdUJBQXVCLGFBQ3BFLHVCQUF1QixFQUFFLGVBQWU7c0hBR3ZDLG9CQUFvQixhQUZwQixDQUFDLGNBQWMsQ0FBQyxZQUZqQixZQUFZLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFDbEIsZUFBZTs7a0dBR3ZDLG9CQUFvQjtrQkFMaEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSx1QkFBdUIsQ0FBQztvQkFDL0UsT0FBTyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsZUFBZSxDQUFDO29CQUNuRCxTQUFTLEVBQUUsQ0FBQyxjQUFjLENBQUM7aUJBQzVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlhbG9nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvZGlhbG9nJztcbmltcG9ydCB7UG9ydGFsTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtNYXRCb3R0b21TaGVldENvbnRhaW5lcn0gZnJvbSAnLi9ib3R0b20tc2hlZXQtY29udGFpbmVyJztcbmltcG9ydCB7TWF0Qm90dG9tU2hlZXR9IGZyb20gJy4vYm90dG9tLXNoZWV0JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0RpYWxvZ01vZHVsZSwgTWF0Q29tbW9uTW9kdWxlLCBQb3J0YWxNb2R1bGUsIE1hdEJvdHRvbVNoZWV0Q29udGFpbmVyXSxcbiAgZXhwb3J0czogW01hdEJvdHRvbVNoZWV0Q29udGFpbmVyLCBNYXRDb21tb25Nb2R1bGVdLFxuICBwcm92aWRlcnM6IFtNYXRCb3R0b21TaGVldF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdEJvdHRvbVNoZWV0TW9kdWxlIHt9XG4iXX0=