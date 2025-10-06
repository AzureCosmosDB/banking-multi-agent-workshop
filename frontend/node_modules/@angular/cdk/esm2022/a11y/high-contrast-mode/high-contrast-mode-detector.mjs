/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Inject, Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Set of possible high-contrast mode backgrounds. */
export var HighContrastMode;
(function (HighContrastMode) {
    HighContrastMode[HighContrastMode["NONE"] = 0] = "NONE";
    HighContrastMode[HighContrastMode["BLACK_ON_WHITE"] = 1] = "BLACK_ON_WHITE";
    HighContrastMode[HighContrastMode["WHITE_ON_BLACK"] = 2] = "WHITE_ON_BLACK";
})(HighContrastMode || (HighContrastMode = {}));
/** CSS class applied to the document body when in black-on-white high-contrast mode. */
export const BLACK_ON_WHITE_CSS_CLASS = 'cdk-high-contrast-black-on-white';
/** CSS class applied to the document body when in white-on-black high-contrast mode. */
export const WHITE_ON_BLACK_CSS_CLASS = 'cdk-high-contrast-white-on-black';
/** CSS class applied to the document body when in high-contrast mode. */
export const HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS = 'cdk-high-contrast-active';
/**
 * Service to determine whether the browser is currently in a high-contrast-mode environment.
 *
 * Microsoft Windows supports an accessibility feature called "High Contrast Mode". This mode
 * changes the appearance of all applications, including web applications, to dramatically increase
 * contrast.
 *
 * IE, Edge, and Firefox currently support this mode. Chrome does not support Windows High Contrast
 * Mode. This service does not detect high-contrast mode as added by the Chrome "High Contrast"
 * browser extension.
 */
export class HighContrastModeDetector {
    constructor(_platform, document) {
        this._platform = _platform;
        this._document = document;
        this._breakpointSubscription = inject(BreakpointObserver)
            .observe('(forced-colors: active)')
            .subscribe(() => {
            if (this._hasCheckedHighContrastMode) {
                this._hasCheckedHighContrastMode = false;
                this._applyBodyHighContrastModeCssClasses();
            }
        });
    }
    /** Gets the current high-contrast-mode for the page. */
    getHighContrastMode() {
        if (!this._platform.isBrowser) {
            return HighContrastMode.NONE;
        }
        // Create a test element with an arbitrary background-color that is neither black nor
        // white; high-contrast mode will coerce the color to either black or white. Also ensure that
        // appending the test element to the DOM does not affect layout by absolutely positioning it
        const testElement = this._document.createElement('div');
        testElement.style.backgroundColor = 'rgb(1,2,3)';
        testElement.style.position = 'absolute';
        this._document.body.appendChild(testElement);
        // Get the computed style for the background color, collapsing spaces to normalize between
        // browsers. Once we get this color, we no longer need the test element. Access the `window`
        // via the document so we can fake it in tests. Note that we have extra null checks, because
        // this logic will likely run during app bootstrap and throwing can break the entire app.
        const documentWindow = this._document.defaultView || window;
        const computedStyle = documentWindow && documentWindow.getComputedStyle
            ? documentWindow.getComputedStyle(testElement)
            : null;
        const computedColor = ((computedStyle && computedStyle.backgroundColor) || '').replace(/ /g, '');
        testElement.remove();
        switch (computedColor) {
            // Pre Windows 11 dark theme.
            case 'rgb(0,0,0)':
            // Windows 11 dark themes.
            case 'rgb(45,50,54)':
            case 'rgb(32,32,32)':
                return HighContrastMode.WHITE_ON_BLACK;
            // Pre Windows 11 light theme.
            case 'rgb(255,255,255)':
            // Windows 11 light theme.
            case 'rgb(255,250,239)':
                return HighContrastMode.BLACK_ON_WHITE;
        }
        return HighContrastMode.NONE;
    }
    ngOnDestroy() {
        this._breakpointSubscription.unsubscribe();
    }
    /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
    _applyBodyHighContrastModeCssClasses() {
        if (!this._hasCheckedHighContrastMode && this._platform.isBrowser && this._document.body) {
            const bodyClasses = this._document.body.classList;
            bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
            this._hasCheckedHighContrastMode = true;
            const mode = this.getHighContrastMode();
            if (mode === HighContrastMode.BLACK_ON_WHITE) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS);
            }
            else if (mode === HighContrastMode.WHITE_ON_BLACK) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: HighContrastModeDetector, deps: [{ token: i1.Platform }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: HighContrastModeDetector, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: HighContrastModeDetector, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Platform }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaC1jb250cmFzdC1tb2RlLWRldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2hpZ2gtY29udHJhc3QtbW9kZS9oaWdoLWNvbnRyYXN0LW1vZGUtZGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3BFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQUd6QyxzREFBc0Q7QUFDdEQsTUFBTSxDQUFOLElBQVksZ0JBSVg7QUFKRCxXQUFZLGdCQUFnQjtJQUMxQix1REFBSSxDQUFBO0lBQ0osMkVBQWMsQ0FBQTtJQUNkLDJFQUFjLENBQUE7QUFDaEIsQ0FBQyxFQUpXLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFJM0I7QUFFRCx3RkFBd0Y7QUFDeEYsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsa0NBQWtDLENBQUM7QUFFM0Usd0ZBQXdGO0FBQ3hGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLGtDQUFrQyxDQUFDO0FBRTNFLHlFQUF5RTtBQUN6RSxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRywwQkFBMEIsQ0FBQztBQUU5RTs7Ozs7Ozs7OztHQVVHO0FBRUgsTUFBTSxPQUFPLHdCQUF3QjtJQVNuQyxZQUNVLFNBQW1CLEVBQ1QsUUFBYTtRQUR2QixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBRzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBRTFCLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUM7YUFDdEQsT0FBTyxDQUFDLHlCQUF5QixDQUFDO2FBQ2xDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsS0FBSyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQztZQUM5QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELG1CQUFtQjtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5QixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQztRQUMvQixDQUFDO1FBRUQscUZBQXFGO1FBQ3JGLDZGQUE2RjtRQUM3Riw0RkFBNEY7UUFDNUYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsV0FBVyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsWUFBWSxDQUFDO1FBQ2pELFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFN0MsMEZBQTBGO1FBQzFGLDRGQUE0RjtRQUM1Riw0RkFBNEY7UUFDNUYseUZBQXlGO1FBQ3pGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQztRQUM1RCxNQUFNLGFBQWEsR0FDakIsY0FBYyxJQUFJLGNBQWMsQ0FBQyxnQkFBZ0I7WUFDL0MsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7WUFDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNYLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FDcEYsSUFBSSxFQUNKLEVBQUUsQ0FDSCxDQUFDO1FBQ0YsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRXJCLFFBQVEsYUFBYSxFQUFFLENBQUM7WUFDdEIsNkJBQTZCO1lBQzdCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLDBCQUEwQjtZQUMxQixLQUFLLGVBQWUsQ0FBQztZQUNyQixLQUFLLGVBQWU7Z0JBQ2xCLE9BQU8sZ0JBQWdCLENBQUMsY0FBYyxDQUFDO1lBQ3pDLDhCQUE4QjtZQUM5QixLQUFLLGtCQUFrQixDQUFDO1lBQ3hCLDBCQUEwQjtZQUMxQixLQUFLLGtCQUFrQjtnQkFDckIsT0FBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUM7UUFDM0MsQ0FBQztRQUNELE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFRCx5RkFBeUY7SUFDekYsb0NBQW9DO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6RixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbEQsV0FBVyxDQUFDLE1BQU0sQ0FDaEIsbUNBQW1DLEVBQ25DLHdCQUF3QixFQUN4Qix3QkFBd0IsQ0FDekIsQ0FBQztZQUNGLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFFeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDeEMsSUFBSSxJQUFJLEtBQUssZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzdDLFdBQVcsQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUNqRixDQUFDO2lCQUFNLElBQUksSUFBSSxLQUFLLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNwRCxXQUFXLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxFQUFFLHdCQUF3QixDQUFDLENBQUM7WUFDakYsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO3FIQTVGVSx3QkFBd0IsMENBV3pCLFFBQVE7eUhBWFAsd0JBQXdCLGNBRFosTUFBTTs7a0dBQ2xCLHdCQUF3QjtrQkFEcEMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQVkzQixNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QnJlYWtwb2ludE9ic2VydmVyfSBmcm9tICdAYW5ndWxhci9jZGsvbGF5b3V0JztcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG4vKiogU2V0IG9mIHBvc3NpYmxlIGhpZ2gtY29udHJhc3QgbW9kZSBiYWNrZ3JvdW5kcy4gKi9cbmV4cG9ydCBlbnVtIEhpZ2hDb250cmFzdE1vZGUge1xuICBOT05FLFxuICBCTEFDS19PTl9XSElURSxcbiAgV0hJVEVfT05fQkxBQ0ssXG59XG5cbi8qKiBDU1MgY2xhc3MgYXBwbGllZCB0byB0aGUgZG9jdW1lbnQgYm9keSB3aGVuIGluIGJsYWNrLW9uLXdoaXRlIGhpZ2gtY29udHJhc3QgbW9kZS4gKi9cbmV4cG9ydCBjb25zdCBCTEFDS19PTl9XSElURV9DU1NfQ0xBU1MgPSAnY2RrLWhpZ2gtY29udHJhc3QtYmxhY2stb24td2hpdGUnO1xuXG4vKiogQ1NTIGNsYXNzIGFwcGxpZWQgdG8gdGhlIGRvY3VtZW50IGJvZHkgd2hlbiBpbiB3aGl0ZS1vbi1ibGFjayBoaWdoLWNvbnRyYXN0IG1vZGUuICovXG5leHBvcnQgY29uc3QgV0hJVEVfT05fQkxBQ0tfQ1NTX0NMQVNTID0gJ2Nkay1oaWdoLWNvbnRyYXN0LXdoaXRlLW9uLWJsYWNrJztcblxuLyoqIENTUyBjbGFzcyBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCBib2R5IHdoZW4gaW4gaGlnaC1jb250cmFzdCBtb2RlLiAqL1xuZXhwb3J0IGNvbnN0IEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTID0gJ2Nkay1oaWdoLWNvbnRyYXN0LWFjdGl2ZSc7XG5cbi8qKlxuICogU2VydmljZSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgYnJvd3NlciBpcyBjdXJyZW50bHkgaW4gYSBoaWdoLWNvbnRyYXN0LW1vZGUgZW52aXJvbm1lbnQuXG4gKlxuICogTWljcm9zb2Z0IFdpbmRvd3Mgc3VwcG9ydHMgYW4gYWNjZXNzaWJpbGl0eSBmZWF0dXJlIGNhbGxlZCBcIkhpZ2ggQ29udHJhc3QgTW9kZVwiLiBUaGlzIG1vZGVcbiAqIGNoYW5nZXMgdGhlIGFwcGVhcmFuY2Ugb2YgYWxsIGFwcGxpY2F0aW9ucywgaW5jbHVkaW5nIHdlYiBhcHBsaWNhdGlvbnMsIHRvIGRyYW1hdGljYWxseSBpbmNyZWFzZVxuICogY29udHJhc3QuXG4gKlxuICogSUUsIEVkZ2UsIGFuZCBGaXJlZm94IGN1cnJlbnRseSBzdXBwb3J0IHRoaXMgbW9kZS4gQ2hyb21lIGRvZXMgbm90IHN1cHBvcnQgV2luZG93cyBIaWdoIENvbnRyYXN0XG4gKiBNb2RlLiBUaGlzIHNlcnZpY2UgZG9lcyBub3QgZGV0ZWN0IGhpZ2gtY29udHJhc3QgbW9kZSBhcyBhZGRlZCBieSB0aGUgQ2hyb21lIFwiSGlnaCBDb250cmFzdFwiXG4gKiBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgSGlnaENvbnRyYXN0TW9kZURldGVjdG9yIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIEZpZ3VyaW5nIG91dCB0aGUgaGlnaCBjb250cmFzdCBtb2RlIGFuZCBhZGRpbmcgdGhlIGJvZHkgY2xhc3NlcyBjYW4gY2F1c2VcbiAgICogc29tZSBleHBlbnNpdmUgbGF5b3V0cy4gVGhpcyBmbGFnIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgd2Ugb25seSBkbyBpdCBvbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGFzQ2hlY2tlZEhpZ2hDb250cmFzdE1vZGU6IGJvb2xlYW47XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJpdmF0ZSBfYnJlYWtwb2ludFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuXG4gICAgdGhpcy5fYnJlYWtwb2ludFN1YnNjcmlwdGlvbiA9IGluamVjdChCcmVha3BvaW50T2JzZXJ2ZXIpXG4gICAgICAub2JzZXJ2ZSgnKGZvcmNlZC1jb2xvcnM6IGFjdGl2ZSknKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNDaGVja2VkSGlnaENvbnRyYXN0TW9kZSkge1xuICAgICAgICAgIHRoaXMuX2hhc0NoZWNrZWRIaWdoQ29udHJhc3RNb2RlID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5fYXBwbHlCb2R5SGlnaENvbnRyYXN0TW9kZUNzc0NsYXNzZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudCBoaWdoLWNvbnRyYXN0LW1vZGUgZm9yIHRoZSBwYWdlLiAqL1xuICBnZXRIaWdoQ29udHJhc3RNb2RlKCk6IEhpZ2hDb250cmFzdE1vZGUge1xuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICByZXR1cm4gSGlnaENvbnRyYXN0TW9kZS5OT05FO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIHRlc3QgZWxlbWVudCB3aXRoIGFuIGFyYml0cmFyeSBiYWNrZ3JvdW5kLWNvbG9yIHRoYXQgaXMgbmVpdGhlciBibGFjayBub3JcbiAgICAvLyB3aGl0ZTsgaGlnaC1jb250cmFzdCBtb2RlIHdpbGwgY29lcmNlIHRoZSBjb2xvciB0byBlaXRoZXIgYmxhY2sgb3Igd2hpdGUuIEFsc28gZW5zdXJlIHRoYXRcbiAgICAvLyBhcHBlbmRpbmcgdGhlIHRlc3QgZWxlbWVudCB0byB0aGUgRE9NIGRvZXMgbm90IGFmZmVjdCBsYXlvdXQgYnkgYWJzb2x1dGVseSBwb3NpdGlvbmluZyBpdFxuICAgIGNvbnN0IHRlc3RFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGVzdEVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYigxLDIsMyknO1xuICAgIHRlc3RFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlc3RFbGVtZW50KTtcblxuICAgIC8vIEdldCB0aGUgY29tcHV0ZWQgc3R5bGUgZm9yIHRoZSBiYWNrZ3JvdW5kIGNvbG9yLCBjb2xsYXBzaW5nIHNwYWNlcyB0byBub3JtYWxpemUgYmV0d2VlblxuICAgIC8vIGJyb3dzZXJzLiBPbmNlIHdlIGdldCB0aGlzIGNvbG9yLCB3ZSBubyBsb25nZXIgbmVlZCB0aGUgdGVzdCBlbGVtZW50LiBBY2Nlc3MgdGhlIGB3aW5kb3dgXG4gICAgLy8gdmlhIHRoZSBkb2N1bWVudCBzbyB3ZSBjYW4gZmFrZSBpdCBpbiB0ZXN0cy4gTm90ZSB0aGF0IHdlIGhhdmUgZXh0cmEgbnVsbCBjaGVja3MsIGJlY2F1c2VcbiAgICAvLyB0aGlzIGxvZ2ljIHdpbGwgbGlrZWx5IHJ1biBkdXJpbmcgYXBwIGJvb3RzdHJhcCBhbmQgdGhyb3dpbmcgY2FuIGJyZWFrIHRoZSBlbnRpcmUgYXBwLlxuICAgIGNvbnN0IGRvY3VtZW50V2luZG93ID0gdGhpcy5fZG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93O1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPVxuICAgICAgZG9jdW1lbnRXaW5kb3cgJiYgZG9jdW1lbnRXaW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZVxuICAgICAgICA/IGRvY3VtZW50V2luZG93LmdldENvbXB1dGVkU3R5bGUodGVzdEVsZW1lbnQpXG4gICAgICAgIDogbnVsbDtcbiAgICBjb25zdCBjb21wdXRlZENvbG9yID0gKChjb21wdXRlZFN0eWxlICYmIGNvbXB1dGVkU3R5bGUuYmFja2dyb3VuZENvbG9yKSB8fCAnJykucmVwbGFjZShcbiAgICAgIC8gL2csXG4gICAgICAnJyxcbiAgICApO1xuICAgIHRlc3RFbGVtZW50LnJlbW92ZSgpO1xuXG4gICAgc3dpdGNoIChjb21wdXRlZENvbG9yKSB7XG4gICAgICAvLyBQcmUgV2luZG93cyAxMSBkYXJrIHRoZW1lLlxuICAgICAgY2FzZSAncmdiKDAsMCwwKSc6XG4gICAgICAvLyBXaW5kb3dzIDExIGRhcmsgdGhlbWVzLlxuICAgICAgY2FzZSAncmdiKDQ1LDUwLDU0KSc6XG4gICAgICBjYXNlICdyZ2IoMzIsMzIsMzIpJzpcbiAgICAgICAgcmV0dXJuIEhpZ2hDb250cmFzdE1vZGUuV0hJVEVfT05fQkxBQ0s7XG4gICAgICAvLyBQcmUgV2luZG93cyAxMSBsaWdodCB0aGVtZS5cbiAgICAgIGNhc2UgJ3JnYigyNTUsMjU1LDI1NSknOlxuICAgICAgLy8gV2luZG93cyAxMSBsaWdodCB0aGVtZS5cbiAgICAgIGNhc2UgJ3JnYigyNTUsMjUwLDIzOSknOlxuICAgICAgICByZXR1cm4gSGlnaENvbnRyYXN0TW9kZS5CTEFDS19PTl9XSElURTtcbiAgICB9XG4gICAgcmV0dXJuIEhpZ2hDb250cmFzdE1vZGUuTk9ORTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKiBBcHBsaWVzIENTUyBjbGFzc2VzIGluZGljYXRpbmcgaGlnaC1jb250cmFzdCBtb2RlIHRvIGRvY3VtZW50IGJvZHkgKGJyb3dzZXItb25seSkuICovXG4gIF9hcHBseUJvZHlIaWdoQ29udHJhc3RNb2RlQ3NzQ2xhc3NlcygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2hhc0NoZWNrZWRIaWdoQ29udHJhc3RNb2RlICYmIHRoaXMuX3BsYXRmb3JtLmlzQnJvd3NlciAmJiB0aGlzLl9kb2N1bWVudC5ib2R5KSB7XG4gICAgICBjb25zdCBib2R5Q2xhc3NlcyA9IHRoaXMuX2RvY3VtZW50LmJvZHkuY2xhc3NMaXN0O1xuICAgICAgYm9keUNsYXNzZXMucmVtb3ZlKFxuICAgICAgICBISUdIX0NPTlRSQVNUX01PREVfQUNUSVZFX0NTU19DTEFTUyxcbiAgICAgICAgQkxBQ0tfT05fV0hJVEVfQ1NTX0NMQVNTLFxuICAgICAgICBXSElURV9PTl9CTEFDS19DU1NfQ0xBU1MsXG4gICAgICApO1xuICAgICAgdGhpcy5faGFzQ2hlY2tlZEhpZ2hDb250cmFzdE1vZGUgPSB0cnVlO1xuXG4gICAgICBjb25zdCBtb2RlID0gdGhpcy5nZXRIaWdoQ29udHJhc3RNb2RlKCk7XG4gICAgICBpZiAobW9kZSA9PT0gSGlnaENvbnRyYXN0TW9kZS5CTEFDS19PTl9XSElURSkge1xuICAgICAgICBib2R5Q2xhc3Nlcy5hZGQoSElHSF9DT05UUkFTVF9NT0RFX0FDVElWRV9DU1NfQ0xBU1MsIEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IEhpZ2hDb250cmFzdE1vZGUuV0hJVEVfT05fQkxBQ0spIHtcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTLCBXSElURV9PTl9CTEFDS19DU1NfQ0xBU1MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19