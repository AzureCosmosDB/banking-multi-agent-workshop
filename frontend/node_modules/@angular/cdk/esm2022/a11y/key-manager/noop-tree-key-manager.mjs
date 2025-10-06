/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
import { TREE_KEY_MANAGER } from './tree-key-manager';
// NoopTreeKeyManager is a "noop" implementation of TreeKeyMangerStrategy. Methods are noops. Does
// not emit to streams.
//
// Used for applications built before TreeKeyManager to opt-out of TreeKeyManager and revert to
// legacy behavior.
/**
 * @docs-private
 *
 * Opt-out of Tree of key manager behavior.
 *
 * When provided, Tree has same focus management behavior as before TreeKeyManager was introduced.
 *  - Tree does not respond to keyboard interaction
 *  - Tree node allows tabindex to be set by Input binding
 *  - Tree node allows tabindex to be set by attribute binding
 *
 * @deprecated NoopTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 21.0.0
 */
export class NoopTreeKeyManager {
    constructor() {
        this._isNoopTreeKeyManager = true;
        // Provide change as required by TreeKeyManagerStrategy. NoopTreeKeyManager is a "noop"
        // implementation that does not emit to streams.
        this.change = new Subject();
    }
    destroy() {
        this.change.complete();
    }
    onKeydown() {
        // noop
    }
    getActiveItemIndex() {
        // Always return null. NoopTreeKeyManager is a "noop" implementation that does not maintain
        // the active item.
        return null;
    }
    getActiveItem() {
        // Always return null. NoopTreeKeyManager is a "noop" implementation that does not maintain
        // the active item.
        return null;
    }
    focusItem() {
        // noop
    }
}
/**
 * @docs-private
 *
 * Opt-out of Tree of key manager behavior.
 *
 * When provided, Tree has same focus management behavior as before TreeKeyManager was introduced.
 *  - Tree does not respond to keyboard interaction
 *  - Tree node allows tabindex to be set by Input binding
 *  - Tree node allows tabindex to be set by attribute binding
 *
 * @deprecated NoopTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 21.0.0
 */
export function NOOP_TREE_KEY_MANAGER_FACTORY() {
    return () => new NoopTreeKeyManager();
}
/**
 * @docs-private
 *
 * Opt-out of Tree of key manager behavior.
 *
 * When provided, Tree has same focus management behavior as before TreeKeyManager was introduced.
 *  - Tree does not respond to keyboard interaction
 *  - Tree node allows tabindex to be set by Input binding
 *  - Tree node allows tabindex to be set by attribute binding
 *
 * @deprecated NoopTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 21.0.0
 */
export const NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER = {
    provide: TREE_KEY_MANAGER,
    useFactory: NOOP_TREE_KEY_MANAGER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC10cmVlLWtleS1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2tleS1tYW5hZ2VyL25vb3AtdHJlZS1rZXktbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBT3BELGtHQUFrRztBQUNsRyx1QkFBdUI7QUFDdkIsRUFBRTtBQUNGLCtGQUErRjtBQUMvRixtQkFBbUI7QUFDbkI7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBQS9CO1FBQ1csMEJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBRXRDLHVGQUF1RjtRQUN2RixnREFBZ0Q7UUFDdkMsV0FBTSxHQUFHLElBQUksT0FBTyxFQUFZLENBQUM7SUF5QjVDLENBQUM7SUF2QkMsT0FBTztRQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELFNBQVM7UUFDUCxPQUFPO0lBQ1QsQ0FBQztJQUVELGtCQUFrQjtRQUNoQiwyRkFBMkY7UUFDM0YsbUJBQW1CO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGFBQWE7UUFDWCwyRkFBMkY7UUFDM0YsbUJBQW1CO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVM7UUFDUCxPQUFPO0lBQ1QsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLFVBQVUsNkJBQTZCO0lBRzNDLE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxrQkFBa0IsRUFBSyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sQ0FBQyxNQUFNLHNDQUFzQyxHQUFHO0lBQ3BELE9BQU8sRUFBRSxnQkFBZ0I7SUFDekIsVUFBVSxFQUFFLDZCQUE2QjtDQUMxQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1RSRUVfS0VZX01BTkFHRVJ9IGZyb20gJy4vdHJlZS1rZXktbWFuYWdlcic7XG5pbXBvcnQge1xuICBUcmVlS2V5TWFuYWdlckZhY3RvcnksXG4gIFRyZWVLZXlNYW5hZ2VySXRlbSxcbiAgVHJlZUtleU1hbmFnZXJTdHJhdGVneSxcbn0gZnJvbSAnLi90cmVlLWtleS1tYW5hZ2VyLXN0cmF0ZWd5JztcblxuLy8gTm9vcFRyZWVLZXlNYW5hZ2VyIGlzIGEgXCJub29wXCIgaW1wbGVtZW50YXRpb24gb2YgVHJlZUtleU1hbmdlclN0cmF0ZWd5LiBNZXRob2RzIGFyZSBub29wcy4gRG9lc1xuLy8gbm90IGVtaXQgdG8gc3RyZWFtcy5cbi8vXG4vLyBVc2VkIGZvciBhcHBsaWNhdGlvbnMgYnVpbHQgYmVmb3JlIFRyZWVLZXlNYW5hZ2VyIHRvIG9wdC1vdXQgb2YgVHJlZUtleU1hbmFnZXIgYW5kIHJldmVydCB0b1xuLy8gbGVnYWN5IGJlaGF2aW9yLlxuLyoqXG4gKiBAZG9jcy1wcml2YXRlXG4gKlxuICogT3B0LW91dCBvZiBUcmVlIG9mIGtleSBtYW5hZ2VyIGJlaGF2aW9yLlxuICpcbiAqIFdoZW4gcHJvdmlkZWQsIFRyZWUgaGFzIHNhbWUgZm9jdXMgbWFuYWdlbWVudCBiZWhhdmlvciBhcyBiZWZvcmUgVHJlZUtleU1hbmFnZXIgd2FzIGludHJvZHVjZWQuXG4gKiAgLSBUcmVlIGRvZXMgbm90IHJlc3BvbmQgdG8ga2V5Ym9hcmQgaW50ZXJhY3Rpb25cbiAqICAtIFRyZWUgbm9kZSBhbGxvd3MgdGFiaW5kZXggdG8gYmUgc2V0IGJ5IElucHV0IGJpbmRpbmdcbiAqICAtIFRyZWUgbm9kZSBhbGxvd3MgdGFiaW5kZXggdG8gYmUgc2V0IGJ5IGF0dHJpYnV0ZSBiaW5kaW5nXG4gKlxuICogQGRlcHJlY2F0ZWQgTm9vcFRyZWVLZXlNYW5hZ2VyIGRlcHJlY2F0ZWQuIFVzZSBUcmVlS2V5TWFuYWdlciBvciBpbmplY3QgYVxuICogVHJlZUtleU1hbmFnZXJTdHJhdGVneSBpbnN0ZWFkLiBUbyBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24uXG4gKlxuICogQGJyZWFraW5nLWNoYW5nZSAyMS4wLjBcbiAqL1xuZXhwb3J0IGNsYXNzIE5vb3BUcmVlS2V5TWFuYWdlcjxUIGV4dGVuZHMgVHJlZUtleU1hbmFnZXJJdGVtPiBpbXBsZW1lbnRzIFRyZWVLZXlNYW5hZ2VyU3RyYXRlZ3k8VD4ge1xuICByZWFkb25seSBfaXNOb29wVHJlZUtleU1hbmFnZXIgPSB0cnVlO1xuXG4gIC8vIFByb3ZpZGUgY2hhbmdlIGFzIHJlcXVpcmVkIGJ5IFRyZWVLZXlNYW5hZ2VyU3RyYXRlZ3kuIE5vb3BUcmVlS2V5TWFuYWdlciBpcyBhIFwibm9vcFwiXG4gIC8vIGltcGxlbWVudGF0aW9uIHRoYXQgZG9lcyBub3QgZW1pdCB0byBzdHJlYW1zLlxuICByZWFkb25seSBjaGFuZ2UgPSBuZXcgU3ViamVjdDxUIHwgbnVsbD4oKTtcblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2hhbmdlLmNvbXBsZXRlKCk7XG4gIH1cblxuICBvbktleWRvd24oKSB7XG4gICAgLy8gbm9vcFxuICB9XG5cbiAgZ2V0QWN0aXZlSXRlbUluZGV4KCkge1xuICAgIC8vIEFsd2F5cyByZXR1cm4gbnVsbC4gTm9vcFRyZWVLZXlNYW5hZ2VyIGlzIGEgXCJub29wXCIgaW1wbGVtZW50YXRpb24gdGhhdCBkb2VzIG5vdCBtYWludGFpblxuICAgIC8vIHRoZSBhY3RpdmUgaXRlbS5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldEFjdGl2ZUl0ZW0oKSB7XG4gICAgLy8gQWx3YXlzIHJldHVybiBudWxsLiBOb29wVHJlZUtleU1hbmFnZXIgaXMgYSBcIm5vb3BcIiBpbXBsZW1lbnRhdGlvbiB0aGF0IGRvZXMgbm90IG1haW50YWluXG4gICAgLy8gdGhlIGFjdGl2ZSBpdGVtLlxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZm9jdXNJdGVtKCkge1xuICAgIC8vIG5vb3BcbiAgfVxufVxuXG4vKipcbiAqIEBkb2NzLXByaXZhdGVcbiAqXG4gKiBPcHQtb3V0IG9mIFRyZWUgb2Yga2V5IG1hbmFnZXIgYmVoYXZpb3IuXG4gKlxuICogV2hlbiBwcm92aWRlZCwgVHJlZSBoYXMgc2FtZSBmb2N1cyBtYW5hZ2VtZW50IGJlaGF2aW9yIGFzIGJlZm9yZSBUcmVlS2V5TWFuYWdlciB3YXMgaW50cm9kdWNlZC5cbiAqICAtIFRyZWUgZG9lcyBub3QgcmVzcG9uZCB0byBrZXlib2FyZCBpbnRlcmFjdGlvblxuICogIC0gVHJlZSBub2RlIGFsbG93cyB0YWJpbmRleCB0byBiZSBzZXQgYnkgSW5wdXQgYmluZGluZ1xuICogIC0gVHJlZSBub2RlIGFsbG93cyB0YWJpbmRleCB0byBiZSBzZXQgYnkgYXR0cmlidXRlIGJpbmRpbmdcbiAqXG4gKiBAZGVwcmVjYXRlZCBOb29wVHJlZUtleU1hbmFnZXIgZGVwcmVjYXRlZC4gVXNlIFRyZWVLZXlNYW5hZ2VyIG9yIGluamVjdCBhXG4gKiBUcmVlS2V5TWFuYWdlclN0cmF0ZWd5IGluc3RlYWQuIFRvIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbi5cbiAqXG4gKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gTk9PUF9UUkVFX0tFWV9NQU5BR0VSX0ZBQ1RPUlk8XG4gIFQgZXh0ZW5kcyBUcmVlS2V5TWFuYWdlckl0ZW0sXG4+KCk6IFRyZWVLZXlNYW5hZ2VyRmFjdG9yeTxUPiB7XG4gIHJldHVybiAoKSA9PiBuZXcgTm9vcFRyZWVLZXlNYW5hZ2VyPFQ+KCk7XG59XG5cbi8qKlxuICogQGRvY3MtcHJpdmF0ZVxuICpcbiAqIE9wdC1vdXQgb2YgVHJlZSBvZiBrZXkgbWFuYWdlciBiZWhhdmlvci5cbiAqXG4gKiBXaGVuIHByb3ZpZGVkLCBUcmVlIGhhcyBzYW1lIGZvY3VzIG1hbmFnZW1lbnQgYmVoYXZpb3IgYXMgYmVmb3JlIFRyZWVLZXlNYW5hZ2VyIHdhcyBpbnRyb2R1Y2VkLlxuICogIC0gVHJlZSBkb2VzIG5vdCByZXNwb25kIHRvIGtleWJvYXJkIGludGVyYWN0aW9uXG4gKiAgLSBUcmVlIG5vZGUgYWxsb3dzIHRhYmluZGV4IHRvIGJlIHNldCBieSBJbnB1dCBiaW5kaW5nXG4gKiAgLSBUcmVlIG5vZGUgYWxsb3dzIHRhYmluZGV4IHRvIGJlIHNldCBieSBhdHRyaWJ1dGUgYmluZGluZ1xuICpcbiAqIEBkZXByZWNhdGVkIE5vb3BUcmVlS2V5TWFuYWdlciBkZXByZWNhdGVkLiBVc2UgVHJlZUtleU1hbmFnZXIgb3IgaW5qZWN0IGFcbiAqIFRyZWVLZXlNYW5hZ2VyU3RyYXRlZ3kgaW5zdGVhZC4gVG8gYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uLlxuICpcbiAqIEBicmVha2luZy1jaGFuZ2UgMjEuMC4wXG4gKi9cbmV4cG9ydCBjb25zdCBOT09QX1RSRUVfS0VZX01BTkFHRVJfRkFDVE9SWV9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogVFJFRV9LRVlfTUFOQUdFUixcbiAgdXNlRmFjdG9yeTogTk9PUF9UUkVFX0tFWV9NQU5BR0VSX0ZBQ1RPUlksXG59O1xuIl19