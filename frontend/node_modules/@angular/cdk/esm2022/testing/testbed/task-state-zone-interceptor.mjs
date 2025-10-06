/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BehaviorSubject } from 'rxjs';
/** Unique symbol that is used to patch a property to a proxy zone. */
const stateObservableSymbol = Symbol('ProxyZone_PATCHED#stateObservable');
/**
 * Interceptor that can be set up in a `ProxyZone` instance. The interceptor
 * will keep track of the task state and emit whenever the state changes.
 *
 * This serves as a workaround for https://github.com/angular/angular/issues/32896.
 */
export class TaskStateZoneInterceptor {
    constructor(_lastState) {
        this._lastState = _lastState;
        /** Subject that can be used to emit a new state change. */
        this._stateSubject = new BehaviorSubject(this._lastState ? this._getTaskStateFromInternalZoneState(this._lastState) : { stable: true });
        /** Public observable that emits whenever the task state changes. */
        this.state = this._stateSubject;
    }
    /** This will be called whenever the task state changes in the intercepted zone. */
    onHasTask(delegate, current, target, hasTaskState) {
        if (current === target) {
            this._stateSubject.next(this._getTaskStateFromInternalZoneState(hasTaskState));
        }
    }
    /** Gets the task state from the internal ZoneJS task state. */
    _getTaskStateFromInternalZoneState(state) {
        return { stable: !state.macroTask && !state.microTask };
    }
    /**
     * Sets up the custom task state Zone interceptor in the  `ProxyZone`. Throws if
     * no `ProxyZone` could be found.
     * @returns an observable that emits whenever the task state changes.
     */
    static setup() {
        if (Zone === undefined) {
            throw Error('Could not find ZoneJS. For test harnesses running in TestBed, ' +
                'ZoneJS needs to be installed.');
        }
        // tslint:disable-next-line:variable-name
        const ProxyZoneSpec = Zone['ProxyZoneSpec'];
        // If there is no "ProxyZoneSpec" installed, we throw an error and recommend
        // setting up the proxy zone by pulling in the testing bundle.
        if (!ProxyZoneSpec) {
            throw Error('ProxyZoneSpec is needed for the test harnesses but could not be found. ' +
                'Please make sure that your environment includes zone.js/dist/zone-testing.js');
        }
        // Ensure that there is a proxy zone instance set up, and get
        // a reference to the instance if present.
        const zoneSpec = ProxyZoneSpec.assertPresent();
        // If there already is a delegate registered in the proxy zone, and it
        // is type of the custom task state interceptor, we just use that state
        // observable. This allows us to only intercept Zone once per test
        // (similar to how `fakeAsync` or `async` work).
        if (zoneSpec[stateObservableSymbol]) {
            return zoneSpec[stateObservableSymbol];
        }
        // Since we intercept on environment creation and the fixture has been
        // created before, we might have missed tasks scheduled before. Fortunately
        // the proxy zone keeps track of the previous task state, so we can just pass
        // this as initial state to the task zone interceptor.
        const interceptor = new TaskStateZoneInterceptor(zoneSpec.lastTaskState);
        const zoneSpecOnHasTask = zoneSpec.onHasTask.bind(zoneSpec);
        // We setup the task state interceptor in the `ProxyZone`. Note that we cannot register
        // the interceptor as a new proxy zone delegate because it would mean that other zone
        // delegates (e.g. `FakeAsyncTestZone` or `AsyncTestZone`) can accidentally overwrite/disable
        // our interceptor. Since we just intend to monitor the task state of the proxy zone, it is
        // sufficient to just patch the proxy zone. This also avoids that we interfere with the task
        // queue scheduling logic.
        zoneSpec.onHasTask = function (...args) {
            zoneSpecOnHasTask(...args);
            interceptor.onHasTask(...args);
        };
        return (zoneSpec[stateObservableSymbol] = interceptor.state);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Rlc3RiZWQvdGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFTakQsc0VBQXNFO0FBQ3RFLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFPMUU7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sd0JBQXdCO0lBU25DLFlBQW9CLFVBQStCO1FBQS9CLGVBQVUsR0FBVixVQUFVLENBQXFCO1FBUm5ELDJEQUEyRDtRQUMxQyxrQkFBYSxHQUFHLElBQUksZUFBZSxDQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FDNUYsQ0FBQztRQUVGLG9FQUFvRTtRQUMzRCxVQUFLLEdBQTBCLElBQUksQ0FBQyxhQUFhLENBQUM7SUFFTCxDQUFDO0lBRXZELG1GQUFtRjtJQUNuRixTQUFTLENBQUMsUUFBc0IsRUFBRSxPQUFhLEVBQUUsTUFBWSxFQUFFLFlBQTBCO1FBQ3ZGLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7SUFDSCxDQUFDO0lBRUQsK0RBQStEO0lBQ3ZELGtDQUFrQyxDQUFDLEtBQW1CO1FBQzVELE9BQU8sRUFBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEtBQUs7UUFDVixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN2QixNQUFNLEtBQUssQ0FDVCxnRUFBZ0U7Z0JBQzlELCtCQUErQixDQUNsQyxDQUFDO1FBQ0osQ0FBQztRQUVELHlDQUF5QztRQUN6QyxNQUFNLGFBQWEsR0FBSSxJQUFZLENBQUMsZUFBZSxDQUFnQyxDQUFDO1FBRXBGLDRFQUE0RTtRQUM1RSw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25CLE1BQU0sS0FBSyxDQUNULHlFQUF5RTtnQkFDdkUsOEVBQThFLENBQ2pGLENBQUM7UUFDSixDQUFDO1FBRUQsNkRBQTZEO1FBQzdELDBDQUEwQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFzQixDQUFDO1FBRW5FLHNFQUFzRTtRQUN0RSx1RUFBdUU7UUFDdkUsa0VBQWtFO1FBQ2xFLGdEQUFnRDtRQUNoRCxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7WUFDcEMsT0FBTyxRQUFRLENBQUMscUJBQXFCLENBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRUQsc0VBQXNFO1FBQ3RFLDJFQUEyRTtRQUMzRSw2RUFBNkU7UUFDN0Usc0RBQXNEO1FBQ3RELE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQXdCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUQsdUZBQXVGO1FBQ3ZGLHFGQUFxRjtRQUNyRiw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLDRGQUE0RjtRQUM1RiwwQkFBMEI7UUFDMUIsUUFBUSxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUcsSUFBOEM7WUFDOUUsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMzQixXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtQcm94eVpvbmUsIFByb3h5Wm9uZVN0YXRpY30gZnJvbSAnLi9wcm94eS16b25lLXR5cGVzJztcblxuLyoqIEN1cnJlbnQgc3RhdGUgb2YgdGhlIGludGVyY2VwdGVkIHpvbmUuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tTdGF0ZSB7XG4gIC8qKiBXaGV0aGVyIHRoZSB6b25lIGlzIHN0YWJsZSAoaS5lLiBubyBtaWNyb3Rhc2tzIGFuZCBtYWNyb3Rhc2tzKS4gKi9cbiAgc3RhYmxlOiBib29sZWFuO1xufVxuXG4vKiogVW5pcXVlIHN5bWJvbCB0aGF0IGlzIHVzZWQgdG8gcGF0Y2ggYSBwcm9wZXJ0eSB0byBhIHByb3h5IHpvbmUuICovXG5jb25zdCBzdGF0ZU9ic2VydmFibGVTeW1ib2wgPSBTeW1ib2woJ1Byb3h5Wm9uZV9QQVRDSEVEI3N0YXRlT2JzZXJ2YWJsZScpO1xuXG4vKiogVHlwZSB0aGF0IGRlc2NyaWJlcyBhIHBvdGVudGlhbGx5IHBhdGNoZWQgcHJveHkgem9uZSBpbnN0YW5jZS4gKi9cbnR5cGUgUGF0Y2hlZFByb3h5Wm9uZSA9IFByb3h5Wm9uZSAmIHtcbiAgW3N0YXRlT2JzZXJ2YWJsZVN5bWJvbF06IHVuZGVmaW5lZCB8IE9ic2VydmFibGU8VGFza1N0YXRlPjtcbn07XG5cbi8qKlxuICogSW50ZXJjZXB0b3IgdGhhdCBjYW4gYmUgc2V0IHVwIGluIGEgYFByb3h5Wm9uZWAgaW5zdGFuY2UuIFRoZSBpbnRlcmNlcHRvclxuICogd2lsbCBrZWVwIHRyYWNrIG9mIHRoZSB0YXNrIHN0YXRlIGFuZCBlbWl0IHdoZW5ldmVyIHRoZSBzdGF0ZSBjaGFuZ2VzLlxuICpcbiAqIFRoaXMgc2VydmVzIGFzIGEgd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzI4OTYuXG4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrU3RhdGVab25lSW50ZXJjZXB0b3Ige1xuICAvKiogU3ViamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGVtaXQgYSBuZXcgc3RhdGUgY2hhbmdlLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGF0ZVN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFRhc2tTdGF0ZT4oXG4gICAgdGhpcy5fbGFzdFN0YXRlID8gdGhpcy5fZ2V0VGFza1N0YXRlRnJvbUludGVybmFsWm9uZVN0YXRlKHRoaXMuX2xhc3RTdGF0ZSkgOiB7c3RhYmxlOiB0cnVlfSxcbiAgKTtcblxuICAvKiogUHVibGljIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgdGFzayBzdGF0ZSBjaGFuZ2VzLiAqL1xuICByZWFkb25seSBzdGF0ZTogT2JzZXJ2YWJsZTxUYXNrU3RhdGU+ID0gdGhpcy5fc3RhdGVTdWJqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2xhc3RTdGF0ZTogSGFzVGFza1N0YXRlIHwgbnVsbCkge31cblxuICAvKiogVGhpcyB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgdGFzayBzdGF0ZSBjaGFuZ2VzIGluIHRoZSBpbnRlcmNlcHRlZCB6b25lLiAqL1xuICBvbkhhc1Rhc2soZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCBoYXNUYXNrU3RhdGU6IEhhc1Rhc2tTdGF0ZSkge1xuICAgIGlmIChjdXJyZW50ID09PSB0YXJnZXQpIHtcbiAgICAgIHRoaXMuX3N0YXRlU3ViamVjdC5uZXh0KHRoaXMuX2dldFRhc2tTdGF0ZUZyb21JbnRlcm5hbFpvbmVTdGF0ZShoYXNUYXNrU3RhdGUpKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGFzayBzdGF0ZSBmcm9tIHRoZSBpbnRlcm5hbCBab25lSlMgdGFzayBzdGF0ZS4gKi9cbiAgcHJpdmF0ZSBfZ2V0VGFza1N0YXRlRnJvbUludGVybmFsWm9uZVN0YXRlKHN0YXRlOiBIYXNUYXNrU3RhdGUpOiBUYXNrU3RhdGUge1xuICAgIHJldHVybiB7c3RhYmxlOiAhc3RhdGUubWFjcm9UYXNrICYmICFzdGF0ZS5taWNyb1Rhc2t9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdXAgdGhlIGN1c3RvbSB0YXNrIHN0YXRlIFpvbmUgaW50ZXJjZXB0b3IgaW4gdGhlICBgUHJveHlab25lYC4gVGhyb3dzIGlmXG4gICAqIG5vIGBQcm94eVpvbmVgIGNvdWxkIGJlIGZvdW5kLlxuICAgKiBAcmV0dXJucyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHRhc2sgc3RhdGUgY2hhbmdlcy5cbiAgICovXG4gIHN0YXRpYyBzZXR1cCgpOiBPYnNlcnZhYmxlPFRhc2tTdGF0ZT4ge1xuICAgIGlmIChab25lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnQ291bGQgbm90IGZpbmQgWm9uZUpTLiBGb3IgdGVzdCBoYXJuZXNzZXMgcnVubmluZyBpbiBUZXN0QmVkLCAnICtcbiAgICAgICAgICAnWm9uZUpTIG5lZWRzIHRvIGJlIGluc3RhbGxlZC4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZVxuICAgIGNvbnN0IFByb3h5Wm9uZVNwZWMgPSAoWm9uZSBhcyBhbnkpWydQcm94eVpvbmVTcGVjJ10gYXMgUHJveHlab25lU3RhdGljIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gXCJQcm94eVpvbmVTcGVjXCIgaW5zdGFsbGVkLCB3ZSB0aHJvdyBhbiBlcnJvciBhbmQgcmVjb21tZW5kXG4gICAgLy8gc2V0dGluZyB1cCB0aGUgcHJveHkgem9uZSBieSBwdWxsaW5nIGluIHRoZSB0ZXN0aW5nIGJ1bmRsZS5cbiAgICBpZiAoIVByb3h5Wm9uZVNwZWMpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnUHJveHlab25lU3BlYyBpcyBuZWVkZWQgZm9yIHRoZSB0ZXN0IGhhcm5lc3NlcyBidXQgY291bGQgbm90IGJlIGZvdW5kLiAnICtcbiAgICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcy9kaXN0L3pvbmUtdGVzdGluZy5qcycsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoZXJlIGlzIGEgcHJveHkgem9uZSBpbnN0YW5jZSBzZXQgdXAsIGFuZCBnZXRcbiAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgaW5zdGFuY2UgaWYgcHJlc2VudC5cbiAgICBjb25zdCB6b25lU3BlYyA9IFByb3h5Wm9uZVNwZWMuYXNzZXJ0UHJlc2VudCgpIGFzIFBhdGNoZWRQcm94eVpvbmU7XG5cbiAgICAvLyBJZiB0aGVyZSBhbHJlYWR5IGlzIGEgZGVsZWdhdGUgcmVnaXN0ZXJlZCBpbiB0aGUgcHJveHkgem9uZSwgYW5kIGl0XG4gICAgLy8gaXMgdHlwZSBvZiB0aGUgY3VzdG9tIHRhc2sgc3RhdGUgaW50ZXJjZXB0b3IsIHdlIGp1c3QgdXNlIHRoYXQgc3RhdGVcbiAgICAvLyBvYnNlcnZhYmxlLiBUaGlzIGFsbG93cyB1cyB0byBvbmx5IGludGVyY2VwdCBab25lIG9uY2UgcGVyIHRlc3RcbiAgICAvLyAoc2ltaWxhciB0byBob3cgYGZha2VBc3luY2Agb3IgYGFzeW5jYCB3b3JrKS5cbiAgICBpZiAoem9uZVNwZWNbc3RhdGVPYnNlcnZhYmxlU3ltYm9sXSkge1xuICAgICAgcmV0dXJuIHpvbmVTcGVjW3N0YXRlT2JzZXJ2YWJsZVN5bWJvbF0hO1xuICAgIH1cblxuICAgIC8vIFNpbmNlIHdlIGludGVyY2VwdCBvbiBlbnZpcm9ubWVudCBjcmVhdGlvbiBhbmQgdGhlIGZpeHR1cmUgaGFzIGJlZW5cbiAgICAvLyBjcmVhdGVkIGJlZm9yZSwgd2UgbWlnaHQgaGF2ZSBtaXNzZWQgdGFza3Mgc2NoZWR1bGVkIGJlZm9yZS4gRm9ydHVuYXRlbHlcbiAgICAvLyB0aGUgcHJveHkgem9uZSBrZWVwcyB0cmFjayBvZiB0aGUgcHJldmlvdXMgdGFzayBzdGF0ZSwgc28gd2UgY2FuIGp1c3QgcGFzc1xuICAgIC8vIHRoaXMgYXMgaW5pdGlhbCBzdGF0ZSB0byB0aGUgdGFzayB6b25lIGludGVyY2VwdG9yLlxuICAgIGNvbnN0IGludGVyY2VwdG9yID0gbmV3IFRhc2tTdGF0ZVpvbmVJbnRlcmNlcHRvcih6b25lU3BlYy5sYXN0VGFza1N0YXRlKTtcbiAgICBjb25zdCB6b25lU3BlY09uSGFzVGFzayA9IHpvbmVTcGVjLm9uSGFzVGFzay5iaW5kKHpvbmVTcGVjKTtcblxuICAgIC8vIFdlIHNldHVwIHRoZSB0YXNrIHN0YXRlIGludGVyY2VwdG9yIGluIHRoZSBgUHJveHlab25lYC4gTm90ZSB0aGF0IHdlIGNhbm5vdCByZWdpc3RlclxuICAgIC8vIHRoZSBpbnRlcmNlcHRvciBhcyBhIG5ldyBwcm94eSB6b25lIGRlbGVnYXRlIGJlY2F1c2UgaXQgd291bGQgbWVhbiB0aGF0IG90aGVyIHpvbmVcbiAgICAvLyBkZWxlZ2F0ZXMgKGUuZy4gYEZha2VBc3luY1Rlc3Rab25lYCBvciBgQXN5bmNUZXN0Wm9uZWApIGNhbiBhY2NpZGVudGFsbHkgb3ZlcndyaXRlL2Rpc2FibGVcbiAgICAvLyBvdXIgaW50ZXJjZXB0b3IuIFNpbmNlIHdlIGp1c3QgaW50ZW5kIHRvIG1vbml0b3IgdGhlIHRhc2sgc3RhdGUgb2YgdGhlIHByb3h5IHpvbmUsIGl0IGlzXG4gICAgLy8gc3VmZmljaWVudCB0byBqdXN0IHBhdGNoIHRoZSBwcm94eSB6b25lLiBUaGlzIGFsc28gYXZvaWRzIHRoYXQgd2UgaW50ZXJmZXJlIHdpdGggdGhlIHRhc2tcbiAgICAvLyBxdWV1ZSBzY2hlZHVsaW5nIGxvZ2ljLlxuICAgIHpvbmVTcGVjLm9uSGFzVGFzayA9IGZ1bmN0aW9uICguLi5hcmdzOiBbWm9uZURlbGVnYXRlLCBab25lLCBab25lLCBIYXNUYXNrU3RhdGVdKSB7XG4gICAgICB6b25lU3BlY09uSGFzVGFzayguLi5hcmdzKTtcbiAgICAgIGludGVyY2VwdG9yLm9uSGFzVGFzayguLi5hcmdzKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuICh6b25lU3BlY1tzdGF0ZU9ic2VydmFibGVTeW1ib2xdID0gaW50ZXJjZXB0b3Iuc3RhdGUpO1xuICB9XG59XG4iXX0=