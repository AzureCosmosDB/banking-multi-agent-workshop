import * as i1 from '@angular/cdk/a11y';
import { A11yModule } from '@angular/cdk/a11y';
import * as i1$1 from '@angular/cdk/overlay';
import { Overlay, OverlayConfig, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { Platform, _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import * as i0 from '@angular/core';
import { inject, ChangeDetectorRef, Injector, afterNextRender, Component, ViewEncapsulation, ChangeDetectionStrategy, Optional, Inject, ViewChild, InjectionToken, TemplateRef, Injectable, SkipSelf, NgModule } from '@angular/core';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Subject, defer, of } from 'rxjs';
import { Directionality } from '@angular/cdk/bidi';
import { startWith } from 'rxjs/operators';

/** Configuration for opening a modal dialog. */
class DialogConfig {
    constructor() {
        /** The ARIA role of the dialog element. */
        this.role = 'dialog';
        /** Optional CSS class or classes applied to the overlay panel. */
        this.panelClass = '';
        /** Whether the dialog has a backdrop. */
        this.hasBackdrop = true;
        /** Optional CSS class or classes applied to the overlay backdrop. */
        this.backdropClass = '';
        /** Whether the dialog closes with the escape key or pointer events outside the panel element. */
        this.disableClose = false;
        /** Width of the dialog. */
        this.width = '';
        /** Height of the dialog. */
        this.height = '';
        /** Data being injected into the child component. */
        this.data = null;
        /** ID of the element that describes the dialog. */
        this.ariaDescribedBy = null;
        /** ID of the element that labels the dialog. */
        this.ariaLabelledBy = null;
        /** Dialog label applied via `aria-label` */
        this.ariaLabel = null;
        /** Whether this is a modal dialog. Used to set the `aria-modal` attribute. */
        this.ariaModal = true;
        /**
         * Where the dialog should focus on open.
         * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or
         * AutoFocusTarget instead.
         */
        this.autoFocus = 'first-tabbable';
        /**
         * Whether the dialog should restore focus to the previously-focused element upon closing.
         * Has the following behavior based on the type that is passed in:
         * - `boolean` - when true, will return focus to the element that was focused before the dialog
         *    was opened, otherwise won't restore focus at all.
         * - `string` - focus will be restored to the first element that matches the CSS selector.
         * - `HTMLElement` - focus will be restored to the specific element.
         */
        this.restoreFocus = true;
        /**
         * Whether the dialog should close when the user navigates backwards or forwards through browser
         * history. This does not apply to navigation via anchor element unless using URL-hash based
         * routing (`HashLocationStrategy` in the Angular router).
         */
        this.closeOnNavigation = true;
        /**
         * Whether the dialog should close when the dialog service is destroyed. This is useful if
         * another service is wrapping the dialog and is managing the destruction instead.
         */
        this.closeOnDestroy = true;
        /**
         * Whether the dialog should close when the underlying overlay is detached. This is useful if
         * another service is wrapping the dialog and is managing the destruction instead. E.g. an
         * external detachment can happen as a result of a scroll strategy triggering it or when the
         * browser location changes.
         */
        this.closeOnOverlayDetachments = true;
    }
}

function throwDialogContentAlreadyAttachedError() {
    throw Error('Attempting to attach dialog content after content is already attached');
}
/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
class CdkDialogContainer extends BasePortalOutlet {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkDialogContainer, deps: [{ token: i0.ElementRef }, { token: i1.FocusTrapFactory }, { token: DOCUMENT, optional: true }, { token: DialogConfig }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i1$1.OverlayRef }, { token: i1.FocusMonitor }], target: i0.ɵɵFactoryTarget.Component }); }
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
                }] }, { type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: i1$1.OverlayRef }, { type: i1.FocusMonitor }], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });

/**
 * Reference to a dialog opened via the Dialog service.
 */
class DialogRef {
    constructor(overlayRef, config) {
        this.overlayRef = overlayRef;
        this.config = config;
        /** Emits when the dialog has been closed. */
        this.closed = new Subject();
        this.disableClose = config.disableClose;
        this.backdropClick = overlayRef.backdropClick();
        this.keydownEvents = overlayRef.keydownEvents();
        this.outsidePointerEvents = overlayRef.outsidePointerEvents();
        this.id = config.id; // By the time the dialog is created we are guaranteed to have an ID.
        this.keydownEvents.subscribe(event => {
            if (event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)) {
                event.preventDefault();
                this.close(undefined, { focusOrigin: 'keyboard' });
            }
        });
        this.backdropClick.subscribe(() => {
            if (!this.disableClose) {
                this.close(undefined, { focusOrigin: 'mouse' });
            }
        });
        this._detachSubscription = overlayRef.detachments().subscribe(() => {
            // Check specifically for `false`, because we want `undefined` to be treated like `true`.
            if (config.closeOnOverlayDetachments !== false) {
                this.close();
            }
        });
    }
    /**
     * Close the dialog.
     * @param result Optional result to return to the dialog opener.
     * @param options Additional options to customize the closing behavior.
     */
    close(result, options) {
        if (this.containerInstance) {
            const closedSubject = this.closed;
            this.containerInstance._closeInteractionType = options?.focusOrigin || 'program';
            // Drop the detach subscription first since it can be triggered by the
            // `dispose` call and override the result of this closing sequence.
            this._detachSubscription.unsubscribe();
            this.overlayRef.dispose();
            closedSubject.next(result);
            closedSubject.complete();
            this.componentInstance = this.containerInstance = null;
        }
    }
    /** Updates the position of the dialog based on the current position strategy. */
    updatePosition() {
        this.overlayRef.updatePosition();
        return this;
    }
    /**
     * Updates the dialog's width and height.
     * @param width New width of the dialog.
     * @param height New height of the dialog.
     */
    updateSize(width = '', height = '') {
        this.overlayRef.updateSize({ width, height });
        return this;
    }
    /** Add a CSS class or an array of classes to the overlay pane. */
    addPanelClass(classes) {
        this.overlayRef.addPanelClass(classes);
        return this;
    }
    /** Remove a CSS class or an array of classes from the overlay pane. */
    removePanelClass(classes) {
        this.overlayRef.removePanelClass(classes);
        return this;
    }
}

/** Injection token for the Dialog's ScrollStrategy. */
const DIALOG_SCROLL_STRATEGY = new InjectionToken('DialogScrollStrategy', {
    providedIn: 'root',
    factory: () => {
        const overlay = inject(Overlay);
        return () => overlay.scrollStrategies.block();
    },
});
/** Injection token for the Dialog's Data. */
const DIALOG_DATA = new InjectionToken('DialogData');
/** Injection token that can be used to provide default options for the dialog module. */
const DEFAULT_DIALOG_CONFIG = new InjectionToken('DefaultDialogConfig');
/**
 * @docs-private
 * @deprecated No longer used. To be removed.
 * @breaking-change 19.0.0
 */
function DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
    return () => overlay.scrollStrategies.block();
}
/**
 * @docs-private
 * @deprecated No longer used. To be removed.
 * @breaking-change 19.0.0
 */
const DIALOG_SCROLL_STRATEGY_PROVIDER = {
    provide: DIALOG_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

/** Unique id for the created dialog. */
let uniqueId = 0;
class Dialog {
    /** Keeps track of the currently-open dialogs. */
    get openDialogs() {
        return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogsAtThisLevel;
    }
    /** Stream that emits when a dialog has been opened. */
    get afterOpened() {
        return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpenedAtThisLevel;
    }
    constructor(_overlay, _injector, _defaultOptions, _parentDialog, _overlayContainer, scrollStrategy) {
        this._overlay = _overlay;
        this._injector = _injector;
        this._defaultOptions = _defaultOptions;
        this._parentDialog = _parentDialog;
        this._overlayContainer = _overlayContainer;
        this._openDialogsAtThisLevel = [];
        this._afterAllClosedAtThisLevel = new Subject();
        this._afterOpenedAtThisLevel = new Subject();
        this._ariaHiddenElements = new Map();
        /**
         * Stream that emits when all open dialog have finished closing.
         * Will emit on subscribe if there are no open dialogs to begin with.
         */
        this.afterAllClosed = defer(() => this.openDialogs.length
            ? this._getAfterAllClosed()
            : this._getAfterAllClosed().pipe(startWith(undefined)));
        this._scrollStrategy = scrollStrategy;
    }
    open(componentOrTemplateRef, config) {
        const defaults = (this._defaultOptions || new DialogConfig());
        config = { ...defaults, ...config };
        config.id = config.id || `cdk-dialog-${uniqueId++}`;
        if (config.id &&
            this.getDialogById(config.id) &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        const overlayConfig = this._getOverlayConfig(config);
        const overlayRef = this._overlay.create(overlayConfig);
        const dialogRef = new DialogRef(overlayRef, config);
        const dialogContainer = this._attachContainer(overlayRef, dialogRef, config);
        dialogRef.containerInstance = dialogContainer;
        this._attachDialogContent(componentOrTemplateRef, dialogRef, dialogContainer, config);
        // If this is the first dialog that we're opening, hide all the non-overlay content.
        if (!this.openDialogs.length) {
            this._hideNonDialogContentFromAssistiveTechnology();
        }
        this.openDialogs.push(dialogRef);
        dialogRef.closed.subscribe(() => this._removeOpenDialog(dialogRef, true));
        this.afterOpened.next(dialogRef);
        return dialogRef;
    }
    /**
     * Closes all of the currently-open dialogs.
     */
    closeAll() {
        reverseForEach(this.openDialogs, dialog => dialog.close());
    }
    /**
     * Finds an open dialog by its id.
     * @param id ID to use when looking up the dialog.
     */
    getDialogById(id) {
        return this.openDialogs.find(dialog => dialog.id === id);
    }
    ngOnDestroy() {
        // Make one pass over all the dialogs that need to be untracked, but should not be closed. We
        // want to stop tracking the open dialog even if it hasn't been closed, because the tracking
        // determines when `aria-hidden` is removed from elements outside the dialog.
        reverseForEach(this._openDialogsAtThisLevel, dialog => {
            // Check for `false` specifically since we want `undefined` to be interpreted as `true`.
            if (dialog.config.closeOnDestroy === false) {
                this._removeOpenDialog(dialog, false);
            }
        });
        // Make a second pass and close the remaining dialogs. We do this second pass in order to
        // correctly dispatch the `afterAllClosed` event in case we have a mixed array of dialogs
        // that should be closed and dialogs that should not.
        reverseForEach(this._openDialogsAtThisLevel, dialog => dialog.close());
        this._afterAllClosedAtThisLevel.complete();
        this._afterOpenedAtThisLevel.complete();
        this._openDialogsAtThisLevel = [];
    }
    /**
     * Creates an overlay config from a dialog config.
     * @param config The dialog configuration.
     * @returns The overlay configuration.
     */
    _getOverlayConfig(config) {
        const state = new OverlayConfig({
            positionStrategy: config.positionStrategy ||
                this._overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: config.scrollStrategy || this._scrollStrategy(),
            panelClass: config.panelClass,
            hasBackdrop: config.hasBackdrop,
            direction: config.direction,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight,
            width: config.width,
            height: config.height,
            disposeOnNavigation: config.closeOnNavigation,
        });
        if (config.backdropClass) {
            state.backdropClass = config.backdropClass;
        }
        return state;
    }
    /**
     * Attaches a dialog container to a dialog's already-created overlay.
     * @param overlay Reference to the dialog's underlying overlay.
     * @param config The dialog configuration.
     * @returns A promise resolving to a ComponentRef for the attached container.
     */
    _attachContainer(overlay, dialogRef, config) {
        const userInjector = config.injector || config.viewContainerRef?.injector;
        const providers = [
            { provide: DialogConfig, useValue: config },
            { provide: DialogRef, useValue: dialogRef },
            { provide: OverlayRef, useValue: overlay },
        ];
        let containerType;
        if (config.container) {
            if (typeof config.container === 'function') {
                containerType = config.container;
            }
            else {
                containerType = config.container.type;
                providers.push(...config.container.providers(config));
            }
        }
        else {
            containerType = CdkDialogContainer;
        }
        const containerPortal = new ComponentPortal(containerType, config.viewContainerRef, Injector.create({ parent: userInjector || this._injector, providers }), config.componentFactoryResolver);
        const containerRef = overlay.attach(containerPortal);
        return containerRef.instance;
    }
    /**
     * Attaches the user-provided component to the already-created dialog container.
     * @param componentOrTemplateRef The type of component being loaded into the dialog,
     *     or a TemplateRef to instantiate as the content.
     * @param dialogRef Reference to the dialog being opened.
     * @param dialogContainer Component that is going to wrap the dialog content.
     * @param config Configuration used to open the dialog.
     */
    _attachDialogContent(componentOrTemplateRef, dialogRef, dialogContainer, config) {
        if (componentOrTemplateRef instanceof TemplateRef) {
            const injector = this._createInjector(config, dialogRef, dialogContainer, undefined);
            let context = { $implicit: config.data, dialogRef };
            if (config.templateContext) {
                context = {
                    ...context,
                    ...(typeof config.templateContext === 'function'
                        ? config.templateContext()
                        : config.templateContext),
                };
            }
            dialogContainer.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, null, context, injector));
        }
        else {
            const injector = this._createInjector(config, dialogRef, dialogContainer, this._injector);
            const contentRef = dialogContainer.attachComponentPortal(new ComponentPortal(componentOrTemplateRef, config.viewContainerRef, injector, config.componentFactoryResolver));
            dialogRef.componentRef = contentRef;
            dialogRef.componentInstance = contentRef.instance;
        }
    }
    /**
     * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
     * of a dialog to close itself and, optionally, to return a value.
     * @param config Config object that is used to construct the dialog.
     * @param dialogRef Reference to the dialog being opened.
     * @param dialogContainer Component that is going to wrap the dialog content.
     * @param fallbackInjector Injector to use as a fallback when a lookup fails in the custom
     * dialog injector, if the user didn't provide a custom one.
     * @returns The custom injector that can be used inside the dialog.
     */
    _createInjector(config, dialogRef, dialogContainer, fallbackInjector) {
        const userInjector = config.injector || config.viewContainerRef?.injector;
        const providers = [
            { provide: DIALOG_DATA, useValue: config.data },
            { provide: DialogRef, useValue: dialogRef },
        ];
        if (config.providers) {
            if (typeof config.providers === 'function') {
                providers.push(...config.providers(dialogRef, config, dialogContainer));
            }
            else {
                providers.push(...config.providers);
            }
        }
        if (config.direction &&
            (!userInjector ||
                !userInjector.get(Directionality, null, { optional: true }))) {
            providers.push({
                provide: Directionality,
                useValue: { value: config.direction, change: of() },
            });
        }
        return Injector.create({ parent: userInjector || fallbackInjector, providers });
    }
    /**
     * Removes a dialog from the array of open dialogs.
     * @param dialogRef Dialog to be removed.
     * @param emitEvent Whether to emit an event if this is the last dialog.
     */
    _removeOpenDialog(dialogRef, emitEvent) {
        const index = this.openDialogs.indexOf(dialogRef);
        if (index > -1) {
            this.openDialogs.splice(index, 1);
            // If all the dialogs were closed, remove/restore the `aria-hidden`
            // to a the siblings and emit to the `afterAllClosed` stream.
            if (!this.openDialogs.length) {
                this._ariaHiddenElements.forEach((previousValue, element) => {
                    if (previousValue) {
                        element.setAttribute('aria-hidden', previousValue);
                    }
                    else {
                        element.removeAttribute('aria-hidden');
                    }
                });
                this._ariaHiddenElements.clear();
                if (emitEvent) {
                    this._getAfterAllClosed().next();
                }
            }
        }
    }
    /** Hides all of the content that isn't an overlay from assistive technology. */
    _hideNonDialogContentFromAssistiveTechnology() {
        const overlayContainer = this._overlayContainer.getContainerElement();
        // Ensure that the overlay container is attached to the DOM.
        if (overlayContainer.parentElement) {
            const siblings = overlayContainer.parentElement.children;
            for (let i = siblings.length - 1; i > -1; i--) {
                const sibling = siblings[i];
                if (sibling !== overlayContainer &&
                    sibling.nodeName !== 'SCRIPT' &&
                    sibling.nodeName !== 'STYLE' &&
                    !sibling.hasAttribute('aria-live')) {
                    this._ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
                    sibling.setAttribute('aria-hidden', 'true');
                }
            }
        }
    }
    _getAfterAllClosed() {
        const parent = this._parentDialog;
        return parent ? parent._getAfterAllClosed() : this._afterAllClosedAtThisLevel;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dialog, deps: [{ token: i1$1.Overlay }, { token: i0.Injector }, { token: DEFAULT_DIALOG_CONFIG, optional: true }, { token: Dialog, optional: true, skipSelf: true }, { token: i1$1.OverlayContainer }, { token: DIALOG_SCROLL_STRATEGY }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dialog, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dialog, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1$1.Overlay }, { type: i0.Injector }, { type: DialogConfig, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DEFAULT_DIALOG_CONFIG]
                }] }, { type: Dialog, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1$1.OverlayContainer }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DIALOG_SCROLL_STRATEGY]
                }] }] });
/**
 * Executes a callback against all elements in an array while iterating in reverse.
 * Useful if the array is being modified as it is being iterated.
 */
function reverseForEach(items, callback) {
    let i = items.length;
    while (i--) {
        callback(items[i]);
    }
}

class DialogModule {
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

/**
 * Generated bundle index. Do not edit.
 */

export { CdkDialogContainer, DEFAULT_DIALOG_CONFIG, DIALOG_DATA, DIALOG_SCROLL_STRATEGY, DIALOG_SCROLL_STRATEGY_PROVIDER, DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY, Dialog, DialogConfig, DialogModule, DialogRef, throwDialogContentAlreadyAttachedError };
//# sourceMappingURL=dialog.mjs.map
