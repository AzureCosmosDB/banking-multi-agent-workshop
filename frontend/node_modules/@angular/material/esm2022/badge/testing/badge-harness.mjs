/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a standard Material badge in tests. */
export class MatBadgeHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._badgeElement = this.locatorFor('.mat-badge-content');
    }
    static { this.hostSelector = '.mat-badge'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a badge with specific attributes.
     * @param options Options for narrowing the search:
     *   - `text` finds a badge host with a particular text.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatBadgeHarness, options).addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
    }
    /** Gets a promise for the badge text. */
    async getText() {
        return (await this._badgeElement()).text();
    }
    /** Gets whether the badge is overlapping the content. */
    async isOverlapping() {
        return (await this.host()).hasClass('mat-badge-overlap');
    }
    /** Gets the position of the badge. */
    async getPosition() {
        const host = await this.host();
        let result = '';
        if (await host.hasClass('mat-badge-above')) {
            result += 'above';
        }
        else if (await host.hasClass('mat-badge-below')) {
            result += 'below';
        }
        if (await host.hasClass('mat-badge-before')) {
            result += ' before';
        }
        else if (await host.hasClass('mat-badge-after')) {
            result += ' after';
        }
        return result.trim();
    }
    /** Gets the size of the badge. */
    async getSize() {
        const host = await this.host();
        if (await host.hasClass('mat-badge-small')) {
            return 'small';
        }
        else if (await host.hasClass('mat-badge-large')) {
            return 'large';
        }
        return 'medium';
    }
    /** Gets whether the badge is hidden. */
    async isHidden() {
        return (await this.host()).hasClass('mat-badge-hidden');
    }
    /** Gets whether the badge is disabled. */
    async isDisabled() {
        return (await this.host()).hasClass('mat-badge-disabled');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9iYWRnZS90ZXN0aW5nL2JhZGdlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFJeEUsdUVBQXVFO0FBQ3ZFLE1BQU0sT0FBTyxlQUFnQixTQUFRLGdCQUFnQjtJQUFyRDs7UUFpQlUsa0JBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFzRGhFLENBQUM7YUF0RVEsaUJBQVksR0FBRyxZQUFZLEFBQWYsQ0FBZ0I7SUFFbkM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQStCLEVBQUU7UUFDM0MsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQzdELE1BQU0sRUFDTixPQUFPLENBQUMsSUFBSSxFQUNaLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FDM0UsQ0FBQztJQUNKLENBQUM7SUFJRCx5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLE9BQU87UUFDWCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQseURBQXlEO0lBQ3pELEtBQUssQ0FBQyxhQUFhO1FBQ2pCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsS0FBSyxDQUFDLFdBQVc7UUFDZixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFaEIsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQzNDLE1BQU0sSUFBSSxPQUFPLENBQUM7UUFDcEIsQ0FBQzthQUFNLElBQUksTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztZQUNsRCxNQUFNLElBQUksT0FBTyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7WUFDNUMsTUFBTSxJQUFJLFNBQVMsQ0FBQztRQUN0QixDQUFDO2FBQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQ2xELE1BQU0sSUFBSSxRQUFRLENBQUM7UUFDckIsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDLElBQUksRUFBc0IsQ0FBQztJQUMzQyxDQUFDO0lBRUQsa0NBQWtDO0lBQ2xDLEtBQUssQ0FBQyxPQUFPO1FBQ1gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFL0IsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQzNDLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7YUFBTSxJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7WUFDbEQsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsS0FBSyxDQUFDLFFBQVE7UUFDWixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsMENBQTBDO0lBQzFDLEtBQUssQ0FBQyxVQUFVO1FBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDNUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0QmFkZ2VQb3NpdGlvbiwgTWF0QmFkZ2VTaXplfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9iYWRnZSc7XG5pbXBvcnQge0JhZGdlSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vYmFkZ2UtaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBNYXRlcmlhbCBiYWRnZSBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRCYWRnZUhhcm5lc3MgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWJhZGdlJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBiYWRnZSB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoOlxuICAgKiAgIC0gYHRleHRgIGZpbmRzIGEgYmFkZ2UgaG9zdCB3aXRoIGEgcGFydGljdWxhciB0ZXh0LlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IEJhZGdlSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0QmFkZ2VIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdEJhZGdlSGFybmVzcywgb3B0aW9ucykuYWRkT3B0aW9uKFxuICAgICAgJ3RleHQnLFxuICAgICAgb3B0aW9ucy50ZXh0LFxuICAgICAgKGhhcm5lc3MsIHRleHQpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2JhZGdlRWxlbWVudCA9IHRoaXMubG9jYXRvckZvcignLm1hdC1iYWRnZS1jb250ZW50Jyk7XG5cbiAgLyoqIEdldHMgYSBwcm9taXNlIGZvciB0aGUgYmFkZ2UgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fYmFkZ2VFbGVtZW50KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGJhZGdlIGlzIG92ZXJsYXBwaW5nIHRoZSBjb250ZW50LiAqL1xuICBhc3luYyBpc092ZXJsYXBwaW5nKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtYmFkZ2Utb3ZlcmxhcCcpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBiYWRnZS4gKi9cbiAgYXN5bmMgZ2V0UG9zaXRpb24oKTogUHJvbWlzZTxNYXRCYWRnZVBvc2l0aW9uPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtYmFkZ2UtYWJvdmUnKSkge1xuICAgICAgcmVzdWx0ICs9ICdhYm92ZSc7XG4gICAgfSBlbHNlIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtYmFkZ2UtYmVsb3cnKSkge1xuICAgICAgcmVzdWx0ICs9ICdiZWxvdyc7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IGhvc3QuaGFzQ2xhc3MoJ21hdC1iYWRnZS1iZWZvcmUnKSkge1xuICAgICAgcmVzdWx0ICs9ICcgYmVmb3JlJztcbiAgICB9IGVsc2UgaWYgKGF3YWl0IGhvc3QuaGFzQ2xhc3MoJ21hdC1iYWRnZS1hZnRlcicpKSB7XG4gICAgICByZXN1bHQgKz0gJyBhZnRlcic7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC50cmltKCkgYXMgTWF0QmFkZ2VQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzaXplIG9mIHRoZSBiYWRnZS4gKi9cbiAgYXN5bmMgZ2V0U2l6ZSgpOiBQcm9taXNlPE1hdEJhZGdlU2l6ZT4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcblxuICAgIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtYmFkZ2Utc21hbGwnKSkge1xuICAgICAgcmV0dXJuICdzbWFsbCc7XG4gICAgfSBlbHNlIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtYmFkZ2UtbGFyZ2UnKSkge1xuICAgICAgcmV0dXJuICdsYXJnZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuICdtZWRpdW0nO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgYmFkZ2UgaXMgaGlkZGVuLiAqL1xuICBhc3luYyBpc0hpZGRlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWJhZGdlLWhpZGRlbicpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgYmFkZ2UgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1iYWRnZS1kaXNhYmxlZCcpO1xuICB9XG59XG4iXX0=