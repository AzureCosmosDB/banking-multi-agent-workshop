/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken, Input } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `MatSuffix`. It serves as
 * alternative token to the actual `MatSuffix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_SUFFIX = new InjectionToken('MatSuffix');
/** Suffix to be placed at the end of the form field. */
export class MatSuffix {
    constructor() {
        this._isText = false;
    }
    set _isTextSelector(value) {
        this._isText = true;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSuffix, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatSuffix, isStandalone: true, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: { _isTextSelector: ["matTextSuffix", "_isTextSelector"] }, providers: [{ provide: MAT_SUFFIX, useExisting: MatSuffix }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSuffix, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matSuffix], [matIconSuffix], [matTextSuffix]',
                    providers: [{ provide: MAT_SUFFIX, useExisting: MatSuffix }],
                    standalone: true,
                }]
        }], propDecorators: { _isTextSelector: [{
                type: Input,
                args: ['matTextSuffix']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VmZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvZGlyZWN0aXZlcy9zdWZmaXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUUvRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLElBQUksY0FBYyxDQUFZLFdBQVcsQ0FBQyxDQUFDO0FBRXJFLHdEQUF3RDtBQU14RCxNQUFNLE9BQU8sU0FBUztJQUx0QjtRQVdFLFlBQU8sR0FBRyxLQUFLLENBQUM7S0FDakI7SUFOQyxJQUNJLGVBQWUsQ0FBQyxLQUFTO1FBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7cUhBSlUsU0FBUzt5R0FBVCxTQUFTLCtKQUhULENBQUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUMsQ0FBQzs7a0dBRy9DLFNBQVM7a0JBTHJCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLCtDQUErQztvQkFDekQsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsV0FBVyxFQUFDLENBQUM7b0JBQzFELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs4QkFHSyxlQUFlO3NCQURsQixLQUFLO3VCQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEluamVjdGlvblRva2VuLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgTWF0U3VmZml4YC4gSXQgc2VydmVzIGFzXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBNYXRTdWZmaXhgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgTUFUX1NVRkZJWCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRTdWZmaXg+KCdNYXRTdWZmaXgnKTtcblxuLyoqIFN1ZmZpeCB0byBiZSBwbGFjZWQgYXQgdGhlIGVuZCBvZiB0aGUgZm9ybSBmaWVsZC4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRTdWZmaXhdLCBbbWF0SWNvblN1ZmZpeF0sIFttYXRUZXh0U3VmZml4XScsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBNQVRfU1VGRklYLCB1c2VFeGlzdGluZzogTWF0U3VmZml4fV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFN1ZmZpeCB7XG4gIEBJbnB1dCgnbWF0VGV4dFN1ZmZpeCcpXG4gIHNldCBfaXNUZXh0U2VsZWN0b3IodmFsdWU6ICcnKSB7XG4gICAgdGhpcy5faXNUZXh0ID0gdHJ1ZTtcbiAgfVxuXG4gIF9pc1RleHQgPSBmYWxzZTtcbn1cbiJdfQ==