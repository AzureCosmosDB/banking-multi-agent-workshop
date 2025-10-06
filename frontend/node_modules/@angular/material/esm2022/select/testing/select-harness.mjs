/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatOptionHarness, MatOptgroupHarness, } from '@angular/material/core/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing/control';
/** Harness for interacting with a mat-select in tests. */
export class MatSelectHarness extends MatFormFieldControlHarness {
    constructor() {
        super(...arguments);
        this._prefix = 'mat-mdc';
        this._optionClass = MatOptionHarness;
        this._optionGroupClass = MatOptgroupHarness;
        this._documentRootLocator = this.documentRootLocatorFactory();
        this._backdrop = this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');
    }
    static { this.hostSelector = '.mat-mdc-select'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a select with specific attributes.
     * @param options Options for filtering which select instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options).addOption('disabled', options.disabled, async (harness, disabled) => {
            return (await harness.isDisabled()) === disabled;
        });
    }
    /** Gets a boolean promise indicating if the select is disabled. */
    async isDisabled() {
        return (await this.host()).hasClass(`${this._prefix}-select-disabled`);
    }
    /** Gets a boolean promise indicating if the select is valid. */
    async isValid() {
        return !(await (await this.host()).hasClass('ng-invalid'));
    }
    /** Gets a boolean promise indicating if the select is required. */
    async isRequired() {
        return (await this.host()).hasClass(`${this._prefix}-select-required`);
    }
    /** Gets a boolean promise indicating if the select is empty (no value is selected). */
    async isEmpty() {
        return (await this.host()).hasClass(`${this._prefix}-select-empty`);
    }
    /** Gets a boolean promise indicating if the select is in multi-selection mode. */
    async isMultiple() {
        return (await this.host()).hasClass(`${this._prefix}-select-multiple`);
    }
    /** Gets a promise for the select's value text. */
    async getValueText() {
        const value = await this.locatorFor(`.${this._prefix}-select-value`)();
        return value.text();
    }
    /** Focuses the select and returns a void promise that indicates when the action is complete. */
    async focus() {
        return (await this.host()).focus();
    }
    /** Blurs the select and returns a void promise that indicates when the action is complete. */
    async blur() {
        return (await this.host()).blur();
    }
    /** Whether the select is focused. */
    async isFocused() {
        return (await this.host()).isFocused();
    }
    /** Gets the options inside the select panel. */
    async getOptions(filter) {
        return this._documentRootLocator.locatorForAll(this._optionClass.with({
            ...(filter || {}),
            ancestor: await this._getPanelSelector(),
        }))();
    }
    /** Gets the groups of options inside the panel. */
    async getOptionGroups(filter) {
        return this._documentRootLocator.locatorForAll(this._optionGroupClass.with({
            ...(filter || {}),
            ancestor: await this._getPanelSelector(),
        }))();
    }
    /** Gets whether the select is open. */
    async isOpen() {
        return !!(await this._documentRootLocator.locatorForOptional(await this._getPanelSelector())());
    }
    /** Opens the select's panel. */
    async open() {
        if (!(await this.isOpen())) {
            const trigger = await this.locatorFor(`.${this._prefix}-select-trigger`)();
            return trigger.click();
        }
    }
    /**
     * Clicks the options that match the passed-in filter. If the select is in multi-selection
     * mode all options will be clicked, otherwise the harness will pick the first matching option.
     */
    async clickOptions(filter) {
        await this.open();
        const [isMultiple, options] = await parallel(() => [
            this.isMultiple(),
            this.getOptions(filter),
        ]);
        if (options.length === 0) {
            throw Error('Select does not have options matching the specified filter');
        }
        if (isMultiple) {
            await parallel(() => options.map(option => option.click()));
        }
        else {
            await options[0].click();
        }
    }
    /** Closes the select's panel. */
    async close() {
        if (await this.isOpen()) {
            // This is the most consistent way that works both in both single and multi-select modes,
            // but it assumes that only one overlay is open at a time. We should be able to make it
            // a bit more precise after #16645 where we can dispatch an ESCAPE press to the host instead.
            return (await this._backdrop()).click();
        }
    }
    /** Gets the selector that should be used to find this select's panel. */
    async _getPanelSelector() {
        const id = await (await this.host()).getAttribute('id');
        return `#${id}-panel`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2VsZWN0L3Rlc3Rpbmcvc2VsZWN0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUE4QixnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUM3RixPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGtCQUFrQixHQUduQixNQUFNLGdDQUFnQyxDQUFDO0FBQ3hDLE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBR3hGLDBEQUEwRDtBQUMxRCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsMEJBQTBCO0lBQWhFOztRQUVVLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFDcEIsaUJBQVksR0FBRyxnQkFBZ0IsQ0FBQztRQUNoQyxzQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQztRQUN2Qyx5QkFBb0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUN6RCxjQUFTLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBMklwRixDQUFDO2FBaEpRLGlCQUFZLEdBQUcsaUJBQWlCLEFBQXBCLENBQXFCO0lBT3hDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUVULFVBQWdDLEVBQUU7UUFFbEMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQ2xELFVBQVUsRUFDVixPQUFPLENBQUMsUUFBUSxFQUNoQixLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQztRQUNuRCxDQUFDLENBQ0YsQ0FBQztJQUNKLENB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RjtZQUN6Rix1RkFBdUY7WUFDdkYsNkZBQTZGO1lBQzdGLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzFDLENBQUM7SUFDSCxDQUFDO0lBRUQseUVBQXlFO0lBQ2pFLEtBQUssQ0FBQyxpQkFBaUI7UUFDN0IsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hELE9BQU8sSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLCBIYXJuZXNzUHJlZGljYXRlLCBwYXJhbGxlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtcbiAgTWF0T3B0aW9uSGFybmVzcyxcbiAgTWF0T3B0Z3JvdXBIYXJuZXNzLFxuICBPcHRpb25IYXJuZXNzRmlsdGVycyxcbiAgT3B0Z3JvdXBIYXJuZXNzRmlsdGVycyxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZS90ZXN0aW5nJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3N9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQvdGVzdGluZy9jb250cm9sJztcbmltcG9ydCB7U2VsZWN0SGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vc2VsZWN0LWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbWF0LXNlbGVjdCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3RIYXJuZXNzIGV4dGVuZHMgTWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3Mge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLXNlbGVjdCc7XG4gIHByaXZhdGUgX3ByZWZpeCA9ICdtYXQtbWRjJztcbiAgcHJpdmF0ZSBfb3B0aW9uQ2xhc3MgPSBNYXRPcHRpb25IYXJuZXNzO1xuICBwcml2YXRlIF9vcHRpb25Hcm91cENsYXNzID0gTWF0T3B0Z3JvdXBIYXJuZXNzO1xuICBwcml2YXRlIF9kb2N1bWVudFJvb3RMb2NhdG9yID0gdGhpcy5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpO1xuICBwcml2YXRlIF9iYWNrZHJvcCA9IHRoaXMuX2RvY3VtZW50Um9vdExvY2F0b3IubG9jYXRvckZvcignLmNkay1vdmVybGF5LWJhY2tkcm9wJyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgc2VsZWN0IHdpdGggc3BlY2lmaWMgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIHNlbGVjdCBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aDxUIGV4dGVuZHMgTWF0U2VsZWN0SGFybmVzcz4oXG4gICAgdGhpczogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IFNlbGVjdEhhcm5lc3NGaWx0ZXJzID0ge30sXG4gICk6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZSh0aGlzLCBvcHRpb25zKS5hZGRPcHRpb24oXG4gICAgICAnZGlzYWJsZWQnLFxuICAgICAgb3B0aW9ucy5kaXNhYmxlZCxcbiAgICAgIGFzeW5jIChoYXJuZXNzLCBkaXNhYmxlZCkgPT4ge1xuICAgICAgICByZXR1cm4gKGF3YWl0IGhhcm5lc3MuaXNEaXNhYmxlZCgpKSA9PT0gZGlzYWJsZWQ7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoYCR7dGhpcy5fcHJlZml4fS1zZWxlY3QtZGlzYWJsZWRgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgYm9vbGVhbiBwcm9taXNlIGluZGljYXRpbmcgaWYgdGhlIHNlbGVjdCBpcyB2YWxpZC4gKi9cbiAgYXN5bmMgaXNWYWxpZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gIShhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCduZy1pbnZhbGlkJykpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBib29sZWFuIHByb21pc2UgaW5kaWNhdGluZyBpZiB0aGUgc2VsZWN0IGlzIHJlcXVpcmVkLiAqL1xuICBhc3luYyBpc1JlcXVpcmVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKGAke3RoaXMuX3ByZWZpeH0tc2VsZWN0LXJlcXVpcmVkYCk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgZW1wdHkgKG5vIHZhbHVlIGlzIHNlbGVjdGVkKS4gKi9cbiAgYXN5bmMgaXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcyhgJHt0aGlzLl9wcmVmaXh9LXNlbGVjdC1lbXB0eWApO1xuICB9XG5cbiAgLyoqIEdldHMgYSBib29sZWFuIHByb21pc2UgaW5kaWNhdGluZyBpZiB0aGUgc2VsZWN0IGlzIGluIG11bHRpLXNlbGVjdGlvbiBtb2RlLiAqL1xuICBhc3luYyBpc011bHRpcGxlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKGAke3RoaXMuX3ByZWZpeH0tc2VsZWN0LW11bHRpcGxlYCk7XG4gIH1cblxuICAvKiogR2V0cyBhIHByb21pc2UgZm9yIHRoZSBzZWxlY3QncyB2YWx1ZSB0ZXh0LiAqL1xuICBhc3luYyBnZXRWYWx1ZVRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHRoaXMubG9jYXRvckZvcihgLiR7dGhpcy5fcHJlZml4fS1zZWxlY3QtdmFsdWVgKSgpO1xuICAgIHJldHVybiB2YWx1ZS50ZXh0KCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgc2VsZWN0IGFuZCByZXR1cm5zIGEgdm9pZCBwcm9taXNlIHRoYXQgaW5kaWNhdGVzIHdoZW4gdGhlIGFjdGlvbiBpcyBjb21wbGV0ZS4gKi9cbiAgYXN5bmMgZm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBCbHVycyB0aGUgc2VsZWN0IGFuZCByZXR1cm5zIGEgdm9pZCBwcm9taXNlIHRoYXQgaW5kaWNhdGVzIHdoZW4gdGhlIGFjdGlvbiBpcyBjb21wbGV0ZS4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc2VsZWN0IGlzIGZvY3VzZWQuICovXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBvcHRpb25zIGluc2lkZSB0aGUgc2VsZWN0IHBhbmVsLiAqL1xuICBhc3luYyBnZXRPcHRpb25zKGZpbHRlcj86IE9taXQ8T3B0aW9uSGFybmVzc0ZpbHRlcnMsICdhbmNlc3Rvcic+KTogUHJvbWlzZTxNYXRPcHRpb25IYXJuZXNzW10+IHtcbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRSb290TG9jYXRvci5sb2NhdG9yRm9yQWxsKFxuICAgICAgdGhpcy5fb3B0aW9uQ2xhc3Mud2l0aCh7XG4gICAgICAgIC4uLihmaWx0ZXIgfHwge30pLFxuICAgICAgICBhbmNlc3RvcjogYXdhaXQgdGhpcy5fZ2V0UGFuZWxTZWxlY3RvcigpLFxuICAgICAgfSBhcyBPcHRpb25IYXJuZXNzRmlsdGVycyksXG4gICAgKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGdyb3VwcyBvZiBvcHRpb25zIGluc2lkZSB0aGUgcGFuZWwuICovXG4gIGFzeW5jIGdldE9wdGlvbkdyb3VwcyhcbiAgICBmaWx0ZXI/OiBPbWl0PE9wdGdyb3VwSGFybmVzc0ZpbHRlcnMsICdhbmNlc3Rvcic+LFxuICApOiBQcm9taXNlPE1hdE9wdGdyb3VwSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50Um9vdExvY2F0b3IubG9jYXRvckZvckFsbChcbiAgICAgIHRoaXMuX29wdGlvbkdyb3VwQ2xhc3Mud2l0aCh7XG4gICAgICAgIC4uLihmaWx0ZXIgfHwge30pLFxuICAgICAgICBhbmNlc3RvcjogYXdhaXQgdGhpcy5fZ2V0UGFuZWxTZWxlY3RvcigpLFxuICAgICAgfSBhcyBPcHRncm91cEhhcm5lc3NGaWx0ZXJzKSxcbiAgICApKCkgYXMgUHJvbWlzZTxNYXRPcHRncm91cEhhcm5lc3NbXT47XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBzZWxlY3QgaXMgb3Blbi4gKi9cbiAgYXN5bmMgaXNPcGVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAhIShhd2FpdCB0aGlzLl9kb2N1bWVudFJvb3RMb2NhdG9yLmxvY2F0b3JGb3JPcHRpb25hbChhd2FpdCB0aGlzLl9nZXRQYW5lbFNlbGVjdG9yKCkpKCkpO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBzZWxlY3QncyBwYW5lbC4gKi9cbiAgYXN5bmMgb3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmlzT3BlbigpKSkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGF3YWl0IHRoaXMubG9jYXRvckZvcihgLiR7dGhpcy5fcHJlZml4fS1zZWxlY3QtdHJpZ2dlcmApKCk7XG4gICAgICByZXR1cm4gdHJpZ2dlci5jbGljaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGlja3MgdGhlIG9wdGlvbnMgdGhhdCBtYXRjaCB0aGUgcGFzc2VkLWluIGZpbHRlci4gSWYgdGhlIHNlbGVjdCBpcyBpbiBtdWx0aS1zZWxlY3Rpb25cbiAgICogbW9kZSBhbGwgb3B0aW9ucyB3aWxsIGJlIGNsaWNrZWQsIG90aGVyd2lzZSB0aGUgaGFybmVzcyB3aWxsIHBpY2sgdGhlIGZpcnN0IG1hdGNoaW5nIG9wdGlvbi5cbiAgICovXG4gIGFzeW5jIGNsaWNrT3B0aW9ucyhmaWx0ZXI/OiBPcHRpb25IYXJuZXNzRmlsdGVycyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMub3BlbigpO1xuXG4gICAgY29uc3QgW2lzTXVsdGlwbGUsIG9wdGlvbnNdID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gW1xuICAgICAgdGhpcy5pc011bHRpcGxlKCksXG4gICAgICB0aGlzLmdldE9wdGlvbnMoZmlsdGVyKSxcbiAgICBdKTtcblxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1NlbGVjdCBkb2VzIG5vdCBoYXZlIG9wdGlvbnMgbWF0Y2hpbmcgdGhlIHNwZWNpZmllZCBmaWx0ZXInKTtcbiAgICB9XG5cbiAgICBpZiAoaXNNdWx0aXBsZSkge1xuICAgICAgYXdhaXQgcGFyYWxsZWwoKCkgPT4gb3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi5jbGljaygpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IG9wdGlvbnNbMF0uY2xpY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2VzIHRoZSBzZWxlY3QncyBwYW5lbC4gKi9cbiAgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIG1vc3QgY29uc2lzdGVudCB3YXkgdGhhdCB3b3JrcyBib3RoIGluIGJvdGggc2luZ2xlIGFuZCBtdWx0aS1zZWxlY3QgbW9kZXMsXG4gICAgICAvLyBidXQgaXQgYXNzdW1lcyB0aGF0IG9ubHkgb25lIG92ZXJsYXkgaXMgb3BlbiBhdCBhIHRpbWUuIFdlIHNob3VsZCBiZSBhYmxlIHRvIG1ha2UgaXRcbiAgICAgIC8vIGEgYml0IG1vcmUgcHJlY2lzZSBhZnRlciAjMTY2NDUgd2hlcmUgd2UgY2FuIGRpc3BhdGNoIGFuIEVTQ0FQRSBwcmVzcyB0byB0aGUgaG9zdCBpbnN0ZWFkLlxuICAgICAgcmV0dXJuIChhd2FpdCB0aGlzLl9iYWNrZHJvcCgpKS5jbGljaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzZWxlY3RvciB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIGZpbmQgdGhpcyBzZWxlY3QncyBwYW5lbC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0UGFuZWxTZWxlY3RvcigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGlkID0gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgcmV0dXJuIGAjJHtpZH0tcGFuZWxgO1xuICB9XG59XG4iXX0=