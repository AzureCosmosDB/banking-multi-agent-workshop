import * as i2 from '@angular/cdk/dialog';
import { CdkDialogContainer, Dialog, DialogModule } from '@angular/cdk/dialog';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import { EventEmitter, Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, Inject, InjectionToken, Injectable, SkipSelf, NgModule } from '@angular/core';
import { AnimationDurations, AnimationCurves, MatCommonModule } from '@angular/material/core';
import * as i1 from '@angular/cdk/a11y';
import * as i4 from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import * as i3 from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { trigger, state, style, transition, group, animate, query, animateChild } from '@angular/animations';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Subject, merge } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/** Animations used by the Material bottom sheet. */
const matBottomSheetAnimations = {
    /** Animation that shows and hides a bottom sheet. */
    bottomSheetState: trigger('state', [
        state('void, hidden', style({ transform: 'translateY(100%)' })),
        state('visible', style({ transform: 'translateY(0%)' })),
        transition('visible => void, visible => hidden', group([
            animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.ACCELERATION_CURVE}`),
            query('@*', animateChild(), { optional: true }),
        ])),
        transition('void => visible', group([
            animate(`${AnimationDurations.EXITING} ${AnimationCurves.DECELERATION_CURVE}`),
            query('@*', animateChild(), { optional: true }),
        ])),
    ]),
};

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
class MatBottomSheetContainer extends CdkDialogContainer {
    constructor(elementRef, focusTrapFactory, document, config, checker, ngZone, overlayRef, breakpointObserver, focusMonitor) {
        super(elementRef, focusTrapFactory, document, config, checker, ngZone, overlayRef, focusMonitor);
        /** The state of the bottom sheet animations. */
        this._animationState = 'void';
        /** Emits whenever the state of the animation changes. */
        this._animationStateChanged = new EventEmitter();
        this._breakpointSubscription = breakpointObserver
            .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
            .subscribe(() => {
            const classList = this._elementRef.nativeElement.classList;
            classList.toggle('mat-bottom-sheet-container-medium', breakpointObserver.isMatched(Breakpoints.Medium));
            classList.toggle('mat-bottom-sheet-container-large', breakpointObserver.isMatched(Breakpoints.Large));
            classList.toggle('mat-bottom-sheet-container-xlarge', breakpointObserver.isMatched(Breakpoints.XLarge));
        });
    }
    /** Begin animation of bottom sheet entrance into view. */
    enter() {
        if (!this._destroyed) {
            this._animationState = 'visible';
            this._changeDetectorRef.markForCheck();
            this._changeDetectorRef.detectChanges();
        }
    }
    /** Begin animation of the bottom sheet exiting from view. */
    exit() {
        if (!this._destroyed) {
            this._animationState = 'hidden';
            this._changeDetectorRef.markForCheck();
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._breakpointSubscription.unsubscribe();
        this._destroyed = true;
    }
    _onAnimationDone(event) {
        if (event.toState === 'visible') {
            this._trapFocus();
        }
        this._animationStateChanged.emit(event);
    }
    _onAnimationStart(event) {
        this._animationStateChanged.emit(event);
    }
    _captureInitialFocus() { }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetContainer, deps: [{ token: i0.ElementRef }, { token: i1.FocusTrapFactory }, { token: DOCUMENT, optional: true }, { token: i2.DialogConfig }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i3.OverlayRef }, { token: i4.BreakpointObserver }, { token: i1.FocusMonitor }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatBottomSheetContainer, isStandalone: true, selector: "mat-bottom-sheet-container", host: { attributes: { "tabindex": "-1" }, listeners: { "@state.start": "_onAnimationStart($event)", "@state.done": "_onAnimationDone($event)" }, properties: { "attr.role": "_config.role", "attr.aria-modal": "_config.ariaModal", "attr.aria-label": "_config.ariaLabel", "@state": "_animationState" }, classAttribute: "mat-bottom-sheet-container" }, usesInheritance: true, ngImport: i0, template: "<ng-template cdkPortalOutlet></ng-template>\r\n", styles: [".mat-bottom-sheet-container{box-shadow:0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12);padding:8px 16px;min-width:100vw;box-sizing:border-box;display:block;outline:0;max-height:80vh;overflow:auto;background:var(--mat-bottom-sheet-container-background-color, var(--mat-app-surface-container-low));color:var(--mat-bottom-sheet-container-text-color, var(--mat-app-on-surface));font-family:var(--mat-bottom-sheet-container-text-font, var(--mat-app-body-large-font));font-size:var(--mat-bottom-sheet-container-text-size, var(--mat-app-body-large-size));line-height:var(--mat-bottom-sheet-container-text-line-height, var(--mat-app-body-large-line-height));font-weight:var(--mat-bottom-sheet-container-text-weight, var(--mat-app-body-large-weight));letter-spacing:var(--mat-bottom-sheet-container-text-tracking, var(--mat-app-body-large-tracking))}.cdk-high-contrast-active .mat-bottom-sheet-container{outline:1px solid}.mat-bottom-sheet-container-xlarge,.mat-bottom-sheet-container-large,.mat-bottom-sheet-container-medium{border-top-left-radius:var(--mat-bottom-sheet-container-shape);border-top-right-radius:var(--mat-bottom-sheet-container-shape)}.mat-bottom-sheet-container-medium{min-width:384px;max-width:calc(100vw - 128px)}.mat-bottom-sheet-container-large{min-width:512px;max-width:calc(100vw - 256px)}.mat-bottom-sheet-container-xlarge{min-width:576px;max-width:calc(100vw - 384px)}"], dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [matBottomSheetAnimations.bottomSheetState], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetContainer, decorators: [{
            type: Component,
            args: [{ selector: 'mat-bottom-sheet-container', changeDetection: ChangeDetectionStrategy.Default, encapsulation: ViewEncapsulation.None, animations: [matBottomSheetAnimations.bottomSheetState], host: {
                        'class': 'mat-bottom-sheet-container',
                        'tabindex': '-1',
                        '[attr.role]': '_config.role',
                        '[attr.aria-modal]': '_config.ariaModal',
                        '[attr.aria-label]': '_config.ariaLabel',
                        '[@state]': '_animationState',
                        '(@state.start)': '_onAnimationStart($event)',
                        '(@state.done)': '_onAnimationDone($event)',
                    }, standalone: true, imports: [CdkPortalOutlet], template: "<ng-template cdkPortalOutlet></ng-template>\r\n", styles: [".mat-bottom-sheet-container{box-shadow:0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12);padding:8px 16px;min-width:100vw;box-sizing:border-box;display:block;outline:0;max-height:80vh;overflow:auto;background:var(--mat-bottom-sheet-container-background-color, var(--mat-app-surface-container-low));color:var(--mat-bottom-sheet-container-text-color, var(--mat-app-on-surface));font-family:var(--mat-bottom-sheet-container-text-font, var(--mat-app-body-large-font));font-size:var(--mat-bottom-sheet-container-text-size, var(--mat-app-body-large-size));line-height:var(--mat-bottom-sheet-container-text-line-height, var(--mat-app-body-large-line-height));font-weight:var(--mat-bottom-sheet-container-text-weight, var(--mat-app-body-large-weight));letter-spacing:var(--mat-bottom-sheet-container-text-tracking, var(--mat-app-body-large-tracking))}.cdk-high-contrast-active .mat-bottom-sheet-container{outline:1px solid}.mat-bottom-sheet-container-xlarge,.mat-bottom-sheet-container-large,.mat-bottom-sheet-container-medium{border-top-left-radius:var(--mat-bottom-sheet-container-shape);border-top-right-radius:var(--mat-bottom-sheet-container-shape)}.mat-bottom-sheet-container-medium{min-width:384px;max-width:calc(100vw - 128px)}.mat-bottom-sheet-container-large{min-width:512px;max-width:calc(100vw - 256px)}.mat-bottom-sheet-container-xlarge{min-width:576px;max-width:calc(100vw - 384px)}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.FocusTrapFactory }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.DialogConfig }, { type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: i3.OverlayRef }, { type: i4.BreakpointObserver }, { type: i1.FocusMonitor }] });

/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
const MAT_BOTTOM_SHEET_DATA = new InjectionToken('MatBottomSheetData');
/**
 * Configuration used when opening a bottom sheet.
 */
class MatBottomSheetConfig {
    constructor() {
        /** Data being injected into the child component. */
        this.data = null;
        /** Whether the bottom sheet has a backdrop. */
        this.hasBackdrop = true;
        /** Whether the user can use escape or clicking outside to close the bottom sheet. */
        this.disableClose = false;
        /** Aria label to assign to the bottom sheet element. */
        this.ariaLabel = null;
        /** Whether this is a modal bottom sheet. Used to set the `aria-modal` attribute. */
        this.ariaModal = true;
        /**
         * Whether the bottom sheet should close when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.closeOnNavigation = true;
        // Note that this is set to 'dialog' by default, because while the a11y recommendations
        // are to focus the first focusable element, doing so prevents screen readers from reading out the
        // rest of the bottom sheet content.
        /**
         * Where the bottom sheet should focus on open.
         * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or
         * AutoFocusTarget instead.
         */
        this.autoFocus = 'dialog';
        /**
         * Whether the bottom sheet should restore focus to the
         * previously-focused element, after it's closed.
         */
        this.restoreFocus = true;
    }
}

/**
 * Reference to a bottom sheet dispatched from the bottom sheet service.
 */
class MatBottomSheetRef {
    /** Instance of the component making up the content of the bottom sheet. */
    get instance() {
        return this._ref.componentInstance;
    }
    /**
     * `ComponentRef` of the component opened into the bottom sheet. Will be
     * null when the bottom sheet is opened using a `TemplateRef`.
     */
    get componentRef() {
        return this._ref.componentRef;
    }
    constructor(_ref, config, containerInstance) {
        this._ref = _ref;
        /** Subject for notifying the user that the bottom sheet has opened and appeared. */
        this._afterOpened = new Subject();
        this.containerInstance = containerInstance;
        this.disableClose = config.disableClose;
        // Emit when opening animation completes
        containerInstance._animationStateChanged
            .pipe(filter(event => event.phaseName === 'done' && event.toState === 'visible'), take(1))
            .subscribe(() => {
            this._afterOpened.next();
            this._afterOpened.complete();
        });
        // Dispose overlay when closing animation is complete
        containerInstance._animationStateChanged
            .pipe(filter(event => event.phaseName === 'done' && event.toState === 'hidden'), take(1))
            .subscribe(() => {
            clearTimeout(this._closeFallbackTimeout);
            this._ref.close(this._result);
        });
        _ref.overlayRef.detachments().subscribe(() => {
            this._ref.close(this._result);
        });
        merge(this.backdropClick(), this.keydownEvents().pipe(filter(event => event.keyCode === ESCAPE))).subscribe(event => {
            if (!this.disableClose &&
                (event.type !== 'keydown' || !hasModifierKey(event))) {
                event.preventDefault();
                this.dismiss();
            }
        });
    }
    /**
     * Dismisses the bottom sheet.
     * @param result Data to be passed back to the bottom sheet opener.
     */
    dismiss(result) {
        if (!this.containerInstance) {
            return;
        }
        // Transition the backdrop in parallel to the bottom sheet.
        this.containerInstance._animationStateChanged
            .pipe(filter(event => event.phaseName === 'start'), take(1))
            .subscribe(event => {
            // The logic that disposes of the overlay depends on the exit animation completing, however
            // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
            // timeout which will clean everything up if the animation hasn't fired within the specified
            // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
            // vast majority of cases the timeout will have been cleared before it has fired.
            this._closeFallbackTimeout = setTimeout(() => {
                this._ref.close(this._result);
            }, event.totalTime + 100);
            this._ref.overlayRef.detachBackdrop();
        });
        this._result = result;
        this.containerInstance.exit();
        this.containerInstance = null;
    }
    /** Gets an observable that is notified when the bottom sheet is finished closing. */
    afterDismissed() {
        return this._ref.closed;
    }
    /** Gets an observable that is notified when the bottom sheet has opened and appeared. */
    afterOpened() {
        return this._afterOpened;
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick() {
        return this._ref.backdropClick;
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._ref.keydownEvents;
    }
}

/** Injection token that can be used to specify default bottom sheet options. */
const MAT_BOTTOM_SHEET_DEFAULT_OPTIONS = new InjectionToken('mat-bottom-sheet-default-options');
/**
 * Service to trigger Material Design bottom sheets.
 */
class MatBottomSheet {
    /** Reference to the currently opened bottom sheet. */
    get _openedBottomSheetRef() {
        const parent = this._parentBottomSheet;
        return parent ? parent._openedBottomSheetRef : this._bottomSheetRefAtThisLevel;
    }
    set _openedBottomSheetRef(value) {
        if (this._parentBottomSheet) {
            this._parentBottomSheet._openedBottomSheetRef = value;
        }
        else {
            this._bottomSheetRefAtThisLevel = value;
        }
    }
    constructor(_overlay, injector, _parentBottomSheet, _defaultOptions) {
        this._overlay = _overlay;
        this._parentBottomSheet = _parentBottomSheet;
        this._defaultOptions = _defaultOptions;
        this._bottomSheetRefAtThisLevel = null;
        this._dialog = injector.get(Dialog);
    }
    open(componentOrTemplateRef, config) {
        const _config = { ...(this._defaultOptions || new MatBottomSheetConfig()), ...config };
        let ref;
        this._dialog.open(componentOrTemplateRef, {
            ..._config,
            // Disable closing since we need to sync it up to the animation ourselves.
            disableClose: true,
            // Disable closing on detachments so that we can sync up the animation.
            closeOnOverlayDetachments: false,
            maxWidth: '100%',
            container: MatBottomSheetContainer,
            scrollStrategy: _config.scrollStrategy || this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position().global().centerHorizontally().bottom('0'),
            templateContext: () => ({ bottomSheetRef: ref }),
            providers: (cdkRef, _cdkConfig, container) => {
                ref = new MatBottomSheetRef(cdkRef, _config, container);
                return [
                    { provide: MatBottomSheetRef, useValue: ref },
                    { provide: MAT_BOTTOM_SHEET_DATA, useValue: _config.data },
                ];
            },
        });
        // When the bottom sheet is dismissed, clear the reference to it.
        ref.afterDismissed().subscribe(() => {
            // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
            if (this._openedBottomSheetRef === ref) {
                this._openedBottomSheetRef = null;
            }
        });
        if (this._openedBottomSheetRef) {
            // If a bottom sheet is already in view, dismiss it and enter the
            // new bottom sheet after exit animation is complete.
            this._openedBottomSheetRef.afterDismissed().subscribe(() => ref.containerInstance?.enter());
            this._openedBottomSheetRef.dismiss();
        }
        else {
            // If no bottom sheet is in view, enter the new bottom sheet.
            ref.containerInstance.enter();
        }
        this._openedBottomSheetRef = ref;
        return ref;
    }
    /**
     * Dismisses the currently-visible bottom sheet.
     * @param result Data to pass to the bottom sheet instance.
     */
    dismiss(result) {
        if (this._openedBottomSheetRef) {
            this._openedBottomSheetRef.dismiss(result);
        }
    }
    ngOnDestroy() {
        if (this._bottomSheetRefAtThisLevel) {
            this._bottomSheetRefAtThisLevel.dismiss();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheet, deps: [{ token: i3.Overlay }, { token: i0.Injector }, { token: MatBottomSheet, optional: true, skipSelf: true }, { token: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheet, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheet, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i3.Overlay }, { type: i0.Injector }, { type: MatBottomSheet, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: MatBottomSheetConfig, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_BOTTOM_SHEET_DEFAULT_OPTIONS]
                }] }] });

class MatBottomSheetModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, imports: [DialogModule, MatCommonModule, PortalModule, MatBottomSheetContainer], exports: [MatBottomSheetContainer, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, providers: [MatBottomSheet], imports: [DialogModule, MatCommonModule, PortalModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheetModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [DialogModule, MatCommonModule, PortalModule, MatBottomSheetContainer],
                    exports: [MatBottomSheetContainer, MatCommonModule],
                    providers: [MatBottomSheet],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { MAT_BOTTOM_SHEET_DATA, MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, MatBottomSheet, MatBottomSheetConfig, MatBottomSheetContainer, MatBottomSheetModule, MatBottomSheetRef, matBottomSheetAnimations };
//# sourceMappingURL=bottom-sheet.mjs.map
