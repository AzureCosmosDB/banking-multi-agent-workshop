/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, ContentContainerComponentHarness, HarnessPredicate, parallel, } from '@angular/cdk/testing';
const iconSelector = '.mat-mdc-list-item-icon';
const avatarSelector = '.mat-mdc-list-item-avatar';
/**
 * Gets a `HarnessPredicate` that applies the given `BaseListItemHarnessFilters` to the given
 * list item harness.
 * @template H The type of list item harness to create a predicate for.
 * @param harnessType A constructor for a list item harness.
 * @param options An instance of `BaseListItemHarnessFilters` to apply.
 * @return A `HarnessPredicate` for the given harness type with the given options applied.
 */
export function getListItemPredicate(harnessType, options) {
    return new HarnessPredicate(harnessType, options)
        .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption('fullText', options.fullText, (harness, fullText) => HarnessPredicate.stringMatches(harness.getFullText(), fullText))
        .addOption('title', options.title, (harness, title) => HarnessPredicate.stringMatches(harness.getTitle(), title))
        .addOption('secondaryText', options.secondaryText, (harness, secondaryText) => HarnessPredicate.stringMatches(harness.getSecondaryText(), secondaryText))
        .addOption('tertiaryText', options.tertiaryText, (harness, tertiaryText) => HarnessPredicate.stringMatches(harness.getTertiaryText(), tertiaryText));
}
/** Harness for interacting with a list subheader. */
export class MatSubheaderHarness extends ComponentHarness {
    static { this.hostSelector = '.mat-mdc-subheader'; }
    static with(options = {}) {
        return new HarnessPredicate(MatSubheaderHarness, options).addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
    }
    /** Gets the full text content of the list item (including text from any font icons). */
    async getText() {
        return (await this.host()).text();
    }
}
/** Selectors for the various list item sections that may contain user content. */
export var MatListItemSection;
(function (MatListItemSection) {
    MatListItemSection["CONTENT"] = ".mdc-list-item__content";
})(MatListItemSection || (MatListItemSection = {}));
/** Enum describing the possible variants of a list item. */
export var MatListItemType;
(function (MatListItemType) {
    MatListItemType[MatListItemType["ONE_LINE_ITEM"] = 0] = "ONE_LINE_ITEM";
    MatListItemType[MatListItemType["TWO_LINE_ITEM"] = 1] = "TWO_LINE_ITEM";
    MatListItemType[MatListItemType["THREE_LINE_ITEM"] = 2] = "THREE_LINE_ITEM";
})(MatListItemType || (MatListItemType = {}));
/**
 * Shared behavior among the harnesses for the various `MatListItem` flavors.
 * @docs-private
 */
export class MatListItemHarnessBase extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._lines = this.locatorForAll('.mat-mdc-list-item-line');
        this._primaryText = this.locatorFor('.mdc-list-item__primary-text');
        this._avatar = this.locatorForOptional('.mat-mdc-list-item-avatar');
        this._icon = this.locatorForOptional('.mat-mdc-list-item-icon');
        this._unscopedTextContent = this.locatorFor('.mat-mdc-list-item-unscoped-content');
    }
    /** Gets the type of the list item, currently describing how many lines there are. */
    async getType() {
        const host = await this.host();
        const [isOneLine, isTwoLine] = await parallel(() => [
            host.hasClass('mdc-list-item--with-one-line'),
            host.hasClass('mdc-list-item--with-two-lines'),
        ]);
        if (isOneLine) {
            return MatListItemType.ONE_LINE_ITEM;
        }
        else if (isTwoLine) {
            return MatListItemType.TWO_LINE_ITEM;
        }
        else {
            return MatListItemType.THREE_LINE_ITEM;
        }
    }
    /**
     * Gets the full text content of the list item, excluding text
     * from icons and avatars.
     *
     * @deprecated Use the `getFullText` method instead.
     * @breaking-change 16.0.0
     */
    async getText() {
        return this.getFullText();
    }
    /**
     * Gets the full text content of the list item, excluding text
     * from icons and avatars.
     */
    async getFullText() {
        return (await this.host()).text({ exclude: `${iconSelector}, ${avatarSelector}` });
    }
    /** Gets the title of the list item. */
    async getTitle() {
        return (await this._primaryText()).text();
    }
    /** Whether the list item is disabled. */
    async isDisabled() {
        return (await this.host()).hasClass('mdc-list-item--disabled');
    }
    /**
     * Gets the secondary line text of the list item. Null if the list item
     * does not have a secondary line.
     */
    async getSecondaryText() {
        const type = await this.getType();
        if (type === MatListItemType.ONE_LINE_ITEM) {
            return null;
        }
        const [lines, unscopedTextContent] = await parallel(() => [
            this._lines(),
            this._unscopedTextContent(),
        ]);
        // If there is no explicit line for the secondary text, the unscoped text content
        // is rendered as the secondary text (with potential text wrapping enabled).
        if (lines.length >= 1) {
            return lines[0].text();
        }
        else {
            return unscopedTextContent.text();
        }
    }
    /**
     * Gets the tertiary line text of the list item. Null if the list item
     * does not have a tertiary line.
     */
    async getTertiaryText() {
        const type = await this.getType();
        if (type !== MatListItemType.THREE_LINE_ITEM) {
            return null;
        }
        const [lines, unscopedTextContent] = await parallel(() => [
            this._lines(),
            this._unscopedTextContent(),
        ]);
        // First we check if there is an explicit line for the tertiary text. If so, we return it.
        // If there is at least an explicit secondary line though, then we know that the unscoped
        // text content corresponds to the tertiary line. If there are no explicit lines at all,
        // we know that the unscoped text content from the secondary text just wraps into the third
        // line, but there *no* actual dedicated tertiary text.
        if (lines.length === 2) {
            return lines[1].text();
        }
        else if (lines.length === 1) {
            return unscopedTextContent.text();
        }
        return null;
    }
    /** Whether this list item has an avatar. */
    async hasAvatar() {
        return !!(await this._avatar());
    }
    /** Whether this list item has an icon. */
    async hasIcon() {
        return !!(await this._icon());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1pdGVtLWhhcm5lc3MtYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9saXN0L3Rlc3RpbmcvbGlzdC1pdGVtLWhhcm5lc3MtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsZ0JBQWdCLEVBRWhCLGdDQUFnQyxFQUNoQyxnQkFBZ0IsRUFDaEIsUUFBUSxHQUNULE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsTUFBTSxZQUFZLEdBQUcseUJBQXlCLENBQUM7QUFDL0MsTUFBTSxjQUFjLEdBQUcsMkJBQTJCLENBQUM7QUFFbkQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FDbEMsV0FBMkMsRUFDM0MsT0FBbUM7SUFFbkMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUM7U0FDOUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQ2pELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQ3hEO1NBQ0EsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQzdELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQ2hFO1NBQ0EsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQzFEO1NBQ0EsU0FBUyxDQUFDLGVBQWUs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aWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBwYXJhbGxlbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtCYXNlTGlzdEl0ZW1IYXJuZXNzRmlsdGVycywgU3ViaGVhZGVySGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vbGlzdC1oYXJuZXNzLWZpbHRlcnMnO1xuXG5jb25zdCBpY29uU2VsZWN0b3IgPSAnLm1hdC1tZGMtbGlzdC1pdGVtLWljb24nO1xuY29uc3QgYXZhdGFyU2VsZWN0b3IgPSAnLm1hdC1tZGMtbGlzdC1pdGVtLWF2YXRhcic7XG5cbi8qKlxuICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGFwcGxpZXMgdGhlIGdpdmVuIGBCYXNlTGlzdEl0ZW1IYXJuZXNzRmlsdGVyc2AgdG8gdGhlIGdpdmVuXG4gKiBsaXN0IGl0ZW0gaGFybmVzcy5cbiAqIEB0ZW1wbGF0ZSBIIFRoZSB0eXBlIG9mIGxpc3QgaXRlbSBoYXJuZXNzIHRvIGNyZWF0ZSBhIHByZWRpY2F0ZSBmb3IuXG4gKiBAcGFyYW0gaGFybmVzc1R5cGUgQSBjb25zdHJ1Y3RvciBmb3IgYSBsaXN0IGl0ZW0gaGFybmVzcy5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIGluc3RhbmNlIG9mIGBCYXNlTGlzdEl0ZW1IYXJuZXNzRmlsdGVyc2AgdG8gYXBwbHkuXG4gKiBAcmV0dXJuIEEgYEhhcm5lc3NQcmVkaWNhdGVgIGZvciB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMgYXBwbGllZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExpc3RJdGVtUHJlZGljYXRlPEggZXh0ZW5kcyBNYXRMaXN0SXRlbUhhcm5lc3NCYXNlPihcbiAgaGFybmVzc1R5cGU6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxIPixcbiAgb3B0aW9uczogQmFzZUxpc3RJdGVtSGFybmVzc0ZpbHRlcnMsXG4pOiBIYXJuZXNzUHJlZGljYXRlPEg+IHtcbiAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKGhhcm5lc3NUeXBlLCBvcHRpb25zKVxuICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsIChoYXJuZXNzLCB0ZXh0KSA9PlxuICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSxcbiAgICApXG4gICAgLmFkZE9wdGlvbignZnVsbFRleHQnLCBvcHRpb25zLmZ1bGxUZXh0LCAoaGFybmVzcywgZnVsbFRleHQpID0+XG4gICAgICBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRGdWxsVGV4dCgpLCBmdWxsVGV4dCksXG4gICAgKVxuICAgIC5hZGRPcHRpb24oJ3RpdGxlJywgb3B0aW9ucy50aXRsZSwgKGhhcm5lc3MsIHRpdGxlKSA9PlxuICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGl0bGUoKSwgdGl0bGUpLFxuICAgIClcbiAgICAuYWRkT3B0aW9uKCdzZWNvbmRhcnlUZXh0Jywgb3B0aW9ucy5zZWNvbmRhcnlUZXh0LCAoaGFybmVzcywgc2Vjb25kYXJ5VGV4dCkgPT5cbiAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFNlY29uZGFyeVRleHQoKSwgc2Vjb25kYXJ5VGV4dCksXG4gICAgKVxuICAgIC5hZGRPcHRpb24oJ3RlcnRpYXJ5VGV4dCcsIG9wdGlvbnMudGVydGlhcnlUZXh0LCAoaGFybmVzcywgdGVydGlhcnlUZXh0KSA9PlxuICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGVydGlhcnlUZXh0KCksIHRlcnRpYXJ5VGV4dCksXG4gICAgKTtcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBsaXN0IHN1YmhlYWRlci4gKi9cbmV4cG9ydCBjbGFzcyBNYXRTdWJoZWFkZXJIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1tZGMtc3ViaGVhZGVyJztcblxuICBzdGF0aWMgd2l0aChvcHRpb25zOiBTdWJoZWFkZXJIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRTdWJoZWFkZXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFN1YmhlYWRlckhhcm5lc3MsIG9wdGlvbnMpLmFkZE9wdGlvbihcbiAgICAgICd0ZXh0JyxcbiAgICAgIG9wdGlvbnMudGV4dCxcbiAgICAgIChoYXJuZXNzLCB0ZXh0KSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRUZXh0KCksIHRleHQpLFxuICAgICk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZnVsbCB0ZXh0IGNvbnRlbnQgb2YgdGhlIGxpc3QgaXRlbSAoaW5jbHVkaW5nIHRleHQgZnJvbSBhbnkgZm9udCBpY29ucykuICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS50ZXh0KCk7XG4gIH1cbn1cblxuLyoqIFNlbGVjdG9ycyBmb3IgdGhlIHZhcmlvdXMgbGlzdCBpdGVtIHNlY3Rpb25zIHRoYXQgbWF5IGNvbnRhaW4gdXNlciBjb250ZW50LiAqL1xuZXhwb3J0IGVudW0gTWF0TGlzdEl0ZW1TZWN0aW9uIHtcbiAgQ09OVEVOVCA9ICcubWRjLWxpc3QtaXRlbV9fY29udGVudCcsXG59XG5cbi8qKiBFbnVtIGRlc2NyaWJpbmcgdGhlIHBvc3NpYmxlIHZhcmlhbnRzIG9mIGEgbGlzdCBpdGVtLiAqL1xuZXhwb3J0IGVudW0gTWF0TGlzdEl0ZW1UeXBlIHtcbiAgT05FX0xJTkVfSVRFTSxcbiAgVFdPX0xJTkVfSVRFTSxcbiAgVEhSRUVfTElORV9JVEVNLFxufVxuXG4vKipcbiAqIFNoYXJlZCBiZWhhdmlvciBhbW9uZyB0aGUgaGFybmVzc2VzIGZvciB0aGUgdmFyaW91cyBgTWF0TGlzdEl0ZW1gIGZsYXZvcnMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXRMaXN0SXRlbUhhcm5lc3NCYXNlIGV4dGVuZHMgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8TWF0TGlzdEl0ZW1TZWN0aW9uPiB7XG4gIHByaXZhdGUgX2xpbmVzID0gdGhpcy5sb2NhdG9yRm9yQWxsKCcubWF0LW1kYy1saXN0LWl0ZW0tbGluZScpO1xuICBwcml2YXRlIF9wcmltYXJ5VGV4dCA9IHRoaXMubG9jYXRvckZvcignLm1kYy1saXN0LWl0ZW1fX3ByaW1hcnktdGV4dCcpO1xuICBwcml2YXRlIF9hdmF0YXIgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1tZGMtbGlzdC1pdGVtLWF2YXRhcicpO1xuICBwcml2YXRlIF9pY29uID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoJy5tYXQtbWRjLWxpc3QtaXRlbS1pY29uJyk7XG4gIHByaXZhdGUgX3Vuc2NvcGVkVGV4dENvbnRlbnQgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtbWRjLWxpc3QtaXRlbS11bnNjb3BlZC1jb250ZW50Jyk7XG5cbiAgLyoqIEdldHMgdGhlIHR5cGUgb2YgdGhlIGxpc3QgaXRlbSwgY3VycmVudGx5IGRlc2NyaWJpbmcgaG93IG1hbnkgbGluZXMgdGhlcmUgYXJlLiAqL1xuICBhc3luYyBnZXRUeXBlKCk6IFByb21pc2U8TWF0TGlzdEl0ZW1UeXBlPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIGNvbnN0IFtpc09uZUxpbmUsIGlzVHdvTGluZV0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICBob3N0Lmhhc0NsYXNzKCdtZGMtbGlzdC1pdGVtLS13aXRoLW9uZS1saW5lJyksXG4gICAgICBob3N0Lmhhc0NsYXNzKCdtZGMtbGlzdC1pdGVtLS13aXRoLXR3by1saW5lcycpLFxuICAgIF0pO1xuICAgIGlmIChpc09uZUxpbmUpIHtcbiAgICAgIHJldHVybiBNYXRMaXN0SXRlbVR5cGUuT05FX0xJTkVfSVRFTTtcbiAgICB9IGVsc2UgaWYgKGlzVHdvTGluZSkge1xuICAgICAgcmV0dXJuIE1hdExpc3RJdGVtVHlwZS5UV09fTElORV9JVEVNO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWF0TGlzdEl0ZW1UeXBlLlRIUkVFX0xJTkVfSVRFTTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZnVsbCB0ZXh0IGNvbnRlbnQgb2YgdGhlIGxpc3QgaXRlbSwgZXhjbHVkaW5nIHRleHRcbiAgICogZnJvbSBpY29ucyBhbmQgYXZhdGFycy5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHRoZSBgZ2V0RnVsbFRleHRgIG1ldGhvZCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE2LjAuMFxuICAgKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmdldEZ1bGxUZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZnVsbCB0ZXh0IGNvbnRlbnQgb2YgdGhlIGxpc3QgaXRlbSwgZXhjbHVkaW5nIHRleHRcbiAgICogZnJvbSBpY29ucyBhbmQgYXZhdGFycy5cbiAgICovXG4gIGFzeW5jIGdldEZ1bGxUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkudGV4dCh7ZXhjbHVkZTogYCR7aWNvblNlbGVjdG9yfSwgJHthdmF0YXJTZWxlY3Rvcn1gfSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGl0bGUgb2YgdGhlIGxpc3QgaXRlbS4gKi9cbiAgYXN5bmMgZ2V0VGl0bGUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX3ByaW1hcnlUZXh0KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0IGl0ZW0gaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21kYy1saXN0LWl0ZW0tLWRpc2FibGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgc2Vjb25kYXJ5IGxpbmUgdGV4dCBvZiB0aGUgbGlzdCBpdGVtLiBOdWxsIGlmIHRoZSBsaXN0IGl0ZW1cbiAgICogZG9lcyBub3QgaGF2ZSBhIHNlY29uZGFyeSBsaW5lLlxuICAgKi9cbiAgYXN5bmMgZ2V0U2Vjb25kYXJ5VGV4dCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCB0eXBlID0gYXdhaXQgdGhpcy5nZXRUeXBlKCk7XG4gICAgaWYgKHR5cGUgPT09IE1hdExpc3RJdGVtVHlwZS5PTkVfTElORV9JVEVNKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBbbGluZXMsIHVuc2NvcGVkVGV4dENvbnRlbnRdID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gW1xuICAgICAgdGhpcy5fbGluZXMoKSxcbiAgICAgIHRoaXMuX3Vuc2NvcGVkVGV4dENvbnRlbnQoKSxcbiAgICBdKTtcblxuICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4cGxpY2l0IGxpbmUgZm9yIHRoZSBzZWNvbmRhcnkgdGV4dCwgdGhlIHVuc2NvcGVkIHRleHQgY29udGVudFxuICAgIC8vIGlzIHJlbmRlcmVkIGFzIHRoZSBzZWNvbmRhcnkgdGV4dCAod2l0aCBwb3RlbnRpYWwgdGV4dCB3cmFwcGluZyBlbmFibGVkKS5cbiAgICBpZiAobGluZXMubGVuZ3RoID49IDEpIHtcbiAgICAgIHJldHVybiBsaW5lc1swXS50ZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bnNjb3BlZFRleHRDb250ZW50LnRleHQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdGVydGlhcnkgbGluZSB0ZXh0IG9mIHRoZSBsaXN0IGl0ZW0uIE51bGwgaWYgdGhlIGxpc3QgaXRlbVxuICAgKiBkb2VzIG5vdCBoYXZlIGEgdGVydGlhcnkgbGluZS5cbiAgICovXG4gIGFzeW5jIGdldFRlcnRpYXJ5VGV4dCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCB0eXBlID0gYXdhaXQgdGhpcy5nZXRUeXBlKCk7XG4gICAgaWYgKHR5cGUgIT09IE1hdExpc3RJdGVtVHlwZS5USFJFRV9MSU5FX0lURU0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IFtsaW5lcywgdW5zY29wZWRUZXh0Q29udGVudF0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICB0aGlzLl9saW5lcygpLFxuICAgICAgdGhpcy5fdW5zY29wZWRUZXh0Q29udGVudCgpLFxuICAgIF0pO1xuXG4gICAgLy8gRmlyc3Qgd2UgY2hlY2sgaWYgdGhlcmUgaXMgYW4gZXhwbGljaXQgbGluZSBmb3IgdGhlIHRlcnRpYXJ5IHRleHQuIElmIHNvLCB3ZSByZXR1cm4gaXQuXG4gICAgLy8gSWYgdGhlcmUgaXMgYXQgbGVhc3QgYW4gZXhwbGljaXQgc2Vjb25kYXJ5IGxpbmUgdGhvdWdoLCB0aGVuIHdlIGtub3cgdGhhdCB0aGUgdW5zY29wZWRcbiAgICAvLyB0ZXh0IGNvbnRlbnQgY29ycmVzcG9uZHMgdG8gdGhlIHRlcnRpYXJ5IGxpbmUuIElmIHRoZXJlIGFyZSBubyBleHBsaWNpdCBsaW5lcyBhdCBhbGwsXG4gICAgLy8gd2Uga25vdyB0aGF0IHRoZSB1bnNjb3BlZCB0ZXh0IGNvbnRlbnQgZnJvbSB0aGUgc2Vjb25kYXJ5IHRleHQganVzdCB3cmFwcyBpbnRvIHRoZSB0aGlyZFxuICAgIC8vIGxpbmUsIGJ1dCB0aGVyZSAqbm8qIGFjdHVhbCBkZWRpY2F0ZWQgdGVydGlhcnkgdGV4dC5cbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gbGluZXNbMV0udGV4dCgpO1xuICAgIH0gZWxzZSBpZiAobGluZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gdW5zY29wZWRUZXh0Q29udGVudC50ZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBsaXN0IGl0ZW0gaGFzIGFuIGF2YXRhci4gKi9cbiAgYXN5bmMgaGFzQXZhdGFyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAhIShhd2FpdCB0aGlzLl9hdmF0YXIoKSk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGlzIGxpc3QgaXRlbSBoYXMgYW4gaWNvbi4gKi9cbiAgYXN5bmMgaGFzSWNvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gISEoYXdhaXQgdGhpcy5faWNvbigpKTtcbiAgfVxufVxuIl19