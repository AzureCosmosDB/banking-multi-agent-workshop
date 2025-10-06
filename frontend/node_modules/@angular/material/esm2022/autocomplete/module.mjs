/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatAutocomplete } from './autocomplete';
import { MatAutocompleteTrigger, MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER, } from './autocomplete-trigger';
import { MatAutocompleteOrigin } from './autocomplete-origin';
import * as i0 from "@angular/core";
export class MatAutocompleteModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocompleteModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocompleteModule, imports: [OverlayModule,
            MatOptionModule,
            MatCommonModule,
            CommonModule,
            MatAutocomplete,
            MatAutocompleteTrigger,
            MatAutocompleteOrigin], exports: [CdkScrollableModule,
            MatAutocomplete,
            MatOptionModule,
            MatCommonModule,
            MatAutocompleteTrigger,
            MatAutocompleteOrigin] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocompleteModule, providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER], imports: [OverlayModule,
            MatOptionModule,
            MatCommonModule,
            CommonModule, CdkScrollableModule,
            MatOptionModule,
            MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocompleteModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        OverlayModule,
                        MatOptionModule,
                        MatCommonModule,
                        CommonModule,
                        MatAutocomplete,
                        MatAutocompleteTrigger,
                        MatAutocompleteOrigin,
                    ],
                    exports: [
                        CdkScrollableModule,
                        MatAutocomplete,
                        MatOptionModule,
                        MatCommonModule,
                        MatAutocompleteTrigger,
                        MatAutocompleteOrigin,
                    ],
                    providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2F1dG9jb21wbGV0ZS9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFDTCxzQkFBc0IsRUFDdEIsaURBQWlELEdBQ2xELE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBc0I1RCxNQUFNLE9BQU8scUJBQXFCO3FIQUFyQixxQkFBcUI7c0hBQXJCLHFCQUFxQixZQWxCOUIsYUFBYTtZQUNiLGVBQWU7WUFDZixlQUFlO1lBQ2YsWUFBWTtZQUNaLGVBQWU7WUFDZixzQkFBc0I7WUFDdEIscUJBQXFCLGFBR3JCLG1CQUFtQjtZQUNuQixlQUFlO1lBQ2YsZUFBZTtZQUNmLGVBQWU7WUFDZixzQkFBc0I7WUFDdEIscUJBQXFCO3NIQUlaLHFCQUFxQixhQUZyQixDQUFDLGlEQUFpRCxDQUFDLFlBaEI1RCxhQUFhO1lBQ2IsZUFBZTtZQUNmLGVBQWU7WUFDZixZQUFZLEVBTVosbUJBQW1CO1lBRW5CLGVBQWU7WUFDZixlQUFlOztrR0FNTixxQkFBcUI7a0JBcEJqQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxhQUFhO3dCQUNiLGVBQWU7d0JBQ2YsZUFBZTt3QkFDZixZQUFZO3dCQUNaLGVBQWU7d0JBQ2Ysc0JBQXNCO3dCQUN0QixxQkFBcUI7cUJBQ3RCO29CQUNELE9BQU8sRUFBRTt3QkFDUCxtQkFBbUI7d0JBQ25CLGVBQWU7d0JBQ2YsZUFBZTt3QkFDZixlQUFlO3dCQUNmLHNCQUFzQjt3QkFDdEIscUJBQXFCO3FCQUN0QjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxpREFBaUQsQ0FBQztpQkFDL0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZSwgTWF0T3B0aW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtDZGtTY3JvbGxhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtNYXRBdXRvY29tcGxldGV9IGZyb20gJy4vYXV0b2NvbXBsZXRlJztcbmltcG9ydCB7XG4gIE1hdEF1dG9jb21wbGV0ZVRyaWdnZXIsXG4gIE1BVF9BVVRPQ09NUExFVEVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIsXG59IGZyb20gJy4vYXV0b2NvbXBsZXRlLXRyaWdnZXInO1xuaW1wb3J0IHtNYXRBdXRvY29tcGxldGVPcmlnaW59IGZyb20gJy4vYXV0b2NvbXBsZXRlLW9yaWdpbic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIE1hdE9wdGlvbk1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIE1hdEF1dG9jb21wbGV0ZSxcbiAgICBNYXRBdXRvY29tcGxldGVUcmlnZ2VyLFxuICAgIE1hdEF1dG9jb21wbGV0ZU9yaWdpbixcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIENka1Njcm9sbGFibGVNb2R1bGUsXG4gICAgTWF0QXV0b2NvbXBsZXRlLFxuICAgIE1hdE9wdGlvbk1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0QXV0b2NvbXBsZXRlVHJpZ2dlcixcbiAgICBNYXRBdXRvY29tcGxldGVPcmlnaW4sXG4gIF0sXG4gIHByb3ZpZGVyczogW01BVF9BVVRPQ09NUExFVEVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVJdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRBdXRvY29tcGxldGVNb2R1bGUge31cbiJdfQ==