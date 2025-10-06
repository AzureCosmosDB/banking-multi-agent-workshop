/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
/**
 * Mixin to provide a directive with a function that checks if the sticky input has been
 * changed since the last time the function was called. Essentially adds a dirty-check to the
 * sticky value.
 * @docs-private
 * @deprecated Implement the `CanStick` interface instead.
 * @breaking-change 19.0.0
 */
export function mixinHasStickyInput(base) {
    return class extends base {
        /** Whether sticky positioning should be applied. */
        get sticky() {
            return this._sticky;
        }
        set sticky(v) {
            const prevValue = this._sticky;
            this._sticky = coerceBooleanProperty(v);
            this._hasStickyChanged = prevValue !== this._sticky;
        }
        /** Whether the sticky value has changed since this was last called. */
        hasStickyChanged() {
            const hasStickyChanged = this._hasStickyChanged;
            this._hasStickyChanged = false;
            return hasStickyChanged;
        }
        /** Resets the dirty check for cases where the sticky state has been used without checking. */
        resetStickyChanged() {
            this._hasStickyChanged = false;
        }
        constructor(...args) {
            super(...args);
            this._sticky = false;
            /** Whether the sticky input has changed since it was last checked. */
            this._hasStickyChanged = false;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuLXN0aWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90YWJsZS9jYW4tc3RpY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUF5QjFFOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQTRCLElBQU87SUFDcEUsT0FBTyxLQUFNLFNBQVEsSUFBSTtRQUN2QixvREFBb0Q7UUFDcEQsSUFBSSxNQUFNO1lBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxJQUFJLE1BQU0sQ0FBQyxDQUFlO1lBQ3hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDdEQsQ0FBQztRQU1ELHVFQUF1RTtRQUN2RSxnQkFBZ0I7WUFDZCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUNoRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQy9CLE9BQU8sZ0JBQWdCLENBQUM7UUFDMUIsQ0FBQztRQUVELDhGQUE4RjtRQUM5RixrQkFBa0I7WUFDaEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUNqQyxDQUFDO1FBRUQsWUFBWSxHQUFHLElBQVc7WUFDeEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFsQmpCLFlBQU8sR0FBWSxLQUFLLENBQUM7WUFFekIsc0VBQXNFO1lBQ3RFLHNCQUFpQixHQUFZLEtBQUssQ0FBQztRQWdCbkMsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvcjxUPiA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IFQ7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBhIG1peGluIHRvIHByb3ZpZGUgYSBkaXJlY3RpdmUgd2l0aCBhIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIHRoZSBzdGlja3kgaW5wdXQgaGFzXG4gKiBiZWVuIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZnVuY3Rpb24gd2FzIGNhbGxlZC4gRXNzZW50aWFsbHkgYWRkcyBhIGRpcnR5LWNoZWNrIHRvIHRoZVxuICogc3RpY2t5IHZhbHVlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENhblN0aWNrIHtcbiAgLyoqIFdoZXRoZXIgc3RpY2t5IHBvc2l0aW9uaW5nIHNob3VsZCBiZSBhcHBsaWVkLiAqL1xuICBzdGlja3k6IGJvb2xlYW47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHN0aWNreSB2YWx1ZSBoYXMgY2hhbmdlZCBzaW5jZSB0aGlzIHdhcyBsYXN0IGNhbGxlZC4gKi9cbiAgaGFzU3RpY2t5Q2hhbmdlZCgpOiBib29sZWFuO1xuXG4gIC8qKiBSZXNldHMgdGhlIGRpcnR5IGNoZWNrIGZvciBjYXNlcyB3aGVyZSB0aGUgc3RpY2t5IHN0YXRlIGhhcyBiZWVuIHVzZWQgd2l0aG91dCBjaGVja2luZy4gKi9cbiAgcmVzZXRTdGlja3lDaGFuZ2VkKCk6IHZvaWQ7XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgdHlwZSBDYW5TdGlja0N0b3IgPSBDb25zdHJ1Y3RvcjxDYW5TdGljaz47XG5cbi8qKlxuICogTWl4aW4gdG8gcHJvdmlkZSBhIGRpcmVjdGl2ZSB3aXRoIGEgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgdGhlIHN0aWNreSBpbnB1dCBoYXMgYmVlblxuICogY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBmdW5jdGlvbiB3YXMgY2FsbGVkLiBFc3NlbnRpYWxseSBhZGRzIGEgZGlydHktY2hlY2sgdG8gdGhlXG4gKiBzdGlja3kgdmFsdWUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKiBAZGVwcmVjYXRlZCBJbXBsZW1lbnQgdGhlIGBDYW5TdGlja2AgaW50ZXJmYWNlIGluc3RlYWQuXG4gKiBAYnJlYWtpbmctY2hhbmdlIDE5LjAuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWl4aW5IYXNTdGlja3lJbnB1dDxUIGV4dGVuZHMgQ29uc3RydWN0b3I8e30+PihiYXNlOiBUKTogQ2FuU3RpY2tDdG9yICYgVCB7XG4gIHJldHVybiBjbGFzcyBleHRlbmRzIGJhc2Uge1xuICAgIC8qKiBXaGV0aGVyIHN0aWNreSBwb3NpdGlvbmluZyBzaG91bGQgYmUgYXBwbGllZC4gKi9cbiAgICBnZXQgc3RpY2t5KCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0aWNreTtcbiAgICB9XG4gICAgc2V0IHN0aWNreSh2OiBCb29sZWFuSW5wdXQpIHtcbiAgICAgIGNvbnN0IHByZXZWYWx1ZSA9IHRoaXMuX3N0aWNreTtcbiAgICAgIHRoaXMuX3N0aWNreSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2KTtcbiAgICAgIHRoaXMuX2hhc1N0aWNreUNoYW5nZWQgPSBwcmV2VmFsdWUgIT09IHRoaXMuX3N0aWNreTtcbiAgICB9XG4gICAgX3N0aWNreTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqIFdoZXRoZXIgdGhlIHN0aWNreSBpbnB1dCBoYXMgY2hhbmdlZCBzaW5jZSBpdCB3YXMgbGFzdCBjaGVja2VkLiAqL1xuICAgIF9oYXNTdGlja3lDaGFuZ2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKiogV2hldGhlciB0aGUgc3RpY2t5IHZhbHVlIGhhcyBjaGFuZ2VkIHNpbmNlIHRoaXMgd2FzIGxhc3QgY2FsbGVkLiAqL1xuICAgIGhhc1N0aWNreUNoYW5nZWQoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCBoYXNTdGlja3lDaGFuZ2VkID0gdGhpcy5faGFzU3RpY2t5Q2hhbmdlZDtcbiAgICAgIHRoaXMuX2hhc1N0aWNreUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiBoYXNTdGlja3lDaGFuZ2VkO1xuICAgIH1cblxuICAgIC8qKiBSZXNldHMgdGhlIGRpcnR5IGNoZWNrIGZvciBjYXNlcyB3aGVyZSB0aGUgc3RpY2t5IHN0YXRlIGhhcyBiZWVuIHVzZWQgd2l0aG91dCBjaGVja2luZy4gKi9cbiAgICByZXNldFN0aWNreUNoYW5nZWQoKSB7XG4gICAgICB0aGlzLl9oYXNTdGlja3lDaGFuZ2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJnczogYW55W10pIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==