import { FocusMonitor, FocusTrapFactory, InteractivityChecker, } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Platform } from '@angular/cdk/platform';
import { CdkScrollable, ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, AfterRenderPhase, ANIMATION_MODULE_TYPE, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, forwardRef, inject, Inject, InjectionToken, Injector, Input, NgZone, Optional, Output, QueryList, ViewChild, ViewEncapsulation, } from '@angular/core';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, mapTo, startWith, take, takeUntil } from 'rxjs/operators';
import { matDrawerAnimations } from './drawer-animations';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
import * as i2 from "@angular/cdk/a11y";
import * as i3 from "@angular/cdk/platform";
import * as i4 from "@angular/cdk/bidi";
/**
 * Throws an exception when two MatDrawer are matching the same position.
 * @docs-private
 */
export function throwMatDuplicatedDrawerError(position) {
    throw Error(`A drawer was already declared for 'position="${position}"'`);
}
/** Configures whether drawers should use auto sizing by default. */
export const MAT_DRAWER_DEFAULT_AUTOSIZE = new InjectionToken('MAT_DRAWER_DEFAULT_AUTOSIZE', {
    providedIn: 'root',
    factory: MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY,
});
/**
 * Used to provide a drawer container to a drawer while avoiding circular references.
 * @docs-private
 */
export const MAT_DRAWER_CONTAINER = new InjectionToken('MAT_DRAWER_CONTAINER');
/** @docs-private */
export function MAT_DRAWER_DEFAULT_AUTOSIZE_FACTORY() {
    return false;
}
export class MatDrawerContent extends CdkScrollable {
    constructor(_changeDetectorRef, _container, elementRef, scrollDispatcher, ngZone) {
        super(elementRef, scrollDispatcher, ngZone);
        this._changeDetectorRef = _changeDetectorRef;
        this._container = _container;
    }
    ngAfterContentInit() {
        this._container._contentMarginChanges.subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDrawerContent, deps: [{ token: i0.ChangeDetectorRef }, { token: forwardRef(() => MatDrawerContainer) }, { token: i0.ElementRef }, { token: i1.ScrollDispatcher }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDrawerContent, isStandalone: true, selector: "mat-drawer-content", host: { properties: { "style.margin-left.px": "_container._contentMargins.left", "style.margin-right.px": "_container._contentMargins.right" }, classAttribute: "mat-drawer-content" }, providers: [
            {
                provide: CdkScrollable,
                useExisting: MatDrawerContent,
            },
        ], usesInheritance: true, ngImport: i0, template: '<ng-content></ng-content>', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDrawerContent, decorators: [{
            type: Component,
            args: [{
                    selector: 'mat-drawer-content',
                    template: '<ng-content></ng-content>',
                    host: {
                        'class': 'mat-drawer-content',
                        '[style.margin-left.px]': '_container._contentMargins.left',
                        '[style.margin-right.px]': '_container._contentMargins.right',
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        {
                            provide: CdkScrollable,
                            useExisting: MatDrawerContent,
                        },
                    ],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: MatDrawerContainer, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => MatDrawerContainer)]
                }] }, { type: i0.ElementRef }, { type: i1.ScrollDispatcher }, { type: i0.NgZone }] });
/**
 * This component corresponds to a drawer that can be opened on the drawer container.
 */
export class MatDrawer {
    /** The side that the drawer is attached to. */
    get position() {
        return this._position;
    }
    set position(value) {
        // Make sure we have a valid value.
        value = value === 'end' ? 'end' : 'start';
        if (value !== this._position) {
            // Static inputs in Ivy are set before the element is in the DOM.
            if (this._isAttached) {
                this._updatePositionInParent(value);
            }
            this._position = value;
            this.onPositionChanged.emit();
        }
    }
    /** Mode of the drawer; one of 'over', 'push' or 'side'. */
    get mode() {
        return this._mode;
    }
    set mode(value) {
        this._mode = value;
        this._updateFocusTrapState();
        this._modeChanged.next();
    }
    /** Whether the drawer can be closed with the escape key or by clicking on the backdrop. */
    get disableClose() {
        return this._disableClose;
    }
    set disableClose(value) {
        this._disableClose = coerceBooleanProperty(value);
    }
    /**
     * Whether the drawer should focus the first focusable element automatically when opened.
     * Defaults to false in when `mode` is set to `side`, otherwise defaults to `true`. If explicitly
     * enabled, focus will be moved into the sidenav in `side` mode as well.
     * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or AutoFocusTarget
     * instead.
     */
    get autoFocus() {
        const value = this._autoFocus;
        // Note that usually we don't allow autoFocus to be set to `first-tabbable` in `side` mode,
        // because we don't know how the sidenav is being used, but in some cases it still makes
        // sense to do it. The consumer can explicitly set `autoFocus`.
        if (value == null) {
            if (this.mode === 'side') {
                return 'dialog';
            }
            else {
                return 'first-tabbable';
            }
        }
        return value;
    }
    set autoFocus(value) {
        if (value === 'true' || value === 'false' || value == null) {
            value = coerceBooleanProperty(value);
        }
        this._autoFocus = value;
    }
    /**
     * Whether the drawer is opened. We overload this because we trigger an event when it
     * starts or end.
     */
    get opened() {
        return this._opened;
    }
    set opened(value) {
        this.toggle(coerceBooleanProperty(value));
    }
    constructor(_elementRef, _focusTrapFactory, _focusMonitor, _platform, _ngZone, _interactivityChecker, _doc, _container) {
        this._elementRef = _elementRef;
        this._focusTrapFactory = _focusTrapFactory;
        this._focusMonitor = _focusMonitor;
        this._platform = _platform;
        this._ngZone = _ngZone;
        this._interactivityChecker = _interactivityChecker;
        this._doc = _doc;
        this._container = _container;
        this._focusTrap = null;
        this._elementFocusedBeforeDrawerWasOpened = null;
        /** Whether the drawer is initialized. Used for disabling the initial animation. */
        this._enableAnimations = false;
        this._position = 'start';
        this._mode = 'over';
        this._disableClose = false;
        this._opened = false;
        /** Emits whenever the drawer has started animating. */
        this._animationStarted = new Subject();
        /** Emits whenever the drawer is done animating. */
        this._animationEnd = new Subject();
        /** Current state of the sidenav animation. */
        this._animationState = 'void';
        /** Event emitted when the drawer open state is changed. */
        this.openedChange = 
        // Note this has to be async in order to avoid some issues with two-bindings (see #8872).
        new EventEmitter(/* isAsync */ true);
        /** Event emitted when the drawer has been opened. */
        this._openedStream = this.openedChange.pipe(filter(o => o), map(() => { }));
        /** Event emitted when the drawer has started opening. */
        this.openedStart = this._animationStarted.pipe(filter(e => e.fromState !== e.toState && e.toState.indexOf('open') === 0), mapTo(undefined));
        /** Event emitted when the drawer has been closed. */
        this._closedStream = this.openedChange.pipe(filter(o => !o), map(() => { }));
        /** Event emitted when the drawer has started closing. */
        this.closedStart = this._animationStarted.pipe(filter(e => e.fromState !== e.toState && e.toState === 'void'), mapTo(undefined));
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /** Event emitted when the drawer's position changes. */
        // tslint:disable-next-line:no-output-on-prefix
        this.onPositionChanged = new EventEmitter();
        /**
         * An observable that emits when the drawer mode changes. This is used by the drawer container to
         * to know when to when the mode changes so it can adapt the margins on the content.
         */
        this._modeChanged = new Subject();
        this._injector = inject(Injector);
        this._changeDetectorRef = inject(ChangeDetectorRef);
        this.openedChange.pipe(takeUntil(this._destroyed)).subscribe((opened) => {
            if (opened) {
                if (this._doc) {
                    this._elementFocusedBeforeDrawerWasOpened = this._doc.activeElement;
                }
                this._takeFocus();
            }
            else if (this._isFocusWithinDrawer()) {
                this._restoreFocus(this._openedVia || 'program');
            }
        });
        /**
         * Listen to `keydown` events outside the zone so that change detection is not run every
         * time a key is pressed. Instead we re-enter the zone only if the `ESC` key is pressed
         * and we don't have close disabled.
         */
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._elementRef.nativeElement, 'keydown')
                .pipe(filter(event => {
                return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
            }), takeUntil(this._destroyed))
                .subscribe(event => this._ngZone.run(() => {
                this.close();
                event.stopPropagation();
                event.preventDefault();
            }));
        });
        this._animationEnd.subscribe((event) => {
            const { fromState, toState } = event;
            if ((toState.indexOf('open') === 0 && fromState === 'void') ||
                (toState === 'void' && fromState.indexOf('open') === 0)) {
                this.openedChange.emit(this._opened);
            }
        });
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
     * Moves focus into the drawer. Note that this works even if
     * the focus trap is disabled in `side` mode.
     */
    _takeFocus() {
        if (!this._focusTrap) {
            return;
        }
        const element = this._elementRef.nativeElement;
        // When autoFocus is not on the sidenav, if the element cannot be focused or does
        // not exist, focus the sidenav itself so the keyboard navigation still works.
        // We need to check that `focus` is a function due to Universal.
        switch (this.autoFocus) {
            case false:
            case 'dialog':
                return;
            case true:
            case 'first-tabbable':
                afterNextRender(() => {
                    const hasMovedFocus = this._focusTrap.focusInitialElement();
                    if (!hasMovedFocus && typeof element.focus === 'function') {
                        element.focus();
                    }
                }, { injector: this._injector });
                break;
            case 'first-heading':
                this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
                break;
            default:
                this._focusByCssSelector(this.autoFocus);
                break;
        }
    }
    /**
     * Restores focus to the element that was originally focused when the drawer opened.
     * If no element was focused at that time, the focus will be restored to the drawer.
     */
    _restoreFocus(focusOrigin) {
        if (this.autoFocus === 'dialog') {
            return;
        }
        if (this._elementFocusedBeforeDrawerWasOpened) {
            this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened, focusOrigin);
        }
        else {
            this._elementRef.nativeElement.blur();
        }
        this._elementFocusedBeforeDrawerWasOpened = null;
    }
    /** Whether focus is currently within the drawer. */
    _isFocusWithinDrawer() {
        const activeEl = this._doc.activeElement;
        return !!activeEl && this._elementRef.nativeElement.contains(activeEl);
    }
    ngAfterViewInit() {
        this._isAttached = true;
        // Only update the DOM position when the sidenav is positioned at
        // the end since we project the sidenav before the content by default.
        if (this._position === 'end') {
            this._updatePositionInParent('end');
        }
        // Needs to happen after the position is updated
        // so the focus trap anchors are in the right place.
        if (this._platform.isBrowser) {
            this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
            this._updateFocusTrapState();
        }
    }
    ngAfterContentChecked() {
        // Enable the animations after the lifecycle hooks have run, in order to avoid animating
        // drawers that are open by default. When we're on the server, we shouldn't enable the
        // animations, because we don't want the drawer to animate the first time the user sees
        // the page.
        if (this._platform.isBrowser) {
            this._enableAnimations = true;
        }
    }
    ngOnDestroy() {
        this._focusTrap?.destroy();
        this._anchor?.remove();
        this._anchor = null;
        this._animationStarted.complete();
        this._animationEnd.complete();
        this._modeChanged.complete();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Open the drawer.
     * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
     * Used for focus management after the sidenav is closed.
     */
    open(openedVia) {
        return this.toggle(true, openedVia);
    }
    /** Close the drawer. */
    close() {
        return this.toggle(false);
    }
    /** Closes the drawer with context that the backdrop was clicked. */
    _closeViaBackdropClick() {
        // If the drawer is closed upon a backdrop click, we always want to restore focus. We
        // don't need to check whether focus is currently in the drawer, as clicking on the
        // backdrop causes blurs the active element.
        return this._setOpen(/* isOpen */ false, /* restoreFocus */ true, 'mouse');
    }
    /**
     * Toggle this drawer.
     * @param isOpen Whether the drawer should be open.
     * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
     * Used for focus management after the sidenav is closed.
     */
    toggle(isOpen = !this.opened, openedVia) {
        // If the focus is currently inside the drawer content and we are closing the drawer,
        // restore the focus to the initially focused element (when the drawer opened).
        if (isOpen && openedVia) {
            this._openedVia = openedVia;
        }
        const result = this._setOpen(isOpen, 
        /* restoreFocus */ !isOpen && this._isFocusWithinDrawer(), this._openedVia || 'program');
        if (!isOpen) {
            this._openedVia = null;
        }
        return result;
    }
    /**
     * Toggles the opened state of the drawer.
     * @param isOpen Whether the drawer should open or close.
     * @param restoreFocus Whether focus should be restored on close.
     * @param focusOrigin Origin to use when restoring focus.
     */
    _setOpen(isOpen, restoreFocus, focusOrigin) {
        this._opened = isOpen;
        if (isOpen) {
            this._animationState = this._enableAnimations ? 'open' : 'open-instant';
        }
        else {
            this._animationState = 'void';
            if (restoreFocus) {
                this._restoreFocus(focusOrigin);
            }
        }
        // Needed to ensure that the closing sequence fires off correctly.
        this._changeDetectorRef.markForCheck();
        this._updateFocusTrapState();
        return new Promise(resolve => {
            this.openedChange.pipe(take(1)).subscribe(open => resolve(open ? 'open' : 'close'));
        });
    }
    _getWidth() {
        return this._elementRef.nativeElement ? this._elementRef.nativeElement.offsetWidth || 0 : 0;
    }
    /** Updates the enabled state of the focus trap. */
    _updateFocusTrapState() {
        if (this._focusTrap) {
            // Trap focus only if the backdrop is enabled. Otherwise, allow end user to interact with the
            // sidenav content.
            this._focusTrap.enabled = !!this._container?.hasBackdrop && this.opened;
        }
    }
    /**
     * Updates the position of the drawer in the DOM. We need to move the element around ourselves
     * when it's in the `end` position so that it comes after the content and the visual order
     * matches the tab order. We also need to be able to move it back to `start` if the sidenav
     * started off as `end` and was changed to `start`.
     */
    _updatePositionInParent(newPosition) {
        // Don't move the DOM node around on the server, because it can throw off hydration.
        if (!this._platform.isBrowser) {
            return;
        }
        const element = this._elementRef.nativeElement;
        const parent = element.parentNode;
        if (newPosition === 'end') {
            if (!this._anchor) {
                this._anchor = this._doc.createComment('mat-drawer-anchor');
                parent.insertBefore(this._anchor, element);
            }
            parent.appendChild(element);
        }
        else if (this._anchor) {
            this._anchor.parentNode.insertBefore(element, this._anchor);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDrawer, deps: [{ token: i0.ElementRef }, { token: i2.FocusTrapFactory }, { token: i2.FocusMonitor }, { token: i3.Platform }, { token: i0.NgZone }, { token: i2.InteractivityChecker }, { token: DOCUMENT, optional: true }, { token: MAT_DRAWER_CONTAINER, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDrawer, isStandalone: true, selector: "mat-drawer", inputs: { position: "position", mode: "mode", disableClose: "disableClose", autoFocus: "autoFocus", opened: "opened" }, outputs: { openedChange: "openedChange", _openedStream: "opened", openedStart: "openedStart", _closedStream: "closed", closedStart: "closedStart", onPositionChanged: "positionChanged" }, host: { attributes: { "tabIndex": "-1" }, listeners: { "@transform.start": "_animationStarted.next($event)", "@transform.done": "_animationEnd.next($event)" }, properties: { "attr.align": "null", "class.mat-drawer-end": "position === \"end\"", "class.mat-drawer-over": "mode === \"over\"", "class.mat-drawer-push": "mode === \"push\"", "class.mat-drawer-side": "mode === \"side\"", "class.mat-drawer-opened": "opened", "@transform": "_animationState" }, classAttribute: "mat-drawer" }, viewQueries: [{ propertyName: "_content", first: true, predicate: ["content"], descendants: true }], exportAs: ["matDrawer"], ngImport: i0, template: "<div class=\"mat-drawer-inner-container\" cdkScrollable #content>\r\n  <ng-content></ng-content>\r\n</div>\r\n", dependencies: [{ kind: "directive", type: CdkScrollable, selector: "[cdk-scrollable], [cdkScrollable]" }], animations: [matDrawerAnimations.transformDrawer], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDrawer, decorators: [{
            type: Component,
            args: [{ selector: 'mat-drawer', exportAs: 'matDrawer', animations: [matDrawerAnimations.transformDrawer], host: {
                        'class': 'mat-drawer',
                        // must prevent the browser from aligning text based on value
                        '[attr.align]': 'null',
                        '[class.mat-drawer-end]': 'position === "end"',
                        '[class.mat-drawer-over]': 'mode === "over"',
                        '[class.mat-drawer-push]': 'mode === "push"',
                        '[class.mat-drawer-side]': 'mode === "side"',
                        '[class.mat-drawer-opened]': 'opened',
                        'tabIndex': '-1',
                        '[@transform]': '_animationState',
                        '(@transform.start)': '_animationStarted.next($event)',
                        '(@transform.done)': '_animationEnd.next($event)',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, imports: [CdkScrollable], template: "<div class=\"mat-drawer-inner-container\" cdkScrollable #content>\r\n  <ng-content></ng-content>\r\n</div>\r\n" }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i2.FocusTrapFactory }, { type: i2.FocusMonitor }, { type: i3.Platform }, { type: i0.NgZone }, { type: i2.InteractivityChecker }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: MatDrawerContainer, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DRAWER_CONTAINER]
                }] }], propDecorators: { position: [{
                type: Input
            }], mode: [{
                type: Input
            }], disableClose: [{
                type: Input
            }], autoFocus: [{
                type: Input
            }], opened: [{
                type: Input
            }], openedChange: [{
                type: Output
            }], _openedStream: [{
                type: Output,
                args: ['opened']
            }], openedStart: [{
                type: Output
            }], _closedStream: [{
                type: Output,
                args: ['closed']
            }], closedStart: [{
                type: Output
            }], onPositionChanged: [{
                type: Output,
                args: ['positionChanged']
            }], _content: [{
                type: ViewChild,
                args: ['content']
            }] } });
/**
 * `<mat-drawer-container>` component.
 *
 * This is the parent component to one or two `<mat-drawer>`s that validates the state internally
 * and coordinates the backdrop and content styling.
 */
export class MatDrawerContainer {
    /** The drawer child with the `start` position. */
    get start() {
        return this._start;
    }
    /** The drawer child with the `end` position. */
    get end() {
        return this._end;
    }
    /**
     * Whether to automatically resize the container whenever
     * the size of any of its drawers changes.
     *
     * **Use at your own risk!** Enabling this option can cause layout thrashing by measuring
     * the drawers on every change detection cycle. Can be configured globally via the
     * `MAT_DRAWER_DEFAULT_AUTOSIZE` token.
     */
    get autosize() {
        return this._autosize;
    }
    set autosize(value) {
        this._autosize = coerceBooleanProperty(value);
    }
    /**
     * Whether the drawer container should have a backdrop while one of the sidenavs is open.
     * If explicitly set to `true`, the backdrop will be enabled for drawers in the `side`
     * mode as well.
     */
    get hasBackdrop() {
        return this._drawerHasBackdrop(this._start) || this._drawerHasBackdrop(this._end);
    }
    set hasBackdrop(value) {
        this._backdropOverride = value == null ? null : coerceBooleanProperty(value);
    }
    /** Reference to the CdkScrollable instance that wraps the scrollable content. */
    get scrollable() {
        return this._userContent || this._content;
    }
    constructor(_dir, _element, _ngZone, _changeDetectorRef, viewportRuler, defaultAutosize = false, _animationMode) {
        this._dir = _dir;
        this._element = _element;
        this._ngZone = _ngZone;
        this._changeDetectorRef = _changeDetectorRef;
        this._animationMode = _animationMode;
        /** Drawers that belong to this container. */
        this._drawers = new QueryList();
        /** Event emitted when the drawer backdrop is clicked. */
        this.backdropClick = new EventEmitter();
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /** Emits on every ngDoCheck. Used for debouncing reflows. */
        this._doCheckSubject = new Subject();
        /**
         * Margins to be applied to the content. These are used to push / shrink the drawer content when a
         * drawer is open. We use margin rather than transform even for push mode because transform breaks
         * fixed position elements inside of the transformed element.
         */
        this._contentMargins = { left: null, right: null };
        this._contentMarginChanges = new Subject();
        this._injector = inject(Injector);
        // If a `Dir` directive exists up the tree, listen direction changes
        // and update the left/right properties to point to the proper start/end.
        if (_dir) {
            _dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
                this._validateDrawers();
                this.updateContentMargins();
            });
        }
        // Since the minimum width of the sidenav depends on the viewport width,
        // we need to recompute the margins if the viewport changes.
        viewportRuler
            .change()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.updateContentMargins());
        this._autosize = defaultAutosize;
    }
    ngAfterContentInit() {
        this._allDrawers.changes
            .pipe(startWith(this._allDrawers), takeUntil(this._destroyed))
            .subscribe((drawer) => {
            this._drawers.reset(drawer.filter(item => !item._container || item._container === this));
            this._drawers.notifyOnChanges();
        });
        this._drawers.changes.pipe(startWith(null)).subscribe(() => {
            this._validateDrawers();
            this._drawers.forEach((drawer) => {
                this._watchDrawerToggle(drawer);
                this._watchDrawerPosition(drawer);
                this._watchDrawerMode(drawer);
            });
            if (!this._drawers.length ||
                this._isDrawerOpen(this._start) ||
                this._isDrawerOpen(this._end)) {
                this.updateContentMargins();
            }
            this._changeDetectorRef.markForCheck();
        });
        // Avoid hitting the NgZone through the debounce timeout.
        this._ngZone.runOutsideAngular(() => {
            this._doCheckSubject
                .pipe(debounceTime(10), // Arbitrary debounce time, less than a frame at 60fps
            takeUntil(this._destroyed))
                .subscribe(() => this.updateContentMargins());
        });
    }
    ngOnDestroy() {
        this._contentMarginChanges.complete();
        this._doCheckSubject.complete();
        this._drawers.destroy();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Calls `open` of both start and end drawers */
    open() {
        this._drawers.forEach(drawer => drawer.open());
    }
    /** Calls `close` of both start and end drawers */
    close() {
        this._drawers.forEach(drawer => drawer.close());
    }
    /**
     * Recalculates and updates the inline styles for the content. Note that this should be used
     * sparingly, because it causes a reflow.
     */
    updateContentMargins() {
        // 1. For drawers in `over` mode, they don't affect the content.
        // 2. For drawers in `side` mode they should shrink the content. We do this by adding to the
        //    left margin (for left drawer) or right margin (for right the drawer).
        // 3. For drawers in `push` mode the should shift the content without resizing it. We do this by
        //    adding to the left or right margin and simultaneously subtracting the same amount of
        //    margin from the other side.
        let left = 0;
        let right = 0;
        if (this._left && this._left.opened) {
            if (this._left.mode == 'side') {
                left += this._left._getWidth();
            }
            else if (this._left.mode == 'push') {
                const width = this._left._getWidth();
                left += width;
                right -= width;
            }
        }
        if (this._right && this._right.opened) {
            if (this._right.mode == 'side') {
                right += this._right._getWidth();
            }
            else if (this._right.mode == 'push') {
                const width = this._right._getWidth();
                right += width;
                left -= width;
            }
        }
        // If either `right` or `left` is zero, don't set a style to the element. This
        // allows users to specify a custom size via CSS class in SSR scenarios where the
        // measured widths will always be zero. Note that we reset to `null` here, rather
        // than below, in order to ensure that the types in the `if` below are consistent.
        left = left || null;
        right = right || null;
        if (left !== this._contentMargins.left || right !== this._contentMargins.right) {
            this._contentMargins = { left, right };
            // Pull back into the NgZone since in some cases we could be outside. We need to be careful
            // to do it only when something changed, otherwise we can end up hitting the zone too often.
            this._ngZone.run(() => this._contentMarginChanges.next(this._contentMargins));
        }
    }
    ngDoCheck() {
        // If users opted into autosizing, do a check every change detection cycle.
        if (this._autosize && this._isPushed()) {
            // Run outside the NgZone, otherwise the debouncer will throw us into an infinite loop.
            this._ngZone.runOutsideAngular(() => this._doCheckSubject.next());
        }
    }
    /**
     * Subscribes to drawer events in order to set a class on the main container element when the
     * drawer is open and the backdrop is visible. This ensures any overflow on the container element
     * is properly hidden.
     */
    _watchDrawerToggle(drawer) {
        drawer._animationStarted
            .pipe(filter((event) => event.fromState !== event.toState), takeUntil(this._drawers.changes))
            .subscribe((event) => {
            // Set the transition class on the container so that the animations occur. This should not
            // be set initially because animations should only be triggered via a change in state.
            if (event.toState !== 'open-instant' && this._animationMode !== 'NoopAnimations') {
                this._element.nativeElement.classList.add('mat-drawer-transition');
            }
            this.updateContentMargins();
            this._changeDetectorRef.markForCheck();
        });
        if (drawer.mode !== 'side') {
            drawer.openedChange
                .pipe(takeUntil(this._drawers.changes))
                .subscribe(() => this._setContainerClass(drawer.opened));
        }
    }
    /**
     * Subscribes to drawer onPositionChanged event in order to
     * re-validate drawers when the position changes.
     */
    _watchDrawerPosition(drawer) {
        if (!drawer) {
            return;
        }
        // NOTE: We need to wait for the microtask queue to be empty before validating,
        // since both drawers may be swapping positions at the same time.
        drawer.onPositionChanged.pipe(takeUntil(this._drawers.changes)).subscribe(() => {
            afterNextRender(() => {
                this._validateDrawers();
            }, { injector: this._injector, phase: AfterRenderPhase.Read });
        });
    }
    /** Subscribes to changes in drawer mode so we can run change detection. */
    _watchDrawerMode(drawer) {
        if (drawer) {
            drawer._modeChanged
                .pipe(takeUntil(merge(this._drawers.changes, this._destroyed)))
                .subscribe(() => {
                this.updateContentMargins();
                this._changeDetectorRef.markForCheck();
            });
        }
    }
    /** Toggles the 'mat-drawer-opened' class on the main 'mat-drawer-container' element. */
    _setContainerClass(isAdd) {
        const classList = this._element.nativeElement.classList;
        const className = 'mat-drawer-container-has-open';
        if (isAdd) {
            classList.add(className);
        }
        else {
            classList.remove(className);
        }
    }
    /** Validate the state of the drawer children components. */
    _validateDrawers() {
        this._start = this._end = null;
        // Ensure that we have at most one start and one end drawer.
        this._drawers.forEach(drawer => {
            if (drawer.position == 'end') {
                if (this._end != null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throwMatDuplicatedDrawerError('end');
                }
                this._end = drawer;
            }
            else {
                if (this._start != null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                    throwMatDuplicatedDrawerError('start');
                }
                this._start = drawer;
            }
        });
        this._right = this._left = null;
        // Detect if we're LTR or RTL.
        if (this._dir && this._dir.value === 'rtl') {
            this._left = this._end;
            this._right = this._start;
        }
        else {
            this._left = this._start;
            this._right = this._end;
        }
    }
    /** Whether the container is being pushed to the side by one of the drawers. */
    _isPushed() {
        return ((this._isDrawerOpen(this._start) && this._start.mode != 'over') ||
            (this._isDrawerOpen(this._end) && this._end.mode != 'over'));
    }
    _onBackdropClicked() {
        this.backdropClick.emit();
        this._closeModalDrawersViaBackdrop();
    }
    _closeModalDrawersViaBackdrop() {
        // Close all open drawers where closing is not disabled and the mode is not `side`.
        [this._start, this._end]
            .filter(drawer => drawer && !drawer.disableClose && this._drawerHasBackdrop(drawer))
            .forEach(drawer => drawer._closeViaBackdropClick());
    }
    _isShowingBackdrop() {
        return ((this._isDrawerOpen(this._start) && this._drawerHasBackdrop(this._start)) ||
            (this._isDrawerOpen(this._end) && this._drawerHasBackdrop(this._end)));
    }
    _isDrawerOpen(drawer) {
        return drawer != null && drawer.opened;
    }
    // Whether argument drawer should have a backdrop when it opens
    _drawerHasBackdrop(drawer) {
        if (this._backdropOverride == null) {
            return !!drawer && drawer.mode !== 'side';
        }
        return this._backdropOverride;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDrawerContainer, deps: [{ token: i4.Directionality, optional: true }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i1.ViewportRuler }, { token: MAT_DRAWER_DEFAULT_AUTOSIZE }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatDrawerContainer, isStandalone: true, selector: "mat-drawer-container", inputs: { autosize: "autosize", hasBackdrop: "hasBackdrop" }, outputs: { backdropClick: "backdropClick" }, host: { properties: { "class.mat-drawer-container-explicit-backdrop": "_backdropOverride" }, classAttribute: "mat-drawer-container" }, providers: [
            {
                provide: MAT_DRAWER_CONTAINER,
                useExisting: MatDrawerContainer,
            },
        ], queries: [{ propertyName: "_content", first: true, predicate: MatDrawerContent, descendants: true }, { propertyName: "_allDrawers", predicate: MatDrawer, descendants: true }], viewQueries: [{ propertyName: "_userContent", first: true, predicate: MatDrawerContent, descendants: true }], exportAs: ["matDrawerContainer"], ngImport: i0, template: "@if (hasBackdrop) {\n  <div class=\"mat-drawer-backdrop\" (click)=\"_onBackdropClicked()\"\n       [class.mat-drawer-shown]=\"_isShowingBackdrop()\"></div>\n}\n\n<ng-content select=\"mat-drawer\"></ng-content>\n\n<ng-content select=\"mat-drawer-content\">\n</ng-content>\n\n@if (!_content) {\n  <mat-drawer-content>\n    <ng-content></ng-content>\n  </mat-drawer-content>\n}\n", styles: [".mat-drawer-container{position:relative;z-index:1;color:var(--mat-sidenav-content-text-color, var(--mat-app-on-background));background-color:var(--mat-sidenav-content-background-color, var(--mat-app-background));box-sizing:border-box;-webkit-overflow-scrolling:touch;display:block;overflow:hidden}.mat-drawer-container[fullscreen]{top:0;left:0;right:0;bottom:0;position:absolute}.mat-drawer-container[fullscreen].mat-drawer-container-has-open{overflow:hidden}.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side{z-index:3}.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,.mat-drawer-container.ng-animate-disabled .mat-drawer-content,.ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,.ng-animate-disabled .mat-drawer-container .mat-drawer-content{transition:none}.mat-drawer-backdrop{top:0;left:0;right:0;bottom:0;position:absolute;display:block;z-index:3;visibility:hidden}.mat-drawer-backdrop.mat-drawer-shown{visibility:visible;background-color:var(--mat-sidenav-scrim-color)}.mat-drawer-transition .mat-drawer-backdrop{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:background-color,visibility}.cdk-high-contrast-active .mat-drawer-backdrop{opacity:.5}.mat-drawer-content{position:relative;z-index:1;display:block;height:100%;overflow:auto}.mat-drawer-transition .mat-drawer-content{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:transform,margin-left,margin-right}.mat-drawer{position:relative;z-index:4;color:var(--mat-sidenav-container-text-color, var(--mat-app-on-surface-variant));box-shadow:var(--mat-sidenav-container-elevation-shadow);background-color:var(--mat-sidenav-container-background-color, var(--mat-app-surface));border-top-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));width:var(--mat-sidenav-container-width);display:block;position:absolute;top:0;bottom:0;z-index:3;outline:0;box-sizing:border-box;overflow-y:auto;transform:translate3d(-100%, 0, 0)}.cdk-high-contrast-active .mat-drawer,.cdk-high-contrast-active [dir=rtl] .mat-drawer.mat-drawer-end{border-right:solid 1px currentColor}.cdk-high-contrast-active [dir=rtl] .mat-drawer,.cdk-high-contrast-active .mat-drawer.mat-drawer-end{border-left:solid 1px currentColor;border-right:none}.mat-drawer.mat-drawer-side{z-index:2}.mat-drawer.mat-drawer-end{right:0;transform:translate3d(100%, 0, 0);border-top-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-top-right-radius:0;border-bottom-right-radius:0}[dir=rtl] .mat-drawer{border-top-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-top-right-radius:0;border-bottom-right-radius:0;transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer.mat-drawer-end{border-top-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-top-left-radius:0;border-bottom-left-radius:0;left:0;right:auto;transform:translate3d(-100%, 0, 0)}.mat-drawer[style*=\"visibility: hidden\"]{display:none}.mat-drawer-side{box-shadow:none;border-right-color:var(--mat-sidenav-container-divider-color);border-right-width:1px;border-right-style:solid}.mat-drawer-side.mat-drawer-end{border-left-color:var(--mat-sidenav-container-divider-color);border-left-width:1px;border-left-style:solid;border-right:none}[dir=rtl] .mat-drawer-side{border-left-color:var(--mat-sidenav-container-divider-color);border-left-width:1px;border-left-style:solid;border-right:none}[dir=rtl] .mat-drawer-side.mat-drawer-end{border-right-color:var(--mat-sidenav-container-divider-color);border-right-width:1px;border-right-style:solid;border-left:none}.mat-drawer-inner-container{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch}.mat-sidenav-fixed{position:fixed}"], dependencies: [{ kind: "component", type: MatDrawerContent, selector: "mat-drawer-content" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDrawerContainer, decorators: [{
            type: Component,
            args: [{ selector: 'mat-drawer-container', exportAs: 'matDrawerContainer', host: {
                        'class': 'mat-drawer-container',
                        '[class.mat-drawer-container-explicit-backdrop]': '_backdropOverride',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [
                        {
                            provide: MAT_DRAWER_CONTAINER,
                            useExisting: MatDrawerContainer,
                        },
                    ], standalone: true, imports: [MatDrawerContent], template: "@if (hasBackdrop) {\n  <div class=\"mat-drawer-backdrop\" (click)=\"_onBackdropClicked()\"\n       [class.mat-drawer-shown]=\"_isShowingBackdrop()\"></div>\n}\n\n<ng-content select=\"mat-drawer\"></ng-content>\n\n<ng-content select=\"mat-drawer-content\">\n</ng-content>\n\n@if (!_content) {\n  <mat-drawer-content>\n    <ng-content></ng-content>\n  </mat-drawer-content>\n}\n", styles: [".mat-drawer-container{position:relative;z-index:1;color:var(--mat-sidenav-content-text-color, var(--mat-app-on-background));background-color:var(--mat-sidenav-content-background-color, var(--mat-app-background));box-sizing:border-box;-webkit-overflow-scrolling:touch;display:block;overflow:hidden}.mat-drawer-container[fullscreen]{top:0;left:0;right:0;bottom:0;position:absolute}.mat-drawer-container[fullscreen].mat-drawer-container-has-open{overflow:hidden}.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side{z-index:3}.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,.mat-drawer-container.ng-animate-disabled .mat-drawer-content,.ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,.ng-animate-disabled .mat-drawer-container .mat-drawer-content{transition:none}.mat-drawer-backdrop{top:0;left:0;right:0;bottom:0;position:absolute;display:block;z-index:3;visibility:hidden}.mat-drawer-backdrop.mat-drawer-shown{visibility:visible;background-color:var(--mat-sidenav-scrim-color)}.mat-drawer-transition .mat-drawer-backdrop{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:background-color,visibility}.cdk-high-contrast-active .mat-drawer-backdrop{opacity:.5}.mat-drawer-content{position:relative;z-index:1;display:block;height:100%;overflow:auto}.mat-drawer-transition .mat-drawer-content{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:transform,margin-left,margin-right}.mat-drawer{position:relative;z-index:4;color:var(--mat-sidenav-container-text-color, var(--mat-app-on-surface-variant));box-shadow:var(--mat-sidenav-container-elevation-shadow);background-color:var(--mat-sidenav-container-background-color, var(--mat-app-surface));border-top-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));width:var(--mat-sidenav-container-width);display:block;position:absolute;top:0;bottom:0;z-index:3;outline:0;box-sizing:border-box;overflow-y:auto;transform:translate3d(-100%, 0, 0)}.cdk-high-contrast-active .mat-drawer,.cdk-high-contrast-active [dir=rtl] .mat-drawer.mat-drawer-end{border-right:solid 1px currentColor}.cdk-high-contrast-active [dir=rtl] .mat-drawer,.cdk-high-contrast-active .mat-drawer.mat-drawer-end{border-left:solid 1px currentColor;border-right:none}.mat-drawer.mat-drawer-side{z-index:2}.mat-drawer.mat-drawer-end{right:0;transform:translate3d(100%, 0, 0);border-top-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-top-right-radius:0;border-bottom-right-radius:0}[dir=rtl] .mat-drawer{border-top-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-left-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-top-right-radius:0;border-bottom-right-radius:0;transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer.mat-drawer-end{border-top-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-bottom-right-radius:var(--mat-sidenav-container-shape, var(--mat-app-corner-large));border-top-left-radius:0;border-bottom-left-radius:0;left:0;right:auto;transform:translate3d(-100%, 0, 0)}.mat-drawer[style*=\"visibility: hidden\"]{display:none}.mat-drawer-side{box-shadow:none;border-right-color:var(--mat-sidenav-container-divider-color);border-right-width:1px;border-right-style:solid}.mat-drawer-side.mat-drawer-end{border-left-color:var(--mat-sidenav-container-divider-color);border-left-width:1px;border-left-style:solid;border-right:none}[dir=rtl] .mat-drawer-side{border-left-color:var(--mat-sidenav-container-divider-color);border-left-width:1px;border-left-style:solid;border-right:none}[dir=rtl] .mat-drawer-side.mat-drawer-end{border-right-color:var(--mat-sidenav-container-divider-color);border-right-width:1px;border-right-style:solid;border-left:none}.mat-drawer-inner-container{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch}.mat-sidenav-fixed{position:fixed}"] }]
        }], ctorParameters: () => [{ type: i4.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i1.ViewportRuler }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DRAWER_DEFAULT_AUTOSIZE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }], propDecorators: { _allDrawers: [{
                type: ContentChildren,
                args: [MatDrawer, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true,
                    }]
            }], _content: [{
                type: ContentChild,
                args: [MatDrawerContent]
            }], _userContent: [{
                type: ViewChild,
                args: [MatDrawerContent]
            }], autosize: [{
                type: Input
            }], hasBackdrop: [{
                type: Input
            }], backdropClick: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NpZGVuYXYvZHJhd2VyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NpZGVuYXYvZHJhd2VyLmh0bWwiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2lkZW5hdi9kcmF3ZXItY29udGFpbmVyLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUNMLFlBQVksRUFHWixnQkFBZ0IsRUFDaEIsb0JBQW9CLEdBQ3JCLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDN0QsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdEYsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFHTCxlQUFlLEVBQ2YsZ0JBQWdCLEVBRWhCLHFCQUFxQixFQUNyQix1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUVmLFVBQVUsRUFDVixZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixNQUFNLEVBQ04sY0FBYyxFQUNkLFFBQVEsRUFDUixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMzRCxPQUFPLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUYsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0scUJBQXFCLENBQUM7Ozs7OztBQUV4RDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsUUFBZ0I7SUFDNUQsTUFBTSxLQUFLLENBQUMsZ0RBQWdELFFBQVEsSUFBSSxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQVdELG9FQUFvRTtBQUNwRSxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLGNBQWMsQ0FDM0QsNkJBQTZCLEVBQzdCO0lBQ0UsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLG1DQUFtQztDQUM3QyxDQUNGLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRS9FLG9CQUFvQjtBQUNwQixNQUFNLFVBQVUsbUNBQW1DO0lBQ2pELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQW9CRCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsYUFBYTtJQUNqRCxZQUNVLGtCQUFxQyxFQUNRLFVBQThCLEVBQ25GLFVBQW1DLEVBQ25DLGdCQUFrQyxFQUNsQyxNQUFjO1FBRWQsS0FBSyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQU5wQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQ1EsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7SUFNckYsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDbkQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztxSEFmVSxnQkFBZ0IsbURBR2pCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQzt5R0FIbkMsZ0JBQWdCLHlQQVJoQjtZQUNUO2dCQUNFLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixXQUFXLEVBQUUsZ0JBQWdCO2FBQzlCO1NBQ0YsaURBYlMsMkJBQTJCOztrR0FnQjFCLGdCQUFnQjtrQkFsQjVCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxvQkFBb0I7d0JBQzdCLHdCQUF3QixFQUFFLGlDQUFpQzt3QkFDM0QseUJBQXlCLEVBQUUsa0NBQWtDO3FCQUM5RDtvQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7b0JBQ3JDLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsYUFBYTs0QkFDdEIsV0FBVyxrQkFBa0I7eUJBQzlCO3FCQUNGO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBSUksTUFBTTsyQkFBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUM7O0FBZWhEOztHQUVHO0FBeUJILE1BQU0sT0FBTyxTQUFTO0lBYXBCLCtDQUErQztJQUMvQyxJQUNJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQXNCO1FBQ2pDLG1DQUFtQztRQUNuQyxLQUFLLEdBQUcsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDMUMsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdCLGlFQUFpRTtZQUNqRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEMsQ0FBQztJQUNILENBQUM7SUFHRCwyREFBMkQ7SUFDM0QsSUFDSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxLQUFvQjtRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFHRCwyRkFBMkY7SUFDM0YsSUFDSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFJLFlBQVksQ0FBQyxLQUFtQjtRQUNsQyxJQUFJLENBQUMsYUFBYSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSCxJQUNJLFNBQVM7UUFDWCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTlCLDJGQUEyRjtRQUMzRix3RkFBd0Y7UUFDeEYsK0RBQStEO1FBQy9ELElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ2xCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxRQUFRLENBQUM7WUFDbEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sZ0JBQWdCLENBQUM7WUFDMUIsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxJQUFJLFNBQVMsQ0FBQyxLQUE4QztRQUMxRCxJQUFJLEtBQUssS0FBSyxNQUFNLElBQUksS0FBSyxLQUFLLE9BQU8sSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUM7WUFDM0QsS0FBSyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsSUFDSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxLQUFtQjtRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQW1FRCxZQUNVLFdBQW9DLEVBQ3BDLGlCQUFtQyxFQUNuQyxhQUEyQixFQUMzQixTQUFtQixFQUNuQixPQUFlLEVBQ04scUJBQTJDLEVBQ3RCLElBQVMsRUFDRSxVQUErQjtRQVB4RSxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUNuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBYztRQUMzQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQ25CLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDTiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXNCO1FBQ3RCLFNBQUksR0FBSixJQUFJLENBQUs7UUFDRSxlQUFVLEdBQVYsVUFBVSxDQUFxQjtRQTFLMUUsZUFBVSxHQUFxQixJQUFJLENBQUM7UUFDcEMseUNBQW9DLEdBQXVCLElBQUksQ0FBQztRQUV4RSxtRkFBbUY7UUFDM0Usc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBMEIxQixjQUFTLEdBQW9CLE9BQU8sQ0FBQztRQVlyQyxVQUFLLEdBQWtCLE1BQU0sQ0FBQztRQVU5QixrQkFBYSxHQUFZLEtBQUssQ0FBQztRQTRDL0IsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUtqQyx1REFBdUQ7UUFDOUMsc0JBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQWtCLENBQUM7UUFFM0QsbURBQW1EO1FBQzFDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQWtCLENBQUM7UUFFdkQsOENBQThDO1FBQzlDLG9CQUFlLEdBQXFDLE1BQU0sQ0FBQztRQUUzRCwyREFBMkQ7UUFDeEMsaUJBQVk7UUFDN0IseUZBQXlGO1FBQ3pGLElBQUksWUFBWSxDQUFVLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxxREFBcUQ7UUFFNUMsa0JBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2QsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUNkLENBQUM7UUFFRix5REFBeUQ7UUFFaEQsZ0JBQVcsR0FBcUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FDbEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUN6RSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQ2pCLENBQUM7UUFFRixxREFBcUQ7UUFFNUMsa0JBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDZixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQ2QsQ0FBQztRQUVGLHlEQUF5RDtRQUVoRCxnQkFBVyxHQUFxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUNsRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUMsRUFDOUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUNqQixDQUFDO1FBRUYsNkNBQTZDO1FBQzVCLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRWxELHdEQUF3RDtRQUN4RCwrQ0FBK0M7UUFDWCxzQkFBaUIsR0FBRyxJQUFJLFlBQVksRUFBUSxDQUFDO1FBS2pGOzs7V0FHRztRQUNNLGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUVwQyxjQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLHVCQUFrQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBWXJELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFlLEVBQUUsRUFBRTtZQUMvRSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNYLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNkLElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQTRCLENBQUM7Z0JBQ3JGLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksU0FBUyxDQUFDLENBQUM7WUFDbkQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUg7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2pDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQStCO2lCQUNoRixJQUFJLENBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLE9BQU8sS0FBSyxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQyxFQUNGLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQzNCO2lCQUNBLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDYixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3hCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQXFCLEVBQUUsRUFBRTtZQUNyRCxNQUFNLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxHQUFHLEtBQUssQ0FBQztZQUVuQyxJQUNFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksU0FBUyxLQUFLLE1BQU0sQ0FBQztnQkFDdkQsQ0FBQyxPQUFPLEtBQUssTUFBTSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3ZELENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssV0FBVyxDQUFDLE9BQW9CLEVBQUUsT0FBc0I7UUFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNyRCxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLHFGQUFxRjtZQUNyRixJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDbEMsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO29CQUNwQixPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNuRCxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUM7Z0JBRUYsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDM0MsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxtQkFBbUIsQ0FBQyxRQUFnQixFQUFFLE9BQXNCO1FBQ2xFLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FDL0QsUUFBUSxDQUNhLENBQUM7UUFDeEIsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFVBQVU7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBRS9DLGlGQUFpRjtRQUNqRiw4RUFBOEU7UUFDOUUsZ0VBQWdFO1FBQ2hFLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxRQUFRO2dCQUNYLE9BQU87WUFDVCxLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssZ0JBQWdCO2dCQUNuQixlQUFlLENBQ2IsR0FBRyxFQUFFO29CQUNILE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLGFBQWEsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7d0JBQzFELE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbEIsQ0FBQztnQkFDSCxDQUFDLEVBQ0QsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQyxDQUMzQixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLGVBQWU7Z0JBQ2xCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNO1lBQ1I7Z0JBQ0UsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFVLENBQUMsQ0FBQztnQkFDMUMsTUFBTTtRQUNWLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssYUFBYSxDQUFDLFdBQXVDO1FBQzNELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEMsQ0FBQztRQUVELElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxJQUFJLENBQUM7SUFDbkQsQ0FBQztJQUVELG9EQUFvRDtJQUM1QyxvQkFBb0I7UUFDMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDekMsT0FBTyxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRXhCLGlFQUFpRTtRQUNqRSxzRUFBc0U7UUFDdEUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsZ0RBQWdEO1FBQ2hELG9EQUFvRDtRQUNwRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFFRCxxQkFBcUI7UUFDbkIsd0ZBQXdGO1FBQ3hGLHNGQUFzRjtRQUN0Rix1RkFBdUY7UUFDdkYsWUFBWTtRQUNaLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksQ0FBQyxTQUF1QjtRQUMxQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsS0FBSztRQUNILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsb0VBQW9FO0lBQ3BFLHNCQUFzQjtRQUNwQixxRkFBcUY7UUFDckYsbUZBQW1GO1FBQ25GLDRDQUE0QztRQUM1QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLFNBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUF1QjtRQUM1RCxxRkFBcUY7UUFDckYsK0VBQStFO1FBQy9FLElBQUksTUFBTSxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzlCLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUMxQixNQUFNO1FBQ04sa0JBQWtCLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQ3pELElBQUksQ0FBQyxVQUFVLElBQUksU0FBUyxDQUM3QixDQUFDO1FBRUYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLFFBQVEsQ0FDZCxNQUFlLEVBQ2YsWUFBcUIsRUFDckIsV0FBdUM7UUFFdkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdEIsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUMxRSxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1lBQzlCLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNILENBQUM7UUFFRCxrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdCLE9BQU8sSUFBSSxPQUFPLENBQXdCLE9BQU8sQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxtREFBbUQ7SUFDM0MscUJBQXFCO1FBQzNCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLDZGQUE2RjtZQUM3RixtQkFBbUI7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUUsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLHVCQUF1QixDQUFDLFdBQTRCO1FBQzFELG9GQUFvRjtRQUNwRixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5QixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFXLENBQUM7UUFFbkMsSUFBSSxXQUFXLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDO2dCQUM3RCxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELENBQUM7SUFDSCxDQUFDO3FIQXhkVSxTQUFTLDBMQTBLRSxRQUFRLDZCQUNSLG9CQUFvQjt5R0EzSy9CLFNBQVMsNjlCQzFKdEIsZ0hBR0EsNENEcUpZLGFBQWEsZ0VBbEJYLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDOztrR0FvQnRDLFNBQVM7a0JBeEJyQixTQUFTOytCQUNFLFlBQVksWUFDWixXQUFXLGNBRVQsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsUUFDM0M7d0JBQ0osT0FBTyxFQUFFLFlBQVk7d0JBQ3JCLDZEQUE2RDt3QkFDN0QsY0FBYyxFQUFFLE1BQU07d0JBQ3RCLHdCQUF3QixFQUFFLG9CQUFvQjt3QkFDOUMseUJBQXlCLEVBQUUsaUJBQWlCO3dCQUM1Qyx5QkFBeUIsRUFBRSxpQkFBaUI7d0JBQzVDLHlCQUF5QixFQUFFLGlCQUFpQjt3QkFDNUMsMkJBQTJCLEVBQUUsUUFBUTt3QkFDckMsVUFBVSxFQUFFLElBQUk7d0JBQ2hCLGNBQWMsRUFBRSxpQkFBaUI7d0JBQ2pDLG9CQUFvQixFQUFFLGdDQUFnQzt3QkFDdEQsbUJBQW1CLEVBQUUsNEJBQTRCO3FCQUNsRCxtQkFDZ0IsdUJBQXVCLENBQUMsTUFBTSxpQkFDaEMsaUJBQWlCLENBQUMsSUFBSSxjQUN6QixJQUFJLFdBQ1AsQ0FBQyxhQUFhLENBQUM7OzBCQTRLckIsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxvQkFBb0I7eUNBNUp0QyxRQUFRO3NCQURYLEtBQUs7Z0JBcUJGLElBQUk7c0JBRFAsS0FBSztnQkFhRixZQUFZO3NCQURmLEtBQUs7Z0JBaUJGLFNBQVM7c0JBRFosS0FBSztnQkE2QkYsTUFBTTtzQkFEVCxLQUFLO2dCQXNCYSxZQUFZO3NCQUE5QixNQUFNO2dCQU1FLGFBQWE7c0JBRHJCLE1BQU07dUJBQUMsUUFBUTtnQkFRUCxXQUFXO3NCQURuQixNQUFNO2dCQVFFLGFBQWE7c0JBRHJCLE1BQU07dUJBQUMsUUFBUTtnQkFRUCxXQUFXO3NCQURuQixNQUFNO2dCQVc2QixpQkFBaUI7c0JBQXBELE1BQU07dUJBQUMsaUJBQWlCO2dCQUdILFFBQVE7c0JBQTdCLFNBQVM7dUJBQUMsU0FBUzs7QUFtVXRCOzs7OztHQUtHO0FBcUJILE1BQU0sT0FBTyxrQkFBa0I7SUFlN0Isa0RBQWtEO0lBQ2xELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBbUI7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILElBQ0ksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFDRCxJQUFJLFdBQVcsQ0FBQyxLQUFtQjtRQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBa0NELGlGQUFpRjtJQUNqRixJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUM1QyxDQUFDO0lBSUQsWUFDc0IsSUFBb0IsRUFDaEMsUUFBaUMsRUFDakMsT0FBZSxFQUNmLGtCQUFxQyxFQUM3QyxhQUE0QixFQUNTLGVBQWUsR0FBRyxLQUFLLEVBQ1QsY0FBdUI7UUFOdEQsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFDaEMsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUFDakMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFHTSxtQkFBYyxHQUFkLGNBQWMsQ0FBUztRQTVGNUUsNkNBQTZDO1FBQzdDLGFBQVEsR0FBRyxJQUFJLFNBQVMsRUFBYSxDQUFDO1FBOEN0Qyx5REFBeUQ7UUFDdEMsa0JBQWEsR0FBdUIsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQWVoRiw2Q0FBNkM7UUFDNUIsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFbEQsNkRBQTZEO1FBQzVDLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUV2RDs7OztXQUlHO1FBQ0gsb0JBQWUsR0FBZ0QsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQztRQUVoRiwwQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBK0MsQ0FBQztRQU9wRixjQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBV25DLG9FQUFvRTtRQUNwRSx5RUFBeUU7UUFDekUsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUMxRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsd0VBQXdFO1FBQ3hFLDREQUE0RDtRQUM1RCxhQUFhO2FBQ1YsTUFBTSxFQUFFO2FBQ1IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDaEMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7SUFDbkMsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU87YUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM3RCxTQUFTLENBQUMsQ0FBQyxNQUE0QixFQUFFLEVBQUU7WUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVMLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ3pELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXhCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBaUIsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFDRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTTtnQkFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDN0IsQ0FBQztnQkFDRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM5QixDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgseURBQXlEO1FBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxlQUFlO2lCQUNqQixJQUFJLENBQ0gsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLHNEQUFzRDtZQUN4RSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUMzQjtpQkFDQSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELGlEQUFpRDtJQUNqRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELEtBQUs7UUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7O09BR0c7SUFDSCxvQkFBb0I7UUFDbEIsZ0VBQWdFO1FBQ2hFLDRGQUE0RjtRQUM1RiwyRUFBMkU7UUFDM0UsZ0dBQWdHO1FBQ2hHLDBGQUEwRjtRQUMxRixpQ0FBaUM7UUFDakMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakMsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNyQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLElBQUksS0FBSyxDQUFDO2dCQUNkLEtBQUssSUFBSSxLQUFLLENBQUM7WUFDakIsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUMvQixLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQyxDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3RDLEtBQUssSUFBSSxLQUFLLENBQUM7Z0JBQ2YsSUFBSSxJQUFJLEtBQUssQ0FBQztZQUNoQixDQUFDO1FBQ0gsQ0FBQztRQUVELDhFQUE4RTtRQUM5RSxpRkFBaUY7UUFDakYsaUZBQWlGO1FBQ2pGLGtGQUFrRjtRQUNsRixJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUssQ0FBQztRQUNyQixLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUssQ0FBQztRQUV2QixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvRSxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO1lBRXJDLDJGQUEyRjtZQUMzRiw0RkFBNEY7WUFDNUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNoRixDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCwyRUFBMkU7UUFDM0UsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1lBQ3ZDLHVGQUF1RjtZQUN2RixJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNwRSxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxrQkFBa0IsQ0FBQyxNQUFpQjtRQUMxQyxNQUFNLENBQUMsaUJBQWlCO2FBQ3JCLElBQUksQ0FDSCxNQUFNLENBQUMsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFDcEUsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQ2pDO2FBQ0EsU0FBUyxDQUFDLENBQUMsS0FBcUIsRUFBRSxFQUFFO1lBQ25DLDBGQUEwRjtZQUMxRixzRkFBc0Y7WUFDdEYsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyRSxDQUFDO1lBRUQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxZQUFZO2lCQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3RDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSyxvQkFBb0IsQ0FBQyxNQUFpQjtRQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPO1FBQ1QsQ0FBQztRQUNELCtFQUErRTtRQUMvRSxpRUFBaUU7UUFDakUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDN0UsZUFBZSxDQUNiLEdBQUcsRUFBRTtnQkFDSCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxQixDQUFDLEVBQ0QsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFDLENBQ3pELENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwyRUFBMkU7SUFDbkUsZ0JBQWdCLENBQUMsTUFBaUI7UUFDeEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxZQUFZO2lCQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDOUQsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDZCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNILENBQUM7SUFFRCx3RkFBd0Y7SUFDaEYsa0JBQWtCLENBQUMsS0FBYztRQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUM7UUFDeEQsTUFBTSxTQUFTLEdBQUcsK0JBQStCLENBQUM7UUFFbEQsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0IsQ0FBQzthQUFNLENBQUM7WUFDTixTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQsNERBQTREO0lBQ3BELGdCQUFnQjtRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRS9CLDREQUE0RDtRQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM3QixJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQzdCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDekUsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7WUFDckIsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDM0UsNkJBQTZCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pDLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDdkIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVoQyw4QkFBOEI7UUFDOUIsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDNUIsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7SUFDSCxDQUFDO0lBRUQsK0VBQStFO0lBQ3ZFLFNBQVM7UUFDZixPQUFPLENBQ0wsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUM7WUFDL0QsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FDNUQsQ0FBQztJQUNKLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsNkJBQTZCO1FBQzNCLG1GQUFtRjtRQUNuRixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNyQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuRixPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsT0FBTyxDQUNMLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdEUsQ0FBQztJQUNKLENBQUM7SUFFTyxhQUFhLENBQUMsTUFBd0I7UUFDNUMsT0FBTyxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDekMsQ0FBQztJQUVELCtEQUErRDtJQUN2RCxrQkFBa0IsQ0FBQyxNQUF3QjtRQUNqRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7UUFDNUMsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLENBQUM7cUhBM1hVLGtCQUFrQiw4S0FvR25CLDJCQUEyQixhQUNmLHFCQUFxQjt5R0FyR2hDLGtCQUFrQixxVEFUbEI7WUFDVDtnQkFDRSxPQUFPLEVBQUUsb0JBQW9CO2dCQUM3QixXQUFXLEVBQUUsa0JBQWtCO2FBQ2hDO1NBQ0YsZ0VBZ0JhLGdCQUFnQixpRUFWYixTQUFTLDhGQVdmLGdCQUFnQixrRkU1cEI3QiwwWEFlQSwrcUlGOEZhLGdCQUFnQjs7a0dBa2lCaEIsa0JBQWtCO2tCQXBCOUIsU0FBUzsrQkFDRSxzQkFBc0IsWUFDdEIsb0JBQW9CLFFBR3hCO3dCQUNKLE9BQU8sRUFBRSxzQkFBc0I7d0JBQy9CLGdEQUFnRCxFQUFFLG1CQUFtQjtxQkFDdEUsbUJBQ2dCLHVCQUF1QixDQUFDLE1BQU0saUJBQ2hDLGlCQUFpQixDQUFDLElBQUksYUFDMUI7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLG9CQUFvQjs0QkFDN0IsV0FBVyxvQkFBb0I7eUJBQ2hDO3FCQUNGLGNBQ1csSUFBSSxXQUNQLENBQUMsZ0JBQWdCLENBQUM7OzBCQWlHeEIsUUFBUTs7MEJBS1IsTUFBTTsyQkFBQywyQkFBMkI7OzBCQUNsQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLHFCQUFxQjt5Q0E5RjNDLFdBQVc7c0JBTFYsZUFBZTt1QkFBQyxTQUFTLEVBQUU7d0JBQzFCLHVFQUF1RTt3QkFDdkUsOENBQThDO3dCQUM5QyxXQUFXLEVBQUUsSUFBSTtxQkFDbEI7Z0JBTStCLFFBQVE7c0JBQXZDLFlBQVk7dUJBQUMsZ0JBQWdCO2dCQUNELFlBQVk7c0JBQXhDLFNBQVM7dUJBQUMsZ0JBQWdCO2dCQXFCdkIsUUFBUTtzQkFEWCxLQUFLO2dCQWVGLFdBQVc7c0JBRGQsS0FBSztnQkFVYSxhQUFhO3NCQUEvQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7XG4gIEZvY3VzTW9uaXRvcixcbiAgRm9jdXNPcmlnaW4sXG4gIEZvY3VzVHJhcCxcbiAgRm9jdXNUcmFwRmFjdG9yeSxcbiAgSW50ZXJhY3Rpdml0eUNoZWNrZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0VTQ0FQRSwgaGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtDZGtTY3JvbGxhYmxlLCBTY3JvbGxEaXNwYXRjaGVyLCBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRDaGVja2VkLFxuICBBZnRlckNvbnRlbnRJbml0LFxuICBhZnRlck5leHRSZW5kZXIsXG4gIEFmdGVyUmVuZGVyUGhhc2UsXG4gIEFmdGVyVmlld0luaXQsXG4gIEFOSU1BVElPTl9NT0RVTEVfVFlQRSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIGluamVjdCxcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0b3IsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBtZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2RlYm91bmNlVGltZSwgZmlsdGVyLCBtYXAsIG1hcFRvLCBzdGFydFdpdGgsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHttYXREcmF3ZXJBbmltYXRpb25zfSBmcm9tICcuL2RyYXdlci1hbmltYXRpb25zJztcblxuLyoqXG4gKiBUaHJvd3MgYW4gZXhjZXB0aW9uIHdoZW4gdHdvIE1hdERyYXdlciBhcmUgbWF0Y2hpbmcgdGhlIHNhbWUgcG9zaXRpb24uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd01hdER1cGxpY2F0ZWREcmF3ZXJFcnJvcihwb3NpdGlvbjogc3RyaW5nKSB7XG4gIHRocm93IEVycm9yKGBBIGRyYXdlciB3YXMgYWxyZWFkeSBkZWNsYXJlZCBmb3IgJ3Bvc2l0aW9uPVwiJHtwb3NpdGlvbn1cIidgKTtcbn1cblxuLyoqIE9wdGlvbnMgZm9yIHdoZXJlIHRvIHNldCBmb2N1cyB0byBhdXRvbWF0aWNhbGx5IG9uIGRpYWxvZyBvcGVuICovXG5leHBvcnQgdHlwZSBBdXRvRm9jdXNUYXJnZXQgPSAnZGlhbG9nJyB8ICdmaXJzdC10YWJiYWJsZScgfCAnZmlyc3QtaGVhZGluZyc7XG5cbi8qKiBSZXN1bHQgb2YgdGhlIHRvZ2dsZSBwcm9taXNlIHRoYXQgaW5kaWNhdGVzIHRoZSBzdGF0ZSBvZiB0aGUgZHJhd2VyLiAqL1xuZXhwb3J0IHR5cGUgTWF0RHJhd2VyVG9nZ2xlUmVzdWx0ID0gJ29wZW4nIHwgJ2Nsb3NlJztcblxuLyoqIERyYXdlciBhbmQgU2lkZU5hdiBkaXNwbGF5IG1vZGVzLiAqL1xuZXhwb3J0IHR5cGUgTWF0RHJhd2VyTW9kZSA9ICdvdmVyJyB8ICdwdXNoJyB8ICdzaWRlJztcblxuLyoqIENvbmZpZ3VyZXMgd2hldGhlciBkcmF3ZXJzIHNob3VsZCB1c2UgYXV0byBzaXppbmcgYnkgZGVmYXVsdC4gKi9cbmV4cG9ydCBjb25zdCBNQVRfRFJBV0VSX0RFRkFVTFRfQVVUT1NJWkUgPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oXG4gICdNQVRfRFJBV0VSX0RFRkFVTFRfQVVUT1NJWkUnLFxuICB7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6IE1BVF9EUkFXRVJfREVGQVVMVF9BVVRPU0laRV9GQUNUT1JZLFxuICB9LFxuKTtcblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSBkcmF3ZXIgY29udGFpbmVyIHRvIGEgZHJhd2VyIHdoaWxlIGF2b2lkaW5nIGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfRFJBV0VSX0NPTlRBSU5FUiA9IG5ldyBJbmplY3Rpb25Ub2tlbignTUFUX0RSQVdFUl9DT05UQUlORVInKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfRFJBV0VSX0RFRkFVTFRfQVVUT1NJWkVfRkFDVE9SWSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZHJhd2VyLWNvbnRlbnQnLFxuICB0ZW1wbGF0ZTogJzxuZy1jb250ZW50PjwvbmctY29udGVudD4nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1kcmF3ZXItY29udGVudCcsXG4gICAgJ1tzdHlsZS5tYXJnaW4tbGVmdC5weF0nOiAnX2NvbnRhaW5lci5fY29udGVudE1hcmdpbnMubGVmdCcsXG4gICAgJ1tzdHlsZS5tYXJnaW4tcmlnaHQucHhdJzogJ19jb250YWluZXIuX2NvbnRlbnRNYXJnaW5zLnJpZ2h0JyxcbiAgfSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IENka1Njcm9sbGFibGUsXG4gICAgICB1c2VFeGlzdGluZzogTWF0RHJhd2VyQ29udGVudCxcbiAgICB9LFxuICBdLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREcmF3ZXJDb250ZW50IGV4dGVuZHMgQ2RrU2Nyb2xsYWJsZSBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQEluamVjdChmb3J3YXJkUmVmKCgpID0+IE1hdERyYXdlckNvbnRhaW5lcikpIHB1YmxpYyBfY29udGFpbmVyOiBNYXREcmF3ZXJDb250YWluZXIsXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgc2Nyb2xsRGlzcGF0Y2hlciwgbmdab25lKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9jb250YWluZXIuX2NvbnRlbnRNYXJnaW5DaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRoaXMgY29tcG9uZW50IGNvcnJlc3BvbmRzIHRvIGEgZHJhd2VyIHRoYXQgY2FuIGJlIG9wZW5lZCBvbiB0aGUgZHJhd2VyIGNvbnRhaW5lci5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWRyYXdlcicsXG4gIGV4cG9ydEFzOiAnbWF0RHJhd2VyJyxcbiAgdGVtcGxhdGVVcmw6ICdkcmF3ZXIuaHRtbCcsXG4gIGFuaW1hdGlvbnM6IFttYXREcmF3ZXJBbmltYXRpb25zLnRyYW5zZm9ybURyYXdlcl0sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWRyYXdlcicsXG4gICAgLy8gbXVzdCBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gYWxpZ25pbmcgdGV4dCBiYXNlZCBvbiB2YWx1ZVxuICAgICdbYXR0ci5hbGlnbl0nOiAnbnVsbCcsXG4gICAgJ1tjbGFzcy5tYXQtZHJhd2VyLWVuZF0nOiAncG9zaXRpb24gPT09IFwiZW5kXCInLFxuICAgICdbY2xhc3MubWF0LWRyYXdlci1vdmVyXSc6ICdtb2RlID09PSBcIm92ZXJcIicsXG4gICAgJ1tjbGFzcy5tYXQtZHJhd2VyLXB1c2hdJzogJ21vZGUgPT09IFwicHVzaFwiJyxcbiAgICAnW2NsYXNzLm1hdC1kcmF3ZXItc2lkZV0nOiAnbW9kZSA9PT0gXCJzaWRlXCInLFxuICAgICdbY2xhc3MubWF0LWRyYXdlci1vcGVuZWRdJzogJ29wZW5lZCcsXG4gICAgJ3RhYkluZGV4JzogJy0xJyxcbiAgICAnW0B0cmFuc2Zvcm1dJzogJ19hbmltYXRpb25TdGF0ZScsXG4gICAgJyhAdHJhbnNmb3JtLnN0YXJ0KSc6ICdfYW5pbWF0aW9uU3RhcnRlZC5uZXh0KCRldmVudCknLFxuICAgICcoQHRyYW5zZm9ybS5kb25lKSc6ICdfYW5pbWF0aW9uRW5kLm5leHQoJGV2ZW50KScsXG4gIH0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbQ2RrU2Nyb2xsYWJsZV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdERyYXdlciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIEFmdGVyQ29udGVudENoZWNrZWQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2ZvY3VzVHJhcDogRm9jdXNUcmFwIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2VsZW1lbnRGb2N1c2VkQmVmb3JlRHJhd2VyV2FzT3BlbmVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkcmF3ZXIgaXMgaW5pdGlhbGl6ZWQuIFVzZWQgZm9yIGRpc2FibGluZyB0aGUgaW5pdGlhbCBhbmltYXRpb24uICovXG4gIHByaXZhdGUgX2VuYWJsZUFuaW1hdGlvbnMgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgdmlldyBvZiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGF0dGFjaGVkLiAqL1xuICBwcml2YXRlIF9pc0F0dGFjaGVkOiBib29sZWFuO1xuXG4gIC8qKiBBbmNob3Igbm9kZSB1c2VkIHRvIHJlc3RvcmUgdGhlIGRyYXdlciB0byBpdHMgaW5pdGlhbCBwb3NpdGlvbi4gKi9cbiAgcHJpdmF0ZSBfYW5jaG9yOiBDb21tZW50IHwgbnVsbDtcblxuICAvKiogVGhlIHNpZGUgdGhhdCB0aGUgZHJhd2VyIGlzIGF0dGFjaGVkIHRvLiAqL1xuICBASW5wdXQoKVxuICBnZXQgcG9zaXRpb24oKTogJ3N0YXJ0JyB8ICdlbmQnIHtcbiAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XG4gIH1cbiAgc2V0IHBvc2l0aW9uKHZhbHVlOiAnc3RhcnQnIHwgJ2VuZCcpIHtcbiAgICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhIHZhbGlkIHZhbHVlLlxuICAgIHZhbHVlID0gdmFsdWUgPT09ICdlbmQnID8gJ2VuZCcgOiAnc3RhcnQnO1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fcG9zaXRpb24pIHtcbiAgICAgIC8vIFN0YXRpYyBpbnB1dHMgaW4gSXZ5IGFyZSBzZXQgYmVmb3JlIHRoZSBlbGVtZW50IGlzIGluIHRoZSBET00uXG4gICAgICBpZiAodGhpcy5faXNBdHRhY2hlZCkge1xuICAgICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbkluUGFyZW50KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcbiAgICAgIHRoaXMub25Qb3NpdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9wb3NpdGlvbjogJ3N0YXJ0JyB8ICdlbmQnID0gJ3N0YXJ0JztcblxuICAvKiogTW9kZSBvZiB0aGUgZHJhd2VyOyBvbmUgb2YgJ292ZXInLCAncHVzaCcgb3IgJ3NpZGUnLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbW9kZSgpOiBNYXREcmF3ZXJNb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZTtcbiAgfVxuICBzZXQgbW9kZSh2YWx1ZTogTWF0RHJhd2VyTW9kZSkge1xuICAgIHRoaXMuX21vZGUgPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVGb2N1c1RyYXBTdGF0ZSgpO1xuICAgIHRoaXMuX21vZGVDaGFuZ2VkLm5leHQoKTtcbiAgfVxuICBwcml2YXRlIF9tb2RlOiBNYXREcmF3ZXJNb2RlID0gJ292ZXInO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkcmF3ZXIgY2FuIGJlIGNsb3NlZCB3aXRoIHRoZSBlc2NhcGUga2V5IG9yIGJ5IGNsaWNraW5nIG9uIHRoZSBiYWNrZHJvcC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVDbG9zZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZUNsb3NlO1xuICB9XG4gIHNldCBkaXNhYmxlQ2xvc2UodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVDbG9zZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZUNsb3NlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRyYXdlciBzaG91bGQgZm9jdXMgdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IGF1dG9tYXRpY2FsbHkgd2hlbiBvcGVuZWQuXG4gICAqIERlZmF1bHRzIHRvIGZhbHNlIGluIHdoZW4gYG1vZGVgIGlzIHNldCB0byBgc2lkZWAsIG90aGVyd2lzZSBkZWZhdWx0cyB0byBgdHJ1ZWAuIElmIGV4cGxpY2l0bHlcbiAgICogZW5hYmxlZCwgZm9jdXMgd2lsbCBiZSBtb3ZlZCBpbnRvIHRoZSBzaWRlbmF2IGluIGBzaWRlYCBtb2RlIGFzIHdlbGwuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTQuMC4wIFJlbW92ZSBib29sZWFuIG9wdGlvbiBmcm9tIGF1dG9Gb2N1cy4gVXNlIHN0cmluZyBvciBBdXRvRm9jdXNUYXJnZXRcbiAgICogaW5zdGVhZC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBhdXRvRm9jdXMoKTogQXV0b0ZvY3VzVGFyZ2V0IHwgc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLl9hdXRvRm9jdXM7XG5cbiAgICAvLyBOb3RlIHRoYXQgdXN1YWxseSB3ZSBkb24ndCBhbGxvdyBhdXRvRm9jdXMgdG8gYmUgc2V0IHRvIGBmaXJzdC10YWJiYWJsZWAgaW4gYHNpZGVgIG1vZGUsXG4gICAgLy8gYmVjYXVzZSB3ZSBkb24ndCBrbm93IGhvdyB0aGUgc2lkZW5hdiBpcyBiZWluZyB1c2VkLCBidXQgaW4gc29tZSBjYXNlcyBpdCBzdGlsbCBtYWtlc1xuICAgIC8vIHNlbnNlIHRvIGRvIGl0LiBUaGUgY29uc3VtZXIgY2FuIGV4cGxpY2l0bHkgc2V0IGBhdXRvRm9jdXNgLlxuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAnc2lkZScpIHtcbiAgICAgICAgcmV0dXJuICdkaWFsb2cnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICdmaXJzdC10YWJiYWJsZSc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBzZXQgYXV0b0ZvY3VzKHZhbHVlOiBBdXRvRm9jdXNUYXJnZXQgfCBzdHJpbmcgfCBCb29sZWFuSW5wdXQpIHtcbiAgICBpZiAodmFsdWUgPT09ICd0cnVlJyB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgfVxuICAgIHRoaXMuX2F1dG9Gb2N1cyA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2F1dG9Gb2N1czogQXV0b0ZvY3VzVGFyZ2V0IHwgc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZHJhd2VyIGlzIG9wZW5lZC4gV2Ugb3ZlcmxvYWQgdGhpcyBiZWNhdXNlIHdlIHRyaWdnZXIgYW4gZXZlbnQgd2hlbiBpdFxuICAgKiBzdGFydHMgb3IgZW5kLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG9wZW5lZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbmVkO1xuICB9XG4gIHNldCBvcGVuZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMudG9nZ2xlKGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX29wZW5lZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBIb3cgdGhlIHNpZGVuYXYgd2FzIG9wZW5lZCAoa2V5cHJlc3MsIG1vdXNlIGNsaWNrIGV0Yy4pICovXG4gIHByaXZhdGUgX29wZW5lZFZpYTogRm9jdXNPcmlnaW4gfCBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuZXZlciB0aGUgZHJhd2VyIGhhcyBzdGFydGVkIGFuaW1hdGluZy4gKi9cbiAgcmVhZG9ubHkgX2FuaW1hdGlvblN0YXJ0ZWQgPSBuZXcgU3ViamVjdDxBbmltYXRpb25FdmVudD4oKTtcblxuICAvKiogRW1pdHMgd2hlbmV2ZXIgdGhlIGRyYXdlciBpcyBkb25lIGFuaW1hdGluZy4gKi9cbiAgcmVhZG9ubHkgX2FuaW1hdGlvbkVuZCA9IG5ldyBTdWJqZWN0PEFuaW1hdGlvbkV2ZW50PigpO1xuXG4gIC8qKiBDdXJyZW50IHN0YXRlIG9mIHRoZSBzaWRlbmF2IGFuaW1hdGlvbi4gKi9cbiAgX2FuaW1hdGlvblN0YXRlOiAnb3Blbi1pbnN0YW50JyB8ICdvcGVuJyB8ICd2b2lkJyA9ICd2b2lkJztcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBkcmF3ZXIgb3BlbiBzdGF0ZSBpcyBjaGFuZ2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgb3BlbmVkQ2hhbmdlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPVxuICAgIC8vIE5vdGUgdGhpcyBoYXMgdG8gYmUgYXN5bmMgaW4gb3JkZXIgdG8gYXZvaWQgc29tZSBpc3N1ZXMgd2l0aCB0d28tYmluZGluZ3MgKHNlZSAjODg3MikuXG4gICAgbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigvKiBpc0FzeW5jICovIHRydWUpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIGRyYXdlciBoYXMgYmVlbiBvcGVuZWQuICovXG4gIEBPdXRwdXQoJ29wZW5lZCcpXG4gIHJlYWRvbmx5IF9vcGVuZWRTdHJlYW0gPSB0aGlzLm9wZW5lZENoYW5nZS5waXBlKFxuICAgIGZpbHRlcihvID0+IG8pLFxuICAgIG1hcCgoKSA9PiB7fSksXG4gICk7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgZHJhd2VyIGhhcyBzdGFydGVkIG9wZW5pbmcuICovXG4gIEBPdXRwdXQoKVxuICByZWFkb25seSBvcGVuZWRTdGFydDogT2JzZXJ2YWJsZTx2b2lkPiA9IHRoaXMuX2FuaW1hdGlvblN0YXJ0ZWQucGlwZShcbiAgICBmaWx0ZXIoZSA9PiBlLmZyb21TdGF0ZSAhPT0gZS50b1N0YXRlICYmIGUudG9TdGF0ZS5pbmRleE9mKCdvcGVuJykgPT09IDApLFxuICAgIG1hcFRvKHVuZGVmaW5lZCksXG4gICk7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgZHJhd2VyIGhhcyBiZWVuIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgnY2xvc2VkJylcbiAgcmVhZG9ubHkgX2Nsb3NlZFN0cmVhbSA9IHRoaXMub3BlbmVkQ2hhbmdlLnBpcGUoXG4gICAgZmlsdGVyKG8gPT4gIW8pLFxuICAgIG1hcCgoKSA9PiB7fSksXG4gICk7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgZHJhd2VyIGhhcyBzdGFydGVkIGNsb3NpbmcuICovXG4gIEBPdXRwdXQoKVxuICByZWFkb25seSBjbG9zZWRTdGFydDogT2JzZXJ2YWJsZTx2b2lkPiA9IHRoaXMuX2FuaW1hdGlvblN0YXJ0ZWQucGlwZShcbiAgICBmaWx0ZXIoZSA9PiBlLmZyb21TdGF0ZSAhPT0gZS50b1N0YXRlICYmIGUudG9TdGF0ZSA9PT0gJ3ZvaWQnKSxcbiAgICBtYXBUbyh1bmRlZmluZWQpLFxuICApO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIGRyYXdlcidzIHBvc2l0aW9uIGNoYW5nZXMuICovXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1vdXRwdXQtb24tcHJlZml4XG4gIEBPdXRwdXQoJ3Bvc2l0aW9uQ2hhbmdlZCcpIHJlYWRvbmx5IG9uUG9zaXRpb25DaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGlubmVyIGVsZW1lbnQgdGhhdCBjb250YWlucyBhbGwgdGhlIGNvbnRlbnQuICovXG4gIEBWaWV3Q2hpbGQoJ2NvbnRlbnQnKSBfY29udGVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgLyoqXG4gICAqIEFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIHRoZSBkcmF3ZXIgbW9kZSBjaGFuZ2VzLiBUaGlzIGlzIHVzZWQgYnkgdGhlIGRyYXdlciBjb250YWluZXIgdG9cbiAgICogdG8ga25vdyB3aGVuIHRvIHdoZW4gdGhlIG1vZGUgY2hhbmdlcyBzbyBpdCBjYW4gYWRhcHQgdGhlIG1hcmdpbnMgb24gdGhlIGNvbnRlbnQuXG4gICAqL1xuICByZWFkb25seSBfbW9kZUNoYW5nZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHByaXZhdGUgX2luamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcbiAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWYgPSBpbmplY3QoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2ZvY3VzVHJhcEZhY3Rvcnk6IEZvY3VzVHJhcEZhY3RvcnksXG4gICAgcHJpdmF0ZSBfZm9jdXNNb25pdG9yOiBGb2N1c01vbml0b3IsXG4gICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ludGVyYWN0aXZpdHlDaGVja2VyOiBJbnRlcmFjdGl2aXR5Q2hlY2tlcixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2M6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9EUkFXRVJfQ09OVEFJTkVSKSBwdWJsaWMgX2NvbnRhaW5lcj86IE1hdERyYXdlckNvbnRhaW5lcixcbiAgKSB7XG4gICAgdGhpcy5vcGVuZWRDaGFuZ2UucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKChvcGVuZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIGlmIChvcGVuZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RvYykge1xuICAgICAgICAgIHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRHJhd2VyV2FzT3BlbmVkID0gdGhpcy5fZG9jLmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdGFrZUZvY3VzKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzRm9jdXNXaXRoaW5EcmF3ZXIoKSkge1xuICAgICAgICB0aGlzLl9yZXN0b3JlRm9jdXModGhpcy5fb3BlbmVkVmlhIHx8ICdwcm9ncmFtJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0ZW4gdG8gYGtleWRvd25gIGV2ZW50cyBvdXRzaWRlIHRoZSB6b25lIHNvIHRoYXQgY2hhbmdlIGRldGVjdGlvbiBpcyBub3QgcnVuIGV2ZXJ5XG4gICAgICogdGltZSBhIGtleSBpcyBwcmVzc2VkLiBJbnN0ZWFkIHdlIHJlLWVudGVyIHRoZSB6b25lIG9ubHkgaWYgdGhlIGBFU0NgIGtleSBpcyBwcmVzc2VkXG4gICAgICogYW5kIHdlIGRvbid0IGhhdmUgY2xvc2UgZGlzYWJsZWQuXG4gICAgICovXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIChmcm9tRXZlbnQodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAna2V5ZG93bicpIGFzIE9ic2VydmFibGU8S2V5Ym9hcmRFdmVudD4pXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIGZpbHRlcihldmVudCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnQua2V5Q29kZSA9PT0gRVNDQVBFICYmICF0aGlzLmRpc2FibGVDbG9zZSAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT5cbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2FuaW1hdGlvbkVuZC5zdWJzY3JpYmUoKGV2ZW50OiBBbmltYXRpb25FdmVudCkgPT4ge1xuICAgICAgY29uc3Qge2Zyb21TdGF0ZSwgdG9TdGF0ZX0gPSBldmVudDtcblxuICAgICAgaWYgKFxuICAgICAgICAodG9TdGF0ZS5pbmRleE9mKCdvcGVuJykgPT09IDAgJiYgZnJvbVN0YXRlID09PSAndm9pZCcpIHx8XG4gICAgICAgICh0b1N0YXRlID09PSAndm9pZCcgJiYgZnJvbVN0YXRlLmluZGV4T2YoJ29wZW4nKSA9PT0gMClcbiAgICAgICkge1xuICAgICAgICB0aGlzLm9wZW5lZENoYW5nZS5lbWl0KHRoaXMuX29wZW5lZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgcHJvdmlkZWQgZWxlbWVudC4gSWYgdGhlIGVsZW1lbnQgaXMgbm90IGZvY3VzYWJsZSwgaXQgd2lsbCBhZGQgYSB0YWJJbmRleFxuICAgKiBhdHRyaWJ1dGUgdG8gZm9yY2VmdWxseSBmb2N1cyBpdC4gVGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkIGFmdGVyIGZvY3VzIGlzIG1vdmVkLlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX2ZvcmNlRm9jdXMoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuX2ludGVyYWN0aXZpdHlDaGVja2VyLmlzRm9jdXNhYmxlKGVsZW1lbnQpKSB7XG4gICAgICBlbGVtZW50LnRhYkluZGV4ID0gLTE7XG4gICAgICAvLyBUaGUgdGFiaW5kZXggYXR0cmlidXRlIHNob3VsZCBiZSByZW1vdmVkIHRvIGF2b2lkIG5hdmlnYXRpbmcgdG8gdGhhdCBlbGVtZW50IGFnYWluXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBjYWxsYmFjayk7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBjYWxsYmFjayk7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgY2FsbGJhY2spO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBzZWxlY3RvciB3aXRoaW4gdGhlIGZvY3VzIHRyYXAuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgQ1NTIHNlbGVjdG9yIGZvciB0aGUgZWxlbWVudCB0byBzZXQgZm9jdXMgdG8uXG4gICAqL1xuICBwcml2YXRlIF9mb2N1c0J5Q3NzU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgb3B0aW9ucz86IEZvY3VzT3B0aW9ucykge1xuICAgIGxldCBlbGVtZW50VG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgc2VsZWN0b3IsXG4gICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKGVsZW1lbnRUb0ZvY3VzKSB7XG4gICAgICB0aGlzLl9mb3JjZUZvY3VzKGVsZW1lbnRUb0ZvY3VzLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgZm9jdXMgaW50byB0aGUgZHJhd2VyLiBOb3RlIHRoYXQgdGhpcyB3b3JrcyBldmVuIGlmXG4gICAqIHRoZSBmb2N1cyB0cmFwIGlzIGRpc2FibGVkIGluIGBzaWRlYCBtb2RlLlxuICAgKi9cbiAgcHJpdmF0ZSBfdGFrZUZvY3VzKCkge1xuICAgIGlmICghdGhpcy5fZm9jdXNUcmFwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFdoZW4gYXV0b0ZvY3VzIGlzIG5vdCBvbiB0aGUgc2lkZW5hdiwgaWYgdGhlIGVsZW1lbnQgY2Fubm90IGJlIGZvY3VzZWQgb3IgZG9lc1xuICAgIC8vIG5vdCBleGlzdCwgZm9jdXMgdGhlIHNpZGVuYXYgaXRzZWxmIHNvIHRoZSBrZXlib2FyZCBuYXZpZ2F0aW9uIHN0aWxsIHdvcmtzLlxuICAgIC8vIFdlIG5lZWQgdG8gY2hlY2sgdGhhdCBgZm9jdXNgIGlzIGEgZnVuY3Rpb24gZHVlIHRvIFVuaXZlcnNhbC5cbiAgICBzd2l0Y2ggKHRoaXMuYXV0b0ZvY3VzKSB7XG4gICAgICBjYXNlIGZhbHNlOlxuICAgICAgY2FzZSAnZGlhbG9nJzpcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgY2FzZSAnZmlyc3QtdGFiYmFibGUnOlxuICAgICAgICBhZnRlck5leHRSZW5kZXIoXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGFzTW92ZWRGb2N1cyA9IHRoaXMuX2ZvY3VzVHJhcCEuZm9jdXNJbml0aWFsRWxlbWVudCgpO1xuICAgICAgICAgICAgaWYgKCFoYXNNb3ZlZEZvY3VzICYmIHR5cGVvZiBlbGVtZW50LmZvY3VzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtpbmplY3RvcjogdGhpcy5faW5qZWN0b3J9LFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpcnN0LWhlYWRpbmcnOlxuICAgICAgICB0aGlzLl9mb2N1c0J5Q3NzU2VsZWN0b3IoJ2gxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIFtyb2xlPVwiaGVhZGluZ1wiXScpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2ZvY3VzQnlDc3NTZWxlY3Rvcih0aGlzLmF1dG9Gb2N1cyEpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZXMgZm9jdXMgdG8gdGhlIGVsZW1lbnQgdGhhdCB3YXMgb3JpZ2luYWxseSBmb2N1c2VkIHdoZW4gdGhlIGRyYXdlciBvcGVuZWQuXG4gICAqIElmIG5vIGVsZW1lbnQgd2FzIGZvY3VzZWQgYXQgdGhhdCB0aW1lLCB0aGUgZm9jdXMgd2lsbCBiZSByZXN0b3JlZCB0byB0aGUgZHJhd2VyLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVzdG9yZUZvY3VzKGZvY3VzT3JpZ2luOiBFeGNsdWRlPEZvY3VzT3JpZ2luLCBudWxsPikge1xuICAgIGlmICh0aGlzLmF1dG9Gb2N1cyA9PT0gJ2RpYWxvZycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudEZvY3VzZWRCZWZvcmVEcmF3ZXJXYXNPcGVuZWQpIHtcbiAgICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5mb2N1c1ZpYSh0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZURyYXdlcldhc09wZW5lZCwgZm9jdXNPcmlnaW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRHJhd2VyV2FzT3BlbmVkID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIGZvY3VzIGlzIGN1cnJlbnRseSB3aXRoaW4gdGhlIGRyYXdlci4gKi9cbiAgcHJpdmF0ZSBfaXNGb2N1c1dpdGhpbkRyYXdlcigpOiBib29sZWFuIHtcbiAgICBjb25zdCBhY3RpdmVFbCA9IHRoaXMuX2RvYy5hY3RpdmVFbGVtZW50O1xuICAgIHJldHVybiAhIWFjdGl2ZUVsICYmIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jb250YWlucyhhY3RpdmVFbCk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5faXNBdHRhY2hlZCA9IHRydWU7XG5cbiAgICAvLyBPbmx5IHVwZGF0ZSB0aGUgRE9NIHBvc2l0aW9uIHdoZW4gdGhlIHNpZGVuYXYgaXMgcG9zaXRpb25lZCBhdFxuICAgIC8vIHRoZSBlbmQgc2luY2Ugd2UgcHJvamVjdCB0aGUgc2lkZW5hdiBiZWZvcmUgdGhlIGNvbnRlbnQgYnkgZGVmYXVsdC5cbiAgICBpZiAodGhpcy5fcG9zaXRpb24gPT09ICdlbmQnKSB7XG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbkluUGFyZW50KCdlbmQnKTtcbiAgICB9XG5cbiAgICAvLyBOZWVkcyB0byBoYXBwZW4gYWZ0ZXIgdGhlIHBvc2l0aW9uIGlzIHVwZGF0ZWRcbiAgICAvLyBzbyB0aGUgZm9jdXMgdHJhcCBhbmNob3JzIGFyZSBpbiB0aGUgcmlnaHQgcGxhY2UuXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgdGhpcy5fZm9jdXNUcmFwID0gdGhpcy5fZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICAgIHRoaXMuX3VwZGF0ZUZvY3VzVHJhcFN0YXRlKCk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCkge1xuICAgIC8vIEVuYWJsZSB0aGUgYW5pbWF0aW9ucyBhZnRlciB0aGUgbGlmZWN5Y2xlIGhvb2tzIGhhdmUgcnVuLCBpbiBvcmRlciB0byBhdm9pZCBhbmltYXRpbmdcbiAgICAvLyBkcmF3ZXJzIHRoYXQgYXJlIG9wZW4gYnkgZGVmYXVsdC4gV2hlbiB3ZSdyZSBvbiB0aGUgc2VydmVyLCB3ZSBzaG91bGRuJ3QgZW5hYmxlIHRoZVxuICAgIC8vIGFuaW1hdGlvbnMsIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCB0aGUgZHJhd2VyIHRvIGFuaW1hdGUgdGhlIGZpcnN0IHRpbWUgdGhlIHVzZXIgc2Vlc1xuICAgIC8vIHRoZSBwYWdlLlxuICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX2VuYWJsZUFuaW1hdGlvbnMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2ZvY3VzVHJhcD8uZGVzdHJveSgpO1xuICAgIHRoaXMuX2FuY2hvcj8ucmVtb3ZlKCk7XG4gICAgdGhpcy5fYW5jaG9yID0gbnVsbDtcbiAgICB0aGlzLl9hbmltYXRpb25TdGFydGVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fYW5pbWF0aW9uRW5kLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fbW9kZUNoYW5nZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGRyYXdlci5cbiAgICogQHBhcmFtIG9wZW5lZFZpYSBXaGV0aGVyIHRoZSBkcmF3ZXIgd2FzIG9wZW5lZCBieSBhIGtleSBwcmVzcywgbW91c2UgY2xpY2sgb3IgcHJvZ3JhbW1hdGljYWxseS5cbiAgICogVXNlZCBmb3IgZm9jdXMgbWFuYWdlbWVudCBhZnRlciB0aGUgc2lkZW5hdiBpcyBjbG9zZWQuXG4gICAqL1xuICBvcGVuKG9wZW5lZFZpYT86IEZvY3VzT3JpZ2luKTogUHJvbWlzZTxNYXREcmF3ZXJUb2dnbGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGUodHJ1ZSwgb3BlbmVkVmlhKTtcbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgZHJhd2VyLiAqL1xuICBjbG9zZSgpOiBQcm9taXNlPE1hdERyYXdlclRvZ2dsZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gIH1cblxuICAvKiogQ2xvc2VzIHRoZSBkcmF3ZXIgd2l0aCBjb250ZXh0IHRoYXQgdGhlIGJhY2tkcm9wIHdhcyBjbGlja2VkLiAqL1xuICBfY2xvc2VWaWFCYWNrZHJvcENsaWNrKCk6IFByb21pc2U8TWF0RHJhd2VyVG9nZ2xlUmVzdWx0PiB7XG4gICAgLy8gSWYgdGhlIGRyYXdlciBpcyBjbG9zZWQgdXBvbiBhIGJhY2tkcm9wIGNsaWNrLCB3ZSBhbHdheXMgd2FudCB0byByZXN0b3JlIGZvY3VzLiBXZVxuICAgIC8vIGRvbid0IG5lZWQgdG8gY2hlY2sgd2hldGhlciBmb2N1cyBpcyBjdXJyZW50bHkgaW4gdGhlIGRyYXdlciwgYXMgY2xpY2tpbmcgb24gdGhlXG4gICAgLy8gYmFja2Ryb3AgY2F1c2VzIGJsdXJzIHRoZSBhY3RpdmUgZWxlbWVudC5cbiAgICByZXR1cm4gdGhpcy5fc2V0T3BlbigvKiBpc09wZW4gKi8gZmFsc2UsIC8qIHJlc3RvcmVGb2N1cyAqLyB0cnVlLCAnbW91c2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgdGhpcyBkcmF3ZXIuXG4gICAqIEBwYXJhbSBpc09wZW4gV2hldGhlciB0aGUgZHJhd2VyIHNob3VsZCBiZSBvcGVuLlxuICAgKiBAcGFyYW0gb3BlbmVkVmlhIFdoZXRoZXIgdGhlIGRyYXdlciB3YXMgb3BlbmVkIGJ5IGEga2V5IHByZXNzLCBtb3VzZSBjbGljayBvciBwcm9ncmFtbWF0aWNhbGx5LlxuICAgKiBVc2VkIGZvciBmb2N1cyBtYW5hZ2VtZW50IGFmdGVyIHRoZSBzaWRlbmF2IGlzIGNsb3NlZC5cbiAgICovXG4gIHRvZ2dsZShpc09wZW46IGJvb2xlYW4gPSAhdGhpcy5vcGVuZWQsIG9wZW5lZFZpYT86IEZvY3VzT3JpZ2luKTogUHJvbWlzZTxNYXREcmF3ZXJUb2dnbGVSZXN1bHQ+IHtcbiAgICAvLyBJZiB0aGUgZm9jdXMgaXMgY3VycmVudGx5IGluc2lkZSB0aGUgZHJhd2VyIGNvbnRlbnQgYW5kIHdlIGFyZSBjbG9zaW5nIHRoZSBkcmF3ZXIsXG4gICAgLy8gcmVzdG9yZSB0aGUgZm9jdXMgdG8gdGhlIGluaXRpYWxseSBmb2N1c2VkIGVsZW1lbnQgKHdoZW4gdGhlIGRyYXdlciBvcGVuZWQpLlxuICAgIGlmIChpc09wZW4gJiYgb3BlbmVkVmlhKSB7XG4gICAgICB0aGlzLl9vcGVuZWRWaWEgPSBvcGVuZWRWaWE7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fc2V0T3BlbihcbiAgICAgIGlzT3BlbixcbiAgICAgIC8qIHJlc3RvcmVGb2N1cyAqLyAhaXNPcGVuICYmIHRoaXMuX2lzRm9jdXNXaXRoaW5EcmF3ZXIoKSxcbiAgICAgIHRoaXMuX29wZW5lZFZpYSB8fCAncHJvZ3JhbScsXG4gICAgKTtcblxuICAgIGlmICghaXNPcGVuKSB7XG4gICAgICB0aGlzLl9vcGVuZWRWaWEgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgb3BlbmVkIHN0YXRlIG9mIHRoZSBkcmF3ZXIuXG4gICAqIEBwYXJhbSBpc09wZW4gV2hldGhlciB0aGUgZHJhd2VyIHNob3VsZCBvcGVuIG9yIGNsb3NlLlxuICAgKiBAcGFyYW0gcmVzdG9yZUZvY3VzIFdoZXRoZXIgZm9jdXMgc2hvdWxkIGJlIHJlc3RvcmVkIG9uIGNsb3NlLlxuICAgKiBAcGFyYW0gZm9jdXNPcmlnaW4gT3JpZ2luIHRvIHVzZSB3aGVuIHJlc3RvcmluZyBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX3NldE9wZW4oXG4gICAgaXNPcGVuOiBib29sZWFuLFxuICAgIHJlc3RvcmVGb2N1czogYm9vbGVhbixcbiAgICBmb2N1c09yaWdpbjogRXhjbHVkZTxGb2N1c09yaWdpbiwgbnVsbD4sXG4gICk6IFByb21pc2U8TWF0RHJhd2VyVG9nZ2xlUmVzdWx0PiB7XG4gICAgdGhpcy5fb3BlbmVkID0gaXNPcGVuO1xuXG4gICAgaWYgKGlzT3Blbikge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uU3RhdGUgPSB0aGlzLl9lbmFibGVBbmltYXRpb25zID8gJ29wZW4nIDogJ29wZW4taW5zdGFudCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlID0gJ3ZvaWQnO1xuICAgICAgaWYgKHJlc3RvcmVGb2N1cykge1xuICAgICAgICB0aGlzLl9yZXN0b3JlRm9jdXMoZm9jdXNPcmlnaW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5lZWRlZCB0byBlbnN1cmUgdGhhdCB0aGUgY2xvc2luZyBzZXF1ZW5jZSBmaXJlcyBvZmYgY29ycmVjdGx5LlxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIHRoaXMuX3VwZGF0ZUZvY3VzVHJhcFN0YXRlKCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8TWF0RHJhd2VyVG9nZ2xlUmVzdWx0PihyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMub3BlbmVkQ2hhbmdlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKG9wZW4gPT4gcmVzb2x2ZShvcGVuID8gJ29wZW4nIDogJ2Nsb3NlJykpO1xuICAgIH0pO1xuICB9XG5cbiAgX2dldFdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCA/IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aCB8fCAwIDogMDtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBlbmFibGVkIHN0YXRlIG9mIHRoZSBmb2N1cyB0cmFwLiAqL1xuICBwcml2YXRlIF91cGRhdGVGb2N1c1RyYXBTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5fZm9jdXNUcmFwKSB7XG4gICAgICAvLyBUcmFwIGZvY3VzIG9ubHkgaWYgdGhlIGJhY2tkcm9wIGlzIGVuYWJsZWQuIE90aGVyd2lzZSwgYWxsb3cgZW5kIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aCB0aGVcbiAgICAgIC8vIHNpZGVuYXYgY29udGVudC5cbiAgICAgIHRoaXMuX2ZvY3VzVHJhcC5lbmFibGVkID0gISF0aGlzLl9jb250YWluZXI/Lmhhc0JhY2tkcm9wICYmIHRoaXMub3BlbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhd2VyIGluIHRoZSBET00uIFdlIG5lZWQgdG8gbW92ZSB0aGUgZWxlbWVudCBhcm91bmQgb3Vyc2VsdmVzXG4gICAqIHdoZW4gaXQncyBpbiB0aGUgYGVuZGAgcG9zaXRpb24gc28gdGhhdCBpdCBjb21lcyBhZnRlciB0aGUgY29udGVudCBhbmQgdGhlIHZpc3VhbCBvcmRlclxuICAgKiBtYXRjaGVzIHRoZSB0YWIgb3JkZXIuIFdlIGFsc28gbmVlZCB0byBiZSBhYmxlIHRvIG1vdmUgaXQgYmFjayB0byBgc3RhcnRgIGlmIHRoZSBzaWRlbmF2XG4gICAqIHN0YXJ0ZWQgb2ZmIGFzIGBlbmRgIGFuZCB3YXMgY2hhbmdlZCB0byBgc3RhcnRgLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUG9zaXRpb25JblBhcmVudChuZXdQb3NpdGlvbjogJ3N0YXJ0JyB8ICdlbmQnKTogdm9pZCB7XG4gICAgLy8gRG9uJ3QgbW92ZSB0aGUgRE9NIG5vZGUgYXJvdW5kIG9uIHRoZSBzZXJ2ZXIsIGJlY2F1c2UgaXQgY2FuIHRocm93IG9mZiBoeWRyYXRpb24uXG4gICAgaWYgKCF0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZSE7XG5cbiAgICBpZiAobmV3UG9zaXRpb24gPT09ICdlbmQnKSB7XG4gICAgICBpZiAoIXRoaXMuX2FuY2hvcikge1xuICAgICAgICB0aGlzLl9hbmNob3IgPSB0aGlzLl9kb2MuY3JlYXRlQ29tbWVudCgnbWF0LWRyYXdlci1hbmNob3InKSE7XG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGhpcy5fYW5jaG9yISwgZWxlbWVudCk7XG4gICAgICB9XG5cbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2FuY2hvcikge1xuICAgICAgdGhpcy5fYW5jaG9yLnBhcmVudE5vZGUhLmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLl9hbmNob3IpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGA8bWF0LWRyYXdlci1jb250YWluZXI+YCBjb21wb25lbnQuXG4gKlxuICogVGhpcyBpcyB0aGUgcGFyZW50IGNvbXBvbmVudCB0byBvbmUgb3IgdHdvIGA8bWF0LWRyYXdlcj5gcyB0aGF0IHZhbGlkYXRlcyB0aGUgc3RhdGUgaW50ZXJuYWxseVxuICogYW5kIGNvb3JkaW5hdGVzIHRoZSBiYWNrZHJvcCBhbmQgY29udGVudCBzdHlsaW5nLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZHJhd2VyLWNvbnRhaW5lcicsXG4gIGV4cG9ydEFzOiAnbWF0RHJhd2VyQ29udGFpbmVyJyxcbiAgdGVtcGxhdGVVcmw6ICdkcmF3ZXItY29udGFpbmVyLmh0bWwnLFxuICBzdHlsZVVybDogJ2RyYXdlci5jc3MnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1kcmF3ZXItY29udGFpbmVyJyxcbiAgICAnW2NsYXNzLm1hdC1kcmF3ZXItY29udGFpbmVyLWV4cGxpY2l0LWJhY2tkcm9wXSc6ICdfYmFja2Ryb3BPdmVycmlkZScsXG4gIH0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBNQVRfRFJBV0VSX0NPTlRBSU5FUixcbiAgICAgIHVzZUV4aXN0aW5nOiBNYXREcmF3ZXJDb250YWluZXIsXG4gICAgfSxcbiAgXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW01hdERyYXdlckNvbnRlbnRdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREcmF3ZXJDb250YWluZXIgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICAvKiogQWxsIGRyYXdlcnMgaW4gdGhlIGNvbnRhaW5lci4gSW5jbHVkZXMgZHJhd2VycyBmcm9tIGluc2lkZSBuZXN0ZWQgY29udGFpbmVycy4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihNYXREcmF3ZXIsIHtcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSBgZGVzY2VuZGFudHM6IHRydWVgLCBiZWNhdXNlIEl2eSB3aWxsIG5vIGxvbmdlciBtYXRjaFxuICAgIC8vIGluZGlyZWN0IGRlc2NlbmRhbnRzIGlmIGl0J3MgbGVmdCBhcyBmYWxzZS5cbiAgICBkZXNjZW5kYW50czogdHJ1ZSxcbiAgfSlcbiAgX2FsbERyYXdlcnM6IFF1ZXJ5TGlzdDxNYXREcmF3ZXI+O1xuXG4gIC8qKiBEcmF3ZXJzIHRoYXQgYmVsb25nIHRvIHRoaXMgY29udGFpbmVyLiAqL1xuICBfZHJhd2VycyA9IG5ldyBRdWVyeUxpc3Q8TWF0RHJhd2VyPigpO1xuXG4gIEBDb250ZW50Q2hpbGQoTWF0RHJhd2VyQ29udGVudCkgX2NvbnRlbnQ6IE1hdERyYXdlckNvbnRlbnQ7XG4gIEBWaWV3Q2hpbGQoTWF0RHJhd2VyQ29udGVudCkgX3VzZXJDb250ZW50OiBNYXREcmF3ZXJDb250ZW50O1xuXG4gIC8qKiBUaGUgZHJhd2VyIGNoaWxkIHdpdGggdGhlIGBzdGFydGAgcG9zaXRpb24uICovXG4gIGdldCBzdGFydCgpOiBNYXREcmF3ZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnQ7XG4gIH1cblxuICAvKiogVGhlIGRyYXdlciBjaGlsZCB3aXRoIHRoZSBgZW5kYCBwb3NpdGlvbi4gKi9cbiAgZ2V0IGVuZCgpOiBNYXREcmF3ZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYXV0b21hdGljYWxseSByZXNpemUgdGhlIGNvbnRhaW5lciB3aGVuZXZlclxuICAgKiB0aGUgc2l6ZSBvZiBhbnkgb2YgaXRzIGRyYXdlcnMgY2hhbmdlcy5cbiAgICpcbiAgICogKipVc2UgYXQgeW91ciBvd24gcmlzayEqKiBFbmFibGluZyB0aGlzIG9wdGlvbiBjYW4gY2F1c2UgbGF5b3V0IHRocmFzaGluZyBieSBtZWFzdXJpbmdcbiAgICogdGhlIGRyYXdlcnMgb24gZXZlcnkgY2hhbmdlIGRldGVjdGlvbiBjeWNsZS4gQ2FuIGJlIGNvbmZpZ3VyZWQgZ2xvYmFsbHkgdmlhIHRoZVxuICAgKiBgTUFUX0RSQVdFUl9ERUZBVUxUX0FVVE9TSVpFYCB0b2tlbi5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBhdXRvc2l6ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYXV0b3NpemU7XG4gIH1cbiAgc2V0IGF1dG9zaXplKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9hdXRvc2l6ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfYXV0b3NpemU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRyYXdlciBjb250YWluZXIgc2hvdWxkIGhhdmUgYSBiYWNrZHJvcCB3aGlsZSBvbmUgb2YgdGhlIHNpZGVuYXZzIGlzIG9wZW4uXG4gICAqIElmIGV4cGxpY2l0bHkgc2V0IHRvIGB0cnVlYCwgdGhlIGJhY2tkcm9wIHdpbGwgYmUgZW5hYmxlZCBmb3IgZHJhd2VycyBpbiB0aGUgYHNpZGVgXG4gICAqIG1vZGUgYXMgd2VsbC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBoYXNCYWNrZHJvcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZHJhd2VySGFzQmFja2Ryb3AodGhpcy5fc3RhcnQpIHx8IHRoaXMuX2RyYXdlckhhc0JhY2tkcm9wKHRoaXMuX2VuZCk7XG4gIH1cbiAgc2V0IGhhc0JhY2tkcm9wKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9iYWNrZHJvcE92ZXJyaWRlID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9iYWNrZHJvcE92ZXJyaWRlOiBib29sZWFuIHwgbnVsbDtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBkcmF3ZXIgYmFja2Ryb3AgaXMgY2xpY2tlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGJhY2tkcm9wQ2xpY2s6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKiogVGhlIGRyYXdlciBhdCB0aGUgc3RhcnQvZW5kIHBvc2l0aW9uLCBpbmRlcGVuZGVudCBvZiBkaXJlY3Rpb24uICovXG4gIHByaXZhdGUgX3N0YXJ0OiBNYXREcmF3ZXIgfCBudWxsO1xuICBwcml2YXRlIF9lbmQ6IE1hdERyYXdlciB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBkcmF3ZXIgYXQgdGhlIGxlZnQvcmlnaHQuIFdoZW4gZGlyZWN0aW9uIGNoYW5nZXMsIHRoZXNlIHdpbGwgY2hhbmdlIGFzIHdlbGwuXG4gICAqIFRoZXkncmUgdXNlZCBhcyBhbGlhc2VzIGZvciB0aGUgYWJvdmUgdG8gc2V0IHRoZSBsZWZ0L3JpZ2h0IHN0eWxlIHByb3Blcmx5LlxuICAgKiBJbiBMVFIsIF9sZWZ0ID09IF9zdGFydCBhbmQgX3JpZ2h0ID09IF9lbmQuXG4gICAqIEluIFJUTCwgX2xlZnQgPT0gX2VuZCBhbmQgX3JpZ2h0ID09IF9zdGFydC5cbiAgICovXG4gIHByaXZhdGUgX2xlZnQ6IE1hdERyYXdlciB8IG51bGw7XG4gIHByaXZhdGUgX3JpZ2h0OiBNYXREcmF3ZXIgfCBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBFbWl0cyBvbiBldmVyeSBuZ0RvQ2hlY2suIFVzZWQgZm9yIGRlYm91bmNpbmcgcmVmbG93cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZG9DaGVja1N1YmplY3QgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBNYXJnaW5zIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGNvbnRlbnQuIFRoZXNlIGFyZSB1c2VkIHRvIHB1c2ggLyBzaHJpbmsgdGhlIGRyYXdlciBjb250ZW50IHdoZW4gYVxuICAgKiBkcmF3ZXIgaXMgb3Blbi4gV2UgdXNlIG1hcmdpbiByYXRoZXIgdGhhbiB0cmFuc2Zvcm0gZXZlbiBmb3IgcHVzaCBtb2RlIGJlY2F1c2UgdHJhbnNmb3JtIGJyZWFrc1xuICAgKiBmaXhlZCBwb3NpdGlvbiBlbGVtZW50cyBpbnNpZGUgb2YgdGhlIHRyYW5zZm9ybWVkIGVsZW1lbnQuXG4gICAqL1xuICBfY29udGVudE1hcmdpbnM6IHtsZWZ0OiBudW1iZXIgfCBudWxsOyByaWdodDogbnVtYmVyIHwgbnVsbH0gPSB7bGVmdDogbnVsbCwgcmlnaHQ6IG51bGx9O1xuXG4gIHJlYWRvbmx5IF9jb250ZW50TWFyZ2luQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHtsZWZ0OiBudW1iZXIgfCBudWxsOyByaWdodDogbnVtYmVyIHwgbnVsbH0+KCk7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrU2Nyb2xsYWJsZSBpbnN0YW5jZSB0aGF0IHdyYXBzIHRoZSBzY3JvbGxhYmxlIGNvbnRlbnQuICovXG4gIGdldCBzY3JvbGxhYmxlKCk6IENka1Njcm9sbGFibGUge1xuICAgIHJldHVybiB0aGlzLl91c2VyQ29udGVudCB8fCB0aGlzLl9jb250ZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgcHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXG4gICAgQEluamVjdChNQVRfRFJBV0VSX0RFRkFVTFRfQVVUT1NJWkUpIGRlZmF1bHRBdXRvc2l6ZSA9IGZhbHNlLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwcml2YXRlIF9hbmltYXRpb25Nb2RlPzogc3RyaW5nLFxuICApIHtcbiAgICAvLyBJZiBhIGBEaXJgIGRpcmVjdGl2ZSBleGlzdHMgdXAgdGhlIHRyZWUsIGxpc3RlbiBkaXJlY3Rpb24gY2hhbmdlc1xuICAgIC8vIGFuZCB1cGRhdGUgdGhlIGxlZnQvcmlnaHQgcHJvcGVydGllcyB0byBwb2ludCB0byB0aGUgcHJvcGVyIHN0YXJ0L2VuZC5cbiAgICBpZiAoX2Rpcikge1xuICAgICAgX2Rpci5jaGFuZ2UucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fdmFsaWRhdGVEcmF3ZXJzKCk7XG4gICAgICAgIHRoaXMudXBkYXRlQ29udGVudE1hcmdpbnMoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFNpbmNlIHRoZSBtaW5pbXVtIHdpZHRoIG9mIHRoZSBzaWRlbmF2IGRlcGVuZHMgb24gdGhlIHZpZXdwb3J0IHdpZHRoLFxuICAgIC8vIHdlIG5lZWQgdG8gcmVjb21wdXRlIHRoZSBtYXJnaW5zIGlmIHRoZSB2aWV3cG9ydCBjaGFuZ2VzLlxuICAgIHZpZXdwb3J0UnVsZXJcbiAgICAgIC5jaGFuZ2UoKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMudXBkYXRlQ29udGVudE1hcmdpbnMoKSk7XG5cbiAgICB0aGlzLl9hdXRvc2l6ZSA9IGRlZmF1bHRBdXRvc2l6ZTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9hbGxEcmF3ZXJzLmNoYW5nZXNcbiAgICAgIC5waXBlKHN0YXJ0V2l0aCh0aGlzLl9hbGxEcmF3ZXJzKSwgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKChkcmF3ZXI6IFF1ZXJ5TGlzdDxNYXREcmF3ZXI+KSA9PiB7XG4gICAgICAgIHRoaXMuX2RyYXdlcnMucmVzZXQoZHJhd2VyLmZpbHRlcihpdGVtID0+ICFpdGVtLl9jb250YWluZXIgfHwgaXRlbS5fY29udGFpbmVyID09PSB0aGlzKSk7XG4gICAgICAgIHRoaXMuX2RyYXdlcnMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX2RyYXdlcnMuY2hhbmdlcy5waXBlKHN0YXJ0V2l0aChudWxsKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX3ZhbGlkYXRlRHJhd2VycygpO1xuXG4gICAgICB0aGlzLl9kcmF3ZXJzLmZvckVhY2goKGRyYXdlcjogTWF0RHJhd2VyKSA9PiB7XG4gICAgICAgIHRoaXMuX3dhdGNoRHJhd2VyVG9nZ2xlKGRyYXdlcik7XG4gICAgICAgIHRoaXMuX3dhdGNoRHJhd2VyUG9zaXRpb24oZHJhd2VyKTtcbiAgICAgICAgdGhpcy5fd2F0Y2hEcmF3ZXJNb2RlKGRyYXdlcik7XG4gICAgICB9KTtcblxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5fZHJhd2Vycy5sZW5ndGggfHxcbiAgICAgICAgdGhpcy5faXNEcmF3ZXJPcGVuKHRoaXMuX3N0YXJ0KSB8fFxuICAgICAgICB0aGlzLl9pc0RyYXdlck9wZW4odGhpcy5fZW5kKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ29udGVudE1hcmdpbnMoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBdm9pZCBoaXR0aW5nIHRoZSBOZ1pvbmUgdGhyb3VnaCB0aGUgZGVib3VuY2UgdGltZW91dC5cbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgdGhpcy5fZG9DaGVja1N1YmplY3RcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgZGVib3VuY2VUaW1lKDEwKSwgLy8gQXJiaXRyYXJ5IGRlYm91bmNlIHRpbWUsIGxlc3MgdGhhbiBhIGZyYW1lIGF0IDYwZnBzXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCksXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLnVwZGF0ZUNvbnRlbnRNYXJnaW5zKCkpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fY29udGVudE1hcmdpbkNoYW5nZXMuY29tcGxldGUoKTtcbiAgICB0aGlzLl9kb0NoZWNrU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2RyYXdlcnMuZGVzdHJveSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogQ2FsbHMgYG9wZW5gIG9mIGJvdGggc3RhcnQgYW5kIGVuZCBkcmF3ZXJzICovXG4gIG9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy5fZHJhd2Vycy5mb3JFYWNoKGRyYXdlciA9PiBkcmF3ZXIub3BlbigpKTtcbiAgfVxuXG4gIC8qKiBDYWxscyBgY2xvc2VgIG9mIGJvdGggc3RhcnQgYW5kIGVuZCBkcmF3ZXJzICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RyYXdlcnMuZm9yRWFjaChkcmF3ZXIgPT4gZHJhd2VyLmNsb3NlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY2FsY3VsYXRlcyBhbmQgdXBkYXRlcyB0aGUgaW5saW5lIHN0eWxlcyBmb3IgdGhlIGNvbnRlbnQuIE5vdGUgdGhhdCB0aGlzIHNob3VsZCBiZSB1c2VkXG4gICAqIHNwYXJpbmdseSwgYmVjYXVzZSBpdCBjYXVzZXMgYSByZWZsb3cuXG4gICAqL1xuICB1cGRhdGVDb250ZW50TWFyZ2lucygpIHtcbiAgICAvLyAxLiBGb3IgZHJhd2VycyBpbiBgb3ZlcmAgbW9kZSwgdGhleSBkb24ndCBhZmZlY3QgdGhlIGNvbnRlbnQuXG4gICAgLy8gMi4gRm9yIGRyYXdlcnMgaW4gYHNpZGVgIG1vZGUgdGhleSBzaG91bGQgc2hyaW5rIHRoZSBjb250ZW50LiBXZSBkbyB0aGlzIGJ5IGFkZGluZyB0byB0aGVcbiAgICAvLyAgICBsZWZ0IG1hcmdpbiAoZm9yIGxlZnQgZHJhd2VyKSBvciByaWdodCBtYXJnaW4gKGZvciByaWdodCB0aGUgZHJhd2VyKS5cbiAgICAvLyAzLiBGb3IgZHJhd2VycyBpbiBgcHVzaGAgbW9kZSB0aGUgc2hvdWxkIHNoaWZ0IHRoZSBjb250ZW50IHdpdGhvdXQgcmVzaXppbmcgaXQuIFdlIGRvIHRoaXMgYnlcbiAgICAvLyAgICBhZGRpbmcgdG8gdGhlIGxlZnQgb3IgcmlnaHQgbWFyZ2luIGFuZCBzaW11bHRhbmVvdXNseSBzdWJ0cmFjdGluZyB0aGUgc2FtZSBhbW91bnQgb2ZcbiAgICAvLyAgICBtYXJnaW4gZnJvbSB0aGUgb3RoZXIgc2lkZS5cbiAgICBsZXQgbGVmdCA9IDA7XG4gICAgbGV0IHJpZ2h0ID0gMDtcblxuICAgIGlmICh0aGlzLl9sZWZ0ICYmIHRoaXMuX2xlZnQub3BlbmVkKSB7XG4gICAgICBpZiAodGhpcy5fbGVmdC5tb2RlID09ICdzaWRlJykge1xuICAgICAgICBsZWZ0ICs9IHRoaXMuX2xlZnQuX2dldFdpZHRoKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2xlZnQubW9kZSA9PSAncHVzaCcpIHtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLl9sZWZ0Ll9nZXRXaWR0aCgpO1xuICAgICAgICBsZWZ0ICs9IHdpZHRoO1xuICAgICAgICByaWdodCAtPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcmlnaHQgJiYgdGhpcy5fcmlnaHQub3BlbmVkKSB7XG4gICAgICBpZiAodGhpcy5fcmlnaHQubW9kZSA9PSAnc2lkZScpIHtcbiAgICAgICAgcmlnaHQgKz0gdGhpcy5fcmlnaHQuX2dldFdpZHRoKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3JpZ2h0Lm1vZGUgPT0gJ3B1c2gnKSB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5fcmlnaHQuX2dldFdpZHRoKCk7XG4gICAgICAgIHJpZ2h0ICs9IHdpZHRoO1xuICAgICAgICBsZWZ0IC09IHdpZHRoO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIGVpdGhlciBgcmlnaHRgIG9yIGBsZWZ0YCBpcyB6ZXJvLCBkb24ndCBzZXQgYSBzdHlsZSB0byB0aGUgZWxlbWVudC4gVGhpc1xuICAgIC8vIGFsbG93cyB1c2VycyB0byBzcGVjaWZ5IGEgY3VzdG9tIHNpemUgdmlhIENTUyBjbGFzcyBpbiBTU1Igc2NlbmFyaW9zIHdoZXJlIHRoZVxuICAgIC8vIG1lYXN1cmVkIHdpZHRocyB3aWxsIGFsd2F5cyBiZSB6ZXJvLiBOb3RlIHRoYXQgd2UgcmVzZXQgdG8gYG51bGxgIGhlcmUsIHJhdGhlclxuICAgIC8vIHRoYW4gYmVsb3csIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0IHRoZSB0eXBlcyBpbiB0aGUgYGlmYCBiZWxvdyBhcmUgY29uc2lzdGVudC5cbiAgICBsZWZ0ID0gbGVmdCB8fCBudWxsITtcbiAgICByaWdodCA9IHJpZ2h0IHx8IG51bGwhO1xuXG4gICAgaWYgKGxlZnQgIT09IHRoaXMuX2NvbnRlbnRNYXJnaW5zLmxlZnQgfHwgcmlnaHQgIT09IHRoaXMuX2NvbnRlbnRNYXJnaW5zLnJpZ2h0KSB7XG4gICAgICB0aGlzLl9jb250ZW50TWFyZ2lucyA9IHtsZWZ0LCByaWdodH07XG5cbiAgICAgIC8vIFB1bGwgYmFjayBpbnRvIHRoZSBOZ1pvbmUgc2luY2UgaW4gc29tZSBjYXNlcyB3ZSBjb3VsZCBiZSBvdXRzaWRlLiBXZSBuZWVkIHRvIGJlIGNhcmVmdWxcbiAgICAgIC8vIHRvIGRvIGl0IG9ubHkgd2hlbiBzb21ldGhpbmcgY2hhbmdlZCwgb3RoZXJ3aXNlIHdlIGNhbiBlbmQgdXAgaGl0dGluZyB0aGUgem9uZSB0b28gb2Z0ZW4uXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuX2NvbnRlbnRNYXJnaW5DaGFuZ2VzLm5leHQodGhpcy5fY29udGVudE1hcmdpbnMpKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgLy8gSWYgdXNlcnMgb3B0ZWQgaW50byBhdXRvc2l6aW5nLCBkbyBhIGNoZWNrIGV2ZXJ5IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUuXG4gICAgaWYgKHRoaXMuX2F1dG9zaXplICYmIHRoaXMuX2lzUHVzaGVkKCkpIHtcbiAgICAgIC8vIFJ1biBvdXRzaWRlIHRoZSBOZ1pvbmUsIG90aGVyd2lzZSB0aGUgZGVib3VuY2VyIHdpbGwgdGhyb3cgdXMgaW50byBhbiBpbmZpbml0ZSBsb29wLlxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHRoaXMuX2RvQ2hlY2tTdWJqZWN0Lm5leHQoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gZHJhd2VyIGV2ZW50cyBpbiBvcmRlciB0byBzZXQgYSBjbGFzcyBvbiB0aGUgbWFpbiBjb250YWluZXIgZWxlbWVudCB3aGVuIHRoZVxuICAgKiBkcmF3ZXIgaXMgb3BlbiBhbmQgdGhlIGJhY2tkcm9wIGlzIHZpc2libGUuIFRoaXMgZW5zdXJlcyBhbnkgb3ZlcmZsb3cgb24gdGhlIGNvbnRhaW5lciBlbGVtZW50XG4gICAqIGlzIHByb3Blcmx5IGhpZGRlbi5cbiAgICovXG4gIHByaXZhdGUgX3dhdGNoRHJhd2VyVG9nZ2xlKGRyYXdlcjogTWF0RHJhd2VyKTogdm9pZCB7XG4gICAgZHJhd2VyLl9hbmltYXRpb25TdGFydGVkXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKChldmVudDogQW5pbWF0aW9uRXZlbnQpID0+IGV2ZW50LmZyb21TdGF0ZSAhPT0gZXZlbnQudG9TdGF0ZSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kcmF3ZXJzLmNoYW5nZXMpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSA9PiB7XG4gICAgICAgIC8vIFNldCB0aGUgdHJhbnNpdGlvbiBjbGFzcyBvbiB0aGUgY29udGFpbmVyIHNvIHRoYXQgdGhlIGFuaW1hdGlvbnMgb2NjdXIuIFRoaXMgc2hvdWxkIG5vdFxuICAgICAgICAvLyBiZSBzZXQgaW5pdGlhbGx5IGJlY2F1c2UgYW5pbWF0aW9ucyBzaG91bGQgb25seSBiZSB0cmlnZ2VyZWQgdmlhIGEgY2hhbmdlIGluIHN0YXRlLlxuICAgICAgICBpZiAoZXZlbnQudG9TdGF0ZSAhPT0gJ29wZW4taW5zdGFudCcgJiYgdGhpcy5fYW5pbWF0aW9uTW9kZSAhPT0gJ05vb3BBbmltYXRpb25zJykge1xuICAgICAgICAgIHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXQtZHJhd2VyLXRyYW5zaXRpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlQ29udGVudE1hcmdpbnMoKTtcbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcblxuICAgIGlmIChkcmF3ZXIubW9kZSAhPT0gJ3NpZGUnKSB7XG4gICAgICBkcmF3ZXIub3BlbmVkQ2hhbmdlXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kcmF3ZXJzLmNoYW5nZXMpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3NldENvbnRhaW5lckNsYXNzKGRyYXdlci5vcGVuZWQpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyB0byBkcmF3ZXIgb25Qb3NpdGlvbkNoYW5nZWQgZXZlbnQgaW4gb3JkZXIgdG9cbiAgICogcmUtdmFsaWRhdGUgZHJhd2VycyB3aGVuIHRoZSBwb3NpdGlvbiBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfd2F0Y2hEcmF3ZXJQb3NpdGlvbihkcmF3ZXI6IE1hdERyYXdlcik6IHZvaWQge1xuICAgIGlmICghZHJhd2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIE5PVEU6IFdlIG5lZWQgdG8gd2FpdCBmb3IgdGhlIG1pY3JvdGFzayBxdWV1ZSB0byBiZSBlbXB0eSBiZWZvcmUgdmFsaWRhdGluZyxcbiAgICAvLyBzaW5jZSBib3RoIGRyYXdlcnMgbWF5IGJlIHN3YXBwaW5nIHBvc2l0aW9ucyBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIGRyYXdlci5vblBvc2l0aW9uQ2hhbmdlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kcmF3ZXJzLmNoYW5nZXMpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgYWZ0ZXJOZXh0UmVuZGVyKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdmFsaWRhdGVEcmF3ZXJzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHtpbmplY3RvcjogdGhpcy5faW5qZWN0b3IsIHBoYXNlOiBBZnRlclJlbmRlclBoYXNlLlJlYWR9LFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmVzIHRvIGNoYW5nZXMgaW4gZHJhd2VyIG1vZGUgc28gd2UgY2FuIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uLiAqL1xuICBwcml2YXRlIF93YXRjaERyYXdlck1vZGUoZHJhd2VyOiBNYXREcmF3ZXIpOiB2b2lkIHtcbiAgICBpZiAoZHJhd2VyKSB7XG4gICAgICBkcmF3ZXIuX21vZGVDaGFuZ2VkXG4gICAgICAgIC5waXBlKHRha2VVbnRpbChtZXJnZSh0aGlzLl9kcmF3ZXJzLmNoYW5nZXMsIHRoaXMuX2Rlc3Ryb3llZCkpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUNvbnRlbnRNYXJnaW5zKCk7XG4gICAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSAnbWF0LWRyYXdlci1vcGVuZWQnIGNsYXNzIG9uIHRoZSBtYWluICdtYXQtZHJhd2VyLWNvbnRhaW5lcicgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfc2V0Q29udGFpbmVyQ2xhc3MoaXNBZGQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBjbGFzc0xpc3QgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0O1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9ICdtYXQtZHJhd2VyLWNvbnRhaW5lci1oYXMtb3Blbic7XG5cbiAgICBpZiAoaXNBZGQpIHtcbiAgICAgIGNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBWYWxpZGF0ZSB0aGUgc3RhdGUgb2YgdGhlIGRyYXdlciBjaGlsZHJlbiBjb21wb25lbnRzLiAqL1xuICBwcml2YXRlIF92YWxpZGF0ZURyYXdlcnMoKSB7XG4gICAgdGhpcy5fc3RhcnQgPSB0aGlzLl9lbmQgPSBudWxsO1xuXG4gICAgLy8gRW5zdXJlIHRoYXQgd2UgaGF2ZSBhdCBtb3N0IG9uZSBzdGFydCBhbmQgb25lIGVuZCBkcmF3ZXIuXG4gICAgdGhpcy5fZHJhd2Vycy5mb3JFYWNoKGRyYXdlciA9PiB7XG4gICAgICBpZiAoZHJhd2VyLnBvc2l0aW9uID09ICdlbmQnKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmQgIT0gbnVsbCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICAgIHRocm93TWF0RHVwbGljYXRlZERyYXdlckVycm9yKCdlbmQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbmQgPSBkcmF3ZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5fc3RhcnQgIT0gbnVsbCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICAgIHRocm93TWF0RHVwbGljYXRlZERyYXdlckVycm9yKCdzdGFydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0YXJ0ID0gZHJhd2VyO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fcmlnaHQgPSB0aGlzLl9sZWZ0ID0gbnVsbDtcblxuICAgIC8vIERldGVjdCBpZiB3ZSdyZSBMVFIgb3IgUlRMLlxuICAgIGlmICh0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09PSAncnRsJykge1xuICAgICAgdGhpcy5fbGVmdCA9IHRoaXMuX2VuZDtcbiAgICAgIHRoaXMuX3JpZ2h0ID0gdGhpcy5fc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xlZnQgPSB0aGlzLl9zdGFydDtcbiAgICAgIHRoaXMuX3JpZ2h0ID0gdGhpcy5fZW5kO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb250YWluZXIgaXMgYmVpbmcgcHVzaGVkIHRvIHRoZSBzaWRlIGJ5IG9uZSBvZiB0aGUgZHJhd2Vycy4gKi9cbiAgcHJpdmF0ZSBfaXNQdXNoZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICh0aGlzLl9pc0RyYXdlck9wZW4odGhpcy5fc3RhcnQpICYmIHRoaXMuX3N0YXJ0Lm1vZGUgIT0gJ292ZXInKSB8fFxuICAgICAgKHRoaXMuX2lzRHJhd2VyT3Blbih0aGlzLl9lbmQpICYmIHRoaXMuX2VuZC5tb2RlICE9ICdvdmVyJylcbiAgICApO1xuICB9XG5cbiAgX29uQmFja2Ryb3BDbGlja2VkKCkge1xuICAgIHRoaXMuYmFja2Ryb3BDbGljay5lbWl0KCk7XG4gICAgdGhpcy5fY2xvc2VNb2RhbERyYXdlcnNWaWFCYWNrZHJvcCgpO1xuICB9XG5cbiAgX2Nsb3NlTW9kYWxEcmF3ZXJzVmlhQmFja2Ryb3AoKSB7XG4gICAgLy8gQ2xvc2UgYWxsIG9wZW4gZHJhd2VycyB3aGVyZSBjbG9zaW5nIGlzIG5vdCBkaXNhYmxlZCBhbmQgdGhlIG1vZGUgaXMgbm90IGBzaWRlYC5cbiAgICBbdGhpcy5fc3RhcnQsIHRoaXMuX2VuZF1cbiAgICAgIC5maWx0ZXIoZHJhd2VyID0+IGRyYXdlciAmJiAhZHJhd2VyLmRpc2FibGVDbG9zZSAmJiB0aGlzLl9kcmF3ZXJIYXNCYWNrZHJvcChkcmF3ZXIpKVxuICAgICAgLmZvckVhY2goZHJhd2VyID0+IGRyYXdlciEuX2Nsb3NlVmlhQmFja2Ryb3BDbGljaygpKTtcbiAgfVxuXG4gIF9pc1Nob3dpbmdCYWNrZHJvcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgKHRoaXMuX2lzRHJhd2VyT3Blbih0aGlzLl9zdGFydCkgJiYgdGhpcy5fZHJhd2VySGFzQmFja2Ryb3AodGhpcy5fc3RhcnQpKSB8fFxuICAgICAgKHRoaXMuX2lzRHJhd2VyT3Blbih0aGlzLl9lbmQpICYmIHRoaXMuX2RyYXdlckhhc0JhY2tkcm9wKHRoaXMuX2VuZCkpXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2lzRHJhd2VyT3BlbihkcmF3ZXI6IE1hdERyYXdlciB8IG51bGwpOiBkcmF3ZXIgaXMgTWF0RHJhd2VyIHtcbiAgICByZXR1cm4gZHJhd2VyICE9IG51bGwgJiYgZHJhd2VyLm9wZW5lZDtcbiAgfVxuXG4gIC8vIFdoZXRoZXIgYXJndW1lbnQgZHJhd2VyIHNob3VsZCBoYXZlIGEgYmFja2Ryb3Agd2hlbiBpdCBvcGVuc1xuICBwcml2YXRlIF9kcmF3ZXJIYXNCYWNrZHJvcChkcmF3ZXI6IE1hdERyYXdlciB8IG51bGwpIHtcbiAgICBpZiAodGhpcy5fYmFja2Ryb3BPdmVycmlkZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gISFkcmF3ZXIgJiYgZHJhd2VyLm1vZGUgIT09ICdzaWRlJztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fYmFja2Ryb3BPdmVycmlkZTtcbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cIm1hdC1kcmF3ZXItaW5uZXItY29udGFpbmVyXCIgY2RrU2Nyb2xsYWJsZSAjY29udGVudD5cclxuICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbjwvZGl2PlxyXG4iLCJAaWYgKGhhc0JhY2tkcm9wKSB7XG4gIDxkaXYgY2xhc3M9XCJtYXQtZHJhd2VyLWJhY2tkcm9wXCIgKGNsaWNrKT1cIl9vbkJhY2tkcm9wQ2xpY2tlZCgpXCJcbiAgICAgICBbY2xhc3MubWF0LWRyYXdlci1zaG93bl09XCJfaXNTaG93aW5nQmFja2Ryb3AoKVwiPjwvZGl2PlxufVxuXG48bmctY29udGVudCBzZWxlY3Q9XCJtYXQtZHJhd2VyXCI+PC9uZy1jb250ZW50PlxuXG48bmctY29udGVudCBzZWxlY3Q9XCJtYXQtZHJhd2VyLWNvbnRlbnRcIj5cbjwvbmctY29udGVudD5cblxuQGlmICghX2NvbnRlbnQpIHtcbiAgPG1hdC1kcmF3ZXItY29udGVudD5cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gIDwvbWF0LWRyYXdlci1jb250ZW50PlxufVxuIl19