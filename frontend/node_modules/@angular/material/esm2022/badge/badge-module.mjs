/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { A11yModule } from '@angular/cdk/a11y';
import { MatBadge, _MatBadgeStyleLoader } from './badge';
import * as i0 from "@angular/core";
export class MatBadgeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBadgeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBadgeModule, imports: [A11yModule, MatCommonModule, MatBadge, _MatBadgeStyleLoader], exports: [MatBadge, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBadgeModule, imports: [A11yModule, MatCommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBadgeModule, decorators: [{
            type: NgModule,
            args: [{
                    // Note: we _shouldn't_ have to import `_MatBadgeStyleLoader`,
                    // but it seems to be necessary for tests.
                    imports: [A11yModule, MatCommonModule, MatBadge, _MatBadgeStyleLoader],
                    exports: [MatBadge, MatCommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2JhZGdlL2JhZGdlLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLFNBQVMsQ0FBQzs7QUFRdkQsTUFBTSxPQUFPLGNBQWM7cUhBQWQsY0FBYztzSEFBZCxjQUFjLFlBSGYsVUFBVSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLGFBQzNELFFBQVEsRUFBRSxlQUFlO3NIQUV4QixjQUFjLFlBSGYsVUFBVSxFQUFFLGVBQWUsRUFDakIsZUFBZTs7a0dBRXhCLGNBQWM7a0JBTjFCLFFBQVE7bUJBQUM7b0JBQ1IsOERBQThEO29CQUM5RCwwQ0FBMEM7b0JBQzFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixDQUFDO29CQUN0RSxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDO2lCQUNyQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7QTExeU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtNYXRCYWRnZSwgX01hdEJhZGdlU3R5bGVMb2FkZXJ9IGZyb20gJy4vYmFkZ2UnO1xuXG5ATmdNb2R1bGUoe1xuICAvLyBOb3RlOiB3ZSBfc2hvdWxkbid0XyBoYXZlIHRvIGltcG9ydCBgX01hdEJhZGdlU3R5bGVMb2FkZXJgLFxuICAvLyBidXQgaXQgc2VlbXMgdG8gYmUgbmVjZXNzYXJ5IGZvciB0ZXN0cy5cbiAgaW1wb3J0czogW0ExMXlNb2R1bGUsIE1hdENvbW1vbk1vZHVsZSwgTWF0QmFkZ2UsIF9NYXRCYWRnZVN0eWxlTG9hZGVyXSxcbiAgZXhwb3J0czogW01hdEJhZGdlLCBNYXRDb21tb25Nb2R1bGVdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRCYWRnZU1vZHVsZSB7fVxuIl19