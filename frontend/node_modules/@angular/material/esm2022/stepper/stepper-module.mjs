/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PortalModule } from '@angular/cdk/portal';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatStepHeader } from './step-header';
import { MatStepLabel } from './step-label';
import { MatStep, MatStepper } from './stepper';
import { MatStepperNext, MatStepperPrevious } from './stepper-button';
import { MatStepperIcon } from './stepper-icon';
import { MAT_STEPPER_INTL_PROVIDER } from './stepper-intl';
import { MatStepContent } from './step-content';
import * as i0 from "@angular/core";
export class MatStepperModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, imports: [MatCommonModule,
            CommonModule,
            PortalModule,
            CdkStepperModule,
            MatIconModule,
            MatRippleModule,
            MatStep,
            MatStepLabel,
            MatStepper,
            MatStepperNext,
            MatStepperPrevious,
            MatStepHeader,
            MatStepperIcon,
            MatStepContent], exports: [MatCommonModule,
            MatStep,
            MatStepLabel,
            MatStepper,
            MatStepperNext,
            MatStepperPrevious,
            MatStepHeader,
            MatStepperIcon,
            MatStepContent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, providers: [MAT_STEPPER_INTL_PROVIDER, ErrorStateMatcher], imports: [MatCommonModule,
            CommonModule,
            PortalModule,
            CdkStepperModule,
            MatIconModule,
            MatRippleModule,
            MatStepper,
            MatStepHeader, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        CommonModule,
                        PortalModule,
                        CdkStepperModule,
                        MatIconModule,
                        MatRippleModule,
                        MatStep,
                        MatStepLabel,
                        MatStepper,
                        MatStepperNext,
                        MatStepperPrevious,
                        MatStepHeader,
                        MatStepperIcon,
                        MatStepContent,
                    ],
                    exports: [
                        MatCommonModule,
                        MatStep,
                        MatStepLabel,
                        MatStepper,
                        MatStepperNext,
                        MatStepperPrevious,
                        MatStepHeader,
                        MatStepperIcon,
                        MatStepContent,
                    ],
                    providers: [MAT_STEPPER_INTL_PROVIDER, ErrorStateMatcher],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc3RlcHBlci9zdGVwcGVyLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzlDLE9BQU8sRUFBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztBQWdDOUMsTUFBTSxPQUFPLGdCQUFnQjtxSEFBaEIsZ0JBQWdCO3NIQUFoQixnQkFBZ0IsWUE1QnpCLGVBQWU7WUFDZixZQUFZO1lBQ1osWUFBWTtZQUNaLGdCQUFnQjtZQUNoQixhQUFhO1lBQ2IsZUFBZTtZQUNmLE9BQU87WUFDUCxZQUFZO1lBQ1osVUFBVTtZQUNWLGNBQWM7WUFDZCxrQkFBa0I7WUFDbEIsYUFBYTtZQUNiLGNBQWM7WUFDZCxjQUFjLGFBR2QsZUFBZTtZQUNmLE9BQU87WUFDUCxZQUFZO1lBQ1osVUFBVTtZQUNWLGNBQWM7WUFDZCxrQkFBa0I7WUFDbEIsYUFBYTtZQUNiLGNBQWM7WUFDZCxjQUFjO3NIQUlMLGdCQUFnQixhQUZoQixDQUFDLHlCQUF5QixFQUFFLGlCQUFpQixDQUFDLFlBMUJ2RCxlQUFlO1lBQ2YsWUFBWTtZQUNaLFlBQVk7WUFDWixnQkFBZ0I7WUFDaEIsYUFBYTtZQUNiLGVBQWU7WUFHZixVQUFVO1lBR1YsYUFBYSxFQUtiLGVBQWU7O2tHQVlOLGdCQUFnQjtrQkE5QjVCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLGVBQWU7d0JBQ2YsWUFBWTt3QkFDWixZQUFZO3dCQUNaLGdCQUFnQjt3QkFDaEIsYUFBYTt3QkFDYixlQUFlO3dCQUNmLE9BQU87d0JBQ1AsWUFBWTt3QkFDWixVQUFVO3dCQUNWLGNBQWM7d0JBQ2Qsa0JBQWtCO3dCQUNsQixhQUFhO3dCQUNiLGNBQWM7d0JBQ2QsY0FBYztxQkFDZjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1AsZUFBZTt3QkFDZixPQUFPO3dCQUNQLFlBQVk7d0JBQ1osVUFBVTt3QkFDVixjQUFjO3dCQUNkLGtCQUFrQjt3QkFDbEIsYUFBYTt3QkFDYixjQUFjO3dCQUNkLGNBQWM7cUJBQ2Y7b0JBQ0QsU0FBUyxFQUFFLENBQUMseUJBQXlCLEVBQUUsaUJBQWlCLENBQUM7aUJBQzFEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UG9ydGFsTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7Q2RrU3RlcHBlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3N0ZXBwZXInO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RXJyb3JTdGF0ZU1hdGNoZXIsIE1hdENvbW1vbk1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0SWNvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5pbXBvcnQge01hdFN0ZXBIZWFkZXJ9IGZyb20gJy4vc3RlcC1oZWFkZXInO1xuaW1wb3J0IHtNYXRTdGVwTGFiZWx9IGZyb20gJy4vc3RlcC1sYWJlbCc7XG5pbXBvcnQge01hdFN0ZXAsIE1hdFN0ZXBwZXJ9IGZyb20gJy4vc3RlcHBlcic7XG5pbXBvcnQge01hdFN0ZXBwZXJOZXh0LCBNYXRTdGVwcGVyUHJldmlvdXN9IGZyb20gJy4vc3RlcHBlci1idXR0b24nO1xuaW1wb3J0IHtNYXRTdGVwcGVySWNvbn0gZnJvbSAnLi9zdGVwcGVyLWljb24nO1xuaW1wb3J0IHtNQVRfU1RFUFBFUl9JTlRMX1BST1ZJREVSfSBmcm9tICcuL3N0ZXBwZXItaW50bCc7XG5pbXBvcnQge01hdFN0ZXBDb250ZW50fSBmcm9tICcuL3N0ZXAtY29udGVudCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBDZGtTdGVwcGVyTW9kdWxlLFxuICAgIE1hdEljb25Nb2R1bGUsXG4gICAgTWF0UmlwcGxlTW9kdWxlLFxuICAgIE1hdFN0ZXAsXG4gICAgTWF0U3RlcExhYmVsLFxuICAgIE1hdFN0ZXBwZXIsXG4gICAgTWF0U3RlcHBlck5leHQsXG4gICAgTWF0U3RlcHBlclByZXZpb3VzLFxuICAgIE1hdFN0ZXBIZWFkZXIsXG4gICAgTWF0U3RlcHBlckljb24sXG4gICAgTWF0U3RlcENvbnRlbnQsXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0U3RlcCxcbiAgICBNYXRTdGVwTGFiZWwsXG4gICAgTWF0U3RlcHBlcixcbiAgICBNYXRTdGVwcGVyTmV4dCxcbiAgICBNYXRTdGVwcGVyUHJldmlvdXMsXG4gICAgTWF0U3RlcEhlYWRlcixcbiAgICBNYXRTdGVwcGVySWNvbixcbiAgICBNYXRTdGVwQ29udGVudCxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbTUFUX1NURVBQRVJfSU5UTF9QUk9WSURFUiwgRXJyb3JTdGF0ZU1hdGNoZXJdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTdGVwcGVyTW9kdWxlIHt9XG4iXX0=