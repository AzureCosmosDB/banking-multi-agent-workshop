/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceArray } from '@angular/cdk/coercion';
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, concat, Observable, Subject } from 'rxjs';
import { debounceTime, map, skip, startWith, take, takeUntil } from 'rxjs/operators';
import { MediaMatcher } from './media-matcher';
import * as i0 from "@angular/core";
import * as i1 from "./media-matcher";
/** Utility for checking the matching state of @media queries. */
export class BreakpointObserver {
    constructor(_mediaMatcher, _zone) {
        this._mediaMatcher = _mediaMatcher;
        this._zone = _zone;
        /**  A map of all media queries currently being listened for. */
        this._queries = new Map();
        /** A subject for all other observables to takeUntil based on. */
        this._destroySubject = new Subject();
    }
    /** Completes the active subject, signalling to all other observables to complete. */
    ngOnDestroy() {
        this._destroySubject.next();
        this._destroySubject.complete();
    }
    /**
     * Whether one or more media queries match the current viewport size.
     * @param value One or more media queries to check.
     * @returns Whether any of the media queries match.
     */
    isMatched(value) {
        const queries = splitQueries(coerceArray(value));
        return queries.some(mediaQuery => this._registerQuery(mediaQuery).mql.matches);
    }
    /**
     * Gets an observable of results for the given queries that will emit new results for any changes
     * in matching of the given queries.
     * @param value One or more media queries to check.
     * @returns A stream of matches for the given queries.
     */
    observe(value) {
        const queries = splitQueries(coerceArray(value));
        const observables = queries.map(query => this._registerQuery(query).observable);
        let stateObservable = combineLatest(observables);
        // Emit the first state immediately, and then debounce the subsequent emissions.
        stateObservable = concat(stateObservable.pipe(take(1)), stateObservable.pipe(skip(1), debounceTime(0)));
        return stateObservable.pipe(map(breakpointStates => {
            const response = {
                matches: false,
                breakpoints: {},
            };
            breakpointStates.forEach(({ matches, query }) => {
                response.matches = response.matches || matches;
                response.breakpoints[query] = matches;
            });
            return response;
        }));
    }
    /** Registers a specific query to be listened for. */
    _registerQuery(query) {
        // Only set up a new MediaQueryList if it is not already being listened for.
        if (this._queries.has(query)) {
            return this._queries.get(query);
        }
        const mql = this._mediaMatcher.matchMedia(query);
        // Create callback for match changes and add it is as a listener.
        const queryObservable = new Observable((observer) => {
            // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
            // back into the zone because matchMedia is only included in Zone.js by loading the
            // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
            // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
            // patches it.
            const handler = (e) => this._zone.run(() => observer.next(e));
            mql.addListener(handler);
            return () => {
                mql.removeListener(handler);
            };
        }).pipe(startWith(mql), map(({ matches }) => ({ query, matches })), takeUntil(this._destroySubject));
        // Add the MediaQueryList to the set of queries.
        const output = { observable: queryObservable, mql };
        this._queries.set(query, output);
        return output;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: BreakpointObserver, deps: [{ token: i1.MediaMatcher }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: BreakpointObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: BreakpointObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.MediaMatcher }, { type: i0.NgZone }] });
/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 */
function splitQueries(queries) {
    return queries
        .map(query => query.split(','))
        .reduce((a1, a2) => a1.concat(a2))
        .map(query => query.trim());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHMtb2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2xheW91dC9icmVha3BvaW50cy1vYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFZLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMxRSxPQUFPLEVBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQTRCN0MsaUVBQWlFO0FBRWpFLE1BQU0sT0FBTyxrQkFBa0I7SUFNN0IsWUFDVSxhQUEyQixFQUMzQixLQUFhO1FBRGIsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFDM0IsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQVB2QixnRUFBZ0U7UUFDeEQsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQzVDLGlFQUFpRTtRQUNoRCxvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFLcEQsQ0FBQztJQUVKLHFGQUFxRjtJQUNyRixXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLEtBQWlDO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFD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RSxlQUFlLEVBQUUsR0FBRyxFQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7cUhBMUZVLGtCQUFrQjt5SEFBbEIsa0JBQWtCLGNBRE4sTUFBTTs7a0dBQ2xCLGtCQUFrQjtrQkFEOUIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBOEZoQzs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBQyxPQUEwQjtJQUM5QyxPQUFPLE9BQU87U0FDWCxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzlCLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDaEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUFycmF5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvbWJpbmVMYXRlc3QsIGNvbmNhdCwgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIG1hcCwgc2tpcCwgc3RhcnRXaXRoLCB0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TWVkaWFNYXRjaGVyfSBmcm9tICcuL21lZGlhLW1hdGNoZXInO1xuXG4vKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgYSBsYXlvdXQgYnJlYWtwb2ludC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnJlYWtwb2ludFN0YXRlIHtcbiAgLyoqIFdoZXRoZXIgdGhlIGJyZWFrcG9pbnQgaXMgY3VycmVudGx5IG1hdGNoaW5nLiAqL1xuICBtYXRjaGVzOiBib29sZWFuO1xuICAvKipcbiAgICogQSBrZXkgYm9vbGVhbiBwYWlyIGZvciBlYWNoIHF1ZXJ5IHByb3ZpZGVkIHRvIHRoZSBvYnNlcnZlIG1ldGhvZCxcbiAgICogd2l0aCBpdHMgY3VycmVudCBtYXRjaGVkIHN0YXRlLlxuICAgKi9cbiAgYnJlYWtwb2ludHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBib29sZWFuO1xuICB9O1xufVxuXG4vKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgYSBsYXlvdXQgYnJlYWtwb2ludC4gKi9cbmludGVyZmFjZSBJbnRlcm5hbEJyZWFrcG9pbnRTdGF0ZSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBicmVha3BvaW50IGlzIGN1cnJlbnRseSBtYXRjaGluZy4gKi9cbiAgbWF0Y2hlczogYm9vbGVhbjtcbiAgLyoqIFRoZSBtZWRpYSBxdWVyeSBiZWluZyB0byBiZSBtYXRjaGVkICovXG4gIHF1ZXJ5OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBRdWVyeSB7XG4gIG9ic2VydmFibGU6IE9ic2VydmFibGU8SW50ZXJuYWxCcmVha3BvaW50U3RhdGU+O1xuICBtcWw6IE1lZGlhUXVlcnlMaXN0O1xufVxuXG4vKiogVXRpbGl0eSBmb3IgY2hlY2tpbmcgdGhlIG1hdGNoaW5nIHN0YXRlIG9mIEBtZWRpYSBxdWVyaWVzLiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQnJlYWtwb2ludE9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqICBBIG1hcCBvZiBhbGwgbWVkaWEgcXVlcmllcyBjdXJyZW50bHkgYmVpbmcgbGlzdGVuZWQgZm9yLiAqL1xuICBwcml2YXRlIF9xdWVyaWVzID0gbmV3IE1hcDxzdHJpbmcsIFF1ZXJ5PigpO1xuICAvKiogQSBzdWJqZWN0IGZvciBhbGwgb3RoZXIgb2JzZXJ2YWJsZXMgdG8gdGFrZVVudGlsIGJhc2VkIG9uLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95U3ViamVjdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfbWVkaWFNYXRjaGVyOiBNZWRpYU1hdGNoZXIsXG4gICAgcHJpdmF0ZSBfem9uZTogTmdab25lLFxuICApIHt9XG5cbiAgLyoqIENvbXBsZXRlcyB0aGUgYWN0aXZlIHN1YmplY3QsIHNpZ25hbGxpbmcgdG8gYWxsIG90aGVyIG9ic2VydmFibGVzIHRvIGNvbXBsZXRlLiAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95U3ViamVjdC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveVN1YmplY3QuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9uZSBvciBtb3JlIG1lZGlhIHF1ZXJpZXMgbWF0Y2ggdGhlIGN1cnJlbnQgdmlld3BvcnQgc2l6ZS5cbiAgICogQHBhcmFtIHZhbHVlIE9uZSBvciBtb3JlIG1lZGlhIHF1ZXJpZXMgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgYW55IG9mIHRoZSBtZWRpYSBxdWVyaWVzIG1hdGNoLlxuICAgKi9cbiAgaXNNYXRjaGVkKHZhbHVlOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHF1ZXJpZXMgPSBzcGxpdFF1ZXJpZXMoY29lcmNlQXJyYXkodmFsdWUpKTtcbiAgICByZXR1cm4gcXVlcmllcy5zb21lKG1lZGlhUXVlcnkgPT4gdGhpcy5fcmVnaXN0ZXJRdWVyeShtZWRpYVF1ZXJ5KS5tcWwubWF0Y2hlcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIG9mIHJlc3VsdHMgZm9yIHRoZSBnaXZlbiBxdWVyaWVzIHRoYXQgd2lsbCBlbWl0IG5ldyByZXN1bHRzIGZvciBhbnkgY2hhbmdlc1xuICAgKiBpbiBtYXRjaGluZyBvZiB0aGUgZ2l2ZW4gcXVlcmllcy5cbiAgICogQHBhcmFtIHZhbHVlIE9uZSBvciBtb3JlIG1lZGlhIHF1ZXJpZXMgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIEEgc3RyZWFtIG9mIG1hdGNoZXMgZm9yIHRoZSBnaXZlbiBxdWVyaWVzLlxuICAgKi9cbiAgb2JzZXJ2ZSh2YWx1ZTogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10pOiBPYnNlcnZhYmxlPEJyZWFrcG9pbnRTdGF0ZT4ge1xuICAgIGNvbnN0IHF1ZXJpZXMgPSBzcGxpdFF1ZXJpZXMoY29lcmNlQXJyYXkodmFsdWUpKTtcbiAgICBjb25zdCBvYnNlcnZhYmxlcyA9IHF1ZXJpZXMubWFwKHF1ZXJ5ID0+IHRoaXMuX3JlZ2lzdGVyUXVlcnkocXVlcnkpLm9ic2VydmFibGUpO1xuXG4gICAgbGV0IHN0YXRlT2JzZXJ2YWJsZSA9IGNvbWJpbmVMYXRlc3Qob2JzZXJ2YWJsZXMpO1xuICAgIC8vIEVtaXQgdGhlIGZpcnN0IHN0YXRlIGltbWVkaWF0ZWx5LCBhbmQgdGhlbiBkZWJvdW5jZSB0aGUgc3Vic2VxdWVudCBlbWlzc2lvbnMuXG4gICAgc3RhdGVPYnNlcnZhYmxlID0gY29uY2F0KFxuICAgICAgc3RhdGVPYnNlcnZhYmxlLnBpcGUodGFrZSgxKSksXG4gICAgICBzdGF0ZU9ic2VydmFibGUucGlwZShza2lwKDEpLCBkZWJvdW5jZVRpbWUoMCkpLFxuICAgICk7XG4gICAgcmV0dXJuIHN0YXRlT2JzZXJ2YWJsZS5waXBlKFxuICAgICAgbWFwKGJyZWFrcG9pbnRTdGF0ZXMgPT4ge1xuICAgICAgICBjb25zdCByZXNwb25zZTogQnJlYWtwb2ludFN0YXRlID0ge1xuICAgICAgICAgIG1hdGNoZXM6IGZhbHNlLFxuICAgICAgICAgIGJyZWFrcG9pbnRzOiB7fSxcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWtwb2ludFN0YXRlcy5mb3JFYWNoKCh7bWF0Y2hlcywgcXVlcnl9KSA9PiB7XG4gICAgICAgICAgcmVzcG9uc2UubWF0Y2hlcyA9IHJlc3BvbnNlLm1hdGNoZXMgfHwgbWF0Y2hlcztcbiAgICAgICAgICByZXNwb25zZS5icmVha3BvaW50c1txdWVyeV0gPSBtYXRjaGVzO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZWdpc3RlcnMgYSBzcGVjaWZpYyBxdWVyeSB0byBiZSBsaXN0ZW5lZCBmb3IuICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyUXVlcnkocXVlcnk6IHN0cmluZyk6IFF1ZXJ5IHtcbiAgICAvLyBPbmx5IHNldCB1cCBhIG5ldyBNZWRpYVF1ZXJ5TGlzdCBpZiBpdCBpcyBub3QgYWxyZWFkeSBiZWluZyBsaXN0ZW5lZCBmb3IuXG4gICAgaWYgKHRoaXMuX3F1ZXJpZXMuaGFzKHF1ZXJ5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3F1ZXJpZXMuZ2V0KHF1ZXJ5KSE7XG4gICAgfVxuXG4gICAgY29uc3QgbXFsID0gdGhpcy5fbWVkaWFNYXRjaGVyLm1hdGNoTWVkaWEocXVlcnkpO1xuXG4gICAgLy8gQ3JlYXRlIGNhbGxiYWNrIGZvciBtYXRjaCBjaGFuZ2VzIGFuZCBhZGQgaXQgaXMgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBxdWVyeU9ic2VydmFibGUgPSBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPE1lZGlhUXVlcnlMaXN0RXZlbnQ+KSA9PiB7XG4gICAgICAvLyBMaXN0ZW5lciBjYWxsYmFjayBtZXRob2RzIGFyZSB3cmFwcGVkIHRvIGJlIHBsYWNlZCBiYWNrIGluIG5nWm9uZS4gQ2FsbGJhY2tzIG11c3QgYmUgcGxhY2VkXG4gICAgICAvLyBiYWNrIGludG8gdGhlIHpvbmUgYmVjYXVzZSBtYXRjaE1lZGlhIGlzIG9ubHkgaW5jbHVkZWQgaW4gWm9uZS5qcyBieSBsb2FkaW5nIHRoZVxuICAgICAgLy8gd2ViYXBpcy1tZWRpYS1xdWVyeS5qcyBmaWxlIGFsb25nc2lkZSB0aGUgem9uZS5qcyBmaWxlLiAgQWRkaXRpb25hbGx5LCBzb21lIGJyb3dzZXJzIGRvIG5vdFxuICAgICAgLy8gaGF2ZSBNZWRpYVF1ZXJ5TGlzdCBpbmhlcml0IGZyb20gRXZlbnRUYXJnZXQsIHdoaWNoIGNhdXNlcyBpbmNvbnNpc3RlbmNpZXMgaW4gaG93IFpvbmUuanNcbiAgICAgIC8vIHBhdGNoZXMgaXQuXG4gICAgICBjb25zdCBoYW5kbGVyID0gKGU6IE1lZGlhUXVlcnlMaXN0RXZlbnQpOiB2b2lkID0+IHRoaXMuX3pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQoZSkpO1xuICAgICAgbXFsLmFkZExpc3RlbmVyKGhhbmRsZXIpO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBtcWwucmVtb3ZlTGlzdGVuZXIoaGFuZGxlcik7XG4gICAgICB9O1xuICAgIH0pLnBpcGUoXG4gICAgICBzdGFydFdpdGgobXFsKSxcbiAgICAgIG1hcCgoe21hdGNoZXN9KSA9PiAoe3F1ZXJ5LCBtYXRjaGVzfSkpLFxuICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3lTdWJqZWN0KSxcbiAgICApO1xuXG4gICAgLy8gQWRkIHRoZSBNZWRpYVF1ZXJ5TGlzdCB0byB0aGUgc2V0IG9mIHF1ZXJpZXMuXG4gICAgY29uc3Qgb3V0cHV0ID0ge29ic2VydmFibGU6IHF1ZXJ5T2JzZXJ2YWJsZSwgbXFsfTtcbiAgICB0aGlzLl9xdWVyaWVzLnNldChxdWVyeSwgb3V0cHV0KTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG59XG5cbi8qKlxuICogU3BsaXQgZWFjaCBxdWVyeSBzdHJpbmcgaW50byBzZXBhcmF0ZSBxdWVyeSBzdHJpbmdzIGlmIHR3byBxdWVyaWVzIGFyZSBwcm92aWRlZCBhcyBjb21tYVxuICogc2VwYXJhdGVkLlxuICovXG5mdW5jdGlvbiBzcGxpdFF1ZXJpZXMocXVlcmllczogcmVhZG9ubHkgc3RyaW5nW10pOiByZWFkb25seSBzdHJpbmdbXSB7XG4gIHJldHVybiBxdWVyaWVzXG4gICAgLm1hcChxdWVyeSA9PiBxdWVyeS5zcGxpdCgnLCcpKVxuICAgIC5yZWR1Y2UoKGExLCBhMikgPT4gYTEuY29uY2F0KGEyKSlcbiAgICAubWFwKHF1ZXJ5ID0+IHF1ZXJ5LnRyaW0oKSk7XG59XG4iXX0=