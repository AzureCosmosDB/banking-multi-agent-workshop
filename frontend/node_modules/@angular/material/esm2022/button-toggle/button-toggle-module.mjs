/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatButtonToggle, MatButtonToggleGroup } from './button-toggle';
import * as i0 from "@angular/core";
export class MatButtonToggleModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggleModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggleModule, imports: [MatCommonModule, MatRippleModule, MatButtonToggleGroup, MatButtonToggle], exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggleModule, imports: [MatCommonModule, MatRippleModule, MatButtonToggle, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatButtonToggleModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, MatRippleModule, MatButtonToggleGroup, MatButtonToggle],
                    exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXRvZ2dsZS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYnV0dG9uLXRvZ2dsZS9idXR0b24tdG9nZ2xlLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDeEUsT0FBTyxFQUFDLGVBQWUsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQU10RSxNQUFNLE9BQU8scUJBQXFCO3FIQUFyQixxQkFBcUI7c0hBQXJCLHFCQUFxQixZQUh0QixlQUFlLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLGVBQWUsYUFDdkUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLGVBQWU7c0hBRXJELHFCQUFxQixZQUh0QixlQUFlLEVBQUUsZUFBZSxFQUF3QixlQUFlLEVBQ3ZFLGVBQWU7O2tHQUVkLHFCQUFxQjtrQkFKakMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztvQkFDbEYsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztpQkFDbEUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0QnV0dG9uVG9nZ2xlLCBNYXRCdXR0b25Ub2dnbGVHcm91cH0gZnJvbSAnLi9idXR0b24tdG9nZ2xlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW01hdENvbW1vbk1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlLCBNYXRCdXR0b25Ub2dnbGVHcm91cCwgTWF0QnV0dG9uVG9nZ2xlXSxcbiAgZXhwb3J0czogW01hdENvbW1vbk1vZHVsZSwgTWF0QnV0dG9uVG9nZ2xlR3JvdXAsIE1hdEJ1dHRvblRvZ2dsZV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdEJ1dHRvblRvZ2dsZU1vZHVsZSB7fVxuIl19