/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ChangeDetectionStrategy, Component, EnvironmentInjector, Inject, Injectable, NgZone, ViewEncapsulation, createComponent, inject, signal, } from '@angular/core';
import { Observable, Subject, merge } from 'rxjs';
import * as i0 from "@angular/core";
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true,
});
/** Keeps track of the apps currently containing drag items. */
const activeApps = new Set();
/**
 * Component used to load the drag&drop reset styles.
 * @docs-private
 */
export class _ResetsLoader {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _ResetsLoader, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: _ResetsLoader, isStandalone: true, selector: "ng-component", host: { attributes: { "cdk-drag-resets-container": "" } }, ngImport: i0, template: '', isInline: true, styles: ["@layer cdk-resets{.cdk-drag-preview{background:none;border:none;padding:0;color:inherit;inset:auto}}.cdk-drag-placeholder *,.cdk-drag-preview *{pointer-events:none !important}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _ResetsLoader, decorators: [{
            type: Component,
            args: [{ standalone: true, encapsulation: ViewEncapsulation.None, template: '', changeDetection: ChangeDetectionStrategy.OnPush, host: { 'cdk-drag-resets-container': '' }, styles: ["@layer cdk-resets{.cdk-drag-preview{background:none;border:none;padding:0;color:inherit;inset:auto}}.cdk-drag-placeholder *,.cdk-drag-preview *{pointer-events:none !important}"] }]
        }] });
// TODO(crisbeto): remove generics when making breaking changes.
/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * @docs-private
 */
export class DragDropRegistry {
    constructor(_ngZone, _document) {
        this._ngZone = _ngZone;
        this._appRef = inject(ApplicationRef);
        this._environmentInjector = inject(EnvironmentInjector);
        /** Registered drop container instances. */
        this._dropInstances = new Set();
        /** Registered drag item instances. */
        this._dragInstances = new Set();
        /** Drag item instances that are currently being dragged. */
        this._activeDragInstances = signal([]);
        /** Keeps track of the event listeners that we've bound to the `document`. */
        this._globalListeners = new Map();
        /**
         * Predicate function to check if an item is being dragged.  Moved out into a property,
         * because it'll be called a lot and we don't want to create a new function every time.
         */
        this._draggingPredicate = (item) => item.isDragging();
        /**
         * Emits the `touchmove` or `mousemove` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerMove = new Subject();
        /**
         * Emits the `touchend` or `mouseup` events that are dispatched
         * while the user is dragging a drag item instance.
         */
        this.pointerUp = new Subject();
        /**
         * Emits when the viewport has been scrolled while the user is dragging an item.
         * @deprecated To be turned into a private member. Use the `scrolled` method instead.
         * @breaking-change 13.0.0
         */
        this.scroll = new Subject();
        /**
         * Event listener that will prevent the default browser action while the user is dragging.
         * @param event Event whose default action should be prevented.
         */
        this._preventDefaultWhileDragging = (event) => {
            if (this._activeDragInstances().length > 0) {
                event.preventDefault();
            }
        };
        /** Event listener for `touchmove` that is bound even if no dragging is happening. */
        this._persistentTouchmoveListener = (event) => {
            if (this._activeDragInstances().length > 0) {
                // Note that we only want to prevent the default action after dragging has actually started.
                // Usually this is the same time at which the item is added to the `_activeDragInstances`,
                // but it could be pushed back if the user has set up a drag delay or threshold.
                if (this._activeDragInstances().some(this._draggingPredicate)) {
                    event.preventDefault();
                }
                this.pointerMove.next(event);
            }
        };
        this._document = _document;
    }
    /** Adds a drop container to the registry. */
    registerDropContainer(drop) {
        if (!this._dropInstances.has(drop)) {
            this._dropInstances.add(drop);
        }
    }
    /** Adds a drag item instance to the registry. */
    registerDragItem(drag) {
        this._dragInstances.add(drag);
        // The `touchmove` event gets bound once, ahead of time, because WebKit
        // won't preventDefault on a dynamically-added `touchmove` listener.
        // See https://bugs.webkit.org/show_bug.cgi?id=184250.
        if (this._dragInstances.size === 1) {
            this._ngZone.runOutsideAngular(() => {
                // The event handler has to be explicitly active,
                // because newer browsers make it passive by default.
                this._document.addEventListener('touchmove', this._persistentTouchmoveListener, activeCapturingEventOptions);
            });
        }
    }
    /** Removes a drop container from the registry. */
    removeDropContainer(drop) {
        this._dropInstances.delete(drop);
    }
    /** Removes a drag item instance from the registry. */
    removeDragItem(drag) {
        this._dragInstances.delete(drag);
        this.stopDragging(drag);
        if (this._dragInstances.size === 0) {
            this._document.removeEventListener('touchmove', this._persistentTouchmoveListener, activeCapturingEventOptions);
        }
    }
    /**
     * Starts the dragging sequence for a drag instance.
     * @param drag Drag instance which is being dragged.
     * @param event Event that initiated the dragging.
     */
    startDragging(drag, event) {
        // Do not process the same drag twice to avoid memory leaks and redundant listeners
        if (this._activeDragInstances().indexOf(drag) > -1) {
            return;
        }
        this._loadResets();
        this._activeDragInstances.update(instances => [...instances, drag]);
        if (this._activeDragInstances().length === 1) {
            const isTouchEvent = event.type.startsWith('touch');
            // We explicitly bind __active__ listeners here, because newer browsers will default to
            // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
            // use `preventDefault` to prevent the page from scrolling while the user is dragging.
            this._globalListeners
                .set(isTouchEvent ? 'touchend' : 'mouseup', {
                handler: (e) => this.pointerUp.next(e),
                options: true,
            })
                .set('scroll', {
                handler: (e) => this.scroll.next(e),
                // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
                // the document. See https://github.com/angular/components/issues/17144.
                options: true,
            })
                // Preventing the default action on `mousemove` isn't enough to disable text selection
                // on Safari so we need to prevent the selection event as well. Alternatively this can
                // be done by setting `user-select: none` on the `body`, however it has causes a style
                // recalculation which can be expensive on pages with a lot of elements.
                .set('selectstart', {
                handler: this._preventDefaultWhileDragging,
                options: activeCapturingEventOptions,
            });
            // We don't have to bind a move event for touch drag sequences, because
            // we already have a persistent global one bound from `registerDragItem`.
            if (!isTouchEvent) {
                this._globalListeners.set('mousemove', {
                    handler: (e) => this.pointerMove.next(e),
                    options: activeCapturingEventOptions,
                });
            }
            this._ngZone.runOutsideAngular(() => {
                this._globalListeners.forEach((config, name) => {
                    this._document.addEventListener(name, config.handler, config.options);
                });
            });
        }
    }
    /** Stops dragging a drag item instance. */
    stopDragging(drag) {
        this._activeDragInstances.update(instances => {
            const index = instances.indexOf(drag);
            if (index > -1) {
                instances.splice(index, 1);
                return [...instances];
            }
            return instances;
        });
        if (this._activeDragInstances().length === 0) {
            this._clearGlobalListeners();
        }
    }
    /** Gets whether a drag item instance is currently being dragged. */
    isDragging(drag) {
        return this._activeDragInstances().indexOf(drag) > -1;
    }
    /**
     * Gets a stream that will emit when any element on the page is scrolled while an item is being
     * dragged.
     * @param shadowRoot Optional shadow root that the current dragging sequence started from.
     *   Top-level listeners won't pick up events coming from the shadow DOM so this parameter can
     *   be used to include an additional top-level listener at the shadow root level.
     */
    scrolled(shadowRoot) {
        const streams = [this.scroll];
        if (shadowRoot && shadowRoot !== this._document) {
            // Note that this is basically the same as `fromEvent` from rxjs, but we do it ourselves,
            // because we want to guarantee that the event is bound outside of the `NgZone`. With
            // `fromEvent` it'll only happen if the subscription is outside the `NgZone`.
            streams.push(new Observable((observer) => {
                return this._ngZone.runOutsideAngular(() => {
                    const eventOptions = true;
                    const callback = (event) => {
                        if (this._activeDragInstances().length) {
                            observer.next(event);
                        }
                    };
                    shadowRoot.addEventListener('scroll', callback, eventOptions);
                    return () => {
                        shadowRoot.removeEventListener('scroll', callback, eventOptions);
                    };
                });
            }));
        }
        return merge(...streams);
    }
    ngOnDestroy() {
        this._dragInstances.forEach(instance => this.removeDragItem(instance));
        this._dropInstances.forEach(instance => this.removeDropContainer(instance));
        this._clearGlobalListeners();
        this.pointerMove.complete();
        this.pointerUp.complete();
    }
    /** Clears out the global event listeners from the `document`. */
    _clearGlobalListeners() {
        this._globalListeners.forEach((config, name) => {
            this._document.removeEventListener(name, config.handler, config.options);
        });
        this._globalListeners.clear();
    }
    // TODO(crisbeto): abstract this away into something reusable.
    /** Loads the CSS resets needed for the module to work correctly. */
    _loadResets() {
        if (!activeApps.has(this._appRef)) {
            activeApps.add(this._appRef);
            const componentRef = createComponent(_ResetsLoader, {
                environmentInjector: this._environmentInjector,
            });
            this._appRef.onDestroy(() => {
                activeApps.delete(this._appRef);
                if (activeApps.size === 0) {
                    componentRef.destroy();
                }
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropRegistry, deps: [{ token: i0.NgZone }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropRegistry, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: DragDropRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZHJhZy1kcm9wLXJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQywrQkFBK0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsY0FBYyxFQUNkLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLE1BQU0sRUFDTixVQUFVLEVBQ1YsTUFBTSxFQUVOLGlCQUFpQixFQUVqQixlQUFlLEVBQ2YsTUFBTSxFQUNOLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsVUFBVSxFQUFZLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBSTFELHlFQUF5RTtBQUN6RSxNQUFNLDJCQUEyQixHQUFHLCtCQUErQixDQUFDO0lBQ2xFLE9BQU8sRUFBRSxLQUFLO0lBQ2QsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUM7QUFFSCwrREFBK0Q7QUFDL0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7QUFFN0M7OztHQUdHO0FBU0gsTUFBTSxPQUFPLGFBQWE7cUhBQWIsYUFBYTt5R0FBYixhQUFhLG1JQUpkLEVBQUU7O2tHQUlELGFBQWE7a0JBUnpCLFNBQVM7aUNBQ0ksSUFBSSxpQkFFRCxpQkFBaUIsQ0FBQyxJQUFJLFlBQzNCLEVBQUUsbUJBQ0ssdUJBQXVCLENBQUMsTUFBTSxRQUN6QyxFQUFDLDJCQUEyQixFQUFFLEVBQUUsRUFBQzs7QUFJekMsZ0VBQWdFO0FBQ2hFOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBZ0QzQixZQUNVLE9BQWUsRUFDTCxTQUFjO1FBRHhC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QUMsT0FBTyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELDhEQUE4RDtJQUM5RCxvRUFBb0U7SUFDNUQsV0FBVztRQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNsQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU3QixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsYUFBYSxFQUFFO2dCQUNsRCxtQkFBbUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CO2FBQy9DLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDMUIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDMUIsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN6QixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztxSEFsUlUsZ0JBQWdCLHdDQWtEakIsUUFBUTt5SEFsRFAsZ0JBQWdCLGNBREosTUFBTTs7a0dBQ2xCLGdCQUFnQjtrQkFENUIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQW1EM0IsTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBcHBsaWNhdGlvblJlZixcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRW52aXJvbm1lbnRJbmplY3RvcixcbiAgSW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIFdyaXRhYmxlU2lnbmFsLFxuICBjcmVhdGVDb21wb25lbnQsXG4gIGluamVjdCxcbiAgc2lnbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIFN1YmplY3QsIG1lcmdlfSBmcm9tICdyeGpzJztcbmltcG9ydCB0eXBlIHtEcm9wTGlzdFJlZn0gZnJvbSAnLi9kcm9wLWxpc3QtcmVmJztcbmltcG9ydCB0eXBlIHtEcmFnUmVmfSBmcm9tICcuL2RyYWctcmVmJztcblxuLyoqIEV2ZW50IG9wdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0byBiaW5kIGFuIGFjdGl2ZSwgY2FwdHVyaW5nIGV2ZW50LiAqL1xuY29uc3QgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7XG4gIHBhc3NpdmU6IGZhbHNlLFxuICBjYXB0dXJlOiB0cnVlLFxufSk7XG5cbi8qKiBLZWVwcyB0cmFjayBvZiB0aGUgYXBwcyBjdXJyZW50bHkgY29udGFpbmluZyBkcmFnIGl0ZW1zLiAqL1xuY29uc3QgYWN0aXZlQXBwcyA9IG5ldyBTZXQ8QXBwbGljYXRpb25SZWY+KCk7XG5cbi8qKlxuICogQ29tcG9uZW50IHVzZWQgdG8gbG9hZCB0aGUgZHJhZyZkcm9wIHJlc2V0IHN0eWxlcy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHN0eWxlVXJsOiAncmVzZXRzLmNzcycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHRlbXBsYXRlOiAnJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGhvc3Q6IHsnY2RrLWRyYWctcmVzZXRzLWNvbnRhaW5lcic6ICcnfSxcbn0pXG5leHBvcnQgY2xhc3MgX1Jlc2V0c0xvYWRlciB7fVxuXG4vLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIGdlbmVyaWNzIHdoZW4gbWFraW5nIGJyZWFraW5nIGNoYW5nZXMuXG4vKipcbiAqIFNlcnZpY2UgdGhhdCBrZWVwcyB0cmFjayBvZiBhbGwgdGhlIGRyYWcgaXRlbSBhbmQgZHJvcCBjb250YWluZXJcbiAqIGluc3RhbmNlcywgYW5kIG1hbmFnZXMgZ2xvYmFsIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgYGRvY3VtZW50YC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRHJhZ0Ryb3BSZWdpc3RyeTxfID0gdW5rbm93biwgX18gPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJpdmF0ZSBfYXBwUmVmID0gaW5qZWN0KEFwcGxpY2F0aW9uUmVmKTtcbiAgcHJpdmF0ZSBfZW52aXJvbm1lbnRJbmplY3RvciA9IGluamVjdChFbnZpcm9ubWVudEluamVjdG9yKTtcblxuICAvKiogUmVnaXN0ZXJlZCBkcm9wIGNvbnRhaW5lciBpbnN0YW5jZXMuICovXG4gIHByaXZhdGUgX2Ryb3BJbnN0YW5jZXMgPSBuZXcgU2V0PERyb3BMaXN0UmVmPigpO1xuXG4gIC8qKiBSZWdpc3RlcmVkIGRyYWcgaXRlbSBpbnN0YW5jZXMuICovXG4gIHByaXZhdGUgX2RyYWdJbnN0YW5jZXMgPSBuZXcgU2V0PERyYWdSZWY+KCk7XG5cbiAgLyoqIERyYWcgaXRlbSBpbnN0YW5jZXMgdGhhdCBhcmUgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuICovXG4gIHByaXZhdGUgX2FjdGl2ZURyYWdJbnN0YW5jZXM6IFdyaXRhYmxlU2lnbmFsPERyYWdSZWZbXT4gPSBzaWduYWwoW10pO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgZXZlbnQgbGlzdGVuZXJzIHRoYXQgd2UndmUgYm91bmQgdG8gdGhlIGBkb2N1bWVudGAuICovXG4gIHByaXZhdGUgX2dsb2JhbExpc3RlbmVycyA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIHtcbiAgICAgIGhhbmRsZXI6IChldmVudDogRXZlbnQpID0+IHZvaWQ7XG4gICAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuO1xuICAgIH1cbiAgPigpO1xuXG4gIC8qKlxuICAgKiBQcmVkaWNhdGUgZnVuY3Rpb24gdG8gY2hlY2sgaWYgYW4gaXRlbSBpcyBiZWluZyBkcmFnZ2VkLiAgTW92ZWQgb3V0IGludG8gYSBwcm9wZXJ0eSxcbiAgICogYmVjYXVzZSBpdCdsbCBiZSBjYWxsZWQgYSBsb3QgYW5kIHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIGV2ZXJ5IHRpbWUuXG4gICAqL1xuICBwcml2YXRlIF9kcmFnZ2luZ1ByZWRpY2F0ZSA9IChpdGVtOiBEcmFnUmVmKSA9PiBpdGVtLmlzRHJhZ2dpbmcoKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGB0b3VjaG1vdmVgIG9yIGBtb3VzZW1vdmVgIGV2ZW50cyB0aGF0IGFyZSBkaXNwYXRjaGVkXG4gICAqIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nIGEgZHJhZyBpdGVtIGluc3RhbmNlLlxuICAgKi9cbiAgcmVhZG9ubHkgcG9pbnRlck1vdmU6IFN1YmplY3Q8VG91Y2hFdmVudCB8IE1vdXNlRXZlbnQ+ID0gbmV3IFN1YmplY3Q8VG91Y2hFdmVudCB8IE1vdXNlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBgdG91Y2hlbmRgIG9yIGBtb3VzZXVwYCBldmVudHMgdGhhdCBhcmUgZGlzcGF0Y2hlZFxuICAgKiB3aGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZyBhIGRyYWcgaXRlbSBpbnN0YW5jZS5cbiAgICovXG4gIHJlYWRvbmx5IHBvaW50ZXJVcDogU3ViamVjdDxUb3VjaEV2ZW50IHwgTW91c2VFdmVudD4gPSBuZXcgU3ViamVjdDxUb3VjaEV2ZW50IHwgTW91c2VFdmVudD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiB0aGUgdmlld3BvcnQgaGFzIGJlZW4gc2Nyb2xsZWQgd2hpbGUgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgYW4gaXRlbS5cbiAgICogQGRlcHJlY2F0ZWQgVG8gYmUgdHVybmVkIGludG8gYSBwcml2YXRlIG1lbWJlci4gVXNlIHRoZSBgc2Nyb2xsZWRgIG1ldGhvZCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEzLjAuMFxuICAgKi9cbiAgcmVhZG9ubHkgc2Nyb2xsOiBTdWJqZWN0PEV2ZW50PiA9IG5ldyBTdWJqZWN0PEV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBBZGRzIGEgZHJvcCBjb250YWluZXIgdG8gdGhlIHJlZ2lzdHJ5LiAqL1xuICByZWdpc3RlckRyb3BDb250YWluZXIoZHJvcDogRHJvcExpc3RSZWYpIHtcbiAgICBpZiAoIXRoaXMuX2Ryb3BJbnN0YW5jZXMuaGFzKGRyb3ApKSB7XG4gICAgICB0aGlzLl9kcm9wSW5zdGFuY2VzLmFkZChkcm9wKTtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkcyBhIGRyYWcgaXRlbSBpbnN0YW5jZSB0byB0aGUgcmVnaXN0cnkuICovXG4gIHJlZ2lzdGVyRHJhZ0l0ZW0oZHJhZzogRHJhZ1JlZikge1xuICAgIHRoaXMuX2RyYWdJbnN0YW5jZXMuYWRkKGRyYWcpO1xuXG4gICAgLy8gVGhlIGB0b3VjaG1vdmVgIGV2ZW50IGdldHMgYm91bmQgb25jZSwgYWhlYWQgb2YgdGltZSwgYmVjYXVzZSBXZWJLaXRcbiAgICAvLyB3b24ndCBwcmV2ZW50RGVmYXVsdCBvbiBhIGR5bmFtaWNhbGx5LWFkZGVkIGB0b3VjaG1vdmVgIGxpc3RlbmVyLlxuICAgIC8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTg0MjUwLlxuICAgIGlmICh0aGlzLl9kcmFnSW5zdGFuY2VzLnNpemUgPT09IDEpIHtcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBldmVudCBoYW5kbGVyIGhhcyB0byBiZSBleHBsaWNpdGx5IGFjdGl2ZSxcbiAgICAgICAgLy8gYmVjYXVzZSBuZXdlciBicm93c2VycyBtYWtlIGl0IHBhc3NpdmUgYnkgZGVmYXVsdC5cbiAgICAgICAgdGhpcy5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAndG91Y2htb3ZlJyxcbiAgICAgICAgICB0aGlzLl9wZXJzaXN0ZW50VG91Y2htb3ZlTGlzdGVuZXIsXG4gICAgICAgICAgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zLFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZXMgYSBkcm9wIGNvbnRhaW5lciBmcm9tIHRoZSByZWdpc3RyeS4gKi9cbiAgcmVtb3ZlRHJvcENvbnRhaW5lcihkcm9wOiBEcm9wTGlzdFJlZikge1xuICAgIHRoaXMuX2Ryb3BJbnN0YW5jZXMuZGVsZXRlKGRyb3ApO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgYSBkcmFnIGl0ZW0gaW5zdGFuY2UgZnJvbSB0aGUgcmVnaXN0cnkuICovXG4gIHJlbW92ZURyYWdJdGVtKGRyYWc6IERyYWdSZWYpIHtcbiAgICB0aGlzLl9kcmFnSW5zdGFuY2VzLmRlbGV0ZShkcmFnKTtcbiAgICB0aGlzLnN0b3BEcmFnZ2luZyhkcmFnKTtcblxuICAgIGlmICh0aGlzLl9kcmFnSW5zdGFuY2VzLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgICB0aGlzLl9wZXJzaXN0ZW50VG91Y2htb3ZlTGlzdGVuZXIsXG4gICAgICAgIGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UgZm9yIGEgZHJhZyBpbnN0YW5jZS5cbiAgICogQHBhcmFtIGRyYWcgRHJhZyBpbnN0YW5jZSB3aGljaCBpcyBiZWluZyBkcmFnZ2VkLlxuICAgKiBAcGFyYW0gZXZlbnQgRXZlbnQgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdnaW5nLlxuICAgKi9cbiAgc3RhcnREcmFnZ2luZyhkcmFnOiBEcmFnUmVmLCBldmVudDogVG91Y2hFdmVudCB8IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBEbyBub3QgcHJvY2VzcyB0aGUgc2FtZSBkcmFnIHR3aWNlIHRvIGF2b2lkIG1lbW9yeSBsZWFrcyBhbmQgcmVkdW5kYW50IGxpc3RlbmVyc1xuICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzKCkuaW5kZXhPZihkcmFnKSA+IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbG9hZFJlc2V0cygpO1xuICAgIHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMudXBkYXRlKGluc3RhbmNlcyA9PiBbLi4uaW5zdGFuY2VzLCBkcmFnXSk7XG5cbiAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgaXNUb3VjaEV2ZW50ID0gZXZlbnQudHlwZS5zdGFydHNXaXRoKCd0b3VjaCcpO1xuXG4gICAgICAvLyBXZSBleHBsaWNpdGx5IGJpbmQgX19hY3RpdmVfXyBsaXN0ZW5lcnMgaGVyZSwgYmVjYXVzZSBuZXdlciBicm93c2VycyB3aWxsIGRlZmF1bHQgdG9cbiAgICAgIC8vIHBhc3NpdmUgb25lcyBmb3IgYG1vdXNlbW92ZWAgYW5kIGB0b3VjaG1vdmVgLiBUaGUgZXZlbnRzIG5lZWQgdG8gYmUgYWN0aXZlLCBiZWNhdXNlIHdlXG4gICAgICAvLyB1c2UgYHByZXZlbnREZWZhdWx0YCB0byBwcmV2ZW50IHRoZSBwYWdlIGZyb20gc2Nyb2xsaW5nIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nLlxuICAgICAgdGhpcy5fZ2xvYmFsTGlzdGVuZXJzXG4gICAgICAgIC5zZXQoaXNUb3VjaEV2ZW50ID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJywge1xuICAgICAgICAgIGhhbmRsZXI6IChlOiBFdmVudCkgPT4gdGhpcy5wb2ludGVyVXAubmV4dChlIGFzIFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50KSxcbiAgICAgICAgICBvcHRpb25zOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgICAuc2V0KCdzY3JvbGwnLCB7XG4gICAgICAgICAgaGFuZGxlcjogKGU6IEV2ZW50KSA9PiB0aGlzLnNjcm9sbC5uZXh0KGUpLFxuICAgICAgICAgIC8vIFVzZSBjYXB0dXJpbmcgc28gdGhhdCB3ZSBwaWNrIHVwIHNjcm9sbCBjaGFuZ2VzIGluIGFueSBzY3JvbGxhYmxlIG5vZGVzIHRoYXQgYXJlbid0XG4gICAgICAgICAgLy8gdGhlIGRvY3VtZW50LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTcxNDQuXG4gICAgICAgICAgb3B0aW9uczogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgICAgLy8gUHJldmVudGluZyB0aGUgZGVmYXVsdCBhY3Rpb24gb24gYG1vdXNlbW92ZWAgaXNuJ3QgZW5vdWdoIHRvIGRpc2FibGUgdGV4dCBzZWxlY3Rpb25cbiAgICAgICAgLy8gb24gU2FmYXJpIHNvIHdlIG5lZWQgdG8gcHJldmVudCB0aGUgc2VsZWN0aW9uIGV2ZW50IGFzIHdlbGwuIEFsdGVybmF0aXZlbHkgdGhpcyBjYW5cbiAgICAgICAgLy8gYmUgZG9uZSBieSBzZXR0aW5nIGB1c2VyLXNlbGVjdDogbm9uZWAgb24gdGhlIGBib2R5YCwgaG93ZXZlciBpdCBoYXMgY2F1c2VzIGEgc3R5bGVcbiAgICAgICAgLy8gcmVjYWxjdWxhdGlvbiB3aGljaCBjYW4gYmUgZXhwZW5zaXZlIG9uIHBhZ2VzIHdpdGggYSBsb3Qgb2YgZWxlbWVudHMuXG4gICAgICAgIC5zZXQoJ3NlbGVjdHN0YXJ0Jywge1xuICAgICAgICAgIGhhbmRsZXI6IHRoaXMuX3ByZXZlbnREZWZhdWx0V2hpbGVEcmFnZ2luZyxcbiAgICAgICAgICBvcHRpb25zOiBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMsXG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBXZSBkb24ndCBoYXZlIHRvIGJpbmQgYSBtb3ZlIGV2ZW50IGZvciB0b3VjaCBkcmFnIHNlcXVlbmNlcywgYmVjYXVzZVxuICAgICAgLy8gd2UgYWxyZWFkeSBoYXZlIGEgcGVyc2lzdGVudCBnbG9iYWwgb25lIGJvdW5kIGZyb20gYHJlZ2lzdGVyRHJhZ0l0ZW1gLlxuICAgICAgaWYgKCFpc1RvdWNoRXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZ2xvYmFsTGlzdGVuZXJzLnNldCgnbW91c2Vtb3ZlJywge1xuICAgICAgICAgIGhhbmRsZXI6IChlOiBFdmVudCkgPT4gdGhpcy5wb2ludGVyTW92ZS5uZXh0KGUgYXMgTW91c2VFdmVudCksXG4gICAgICAgICAgb3B0aW9uczogYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgdGhpcy5fZ2xvYmFsTGlzdGVuZXJzLmZvckVhY2goKGNvbmZpZywgbmFtZSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgY29uZmlnLmhhbmRsZXIsIGNvbmZpZy5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogU3RvcHMgZHJhZ2dpbmcgYSBkcmFnIGl0ZW0gaW5zdGFuY2UuICovXG4gIHN0b3BEcmFnZ2luZyhkcmFnOiBEcmFnUmVmKSB7XG4gICAgdGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcy51cGRhdGUoaW5zdGFuY2VzID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gaW5zdGFuY2VzLmluZGV4T2YoZHJhZyk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBpbnN0YW5jZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIFsuLi5pbnN0YW5jZXNdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluc3RhbmNlcztcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9jbGVhckdsb2JhbExpc3RlbmVycygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSBkcmFnIGl0ZW0gaW5zdGFuY2UgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuICovXG4gIGlzRHJhZ2dpbmcoZHJhZzogRHJhZ1JlZikge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzKCkuaW5kZXhPZihkcmFnKSA+IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBzdHJlYW0gdGhhdCB3aWxsIGVtaXQgd2hlbiBhbnkgZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBzY3JvbGxlZCB3aGlsZSBhbiBpdGVtIGlzIGJlaW5nXG4gICAqIGRyYWdnZWQuXG4gICAqIEBwYXJhbSBzaGFkb3dSb290IE9wdGlvbmFsIHNoYWRvdyByb290IHRoYXQgdGhlIGN1cnJlbnQgZHJhZ2dpbmcgc2VxdWVuY2Ugc3RhcnRlZCBmcm9tLlxuICAgKiAgIFRvcC1sZXZlbCBsaXN0ZW5lcnMgd29uJ3QgcGljayB1cCBldmVudHMgY29taW5nIGZyb20gdGhlIHNoYWRvdyBET00gc28gdGhpcyBwYXJhbWV0ZXIgY2FuXG4gICAqICAgYmUgdXNlZCB0byBpbmNsdWRlIGFuIGFkZGl0aW9uYWwgdG9wLWxldmVsIGxpc3RlbmVyIGF0IHRoZSBzaGFkb3cgcm9vdCBsZXZlbC5cbiAgICovXG4gIHNjcm9sbGVkKHNoYWRvd1Jvb3Q/OiBEb2N1bWVudE9yU2hhZG93Um9vdCB8IG51bGwpOiBPYnNlcnZhYmxlPEV2ZW50PiB7XG4gICAgY29uc3Qgc3RyZWFtczogT2JzZXJ2YWJsZTxFdmVudD5bXSA9IFt0aGlzLnNjcm9sbF07XG5cbiAgICBpZiAoc2hhZG93Um9vdCAmJiBzaGFkb3dSb290ICE9PSB0aGlzLl9kb2N1bWVudCkge1xuICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgYmFzaWNhbGx5IHRoZSBzYW1lIGFzIGBmcm9tRXZlbnRgIGZyb20gcnhqcywgYnV0IHdlIGRvIGl0IG91cnNlbHZlcyxcbiAgICAgIC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBndWFyYW50ZWUgdGhhdCB0aGUgZXZlbnQgaXMgYm91bmQgb3V0c2lkZSBvZiB0aGUgYE5nWm9uZWAuIFdpdGhcbiAgICAgIC8vIGBmcm9tRXZlbnRgIGl0J2xsIG9ubHkgaGFwcGVuIGlmIHRoZSBzdWJzY3JpcHRpb24gaXMgb3V0c2lkZSB0aGUgYE5nWm9uZWAuXG4gICAgICBzdHJlYW1zLnB1c2goXG4gICAgICAgIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8RXZlbnQ+KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldmVudE9wdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnSW5zdGFuY2VzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChldmVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIChzaGFkb3dSb290IGFzIFNoYWRvd1Jvb3QpLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNhbGxiYWNrLCBldmVudE9wdGlvbnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAoc2hhZG93Um9vdCBhcyBTaGFkb3dSb290KS5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBjYWxsYmFjaywgZXZlbnRPcHRpb25zKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2UoLi4uc3RyZWFtcyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kcmFnSW5zdGFuY2VzLmZvckVhY2goaW5zdGFuY2UgPT4gdGhpcy5yZW1vdmVEcmFnSXRlbShpbnN0YW5jZSkpO1xuICAgIHRoaXMuX2Ryb3BJbnN0YW5jZXMuZm9yRWFjaChpbnN0YW5jZSA9PiB0aGlzLnJlbW92ZURyb3BDb250YWluZXIoaW5zdGFuY2UpKTtcbiAgICB0aGlzLl9jbGVhckdsb2JhbExpc3RlbmVycygpO1xuICAgIHRoaXMucG9pbnRlck1vdmUuY29tcGxldGUoKTtcbiAgICB0aGlzLnBvaW50ZXJVcC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGxpc3RlbmVyIHRoYXQgd2lsbCBwcmV2ZW50IHRoZSBkZWZhdWx0IGJyb3dzZXIgYWN0aW9uIHdoaWxlIHRoZSB1c2VyIGlzIGRyYWdnaW5nLlxuICAgKiBAcGFyYW0gZXZlbnQgRXZlbnQgd2hvc2UgZGVmYXVsdCBhY3Rpb24gc2hvdWxkIGJlIHByZXZlbnRlZC5cbiAgICovXG4gIHByaXZhdGUgX3ByZXZlbnREZWZhdWx0V2hpbGVEcmFnZ2luZyA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5fYWN0aXZlRHJhZ0luc3RhbmNlcygpLmxlbmd0aCA+IDApIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKiBFdmVudCBsaXN0ZW5lciBmb3IgYHRvdWNobW92ZWAgdGhhdCBpcyBib3VuZCBldmVuIGlmIG5vIGRyYWdnaW5nIGlzIGhhcHBlbmluZy4gKi9cbiAgcHJpdmF0ZSBfcGVyc2lzdGVudFRvdWNobW92ZUxpc3RlbmVyID0gKGV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgd2Ugb25seSB3YW50IHRvIHByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIGFmdGVyIGRyYWdnaW5nIGhhcyBhY3R1YWxseSBzdGFydGVkLlxuICAgICAgLy8gVXN1YWxseSB0aGlzIGlzIHRoZSBzYW1lIHRpbWUgYXQgd2hpY2ggdGhlIGl0ZW0gaXMgYWRkZWQgdG8gdGhlIGBfYWN0aXZlRHJhZ0luc3RhbmNlc2AsXG4gICAgICAvLyBidXQgaXQgY291bGQgYmUgcHVzaGVkIGJhY2sgaWYgdGhlIHVzZXIgaGFzIHNldCB1cCBhIGRyYWcgZGVsYXkgb3IgdGhyZXNob2xkLlxuICAgICAgaWYgKHRoaXMuX2FjdGl2ZURyYWdJbnN0YW5jZXMoKS5zb21lKHRoaXMuX2RyYWdnaW5nUHJlZGljYXRlKSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBvaW50ZXJNb3ZlLm5leHQoZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICAvKiogQ2xlYXJzIG91dCB0aGUgZ2xvYmFsIGV2ZW50IGxpc3RlbmVycyBmcm9tIHRoZSBgZG9jdW1lbnRgLiAqL1xuICBwcml2YXRlIF9jbGVhckdsb2JhbExpc3RlbmVycygpIHtcbiAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMuZm9yRWFjaCgoY29uZmlnLCBuYW1lKSA9PiB7XG4gICAgICB0aGlzLl9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGNvbmZpZy5oYW5kbGVyLCBjb25maWcub3B0aW9ucyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9nbG9iYWxMaXN0ZW5lcnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8vIFRPRE8oY3Jpc2JldG8pOiBhYnN0cmFjdCB0aGlzIGF3YXkgaW50byBzb21ldGhpbmcgcmV1c2FibGUuXG4gIC8qKiBMb2FkcyB0aGUgQ1NTIHJlc2V0cyBuZWVkZWQgZm9yIHRoZSBtb2R1bGUgdG8gd29yayBjb3JyZWN0bHkuICovXG4gIHByaXZhdGUgX2xvYWRSZXNldHMoKSB7XG4gICAgaWYgKCFhY3RpdmVBcHBzLmhhcyh0aGlzLl9hcHBSZWYpKSB7XG4gICAgICBhY3RpdmVBcHBzLmFkZCh0aGlzLl9hcHBSZWYpO1xuXG4gICAgICBjb25zdCBjb21wb25lbnRSZWYgPSBjcmVhdGVDb21wb25lbnQoX1Jlc2V0c0xvYWRlciwge1xuICAgICAgICBlbnZpcm9ubWVudEluamVjdG9yOiB0aGlzLl9lbnZpcm9ubWVudEluamVjdG9yLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2FwcFJlZi5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgICBhY3RpdmVBcHBzLmRlbGV0ZSh0aGlzLl9hcHBSZWYpO1xuICAgICAgICBpZiAoYWN0aXZlQXBwcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgY29tcG9uZW50UmVmLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=