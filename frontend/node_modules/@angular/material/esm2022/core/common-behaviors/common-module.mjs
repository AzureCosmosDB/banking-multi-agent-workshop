/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { inject, Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { VERSION as CDK_VERSION } from '@angular/cdk';
import { DOCUMENT } from '@angular/common';
import { Platform, _isTestEnvironment } from '@angular/cdk/platform';
import { VERSION } from '../version';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
/** @docs-private */
export function MATERIAL_SANITY_CHECKS_FACTORY() {
    return true;
}
/** Injection token that configures whether the Material sanity checks are enabled. */
export const MATERIAL_SANITY_CHECKS = new InjectionToken('mat-sanity-checks', {
    providedIn: 'root',
    factory: MATERIAL_SANITY_CHECKS_FACTORY,
});
/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 */
export class MatCommonModule {
    constructor(highContrastModeDetector, _sanityChecks, _document) {
        this._sanityChecks = _sanityChecks;
        this._document = _document;
        /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
        this._hasDoneGlobalChecks = false;
        // While A11yModule also does this, we repeat it here to avoid importing A11yModule
        // in MatCommonModule.
        highContrastModeDetector._applyBodyHighContrastModeCssClasses();
        if (!this._hasDoneGlobalChecks) {
            this._hasDoneGlobalChecks = true;
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                // Inject in here so the reference to `Platform` can be removed in production mode.
                const platform = inject(Platform, { optional: true });
                if (this._checkIsEnabled('doctype')) {
                    _checkDoctypeIsDefined(this._document);
                }
                if (this._checkIsEnabled('theme')) {
                    _checkThemeIsPresent(this._document, !!platform?.isBrowser);
                }
                if (this._checkIsEnabled('version')) {
                    _checkCdkVersionMatch();
                }
            }
        }
    }
    /** Gets whether a specific sanity check is enabled. */
    _checkIsEnabled(name) {
        if (_isTestEnvironment()) {
            return false;
        }
        if (typeof this._sanityChecks === 'boolean') {
            return this._sanityChecks;
        }
        return !!this._sanityChecks[name];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCommonModule, deps: [{ token: i1.HighContrastModeDetector }, { token: MATERIAL_SANITY_CHECKS, optional: true }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCommonModule, imports: [BidiModule], exports: [BidiModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCommonModule, imports: [BidiModule, BidiModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCommonModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [BidiModule],
                    exports: [BidiModule],
                }]
        }], ctorParameters: () => [{ type: i1.HighContrastModeDetector }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MATERIAL_SANITY_CHECKS]
                }] }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
/** Checks that the page has a doctype. */
function _checkDoctypeIsDefined(doc) {
    if (!doc.doctype) {
        console.warn('Current document does not have a doctype. This may cause ' +
            'some Angular Material components not to behave as expected.');
    }
}
/** Checks that a theme has been included. */
function _checkThemeIsPresent(doc, isBrowser) {
    // We need to assert that the `body` is defined, because these checks run very early
    // and the `body` won't be defined if the consumer put their scripts in the `head`.
    if (!doc.body || !isBrowser) {
        return;
    }
    const testElement = doc.createElement('div');
    testElement.classList.add('mat-theme-loaded-marker');
    doc.body.appendChild(testElement);
    const computedStyle = getComputedStyle(testElement);
    // In some situations the computed style of the test element can be null. For example in
    // Firefox, the computed style is null if an application is running inside of a hidden iframe.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    if (computedStyle && computedStyle.display !== 'none') {
        console.warn('Could not find Angular Material core theme. Most Material ' +
            'components may not work as expected. For more info refer ' +
            'to the theming guide: https://material.angular.io/guide/theming');
    }
    testElement.remove();
}
/** Checks whether the Material version matches the CDK version. */
function _checkCdkVersionMatch() {
    if (VERSION.full !== CDK_VERSION.full) {
        console.warn('The Angular Material version (' +
            VERSION.full +
            ') does not match ' +
            'the Angular CDK version (' +
            CDK_VERSION.full +
            ').\n' +
            'Please ensure the versions of these two packages exactly match.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL2NvbW1vbi1iZWhhdmlvcnMvY29tbW9uLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakYsT0FBTyxFQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFFbkMsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSw4QkFBOEI7SUFDNUMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsc0ZBQXNGO0FBQ3RGLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFlLG1CQUFtQixFQUFFO0lBQzFGLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSw4QkFBOEI7Q0FDeEMsQ0FBQyxDQUFDO0FBZUg7Ozs7O0dBS0c7QUFLSCxNQUFNLE9BQU8sZUFBZTtJQUkxQixZQUNFLHdCQUFrRCxFQUNFLGFBQTJCLEVBQ3JELFNBQW1CO1FBRE8sa0JBQWEsR0FBYixhQUFhLENBQWM7UUFDckQsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQU4vQyxnR0FBZ0c7UUFDeEYseUJBQW9CLEdBQUcsS0FB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QUFDLElBQUksQ0FDViw0REFBNEQ7WUFDMUQsMkRBQTJEO1lBQzNELGlFQUFpRSxDQUNwRSxDQUFDO0lBQ0osQ0FBQztJQUVELFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN2QixDQUFDO0FBRUQsbUVBQW1FO0FBQ25FLFNBQVMscUJBQXFCO0lBQzVCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FDVixnQ0FBZ0M7WUFDOUIsT0FBTyxDQUFDLElBQUk7WUFDWixtQkFBbUI7WUFDbkIsMkJBQTJCO1lBQzNCLFdBQVcsQ0FBQyxJQUFJO1lBQ2hCLE1BQU07WUFDTixpRUFBaUUsQ0FDcEUsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGlnaENvbnRyYXN0TW9kZURldGVjdG9yfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0JpZGlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7aW5qZWN0LCBJbmplY3QsIEluamVjdGlvblRva2VuLCBOZ01vZHVsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtWRVJTSU9OIGFzIENES19WRVJTSU9OfSBmcm9tICdAYW5ndWxhci9jZGsnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7UGxhdGZvcm0sIF9pc1Rlc3RFbnZpcm9ubWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7VkVSU0lPTn0gZnJvbSAnLi4vdmVyc2lvbic7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFURVJJQUxfU0FOSVRZX0NIRUNLU19GQUNUT1JZKCk6IFNhbml0eUNoZWNrcyB7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY29uZmlndXJlcyB3aGV0aGVyIHRoZSBNYXRlcmlhbCBzYW5pdHkgY2hlY2tzIGFyZSBlbmFibGVkLiAqL1xuZXhwb3J0IGNvbnN0IE1BVEVSSUFMX1NBTklUWV9DSEVDS1MgPSBuZXcgSW5qZWN0aW9uVG9rZW48U2FuaXR5Q2hlY2tzPignbWF0LXNhbml0eS1jaGVja3MnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogTUFURVJJQUxfU0FOSVRZX0NIRUNLU19GQUNUT1JZLFxufSk7XG5cbi8qKlxuICogUG9zc2libGUgc2FuaXR5IGNoZWNrcyB0aGF0IGNhbiBiZSBlbmFibGVkLiBJZiBzZXQgdG9cbiAqIHRydWUvZmFsc2UsIGFsbCBjaGVja3Mgd2lsbCBiZSBlbmFibGVkL2Rpc2FibGVkLlxuICovXG5leHBvcnQgdHlwZSBTYW5pdHlDaGVja3MgPSBib29sZWFuIHwgR3JhbnVsYXJTYW5pdHlDaGVja3M7XG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIHNhbml0eSBjaGVja3MgZ3JhbnVsYXJseS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR3JhbnVsYXJTYW5pdHlDaGVja3Mge1xuICBkb2N0eXBlOiBib29sZWFuO1xuICB0aGVtZTogYm9vbGVhbjtcbiAgdmVyc2lvbjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNb2R1bGUgdGhhdCBjYXB0dXJlcyBhbnl0aGluZyB0aGF0IHNob3VsZCBiZSBsb2FkZWQgYW5kL29yIHJ1biBmb3IgKmFsbCogQW5ndWxhciBNYXRlcmlhbFxuICogY29tcG9uZW50cy4gVGhpcyBpbmNsdWRlcyBCaWRpLCBldGMuXG4gKlxuICogVGhpcyBtb2R1bGUgc2hvdWxkIGJlIGltcG9ydGVkIHRvIGVhY2ggdG9wLWxldmVsIGNvbXBvbmVudCBtb2R1bGUgKGUuZy4sIE1hdFRhYnNNb2R1bGUpLlxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQmlkaU1vZHVsZV0sXG4gIGV4cG9ydHM6IFtCaWRpTW9kdWxlXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q29tbW9uTW9kdWxlIHtcbiAgLyoqIFdoZXRoZXIgd2UndmUgZG9uZSB0aGUgZ2xvYmFsIHNhbml0eSBjaGVja3MgKGUuZy4gYSB0aGVtZSBpcyBsb2FkZWQsIHRoZXJlIGlzIGEgZG9jdHlwZSkuICovXG4gIHByaXZhdGUgX2hhc0RvbmVHbG9iYWxDaGVja3MgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBoaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3I6IEhpZ2hDb250cmFzdE1vZGVEZXRlY3RvcixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVEVSSUFMX1NBTklUWV9DSEVDS1MpIHByaXZhdGUgX3Nhbml0eUNoZWNrczogU2FuaXR5Q2hlY2tzLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgKSB7XG4gICAgLy8gV2hpbGUgQTExeU1vZHVsZSBhbHNvIGRvZXMgdGhpcywgd2UgcmVwZWF0IGl0IGhlcmUgdG8gYXZvaWQgaW1wb3J0aW5nIEExMXlNb2R1bGVcbiAgICAvLyBpbiBNYXRDb21tb25Nb2R1bGUuXG4gICAgaGlnaENvbnRyYXN0TW9kZURldGVjdG9yLl9hcHBseUJvZHlIaWdoQ29udHJhc3RNb2RlQ3NzQ2xhc3NlcygpO1xuXG4gICAgaWYgKCF0aGlzLl9oYXNEb25lR2xvYmFsQ2hlY2tzKSB7XG4gICAgICB0aGlzLl9oYXNEb25lR2xvYmFsQ2hlY2tzID0gdHJ1ZTtcblxuICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICAvLyBJbmplY3QgaW4gaGVyZSBzbyB0aGUgcmVmZXJlbmNlIHRvIGBQbGF0Zm9ybWAgY2FuIGJlIHJlbW92ZWQgaW4gcHJvZHVjdGlvbiBtb2RlLlxuICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IGluamVjdChQbGF0Zm9ybSwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NoZWNrSXNFbmFibGVkKCdkb2N0eXBlJykpIHtcbiAgICAgICAgICBfY2hlY2tEb2N0eXBlSXNEZWZpbmVkKHRoaXMuX2RvY3VtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9jaGVja0lzRW5hYmxlZCgndGhlbWUnKSkge1xuICAgICAgICAgIF9jaGVja1RoZW1lSXNQcmVzZW50KHRoaXMuX2RvY3VtZW50LCAhIXBsYXRmb3JtPy5pc0Jyb3dzZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2NoZWNrSXNFbmFibGVkKCd2ZXJzaW9uJykpIHtcbiAgICAgICAgICBfY2hlY2tDZGtWZXJzaW9uTWF0Y2goKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSBzcGVjaWZpYyBzYW5pdHkgY2hlY2sgaXMgZW5hYmxlZC4gKi9cbiAgcHJpdmF0ZSBfY2hlY2tJc0VuYWJsZWQobmFtZToga2V5b2YgR3JhbnVsYXJTYW5pdHlDaGVja3MpOiBib29sZWFuIHtcbiAgICBpZiAoX2lzVGVzdEVudmlyb25tZW50KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuX3Nhbml0eUNoZWNrcyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2FuaXR5Q2hlY2tzO1xuICAgIH1cblxuICAgIHJldHVybiAhIXRoaXMuX3Nhbml0eUNoZWNrc1tuYW1lXTtcbiAgfVxufVxuXG4vKiogQ2hlY2tzIHRoYXQgdGhlIHBhZ2UgaGFzIGEgZG9jdHlwZS4gKi9cbmZ1bmN0aW9uIF9jaGVja0RvY3R5cGVJc0RlZmluZWQoZG9jOiBEb2N1bWVudCk6IHZvaWQge1xuICBpZiAoIWRvYy5kb2N0eXBlKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ0N1cnJlbnQgZG9jdW1lbnQgZG9lcyBub3QgaGF2ZSBhIGRvY3R5cGUuIFRoaXMgbWF5IGNhdXNlICcgK1xuICAgICAgICAnc29tZSBBbmd1bGFyIE1hdGVyaWFsIGNvbXBvbmVudHMgbm90IHRvIGJlaGF2ZSBhcyBleHBlY3RlZC4nLFxuICAgICk7XG4gIH1cbn1cblxuLyoqIENoZWNrcyB0aGF0IGEgdGhlbWUgaGFzIGJlZW4gaW5jbHVkZWQuICovXG5mdW5jdGlvbiBfY2hlY2tUaGVtZUlzUHJlc2VudChkb2M6IERvY3VtZW50LCBpc0Jyb3dzZXI6IGJvb2xlYW4pOiB2b2lkIHtcbiAgLy8gV2UgbmVlZCB0byBhc3NlcnQgdGhhdCB0aGUgYGJvZHlgIGlzIGRlZmluZWQsIGJlY2F1c2UgdGhlc2UgY2hlY2tzIHJ1biB2ZXJ5IGVhcmx5XG4gIC8vIGFuZCB0aGUgYGJvZHlgIHdvbid0IGJlIGRlZmluZWQgaWYgdGhlIGNvbnN1bWVyIHB1dCB0aGVpciBzY3JpcHRzIGluIHRoZSBgaGVhZGAuXG4gIGlmICghZG9jLmJvZHkgfHwgIWlzQnJvd3Nlcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHRlc3RFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB0ZXN0RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXQtdGhlbWUtbG9hZGVkLW1hcmtlcicpO1xuICBkb2MuYm9keS5hcHBlbmRDaGlsZCh0ZXN0RWxlbWVudCk7XG5cbiAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGVzdEVsZW1lbnQpO1xuXG4gIC8vIEluIHNvbWUgc2l0dWF0aW9ucyB0aGUgY29tcHV0ZWQgc3R5bGUgb2YgdGhlIHRlc3QgZWxlbWVudCBjYW4gYmUgbnVsbC4gRm9yIGV4YW1wbGUgaW5cbiAgLy8gRmlyZWZveCwgdGhlIGNvbXB1dGVkIHN0eWxlIGlzIG51bGwgaWYgYW4gYXBwbGljYXRpb24gaXMgcnVubmluZyBpbnNpZGUgb2YgYSBoaWRkZW4gaWZyYW1lLlxuICAvLyBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTU0ODM5N1xuICBpZiAoY29tcHV0ZWRTdHlsZSAmJiBjb21wdXRlZFN0eWxlLmRpc3BsYXkgIT09ICdub25lJykge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdDb3VsZCBub3QgZmluZCBBbmd1bGFyIE1hdGVyaWFsIGNvcmUgdGhlbWUuIE1vc3QgTWF0ZXJpYWwgJyArXG4gICAgICAgICdjb21wb25lbnRzIG1heSBub3Qgd29yayBhcyBleHBlY3RlZC4gRm9yIG1vcmUgaW5mbyByZWZlciAnICtcbiAgICAgICAgJ3RvIHRoZSB0aGVtaW5nIGd1aWRlOiBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vZ3VpZGUvdGhlbWluZycsXG4gICAgKTtcbiAgfVxuXG4gIHRlc3RFbGVtZW50LnJlbW92ZSgpO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIE1hdGVyaWFsIHZlcnNpb24gbWF0Y2hlcyB0aGUgQ0RLIHZlcnNpb24uICovXG5mdW5jdGlvbiBfY2hlY2tDZGtWZXJzaW9uTWF0Y2goKTogdm9pZCB7XG4gIGlmIChWRVJTSU9OLmZ1bGwgIT09IENES19WRVJTSU9OLmZ1bGwpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnVGhlIEFuZ3VsYXIgTWF0ZXJpYWwgdmVyc2lvbiAoJyArXG4gICAgICAgIFZFUlNJT04uZnVsbCArXG4gICAgICAgICcpIGRvZXMgbm90IG1hdGNoICcgK1xuICAgICAgICAndGhlIEFuZ3VsYXIgQ0RLIHZlcnNpb24gKCcgK1xuICAgICAgICBDREtfVkVSU0lPTi5mdWxsICtcbiAgICAgICAgJykuXFxuJyArXG4gICAgICAgICdQbGVhc2UgZW5zdXJlIHRoZSB2ZXJzaW9ucyBvZiB0aGVzZSB0d28gcGFja2FnZXMgZXhhY3RseSBtYXRjaC4nLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==