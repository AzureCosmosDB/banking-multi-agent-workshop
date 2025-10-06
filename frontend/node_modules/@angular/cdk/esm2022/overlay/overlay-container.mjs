/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Platform, _isTestEnvironment } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Container inside which all overlays will render. */
export class OverlayContainer {
    constructor(document, _platform) {
        this._platform = _platform;
        this._document = document;
    }
    ngOnDestroy() {
        this._containerElement?.remove();
    }
    /**
     * This method returns the overlay container element. It will lazily
     * create the element the first time it is called to facilitate using
     * the container in non-browser environments.
     * @returns the container element
     */
    getContainerElement() {
        if (!this._containerElement) {
            this._createContainer();
        }
        return this._containerElement;
    }
    /**
     * Create the overlay container element, which is simply a div
     * with the 'cdk-overlay-container' class on the document body.
     */
    _createContainer() {
        const containerClass = 'cdk-overlay-container';
        // TODO(crisbeto): remove the testing check once we have an overlay testing
        // module or Angular starts tearing down the testing `NgModule`. See:
        // https://github.com/angular/angular/issues/18831
        if (this._platform.isBrowser || _isTestEnvironment()) {
            const oppositePlatformContainers = this._document.querySelectorAll(`.${containerClass}[platform="server"], ` + `.${containerClass}[platform="test"]`);
            // Remove any old containers from the opposite platform.
            // This can happen when transitioning from the server to the client.
            for (let i = 0; i < oppositePlatformContainers.length; i++) {
                oppositePlatformContainers[i].remove();
            }
        }
        const container = this._document.createElement('div');
        container.classList.add(containerClass);
        // A long time ago we kept adding new overlay containers whenever a new app was instantiated,
        // but at some point we added logic which clears the duplicate ones in order to avoid leaks.
        // The new logic was a little too aggressive since it was breaking some legitimate use cases.
        // To mitigate the problem we made it so that only containers from a different platform are
        // cleared, but the side-effect was that people started depending on the overly-aggressive
        // logic to clean up their tests for them. Until we can introduce an overlay-specific testing
        // module which does the cleanup, we try to detect that we're in a test environment and we
        // always clear the container. See #17006.
        // TODO(crisbeto): remove the test environment check once we have an overlay testing module.
        if (_isTestEnvironment()) {
            container.setAttribute('platform', 'test');
        }
        else if (!this._platform.isBrowser) {
            container.setAttribute('platform', 'server');
        }
        this._document.body.appendChild(container);
        this._containerElement = container;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: OverlayContainer, deps: [{ token: DOCUMENT }, { token: i1.Platform }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: OverlayContainer, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: OverlayContainer, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.Platform }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1jb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvb3ZlcmxheS1jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7O0FBRW5FLHVEQUF1RDtBQUV2RCxNQUFNLE9BQU8sZ0JBQWdCO0lBSTNCLFlBQ29CLFFBQWEsRUFDckIsU0FBbUI7UUFBbkIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUU3QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sZ0JBQWdCO1FBQ3hCLE1BQU0sY0FBYyxHQUFHLHVCQUF1QixDQUFDO1FBRS9DLDJFQUEyRTtRQUMzRSxxRUFBcUU7UUFDckUsa0RBQWtEO1FBQ2xELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1lBQ3JELE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FDaEUsSUFBSSxjQUFjLHVCQUF1QixHQUFHLElBQUksY0FBYyxtQkFBbUIsQ0FDbEYsQ0FBQztZQUVGLHdEQUF3RDtZQUN4RCxvRUFBb0U7WUFDcEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDBCQUEwQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMzRCwwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6QyxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRXhDLDZGQUE2RjtRQUM3Riw0RkFBNEY7UUFDNUYsNkZBQTZGO1FBQzdGLDJGQUEyRjtRQUMzRiwwRkFBMEY7UUFDMUYsNkZBQTZGO1FBQzdGLDBGQUEwRjtRQUMxRiwwQ0FBMEM7UUFDMUMsNEZBQTRGO1FBQzVGLElBQUksa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1lBQ3pCLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLENBQUM7YUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQyxTQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7SUFDckMsQ0FBQztxSEF2RVUsZ0JBQWdCLGtCQUtqQixRQUFRO3lIQUxQLGdCQUFnQixjQURKLE1BQU07O2tHQUNsQixnQkFBZ0I7a0JBRDVCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFNM0IsTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UGxhdGZvcm0sIF9pc1Rlc3RFbnZpcm9ubWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcblxuLyoqIENvbnRhaW5lciBpbnNpZGUgd2hpY2ggYWxsIG92ZXJsYXlzIHdpbGwgcmVuZGVyLiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgT3ZlcmxheUNvbnRhaW5lciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCBfY29udGFpbmVyRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHByb3RlY3RlZCBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnksXG4gICAgcHJvdGVjdGVkIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG4gICkge1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9jb250YWluZXJFbGVtZW50Py5yZW1vdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBvdmVybGF5IGNvbnRhaW5lciBlbGVtZW50LiBJdCB3aWxsIGxhemlseVxuICAgKiBjcmVhdGUgdGhlIGVsZW1lbnQgdGhlIGZpcnN0IHRpbWUgaXQgaXMgY2FsbGVkIHRvIGZhY2lsaXRhdGUgdXNpbmdcbiAgICogdGhlIGNvbnRhaW5lciBpbiBub24tYnJvd3NlciBlbnZpcm9ubWVudHMuXG4gICAqIEByZXR1cm5zIHRoZSBjb250YWluZXIgZWxlbWVudFxuICAgKi9cbiAgZ2V0Q29udGFpbmVyRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgaWYgKCF0aGlzLl9jb250YWluZXJFbGVtZW50KSB7XG4gICAgICB0aGlzLl9jcmVhdGVDb250YWluZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyRWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdGhlIG92ZXJsYXkgY29udGFpbmVyIGVsZW1lbnQsIHdoaWNoIGlzIHNpbXBseSBhIGRpdlxuICAgKiB3aXRoIHRoZSAnY2RrLW92ZXJsYXktY29udGFpbmVyJyBjbGFzcyBvbiB0aGUgZG9jdW1lbnQgYm9keS5cbiAgICovXG4gIHByb3RlY3RlZCBfY3JlYXRlQ29udGFpbmVyKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzID0gJ2Nkay1vdmVybGF5LWNvbnRhaW5lcic7XG5cbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIHRoZSB0ZXN0aW5nIGNoZWNrIG9uY2Ugd2UgaGF2ZSBhbiBvdmVybGF5IHRlc3RpbmdcbiAgICAvLyBtb2R1bGUgb3IgQW5ndWxhciBzdGFydHMgdGVhcmluZyBkb3duIHRoZSB0ZXN0aW5nIGBOZ01vZHVsZWAuIFNlZTpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xODgzMVxuICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgfHwgX2lzVGVzdEVudmlyb25tZW50KCkpIHtcbiAgICAgIGNvbnN0IG9wcG9zaXRlUGxhdGZvcm1Db250YWluZXJzID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYC4ke2NvbnRhaW5lckNsYXNzfVtwbGF0Zm9ybT1cInNlcnZlclwiXSwgYCArIGAuJHtjb250YWluZXJDbGFzc31bcGxhdGZvcm09XCJ0ZXN0XCJdYCxcbiAgICAgICk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgb2xkIGNvbnRhaW5lcnMgZnJvbSB0aGUgb3Bwb3NpdGUgcGxhdGZvcm0uXG4gICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gd2hlbiB0cmFuc2l0aW9uaW5nIGZyb20gdGhlIHNlcnZlciB0byB0aGUgY2xpZW50LlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHBvc2l0ZVBsYXRmb3JtQ29udGFpbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvcHBvc2l0ZVBsYXRmb3JtQ29udGFpbmVyc1tpXS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZChjb250YWluZXJDbGFzcyk7XG5cbiAgICAvLyBBIGxvbmcgdGltZSBhZ28gd2Uga2VwdCBhZGRpbmcgbmV3IG92ZXJsYXkgY29udGFpbmVycyB3aGVuZXZlciBhIG5ldyBhcHAgd2FzIGluc3RhbnRpYXRlZCxcbiAgICAvLyBidXQgYXQgc29tZSBwb2ludCB3ZSBhZGRlZCBsb2dpYyB3aGljaCBjbGVhcnMgdGhlIGR1cGxpY2F0ZSBvbmVzIGluIG9yZGVyIHRvIGF2b2lkIGxlYWtzLlxuICAgIC8vIFRoZSBuZXcgbG9naWMgd2FzIGEgbGl0dGxlIHRvbyBhZ2dyZXNzaXZlIHNpbmNlIGl0IHdhcyBicmVha2luZyBzb21lIGxlZ2l0aW1hdGUgdXNlIGNhc2VzLlxuICAgIC8vIFRvIG1pdGlnYXRlIHRoZSBwcm9ibGVtIHdlIG1hZGUgaXQgc28gdGhhdCBvbmx5IGNvbnRhaW5lcnMgZnJvbSBhIGRpZmZlcmVudCBwbGF0Zm9ybSBhcmVcbiAgICAvLyBjbGVhcmVkLCBidXQgdGhlIHNpZGUtZWZmZWN0IHdhcyB0aGF0IHBlb3BsZSBzdGFydGVkIGRlcGVuZGluZyBvbiB0aGUgb3Zlcmx5LWFnZ3Jlc3NpdmVcbiAgICAvLyBsb2dpYyB0byBjbGVhbiB1cCB0aGVpciB0ZXN0cyBmb3IgdGhlbS4gVW50aWwgd2UgY2FuIGludHJvZHVjZSBhbiBvdmVybGF5LXNwZWNpZmljIHRlc3RpbmdcbiAgICAvLyBtb2R1bGUgd2hpY2ggZG9lcyB0aGUgY2xlYW51cCwgd2UgdHJ5IHRvIGRldGVjdCB0aGF0IHdlJ3JlIGluIGEgdGVzdCBlbnZpcm9ubWVudCBhbmQgd2VcbiAgICAvLyBhbHdheXMgY2xlYXIgdGhlIGNvbnRhaW5lci4gU2VlICMxNzAwNi5cbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIHRoZSB0ZXN0IGVudmlyb25tZW50IGNoZWNrIG9uY2Ugd2UgaGF2ZSBhbiBvdmVybGF5IHRlc3RpbmcgbW9kdWxlLlxuICAgIGlmIChfaXNUZXN0RW52aXJvbm1lbnQoKSkge1xuICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgncGxhdGZvcm0nLCAndGVzdCcpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgncGxhdGZvcm0nLCAnc2VydmVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIHRoaXMuX2NvbnRhaW5lckVsZW1lbnQgPSBjb250YWluZXI7XG4gIH1cbn1cbiJdfQ==