/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, forwardRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { VIRTUAL_SCROLL_STRATEGY } from './virtual-scroll-strategy';
import * as i0 from "@angular/core";
/** Virtual scrolling strategy for lists with items of known fixed size. */
export class FixedSizeVirtualScrollStrategy {
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize, minBufferPx, maxBufferPx) {
        this._scrolledIndexChange = new Subject();
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
        /** The attached viewport. */
        this._viewport = null;
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport) {
        this._viewport = viewport;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() {
        /* no-op */
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() {
        /* no-op */
    }
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index, behavior) {
        if (this._viewport) {
            this._viewport.scrollToOffset(index * this._itemSize, behavior);
        }
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }
        this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
    }
    /** Update the viewport's rendered range. */
    _updateRenderedRange() {
        if (!this._viewport) {
            return;
        }
        const renderedRange = this._viewport.getRenderedRange();
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        let scrollOffset = this._viewport.measureScrollOffset();
        // Prevent NaN as result when dividing by zero.
        let firstVisibleIndex = this._itemSize > 0 ? scrollOffset / this._itemSize : 0;
        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
            const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex != newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = newVisibleIndex * this._itemSize;
                newRange.start = Math.floor(firstVisibleIndex);
            }
            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }
        const startBuffer = scrollOffset - newRange.start * this._itemSize;
        if (startBuffer < this._minBufferPx && newRange.start != 0) {
            const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
            newRange.start = Math.max(0, newRange.start - expandStart);
            newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
        }
        else {
            const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
            if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
                const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, newRange.end + expandEnd);
                    newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
                }
            }
        }
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(this._itemSize * newRange.start);
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}
/**
 * Provider factory for `FixedSizeVirtualScrollStrategy` that simply extracts the already created
 * `FixedSizeVirtualScrollStrategy` from the given directive.
 * @param fixedSizeDir The instance of `CdkFixedSizeVirtualScroll` to extract the
 *     `FixedSizeVirtualScrollStrategy` from.
 */
export function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir) {
    return fixedSizeDir._scrollStrategy;
}
/** A virtual scroll strategy that supports fixed-size items. */
export class CdkFixedSizeVirtualScroll {
    constructor() {
        this._itemSize = 20;
        this._minBufferPx = 100;
        this._maxBufferPx = 200;
        /** The scroll strategy used by this directive. */
        this._scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
    /** The size of the items in the list (in pixels). */
    get itemSize() {
        return this._itemSize;
    }
    set itemSize(value) {
        this._itemSize = coerceNumberProperty(value);
    }
    /**
     * The minimum amount of buffer rendered beyond the viewport (in pixels).
     * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
     */
    get minBufferPx() {
        return this._minBufferPx;
    }
    set minBufferPx(value) {
        this._minBufferPx = coerceNumberProperty(value);
    }
    /**
     * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
     */
    get maxBufferPx() {
        return this._maxBufferPx;
    }
    set maxBufferPx(value) {
        this._maxBufferPx = coerceNumberProperty(value);
    }
    ngOnChanges() {
        this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkFixedSizeVirtualScroll, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkFixedSizeVirtualScroll, isStandalone: true, selector: "cdk-virtual-scroll-viewport[itemSize]", inputs: { itemSize: "itemSize", minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx" }, providers: [
            {
                provide: VIRTUAL_SCROLL_STRATEGY,
                useFactory: _fixedSizeVirtualScrollStrategyFactory,
                deps: [forwardRef(() => CdkFixedSizeVirtualScroll)],
            },
        ], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkFixedSizeVirtualScroll, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-virtual-scroll-viewport[itemSize]',
                    standalone: true,
                    providers: [
                        {
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useFactory: _fixedSizeVirtualScrollStrategyFactory,
                            deps: [forwardRef(() => CdkFixedSizeVirtualScroll)],
                        },
                    ],
                }]
        }], propDecorators: { itemSize: [{
                type: Input
            }], minBufferPx: [{
                type: Input
            }], maxBufferPx: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4ZWQtc2l6ZS12aXJ0dWFsLXNjcm9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL2ZpeGVkLXNpemUtdmlydHVhbC1zY3JvbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG9CQUFvQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLHVCQUF1QixFQUF3QixNQUFNLDJCQUEyQixDQUFDOztBQUd6RiwyRUFBMkU7QUFDM0UsTUFBTSxPQUFPLDhCQUE4QjtJQWtCekM7Ozs7T0FJRztJQUNILFlBQVksUUFBZ0IsRUFBRSxXQUFtQixFQUFFLFdBQW1CO1FBdEJyRCx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRTlELGtFQUFrRTtRQUNsRSx3QkFBbUIsR0FBdUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFakcsNkJBQTZCO1FBQ3JCLGNBQVMsR0FBb0MsSUFBSSxDQUFDO1FBaUJ4RCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLFFBQWtDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FB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QVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRyxDQUFDO3FIQTdDVSx5QkFBeUI7eUdBQXpCLHlCQUF5Qiw4S0FSekI7WUFDVDtnQkFDRSxPQUFPLEVBQUUsdUJBQXVCO2dCQUNoQyxVQUFVLEVBQUUsc0NBQXNDO2dCQUNsRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FBQzthQUNwRDtTQUNGOztrR0FFVSx5QkFBeUI7a0JBWHJDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVDQUF1QztvQkFDakQsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsdUJBQXVCOzRCQUNoQyxVQUFVLEVBQUUsc0NBQXNDOzRCQUNsRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUM7eUJBQ3BEO3FCQUNGO2lCQUNGOzhCQUlLLFFBQVE7c0JBRFgsS0FBSztnQkFjRixXQUFXO3NCQURkLEtBQUs7Z0JBYUYsV0FBVztzQkFEZCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIElucHV0LCBPbkNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWR9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7VklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksIFZpcnR1YWxTY3JvbGxTdHJhdGVneX0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbC1zdHJhdGVneSc7XG5pbXBvcnQge0Nka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydH0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbC12aWV3cG9ydCc7XG5cbi8qKiBWaXJ0dWFsIHNjcm9sbGluZyBzdHJhdGVneSBmb3IgbGlzdHMgd2l0aCBpdGVtcyBvZiBrbm93biBmaXhlZCBzaXplLiAqL1xuZXhwb3J0IGNsYXNzIEZpeGVkU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSBpbXBsZW1lbnRzIFZpcnR1YWxTY3JvbGxTdHJhdGVneSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3Njcm9sbGVkSW5kZXhDaGFuZ2UgPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIHNjcm9sbGVkSW5kZXhDaGFuZ2U6IE9ic2VydmFibGU8bnVtYmVyPiA9IHRoaXMuX3Njcm9sbGVkSW5kZXhDaGFuZ2UucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgpKTtcblxuICAvKiogVGhlIGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF92aWV3cG9ydDogQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBzaXplIG9mIHRoZSBpdGVtcyBpbiB0aGUgdmlydHVhbGx5IHNjcm9sbGluZyBsaXN0LiAqL1xuICBwcml2YXRlIF9pdGVtU2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByaXZhdGUgX21pbkJ1ZmZlclB4OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgYnVmZmVyIGl0ZW1zIHRvIHJlbmRlciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xuICBwcml2YXRlIF9tYXhCdWZmZXJQeDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gaXRlbVNpemUgVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSB2aXJ0dWFsbHkgc2Nyb2xsaW5nIGxpc3QuXG4gICAqIEBwYXJhbSBtaW5CdWZmZXJQeCBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIChpbiBwaXhlbHMpIGJlZm9yZSBuZWVkaW5nIHRvIHJlbmRlciBtb3JlXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgYW1vdW50IG9mIGJ1ZmZlciAoaW4gcGl4ZWxzKSB0byByZW5kZXIgd2hlbiByZW5kZXJpbmcgbW9yZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGl0ZW1TaXplOiBudW1iZXIsIG1pbkJ1ZmZlclB4OiBudW1iZXIsIG1heEJ1ZmZlclB4OiBudW1iZXIpIHtcbiAgICB0aGlzLl9pdGVtU2l6ZSA9IGl0ZW1TaXplO1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSB0byBhIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0gdmlld3BvcnQgVGhlIHZpZXdwb3J0IHRvIGF0dGFjaCB0aGlzIHN0cmF0ZWd5IHRvLlxuICAgKi9cbiAgYXR0YWNoKHZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQpIHtcbiAgICB0aGlzLl92aWV3cG9ydCA9IHZpZXdwb3J0O1xuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVSZW5kZXJlZFJhbmdlKCk7XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgZnJvbSB0aGUgY3VycmVudGx5IGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xuICBkZXRhY2goKSB7XG4gICAgdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGl0ZW0gc2l6ZSBhbmQgYnVmZmVyIHNpemUuXG4gICAqIEBwYXJhbSBpdGVtU2l6ZSBUaGUgc2l6ZSBvZiB0aGUgaXRlbXMgaW4gdGhlIHZpcnR1YWxseSBzY3JvbGxpbmcgbGlzdC5cbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgKGluIHBpeGVscykgYmVmb3JlIG5lZWRpbmcgdG8gcmVuZGVyIG1vcmVcbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBhbW91bnQgb2YgYnVmZmVyIChpbiBwaXhlbHMpIHRvIHJlbmRlciB3aGVuIHJlbmRlcmluZyBtb3JlLlxuICAgKi9cbiAgdXBkYXRlSXRlbUFuZEJ1ZmZlclNpemUoaXRlbVNpemU6IG51bWJlciwgbWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xuICAgIGlmIChtYXhCdWZmZXJQeCA8IG1pbkJ1ZmZlclB4ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ0RLIHZpcnR1YWwgc2Nyb2xsOiBtYXhCdWZmZXJQeCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBtaW5CdWZmZXJQeCcpO1xuICAgIH1cbiAgICB0aGlzLl9pdGVtU2l6ZSA9IGl0ZW1TaXplO1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgICB0aGlzLl91cGRhdGVUb3RhbENvbnRlbnRTaXplKCk7XG4gICAgdGhpcy5fdXBkYXRlUmVuZGVyZWRSYW5nZSgpO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uQ29udGVudFNjcm9sbGVkKCkge1xuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKTtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkRhdGFMZW5ndGhDaGFuZ2VkKCkge1xuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVSZW5kZXJlZFJhbmdlKCk7XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25Db250ZW50UmVuZGVyZWQoKSB7XG4gICAgLyogbm8tb3AgKi9cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvblJlbmRlcmVkT2Zmc2V0Q2hhbmdlZCgpIHtcbiAgICAvKiBuby1vcCAqL1xuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbCB0byB0aGUgb2Zmc2V0IGZvciB0aGUgZ2l2ZW4gaW5kZXguXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gc2Nyb2xsIHRvLlxuICAgKiBAcGFyYW0gYmVoYXZpb3IgVGhlIFNjcm9sbEJlaGF2aW9yIHRvIHVzZSB3aGVuIHNjcm9sbGluZy5cbiAgICovXG4gIHNjcm9sbFRvSW5kZXgoaW5kZXg6IG51bWJlciwgYmVoYXZpb3I6IFNjcm9sbEJlaGF2aW9yKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl92aWV3cG9ydC5zY3JvbGxUb09mZnNldChpbmRleCAqIHRoaXMuX2l0ZW1TaXplLCBiZWhhdmlvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgdmlld3BvcnQncyB0b3RhbCBjb250ZW50IHNpemUuICovXG4gIHByaXZhdGUgX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKSB7XG4gICAgaWYgKCF0aGlzLl92aWV3cG9ydCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3ZpZXdwb3J0LnNldFRvdGFsQ29udGVudFNpemUodGhpcy5fdmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpICogdGhpcy5faXRlbVNpemUpO1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgdmlld3BvcnQncyByZW5kZXJlZCByYW5nZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUmVuZGVyZWRSYW5nZSgpIHtcbiAgICBpZiAoIXRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVuZGVyZWRSYW5nZSA9IHRoaXMuX3ZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKTtcbiAgICBjb25zdCBuZXdSYW5nZSA9IHtzdGFydDogcmVuZGVyZWRSYW5nZS5zdGFydCwgZW5kOiByZW5kZXJlZFJhbmdlLmVuZH07XG4gICAgY29uc3Qgdmlld3BvcnRTaXplID0gdGhpcy5fdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCk7XG4gICAgY29uc3QgZGF0YUxlbmd0aCA9IHRoaXMuX3ZpZXdwb3J0LmdldERhdGFMZW5ndGgoKTtcbiAgICBsZXQgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIC8vIFByZXZlbnQgTmFOIGFzIHJlc3VsdCB3aGVuIGRpdmlkaW5nIGJ5IHplcm8uXG4gICAgbGV0IGZpcnN0VmlzaWJsZUluZGV4ID0gdGhpcy5faXRlbVNpemUgPiAwID8gc2Nyb2xsT2Zmc2V0IC8gdGhpcy5faXRlbVNpemUgOiAwO1xuXG4gICAgLy8gSWYgdXNlciBzY3JvbGxzIHRvIHRoZSBib3R0b20gb2YgdGhlIGxpc3QgYW5kIGRhdGEgY2hhbmdlcyB0byBhIHNtYWxsZXIgbGlzdFxuICAgIGlmIChuZXdSYW5nZS5lbmQgPiBkYXRhTGVuZ3RoKSB7XG4gICAgICAvLyBXZSBoYXZlIHRvIHJlY2FsY3VsYXRlIHRoZSBmaXJzdCB2aXNpYmxlIGluZGV4IGJhc2VkIG9uIG5ldyBkYXRhIGxlbmd0aCBhbmQgdmlld3BvcnQgc2l6ZS5cbiAgICAgIGNvbnN0IG1heFZpc2libGVJdGVtcyA9IE1hdGguY2VpbCh2aWV3cG9ydFNpemUgLyB0aGlzLl9pdGVtU2l6ZSk7XG4gICAgICBjb25zdCBuZXdWaXNpYmxlSW5kZXggPSBNYXRoLm1heChcbiAgICAgICAgMCxcbiAgICAgICAgTWF0aC5taW4oZmlyc3RWaXNpYmxlSW5kZXgsIGRhdGFMZW5ndGggLSBtYXhWaXNpYmxlSXRlbXMpLFxuICAgICAgKTtcblxuICAgICAgLy8gSWYgZmlyc3QgdmlzaWJsZSBpbmRleCBjaGFuZ2VkIHdlIG11c3QgdXBkYXRlIHNjcm9sbCBvZmZzZXQgdG8gaGFuZGxlIHN0YXJ0L2VuZCBidWZmZXJzXG4gICAgICAvLyBDdXJyZW50IHJhbmdlIG11c3QgYWxzbyBiZSBhZGp1c3RlZCB0byBjb3ZlciB0aGUgbmV3IHBvc2l0aW9uIChib3R0b20gb2YgbmV3IGxpc3QpLlxuICAgICAgaWYgKGZpcnN0VmlzaWJsZUluZGV4ICE9IG5ld1Zpc2libGVJbmRleCkge1xuICAgICAgICBmaXJzdFZpc2libGVJbmRleCA9IG5ld1Zpc2libGVJbmRleDtcbiAgICAgICAgc2Nyb2xsT2Zmc2V0ID0gbmV3VmlzaWJsZUluZGV4ICogdGhpcy5faXRlbVNpemU7XG4gICAgICAgIG5ld1JhbmdlLnN0YXJ0ID0gTWF0aC5mbG9vcihmaXJzdFZpc2libGVJbmRleCk7XG4gICAgICB9XG5cbiAgICAgIG5ld1JhbmdlLmVuZCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGRhdGFMZW5ndGgsIG5ld1JhbmdlLnN0YXJ0ICsgbWF4VmlzaWJsZUl0ZW1zKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRCdWZmZXIgPSBzY3JvbGxPZmZzZXQgLSBuZXdSYW5nZS5zdGFydCAqIHRoaXMuX2l0ZW1TaXplO1xuICAgIGlmIChzdGFydEJ1ZmZlciA8IHRoaXMuX21pbkJ1ZmZlclB4ICYmIG5ld1JhbmdlLnN0YXJ0ICE9IDApIHtcbiAgICAgIGNvbnN0IGV4cGFuZFN0YXJ0ID0gTWF0aC5jZWlsKCh0aGlzLl9tYXhCdWZmZXJQeCAtIHN0YXJ0QnVmZmVyKSAvIHRoaXMuX2l0ZW1TaXplKTtcbiAgICAgIG5ld1JhbmdlLnN0YXJ0ID0gTWF0aC5tYXgoMCwgbmV3UmFuZ2Uuc3RhcnQgLSBleHBhbmRTdGFydCk7XG4gICAgICBuZXdSYW5nZS5lbmQgPSBNYXRoLm1pbihcbiAgICAgICAgZGF0YUxlbmd0aCxcbiAgICAgICAgTWF0aC5jZWlsKGZpcnN0VmlzaWJsZUluZGV4ICsgKHZpZXdwb3J0U2l6ZSArIHRoaXMuX21pbkJ1ZmZlclB4KSAvIHRoaXMuX2l0ZW1TaXplKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVuZEJ1ZmZlciA9IG5ld1JhbmdlLmVuZCAqIHRoaXMuX2l0ZW1TaXplIC0gKHNjcm9sbE9mZnNldCArIHZpZXdwb3J0U2l6ZSk7XG4gICAgICBpZiAoZW5kQnVmZmVyIDwgdGhpcy5fbWluQnVmZmVyUHggJiYgbmV3UmFuZ2UuZW5kICE9IGRhdGFMZW5ndGgpIHtcbiAgICAgICAgY29uc3QgZXhwYW5kRW5kID0gTWF0aC5jZWlsKCh0aGlzLl9tYXhCdWZmZXJQeCAtIGVuZEJ1ZmZlcikgLyB0aGlzLl9pdGVtU2l6ZSk7XG4gICAgICAgIGlmIChleHBhbmRFbmQgPiAwKSB7XG4gICAgICAgICAgbmV3UmFuZ2UuZW5kID0gTWF0aC5taW4oZGF0YUxlbmd0aCwgbmV3UmFuZ2UuZW5kICsgZXhwYW5kRW5kKTtcbiAgICAgICAgICBuZXdSYW5nZS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIE1hdGguZmxvb3IoZmlyc3RWaXNpYmxlSW5kZXggLSB0aGlzLl9taW5CdWZmZXJQeCAvIHRoaXMuX2l0ZW1TaXplKSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fdmlld3BvcnQuc2V0UmVuZGVyZWRSYW5nZShuZXdSYW5nZSk7XG4gICAgdGhpcy5fdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuX2l0ZW1TaXplICogbmV3UmFuZ2Uuc3RhcnQpO1xuICAgIHRoaXMuX3Njcm9sbGVkSW5kZXhDaGFuZ2UubmV4dChNYXRoLmZsb29yKGZpcnN0VmlzaWJsZUluZGV4KSk7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlciBmYWN0b3J5IGZvciBgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCB0aGF0IHNpbXBseSBleHRyYWN0cyB0aGUgYWxyZWFkeSBjcmVhdGVkXG4gKiBgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBmcm9tIHRoZSBnaXZlbiBkaXJlY3RpdmUuXG4gKiBAcGFyYW0gZml4ZWRTaXplRGlyIFRoZSBpbnN0YW5jZSBvZiBgQ2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbGAgdG8gZXh0cmFjdCB0aGVcbiAqICAgICBgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBmcm9tLlxuICovXG5leHBvcnQgZnVuY3Rpb24gX2ZpeGVkU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneUZhY3RvcnkoZml4ZWRTaXplRGlyOiBDZGtGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsKSB7XG4gIHJldHVybiBmaXhlZFNpemVEaXIuX3Njcm9sbFN0cmF0ZWd5O1xufVxuXG4vKiogQSB2aXJ0dWFsIHNjcm9sbCBzdHJhdGVneSB0aGF0IHN1cHBvcnRzIGZpeGVkLXNpemUgaXRlbXMuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnRbaXRlbVNpemVdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogVklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksXG4gICAgICB1c2VGYWN0b3J5OiBfZml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5RmFjdG9yeSxcbiAgICAgIGRlcHM6IFtmb3J3YXJkUmVmKCgpID0+IENka0ZpeGVkU2l6ZVZpcnR1YWxTY3JvbGwpXSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqIFRoZSBzaXplIG9mIHRoZSBpdGVtcyBpbiB0aGUgbGlzdCAoaW4gcGl4ZWxzKS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGl0ZW1TaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1TaXplO1xuICB9XG4gIHNldCBpdGVtU2l6ZSh2YWx1ZTogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9pdGVtU2l6ZSA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBfaXRlbVNpemUgPSAyMDtcblxuICAvKipcbiAgICogVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiBJZiB0aGUgYW1vdW50IG9mIGJ1ZmZlciBkaXBzIGJlbG93IHRoaXMgbnVtYmVyLCBtb3JlIGl0ZW1zIHdpbGwgYmUgcmVuZGVyZWQuIERlZmF1bHRzIHRvIDEwMHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbkJ1ZmZlclB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbkJ1ZmZlclB4O1xuICB9XG4gIHNldCBtaW5CdWZmZXJQeCh2YWx1ZTogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9taW5CdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBfbWluQnVmZmVyUHggPSAxMDA7XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgcGl4ZWxzIHdvcnRoIG9mIGJ1ZmZlciB0byByZW5kZXIgZm9yIHdoZW4gcmVuZGVyaW5nIG5ldyBpdGVtcy4gRGVmYXVsdHMgdG8gMjAwcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4QnVmZmVyUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4QnVmZmVyUHg7XG4gIH1cbiAgc2V0IG1heEJ1ZmZlclB4KHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9tYXhCdWZmZXJQeCA9IDIwMDtcblxuICAvKiogVGhlIHNjcm9sbCBzdHJhdGVneSB1c2VkIGJ5IHRoaXMgZGlyZWN0aXZlLiAqL1xuICBfc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5KFxuICAgIHRoaXMuaXRlbVNpemUsXG4gICAgdGhpcy5taW5CdWZmZXJQeCxcbiAgICB0aGlzLm1heEJ1ZmZlclB4LFxuICApO1xuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LnVwZGF0ZUl0ZW1BbmRCdWZmZXJTaXplKHRoaXMuaXRlbVNpemUsIHRoaXMubWluQnVmZmVyUHgsIHRoaXMubWF4QnVmZmVyUHgpO1xuICB9XG59XG4iXX0=