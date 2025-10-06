/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { ANIMATION_MODULE_TYPE, ElementRef, Injectable, NgZone, inject, } from '@angular/core';
import { MAT_RIPPLE_GLOBAL_OPTIONS, MatRipple } from '../ripple';
import { Platform, _getEventTarget } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
/** The options for the MatRippleLoader's event listeners. */
const eventListenerOptions = { capture: true };
/**
 * The events that should trigger the initialization of the ripple.
 * Note that we use `mousedown`, rather than `click`, for mouse devices because
 * we can't rely on `mouseenter` in the shadow DOM and `click` happens too late.
 */
const rippleInteractionEvents = ['focus', 'mousedown', 'mouseenter', 'touchstart'];
/** The attribute attached to a component whose ripple has not yet been initialized. */
const matRippleUninitialized = 'mat-ripple-loader-uninitialized';
/** Additional classes that should be added to the ripple when it is rendered. */
const matRippleClassName = 'mat-ripple-loader-class-name';
/** Whether the ripple should be centered. */
const matRippleCentered = 'mat-ripple-loader-centered';
/** Whether the ripple should be disabled. */
const matRippleDisabled = 'mat-ripple-loader-disabled';
/**
 * Handles attaching ripples on demand.
 *
 * This service allows us to avoid eagerly creating & attaching MatRipples.
 * It works by creating & attaching a ripple only when a component is first interacted with.
 *
 * @docs-private
 */
export class MatRippleLoader {
    constructor() {
        this._document = inject(DOCUMENT, { optional: true });
        this._animationMode = inject(ANIMATION_MODULE_TYPE, { optional: true });
        this._globalRippleOptions = inject(MAT_RIPPLE_GLOBAL_OPTIONS, { optional: true });
        this._platform = inject(Platform);
        this._ngZone = inject(NgZone);
        this._hosts = new Map();
        /**
         * Handles creating and attaching component internals
         * when a component is initially interacted with.
         */
        this._onInteraction = (event) => {
            const eventTarget = _getEventTarget(event);
            if (eventTarget instanceof HTMLElement) {
                // TODO(wagnermaciel): Consider batching these events to improve runtime performance.
                const element = eventTarget.closest(`[${matRippleUninitialized}="${this._globalRippleOptions?.namespace ?? ''}"]`);
                if (element) {
                    this._createRipple(element);
                }
            }
        };
        this._ngZone.runOutsideAngular(() => {
            for (const event of rippleInteractionEvents) {
                this._document?.addEventListener(event, this._onInteraction, eventListenerOptions);
            }
        });
    }
    ngOnDestroy() {
        const hosts = this._hosts.keys();
        for (const host of hosts) {
            this.destroyRipple(host);
        }
        for (const event of rippleInteractionEvents) {
            this._document?.removeEventListener(event, this._onInteraction, eventListenerOptions);
        }
    }
    /**
     * Configures the ripple that will be rendered by the ripple loader.
     *
     * Stores the given information about how the ripple should be configured on the host
     * element so that it can later be retrived & used when the ripple is actually created.
     */
    configureRipple(host, config) {
        // Indicates that the ripple has not yet been rendered for this component.
        host.setAttribute(matRippleUninitialized, this._globalRippleOptions?.namespace ?? '');
        // Store the additional class name(s) that should be added to the ripple element.
        if (config.className || !host.hasAttribute(matRippleClassName)) {
            host.setAttribute(matRippleClassName, config.className || '');
        }
        // Store whether the ripple should be centered.
        if (config.centered) {
            host.setAttribute(matRippleCentered, '');
        }
        if (config.disabled) {
            host.setAttribute(matRippleDisabled, '');
        }
    }
    /** Returns the ripple instance for the given host element. */
    getRipple(host) {
        const ripple = this._hosts.get(host);
        return ripple || this._createRipple(host);
    }
    /** Sets the disabled state on the ripple instance corresponding to the given host element. */
    setDisabled(host, disabled) {
        const ripple = this._hosts.get(host);
        // If the ripple has already been instantiated, just disable it.
        if (ripple) {
            ripple.disabled = disabled;
            return;
        }
        // Otherwise, set an attribute so we know what the
        // disabled state should be when the ripple is initialized.
        if (disabled) {
            host.setAttribute(matRippleDisabled, '');
        }
        else {
            host.removeAttribute(matRippleDisabled);
        }
    }
    /** Creates a MatRipple and appends it to the given element. */
    _createRipple(host) {
        if (!this._document) {
            return;
        }
        const existingRipple = this._hosts.get(host);
        if (existingRipple) {
            return existingRipple;
        }
        // Create the ripple element.
        host.querySelector('.mat-ripple')?.remove();
        const rippleEl = this._document.createElement('span');
        rippleEl.classList.add('mat-ripple', host.getAttribute(matRippleClassName));
        host.append(rippleEl);
        // Create the MatRipple.
        const ripple = new MatRipple(new ElementRef(rippleEl), this._ngZone, this._platform, this._globalRippleOptions ? this._globalRippleOptions : undefined, this._animationMode ? this._animationMode : undefined);
        ripple._isInitialized = true;
        ripple.trigger = host;
        ripple.centered = host.hasAttribute(matRippleCentered);
        ripple.disabled = host.hasAttribute(matRippleDisabled);
        this.attachRipple(host, ripple);
        return ripple;
    }
    attachRipple(host, ripple) {
        host.removeAttribute(matRippleUninitialized);
        this._hosts.set(host, ripple);
    }
    destroyRipple(host) {
        const ripple = this._hosts.get(host);
        if (ripple) {
            // Since this directive is created manually, it needs to be destroyed manually too.
            // tslint:disable-next-line:no-lifecycle-invocation
            ripple.ngOnDestroy();
            this._hosts.delete(host);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatRippleLoader, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatRippleLoader, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatRippleLoader, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL3ByaXZhdGUvcmlwcGxlLWxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHFCQUFxQixFQUNyQixVQUFVLEVBQ1YsVUFBVSxFQUNWLE1BQU0sRUFFTixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHlCQUF5QixFQUFFLFNBQVMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUMvRCxPQUFPLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDOztBQUVoRSw2REFBNkQ7QUFDN0QsTUFBTSxvQkFBb0IsR0FBRyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUU3Qzs7OztHQUlHO0FBQ0gsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRW5GLHVGQUF1RjtBQUN2RixNQUFNLHNCQUFzQixHQUFHLGlDQUFpQyxDQUFDO0FBRWpFLGlGQUFpRjtBQUNqRixNQUFNLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDO0FBRTFELDZDQUE2QztBQUM3QyxNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixDQUFDO0FBRXZELDZDQUE2QztBQUM3QyxNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixDQUFDO0FBRXZEOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLE9BQU8sZUFBZTtJQVExQjtRQVBRLGNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDL0MsbUJBQWMsR0FBRyxNQUFNLENBQUMscUJBQXFCLEVBQUUs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QUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUM7cUhBdkpVLGVBQWU7eUhBQWYsZUFBZSxjQURILE1BQU07O2tHQUNsQixlQUFlO2tCQUQzQixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQU5JTUFUSU9OX01PRFVMRV9UWVBFLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3RhYmxlLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgaW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TUFUX1JJUFBMRV9HTE9CQUxfT1BUSU9OUywgTWF0UmlwcGxlfSBmcm9tICcuLi9yaXBwbGUnO1xuaW1wb3J0IHtQbGF0Zm9ybSwgX2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuXG4vKiogVGhlIG9wdGlvbnMgZm9yIHRoZSBNYXRSaXBwbGVMb2FkZXIncyBldmVudCBsaXN0ZW5lcnMuICovXG5jb25zdCBldmVudExpc3RlbmVyT3B0aW9ucyA9IHtjYXB0dXJlOiB0cnVlfTtcblxuLyoqXG4gKiBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIHRyaWdnZXIgdGhlIGluaXRpYWxpemF0aW9uIG9mIHRoZSByaXBwbGUuXG4gKiBOb3RlIHRoYXQgd2UgdXNlIGBtb3VzZWRvd25gLCByYXRoZXIgdGhhbiBgY2xpY2tgLCBmb3IgbW91c2UgZGV2aWNlcyBiZWNhdXNlXG4gKiB3ZSBjYW4ndCByZWx5IG9uIGBtb3VzZWVudGVyYCBpbiB0aGUgc2hhZG93IERPTSBhbmQgYGNsaWNrYCBoYXBwZW5zIHRvbyBsYXRlLlxuICovXG5jb25zdCByaXBwbGVJbnRlcmFjdGlvbkV2ZW50cyA9IFsnZm9jdXMnLCAnbW91c2Vkb3duJywgJ21vdXNlZW50ZXInLCAndG91Y2hzdGFydCddO1xuXG4vKiogVGhlIGF0dHJpYnV0ZSBhdHRhY2hlZCB0byBhIGNvbXBvbmVudCB3aG9zZSByaXBwbGUgaGFzIG5vdCB5ZXQgYmVlbiBpbml0aWFsaXplZC4gKi9cbmNvbnN0IG1hdFJpcHBsZVVuaW5pdGlhbGl6ZWQgPSAnbWF0LXJpcHBsZS1sb2FkZXItdW5pbml0aWFsaXplZCc7XG5cbi8qKiBBZGRpdGlvbmFsIGNsYXNzZXMgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHJpcHBsZSB3aGVuIGl0IGlzIHJlbmRlcmVkLiAqL1xuY29uc3QgbWF0UmlwcGxlQ2xhc3NOYW1lID0gJ21hdC1yaXBwbGUtbG9hZGVyLWNsYXNzLW5hbWUnO1xuXG4vKiogV2hldGhlciB0aGUgcmlwcGxlIHNob3VsZCBiZSBjZW50ZXJlZC4gKi9cbmNvbnN0IG1hdFJpcHBsZUNlbnRlcmVkID0gJ21hdC1yaXBwbGUtbG9hZGVyLWNlbnRlcmVkJztcblxuLyoqIFdoZXRoZXIgdGhlIHJpcHBsZSBzaG91bGQgYmUgZGlzYWJsZWQuICovXG5jb25zdCBtYXRSaXBwbGVEaXNhYmxlZCA9ICdtYXQtcmlwcGxlLWxvYWRlci1kaXNhYmxlZCc7XG5cbi8qKlxuICogSGFuZGxlcyBhdHRhY2hpbmcgcmlwcGxlcyBvbiBkZW1hbmQuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGFsbG93cyB1cyB0byBhdm9pZCBlYWdlcmx5IGNyZWF0aW5nICYgYXR0YWNoaW5nIE1hdFJpcHBsZXMuXG4gKiBJdCB3b3JrcyBieSBjcmVhdGluZyAmIGF0dGFjaGluZyBhIHJpcHBsZSBvbmx5IHdoZW4gYSBjb21wb25lbnQgaXMgZmlyc3QgaW50ZXJhY3RlZCB3aXRoLlxuICpcbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTWF0UmlwcGxlTG9hZGVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICBwcml2YXRlIF9hbmltYXRpb25Nb2RlID0gaW5qZWN0KEFOSU1BVElPTl9NT0RVTEVfVFlQRSwge29wdGlvbmFsOiB0cnVlfSk7XG4gIHByaXZhdGUgX2dsb2JhbFJpcHBsZU9wdGlvbnMgPSBpbmplY3QoTUFUX1JJUFBMRV9HTE9CQUxfT1BUSU9OUywge29wdGlvbmFsOiB0cnVlfSk7XG4gIHByaXZhdGUgX3BsYXRmb3JtID0gaW5qZWN0KFBsYXRmb3JtKTtcbiAgcHJpdmF0ZSBfbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG4gIHByaXZhdGUgX2hvc3RzID0gbmV3IE1hcDxIVE1MRWxlbWVudCwgTWF0UmlwcGxlPigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIHJpcHBsZUludGVyYWN0aW9uRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2RvY3VtZW50Py5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLl9vbkludGVyYWN0aW9uLCBldmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBob3N0cyA9IHRoaXMuX2hvc3RzLmtleXMoKTtcblxuICAgIGZvciAoY29uc3QgaG9zdCBvZiBob3N0cykge1xuICAgICAgdGhpcy5kZXN0cm95UmlwcGxlKGhvc3QpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZXZlbnQgb2YgcmlwcGxlSW50ZXJhY3Rpb25FdmVudHMpIHtcbiAgICAgIHRoaXMuX2RvY3VtZW50Py5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLl9vbkludGVyYWN0aW9uLCBldmVudExpc3RlbmVyT3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHJpcHBsZSB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgYnkgdGhlIHJpcHBsZSBsb2FkZXIuXG4gICAqXG4gICAqIFN0b3JlcyB0aGUgZ2l2ZW4gaW5mb3JtYXRpb24gYWJvdXQgaG93IHRoZSByaXBwbGUgc2hvdWxkIGJlIGNvbmZpZ3VyZWQgb24gdGhlIGhvc3RcbiAgICogZWxlbWVudCBzbyB0aGF0IGl0IGNhbiBsYXRlciBiZSByZXRyaXZlZCAmIHVzZWQgd2hlbiB0aGUgcmlwcGxlIGlzIGFjdHVhbGx5IGNyZWF0ZWQuXG4gICAqL1xuICBjb25maWd1cmVSaXBwbGUoXG4gICAgaG9zdDogSFRNTEVsZW1lbnQsXG4gICAgY29uZmlnOiB7XG4gICAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgICBjZW50ZXJlZD86IGJvb2xlYW47XG4gICAgICBkaXNhYmxlZD86IGJvb2xlYW47XG4gICAgfSxcbiAgKTogdm9pZCB7XG4gICAgLy8gSW5kaWNhdGVzIHRoYXQgdGhlIHJpcHBsZSBoYXMgbm90IHlldCBiZWVuIHJlbmRlcmVkIGZvciB0aGlzIGNvbXBvbmVudC5cbiAgICBob3N0LnNldEF0dHJpYnV0ZShtYXRSaXBwbGVVbmluaXRpYWxpemVkLCB0aGlzLl9nbG9iYWxSaXBwbGVPcHRpb25zPy5uYW1lc3BhY2UgPz8gJycpO1xuXG4gICAgLy8gU3RvcmUgdGhlIGFkZGl0aW9uYWwgY2xhc3MgbmFtZShzKSB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgcmlwcGxlIGVsZW1lbnQuXG4gICAgaWYgKGNvbmZpZy5jbGFzc05hbWUgfHwgIWhvc3QuaGFzQXR0cmlidXRlKG1hdFJpcHBsZUNsYXNzTmFtZSkpIHtcbiAgICAgIGhvc3Quc2V0QXR0cmlidXRlKG1hdFJpcHBsZUNsYXNzTmFtZSwgY29uZmlnLmNsYXNzTmFtZSB8fCAnJyk7XG4gICAgfVxuXG4gICAgLy8gU3RvcmUgd2hldGhlciB0aGUgcmlwcGxlIHNob3VsZCBiZSBjZW50ZXJlZC5cbiAgICBpZiAoY29uZmlnLmNlbnRlcmVkKSB7XG4gICAgICBob3N0LnNldEF0dHJpYnV0ZShtYXRSaXBwbGVDZW50ZXJlZCwgJycpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuZGlzYWJsZWQpIHtcbiAgICAgIGhvc3Quc2V0QXR0cmlidXRlKG1hdFJpcHBsZURpc2FibGVkLCAnJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIHJpcHBsZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIGhvc3QgZWxlbWVudC4gKi9cbiAgZ2V0UmlwcGxlKGhvc3Q6IEhUTUxFbGVtZW50KTogTWF0UmlwcGxlIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCByaXBwbGUgPSB0aGlzLl9ob3N0cy5nZXQoaG9zdCk7XG4gICAgcmV0dXJuIHJpcHBsZSB8fCB0aGlzLl9jcmVhdGVSaXBwbGUoaG9zdCk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgZGlzYWJsZWQgc3RhdGUgb24gdGhlIHJpcHBsZSBpbnN0YW5jZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBob3N0IGVsZW1lbnQuICovXG4gIHNldERpc2FibGVkKGhvc3Q6IEhUTUxFbGVtZW50LCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHJpcHBsZSA9IHRoaXMuX2hvc3RzLmdldChob3N0KTtcblxuICAgIC8vIElmIHRoZSByaXBwbGUgaGFzIGFscmVhZHkgYmVlbiBpbnN0YW50aWF0ZWQsIGp1c3QgZGlzYWJsZSBpdC5cbiAgICBpZiAocmlwcGxlKSB7XG4gICAgICByaXBwbGUuZGlzYWJsZWQgPSBkaXNhYmxlZDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIHNldCBhbiBhdHRyaWJ1dGUgc28gd2Uga25vdyB3aGF0IHRoZVxuICAgIC8vIGRpc2FibGVkIHN0YXRlIHNob3VsZCBiZSB3aGVuIHRoZSByaXBwbGUgaXMgaW5pdGlhbGl6ZWQuXG4gICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICBob3N0LnNldEF0dHJpYnV0ZShtYXRSaXBwbGVEaXNhYmxlZCwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0LnJlbW92ZUF0dHJpYnV0ZShtYXRSaXBwbGVEaXNhYmxlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY3JlYXRpbmcgYW5kIGF0dGFjaGluZyBjb21wb25lbnQgaW50ZXJuYWxzXG4gICAqIHdoZW4gYSBjb21wb25lbnQgaXMgaW5pdGlhbGx5IGludGVyYWN0ZWQgd2l0aC5cbiAgICovXG4gIHByaXZhdGUgX29uSW50ZXJhY3Rpb24gPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgZXZlbnRUYXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuXG4gICAgaWYgKGV2ZW50VGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgIC8vIFRPRE8od2FnbmVybWFjaWVsKTogQ29uc2lkZXIgYmF0Y2hpbmcgdGhlc2UgZXZlbnRzIHRvIGltcHJvdmUgcnVudGltZSBwZXJmb3JtYW5jZS5cbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudFRhcmdldC5jbG9zZXN0KFxuICAgICAgICBgWyR7bWF0UmlwcGxlVW5pbml0aWFsaXplZH09XCIke3RoaXMuX2dsb2JhbFJpcHBsZU9wdGlvbnM/Lm5hbWVzcGFjZSA/PyAnJ31cIl1gLFxuICAgICAgKTtcblxuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlUmlwcGxlKGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKiogQ3JlYXRlcyBhIE1hdFJpcHBsZSBhbmQgYXBwZW5kcyBpdCB0byB0aGUgZ2l2ZW4gZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlUmlwcGxlKGhvc3Q6IEhUTUxFbGVtZW50KTogTWF0UmlwcGxlIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIXRoaXMuX2RvY3VtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdSaXBwbGUgPSB0aGlzLl9ob3N0cy5nZXQoaG9zdCk7XG4gICAgaWYgKGV4aXN0aW5nUmlwcGxlKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdSaXBwbGU7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSByaXBwbGUgZWxlbWVudC5cbiAgICBob3N0LnF1ZXJ5U2VsZWN0b3IoJy5tYXQtcmlwcGxlJyk/LnJlbW92ZSgpO1xuICAgIGNvbnN0IHJpcHBsZUVsID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHJpcHBsZUVsLmNsYXNzTGlzdC5hZGQoJ21hdC1yaXBwbGUnLCBob3N0LmdldEF0dHJpYnV0ZShtYXRSaXBwbGVDbGFzc05hbWUpISk7XG4gICAgaG9zdC5hcHBlbmQocmlwcGxlRWwpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBNYXRSaXBwbGUuXG4gICAgY29uc3QgcmlwcGxlID0gbmV3IE1hdFJpcHBsZShcbiAgICAgIG5ldyBFbGVtZW50UmVmKHJpcHBsZUVsKSxcbiAgICAgIHRoaXMuX25nWm9uZSxcbiAgICAgIHRoaXMuX3BsYXRmb3JtLFxuICAgICAgdGhpcy5fZ2xvYmFsUmlwcGxlT3B0aW9ucyA/IHRoaXMuX2dsb2JhbFJpcHBsZU9wdGlvbnMgOiB1bmRlZmluZWQsXG4gICAgICB0aGlzLl9hbmltYXRpb25Nb2RlID8gdGhpcy5fYW5pbWF0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICApO1xuICAgIHJpcHBsZS5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgcmlwcGxlLnRyaWdnZXIgPSBob3N0O1xuICAgIHJpcHBsZS5jZW50ZXJlZCA9IGhvc3QuaGFzQXR0cmlidXRlKG1hdFJpcHBsZUNlbnRlcmVkKTtcbiAgICByaXBwbGUuZGlzYWJsZWQgPSBob3N0Lmhhc0F0dHJpYnV0ZShtYXRSaXBwbGVEaXNhYmxlZCk7XG4gICAgdGhpcy5hdHRhY2hSaXBwbGUoaG9zdCwgcmlwcGxlKTtcbiAgICByZXR1cm4gcmlwcGxlO1xuICB9XG5cbiAgYXR0YWNoUmlwcGxlKGhvc3Q6IEhUTUxFbGVtZW50LCByaXBwbGU6IE1hdFJpcHBsZSk6IHZvaWQge1xuICAgIGhvc3QucmVtb3ZlQXR0cmlidXRlKG1hdFJpcHBsZVVuaW5pdGlhbGl6ZWQpO1xuICAgIHRoaXMuX2hvc3RzLnNldChob3N0LCByaXBwbGUpO1xuICB9XG5cbiAgZGVzdHJveVJpcHBsZShob3N0OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHJpcHBsZSA9IHRoaXMuX2hvc3RzLmdldChob3N0KTtcblxuICAgIGlmIChyaXBwbGUpIHtcbiAgICAgIC8vIFNpbmNlIHRoaXMgZGlyZWN0aXZlIGlzIGNyZWF0ZWQgbWFudWFsbHksIGl0IG5lZWRzIHRvIGJlIGRlc3Ryb3llZCBtYW51YWxseSB0b28uXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tbGlmZWN5Y2xlLWludm9jYXRpb25cbiAgICAgIHJpcHBsZS5uZ09uRGVzdHJveSgpO1xuICAgICAgdGhpcy5faG9zdHMuZGVsZXRlKGhvc3QpO1xuICAgIH1cbiAgfVxufVxuIl19