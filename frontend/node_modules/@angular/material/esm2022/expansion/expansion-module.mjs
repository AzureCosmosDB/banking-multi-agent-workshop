/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatAccordion } from './accordion';
import { MatExpansionPanel, MatExpansionPanelActionRow } from './expansion-panel';
import { MatExpansionPanelContent } from './expansion-panel-content';
import { MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle, } from './expansion-panel-header';
import * as i0 from "@angular/core";
export class MatExpansionModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatExpansionModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatExpansionModule, imports: [MatCommonModule,
            CdkAccordionModule,
            PortalModule,
            MatAccordion,
            MatExpansionPanel,
            MatExpansionPanelActionRow,
            MatExpansionPanelHeader,
            MatExpansionPanelTitle,
            MatExpansionPanelDescription,
            MatExpansionPanelContent], exports: [MatAccordion,
            MatExpansionPanel,
            MatExpansionPanelActionRow,
            MatExpansionPanelHeader,
            MatExpansionPanelTitle,
            MatExpansionPanelDescription,
            MatExpansionPanelContent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatExpansionModule, imports: [MatCommonModule,
            CdkAccordionModule,
            PortalModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatExpansionModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        CdkAccordionModule,
                        PortalModule,
                        MatAccordion,
                        MatExpansionPanel,
                        MatExpansionPanelActionRow,
                        MatExpansionPanelHeader,
                        MatExpansionPanelTitle,
                        MatExpansionPanelDescription,
                        MatExpansionPanelContent,
                    ],
                    exports: [
                        MatAccordion,
                        MatExpansionPanel,
                        MatExpansionPanelActionRow,
                        MatExpansionPanelHeader,
                        MatExpansionPanelTitle,
                        MatExpansionPanelDescription,
                        MatExpansionPanelContent,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5zaW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9leHBhbnNpb24vZXhwYW5zaW9uLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN6QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRSxPQUFPLEVBQ0wsNEJBQTRCLEVBQzVCLHVCQUF1QixFQUN2QixzQkFBc0IsR0FDdkIsTUFBTSwwQkFBMEIsQ0FBQzs7QUF5QmxDLE1BQU0sT0FBTyxrQkFBa0I7cUhBQWxCLGtCQUFrQjtzSEFBbEIsa0JBQWtCLFlBckIzQixlQUFlO1lBQ2Ysa0JBQWtCO1lBQ2xCLFlBQVk7WUFDWixZQUFZO1lBQ1osaUJBQWlCO1lBQ2pCLDBCQUEwQjtZQUMxQix1QkFBdUI7WUFDdkIsc0JBQXNCO1lBQ3RCLDRCQUE0QjtZQUM1Qix3QkFBd0IsYUFHeEIsWUFBWTtZQUNaLGlCQUFpQjtZQUNqQiwwQkFBMEI7WUFDMUIsdUJBQXVCO1lBQ3ZCLHNCQUFzQjtZQUN0Qiw0QkFBNEI7WUFDNUIsd0JBQXdCO3NIQUdmLGtCQUFrQixZQXJCM0IsZUFBZTtZQUNmLGtCQUFrQjtZQUNsQixZQUFZOztrR0FtQkgsa0JBQWtCO2tCQXZCOUIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsZUFBZTt3QkFDZixrQkFBa0I7d0JBQ2xCLFlBQVk7d0JBQ1osWUFBWTt3QkFDWixpQkFBaUI7d0JBQ2pCLDBCQUEwQjt3QkFDMUIsdUJBQXVCO3dCQUN2QixzQkFBc0I7d0JBQ3RCLDRCQUE0Qjt3QkFDNUIsd0JBQXdCO3FCQUN6QjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixpQkFBaUI7d0JBQ2pCLDBCQUEwQjt3QkFDMUIsdUJBQXVCO3dCQUN2QixzQkFBc0I7d0JBQ3RCLDRCQUE0Qjt3QkFDNUIsd0JBQXdCO3FCQUN6QjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka0FjY29yZGlvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2FjY29yZGlvbic7XG5pbXBvcnQge1BvcnRhbE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0QWNjb3JkaW9ufSBmcm9tICcuL2FjY29yZGlvbic7XG5pbXBvcnQge01hdEV4cGFuc2lvblBhbmVsLCBNYXRFeHBhbnNpb25QYW5lbEFjdGlvblJvd30gZnJvbSAnLi9leHBhbnNpb24tcGFuZWwnO1xuaW1wb3J0IHtNYXRFeHBhbnNpb25QYW5lbENvbnRlbnR9IGZyb20gJy4vZXhwYW5zaW9uLXBhbmVsLWNvbnRlbnQnO1xuaW1wb3J0IHtcbiAgTWF0RXhwYW5zaW9uUGFuZWxEZXNjcmlwdGlvbixcbiAgTWF0RXhwYW5zaW9uUGFuZWxIZWFkZXIsXG4gIE1hdEV4cGFuc2lvblBhbmVsVGl0bGUsXG59IGZyb20gJy4vZXhwYW5zaW9uLXBhbmVsLWhlYWRlcic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgQ2RrQWNjb3JkaW9uTW9kdWxlLFxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBNYXRBY2NvcmRpb24sXG4gICAgTWF0RXhwYW5zaW9uUGFuZWwsXG4gICAgTWF0RXhwYW5zaW9uUGFuZWxBY3Rpb25Sb3csXG4gICAgTWF0RXhwYW5zaW9uUGFuZWxIZWFkZXIsXG4gICAgTWF0RXhwYW5zaW9uUGFuZWxUaXRsZSxcbiAgICBNYXRFeHBhbnNpb25QYW5lbERlc2NyaXB0aW9uLFxuICAgIE1hdEV4cGFuc2lvblBhbmVsQ29udGVudCxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIE1hdEFjY29yZGlvbixcbiAgICBNYXRFeHBhbnNpb25QYW5lbCxcbiAgICBNYXRFeHBhbnNpb25QYW5lbEFjdGlvblJvdyxcbiAgICBNYXRFeHBhbnNpb25QYW5lbEhlYWRlcixcbiAgICBNYXRFeHBhbnNpb25QYW5lbFRpdGxlLFxuICAgIE1hdEV4cGFuc2lvblBhbmVsRGVzY3JpcHRpb24sXG4gICAgTWF0RXhwYW5zaW9uUGFuZWxDb250ZW50LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRFeHBhbnNpb25Nb2R1bGUge31cbiJdfQ==