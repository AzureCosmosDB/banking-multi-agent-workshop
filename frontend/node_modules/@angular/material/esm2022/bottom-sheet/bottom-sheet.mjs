/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Injectable, Optional, SkipSelf, InjectionToken, Inject, Injector, } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetConfig } from './bottom-sheet-config';
import { MatBottomSheetContainer } from './bottom-sheet-container';
import { MatBottomSheetRef } from './bottom-sheet-ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "./bottom-sheet-config";
/** Injection token that can be used to specify default bottom sheet options. */
export const MAT_BOTTOM_SHEET_DEFAULT_OPTIONS = new InjectionToken('mat-bottom-sheet-default-options');
/**
 * Service to trigger Material Design bottom sheets.
 */
export class MatBottomSheet {
    /** Reference to the currently opened bottom sheet. */
    get _openedBottomSheetRef() {
        const parent = this._parentBottomSheet;
        return parent ? parent._openedBottomSheetRef : this._bottomSheetRefAtThisLevel;
    }
    set _openedBottomSheetRef(value) {
        if (this._parentBottomSheet) {
            this._parentBottomSheet._openedBottomSheetRef = value;
        }
        else {
            this._bottomSheetRefAtThisLevel = value;
        }
    }
    constructor(_overlay, injector, _parentBottomSheet, _defaultOptions) {
        this._overlay = _overlay;
        this._parentBottomSheet = _parentBottomSheet;
        this._defaultOptions = _defaultOptions;
        this._bottomSheetRefAtThisLevel = null;
        this._dialog = injector.get(Dialog);
    }
    open(componentOrTemplateRef, config) {
        const _config = { ...(this._defaultOptions || new MatBottomSheetConfig()), ...config };
        let ref;
        this._dialog.open(componentOrTemplateRef, {
            ..._config,
            // Disable closing since we need to sync it up to the animation ourselves.
            disableClose: true,
            // Disable closing on detachments so that we can sync up the animation.
            closeOnOverlayDetachments: false,
            maxWidth: '100%',
            container: MatBottomSheetContainer,
            scrollStrategy: _config.scrollStrategy || this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position().global().centerHorizontally().bottom('0'),
            templateContext: () => ({ bottomSheetRef: ref }),
            providers: (cdkRef, _cdkConfig, container) => {
                ref = new MatBottomSheetRef(cdkRef, _config, container);
                return [
                    { provide: MatBottomSheetRef, useValue: ref },
                    { provide: MAT_BOTTOM_SHEET_DATA, useValue: _config.data },
                ];
            },
        });
        // When the bottom sheet is dismissed, clear the reference to it.
        ref.afterDismissed().subscribe(() => {
            // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
            if (this._openedBottomSheetRef === ref) {
                this._openedBottomSheetRef = null;
            }
        });
        if (this._openedBottomSheetRef) {
            // If a bottom sheet is already in view, dismiss it and enter the
            // new bottom sheet after exit animation is complete.
            this._openedBottomSheetRef.afterDismissed().subscribe(() => ref.containerInstance?.enter());
            this._openedBottomSheetRef.dismiss();
        }
        else {
            // If no bottom sheet is in view, enter the new bottom sheet.
            ref.containerInstance.enter();
        }
        this._openedBottomSheetRef = ref;
        return ref;
    }
    /**
     * Dismisses the currently-visible bottom sheet.
     * @param result Data to pass to the bottom sheet instance.
     */
    dismiss(result) {
        if (this._openedBottomSheetRef) {
            this._openedBottomSheetRef.dismiss(result);
        }
    }
    ngOnDestroy() {
        if (this._bottomSheetRefAtThisLevel) {
            this._bottomSheetRefAtThisLevel.dismiss();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheet, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: MatBottomSheet, optional: true, skipSelf: true }, { token: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheet, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBottomSheet, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i0.Injector }, { type: MatBottomSheet, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i2.MatBottomSheetConfig, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_BOTTOM_SHEET_DEFAULT_OPTIONS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90dG9tLXNoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2JvdHRvbS1zaGVldC9ib3R0b20tc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUU3QyxPQUFPLEVBQ0wsVUFBVSxFQUNWLFFBQVEsRUFDUixRQUFRLEVBRVIsY0FBYyxFQUNkLE1BQU0sRUFFTixRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHFCQUFxQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7Ozs7QUFFckQsZ0ZBQWdGO0FBQ2hGLE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksY0FBYyxDQUNoRSxrQ0FBa0MsQ0FDbkMsQ0FBQztBQUVGOztHQUVHO0FBRUgsTUFBTSxPQUFPLGNBQWM7SUFJekIsc0RBQXNEO0lBQ3RELElBQUkscUJBQXFCO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUM7SUFDakYsQ0FBQztJQUVELElBQUkscUJBQXFCLENBQUMsS0FBb0M7UUFDNUQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQ3hELENBQUM7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QUFDLHFCQUFxQixFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztxSEFsSFUsY0FBYyw0SEF1QmYsZ0NBQWdDO3lIQXZCL0IsY0FBYyxjQURGLE1BQU07O2tHQUNsQixjQUFjO2tCQUQxQixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBc0IzQixRQUFROzswQkFBSSxRQUFROzswQkFDcEIsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxnQ0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaWFsb2d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kaWFsb2cnO1xuaW1wb3J0IHtPdmVybGF5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgSW5qZWN0YWJsZSxcbiAgT3B0aW9uYWwsXG4gIFNraXBTZWxmLFxuICBUZW1wbGF0ZVJlZixcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdCxcbiAgT25EZXN0cm95LFxuICBJbmplY3Rvcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01BVF9CT1RUT01fU0hFRVRfREFUQSwgTWF0Qm90dG9tU2hlZXRDb25maWd9IGZyb20gJy4vYm90dG9tLXNoZWV0LWNvbmZpZyc7XG5pbXBvcnQge01hdEJvdHRvbVNoZWV0Q29udGFpbmVyfSBmcm9tICcuL2JvdHRvbS1zaGVldC1jb250YWluZXInO1xuaW1wb3J0IHtNYXRCb3R0b21TaGVldFJlZn0gZnJvbSAnLi9ib3R0b20tc2hlZXQtcmVmJztcblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHNwZWNpZnkgZGVmYXVsdCBib3R0b20gc2hlZXQgb3B0aW9ucy4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQk9UVE9NX1NIRUVUX0RFRkFVTFRfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRCb3R0b21TaGVldENvbmZpZz4oXG4gICdtYXQtYm90dG9tLXNoZWV0LWRlZmF1bHQtb3B0aW9ucycsXG4pO1xuXG4vKipcbiAqIFNlcnZpY2UgdG8gdHJpZ2dlciBNYXRlcmlhbCBEZXNpZ24gYm90dG9tIHNoZWV0cy5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTWF0Qm90dG9tU2hlZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9ib3R0b21TaGVldFJlZkF0VGhpc0xldmVsOiBNYXRCb3R0b21TaGVldFJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2RpYWxvZzogRGlhbG9nO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseSBvcGVuZWQgYm90dG9tIHNoZWV0LiAqL1xuICBnZXQgX29wZW5lZEJvdHRvbVNoZWV0UmVmKCk6IE1hdEJvdHRvbVNoZWV0UmVmPGFueT4gfCBudWxsIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9wYXJlbnRCb3R0b21TaGVldDtcbiAgICByZXR1cm4gcGFyZW50ID8gcGFyZW50Ll9vcGVuZWRCb3R0b21TaGVldFJlZiA6IHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWw7XG4gIH1cblxuICBzZXQgX29wZW5lZEJvdHRvbVNoZWV0UmVmKHZhbHVlOiBNYXRCb3R0b21TaGVldFJlZjxhbnk+IHwgbnVsbCkge1xuICAgIGlmICh0aGlzLl9wYXJlbnRCb3R0b21TaGVldCkge1xuICAgICAgdGhpcy5fcGFyZW50Qm90dG9tU2hlZXQuX29wZW5lZEJvdHRvbVNoZWV0UmVmID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWwgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnRCb3R0b21TaGVldDogTWF0Qm90dG9tU2hlZXQsXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KE1BVF9CT1RUT01fU0hFRVRfREVGQVVMVF9PUFRJT05TKVxuICAgIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zPzogTWF0Qm90dG9tU2hlZXRDb25maWcsXG4gICkge1xuICAgIHRoaXMuX2RpYWxvZyA9IGluamVjdG9yLmdldChEaWFsb2cpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgYm90dG9tIHNoZWV0IGNvbnRhaW5pbmcgdGhlIGdpdmVuIGNvbXBvbmVudC5cbiAgICogQHBhcmFtIGNvbXBvbmVudCBUeXBlIG9mIHRoZSBjb21wb25lbnQgdG8gbG9hZCBpbnRvIHRoZSBib3R0b20gc2hlZXQuXG4gICAqIEBwYXJhbSBjb25maWcgRXh0cmEgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIG5ld2x5LW9wZW5lZCBib3R0b20gc2hlZXQuXG4gICAqL1xuICBvcGVuPFQsIEQgPSBhbnksIFIgPSBhbnk+KFxuICAgIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxUPixcbiAgICBjb25maWc/OiBNYXRCb3R0b21TaGVldENvbmZpZzxEPixcbiAgKTogTWF0Qm90dG9tU2hlZXRSZWY8VCwgUj47XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgYm90dG9tIHNoZWV0IGNvbnRhaW5pbmcgdGhlIGdpdmVuIHRlbXBsYXRlLlxuICAgKiBAcGFyYW0gdGVtcGxhdGUgVGVtcGxhdGVSZWYgdG8gaW5zdGFudGlhdGUgYXMgdGhlIGJvdHRvbSBzaGVldCBjb250ZW50LlxuICAgKiBAcGFyYW0gY29uZmlnIEV4dHJhIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBuZXdseS1vcGVuZWQgYm90dG9tIHNoZWV0LlxuICAgKi9cbiAgb3BlbjxULCBEID0gYW55LCBSID0gYW55PihcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VD4sXG4gICAgY29uZmlnPzogTWF0Qm90dG9tU2hlZXRDb25maWc8RD4sXG4gICk6IE1hdEJvdHRvbVNoZWV0UmVmPFQsIFI+O1xuXG4gIG9wZW48VCwgRCA9IGFueSwgUiA9IGFueT4oXG4gICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogQ29tcG9uZW50VHlwZTxUPiB8IFRlbXBsYXRlUmVmPFQ+LFxuICAgIGNvbmZpZz86IE1hdEJvdHRvbVNoZWV0Q29uZmlnPEQ+LFxuICApOiBNYXRCb3R0b21TaGVldFJlZjxULCBSPiB7XG4gICAgY29uc3QgX2NvbmZpZyA9IHsuLi4odGhpcy5fZGVmYXVsdE9wdGlvbnMgfHwgbmV3IE1hdEJvdHRvbVNoZWV0Q29uZmlnKCkpLCAuLi5jb25maWd9O1xuICAgIGxldCByZWY6IE1hdEJvdHRvbVNoZWV0UmVmPFQsIFI+O1xuXG4gICAgdGhpcy5fZGlhbG9nLm9wZW48UiwgRCwgVD4oY29tcG9uZW50T3JUZW1wbGF0ZVJlZiwge1xuICAgICAgLi4uX2NvbmZpZyxcbiAgICAgIC8vIERpc2FibGUgY2xvc2luZyBzaW5jZSB3ZSBuZWVkIHRvIHN5bmMgaXQgdXAgdG8gdGhlIGFuaW1hdGlvbiBvdXJzZWx2ZXMuXG4gICAgICBkaXNhYmxlQ2xvc2U6IHRydWUsXG4gICAgICAvLyBEaXNhYmxlIGNsb3Npbmcgb24gZGV0YWNobWVudHMgc28gdGhhdCB3ZSBjYW4gc3luYyB1cCB0aGUgYW5pbWF0aW9uLlxuICAgICAgY2xvc2VPbk92ZXJsYXlEZXRhY2htZW50czogZmFsc2UsXG4gICAgICBtYXhXaWR0aDogJzEwMCUnLFxuICAgICAgY29udGFpbmVyOiBNYXRCb3R0b21TaGVldENvbnRhaW5lcixcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiBfY29uZmlnLnNjcm9sbFN0cmF0ZWd5IHx8IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpLmdsb2JhbCgpLmNlbnRlckhvcml6b250YWxseSgpLmJvdHRvbSgnMCcpLFxuICAgICAgdGVtcGxhdGVDb250ZXh0OiAoKSA9PiAoe2JvdHRvbVNoZWV0UmVmOiByZWZ9KSxcbiAgICAgIHByb3ZpZGVyczogKGNka1JlZiwgX2Nka0NvbmZpZywgY29udGFpbmVyKSA9PiB7XG4gICAgICAgIHJlZiA9IG5ldyBNYXRCb3R0b21TaGVldFJlZihjZGtSZWYsIF9jb25maWcsIGNvbnRhaW5lciBhcyBNYXRCb3R0b21TaGVldENvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAge3Byb3ZpZGU6IE1hdEJvdHRvbVNoZWV0UmVmLCB1c2VWYWx1ZTogcmVmfSxcbiAgICAgICAgICB7cHJvdmlkZTogTUFUX0JPVFRPTV9TSEVFVF9EQVRBLCB1c2VWYWx1ZTogX2NvbmZpZy5kYXRhfSxcbiAgICAgICAgXTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXaGVuIHRoZSBib3R0b20gc2hlZXQgaXMgZGlzbWlzc2VkLCBjbGVhciB0aGUgcmVmZXJlbmNlIHRvIGl0LlxuICAgIHJlZiEuYWZ0ZXJEaXNtaXNzZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgLy8gQ2xlYXIgdGhlIGJvdHRvbSBzaGVldCByZWYgaWYgaXQgaGFzbid0IGFscmVhZHkgYmVlbiByZXBsYWNlZCBieSBhIG5ld2VyIG9uZS5cbiAgICAgIGlmICh0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZiA9PT0gcmVmKSB7XG4gICAgICAgIHRoaXMuX29wZW5lZEJvdHRvbVNoZWV0UmVmID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZikge1xuICAgICAgLy8gSWYgYSBib3R0b20gc2hlZXQgaXMgYWxyZWFkeSBpbiB2aWV3LCBkaXNtaXNzIGl0IGFuZCBlbnRlciB0aGVcbiAgICAgIC8vIG5ldyBib3R0b20gc2hlZXQgYWZ0ZXIgZXhpdCBhbmltYXRpb24gaXMgY29tcGxldGUuXG4gICAgICB0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiByZWYuY29udGFpbmVySW5zdGFuY2U/LmVudGVyKCkpO1xuICAgICAgdGhpcy5fb3BlbmVkQm90dG9tU2hlZXRSZWYuZGlzbWlzcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBubyBib3R0b20gc2hlZXQgaXMgaW4gdmlldywgZW50ZXIgdGhlIG5ldyBib3R0b20gc2hlZXQuXG4gICAgICByZWYhLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3BlbmVkQm90dG9tU2hlZXRSZWYgPSByZWYhO1xuICAgIHJldHVybiByZWYhO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgY3VycmVudGx5LXZpc2libGUgYm90dG9tIHNoZWV0LlxuICAgKiBAcGFyYW0gcmVzdWx0IERhdGEgdG8gcGFzcyB0byB0aGUgYm90dG9tIHNoZWV0IGluc3RhbmNlLlxuICAgKi9cbiAgZGlzbWlzczxSID0gYW55PihyZXN1bHQ/OiBSKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29wZW5lZEJvdHRvbVNoZWV0UmVmKSB7XG4gICAgICB0aGlzLl9vcGVuZWRCb3R0b21TaGVldFJlZi5kaXNtaXNzKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWwpIHtcbiAgICAgIHRoaXMuX2JvdHRvbVNoZWV0UmVmQXRUaGlzTGV2ZWwuZGlzbWlzcygpO1xuICAgIH1cbiAgfVxufVxuIl19