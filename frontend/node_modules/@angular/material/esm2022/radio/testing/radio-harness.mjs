/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
/** Harness for interacting with a mat-radio-group in tests. */
export class MatRadioGroupHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._buttonClass = MatRadioButtonHarness;
    }
    /** The selector for the host element of a `MatRadioGroup` instance. */
    static { this.hostSelector = '.mat-mdc-radio-group'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a radio group with specific
     * attributes.
     * @param options Options for filtering which radio group instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options).addOption('name', options.name, MatRadioGroupHarness._checkRadioGroupName);
    }
    /** Gets the name of the radio-group. */
    async getName() {
        const hostName = await this._getGroupNameFromHost();
        // It's not possible to always determine the "name" of a radio-group by reading
        // the attribute. This is because the radio-group does not set the "name" as an
        // element attribute if the "name" value is set through a binding.
        if (hostName !== null) {
            return hostName;
        }
        // In case we couldn't determine the "name" of a radio-group by reading the
        // "name" attribute, we try to determine the "name" of the group by going
        // through all radio buttons.
        const radioNames = await this._getNamesFromRadioButtons();
        if (!radioNames.length) {
            return null;
        }
        if (!this._checkRadioNamesInGroupEqual(radioNames)) {
            throw Error('Radio buttons in radio-group have mismatching names.');
        }
        return radioNames[0];
    }
    /** Gets the id of the radio-group. */
    async getId() {
        return (await this.host()).getProperty('id');
    }
    /** Gets the checked radio-button in a radio-group. */
    async getCheckedRadioButton() {
        for (let radioButton of await this.getRadioButtons()) {
            if (await radioButton.isChecked()) {
                return radioButton;
            }
        }
        return null;
    }
    /** Gets the checked value of the radio-group. */
    async getCheckedValue() {
        const checkedRadio = await this.getCheckedRadioButton();
        if (!checkedRadio) {
            return null;
        }
        return checkedRadio.getValue();
    }
    /**
     * Gets a list of radio buttons which are part of the radio-group.
     * @param filter Optionally filters which radio buttons are included.
     */
    async getRadioButtons(filter) {
        return this.locatorForAll(this._buttonClass.with(filter))();
    }
    /**
     * Checks a radio button in this group.
     * @param filter An optional filter to apply to the child radio buttons. The first tab matching
     *     the filter will be selected.
     */
    async checkRadioButton(filter) {
        const radioButtons = await this.getRadioButtons(filter);
        if (!radioButtons.length) {
            throw Error(`Could not find radio button matching ${JSON.stringify(filter)}`);
        }
        return radioButtons[0].check();
    }
    /** Gets the name attribute of the host element. */
    async _getGroupNameFromHost() {
        return (await this.host()).getAttribute('name');
    }
    /** Gets a list of the name attributes of all child radio buttons. */
    async _getNamesFromRadioButtons() {
        const groupNames = [];
        for (let radio of await this.getRadioButtons()) {
            const radioName = await radio.getName();
            if (radioName !== null) {
                groupNames.push(radioName);
            }
        }
        return groupNames;
    }
    /** Checks if the specified radio names are all equal. */
    _checkRadioNamesInGroupEqual(radioNames) {
        let groupName = null;
        for (let radioName of radioNames) {
            if (groupName === null) {
                groupName = radioName;
            }
            else if (groupName !== radioName) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks if a radio-group harness has the given name. Throws if a radio-group with
     * matching name could be found but has mismatching radio-button names.
     */
    static async _checkRadioGroupName(harness, name) {
        // Check if there is a radio-group which has the "name" attribute set
        // to the expected group name. It's not possible to always determine
        // the "name" of a radio-group by reading the attribute. This is because
        // the radio-group does not set the "name" as an element attribute if the
        // "name" value is set through a binding.
        if ((await harness._getGroupNameFromHost()) === name) {
            return true;
        }
        // Check if there is a group with radio-buttons that all have the same
        // expected name. This implies that the group has the given name. It's
        // not possible to always determine the name of a radio-group through
        // the attribute because there is
        const radioNames = await harness._getNamesFromRadioButtons();
        if (radioNames.indexOf(name) === -1) {
            return false;
        }
        if (!harness._checkRadioNamesInGroupEqual(radioNames)) {
            throw Error(`The locator found a radio-group with name "${name}", but some ` +
                `radio-button's within the group have mismatching names, which is invalid.`);
        }
        return true;
    }
}
/** Harness for interacting with a mat-radio-button in tests. */
export class MatRadioButtonHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._textLabel = this.locatorFor('label');
        this._clickLabel = this._textLabel;
        this._input = this.locatorFor('input');
    }
    /** The selector for the host element of a `MatRadioButton` instance. */
    static { this.hostSelector = '.mat-mdc-radio-button'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a radio button with specific
     * attributes.
     * @param options Options for filtering which radio button instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
            .addOption('name', options.name, async (harness, name) => (await harness.getName()) === name)
            .addOption('checked', options.checked, async (harness, checked) => (await harness.isChecked()) == checked);
    }
    /** Whether the radio-button is checked. */
    async isChecked() {
        const checked = (await this._input()).getProperty('checked');
        return coerceBooleanProperty(await checked);
    }
    /** Whether the radio-button is disabled. */
    async isDisabled() {
        const input = await this._input();
        const disabled = await input.getAttribute('disabled');
        if (disabled !== null) {
            return coerceBooleanProperty(disabled);
        }
        return (await input.getAttribute('aria-disabled')) === 'true';
    }
    /** Whether the radio-button is required. */
    async isRequired() {
        const required = (await this._input()).getAttribute('required');
        return coerceBooleanProperty(await required);
    }
    /** Gets the radio-button's name. */
    async getName() {
        return (await this._input()).getAttribute('name');
    }
    /** Gets the radio-button's id. */
    async getId() {
        return (await this.host()).getProperty('id');
    }
    /**
     * Gets the value of the radio-button. The radio-button value will be converted to a string.
     *
     * Note: This means that for radio-button's with an object as a value `[object Object]` is
     * intentionally returned.
     */
    async getValue() {
        return (await this._input()).getProperty('value');
    }
    /** Gets the radio-button's label text. */
    async getLabelText() {
        return (await this._textLabel()).text();
    }
    /** Focuses the radio-button. */
    async focus() {
        return (await this._input()).focus();
    }
    /** Blurs the radio-button. */
    async blur() {
        return (await this._input()).blur();
    }
    /** Whether the radio-button is focused. */
    async isFocused() {
        return (await this._input()).isFocused();
    }
    /**
     * Puts the radio-button in a checked state by clicking it if it is currently unchecked,
     * or doing nothing if it is already checked.
     */
    async check() {
        if (!(await this.isChecked())) {
            return (await this._clickLabel()).click();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW8taGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9yYWRpby90ZXN0aW5nL3JhZGlvLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsR0FDakIsTUFBTSxzQkFBc0IsQ0FBQztBQUc5QiwrREFBK0Q7QUFDL0QsTUFBTSxPQUFPLG9CQUFxQixTQUFRLGdCQUFnQjtJQUExRDs7UUFJVSxpQkFBWSxHQUFHLHFCQUFxQixDQUFDO0lBaUovQyxDQUFDO0lBcEpDLHVFQUF1RTthQUNoRSxpQkFBWSxHQUFHLHNCQUFzQixBQUF6QixDQUEwQjtJQUk3Qzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBRVQsVUFBb0MsRUFBRTtRQUV0QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FDbEQsTUFBTSxFQUNOLE9BQU8sQ0FBQyxJQUFJLEVBQ1osb0JBQW9CLENBQUMsb0JBQW9CLENBQzFDLENBQUM7SUFDSixDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLEtBQUssQ0FBQyxPQUFPO1FBQ1gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNwRCwrRUFBK0U7UUFDL0UsK0VBQStFO1FBQy9FLGtFQUFrRTtRQUNsRSxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN0QixPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDO1FBQ0QsMkVBQTJFO1FBQzNFLHlFQUF5RTtRQUN6RSw2QkFBNkI7UUFDN0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENB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O0lBRUQsOEJBQThCO0lBQzlCLEtBQUssQ0FBQyxJQUFJO1FBQ1IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxLQUFLLENBQUMsU0FBUztRQUNiLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsS0FBSztRQUNULElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM5QixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7XG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcixcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtSYWRpb0J1dHRvbkhhcm5lc3NGaWx0ZXJzLCBSYWRpb0dyb3VwSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vcmFkaW8taGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBtYXQtcmFkaW8tZ3JvdXAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0UmFkaW9Hcm91cEhhcm5lc3MgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRSYWRpb0dyb3VwYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1yYWRpby1ncm91cCc7XG5cbiAgcHJpdmF0ZSBfYnV0dG9uQ2xhc3MgPSBNYXRSYWRpb0J1dHRvbkhhcm5lc3M7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgcmFkaW8gZ3JvdXAgd2l0aCBzcGVjaWZpY1xuICAgKiBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggcmFkaW8gZ3JvdXAgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGg8VCBleHRlbmRzIE1hdFJhZGlvR3JvdXBIYXJuZXNzPihcbiAgICB0aGlzOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sXG4gICAgb3B0aW9uczogUmFkaW9Hcm91cEhhcm5lc3NGaWx0ZXJzID0ge30sXG4gICk6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZSh0aGlzLCBvcHRpb25zKS5hZGRPcHRpb24oXG4gICAgICAnbmFtZScsXG4gICAgICBvcHRpb25zLm5hbWUsXG4gICAgICBNYXRSYWRpb0dyb3VwSGFybmVzcy5fY2hlY2tSYWRpb0dyb3VwTmFtZSxcbiAgICApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5hbWUgb2YgdGhlIHJhZGlvLWdyb3VwLiAqL1xuICBhc3luYyBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIGNvbnN0IGhvc3ROYW1lID0gYXdhaXQgdGhpcy5fZ2V0R3JvdXBOYW1lRnJvbUhvc3QoKTtcbiAgICAvLyBJdCdzIG5vdCBwb3NzaWJsZSB0byBhbHdheXMgZGV0ZXJtaW5lIHRoZSBcIm5hbWVcIiBvZiBhIHJhZGlvLWdyb3VwIGJ5IHJlYWRpbmdcbiAgICAvLyB0aGUgYXR0cmlidXRlLiBUaGlzIGlzIGJlY2F1c2UgdGhlIHJhZGlvLWdyb3VwIGRvZXMgbm90IHNldCB0aGUgXCJuYW1lXCIgYXMgYW5cbiAgICAvLyBlbGVtZW50IGF0dHJpYnV0ZSBpZiB0aGUgXCJuYW1lXCIgdmFsdWUgaXMgc2V0IHRocm91Z2ggYSBiaW5kaW5nLlxuICAgIGlmIChob3N0TmFtZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGhvc3ROYW1lO1xuICAgIH1cbiAgICAvLyBJbiBjYXNlIHdlIGNvdWxkbid0IGRldGVybWluZSB0aGUgXCJuYW1lXCIgb2YgYSByYWRpby1ncm91cCBieSByZWFkaW5nIHRoZVxuICAgIC8vIFwibmFtZVwiIGF0dHJpYnV0ZSwgd2UgdHJ5IHRvIGRldGVybWluZSB0aGUgXCJuYW1lXCIgb2YgdGhlIGdyb3VwIGJ5IGdvaW5nXG4gICAgLy8gdGhyb3VnaCBhbGwgcmFkaW8gYnV0dG9ucy5cbiAgICBjb25zdCByYWRpb05hbWVzID0gYXdhaXQgdGhpcy5fZ2V0TmFtZXNGcm9tUmFkaW9CdXR0b25zKCk7XG4gICAgaWYgKCFyYWRpb05hbWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghdGhpcy5fY2hlY2tSYWRpb05hbWVzSW5Hcm91cEVxdWFsKHJhZGlvTmFtZXMpKSB7XG4gICAgICB0aHJvdyBFcnJvcignUmFkaW8gYnV0dG9ucyBpbiByYWRpby1ncm91cCBoYXZlIG1pc21hdGNoaW5nIG5hbWVzLicpO1xuICAgIH1cbiAgICByZXR1cm4gcmFkaW9OYW1lc1swXSE7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgaWQgb2YgdGhlIHJhZGlvLWdyb3VwLiAqL1xuICBhc3luYyBnZXRJZCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eTxzdHJpbmcgfCBudWxsPignaWQnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjaGVja2VkIHJhZGlvLWJ1dHRvbiBpbiBhIHJhZGlvLWdyb3VwLiAqL1xuICBhc3luYyBnZXRDaGVja2VkUmFkaW9CdXR0b24oKTogUHJvbWlzZTxNYXRSYWRpb0J1dHRvbkhhcm5lc3MgfCBudWxsPiB7XG4gICAgZm9yIChsZXQgcmFkaW9CdXR0b24gb2YgYXdhaXQgdGhpcy5nZXRSYWRpb0J1dHRvbnMoKSkge1xuICAgICAgaWYgKGF3YWl0IHJhZGlvQnV0dG9uLmlzQ2hlY2tlZCgpKSB7XG4gICAgICAgIHJldHVybiByYWRpb0J1dHRvbjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tlZCB2YWx1ZSBvZiB0aGUgcmFkaW8tZ3JvdXAuICovXG4gIGFzeW5jIGdldENoZWNrZWRWYWx1ZSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCBjaGVja2VkUmFkaW8gPSBhd2FpdCB0aGlzLmdldENoZWNrZWRSYWRpb0J1dHRvbigpO1xuICAgIGlmICghY2hlY2tlZFJhZGlvKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrZWRSYWRpby5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIHJhZGlvIGJ1dHRvbnMgd2hpY2ggYXJlIHBhcnQgb2YgdGhlIHJhZGlvLWdyb3VwLlxuICAgKiBAcGFyYW0gZmlsdGVyIE9wdGlvbmFsbHkgZmlsdGVycyB3aGljaCByYWRpbyBidXR0b25zIGFyZSBpbmNsdWRlZC5cbiAgICovXG4gIGFzeW5jIGdldFJhZGlvQnV0dG9ucyhmaWx0ZXI/OiBSYWRpb0J1dHRvbkhhcm5lc3NGaWx0ZXJzKTogUHJvbWlzZTxNYXRSYWRpb0J1dHRvbkhhcm5lc3NbXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwodGhpcy5fYnV0dG9uQ2xhc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhIHJhZGlvIGJ1dHRvbiBpbiB0aGlzIGdyb3VwLlxuICAgKiBAcGFyYW0gZmlsdGVyIEFuIG9wdGlvbmFsIGZpbHRlciB0byBhcHBseSB0byB0aGUgY2hpbGQgcmFkaW8gYnV0dG9ucy4gVGhlIGZpcnN0IHRhYiBtYXRjaGluZ1xuICAgKiAgICAgdGhlIGZpbHRlciB3aWxsIGJlIHNlbGVjdGVkLlxuICAgKi9cbiAgYXN5bmMgY2hlY2tSYWRpb0J1dHRvbihmaWx0ZXI/OiBSYWRpb0J1dHRvbkhhcm5lc3NGaWx0ZXJzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmFkaW9CdXR0b25zID0gYXdhaXQgdGhpcy5nZXRSYWRpb0J1dHRvbnMoZmlsdGVyKTtcbiAgICBpZiAoIXJhZGlvQnV0dG9ucy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKGBDb3VsZCBub3QgZmluZCByYWRpbyBidXR0b24gbWF0Y2hpbmcgJHtKU09OLnN0cmluZ2lmeShmaWx0ZXIpfWApO1xuICAgIH1cbiAgICByZXR1cm4gcmFkaW9CdXR0b25zWzBdLmNoZWNrKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmFtZSBhdHRyaWJ1dGUgb2YgdGhlIGhvc3QgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0R3JvdXBOYW1lRnJvbUhvc3QoKSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gIH1cblxuICAvKiogR2V0cyBhIGxpc3Qgb2YgdGhlIG5hbWUgYXR0cmlidXRlcyBvZiBhbGwgY2hpbGQgcmFkaW8gYnV0dG9ucy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0TmFtZXNGcm9tUmFkaW9CdXR0b25zKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBncm91cE5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IHJhZGlvIG9mIGF3YWl0IHRoaXMuZ2V0UmFkaW9CdXR0b25zKCkpIHtcbiAgICAgIGNvbnN0IHJhZGlvTmFtZSA9IGF3YWl0IHJhZGlvLmdldE5hbWUoKTtcbiAgICAgIGlmIChyYWRpb05hbWUgIT09IG51bGwpIHtcbiAgICAgICAgZ3JvdXBOYW1lcy5wdXNoKHJhZGlvTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBncm91cE5hbWVzO1xuICB9XG5cbiAgLyoqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIHJhZGlvIG5hbWVzIGFyZSBhbGwgZXF1YWwuICovXG4gIHByaXZhdGUgX2NoZWNrUmFkaW9OYW1lc0luR3JvdXBFcXVhbChyYWRpb05hbWVzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICAgIGxldCBncm91cE5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGZvciAobGV0IHJhZGlvTmFtZSBvZiByYWRpb05hbWVzKSB7XG4gICAgICBpZiAoZ3JvdXBOYW1lID09PSBudWxsKSB7XG4gICAgICAgIGdyb3VwTmFtZSA9IHJhZGlvTmFtZTtcbiAgICAgIH0gZWxzZSBpZiAoZ3JvdXBOYW1lICE9PSByYWRpb05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSByYWRpby1ncm91cCBoYXJuZXNzIGhhcyB0aGUgZ2l2ZW4gbmFtZS4gVGhyb3dzIGlmIGEgcmFkaW8tZ3JvdXAgd2l0aFxuICAgKiBtYXRjaGluZyBuYW1lIGNvdWxkIGJlIGZvdW5kIGJ1dCBoYXMgbWlzbWF0Y2hpbmcgcmFkaW8tYnV0dG9uIG5hbWVzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHN0YXRpYyBhc3luYyBfY2hlY2tSYWRpb0dyb3VwTmFtZShoYXJuZXNzOiBNYXRSYWRpb0dyb3VwSGFybmVzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSByYWRpby1ncm91cCB3aGljaCBoYXMgdGhlIFwibmFtZVwiIGF0dHJpYnV0ZSBzZXRcbiAgICAvLyB0byB0aGUgZXhwZWN0ZWQgZ3JvdXAgbmFtZS4gSXQncyBub3QgcG9zc2libGUgdG8gYWx3YXlzIGRldGVybWluZVxuICAgIC8vIHRoZSBcIm5hbWVcIiBvZiBhIHJhZGlvLWdyb3VwIGJ5IHJlYWRpbmcgdGhlIGF0dHJpYnV0ZS4gVGhpcyBpcyBiZWNhdXNlXG4gICAgLy8gdGhlIHJhZGlvLWdyb3VwIGRvZXMgbm90IHNldCB0aGUgXCJuYW1lXCIgYXMgYW4gZWxlbWVudCBhdHRyaWJ1dGUgaWYgdGhlXG4gICAgLy8gXCJuYW1lXCIgdmFsdWUgaXMgc2V0IHRocm91Z2ggYSBiaW5kaW5nLlxuICAgIGlmICgoYXdhaXQgaGFybmVzcy5fZ2V0R3JvdXBOYW1lRnJvbUhvc3QoKSkgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIGdyb3VwIHdpdGggcmFkaW8tYnV0dG9ucyB0aGF0IGFsbCBoYXZlIHRoZSBzYW1lXG4gICAgLy8gZXhwZWN0ZWQgbmFtZS4gVGhpcyBpbXBsaWVzIHRoYXQgdGhlIGdyb3VwIGhhcyB0aGUgZ2l2ZW4gbmFtZS4gSXQnc1xuICAgIC8vIG5vdCBwb3NzaWJsZSB0byBhbHdheXMgZGV0ZXJtaW5lIHRoZSBuYW1lIG9mIGEgcmFkaW8tZ3JvdXAgdGhyb3VnaFxuICAgIC8vIHRoZSBhdHRyaWJ1dGUgYmVjYXVzZSB0aGVyZSBpc1xuICAgIGNvbnN0IHJhZGlvTmFtZXMgPSBhd2FpdCBoYXJuZXNzLl9nZXROYW1lc0Zyb21SYWRpb0J1dHRvbnMoKTtcbiAgICBpZiAocmFkaW9OYW1lcy5pbmRleE9mKG5hbWUpID09PSAtMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIWhhcm5lc3MuX2NoZWNrUmFkaW9OYW1lc0luR3JvdXBFcXVhbChyYWRpb05hbWVzKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBUaGUgbG9jYXRvciBmb3VuZCBhIHJhZGlvLWdyb3VwIHdpdGggbmFtZSBcIiR7bmFtZX1cIiwgYnV0IHNvbWUgYCArXG4gICAgICAgICAgYHJhZGlvLWJ1dHRvbidzIHdpdGhpbiB0aGUgZ3JvdXAgaGF2ZSBtaXNtYXRjaGluZyBuYW1lcywgd2hpY2ggaXMgaW52YWxpZC5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBtYXQtcmFkaW8tYnV0dG9uIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFJhZGlvQnV0dG9uSGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFJhZGlvQnV0dG9uYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1yYWRpby1idXR0b24nO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHJhZGlvIGJ1dHRvbiB3aXRoIHNwZWNpZmljXG4gICAqIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCByYWRpbyBidXR0b24gaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGg8VCBleHRlbmRzIE1hdFJhZGlvQnV0dG9uSGFybmVzcz4oXG4gICAgdGhpczogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IFJhZGlvQnV0dG9uSGFybmVzc0ZpbHRlcnMgPSB7fSxcbiAgKTogSGFybmVzc1ByZWRpY2F0ZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpXG4gICAgICAuYWRkT3B0aW9uKCdsYWJlbCcsIG9wdGlvbnMubGFiZWwsIChoYXJuZXNzLCBsYWJlbCkgPT5cbiAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0TGFiZWxUZXh0KCksIGxhYmVsKSxcbiAgICAgIClcbiAgICAgIC5hZGRPcHRpb24oJ25hbWUnLCBvcHRpb25zLm5hbWUsIGFzeW5jIChoYXJuZXNzLCBuYW1lKSA9PiAoYXdhaXQgaGFybmVzcy5nZXROYW1lKCkpID09PSBuYW1lKVxuICAgICAgLmFkZE9wdGlvbihcbiAgICAgICAgJ2NoZWNrZWQnLFxuICAgICAgICBvcHRpb25zLmNoZWNrZWQsXG4gICAgICAgIGFzeW5jIChoYXJuZXNzLCBjaGVja2VkKSA9PiAoYXdhaXQgaGFybmVzcy5pc0NoZWNrZWQoKSkgPT0gY2hlY2tlZCxcbiAgICAgICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3RleHRMYWJlbCA9IHRoaXMubG9jYXRvckZvcignbGFiZWwnKTtcbiAgcHJvdGVjdGVkIF9jbGlja0xhYmVsID0gdGhpcy5fdGV4dExhYmVsO1xuICBwcml2YXRlIF9pbnB1dCA9IHRoaXMubG9jYXRvckZvcignaW5wdXQnKTtcblxuICAvKiogV2hldGhlciB0aGUgcmFkaW8tYnV0dG9uIGlzIGNoZWNrZWQuICovXG4gIGFzeW5jIGlzQ2hlY2tlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBjaGVja2VkID0gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldFByb3BlcnR5PGJvb2xlYW4+KCdjaGVja2VkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCBjaGVja2VkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSByYWRpby1idXR0b24gaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaW5wdXQgPSBhd2FpdCB0aGlzLl9pbnB1dCgpO1xuICAgIGNvbnN0IGRpc2FibGVkID0gYXdhaXQgaW5wdXQuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gICAgaWYgKGRpc2FibGVkICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGRpc2FibGVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKGF3YWl0IGlucHV0LmdldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcpKSA9PT0gJ3RydWUnO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHJhZGlvLWJ1dHRvbiBpcyByZXF1aXJlZC4gKi9cbiAgYXN5bmMgaXNSZXF1aXJlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXF1aXJlZCA9IChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ3JlcXVpcmVkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCByZXF1aXJlZCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcmFkaW8tYnV0dG9uJ3MgbmFtZS4gKi9cbiAgYXN5bmMgZ2V0TmFtZSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJhZGlvLWJ1dHRvbidzIGlkLiAqL1xuICBhc3luYyBnZXRJZCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eTxzdHJpbmc+KCdpZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSByYWRpby1idXR0b24uIFRoZSByYWRpby1idXR0b24gdmFsdWUgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcuXG4gICAqXG4gICAqIE5vdGU6IFRoaXMgbWVhbnMgdGhhdCBmb3IgcmFkaW8tYnV0dG9uJ3Mgd2l0aCBhbiBvYmplY3QgYXMgYSB2YWx1ZSBgW29iamVjdCBPYmplY3RdYCBpc1xuICAgKiBpbnRlbnRpb25hbGx5IHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0VmFsdWUoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRQcm9wZXJ0eSgndmFsdWUnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByYWRpby1idXR0b24ncyBsYWJlbCB0ZXh0LiAqL1xuICBhc3luYyBnZXRMYWJlbFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX3RleHRMYWJlbCgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgcmFkaW8tYnV0dG9uLiAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIHJhZGlvLWJ1dHRvbi4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSByYWRpby1idXR0b24gaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuaXNGb2N1c2VkKCk7XG4gIH1cblxuICAvKipcbiAgICogUHV0cyB0aGUgcmFkaW8tYnV0dG9uIGluIGEgY2hlY2tlZCBzdGF0ZSBieSBjbGlja2luZyBpdCBpZiBpdCBpcyBjdXJyZW50bHkgdW5jaGVja2VkLFxuICAgKiBvciBkb2luZyBub3RoaW5nIGlmIGl0IGlzIGFscmVhZHkgY2hlY2tlZC5cbiAgICovXG4gIGFzeW5jIGNoZWNrKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuaXNDaGVja2VkKCkpKSB7XG4gICAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2NsaWNrTGFiZWwoKSkuY2xpY2soKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==