/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatPseudoCheckbox } from './pseudo-checkbox';
import { MatCommonModule } from '../../common-behaviors/common-module';
import * as i0 from "@angular/core";
export class MatPseudoCheckboxModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPseudoCheckboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPseudoCheckboxModule, imports: [MatCommonModule, MatPseudoCheckbox], exports: [MatPseudoCheckbox] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPseudoCheckboxModule, imports: [MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPseudoCheckboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, MatPseudoCheckbox],
                    exports: [MatPseudoCheckbox],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNldWRvLWNoZWNrYm94LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL3NlbGVjdGlvbi9wc2V1ZG8tY2hlY2tib3gvcHNldWRvLWNoZWNrYm94LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQzs7QUFNckUsTUFBTSxPQUFPLHVCQUF1QjtxSEFBdkIsdUJBQXVCO3NIQUF2Qix1QkFBdUIsWUFIeEIsZUFBZSxFQUFFLGlCQUFpQixhQUNsQyxpQkFBaUI7c0hBRWhCLHVCQUF1QixZQUh4QixlQUFlOztrR0FHZCx1QkFBdUI7a0JBSm5DLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDO29CQUM3QyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDN0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdFBzZXVkb0NoZWNrYm94fSBmcm9tICcuL3BzZXVkby1jaGVja2JveCc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZX0gZnJvbSAnLi4vLi4vY29tbW9uLWJlaGF2aW9ycy9jb21tb24tbW9kdWxlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW01hdENvbW1vbk1vZHVsZSwgTWF0UHNldWRvQ2hlY2tib3hdLFxuICBleHBvcnRzOiBbTWF0UHNldWRvQ2hlY2tib3hdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRQc2V1ZG9DaGVja2JveE1vZHVsZSB7fVxuIl19