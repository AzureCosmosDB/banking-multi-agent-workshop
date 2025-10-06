/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT, Location } from '@angular/common';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector, NgZone, ANIMATION_MODULE_TYPE, Optional, EnvironmentInjector, } from '@angular/core';
import { OverlayKeyboardDispatcher } from './dispatchers/overlay-keyboard-dispatcher';
import { OverlayOutsideClickDispatcher } from './dispatchers/overlay-outside-click-dispatcher';
import { OverlayConfig } from './overlay-config';
import { OverlayContainer } from './overlay-container';
import { OverlayRef } from './overlay-ref';
import { OverlayPositionBuilder } from './position/overlay-position-builder';
import { ScrollStrategyOptions } from './scroll/index';
import * as i0 from "@angular/core";
import * as i1 from "./scroll/index";
import * as i2 from "./overlay-container";
import * as i3 from "./position/overlay-position-builder";
import * as i4 from "./dispatchers/overlay-keyboard-dispatcher";
import * as i5 from "@angular/cdk/bidi";
import * as i6 from "@angular/common";
import * as i7 from "./dispatchers/overlay-outside-click-dispatcher";
/** Next overlay unique ID. */
let nextUniqueId = 0;
// Note that Overlay is *not* scoped to the app root because of the ComponentFactoryResolver
// which needs to be different depending on where OverlayModule is imported.
/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
export class Overlay {
    constructor(
    /** Scrolling strategies that can be used when creating an overlay. */
    scrollStrategies, _overlayContainer, _componentFactoryResolver, _positionBuilder, _keyboardDispatcher, _injector, _ngZone, _document, _directionality, _location, _outsideClickDispatcher, _animationsModuleType) {
        this.scrollStrategies = scrollStrategies;
        this._overlayContainer = _overlayContainer;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._positionBuilder = _positionBuilder;
        this._keyboardDispatcher = _keyboardDispatcher;
        this._injector = _injector;
        this._ngZone = _ngZone;
        this._document = _document;
        this._directionality = _directionality;
        this._location = _location;
        this._outsideClickDispatcher = _outsideClickDispatcher;
        this._animationsModuleType = _animationsModuleType;
    }
    /**
     * Creates an overlay.
     * @param config Configuration applied to the overlay.
     * @returns Reference to the created overlay.
     */
    create(config) {
        const host = this._createHostElement();
        const pane = this._createPaneElement(host);
        const portalOutlet = this._createPortalOutlet(pane);
        const overlayConfig = new OverlayConfig(config);
        overlayConfig.direction = overlayConfig.direction || this._directionality.value;
        return new OverlayRef(portalOutlet, host, pane, overlayConfig, this._ngZone, this._keyboardDispatcher, this._document, this._location, this._outsideClickDispatcher, this._animationsModuleType === 'NoopAnimations', this._injector.get(EnvironmentInjector));
    }
    /**
     * Gets a position builder that can be used, via fluent API,
     * to construct and configure a position strategy.
     * @returns An overlay position builder.
     */
    position() {
        return this._positionBuilder;
    }
    /**
     * Creates the DOM element for an overlay and appends it to the overlay container.
     * @returns Newly-created pane element
     */
    _createPaneElement(host) {
        const pane = this._document.createElement('div');
        pane.id = `cdk-overlay-${nextUniqueId++}`;
        pane.classList.add('cdk-overlay-pane');
        host.appendChild(pane);
        return pane;
    }
    /**
     * Creates the host element that wraps around an overlay
     * and can be used for advanced positioning.
     * @returns Newly-create host element.
     */
    _createHostElement() {
        const host = this._document.createElement('div');
        this._overlayContainer.getContainerElement().appendChild(host);
        return host;
    }
    /**
     * Create a DomPortalOutlet into which the overlay content can be loaded.
     * @param pane The DOM element to turn into a portal outlet.
     * @returns A portal outlet for the given DOM element.
     */
    _createPortalOutlet(pane) {
        // We have to resolve the ApplicationRef later in order to allow people
        // to use overlay-based providers during app initialization.
        if (!this._appRef) {
            this._appRef = this._injector.get(ApplicationRef);
        }
        return new DomPortalOutlet(pane, this._componentFactoryResolver, this._appRef, this._injector, this._document);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Overlay, deps: [{ token: i1.ScrollStrategyOptions }, { token: i2.OverlayContainer }, { token: i0.ComponentFactoryResolver }, { token: i3.OverlayPositionBuilder }, { token: i4.OverlayKeyboardDispatcher }, { token: i0.Injector }, { token: i0.NgZone }, { token: DOCUMENT }, { token: i5.Directionality }, { token: i6.Location }, { token: i7.OverlayOutsideClickDispatcher }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Overlay, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Overlay, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.ScrollStrategyOptions }, { type: i2.OverlayContainer }, { type: i0.ComponentFactoryResolver }, { type: i3.OverlayPositionBuilder }, { type: i4.OverlayKeyboardDispatcher }, { type: i0.Injector }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i5.Directionality }, { type: i6.Location }, { type: i7.OverlayOutsideClickDispatcher }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvb3ZlcmxheS9vdmVybGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsY0FBYyxFQUNkLHdCQUF3QixFQUN4QixNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEVBQ04scUJBQXFCLEVBQ3JCLFFBQVEsRUFDUixtQkFBbUIsR0FDcEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMkNBQTJDLENBQUM7QUFDcEYsT0FBTyxFQUFDLDZCQUE2QixFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDM0UsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7OztBQUVyRCw4QkFBOEI7QUFDOUIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBRXJCLDRGQUE0RjtBQUM1Riw0RUFBNEU7QUFFNUU7Ozs7Ozs7R0FPRztBQUVILE1BQU0sT0FBTyxPQUFPO0lBR2xCO0lBQ0Usc0VBQXNFO0lBQy9ELGdCQUF1QyxFQUN0QyxpQkFBbUMsRUFDbkMseUJBQW1ELEVBQ25E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QUFlLENBQ3hCLElBQUksRUFDSixJQUFJLENBQUMseUJBQXlCLEVBQzlCLElBQUksQ0FBQyxPQUFPLEVBQ1osSUFBSSxDQUFDLFNBQVMsRUFDZCxJQUFJLENBQUMsU0FBUyxDQUNmLENBQUM7SUFDSixDQUFDO3FIQXBHVSxPQUFPLDRQQVlSLFFBQVEsZ0hBSVIscUJBQXFCO3lIQWhCcEIsT0FBTyxjQURLLE1BQU07O2tHQUNsQixPQUFPO2tCQURuQixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBYTNCLE1BQU07MkJBQUMsUUFBUTs7MEJBSWYsTUFBTTsyQkFBQyxxQkFBcUI7OzBCQUFHLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtEb21Qb3J0YWxPdXRsZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtET0NVTUVOVCwgTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBcHBsaWNhdGlvblJlZixcbiAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIEFOSU1BVElPTl9NT0RVTEVfVFlQRSxcbiAgT3B0aW9uYWwsXG4gIEVudmlyb25tZW50SW5qZWN0b3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5S2V5Ym9hcmREaXNwYXRjaGVyfSBmcm9tICcuL2Rpc3BhdGNoZXJzL292ZXJsYXkta2V5Ym9hcmQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge092ZXJsYXlPdXRzaWRlQ2xpY2tEaXNwYXRjaGVyfSBmcm9tICcuL2Rpc3BhdGNoZXJzL292ZXJsYXktb3V0c2lkZS1jbGljay1kaXNwYXRjaGVyJztcbmltcG9ydCB7T3ZlcmxheUNvbmZpZ30gZnJvbSAnLi9vdmVybGF5LWNvbmZpZyc7XG5pbXBvcnQge092ZXJsYXlDb250YWluZXJ9IGZyb20gJy4vb3ZlcmxheS1jb250YWluZXInO1xuaW1wb3J0IHtPdmVybGF5UmVmfSBmcm9tICcuL292ZXJsYXktcmVmJztcbmltcG9ydCB7T3ZlcmxheVBvc2l0aW9uQnVpbGRlcn0gZnJvbSAnLi9wb3NpdGlvbi9vdmVybGF5LXBvc2l0aW9uLWJ1aWxkZXInO1xuaW1wb3J0IHtTY3JvbGxTdHJhdGVneU9wdGlvbnN9IGZyb20gJy4vc2Nyb2xsL2luZGV4JztcblxuLyoqIE5leHQgb3ZlcmxheSB1bmlxdWUgSUQuICovXG5sZXQgbmV4dFVuaXF1ZUlkID0gMDtcblxuLy8gTm90ZSB0aGF0IE92ZXJsYXkgaXMgKm5vdCogc2NvcGVkIHRvIHRoZSBhcHAgcm9vdCBiZWNhdXNlIG9mIHRoZSBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJcbi8vIHdoaWNoIG5lZWRzIHRvIGJlIGRpZmZlcmVudCBkZXBlbmRpbmcgb24gd2hlcmUgT3ZlcmxheU1vZHVsZSBpcyBpbXBvcnRlZC5cblxuLyoqXG4gKiBTZXJ2aWNlIHRvIGNyZWF0ZSBPdmVybGF5cy4gT3ZlcmxheXMgYXJlIGR5bmFtaWNhbGx5IGFkZGVkIHBpZWNlcyBvZiBmbG9hdGluZyBVSSwgbWVhbnQgdG8gYmVcbiAqIHVzZWQgYXMgYSBsb3ctbGV2ZWwgYnVpbGRpbmcgYmxvY2sgZm9yIG90aGVyIGNvbXBvbmVudHMuIERpYWxvZ3MsIHRvb2x0aXBzLCBtZW51cyxcbiAqIHNlbGVjdHMsIGV0Yy4gY2FuIGFsbCBiZSBidWlsdCB1c2luZyBvdmVybGF5cy4gVGhlIHNlcnZpY2Ugc2hvdWxkIHByaW1hcmlseSBiZSB1c2VkIGJ5IGF1dGhvcnNcbiAqIG9mIHJlLXVzYWJsZSBjb21wb25lbnRzIHJhdGhlciB0aGFuIGRldmVsb3BlcnMgYnVpbGRpbmcgZW5kLXVzZXIgYXBwbGljYXRpb25zLlxuICpcbiAqIEFuIG92ZXJsYXkgKmlzKiBhIFBvcnRhbE91dGxldCwgc28gYW55IGtpbmQgb2YgUG9ydGFsIGNhbiBiZSBsb2FkZWQgaW50byBvbmUuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXkge1xuICBwcml2YXRlIF9hcHBSZWY6IEFwcGxpY2F0aW9uUmVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBTY3JvbGxpbmcgc3RyYXRlZ2llcyB0aGF0IGNhbiBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgYW4gb3ZlcmxheS4gKi9cbiAgICBwdWJsaWMgc2Nyb2xsU3RyYXRlZ2llczogU2Nyb2xsU3RyYXRlZ3lPcHRpb25zLFxuICAgIHByaXZhdGUgX292ZXJsYXlDb250YWluZXI6IE92ZXJsYXlDb250YWluZXIsXG4gICAgcHJpdmF0ZSBfY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBfcG9zaXRpb25CdWlsZGVyOiBPdmVybGF5UG9zaXRpb25CdWlsZGVyLFxuICAgIHByaXZhdGUgX2tleWJvYXJkRGlzcGF0Y2hlcjogT3ZlcmxheUtleWJvYXJkRGlzcGF0Y2hlcixcbiAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueSxcbiAgICBwcml2YXRlIF9kaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHksXG4gICAgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uLFxuICAgIHByaXZhdGUgX291dHNpZGVDbGlja0Rpc3BhdGNoZXI6IE92ZXJsYXlPdXRzaWRlQ2xpY2tEaXNwYXRjaGVyLFxuICAgIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBAT3B0aW9uYWwoKSBwcml2YXRlIF9hbmltYXRpb25zTW9kdWxlVHlwZT86IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBhcHBsaWVkIHRvIHRoZSBvdmVybGF5LlxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIGNyZWF0ZWQgb3ZlcmxheS5cbiAgICovXG4gIGNyZWF0ZShjb25maWc/OiBPdmVybGF5Q29uZmlnKTogT3ZlcmxheVJlZiB7XG4gICAgY29uc3QgaG9zdCA9IHRoaXMuX2NyZWF0ZUhvc3RFbGVtZW50KCk7XG4gICAgY29uc3QgcGFuZSA9IHRoaXMuX2NyZWF0ZVBhbmVFbGVtZW50KGhvc3QpO1xuICAgIGNvbnN0IHBvcnRhbE91dGxldCA9IHRoaXMuX2NyZWF0ZVBvcnRhbE91dGxldChwYW5lKTtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gbmV3IE92ZXJsYXlDb25maWcoY29uZmlnKTtcblxuICAgIG92ZXJsYXlDb25maWcuZGlyZWN0aW9uID0gb3ZlcmxheUNvbmZpZy5kaXJlY3Rpb24gfHwgdGhpcy5fZGlyZWN0aW9uYWxpdHkudmFsdWU7XG5cbiAgICByZXR1cm4gbmV3IE92ZXJsYXlSZWYoXG4gICAgICBwb3J0YWxPdXRsZXQsXG4gICAgICBob3N0LFxuICAgICAgcGFuZSxcbiAgICAgIG92ZXJsYXlDb25maWcsXG4gICAgICB0aGlzLl9uZ1pvbmUsXG4gICAgICB0aGlzLl9rZXlib2FyZERpc3BhdGNoZXIsXG4gICAgICB0aGlzLl9kb2N1bWVudCxcbiAgICAgIHRoaXMuX2xvY2F0aW9uLFxuICAgICAgdGhpcy5fb3V0c2lkZUNsaWNrRGlzcGF0Y2hlcixcbiAgICAgIHRoaXMuX2FuaW1hdGlvbnNNb2R1bGVUeXBlID09PSAnTm9vcEFuaW1hdGlvbnMnLFxuICAgICAgdGhpcy5faW5qZWN0b3IuZ2V0KEVudmlyb25tZW50SW5qZWN0b3IpLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHBvc2l0aW9uIGJ1aWxkZXIgdGhhdCBjYW4gYmUgdXNlZCwgdmlhIGZsdWVudCBBUEksXG4gICAqIHRvIGNvbnN0cnVjdCBhbmQgY29uZmlndXJlIGEgcG9zaXRpb24gc3RyYXRlZ3kuXG4gICAqIEByZXR1cm5zIEFuIG92ZXJsYXkgcG9zaXRpb24gYnVpbGRlci5cbiAgICovXG4gIHBvc2l0aW9uKCk6IE92ZXJsYXlQb3NpdGlvbkJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbkJ1aWxkZXI7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgRE9NIGVsZW1lbnQgZm9yIGFuIG92ZXJsYXkgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIG92ZXJsYXkgY29udGFpbmVyLlxuICAgKiBAcmV0dXJucyBOZXdseS1jcmVhdGVkIHBhbmUgZWxlbWVudFxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlUGFuZUVsZW1lbnQoaG9zdDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB7XG4gICAgY29uc3QgcGFuZSA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgcGFuZS5pZCA9IGBjZGstb3ZlcmxheS0ke25leHRVbmlxdWVJZCsrfWA7XG4gICAgcGFuZS5jbGFzc0xpc3QuYWRkKCdjZGstb3ZlcmxheS1wYW5lJyk7XG4gICAgaG9zdC5hcHBlbmRDaGlsZChwYW5lKTtcblxuICAgIHJldHVybiBwYW5lO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdyYXBzIGFyb3VuZCBhbiBvdmVybGF5XG4gICAqIGFuZCBjYW4gYmUgdXNlZCBmb3IgYWR2YW5jZWQgcG9zaXRpb25pbmcuXG4gICAqIEByZXR1cm5zIE5ld2x5LWNyZWF0ZSBob3N0IGVsZW1lbnQuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVIb3N0RWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgY29uc3QgaG9zdCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX292ZXJsYXlDb250YWluZXIuZ2V0Q29udGFpbmVyRWxlbWVudCgpLmFwcGVuZENoaWxkKGhvc3QpO1xuICAgIHJldHVybiBob3N0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIERvbVBvcnRhbE91dGxldCBpbnRvIHdoaWNoIHRoZSBvdmVybGF5IGNvbnRlbnQgY2FuIGJlIGxvYWRlZC5cbiAgICogQHBhcmFtIHBhbmUgVGhlIERPTSBlbGVtZW50IHRvIHR1cm4gaW50byBhIHBvcnRhbCBvdXRsZXQuXG4gICAqIEByZXR1cm5zIEEgcG9ydGFsIG91dGxldCBmb3IgdGhlIGdpdmVuIERPTSBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlUG9ydGFsT3V0bGV0KHBhbmU6IEhUTUxFbGVtZW50KTogRG9tUG9ydGFsT3V0bGV0IHtcbiAgICAvLyBXZSBoYXZlIHRvIHJlc29sdmUgdGhlIEFwcGxpY2F0aW9uUmVmIGxhdGVyIGluIG9yZGVyIHRvIGFsbG93IHBlb3BsZVxuICAgIC8vIHRvIHVzZSBvdmVybGF5LWJhc2VkIHByb3ZpZGVycyBkdXJpbmcgYXBwIGluaXRpYWxpemF0aW9uLlxuICAgIGlmICghdGhpcy5fYXBwUmVmKSB7XG4gICAgICB0aGlzLl9hcHBSZWYgPSB0aGlzLl9pbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERvbVBvcnRhbE91dGxldChcbiAgICAgIHBhbmUsXG4gICAgICB0aGlzLl9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICB0aGlzLl9hcHBSZWYsXG4gICAgICB0aGlzLl9pbmplY3RvcixcbiAgICAgIHRoaXMuX2RvY3VtZW50LFxuICAgICk7XG4gIH1cbn1cbiJdfQ==