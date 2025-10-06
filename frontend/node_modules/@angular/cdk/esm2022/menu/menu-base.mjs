/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ContentChildren, Directive, ElementRef, Input, NgZone, QueryList, computed, inject, signal, } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { mapTo, mergeAll, mergeMap, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MENU_AIM } from './menu-aim';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuItem } from './menu-item';
import { MENU_STACK } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';
import * as i0 from "@angular/core";
/** Counter used to create unique IDs for menus. */
let nextId = 0;
/**
 * Abstract directive that implements shared logic common to all menus.
 * This class can be extended to create custom menu types.
 */
export class CdkMenuBase extends CdkMenuGroup {
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
        this.id = `cdk-menu-${nextId++}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFjLE1BQU0sbUJBQW1CLENBQUM7QUFDL0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFFTCxlQUFlLEVBQ2YsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBQ0wsTUFBTSxFQUVOLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsVUFBVSxFQUEyQixNQUFNLGNBQWMsQ0FBQztBQUNsRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQzs7QUFFNUQsbURBQW1EO0FBQ25ELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7R0FHRztBQWVILE1BQU0sT0FBZ0IsV0FDcEIsU0FBUSxZQUFZO0lBZnRCOztRQWtCRSwwQ0FBMEM7UUFDakMsa0JBQWEsR0FBZ0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUV2RSx3QkFBd0I7UUFDZCxXQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxDLCtDQUErQztRQUN0QyxjQUFTLEdBQWMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRW5ELDhDQUE4QztRQUMzQixZQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFNUUsK0RBQStEO1FBQzVDLFFBQUcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFbEUseUNBQXlDO1FBQ2hDLE9BQUUsR0FBRyxZQUFZLE1BQU0sRUFBRSxFQUFFLENBQUM7UUFNckMsNENBQTRDO1FBQzVDLGdCQUFXLEdBQThCLFVBQVUsQ0FBQztRQUVwRDs7O1dBR0c7UUFDSCxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBS2pCLDJDQUEyQztRQUN4QixjQUFTLEdBQWtCLElBQUksT0FBTyxFQUFFLENBQUM7UUFRNUQsZ0RBQWdEO1FBQ3hDLHVCQUFrQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVuQyxvQkFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDdEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7S0FrSUo7SUFoSUMsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUNELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxjQUEyQixTQUFTO1FBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsYUFBYSxDQUFDLGNBQTJCLFNBQVM7UUFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCx1Q0FBdUM7SUFDdkMsWUFBWTtRQUNWLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNPLGFBQWEsQ0FBQyxJQUFtQixFQUFFLE9BQXdDO1FBQ25GLE1BQU0sRUFBQyxrQkFBa0IsRUFBQyxHQUFHLEVBQUMsR0FBRyxPQUFPLEVBQUMsQ0FBQztRQUMxQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDakMsSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ25DLDRGQUE0RjtZQUM1RiwrREFBK0Q7WUFDL0QsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO2dCQUN2QixJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNaLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7cUJBQU0sQ0FBQztvQkFDTixVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELDJFQUEyRTtJQUNuRSxjQUFjO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTlGLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQzVDLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssb0JBQW9CO1FBQzFCLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO2FBQ2YsSUFBSSxDQUNILFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3JCLFFBQVEsQ0FBQyxDQUFDLElBQTRCLEVBQUUsRUFBRSxDQUN4QyxJQUFJO2FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FDMUYsRUFDRCxRQUFRLEVBQUUsRUFDVixTQUFTLENBQUMsQ0FBQyxJQUFpQixFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFHLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxFQUNGLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQzFCO2FBQ0EsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCwrQ0FBK0M7SUFDdkMsMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTthQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMvQixTQUFTLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxFQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFRCxrREFBa0Q7SUFDMUMsNkJBQTZCO1FBQ25DLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSyxvQkFBb0I7UUFDMUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7SUFDSCxDQUFDO3FIQXRMbUIsV0FBVzt5R0FBWCxXQUFXLHVaQXVCZCxXQUFXOztrR0F2QlIsV0FBVztrQkFkaEMsU0FBUzttQkFBQztvQkFDVCxJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLE1BQU07d0JBQ2QsT0FBTyxFQUFFLEVBQUUsRUFBRSwrQ0FBK0M7d0JBQzVELFlBQVksRUFBRSxnQkFBZ0I7d0JBQzlCLE1BQU0sRUFBRSxJQUFJO3dCQUNaLHlCQUF5QixFQUFFLGFBQWE7d0JBQ3hDLCtCQUErQixFQUFFLGNBQWM7d0JBQy9DLFNBQVMsRUFBRSxrQkFBa0I7d0JBQzdCLFdBQVcsRUFBRSw2QkFBNkI7d0JBQzFDLFlBQVksRUFBRSw4QkFBOEI7cUJBQzdDO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs4QkFxQlUsRUFBRTtzQkFBVixLQUFLO2dCQUlHLEtBQUs7c0JBRGIsZUFBZTt1QkFBQyxXQUFXLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9jdXNLZXlNYW5hZ2VyLCBGb2N1c09yaWdpbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgUXVlcnlMaXN0LFxuICBjb21wdXRlZCxcbiAgaW5qZWN0LFxuICBzaWduYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0LCBtZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcFRvLCBtZXJnZUFsbCwgbWVyZ2VNYXAsIHN0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TUVOVV9BSU19IGZyb20gJy4vbWVudS1haW0nO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge01lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2ssIE1lbnVTdGFja0l0ZW19IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge1BvaW50ZXJGb2N1c1RyYWNrZXJ9IGZyb20gJy4vcG9pbnRlci1mb2N1cy10cmFja2VyJztcblxuLyoqIENvdW50ZXIgdXNlZCB0byBjcmVhdGUgdW5pcXVlIElEcyBmb3IgbWVudXMuICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBYnN0cmFjdCBkaXJlY3RpdmUgdGhhdCBpbXBsZW1lbnRzIHNoYXJlZCBsb2dpYyBjb21tb24gdG8gYWxsIG1lbnVzLlxuICogVGhpcyBjbGFzcyBjYW4gYmUgZXh0ZW5kZWQgdG8gY3JlYXRlIGN1c3RvbSBtZW51IHR5cGVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdjbGFzcyc6ICcnLCAvLyByZXNldCB0aGUgY3NzIGNsYXNzIGFkZGVkIGJ5IHRoZSBzdXBlci1jbGFzc1xuICAgICdbdGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgICAnW2F0dHIuZGF0YS1jZGstbWVudS1zdGFjay1pZF0nOiAnbWVudVN0YWNrLmlkJyxcbiAgICAnKGZvY3VzKSc6ICdmb2N1c0ZpcnN0SXRlbSgpJyxcbiAgICAnKGZvY3VzaW4pJzogJ21lbnVTdGFjay5zZXRIYXNGb2N1cyh0cnVlKScsXG4gICAgJyhmb2N1c291dCknOiAnbWVudVN0YWNrLnNldEhhc0ZvY3VzKGZhbHNlKScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVCYXNlXG4gIGV4dGVuZHMgQ2RrTWVudUdyb3VwXG4gIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95XG57XG4gIC8qKiBUaGUgbWVudSdzIG5hdGl2ZSBET00gaG9zdCBlbGVtZW50LiAqL1xuICByZWFkb25seSBuYXRpdmVFbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgQW5ndWxhciB6b25lLiAqL1xuICBwcm90ZWN0ZWQgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgLyoqIFRoZSBzdGFjayBvZiBtZW51cyB0aGlzIG1lbnUgYmVsb25ncyB0by4gKi9cbiAgcmVhZG9ubHkgbWVudVN0YWNrOiBNZW51U3RhY2sgPSBpbmplY3QoTUVOVV9TVEFDSyk7XG5cbiAgLyoqIFRoZSBtZW51IGFpbSBzZXJ2aWNlIHVzZWQgYnkgdGhpcyBtZW51LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWVudUFpbSA9IGluamVjdChNRU5VX0FJTSwge29wdGlvbmFsOiB0cnVlLCBzZWxmOiB0cnVlfSk7XG5cbiAgLyoqIFRoZSBkaXJlY3Rpb25hbGl0eSAodGV4dCBkaXJlY3Rpb24pIG9mIHRoZSBjdXJyZW50IHBhZ2UuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkaXIgPSBpbmplY3QoRGlyZWN0aW9uYWxpdHksIHtvcHRpb25hbDogdHJ1ZX0pO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIG1lbnUncyBob3N0IGVsZW1lbnQuICovXG4gIEBJbnB1dCgpIGlkID0gYGNkay1tZW51LSR7bmV4dElkKyt9YDtcblxuICAvKiogQWxsIGNoaWxkIE1lbnVJdGVtIGVsZW1lbnRzIG5lc3RlZCBpbiB0aGlzIE1lbnUuICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUl0ZW0sIHtkZXNjZW5kYW50czogdHJ1ZX0pXG4gIHJlYWRvbmx5IGl0ZW1zOiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uIGl0ZW1zIGluIHRoZSBtZW51IGZsb3cuICovXG4gIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgbWVudSBpcyBkaXNwbGF5ZWQgaW5saW5lIChpLmUuIGFsd2F5cyBwcmVzZW50IHZzIGEgY29uZGl0aW9uYWwgcG9wdXAgdGhhdCB0aGVcbiAgICogdXNlciB0cmlnZ2VycyB3aXRoIGEgdHJpZ2dlciBlbGVtZW50KS5cbiAgICovXG4gIGlzSW5saW5lID0gZmFsc2U7XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudS4gKi9cbiAgcHJvdGVjdGVkIGtleU1hbmFnZXI6IEZvY3VzS2V5TWFuYWdlcjxDZGtNZW51SXRlbT47XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIE1lbnVCYXIgaXMgZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogVGhlIE1lbnUgSXRlbSB3aGljaCB0cmlnZ2VyZWQgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJvdGVjdGVkIHRyaWdnZXJJdGVtPzogQ2RrTWVudUl0ZW07XG5cbiAgLyoqIFRyYWNrcyB0aGUgdXNlcnMgbW91c2UgbW92ZW1lbnRzIG92ZXIgdGhlIG1lbnUuICovXG4gIHByb3RlY3RlZCBwb2ludGVyVHJhY2tlcj86IFBvaW50ZXJGb2N1c1RyYWNrZXI8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgbWVudSdzIG1lbnUgc3RhY2sgaGFzIGZvY3VzLiAqL1xuICBwcml2YXRlIF9tZW51U3RhY2tIYXNGb2N1cyA9IHNpZ25hbChmYWxzZSk7XG5cbiAgcHJpdmF0ZSBfdGFiSW5kZXhTaWduYWwgPSBjb21wdXRlZCgoKSA9PiB7XG4gICAgY29uc3QgdGFiaW5kZXhJZklubGluZSA9IHRoaXMuX21lbnVTdGFja0hhc0ZvY3VzKCkgPyAtMSA6IDA7XG4gICAgcmV0dXJuIHRoaXMuaXNJbmxpbmUgPyB0YWJpbmRleElmSW5saW5lIDogbnVsbDtcbiAgfSk7XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICghdGhpcy5pc0lubGluZSkge1xuICAgICAgdGhpcy5tZW51U3RhY2sucHVzaCh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrSGFzRm9jdXMoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVPcGVuKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2tDbG9zZWQoKTtcbiAgICB0aGlzLl9zZXRVcFBvaW50ZXJUcmFja2VyKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmtleU1hbmFnZXI/LmRlc3Ryb3koKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnBvaW50ZXJUcmFja2VyPy5kZXN0cm95KCk7XG4gIH1cblxuICAvKipcbiAgICogUGxhY2UgZm9jdXMgb24gdGhlIGZpcnN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi5cbiAgICogQHBhcmFtIGZvY3VzT3JpZ2luIFRoZSBvcmlnaW4gaW5wdXQgbW9kZSBvZiB0aGUgZm9jdXMgZXZlbnQuXG4gICAqL1xuICBmb2N1c0ZpcnN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMua2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGFjZSBmb2N1cyBvbiB0aGUgbGFzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uXG4gICAqIEBwYXJhbSBmb2N1c09yaWdpbiBUaGUgb3JpZ2luIGlucHV0IG1vZGUgb2YgdGhlIGZvY3VzIGV2ZW50LlxuICAgKi9cbiAgZm9jdXNMYXN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMua2V5TWFuYWdlci5zZXRMYXN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRhYmluZGV4IGZvciB0aGlzIG1lbnUuICovXG4gIF9nZXRUYWJJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGFiSW5kZXhTaWduYWwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgb3BlbiBtZW51IGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBpdGVtIG9wZW5lZCB0aGUgcmVxdWVzdGVkIE1lbnVTdGFja0l0ZW0uXG4gICAqIEBwYXJhbSBtZW51IFRoZSBtZW51IHJlcXVlc3RlZCB0byBiZSBjbG9zZWQuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gY29uZmlndXJlIHRoZSBiZWhhdmlvciBvbiBjbG9zZS5cbiAgICogICAtIGBmb2N1c1BhcmVudFRyaWdnZXJgIFdoZXRoZXIgdG8gZm9jdXMgdGhlIHBhcmVudCB0cmlnZ2VyIGFmdGVyIGNsb3NpbmcgdGhlIG1lbnUuXG4gICAqL1xuICBwcm90ZWN0ZWQgY2xvc2VPcGVuTWVudShtZW51OiBNZW51U3RhY2tJdGVtLCBvcHRpb25zPzoge2ZvY3VzUGFyZW50VHJpZ2dlcj86IGJvb2xlYW59KSB7XG4gICAgY29uc3Qge2ZvY3VzUGFyZW50VHJpZ2dlcn0gPSB7Li4ub3B0aW9uc307XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy50cmlnZ2VySXRlbTtcbiAgICBpZiAobWVudSA9PT0gdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uZ2V0TWVudSgpKSB7XG4gICAgICB0cmlnZ2VyPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZSgpO1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1vdXNlZCBvdmVyIGEgc2libGluZyBpdGVtIHdlIHdhbnQgdG8gZm9jdXMgdGhlIGVsZW1lbnQgdW5kZXIgbW91c2UgZm9jdXNcbiAgICAgIC8vIG5vdCB0aGUgdHJpZ2dlciB3aGljaCBwcmV2aW91c2x5IG9wZW5lZCB0aGUgbm93IGNsb3NlZCBtZW51LlxuICAgICAgaWYgKGZvY3VzUGFyZW50VHJpZ2dlcikge1xuICAgICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSh0cmlnZ2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHVwIHRoZSBGb2N1c0tleU1hbmFnZXIgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbiBmb3IgdGhlIG1lbnUuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLml0ZW1zKS53aXRoV3JhcCgpLndpdGhUeXBlQWhlYWQoKS53aXRoSG9tZUFuZEVuZCgpO1xuXG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgdGhpcy5rZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbWVudSB0cmlnZ2VyJ3Mgb3BlbiBldmVudHMgaW4gb3JkZXIgdG8gdHJhY2sgdGhlIHRyaWdnZXIgd2hpY2ggb3BlbmVkIHRoZSBtZW51XG4gICAqIGFuZCBzdG9wIHRyYWNraW5nIGl0IHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51T3BlbigpIHtcbiAgICBjb25zdCBleGl0Q29uZGl0aW9uID0gbWVyZ2UodGhpcy5pdGVtcy5jaGFuZ2VzLCB0aGlzLmRlc3Ryb3llZCk7XG4gICAgdGhpcy5pdGVtcy5jaGFuZ2VzXG4gICAgICAucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMuaXRlbXMpLFxuICAgICAgICBtZXJnZU1hcCgobGlzdDogUXVlcnlMaXN0PENka01lbnVJdGVtPikgPT5cbiAgICAgICAgICBsaXN0XG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5oYXNNZW51KVxuICAgICAgICAgICAgLm1hcChpdGVtID0+IGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEub3BlbmVkLnBpcGUobWFwVG8oaXRlbSksIHRha2VVbnRpbChleGl0Q29uZGl0aW9uKSkpLFxuICAgICAgICApLFxuICAgICAgICBtZXJnZUFsbCgpLFxuICAgICAgICBzd2l0Y2hNYXAoKGl0ZW06IENka01lbnVJdGVtKSA9PiB7XG4gICAgICAgICAgdGhpcy50cmlnZ2VySXRlbSA9IGl0ZW07XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEuY2xvc2VkO1xuICAgICAgICB9KSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gKHRoaXMudHJpZ2dlckl0ZW0gPSB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKHtpdGVtLCBmb2N1c1BhcmVudFRyaWdnZXJ9KSA9PiB0aGlzLmNsb3NlT3Blbk1lbnUoaXRlbSwge2ZvY3VzUGFyZW50VHJpZ2dlcn0pKTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBoYXNGb2N1cyBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrSGFzRm9jdXMoKSB7XG4gICAgaWYgKHRoaXMuaXNJbmxpbmUpIHtcbiAgICAgIHRoaXMubWVudVN0YWNrLmhhc0ZvY3VzLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKGhhc0ZvY3VzID0+IHtcbiAgICAgICAgdGhpcy5fbWVudVN0YWNrSGFzRm9jdXMuc2V0KGhhc0ZvY3VzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIFBvaW50ZXJGb2N1c1RyYWNrZXIgYW5kIGVuc3VyZSB0aGF0IHdoZW4gbW91c2UgZm9jdXMgY2hhbmdlcyB0aGUga2V5IG1hbmFnZXIgaXMgdXBkYXRlZFxuICAgKiB3aXRoIHRoZSBsYXRlc3QgbWVudSBpdGVtIHVuZGVyIG1vdXNlIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0VXBQb2ludGVyVHJhY2tlcigpIHtcbiAgICBpZiAodGhpcy5tZW51QWltKSB7XG4gICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIHRoaXMucG9pbnRlclRyYWNrZXIgPSBuZXcgUG9pbnRlckZvY3VzVHJhY2tlcih0aGlzLml0ZW1zKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tZW51QWltLmluaXRpYWxpemUodGhpcywgdGhpcy5wb2ludGVyVHJhY2tlciEpO1xuICAgIH1cbiAgfVxufVxuIl19