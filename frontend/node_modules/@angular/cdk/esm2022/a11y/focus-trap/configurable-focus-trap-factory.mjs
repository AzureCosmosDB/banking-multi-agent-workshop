/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Injector, NgZone, Optional, inject } from '@angular/core';
import { InteractivityChecker } from '../interactivity-checker/interactivity-checker';
import { ConfigurableFocusTrap } from './configurable-focus-trap';
import { EventListenerFocusTrapInertStrategy } from './event-listener-inert-strategy';
import { FOCUS_TRAP_INERT_STRATEGY } from './focus-trap-inert-strategy';
import { FocusTrapManager } from './focus-trap-manager';
import * as i0 from "@angular/core";
import * as i1 from "../interactivity-checker/interactivity-checker";
import * as i2 from "./focus-trap-manager";
/** Factory that allows easy instantiation of configurable focus traps. */
export class ConfigurableFocusTrapFactory {
    constructor(_checker, _ngZone, _focusTrapManager, _document, _inertStrategy) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._focusTrapManager = _focusTrapManager;
        this._injector = inject(Injector);
        this._document = _document;
        // TODO split up the strategies into different modules, similar to DateAdapter.
        this._inertStrategy = _inertStrategy || new EventListenerFocusTrapInertStrategy();
    }
    create(element, config = { defer: false }) {
        let configObject;
        if (typeof config === 'boolean') {
            configObject = { defer: config };
        }
        else {
            configObject = config;
        }
        return new ConfigurableFocusTrap(element, this._checker, this._ngZone, this._document, this._focusTrapManager, this._inertStrategy, configObject, this._injector);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ConfigurableFocusTrapFactory, deps: [{ token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i2.FocusTrapManager }, { token: DOCUMENT }, { token: FOCUS_TRAP_INERT_STRATEGY, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ConfigurableFocusTrapFactory, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ConfigurableFocusTrapFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: i2.FocusTrapManager }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [FOCUS_TRAP_INERT_STRATEGY]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhYmxlLWZvY3VzLXRyYXAtZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9mb2N1cy10cmFwL2NvbmZpZ3VyYWJsZS1mb2N1cy10cmFwLWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnREFBZ0QsQ0FBQztBQUNwRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSxPQUFPLEVBQUMsbUNBQW1DLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNwRixPQUFPLEVBQUMseUJBQXlCLEVBQXlCLE1BQU0sNkJBQTZCLENBQUM7QUFDOUYsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7Ozs7QUFFdEQsMEVBQTBFO0FBRTFFLE1BQU0sT0FBTyw0QkFBNEI7SUFNdkMsWUFDVSxRQUE4QixFQUM5QixPQUFlLEVBQ2YsaUJBQW1DLEVBQ3pCLFNBQWMsRUFDZSxjQUF1QztRQUo5RSxhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQUM5QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUw1QixjQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBUzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLCtFQUErRTtRQUMvRSxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsSUFBSSxJQUFJLG1DQUFtQyxFQUFFLENBQUM7SUFDcEYsQ0FBQztJQWdCRCxNQUFNLENBQ0osT0FBb0IsRUFDcEIsU0FBZ0QsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDO1FBRTlELElBQUksWUFBeUMsQ0FBQztRQUM5QyxJQUFJLE9BQU8sTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLFlBQVksR0FBRyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQztRQUNqQyxDQUFDO2FBQU0sQ0FBQztZQUNOLFlBQVksR0FBRyxNQUFNLENBQUM7UUFDeEIsQ0FBQztRQUNELE9BQU8sSUFBSSxxQkFBcUIsQ0FDOUIsT0FBTyxFQUNQLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLE9BQU8sRUFDWixJQUFJLENBQUMsU0FBUyxFQUNkLElBQUksQ0FBQyxpQkFBaUIsRUFDdEIsSUFBSSxDQUFDLGNBQWMsRUFDbkIsWUFBWSxFQUNaLElBQUksQ0FBQyxTQUFTLENBQ2YsQ0FBQztJQUNKLENBQUM7cUhBcERVLDRCQUE0Qiw0R0FVN0IsUUFBUSxhQUNJLHlCQUF5Qjt5SEFYcEMsNEJBQTRCLGNBRGhCLE1BQU07O2tHQUNsQiw0QkFBNEI7a0JBRHhDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFXM0IsTUFBTTsyQkFBQyxRQUFROzswQkFDZixRQUFROzswQkFBSSxNQUFNOzJCQUFDLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdG9yLCBOZ1pvbmUsIE9wdGlvbmFsLCBpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJbnRlcmFjdGl2aXR5Q2hlY2tlcn0gZnJvbSAnLi4vaW50ZXJhY3Rpdml0eS1jaGVja2VyL2ludGVyYWN0aXZpdHktY2hlY2tlcic7XG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcH0gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcCc7XG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcENvbmZpZ30gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcC1jb25maWcnO1xuaW1wb3J0IHtFdmVudExpc3RlbmVyRm9jdXNUcmFwSW5lcnRTdHJhdGVneX0gZnJvbSAnLi9ldmVudC1saXN0ZW5lci1pbmVydC1zdHJhdGVneSc7XG5pbXBvcnQge0ZPQ1VTX1RSQVBfSU5FUlRfU1RSQVRFR1ksIEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3l9IGZyb20gJy4vZm9jdXMtdHJhcC1pbmVydC1zdHJhdGVneSc7XG5pbXBvcnQge0ZvY3VzVHJhcE1hbmFnZXJ9IGZyb20gJy4vZm9jdXMtdHJhcC1tYW5hZ2VyJztcblxuLyoqIEZhY3RvcnkgdGhhdCBhbGxvd3MgZWFzeSBpbnN0YW50aWF0aW9uIG9mIGNvbmZpZ3VyYWJsZSBmb2N1cyB0cmFwcy4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYWJsZUZvY3VzVHJhcEZhY3Rvcnkge1xuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByaXZhdGUgX2luZXJ0U3RyYXRlZ3k6IEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3k7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NoZWNrZXI6IEludGVyYWN0aXZpdHlDaGVja2VyLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX2ZvY3VzVHJhcE1hbmFnZXI6IEZvY3VzVHJhcE1hbmFnZXIsXG4gICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChGT0NVU19UUkFQX0lORVJUX1NUUkFURUdZKSBfaW5lcnRTdHJhdGVneT86IEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3ksXG4gICkge1xuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xuICAgIC8vIFRPRE8gc3BsaXQgdXAgdGhlIHN0cmF0ZWdpZXMgaW50byBkaWZmZXJlbnQgbW9kdWxlcywgc2ltaWxhciB0byBEYXRlQWRhcHRlci5cbiAgICB0aGlzLl9pbmVydFN0cmF0ZWd5ID0gX2luZXJ0U3RyYXRlZ3kgfHwgbmV3IEV2ZW50TGlzdGVuZXJGb2N1c1RyYXBJbmVydFN0cmF0ZWd5KCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZvY3VzLXRyYXBwZWQgcmVnaW9uIGFyb3VuZCB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgYXJvdW5kIHdoaWNoIGZvY3VzIHdpbGwgYmUgdHJhcHBlZC5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZm9jdXMgdHJhcCBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBmb2N1cyB0cmFwIGluc3RhbmNlLlxuICAgKi9cbiAgY3JlYXRlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBDb25maWd1cmFibGVGb2N1c1RyYXBDb25maWcpOiBDb25maWd1cmFibGVGb2N1c1RyYXA7XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFBhc3MgYSBjb25maWcgb2JqZWN0IGluc3RlYWQgb2YgdGhlIGBkZWZlckNhcHR1cmVFbGVtZW50c2AgZmxhZy5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjBcbiAgICovXG4gIGNyZWF0ZShlbGVtZW50OiBIVE1MRWxlbWVudCwgZGVmZXJDYXB0dXJlRWxlbWVudHM6IGJvb2xlYW4pOiBDb25maWd1cmFibGVGb2N1c1RyYXA7XG5cbiAgY3JlYXRlKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIGNvbmZpZzogQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnIHwgYm9vbGVhbiA9IHtkZWZlcjogZmFsc2V9LFxuICApOiBDb25maWd1cmFibGVGb2N1c1RyYXAge1xuICAgIGxldCBjb25maWdPYmplY3Q6IENvbmZpZ3VyYWJsZUZvY3VzVHJhcENvbmZpZztcbiAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBjb25maWdPYmplY3QgPSB7ZGVmZXI6IGNvbmZpZ307XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZ09iamVjdCA9IGNvbmZpZztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDb25maWd1cmFibGVGb2N1c1RyYXAoXG4gICAgICBlbGVtZW50LFxuICAgICAgdGhpcy5fY2hlY2tlcixcbiAgICAgIHRoaXMuX25nWm9uZSxcbiAgICAgIHRoaXMuX2RvY3VtZW50LFxuICAgICAgdGhpcy5fZm9jdXNUcmFwTWFuYWdlcixcbiAgICAgIHRoaXMuX2luZXJ0U3RyYXRlZ3ksXG4gICAgICBjb25maWdPYmplY3QsXG4gICAgICB0aGlzLl9pbmplY3RvcixcbiAgICApO1xuICB9XG59XG4iXX0=