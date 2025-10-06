/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ALT, CONTROL, MAC_META, META, SHIFT } from '@angular/cdk/keycodes';
import { Inject, Injectable, InjectionToken, Optional, NgZone } from '@angular/core';
import { normalizePassiveListenerOptions, Platform, _getEventTarget } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, skip } from 'rxjs/operators';
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader, } from '../fake-event-detection';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/**
 * Injectable options for the InputModalityDetector. These are shallowly merged with the default
 * options.
 */
export const INPUT_MODALITY_DETECTOR_OPTIONS = new InjectionToken('cdk-input-modality-detector-options');
/**
 * Default options for the InputModalityDetector.
 *
 * Modifier keys are ignored by default (i.e. when pressed won't cause the service to detect
 * keyboard input modality) for two reasons:
 *
 * 1. Modifier keys are commonly used with mouse to perform actions such as 'right click' or 'open
 *    in new tab', and are thus less representative of actual keyboard interaction.
 * 2. VoiceOver triggers some keyboard events when linearly navigating with Control + Option (but
 *    confusingly not with Caps Lock). Thus, to have parity with other screen readers, we ignore
 *    these keys so as to not update the input modality.
 *
 * Note that we do not by default ignore the right Meta key on Safari because it has the same key
 * code as the ContextMenu key on other browsers. When we switch to using event.key, we can
 * distinguish between the two.
 */
export const INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS = {
    ignoreKeys: [ALT, CONTROL, MAC_META, META, SHIFT],
};
/**
 * The amount of time needed to pass after a touchstart event in order for a subsequent mousedown
 * event to be attributed as mouse and not touch.
 *
 * This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
 * that a value of around 650ms seems appropriate.
 */
export const TOUCH_BUFFER_MS = 650;
/**
 * Event listener options that enable capturing and also mark the listener as passive if the browser
 * supports it.
 */
const modalityEventListenerOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
});
/**
 * Service that detects the user's input modality.
 *
 * This service does not update the input modality when a user navigates with a screen reader
 * (e.g. linear navigation with VoiceOver, object navigation / browse mode with NVDA, virtual PC
 * cursor mode with JAWS). This is in part due to technical limitations (i.e. keyboard events do not
 * fire as expected in these modes) but is also arguably the correct behavior. Navigating with a
 * screen reader is akin to visually scanning a page, and should not be interpreted as actual user
 * input interaction.
 *
 * When a user is not navigating but *interacting* with a screen reader, this service attempts to
 * update the input modality to keyboard, but in general this service's behavior is largely
 * undefined.
 */
export class InputModalityDetector {
    /** The most recently detected input modality. */
    get mostRecentModality() {
        return this._modality.value;
    }
    constructor(_platform, ngZone, document, options) {
        this._platform = _platform;
        /**
         * The most recently detected input modality event target. Is null if no input modality has been
         * detected or if the associated event target is null for some unknown reason.
         */
        this._mostRecentTarget = null;
        /** The underlying BehaviorSubject that emits whenever an input modality is detected. */
        this._modality = new BehaviorSubject(null);
        /**
         * The timestamp of the last touch input modality. Used to determine whether mousedown events
         * should be attributed to mouse or touch.
         */
        this._lastTouchMs = 0;
        /**
         * Handles keydown events. Must be an arrow function in order to preserve the context when it gets
         * bound.
         */
        this._onKeydown = (event) => {
            // If this is one of the keys we should ignore, then ignore it and don't update the input
            // modality to keyboard.
            if (this._options?.ignoreKeys?.some(keyCode => keyCode === event.keyCode)) {
                return;
            }
            this._modality.next('keyboard');
            this._mostRecentTarget = _getEventTarget(event);
        };
        /**
         * Handles mousedown events. Must be an arrow function in order to preserve the context when it
         * gets bound.
         */
        this._onMousedown = (event) => {
            // Touches trigger both touch and mouse events, so we need to distinguish between mouse events
            // that were triggered via mouse vs touch. To do so, check if the mouse event occurs closely
            // after the previous touch event.
            if (Date.now() - this._lastTouchMs < TOUCH_BUFFER_MS) {
                return;
            }
            // Fake mousedown events are fired by some screen readers when controls are activated by the
            // screen reader. Attribute them to keyboard input modality.
            this._modality.next(isFakeMousedownFromScreenReader(event) ? 'keyboard' : 'mouse');
            this._mostRecentTarget = _getEventTarget(event);
        };
        /**
         * Handles touchstart events. Must be an arrow function in order to preserve the context when it
         * gets bound.
         */
        this._onTouchstart = (event) => {
            // Same scenario as mentioned in _onMousedown, but on touch screen devices, fake touchstart
            // events are fired. Again, attribute to keyboard input modality.
            if (isFakeTouchstartFromScreenReader(event)) {
                this._modality.next('keyboard');
                return;
            }
            // Store the timestamp of this touch event, as it's used to distinguish between mouse events
            // triggered via mouse vs touch.
            this._lastTouchMs = Date.now();
            this._modality.next('touch');
            this._mostRecentTarget = _getEventTarget(event);
        };
        this._options = {
            ...INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS,
            ...options,
        };
        // Skip the first emission as it's null.
        this.modalityDetected = this._modality.pipe(skip(1));
        this.modalityChanged = this.modalityDetected.pipe(distinctUntilChanged());
        // If we're not in a browser, this service should do nothing, as there's no relevant input
        // modality to detect.
        if (_platform.isBrowser) {
            ngZone.runOutsideAngular(() => {
                document.addEventListener('keydown', this._onKeydown, modalityEventListenerOptions);
                document.addEventListener('mousedown', this._onMousedown, modalityEventListenerOptions);
                document.addEventListener('touchstart', this._onTouchstart, modalityEventListenerOptions);
            });
        }
    }
    ngOnDestroy() {
        this._modality.complete();
        if (this._platform.isBrowser) {
            document.removeEventListener('keydown', this._onKeydown, modalityEventListenerOptions);
            document.removeEventListener('mousedown', this._onMousedown, modalityEventListenerOptions);
            document.removeEventListener('touchstart', this._onTouchstart, modalityEventListenerOptions);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InputModalityDetector, deps: [{ token: i1.Platform }, { token: i0.NgZone }, { token: DOCUMENT }, { token: INPUT_MODALITY_DETECTOR_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InputModalityDetector, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InputModalityDetector, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Platform }, { type: i0.NgZone }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [INPUT_MODALITY_DETECTOR_OPTIONS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbW9kYWxpdHktZGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvaW5wdXQtbW9kYWxpdHkvaW5wdXQtbW9kYWxpdHktZGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQWEsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RixPQUFPLEVBQUMsK0JBQStCLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2pHLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsZUFBZSxFQUFhLE1BQU0sTUFBTSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxRCxPQUFPLEVBQ0wsK0JBQStCLEVBQy9CLGdDQUFnQyxHQUNqQyxNQUFNLHlCQUF5QixDQUFDOzs7QUFhakM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxjQUFjLENBQy9ELHFDQUFxQyxDQUN0QyxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUNBQXVDLEdBQWlDO0lBQ25GLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7Q0FDbEQsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFFbkM7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IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FMVCwgQ09OVFJPTCwgTUFDX01FVEEsIE1FVEEsIFNISUZUfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPbkRlc3Ryb3ksIE9wdGlvbmFsLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zLCBQbGF0Zm9ybSwgX2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWQsIHNraXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIGlzRmFrZU1vdXNlZG93bkZyb21TY3JlZW5SZWFkZXIsXG4gIGlzRmFrZVRvdWNoc3RhcnRGcm9tU2NyZWVuUmVhZGVyLFxufSBmcm9tICcuLi9mYWtlLWV2ZW50LWRldGVjdGlvbic7XG5cbi8qKlxuICogVGhlIGlucHV0IG1vZGFsaXRpZXMgZGV0ZWN0ZWQgYnkgdGhpcyBzZXJ2aWNlLiBOdWxsIGlzIHVzZWQgaWYgdGhlIGlucHV0IG1vZGFsaXR5IGlzIHVua25vd24uXG4gKi9cbmV4cG9ydCB0eXBlIElucHV0TW9kYWxpdHkgPSAna2V5Ym9hcmQnIHwgJ21vdXNlJyB8ICd0b3VjaCcgfCBudWxsO1xuXG4vKiogT3B0aW9ucyB0byBjb25maWd1cmUgdGhlIGJlaGF2aW9yIG9mIHRoZSBJbnB1dE1vZGFsaXR5RGV0ZWN0b3IuICovXG5leHBvcnQgaW50ZXJmYWNlIElucHV0TW9kYWxpdHlEZXRlY3Rvck9wdGlvbnMge1xuICAvKiogS2V5cyB0byBpZ25vcmUgd2hlbiBkZXRlY3Rpbmcga2V5Ym9hcmQgaW5wdXQgbW9kYWxpdHkuICovXG4gIGlnbm9yZUtleXM/OiBudW1iZXJbXTtcbn1cblxuLyoqXG4gKiBJbmplY3RhYmxlIG9wdGlvbnMgZm9yIHRoZSBJbnB1dE1vZGFsaXR5RGV0ZWN0b3IuIFRoZXNlIGFyZSBzaGFsbG93bHkgbWVyZ2VkIHdpdGggdGhlIGRlZmF1bHRcbiAqIG9wdGlvbnMuXG4gKi9cbmV4cG9ydCBjb25zdCBJTlBVVF9NT0RBTElUWV9ERVRFQ1RPUl9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPElucHV0TW9kYWxpdHlEZXRlY3Rvck9wdGlvbnM+KFxuICAnY2RrLWlucHV0LW1vZGFsaXR5LWRldGVjdG9yLW9wdGlvbnMnLFxuKTtcblxuLyoqXG4gKiBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBJbnB1dE1vZGFsaXR5RGV0ZWN0b3IuXG4gKlxuICogTW9kaWZpZXIga2V5cyBhcmUgaWdub3JlZCBieSBkZWZhdWx0IChpLmUuIHdoZW4gcHJlc3NlZCB3b24ndCBjYXVzZSB0aGUgc2VydmljZSB0byBkZXRlY3RcbiAqIGtleWJvYXJkIGlucHV0IG1vZGFsaXR5KSBmb3IgdHdvIHJlYXNvbnM6XG4gKlxuICogMS4gTW9kaWZpZXIga2V5cyBhcmUgY29tbW9ubHkgdXNlZCB3aXRoIG1vdXNlIHRvIHBlcmZvcm0gYWN0aW9ucyBzdWNoIGFzICdyaWdodCBjbGljaycgb3IgJ29wZW5cbiAqICAgIGluIG5ldyB0YWInLCBhbmQgYXJlIHRodXMgbGVzcyByZXByZXNlbnRhdGl2ZSBvZiBhY3R1YWwga2V5Ym9hcmQgaW50ZXJhY3Rpb24uXG4gKiAyLiBWb2ljZU92ZXIgdHJpZ2dlcnMgc29tZSBrZXlib2FyZCBldmVudHMgd2hlbiBsaW5lYXJseSBuYXZpZ2F0aW5nIHdpdGggQ29udHJvbCArIE9wdGlvbiAoYnV0XG4gKiAgICBjb25mdXNpbmdseSBub3Qgd2l0aCBDYXBzIExvY2spLiBUaHVzLCB0byBoYXZlIHBhcml0eSB3aXRoIG90aGVyIHNjcmVlbiByZWFkZXJzLCB3ZSBpZ25vcmVcbiAqICAgIHRoZXNlIGtleXMgc28gYXMgdG8gbm90IHVwZGF0ZSB0aGUgaW5wdXQgbW9kYWxpdHkuXG4gKlxuICogTm90ZSB0aGF0IHdlIGRvIG5vdCBieSBkZWZhdWx0IGlnbm9yZSB0aGUgcmlnaHQgTWV0YSBrZXkgb24gU2FmYXJpIGJlY2F1c2UgaXQgaGFzIHRoZSBzYW1lIGtleVxuICogY29kZSBhcyB0aGUgQ29udGV4dE1lbnUga2V5IG9uIG90aGVyIGJyb3dzZXJzLiBXaGVuIHdlIHN3aXRjaCB0byB1c2luZyBldmVudC5rZXksIHdlIGNhblxuICogZGlzdGluZ3Vpc2ggYmV0d2VlbiB0aGUgdHdvLlxuICovXG5leHBvcnQgY29uc3QgSU5QVVRfTU9EQUxJVFlfREVURUNUT1JfREVGQVVMVF9PUFRJT05TOiBJbnB1dE1vZGFsaXR5RGV0ZWN0b3JPcHRpb25zID0ge1xuICBpZ25vcmVLZXlzOiBbQUxULCBDT05UUk9MLCBNQUNfTUVUQSwgTUVUQSwgU0hJRlRdLFxufTtcblxuLyoqXG4gKiBUaGUgYW1vdW50IG9mIHRpbWUgbmVlZGVkIHRvIHBhc3MgYWZ0ZXIgYSB0b3VjaHN0YXJ0IGV2ZW50IGluIG9yZGVyIGZvciBhIHN1YnNlcXVlbnQgbW91c2Vkb3duXG4gKiBldmVudCB0byBiZSBhdHRyaWJ1dGVkIGFzIG1vdXNlIGFuZCBub3QgdG91Y2guXG4gKlxuICogVGhpcyBpcyB0aGUgdmFsdWUgdXNlZCBieSBBbmd1bGFySlMgTWF0ZXJpYWwuIFRocm91Z2ggdHJpYWwgYW5kIGVycm9yIChvbiBpUGhvbmUgNlMpIHRoZXkgZm91bmRcbiAqIHRoYXQgYSB2YWx1ZSBvZiBhcm91bmQgNjUwbXMgc2VlbXMgYXBwcm9wcmlhdGUuXG4gKi9cbmV4cG9ydCBjb25zdCBUT1VDSF9CVUZGRVJfTVMgPSA2NTA7XG5cbi8qKlxuICogRXZlbnQgbGlzdGVuZXIgb3B0aW9ucyB0aGF0IGVuYWJsZSBjYXB0dXJpbmcgYW5kIGFsc28gbWFyayB0aGUgbGlzdGVuZXIgYXMgcGFzc2l2ZSBpZiB0aGUgYnJvd3NlclxuICogc3VwcG9ydHMgaXQuXG4gKi9cbmNvbnN0IG1vZGFsaXR5RXZlbnRMaXN0ZW5lck9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtcbiAgcGFzc2l2ZTogdHJ1ZSxcbiAgY2FwdHVyZTogdHJ1ZSxcbn0pO1xuXG4vKipcbiAqIFNlcnZpY2UgdGhhdCBkZXRlY3RzIHRoZSB1c2VyJ3MgaW5wdXQgbW9kYWxpdHkuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGRvZXMgbm90IHVwZGF0ZSB0aGUgaW5wdXQgbW9kYWxpdHkgd2hlbiBhIHVzZXIgbmF2aWdhdGVzIHdpdGggYSBzY3JlZW4gcmVhZGVyXG4gKiAoZS5nLiBsaW5lYXIgbmF2aWdhdGlvbiB3aXRoIFZvaWNlT3Zlciwgb2JqZWN0IG5hdmlnYXRpb24gLyBicm93c2UgbW9kZSB3aXRoIE5WREEsIHZpcnR1YWwgUENcbiAqIGN1cnNvciBtb2RlIHdpdGggSkFXUykuIFRoaXMgaXMgaW4gcGFydCBkdWUgdG8gdGVjaG5pY2FsIGxpbWl0YXRpb25zIChpLmUuIGtleWJvYXJkIGV2ZW50cyBkbyBub3RcbiAqIGZpcmUgYXMgZXhwZWN0ZWQgaW4gdGhlc2UgbW9kZXMpIGJ1dCBpcyBhbHNvIGFyZ3VhYmx5IHRoZSBjb3JyZWN0IGJlaGF2aW9yLiBOYXZpZ2F0aW5nIHdpdGggYVxuICogc2NyZWVuIHJlYWRlciBpcyBha2luIHRvIHZpc3VhbGx5IHNjYW5uaW5nIGEgcGFnZSwgYW5kIHNob3VsZCBub3QgYmUgaW50ZXJwcmV0ZWQgYXMgYWN0dWFsIHVzZXJcbiAqIGlucHV0IGludGVyYWN0aW9uLlxuICpcbiAqIFdoZW4gYSB1c2VyIGlzIG5vdCBuYXZpZ2F0aW5nIGJ1dCAqaW50ZXJhY3RpbmcqIHdpdGggYSBzY3JlZW4gcmVhZGVyLCB0aGlzIHNlcnZpY2UgYXR0ZW1wdHMgdG9cbiAqIHVwZGF0ZSB0aGUgaW5wdXQgbW9kYWxpdHkgdG8ga2V5Ym9hcmQsIGJ1dCBpbiBnZW5lcmFsIHRoaXMgc2VydmljZSdzIGJlaGF2aW9yIGlzIGxhcmdlbHlcbiAqIHVuZGVmaW5lZC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgSW5wdXRNb2RhbGl0eURldGVjdG9yIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIEVtaXRzIHdoZW5ldmVyIGFuIGlucHV0IG1vZGFsaXR5IGlzIGRldGVjdGVkLiAqL1xuICByZWFkb25seSBtb2RhbGl0eURldGVjdGVkOiBPYnNlcnZhYmxlPElucHV0TW9kYWxpdHk+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBpbnB1dCBtb2RhbGl0eSBjaGFuZ2VzLiAqL1xuICByZWFkb25seSBtb2RhbGl0eUNoYW5nZWQ6IE9ic2VydmFibGU8SW5wdXRNb2RhbGl0eT47XG5cbiAgLyoqIFRoZSBtb3N0IHJlY2VudGx5IGRldGVjdGVkIGlucHV0IG1vZGFsaXR5LiAqL1xuICBnZXQgbW9zdFJlY2VudE1vZGFsaXR5KCk6IElucHV0TW9kYWxpdHkge1xuICAgIHJldHVybiB0aGlzLl9tb2RhbGl0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbW9zdCByZWNlbnRseSBkZXRlY3RlZCBpbnB1dCBtb2RhbGl0eSBldmVudCB0YXJnZXQuIElzIG51bGwgaWYgbm8gaW5wdXQgbW9kYWxpdHkgaGFzIGJlZW5cbiAgICogZGV0ZWN0ZWQgb3IgaWYgdGhlIGFzc29jaWF0ZWQgZXZlbnQgdGFyZ2V0IGlzIG51bGwgZm9yIHNvbWUgdW5rbm93biByZWFzb24uXG4gICAqL1xuICBfbW9zdFJlY2VudFRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIHVuZGVybHlpbmcgQmVoYXZpb3JTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbmV2ZXIgYW4gaW5wdXQgbW9kYWxpdHkgaXMgZGV0ZWN0ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX21vZGFsaXR5ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxJbnB1dE1vZGFsaXR5PihudWxsKTtcblxuICAvKiogT3B0aW9ucyBmb3IgdGhpcyBJbnB1dE1vZGFsaXR5RGV0ZWN0b3IuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX29wdGlvbnM6IElucHV0TW9kYWxpdHlEZXRlY3Rvck9wdGlvbnM7XG5cbiAgLyoqXG4gICAqIFRoZSB0aW1lc3RhbXAgb2YgdGhlIGxhc3QgdG91Y2ggaW5wdXQgbW9kYWxpdHkuIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgbW91c2Vkb3duIGV2ZW50c1xuICAgKiBzaG91bGQgYmUgYXR0cmlidXRlZCB0byBtb3VzZSBvciB0b3VjaC5cbiAgICovXG4gIHByaXZhdGUgX2xhc3RUb3VjaE1zID0gMDtcblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlkb3duIGV2ZW50cy4gTXVzdCBiZSBhbiBhcnJvdyBmdW5jdGlvbiBpbiBvcmRlciB0byBwcmVzZXJ2ZSB0aGUgY29udGV4dCB3aGVuIGl0IGdldHNcbiAgICogYm91bmQuXG4gICAqL1xuICBwcml2YXRlIF9vbktleWRvd24gPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAvLyBJZiB0aGlzIGlzIG9uZSBvZiB0aGUga2V5cyB3ZSBzaG91bGQgaWdub3JlLCB0aGVuIGlnbm9yZSBpdCBhbmQgZG9uJ3QgdXBkYXRlIHRoZSBpbnB1dFxuICAgIC8vIG1vZGFsaXR5IHRvIGtleWJvYXJkLlxuICAgIGlmICh0aGlzLl9vcHRpb25zPy5pZ25vcmVLZXlzPy5zb21lKGtleUNvZGUgPT4ga2V5Q29kZSA9PT0gZXZlbnQua2V5Q29kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9tb2RhbGl0eS5uZXh0KCdrZXlib2FyZCcpO1xuICAgIHRoaXMuX21vc3RSZWNlbnRUYXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIG1vdXNlZG93biBldmVudHMuIE11c3QgYmUgYW4gYXJyb3cgZnVuY3Rpb24gaW4gb3JkZXIgdG8gcHJlc2VydmUgdGhlIGNvbnRleHQgd2hlbiBpdFxuICAgKiBnZXRzIGJvdW5kLlxuICAgKi9cbiAgcHJpdmF0ZSBfb25Nb3VzZWRvd24gPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAvLyBUb3VjaGVzIHRyaWdnZXIgYm90aCB0b3VjaCBhbmQgbW91c2UgZXZlbnRzLCBzbyB3ZSBuZWVkIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gbW91c2UgZXZlbnRzXG4gICAgLy8gdGhhdCB3ZXJlIHRyaWdnZXJlZCB2aWEgbW91c2UgdnMgdG91Y2guIFRvIGRvIHNvLCBjaGVjayBpZiB0aGUgbW91c2UgZXZlbnQgb2NjdXJzIGNsb3NlbHlcbiAgICAvLyBhZnRlciB0aGUgcHJldmlvdXMgdG91Y2ggZXZlbnQuXG4gICAgaWYgKERhdGUubm93KCkgLSB0aGlzLl9sYXN0VG91Y2hNcyA8IFRPVUNIX0JVRkZFUl9NUykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZha2UgbW91c2Vkb3duIGV2ZW50cyBhcmUgZmlyZWQgYnkgc29tZSBzY3JlZW4gcmVhZGVycyB3aGVuIGNvbnRyb2xzIGFyZSBhY3RpdmF0ZWQgYnkgdGhlXG4gICAgLy8gc2NyZWVuIHJlYWRlci4gQXR0cmlidXRlIHRoZW0gdG8ga2V5Ym9hcmQgaW5wdXQgbW9kYWxpdHkuXG4gICAgdGhpcy5fbW9kYWxpdHkubmV4dChpc0Zha2VNb3VzZWRvd25Gcm9tU2NyZWVuUmVhZGVyKGV2ZW50KSA/ICdrZXlib2FyZCcgOiAnbW91c2UnKTtcbiAgICB0aGlzLl9tb3N0UmVjZW50VGFyZ2V0ID0gX2dldEV2ZW50VGFyZ2V0KGV2ZW50KTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyB0b3VjaHN0YXJ0IGV2ZW50cy4gTXVzdCBiZSBhbiBhcnJvdyBmdW5jdGlvbiBpbiBvcmRlciB0byBwcmVzZXJ2ZSB0aGUgY29udGV4dCB3aGVuIGl0XG4gICAqIGdldHMgYm91bmQuXG4gICAqL1xuICBwcml2YXRlIF9vblRvdWNoc3RhcnQgPSAoZXZlbnQ6IFRvdWNoRXZlbnQpID0+IHtcbiAgICAvLyBTYW1lIHNjZW5hcmlvIGFzIG1lbnRpb25lZCBpbiBfb25Nb3VzZWRvd24sIGJ1dCBvbiB0b3VjaCBzY3JlZW4gZGV2aWNlcywgZmFrZSB0b3VjaHN0YXJ0XG4gICAgLy8gZXZlbnRzIGFyZSBmaXJlZC4gQWdhaW4sIGF0dHJpYnV0ZSB0byBrZXlib2FyZCBpbnB1dCBtb2RhbGl0eS5cbiAgICBpZiAoaXNGYWtlVG91Y2hzdGFydEZyb21TY3JlZW5SZWFkZXIoZXZlbnQpKSB7XG4gICAgICB0aGlzLl9tb2RhbGl0eS5uZXh0KCdrZXlib2FyZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFN0b3JlIHRoZSB0aW1lc3RhbXAgb2YgdGhpcyB0b3VjaCBldmVudCwgYXMgaXQncyB1c2VkIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gbW91c2UgZXZlbnRzXG4gICAgLy8gdHJpZ2dlcmVkIHZpYSBtb3VzZSB2cyB0b3VjaC5cbiAgICB0aGlzLl9sYXN0VG91Y2hNcyA9IERhdGUubm93KCk7XG5cbiAgICB0aGlzLl9tb2RhbGl0eS5uZXh0KCd0b3VjaCcpO1xuICAgIHRoaXMuX21vc3RSZWNlbnRUYXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogRG9jdW1lbnQsXG4gICAgQE9wdGlvbmFsKClcbiAgICBASW5qZWN0KElOUFVUX01PREFMSVRZX0RFVEVDVE9SX09QVElPTlMpXG4gICAgb3B0aW9ucz86IElucHV0TW9kYWxpdHlEZXRlY3Rvck9wdGlvbnMsXG4gICkge1xuICAgIHRoaXMuX29wdGlvbnMgPSB7XG4gICAgICAuLi5JTlBVVF9NT0RBTElUWV9ERVRFQ1RPUl9ERUZBVUxUX09QVElPTlMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH07XG5cbiAgICAvLyBTa2lwIHRoZSBmaXJzdCBlbWlzc2lvbiBhcyBpdCdzIG51bGwuXG4gICAgdGhpcy5tb2RhbGl0eURldGVjdGVkID0gdGhpcy5fbW9kYWxpdHkucGlwZShza2lwKDEpKTtcbiAgICB0aGlzLm1vZGFsaXR5Q2hhbmdlZCA9IHRoaXMubW9kYWxpdHlEZXRlY3RlZC5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuXG4gICAgLy8gSWYgd2UncmUgbm90IGluIGEgYnJvd3NlciwgdGhpcyBzZXJ2aWNlIHNob3VsZCBkbyBub3RoaW5nLCBhcyB0aGVyZSdzIG5vIHJlbGV2YW50IGlucHV0XG4gICAgLy8gbW9kYWxpdHkgdG8gZGV0ZWN0LlxuICAgIGlmIChfcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duLCBtb2RhbGl0eUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZWRvd24sIG1vZGFsaXR5RXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaHN0YXJ0LCBtb2RhbGl0eUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX21vZGFsaXR5LmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duLCBtb2RhbGl0eUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2Vkb3duLCBtb2RhbGl0eUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoc3RhcnQsIG1vZGFsaXR5RXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICAgIH1cbiAgfVxufVxuIl19