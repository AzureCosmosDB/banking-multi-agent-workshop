/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatCheckbox } from './checkbox';
import { MatCheckboxRequiredValidator } from './checkbox-required-validator';
import * as i0 from "@angular/core";
/**
 * @deprecated No longer used, `MatCheckbox` implements required validation directly.
 * @breaking-change 19.0.0
 */
export class _MatCheckboxRequiredValidatorModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatCheckboxRequiredValidatorModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatCheckboxRequiredValidatorModule, imports: [MatCheckboxRequiredValidator], exports: [MatCheckboxRequiredValidator] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatCheckboxRequiredValidatorModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatCheckboxRequiredValidatorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCheckboxRequiredValidator],
                    exports: [MatCheckboxRequiredValidator],
                }]
        }] });
export class MatCheckboxModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCheckboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCheckboxModule, imports: [MatCheckbox, MatCommonModule], exports: [MatCheckbox, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCheckboxModule, imports: [MatCheckbox, MatCommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCheckboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCheckbox, MatCommonModule],
                    exports: [MatCheckbox, MatCommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoZWNrYm94L21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLCtCQUErQixDQUFDOztBQUUzRTs7O0dBR0c7QUFLSCxNQUFNLE9BQU8sbUNBQW1DO3FIQUFuQyxtQ0FBbUM7c0hBQW5DLG1DQUFtQyxZQUhwQyw0QkFBNEIsYUFDNUIsNEJBQTRCO3NIQUUzQixtQ0FBbUM7O2tHQUFuQyxtQ0FBbUM7a0JBSi9DLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsNEJBQTRCLENBQUM7b0JBQ3ZDLE9BQU8sRUFBRSxDQUFDLDRCQUE0QixDQUFDO2lCQUN4Qzs7QUFPRCxNQUFNLE9BQU8saUJBQWlCO3FIQUFqQixpQkFBaUI7c0hBQWpCLGlCQUFpQixZQUhsQixXQUFXLEVBQUUsZUFBZSxhQUM1QixXQUFXLEVBQUUsZUFBZTtzSEFFM0IsaUJBQWlCLFlBSGxCLFdBQVcsRUFBRSxlQUFlLEVBQ2YsZUFBZTs7a0dBRTNCLGlCQUFpQjtrQkFKN0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDO29CQUN2QyxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDO2lCQUN4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0Q2hlY2tib3h9IGZyb20gJy4vY2hlY2tib3gnO1xuaW1wb3J0IHtNYXRDaGVja2JveFJlcXVpcmVkVmFsaWRhdG9yfSBmcm9tICcuL2NoZWNrYm94LXJlcXVpcmVkLXZhbGlkYXRvcic7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIHVzZWQsIGBNYXRDaGVja2JveGAgaW1wbGVtZW50cyByZXF1aXJlZCB2YWxpZGF0aW9uIGRpcmVjdGx5LlxuICogQGJyZWFraW5nLWNoYW5nZSAxOS4wLjBcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW01hdENoZWNrYm94UmVxdWlyZWRWYWxpZGF0b3JdLFxuICBleHBvcnRzOiBbTWF0Q2hlY2tib3hSZXF1aXJlZFZhbGlkYXRvcl0sXG59KVxuZXhwb3J0IGNsYXNzIF9NYXRDaGVja2JveFJlcXVpcmVkVmFsaWRhdG9yTW9kdWxlIHt9XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtNYXRDaGVja2JveCwgTWF0Q29tbW9uTW9kdWxlXSxcbiAgZXhwb3J0czogW01hdENoZWNrYm94LCBNYXRDb21tb25Nb2R1bGVdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDaGVja2JveE1vZHVsZSB7fVxuIl19