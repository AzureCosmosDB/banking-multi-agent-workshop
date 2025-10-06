/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDatepickerBase } from './datepicker-base';
import { MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import { MAT_CALENDAR_RANGE_STRATEGY_PROVIDER } from './date-range-selection-strategy';
import * as i0 from "@angular/core";
// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="matDateRangePicker"). We can change this to a
// directive if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the date range picker popup/dialog. */
export class MatDateRangePicker extends MatDatepickerBase {
    _forwardContentValues(instance) {
        super._forwardContentValues(instance);
        const input = this.datepickerInput;
        if (input) {
            instance.comparisonStart = input.comparisonStart;
            instance.comparisonEnd = input.comparisonEnd;
            instance.startDateAccessibleName = input._getStartDateAccessibleName();
            instance.endDateAccessibleName = input._getEndDateAccessibleName();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateRangePicker, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDateRangePicker, isStandalone: true, selector: "mat-date-range-picker", providers: [
            MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
            MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
            { provide: MatDatepickerBase, useExisting: MatDateRangePicker },
        ], exportAs: ["matDateRangePicker"], usesInheritance: true, ngImport: i0, template: '', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDateRangePicker, decorators: [{
            type: Component,
            args: [{
                    selector: 'mat-date-range-picker',
                    template: '',
                    exportAs: 'matDateRangePicker',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
                        MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
                        { provide: MatDatepickerBase, useExisting: MatDateRangePicker },
                    ],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1waWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlLXJhbmdlLXBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3BGLE9BQU8sRUFBQyxpQkFBaUIsRUFBNkMsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRyxPQUFPLEVBQUMsdUNBQXVDLEVBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUMxRixPQUFPLEVBQUMsb0NBQW9DLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQzs7QUFhckYsOEZBQThGO0FBQzlGLDZGQUE2RjtBQUM3RiwrRUFBK0U7QUFDL0UsNkVBQTZFO0FBYzdFLE1BQU0sT0FBTyxrQkFBc0IsU0FBUSxpQkFJMUM7SUFDb0IscUJBQXFCLENBQUMsUUFBK0M7UUFDdEYsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFFbkMsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLFFBQVEsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUNqRCxRQUFRLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDN0MsUUFBUSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ3ZFLFFBQVEsQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUNyRSxDQUFDO0lBQ0gsQ0FBQztxSEFoQlUsa0JBQWtCO3lHQUFsQixrQkFBa0Isb0VBUGxCO1lBQ1QsdUNBQXVDO1lBQ3ZDLG9DQUFvQztZQUNwQyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUM7U0FDOUQsbUZBUlMsRUFBRTs7a0dBV0Qsa0JBQWtCO2tCQWI5QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx1QkFBdUI7b0JBQ2pDLFFBQVEsRUFBRSxFQUFFO29CQUNaLFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO29CQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtvQkFDckMsU0FBUyxFQUFFO3dCQUNULHVDQUF1Qzt3QkFDdkMsb0NBQW9DO3dCQUNwQyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxXQUFXLG9CQUFvQixFQUFDO3FCQUM5RDtvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJCYXNlLCBNYXREYXRlcGlja2VyQ29udGVudCwgTWF0RGF0ZXBpY2tlckNvbnRyb2x9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcbmltcG9ydCB7TUFUX1JBTkdFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSLCBEYXRlUmFuZ2V9IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuaW1wb3J0IHtNQVRfQ0FMRU5EQVJfUkFOR0VfU1RSQVRFR1lfUFJPVklERVJ9IGZyb20gJy4vZGF0ZS1yYW5nZS1zZWxlY3Rpb24tc3RyYXRlZ3knO1xuXG4vKipcbiAqIElucHV0IHRoYXQgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBhIGRhdGUgcmFuZ2UgcGlja2VyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdERhdGVSYW5nZVBpY2tlcklucHV0PEQ+IGV4dGVuZHMgTWF0RGF0ZXBpY2tlckNvbnRyb2w8RD4ge1xuICBfZ2V0RW5kRGF0ZUFjY2Vzc2libGVOYW1lKCk6IHN0cmluZyB8IG51bGw7XG4gIF9nZXRTdGFydERhdGVBY2Nlc3NpYmxlTmFtZSgpOiBzdHJpbmcgfCBudWxsO1xuICBjb21wYXJpc29uU3RhcnQ6IEQgfCBudWxsO1xuICBjb21wYXJpc29uRW5kOiBEIHwgbnVsbDtcbn1cblxuLy8gVE9ETyhtbWFsZXJiYSk6IFdlIHVzZSBhIGNvbXBvbmVudCBpbnN0ZWFkIG9mIGEgZGlyZWN0aXZlIGhlcmUgc28gdGhlIHVzZXIgY2FuIHVzZSBpbXBsaWNpdFxuLy8gdGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlcyAoZS5nLiAjZCB2cyAjZD1cIm1hdERhdGVSYW5nZVBpY2tlclwiKS4gV2UgY2FuIGNoYW5nZSB0aGlzIHRvIGFcbi8vIGRpcmVjdGl2ZSBpZiBhbmd1bGFyIGFkZHMgc3VwcG9ydCBmb3IgYGV4cG9ydEFzOiAnJGltcGxpY2l0J2Agb24gZGlyZWN0aXZlcy5cbi8qKiBDb21wb25lbnQgcmVzcG9uc2libGUgZm9yIG1hbmFnaW5nIHRoZSBkYXRlIHJhbmdlIHBpY2tlciBwb3B1cC9kaWFsb2cuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZGF0ZS1yYW5nZS1waWNrZXInLFxuICB0ZW1wbGF0ZTogJycsXG4gIGV4cG9ydEFzOiAnbWF0RGF0ZVJhbmdlUGlja2VyJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHByb3ZpZGVyczogW1xuICAgIE1BVF9SQU5HRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUixcbiAgICBNQVRfQ0FMRU5EQVJfUkFOR0VfU1RSQVRFR1lfUFJPVklERVIsXG4gICAge3Byb3ZpZGU6IE1hdERhdGVwaWNrZXJCYXNlLCB1c2VFeGlzdGluZzogTWF0RGF0ZVJhbmdlUGlja2VyfSxcbiAgXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGF0ZVJhbmdlUGlja2VyPEQ+IGV4dGVuZHMgTWF0RGF0ZXBpY2tlckJhc2U8XG4gIE1hdERhdGVSYW5nZVBpY2tlcklucHV0PEQ+LFxuICBEYXRlUmFuZ2U8RD4sXG4gIERcbj4ge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgX2ZvcndhcmRDb250ZW50VmFsdWVzKGluc3RhbmNlOiBNYXREYXRlcGlja2VyQ29udGVudDxEYXRlUmFuZ2U8RD4sIEQ+KSB7XG4gICAgc3VwZXIuX2ZvcndhcmRDb250ZW50VmFsdWVzKGluc3RhbmNlKTtcblxuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5kYXRlcGlja2VySW5wdXQ7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGluc3RhbmNlLmNvbXBhcmlzb25TdGFydCA9IGlucHV0LmNvbXBhcmlzb25TdGFydDtcbiAgICAgIGluc3RhbmNlLmNvbXBhcmlzb25FbmQgPSBpbnB1dC5jb21wYXJpc29uRW5kO1xuICAgICAgaW5zdGFuY2Uuc3RhcnREYXRlQWNjZXNzaWJsZU5hbWUgPSBpbnB1dC5fZ2V0U3RhcnREYXRlQWNjZXNzaWJsZU5hbWUoKTtcbiAgICAgIGluc3RhbmNlLmVuZERhdGVBY2Nlc3NpYmxlTmFtZSA9IGlucHV0Ll9nZXRFbmREYXRlQWNjZXNzaWJsZU5hbWUoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==