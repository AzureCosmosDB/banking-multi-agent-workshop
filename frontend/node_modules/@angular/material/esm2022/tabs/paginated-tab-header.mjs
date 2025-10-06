/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ENTER, SPACE, hasModifierKey } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ANIMATION_MODULE_TYPE, ChangeDetectorRef, Directive, ElementRef, EventEmitter, Inject, Injector, Input, NgZone, Optional, Output, afterNextRender, booleanAttribute, inject, numberAttribute, } from '@angular/core';
import { EMPTY, Observable, Subject, fromEvent, merge, of as observableOf, timer, } from 'rxjs';
import { debounceTime, filter, skip, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "@angular/cdk/platform";
/** Config used to bind passive event listeners */
const passiveEventListenerOptions = normalizePassiveListenerOptions({
    passive: true,
});
/**
 * Amount of milliseconds to wait before starting to scroll the header automatically.
 * Set a little conservatively in order to handle fake events dispatched on touch devices.
 */
const HEADER_SCROLL_DELAY = 650;
/**
 * Interval in milliseconds at which to scroll the header
 * while the user is holding their pointer.
 */
const HEADER_SCROLL_INTERVAL = 100;
/**
 * Base class for a tab header that supported pagination.
 * @docs-private
 */
export class MatPaginatedTabHeader {
    /** The index of the active tab. */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(v) {
        const value = isNaN(v) ? 0 : v;
        if (this._selectedIndex != value) {
            this._selectedIndexChanged = true;
            this._selectedIndex = value;
            if (this._keyManager) {
                this._keyManager.updateActiveItem(value);
            }
        }
    }
    constructor(_elementRef, _changeDetectorRef, _viewportRuler, _dir, _ngZone, _platform, _animationMode) {
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._viewportRuler = _viewportRuler;
        this._dir = _dir;
        this._ngZone = _ngZone;
        this._platform = _platform;
        this._animationMode = _animationMode;
        /** The distance in pixels that the tab labels should be translated to the left. */
        this._scrollDistance = 0;
        /** Whether the header should scroll to the selected index after the view has been checked. */
        this._selectedIndexChanged = false;
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /** Whether the controls for pagination should be displayed */
        this._showPaginationControls = false;
        /** Whether the tab list can be scrolled more towards the end of the tab label list. */
        this._disableScrollAfter = true;
        /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
        this._disableScrollBefore = true;
        /** Stream that will stop the automated scrolling. */
        this._stopScrolling = new Subject();
        /**
         * Whether pagination should be disabled. This can be used to avoid unnecessary
         * layout recalculations if it's known that pagination won't be required.
         */
        this.disablePagination = false;
        this._selectedIndex = 0;
        /** Event emitted when the option is selected. */
        this.selectFocusedIndex = new EventEmitter();
        /** Event emitted when a label is focused. */
        this.indexFocused = new EventEmitter();
        this._sharedResizeObserver = inject(SharedResizeObserver);
        this._injector = inject(Injector);
        // Bind the `mouseleave` event on the outside since it doesn't change anything in the view.
        _ngZone.runOutsideAngular(() => {
            fromEvent(_elementRef.nativeElement, 'mouseleave')
                .pipe(takeUntil(this._destroyed))
                .subscribe(() => {
                this._stopInterval();
            });
        });
    }
    ngAfterViewInit() {
        // We need to handle these events manually, because we want to bind passive event listeners.
        fromEvent(this._previousPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
            this._handlePaginatorPress('before');
        });
        fromEvent(this._nextPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
            this._handlePaginatorPress('after');
        });
    }
    ngAfterContentInit() {
        const dirChange = this._dir ? this._dir.change : observableOf('ltr');
        // We need to debounce resize events because the alignment logic is expensive.
        // If someone animates the width of tabs, we don't want to realign on every animation frame.
        // Once we haven't seen any more resize events in the last 32ms (~2 animaion frames) we can
        // re-align.
        const resize = this._sharedResizeObserver
            .observe(this._elementRef.nativeElement)
            .pipe(debounceTime(32), takeUntil(this._destroyed));
        // Note: We do not actually need to watch these events for proper functioning of the tabs,
        // the resize events above should capture any viewport resize that we care about. However,
        // removing this is fairly breaking for screenshot tests, so we're leaving it here for now.
        const viewportResize = this._viewportRuler.change(150).pipe(takeUntil(this._destroyed));
        const realign = () => {
            this.updatePagination();
            this._alignInkBarToSelectedTab();
        };
        this._keyManager = new FocusKeyManager(this._items)
            .withHorizontalOrientation(this._getLayoutDirection())
            .withHomeAndEnd()
            .withWrap()
            // Allow focus to land on disabled tabs, as per https://w3c.github.io/aria-practices/#kbd_disabled_controls
            .skipPredicate(() => false);
        this._keyManager.updateActiveItem(this._selectedIndex);
        // Note: We do not need to realign after the first render for proper functioning of the tabs
        // the resize events above should fire when we first start observing the element. However,
        // removing this is fairly breaking for screenshot tests, so we're leaving it here for now.
        afterNextRender(realign, { injector: this._injector });
        // On dir change or resize, realign the ink bar and update the orientation of
        // the key manager if the direction has changed.
        merge(dirChange, viewportResize, resize, this._items.changes, this._itemsResized())
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
            // We need to defer this to give the browser some time to recalculate
            // the element dimensions. The call has to be wrapped in `NgZone.run`,
            // because the viewport change handler runs outside of Angular.
            this._ngZone.run(() => {
                Promise.resolve().then(() => {
                    // Clamp the scroll distance, because it can change with the number of tabs.
                    this._scrollDistance = Math.max(0, Math.min(this._getMaxScrollDistance(), this._scrollDistance));
                    realign();
                });
            });
            this._keyManager.withHorizontalOrientation(this._getLayoutDirection());
        });
        // If there is a change in the focus key manager we need to emit the `indexFocused`
        // event in order to provide a public event that notifies about focus changes. Also we realign
        // the tabs container by scrolling the new focused tab into the visible section.
        this._keyManager.change.subscribe(newFocusIndex => {
            this.indexFocused.emit(newFocusIndex);
            this._setTabFocus(newFocusIndex);
        });
    }
    /** Sends any changes that could affect the layout of the items. */
    _itemsResized() {
        if (typeof ResizeObserver !== 'function') {
            return EMPTY;
        }
        return this._items.changes.pipe(startWith(this._items), switchMap((tabItems) => new Observable((observer) => this._ngZone.runOutsideAngular(() => {
            const resizeObserver = new ResizeObserver(entries => observer.next(entries));
            tabItems.forEach(item => resizeObserver.observe(item.elementRef.nativeElement));
            return () => {
                resizeObserver.disconnect();
            };
        }))), 
        // Skip the first emit since the resize observer emits when an item
        // is observed for new items when the tab is already inserted
        skip(1), 
        // Skip emissions where all the elements are invisible since we don't want
        // the header to try and re-render with invalid measurements. See #25574.
        filter(entries => entries.some(e => e.contentRect.width > 0 && e.contentRect.height > 0)));
    }
    ngAfterContentChecked() {
        // If the number of tab labels have changed, check if scrolling should be enabled
        if (this._tabLabelCount != this._items.length) {
            this.updatePagination();
            this._tabLabelCount = this._items.length;
            this._changeDetectorRef.markForCheck();
        }
        // If the selected index has changed, scroll to the label and check if the scrolling controls
        // should be disabled.
        if (this._selectedIndexChanged) {
            this._scrollToLabel(this._selectedIndex);
            this._checkScrollingControls();
            this._alignInkBarToSelectedTab();
            this._selectedIndexChanged = false;
            this._changeDetectorRef.markForCheck();
        }
        // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
        // then translate the header to reflect this.
        if (this._scrollDistanceChanged) {
            this._updateTabScrollPosition();
            this._scrollDistanceChanged = false;
            this._changeDetectorRef.markForCheck();
        }
    }
    ngOnDestroy() {
        this._keyManager?.destroy();
        this._destroyed.next();
        this._destroyed.complete();
        this._stopScrolling.complete();
    }
    /** Handles keyboard events on the header. */
    _handleKeydown(event) {
        // We don't handle any key bindings with a modifier key.
        if (hasModifierKey(event)) {
            return;
        }
        switch (event.keyCode) {
            case ENTER:
            case SPACE:
                if (this.focusIndex !== this.selectedIndex) {
                    const item = this._items.get(this.focusIndex);
                    if (item && !item.disabled) {
                        this.selectFocusedIndex.emit(this.focusIndex);
                        this._itemSelected(event);
                    }
                }
                break;
            default:
                this._keyManager.onKeydown(event);
        }
    }
    /**
     * Callback for when the MutationObserver detects that the content has changed.
     */
    _onContentChanges() {
        const textContent = this._elementRef.nativeElement.textContent;
        // We need to diff the text content of the header, because the MutationObserver callback
        // will fire even if the text content didn't change which is inefficient and is prone
        // to infinite loops if a poorly constructed expression is passed in (see #14249).
        if (textContent !== this._currentTextContent) {
            this._currentTextContent = textContent || '';
            // The content observer runs outside the `NgZone` by default, which
            // means that we need to bring the callback back in ourselves.
            this._ngZone.run(() => {
                this.updatePagination();
                this._alignInkBarToSelectedTab();
                this._changeDetectorRef.markForCheck();
            });
        }
    }
    /**
     * Updates the view whether pagination should be enabled or not.
     *
     * WARNING: Calling this method can be very costly in terms of performance. It should be called
     * as infrequently as possible from outside of the Tabs component as it causes a reflow of the
     * page.
     */
    updatePagination() {
        this._checkPaginationEnabled();
        this._checkScrollingControls();
        this._updateTabScrollPosition();
    }
    /** Tracks which element has focus; used for keyboard navigation */
    get focusIndex() {
        return this._keyManager ? this._keyManager.activeItemIndex : 0;
    }
    /** When the focus index is set, we must manually send focus to the correct label */
    set focusIndex(value) {
        if (!this._isValidIndex(value) || this.focusIndex === value || !this._keyManager) {
            return;
        }
        this._keyManager.setActiveItem(value);
    }
    /**
     * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
     * providing a valid index and return true.
     */
    _isValidIndex(index) {
        return this._items ? !!this._items.toArray()[index] : true;
    }
    /**
     * Sets focus on the HTML element for the label wrapper and scrolls it into the view if
     * scrolling is enabled.
     */
    _setTabFocus(tabIndex) {
        if (this._showPaginationControls) {
            this._scrollToLabel(tabIndex);
        }
        if (this._items && this._items.length) {
            this._items.toArray()[tabIndex].focus();
            // Do not let the browser manage scrolling to focus the element, this will be handled
            // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
            // should be the full width minus the offset width.
            const containerEl = this._tabListContainer.nativeElement;
            const dir = this._getLayoutDirection();
            if (dir == 'ltr') {
                containerEl.scrollLeft = 0;
            }
            else {
                containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
            }
        }
    }
    /** The layout direction of the containing app. */
    _getLayoutDirection() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
    _updateTabScrollPosition() {
        if (this.disablePagination) {
            return;
        }
        const scrollDistance = this.scrollDistance;
        const translateX = this._getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;
        // Don't use `translate3d` here because we don't want to create a new layer. A new layer
        // seems to cause flickering and overflow in Internet Explorer. For example, the ink bar
        // and ripples will exceed the boundaries of the visible tab bar.
        // See: https://github.com/angular/components/issues/10276
        // We round the `transform` here, because transforms with sub-pixel precision cause some
        // browsers to blur the content of the element.
        this._tabList.nativeElement.style.transform = `translateX(${Math.round(translateX)}px)`;
        // Setting the `transform` on IE will change the scroll offset of the parent, causing the
        // position to be thrown off in some cases. We have to reset it ourselves to ensure that
        // it doesn't get thrown off. Note that we scope it only to IE and Edge, because messing
        // with the scroll position throws off Chrome 71+ in RTL mode (see #14689).
        if (this._platform.TRIDENT || this._platform.EDGE) {
            this._tabListContainer.nativeElement.scrollLeft = 0;
        }
    }
    /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
    get scrollDistance() {
        return this._scrollDistance;
    }
    set scrollDistance(value) {
        this._scrollTo(value);
    }
    /**
     * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
     * the end of the list, respectively). The distance to scroll is computed to be a third of the
     * length of the tab list view window.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    _scrollHeader(direction) {
        const viewLength = this._tabListContainer.nativeElement.offsetWidth;
        // Move the scroll distance one-third the length of the tab list's viewport.
        const scrollAmount = ((direction == 'before' ? -1 : 1) * viewLength) / 3;
        return this._scrollTo(this._scrollDistance + scrollAmount);
    }
    /** Handles click events on the pagination arrows. */
    _handlePaginatorClick(direction) {
        this._stopInterval();
        this._scrollHeader(direction);
    }
    /**
     * Moves the tab list such that the desired tab label (marked by index) is moved into view.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    _scrollToLabel(labelIndex) {
        if (this.disablePagination) {
            return;
        }
        const selectedLabel = this._items ? this._items.toArray()[labelIndex] : null;
        if (!selectedLabel) {
            return;
        }
        // The view length is the visible width of the tab labels.
        const viewLength = this._tabListContainer.nativeElement.offsetWidth;
        const { offsetLeft, offsetWidth } = selectedLabel.elementRef.nativeElement;
        let labelBeforePos, labelAfterPos;
        if (this._getLayoutDirection() == 'ltr') {
            labelBeforePos = offsetLeft;
            labelAfterPos = labelBeforePos + offsetWidth;
        }
        else {
            labelAfterPos = this._tabListInner.nativeElement.offsetWidth - offsetLeft;
            labelBeforePos = labelAfterPos - offsetWidth;
        }
        const beforeVisiblePos = this.scrollDistance;
        const afterVisiblePos = this.scrollDistance + viewLength;
        if (labelBeforePos < beforeVisiblePos) {
            // Scroll header to move label to the before direction
            this.scrollDistance -= beforeVisiblePos - labelBeforePos;
        }
        else if (labelAfterPos > afterVisiblePos) {
            // Scroll header to move label to the after direction
            this.scrollDistance += Math.min(labelAfterPos - afterVisiblePos, labelBeforePos - beforeVisiblePos);
        }
    }
    /**
     * Evaluate whether the pagination controls should be displayed. If the scroll width of the
     * tab list is wider than the size of the header container, then the pagination controls should
     * be shown.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    _checkPaginationEnabled() {
        if (this.disablePagination) {
            this._showPaginationControls = false;
        }
        else {
            const scrollWidth = this._tabListInner.nativeElement.scrollWidth;
            const containerWidth = this._elementRef.nativeElement.offsetWidth;
            // Usually checking that the scroll width is greater than the container width should be
            // enough, but on Safari at specific widths the browser ends up rounding up when there's
            // no pagination and rounding down once the pagination is added. This can throw the component
            // into an infinite loop where the pagination shows up and disappears constantly. We work
            // around it by adding a threshold to the calculation. From manual testing the threshold
            // can be lowered to 2px and still resolve the issue, but we set a higher one to be safe.
            // This shouldn't cause any content to be clipped, because tabs have a 24px horizontal
            // padding. See b/316395154 for more information.
            const isEnabled = scrollWidth - containerWidth >= 5;
            if (!isEnabled) {
                this.scrollDistance = 0;
            }
            if (isEnabled !== this._showPaginationControls) {
                this._showPaginationControls = isEnabled;
                this._changeDetectorRef.markForCheck();
            }
        }
    }
    /**
     * Evaluate whether the before and after controls should be enabled or disabled.
     * If the header is at the beginning of the list (scroll distance is equal to 0) then disable the
     * before button. If the header is at the end of the list (scroll distance is equal to the
     * maximum distance we can scroll), then disable the after button.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    _checkScrollingControls() {
        if (this.disablePagination) {
            this._disableScrollAfter = this._disableScrollBefore = true;
        }
        else {
            // Check if the pagination arrows should be activated.
            this._disableScrollBefore = this.scrollDistance == 0;
            this._disableScrollAfter = this.scrollDistance == this._getMaxScrollDistance();
            this._changeDetectorRef.markForCheck();
        }
    }
    /**
     * Determines what is the maximum length in pixels that can be set for the scroll distance. This
     * is equal to the difference in width between the tab list container and tab header container.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    _getMaxScrollDistance() {
        const lengthOfTabList = this._tabListInner.nativeElement.scrollWidth;
        const viewLength = this._tabListContainer.nativeElement.offsetWidth;
        return lengthOfTabList - viewLength || 0;
    }
    /** Tells the ink-bar to align itself to the current label wrapper */
    _alignInkBarToSelectedTab() {
        const selectedItem = this._items && this._items.length ? this._items.toArray()[this.selectedIndex] : null;
        const selectedLabelWrapper = selectedItem ? selectedItem.elementRef.nativeElement : null;
        if (selectedLabelWrapper) {
            this._inkBar.alignToElement(selectedLabelWrapper);
        }
        else {
            this._inkBar.hide();
        }
    }
    /** Stops the currently-running paginator interval.  */
    _stopInterval() {
        this._stopScrolling.next();
    }
    /**
     * Handles the user pressing down on one of the paginators.
     * Starts scrolling the header after a certain amount of time.
     * @param direction In which direction the paginator should be scrolled.
     */
    _handlePaginatorPress(direction, mouseEvent) {
        // Don't start auto scrolling for right mouse button clicks. Note that we shouldn't have to
        // null check the `button`, but we do it so we don't break tests that use fake events.
        if (mouseEvent && mouseEvent.button != null && mouseEvent.button !== 0) {
            return;
        }
        // Avoid overlapping timers.
        this._stopInterval();
        // Start a timer after the delay and keep firing based on the interval.
        timer(HEADER_SCROLL_DELAY, HEADER_SCROLL_INTERVAL)
            // Keep the timer going until something tells it to stop or the component is destroyed.
            .pipe(takeUntil(merge(this._stopScrolling, this._destroyed)))
            .subscribe(() => {
            const { maxScrollDistance, distance } = this._scrollHeader(direction);
            // Stop the timer if we've reached the start or the end.
            if (distance === 0 || distance >= maxScrollDistance) {
                this._stopInterval();
            }
        });
    }
    /**
     * Scrolls the header to a given position.
     * @param position Position to which to scroll.
     * @returns Information on the current scroll distance and the maximum.
     */
    _scrollTo(position) {
        if (this.disablePagination) {
            return { maxScrollDistance: 0, distance: 0 };
        }
        const maxScrollDistance = this._getMaxScrollDistance();
        this._scrollDistance = Math.max(0, Math.min(maxScrollDistance, position));
        // Mark that the scroll distance has changed so that after the view is checked, the CSS
        // transformation can move the header.
        this._scrollDistanceChanged = true;
        this._checkScrollingControls();
        return { maxScrollDistance, distance: this._scrollDistance };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPaginatedTabHeader, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.ViewportRuler }, { token: i2.Directionality, optional: true }, { token: i0.NgZone }, { token: i3.Platform }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatPaginatedTabHeader, inputs: { disablePagination: ["disablePagination", "disablePagination", booleanAttribute], selectedIndex: ["selectedIndex", "selectedIndex", numberAttribute] }, outputs: { selectFocusedIndex: "selectFocusedIndex", indexFocused: "indexFocused" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPaginatedTabHeader, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.ViewportRuler }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.NgZone }, { type: i3.Platform }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }], propDecorators: { disablePagination: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], selectedIndex: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], selectFocusedIndex: [{
                type: Output
            }], indexFocused: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGVkLXRhYi1oZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy9wYWdpbmF0ZWQtdGFiLWhlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFrQixNQUFNLG1CQUFtQixDQUFDO0FBQ25FLE9BQU8sRUFBWSxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUMsUUFBUSxFQUFFLCtCQUErQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFDTCxxQkFBcUIsRUFJckIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixRQUFRLEVBQ1IsS0FBSyxFQUNMLE1BQU0sRUFFTixRQUFRLEVBQ1IsTUFBTSxFQUVOLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsTUFBTSxFQUNOLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBRVYsT0FBTyxFQUNQLFNBQVMsRUFDVCxLQUFLLEVBQ0wsRUFBRSxJQUFJLFlBQVksRUFDbEIsS0FBSyxHQUNOLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7Ozs7O0FBRTNGLGtEQUFrRDtBQUNsRCxNQUFNLDJCQUEyQixHQUFHLCtCQUErQixDQUFDO0lBQ2xFLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBeUIsQ0FBQztBQVMzQjs7O0dBR0c7QUFDSCxNQUFNLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztBQUVoQzs7O0dBR0c7QUFDSCxNQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQztBQUtuQzs7O0dBR0c7QUFFSCxNQUFNLE9BQWdCLHFCQUFxQjtJQXNEekMsbUNBQW1DO0lBQ25DLElBQ0ksYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBSSxhQUFhLENBQUMsQ0FBUztRQUN6QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9CLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBRTVCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQWFELFlBQ1ksV0FBb0MsRUFDcEMsa0JBQXFDLEVBQ3ZDLGNBQTZCLEVBQ2pCLElBQW9CLEVBQ2hDLE9BQWUsRUFDZixTQUFtQixFQUN1QixjQUF1QjtRQU4vRCxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUN2QyxtQkFBYyxHQUFkLGNBQWMsQ0FBZTtRQUNqQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUNoQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUN1QixtQkFBYyxHQUFkLGNBQWMsQ0FBUztRQS9FM0UsbUZBQW1GO1FBQzNFLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBRTVCLDhGQUE4RjtRQUN0RiwwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFFdEMsNkNBQTZDO1FBQzFCLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRXBELDhEQUE4RDtRQUM5RCw0QkFBdUIsR0FBRyxLQUFLLENBQUM7UUFFaEMsdUZBQXVGO1FBQ3ZGLHdCQUFtQixHQUFHLElBQUksQ0FBQztRQUUzQiw2RkFBNkY7UUFDN0YseUJBQW9CLEdBQUcsSUFBSSxDQUFDO1FBaUI1QixxREFBcUQ7UUFDN0MsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRTdDOzs7V0FHRztRQUVILHNCQUFpQixHQUFZLEtBQUssQ0FBQztRQW1CM0IsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFFbkMsaURBQWlEO1FBQzlCLHVCQUFrQixHQUF5QixJQUFJLFlBQVksRUFBVSxDQUFDO1FBRXpGLDZDQUE2QztRQUMxQixpQkFBWSxHQUF5QixJQUFJLFlBQVksRUFBVSxDQUFDO1FBRTNFLDBCQUFxQixHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRXJELGNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFXbkMsMkZBQTJGO1FBQzNGLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDN0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDO2lCQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDaEMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDZCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFLRCxlQUFlO1FBQ2IsNEZBQTRGO1FBQzVGLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSwyQkFBMkIsQ0FBQzthQUN4RixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBRUwsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSwyQkFBMkIsQ0FBQzthQUNwRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLDhFQUE4RTtRQUM5RSw0RkFBNEY7UUFDNUYsMkZBQTJGO1FBQzNGLFlBQVk7UUFDWixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCO2FBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQzthQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN0RCwwRkFBMEY7UUFDMUYsMEZBQTBGO1FBQzFGLDJGQUEyRjtRQUMzRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRXhGLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtZQUNuQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUNuQyxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksZUFBZSxDQUE0QixJQUFJLENBQUMsTUFBTSxDQUFDO2FBQzNFLHlCQUF5QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQ3JELGNBQWMsRUFBRTthQUNoQixRQUFRLEVBQUU7WUFDWCwyR0FBMkc7YUFDMUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRXZELDRGQUE0RjtRQUM1RiwwRkFBMEY7UUFDMUYsMkZBQTJGO1FBQzNGLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQyxDQUFDLENBQUM7UUFFckQsNkVBQTZFO1FBQzdFLGdEQUFnRDtRQUNoRCxLQUFLLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ2hGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxxRUFBcUU7WUFDckUsc0VBQXNFO1lBQ3RFLCtEQUErRDtZQUMvRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMxQiw0RUFBNEU7b0JBQzVFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDN0IsQ0FBQyxFQUNELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUM3RCxDQUFDO29CQUNGLE9BQU8sRUFBRSxDQUFDO2dCQUNaLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7UUFFTCxtRkFBbUY7UUFDbkYsOEZBQThGO1FBQzlGLGdGQUFnRjtRQUNoRixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxtRUFBbUU7SUFDM0QsYUFBYTtRQUNuQixJQUFJLE9BQU8sY0FBYyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3pDLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUM3QixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUN0QixTQUFTLENBQ1AsQ0FBQyxRQUE4QyxFQUFFLEVBQUUsQ0FDakQsSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUF5QyxFQUFFLEVBQUUsQ0FDM0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDN0UsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sR0FBRyxFQUFFO2dCQUNWLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5QixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FDSCxDQUNKO1FBQ0QsbUVBQW1FO1FBQ25FLDZEQUE2RDtRQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ1AsMEVBQTBFO1FBQzFFLHlFQUF5RTtRQUN6RSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzFGLENBQUM7SUFDSixDQUFDO0lBRUQscUJBQXFCO1FBQ25CLGlGQUFpRjtRQUNqRixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsNkZBQTZGO1FBQzdGLHNCQUFzQjtRQUN0QixJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7WUFDbkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFRCw4RkFBOEY7UUFDOUYsNkNBQTZDO1FBQzdDLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztZQUNwQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLGNBQWMsQ0FBQyxLQUFvQjtRQUNqQyx3REFBd0Q7UUFDeEQsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQixPQUFPO1FBQ1QsQ0FBQztRQUVELFFBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RCLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxLQUFLO2dCQUNSLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQzNDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFFOUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixDQUFDO2dCQUNILENBQUM7Z0JBQ0QsTUFBTTtZQUNSO2dCQUNFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxpQkFBaUI7UUFDZixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUM7UUFFL0Qsd0ZBQXdGO1FBQ3hGLHFGQUFxRjtRQUNyRixrRkFBa0Y7UUFDbEYsSUFBSSxXQUFXLEtBQUssSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7WUFFN0MsbUVBQW1FO1lBQ25FLDhEQUE4RDtZQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxnQkFBZ0I7UUFDZCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELG9GQUFvRjtJQUNwRixJQUFJLFVBQVUsQ0FBQyxLQUFhO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pGLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxLQUFhO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsWUFBWSxDQUFDLFFBQWdCO1FBQzNCLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV4QyxxRkFBcUY7WUFDckYsc0ZBQXNGO1lBQ3RGLG1EQUFtRDtZQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDO1lBQ3pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRXZDLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNqQixXQUFXLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUM3QixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sV0FBVyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7WUFDN0UsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELG1CQUFtQjtRQUNqQixPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNoRSxDQUFDO0lBRUQsMEZBQTBGO0lBQzFGLHdCQUF3QjtRQUN0QixJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzNCLE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFFM0Ysd0ZBQXdGO1FBQ3hGLHdGQUF3RjtRQUN4RixpRUFBaUU7UUFDakUsMERBQTBEO1FBQzFELHdGQUF3RjtRQUN4RiwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxjQUFjLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUV4Rix5RkFBeUY7UUFDekYsd0ZBQXdGO1FBQ3hGLHdGQUF3RjtRQUN4RiwyRUFBMkU7UUFDM0UsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUN0RCxDQUFDO0lBQ0gsQ0FBQztJQUVELDJGQUEyRjtJQUMzRixJQUFJLGNBQWM7UUFDaEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFJLGNBQWMsQ0FBQyxLQUFhO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxhQUFhLENBQUMsU0FBMEI7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUM7UUFFcEUsNEVBQTRFO1FBQzVFLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXpFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLFlBQVksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxxREFBcUQ7SUFDckQscUJBQXFCLENBQUMsU0FBMEI7UUFDOUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsY0FBYyxDQUFDLFVBQWtCO1FBQy9CLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDM0IsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0UsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25CLE9BQU87UUFDVCxDQUFDO1FBRUQsMERBQTBEO1FBQzFELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO1FBQ3BFLE1BQU0sRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFDLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFFekUsSUFBSSxjQUFzQixFQUFFLGFBQXFCLENBQUM7UUFDbEQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN4QyxjQUFjLEdBQUcsVUFBVSxDQUFDO1lBQzVCLGFBQWEsR0FBRyxjQUFjLEdBQUcsV0FBVyxDQUFDO1FBQy9DLENBQUM7YUFBTSxDQUFDO1lBQ04sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDMUUsY0FBYyxHQUFHLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFDL0MsQ0FBQztRQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM3QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQztRQUV6RCxJQUFJLGNBQWMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3RDLHNEQUFzRDtZQUN0RCxJQUFJLENBQUMsY0FBYyxJQUFJLGdCQUFnQixHQUFHLGNBQWMsQ0FBQztRQUMzRCxDQUFDO2FBQU0sSUFBSSxhQUFhLEdBQUcsZUFBZSxFQUFFLENBQUM7WUFDM0MscURBQXFEO1lBQ3JELElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FDN0IsYUFBYSxHQUFHLGVBQWUsRUFDL0IsY0FBYyxHQUFHLGdCQUFnQixDQUNsQyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsdUJBQXVCO1FBQ3JCLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztRQUN2QyxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztZQUNqRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUM7WUFFbEUsdUZBQXVGO1lBQ3ZGLHdGQUF3RjtZQUN4Riw2RkFBNkY7WUFDN0YseUZBQXlGO1lBQ3pGLHdGQUF3RjtZQUN4Rix5RkFBeUY7WUFDekYsc0ZBQXNGO1lBQ3RGLGlEQUFpRDtZQUNqRCxNQUFNLFNBQVMsR0FBRyxXQUFXLEdBQUcsY0FBYyxJQUFJLENBQUMsQ0FBQztZQUVwRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUVELElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsU0FBUyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDekMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCx1QkFBdUI7UUFDckIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUM5RCxDQUFDO2FBQU0sQ0FBQztZQUNOLHNEQUFzRDtZQUN0RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDL0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gscUJBQXFCO1FBQ25CLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUNyRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUNwRSxPQUFPLGVBQWUsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxxRUFBcUU7SUFDckUseUJBQXlCO1FBQ3ZCLE1BQU0sWUFBWSxHQUNoQixJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3ZGLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRXpGLElBQUksb0JBQW9CLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3BELENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUVELHVEQUF1RDtJQUN2RCxhQUFhO1FBQ1gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHFCQUFxQixDQUFDLFNBQTBCLEVBQUUsVUFBdUI7UUFDdkUsMkZBQTJGO1FBQzNGLHNGQUFzRjtRQUN0RixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZFLE9BQU87UUFDVCxDQUFDO1FBRUQsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQix1RUFBdUU7UUFDdkUsS0FBSyxDQUFDLG1CQUFtQixFQUFFLHNCQUFzQixDQUFDO1lBQ2hELHVGQUF1RjthQUN0RixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2FBQzVELFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxNQUFNLEVBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVwRSx3REFBd0Q7WUFDeEQsSUFBSSxRQUFRLEtBQUssQ0FBQyxJQUFJLFFBQVEsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdkIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxTQUFTLENBQUMsUUFBZ0I7UUFDaEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN2RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUUxRSx1RkFBdUY7UUFDdkYsc0NBQXNDO1FBQ3RDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7UUFDbkMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFL0IsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFDLENBQUM7SUFDN0QsQ0FBQztxSEFubEJtQixxQkFBcUIsc01BMEZuQixxQkFBcUI7eUdBMUZ2QixxQkFBcUIsMEVBbUR0QixnQkFBZ0IscURBSWhCLGVBQWU7O2tHQXZEZCxxQkFBcUI7a0JBRDFDLFNBQVM7OzBCQXdGTCxRQUFROzswQkFHUixRQUFROzswQkFBSSxNQUFNOzJCQUFDLHFCQUFxQjt5Q0F0QzNDLGlCQUFpQjtzQkFEaEIsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFLaEMsYUFBYTtzQkFEaEIsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUM7Z0JBbUJoQixrQkFBa0I7c0JBQXBDLE1BQU07Z0JBR1ksWUFBWTtzQkFBOUIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZvY3VzS2V5TWFuYWdlciwgRm9jdXNhYmxlT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RU5URVIsIFNQQUNFLCBoYXNNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7U2hhcmVkUmVzaXplT2JzZXJ2ZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vYnNlcnZlcnMvcHJpdmF0ZSc7XG5pbXBvcnQge1BsYXRmb3JtLCBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7XG4gIEFOSU1BVElPTl9NT0RVTEVfVFlQRSxcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgYWZ0ZXJOZXh0UmVuZGVyLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBpbmplY3QsXG4gIG51bWJlckF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBFTVBUWSxcbiAgT2JzZXJ2YWJsZSxcbiAgT2JzZXJ2ZXIsXG4gIFN1YmplY3QsXG4gIGZyb21FdmVudCxcbiAgbWVyZ2UsXG4gIG9mIGFzIG9ic2VydmFibGVPZixcbiAgdGltZXIsXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIGZpbHRlciwgc2tpcCwgc3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogQ29uZmlnIHVzZWQgdG8gYmluZCBwYXNzaXZlIGV2ZW50IGxpc3RlbmVycyAqL1xuY29uc3QgcGFzc2l2ZUV2ZW50TGlzdGVuZXJPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7XG4gIHBhc3NpdmU6IHRydWUsXG59KSBhcyBFdmVudExpc3RlbmVyT3B0aW9ucztcblxuLyoqXG4gKiBUaGUgZGlyZWN0aW9ucyB0aGF0IHNjcm9sbGluZyBjYW4gZ28gaW4gd2hlbiB0aGUgaGVhZGVyJ3MgdGFicyBleGNlZWQgdGhlIGhlYWRlciB3aWR0aC4gJ0FmdGVyJ1xuICogd2lsbCBzY3JvbGwgdGhlIGhlYWRlciB0b3dhcmRzIHRoZSBlbmQgb2YgdGhlIHRhYnMgbGlzdCBhbmQgJ2JlZm9yZScgd2lsbCBzY3JvbGwgdG93YXJkcyB0aGVcbiAqIGJlZ2lubmluZyBvZiB0aGUgbGlzdC5cbiAqL1xuZXhwb3J0IHR5cGUgU2Nyb2xsRGlyZWN0aW9uID0gJ2FmdGVyJyB8ICdiZWZvcmUnO1xuXG4vKipcbiAqIEFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgc3RhcnRpbmcgdG8gc2Nyb2xsIHRoZSBoZWFkZXIgYXV0b21hdGljYWxseS5cbiAqIFNldCBhIGxpdHRsZSBjb25zZXJ2YXRpdmVseSBpbiBvcmRlciB0byBoYW5kbGUgZmFrZSBldmVudHMgZGlzcGF0Y2hlZCBvbiB0b3VjaCBkZXZpY2VzLlxuICovXG5jb25zdCBIRUFERVJfU0NST0xMX0RFTEFZID0gNjUwO1xuXG4vKipcbiAqIEludGVydmFsIGluIG1pbGxpc2Vjb25kcyBhdCB3aGljaCB0byBzY3JvbGwgdGhlIGhlYWRlclxuICogd2hpbGUgdGhlIHVzZXIgaXMgaG9sZGluZyB0aGVpciBwb2ludGVyLlxuICovXG5jb25zdCBIRUFERVJfU0NST0xMX0lOVEVSVkFMID0gMTAwO1xuXG4vKiogSXRlbSBpbnNpZGUgYSBwYWdpbmF0ZWQgdGFiIGhlYWRlci4gKi9cbmV4cG9ydCB0eXBlIE1hdFBhZ2luYXRlZFRhYkhlYWRlckl0ZW0gPSBGb2N1c2FibGVPcHRpb24gJiB7ZWxlbWVudFJlZjogRWxlbWVudFJlZn07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYSB0YWIgaGVhZGVyIHRoYXQgc3VwcG9ydGVkIHBhZ2luYXRpb24uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hdFBhZ2luYXRlZFRhYkhlYWRlclxuICBpbXBsZW1lbnRzIEFmdGVyQ29udGVudENoZWNrZWQsIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveVxue1xuICBhYnN0cmFjdCBfaXRlbXM6IFF1ZXJ5TGlzdDxNYXRQYWdpbmF0ZWRUYWJIZWFkZXJJdGVtPjtcbiAgYWJzdHJhY3QgX2lua0Jhcjoge2hpZGU6ICgpID0+IHZvaWQ7IGFsaWduVG9FbGVtZW50OiAoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHZvaWR9O1xuICBhYnN0cmFjdCBfdGFiTGlzdENvbnRhaW5lcjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG4gIGFic3RyYWN0IF90YWJMaXN0OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcbiAgYWJzdHJhY3QgX3RhYkxpc3RJbm5lcjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG4gIGFic3RyYWN0IF9uZXh0UGFnaW5hdG9yOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcbiAgYWJzdHJhY3QgX3ByZXZpb3VzUGFnaW5hdG9yOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcblxuICAvKiogVGhlIGRpc3RhbmNlIGluIHBpeGVscyB0aGF0IHRoZSB0YWIgbGFiZWxzIHNob3VsZCBiZSB0cmFuc2xhdGVkIHRvIHRoZSBsZWZ0LiAqL1xuICBwcml2YXRlIF9zY3JvbGxEaXN0YW5jZSA9IDA7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGhlYWRlciBzaG91bGQgc2Nyb2xsIHRvIHRoZSBzZWxlY3RlZCBpbmRleCBhZnRlciB0aGUgdmlldyBoYXMgYmVlbiBjaGVja2VkLiAqL1xuICBwcml2YXRlIF9zZWxlY3RlZEluZGV4Q2hhbmdlZCA9IGZhbHNlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbnRyb2xzIGZvciBwYWdpbmF0aW9uIHNob3VsZCBiZSBkaXNwbGF5ZWQgKi9cbiAgX3Nob3dQYWdpbmF0aW9uQ29udHJvbHMgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgdGFiIGxpc3QgY2FuIGJlIHNjcm9sbGVkIG1vcmUgdG93YXJkcyB0aGUgZW5kIG9mIHRoZSB0YWIgbGFiZWwgbGlzdC4gKi9cbiAgX2Rpc2FibGVTY3JvbGxBZnRlciA9IHRydWU7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYiBsaXN0IGNhbiBiZSBzY3JvbGxlZCBtb3JlIHRvd2FyZHMgdGhlIGJlZ2lubmluZyBvZiB0aGUgdGFiIGxhYmVsIGxpc3QuICovXG4gIF9kaXNhYmxlU2Nyb2xsQmVmb3JlID0gdHJ1ZTtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiB0YWIgbGFiZWxzIHRoYXQgYXJlIGRpc3BsYXllZCBvbiB0aGUgaGVhZGVyLiBXaGVuIHRoaXMgY2hhbmdlcywgdGhlIGhlYWRlclxuICAgKiBzaG91bGQgcmUtZXZhbHVhdGUgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX3RhYkxhYmVsQ291bnQ6IG51bWJlcjtcblxuICAvKiogV2hldGhlciB0aGUgc2Nyb2xsIGRpc3RhbmNlIGhhcyBjaGFuZ2VkIGFuZCBzaG91bGQgYmUgYXBwbGllZCBhZnRlciB0aGUgdmlldyBpcyBjaGVja2VkLiAqL1xuICBwcml2YXRlIF9zY3JvbGxEaXN0YW5jZUNoYW5nZWQ6IGJvb2xlYW47XG5cbiAgLyoqIFVzZWQgdG8gbWFuYWdlIGZvY3VzIGJldHdlZW4gdGhlIHRhYnMuICovXG4gIHByaXZhdGUgX2tleU1hbmFnZXI6IEZvY3VzS2V5TWFuYWdlcjxNYXRQYWdpbmF0ZWRUYWJIZWFkZXJJdGVtPjtcblxuICAvKiogQ2FjaGVkIHRleHQgY29udGVudCBvZiB0aGUgaGVhZGVyLiAqL1xuICBwcml2YXRlIF9jdXJyZW50VGV4dENvbnRlbnQ6IHN0cmluZztcblxuICAvKiogU3RyZWFtIHRoYXQgd2lsbCBzdG9wIHRoZSBhdXRvbWF0ZWQgc2Nyb2xsaW5nLiAqL1xuICBwcml2YXRlIF9zdG9wU2Nyb2xsaW5nID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogV2hldGhlciBwYWdpbmF0aW9uIHNob3VsZCBiZSBkaXNhYmxlZC4gVGhpcyBjYW4gYmUgdXNlZCB0byBhdm9pZCB1bm5lY2Vzc2FyeVxuICAgKiBsYXlvdXQgcmVjYWxjdWxhdGlvbnMgaWYgaXQncyBrbm93biB0aGF0IHBhZ2luYXRpb24gd29uJ3QgYmUgcmVxdWlyZWQuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGRpc2FibGVQYWdpbmF0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgYWN0aXZlIHRhYi4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pXG4gIGdldCBzZWxlY3RlZEluZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSW5kZXg7XG4gIH1cbiAgc2V0IHNlbGVjdGVkSW5kZXgodjogbnVtYmVyKSB7XG4gICAgY29uc3QgdmFsdWUgPSBpc05hTih2KSA/IDAgOiB2O1xuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkSW5kZXggIT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkSW5kZXhDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3NlbGVjdGVkSW5kZXggPSB2YWx1ZTtcblxuICAgICAgaWYgKHRoaXMuX2tleU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fa2V5TWFuYWdlci51cGRhdGVBY3RpdmVJdGVtKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfc2VsZWN0ZWRJbmRleDogbnVtYmVyID0gMDtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBvcHRpb24gaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RGb2N1c2VkSW5kZXg6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KCk7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiBhIGxhYmVsIGlzIGZvY3VzZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBpbmRleEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBfc2hhcmVkUmVzaXplT2JzZXJ2ZXIgPSBpbmplY3QoU2hhcmVkUmVzaXplT2JzZXJ2ZXIpO1xuXG4gIHByaXZhdGUgX2luamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByb3RlY3RlZCBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX3ZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUpIHB1YmxpYyBfYW5pbWF0aW9uTW9kZT86IHN0cmluZyxcbiAgKSB7XG4gICAgLy8gQmluZCB0aGUgYG1vdXNlbGVhdmVgIGV2ZW50IG9uIHRoZSBvdXRzaWRlIHNpbmNlIGl0IGRvZXNuJ3QgY2hhbmdlIGFueXRoaW5nIGluIHRoZSB2aWV3LlxuICAgIF9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgZnJvbUV2ZW50KF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdtb3VzZWxlYXZlJylcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3N0b3BJbnRlcnZhbCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgYW4gaXRlbSB2aWEgdGhlIGtleWJvYXJkLiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2l0ZW1TZWxlY3RlZChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQ7XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIC8vIFdlIG5lZWQgdG8gaGFuZGxlIHRoZXNlIGV2ZW50cyBtYW51YWxseSwgYmVjYXVzZSB3ZSB3YW50IHRvIGJpbmQgcGFzc2l2ZSBldmVudCBsaXN0ZW5lcnMuXG4gICAgZnJvbUV2ZW50KHRoaXMuX3ByZXZpb3VzUGFnaW5hdG9yLm5hdGl2ZUVsZW1lbnQsICd0b3VjaHN0YXJ0JywgcGFzc2l2ZUV2ZW50TGlzdGVuZXJPcHRpb25zKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5faGFuZGxlUGFnaW5hdG9yUHJlc3MoJ2JlZm9yZScpO1xuICAgICAgfSk7XG5cbiAgICBmcm9tRXZlbnQodGhpcy5fbmV4dFBhZ2luYXRvci5uYXRpdmVFbGVtZW50LCAndG91Y2hzdGFydCcsIHBhc3NpdmVFdmVudExpc3RlbmVyT3B0aW9ucylcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hhbmRsZVBhZ2luYXRvclByZXNzKCdhZnRlcicpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgY29uc3QgZGlyQ2hhbmdlID0gdGhpcy5fZGlyID8gdGhpcy5fZGlyLmNoYW5nZSA6IG9ic2VydmFibGVPZignbHRyJyk7XG4gICAgLy8gV2UgbmVlZCB0byBkZWJvdW5jZSByZXNpemUgZXZlbnRzIGJlY2F1c2UgdGhlIGFsaWdubWVudCBsb2dpYyBpcyBleHBlbnNpdmUuXG4gICAgLy8gSWYgc29tZW9uZSBhbmltYXRlcyB0aGUgd2lkdGggb2YgdGFicywgd2UgZG9uJ3Qgd2FudCB0byByZWFsaWduIG9uIGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZS5cbiAgICAvLyBPbmNlIHdlIGhhdmVuJ3Qgc2VlbiBhbnkgbW9yZSByZXNpemUgZXZlbnRzIGluIHRoZSBsYXN0IDMybXMgKH4yIGFuaW1haW9uIGZyYW1lcykgd2UgY2FuXG4gICAgLy8gcmUtYWxpZ24uXG4gICAgY29uc3QgcmVzaXplID0gdGhpcy5fc2hhcmVkUmVzaXplT2JzZXJ2ZXJcbiAgICAgIC5vYnNlcnZlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudClcbiAgICAgIC5waXBlKGRlYm91bmNlVGltZSgzMiksIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKTtcbiAgICAvLyBOb3RlOiBXZSBkbyBub3QgYWN0dWFsbHkgbmVlZCB0byB3YXRjaCB0aGVzZSBldmVudHMgZm9yIHByb3BlciBmdW5jdGlvbmluZyBvZiB0aGUgdGFicyxcbiAgICAvLyB0aGUgcmVzaXplIGV2ZW50cyBhYm92ZSBzaG91bGQgY2FwdHVyZSBhbnkgdmlld3BvcnQgcmVzaXplIHRoYXQgd2UgY2FyZSBhYm91dC4gSG93ZXZlcixcbiAgICAvLyByZW1vdmluZyB0aGlzIGlzIGZhaXJseSBicmVha2luZyBmb3Igc2NyZWVuc2hvdCB0ZXN0cywgc28gd2UncmUgbGVhdmluZyBpdCBoZXJlIGZvciBub3cuXG4gICAgY29uc3Qgdmlld3BvcnRSZXNpemUgPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmNoYW5nZSgxNTApLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpO1xuXG4gICAgY29uc3QgcmVhbGlnbiA9ICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlUGFnaW5hdGlvbigpO1xuICAgICAgdGhpcy5fYWxpZ25JbmtCYXJUb1NlbGVjdGVkVGFiKCk7XG4gICAgfTtcblxuICAgIHRoaXMuX2tleU1hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyPE1hdFBhZ2luYXRlZFRhYkhlYWRlckl0ZW0+KHRoaXMuX2l0ZW1zKVxuICAgICAgLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCkpXG4gICAgICAud2l0aEhvbWVBbmRFbmQoKVxuICAgICAgLndpdGhXcmFwKClcbiAgICAgIC8vIEFsbG93IGZvY3VzIHRvIGxhbmQgb24gZGlzYWJsZWQgdGFicywgYXMgcGVyIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby9hcmlhLXByYWN0aWNlcy8ja2JkX2Rpc2FibGVkX2NvbnRyb2xzXG4gICAgICAuc2tpcFByZWRpY2F0ZSgoKSA9PiBmYWxzZSk7XG5cbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0odGhpcy5fc2VsZWN0ZWRJbmRleCk7XG5cbiAgICAvLyBOb3RlOiBXZSBkbyBub3QgbmVlZCB0byByZWFsaWduIGFmdGVyIHRoZSBmaXJzdCByZW5kZXIgZm9yIHByb3BlciBmdW5jdGlvbmluZyBvZiB0aGUgdGFic1xuICAgIC8vIHRoZSByZXNpemUgZXZlbnRzIGFib3ZlIHNob3VsZCBmaXJlIHdoZW4gd2UgZmlyc3Qgc3RhcnQgb2JzZXJ2aW5nIHRoZSBlbGVtZW50LiBIb3dldmVyLFxuICAgIC8vIHJlbW92aW5nIHRoaXMgaXMgZmFpcmx5IGJyZWFraW5nIGZvciBzY3JlZW5zaG90IHRlc3RzLCBzbyB3ZSdyZSBsZWF2aW5nIGl0IGhlcmUgZm9yIG5vdy5cbiAgICBhZnRlck5leHRSZW5kZXIocmVhbGlnbiwge2luamVjdG9yOiB0aGlzLl9pbmplY3Rvcn0pO1xuXG4gICAgLy8gT24gZGlyIGNoYW5nZSBvciByZXNpemUsIHJlYWxpZ24gdGhlIGluayBiYXIgYW5kIHVwZGF0ZSB0aGUgb3JpZW50YXRpb24gb2ZcbiAgICAvLyB0aGUga2V5IG1hbmFnZXIgaWYgdGhlIGRpcmVjdGlvbiBoYXMgY2hhbmdlZC5cbiAgICBtZXJnZShkaXJDaGFuZ2UsIHZpZXdwb3J0UmVzaXplLCByZXNpemUsIHRoaXMuX2l0ZW1zLmNoYW5nZXMsIHRoaXMuX2l0ZW1zUmVzaXplZCgpKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBkZWZlciB0aGlzIHRvIGdpdmUgdGhlIGJyb3dzZXIgc29tZSB0aW1lIHRvIHJlY2FsY3VsYXRlXG4gICAgICAgIC8vIHRoZSBlbGVtZW50IGRpbWVuc2lvbnMuIFRoZSBjYWxsIGhhcyB0byBiZSB3cmFwcGVkIGluIGBOZ1pvbmUucnVuYCxcbiAgICAgICAgLy8gYmVjYXVzZSB0aGUgdmlld3BvcnQgY2hhbmdlIGhhbmRsZXIgcnVucyBvdXRzaWRlIG9mIEFuZ3VsYXIuXG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQ2xhbXAgdGhlIHNjcm9sbCBkaXN0YW5jZSwgYmVjYXVzZSBpdCBjYW4gY2hhbmdlIHdpdGggdGhlIG51bWJlciBvZiB0YWJzLlxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsRGlzdGFuY2UgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgTWF0aC5taW4odGhpcy5fZ2V0TWF4U2Nyb2xsRGlzdGFuY2UoKSwgdGhpcy5fc2Nyb2xsRGlzdGFuY2UpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlYWxpZ24oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9nZXRMYXlvdXREaXJlY3Rpb24oKSk7XG4gICAgICB9KTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGEgY2hhbmdlIGluIHRoZSBmb2N1cyBrZXkgbWFuYWdlciB3ZSBuZWVkIHRvIGVtaXQgdGhlIGBpbmRleEZvY3VzZWRgXG4gICAgLy8gZXZlbnQgaW4gb3JkZXIgdG8gcHJvdmlkZSBhIHB1YmxpYyBldmVudCB0aGF0IG5vdGlmaWVzIGFib3V0IGZvY3VzIGNoYW5nZXMuIEFsc28gd2UgcmVhbGlnblxuICAgIC8vIHRoZSB0YWJzIGNvbnRhaW5lciBieSBzY3JvbGxpbmcgdGhlIG5ldyBmb2N1c2VkIHRhYiBpbnRvIHRoZSB2aXNpYmxlIHNlY3Rpb24uXG4gICAgdGhpcy5fa2V5TWFuYWdlci5jaGFuZ2Uuc3Vic2NyaWJlKG5ld0ZvY3VzSW5kZXggPT4ge1xuICAgICAgdGhpcy5pbmRleEZvY3VzZWQuZW1pdChuZXdGb2N1c0luZGV4KTtcbiAgICAgIHRoaXMuX3NldFRhYkZvY3VzKG5ld0ZvY3VzSW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFNlbmRzIGFueSBjaGFuZ2VzIHRoYXQgY291bGQgYWZmZWN0IHRoZSBsYXlvdXQgb2YgdGhlIGl0ZW1zLiAqL1xuICBwcml2YXRlIF9pdGVtc1Jlc2l6ZWQoKTogT2JzZXJ2YWJsZTxSZXNpemVPYnNlcnZlckVudHJ5W10+IHtcbiAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gRU1QVFk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmNoYW5nZXMucGlwZShcbiAgICAgIHN0YXJ0V2l0aCh0aGlzLl9pdGVtcyksXG4gICAgICBzd2l0Y2hNYXAoXG4gICAgICAgICh0YWJJdGVtczogUXVlcnlMaXN0PE1hdFBhZ2luYXRlZFRhYkhlYWRlckl0ZW0+KSA9PlxuICAgICAgICAgIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8UmVzaXplT2JzZXJ2ZXJFbnRyeVtdPikgPT5cbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKGVudHJpZXMgPT4gb2JzZXJ2ZXIubmV4dChlbnRyaWVzKSk7XG4gICAgICAgICAgICAgIHRhYkl0ZW1zLmZvckVhY2goaXRlbSA9PiByZXNpemVPYnNlcnZlci5vYnNlcnZlKGl0ZW0uZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKSxcbiAgICAgICksXG4gICAgICAvLyBTa2lwIHRoZSBmaXJzdCBlbWl0IHNpbmNlIHRoZSByZXNpemUgb2JzZXJ2ZXIgZW1pdHMgd2hlbiBhbiBpdGVtXG4gICAgICAvLyBpcyBvYnNlcnZlZCBmb3IgbmV3IGl0ZW1zIHdoZW4gdGhlIHRhYiBpcyBhbHJlYWR5IGluc2VydGVkXG4gICAgICBza2lwKDEpLFxuICAgICAgLy8gU2tpcCBlbWlzc2lvbnMgd2hlcmUgYWxsIHRoZSBlbGVtZW50cyBhcmUgaW52aXNpYmxlIHNpbmNlIHdlIGRvbid0IHdhbnRcbiAgICAgIC8vIHRoZSBoZWFkZXIgdG8gdHJ5IGFuZCByZS1yZW5kZXIgd2l0aCBpbnZhbGlkIG1lYXN1cmVtZW50cy4gU2VlICMyNTU3NC5cbiAgICAgIGZpbHRlcihlbnRyaWVzID0+IGVudHJpZXMuc29tZShlID0+IGUuY29udGVudFJlY3Qud2lkdGggPiAwICYmIGUuY29udGVudFJlY3QuaGVpZ2h0ID4gMCkpLFxuICAgICk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIG51bWJlciBvZiB0YWIgbGFiZWxzIGhhdmUgY2hhbmdlZCwgY2hlY2sgaWYgc2Nyb2xsaW5nIHNob3VsZCBiZSBlbmFibGVkXG4gICAgaWYgKHRoaXMuX3RhYkxhYmVsQ291bnQgIT0gdGhpcy5faXRlbXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVwZGF0ZVBhZ2luYXRpb24oKTtcbiAgICAgIHRoaXMuX3RhYkxhYmVsQ291bnQgPSB0aGlzLl9pdGVtcy5sZW5ndGg7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgc2VsZWN0ZWQgaW5kZXggaGFzIGNoYW5nZWQsIHNjcm9sbCB0byB0aGUgbGFiZWwgYW5kIGNoZWNrIGlmIHRoZSBzY3JvbGxpbmcgY29udHJvbHNcbiAgICAvLyBzaG91bGQgYmUgZGlzYWJsZWQuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkSW5kZXhDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9zY3JvbGxUb0xhYmVsKHRoaXMuX3NlbGVjdGVkSW5kZXgpO1xuICAgICAgdGhpcy5fY2hlY2tTY3JvbGxpbmdDb250cm9scygpO1xuICAgICAgdGhpcy5fYWxpZ25JbmtCYXJUb1NlbGVjdGVkVGFiKCk7XG4gICAgICB0aGlzLl9zZWxlY3RlZEluZGV4Q2hhbmdlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNjcm9sbCBkaXN0YW5jZSBoYXMgYmVlbiBjaGFuZ2VkICh0YWIgc2VsZWN0ZWQsIGZvY3VzZWQsIHNjcm9sbCBjb250cm9scyBhY3RpdmF0ZWQpLFxuICAgIC8vIHRoZW4gdHJhbnNsYXRlIHRoZSBoZWFkZXIgdG8gcmVmbGVjdCB0aGlzLlxuICAgIGlmICh0aGlzLl9zY3JvbGxEaXN0YW5jZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVRhYlNjcm9sbFBvc2l0aW9uKCk7XG4gICAgICB0aGlzLl9zY3JvbGxEaXN0YW5jZUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXI/LmRlc3Ryb3koKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3N0b3BTY3JvbGxpbmcuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBvbiB0aGUgaGVhZGVyLiAqL1xuICBfaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIC8vIFdlIGRvbid0IGhhbmRsZSBhbnkga2V5IGJpbmRpbmdzIHdpdGggYSBtb2RpZmllciBrZXkuXG4gICAgaWYgKGhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICAgIGlmICh0aGlzLmZvY3VzSW5kZXggIT09IHRoaXMuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9pdGVtcy5nZXQodGhpcy5mb2N1c0luZGV4KTtcblxuICAgICAgICAgIGlmIChpdGVtICYmICFpdGVtLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZvY3VzZWRJbmRleC5lbWl0KHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICAgICAgICB0aGlzLl9pdGVtU2VsZWN0ZWQoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2tleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIHdoZW4gdGhlIE11dGF0aW9uT2JzZXJ2ZXIgZGV0ZWN0cyB0aGF0IHRoZSBjb250ZW50IGhhcyBjaGFuZ2VkLlxuICAgKi9cbiAgX29uQ29udGVudENoYW5nZXMoKSB7XG4gICAgY29uc3QgdGV4dENvbnRlbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQ7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGRpZmYgdGhlIHRleHQgY29udGVudCBvZiB0aGUgaGVhZGVyLCBiZWNhdXNlIHRoZSBNdXRhdGlvbk9ic2VydmVyIGNhbGxiYWNrXG4gICAgLy8gd2lsbCBmaXJlIGV2ZW4gaWYgdGhlIHRleHQgY29udGVudCBkaWRuJ3QgY2hhbmdlIHdoaWNoIGlzIGluZWZmaWNpZW50IGFuZCBpcyBwcm9uZVxuICAgIC8vIHRvIGluZmluaXRlIGxvb3BzIGlmIGEgcG9vcmx5IGNvbnN0cnVjdGVkIGV4cHJlc3Npb24gaXMgcGFzc2VkIGluIChzZWUgIzE0MjQ5KS5cbiAgICBpZiAodGV4dENvbnRlbnQgIT09IHRoaXMuX2N1cnJlbnRUZXh0Q29udGVudCkge1xuICAgICAgdGhpcy5fY3VycmVudFRleHRDb250ZW50ID0gdGV4dENvbnRlbnQgfHwgJyc7XG5cbiAgICAgIC8vIFRoZSBjb250ZW50IG9ic2VydmVyIHJ1bnMgb3V0c2lkZSB0aGUgYE5nWm9uZWAgYnkgZGVmYXVsdCwgd2hpY2hcbiAgICAgIC8vIG1lYW5zIHRoYXQgd2UgbmVlZCB0byBicmluZyB0aGUgY2FsbGJhY2sgYmFjayBpbiBvdXJzZWx2ZXMuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVQYWdpbmF0aW9uKCk7XG4gICAgICAgIHRoaXMuX2FsaWduSW5rQmFyVG9TZWxlY3RlZFRhYigpO1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSB2aWV3IHdoZXRoZXIgcGFnaW5hdGlvbiBzaG91bGQgYmUgZW5hYmxlZCBvciBub3QuXG4gICAqXG4gICAqIFdBUk5JTkc6IENhbGxpbmcgdGhpcyBtZXRob2QgY2FuIGJlIHZlcnkgY29zdGx5IGluIHRlcm1zIG9mIHBlcmZvcm1hbmNlLiBJdCBzaG91bGQgYmUgY2FsbGVkXG4gICAqIGFzIGluZnJlcXVlbnRseSBhcyBwb3NzaWJsZSBmcm9tIG91dHNpZGUgb2YgdGhlIFRhYnMgY29tcG9uZW50IGFzIGl0IGNhdXNlcyBhIHJlZmxvdyBvZiB0aGVcbiAgICogcGFnZS5cbiAgICovXG4gIHVwZGF0ZVBhZ2luYXRpb24oKSB7XG4gICAgdGhpcy5fY2hlY2tQYWdpbmF0aW9uRW5hYmxlZCgpO1xuICAgIHRoaXMuX2NoZWNrU2Nyb2xsaW5nQ29udHJvbHMoKTtcbiAgICB0aGlzLl91cGRhdGVUYWJTY3JvbGxQb3NpdGlvbigpO1xuICB9XG5cbiAgLyoqIFRyYWNrcyB3aGljaCBlbGVtZW50IGhhcyBmb2N1czsgdXNlZCBmb3Iga2V5Ym9hcmQgbmF2aWdhdGlvbiAqL1xuICBnZXQgZm9jdXNJbmRleCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYW5hZ2VyID8gdGhpcy5fa2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghIDogMDtcbiAgfVxuXG4gIC8qKiBXaGVuIHRoZSBmb2N1cyBpbmRleCBpcyBzZXQsIHdlIG11c3QgbWFudWFsbHkgc2VuZCBmb2N1cyB0byB0aGUgY29ycmVjdCBsYWJlbCAqL1xuICBzZXQgZm9jdXNJbmRleCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkSW5kZXgodmFsdWUpIHx8IHRoaXMuZm9jdXNJbmRleCA9PT0gdmFsdWUgfHwgIXRoaXMuX2tleU1hbmFnZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0odmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYW4gaW5kZXggaXMgdmFsaWQuICBJZiB0aGUgdGFicyBhcmUgbm90IHJlYWR5IHlldCwgd2UgYXNzdW1lIHRoYXQgdGhlIHVzZXIgaXNcbiAgICogcHJvdmlkaW5nIGEgdmFsaWQgaW5kZXggYW5kIHJldHVybiB0cnVlLlxuICAgKi9cbiAgX2lzVmFsaWRJbmRleChpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zID8gISF0aGlzLl9pdGVtcy50b0FycmF5KClbaW5kZXhdIDogdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGZvY3VzIG9uIHRoZSBIVE1MIGVsZW1lbnQgZm9yIHRoZSBsYWJlbCB3cmFwcGVyIGFuZCBzY3JvbGxzIGl0IGludG8gdGhlIHZpZXcgaWZcbiAgICogc2Nyb2xsaW5nIGlzIGVuYWJsZWQuXG4gICAqL1xuICBfc2V0VGFiRm9jdXModGFiSW5kZXg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLl9zaG93UGFnaW5hdGlvbkNvbnRyb2xzKSB7XG4gICAgICB0aGlzLl9zY3JvbGxUb0xhYmVsKHRhYkluZGV4KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faXRlbXMgJiYgdGhpcy5faXRlbXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9pdGVtcy50b0FycmF5KClbdGFiSW5kZXhdLmZvY3VzKCk7XG5cbiAgICAgIC8vIERvIG5vdCBsZXQgdGhlIGJyb3dzZXIgbWFuYWdlIHNjcm9sbGluZyB0byBmb2N1cyB0aGUgZWxlbWVudCwgdGhpcyB3aWxsIGJlIGhhbmRsZWRcbiAgICAgIC8vIGJ5IHVzaW5nIHRyYW5zbGF0aW9uLiBJbiBMVFIsIHRoZSBzY3JvbGwgbGVmdCBzaG91bGQgYmUgMC4gSW4gUlRMLCB0aGUgc2Nyb2xsIHdpZHRoXG4gICAgICAvLyBzaG91bGQgYmUgdGhlIGZ1bGwgd2lkdGggbWludXMgdGhlIG9mZnNldCB3aWR0aC5cbiAgICAgIGNvbnN0IGNvbnRhaW5lckVsID0gdGhpcy5fdGFiTGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgY29uc3QgZGlyID0gdGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCk7XG5cbiAgICAgIGlmIChkaXIgPT0gJ2x0cicpIHtcbiAgICAgICAgY29udGFpbmVyRWwuc2Nyb2xsTGVmdCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250YWluZXJFbC5zY3JvbGxMZWZ0ID0gY29udGFpbmVyRWwuc2Nyb2xsV2lkdGggLSBjb250YWluZXJFbC5vZmZzZXRXaWR0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGxheW91dCBkaXJlY3Rpb24gb2YgdGhlIGNvbnRhaW5pbmcgYXBwLiAqL1xuICBfZ2V0TGF5b3V0RGlyZWN0aW9uKCk6IERpcmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpciAmJiB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnID8gJ3J0bCcgOiAnbHRyJztcbiAgfVxuXG4gIC8qKiBQZXJmb3JtcyB0aGUgQ1NTIHRyYW5zZm9ybWF0aW9uIG9uIHRoZSB0YWIgbGlzdCB0aGF0IHdpbGwgY2F1c2UgdGhlIGxpc3QgdG8gc2Nyb2xsLiAqL1xuICBfdXBkYXRlVGFiU2Nyb2xsUG9zaXRpb24oKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZVBhZ2luYXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzY3JvbGxEaXN0YW5jZSA9IHRoaXMuc2Nyb2xsRGlzdGFuY2U7XG4gICAgY29uc3QgdHJhbnNsYXRlWCA9IHRoaXMuX2dldExheW91dERpcmVjdGlvbigpID09PSAnbHRyJyA/IC1zY3JvbGxEaXN0YW5jZSA6IHNjcm9sbERpc3RhbmNlO1xuXG4gICAgLy8gRG9uJ3QgdXNlIGB0cmFuc2xhdGUzZGAgaGVyZSBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgbmV3IGxheWVyLiBBIG5ldyBsYXllclxuICAgIC8vIHNlZW1zIHRvIGNhdXNlIGZsaWNrZXJpbmcgYW5kIG92ZXJmbG93IGluIEludGVybmV0IEV4cGxvcmVyLiBGb3IgZXhhbXBsZSwgdGhlIGluayBiYXJcbiAgICAvLyBhbmQgcmlwcGxlcyB3aWxsIGV4Y2VlZCB0aGUgYm91bmRhcmllcyBvZiB0aGUgdmlzaWJsZSB0YWIgYmFyLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTAyNzZcbiAgICAvLyBXZSByb3VuZCB0aGUgYHRyYW5zZm9ybWAgaGVyZSwgYmVjYXVzZSB0cmFuc2Zvcm1zIHdpdGggc3ViLXBpeGVsIHByZWNpc2lvbiBjYXVzZSBzb21lXG4gICAgLy8gYnJvd3NlcnMgdG8gYmx1ciB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLl90YWJMaXN0Lm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHtNYXRoLnJvdW5kKHRyYW5zbGF0ZVgpfXB4KWA7XG5cbiAgICAvLyBTZXR0aW5nIHRoZSBgdHJhbnNmb3JtYCBvbiBJRSB3aWxsIGNoYW5nZSB0aGUgc2Nyb2xsIG9mZnNldCBvZiB0aGUgcGFyZW50LCBjYXVzaW5nIHRoZVxuICAgIC8vIHBvc2l0aW9uIHRvIGJlIHRocm93biBvZmYgaW4gc29tZSBjYXNlcy4gV2UgaGF2ZSB0byByZXNldCBpdCBvdXJzZWx2ZXMgdG8gZW5zdXJlIHRoYXRcbiAgICAvLyBpdCBkb2Vzbid0IGdldCB0aHJvd24gb2ZmLiBOb3RlIHRoYXQgd2Ugc2NvcGUgaXQgb25seSB0byBJRSBhbmQgRWRnZSwgYmVjYXVzZSBtZXNzaW5nXG4gICAgLy8gd2l0aCB0aGUgc2Nyb2xsIHBvc2l0aW9uIHRocm93cyBvZmYgQ2hyb21lIDcxKyBpbiBSVEwgbW9kZSAoc2VlICMxNDY4OSkuXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLlRSSURFTlQgfHwgdGhpcy5fcGxhdGZvcm0uRURHRSkge1xuICAgICAgdGhpcy5fdGFiTGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbExlZnQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBkaXN0YW5jZSBpbiBwaXhlbHMgdGhhdCB0aGUgdGFiIGhlYWRlciBzaG91bGQgYmUgdHJhbnNmb3JtZWQgaW4gdGhlIFgtYXhpcy4gKi9cbiAgZ2V0IHNjcm9sbERpc3RhbmNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbERpc3RhbmNlO1xuICB9XG4gIHNldCBzY3JvbGxEaXN0YW5jZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc2Nyb2xsVG8odmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIHRoZSB0YWIgbGlzdCBpbiB0aGUgJ2JlZm9yZScgb3IgJ2FmdGVyJyBkaXJlY3Rpb24gKHRvd2FyZHMgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGlzdCBvclxuICAgKiB0aGUgZW5kIG9mIHRoZSBsaXN0LCByZXNwZWN0aXZlbHkpLiBUaGUgZGlzdGFuY2UgdG8gc2Nyb2xsIGlzIGNvbXB1dGVkIHRvIGJlIGEgdGhpcmQgb2YgdGhlXG4gICAqIGxlbmd0aCBvZiB0aGUgdGFiIGxpc3QgdmlldyB3aW5kb3cuXG4gICAqXG4gICAqIFRoaXMgaXMgYW4gZXhwZW5zaXZlIGNhbGwgdGhhdCBmb3JjZXMgYSBsYXlvdXQgcmVmbG93IHRvIGNvbXB1dGUgYm94IGFuZCBzY3JvbGwgbWV0cmljcyBhbmRcbiAgICogc2hvdWxkIGJlIGNhbGxlZCBzcGFyaW5nbHkuXG4gICAqL1xuICBfc2Nyb2xsSGVhZGVyKGRpcmVjdGlvbjogU2Nyb2xsRGlyZWN0aW9uKSB7XG4gICAgY29uc3Qgdmlld0xlbmd0aCA9IHRoaXMuX3RhYkxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aDtcblxuICAgIC8vIE1vdmUgdGhlIHNjcm9sbCBkaXN0YW5jZSBvbmUtdGhpcmQgdGhlIGxlbmd0aCBvZiB0aGUgdGFiIGxpc3QncyB2aWV3cG9ydC5cbiAgICBjb25zdCBzY3JvbGxBbW91bnQgPSAoKGRpcmVjdGlvbiA9PSAnYmVmb3JlJyA/IC0xIDogMSkgKiB2aWV3TGVuZ3RoKSAvIDM7XG5cbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsVG8odGhpcy5fc2Nyb2xsRGlzdGFuY2UgKyBzY3JvbGxBbW91bnQpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgY2xpY2sgZXZlbnRzIG9uIHRoZSBwYWdpbmF0aW9uIGFycm93cy4gKi9cbiAgX2hhbmRsZVBhZ2luYXRvckNsaWNrKGRpcmVjdGlvbjogU2Nyb2xsRGlyZWN0aW9uKSB7XG4gICAgdGhpcy5fc3RvcEludGVydmFsKCk7XG4gICAgdGhpcy5fc2Nyb2xsSGVhZGVyKGRpcmVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgdGhlIHRhYiBsaXN0IHN1Y2ggdGhhdCB0aGUgZGVzaXJlZCB0YWIgbGFiZWwgKG1hcmtlZCBieSBpbmRleCkgaXMgbW92ZWQgaW50byB2aWV3LlxuICAgKlxuICAgKiBUaGlzIGlzIGFuIGV4cGVuc2l2ZSBjYWxsIHRoYXQgZm9yY2VzIGEgbGF5b3V0IHJlZmxvdyB0byBjb21wdXRlIGJveCBhbmQgc2Nyb2xsIG1ldHJpY3MgYW5kXG4gICAqIHNob3VsZCBiZSBjYWxsZWQgc3BhcmluZ2x5LlxuICAgKi9cbiAgX3Njcm9sbFRvTGFiZWwobGFiZWxJbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZVBhZ2luYXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3RlZExhYmVsID0gdGhpcy5faXRlbXMgPyB0aGlzLl9pdGVtcy50b0FycmF5KClbbGFiZWxJbmRleF0gOiBudWxsO1xuXG4gICAgaWYgKCFzZWxlY3RlZExhYmVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIHZpZXcgbGVuZ3RoIGlzIHRoZSB2aXNpYmxlIHdpZHRoIG9mIHRoZSB0YWIgbGFiZWxzLlxuICAgIGNvbnN0IHZpZXdMZW5ndGggPSB0aGlzLl90YWJMaXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgY29uc3Qge29mZnNldExlZnQsIG9mZnNldFdpZHRofSA9IHNlbGVjdGVkTGFiZWwuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgbGV0IGxhYmVsQmVmb3JlUG9zOiBudW1iZXIsIGxhYmVsQWZ0ZXJQb3M6IG51bWJlcjtcbiAgICBpZiAodGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCkgPT0gJ2x0cicpIHtcbiAgICAgIGxhYmVsQmVmb3JlUG9zID0gb2Zmc2V0TGVmdDtcbiAgICAgIGxhYmVsQWZ0ZXJQb3MgPSBsYWJlbEJlZm9yZVBvcyArIG9mZnNldFdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYWJlbEFmdGVyUG9zID0gdGhpcy5fdGFiTGlzdElubmVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggLSBvZmZzZXRMZWZ0O1xuICAgICAgbGFiZWxCZWZvcmVQb3MgPSBsYWJlbEFmdGVyUG9zIC0gb2Zmc2V0V2lkdGg7XG4gICAgfVxuXG4gICAgY29uc3QgYmVmb3JlVmlzaWJsZVBvcyA9IHRoaXMuc2Nyb2xsRGlzdGFuY2U7XG4gICAgY29uc3QgYWZ0ZXJWaXNpYmxlUG9zID0gdGhpcy5zY3JvbGxEaXN0YW5jZSArIHZpZXdMZW5ndGg7XG5cbiAgICBpZiAobGFiZWxCZWZvcmVQb3MgPCBiZWZvcmVWaXNpYmxlUG9zKSB7XG4gICAgICAvLyBTY3JvbGwgaGVhZGVyIHRvIG1vdmUgbGFiZWwgdG8gdGhlIGJlZm9yZSBkaXJlY3Rpb25cbiAgICAgIHRoaXMuc2Nyb2xsRGlzdGFuY2UgLT0gYmVmb3JlVmlzaWJsZVBvcyAtIGxhYmVsQmVmb3JlUG9zO1xuICAgIH0gZWxzZSBpZiAobGFiZWxBZnRlclBvcyA+IGFmdGVyVmlzaWJsZVBvcykge1xuICAgICAgLy8gU2Nyb2xsIGhlYWRlciB0byBtb3ZlIGxhYmVsIHRvIHRoZSBhZnRlciBkaXJlY3Rpb25cbiAgICAgIHRoaXMuc2Nyb2xsRGlzdGFuY2UgKz0gTWF0aC5taW4oXG4gICAgICAgIGxhYmVsQWZ0ZXJQb3MgLSBhZnRlclZpc2libGVQb3MsXG4gICAgICAgIGxhYmVsQmVmb3JlUG9zIC0gYmVmb3JlVmlzaWJsZVBvcyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlIHdoZXRoZXIgdGhlIHBhZ2luYXRpb24gY29udHJvbHMgc2hvdWxkIGJlIGRpc3BsYXllZC4gSWYgdGhlIHNjcm9sbCB3aWR0aCBvZiB0aGVcbiAgICogdGFiIGxpc3QgaXMgd2lkZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgaGVhZGVyIGNvbnRhaW5lciwgdGhlbiB0aGUgcGFnaW5hdGlvbiBjb250cm9scyBzaG91bGRcbiAgICogYmUgc2hvd24uXG4gICAqXG4gICAqIFRoaXMgaXMgYW4gZXhwZW5zaXZlIGNhbGwgdGhhdCBmb3JjZXMgYSBsYXlvdXQgcmVmbG93IHRvIGNvbXB1dGUgYm94IGFuZCBzY3JvbGwgbWV0cmljcyBhbmRcbiAgICogc2hvdWxkIGJlIGNhbGxlZCBzcGFyaW5nbHkuXG4gICAqL1xuICBfY2hlY2tQYWdpbmF0aW9uRW5hYmxlZCgpIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlUGFnaW5hdGlvbikge1xuICAgICAgdGhpcy5fc2hvd1BhZ2luYXRpb25Db250cm9scyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzY3JvbGxXaWR0aCA9IHRoaXMuX3RhYkxpc3RJbm5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFdpZHRoO1xuICAgICAgY29uc3QgY29udGFpbmVyV2lkdGggPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cbiAgICAgIC8vIFVzdWFsbHkgY2hlY2tpbmcgdGhhdCB0aGUgc2Nyb2xsIHdpZHRoIGlzIGdyZWF0ZXIgdGhhbiB0aGUgY29udGFpbmVyIHdpZHRoIHNob3VsZCBiZVxuICAgICAgLy8gZW5vdWdoLCBidXQgb24gU2FmYXJpIGF0IHNwZWNpZmljIHdpZHRocyB0aGUgYnJvd3NlciBlbmRzIHVwIHJvdW5kaW5nIHVwIHdoZW4gdGhlcmUnc1xuICAgICAgLy8gbm8gcGFnaW5hdGlvbiBhbmQgcm91bmRpbmcgZG93biBvbmNlIHRoZSBwYWdpbmF0aW9uIGlzIGFkZGVkLiBUaGlzIGNhbiB0aHJvdyB0aGUgY29tcG9uZW50XG4gICAgICAvLyBpbnRvIGFuIGluZmluaXRlIGxvb3Agd2hlcmUgdGhlIHBhZ2luYXRpb24gc2hvd3MgdXAgYW5kIGRpc2FwcGVhcnMgY29uc3RhbnRseS4gV2Ugd29ya1xuICAgICAgLy8gYXJvdW5kIGl0IGJ5IGFkZGluZyBhIHRocmVzaG9sZCB0byB0aGUgY2FsY3VsYXRpb24uIEZyb20gbWFudWFsIHRlc3RpbmcgdGhlIHRocmVzaG9sZFxuICAgICAgLy8gY2FuIGJlIGxvd2VyZWQgdG8gMnB4IGFuZCBzdGlsbCByZXNvbHZlIHRoZSBpc3N1ZSwgYnV0IHdlIHNldCBhIGhpZ2hlciBvbmUgdG8gYmUgc2FmZS5cbiAgICAgIC8vIFRoaXMgc2hvdWxkbid0IGNhdXNlIGFueSBjb250ZW50IHRvIGJlIGNsaXBwZWQsIGJlY2F1c2UgdGFicyBoYXZlIGEgMjRweCBob3Jpem9udGFsXG4gICAgICAvLyBwYWRkaW5nLiBTZWUgYi8zMTYzOTUxNTQgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICBjb25zdCBpc0VuYWJsZWQgPSBzY3JvbGxXaWR0aCAtIGNvbnRhaW5lcldpZHRoID49IDU7XG5cbiAgICAgIGlmICghaXNFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsRGlzdGFuY2UgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFbmFibGVkICE9PSB0aGlzLl9zaG93UGFnaW5hdGlvbkNvbnRyb2xzKSB7XG4gICAgICAgIHRoaXMuX3Nob3dQYWdpbmF0aW9uQ29udHJvbHMgPSBpc0VuYWJsZWQ7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZSB3aGV0aGVyIHRoZSBiZWZvcmUgYW5kIGFmdGVyIGNvbnRyb2xzIHNob3VsZCBiZSBlbmFibGVkIG9yIGRpc2FibGVkLlxuICAgKiBJZiB0aGUgaGVhZGVyIGlzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpc3QgKHNjcm9sbCBkaXN0YW5jZSBpcyBlcXVhbCB0byAwKSB0aGVuIGRpc2FibGUgdGhlXG4gICAqIGJlZm9yZSBidXR0b24uIElmIHRoZSBoZWFkZXIgaXMgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdCAoc2Nyb2xsIGRpc3RhbmNlIGlzIGVxdWFsIHRvIHRoZVxuICAgKiBtYXhpbXVtIGRpc3RhbmNlIHdlIGNhbiBzY3JvbGwpLCB0aGVuIGRpc2FibGUgdGhlIGFmdGVyIGJ1dHRvbi5cbiAgICpcbiAgICogVGhpcyBpcyBhbiBleHBlbnNpdmUgY2FsbCB0aGF0IGZvcmNlcyBhIGxheW91dCByZWZsb3cgdG8gY29tcHV0ZSBib3ggYW5kIHNjcm9sbCBtZXRyaWNzIGFuZFxuICAgKiBzaG91bGQgYmUgY2FsbGVkIHNwYXJpbmdseS5cbiAgICovXG4gIF9jaGVja1Njcm9sbGluZ0NvbnRyb2xzKCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVQYWdpbmF0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlU2Nyb2xsQWZ0ZXIgPSB0aGlzLl9kaXNhYmxlU2Nyb2xsQmVmb3JlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHBhZ2luYXRpb24gYXJyb3dzIHNob3VsZCBiZSBhY3RpdmF0ZWQuXG4gICAgICB0aGlzLl9kaXNhYmxlU2Nyb2xsQmVmb3JlID0gdGhpcy5zY3JvbGxEaXN0YW5jZSA9PSAwO1xuICAgICAgdGhpcy5fZGlzYWJsZVNjcm9sbEFmdGVyID0gdGhpcy5zY3JvbGxEaXN0YW5jZSA9PSB0aGlzLl9nZXRNYXhTY3JvbGxEaXN0YW5jZSgpO1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCBpcyB0aGUgbWF4aW11bSBsZW5ndGggaW4gcGl4ZWxzIHRoYXQgY2FuIGJlIHNldCBmb3IgdGhlIHNjcm9sbCBkaXN0YW5jZS4gVGhpc1xuICAgKiBpcyBlcXVhbCB0byB0aGUgZGlmZmVyZW5jZSBpbiB3aWR0aCBiZXR3ZWVuIHRoZSB0YWIgbGlzdCBjb250YWluZXIgYW5kIHRhYiBoZWFkZXIgY29udGFpbmVyLlxuICAgKlxuICAgKiBUaGlzIGlzIGFuIGV4cGVuc2l2ZSBjYWxsIHRoYXQgZm9yY2VzIGEgbGF5b3V0IHJlZmxvdyB0byBjb21wdXRlIGJveCBhbmQgc2Nyb2xsIG1ldHJpY3MgYW5kXG4gICAqIHNob3VsZCBiZSBjYWxsZWQgc3BhcmluZ2x5LlxuICAgKi9cbiAgX2dldE1heFNjcm9sbERpc3RhbmNlKCk6IG51bWJlciB7XG4gICAgY29uc3QgbGVuZ3RoT2ZUYWJMaXN0ID0gdGhpcy5fdGFiTGlzdElubmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsV2lkdGg7XG4gICAgY29uc3Qgdmlld0xlbmd0aCA9IHRoaXMuX3RhYkxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICByZXR1cm4gbGVuZ3RoT2ZUYWJMaXN0IC0gdmlld0xlbmd0aCB8fCAwO1xuICB9XG5cbiAgLyoqIFRlbGxzIHRoZSBpbmstYmFyIHRvIGFsaWduIGl0c2VsZiB0byB0aGUgY3VycmVudCBsYWJlbCB3cmFwcGVyICovXG4gIF9hbGlnbklua0JhclRvU2VsZWN0ZWRUYWIoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID1cbiAgICAgIHRoaXMuX2l0ZW1zICYmIHRoaXMuX2l0ZW1zLmxlbmd0aCA/IHRoaXMuX2l0ZW1zLnRvQXJyYXkoKVt0aGlzLnNlbGVjdGVkSW5kZXhdIDogbnVsbDtcbiAgICBjb25zdCBzZWxlY3RlZExhYmVsV3JhcHBlciA9IHNlbGVjdGVkSXRlbSA/IHNlbGVjdGVkSXRlbS5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgOiBudWxsO1xuXG4gICAgaWYgKHNlbGVjdGVkTGFiZWxXcmFwcGVyKSB7XG4gICAgICB0aGlzLl9pbmtCYXIuYWxpZ25Ub0VsZW1lbnQoc2VsZWN0ZWRMYWJlbFdyYXBwZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pbmtCYXIuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTdG9wcyB0aGUgY3VycmVudGx5LXJ1bm5pbmcgcGFnaW5hdG9yIGludGVydmFsLiAgKi9cbiAgX3N0b3BJbnRlcnZhbCgpIHtcbiAgICB0aGlzLl9zdG9wU2Nyb2xsaW5nLm5leHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSB1c2VyIHByZXNzaW5nIGRvd24gb24gb25lIG9mIHRoZSBwYWdpbmF0b3JzLlxuICAgKiBTdGFydHMgc2Nyb2xsaW5nIHRoZSBoZWFkZXIgYWZ0ZXIgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lLlxuICAgKiBAcGFyYW0gZGlyZWN0aW9uIEluIHdoaWNoIGRpcmVjdGlvbiB0aGUgcGFnaW5hdG9yIHNob3VsZCBiZSBzY3JvbGxlZC5cbiAgICovXG4gIF9oYW5kbGVQYWdpbmF0b3JQcmVzcyhkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbiwgbW91c2VFdmVudD86IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBEb24ndCBzdGFydCBhdXRvIHNjcm9sbGluZyBmb3IgcmlnaHQgbW91c2UgYnV0dG9uIGNsaWNrcy4gTm90ZSB0aGF0IHdlIHNob3VsZG4ndCBoYXZlIHRvXG4gICAgLy8gbnVsbCBjaGVjayB0aGUgYGJ1dHRvbmAsIGJ1dCB3ZSBkbyBpdCBzbyB3ZSBkb24ndCBicmVhayB0ZXN0cyB0aGF0IHVzZSBmYWtlIGV2ZW50cy5cbiAgICBpZiAobW91c2VFdmVudCAmJiBtb3VzZUV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIG1vdXNlRXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQXZvaWQgb3ZlcmxhcHBpbmcgdGltZXJzLlxuICAgIHRoaXMuX3N0b3BJbnRlcnZhbCgpO1xuXG4gICAgLy8gU3RhcnQgYSB0aW1lciBhZnRlciB0aGUgZGVsYXkgYW5kIGtlZXAgZmlyaW5nIGJhc2VkIG9uIHRoZSBpbnRlcnZhbC5cbiAgICB0aW1lcihIRUFERVJfU0NST0xMX0RFTEFZLCBIRUFERVJfU0NST0xMX0lOVEVSVkFMKVxuICAgICAgLy8gS2VlcCB0aGUgdGltZXIgZ29pbmcgdW50aWwgc29tZXRoaW5nIHRlbGxzIGl0IHRvIHN0b3Agb3IgdGhlIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQuXG4gICAgICAucGlwZSh0YWtlVW50aWwobWVyZ2UodGhpcy5fc3RvcFNjcm9sbGluZywgdGhpcy5fZGVzdHJveWVkKSkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgY29uc3Qge21heFNjcm9sbERpc3RhbmNlLCBkaXN0YW5jZX0gPSB0aGlzLl9zY3JvbGxIZWFkZXIoZGlyZWN0aW9uKTtcblxuICAgICAgICAvLyBTdG9wIHRoZSB0aW1lciBpZiB3ZSd2ZSByZWFjaGVkIHRoZSBzdGFydCBvciB0aGUgZW5kLlxuICAgICAgICBpZiAoZGlzdGFuY2UgPT09IDAgfHwgZGlzdGFuY2UgPj0gbWF4U2Nyb2xsRGlzdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLl9zdG9wSW50ZXJ2YWwoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0aGUgaGVhZGVyIHRvIGEgZ2l2ZW4gcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBQb3NpdGlvbiB0byB3aGljaCB0byBzY3JvbGwuXG4gICAqIEByZXR1cm5zIEluZm9ybWF0aW9uIG9uIHRoZSBjdXJyZW50IHNjcm9sbCBkaXN0YW5jZSBhbmQgdGhlIG1heGltdW0uXG4gICAqL1xuICBwcml2YXRlIF9zY3JvbGxUbyhwb3NpdGlvbjogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZVBhZ2luYXRpb24pIHtcbiAgICAgIHJldHVybiB7bWF4U2Nyb2xsRGlzdGFuY2U6IDAsIGRpc3RhbmNlOiAwfTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXhTY3JvbGxEaXN0YW5jZSA9IHRoaXMuX2dldE1heFNjcm9sbERpc3RhbmNlKCk7XG4gICAgdGhpcy5fc2Nyb2xsRGlzdGFuY2UgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhTY3JvbGxEaXN0YW5jZSwgcG9zaXRpb24pKTtcblxuICAgIC8vIE1hcmsgdGhhdCB0aGUgc2Nyb2xsIGRpc3RhbmNlIGhhcyBjaGFuZ2VkIHNvIHRoYXQgYWZ0ZXIgdGhlIHZpZXcgaXMgY2hlY2tlZCwgdGhlIENTU1xuICAgIC8vIHRyYW5zZm9ybWF0aW9uIGNhbiBtb3ZlIHRoZSBoZWFkZXIuXG4gICAgdGhpcy5fc2Nyb2xsRGlzdGFuY2VDaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLl9jaGVja1Njcm9sbGluZ0NvbnRyb2xzKCk7XG5cbiAgICByZXR1cm4ge21heFNjcm9sbERpc3RhbmNlLCBkaXN0YW5jZTogdGhpcy5fc2Nyb2xsRGlzdGFuY2V9O1xuICB9XG59XG4iXX0=