/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatAnchor, MatButton } from './button';
import { MatFabAnchor, MatFabButton, MatMiniFabAnchor, MatMiniFabButton } from './fab';
import { MatIconAnchor, MatIconButton } from './icon-button';
import * as i0 from "@angular/core";
export class MatButtonModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonModule, imports: [MatCommonModule,
            MatRippleModule,
            MatAnchor,
            MatButton,
            MatIconAnchor,
            MatMiniFabAnchor,
            MatMiniFabButton,
            MatIconButton,
            MatFabAnchor,
            MatFabButton], exports: [MatAnchor,
            MatButton,
            MatIconAnchor,
            MatIconButton,
            MatMiniFabAnchor,
            MatMiniFabButton,
            MatFabAnchor,
            MatFabButton,
            MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonModule, imports: [MatCommonModule,
            MatRippleModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        MatRippleModule,
                        MatAnchor,
                        MatButton,
                        MatIconAnchor,
                        MatMiniFabAnchor,
                        MatMiniFabButton,
                        MatIconButton,
                        MatFabAnchor,
                        MatFabButton,
                    ],
                    exports: [
                        MatAnchor,
                        MatButton,
                        MatIconAnchor,
                        MatIconButton,
                        MatMiniFabAnchor,
                        MatMiniFabButton,
                        MatFabAnchor,
                        MatFabButton,
                        MatCommonModule,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2J1dHRvbi9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzlDLE9BQU8sRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxhQUFhLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQTJCM0QsTUFBTSxPQUFPLGVBQWU7cUhBQWYsZUFBZTtzSEFBZixlQUFlLFlBdkJ4QixlQUFlO1lBQ2YsZUFBZTtZQUNmLFNBQVM7WUFDVCxTQUFTO1lBQ1QsYUFBYTtZQUNiLGdCQUFnQjtZQUNoQixnQkFBZ0I7WUFDaEIsYUFBYTtZQUNiLFlBQVk7WUFDWixZQUFZLGFBR1osU0FBUztZQUNULFNBQVM7WUFDVCxhQUFhO1lBQ2IsYUFBYTtZQUNiLGdCQUFnQjtZQUNoQixnQkFBZ0I7WUFDaEIsWUFBWTtZQUNaLFlBQVk7WUFDWixlQUFlO3NIQUdOLGVBQWUsWUF2QnhCLGVBQWU7WUFDZixlQUFlLEVBbUJmLGVBQWU7O2tHQUdOLGVBQWU7a0JBekIzQixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxlQUFlO3dCQUNmLGVBQWU7d0JBQ2YsU0FBUzt3QkFDVCxTQUFTO3dCQUNULGFBQWE7d0JBQ2IsZ0JBQWdCO3dCQUNoQixnQkFBZ0I7d0JBQ2hCLGFBQWE7d0JBQ2IsWUFBWTt3QkFDWixZQUFZO3FCQUNiO29CQUNELE9BQU8sRUFBRTt3QkFDUCxTQUFTO3dCQUNULFNBQVM7d0JBQ1QsYUFBYTt3QkFDYixhQUFhO3dCQUNiLGdCQUFnQjt3QkFDaEIsZ0JBQWdCO3dCQUNoQixZQUFZO3dCQUNaLFlBQVk7d0JBQ1osZUFBZTtxQkFDaEI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0QW5jaG9yLCBNYXRCdXR0b259IGZyb20gJy4vYnV0dG9uJztcbmltcG9ydCB7TWF0RmFiQW5jaG9yLCBNYXRGYWJCdXR0b24sIE1hdE1pbmlGYWJBbmNob3IsIE1hdE1pbmlGYWJCdXR0b259IGZyb20gJy4vZmFiJztcbmltcG9ydCB7TWF0SWNvbkFuY2hvciwgTWF0SWNvbkJ1dHRvbn0gZnJvbSAnLi9pY29uLWJ1dHRvbic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0UmlwcGxlTW9kdWxlLFxuICAgIE1hdEFuY2hvcixcbiAgICBNYXRCdXR0b24sXG4gICAgTWF0SWNvbkFuY2hvcixcbiAgICBNYXRNaW5pRmFiQW5jaG9yLFxuICAgIE1hdE1pbmlGYWJCdXR0b24sXG4gICAgTWF0SWNvbkJ1dHRvbixcbiAgICBNYXRGYWJBbmNob3IsXG4gICAgTWF0RmFiQnV0dG9uLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgTWF0QW5jaG9yLFxuICAgIE1hdEJ1dHRvbixcbiAgICBNYXRJY29uQW5jaG9yLFxuICAgIE1hdEljb25CdXR0b24sXG4gICAgTWF0TWluaUZhYkFuY2hvcixcbiAgICBNYXRNaW5pRmFiQnV0dG9uLFxuICAgIE1hdEZhYkFuY2hvcixcbiAgICBNYXRGYWJCdXR0b24sXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRCdXR0b25Nb2R1bGUge31cbiJdfQ==