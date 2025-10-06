/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Output, Input, EventEmitter } from '@angular/core';
import { Directionality, _resolveDirectionality } from './directionality';
import * as i0 from "@angular/core";
/**
 * Directive to listen for changes of direction of part of the DOM.
 *
 * Provides itself as Directionality such that descendant directives only need to ever inject
 * Directionality to get the closest direction.
 */
export class Dir {
    constructor() {
        /** Normalized direction that accounts for invalid/unsupported values. */
        this._dir = 'ltr';
        /** Whether the `value` has been set to its initial value. */
        this._isInitialized = false;
        /** Event emitted when the direction changes. */
        this.change = new EventEmitter();
    }
    /** @docs-private */
    get dir() {
        return this._dir;
    }
    set dir(value) {
        const previousValue = this._dir;
        // Note: `_resolveDirectionality` resolves the language based on the browser's language,
        // whereas the browser does it based on the content of the element. Since doing so based
        // on the content can be expensive, for now we're doing the simpler matching.
        this._dir = _resolveDirectionality(value);
        this._rawDir = value;
        if (previousValue !== this._dir && this._isInitialized) {
            this.change.emit(this._dir);
        }
    }
    /** Current layout direction of the element. */
    get value() {
        return this.dir;
    }
    /** Initialize once default value has been set. */
    ngAfterContentInit() {
        this._isInitialized = true;
    }
    ngOnDestroy() {
        this.change.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dir, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: Dir, isStandalone: true, selector: "[dir]", inputs: { dir: "dir" }, outputs: { change: "dirChange" }, host: { properties: { "attr.dir": "_rawDir" } }, providers: [{ provide: Directionality, useExisting: Dir }], exportAs: ["dir"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: Dir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[dir]',
                    providers: [{ provide: Directionality, useExisting: Dir }],
                    host: { '[attr.dir]': '_rawDir' },
                    exportAs: 'dir',
                    standalone: true,
                }]
        }], propDecorators: { change: [{
                type: Output,
                args: ['dirChange']
            }], dir: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9iaWRpL2Rpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUE4QixNQUFNLGVBQWUsQ0FBQztBQUVsRyxPQUFPLEVBQVksY0FBYyxFQUFFLHNCQUFzQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7O0FBRW5GOzs7OztHQUtHO0FBUUgsTUFBTSxPQUFPLEdBQUc7SUFQaEI7UUFRRSx5RUFBeUU7UUFDakUsU0FBSSxHQUFjLEtBQUssQ0FBQztRQUVoQyw2REFBNkQ7UUFDckQsbUJBQWMsR0FBWSxLQUFLLENBQUM7UUFLeEMsZ0RBQWdEO1FBQ2xCLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBYSxDQUFDO0tBa0N0RTtJQWhDQyxvQkFBb0I7SUFDcEIsSUFDSSxHQUFHO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFDRCxJQUFJLEdBQUcsQ0FBQyxLQUF5QjtRQUMvQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRWhDLHdGQUF3RjtRQUN4Rix3RkFBd0Y7UUFDeEYsNkVBQTZFO1FBQzdFLElBQUksQ0FBQyxJQUFJLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFckIsSUFBSSxhQUFhLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQsK0NBQStDO0lBQy9DLElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQixDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQztxSEE1Q1UsR0FBRzt5R0FBSCxHQUFHLCtKQUxILENBQUMsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUMsQ0FBQzs7a0dBSzdDLEdBQUc7a0JBUGYsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsT0FBTztvQkFDakIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsS0FBSyxFQUFDLENBQUM7b0JBQ3hELElBQUksRUFBRSxFQUFDLFlBQVksRUFBRSxTQUFTLEVBQUM7b0JBQy9CLFFBQVEsRUFBRSxLQUFLO29CQUNmLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs4QkFZK0IsTUFBTTtzQkFBbkMsTUFBTTt1QkFBQyxXQUFXO2dCQUlmLEdBQUc7c0JBRE4sS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgT3V0cHV0LCBJbnB1dCwgRXZlbnRFbWl0dGVyLCBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHksIF9yZXNvbHZlRGlyZWN0aW9uYWxpdHl9IGZyb20gJy4vZGlyZWN0aW9uYWxpdHknO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0byBsaXN0ZW4gZm9yIGNoYW5nZXMgb2YgZGlyZWN0aW9uIG9mIHBhcnQgb2YgdGhlIERPTS5cbiAqXG4gKiBQcm92aWRlcyBpdHNlbGYgYXMgRGlyZWN0aW9uYWxpdHkgc3VjaCB0aGF0IGRlc2NlbmRhbnQgZGlyZWN0aXZlcyBvbmx5IG5lZWQgdG8gZXZlciBpbmplY3RcbiAqIERpcmVjdGlvbmFsaXR5IHRvIGdldCB0aGUgY2xvc2VzdCBkaXJlY3Rpb24uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tkaXJdJyxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IERpcmVjdGlvbmFsaXR5LCB1c2VFeGlzdGluZzogRGlyfV0sXG4gIGhvc3Q6IHsnW2F0dHIuZGlyXSc6ICdfcmF3RGlyJ30sXG4gIGV4cG9ydEFzOiAnZGlyJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgRGlyIGltcGxlbWVudHMgRGlyZWN0aW9uYWxpdHksIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBOb3JtYWxpemVkIGRpcmVjdGlvbiB0aGF0IGFjY291bnRzIGZvciBpbnZhbGlkL3Vuc3VwcG9ydGVkIHZhbHVlcy4gKi9cbiAgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb24gPSAnbHRyJztcblxuICAvKiogV2hldGhlciB0aGUgYHZhbHVlYCBoYXMgYmVlbiBzZXQgdG8gaXRzIGluaXRpYWwgdmFsdWUuICovXG4gIHByaXZhdGUgX2lzSW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogRGlyZWN0aW9uIGFzIHBhc3NlZCBpbiBieSB0aGUgY29uc3VtZXIuICovXG4gIF9yYXdEaXI6IHN0cmluZztcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBkaXJlY3Rpb24gY2hhbmdlcy4gKi9cbiAgQE91dHB1dCgnZGlyQ2hhbmdlJykgcmVhZG9ubHkgY2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxEaXJlY3Rpb24+KCk7XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpcigpOiBEaXJlY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9kaXI7XG4gIH1cbiAgc2V0IGRpcih2YWx1ZTogRGlyZWN0aW9uIHwgJ2F1dG8nKSB7XG4gICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMuX2RpcjtcblxuICAgIC8vIE5vdGU6IGBfcmVzb2x2ZURpcmVjdGlvbmFsaXR5YCByZXNvbHZlcyB0aGUgbGFuZ3VhZ2UgYmFzZWQgb24gdGhlIGJyb3dzZXIncyBsYW5ndWFnZSxcbiAgICAvLyB3aGVyZWFzIHRoZSBicm93c2VyIGRvZXMgaXQgYmFzZWQgb24gdGhlIGNvbnRlbnQgb2YgdGhlIGVsZW1lbnQuIFNpbmNlIGRvaW5nIHNvIGJhc2VkXG4gICAgLy8gb24gdGhlIGNvbnRlbnQgY2FuIGJlIGV4cGVuc2l2ZSwgZm9yIG5vdyB3ZSdyZSBkb2luZyB0aGUgc2ltcGxlciBtYXRjaGluZy5cbiAgICB0aGlzLl9kaXIgPSBfcmVzb2x2ZURpcmVjdGlvbmFsaXR5KHZhbHVlKTtcbiAgICB0aGlzLl9yYXdEaXIgPSB2YWx1ZTtcblxuICAgIGlmIChwcmV2aW91c1ZhbHVlICE9PSB0aGlzLl9kaXIgJiYgdGhpcy5faXNJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5jaGFuZ2UuZW1pdCh0aGlzLl9kaXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDdXJyZW50IGxheW91dCBkaXJlY3Rpb24gb2YgdGhlIGVsZW1lbnQuICovXG4gIGdldCB2YWx1ZSgpOiBEaXJlY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmRpcjtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplIG9uY2UgZGVmYXVsdCB2YWx1ZSBoYXMgYmVlbiBzZXQuICovXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuY2hhbmdlLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==