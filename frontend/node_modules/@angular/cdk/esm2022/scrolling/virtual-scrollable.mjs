/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Directive, ElementRef, InjectionToken, NgZone, Optional } from '@angular/core';
import { ScrollDispatcher } from './scroll-dispatcher';
import { CdkScrollable } from './scrollable';
import * as i0 from "@angular/core";
import * as i1 from "./scroll-dispatcher";
import * as i2 from "@angular/cdk/bidi";
export const VIRTUAL_SCROLLABLE = new InjectionToken('VIRTUAL_SCROLLABLE');
/**
 * Extending the {@link CdkScrollable} to be used as scrolling container for virtual scrolling.
 */
export class CdkVirtualScrollable extends CdkScrollable {
    constructor(elementRef, scrollDispatcher, ngZone, dir) {
        super(elementRef, scrollDispatcher, ngZone, dir);
    }
    /**
     * Measure the viewport size for the provided orientation.
     *
     * @param orientation The orientation to measure the size from.
     */
    measureViewportSize(orientation) {
        const viewportEl = this.elementRef.nativeElement;
        return orientation === 'horizontal' ? viewportEl.clientWidth : viewportEl.clientHeight;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkVirtualScrollable, deps: [{ token: i0.ElementRef }, { token: i1.ScrollDispatcher }, { token: i0.NgZone }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkVirtualScrollable, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkVirtualScrollable, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.ScrollDispatcher }, { type: i0.NgZone }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGxhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY3JvbGxpbmcvdmlydHVhbC1zY3JvbGxhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7O0FBRTNDLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksY0FBYyxDQUF1QixvQkFBb0IsQ0FBQyxDQUFDO0FBRWpHOztHQUVHO0FBRUgsTUFBTSxPQUFnQixvQkFBcUIsU0FBUSxhQUFhO0lBQzlELFlBQ0UsVUFBbUMsRUFDbkMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDRixHQUFvQjtRQUVoQyxLQUFLLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILG1CQUFtQixDQUFDLFdBQXNDO1FBQ3hELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ2pELE9BQU8sV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztJQUN6RixDQUFDO3FIQWxCbUIsb0JBQW9CO3lHQUFwQixvQkFBb0I7O2tHQUFwQixvQkFBb0I7a0JBRHpDLFNBQVM7OzBCQU1MLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U2Nyb2xsRGlzcGF0Y2hlcn0gZnJvbSAnLi9zY3JvbGwtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0Nka1Njcm9sbGFibGV9IGZyb20gJy4vc2Nyb2xsYWJsZSc7XG5cbmV4cG9ydCBjb25zdCBWSVJUVUFMX1NDUk9MTEFCTEUgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrVmlydHVhbFNjcm9sbGFibGU+KCdWSVJUVUFMX1NDUk9MTEFCTEUnKTtcblxuLyoqXG4gKiBFeHRlbmRpbmcgdGhlIHtAbGluayBDZGtTY3JvbGxhYmxlfSB0byBiZSB1c2VkIGFzIHNjcm9sbGluZyBjb250YWluZXIgZm9yIHZpcnR1YWwgc2Nyb2xsaW5nLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDZGtWaXJ0dWFsU2Nyb2xsYWJsZSBleHRlbmRzIENka1Njcm9sbGFibGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxuICAgIG5nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBzY3JvbGxEaXNwYXRjaGVyLCBuZ1pvbmUsIGRpcik7XG4gIH1cblxuICAvKipcbiAgICogTWVhc3VyZSB0aGUgdmlld3BvcnQgc2l6ZSBmb3IgdGhlIHByb3ZpZGVkIG9yaWVudGF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gb3JpZW50YXRpb24gVGhlIG9yaWVudGF0aW9uIHRvIG1lYXN1cmUgdGhlIHNpemUgZnJvbS5cbiAgICovXG4gIG1lYXN1cmVWaWV3cG9ydFNpemUob3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcpIHtcbiAgICBjb25zdCB2aWV3cG9ydEVsID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyB2aWV3cG9ydEVsLmNsaWVudFdpZHRoIDogdmlld3BvcnRFbC5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogTWVhc3VyZSB0aGUgYm91bmRpbmcgRE9NUmVjdCBzaXplIGluY2x1ZGluZyB0aGUgc2Nyb2xsIG9mZnNldC5cbiAgICpcbiAgICogQHBhcmFtIGZyb20gVGhlIGVkZ2UgdG8gbWVhc3VyZSBmcm9tLlxuICAgKi9cbiAgYWJzdHJhY3QgbWVhc3VyZUJvdW5kaW5nQ2xpZW50UmVjdFdpdGhTY3JvbGxPZmZzZXQoXG4gICAgZnJvbTogJ2xlZnQnIHwgJ3RvcCcgfCAncmlnaHQnIHwgJ2JvdHRvbScsXG4gICk6IG51bWJlcjtcbn1cbiJdfQ==