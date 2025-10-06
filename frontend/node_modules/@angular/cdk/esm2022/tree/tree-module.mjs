/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkTreeNodeOutlet } from './outlet';
import { CdkTreeNodePadding } from './padding';
import { CdkTreeNodeToggle } from './toggle';
import { CdkTree, CdkTreeNode } from './tree';
import { CdkTreeNodeDef } from './node';
import { CdkNestedTreeNode } from './nested-node';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [
    CdkNestedTreeNode,
    CdkTreeNodeDef,
    CdkTreeNodePadding,
    CdkTreeNodeToggle,
    CdkTree,
    CdkTreeNode,
    CdkTreeNodeOutlet,
];
export class CdkTreeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeModule, imports: [CdkNestedTreeNode,
            CdkTreeNodeDef,
            CdkTreeNodePadding,
            CdkTreeNodeToggle,
            CdkTree,
            CdkTreeNode,
            CdkTreeNodeOutlet], exports: [CdkNestedTreeNode,
            CdkTreeNodeDef,
            CdkTreeNodePadding,
            CdkTreeNodeToggle,
            CdkTree,
            CdkTreeNode,
            CdkTreeNodeOutlet] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: EXPORTED_DECLARATIONS,
                    exports: EXPORTED_DECLARATIONS,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RyZWUvdHJlZS1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDM0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMzQyxPQUFPLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUM1QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFaEQsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixpQkFBaUI7SUFDakIsY0FBYztJQUNkLGtCQUFrQjtJQUNsQixpQkFBaUI7SUFDakIsT0FBTztJQUNQLFdBQVc7SUFDWCxpQkFBaUI7Q0FDbEIsQ0FBQztBQU1GLE1BQU0sT0FBTyxhQUFhO3FIQUFiLGFBQWE7c0hBQWIsYUFBYSxZQWJ4QixpQkFBaUI7WUFDakIsY0FBYztZQUNkLGtCQUFrQjtZQUNsQixpQkFBaUI7WUFDakIsT0FBTztZQUNQLFdBQVc7WUFDWCxpQkFBaUIsYUFOakIsaUJBQWlCO1lBQ2pCLGNBQWM7WUFDZCxrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLE9BQU87WUFDUCxXQUFXO1lBQ1gsaUJBQWlCO3NIQU9OLGFBQWE7O2tHQUFiLGFBQWE7a0JBSnpCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtvQkFDOUIsT0FBTyxFQUFFLHFCQUFxQjtpQkFDL0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka1RyZWVOb2RlT3V0bGV0fSBmcm9tICcuL291dGxldCc7XG5pbXBvcnQge0Nka1RyZWVOb2RlUGFkZGluZ30gZnJvbSAnLi9wYWRkaW5nJztcbmltcG9ydCB7Q2RrVHJlZU5vZGVUb2dnbGV9IGZyb20gJy4vdG9nZ2xlJztcbmltcG9ydCB7Q2RrVHJlZSwgQ2RrVHJlZU5vZGV9IGZyb20gJy4vdHJlZSc7XG5pbXBvcnQge0Nka1RyZWVOb2RlRGVmfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0IHtDZGtOZXN0ZWRUcmVlTm9kZX0gZnJvbSAnLi9uZXN0ZWQtbm9kZSc7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrTmVzdGVkVHJlZU5vZGUsXG4gIENka1RyZWVOb2RlRGVmLFxuICBDZGtUcmVlTm9kZVBhZGRpbmcsXG4gIENka1RyZWVOb2RlVG9nZ2xlLFxuICBDZGtUcmVlLFxuICBDZGtUcmVlTm9kZSxcbiAgQ2RrVHJlZU5vZGVPdXRsZXQsXG5dO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVHJlZU1vZHVsZSB7fVxuIl19