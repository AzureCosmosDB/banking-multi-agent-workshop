/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkListbox, CdkOption } from './listbox';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [CdkListbox, CdkOption];
export class CdkListboxModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkListboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkListboxModule, imports: [CdkListbox, CdkOption], exports: [CdkListbox, CdkOption] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkListboxModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkListboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [...EXPORTED_DECLARATIONS],
                    exports: [...EXPORTED_DECLARATIONS],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2xpc3Rib3gvbGlzdGJveC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7QUFFaEQsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQU10RCxNQUFNLE9BQU8sZ0JBQWdCO3FIQUFoQixnQkFBZ0I7c0hBQWhCLGdCQUFnQixZQU5FLFVBQVUsRUFBRSxTQUFTLGFBQXJCLFVBQVUsRUFBRSxTQUFTO3NIQU12QyxnQkFBZ0I7O2tHQUFoQixnQkFBZ0I7a0JBSjVCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsR0FBRyxxQkFBcUIsQ0FBQztvQkFDbkMsT0FBTyxFQUFFLENBQUMsR0FBRyxxQkFBcUIsQ0FBQztpQkFDcEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka0xpc3Rib3gsIENka09wdGlvbn0gZnJvbSAnLi9saXN0Ym94JztcblxuY29uc3QgRVhQT1JURURfREVDTEFSQVRJT05TID0gW0Nka0xpc3Rib3gsIENka09wdGlvbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFsuLi5FWFBPUlRFRF9ERUNMQVJBVElPTlNdLFxuICBleHBvcnRzOiBbLi4uRVhQT1JURURfREVDTEFSQVRJT05TXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTGlzdGJveE1vZHVsZSB7fVxuIl19