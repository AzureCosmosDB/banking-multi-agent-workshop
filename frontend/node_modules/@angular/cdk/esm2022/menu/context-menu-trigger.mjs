/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, ChangeDetectorRef, Directive, inject, Injectable, Input, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, STANDARD_DROPDOWN_BELOW_POSITIONS, } from '@angular/cdk/overlay';
import { _getEventTarget } from '@angular/cdk/platform';
import { merge, partition } from 'rxjs';
import { skip, takeUntil, skipWhile } from 'rxjs/operators';
import { MENU_STACK, MenuStack } from './menu-stack';
import { CdkMenuTriggerBase, MENU_TRIGGER } from './menu-trigger-base';
import * as i0 from "@angular/core";
/** The preferred menu positions for the context menu. */
const CONTEXT_MENU_POSITIONS = STANDARD_DROPDOWN_BELOW_POSITIONS.map(position => {
    // In cases where the first menu item in the context menu is a trigger the submenu opens on a
    // hover event. We offset the context menu 2px by default to prevent this from occurring.
    const offsetX = position.overlayX === 'start' ? 2 : -2;
    const offsetY = position.overlayY === 'top' ? 2 : -2;
    return { ...position, offsetX, offsetY };
});
/** Tracks the last open context menu trigger across the entire application. */
export class ContextMenuTracker {
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
export class CdkContextMenuTrigger extends CdkMenuTriggerBase {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvY29udGV4dC1tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsU0FBUyxFQUNULE1BQU0sRUFDTixVQUFVLEVBQ1YsS0FBSyxHQUVOLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwsT0FBTyxFQUNQLGFBQWEsRUFDYixpQ0FBaUMsR0FDbEMsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDbkQsT0FBTyxFQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDOztBQUVyRSx5REFBeUQ7QUFDekQsTUFBTSxzQkFBc0IsR0FBRyxpQ0FBaUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDOUUsNkZBQTZGO0lBQzdGLHlGQUF5RjtJQUN6RixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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ZUFBZSxFQUFFLDRCQUE0QjtxQkFDOUM7b0JBQ0QsTUFBTSxFQUFFO3dCQUNOLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBQzt3QkFDNUQsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBQzt3QkFDdkQsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBQztxQkFDdkQ7b0JBQ0QsT0FBTyxFQUFFLENBQUMsOEJBQThCLEVBQUUsOEJBQThCLENBQUM7b0JBQ3pFLFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyx1QkFBdUIsRUFBQzt3QkFDM0QsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7cUJBQzNDO2lCQUNGO3dEQWN3RSxRQUFRO3NCQUE5RSxLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBib29sZWFuQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgRGlyZWN0aXZlLFxuICBpbmplY3QsXG4gIEluamVjdGFibGUsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBTVEFOREFSRF9EUk9QRE9XTl9CRUxPV19QT1NJVElPTlMsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7X2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHttZXJnZSwgcGFydGl0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7c2tpcCwgdGFrZVVudGlsLCBza2lwV2hpbGV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TUVOVV9TVEFDSywgTWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtDZGtNZW51VHJpZ2dlckJhc2UsIE1FTlVfVFJJR0dFUn0gZnJvbSAnLi9tZW51LXRyaWdnZXItYmFzZSc7XG5cbi8qKiBUaGUgcHJlZmVycmVkIG1lbnUgcG9zaXRpb25zIGZvciB0aGUgY29udGV4dCBtZW51LiAqL1xuY29uc3QgQ09OVEVYVF9NRU5VX1BPU0lUSU9OUyA9IFNUQU5EQVJEX0RST1BET1dOX0JFTE9XX1BPU0lUSU9OUy5tYXAocG9zaXRpb24gPT4ge1xuICAvLyBJbiBjYXNlcyB3aGVyZSB0aGUgZmlyc3QgbWVudSBpdGVtIGluIHRoZSBjb250ZXh0IG1lbnUgaXMgYSB0cmlnZ2VyIHRoZSBzdWJtZW51IG9wZW5zIG9uIGFcbiAgLy8gaG92ZXIgZXZlbnQuIFdlIG9mZnNldCB0aGUgY29udGV4dCBtZW51IDJweCBieSBkZWZhdWx0IHRvIHByZXZlbnQgdGhpcyBmcm9tIG9jY3VycmluZy5cbiAgY29uc3Qgb2Zmc2V0WCA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnID8gMiA6IC0yO1xuICBjb25zdCBvZmZzZXRZID0gcG9zaXRpb24ub3ZlcmxheVkgPT09ICd0b3AnID8gMiA6IC0yO1xuICByZXR1cm4gey4uLnBvc2l0aW9uLCBvZmZzZXRYLCBvZmZzZXRZfTtcbn0pO1xuXG4vKiogVHJhY2tzIHRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIgYWNyb3NzIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudVRyYWNrZXIge1xuICAvKiogVGhlIGxhc3Qgb3BlbiBjb250ZXh0IG1lbnUgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX29wZW5Db250ZXh0TWVudVRyaWdnZXI/OiBDZGtDb250ZXh0TWVudVRyaWdnZXI7XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBwcmV2aW91cyBvcGVuIGNvbnRleHQgbWVudSBhbmQgc2V0IHRoZSBnaXZlbiBvbmUgYXMgYmVpbmcgb3Blbi5cbiAgICogQHBhcmFtIHRyaWdnZXIgVGhlIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50bHkgb3BlbiBDb250ZXh0IE1lbnUuXG4gICAqL1xuICB1cGRhdGUodHJpZ2dlcjogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyKSB7XG4gICAgaWYgKENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciAhPT0gdHJpZ2dlcikge1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPy5jbG9zZSgpO1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFRoZSBjb29yZGluYXRlcyB3aGVyZSB0aGUgY29udGV4dCBtZW51IHNob3VsZCBvcGVuLiAqL1xuZXhwb3J0IHR5cGUgQ29udGV4dE1lbnVDb29yZGluYXRlcyA9IHt4OiBudW1iZXI7IHk6IG51bWJlcn07XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCBvcGVucyBhIG1lbnUgd2hlbiBhIHVzZXIgcmlnaHQtY2xpY2tzIHdpdGhpbiBpdHMgaG9zdCBlbGVtZW50LlxuICogSXQgaXMgYXdhcmUgb2YgbmVzdGVkIGNvbnRleHQgbWVudXMgYW5kIHdpbGwgdHJpZ2dlciBvbmx5IHRoZSBsb3dlc3QgbGV2ZWwgbm9uLWRpc2FibGVkIGNvbnRleHQgbWVudS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcl0nLFxuICBleHBvcnRBczogJ2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcicsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAnW2F0dHIuZGF0YS1jZGstbWVudS1zdGFjay1pZF0nOiAnbnVsbCcsXG4gICAgJyhjb250ZXh0bWVudSknOiAnX29wZW5PbkNvbnRleHRNZW51KCRldmVudCknLFxuICB9LFxuICBpbnB1dHM6IFtcbiAgICB7bmFtZTogJ21lbnVUZW1wbGF0ZVJlZicsIGFsaWFzOiAnY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJ30sXG4gICAge25hbWU6ICdtZW51UG9zaXRpb24nLCBhbGlhczogJ2Nka0NvbnRleHRNZW51UG9zaXRpb24nfSxcbiAgICB7bmFtZTogJ21lbnVEYXRhJywgYWxpYXM6ICdjZGtDb250ZXh0TWVudVRyaWdnZXJEYXRhJ30sXG4gIF0sXG4gIG91dHB1dHM6IFsnb3BlbmVkOiBjZGtDb250ZXh0TWVudU9wZW5lZCcsICdjbG9zZWQ6IGNka0NvbnRleHRNZW51Q2xvc2VkJ10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBNRU5VX1RSSUdHRVIsIHVzZUV4aXN0aW5nOiBDZGtDb250ZXh0TWVudVRyaWdnZXJ9LFxuICAgIHtwcm92aWRlOiBNRU5VX1NUQUNLLCB1c2VDbGFzczogTWVudVN0YWNrfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29udGV4dE1lbnVUcmlnZ2VyIGV4dGVuZHMgQ2RrTWVudVRyaWdnZXJCYXNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBDREsgb3ZlcmxheSBzZXJ2aWNlLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5ID0gaW5qZWN0KE92ZXJsYXkpO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5ID0gaW5qZWN0KERpcmVjdGlvbmFsaXR5LCB7b3B0aW9uYWw6IHRydWV9KTtcblxuICAvKiogVGhlIGFwcCdzIGNvbnRleHQgbWVudSB0cmFja2luZyByZWdpc3RyeSAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZXh0TWVudVRyYWNrZXIgPSBpbmplY3QoQ29udGV4dE1lbnVUcmFja2VyKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9jaGFuZ2VEZXRlY3RvclJlZiA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbnRleHQgbWVudSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHthbGlhczogJ2Nka0NvbnRleHRNZW51RGlzYWJsZWQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2V0TWVudVN0YWNrQ2xvc2VMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHdoZXJlIHRvIG9wZW4gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgb3Blbihjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIHRoaXMuX29wZW4obnVsbCwgY29vcmRpbmF0ZXMpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIENsb3NlIHRoZSBjdXJyZW50bHkgb3BlbmVkIGNvbnRleHQgbWVudS4gKi9cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5tZW51U3RhY2suY2xvc2VBbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIHRoZSBjb250ZXh0IG1lbnUgYW5kIGNsb3NlcyBhbnkgcHJldmlvdXNseSBvcGVuIG1lbnVzLlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIG1vdXNlIGV2ZW50IHdoaWNoIG9wZW5zIHRoZSBjb250ZXh0IG1lbnUuXG4gICAqL1xuICBfb3Blbk9uQ29udGV4dE1lbnUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIC8vIFByZXZlbnQgdGhlIG5hdGl2ZSBjb250ZXh0IG1lbnUgZnJvbSBvcGVuaW5nIGJlY2F1c2Ugd2UncmUgb3BlbmluZyBhIGN1c3RvbSBvbmUuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvLyBTdG9wIGV2ZW50IHByb3BhZ2F0aW9uIHRvIGVuc3VyZSB0aGF0IG9ubHkgdGhlIGNsb3Nlc3QgZW5hYmxlZCBjb250ZXh0IG1lbnUgb3BlbnMuXG4gICAgICAvLyBPdGhlcndpc2UsIGFueSBjb250ZXh0IG1lbnVzIGF0dGFjaGVkIHRvIGNvbnRhaW5pbmcgZWxlbWVudHMgd291bGQgKmFsc28qIG9wZW4sXG4gICAgICAvLyByZXN1bHRpbmcgaW4gbXVsdGlwbGUgc3RhY2tlZCBjb250ZXh0IG1lbnVzIGJlaW5nIGRpc3BsYXllZC5cbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB0aGlzLl9jb250ZXh0TWVudVRyYWNrZXIudXBkYXRlKHRoaXMpO1xuICAgICAgdGhpcy5fb3BlbihldmVudCwge3g6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFl9KTtcblxuICAgICAgLy8gQSBjb250ZXh0IG1lbnUgY2FuIGJlIHRyaWdnZXJlZCB2aWEgYSBtb3VzZSByaWdodCBjbGljayBvciBhIGtleWJvYXJkIHNob3J0Y3V0LlxuICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikge1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ21vdXNlJyk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ3Byb2dyYW0nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgb3ZlcmxheS5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHRoZSBsb2NhdGlvbiB0byBwbGFjZSB0aGUgb3BlbmVkIG1lbnVcbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoY29vcmRpbmF0ZXM6IENvbnRleHRNZW51Q29vcmRpbmF0ZXMpIHtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koY29vcmRpbmF0ZXMpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMubWVudVNjcm9sbFN0cmF0ZWd5KCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5IHx8IHVuZGVmaW5lZCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGZvciB0aGUgb3ZlcmxheSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdG8gcGxhY2UgdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShcbiAgICBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcyxcbiAgKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVxuICAgICAgLnBvc2l0aW9uKClcbiAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKGNvb3JkaW5hdGVzKVxuICAgICAgLndpdGhMb2NrZWRQb3NpdGlvbigpXG4gICAgICAud2l0aEdyb3dBZnRlck9wZW4oKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5tZW51UG9zaXRpb24gPz8gQ09OVEVYVF9NRU5VX1BPU0lUSU9OUyk7XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBtZW51IHN0YWNrIGNsb3NlIGV2ZW50cyBhbmQgY2xvc2UgdGhpcyBtZW51IHdoZW4gcmVxdWVzdGVkLiAqL1xuICBwcml2YXRlIF9zZXRNZW51U3RhY2tDbG9zZUxpc3RlbmVyKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlZC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoe2l0ZW19KSA9PiB7XG4gICAgICBpZiAoaXRlbSA9PT0gdGhpcy5jaGlsZE1lbnUgJiYgdGhpcy5pc09wZW4oKSkge1xuICAgICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBvdmVybGF5cyBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIHN0cmVhbSBhbmQgaGFuZGxlIGNsb3Npbmcgb3V0IHRoZSBzdGFjayBpZiBhXG4gICAqIGNsaWNrIG9jY3VycyBvdXRzaWRlIHRoZSBtZW51cy5cbiAgICogQHBhcmFtIHVzZXJFdmVudCBVc2VyLWdlbmVyYXRlZCBldmVudCB0aGF0IG9wZW5lZCB0aGUgbWVudS5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcyh1c2VyRXZlbnQ6IE1vdXNlRXZlbnQgfCBudWxsKSB7XG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgbGV0IG91dHNpZGVDbGlja3MgPSB0aGlzLm92ZXJsYXlSZWYub3V0c2lkZVBvaW50ZXJFdmVudHMoKTtcblxuICAgICAgaWYgKHVzZXJFdmVudCkge1xuICAgICAgICBjb25zdCBbYXV4Q2xpY2tzLCBub25BdXhDbGlja3NdID0gcGFydGl0aW9uKG91dHNpZGVDbGlja3MsICh7dHlwZX0pID0+IHR5cGUgPT09ICdhdXhjbGljaycpO1xuICAgICAgICBvdXRzaWRlQ2xpY2tzID0gbWVyZ2UoXG4gICAgICAgICAgLy8gVXNpbmcgYSBtb3VzZSwgdGhlIGBjb250ZXh0bWVudWAgZXZlbnQgY2FuIGZpcmUgZWl0aGVyIHdoZW4gcHJlc3NpbmcgdGhlIHJpZ2h0IGJ1dHRvblxuICAgICAgICAgIC8vIG9yIGxlZnQgYnV0dG9uICsgY29udHJvbC4gTW9zdCBicm93c2VycyB3b24ndCBkaXNwYXRjaCBhIGBjbGlja2AgZXZlbnQgcmlnaHQgYWZ0ZXJcbiAgICAgICAgICAvLyBhIGBjb250ZXh0bWVudWAgZXZlbnQgdHJpZ2dlcmVkIGJ5IGxlZnQgYnV0dG9uICsgY29udHJvbCwgYnV0IFNhZmFyaSB3aWxsIChzZWUgIzI3ODMyKS5cbiAgICAgICAgICAvLyBUaGlzIGNsb3NlcyB0aGUgbWVudSBpbW1lZGlhdGVseS4gVG8gd29yayBhcm91bmQgaXQsIHdlIGNoZWNrIHRoYXQgYm90aCB0aGUgdHJpZ2dlcmluZ1xuICAgICAgICAgIC8vIGV2ZW50IGFuZCB0aGUgY3VycmVudCBvdXRzaWRlIGNsaWNrIGV2ZW50IGJvdGggaGFkIHRoZSBjb250cm9sIGtleSBwcmVzc2VkLCBhbmQgdGhhdFxuICAgICAgICAgIC8vIHRoYXQgdGhpcyBpcyB0aGUgZmlyc3Qgb3V0c2lkZSBjbGljayBldmVudC5cbiAgICAgICAgICBub25BdXhDbGlja3MucGlwZShcbiAgICAgICAgICAgIHNraXBXaGlsZSgoZXZlbnQsIGluZGV4KSA9PiB1c2VyRXZlbnQuY3RybEtleSAmJiBpbmRleCA9PT0gMCAmJiBldmVudC5jdHJsS2V5KSxcbiAgICAgICAgICApLFxuXG4gICAgICAgICAgLy8gSWYgdGhlIG1lbnUgd2FzIHRyaWdnZXJlZCBieSB0aGUgYGNvbnRleHRtZW51YCBldmVudCwgc2tpcCB0aGUgZmlyc3QgYGF1eGNsaWNrYCBldmVudFxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQgZmlyZXMgd2hlbiB0aGUgbW91c2UgaXMgcmVsZWFzZWQgb24gdGhlIHNhbWUgY2xpY2sgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAgICAgICAgYXV4Q2xpY2tzLnBpcGUoc2tpcCgxKSksXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIG91dHNpZGVDbGlja3MucGlwZSh0YWtlVW50aWwodGhpcy5zdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyKSkuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRWxlbWVudEluc2lkZU1lbnVTdGFjayhfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpISkpIHtcbiAgICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbiB0aGUgYXR0YWNoZWQgbWVudSBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgKiBAcGFyYW0gdXNlckV2ZW50IFVzZXItZ2VuZXJhdGVkIGV2ZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51XG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB3aGVyZSB0byBvcGVuIHRoZSBjb250ZXh0IG1lbnVcbiAgICovXG4gIHByaXZhdGUgX29wZW4odXNlckV2ZW50OiBNb3VzZUV2ZW50IHwgbnVsbCwgY29vcmRpbmF0ZXM6IENvbnRleHRNZW51Q29vcmRpbmF0ZXMpIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgLy8gc2luY2Ugd2UncmUgbW92aW5nIHRoaXMgbWVudSB3ZSBuZWVkIHRvIGNsb3NlIGFueSBzdWJtZW51cyBmaXJzdCBvdGhlcndpc2UgdGhleSBlbmQgdXBcbiAgICAgIC8vIGRpc2Nvbm5lY3RlZCBmcm9tIHRoaXMgb25lLlxuICAgICAgdGhpcy5tZW51U3RhY2suY2xvc2VTdWJNZW51T2YodGhpcy5jaGlsZE1lbnUhKTtcblxuICAgICAgKFxuICAgICAgICB0aGlzLm92ZXJsYXlSZWYhLmdldENvbmZpZygpLnBvc2l0aW9uU3RyYXRlZ3kgYXMgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5XG4gICAgICApLnNldE9yaWdpbihjb29yZGluYXRlcyk7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAoXG4gICAgICAgICAgdGhpcy5vdmVybGF5UmVmLmdldENvbmZpZygpLnBvc2l0aW9uU3RyYXRlZ3kgYXMgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5XG4gICAgICAgICkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub3ZlcmxheVJlZi5hdHRhY2godGhpcy5nZXRNZW51Q29udGVudFBvcnRhbCgpKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcyh1c2VyRXZlbnQpO1xuICAgIH1cbiAgfVxufVxuIl19