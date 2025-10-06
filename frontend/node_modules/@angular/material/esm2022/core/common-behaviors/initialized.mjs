/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable } from 'rxjs';
/**
 * Mixin to augment a directive with an initialized property that will emits when ngOnInit ends.
 * @deprecated Track the initialized state manually.
 * @breaking-change 19.0.0
 */
export function mixinInitialized(base) {
    return class extends base {
        constructor(...args) {
            super(...args);
            /** Whether this directive has been marked as initialized. */
            this._isInitialized = false;
            /**
             * List of subscribers that subscribed before the directive was initialized. Should be notified
             * during _markInitialized. Set to null after pending subscribers are notified, and should
             * not expect to be populated after.
             */
            this._pendingSubscribers = [];
            /**
             * Observable stream that emits when the directive initializes. If already initialized, the
             * subscriber is stored to be notified once _markInitialized is called.
             */
            this.initialized = new Observable(subscriber => {
                // If initialized, immediately notify the subscriber. Otherwise store the subscriber to notify
                // when _markInitialized is called.
                if (this._isInitialized) {
                    this._notifySubscriber(subscriber);
                }
                else {
                    this._pendingSubscribers.push(subscriber);
                }
            });
        }
        /**
         * Marks the state as initialized and notifies pending subscribers. Should be called at the end
         * of ngOnInit.
         * @docs-private
         */
        _markInitialized() {
            if (this._isInitialized && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('This directive has already been marked as initialized and ' +
                    'should not be called twice.');
            }
            this._isInitialized = true;
            this._pendingSubscribers.forEach(this._notifySubscriber);
            this._pendingSubscribers = null;
        }
        /** Emits and completes the subscriber stream (should only emit once). */
        _notifySubscriber(subscriber) {
            subscriber.next();
            subscriber.complete();
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY29yZS9jb21tb24tYmVoYXZpb3JzL2luaXRpYWxpemVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQWEsTUFBTSxNQUFNLENBQUM7QUEwQjVDOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQTRCLElBQU87SUFDakUsT0FBTyxLQUFNLFNBQVEsSUFBSTtRQXlCdkIsWUFBWSxHQUFHLElBQVc7WUFDeEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUF6QmpCLDZEQUE2RDtZQUM3RCxtQkFBYyxHQUFHLEtBQUssQ0FBQztZQUV2Qjs7OztlQUlHO1lBQ0gsd0JBQW1CLEdBQThCLEVBQUUsQ0FBQztZQUVwRDs7O2VBR0c7WUFDSCxnQkFBVyxHQUFHLElBQUksVUFBVSxDQUFPLFVBQVUsQ0FBQyxFQUFFO2dCQUM5Qyw4RkFBOEY7Z0JBQzlGLG1DQUFtQztnQkFDbkMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckMsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzdDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUlILENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsZ0JBQWdCO1lBQ2QsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzNFLE1BQU0sS0FBSyxDQUNULDREQUE0RDtvQkFDMUQsNkJBQTZCLENBQ2hDLENBQUM7WUFDSixDQUFDO1lBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFFM0IsSUFBSSxDQUFDLG1CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLENBQUM7UUFFRCx5RUFBeUU7UUFDekUsaUJBQWlCLENBQUMsVUFBNEI7WUFDNUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4QixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJzY3JpYmVyfSBmcm9tICdyeGpzJztcbmltcG9ydCB7Q29uc3RydWN0b3J9IGZyb20gJy4vY29uc3RydWN0b3InO1xuXG4vKipcbiAqIE1peGluIHRoYXQgYWRkcyBhbiBpbml0aWFsaXplZCBwcm9wZXJ0eSB0byBhIGRpcmVjdGl2ZSB3aGljaCwgd2hlbiBzdWJzY3JpYmVkIHRvLCB3aWxsIGVtaXQgYVxuICogdmFsdWUgb25jZSBtYXJrSW5pdGlhbGl6ZWQgaGFzIGJlZW4gY2FsbGVkLCB3aGljaCBzaG91bGQgYmUgZG9uZSBkdXJpbmcgdGhlIG5nT25Jbml0IGZ1bmN0aW9uLlxuICogSWYgdGhlIHN1YnNjcmlwdGlvbiBpcyBtYWRlIGFmdGVyIGl0IGhhcyBhbHJlYWR5IGJlZW4gbWFya2VkIGFzIGluaXRpYWxpemVkLCB0aGVuIGl0IHdpbGwgdHJpZ2dlclxuICogYW4gZW1pdCBpbW1lZGlhdGVseS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqIEBkZXByZWNhdGVkIFdpbGwgYmUgcmVtb3ZlZCB0b2dldGhlciB3aXRoIGBtaXhpbkluaXRpYWxpemVyYC5cbiAqIEBicmVha2luZy1jaGFuZ2UgMTkuMC4wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFzSW5pdGlhbGl6ZWQge1xuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgb25jZSBkdXJpbmcgdGhlIGRpcmVjdGl2ZS9jb21wb25lbnQncyBuZ09uSW5pdC4gKi9cbiAgaW5pdGlhbGl6ZWQ6IE9ic2VydmFibGU8dm9pZD47XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0YXRlIGFzIGluaXRpYWxpemVkIGFuZCBtdXN0IGJlIGNhbGxlZCBkdXJpbmcgbmdPbkluaXQgdG8gbm90aWZ5IHN1YnNjcmliZXJzIHRoYXRcbiAgICogdGhlIGRpcmVjdGl2ZSBoYXMgYmVlbiBpbml0aWFsaXplZC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgX21hcmtJbml0aWFsaXplZDogKCkgPT4gdm9pZDtcbn1cblxudHlwZSBIYXNJbml0aWFsaXplZEN0b3IgPSBDb25zdHJ1Y3RvcjxIYXNJbml0aWFsaXplZD47XG5cbi8qKlxuICogTWl4aW4gdG8gYXVnbWVudCBhIGRpcmVjdGl2ZSB3aXRoIGFuIGluaXRpYWxpemVkIHByb3BlcnR5IHRoYXQgd2lsbCBlbWl0cyB3aGVuIG5nT25Jbml0IGVuZHMuXG4gKiBAZGVwcmVjYXRlZCBUcmFjayB0aGUgaW5pdGlhbGl6ZWQgc3RhdGUgbWFudWFsbHkuXG4gKiBAYnJlYWtpbmctY2hhbmdlIDE5LjAuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWl4aW5Jbml0aWFsaXplZDxUIGV4dGVuZHMgQ29uc3RydWN0b3I8e30+PihiYXNlOiBUKTogSGFzSW5pdGlhbGl6ZWRDdG9yICYgVCB7XG4gIHJldHVybiBjbGFzcyBleHRlbmRzIGJhc2Uge1xuICAgIC8qKiBXaGV0aGVyIHRoaXMgZGlyZWN0aXZlIGhhcyBiZWVuIG1hcmtlZCBhcyBpbml0aWFsaXplZC4gKi9cbiAgICBfaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiBzdWJzY3JpYmVycyB0aGF0IHN1YnNjcmliZWQgYmVmb3JlIHRoZSBkaXJlY3RpdmUgd2FzIGluaXRpYWxpemVkLiBTaG91bGQgYmUgbm90aWZpZWRcbiAgICAgKiBkdXJpbmcgX21hcmtJbml0aWFsaXplZC4gU2V0IHRvIG51bGwgYWZ0ZXIgcGVuZGluZyBzdWJzY3JpYmVycyBhcmUgbm90aWZpZWQsIGFuZCBzaG91bGRcbiAgICAgKiBub3QgZXhwZWN0IHRvIGJlIHBvcHVsYXRlZCBhZnRlci5cbiAgICAgKi9cbiAgICBfcGVuZGluZ1N1YnNjcmliZXJzOiBTdWJzY3JpYmVyPHZvaWQ+W10gfCBudWxsID0gW107XG5cbiAgICAvKipcbiAgICAgKiBPYnNlcnZhYmxlIHN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gdGhlIGRpcmVjdGl2ZSBpbml0aWFsaXplcy4gSWYgYWxyZWFkeSBpbml0aWFsaXplZCwgdGhlXG4gICAgICogc3Vic2NyaWJlciBpcyBzdG9yZWQgdG8gYmUgbm90aWZpZWQgb25jZSBfbWFya0luaXRpYWxpemVkIGlzIGNhbGxlZC5cbiAgICAgKi9cbiAgICBpbml0aWFsaXplZCA9IG5ldyBPYnNlcnZhYmxlPHZvaWQ+KHN1YnNjcmliZXIgPT4ge1xuICAgICAgLy8gSWYgaW5pdGlhbGl6ZWQsIGltbWVkaWF0ZWx5IG5vdGlmeSB0aGUgc3Vic2NyaWJlci4gT3RoZXJ3aXNlIHN0b3JlIHRoZSBzdWJzY3JpYmVyIHRvIG5vdGlmeVxuICAgICAgLy8gd2hlbiBfbWFya0luaXRpYWxpemVkIGlzIGNhbGxlZC5cbiAgICAgIGlmICh0aGlzLl9pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXIoc3Vic2NyaWJlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wZW5kaW5nU3Vic2NyaWJlcnMhLnB1c2goc3Vic2NyaWJlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFya3MgdGhlIHN0YXRlIGFzIGluaXRpYWxpemVkIGFuZCBub3RpZmllcyBwZW5kaW5nIHN1YnNjcmliZXJzLiBTaG91bGQgYmUgY2FsbGVkIGF0IHRoZSBlbmRcbiAgICAgKiBvZiBuZ09uSW5pdC5cbiAgICAgKiBAZG9jcy1wcml2YXRlXG4gICAgICovXG4gICAgX21hcmtJbml0aWFsaXplZCgpOiB2b2lkIHtcbiAgICAgIGlmICh0aGlzLl9pc0luaXRpYWxpemVkICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICdUaGlzIGRpcmVjdGl2ZSBoYXMgYWxyZWFkeSBiZWVuIG1hcmtlZCBhcyBpbml0aWFsaXplZCBhbmQgJyArXG4gICAgICAgICAgICAnc2hvdWxkIG5vdCBiZSBjYWxsZWQgdHdpY2UuJyxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICAgIHRoaXMuX3BlbmRpbmdTdWJzY3JpYmVycyEuZm9yRWFjaCh0aGlzLl9ub3RpZnlTdWJzY3JpYmVyKTtcbiAgICAgIHRoaXMuX3BlbmRpbmdTdWJzY3JpYmVycyA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqIEVtaXRzIGFuZCBjb21wbGV0ZXMgdGhlIHN1YnNjcmliZXIgc3RyZWFtIChzaG91bGQgb25seSBlbWl0IG9uY2UpLiAqL1xuICAgIF9ub3RpZnlTdWJzY3JpYmVyKHN1YnNjcmliZXI6IFN1YnNjcmliZXI8dm9pZD4pOiB2b2lkIHtcbiAgICAgIHN1YnNjcmliZXIubmV4dCgpO1xuICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==