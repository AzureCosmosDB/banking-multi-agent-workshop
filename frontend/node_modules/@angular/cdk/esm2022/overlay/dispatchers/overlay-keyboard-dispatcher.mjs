/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { BaseOverlayDispatcher } from './base-overlay-dispatcher';
import * as i0 from "@angular/core";
/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
export class OverlayKeyboardDispatcher extends BaseOverlayDispatcher {
    constructor(document, 
    /** @breaking-change 14.0.0 _ngZone will be required. */
    _ngZone) {
        super(document);
        this._ngZone = _ngZone;
        /** Keyboard event listener that will be attached to the body. */
        this._keydownListener = (event) => {
            const overlays = this._attachedOverlays;
            for (let i = overlays.length - 1; i > -1; i--) {
                // Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
                // We want to target the most recent overlay, rather than trying to match where the event came
                // from, because some components might open an overlay, but keep focus on a trigger element
                // (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
                // because we don't want overlays that don't handle keyboard events to block the ones below
                // them that do.
                if (overlays[i]._keydownEvents.observers.length > 0) {
                    const keydownEvents = overlays[i]._keydownEvents;
                    /** @breaking-change 14.0.0 _ngZone will be required. */
                    if (this._ngZone) {
                        this._ngZone.run(() => keydownEvents.next(event));
                    }
                    else {
                        keydownEvents.next(event);
                    }
                    break;
                }
            }
        };
    }
    /** Add a new overlay to the list of attached overlay refs. */
    add(overlayRef) {
        super.add(overlayRef);
        // Lazily start dispatcher once first overlay is added
        if (!this._isAttached) {
            /** @breaking-change 14.0.0 _ngZone will be required. */
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(() => this._document.body.addEventListener('keydown', this._keydownListener));
            }
            else {
                this._document.body.addEventListener('keydown', this._keydownListener);
            }
            this._isAttached = true;
        }
    }
    /** Detaches the global keyboard event listener. */
    detach() {
        if (this._isAttached) {
            this._document.body.removeEventListener('keydown', this._keydownListener);
            this._isAttached = false;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: OverlayKeyboardDispatcher, deps: [{ token: DOCUMENT }, { token: i0.NgZone, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: OverlayKeyboardDispatcher, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: OverlayKeyboardDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.NgZone, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1rZXlib2FyZC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L2Rpc3BhdGNoZXJzL292ZXJsYXkta2V5Ym9hcmQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNuRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQzs7QUFHaEU7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxxQkFBcUI7SUFDbEUsWUFDb0IsUUFBYTtJQUMvQix3REFBd0Q7SUFDcEMsT0FBZ0I7UUFFcEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRkksWUFBTyxHQUFQLE9BQU8sQ0FBUztRQStCdEMsaUVBQWlFO1FBQ3pELHFCQUFnQixHQUFHLENBQUMsS0FBb0IsRUFBRSxFQUFFO1lBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUV4QyxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5Qyw2RkFBNkY7Z0JBQzdGLDhGQUE4RjtnQkFDOUYsMkZBQTJGO2dCQUMzRiw0RkFBNEY7Z0JBQzVGLDJGQUEyRjtnQkFDM0YsZ0JBQWdCO2dCQUNoQixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDcEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztvQkFDakQsd0RBQXdEO29CQUN4RCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNwRCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDNUIsQ0FBQztvQkFDRCxNQUFNO2dCQUNSLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDO0lBbERGLENBQUM7SUFFRCw4REFBOEQ7SUFDckQsR0FBRyxDQUFDLFVBQXNCO1FBQ2pDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEIsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEIsd0RBQXdEO1lBQ3hELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQ3ZFLENBQUM7WUFDSixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3pFLENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUMxQixDQUFDO0lBQ0gsQ0FBQztJQUVELG1EQUFtRDtJQUN6QyxNQUFNO1FBQ2QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO3FIQWpDVSx5QkFBeUIsa0JBRTFCLFFBQVE7eUhBRlAseUJBQXlCLGNBRGIsTUFBTTs7a0dBQ2xCLHlCQUF5QjtrQkFEckMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQUczQixNQUFNOzJCQUFDLFFBQVE7OzBCQUVmLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QmFzZU92ZXJsYXlEaXNwYXRjaGVyfSBmcm9tICcuL2Jhc2Utb3ZlcmxheS1kaXNwYXRjaGVyJztcbmltcG9ydCB0eXBlIHtPdmVybGF5UmVmfSBmcm9tICcuLi9vdmVybGF5LXJlZic7XG5cbi8qKlxuICogU2VydmljZSBmb3IgZGlzcGF0Y2hpbmcga2V5Ym9hcmQgZXZlbnRzIHRoYXQgbGFuZCBvbiB0aGUgYm9keSB0byBhcHByb3ByaWF0ZSBvdmVybGF5IHJlZixcbiAqIGlmIGFueS4gSXQgbWFpbnRhaW5zIGEgbGlzdCBvZiBhdHRhY2hlZCBvdmVybGF5cyB0byBkZXRlcm1pbmUgYmVzdCBzdWl0ZWQgb3ZlcmxheSBiYXNlZFxuICogb24gZXZlbnQgdGFyZ2V0IGFuZCBvcmRlciBvZiBvdmVybGF5IG9wZW5zLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5S2V5Ym9hcmREaXNwYXRjaGVyIGV4dGVuZHMgQmFzZU92ZXJsYXlEaXNwYXRjaGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSxcbiAgICAvKiogQGJyZWFraW5nLWNoYW5nZSAxNC4wLjAgX25nWm9uZSB3aWxsIGJlIHJlcXVpcmVkLiAqL1xuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX25nWm9uZT86IE5nWm9uZSxcbiAgKSB7XG4gICAgc3VwZXIoZG9jdW1lbnQpO1xuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBvdmVybGF5IHRvIHRoZSBsaXN0IG9mIGF0dGFjaGVkIG92ZXJsYXkgcmVmcy4gKi9cbiAgb3ZlcnJpZGUgYWRkKG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYpOiB2b2lkIHtcbiAgICBzdXBlci5hZGQob3ZlcmxheVJlZik7XG5cbiAgICAvLyBMYXppbHkgc3RhcnQgZGlzcGF0Y2hlciBvbmNlIGZpcnN0IG92ZXJsYXkgaXMgYWRkZWRcbiAgICBpZiAoIXRoaXMuX2lzQXR0YWNoZWQpIHtcbiAgICAgIC8qKiBAYnJlYWtpbmctY2hhbmdlIDE0LjAuMCBfbmdab25lIHdpbGwgYmUgcmVxdWlyZWQuICovXG4gICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWRvd25MaXN0ZW5lciksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlkb3duTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNBdHRhY2hlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoZSBnbG9iYWwga2V5Ym9hcmQgZXZlbnQgbGlzdGVuZXIuICovXG4gIHByb3RlY3RlZCBkZXRhY2goKSB7XG4gICAgaWYgKHRoaXMuX2lzQXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWRvd25MaXN0ZW5lcik7XG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIEtleWJvYXJkIGV2ZW50IGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgYm9keS4gKi9cbiAgcHJpdmF0ZSBfa2V5ZG93bkxpc3RlbmVyID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgY29uc3Qgb3ZlcmxheXMgPSB0aGlzLl9hdHRhY2hlZE92ZXJsYXlzO1xuXG4gICAgZm9yIChsZXQgaSA9IG92ZXJsYXlzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAvLyBEaXNwYXRjaCB0aGUga2V5ZG93biBldmVudCB0byB0aGUgdG9wIG92ZXJsYXkgd2hpY2ggaGFzIHN1YnNjcmliZXJzIHRvIGl0cyBrZXlkb3duIGV2ZW50cy5cbiAgICAgIC8vIFdlIHdhbnQgdG8gdGFyZ2V0IHRoZSBtb3N0IHJlY2VudCBvdmVybGF5LCByYXRoZXIgdGhhbiB0cnlpbmcgdG8gbWF0Y2ggd2hlcmUgdGhlIGV2ZW50IGNhbWVcbiAgICAgIC8vIGZyb20sIGJlY2F1c2Ugc29tZSBjb21wb25lbnRzIG1pZ2h0IG9wZW4gYW4gb3ZlcmxheSwgYnV0IGtlZXAgZm9jdXMgb24gYSB0cmlnZ2VyIGVsZW1lbnRcbiAgICAgIC8vIChlLmcuIGZvciBzZWxlY3QgYW5kIGF1dG9jb21wbGV0ZSkuIFdlIHNraXAgb3ZlcmxheXMgd2l0aG91dCBrZXlkb3duIGV2ZW50IHN1YnNjcmlwdGlvbnMsXG4gICAgICAvLyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgb3ZlcmxheXMgdGhhdCBkb24ndCBoYW5kbGUga2V5Ym9hcmQgZXZlbnRzIHRvIGJsb2NrIHRoZSBvbmVzIGJlbG93XG4gICAgICAvLyB0aGVtIHRoYXQgZG8uXG4gICAgICBpZiAob3ZlcmxheXNbaV0uX2tleWRvd25FdmVudHMub2JzZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qga2V5ZG93bkV2ZW50cyA9IG92ZXJsYXlzW2ldLl9rZXlkb3duRXZlbnRzO1xuICAgICAgICAvKiogQGJyZWFraW5nLWNoYW5nZSAxNC4wLjAgX25nWm9uZSB3aWxsIGJlIHJlcXVpcmVkLiAqL1xuICAgICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiBrZXlkb3duRXZlbnRzLm5leHQoZXZlbnQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlkb3duRXZlbnRzLm5leHQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbiJdfQ==