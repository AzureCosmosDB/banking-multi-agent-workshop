/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/**
 * Configuration for the isFocusable method.
 */
export class IsFocusableConfig {
    constructor() {
        /**
         * Whether to count an element as focusable even if it is not currently visible.
         */
        this.ignoreVisibility = false;
    }
}
// The InteractivityChecker leans heavily on the ally.js accessibility utilities.
// Methods like `isTabbable` are only covering specific edge-cases for the browsers which are
// supported.
/**
 * Utility for checking the interactivity of an element, such as whether it is focusable or
 * tabbable.
 */
export class InteractivityChecker {
    constructor(_platform) {
        this._platform = _platform;
    }
    /**
     * Gets whether an element is disabled.
     *
     * @param element Element to be checked.
     * @returns Whether the element is disabled.
     */
    isDisabled(element) {
        // This does not capture some cases, such as a non-form control with a disabled attribute or
        // a form control inside of a disabled form, but should capture the most common cases.
        return element.hasAttribute('disabled');
    }
    /**
     * Gets whether an element is visible for the purposes of interactivity.
     *
     * This will capture states like `display: none` and `visibility: hidden`, but not things like
     * being clipped by an `overflow: hidden` parent or being outside the viewport.
     *
     * @returns Whether the element is visible.
     */
    isVisible(element) {
        return hasGeometry(element) && getComputedStyle(element).visibility === 'visible';
    }
    /**
     * Gets whether an element can be reached via Tab key.
     * Assumes that the element has already been checked with isFocusable.
     *
     * @param element Element to be checked.
     * @returns Whether the element is tabbable.
     */
    isTabbable(element) {
        // Nothing is tabbable on the server 😎
        if (!this._platform.isBrowser) {
            return false;
        }
        const frameElement = getFrameElement(getWindow(element));
        if (frameElement) {
            // Frame elements inherit their tabindex onto all child elements.
            if (getTabIndexValue(frameElement) === -1) {
                return false;
            }
            // Browsers disable tabbing to an element inside of an invisible frame.
            if (!this.isVisible(frameElement)) {
                return false;
            }
        }
        let nodeName = element.nodeName.toLowerCase();
        let tabIndexValue = getTabIndexValue(element);
        if (element.hasAttribute('contenteditable')) {
            return tabIndexValue !== -1;
        }
        if (nodeName === 'iframe' || nodeName === 'object') {
            // The frame or object's content may be tabbable depending on the content, but it's
            // not possibly to reliably detect the content of the frames. We always consider such
            // elements as non-tabbable.
            return false;
        }
        // In iOS, the browser only considers some specific elements as tabbable.
        if (this._platform.WEBKIT && this._platform.IOS && !isPotentiallyTabbableIOS(element)) {
            return false;
        }
        if (nodeName === 'audio') {
            // Audio elements without controls enabled are never tabbable, regardless
            // of the tabindex attribute explicitly being set.
            if (!element.hasAttribute('controls')) {
                return false;
            }
            // Audio elements with controls are by default tabbable unless the
            // tabindex attribute is set to `-1` explicitly.
            return tabIndexValue !== -1;
        }
        if (nodeName === 'video') {
            // For all video elements, if the tabindex attribute is set to `-1`, the video
            // is not tabbable. Note: We cannot rely on the default `HTMLElement.tabIndex`
            // property as that one is set to `-1` in Chrome, Edge and Safari v13.1. The
            // tabindex attribute is the source of truth here.
            if (tabIndexValue === -1) {
                return false;
            }
            // If the tabindex is explicitly set, and not `-1` (as per check before), the
            // video element is always tabbable (regardless of whether it has controls or not).
            if (tabIndexValue !== null) {
                return true;
            }
            // Otherwise (when no explicit tabindex is set), a video is only tabbable if it
            // has controls enabled. Firefox is special as videos are always tabbable regardless
            // of whether there are controls or not.
            return this._platform.FIREFOX || element.hasAttribute('controls');
        }
        return element.tabIndex >= 0;
    }
    /**
     * Gets whether an element can be focused by the user.
     *
     * @param element Element to be checked.
     * @param config The config object with options to customize this method's behavior
     * @returns Whether the element is focusable.
     */
    isFocusable(element, config) {
        // Perform checks in order of left to most expensive.
        // Again, naive approach that does not capture many edge cases and browser quirks.
        return (isPotentiallyFocusable(element) &&
            !this.isDisabled(element) &&
            (config?.ignoreVisibility || this.isVisible(element)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InteractivityChecker, deps: [{ token: i1.Platform }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InteractivityChecker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InteractivityChecker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Platform }] });
/**
 * Returns the frame element from a window object. Since browsers like MS Edge throw errors if
 * the frameElement property is being accessed from a different host address, this property
 * should be accessed carefully.
 */
function getFrameElement(window) {
    try {
        return window.frameElement;
    }
    catch {
        return null;
    }
}
/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element) {
    // Use logic from jQuery to check for an invisible element.
    // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
    return !!(element.offsetWidth ||
        element.offsetHeight ||
        (typeof element.getClientRects === 'function' && element.getClientRects().length));
}
/** Gets whether an element's  */
function isNativeFormElement(element) {
    let nodeName = element.nodeName.toLowerCase();
    return (nodeName === 'input' ||
        nodeName === 'select' ||
        nodeName === 'button' ||
        nodeName === 'textarea');
}
/** Gets whether an element is an `<input type="hidden">`. */
function isHiddenInput(element) {
    return isInputElement(element) && element.type == 'hidden';
}
/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element) {
    return isAnchorElement(element) && element.hasAttribute('href');
}
/** Gets whether an element is an input element. */
function isInputElement(element) {
    return element.nodeName.toLowerCase() == 'input';
}
/** Gets whether an element is an anchor element. */
function isAnchorElement(element) {
    return element.nodeName.toLowerCase() == 'a';
}
/** Gets whether an element has a valid tabindex. */
function hasValidTabIndex(element) {
    if (!element.hasAttribute('tabindex') || element.tabIndex === undefined) {
        return false;
    }
    let tabIndex = element.getAttribute('tabindex');
    return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}
/**
 * Returns the parsed tabindex from the element attributes instead of returning the
 * evaluated tabindex from the browsers defaults.
 */
function getTabIndexValue(element) {
    if (!hasValidTabIndex(element)) {
        return null;
    }
    // See browser issue in Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
    const tabIndex = parseInt(element.getAttribute('tabindex') || '', 10);
    return isNaN(tabIndex) ? -1 : tabIndex;
}
/** Checks whether the specified element is potentially tabbable on iOS */
function isPotentiallyTabbableIOS(element) {
    let nodeName = element.nodeName.toLowerCase();
    let inputType = nodeName === 'input' && element.type;
    return (inputType === 'text' ||
        inputType === 'password' ||
        nodeName === 'select' ||
        nodeName === 'textarea');
}
/**
 * Gets whether an element is potentially focusable without taking current visible/disabled state
 * into account.
 */
function isPotentiallyFocusable(element) {
    // Inputs are potentially focusable *unless* they're type="hidden".
    if (isHiddenInput(element)) {
        return false;
    }
    return (isNativeFormElement(element) ||
        isAnchorWithHref(element) ||
        element.hasAttribute('contenteditable') ||
        hasValidTabIndex(element));
}
/** Gets the parent window of a DOM node with regards of being inside of an iframe. */
function getWindow(node) {
    // ownerDocument is null if `node` itself *is* a document.
    return (node.ownerDocument && node.ownerDocument.defaultView) || window;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rpdml0eS1jaGVja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2ludGVyYWN0aXZpdHktY2hlY2tlci9pbnRlcmFjdGl2aXR5LWNoZWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7OztBQUV6Qzs7R0FFRztBQUNILE1BQU0sT0FBTyxpQkFBaUI7SUFBOUI7UUFDRTs7V0FFRztRQUNILHFCQUFnQixHQUFZLEtBQUssQ0FBQztJQUNwQyxDQUFDO0NBQUE7QUFFRCxpRkFBaUY7QUFDakYsNkZBQTZGO0FBQzdGLGFBQWE7QUFFYjs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLFlBQW9CLFNBQW1CO1FBQW5CLGNBQVMsR0FBVCxTQUFTLENBQVU7SUFBRyxDQUFDO0lBRTNDOzs7OztPQUtHO0lBQ0gsVUFBVSxDQUFDLE9BQW9CO1FBQzdCLDRGQUE0RjtRQUM1RixzRkFBc0Y7UUFDdEYsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBUyxDQUFDLE9BQW9CO1FBQzVCLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUM7SUFDcEYsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFVBQVUsQ0FBQyxPQUFvQjtRQUM3Qix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDOUIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXpELElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsaUVBQWlFO1lBQ2pFLElBQUksZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsT0FBTyxLQUFLLENBQUM7WUFDZixDQUFDO1lBRUQsdUVBQXVFO1lBQ3ZFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sS0FBSyxDQUFDO1lBQ2YsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLElBQUksYUFBYSxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTlDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7WUFDNUMsT0FBTyxhQUFhLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQUksUUFBUSxLQUFLLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDbkQsbUZBQW1GO1lBQ25GLHFGQUFxRjtZQUNyRiw0QkFBNEI7WUFDNUIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQseUVBQXlFO1FBQ3pFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3RGLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLHlFQUF5RTtZQUN6RSxrREFBa0Q7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsT0FBTyxLQUFLLENBQUM7WUFDZixDQUFDO1lBQ0Qsa0VBQWtFO1lBQ2xFLGdEQUFnRDtZQUNoRCxPQUFPLGFBQWEsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsSUFBSSxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDekIsOEVBQThFO1lBQzlFLDhFQUE4RTtZQUM5RSw0RUFBNEU7WUFDNUUsa0RBQWtEO1lBQ2xELElBQUksYUFBYSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDO1lBQ2YsQ0FBQztZQUNELDZFQUE2RTtZQUM3RSxtRkFBbUY7WUFDbkYsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELCtFQUErRTtZQUMvRSxvRkFBb0Y7WUFDcEYsd0NBQXdDO1lBQ3hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsV0FBVyxDQUFDLE9BQW9CLEVBQUUsTUFBMEI7UUFDMUQscURBQXFEO1FBQ3JELGtGQUFrRjtRQUNsRixPQUFPLENBQ0wsc0JBQXNCLENBQUMsT0FBTyxDQUFDO1lBQy9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7WUFDekIsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUN0RCxDQUFDO0lBQ0osQ0FBQztxSEF6SFUsb0JBQW9CO3lIQUFwQixvQkFBb0IsY0FEUixNQUFNOztrR0FDbEIsb0JBQW9CO2tCQURoQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7QUE2SGhDOzs7O0dBSUc7QUFDSCxTQUFTLGVBQWUsQ0FBQyxNQUFjO0lBQ3JDLElBQUksQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDLFlBQTJCLENBQUM7SUFDNUMsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCwwRUFBMEU7QUFDMUUsU0FBUyxXQUFXLENBQUMsT0FBb0I7SUFDdkMsMkRBQTJEO0lBQzNELHlGQUF5RjtJQUN6RixPQUFPLENBQUMsQ0FBQyxDQUNQLE9BQU8sQ0FBQyxXQUFXO1FBQ25CLE9BQU8sQ0FBQyxZQUFZO1FBQ3BCLENBQUMsT0FBTyxPQUFPLENBQUMsY0FBYyxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQ2xGLENBQUM7QUFDSixDQUFDO0FBRUQsaUNBQWlDO0FBQ2pDLFNBQVMsbUJBQW1CLENBQUMsT0FBYTtJQUN4QyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzlDLE9BQU8sQ0FDTCxRQUFRLEtBQUssT0FBTztRQUNwQixRQUFRLEtBQUssUUFBUTtRQUNyQixRQUFRLEtBQUssUUFBUTtRQUNyQixRQUFRLEtBQUssVUFBVSxDQUN4QixDQUFDO0FBQ0osQ0FBQztBQUVELDZEQUE2RDtBQUM3RCxTQUFTLGFBQWEsQ0FBQyxPQUFvQjtJQUN6QyxPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQztBQUM3RCxDQUFDO0FBRUQsdUVBQXVFO0FBQ3ZFLFNBQVMsZ0JBQWdCLENBQUMsT0FBb0I7SUFDNUMsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQsbURBQW1EO0FBQ25ELFNBQVMsY0FBYyxDQUFDLE9BQW9CO0lBQzFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxPQUFPLENBQUM7QUFDbkQsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxTQUFTLGVBQWUsQ0FBQyxPQUFvQjtJQUMzQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDO0FBQy9DLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFvQjtJQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsT0FBb0I7SUFDNUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsa0ZBQWtGO0lBQ2xGLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV0RSxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN6QyxDQUFDO0FBRUQsMEVBQTBFO0FBQzFFLFNBQVMsd0JBQXdCLENBQUMsT0FBb0I7SUFDcEQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM5QyxJQUFJLFNBQVMsR0FBRyxRQUFRLEtBQUssT0FBTyxJQUFLLE9BQTRCLENBQUMsSUFBSSxDQUFDO0lBRTNFLE9BQU8sQ0FDTCxTQUFTLEtBQUssTUFBTTtRQUNwQixTQUFTLEtBQUssVUFBVTtRQUN4QixRQUFRLEtBQUssUUFBUTtRQUNyQixRQUFRLEtBQUssVUFBVSxDQUN4QixDQUFDO0FBQ0osQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsc0JBQXNCLENBQUMsT0FBb0I7SUFDbEQsbUVBQW1FO0lBQ25FLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDM0IsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsT0FBTyxDQUNMLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztRQUM1QixnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7UUFDekIsT0FBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztRQUN2QyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FDMUIsQ0FBQztBQUNKLENBQUM7QUFFRCxzRkFBc0Y7QUFDdEYsU0FBUyxTQUFTLENBQUMsSUFBaUI7SUFDbEMsMERBQTBEO0lBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksTUFBTSxDQUFDO0FBQzFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBmb3IgdGhlIGlzRm9jdXNhYmxlIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNsYXNzIElzRm9jdXNhYmxlQ29uZmlnIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gY291bnQgYW4gZWxlbWVudCBhcyBmb2N1c2FibGUgZXZlbiBpZiBpdCBpcyBub3QgY3VycmVudGx5IHZpc2libGUuXG4gICAqL1xuICBpZ25vcmVWaXNpYmlsaXR5OiBib29sZWFuID0gZmFsc2U7XG59XG5cbi8vIFRoZSBJbnRlcmFjdGl2aXR5Q2hlY2tlciBsZWFucyBoZWF2aWx5IG9uIHRoZSBhbGx5LmpzIGFjY2Vzc2liaWxpdHkgdXRpbGl0aWVzLlxuLy8gTWV0aG9kcyBsaWtlIGBpc1RhYmJhYmxlYCBhcmUgb25seSBjb3ZlcmluZyBzcGVjaWZpYyBlZGdlLWNhc2VzIGZvciB0aGUgYnJvd3NlcnMgd2hpY2ggYXJlXG4vLyBzdXBwb3J0ZWQuXG5cbi8qKlxuICogVXRpbGl0eSBmb3IgY2hlY2tpbmcgdGhlIGludGVyYWN0aXZpdHkgb2YgYW4gZWxlbWVudCwgc3VjaCBhcyB3aGV0aGVyIGl0IGlzIGZvY3VzYWJsZSBvclxuICogdGFiYmFibGUuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIEludGVyYWN0aXZpdHlDaGVja2VyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtKSB7fVxuXG4gIC8qKlxuICAgKiBHZXRzIHdoZXRoZXIgYW4gZWxlbWVudCBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCB0byBiZSBjaGVja2VkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGRpc2FibGVkLlxuICAgKi9cbiAgaXNEaXNhYmxlZChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIC8vIFRoaXMgZG9lcyBub3QgY2FwdHVyZSBzb21lIGNhc2VzLCBzdWNoIGFzIGEgbm9uLWZvcm0gY29udHJvbCB3aXRoIGEgZGlzYWJsZWQgYXR0cmlidXRlIG9yXG4gICAgLy8gYSBmb3JtIGNvbnRyb2wgaW5zaWRlIG9mIGEgZGlzYWJsZWQgZm9ybSwgYnV0IHNob3VsZCBjYXB0dXJlIHRoZSBtb3N0IGNvbW1vbiBjYXNlcy5cbiAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgdmlzaWJsZSBmb3IgdGhlIHB1cnBvc2VzIG9mIGludGVyYWN0aXZpdHkuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBjYXB0dXJlIHN0YXRlcyBsaWtlIGBkaXNwbGF5OiBub25lYCBhbmQgYHZpc2liaWxpdHk6IGhpZGRlbmAsIGJ1dCBub3QgdGhpbmdzIGxpa2VcbiAgICogYmVpbmcgY2xpcHBlZCBieSBhbiBgb3ZlcmZsb3c6IGhpZGRlbmAgcGFyZW50IG9yIGJlaW5nIG91dHNpZGUgdGhlIHZpZXdwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIHZpc2libGUuXG4gICAqL1xuICBpc1Zpc2libGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGFzR2VvbWV0cnkoZWxlbWVudCkgJiYgZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS52aXNpYmlsaXR5ID09PSAndmlzaWJsZSc7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgY2FuIGJlIHJlYWNoZWQgdmlhIFRhYiBrZXkuXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgZWxlbWVudCBoYXMgYWxyZWFkeSBiZWVuIGNoZWNrZWQgd2l0aCBpc0ZvY3VzYWJsZS5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCB0byBiZSBjaGVja2VkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIHRhYmJhYmxlLlxuICAgKi9cbiAgaXNUYWJiYWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIC8vIE5vdGhpbmcgaXMgdGFiYmFibGUgb24gdGhlIHNlcnZlciDwn5iOXG4gICAgaWYgKCF0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBmcmFtZUVsZW1lbnQgPSBnZXRGcmFtZUVsZW1lbnQoZ2V0V2luZG93KGVsZW1lbnQpKTtcblxuICAgIGlmIChmcmFtZUVsZW1lbnQpIHtcbiAgICAgIC8vIEZyYW1lIGVsZW1lbnRzIGluaGVyaXQgdGhlaXIgdGFiaW5kZXggb250byBhbGwgY2hpbGQgZWxlbWVudHMuXG4gICAgICBpZiAoZ2V0VGFiSW5kZXhWYWx1ZShmcmFtZUVsZW1lbnQpID09PSAtMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIEJyb3dzZXJzIGRpc2FibGUgdGFiYmluZyB0byBhbiBlbGVtZW50IGluc2lkZSBvZiBhbiBpbnZpc2libGUgZnJhbWUuXG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKGZyYW1lRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBub2RlTmFtZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgdGFiSW5kZXhWYWx1ZSA9IGdldFRhYkluZGV4VmFsdWUoZWxlbWVudCk7XG5cbiAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpKSB7XG4gICAgICByZXR1cm4gdGFiSW5kZXhWYWx1ZSAhPT0gLTE7XG4gICAgfVxuXG4gICAgaWYgKG5vZGVOYW1lID09PSAnaWZyYW1lJyB8fCBub2RlTmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIFRoZSBmcmFtZSBvciBvYmplY3QncyBjb250ZW50IG1heSBiZSB0YWJiYWJsZSBkZXBlbmRpbmcgb24gdGhlIGNvbnRlbnQsIGJ1dCBpdCdzXG4gICAgICAvLyBub3QgcG9zc2libHkgdG8gcmVsaWFibHkgZGV0ZWN0IHRoZSBjb250ZW50IG9mIHRoZSBmcmFtZXMuIFdlIGFsd2F5cyBjb25zaWRlciBzdWNoXG4gICAgICAvLyBlbGVtZW50cyBhcyBub24tdGFiYmFibGUuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSW4gaU9TLCB0aGUgYnJvd3NlciBvbmx5IGNvbnNpZGVycyBzb21lIHNwZWNpZmljIGVsZW1lbnRzIGFzIHRhYmJhYmxlLlxuICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5XRUJLSVQgJiYgdGhpcy5fcGxhdGZvcm0uSU9TICYmICFpc1BvdGVudGlhbGx5VGFiYmFibGVJT1MoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZU5hbWUgPT09ICdhdWRpbycpIHtcbiAgICAgIC8vIEF1ZGlvIGVsZW1lbnRzIHdpdGhvdXQgY29udHJvbHMgZW5hYmxlZCBhcmUgbmV2ZXIgdGFiYmFibGUsIHJlZ2FyZGxlc3NcbiAgICAgIC8vIG9mIHRoZSB0YWJpbmRleCBhdHRyaWJ1dGUgZXhwbGljaXRseSBiZWluZyBzZXQuXG4gICAgICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250cm9scycpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIEF1ZGlvIGVsZW1lbnRzIHdpdGggY29udHJvbHMgYXJlIGJ5IGRlZmF1bHQgdGFiYmFibGUgdW5sZXNzIHRoZVxuICAgICAgLy8gdGFiaW5kZXggYXR0cmlidXRlIGlzIHNldCB0byBgLTFgIGV4cGxpY2l0bHkuXG4gICAgICByZXR1cm4gdGFiSW5kZXhWYWx1ZSAhPT0gLTE7XG4gICAgfVxuXG4gICAgaWYgKG5vZGVOYW1lID09PSAndmlkZW8nKSB7XG4gICAgICAvLyBGb3IgYWxsIHZpZGVvIGVsZW1lbnRzLCBpZiB0aGUgdGFiaW5kZXggYXR0cmlidXRlIGlzIHNldCB0byBgLTFgLCB0aGUgdmlkZW9cbiAgICAgIC8vIGlzIG5vdCB0YWJiYWJsZS4gTm90ZTogV2UgY2Fubm90IHJlbHkgb24gdGhlIGRlZmF1bHQgYEhUTUxFbGVtZW50LnRhYkluZGV4YFxuICAgICAgLy8gcHJvcGVydHkgYXMgdGhhdCBvbmUgaXMgc2V0IHRvIGAtMWAgaW4gQ2hyb21lLCBFZGdlIGFuZCBTYWZhcmkgdjEzLjEuIFRoZVxuICAgICAgLy8gdGFiaW5kZXggYXR0cmlidXRlIGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgIGlmICh0YWJJbmRleFZhbHVlID09PSAtMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGUgdGFiaW5kZXggaXMgZXhwbGljaXRseSBzZXQsIGFuZCBub3QgYC0xYCAoYXMgcGVyIGNoZWNrIGJlZm9yZSksIHRoZVxuICAgICAgLy8gdmlkZW8gZWxlbWVudCBpcyBhbHdheXMgdGFiYmFibGUgKHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBpdCBoYXMgY29udHJvbHMgb3Igbm90KS5cbiAgICAgIGlmICh0YWJJbmRleFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gT3RoZXJ3aXNlICh3aGVuIG5vIGV4cGxpY2l0IHRhYmluZGV4IGlzIHNldCksIGEgdmlkZW8gaXMgb25seSB0YWJiYWJsZSBpZiBpdFxuICAgICAgLy8gaGFzIGNvbnRyb2xzIGVuYWJsZWQuIEZpcmVmb3ggaXMgc3BlY2lhbCBhcyB2aWRlb3MgYXJlIGFsd2F5cyB0YWJiYWJsZSByZWdhcmRsZXNzXG4gICAgICAvLyBvZiB3aGV0aGVyIHRoZXJlIGFyZSBjb250cm9scyBvciBub3QuXG4gICAgICByZXR1cm4gdGhpcy5fcGxhdGZvcm0uRklSRUZPWCB8fCBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udHJvbHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudC50YWJJbmRleCA+PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgd2hldGhlciBhbiBlbGVtZW50IGNhbiBiZSBmb2N1c2VkIGJ5IHRoZSB1c2VyLlxuICAgKlxuICAgKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IHRvIGJlIGNoZWNrZWQuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZyBvYmplY3Qgd2l0aCBvcHRpb25zIHRvIGN1c3RvbWl6ZSB0aGlzIG1ldGhvZCdzIGJlaGF2aW9yXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgZm9jdXNhYmxlLlxuICAgKi9cbiAgaXNGb2N1c2FibGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IElzRm9jdXNhYmxlQ29uZmlnKTogYm9vbGVhbiB7XG4gICAgLy8gUGVyZm9ybSBjaGVja3MgaW4gb3JkZXIgb2YgbGVmdCB0byBtb3N0IGV4cGVuc2l2ZS5cbiAgICAvLyBBZ2FpbiwgbmFpdmUgYXBwcm9hY2ggdGhhdCBkb2VzIG5vdCBjYXB0dXJlIG1hbnkgZWRnZSBjYXNlcyBhbmQgYnJvd3NlciBxdWlya3MuXG4gICAgcmV0dXJuIChcbiAgICAgIGlzUG90ZW50aWFsbHlGb2N1c2FibGUoZWxlbWVudCkgJiZcbiAgICAgICF0aGlzLmlzRGlzYWJsZWQoZWxlbWVudCkgJiZcbiAgICAgIChjb25maWc/Lmlnbm9yZVZpc2liaWxpdHkgfHwgdGhpcy5pc1Zpc2libGUoZWxlbWVudCkpXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZyYW1lIGVsZW1lbnQgZnJvbSBhIHdpbmRvdyBvYmplY3QuIFNpbmNlIGJyb3dzZXJzIGxpa2UgTVMgRWRnZSB0aHJvdyBlcnJvcnMgaWZcbiAqIHRoZSBmcmFtZUVsZW1lbnQgcHJvcGVydHkgaXMgYmVpbmcgYWNjZXNzZWQgZnJvbSBhIGRpZmZlcmVudCBob3N0IGFkZHJlc3MsIHRoaXMgcHJvcGVydHlcbiAqIHNob3VsZCBiZSBhY2Nlc3NlZCBjYXJlZnVsbHkuXG4gKi9cbmZ1bmN0aW9uIGdldEZyYW1lRWxlbWVudCh3aW5kb3c6IFdpbmRvdykge1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cuZnJhbWVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBlbGVtZW50IGhhcyBhbnkgZ2VvbWV0cnkgLyByZWN0YW5nbGVzLiAqL1xuZnVuY3Rpb24gaGFzR2VvbWV0cnkoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgLy8gVXNlIGxvZ2ljIGZyb20galF1ZXJ5IHRvIGNoZWNrIGZvciBhbiBpbnZpc2libGUgZWxlbWVudC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvbWFzdGVyL3NyYy9jc3MvaGlkZGVuVmlzaWJsZVNlbGVjdG9ycy5qcyNMMTJcbiAgcmV0dXJuICEhKFxuICAgIGVsZW1lbnQub2Zmc2V0V2lkdGggfHxcbiAgICBlbGVtZW50Lm9mZnNldEhlaWdodCB8fFxuICAgICh0eXBlb2YgZWxlbWVudC5nZXRDbGllbnRSZWN0cyA9PT0gJ2Z1bmN0aW9uJyAmJiBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoKVxuICApO1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQncyAgKi9cbmZ1bmN0aW9uIGlzTmF0aXZlRm9ybUVsZW1lbnQoZWxlbWVudDogTm9kZSkge1xuICBsZXQgbm9kZU5hbWUgPSBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiAoXG4gICAgbm9kZU5hbWUgPT09ICdpbnB1dCcgfHxcbiAgICBub2RlTmFtZSA9PT0gJ3NlbGVjdCcgfHxcbiAgICBub2RlTmFtZSA9PT0gJ2J1dHRvbicgfHxcbiAgICBub2RlTmFtZSA9PT0gJ3RleHRhcmVhJ1xuICApO1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgYW4gYDxpbnB1dCB0eXBlPVwiaGlkZGVuXCI+YC4gKi9cbmZ1bmN0aW9uIGlzSGlkZGVuSW5wdXQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzSW5wdXRFbGVtZW50KGVsZW1lbnQpICYmIGVsZW1lbnQudHlwZSA9PSAnaGlkZGVuJztcbn1cblxuLyoqIEdldHMgd2hldGhlciBhbiBlbGVtZW50IGlzIGFuIGFuY2hvciB0aGF0IGhhcyBhbiBocmVmIGF0dHJpYnV0ZS4gKi9cbmZ1bmN0aW9uIGlzQW5jaG9yV2l0aEhyZWYoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQW5jaG9yRWxlbWVudChlbGVtZW50KSAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpO1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgYW4gaW5wdXQgZWxlbWVudC4gKi9cbmZ1bmN0aW9uIGlzSW5wdXRFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogZWxlbWVudCBpcyBIVE1MSW5wdXRFbGVtZW50IHtcbiAgcmV0dXJuIGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PSAnaW5wdXQnO1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgYW4gYW5jaG9yIGVsZW1lbnQuICovXG5mdW5jdGlvbiBpc0FuY2hvckVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBlbGVtZW50IGlzIEhUTUxBbmNob3JFbGVtZW50IHtcbiAgcmV0dXJuIGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PSAnYSc7XG59XG5cbi8qKiBHZXRzIHdoZXRoZXIgYW4gZWxlbWVudCBoYXMgYSB2YWxpZCB0YWJpbmRleC4gKi9cbmZ1bmN0aW9uIGhhc1ZhbGlkVGFiSW5kZXgoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcbiAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZSgndGFiaW5kZXgnKSB8fCBlbGVtZW50LnRhYkluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBsZXQgdGFiSW5kZXggPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgcmV0dXJuICEhKHRhYkluZGV4ICYmICFpc05hTihwYXJzZUludCh0YWJJbmRleCwgMTApKSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGFyc2VkIHRhYmluZGV4IGZyb20gdGhlIGVsZW1lbnQgYXR0cmlidXRlcyBpbnN0ZWFkIG9mIHJldHVybmluZyB0aGVcbiAqIGV2YWx1YXRlZCB0YWJpbmRleCBmcm9tIHRoZSBicm93c2VycyBkZWZhdWx0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFiSW5kZXhWYWx1ZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IG51bWJlciB8IG51bGwge1xuICBpZiAoIWhhc1ZhbGlkVGFiSW5kZXgoZWxlbWVudCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFNlZSBicm93c2VyIGlzc3VlIGluIEdlY2tvIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTExMjgwNTRcbiAgY29uc3QgdGFiSW5kZXggPSBwYXJzZUludChlbGVtZW50LmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKSB8fCAnJywgMTApO1xuXG4gIHJldHVybiBpc05hTih0YWJJbmRleCkgPyAtMSA6IHRhYkluZGV4O1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBlbGVtZW50IGlzIHBvdGVudGlhbGx5IHRhYmJhYmxlIG9uIGlPUyAqL1xuZnVuY3Rpb24gaXNQb3RlbnRpYWxseVRhYmJhYmxlSU9TKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gIGxldCBub2RlTmFtZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgbGV0IGlucHV0VHlwZSA9IG5vZGVOYW1lID09PSAnaW5wdXQnICYmIChlbGVtZW50IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnR5cGU7XG5cbiAgcmV0dXJuIChcbiAgICBpbnB1dFR5cGUgPT09ICd0ZXh0JyB8fFxuICAgIGlucHV0VHlwZSA9PT0gJ3Bhc3N3b3JkJyB8fFxuICAgIG5vZGVOYW1lID09PSAnc2VsZWN0JyB8fFxuICAgIG5vZGVOYW1lID09PSAndGV4dGFyZWEnXG4gICk7XG59XG5cbi8qKlxuICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgcG90ZW50aWFsbHkgZm9jdXNhYmxlIHdpdGhvdXQgdGFraW5nIGN1cnJlbnQgdmlzaWJsZS9kaXNhYmxlZCBzdGF0ZVxuICogaW50byBhY2NvdW50LlxuICovXG5mdW5jdGlvbiBpc1BvdGVudGlhbGx5Rm9jdXNhYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gIC8vIElucHV0cyBhcmUgcG90ZW50aWFsbHkgZm9jdXNhYmxlICp1bmxlc3MqIHRoZXkncmUgdHlwZT1cImhpZGRlblwiLlxuICBpZiAoaXNIaWRkZW5JbnB1dChlbGVtZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgaXNOYXRpdmVGb3JtRWxlbWVudChlbGVtZW50KSB8fFxuICAgIGlzQW5jaG9yV2l0aEhyZWYoZWxlbWVudCkgfHxcbiAgICBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJykgfHxcbiAgICBoYXNWYWxpZFRhYkluZGV4KGVsZW1lbnQpXG4gICk7XG59XG5cbi8qKiBHZXRzIHRoZSBwYXJlbnQgd2luZG93IG9mIGEgRE9NIG5vZGUgd2l0aCByZWdhcmRzIG9mIGJlaW5nIGluc2lkZSBvZiBhbiBpZnJhbWUuICovXG5mdW5jdGlvbiBnZXRXaW5kb3cobm9kZTogSFRNTEVsZW1lbnQpOiBXaW5kb3cge1xuICAvLyBvd25lckRvY3VtZW50IGlzIG51bGwgaWYgYG5vZGVgIGl0c2VsZiAqaXMqIGEgZG9jdW1lbnQuXG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgfHwgd2luZG93O1xufVxuIl19