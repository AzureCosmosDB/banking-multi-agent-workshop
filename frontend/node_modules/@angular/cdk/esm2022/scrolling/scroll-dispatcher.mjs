/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceElement } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, Optional, Inject } from '@angular/core';
import { fromEvent, of as observableOf, Subject, Observable } from 'rxjs';
import { auditTime, filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;
/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
export class ScrollDispatcher {
    constructor(_ngZone, _platform, document) {
        this._ngZone = _ngZone;
        this._platform = _platform;
        /** Subject for notifying that a registered scrollable reference element has been scrolled. */
        this._scrolled = new Subject();
        /** Keeps track of the global `scroll` and `resize` subscriptions. */
        this._globalSubscription = null;
        /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
        this._scrolledCount = 0;
        /**
         * Map of all the scrollable references that are registered with the service and their
         * scroll event subscriptions.
         */
        this.scrollContainers = new Map();
        this._document = document;
    }
    /**
     * Registers a scrollable instance with the service and listens for its scrolled events. When the
     * scrollable is scrolled, the service emits the event to its scrolled observable.
     * @param scrollable Scrollable instance to be registered.
     */
    register(scrollable) {
        if (!this.scrollContainers.has(scrollable)) {
            this.scrollContainers.set(scrollable, scrollable.elementScrolled().subscribe(() => this._scrolled.next(scrollable)));
        }
    }
    /**
     * De-registers a Scrollable reference and unsubscribes from its scroll event observable.
     * @param scrollable Scrollable instance to be deregistered.
     */
    deregister(scrollable) {
        const scrollableReference = this.scrollContainers.get(scrollable);
        if (scrollableReference) {
            scrollableReference.unsubscribe();
            this.scrollContainers.delete(scrollable);
        }
    }
    /**
     * Returns an observable that emits an event whenever any of the registered Scrollable
     * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
     * to override the default "throttle" time.
     *
     * **Note:** in order to avoid hitting change detection for every scroll event,
     * all of the events emitted from this stream will be run outside the Angular zone.
     * If you need to update any data bindings as a result of a scroll event, you have
     * to run the callback using `NgZone.run`.
     */
    scrolled(auditTimeInMs = DEFAULT_SCROLL_TIME) {
        if (!this._platform.isBrowser) {
            return observableOf();
        }
        return new Observable((observer) => {
            if (!this._globalSubscription) {
                this._addGlobalListener();
            }
            // In the case of a 0ms delay, use an observable without auditTime
            // since it does add a perceptible delay in processing overhead.
            const subscription = auditTimeInMs > 0
                ? this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer)
                : this._scrolled.subscribe(observer);
            this._scrolledCount++;
            return () => {
                subscription.unsubscribe();
                this._scrolledCount--;
                if (!this._scrolledCount) {
                    this._removeGlobalListener();
                }
            };
        });
    }
    ngOnDestroy() {
        this._removeGlobalListener();
        this.scrollContainers.forEach((_, container) => this.deregister(container));
        this._scrolled.complete();
    }
    /**
     * Returns an observable that emits whenever any of the
     * scrollable ancestors of an element are scrolled.
     * @param elementOrElementRef Element whose ancestors to listen for.
     * @param auditTimeInMs Time to throttle the scroll events.
     */
    ancestorScrolled(elementOrElementRef, auditTimeInMs) {
        const ancestors = this.getAncestorScrollContainers(elementOrElementRef);
        return this.scrolled(auditTimeInMs).pipe(filter(target => {
            return !target || ancestors.indexOf(target) > -1;
        }));
    }
    /** Returns all registered Scrollables that contain the provided element. */
    getAncestorScrollContainers(elementOrElementRef) {
        const scrollingContainers = [];
        this.scrollContainers.forEach((_subscription, scrollable) => {
            if (this._scrollableContainsElement(scrollable, elementOrElementRef)) {
                scrollingContainers.push(scrollable);
            }
        });
        return scrollingContainers;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /** Returns true if the element is contained within the provided Scrollable. */
    _scrollableContainsElement(scrollable, elementOrElementRef) {
        let element = coerceElement(elementOrElementRef);
        let scrollableElement = scrollable.getElementRef().nativeElement;
        // Traverse through the element parents until we reach null, checking if any of the elements
        // are the scrollable's element.
        do {
            if (element == scrollableElement) {
                return true;
            }
        } while ((element = element.parentElement));
        return false;
    }
    /** Sets up the global scroll listeners. */
    _addGlobalListener() {
        this._globalSubscription = this._ngZone.runOutsideAngular(() => {
            const window = this._getWindow();
            return fromEvent(window.document, 'scroll').subscribe(() => this._scrolled.next());
        });
    }
    /** Cleans up the global scroll listener. */
    _removeGlobalListener() {
        if (this._globalSubscription) {
            this._globalSubscription.unsubscribe();
            this._globalSubscription = null;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollDispatcher, deps: [{ token: i0.NgZone }, { token: i1.Platform }, { token: DOCUMENT, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollDispatcher, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ScrollDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i1.Platform }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy9zY3JvbGwtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBYSxVQUFVLEVBQUUsTUFBTSxFQUFhLFFBQVEsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBZ0IsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7QUFFekMsOERBQThEO0FBQzlELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUV0Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBSTNCLFlBQ1UsT0FBZSxFQUNmLFNBQW1CLEVBQ0csUUFBYTtRQUZuQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQU03Qiw4RkFBOEY7UUFDN0UsY0FBUyxHQUFHLElBQUksT0FBTyxFQUF3QixDQUFDO1FBRWpFLHFFQUFxRTtRQUNyRSx3QkFBbUIsR0FBd0IsSUFBSSxDQUFDO1FBRWhELGlHQUFpRztRQUN6RixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUUzQjs7O1dBR0c7UUFDSCxxQkFBZ0IsR0FBcUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWhCN0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENB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QyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCw0Q0FBNEM7SUFDcEMscUJBQXFCO1FBQzNCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7cUhBMUtVLGdCQUFnQixnRUFPTCxRQUFRO3lIQVBuQixnQkFBZ0IsY0FESixNQUFNOztrR0FDbEIsZ0JBQWdCO2tCQUQ1QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBUTNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUVsZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgT3B0aW9uYWwsIEluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgb2YgYXMgb2JzZXJ2YWJsZU9mLCBTdWJqZWN0LCBTdWJzY3JpcHRpb24sIE9ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcbmltcG9ydCB7YXVkaXRUaW1lLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB0eXBlIHtDZGtTY3JvbGxhYmxlfSBmcm9tICcuL3Njcm9sbGFibGUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuLyoqIFRpbWUgaW4gbXMgdG8gdGhyb3R0bGUgdGhlIHNjcm9sbGluZyBldmVudHMgYnkgZGVmYXVsdC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NDUk9MTF9USU1FID0gMjA7XG5cbi8qKlxuICogU2VydmljZSBjb250YWluZWQgYWxsIHJlZ2lzdGVyZWQgU2Nyb2xsYWJsZSByZWZlcmVuY2VzIGFuZCBlbWl0cyBhbiBldmVudCB3aGVuIGFueSBvbmUgb2YgdGhlXG4gKiBTY3JvbGxhYmxlIHJlZmVyZW5jZXMgZW1pdCBhIHNjcm9sbGVkIGV2ZW50LlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBTY3JvbGxEaXNwYXRjaGVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFVzZWQgdG8gcmVmZXJlbmNlIGNvcnJlY3QgZG9jdW1lbnQvd2luZG93ICovXG4gIHByb3RlY3RlZCBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuICB9XG5cbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGF0IGEgcmVnaXN0ZXJlZCBzY3JvbGxhYmxlIHJlZmVyZW5jZSBlbGVtZW50IGhhcyBiZWVuIHNjcm9sbGVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zY3JvbGxlZCA9IG5ldyBTdWJqZWN0PENka1Njcm9sbGFibGUgfCB2b2lkPigpO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgZ2xvYmFsIGBzY3JvbGxgIGFuZCBgcmVzaXplYCBzdWJzY3JpcHRpb25zLiAqL1xuICBfZ2xvYmFsU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCBudWxsID0gbnVsbDtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGFtb3VudCBvZiBzdWJzY3JpcHRpb25zIHRvIGBzY3JvbGxlZGAuIFVzZWQgZm9yIGNsZWFuaW5nIHVwIGFmdGVyd2FyZHMuICovXG4gIHByaXZhdGUgX3Njcm9sbGVkQ291bnQgPSAwO1xuXG4gIC8qKlxuICAgKiBNYXAgb2YgYWxsIHRoZSBzY3JvbGxhYmxlIHJlZmVyZW5jZXMgdGhhdCBhcmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBzZXJ2aWNlIGFuZCB0aGVpclxuICAgKiBzY3JvbGwgZXZlbnQgc3Vic2NyaXB0aW9ucy5cbiAgICovXG4gIHNjcm9sbENvbnRhaW5lcnM6IE1hcDxDZGtTY3JvbGxhYmxlLCBTdWJzY3JpcHRpb24+ID0gbmV3IE1hcCgpO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBzY3JvbGxhYmxlIGluc3RhbmNlIHdpdGggdGhlIHNlcnZpY2UgYW5kIGxpc3RlbnMgZm9yIGl0cyBzY3JvbGxlZCBldmVudHMuIFdoZW4gdGhlXG4gICAqIHNjcm9sbGFibGUgaXMgc2Nyb2xsZWQsIHRoZSBzZXJ2aWNlIGVtaXRzIHRoZSBldmVudCB0byBpdHMgc2Nyb2xsZWQgb2JzZXJ2YWJsZS5cbiAgICogQHBhcmFtIHNjcm9sbGFibGUgU2Nyb2xsYWJsZSBpbnN0YW5jZSB0byBiZSByZWdpc3RlcmVkLlxuICAgKi9cbiAgcmVnaXN0ZXIoc2Nyb2xsYWJsZTogQ2RrU2Nyb2xsYWJsZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zY3JvbGxDb250YWluZXJzLmhhcyhzY3JvbGxhYmxlKSkge1xuICAgICAgdGhpcy5zY3JvbGxDb250YWluZXJzLnNldChcbiAgICAgICAgc2Nyb2xsYWJsZSxcbiAgICAgICAgc2Nyb2xsYWJsZS5lbGVtZW50U2Nyb2xsZWQoKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fc2Nyb2xsZWQubmV4dChzY3JvbGxhYmxlKSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZS1yZWdpc3RlcnMgYSBTY3JvbGxhYmxlIHJlZmVyZW5jZSBhbmQgdW5zdWJzY3JpYmVzIGZyb20gaXRzIHNjcm9sbCBldmVudCBvYnNlcnZhYmxlLlxuICAgKiBAcGFyYW0gc2Nyb2xsYWJsZSBTY3JvbGxhYmxlIGluc3RhbmNlIHRvIGJlIGRlcmVnaXN0ZXJlZC5cbiAgICovXG4gIGRlcmVnaXN0ZXIoc2Nyb2xsYWJsZTogQ2RrU2Nyb2xsYWJsZSk6IHZvaWQge1xuICAgIGNvbnN0IHNjcm9sbGFibGVSZWZlcmVuY2UgPSB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZ2V0KHNjcm9sbGFibGUpO1xuXG4gICAgaWYgKHNjcm9sbGFibGVSZWZlcmVuY2UpIHtcbiAgICAgIHNjcm9sbGFibGVSZWZlcmVuY2UudW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5kZWxldGUoc2Nyb2xsYWJsZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGFuIGV2ZW50IHdoZW5ldmVyIGFueSBvZiB0aGUgcmVnaXN0ZXJlZCBTY3JvbGxhYmxlXG4gICAqIHJlZmVyZW5jZXMgKG9yIHdpbmRvdywgZG9jdW1lbnQsIG9yIGJvZHkpIGZpcmUgYSBzY3JvbGxlZCBldmVudC4gQ2FuIHByb3ZpZGUgYSB0aW1lIGluIG1zXG4gICAqIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IFwidGhyb3R0bGVcIiB0aW1lLlxuICAgKlxuICAgKiAqKk5vdGU6KiogaW4gb3JkZXIgdG8gYXZvaWQgaGl0dGluZyBjaGFuZ2UgZGV0ZWN0aW9uIGZvciBldmVyeSBzY3JvbGwgZXZlbnQsXG4gICAqIGFsbCBvZiB0aGUgZXZlbnRzIGVtaXR0ZWQgZnJvbSB0aGlzIHN0cmVhbSB3aWxsIGJlIHJ1biBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqIElmIHlvdSBuZWVkIHRvIHVwZGF0ZSBhbnkgZGF0YSBiaW5kaW5ncyBhcyBhIHJlc3VsdCBvZiBhIHNjcm9sbCBldmVudCwgeW91IGhhdmVcbiAgICogdG8gcnVuIHRoZSBjYWxsYmFjayB1c2luZyBgTmdab25lLnJ1bmAuXG4gICAqL1xuICBzY3JvbGxlZChhdWRpdFRpbWVJbk1zOiBudW1iZXIgPSBERUZBVUxUX1NDUk9MTF9USU1FKTogT2JzZXJ2YWJsZTxDZGtTY3JvbGxhYmxlIHwgdm9pZD4ge1xuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mPHZvaWQ+KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8Q2RrU2Nyb2xsYWJsZSB8IHZvaWQ+KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLl9hZGRHbG9iYWxMaXN0ZW5lcigpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbiB0aGUgY2FzZSBvZiBhIDBtcyBkZWxheSwgdXNlIGFuIG9ic2VydmFibGUgd2l0aG91dCBhdWRpdFRpbWVcbiAgICAgIC8vIHNpbmNlIGl0IGRvZXMgYWRkIGEgcGVyY2VwdGlibGUgZGVsYXkgaW4gcHJvY2Vzc2luZyBvdmVyaGVhZC5cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9XG4gICAgICAgIGF1ZGl0VGltZUluTXMgPiAwXG4gICAgICAgICAgPyB0aGlzLl9zY3JvbGxlZC5waXBlKGF1ZGl0VGltZShhdWRpdFRpbWVJbk1zKSkuc3Vic2NyaWJlKG9ic2VydmVyKVxuICAgICAgICAgIDogdGhpcy5fc2Nyb2xsZWQuc3Vic2NyaWJlKG9ic2VydmVyKTtcblxuICAgICAgdGhpcy5fc2Nyb2xsZWRDb3VudCsrO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsZWRDb3VudC0tO1xuXG4gICAgICAgIGlmICghdGhpcy5fc2Nyb2xsZWRDb3VudCkge1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUdsb2JhbExpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9yZW1vdmVHbG9iYWxMaXN0ZW5lcigpO1xuICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5mb3JFYWNoKChfLCBjb250YWluZXIpID0+IHRoaXMuZGVyZWdpc3Rlcihjb250YWluZXIpKTtcbiAgICB0aGlzLl9zY3JvbGxlZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW5ldmVyIGFueSBvZiB0aGVcbiAgICogc2Nyb2xsYWJsZSBhbmNlc3RvcnMgb2YgYW4gZWxlbWVudCBhcmUgc2Nyb2xsZWQuXG4gICAqIEBwYXJhbSBlbGVtZW50T3JFbGVtZW50UmVmIEVsZW1lbnQgd2hvc2UgYW5jZXN0b3JzIHRvIGxpc3RlbiBmb3IuXG4gICAqIEBwYXJhbSBhdWRpdFRpbWVJbk1zIFRpbWUgdG8gdGhyb3R0bGUgdGhlIHNjcm9sbCBldmVudHMuXG4gICAqL1xuICBhbmNlc3RvclNjcm9sbGVkKFxuICAgIGVsZW1lbnRPckVsZW1lbnRSZWY6IEVsZW1lbnRSZWYgfCBIVE1MRWxlbWVudCxcbiAgICBhdWRpdFRpbWVJbk1zPzogbnVtYmVyLFxuICApOiBPYnNlcnZhYmxlPENka1Njcm9sbGFibGUgfCB2b2lkPiB7XG4gICAgY29uc3QgYW5jZXN0b3JzID0gdGhpcy5nZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnMoZWxlbWVudE9yRWxlbWVudFJlZik7XG5cbiAgICByZXR1cm4gdGhpcy5zY3JvbGxlZChhdWRpdFRpbWVJbk1zKS5waXBlKFxuICAgICAgZmlsdGVyKHRhcmdldCA9PiB7XG4gICAgICAgIHJldHVybiAhdGFyZ2V0IHx8IGFuY2VzdG9ycy5pbmRleE9mKHRhcmdldCkgPiAtMTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhbGwgcmVnaXN0ZXJlZCBTY3JvbGxhYmxlcyB0aGF0IGNvbnRhaW4gdGhlIHByb3ZpZGVkIGVsZW1lbnQuICovXG4gIGdldEFuY2VzdG9yU2Nyb2xsQ29udGFpbmVycyhlbGVtZW50T3JFbGVtZW50UmVmOiBFbGVtZW50UmVmIHwgSFRNTEVsZW1lbnQpOiBDZGtTY3JvbGxhYmxlW10ge1xuICAgIGNvbnN0IHNjcm9sbGluZ0NvbnRhaW5lcnM6IENka1Njcm9sbGFibGVbXSA9IFtdO1xuXG4gICAgdGhpcy5zY3JvbGxDb250YWluZXJzLmZvckVhY2goKF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiwgc2Nyb2xsYWJsZTogQ2RrU2Nyb2xsYWJsZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3Njcm9sbGFibGVDb250YWluc0VsZW1lbnQoc2Nyb2xsYWJsZSwgZWxlbWVudE9yRWxlbWVudFJlZikpIHtcbiAgICAgICAgc2Nyb2xsaW5nQ29udGFpbmVycy5wdXNoKHNjcm9sbGFibGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNjcm9sbGluZ0NvbnRhaW5lcnM7XG4gIH1cblxuICAvKiogVXNlIGRlZmF1bHRWaWV3IG9mIGluamVjdGVkIGRvY3VtZW50IGlmIGF2YWlsYWJsZSBvciBmYWxsYmFjayB0byBnbG9iYWwgd2luZG93IHJlZmVyZW5jZSAqL1xuICBwcml2YXRlIF9nZXRXaW5kb3coKTogV2luZG93IHtcbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93O1xuICB9XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBpcyBjb250YWluZWQgd2l0aGluIHRoZSBwcm92aWRlZCBTY3JvbGxhYmxlLiAqL1xuICBwcml2YXRlIF9zY3JvbGxhYmxlQ29udGFpbnNFbGVtZW50KFxuICAgIHNjcm9sbGFibGU6IENka1Njcm9sbGFibGUsXG4gICAgZWxlbWVudE9yRWxlbWVudFJlZjogRWxlbWVudFJlZiB8IEhUTUxFbGVtZW50LFxuICApOiBib29sZWFuIHtcbiAgICBsZXQgZWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gY29lcmNlRWxlbWVudChlbGVtZW50T3JFbGVtZW50UmVmKTtcbiAgICBsZXQgc2Nyb2xsYWJsZUVsZW1lbnQgPSBzY3JvbGxhYmxlLmdldEVsZW1lbnRSZWYoKS5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gVHJhdmVyc2UgdGhyb3VnaCB0aGUgZWxlbWVudCBwYXJlbnRzIHVudGlsIHdlIHJlYWNoIG51bGwsIGNoZWNraW5nIGlmIGFueSBvZiB0aGUgZWxlbWVudHNcbiAgICAvLyBhcmUgdGhlIHNjcm9sbGFibGUncyBlbGVtZW50LlxuICAgIGRvIHtcbiAgICAgIGlmIChlbGVtZW50ID09IHNjcm9sbGFibGVFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKChlbGVtZW50ID0gZWxlbWVudCEucGFyZW50RWxlbWVudCkpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIFNldHMgdXAgdGhlIGdsb2JhbCBzY3JvbGwgbGlzdGVuZXJzLiAqL1xuICBwcml2YXRlIF9hZGRHbG9iYWxMaXN0ZW5lcigpIHtcbiAgICB0aGlzLl9nbG9iYWxTdWJzY3JpcHRpb24gPSB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgY29uc3Qgd2luZG93ID0gdGhpcy5fZ2V0V2luZG93KCk7XG4gICAgICByZXR1cm4gZnJvbUV2ZW50KHdpbmRvdy5kb2N1bWVudCwgJ3Njcm9sbCcpLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9zY3JvbGxlZC5uZXh0KCkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIENsZWFucyB1cCB0aGUgZ2xvYmFsIHNjcm9sbCBsaXN0ZW5lci4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlR2xvYmFsTGlzdGVuZXIoKSB7XG4gICAgaWYgKHRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl9nbG9iYWxTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19