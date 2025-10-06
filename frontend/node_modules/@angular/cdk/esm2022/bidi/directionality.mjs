/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Inject, Injectable, Optional } from '@angular/core';
import { DIR_DOCUMENT } from './dir-document-token';
import * as i0 from "@angular/core";
/** Regex that matches locales with an RTL script. Taken from `goog.i18n.bidi.isRtlLanguage`. */
const RTL_LOCALE_PATTERN = /^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;
/** Resolves a string value to a specific direction. */
export function _resolveDirectionality(rawValue) {
    const value = rawValue?.toLowerCase() || '';
    if (value === 'auto' && typeof navigator !== 'undefined' && navigator?.language) {
        return RTL_LOCALE_PATTERN.test(navigator.language) ? 'rtl' : 'ltr';
    }
    return value === 'rtl' ? 'rtl' : 'ltr';
}
/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
export class Directionality {
    constructor(_document) {
        /** The current 'ltr' or 'rtl' value. */
        this.value = 'ltr';
        /** Stream that emits whenever the 'ltr' / 'rtl' state changes. */
        this.change = new EventEmitter();
        if (_document) {
            const bodyDir = _document.body ? _document.body.dir : null;
            const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
            this.value = _resolveDirectionality(bodyDir || htmlDir || 'ltr');
        }
    }
    ngOnDestroy() {
        this.change.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Directionality, deps: [{ token: DIR_DOCUMENT, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Directionality, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Directionality, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DIR_DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aW9uYWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2JpZGkvZGlyZWN0aW9uYWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7O0FBSWxELGdHQUFnRztBQUNoRyxNQUFNLGtCQUFrQixHQUN0QixvSEFBb0gsQ0FBQztBQUV2SCx1REFBdUQ7QUFDdkQsTUFBTSxVQUFVLHNCQUFzQixDQUFDLFFBQWdCO0lBQ3JELE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFFNUMsSUFBSSxLQUFLLEtBQUssTUFBTSxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDaEYsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNyRSxDQUFDO0lBRUQsT0FBTyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN6QyxDQUFDO0FBRUQ7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGNBQWM7SUFPekIsWUFBOEMsU0FBZTtRQU43RCx3Q0FBd0M7UUFDL0IsVUFBSyxHQUFjLEtBQUssQ0FBQztRQUVsQyxrRUFBa0U7UUFDekQsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFhLENBQUM7UUFHOUMsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDM0QsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNqRixJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFzQixDQUFDLE9BQU8sSUFBSSxPQUFPLElBQUksS0FBSyxDQUFDLENBQUM7UUFDbkUsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QixDQUFDO3FIQWpCVSxjQUFjLGtCQU9PLFlBQVk7eUhBUGpDLGNBQWMsY0FERixNQUFNOztrR0FDbEIsY0FBYztrQkFEMUIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQVFqQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5qZWN0YWJsZSwgT3B0aW9uYWwsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RJUl9ET0NVTUVOVH0gZnJvbSAnLi9kaXItZG9jdW1lbnQtdG9rZW4nO1xuXG5leHBvcnQgdHlwZSBEaXJlY3Rpb24gPSAnbHRyJyB8ICdydGwnO1xuXG4vKiogUmVnZXggdGhhdCBtYXRjaGVzIGxvY2FsZXMgd2l0aCBhbiBSVEwgc2NyaXB0LiBUYWtlbiBmcm9tIGBnb29nLmkxOG4uYmlkaS5pc1J0bExhbmd1YWdlYC4gKi9cbmNvbnN0IFJUTF9MT0NBTEVfUEFUVEVSTiA9XG4gIC9eKGFyfGNrYnxkdnxoZXxpd3xmYXxucW98cHN8c2R8dWd8dXJ8eWl8LipbLV9dKEFkbG18QXJhYnxIZWJyfE5rb298Um9oZ3xUaGFhKSkoPyEuKlstX10oTGF0bnxDeXJsKSgkfC18XykpKCR8LXxfKS9pO1xuXG4vKiogUmVzb2x2ZXMgYSBzdHJpbmcgdmFsdWUgdG8gYSBzcGVjaWZpYyBkaXJlY3Rpb24uICovXG5leHBvcnQgZnVuY3Rpb24gX3Jlc29sdmVEaXJlY3Rpb25hbGl0eShyYXdWYWx1ZTogc3RyaW5nKTogRGlyZWN0aW9uIHtcbiAgY29uc3QgdmFsdWUgPSByYXdWYWx1ZT8udG9Mb3dlckNhc2UoKSB8fCAnJztcblxuICBpZiAodmFsdWUgPT09ICdhdXRvJyAmJiB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3I/Lmxhbmd1YWdlKSB7XG4gICAgcmV0dXJuIFJUTF9MT0NBTEVfUEFUVEVSTi50ZXN0KG5hdmlnYXRvci5sYW5ndWFnZSkgPyAncnRsJyA6ICdsdHInO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlID09PSAncnRsJyA/ICdydGwnIDogJ2x0cic7XG59XG5cbi8qKlxuICogVGhlIGRpcmVjdGlvbmFsaXR5IChMVFIgLyBSVEwpIGNvbnRleHQgZm9yIHRoZSBhcHBsaWNhdGlvbiAob3IgYSBzdWJ0cmVlIG9mIGl0KS5cbiAqIEV4cG9zZXMgdGhlIGN1cnJlbnQgZGlyZWN0aW9uIGFuZCBhIHN0cmVhbSBvZiBkaXJlY3Rpb24gY2hhbmdlcy5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRGlyZWN0aW9uYWxpdHkgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogVGhlIGN1cnJlbnQgJ2x0cicgb3IgJ3J0bCcgdmFsdWUuICovXG4gIHJlYWRvbmx5IHZhbHVlOiBEaXJlY3Rpb24gPSAnbHRyJztcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlICdsdHInIC8gJ3J0bCcgc3RhdGUgY2hhbmdlcy4gKi9cbiAgcmVhZG9ubHkgY2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxEaXJlY3Rpb24+KCk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQEluamVjdChESVJfRE9DVU1FTlQpIF9kb2N1bWVudD86IGFueSkge1xuICAgIGlmIChfZG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0IGJvZHlEaXIgPSBfZG9jdW1lbnQuYm9keSA/IF9kb2N1bWVudC5ib2R5LmRpciA6IG51bGw7XG4gICAgICBjb25zdCBodG1sRGlyID0gX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/IF9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZGlyIDogbnVsbDtcbiAgICAgIHRoaXMudmFsdWUgPSBfcmVzb2x2ZURpcmVjdGlvbmFsaXR5KGJvZHlEaXIgfHwgaHRtbERpciB8fCAnbHRyJyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgfVxufVxuIl19