import { booleanAttribute } from '@angular/core';
import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/** Harness for interacting with a mat-button in tests. */
class MatButtonHarness extends ContentContainerComponentHarness {
    // TODO(jelbourn) use a single class, like `.mat-button-base`
    static { this.hostSelector = `[mat-button], [mat-raised-button], [mat-flat-button],
                         [mat-icon-button], [mat-stroked-button], [mat-fab], [mat-mini-fab]`; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a button with specific attributes.
     * @param options Options for narrowing the search:
     *   - `selector` finds a button whose host element matches the given selector.
     *   - `text` finds a button with specific text content.
     *   - `variant` finds buttons matching a specific variant.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('variant', options.variant, (harness, variant) => HarnessPredicate.stringMatches(harness.getVariant(), variant))
            .addOption('disabled', options.disabled, async (harness, disabled) => {
            return (await harness.isDisabled()) === disabled;
        });
    }
    async click(...args) {
        return (await this.host()).click(...args);
    }
    /** Gets a boolean promise indicating if the button is disabled. */
    async isDisabled() {
        const host = await this.host();
        return (booleanAttribute(await host.getAttribute('disabled')) ||
            (await host.hasClass('mat-mdc-button-disabled')));
    }
    /** Gets a promise for the button's label text. */
    async getText() {
        return (await this.host()).text();
    }
    /** Focuses the button and returns a void promise that indicates when the action is complete. */
    async focus() {
        return (await this.host()).focus();
    }
    /** Blurs the button and returns a void promise that indicates when the action is complete. */
    async blur() {
        return (await this.host()).blur();
    }
    /** Whether the button is focused. */
    async isFocused() {
        return (await this.host()).isFocused();
    }
    /** Gets the variant of the button. */
    async getVariant() {
        const host = await this.host();
        if ((await host.getAttribute('mat-raised-button')) != null) {
            return 'raised';
        }
        else if ((await host.getAttribute('mat-flat-button')) != null) {
            return 'flat';
        }
        else if ((await host.getAttribute('mat-icon-button')) != null) {
            return 'icon';
        }
        else if ((await host.getAttribute('mat-stroked-button')) != null) {
            return 'stroked';
        }
        else if ((await host.getAttribute('mat-fab')) != null) {
            return 'fab';
        }
        else if ((await host.getAttribute('mat-mini-fab')) != null) {
            return 'mini-fab';
        }
        return 'basic';
    }
}

export { MatButtonHarness };
//# sourceMappingURL=testing.mjs.map
