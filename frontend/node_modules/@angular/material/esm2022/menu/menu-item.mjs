/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, Inject, Optional, Input, ChangeDetectorRef, booleanAttribute, } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MAT_MENU_PANEL } from './menu-panel';
import { MatRipple } from '@angular/material/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
/**
 * Single item inside a `mat-menu`. Provides the menu item styling and accessibility treatment.
 */
export class MatMenuItem {
    constructor(_elementRef, _document, _focusMonitor, _parentMenu, _changeDetectorRef) {
        this._elementRef = _elementRef;
        this._document = _document;
        this._focusMonitor = _focusMonitor;
        this._parentMenu = _parentMenu;
        this._changeDetectorRef = _changeDetectorRef;
        /** ARIA role for the menu item. */
        this.role = 'menuitem';
        /** Whether the menu item is disabled. */
        this.disabled = false;
        /** Whether ripples are disabled on the menu item. */
        this.disableRipple = false;
        /** Stream that emits when the menu item is hovered. */
        this._hovered = new Subject();
        /** Stream that emits when the menu item is focused. */
        this._focused = new Subject();
        /** Whether the menu item is highlighted. */
        this._highlighted = false;
        /** Whether the menu item acts as a trigger for a sub-menu. */
        this._triggersSubmenu = false;
        _parentMenu?.addItem?.(this);
    }
    /** Focuses the menu item. */
    focus(origin, options) {
        if (this._focusMonitor && origin) {
            this._focusMonitor.focusVia(this._getHostElement(), origin, options);
        }
        else {
            this._getHostElement().focus(options);
        }
        this._focused.next(this);
    }
    ngAfterViewInit() {
        if (this._focusMonitor) {
            // Start monitoring the element, so it gets the appropriate focused classes. We want
            // to show the focus style for menu items only when the focus was not caused by a
            // mouse or touch interaction.
            this._focusMonitor.monitor(this._elementRef, false);
        }
    }
    ngOnDestroy() {
        if (this._focusMonitor) {
            this._focusMonitor.stopMonitoring(this._elementRef);
        }
        if (this._parentMenu && this._parentMenu.removeItem) {
            this._parentMenu.removeItem(this);
        }
        this._hovered.complete();
        this._focused.complete();
    }
    /** Used to set the `tabindex`. */
    _getTabIndex() {
        return this.disabled ? '-1' : '0';
    }
    /** Returns the host DOM element. */
    _getHostElement() {
        return this._elementRef.nativeElement;
    }
    /** Prevents the default element actions if it is disabled. */
    _checkDisabled(event) {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    /** Emits to the hover stream. */
    _handleMouseEnter() {
        this._hovered.next(this);
    }
    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel() {
        const clone = this._elementRef.nativeElement.cloneNode(true);
        const icons = clone.querySelectorAll('mat-icon, .material-icons');
        // Strip away icons, so they don't show up in the text.
        for (let i = 0; i < icons.length; i++) {
            icons[i].remove();
        }
        return clone.textContent?.trim() || '';
    }
    _setHighlighted(isHighlighted) {
        // We need to mark this for check for the case where the content is coming from a
        // `matMenuContent` whose change detection tree is at the declaration position,
        // not the insertion position. See #23175.
        // @breaking-change 12.0.0 Remove null check for `_changeDetectorRef`.
        this._highlighted = isHighlighted;
        this._changeDetectorRef?.markForCheck();
    }
    _setTriggersSubmenu(triggersSubmenu) {
        // @breaking-change 12.0.0 Remove null check for `_changeDetectorRef`.
        this._triggersSubmenu = triggersSubmenu;
        this._changeDetectorRef?.markForCheck();
    }
    _hasFocus() {
        return this._document && this._document.activeElement === this._getHostElement();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatMenuItem, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }, { token: i1.FocusMonitor }, { token: MAT_MENU_PANEL, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatMenuItem, isStandalone: true, selector: "[mat-menu-item]", inputs: { role: "role", disabled: ["disabled", "disabled", booleanAttribute], disableRipple: ["disableRipple", "disableRipple", booleanAttribute] }, host: { listeners: { "click": "_checkDisabled($event)", "mouseenter": "_handleMouseEnter()" }, properties: { "attr.role": "role", "class.mat-mdc-menu-item-highlighted": "_highlighted", "class.mat-mdc-menu-item-submenu-trigger": "_triggersSubmenu", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "attr.disabled": "disabled || null" }, classAttribute: "mat-mdc-menu-item mat-mdc-focus-indicator" }, exportAs: ["matMenuItem"], ngImport: i0, template: "<ng-content select=\"mat-icon, [matMenuItemIcon]\"></ng-content>\n<span class=\"mat-mdc-menu-item-text\"><ng-content></ng-content></span>\n<div class=\"mat-mdc-menu-ripple\" matRipple\n     [matRippleDisabled]=\"disableRipple || disabled\"\n     [matRippleTrigger]=\"_getHostElement()\">\n</div>\n\n@if (_triggersSubmenu) {\n     <svg\n       class=\"mat-mdc-menu-submenu-icon\"\n       viewBox=\"0 0 5 10\"\n       focusable=\"false\"\n       aria-hidden=\"true\"><polygon points=\"0,0 5,5 0,10\"/></svg>\n}\n", dependencies: [{ kind: "directive", type: MatRipple, selector: "[mat-ripple], [matRipple]", inputs: ["matRippleColor", "matRippleUnbounded", "matRippleCentered", "matRippleRadius", "matRippleAnimation", "matRippleDisabled", "matRippleTrigger"], exportAs: ["matRipple"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatMenuItem, decorators: [{
            type: Component,
            args: [{ selector: '[mat-menu-item]', exportAs: 'matMenuItem', host: {
                        '[attr.role]': 'role',
                        'class': 'mat-mdc-menu-item mat-mdc-focus-indicator',
                        '[class.mat-mdc-menu-item-highlighted]': '_highlighted',
                        '[class.mat-mdc-menu-item-submenu-trigger]': '_triggersSubmenu',
                        '[attr.tabindex]': '_getTabIndex()',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.disabled]': 'disabled || null',
                        '(click)': '_checkDisabled($event)',
                        '(mouseenter)': '_handleMouseEnter()',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, imports: [MatRipple], template: "<ng-content select=\"mat-icon, [matMenuItemIcon]\"></ng-content>\n<span class=\"mat-mdc-menu-item-text\"><ng-content></ng-content></span>\n<div class=\"mat-mdc-menu-ripple\" matRipple\n     [matRippleDisabled]=\"disableRipple || disabled\"\n     [matRippleTrigger]=\"_getHostElement()\">\n</div>\n\n@if (_triggersSubmenu) {\n     <svg\n       class=\"mat-mdc-menu-submenu-icon\"\n       viewBox=\"0 0 5 10\"\n       focusable=\"false\"\n       aria-hidden=\"true\"><polygon points=\"0,0 5,5 0,10\"/></svg>\n}\n" }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.FocusMonitor }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_MENU_PANEL]
                }, {
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }], propDecorators: { role: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvbWVudS1pdGVtLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvbWVudS1pdGVtLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUVWLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssRUFFTCxpQkFBaUIsRUFDakIsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBa0IsWUFBWSxFQUFjLE1BQU0sbUJBQW1CLENBQUM7QUFDN0UsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFlLGNBQWMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7OztBQUVqRDs7R0FFRztBQXFCSCxNQUFNLE9BQU8sV0FBVztJQTBDdEIsWUFDVSxXQUFvQyxFQUNsQixTQUFlLEVBQ2pDLGFBQTRCLEVBQ08sV0FBdUMsRUFDMUUsa0JBQXNDO1FBSnRDLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNsQixjQUFTLEdBQVQsU0FBUyxDQUFNO1FBQ2pDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQ08sZ0JBQVcsR0FBWCxXQUFXLENBQTRCO1FBQzFFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUE5Q2hELG1DQUFtQztRQUMxQixTQUFJLEdBQXNELFVBQVUsQ0FBQztRQUU5RSx5Q0FBeUM7UUFDSCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBRWhFLHFEQUFxRDtRQUNmLGtCQUFhLEdBQVksS0FB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LElBQUksY0FFekIsSUFBSSxXQUNQLENBQUMsU0FBUyxDQUFDOzswQkE4Q2pCLE1BQU07MkJBQUMsUUFBUTs7MEJBRWYsTUFBTTsyQkFBQyxjQUFjOzswQkFBRyxRQUFRO3lFQTVDMUIsSUFBSTtzQkFBWixLQUFLO2dCQUdnQyxRQUFRO3NCQUE3QyxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQUdFLGFBQWE7c0JBQWxELEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgT25EZXN0cm95LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgSW5wdXQsXG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Rm9jdXNhYmxlT3B0aW9uLCBGb2N1c01vbml0b3IsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TWF0TWVudVBhbmVsLCBNQVRfTUVOVV9QQU5FTH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWF0UmlwcGxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcblxuLyoqXG4gKiBTaW5nbGUgaXRlbSBpbnNpZGUgYSBgbWF0LW1lbnVgLiBQcm92aWRlcyB0aGUgbWVudSBpdGVtIHN0eWxpbmcgYW5kIGFjY2Vzc2liaWxpdHkgdHJlYXRtZW50LlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdbbWF0LW1lbnUtaXRlbV0nLFxuICBleHBvcnRBczogJ21hdE1lbnVJdGVtJyxcbiAgaG9zdDoge1xuICAgICdbYXR0ci5yb2xlXSc6ICdyb2xlJyxcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1tZW51LWl0ZW0gbWF0LW1kYy1mb2N1cy1pbmRpY2F0b3InLFxuICAgICdbY2xhc3MubWF0LW1kYy1tZW51LWl0ZW0taGlnaGxpZ2h0ZWRdJzogJ19oaWdobGlnaHRlZCcsXG4gICAgJ1tjbGFzcy5tYXQtbWRjLW1lbnUtaXRlbS1zdWJtZW51LXRyaWdnZXJdJzogJ190cmlnZ2Vyc1N1Ym1lbnUnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgICAnKGNsaWNrKSc6ICdfY2hlY2tEaXNhYmxlZCgkZXZlbnQpJyxcbiAgICAnKG1vdXNlZW50ZXIpJzogJ19oYW5kbGVNb3VzZUVudGVyKCknLFxuICB9LFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgdGVtcGxhdGVVcmw6ICdtZW51LWl0ZW0uaHRtbCcsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtNYXRSaXBwbGVdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRNZW51SXRlbSBpbXBsZW1lbnRzIEZvY3VzYWJsZU9wdGlvbiwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIEFSSUEgcm9sZSBmb3IgdGhlIG1lbnUgaXRlbS4gKi9cbiAgQElucHV0KCkgcm9sZTogJ21lbnVpdGVtJyB8ICdtZW51aXRlbXJhZGlvJyB8ICdtZW51aXRlbWNoZWNrYm94JyA9ICdtZW51aXRlbSc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXRlbSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHJpcHBsZXMgYXJlIGRpc2FibGVkIG9uIHRoZSBtZW51IGl0ZW0uICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZVJpcHBsZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIHRoZSBtZW51IGl0ZW0gaXMgaG92ZXJlZC4gKi9cbiAgcmVhZG9ubHkgX2hvdmVyZWQ6IFN1YmplY3Q8TWF0TWVudUl0ZW0+ID0gbmV3IFN1YmplY3Q8TWF0TWVudUl0ZW0+KCk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gdGhlIG1lbnUgaXRlbSBpcyBmb2N1c2VkLiAqL1xuICByZWFkb25seSBfZm9jdXNlZCA9IG5ldyBTdWJqZWN0PE1hdE1lbnVJdGVtPigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gaXMgaGlnaGxpZ2h0ZWQuICovXG4gIF9oaWdobGlnaHRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gYWN0cyBhcyBhIHRyaWdnZXIgZm9yIGEgc3ViLW1lbnUuICovXG4gIF90cmlnZ2Vyc1N1Ym1lbnU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBkb2N1bWVudDogYW55LFxuICAgIGZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICAgIHBhcmVudE1lbnU6IE1hdE1lbnVQYW5lbDxNYXRNZW51SXRlbT4gfCB1bmRlZmluZWQsXG4gICAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICApO1xuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBgZG9jdW1lbnRgLCBgY2hhbmdlRGV0ZWN0b3JSZWZgIGFuZCBgZm9jdXNNb25pdG9yYCB0byBiZWNvbWUgcmVxdWlyZWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTIuMC4wXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBkb2N1bWVudD86IGFueSxcbiAgICBmb2N1c01vbml0b3I/OiBGb2N1c01vbml0b3IsXG4gICAgcGFyZW50TWVudT86IE1hdE1lbnVQYW5lbDxNYXRNZW51SXRlbT4sXG4gICAgY2hhbmdlRGV0ZWN0b3JSZWY/OiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2N1bWVudD86IGFueSxcbiAgICBwcml2YXRlIF9mb2N1c01vbml0b3I/OiBGb2N1c01vbml0b3IsXG4gICAgQEluamVjdChNQVRfTUVOVV9QQU5FTCkgQE9wdGlvbmFsKCkgcHVibGljIF9wYXJlbnRNZW51PzogTWF0TWVudVBhbmVsPE1hdE1lbnVJdGVtPixcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZj86IENoYW5nZURldGVjdG9yUmVmLFxuICApIHtcbiAgICBfcGFyZW50TWVudT8uYWRkSXRlbT8uKHRoaXMpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIG1lbnUgaXRlbS4gKi9cbiAgZm9jdXMob3JpZ2luPzogRm9jdXNPcmlnaW4sIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZm9jdXNNb25pdG9yICYmIG9yaWdpbikge1xuICAgICAgdGhpcy5fZm9jdXNNb25pdG9yLmZvY3VzVmlhKHRoaXMuX2dldEhvc3RFbGVtZW50KCksIG9yaWdpbiwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2dldEhvc3RFbGVtZW50KCkuZm9jdXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdGhpcy5fZm9jdXNlZC5uZXh0KHRoaXMpO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIGlmICh0aGlzLl9mb2N1c01vbml0b3IpIHtcbiAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgdGhlIGVsZW1lbnQsIHNvIGl0IGdldHMgdGhlIGFwcHJvcHJpYXRlIGZvY3VzZWQgY2xhc3Nlcy4gV2Ugd2FudFxuICAgICAgLy8gdG8gc2hvdyB0aGUgZm9jdXMgc3R5bGUgZm9yIG1lbnUgaXRlbXMgb25seSB3aGVuIHRoZSBmb2N1cyB3YXMgbm90IGNhdXNlZCBieSBhXG4gICAgICAvLyBtb3VzZSBvciB0b3VjaCBpbnRlcmFjdGlvbi5cbiAgICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5tb25pdG9yKHRoaXMuX2VsZW1lbnRSZWYsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fZm9jdXNNb25pdG9yKSB7XG4gICAgICB0aGlzLl9mb2N1c01vbml0b3Iuc3RvcE1vbml0b3JpbmcodGhpcy5fZWxlbWVudFJlZik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcmVudE1lbnUgJiYgdGhpcy5fcGFyZW50TWVudS5yZW1vdmVJdGVtKSB7XG4gICAgICB0aGlzLl9wYXJlbnRNZW51LnJlbW92ZUl0ZW0odGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5faG92ZXJlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2ZvY3VzZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBVc2VkIHRvIHNldCB0aGUgYHRhYmluZGV4YC4gKi9cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgPyAnLTEnIDogJzAnO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGhvc3QgRE9NIGVsZW1lbnQuICovXG4gIF9nZXRIb3N0RWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgfVxuXG4gIC8qKiBQcmV2ZW50cyB0aGUgZGVmYXVsdCBlbGVtZW50IGFjdGlvbnMgaWYgaXQgaXMgZGlzYWJsZWQuICovXG4gIF9jaGVja0Rpc2FibGVkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEVtaXRzIHRvIHRoZSBob3ZlciBzdHJlYW0uICovXG4gIF9oYW5kbGVNb3VzZUVudGVyKCkge1xuICAgIHRoaXMuX2hvdmVyZWQubmV4dCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsYWJlbCB0byBiZSB1c2VkIHdoZW4gZGV0ZXJtaW5pbmcgd2hldGhlciB0aGUgb3B0aW9uIHNob3VsZCBiZSBmb2N1c2VkLiAqL1xuICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNsb25lID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBpY29ucyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoJ21hdC1pY29uLCAubWF0ZXJpYWwtaWNvbnMnKTtcblxuICAgIC8vIFN0cmlwIGF3YXkgaWNvbnMsIHNvIHRoZXkgZG9uJ3Qgc2hvdyB1cCBpbiB0aGUgdGV4dC5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGljb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpY29uc1tpXS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xvbmUudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIF9zZXRIaWdobGlnaHRlZChpc0hpZ2hsaWdodGVkOiBib29sZWFuKSB7XG4gICAgLy8gV2UgbmVlZCB0byBtYXJrIHRoaXMgZm9yIGNoZWNrIGZvciB0aGUgY2FzZSB3aGVyZSB0aGUgY29udGVudCBpcyBjb21pbmcgZnJvbSBhXG4gICAgLy8gYG1hdE1lbnVDb250ZW50YCB3aG9zZSBjaGFuZ2UgZGV0ZWN0aW9uIHRyZWUgaXMgYXQgdGhlIGRlY2xhcmF0aW9uIHBvc2l0aW9uLFxuICAgIC8vIG5vdCB0aGUgaW5zZXJ0aW9uIHBvc2l0aW9uLiBTZWUgIzIzMTc1LlxuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgMTIuMC4wIFJlbW92ZSBudWxsIGNoZWNrIGZvciBgX2NoYW5nZURldGVjdG9yUmVmYC5cbiAgICB0aGlzLl9oaWdobGlnaHRlZCA9IGlzSGlnaGxpZ2h0ZWQ7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWY/Lm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgX3NldFRyaWdnZXJzU3VibWVudSh0cmlnZ2Vyc1N1Ym1lbnU6IGJvb2xlYW4pIHtcbiAgICAvLyBAYnJlYWtpbmctY2hhbmdlIDEyLjAuMCBSZW1vdmUgbnVsbCBjaGVjayBmb3IgYF9jaGFuZ2VEZXRlY3RvclJlZmAuXG4gICAgdGhpcy5fdHJpZ2dlcnNTdWJtZW51ID0gdHJpZ2dlcnNTdWJtZW51O1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmPy5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIF9oYXNGb2N1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnQgJiYgdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5fZ2V0SG9zdEVsZW1lbnQoKTtcbiAgfVxufVxuIiwiPG5nLWNvbnRlbnQgc2VsZWN0PVwibWF0LWljb24sIFttYXRNZW51SXRlbUljb25dXCI+PC9uZy1jb250ZW50PlxuPHNwYW4gY2xhc3M9XCJtYXQtbWRjLW1lbnUtaXRlbS10ZXh0XCI+PG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50Pjwvc3Bhbj5cbjxkaXYgY2xhc3M9XCJtYXQtbWRjLW1lbnUtcmlwcGxlXCIgbWF0UmlwcGxlXG4gICAgIFttYXRSaXBwbGVEaXNhYmxlZF09XCJkaXNhYmxlUmlwcGxlIHx8IGRpc2FibGVkXCJcbiAgICAgW21hdFJpcHBsZVRyaWdnZXJdPVwiX2dldEhvc3RFbGVtZW50KClcIj5cbjwvZGl2PlxuXG5AaWYgKF90cmlnZ2Vyc1N1Ym1lbnUpIHtcbiAgICAgPHN2Z1xuICAgICAgIGNsYXNzPVwibWF0LW1kYy1tZW51LXN1Ym1lbnUtaWNvblwiXG4gICAgICAgdmlld0JveD1cIjAgMCA1IDEwXCJcbiAgICAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBvbHlnb24gcG9pbnRzPVwiMCwwIDUsNSAwLDEwXCIvPjwvc3ZnPlxufVxuIl19