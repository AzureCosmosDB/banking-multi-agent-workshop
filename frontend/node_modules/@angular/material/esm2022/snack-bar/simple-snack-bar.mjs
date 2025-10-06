/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBarRef } from './snack-bar-ref';
import { MAT_SNACK_BAR_DATA } from './snack-bar-config';
import { MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel } from './snack-bar-content';
import * as i0 from "@angular/core";
import * as i1 from "./snack-bar-ref";
export class SimpleSnackBar {
    constructor(snackBarRef, data) {
        this.snackBarRef = snackBarRef;
        this.data = data;
    }
    /** Performs the action on the snack bar. */
    action() {
        this.snackBarRef.dismissWithAction();
    }
    /** If the action button should be shown. */
    get hasAction() {
        return !!this.data.action;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: SimpleSnackBar, deps: [{ token: i1.MatSnackBarRef }, { token: MAT_SNACK_BAR_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: SimpleSnackBar, isStandalone: true, selector: "simple-snack-bar", host: { classAttribute: "mat-mdc-simple-snack-bar" }, exportAs: ["matSnackBar"], ngImport: i0, template: "<div matSnackBarLabel>\n  {{data.message}}\n</div>\n\n@if (hasAction) {\n  <div matSnackBarActions>\n    <button mat-button matSnackBarAction (click)=\"action()\">\n      {{data.action}}\n    </button>\n  </div>\n}\n", styles: [".mat-mdc-simple-snack-bar{display:flex}"], dependencies: [{ kind: "component", type: MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "directive", type: MatSnackBarLabel, selector: "[matSnackBarLabel]" }, { kind: "directive", type: MatSnackBarActions, selector: "[matSnackBarActions]" }, { kind: "directive", type: MatSnackBarAction, selector: "[matSnackBarAction]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: SimpleSnackBar, decorators: [{
            type: Component,
            args: [{ selector: 'simple-snack-bar', exportAs: 'matSnackBar', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [MatButton, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction], standalone: true, host: {
                        'class': 'mat-mdc-simple-snack-bar',
                    }, template: "<div matSnackBarLabel>\n  {{data.message}}\n</div>\n\n@if (hasAction) {\n  <div matSnackBarActions>\n    <button mat-button matSnackBarAction (click)=\"action()\">\n      {{data.action}}\n    </button>\n  </div>\n}\n", styles: [".mat-mdc-simple-snack-bar{display:flex}"] }]
        }], ctorParameters: () => [{ type: i1.MatSnackBarRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_SNACK_BAR_DATA]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXNuYWNrLWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc2ltcGxlLXNuYWNrLWJhci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc2ltcGxlLXNuYWNrLWJhci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7OztBQXlCNUYsTUFBTSxPQUFPLGNBQWM7SUFDekIsWUFDUyxXQUEyQyxFQUNmLElBQXVDO1FBRG5FLGdCQUFXLEdBQVgsV0FBVyxDQUFnQztRQUNmLFNBQUksR0FBSixJQUFJLENBQW1DO0lBQ3pFLENBQUM7SUFFSiw0Q0FBNEM7SUFDNUMsTUFBTTtRQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsNENBQTRDO0lBQzVDLElBQUksU0FBUztRQUNYLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7cUhBZFUsY0FBYyxnREFHZixrQkFBa0I7eUdBSGpCLGNBQWMsNkpDckMzQiwwTkFXQSxpR0RvQlksU0FBUyxpTEFBRSxnQkFBZ0IsK0RBQUUsa0JBQWtCLGlFQUFFLGlCQUFpQjs7a0dBTWpFLGNBQWM7a0JBYjFCLFNBQVM7K0JBQ0Usa0JBQWtCLFlBR2xCLGFBQWEsaUJBQ1IsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTSxXQUN0QyxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsQ0FBQyxjQUNqRSxJQUFJLFFBQ1Y7d0JBQ0osT0FBTyxFQUFFLDBCQUEwQjtxQkFDcEM7OzBCQUtFLE1BQU07MkJBQUMsa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgSW5qZWN0LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEJ1dHRvbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcbmltcG9ydCB7TWF0U25hY2tCYXJSZWZ9IGZyb20gJy4vc25hY2stYmFyLXJlZic7XG5pbXBvcnQge01BVF9TTkFDS19CQVJfREFUQX0gZnJvbSAnLi9zbmFjay1iYXItY29uZmlnJztcbmltcG9ydCB7TWF0U25hY2tCYXJBY3Rpb24sIE1hdFNuYWNrQmFyQWN0aW9ucywgTWF0U25hY2tCYXJMYWJlbH0gZnJvbSAnLi9zbmFjay1iYXItY29udGVudCc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBhIHNpbXBsZSBzbmFjayBiYXIgY29tcG9uZW50IHRoYXQgaGFzIGEgbWVzc2FnZSBhbmQgYSBzaW5nbGUgYWN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRleHRPbmx5U25hY2tCYXIge1xuICBkYXRhOiB7bWVzc2FnZTogc3RyaW5nOyBhY3Rpb246IHN0cmluZ307XG4gIHNuYWNrQmFyUmVmOiBNYXRTbmFja0JhclJlZjxUZXh0T25seVNuYWNrQmFyPjtcbiAgYWN0aW9uOiAoKSA9PiB2b2lkO1xuICBoYXNBY3Rpb246IGJvb2xlYW47XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3NpbXBsZS1zbmFjay1iYXInLFxuICB0ZW1wbGF0ZVVybDogJ3NpbXBsZS1zbmFjay1iYXIuaHRtbCcsXG4gIHN0eWxlVXJsOiAnc2ltcGxlLXNuYWNrLWJhci5jc3MnLFxuICBleHBvcnRBczogJ21hdFNuYWNrQmFyJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGltcG9ydHM6IFtNYXRCdXR0b24sIE1hdFNuYWNrQmFyTGFiZWwsIE1hdFNuYWNrQmFyQWN0aW9ucywgTWF0U25hY2tCYXJBY3Rpb25dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1tZGMtc2ltcGxlLXNuYWNrLWJhcicsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIFNpbXBsZVNuYWNrQmFyIGltcGxlbWVudHMgVGV4dE9ubHlTbmFja0JhciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzbmFja0JhclJlZjogTWF0U25hY2tCYXJSZWY8U2ltcGxlU25hY2tCYXI+LFxuICAgIEBJbmplY3QoTUFUX1NOQUNLX0JBUl9EQVRBKSBwdWJsaWMgZGF0YToge21lc3NhZ2U6IHN0cmluZzsgYWN0aW9uOiBzdHJpbmd9LFxuICApIHt9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBhY3Rpb24gb24gdGhlIHNuYWNrIGJhci4gKi9cbiAgYWN0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuc25hY2tCYXJSZWYuZGlzbWlzc1dpdGhBY3Rpb24oKTtcbiAgfVxuXG4gIC8qKiBJZiB0aGUgYWN0aW9uIGJ1dHRvbiBzaG91bGQgYmUgc2hvd24uICovXG4gIGdldCBoYXNBY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5kYXRhLmFjdGlvbjtcbiAgfVxufVxuIiwiPGRpdiBtYXRTbmFja0JhckxhYmVsPlxuICB7e2RhdGEubWVzc2FnZX19XG48L2Rpdj5cblxuQGlmIChoYXNBY3Rpb24pIHtcbiAgPGRpdiBtYXRTbmFja0JhckFjdGlvbnM+XG4gICAgPGJ1dHRvbiBtYXQtYnV0dG9uIG1hdFNuYWNrQmFyQWN0aW9uIChjbGljayk9XCJhY3Rpb24oKVwiPlxuICAgICAge3tkYXRhLmFjdGlvbn19XG4gICAgPC9idXR0b24+XG4gIDwvZGl2PlxufVxuIl19