/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatSlideToggle } from './slide-toggle';
import { MatSlideToggleRequiredValidator } from './slide-toggle-required-validator';
import * as i0 from "@angular/core";
/**
 * @deprecated No longer used, `MatSlideToggle` implements required validation directly.
 * @breaking-change 19.0.0
 */
export class _MatSlideToggleRequiredValidatorModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatSlideToggleRequiredValidatorModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatSlideToggleRequiredValidatorModule, imports: [MatSlideToggleRequiredValidator], exports: [MatSlideToggleRequiredValidator] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatSlideToggleRequiredValidatorModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatSlideToggleRequiredValidatorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatSlideToggleRequiredValidator],
                    exports: [MatSlideToggleRequiredValidator],
                }]
        }] });
export class MatSlideToggleModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlideToggleModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlideToggleModule, imports: [MatSlideToggle, MatCommonModule], exports: [MatSlideToggle, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlideToggleModule, imports: [MatSlideToggle, MatCommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlideToggleModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatSlideToggle, MatCommonModule],
                    exports: [MatSlideToggle, MatCommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NsaWRlLXRvZ2dsZS9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBQywrQkFBK0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDOztBQUVsRjs7O0dBR0c7QUFLSCxNQUFNLE9BQU8sc0NBQXNDO3FIQUF0QyxzQ0FBc0M7c0hBQXRDLHNDQUFzQyxZQUh2QywrQkFBK0IsYUFDL0IsK0JBQStCO3NIQUU5QixzQ0FBc0M7O2tHQUF0QyxzQ0FBc0M7a0JBSmxELFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsK0JBQStCLENBQUM7b0JBQzFDLE9BQU8sRUFBRSxDQUFDLCtCQUErQixDQUFDO2lCQUMzQzs7QUFPRCxNQUFNLE9BQU8sb0JBQW9CO3FIQUFwQixvQkFBb0I7c0hBQXBCLG9CQUFvQixZQUhyQixjQUFjLEVBQUUsZUFBZSxhQUMvQixjQUFjLEVBQUUsZUFBZTtzSEFFOUIsb0JBQW9CLFlBSHJCLGNBQWMsRUFBRSxlQUFlLEVBQ2YsZUFBZTs7a0dBRTlCLG9CQUFvQjtrQkFKaEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO29CQUMxQyxPQUFPLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO2lCQUMzQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0U2xpZGVUb2dnbGV9IGZyb20gJy4vc2xpZGUtdG9nZ2xlJztcbmltcG9ydCB7TWF0U2xpZGVUb2dnbGVSZXF1aXJlZFZhbGlkYXRvcn0gZnJvbSAnLi9zbGlkZS10b2dnbGUtcmVxdWlyZWQtdmFsaWRhdG9yJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgdXNlZCwgYE1hdFNsaWRlVG9nZ2xlYCBpbXBsZW1lbnRzIHJlcXVpcmVkIHZhbGlkYXRpb24gZGlyZWN0bHkuXG4gKiBAYnJlYWtpbmctY2hhbmdlIDE5LjAuMFxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTWF0U2xpZGVUb2dnbGVSZXF1aXJlZFZhbGlkYXRvcl0sXG4gIGV4cG9ydHM6IFtNYXRTbGlkZVRvZ2dsZVJlcXVpcmVkVmFsaWRhdG9yXSxcbn0pXG5leHBvcnQgY2xhc3MgX01hdFNsaWRlVG9nZ2xlUmVxdWlyZWRWYWxpZGF0b3JNb2R1bGUge31cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW01hdFNsaWRlVG9nZ2xlLCBNYXRDb21tb25Nb2R1bGVdLFxuICBleHBvcnRzOiBbTWF0U2xpZGVUb2dnbGUsIE1hdENvbW1vbk1vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdFNsaWRlVG9nZ2xlTW9kdWxlIHt9XG4iXX0=