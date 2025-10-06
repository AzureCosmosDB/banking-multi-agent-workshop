/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { throwMissingMenuReference, throwMissingPointerFocusTracker } from './menu-errors';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuAim. */
export const MENU_AIM = new InjectionToken('cdk-menu-aim');
/** Capture every nth mouse move event. */
const MOUSE_MOVE_SAMPLE_FREQUENCY = 3;
/** The number of mouse move events to track. */
const NUM_POINTS = 5;
/**
 * How long to wait before closing a sibling menu if a user stops short of the submenu they were
 * predicted to go into.
 */
const CLOSE_DELAY = 300;
/** Calculate the slope between point a and b. */
function getSlope(a, b) {
    return (b.y - a.y) / (b.x - a.x);
}
/** Calculate the y intercept for the given point and slope. */
function getYIntercept(point, slope) {
    return point.y - slope * point.x;
}
/**
 * Whether the given mouse trajectory line defined by the slope and y intercept falls within the
 * submenu as defined by `submenuPoints`
 * @param submenuPoints the submenu DOMRect points.
 * @param m the slope of the trajectory line.
 * @param b the y intercept of the trajectory line.
 * @return true if any point on the line falls within the submenu.
 */
function isWithinSubmenu(submenuPoints, m, b) {
    const { left, right, top, bottom } = submenuPoints;
    // Check for intersection with each edge of the submenu (left, right, top, bottom)
    // by fixing one coordinate to that edge's coordinate (either x or y) and checking if the
    // other coordinate is within bounds.
    return ((m * left + b >= top && m * left + b <= bottom) ||
        (m * right + b >= top && m * right + b <= bottom) ||
        ((top - b) / m >= left && (top - b) / m <= right) ||
        ((bottom - b) / m >= left && (bottom - b) / m <= right));
}
/**
 * TargetMenuAim predicts if a user is moving into a submenu. It calculates the
 * trajectory of the user's mouse movement in the current menu to determine if the
 * mouse is moving towards an open submenu.
 *
 * The determination is made by calculating the slope of the users last NUM_POINTS moves where each
 * pair of points determines if the trajectory line points into the submenu. It uses consensus
 * approach by checking if at least NUM_POINTS / 2 pairs determine that the user is moving towards
 * to submenu.
 */
export class TargetMenuAim {
    constructor() {
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        /** The last NUM_POINTS mouse move events. */
        this._points = [];
        /** Emits when this service is destroyed. */
        this._destroyed = new Subject();
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Set the Menu and its PointerFocusTracker.
     * @param menu The menu that this menu aim service controls.
     * @param pointerTracker The `PointerFocusTracker` for the given menu.
     */
    initialize(menu, pointerTracker) {
        this._menu = menu;
        this._pointerTracker = pointerTracker;
        this._subscribeToMouseMoves();
    }
    /**
     * Calls the `doToggle` callback when it is deemed that the user is not moving towards
     * the submenu.
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    toggle(doToggle) {
        // If the menu is horizontal the sub-menus open below and there is no risk of premature
        // closing of any sub-menus therefore we automatically resolve the callback.
        if (this._menu.orientation === 'horizontal') {
            doToggle();
        }
        this._checkConfigured();
        const siblingItemIsWaiting = !!this._timeoutId;
        const hasPoints = this._points.length > 1;
        if (hasPoints && !siblingItemIsWaiting) {
            if (this._isMovingToSubmenu()) {
                this._startTimeout(doToggle);
            }
            else {
                doToggle();
            }
        }
        else if (!siblingItemIsWaiting) {
            doToggle();
        }
    }
    /**
     * Start the delayed toggle handler if one isn't running already.
     *
     * The delayed toggle handler executes the `doToggle` callback after some period of time iff the
     * users mouse is on an item in the current menu.
     *
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    _startTimeout(doToggle) {
        // If the users mouse is moving towards a submenu we don't want to immediately resolve.
        // Wait for some period of time before determining if the previous menu should close in
        // cases where the user may have moved towards the submenu but stopped on a sibling menu
        // item intentionally.
        const timeoutId = setTimeout(() => {
            // Resolve if the user is currently moused over some element in the root menu
            if (this._pointerTracker.activeElement && timeoutId === this._timeoutId) {
                doToggle();
            }
            this._timeoutId = null;
        }, CLOSE_DELAY);
        this._timeoutId = timeoutId;
    }
    /** Whether the user is heading towards the open submenu. */
    _isMovingToSubmenu() {
        const submenuPoints = this._getSubmenuBounds();
        if (!submenuPoints) {
            return false;
        }
        let numMoving = 0;
        const currPoint = this._points[this._points.length - 1];
        // start from the second last point and calculate the slope between each point and the last
        // point.
        for (let i = this._points.length - 2; i >= 0; i--) {
            const previous = this._points[i];
            const slope = getSlope(currPoint, previous);
            if (isWithinSubmenu(submenuPoints, slope, getYIntercept(currPoint, slope))) {
                numMoving++;
            }
        }
        return numMoving >= Math.floor(NUM_POINTS / 2);
    }
    /** Get the bounding DOMRect for the open submenu. */
    _getSubmenuBounds() {
        return this._pointerTracker?.previousElement?.getMenu()?.nativeElement.getBoundingClientRect();
    }
    /**
     * Check if a reference to the PointerFocusTracker and menu element is provided.
     * @throws an error if neither reference is provided.
     */
    _checkConfigured() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._pointerTracker) {
                throwMissingPointerFocusTracker();
            }
            if (!this._menu) {
                throwMissingMenuReference();
            }
        }
    }
    /** Subscribe to the root menus mouse move events and update the tracked mouse points. */
    _subscribeToMouseMoves() {
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._menu.nativeElement, 'mousemove')
                .pipe(filter((_, index) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0), takeUntil(this._destroyed))
                .subscribe((event) => {
                this._points.push({ x: event.clientX, y: event.clientY });
                if (this._points.length > NUM_POINTS) {
                    this._points.shift();
                }
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TargetMenuAim }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: TargetMenuAim, decorators: [{
            type: Injectable
        }] });
/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It can be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
export class CdkTargetMenuAim {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkTargetMenuAim, isStandalone: true, selector: "[cdkTargetMenuAim]", providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }], exportAs: ["cdkTargetMenuAim"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTargetMenuAim, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTargetMenuAim]',
                    exportAs: 'cdkTargetMenuAim',
                    standalone: true,
                    providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1haW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS1haW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDL0YsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUdqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsK0JBQStCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBdUJ6Riw2REFBNkQ7QUFDN0QsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxDQUFVLGNBQWMsQ0FBQyxDQUFDO0FBRXBFLDBDQUEwQztBQUMxQyxNQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztBQUV0QyxnREFBZ0Q7QUFDaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBRXJCOzs7R0FHRztBQUNILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQVF4QixpREFBaUQ7QUFDakQsU0FBUyxRQUFRLENBQUMsQ0FBUSxFQUFFLENBQVE7SUFDbEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELCtEQUErRDtBQUMvRCxTQUFTLGFBQWEsQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUNoRCxPQUFPLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUtEOzs7Ozs7O0dBT0c7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Q0FBQztxSEEvSVUsYUFBYTt5SEFBYixhQUFhOztrR0FBYixhQUFhO2tCQUR6QixVQUFVOztBQW1KWDs7O0dBR0c7QUFPSCxNQUFNLE9BQU8sZ0JBQWdCO3FIQUFoQixnQkFBZ0I7eUdBQWhCLGdCQUFnQixpRUFGaEIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDOztrR0FFOUMsZ0JBQWdCO2tCQU41QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLFVBQVUsRUFBRSxJQUFJO29CQUNoQixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDO2lCQUMxRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgTmdab25lLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtGb2N1c2FibGVFbGVtZW50LCBQb2ludGVyRm9jdXNUcmFja2VyfSBmcm9tICcuL3BvaW50ZXItZm9jdXMtdHJhY2tlcic7XG5pbXBvcnQge01lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHt0aHJvd01pc3NpbmdNZW51UmVmZXJlbmNlLCB0aHJvd01pc3NpbmdQb2ludGVyRm9jdXNUcmFja2VyfSBmcm9tICcuL21lbnUtZXJyb3JzJztcblxuLyoqXG4gKiBNZW51QWltIGlzIHJlc3BvbnNpYmxlIGZvciBkZXRlcm1pbmluZyBpZiBhIHNpYmxpbmcgbWVudWl0ZW0ncyBtZW51IHNob3VsZCBiZSBjbG9zZWQgd2hlbiBhXG4gKiBUb2dnbGVyIGl0ZW0gaXMgaG92ZXJlZCBpbnRvLiBJdCBpcyB1cCB0byB0aGUgaG92ZXJlZCBpbiBpdGVtIHRvIGNhbGwgdGhlIE1lbnVBaW0gc2VydmljZSBpblxuICogb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIGl0IG1heSBwZXJmb3JtIGl0cyBjbG9zZSBhY3Rpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVBaW0ge1xuICAvKipcbiAgICogU2V0IHRoZSBNZW51IGFuZCBpdHMgUG9pbnRlckZvY3VzVHJhY2tlci5cbiAgICogQHBhcmFtIG1lbnUgVGhlIG1lbnUgdGhhdCB0aGlzIG1lbnUgYWltIHNlcnZpY2UgY29udHJvbHMuXG4gICAqIEBwYXJhbSBwb2ludGVyVHJhY2tlciBUaGUgYFBvaW50ZXJGb2N1c1RyYWNrZXJgIGZvciB0aGUgZ2l2ZW4gbWVudS5cbiAgICovXG4gIGluaXRpYWxpemUobWVudTogTWVudSwgcG9pbnRlclRyYWNrZXI6IFBvaW50ZXJGb2N1c1RyYWNrZXI8Rm9jdXNhYmxlRWxlbWVudCAmIFRvZ2dsZXI+KTogdm9pZDtcblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGBkb1RvZ2dsZWAgY2FsbGJhY2sgd2hlbiBpdCBpcyBkZWVtZWQgdGhhdCB0aGUgdXNlciBpcyBub3QgbW92aW5nIHRvd2FyZHNcbiAgICogdGhlIHN1Ym1lbnUuXG4gICAqIEBwYXJhbSBkb1RvZ2dsZSB0aGUgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzIHRoZSBzdWJtZW51LlxuICAgKi9cbiAgdG9nZ2xlKGRvVG9nZ2xlOiAoKSA9PiB2b2lkKTogdm9pZDtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIGZvciBhbiBpbXBsZW1lbnRhdGlvbiBvZiBNZW51QWltLiAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfQUlNID0gbmV3IEluamVjdGlvblRva2VuPE1lbnVBaW0+KCdjZGstbWVudS1haW0nKTtcblxuLyoqIENhcHR1cmUgZXZlcnkgbnRoIG1vdXNlIG1vdmUgZXZlbnQuICovXG5jb25zdCBNT1VTRV9NT1ZFX1NBTVBMRV9GUkVRVUVOQ1kgPSAzO1xuXG4vKiogVGhlIG51bWJlciBvZiBtb3VzZSBtb3ZlIGV2ZW50cyB0byB0cmFjay4gKi9cbmNvbnN0IE5VTV9QT0lOVFMgPSA1O1xuXG4vKipcbiAqIEhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIGNsb3NpbmcgYSBzaWJsaW5nIG1lbnUgaWYgYSB1c2VyIHN0b3BzIHNob3J0IG9mIHRoZSBzdWJtZW51IHRoZXkgd2VyZVxuICogcHJlZGljdGVkIHRvIGdvIGludG8uXG4gKi9cbmNvbnN0IENMT1NFX0RFTEFZID0gMzAwO1xuXG4vKiogQW4gZWxlbWVudCB3aGljaCB3aGVuIGhvdmVyZWQgb3ZlciBtYXkgb3BlbiBvciBjbG9zZSBhIG1lbnUuICovXG5leHBvcnQgaW50ZXJmYWNlIFRvZ2dsZXIge1xuICAvKiogR2V0cyB0aGUgb3BlbiBtZW51LCBvciB1bmRlZmluZWQgaWYgbm8gbWVudSBpcyBvcGVuLiAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQ7XG59XG5cbi8qKiBDYWxjdWxhdGUgdGhlIHNsb3BlIGJldHdlZW4gcG9pbnQgYSBhbmQgYi4gKi9cbmZ1bmN0aW9uIGdldFNsb3BlKGE6IFBvaW50LCBiOiBQb2ludCkge1xuICByZXR1cm4gKGIueSAtIGEueSkgLyAoYi54IC0gYS54KTtcbn1cblxuLyoqIENhbGN1bGF0ZSB0aGUgeSBpbnRlcmNlcHQgZm9yIHRoZSBnaXZlbiBwb2ludCBhbmQgc2xvcGUuICovXG5mdW5jdGlvbiBnZXRZSW50ZXJjZXB0KHBvaW50OiBQb2ludCwgc2xvcGU6IG51bWJlcikge1xuICByZXR1cm4gcG9pbnQueSAtIHNsb3BlICogcG9pbnQueDtcbn1cblxuLyoqIFJlcHJlc2VudHMgYSBjb29yZGluYXRlIG9mIG1vdXNlIHRyYXZlbC4gKi9cbnR5cGUgUG9pbnQgPSB7eDogbnVtYmVyOyB5OiBudW1iZXJ9O1xuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGdpdmVuIG1vdXNlIHRyYWplY3RvcnkgbGluZSBkZWZpbmVkIGJ5IHRoZSBzbG9wZSBhbmQgeSBpbnRlcmNlcHQgZmFsbHMgd2l0aGluIHRoZVxuICogc3VibWVudSBhcyBkZWZpbmVkIGJ5IGBzdWJtZW51UG9pbnRzYFxuICogQHBhcmFtIHN1Ym1lbnVQb2ludHMgdGhlIHN1Ym1lbnUgRE9NUmVjdCBwb2ludHMuXG4gKiBAcGFyYW0gbSB0aGUgc2xvcGUgb2YgdGhlIHRyYWplY3RvcnkgbGluZS5cbiAqIEBwYXJhbSBiIHRoZSB5IGludGVyY2VwdCBvZiB0aGUgdHJhamVjdG9yeSBsaW5lLlxuICogQHJldHVybiB0cnVlIGlmIGFueSBwb2ludCBvbiB0aGUgbGluZSBmYWxscyB3aXRoaW4gdGhlIHN1Ym1lbnUuXG4gKi9cbmZ1bmN0aW9uIGlzV2l0aGluU3VibWVudShzdWJtZW51UG9pbnRzOiBET01SZWN0LCBtOiBudW1iZXIsIGI6IG51bWJlcikge1xuICBjb25zdCB7bGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tfSA9IHN1Ym1lbnVQb2ludHM7XG5cbiAgLy8gQ2hlY2sgZm9yIGludGVyc2VjdGlvbiB3aXRoIGVhY2ggZWRnZSBvZiB0aGUgc3VibWVudSAobGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tKVxuICAvLyBieSBmaXhpbmcgb25lIGNvb3JkaW5hdGUgdG8gdGhhdCBlZGdlJ3MgY29vcmRpbmF0ZSAoZWl0aGVyIHggb3IgeSkgYW5kIGNoZWNraW5nIGlmIHRoZVxuICAvLyBvdGhlciBjb29yZGluYXRlIGlzIHdpdGhpbiBib3VuZHMuXG4gIHJldHVybiAoXG4gICAgKG0gKiBsZWZ0ICsgYiA+PSB0b3AgJiYgbSAqIGxlZnQgKyBiIDw9IGJvdHRvbSkgfHxcbiAgICAobSAqIHJpZ2h0ICsgYiA+PSB0b3AgJiYgbSAqIHJpZ2h0ICsgYiA8PSBib3R0b20pIHx8XG4gICAgKCh0b3AgLSBiKSAvIG0gPj0gbGVmdCAmJiAodG9wIC0gYikgLyBtIDw9IHJpZ2h0KSB8fFxuICAgICgoYm90dG9tIC0gYikgLyBtID49IGxlZnQgJiYgKGJvdHRvbSAtIGIpIC8gbSA8PSByaWdodClcbiAgKTtcbn1cblxuLyoqXG4gKiBUYXJnZXRNZW51QWltIHByZWRpY3RzIGlmIGEgdXNlciBpcyBtb3ZpbmcgaW50byBhIHN1Ym1lbnUuIEl0IGNhbGN1bGF0ZXMgdGhlXG4gKiB0cmFqZWN0b3J5IG9mIHRoZSB1c2VyJ3MgbW91c2UgbW92ZW1lbnQgaW4gdGhlIGN1cnJlbnQgbWVudSB0byBkZXRlcm1pbmUgaWYgdGhlXG4gKiBtb3VzZSBpcyBtb3ZpbmcgdG93YXJkcyBhbiBvcGVuIHN1Ym1lbnUuXG4gKlxuICogVGhlIGRldGVybWluYXRpb24gaXMgbWFkZSBieSBjYWxjdWxhdGluZyB0aGUgc2xvcGUgb2YgdGhlIHVzZXJzIGxhc3QgTlVNX1BPSU5UUyBtb3ZlcyB3aGVyZSBlYWNoXG4gKiBwYWlyIG9mIHBvaW50cyBkZXRlcm1pbmVzIGlmIHRoZSB0cmFqZWN0b3J5IGxpbmUgcG9pbnRzIGludG8gdGhlIHN1Ym1lbnUuIEl0IHVzZXMgY29uc2Vuc3VzXG4gKiBhcHByb2FjaCBieSBjaGVja2luZyBpZiBhdCBsZWFzdCBOVU1fUE9JTlRTIC8gMiBwYWlycyBkZXRlcm1pbmUgdGhhdCB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkc1xuICogdG8gc3VibWVudS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRhcmdldE1lbnVBaW0gaW1wbGVtZW50cyBNZW51QWltLCBPbkRlc3Ryb3kge1xuICAvKiogVGhlIEFuZ3VsYXIgem9uZS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgLyoqIFRoZSBsYXN0IE5VTV9QT0lOVFMgbW91c2UgbW92ZSBldmVudHMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BvaW50czogUG9pbnRbXSA9IFtdO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHJvb3QgbWVudSBpbiB3aGljaCB3ZSBhcmUgdHJhY2tpbmcgbW91c2UgbW92ZXMuICovXG4gIHByaXZhdGUgX21lbnU6IE1lbnU7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgcm9vdCBtZW51J3MgbW91c2UgbWFuYWdlci4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclRyYWNrZXI6IFBvaW50ZXJGb2N1c1RyYWNrZXI8VG9nZ2xlciAmIEZvY3VzYWJsZUVsZW1lbnQ+O1xuXG4gIC8qKiBUaGUgaWQgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IHRpbWVvdXQgY2FsbCB3YWl0aW5nIHRvIHJlc29sdmUuICovXG4gIHByaXZhdGUgX3RpbWVvdXRJZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGlzIHNlcnZpY2UgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBNZW51IGFuZCBpdHMgUG9pbnRlckZvY3VzVHJhY2tlci5cbiAgICogQHBhcmFtIG1lbnUgVGhlIG1lbnUgdGhhdCB0aGlzIG1lbnUgYWltIHNlcnZpY2UgY29udHJvbHMuXG4gICAqIEBwYXJhbSBwb2ludGVyVHJhY2tlciBUaGUgYFBvaW50ZXJGb2N1c1RyYWNrZXJgIGZvciB0aGUgZ2l2ZW4gbWVudS5cbiAgICovXG4gIGluaXRpYWxpemUobWVudTogTWVudSwgcG9pbnRlclRyYWNrZXI6IFBvaW50ZXJGb2N1c1RyYWNrZXI8Rm9jdXNhYmxlRWxlbWVudCAmIFRvZ2dsZXI+KSB7XG4gICAgdGhpcy5fbWVudSA9IG1lbnU7XG4gICAgdGhpcy5fcG9pbnRlclRyYWNrZXIgPSBwb2ludGVyVHJhY2tlcjtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01vdXNlTW92ZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgYGRvVG9nZ2xlYCBjYWxsYmFjayB3aGVuIGl0IGlzIGRlZW1lZCB0aGF0IHRoZSB1c2VyIGlzIG5vdCBtb3ZpbmcgdG93YXJkc1xuICAgKiB0aGUgc3VibWVudS5cbiAgICogQHBhcmFtIGRvVG9nZ2xlIHRoZSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgdXNlciBpcyBub3QgbW92aW5nIHRvd2FyZHMgdGhlIHN1Ym1lbnUuXG4gICAqL1xuICB0b2dnbGUoZG9Ub2dnbGU6ICgpID0+IHZvaWQpIHtcbiAgICAvLyBJZiB0aGUgbWVudSBpcyBob3Jpem9udGFsIHRoZSBzdWItbWVudXMgb3BlbiBiZWxvdyBhbmQgdGhlcmUgaXMgbm8gcmlzayBvZiBwcmVtYXR1cmVcbiAgICAvLyBjbG9zaW5nIG9mIGFueSBzdWItbWVudXMgdGhlcmVmb3JlIHdlIGF1dG9tYXRpY2FsbHkgcmVzb2x2ZSB0aGUgY2FsbGJhY2suXG4gICAgaWYgKHRoaXMuX21lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgZG9Ub2dnbGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja0NvbmZpZ3VyZWQoKTtcblxuICAgIGNvbnN0IHNpYmxpbmdJdGVtSXNXYWl0aW5nID0gISF0aGlzLl90aW1lb3V0SWQ7XG4gICAgY29uc3QgaGFzUG9pbnRzID0gdGhpcy5fcG9pbnRzLmxlbmd0aCA+IDE7XG5cbiAgICBpZiAoaGFzUG9pbnRzICYmICFzaWJsaW5nSXRlbUlzV2FpdGluZykge1xuICAgICAgaWYgKHRoaXMuX2lzTW92aW5nVG9TdWJtZW51KCkpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lb3V0KGRvVG9nZ2xlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvVG9nZ2xlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghc2libGluZ0l0ZW1Jc1dhaXRpbmcpIHtcbiAgICAgIGRvVG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBkZWxheWVkIHRvZ2dsZSBoYW5kbGVyIGlmIG9uZSBpc24ndCBydW5uaW5nIGFscmVhZHkuXG4gICAqXG4gICAqIFRoZSBkZWxheWVkIHRvZ2dsZSBoYW5kbGVyIGV4ZWN1dGVzIHRoZSBgZG9Ub2dnbGVgIGNhbGxiYWNrIGFmdGVyIHNvbWUgcGVyaW9kIG9mIHRpbWUgaWZmIHRoZVxuICAgKiB1c2VycyBtb3VzZSBpcyBvbiBhbiBpdGVtIGluIHRoZSBjdXJyZW50IG1lbnUuXG4gICAqXG4gICAqIEBwYXJhbSBkb1RvZ2dsZSB0aGUgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzIHRoZSBzdWJtZW51LlxuICAgKi9cbiAgcHJpdmF0ZSBfc3RhcnRUaW1lb3V0KGRvVG9nZ2xlOiAoKSA9PiB2b2lkKSB7XG4gICAgLy8gSWYgdGhlIHVzZXJzIG1vdXNlIGlzIG1vdmluZyB0b3dhcmRzIGEgc3VibWVudSB3ZSBkb24ndCB3YW50IHRvIGltbWVkaWF0ZWx5IHJlc29sdmUuXG4gICAgLy8gV2FpdCBmb3Igc29tZSBwZXJpb2Qgb2YgdGltZSBiZWZvcmUgZGV0ZXJtaW5pbmcgaWYgdGhlIHByZXZpb3VzIG1lbnUgc2hvdWxkIGNsb3NlIGluXG4gICAgLy8gY2FzZXMgd2hlcmUgdGhlIHVzZXIgbWF5IGhhdmUgbW92ZWQgdG93YXJkcyB0aGUgc3VibWVudSBidXQgc3RvcHBlZCBvbiBhIHNpYmxpbmcgbWVudVxuICAgIC8vIGl0ZW0gaW50ZW50aW9uYWxseS5cbiAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIFJlc29sdmUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IG1vdXNlZCBvdmVyIHNvbWUgZWxlbWVudCBpbiB0aGUgcm9vdCBtZW51XG4gICAgICBpZiAodGhpcy5fcG9pbnRlclRyYWNrZXIhLmFjdGl2ZUVsZW1lbnQgJiYgdGltZW91dElkID09PSB0aGlzLl90aW1lb3V0SWQpIHtcbiAgICAgICAgZG9Ub2dnbGUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7XG4gICAgfSwgQ0xPU0VfREVMQVkpIGFzIGFueSBhcyBudW1iZXI7XG5cbiAgICB0aGlzLl90aW1lb3V0SWQgPSB0aW1lb3V0SWQ7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgdXNlciBpcyBoZWFkaW5nIHRvd2FyZHMgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJpdmF0ZSBfaXNNb3ZpbmdUb1N1Ym1lbnUoKSB7XG4gICAgY29uc3Qgc3VibWVudVBvaW50cyA9IHRoaXMuX2dldFN1Ym1lbnVCb3VuZHMoKTtcbiAgICBpZiAoIXN1Ym1lbnVQb2ludHMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgbnVtTW92aW5nID0gMDtcbiAgICBjb25zdCBjdXJyUG9pbnQgPSB0aGlzLl9wb2ludHNbdGhpcy5fcG9pbnRzLmxlbmd0aCAtIDFdO1xuICAgIC8vIHN0YXJ0IGZyb20gdGhlIHNlY29uZCBsYXN0IHBvaW50IGFuZCBjYWxjdWxhdGUgdGhlIHNsb3BlIGJldHdlZW4gZWFjaCBwb2ludCBhbmQgdGhlIGxhc3RcbiAgICAvLyBwb2ludC5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5fcG9pbnRzLmxlbmd0aCAtIDI7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuX3BvaW50c1tpXTtcbiAgICAgIGNvbnN0IHNsb3BlID0gZ2V0U2xvcGUoY3VyclBvaW50LCBwcmV2aW91cyk7XG4gICAgICBpZiAoaXNXaXRoaW5TdWJtZW51KHN1Ym1lbnVQb2ludHMsIHNsb3BlLCBnZXRZSW50ZXJjZXB0KGN1cnJQb2ludCwgc2xvcGUpKSkge1xuICAgICAgICBudW1Nb3ZpbmcrKztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bU1vdmluZyA+PSBNYXRoLmZsb29yKE5VTV9QT0lOVFMgLyAyKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGJvdW5kaW5nIERPTVJlY3QgZm9yIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX2dldFN1Ym1lbnVCb3VuZHMoKTogRE9NUmVjdCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3BvaW50ZXJUcmFja2VyPy5wcmV2aW91c0VsZW1lbnQ/LmdldE1lbnUoKT8ubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHJlZmVyZW5jZSB0byB0aGUgUG9pbnRlckZvY3VzVHJhY2tlciBhbmQgbWVudSBlbGVtZW50IGlzIHByb3ZpZGVkLlxuICAgKiBAdGhyb3dzIGFuIGVycm9yIGlmIG5laXRoZXIgcmVmZXJlbmNlIGlzIHByb3ZpZGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tDb25maWd1cmVkKCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5fcG9pbnRlclRyYWNrZXIpIHtcbiAgICAgICAgdGhyb3dNaXNzaW5nUG9pbnRlckZvY3VzVHJhY2tlcigpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLl9tZW51KSB7XG4gICAgICAgIHRocm93TWlzc2luZ01lbnVSZWZlcmVuY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSByb290IG1lbnVzIG1vdXNlIG1vdmUgZXZlbnRzIGFuZCB1cGRhdGUgdGhlIHRyYWNrZWQgbW91c2UgcG9pbnRzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01vdXNlTW92ZXMoKSB7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLl9tZW51Lm5hdGl2ZUVsZW1lbnQsICdtb3VzZW1vdmUnKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoKF86IE1vdXNlRXZlbnQsIGluZGV4OiBudW1iZXIpID0+IGluZGV4ICUgTU9VU0VfTU9WRV9TQU1QTEVfRlJFUVVFTkNZID09PSAwKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3BvaW50cy5wdXNoKHt4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZfSk7XG4gICAgICAgICAgaWYgKHRoaXMuX3BvaW50cy5sZW5ndGggPiBOVU1fUE9JTlRTKSB7XG4gICAgICAgICAgICB0aGlzLl9wb2ludHMuc2hpZnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQ2RrVGFyZ2V0TWVudUFpbSBpcyBhIHByb3ZpZGVyIGZvciB0aGUgVGFyZ2V0TWVudUFpbSBzZXJ2aWNlLiBJdCBjYW4gYmUgYWRkZWQgdG8gYW5cbiAqIGVsZW1lbnQgd2l0aCBlaXRoZXIgdGhlIGBjZGtNZW51YCBvciBgY2RrTWVudUJhcmAgZGlyZWN0aXZlIGFuZCBjaGlsZCBtZW51IGl0ZW1zLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVGFyZ2V0TWVudUFpbV0nLFxuICBleHBvcnRBczogJ2Nka1RhcmdldE1lbnVBaW0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTUVOVV9BSU0sIHVzZUNsYXNzOiBUYXJnZXRNZW51QWltfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka1RhcmdldE1lbnVBaW0ge31cbiJdfQ==