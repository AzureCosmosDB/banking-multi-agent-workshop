/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { Dialog } from './dialog';
import { CdkDialogContainer } from './dialog-container';
import * as i0 from "@angular/core";
export class DialogModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: DialogModule, imports: [OverlayModule, PortalModule, A11yModule, CdkDialogContainer], exports: [
            // Re-export the PortalModule so that people extending the `CdkDialogContainer`
            // don't have to remember to import it or be faced with an unhelpful error.
            PortalModule,
            CdkDialogContainer] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DialogModule, providers: [Dialog], imports: [OverlayModule, PortalModule, A11yModule, 
            // Re-export the PortalModule so that people extending the `CdkDialogContainer`
            // don't have to remember to import it or be faced with an unhelpful error.
            PortalModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, A11yModule, CdkDialogContainer],
                    exports: [
                        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
                        // don't have to remember to import it or be faced with an unhelpful error.
                        PortalModule,
                        CdkDialogContainer,
                    ],
                    providers: [Dialog],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZGlhbG9nL2RpYWxvZy1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDOztBQVl0RCxNQUFNLE9BQU8sWUFBWTtxSEFBWixZQUFZO3NIQUFaLFlBQVksWUFUYixhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxrQkFBa0I7WUFFbkUsK0VBQStFO1lBQy9FLDJFQUEyRTtZQUMzRSxZQUFZO1lBQ1osa0JBQWtCO3NIQUlULFlBQVksYUFGWixDQUFDLE1BQU0sQ0FBQyxZQVBULGFBQWEsRUFBRSxZQUFZLEVBQUUsVUFBVTtZQUUvQywrRUFBK0U7WUFDL0UsMkVBQTJFO1lBQzNFLFlBQVk7O2tHQUtILFlBQVk7a0JBVnhCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsa0JBQWtCLENBQUM7b0JBQ3RFLE9BQU8sRUFBRTt3QkFDUCwrRUFBK0U7d0JBQy9FLDJFQUEyRTt3QkFDM0UsWUFBWTt3QkFDWixrQkFBa0I7cUJBQ25CO29CQUNELFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQztpQkFDcEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UG9ydGFsTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7QTExeU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaWFsb2d9IGZyb20gJy4vZGlhbG9nJztcbmltcG9ydCB7Q2RrRGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZSwgUG9ydGFsTW9kdWxlLCBBMTF5TW9kdWxlLCBDZGtEaWFsb2dDb250YWluZXJdLFxuICBleHBvcnRzOiBbXG4gICAgLy8gUmUtZXhwb3J0IHRoZSBQb3J0YWxNb2R1bGUgc28gdGhhdCBwZW9wbGUgZXh0ZW5kaW5nIHRoZSBgQ2RrRGlhbG9nQ29udGFpbmVyYFxuICAgIC8vIGRvbid0IGhhdmUgdG8gcmVtZW1iZXIgdG8gaW1wb3J0IGl0IG9yIGJlIGZhY2VkIHdpdGggYW4gdW5oZWxwZnVsIGVycm9yLlxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBDZGtEaWFsb2dDb250YWluZXIsXG4gIF0sXG4gIHByb3ZpZGVyczogW0RpYWxvZ10sXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ01vZHVsZSB7fVxuIl19