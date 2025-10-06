/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ComponentHarness, HarnessPredicate, parallel, } from '@angular/cdk/testing';
import { ThumbPosition } from './slider-harness-filters';
/** Harness for interacting with a thumb inside of a Material slider in tests. */
export class MatSliderThumbHarness extends ComponentHarness {
    static { this.hostSelector = 'input[matSliderThumb], input[matSliderStartThumb], input[matSliderEndThumb]'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a slider thumb with specific attributes.
     * @param options Options for filtering which thumb instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options).addOption('position', options.position, async (harness, value) => {
            return (await harness.getPosition()) === value;
        });
    }
    /** Gets the position of the thumb inside the slider. */
    async getPosition() {
        // Meant to mimic MDC's logic where `matSliderThumb` is treated as END.
        const isStart = (await (await this.host()).getAttribute('matSliderStartThumb')) != null;
        return isStart ? ThumbPosition.START : ThumbPosition.END;
    }
    /** Gets the value of the thumb. */
    async getValue() {
        return await (await this.host()).getProperty('valueAsNumber');
    }
    /** Sets the value of the thumb. */
    async setValue(newValue) {
        const input = await this.host();
        // Since this is a range input, we can't simulate the user interacting with it so we set the
        // value directly and dispatch a couple of fake events to ensure that everything fires.
        await input.setInputValue(newValue + '');
        await input.dispatchEvent('input');
        await input.dispatchEvent('change');
    }
    /** Gets the current percentage value of the slider. */
    async getPercentage() {
        const [value, min, max] = await parallel(() => [
            this.getValue(),
            this.getMinValue(),
            this.getMaxValue(),
        ]);
        return (value - min) / (max - min);
    }
    /** Gets the maximum value of the thumb. */
    async getMaxValue() {
        return coerceNumberProperty(await (await this.host()).getProperty('max'));
    }
    /** Gets the minimum value of the thumb. */
    async getMinValue() {
        return coerceNumberProperty(await (await this.host()).getProperty('min'));
    }
    /** Gets the text representation of the slider's value. */
    async getDisplayValue() {
        return (await (await this.host()).getAttribute('aria-valuetext')) || '';
    }
    /** Whether the thumb is disabled. */
    async isDisabled() {
        return (await this.host()).getProperty('disabled');
    }
    /** Gets the name of the thumb. */
    async getName() {
        return await (await this.host()).getProperty('name');
    }
    /** Gets the id of the thumb. */
    async getId() {
        return await (await this.host()).getProperty('id');
    }
    /**
     * Focuses the thumb and returns a promise that indicates when the
     * action is complete.
     */
    async focus() {
        return (await this.host()).focus();
    }
    /**
     * Blurs the thumb and returns a promise that indicates when the
     * action is complete.
     */
    async blur() {
        return (await this.host()).blur();
    }
    /** Whether the thumb is focused. */
    async isFocused() {
        return (await this.host()).isFocused();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLXRodW1iLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2xpZGVyL3Rlc3Rpbmcvc2xpZGVyLXRodW1iLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsRUFDaEIsUUFBUSxHQUNULE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUE0QixhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUVsRixpRkFBaUY7QUFDakYsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGdCQUFnQjthQUNsRCxpQkFBWSxHQUNqQiw2RUFBNkUsQ0FBQztJQUVoRjs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FFVCxVQUFxQyxFQUFFO1FBRXZDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUNsRCxVQUFVLEVBQ1YsT0FBTyxDQUFDLFFBQVEsRUFDaEIsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN2QixPQUFPLENBQUMsTUFBTSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxLQUFLLENBQUM7UUFDakQsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELEtBQUssQ0FBQyxXQUFXO1FBQ2YsdUVBQXVFO1FBQ3ZFLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDeEYsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENB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LElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7XG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcixcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgcGFyYWxsZWwsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7U2xpZGVyVGh1bWJIYXJuZXNzRmlsdGVycywgVGh1bWJQb3NpdGlvbn0gZnJvbSAnLi9zbGlkZXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSB0aHVtYiBpbnNpZGUgb2YgYSBNYXRlcmlhbCBzbGlkZXIgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0U2xpZGVyVGh1bWJIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPVxuICAgICdpbnB1dFttYXRTbGlkZXJUaHVtYl0sIGlucHV0W21hdFNsaWRlclN0YXJ0VGh1bWJdLCBpbnB1dFttYXRTbGlkZXJFbmRUaHVtYl0nO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHNsaWRlciB0aHVtYiB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCB0aHVtYiBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aDxUIGV4dGVuZHMgTWF0U2xpZGVyVGh1bWJIYXJuZXNzPihcbiAgICB0aGlzOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sXG4gICAgb3B0aW9uczogU2xpZGVyVGh1bWJIYXJuZXNzRmlsdGVycyA9IHt9LFxuICApOiBIYXJuZXNzUHJlZGljYXRlPFQ+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUodGhpcywgb3B0aW9ucykuYWRkT3B0aW9uKFxuICAgICAgJ3Bvc2l0aW9uJyxcbiAgICAgIG9wdGlvbnMucG9zaXRpb24sXG4gICAgICBhc3luYyAoaGFybmVzcywgdmFsdWUpID0+IHtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBoYXJuZXNzLmdldFBvc2l0aW9uKCkpID09PSB2YWx1ZTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgdGh1bWIgaW5zaWRlIHRoZSBzbGlkZXIuICovXG4gIGFzeW5jIGdldFBvc2l0aW9uKCk6IFByb21pc2U8VGh1bWJQb3NpdGlvbj4ge1xuICAgIC8vIE1lYW50IHRvIG1pbWljIE1EQydzIGxvZ2ljIHdoZXJlIGBtYXRTbGlkZXJUaHVtYmAgaXMgdHJlYXRlZCBhcyBFTkQuXG4gICAgY29uc3QgaXNTdGFydCA9IChhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnbWF0U2xpZGVyU3RhcnRUaHVtYicpKSAhPSBudWxsO1xuICAgIHJldHVybiBpc1N0YXJ0ID8gVGh1bWJQb3NpdGlvbi5TVEFSVCA6IFRodW1iUG9zaXRpb24uRU5EO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSB0aHVtYi4gKi9cbiAgYXN5bmMgZ2V0VmFsdWUoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eTxudW1iZXI+KCd2YWx1ZUFzTnVtYmVyJyk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHRodW1iLiAqL1xuICBhc3luYyBzZXRWYWx1ZShuZXdWYWx1ZTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaW5wdXQgPSBhd2FpdCB0aGlzLmhvc3QoKTtcblxuICAgIC8vIFNpbmNlIHRoaXMgaXMgYSByYW5nZSBpbnB1dCwgd2UgY2FuJ3Qgc2ltdWxhdGUgdGhlIHVzZXIgaW50ZXJhY3Rpbmcgd2l0aCBpdCBzbyB3ZSBzZXQgdGhlXG4gICAgLy8gdmFsdWUgZGlyZWN0bHkgYW5kIGRpc3BhdGNoIGEgY291cGxlIG9mIGZha2UgZXZlbnRzIHRvIGVuc3VyZSB0aGF0IGV2ZXJ5dGhpbmcgZmlyZXMuXG4gICAgYXdhaXQgaW5wdXQuc2V0SW5wdXRWYWx1ZShuZXdWYWx1ZSArICcnKTtcbiAgICBhd2FpdCBpbnB1dC5kaXNwYXRjaEV2ZW50KCdpbnB1dCcpO1xuICAgIGF3YWl0IGlucHV0LmRpc3BhdGNoRXZlbnQoJ2NoYW5nZScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnQgcGVyY2VudGFnZSB2YWx1ZSBvZiB0aGUgc2xpZGVyLiAqL1xuICBhc3luYyBnZXRQZXJjZW50YWdlKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgW3ZhbHVlLCBtaW4sIG1heF0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICB0aGlzLmdldFZhbHVlKCksXG4gICAgICB0aGlzLmdldE1pblZhbHVlKCksXG4gICAgICB0aGlzLmdldE1heFZhbHVlKCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gKHZhbHVlIC0gbWluKSAvIChtYXggLSBtaW4pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1heGltdW0gdmFsdWUgb2YgdGhlIHRodW1iLiAqL1xuICBhc3luYyBnZXRNYXhWYWx1ZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBjb2VyY2VOdW1iZXJQcm9wZXJ0eShhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldFByb3BlcnR5PG51bWJlcj4oJ21heCcpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtaW5pbXVtIHZhbHVlIG9mIHRoZSB0aHVtYi4gKi9cbiAgYXN5bmMgZ2V0TWluVmFsdWUoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gY29lcmNlTnVtYmVyUHJvcGVydHkoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eTxudW1iZXI+KCdtaW4nKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2xpZGVyJ3MgdmFsdWUuICovXG4gIGFzeW5jIGdldERpc3BsYXlWYWx1ZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWV0ZXh0JykpIHx8ICcnO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRodW1iIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldFByb3BlcnR5PGJvb2xlYW4+KCdkaXNhYmxlZCcpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5hbWUgb2YgdGhlIHRodW1iLiAqL1xuICBhc3luYyBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHk8c3RyaW5nPignbmFtZScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGlkIG9mIHRoZSB0aHVtYi4gKi9cbiAgYXN5bmMgZ2V0SWQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eTxzdHJpbmc+KCdpZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIHRodW1iIGFuZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGluZGljYXRlcyB3aGVuIHRoZVxuICAgKiBhY3Rpb24gaXMgY29tcGxldGUuXG4gICAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJsdXJzIHRoZSB0aHVtYiBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpbmRpY2F0ZXMgd2hlbiB0aGVcbiAgICogYWN0aW9uIGlzIGNvbXBsZXRlLlxuICAgKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgdGh1bWIgaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmlzRm9jdXNlZCgpO1xuICB9XG59XG4iXX0=