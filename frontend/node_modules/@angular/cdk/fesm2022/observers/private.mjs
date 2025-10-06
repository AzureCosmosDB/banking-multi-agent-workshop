import * as i0 from '@angular/core';
import { inject, NgZone, Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, shareReplay, takeUntil } from 'rxjs/operators';

/**
 * Handler that logs "ResizeObserver loop limit exceeded" errors.
 * These errors are not shown in the Chrome console, so we log them to ensure developers are aware.
 * @param e The error
 */
const loopLimitExceededErrorHandler = (e) => {
    if (e instanceof ErrorEvent && e.message === 'ResizeObserver loop limit exceeded') {
        console.error(`${e.message}. This could indicate a performance issue with your app. See https://github.com/WICG/resize-observer/blob/master/explainer.md#error-handling`);
    }
};
/**
 * A shared ResizeObserver to be used for a particular box type (content-box, border-box, or
 * device-pixel-content-box)
 */
class SingleBoxSharedResizeObserver {
    constructor(
    /** The box type to observe for resizes. */
    _box) {
        this._box = _box;
        /** Stream that emits when the shared observer is destroyed. */
        this._destroyed = new Subject();
        /** Stream of all events from the ResizeObserver. */
        this._resizeSubject = new Subject();
        /** A map of elements to streams of their resize events. */
        this._elementObservables = new Map();
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(entries => this._resizeSubject.next(entries));
        }
    }
    /**
     * Gets a stream of resize events for the given element.
     * @param target The element to observe.
     * @return The stream of resize events for the element.
     */
    observe(target) {
        if (!this._elementObservables.has(target)) {
            this._elementObservables.set(target, new Observable(observer => {
                const subscription = this._resizeSubject.subscribe(observer);
                this._resizeObserver?.observe(target, { box: this._box });
                return () => {
                    this._resizeObserver?.unobserve(target);
                    subscription.unsubscribe();
                    this._elementObservables.delete(target);
                };
            }).pipe(filter(entries => entries.some(entry => entry.target === target)), 
            // Share a replay of the last event so that subsequent calls to observe the same element
            // receive initial sizing info like the first one. Also enable ref counting so the
            // element will be automatically unobserved when there are no more subscriptions.
            shareReplay({ bufferSize: 1, refCount: true }), takeUntil(this._destroyed)));
        }
        return this._elementObservables.get(target);
    }
    /** Destroys this instance. */
    destroy() {
        this._destroyed.next();
        this._destroyed.complete();
        this._resizeSubject.complete();
        this._elementObservables.clear();
    }
}
/**
 * Allows observing resize events on multiple elements using a shared set of ResizeObserver.
 * Sharing a ResizeObserver instance is recommended for better performance (see
 * https://github.com/WICG/resize-observer/issues/59).
 *
 * Rather than share a single `ResizeObserver`, this class creates one `ResizeObserver` per type
 * of observed box ('content-box', 'border-box', and 'device-pixel-content-box'). This avoids
 * later calls to `observe` with a different box type from influencing the events dispatched to
 * earlier calls.
 */
class SharedResizeObserver {
    constructor() {
        /** Map of box type to shared resize observer. */
        this._observers = new Map();
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        if (typeof ResizeObserver !== 'undefined' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            this._ngZone.runOutsideAngular(() => {
                window.addEventListener('error', loopLimitExceededErrorHandler);
            });
        }
    }
    ngOnDestroy() {
        for (const [, observer] of this._observers) {
            observer.destroy();
        }
        this._observers.clear();
        if (typeof ResizeObserver !== 'undefined' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            window.removeEventListener('error', loopLimitExceededErrorHandler);
        }
    }
    /**
     * Gets a stream of resize events for the given target element and box type.
     * @param target The element to observe for resizes.
     * @param options Options to pass to the `ResizeObserver`
     * @return The stream of resize events for the element.
     */
    observe(target, options) {
        const box = options?.box || 'content-box';
        if (!this._observers.has(box)) {
            this._observers.set(box, new SingleBoxSharedResizeObserver(box));
        }
        return this._observers.get(box).observe(target);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: SharedResizeObserver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: SharedResizeObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: SharedResizeObserver, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [] });

/**
 * Generated bundle index. Do not edit.
 */

export { SharedResizeObserver };
//# sourceMappingURL=private.mjs.map
