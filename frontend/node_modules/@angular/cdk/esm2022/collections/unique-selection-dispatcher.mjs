/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Class to coordinate unique selection based on name.
 * Intended to be consumed as an Angular service.
 * This service is needed because native radio change events are only fired on the item currently
 * being selected, and we still need to uncheck the previous selection.
 *
 * This service does not *store* any IDs and names because they may change at any time, so it is
 * less error-prone if they are simply passed through when the events occur.
 */
export class UniqueSelectionDispatcher {
    constructor() {
        this._listeners = [];
    }
    /**
     * Notify other items that selection for the given name has been set.
     * @param id ID of the item.
     * @param name Name of the item.
     */
    notify(id, name) {
        for (let listener of this._listeners) {
            listener(id, name);
        }
    }
    /**
     * Listen for future changes to item selection.
     * @return Function used to deregister listener
     */
    listen(listener) {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter((registered) => {
                return listener !== registered;
            });
        };
    }
    ngOnDestroy() {
        this._listeners = [];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: UniqueSelectionDispatcher, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: UniqueSelectionDispatcher, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: UniqueSelectionDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pcXVlLXNlbGVjdGlvbi1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy91bmlxdWUtc2VsZWN0aW9uLWRpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBWSxNQUFNLGVBQWUsQ0FBQzs7QUFLcEQ7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLE9BQU8seUJBQXlCO0lBRHRDO1FBRVUsZUFBVSxHQUF3QyxFQUFFLENBQUM7S0E2QjlEO0lBM0JDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsRUFBVSxFQUFFLElBQVk7UUFDN0IsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckMsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxRQUEyQztRQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixPQUFPLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUE2QyxFQUFFLEVBQUU7Z0JBQ3pGLE9BQU8sUUFBUSxLQUFLLFVBQVUsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQztxSEE3QlUseUJBQXlCO3lIQUF6Qix5QkFBeUIsY0FEYixNQUFNOztrR0FDbEIseUJBQXlCO2tCQURyQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8vIFVzZXJzIG9mIHRoZSBEaXNwYXRjaGVyIG5ldmVyIG5lZWQgdG8gc2VlIHRoaXMgdHlwZSwgYnV0IFR5cGVTY3JpcHQgcmVxdWlyZXMgaXQgdG8gYmUgZXhwb3J0ZWQuXG5leHBvcnQgdHlwZSBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyTGlzdGVuZXIgPSAoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuXG4vKipcbiAqIENsYXNzIHRvIGNvb3JkaW5hdGUgdW5pcXVlIHNlbGVjdGlvbiBiYXNlZCBvbiBuYW1lLlxuICogSW50ZW5kZWQgdG8gYmUgY29uc3VtZWQgYXMgYW4gQW5ndWxhciBzZXJ2aWNlLlxuICogVGhpcyBzZXJ2aWNlIGlzIG5lZWRlZCBiZWNhdXNlIG5hdGl2ZSByYWRpbyBjaGFuZ2UgZXZlbnRzIGFyZSBvbmx5IGZpcmVkIG9uIHRoZSBpdGVtIGN1cnJlbnRseVxuICogYmVpbmcgc2VsZWN0ZWQsIGFuZCB3ZSBzdGlsbCBuZWVkIHRvIHVuY2hlY2sgdGhlIHByZXZpb3VzIHNlbGVjdGlvbi5cbiAqXG4gKiBUaGlzIHNlcnZpY2UgZG9lcyBub3QgKnN0b3JlKiBhbnkgSURzIGFuZCBuYW1lcyBiZWNhdXNlIHRoZXkgbWF5IGNoYW5nZSBhdCBhbnkgdGltZSwgc28gaXQgaXNcbiAqIGxlc3MgZXJyb3ItcHJvbmUgaWYgdGhleSBhcmUgc2ltcGx5IHBhc3NlZCB0aHJvdWdoIHdoZW4gdGhlIGV2ZW50cyBvY2N1ci5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2xpc3RlbmVyczogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlckxpc3RlbmVyW10gPSBbXTtcblxuICAvKipcbiAgICogTm90aWZ5IG90aGVyIGl0ZW1zIHRoYXQgc2VsZWN0aW9uIGZvciB0aGUgZ2l2ZW4gbmFtZSBoYXMgYmVlbiBzZXQuXG4gICAqIEBwYXJhbSBpZCBJRCBvZiB0aGUgaXRlbS5cbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgaXRlbS5cbiAgICovXG4gIG5vdGlmeShpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICAgIGxpc3RlbmVyKGlkLCBuYW1lKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVuIGZvciBmdXR1cmUgY2hhbmdlcyB0byBpdGVtIHNlbGVjdGlvbi5cbiAgICogQHJldHVybiBGdW5jdGlvbiB1c2VkIHRvIGRlcmVnaXN0ZXIgbGlzdGVuZXJcbiAgICovXG4gIGxpc3RlbihsaXN0ZW5lcjogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlckxpc3RlbmVyKTogKCkgPT4gdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZmlsdGVyKChyZWdpc3RlcmVkOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyTGlzdGVuZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyICE9PSByZWdpc3RlcmVkO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtdO1xuICB9XG59XG4iXX0=