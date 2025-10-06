/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import * as i0 from "@angular/core";
/** The relative item in the inline menu to focus after closing all popup menus. */
export var FocusNext;
(function (FocusNext) {
    FocusNext[FocusNext["nextItem"] = 0] = "nextItem";
    FocusNext[FocusNext["previousItem"] = 1] = "previousItem";
    FocusNext[FocusNext["currentItem"] = 2] = "currentItem";
})(FocusNext || (FocusNext = {}));
/** Injection token used for an implementation of MenuStack. */
export const MENU_STACK = new InjectionToken('cdk-menu-stack');
/** Provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
export const PARENT_OR_NEW_MENU_STACK_PROVIDER = {
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
};
/** Provider that provides the parent menu stack, or a new inline menu stack if there is no parent one. */
export const PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER = (orientation) => ({
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || MenuStack.inline(orientation),
});
/** The next available menu stack ID. */
let nextId = 0;
/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
export class MenuStack {
    constructor() {
        /** The ID of this menu stack. */
        this.id = `${nextId++}`;
        /** All MenuStackItems tracked by this MenuStack. */
        this._elements = [];
        /** Emits the element which was popped off of the stack when requested by a closer. */
        this._close = new Subject();
        /** Emits once the MenuStack has become empty after popping off elements. */
        this._empty = new Subject();
        /** Emits whether any menu in the menu stack has focus. */
        this._hasFocus = new Subject();
        /** Observable which emits the MenuStackItem which has been requested to close. */
        this.closed = this._close;
        /** Observable which emits whether any menu in the menu stack has focus. */
        this.hasFocus = this._hasFocus.pipe(startWith(false), debounceTime(0), distinctUntilChanged());
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.emptied = this._empty;
        /**
         * Whether the inline menu associated with this menu stack is vertical or horizontal.
         * `null` indicates there is no inline menu associated with this menu stack.
         */
        this._inlineMenuOrientation = null;
    }
    /** Creates a menu stack that originates from an inline menu. */
    static inline(orientation) {
        const stack = new MenuStack();
        stack._inlineMenuOrientation = orientation;
        return stack;
    }
    /**
     * Adds an item to the menu stack.
     * @param menu the MenuStackItem to put on the stack.
     */
    push(menu) {
        this._elements.push(menu);
    }
    /**
     * Pop items off of the stack up to and including `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the last item to pop off the stack.
     * @param options Options that configure behavior on close.
     */
    close(lastItem, options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (this._elements.indexOf(lastItem) >= 0) {
            let poppedElement;
            do {
                poppedElement = this._elements.pop();
                this._close.next({ item: poppedElement, focusParentTrigger });
            } while (poppedElement !== lastItem);
            if (this.isEmpty()) {
                this._empty.next(focusNextOnEmpty);
            }
        }
    }
    /**
     * Pop items off of the stack up to but excluding `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the element which should be left on the stack
     * @return whether or not an item was removed from the stack
     */
    closeSubMenuOf(lastItem) {
        let removed = false;
        if (this._elements.indexOf(lastItem) >= 0) {
            removed = this.peek() !== lastItem;
            while (this.peek() !== lastItem) {
                this._close.next({ item: this._elements.pop() });
            }
        }
        return removed;
    }
    /**
     * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
     * @param options Options that configure behavior on close.
     */
    closeAll(options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (!this.isEmpty()) {
            while (!this.isEmpty()) {
                const menuStackItem = this._elements.pop();
                if (menuStackItem) {
                    this._close.next({ item: menuStackItem, focusParentTrigger });
                }
            }
            this._empty.next(focusNextOnEmpty);
        }
    }
    /** Return true if this stack is empty. */
    isEmpty() {
        return !this._elements.length;
    }
    /** Return the length of the stack. */
    length() {
        return this._elements.length;
    }
    /** Get the top most element on the stack. */
    peek() {
        return this._elements[this._elements.length - 1];
    }
    /** Whether the menu stack is associated with an inline menu. */
    hasInlineMenu() {
        return this._inlineMenuOrientation != null;
    }
    /** The orientation of the associated inline menu. */
    inlineMenuOrientation() {
        return this._inlineMenuOrientation;
    }
    /** Sets whether the menu stack contains the focused element. */
    setHasFocus(hasFocus) {
        this._hasFocus.next(hasFocus);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MenuStack, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MenuStack }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MenuStack, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbWVudS9tZW51LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3JGLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFFN0UsbUZBQW1GO0FBQ25GLE1BQU0sQ0FBTixJQUFZLFNBSVg7QUFKRCxXQUFZLFNBQVM7SUFDbkIsaURBQVEsQ0FBQTtJQUNSLHlEQUFZLENBQUE7SUFDWix1REFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUpXLFNBQVMsS0FBVCxTQUFTLFFBSXBCO0FBUUQsK0RBQStEO0FBQy9ELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBWSxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTFFLG1HQUFtRztBQUNuRyxNQUFNLENBQUMsTUFBTSxpQ0FBaUMsR0FBRztJQUMvQyxPQUFPLEVBQUUsVUFBVTtJQUNuQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLFVBQVUsRUFBRSxDQUFDLGVBQTJCLEVBQUUsRUFBRSxDQUFDLGVBQWUsSUFBSSxJQUFJLFNBQVMsRUFBRTtDQUNoRixDQUFDO0FBRUYsMEdBQTBHO0FBQzFHLE1BQU0sQ0FBQyxNQUFNLHdDQUF3QyxHQUFHLENBQ3RELFdBQXNDLEVBQ3RDLEVBQUUsQ0FBQyxDQUFDO0lBQ0osT0FBTyxFQUFFLFVBQVU7SUFDbkIs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QWE7UUFDWCxPQUFPLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLENBQUM7SUFDN0MsQ0FBQztJQUVELHFEQUFxRDtJQUNyRCxxQkFBcUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUM7SUFDckMsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxXQUFXLENBQUMsUUFBaUI7UUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsQ0FBQztxSEF6SVUsU0FBUzt5SEFBVCxTQUFTOztrR0FBVCxTQUFTO2tCQURyQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWwsIFNraXBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2RlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHN0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogVGhlIHJlbGF0aXZlIGl0ZW0gaW4gdGhlIGlubGluZSBtZW51IHRvIGZvY3VzIGFmdGVyIGNsb3NpbmcgYWxsIHBvcHVwIG1lbnVzLiAqL1xuZXhwb3J0IGVudW0gRm9jdXNOZXh0IHtcbiAgbmV4dEl0ZW0sXG4gIHByZXZpb3VzSXRlbSxcbiAgY3VycmVudEl0ZW0sXG59XG5cbi8qKiBBIHNpbmdsZSBpdGVtIChtZW51KSBpbiB0aGUgbWVudSBzdGFjay4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVudVN0YWNrSXRlbSB7XG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgbWVudSBzdGFjayB0aGlzIG1lbnUgc3RhY2sgaXRlbSBiZWxvbmdzIHRvLiAqL1xuICBtZW51U3RhY2s/OiBNZW51U3RhY2s7XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdXNlZCBmb3IgYW4gaW1wbGVtZW50YXRpb24gb2YgTWVudVN0YWNrLiAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfU1RBQ0sgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWVudVN0YWNrPignY2RrLW1lbnUtc3RhY2snKTtcblxuLyoqIFByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmVudCBtZW51IHN0YWNrLCBvciBhIG5ldyBtZW51IHN0YWNrIGlmIHRoZXJlIGlzIG5vIHBhcmVudCBvbmUuICovXG5leHBvcnQgY29uc3QgUEFSRU5UX09SX05FV19NRU5VX1NUQUNLX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNRU5VX1NUQUNLLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgbmV3IEluamVjdChNRU5VX1NUQUNLKV1dLFxuICB1c2VGYWN0b3J5OiAocGFyZW50TWVudVN0YWNrPzogTWVudVN0YWNrKSA9PiBwYXJlbnRNZW51U3RhY2sgfHwgbmV3IE1lbnVTdGFjaygpLFxufTtcblxuLyoqIFByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmVudCBtZW51IHN0YWNrLCBvciBhIG5ldyBpbmxpbmUgbWVudSBzdGFjayBpZiB0aGVyZSBpcyBubyBwYXJlbnQgb25lLiAqL1xuZXhwb3J0IGNvbnN0IFBBUkVOVF9PUl9ORVdfSU5MSU5FX01FTlVfU1RBQ0tfUFJPVklERVIgPSAoXG4gIG9yaWVudGF0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnLFxuKSA9PiAoe1xuICBwcm92aWRlOiBNRU5VX1NUQUNLLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgbmV3IEluamVjdChNRU5VX1NUQUNLKV1dLFxuICB1c2VGYWN0b3J5OiAocGFyZW50TWVudVN0YWNrPzogTWVudVN0YWNrKSA9PiBwYXJlbnRNZW51U3RhY2sgfHwgTWVudVN0YWNrLmlubGluZShvcmllbnRhdGlvbiksXG59KTtcblxuLyoqIE9wdGlvbnMgdGhhdCBjYW4gYmUgcHJvdmlkZWQgdG8gdGhlIGNsb3NlIG9yIGNsb3NlQWxsIG1ldGhvZHMuICovXG5leHBvcnQgaW50ZXJmYWNlIENsb3NlT3B0aW9ucyB7XG4gIC8qKiBUaGUgZWxlbWVudCB0byBmb2N1cyBuZXh0IGlmIHRoZSBjbG9zZSBvcGVyYXRpb24gY2F1c2VzIHRoZSBtZW51IHN0YWNrIHRvIGJlY29tZSBlbXB0eS4gKi9cbiAgZm9jdXNOZXh0T25FbXB0eT86IEZvY3VzTmV4dDtcbiAgLyoqIFdoZXRoZXIgdG8gZm9jdXMgdGhlIHBhcmVudCB0cmlnZ2VyIGFmdGVyIGNsb3NpbmcgdGhlIG1lbnUuICovXG4gIGZvY3VzUGFyZW50VHJpZ2dlcj86IGJvb2xlYW47XG59XG5cbi8qKiBFdmVudCBkaXNwYXRjaGVkIHdoZW4gYSBtZW51IGlzIGNsb3NlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVudVN0YWNrQ2xvc2VFdmVudCB7XG4gIC8qKiBUaGUgbWVudSBiZWluZyBjbG9zZWQuICovXG4gIGl0ZW06IE1lbnVTdGFja0l0ZW07XG4gIC8qKiBXaGV0aGVyIHRvIGZvY3VzIHRoZSBwYXJlbnQgdHJpZ2dlciBhZnRlciBjbG9zaW5nIHRoZSBtZW51LiAqL1xuICBmb2N1c1BhcmVudFRyaWdnZXI/OiBib29sZWFuO1xufVxuXG4vKiogVGhlIG5leHQgYXZhaWxhYmxlIG1lbnUgc3RhY2sgSUQuICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBNZW51U3RhY2sgYWxsb3dzIHN1YnNjcmliZXJzIHRvIGxpc3RlbiBmb3IgY2xvc2UgZXZlbnRzICh3aGVuIGEgTWVudVN0YWNrSXRlbSBpcyBwb3BwZWQgb2ZmXG4gKiBvZiB0aGUgc3RhY2spIGluIG9yZGVyIHRvIHBlcmZvcm0gY2xvc2luZyBhY3Rpb25zLiBVcG9uIHRoZSBNZW51U3RhY2sgYmVpbmcgZW1wdHkgaXQgZW1pdHNcbiAqIGZyb20gdGhlIGBlbXB0eWAgb2JzZXJ2YWJsZSBzcGVjaWZ5aW5nIHRoZSBuZXh0IGZvY3VzIGFjdGlvbiB3aGljaCB0aGUgbGlzdGVuZXIgc2hvdWxkIHBlcmZvcm1cbiAqIGFzIHJlcXVlc3RlZCBieSB0aGUgY2xvc2VyLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVudVN0YWNrIHtcbiAgLyoqIFRoZSBJRCBvZiB0aGlzIG1lbnUgc3RhY2suICovXG4gIHJlYWRvbmx5IGlkID0gYCR7bmV4dElkKyt9YDtcblxuICAvKiogQWxsIE1lbnVTdGFja0l0ZW1zIHRyYWNrZWQgYnkgdGhpcyBNZW51U3RhY2suICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRzOiBNZW51U3RhY2tJdGVtW10gPSBbXTtcblxuICAvKiogRW1pdHMgdGhlIGVsZW1lbnQgd2hpY2ggd2FzIHBvcHBlZCBvZmYgb2YgdGhlIHN0YWNrIHdoZW4gcmVxdWVzdGVkIGJ5IGEgY2xvc2VyLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jbG9zZSA9IG5ldyBTdWJqZWN0PE1lbnVTdGFja0Nsb3NlRXZlbnQ+KCk7XG5cbiAgLyoqIEVtaXRzIG9uY2UgdGhlIE1lbnVTdGFjayBoYXMgYmVjb21lIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIGVsZW1lbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbXB0eSA9IG5ldyBTdWJqZWN0PEZvY3VzTmV4dCB8IHVuZGVmaW5lZD4oKTtcblxuICAvKiogRW1pdHMgd2hldGhlciBhbnkgbWVudSBpbiB0aGUgbWVudSBzdGFjayBoYXMgZm9jdXMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hhc0ZvY3VzID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcblxuICAvKiogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB0aGUgTWVudVN0YWNrSXRlbSB3aGljaCBoYXMgYmVlbiByZXF1ZXN0ZWQgdG8gY2xvc2UuICovXG4gIHJlYWRvbmx5IGNsb3NlZDogT2JzZXJ2YWJsZTxNZW51U3RhY2tDbG9zZUV2ZW50PiA9IHRoaXMuX2Nsb3NlO1xuXG4gIC8qKiBPYnNlcnZhYmxlIHdoaWNoIGVtaXRzIHdoZXRoZXIgYW55IG1lbnUgaW4gdGhlIG1lbnUgc3RhY2sgaGFzIGZvY3VzLiAqL1xuICByZWFkb25seSBoYXNGb2N1czogT2JzZXJ2YWJsZTxib29sZWFuPiA9IHRoaXMuX2hhc0ZvY3VzLnBpcGUoXG4gICAgc3RhcnRXaXRoKGZhbHNlKSxcbiAgICBkZWJvdW5jZVRpbWUoMCksXG4gICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgKTtcblxuICAvKipcbiAgICogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB3aGVuIHRoZSBNZW51U3RhY2sgaXMgZW1wdHkgYWZ0ZXIgcG9wcGluZyBvZmYgdGhlIGxhc3QgZWxlbWVudC4gSXRcbiAgICogZW1pdHMgYSBGb2N1c05leHQgZXZlbnQgd2hpY2ggc3BlY2lmaWVzIHRoZSBhY3Rpb24gdGhlIGNsb3NlciBoYXMgcmVxdWVzdGVkIHRoZSBsaXN0ZW5lclxuICAgKiBwZXJmb3JtLlxuICAgKi9cbiAgcmVhZG9ubHkgZW1wdGllZDogT2JzZXJ2YWJsZTxGb2N1c05leHQgfCB1bmRlZmluZWQ+ID0gdGhpcy5fZW1wdHk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGlubGluZSBtZW51IGFzc29jaWF0ZWQgd2l0aCB0aGlzIG1lbnUgc3RhY2sgaXMgdmVydGljYWwgb3IgaG9yaXpvbnRhbC5cbiAgICogYG51bGxgIGluZGljYXRlcyB0aGVyZSBpcyBubyBpbmxpbmUgbWVudSBhc3NvY2lhdGVkIHdpdGggdGhpcyBtZW51IHN0YWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBfaW5saW5lTWVudU9yaWVudGF0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIENyZWF0ZXMgYSBtZW51IHN0YWNrIHRoYXQgb3JpZ2luYXRlcyBmcm9tIGFuIGlubGluZSBtZW51LiAqL1xuICBzdGF0aWMgaW5saW5lKG9yaWVudGF0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgTWVudVN0YWNrKCk7XG4gICAgc3RhY2suX2lubGluZU1lbnVPcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGl0ZW0gdG8gdGhlIG1lbnUgc3RhY2suXG4gICAqIEBwYXJhbSBtZW51IHRoZSBNZW51U3RhY2tJdGVtIHRvIHB1dCBvbiB0aGUgc3RhY2suXG4gICAqL1xuICBwdXNoKG1lbnU6IE1lbnVTdGFja0l0ZW0pIHtcbiAgICB0aGlzLl9lbGVtZW50cy5wdXNoKG1lbnUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGFuZCBpbmNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBsYXN0IGl0ZW0gdG8gcG9wIG9mZiB0aGUgc3RhY2suXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdGhhdCBjb25maWd1cmUgYmVoYXZpb3Igb24gY2xvc2UuXG4gICAqL1xuICBjbG9zZShsYXN0SXRlbTogTWVudVN0YWNrSXRlbSwgb3B0aW9ucz86IENsb3NlT3B0aW9ucykge1xuICAgIGNvbnN0IHtmb2N1c05leHRPbkVtcHR5LCBmb2N1c1BhcmVudFRyaWdnZXJ9ID0gey4uLm9wdGlvbnN9O1xuICAgIGlmICh0aGlzLl9lbGVtZW50cy5pbmRleE9mKGxhc3RJdGVtKSA+PSAwKSB7XG4gICAgICBsZXQgcG9wcGVkRWxlbWVudDtcbiAgICAgIGRvIHtcbiAgICAgICAgcG9wcGVkRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpITtcbiAgICAgICAgdGhpcy5fY2xvc2UubmV4dCh7aXRlbTogcG9wcGVkRWxlbWVudCwgZm9jdXNQYXJlbnRUcmlnZ2VyfSk7XG4gICAgICB9IHdoaWxlIChwb3BwZWRFbGVtZW50ICE9PSBsYXN0SXRlbSk7XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dE9uRW1wdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQb3AgaXRlbXMgb2ZmIG9mIHRoZSBzdGFjayB1cCB0byBidXQgZXhjbHVkaW5nIGBsYXN0SXRlbWAgYW5kIGVtaXQgZWFjaCBvbiB0aGUgY2xvc2VcbiAgICogb2JzZXJ2YWJsZS4gSWYgdGhlIHN0YWNrIGlzIGVtcHR5IG9yIGBsYXN0SXRlbWAgaXMgbm90IG9uIHRoZSBzdGFjayBpdCBkb2VzIG5vdGhpbmcuXG4gICAqIEBwYXJhbSBsYXN0SXRlbSB0aGUgZWxlbWVudCB3aGljaCBzaG91bGQgYmUgbGVmdCBvbiB0aGUgc3RhY2tcbiAgICogQHJldHVybiB3aGV0aGVyIG9yIG5vdCBhbiBpdGVtIHdhcyByZW1vdmVkIGZyb20gdGhlIHN0YWNrXG4gICAqL1xuICBjbG9zZVN1Yk1lbnVPZihsYXN0SXRlbTogTWVudVN0YWNrSXRlbSkge1xuICAgIGxldCByZW1vdmVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzLmluZGV4T2YobGFzdEl0ZW0pID49IDApIHtcbiAgICAgIHJlbW92ZWQgPSB0aGlzLnBlZWsoKSAhPT0gbGFzdEl0ZW07XG4gICAgICB3aGlsZSAodGhpcy5wZWVrKCkgIT09IGxhc3RJdGVtKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlLm5leHQoe2l0ZW06IHRoaXMuX2VsZW1lbnRzLnBvcCgpIX0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVtb3ZlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3Agb2ZmIGFsbCBNZW51U3RhY2tJdGVtcyBhbmQgZW1pdCBlYWNoIG9uZSBvbiB0aGUgYGNsb3NlYCBvYnNlcnZhYmxlIG9uZSBieSBvbmUuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdGhhdCBjb25maWd1cmUgYmVoYXZpb3Igb24gY2xvc2UuXG4gICAqL1xuICBjbG9zZUFsbChvcHRpb25zPzogQ2xvc2VPcHRpb25zKSB7XG4gICAgY29uc3Qge2ZvY3VzTmV4dE9uRW1wdHksIGZvY3VzUGFyZW50VHJpZ2dlcn0gPSB7Li4ub3B0aW9uc307XG4gICAgaWYgKCF0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgd2hpbGUgKCF0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICBjb25zdCBtZW51U3RhY2tJdGVtID0gdGhpcy5fZWxlbWVudHMucG9wKCk7XG4gICAgICAgIGlmIChtZW51U3RhY2tJdGVtKSB7XG4gICAgICAgICAgdGhpcy5fY2xvc2UubmV4dCh7aXRlbTogbWVudVN0YWNrSXRlbSwgZm9jdXNQYXJlbnRUcmlnZ2VyfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2VtcHR5Lm5leHQoZm9jdXNOZXh0T25FbXB0eSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgc3RhY2sgaXMgZW1wdHkuICovXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuICF0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG4gIH1cblxuICAvKiogUmV0dXJuIHRoZSBsZW5ndGggb2YgdGhlIHN0YWNrLiAqL1xuICBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIHRvcCBtb3N0IGVsZW1lbnQgb24gdGhlIHN0YWNrLiAqL1xuICBwZWVrKCk6IE1lbnVTdGFja0l0ZW0gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50c1t0aGlzLl9lbGVtZW50cy5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IHN0YWNrIGlzIGFzc29jaWF0ZWQgd2l0aCBhbiBpbmxpbmUgbWVudS4gKi9cbiAgaGFzSW5saW5lTWVudSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5saW5lTWVudU9yaWVudGF0aW9uICE9IG51bGw7XG4gIH1cblxuICAvKiogVGhlIG9yaWVudGF0aW9uIG9mIHRoZSBhc3NvY2lhdGVkIGlubGluZSBtZW51LiAqL1xuICBpbmxpbmVNZW51T3JpZW50YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubGluZU1lbnVPcmllbnRhdGlvbjtcbiAgfVxuXG4gIC8qKiBTZXRzIHdoZXRoZXIgdGhlIG1lbnUgc3RhY2sgY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudC4gKi9cbiAgc2V0SGFzRm9jdXMoaGFzRm9jdXM6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9oYXNGb2N1cy5uZXh0KGhhc0ZvY3VzKTtcbiAgfVxufVxuIl19