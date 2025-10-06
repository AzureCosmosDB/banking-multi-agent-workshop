/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
/** Harness for interacting with an Angular Material tab in tests. */
export class MatTabHarness extends ContentContainerComponentHarness {
    /** The selector for the host element of a `MatTab` instance. */
    static { this.hostSelector = '.mat-mdc-tab'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tab with specific attributes.
     * @param options Options for filtering which tab instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
            .addOption('selected', options.selected, async (harness, selected) => (await harness.isSelected()) == selected);
    }
    /** Gets the label of the tab. */
    async getLabel() {
        return (await this.host()).text();
    }
    /** Gets the aria-label of the tab. */
    async getAriaLabel() {
        return (await this.host()).getAttribute('aria-label');
    }
    /** Gets the value of the "aria-labelledby" attribute. */
    async getAriaLabelledby() {
        return (await this.host()).getAttribute('aria-labelledby');
    }
    /** Whether the tab is selected. */
    async isSelected() {
        const hostEl = await this.host();
        return (await hostEl.getAttribute('aria-selected')) === 'true';
    }
    /** Whether the tab is disabled. */
    async isDisabled() {
        const hostEl = await this.host();
        return (await hostEl.getAttribute('aria-disabled')) === 'true';
    }
    /** Selects the given tab by clicking on the label. Tab cannot be selected if disabled. */
    async select() {
        await (await this.host()).click('center');
    }
    /** Gets the text content of the tab. */
    async getTextContent() {
        const contentId = await this._getContentId();
        const contentEl = await this.documentRootLocatorFactory().locatorFor(`#${contentId}`)();
        return contentEl.text();
    }
    async getRootHarnessLoader() {
        const contentId = await this._getContentId();
        return this.documentRootLocatorFactory().harnessLoaderFor(`#${contentId}`);
    }
    /** Gets the element id for the content of the current tab. */
    async _getContentId() {
        const hostEl = await this.host();
        // Tabs never have an empty "aria-controls" attribute.
        return (await hostEl.getAttribute('aria-controls'));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy90ZXN0aW5nL3RhYi1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxnQ0FBZ0MsRUFFaEMsZ0JBQWdCLEdBQ2pCLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIscUVBQXFFO0FBQ3JFLE1BQU0sT0FBTyxhQUFjLFNBQVEsZ0NBQXdDO0lBQ3pFLGdFQUFnRTthQUN6RCxpQkFBWSxHQUFHLGNBQWMsQ0FBQztJQUVyQzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FFVCxVQUE2QixFQUFFO1FBRS9CLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQ3ZDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUMxRDthQUNBLFNBQVMsQ0FDUixVQUFVLEVBQ1YsT0FBTyxDQUFDLFFBQVEsRUFDaEIsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxRQUFRLENBQ3RFLENBQUM7SUFDTixDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLEtBQUssQ0FBQyxRQUFRO1FBQ1osT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxLQUFLLENBQUMsWUFBWTtRQUNoQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxPQUFPLENBQUMsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQ2pFLENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxPQUFPLENBQUMsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQ2pFLENBQUM7SUFFRCwwRkFBMEY7SUFDMUYsS0FBSyxDQUFDLE1BQU07UUFDVixNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELHdDQUF3QztJQUN4QyxLQUFLLENBQUMsY0FBYztRQUNsQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN4RixPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRWtCLEtBQUssQ0FBQyxvQkFBb0I7UUFDM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDN0MsT0FBTyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELDhEQUE4RDtJQUN0RCxLQUFLLENBQUMsYUFBYTtRQUN6QixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxzREFBc0Q7UUFDdEQsT0FBTyxDQUFDLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBRSxDQUFDO0lBQ3ZELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcyxcbiAgSGFybmVzc0xvYWRlcixcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtUYWJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi90YWItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYW4gQW5ndWxhciBNYXRlcmlhbCB0YWIgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0VGFiSGFybmVzcyBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPHN0cmluZz4ge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFRhYmAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1tZGMtdGFiJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0YWIgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggdGFiIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoPFQgZXh0ZW5kcyBNYXRUYWJIYXJuZXNzPihcbiAgICB0aGlzOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sXG4gICAgb3B0aW9uczogVGFiSGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpXG4gICAgICAuYWRkT3B0aW9uKCdsYWJlbCcsIG9wdGlvbnMubGFiZWwsIChoYXJuZXNzLCBsYWJlbCkgPT5cbiAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0TGFiZWwoKSwgbGFiZWwpLFxuICAgICAgKVxuICAgICAgLmFkZE9wdGlvbihcbiAgICAgICAgJ3NlbGVjdGVkJyxcbiAgICAgICAgb3B0aW9ucy5zZWxlY3RlZCxcbiAgICAgICAgYXN5bmMgKGhhcm5lc3MsIHNlbGVjdGVkKSA9PiAoYXdhaXQgaGFybmVzcy5pc1NlbGVjdGVkKCkpID09IHNlbGVjdGVkLFxuICAgICAgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsYWJlbCBvZiB0aGUgdGFiLiAqL1xuICBhc3luYyBnZXRMYWJlbCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBhcmlhLWxhYmVsIG9mIHRoZSB0YWIuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgXCJhcmlhLWxhYmVsbGVkYnlcIiBhdHRyaWJ1dGUuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbGxlZGJ5KCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgdGFiIGlzIHNlbGVjdGVkLiAqL1xuICBhc3luYyBpc1NlbGVjdGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhvc3RFbCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIHJldHVybiAoYXdhaXQgaG9zdEVsLmdldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpKSA9PT0gJ3RydWUnO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYiBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBob3N0RWwgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICByZXR1cm4gKGF3YWl0IGhvc3RFbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnKSkgPT09ICd0cnVlJztcbiAgfVxuXG4gIC8qKiBTZWxlY3RzIHRoZSBnaXZlbiB0YWIgYnkgY2xpY2tpbmcgb24gdGhlIGxhYmVsLiBUYWIgY2Fubm90IGJlIHNlbGVjdGVkIGlmIGRpc2FibGVkLiAqL1xuICBhc3luYyBzZWxlY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5jbGljaygnY2VudGVyJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBjb250ZW50IG9mIHRoZSB0YWIuICovXG4gIGFzeW5jIGdldFRleHRDb250ZW50KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgY29udGVudElkID0gYXdhaXQgdGhpcy5fZ2V0Q29udGVudElkKCk7XG4gICAgY29uc3QgY29udGVudEVsID0gYXdhaXQgdGhpcy5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpLmxvY2F0b3JGb3IoYCMke2NvbnRlbnRJZH1gKSgpO1xuICAgIHJldHVybiBjb250ZW50RWwudGV4dCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGFzeW5jIGdldFJvb3RIYXJuZXNzTG9hZGVyKCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIGNvbnN0IGNvbnRlbnRJZCA9IGF3YWl0IHRoaXMuX2dldENvbnRlbnRJZCgpO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCkuaGFybmVzc0xvYWRlckZvcihgIyR7Y29udGVudElkfWApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGVsZW1lbnQgaWQgZm9yIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IHRhYi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29udGVudElkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgaG9zdEVsID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgLy8gVGFicyBuZXZlciBoYXZlIGFuIGVtcHR5IFwiYXJpYS1jb250cm9sc1wiIGF0dHJpYnV0ZS5cbiAgICByZXR1cm4gKGF3YWl0IGhvc3RFbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkhO1xuICB9XG59XG4iXX0=