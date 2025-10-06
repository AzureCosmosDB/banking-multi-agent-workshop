/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, inject, Input, NgZone, InjectionToken, } from '@angular/core';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Subscription } from 'rxjs';
import * as i0 from "@angular/core";
/** An injion token for the parent form-field. */
export const FLOATING_LABEL_PARENT = new InjectionToken('FloatingLabelParent');
/**
 * Internal directive that maintains a MDC floating label. This directive does not
 * use the `MDCFloatingLabelFoundation` class, as it is not worth the size cost of
 * including it just to measure the label width and toggle some classes.
 *
 * The use of a directive allows us to conditionally render a floating label in the
 * template without having to manually manage instantiation and destruction of the
 * floating label component based on.
 *
 * The component is responsible for setting up the floating label styles, measuring label
 * width for the outline notch, and providing inputs that can be used to toggle the
 * label's floating or required state.
 */
export class MatFormFieldFloatingLabel {
    /** Whether the label is floating. */
    get floating() {
        return this._floating;
    }
    set floating(value) {
        this._floating = value;
        if (this.monitorResize) {
            this._handleResize();
        }
    }
    /** Whether to monitor for resize events on the floating label. */
    get monitorResize() {
        return this._monitorResize;
    }
    set monitorResize(value) {
        this._monitorResize = value;
        if (this._monitorResize) {
            this._subscribeToResize();
        }
        else {
            this._resizeSubscription.unsubscribe();
        }
    }
    constructor(_elementRef) {
        this._elementRef = _elementRef;
        this._floating = false;
        this._monitorResize = false;
        /** The shared ResizeObserver. */
        this._resizeObserver = inject(SharedResizeObserver);
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        /** The parent form-field. */
        this._parent = inject(FLOATING_LABEL_PARENT);
        /** The current resize event subscription. */
        this._resizeSubscription = new Subscription();
    }
    ngOnDestroy() {
        this._resizeSubscription.unsubscribe();
    }
    /** Gets the width of the label. Used for the outline notch. */
    getWidth() {
        return estimateScrollWidth(this._elementRef.nativeElement);
    }
    /** Gets the HTML element for the floating label. */
    get element() {
        return this._elementRef.nativeElement;
    }
    /** Handles resize events from the ResizeObserver. */
    _handleResize() {
        // In the case where the label grows in size, the following sequence of events occurs:
        // 1. The label grows by 1px triggering the ResizeObserver
        // 2. The notch is expanded to accommodate the entire label
        // 3. The label expands to its full width, triggering the ResizeObserver again
        //
        // This is expected, but If we allow this to all happen within the same macro task it causes an
        // error: `ResizeObserver loop limit exceeded`. Therefore we push the notch resize out until
        // the next macro task.
        setTimeout(() => this._parent._handleLabelResized());
    }
    /** Subscribes to resize events. */
    _subscribeToResize() {
        this._resizeSubscription.unsubscribe();
        this._ngZone.runOutsideAngular(() => {
            this._resizeSubscription = this._resizeObserver
                .observe(this._elementRef.nativeElement, { box: 'border-box' })
                .subscribe(() => this._handleResize());
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldFloatingLabel, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldFloatingLabel, isStandalone: true, selector: "label[matFormFieldFloatingLabel]", inputs: { floating: "floating", monitorResize: "monitorResize" }, host: { properties: { "class.mdc-floating-label--float-above": "floating" }, classAttribute: "mdc-floating-label mat-mdc-floating-label" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldFloatingLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: 'label[matFormFieldFloatingLabel]',
                    host: {
                        'class': 'mdc-floating-label mat-mdc-floating-label',
                        '[class.mdc-floating-label--float-above]': 'floating',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { floating: [{
                type: Input
            }], monitorResize: [{
                type: Input
            }] } });
/**
 * Estimates the scroll width of an element.
 * via https://github.com/material-components/material-components-web/blob/c0a11ef0d000a098fd0c372be8f12d6a99302855/packages/mdc-dom/ponyfill.ts
 */
function estimateScrollWidth(element) {
    // Check the offsetParent. If the element inherits display: none from any
    // parent, the offsetParent property will be null (see
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent).
    // This check ensures we only clone the node when necessary.
    const htmlEl = element;
    if (htmlEl.offsetParent !== null) {
        return htmlEl.scrollWidth;
    }
    const clone = htmlEl.cloneNode(true);
    clone.style.setProperty('position', 'absolute');
    clone.style.setProperty('transform', 'translate(-9999px, -9999px)');
    document.documentElement.appendChild(clone);
    const scrollWidth = clone.scrollWidth;
    clone.remove();
    return scrollWidth;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvYXRpbmctbGFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZm9ybS1maWVsZC9kaXJlY3RpdmVzL2Zsb2F0aW5nLWxhYmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLGNBQWMsR0FDZixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQU9sQyxpREFBaUQ7QUFDakQsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQXNCLHFCQUFxQixDQUFDLENBQUM7QUFFcEc7Ozs7Ozs7Ozs7OztHQVlHO0FBU0gsTUFBTSxPQUFPLHlCQUF5QjtJQUNwQyxxQ0FBcUM7SUFDckMsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDO0lBQ0gsQ0FBQztJQUdELGtFQUFrRTtJQUNsRSxJQUNJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQUksYUFBYSxDQUFDLEtBQWM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDNUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7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QUFDO0lBQ3BFLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDdEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2YsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBJbmplY3Rpb25Ub2tlbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1NoYXJlZFJlc2l6ZU9ic2VydmVyfSBmcm9tICdAYW5ndWxhci9jZGsvb2JzZXJ2ZXJzL3ByaXZhdGUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG4vKiogQW4gaW50ZXJmYWNlIHRoYXQgdGhlIHBhcmVudCBmb3JtLWZpZWxkIHNob3VsZCBpbXBsZW1lbnQgdG8gcmVjZWl2ZSByZXNpemUgZXZlbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBGbG9hdGluZ0xhYmVsUGFyZW50IHtcbiAgX2hhbmRsZUxhYmVsUmVzaXplZCgpOiB2b2lkO1xufVxuXG4vKiogQW4gaW5qaW9uIHRva2VuIGZvciB0aGUgcGFyZW50IGZvcm0tZmllbGQuICovXG5leHBvcnQgY29uc3QgRkxPQVRJTkdfTEFCRUxfUEFSRU5UID0gbmV3IEluamVjdGlvblRva2VuPEZsb2F0aW5nTGFiZWxQYXJlbnQ+KCdGbG9hdGluZ0xhYmVsUGFyZW50Jyk7XG5cbi8qKlxuICogSW50ZXJuYWwgZGlyZWN0aXZlIHRoYXQgbWFpbnRhaW5zIGEgTURDIGZsb2F0aW5nIGxhYmVsLiBUaGlzIGRpcmVjdGl2ZSBkb2VzIG5vdFxuICogdXNlIHRoZSBgTURDRmxvYXRpbmdMYWJlbEZvdW5kYXRpb25gIGNsYXNzLCBhcyBpdCBpcyBub3Qgd29ydGggdGhlIHNpemUgY29zdCBvZlxuICogaW5jbHVkaW5nIGl0IGp1c3QgdG8gbWVhc3VyZSB0aGUgbGFiZWwgd2lkdGggYW5kIHRvZ2dsZSBzb21lIGNsYXNzZXMuXG4gKlxuICogVGhlIHVzZSBvZiBhIGRpcmVjdGl2ZSBhbGxvd3MgdXMgdG8gY29uZGl0aW9uYWxseSByZW5kZXIgYSBmbG9hdGluZyBsYWJlbCBpbiB0aGVcbiAqIHRlbXBsYXRlIHdpdGhvdXQgaGF2aW5nIHRvIG1hbnVhbGx5IG1hbmFnZSBpbnN0YW50aWF0aW9uIGFuZCBkZXN0cnVjdGlvbiBvZiB0aGVcbiAqIGZsb2F0aW5nIGxhYmVsIGNvbXBvbmVudCBiYXNlZCBvbi5cbiAqXG4gKiBUaGUgY29tcG9uZW50IGlzIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHVwIHRoZSBmbG9hdGluZyBsYWJlbCBzdHlsZXMsIG1lYXN1cmluZyBsYWJlbFxuICogd2lkdGggZm9yIHRoZSBvdXRsaW5lIG5vdGNoLCBhbmQgcHJvdmlkaW5nIGlucHV0cyB0aGF0IGNhbiBiZSB1c2VkIHRvIHRvZ2dsZSB0aGVcbiAqIGxhYmVsJ3MgZmxvYXRpbmcgb3IgcmVxdWlyZWQgc3RhdGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2xhYmVsW21hdEZvcm1GaWVsZEZsb2F0aW5nTGFiZWxdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtZGMtZmxvYXRpbmctbGFiZWwgbWF0LW1kYy1mbG9hdGluZy1sYWJlbCcsXG4gICAgJ1tjbGFzcy5tZGMtZmxvYXRpbmctbGFiZWwtLWZsb2F0LWFib3ZlXSc6ICdmbG9hdGluZycsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEZvcm1GaWVsZEZsb2F0aW5nTGFiZWwgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogV2hldGhlciB0aGUgbGFiZWwgaXMgZmxvYXRpbmcuICovXG4gIEBJbnB1dCgpXG4gIGdldCBmbG9hdGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5fZmxvYXRpbmc7XG4gIH1cbiAgc2V0IGZsb2F0aW5nKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZmxvYXRpbmcgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5tb25pdG9yUmVzaXplKSB7XG4gICAgICB0aGlzLl9oYW5kbGVSZXNpemUoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZmxvYXRpbmcgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0byBtb25pdG9yIGZvciByZXNpemUgZXZlbnRzIG9uIHRoZSBmbG9hdGluZyBsYWJlbC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1vbml0b3JSZXNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vbml0b3JSZXNpemU7XG4gIH1cbiAgc2V0IG1vbml0b3JSZXNpemUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9tb25pdG9yUmVzaXplID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX21vbml0b3JSZXNpemUpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvUmVzaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9tb25pdG9yUmVzaXplID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBzaGFyZWQgUmVzaXplT2JzZXJ2ZXIuICovXG4gIHByaXZhdGUgX3Jlc2l6ZU9ic2VydmVyID0gaW5qZWN0KFNoYXJlZFJlc2l6ZU9ic2VydmVyKTtcblxuICAvKiogVGhlIEFuZ3VsYXIgem9uZS4gKi9cbiAgcHJpdmF0ZSBfbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgLyoqIFRoZSBwYXJlbnQgZm9ybS1maWVsZC4gKi9cbiAgcHJpdmF0ZSBfcGFyZW50ID0gaW5qZWN0KEZMT0FUSU5HX0xBQkVMX1BBUkVOVCk7XG5cbiAgLyoqIFRoZSBjdXJyZW50IHJlc2l6ZSBldmVudCBzdWJzY3JpcHRpb24uICovXG4gIHByaXZhdGUgX3Jlc2l6ZVN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50Pikge31cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB3aWR0aCBvZiB0aGUgbGFiZWwuIFVzZWQgZm9yIHRoZSBvdXRsaW5lIG5vdGNoLiAqL1xuICBnZXRXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiBlc3RpbWF0ZVNjcm9sbFdpZHRoKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgSFRNTCBlbGVtZW50IGZvciB0aGUgZmxvYXRpbmcgbGFiZWwuICovXG4gIGdldCBlbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgcmVzaXplIGV2ZW50cyBmcm9tIHRoZSBSZXNpemVPYnNlcnZlci4gKi9cbiAgcHJpdmF0ZSBfaGFuZGxlUmVzaXplKCkge1xuICAgIC8vIEluIHRoZSBjYXNlIHdoZXJlIHRoZSBsYWJlbCBncm93cyBpbiBzaXplLCB0aGUgZm9sbG93aW5nIHNlcXVlbmNlIG9mIGV2ZW50cyBvY2N1cnM6XG4gICAgLy8gMS4gVGhlIGxhYmVsIGdyb3dzIGJ5IDFweCB0cmlnZ2VyaW5nIHRoZSBSZXNpemVPYnNlcnZlclxuICAgIC8vIDIuIFRoZSBub3RjaCBpcyBleHBhbmRlZCB0byBhY2NvbW1vZGF0ZSB0aGUgZW50aXJlIGxhYmVsXG4gICAgLy8gMy4gVGhlIGxhYmVsIGV4cGFuZHMgdG8gaXRzIGZ1bGwgd2lkdGgsIHRyaWdnZXJpbmcgdGhlIFJlc2l6ZU9ic2VydmVyIGFnYWluXG4gICAgLy9cbiAgICAvLyBUaGlzIGlzIGV4cGVjdGVkLCBidXQgSWYgd2UgYWxsb3cgdGhpcyB0byBhbGwgaGFwcGVuIHdpdGhpbiB0aGUgc2FtZSBtYWNybyB0YXNrIGl0IGNhdXNlcyBhblxuICAgIC8vIGVycm9yOiBgUmVzaXplT2JzZXJ2ZXIgbG9vcCBsaW1pdCBleGNlZWRlZGAuIFRoZXJlZm9yZSB3ZSBwdXNoIHRoZSBub3RjaCByZXNpemUgb3V0IHVudGlsXG4gICAgLy8gdGhlIG5leHQgbWFjcm8gdGFzay5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3BhcmVudC5faGFuZGxlTGFiZWxSZXNpemVkKCkpO1xuICB9XG5cbiAgLyoqIFN1YnNjcmliZXMgdG8gcmVzaXplIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9SZXNpemUoKSB7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbiA9IHRoaXMuX3Jlc2l6ZU9ic2VydmVyXG4gICAgICAgIC5vYnNlcnZlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwge2JveDogJ2JvcmRlci1ib3gnfSlcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9oYW5kbGVSZXNpemUoKSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFc3RpbWF0ZXMgdGhlIHNjcm9sbCB3aWR0aCBvZiBhbiBlbGVtZW50LlxuICogdmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRlcmlhbC1jb21wb25lbnRzL21hdGVyaWFsLWNvbXBvbmVudHMtd2ViL2Jsb2IvYzBhMTFlZjBkMDAwYTA5OGZkMGMzNzJiZThmMTJkNmE5OTMwMjg1NS9wYWNrYWdlcy9tZGMtZG9tL3BvbnlmaWxsLnRzXG4gKi9cbmZ1bmN0aW9uIGVzdGltYXRlU2Nyb2xsV2lkdGgoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBudW1iZXIge1xuICAvLyBDaGVjayB0aGUgb2Zmc2V0UGFyZW50LiBJZiB0aGUgZWxlbWVudCBpbmhlcml0cyBkaXNwbGF5OiBub25lIGZyb20gYW55XG4gIC8vIHBhcmVudCwgdGhlIG9mZnNldFBhcmVudCBwcm9wZXJ0eSB3aWxsIGJlIG51bGwgKHNlZVxuICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSFRNTEVsZW1lbnQvb2Zmc2V0UGFyZW50KS5cbiAgLy8gVGhpcyBjaGVjayBlbnN1cmVzIHdlIG9ubHkgY2xvbmUgdGhlIG5vZGUgd2hlbiBuZWNlc3NhcnkuXG4gIGNvbnN0IGh0bWxFbCA9IGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gIGlmIChodG1sRWwub2Zmc2V0UGFyZW50ICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGh0bWxFbC5zY3JvbGxXaWR0aDtcbiAgfVxuXG4gIGNvbnN0IGNsb25lID0gaHRtbEVsLmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcbiAgY2xvbmUuc3R5bGUuc2V0UHJvcGVydHkoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gIGNsb25lLnN0eWxlLnNldFByb3BlcnR5KCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC05OTk5cHgsIC05OTk5cHgpJyk7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XG4gIGNvbnN0IHNjcm9sbFdpZHRoID0gY2xvbmUuc2Nyb2xsV2lkdGg7XG4gIGNsb25lLnJlbW92ZSgpO1xuICByZXR1cm4gc2Nyb2xsV2lkdGg7XG59XG4iXX0=