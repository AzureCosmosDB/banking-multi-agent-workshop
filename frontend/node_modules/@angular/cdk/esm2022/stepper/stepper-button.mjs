/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input } from '@angular/core';
import { CdkStepper } from './stepper';
import * as i0 from "@angular/core";
import * as i1 from "./stepper";
/** Button that moves to the next step in a stepper workflow. */
export class CdkStepperNext {
    constructor(_stepper) {
        this._stepper = _stepper;
        /** Type of the next button. Defaults to "submit" if not specified. */
        this.type = 'submit';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperNext, deps: [{ token: i1.CdkStepper }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkStepperNext, isStandalone: true, selector: "button[cdkStepperNext]", inputs: { type: "type" }, host: { listeners: { "click": "_stepper.next()" }, properties: { "type": "type" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperNext, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkStepperNext]',
                    host: {
                        '[type]': 'type',
                        '(click)': '_stepper.next()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.CdkStepper }], propDecorators: { type: [{
                type: Input
            }] } });
/** Button that moves to the previous step in a stepper workflow. */
export class CdkStepperPrevious {
    constructor(_stepper) {
        this._stepper = _stepper;
        /** Type of the previous button. Defaults to "button" if not specified. */
        this.type = 'button';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperPrevious, deps: [{ token: i1.CdkStepper }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkStepperPrevious, isStandalone: true, selector: "button[cdkStepperPrevious]", inputs: { type: "type" }, host: { listeners: { "click": "_stepper.previous()" }, properties: { "type": "type" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperPrevious, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkStepperPrevious]',
                    host: {
                        '[type]': 'type',
                        '(click)': '_stepper.previous()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.CdkStepper }], propDecorators: { type: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1idXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3N0ZXBwZXIvc3RlcHBlci1idXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFL0MsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7O0FBRXJDLGdFQUFnRTtBQVNoRSxNQUFNLE9BQU8sY0FBYztJQUl6QixZQUFtQixRQUFvQjtRQUFwQixhQUFRLEdBQVIsUUFBUSxDQUFZO1FBSHZDLHNFQUFzRTtRQUM3RCxTQUFJLEdBQVcsUUFBUSxDQUFDO0lBRVMsQ0FBQztxSEFKaEMsY0FBYzt5R0FBZCxjQUFjOztrR0FBZCxjQUFjO2tCQVIxQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx3QkFBd0I7b0JBQ2xDLElBQUksRUFBRTt3QkFDSixRQUFRLEVBQUUsTUFBTTt3QkFDaEIsU0FBUyxFQUFFLGlCQUFpQjtxQkFDN0I7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOytFQUdVLElBQUk7c0JBQVosS0FBSzs7QUFLUixvRUFBb0U7QUFTcEUsTUFBTSxPQUFPLGtCQUFrQjtJQUk3QixZQUFtQixRQUFvQjtRQUFwQixhQUFRLEdBQVIsUUFBUSxDQUFZO1FBSHZDLDBFQUEwRTtRQUNqRSxTQUFJLEdBQVcsUUFBUSxDQUFDO0lBRVMsQ0FBQztxSEFKaEMsa0JBQWtCO3lHQUFsQixrQkFBa0I7O2tHQUFsQixrQkFBa0I7a0JBUjlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtvQkFDdEMsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxNQUFNO3dCQUNoQixTQUFTLEVBQUUscUJBQXFCO3FCQUNqQztvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakI7K0VBR1UsSUFBSTtzQkFBWixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q2RrU3RlcHBlcn0gZnJvbSAnLi9zdGVwcGVyJztcblxuLyoqIEJ1dHRvbiB0aGF0IG1vdmVzIHRvIHRoZSBuZXh0IHN0ZXAgaW4gYSBzdGVwcGVyIHdvcmtmbG93LiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYnV0dG9uW2Nka1N0ZXBwZXJOZXh0XScsXG4gIGhvc3Q6IHtcbiAgICAnW3R5cGVdJzogJ3R5cGUnLFxuICAgICcoY2xpY2spJzogJ19zdGVwcGVyLm5leHQoKScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1N0ZXBwZXJOZXh0IHtcbiAgLyoqIFR5cGUgb2YgdGhlIG5leHQgYnV0dG9uLiBEZWZhdWx0cyB0byBcInN1Ym1pdFwiIGlmIG5vdCBzcGVjaWZpZWQuICovXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZyA9ICdzdWJtaXQnO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfc3RlcHBlcjogQ2RrU3RlcHBlcikge31cbn1cblxuLyoqIEJ1dHRvbiB0aGF0IG1vdmVzIHRvIHRoZSBwcmV2aW91cyBzdGVwIGluIGEgc3RlcHBlciB3b3JrZmxvdy4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2J1dHRvbltjZGtTdGVwcGVyUHJldmlvdXNdJyxcbiAgaG9zdDoge1xuICAgICdbdHlwZV0nOiAndHlwZScsXG4gICAgJyhjbGljayknOiAnX3N0ZXBwZXIucHJldmlvdXMoKScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1N0ZXBwZXJQcmV2aW91cyB7XG4gIC8qKiBUeXBlIG9mIHRoZSBwcmV2aW91cyBidXR0b24uIERlZmF1bHRzIHRvIFwiYnV0dG9uXCIgaWYgbm90IHNwZWNpZmllZC4gKi9cbiAgQElucHV0KCkgdHlwZTogc3RyaW5nID0gJ2J1dHRvbic7XG5cbiAgY29uc3RydWN0b3IocHVibGljIF9zdGVwcGVyOiBDZGtTdGVwcGVyKSB7fVxufVxuIl19