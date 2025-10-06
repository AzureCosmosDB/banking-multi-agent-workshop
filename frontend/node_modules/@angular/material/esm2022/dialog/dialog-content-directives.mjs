/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, Optional, } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDialog } from './dialog';
import { _closeDialogVia, MatDialogRef } from './dialog-ref';
import * as i0 from "@angular/core";
import * as i1 from "./dialog-ref";
import * as i2 from "./dialog";
import * as i3 from "@angular/cdk/scrolling";
/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;
/**
 * Button that will close the current dialog.
 */
export class MatDialogClose {
    constructor(
    // The dialog title directive is always used in combination with a `MatDialogRef`.
    // tslint:disable-next-line: lightweight-tokens
    dialogRef, _elementRef, _dialog) {
        this.dialogRef = dialogRef;
        this._elementRef = _elementRef;
        this._dialog = _dialog;
        /** Default to "button" to prevents accidental form submits. */
        this.type = 'button';
    }
    ngOnInit() {
        if (!this.dialogRef) {
            // When this directive is included in a dialog via TemplateRef (rather than being
            // in a Component), the DialogRef isn't available via injection because embedded
            // views cannot be given a custom injector. Instead, we look up the DialogRef by
            // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
            // be resolved at constructor time.
            this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs);
        }
    }
    ngOnChanges(changes) {
        const proxiedChange = changes['_matDialogClose'] || changes['_matDialogCloseResult'];
        if (proxiedChange) {
            this.dialogResult = proxiedChange.currentValue;
        }
    }
    _onButtonClick(event) {
        // Determinate the focus origin using the click event, because using the FocusMonitor will
        // result in incorrect origins. Most of the time, close buttons will be auto focused in the
        // dialog, and therefore clicking the button won't result in a focus change. This means that
        // the FocusMonitor won't detect any origin change, and will always output `program`.
        _closeDialogVia(this.dialogRef, event.screenX === 0 && event.screenY === 0 ? 'keyboard' : 'mouse', this.dialogResult);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogClose, deps: [{ token: i1.MatDialogRef, optional: true }, { token: i0.ElementRef }, { token: i2.MatDialog }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDialogClose, isStandalone: true, selector: "[mat-dialog-close], [matDialogClose]", inputs: { ariaLabel: ["aria-label", "ariaLabel"], type: "type", dialogResult: ["mat-dialog-close", "dialogResult"], _matDialogClose: ["matDialogClose", "_matDialogClose"] }, host: { listeners: { "click": "_onButtonClick($event)" }, properties: { "attr.aria-label": "ariaLabel || null", "attr.type": "type" } }, exportAs: ["matDialogClose"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogClose, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-dialog-close], [matDialogClose]',
                    exportAs: 'matDialogClose',
                    standalone: true,
                    host: {
                        '(click)': '_onButtonClick($event)',
                        '[attr.aria-label]': 'ariaLabel || null',
                        '[attr.type]': 'type',
                    },
                }]
        }], ctorParameters: () => [{ type: i1.MatDialogRef, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i2.MatDialog }], propDecorators: { ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], type: [{
                type: Input
            }], dialogResult: [{
                type: Input,
                args: ['mat-dialog-close']
            }], _matDialogClose: [{
                type: Input,
                args: ['matDialogClose']
            }] } });
export class MatDialogLayoutSection {
    constructor(
    // The dialog title directive is always used in combination with a `MatDialogRef`.
    // tslint:disable-next-line: lightweight-tokens
    _dialogRef, _elementRef, _dialog) {
        this._dialogRef = _dialogRef;
        this._elementRef = _elementRef;
        this._dialog = _dialog;
    }
    ngOnInit() {
        if (!this._dialogRef) {
            this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs);
        }
        if (this._dialogRef) {
            Promise.resolve().then(() => {
                this._onAdd();
            });
        }
    }
    ngOnDestroy() {
        // Note: we null check because there are some internal
        // tests that are mocking out `MatDialogRef` incorrectly.
        const instance = this._dialogRef?._containerInstance;
        if (instance) {
            Promise.resolve().then(() => {
                this._onRemove();
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogLayoutSection, deps: [{ token: i1.MatDialogRef, optional: true }, { token: i0.ElementRef }, { token: i2.MatDialog }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDialogLayoutSection, isStandalone: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogLayoutSection, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], ctorParameters: () => [{ type: i1.MatDialogRef, decorators: [{
                    type: Optional
                }] }, { type: i0.ElementRef }, { type: i2.MatDialog }] });
/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
export class MatDialogTitle extends MatDialogLayoutSection {
    constructor() {
        super(...arguments);
        this.id = `mat-mdc-dialog-title-${dialogElementUid++}`;
    }
    _onAdd() {
        // Note: we null check the queue, because there are some internal
        // tests that are mocking out `MatDialogRef` incorrectly.
        this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);
    }
    _onRemove() {
        this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogTitle, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDialogTitle, isStandalone: true, selector: "[mat-dialog-title], [matDialogTitle]", inputs: { id: "id" }, host: { properties: { "id": "id" }, classAttribute: "mat-mdc-dialog-title mdc-dialog__title" }, exportAs: ["matDialogTitle"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogTitle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-dialog-title], [matDialogTitle]',
                    exportAs: 'matDialogTitle',
                    standalone: true,
                    host: {
                        'class': 'mat-mdc-dialog-title mdc-dialog__title',
                        '[id]': 'id',
                    },
                }]
        }], propDecorators: { id: [{
                type: Input
            }] } });
/**
 * Scrollable content container of a dialog.
 */
export class MatDialogContent {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogContent, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDialogContent, isStandalone: true, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]", host: { classAttribute: "mat-mdc-dialog-content mdc-dialog__content" }, hostDirectives: [{ directive: i3.CdkScrollable }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogContent, decorators: [{
            type: Directive,
            args: [{
                    selector: `[mat-dialog-content], mat-dialog-content, [matDialogContent]`,
                    host: { 'class': 'mat-mdc-dialog-content mdc-dialog__content' },
                    standalone: true,
                    hostDirectives: [CdkScrollable],
                }]
        }] });
/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
export class MatDialogActions extends MatDialogLayoutSection {
    _onAdd() {
        this._dialogRef._containerInstance?._updateActionSectionCount?.(1);
    }
    _onRemove() {
        this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogActions, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatDialogActions, isStandalone: true, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: { align: "align" }, host: { properties: { "class.mat-mdc-dialog-actions-align-start": "align === \"start\"", "class.mat-mdc-dialog-actions-align-center": "align === \"center\"", "class.mat-mdc-dialog-actions-align-end": "align === \"end\"" }, classAttribute: "mat-mdc-dialog-actions mdc-dialog__actions" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatDialogActions, decorators: [{
            type: Directive,
            args: [{
                    selector: `[mat-dialog-actions], mat-dialog-actions, [matDialogActions]`,
                    standalone: true,
                    host: {
                        'class': 'mat-mdc-dialog-actions mdc-dialog__actions',
                        '[class.mat-mdc-dialog-actions-align-start]': 'align === "start"',
                        '[class.mat-mdc-dialog-actions-align-center]': 'align === "center"',
                        '[class.mat-mdc-dialog-actions-align-end]': 'align === "end"',
                    },
                }]
        }], propDecorators: { align: [{
                type: Input
            }] } });
/**
 * Finds the closest MatDialogRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a dialog.
 * @param openDialogs References to the currently-open dialogs.
 */
function getClosestDialog(element, openDialogs) {
    let parent = element.nativeElement.parentElement;
    while (parent && !parent.classList.contains('mat-mdc-dialog-container')) {
        parent = parent.parentElement;
    }
    return parent ? openDialogs.find(dialog => dialog.id === parent.id) : null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRlbnQtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLWNvbnRlbnQtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBSUwsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUVyRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxlQUFlLEVBQUUsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7OztBQUUzRCwrREFBK0Q7QUFDL0QsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFFekI7O0dBRUc7QUFXSCxNQUFNLE9BQU8sY0FBYztJQVl6QjtJQUNFLGtGQUFrRjtJQUNsRiwrQ0FBK0M7SUFDNUIsU0FBNEIsRUFDdkMsV0FBb0MsRUFDcEMsT0FBa0I7UUFGUCxjQUFTLEdBQVQsU0FBUyxDQUFtQjtRQUN2QyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsWUFBTyxHQUFQLE9BQU8sQ0FBVztRQWI1QiwrREFBK0Q7UUFDdEQsU0FBSSxHQUFrQyxRQUFRLENBQUM7SUFhckQsQ0FBQztJQUVKLFFBQVE7UUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLGlGQUFpRjtZQUNqRixnRkFBZ0Y7WUFDaEYsZ0ZBQWdGO1lBQ2hGLG9GQUFvRjtZQUNwRixtQ0FBbUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFFLENBQUM7UUFDakYsQ0FBQztJQUNILENBQUM7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QkFDVCxRQUFRLEVBQUUsOERBQThEO29CQUN4RSxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSw0Q0FBNEM7d0JBQ3JELDRDQUE0QyxFQUFFLG1CQUFtQjt3QkFDakUsNkNBQTZDLEVBQUUsb0JBQW9CO3dCQUNuRSwwQ0FBMEMsRUFBRSxpQkFBaUI7cUJBQzlEO2lCQUNGOzhCQUtVLEtBQUs7c0JBQWIsS0FBSzs7QUFXUjs7OztHQUlHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFnQyxFQUFFLFdBQWdDO0lBQzFGLElBQUksTUFBTSxHQUF1QixPQUFPLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQztJQUVyRSxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsQ0FBQztRQUN4RSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUNoQyxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzlFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFNpbXBsZUNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtTY3JvbGxhYmxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcblxuaW1wb3J0IHtNYXREaWFsb2d9IGZyb20gJy4vZGlhbG9nJztcbmltcG9ydCB7X2Nsb3NlRGlhbG9nVmlhLCBNYXREaWFsb2dSZWZ9IGZyb20gJy4vZGlhbG9nLXJlZic7XG5cbi8qKiBDb3VudGVyIHVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyBmb3IgZGlhbG9nIGVsZW1lbnRzLiAqL1xubGV0IGRpYWxvZ0VsZW1lbnRVaWQgPSAwO1xuXG4vKipcbiAqIEJ1dHRvbiB0aGF0IHdpbGwgY2xvc2UgdGhlIGN1cnJlbnQgZGlhbG9nLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0LWRpYWxvZy1jbG9zZV0sIFttYXREaWFsb2dDbG9zZV0nLFxuICBleHBvcnRBczogJ21hdERpYWxvZ0Nsb3NlJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ19vbkJ1dHRvbkNsaWNrKCRldmVudCknLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsXSc6ICdhcmlhTGFiZWwgfHwgbnVsbCcsXG4gICAgJ1thdHRyLnR5cGVdJzogJ3R5cGUnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBNYXREaWFsb2dDbG9zZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcbiAgLyoqIFNjcmVlbi1yZWFkZXIgbGFiZWwgZm9yIHRoZSBidXR0b24uICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBEZWZhdWx0IHRvIFwiYnV0dG9uXCIgdG8gcHJldmVudHMgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuICovXG4gIEBJbnB1dCgpIHR5cGU6ICdzdWJtaXQnIHwgJ2J1dHRvbicgfCAncmVzZXQnID0gJ2J1dHRvbic7XG5cbiAgLyoqIERpYWxvZyBjbG9zZSBpbnB1dC4gKi9cbiAgQElucHV0KCdtYXQtZGlhbG9nLWNsb3NlJykgZGlhbG9nUmVzdWx0OiBhbnk7XG5cbiAgQElucHV0KCdtYXREaWFsb2dDbG9zZScpIF9tYXREaWFsb2dDbG9zZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIFRoZSBkaWFsb2cgdGl0bGUgZGlyZWN0aXZlIGlzIGFsd2F5cyB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYSBgTWF0RGlhbG9nUmVmYC5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGxpZ2h0d2VpZ2h0LXRva2Vuc1xuICAgIEBPcHRpb25hbCgpIHB1YmxpYyBkaWFsb2dSZWY6IE1hdERpYWxvZ1JlZjxhbnk+LFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2RpYWxvZzogTWF0RGlhbG9nLFxuICApIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLmRpYWxvZ1JlZikge1xuICAgICAgLy8gV2hlbiB0aGlzIGRpcmVjdGl2ZSBpcyBpbmNsdWRlZCBpbiBhIGRpYWxvZyB2aWEgVGVtcGxhdGVSZWYgKHJhdGhlciB0aGFuIGJlaW5nXG4gICAgICAvLyBpbiBhIENvbXBvbmVudCksIHRoZSBEaWFsb2dSZWYgaXNuJ3QgYXZhaWxhYmxlIHZpYSBpbmplY3Rpb24gYmVjYXVzZSBlbWJlZGRlZFxuICAgICAgLy8gdmlld3MgY2Fubm90IGJlIGdpdmVuIGEgY3VzdG9tIGluamVjdG9yLiBJbnN0ZWFkLCB3ZSBsb29rIHVwIHRoZSBEaWFsb2dSZWYgYnlcbiAgICAgIC8vIElELiBUaGlzIG11c3Qgb2NjdXIgaW4gYG9uSW5pdGAsIGFzIHRoZSBJRCBiaW5kaW5nIGZvciB0aGUgZGlhbG9nIGNvbnRhaW5lciB3b24ndFxuICAgICAgLy8gYmUgcmVzb2x2ZWQgYXQgY29uc3RydWN0b3IgdGltZS5cbiAgICAgIHRoaXMuZGlhbG9nUmVmID0gZ2V0Q2xvc2VzdERpYWxvZyh0aGlzLl9lbGVtZW50UmVmLCB0aGlzLl9kaWFsb2cub3BlbkRpYWxvZ3MpITtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgcHJveGllZENoYW5nZSA9IGNoYW5nZXNbJ19tYXREaWFsb2dDbG9zZSddIHx8IGNoYW5nZXNbJ19tYXREaWFsb2dDbG9zZVJlc3VsdCddO1xuXG4gICAgaWYgKHByb3hpZWRDaGFuZ2UpIHtcbiAgICAgIHRoaXMuZGlhbG9nUmVzdWx0ID0gcHJveGllZENoYW5nZS5jdXJyZW50VmFsdWU7XG4gICAgfVxuICB9XG5cbiAgX29uQnV0dG9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBEZXRlcm1pbmF0ZSB0aGUgZm9jdXMgb3JpZ2luIHVzaW5nIHRoZSBjbGljayBldmVudCwgYmVjYXVzZSB1c2luZyB0aGUgRm9jdXNNb25pdG9yIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gaW5jb3JyZWN0IG9yaWdpbnMuIE1vc3Qgb2YgdGhlIHRpbWUsIGNsb3NlIGJ1dHRvbnMgd2lsbCBiZSBhdXRvIGZvY3VzZWQgaW4gdGhlXG4gICAgLy8gZGlhbG9nLCBhbmQgdGhlcmVmb3JlIGNsaWNraW5nIHRoZSBidXR0b24gd29uJ3QgcmVzdWx0IGluIGEgZm9jdXMgY2hhbmdlLiBUaGlzIG1lYW5zIHRoYXRcbiAgICAvLyB0aGUgRm9jdXNNb25pdG9yIHdvbid0IGRldGVjdCBhbnkgb3JpZ2luIGNoYW5nZSwgYW5kIHdpbGwgYWx3YXlzIG91dHB1dCBgcHJvZ3JhbWAuXG4gICAgX2Nsb3NlRGlhbG9nVmlhKFxuICAgICAgdGhpcy5kaWFsb2dSZWYsXG4gICAgICBldmVudC5zY3JlZW5YID09PSAwICYmIGV2ZW50LnNjcmVlblkgPT09IDAgPyAna2V5Ym9hcmQnIDogJ21vdXNlJyxcbiAgICAgIHRoaXMuZGlhbG9nUmVzdWx0LFxuICAgICk7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSh7c3RhbmRhbG9uZTogdHJ1ZX0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWF0RGlhbG9nTGF5b3V0U2VjdGlvbiBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgY29uc3RydWN0b3IoXG4gICAgLy8gVGhlIGRpYWxvZyB0aXRsZSBkaXJlY3RpdmUgaXMgYWx3YXlzIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBhIGBNYXREaWFsb2dSZWZgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQE9wdGlvbmFsKCkgcHJvdGVjdGVkIF9kaWFsb2dSZWY6IE1hdERpYWxvZ1JlZjxhbnk+LFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2RpYWxvZzogTWF0RGlhbG9nLFxuICApIHt9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vbkFkZCgpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX29uUmVtb3ZlKCk6IHZvaWQ7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLl9kaWFsb2dSZWYpIHtcbiAgICAgIHRoaXMuX2RpYWxvZ1JlZiA9IGdldENsb3Nlc3REaWFsb2codGhpcy5fZWxlbWVudFJlZiwgdGhpcy5fZGlhbG9nLm9wZW5EaWFsb2dzKSE7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RpYWxvZ1JlZikge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX29uQWRkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBOb3RlOiB3ZSBudWxsIGNoZWNrIGJlY2F1c2UgdGhlcmUgYXJlIHNvbWUgaW50ZXJuYWxcbiAgICAvLyB0ZXN0cyB0aGF0IGFyZSBtb2NraW5nIG91dCBgTWF0RGlhbG9nUmVmYCBpbmNvcnJlY3RseS5cbiAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXMuX2RpYWxvZ1JlZj8uX2NvbnRhaW5lckluc3RhbmNlO1xuXG4gICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5fb25SZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRpdGxlIG9mIGEgZGlhbG9nIGVsZW1lbnQuIFN0YXlzIGZpeGVkIHRvIHRoZSB0b3Agb2YgdGhlIGRpYWxvZyB3aGVuIHNjcm9sbGluZy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdC1kaWFsb2ctdGl0bGVdLCBbbWF0RGlhbG9nVGl0bGVdJyxcbiAgZXhwb3J0QXM6ICdtYXREaWFsb2dUaXRsZScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1kaWFsb2ctdGl0bGUgbWRjLWRpYWxvZ19fdGl0bGUnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGlhbG9nVGl0bGUgZXh0ZW5kcyBNYXREaWFsb2dMYXlvdXRTZWN0aW9uIHtcbiAgQElucHV0KCkgaWQ6IHN0cmluZyA9IGBtYXQtbWRjLWRpYWxvZy10aXRsZS0ke2RpYWxvZ0VsZW1lbnRVaWQrK31gO1xuXG4gIHByb3RlY3RlZCBfb25BZGQoKSB7XG4gICAgLy8gTm90ZTogd2UgbnVsbCBjaGVjayB0aGUgcXVldWUsIGJlY2F1c2UgdGhlcmUgYXJlIHNvbWUgaW50ZXJuYWxcbiAgICAvLyB0ZXN0cyB0aGF0IGFyZSBtb2NraW5nIG91dCBgTWF0RGlhbG9nUmVmYCBpbmNvcnJlY3RseS5cbiAgICB0aGlzLl9kaWFsb2dSZWYuX2NvbnRhaW5lckluc3RhbmNlPy5fYWRkQXJpYUxhYmVsbGVkQnk/Lih0aGlzLmlkKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfb25SZW1vdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlhbG9nUmVmPy5fY29udGFpbmVySW5zdGFuY2U/Ll9yZW1vdmVBcmlhTGFiZWxsZWRCeT8uKHRoaXMuaWQpO1xuICB9XG59XG5cbi8qKlxuICogU2Nyb2xsYWJsZSBjb250ZW50IGNvbnRhaW5lciBvZiBhIGRpYWxvZy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiBgW21hdC1kaWFsb2ctY29udGVudF0sIG1hdC1kaWFsb2ctY29udGVudCwgW21hdERpYWxvZ0NvbnRlbnRdYCxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWRpYWxvZy1jb250ZW50IG1kYy1kaWFsb2dfX2NvbnRlbnQnfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaG9zdERpcmVjdGl2ZXM6IFtDZGtTY3JvbGxhYmxlXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGlhbG9nQ29udGVudCB7fVxuXG4vKipcbiAqIENvbnRhaW5lciBmb3IgdGhlIGJvdHRvbSBhY3Rpb24gYnV0dG9ucyBpbiBhIGRpYWxvZy5cbiAqIFN0YXlzIGZpeGVkIHRvIHRoZSBib3R0b20gd2hlbiBzY3JvbGxpbmcuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogYFttYXQtZGlhbG9nLWFjdGlvbnNdLCBtYXQtZGlhbG9nLWFjdGlvbnMsIFttYXREaWFsb2dBY3Rpb25zXWAsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1kaWFsb2ctYWN0aW9ucyBtZGMtZGlhbG9nX19hY3Rpb25zJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtZGlhbG9nLWFjdGlvbnMtYWxpZ24tc3RhcnRdJzogJ2FsaWduID09PSBcInN0YXJ0XCInLFxuICAgICdbY2xhc3MubWF0LW1kYy1kaWFsb2ctYWN0aW9ucy1hbGlnbi1jZW50ZXJdJzogJ2FsaWduID09PSBcImNlbnRlclwiJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtZGlhbG9nLWFjdGlvbnMtYWxpZ24tZW5kXSc6ICdhbGlnbiA9PT0gXCJlbmRcIicsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdERpYWxvZ0FjdGlvbnMgZXh0ZW5kcyBNYXREaWFsb2dMYXlvdXRTZWN0aW9uIHtcbiAgLyoqXG4gICAqIEhvcml6b250YWwgYWxpZ25tZW50IG9mIGFjdGlvbiBidXR0b25zLlxuICAgKi9cbiAgQElucHV0KCkgYWxpZ24/OiAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJztcblxuICBwcm90ZWN0ZWQgX29uQWRkKCkge1xuICAgIHRoaXMuX2RpYWxvZ1JlZi5fY29udGFpbmVySW5zdGFuY2U/Ll91cGRhdGVBY3Rpb25TZWN0aW9uQ291bnQ/LigxKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBfb25SZW1vdmUoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlhbG9nUmVmLl9jb250YWluZXJJbnN0YW5jZT8uX3VwZGF0ZUFjdGlvblNlY3Rpb25Db3VudD8uKC0xKTtcbiAgfVxufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBjbG9zZXN0IE1hdERpYWxvZ1JlZiB0byBhbiBlbGVtZW50IGJ5IGxvb2tpbmcgYXQgdGhlIERPTS5cbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgcmVsYXRpdmUgdG8gd2hpY2ggdG8gbG9vayBmb3IgYSBkaWFsb2cuXG4gKiBAcGFyYW0gb3BlbkRpYWxvZ3MgUmVmZXJlbmNlcyB0byB0aGUgY3VycmVudGx5LW9wZW4gZGlhbG9ncy5cbiAqL1xuZnVuY3Rpb24gZ2V0Q2xvc2VzdERpYWxvZyhlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50Piwgb3BlbkRpYWxvZ3M6IE1hdERpYWxvZ1JlZjxhbnk+W10pIHtcbiAgbGV0IHBhcmVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZWxlbWVudC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG5cbiAgd2hpbGUgKHBhcmVudCAmJiAhcGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnbWF0LW1kYy1kaWFsb2ctY29udGFpbmVyJykpIHtcbiAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50RWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBwYXJlbnQgPyBvcGVuRGlhbG9ncy5maW5kKGRpYWxvZyA9PiBkaWFsb2cuaWQgPT09IHBhcmVudCEuaWQpIDogbnVsbDtcbn1cbiJdfQ==