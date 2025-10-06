/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, Inject, InjectionToken, Input, NgZone, Output, TemplateRef, QueryList, ViewChild, ViewEncapsulation, ChangeDetectorRef, booleanAttribute, afterNextRender, inject, Injector, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { ESCAPE, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, UP_ARROW, hasModifierKey, } from '@angular/cdk/keycodes';
import { merge, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { MatMenuItem } from './menu-item';
import { MAT_MENU_PANEL } from './menu-panel';
import { throwMatMenuInvalidPositionX, throwMatMenuInvalidPositionY } from './menu-errors';
import { MatMenuContent, MAT_MENU_CONTENT } from './menu-content';
import { matMenuAnimations } from './menu-animations';
import * as i0 from "@angular/core";
let menuPanelUid = 0;
/** Injection token to be used to override the default options for `mat-menu`. */
export const MAT_MENU_DEFAULT_OPTIONS = new InjectionToken('mat-menu-default-options', {
    providedIn: 'root',
    factory: MAT_MENU_DEFAULT_OPTIONS_FACTORY,
});
/** @docs-private */
export function MAT_MENU_DEFAULT_OPTIONS_FACTORY() {
    return {
        overlapTrigger: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop',
    };
}
export class MatMenu {
    /** Position of the menu in the X axis. */
    get xPosition() {
        return this._xPosition;
    }
    set xPosition(value) {
        if (value !== 'before' &&
            value !== 'after' &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throwMatMenuInvalidPositionX();
        }
        this._xPosition = value;
        this.setPositionClasses();
    }
    /** Position of the menu in the Y axis. */
    get yPosition() {
        return this._yPosition;
    }
    set yPosition(value) {
        if (value !== 'above' && value !== 'below' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throwMatMenuInvalidPositionY();
        }
        this._yPosition = value;
        this.setPositionClasses();
    }
    /**
     * This method takes classes set on the host mat-menu element and applies them on the
     * menu template that displays in the overlay container.  Otherwise, it's difficult
     * to style the containing menu from outside the component.
     * @param classes list of class names
     */
    set panelClass(classes) {
        const previousPanelClass = this._previousPanelClass;
        const newClassList = { ...this._classList };
        if (previousPanelClass && previousPanelClass.length) {
            previousPanelClass.split(' ').forEach((className) => {
                newClassList[className] = false;
            });
        }
        this._previousPanelClass = classes;
        if (classes && classes.length) {
            classes.split(' ').forEach((className) => {
                newClassList[className] = true;
            });
            this._elementRef.nativeElement.className = '';
        }
        this._classList = newClassList;
    }
    /**
     * This method takes classes set on the host mat-menu element and applies them on the
     * menu template that displays in the overlay container.  Otherwise, it's difficult
     * to style the containing menu from outside the component.
     * @deprecated Use `panelClass` instead.
     * @breaking-change 8.0.0
     */
    get classList() {
        return this.panelClass;
    }
    set classList(classes) {
        this.panelClass = classes;
    }
    constructor(_elementRef, 
    /**
     * @deprecated Unused param, will be removed.
     * @breaking-change 19.0.0
     */
    _unusedNgZone, defaultOptions, 
    // @breaking-change 15.0.0 `_changeDetectorRef` to become a required parameter.
    _changeDetectorRef) {
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._elevationPrefix = 'mat-elevation-z';
        this._baseElevation = null;
        /** Only the direct descendant menu items. */
        this._directDescendantItems = new QueryList();
        /** Classes to be applied to the menu panel. */
        this._classList = {};
        /** Current state of the panel animation. */
        this._panelAnimationState = 'void';
        /** Emits whenever an animation on the menu completes. */
        this._animationDone = new Subject();
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
        /**
         * Event emitted when the menu is closed.
         * @deprecated Switch to `closed` instead
         * @breaking-change 8.0.0
         */
        this.close = this.closed;
        this.panelId = `mat-menu-panel-${menuPanelUid++}`;
        this._injector = inject(Injector);
        this.overlayPanelClass = defaultOptions.overlayPanelClass || '';
        this._xPosition = defaultOptions.xPosition;
        this._yPosition = defaultOptions.yPosition;
        this.backdropClass = defaultOptions.backdropClass;
        this.overlapTrigger = defaultOptions.overlapTrigger;
        this.hasBackdrop = defaultOptions.hasBackdrop;
    }
    ngOnInit() {
        this.setPositionClasses();
    }
    ngAfterContentInit() {
        this._updateDirectDescendants();
        this._keyManager = new FocusKeyManager(this._directDescendantItems)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd();
        this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'));
        // If a user manually (programmatically) focuses a menu item, we need to reflect that focus
        // change back to the key manager. Note that we don't need to unsubscribe here because _focused
        // is internal and we know that it gets completed on destroy.
        this._directDescendantItems.changes
            .pipe(startWith(this._directDescendantItems), switchMap(items => merge(...items.map((item) => item._focused))))
            .subscribe(focusedItem => this._keyManager.updateActiveItem(focusedItem));
        this._directDescendantItems.changes.subscribe((itemsList) => {
            // Move focus to another item, if the active item is removed from the list.
            // We need to debounce the callback, because multiple items might be removed
            // in quick succession.
            const manager = this._keyManager;
            if (this._panelAnimationState === 'enter' && manager.activeItem?._hasFocus()) {
                const items = itemsList.toArray();
                const index = Math.max(0, Math.min(items.length - 1, manager.activeItemIndex || 0));
                if (items[index] && !items[index].disabled) {
                    manager.setActiveItem(index);
                }
                else {
                    manager.setNextItemActive();
                }
            }
        });
    }
    ngOnDestroy() {
        this._keyManager?.destroy();
        this._directDescendantItems.destroy();
        this.closed.complete();
        this._firstItemFocusRef?.destroy();
    }
    /** Stream that emits whenever the hovered menu item changes. */
    _hovered() {
        // Coerce the `changes` property because Angular types it as `Observable<any>`
        const itemChanges = this._directDescendantItems.changes;
        return itemChanges.pipe(startWith(this._directDescendantItems), switchMap(items => merge(...items.map((item) => item._hovered))));
    }
    /*
     * Registers a menu item with the menu.
     * @docs-private
     * @deprecated No longer being used. To be removed.
     * @breaking-change 9.0.0
     */
    addItem(_item) { }
    /**
     * Removes an item from the menu.
     * @docs-private
     * @deprecated No longer being used. To be removed.
     * @breaking-change 9.0.0
     */
    removeItem(_item) { }
    /** Handle a keyboard event from the menu, delegating to the appropriate action. */
    _handleKeydown(event) {
        const keyCode = event.keyCode;
        const manager = this._keyManager;
        switch (keyCode) {
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this.closed.emit('keydown');
                }
                break;
            case LEFT_ARROW:
                if (this.parentMenu && this.direction === 'ltr') {
                    this.closed.emit('keydown');
                }
                break;
            case RIGHT_ARROW:
                if (this.parentMenu && this.direction === 'rtl') {
                    this.closed.emit('keydown');
                }
                break;
            default:
                if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
                    manager.setFocusOrigin('keyboard');
                }
                manager.onKeydown(event);
                return;
        }
        // Don't allow the event to propagate if we've already handled it, or it may
        // end up reaching other overlays that were opened earlier (see #22694).
        event.stopPropagation();
    }
    /**
     * Focus the first item in the menu.
     * @param origin Action from which the focus originated. Used to set the correct styling.
     */
    focusFirstItem(origin = 'program') {
        // Wait for `afterNextRender` to ensure iOS VoiceOver screen reader focuses the first item (#24735).
        this._firstItemFocusRef?.destroy();
        this._firstItemFocusRef = afterNextRender(() => {
            let menuPanel = null;
            if (this._directDescendantItems.length) {
                // Because the `mat-menuPanel` is at the DOM insertion point, not inside the overlay, we don't
                // have a nice way of getting a hold of the menuPanel panel. We can't use a `ViewChild` either
                // because the panel is inside an `ng-template`. We work around it by starting from one of
                // the items and walking up the DOM.
                menuPanel = this._directDescendantItems.first._getHostElement().closest('[role="menu"]');
            }
            // If an item in the menuPanel is already focused, avoid overriding the focus.
            if (!menuPanel || !menuPanel.contains(document.activeElement)) {
                const manager = this._keyManager;
                manager.setFocusOrigin(origin).setFirstItemActive();
                // If there's no active item at this point, it means that all the items are disabled.
                // Move focus to the menuPanel panel so keyboard events like Escape still work. Also this will
                // give _some_ feedback to screen readers.
                if (!manager.activeItem && menuPanel) {
                    menuPanel.focus();
                }
            }
        }, { injector: this._injector });
    }
    /**
     * Resets the active item in the menu. This is used when the menu is opened, allowing
     * the user to start from the first option when pressing the down arrow.
     */
    resetActiveItem() {
        this._keyManager.setActiveItem(-1);
    }
    /**
     * Sets the menu panel elevation.
     * @param depth Number of parent menus that come before the menu.
     */
    setElevation(depth) {
        // The base elevation depends on which version of the spec
        // we're running so we have to resolve it at runtime.
        if (this._baseElevation === null) {
            const styles = typeof getComputedStyle === 'function'
                ? getComputedStyle(this._elementRef.nativeElement)
                : null;
            const value = styles?.getPropertyValue('--mat-menu-base-elevation-level') || '8';
            this._baseElevation = parseInt(value);
        }
        // The elevation starts at the base and increases by one for each level.
        // Capped at 24 because that's the maximum elevation defined in the Material design spec.
        const elevation = Math.min(this._baseElevation + depth, 24);
        const newElevation = `${this._elevationPrefix}${elevation}`;
        const customElevation = Object.keys(this._classList).find(className => {
            return className.startsWith(this._elevationPrefix);
        });
        if (!customElevation || customElevation === this._previousElevation) {
            const newClassList = { ...this._classList };
            if (this._previousElevation) {
                newClassList[this._previousElevation] = false;
            }
            newClassList[newElevation] = true;
            this._previousElevation = newElevation;
            this._classList = newClassList;
        }
    }
    /**
     * Adds classes to the menu panel based on its position. Can be used by
     * consumers to add specific styling based on the position.
     * @param posX Position of the menu along the x axis.
     * @param posY Position of the menu along the y axis.
     * @docs-private
     */
    setPositionClasses(posX = this.xPosition, posY = this.yPosition) {
        this._classList = {
            ...this._classList,
            ['mat-menu-before']: posX === 'before',
            ['mat-menu-after']: posX === 'after',
            ['mat-menu-above']: posY === 'above',
            ['mat-menu-below']: posY === 'below',
        };
        // @breaking-change 15.0.0 Remove null check for `_changeDetectorRef`.
        this._changeDetectorRef?.markForCheck();
    }
    /** Starts the enter animation. */
    _startAnimation() {
        // @breaking-change 8.0.0 Combine with _resetAnimation.
        this._panelAnimationState = 'enter';
    }
    /** Resets the panel animation to its initial state. */
    _resetAnimation() {
        // @breaking-change 8.0.0 Combine with _startAnimation.
        this._panelAnimationState = 'void';
    }
    /** Callback that is invoked when the panel animation completes. */
    _onAnimationDone(event) {
        this._animationDone.next(event);
        this._isAnimating = false;
    }
    _onAnimationStart(event) {
        this._isAnimating = true;
        // Scroll the content element to the top as soon as the animation starts. This is necessary,
        // because we move focus to the first item while it's still being animated, which can throw
        // the browser off when it determines the scroll position. Alternatively we can move focus
        // when the animation is done, however moving focus asynchronously will interrupt screen
        // readers which are in the process of reading out the menu already. We take the `element`
        // from the `event` since we can't use a `ViewChild` to access the pane.
        if (event.toState === 'enter' && this._keyManager.activeItemIndex === 0) {
            event.element.scrollTop = 0;
        }
    }
    /**
     * Sets up a stream that will keep track of any newly-added menu items and will update the list
     * of direct descendants. We collect the descendants this way, because `_allItems` can include
     * items that are part of child menus, and using a custom way of registering items is unreliable
     * when it comes to maintaining the item order.
     */
    _updateDirectDescendants() {
        this._allItems.changes
            .pipe(startWith(this._allItems))
            .subscribe((items) => {
            this._directDescendantItems.reset(items.filter(item => item._parentMenu === this));
            this._directDescendantItems.notifyOnChanges();
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatMenu, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MAT_MENU_DEFAULT_OPTIONS }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatMenu, isStandalone: true, selector: "mat-menu", inputs: { backdropClass: "backdropClass", ariaLabel: ["aria-label", "ariaLabel"], ariaLabelledby: ["aria-labelledby", "ariaLabelledby"], ariaDescribedby: ["aria-describedby", "ariaDescribedby"], xPosition: "xPosition", yPosition: "yPosition", overlapTrigger: ["overlapTrigger", "overlapTrigger", booleanAttribute], hasBackdrop: ["hasBackdrop", "hasBackdrop", (value) => (value == null ? null : booleanAttribute(value))], panelClass: ["class", "panelClass"], classList: "classList" }, outputs: { closed: "closed", close: "close" }, host: { properties: { "attr.aria-label": "null", "attr.aria-labelledby": "null", "attr.aria-describedby": "null" } }, providers: [{ provide: MAT_MENU_PANEL, useExisting: MatMenu }], queries: [{ propertyName: "lazyContent", first: true, predicate: MAT_MENU_CONTENT, descendants: true }, { propertyName: "_allItems", predicate: MatMenuItem, descendants: true }, { propertyName: "items", predicate: MatMenuItem }], viewQueries: [{ propertyName: "templateRef", first: true, predicate: TemplateRef, descendants: true }], exportAs: ["matMenu"], ngImport: i0, template: "<ng-template>\n  <div\n    class=\"mat-mdc-menu-panel mat-mdc-elevation-specific\"\n    [id]=\"panelId\"\n    [class]=\"_classList\"\n    (keydown)=\"_handleKeydown($event)\"\n    (click)=\"closed.emit('click')\"\n    [@transformMenu]=\"_panelAnimationState\"\n    (@transformMenu.start)=\"_onAnimationStart($event)\"\n    (@transformMenu.done)=\"_onAnimationDone($event)\"\n    tabindex=\"-1\"\n    role=\"menu\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"ariaLabelledby || null\"\n    [attr.aria-describedby]=\"ariaDescribedby || null\">\n    <div class=\"mat-mdc-menu-content\">\n      <ng-content></ng-content>\n    </div>\n  </div>\n</ng-template>\n", styles: ["mat-menu{display:none}.mat-mdc-menu-content{margin:0;padding:8px 0;outline:0}.mat-mdc-menu-content,.mat-mdc-menu-content .mat-mdc-menu-item .mat-mdc-menu-item-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;flex:1;white-space:normal;font-family:var(--mat-menu-item-label-text-font, var(--mat-app-label-large-font));line-height:var(--mat-menu-item-label-text-line-height, var(--mat-app-label-large-line-height));font-size:var(--mat-menu-item-label-text-size, var(--mat-app-label-large-size));letter-spacing:var(--mat-menu-item-label-text-tracking, var(--mat-app-label-large-tracking));font-weight:var(--mat-menu-item-label-text-weight, var(--mat-app-label-large-weight))}.mat-mdc-menu-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;outline:0;border-radius:var(--mat-menu-container-shape, var(--mat-app-corner-extra-small));background-color:var(--mat-menu-container-color, var(--mat-app-surface-container));will-change:transform,opacity}.mat-mdc-menu-panel.ng-animating{pointer-events:none}.mat-mdc-menu-panel.ng-animating:has(.mat-mdc-menu-content:empty){display:none}.cdk-high-contrast-active .mat-mdc-menu-panel{outline:solid 1px}.mat-mdc-menu-panel .mat-divider{color:var(--mat-menu-divider-color, var(--mat-app-surface-variant));margin-bottom:var(--mat-menu-divider-bottom-spacing);margin-top:var(--mat-menu-divider-top-spacing)}.mat-mdc-menu-item{display:flex;position:relative;align-items:center;justify-content:flex-start;overflow:hidden;padding:0;padding-left:var(--mat-menu-item-leading-spacing);padding-right:var(--mat-menu-item-trailing-spacing);-webkit-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:rgba(0,0,0,0);cursor:pointer;width:100%;text-align:left;box-sizing:border-box;color:inherit;font-size:inherit;background:none;text-decoration:none;margin:0;min-height:48px}[dir=rtl] .mat-mdc-menu-item{padding-right:var(--mat-menu-item-leading-spacing);padding-left:var(--mat-menu-item-trailing-spacing)}.mat-mdc-menu-item:has(.material-icons,mat-icon,[matButtonIcon]){padding-left:var(--mat-menu-item-with-icon-leading-spacing);padding-right:var(--mat-menu-item-with-icon-trailing-spacing)}[dir=rtl] .mat-mdc-menu-item:has(.material-icons,mat-icon,[matButtonIcon]){padding-right:var(--mat-menu-item-with-icon-leading-spacing);padding-left:var(--mat-menu-item-with-icon-trailing-spacing)}.mat-mdc-menu-item::-moz-focus-inner{border:0}.mat-mdc-menu-item,.mat-mdc-menu-item:visited,.mat-mdc-menu-item:link{color:var(--mat-menu-item-label-text-color, var(--mat-app-on-surface))}.mat-mdc-menu-item .mat-icon-no-color,.mat-mdc-menu-item .mat-mdc-menu-submenu-icon{color:var(--mat-menu-item-icon-color, var(--mat-app-on-surface-variant))}.mat-mdc-menu-item[disabled]{cursor:default;opacity:.38}.mat-mdc-menu-item[disabled]::after{display:block;position:absolute;content:\"\";top:0;left:0;bottom:0;right:0}.mat-mdc-menu-item:focus{outline:0}.mat-mdc-menu-item .mat-icon{flex-shrink:0;margin-right:var(--mat-menu-item-spacing);height:var(--mat-menu-item-icon-size);width:var(--mat-menu-item-icon-size)}[dir=rtl] .mat-mdc-menu-item{text-align:right}[dir=rtl] .mat-mdc-menu-item .mat-icon{margin-right:0;margin-left:var(--mat-menu-item-spacing)}.mat-mdc-menu-item:not([disabled]):hover{background-color:var(--mat-menu-item-hover-state-layer-color)}.mat-mdc-menu-item:not([disabled]).cdk-program-focused,.mat-mdc-menu-item:not([disabled]).cdk-keyboard-focused,.mat-mdc-menu-item:not([disabled]).mat-mdc-menu-item-highlighted{background-color:var(--mat-menu-item-focus-state-layer-color)}.cdk-high-contrast-active .mat-mdc-menu-item{margin-top:1px}.mat-mdc-menu-submenu-icon{width:var(--mat-menu-item-icon-size);height:10px;fill:currentColor;padding-left:var(--mat-menu-item-spacing)}[dir=rtl] .mat-mdc-menu-submenu-icon{padding-right:var(--mat-menu-item-spacing);padding-left:0}[dir=rtl] .mat-mdc-menu-submenu-icon polygon{transform:scaleX(-1);transform-origin:center}.cdk-high-contrast-active .mat-mdc-menu-submenu-icon{fill:CanvasText}.mat-mdc-menu-item .mat-mdc-menu-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}"], animations: [matMenuAnimations.transformMenu, matMenuAnimations.fadeInItems], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatMenu, decorators: [{
            type: Component,
            args: [{ selector: 'mat-menu', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, exportAs: 'matMenu', host: {
                        '[attr.aria-label]': 'null',
                        '[attr.aria-labelledby]': 'null',
                        '[attr.aria-describedby]': 'null',
                    }, animations: [matMenuAnimations.transformMenu, matMenuAnimations.fadeInItems], providers: [{ provide: MAT_MENU_PANEL, useExisting: MatMenu }], standalone: true, template: "<ng-template>\n  <div\n    class=\"mat-mdc-menu-panel mat-mdc-elevation-specific\"\n    [id]=\"panelId\"\n    [class]=\"_classList\"\n    (keydown)=\"_handleKeydown($event)\"\n    (click)=\"closed.emit('click')\"\n    [@transformMenu]=\"_panelAnimationState\"\n    (@transformMenu.start)=\"_onAnimationStart($event)\"\n    (@transformMenu.done)=\"_onAnimationDone($event)\"\n    tabindex=\"-1\"\n    role=\"menu\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"ariaLabelledby || null\"\n    [attr.aria-describedby]=\"ariaDescribedby || null\">\n    <div class=\"mat-mdc-menu-content\">\n      <ng-content></ng-content>\n    </div>\n  </div>\n</ng-template>\n", styles: ["mat-menu{display:none}.mat-mdc-menu-content{margin:0;padding:8px 0;outline:0}.mat-mdc-menu-content,.mat-mdc-menu-content .mat-mdc-menu-item .mat-mdc-menu-item-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;flex:1;white-space:normal;font-family:var(--mat-menu-item-label-text-font, var(--mat-app-label-large-font));line-height:var(--mat-menu-item-label-text-line-height, var(--mat-app-label-large-line-height));font-size:var(--mat-menu-item-label-text-size, var(--mat-app-label-large-size));letter-spacing:var(--mat-menu-item-label-text-tracking, var(--mat-app-label-large-tracking));font-weight:var(--mat-menu-item-label-text-weight, var(--mat-app-label-large-weight))}.mat-mdc-menu-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;outline:0;border-radius:var(--mat-menu-container-shape, var(--mat-app-corner-extra-small));background-color:var(--mat-menu-container-color, var(--mat-app-surface-container));will-change:transform,opacity}.mat-mdc-menu-panel.ng-animating{pointer-events:none}.mat-mdc-menu-panel.ng-animating:has(.mat-mdc-menu-content:empty){display:none}.cdk-high-contrast-active .mat-mdc-menu-panel{outline:solid 1px}.mat-mdc-menu-panel .mat-divider{color:var(--mat-menu-divider-color, var(--mat-app-surface-variant));margin-bottom:var(--mat-menu-divider-bottom-spacing);margin-top:var(--mat-menu-divider-top-spacing)}.mat-mdc-menu-item{display:flex;position:relative;align-items:center;justify-content:flex-start;overflow:hidden;padding:0;padding-left:var(--mat-menu-item-leading-spacing);padding-right:var(--mat-menu-item-trailing-spacing);-webkit-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:rgba(0,0,0,0);cursor:pointer;width:100%;text-align:left;box-sizing:border-box;color:inherit;font-size:inherit;background:none;text-decoration:none;margin:0;min-height:48px}[dir=rtl] .mat-mdc-menu-item{padding-right:var(--mat-menu-item-leading-spacing);padding-left:var(--mat-menu-item-trailing-spacing)}.mat-mdc-menu-item:has(.material-icons,mat-icon,[matButtonIcon]){padding-left:var(--mat-menu-item-with-icon-leading-spacing);padding-right:var(--mat-menu-item-with-icon-trailing-spacing)}[dir=rtl] .mat-mdc-menu-item:has(.material-icons,mat-icon,[matButtonIcon]){padding-right:var(--mat-menu-item-with-icon-leading-spacing);padding-left:var(--mat-menu-item-with-icon-trailing-spacing)}.mat-mdc-menu-item::-moz-focus-inner{border:0}.mat-mdc-menu-item,.mat-mdc-menu-item:visited,.mat-mdc-menu-item:link{color:var(--mat-menu-item-label-text-color, var(--mat-app-on-surface))}.mat-mdc-menu-item .mat-icon-no-color,.mat-mdc-menu-item .mat-mdc-menu-submenu-icon{color:var(--mat-menu-item-icon-color, var(--mat-app-on-surface-variant))}.mat-mdc-menu-item[disabled]{cursor:default;opacity:.38}.mat-mdc-menu-item[disabled]::after{display:block;position:absolute;content:\"\";top:0;left:0;bottom:0;right:0}.mat-mdc-menu-item:focus{outline:0}.mat-mdc-menu-item .mat-icon{flex-shrink:0;margin-right:var(--mat-menu-item-spacing);height:var(--mat-menu-item-icon-size);width:var(--mat-menu-item-icon-size)}[dir=rtl] .mat-mdc-menu-item{text-align:right}[dir=rtl] .mat-mdc-menu-item .mat-icon{margin-right:0;margin-left:var(--mat-menu-item-spacing)}.mat-mdc-menu-item:not([disabled]):hover{background-color:var(--mat-menu-item-hover-state-layer-color)}.mat-mdc-menu-item:not([disabled]).cdk-program-focused,.mat-mdc-menu-item:not([disabled]).cdk-keyboard-focused,.mat-mdc-menu-item:not([disabled]).mat-mdc-menu-item-highlighted{background-color:var(--mat-menu-item-focus-state-layer-color)}.cdk-high-contrast-active .mat-mdc-menu-item{margin-top:1px}.mat-mdc-menu-submenu-icon{width:var(--mat-menu-item-icon-size);height:10px;fill:currentColor;padding-left:var(--mat-menu-item-spacing)}[dir=rtl] .mat-mdc-menu-submenu-icon{padding-right:var(--mat-menu-item-spacing);padding-left:0}[dir=rtl] .mat-mdc-menu-submenu-icon polygon{transform:scaleX(-1);transform-origin:center}.cdk-high-contrast-active .mat-mdc-menu-submenu-icon{fill:CanvasText}.mat-mdc-menu-item .mat-mdc-menu-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_MENU_DEFAULT_OPTIONS]
                }] }, { type: i0.ChangeDetectorRef }], propDecorators: { _allItems: [{
                type: ContentChildren,
                args: [MatMenuItem, { descendants: true }]
            }], backdropClass: [{
                type: Input
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], ariaLabelledby: [{
                type: Input,
                args: ['aria-labelledby']
            }], ariaDescribedby: [{
                type: Input,
                args: ['aria-describedby']
            }], xPosition: [{
                type: Input
            }], yPosition: [{
                type: Input
            }], templateRef: [{
                type: ViewChild,
                args: [TemplateRef]
            }], items: [{
                type: ContentChildren,
                args: [MatMenuItem, { descendants: false }]
            }], lazyContent: [{
                type: ContentChild,
                args: [MAT_MENU_CONTENT]
            }], overlapTrigger: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hasBackdrop: [{
                type: Input,
                args: [{ transform: (value) => (value == null ? null : booleanAttribute(value)) }]
            }], panelClass: [{
                type: Input,
                args: ['class']
            }], classList: [{
                type: Input
            }], closed: [{
                type: Output
            }], close: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9tZW51L21lbnUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvbWVudS9tZW51Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsWUFBWSxFQUNaLGVBQWUsRUFDZixVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFFTixNQUFNLEVBQ04sV0FBVyxFQUNYLFNBQVMsRUFDVCxTQUFTLEVBQ1QsaUJBQWlCLEVBRWpCLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsZUFBZSxFQUVmLE1BQU0sRUFDTixRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBRS9ELE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLFdBQVcsRUFDWCxVQUFVLEVBQ1YsUUFBUSxFQUNSLGNBQWMsR0FDZixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBQyxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQWUsY0FBYyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRTFELE9BQU8sRUFBQyw0QkFBNEIsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJB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Q0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUM7Z0JBVWhGLFVBQVU7c0JBRGIsS0FBSzt1QkFBQyxPQUFPO2dCQWlDVixTQUFTO3NCQURaLEtBQUs7Z0JBU2EsTUFBTTtzQkFBeEIsTUFBTTtnQkFPWSxLQUFLO3NCQUF2QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBUZW1wbGF0ZVJlZixcbiAgUXVlcnlMaXN0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBPbkluaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBhZnRlck5leHRSZW5kZXIsXG4gIEFmdGVyUmVuZGVyUmVmLFxuICBpbmplY3QsXG4gIEluamVjdG9yLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QW5pbWF0aW9uRXZlbnR9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXIsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgRVNDQVBFLFxuICBMRUZUX0FSUk9XLFxuICBSSUdIVF9BUlJPVyxcbiAgRE9XTl9BUlJPVyxcbiAgVVBfQVJST1csXG4gIGhhc01vZGlmaWVyS2V5LFxufSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHttZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aCwgc3dpdGNoTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge01hdE1lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge01hdE1lbnVQYW5lbCwgTUFUX01FTlVfUEFORUx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnVQb3NpdGlvblgsIE1lbnVQb3NpdGlvbll9IGZyb20gJy4vbWVudS1wb3NpdGlvbnMnO1xuaW1wb3J0IHt0aHJvd01hdE1lbnVJbnZhbGlkUG9zaXRpb25YLCB0aHJvd01hdE1lbnVJbnZhbGlkUG9zaXRpb25ZfSBmcm9tICcuL21lbnUtZXJyb3JzJztcbmltcG9ydCB7TWF0TWVudUNvbnRlbnQsIE1BVF9NRU5VX0NPTlRFTlR9IGZyb20gJy4vbWVudS1jb250ZW50JztcbmltcG9ydCB7bWF0TWVudUFuaW1hdGlvbnN9IGZyb20gJy4vbWVudS1hbmltYXRpb25zJztcblxubGV0IG1lbnVQYW5lbFVpZCA9IDA7XG5cbi8qKiBSZWFzb24gd2h5IHRoZSBtZW51IHdhcyBjbG9zZWQuICovXG5leHBvcnQgdHlwZSBNZW51Q2xvc2VSZWFzb24gPSB2b2lkIHwgJ2NsaWNrJyB8ICdrZXlkb3duJyB8ICd0YWInO1xuXG4vKiogRGVmYXVsdCBgbWF0LW1lbnVgIG9wdGlvbnMgdGhhdCBjYW4gYmUgb3ZlcnJpZGRlbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0TWVudURlZmF1bHRPcHRpb25zIHtcbiAgLyoqIFRoZSB4LWF4aXMgcG9zaXRpb24gb2YgdGhlIG1lbnUuICovXG4gIHhQb3NpdGlvbjogTWVudVBvc2l0aW9uWDtcblxuICAvKiogVGhlIHktYXhpcyBwb3NpdGlvbiBvZiB0aGUgbWVudS4gKi9cbiAgeVBvc2l0aW9uOiBNZW51UG9zaXRpb25ZO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IHNob3VsZCBvdmVybGFwIHRoZSBtZW51IHRyaWdnZXIuICovXG4gIG92ZXJsYXBUcmlnZ2VyOiBib29sZWFuO1xuXG4gIC8qKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBtZW51J3MgYmFja2Ryb3AuICovXG4gIGJhY2tkcm9wQ2xhc3M6IHN0cmluZztcblxuICAvKiogQ2xhc3Mgb3IgbGlzdCBvZiBjbGFzc2VzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIG1lbnUncyBvdmVybGF5IHBhbmVsLiAqL1xuICBvdmVybGF5UGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGhhcyBhIGJhY2tkcm9wLiAqL1xuICBoYXNCYWNrZHJvcD86IGJvb2xlYW47XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdG8gYmUgdXNlZCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgbWF0LW1lbnVgLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9NRU5VX0RFRkFVTFRfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRNZW51RGVmYXVsdE9wdGlvbnM+KFxuICAnbWF0LW1lbnUtZGVmYXVsdC1vcHRpb25zJyxcbiAge1xuICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICBmYWN0b3J5OiBNQVRfTUVOVV9ERUZBVUxUX09QVElPTlNfRkFDVE9SWSxcbiAgfSxcbik7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFUX01FTlVfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogTWF0TWVudURlZmF1bHRPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICBvdmVybGFwVHJpZ2dlcjogZmFsc2UsXG4gICAgeFBvc2l0aW9uOiAnYWZ0ZXInLFxuICAgIHlQb3NpdGlvbjogJ2JlbG93JyxcbiAgICBiYWNrZHJvcENsYXNzOiAnY2RrLW92ZXJsYXktdHJhbnNwYXJlbnQtYmFja2Ryb3AnLFxuICB9O1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtbWVudScsXG4gIHRlbXBsYXRlVXJsOiAnbWVudS5odG1sJyxcbiAgc3R5bGVVcmw6ICdtZW51LmNzcycsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBleHBvcnRBczogJ21hdE1lbnUnLFxuICBob3N0OiB7XG4gICAgJ1thdHRyLmFyaWEtbGFiZWxdJzogJ251bGwnLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsbGVkYnldJzogJ251bGwnLFxuICAgICdbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XSc6ICdudWxsJyxcbiAgfSxcbiAgYW5pbWF0aW9uczogW21hdE1lbnVBbmltYXRpb25zLnRyYW5zZm9ybU1lbnUsIG1hdE1lbnVBbmltYXRpb25zLmZhZGVJbkl0ZW1zXSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1BVF9NRU5VX1BBTkVMLCB1c2VFeGlzdGluZzogTWF0TWVudX1dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRNZW51IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgTWF0TWVudVBhbmVsPE1hdE1lbnVJdGVtPiwgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9rZXlNYW5hZ2VyOiBGb2N1c0tleU1hbmFnZXI8TWF0TWVudUl0ZW0+O1xuICBwcml2YXRlIF94UG9zaXRpb246IE1lbnVQb3NpdGlvblg7XG4gIHByaXZhdGUgX3lQb3NpdGlvbjogTWVudVBvc2l0aW9uWTtcbiAgcHJpdmF0ZSBfZmlyc3RJdGVtRm9jdXNSZWY/OiBBZnRlclJlbmRlclJlZjtcbiAgcHJpdmF0ZSBfcHJldmlvdXNFbGV2YXRpb246IHN0cmluZztcbiAgcHJpdmF0ZSBfZWxldmF0aW9uUHJlZml4ID0gJ21hdC1lbGV2YXRpb24teic7XG4gIHByaXZhdGUgX2Jhc2VFbGV2YXRpb246IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBbGwgaXRlbXMgaW5zaWRlIHRoZSBtZW51LiBJbmNsdWRlcyBpdGVtcyBuZXN0ZWQgaW5zaWRlIGFub3RoZXIgbWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihNYXRNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX2FsbEl0ZW1zOiBRdWVyeUxpc3Q8TWF0TWVudUl0ZW0+O1xuXG4gIC8qKiBPbmx5IHRoZSBkaXJlY3QgZGVzY2VuZGFudCBtZW51IGl0ZW1zLiAqL1xuICBfZGlyZWN0RGVzY2VuZGFudEl0ZW1zID0gbmV3IFF1ZXJ5TGlzdDxNYXRNZW51SXRlbT4oKTtcblxuICAvKiogQ2xhc3NlcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBtZW51IHBhbmVsLiAqL1xuICBfY2xhc3NMaXN0OiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcblxuICAvKiogQ3VycmVudCBzdGF0ZSBvZiB0aGUgcGFuZWwgYW5pbWF0aW9uLiAqL1xuICBfcGFuZWxBbmltYXRpb25TdGF0ZTogJ3ZvaWQnIHwgJ2VudGVyJyA9ICd2b2lkJztcblxuICAvKiogRW1pdHMgd2hlbmV2ZXIgYW4gYW5pbWF0aW9uIG9uIHRoZSBtZW51IGNvbXBsZXRlcy4gKi9cbiAgcmVhZG9ubHkgX2FuaW1hdGlvbkRvbmUgPSBuZXcgU3ViamVjdDxBbmltYXRpb25FdmVudD4oKTtcblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpcyBhbmltYXRpbmcuICovXG4gIF9pc0FuaW1hdGluZzogYm9vbGVhbjtcblxuICAvKiogUGFyZW50IG1lbnUgb2YgdGhlIGN1cnJlbnQgbWVudSBwYW5lbC4gKi9cbiAgcGFyZW50TWVudTogTWF0TWVudVBhbmVsIHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBMYXlvdXQgZGlyZWN0aW9uIG9mIHRoZSBtZW51LiAqL1xuICBkaXJlY3Rpb246IERpcmVjdGlvbjtcblxuICAvKiogQ2xhc3Mgb3IgbGlzdCBvZiBjbGFzc2VzIHRvIGJlIGFkZGVkIHRvIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuICBvdmVybGF5UGFuZWxDbGFzczogc3RyaW5nIHwgc3RyaW5nW107XG5cbiAgLyoqIENsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBiYWNrZHJvcCBlbGVtZW50LiAqL1xuICBASW5wdXQoKSBiYWNrZHJvcENsYXNzOiBzdHJpbmc7XG5cbiAgLyoqIGFyaWEtbGFiZWwgZm9yIHRoZSBtZW51IHBhbmVsLiAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWwnKSBhcmlhTGFiZWw6IHN0cmluZztcblxuICAvKiogYXJpYS1sYWJlbGxlZGJ5IGZvciB0aGUgbWVudSBwYW5lbC4gKi9cbiAgQElucHV0KCdhcmlhLWxhYmVsbGVkYnknKSBhcmlhTGFiZWxsZWRieTogc3RyaW5nO1xuXG4gIC8qKiBhcmlhLWRlc2NyaWJlZGJ5IGZvciB0aGUgbWVudSBwYW5lbC4gKi9cbiAgQElucHV0KCdhcmlhLWRlc2NyaWJlZGJ5JykgYXJpYURlc2NyaWJlZGJ5OiBzdHJpbmc7XG5cbiAgLyoqIFBvc2l0aW9uIG9mIHRoZSBtZW51IGluIHRoZSBYIGF4aXMuICovXG4gIEBJbnB1dCgpXG4gIGdldCB4UG9zaXRpb24oKTogTWVudVBvc2l0aW9uWCB7XG4gICAgcmV0dXJuIHRoaXMuX3hQb3NpdGlvbjtcbiAgfVxuICBzZXQgeFBvc2l0aW9uKHZhbHVlOiBNZW51UG9zaXRpb25YKSB7XG4gICAgaWYgKFxuICAgICAgdmFsdWUgIT09ICdiZWZvcmUnICYmXG4gICAgICB2YWx1ZSAhPT0gJ2FmdGVyJyAmJlxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSlcbiAgICApIHtcbiAgICAgIHRocm93TWF0TWVudUludmFsaWRQb3NpdGlvblgoKTtcbiAgICB9XG4gICAgdGhpcy5feFBvc2l0aW9uID0gdmFsdWU7XG4gICAgdGhpcy5zZXRQb3NpdGlvbkNsYXNzZXMoKTtcbiAgfVxuXG4gIC8qKiBQb3NpdGlvbiBvZiB0aGUgbWVudSBpbiB0aGUgWSBheGlzLiAqL1xuICBASW5wdXQoKVxuICBnZXQgeVBvc2l0aW9uKCk6IE1lbnVQb3NpdGlvblkge1xuICAgIHJldHVybiB0aGlzLl95UG9zaXRpb247XG4gIH1cbiAgc2V0IHlQb3NpdGlvbih2YWx1ZTogTWVudVBvc2l0aW9uWSkge1xuICAgIGlmICh2YWx1ZSAhPT0gJ2Fib3ZlJyAmJiB2YWx1ZSAhPT0gJ2JlbG93JyAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3dNYXRNZW51SW52YWxpZFBvc2l0aW9uWSgpO1xuICAgIH1cbiAgICB0aGlzLl95UG9zaXRpb24gPSB2YWx1ZTtcbiAgICB0aGlzLnNldFBvc2l0aW9uQ2xhc3NlcygpO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgQFZpZXdDaGlsZChUZW1wbGF0ZVJlZikgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgdGhlIGl0ZW1zIGluc2lkZSBvZiBhIG1lbnUuXG4gICAqIEBkZXByZWNhdGVkXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIEBDb250ZW50Q2hpbGRyZW4oTWF0TWVudUl0ZW0sIHtkZXNjZW5kYW50czogZmFsc2V9KSBpdGVtczogUXVlcnlMaXN0PE1hdE1lbnVJdGVtPjtcblxuICAvKipcbiAgICogTWVudSBjb250ZW50IHRoYXQgd2lsbCBiZSByZW5kZXJlZCBsYXppbHkuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIEBDb250ZW50Q2hpbGQoTUFUX01FTlVfQ09OVEVOVCkgbGF6eUNvbnRlbnQ6IE1hdE1lbnVDb250ZW50O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IHNob3VsZCBvdmVybGFwIGl0cyB0cmlnZ2VyLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIG92ZXJsYXBUcmlnZ2VyOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGhhcyBhIGJhY2tkcm9wLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogKHZhbHVlOiBhbnkpID0+ICh2YWx1ZSA9PSBudWxsID8gbnVsbCA6IGJvb2xlYW5BdHRyaWJ1dGUodmFsdWUpKX0pXG4gIGhhc0JhY2tkcm9wPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgdGFrZXMgY2xhc3NlcyBzZXQgb24gdGhlIGhvc3QgbWF0LW1lbnUgZWxlbWVudCBhbmQgYXBwbGllcyB0aGVtIG9uIHRoZVxuICAgKiBtZW51IHRlbXBsYXRlIHRoYXQgZGlzcGxheXMgaW4gdGhlIG92ZXJsYXkgY29udGFpbmVyLiAgT3RoZXJ3aXNlLCBpdCdzIGRpZmZpY3VsdFxuICAgKiB0byBzdHlsZSB0aGUgY29udGFpbmluZyBtZW51IGZyb20gb3V0c2lkZSB0aGUgY29tcG9uZW50LlxuICAgKiBAcGFyYW0gY2xhc3NlcyBsaXN0IG9mIGNsYXNzIG5hbWVzXG4gICAqL1xuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IHBhbmVsQ2xhc3MoY2xhc3Nlczogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJldmlvdXNQYW5lbENsYXNzID0gdGhpcy5fcHJldmlvdXNQYW5lbENsYXNzO1xuICAgIGNvbnN0IG5ld0NsYXNzTGlzdCA9IHsuLi50aGlzLl9jbGFzc0xpc3R9O1xuXG4gICAgaWYgKHByZXZpb3VzUGFuZWxDbGFzcyAmJiBwcmV2aW91c1BhbmVsQ2xhc3MubGVuZ3RoKSB7XG4gICAgICBwcmV2aW91c1BhbmVsQ2xhc3Muc3BsaXQoJyAnKS5mb3JFYWNoKChjbGFzc05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBuZXdDbGFzc0xpc3RbY2xhc3NOYW1lXSA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcHJldmlvdXNQYW5lbENsYXNzID0gY2xhc3NlcztcblxuICAgIGlmIChjbGFzc2VzICYmIGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgICBjbGFzc2VzLnNwbGl0KCcgJykuZm9yRWFjaCgoY2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbmV3Q2xhc3NMaXN0W2NsYXNzTmFtZV0gPSB0cnVlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc05hbWUgPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLl9jbGFzc0xpc3QgPSBuZXdDbGFzc0xpc3Q7XG4gIH1cbiAgcHJpdmF0ZSBfcHJldmlvdXNQYW5lbENsYXNzOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHRha2VzIGNsYXNzZXMgc2V0IG9uIHRoZSBob3N0IG1hdC1tZW51IGVsZW1lbnQgYW5kIGFwcGxpZXMgdGhlbSBvbiB0aGVcbiAgICogbWVudSB0ZW1wbGF0ZSB0aGF0IGRpc3BsYXlzIGluIHRoZSBvdmVybGF5IGNvbnRhaW5lci4gIE90aGVyd2lzZSwgaXQncyBkaWZmaWN1bHRcbiAgICogdG8gc3R5bGUgdGhlIGNvbnRhaW5pbmcgbWVudSBmcm9tIG91dHNpZGUgdGhlIGNvbXBvbmVudC5cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBwYW5lbENsYXNzYCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgY2xhc3NMaXN0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGFuZWxDbGFzcztcbiAgfVxuICBzZXQgY2xhc3NMaXN0KGNsYXNzZXM6IHN0cmluZykge1xuICAgIHRoaXMucGFuZWxDbGFzcyA9IGNsYXNzZXM7XG4gIH1cblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPE1lbnVDbG9zZVJlYXNvbj4gPSBuZXcgRXZlbnRFbWl0dGVyPE1lbnVDbG9zZVJlYXNvbj4oKTtcblxuICAvKipcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC5cbiAgICogQGRlcHJlY2F0ZWQgU3dpdGNoIHRvIGBjbG9zZWRgIGluc3RlYWRcbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlOiBFdmVudEVtaXR0ZXI8TWVudUNsb3NlUmVhc29uPiA9IHRoaXMuY2xvc2VkO1xuXG4gIHJlYWRvbmx5IHBhbmVsSWQgPSBgbWF0LW1lbnUtcGFuZWwtJHttZW51UGFuZWxVaWQrK31gO1xuXG4gIHByaXZhdGUgX2luamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBkZWZhdWx0T3B0aW9uczogTWF0TWVudURlZmF1bHRPcHRpb25zLFxuICAgIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgKTtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgYF9jaGFuZ2VEZXRlY3RvclJlZmAgdG8gYmVjb21lIGEgcmVxdWlyZWQgcGFyYW1ldGVyLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE1LjAuMFxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgbmdab25lOiBOZ1pvbmUsXG4gICAgZGVmYXVsdE9wdGlvbnM6IE1hdE1lbnVEZWZhdWx0T3B0aW9ucyxcbiAgICBjaGFuZ2VEZXRlY3RvclJlZj86IENoYW5nZURldGVjdG9yUmVmLFxuICApO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVudXNlZCBwYXJhbSwgd2lsbCBiZSByZW1vdmVkLlxuICAgICAqIEBicmVha2luZy1jaGFuZ2UgMTkuMC4wXG4gICAgICovXG4gICAgX3VudXNlZE5nWm9uZTogTmdab25lLFxuICAgIEBJbmplY3QoTUFUX01FTlVfREVGQVVMVF9PUFRJT05TKSBkZWZhdWx0T3B0aW9uczogTWF0TWVudURlZmF1bHRPcHRpb25zLFxuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgMTUuMC4wIGBfY2hhbmdlRGV0ZWN0b3JSZWZgIHRvIGJlY29tZSBhIHJlcXVpcmVkIHBhcmFtZXRlci5cbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZj86IENoYW5nZURldGVjdG9yUmVmLFxuICApIHtcbiAgICB0aGlzLm92ZXJsYXlQYW5lbENsYXNzID0gZGVmYXVsdE9wdGlvbnMub3ZlcmxheVBhbmVsQ2xhc3MgfHwgJyc7XG4gICAgdGhpcy5feFBvc2l0aW9uID0gZGVmYXVsdE9wdGlvbnMueFBvc2l0aW9uO1xuICAgIHRoaXMuX3lQb3NpdGlvbiA9IGRlZmF1bHRPcHRpb25zLnlQb3NpdGlvbjtcbiAgICB0aGlzLmJhY2tkcm9wQ2xhc3MgPSBkZWZhdWx0T3B0aW9ucy5iYWNrZHJvcENsYXNzO1xuICAgIHRoaXMub3ZlcmxhcFRyaWdnZXIgPSBkZWZhdWx0T3B0aW9ucy5vdmVybGFwVHJpZ2dlcjtcbiAgICB0aGlzLmhhc0JhY2tkcm9wID0gZGVmYXVsdE9wdGlvbnMuaGFzQmFja2Ryb3A7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnNldFBvc2l0aW9uQ2xhc3NlcygpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3VwZGF0ZURpcmVjdERlc2NlbmRhbnRzKCk7XG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zKVxuICAgICAgLndpdGhXcmFwKClcbiAgICAgIC53aXRoVHlwZUFoZWFkKClcbiAgICAgIC53aXRoSG9tZUFuZEVuZCgpO1xuICAgIHRoaXMuX2tleU1hbmFnZXIudGFiT3V0LnN1YnNjcmliZSgoKSA9PiB0aGlzLmNsb3NlZC5lbWl0KCd0YWInKSk7XG5cbiAgICAvLyBJZiBhIHVzZXIgbWFudWFsbHkgKHByb2dyYW1tYXRpY2FsbHkpIGZvY3VzZXMgYSBtZW51IGl0ZW0sIHdlIG5lZWQgdG8gcmVmbGVjdCB0aGF0IGZvY3VzXG4gICAgLy8gY2hhbmdlIGJhY2sgdG8gdGhlIGtleSBtYW5hZ2VyLiBOb3RlIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byB1bnN1YnNjcmliZSBoZXJlIGJlY2F1c2UgX2ZvY3VzZWRcbiAgICAvLyBpcyBpbnRlcm5hbCBhbmQgd2Uga25vdyB0aGF0IGl0IGdldHMgY29tcGxldGVkIG9uIGRlc3Ryb3kuXG4gICAgdGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zLmNoYW5nZXNcbiAgICAgIC5waXBlKFxuICAgICAgICBzdGFydFdpdGgodGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zKSxcbiAgICAgICAgc3dpdGNoTWFwKGl0ZW1zID0+IG1lcmdlKC4uLml0ZW1zLm1hcCgoaXRlbTogTWF0TWVudUl0ZW0pID0+IGl0ZW0uX2ZvY3VzZWQpKSksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKGZvY3VzZWRJdGVtID0+IHRoaXMuX2tleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShmb2N1c2VkSXRlbSBhcyBNYXRNZW51SXRlbSkpO1xuXG4gICAgdGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKChpdGVtc0xpc3Q6IFF1ZXJ5TGlzdDxNYXRNZW51SXRlbT4pID0+IHtcbiAgICAgIC8vIE1vdmUgZm9jdXMgdG8gYW5vdGhlciBpdGVtLCBpZiB0aGUgYWN0aXZlIGl0ZW0gaXMgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0LlxuICAgICAgLy8gV2UgbmVlZCB0byBkZWJvdW5jZSB0aGUgY2FsbGJhY2ssIGJlY2F1c2UgbXVsdGlwbGUgaXRlbXMgbWlnaHQgYmUgcmVtb3ZlZFxuICAgICAgLy8gaW4gcXVpY2sgc3VjY2Vzc2lvbi5cbiAgICAgIGNvbnN0IG1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuXG4gICAgICBpZiAodGhpcy5fcGFuZWxBbmltYXRpb25TdGF0ZSA9PT0gJ2VudGVyJyAmJiBtYW5hZ2VyLmFjdGl2ZUl0ZW0/Ll9oYXNGb2N1cygpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gaXRlbXNMaXN0LnRvQXJyYXkoKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihpdGVtcy5sZW5ndGggLSAxLCBtYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCB8fCAwKSk7XG5cbiAgICAgICAgaWYgKGl0ZW1zW2luZGV4XSAmJiAhaXRlbXNbaW5kZXhdLmRpc2FibGVkKSB7XG4gICAgICAgICAgbWFuYWdlci5zZXRBY3RpdmVJdGVtKGluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYW5hZ2VyLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXI/LmRlc3Ryb3koKTtcbiAgICB0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMuZGVzdHJveSgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fZmlyc3RJdGVtRm9jdXNSZWY/LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgaG92ZXJlZCBtZW51IGl0ZW0gY2hhbmdlcy4gKi9cbiAgX2hvdmVyZWQoKTogT2JzZXJ2YWJsZTxNYXRNZW51SXRlbT4ge1xuICAgIC8vIENvZXJjZSB0aGUgYGNoYW5nZXNgIHByb3BlcnR5IGJlY2F1c2UgQW5ndWxhciB0eXBlcyBpdCBhcyBgT2JzZXJ2YWJsZTxhbnk+YFxuICAgIGNvbnN0IGl0ZW1DaGFuZ2VzID0gdGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zLmNoYW5nZXMgYXMgT2JzZXJ2YWJsZTxRdWVyeUxpc3Q8TWF0TWVudUl0ZW0+PjtcbiAgICByZXR1cm4gaXRlbUNoYW5nZXMucGlwZShcbiAgICAgIHN0YXJ0V2l0aCh0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMpLFxuICAgICAgc3dpdGNoTWFwKGl0ZW1zID0+IG1lcmdlKC4uLml0ZW1zLm1hcCgoaXRlbTogTWF0TWVudUl0ZW0pID0+IGl0ZW0uX2hvdmVyZWQpKSksXG4gICAgKSBhcyBPYnNlcnZhYmxlPE1hdE1lbnVJdGVtPjtcbiAgfVxuXG4gIC8qXG4gICAqIFJlZ2lzdGVycyBhIG1lbnUgaXRlbSB3aXRoIHRoZSBtZW51LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqIEBkZXByZWNhdGVkIE5vIGxvbmdlciBiZWluZyB1c2VkLiBUbyBiZSByZW1vdmVkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDkuMC4wXG4gICAqL1xuICBhZGRJdGVtKF9pdGVtOiBNYXRNZW51SXRlbSkge31cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBpdGVtIGZyb20gdGhlIG1lbnUuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIGJlaW5nIHVzZWQuIFRvIGJlIHJlbW92ZWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOS4wLjBcbiAgICovXG4gIHJlbW92ZUl0ZW0oX2l0ZW06IE1hdE1lbnVJdGVtKSB7fVxuXG4gIC8qKiBIYW5kbGUgYSBrZXlib2FyZCBldmVudCBmcm9tIHRoZSBtZW51LCBkZWxlZ2F0aW5nIHRvIHRoZSBhcHByb3ByaWF0ZSBhY3Rpb24uICovXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgY29uc3QgbWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG5cbiAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgIGNhc2UgRVNDQVBFOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5jbG9zZWQuZW1pdCgna2V5ZG93bicpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5wYXJlbnRNZW51ICYmIHRoaXMuZGlyZWN0aW9uID09PSAnbHRyJykge1xuICAgICAgICAgIHRoaXMuY2xvc2VkLmVtaXQoJ2tleWRvd24nKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLnBhcmVudE1lbnUgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICdydGwnKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZWQuZW1pdCgna2V5ZG93bicpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGtleUNvZGUgPT09IFVQX0FSUk9XIHx8IGtleUNvZGUgPT09IERPV05fQVJST1cpIHtcbiAgICAgICAgICBtYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgYWxsb3cgdGhlIGV2ZW50IHRvIHByb3BhZ2F0ZSBpZiB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgaXQsIG9yIGl0IG1heVxuICAgIC8vIGVuZCB1cCByZWFjaGluZyBvdGhlciBvdmVybGF5cyB0aGF0IHdlcmUgb3BlbmVkIGVhcmxpZXIgKHNlZSAjMjI2OTQpLlxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtZW51LlxuICAgKiBAcGFyYW0gb3JpZ2luIEFjdGlvbiBmcm9tIHdoaWNoIHRoZSBmb2N1cyBvcmlnaW5hdGVkLiBVc2VkIHRvIHNldCB0aGUgY29ycmVjdCBzdHlsaW5nLlxuICAgKi9cbiAgZm9jdXNGaXJzdEl0ZW0ob3JpZ2luOiBGb2N1c09yaWdpbiA9ICdwcm9ncmFtJyk6IHZvaWQge1xuICAgIC8vIFdhaXQgZm9yIGBhZnRlck5leHRSZW5kZXJgIHRvIGVuc3VyZSBpT1MgVm9pY2VPdmVyIHNjcmVlbiByZWFkZXIgZm9jdXNlcyB0aGUgZmlyc3QgaXRlbSAoIzI0NzM1KS5cbiAgICB0aGlzLl9maXJzdEl0ZW1Gb2N1c1JlZj8uZGVzdHJveSgpO1xuICAgIHRoaXMuX2ZpcnN0SXRlbUZvY3VzUmVmID0gYWZ0ZXJOZXh0UmVuZGVyKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBsZXQgbWVudVBhbmVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gQmVjYXVzZSB0aGUgYG1hdC1tZW51UGFuZWxgIGlzIGF0IHRoZSBET00gaW5zZXJ0aW9uIHBvaW50LCBub3QgaW5zaWRlIHRoZSBvdmVybGF5LCB3ZSBkb24ndFxuICAgICAgICAgIC8vIGhhdmUgYSBuaWNlIHdheSBvZiBnZXR0aW5nIGEgaG9sZCBvZiB0aGUgbWVudVBhbmVsIHBhbmVsLiBXZSBjYW4ndCB1c2UgYSBgVmlld0NoaWxkYCBlaXRoZXJcbiAgICAgICAgICAvLyBiZWNhdXNlIHRoZSBwYW5lbCBpcyBpbnNpZGUgYW4gYG5nLXRlbXBsYXRlYC4gV2Ugd29yayBhcm91bmQgaXQgYnkgc3RhcnRpbmcgZnJvbSBvbmUgb2ZcbiAgICAgICAgICAvLyB0aGUgaXRlbXMgYW5kIHdhbGtpbmcgdXAgdGhlIERPTS5cbiAgICAgICAgICBtZW51UGFuZWwgPSB0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMuZmlyc3QhLl9nZXRIb3N0RWxlbWVudCgpLmNsb3Nlc3QoJ1tyb2xlPVwibWVudVwiXScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYW4gaXRlbSBpbiB0aGUgbWVudVBhbmVsIGlzIGFscmVhZHkgZm9jdXNlZCwgYXZvaWQgb3ZlcnJpZGluZyB0aGUgZm9jdXMuXG4gICAgICAgIGlmICghbWVudVBhbmVsIHx8ICFtZW51UGFuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICAgICAgICBtYW5hZ2VyLnNldEZvY3VzT3JpZ2luKG9yaWdpbikuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGFjdGl2ZSBpdGVtIGF0IHRoaXMgcG9pbnQsIGl0IG1lYW5zIHRoYXQgYWxsIHRoZSBpdGVtcyBhcmUgZGlzYWJsZWQuXG4gICAgICAgICAgLy8gTW92ZSBmb2N1cyB0byB0aGUgbWVudVBhbmVsIHBhbmVsIHNvIGtleWJvYXJkIGV2ZW50cyBsaWtlIEVzY2FwZSBzdGlsbCB3b3JrLiBBbHNvIHRoaXMgd2lsbFxuICAgICAgICAgIC8vIGdpdmUgX3NvbWVfIGZlZWRiYWNrIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgICAgICAgIGlmICghbWFuYWdlci5hY3RpdmVJdGVtICYmIG1lbnVQYW5lbCkge1xuICAgICAgICAgICAgbWVudVBhbmVsLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge2luamVjdG9yOiB0aGlzLl9pbmplY3Rvcn0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGFjdGl2ZSBpdGVtIGluIHRoZSBtZW51LiBUaGlzIGlzIHVzZWQgd2hlbiB0aGUgbWVudSBpcyBvcGVuZWQsIGFsbG93aW5nXG4gICAqIHRoZSB1c2VyIHRvIHN0YXJ0IGZyb20gdGhlIGZpcnN0IG9wdGlvbiB3aGVuIHByZXNzaW5nIHRoZSBkb3duIGFycm93LlxuICAgKi9cbiAgcmVzZXRBY3RpdmVJdGVtKCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSgtMSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWVudSBwYW5lbCBlbGV2YXRpb24uXG4gICAqIEBwYXJhbSBkZXB0aCBOdW1iZXIgb2YgcGFyZW50IG1lbnVzIHRoYXQgY29tZSBiZWZvcmUgdGhlIG1lbnUuXG4gICAqL1xuICBzZXRFbGV2YXRpb24oZGVwdGg6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIFRoZSBiYXNlIGVsZXZhdGlvbiBkZXBlbmRzIG9uIHdoaWNoIHZlcnNpb24gb2YgdGhlIHNwZWNcbiAgICAvLyB3ZSdyZSBydW5uaW5nIHNvIHdlIGhhdmUgdG8gcmVzb2x2ZSBpdCBhdCBydW50aW1lLlxuICAgIGlmICh0aGlzLl9iYXNlRWxldmF0aW9uID09PSBudWxsKSB7XG4gICAgICBjb25zdCBzdHlsZXMgPVxuICAgICAgICB0eXBlb2YgZ2V0Q29tcHV0ZWRTdHlsZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgID8gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgY29uc3QgdmFsdWUgPSBzdHlsZXM/LmdldFByb3BlcnR5VmFsdWUoJy0tbWF0LW1lbnUtYmFzZS1lbGV2YXRpb24tbGV2ZWwnKSB8fCAnOCc7XG4gICAgICB0aGlzLl9iYXNlRWxldmF0aW9uID0gcGFyc2VJbnQodmFsdWUpO1xuICAgIH1cblxuICAgIC8vIFRoZSBlbGV2YXRpb24gc3RhcnRzIGF0IHRoZSBiYXNlIGFuZCBpbmNyZWFzZXMgYnkgb25lIGZvciBlYWNoIGxldmVsLlxuICAgIC8vIENhcHBlZCBhdCAyNCBiZWNhdXNlIHRoYXQncyB0aGUgbWF4aW11bSBlbGV2YXRpb24gZGVmaW5lZCBpbiB0aGUgTWF0ZXJpYWwgZGVzaWduIHNwZWMuXG4gICAgY29uc3QgZWxldmF0aW9uID0gTWF0aC5taW4odGhpcy5fYmFzZUVsZXZhdGlvbiArIGRlcHRoLCAyNCk7XG4gICAgY29uc3QgbmV3RWxldmF0aW9uID0gYCR7dGhpcy5fZWxldmF0aW9uUHJlZml4fSR7ZWxldmF0aW9ufWA7XG4gICAgY29uc3QgY3VzdG9tRWxldmF0aW9uID0gT2JqZWN0LmtleXModGhpcy5fY2xhc3NMaXN0KS5maW5kKGNsYXNzTmFtZSA9PiB7XG4gICAgICByZXR1cm4gY2xhc3NOYW1lLnN0YXJ0c1dpdGgodGhpcy5fZWxldmF0aW9uUHJlZml4KTtcbiAgICB9KTtcblxuICAgIGlmICghY3VzdG9tRWxldmF0aW9uIHx8IGN1c3RvbUVsZXZhdGlvbiA9PT0gdGhpcy5fcHJldmlvdXNFbGV2YXRpb24pIHtcbiAgICAgIGNvbnN0IG5ld0NsYXNzTGlzdCA9IHsuLi50aGlzLl9jbGFzc0xpc3R9O1xuXG4gICAgICBpZiAodGhpcy5fcHJldmlvdXNFbGV2YXRpb24pIHtcbiAgICAgICAgbmV3Q2xhc3NMaXN0W3RoaXMuX3ByZXZpb3VzRWxldmF0aW9uXSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBuZXdDbGFzc0xpc3RbbmV3RWxldmF0aW9uXSA9IHRydWU7XG4gICAgICB0aGlzLl9wcmV2aW91c0VsZXZhdGlvbiA9IG5ld0VsZXZhdGlvbjtcbiAgICAgIHRoaXMuX2NsYXNzTGlzdCA9IG5ld0NsYXNzTGlzdDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBjbGFzc2VzIHRvIHRoZSBtZW51IHBhbmVsIGJhc2VkIG9uIGl0cyBwb3NpdGlvbi4gQ2FuIGJlIHVzZWQgYnlcbiAgICogY29uc3VtZXJzIHRvIGFkZCBzcGVjaWZpYyBzdHlsaW5nIGJhc2VkIG9uIHRoZSBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc1ggUG9zaXRpb24gb2YgdGhlIG1lbnUgYWxvbmcgdGhlIHggYXhpcy5cbiAgICogQHBhcmFtIHBvc1kgUG9zaXRpb24gb2YgdGhlIG1lbnUgYWxvbmcgdGhlIHkgYXhpcy5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2V0UG9zaXRpb25DbGFzc2VzKHBvc1g6IE1lbnVQb3NpdGlvblggPSB0aGlzLnhQb3NpdGlvbiwgcG9zWTogTWVudVBvc2l0aW9uWSA9IHRoaXMueVBvc2l0aW9uKSB7XG4gICAgdGhpcy5fY2xhc3NMaXN0ID0ge1xuICAgICAgLi4udGhpcy5fY2xhc3NMaXN0LFxuICAgICAgWydtYXQtbWVudS1iZWZvcmUnXTogcG9zWCA9PT0gJ2JlZm9yZScsXG4gICAgICBbJ21hdC1tZW51LWFmdGVyJ106IHBvc1ggPT09ICdhZnRlcicsXG4gICAgICBbJ21hdC1tZW51LWFib3ZlJ106IHBvc1kgPT09ICdhYm92ZScsXG4gICAgICBbJ21hdC1tZW51LWJlbG93J106IHBvc1kgPT09ICdiZWxvdycsXG4gICAgfTtcblxuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgMTUuMC4wIFJlbW92ZSBudWxsIGNoZWNrIGZvciBgX2NoYW5nZURldGVjdG9yUmVmYC5cbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZj8ubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogU3RhcnRzIHRoZSBlbnRlciBhbmltYXRpb24uICovXG4gIF9zdGFydEFuaW1hdGlvbigpIHtcbiAgICAvLyBAYnJlYWtpbmctY2hhbmdlIDguMC4wIENvbWJpbmUgd2l0aCBfcmVzZXRBbmltYXRpb24uXG4gICAgdGhpcy5fcGFuZWxBbmltYXRpb25TdGF0ZSA9ICdlbnRlcic7XG4gIH1cblxuICAvKiogUmVzZXRzIHRoZSBwYW5lbCBhbmltYXRpb24gdG8gaXRzIGluaXRpYWwgc3RhdGUuICovXG4gIF9yZXNldEFuaW1hdGlvbigpIHtcbiAgICAvLyBAYnJlYWtpbmctY2hhbmdlIDguMC4wIENvbWJpbmUgd2l0aCBfc3RhcnRBbmltYXRpb24uXG4gICAgdGhpcy5fcGFuZWxBbmltYXRpb25TdGF0ZSA9ICd2b2lkJztcbiAgfVxuXG4gIC8qKiBDYWxsYmFjayB0aGF0IGlzIGludm9rZWQgd2hlbiB0aGUgcGFuZWwgYW5pbWF0aW9uIGNvbXBsZXRlcy4gKi9cbiAgX29uQW5pbWF0aW9uRG9uZShldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lLm5leHQoZXZlbnQpO1xuICAgIHRoaXMuX2lzQW5pbWF0aW5nID0gZmFsc2U7XG4gIH1cblxuICBfb25BbmltYXRpb25TdGFydChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICB0aGlzLl9pc0FuaW1hdGluZyA9IHRydWU7XG5cbiAgICAvLyBTY3JvbGwgdGhlIGNvbnRlbnQgZWxlbWVudCB0byB0aGUgdG9wIGFzIHNvb24gYXMgdGhlIGFuaW1hdGlvbiBzdGFydHMuIFRoaXMgaXMgbmVjZXNzYXJ5LFxuICAgIC8vIGJlY2F1c2Ugd2UgbW92ZSBmb2N1cyB0byB0aGUgZmlyc3QgaXRlbSB3aGlsZSBpdCdzIHN0aWxsIGJlaW5nIGFuaW1hdGVkLCB3aGljaCBjYW4gdGhyb3dcbiAgICAvLyB0aGUgYnJvd3NlciBvZmYgd2hlbiBpdCBkZXRlcm1pbmVzIHRoZSBzY3JvbGwgcG9zaXRpb24uIEFsdGVybmF0aXZlbHkgd2UgY2FuIG1vdmUgZm9jdXNcbiAgICAvLyB3aGVuIHRoZSBhbmltYXRpb24gaXMgZG9uZSwgaG93ZXZlciBtb3ZpbmcgZm9jdXMgYXN5bmNocm9ub3VzbHkgd2lsbCBpbnRlcnJ1cHQgc2NyZWVuXG4gICAgLy8gcmVhZGVycyB3aGljaCBhcmUgaW4gdGhlIHByb2Nlc3Mgb2YgcmVhZGluZyBvdXQgdGhlIG1lbnUgYWxyZWFkeS4gV2UgdGFrZSB0aGUgYGVsZW1lbnRgXG4gICAgLy8gZnJvbSB0aGUgYGV2ZW50YCBzaW5jZSB3ZSBjYW4ndCB1c2UgYSBgVmlld0NoaWxkYCB0byBhY2Nlc3MgdGhlIHBhbmUuXG4gICAgaWYgKGV2ZW50LnRvU3RhdGUgPT09ICdlbnRlcicgJiYgdGhpcy5fa2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXggPT09IDApIHtcbiAgICAgIGV2ZW50LmVsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB1cCBhIHN0cmVhbSB0aGF0IHdpbGwga2VlcCB0cmFjayBvZiBhbnkgbmV3bHktYWRkZWQgbWVudSBpdGVtcyBhbmQgd2lsbCB1cGRhdGUgdGhlIGxpc3RcbiAgICogb2YgZGlyZWN0IGRlc2NlbmRhbnRzLiBXZSBjb2xsZWN0IHRoZSBkZXNjZW5kYW50cyB0aGlzIHdheSwgYmVjYXVzZSBgX2FsbEl0ZW1zYCBjYW4gaW5jbHVkZVxuICAgKiBpdGVtcyB0aGF0IGFyZSBwYXJ0IG9mIGNoaWxkIG1lbnVzLCBhbmQgdXNpbmcgYSBjdXN0b20gd2F5IG9mIHJlZ2lzdGVyaW5nIGl0ZW1zIGlzIHVucmVsaWFibGVcbiAgICogd2hlbiBpdCBjb21lcyB0byBtYWludGFpbmluZyB0aGUgaXRlbSBvcmRlci5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZURpcmVjdERlc2NlbmRhbnRzKCkge1xuICAgIHRoaXMuX2FsbEl0ZW1zLmNoYW5nZXNcbiAgICAgIC5waXBlKHN0YXJ0V2l0aCh0aGlzLl9hbGxJdGVtcykpXG4gICAgICAuc3Vic2NyaWJlKChpdGVtczogUXVlcnlMaXN0PE1hdE1lbnVJdGVtPikgPT4ge1xuICAgICAgICB0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMucmVzZXQoaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5fcGFyZW50TWVudSA9PT0gdGhpcykpO1xuICAgICAgICB0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgICB9KTtcbiAgfVxufVxuIiwiPG5nLXRlbXBsYXRlPlxuICA8ZGl2XG4gICAgY2xhc3M9XCJtYXQtbWRjLW1lbnUtcGFuZWwgbWF0LW1kYy1lbGV2YXRpb24tc3BlY2lmaWNcIlxuICAgIFtpZF09XCJwYW5lbElkXCJcbiAgICBbY2xhc3NdPVwiX2NsYXNzTGlzdFwiXG4gICAgKGtleWRvd24pPVwiX2hhbmRsZUtleWRvd24oJGV2ZW50KVwiXG4gICAgKGNsaWNrKT1cImNsb3NlZC5lbWl0KCdjbGljaycpXCJcbiAgICBbQHRyYW5zZm9ybU1lbnVdPVwiX3BhbmVsQW5pbWF0aW9uU3RhdGVcIlxuICAgIChAdHJhbnNmb3JtTWVudS5zdGFydCk9XCJfb25BbmltYXRpb25TdGFydCgkZXZlbnQpXCJcbiAgICAoQHRyYW5zZm9ybU1lbnUuZG9uZSk9XCJfb25BbmltYXRpb25Eb25lKCRldmVudClcIlxuICAgIHRhYmluZGV4PVwiLTFcIlxuICAgIHJvbGU9XCJtZW51XCJcbiAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbCB8fCBudWxsXCJcbiAgICBbYXR0ci5hcmlhLWxhYmVsbGVkYnldPVwiYXJpYUxhYmVsbGVkYnkgfHwgbnVsbFwiXG4gICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCJhcmlhRGVzY3JpYmVkYnkgfHwgbnVsbFwiPlxuICAgIDxkaXYgY2xhc3M9XCJtYXQtbWRjLW1lbnUtY29udGVudFwiPlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvbmctdGVtcGxhdGU+XG4iXX0=