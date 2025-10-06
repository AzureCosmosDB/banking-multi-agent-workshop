/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, inject, InjectionToken, Injector, ViewContainerRef, } from '@angular/core';
import { MENU_STACK } from './menu-stack';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken('cdk-menu-trigger');
/** Injection token used to configure the behavior of the menu when the page is scrolled. */
export const MENU_SCROLL_STRATEGY = new InjectionToken('cdk-menu-scroll-strategy', {
    providedIn: 'root',
    factory: () => {
        const overlay = inject(Overlay);
        return () => overlay.scrollStrategies.reposition();
    },
});
/**
 * Abstract directive that implements shared logic common to all menu triggers.
 * This class can be extended to create custom menu trigger types.
 */
export class CdkMenuTriggerBase {
    constructor() {
        /** The DI injector for this component. */
        this.injector = inject(Injector);
        /** The view container ref for this component */
        this.viewContainerRef = inject(ViewContainerRef);
        /** The menu stack in which this menu resides. */
        this.menuStack = inject(MENU_STACK);
        /** Function used to configure the scroll strategy for the menu. */
        this.menuScrollStrategy = inject(MENU_SCROLL_STRATEGY);
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this.overlayRef = null;
        /** Emits when this trigger is destroyed. */
        this.destroyed = new Subject();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this.stopOutsideClicksListener = merge(this.closed, this.destroyed);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Whether the attached menu is open. */
    isOpen() {
        return !!this.overlayRef?.hasAttached();
    }
    /** Registers a child menu as having been opened by this trigger. */
    registerChildMenu(child) {
        this.childMenu = child;
    }
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    getMenuContentPortal() {
        const hasMenuContentChanged = this.menuTemplateRef !== this._menuPortal?.templateRef;
        if (this.menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
            this._menuPortal = new TemplatePortal(this.menuTemplateRef, this.viewContainerRef, this.menuData, this._getChildMenuInjector());
        }
        return this._menuPortal;
    }
    /**
     * Whether the given element is inside the scope of this trigger's menu stack.
     * @param element The element to check.
     * @return Whether the element is inside the scope of this trigger's menu stack.
     */
    isElementInsideMenuStack(element) {
        for (let el = element; el; el = el?.parentElement ?? null) {
            if (el.getAttribute('data-cdk-menu-stack-id') === this.menuStack.id) {
                return true;
            }
        }
        return false;
    }
    /** Destroy and unset the overlay reference it if exists */
    _destroyOverlay() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
    /** Gets the injector to use when creating a child menu. */
    _getChildMenuInjector() {
        this._childMenuInjector =
            this._childMenuInjector ||
                Injector.create({
                    providers: [
                        { provide: MENU_TRIGGER, useValue: this },
                        { provide: MENU_STACK, useValue: this.menuStack },
                    ],
                    parent: this.injector,
                });
        return this._childMenuInjector;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuTriggerBase, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuTriggerBase, isStandalone: true, host: { properties: { "attr.aria-controls": "childMenu?.id", "attr.data-cdk-menu-stack-id": "menuStack.id" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuTriggerBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-controls]': 'childMenu?.id',
                        '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
                    },
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS10cmlnZ2VyLWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEVBR1IsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxVQUFVLEVBQVksTUFBTSxjQUFjLENBQUM7QUFDbkQsT0FBTyxFQUFvQixPQUFPLEVBQTZCLE1BQU0sc0JBQXNCLENBQUM7QUFDNUYsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQUVwQywrREFBK0Q7QUFDL0QsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFxQixrQkFBa0IsQ0FBQyxDQUFDO0FBRXZGLDRGQUE0RjtBQUM1RixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGNBQWMsQ0FDcEQsMEJBQTBCLEVBQzFCO0lBQ0UsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0NBQ0YsQ0FDRixDQUFDO0FBRUY7OztHQUdHO0FBUUgsTUFBTSxPQUFnQixrQkFBa0I7SUFQeEM7UUFRRSwwQ0FBMEM7UUFDakMsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVyQyxnREFBZ0Q7UUFDN0IscUJBQWdCLEdBQUcsTUFBTSxD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dEIsQ0FBQyxDQUFDO1FBQ0wsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDakMsQ0FBQztxSEF0SG1CLGtCQUFrQjt5R0FBbEIsa0JBQWtCOztrR0FBbEIsa0JBQWtCO2tCQVB2QyxTQUFTO21CQUFDO29CQUNULElBQUksRUFBRTt3QkFDSixzQkFBc0IsRUFBRSxlQUFlO3dCQUN2QywrQkFBK0IsRUFBRSxjQUFjO3FCQUNoRDtvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFdmVudEVtaXR0ZXIsXG4gIGluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Q29ubmVjdGVkUG9zaXRpb24sIE92ZXJsYXksIE92ZXJsYXlSZWYsIFNjcm9sbFN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgZm9yIGFuIGltcGxlbWVudGF0aW9uIG9mIE1lbnVTdGFjay4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX1RSSUdHRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrTWVudVRyaWdnZXJCYXNlPignY2RrLW1lbnUtdHJpZ2dlcicpO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgdG8gY29uZmlndXJlIHRoZSBiZWhhdmlvciBvZiB0aGUgbWVudSB3aGVuIHRoZSBwYWdlIGlzIHNjcm9sbGVkLiAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfU0NST0xMX1NUUkFURUdZID0gbmV3IEluamVjdGlvblRva2VuPCgpID0+IFNjcm9sbFN0cmF0ZWd5PihcbiAgJ2Nkay1tZW51LXNjcm9sbC1zdHJhdGVneScsXG4gIHtcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4ge1xuICAgICAgY29uc3Qgb3ZlcmxheSA9IGluamVjdChPdmVybGF5KTtcbiAgICAgIHJldHVybiAoKSA9PiBvdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpO1xuICAgIH0sXG4gIH0sXG4pO1xuXG4vKipcbiAqIEFic3RyYWN0IGRpcmVjdGl2ZSB0aGF0IGltcGxlbWVudHMgc2hhcmVkIGxvZ2ljIGNvbW1vbiB0byBhbGwgbWVudSB0cmlnZ2Vycy5cbiAqIFRoaXMgY2xhc3MgY2FuIGJlIGV4dGVuZGVkIHRvIGNyZWF0ZSBjdXN0b20gbWVudSB0cmlnZ2VyIHR5cGVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLWNvbnRyb2xzXSc6ICdjaGlsZE1lbnU/LmlkJyxcbiAgICAnW2F0dHIuZGF0YS1jZGstbWVudS1zdGFjay1pZF0nOiAnbWVudVN0YWNrLmlkJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2RrTWVudVRyaWdnZXJCYXNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBESSBpbmplY3RvciBmb3IgdGhpcyBjb21wb25lbnQuICovXG4gIHJlYWRvbmx5IGluamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICAvKiogVGhlIHZpZXcgY29udGFpbmVyIHJlZiBmb3IgdGhpcyBjb21wb25lbnQgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWYgPSBpbmplY3QoVmlld0NvbnRhaW5lclJlZik7XG5cbiAgLyoqIFRoZSBtZW51IHN0YWNrIGluIHdoaWNoIHRoaXMgbWVudSByZXNpZGVzLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWVudVN0YWNrOiBNZW51U3RhY2sgPSBpbmplY3QoTUVOVV9TVEFDSyk7XG5cbiAgLyoqIEZ1bmN0aW9uIHVzZWQgdG8gY29uZmlndXJlIHRoZSBzY3JvbGwgc3RyYXRlZ3kgZm9yIHRoZSBtZW51LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWVudVNjcm9sbFN0cmF0ZWd5ID0gaW5qZWN0KE1FTlVfU0NST0xMX1NUUkFURUdZKTtcblxuICAvKipcbiAgICogQSBsaXN0IG9mIHByZWZlcnJlZCBtZW51IHBvc2l0aW9ucyB0byBiZSB1c2VkIHdoZW4gY29uc3RydWN0aW5nIHRoZVxuICAgKiBgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5YCBmb3IgdGhpcyB0cmlnZ2VyJ3MgbWVudS5cbiAgICovXG4gIG1lbnVQb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb25bXTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gb3BlbiAqL1xuICByZWFkb25seSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gY2xvc2UgKi9cbiAgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0aGlzIHRyaWdnZXIgb3BlbnMgKi9cbiAgbWVudVRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPiB8IG51bGw7XG5cbiAgLyoqIENvbnRleHQgZGF0YSB0byBiZSBwYXNzZWQgYWxvbmcgdG8gdGhlIG1lbnUgdGVtcGxhdGUgKi9cbiAgbWVudURhdGE6IHVua25vd247XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51ICovXG4gIHByb3RlY3RlZCBvdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhpcyB0cmlnZ2VyIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG91dHNpZGUgcG9pbnRlciBldmVudHMgbGlzdGVuZXIgb24gdGhlIG92ZXJsYXkgc2hvdWxkIGJlIHN0b3BwZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyID0gbWVyZ2UodGhpcy5jbG9zZWQsIHRoaXMuZGVzdHJveWVkKTtcblxuICAvKiogVGhlIGNoaWxkIG1lbnUgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJvdGVjdGVkIGNoaWxkTWVudT86IE1lbnU7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX21lbnVQb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIC8qKiBUaGUgaW5qZWN0b3IgdG8gdXNlIGZvciB0aGUgY2hpbGQgbWVudSBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9jaGlsZE1lbnVJbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3lPdmVybGF5KCk7XG5cbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdHRhY2hlZCBtZW51IGlzIG9wZW4uICovXG4gIGlzT3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLm92ZXJsYXlSZWY/Lmhhc0F0dGFjaGVkKCk7XG4gIH1cblxuICAvKiogUmVnaXN0ZXJzIGEgY2hpbGQgbWVudSBhcyBoYXZpbmcgYmVlbiBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICByZWdpc3RlckNoaWxkTWVudShjaGlsZDogTWVudSkge1xuICAgIHRoaXMuY2hpbGRNZW51ID0gY2hpbGQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwb3J0YWwgdG8gYmUgYXR0YWNoZWQgdG8gdGhlIG92ZXJsYXkgd2hpY2ggY29udGFpbnMgdGhlIG1lbnUuIEFsbG93cyBmb3IgdGhlIG1lbnVcbiAgICogY29udGVudCB0byBjaGFuZ2UgZHluYW1pY2FsbHkgYW5kIGJlIHJlZmxlY3RlZCBpbiB0aGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0TWVudUNvbnRlbnRQb3J0YWwoKSB7XG4gICAgY29uc3QgaGFzTWVudUNvbnRlbnRDaGFuZ2VkID0gdGhpcy5tZW51VGVtcGxhdGVSZWYgIT09IHRoaXMuX21lbnVQb3J0YWw/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLm1lbnVUZW1wbGF0ZVJlZiAmJiAoIXRoaXMuX21lbnVQb3J0YWwgfHwgaGFzTWVudUNvbnRlbnRDaGFuZ2VkKSkge1xuICAgICAgdGhpcy5fbWVudVBvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy5tZW51VGVtcGxhdGVSZWYsXG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgdGhpcy5tZW51RGF0YSxcbiAgICAgICAgdGhpcy5fZ2V0Q2hpbGRNZW51SW5qZWN0b3IoKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21lbnVQb3J0YWw7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBpbnNpZGUgdGhlIHNjb3BlIG9mIHRoaXMgdHJpZ2dlcidzIG1lbnUgc3RhY2suXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgaW5zaWRlIHRoZSBzY29wZSBvZiB0aGlzIHRyaWdnZXIncyBtZW51IHN0YWNrLlxuICAgKi9cbiAgcHJvdGVjdGVkIGlzRWxlbWVudEluc2lkZU1lbnVTdGFjayhlbGVtZW50OiBFbGVtZW50KSB7XG4gICAgZm9yIChsZXQgZWw6IEVsZW1lbnQgfCBudWxsID0gZWxlbWVudDsgZWw7IGVsID0gZWw/LnBhcmVudEVsZW1lbnQgPz8gbnVsbCkge1xuICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jZGstbWVudS1zdGFjay1pZCcpID09PSB0aGlzLm1lbnVTdGFjay5pZCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMgKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIGluamVjdG9yIHRvIHVzZSB3aGVuIGNyZWF0aW5nIGEgY2hpbGQgbWVudS4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q2hpbGRNZW51SW5qZWN0b3IoKSB7XG4gICAgdGhpcy5fY2hpbGRNZW51SW5qZWN0b3IgPVxuICAgICAgdGhpcy5fY2hpbGRNZW51SW5qZWN0b3IgfHxcbiAgICAgIEluamVjdG9yLmNyZWF0ZSh7XG4gICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgIHtwcm92aWRlOiBNRU5VX1RSSUdHRVIsIHVzZVZhbHVlOiB0aGlzfSxcbiAgICAgICAgICB7cHJvdmlkZTogTUVOVV9TVEFDSywgdXNlVmFsdWU6IHRoaXMubWVudVN0YWNrfSxcbiAgICAgICAgXSxcbiAgICAgICAgcGFyZW50OiB0aGlzLmluamVjdG9yLFxuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkTWVudUluamVjdG9yO1xuICB9XG59XG4iXX0=