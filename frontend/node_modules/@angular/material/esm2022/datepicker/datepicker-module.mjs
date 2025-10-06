/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { MatCommonModule } from '@angular/material/core';
import { MatCalendar, MatCalendarHeader } from './calendar';
import { MatCalendarBody } from './calendar-body';
import { MatDatepicker } from './datepicker';
import { MatDatepickerContent, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER, } from './datepicker-base';
import { MatDatepickerInput } from './datepicker-input';
import { MatDatepickerIntl } from './datepicker-intl';
import { MatDatepickerToggle, MatDatepickerToggleIcon } from './datepicker-toggle';
import { MatMonthView } from './month-view';
import { MatMultiYearView } from './multi-year-view';
import { MatYearView } from './year-view';
import { MatDateRangeInput } from './date-range-input';
import { MatStartDate, MatEndDate } from './date-range-input-parts';
import { MatDateRangePicker } from './date-range-picker';
import { MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel } from './datepicker-actions';
import * as i0 from "@angular/core";
export class MatDatepickerModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerModule, imports: [CommonModule,
            MatButtonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            MatCommonModule,
            MatCalendar,
            MatCalendarBody,
            MatDatepicker,
            MatDatepickerContent,
            MatDatepickerInput,
            MatDatepickerToggle,
            MatDatepickerToggleIcon,
            MatMonthView,
            MatYearView,
            MatMultiYearView,
            MatCalendarHeader,
            MatDateRangeInput,
            MatStartDate,
            MatEndDate,
            MatDateRangePicker,
            MatDatepickerActions,
            MatDatepickerCancel,
            MatDatepickerApply], exports: [CdkScrollableModule,
            MatCalendar,
            MatCalendarBody,
            MatDatepicker,
            MatDatepickerContent,
            MatDatepickerInput,
            MatDatepickerToggle,
            MatDatepickerToggleIcon,
            MatMonthView,
            MatYearView,
            MatMultiYearView,
            MatCalendarHeader,
            MatDateRangeInput,
            MatStartDate,
            MatEndDate,
            MatDateRangePicker,
            MatDatepickerActions,
            MatDatepickerCancel,
            MatDatepickerApply] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerModule, providers: [MatDatepickerIntl, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER], imports: [CommonModule,
            MatButtonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            MatCommonModule,
            MatDatepickerContent,
            MatDatepickerToggle,
            MatCalendarHeader, CdkScrollableModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDatepickerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        MatButtonModule,
                        OverlayModule,
                        A11yModule,
                        PortalModule,
                        MatCommonModule,
                        MatCalendar,
                        MatCalendarBody,
                        MatDatepicker,
                        MatDatepickerContent,
                        MatDatepickerInput,
                        MatDatepickerToggle,
                        MatDatepickerToggleIcon,
                        MatMonthView,
                        MatYearView,
                        MatMultiYearView,
                        MatCalendarHeader,
                        MatDateRangeInput,
                        MatStartDate,
                        MatEndDate,
                        MatDateRangePicker,
                        MatDatepickerActions,
                        MatDatepickerCancel,
                        MatDatepickerApply,
                    ],
                    exports: [
                        CdkScrollableModule,
                        MatCalendar,
                        MatCalendarBody,
                        MatDatepicker,
                        MatDatepickerContent,
                        MatDatepickerInput,
                        MatDatepickerToggle,
                        MatDatepickerToggleIcon,
                        MatMonthView,
                        MatYearView,
                        MatMultiYearView,
                        MatCalendarHeader,
                        MatDateRangeInput,
                        MatStartDate,
                        MatEndDate,
                        MatDateRangePicker,
                        MatDatepickerActions,
                        MatDatepickerCancel,
                        MatDatepickerApply,
                    ],
                    providers: [MatDatepickerIntl, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlcGlja2VyLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDekQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDM0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDMUQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDM0MsT0FBTyxFQUNMLG9CQUFvQixFQUNwQiwrQ0FBK0MsR0FDaEQsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFDLFlBQVksRUFBRSxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQzs7QUFvRG5HLE1BQU0sT0FBTyxtQkFBbUI7cUhBQW5CLG1CQUFtQjtzSEFBbkIsbUJBQW1CLFlBaEQ1QixZQUFZO1lBQ1osZUFBZTtZQUNmLGFBQWE7WUFDYixVQUFVO1lBQ1YsWUFBWTtZQUNaLGVBQWU7WUFDZixXQUFXO1lBQ1gsZUFBZTtZQUNmLGFBQWE7WUFDYixvQkFBb0I7WUFDcEIsa0JBQWtCO1lBQ2xCLG1CQUFtQjtZQUNuQix1QkFBdUI7WUFDdkIsWUFBWTtZQUNaLFdBQVc7WUFDWCxnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLGlCQUFpQjtZQUNqQixZQUFZO1lBQ1osVUFBVTtZQUNWLGtCQUFrQjtZQUNsQixvQkFBb0I7WUFDcEIsbUJBQW1CO1lBQ25CLGtCQUFrQixhQUdsQixtQkFBbUI7WUFDbkIsV0FBVztZQUNYLGVBQWU7WUFDZixhQUFhO1lBQ2Isb0JBQW9CO1lBQ3BCLGtCQUFrQjtZQUNsQixtQkFBbUI7WUFDbkIsdUJBQXVCO1lBQ3ZCLFlBQVk7WUFDWixXQUFXO1lBQ1gsZ0JBQWdCO1lBQ2hCLGlCQUFpQjtZQUNqQixpQkFBaUI7WUFDakIsWUFBWTtZQUNaLFVBQVU7WUFDVixrQkFBa0I7WUFDbEIsb0JBQW9CO1lBQ3BCLG1CQUFtQjtZQUNuQixrQkFBa0I7c0hBSVQsbUJBQW1CLGFBRm5CLENBQUMsaUJBQWlCLEVBQUUsK0NBQStDLENBQUMsWUE5QzdFLFlBQVk7WUFDWixlQUFlO1lBQ2YsYUFBYTtZQUNiLFVBQVU7WUFDVixZQUFZO1lBQ1osZUFBZTtZQUlmLG9CQUFvQjtZQUVwQixtQkFBbUI7WUFLbkIsaUJBQWlCLEVBVWpCLG1CQUFtQjs7a0dBc0JWLG1CQUFtQjtrQkFsRC9CLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osZUFBZTt3QkFDZixhQUFhO3dCQUNiLFVBQVU7d0JBQ1YsWUFBWTt3QkFDWixlQUFlO3dCQUNmLFdBQVc7d0JBQ1gsZUFBZTt3QkFDZixhQUFhO3dCQUNiLG9CQUFvQjt3QkFDcEIsa0JBQWtCO3dCQUNsQixtQkFBbUI7d0JBQ25CLHVCQUF1Qjt3QkFDdkIsWUFBWTt3QkFDWixXQUFXO3dCQUNYLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixpQkFBaUI7d0JBQ2pCLFlBQVk7d0JBQ1osVUFBVTt3QkFDVixrQkFBa0I7d0JBQ2xCLG9CQUFvQjt3QkFDcEIsbUJBQW1CO3dCQUNuQixrQkFBa0I7cUJBQ25CO29CQUNELE9BQU8sRUFBRTt3QkFDUCxtQkFBbUI7d0JBQ25CLFdBQVc7d0JBQ1gsZUFBZTt3QkFDZixhQUFhO3dCQUNiLG9CQUFvQjt3QkFDcEIsa0JBQWtCO3dCQUNsQixtQkFBbUI7d0JBQ25CLHVCQUF1Qjt3QkFDdkIsWUFBWTt3QkFDWixXQUFXO3dCQUNYLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixpQkFBaUI7d0JBQ2pCLFlBQVk7d0JBQ1osVUFBVTt3QkFDVixrQkFBa0I7d0JBQ2xCLG9CQUFvQjt3QkFDcEIsbUJBQW1CO3dCQUNuQixrQkFBa0I7cUJBQ25CO29CQUNELFNBQVMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLCtDQUErQyxDQUFDO2lCQUNoRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ExMXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtQb3J0YWxNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0QnV0dG9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHtDZGtTY3JvbGxhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0Q2FsZW5kYXIsIE1hdENhbGVuZGFySGVhZGVyfSBmcm9tICcuL2NhbGVuZGFyJztcbmltcG9ydCB7TWF0Q2FsZW5kYXJCb2R5fSBmcm9tICcuL2NhbGVuZGFyLWJvZHknO1xuaW1wb3J0IHtNYXREYXRlcGlja2VyfSBmcm9tICcuL2RhdGVwaWNrZXInO1xuaW1wb3J0IHtcbiAgTWF0RGF0ZXBpY2tlckNvbnRlbnQsXG4gIE1BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSLFxufSBmcm9tICcuL2RhdGVwaWNrZXItYmFzZSc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJJbnB1dH0gZnJvbSAnLi9kYXRlcGlja2VyLWlucHV0JztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckludGx9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnRsJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlclRvZ2dsZSwgTWF0RGF0ZXBpY2tlclRvZ2dsZUljb259IGZyb20gJy4vZGF0ZXBpY2tlci10b2dnbGUnO1xuaW1wb3J0IHtNYXRNb250aFZpZXd9IGZyb20gJy4vbW9udGgtdmlldyc7XG5pbXBvcnQge01hdE11bHRpWWVhclZpZXd9IGZyb20gJy4vbXVsdGkteWVhci12aWV3JztcbmltcG9ydCB7TWF0WWVhclZpZXd9IGZyb20gJy4veWVhci12aWV3JztcbmltcG9ydCB7TWF0RGF0ZVJhbmdlSW5wdXR9IGZyb20gJy4vZGF0ZS1yYW5nZS1pbnB1dCc7XG5pbXBvcnQge01hdFN0YXJ0RGF0ZSwgTWF0RW5kRGF0ZX0gZnJvbSAnLi9kYXRlLXJhbmdlLWlucHV0LXBhcnRzJztcbmltcG9ydCB7TWF0RGF0ZVJhbmdlUGlja2VyfSBmcm9tICcuL2RhdGUtcmFuZ2UtcGlja2VyJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckFjdGlvbnMsIE1hdERhdGVwaWNrZXJBcHBseSwgTWF0RGF0ZXBpY2tlckNhbmNlbH0gZnJvbSAnLi9kYXRlcGlja2VyLWFjdGlvbnMnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIE1hdEJ1dHRvbk1vZHVsZSxcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIEExMXlNb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIE1hdENvbW1vbk1vZHVsZSxcbiAgICBNYXRDYWxlbmRhcixcbiAgICBNYXRDYWxlbmRhckJvZHksXG4gICAgTWF0RGF0ZXBpY2tlcixcbiAgICBNYXREYXRlcGlja2VyQ29udGVudCxcbiAgICBNYXREYXRlcGlja2VySW5wdXQsXG4gICAgTWF0RGF0ZXBpY2tlclRvZ2dsZSxcbiAgICBNYXREYXRlcGlja2VyVG9nZ2xlSWNvbixcbiAgICBNYXRNb250aFZpZXcsXG4gICAgTWF0WWVhclZpZXcsXG4gICAgTWF0TXVsdGlZZWFyVmlldyxcbiAgICBNYXRDYWxlbmRhckhlYWRlcixcbiAgICBNYXREYXRlUmFuZ2VJbnB1dCxcbiAgICBNYXRTdGFydERhdGUsXG4gICAgTWF0RW5kRGF0ZSxcbiAgICBNYXREYXRlUmFuZ2VQaWNrZXIsXG4gICAgTWF0RGF0ZXBpY2tlckFjdGlvbnMsXG4gICAgTWF0RGF0ZXBpY2tlckNhbmNlbCxcbiAgICBNYXREYXRlcGlja2VyQXBwbHksXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBDZGtTY3JvbGxhYmxlTW9kdWxlLFxuICAgIE1hdENhbGVuZGFyLFxuICAgIE1hdENhbGVuZGFyQm9keSxcbiAgICBNYXREYXRlcGlja2VyLFxuICAgIE1hdERhdGVwaWNrZXJDb250ZW50LFxuICAgIE1hdERhdGVwaWNrZXJJbnB1dCxcbiAgICBNYXREYXRlcGlja2VyVG9nZ2xlLFxuICAgIE1hdERhdGVwaWNrZXJUb2dnbGVJY29uLFxuICAgIE1hdE1vbnRoVmlldyxcbiAgICBNYXRZZWFyVmlldyxcbiAgICBNYXRNdWx0aVllYXJWaWV3LFxuICAgIE1hdENhbGVuZGFySGVhZGVyLFxuICAgIE1hdERhdGVSYW5nZUlucHV0LFxuICAgIE1hdFN0YXJ0RGF0ZSxcbiAgICBNYXRFbmREYXRlLFxuICAgIE1hdERhdGVSYW5nZVBpY2tlcixcbiAgICBNYXREYXRlcGlja2VyQWN0aW9ucyxcbiAgICBNYXREYXRlcGlja2VyQ2FuY2VsLFxuICAgIE1hdERhdGVwaWNrZXJBcHBseSxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbTWF0RGF0ZXBpY2tlckludGwsIE1BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGF0ZXBpY2tlck1vZHVsZSB7fVxuIl19