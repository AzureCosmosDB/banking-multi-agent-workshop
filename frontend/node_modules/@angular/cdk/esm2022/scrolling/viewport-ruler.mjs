/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, Optional, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Time in ms to throttle the resize events by default. */
export const DEFAULT_RESIZE_TIME = 20;
/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
export class ViewportRuler {
    constructor(_platform, ngZone, document) {
        this._platform = _platform;
        /** Stream of viewport change events. */
        this._change = new Subject();
        /** Event listener that will be used to handle the viewport change events. */
        this._changeListener = (event) => {
            this._change.next(event);
        };
        this._document = document;
        ngZone.runOutsideAngular(() => {
            if (_platform.isBrowser) {
                const window = this._getWindow();
                // Note that bind the events ourselves, rather than going through something like RxJS's
                // `fromEvent` so that we can ensure that they're bound outside of the NgZone.
                window.addEventListener('resize', this._changeListener);
                window.addEventListener('orientationchange', this._changeListener);
            }
            // Clear the cached position so that the viewport is re-measured next time it is required.
            // We don't need to keep track of the subscription, because it is completed on destroy.
            this.change().subscribe(() => (this._viewportSize = null));
        });
    }
    ngOnDestroy() {
        if (this._platform.isBrowser) {
            const window = this._getWindow();
            window.removeEventListener('resize', this._changeListener);
            window.removeEventListener('orientationchange', this._changeListener);
        }
        this._change.complete();
    }
    /** Returns the viewport's width and height. */
    getViewportSize() {
        if (!this._viewportSize) {
            this._updateViewportSize();
        }
        const output = { width: this._viewportSize.width, height: this._viewportSize.height };
        // If we're not on a browser, don't cache the size since it'll be mocked out anyway.
        if (!this._platform.isBrowser) {
            this._viewportSize = null;
        }
        return output;
    }
    /** Gets a DOMRect for the viewport's bounds. */
    getViewportRect() {
        // Use the document element's bounding rect rather than the window scroll properties
        // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
        // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
        // conceptual viewports. Under most circumstances these viewports are equivalent, but they
        // can disagree when the page is pinch-zoomed (on devices that support touch).
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
        // We use the documentElement instead of the body because, by default (without a css reset)
        // browsers typically give the document body an 8px margin, which is not included in
        // getBoundingClientRect().
        const scrollPosition = this.getViewportScrollPosition();
        const { width, height } = this.getViewportSize();
        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            bottom: scrollPosition.top + height,
            right: scrollPosition.left + width,
            height,
            width,
        };
    }
    /** Gets the (top, left) scroll position of the viewport. */
    getViewportScrollPosition() {
        // While we can get a reference to the fake document
        // during SSR, it doesn't have getBoundingClientRect.
        if (!this._platform.isBrowser) {
            return { top: 0, left: 0 };
        }
        // The top-left-corner of the viewport is determined by the scroll position of the document
        // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
        // whether `document.body` or `document.documentElement` is the scrolled element, so reading
        // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
        // `document.documentElement` works consistently, where the `top` and `left` values will
        // equal negative the scroll position.
        const document = this._document;
        const window = this._getWindow();
        const documentElement = document.documentElement;
        const documentRect = documentElement.getBoundingClientRect();
        const top = -documentRect.top ||
            document.body.scrollTop ||
            window.scrollY ||
            documentElement.scrollTop ||
            0;
        const left = -documentRect.left ||
            document.body.scrollLeft ||
            window.scrollX ||
            documentElement.scrollLeft ||
            0;
        return { top, left };
    }
    /**
     * Returns a stream that emits whenever the size of the viewport changes.
     * This stream emits outside of the Angular zone.
     * @param throttleTime Time in milliseconds to throttle the stream.
     */
    change(throttleTime = DEFAULT_RESIZE_TIME) {
        return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /** Updates the cached viewport size. */
    _updateViewportSize() {
        const window = this._getWindow();
        this._viewportSize = this._platform.isBrowser
            ? { width: window.innerWidth, height: window.innerHeight }
            : { width: 0, height: 0 };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ViewportRuler, deps: [{ token: i1.Platform }, { token: i0.NgZone }, { token: DOCUMENT, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ViewportRuler, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ViewportRuler, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Platform }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnQtcnVsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy92aWV3cG9ydC1ydWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQWEsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQUV6QywyREFBMkQ7QUFDM0QsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0FBUXRDOzs7R0FHRztBQUVILE1BQU0sT0FBTyxhQUFhO0lBZXhCLFlBQ1UsU0FBbUIsRUFDM0IsTUFBYyxFQUNnQixRQUFhO1FBRm5DLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFaN0Isd0NBQXdDO1FBQ3ZCLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBUyxDQUFDO1FBRWhELDZFQUE2RTtRQUNyRSxvQkFBZSxHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7WUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDO1FBVUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUM1QixJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUVqQyx1RkFBdUY7Z0JBQ3ZG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Z0VBa0JGLFFBQVE7eUhBbEJuQixhQUFhLGNBREQsTUFBTTs7a0dBQ2xCLGFBQWE7a0JBRHpCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFtQjNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveSwgT3B0aW9uYWwsIEluamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHthdWRpdFRpbWV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbi8qKiBUaW1lIGluIG1zIHRvIHRocm90dGxlIHRoZSByZXNpemUgZXZlbnRzIGJ5IGRlZmF1bHQuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9SRVNJWkVfVElNRSA9IDIwO1xuXG4vKiogT2JqZWN0IHRoYXQgaG9sZHMgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQgaW4gZWFjaCBkaXJlY3Rpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24ge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xufVxuXG4vKipcbiAqIFNpbXBsZSB1dGlsaXR5IGZvciBnZXR0aW5nIHRoZSBib3VuZHMgb2YgdGhlIGJyb3dzZXIgdmlld3BvcnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0UnVsZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQ2FjaGVkIHZpZXdwb3J0IGRpbWVuc2lvbnMuICovXG4gIHByaXZhdGUgX3ZpZXdwb3J0U2l6ZToge3dpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyfSB8IG51bGw7XG5cbiAgLyoqIFN0cmVhbSBvZiB2aWV3cG9ydCBjaGFuZ2UgZXZlbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jaGFuZ2UgPSBuZXcgU3ViamVjdDxFdmVudD4oKTtcblxuICAvKiogRXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaGFuZGxlIHRoZSB2aWV3cG9ydCBjaGFuZ2UgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9jaGFuZ2VMaXN0ZW5lciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICB0aGlzLl9jaGFuZ2UubmV4dChldmVudCk7XG4gIH07XG5cbiAgLyoqIFVzZWQgdG8gcmVmZXJlbmNlIGNvcnJlY3QgZG9jdW1lbnQvd2luZG93ICovXG4gIHByb3RlY3RlZCBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuXG4gICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGlmIChfcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuXG4gICAgICAgIC8vIE5vdGUgdGhhdCBiaW5kIHRoZSBldmVudHMgb3Vyc2VsdmVzLCByYXRoZXIgdGhhbiBnb2luZyB0aHJvdWdoIHNvbWV0aGluZyBsaWtlIFJ4SlMnc1xuICAgICAgICAvLyBgZnJvbUV2ZW50YCBzbyB0aGF0IHdlIGNhbiBlbnN1cmUgdGhhdCB0aGV5J3JlIGJvdW5kIG91dHNpZGUgb2YgdGhlIE5nWm9uZS5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2NoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgdGhpcy5fY2hhbmdlTGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhciB0aGUgY2FjaGVkIHBvc2l0aW9uIHNvIHRoYXQgdGhlIHZpZXdwb3J0IGlzIHJlLW1lYXN1cmVkIG5leHQgdGltZSBpdCBpcyByZXF1aXJlZC5cbiAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgc3Vic2NyaXB0aW9uLCBiZWNhdXNlIGl0IGlzIGNvbXBsZXRlZCBvbiBkZXN0cm95LlxuICAgICAgdGhpcy5jaGFuZ2UoKS5zdWJzY3JpYmUoKCkgPT4gKHRoaXMuX3ZpZXdwb3J0U2l6ZSA9IG51bGwpKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2NoYW5nZUxpc3RlbmVyKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIHRoaXMuX2NoYW5nZUxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGFuZ2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB2aWV3cG9ydCdzIHdpZHRoIGFuZCBoZWlnaHQuICovXG4gIGdldFZpZXdwb3J0U2l6ZSgpOiBSZWFkb25seTx7d2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXJ9PiB7XG4gICAgaWYgKCF0aGlzLl92aWV3cG9ydFNpemUpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVZpZXdwb3J0U2l6ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dCA9IHt3aWR0aDogdGhpcy5fdmlld3BvcnRTaXplIS53aWR0aCwgaGVpZ2h0OiB0aGlzLl92aWV3cG9ydFNpemUhLmhlaWdodH07XG5cbiAgICAvLyBJZiB3ZSdyZSBub3Qgb24gYSBicm93c2VyLCBkb24ndCBjYWNoZSB0aGUgc2l6ZSBzaW5jZSBpdCdsbCBiZSBtb2NrZWQgb3V0IGFueXdheS5cbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgdGhpcy5fdmlld3BvcnRTaXplID0gbnVsbCE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgRE9NUmVjdCBmb3IgdGhlIHZpZXdwb3J0J3MgYm91bmRzLiAqL1xuICBnZXRWaWV3cG9ydFJlY3QoKSB7XG4gICAgLy8gVXNlIHRoZSBkb2N1bWVudCBlbGVtZW50J3MgYm91bmRpbmcgcmVjdCByYXRoZXIgdGhhbiB0aGUgd2luZG93IHNjcm9sbCBwcm9wZXJ0aWVzXG4gICAgLy8gKGUuZy4gcGFnZVlPZmZzZXQsIHNjcm9sbFkpIGR1ZSB0byBpbiBpc3N1ZSBpbiBDaHJvbWUgYW5kIElFIHdoZXJlIHdpbmRvdyBzY3JvbGxcbiAgICAvLyBwcm9wZXJ0aWVzIGFuZCBjbGllbnQgY29vcmRpbmF0ZXMgKGJvdW5kaW5nQ2xpZW50UmVjdCwgY2xpZW50WC9ZLCBldGMuKSBhcmUgaW4gZGlmZmVyZW50XG4gICAgLy8gY29uY2VwdHVhbCB2aWV3cG9ydHMuIFVuZGVyIG1vc3QgY2lyY3Vtc3RhbmNlcyB0aGVzZSB2aWV3cG9ydHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCB0aGV5XG4gICAgLy8gY2FuIGRpc2FncmVlIHdoZW4gdGhlIHBhZ2UgaXMgcGluY2gtem9vbWVkIChvbiBkZXZpY2VzIHRoYXQgc3VwcG9ydCB0b3VjaCkuXG4gICAgLy8gU2VlIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTQ4OTIwNiNjNFxuICAgIC8vIFdlIHVzZSB0aGUgZG9jdW1lbnRFbGVtZW50IGluc3RlYWQgb2YgdGhlIGJvZHkgYmVjYXVzZSwgYnkgZGVmYXVsdCAod2l0aG91dCBhIGNzcyByZXNldClcbiAgICAvLyBicm93c2VycyB0eXBpY2FsbHkgZ2l2ZSB0aGUgZG9jdW1lbnQgYm9keSBhbiA4cHggbWFyZ2luLCB3aGljaCBpcyBub3QgaW5jbHVkZWQgaW5cbiAgICAvLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5cbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHRoaXMuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IHRoaXMuZ2V0Vmlld3BvcnRTaXplKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG9wOiBzY3JvbGxQb3NpdGlvbi50b3AsXG4gICAgICBsZWZ0OiBzY3JvbGxQb3NpdGlvbi5sZWZ0LFxuICAgICAgYm90dG9tOiBzY3JvbGxQb3NpdGlvbi50b3AgKyBoZWlnaHQsXG4gICAgICByaWdodDogc2Nyb2xsUG9zaXRpb24ubGVmdCArIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgd2lkdGgsXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSAodG9wLCBsZWZ0KSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIHZpZXdwb3J0LiAqL1xuICBnZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCk6IFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24ge1xuICAgIC8vIFdoaWxlIHdlIGNhbiBnZXQgYSByZWZlcmVuY2UgdG8gdGhlIGZha2UgZG9jdW1lbnRcbiAgICAvLyBkdXJpbmcgU1NSLCBpdCBkb2Vzbid0IGhhdmUgZ2V0Qm91bmRpbmdDbGllbnRSZWN0LlxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICByZXR1cm4ge3RvcDogMCwgbGVmdDogMH07XG4gICAgfVxuXG4gICAgLy8gVGhlIHRvcC1sZWZ0LWNvcm5lciBvZiB0aGUgdmlld3BvcnQgaXMgZGV0ZXJtaW5lZCBieSB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSBkb2N1bWVudFxuICAgIC8vIGJvZHksIG5vcm1hbGx5IGp1c3QgKHNjcm9sbExlZnQsIHNjcm9sbFRvcCkuIEhvd2V2ZXIsIENocm9tZSBhbmQgRmlyZWZveCBkaXNhZ3JlZSBhYm91dFxuICAgIC8vIHdoZXRoZXIgYGRvY3VtZW50LmJvZHlgIG9yIGBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRgIGlzIHRoZSBzY3JvbGxlZCBlbGVtZW50LCBzbyByZWFkaW5nXG4gICAgLy8gYHNjcm9sbFRvcGAgYW5kIGBzY3JvbGxMZWZ0YCBpcyBpbmNvbnNpc3RlbnQuIEhvd2V2ZXIsIHVzaW5nIHRoZSBib3VuZGluZyByZWN0IG9mXG4gICAgLy8gYGRvY3VtZW50LmRvY3VtZW50RWxlbWVudGAgd29ya3MgY29uc2lzdGVudGx5LCB3aGVyZSB0aGUgYHRvcGAgYW5kIGBsZWZ0YCB2YWx1ZXMgd2lsbFxuICAgIC8vIGVxdWFsIG5lZ2F0aXZlIHRoZSBzY3JvbGwgcG9zaXRpb24uXG4gICAgY29uc3QgZG9jdW1lbnQgPSB0aGlzLl9kb2N1bWVudDtcbiAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcbiAgICBjb25zdCBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhO1xuICAgIGNvbnN0IGRvY3VtZW50UmVjdCA9IGRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGNvbnN0IHRvcCA9XG4gICAgICAtZG9jdW1lbnRSZWN0LnRvcCB8fFxuICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHxcbiAgICAgIHdpbmRvdy5zY3JvbGxZIHx8XG4gICAgICBkb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8XG4gICAgICAwO1xuXG4gICAgY29uc3QgbGVmdCA9XG4gICAgICAtZG9jdW1lbnRSZWN0LmxlZnQgfHxcbiAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCB8fFxuICAgICAgd2luZG93LnNjcm9sbFggfHxcbiAgICAgIGRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8XG4gICAgICAwO1xuXG4gICAgcmV0dXJuIHt0b3AsIGxlZnR9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgc2l6ZSBvZiB0aGUgdmlld3BvcnQgY2hhbmdlcy5cbiAgICogVGhpcyBzdHJlYW0gZW1pdHMgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgKiBAcGFyYW0gdGhyb3R0bGVUaW1lIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIHRoZSBzdHJlYW0uXG4gICAqL1xuICBjaGFuZ2UodGhyb3R0bGVUaW1lOiBudW1iZXIgPSBERUZBVUxUX1JFU0laRV9USU1FKTogT2JzZXJ2YWJsZTxFdmVudD4ge1xuICAgIHJldHVybiB0aHJvdHRsZVRpbWUgPiAwID8gdGhpcy5fY2hhbmdlLnBpcGUoYXVkaXRUaW1lKHRocm90dGxlVGltZSkpIDogdGhpcy5fY2hhbmdlO1xuICB9XG5cbiAgLyoqIFVzZSBkZWZhdWx0VmlldyBvZiBpbmplY3RlZCBkb2N1bWVudCBpZiBhdmFpbGFibGUgb3IgZmFsbGJhY2sgdG8gZ2xvYmFsIHdpbmRvdyByZWZlcmVuY2UgKi9cbiAgcHJpdmF0ZSBfZ2V0V2luZG93KCk6IFdpbmRvdyB7XG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdztcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBjYWNoZWQgdmlld3BvcnQgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVmlld3BvcnRTaXplKCkge1xuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xuICAgIHRoaXMuX3ZpZXdwb3J0U2l6ZSA9IHRoaXMuX3BsYXRmb3JtLmlzQnJvd3NlclxuICAgICAgPyB7d2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoLCBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodH1cbiAgICAgIDoge3dpZHRoOiAwLCBoZWlnaHQ6IDB9O1xuICB9XG59XG4iXX0=