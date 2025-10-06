/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { afterNextRender, afterRender, untracked, } from '@angular/core';
import { Subject, merge, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { coerceCssPixelValue, coerceArray } from '@angular/cdk/coercion';
/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef {
    constructor(_portalOutlet, _host, _pane, _config, _ngZone, _keyboardDispatcher, _document, _location, _outsideClickDispatcher, _animationsDisabled = false, _injector) {
        this._portalOutlet = _portalOutlet;
        this._host = _host;
        this._pane = _pane;
        this._config = _config;
        this._ngZone = _ngZone;
        this._keyboardDispatcher = _keyboardDispatcher;
        this._document = _document;
        this._location = _location;
        this._outsideClickDispatcher = _outsideClickDispatcher;
        this._animationsDisabled = _animationsDisabled;
        this._injector = _injector;
        this._backdropElement = null;
        this._backdropClick = new Subject();
        this._attachments = new Subject();
        this._detachments = new Subject();
        this._locationChanges = Subscription.EMPTY;
        this._backdropClickHandler = (event) => this._backdropClick.next(event);
        this._backdropTransitionendHandler = (event) => {
            this._disposeBackdrop(event.target);
        };
        /** Stream of keydown events dispatched to this overlay. */
        this._keydownEvents = new Subject();
        /** Stream of mouse outside events dispatched to this overlay. */
        this._outsidePointerEvents = new Subject();
        this._renders = new Subject();
        if (_config.scrollStrategy) {
            this._scrollStrategy = _config.scrollStrategy;
            this._scrollStrategy.attach(this);
        }
        this._positionStrategy = _config.positionStrategy;
        // Users could open the overlay from an `effect`, in which case we need to
        // run the `afterRender` as `untracked`. We don't recommend that users do
        // this, but we also don't want to break users who are doing it.
        this._afterRenderRef = untracked(() => afterRender(() => {
            this._renders.next();
        }, { injector: this._injector }));
    }
    /** The overlay's HTML element */
    get overlayElement() {
        return this._pane;
    }
    /** The overlay's backdrop HTML element. */
    get backdropElement() {
        return this._backdropElement;
    }
    /**
     * Wrapper around the panel element. Can be used for advanced
     * positioning where a wrapper with specific styling is
     * required around the overlay pane.
     */
    get hostElement() {
        return this._host;
    }
    /**
     * Attaches content, given via a Portal, to the overlay.
     * If the overlay is configured to have a backdrop, it will be created.
     *
     * @param portal Portal instance to which to attach the overlay.
     * @returns The portal attachment result.
     */
    attach(portal) {
        // Insert the host into the DOM before attaching the portal, otherwise
        // the animations module will skip animations on repeat attachments.
        if (!this._host.parentElement && this._previousHostParent) {
            this._previousHostParent.appendChild(this._host);
        }
        const attachResult = this._portalOutlet.attach(portal);
        if (this._positionStrategy) {
            this._positionStrategy.attach(this);
        }
        this._updateStackingOrder();
        this._updateElementSize();
        this._updateElementDirection();
        if (this._scrollStrategy) {
            this._scrollStrategy.enable();
        }
        // We need to clean this up ourselves, because we're passing in an
        // `EnvironmentInjector` below which won't ever be destroyed.
        // Otherwise it causes some callbacks to be retained (see #29696).
        this._afterNextRenderRef?.destroy();
        // Update the position once the overlay is fully rendered before attempting to position it,
        // as the position may depend on the size of the rendered content.
        this._afterNextRenderRef = afterNextRender(() => {
            // The overlay could've been detached before the callback executed.
            if (this.hasAttached()) {
                this.updatePosition();
            }
        }, { injector: this._injector });
        // Enable pointer events for the overlay pane element.
        this._togglePointerEvents(true);
        if (this._config.hasBackdrop) {
            this._attachBackdrop();
        }
        if (this._config.panelClass) {
            this._toggleClasses(this._pane, this._config.panelClass, true);
        }
        // Only emit the `attachments` event once all other setup is done.
        this._attachments.next();
        // Track this overlay by the keyboard dispatcher
        this._keyboardDispatcher.add(this);
        if (this._config.disposeOnNavigation) {
            this._locationChanges = this._location.subscribe(() => this.dispose());
        }
        this._outsideClickDispatcher.add(this);
        // TODO(crisbeto): the null check is here, because the portal outlet returns `any`.
        // We should be guaranteed for the result to be `ComponentRef | EmbeddedViewRef`, but
        // `instanceof EmbeddedViewRef` doesn't appear to work at the moment.
        if (typeof attachResult?.onDestroy === 'function') {
            // In most cases we control the portal and we know when it is being detached so that
            // we can finish the disposal process. The exception is if the user passes in a custom
            // `ViewContainerRef` that isn't destroyed through the overlay API. Note that we use
            // `detach` here instead of `dispose`, because we don't know if the user intends to
            // reattach the overlay at a later point. It also has the advantage of waiting for animations.
            attachResult.onDestroy(() => {
                if (this.hasAttached()) {
                    // We have to delay the `detach` call, because detaching immediately prevents
                    // other destroy hooks from running. This is likely a framework bug similar to
                    // https://github.com/angular/angular/issues/46119
                    this._ngZone.runOutsideAngular(() => Promise.resolve().then(() => this.detach()));
                }
            });
        }
        return attachResult;
    }
    /**
     * Detaches an overlay from a portal.
     * @returns The portal detachment result.
     */
    detach() {
        if (!this.hasAttached()) {
            return;
        }
        this.detachBackdrop();
        // When the overlay is detached, the pane element should disable pointer events.
        // This is necessary because otherwise the pane element will cover the page and disable
        // pointer events therefore. Depends on the position strategy and the applied pane boundaries.
        this._togglePointerEvents(false);
        if (this._positionStrategy && this._positionStrategy.detach) {
            this._positionStrategy.detach();
        }
        if (this._scrollStrategy) {
            this._scrollStrategy.disable();
        }
        const detachmentResult = this._portalOutlet.detach();
        // Only emit after everything is detached.
        this._detachments.next();
        // Remove this overlay from keyboard dispatcher tracking.
        this._keyboardDispatcher.remove(this);
        // Keeping the host element in the DOM can cause scroll jank, because it still gets
        // rendered, even though it's transparent and unclickable which is why we remove it.
        this._detachContentWhenEmpty();
        this._locationChanges.unsubscribe();
        this._outsideClickDispatcher.remove(this);
        return detachmentResult;
    }
    /** Cleans up the overlay from the DOM. */
    dispose() {
        const isAttached = this.hasAttached();
        if (this._positionStrategy) {
            this._positionStrategy.dispose();
        }
        this._disposeScrollStrategy();
        this._disposeBackdrop(this._backdropElement);
        this._locationChanges.unsubscribe();
        this._keyboardDispatcher.remove(this);
        this._portalOutlet.dispose();
        this._attachments.complete();
        this._backdropClick.complete();
        this._keydownEvents.complete();
        this._outsidePointerEvents.complete();
        this._outsideClickDispatcher.remove(this);
        this._host?.remove();
        this._afterNextRenderRef?.destroy();
        this._previousHostParent = this._pane = this._host = null;
        if (isAttached) {
            this._detachments.next();
        }
        this._detachments.complete();
        this._afterRenderRef.destroy();
        this._renders.complete();
    }
    /** Whether the overlay has attached content. */
    hasAttached() {
        return this._portalOutlet.hasAttached();
    }
    /** Gets an observable that emits when the backdrop has been clicked. */
    backdropClick() {
        return this._backdropClick;
    }
    /** Gets an observable that emits when the overlay has been attached. */
    attachments() {
        return this._attachments;
    }
    /** Gets an observable that emits when the overlay has been detached. */
    detachments() {
        return this._detachments;
    }
    /** Gets an observable of keydown events targeted to this overlay. */
    keydownEvents() {
        return this._keydownEvents;
    }
    /** Gets an observable of pointer events targeted outside this overlay. */
    outsidePointerEvents() {
        return this._outsidePointerEvents;
    }
    /** Gets the current overlay configuration, which is immutable. */
    getConfig() {
        return this._config;
    }
    /** Updates the position of the overlay based on the position strategy. */
    updatePosition() {
        if (this._positionStrategy) {
            this._positionStrategy.apply();
        }
    }
    /** Switches to a new position strategy and updates the overlay position. */
    updatePositionStrategy(strategy) {
        if (strategy === this._positionStrategy) {
            return;
        }
        if (this._positionStrategy) {
            this._positionStrategy.dispose();
        }
        this._positionStrategy = strategy;
        if (this.hasAttached()) {
            strategy.attach(this);
            this.updatePosition();
        }
    }
    /** Update the size properties of the overlay. */
    updateSize(sizeConfig) {
        this._config = { ...this._config, ...sizeConfig };
        this._updateElementSize();
    }
    /** Sets the LTR/RTL direction for the overlay. */
    setDirection(dir) {
        this._config = { ...this._config, direction: dir };
        this._updateElementDirection();
    }
    /** Add a CSS class or an array of classes to the overlay pane. */
    addPanelClass(classes) {
        if (this._pane) {
            this._toggleClasses(this._pane, classes, true);
        }
    }
    /** Remove a CSS class or an array of classes from the overlay pane. */
    removePanelClass(classes) {
        if (this._pane) {
            this._toggleClasses(this._pane, classes, false);
        }
    }
    /**
     * Returns the layout direction of the overlay panel.
     */
    getDirection() {
        const direction = this._config.direction;
        if (!direction) {
            return 'ltr';
        }
        return typeof direction === 'string' ? direction : direction.value;
    }
    /** Switches to a new scroll strategy. */
    updateScrollStrategy(strategy) {
        if (strategy === this._scrollStrategy) {
            return;
        }
        this._disposeScrollStrategy();
        this._scrollStrategy = strategy;
        if (this.hasAttached()) {
            strategy.attach(this);
            strategy.enable();
        }
    }
    /** Updates the text direction of the overlay panel. */
    _updateElementDirection() {
        this._host.setAttribute('dir', this.getDirection());
    }
    /** Updates the size of the overlay element based on the overlay config. */
    _updateElementSize() {
        if (!this._pane) {
            return;
        }
        const style = this._pane.style;
        style.width = coerceCssPixelValue(this._config.width);
        style.height = coerceCssPixelValue(this._config.height);
        style.minWidth = coerceCssPixelValue(this._config.minWidth);
        style.minHeight = coerceCssPixelValue(this._config.minHeight);
        style.maxWidth = coerceCssPixelValue(this._config.maxWidth);
        style.maxHeight = coerceCssPixelValue(this._config.maxHeight);
    }
    /** Toggles the pointer events for the overlay pane element. */
    _togglePointerEvents(enablePointer) {
        this._pane.style.pointerEvents = enablePointer ? '' : 'none';
    }
    /** Attaches a backdrop for this overlay. */
    _attachBackdrop() {
        const showingClass = 'cdk-overlay-backdrop-showing';
        this._backdropElement = this._document.createElement('div');
        this._backdropElement.classList.add('cdk-overlay-backdrop');
        if (this._animationsDisabled) {
            this._backdropElement.classList.add('cdk-overlay-backdrop-noop-animation');
        }
        if (this._config.backdropClass) {
            this._toggleClasses(this._backdropElement, this._config.backdropClass, true);
        }
        // Insert the backdrop before the pane in the DOM order,
        // in order to handle stacked overlays properly.
        this._host.parentElement.insertBefore(this._backdropElement, this._host);
        // Forward backdrop clicks such that the consumer of the overlay can perform whatever
        // action desired when such a click occurs (usually closing the overlay).
        this._backdropElement.addEventListener('click', this._backdropClickHandler);
        // Add class to fade-in the backdrop after one frame.
        if (!this._animationsDisabled && typeof requestAnimationFrame !== 'undefined') {
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => {
                    if (this._backdropElement) {
                        this._backdropElement.classList.add(showingClass);
                    }
                });
            });
        }
        else {
            this._backdropElement.classList.add(showingClass);
        }
    }
    /**
     * Updates the stacking order of the element, moving it to the top if necessary.
     * This is required in cases where one overlay was detached, while another one,
     * that should be behind it, was destroyed. The next time both of them are opened,
     * the stacking will be wrong, because the detached element's pane will still be
     * in its original DOM position.
     */
    _updateStackingOrder() {
        if (this._host.nextSibling) {
            this._host.parentNode.appendChild(this._host);
        }
    }
    /** Detaches the backdrop (if any) associated with the overlay. */
    detachBackdrop() {
        const backdropToDetach = this._backdropElement;
        if (!backdropToDetach) {
            return;
        }
        if (this._animationsDisabled) {
            this._disposeBackdrop(backdropToDetach);
            return;
        }
        backdropToDetach.classList.remove('cdk-overlay-backdrop-showing');
        this._ngZone.runOutsideAngular(() => {
            backdropToDetach.addEventListener('transitionend', this._backdropTransitionendHandler);
        });
        // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
        // In this case we make it unclickable and we try to remove it after a delay.
        backdropToDetach.style.pointerEvents = 'none';
        // Run this outside the Angular zone because there's nothing that Angular cares about.
        // If it were to run inside the Angular zone, every test that used Overlay would have to be
        // either async or fakeAsync.
        this._backdropTimeout = this._ngZone.runOutsideAngular(() => setTimeout(() => {
            this._disposeBackdrop(backdropToDetach);
        }, 500));
    }
    /** Toggles a single CSS class or an array of classes on an element. */
    _toggleClasses(element, cssClasses, isAdd) {
        const classes = coerceArray(cssClasses || []).filter(c => !!c);
        if (classes.length) {
            isAdd ? element.classList.add(...classes) : element.classList.remove(...classes);
        }
    }
    /** Detaches the overlay content next time the zone stabilizes. */
    _detachContentWhenEmpty() {
        // Normally we wouldn't have to explicitly run this outside the `NgZone`, however
        // if the consumer is using `zone-patch-rxjs`, the `Subscription.unsubscribe` call will
        // be patched to run inside the zone, which will throw us into an infinite loop.
        this._ngZone.runOutsideAngular(() => {
            // We can't remove the host here immediately, because the overlay pane's content
            // might still be animating. This stream helps us avoid interrupting the animation
            // by waiting for the pane to become empty.
            const subscription = this._renders
                .pipe(takeUntil(merge(this._attachments, this._detachments)))
                .subscribe(() => {
                // Needs a couple of checks for the pane and host, because
                // they may have been removed by the time the zone stabilizes.
                if (!this._pane || !this._host || this._pane.children.length === 0) {
                    if (this._pane && this._config.panelClass) {
                        this._toggleClasses(this._pane, this._config.panelClass, false);
                    }
                    if (this._host && this._host.parentElement) {
                        this._previousHostParent = this._host.parentElement;
                        this._host.remove();
                    }
                    subscription.unsubscribe();
                }
            });
        });
    }
    /** Disposes of a scroll strategy. */
    _disposeScrollStrategy() {
        const scrollStrategy = this._scrollStrategy;
        if (scrollStrategy) {
            scrollStrategy.disable();
            if (scrollStrategy.detach) {
                scrollStrategy.detach();
            }
        }
    }
    /** Removes a backdrop element from the DOM. */
    _disposeBackdrop(backdrop) {
        if (backdrop) {
            backdrop.removeEventListener('click', this._backdropClickHandler);
            backdrop.removeEventListener('transitionend', this._backdropTransitionendHandler);
            backdrop.remove();
            // It is possible that a new portal has been attached to this overlay since we started
            // removing the backdrop. If that is the case, only clear the backdrop reference if it
            // is still the same instance that we started to remove.
            if (this._backdropElement === backdrop) {
                this._backdropElement = null;
            }
        }
        if (this._backdropTimeout) {
            clearTimeout(this._backdropTimeout);
            this._backdropTimeout = undefined;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvb3ZlcmxheS1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQU1MLGVBQWUsRUFDZixXQUFXLEVBQ1gsU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBYSxPQUFPLEVBQUUsS0FBSyxFQUFvQixZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDaEYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBSXpDLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQVN2RTs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQWlDckIsWUFDVSxhQUEyQixFQUMzQixLQUFrQixFQUNsQixLQUFrQixFQUNsQixPQUF1QyxFQUN2QyxPQUFlLEVBQ2YsbUJBQThDLEVBQzlDLFNBQW1CLEVBQ25CLFNBQW1CLEVBQ25CLHVCQUFzRCxFQUN0RCxzQkFBc0IsS0FBSyxFQUMzQixTQUE4QjtRQVY5QixrQkFBYSxHQUFiLGFBQWEsQ0FBYztRQUMzQixVQUFLLEdBQUwsS0FBSyxDQUFhO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQWE7UUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7UUFDdkMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMkI7UUFDOUMsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQ25CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBK0I7UUFDdEQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFRO1FBQzNCLGNBQVMsR0FBVCxTQUFTLENBQXFCO1FBM0NoQyxxQkFBZ0IsR0FBdUIsSUFBSSxDQUFDO1FBRW5DLG1CQUFjLEdB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QUM7WUFDcEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztRQUNwQyxDQUFDO0lBQ0gsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWwsIFBvcnRhbCwgUG9ydGFsT3V0bGV0LCBUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBBZnRlclJlbmRlclJlZixcbiAgQ29tcG9uZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEVudmlyb25tZW50SW5qZWN0b3IsXG4gIE5nWm9uZSxcbiAgYWZ0ZXJOZXh0UmVuZGVyLFxuICBhZnRlclJlbmRlcixcbiAgdW50cmFja2VkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3QsIG1lcmdlLCBTdWJzY3JpcHRpb25MaWtlLCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7T3ZlcmxheUtleWJvYXJkRGlzcGF0Y2hlcn0gZnJvbSAnLi9kaXNwYXRjaGVycy9vdmVybGF5LWtleWJvYXJkLWRpc3BhdGNoZXInO1xuaW1wb3J0IHtPdmVybGF5T3V0c2lkZUNsaWNrRGlzcGF0Y2hlcn0gZnJvbSAnLi9kaXNwYXRjaGVycy9vdmVybGF5LW91dHNpZGUtY2xpY2stZGlzcGF0Y2hlcic7XG5pbXBvcnQge092ZXJsYXlDb25maWd9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlLCBjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7UG9zaXRpb25TdHJhdGVneX0gZnJvbSAnLi9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQge1Njcm9sbFN0cmF0ZWd5fSBmcm9tICcuL3Njcm9sbCc7XG5cbi8qKiBBbiBvYmplY3Qgd2hlcmUgYWxsIG9mIGl0cyBwcm9wZXJ0aWVzIGNhbm5vdCBiZSB3cml0dGVuLiAqL1xuZXhwb3J0IHR5cGUgSW1tdXRhYmxlT2JqZWN0PFQ+ID0ge1xuICByZWFkb25seSBbUCBpbiBrZXlvZiBUXTogVFtQXTtcbn07XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIGFuIG92ZXJsYXkgdGhhdCBoYXMgYmVlbiBjcmVhdGVkIHdpdGggdGhlIE92ZXJsYXkgc2VydmljZS5cbiAqIFVzZWQgdG8gbWFuaXB1bGF0ZSBvciBkaXNwb3NlIG9mIHNhaWQgb3ZlcmxheS5cbiAqL1xuZXhwb3J0IGNsYXNzIE92ZXJsYXlSZWYgaW1wbGVtZW50cyBQb3J0YWxPdXRsZXQge1xuICBwcml2YXRlIF9iYWNrZHJvcEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2JhY2tkcm9wVGltZW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2JhY2tkcm9wQ2xpY2sgPSBuZXcgU3ViamVjdDxNb3VzZUV2ZW50PigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9hdHRhY2htZW50cyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RldGFjaG1lbnRzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcHJpdmF0ZSBfcG9zaXRpb25TdHJhdGVneTogUG9zaXRpb25TdHJhdGVneSB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6IFNjcm9sbFN0cmF0ZWd5IHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIF9sb2NhdGlvbkNoYW5nZXM6IFN1YnNjcmlwdGlvbkxpa2UgPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX2JhY2tkcm9wQ2xpY2tIYW5kbGVyID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLl9iYWNrZHJvcENsaWNrLm5leHQoZXZlbnQpO1xuICBwcml2YXRlIF9iYWNrZHJvcFRyYW5zaXRpb25lbmRIYW5kbGVyID0gKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpID0+IHtcbiAgICB0aGlzLl9kaXNwb3NlQmFja2Ryb3AoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50IHwgbnVsbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgcGFyZW50IG9mIHRoZSBgX2hvc3RgIGF0IHRoZSB0aW1lIGl0IHdhcyBkZXRhY2hlZC4gVXNlZCB0byByZXN0b3JlXG4gICAqIHRoZSBgX2hvc3RgIHRvIGl0cyBvcmlnaW5hbCBwb3NpdGlvbiBpbiB0aGUgRE9NIHdoZW4gaXQgZ2V0cyByZS1hdHRhY2hlZC5cbiAgICovXG4gIHByaXZhdGUgX3ByZXZpb3VzSG9zdFBhcmVudDogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFN0cmVhbSBvZiBrZXlkb3duIGV2ZW50cyBkaXNwYXRjaGVkIHRvIHRoaXMgb3ZlcmxheS4gKi9cbiAgcmVhZG9ubHkgX2tleWRvd25FdmVudHMgPSBuZXcgU3ViamVjdDxLZXlib2FyZEV2ZW50PigpO1xuXG4gIC8qKiBTdHJlYW0gb2YgbW91c2Ugb3V0c2lkZSBldmVudHMgZGlzcGF0Y2hlZCB0byB0aGlzIG92ZXJsYXkuICovXG4gIHJlYWRvbmx5IF9vdXRzaWRlUG9pbnRlckV2ZW50cyA9IG5ldyBTdWJqZWN0PE1vdXNlRXZlbnQ+KCk7XG5cbiAgcHJpdmF0ZSBfcmVuZGVycyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgcHJpdmF0ZSBfYWZ0ZXJSZW5kZXJSZWY6IEFmdGVyUmVuZGVyUmVmO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseS1ydW5uaW5nIGBhZnRlck5leHRSZW5kZXJgIGNhbGwuICovXG4gIHByaXZhdGUgX2FmdGVyTmV4dFJlbmRlclJlZjogQWZ0ZXJSZW5kZXJSZWYgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfcG9ydGFsT3V0bGV0OiBQb3J0YWxPdXRsZXQsXG4gICAgcHJpdmF0ZSBfaG9zdDogSFRNTEVsZW1lbnQsXG4gICAgcHJpdmF0ZSBfcGFuZTogSFRNTEVsZW1lbnQsXG4gICAgcHJpdmF0ZSBfY29uZmlnOiBJbW11dGFibGVPYmplY3Q8T3ZlcmxheUNvbmZpZz4sXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBfa2V5Ym9hcmREaXNwYXRjaGVyOiBPdmVybGF5S2V5Ym9hcmREaXNwYXRjaGVyLFxuICAgIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb24sXG4gICAgcHJpdmF0ZSBfb3V0c2lkZUNsaWNrRGlzcGF0Y2hlcjogT3ZlcmxheU91dHNpZGVDbGlja0Rpc3BhdGNoZXIsXG4gICAgcHJpdmF0ZSBfYW5pbWF0aW9uc0Rpc2FibGVkID0gZmFsc2UsXG4gICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICkge1xuICAgIGlmIChfY29uZmlnLnNjcm9sbFN0cmF0ZWd5KSB7XG4gICAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IF9jb25maWcuc2Nyb2xsU3RyYXRlZ3k7XG4gICAgICB0aGlzLl9zY3JvbGxTdHJhdGVneS5hdHRhY2godGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcG9zaXRpb25TdHJhdGVneSA9IF9jb25maWcucG9zaXRpb25TdHJhdGVneTtcblxuICAgIC8vIFVzZXJzIGNvdWxkIG9wZW4gdGhlIG92ZXJsYXkgZnJvbSBhbiBgZWZmZWN0YCwgaW4gd2hpY2ggY2FzZSB3ZSBuZWVkIHRvXG4gICAgLy8gcnVuIHRoZSBgYWZ0ZXJSZW5kZXJgIGFzIGB1bnRyYWNrZWRgLiBXZSBkb24ndCByZWNvbW1lbmQgdGhhdCB1c2VycyBkb1xuICAgIC8vIHRoaXMsIGJ1dCB3ZSBhbHNvIGRvbid0IHdhbnQgdG8gYnJlYWsgdXNlcnMgd2hvIGFyZSBkb2luZyBpdC5cbiAgICB0aGlzLl9hZnRlclJlbmRlclJlZiA9IHVudHJhY2tlZCgoKSA9PlxuICAgICAgYWZ0ZXJSZW5kZXIoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJzLm5leHQoKTtcbiAgICAgICAgfSxcbiAgICAgICAge2luamVjdG9yOiB0aGlzLl9pbmplY3Rvcn0sXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICAvKiogVGhlIG92ZXJsYXkncyBIVE1MIGVsZW1lbnQgKi9cbiAgZ2V0IG92ZXJsYXlFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5fcGFuZTtcbiAgfVxuXG4gIC8qKiBUaGUgb3ZlcmxheSdzIGJhY2tkcm9wIEhUTUwgZWxlbWVudC4gKi9cbiAgZ2V0IGJhY2tkcm9wRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9iYWNrZHJvcEVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgdGhlIHBhbmVsIGVsZW1lbnQuIENhbiBiZSB1c2VkIGZvciBhZHZhbmNlZFxuICAgKiBwb3NpdGlvbmluZyB3aGVyZSBhIHdyYXBwZXIgd2l0aCBzcGVjaWZpYyBzdHlsaW5nIGlzXG4gICAqIHJlcXVpcmVkIGFyb3VuZCB0aGUgb3ZlcmxheSBwYW5lLlxuICAgKi9cbiAgZ2V0IGhvc3RFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5faG9zdDtcbiAgfVxuXG4gIGF0dGFjaDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPjtcbiAgYXR0YWNoPFQ+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8VD4pOiBFbWJlZGRlZFZpZXdSZWY8VD47XG4gIGF0dGFjaChwb3J0YWw6IGFueSk6IGFueTtcblxuICAvKipcbiAgICogQXR0YWNoZXMgY29udGVudCwgZ2l2ZW4gdmlhIGEgUG9ydGFsLCB0byB0aGUgb3ZlcmxheS5cbiAgICogSWYgdGhlIG92ZXJsYXkgaXMgY29uZmlndXJlZCB0byBoYXZlIGEgYmFja2Ryb3AsIGl0IHdpbGwgYmUgY3JlYXRlZC5cbiAgICpcbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgaW5zdGFuY2UgdG8gd2hpY2ggdG8gYXR0YWNoIHRoZSBvdmVybGF5LlxuICAgKiBAcmV0dXJucyBUaGUgcG9ydGFsIGF0dGFjaG1lbnQgcmVzdWx0LlxuICAgKi9cbiAgYXR0YWNoKHBvcnRhbDogUG9ydGFsPGFueT4pOiBhbnkge1xuICAgIC8vIEluc2VydCB0aGUgaG9zdCBpbnRvIHRoZSBET00gYmVmb3JlIGF0dGFjaGluZyB0aGUgcG9ydGFsLCBvdGhlcndpc2VcbiAgICAvLyB0aGUgYW5pbWF0aW9ucyBtb2R1bGUgd2lsbCBza2lwIGFuaW1hdGlvbnMgb24gcmVwZWF0IGF0dGFjaG1lbnRzLlxuICAgIGlmICghdGhpcy5faG9zdC5wYXJlbnRFbGVtZW50ICYmIHRoaXMuX3ByZXZpb3VzSG9zdFBhcmVudCkge1xuICAgICAgdGhpcy5fcHJldmlvdXNIb3N0UGFyZW50LmFwcGVuZENoaWxkKHRoaXMuX2hvc3QpO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGFjaFJlc3VsdCA9IHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2gocG9ydGFsKTtcblxuICAgIGlmICh0aGlzLl9wb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LmF0dGFjaCh0aGlzKTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVTdGFja2luZ09yZGVyKCk7XG4gICAgdGhpcy5fdXBkYXRlRWxlbWVudFNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVFbGVtZW50RGlyZWN0aW9uKCk7XG5cbiAgICBpZiAodGhpcy5fc2Nyb2xsU3RyYXRlZ3kpIHtcbiAgICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LmVuYWJsZSgpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gY2xlYW4gdGhpcyB1cCBvdXJzZWx2ZXMsIGJlY2F1c2Ugd2UncmUgcGFzc2luZyBpbiBhblxuICAgIC8vIGBFbnZpcm9ubWVudEluamVjdG9yYCBiZWxvdyB3aGljaCB3b24ndCBldmVyIGJlIGRlc3Ryb3llZC5cbiAgICAvLyBPdGhlcndpc2UgaXQgY2F1c2VzIHNvbWUgY2FsbGJhY2tzIHRvIGJlIHJldGFpbmVkIChzZWUgIzI5Njk2KS5cbiAgICB0aGlzLl9hZnRlck5leHRSZW5kZXJSZWY/LmRlc3Ryb3koKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb25jZSB0aGUgb3ZlcmxheSBpcyBmdWxseSByZW5kZXJlZCBiZWZvcmUgYXR0ZW1wdGluZyB0byBwb3NpdGlvbiBpdCxcbiAgICAvLyBhcyB0aGUgcG9zaXRpb24gbWF5IGRlcGVuZCBvbiB0aGUgc2l6ZSBvZiB0aGUgcmVuZGVyZWQgY29udGVudC5cbiAgICB0aGlzLl9hZnRlck5leHRSZW5kZXJSZWYgPSBhZnRlck5leHRSZW5kZXIoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBvdmVybGF5IGNvdWxkJ3ZlIGJlZW4gZGV0YWNoZWQgYmVmb3JlIHRoZSBjYWxsYmFjayBleGVjdXRlZC5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtpbmplY3RvcjogdGhpcy5faW5qZWN0b3J9LFxuICAgICk7XG5cbiAgICAvLyBFbmFibGUgcG9pbnRlciBldmVudHMgZm9yIHRoZSBvdmVybGF5IHBhbmUgZWxlbWVudC5cbiAgICB0aGlzLl90b2dnbGVQb2ludGVyRXZlbnRzKHRydWUpO1xuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5oYXNCYWNrZHJvcCkge1xuICAgICAgdGhpcy5fYXR0YWNoQmFja2Ryb3AoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY29uZmlnLnBhbmVsQ2xhc3MpIHtcbiAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzZXModGhpcy5fcGFuZSwgdGhpcy5fY29uZmlnLnBhbmVsQ2xhc3MsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgZW1pdCB0aGUgYGF0dGFjaG1lbnRzYCBldmVudCBvbmNlIGFsbCBvdGhlciBzZXR1cCBpcyBkb25lLlxuICAgIHRoaXMuX2F0dGFjaG1lbnRzLm5leHQoKTtcblxuICAgIC8vIFRyYWNrIHRoaXMgb3ZlcmxheSBieSB0aGUga2V5Ym9hcmQgZGlzcGF0Y2hlclxuICAgIHRoaXMuX2tleWJvYXJkRGlzcGF0Y2hlci5hZGQodGhpcyk7XG5cbiAgICBpZiAodGhpcy5fY29uZmlnLmRpc3Bvc2VPbk5hdmlnYXRpb24pIHtcbiAgICAgIHRoaXMuX2xvY2F0aW9uQ2hhbmdlcyA9IHRoaXMuX2xvY2F0aW9uLnN1YnNjcmliZSgoKSA9PiB0aGlzLmRpc3Bvc2UoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3V0c2lkZUNsaWNrRGlzcGF0Y2hlci5hZGQodGhpcyk7XG5cbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogdGhlIG51bGwgY2hlY2sgaXMgaGVyZSwgYmVjYXVzZSB0aGUgcG9ydGFsIG91dGxldCByZXR1cm5zIGBhbnlgLlxuICAgIC8vIFdlIHNob3VsZCBiZSBndWFyYW50ZWVkIGZvciB0aGUgcmVzdWx0IHRvIGJlIGBDb21wb25lbnRSZWYgfCBFbWJlZGRlZFZpZXdSZWZgLCBidXRcbiAgICAvLyBgaW5zdGFuY2VvZiBFbWJlZGRlZFZpZXdSZWZgIGRvZXNuJ3QgYXBwZWFyIHRvIHdvcmsgYXQgdGhlIG1vbWVudC5cbiAgICBpZiAodHlwZW9mIGF0dGFjaFJlc3VsdD8ub25EZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBJbiBtb3N0IGNhc2VzIHdlIGNvbnRyb2wgdGhlIHBvcnRhbCBhbmQgd2Uga25vdyB3aGVuIGl0IGlzIGJlaW5nIGRldGFjaGVkIHNvIHRoYXRcbiAgICAgIC8vIHdlIGNhbiBmaW5pc2ggdGhlIGRpc3Bvc2FsIHByb2Nlc3MuIFRoZSBleGNlcHRpb24gaXMgaWYgdGhlIHVzZXIgcGFzc2VzIGluIGEgY3VzdG9tXG4gICAgICAvLyBgVmlld0NvbnRhaW5lclJlZmAgdGhhdCBpc24ndCBkZXN0cm95ZWQgdGhyb3VnaCB0aGUgb3ZlcmxheSBBUEkuIE5vdGUgdGhhdCB3ZSB1c2VcbiAgICAgIC8vIGBkZXRhY2hgIGhlcmUgaW5zdGVhZCBvZiBgZGlzcG9zZWAsIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBpZiB0aGUgdXNlciBpbnRlbmRzIHRvXG4gICAgICAvLyByZWF0dGFjaCB0aGUgb3ZlcmxheSBhdCBhIGxhdGVyIHBvaW50LiBJdCBhbHNvIGhhcyB0aGUgYWR2YW50YWdlIG9mIHdhaXRpbmcgZm9yIGFuaW1hdGlvbnMuXG4gICAgICBhdHRhY2hSZXN1bHQub25EZXN0cm95KCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgICAgIC8vIFdlIGhhdmUgdG8gZGVsYXkgdGhlIGBkZXRhY2hgIGNhbGwsIGJlY2F1c2UgZGV0YWNoaW5nIGltbWVkaWF0ZWx5IHByZXZlbnRzXG4gICAgICAgICAgLy8gb3RoZXIgZGVzdHJveSBob29rcyBmcm9tIHJ1bm5pbmcuIFRoaXMgaXMgbGlrZWx5IGEgZnJhbWV3b3JrIGJ1ZyBzaW1pbGFyIHRvXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDYxMTlcbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLmRldGFjaCgpKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRhY2hSZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgYW4gb3ZlcmxheSBmcm9tIGEgcG9ydGFsLlxuICAgKiBAcmV0dXJucyBUaGUgcG9ydGFsIGRldGFjaG1lbnQgcmVzdWx0LlxuICAgKi9cbiAgZGV0YWNoKCk6IGFueSB7XG4gICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRldGFjaEJhY2tkcm9wKCk7XG5cbiAgICAvLyBXaGVuIHRoZSBvdmVybGF5IGlzIGRldGFjaGVkLCB0aGUgcGFuZSBlbGVtZW50IHNob3VsZCBkaXNhYmxlIHBvaW50ZXIgZXZlbnRzLlxuICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugb3RoZXJ3aXNlIHRoZSBwYW5lIGVsZW1lbnQgd2lsbCBjb3ZlciB0aGUgcGFnZSBhbmQgZGlzYWJsZVxuICAgIC8vIHBvaW50ZXIgZXZlbnRzIHRoZXJlZm9yZS4gRGVwZW5kcyBvbiB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgYW5kIHRoZSBhcHBsaWVkIHBhbmUgYm91bmRhcmllcy5cbiAgICB0aGlzLl90b2dnbGVQb2ludGVyRXZlbnRzKGZhbHNlKTtcblxuICAgIGlmICh0aGlzLl9wb3NpdGlvblN0cmF0ZWd5ICYmIHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3kuZGV0YWNoKSB7XG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LmRldGFjaCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zY3JvbGxTdHJhdGVneSkge1xuICAgICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kuZGlzYWJsZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGRldGFjaG1lbnRSZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuZGV0YWNoKCk7XG5cbiAgICAvLyBPbmx5IGVtaXQgYWZ0ZXIgZXZlcnl0aGluZyBpcyBkZXRhY2hlZC5cbiAgICB0aGlzLl9kZXRhY2htZW50cy5uZXh0KCk7XG5cbiAgICAvLyBSZW1vdmUgdGhpcyBvdmVybGF5IGZyb20ga2V5Ym9hcmQgZGlzcGF0Y2hlciB0cmFja2luZy5cbiAgICB0aGlzLl9rZXlib2FyZERpc3BhdGNoZXIucmVtb3ZlKHRoaXMpO1xuXG4gICAgLy8gS2VlcGluZyB0aGUgaG9zdCBlbGVtZW50IGluIHRoZSBET00gY2FuIGNhdXNlIHNjcm9sbCBqYW5rLCBiZWNhdXNlIGl0IHN0aWxsIGdldHNcbiAgICAvLyByZW5kZXJlZCwgZXZlbiB0aG91Z2ggaXQncyB0cmFuc3BhcmVudCBhbmQgdW5jbGlja2FibGUgd2hpY2ggaXMgd2h5IHdlIHJlbW92ZSBpdC5cbiAgICB0aGlzLl9kZXRhY2hDb250ZW50V2hlbkVtcHR5KCk7XG4gICAgdGhpcy5fbG9jYXRpb25DaGFuZ2VzLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fb3V0c2lkZUNsaWNrRGlzcGF0Y2hlci5yZW1vdmUodGhpcyk7XG4gICAgcmV0dXJuIGRldGFjaG1lbnRSZXN1bHQ7XG4gIH1cblxuICAvKiogQ2xlYW5zIHVwIHRoZSBvdmVybGF5IGZyb20gdGhlIERPTS4gKi9cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBjb25zdCBpc0F0dGFjaGVkID0gdGhpcy5oYXNBdHRhY2hlZCgpO1xuXG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3kpIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3kuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2Rpc3Bvc2VTY3JvbGxTdHJhdGVneSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2VCYWNrZHJvcCh0aGlzLl9iYWNrZHJvcEVsZW1lbnQpO1xuICAgIHRoaXMuX2xvY2F0aW9uQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2tleWJvYXJkRGlzcGF0Y2hlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fcG9ydGFsT3V0bGV0LmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9hdHRhY2htZW50cy5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2JhY2tkcm9wQ2xpY2suY29tcGxldGUoKTtcbiAgICB0aGlzLl9rZXlkb3duRXZlbnRzLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fb3V0c2lkZVBvaW50ZXJFdmVudHMuY29tcGxldGUoKTtcbiAgICB0aGlzLl9vdXRzaWRlQ2xpY2tEaXNwYXRjaGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9ob3N0Py5yZW1vdmUoKTtcbiAgICB0aGlzLl9hZnRlck5leHRSZW5kZXJSZWY/LmRlc3Ryb3koKTtcblxuICAgIHRoaXMuX3ByZXZpb3VzSG9zdFBhcmVudCA9IHRoaXMuX3BhbmUgPSB0aGlzLl9ob3N0ID0gbnVsbCE7XG5cbiAgICBpZiAoaXNBdHRhY2hlZCkge1xuICAgICAgdGhpcy5fZGV0YWNobWVudHMubmV4dCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2RldGFjaG1lbnRzLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fYWZ0ZXJSZW5kZXJSZWYuZGVzdHJveSgpO1xuICAgIHRoaXMuX3JlbmRlcnMuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGhhcyBhdHRhY2hlZCBjb250ZW50LiAqL1xuICBoYXNBdHRhY2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcG9ydGFsT3V0bGV0Lmhhc0F0dGFjaGVkKCk7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiB0aGUgYmFja2Ryb3AgaGFzIGJlZW4gY2xpY2tlZC4gKi9cbiAgYmFja2Ryb3BDbGljaygpOiBPYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYmFja2Ryb3BDbGljaztcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIHRoZSBvdmVybGF5IGhhcyBiZWVuIGF0dGFjaGVkLiAqL1xuICBhdHRhY2htZW50cygpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNobWVudHM7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiB0aGUgb3ZlcmxheSBoYXMgYmVlbiBkZXRhY2hlZC4gKi9cbiAgZGV0YWNobWVudHMoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RldGFjaG1lbnRzO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb2JzZXJ2YWJsZSBvZiBrZXlkb3duIGV2ZW50cyB0YXJnZXRlZCB0byB0aGlzIG92ZXJsYXkuICovXG4gIGtleWRvd25FdmVudHMoKTogT2JzZXJ2YWJsZTxLZXlib2FyZEV2ZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuX2tleWRvd25FdmVudHM7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIG9mIHBvaW50ZXIgZXZlbnRzIHRhcmdldGVkIG91dHNpZGUgdGhpcyBvdmVybGF5LiAqL1xuICBvdXRzaWRlUG9pbnRlckV2ZW50cygpOiBPYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fb3V0c2lkZVBvaW50ZXJFdmVudHM7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudCBvdmVybGF5IGNvbmZpZ3VyYXRpb24sIHdoaWNoIGlzIGltbXV0YWJsZS4gKi9cbiAgZ2V0Q29uZmlnKCk6IE92ZXJsYXlDb25maWcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkgYmFzZWQgb24gdGhlIHBvc2l0aW9uIHN0cmF0ZWd5LiAqL1xuICB1cGRhdGVQb3NpdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcG9zaXRpb25TdHJhdGVneSkge1xuICAgICAgdGhpcy5fcG9zaXRpb25TdHJhdGVneS5hcHBseSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTd2l0Y2hlcyB0byBhIG5ldyBwb3NpdGlvbiBzdHJhdGVneSBhbmQgdXBkYXRlcyB0aGUgb3ZlcmxheSBwb3NpdGlvbi4gKi9cbiAgdXBkYXRlUG9zaXRpb25TdHJhdGVneShzdHJhdGVneTogUG9zaXRpb25TdHJhdGVneSk6IHZvaWQge1xuICAgIGlmIChzdHJhdGVneSA9PT0gdGhpcy5fcG9zaXRpb25TdHJhdGVneSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5ID0gc3RyYXRlZ3k7XG5cbiAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICBzdHJhdGVneS5hdHRhY2godGhpcyk7XG4gICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgc2l6ZSBwcm9wZXJ0aWVzIG9mIHRoZSBvdmVybGF5LiAqL1xuICB1cGRhdGVTaXplKHNpemVDb25maWc6IE92ZXJsYXlTaXplQ29uZmlnKTogdm9pZCB7XG4gICAgdGhpcy5fY29uZmlnID0gey4uLnRoaXMuX2NvbmZpZywgLi4uc2l6ZUNvbmZpZ307XG4gICAgdGhpcy5fdXBkYXRlRWxlbWVudFNpemUoKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBMVFIvUlRMIGRpcmVjdGlvbiBmb3IgdGhlIG92ZXJsYXkuICovXG4gIHNldERpcmVjdGlvbihkaXI6IERpcmVjdGlvbiB8IERpcmVjdGlvbmFsaXR5KTogdm9pZCB7XG4gICAgdGhpcy5fY29uZmlnID0gey4uLnRoaXMuX2NvbmZpZywgZGlyZWN0aW9uOiBkaXJ9O1xuICAgIHRoaXMuX3VwZGF0ZUVsZW1lbnREaXJlY3Rpb24oKTtcbiAgfVxuXG4gIC8qKiBBZGQgYSBDU1MgY2xhc3Mgb3IgYW4gYXJyYXkgb2YgY2xhc3NlcyB0byB0aGUgb3ZlcmxheSBwYW5lLiAqL1xuICBhZGRQYW5lbENsYXNzKGNsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbmUpIHtcbiAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzZXModGhpcy5fcGFuZSwgY2xhc3NlcywgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZSBhIENTUyBjbGFzcyBvciBhbiBhcnJheSBvZiBjbGFzc2VzIGZyb20gdGhlIG92ZXJsYXkgcGFuZS4gKi9cbiAgcmVtb3ZlUGFuZWxDbGFzcyhjbGFzc2VzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYW5lKSB7XG4gICAgICB0aGlzLl90b2dnbGVDbGFzc2VzKHRoaXMuX3BhbmUsIGNsYXNzZXMsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgb3ZlcmxheSBwYW5lbC5cbiAgICovXG4gIGdldERpcmVjdGlvbigpOiBEaXJlY3Rpb24ge1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuX2NvbmZpZy5kaXJlY3Rpb247XG5cbiAgICBpZiAoIWRpcmVjdGlvbikge1xuICAgICAgcmV0dXJuICdsdHInO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlb2YgZGlyZWN0aW9uID09PSAnc3RyaW5nJyA/IGRpcmVjdGlvbiA6IGRpcmVjdGlvbi52YWx1ZTtcbiAgfVxuXG4gIC8qKiBTd2l0Y2hlcyB0byBhIG5ldyBzY3JvbGwgc3RyYXRlZ3kuICovXG4gIHVwZGF0ZVNjcm9sbFN0cmF0ZWd5KHN0cmF0ZWd5OiBTY3JvbGxTdHJhdGVneSk6IHZvaWQge1xuICAgIGlmIChzdHJhdGVneSA9PT0gdGhpcy5fc2Nyb2xsU3RyYXRlZ3kpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwb3NlU2Nyb2xsU3RyYXRlZ3koKTtcbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHN0cmF0ZWd5O1xuXG4gICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgc3RyYXRlZ3kuYXR0YWNoKHRoaXMpO1xuICAgICAgc3RyYXRlZ3kuZW5hYmxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHRleHQgZGlyZWN0aW9uIG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuICBwcml2YXRlIF91cGRhdGVFbGVtZW50RGlyZWN0aW9uKCkge1xuICAgIHRoaXMuX2hvc3Quc2V0QXR0cmlidXRlKCdkaXInLCB0aGlzLmdldERpcmVjdGlvbigpKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzaXplIG9mIHRoZSBvdmVybGF5IGVsZW1lbnQgYmFzZWQgb24gdGhlIG92ZXJsYXkgY29uZmlnLiAqL1xuICBwcml2YXRlIF91cGRhdGVFbGVtZW50U2l6ZSgpIHtcbiAgICBpZiAoIXRoaXMuX3BhbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZSA9IHRoaXMuX3BhbmUuc3R5bGU7XG5cbiAgICBzdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLndpZHRoKTtcbiAgICBzdHlsZS5oZWlnaHQgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHRoaXMuX2NvbmZpZy5oZWlnaHQpO1xuICAgIHN0eWxlLm1pbldpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZSh0aGlzLl9jb25maWcubWluV2lkdGgpO1xuICAgIHN0eWxlLm1pbkhlaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLm1pbkhlaWdodCk7XG4gICAgc3R5bGUubWF4V2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHRoaXMuX2NvbmZpZy5tYXhXaWR0aCk7XG4gICAgc3R5bGUubWF4SGVpZ2h0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZSh0aGlzLl9jb25maWcubWF4SGVpZ2h0KTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBwb2ludGVyIGV2ZW50cyBmb3IgdGhlIG92ZXJsYXkgcGFuZSBlbGVtZW50LiAqL1xuICBwcml2YXRlIF90b2dnbGVQb2ludGVyRXZlbnRzKGVuYWJsZVBvaW50ZXI6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9wYW5lLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBlbmFibGVQb2ludGVyID8gJycgOiAnbm9uZSc7XG4gIH1cblxuICAvKiogQXR0YWNoZXMgYSBiYWNrZHJvcCBmb3IgdGhpcyBvdmVybGF5LiAqL1xuICBwcml2YXRlIF9hdHRhY2hCYWNrZHJvcCgpIHtcbiAgICBjb25zdCBzaG93aW5nQ2xhc3MgPSAnY2RrLW92ZXJsYXktYmFja2Ryb3Atc2hvd2luZyc7XG5cbiAgICB0aGlzLl9iYWNrZHJvcEVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9iYWNrZHJvcEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2RrLW92ZXJsYXktYmFja2Ryb3AnKTtcblxuICAgIGlmICh0aGlzLl9hbmltYXRpb25zRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2JhY2tkcm9wRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjZGstb3ZlcmxheS1iYWNrZHJvcC1ub29wLWFuaW1hdGlvbicpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jb25maWcuYmFja2Ryb3BDbGFzcykge1xuICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3Nlcyh0aGlzLl9iYWNrZHJvcEVsZW1lbnQsIHRoaXMuX2NvbmZpZy5iYWNrZHJvcENsYXNzLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBJbnNlcnQgdGhlIGJhY2tkcm9wIGJlZm9yZSB0aGUgcGFuZSBpbiB0aGUgRE9NIG9yZGVyLFxuICAgIC8vIGluIG9yZGVyIHRvIGhhbmRsZSBzdGFja2VkIG92ZXJsYXlzIHByb3Blcmx5LlxuICAgIHRoaXMuX2hvc3QucGFyZW50RWxlbWVudCEuaW5zZXJ0QmVmb3JlKHRoaXMuX2JhY2tkcm9wRWxlbWVudCwgdGhpcy5faG9zdCk7XG5cbiAgICAvLyBGb3J3YXJkIGJhY2tkcm9wIGNsaWNrcyBzdWNoIHRoYXQgdGhlIGNvbnN1bWVyIG9mIHRoZSBvdmVybGF5IGNhbiBwZXJmb3JtIHdoYXRldmVyXG4gICAgLy8gYWN0aW9uIGRlc2lyZWQgd2hlbiBzdWNoIGEgY2xpY2sgb2NjdXJzICh1c3VhbGx5IGNsb3NpbmcgdGhlIG92ZXJsYXkpLlxuICAgIHRoaXMuX2JhY2tkcm9wRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2JhY2tkcm9wQ2xpY2tIYW5kbGVyKTtcblxuICAgIC8vIEFkZCBjbGFzcyB0byBmYWRlLWluIHRoZSBiYWNrZHJvcCBhZnRlciBvbmUgZnJhbWUuXG4gICAgaWYgKCF0aGlzLl9hbmltYXRpb25zRGlzYWJsZWQgJiYgdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuX2JhY2tkcm9wRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fYmFja2Ryb3BFbGVtZW50LmNsYXNzTGlzdC5hZGQoc2hvd2luZ0NsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2JhY2tkcm9wRWxlbWVudC5jbGFzc0xpc3QuYWRkKHNob3dpbmdDbGFzcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHN0YWNraW5nIG9yZGVyIG9mIHRoZSBlbGVtZW50LCBtb3ZpbmcgaXQgdG8gdGhlIHRvcCBpZiBuZWNlc3NhcnkuXG4gICAqIFRoaXMgaXMgcmVxdWlyZWQgaW4gY2FzZXMgd2hlcmUgb25lIG92ZXJsYXkgd2FzIGRldGFjaGVkLCB3aGlsZSBhbm90aGVyIG9uZSxcbiAgICogdGhhdCBzaG91bGQgYmUgYmVoaW5kIGl0LCB3YXMgZGVzdHJveWVkLiBUaGUgbmV4dCB0aW1lIGJvdGggb2YgdGhlbSBhcmUgb3BlbmVkLFxuICAgKiB0aGUgc3RhY2tpbmcgd2lsbCBiZSB3cm9uZywgYmVjYXVzZSB0aGUgZGV0YWNoZWQgZWxlbWVudCdzIHBhbmUgd2lsbCBzdGlsbCBiZVxuICAgKiBpbiBpdHMgb3JpZ2luYWwgRE9NIHBvc2l0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU3RhY2tpbmdPcmRlcigpIHtcbiAgICBpZiAodGhpcy5faG9zdC5uZXh0U2libGluZykge1xuICAgICAgdGhpcy5faG9zdC5wYXJlbnROb2RlIS5hcHBlbmRDaGlsZCh0aGlzLl9ob3N0KTtcbiAgICB9XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhlIGJhY2tkcm9wIChpZiBhbnkpIGFzc29jaWF0ZWQgd2l0aCB0aGUgb3ZlcmxheS4gKi9cbiAgZGV0YWNoQmFja2Ryb3AoKTogdm9pZCB7XG4gICAgY29uc3QgYmFja2Ryb3BUb0RldGFjaCA9IHRoaXMuX2JhY2tkcm9wRWxlbWVudDtcblxuICAgIGlmICghYmFja2Ryb3BUb0RldGFjaCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9hbmltYXRpb25zRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2VCYWNrZHJvcChiYWNrZHJvcFRvRGV0YWNoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBiYWNrZHJvcFRvRGV0YWNoLmNsYXNzTGlzdC5yZW1vdmUoJ2Nkay1vdmVybGF5LWJhY2tkcm9wLXNob3dpbmcnKTtcblxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBiYWNrZHJvcFRvRGV0YWNoIS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgdGhpcy5fYmFja2Ryb3BUcmFuc2l0aW9uZW5kSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgYmFja2Ryb3AgZG9lc24ndCBoYXZlIGEgdHJhbnNpdGlvbiwgdGhlIGB0cmFuc2l0aW9uZW5kYCBldmVudCB3b24ndCBmaXJlLlxuICAgIC8vIEluIHRoaXMgY2FzZSB3ZSBtYWtlIGl0IHVuY2xpY2thYmxlIGFuZCB3ZSB0cnkgdG8gcmVtb3ZlIGl0IGFmdGVyIGEgZGVsYXkuXG4gICAgYmFja2Ryb3BUb0RldGFjaC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgLy8gUnVuIHRoaXMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lIGJlY2F1c2UgdGhlcmUncyBub3RoaW5nIHRoYXQgQW5ndWxhciBjYXJlcyBhYm91dC5cbiAgICAvLyBJZiBpdCB3ZXJlIHRvIHJ1biBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSwgZXZlcnkgdGVzdCB0aGF0IHVzZWQgT3ZlcmxheSB3b3VsZCBoYXZlIHRvIGJlXG4gICAgLy8gZWl0aGVyIGFzeW5jIG9yIGZha2VBc3luYy5cbiAgICB0aGlzLl9iYWNrZHJvcFRpbWVvdXQgPSB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9kaXNwb3NlQmFja2Ryb3AoYmFja2Ryb3BUb0RldGFjaCk7XG4gICAgICB9LCA1MDApLFxuICAgICk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyBhIHNpbmdsZSBDU1MgY2xhc3Mgb3IgYW4gYXJyYXkgb2YgY2xhc3NlcyBvbiBhbiBlbGVtZW50LiAqL1xuICBwcml2YXRlIF90b2dnbGVDbGFzc2VzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBjc3NDbGFzc2VzOiBzdHJpbmcgfCBzdHJpbmdbXSwgaXNBZGQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBjbGFzc2VzID0gY29lcmNlQXJyYXkoY3NzQ2xhc3NlcyB8fCBbXSkuZmlsdGVyKGMgPT4gISFjKTtcblxuICAgIGlmIChjbGFzc2VzLmxlbmd0aCkge1xuICAgICAgaXNBZGQgPyBlbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4uY2xhc3NlcykgOiBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoLi4uY2xhc3Nlcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoZSBvdmVybGF5IGNvbnRlbnQgbmV4dCB0aW1lIHRoZSB6b25lIHN0YWJpbGl6ZXMuICovXG4gIHByaXZhdGUgX2RldGFjaENvbnRlbnRXaGVuRW1wdHkoKSB7XG4gICAgLy8gTm9ybWFsbHkgd2Ugd291bGRuJ3QgaGF2ZSB0byBleHBsaWNpdGx5IHJ1biB0aGlzIG91dHNpZGUgdGhlIGBOZ1pvbmVgLCBob3dldmVyXG4gICAgLy8gaWYgdGhlIGNvbnN1bWVyIGlzIHVzaW5nIGB6b25lLXBhdGNoLXJ4anNgLCB0aGUgYFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZWAgY2FsbCB3aWxsXG4gICAgLy8gYmUgcGF0Y2hlZCB0byBydW4gaW5zaWRlIHRoZSB6b25lLCB3aGljaCB3aWxsIHRocm93IHVzIGludG8gYW4gaW5maW5pdGUgbG9vcC5cbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgLy8gV2UgY2FuJ3QgcmVtb3ZlIHRoZSBob3N0IGhlcmUgaW1tZWRpYXRlbHksIGJlY2F1c2UgdGhlIG92ZXJsYXkgcGFuZSdzIGNvbnRlbnRcbiAgICAgIC8vIG1pZ2h0IHN0aWxsIGJlIGFuaW1hdGluZy4gVGhpcyBzdHJlYW0gaGVscHMgdXMgYXZvaWQgaW50ZXJydXB0aW5nIHRoZSBhbmltYXRpb25cbiAgICAgIC8vIGJ5IHdhaXRpbmcgZm9yIHRoZSBwYW5lIHRvIGJlY29tZSBlbXB0eS5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX3JlbmRlcnNcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKG1lcmdlKHRoaXMuX2F0dGFjaG1lbnRzLCB0aGlzLl9kZXRhY2htZW50cykpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAvLyBOZWVkcyBhIGNvdXBsZSBvZiBjaGVja3MgZm9yIHRoZSBwYW5lIGFuZCBob3N0LCBiZWNhdXNlXG4gICAgICAgICAgLy8gdGhleSBtYXkgaGF2ZSBiZWVuIHJlbW92ZWQgYnkgdGhlIHRpbWUgdGhlIHpvbmUgc3RhYmlsaXplcy5cbiAgICAgICAgICBpZiAoIXRoaXMuX3BhbmUgfHwgIXRoaXMuX2hvc3QgfHwgdGhpcy5fcGFuZS5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wYW5lICYmIHRoaXMuX2NvbmZpZy5wYW5lbENsYXNzKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzZXModGhpcy5fcGFuZSwgdGhpcy5fY29uZmlnLnBhbmVsQ2xhc3MsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2hvc3QgJiYgdGhpcy5faG9zdC5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzSG9zdFBhcmVudCA9IHRoaXMuX2hvc3QucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgdGhpcy5faG9zdC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBEaXNwb3NlcyBvZiBhIHNjcm9sbCBzdHJhdGVneS4gKi9cbiAgcHJpdmF0ZSBfZGlzcG9zZVNjcm9sbFN0cmF0ZWd5KCkge1xuICAgIGNvbnN0IHNjcm9sbFN0cmF0ZWd5ID0gdGhpcy5fc2Nyb2xsU3RyYXRlZ3k7XG5cbiAgICBpZiAoc2Nyb2xsU3RyYXRlZ3kpIHtcbiAgICAgIHNjcm9sbFN0cmF0ZWd5LmRpc2FibGUoKTtcblxuICAgICAgaWYgKHNjcm9sbFN0cmF0ZWd5LmRldGFjaCkge1xuICAgICAgICBzY3JvbGxTdHJhdGVneS5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUmVtb3ZlcyBhIGJhY2tkcm9wIGVsZW1lbnQgZnJvbSB0aGUgRE9NLiAqL1xuICBwcml2YXRlIF9kaXNwb3NlQmFja2Ryb3AoYmFja2Ryb3A6IEhUTUxFbGVtZW50IHwgbnVsbCkge1xuICAgIGlmIChiYWNrZHJvcCkge1xuICAgICAgYmFja2Ryb3AucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9iYWNrZHJvcENsaWNrSGFuZGxlcik7XG4gICAgICBiYWNrZHJvcC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgdGhpcy5fYmFja2Ryb3BUcmFuc2l0aW9uZW5kSGFuZGxlcik7XG4gICAgICBiYWNrZHJvcC5yZW1vdmUoKTtcblxuICAgICAgLy8gSXQgaXMgcG9zc2libGUgdGhhdCBhIG5ldyBwb3J0YWwgaGFzIGJlZW4gYXR0YWNoZWQgdG8gdGhpcyBvdmVybGF5IHNpbmNlIHdlIHN0YXJ0ZWRcbiAgICAgIC8vIHJlbW92aW5nIHRoZSBiYWNrZHJvcC4gSWYgdGhhdCBpcyB0aGUgY2FzZSwgb25seSBjbGVhciB0aGUgYmFja2Ryb3AgcmVmZXJlbmNlIGlmIGl0XG4gICAgICAvLyBpcyBzdGlsbCB0aGUgc2FtZSBpbnN0YW5jZSB0aGF0IHdlIHN0YXJ0ZWQgdG8gcmVtb3ZlLlxuICAgICAgaWYgKHRoaXMuX2JhY2tkcm9wRWxlbWVudCA9PT0gYmFja2Ryb3ApIHtcbiAgICAgICAgdGhpcy5fYmFja2Ryb3BFbGVtZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYmFja2Ryb3BUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYmFja2Ryb3BUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2JhY2tkcm9wVGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFNpemUgcHJvcGVydGllcyBmb3IgYW4gb3ZlcmxheS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheVNpemVDb25maWcge1xuICB3aWR0aD86IG51bWJlciB8IHN0cmluZztcbiAgaGVpZ2h0PzogbnVtYmVyIHwgc3RyaW5nO1xuICBtaW5XaWR0aD86IG51bWJlciB8IHN0cmluZztcbiAgbWluSGVpZ2h0PzogbnVtYmVyIHwgc3RyaW5nO1xuICBtYXhXaWR0aD86IG51bWJlciB8IHN0cmluZztcbiAgbWF4SGVpZ2h0PzogbnVtYmVyIHwgc3RyaW5nO1xufVxuIl19