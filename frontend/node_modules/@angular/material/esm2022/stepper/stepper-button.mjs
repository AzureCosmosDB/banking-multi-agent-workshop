/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkStepperNext, CdkStepperPrevious } from '@angular/cdk/stepper';
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
/** Button that moves to the next step in a stepper workflow. */
export class MatStepperNext extends CdkStepperNext {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperNext, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepperNext, isStandalone: true, selector: "button[matStepperNext]", host: { properties: { "type": "type" }, classAttribute: "mat-stepper-next" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperNext, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[matStepperNext]',
                    host: {
                        'class': 'mat-stepper-next',
                        '[type]': 'type',
                    },
                    standalone: true,
                }]
        }] });
/** Button that moves to the previous step in a stepper workflow. */
export class MatStepperPrevious extends CdkStepperPrevious {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperPrevious, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepperPrevious, isStandalone: true, selector: "button[matStepperPrevious]", host: { properties: { "type": "type" }, classAttribute: "mat-stepper-previous" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperPrevious, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[matStepperPrevious]',
                    host: {
                        'class': 'mat-stepper-previous',
                        '[type]': 'type',
                    },
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1idXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc3RlcHBlci9zdGVwcGVyLWJ1dHRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFeEMsZ0VBQWdFO0FBU2hFLE1BQU0sT0FBTyxjQUFlLFNBQVEsY0FBYztxSEFBckMsY0FBYzt5R0FBZCxjQUFjOztrR0FBZCxjQUFjO2tCQVIxQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsa0JBQWtCO3dCQUMzQixRQUFRLEVBQUUsTUFBTTtxQkFDakI7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOztBQUdELG9FQUFvRTtBQVNwRSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsa0JBQWtCO3FIQUE3QyxrQkFBa0I7eUdBQWxCLGtCQUFrQjs7a0dBQWxCLGtCQUFrQjtrQkFSOUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsNEJBQTRCO29CQUN0QyxJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLHNCQUFzQjt3QkFDL0IsUUFBUSxFQUFFLE1BQU07cUJBQ2pCO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka1N0ZXBwZXJOZXh0LCBDZGtTdGVwcGVyUHJldmlvdXN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zdGVwcGVyJztcbmltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqIEJ1dHRvbiB0aGF0IG1vdmVzIHRvIHRoZSBuZXh0IHN0ZXAgaW4gYSBzdGVwcGVyIHdvcmtmbG93LiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYnV0dG9uW21hdFN0ZXBwZXJOZXh0XScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LXN0ZXBwZXItbmV4dCcsXG4gICAgJ1t0eXBlXSc6ICd0eXBlJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U3RlcHBlck5leHQgZXh0ZW5kcyBDZGtTdGVwcGVyTmV4dCB7fVxuXG4vKiogQnV0dG9uIHRoYXQgbW92ZXMgdG8gdGhlIHByZXZpb3VzIHN0ZXAgaW4gYSBzdGVwcGVyIHdvcmtmbG93LiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYnV0dG9uW21hdFN0ZXBwZXJQcmV2aW91c10nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1zdGVwcGVyLXByZXZpb3VzJyxcbiAgICAnW3R5cGVdJzogJ3R5cGUnLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTdGVwcGVyUHJldmlvdXMgZXh0ZW5kcyBDZGtTdGVwcGVyUHJldmlvdXMge31cbiJdfQ==