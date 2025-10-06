/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { supportsScrollBehavior } from '@angular/cdk/platform';
const scrollBehaviorSupported = supportsScrollBehavior();
/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy {
    constructor(_viewportRuler, document) {
        this._viewportRuler = _viewportRuler;
        this._previousHTMLStyles = { top: '', left: '' };
        this._isEnabled = false;
        this._document = document;
    }
    /** Attaches this scroll strategy to an overlay. */
    attach() { }
    /** Blocks page-level scroll while the attached overlay is open. */
    enable() {
        if (this._canBeEnabled()) {
            const root = this._document.documentElement;
            this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();
            // Cache the previous inline styles in case the user had set them.
            this._previousHTMLStyles.left = root.style.left || '';
            this._previousHTMLStyles.top = root.style.top || '';
            // Note: we're using the `html` node, instead of the `body`, because the `body` may
            // have the user agent margin, whereas the `html` is guaranteed not to have one.
            root.style.left = coerceCssPixelValue(-this._previousScrollPosition.left);
            root.style.top = coerceCssPixelValue(-this._previousScrollPosition.top);
            root.classList.add('cdk-global-scrollblock');
            this._isEnabled = true;
        }
    }
    /** Unblocks page-level scroll while the attached overlay is open. */
    disable() {
        if (this._isEnabled) {
            const html = this._document.documentElement;
            const body = this._document.body;
            const htmlStyle = html.style;
            const bodyStyle = body.style;
            const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
            const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';
            this._isEnabled = false;
            htmlStyle.left = this._previousHTMLStyles.left;
            htmlStyle.top = this._previousHTMLStyles.top;
            html.classList.remove('cdk-global-scrollblock');
            // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
            // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
            // Note that we don't mutate the property if the browser doesn't support `scroll-behavior`,
            // because it can throw off feature detections in `supportsScrollBehavior` which
            // checks for `'scrollBehavior' in documentElement.style`.
            if (scrollBehaviorSupported) {
                htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';
            }
            window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);
            if (scrollBehaviorSupported) {
                htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
                bodyStyle.scrollBehavior = previousBodyScrollBehavior;
            }
        }
    }
    _canBeEnabled() {
        // Since the scroll strategies can't be singletons, we have to use a global CSS class
        // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
        // scrolling multiple times.
        const html = this._document.documentElement;
        if (html.classList.contains('cdk-global-scrollblock') || this._isEnabled) {
            return false;
        }
        const body = this._document.body;
        const viewport = this._viewportRuler.getViewportSize();
        return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2stc2Nyb2xsLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Njcm9sbC9ibG9jay1zY3JvbGwtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFN0QsTUFBTSx1QkFBdUIsR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0FBRXpEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQU05QixZQUNVLGNBQTZCLEVBQ3JDLFFBQWE7UUFETCxtQkFBYyxHQUFkLGNBQWMsQ0FBZTtRQU4vQix3QkFBbUIsR0FBRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO1FBRTFDLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFPekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxNQUFNLEtBQUksQ0FBQztJQUVYLG1FQUFtRTtJQUNuRSxNQUFNO1FBQ0osSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQztZQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWdCLENBQUM7WUFFN0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUUvRSxrRUFBa0U7WUFDbEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDdEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFFcEQsbUZBQW1GO1lBQ25GLGdGQUFnRjtZQUNoRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWdCLENBQUM7WUFDN0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFLLENBQUM7WUFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzdCLE1BQU0sMEJBQTBCLEdBQUcsU0FBUyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7WUFDbEUsTUFBTSwwQkFBMEIsR0FBRyxTQUFTLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztZQUVsRSxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUV4QixTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDL0MsU0FBUyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFFaEQsMEZBQTBGO1lBQzFGLHVFQUF1RTtZQUN2RSwyRkFBMkY7WUFDM0YsZ0ZBQWdGO1lBQ2hGLDBEQUEwRDtZQUMxRCxJQUFJLHVCQUF1QixFQUFFLENBQUM7Z0JBQzVCLFNBQVMsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7WUFDL0QsQ0FBQztZQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFbkYsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO2dCQUM1QixTQUFTLENBQUMsY0FBYyxHQUFHLDBCQUEwQixDQUFDO2dCQUN0RCxTQUFTLENBQUMsY0FBYyxHQUFHLDBCQUEwQixDQUFDO1lBQ3hELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLGFBQWE7UUFDbkIscUZBQXFGO1FBQ3JGLDhFQUE4RTtRQUM5RSw0QkFBNEI7UUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFnQixDQUFDO1FBRTdDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekUsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDakMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2RCxPQUFPLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDbEYsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vc2Nyb2xsLXN0cmF0ZWd5JztcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge2NvZXJjZUNzc1BpeGVsVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge3N1cHBvcnRzU2Nyb2xsQmVoYXZpb3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5cbmNvbnN0IHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gc3VwcG9ydHNTY3JvbGxCZWhhdmlvcigpO1xuXG4vKipcbiAqIFN0cmF0ZWd5IHRoYXQgd2lsbCBwcmV2ZW50IHRoZSB1c2VyIGZyb20gc2Nyb2xsaW5nIHdoaWxlIHRoZSBvdmVybGF5IGlzIHZpc2libGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBCbG9ja1Njcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgU2Nyb2xsU3RyYXRlZ3kge1xuICBwcml2YXRlIF9wcmV2aW91c0hUTUxTdHlsZXMgPSB7dG9wOiAnJywgbGVmdDogJyd9O1xuICBwcml2YXRlIF9wcmV2aW91c1Njcm9sbFBvc2l0aW9uOiB7dG9wOiBudW1iZXI7IGxlZnQ6IG51bWJlcn07XG4gIHByaXZhdGUgX2lzRW5hYmxlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcbiAgICBkb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuICB9XG5cbiAgLyoqIEF0dGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IHRvIGFuIG92ZXJsYXkuICovXG4gIGF0dGFjaCgpIHt9XG5cbiAgLyoqIEJsb2NrcyBwYWdlLWxldmVsIHNjcm9sbCB3aGlsZSB0aGUgYXR0YWNoZWQgb3ZlcmxheSBpcyBvcGVuLiAqL1xuICBlbmFibGUoKSB7XG4gICAgaWYgKHRoaXMuX2NhbkJlRW5hYmxlZCgpKSB7XG4gICAgICBjb25zdCByb290ID0gdGhpcy5fZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ITtcblxuICAgICAgdGhpcy5fcHJldmlvdXNTY3JvbGxQb3NpdGlvbiA9IHRoaXMuX3ZpZXdwb3J0UnVsZXIuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xuXG4gICAgICAvLyBDYWNoZSB0aGUgcHJldmlvdXMgaW5saW5lIHN0eWxlcyBpbiBjYXNlIHRoZSB1c2VyIGhhZCBzZXQgdGhlbS5cbiAgICAgIHRoaXMuX3ByZXZpb3VzSFRNTFN0eWxlcy5sZWZ0ID0gcm9vdC5zdHlsZS5sZWZ0IHx8ICcnO1xuICAgICAgdGhpcy5fcHJldmlvdXNIVE1MU3R5bGVzLnRvcCA9IHJvb3Quc3R5bGUudG9wIHx8ICcnO1xuXG4gICAgICAvLyBOb3RlOiB3ZSdyZSB1c2luZyB0aGUgYGh0bWxgIG5vZGUsIGluc3RlYWQgb2YgdGhlIGBib2R5YCwgYmVjYXVzZSB0aGUgYGJvZHlgIG1heVxuICAgICAgLy8gaGF2ZSB0aGUgdXNlciBhZ2VudCBtYXJnaW4sIHdoZXJlYXMgdGhlIGBodG1sYCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG9uZS5cbiAgICAgIHJvb3Quc3R5bGUubGVmdCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoLXRoaXMuX3ByZXZpb3VzU2Nyb2xsUG9zaXRpb24ubGVmdCk7XG4gICAgICByb290LnN0eWxlLnRvcCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoLXRoaXMuX3ByZXZpb3VzU2Nyb2xsUG9zaXRpb24udG9wKTtcbiAgICAgIHJvb3QuY2xhc3NMaXN0LmFkZCgnY2RrLWdsb2JhbC1zY3JvbGxibG9jaycpO1xuICAgICAgdGhpcy5faXNFbmFibGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogVW5ibG9ja3MgcGFnZS1sZXZlbCBzY3JvbGwgd2hpbGUgdGhlIGF0dGFjaGVkIG92ZXJsYXkgaXMgb3Blbi4gKi9cbiAgZGlzYWJsZSgpIHtcbiAgICBpZiAodGhpcy5faXNFbmFibGVkKSB7XG4gICAgICBjb25zdCBodG1sID0gdGhpcy5fZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ITtcbiAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLl9kb2N1bWVudC5ib2R5ITtcbiAgICAgIGNvbnN0IGh0bWxTdHlsZSA9IGh0bWwuc3R5bGU7XG4gICAgICBjb25zdCBib2R5U3R5bGUgPSBib2R5LnN0eWxlO1xuICAgICAgY29uc3QgcHJldmlvdXNIdG1sU2Nyb2xsQmVoYXZpb3IgPSBodG1sU3R5bGUuc2Nyb2xsQmVoYXZpb3IgfHwgJyc7XG4gICAgICBjb25zdCBwcmV2aW91c0JvZHlTY3JvbGxCZWhhdmlvciA9IGJvZHlTdHlsZS5zY3JvbGxCZWhhdmlvciB8fCAnJztcblxuICAgICAgdGhpcy5faXNFbmFibGVkID0gZmFsc2U7XG5cbiAgICAgIGh0bWxTdHlsZS5sZWZ0ID0gdGhpcy5fcHJldmlvdXNIVE1MU3R5bGVzLmxlZnQ7XG4gICAgICBodG1sU3R5bGUudG9wID0gdGhpcy5fcHJldmlvdXNIVE1MU3R5bGVzLnRvcDtcbiAgICAgIGh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnY2RrLWdsb2JhbC1zY3JvbGxibG9jaycpO1xuXG4gICAgICAvLyBEaXNhYmxlIHVzZXItZGVmaW5lZCBzbW9vdGggc2Nyb2xsaW5nIHRlbXBvcmFyaWx5IHdoaWxlIHdlIHJlc3RvcmUgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1Mvc2Nyb2xsLWJlaGF2aW9yXG4gICAgICAvLyBOb3RlIHRoYXQgd2UgZG9uJ3QgbXV0YXRlIHRoZSBwcm9wZXJ0eSBpZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgYHNjcm9sbC1iZWhhdmlvcmAsXG4gICAgICAvLyBiZWNhdXNlIGl0IGNhbiB0aHJvdyBvZmYgZmVhdHVyZSBkZXRlY3Rpb25zIGluIGBzdXBwb3J0c1Njcm9sbEJlaGF2aW9yYCB3aGljaFxuICAgICAgLy8gY2hlY2tzIGZvciBgJ3Njcm9sbEJlaGF2aW9yJyBpbiBkb2N1bWVudEVsZW1lbnQuc3R5bGVgLlxuICAgICAgaWYgKHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkKSB7XG4gICAgICAgIGh0bWxTdHlsZS5zY3JvbGxCZWhhdmlvciA9IGJvZHlTdHlsZS5zY3JvbGxCZWhhdmlvciA9ICdhdXRvJztcbiAgICAgIH1cblxuICAgICAgd2luZG93LnNjcm9sbCh0aGlzLl9wcmV2aW91c1Njcm9sbFBvc2l0aW9uLmxlZnQsIHRoaXMuX3ByZXZpb3VzU2Nyb2xsUG9zaXRpb24udG9wKTtcblxuICAgICAgaWYgKHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkKSB7XG4gICAgICAgIGh0bWxTdHlsZS5zY3JvbGxCZWhhdmlvciA9IHByZXZpb3VzSHRtbFNjcm9sbEJlaGF2aW9yO1xuICAgICAgICBib2R5U3R5bGUuc2Nyb2xsQmVoYXZpb3IgPSBwcmV2aW91c0JvZHlTY3JvbGxCZWhhdmlvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jYW5CZUVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgLy8gU2luY2UgdGhlIHNjcm9sbCBzdHJhdGVnaWVzIGNhbid0IGJlIHNpbmdsZXRvbnMsIHdlIGhhdmUgdG8gdXNlIGEgZ2xvYmFsIENTUyBjbGFzc1xuICAgIC8vIChgY2RrLWdsb2JhbC1zY3JvbGxibG9ja2ApIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGRvbid0IHRyeSB0byBkaXNhYmxlIGdsb2JhbFxuICAgIC8vIHNjcm9sbGluZyBtdWx0aXBsZSB0aW1lcy5cbiAgICBjb25zdCBodG1sID0gdGhpcy5fZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ITtcblxuICAgIGlmIChodG1sLmNsYXNzTGlzdC5jb250YWlucygnY2RrLWdsb2JhbC1zY3JvbGxibG9jaycpIHx8IHRoaXMuX2lzRW5hYmxlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLl9kb2N1bWVudC5ib2R5O1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnRSdWxlci5nZXRWaWV3cG9ydFNpemUoKTtcbiAgICByZXR1cm4gYm9keS5zY3JvbGxIZWlnaHQgPiB2aWV3cG9ydC5oZWlnaHQgfHwgYm9keS5zY3JvbGxXaWR0aCA+IHZpZXdwb3J0LndpZHRoO1xuICB9XG59XG4iXX0=