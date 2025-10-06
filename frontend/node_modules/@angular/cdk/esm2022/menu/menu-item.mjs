/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, Input, NgZone, Output, } from '@angular/core';
import { InputModalityDetector } from '@angular/cdk/a11y';
import { ENTER, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CdkMenuTrigger } from './menu-trigger';
import { CDK_MENU } from './menu-interface';
import { FocusNext, MENU_STACK } from './menu-stack';
import { MENU_AIM } from './menu-aim';
import { eventDispatchesNativeClick } from './event-detection';
import * as i0 from "@angular/core";
/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
export class CdkMenuItem {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtaXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWtCLHFCQUFxQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDekUsT0FBTyxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFDLFFBQVEsRUFBTyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRW5ELE9BQU8sRUFBQyxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFDN0MsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7O0FBRTdEOzs7O0dBSUc7QUFnQkgsTUFBTSxPQUFPLFdBQVc7SUFpQ3RCLDBDQUEwQztJQUMxQyxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsZUFBZSxJQUFJLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBY0Q7UUFqRG1CLFNB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V0FBVzt3QkFDdEIsV0FBVyxFQUFFLG9CQUFvQjtxQkFDbEM7aUJBQ0Y7d0RBb0JxRSxRQUFRO3NCQUEzRSxLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFNOUIsY0FBYztzQkFBakQsS0FBSzt1QkFBQywyQkFBMkI7Z0JBTU8sU0FBUztzQkFBakQsTUFBTTt1QkFBQyxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGb2N1c2FibGVPcHRpb24sIElucHV0TW9kYWxpdHlEZXRlY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtFTlRFUiwgaGFzTW9kaWZpZXJLZXksIExFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBTUEFDRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudVRyaWdnZXJ9IGZyb20gJy4vbWVudS10cmlnZ2VyJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtGb2N1c05leHQsIE1FTlVfU1RBQ0t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge0ZvY3VzYWJsZUVsZW1lbnR9IGZyb20gJy4vcG9pbnRlci1mb2N1cy10cmFja2VyJztcbmltcG9ydCB7TUVOVV9BSU0sIFRvZ2dsZXJ9IGZyb20gJy4vbWVudS1haW0nO1xuaW1wb3J0IHtldmVudERpc3BhdGNoZXNOYXRpdmVDbGlja30gZnJvbSAnLi9ldmVudC1kZXRlY3Rpb24nO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBwcm92aWRlcyB0aGUgYWJpbGl0eSBmb3IgYW4gZWxlbWVudCB0byBiZSBmb2N1c2VkIGFuZCBuYXZpZ2F0ZWQgdG8gdXNpbmcgdGhlXG4gKiBrZXlib2FyZCB3aGVuIHJlc2lkaW5nIGluIGEgQ2RrTWVudSwgQ2RrTWVudUJhciwgb3IgQ2RrTWVudUdyb3VwLiBJdCBwZXJmb3JtcyB1c2VyIGRlZmluZWRcbiAqIGJlaGF2aW9yIHdoZW4gY2xpY2tlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbWVudWl0ZW0nLFxuICAgICdjbGFzcyc6ICdjZGstbWVudS1pdGVtJyxcbiAgICAnW3RhYmluZGV4XSc6ICdfdGFiaW5kZXgnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgICAnKGJsdXIpJzogJ19yZXNldFRhYkluZGV4KCknLFxuICAgICcoZm9jdXMpJzogJ19zZXRUYWJJbmRleCgpJyxcbiAgICAnKGNsaWNrKSc6ICd0cmlnZ2VyKCknLFxuICAgICcoa2V5ZG93biknOiAnX29uS2V5ZG93bigkZXZlbnQpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW0gaW1wbGVtZW50cyBGb2N1c2FibGVPcHRpb24sIEZvY3VzYWJsZUVsZW1lbnQsIFRvZ2dsZXIsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBfZGlyID0gaW5qZWN0KERpcmVjdGlvbmFsaXR5LCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+ID0gaW5qZWN0KEVsZW1lbnRSZWYpO1xuICBwcm90ZWN0ZWQgX25nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9pbnB1dE1vZGFsaXR5RGV0ZWN0b3IgPSBpbmplY3QoSW5wdXRNb2RhbGl0eURldGVjdG9yKTtcblxuICAvKiogVGhlIG1lbnUgYWltIHNlcnZpY2UgdXNlZCBieSB0aGlzIG1lbnUuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX21lbnVBaW0gPSBpbmplY3QoTUVOVV9BSU0sIHtvcHRpb25hbDogdHJ1ZX0pO1xuXG4gIC8qKiBUaGUgc3RhY2sgb2YgbWVudXMgdGhpcyBtZW51IGJlbG9uZ3MgdG8uICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX21lbnVTdGFjayA9IGluamVjdChNRU5VX1NUQUNLKTtcblxuICAvKiogVGhlIHBhcmVudCBtZW51IGluIHdoaWNoIHRoaXMgbWVudWl0ZW0gcmVzaWRlcy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50TWVudSA9IGluamVjdChDREtfTUVOVSwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrTWVudUl0ZW1UcmlnZ2VyIGRpcmVjdGl2ZSBpZiBvbmUgaXMgYWRkZWQgdG8gdGhlIHNhbWUgZWxlbWVudCAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9tZW51VHJpZ2dlciA9IGluamVjdChDZGtNZW51VHJpZ2dlciwge29wdGlvbmFsOiB0cnVlLCBzZWxmOiB0cnVlfSk7XG5cbiAgLyoqICBXaGV0aGVyIHRoZSBDZGtNZW51SXRlbSBpcyBkaXNhYmxlZCAtIGRlZmF1bHRzIHRvIGZhbHNlICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtNZW51SXRlbURpc2FibGVkJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIHRleHQgdXNlZCB0byBsb2NhdGUgdGhpcyBpdGVtIGR1cmluZyBtZW51IHR5cGVhaGVhZC4gSWYgbm90IHNwZWNpZmllZCxcbiAgICogdGhlIGB0ZXh0Q29udGVudGAgb2YgdGhlIGl0ZW0gd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgQElucHV0KCdjZGtNZW51aXRlbVR5cGVhaGVhZExhYmVsJykgdHlwZWFoZWFkTGFiZWw6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgTWVudUl0ZW0gaXMgYSByZWd1bGFyIE1lbnVJdGVtLCBvdXRwdXRzIHdoZW4gaXQgaXMgdHJpZ2dlcmVkIGJ5IGEga2V5Ym9hcmQgb3IgbW91c2VcbiAgICogZXZlbnQuXG4gICAqL1xuICBAT3V0cHV0KCdjZGtNZW51SXRlbVRyaWdnZXJlZCcpIHJlYWRvbmx5IHRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gb3BlbnMgYSBtZW51LiAqL1xuICBnZXQgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVRyaWdnZXI/Lm1lbnVUZW1wbGF0ZVJlZiAhPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0YWJpbmRleCBmb3IgdGhpcyBtZW51IGl0ZW0gbWFuYWdlZCBpbnRlcm5hbGx5IGFuZCB1c2VkIGZvciBpbXBsZW1lbnRpbmcgcm92aW5nIGFcbiAgICogdGFiIGluZGV4LlxuICAgKi9cbiAgX3RhYmluZGV4OiAwIHwgLTEgPSAtMTtcblxuICAvKiogV2hldGhlciB0aGUgaXRlbSBzaG91bGQgY2xvc2UgdGhlIG1lbnUgaWYgdHJpZ2dlcmVkIGJ5IHRoZSBzcGFjZWJhci4gKi9cbiAgcHJvdGVjdGVkIGNsb3NlT25TcGFjZWJhclRyaWdnZXIgPSB0cnVlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBtZW51IGl0ZW0gaXMgZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zZXR1cE1vdXNlRW50ZXIoKTtcbiAgICB0aGlzLl9zZXRUeXBlKCk7XG5cbiAgICBpZiAodGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGVsZW1lbnQuICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBtZW51IGl0ZW0gaXMgbm90IGRpc2FibGVkIGFuZCB0aGUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGEgbWVudSB0cmlnZ2VyIGF0dGFjaGVkLCBlbWl0XG4gICAqIG9uIHRoZSBjZGtNZW51SXRlbVRyaWdnZXJlZCBlbWl0dGVyIGFuZCBjbG9zZSBhbGwgb3BlbiBtZW51cy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0aGUgY29uZmlndXJlIGhvdyB0aGUgaXRlbSBpcyB0cmlnZ2VyZWRcbiAgICogICAtIGtlZXBPcGVuOiBzcGVjaWZpZXMgdGhhdCB0aGUgbWVudSBzaG91bGQgYmUga2VwdCBvcGVuIGFmdGVyIHRyaWdnZXJpbmcgdGhlIGl0ZW0uXG4gICAqL1xuICB0cmlnZ2VyKG9wdGlvbnM/OiB7a2VlcE9wZW46IGJvb2xlYW59KSB7XG4gICAgY29uc3Qge2tlZXBPcGVufSA9IHsuLi5vcHRpb25zfTtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgIXRoaXMuaGFzTWVudSkge1xuICAgICAgdGhpcy50cmlnZ2VyZWQubmV4dCgpO1xuICAgICAgaWYgKCFrZWVwT3Blbikge1xuICAgICAgICB0aGlzLl9tZW51U3RhY2suY2xvc2VBbGwoe2ZvY3VzUGFyZW50VHJpZ2dlcjogdHJ1ZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIE1lbnVJdGVtIGhhcyBhbiBhdHRhY2hlZCBtZW51IGFuZCBpdCBpcyBvcGVuLiAqL1xuICBpc01lbnVPcGVuKCkge1xuICAgIHJldHVybiAhIXRoaXMuX21lbnVUcmlnZ2VyPy5pc09wZW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmVkIE1lbnUgaWYgdGhlIE1lbnUgaXMgb3BlbiBhbmQgaXQgaXMgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHRoZSBtZW51IGlmIGl0IGlzIG9wZW4sIG90aGVyd2lzZSB1bmRlZmluZWQuXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9tZW51VHJpZ2dlcj8uZ2V0TWVudSgpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgQ2RrTWVudVRyaWdnZXIgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudC4gKi9cbiAgZ2V0TWVudVRyaWdnZXIoKTogQ2RrTWVudVRyaWdnZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVRyaWdnZXI7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnR5cGVhaGVhZExhYmVsIHx8IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcnO1xuICB9XG5cbiAgLyoqIFJlc2V0IHRoZSB0YWJpbmRleCB0byAtMS4gKi9cbiAgX3Jlc2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YW5kYWxvbmVJdGVtKCkpIHtcbiAgICAgIHRoaXMuX3RhYmluZGV4ID0gLTE7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGFiIGluZGV4IHRvIDAgaWYgbm90IGRpc2FibGVkIGFuZCBpdCdzIGEgZm9jdXMgZXZlbnQsIG9yIGEgbW91c2UgZW50ZXIgaWYgdGhpcyBlbGVtZW50XG4gICAqIGlzIG5vdCBpbiBhIG1lbnUgYmFyLlxuICAgKi9cbiAgX3NldFRhYkluZGV4KGV2ZW50PzogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZG9uJ3Qgc2V0IHRoZSB0YWJpbmRleCBpZiB0aGVyZSBhcmUgbm8gb3BlbiBzaWJsaW5nIG9yIHBhcmVudCBtZW51c1xuICAgIGlmICghZXZlbnQgfHwgIXRoaXMuX21lbnVTdGFjay5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX3RhYmluZGV4ID0gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51IGl0ZW0sIHNwZWNpZmljYWxseSBlaXRoZXIgdHJpZ2dlcmluZyB0aGUgdXNlciBkZWZpbmVkXG4gICAqIGNhbGxiYWNrIG9yIG9wZW5pbmcvY2xvc2luZyB0aGUgY3VycmVudCBtZW51IGJhc2VkIG9uIHdoZXRoZXIgdGhlIGxlZnQgb3IgcmlnaHQgYXJyb3cga2V5IHdhc1xuICAgKiBwcmVzc2VkLlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgKi9cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIC8vIFNraXAgZXZlbnRzIHRoYXQgd2lsbCB0cmlnZ2VyIGNsaWNrcyBzbyB0aGUgaGFuZGxlciBkb2Vzbid0IGdldCB0cmlnZ2VyZWQgdHdpY2UuXG4gICAgICAgIGlmICghaGFzTW9kaWZpZXJLZXkoZXZlbnQpICYmICFldmVudERpc3BhdGNoZXNOYXRpdmVDbGljayh0aGlzLl9lbGVtZW50UmVmLCBldmVudCkpIHtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoe2tlZXBPcGVuOiBldmVudC5rZXlDb2RlID09PSBTUEFDRSAmJiAhdGhpcy5jbG9zZU9uU3BhY2ViYXJUcmlnZ2VyfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICghaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX3BhcmVudE1lbnUgJiYgdGhpcy5faXNQYXJlbnRWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZGlyPy52YWx1ZSAhPT0gJ3J0bCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5fZm9yd2FyZEFycm93UHJlc3NlZChldmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9iYWNrQXJyb3dQcmVzc2VkKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kaXI/LnZhbHVlICE9PSAncnRsJykge1xuICAgICAgICAgICAgICB0aGlzLl9iYWNrQXJyb3dQcmVzc2VkKGV2ZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2ZvcndhcmRBcnJvd1ByZXNzZWQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGlzIG1lbnUgaXRlbSBpcyBzdGFuZGFsb25lIG9yIHdpdGhpbiBhIG1lbnUgb3IgbWVudSBiYXIuICovXG4gIHByaXZhdGUgX2lzU3RhbmRhbG9uZUl0ZW0oKSB7XG4gICAgcmV0dXJuICF0aGlzLl9wYXJlbnRNZW51O1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHVzZXIgcHJlc3NpbmcgdGhlIGJhY2sgYXJyb3cga2V5LlxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGtleWJvYXJkIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfYmFja0Fycm93UHJlc3NlZChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IHBhcmVudE1lbnUgPSB0aGlzLl9wYXJlbnRNZW51ITtcbiAgICBpZiAodGhpcy5fbWVudVN0YWNrLmhhc0lubGluZU1lbnUoKSB8fCB0aGlzLl9tZW51U3RhY2subGVuZ3RoKCkgPiAxKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlKHBhcmVudE1lbnUsIHtcbiAgICAgICAgZm9jdXNOZXh0T25FbXB0eTpcbiAgICAgICAgICB0aGlzLl9tZW51U3RhY2suaW5saW5lTWVudU9yaWVudGF0aW9uKCkgPT09ICdob3Jpem9udGFsJ1xuICAgICAgICAgICAgPyBGb2N1c05leHQucHJldmlvdXNJdGVtXG4gICAgICAgICAgICA6IEZvY3VzTmV4dC5jdXJyZW50SXRlbSxcbiAgICAgICAgZm9jdXNQYXJlbnRUcmlnZ2VyOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHVzZXIgcHJlc3NpbmcgdGhlIGZvcndhcmQgYXJyb3cga2V5LlxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGtleWJvYXJkIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9yd2FyZEFycm93UHJlc3NlZChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICghdGhpcy5oYXNNZW51ICYmIHRoaXMuX21lbnVTdGFjay5pbmxpbmVNZW51T3JpZW50YXRpb24oKSA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlQWxsKHtcbiAgICAgICAgZm9jdXNOZXh0T25FbXB0eTogRm9jdXNOZXh0Lm5leHRJdGVtLFxuICAgICAgICBmb2N1c1BhcmVudFRyaWdnZXI6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBtb3VzZWVudGVyIGV2ZW50cyBhbmQgY2xvc2UgYW55IHNpYmxpbmcgbWVudSBpdGVtcyBpZiB0aGlzIGVsZW1lbnQgaXMgbW91c2VkXG4gICAqIGludG8uXG4gICAqL1xuICBwcml2YXRlIF9zZXR1cE1vdXNlRW50ZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YW5kYWxvbmVJdGVtKCkpIHtcbiAgICAgIGNvbnN0IGNsb3NlT3BlblNpYmxpbmdzID0gKCkgPT5cbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLl9tZW51U3RhY2suY2xvc2VTdWJNZW51T2YodGhpcy5fcGFyZW50TWVudSEpKTtcblxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgIGZyb21FdmVudCh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdtb3VzZWVudGVyJylcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgIGZpbHRlcigoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBmYWtlIGBtb3VzZWVudGVyYCBldmVudHMgZGlzcGF0Y2hlZCBieSB0b3VjaCBkZXZpY2VzLlxuICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0TW9kYWxpdHlEZXRlY3Rvci5tb3N0UmVjZW50TW9kYWxpdHkgIT09ICd0b3VjaCcgJiZcbiAgICAgICAgICAgICAgICAhdGhpcy5fbWVudVN0YWNrLmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgICAgICF0aGlzLmhhc01lbnVcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbWVudUFpbSkge1xuICAgICAgICAgICAgICB0aGlzLl9tZW51QWltLnRvZ2dsZShjbG9zZU9wZW5TaWJsaW5ncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjbG9zZU9wZW5TaWJsaW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGVuY2xvc2luZyBwYXJlbnQgbWVudSBpcyBjb25maWd1cmVkIGluIGEgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgZmFsc2VcbiAgICogb3RoZXJ3aXNlIG9yIGlmIG5vIHBhcmVudC5cbiAgICovXG4gIHByaXZhdGUgX2lzUGFyZW50VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnU/Lm9yaWVudGF0aW9uID09PSAndmVydGljYWwnO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGB0eXBlYCBhdHRyaWJ1dGUgb2YgdGhlIG1lbnUgaXRlbS4gKi9cbiAgcHJpdmF0ZSBfc2V0VHlwZSgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICAvLyBQcmV2ZW50IGZvcm0gc3VibWlzc2lvbnMuXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==