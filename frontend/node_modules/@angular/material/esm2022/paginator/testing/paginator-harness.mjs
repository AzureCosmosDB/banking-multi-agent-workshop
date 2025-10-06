/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { coerceNumberProperty } from '@angular/cdk/coercion';
/** Harness for interacting with a mat-paginator in tests. */
export class MatPaginatorHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._nextButton = this.locatorFor('.mat-mdc-paginator-navigation-next');
        this._previousButton = this.locatorFor('.mat-mdc-paginator-navigation-previous');
        this._firstPageButton = this.locatorForOptional('.mat-mdc-paginator-navigation-first');
        this._lastPageButton = this.locatorForOptional('.mat-mdc-paginator-navigation-last');
        this._select = this.locatorForOptional(MatSelectHarness.with({
            ancestor: '.mat-mdc-paginator-page-size',
        }));
        this._pageSizeFallback = this.locatorFor('.mat-mdc-paginator-page-size-value');
        this._rangeLabel = this.locatorFor('.mat-mdc-paginator-range-label');
    }
    /** Selector used to find paginator instances. */
    static { this.hostSelector = '.mat-mdc-paginator'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a paginator with specific attributes.
     * @param options Options for filtering which paginator instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options);
    }
    /** Goes to the next page in the paginator. */
    async goToNextPage() {
        return (await this._nextButton()).click();
    }
    /** Returns whether or not the next page button is disabled. */
    async isNextPageDisabled() {
        const disabledValue = await (await this._nextButton()).getAttribute('disabled');
        return disabledValue == 'true';
    }
    /* Returns whether or not the previous page button is disabled. */
    async isPreviousPageDisabled() {
        const disabledValue = await (await this._previousButton()).getAttribute('disabled');
        return disabledValue == 'true';
    }
    /** Goes to the previous page in the paginator. */
    async goToPreviousPage() {
        return (await this._previousButton()).click();
    }
    /** Goes to the first page in the paginator. */
    async goToFirstPage() {
        const button = await this._firstPageButton();
        // The first page button isn't enabled by default so we need to check for it.
        if (!button) {
            throw Error('Could not find first page button inside paginator. ' +
                'Make sure that `showFirstLastButtons` is enabled.');
        }
        return button.click();
    }
    /** Goes to the last page in the paginator. */
    async goToLastPage() {
        const button = await this._lastPageButton();
        // The last page button isn't enabled by default so we need to check for it.
        if (!button) {
            throw Error('Could not find last page button inside paginator. ' +
                'Make sure that `showFirstLastButtons` is enabled.');
        }
        return button.click();
    }
    /**
     * Sets the page size of the paginator.
     * @param size Page size that should be select.
     */
    async setPageSize(size) {
        const select = await this._select();
        // The select is only available if the `pageSizeOptions` are
        // set to an array with more than one item.
        if (!select) {
            throw Error('Cannot find page size selector in paginator. ' +
                'Make sure that the `pageSizeOptions` have been configured.');
        }
        return select.clickOptions({ text: `${size}` });
    }
    /** Gets the page size of the paginator. */
    async getPageSize() {
        const select = await this._select();
        const value = select ? select.getValueText() : (await this._pageSizeFallback()).text();
        return coerceNumberProperty(await value);
    }
    /** Gets the text of the range label of the paginator. */
    async getRangeLabel() {
        return (await this._rangeLabel()).text();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdG9yLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvcGFnaW5hdG9yL3Rlc3RpbmcvcGFnaW5hdG9yLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsR0FDakIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUczRCw2REFBNkQ7QUFDN0QsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGdCQUFnQjtJQUF6RDs7UUFHVSxnQkFBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNwRSxvQkFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUM1RSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNsRixvQkFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ3hGLFlBQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQy9CLGdCQUFnQixDQUFDLElBQUksQ0FBQztZQUNwQixRQUFRLEVBQUUsOEJBQThCO1NBQ3pDLENBQUMsQ0FDSCxDQUFDO1FBQ00sc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ2xGLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBZ0dsRSxDQUFDO0lBNUdDLGlEQUFpRDthQUMxQyxpQkFBWSxHQUFHLG9CQUFvQixBQUF2QixDQUF3QjtJQWEzQzs7OztPQUlHO0lBQ0gs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Q0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0U2VsZWN0SGFybmVzc30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0L3Rlc3RpbmcnO1xuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7UGFnaW5hdG9ySGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vcGFnaW5hdG9yLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbWF0LXBhZ2luYXRvciBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRQYWdpbmF0b3JIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBTZWxlY3RvciB1c2VkIHRvIGZpbmQgcGFnaW5hdG9yIGluc3RhbmNlcy4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1wYWdpbmF0b3InO1xuICBwcml2YXRlIF9uZXh0QnV0dG9uID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LW1kYy1wYWdpbmF0b3ItbmF2aWdhdGlvbi1uZXh0Jyk7XG4gIHByaXZhdGUgX3ByZXZpb3VzQnV0dG9uID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LW1kYy1wYWdpbmF0b3ItbmF2aWdhdGlvbi1wcmV2aW91cycpO1xuICBwcml2YXRlIF9maXJzdFBhZ2VCdXR0b24gPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1tZGMtcGFnaW5hdG9yLW5hdmlnYXRpb24tZmlyc3QnKTtcbiAgcHJpdmF0ZSBfbGFzdFBhZ2VCdXR0b24gPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1tZGMtcGFnaW5hdG9yLW5hdmlnYXRpb24tbGFzdCcpO1xuICBfc2VsZWN0ID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoXG4gICAgTWF0U2VsZWN0SGFybmVzcy53aXRoKHtcbiAgICAgIGFuY2VzdG9yOiAnLm1hdC1tZGMtcGFnaW5hdG9yLXBhZ2Utc2l6ZScsXG4gICAgfSksXG4gICk7XG4gIHByaXZhdGUgX3BhZ2VTaXplRmFsbGJhY2sgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtbWRjLXBhZ2luYXRvci1wYWdlLXNpemUtdmFsdWUnKTtcbiAgX3JhbmdlTGFiZWwgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtbWRjLXBhZ2luYXRvci1yYW5nZS1sYWJlbCcpO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHBhZ2luYXRvciB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBwYWdpbmF0b3IgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGg8VCBleHRlbmRzIE1hdFBhZ2luYXRvckhhcm5lc3M+KFxuICAgIHRoaXM6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgICBvcHRpb25zOiBQYWdpbmF0b3JIYXJuZXNzRmlsdGVycyA9IHt9LFxuICApOiBIYXJuZXNzUHJlZGljYXRlPFQ+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUodGhpcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogR29lcyB0byB0aGUgbmV4dCBwYWdlIGluIHRoZSBwYWdpbmF0b3IuICovXG4gIGFzeW5jIGdvVG9OZXh0UGFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX25leHRCdXR0b24oKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBuZXh0IHBhZ2UgYnV0dG9uIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc05leHRQYWdlRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGlzYWJsZWRWYWx1ZSA9IGF3YWl0IChhd2FpdCB0aGlzLl9uZXh0QnV0dG9uKCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gZGlzYWJsZWRWYWx1ZSA9PSAndHJ1ZSc7XG4gIH1cblxuICAvKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBwcmV2aW91cyBwYWdlIGJ1dHRvbiBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNQcmV2aW91c1BhZ2VEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkaXNhYmxlZFZhbHVlID0gYXdhaXQgKGF3YWl0IHRoaXMuX3ByZXZpb3VzQnV0dG9uKCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gZGlzYWJsZWRWYWx1ZSA9PSAndHJ1ZSc7XG4gIH1cblxuICAvKiogR29lcyB0byB0aGUgcHJldmlvdXMgcGFnZSBpbiB0aGUgcGFnaW5hdG9yLiAqL1xuICBhc3luYyBnb1RvUHJldmlvdXNQYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fcHJldmlvdXNCdXR0b24oKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBHb2VzIHRvIHRoZSBmaXJzdCBwYWdlIGluIHRoZSBwYWdpbmF0b3IuICovXG4gIGFzeW5jIGdvVG9GaXJzdFBhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYnV0dG9uID0gYXdhaXQgdGhpcy5fZmlyc3RQYWdlQnV0dG9uKCk7XG5cbiAgICAvLyBUaGUgZmlyc3QgcGFnZSBidXR0b24gaXNuJ3QgZW5hYmxlZCBieSBkZWZhdWx0IHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIGl0LlxuICAgIGlmICghYnV0dG9uKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ0NvdWxkIG5vdCBmaW5kIGZpcnN0IHBhZ2UgYnV0dG9uIGluc2lkZSBwYWdpbmF0b3IuICcgK1xuICAgICAgICAgICdNYWtlIHN1cmUgdGhhdCBgc2hvd0ZpcnN0TGFzdEJ1dHRvbnNgIGlzIGVuYWJsZWQuJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1dHRvbi5jbGljaygpO1xuICB9XG5cbiAgLyoqIEdvZXMgdG8gdGhlIGxhc3QgcGFnZSBpbiB0aGUgcGFnaW5hdG9yLiAqL1xuICBhc3luYyBnb1RvTGFzdFBhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYnV0dG9uID0gYXdhaXQgdGhpcy5fbGFzdFBhZ2VCdXR0b24oKTtcblxuICAgIC8vIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIGlzbid0IGVuYWJsZWQgYnkgZGVmYXVsdCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBpdC5cbiAgICBpZiAoIWJ1dHRvbikge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICdDb3VsZCBub3QgZmluZCBsYXN0IHBhZ2UgYnV0dG9uIGluc2lkZSBwYWdpbmF0b3IuICcgK1xuICAgICAgICAgICdNYWtlIHN1cmUgdGhhdCBgc2hvd0ZpcnN0TGFzdEJ1dHRvbnNgIGlzIGVuYWJsZWQuJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1dHRvbi5jbGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBhZ2Ugc2l6ZSBvZiB0aGUgcGFnaW5hdG9yLlxuICAgKiBAcGFyYW0gc2l6ZSBQYWdlIHNpemUgdGhhdCBzaG91bGQgYmUgc2VsZWN0LlxuICAgKi9cbiAgYXN5bmMgc2V0UGFnZVNpemUoc2l6ZTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VsZWN0ID0gYXdhaXQgdGhpcy5fc2VsZWN0KCk7XG5cbiAgICAvLyBUaGUgc2VsZWN0IGlzIG9ubHkgYXZhaWxhYmxlIGlmIHRoZSBgcGFnZVNpemVPcHRpb25zYCBhcmVcbiAgICAvLyBzZXQgdG8gYW4gYXJyYXkgd2l0aCBtb3JlIHRoYW4gb25lIGl0ZW0uXG4gICAgaWYgKCFzZWxlY3QpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnQ2Fubm90IGZpbmQgcGFnZSBzaXplIHNlbGVjdG9yIGluIHBhZ2luYXRvci4gJyArXG4gICAgICAgICAgJ01ha2Ugc3VyZSB0aGF0IHRoZSBgcGFnZVNpemVPcHRpb25zYCBoYXZlIGJlZW4gY29uZmlndXJlZC4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0LmNsaWNrT3B0aW9ucyh7dGV4dDogYCR7c2l6ZX1gfSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcGFnZSBzaXplIG9mIHRoZSBwYWdpbmF0b3IuICovXG4gIGFzeW5jIGdldFBhZ2VTaXplKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3Qgc2VsZWN0ID0gYXdhaXQgdGhpcy5fc2VsZWN0KCk7XG4gICAgY29uc3QgdmFsdWUgPSBzZWxlY3QgPyBzZWxlY3QuZ2V0VmFsdWVUZXh0KCkgOiAoYXdhaXQgdGhpcy5fcGFnZVNpemVGYWxsYmFjaygpKS50ZXh0KCk7XG4gICAgcmV0dXJuIGNvZXJjZU51bWJlclByb3BlcnR5KGF3YWl0IHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0ZXh0IG9mIHRoZSByYW5nZSBsYWJlbCBvZiB0aGUgcGFnaW5hdG9yLiAqL1xuICBhc3luYyBnZXRSYW5nZUxhYmVsKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9yYW5nZUxhYmVsKCkpLnRleHQoKTtcbiAgfVxufVxuIl19