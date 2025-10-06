/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor, FocusTrapFactory, InteractivityChecker, } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';
import { Platform, _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { BasePortalOutlet, CdkPortalOutlet, } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Injector, NgZone, Optional, ViewChild, ViewEncapsulation, afterNextRender, inject, } from '@angular/core';
import { DialogConfig } from './dialog-config';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
import * as i2 from "@angular/cdk/overlay";
export function throwDialogContentAlreadyAttachedError() {
    throw Error('Attempting to attach dialog content after content is already attached');
}
/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
export class CdkDialogContainer extends BasePortalOutlet {
    constructor(_elementRef, _focusTrapFactory, _document, _config, _interactivityChecker, _ngZone, _overlayRef, _focusMonitor) {
        super();
        this._elementRef = _elementRef;
        this._focusTrapFactory = _focusTrapFactory;
        this._config = _config;
        this._interactivityChecker = _interactivityChecker;
        this._ngZone = _ngZone;
        this._overlayRef = _overlayRef;
        this._focusMonitor = _focusMonitor;
        this._platform = inject(Platform);
        /** The class that traps and manages focus within the dialog. */
        this._focusTrap = null;
        /** Element that was focused before the dialog was opened. Save this to restore upon close. */
        this._elementFocusedBeforeDialogWasOpened = null;
        /**
         * Type of interaction that led to the dialog being closed. This is used to determine
         * whether the focus style will be applied when returning focus to its original location
         * after the dialog is closed.
         */
        this._closeInteractionType = null;
        /**
         * Queue of the IDs of the dialog's label element, based on their definition order. The first
         * ID will be used as the `aria-labelledby` value. We use a queue here to handle the case
         * where there are two or more titles in the DOM at a time and the first one is destroyed while
         * the rest are present.
         */
        this._ariaLabelledByQueue = [];
        this._changeDetectorRef = inject(ChangeDetectorRef);
        this._injector = inject(Injector);
        this._isDestroyed = false;
        /**
         * Attaches a DOM portal to the dialog container.
         * @param portal Portal to be attached.
         * @deprecated To be turned into a method.
         * @breaking-change 10.0.0
         */
        this.attachDomPortal = (portal) => {
            if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throwDialogContentAlreadyAttachedError();
            }
            const result = this._portalOutlet.attachDomPortal(portal);
            this._contentAttached();
            return result;
        };
        this._document = _document;
        if (this._config.ariaLabelledBy) {
            this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);
        }
    }
    _addAriaLabelledBy(id) {
        this._ariaLabelledByQueue.push(id);
        this._changeDetectorRef.markForCheck();
    }
    _removeAriaLabelledBy(id) {
        const index = this._ariaLabelledByQueue.indexOf(id);
        if (index > -1) {
            this._ariaLabelledByQueue.splice(index, 1);
            this._changeDetectorRef.markForCheck();
        }
    }
    _contentAttached() {
        this._initializeFocusTrap();
        this._handleBackdropClicks();
        this._captureInitialFocus();
    }
    /**
     * Can be used by child classes to customize the initial focus
     * capturing behavior (e.g. if it's tied to an animation).
     */
    _captureInitialFocus() {
        this._trapFocus();
    }
    ngOnDestroy() {
        this._isDestroyed = true;
        this._restoreFocus();
    }
    /**
     * Attach a ComponentPortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachComponentPortal(portal) {
        if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throwDialogContentAlreadyAttachedError();
        }
        const result = this._portalOutlet.attachComponentPortal(portal);
        this._contentAttached();
        return result;
    }
    /**
     * Attach a TemplatePortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachTemplatePortal(portal) {
        if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throwDialogContentAlreadyAttachedError();
        }
        const result = this._portalOutlet.attachTemplatePortal(portal);
        this._contentAttached();
        return result;
    }
    // TODO(crisbeto): this shouldn't be exposed, but there are internal references to it.
    /** Captures focus if it isn't already inside the dialog. */
    _recaptureFocus() {
        if (!this._containsFocus()) {
            this._trapFocus();
        }
    }
    /**
     * Focuses the provided element. If the element is not focusable, it will add a tabIndex
     * attribute to forcefully focus it. The attribute is removed after focus is moved.
     * @param element The element to focus.
     */
    _forceFocus(element, options) {
        if (!this._interactivityChecker.isFocusable(element)) {
            element.tabIndex = -1;
            // The tabindex attribute should be removed to avoid navigating to that element again
            this._ngZone.runOutsideAngular(() => {
                const callback = () => {
                    element.removeEventListener('blur', callback);
                    element.removeEventListener('mousedown', callback);
                    element.removeAttribute('tabindex');
                };
                element.addEventListener('blur', callback);
                element.addEventListener('mousedown', callback);
            });
        }
        element.focus(options);
    }
    /**
     * Focuses the first element that matches the given selector within the focus trap.
     * @param selector The CSS selector for the element to set focus to.
     */
    _focusByCssSelector(selector, options) {
        let elementToFocus = this._elementRef.nativeElement.querySelector(selector);
        if (elementToFocus) {
            this._forceFocus(elementToFocus, options);
        }
    }
    /**
     * Moves the focus inside the focus trap. When autoFocus is not set to 'dialog', if focus
     * cannot be moved then focus will go to the dialog container.
     */
    _trapFocus() {
        if (this._isDestroyed) {
            return;
        }
        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait until after the next render.
        afterNextRender(() => {
            const element = this._elementRef.nativeElement;
            switch (this._config.autoFocus) {
                case false:
                case 'dialog':
                    // Ensure that focus is on the dialog container. It's possible that a different
                    // component tried to move focus while the open animation was running. See:
                    // https://github.com/angular/components/issues/16215. Note that we only want to do this
                    // if the focus isn't inside the dialog already, because it's possible that the consumer
                    // turned off `autoFocus` in order to move focus themselves.
                    if (!this._containsFocus()) {
                        element.focus();
                    }
                    break;
                case true:
                case 'first-tabbable':
                    const focusedSuccessfully = this._focusTrap?.focusInitialElement();
                    // If we weren't able to find a focusable element in the dialog, then focus the dialog
                    // container instead.
                    if (!focusedSuccessfully) {
                        this._focusDialogContainer();
                    }
                    break;
                case 'first-heading':
                    this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
                    break;
                default:
                    this._focusByCssSelector(this._config.autoFocus);
                    break;
            }
        }, { injector: this._injector });
    }
    /** Restores focus to the element that was focused before the dialog opened. */
    _restoreFocus() {
        const focusConfig = this._config.restoreFocus;
        let focusTargetElement = null;
        if (typeof focusConfig === 'string') {
            focusTargetElement = this._document.querySelector(focusConfig);
        }
        else if (typeof focusConfig === 'boolean') {
            focusTargetElement = focusConfig ? this._elementFocusedBeforeDialogWasOpened : null;
        }
        else if (focusConfig) {
            focusTargetElement = focusConfig;
        }
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (this._config.restoreFocus &&
            focusTargetElement &&
            typeof focusTargetElement.focus === 'function') {
            const activeElement = _getFocusedElementPierceShadowDom();
            const element = this._elementRef.nativeElement;
            // Make sure that focus is still inside the dialog or is on the body (usually because a
            // non-focusable element like the backdrop was clicked) before moving it. It's possible that
            // the consumer moved it themselves before the animation was done, in which case we shouldn't
            // do anything.
            if (!activeElement ||
                activeElement === this._document.body ||
                activeElement === element ||
                element.contains(activeElement)) {
                if (this._focusMonitor) {
                    this._focusMonitor.focusVia(focusTargetElement, this._closeInteractionType);
                    this._closeInteractionType = null;
                }
                else {
                    focusTargetElement.focus();
                }
            }
        }
        if (this._focusTrap) {
            this._focusTrap.destroy();
        }
    }
    /** Focuses the dialog container. */
    _focusDialogContainer() {
        // Note that there is no focus method when rendering on the server.
        if (this._elementRef.nativeElement.focus) {
            this._elementRef.nativeElement.focus();
        }
    }
    /** Returns whether focus is inside the dialog. */
    _containsFocus() {
        const element = this._elementRef.nativeElement;
        const activeElement = _getFocusedElementPierceShadowDom();
        return element === activeElement || element.contains(activeElement);
    }
    /** Sets up the focus trap. */
    _initializeFocusTrap() {
        if (this._platform.isBrowser) {
            this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
            // Save the previously focused element. This element will be re-focused
            // when the dialog closes.
            if (this._document) {
                this._elementFocusedBeforeDialogWasOpened = _getFocusedElementPierceShadowDom();
            }
        }
    }
    /** Sets up the listener that handles clicks on the dialog backdrop. */
    _handleBackdropClicks() {
        // Clicking on the backdrop will move focus out of dialog.
        // Recapture it if closing via the backdrop is disabled.
        this._overlayRef.backdropClick().subscribe(() => {
            if (this._config.disableClose) {
                this._recaptureFocus();
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDialogContainer, deps: [{ token: i0.ElementRef }, { token: i1.FocusTrapFactory }, { token: DOCUMENT, optional: true }, { token: DialogConfig }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i2.OverlayRef }, { token: i1.FocusMonitor }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkDialogContainer, isStandalone: true, selector: "cdk-dialog-container", host: { attributes: { "tabindex": "-1" }, properties: { "attr.id": "_config.id || null", "attr.role": "_config.role", "attr.aria-modal": "_config.ariaModal", "attr.aria-labelledby": "_config.ariaLabel ? null : _ariaLabelledByQueue[0]", "attr.aria-label": "_config.ariaLabel", "attr.aria-describedby": "_config.ariaDescribedBy || null" }, classAttribute: "cdk-dialog-container" }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<ng-template cdkPortalOutlet />\n", styles: [".cdk-dialog-container{display:block;width:100%;height:100%;min-height:inherit;max-height:inherit}"], dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDialogContainer, decorators: [{
            type: Component,
            args: [{ selector: 'cdk-dialog-container', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, standalone: true, imports: [CdkPortalOutlet], host: {
                        'class': 'cdk-dialog-container',
                        'tabindex': '-1',
                        '[attr.id]': '_config.id || null',
                        '[attr.role]': '_config.role',
                        '[attr.aria-modal]': '_config.ariaModal',
                        '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
                        '[attr.aria-label]': '_config.ariaLabel',
                        '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
                    }, template: "<ng-template cdkPortalOutlet />\n", styles: [".cdk-dialog-container{display:block;width:100%;height:100%;min-height:inherit;max-height:inherit}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.FocusTrapFactory }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DialogConfig]
                }] }, { type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: i2.OverlayRef }, { type: i1.FocusMonitor }], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZGlhbG9nL2RpYWxvZy1jb250YWluZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFlBQVksRUFHWixnQkFBZ0IsRUFDaEIsb0JBQW9CLEdBQ3JCLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxRQUFRLEVBQUUsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRixPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FJaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFVBQVUsRUFFVixNQUFNLEVBQ04sUUFBUSxFQUNSLE1BQU0sRUFFTixRQUFRLEVBQ1IsU0FBUyxFQUNULGlCQUFpQixFQUNqQixlQUFlLEVBQ2YsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7OztBQUU3QyxNQUFNLFVBQVUsc0NBQXNDO0lBQ3BELE1BQU0sS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7QUFDdkYsQ0FBQztBQUVEOzs7R0FHRztBQXNCSCxNQUFNLE9BQU8sa0JBQ1gsU0FBUSxnQkFBZ0I7SUFvQ3hCLFlBQ1ksV0FBdUIsRUFDdkIsaUJBQW1DLEVBQ2YsU0FBYyxFQUNiLE9BQVUsRUFDakMscUJBQTJDLEVBQ3pDLE9BQWUsRUFDakIsV0FBdUIsRUFD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RSxzQkFBc0IsaUJBR2pCLGlCQUFpQixDQUFDLElBQUksbUJBR3BCLHVCQUF1QixDQUFDLE9BQU8sY0FDcEMsSUFBSSxXQUNQLENBQUMsZUFBZSxDQUFDLFFBQ3BCO3dCQUNKLE9BQU8sRUFBRSxzQkFBc0I7d0JBQy9CLFVBQVUsRUFBRSxJQUFJO3dCQUNoQixXQUFXLEVBQUUsb0JBQW9CO3dCQUNqQyxhQUFhLEVBQUUsY0FBYzt3QkFDN0IsbUJBQW1CLEVBQUUsbUJBQW1CO3dCQUN4Qyx3QkFBd0IsRUFBRSxvREFBb0Q7d0JBQzlFLG1CQUFtQixFQUFFLG1CQUFtQjt3QkFDeEMseUJBQXlCLEVBQUUsaUNBQWlDO3FCQUM3RDs7MEJBMENFLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBQzNCLE1BQU07MkJBQUMsWUFBWTtxSkFqQ3NCLGFBQWE7c0JBQXhELFNBQVM7dUJBQUMsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBGb2N1c01vbml0b3IsXG4gIEZvY3VzT3JpZ2luLFxuICBGb2N1c1RyYXAsXG4gIEZvY3VzVHJhcEZhY3RvcnksXG4gIEludGVyYWN0aXZpdHlDaGVja2VyLFxufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge092ZXJsYXlSZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UGxhdGZvcm0sIF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7XG4gIEJhc2VQb3J0YWxPdXRsZXQsXG4gIENka1BvcnRhbE91dGxldCxcbiAgQ29tcG9uZW50UG9ydGFsLFxuICBEb21Qb3J0YWwsXG4gIFRlbXBsYXRlUG9ydGFsLFxufSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0b3IsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgYWZ0ZXJOZXh0UmVuZGVyLFxuICBpbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpIHtcbiAgdGhyb3cgRXJyb3IoJ0F0dGVtcHRpbmcgdG8gYXR0YWNoIGRpYWxvZyBjb250ZW50IGFmdGVyIGNvbnRlbnQgaXMgYWxyZWFkeSBhdHRhY2hlZCcpO1xufVxuXG4vKipcbiAqIEludGVybmFsIGNvbXBvbmVudCB0aGF0IHdyYXBzIHVzZXItcHJvdmlkZWQgZGlhbG9nIGNvbnRlbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Nkay1kaWFsb2ctY29udGFpbmVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy1jb250YWluZXIuaHRtbCcsXG4gIHN0eWxlVXJsOiAnZGlhbG9nLWNvbnRhaW5lci5jc3MnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAvLyBVc2luZyBPblB1c2ggZm9yIGRpYWxvZ3MgY2F1c2VkIHNvbWUgRzMgc3luYyBpc3N1ZXMuIERpc2FibGVkIHVudGlsIHdlIGNhbiB0cmFjayB0aGVtIGRvd24uXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0Nka1BvcnRhbE91dGxldF0sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLWRpYWxvZy1jb250YWluZXInLFxuICAgICd0YWJpbmRleCc6ICctMScsXG4gICAgJ1thdHRyLmlkXSc6ICdfY29uZmlnLmlkIHx8IG51bGwnLFxuICAgICdbYXR0ci5yb2xlXSc6ICdfY29uZmlnLnJvbGUnLFxuICAgICdbYXR0ci5hcmlhLW1vZGFsXSc6ICdfY29uZmlnLmFyaWFNb2RhbCcsXG4gICAgJ1thdHRyLmFyaWEtbGFiZWxsZWRieV0nOiAnX2NvbmZpZy5hcmlhTGFiZWwgPyBudWxsIDogX2FyaWFMYWJlbGxlZEJ5UXVldWVbMF0nLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsXSc6ICdfY29uZmlnLmFyaWFMYWJlbCcsXG4gICAgJ1thdHRyLmFyaWEtZGVzY3JpYmVkYnldJzogJ19jb25maWcuYXJpYURlc2NyaWJlZEJ5IHx8IG51bGwnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEaWFsb2dDb250YWluZXI8QyBleHRlbmRzIERpYWxvZ0NvbmZpZyA9IERpYWxvZ0NvbmZpZz5cbiAgZXh0ZW5kcyBCYXNlUG9ydGFsT3V0bGV0XG4gIGltcGxlbWVudHMgT25EZXN0cm95XG57XG4gIHByaXZhdGUgX3BsYXRmb3JtID0gaW5qZWN0KFBsYXRmb3JtKTtcbiAgcHJvdGVjdGVkIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIFRoZSBwb3J0YWwgb3V0bGV0IGluc2lkZSBvZiB0aGlzIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSBkaWFsb2cgY29udGVudCB3aWxsIGJlIGxvYWRlZC4gKi9cbiAgQFZpZXdDaGlsZChDZGtQb3J0YWxPdXRsZXQsIHtzdGF0aWM6IHRydWV9KSBfcG9ydGFsT3V0bGV0OiBDZGtQb3J0YWxPdXRsZXQ7XG5cbiAgLyoqIFRoZSBjbGFzcyB0aGF0IHRyYXBzIGFuZCBtYW5hZ2VzIGZvY3VzIHdpdGhpbiB0aGUgZGlhbG9nLiAqL1xuICBwcml2YXRlIF9mb2N1c1RyYXA6IEZvY3VzVHJhcCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBFbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW5lZC4gU2F2ZSB0aGlzIHRvIHJlc3RvcmUgdXBvbiBjbG9zZS4gKi9cbiAgcHJpdmF0ZSBfZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFR5cGUgb2YgaW50ZXJhY3Rpb24gdGhhdCBsZWQgdG8gdGhlIGRpYWxvZyBiZWluZyBjbG9zZWQuIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmVcbiAgICogd2hldGhlciB0aGUgZm9jdXMgc3R5bGUgd2lsbCBiZSBhcHBsaWVkIHdoZW4gcmV0dXJuaW5nIGZvY3VzIHRvIGl0cyBvcmlnaW5hbCBsb2NhdGlvblxuICAgKiBhZnRlciB0aGUgZGlhbG9nIGlzIGNsb3NlZC5cbiAgICovXG4gIF9jbG9zZUludGVyYWN0aW9uVHlwZTogRm9jdXNPcmlnaW4gfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogUXVldWUgb2YgdGhlIElEcyBvZiB0aGUgZGlhbG9nJ3MgbGFiZWwgZWxlbWVudCwgYmFzZWQgb24gdGhlaXIgZGVmaW5pdGlvbiBvcmRlci4gVGhlIGZpcnN0XG4gICAqIElEIHdpbGwgYmUgdXNlZCBhcyB0aGUgYGFyaWEtbGFiZWxsZWRieWAgdmFsdWUuIFdlIHVzZSBhIHF1ZXVlIGhlcmUgdG8gaGFuZGxlIHRoZSBjYXNlXG4gICAqIHdoZXJlIHRoZXJlIGFyZSB0d28gb3IgbW9yZSB0aXRsZXMgaW4gdGhlIERPTSBhdCBhIHRpbWUgYW5kIHRoZSBmaXJzdCBvbmUgaXMgZGVzdHJveWVkIHdoaWxlXG4gICAqIHRoZSByZXN0IGFyZSBwcmVzZW50LlxuICAgKi9cbiAgX2FyaWFMYWJlbGxlZEJ5UXVldWU6IHN0cmluZ1tdID0gW107XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9jaGFuZ2VEZXRlY3RvclJlZiA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG5cbiAgcHJpdmF0ZSBfaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuXG4gIHByaXZhdGUgX2lzRGVzdHJveWVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgICBASW5qZWN0KERpYWxvZ0NvbmZpZykgcmVhZG9ubHkgX2NvbmZpZzogQyxcbiAgICBwcml2YXRlIF9pbnRlcmFjdGl2aXR5Q2hlY2tlcjogSW50ZXJhY3Rpdml0eUNoZWNrZXIsXG4gICAgcHJvdGVjdGVkIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcj86IEZvY3VzTW9uaXRvcixcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5hcmlhTGFiZWxsZWRCeSkge1xuICAgICAgdGhpcy5fYXJpYUxhYmVsbGVkQnlRdWV1ZS5wdXNoKHRoaXMuX2NvbmZpZy5hcmlhTGFiZWxsZWRCeSk7XG4gICAgfVxuICB9XG5cbiAgX2FkZEFyaWFMYWJlbGxlZEJ5KGlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9hcmlhTGFiZWxsZWRCeVF1ZXVlLnB1c2goaWQpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgX3JlbW92ZUFyaWFMYWJlbGxlZEJ5KGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2FyaWFMYWJlbGxlZEJ5UXVldWUuaW5kZXhPZihpZCk7XG5cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5fYXJpYUxhYmVsbGVkQnlRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIF9jb250ZW50QXR0YWNoZWQoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZUZvY3VzVHJhcCgpO1xuICAgIHRoaXMuX2hhbmRsZUJhY2tkcm9wQ2xpY2tzKCk7XG4gICAgdGhpcy5fY2FwdHVyZUluaXRpYWxGb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbiBiZSB1c2VkIGJ5IGNoaWxkIGNsYXNzZXMgdG8gY3VzdG9taXplIHRoZSBpbml0aWFsIGZvY3VzXG4gICAqIGNhcHR1cmluZyBiZWhhdmlvciAoZS5nLiBpZiBpdCdzIHRpZWQgdG8gYW4gYW5pbWF0aW9uKS5cbiAgICovXG4gIHByb3RlY3RlZCBfY2FwdHVyZUluaXRpYWxGb2N1cygpIHtcbiAgICB0aGlzLl90cmFwRm9jdXMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9yZXN0b3JlRm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBDb21wb25lbnRQb3J0YWwgYXMgY29udGVudCB0byB0aGlzIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkIGFzIHRoZSBkaWFsb2cgY29udGVudC5cbiAgICovXG4gIGF0dGFjaENvbXBvbmVudFBvcnRhbDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPiB7XG4gICAgaWYgKHRoaXMuX3BvcnRhbE91dGxldC5oYXNBdHRhY2hlZCgpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2hDb21wb25lbnRQb3J0YWwocG9ydGFsKTtcbiAgICB0aGlzLl9jb250ZW50QXR0YWNoZWQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIFRlbXBsYXRlUG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqL1xuICBhdHRhY2hUZW1wbGF0ZVBvcnRhbDxUPihwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPFQ+KTogRW1iZWRkZWRWaWV3UmVmPFQ+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsT3V0bGV0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcG9ydGFsT3V0bGV0LmF0dGFjaFRlbXBsYXRlUG9ydGFsKHBvcnRhbCk7XG4gICAgdGhpcy5fY29udGVudEF0dGFjaGVkKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIERPTSBwb3J0YWwgdG8gdGhlIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxuICAgKiBAZGVwcmVjYXRlZCBUbyBiZSB0dXJuZWQgaW50byBhIG1ldGhvZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMC4wLjBcbiAgICovXG4gIG92ZXJyaWRlIGF0dGFjaERvbVBvcnRhbCA9IChwb3J0YWw6IERvbVBvcnRhbCkgPT4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxPdXRsZXQuaGFzQXR0YWNoZWQoKSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3dEaWFsb2dDb250ZW50QWxyZWFkeUF0dGFjaGVkRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuYXR0YWNoRG9tUG9ydGFsKHBvcnRhbCk7XG4gICAgdGhpcy5fY29udGVudEF0dGFjaGVkKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUT0RPKGNyaXNiZXRvKTogdGhpcyBzaG91bGRuJ3QgYmUgZXhwb3NlZCwgYnV0IHRoZXJlIGFyZSBpbnRlcm5hbCByZWZlcmVuY2VzIHRvIGl0LlxuICAvKiogQ2FwdHVyZXMgZm9jdXMgaWYgaXQgaXNuJ3QgYWxyZWFkeSBpbnNpZGUgdGhlIGRpYWxvZy4gKi9cbiAgX3JlY2FwdHVyZUZvY3VzKCkge1xuICAgIGlmICghdGhpcy5fY29udGFpbnNGb2N1cygpKSB7XG4gICAgICB0aGlzLl90cmFwRm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgcHJvdmlkZWQgZWxlbWVudC4gSWYgdGhlIGVsZW1lbnQgaXMgbm90IGZvY3VzYWJsZSwgaXQgd2lsbCBhZGQgYSB0YWJJbmRleFxuICAgKiBhdHRyaWJ1dGUgdG8gZm9yY2VmdWxseSBmb2N1cyBpdC4gVGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkIGFmdGVyIGZvY3VzIGlzIG1vdmVkLlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX2ZvcmNlRm9jdXMoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuX2ludGVyYWN0aXZpdHlDaGVja2VyLmlzRm9jdXNhYmxlKGVsZW1lbnQpKSB7XG4gICAgICBlbGVtZW50LnRhYkluZGV4ID0gLTE7XG4gICAgICAvLyBUaGUgdGFiaW5kZXggYXR0cmlidXRlIHNob3VsZCBiZSByZW1vdmVkIHRvIGF2b2lkIG5hdmlnYXRpbmcgdG8gdGhhdCBlbGVtZW50IGFnYWluXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBjYWxsYmFjayk7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBjYWxsYmFjayk7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgY2FsbGJhY2spO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBzZWxlY3RvciB3aXRoaW4gdGhlIGZvY3VzIHRyYXAuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgQ1NTIHNlbGVjdG9yIGZvciB0aGUgZWxlbWVudCB0byBzZXQgZm9jdXMgdG8uXG4gICAqL1xuICBwcml2YXRlIF9mb2N1c0J5Q3NzU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgb3B0aW9ucz86IEZvY3VzT3B0aW9ucykge1xuICAgIGxldCBlbGVtZW50VG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgc2VsZWN0b3IsXG4gICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKGVsZW1lbnRUb0ZvY3VzKSB7XG4gICAgICB0aGlzLl9mb3JjZUZvY3VzKGVsZW1lbnRUb0ZvY3VzLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgdGhlIGZvY3VzIGluc2lkZSB0aGUgZm9jdXMgdHJhcC4gV2hlbiBhdXRvRm9jdXMgaXMgbm90IHNldCB0byAnZGlhbG9nJywgaWYgZm9jdXNcbiAgICogY2Fubm90IGJlIG1vdmVkIHRoZW4gZm9jdXMgd2lsbCBnbyB0byB0aGUgZGlhbG9nIGNvbnRhaW5lci5cbiAgICovXG4gIHByb3RlY3RlZCBfdHJhcEZvY3VzKCkge1xuICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHdlcmUgdG8gYXR0ZW1wdCB0byBmb2N1cyBpbW1lZGlhdGVseSwgdGhlbiB0aGUgY29udGVudCBvZiB0aGUgZGlhbG9nIHdvdWxkIG5vdCB5ZXQgYmVcbiAgICAvLyByZWFkeSBpbiBpbnN0YW5jZXMgd2hlcmUgY2hhbmdlIGRldGVjdGlvbiBoYXMgdG8gcnVuIGZpcnN0LiBUbyBkZWFsIHdpdGggdGhpcywgd2Ugc2ltcGx5XG4gICAgLy8gd2FpdCB1bnRpbCBhZnRlciB0aGUgbmV4dCByZW5kZXIuXG4gICAgYWZ0ZXJOZXh0UmVuZGVyKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICBzd2l0Y2ggKHRoaXMuX2NvbmZpZy5hdXRvRm9jdXMpIHtcbiAgICAgICAgICBjYXNlIGZhbHNlOlxuICAgICAgICAgIGNhc2UgJ2RpYWxvZyc6XG4gICAgICAgICAgICAvLyBFbnN1cmUgdGhhdCBmb2N1cyBpcyBvbiB0aGUgZGlhbG9nIGNvbnRhaW5lci4gSXQncyBwb3NzaWJsZSB0aGF0IGEgZGlmZmVyZW50XG4gICAgICAgICAgICAvLyBjb21wb25lbnQgdHJpZWQgdG8gbW92ZSBmb2N1cyB3aGlsZSB0aGUgb3BlbiBhbmltYXRpb24gd2FzIHJ1bm5pbmcuIFNlZTpcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzE2MjE1LiBOb3RlIHRoYXQgd2Ugb25seSB3YW50IHRvIGRvIHRoaXNcbiAgICAgICAgICAgIC8vIGlmIHRoZSBmb2N1cyBpc24ndCBpbnNpZGUgdGhlIGRpYWxvZyBhbHJlYWR5LCBiZWNhdXNlIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgY29uc3VtZXJcbiAgICAgICAgICAgIC8vIHR1cm5lZCBvZmYgYGF1dG9Gb2N1c2AgaW4gb3JkZXIgdG8gbW92ZSBmb2N1cyB0aGVtc2VsdmVzLlxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jb250YWluc0ZvY3VzKCkpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgIGNhc2UgJ2ZpcnN0LXRhYmJhYmxlJzpcbiAgICAgICAgICAgIGNvbnN0IGZvY3VzZWRTdWNjZXNzZnVsbHkgPSB0aGlzLl9mb2N1c1RyYXA/LmZvY3VzSW5pdGlhbEVsZW1lbnQoKTtcbiAgICAgICAgICAgIC8vIElmIHdlIHdlcmVuJ3QgYWJsZSB0byBmaW5kIGEgZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhlIGRpYWxvZywgdGhlbiBmb2N1cyB0aGUgZGlhbG9nXG4gICAgICAgICAgICAvLyBjb250YWluZXIgaW5zdGVhZC5cbiAgICAgICAgICAgIGlmICghZm9jdXNlZFN1Y2Nlc3NmdWxseSkge1xuICAgICAgICAgICAgICB0aGlzLl9mb2N1c0RpYWxvZ0NvbnRhaW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZmlyc3QtaGVhZGluZyc6XG4gICAgICAgICAgICB0aGlzLl9mb2N1c0J5Q3NzU2VsZWN0b3IoJ2gxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIFtyb2xlPVwiaGVhZGluZ1wiXScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMuX2ZvY3VzQnlDc3NTZWxlY3Rvcih0aGlzLl9jb25maWcuYXV0b0ZvY3VzISk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtpbmplY3RvcjogdGhpcy5faW5qZWN0b3J9LFxuICAgICk7XG4gIH1cblxuICAvKiogUmVzdG9yZXMgZm9jdXMgdG8gdGhlIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyBvcGVuZWQuICovXG4gIHByaXZhdGUgX3Jlc3RvcmVGb2N1cygpIHtcbiAgICBjb25zdCBmb2N1c0NvbmZpZyA9IHRoaXMuX2NvbmZpZy5yZXN0b3JlRm9jdXM7XG4gICAgbGV0IGZvY3VzVGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIGlmICh0eXBlb2YgZm9jdXNDb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBmb2N1c1RhcmdldEVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGZvY3VzQ29uZmlnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBmb2N1c0NvbmZpZyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBmb2N1c1RhcmdldEVsZW1lbnQgPSBmb2N1c0NvbmZpZyA/IHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkIDogbnVsbDtcbiAgICB9IGVsc2UgaWYgKGZvY3VzQ29uZmlnKSB7XG4gICAgICBmb2N1c1RhcmdldEVsZW1lbnQgPSBmb2N1c0NvbmZpZztcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRoZSBleHRyYSBjaGVjaywgYmVjYXVzZSBJRSBjYW4gc2V0IHRoZSBgYWN0aXZlRWxlbWVudGAgdG8gbnVsbCBpbiBzb21lIGNhc2VzLlxuICAgIGlmIChcbiAgICAgIHRoaXMuX2NvbmZpZy5yZXN0b3JlRm9jdXMgJiZcbiAgICAgIGZvY3VzVGFyZ2V0RWxlbWVudCAmJlxuICAgICAgdHlwZW9mIGZvY3VzVGFyZ2V0RWxlbWVudC5mb2N1cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgZm9jdXMgaXMgc3RpbGwgaW5zaWRlIHRoZSBkaWFsb2cgb3IgaXMgb24gdGhlIGJvZHkgKHVzdWFsbHkgYmVjYXVzZSBhXG4gICAgICAvLyBub24tZm9jdXNhYmxlIGVsZW1lbnQgbGlrZSB0aGUgYmFja2Ryb3Agd2FzIGNsaWNrZWQpIGJlZm9yZSBtb3ZpbmcgaXQuIEl0J3MgcG9zc2libGUgdGhhdFxuICAgICAgLy8gdGhlIGNvbnN1bWVyIG1vdmVkIGl0IHRoZW1zZWx2ZXMgYmVmb3JlIHRoZSBhbmltYXRpb24gd2FzIGRvbmUsIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkbid0XG4gICAgICAvLyBkbyBhbnl0aGluZy5cbiAgICAgIGlmIChcbiAgICAgICAgIWFjdGl2ZUVsZW1lbnQgfHxcbiAgICAgICAgYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5fZG9jdW1lbnQuYm9keSB8fFxuICAgICAgICBhY3RpdmVFbGVtZW50ID09PSBlbGVtZW50IHx8XG4gICAgICAgIGVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudClcbiAgICAgICkge1xuICAgICAgICBpZiAodGhpcy5fZm9jdXNNb25pdG9yKSB7XG4gICAgICAgICAgdGhpcy5fZm9jdXNNb25pdG9yLmZvY3VzVmlhKGZvY3VzVGFyZ2V0RWxlbWVudCwgdGhpcy5fY2xvc2VJbnRlcmFjdGlvblR5cGUpO1xuICAgICAgICAgIHRoaXMuX2Nsb3NlSW50ZXJhY3Rpb25UeXBlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb2N1c1RhcmdldEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9mb2N1c1RyYXApIHtcbiAgICAgIHRoaXMuX2ZvY3VzVHJhcC5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGRpYWxvZyBjb250YWluZXIuICovXG4gIHByaXZhdGUgX2ZvY3VzRGlhbG9nQ29udGFpbmVyKCkge1xuICAgIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBubyBmb2N1cyBtZXRob2Qgd2hlbiByZW5kZXJpbmcgb24gdGhlIHNlcnZlci5cbiAgICBpZiAodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIGZvY3VzIGlzIGluc2lkZSB0aGUgZGlhbG9nLiAqL1xuICBwcml2YXRlIF9jb250YWluc0ZvY3VzKCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgIHJldHVybiBlbGVtZW50ID09PSBhY3RpdmVFbGVtZW50IHx8IGVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudCk7XG4gIH1cblxuICAvKiogU2V0cyB1cCB0aGUgZm9jdXMgdHJhcC4gKi9cbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZUZvY3VzVHJhcCgpIHtcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICB0aGlzLl9mb2N1c1RyYXAgPSB0aGlzLl9mb2N1c1RyYXBGYWN0b3J5LmNyZWF0ZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgICAvLyBTYXZlIHRoZSBwcmV2aW91c2x5IGZvY3VzZWQgZWxlbWVudC4gVGhpcyBlbGVtZW50IHdpbGwgYmUgcmUtZm9jdXNlZFxuICAgICAgLy8gd2hlbiB0aGUgZGlhbG9nIGNsb3Nlcy5cbiAgICAgIGlmICh0aGlzLl9kb2N1bWVudCkge1xuICAgICAgICB0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZURpYWxvZ1dhc09wZW5lZCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHVwIHRoZSBsaXN0ZW5lciB0aGF0IGhhbmRsZXMgY2xpY2tzIG9uIHRoZSBkaWFsb2cgYmFja2Ryb3AuICovXG4gIHByaXZhdGUgX2hhbmRsZUJhY2tkcm9wQ2xpY2tzKCkge1xuICAgIC8vIENsaWNraW5nIG9uIHRoZSBiYWNrZHJvcCB3aWxsIG1vdmUgZm9jdXMgb3V0IG9mIGRpYWxvZy5cbiAgICAvLyBSZWNhcHR1cmUgaXQgaWYgY2xvc2luZyB2aWEgdGhlIGJhY2tkcm9wIGlzIGRpc2FibGVkLlxuICAgIHRoaXMuX292ZXJsYXlSZWYuYmFja2Ryb3BDbGljaygpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fY29uZmlnLmRpc2FibGVDbG9zZSkge1xuICAgICAgICB0aGlzLl9yZWNhcHR1cmVGb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iLCI8bmctdGVtcGxhdGUgY2RrUG9ydGFsT3V0bGV0IC8+XG4iXX0=