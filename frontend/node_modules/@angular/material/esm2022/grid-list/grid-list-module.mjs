/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatLineModule, MatCommonModule } from '@angular/material/core';
import { MatGridTile, MatGridTileText, MatGridTileFooterCssMatStyler, MatGridTileHeaderCssMatStyler, MatGridAvatarCssMatStyler, } from './grid-tile';
import { MatGridList } from './grid-list';
import * as i0 from "@angular/core";
export class MatGridListModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridListModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridListModule, imports: [MatLineModule,
            MatCommonModule,
            MatGridList,
            MatGridTile,
            MatGridTileText,
            MatGridTileHeaderCssMatStyler,
            MatGridTileFooterCssMatStyler,
            MatGridAvatarCssMatStyler], exports: [MatGridList,
            MatGridTile,
            MatGridTileText,
            MatLineModule,
            MatCommonModule,
            MatGridTileHeaderCssMatStyler,
            MatGridTileFooterCssMatStyler,
            MatGridAvatarCssMatStyler] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridListModule, imports: [MatLineModule,
            MatCommonModule, MatLineModule,
            MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatGridListModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatLineModule,
                        MatCommonModule,
                        MatGridList,
                        MatGridTile,
                        MatGridTileText,
                        MatGridTileHeaderCssMatStyler,
                        MatGridTileFooterCssMatStyler,
                        MatGridAvatarCssMatStyler,
                    ],
                    exports: [
                        MatGridList,
                        MatGridTile,
                        MatGridTileText,
                        MatLineModule,
                        MatCommonModule,
                        MatGridTileHeaderCssMatStyler,
                        MatGridTileFooterCssMatStyler,
                        MatGridAvatarCssMatStyler,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC1saXN0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9ncmlkLWxpc3QvZ3JpZC1saXN0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxhQUFhLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdEUsT0FBTyxFQUNMLFdBQVcsRUFDWCxlQUFlLEVBQ2YsNkJBQTZCLEVBQzdCLDZCQUE2QixFQUM3Qix5QkFBeUIsR0FDMUIsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUF3QnhDLE1BQU0sT0FBTyxpQkFBaUI7cUhBQWpCLGlCQUFpQjtzSEFBakIsaUJBQWlCLFlBcEIxQixhQUFhO1lBQ2IsZUFBZTtZQUNmLFdBQVc7WUFDWCxXQUFXO1lBQ1gsZUFBZTtZQUNmLDZCQUE2QjtZQUM3Qiw2QkFBNkI7WUFDN0IseUJBQXlCLGFBR3pCLFdBQVc7WUFDWCxXQUFXO1lBQ1gsZUFBZTtZQUNmLGFBQWE7WUFDYixlQUFlO1lBQ2YsNkJBQTZCO1lBQzdCLDZCQUE2QjtZQUM3Qix5QkFBeUI7c0hBR2hCLGlCQUFpQixZQXBCMUIsYUFBYTtZQUNiLGVBQWUsRUFZZixhQUFhO1lBQ2IsZUFBZTs7a0dBTU4saUJBQWlCO2tCQXRCN0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsYUFBYTt3QkFDYixlQUFlO3dCQUNmLFdBQVc7d0JBQ1gsV0FBVzt3QkFDWCxlQUFlO3dCQUNmLDZCQUE2Qjt3QkFDN0IsNkJBQTZCO3dCQUM3Qix5QkFBeUI7cUJBQzFCO29CQUNELE9BQU8sRUFBRTt3QkFDUCxXQUFXO3dCQUNYLFdBQVc7d0JBQ1gsZUFBZTt3QkFDZixhQUFhO3dCQUNiLGVBQWU7d0JBQ2YsNkJBQTZCO3dCQUM3Qiw2QkFBNkI7d0JBQzdCLHlCQUF5QjtxQkFDMUI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdExpbmVNb2R1bGUsIE1hdENvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1xuICBNYXRHcmlkVGlsZSxcbiAgTWF0R3JpZFRpbGVUZXh0LFxuICBNYXRHcmlkVGlsZUZvb3RlckNzc01hdFN0eWxlcixcbiAgTWF0R3JpZFRpbGVIZWFkZXJDc3NNYXRTdHlsZXIsXG4gIE1hdEdyaWRBdmF0YXJDc3NNYXRTdHlsZXIsXG59IGZyb20gJy4vZ3JpZC10aWxlJztcbmltcG9ydCB7TWF0R3JpZExpc3R9IGZyb20gJy4vZ3JpZC1saXN0JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIE1hdExpbmVNb2R1bGUsXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICAgIE1hdEdyaWRMaXN0LFxuICAgIE1hdEdyaWRUaWxlLFxuICAgIE1hdEdyaWRUaWxlVGV4dCxcbiAgICBNYXRHcmlkVGlsZUhlYWRlckNzc01hdFN0eWxlcixcbiAgICBNYXRHcmlkVGlsZUZvb3RlckNzc01hdFN0eWxlcixcbiAgICBNYXRHcmlkQXZhdGFyQ3NzTWF0U3R5bGVyLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgTWF0R3JpZExpc3QsXG4gICAgTWF0R3JpZFRpbGUsXG4gICAgTWF0R3JpZFRpbGVUZXh0LFxuICAgIE1hdExpbmVNb2R1bGUsXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICAgIE1hdEdyaWRUaWxlSGVhZGVyQ3NzTWF0U3R5bGVyLFxuICAgIE1hdEdyaWRUaWxlRm9vdGVyQ3NzTWF0U3R5bGVyLFxuICAgIE1hdEdyaWRBdmF0YXJDc3NNYXRTdHlsZXIsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdEdyaWRMaXN0TW9kdWxlIHt9XG4iXX0=