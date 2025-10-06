/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDatepickerBase } from './datepicker-base';
import * as i0 from "@angular/core";
import * as i1 from "./datepicker-base";
/** Button that will close the datepicker and assign the current selection to the data model. */
export class MatDatepickerApply {
    constructor(_datepicker) {
        this._datepicker = _datepicker;
    }
    _applySelection() {
        this._datepicker._applyPendingSelection();
        this._datepicker.close();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerApply, deps: [{ token: i1.MatDatepickerBase }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDatepickerApply, isStandalone: true, selector: "[matDatepickerApply], [matDateRangePickerApply]", host: { listeners: { "click": "_applySelection()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerApply, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matDatepickerApply], [matDateRangePickerApply]',
                    host: { '(click)': '_applySelection()' },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.MatDatepickerBase }] });
/** Button that will close the datepicker and discard the current selection. */
export class MatDatepickerCancel {
    constructor(_datepicker) {
        this._datepicker = _datepicker;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerCancel, deps: [{ token: i1.MatDatepickerBase }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDatepickerCancel, isStandalone: true, selector: "[matDatepickerCancel], [matDateRangePickerCancel]", host: { listeners: { "click": "_datepicker.close()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerCancel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matDatepickerCancel], [matDateRangePickerCancel]',
                    host: { '(click)': '_datepicker.close()' },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.MatDatepickerBase }] });
/**
 * Container that can be used to project a row of action buttons
 * to the bottom of a datepicker or date range picker.
 */
export class MatDatepickerActions {
    constructor(_datepicker, _viewContainerRef) {
        this._datepicker = _datepicker;
        this._viewContainerRef = _viewContainerRef;
    }
    ngAfterViewInit() {
        this._portal = new TemplatePortal(this._template, this._viewContainerRef);
        this._datepicker.registerActions(this._portal);
    }
    ngOnDestroy() {
        this._datepicker.removeActions(this._portal);
        // Needs to be null checked since we initialize it in `ngAfterViewInit`.
        if (this._portal && this._portal.isAttached) {
            this._portal?.detach();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerActions, deps: [{ token: i1.MatDatepickerBase }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDatepickerActions, isStandalone: true, selector: "mat-datepicker-actions, mat-date-range-picker-actions", viewQueries: [{ propertyName: "_template", first: true, predicate: TemplateRef, descendants: true }], ngImport: i0, template: `
    <ng-template>
      <div class="mat-datepicker-actions">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `, isInline: true, styles: [".mat-datepicker-actions{display:flex;justify-content:flex-end;align-items:center;padding:0 8px 8px 8px}.mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:0;margin-right:8px}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerActions, decorators: [{
            type: Component,
            args: [{ selector: 'mat-datepicker-actions, mat-date-range-picker-actions', template: `
    <ng-template>
      <div class="mat-datepicker-actions">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, styles: [".mat-datepicker-actions{display:flex;justify-content:flex-end;align-items:center;padding:0 8px 8px 8px}.mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:8px}[dir=rtl] .mat-datepicker-actions .mat-mdc-button-base+.mat-mdc-button-base{margin-left:0;margin-right:8px}"] }]
        }], ctorParameters: () => [{ type: i1.MatDatepickerBase }, { type: i0.ViewContainerRef }], propDecorators: { _template: [{
                type: ViewChild,
                args: [TemplateRef]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1hY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFNBQVMsRUFFVCxXQUFXLEVBQ1gsU0FBUyxFQUNULGdCQUFnQixFQUNoQixpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSxtQkFBbUIsQ0FBQzs7O0FBRTFFLGdHQUFnRztBQU1oRyxNQUFNLE9BQU8sa0JBQWtCO0lBQzdCLFlBQW9CLFdBQWtFO1FBQWxFLGdCQUFXLEdBQVgsV0FBVyxDQUF1RDtJQUFHLENBQUM7SUFFMUYsZUFBZTtRQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7cUhBTlUsa0JBQWtCO3lHQUFsQixrQkFBa0I7O2tHQUFsQixrQkFBa0I7a0JBTDlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGlEQUFpRDtvQkFDM0QsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFDO29CQUN0QyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBVUQsK0VBQStFO0FBTS9FLE1BQU0sT0FBTyxtQkFBbUI7SUFDOUIsWUFBbUIsV0FBa0U7UUFBbEUsZ0JBQVcsR0FBWCxXQUFXLENBQXVEO0lBQUcsQ0FBQztxSEFEOUUsbUJBQW1CO3lHQUFuQixtQkFBbUI7O2tHQUFuQixtQkFBbUI7a0JBTC9CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG1EQUFtRDtvQkFDN0QsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFDO29CQUN4QyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBS0Q7OztHQUdHO0FBZUgsTUFBTSxPQUFPLG9CQUFvQjtJQUkvQixZQUNVLFdBQWtFLEVBQ2xFLGlCQUFtQztRQURuQyxnQkFBVyxHQUFYLFdBQVcsQ0FBdUQ7UUFDbEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtJQUMxQyxDQUFDO0lBRUosZUFBZTtRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0Msd0VBQXdFO1FBQ3hFLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDekIsQ0FBQztJQUNILENBQUM7cUhBckJVLG9CQUFvQjt5R0FBcEIsb0JBQW9CLDRKQUNwQixXQUFXLGdEQVpaOzs7Ozs7R0FNVDs7a0dBS1Usb0JBQW9CO2tCQWRoQyxTQUFTOytCQUNFLHVEQUF1RCxZQUV2RDs7Ozs7O0dBTVQsbUJBQ2dCLHVCQUF1QixDQUFDLE1BQU0saUJBQ2hDLGlCQUFpQixDQUFDLElBQUksY0FDekIsSUFBSTtxSEFHUSxTQUFTO3NCQUFoQyxTQUFTO3VCQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRGlyZWN0aXZlLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtNYXREYXRlcGlja2VyQmFzZSwgTWF0RGF0ZXBpY2tlckNvbnRyb2x9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcblxuLyoqIEJ1dHRvbiB0aGF0IHdpbGwgY2xvc2UgdGhlIGRhdGVwaWNrZXIgYW5kIGFzc2lnbiB0aGUgY3VycmVudCBzZWxlY3Rpb24gdG8gdGhlIGRhdGEgbW9kZWwuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0RGF0ZXBpY2tlckFwcGx5XSwgW21hdERhdGVSYW5nZVBpY2tlckFwcGx5XScsXG4gIGhvc3Q6IHsnKGNsaWNrKSc6ICdfYXBwbHlTZWxlY3Rpb24oKSd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyQXBwbHkge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kYXRlcGlja2VyOiBNYXREYXRlcGlja2VyQmFzZTxNYXREYXRlcGlja2VyQ29udHJvbDxhbnk+LCB1bmtub3duPikge31cblxuICBfYXBwbHlTZWxlY3Rpb24oKSB7XG4gICAgdGhpcy5fZGF0ZXBpY2tlci5fYXBwbHlQZW5kaW5nU2VsZWN0aW9uKCk7XG4gICAgdGhpcy5fZGF0ZXBpY2tlci5jbG9zZSgpO1xuICB9XG59XG5cbi8qKiBCdXR0b24gdGhhdCB3aWxsIGNsb3NlIHRoZSBkYXRlcGlja2VyIGFuZCBkaXNjYXJkIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXREYXRlcGlja2VyQ2FuY2VsXSwgW21hdERhdGVSYW5nZVBpY2tlckNhbmNlbF0nLFxuICBob3N0OiB7JyhjbGljayknOiAnX2RhdGVwaWNrZXIuY2xvc2UoKSd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyQ2FuY2VsIHtcbiAgY29uc3RydWN0b3IocHVibGljIF9kYXRlcGlja2VyOiBNYXREYXRlcGlja2VyQmFzZTxNYXREYXRlcGlja2VyQ29udHJvbDxhbnk+LCB1bmtub3duPikge31cbn1cblxuLyoqXG4gKiBDb250YWluZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBwcm9qZWN0IGEgcm93IG9mIGFjdGlvbiBidXR0b25zXG4gKiB0byB0aGUgYm90dG9tIG9mIGEgZGF0ZXBpY2tlciBvciBkYXRlIHJhbmdlIHBpY2tlci5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWRhdGVwaWNrZXItYWN0aW9ucywgbWF0LWRhdGUtcmFuZ2UtcGlja2VyLWFjdGlvbnMnLFxuICBzdHlsZVVybDogJ2RhdGVwaWNrZXItYWN0aW9ucy5jc3MnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZy10ZW1wbGF0ZT5cbiAgICAgIDxkaXYgY2xhc3M9XCJtYXQtZGF0ZXBpY2tlci1hY3Rpb25zXCI+XG4gICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICAgIDwvZGl2PlxuICAgIDwvbmctdGVtcGxhdGU+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyQWN0aW9ucyBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIEBWaWV3Q2hpbGQoVGVtcGxhdGVSZWYpIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8dW5rbm93bj47XG4gIHByaXZhdGUgX3BvcnRhbDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZGF0ZXBpY2tlcjogTWF0RGF0ZXBpY2tlckJhc2U8TWF0RGF0ZXBpY2tlckNvbnRyb2w8YW55PiwgdW5rbm93bj4sXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9wb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5fdGVtcGxhdGUsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIHRoaXMuX2RhdGVwaWNrZXIucmVnaXN0ZXJBY3Rpb25zKHRoaXMuX3BvcnRhbCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kYXRlcGlja2VyLnJlbW92ZUFjdGlvbnModGhpcy5fcG9ydGFsKTtcblxuICAgIC8vIE5lZWRzIHRvIGJlIG51bGwgY2hlY2tlZCBzaW5jZSB3ZSBpbml0aWFsaXplIGl0IGluIGBuZ0FmdGVyVmlld0luaXRgLlxuICAgIGlmICh0aGlzLl9wb3J0YWwgJiYgdGhpcy5fcG9ydGFsLmlzQXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX3BvcnRhbD8uZGV0YWNoKCk7XG4gICAgfVxuICB9XG59XG4iXX0=