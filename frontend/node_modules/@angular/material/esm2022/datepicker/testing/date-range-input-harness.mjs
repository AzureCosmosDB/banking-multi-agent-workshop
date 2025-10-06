/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HarnessPredicate, parallel, TestKey } from '@angular/cdk/testing';
import { MatDatepickerInputHarnessBase, getInputPredicate } from './datepicker-input-harness-base';
import { DatepickerTriggerHarnessBase } from './datepicker-trigger-harness-base';
/** Harness for interacting with a standard Material date range start input in tests. */
export class MatStartDateHarness extends MatDatepickerInputHarnessBase {
    static { this.hostSelector = '.mat-start-date'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatStartDateHarness`
     * that meets certain criteria.
     * @param options Options for filtering which input instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getInputPredicate(MatStartDateHarness, options);
    }
}
/** Harness for interacting with a standard Material date range end input in tests. */
export class MatEndDateHarness extends MatDatepickerInputHarnessBase {
    static { this.hostSelector = '.mat-end-date'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatEndDateHarness`
     * that meets certain criteria.
     * @param options Options for filtering which input instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getInputPredicate(MatEndDateHarness, options);
    }
}
/** Harness for interacting with a standard Material date range input in tests. */
export class MatDateRangeInputHarness extends DatepickerTriggerHarnessBase {
    static { this.hostSelector = '.mat-date-range-input'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDateRangeInputHarness`
     * that meets certain criteria.
     * @param options Options for filtering which input instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatDateRangeInputHarness, options).addOption('value', options.value, (harness, value) => HarnessPredicate.stringMatches(harness.getValue(), value));
    }
    /** Gets the combined value of the start and end inputs, including the separator. */
    async getValue() {
        const [start, end, separator] = await parallel(() => [
            this.getStartInput().then(input => input.getValue()),
            this.getEndInput().then(input => input.getValue()),
            this.getSeparator(),
        ]);
        return start + `${end ? ` ${separator} ${end}` : ''}`;
    }
    /** Gets the inner start date input inside the range input. */
    async getStartInput() {
        // Don't pass in filters here since the start input is required and there can only be one.
        return this.locatorFor(MatStartDateHarness)();
    }
    /** Gets the inner start date input inside the range input. */
    async getEndInput() {
        // Don't pass in filters here since the end input is required and there can only be one.
        return this.locatorFor(MatEndDateHarness)();
    }
    /** Gets the separator text between the values of the two inputs. */
    async getSeparator() {
        return (await this.locatorFor('.mat-date-range-input-separator')()).text();
    }
    /** Gets whether the range input is disabled. */
    async isDisabled() {
        // We consider the input as disabled if both of the sub-inputs are disabled.
        const [startDisabled, endDisabled] = await parallel(() => [
            this.getStartInput().then(input => input.isDisabled()),
            this.getEndInput().then(input => input.isDisabled()),
        ]);
        return startDisabled && endDisabled;
    }
    /** Gets whether the range input is required. */
    async isRequired() {
        return (await this.host()).hasClass('mat-date-range-input-required');
    }
    /** Opens the calendar associated with the input. */
    async isCalendarOpen() {
        // `aria-owns` is set on both inputs only if there's an
        // open range picker so we can use it as an indicator.
        const startHost = await (await this.getStartInput()).host();
        return (await startHost.getAttribute('aria-owns')) != null;
    }
    async _openCalendar() {
        // Alt + down arrow is the combination for opening the calendar with the keyboard.
        const startHost = await (await this.getStartInput()).host();
        return startHost.sendKeys({ alt: true }, TestKey.DOWN_ARROW);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1pbnB1dC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvdGVzdGluZy9kYXRlLXJhbmdlLWlucHV0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RSxPQUFPLEVBQUMsNkJBQTZCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNqRyxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQU0vRSx3RkFBd0Y7QUFDeEYsTUFBTSxPQUFPLG1CQUFvQixTQUFRLDZCQUE2QjthQUM3RCxpQkFBWSxHQUFHLGlCQUFpQixDQUFDO0lBRXhDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUF5QyxFQUFFO1FBQ3JELE9BQU8saUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekQsQ0FBQzs7QUFHSCxzRkFBc0Y7QUFDdEYsTUFBTSxPQUFPLGlCQUFrQixTQUFRLDZCQUE2QjthQUMzRCxpQkFBWSxHQUFHLGVBQWUsQ0FBQztJQUV0Qzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBeUMsRUFBRTtRQUNyRCxPQUFPLGlCQUFpQixDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7O0FBR0gsa0ZBQWtGO0FBQ2xGLE1BQU0sT0FBTyx3QkFBeUIsU0FBUSw0QkFBNEI7YUFDakUsaUJBQVksR0FBRyx1QkFBdUIsQ0FBQztJQUU5Qzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQ1QsVUFBd0MsRUFBRTtRQUUxQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsd0JB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R0FBRyxFQUFFLElBQUksRUFBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWwsIFRlc3RLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlcklucHV0SGFybmVzc0Jhc2UsIGdldElucHV0UHJlZGljYXRlfSBmcm9tICcuL2RhdGVwaWNrZXItaW5wdXQtaGFybmVzcy1iYXNlJztcbmltcG9ydCB7RGF0ZXBpY2tlclRyaWdnZXJIYXJuZXNzQmFzZX0gZnJvbSAnLi9kYXRlcGlja2VyLXRyaWdnZXItaGFybmVzcy1iYXNlJztcbmltcG9ydCB7XG4gIERhdGVwaWNrZXJJbnB1dEhhcm5lc3NGaWx0ZXJzLFxuICBEYXRlUmFuZ2VJbnB1dEhhcm5lc3NGaWx0ZXJzLFxufSBmcm9tICcuL2RhdGVwaWNrZXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBNYXRlcmlhbCBkYXRlIHJhbmdlIHN0YXJ0IGlucHV0IGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFN0YXJ0RGF0ZUhhcm5lc3MgZXh0ZW5kcyBNYXREYXRlcGlja2VySW5wdXRIYXJuZXNzQmFzZSB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1zdGFydC1kYXRlJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0U3RhcnREYXRlSGFybmVzc2BcbiAgICogdGhhdCBtZWV0cyBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggaW5wdXQgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogRGF0ZXBpY2tlcklucHV0SGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0U3RhcnREYXRlSGFybmVzcz4ge1xuICAgIHJldHVybiBnZXRJbnB1dFByZWRpY2F0ZShNYXRTdGFydERhdGVIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIE1hdGVyaWFsIGRhdGUgcmFuZ2UgZW5kIGlucHV0IGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEVuZERhdGVIYXJuZXNzIGV4dGVuZHMgTWF0RGF0ZXBpY2tlcklucHV0SGFybmVzc0Jhc2Uge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZW5kLWRhdGUnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRFbmREYXRlSGFybmVzc2BcbiAgICogdGhhdCBtZWV0cyBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggaW5wdXQgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogRGF0ZXBpY2tlcklucHV0SGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0RW5kRGF0ZUhhcm5lc3M+IHtcbiAgICByZXR1cm4gZ2V0SW5wdXRQcmVkaWNhdGUoTWF0RW5kRGF0ZUhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgTWF0ZXJpYWwgZGF0ZSByYW5nZSBpbnB1dCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXREYXRlUmFuZ2VJbnB1dEhhcm5lc3MgZXh0ZW5kcyBEYXRlcGlja2VyVHJpZ2dlckhhcm5lc3NCYXNlIHtcbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWRhdGUtcmFuZ2UtaW5wdXQnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXREYXRlUmFuZ2VJbnB1dEhhcm5lc3NgXG4gICAqIHRoYXQgbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGlucHV0IGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKFxuICAgIG9wdGlvbnM6IERhdGVSYW5nZUlucHV0SGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxNYXREYXRlUmFuZ2VJbnB1dEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0RGF0ZVJhbmdlSW5wdXRIYXJuZXNzLCBvcHRpb25zKS5hZGRPcHRpb24oXG4gICAgICAndmFsdWUnLFxuICAgICAgb3B0aW9ucy52YWx1ZSxcbiAgICAgIChoYXJuZXNzLCB2YWx1ZSkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VmFsdWUoKSwgdmFsdWUpLFxuICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY29tYmluZWQgdmFsdWUgb2YgdGhlIHN0YXJ0IGFuZCBlbmQgaW5wdXRzLCBpbmNsdWRpbmcgdGhlIHNlcGFyYXRvci4gKi9cbiAgYXN5bmMgZ2V0VmFsdWUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBbc3RhcnQsIGVuZCwgc2VwYXJhdG9yXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFtcbiAgICAgIHRoaXMuZ2V0U3RhcnRJbnB1dCgpLnRoZW4oaW5wdXQgPT4gaW5wdXQuZ2V0VmFsdWUoKSksXG4gICAgICB0aGlzLmdldEVuZElucHV0KCkudGhlbihpbnB1dCA9PiBpbnB1dC5nZXRWYWx1ZSgpKSxcbiAgICAgIHRoaXMuZ2V0U2VwYXJhdG9yKCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gc3RhcnQgKyBgJHtlbmQgPyBgICR7c2VwYXJhdG9yfSAke2VuZH1gIDogJyd9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbm5lciBzdGFydCBkYXRlIGlucHV0IGluc2lkZSB0aGUgcmFuZ2UgaW5wdXQuICovXG4gIGFzeW5jIGdldFN0YXJ0SW5wdXQoKTogUHJvbWlzZTxNYXRTdGFydERhdGVIYXJuZXNzPiB7XG4gICAgLy8gRG9uJ3QgcGFzcyBpbiBmaWx0ZXJzIGhlcmUgc2luY2UgdGhlIHN0YXJ0IGlucHV0IGlzIHJlcXVpcmVkIGFuZCB0aGVyZSBjYW4gb25seSBiZSBvbmUuXG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvcihNYXRTdGFydERhdGVIYXJuZXNzKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGlubmVyIHN0YXJ0IGRhdGUgaW5wdXQgaW5zaWRlIHRoZSByYW5nZSBpbnB1dC4gKi9cbiAgYXN5bmMgZ2V0RW5kSW5wdXQoKTogUHJvbWlzZTxNYXRFbmREYXRlSGFybmVzcz4ge1xuICAgIC8vIERvbid0IHBhc3MgaW4gZmlsdGVycyBoZXJlIHNpbmNlIHRoZSBlbmQgaW5wdXQgaXMgcmVxdWlyZWQgYW5kIHRoZXJlIGNhbiBvbmx5IGJlIG9uZS5cbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yKE1hdEVuZERhdGVIYXJuZXNzKSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNlcGFyYXRvciB0ZXh0IGJldHdlZW4gdGhlIHZhbHVlcyBvZiB0aGUgdHdvIGlucHV0cy4gKi9cbiAgYXN5bmMgZ2V0U2VwYXJhdG9yKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtZGF0ZS1yYW5nZS1pbnB1dC1zZXBhcmF0b3InKSgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSByYW5nZSBpbnB1dCBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBXZSBjb25zaWRlciB0aGUgaW5wdXQgYXMgZGlzYWJsZWQgaWYgYm90aCBvZiB0aGUgc3ViLWlucHV0cyBhcmUgZGlzYWJsZWQuXG4gICAgY29uc3QgW3N0YXJ0RGlzYWJsZWQsIGVuZERpc2FibGVkXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFtcbiAgICAgIHRoaXMuZ2V0U3RhcnRJbnB1dCgpLnRoZW4oaW5wdXQgPT4gaW5wdXQuaXNEaXNhYmxlZCgpKSxcbiAgICAgIHRoaXMuZ2V0RW5kSW5wdXQoKS50aGVuKGlucHV0ID0+IGlucHV0LmlzRGlzYWJsZWQoKSksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gc3RhcnREaXNhYmxlZCAmJiBlbmREaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIHJhbmdlIGlucHV0IGlzIHJlcXVpcmVkLiAqL1xuICBhc3luYyBpc1JlcXVpcmVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtZGF0ZS1yYW5nZS1pbnB1dC1yZXF1aXJlZCcpO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBjYWxlbmRhciBhc3NvY2lhdGVkIHdpdGggdGhlIGlucHV0LiAqL1xuICBhc3luYyBpc0NhbGVuZGFyT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBgYXJpYS1vd25zYCBpcyBzZXQgb24gYm90aCBpbnB1dHMgb25seSBpZiB0aGVyZSdzIGFuXG4gICAgLy8gb3BlbiByYW5nZSBwaWNrZXIgc28gd2UgY2FuIHVzZSBpdCBhcyBhbiBpbmRpY2F0b3IuXG4gICAgY29uc3Qgc3RhcnRIb3N0ID0gYXdhaXQgKGF3YWl0IHRoaXMuZ2V0U3RhcnRJbnB1dCgpKS5ob3N0KCk7XG4gICAgcmV0dXJuIChhd2FpdCBzdGFydEhvc3QuZ2V0QXR0cmlidXRlKCdhcmlhLW93bnMnKSkgIT0gbnVsbDtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBfb3BlbkNhbGVuZGFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEFsdCArIGRvd24gYXJyb3cgaXMgdGhlIGNvbWJpbmF0aW9uIGZvciBvcGVuaW5nIHRoZSBjYWxlbmRhciB3aXRoIHRoZSBrZXlib2FyZC5cbiAgICBjb25zdCBzdGFydEhvc3QgPSBhd2FpdCAoYXdhaXQgdGhpcy5nZXRTdGFydElucHV0KCkpLmhvc3QoKTtcbiAgICByZXR1cm4gc3RhcnRIb3N0LnNlbmRLZXlzKHthbHQ6IHRydWV9LCBUZXN0S2V5LkRPV05fQVJST1cpO1xuICB9XG59XG4iXX0=