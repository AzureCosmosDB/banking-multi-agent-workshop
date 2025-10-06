/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// This file contains the `_computeAriaAccessibleName` function, which computes what the *expected*
// ARIA accessible name would be for a given element. Implements a subset of ARIA specification
// [Accessible Name and Description Computation 1.2](https://www.w3.org/TR/accname-1.2/).
//
// Specification accname-1.2 can be summarized by returning the result of the first method
// available.
//
//  1. `aria-labelledby` attribute
//     ```
//       <!-- example using aria-labelledby-->
//       <label id='label-id'>Start Date</label>
//       <input aria-labelledby='label-id'/>
//     ```
//  2. `aria-label` attribute (e.g. `<input aria-label="Departure"/>`)
//  3. Label with `for`/`id`
//     ```
//       <!-- example using for/id -->
//       <label for="current-node">Label</label>
//       <input id="current-node"/>
//     ```
//  4. `placeholder` attribute (e.g. `<input placeholder="06/03/1990"/>`)
//  5. `title` attribute (e.g. `<input title="Check-In"/>`)
//  6. text content
//     ```
//       <!-- example using text content -->
//       <label for="current-node"><span>Departure</span> Date</label>
//       <input id="current-node"/>
//     ```
/**
 * Computes the *expected* ARIA accessible name for argument element based on [accname-1.2
 * specification](https://www.w3.org/TR/accname-1.2/). Implements a subset of accname-1.2,
 * and should only be used for the Datepicker's specific use case.
 *
 * Intended use:
 * This is not a general use implementation. Only implements the parts of accname-1.2 that are
 * required for the Datepicker's specific use case. This function is not intended for any other
 * use.
 *
 * Limitations:
 *  - Only covers the needs of `matStartDate` and `matEndDate`. Does not support other use cases.
 *  - See NOTES's in implementation for specific details on what parts of the accname-1.2
 *  specification are not implemented.
 *
 *  @param element {HTMLInputElement} native &lt;input/&gt; element of `matStartDate` or
 *  `matEndDate` component. Corresponds to the 'Root Element' from accname-1.2
 *
 *  @return expected ARIA accessible name of argument &lt;input/&gt;
 */
export function _computeAriaAccessibleName(element) {
    return _computeAriaAccessibleNameInternal(element, true);
}
/**
 * Determine if argument node is an Element based on `nodeType` property. This function is safe to
 * use with server-side rendering.
 */
function ssrSafeIsElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
/**
 * Determine if argument node is an HTMLInputElement based on `nodeName` property. This funciton is
 * safe to use with server-side rendering.
 */
function ssrSafeIsHTMLInputElement(node) {
    return node.nodeName === 'INPUT';
}
/**
 * Determine if argument node is an HTMLTextAreaElement based on `nodeName` property. This
 * funciton is safe to use with server-side rendering.
 */
function ssrSafeIsHTMLTextAreaElement(node) {
    return node.nodeName === 'TEXTAREA';
}
/**
 * Calculate the expected ARIA accessible name for given DOM Node. Given DOM Node may be either the
 * "Root node" passed to `_computeAriaAccessibleName` or "Current node" as result of recursion.
 *
 * @return the accessible name of argument DOM Node
 *
 * @param currentNode node to determine accessible name of
 * @param isDirectlyReferenced true if `currentNode` is the root node to calculate ARIA accessible
 * name of. False if it is a result of recursion.
 */
function _computeAriaAccessibleNameInternal(currentNode, isDirectlyReferenced) {
    // NOTE: this differs from accname-1.2 specification.
    //  - Does not implement Step 1. of accname-1.2: '''If `currentNode`'s role prohibits naming,
    //    return the empty string ("")'''.
    //  - Does not implement Step 2.A. of accname-1.2: '''if current node is hidden and not directly
    //    referenced by aria-labelledby... return the empty string.'''
    // acc-name-1.2 Step 2.B.: aria-labelledby
    if (ssrSafeIsElement(currentNode) && isDirectlyReferenced) {
        const labelledbyIds = currentNode.getAttribute?.('aria-labelledby')?.split(/\s+/g) || [];
        const validIdRefs = labelledbyIds.reduce((validIds, id) => {
            const elem = document.getElementById(id);
            if (elem) {
                validIds.push(elem);
            }
            return validIds;
        }, []);
        if (validIdRefs.length) {
            return validIdRefs
                .map(idRef => {
                return _computeAriaAccessibleNameInternal(idRef, false);
            })
                .join(' ');
        }
    }
    // acc-name-1.2 Step 2.C.: aria-label
    if (ssrSafeIsElement(currentNode)) {
        const ariaLabel = currentNode.getAttribute('aria-label')?.trim();
        if (ariaLabel) {
            return ariaLabel;
        }
    }
    // acc-name-1.2 Step 2.D. attribute or element that defines a text alternative
    //
    // NOTE: this differs from accname-1.2 specification.
    // Only implements Step 2.D. for `<label>`,`<input/>`, and `<textarea/>` element. Does not
    // implement other elements that have an attribute or element that defines a text alternative.
    if (ssrSafeIsHTMLInputElement(currentNode) || ssrSafeIsHTMLTextAreaElement(currentNode)) {
        // use label with a `for` attribute referencing the current node
        if (currentNode.labels?.length) {
            return Array.from(currentNode.labels)
                .map(x => _computeAriaAccessibleNameInternal(x, false))
                .join(' ');
        }
        // use placeholder if available
        const placeholder = currentNode.getAttribute('placeholder')?.trim();
        if (placeholder) {
            return placeholder;
        }
        // use title if available
        const title = currentNode.getAttribute('title')?.trim();
        if (title) {
            return title;
        }
    }
    // NOTE: this differs from accname-1.2 specification.
    //  - does not implement acc-name-1.2 Step 2.E.: '''if the current node is a control embedded
    //     within the label... then include the embedded control as part of the text alternative in
    //     the following manner...'''. Step 2E applies to embedded controls such as textbox, listbox,
    //     range, etc.
    //  - does not implement acc-name-1.2 step 2.F.: check that '''role allows name from content''',
    //    which applies to `currentNode` and its children.
    //  - does not implement acc-name-1.2 Step 2.F.ii.: '''Check for CSS generated textual content'''
    //    (e.g. :before and :after).
    //  - does not implement acc-name-1.2 Step 2.I.: '''if the current node has a Tooltip attribute,
    //    return its value'''
    // Return text content with whitespace collapsed into a single space character. Accomplish
    // acc-name-1.2 steps 2F, 2G, and 2H.
    return (currentNode.textContent || '').replace(/\s+/g, ' ').trim();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpYS1hY2Nlc3NpYmxlLW5hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9hcmlhLWFjY2Vzc2libGUtbmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxtR0FBbUc7QUFDbkcsK0ZBQStGO0FBQy9GLHlGQUF5RjtBQUN6RixFQUFFO0FBQ0YsMEZBQTBGO0FBQzFGLGFBQWE7QUFDYixFQUFFO0FBQ0Ysa0NBQWtDO0FBQ2xDLFVBQVU7QUFDViw4Q0FBOEM7QUFDOUMsZ0RBQWdEO0FBQ2hELDRDQUE0QztBQUM1QyxVQUFVO0FBQ1Ysc0VBQXNFO0FBQ3RFLDRCQUE0QjtBQUM1QixVQUFVO0FBQ1Ysc0NBQXNDO0FBQ3RDLGdEQUFnRDtBQUNoRCxtQ0FBbUM7QUFDbkMsVUFBVTtBQUNWLHlFQUF5RTtBQUN6RSwyREFBMkQ7QUFDM0QsbUJBQW1CO0FBQ25CLFVBQVU7QUFDViw0Q0FBNEM7QUFDNUMsc0VBQXNFO0FBQ3RFLG1DQUFtQztBQUNuQyxVQUFVO0FBRVY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLE9BQStDO0lBRS9DLE9BQU8sa0NBQWtDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGdCQUFnQixDQUFDLElBQVU7SUFDbEMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDN0MsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsSUFBVTtJQUMzQyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDO0FBQ25DLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLDRCQUE0QixDQUFDLElBQVU7SUFDOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFL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QUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBgX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWVgIGZ1bmN0aW9uLCB3aGljaCBjb21wdXRlcyB3aGF0IHRoZSAqZXhwZWN0ZWQqXG4vLyBBUklBIGFjY2Vzc2libGUgbmFtZSB3b3VsZCBiZSBmb3IgYSBnaXZlbiBlbGVtZW50LiBJbXBsZW1lbnRzIGEgc3Vic2V0IG9mIEFSSUEgc3BlY2lmaWNhdGlvblxuLy8gW0FjY2Vzc2libGUgTmFtZSBhbmQgRGVzY3JpcHRpb24gQ29tcHV0YXRpb24gMS4yXShodHRwczovL3d3dy53My5vcmcvVFIvYWNjbmFtZS0xLjIvKS5cbi8vXG4vLyBTcGVjaWZpY2F0aW9uIGFjY25hbWUtMS4yIGNhbiBiZSBzdW1tYXJpemVkIGJ5IHJldHVybmluZyB0aGUgcmVzdWx0IG9mIHRoZSBmaXJzdCBtZXRob2Rcbi8vIGF2YWlsYWJsZS5cbi8vXG4vLyAgMS4gYGFyaWEtbGFiZWxsZWRieWAgYXR0cmlidXRlXG4vLyAgICAgYGBgXG4vLyAgICAgICA8IS0tIGV4YW1wbGUgdXNpbmcgYXJpYS1sYWJlbGxlZGJ5LS0+XG4vLyAgICAgICA8bGFiZWwgaWQ9J2xhYmVsLWlkJz5TdGFydCBEYXRlPC9sYWJlbD5cbi8vICAgICAgIDxpbnB1dCBhcmlhLWxhYmVsbGVkYnk9J2xhYmVsLWlkJy8+XG4vLyAgICAgYGBgXG4vLyAgMi4gYGFyaWEtbGFiZWxgIGF0dHJpYnV0ZSAoZS5nLiBgPGlucHV0IGFyaWEtbGFiZWw9XCJEZXBhcnR1cmVcIi8+YClcbi8vICAzLiBMYWJlbCB3aXRoIGBmb3JgL2BpZGBcbi8vICAgICBgYGBcbi8vICAgICAgIDwhLS0gZXhhbXBsZSB1c2luZyBmb3IvaWQgLS0+XG4vLyAgICAgICA8bGFiZWwgZm9yPVwiY3VycmVudC1ub2RlXCI+TGFiZWw8L2xhYmVsPlxuLy8gICAgICAgPGlucHV0IGlkPVwiY3VycmVudC1ub2RlXCIvPlxuLy8gICAgIGBgYFxuLy8gIDQuIGBwbGFjZWhvbGRlcmAgYXR0cmlidXRlIChlLmcuIGA8aW5wdXQgcGxhY2Vob2xkZXI9XCIwNi8wMy8xOTkwXCIvPmApXG4vLyAgNS4gYHRpdGxlYCBhdHRyaWJ1dGUgKGUuZy4gYDxpbnB1dCB0aXRsZT1cIkNoZWNrLUluXCIvPmApXG4vLyAgNi4gdGV4dCBjb250ZW50XG4vLyAgICAgYGBgXG4vLyAgICAgICA8IS0tIGV4YW1wbGUgdXNpbmcgdGV4dCBjb250ZW50IC0tPlxuLy8gICAgICAgPGxhYmVsIGZvcj1cImN1cnJlbnQtbm9kZVwiPjxzcGFuPkRlcGFydHVyZTwvc3Bhbj4gRGF0ZTwvbGFiZWw+XG4vLyAgICAgICA8aW5wdXQgaWQ9XCJjdXJyZW50LW5vZGVcIi8+XG4vLyAgICAgYGBgXG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlICpleHBlY3RlZCogQVJJQSBhY2Nlc3NpYmxlIG5hbWUgZm9yIGFyZ3VtZW50IGVsZW1lbnQgYmFzZWQgb24gW2FjY25hbWUtMS4yXG4gKiBzcGVjaWZpY2F0aW9uXShodHRwczovL3d3dy53My5vcmcvVFIvYWNjbmFtZS0xLjIvKS4gSW1wbGVtZW50cyBhIHN1YnNldCBvZiBhY2NuYW1lLTEuMixcbiAqIGFuZCBzaG91bGQgb25seSBiZSB1c2VkIGZvciB0aGUgRGF0ZXBpY2tlcidzIHNwZWNpZmljIHVzZSBjYXNlLlxuICpcbiAqIEludGVuZGVkIHVzZTpcbiAqIFRoaXMgaXMgbm90IGEgZ2VuZXJhbCB1c2UgaW1wbGVtZW50YXRpb24uIE9ubHkgaW1wbGVtZW50cyB0aGUgcGFydHMgb2YgYWNjbmFtZS0xLjIgdGhhdCBhcmVcbiAqIHJlcXVpcmVkIGZvciB0aGUgRGF0ZXBpY2tlcidzIHNwZWNpZmljIHVzZSBjYXNlLiBUaGlzIGZ1bmN0aW9uIGlzIG5vdCBpbnRlbmRlZCBmb3IgYW55IG90aGVyXG4gKiB1c2UuXG4gKlxuICogTGltaXRhdGlvbnM6XG4gKiAgLSBPbmx5IGNvdmVycyB0aGUgbmVlZHMgb2YgYG1hdFN0YXJ0RGF0ZWAgYW5kIGBtYXRFbmREYXRlYC4gRG9lcyBub3Qgc3VwcG9ydCBvdGhlciB1c2UgY2FzZXMuXG4gKiAgLSBTZWUgTk9URVMncyBpbiBpbXBsZW1lbnRhdGlvbiBmb3Igc3BlY2lmaWMgZGV0YWlscyBvbiB3aGF0IHBhcnRzIG9mIHRoZSBhY2NuYW1lLTEuMlxuICogIHNwZWNpZmljYXRpb24gYXJlIG5vdCBpbXBsZW1lbnRlZC5cbiAqXG4gKiAgQHBhcmFtIGVsZW1lbnQge0hUTUxJbnB1dEVsZW1lbnR9IG5hdGl2ZSAmbHQ7aW5wdXQvJmd0OyBlbGVtZW50IG9mIGBtYXRTdGFydERhdGVgIG9yXG4gKiAgYG1hdEVuZERhdGVgIGNvbXBvbmVudC4gQ29ycmVzcG9uZHMgdG8gdGhlICdSb290IEVsZW1lbnQnIGZyb20gYWNjbmFtZS0xLjJcbiAqXG4gKiAgQHJldHVybiBleHBlY3RlZCBBUklBIGFjY2Vzc2libGUgbmFtZSBvZiBhcmd1bWVudCAmbHQ7aW5wdXQvJmd0O1xuICovXG5leHBvcnQgZnVuY3Rpb24gX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWUoXG4gIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgfCBIVE1MVGV4dEFyZWFFbGVtZW50LFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lSW50ZXJuYWwoZWxlbWVudCwgdHJ1ZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGFyZ3VtZW50IG5vZGUgaXMgYW4gRWxlbWVudCBiYXNlZCBvbiBgbm9kZVR5cGVgIHByb3BlcnR5LiBUaGlzIGZ1bmN0aW9uIGlzIHNhZmUgdG9cbiAqIHVzZSB3aXRoIHNlcnZlci1zaWRlIHJlbmRlcmluZy5cbiAqL1xuZnVuY3Rpb24gc3NyU2FmZUlzRWxlbWVudChub2RlOiBOb2RlKTogbm9kZSBpcyBFbGVtZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhcmd1bWVudCBub2RlIGlzIGFuIEhUTUxJbnB1dEVsZW1lbnQgYmFzZWQgb24gYG5vZGVOYW1lYCBwcm9wZXJ0eS4gVGhpcyBmdW5jaXRvbiBpc1xuICogc2FmZSB0byB1c2Ugd2l0aCBzZXJ2ZXItc2lkZSByZW5kZXJpbmcuXG4gKi9cbmZ1bmN0aW9uIHNzclNhZmVJc0hUTUxJbnB1dEVsZW1lbnQobm9kZTogTm9kZSk6IG5vZGUgaXMgSFRNTElucHV0RWxlbWVudCB7XG4gIHJldHVybiBub2RlLm5vZGVOYW1lID09PSAnSU5QVVQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhcmd1bWVudCBub2RlIGlzIGFuIEhUTUxUZXh0QXJlYUVsZW1lbnQgYmFzZWQgb24gYG5vZGVOYW1lYCBwcm9wZXJ0eS4gVGhpc1xuICogZnVuY2l0b24gaXMgc2FmZSB0byB1c2Ugd2l0aCBzZXJ2ZXItc2lkZSByZW5kZXJpbmcuXG4gKi9cbmZ1bmN0aW9uIHNzclNhZmVJc0hUTUxUZXh0QXJlYUVsZW1lbnQobm9kZTogTm9kZSk6IG5vZGUgaXMgSFRNTFRleHRBcmVhRWxlbWVudCB7XG4gIHJldHVybiBub2RlLm5vZGVOYW1lID09PSAnVEVYVEFSRUEnO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgZXhwZWN0ZWQgQVJJQSBhY2Nlc3NpYmxlIG5hbWUgZm9yIGdpdmVuIERPTSBOb2RlLiBHaXZlbiBET00gTm9kZSBtYXkgYmUgZWl0aGVyIHRoZVxuICogXCJSb290IG5vZGVcIiBwYXNzZWQgdG8gYF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lYCBvciBcIkN1cnJlbnQgbm9kZVwiIGFzIHJlc3VsdCBvZiByZWN1cnNpb24uXG4gKlxuICogQHJldHVybiB0aGUgYWNjZXNzaWJsZSBuYW1lIG9mIGFyZ3VtZW50IERPTSBOb2RlXG4gKlxuICogQHBhcmFtIGN1cnJlbnROb2RlIG5vZGUgdG8gZGV0ZXJtaW5lIGFjY2Vzc2libGUgbmFtZSBvZlxuICogQHBhcmFtIGlzRGlyZWN0bHlSZWZlcmVuY2VkIHRydWUgaWYgYGN1cnJlbnROb2RlYCBpcyB0aGUgcm9vdCBub2RlIHRvIGNhbGN1bGF0ZSBBUklBIGFjY2Vzc2libGVcbiAqIG5hbWUgb2YuIEZhbHNlIGlmIGl0IGlzIGEgcmVzdWx0IG9mIHJlY3Vyc2lvbi5cbiAqL1xuZnVuY3Rpb24gX2NvbXB1dGVBcmlhQWNjZXNzaWJsZU5hbWVJbnRlcm5hbChcbiAgY3VycmVudE5vZGU6IE5vZGUsXG4gIGlzRGlyZWN0bHlSZWZlcmVuY2VkOiBib29sZWFuLFxuKTogc3RyaW5nIHtcbiAgLy8gTk9URTogdGhpcyBkaWZmZXJzIGZyb20gYWNjbmFtZS0xLjIgc3BlY2lmaWNhdGlvbi5cbiAgLy8gIC0gRG9lcyBub3QgaW1wbGVtZW50IFN0ZXAgMS4gb2YgYWNjbmFtZS0xLjI6ICcnJ0lmIGBjdXJyZW50Tm9kZWAncyByb2xlIHByb2hpYml0cyBuYW1pbmcsXG4gIC8vICAgIHJldHVybiB0aGUgZW1wdHkgc3RyaW5nIChcIlwiKScnJy5cbiAgLy8gIC0gRG9lcyBub3QgaW1wbGVtZW50IFN0ZXAgMi5BLiBvZiBhY2NuYW1lLTEuMjogJycnaWYgY3VycmVudCBub2RlIGlzIGhpZGRlbiBhbmQgbm90IGRpcmVjdGx5XG4gIC8vICAgIHJlZmVyZW5jZWQgYnkgYXJpYS1sYWJlbGxlZGJ5Li4uIHJldHVybiB0aGUgZW1wdHkgc3RyaW5nLicnJ1xuXG4gIC8vIGFjYy1uYW1lLTEuMiBTdGVwIDIuQi46IGFyaWEtbGFiZWxsZWRieVxuICBpZiAoc3NyU2FmZUlzRWxlbWVudChjdXJyZW50Tm9kZSkgJiYgaXNEaXJlY3RseVJlZmVyZW5jZWQpIHtcbiAgICBjb25zdCBsYWJlbGxlZGJ5SWRzOiBzdHJpbmdbXSA9XG4gICAgICBjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGU/LignYXJpYS1sYWJlbGxlZGJ5Jyk/LnNwbGl0KC9cXHMrL2cpIHx8IFtdO1xuICAgIGNvbnN0IHZhbGlkSWRSZWZzOiBIVE1MRWxlbWVudFtdID0gbGFiZWxsZWRieUlkcy5yZWR1Y2UoKHZhbGlkSWRzLCBpZCkgPT4ge1xuICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgIGlmIChlbGVtKSB7XG4gICAgICAgIHZhbGlkSWRzLnB1c2goZWxlbSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRJZHM7XG4gICAgfSwgW10gYXMgSFRNTEVsZW1lbnRbXSk7XG5cbiAgICBpZiAodmFsaWRJZFJlZnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdmFsaWRJZFJlZnNcbiAgICAgICAgLm1hcChpZFJlZiA9PiB7XG4gICAgICAgICAgcmV0dXJuIF9jb21wdXRlQXJpYUFjY2Vzc2libGVOYW1lSW50ZXJuYWwoaWRSZWYsIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJyAnKTtcbiAgICB9XG4gIH1cblxuICAvLyBhY2MtbmFtZS0xLjIgU3RlcCAyLkMuOiBhcmlhLWxhYmVsXG4gIGlmIChzc3JTYWZlSXNFbGVtZW50KGN1cnJlbnROb2RlKSkge1xuICAgIGNvbnN0IGFyaWFMYWJlbCA9IGN1cnJlbnROb2RlLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpPy50cmltKCk7XG5cbiAgICBpZiAoYXJpYUxhYmVsKSB7XG4gICAgICByZXR1cm4gYXJpYUxhYmVsO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFjYy1uYW1lLTEuMiBTdGVwIDIuRC4gYXR0cmlidXRlIG9yIGVsZW1lbnQgdGhhdCBkZWZpbmVzIGEgdGV4dCBhbHRlcm5hdGl2ZVxuICAvL1xuICAvLyBOT1RFOiB0aGlzIGRpZmZlcnMgZnJvbSBhY2NuYW1lLTEuMiBzcGVjaWZpY2F0aW9uLlxuICAvLyBPbmx5IGltcGxlbWVudHMgU3RlcCAyLkQuIGZvciBgPGxhYmVsPmAsYDxpbnB1dC8+YCwgYW5kIGA8dGV4dGFyZWEvPmAgZWxlbWVudC4gRG9lcyBub3RcbiAgLy8gaW1wbGVtZW50IG90aGVyIGVsZW1lbnRzIHRoYXQgaGF2ZSBhbiBhdHRyaWJ1dGUgb3IgZWxlbWVudCB0aGF0IGRlZmluZXMgYSB0ZXh0IGFsdGVybmF0aXZlLlxuICBpZiAoc3NyU2FmZUlzSFRNTElucHV0RWxlbWVudChjdXJyZW50Tm9kZSkgfHwgc3NyU2FmZUlzSFRNTFRleHRBcmVhRWxlbWVudChjdXJyZW50Tm9kZSkpIHtcbiAgICAvLyB1c2UgbGFiZWwgd2l0aCBhIGBmb3JgIGF0dHJpYnV0ZSByZWZlcmVuY2luZyB0aGUgY3VycmVudCBub2RlXG4gICAgaWYgKGN1cnJlbnROb2RlLmxhYmVscz8ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShjdXJyZW50Tm9kZS5sYWJlbHMpXG4gICAgICAgIC5tYXAoeCA9PiBfY29tcHV0ZUFyaWFBY2Nlc3NpYmxlTmFtZUludGVybmFsKHgsIGZhbHNlKSlcbiAgICAgICAgLmpvaW4oJyAnKTtcbiAgICB9XG5cbiAgICAvLyB1c2UgcGxhY2Vob2xkZXIgaWYgYXZhaWxhYmxlXG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSBjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk/LnRyaW0oKTtcbiAgICBpZiAocGxhY2Vob2xkZXIpIHtcbiAgICAgIHJldHVybiBwbGFjZWhvbGRlcjtcbiAgICB9XG5cbiAgICAvLyB1c2UgdGl0bGUgaWYgYXZhaWxhYmxlXG4gICAgY29uc3QgdGl0bGUgPSBjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ3RpdGxlJyk/LnRyaW0oKTtcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIHJldHVybiB0aXRsZTtcbiAgICB9XG4gIH1cblxuICAvLyBOT1RFOiB0aGlzIGRpZmZlcnMgZnJvbSBhY2NuYW1lLTEuMiBzcGVjaWZpY2F0aW9uLlxuICAvLyAgLSBkb2VzIG5vdCBpbXBsZW1lbnQgYWNjLW5hbWUtMS4yIFN0ZXAgMi5FLjogJycnaWYgdGhlIGN1cnJlbnQgbm9kZSBpcyBhIGNvbnRyb2wgZW1iZWRkZWRcbiAgLy8gICAgIHdpdGhpbiB0aGUgbGFiZWwuLi4gdGhlbiBpbmNsdWRlIHRoZSBlbWJlZGRlZCBjb250cm9sIGFzIHBhcnQgb2YgdGhlIHRleHQgYWx0ZXJuYXRpdmUgaW5cbiAgLy8gICAgIHRoZSBmb2xsb3dpbmcgbWFubmVyLi4uJycnLiBTdGVwIDJFIGFwcGxpZXMgdG8gZW1iZWRkZWQgY29udHJvbHMgc3VjaCBhcyB0ZXh0Ym94LCBsaXN0Ym94LFxuICAvLyAgICAgcmFuZ2UsIGV0Yy5cbiAgLy8gIC0gZG9lcyBub3QgaW1wbGVtZW50IGFjYy1uYW1lLTEuMiBzdGVwIDIuRi46IGNoZWNrIHRoYXQgJycncm9sZSBhbGxvd3MgbmFtZSBmcm9tIGNvbnRlbnQnJycsXG4gIC8vICAgIHdoaWNoIGFwcGxpZXMgdG8gYGN1cnJlbnROb2RlYCBhbmQgaXRzIGNoaWxkcmVuLlxuICAvLyAgLSBkb2VzIG5vdCBpbXBsZW1lbnQgYWNjLW5hbWUtMS4yIFN0ZXAgMi5GLmlpLjogJycnQ2hlY2sgZm9yIENTUyBnZW5lcmF0ZWQgdGV4dHVhbCBjb250ZW50JycnXG4gIC8vICAgIChlLmcuIDpiZWZvcmUgYW5kIDphZnRlcikuXG4gIC8vICAtIGRvZXMgbm90IGltcGxlbWVudCBhY2MtbmFtZS0xLjIgU3RlcCAyLkkuOiAnJydpZiB0aGUgY3VycmVudCBub2RlIGhhcyBhIFRvb2x0aXAgYXR0cmlidXRlLFxuICAvLyAgICByZXR1cm4gaXRzIHZhbHVlJycnXG5cbiAgLy8gUmV0dXJuIHRleHQgY29udGVudCB3aXRoIHdoaXRlc3BhY2UgY29sbGFwc2VkIGludG8gYSBzaW5nbGUgc3BhY2UgY2hhcmFjdGVyLiBBY2NvbXBsaXNoXG4gIC8vIGFjYy1uYW1lLTEuMiBzdGVwcyAyRiwgMkcsIGFuZCAySC5cbiAgcmV0dXJuIChjdXJyZW50Tm9kZS50ZXh0Q29udGVudCB8fCAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbn1cbiJdfQ==