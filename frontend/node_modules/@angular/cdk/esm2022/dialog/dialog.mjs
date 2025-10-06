/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TemplateRef, Injectable, Injector, Inject, Optional, SkipSelf, } from '@angular/core';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { of as observableOf, Subject, defer } from 'rxjs';
import { DialogRef } from './dialog-ref';
import { DialogConfig } from './dialog-config';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayRef, OverlayConfig, OverlayContainer, } from '@angular/cdk/overlay';
import { startWith } from 'rxjs/operators';
import { DEFAULT_DIALOG_CONFIG, DIALOG_DATA, DIALOG_SCROLL_STRATEGY } from './dialog-injectors';
import { CdkDialogContainer } from './dialog-container';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "./dialog-config";
/** Unique id for the created dialog. */
let uniqueId = 0;
export class Dialog {
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
                useValue: { value: config.direction, change: observableOf() },
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dialog, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: DEFAULT_DIALOG_CONFIG, optional: true }, { token: Dialog, optional: true, skipSelf: true }, { token: i1.OverlayContainer }, { token: DIALOG_SCROLL_STRATEGY }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dialog, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dialog, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i0.Injector }, { type: i2.DialogConfig, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DEFAULT_DIALOG_CONFIG]
                }] }, { type: Dialog, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1.OverlayContainer }, { type: undefined, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kaWFsb2cvZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxXQUFXLEVBQ1gsVUFBVSxFQUNWLFFBQVEsRUFJUixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsR0FFVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQW1CLGVBQWUsRUFBRSxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RixPQUFPLEVBQUMsRUFBRSxJQUFJLFlBQVksRUFBYyxPQUFPLEVBQUUsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwsT0FBTyxFQUNQLFVBQVUsRUFDVixhQUFhLEVBRWIsZ0JBQWdCLEdBQ2pCLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDLE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM5RixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQzs7OztBQUV0RCx3Q0FBd0M7QUFDeEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBR2pCLE1BQU0sT0FBTyxNQUFNO0lBT2pCLGlEQUFpRDtJQUNqRCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUM7SUFDNUYsQ0FBQztJQUVELHVEQUF1RDtJQUN2RCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUM7SUFDNUYsQ0FBQztJQVlELFlBQ1UsUUFBaUIsRUFDakIsU0FBbUIsRUFDd0IsZUFBNkIsRUFDaEQsYUFBcUIsRUFDN0MsaUJBQW1DLEVBQ1gsY0FBbUI7UUFMM0MsYUFBUSxHQUFSLFFBQVEsQ0FBUztRQUNqQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQ3dCLG9CQUFlLEdBQWYsZUFBZSxDQUFjO1FBQ2hELGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQzdDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUEvQnJDLDRCQUF1QixHQUEwQixFQUFFLENBQUM7UUFDM0MsK0JBQTBCLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUNqRCw0QkFBdUIsR0FBRyxJQUFJLE9BQU8sRUFBYSxDQUFDO1FBQzVELHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1FBYWhFOzs7V0FHRztRQUNNLG1CQUFjLEdBQXFCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FDckQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO1lBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FDekQsQ0FBQztRQVVBLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQ3hDLENBQUM7SUE2QkQsSUFBSSxDQUNGLHNCQUF5RCxFQUN6RCxNQUF5QztRQUV6QyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FHM0QsQ0FBQztRQUNGLE1BQU0sR0FBRyxFQUFDLEdBQUcsUUFBUSxFQUFFLEdBQUcsTUFBTSxFQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLGNBQWMsUUFBUSxFQUFFLEVBQUUsQ0FBQztRQUVwRCxJQUNFLE1BQU0sQ0FBQyxFQUFFO1lBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzdCLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUMvQyxDQUFDO1lBQ0QsTUFBTSxLQUFLLENBQUMsbUJBQW1CLE1BQU0sQ0FBQyxFQUFFLGlEQUFpRCxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFNUUsU0FBbUQsQ0FBQyxpQkFBaUIsR0FBRyxlQUFlLENBQUM7UUFDekYsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFdEYsb0ZBQW9GO1FBQ3BGLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFQSxJQUFJLENBQUMsV0FBaUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWpDLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRDs7O09BR0c7SUFDSCxhQUFhLENBQU8sRUFBVTtRQUM1QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsV0FBVztRQUNULDZGQUE2RjtRQUM3Riw0RkFBNEY7UUFDNUYsNkVBQTZFO1FBQzdFLGNBQWMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDcEQsd0ZBQXdGO1lBQ3hGLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgseUZBQXlGO1FBQ3pGLHlGQUF5RjtRQUN6RixxREFBcUQ7UUFDckQsY0FBYyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGlCQUFpQixDQUFPLE1BQTBCO1FBQ3hELE1BQU0sS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDO1lBQzlCLGdCQUFnQixFQUNkLE1BQU0sQ0FBQyxnQkFBZ0I7Z0JBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRTtZQUMzRSxjQUFjLEVBQUUsTUFBTSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQy9ELFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVTtZQUM3QixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDL0IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTO1lBQzNCLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUN6QixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7WUFDM0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1lBQ3pCLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztZQUMzQixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7WUFDbkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO1lBQ3JCLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekIsS0FBSyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQzdDLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGdCQUFnQixDQUN0QixPQUFtQixFQUNuQixTQUEwQixFQUMxQixNQUF3QztRQUV4QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUM7UUFDMUUsTUFBTSxTQUFTLEdBQXFCO1lBQ2xDLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFDO1lBQ3pDLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDO1lBQ3pDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFDO1NBQ3pDLENBQUM7UUFDRixJQUFJLGFBQXFDLENBQUM7UUFFMUMsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxTQUFTLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQzNDLGFBQWEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ25DLENBQUM7aUJBQU0sQ0FBQztnQkFDTixhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hELENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQztRQUNyQyxDQUFDO1FBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFlLENBQ3pDLGFBQWEsRUFDYixNQUFNLENBQUMsZ0JBQWdCLEVBQ3ZCLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLENBQUMsRUFDcEUsTUFBTSxDQUFDLHdCQUF3QixDQUNoQyxDQUFDO1FBQ0YsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVyRCxPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSyxvQkFBb0IsQ0FDMUIsc0JBQXlELEVBQ3pELFNBQTBCLEVBQzFCLGVBQWlDLEVBQ2pDLE1BQXdDO1FBRXhDLElBQUksc0JBQXNCLFlBQVksV0FBVyxFQUFFLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyRixJQUFJLE9BQU8sR0FBUSxFQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxDQUFDO1lBRXZELElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUMzQixPQUFPLEdBQUc7b0JBQ1IsR0FBRyxPQUFPO29CQUNWLEdBQUcsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLEtBQUssVUFBVTt3QkFDOUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7d0JBQzFCLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO2lCQUM1QixDQUFDO1lBQ0osQ0FBQztZQUVELGVBQWUsQ0FBQyxvQkFBb0IsQ0FDbEMsSUFBSSxjQUFjLENBQUksc0JBQXNCLEVBQUUsSUFBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FDeEUsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUYsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLHFCQUFxQixDQUN0RCxJQUFJLGVBQWUsQ0FDakIsc0JBQXNCLEVBQ3RCLE1BQU0sQ0FBQyxnQkFBZ0IsRUFDdkIsUUFBUSxFQUNSLE1BQU0sQ0FBQyx3QkFBd0IsQ0FDaEMsQ0FDRixDQUFDO1lBQ0QsU0FBNkMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO1lBQ3hFLFNBQW9DLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNoRixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNLLGVBQWUsQ0FDckIsTUFBd0MsRUFDeEMsU0FBMEIsRUFDMUIsZUFBaUMsRUFDakMsZ0JBQXNDO1FBRXRDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQztRQUMxRSxNQUFNLFNBQVMsR0FBcUI7WUFDbEMsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFDO1lBQzdDLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDO1NBQzFDLENBQUM7UUFFRixJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQixJQUFJLE9BQU8sTUFBTSxDQUFDLFNBQVMsS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDM0MsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQzFFLENBQUM7aUJBQU0sQ0FBQztnQkFDTixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFDRSxNQUFNLENBQUMsU0FBUztZQUNoQixDQUFDLENBQUMsWUFBWTtnQkFDWixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQXdCLGNBQWMsRUFBRSxJQUFJLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUNuRixDQUFDO1lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDYixPQUFPLEVBQUUsY0FBYztnQkFDdkIsUUFBUSxFQUFFLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFDO2FBQzVELENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsWUFBWSxJQUFJLGdCQUFnQixFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxpQkFBaUIsQ0FBTyxTQUEwQixFQUFFLFNBQWtCO1FBQzVFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWxELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsV0FBaUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXpELG1FQUFtRTtZQUNuRSw2REFBNkQ7WUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQzFELElBQUksYUFBYSxFQUFFLENBQUM7d0JBQ2xCLE9BQU8sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUNyRCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sT0FBTyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDekMsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRWpDLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2QsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25DLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxnRkFBZ0Y7SUFDeEUsNENBQTRDO1FBQ2xELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFFdEUsNERBQTREO1FBQzVELElBQUksZ0JBQWdCLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkMsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztZQUV6RCxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTVCLElBQ0UsT0FBTyxLQUFLLGdCQUFnQjtvQkFDNUIsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRO29CQUM3QixPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU87b0JBQzVCLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFDbEMsQ0FBQztvQkFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQzNFLE9BQU8sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDbEMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUM7SUFDaEYsQ0FBQztxSEF0V1UsTUFBTSxpRUE4QksscUJBQXFCLGdIQUdqQyxzQkFBc0I7eUhBakNyQixNQUFNLGNBRE0sTUFBTTs7a0dBQ2xCLE1BQU07a0JBRGxCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkErQjNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMscUJBQXFCOzswQkFDeEMsUUFBUTs7MEJBQUksUUFBUTs7MEJBRXBCLE1BQU07MkJBQUMsc0JBQXNCOztBQXdVbEM7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUksS0FBeUIsRUFBRSxRQUE4QjtJQUNsRixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBRXJCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNYLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBUZW1wbGF0ZVJlZixcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0b3IsXG4gIE9uRGVzdHJveSxcbiAgVHlwZSxcbiAgU3RhdGljUHJvdmlkZXIsXG4gIEluamVjdCxcbiAgT3B0aW9uYWwsXG4gIFNraXBTZWxmLFxuICBDb21wb25lbnRSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtCYXNlUG9ydGFsT3V0bGV0LCBDb21wb25lbnRQb3J0YWwsIFRlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7b2YgYXMgb2JzZXJ2YWJsZU9mLCBPYnNlcnZhYmxlLCBTdWJqZWN0LCBkZWZlcn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0RpYWxvZ1JlZn0gZnJvbSAnLi9kaWFsb2ctcmVmJztcbmltcG9ydCB7RGlhbG9nQ29uZmlnfSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50VHlwZSxcbiAgT3ZlcmxheSxcbiAgT3ZlcmxheVJlZixcbiAgT3ZlcmxheUNvbmZpZyxcbiAgU2Nyb2xsU3RyYXRlZ3ksXG4gIE92ZXJsYXlDb250YWluZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7c3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7REVGQVVMVF9ESUFMT0dfQ09ORklHLCBESUFMT0dfREFUQSwgRElBTE9HX1NDUk9MTF9TVFJBVEVHWX0gZnJvbSAnLi9kaWFsb2ctaW5qZWN0b3JzJztcbmltcG9ydCB7Q2RrRGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuXG4vKiogVW5pcXVlIGlkIGZvciB0aGUgY3JlYXRlZCBkaWFsb2cuICovXG5sZXQgdW5pcXVlSWQgPSAwO1xuXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBEaWFsb2cgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9vcGVuRGlhbG9nc0F0VGhpc0xldmVsOiBEaWFsb2dSZWY8YW55LCBhbnk+W10gPSBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSBfYWZ0ZXJBbGxDbG9zZWRBdFRoaXNMZXZlbCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2FmdGVyT3BlbmVkQXRUaGlzTGV2ZWwgPSBuZXcgU3ViamVjdDxEaWFsb2dSZWY+KCk7XG4gIHByaXZhdGUgX2FyaWFIaWRkZW5FbGVtZW50cyA9IG5ldyBNYXA8RWxlbWVudCwgc3RyaW5nIHwgbnVsbD4oKTtcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudGx5LW9wZW4gZGlhbG9ncy4gKi9cbiAgZ2V0IG9wZW5EaWFsb2dzKCk6IHJlYWRvbmx5IERpYWxvZ1JlZjxhbnksIGFueT5bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudERpYWxvZyA/IHRoaXMuX3BhcmVudERpYWxvZy5vcGVuRGlhbG9ncyA6IHRoaXMuX29wZW5EaWFsb2dzQXRUaGlzTGV2ZWw7XG4gIH1cblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIGRpYWxvZyBoYXMgYmVlbiBvcGVuZWQuICovXG4gIGdldCBhZnRlck9wZW5lZCgpOiBTdWJqZWN0PERpYWxvZ1JlZjxhbnksIGFueT4+IHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50RGlhbG9nID8gdGhpcy5fcGFyZW50RGlhbG9nLmFmdGVyT3BlbmVkIDogdGhpcy5fYWZ0ZXJPcGVuZWRBdFRoaXNMZXZlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGFsbCBvcGVuIGRpYWxvZyBoYXZlIGZpbmlzaGVkIGNsb3NpbmcuXG4gICAqIFdpbGwgZW1pdCBvbiBzdWJzY3JpYmUgaWYgdGhlcmUgYXJlIG5vIG9wZW4gZGlhbG9ncyB0byBiZWdpbiB3aXRoLlxuICAgKi9cbiAgcmVhZG9ubHkgYWZ0ZXJBbGxDbG9zZWQ6IE9ic2VydmFibGU8dm9pZD4gPSBkZWZlcigoKSA9PlxuICAgIHRoaXMub3BlbkRpYWxvZ3MubGVuZ3RoXG4gICAgICA/IHRoaXMuX2dldEFmdGVyQWxsQ2xvc2VkKClcbiAgICAgIDogdGhpcy5fZ2V0QWZ0ZXJBbGxDbG9zZWQoKS5waXBlKHN0YXJ0V2l0aCh1bmRlZmluZWQpKSxcbiAgKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERFRkFVTFRfRElBTE9HX0NPTkZJRykgcHJpdmF0ZSBfZGVmYXVsdE9wdGlvbnM6IERpYWxvZ0NvbmZpZyxcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnREaWFsb2c6IERpYWxvZyxcbiAgICBwcml2YXRlIF9vdmVybGF5Q29udGFpbmVyOiBPdmVybGF5Q29udGFpbmVyLFxuICAgIEBJbmplY3QoRElBTE9HX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcbiAgKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBzY3JvbGxTdHJhdGVneTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIHRoZSBnaXZlbiBjb21wb25lbnQuXG4gICAqIEBwYXJhbSBjb21wb25lbnQgVHlwZSBvZiB0aGUgY29tcG9uZW50IHRvIGxvYWQgaW50byB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0gY29uZmlnIEV4dHJhIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBuZXdseS1vcGVuZWQgZGlhbG9nLlxuICAgKi9cbiAgb3BlbjxSID0gdW5rbm93biwgRCA9IHVua25vd24sIEMgPSB1bmtub3duPihcbiAgICBjb21wb25lbnQ6IENvbXBvbmVudFR5cGU8Qz4sXG4gICAgY29uZmlnPzogRGlhbG9nQ29uZmlnPEQsIERpYWxvZ1JlZjxSLCBDPj4sXG4gICk6IERpYWxvZ1JlZjxSLCBDPjtcblxuICAvKipcbiAgICogT3BlbnMgYSBtb2RhbCBkaWFsb2cgY29udGFpbmluZyB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZSBUZW1wbGF0ZVJlZiB0byBpbnN0YW50aWF0ZSBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqIEBwYXJhbSBjb25maWcgRXh0cmEgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIG5ld2x5LW9wZW5lZCBkaWFsb2cuXG4gICAqL1xuICBvcGVuPFIgPSB1bmtub3duLCBEID0gdW5rbm93biwgQyA9IHVua25vd24+KFxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxDPixcbiAgICBjb25maWc/OiBEaWFsb2dDb25maWc8RCwgRGlhbG9nUmVmPFIsIEM+PixcbiAgKTogRGlhbG9nUmVmPFIsIEM+O1xuXG4gIG9wZW48UiA9IHVua25vd24sIEQgPSB1bmtub3duLCBDID0gdW5rbm93bj4oXG4gICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogQ29tcG9uZW50VHlwZTxDPiB8IFRlbXBsYXRlUmVmPEM+LFxuICAgIGNvbmZpZz86IERpYWxvZ0NvbmZpZzxELCBEaWFsb2dSZWY8UiwgQz4+LFxuICApOiBEaWFsb2dSZWY8UiwgQz47XG5cbiAgb3BlbjxSID0gdW5rbm93biwgRCA9IHVua25vd24sIEMgPSB1bmtub3duPihcbiAgICBjb21wb25lbnRPclRlbXBsYXRlUmVmOiBDb21wb25lbnRUeXBlPEM+IHwgVGVtcGxhdGVSZWY8Qz4sXG4gICAgY29uZmlnPzogRGlhbG9nQ29uZmlnPEQsIERpYWxvZ1JlZjxSLCBDPj4sXG4gICk6IERpYWxvZ1JlZjxSLCBDPiB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSAodGhpcy5fZGVmYXVsdE9wdGlvbnMgfHwgbmV3IERpYWxvZ0NvbmZpZygpKSBhcyBEaWFsb2dDb25maWc8XG4gICAgICBELFxuICAgICAgRGlhbG9nUmVmPFIsIEM+XG4gICAgPjtcbiAgICBjb25maWcgPSB7Li4uZGVmYXVsdHMsIC4uLmNvbmZpZ307XG4gICAgY29uZmlnLmlkID0gY29uZmlnLmlkIHx8IGBjZGstZGlhbG9nLSR7dW5pcXVlSWQrK31gO1xuXG4gICAgaWYgKFxuICAgICAgY29uZmlnLmlkICYmXG4gICAgICB0aGlzLmdldERpYWxvZ0J5SWQoY29uZmlnLmlkKSAmJlxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSlcbiAgICApIHtcbiAgICAgIHRocm93IEVycm9yKGBEaWFsb2cgd2l0aCBpZCBcIiR7Y29uZmlnLmlkfVwiIGV4aXN0cyBhbHJlYWR5LiBUaGUgZGlhbG9nIGlkIG11c3QgYmUgdW5pcXVlLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG92ZXJsYXlDb25maWcgPSB0aGlzLl9nZXRPdmVybGF5Q29uZmlnKGNvbmZpZyk7XG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXkuY3JlYXRlKG92ZXJsYXlDb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IG5ldyBEaWFsb2dSZWYob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dDb250YWluZXIgPSB0aGlzLl9hdHRhY2hDb250YWluZXIob3ZlcmxheVJlZiwgZGlhbG9nUmVmLCBjb25maWcpO1xuXG4gICAgKGRpYWxvZ1JlZiBhcyB7Y29udGFpbmVySW5zdGFuY2U6IEJhc2VQb3J0YWxPdXRsZXR9KS5jb250YWluZXJJbnN0YW5jZSA9IGRpYWxvZ0NvbnRhaW5lcjtcbiAgICB0aGlzLl9hdHRhY2hEaWFsb2dDb250ZW50KGNvbXBvbmVudE9yVGVtcGxhdGVSZWYsIGRpYWxvZ1JlZiwgZGlhbG9nQ29udGFpbmVyLCBjb25maWcpO1xuXG4gICAgLy8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgZGlhbG9nIHRoYXQgd2UncmUgb3BlbmluZywgaGlkZSBhbGwgdGhlIG5vbi1vdmVybGF5IGNvbnRlbnQuXG4gICAgaWYgKCF0aGlzLm9wZW5EaWFsb2dzLmxlbmd0aCkge1xuICAgICAgdGhpcy5faGlkZU5vbkRpYWxvZ0NvbnRlbnRGcm9tQXNzaXN0aXZlVGVjaG5vbG9neSgpO1xuICAgIH1cblxuICAgICh0aGlzLm9wZW5EaWFsb2dzIGFzIERpYWxvZ1JlZjxSLCBDPltdKS5wdXNoKGRpYWxvZ1JlZik7XG4gICAgZGlhbG9nUmVmLmNsb3NlZC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fcmVtb3ZlT3BlbkRpYWxvZyhkaWFsb2dSZWYsIHRydWUpKTtcbiAgICB0aGlzLmFmdGVyT3BlbmVkLm5leHQoZGlhbG9nUmVmKTtcblxuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIGFsbCBvZiB0aGUgY3VycmVudGx5LW9wZW4gZGlhbG9ncy5cbiAgICovXG4gIGNsb3NlQWxsKCk6IHZvaWQge1xuICAgIHJldmVyc2VGb3JFYWNoKHRoaXMub3BlbkRpYWxvZ3MsIGRpYWxvZyA9PiBkaWFsb2cuY2xvc2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgYW4gb3BlbiBkaWFsb2cgYnkgaXRzIGlkLlxuICAgKiBAcGFyYW0gaWQgSUQgdG8gdXNlIHdoZW4gbG9va2luZyB1cCB0aGUgZGlhbG9nLlxuICAgKi9cbiAgZ2V0RGlhbG9nQnlJZDxSLCBDPihpZDogc3RyaW5nKTogRGlhbG9nUmVmPFIsIEM+IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuRGlhbG9ncy5maW5kKGRpYWxvZyA9PiBkaWFsb2cuaWQgPT09IGlkKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIC8vIE1ha2Ugb25lIHBhc3Mgb3ZlciBhbGwgdGhlIGRpYWxvZ3MgdGhhdCBuZWVkIHRvIGJlIHVudHJhY2tlZCwgYnV0IHNob3VsZCBub3QgYmUgY2xvc2VkLiBXZVxuICAgIC8vIHdhbnQgdG8gc3RvcCB0cmFja2luZyB0aGUgb3BlbiBkaWFsb2cgZXZlbiBpZiBpdCBoYXNuJ3QgYmVlbiBjbG9zZWQsIGJlY2F1c2UgdGhlIHRyYWNraW5nXG4gICAgLy8gZGV0ZXJtaW5lcyB3aGVuIGBhcmlhLWhpZGRlbmAgaXMgcmVtb3ZlZCBmcm9tIGVsZW1lbnRzIG91dHNpZGUgdGhlIGRpYWxvZy5cbiAgICByZXZlcnNlRm9yRWFjaCh0aGlzLl9vcGVuRGlhbG9nc0F0VGhpc0xldmVsLCBkaWFsb2cgPT4ge1xuICAgICAgLy8gQ2hlY2sgZm9yIGBmYWxzZWAgc3BlY2lmaWNhbGx5IHNpbmNlIHdlIHdhbnQgYHVuZGVmaW5lZGAgdG8gYmUgaW50ZXJwcmV0ZWQgYXMgYHRydWVgLlxuICAgICAgaWYgKGRpYWxvZy5jb25maWcuY2xvc2VPbkRlc3Ryb3kgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZU9wZW5EaWFsb2coZGlhbG9nLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIGEgc2Vjb25kIHBhc3MgYW5kIGNsb3NlIHRoZSByZW1haW5pbmcgZGlhbG9ncy4gV2UgZG8gdGhpcyBzZWNvbmQgcGFzcyBpbiBvcmRlciB0b1xuICAgIC8vIGNvcnJlY3RseSBkaXNwYXRjaCB0aGUgYGFmdGVyQWxsQ2xvc2VkYCBldmVudCBpbiBjYXNlIHdlIGhhdmUgYSBtaXhlZCBhcnJheSBvZiBkaWFsb2dzXG4gICAgLy8gdGhhdCBzaG91bGQgYmUgY2xvc2VkIGFuZCBkaWFsb2dzIHRoYXQgc2hvdWxkIG5vdC5cbiAgICByZXZlcnNlRm9yRWFjaCh0aGlzLl9vcGVuRGlhbG9nc0F0VGhpc0xldmVsLCBkaWFsb2cgPT4gZGlhbG9nLmNsb3NlKCkpO1xuXG4gICAgdGhpcy5fYWZ0ZXJBbGxDbG9zZWRBdFRoaXNMZXZlbC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2FmdGVyT3BlbmVkQXRUaGlzTGV2ZWwuY29tcGxldGUoKTtcbiAgICB0aGlzLl9vcGVuRGlhbG9nc0F0VGhpc0xldmVsID0gW107XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5IGNvbmZpZyBmcm9tIGEgZGlhbG9nIGNvbmZpZy5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBvdmVybGF5IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnPEQsIFI+KGNvbmZpZzogRGlhbG9nQ29uZmlnPEQsIFI+KTogT3ZlcmxheUNvbmZpZyB7XG4gICAgY29uc3Qgc3RhdGUgPSBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OlxuICAgICAgICBjb25maWcucG9zaXRpb25TdHJhdGVneSB8fFxuICAgICAgICB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKCkuZ2xvYmFsKCkuY2VudGVySG9yaXpvbnRhbGx5KCkuY2VudGVyVmVydGljYWxseSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IGNvbmZpZy5zY3JvbGxTdHJhdGVneSB8fCB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuICAgICAgcGFuZWxDbGFzczogY29uZmlnLnBhbmVsQ2xhc3MsXG4gICAgICBoYXNCYWNrZHJvcDogY29uZmlnLmhhc0JhY2tkcm9wLFxuICAgICAgZGlyZWN0aW9uOiBjb25maWcuZGlyZWN0aW9uLFxuICAgICAgbWluV2lkdGg6IGNvbmZpZy5taW5XaWR0aCxcbiAgICAgIG1pbkhlaWdodDogY29uZmlnLm1pbkhlaWdodCxcbiAgICAgIG1heFdpZHRoOiBjb25maWcubWF4V2lkdGgsXG4gICAgICBtYXhIZWlnaHQ6IGNvbmZpZy5tYXhIZWlnaHQsXG4gICAgICB3aWR0aDogY29uZmlnLndpZHRoLFxuICAgICAgaGVpZ2h0OiBjb25maWcuaGVpZ2h0LFxuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogY29uZmlnLmNsb3NlT25OYXZpZ2F0aW9uLFxuICAgIH0pO1xuXG4gICAgaWYgKGNvbmZpZy5iYWNrZHJvcENsYXNzKSB7XG4gICAgICBzdGF0ZS5iYWNrZHJvcENsYXNzID0gY29uZmlnLmJhY2tkcm9wQ2xhc3M7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgZGlhbG9nIGNvbnRhaW5lciB0byBhIGRpYWxvZydzIGFscmVhZHktY3JlYXRlZCBvdmVybGF5LlxuICAgKiBAcGFyYW0gb3ZlcmxheSBSZWZlcmVuY2UgdG8gdGhlIGRpYWxvZydzIHVuZGVybHlpbmcgb3ZlcmxheS5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBDb21wb25lbnRSZWYgZm9yIHRoZSBhdHRhY2hlZCBjb250YWluZXIuXG4gICAqL1xuICBwcml2YXRlIF9hdHRhY2hDb250YWluZXI8UiwgRCwgQz4oXG4gICAgb3ZlcmxheTogT3ZlcmxheVJlZixcbiAgICBkaWFsb2dSZWY6IERpYWxvZ1JlZjxSLCBDPixcbiAgICBjb25maWc6IERpYWxvZ0NvbmZpZzxELCBEaWFsb2dSZWY8UiwgQz4+LFxuICApOiBCYXNlUG9ydGFsT3V0bGV0IHtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcuaW5qZWN0b3IgfHwgY29uZmlnLnZpZXdDb250YWluZXJSZWY/LmluamVjdG9yO1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICAgIHtwcm92aWRlOiBEaWFsb2dDb25maWcsIHVzZVZhbHVlOiBjb25maWd9LFxuICAgICAge3Byb3ZpZGU6IERpYWxvZ1JlZiwgdXNlVmFsdWU6IGRpYWxvZ1JlZn0sXG4gICAgICB7cHJvdmlkZTogT3ZlcmxheVJlZiwgdXNlVmFsdWU6IG92ZXJsYXl9LFxuICAgIF07XG4gICAgbGV0IGNvbnRhaW5lclR5cGU6IFR5cGU8QmFzZVBvcnRhbE91dGxldD47XG5cbiAgICBpZiAoY29uZmlnLmNvbnRhaW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBjb25maWcuY29udGFpbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnRhaW5lclR5cGUgPSBjb25maWcuY29udGFpbmVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGFpbmVyVHlwZSA9IGNvbmZpZy5jb250YWluZXIudHlwZTtcbiAgICAgICAgcHJvdmlkZXJzLnB1c2goLi4uY29uZmlnLmNvbnRhaW5lci5wcm92aWRlcnMoY29uZmlnKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lclR5cGUgPSBDZGtEaWFsb2dDb250YWluZXI7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbmVyUG9ydGFsID0gbmV3IENvbXBvbmVudFBvcnRhbChcbiAgICAgIGNvbnRhaW5lclR5cGUsXG4gICAgICBjb25maWcudmlld0NvbnRhaW5lclJlZixcbiAgICAgIEluamVjdG9yLmNyZWF0ZSh7cGFyZW50OiB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsIHByb3ZpZGVyc30pLFxuICAgICAgY29uZmlnLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICApO1xuICAgIGNvbnN0IGNvbnRhaW5lclJlZiA9IG92ZXJsYXkuYXR0YWNoKGNvbnRhaW5lclBvcnRhbCk7XG5cbiAgICByZXR1cm4gY29udGFpbmVyUmVmLmluc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSB1c2VyLXByb3ZpZGVkIGNvbXBvbmVudCB0byB0aGUgYWxyZWFkeS1jcmVhdGVkIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBjb21wb25lbnRPclRlbXBsYXRlUmVmIFRoZSB0eXBlIG9mIGNvbXBvbmVudCBiZWluZyBsb2FkZWQgaW50byB0aGUgZGlhbG9nLFxuICAgKiAgICAgb3IgYSBUZW1wbGF0ZVJlZiB0byBpbnN0YW50aWF0ZSBhcyB0aGUgY29udGVudC5cbiAgICogQHBhcmFtIGRpYWxvZ1JlZiBSZWZlcmVuY2UgdG8gdGhlIGRpYWxvZyBiZWluZyBvcGVuZWQuXG4gICAqIEBwYXJhbSBkaWFsb2dDb250YWluZXIgQ29tcG9uZW50IHRoYXQgaXMgZ29pbmcgdG8gd3JhcCB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiB1c2VkIHRvIG9wZW4gdGhlIGRpYWxvZy5cbiAgICovXG4gIHByaXZhdGUgX2F0dGFjaERpYWxvZ0NvbnRlbnQ8UiwgRCwgQz4oXG4gICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogQ29tcG9uZW50VHlwZTxDPiB8IFRlbXBsYXRlUmVmPEM+LFxuICAgIGRpYWxvZ1JlZjogRGlhbG9nUmVmPFIsIEM+LFxuICAgIGRpYWxvZ0NvbnRhaW5lcjogQmFzZVBvcnRhbE91dGxldCxcbiAgICBjb25maWc6IERpYWxvZ0NvbmZpZzxELCBEaWFsb2dSZWY8UiwgQz4+LFxuICApIHtcbiAgICBpZiAoY29tcG9uZW50T3JUZW1wbGF0ZVJlZiBpbnN0YW5jZW9mIFRlbXBsYXRlUmVmKSB7XG4gICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuX2NyZWF0ZUluamVjdG9yKGNvbmZpZywgZGlhbG9nUmVmLCBkaWFsb2dDb250YWluZXIsIHVuZGVmaW5lZCk7XG4gICAgICBsZXQgY29udGV4dDogYW55ID0geyRpbXBsaWNpdDogY29uZmlnLmRhdGEsIGRpYWxvZ1JlZn07XG5cbiAgICAgIGlmIChjb25maWcudGVtcGxhdGVDb250ZXh0KSB7XG4gICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgLi4uY29udGV4dCxcbiAgICAgICAgICAuLi4odHlwZW9mIGNvbmZpZy50ZW1wbGF0ZUNvbnRleHQgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gY29uZmlnLnRlbXBsYXRlQ29udGV4dCgpXG4gICAgICAgICAgICA6IGNvbmZpZy50ZW1wbGF0ZUNvbnRleHQpLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBkaWFsb2dDb250YWluZXIuYXR0YWNoVGVtcGxhdGVQb3J0YWwoXG4gICAgICAgIG5ldyBUZW1wbGF0ZVBvcnRhbDxDPihjb21wb25lbnRPclRlbXBsYXRlUmVmLCBudWxsISwgY29udGV4dCwgaW5qZWN0b3IpLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLl9jcmVhdGVJbmplY3Rvcihjb25maWcsIGRpYWxvZ1JlZiwgZGlhbG9nQ29udGFpbmVyLCB0aGlzLl9pbmplY3Rvcik7XG4gICAgICBjb25zdCBjb250ZW50UmVmID0gZGlhbG9nQ29udGFpbmVyLmF0dGFjaENvbXBvbmVudFBvcnRhbDxDPihcbiAgICAgICAgbmV3IENvbXBvbmVudFBvcnRhbChcbiAgICAgICAgICBjb21wb25lbnRPclRlbXBsYXRlUmVmLFxuICAgICAgICAgIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgIGluamVjdG9yLFxuICAgICAgICAgIGNvbmZpZy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgKGRpYWxvZ1JlZiBhcyB7Y29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8Qz59KS5jb21wb25lbnRSZWYgPSBjb250ZW50UmVmO1xuICAgICAgKGRpYWxvZ1JlZiBhcyB7Y29tcG9uZW50SW5zdGFuY2U6IEN9KS5jb21wb25lbnRJbnN0YW5jZSA9IGNvbnRlbnRSZWYuaW5zdGFuY2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjdXN0b20gaW5qZWN0b3IgdG8gYmUgdXNlZCBpbnNpZGUgdGhlIGRpYWxvZy4gVGhpcyBhbGxvd3MgYSBjb21wb25lbnQgbG9hZGVkIGluc2lkZVxuICAgKiBvZiBhIGRpYWxvZyB0byBjbG9zZSBpdHNlbGYgYW5kLCBvcHRpb25hbGx5LCB0byByZXR1cm4gYSB2YWx1ZS5cbiAgICogQHBhcmFtIGNvbmZpZyBDb25maWcgb2JqZWN0IHRoYXQgaXMgdXNlZCB0byBjb25zdHJ1Y3QgdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIGRpYWxvZ1JlZiBSZWZlcmVuY2UgdG8gdGhlIGRpYWxvZyBiZWluZyBvcGVuZWQuXG4gICAqIEBwYXJhbSBkaWFsb2dDb250YWluZXIgQ29tcG9uZW50IHRoYXQgaXMgZ29pbmcgdG8gd3JhcCB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqIEBwYXJhbSBmYWxsYmFja0luamVjdG9yIEluamVjdG9yIHRvIHVzZSBhcyBhIGZhbGxiYWNrIHdoZW4gYSBsb29rdXAgZmFpbHMgaW4gdGhlIGN1c3RvbVxuICAgKiBkaWFsb2cgaW5qZWN0b3IsIGlmIHRoZSB1c2VyIGRpZG4ndCBwcm92aWRlIGEgY3VzdG9tIG9uZS5cbiAgICogQHJldHVybnMgVGhlIGN1c3RvbSBpbmplY3RvciB0aGF0IGNhbiBiZSB1c2VkIGluc2lkZSB0aGUgZGlhbG9nLlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlSW5qZWN0b3I8UiwgRCwgQz4oXG4gICAgY29uZmlnOiBEaWFsb2dDb25maWc8RCwgRGlhbG9nUmVmPFIsIEM+PixcbiAgICBkaWFsb2dSZWY6IERpYWxvZ1JlZjxSLCBDPixcbiAgICBkaWFsb2dDb250YWluZXI6IEJhc2VQb3J0YWxPdXRsZXQsXG4gICAgZmFsbGJhY2tJbmplY3RvcjogSW5qZWN0b3IgfCB1bmRlZmluZWQsXG4gICk6IEluamVjdG9yIHtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcuaW5qZWN0b3IgfHwgY29uZmlnLnZpZXdDb250YWluZXJSZWY/LmluamVjdG9yO1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICAgIHtwcm92aWRlOiBESUFMT0dfREFUQSwgdXNlVmFsdWU6IGNvbmZpZy5kYXRhfSxcbiAgICAgIHtwcm92aWRlOiBEaWFsb2dSZWYsIHVzZVZhbHVlOiBkaWFsb2dSZWZ9LFxuICAgIF07XG5cbiAgICBpZiAoY29uZmlnLnByb3ZpZGVycykge1xuICAgICAgaWYgKHR5cGVvZiBjb25maWcucHJvdmlkZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb3ZpZGVycy5wdXNoKC4uLmNvbmZpZy5wcm92aWRlcnMoZGlhbG9nUmVmLCBjb25maWcsIGRpYWxvZ0NvbnRhaW5lcikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvdmlkZXJzLnB1c2goLi4uY29uZmlnLnByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgY29uZmlnLmRpcmVjdGlvbiAmJlxuICAgICAgKCF1c2VySW5qZWN0b3IgfHxcbiAgICAgICAgIXVzZXJJbmplY3Rvci5nZXQ8RGlyZWN0aW9uYWxpdHkgfCBudWxsPihEaXJlY3Rpb25hbGl0eSwgbnVsbCwge29wdGlvbmFsOiB0cnVlfSkpXG4gICAgKSB7XG4gICAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICAgIHByb3ZpZGU6IERpcmVjdGlvbmFsaXR5LFxuICAgICAgICB1c2VWYWx1ZToge3ZhbHVlOiBjb25maWcuZGlyZWN0aW9uLCBjaGFuZ2U6IG9ic2VydmFibGVPZigpfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBJbmplY3Rvci5jcmVhdGUoe3BhcmVudDogdXNlckluamVjdG9yIHx8IGZhbGxiYWNrSW5qZWN0b3IsIHByb3ZpZGVyc30pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBkaWFsb2cgZnJvbSB0aGUgYXJyYXkgb2Ygb3BlbiBkaWFsb2dzLlxuICAgKiBAcGFyYW0gZGlhbG9nUmVmIERpYWxvZyB0byBiZSByZW1vdmVkLlxuICAgKiBAcGFyYW0gZW1pdEV2ZW50IFdoZXRoZXIgdG8gZW1pdCBhbiBldmVudCBpZiB0aGlzIGlzIHRoZSBsYXN0IGRpYWxvZy5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZU9wZW5EaWFsb2c8UiwgQz4oZGlhbG9nUmVmOiBEaWFsb2dSZWY8UiwgQz4sIGVtaXRFdmVudDogYm9vbGVhbikge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5vcGVuRGlhbG9ncy5pbmRleE9mKGRpYWxvZ1JlZik7XG5cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgKHRoaXMub3BlbkRpYWxvZ3MgYXMgRGlhbG9nUmVmPFIsIEM+W10pLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgIC8vIElmIGFsbCB0aGUgZGlhbG9ncyB3ZXJlIGNsb3NlZCwgcmVtb3ZlL3Jlc3RvcmUgdGhlIGBhcmlhLWhpZGRlbmBcbiAgICAgIC8vIHRvIGEgdGhlIHNpYmxpbmdzIGFuZCBlbWl0IHRvIHRoZSBgYWZ0ZXJBbGxDbG9zZWRgIHN0cmVhbS5cbiAgICAgIGlmICghdGhpcy5vcGVuRGlhbG9ncy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fYXJpYUhpZGRlbkVsZW1lbnRzLmZvckVhY2goKHByZXZpb3VzVmFsdWUsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBpZiAocHJldmlvdXNWYWx1ZSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgcHJldmlvdXNWYWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fYXJpYUhpZGRlbkVsZW1lbnRzLmNsZWFyKCk7XG5cbiAgICAgICAgaWYgKGVtaXRFdmVudCkge1xuICAgICAgICAgIHRoaXMuX2dldEFmdGVyQWxsQ2xvc2VkKCkubmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEhpZGVzIGFsbCBvZiB0aGUgY29udGVudCB0aGF0IGlzbid0IGFuIG92ZXJsYXkgZnJvbSBhc3Npc3RpdmUgdGVjaG5vbG9neS4gKi9cbiAgcHJpdmF0ZSBfaGlkZU5vbkRpYWxvZ0NvbnRlbnRGcm9tQXNzaXN0aXZlVGVjaG5vbG9neSgpIHtcbiAgICBjb25zdCBvdmVybGF5Q29udGFpbmVyID0gdGhpcy5fb3ZlcmxheUNvbnRhaW5lci5nZXRDb250YWluZXJFbGVtZW50KCk7XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgb3ZlcmxheSBjb250YWluZXIgaXMgYXR0YWNoZWQgdG8gdGhlIERPTS5cbiAgICBpZiAob3ZlcmxheUNvbnRhaW5lci5wYXJlbnRFbGVtZW50KSB7XG4gICAgICBjb25zdCBzaWJsaW5ncyA9IG92ZXJsYXlDb250YWluZXIucGFyZW50RWxlbWVudC5jaGlsZHJlbjtcblxuICAgICAgZm9yIChsZXQgaSA9IHNpYmxpbmdzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHNpYmxpbmcgPSBzaWJsaW5nc1tpXTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgc2libGluZyAhPT0gb3ZlcmxheUNvbnRhaW5lciAmJlxuICAgICAgICAgIHNpYmxpbmcubm9kZU5hbWUgIT09ICdTQ1JJUFQnICYmXG4gICAgICAgICAgc2libGluZy5ub2RlTmFtZSAhPT0gJ1NUWUxFJyAmJlxuICAgICAgICAgICFzaWJsaW5nLmhhc0F0dHJpYnV0ZSgnYXJpYS1saXZlJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5fYXJpYUhpZGRlbkVsZW1lbnRzLnNldChzaWJsaW5nLCBzaWJsaW5nLmdldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSk7XG4gICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEFmdGVyQWxsQ2xvc2VkKCk6IFN1YmplY3Q8dm9pZD4ge1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX3BhcmVudERpYWxvZztcbiAgICByZXR1cm4gcGFyZW50ID8gcGFyZW50Ll9nZXRBZnRlckFsbENsb3NlZCgpIDogdGhpcy5fYWZ0ZXJBbGxDbG9zZWRBdFRoaXNMZXZlbDtcbiAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbGJhY2sgYWdhaW5zdCBhbGwgZWxlbWVudHMgaW4gYW4gYXJyYXkgd2hpbGUgaXRlcmF0aW5nIGluIHJldmVyc2UuXG4gKiBVc2VmdWwgaWYgdGhlIGFycmF5IGlzIGJlaW5nIG1vZGlmaWVkIGFzIGl0IGlzIGJlaW5nIGl0ZXJhdGVkLlxuICovXG5mdW5jdGlvbiByZXZlcnNlRm9yRWFjaDxUPihpdGVtczogVFtdIHwgcmVhZG9ubHkgVFtdLCBjYWxsYmFjazogKGN1cnJlbnQ6IFQpID0+IHZvaWQpIHtcbiAgbGV0IGkgPSBpdGVtcy5sZW5ndGg7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIGNhbGxiYWNrKGl0ZW1zW2ldKTtcbiAgfVxufVxuIl19