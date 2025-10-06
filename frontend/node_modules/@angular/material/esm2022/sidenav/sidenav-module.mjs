/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from './drawer';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from './sidenav';
import * as i0 from "@angular/core";
export class MatSidenavModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSidenavModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSidenavModule, imports: [MatCommonModule,
            CdkScrollableModule,
            MatDrawer,
            MatDrawerContainer,
            MatDrawerContent,
            MatSidenav,
            MatSidenavContainer,
            MatSidenavContent], exports: [CdkScrollableModule,
            MatCommonModule,
            MatDrawer,
            MatDrawerContainer,
            MatDrawerContent,
            MatSidenav,
            MatSidenavContainer,
            MatSidenavContent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSidenavModule, imports: [MatCommonModule,
            CdkScrollableModule, CdkScrollableModule,
            MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSidenavModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        CdkScrollableModule,
                        MatDrawer,
                        MatDrawerContainer,
                        MatDrawerContent,
                        MatSidenav,
                        MatSidenavContainer,
                        MatSidenavContent,
                    ],
                    exports: [
                        CdkScrollableModule,
                        MatCommonModule,
                        MatDrawer,
                        MatDrawerContainer,
                        MatDrawerContent,
                        MatSidenav,
                        MatSidenavContainer,
                        MatSidenavContent,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZW5hdi1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2lkZW5hdi9zaWRlbmF2LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxXQUFXLENBQUM7O0FBd0I3RSxNQUFNLE9BQU8sZ0JBQWdCO3FIQUFoQixnQkFBZ0I7c0hBQWhCLGdCQUFnQixZQXBCekIsZUFBZTtZQUNmLG1CQUFtQjtZQUNuQixTQUFTO1lBQ1Qsa0JBQWtCO1lBQ2xCLGdCQUFnQjtZQUNoQixVQUFVO1lBQ1YsbUJBQW1CO1lBQ25CLGlCQUFpQixhQUdqQixtQkFBbUI7WUFDbkIsZUFBZTtZQUNmLFNBQVM7WUFDVCxrQkFBa0I7WUFDbEIsZ0JBQWdCO1lBQ2hCLFVBQVU7WUFDVixtQkFBbUI7WUFDbkIsaUJBQWlCO3NIQUdSLGdCQUFnQixZQXBCekIsZUFBZTtZQUNmLG1CQUFtQixFQVNuQixtQkFBbUI7WUFDbkIsZUFBZTs7a0dBU04sZ0JBQWdCO2tCQXRCNUIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsZUFBZTt3QkFDZixtQkFBbUI7d0JBQ25CLFNBQVM7d0JBQ1Qsa0JBQWtCO3dCQUNsQixnQkFBZ0I7d0JBQ2hCLFVBQVU7d0JBQ1YsbUJBQW1CO3dCQUNuQixpQkFBaUI7cUJBQ2xCO29CQUNELE9BQU8sRUFBRTt3QkFDUCxtQkFBbUI7d0JBQ25CLGVBQWU7d0JBQ2YsU0FBUzt3QkFDVCxrQkFBa0I7d0JBQ2xCLGdCQUFnQjt3QkFDaEIsVUFBVTt3QkFDVixtQkFBbUI7d0JBQ25CLGlCQUFpQjtxQkFDbEI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0RHJhd2VyLCBNYXREcmF3ZXJDb250YWluZXIsIE1hdERyYXdlckNvbnRlbnR9IGZyb20gJy4vZHJhd2VyJztcbmltcG9ydCB7TWF0U2lkZW5hdiwgTWF0U2lkZW5hdkNvbnRhaW5lciwgTWF0U2lkZW5hdkNvbnRlbnR9IGZyb20gJy4vc2lkZW5hdic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgQ2RrU2Nyb2xsYWJsZU1vZHVsZSxcbiAgICBNYXREcmF3ZXIsXG4gICAgTWF0RHJhd2VyQ29udGFpbmVyLFxuICAgIE1hdERyYXdlckNvbnRlbnQsXG4gICAgTWF0U2lkZW5hdixcbiAgICBNYXRTaWRlbmF2Q29udGFpbmVyLFxuICAgIE1hdFNpZGVuYXZDb250ZW50LFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgQ2RrU2Nyb2xsYWJsZU1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0RHJhd2VyLFxuICAgIE1hdERyYXdlckNvbnRhaW5lcixcbiAgICBNYXREcmF3ZXJDb250ZW50LFxuICAgIE1hdFNpZGVuYXYsXG4gICAgTWF0U2lkZW5hdkNvbnRhaW5lcixcbiAgICBNYXRTaWRlbmF2Q29udGVudCxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U2lkZW5hdk1vZHVsZSB7fVxuIl19