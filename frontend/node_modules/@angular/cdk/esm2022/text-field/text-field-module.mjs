/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkAutofill } from './autofill';
import { CdkTextareaAutosize } from './autosize';
import * as i0 from "@angular/core";
export class TextFieldModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TextFieldModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: TextFieldModule, imports: [CdkAutofill, CdkTextareaAutosize], exports: [CdkAutofill, CdkTextareaAutosize] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TextFieldModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TextFieldModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkAutofill, CdkTextareaAutosize],
                    exports: [CdkAutofill, CdkTextareaAutosize],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1maWVsZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RleHQtZmllbGQvdGV4dC1maWVsZC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLFlBQVksQ0FBQzs7QUFNL0MsTUFBTSxPQUFPLGVBQWU7cUhBQWYsZUFBZTtzSEFBZixlQUFlLFlBSGhCLFdBQVcsRUFBRSxtQkFBbUIsYUFDaEMsV0FBVyxFQUFFLG1CQUFtQjtzSEFFL0IsZUFBZTs7a0dBQWYsZUFBZTtrQkFKM0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUM7b0JBQzNDLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQztpQkFDNUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka0F1dG9maWxsfSBmcm9tICcuL2F1dG9maWxsJztcbmltcG9ydCB7Q2RrVGV4dGFyZWFBdXRvc2l6ZX0gZnJvbSAnLi9hdXRvc2l6ZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDZGtBdXRvZmlsbCwgQ2RrVGV4dGFyZWFBdXRvc2l6ZV0sXG4gIGV4cG9ydHM6IFtDZGtBdXRvZmlsbCwgQ2RrVGV4dGFyZWFBdXRvc2l6ZV0sXG59KVxuZXhwb3J0IGNsYXNzIFRleHRGaWVsZE1vZHVsZSB7fVxuIl19