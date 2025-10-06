/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, QueryList } from '@angular/core';
import { coerceObservable } from '@angular/cdk/coercion/private';
import { Subject, Subscription, isObservable, of as observableOf } from 'rxjs';
import { take } from 'rxjs/operators';
import { Typeahead } from './typeahead';
/**
 * This class manages keyboard events for trees. If you pass it a QueryList or other list of tree
 * items, it will set the active item, focus, handle expansion and typeahead correctly when
 * keyboard events occur.
 */
export class TreeKeyManager {
    _initializeFocus() {
        if (this._hasInitialFocused || this._items.length === 0) {
            return;
        }
        let activeIndex = 0;
        for (let i = 0; i < this._items.length; i++) {
            if (!this._skipPredicateFn(this._items[i]) && !this._isItemDisabled(this._items[i])) {
                activeIndex = i;
                break;
            }
        }
        const activeItem = this._items[activeIndex];
        // Use `makeFocusable` here, because we want the item to just be focusable, not actually
        // capture the focus since the user isn't interacting with it. See #29628.
        if (activeItem.makeFocusable) {
            this._activeItem?.unfocus();
            this._activeItemIndex = activeIndex;
            this._activeItem = activeItem;
            this._typeahead?.setCurrentSelectedItemIndex(activeIndex);
            activeItem.makeFocusable();
        }
        else {
            // Backwards compatibility for items that don't implement `makeFocusable`.
            this.focusItem(activeIndex);
        }
        this._hasInitialFocused = true;
    }
    /**
     *
     * @param items List of TreeKeyManager options. Can be synchronous or asynchronous.
     * @param config Optional configuration options. By default, use 'ltr' horizontal orientation. By
     * default, do not skip any nodes. By default, key manager only calls `focus` method when items
     * are focused and does not call `activate`. If `typeaheadDefaultInterval` is `true`, use a
     * default interval of 200ms.
     */
    constructor(items, config) {
        /** The index of the currently active (focused) item. */
        this._activeItemIndex = -1;
        /** The currently active (focused) item. */
        this._activeItem = null;
        /** Whether or not we activate the item when it's focused. */
        this._shouldActivationFollowFocus = false;
        /**
         * The orientation that the tree is laid out in. In `rtl` mode, the behavior of Left and
         * Right arrow are switched.
         */
        this._horizontalOrientation = 'ltr';
        /**
         * Predicate function that can be used to check whether an item should be skipped
         * by the key manager.
         *
         * The default value for this doesn't skip any elements in order to keep tree items focusable
         * when disabled. This aligns with ARIA guidelines:
         * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols.
         */
        this._skipPredicateFn = (_item) => false;
        /** Function to determine equivalent items. */
        this._trackByFn = (item) => item;
        /** Synchronous cache of the items to manage. */
        this._items = [];
        this._typeaheadSubscription = Subscription.EMPTY;
        this._hasInitialFocused = false;
        /** Stream that emits any time the focused item changes. */
        this.change = new Subject();
        // We allow for the items to be an array or Observable because, in some cases, the consumer may
        // not have access to a QueryList of the items they want to manage (e.g. when the
        // items aren't being collected via `ViewChildren` or `ContentChildren`).
        if (items instanceof QueryList) {
            this._items = items.toArray();
            items.changes.subscribe((newItems) => {
                this._items = newItems.toArray();
                this._typeahead?.setItems(this._items);
                this._updateActiveItemIndex(this._items);
                this._initializeFocus();
            });
        }
        else if (isObservable(items)) {
            items.subscribe(newItems => {
                this._items = newItems;
                this._typeahead?.setItems(newItems);
                this._updateActiveItemIndex(newItems);
                this._initializeFocus();
            });
        }
        else {
            this._items = items;
            this._initializeFocus();
        }
        if (typeof config.shouldActivationFollowFocus === 'boolean') {
            this._shouldActivationFollowFocus = config.shouldActivationFollowFocus;
        }
        if (config.horizontalOrientation) {
            this._horizontalOrientation = config.horizontalOrientation;
        }
        if (config.skipPredicate) {
            this._skipPredicateFn = config.skipPredicate;
        }
        if (config.trackBy) {
            this._trackByFn = config.trackBy;
        }
        if (typeof config.typeAheadDebounceInterval !== 'undefined') {
            this._setTypeAhead(config.typeAheadDebounceInterval);
        }
    }
    /** Cleans up the key manager. */
    destroy() {
        this._typeaheadSubscription.unsubscribe();
        this._typeahead?.destroy();
        this.change.complete();
    }
    /**
     * Handles a keyboard event on the tree.
     * @param event Keyboard event that represents the user interaction with the tree.
     */
    onKeydown(event) {
        const key = event.key;
        switch (key) {
            case 'Tab':
                // Return early here, in order to allow Tab to actually tab out of the tree
                return;
            case 'ArrowDown':
                this._focusNextItem();
                break;
            case 'ArrowUp':
                this._focusPreviousItem();
                break;
            case 'ArrowRight':
                this._horizontalOrientation === 'rtl'
                    ? this._collapseCurrentItem()
                    : this._expandCurrentItem();
                break;
            case 'ArrowLeft':
                this._horizontalOrientation === 'rtl'
                    ? this._expandCurrentItem()
                    : this._collapseCurrentItem();
                break;
            case 'Home':
                this._focusFirstItem();
                break;
            case 'End':
                this._focusLastItem();
                break;
            case 'Enter':
            case ' ':
                this._activateCurrentItem();
                break;
            default:
                if (event.key === '*') {
                    this._expandAllItemsAtCurrentItemLevel();
                    break;
                }
                this._typeahead?.handleKey(event);
                // Return here, in order to avoid preventing the default action of non-navigational
                // keys or resetting the buffer of pressed letters.
                return;
        }
        // Reset the typeahead since the user has used a navigational key.
        this._typeahead?.reset();
        event.preventDefault();
    }
    /** Index of the currently active item. */
    getActiveItemIndex() {
        return this._activeItemIndex;
    }
    /** The currently active item. */
    getActiveItem() {
        return this._activeItem;
    }
    /** Focus the first available item. */
    _focusFirstItem() {
        this.focusItem(this._findNextAvailableItemIndex(-1));
    }
    /** Focus the last available item. */
    _focusLastItem() {
        this.focusItem(this._findPreviousAvailableItemIndex(this._items.length));
    }
    /** Focus the next available item. */
    _focusNextItem() {
        this.focusItem(this._findNextAvailableItemIndex(this._activeItemIndex));
    }
    /** Focus the previous available item. */
    _focusPreviousItem() {
        this.focusItem(this._findPreviousAvailableItemIndex(this._activeItemIndex));
    }
    focusItem(itemOrIndex, options = {}) {
        // Set default options
        options.emitChangeEvent ??= true;
        let index = typeof itemOrIndex === 'number'
            ? itemOrIndex
            : this._items.findIndex(item => this._trackByFn(item) === this._trackByFn(itemOrIndex));
        if (index < 0 || index >= this._items.length) {
            return;
        }
        const activeItem = this._items[index];
        // If we're just setting the same item, don't re-call activate or focus
        if (this._activeItem !== null &&
            this._trackByFn(activeItem) === this._trackByFn(this._activeItem)) {
            return;
        }
        const previousActiveItem = this._activeItem;
        this._activeItem = activeItem ?? null;
        this._activeItemIndex = index;
        this._typeahead?.setCurrentSelectedItemIndex(index);
        this._activeItem?.focus();
        previousActiveItem?.unfocus();
        if (options.emitChangeEvent) {
            this.change.next(this._activeItem);
        }
        if (this._shouldActivationFollowFocus) {
            this._activateCurrentItem();
        }
    }
    _updateActiveItemIndex(newItems) {
        const activeItem = this._activeItem;
        if (!activeItem) {
            return;
        }
        const newIndex = newItems.findIndex(item => this._trackByFn(item) === this._trackByFn(activeItem));
        if (newIndex > -1 && newIndex !== this._activeItemIndex) {
            this._activeItemIndex = newIndex;
            this._typeahead?.setCurrentSelectedItemIndex(newIndex);
        }
    }
    _setTypeAhead(debounceInterval) {
        this._typeahead = new Typeahead(this._items, {
            debounceInterval: typeof debounceInterval === 'number' ? debounceInterval : undefined,
            skipPredicate: item => this._skipPredicateFn(item),
        });
        this._typeaheadSubscription = this._typeahead.selectedItem.subscribe(item => {
            this.focusItem(item);
        });
    }
    _findNextAvailableItemIndex(startingIndex) {
        for (let i = startingIndex + 1; i < this._items.length; i++) {
            if (!this._skipPredicateFn(this._items[i])) {
                return i;
            }
        }
        return startingIndex;
    }
    _findPreviousAvailableItemIndex(startingIndex) {
        for (let i = startingIndex - 1; i >= 0; i--) {
            if (!this._skipPredicateFn(this._items[i])) {
                return i;
            }
        }
        return startingIndex;
    }
    /**
     * If the item is already expanded, we collapse the item. Otherwise, we will focus the parent.
     */
    _collapseCurrentItem() {
        if (!this._activeItem) {
            return;
        }
        if (this._isCurrentItemExpanded()) {
            this._activeItem.collapse();
        }
        else {
            const parent = this._activeItem.getParent();
            if (!parent || this._skipPredicateFn(parent)) {
                return;
            }
            this.focusItem(parent);
        }
    }
    /**
     * If the item is already collapsed, we expand the item. Otherwise, we will focus the first child.
     */
    _expandCurrentItem() {
        if (!this._activeItem) {
            return;
        }
        if (!this._isCurrentItemExpanded()) {
            this._activeItem.expand();
        }
        else {
            coerceObservable(this._activeItem.getChildren())
                .pipe(take(1))
                .subscribe(children => {
                const firstChild = children.find(child => !this._skipPredicateFn(child));
                if (!firstChild) {
                    return;
                }
                this.focusItem(firstChild);
            });
        }
    }
    _isCurrentItemExpanded() {
        if (!this._activeItem) {
            return false;
        }
        return typeof this._activeItem.isExpanded === 'boolean'
            ? this._activeItem.isExpanded
            : this._activeItem.isExpanded();
    }
    _isItemDisabled(item) {
        return typeof item.isDisabled === 'boolean' ? item.isDisabled : item.isDisabled?.();
    }
    /** For all items that are the same level as the current item, we expand those items. */
    _expandAllItemsAtCurrentItemLevel() {
        if (!this._activeItem) {
            return;
        }
        const parent = this._activeItem.getParent();
        let itemsToExpand;
        if (!parent) {
            itemsToExpand = observableOf(this._items.filter(item => item.getParent() === null));
        }
        else {
            itemsToExpand = coerceObservable(parent.getChildren());
        }
        itemsToExpand.pipe(take(1)).subscribe(items => {
            for (const item of items) {
                item.expand();
            }
        });
    }
    _activateCurrentItem() {
        this._activeItem?.activate();
    }
}
/** @docs-private */
export function TREE_KEY_MANAGER_FACTORY() {
    return (items, options) => new TreeKeyManager(items, options);
}
/** Injection token that determines the key manager to use. */
export const TREE_KEY_MANAGER = new InjectionToken('tree-key-manager', {
    providedIn: 'root',
    factory: TREE_KEY_MANAGER_FACTORY,
});
/** @docs-private */
export const TREE_KEY_MANAGER_FACTORY_PROVIDER = {
    provide: TREE_KEY_MANAGER,
    useFactory: TREE_KEY_MANAGER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1rZXktbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9rZXktbWFuYWdlci90cmVlLWtleS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFBYSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxFQUFFLElBQUksWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQU9wQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXRDOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQWtDakIsZ0JBQWdCO1FBQ3RCLElBQUksSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hELE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDcEYsV0FBVyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsTUFBTTtZQUNS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QUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQzthQUFNLENBQUM7WUFDTixhQUFhLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sb0JBQW9CO1FBQzFCLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDL0IsQ0FBQztDQUNGO0FBRUQsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSx3QkFBd0I7SUFDdEMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksY0FBYyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQsOERBQThEO0FBQzlELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUE2QixrQkFBa0IsRUFBRTtJQUNqRyxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsd0JBQXdCO0NBQ2xDLENBQUMsQ0FBQztBQUVILG9CQUFvQjtBQUNwQixNQUFNLENBQUMsTUFBTSxpQ0FBaUMsR0FBRztJQUMvQyxPQUFPLEVBQUUsZ0JBQWdCO0lBQ3pCLFVBQVUsRUFBRSx3QkFBd0I7Q0FDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGlvblRva2VuLCBRdWVyeUxpc3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VPYnNlcnZhYmxlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24vcHJpdmF0ZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiwgaXNPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBUcmVlS2V5TWFuYWdlckZhY3RvcnksXG4gIFRyZWVLZXlNYW5hZ2VySXRlbSxcbiAgVHJlZUtleU1hbmFnZXJPcHRpb25zLFxuICBUcmVlS2V5TWFuYWdlclN0cmF0ZWd5LFxufSBmcm9tICcuL3RyZWUta2V5LW1hbmFnZXItc3RyYXRlZ3knO1xuaW1wb3J0IHtUeXBlYWhlYWR9IGZyb20gJy4vdHlwZWFoZWFkJztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIG1hbmFnZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0cmVlcy4gSWYgeW91IHBhc3MgaXQgYSBRdWVyeUxpc3Qgb3Igb3RoZXIgbGlzdCBvZiB0cmVlXG4gKiBpdGVtcywgaXQgd2lsbCBzZXQgdGhlIGFjdGl2ZSBpdGVtLCBmb2N1cywgaGFuZGxlIGV4cGFuc2lvbiBhbmQgdHlwZWFoZWFkIGNvcnJlY3RseSB3aGVuXG4gKiBrZXlib2FyZCBldmVudHMgb2NjdXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmVlS2V5TWFuYWdlcjxUIGV4dGVuZHMgVHJlZUtleU1hbmFnZXJJdGVtPiBpbXBsZW1lbnRzIFRyZWVLZXlNYW5hZ2VyU3RyYXRlZ3k8VD4ge1xuICAvKiogVGhlIGluZGV4IG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIChmb2N1c2VkKSBpdGVtLiAqL1xuICBwcml2YXRlIF9hY3RpdmVJdGVtSW5kZXggPSAtMTtcbiAgLyoqIFRoZSBjdXJyZW50bHkgYWN0aXZlIChmb2N1c2VkKSBpdGVtLiAqL1xuICBwcml2YXRlIF9hY3RpdmVJdGVtOiBUIHwgbnVsbCA9IG51bGw7XG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB3ZSBhY3RpdmF0ZSB0aGUgaXRlbSB3aGVuIGl0J3MgZm9jdXNlZC4gKi9cbiAgcHJpdmF0ZSBfc2hvdWxkQWN0aXZhdGlvbkZvbGxvd0ZvY3VzID0gZmFsc2U7XG4gIC8qKlxuICAgKiBUaGUgb3JpZW50YXRpb24gdGhhdCB0aGUgdHJlZSBpcyBsYWlkIG91dCBpbi4gSW4gYHJ0bGAgbW9kZSwgdGhlIGJlaGF2aW9yIG9mIExlZnQgYW5kXG4gICAqIFJpZ2h0IGFycm93IGFyZSBzd2l0Y2hlZC5cbiAgICovXG4gIHByaXZhdGUgX2hvcml6b250YWxPcmllbnRhdGlvbjogJ2x0cicgfCAncnRsJyA9ICdsdHInO1xuXG4gIC8qKlxuICAgKiBQcmVkaWNhdGUgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBjaGVjayB3aGV0aGVyIGFuIGl0ZW0gc2hvdWxkIGJlIHNraXBwZWRcbiAgICogYnkgdGhlIGtleSBtYW5hZ2VyLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBkb2Vzbid0IHNraXAgYW55IGVsZW1lbnRzIGluIG9yZGVyIHRvIGtlZXAgdHJlZSBpdGVtcyBmb2N1c2FibGVcbiAgICogd2hlbiBkaXNhYmxlZC4gVGhpcyBhbGlnbnMgd2l0aCBBUklBIGd1aWRlbGluZXM6XG4gICAqIGh0dHBzOi8vd3d3LnczLm9yZy9XQUkvQVJJQS9hcGcvcHJhY3RpY2VzL2tleWJvYXJkLWludGVyZmFjZS8jZm9jdXNhYmlsaXR5b2ZkaXNhYmxlZGNvbnRyb2xzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2tpcFByZWRpY2F0ZUZuID0gKF9pdGVtOiBUKSA9PiBmYWxzZTtcblxuICAvKiogRnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnQgaXRlbXMuICovXG4gIHByaXZhdGUgX3RyYWNrQnlGbjogKGl0ZW06IFQpID0+IHVua25vd24gPSAoaXRlbTogVCkgPT4gaXRlbTtcblxuICAvKiogU3luY2hyb25vdXMgY2FjaGUgb2YgdGhlIGl0ZW1zIHRvIG1hbmFnZS4gKi9cbiAgcHJpdmF0ZSBfaXRlbXM6IFRbXSA9IFtdO1xuXG4gIHByaXZhdGUgX3R5cGVhaGVhZD86IFR5cGVhaGVhZDxUPjtcbiAgcHJpdmF0ZSBfdHlwZWFoZWFkU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIHByaXZhdGUgX2hhc0luaXRpYWxGb2N1c2VkID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZUZvY3VzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9oYXNJbml0aWFsRm9jdXNlZCB8fCB0aGlzLl9pdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYWN0aXZlSW5kZXggPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghdGhpcy5fc2tpcFByZWRpY2F0ZUZuKHRoaXMuX2l0ZW1zW2ldKSAmJiAhdGhpcy5faXNJdGVtRGlzYWJsZWQodGhpcy5faXRlbXNbaV0pKSB7XG4gICAgICAgIGFjdGl2ZUluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuX2l0ZW1zW2FjdGl2ZUluZGV4XTtcblxuICAgIC8vIFVzZSBgbWFrZUZvY3VzYWJsZWAgaGVyZSwgYmVjYXVzZSB3ZSB3YW50IHRoZSBpdGVtIHRvIGp1c3QgYmUgZm9jdXNhYmxlLCBub3QgYWN0dWFsbHlcbiAgICAvLyBjYXB0dXJlIHRoZSBmb2N1cyBzaW5jZSB0aGUgdXNlciBpc24ndCBpbnRlcmFjdGluZyB3aXRoIGl0LiBTZWUgIzI5NjI4LlxuICAgIGlmIChhY3RpdmVJdGVtLm1ha2VGb2N1c2FibGUpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZUl0ZW0/LnVuZm9jdXMoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCA9IGFjdGl2ZUluZGV4O1xuICAgICAgdGhpcy5fYWN0aXZlSXRlbSA9IGFjdGl2ZUl0ZW07XG4gICAgICB0aGlzLl90eXBlYWhlYWQ/LnNldEN1cnJlbnRTZWxlY3RlZEl0ZW1JbmRleChhY3RpdmVJbmRleCk7XG4gICAgICBhY3RpdmVJdGVtLm1ha2VGb2N1c2FibGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHkgZm9yIGl0ZW1zIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGBtYWtlRm9jdXNhYmxlYC5cbiAgICAgIHRoaXMuZm9jdXNJdGVtKGFjdGl2ZUluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLl9oYXNJbml0aWFsRm9jdXNlZCA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIGl0ZW1zIExpc3Qgb2YgVHJlZUtleU1hbmFnZXIgb3B0aW9ucy4gQ2FuIGJlIHN5bmNocm9ub3VzIG9yIGFzeW5jaHJvbm91cy5cbiAgICogQHBhcmFtIGNvbmZpZyBPcHRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMuIEJ5IGRlZmF1bHQsIHVzZSAnbHRyJyBob3Jpem9udGFsIG9yaWVudGF0aW9uLiBCeVxuICAgKiBkZWZhdWx0LCBkbyBub3Qgc2tpcCBhbnkgbm9kZXMuIEJ5IGRlZmF1bHQsIGtleSBtYW5hZ2VyIG9ubHkgY2FsbHMgYGZvY3VzYCBtZXRob2Qgd2hlbiBpdGVtc1xuICAgKiBhcmUgZm9jdXNlZCBhbmQgZG9lcyBub3QgY2FsbCBgYWN0aXZhdGVgLiBJZiBgdHlwZWFoZWFkRGVmYXVsdEludGVydmFsYCBpcyBgdHJ1ZWAsIHVzZSBhXG4gICAqIGRlZmF1bHQgaW50ZXJ2YWwgb2YgMjAwbXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpdGVtczogT2JzZXJ2YWJsZTxUW10+IHwgUXVlcnlMaXN0PFQ+IHwgVFtdLCBjb25maWc6IFRyZWVLZXlNYW5hZ2VyT3B0aW9uczxUPikge1xuICAgIC8vIFdlIGFsbG93IGZvciB0aGUgaXRlbXMgdG8gYmUgYW4gYXJyYXkgb3IgT2JzZXJ2YWJsZSBiZWNhdXNlLCBpbiBzb21lIGNhc2VzLCB0aGUgY29uc3VtZXIgbWF5XG4gICAgLy8gbm90IGhhdmUgYWNjZXNzIHRvIGEgUXVlcnlMaXN0IG9mIHRoZSBpdGVtcyB0aGV5IHdhbnQgdG8gbWFuYWdlIChlLmcuIHdoZW4gdGhlXG4gICAgLy8gaXRlbXMgYXJlbid0IGJlaW5nIGNvbGxlY3RlZCB2aWEgYFZpZXdDaGlsZHJlbmAgb3IgYENvbnRlbnRDaGlsZHJlbmApLlxuICAgIGlmIChpdGVtcyBpbnN0YW5jZW9mIFF1ZXJ5TGlzdCkge1xuICAgICAgdGhpcy5faXRlbXMgPSBpdGVtcy50b0FycmF5KCk7XG4gICAgICBpdGVtcy5jaGFuZ2VzLnN1YnNjcmliZSgobmV3SXRlbXM6IFF1ZXJ5TGlzdDxUPikgPT4ge1xuICAgICAgICB0aGlzLl9pdGVtcyA9IG5ld0l0ZW1zLnRvQXJyYXkoKTtcbiAgICAgICAgdGhpcy5fdHlwZWFoZWFkPy5zZXRJdGVtcyh0aGlzLl9pdGVtcyk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZUl0ZW1JbmRleCh0aGlzLl9pdGVtcyk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVGb2N1cygpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGUoaXRlbXMpKSB7XG4gICAgICBpdGVtcy5zdWJzY3JpYmUobmV3SXRlbXMgPT4ge1xuICAgICAgICB0aGlzLl9pdGVtcyA9IG5ld0l0ZW1zO1xuICAgICAgICB0aGlzLl90eXBlYWhlYWQ/LnNldEl0ZW1zKG5ld0l0ZW1zKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlQWN0aXZlSXRlbUluZGV4KG5ld0l0ZW1zKTtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZUZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faXRlbXMgPSBpdGVtcztcbiAgICAgIHRoaXMuX2luaXRpYWxpemVGb2N1cygpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29uZmlnLnNob3VsZEFjdGl2YXRpb25Gb2xsb3dGb2N1cyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aGlzLl9zaG91bGRBY3RpdmF0aW9uRm9sbG93Rm9jdXMgPSBjb25maWcuc2hvdWxkQWN0aXZhdGlvbkZvbGxvd0ZvY3VzO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmhvcml6b250YWxPcmllbnRhdGlvbikge1xuICAgICAgdGhpcy5faG9yaXpvbnRhbE9yaWVudGF0aW9uID0gY29uZmlnLmhvcml6b250YWxPcmllbnRhdGlvbjtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5za2lwUHJlZGljYXRlKSB7XG4gICAgICB0aGlzLl9za2lwUHJlZGljYXRlRm4gPSBjb25maWcuc2tpcFByZWRpY2F0ZTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy50cmFja0J5KSB7XG4gICAgICB0aGlzLl90cmFja0J5Rm4gPSBjb25maWcudHJhY2tCeTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcudHlwZUFoZWFkRGVib3VuY2VJbnRlcnZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX3NldFR5cGVBaGVhZChjb25maWcudHlwZUFoZWFkRGVib3VuY2VJbnRlcnZhbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIGFueSB0aW1lIHRoZSBmb2N1c2VkIGl0ZW0gY2hhbmdlcy4gKi9cbiAgcmVhZG9ubHkgY2hhbmdlID0gbmV3IFN1YmplY3Q8VCB8IG51bGw+KCk7XG5cbiAgLyoqIENsZWFucyB1cCB0aGUga2V5IG1hbmFnZXIuICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fdHlwZWFoZWFkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdHlwZWFoZWFkPy5kZXN0cm95KCk7XG4gICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEga2V5Ym9hcmQgZXZlbnQgb24gdGhlIHRyZWUuXG4gICAqIEBwYXJhbSBldmVudCBLZXlib2FyZCBldmVudCB0aGF0IHJlcHJlc2VudHMgdGhlIHVzZXIgaW50ZXJhY3Rpb24gd2l0aCB0aGUgdHJlZS5cbiAgICovXG4gIG9uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGtleSA9IGV2ZW50LmtleTtcblxuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICBjYXNlICdUYWInOlxuICAgICAgICAvLyBSZXR1cm4gZWFybHkgaGVyZSwgaW4gb3JkZXIgdG8gYWxsb3cgVGFiIHRvIGFjdHVhbGx5IHRhYiBvdXQgb2YgdGhlIHRyZWVcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICB0aGlzLl9mb2N1c05leHRJdGVtKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgdGhpcy5fZm9jdXNQcmV2aW91c0l0ZW0oKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICB0aGlzLl9ob3Jpem9udGFsT3JpZW50YXRpb24gPT09ICdydGwnXG4gICAgICAgICAgPyB0aGlzLl9jb2xsYXBzZUN1cnJlbnRJdGVtKClcbiAgICAgICAgICA6IHRoaXMuX2V4cGFuZEN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICB0aGlzLl9ob3Jpem9udGFsT3JpZW50YXRpb24gPT09ICdydGwnXG4gICAgICAgICAgPyB0aGlzLl9leHBhbmRDdXJyZW50SXRlbSgpXG4gICAgICAgICAgOiB0aGlzLl9jb2xsYXBzZUN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdIb21lJzpcbiAgICAgICAgdGhpcy5fZm9jdXNGaXJzdEl0ZW0oKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ0VuZCc6XG4gICAgICAgIHRoaXMuX2ZvY3VzTGFzdEl0ZW0oKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgIGNhc2UgJyAnOlxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnKicpIHtcbiAgICAgICAgICB0aGlzLl9leHBhbmRBbGxJdGVtc0F0Q3VycmVudEl0ZW1MZXZlbCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdHlwZWFoZWFkPy5oYW5kbGVLZXkoZXZlbnQpO1xuICAgICAgICAvLyBSZXR1cm4gaGVyZSwgaW4gb3JkZXIgdG8gYXZvaWQgcHJldmVudGluZyB0aGUgZGVmYXVsdCBhY3Rpb24gb2Ygbm9uLW5hdmlnYXRpb25hbFxuICAgICAgICAvLyBrZXlzIG9yIHJlc2V0dGluZyB0aGUgYnVmZmVyIG9mIHByZXNzZWQgbGV0dGVycy5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IHRoZSB0eXBlYWhlYWQgc2luY2UgdGhlIHVzZXIgaGFzIHVzZWQgYSBuYXZpZ2F0aW9uYWwga2V5LlxuICAgIHRoaXMuX3R5cGVhaGVhZD8ucmVzZXQoKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgLyoqIEluZGV4IG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIGl0ZW0uICovXG4gIGdldEFjdGl2ZUl0ZW1JbmRleCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlSXRlbUluZGV4O1xuICB9XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGl0ZW0uICovXG4gIGdldEFjdGl2ZUl0ZW0oKTogVCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVJdGVtO1xuICB9XG5cbiAgLyoqIEZvY3VzIHRoZSBmaXJzdCBhdmFpbGFibGUgaXRlbS4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNGaXJzdEl0ZW0oKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c0l0ZW0odGhpcy5fZmluZE5leHRBdmFpbGFibGVJdGVtSW5kZXgoLTEpKTtcbiAgfVxuXG4gIC8qKiBGb2N1cyB0aGUgbGFzdCBhdmFpbGFibGUgaXRlbS4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNMYXN0SXRlbSgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzSXRlbSh0aGlzLl9maW5kUHJldmlvdXNBdmFpbGFibGVJdGVtSW5kZXgodGhpcy5faXRlbXMubGVuZ3RoKSk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIG5leHQgYXZhaWxhYmxlIGl0ZW0uICovXG4gIHByaXZhdGUgX2ZvY3VzTmV4dEl0ZW0oKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c0l0ZW0odGhpcy5fZmluZE5leHRBdmFpbGFibGVJdGVtSW5kZXgodGhpcy5fYWN0aXZlSXRlbUluZGV4KSk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIHByZXZpb3VzIGF2YWlsYWJsZSBpdGVtLiAqL1xuICBwcml2YXRlIF9mb2N1c1ByZXZpb3VzSXRlbSgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzSXRlbSh0aGlzLl9maW5kUHJldmlvdXNBdmFpbGFibGVJdGVtSW5kZXgodGhpcy5fYWN0aXZlSXRlbUluZGV4KSk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXMgdGhlIHByb3ZpZGVkIGl0ZW0gYnkgaW5kZXguXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gZm9jdXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIEFkZGl0aW9uYWwgZm9jdXNpbmcgb3B0aW9ucy5cbiAgICovXG4gIGZvY3VzSXRlbShpbmRleDogbnVtYmVyLCBvcHRpb25zPzoge2VtaXRDaGFuZ2VFdmVudD86IGJvb2xlYW59KTogdm9pZDtcbiAgZm9jdXNJdGVtKGl0ZW06IFQsIG9wdGlvbnM/OiB7ZW1pdENoYW5nZUV2ZW50PzogYm9vbGVhbn0pOiB2b2lkO1xuICBmb2N1c0l0ZW0oaXRlbU9ySW5kZXg6IG51bWJlciB8IFQsIG9wdGlvbnM/OiB7ZW1pdENoYW5nZUV2ZW50PzogYm9vbGVhbn0pOiB2b2lkO1xuICBmb2N1c0l0ZW0oaXRlbU9ySW5kZXg6IG51bWJlciB8IFQsIG9wdGlvbnM6IHtlbWl0Q2hhbmdlRXZlbnQ/OiBib29sZWFufSA9IHt9KSB7XG4gICAgLy8gU2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIG9wdGlvbnMuZW1pdENoYW5nZUV2ZW50ID8/PSB0cnVlO1xuXG4gICAgbGV0IGluZGV4ID1cbiAgICAgIHR5cGVvZiBpdGVtT3JJbmRleCA9PT0gJ251bWJlcidcbiAgICAgICAgPyBpdGVtT3JJbmRleFxuICAgICAgICA6IHRoaXMuX2l0ZW1zLmZpbmRJbmRleChpdGVtID0+IHRoaXMuX3RyYWNrQnlGbihpdGVtKSA9PT0gdGhpcy5fdHJhY2tCeUZuKGl0ZW1PckluZGV4KSk7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLl9pdGVtcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuX2l0ZW1zW2luZGV4XTtcblxuICAgIC8vIElmIHdlJ3JlIGp1c3Qgc2V0dGluZyB0aGUgc2FtZSBpdGVtLCBkb24ndCByZS1jYWxsIGFjdGl2YXRlIG9yIGZvY3VzXG4gICAgaWYgKFxuICAgICAgdGhpcy5fYWN0aXZlSXRlbSAhPT0gbnVsbCAmJlxuICAgICAgdGhpcy5fdHJhY2tCeUZuKGFjdGl2ZUl0ZW0pID09PSB0aGlzLl90cmFja0J5Rm4odGhpcy5fYWN0aXZlSXRlbSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c0FjdGl2ZUl0ZW0gPSB0aGlzLl9hY3RpdmVJdGVtO1xuICAgIHRoaXMuX2FjdGl2ZUl0ZW0gPSBhY3RpdmVJdGVtID8/IG51bGw7XG4gICAgdGhpcy5fYWN0aXZlSXRlbUluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fdHlwZWFoZWFkPy5zZXRDdXJyZW50U2VsZWN0ZWRJdGVtSW5kZXgoaW5kZXgpO1xuXG4gICAgdGhpcy5fYWN0aXZlSXRlbT8uZm9jdXMoKTtcbiAgICBwcmV2aW91c0FjdGl2ZUl0ZW0/LnVuZm9jdXMoKTtcblxuICAgIGlmIChvcHRpb25zLmVtaXRDaGFuZ2VFdmVudCkge1xuICAgICAgdGhpcy5jaGFuZ2UubmV4dCh0aGlzLl9hY3RpdmVJdGVtKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2hvdWxkQWN0aXZhdGlvbkZvbGxvd0ZvY3VzKSB7XG4gICAgICB0aGlzLl9hY3RpdmF0ZUN1cnJlbnRJdGVtKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlQWN0aXZlSXRlbUluZGV4KG5ld0l0ZW1zOiBUW10pIHtcbiAgICBjb25zdCBhY3RpdmVJdGVtID0gdGhpcy5fYWN0aXZlSXRlbTtcbiAgICBpZiAoIWFjdGl2ZUl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdJbmRleCA9IG5ld0l0ZW1zLmZpbmRJbmRleChcbiAgICAgIGl0ZW0gPT4gdGhpcy5fdHJhY2tCeUZuKGl0ZW0pID09PSB0aGlzLl90cmFja0J5Rm4oYWN0aXZlSXRlbSksXG4gICAgKTtcblxuICAgIGlmIChuZXdJbmRleCA+IC0xICYmIG5ld0luZGV4ICE9PSB0aGlzLl9hY3RpdmVJdGVtSW5kZXgpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCA9IG5ld0luZGV4O1xuICAgICAgdGhpcy5fdHlwZWFoZWFkPy5zZXRDdXJyZW50U2VsZWN0ZWRJdGVtSW5kZXgobmV3SW5kZXgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFR5cGVBaGVhZChkZWJvdW5jZUludGVydmFsOiBudW1iZXIgfCBib29sZWFuKSB7XG4gICAgdGhpcy5fdHlwZWFoZWFkID0gbmV3IFR5cGVhaGVhZCh0aGlzLl9pdGVtcywge1xuICAgICAgZGVib3VuY2VJbnRlcnZhbDogdHlwZW9mIGRlYm91bmNlSW50ZXJ2YWwgPT09ICdudW1iZXInID8gZGVib3VuY2VJbnRlcnZhbCA6IHVuZGVmaW5lZCxcbiAgICAgIHNraXBQcmVkaWNhdGU6IGl0ZW0gPT4gdGhpcy5fc2tpcFByZWRpY2F0ZUZuKGl0ZW0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fdHlwZWFoZWFkU3Vic2NyaXB0aW9uID0gdGhpcy5fdHlwZWFoZWFkLnNlbGVjdGVkSXRlbS5zdWJzY3JpYmUoaXRlbSA9PiB7XG4gICAgICB0aGlzLmZvY3VzSXRlbShpdGVtKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmROZXh0QXZhaWxhYmxlSXRlbUluZGV4KHN0YXJ0aW5nSW5kZXg6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSBzdGFydGluZ0luZGV4ICsgMTsgaSA8IHRoaXMuX2l0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXRoaXMuX3NraXBQcmVkaWNhdGVGbih0aGlzLl9pdGVtc1tpXSkpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdGFydGluZ0luZGV4O1xuICB9XG5cbiAgcHJpdmF0ZSBfZmluZFByZXZpb3VzQXZhaWxhYmxlSXRlbUluZGV4KHN0YXJ0aW5nSW5kZXg6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSBzdGFydGluZ0luZGV4IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmICghdGhpcy5fc2tpcFByZWRpY2F0ZUZuKHRoaXMuX2l0ZW1zW2ldKSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0YXJ0aW5nSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGl0ZW0gaXMgYWxyZWFkeSBleHBhbmRlZCwgd2UgY29sbGFwc2UgdGhlIGl0ZW0uIE90aGVyd2lzZSwgd2Ugd2lsbCBmb2N1cyB0aGUgcGFyZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfY29sbGFwc2VDdXJyZW50SXRlbSgpIHtcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZUl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faXNDdXJyZW50SXRlbUV4cGFuZGVkKCkpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZUl0ZW0uY29sbGFwc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fYWN0aXZlSXRlbS5nZXRQYXJlbnQoKTtcbiAgICAgIGlmICghcGFyZW50IHx8IHRoaXMuX3NraXBQcmVkaWNhdGVGbihwYXJlbnQgYXMgVCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5mb2N1c0l0ZW0ocGFyZW50IGFzIFQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgaXRlbSBpcyBhbHJlYWR5IGNvbGxhcHNlZCwgd2UgZXhwYW5kIHRoZSBpdGVtLiBPdGhlcndpc2UsIHdlIHdpbGwgZm9jdXMgdGhlIGZpcnN0IGNoaWxkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXhwYW5kQ3VycmVudEl0ZW0oKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmVJdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9pc0N1cnJlbnRJdGVtRXhwYW5kZWQoKSkge1xuICAgICAgdGhpcy5fYWN0aXZlSXRlbS5leHBhbmQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29lcmNlT2JzZXJ2YWJsZSh0aGlzLl9hY3RpdmVJdGVtLmdldENoaWxkcmVuKCkpXG4gICAgICAgIC5waXBlKHRha2UoMSkpXG4gICAgICAgIC5zdWJzY3JpYmUoY2hpbGRyZW4gPT4ge1xuICAgICAgICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSBjaGlsZHJlbi5maW5kKGNoaWxkID0+ICF0aGlzLl9za2lwUHJlZGljYXRlRm4oY2hpbGQgYXMgVCkpO1xuICAgICAgICAgIGlmICghZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmZvY3VzSXRlbShmaXJzdENoaWxkIGFzIFQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pc0N1cnJlbnRJdGVtRXhwYW5kZWQoKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmVJdGVtKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgdGhpcy5fYWN0aXZlSXRlbS5pc0V4cGFuZGVkID09PSAnYm9vbGVhbidcbiAgICAgID8gdGhpcy5fYWN0aXZlSXRlbS5pc0V4cGFuZGVkXG4gICAgICA6IHRoaXMuX2FjdGl2ZUl0ZW0uaXNFeHBhbmRlZCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNJdGVtRGlzYWJsZWQoaXRlbTogVHJlZUtleU1hbmFnZXJJdGVtKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpdGVtLmlzRGlzYWJsZWQgPT09ICdib29sZWFuJyA/IGl0ZW0uaXNEaXNhYmxlZCA6IGl0ZW0uaXNEaXNhYmxlZD8uKCk7XG4gIH1cblxuICAvKiogRm9yIGFsbCBpdGVtcyB0aGF0IGFyZSB0aGUgc2FtZSBsZXZlbCBhcyB0aGUgY3VycmVudCBpdGVtLCB3ZSBleHBhbmQgdGhvc2UgaXRlbXMuICovXG4gIHByaXZhdGUgX2V4cGFuZEFsbEl0ZW1zQXRDdXJyZW50SXRlbUxldmVsKCkge1xuICAgIGlmICghdGhpcy5fYWN0aXZlSXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2FjdGl2ZUl0ZW0uZ2V0UGFyZW50KCk7XG4gICAgbGV0IGl0ZW1zVG9FeHBhbmQ7XG4gICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgIGl0ZW1zVG9FeHBhbmQgPSBvYnNlcnZhYmxlT2YodGhpcy5faXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5nZXRQYXJlbnQoKSA9PT0gbnVsbCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVtc1RvRXhwYW5kID0gY29lcmNlT2JzZXJ2YWJsZShwYXJlbnQuZ2V0Q2hpbGRyZW4oKSk7XG4gICAgfVxuXG4gICAgaXRlbXNUb0V4cGFuZC5waXBlKHRha2UoMSkpLnN1YnNjcmliZShpdGVtcyA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICAgICAgaXRlbS5leHBhbmQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FjdGl2YXRlQ3VycmVudEl0ZW0oKSB7XG4gICAgdGhpcy5fYWN0aXZlSXRlbT8uYWN0aXZhdGUoKTtcbiAgfVxufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRSRUVfS0VZX01BTkFHRVJfRkFDVE9SWTxUIGV4dGVuZHMgVHJlZUtleU1hbmFnZXJJdGVtPigpOiBUcmVlS2V5TWFuYWdlckZhY3Rvcnk8VD4ge1xuICByZXR1cm4gKGl0ZW1zLCBvcHRpb25zKSA9PiBuZXcgVHJlZUtleU1hbmFnZXIoaXRlbXMsIG9wdGlvbnMpO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgZGV0ZXJtaW5lcyB0aGUga2V5IG1hbmFnZXIgdG8gdXNlLiAqL1xuZXhwb3J0IGNvbnN0IFRSRUVfS0VZX01BTkFHRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48VHJlZUtleU1hbmFnZXJGYWN0b3J5PGFueT4+KCd0cmVlLWtleS1tYW5hZ2VyJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6IFRSRUVfS0VZX01BTkFHRVJfRkFDVE9SWSxcbn0pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IFRSRUVfS0VZX01BTkFHRVJfRkFDVE9SWV9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogVFJFRV9LRVlfTUFOQUdFUixcbiAgdXNlRmFjdG9yeTogVFJFRV9LRVlfTUFOQUdFUl9GQUNUT1JZLFxufTtcbiJdfQ==