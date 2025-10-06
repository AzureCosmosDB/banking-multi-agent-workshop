/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalizePassiveListenerOptions, _getEventTarget } from '@angular/cdk/platform';
/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
});
/** Manages events through delegation so that as few event handlers as possible are bound. */
export class RippleEventManager {
    constructor() {
        this._events = new Map();
        /** Event handler that is bound and which dispatches the events to the different targets. */
        this._delegateEventHandler = (event) => {
            const target = _getEventTarget(event);
            if (target) {
                this._events.get(event.type)?.forEach((handlers, element) => {
                    if (element === target || element.contains(target)) {
                        handlers.forEach(handler => handler.handleEvent(event));
                    }
                });
            }
        };
    }
    /** Adds an event handler. */
    addHandler(ngZone, name, element, handler) {
        const handlersForEvent = this._events.get(name);
        if (handlersForEvent) {
            const handlersForElement = handlersForEvent.get(element);
            if (handlersForElement) {
                handlersForElement.add(handler);
            }
            else {
                handlersForEvent.set(element, new Set([handler]));
            }
        }
        else {
            this._events.set(name, new Map([[element, new Set([handler])]]));
            ngZone.runOutsideAngular(() => {
                document.addEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
            });
        }
    }
    /** Removes an event handler. */
    removeHandler(name, element, handler) {
        const handlersForEvent = this._events.get(name);
        if (!handlersForEvent) {
            return;
        }
        const handlersForElement = handlersForEvent.get(element);
        if (!handlersForElement) {
            return;
        }
        handlersForElement.delete(handler);
        if (handlersForElement.size === 0) {
            handlersForEvent.delete(element);
        }
        if (handlersForEvent.size === 0) {
            this._events.delete(name);
            document.removeEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLWV2ZW50LW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY29yZS9yaXBwbGUvcmlwcGxlLWV2ZW50LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLCtCQUErQixFQUFFLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBR3ZGLHNEQUFzRDtBQUN0RCxNQUFNLDRCQUE0QixHQUFHLCtCQUErQixDQUFDO0lBQ25FLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUM7QUFFSCw2RkFBNkY7QUFDN0YsTUFBTSxPQUFPLGtCQUFrQjtJQUEvQjtRQUNVLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBc0QsQ0FBQztRQWlEaEYsNEZBQTRGO1FBQ3BGLDBCQUFxQixHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7WUFDL0MsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXRDLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDMUQsSUFBSSxPQUFPLEtBQUssTUFBTSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBYyxDQUFDLEVBQUUsQ0FBQzt3QkFDM0QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBM0RDLDZCQUE2QjtJQUM3QixVQUFVLENBQUMsTUFBYyxFQUFFLElBQVksRUFBRSxPQUFvQixFQUFFLE9BQTRCO1FBQ3pGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEQsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpELElBQUksa0JBQWtCLEVBQUUsQ0FBQztnQkFDdkIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWpFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzVCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFDNUYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELGdDQUFnQztJQUNoQyxhQUFhLENBQUMsSUFBWSxFQUFFLE9BQW9CLEVBQUUsT0FBNEI7UUFDNUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN0QixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3hCLE9BQU87UUFDVCxDQUFDO1FBRUQsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLElBQUksa0JBQWtCLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2xDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUIsUUFBUSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUMvRixDQUFDO0lBQ0gsQ0FBQztDQWNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucywgX2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKiogT3B0aW9ucyB1c2VkIHRvIGJpbmQgYSBwYXNzaXZlIGNhcHR1cmluZyBldmVudC4gKi9cbmNvbnN0IHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtcbiAgcGFzc2l2ZTogdHJ1ZSxcbiAgY2FwdHVyZTogdHJ1ZSxcbn0pO1xuXG4vKiogTWFuYWdlcyBldmVudHMgdGhyb3VnaCBkZWxlZ2F0aW9uIHNvIHRoYXQgYXMgZmV3IGV2ZW50IGhhbmRsZXJzIGFzIHBvc3NpYmxlIGFyZSBib3VuZC4gKi9cbmV4cG9ydCBjbGFzcyBSaXBwbGVFdmVudE1hbmFnZXIge1xuICBwcml2YXRlIF9ldmVudHMgPSBuZXcgTWFwPHN0cmluZywgTWFwPEhUTUxFbGVtZW50LCBTZXQ8RXZlbnRMaXN0ZW5lck9iamVjdD4+PigpO1xuXG4gIC8qKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIuICovXG4gIGFkZEhhbmRsZXIobmdab25lOiBOZ1pvbmUsIG5hbWU6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQsIGhhbmRsZXI6IEV2ZW50TGlzdGVuZXJPYmplY3QpIHtcbiAgICBjb25zdCBoYW5kbGVyc0ZvckV2ZW50ID0gdGhpcy5fZXZlbnRzLmdldChuYW1lKTtcblxuICAgIGlmIChoYW5kbGVyc0ZvckV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGVyc0ZvckVsZW1lbnQgPSBoYW5kbGVyc0ZvckV2ZW50LmdldChlbGVtZW50KTtcblxuICAgICAgaWYgKGhhbmRsZXJzRm9yRWxlbWVudCkge1xuICAgICAgICBoYW5kbGVyc0ZvckVsZW1lbnQuYWRkKGhhbmRsZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFuZGxlcnNGb3JFdmVudC5zZXQoZWxlbWVudCwgbmV3IFNldChbaGFuZGxlcl0pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZXZlbnRzLnNldChuYW1lLCBuZXcgTWFwKFtbZWxlbWVudCwgbmV3IFNldChbaGFuZGxlcl0pXV0pKTtcblxuICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCB0aGlzLl9kZWxlZ2F0ZUV2ZW50SGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogUmVtb3ZlcyBhbiBldmVudCBoYW5kbGVyLiAqL1xuICByZW1vdmVIYW5kbGVyKG5hbWU6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQsIGhhbmRsZXI6IEV2ZW50TGlzdGVuZXJPYmplY3QpIHtcbiAgICBjb25zdCBoYW5kbGVyc0ZvckV2ZW50ID0gdGhpcy5fZXZlbnRzLmdldChuYW1lKTtcblxuICAgIGlmICghaGFuZGxlcnNGb3JFdmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZXJzRm9yRWxlbWVudCA9IGhhbmRsZXJzRm9yRXZlbnQuZ2V0KGVsZW1lbnQpO1xuXG4gICAgaWYgKCFoYW5kbGVyc0ZvckVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoYW5kbGVyc0ZvckVsZW1lbnQuZGVsZXRlKGhhbmRsZXIpO1xuXG4gICAgaWYgKGhhbmRsZXJzRm9yRWxlbWVudC5zaXplID09PSAwKSB7XG4gICAgICBoYW5kbGVyc0ZvckV2ZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlcnNGb3JFdmVudC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLl9ldmVudHMuZGVsZXRlKG5hbWUpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB0aGlzLl9kZWxlZ2F0ZUV2ZW50SGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV2ZW50IGhhbmRsZXIgdGhhdCBpcyBib3VuZCBhbmQgd2hpY2ggZGlzcGF0Y2hlcyB0aGUgZXZlbnRzIHRvIHRoZSBkaWZmZXJlbnQgdGFyZ2V0cy4gKi9cbiAgcHJpdmF0ZSBfZGVsZWdhdGVFdmVudEhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gX2dldEV2ZW50VGFyZ2V0KGV2ZW50KTtcblxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5nZXQoZXZlbnQudHlwZSk/LmZvckVhY2goKGhhbmRsZXJzLCBlbGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50ID09PSB0YXJnZXQgfHwgZWxlbWVudC5jb250YWlucyh0YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlci5oYW5kbGVFdmVudChldmVudCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG4iXX0=