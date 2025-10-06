/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
import { MatOptgroupHarness, MatOptionHarness, } from '@angular/material/core/testing';
export class MatAutocompleteHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._documentRootLocator = this.documentRootLocatorFactory();
    }
    /** The selector for the host element of a `MatAutocomplete` instance. */
    static { this.hostSelector = '.mat-mdc-autocomplete-trigger'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for an autocomplete with specific
     * attributes.
     * @param options Options for filtering which autocomplete instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options)
            .addOption('value', options.value, (harness, value) => HarnessPredicate.stringMatches(harness.getValue(), value))
            .addOption('disabled', options.disabled, async (harness, disabled) => {
            return (await harness.isDisabled()) === disabled;
        });
    }
    /** Gets the value of the autocomplete input. */
    async getValue() {
        return (await this.host()).getProperty('value');
    }
    /** Whether the autocomplete input is disabled. */
    async isDisabled() {
        const disabled = (await this.host()).getAttribute('disabled');
        return coerceBooleanProperty(await disabled);
    }
    /** Focuses the autocomplete input. */
    async focus() {
        return (await this.host()).focus();
    }
    /** Blurs the autocomplete input. */
    async blur() {
        return (await this.host()).blur();
    }
    /** Whether the autocomplete input is focused. */
    async isFocused() {
        return (await this.host()).isFocused();
    }
    /** Enters text into the autocomplete. */
    async enterText(value) {
        return (await this.host()).sendKeys(value);
    }
    /** Clears the input value. */
    async clear() {
        return (await this.host()).clear();
    }
    /** Gets the options inside the autocomplete panel. */
    async getOptions(filters) {
        if (!(await this.isOpen())) {
            throw new Error('Unable to retrieve options for autocomplete. Autocomplete panel is closed.');
        }
        return this._documentRootLocator.locatorForAll(MatOptionHarness.with({
            ...(filters || {}),
            ancestor: await this._getPanelSelector(),
        }))();
    }
    /** Gets the option groups inside the autocomplete panel. */
    async getOptionGroups(filters) {
        if (!(await this.isOpen())) {
            throw new Error('Unable to retrieve option groups for autocomplete. Autocomplete panel is closed.');
        }
        return this._documentRootLocator.locatorForAll(MatOptgroupHarness.with({
            ...(filters || {}),
            ancestor: await this._getPanelSelector(),
        }))();
    }
    /** Selects the first option matching the given filters. */
    async selectOption(filters) {
        await this.focus(); // Focus the input to make sure the autocomplete panel is shown.
        const options = await this.getOptions(filters);
        if (!options.length) {
            throw Error(`Could not find a mat-option matching ${JSON.stringify(filters)}`);
        }
        await options[0].click();
    }
    /** Whether the autocomplete is open. */
    async isOpen() {
        const panel = await this._getPanel();
        return !!panel && (await panel.hasClass(`mat-mdc-autocomplete-visible`));
    }
    /** Gets the panel associated with this autocomplete trigger. */
    async _getPanel() {
        // Technically this is static, but it needs to be in a
        // function, because the autocomplete's panel ID can changed.
        return this._documentRootLocator.locatorForOptional(await this._getPanelSelector())();
    }
    /** Gets the selector that can be used to find the autocomplete trigger's panel. */
    async _getPanelSelector() {
        return `#${await (await this.host()).getAttribute('aria-controls')}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYXV0b2NvbXBsZXRlL3Rlc3RpbmcvYXV0b2NvbXBsZXRlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsR0FFakIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLGdCQUFnQixHQUdqQixNQUFNLGdDQUFnQyxDQUFDO0FBR3hDLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxnQkFBZ0I7SUFBNUQ7O1FBQ1UseUJBQW9CLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUF1SG5FLENBQUM7SUFySEMseUVBQXlFO2FBQ2xFLGlCQUFZLEdBQUcsK0JBQStCLEFBQWxDLENBQW1DO0lBRXREOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FFVCxVQUFzQyxFQUFFO1FBRXhDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQ3ZDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUMxRDthQUNBLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQ25FLE9BQU8sQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQztRQUNuRCxDQUFDLENB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TyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFDRCxNQUFNLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLEtBQUssQ0FBQyxNQUFNO1FBQ1YsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsZ0VBQWdFO0lBQ3hELEtBQUssQ0FBQyxTQUFTO1FBQ3JCLHNEQUFzRDtRQUN0RCw2REFBNkQ7UUFDN0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEYsQ0FBQztJQUVELG1GQUFtRjtJQUN6RSxLQUFLLENBQUMsaUJBQWlCO1FBQy9CLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztJQUN2RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzcyxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBUZXN0RWxlbWVudCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtcbiAgTWF0T3B0Z3JvdXBIYXJuZXNzLFxuICBNYXRPcHRpb25IYXJuZXNzLFxuICBPcHRncm91cEhhcm5lc3NGaWx0ZXJzLFxuICBPcHRpb25IYXJuZXNzRmlsdGVycyxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZS90ZXN0aW5nJztcbmltcG9ydCB7QXV0b2NvbXBsZXRlSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vYXV0b2NvbXBsZXRlLWhhcm5lc3MtZmlsdGVycyc7XG5cbmV4cG9ydCBjbGFzcyBNYXRBdXRvY29tcGxldGVIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHByaXZhdGUgX2RvY3VtZW50Um9vdExvY2F0b3IgPSB0aGlzLmRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCk7XG5cbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRBdXRvY29tcGxldGVgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLWF1dG9jb21wbGV0ZS10cmlnZ2VyJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYW4gYXV0b2NvbXBsZXRlIHdpdGggc3BlY2lmaWNcbiAgICogYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGF1dG9jb21wbGV0ZSBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aDxUIGV4dGVuZHMgTWF0QXV0b2NvbXBsZXRlSGFybmVzcz4oXG4gICAgdGhpczogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IEF1dG9jb21wbGV0ZUhhcm5lc3NGaWx0ZXJzID0ge30sXG4gICk6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZSh0aGlzLCBvcHRpb25zKVxuICAgICAgLmFkZE9wdGlvbigndmFsdWUnLCBvcHRpb25zLnZhbHVlLCAoaGFybmVzcywgdmFsdWUpID0+XG4gICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFZhbHVlKCksIHZhbHVlKSxcbiAgICAgIClcbiAgICAgIC5hZGRPcHRpb24oJ2Rpc2FibGVkJywgb3B0aW9ucy5kaXNhYmxlZCwgYXN5bmMgKGhhcm5lc3MsIGRpc2FibGVkKSA9PiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgaGFybmVzcy5pc0Rpc2FibGVkKCkpID09PSBkaXNhYmxlZDtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSBhdXRvY29tcGxldGUgaW5wdXQuICovXG4gIGFzeW5jIGdldFZhbHVlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHk8c3RyaW5nPigndmFsdWUnKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdXRvY29tcGxldGUgaW5wdXQgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGlzYWJsZWQgPSAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGRpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBhdXRvY29tcGxldGUgaW5wdXQuICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIGF1dG9jb21wbGV0ZSBpbnB1dC4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXV0b2NvbXBsZXRlIGlucHV0IGlzIGZvY3VzZWQuICovXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKiBFbnRlcnMgdGV4dCBpbnRvIHRoZSBhdXRvY29tcGxldGUuICovXG4gIGFzeW5jIGVudGVyVGV4dCh2YWx1ZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuc2VuZEtleXModmFsdWUpO1xuICB9XG5cbiAgLyoqIENsZWFycyB0aGUgaW5wdXQgdmFsdWUuICovXG4gIGFzeW5jIGNsZWFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmNsZWFyKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgb3B0aW9ucyBpbnNpZGUgdGhlIGF1dG9jb21wbGV0ZSBwYW5lbC4gKi9cbiAgYXN5bmMgZ2V0T3B0aW9ucyhmaWx0ZXJzPzogT21pdDxPcHRpb25IYXJuZXNzRmlsdGVycywgJ2FuY2VzdG9yJz4pOiBQcm9taXNlPE1hdE9wdGlvbkhhcm5lc3NbXT4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuaXNPcGVuKCkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byByZXRyaWV2ZSBvcHRpb25zIGZvciBhdXRvY29tcGxldGUuIEF1dG9jb21wbGV0ZSBwYW5lbCBpcyBjbG9zZWQuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50Um9vdExvY2F0b3IubG9jYXRvckZvckFsbChcbiAgICAgIE1hdE9wdGlvbkhhcm5lc3Mud2l0aCh7XG4gICAgICAgIC4uLihmaWx0ZXJzIHx8IHt9KSxcbiAgICAgICAgYW5jZXN0b3I6IGF3YWl0IHRoaXMuX2dldFBhbmVsU2VsZWN0b3IoKSxcbiAgICAgIH0gYXMgT3B0aW9uSGFybmVzc0ZpbHRlcnMpLFxuICAgICkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBvcHRpb24gZ3JvdXBzIGluc2lkZSB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsLiAqL1xuICBhc3luYyBnZXRPcHRpb25Hcm91cHMoXG4gICAgZmlsdGVycz86IE9taXQ8T3B0Z3JvdXBIYXJuZXNzRmlsdGVycywgJ2FuY2VzdG9yJz4sXG4gICk6IFByb21pc2U8TWF0T3B0Z3JvdXBIYXJuZXNzW10+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmlzT3BlbigpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVW5hYmxlIHRvIHJldHJpZXZlIG9wdGlvbiBncm91cHMgZm9yIGF1dG9jb21wbGV0ZS4gQXV0b2NvbXBsZXRlIHBhbmVsIGlzIGNsb3NlZC4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRSb290TG9jYXRvci5sb2NhdG9yRm9yQWxsKFxuICAgICAgTWF0T3B0Z3JvdXBIYXJuZXNzLndpdGgoe1xuICAgICAgICAuLi4oZmlsdGVycyB8fCB7fSksXG4gICAgICAgIGFuY2VzdG9yOiBhd2FpdCB0aGlzLl9nZXRQYW5lbFNlbGVjdG9yKCksXG4gICAgICB9IGFzIE9wdGdyb3VwSGFybmVzc0ZpbHRlcnMpLFxuICAgICkoKTtcbiAgfVxuXG4gIC8qKiBTZWxlY3RzIHRoZSBmaXJzdCBvcHRpb24gbWF0Y2hpbmcgdGhlIGdpdmVuIGZpbHRlcnMuICovXG4gIGFzeW5jIHNlbGVjdE9wdGlvbihmaWx0ZXJzOiBPcHRpb25IYXJuZXNzRmlsdGVycyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZm9jdXMoKTsgLy8gRm9jdXMgdGhlIGlucHV0IHRvIG1ha2Ugc3VyZSB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsIGlzIHNob3duLlxuICAgIGNvbnN0IG9wdGlvbnMgPSBhd2FpdCB0aGlzLmdldE9wdGlvbnMoZmlsdGVycyk7XG4gICAgaWYgKCFvcHRpb25zLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgbWF0LW9wdGlvbiBtYXRjaGluZyAke0pTT04uc3RyaW5naWZ5KGZpbHRlcnMpfWApO1xuICAgIH1cbiAgICBhd2FpdCBvcHRpb25zWzBdLmNsaWNrKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXV0b2NvbXBsZXRlIGlzIG9wZW4uICovXG4gIGFzeW5jIGlzT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBwYW5lbCA9IGF3YWl0IHRoaXMuX2dldFBhbmVsKCk7XG4gICAgcmV0dXJuICEhcGFuZWwgJiYgKGF3YWl0IHBhbmVsLmhhc0NsYXNzKGBtYXQtbWRjLWF1dG9jb21wbGV0ZS12aXNpYmxlYCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHBhbmVsIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGF1dG9jb21wbGV0ZSB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQYW5lbCgpOiBQcm9taXNlPFRlc3RFbGVtZW50IHwgbnVsbD4ge1xuICAgIC8vIFRlY2huaWNhbGx5IHRoaXMgaXMgc3RhdGljLCBidXQgaXQgbmVlZHMgdG8gYmUgaW4gYVxuICAgIC8vIGZ1bmN0aW9uLCBiZWNhdXNlIHRoZSBhdXRvY29tcGxldGUncyBwYW5lbCBJRCBjYW4gY2hhbmdlZC5cbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRSb290TG9jYXRvci5sb2NhdG9yRm9yT3B0aW9uYWwoYXdhaXQgdGhpcy5fZ2V0UGFuZWxTZWxlY3RvcigpKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNlbGVjdG9yIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCB0aGUgYXV0b2NvbXBsZXRlIHRyaWdnZXIncyBwYW5lbC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIF9nZXRQYW5lbFNlbGVjdG9yKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGAjJHthd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpfWA7XG4gIH1cbn1cbiJdfQ==