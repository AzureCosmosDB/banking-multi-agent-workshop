import * as i0 from '@angular/core';
import { Directive, InjectionToken, Optional, SkipSelf, Inject, Injectable, inject, Injector, ViewContainerRef, EventEmitter, NgZone, ElementRef, ChangeDetectorRef, booleanAttribute, Input, Output, signal, computed, ContentChildren, NgModule } from '@angular/core';
import { Overlay, OverlayConfig, STANDARD_DROPDOWN_BELOW_POSITIONS, STANDARD_DROPDOWN_ADJACENT_POSITIONS, OverlayModule } from '@angular/cdk/overlay';
import { ENTER, SPACE, UP_ARROW, hasModifierKey, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, ESCAPE } from '@angular/cdk/keycodes';
import { startWith, debounceTime, distinctUntilChanged, filter, takeUntil, mergeMap, mapTo, mergeAll, switchMap, skipWhile, skip } from 'rxjs/operators';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Subject, merge, fromEvent, defer, partition } from 'rxjs';
import { TemplatePortal } from '@angular/cdk/portal';
import { InputModalityDetector, FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { _getEventTarget } from '@angular/cdk/platform';

/**
 * A grouping container for `CdkMenuItemRadio` instances, similar to a `role="radiogroup"` element.
 */
class CdkMenuGroup {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuGroup, isStandalone: true, selector: "[cdkMenuGroup]", host: { attributes: { "role": "group" }, classAttribute: "cdk-menu-group" }, providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }], exportAs: ["cdkMenuGroup"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuGroup]',
                    exportAs: 'cdkMenuGroup',
                    standalone: true,
                    host: {
                        'role': 'group',
                        'class': 'cdk-menu-group',
                    },
                    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }],
                }]
        }] });

/** Injection token used to return classes implementing the Menu interface */
const CDK_MENU = new InjectionToken('cdk-menu');

/** The relative item in the inline menu to focus after closing all popup menus. */
var FocusNext;
(function (FocusNext) {
    FocusNext[FocusNext["nextItem"] = 0] = "nextItem";
    FocusNext[FocusNext["previousItem"] = 1] = "previousItem";
    FocusNext[FocusNext["currentItem"] = 2] = "currentItem";
})(FocusNext || (FocusNext = {}));
/** Injection token used for an implementation of MenuStack. */
const MENU_STACK = new InjectionToken('cdk-menu-stack');
/** Provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
const PARENT_OR_NEW_MENU_STACK_PROVIDER = {
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
};
/** Provider that provides the parent menu stack, or a new inline menu stack if there is no parent one. */
const PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER = (orientation) => ({
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || MenuStack.inline(orientation),
});
/** The next available menu stack ID. */
let nextId$2 = 0;
/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
class MenuStack {
    constructor() {
        /** The ID of this menu stack. */
        this.id = `${nextId$2++}`;
        /** All MenuStackItems tracked by this MenuStack. */
        this._elements = [];
        /** Emits the element which was popped off of the stack when requested by a closer. */
        this._close = new Subject();
        /** Emits once the MenuStack has become empty after popping off elements. */
        this._empty = new Subject();
        /** Emits whether any menu in the menu stack has focus. */
        this._hasFocus = new Subject();
        /** Observable which emits the MenuStackItem which has been requested to close. */
        this.closed = this._close;
        /** Observable which emits whether any menu in the menu stack has focus. */
        this.hasFocus = this._hasFocus.pipe(startWith(false), debounceTime(0), distinctUntilChanged());
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.emptied = this._empty;
        /**
         * Whether the inline menu associated with this menu stack is vertical or horizontal.
         * `null` indicates there is no inline menu associated with this menu stack.
         */
        this._inlineMenuOrientation = null;
    }
    /** Creates a menu stack that originates from an inline menu. */
    static inline(orientation) {
        const stack = new MenuStack();
        stack._inlineMenuOrientation = orientation;
        return stack;
    }
    /**
     * Adds an item to the menu stack.
     * @param menu the MenuStackItem to put on the stack.
     */
    push(menu) {
        this._elements.push(menu);
    }
    /**
     * Pop items off of the stack up to and including `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the last item to pop off the stack.
     * @param options Options that configure behavior on close.
     */
    close(lastItem, options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (this._elements.indexOf(lastItem) >= 0) {
            let poppedElement;
            do {
                poppedElement = this._elements.pop();
                this._close.next({ item: poppedElement, focusParentTrigger });
            } while (poppedElement !== lastItem);
            if (this.isEmpty()) {
                this._empty.next(focusNextOnEmpty);
            }
        }
    }
    /**
     * Pop items off of the stack up to but excluding `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the element which should be left on the stack
     * @return whether or not an item was removed from the stack
     */
    closeSubMenuOf(lastItem) {
        let removed = false;
        if (this._elements.indexOf(lastItem) >= 0) {
            removed = this.peek() !== lastItem;
            while (this.peek() !== lastItem) {
                this._close.next({ item: this._elements.pop() });
            }
        }
        return removed;
    }
    /**
     * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
     * @param options Options that configure behavior on close.
     */
    closeAll(options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (!this.isEmpty()) {
            while (!this.isEmpty()) {
                const menuStackItem = this._elements.pop();
                if (menuStackItem) {
                    this._close.next({ item: menuStackItem, focusParentTrigger });
                }
            }
            this._empty.next(focusNextOnEmpty);
        }
    }
    /** Return true if this stack is empty. */
    isEmpty() {
        return !this._elements.length;
    }
    /** Return the length of the stack. */
    length() {
        return this._elements.length;
    }
    /** Get the top most element on the stack. */
    peek() {
        return this._elements[this._elements.length - 1];
    }
    /** Whether the menu stack is associated with an inline menu. */
    hasInlineMenu() {
        return this._inlineMenuOrientation != null;
    }
    /** The orientation of the associated inline menu. */
    inlineMenuOrientation() {
        return this._inlineMenuOrientation;
    }
    /** Sets whether the menu stack contains the focused element. */
    setHasFocus(hasFocus) {
        this._hasFocus.next(hasFocus);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MenuStack, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MenuStack }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MenuStack, decorators: [{
            type: Injectable
        }] });

/** Injection token used for an implementation of MenuStack. */
const MENU_TRIGGER = new InjectionToken('cdk-menu-trigger');
/** Injection token used to configure the behavior of the menu when the page is scrolled. */
const MENU_SCROLL_STRATEGY = new InjectionToken('cdk-menu-scroll-strategy', {
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
class CdkMenuTriggerBase {
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

/**
 * Throws an exception when an instance of the PointerFocusTracker is not provided.
 * @docs-private
 */
function throwMissingPointerFocusTracker() {
    throw Error('expected an instance of PointerFocusTracker to be provided');
}
/**
 * Throws an exception when a reference to the parent menu is not provided.
 * @docs-private
 */
function throwMissingMenuReference() {
    throw Error('expected a reference to the parent menu');
}

/** Injection token used for an implementation of MenuAim. */
const MENU_AIM = new InjectionToken('cdk-menu-aim');
/** Capture every nth mouse move event. */
const MOUSE_MOVE_SAMPLE_FREQUENCY = 3;
/** The number of mouse move events to track. */
const NUM_POINTS = 5;
/**
 * How long to wait before closing a sibling menu if a user stops short of the submenu they were
 * predicted to go into.
 */
const CLOSE_DELAY = 300;
/** Calculate the slope between point a and b. */
function getSlope(a, b) {
    return (b.y - a.y) / (b.x - a.x);
}
/** Calculate the y intercept for the given point and slope. */
function getYIntercept(point, slope) {
    return point.y - slope * point.x;
}
/**
 * Whether the given mouse trajectory line defined by the slope and y intercept falls within the
 * submenu as defined by `submenuPoints`
 * @param submenuPoints the submenu DOMRect points.
 * @param m the slope of the trajectory line.
 * @param b the y intercept of the trajectory line.
 * @return true if any point on the line falls within the submenu.
 */
function isWithinSubmenu(submenuPoints, m, b) {
    const { left, right, top, bottom } = submenuPoints;
    // Check for intersection with each edge of the submenu (left, right, top, bottom)
    // by fixing one coordinate to that edge's coordinate (either x or y) and checking if the
    // other coordinate is within bounds.
    return ((m * left + b >= top && m * left + b <= bottom) ||
        (m * right + b >= top && m * right + b <= bottom) ||
        ((top - b) / m >= left && (top - b) / m <= right) ||
        ((bottom - b) / m >= left && (bottom - b) / m <= right));
}
/**
 * TargetMenuAim predicts if a user is moving into a submenu. It calculates the
 * trajectory of the user's mouse movement in the current menu to determine if the
 * mouse is moving towards an open submenu.
 *
 * The determination is made by calculating the slope of the users last NUM_POINTS moves where each
 * pair of points determines if the trajectory line points into the submenu. It uses consensus
 * approach by checking if at least NUM_POINTS / 2 pairs determine that the user is moving towards
 * to submenu.
 */
class TargetMenuAim {
    constructor() {
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        /** The last NUM_POINTS mouse move events. */
        this._points = [];
        /** Emits when this service is destroyed. */
        this._destroyed = new Subject();
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Set the Menu and its PointerFocusTracker.
     * @param menu The menu that this menu aim service controls.
     * @param pointerTracker The `PointerFocusTracker` for the given menu.
     */
    initialize(menu, pointerTracker) {
        this._menu = menu;
        this._pointerTracker = pointerTracker;
        this._subscribeToMouseMoves();
    }
    /**
     * Calls the `doToggle` callback when it is deemed that the user is not moving towards
     * the submenu.
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    toggle(doToggle) {
        // If the menu is horizontal the sub-menus open below and there is no risk of premature
        // closing of any sub-menus therefore we automatically resolve the callback.
        if (this._menu.orientation === 'horizontal') {
            doToggle();
        }
        this._checkConfigured();
        const siblingItemIsWaiting = !!this._timeoutId;
        const hasPoints = this._points.length > 1;
        if (hasPoints && !siblingItemIsWaiting) {
            if (this._isMovingToSubmenu()) {
                this._startTimeout(doToggle);
            }
            else {
                doToggle();
            }
        }
        else if (!siblingItemIsWaiting) {
            doToggle();
        }
    }
    /**
     * Start the delayed toggle handler if one isn't running already.
     *
     * The delayed toggle handler executes the `doToggle` callback after some period of time iff the
     * users mouse is on an item in the current menu.
     *
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    _startTimeout(doToggle) {
        // If the users mouse is moving towards a submenu we don't want to immediately resolve.
        // Wait for some period of time before determining if the previous menu should close in
        // cases where the user may have moved towards the submenu but stopped on a sibling menu
        // item intentionally.
        const timeoutId = setTimeout(() => {
            // Resolve if the user is currently moused over some element in the root menu
            if (this._pointerTracker.activeElement && timeoutId === this._timeoutId) {
                doToggle();
            }
            this._timeoutId = null;
        }, CLOSE_DELAY);
        this._timeoutId = timeoutId;
    }
    /** Whether the user is heading towards the open submenu. */
    _isMovingToSubmenu() {
        const submenuPoints = this._getSubmenuBounds();
        if (!submenuPoints) {
            return false;
        }
        let numMoving = 0;
        const currPoint = this._points[this._points.length - 1];
        // start from the second last point and calculate the slope between each point and the last
        // point.
        for (let i = this._points.length - 2; i >= 0; i--) {
            const previous = this._points[i];
            const slope = getSlope(currPoint, previous);
            if (isWithinSubmenu(submenuPoints, slope, getYIntercept(currPoint, slope))) {
                numMoving++;
            }
        }
        return numMoving >= Math.floor(NUM_POINTS / 2);
    }
    /** Get the bounding DOMRect for the open submenu. */
    _getSubmenuBounds() {
        return this._pointerTracker?.previousElement?.getMenu()?.nativeElement.getBoundingClientRect();
    }
    /**
     * Check if a reference to the PointerFocusTracker and menu element is provided.
     * @throws an error if neither reference is provided.
     */
    _checkConfigured() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._pointerTracker) {
                throwMissingPointerFocusTracker();
            }
            if (!this._menu) {
                throwMissingMenuReference();
            }
        }
    }
    /** Subscribe to the root menus mouse move events and update the tracked mouse points. */
    _subscribeToMouseMoves() {
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._menu.nativeElement, 'mousemove')
                .pipe(filter((_, index) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0), takeUntil(this._destroyed))
                .subscribe((event) => {
                this._points.push({ x: event.clientX, y: event.clientY });
                if (this._points.length > NUM_POINTS) {
                    this._points.shift();
                }
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TargetMenuAim }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TargetMenuAim, decorators: [{
            type: Injectable
        }] });
/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It can be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
class CdkTargetMenuAim {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkTargetMenuAim, isStandalone: true, selector: "[cdkTargetMenuAim]", providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }], exportAs: ["cdkTargetMenuAim"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTargetMenuAim, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTargetMenuAim]',
                    exportAs: 'cdkTargetMenuAim',
                    standalone: true,
                    providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }],
                }]
        }] });

/** Checks whether a keyboard event will trigger a native `click` event on an element. */
function eventDispatchesNativeClick(elementRef, event) {
    // Synthetic events won't trigger clicks.
    if (!event.isTrusted) {
        return false;
    }
    const el = elementRef.nativeElement;
    const keyCode = event.keyCode;
    // Buttons trigger clicks both on space and enter events.
    if (el.nodeName === 'BUTTON' && !el.disabled) {
        return keyCode === ENTER || keyCode === SPACE;
    }
    // Links only trigger clicks on enter.
    if (el.nodeName === 'A') {
        return keyCode === ENTER;
    }
    // Any other elements won't dispatch clicks from keyboard events.
    return false;
}

/**
 * A directive that turns its host element into a trigger for a popup menu.
 * It can be combined with cdkMenuItem to create sub-menus. If the element is in a top level
 * MenuBar it will open the menu on click, or if a sibling is already opened it will open on hover.
 * If it is inside of a Menu it will open the attached Submenu on hover regardless of its sibling
 * state.
 */
class CdkMenuTrigger extends CdkMenuTriggerBase {
    constructor() {
        super();
        this._elementRef = inject(ElementRef);
        this._overlay = inject(Overlay);
        this._ngZone = inject(NgZone);
        this._changeDetectorRef = inject(ChangeDetectorRef);
        this._inputModalityDetector = inject(InputModalityDetector);
        this._directionality = inject(Directionality, { optional: true });
        /** The parent menu this trigger belongs to. */
        this._parentMenu = inject(CDK_MENU, { optional: true });
        /** The menu aim service used by this menu. */
        this._menuAim = inject(MENU_AIM, { optional: true });
        this._setRole();
        this._registerCloseHandler();
        this._subscribeToMenuStackClosed();
        this._subscribeToMouseEnter();
        this._subscribeToMenuStackHasFocus();
        this._setType();
    }
    /** Toggle the attached menu. */
    toggle() {
        this.isOpen() ? this.close() : this.open();
    }
    /** Open the attached menu. */
    open() {
        if (!this.isOpen() && this.menuTemplateRef != null) {
            this.opened.next();
            this.overlayRef = this.overlayRef || this._overlay.create(this._getOverlayConfig());
            this.overlayRef.attach(this.getMenuContentPortal());
            this._changeDetectorRef.markForCheck();
            this._subscribeToOutsideClicks();
        }
    }
    /** Close the opened menu. */
    close() {
        if (this.isOpen()) {
            this.closed.next();
            this.overlayRef.detach();
            this._changeDetectorRef.markForCheck();
        }
        this._closeSiblingTriggers();
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and rendered in the DOM.
     */
    getMenu() {
        return this.childMenu;
    }
    /**
     * Handles keyboard events for the menu item.
     * @param event The keyboard event to handle
     */
    _toggleOnKeydown(event) {
        const isParentVertical = this._parentMenu?.orientation === 'vertical';
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                // Skip events that will trigger clicks so the handler doesn't get triggered twice.
                if (!hasModifierKey(event) && !eventDispatchesNativeClick(this._elementRef, event)) {
                    this.toggle();
                    this.childMenu?.focusFirstItem('keyboard');
                }
                break;
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    if (this._parentMenu && isParentVertical && this._directionality?.value !== 'rtl') {
                        event.preventDefault();
                        this.open();
                        this.childMenu?.focusFirstItem('keyboard');
                    }
                }
                break;
            case LEFT_ARROW:
                if (!hasModifierKey(event)) {
                    if (this._parentMenu && isParentVertical && this._directionality?.value === 'rtl') {
                        event.preventDefault();
                        this.open();
                        this.childMenu?.focusFirstItem('keyboard');
                    }
                }
                break;
            case DOWN_ARROW:
            case UP_ARROW:
                if (!hasModifierKey(event)) {
                    if (!isParentVertical) {
                        event.preventDefault();
                        this.open();
                        event.keyCode === DOWN_ARROW
                            ? this.childMenu?.focusFirstItem('keyboard')
                            : this.childMenu?.focusLastItem('keyboard');
                    }
                }
                break;
        }
    }
    /** Handles clicks on the menu trigger. */
    _handleClick() {
        this.toggle();
        this.childMenu?.focusFirstItem('mouse');
    }
    /**
     * Sets whether the trigger's menu stack has focus.
     * @param hasFocus Whether the menu stack has focus.
     */
    _setHasFocus(hasFocus) {
        if (!this._parentMenu) {
            this.menuStack.setHasFocus(hasFocus);
        }
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _subscribeToMouseEnter() {
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => {
                return (
                // Skip fake `mouseenter` events dispatched by touch devices.
                this._inputModalityDetector.mostRecentModality !== 'touch' &&
                    !this.menuStack.isEmpty() &&
                    !this.isOpen());
            }), takeUntil(this.destroyed))
                .subscribe(() => {
                // Closes any sibling menu items and opens the menu associated with this trigger.
                const toggleMenus = () => this._ngZone.run(() => {
                    this._closeSiblingTriggers();
                    this.open();
                });
                if (this._menuAim) {
                    this._menuAim.toggle(toggleMenus);
                }
                else {
                    toggleMenus();
                }
            });
        });
    }
    /** Close out any sibling menu trigger menus. */
    _closeSiblingTriggers() {
        if (this._parentMenu) {
            // If nothing was removed from the stack and the last element is not the parent item
            // that means that the parent menu is a menu bar since we don't put the menu bar on the
            // stack
            const isParentMenuBar = !this.menuStack.closeSubMenuOf(this._parentMenu) &&
                this.menuStack.peek() !== this._parentMenu;
            if (isParentMenuBar) {
                this.menuStack.closeAll();
            }
        }
        else {
            this.menuStack.closeAll();
        }
    }
    /** Get the configuration object used to create the overlay. */
    _getOverlayConfig() {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(),
            scrollStrategy: this.menuScrollStrategy(),
            direction: this._directionality || undefined,
        });
    }
    /** Build the position strategy for the overlay which specifies where to place the menu. */
    _getOverlayPositionStrategy() {
        return this._overlay
            .position()
            .flexibleConnectedTo(this._elementRef)
            .withLockedPosition()
            .withGrowAfterOpen()
            .withPositions(this._getOverlayPositions());
    }
    /** Get the preferred positions for the opened menu relative to the menu item. */
    _getOverlayPositions() {
        return (this.menuPosition ??
            (!this._parentMenu || this._parentMenu.orientation === 'horizontal'
                ? STANDARD_DROPDOWN_BELOW_POSITIONS
                : STANDARD_DROPDOWN_ADJACENT_POSITIONS));
    }
    /**
     * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
     * this triggers when requested.
     */
    _registerCloseHandler() {
        if (!this._parentMenu) {
            this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({ item }) => {
                if (item === this.childMenu) {
                    this.close();
                }
            });
        }
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    _subscribeToOutsideClicks() {
        if (this.overlayRef) {
            this.overlayRef
                .outsidePointerEvents()
                .pipe(takeUntil(this.stopOutsideClicksListener))
                .subscribe(event => {
                const target = _getEventTarget(event);
                const element = this._elementRef.nativeElement;
                if (target !== element && !element.contains(target)) {
                    if (!this.isElementInsideMenuStack(target)) {
                        this.menuStack.closeAll();
                    }
                    else {
                        this._closeSiblingTriggers();
                    }
                }
            });
        }
    }
    /** Subscribe to the MenuStack hasFocus events. */
    _subscribeToMenuStackHasFocus() {
        if (!this._parentMenu) {
            this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
                if (!hasFocus) {
                    this.menuStack.closeAll();
                }
            });
        }
    }
    /** Subscribe to the MenuStack closed events. */
    _subscribeToMenuStackClosed() {
        if (!this._parentMenu) {
            this.menuStack.closed.subscribe(({ focusParentTrigger }) => {
                if (focusParentTrigger && !this.menuStack.length()) {
                    this._elementRef.nativeElement.focus();
                }
            });
        }
    }
    /** Sets the role attribute for this trigger if needed. */
    _setRole() {
        // If this trigger is part of another menu, the cdkMenuItem directive will handle setting the
        // role, otherwise this is a standalone trigger, and we should ensure it has role="button".
        if (!this._parentMenu) {
            this._elementRef.nativeElement.setAttribute('role', 'button');
        }
    }
    /** Sets thte `type` attribute of the trigger. */
    _setType() {
        const element = this._elementRef.nativeElement;
        if (element.nodeName === 'BUTTON' && !element.getAttribute('type')) {
            // Prevents form submissions.
            element.setAttribute('type', 'button');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuTrigger, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuTrigger, isStandalone: true, selector: "[cdkMenuTriggerFor]", inputs: { menuTemplateRef: ["cdkMenuTriggerFor", "menuTemplateRef"], menuPosition: ["cdkMenuPosition", "menuPosition"], menuData: ["cdkMenuTriggerData", "menuData"] }, outputs: { opened: "cdkMenuOpened", closed: "cdkMenuClosed" }, host: { listeners: { "focusin": "_setHasFocus(true)", "focusout": "_setHasFocus(false)", "keydown": "_toggleOnKeydown($event)", "click": "_handleClick()" }, properties: { "attr.aria-haspopup": "menuTemplateRef ? \"menu\" : null", "attr.aria-expanded": "menuTemplateRef == null ? null : isOpen()" }, classAttribute: "cdk-menu-trigger" }, providers: [
            { provide: MENU_TRIGGER, useExisting: CdkMenuTrigger },
            PARENT_OR_NEW_MENU_STACK_PROVIDER,
        ], exportAs: ["cdkMenuTriggerFor"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuTriggerFor]',
                    exportAs: 'cdkMenuTriggerFor',
                    standalone: true,
                    host: {
                        'class': 'cdk-menu-trigger',
                        '[attr.aria-haspopup]': 'menuTemplateRef ? "menu" : null',
                        '[attr.aria-expanded]': 'menuTemplateRef == null ? null : isOpen()',
                        '(focusin)': '_setHasFocus(true)',
                        '(focusout)': '_setHasFocus(false)',
                        '(keydown)': '_toggleOnKeydown($event)',
                        '(click)': '_handleClick()',
                    },
                    inputs: [
                        { name: 'menuTemplateRef', alias: 'cdkMenuTriggerFor' },
                        { name: 'menuPosition', alias: 'cdkMenuPosition' },
                        { name: 'menuData', alias: 'cdkMenuTriggerData' },
                    ],
                    outputs: ['opened: cdkMenuOpened', 'closed: cdkMenuClosed'],
                    providers: [
                        { provide: MENU_TRIGGER, useExisting: CdkMenuTrigger },
                        PARENT_OR_NEW_MENU_STACK_PROVIDER,
                    ],
                }]
        }], ctorParameters: () => [] });

/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
class CdkMenuItem {
    /** Whether the menu item opens a menu. */
    get hasMenu() {
        return this._menuTrigger?.menuTemplateRef != null;
    }
    constructor() {
        this._dir = inject(Directionality, { optional: true });
        this._elementRef = inject(ElementRef);
        this._ngZone = inject(NgZone);
        this._inputModalityDetector = inject(InputModalityDetector);
        /** The menu aim service used by this menu. */
        this._menuAim = inject(MENU_AIM, { optional: true });
        /** The stack of menus this menu belongs to. */
        this._menuStack = inject(MENU_STACK);
        /** The parent menu in which this menuitem resides. */
        this._parentMenu = inject(CDK_MENU, { optional: true });
        /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
        this._menuTrigger = inject(CdkMenuTrigger, { optional: true, self: true });
        /**  Whether the CdkMenuItem is disabled - defaults to false */
        this.disabled = false;
        /**
         * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
         * event.
         */
        this.triggered = new EventEmitter();
        /**
         * The tabindex for this menu item managed internally and used for implementing roving a
         * tab index.
         */
        this._tabindex = -1;
        /** Whether the item should close the menu if triggered by the spacebar. */
        this.closeOnSpacebarTrigger = true;
        /** Emits when the menu item is destroyed. */
        this.destroyed = new Subject();
        this._setupMouseEnter();
        this._setType();
        if (this._isStandaloneItem()) {
            this._tabindex = 0;
        }
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Place focus on the element. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    /**
     * If the menu item is not disabled and the element does not have a menu trigger attached, emit
     * on the cdkMenuItemTriggered emitter and close all open menus.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        const { keepOpen } = { ...options };
        if (!this.disabled && !this.hasMenu) {
            this.triggered.next();
            if (!keepOpen) {
                this._menuStack.closeAll({ focusParentTrigger: true });
            }
        }
    }
    /** Return true if this MenuItem has an attached menu and it is open. */
    isMenuOpen() {
        return !!this._menuTrigger?.isOpen();
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
     * @return the menu if it is open, otherwise undefined.
     */
    getMenu() {
        return this._menuTrigger?.getMenu();
    }
    /** Get the CdkMenuTrigger associated with this element. */
    getMenuTrigger() {
        return this._menuTrigger;
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        return this.typeaheadLabel || this._elementRef.nativeElement.textContent?.trim() || '';
    }
    /** Reset the tabindex to -1. */
    _resetTabIndex() {
        if (!this._isStandaloneItem()) {
            this._tabindex = -1;
        }
    }
    /**
     * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
     * is not in a menu bar.
     */
    _setTabIndex(event) {
        if (this.disabled) {
            return;
        }
        // don't set the tabindex if there are no open sibling or parent menus
        if (!event || !this._menuStack.isEmpty()) {
            this._tabindex = 0;
        }
    }
    /**
     * Handles keyboard events for the menu item, specifically either triggering the user defined
     * callback or opening/closing the current menu based on whether the left or right arrow key was
     * pressed.
     * @param event the keyboard event to handle
     */
    _onKeydown(event) {
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                // Skip events that will trigger clicks so the handler doesn't get triggered twice.
                if (!hasModifierKey(event) && !eventDispatchesNativeClick(this._elementRef, event)) {
                    this.trigger({ keepOpen: event.keyCode === SPACE && !this.closeOnSpacebarTrigger });
                }
                break;
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    if (this._parentMenu && this._isParentVertical()) {
                        if (this._dir?.value !== 'rtl') {
                            this._forwardArrowPressed(event);
                        }
                        else {
                            this._backArrowPressed(event);
                        }
                    }
                }
                break;
            case LEFT_ARROW:
                if (!hasModifierKey(event)) {
                    if (this._parentMenu && this._isParentVertical()) {
                        if (this._dir?.value !== 'rtl') {
                            this._backArrowPressed(event);
                        }
                        else {
                            this._forwardArrowPressed(event);
                        }
                    }
                }
                break;
        }
    }
    /** Whether this menu item is standalone or within a menu or menu bar. */
    _isStandaloneItem() {
        return !this._parentMenu;
    }
    /**
     * Handles the user pressing the back arrow key.
     * @param event The keyboard event.
     */
    _backArrowPressed(event) {
        const parentMenu = this._parentMenu;
        if (this._menuStack.hasInlineMenu() || this._menuStack.length() > 1) {
            event.preventDefault();
            this._menuStack.close(parentMenu, {
                focusNextOnEmpty: this._menuStack.inlineMenuOrientation() === 'horizontal'
                    ? FocusNext.previousItem
                    : FocusNext.currentItem,
                focusParentTrigger: true,
            });
        }
    }
    /**
     * Handles the user pressing the forward arrow key.
     * @param event The keyboard event.
     */
    _forwardArrowPressed(event) {
        if (!this.hasMenu && this._menuStack.inlineMenuOrientation() === 'horizontal') {
            event.preventDefault();
            this._menuStack.closeAll({
                focusNextOnEmpty: FocusNext.nextItem,
                focusParentTrigger: true,
            });
        }
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _setupMouseEnter() {
        if (!this._isStandaloneItem()) {
            const closeOpenSiblings = () => this._ngZone.run(() => this._menuStack.closeSubMenuOf(this._parentMenu));
            this._ngZone.runOutsideAngular(() => fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => {
                return (
                // Skip fake `mouseenter` events dispatched by touch devices.
                this._inputModalityDetector.mostRecentModality !== 'touch' &&
                    !this._menuStack.isEmpty() &&
                    !this.hasMenu);
            }), takeUntil(this.destroyed))
                .subscribe(() => {
                if (this._menuAim) {
                    this._menuAim.toggle(closeOpenSiblings);
                }
                else {
                    closeOpenSiblings();
                }
            }));
        }
    }
    /**
     * Return true if the enclosing parent menu is configured in a horizontal orientation, false
     * otherwise or if no parent.
     */
    _isParentVertical() {
        return this._parentMenu?.orientation === 'vertical';
    }
    /** Sets the `type` attribute of the menu item. */
    _setType() {
        const element = this._elementRef.nativeElement;
        if (element.nodeName === 'BUTTON' && !element.getAttribute('type')) {
            // Prevent form submissions.
            element.setAttribute('type', 'button');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItem, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkMenuItem, isStandalone: true, selector: "[cdkMenuItem]", inputs: { disabled: ["cdkMenuItemDisabled", "disabled", booleanAttribute], typeaheadLabel: ["cdkMenuitemTypeaheadLabel", "typeaheadLabel"] }, outputs: { triggered: "cdkMenuItemTriggered" }, host: { attributes: { "role": "menuitem" }, listeners: { "blur": "_resetTabIndex()", "focus": "_setTabIndex()", "click": "trigger()", "keydown": "_onKeydown($event)" }, properties: { "tabindex": "_tabindex", "attr.aria-disabled": "disabled || null" }, classAttribute: "cdk-menu-item" }, exportAs: ["cdkMenuItem"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItem, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItem]',
                    exportAs: 'cdkMenuItem',
                    standalone: true,
                    host: {
                        'role': 'menuitem',
                        'class': 'cdk-menu-item',
                        '[tabindex]': '_tabindex',
                        '[attr.aria-disabled]': 'disabled || null',
                        '(blur)': '_resetTabIndex()',
                        '(focus)': '_setTabIndex()',
                        '(click)': 'trigger()',
                        '(keydown)': '_onKeydown($event)',
                    },
                }]
        }], ctorParameters: () => [], propDecorators: { disabled: [{
                type: Input,
                args: [{ alias: 'cdkMenuItemDisabled', transform: booleanAttribute }]
            }], typeaheadLabel: [{
                type: Input,
                args: ['cdkMenuitemTypeaheadLabel']
            }], triggered: [{
                type: Output,
                args: ['cdkMenuItemTriggered']
            }] } });

/**
 * PointerFocusTracker keeps track of the currently active item under mouse focus. It also has
 * observables which emit when the users mouse enters and leaves a tracked element.
 */
class PointerFocusTracker {
    constructor(
    /** The list of items being tracked. */
    _items) {
        this._items = _items;
        /** Emits when an element is moused into. */
        this.entered = this._getItemPointerEntries();
        /** Emits when an element is moused out. */
        this.exited = this._getItemPointerExits();
        /** Emits when this is destroyed. */
        this._destroyed = new Subject();
        this.entered.subscribe(element => (this.activeElement = element));
        this.exited.subscribe(() => {
            this.previousElement = this.activeElement;
            this.activeElement = undefined;
        });
    }
    /** Stop the managers listeners. */
    destroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Gets a stream of pointer (mouse) entries into the given items.
     * This should typically run outside the Angular zone.
     */
    _getItemPointerEntries() {
        return defer(() => this._items.changes.pipe(startWith(this._items), mergeMap((list) => list.map(element => fromEvent(element._elementRef.nativeElement, 'mouseenter').pipe(mapTo(element), takeUntil(this._items.changes)))), mergeAll()));
    }
    /**
     * Gets a stream of pointer (mouse) exits out of the given items.
     * This should typically run outside the Angular zone.
     */
    _getItemPointerExits() {
        return defer(() => this._items.changes.pipe(startWith(this._items), mergeMap((list) => list.map(element => fromEvent(element._elementRef.nativeElement, 'mouseout').pipe(mapTo(element), takeUntil(this._items.changes)))), mergeAll()));
    }
}

/** Counter used to create unique IDs for menus. */
let nextId$1 = 0;
/**
 * Abstract directive that implements shared logic common to all menus.
 * This class can be extended to create custom menu types.
 */
class CdkMenuBase extends CdkMenuGroup {
    constructor() {
        super(...arguments);
        /** The menu's native DOM host element. */
        this.nativeElement = inject(ElementRef).nativeElement;
        /** The Angular zone. */
        this.ngZone = inject(NgZone);
        /** The stack of menus this menu belongs to. */
        this.menuStack = inject(MENU_STACK);
        /** The menu aim service used by this menu. */
        this.menuAim = inject(MENU_AIM, { optional: true, self: true });
        /** The directionality (text direction) of the current page. */
        this.dir = inject(Directionality, { optional: true });
        /** The id of the menu's host element. */
        this.id = `cdk-menu-${nextId$1++}`;
        /** The direction items in the menu flow. */
        this.orientation = 'vertical';
        /**
         * Whether the menu is displayed inline (i.e. always present vs a conditional popup that the
         * user triggers with a trigger element).
         */
        this.isInline = false;
        /** Emits when the MenuBar is destroyed. */
        this.destroyed = new Subject();
        /** Whether this menu's menu stack has focus. */
        this._menuStackHasFocus = signal(false);
        this._tabIndexSignal = computed(() => {
            const tabindexIfInline = this._menuStackHasFocus() ? -1 : 0;
            return this.isInline ? tabindexIfInline : null;
        });
    }
    ngAfterContentInit() {
        if (!this.isInline) {
            this.menuStack.push(this);
        }
        this._setKeyManager();
        this._subscribeToMenuStackHasFocus();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStackClosed();
        this._setUpPointerTracker();
    }
    ngOnDestroy() {
        this.keyManager?.destroy();
        this.destroyed.next();
        this.destroyed.complete();
        this.pointerTracker?.destroy();
    }
    /**
     * Place focus on the first MenuItem in the menu and set the focus origin.
     * @param focusOrigin The origin input mode of the focus event.
     */
    focusFirstItem(focusOrigin = 'program') {
        this.keyManager.setFocusOrigin(focusOrigin);
        this.keyManager.setFirstItemActive();
    }
    /**
     * Place focus on the last MenuItem in the menu and set the focus origin.
     * @param focusOrigin The origin input mode of the focus event.
     */
    focusLastItem(focusOrigin = 'program') {
        this.keyManager.setFocusOrigin(focusOrigin);
        this.keyManager.setLastItemActive();
    }
    /** Gets the tabindex for this menu. */
    _getTabIndex() {
        return this._tabIndexSignal();
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param menu The menu requested to be closed.
     * @param options Options to configure the behavior on close.
     *   - `focusParentTrigger` Whether to focus the parent trigger after closing the menu.
     */
    closeOpenMenu(menu, options) {
        const { focusParentTrigger } = { ...options };
        const keyManager = this.keyManager;
        const trigger = this.triggerItem;
        if (menu === trigger?.getMenuTrigger()?.getMenu()) {
            trigger?.getMenuTrigger()?.close();
            // If the user has moused over a sibling item we want to focus the element under mouse focus
            // not the trigger which previously opened the now closed menu.
            if (focusParentTrigger) {
                if (trigger) {
                    keyManager.setActiveItem(trigger);
                }
                else {
                    keyManager.setFirstItemActive();
                }
            }
        }
    }
    /** Setup the FocusKeyManager with the correct orientation for the menu. */
    _setKeyManager() {
        this.keyManager = new FocusKeyManager(this.items).withWrap().withTypeAhead().withHomeAndEnd();
        if (this.orientation === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
        }
        else {
            this.keyManager.withVerticalOrientation();
        }
    }
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    _subscribeToMenuOpen() {
        const exitCondition = merge(this.items.changes, this.destroyed);
        this.items.changes
            .pipe(startWith(this.items), mergeMap((list) => list
            .filter(item => item.hasMenu)
            .map(item => item.getMenuTrigger().opened.pipe(mapTo(item), takeUntil(exitCondition)))), mergeAll(), switchMap((item) => {
            this.triggerItem = item;
            return item.getMenuTrigger().closed;
        }), takeUntil(this.destroyed))
            .subscribe(() => (this.triggerItem = undefined));
    }
    /** Subscribe to the MenuStack close events. */
    _subscribeToMenuStackClosed() {
        this.menuStack.closed
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ item, focusParentTrigger }) => this.closeOpenMenu(item, { focusParentTrigger }));
    }
    /** Subscribe to the MenuStack hasFocus events. */
    _subscribeToMenuStackHasFocus() {
        if (this.isInline) {
            this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
                this._menuStackHasFocus.set(hasFocus);
            });
        }
    }
    /**
     * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    _setUpPointerTracker() {
        if (this.menuAim) {
            this.ngZone.runOutsideAngular(() => {
                this.pointerTracker = new PointerFocusTracker(this.items);
            });
            this.menuAim.initialize(this, this.pointerTracker);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuBase, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuBase, isStandalone: true, inputs: { id: "id" }, host: { attributes: { "role": "menu" }, listeners: { "focus": "focusFirstItem()", "focusin": "menuStack.setHasFocus(true)", "focusout": "menuStack.setHasFocus(false)" }, properties: { "tabindex": "_getTabIndex()", "id": "id", "attr.aria-orientation": "orientation", "attr.data-cdk-menu-stack-id": "menuStack.id" } }, queries: [{ propertyName: "items", predicate: CdkMenuItem, descendants: true }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        'role': 'menu',
                        'class': '', // reset the css class added by the super-class
                        '[tabindex]': '_getTabIndex()',
                        '[id]': 'id',
                        '[attr.aria-orientation]': 'orientation',
                        '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
                        '(focus)': 'focusFirstItem()',
                        '(focusin)': 'menuStack.setHasFocus(true)',
                        '(focusout)': 'menuStack.setHasFocus(false)',
                    },
                    standalone: true,
                }]
        }], propDecorators: { id: [{
                type: Input
            }], items: [{
                type: ContentChildren,
                args: [CdkMenuItem, { descendants: true }]
            }] } });

/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
class CdkMenu extends CdkMenuBase {
    constructor() {
        super();
        this._parentTrigger = inject(MENU_TRIGGER, { optional: true });
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
        /** The direction items in the menu flow. */
        this.orientation = 'vertical';
        /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
        this.isInline = !this._parentTrigger;
        this.destroyed.subscribe(this.closed);
        this._parentTrigger?.registerChildMenu(this);
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.closed.complete();
    }
    /**
     * Handle keyboard events for the Menu.
     * @param event The keyboard event to be handled.
     */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this.menuStack.close(this, {
                        focusNextOnEmpty: FocusNext.currentItem,
                        focusParentTrigger: true,
                    });
                }
                break;
            case TAB:
                if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
                    this.menuStack.closeAll({ focusParentTrigger: true });
                }
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /**
     * Set focus the either the current, previous or next item based on the FocusNext event.
     * @param focusNext The element to focus.
     */
    _toggleMenuFocus(focusNext) {
        const keyManager = this.keyManager;
        switch (focusNext) {
            case FocusNext.nextItem:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                break;
            case FocusNext.previousItem:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                break;
            case FocusNext.currentItem:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    /** Subscribe to the MenuStack emptied events. */
    _subscribeToMenuStackEmptied() {
        this.menuStack.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleMenuFocus(event));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenu, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenu, isStandalone: true, selector: "[cdkMenu]", outputs: { closed: "closed" }, host: { attributes: { "role": "menu" }, listeners: { "keydown": "_handleKeyEvent($event)" }, properties: { "class.cdk-menu-inline": "isInline" }, classAttribute: "cdk-menu" }, providers: [
            { provide: CdkMenuGroup, useExisting: CdkMenu },
            { provide: CDK_MENU, useExisting: CdkMenu },
            PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
        ], exportAs: ["cdkMenu"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenu, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenu]',
                    exportAs: 'cdkMenu',
                    standalone: true,
                    host: {
                        'role': 'menu',
                        'class': 'cdk-menu',
                        '[class.cdk-menu-inline]': 'isInline',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenu },
                        { provide: CDK_MENU, useExisting: CdkMenu },
                        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
                    ],
                }]
        }], ctorParameters: () => [], propDecorators: { closed: [{
                type: Output
            }] } });

/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
class CdkMenuBar extends CdkMenuBase {
    constructor() {
        super(...arguments);
        /** The direction items in the menu flow. */
        this.orientation = 'horizontal';
        /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
        this.isInline = true;
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
    }
    /**
     * Handle keyboard events for the Menu.
     * @param event The keyboard event to be handled.
     */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case UP_ARROW:
            case DOWN_ARROW:
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    const horizontalArrows = event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW;
                    // For a horizontal menu if the left/right keys were clicked, or a vertical menu if the
                    // up/down keys were clicked: if the current menu is open, close it then focus and open the
                    // next  menu.
                    if (horizontalArrows) {
                        event.preventDefault();
                        const prevIsOpen = keyManager.activeItem?.isMenuOpen();
                        keyManager.activeItem?.getMenuTrigger()?.close();
                        keyManager.setFocusOrigin('keyboard');
                        keyManager.onKeydown(event);
                        if (prevIsOpen) {
                            keyManager.activeItem?.getMenuTrigger()?.open();
                        }
                    }
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    keyManager.activeItem?.getMenuTrigger()?.close();
                }
                break;
            case TAB:
                if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
                    keyManager.activeItem?.getMenuTrigger()?.close();
                }
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /**
     * Set focus to either the current, previous or next item based on the FocusNext event, then
     * open the previous or next item.
     * @param focusNext The element to focus.
     */
    _toggleOpenMenu(focusNext) {
        const keyManager = this.keyManager;
        switch (focusNext) {
            case FocusNext.nextItem:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                keyManager.activeItem?.getMenuTrigger()?.open();
                break;
            case FocusNext.previousItem:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                keyManager.activeItem?.getMenuTrigger()?.open();
                break;
            case FocusNext.currentItem:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    /** Subscribe to the MenuStack emptied events. */
    _subscribeToMenuStackEmptied() {
        this.menuStack?.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleOpenMenu(event));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuBar, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuBar, isStandalone: true, selector: "[cdkMenuBar]", host: { attributes: { "role": "menubar" }, listeners: { "keydown": "_handleKeyEvent($event)" }, classAttribute: "cdk-menu-bar" }, providers: [
            { provide: CdkMenuGroup, useExisting: CdkMenuBar },
            { provide: CDK_MENU, useExisting: CdkMenuBar },
            { provide: MENU_STACK, useFactory: () => MenuStack.inline('horizontal') },
        ], exportAs: ["cdkMenuBar"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuBar, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuBar]',
                    exportAs: 'cdkMenuBar',
                    standalone: true,
                    host: {
                        'role': 'menubar',
                        'class': 'cdk-menu-bar',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenuBar },
                        { provide: CDK_MENU, useExisting: CdkMenuBar },
                        { provide: MENU_STACK, useFactory: () => MenuStack.inline('horizontal') },
                    ],
                }]
        }] });

/** Base class providing checked state for selectable MenuItems. */
class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        /** Whether the element is checked */
        this.checked = false;
        /** Whether the item should close the menu if triggered by the spacebar. */
        this.closeOnSpacebarTrigger = false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkMenuItemSelectable, isStandalone: true, inputs: { checked: ["cdkMenuItemChecked", "checked", booleanAttribute] }, host: { properties: { "attr.aria-checked": "!!checked", "attr.aria-disabled": "disabled || null" } }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-checked]': '!!checked',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                    standalone: true,
                }]
        }], propDecorators: { checked: [{
                type: Input,
                args: [{ alias: 'cdkMenuItemChecked', transform: booleanAttribute }]
            }] } });

/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor() {
        super();
        /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
        this._selectionDispatcher = inject(UniqueSelectionDispatcher);
        /** An ID to identify this radio item to the `UniqueSelectionDispatcher`. */
        this._id = `${nextId++}`;
        this._registerDispatcherListener();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removeDispatcherListener();
    }
    /**
     * Toggles the checked state of the radio-button.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this._selectionDispatcher.notify(this._id, '');
        }
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id) => {
            this.checked = this._id === id;
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemRadio, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuItemRadio, isStandalone: true, selector: "[cdkMenuItemRadio]", host: { attributes: { "role": "menuitemradio" }, properties: { "class.cdk-menu-item-radio": "true" } }, providers: [
            { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
            { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
        ], exportAs: ["cdkMenuItemRadio"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemRadio, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemRadio]',
                    exportAs: 'cdkMenuItemRadio',
                    standalone: true,
                    host: {
                        'role': 'menuitemradio',
                        '[class.cdk-menu-item-radio]': 'true',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }], ctorParameters: () => [] });

/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
    /**
     * Toggle the checked state of the checkbox.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this.checked = !this.checked;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemCheckbox, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuItemCheckbox, isStandalone: true, selector: "[cdkMenuItemCheckbox]", host: { attributes: { "role": "menuitemcheckbox" }, properties: { "class.cdk-menu-item-checkbox": "true" } }, providers: [
            { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
            { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
        ], exportAs: ["cdkMenuItemCheckbox"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemCheckbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemCheckbox]',
                    exportAs: 'cdkMenuItemCheckbox',
                    standalone: true,
                    host: {
                        'role': 'menuitemcheckbox',
                        '[class.cdk-menu-item-checkbox]': 'true',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }] });

/** The preferred menu positions for the context menu. */
const CONTEXT_MENU_POSITIONS = STANDARD_DROPDOWN_BELOW_POSITIONS.map(position => {
    // In cases where the first menu item in the context menu is a trigger the submenu opens on a
    // hover event. We offset the context menu 2px by default to prevent this from occurring.
    const offsetX = position.overlayX === 'start' ? 2 : -2;
    const offsetY = position.overlayY === 'top' ? 2 : -2;
    return { ...position, offsetX, offsetY };
});
/** Tracks the last open context menu trigger across the entire application. */
class ContextMenuTracker {
    /**
     * Close the previous open context menu and set the given one as being open.
     * @param trigger The trigger for the currently open Context Menu.
     */
    update(trigger) {
        if (ContextMenuTracker._openContextMenuTrigger !== trigger) {
            ContextMenuTracker._openContextMenuTrigger?.close();
            ContextMenuTracker._openContextMenuTrigger = trigger;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ContextMenuTracker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ContextMenuTracker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ContextMenuTracker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * A directive that opens a menu when a user right-clicks within its host element.
 * It is aware of nested context menus and will trigger only the lowest level non-disabled context menu.
 */
class CdkContextMenuTrigger extends CdkMenuTriggerBase {
    constructor() {
        super();
        /** The CDK overlay service. */
        this._overlay = inject(Overlay);
        /** The directionality of the page. */
        this._directionality = inject(Directionality, { optional: true });
        /** The app's context menu tracking registry */
        this._contextMenuTracker = inject(ContextMenuTracker);
        this._changeDetectorRef = inject(ChangeDetectorRef);
        /** Whether the context menu is disabled. */
        this.disabled = false;
        this._setMenuStackCloseListener();
    }
    /**
     * Open the attached menu at the specified location.
     * @param coordinates where to open the context menu
     */
    open(coordinates) {
        this._open(null, coordinates);
        this._changeDetectorRef.markForCheck();
    }
    /** Close the currently opened context menu. */
    close() {
        this.menuStack.closeAll();
    }
    /**
     * Open the context menu and closes any previously open menus.
     * @param event the mouse event which opens the context menu.
     */
    _openOnContextMenu(event) {
        if (!this.disabled) {
            // Prevent the native context menu from opening because we're opening a custom one.
            event.preventDefault();
            // Stop event propagation to ensure that only the closest enabled context menu opens.
            // Otherwise, any context menus attached to containing elements would *also* open,
            // resulting in multiple stacked context menus being displayed.
            event.stopPropagation();
            this._contextMenuTracker.update(this);
            this._open(event, { x: event.clientX, y: event.clientY });
            // A context menu can be triggered via a mouse right click or a keyboard shortcut.
            if (event.button === 2) {
                this.childMenu?.focusFirstItem('mouse');
            }
            else if (event.button === 0) {
                this.childMenu?.focusFirstItem('keyboard');
            }
            else {
                this.childMenu?.focusFirstItem('program');
            }
        }
    }
    /**
     * Get the configuration object used to create the overlay.
     * @param coordinates the location to place the opened menu
     */
    _getOverlayConfig(coordinates) {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(coordinates),
            scrollStrategy: this.menuScrollStrategy(),
            direction: this._directionality || undefined,
        });
    }
    /**
     * Get the position strategy for the overlay which specifies where to place the menu.
     * @param coordinates the location to place the opened menu
     */
    _getOverlayPositionStrategy(coordinates) {
        return this._overlay
            .position()
            .flexibleConnectedTo(coordinates)
            .withLockedPosition()
            .withGrowAfterOpen()
            .withPositions(this.menuPosition ?? CONTEXT_MENU_POSITIONS);
    }
    /** Subscribe to the menu stack close events and close this menu when requested. */
    _setMenuStackCloseListener() {
        this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({ item }) => {
            if (item === this.childMenu && this.isOpen()) {
                this.closed.next();
                this.overlayRef.detach();
            }
        });
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     * @param userEvent User-generated event that opened the menu.
     */
    _subscribeToOutsideClicks(userEvent) {
        if (this.overlayRef) {
            let outsideClicks = this.overlayRef.outsidePointerEvents();
            if (userEvent) {
                const [auxClicks, nonAuxClicks] = partition(outsideClicks, ({ type }) => type === 'auxclick');
                outsideClicks = merge(
                // Using a mouse, the `contextmenu` event can fire either when pressing the right button
                // or left button + control. Most browsers won't dispatch a `click` event right after
                // a `contextmenu` event triggered by left button + control, but Safari will (see #27832).
                // This closes the menu immediately. To work around it, we check that both the triggering
                // event and the current outside click event both had the control key pressed, and that
                // that this is the first outside click event.
                nonAuxClicks.pipe(skipWhile((event, index) => userEvent.ctrlKey && index === 0 && event.ctrlKey)), 
                // If the menu was triggered by the `contextmenu` event, skip the first `auxclick` event
                // because it fires when the mouse is released on the same click that opened the menu.
                auxClicks.pipe(skip(1)));
            }
            outsideClicks.pipe(takeUntil(this.stopOutsideClicksListener)).subscribe(event => {
                if (!this.isElementInsideMenuStack(_getEventTarget(event))) {
                    this.menuStack.closeAll();
                }
            });
        }
    }
    /**
     * Open the attached menu at the specified location.
     * @param userEvent User-generated event that opened the menu
     * @param coordinates where to open the context menu
     */
    _open(userEvent, coordinates) {
        if (this.disabled) {
            return;
        }
        if (this.isOpen()) {
            // since we're moving this menu we need to close any submenus first otherwise they end up
            // disconnected from this one.
            this.menuStack.closeSubMenuOf(this.childMenu);
            this.overlayRef.getConfig().positionStrategy.setOrigin(coordinates);
            this.overlayRef.updatePosition();
        }
        else {
            this.opened.next();
            if (this.overlayRef) {
                this.overlayRef.getConfig().positionStrategy.setOrigin(coordinates);
                this.overlayRef.updatePosition();
            }
            else {
                this.overlayRef = this._overlay.create(this._getOverlayConfig(coordinates));
            }
            this.overlayRef.attach(this.getMenuContentPortal());
            this._subscribeToOutsideClicks(userEvent);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkContextMenuTrigger, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkContextMenuTrigger, isStandalone: true, selector: "[cdkContextMenuTriggerFor]", inputs: { menuTemplateRef: ["cdkContextMenuTriggerFor", "menuTemplateRef"], menuPosition: ["cdkContextMenuPosition", "menuPosition"], menuData: ["cdkContextMenuTriggerData", "menuData"], disabled: ["cdkContextMenuDisabled", "disabled", booleanAttribute] }, outputs: { opened: "cdkContextMenuOpened", closed: "cdkContextMenuClosed" }, host: { listeners: { "contextmenu": "_openOnContextMenu($event)" }, properties: { "attr.data-cdk-menu-stack-id": "null" } }, providers: [
            { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
            { provide: MENU_STACK, useClass: MenuStack },
        ], exportAs: ["cdkContextMenuTriggerFor"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkContextMenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkContextMenuTriggerFor]',
                    exportAs: 'cdkContextMenuTriggerFor',
                    standalone: true,
                    host: {
                        '[attr.data-cdk-menu-stack-id]': 'null',
                        '(contextmenu)': '_openOnContextMenu($event)',
                    },
                    inputs: [
                        { name: 'menuTemplateRef', alias: 'cdkContextMenuTriggerFor' },
                        { name: 'menuPosition', alias: 'cdkContextMenuPosition' },
                        { name: 'menuData', alias: 'cdkContextMenuTriggerData' },
                    ],
                    outputs: ['opened: cdkContextMenuOpened', 'closed: cdkContextMenuClosed'],
                    providers: [
                        { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
                        { provide: MENU_STACK, useClass: MenuStack },
                    ],
                }]
        }], ctorParameters: () => [], propDecorators: { disabled: [{
                type: Input,
                args: [{ alias: 'cdkContextMenuDisabled', transform: booleanAttribute }]
            }] } });

const MENU_DIRECTIVES = [
    CdkMenuBar,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemRadio,
    CdkMenuItemCheckbox,
    CdkMenuTrigger,
    CdkMenuGroup,
    CdkContextMenuTrigger,
    CdkTargetMenuAim,
];
/** Module that declares components and directives for the CDK menu. */
class CdkMenuModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, imports: [OverlayModule, CdkMenuBar,
            CdkMenu,
            CdkMenuItem,
            CdkMenuItemRadio,
            CdkMenuItemCheckbox,
            CdkMenuTrigger,
            CdkMenuGroup,
            CdkContextMenuTrigger,
            CdkTargetMenuAim], exports: [CdkMenuBar,
            CdkMenu,
            CdkMenuItem,
            CdkMenuItemRadio,
            CdkMenuItemCheckbox,
            CdkMenuTrigger,
            CdkMenuGroup,
            CdkContextMenuTrigger,
            CdkTargetMenuAim] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, imports: [OverlayModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, ...MENU_DIRECTIVES],
                    exports: MENU_DIRECTIVES,
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CDK_MENU, CdkContextMenuTrigger, CdkMenu, CdkMenuBar, CdkMenuBase, CdkMenuGroup, CdkMenuItem, CdkMenuItemCheckbox, CdkMenuItemRadio, CdkMenuItemSelectable, CdkMenuModule, CdkMenuTrigger, CdkMenuTriggerBase, CdkTargetMenuAim, ContextMenuTracker, FocusNext, MENU_AIM, MENU_SCROLL_STRATEGY, MENU_STACK, MENU_TRIGGER, MenuStack, PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER, PARENT_OR_NEW_MENU_STACK_PROVIDER, PointerFocusTracker, TargetMenuAim };
//# sourceMappingURL=menu.mjs.map
