/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, CSP_NONCE, Optional, Inject } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Global registry for all dynamically-created, injected media queries. */
const mediaQueriesForWebkitCompatibility = new Set();
/** Style tag that holds all of the dynamically-created media queries. */
let mediaQueryStyleNode;
/** A utility for calling matchMedia queries. */
export class MediaMatcher {
    constructor(_platform, _nonce) {
        this._platform = _platform;
        this._nonce = _nonce;
        this._matchMedia =
            this._platform.isBrowser && window.matchMedia
                ? // matchMedia is bound to the window scope intentionally as it is an illegal invocation to
                    // call it from a different scope.
                    window.matchMedia.bind(window)
                : noopMatchMedia;
    }
    /**
     * Evaluates the given media query and returns the native MediaQueryList from which results
     * can be retrieved.
     * Confirms the layout engine will trigger for the selector query provided and returns the
     * MediaQueryList for the query provided.
     */
    matchMedia(query) {
        if (this._platform.WEBKIT || this._platform.BLINK) {
            createEmptyStyleRule(query, this._nonce);
        }
        return this._matchMedia(query);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MediaMatcher, deps: [{ token: i1.Platform }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MediaMatcher, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MediaMatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Platform }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CSP_NONCE]
                }] }] });
/**
 * Creates an empty stylesheet that is used to work around browser inconsistencies related to
 * `matchMedia`. At the time of writing, it handles the following cases:
 * 1. On WebKit browsers, a media query has to have at least one rule in order for `matchMedia`
 * to fire. We work around it by declaring a dummy stylesheet with a `@media` declaration.
 * 2. In some cases Blink browsers will stop firing the `matchMedia` listener if none of the rules
 * inside the `@media` match existing elements on the page. We work around it by having one rule
 * targeting the `body`. See https://github.com/angular/components/issues/23546.
 */
function createEmptyStyleRule(query, nonce) {
    if (mediaQueriesForWebkitCompatibility.has(query)) {
        return;
    }
    try {
        if (!mediaQueryStyleNode) {
            mediaQueryStyleNode = document.createElement('style');
            if (nonce) {
                mediaQueryStyleNode.setAttribute('nonce', nonce);
            }
            mediaQueryStyleNode.setAttribute('type', 'text/css');
            document.head.appendChild(mediaQueryStyleNode);
        }
        if (mediaQueryStyleNode.sheet) {
            mediaQueryStyleNode.sheet.insertRule(`@media ${query} {body{ }}`, 0);
            mediaQueriesForWebkitCompatibility.add(query);
        }
    }
    catch (e) {
        console.error(e);
    }
}
/** No-op matchMedia replacement for non-browser platforms. */
function noopMatchMedia(query) {
    // Use `as any` here to avoid adding additional necessary properties for
    // the noop matcher.
    return {
        matches: query === 'all' || query === '',
        media: query,
        addListener: () => { },
        removeListener: () => { },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbWF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbGF5b3V0L21lZGlhLW1hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN0RSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7OztBQUUvQywyRUFBMkU7QUFDM0UsTUFBTSxrQ0FBa0MsR0FBZ0IsSUFBSSxHQUFHLEVBQVUsQ0FBQztBQUUxRSx5RUFBeUU7QUFDekUsSUFBSSxtQkFBaUQsQ0FBQztBQUV0RCxnREFBZ0Q7QUFFaEQsTUFBTSxPQUFPLFlBQVk7SUFJdkIsWUFDVSxTQUFtQixFQUNZLE1BQXNCO1FBRHJELGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDWSxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUU3RCxJQUFJLENBQUMsV0FBVztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUMzQyxDQUFDLENBQUMsMEZBQTBGO29CQUMxRixrQ0FBa0M7b0JBQ2xDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDaEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxVQUFVLENBQUMsS0FBYTtRQUN0QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEQsb0JBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7cUhBM0JVLFlBQVksMENBTUQsU0FBUzt5SEFOcEIsWUFBWSxjQURBLE1BQU07O2tHQUNsQixZQUFZO2tCQUR4QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBTzNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsU0FBUzs7QUF3QmpDOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxLQUFhLEVBQUUsS0FBZ0M7SUFDM0UsSUFBSSxrQ0FBa0MsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNsRCxPQUFPO0lBQ1QsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3pCLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDVixtQkFBbUIsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFFRCxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3JELFFBQVEsQ0FBQyxJQUFLLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELElBQUksbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDOUIsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEtBQUssWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDO0FBRUQsOERBQThEO0FBQzlELFNBQVMsY0FBYyxDQUFDLEtBQWE7SUFDbkMsd0VBQXdFO0lBQ3hFLG9CQUFvQjtJQUNwQixPQUFPO1FBQ0wsT0FBTyxFQUFFLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEVBQUU7UUFDeEMsS0FBSyxFQUFFLEtBQUs7UUFDWixXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQztRQUNyQixjQUFjLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQztLQUNsQixDQUFDO0FBQ1gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtJbmplY3RhYmxlLCBDU1BfTk9OQ0UsIE9wdGlvbmFsLCBJbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcblxuLyoqIEdsb2JhbCByZWdpc3RyeSBmb3IgYWxsIGR5bmFtaWNhbGx5LWNyZWF0ZWQsIGluamVjdGVkIG1lZGlhIHF1ZXJpZXMuICovXG5jb25zdCBtZWRpYVF1ZXJpZXNGb3JXZWJraXRDb21wYXRpYmlsaXR5OiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4vKiogU3R5bGUgdGFnIHRoYXQgaG9sZHMgYWxsIG9mIHRoZSBkeW5hbWljYWxseS1jcmVhdGVkIG1lZGlhIHF1ZXJpZXMuICovXG5sZXQgbWVkaWFRdWVyeVN0eWxlTm9kZTogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuLyoqIEEgdXRpbGl0eSBmb3IgY2FsbGluZyBtYXRjaE1lZGlhIHF1ZXJpZXMuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBNZWRpYU1hdGNoZXIge1xuICAvKiogVGhlIGludGVybmFsIG1hdGNoTWVkaWEgbWV0aG9kIHRvIHJldHVybiBiYWNrIGEgTWVkaWFRdWVyeUxpc3QgbGlrZSBvYmplY3QuICovXG4gIHByaXZhdGUgX21hdGNoTWVkaWE6IChxdWVyeTogc3RyaW5nKSA9PiBNZWRpYVF1ZXJ5TGlzdDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDU1BfTk9OQ0UpIHByaXZhdGUgX25vbmNlPzogc3RyaW5nIHwgbnVsbCxcbiAgKSB7XG4gICAgdGhpcy5fbWF0Y2hNZWRpYSA9XG4gICAgICB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgJiYgd2luZG93Lm1hdGNoTWVkaWFcbiAgICAgICAgPyAvLyBtYXRjaE1lZGlhIGlzIGJvdW5kIHRvIHRoZSB3aW5kb3cgc2NvcGUgaW50ZW50aW9uYWxseSBhcyBpdCBpcyBhbiBpbGxlZ2FsIGludm9jYXRpb24gdG9cbiAgICAgICAgICAvLyBjYWxsIGl0IGZyb20gYSBkaWZmZXJlbnQgc2NvcGUuXG4gICAgICAgICAgd2luZG93Lm1hdGNoTWVkaWEuYmluZCh3aW5kb3cpXG4gICAgICAgIDogbm9vcE1hdGNoTWVkaWE7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIHRoZSBnaXZlbiBtZWRpYSBxdWVyeSBhbmQgcmV0dXJucyB0aGUgbmF0aXZlIE1lZGlhUXVlcnlMaXN0IGZyb20gd2hpY2ggcmVzdWx0c1xuICAgKiBjYW4gYmUgcmV0cmlldmVkLlxuICAgKiBDb25maXJtcyB0aGUgbGF5b3V0IGVuZ2luZSB3aWxsIHRyaWdnZXIgZm9yIHRoZSBzZWxlY3RvciBxdWVyeSBwcm92aWRlZCBhbmQgcmV0dXJucyB0aGVcbiAgICogTWVkaWFRdWVyeUxpc3QgZm9yIHRoZSBxdWVyeSBwcm92aWRlZC5cbiAgICovXG4gIG1hdGNoTWVkaWEocXVlcnk6IHN0cmluZyk6IE1lZGlhUXVlcnlMaXN0IHtcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uV0VCS0lUIHx8IHRoaXMuX3BsYXRmb3JtLkJMSU5LKSB7XG4gICAgICBjcmVhdGVFbXB0eVN0eWxlUnVsZShxdWVyeSwgdGhpcy5fbm9uY2UpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbWF0Y2hNZWRpYShxdWVyeSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGVtcHR5IHN0eWxlc2hlZXQgdGhhdCBpcyB1c2VkIHRvIHdvcmsgYXJvdW5kIGJyb3dzZXIgaW5jb25zaXN0ZW5jaWVzIHJlbGF0ZWQgdG9cbiAqIGBtYXRjaE1lZGlhYC4gQXQgdGhlIHRpbWUgb2Ygd3JpdGluZywgaXQgaGFuZGxlcyB0aGUgZm9sbG93aW5nIGNhc2VzOlxuICogMS4gT24gV2ViS2l0IGJyb3dzZXJzLCBhIG1lZGlhIHF1ZXJ5IGhhcyB0byBoYXZlIGF0IGxlYXN0IG9uZSBydWxlIGluIG9yZGVyIGZvciBgbWF0Y2hNZWRpYWBcbiAqIHRvIGZpcmUuIFdlIHdvcmsgYXJvdW5kIGl0IGJ5IGRlY2xhcmluZyBhIGR1bW15IHN0eWxlc2hlZXQgd2l0aCBhIGBAbWVkaWFgIGRlY2xhcmF0aW9uLlxuICogMi4gSW4gc29tZSBjYXNlcyBCbGluayBicm93c2VycyB3aWxsIHN0b3AgZmlyaW5nIHRoZSBgbWF0Y2hNZWRpYWAgbGlzdGVuZXIgaWYgbm9uZSBvZiB0aGUgcnVsZXNcbiAqIGluc2lkZSB0aGUgYEBtZWRpYWAgbWF0Y2ggZXhpc3RpbmcgZWxlbWVudHMgb24gdGhlIHBhZ2UuIFdlIHdvcmsgYXJvdW5kIGl0IGJ5IGhhdmluZyBvbmUgcnVsZVxuICogdGFyZ2V0aW5nIHRoZSBgYm9keWAuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8yMzU0Ni5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRW1wdHlTdHlsZVJ1bGUocXVlcnk6IHN0cmluZywgbm9uY2U6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpIHtcbiAgaWYgKG1lZGlhUXVlcmllc0ZvcldlYmtpdENvbXBhdGliaWxpdHkuaGFzKHF1ZXJ5KSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKCFtZWRpYVF1ZXJ5U3R5bGVOb2RlKSB7XG4gICAgICBtZWRpYVF1ZXJ5U3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgICAgaWYgKG5vbmNlKSB7XG4gICAgICAgIG1lZGlhUXVlcnlTdHlsZU5vZGUuc2V0QXR0cmlidXRlKCdub25jZScsIG5vbmNlKTtcbiAgICAgIH1cblxuICAgICAgbWVkaWFRdWVyeVN0eWxlTm9kZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgIGRvY3VtZW50LmhlYWQhLmFwcGVuZENoaWxkKG1lZGlhUXVlcnlTdHlsZU5vZGUpO1xuICAgIH1cblxuICAgIGlmIChtZWRpYVF1ZXJ5U3R5bGVOb2RlLnNoZWV0KSB7XG4gICAgICBtZWRpYVF1ZXJ5U3R5bGVOb2RlLnNoZWV0Lmluc2VydFJ1bGUoYEBtZWRpYSAke3F1ZXJ5fSB7Ym9keXsgfX1gLCAwKTtcbiAgICAgIG1lZGlhUXVlcmllc0ZvcldlYmtpdENvbXBhdGliaWxpdHkuYWRkKHF1ZXJ5KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICB9XG59XG5cbi8qKiBOby1vcCBtYXRjaE1lZGlhIHJlcGxhY2VtZW50IGZvciBub24tYnJvd3NlciBwbGF0Zm9ybXMuICovXG5mdW5jdGlvbiBub29wTWF0Y2hNZWRpYShxdWVyeTogc3RyaW5nKTogTWVkaWFRdWVyeUxpc3Qge1xuICAvLyBVc2UgYGFzIGFueWAgaGVyZSB0byBhdm9pZCBhZGRpbmcgYWRkaXRpb25hbCBuZWNlc3NhcnkgcHJvcGVydGllcyBmb3JcbiAgLy8gdGhlIG5vb3AgbWF0Y2hlci5cbiAgcmV0dXJuIHtcbiAgICBtYXRjaGVzOiBxdWVyeSA9PT0gJ2FsbCcgfHwgcXVlcnkgPT09ICcnLFxuICAgIG1lZGlhOiBxdWVyeSxcbiAgICBhZGRMaXN0ZW5lcjogKCkgPT4ge30sXG4gICAgcmVtb3ZlTGlzdGVuZXI6ICgpID0+IHt9LFxuICB9IGFzIGFueTtcbn1cbiJdfQ==