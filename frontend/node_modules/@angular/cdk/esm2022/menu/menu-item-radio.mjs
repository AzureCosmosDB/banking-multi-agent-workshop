/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, inject } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor() {
        super();
        /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
        this._selectionDispatcher = inject(UniqueSelectionDispatcher);
        /** An ID to identify this radio item to the `UniqueSelectionDispatcher`. */
        this._id = `${nextId++}`;
        this._registerDispatcherListener();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removeDispatcherListener();
    }
    /**
     * Toggles the checked state of the radio-button.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this._selectionDispatcher.notify(this._id, '');
        }
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id) => {
            this.checked = this._id === id;
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemRadio, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuItemRadio, isStandalone: true, selector: "[cdkMenuItemRadio]", host: { attributes: { "role": "menuitemradio" }, properties: { "class.cdk-menu-item-radio": "true" } }, providers: [
            { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
            { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
        ], exportAs: ["cdkMenuItemRadio"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemRadio, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemRadio]',
                    exportAs: 'cdkMenuItemRadio',
                    standalone: true,
                    host: {
                        'role': 'menuitemradio',
                        '[class.cdk-menu-item-radio]': 'true',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtaXRlbS1yYWRpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUMzRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUV4QyxxRUFBcUU7QUFDckUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7R0FJRztBQWNILE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxxQkFBcUI7SUFVekQ7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQVZWLHVFQUF1RTtRQUN0RCx5QkFBb0IsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUUxRSw0RUFBNEU7UUFDcEUsUUFBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQztRQU8xQixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRVEsV0FBVztRQUNsQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDTSxPQUFPLENBQUMsT0FBNkI7UUFDNUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0gsQ0FBQztJQUVELCtGQUErRjtJQUN2RiwyQkFBMkI7UUFDakMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFVLEVBQUUsRUFBRTtZQUMvRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztxSEF2Q1UsZ0JBQWdCO3lHQUFoQixnQkFBZ0IseUtBTGhCO1lBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDO1lBQy9ELEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7U0FDM0Q7O2tHQUVVLGdCQUFnQjtrQkFiNUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxlQUFlO3dCQUN2Qiw2QkFBNkIsRUFBRSxNQUFNO3FCQUN0QztvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxrQkFBa0IsRUFBQzt3QkFDL0QsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBQztxQkFDM0Q7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGluamVjdCwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1TZWxlY3RhYmxlfSBmcm9tICcuL21lbnUtaXRlbS1zZWxlY3RhYmxlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcblxuLyoqIENvdW50ZXIgdXNlZCB0byBzZXQgYSB1bmlxdWUgaWQgYW5kIG5hbWUgZm9yIGEgc2VsZWN0YWJsZSBpdGVtICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBwcm92aWRpbmcgYmVoYXZpb3IgZm9yIHRoZSBcIm1lbnVpdGVtcmFkaW9cIiBBUklBIHJvbGUsIHdoaWNoIGJlaGF2ZXMgc2ltaWxhcmx5IHRvXG4gKiBhIGNvbnZlbnRpb25hbCByYWRpby1idXR0b24uIEFueSBzaWJsaW5nIGBDZGtNZW51SXRlbVJhZGlvYCBpbnN0YW5jZXMgd2l0aGluIHRoZSBzYW1lIGBDZGtNZW51YFxuICogb3IgYENka01lbnVHcm91cGAgY29tcHJpc2UgYSByYWRpbyBncm91cCB3aXRoIHVuaXF1ZSBzZWxlY3Rpb24gZW5mb3JjZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbVJhZGlvXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW1SYWRpbycsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdtZW51aXRlbXJhZGlvJyxcbiAgICAnW2NsYXNzLmNkay1tZW51LWl0ZW0tcmFkaW9dJzogJ3RydWUnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1SYWRpb30sXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1SYWRpbyBleHRlbmRzIENka01lbnVJdGVtU2VsZWN0YWJsZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgdW5pcXVlIHNlbGVjdGlvbiBkaXNwYXRjaGVyIGZvciB0aGlzIHJhZGlvJ3MgYENka01lbnVHcm91cGAuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbkRpc3BhdGNoZXIgPSBpbmplY3QoVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcik7XG5cbiAgLyoqIEFuIElEIHRvIGlkZW50aWZ5IHRoaXMgcmFkaW8gaXRlbSB0byB0aGUgYFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXJgLiAqL1xuICBwcml2YXRlIF9pZCA9IGAke25leHRJZCsrfWA7XG5cbiAgLyoqIEZ1bmN0aW9uIHRvIHVucmVnaXN0ZXIgdGhlIHNlbGVjdGlvbiBkaXNwYXRjaGVyICovXG4gIHByaXZhdGUgX3JlbW92ZURpc3BhdGNoZXJMaXN0ZW5lcjogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGlzcGF0Y2hlckxpc3RlbmVyKCk7XG4gIH1cblxuICBvdmVycmlkZSBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuXG4gICAgdGhpcy5fcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgcmFkaW8tYnV0dG9uLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoZSBjb25maWd1cmUgaG93IHRoZSBpdGVtIGlzIHRyaWdnZXJlZFxuICAgKiAgIC0ga2VlcE9wZW46IHNwZWNpZmllcyB0aGF0IHRoZSBtZW51IHNob3VsZCBiZSBrZXB0IG9wZW4gYWZ0ZXIgdHJpZ2dlcmluZyB0aGUgaXRlbS5cbiAgICovXG4gIG92ZXJyaWRlIHRyaWdnZXIob3B0aW9ucz86IHtrZWVwT3BlbjogYm9vbGVhbn0pIHtcbiAgICBzdXBlci50cmlnZ2VyKG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25EaXNwYXRjaGVyLm5vdGlmeSh0aGlzLl9pZCwgJycpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDb25maWd1cmUgdGhlIHVuaXF1ZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciBsaXN0ZW5lciBpbiBvcmRlciB0byB0b2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyRGlzcGF0Y2hlckxpc3RlbmVyKCkge1xuICAgIHRoaXMuX3JlbW92ZURpc3BhdGNoZXJMaXN0ZW5lciA9IHRoaXMuX3NlbGVjdGlvbkRpc3BhdGNoZXIubGlzdGVuKChpZDogc3RyaW5nKSA9PiB7XG4gICAgICB0aGlzLmNoZWNrZWQgPSB0aGlzLl9pZCA9PT0gaWQ7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==