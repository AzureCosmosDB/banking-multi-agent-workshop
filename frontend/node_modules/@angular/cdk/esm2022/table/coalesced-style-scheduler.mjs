/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, InjectionToken, NgZone, inject } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @docs-private
 */
export class _Schedule {
    constructor() {
        this.tasks = [];
        this.endTasks = [];
    }
}
/** Injection token used to provide a coalesced style scheduler. */
export const _COALESCED_STYLE_SCHEDULER = new InjectionToken('_COALESCED_STYLE_SCHEDULER');
/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
export class _CoalescedStyleScheduler {
    constructor(_unusedNgZone) {
        this._currentSchedule = null;
        this._ngZone = inject(NgZone);
    }
    /**
     * Schedules the specified task to run at the end of the current VM turn.
     */
    schedule(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.tasks.push(task);
    }
    /**
     * Schedules the specified task to run after other scheduled tasks at the end of the current
     * VM turn.
     */
    scheduleEnd(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.endTasks.push(task);
    }
    _createScheduleIfNeeded() {
        if (this._currentSchedule) {
            return;
        }
        this._currentSchedule = new _Schedule();
        this._ngZone.runOutsideAngular(() => 
        // TODO(mmalerba): Scheduling this using something that runs less frequently
        //  (e.g. requestAnimationFrame, setTimeout, etc.) causes noticeable jank with the column
        //  resizer. We should audit the usages of schedule / scheduleEnd in that component and see
        //  if we can refactor it so that we don't need to flush the tasks quite so frequently.
        queueMicrotask(() => {
            while (this._currentSchedule.tasks.length || this._currentSchedule.endTasks.length) {
                const schedule = this._currentSchedule;
                // Capture new tasks scheduled by the current set of tasks.
                this._currentSchedule = new _Schedule();
                for (const task of schedule.tasks) {
                    task();
                }
                for (const task of schedule.endTasks) {
                    task();
                }
            }
            this._currentSchedule = null;
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _CoalescedStyleScheduler, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _CoalescedStyleScheduler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _CoalescedStyleScheduler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.NgZone }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUV6RTs7R0FFRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0UsVUFBSyxHQUFzQixFQUFFLENBQUM7UUFDOUIsYUFBUSxHQUFzQixFQUFFLENBQUM7SUFDbkMsQ0FBQztDQUFBO0FBRUQsbUVBQW1FO0FBQ25FLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLElBQUksY0FBYyxDQUMxRCw0QkFBNEIsQ0FDN0IsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyx3QkFBd0I7SUFJbkMsWUFBWSxhQUFzQjtRQUgxQixxQkFBZ0IsR0FBcUIsSUFBSSxDQUFDO1FBQzFDLFlBQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFSSxDQUFDO0lBRXRDOztPQUVHO0lBQ0gsUUFBUSxDQUFDLElBQW1CO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsSUFBbUI7UUFDN0IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFL0IsSUFBSSxDQUFDLGdCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLHVCQUF1QjtRQUM3QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFCLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFFeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7UUFDbEMsNEVBQTRFO1FBQzVFLHlGQUF5RjtRQUN6RiwyRkFBMkY7UUFDM0YsdUZBQXVGO1FBQ3ZGLGNBQWMsQ0FBQyxHQUFHLEVBQUU7WUFDbEIsT0FBTyxJQUFJLENBQUMsZ0JBQWlCLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsZ0JBQWlCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWlCLENBQUM7Z0JBRXhDLDJEQUEyRDtnQkFDM0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBRXhDLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNsQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDO2dCQUVELEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNyQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7cUhBeERVLHdCQUF3Qjt5SEFBeEIsd0JBQXdCOztrR0FBeEIsd0JBQXdCO2tCQURwQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZSwgaW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBfU2NoZWR1bGUge1xuICB0YXNrczogKCgpID0+IHVua25vd24pW10gPSBbXTtcbiAgZW5kVGFza3M6ICgoKSA9PiB1bmtub3duKVtdID0gW107XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdXNlZCB0byBwcm92aWRlIGEgY29hbGVzY2VkIHN0eWxlIHNjaGVkdWxlci4gKi9cbmV4cG9ydCBjb25zdCBfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXI+KFxuICAnX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVInLFxuKTtcblxuLyoqXG4gKiBBbGxvd3MgZ3JvdXBpbmcgdXAgQ1NTRG9tIG11dGF0aW9ucyBhZnRlciB0aGUgY3VycmVudCBleGVjdXRpb24gY29udGV4dC5cbiAqIFRoaXMgY2FuIHNpZ25pZmljYW50bHkgaW1wcm92ZSBwZXJmb3JtYW5jZSB3aGVuIHNlcGFyYXRlIGNvbnNlY3V0aXZlIGZ1bmN0aW9ucyBhcmVcbiAqIHJlYWRpbmcgZnJvbSB0aGUgQ1NTRG9tIGFuZCB0aGVuIG11dGF0aW5nIGl0LlxuICpcbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlciB7XG4gIHByaXZhdGUgX2N1cnJlbnRTY2hlZHVsZTogX1NjaGVkdWxlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX25nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIGNvbnN0cnVjdG9yKF91bnVzZWROZ1pvbmU/OiBOZ1pvbmUpIHt9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyB0aGUgc3BlY2lmaWVkIHRhc2sgdG8gcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgVk0gdHVybi5cbiAgICovXG4gIHNjaGVkdWxlKHRhc2s6ICgpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCk7XG5cbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUhLnRhc2tzLnB1c2godGFzayk7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVzIHRoZSBzcGVjaWZpZWQgdGFzayB0byBydW4gYWZ0ZXIgb3RoZXIgc2NoZWR1bGVkIHRhc2tzIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnRcbiAgICogVk0gdHVybi5cbiAgICovXG4gIHNjaGVkdWxlRW5kKHRhc2s6ICgpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCk7XG5cbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUhLmVuZFRhc2tzLnB1c2godGFzayk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50U2NoZWR1bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUgPSBuZXcgX1NjaGVkdWxlKCk7XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgIC8vIFRPRE8obW1hbGVyYmEpOiBTY2hlZHVsaW5nIHRoaXMgdXNpbmcgc29tZXRoaW5nIHRoYXQgcnVucyBsZXNzIGZyZXF1ZW50bHlcbiAgICAgIC8vICAoZS5nLiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIHNldFRpbWVvdXQsIGV0Yy4pIGNhdXNlcyBub3RpY2VhYmxlIGphbmsgd2l0aCB0aGUgY29sdW1uXG4gICAgICAvLyAgcmVzaXplci4gV2Ugc2hvdWxkIGF1ZGl0IHRoZSB1c2FnZXMgb2Ygc2NoZWR1bGUgLyBzY2hlZHVsZUVuZCBpbiB0aGF0IGNvbXBvbmVudCBhbmQgc2VlXG4gICAgICAvLyAgaWYgd2UgY2FuIHJlZmFjdG9yIGl0IHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBmbHVzaCB0aGUgdGFza3MgcXVpdGUgc28gZnJlcXVlbnRseS5cbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgd2hpbGUgKHRoaXMuX2N1cnJlbnRTY2hlZHVsZSEudGFza3MubGVuZ3RoIHx8IHRoaXMuX2N1cnJlbnRTY2hlZHVsZSEuZW5kVGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3Qgc2NoZWR1bGUgPSB0aGlzLl9jdXJyZW50U2NoZWR1bGUhO1xuXG4gICAgICAgICAgLy8gQ2FwdHVyZSBuZXcgdGFza3Mgc2NoZWR1bGVkIGJ5IHRoZSBjdXJyZW50IHNldCBvZiB0YXNrcy5cbiAgICAgICAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUgPSBuZXcgX1NjaGVkdWxlKCk7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2Ygc2NoZWR1bGUudGFza3MpIHtcbiAgICAgICAgICAgIHRhc2soKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2Ygc2NoZWR1bGUuZW5kVGFza3MpIHtcbiAgICAgICAgICAgIHRhc2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUgPSBudWxsO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxufVxuIl19