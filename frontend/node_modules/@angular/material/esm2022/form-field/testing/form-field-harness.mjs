/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate, parallel, } from '@angular/cdk/testing';
import { MatErrorHarness } from './error-harness';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatDatepickerInputHarness, MatDateRangeInputHarness, } from '@angular/material/datepicker/testing';
export class MatFormFieldHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._prefixContainer = this.locatorForOptional('.mat-mdc-form-field-text-prefix');
        this._suffixContainer = this.locatorForOptional('.mat-mdc-form-field-text-suffix');
        this._label = this.locatorForOptional('.mdc-floating-label');
        this._hints = this.locatorForAll('.mat-mdc-form-field-hint');
        this._inputControl = this.locatorForOptional(MatInputHarness);
        this._selectControl = this.locatorForOptional(MatSelectHarness);
        this._datepickerInputControl = this.locatorForOptional(MatDatepickerInputHarness);
        this._dateRangeInputControl = this.locatorForOptional(MatDateRangeInputHarness);
        this._textField = this.locatorFor('.mat-mdc-text-field-wrapper');
        this._errorHarness = MatErrorHarness;
    }
    static { this.hostSelector = '.mat-mdc-form-field'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a form field with specific
     * attributes.
     * @param options Options for filtering which form field instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options)
            .addOption('floatingLabelText', options.floatingLabelText, async (harness, text) => HarnessPredicate.stringMatches(await harness.getLabel(), text))
            .addOption('hasErrors', options.hasErrors, async (harness, hasErrors) => (await harness.hasErrors()) === hasErrors)
            .addOption('isValid', options.isValid, async (harness, isValid) => (await harness.isControlValid()) === isValid);
    }
    /** Gets the appearance of the form-field. */
    async getAppearance() {
        const textFieldEl = await this._textField();
        if (await textFieldEl.hasClass('mdc-text-field--outlined')) {
            return 'outline';
        }
        return 'fill';
    }
    /** Whether the form-field has a label. */
    async hasLabel() {
        return (await this._label()) !== null;
    }
    /** Whether the label is currently floating. */
    async isLabelFloating() {
        const labelEl = await this._label();
        return labelEl !== null ? await labelEl.hasClass('mdc-floating-label--float-above') : false;
    }
    /** Gets the label of the form-field. */
    async getLabel() {
        const labelEl = await this._label();
        return labelEl ? labelEl.text() : null;
    }
    /** Whether the form-field has errors. */
    async hasErrors() {
        return (await this.getTextErrors()).length > 0;
    }
    /** Whether the form-field is disabled. */
    async isDisabled() {
        return (await this.host()).hasClass('mat-form-field-disabled');
    }
    /** Whether the form-field is currently autofilled. */
    async isAutofilled() {
        return (await this.host()).hasClass('mat-form-field-autofilled');
    }
    // Implementation of the "getControl" method overload signatures.
    async getControl(type) {
        if (type) {
            return this.locatorForOptional(type)();
        }
        const [select, input, datepickerInput, dateRangeInput] = await parallel(() => [
            this._selectControl(),
            this._inputControl(),
            this._datepickerInputControl(),
            this._dateRangeInputControl(),
        ]);
        // Match the datepicker inputs first since they can also have a `MatInput`.
        return datepickerInput || dateRangeInput || select || input;
    }
    /** Gets the theme color of the form-field. */
    async getThemeColor() {
        const hostEl = await this.host();
        const [isAccent, isWarn] = await parallel(() => {
            return [hostEl.hasClass('mat-accent'), hostEl.hasClass('mat-warn')];
        });
        if (isAccent) {
            return 'accent';
        }
        else if (isWarn) {
            return 'warn';
        }
        return 'primary';
    }
    /** Gets error messages which are currently displayed in the form-field. */
    async getTextErrors() {
        const errors = await this.getErrors();
        return parallel(() => errors.map(e => e.getText()));
    }
    /** Gets all of the error harnesses in the form field. */
    async getErrors(filter = {}) {
        return this.locatorForAll(this._errorHarness.with(filter))();
    }
    /** Gets hint messages which are currently displayed in the form-field. */
    async getTextHints() {
        const hints = await this._hints();
        return parallel(() => hints.map(e => e.text()));
    }
    /** Gets the text inside the prefix element. */
    async getPrefixText() {
        const prefix = await this._prefixContainer();
        return prefix ? prefix.text() : '';
    }
    /** Gets the text inside the suffix element. */
    async getSuffixText() {
        const suffix = await this._suffixContainer();
        return suffix ? suffix.text() : '';
    }
    /**
     * Whether the form control has been touched. Returns "null"
     * if no form control is set up.
     */
    async isControlTouched() {
        if (!(await this._hasFormControl())) {
            return null;
        }
        return (await this.host()).hasClass('ng-touched');
    }
    /**
     * Whether the form control is dirty. Returns "null"
     * if no form control is set up.
     */
    async isControlDirty() {
        if (!(await this._hasFormControl())) {
            return null;
        }
        return (await this.host()).hasClass('ng-dirty');
    }
    /**
     * Whether the form control is valid. Returns "null"
     * if no form control is set up.
     */
    async isControlValid() {
        if (!(await this._hasFormControl())) {
            return null;
        }
        return (await this.host()).hasClass('ng-valid');
    }
    /**
     * Whether the form control is pending validation. Returns "null"
     * if no form control is set up.
     */
    async isControlPending() {
        if (!(await this._hasFormControl())) {
            return null;
        }
        return (await this.host()).hasClass('ng-pending');
    }
    /** Checks whether the form-field control has set up a form control. */
    async _hasFormControl() {
        const hostEl = await this.host();
        // If no form "NgControl" is bound to the form-field control, the form-field
        // is not able to forward any control status classes. Therefore if either the
        // "ng-touched" or "ng-untouched" class is set, we know that it has a form control
        const [isTouched, isUntouched] = await parallel(() => [
            hostEl.hasClass('ng-touched'),
            hostEl.hasClass('ng-untouched'),
        ]);
        return isTouched || isUntouched;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvdGVzdGluZy9mb3JtLWZpZWxkLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsRUFFaEIsUUFBUSxHQUNULE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFzQixlQUFlLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFFaEUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDbEUsT0FBTyxFQUNMLHlCQUF5QixFQUN6Qix3QkFBd0IsR0FDekIsTUFBTSxzQ0FBc0MsQ0FBQztBQVU5QyxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZ0JBQWdCO0lBQXpEOztRQUNVLHFCQUFnQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlFLHFCQUFnQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlFLFdBQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN4RCxXQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hELGtCQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3pELG1CQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0QsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDN0UsMkJBQXNCLEdBQUcsSUFBSSxD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RyxFQUFFLENBQUM7WUFDcEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUM7U0FDaEMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxTQUFTLElBQUksV0FBVyxDQUFDO0lBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzcyxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBIYXJuZXNzUXVlcnksXG4gIHBhcmFsbGVsLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0Vycm9ySGFybmVzc0ZpbHRlcnMsIE1hdEVycm9ySGFybmVzc30gZnJvbSAnLi9lcnJvci1oYXJuZXNzJztcbmltcG9ydCB7TWF0SW5wdXRIYXJuZXNzfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dC90ZXN0aW5nJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3N9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQvdGVzdGluZy9jb250cm9sJztcbmltcG9ydCB7TWF0U2VsZWN0SGFybmVzc30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0L3Rlc3RpbmcnO1xuaW1wb3J0IHtcbiAgTWF0RGF0ZXBpY2tlcklucHV0SGFybmVzcyxcbiAgTWF0RGF0ZVJhbmdlSW5wdXRIYXJuZXNzLFxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kYXRlcGlja2VyL3Rlc3RpbmcnO1xuaW1wb3J0IHtGb3JtRmllbGRIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9mb3JtLWZpZWxkLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBQb3NzaWJsZSBoYXJuZXNzZXMgb2YgY29udHJvbHMgd2hpY2ggY2FuIGJlIGJvdW5kIHRvIGEgZm9ybS1maWVsZC4gKi9cbmV4cG9ydCB0eXBlIEZvcm1GaWVsZENvbnRyb2xIYXJuZXNzID1cbiAgfCBNYXRJbnB1dEhhcm5lc3NcbiAgfCBNYXRTZWxlY3RIYXJuZXNzXG4gIHwgTWF0RGF0ZXBpY2tlcklucHV0SGFybmVzc1xuICB8IE1hdERhdGVSYW5nZUlucHV0SGFybmVzcztcblxuZXhwb3J0IGNsYXNzIE1hdEZvcm1GaWVsZEhhcm5lc3MgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgcHJpdmF0ZSBfcHJlZml4Q29udGFpbmVyID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoJy5tYXQtbWRjLWZvcm0tZmllbGQtdGV4dC1wcmVmaXgnKTtcbiAgcHJpdmF0ZSBfc3VmZml4Q29udGFpbmVyID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoJy5tYXQtbWRjLWZvcm0tZmllbGQtdGV4dC1zdWZmaXgnKTtcbiAgcHJpdmF0ZSBfbGFiZWwgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1kYy1mbG9hdGluZy1sYWJlbCcpO1xuICBwcml2YXRlIF9oaW50cyA9IHRoaXMubG9jYXRvckZvckFsbCgnLm1hdC1tZGMtZm9ybS1maWVsZC1oaW50Jyk7XG4gIHByaXZhdGUgX2lucHV0Q29udHJvbCA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKE1hdElucHV0SGFybmVzcyk7XG4gIHByaXZhdGUgX3NlbGVjdENvbnRyb2wgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXRTZWxlY3RIYXJuZXNzKTtcbiAgcHJpdmF0ZSBfZGF0ZXBpY2tlcklucHV0Q29udHJvbCA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKE1hdERhdGVwaWNrZXJJbnB1dEhhcm5lc3MpO1xuICBwcml2YXRlIF9kYXRlUmFuZ2VJbnB1dENvbnRyb2wgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXREYXRlUmFuZ2VJbnB1dEhhcm5lc3MpO1xuICBwcml2YXRlIF90ZXh0RmllbGQgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtbWRjLXRleHQtZmllbGQtd3JhcHBlcicpO1xuICBwcml2YXRlIF9lcnJvckhhcm5lc3MgPSBNYXRFcnJvckhhcm5lc3M7XG5cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1mb3JtLWZpZWxkJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBmb3JtIGZpZWxkIHdpdGggc3BlY2lmaWNcbiAgICogYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGZvcm0gZmllbGQgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGg8VCBleHRlbmRzIE1hdEZvcm1GaWVsZEhhcm5lc3M+KFxuICAgIHRoaXM6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgICBvcHRpb25zOiBGb3JtRmllbGRIYXJuZXNzRmlsdGVycyA9IHt9LFxuICApOiBIYXJuZXNzUHJlZGljYXRlPFQ+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUodGhpcywgb3B0aW9ucylcbiAgICAgIC5hZGRPcHRpb24oJ2Zsb2F0aW5nTGFiZWxUZXh0Jywgb3B0aW9ucy5mbG9hdGluZ0xhYmVsVGV4dCwgYXN5bmMgKGhhcm5lc3MsIHRleHQpID0+XG4gICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhhd2FpdCBoYXJuZXNzLmdldExhYmVsKCksIHRleHQpLFxuICAgICAgKVxuICAgICAgLmFkZE9wdGlvbihcbiAgICAgICAgJ2hhc0Vycm9ycycsXG4gICAgICAgIG9wdGlvbnMuaGFzRXJyb3JzLFxuICAgICAgICBhc3luYyAoaGFybmVzcywgaGFzRXJyb3JzKSA9PiAoYXdhaXQgaGFybmVzcy5oYXNFcnJvcnMoKSkgPT09IGhhc0Vycm9ycyxcbiAgICAgIClcbiAgICAgIC5hZGRPcHRpb24oXG4gICAgICAgICdpc1ZhbGlkJyxcbiAgICAgICAgb3B0aW9ucy5pc1ZhbGlkLFxuICAgICAgICBhc3luYyAoaGFybmVzcywgaXNWYWxpZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNDb250cm9sVmFsaWQoKSkgPT09IGlzVmFsaWQsXG4gICAgICApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGFwcGVhcmFuY2Ugb2YgdGhlIGZvcm0tZmllbGQuICovXG4gIGFzeW5jIGdldEFwcGVhcmFuY2UoKTogUHJvbWlzZTwnZmlsbCcgfCAnb3V0bGluZSc+IHtcbiAgICBjb25zdCB0ZXh0RmllbGRFbCA9IGF3YWl0IHRoaXMuX3RleHRGaWVsZCgpO1xuICAgIGlmIChhd2FpdCB0ZXh0RmllbGRFbC5oYXNDbGFzcygnbWRjLXRleHQtZmllbGQtLW91dGxpbmVkJykpIHtcbiAgICAgIHJldHVybiAnb3V0bGluZSc7XG4gICAgfVxuICAgIHJldHVybiAnZmlsbCc7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZm9ybS1maWVsZCBoYXMgYSBsYWJlbC4gKi9cbiAgYXN5bmMgaGFzTGFiZWwoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9sYWJlbCgpKSAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBsYWJlbCBpcyBjdXJyZW50bHkgZmxvYXRpbmcuICovXG4gIGFzeW5jIGlzTGFiZWxGbG9hdGluZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBsYWJlbEVsID0gYXdhaXQgdGhpcy5fbGFiZWwoKTtcbiAgICByZXR1cm4gbGFiZWxFbCAhPT0gbnVsbCA/IGF3YWl0IGxhYmVsRWwuaGFzQ2xhc3MoJ21kYy1mbG9hdGluZy1sYWJlbC0tZmxvYXQtYWJvdmUnKSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxhYmVsIG9mIHRoZSBmb3JtLWZpZWxkLiAqL1xuICBhc3luYyBnZXRMYWJlbCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCBsYWJlbEVsID0gYXdhaXQgdGhpcy5fbGFiZWwoKTtcbiAgICByZXR1cm4gbGFiZWxFbCA/IGxhYmVsRWwudGV4dCgpIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBmb3JtLWZpZWxkIGhhcyBlcnJvcnMuICovXG4gIGFzeW5jIGhhc0Vycm9ycygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0VGV4dEVycm9ycygpKS5sZW5ndGggPiAwO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGZvcm0tZmllbGQgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1mb3JtLWZpZWxkLWRpc2FibGVkJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZm9ybS1maWVsZCBpcyBjdXJyZW50bHkgYXV0b2ZpbGxlZC4gKi9cbiAgYXN5bmMgaXNBdXRvZmlsbGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtZm9ybS1maWVsZC1hdXRvZmlsbGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgaGFybmVzcyBvZiB0aGUgY29udHJvbCB0aGF0IGlzIGJvdW5kIHRvIHRoZSBmb3JtLWZpZWxkLiBPbmx5XG4gICAqIGRlZmF1bHQgY29udHJvbHMgc3VjaCBhcyBcIk1hdElucHV0SGFybmVzc1wiIGFuZCBcIk1hdFNlbGVjdEhhcm5lc3NcIiBhcmVcbiAgICogc3VwcG9ydGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udHJvbCgpOiBQcm9taXNlPEZvcm1GaWVsZENvbnRyb2xIYXJuZXNzIHwgbnVsbD47XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGhhcm5lc3Mgb2YgdGhlIGNvbnRyb2wgdGhhdCBpcyBib3VuZCB0byB0aGUgZm9ybS1maWVsZC4gU2VhcmNoZXNcbiAgICogZm9yIGEgY29udHJvbCB0aGF0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCBoYXJuZXNzIHR5cGUuXG4gICAqL1xuICBhc3luYyBnZXRDb250cm9sPFggZXh0ZW5kcyBNYXRGb3JtRmllbGRDb250cm9sSGFybmVzcz4oXG4gICAgdHlwZTogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFg+LFxuICApOiBQcm9taXNlPFggfCBudWxsPjtcblxuICAvKipcbiAgICogR2V0cyB0aGUgaGFybmVzcyBvZiB0aGUgY29udHJvbCB0aGF0IGlzIGJvdW5kIHRvIHRoZSBmb3JtLWZpZWxkLiBTZWFyY2hlc1xuICAgKiBmb3IgYSBjb250cm9sIHRoYXQgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIGhhcm5lc3MgcHJlZGljYXRlLlxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udHJvbDxYIGV4dGVuZHMgTWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3M+KFxuICAgIHR5cGU6IEhhcm5lc3NQcmVkaWNhdGU8WD4sXG4gICk6IFByb21pc2U8WCB8IG51bGw+O1xuXG4gIC8vIEltcGxlbWVudGF0aW9uIG9mIHRoZSBcImdldENvbnRyb2xcIiBtZXRob2Qgb3ZlcmxvYWQgc2lnbmF0dXJlcy5cbiAgYXN5bmMgZ2V0Q29udHJvbDxYIGV4dGVuZHMgTWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3M+KHR5cGU/OiBIYXJuZXNzUXVlcnk8WD4pIHtcbiAgICBpZiAodHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYXRvckZvck9wdGlvbmFsKHR5cGUpKCk7XG4gICAgfVxuICAgIGNvbnN0IFtzZWxlY3QsIGlucHV0LCBkYXRlcGlja2VySW5wdXQsIGRhdGVSYW5nZUlucHV0XSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFtcbiAgICAgIHRoaXMuX3NlbGVjdENvbnRyb2woKSxcbiAgICAgIHRoaXMuX2lucHV0Q29udHJvbCgpLFxuICAgICAgdGhpcy5fZGF0ZXBpY2tlcklucHV0Q29udHJvbCgpLFxuICAgICAgdGhpcy5fZGF0ZVJhbmdlSW5wdXRDb250cm9sKCksXG4gICAgXSk7XG5cbiAgICAvLyBNYXRjaCB0aGUgZGF0ZXBpY2tlciBpbnB1dHMgZmlyc3Qgc2luY2UgdGhleSBjYW4gYWxzbyBoYXZlIGEgYE1hdElucHV0YC5cbiAgICByZXR1cm4gZGF0ZXBpY2tlcklucHV0IHx8IGRhdGVSYW5nZUlucHV0IHx8IHNlbGVjdCB8fCBpbnB1dDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0aGVtZSBjb2xvciBvZiB0aGUgZm9ybS1maWVsZC4gKi9cbiAgYXN5bmMgZ2V0VGhlbWVDb2xvcigpOiBQcm9taXNlPCdwcmltYXJ5JyB8ICdhY2NlbnQnIHwgJ3dhcm4nPiB7XG4gICAgY29uc3QgaG9zdEVsID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgY29uc3QgW2lzQWNjZW50LCBpc1dhcm5dID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4ge1xuICAgICAgcmV0dXJuIFtob3N0RWwuaGFzQ2xhc3MoJ21hdC1hY2NlbnQnKSwgaG9zdEVsLmhhc0NsYXNzKCdtYXQtd2FybicpXTtcbiAgICB9KTtcbiAgICBpZiAoaXNBY2NlbnQpIHtcbiAgICAgIHJldHVybiAnYWNjZW50JztcbiAgICB9IGVsc2UgaWYgKGlzV2Fybikge1xuICAgICAgcmV0dXJuICd3YXJuJztcbiAgICB9XG4gICAgcmV0dXJuICdwcmltYXJ5JztcbiAgfVxuXG4gIC8qKiBHZXRzIGVycm9yIG1lc3NhZ2VzIHdoaWNoIGFyZSBjdXJyZW50bHkgZGlzcGxheWVkIGluIHRoZSBmb3JtLWZpZWxkLiAqL1xuICBhc3luYyBnZXRUZXh0RXJyb3JzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBlcnJvcnMgPSBhd2FpdCB0aGlzLmdldEVycm9ycygpO1xuICAgIHJldHVybiBwYXJhbGxlbCgoKSA9PiBlcnJvcnMubWFwKGUgPT4gZS5nZXRUZXh0KCkpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCBvZiB0aGUgZXJyb3IgaGFybmVzc2VzIGluIHRoZSBmb3JtIGZpZWxkLiAqL1xuICBhc3luYyBnZXRFcnJvcnMoZmlsdGVyOiBFcnJvckhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdEVycm9ySGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbCh0aGlzLl9lcnJvckhhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgaGludCBtZXNzYWdlcyB3aGljaCBhcmUgY3VycmVudGx5IGRpc3BsYXllZCBpbiB0aGUgZm9ybS1maWVsZC4gKi9cbiAgYXN5bmMgZ2V0VGV4dEhpbnRzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBoaW50cyA9IGF3YWl0IHRoaXMuX2hpbnRzKCk7XG4gICAgcmV0dXJuIHBhcmFsbGVsKCgpID0+IGhpbnRzLm1hcChlID0+IGUudGV4dCgpKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBpbnNpZGUgdGhlIHByZWZpeCBlbGVtZW50LiAqL1xuICBhc3luYyBnZXRQcmVmaXhUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcHJlZml4ID0gYXdhaXQgdGhpcy5fcHJlZml4Q29udGFpbmVyKCk7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeC50ZXh0KCkgOiAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0ZXh0IGluc2lkZSB0aGUgc3VmZml4IGVsZW1lbnQuICovXG4gIGFzeW5jIGdldFN1ZmZpeFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzdWZmaXggPSBhd2FpdCB0aGlzLl9zdWZmaXhDb250YWluZXIoKTtcbiAgICByZXR1cm4gc3VmZml4ID8gc3VmZml4LnRleHQoKSA6ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGZvcm0gY29udHJvbCBoYXMgYmVlbiB0b3VjaGVkLiBSZXR1cm5zIFwibnVsbFwiXG4gICAqIGlmIG5vIGZvcm0gY29udHJvbCBpcyBzZXQgdXAuXG4gICAqL1xuICBhc3luYyBpc0NvbnRyb2xUb3VjaGVkKCk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLl9oYXNGb3JtQ29udHJvbCgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCduZy10b3VjaGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZm9ybSBjb250cm9sIGlzIGRpcnR5LiBSZXR1cm5zIFwibnVsbFwiXG4gICAqIGlmIG5vIGZvcm0gY29udHJvbCBpcyBzZXQgdXAuXG4gICAqL1xuICBhc3luYyBpc0NvbnRyb2xEaXJ0eSgpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5faGFzRm9ybUNvbnRyb2woKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbmctZGlydHknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBmb3JtIGNvbnRyb2wgaXMgdmFsaWQuIFJldHVybnMgXCJudWxsXCJcbiAgICogaWYgbm8gZm9ybSBjb250cm9sIGlzIHNldCB1cC5cbiAgICovXG4gIGFzeW5jIGlzQ29udHJvbFZhbGlkKCk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLl9oYXNGb3JtQ29udHJvbCgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCduZy12YWxpZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGZvcm0gY29udHJvbCBpcyBwZW5kaW5nIHZhbGlkYXRpb24uIFJldHVybnMgXCJudWxsXCJcbiAgICogaWYgbm8gZm9ybSBjb250cm9sIGlzIHNldCB1cC5cbiAgICovXG4gIGFzeW5jIGlzQ29udHJvbFBlbmRpbmcoKTogUHJvbWlzZTxib29sZWFuIHwgbnVsbD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuX2hhc0Zvcm1Db250cm9sKCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ25nLXBlbmRpbmcnKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZm9ybS1maWVsZCBjb250cm9sIGhhcyBzZXQgdXAgYSBmb3JtIGNvbnRyb2wuICovXG4gIHByaXZhdGUgYXN5bmMgX2hhc0Zvcm1Db250cm9sKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhvc3RFbCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIC8vIElmIG5vIGZvcm0gXCJOZ0NvbnRyb2xcIiBpcyBib3VuZCB0byB0aGUgZm9ybS1maWVsZCBjb250cm9sLCB0aGUgZm9ybS1maWVsZFxuICAgIC8vIGlzIG5vdCBhYmxlIHRvIGZvcndhcmQgYW55IGNvbnRyb2wgc3RhdHVzIGNsYXNzZXMuIFRoZXJlZm9yZSBpZiBlaXRoZXIgdGhlXG4gICAgLy8gXCJuZy10b3VjaGVkXCIgb3IgXCJuZy11bnRvdWNoZWRcIiBjbGFzcyBpcyBzZXQsIHdlIGtub3cgdGhhdCBpdCBoYXMgYSBmb3JtIGNvbnRyb2xcbiAgICBjb25zdCBbaXNUb3VjaGVkLCBpc1VudG91Y2hlZF0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICBob3N0RWwuaGFzQ2xhc3MoJ25nLXRvdWNoZWQnKSxcbiAgICAgIGhvc3RFbC5oYXNDbGFzcygnbmctdW50b3VjaGVkJyksXG4gICAgXSk7XG4gICAgcmV0dXJuIGlzVG91Y2hlZCB8fCBpc1VudG91Y2hlZDtcbiAgfVxufVxuIl19