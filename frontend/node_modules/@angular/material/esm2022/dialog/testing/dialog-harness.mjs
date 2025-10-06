/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate, TestKey, } from '@angular/cdk/testing';
/** Selectors for different sections of the mat-dialog that can contain user content. */
export var MatDialogSection;
(function (MatDialogSection) {
    MatDialogSection["TITLE"] = ".mat-mdc-dialog-title";
    MatDialogSection["CONTENT"] = ".mat-mdc-dialog-content";
    MatDialogSection["ACTIONS"] = ".mat-mdc-dialog-actions";
})(MatDialogSection || (MatDialogSection = {}));
/** Harness for interacting with a standard `MatDialog` in tests. */
export class MatDialogHarness
// @breaking-change 14.0.0 change generic type to MatDialogSection.
 extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._title = this.locatorForOptional(MatDialogSection.TITLE);
        this._content = this.locatorForOptional(MatDialogSection.CONTENT);
        this._actions = this.locatorForOptional(MatDialogSection.ACTIONS);
    }
    /** The selector for the host element of a `MatDialog` instance. */
    static { this.hostSelector = '.mat-mdc-dialog-container'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a dialog with specific attributes.
     * @param options Options for filtering which dialog instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options);
    }
    /** Gets the id of the dialog. */
    async getId() {
        const id = await (await this.host()).getAttribute('id');
        // In case no id has been specified, the "id" property always returns
        // an empty string. To make this method more explicit, we return null.
        return id !== '' ? id : null;
    }
    /** Gets the role of the dialog. */
    async getRole() {
        return (await this.host()).getAttribute('role');
    }
    /** Gets the value of the dialog's "aria-label" attribute. */
    async getAriaLabel() {
        return (await this.host()).getAttribute('aria-label');
    }
    /** Gets the value of the dialog's "aria-labelledby" attribute. */
    async getAriaLabelledby() {
        return (await this.host()).getAttribute('aria-labelledby');
    }
    /** Gets the value of the dialog's "aria-describedby" attribute. */
    async getAriaDescribedby() {
        return (await this.host()).getAttribute('aria-describedby');
    }
    /**
     * Closes the dialog by pressing escape.
     *
     * Note: this method does nothing if `disableClose` has been set to `true` for the dialog.
     */
    async close() {
        await (await this.host()).sendKeys(TestKey.ESCAPE);
    }
    /** Gets te dialog's text. */
    async getText() {
        return (await this.host()).text();
    }
    /** Gets the dialog's title text. This only works if the dialog is using mat-dialog-title. */
    async getTitleText() {
        return (await this._title())?.text() ?? '';
    }
    /** Gets the dialog's content text. This only works if the dialog is using mat-dialog-content. */
    async getContentText() {
        return (await this._content())?.text() ?? '';
    }
    /** Gets the dialog's actions text. This only works if the dialog is using mat-dialog-actions. */
    async getActionsText() {
        return (await this._actions())?.text() ?? '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGlhbG9nL3Rlc3RpbmcvZGlhbG9nLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLGdDQUFnQyxFQUNoQyxnQkFBZ0IsRUFDaEIsT0FBTyxHQUNSLE1BQU0sc0JBQXNCLENBQUM7QUFJOUIsd0ZBQXdGO0FBQ3hGLE1BQU0sQ0FBTixJQUFZLGdCQUlYO0FBSkQsV0FBWSxnQkFBZ0I7SUFDMUIsbURBQStCLENBQUE7SUFDL0IsdURBQW1DLENBQUE7SUFDbkMsdURBQW1DLENBQUE7QUFDckMsQ0FBQyxFQUpXLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFJM0I7QUFFRCxvRUFBb0U7QUFDcEUsTUFBTSxPQUFPLGdCQUFnQjtBQUMzQixtRUFBbUU7QUFDbkUsU0FBUSxnQ0FBMkQ7SUFGckU7O1FBbUJZLFdBQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekQsYUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxhQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBMER6RSxDQUFDO0lBM0VDLG1FQUFtRTthQUM1RCxpQkFBWSxHQUFHLDJCQUEyQixBQUE5QixDQUErQjtJQUVsRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FFVCxVQUFnQyxFQUFFO1FBRWxDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQU1ELGlDQUFpQztJQUNqQyxLQUFLLENBQUMsS0FBSztRQUNULE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxxRUFBcUU7UUFDckUsc0VBQXNFO1FBQ3RFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxLQUFLLENBQUMsT0FBTztRQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQStCLENBQUM7SUFDaEYsQ0FBQztJQUVELDZEQUE2RDtJQUM3RCxLQUFLLENBQUMsWUFBWTtRQUNoQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxtRUFBbUU7SUFDbkUsS0FBSyxDQUFDLGtCQUFrQjtRQUN0QixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxLQUFLO1FBQ1QsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsNkJBQTZCO0lBQzdCLEtBQUssQ0FBQyxPQUFPO1FBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELDZGQUE2RjtJQUM3RixLQUFLLENBQUMsWUFBWTtRQUNoQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDN0MsQ0FBQztJQUVELGlHQUFpRztJQUNqRyxLQUFLLENBQUMsY0FBYztRQUNsQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELGlHQUFpRztJQUNqRyxLQUFLLENBQUMsY0FBYztRQUNsQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDL0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBUZXN0S2V5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0RpYWxvZ0hhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2RpYWxvZy1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtEaWFsb2dSb2xlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuXG4vKiogU2VsZWN0b3JzIGZvciBkaWZmZXJlbnQgc2VjdGlvbnMgb2YgdGhlIG1hdC1kaWFsb2cgdGhhdCBjYW4gY29udGFpbiB1c2VyIGNvbnRlbnQuICovXG5leHBvcnQgZW51bSBNYXREaWFsb2dTZWN0aW9uIHtcbiAgVElUTEUgPSAnLm1hdC1tZGMtZGlhbG9nLXRpdGxlJyxcbiAgQ09OVEVOVCA9ICcubWF0LW1kYy1kaWFsb2ctY29udGVudCcsXG4gIEFDVElPTlMgPSAnLm1hdC1tZGMtZGlhbG9nLWFjdGlvbnMnLFxufVxuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIGBNYXREaWFsb2dgIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdERpYWxvZ0hhcm5lc3NcbiAgLy8gQGJyZWFraW5nLWNoYW5nZSAxNC4wLjAgY2hhbmdlIGdlbmVyaWMgdHlwZSB0byBNYXREaWFsb2dTZWN0aW9uLlxuICBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPE1hdERpYWxvZ1NlY3Rpb24gfCBzdHJpbmc+XG57XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0RGlhbG9nYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1kaWFsb2ctY29udGFpbmVyJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBkaWFsb2cgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggZGlhbG9nIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoPFQgZXh0ZW5kcyBNYXREaWFsb2dIYXJuZXNzPihcbiAgICB0aGlzOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sXG4gICAgb3B0aW9uczogRGlhbG9nSGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIF90aXRsZSA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKE1hdERpYWxvZ1NlY3Rpb24uVElUTEUpO1xuICBwcm90ZWN0ZWQgX2NvbnRlbnQgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXREaWFsb2dTZWN0aW9uLkNPTlRFTlQpO1xuICBwcm90ZWN0ZWQgX2FjdGlvbnMgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXREaWFsb2dTZWN0aW9uLkFDVElPTlMpO1xuXG4gIC8qKiBHZXRzIHRoZSBpZCBvZiB0aGUgZGlhbG9nLiAqL1xuICBhc3luYyBnZXRJZCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCBpZCA9IGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgIC8vIEluIGNhc2Ugbm8gaWQgaGFzIGJlZW4gc3BlY2lmaWVkLCB0aGUgXCJpZFwiIHByb3BlcnR5IGFsd2F5cyByZXR1cm5zXG4gICAgLy8gYW4gZW1wdHkgc3RyaW5nLiBUbyBtYWtlIHRoaXMgbWV0aG9kIG1vcmUgZXhwbGljaXQsIHdlIHJldHVybiBudWxsLlxuICAgIHJldHVybiBpZCAhPT0gJycgPyBpZCA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcm9sZSBvZiB0aGUgZGlhbG9nLiAqL1xuICBhc3luYyBnZXRSb2xlKCk6IFByb21pc2U8RGlhbG9nUm9sZSB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSBhcyBQcm9taXNlPERpYWxvZ1JvbGUgfCBudWxsPjtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgZGlhbG9nJ3MgXCJhcmlhLWxhYmVsXCIgYXR0cmlidXRlLiAqL1xuICBhc3luYyBnZXRBcmlhTGFiZWwoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgb2YgdGhlIGRpYWxvZydzIFwiYXJpYS1sYWJlbGxlZGJ5XCIgYXR0cmlidXRlLiAqL1xuICBhc3luYyBnZXRBcmlhTGFiZWxsZWRieSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSBkaWFsb2cncyBcImFyaWEtZGVzY3JpYmVkYnlcIiBhdHRyaWJ1dGUuICovXG4gIGFzeW5jIGdldEFyaWFEZXNjcmliZWRieSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIGRpYWxvZyBieSBwcmVzc2luZyBlc2NhcGUuXG4gICAqXG4gICAqIE5vdGU6IHRoaXMgbWV0aG9kIGRvZXMgbm90aGluZyBpZiBgZGlzYWJsZUNsb3NlYCBoYXMgYmVlbiBzZXQgdG8gYHRydWVgIGZvciB0aGUgZGlhbG9nLlxuICAgKi9cbiAgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5zZW5kS2V5cyhUZXN0S2V5LkVTQ0FQRSk7XG4gIH1cblxuICAvKiogR2V0cyB0ZSBkaWFsb2cncyB0ZXh0LiAqL1xuICBhc3luYyBnZXRUZXh0KCkge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkaWFsb2cncyB0aXRsZSB0ZXh0LiBUaGlzIG9ubHkgd29ya3MgaWYgdGhlIGRpYWxvZyBpcyB1c2luZyBtYXQtZGlhbG9nLXRpdGxlLiAqL1xuICBhc3luYyBnZXRUaXRsZVRleHQoKSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl90aXRsZSgpKT8udGV4dCgpID8/ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRpYWxvZydzIGNvbnRlbnQgdGV4dC4gVGhpcyBvbmx5IHdvcmtzIGlmIHRoZSBkaWFsb2cgaXMgdXNpbmcgbWF0LWRpYWxvZy1jb250ZW50LiAqL1xuICBhc3luYyBnZXRDb250ZW50VGV4dCgpIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2NvbnRlbnQoKSk/LnRleHQoKSA/PyAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkaWFsb2cncyBhY3Rpb25zIHRleHQuIFRoaXMgb25seSB3b3JrcyBpZiB0aGUgZGlhbG9nIGlzIHVzaW5nIG1hdC1kaWFsb2ctYWN0aW9ucy4gKi9cbiAgYXN5bmMgZ2V0QWN0aW9uc1RleHQoKSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9hY3Rpb25zKCkpPy50ZXh0KCkgPz8gJyc7XG4gIH1cbn1cbiJdfQ==