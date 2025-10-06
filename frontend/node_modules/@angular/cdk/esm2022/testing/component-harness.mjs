/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { parallel } from './change-detection';
/**
 * Base class for component harnesses that all component harness authors should extend. This base
 * component harness provides the basic ability to locate element and sub-component harness. It
 * should be inherited when defining user's own harness.
 */
export class ComponentHarness {
    constructor(locatorFactory) {
        this.locatorFactory = locatorFactory;
    }
    /** Gets a `Promise` for the `TestElement` representing the host element of the component. */
    async host() {
        return this.locatorFactory.rootElement;
    }
    /**
     * Gets a `LocatorFactory` for the document root element. This factory can be used to create
     * locators for elements that a component creates outside of its own root element. (e.g. by
     * appending to document.body).
     */
    documentRootLocatorFactory() {
        return this.locatorFactory.documentRootLocatorFactory();
    }
    /**
     * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
     * or element under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for the
     *   first element or harness matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If no matches are found, the
     *   `Promise` rejects. The type that the `Promise` resolves to is a union of all result types for
     *   each query.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'`:
     * - `await ch.locatorFor(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
     * - `await ch.locatorFor('div', DivHarness)()` gets a `TestElement` instance for `#d1`
     * - `await ch.locatorFor('span')()` throws because the `Promise` rejects.
     */
    locatorFor(...queries) {
        return this.locatorFactory.locatorFor(...queries);
    }
    /**
     * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
     * or element under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for the
     *   first element or harness matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If no matches are found, the
     *   `Promise` is resolved with `null`. The type that the `Promise` resolves to is a union of all
     *   result types for each query or null.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'`:
     * - `await ch.locatorForOptional(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
     * - `await ch.locatorForOptional('div', DivHarness)()` gets a `TestElement` instance for `#d1`
     * - `await ch.locatorForOptional('span')()` gets `null`.
     */
    locatorForOptional(...queries) {
        return this.locatorFactory.locatorForOptional(...queries);
    }
    /**
     * Creates an asynchronous locator function that can be used to find `ComponentHarness` instances
     * or elements under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for all
     *   elements and harnesses matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If an element matches more than
     *   one `ComponentHarness` class, the locator gets an instance of each for the same element. If
     *   an element matches multiple `string` selectors, only one `TestElement` instance is returned
     *   for that element. The type that the `Promise` resolves to is an array where each element is
     *   the union of all result types for each query.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'` and `IdIsD1Harness.hostSelector === '#d1'`:
     * - `await ch.locatorForAll(DivHarness, 'div')()` gets `[
     *     DivHarness, // for #d1
     *     TestElement, // for #d1
     *     DivHarness, // for #d2
     *     TestElement // for #d2
     *   ]`
     * - `await ch.locatorForAll('div', '#d1')()` gets `[
     *     TestElement, // for #d1
     *     TestElement // for #d2
     *   ]`
     * - `await ch.locatorForAll(DivHarness, IdIsD1Harness)()` gets `[
     *     DivHarness, // for #d1
     *     IdIsD1Harness, // for #d1
     *     DivHarness // for #d2
     *   ]`
     * - `await ch.locatorForAll('span')()` gets `[]`.
     */
    locatorForAll(...queries) {
        return this.locatorFactory.locatorForAll(...queries);
    }
    /**
     * Flushes change detection and async tasks in the Angular zone.
     * In most cases it should not be necessary to call this manually. However, there may be some edge
     * cases where it is needed to fully flush animation events.
     */
    async forceStabilize() {
        return this.locatorFactory.forceStabilize();
    }
    /**
     * Waits for all scheduled or running async tasks to complete. This allows harness
     * authors to wait for async tasks outside of the Angular zone.
     */
    async waitForTasksOutsideAngular() {
        return this.locatorFactory.waitForTasksOutsideAngular();
    }
}
/**
 * Base class for component harnesses that authors should extend if they anticipate that consumers
 * of the harness may want to access other harnesses within the `<ng-content>` of the component.
 */
export class ContentContainerComponentHarness extends ComponentHarness {
    async getChildLoader(selector) {
        return (await this.getRootHarnessLoader()).getChildLoader(selector);
    }
    async getAllChildLoaders(selector) {
        return (await this.getRootHarnessLoader()).getAllChildLoaders(selector);
    }
    async getHarness(query) {
        return (await this.getRootHarnessLoader()).getHarness(query);
    }
    async getHarnessOrNull(query) {
        return (await this.getRootHarnessLoader()).getHarnessOrNull(query);
    }
    async getAllHarnesses(query) {
        return (await this.getRootHarnessLoader()).getAllHarnesses(query);
    }
    async hasHarness(query) {
        return (await this.getRootHarnessLoader()).hasHarness(query);
    }
    /**
     * Gets the root harness loader from which to start
     * searching for content contained by this harness.
     */
    async getRootHarnessLoader() {
        return this.locatorFactory.rootHarnessLoader();
    }
}
/**
 * A class used to associate a ComponentHarness class with predicates functions that can be used to
 * filter instances of the class.
 */
export class HarnessPredicate {
    constructor(harnessType, options) {
        this.harnessType = harnessType;
        this._predicates = [];
        this._descriptions = [];
        this._addBaseOptions(options);
    }
    /**
     * Checks if the specified nullable string value matches the given pattern.
     * @param value The nullable string value to check, or a Promise resolving to the
     *   nullable string value.
     * @param pattern The pattern the value is expected to match. If `pattern` is a string,
     *   `value` is expected to match exactly. If `pattern` is a regex, a partial match is
     *   allowed. If `pattern` is `null`, the value is expected to be `null`.
     * @return Whether the value matches the pattern.
     */
    static async stringMatches(value, pattern) {
        value = await value;
        if (pattern === null) {
            return value === null;
        }
        else if (value === null) {
            return false;
        }
        return typeof pattern === 'string' ? value === pattern : pattern.test(value);
    }
    /**
     * Adds a predicate function to be run against candidate harnesses.
     * @param description A description of this predicate that may be used in error messages.
     * @param predicate An async predicate function.
     * @return this (for method chaining).
     */
    add(description, predicate) {
        this._descriptions.push(description);
        this._predicates.push(predicate);
        return this;
    }
    /**
     * Adds a predicate function that depends on an option value to be run against candidate
     * harnesses. If the option value is undefined, the predicate will be ignored.
     * @param name The name of the option (may be used in error messages).
     * @param option The option value.
     * @param predicate The predicate function to run if the option value is not undefined.
     * @return this (for method chaining).
     */
    addOption(name, option, predicate) {
        if (option !== undefined) {
            this.add(`${name} = ${_valueAsString(option)}`, item => predicate(item, option));
        }
        return this;
    }
    /**
     * Filters a list of harnesses on this predicate.
     * @param harnesses The list of harnesses to filter.
     * @return A list of harnesses that satisfy this predicate.
     */
    async filter(harnesses) {
        if (harnesses.length === 0) {
            return [];
        }
        const results = await parallel(() => harnesses.map(h => this.evaluate(h)));
        return harnesses.filter((_, i) => results[i]);
    }
    /**
     * Evaluates whether the given harness satisfies this predicate.
     * @param harness The harness to check
     * @return A promise that resolves to true if the harness satisfies this predicate,
     *   and resolves to false otherwise.
     */
    async evaluate(harness) {
        const results = await parallel(() => this._predicates.map(p => p(harness)));
        return results.reduce((combined, current) => combined && current, true);
    }
    /** Gets a description of this predicate for use in error messages. */
    getDescription() {
        return this._descriptions.join(', ');
    }
    /** Gets the selector used to find candidate elements. */
    getSelector() {
        // We don't have to go through the extra trouble if there are no ancestors.
        if (!this._ancestor) {
            return (this.harnessType.hostSelector || '').trim();
        }
        const [ancestors, ancestorPlaceholders] = _splitAndEscapeSelector(this._ancestor);
        const [selectors, selectorPlaceholders] = _splitAndEscapeSelector(this.harnessType.hostSelector || '');
        const result = [];
        // We have to add the ancestor to each part of the host compound selector, otherwise we can get
        // incorrect results. E.g. `.ancestor .a, .ancestor .b` vs `.ancestor .a, .b`.
        ancestors.forEach(escapedAncestor => {
            const ancestor = _restoreSelector(escapedAncestor, ancestorPlaceholders);
            return selectors.forEach(escapedSelector => result.push(`${ancestor} ${_restoreSelector(escapedSelector, selectorPlaceholders)}`));
        });
        return result.join(', ');
    }
    /** Adds base options common to all harness types. */
    _addBaseOptions(options) {
        this._ancestor = options.ancestor || '';
        if (this._ancestor) {
            this._descriptions.push(`has ancestor matching selector "${this._ancestor}"`);
        }
        const selector = options.selector;
        if (selector !== undefined) {
            this.add(`host matches selector "${selector}"`, async (item) => {
                return (await item.host()).matchesSelector(selector);
            });
        }
    }
}
/** Represent a value as a string for the purpose of logging. */
function _valueAsString(value) {
    if (value === undefined) {
        return 'undefined';
    }
    try {
        // `JSON.stringify` doesn't handle RegExp properly, so we need a custom replacer.
        // Use a character that is unlikely to appear in real strings to denote the start and end of
        // the regex. This allows us to strip out the extra quotes around the value added by
        // `JSON.stringify`. Also do custom escaping on `"` characters to prevent `JSON.stringify`
        // from escaping them as if they were part of a string.
        const stringifiedValue = JSON.stringify(value, (_, v) => v instanceof RegExp
            ? `◬MAT_RE_ESCAPE◬${v.toString().replace(/"/g, '◬MAT_RE_ESCAPE◬')}◬MAT_RE_ESCAPE◬`
            : v);
        // Strip out the extra quotes around regexes and put back the manually escaped `"` characters.
        return stringifiedValue
            .replace(/"◬MAT_RE_ESCAPE◬|◬MAT_RE_ESCAPE◬"/g, '')
            .replace(/◬MAT_RE_ESCAPE◬/g, '"');
    }
    catch {
        // `JSON.stringify` will throw if the object is cyclical,
        // in this case the best we can do is report the value as `{...}`.
        return '{...}';
    }
}
/**
 * Splits up a compound selector into its parts and escapes any quoted content. The quoted content
 * has to be escaped, because it can contain commas which will throw throw us off when trying to
 * split it.
 * @param selector Selector to be split.
 * @returns The escaped string where any quoted content is replaced with a placeholder. E.g.
 * `[foo="bar"]` turns into `[foo=__cdkPlaceholder-0__]`. Use `_restoreSelector` to restore
 * the placeholders.
 */
function _splitAndEscapeSelector(selector) {
    const placeholders = [];
    // Note that the regex doesn't account for nested quotes so something like `"ab'cd'e"` will be
    // considered as two blocks. It's a bit of an edge case, but if we find that it's a problem,
    // we can make it a bit smarter using a loop. Use this for now since it's more readable and
    // compact. More complete implementation:
    // https://github.com/angular/angular/blob/bd34bc9e89f18a/packages/compiler/src/shadow_css.ts#L655
    const result = selector.replace(/(["'][^["']*["'])/g, (_, keep) => {
        const replaceBy = `__cdkPlaceholder-${placeholders.length}__`;
        placeholders.push(keep);
        return replaceBy;
    });
    return [result.split(',').map(part => part.trim()), placeholders];
}
/** Restores a selector whose content was escaped in `_splitAndEscapeSelector`. */
function _restoreSelector(selector, placeholders) {
    return selector.replace(/__cdkPlaceholder-(\d+)__/g, (_, index) => placeholders[+index]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Rlc3RpbmcvY29tcG9uZW50LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBbVE1Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7SUFDcEMsWUFBK0IsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO0lBQUcsQ0FBQztJQUVqRSw2RkFBNkY7SUFDN0YsS0FBSyxDQUFDLElBQUk7UUFDUixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7OztPQUlHO0lBQ08sMEJBQTBCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDTyxVQUFVLENBQ2xCLEdBQUcsT0FBVTtRQUViLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bb0JHO0lBQ08sa0JBQWtCLENBQzFCLEdBQUcsT0FBVTtRQUViLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FtQ0c7SUFDTyxhQUFhLENBQ3JCLEdBQUcsT0FBVTtRQUViLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLEtBQUssQ0FBQyxjQUFjO1FBQzVCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sS0FBSyxDQUFDLDBCQUEwQjtRQUN4QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0NBQ0Y7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQWdCLGdDQUNwQixTQUFRLGdCQUFnQjtJQUd4QixLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVc7UUFDOUIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFXO1FBQ2xDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQTZCLEtBQXNCO1FBQ2pFLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQTZCLEtBQXNCO1FBQ3ZFLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQTZCLEtBQXNCO1FBQ3RFLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUE2QixLQUFzQjtRQUNqRSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sS0FBSyxDQUFDLG9CQUFvQjtRQUNsQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0NBQ0Y7QUFzQkQ7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQUszQixZQUFtQixXQUEyQyxFQUFFLE9BQTJCO1FBQXhFLGdCQUFXLEdBQVgsV0FBVyxDQUFnQztRQUp0RCxnQkFBVyxHQUF3QixFQUFFLENBQUM7UUFDdEMsa0JBQWEsR0FBYSxFQUFFLENBQUM7UUFJbkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FDeEIsS0FBNkMsRUFDN0MsT0FBK0I7UUFFL0IsS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDO1FBQ3BCLElBQUksT0FBTyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3JCLE9BQU8sS0FBSyxLQUFLLElBQUksQ0FBQztRQUN4QixDQUFDO2FBQU0sSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDMUIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsT0FBTyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsR0FBRyxDQUFDLFdBQW1CLEVBQUUsU0FBNEI7UUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFNBQVMsQ0FBSSxJQUFZLEVBQUUsTUFBcUIsRUFBRSxTQUFxQztRQUNyRixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxNQUFNLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFjO1FBQ3pCLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMzQixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFVO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxRQUFRLElBQUksT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxXQUFXO1FBQ1QsMkVBQTJFO1FBQzNFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFRCxNQUFNLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsR0FBRyx1QkFBdUIsQ0FDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUNwQyxDQUFDO1FBQ0YsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLCtGQUErRjtRQUMvRiw4RUFBOEU7UUFDOUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNsQyxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN6RSxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsSUFBSSxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQ3RGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQscURBQXFEO0lBQzdDLGVBQWUsQ0FBQyxPQUEyQjtRQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ3hDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNsQyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUEwQixRQUFRLEdBQUcsRUFBRSxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUU7Z0JBQzNELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFFRCxnRUFBZ0U7QUFDaEUsU0FBUyxjQUFjLENBQUMsS0FBYztJQUNwQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN4QixPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBQ0QsSUFBSSxDQUFDO1FBQ0gsaUZBQWlGO1FBQ2pGLDRGQUE0RjtRQUM1RixvRkFBb0Y7UUFDcEYsMEZBQTBGO1FBQzFGLHVEQUF1RDtRQUN2RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQ3RELENBQUMsWUFBWSxNQUFNO1lBQ2pCLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsaUJBQWlCO1lBQ2xGLENBQUMsQ0FBQyxDQUFDLENBQ04sQ0FBQztRQUNGLDhGQUE4RjtRQUM5RixPQUFPLGdCQUFnQjthQUNwQixPQUFPLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxDQUFDO2FBQ2pELE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ1AseURBQXlEO1FBQ3pELGtFQUFrRTtRQUNsRSxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxRQUFnQjtJQUMvQyxNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7SUFFbEMsOEZBQThGO0lBQzlGLDRGQUE0RjtJQUM1RiwyRkFBMkY7SUFDM0YseUNBQXlDO0lBQ3pDLGtHQUFrRztJQUNsRyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ2hFLE1BQU0sU0FBUyxHQUFHLG9CQUFvQixZQUFZLENBQUMsTUFBTSxJQUFJLENBQUM7UUFDOUQsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRCxrRkFBa0Y7QUFDbEYsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFnQixFQUFFLFlBQXNCO0lBQ2hFLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDM0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcmFsbGVsfSBmcm9tICcuL2NoYW5nZS1kZXRlY3Rpb24nO1xuaW1wb3J0IHtUZXN0RWxlbWVudH0gZnJvbSAnLi90ZXN0LWVsZW1lbnQnO1xuXG4vKiogQW4gYXN5bmMgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZSB3aGVuIGNhbGxlZC4gKi9cbmV4cG9ydCB0eXBlIEFzeW5jRmFjdG9yeUZuPFQ+ID0gKCkgPT4gUHJvbWlzZTxUPjtcblxuLyoqIEFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYW4gaXRlbSBhbmQgcmV0dXJucyBhIGJvb2xlYW4gcHJvbWlzZSAqL1xuZXhwb3J0IHR5cGUgQXN5bmNQcmVkaWNhdGU8VD4gPSAoaXRlbTogVCkgPT4gUHJvbWlzZTxib29sZWFuPjtcblxuLyoqIEFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYW4gaXRlbSBhbmQgYW4gb3B0aW9uIHZhbHVlIGFuZCByZXR1cm5zIGEgYm9vbGVhbiBwcm9taXNlLiAqL1xuZXhwb3J0IHR5cGUgQXN5bmNPcHRpb25QcmVkaWNhdGU8VCwgTz4gPSAoaXRlbTogVCwgb3B0aW9uOiBPKSA9PiBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIEEgcXVlcnkgZm9yIGEgYENvbXBvbmVudEhhcm5lc3NgLCB3aGljaCBpcyBleHByZXNzZWQgYXMgZWl0aGVyIGEgYENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcmAgb3JcbiAqIGEgYEhhcm5lc3NQcmVkaWNhdGVgLlxuICovXG5leHBvcnQgdHlwZSBIYXJuZXNzUXVlcnk8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+ID1cbiAgfCBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD5cbiAgfCBIYXJuZXNzUHJlZGljYXRlPFQ+O1xuXG4vKipcbiAqIFRoZSByZXN1bHQgdHlwZSBvYnRhaW5lZCB3aGVuIHNlYXJjaGluZyB1c2luZyBhIHBhcnRpY3VsYXIgbGlzdCBvZiBxdWVyaWVzLiBUaGlzIHR5cGUgZGVwZW5kcyBvblxuICogdGhlIHBhcnRpY3VsYXIgaXRlbXMgYmVpbmcgcXVlcmllZC5cbiAqIC0gSWYgb25lIG9mIHRoZSBxdWVyaWVzIGlzIGZvciBhIGBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8QzE+YCwgaXQgbWVhbnMgdGhhdCB0aGUgcmVzdWx0XG4gKiAgIG1pZ2h0IGJlIGEgaGFybmVzcyBvZiB0eXBlIGBDMWBcbiAqIC0gSWYgb25lIG9mIHRoZSBxdWVyaWVzIGlzIGZvciBhIGBIYXJuZXNzUHJlZGljYXRlPEMyPmAsIGl0IG1lYW5zIHRoYXQgdGhlIHJlc3VsdCBtaWdodCBiZSBhXG4gKiAgIGhhcm5lc3Mgb2YgdHlwZSBgQzJgXG4gKiAtIElmIG9uZSBvZiB0aGUgcXVlcmllcyBpcyBmb3IgYSBgc3RyaW5nYCwgaXQgbWVhbnMgdGhhdCB0aGUgcmVzdWx0IG1pZ2h0IGJlIGEgYFRlc3RFbGVtZW50YC5cbiAqXG4gKiBTaW5jZSB3ZSBkb24ndCBrbm93IGZvciBzdXJlIHdoaWNoIHF1ZXJ5IHdpbGwgbWF0Y2gsIHRoZSByZXN1bHQgdHlwZSBpZiB0aGUgdW5pb24gb2YgdGhlIHR5cGVzXG4gKiBmb3IgYWxsIHBvc3NpYmxlIHJlc3VsdHMuXG4gKlxuICogZS5nLlxuICogVGhlIHR5cGU6XG4gKiBgTG9jYXRvckZuUmVzdWx0Jmx0O1tcbiAqICAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yJmx0O015SGFybmVzcyZndDssXG4gKiAgIEhhcm5lc3NQcmVkaWNhdGUmbHQ7TXlPdGhlckhhcm5lc3MmZ3Q7LFxuICogICBzdHJpbmdcbiAqIF0mZ3Q7YFxuICogaXMgZXF1aXZhbGVudCB0bzpcbiAqIGBNeUhhcm5lc3MgfCBNeU90aGVySGFybmVzcyB8IFRlc3RFbGVtZW50YC5cbiAqL1xuZXhwb3J0IHR5cGUgTG9jYXRvckZuUmVzdWx0PFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+ID0ge1xuICBbSSBpbiBrZXlvZiBUXTogVFtJXSBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55W10pID0+IGluZmVyIEMgLy8gTWFwIGBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8Qz5gIHRvIGBDYC5cbiAgICA/IENcbiAgICA6IC8vIE1hcCBgSGFybmVzc1ByZWRpY2F0ZTxDPmAgdG8gYENgLlxuICAgIFRbSV0gZXh0ZW5kcyB7aGFybmVzc1R5cGU6IG5ldyAoLi4uYXJnczogYW55W10pID0+IGluZmVyIEN9XG4gICAgPyBDXG4gICAgOiAvLyBNYXAgYHN0cmluZ2AgdG8gYFRlc3RFbGVtZW50YC5cbiAgICBUW0ldIGV4dGVuZHMgc3RyaW5nXG4gICAgPyBUZXN0RWxlbWVudFxuICAgIDogLy8gTWFwIGV2ZXJ5dGhpbmcgZWxzZSB0byBgbmV2ZXJgIChzaG91bGQgbm90IGhhcHBlbiBkdWUgdG8gdGhlIHR5cGUgY29uc3RyYWludCBvbiBgVGApLlxuICAgICAgbmV2ZXI7XG59W251bWJlcl07XG5cbi8qKlxuICogSW50ZXJmYWNlIHVzZWQgdG8gbG9hZCBDb21wb25lbnRIYXJuZXNzIG9iamVjdHMuIFRoaXMgaW50ZXJmYWNlIGlzIHVzZWQgYnkgdGVzdCBhdXRob3JzIHRvXG4gKiBpbnN0YW50aWF0ZSBgQ29tcG9uZW50SGFybmVzc2Blcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIYXJuZXNzTG9hZGVyIHtcbiAgLyoqXG4gICAqIFNlYXJjaGVzIGZvciBhbiBlbGVtZW50IHdpdGggdGhlIGdpdmVuIHNlbGVjdG9yIHVuZGVyIHRoZSBjdXJyZW50IGluc3RhbmNlcydzIHJvb3QgZWxlbWVudCxcbiAgICogYW5kIHJldHVybnMgYSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBtYXRjaGluZyBlbGVtZW50LiBJZiBtdWx0aXBsZSBlbGVtZW50cyBtYXRjaCB0aGVcbiAgICogc2VsZWN0b3IsIHRoZSBmaXJzdCBpcyB1c2VkLiBJZiBubyBlbGVtZW50cyBtYXRjaCwgYW4gZXJyb3IgaXMgdGhyb3duLlxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZvciB0aGUgcm9vdCBlbGVtZW50IG9mIHRoZSBuZXcgYEhhcm5lc3NMb2FkZXJgXG4gICAqIEByZXR1cm4gQSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBlbGVtZW50IG1hdGNoaW5nIHRoZSBnaXZlbiBzZWxlY3Rvci5cbiAgICogQHRocm93cyBJZiBhIG1hdGNoaW5nIGVsZW1lbnQgY2FuJ3QgYmUgZm91bmQuXG4gICAqL1xuICBnZXRDaGlsZExvYWRlcihzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFsbCBlbGVtZW50cyB3aXRoIHRoZSBnaXZlbiBzZWxlY3RvciB1bmRlciB0aGUgY3VycmVudCBpbnN0YW5jZXMncyByb290IGVsZW1lbnQsXG4gICAqIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIGBIYXJuZXNzTG9hZGVyYHMsIG9uZSBmb3IgZWFjaCBtYXRjaGluZyBlbGVtZW50LCByb290ZWQgYXQgdGhhdFxuICAgKiBlbGVtZW50LlxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZvciB0aGUgcm9vdCBlbGVtZW50IG9mIHRoZSBuZXcgYEhhcm5lc3NMb2FkZXJgXG4gICAqIEByZXR1cm4gQSBsaXN0IG9mIGBIYXJuZXNzTG9hZGVyYHMsIG9uZSBmb3IgZWFjaCBtYXRjaGluZyBlbGVtZW50LCByb290ZWQgYXQgdGhhdCBlbGVtZW50LlxuICAgKi9cbiAgZ2V0QWxsQ2hpbGRMb2FkZXJzKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXJbXT47XG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGZvciBhbiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSB1bmRlciB0aGVcbiAgICogYEhhcm5lc3NMb2FkZXJgJ3Mgcm9vdCBlbGVtZW50LCBhbmQgcmV0dXJucyBhIGBDb21wb25lbnRIYXJuZXNzYCBmb3IgdGhhdCBpbnN0YW5jZS4gSWYgbXVsdGlwbGVcbiAgICogbWF0Y2hpbmcgY29tcG9uZW50cyBhcmUgZm91bmQsIGEgaGFybmVzcyBmb3IgdGhlIGZpcnN0IG9uZSBpcyByZXR1cm5lZC4gSWYgbm8gbWF0Y2hpbmdcbiAgICogY29tcG9uZW50IGlzIGZvdW5kLCBhbiBlcnJvciBpcyB0aHJvd24uXG4gICAqIEBwYXJhbSBxdWVyeSBBIHF1ZXJ5IGZvciBhIGhhcm5lc3MgdG8gY3JlYXRlXG4gICAqIEByZXR1cm4gQW4gaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIGhhcm5lc3MgdHlwZVxuICAgKiBAdGhyb3dzIElmIGEgbWF0Y2hpbmcgY29tcG9uZW50IGluc3RhbmNlIGNhbid0IGJlIGZvdW5kLlxuICAgKi9cbiAgZ2V0SGFybmVzczxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ocXVlcnk6IEhhcm5lc3NRdWVyeTxUPik6IFByb21pc2U8VD47XG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGZvciBhbiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSB1bmRlciB0aGVcbiAgICogYEhhcm5lc3NMb2FkZXJgJ3Mgcm9vdCBlbGVtZW50LCBhbmQgcmV0dXJucyBhIGBDb21wb25lbnRIYXJuZXNzYCBmb3IgdGhhdCBpbnN0YW5jZS4gSWYgbXVsdGlwbGVcbiAgICogbWF0Y2hpbmcgY29tcG9uZW50cyBhcmUgZm91bmQsIGEgaGFybmVzcyBmb3IgdGhlIGZpcnN0IG9uZSBpcyByZXR1cm5lZC4gSWYgbm8gbWF0Y2hpbmdcbiAgICogY29tcG9uZW50IGlzIGZvdW5kLCBudWxsIGlzIHJldHVybmVkLlxuICAgKiBAcGFyYW0gcXVlcnkgQSBxdWVyeSBmb3IgYSBoYXJuZXNzIHRvIGNyZWF0ZVxuICAgKiBAcmV0dXJuIEFuIGluc3RhbmNlIG9mIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUgKG9yIG51bGwgaWYgbm90IGZvdW5kKS5cbiAgICovXG4gIGdldEhhcm5lc3NPck51bGw8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFQgfCBudWxsPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGNvbXBvbmVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUgdW5kZXIgdGhlXG4gICAqIGBIYXJuZXNzTG9hZGVyYCdzIHJvb3QgZWxlbWVudCwgYW5kIHJldHVybnMgYSBsaXN0IGBDb21wb25lbnRIYXJuZXNzYCBmb3IgZWFjaCBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHF1ZXJ5IEEgcXVlcnkgZm9yIGEgaGFybmVzcyB0byBjcmVhdGVcbiAgICogQHJldHVybiBBIGxpc3QgaW5zdGFuY2VzIG9mIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUuXG4gICAqL1xuICBnZXRBbGxIYXJuZXNzZXM8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFRbXT47XG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGZvciBhbiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSB1bmRlciB0aGVcbiAgICogYEhhcm5lc3NMb2FkZXJgJ3Mgcm9vdCBlbGVtZW50LCBhbmQgcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBpZiBhbnkgd2VyZSBmb3VuZC5cbiAgICogQHBhcmFtIHF1ZXJ5IEEgcXVlcnkgZm9yIGEgaGFybmVzcyB0byBjcmVhdGVcbiAgICogQHJldHVybiBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiBhbiBpbnN0YW5jZSB3YXMgZm91bmQuXG4gICAqL1xuICBoYXNIYXJuZXNzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxib29sZWFuPjtcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgdXNlZCB0byBjcmVhdGUgYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb25zIHVzZWQgZmluZCBlbGVtZW50cyBhbmQgY29tcG9uZW50XG4gKiBoYXJuZXNzZXMuIFRoaXMgaW50ZXJmYWNlIGlzIHVzZWQgYnkgYENvbXBvbmVudEhhcm5lc3NgIGF1dGhvcnMgdG8gY3JlYXRlIGxvY2F0b3IgZnVuY3Rpb25zIGZvclxuICogdGhlaXIgYENvbXBvbmVudEhhcm5lc3NgIHN1YmNsYXNzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0b3JGYWN0b3J5IHtcbiAgLyoqIEdldHMgYSBsb2NhdG9yIGZhY3Rvcnkgcm9vdGVkIGF0IHRoZSBkb2N1bWVudCByb290LiAqL1xuICBkb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpOiBMb2NhdG9yRmFjdG9yeTtcblxuICAvKiogVGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAgYXMgYSBgVGVzdEVsZW1lbnRgLiAqL1xuICByb290RWxlbWVudDogVGVzdEVsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGEgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlXG4gICAqIG9yIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cbiAgICogICAgIHByZWRpY2F0ZS5cbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgdGhlXG4gICAqICAgZmlyc3QgZWxlbWVudCBvciBoYXJuZXNzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGVcbiAgICogICBgUHJvbWlzZWAgcmVqZWN0cy4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGEgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3JcbiAgICogICBlYWNoIHF1ZXJ5LlxuICAgKlxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYDpcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvcihEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBhIGBEaXZIYXJuZXNzYCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvcignZGl2JywgRGl2SGFybmVzcykoKWAgZ2V0cyBhIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3IoJ3NwYW4nKSgpYCB0aHJvd3MgYmVjYXVzZSB0aGUgYFByb21pc2VgIHJlamVjdHMuXG4gICAqL1xuICBsb2NhdG9yRm9yPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KFxuICAgIC4uLnF1ZXJpZXM6IFRcbiAgKTogQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+PjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYSBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VcbiAgICogb3IgZWxlbWVudCB1bmRlciB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YC5cbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXG4gICAqICAgICBnaXZlbiBjbGFzcy5cbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxuICAgKiAgICAgcHJlZGljYXRlLlxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciB0aGVcbiAgICogICBmaXJzdCBlbGVtZW50IG9yIGhhcm5lc3MgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHRoZVxuICAgKiAgIGBQcm9taXNlYCBpcyByZXNvbHZlZCB3aXRoIGBudWxsYC4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGEgdW5pb24gb2YgYWxsXG4gICAqICAgcmVzdWx0IHR5cGVzIGZvciBlYWNoIHF1ZXJ5IG9yIG51bGwuXG4gICAqXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgOlxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yT3B0aW9uYWwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYSBgRGl2SGFybmVzc2AgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JPcHRpb25hbCgnZGl2JywgRGl2SGFybmVzcykoKWAgZ2V0cyBhIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JPcHRpb25hbCgnc3BhbicpKClgIGdldHMgYG51bGxgLlxuICAgKi9cbiAgbG9jYXRvckZvck9wdGlvbmFsPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KFxuICAgIC4uLnF1ZXJpZXM6IFRcbiAgKTogQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+IHwgbnVsbD47XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXNcbiAgICogb3IgZWxlbWVudHMgdW5kZXIgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cbiAgICogICAgIHByZWRpY2F0ZS5cbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgYWxsXG4gICAqICAgZWxlbWVudHMgYW5kIGhhcm5lc3NlcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBhbiBlbGVtZW50IG1hdGNoZXMgbW9yZSB0aGFuXG4gICAqICAgb25lIGBDb21wb25lbnRIYXJuZXNzYCBjbGFzcywgdGhlIGxvY2F0b3IgZ2V0cyBhbiBpbnN0YW5jZSBvZiBlYWNoIGZvciB0aGUgc2FtZSBlbGVtZW50LiBJZlxuICAgKiAgIGFuIGVsZW1lbnQgbWF0Y2hlcyBtdWx0aXBsZSBgc3RyaW5nYCBzZWxlY3RvcnMsIG9ubHkgb25lIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgaXMgcmV0dXJuZWRcbiAgICogICBmb3IgdGhhdCBlbGVtZW50LiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBlbGVtZW50IGlzXG4gICAqICAgdGhlIHVuaW9uIG9mIGFsbCByZXN1bHQgdHlwZXMgZm9yIGVhY2ggcXVlcnkuXG4gICAqXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgIGFuZCBgSWRJc0QxSGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICcjZDEnYDpcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvckFsbChEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBgW1xuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxuICAgKiAgICAgVGVzdEVsZW1lbnQsIC8vIGZvciAjZDFcbiAgICogICAgIERpdkhhcm5lc3MsIC8vIGZvciAjZDJcbiAgICogICAgIFRlc3RFbGVtZW50IC8vIGZvciAjZDJcbiAgICogICBdYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yQWxsKCdkaXYnLCAnI2QxJykoKWAgZ2V0cyBgW1xuICAgKiAgICAgVGVzdEVsZW1lbnQsIC8vIGZvciAjZDFcbiAgICogICAgIFRlc3RFbGVtZW50IC8vIGZvciAjZDJcbiAgICogICBdYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yQWxsKERpdkhhcm5lc3MsIElkSXNEMUhhcm5lc3MpKClgIGdldHMgYFtcbiAgICogICAgIERpdkhhcm5lc3MsIC8vIGZvciAjZDFcbiAgICogICAgIElkSXNEMUhhcm5lc3MsIC8vIGZvciAjZDFcbiAgICogICAgIERpdkhhcm5lc3MgLy8gZm9yICNkMlxuICAgKiAgIF1gXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JBbGwoJ3NwYW4nKSgpYCBnZXRzIGBbXWAuXG4gICAqL1xuICBsb2NhdG9yRm9yQWxsPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KFxuICAgIC4uLnF1ZXJpZXM6IFRcbiAgKTogQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+W10+O1xuXG4gIC8qKiBAcmV0dXJuIEEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YC4gKi9cbiAgcm9vdEhhcm5lc3NMb2FkZXIoKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPjtcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzTG9hZGVyYCBpbnN0YW5jZSBmb3IgYW4gZWxlbWVudCB1bmRlciB0aGUgcm9vdCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQuXG4gICAqIEByZXR1cm4gQSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHRoZSBnaXZlbiBzZWxlY3Rvci5cbiAgICogQHRocm93cyBJZiBubyBtYXRjaGluZyBlbGVtZW50IGlzIGZvdW5kIGZvciB0aGUgZ2l2ZW4gc2VsZWN0b3IuXG4gICAqL1xuICBoYXJuZXNzTG9hZGVyRm9yKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+O1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NMb2FkZXJgIGluc3RhbmNlIGZvciBhbiBlbGVtZW50IHVuZGVyIHRoZSByb290IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YFxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZvciB0aGUgcm9vdCBlbGVtZW50LlxuICAgKiBAcmV0dXJuIEEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IsIG9yIG51bGwgaWZcbiAgICogICAgIG5vIG1hdGNoaW5nIGVsZW1lbnQgaXMgZm91bmQuXG4gICAqL1xuICBoYXJuZXNzTG9hZGVyRm9yT3B0aW9uYWwoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlciB8IG51bGw+O1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgbGlzdCBvZiBgSGFybmVzc0xvYWRlcmAgaW5zdGFuY2VzLCBvbmUgZm9yIGVhY2ggbWF0Y2hpbmcgZWxlbWVudC5cbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZWxlY3RvciBmb3IgdGhlIHJvb3QgZWxlbWVudC5cbiAgICogQHJldHVybiBBIGxpc3Qgb2YgYEhhcm5lc3NMb2FkZXJgLCBvbmUgcm9vdGVkIGF0IGVhY2ggZWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IuXG4gICAqL1xuICBoYXJuZXNzTG9hZGVyRm9yQWxsKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXJbXT47XG5cbiAgLyoqXG4gICAqIEZsdXNoZXMgY2hhbmdlIGRldGVjdGlvbiBhbmQgYXN5bmMgdGFza3MgY2FwdHVyZWQgaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICogSW4gbW9zdCBjYXNlcyBpdCBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeSB0byBjYWxsIHRoaXMgbWFudWFsbHkuIEhvd2V2ZXIsIHRoZXJlIG1heSBiZSBzb21lIGVkZ2VcbiAgICogY2FzZXMgd2hlcmUgaXQgaXMgbmVlZGVkIHRvIGZ1bGx5IGZsdXNoIGFuaW1hdGlvbiBldmVudHMuXG4gICAqL1xuICBmb3JjZVN0YWJpbGl6ZSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgYWxsIHNjaGVkdWxlZCBvciBydW5uaW5nIGFzeW5jIHRhc2tzIHRvIGNvbXBsZXRlLiBUaGlzIGFsbG93cyBoYXJuZXNzXG4gICAqIGF1dGhvcnMgdG8gd2FpdCBmb3IgYXN5bmMgdGFza3Mgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgKi9cbiAgd2FpdEZvclRhc2tzT3V0c2lkZUFuZ3VsYXIoKTogUHJvbWlzZTx2b2lkPjtcbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBjb21wb25lbnQgaGFybmVzc2VzIHRoYXQgYWxsIGNvbXBvbmVudCBoYXJuZXNzIGF1dGhvcnMgc2hvdWxkIGV4dGVuZC4gVGhpcyBiYXNlXG4gKiBjb21wb25lbnQgaGFybmVzcyBwcm92aWRlcyB0aGUgYmFzaWMgYWJpbGl0eSB0byBsb2NhdGUgZWxlbWVudCBhbmQgc3ViLWNvbXBvbmVudCBoYXJuZXNzLiBJdFxuICogc2hvdWxkIGJlIGluaGVyaXRlZCB3aGVuIGRlZmluaW5nIHVzZXIncyBvd24gaGFybmVzcy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudEhhcm5lc3Mge1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgbG9jYXRvckZhY3Rvcnk6IExvY2F0b3JGYWN0b3J5KSB7fVxuXG4gIC8qKiBHZXRzIGEgYFByb21pc2VgIGZvciB0aGUgYFRlc3RFbGVtZW50YCByZXByZXNlbnRpbmcgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgY29tcG9uZW50LiAqL1xuICBhc3luYyBob3N0KCk6IFByb21pc2U8VGVzdEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5yb290RWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgYExvY2F0b3JGYWN0b3J5YCBmb3IgdGhlIGRvY3VtZW50IHJvb3QgZWxlbWVudC4gVGhpcyBmYWN0b3J5IGNhbiBiZSB1c2VkIHRvIGNyZWF0ZVxuICAgKiBsb2NhdG9ycyBmb3IgZWxlbWVudHMgdGhhdCBhIGNvbXBvbmVudCBjcmVhdGVzIG91dHNpZGUgb2YgaXRzIG93biByb290IGVsZW1lbnQuIChlLmcuIGJ5XG4gICAqIGFwcGVuZGluZyB0byBkb2N1bWVudC5ib2R5KS5cbiAgICovXG4gIHByb3RlY3RlZCBkb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpOiBMb2NhdG9yRmFjdG9yeSB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZVxuICAgKiBvciBlbGVtZW50IHVuZGVyIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhpcyBgQ29tcG9uZW50SGFybmVzc2AuXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cbiAgICogICAgIHByZWRpY2F0ZS5cbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgdGhlXG4gICAqICAgZmlyc3QgZWxlbWVudCBvciBoYXJuZXNzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGVcbiAgICogICBgUHJvbWlzZWAgcmVqZWN0cy4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGEgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3JcbiAgICogICBlYWNoIHF1ZXJ5LlxuICAgKlxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYDpcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvcihEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBhIGBEaXZIYXJuZXNzYCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvcignZGl2JywgRGl2SGFybmVzcykoKWAgZ2V0cyBhIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3IoJ3NwYW4nKSgpYCB0aHJvd3MgYmVjYXVzZSB0aGUgYFByb21pc2VgIHJlamVjdHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgbG9jYXRvckZvcjxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPihcbiAgICAuLi5xdWVyaWVzOiBUXG4gICk6IEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPj4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LmxvY2F0b3JGb3IoLi4ucXVlcmllcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYSBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VcbiAgICogb3IgZWxlbWVudCB1bmRlciB0aGUgaG9zdCBlbGVtZW50IG9mIHRoaXMgYENvbXBvbmVudEhhcm5lc3NgLlxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcbiAgICogICAgIGdpdmVuIGNsYXNzLlxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXG4gICAqICAgICBwcmVkaWNhdGUuXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIHRoZVxuICAgKiAgIGZpcnN0IGVsZW1lbnQgb3IgaGFybmVzcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBubyBtYXRjaGVzIGFyZSBmb3VuZCwgdGhlXG4gICAqICAgYFByb21pc2VgIGlzIHJlc29sdmVkIHdpdGggYG51bGxgLiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYSB1bmlvbiBvZiBhbGxcbiAgICogICByZXN1bHQgdHlwZXMgZm9yIGVhY2ggcXVlcnkgb3IgbnVsbC5cbiAgICpcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2A6XG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JPcHRpb25hbChEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBhIGBEaXZIYXJuZXNzYCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvck9wdGlvbmFsKCdkaXYnLCBEaXZIYXJuZXNzKSgpYCBnZXRzIGEgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvck9wdGlvbmFsKCdzcGFuJykoKWAgZ2V0cyBgbnVsbGAuXG4gICAqL1xuICBwcm90ZWN0ZWQgbG9jYXRvckZvck9wdGlvbmFsPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KFxuICAgIC4uLnF1ZXJpZXM6IFRcbiAgKTogQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+IHwgbnVsbD4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LmxvY2F0b3JGb3JPcHRpb25hbCguLi5xdWVyaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzXG4gICAqIG9yIGVsZW1lbnRzIHVuZGVyIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhpcyBgQ29tcG9uZW50SGFybmVzc2AuXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cbiAgICogICAgIHByZWRpY2F0ZS5cbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgYWxsXG4gICAqICAgZWxlbWVudHMgYW5kIGhhcm5lc3NlcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBhbiBlbGVtZW50IG1hdGNoZXMgbW9yZSB0aGFuXG4gICAqICAgb25lIGBDb21wb25lbnRIYXJuZXNzYCBjbGFzcywgdGhlIGxvY2F0b3IgZ2V0cyBhbiBpbnN0YW5jZSBvZiBlYWNoIGZvciB0aGUgc2FtZSBlbGVtZW50LiBJZlxuICAgKiAgIGFuIGVsZW1lbnQgbWF0Y2hlcyBtdWx0aXBsZSBgc3RyaW5nYCBzZWxlY3RvcnMsIG9ubHkgb25lIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgaXMgcmV0dXJuZWRcbiAgICogICBmb3IgdGhhdCBlbGVtZW50LiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBlbGVtZW50IGlzXG4gICAqICAgdGhlIHVuaW9uIG9mIGFsbCByZXN1bHQgdHlwZXMgZm9yIGVhY2ggcXVlcnkuXG4gICAqXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgIGFuZCBgSWRJc0QxSGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICcjZDEnYDpcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvckFsbChEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBgW1xuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxuICAgKiAgICAgVGVzdEVsZW1lbnQsIC8vIGZvciAjZDFcbiAgICogICAgIERpdkhhcm5lc3MsIC8vIGZvciAjZDJcbiAgICogICAgIFRlc3RFbGVtZW50IC8vIGZvciAjZDJcbiAgICogICBdYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yQWxsKCdkaXYnLCAnI2QxJykoKWAgZ2V0cyBgW1xuICAgKiAgICAgVGVzdEVsZW1lbnQsIC8vIGZvciAjZDFcbiAgICogICAgIFRlc3RFbGVtZW50IC8vIGZvciAjZDJcbiAgICogICBdYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yQWxsKERpdkhhcm5lc3MsIElkSXNEMUhhcm5lc3MpKClgIGdldHMgYFtcbiAgICogICAgIERpdkhhcm5lc3MsIC8vIGZvciAjZDFcbiAgICogICAgIElkSXNEMUhhcm5lc3MsIC8vIGZvciAjZDFcbiAgICogICAgIERpdkhhcm5lc3MgLy8gZm9yICNkMlxuICAgKiAgIF1gXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JBbGwoJ3NwYW4nKSgpYCBnZXRzIGBbXWAuXG4gICAqL1xuICBwcm90ZWN0ZWQgbG9jYXRvckZvckFsbDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPihcbiAgICAuLi5xdWVyaWVzOiBUXG4gICk6IEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPltdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkubG9jYXRvckZvckFsbCguLi5xdWVyaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGbHVzaGVzIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGFzeW5jIHRhc2tzIGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqIEluIG1vc3QgY2FzZXMgaXQgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnkgdG8gY2FsbCB0aGlzIG1hbnVhbGx5LiBIb3dldmVyLCB0aGVyZSBtYXkgYmUgc29tZSBlZGdlXG4gICAqIGNhc2VzIHdoZXJlIGl0IGlzIG5lZWRlZCB0byBmdWxseSBmbHVzaCBhbmltYXRpb24gZXZlbnRzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGZvcmNlU3RhYmlsaXplKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LmZvcmNlU3RhYmlsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIGFsbCBzY2hlZHVsZWQgb3IgcnVubmluZyBhc3luYyB0YXNrcyB0byBjb21wbGV0ZS4gVGhpcyBhbGxvd3MgaGFybmVzc1xuICAgKiBhdXRob3JzIHRvIHdhaXQgZm9yIGFzeW5jIHRhc2tzIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yVGFza3NPdXRzaWRlQW5ndWxhcigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS53YWl0Rm9yVGFza3NPdXRzaWRlQW5ndWxhcigpO1xuICB9XG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY29tcG9uZW50IGhhcm5lc3NlcyB0aGF0IGF1dGhvcnMgc2hvdWxkIGV4dGVuZCBpZiB0aGV5IGFudGljaXBhdGUgdGhhdCBjb25zdW1lcnNcbiAqIG9mIHRoZSBoYXJuZXNzIG1heSB3YW50IHRvIGFjY2VzcyBvdGhlciBoYXJuZXNzZXMgd2l0aGluIHRoZSBgPG5nLWNvbnRlbnQ+YCBvZiB0aGUgY29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8UyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz5cbiAgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzXG4gIGltcGxlbWVudHMgSGFybmVzc0xvYWRlclxue1xuICBhc3luYyBnZXRDaGlsZExvYWRlcihzZWxlY3RvcjogUyk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5nZXRDaGlsZExvYWRlcihzZWxlY3Rvcik7XG4gIH1cblxuICBhc3luYyBnZXRBbGxDaGlsZExvYWRlcnMoc2VsZWN0b3I6IFMpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXJbXT4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5nZXRBbGxDaGlsZExvYWRlcnMoc2VsZWN0b3IpO1xuICB9XG5cbiAgYXN5bmMgZ2V0SGFybmVzczxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ocXVlcnk6IEhhcm5lc3NRdWVyeTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5nZXRIYXJuZXNzKHF1ZXJ5KTtcbiAgfVxuXG4gIGFzeW5jIGdldEhhcm5lc3NPck51bGw8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFQgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCkpLmdldEhhcm5lc3NPck51bGwocXVlcnkpO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWxsSGFybmVzc2VzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUW10+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuZ2V0QWxsSGFybmVzc2VzKHF1ZXJ5KTtcbiAgfVxuXG4gIGFzeW5jIGhhc0hhcm5lc3M8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuaGFzSGFybmVzcyhxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcm9vdCBoYXJuZXNzIGxvYWRlciBmcm9tIHdoaWNoIHRvIHN0YXJ0XG4gICAqIHNlYXJjaGluZyBmb3IgY29udGVudCBjb250YWluZWQgYnkgdGhpcyBoYXJuZXNzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGdldFJvb3RIYXJuZXNzTG9hZGVyKCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LnJvb3RIYXJuZXNzTG9hZGVyKCk7XG4gIH1cbn1cblxuLyoqIENvbnN0cnVjdG9yIGZvciBhIENvbXBvbmVudEhhcm5lc3Mgc3ViY2xhc3MuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ge1xuICBuZXcgKGxvY2F0b3JGYWN0b3J5OiBMb2NhdG9yRmFjdG9yeSk6IFQ7XG5cbiAgLyoqXG4gICAqIGBDb21wb25lbnRIYXJuZXNzYCBzdWJjbGFzc2VzIG11c3Qgc3BlY2lmeSBhIHN0YXRpYyBgaG9zdFNlbGVjdG9yYCBwcm9wZXJ0eSB0aGF0IGlzIHVzZWQgdG9cbiAgICogZmluZCB0aGUgaG9zdCBlbGVtZW50IGZvciB0aGUgY29ycmVzcG9uZGluZyBjb21wb25lbnQuIFRoaXMgcHJvcGVydHkgc2hvdWxkIG1hdGNoIHRoZSBzZWxlY3RvclxuICAgKiBmb3IgdGhlIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKi9cbiAgaG9zdFNlbGVjdG9yOiBzdHJpbmc7XG59XG5cbi8qKiBBIHNldCBvZiBjcml0ZXJpYSB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbHRlciBhIGxpc3Qgb2YgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZUhhcm5lc3NGaWx0ZXJzIHtcbiAgLyoqIE9ubHkgZmluZCBpbnN0YW5jZXMgd2hvc2UgaG9zdCBlbGVtZW50IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yLiAqL1xuICBzZWxlY3Rvcj86IHN0cmluZztcbiAgLyoqIE9ubHkgZmluZCBpbnN0YW5jZXMgdGhhdCBhcmUgbmVzdGVkIHVuZGVyIGFuIGVsZW1lbnQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IuICovXG4gIGFuY2VzdG9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgY2xhc3MgdXNlZCB0byBhc3NvY2lhdGUgYSBDb21wb25lbnRIYXJuZXNzIGNsYXNzIHdpdGggcHJlZGljYXRlcyBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICogZmlsdGVyIGluc3RhbmNlcyBvZiB0aGUgY2xhc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBIYXJuZXNzUHJlZGljYXRlPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPiB7XG4gIHByaXZhdGUgX3ByZWRpY2F0ZXM6IEFzeW5jUHJlZGljYXRlPFQ+W10gPSBbXTtcbiAgcHJpdmF0ZSBfZGVzY3JpcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9hbmNlc3Rvcjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBoYXJuZXNzVHlwZTogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LCBvcHRpb25zOiBCYXNlSGFybmVzc0ZpbHRlcnMpIHtcbiAgICB0aGlzLl9hZGRCYXNlT3B0aW9ucyhvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCBudWxsYWJsZSBzdHJpbmcgdmFsdWUgbWF0Y2hlcyB0aGUgZ2l2ZW4gcGF0dGVybi5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBudWxsYWJsZSBzdHJpbmcgdmFsdWUgdG8gY2hlY2ssIG9yIGEgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlXG4gICAqICAgbnVsbGFibGUgc3RyaW5nIHZhbHVlLlxuICAgKiBAcGFyYW0gcGF0dGVybiBUaGUgcGF0dGVybiB0aGUgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gbWF0Y2guIElmIGBwYXR0ZXJuYCBpcyBhIHN0cmluZyxcbiAgICogICBgdmFsdWVgIGlzIGV4cGVjdGVkIHRvIG1hdGNoIGV4YWN0bHkuIElmIGBwYXR0ZXJuYCBpcyBhIHJlZ2V4LCBhIHBhcnRpYWwgbWF0Y2ggaXNcbiAgICogICBhbGxvd2VkLiBJZiBgcGF0dGVybmAgaXMgYG51bGxgLCB0aGUgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYG51bGxgLlxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHZhbHVlIG1hdGNoZXMgdGhlIHBhdHRlcm4uXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgc3RyaW5nTWF0Y2hlcyhcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IFByb21pc2U8c3RyaW5nIHwgbnVsbD4sXG4gICAgcGF0dGVybjogc3RyaW5nIHwgUmVnRXhwIHwgbnVsbCxcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFsdWUgPSBhd2FpdCB2YWx1ZTtcbiAgICBpZiAocGF0dGVybiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBwYXR0ZXJuID09PSAnc3RyaW5nJyA/IHZhbHVlID09PSBwYXR0ZXJuIDogcGF0dGVybi50ZXN0KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcHJlZGljYXRlIGZ1bmN0aW9uIHRvIGJlIHJ1biBhZ2FpbnN0IGNhbmRpZGF0ZSBoYXJuZXNzZXMuXG4gICAqIEBwYXJhbSBkZXNjcmlwdGlvbiBBIGRlc2NyaXB0aW9uIG9mIHRoaXMgcHJlZGljYXRlIHRoYXQgbWF5IGJlIHVzZWQgaW4gZXJyb3IgbWVzc2FnZXMuXG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgQW4gYXN5bmMgcHJlZGljYXRlIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHRoaXMgKGZvciBtZXRob2QgY2hhaW5pbmcpLlxuICAgKi9cbiAgYWRkKGRlc2NyaXB0aW9uOiBzdHJpbmcsIHByZWRpY2F0ZTogQXN5bmNQcmVkaWNhdGU8VD4pIHtcbiAgICB0aGlzLl9kZXNjcmlwdGlvbnMucHVzaChkZXNjcmlwdGlvbik7XG4gICAgdGhpcy5fcHJlZGljYXRlcy5wdXNoKHByZWRpY2F0ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHByZWRpY2F0ZSBmdW5jdGlvbiB0aGF0IGRlcGVuZHMgb24gYW4gb3B0aW9uIHZhbHVlIHRvIGJlIHJ1biBhZ2FpbnN0IGNhbmRpZGF0ZVxuICAgKiBoYXJuZXNzZXMuIElmIHRoZSBvcHRpb24gdmFsdWUgaXMgdW5kZWZpbmVkLCB0aGUgcHJlZGljYXRlIHdpbGwgYmUgaWdub3JlZC5cbiAgICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgdGhlIG9wdGlvbiAobWF5IGJlIHVzZWQgaW4gZXJyb3IgbWVzc2FnZXMpLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdmFsdWUuXG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0byBydW4gaWYgdGhlIG9wdGlvbiB2YWx1ZSBpcyBub3QgdW5kZWZpbmVkLlxuICAgKiBAcmV0dXJuIHRoaXMgKGZvciBtZXRob2QgY2hhaW5pbmcpLlxuICAgKi9cbiAgYWRkT3B0aW9uPE8+KG5hbWU6IHN0cmluZywgb3B0aW9uOiBPIHwgdW5kZWZpbmVkLCBwcmVkaWNhdGU6IEFzeW5jT3B0aW9uUHJlZGljYXRlPFQsIE8+KSB7XG4gICAgaWYgKG9wdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmFkZChgJHtuYW1lfSA9ICR7X3ZhbHVlQXNTdHJpbmcob3B0aW9uKX1gLCBpdGVtID0+IHByZWRpY2F0ZShpdGVtLCBvcHRpb24pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRmlsdGVycyBhIGxpc3Qgb2YgaGFybmVzc2VzIG9uIHRoaXMgcHJlZGljYXRlLlxuICAgKiBAcGFyYW0gaGFybmVzc2VzIFRoZSBsaXN0IG9mIGhhcm5lc3NlcyB0byBmaWx0ZXIuXG4gICAqIEByZXR1cm4gQSBsaXN0IG9mIGhhcm5lc3NlcyB0aGF0IHNhdGlzZnkgdGhpcyBwcmVkaWNhdGUuXG4gICAqL1xuICBhc3luYyBmaWx0ZXIoaGFybmVzc2VzOiBUW10pOiBQcm9taXNlPFRbXT4ge1xuICAgIGlmIChoYXJuZXNzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBoYXJuZXNzZXMubWFwKGggPT4gdGhpcy5ldmFsdWF0ZShoKSkpO1xuICAgIHJldHVybiBoYXJuZXNzZXMuZmlsdGVyKChfLCBpKSA9PiByZXN1bHRzW2ldKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgd2hldGhlciB0aGUgZ2l2ZW4gaGFybmVzcyBzYXRpc2ZpZXMgdGhpcyBwcmVkaWNhdGUuXG4gICAqIEBwYXJhbSBoYXJuZXNzIFRoZSBoYXJuZXNzIHRvIGNoZWNrXG4gICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdHJ1ZSBpZiB0aGUgaGFybmVzcyBzYXRpc2ZpZXMgdGhpcyBwcmVkaWNhdGUsXG4gICAqICAgYW5kIHJlc29sdmVzIHRvIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGFzeW5jIGV2YWx1YXRlKGhhcm5lc3M6IFQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gdGhpcy5fcHJlZGljYXRlcy5tYXAocCA9PiBwKGhhcm5lc3MpKSk7XG4gICAgcmV0dXJuIHJlc3VsdHMucmVkdWNlKChjb21iaW5lZCwgY3VycmVudCkgPT4gY29tYmluZWQgJiYgY3VycmVudCwgdHJ1ZSk7XG4gIH1cblxuICAvKiogR2V0cyBhIGRlc2NyaXB0aW9uIG9mIHRoaXMgcHJlZGljYXRlIGZvciB1c2UgaW4gZXJyb3IgbWVzc2FnZXMuICovXG4gIGdldERlc2NyaXB0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbnMuam9pbignLCAnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzZWxlY3RvciB1c2VkIHRvIGZpbmQgY2FuZGlkYXRlIGVsZW1lbnRzLiAqL1xuICBnZXRTZWxlY3RvcigpIHtcbiAgICAvLyBXZSBkb24ndCBoYXZlIHRvIGdvIHRocm91Z2ggdGhlIGV4dHJhIHRyb3VibGUgaWYgdGhlcmUgYXJlIG5vIGFuY2VzdG9ycy5cbiAgICBpZiAoIXRoaXMuX2FuY2VzdG9yKSB7XG4gICAgICByZXR1cm4gKHRoaXMuaGFybmVzc1R5cGUuaG9zdFNlbGVjdG9yIHx8ICcnKS50cmltKCk7XG4gICAgfVxuXG4gICAgY29uc3QgW2FuY2VzdG9ycywgYW5jZXN0b3JQbGFjZWhvbGRlcnNdID0gX3NwbGl0QW5kRXNjYXBlU2VsZWN0b3IodGhpcy5fYW5jZXN0b3IpO1xuICAgIGNvbnN0IFtzZWxlY3RvcnMsIHNlbGVjdG9yUGxhY2Vob2xkZXJzXSA9IF9zcGxpdEFuZEVzY2FwZVNlbGVjdG9yKFxuICAgICAgdGhpcy5oYXJuZXNzVHlwZS5ob3N0U2VsZWN0b3IgfHwgJycsXG4gICAgKTtcbiAgICBjb25zdCByZXN1bHQ6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBXZSBoYXZlIHRvIGFkZCB0aGUgYW5jZXN0b3IgdG8gZWFjaCBwYXJ0IG9mIHRoZSBob3N0IGNvbXBvdW5kIHNlbGVjdG9yLCBvdGhlcndpc2Ugd2UgY2FuIGdldFxuICAgIC8vIGluY29ycmVjdCByZXN1bHRzLiBFLmcuIGAuYW5jZXN0b3IgLmEsIC5hbmNlc3RvciAuYmAgdnMgYC5hbmNlc3RvciAuYSwgLmJgLlxuICAgIGFuY2VzdG9ycy5mb3JFYWNoKGVzY2FwZWRBbmNlc3RvciA9PiB7XG4gICAgICBjb25zdCBhbmNlc3RvciA9IF9yZXN0b3JlU2VsZWN0b3IoZXNjYXBlZEFuY2VzdG9yLCBhbmNlc3RvclBsYWNlaG9sZGVycyk7XG4gICAgICByZXR1cm4gc2VsZWN0b3JzLmZvckVhY2goZXNjYXBlZFNlbGVjdG9yID0+XG4gICAgICAgIHJlc3VsdC5wdXNoKGAke2FuY2VzdG9yfSAke19yZXN0b3JlU2VsZWN0b3IoZXNjYXBlZFNlbGVjdG9yLCBzZWxlY3RvclBsYWNlaG9sZGVycyl9YCksXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKCcsICcpO1xuICB9XG5cbiAgLyoqIEFkZHMgYmFzZSBvcHRpb25zIGNvbW1vbiB0byBhbGwgaGFybmVzcyB0eXBlcy4gKi9cbiAgcHJpdmF0ZSBfYWRkQmFzZU9wdGlvbnMob3B0aW9uczogQmFzZUhhcm5lc3NGaWx0ZXJzKSB7XG4gICAgdGhpcy5fYW5jZXN0b3IgPSBvcHRpb25zLmFuY2VzdG9yIHx8ICcnO1xuICAgIGlmICh0aGlzLl9hbmNlc3Rvcikge1xuICAgICAgdGhpcy5fZGVzY3JpcHRpb25zLnB1c2goYGhhcyBhbmNlc3RvciBtYXRjaGluZyBzZWxlY3RvciBcIiR7dGhpcy5fYW5jZXN0b3J9XCJgKTtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yO1xuICAgIGlmIChzZWxlY3RvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmFkZChgaG9zdCBtYXRjaGVzIHNlbGVjdG9yIFwiJHtzZWxlY3Rvcn1cImAsIGFzeW5jIGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4gKGF3YWl0IGl0ZW0uaG9zdCgpKS5tYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBSZXByZXNlbnQgYSB2YWx1ZSBhcyBhIHN0cmluZyBmb3IgdGhlIHB1cnBvc2Ugb2YgbG9nZ2luZy4gKi9cbmZ1bmN0aW9uIF92YWx1ZUFzU3RyaW5nKHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gYEpTT04uc3RyaW5naWZ5YCBkb2Vzbid0IGhhbmRsZSBSZWdFeHAgcHJvcGVybHksIHNvIHdlIG5lZWQgYSBjdXN0b20gcmVwbGFjZXIuXG4gICAgLy8gVXNlIGEgY2hhcmFjdGVyIHRoYXQgaXMgdW5saWtlbHkgdG8gYXBwZWFyIGluIHJlYWwgc3RyaW5ncyB0byBkZW5vdGUgdGhlIHN0YXJ0IGFuZCBlbmQgb2ZcbiAgICAvLyB0aGUgcmVnZXguIFRoaXMgYWxsb3dzIHVzIHRvIHN0cmlwIG91dCB0aGUgZXh0cmEgcXVvdGVzIGFyb3VuZCB0aGUgdmFsdWUgYWRkZWQgYnlcbiAgICAvLyBgSlNPTi5zdHJpbmdpZnlgLiBBbHNvIGRvIGN1c3RvbSBlc2NhcGluZyBvbiBgXCJgIGNoYXJhY3RlcnMgdG8gcHJldmVudCBgSlNPTi5zdHJpbmdpZnlgXG4gICAgLy8gZnJvbSBlc2NhcGluZyB0aGVtIGFzIGlmIHRoZXkgd2VyZSBwYXJ0IG9mIGEgc3RyaW5nLlxuICAgIGNvbnN0IHN0cmluZ2lmaWVkVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgKF8sIHYpID0+XG4gICAgICB2IGluc3RhbmNlb2YgUmVnRXhwXG4gICAgICAgID8gYOKXrE1BVF9SRV9FU0NBUEXil6wke3YudG9TdHJpbmcoKS5yZXBsYWNlKC9cIi9nLCAn4pesTUFUX1JFX0VTQ0FQReKXrCcpfeKXrE1BVF9SRV9FU0NBUEXil6xgXG4gICAgICAgIDogdixcbiAgICApO1xuICAgIC8vIFN0cmlwIG91dCB0aGUgZXh0cmEgcXVvdGVzIGFyb3VuZCByZWdleGVzIGFuZCBwdXQgYmFjayB0aGUgbWFudWFsbHkgZXNjYXBlZCBgXCJgIGNoYXJhY3RlcnMuXG4gICAgcmV0dXJuIHN0cmluZ2lmaWVkVmFsdWVcbiAgICAgIC5yZXBsYWNlKC9cIuKXrE1BVF9SRV9FU0NBUEXil6x84pesTUFUX1JFX0VTQ0FQReKXrFwiL2csICcnKVxuICAgICAgLnJlcGxhY2UoL+KXrE1BVF9SRV9FU0NBUEXil6wvZywgJ1wiJyk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIGBKU09OLnN0cmluZ2lmeWAgd2lsbCB0aHJvdyBpZiB0aGUgb2JqZWN0IGlzIGN5Y2xpY2FsLFxuICAgIC8vIGluIHRoaXMgY2FzZSB0aGUgYmVzdCB3ZSBjYW4gZG8gaXMgcmVwb3J0IHRoZSB2YWx1ZSBhcyBgey4uLn1gLlxuICAgIHJldHVybiAney4uLn0nO1xuICB9XG59XG5cbi8qKlxuICogU3BsaXRzIHVwIGEgY29tcG91bmQgc2VsZWN0b3IgaW50byBpdHMgcGFydHMgYW5kIGVzY2FwZXMgYW55IHF1b3RlZCBjb250ZW50LiBUaGUgcXVvdGVkIGNvbnRlbnRcbiAqIGhhcyB0byBiZSBlc2NhcGVkLCBiZWNhdXNlIGl0IGNhbiBjb250YWluIGNvbW1hcyB3aGljaCB3aWxsIHRocm93IHRocm93IHVzIG9mZiB3aGVuIHRyeWluZyB0b1xuICogc3BsaXQgaXQuXG4gKiBAcGFyYW0gc2VsZWN0b3IgU2VsZWN0b3IgdG8gYmUgc3BsaXQuXG4gKiBAcmV0dXJucyBUaGUgZXNjYXBlZCBzdHJpbmcgd2hlcmUgYW55IHF1b3RlZCBjb250ZW50IGlzIHJlcGxhY2VkIHdpdGggYSBwbGFjZWhvbGRlci4gRS5nLlxuICogYFtmb289XCJiYXJcIl1gIHR1cm5zIGludG8gYFtmb289X19jZGtQbGFjZWhvbGRlci0wX19dYC4gVXNlIGBfcmVzdG9yZVNlbGVjdG9yYCB0byByZXN0b3JlXG4gKiB0aGUgcGxhY2Vob2xkZXJzLlxuICovXG5mdW5jdGlvbiBfc3BsaXRBbmRFc2NhcGVTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogW3BhcnRzOiBzdHJpbmdbXSwgcGxhY2Vob2xkZXJzOiBzdHJpbmdbXV0ge1xuICBjb25zdCBwbGFjZWhvbGRlcnM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gTm90ZSB0aGF0IHRoZSByZWdleCBkb2Vzbid0IGFjY291bnQgZm9yIG5lc3RlZCBxdW90ZXMgc28gc29tZXRoaW5nIGxpa2UgYFwiYWInY2QnZVwiYCB3aWxsIGJlXG4gIC8vIGNvbnNpZGVyZWQgYXMgdHdvIGJsb2Nrcy4gSXQncyBhIGJpdCBvZiBhbiBlZGdlIGNhc2UsIGJ1dCBpZiB3ZSBmaW5kIHRoYXQgaXQncyBhIHByb2JsZW0sXG4gIC8vIHdlIGNhbiBtYWtlIGl0IGEgYml0IHNtYXJ0ZXIgdXNpbmcgYSBsb29wLiBVc2UgdGhpcyBmb3Igbm93IHNpbmNlIGl0J3MgbW9yZSByZWFkYWJsZSBhbmRcbiAgLy8gY29tcGFjdC4gTW9yZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbjpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iL2JkMzRiYzllODlmMThhL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zaGFkb3dfY3NzLnRzI0w2NTVcbiAgY29uc3QgcmVzdWx0ID0gc2VsZWN0b3IucmVwbGFjZSgvKFtcIiddW15bXCInXSpbXCInXSkvZywgKF8sIGtlZXApID0+IHtcbiAgICBjb25zdCByZXBsYWNlQnkgPSBgX19jZGtQbGFjZWhvbGRlci0ke3BsYWNlaG9sZGVycy5sZW5ndGh9X19gO1xuICAgIHBsYWNlaG9sZGVycy5wdXNoKGtlZXApO1xuICAgIHJldHVybiByZXBsYWNlQnk7XG4gIH0pO1xuXG4gIHJldHVybiBbcmVzdWx0LnNwbGl0KCcsJykubWFwKHBhcnQgPT4gcGFydC50cmltKCkpLCBwbGFjZWhvbGRlcnNdO1xufVxuXG4vKiogUmVzdG9yZXMgYSBzZWxlY3RvciB3aG9zZSBjb250ZW50IHdhcyBlc2NhcGVkIGluIGBfc3BsaXRBbmRFc2NhcGVTZWxlY3RvcmAuICovXG5mdW5jdGlvbiBfcmVzdG9yZVNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcsIHBsYWNlaG9sZGVyczogc3RyaW5nW10pOiBzdHJpbmcge1xuICByZXR1cm4gc2VsZWN0b3IucmVwbGFjZSgvX19jZGtQbGFjZWhvbGRlci0oXFxkKylfXy9nLCAoXywgaW5kZXgpID0+IHBsYWNlaG9sZGVyc1sraW5kZXhdKTtcbn1cbiJdfQ==