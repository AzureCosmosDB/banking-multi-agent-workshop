/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Lightweight FocusTrapInertStrategy that adds a document focus event
 * listener to redirect focus back inside the FocusTrap.
 */
export class EventListenerFocusTrapInertStrategy {
    constructor() {
        /** Focus event handler. */
        this._listener = null;
    }
    /** Adds a document event listener that keeps focus inside the FocusTrap. */
    preventFocus(focusTrap) {
        // Ensure there's only one listener per document
        if (this._listener) {
            focusTrap._document.removeEventListener('focus', this._listener, true);
        }
        this._listener = (e) => this._trapFocus(focusTrap, e);
        focusTrap._ngZone.runOutsideAngular(() => {
            focusTrap._document.addEventListener('focus', this._listener, true);
        });
    }
    /** Removes the event listener added in preventFocus. */
    allowFocus(focusTrap) {
        if (!this._listener) {
            return;
        }
        focusTrap._document.removeEventListener('focus', this._listener, true);
        this._listener = null;
    }
    /**
     * Refocuses the first element in the FocusTrap if the focus event target was outside
     * the FocusTrap.
     *
     * This is an event listener callback. The event listener is added in runOutsideAngular,
     * so all this code runs outside Angular as well.
     */
    _trapFocus(focusTrap, event) {
        const target = event.target;
        const focusTrapRoot = focusTrap._element;
        // Don't refocus if target was in an overlay, because the overlay might be associated
        // with an element inside the FocusTrap, ex. mat-select.
        if (target && !focusTrapRoot.contains(target) && !target.closest?.('div.cdk-overlay-pane')) {
            // Some legacy FocusTrap usages have logic that focuses some element on the page
            // just before FocusTrap is destroyed. For backwards compatibility, wait
            // to be sure FocusTrap is still enabled before refocusing.
            setTimeout(() => {
                // Check whether focus wasn't put back into the focus trap while the timeout was pending.
                if (focusTrap.enabled && !focusTrapRoot.contains(focusTrap._document.activeElement)) {
                    focusTrap.focusFirstTabbableElement();
                }
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbGlzdGVuZXItaW5lcnQtc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvZm9jdXMtdHJhcC9ldmVudC1saXN0ZW5lci1pbmVydC1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sbUNBQW1DO0lBQWhEO1FBQ0UsMkJBQTJCO1FBQ25CLGNBQVMsR0FBcUMsSUFBSSxDQUFDO0lBaUQ3RCxDQUFDO0lBL0NDLDRFQUE0RTtJQUM1RSxZQUFZLENBQUMsU0FBZ0M7UUFDM0MsZ0RBQWdEO1FBQ2hELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLFNBQVMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ3ZDLFNBQVMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELFVBQVUsQ0FBQyxTQUFnQztRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLE9BQU87UUFDVCxDQUFDO1FBQ0QsU0FBUyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssVUFBVSxDQUFDLFNBQWdDLEVBQUUsS0FBaUI7UUFDcEUsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQXFCLENBQUM7UUFDM0MsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUV6QyxxRkFBcUY7UUFDckYsd0RBQXdEO1FBQ3hELElBQUksTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUM7WUFDM0YsZ0ZBQWdGO1lBQ2hGLHdFQUF3RTtZQUN4RSwyREFBMkQ7WUFDM0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZCx5RkFBeUY7Z0JBQ3pGLElBQUksU0FBUyxDQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO29CQUNwRixTQUFTLENBQUMseUJBQXlCLEVBQUUsQ0FBQztnQkFDeEMsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZvY3VzVHJhcEluZXJ0U3RyYXRlZ3l9IGZyb20gJy4vZm9jdXMtdHJhcC1pbmVydC1zdHJhdGVneSc7XG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcH0gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcCc7XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgRm9jdXNUcmFwSW5lcnRTdHJhdGVneSB0aGF0IGFkZHMgYSBkb2N1bWVudCBmb2N1cyBldmVudFxuICogbGlzdGVuZXIgdG8gcmVkaXJlY3QgZm9jdXMgYmFjayBpbnNpZGUgdGhlIEZvY3VzVHJhcC5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50TGlzdGVuZXJGb2N1c1RyYXBJbmVydFN0cmF0ZWd5IGltcGxlbWVudHMgRm9jdXNUcmFwSW5lcnRTdHJhdGVneSB7XG4gIC8qKiBGb2N1cyBldmVudCBoYW5kbGVyLiAqL1xuICBwcml2YXRlIF9saXN0ZW5lcjogKChlOiBGb2N1c0V2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBZGRzIGEgZG9jdW1lbnQgZXZlbnQgbGlzdGVuZXIgdGhhdCBrZWVwcyBmb2N1cyBpbnNpZGUgdGhlIEZvY3VzVHJhcC4gKi9cbiAgcHJldmVudEZvY3VzKGZvY3VzVHJhcDogQ29uZmlndXJhYmxlRm9jdXNUcmFwKTogdm9pZCB7XG4gICAgLy8gRW5zdXJlIHRoZXJlJ3Mgb25seSBvbmUgbGlzdGVuZXIgcGVyIGRvY3VtZW50XG4gICAgaWYgKHRoaXMuX2xpc3RlbmVyKSB7XG4gICAgICBmb2N1c1RyYXAuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fbGlzdGVuZXIhLCB0cnVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9saXN0ZW5lciA9IChlOiBGb2N1c0V2ZW50KSA9PiB0aGlzLl90cmFwRm9jdXMoZm9jdXNUcmFwLCBlKTtcbiAgICBmb2N1c1RyYXAuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBmb2N1c1RyYXAuX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fbGlzdGVuZXIhLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lciBhZGRlZCBpbiBwcmV2ZW50Rm9jdXMuICovXG4gIGFsbG93Rm9jdXMoZm9jdXNUcmFwOiBDb25maWd1cmFibGVGb2N1c1RyYXApOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvY3VzVHJhcC5fZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9saXN0ZW5lciEsIHRydWUpO1xuICAgIHRoaXMuX2xpc3RlbmVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZvY3VzZXMgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIEZvY3VzVHJhcCBpZiB0aGUgZm9jdXMgZXZlbnQgdGFyZ2V0IHdhcyBvdXRzaWRlXG4gICAqIHRoZSBGb2N1c1RyYXAuXG4gICAqXG4gICAqIFRoaXMgaXMgYW4gZXZlbnQgbGlzdGVuZXIgY2FsbGJhY2suIFRoZSBldmVudCBsaXN0ZW5lciBpcyBhZGRlZCBpbiBydW5PdXRzaWRlQW5ndWxhcixcbiAgICogc28gYWxsIHRoaXMgY29kZSBydW5zIG91dHNpZGUgQW5ndWxhciBhcyB3ZWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBfdHJhcEZvY3VzKGZvY3VzVHJhcDogQ29uZmlndXJhYmxlRm9jdXNUcmFwLCBldmVudDogRm9jdXNFdmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBmb2N1c1RyYXBSb290ID0gZm9jdXNUcmFwLl9lbGVtZW50O1xuXG4gICAgLy8gRG9uJ3QgcmVmb2N1cyBpZiB0YXJnZXQgd2FzIGluIGFuIG92ZXJsYXksIGJlY2F1c2UgdGhlIG92ZXJsYXkgbWlnaHQgYmUgYXNzb2NpYXRlZFxuICAgIC8vIHdpdGggYW4gZWxlbWVudCBpbnNpZGUgdGhlIEZvY3VzVHJhcCwgZXguIG1hdC1zZWxlY3QuXG4gICAgaWYgKHRhcmdldCAmJiAhZm9jdXNUcmFwUm9vdC5jb250YWlucyh0YXJnZXQpICYmICF0YXJnZXQuY2xvc2VzdD8uKCdkaXYuY2RrLW92ZXJsYXktcGFuZScpKSB7XG4gICAgICAvLyBTb21lIGxlZ2FjeSBGb2N1c1RyYXAgdXNhZ2VzIGhhdmUgbG9naWMgdGhhdCBmb2N1c2VzIHNvbWUgZWxlbWVudCBvbiB0aGUgcGFnZVxuICAgICAgLy8ganVzdCBiZWZvcmUgRm9jdXNUcmFwIGlzIGRlc3Ryb3llZC4gRm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LCB3YWl0XG4gICAgICAvLyB0byBiZSBzdXJlIEZvY3VzVHJhcCBpcyBzdGlsbCBlbmFibGVkIGJlZm9yZSByZWZvY3VzaW5nLlxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgZm9jdXMgd2Fzbid0IHB1dCBiYWNrIGludG8gdGhlIGZvY3VzIHRyYXAgd2hpbGUgdGhlIHRpbWVvdXQgd2FzIHBlbmRpbmcuXG4gICAgICAgIGlmIChmb2N1c1RyYXAuZW5hYmxlZCAmJiAhZm9jdXNUcmFwUm9vdC5jb250YWlucyhmb2N1c1RyYXAuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICAgZm9jdXNUcmFwLmZvY3VzRmlyc3RUYWJiYWJsZUVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=