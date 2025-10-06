/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { extendStyles, getTransform, matchElementSize, toggleNativeDragInteractions, } from './dom/styling';
import { deepCloneNode } from './dom/clone-node';
import { getRootNode } from './dom/root-node';
import { getTransformTransitionDurationInMs } from './dom/transition-duration';
/** Inline styles to be set as `!important` while dragging. */
const importantProperties = new Set([
    // Needs to be important, because some `mat-table` sets `position: sticky !important`. See #22781.
    'position',
]);
export class PreviewRef {
    get element() {
        return this._preview;
    }
    constructor(_document, _rootElement, _direction, _initialDomRect, _previewTemplate, _previewClass, _pickupPositionOnPage, _initialTransform, _zIndex) {
        this._document = _document;
        this._rootElement = _rootElement;
        this._direction = _direction;
        this._initialDomRect = _initialDomRect;
        this._previewTemplate = _previewTemplate;
        this._previewClass = _previewClass;
        this._pickupPositionOnPage = _pickupPositionOnPage;
        this._initialTransform = _initialTransform;
        this._zIndex = _zIndex;
    }
    attach(parent) {
        this._preview = this._createPreview();
        parent.appendChild(this._preview);
        // The null check is necessary for browsers that don't support the popover API.
        // Note that we use a string access for compatibility with Closure.
        if (supportsPopover(this._preview)) {
            this._preview['showPopover']();
        }
    }
    destroy() {
        this._preview.remove();
        this._previewEmbeddedView?.destroy();
        this._preview = this._previewEmbeddedView = null;
    }
    setTransform(value) {
        this._preview.style.transform = value;
    }
    getBoundingClientRect() {
        return this._preview.getBoundingClientRect();
    }
    addClass(className) {
        this._preview.classList.add(className);
    }
    getTransitionDuration() {
        return getTransformTransitionDurationInMs(this._preview);
    }
    addEventListener(name, handler) {
        this._preview.addEventListener(name, handler);
    }
    removeEventListener(name, handler) {
        this._preview.removeEventListener(name, handler);
    }
    _createPreview() {
        const previewConfig = this._previewTemplate;
        const previewClass = this._previewClass;
        const previewTemplate = previewConfig ? previewConfig.template : null;
        let preview;
        if (previewTemplate && previewConfig) {
            // Measure the element before we've inserted the preview
            // since the insertion could throw off the measurement.
            const rootRect = previewConfig.matchSize ? this._initialDomRect : null;
            const viewRef = previewConfig.viewContainer.createEmbeddedView(previewTemplate, previewConfig.context);
            viewRef.detectChanges();
            preview = getRootNode(viewRef, this._document);
            this._previewEmbeddedView = viewRef;
            if (previewConfig.matchSize) {
                matchElementSize(preview, rootRect);
            }
            else {
                preview.style.transform = getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
            }
        }
        else {
            preview = deepCloneNode(this._rootElement);
            matchElementSize(preview, this._initialDomRect);
            if (this._initialTransform) {
                preview.style.transform = this._initialTransform;
            }
        }
        extendStyles(preview.style, {
            // It's important that we disable the pointer events on the preview, because
            // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
            'pointer-events': 'none',
            // If the preview has a margin, it can throw off our positioning so we reset it. The reset
            // value for `margin-right` needs to be `auto` when opened as a popover, because our
            // positioning is always top/left based, but native popover seems to position itself
            // to the top/right if `<html>` or `<body>` have `dir="rtl"` (see #29604). Setting it
            // to `auto` pushed it to the top/left corner in RTL and is a noop in LTR.
            'margin': supportsPopover(preview) ? '0 auto 0 0' : '0',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': this._zIndex + '',
        }, importantProperties);
        toggleNativeDragInteractions(preview, false);
        preview.classList.add('cdk-drag-preview');
        preview.setAttribute('popover', 'manual');
        preview.setAttribute('dir', this._direction);
        if (previewClass) {
            if (Array.isArray(previewClass)) {
                previewClass.forEach(className => preview.classList.add(className));
            }
            else {
                preview.classList.add(previewClass);
            }
        }
        return preview;
    }
}
/** Checks whether a specific element supports the popover API. */
function supportsPopover(element) {
    return 'showPopover' in element;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldmlldy1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9wcmV2aWV3LXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQ0wsWUFBWSxFQUNaLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsNEJBQTRCLEdBQzdCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFVN0UsOERBQThEO0FBQzlELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDbEMsa0dBQWtHO0lBQ2xHLFVBQVU7Q0FDWCxDQUFDLENBQUM7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQU9yQixJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVELFlBQ1UsU0FBbUIsRUFDbkIsWUFBeUIsRUFDekIsVUFBcUIsRUFDckIsZUFBd0IsRUFDeEIsZ0JBQTRDLEVBQzVDLGFBQXVDLEVBQ3ZDLHFCQUdQLEVBQ08saUJBQWdDLEVBQ2hDLE9BQWU7UUFYZixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQ25CLGlCQUFZLEdBQVosWUFBWSxDQUFhO1FBQ3pCLGVBQVUsR0FBVixVQUFVLENBQVc7UUFDckIsb0JBQWUsR0FBZixlQUFlLENBQVM7UUFDeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUE0QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7UUFDdkMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUc1QjtRQUNPLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBZTtRQUNoQyxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQ3RC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QU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdEUsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUNGO0FBRUQsa0VBQWtFO0FBQ2xFLFNBQVMsZUFBZSxDQUFDLE9BQW9CO0lBQzNDLE9BQU8sYUFBYSxJQUFJLE9BQU8sQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmLCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgZXh0ZW5kU3R5bGVzLFxuICBnZXRUcmFuc2Zvcm0sXG4gIG1hdGNoRWxlbWVudFNpemUsXG4gIHRvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMsXG59IGZyb20gJy4vZG9tL3N0eWxpbmcnO1xuaW1wb3J0IHtkZWVwQ2xvbmVOb2RlfSBmcm9tICcuL2RvbS9jbG9uZS1ub2RlJztcbmltcG9ydCB7Z2V0Um9vdE5vZGV9IGZyb20gJy4vZG9tL3Jvb3Qtbm9kZSc7XG5pbXBvcnQge2dldFRyYW5zZm9ybVRyYW5zaXRpb25EdXJhdGlvbkluTXN9IGZyb20gJy4vZG9tL3RyYW5zaXRpb24tZHVyYXRpb24nO1xuXG4vKiogVGVtcGxhdGUgdGhhdCBjYW4gYmUgdXNlZCB0byBjcmVhdGUgYSBkcmFnIHByZXZpZXcgZWxlbWVudC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1ByZXZpZXdUZW1wbGF0ZTxUID0gYW55PiB7XG4gIG1hdGNoU2l6ZT86IGJvb2xlYW47XG4gIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxUPiB8IG51bGw7XG4gIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG4gIGNvbnRleHQ6IFQ7XG59XG5cbi8qKiBJbmxpbmUgc3R5bGVzIHRvIGJlIHNldCBhcyBgIWltcG9ydGFudGAgd2hpbGUgZHJhZ2dpbmcuICovXG5jb25zdCBpbXBvcnRhbnRQcm9wZXJ0aWVzID0gbmV3IFNldChbXG4gIC8vIE5lZWRzIHRvIGJlIGltcG9ydGFudCwgYmVjYXVzZSBzb21lIGBtYXQtdGFibGVgIHNldHMgYHBvc2l0aW9uOiBzdGlja3kgIWltcG9ydGFudGAuIFNlZSAjMjI3ODEuXG4gICdwb3NpdGlvbicsXG5dKTtcblxuZXhwb3J0IGNsYXNzIFByZXZpZXdSZWYge1xuICAvKiogUmVmZXJlbmNlIHRvIHRoZSB2aWV3IG9mIHRoZSBwcmV2aWV3IGVsZW1lbnQuICovXG4gIHByaXZhdGUgX3ByZXZpZXdFbWJlZGRlZFZpZXc6IEVtYmVkZGVkVmlld1JlZjxhbnk+IHwgbnVsbDtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBwcmV2aWV3IGVsZW1lbnQuICovXG4gIHByaXZhdGUgX3ByZXZpZXc6IEhUTUxFbGVtZW50O1xuXG4gIGdldCBlbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5fcHJldmlldztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgICBwcml2YXRlIF9yb290RWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgcHJpdmF0ZSBfZGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgcHJpdmF0ZSBfaW5pdGlhbERvbVJlY3Q6IERPTVJlY3QsXG4gICAgcHJpdmF0ZSBfcHJldmlld1RlbXBsYXRlOiBEcmFnUHJldmlld1RlbXBsYXRlIHwgbnVsbCxcbiAgICBwcml2YXRlIF9wcmV2aWV3Q2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgbnVsbCxcbiAgICBwcml2YXRlIF9waWNrdXBQb3NpdGlvbk9uUGFnZToge1xuICAgICAgeDogbnVtYmVyO1xuICAgICAgeTogbnVtYmVyO1xuICAgIH0sXG4gICAgcHJpdmF0ZSBfaW5pdGlhbFRyYW5zZm9ybTogc3RyaW5nIHwgbnVsbCxcbiAgICBwcml2YXRlIF96SW5kZXg6IG51bWJlcixcbiAgKSB7fVxuXG4gIGF0dGFjaChwYXJlbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcHJldmlldyA9IHRoaXMuX2NyZWF0ZVByZXZpZXcoKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5fcHJldmlldyk7XG5cbiAgICAvLyBUaGUgbnVsbCBjaGVjayBpcyBuZWNlc3NhcnkgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0aGUgcG9wb3ZlciBBUEkuXG4gICAgLy8gTm90ZSB0aGF0IHdlIHVzZSBhIHN0cmluZyBhY2Nlc3MgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBDbG9zdXJlLlxuICAgIGlmIChzdXBwb3J0c1BvcG92ZXIodGhpcy5fcHJldmlldykpIHtcbiAgICAgIHRoaXMuX3ByZXZpZXdbJ3Nob3dQb3BvdmVyJ10oKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZpZXcucmVtb3ZlKCk7XG4gICAgdGhpcy5fcHJldmlld0VtYmVkZGVkVmlldz8uZGVzdHJveSgpO1xuICAgIHRoaXMuX3ByZXZpZXcgPSB0aGlzLl9wcmV2aWV3RW1iZWRkZWRWaWV3ID0gbnVsbCE7XG4gIH1cblxuICBzZXRUcmFuc2Zvcm0odmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZpZXcuc3R5bGUudHJhbnNmb3JtID0gdmFsdWU7XG4gIH1cblxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTogRE9NUmVjdCB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXZpZXcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICBhZGRDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZpZXcuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICB9XG5cbiAgZ2V0VHJhbnNpdGlvbkR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIGdldFRyYW5zZm9ybVRyYW5zaXRpb25EdXJhdGlvbkluTXModGhpcy5fcHJldmlldyk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKG5hbWU6IHN0cmluZywgaGFuZGxlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCkge1xuICAgIHRoaXMuX3ByZXZpZXcuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZTogc3RyaW5nLCBoYW5kbGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KSB7XG4gICAgdGhpcy5fcHJldmlldy5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUHJldmlldygpOiBIVE1MRWxlbWVudCB7XG4gICAgY29uc3QgcHJldmlld0NvbmZpZyA9IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZTtcbiAgICBjb25zdCBwcmV2aWV3Q2xhc3MgPSB0aGlzLl9wcmV2aWV3Q2xhc3M7XG4gICAgY29uc3QgcHJldmlld1RlbXBsYXRlID0gcHJldmlld0NvbmZpZyA/IHByZXZpZXdDb25maWcudGVtcGxhdGUgOiBudWxsO1xuICAgIGxldCBwcmV2aWV3OiBIVE1MRWxlbWVudDtcblxuICAgIGlmIChwcmV2aWV3VGVtcGxhdGUgJiYgcHJldmlld0NvbmZpZykge1xuICAgICAgLy8gTWVhc3VyZSB0aGUgZWxlbWVudCBiZWZvcmUgd2UndmUgaW5zZXJ0ZWQgdGhlIHByZXZpZXdcbiAgICAgIC8vIHNpbmNlIHRoZSBpbnNlcnRpb24gY291bGQgdGhyb3cgb2ZmIHRoZSBtZWFzdXJlbWVudC5cbiAgICAgIGNvbnN0IHJvb3RSZWN0ID0gcHJldmlld0NvbmZpZy5tYXRjaFNpemUgPyB0aGlzLl9pbml0aWFsRG9tUmVjdCA6IG51bGw7XG4gICAgICBjb25zdCB2aWV3UmVmID0gcHJldmlld0NvbmZpZy52aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgcHJldmlld1RlbXBsYXRlLFxuICAgICAgICBwcmV2aWV3Q29uZmlnLmNvbnRleHQsXG4gICAgICApO1xuICAgICAgdmlld1JlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICBwcmV2aWV3ID0gZ2V0Um9vdE5vZGUodmlld1JlZiwgdGhpcy5fZG9jdW1lbnQpO1xuICAgICAgdGhpcy5fcHJldmlld0VtYmVkZGVkVmlldyA9IHZpZXdSZWY7XG4gICAgICBpZiAocHJldmlld0NvbmZpZy5tYXRjaFNpemUpIHtcbiAgICAgICAgbWF0Y2hFbGVtZW50U2l6ZShwcmV2aWV3LCByb290UmVjdCEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJldmlldy5zdHlsZS50cmFuc2Zvcm0gPSBnZXRUcmFuc2Zvcm0oXG4gICAgICAgICAgdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueCxcbiAgICAgICAgICB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZS55LFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2aWV3ID0gZGVlcENsb25lTm9kZSh0aGlzLl9yb290RWxlbWVudCk7XG4gICAgICBtYXRjaEVsZW1lbnRTaXplKHByZXZpZXcsIHRoaXMuX2luaXRpYWxEb21SZWN0ISk7XG5cbiAgICAgIGlmICh0aGlzLl9pbml0aWFsVHJhbnNmb3JtKSB7XG4gICAgICAgIHByZXZpZXcuc3R5bGUudHJhbnNmb3JtID0gdGhpcy5faW5pdGlhbFRyYW5zZm9ybTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRTdHlsZXMoXG4gICAgICBwcmV2aWV3LnN0eWxlLFxuICAgICAge1xuICAgICAgICAvLyBJdCdzIGltcG9ydGFudCB0aGF0IHdlIGRpc2FibGUgdGhlIHBvaW50ZXIgZXZlbnRzIG9uIHRoZSBwcmV2aWV3LCBiZWNhdXNlXG4gICAgICAgIC8vIGl0IGNhbiB0aHJvdyBvZmYgdGhlIGBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50YCBjYWxscyBpbiB0aGUgYENka0Ryb3BMaXN0YC5cbiAgICAgICAgJ3BvaW50ZXItZXZlbnRzJzogJ25vbmUnLFxuICAgICAgICAvLyBJZiB0aGUgcHJldmlldyBoYXMgYSBtYXJnaW4sIGl0IGNhbiB0aHJvdyBvZmYgb3VyIHBvc2l0aW9uaW5nIHNvIHdlIHJlc2V0IGl0LiBUaGUgcmVzZXRcbiAgICAgICAgLy8gdmFsdWUgZm9yIGBtYXJnaW4tcmlnaHRgIG5lZWRzIHRvIGJlIGBhdXRvYCB3aGVuIG9wZW5lZCBhcyBhIHBvcG92ZXIsIGJlY2F1c2Ugb3VyXG4gICAgICAgIC8vIHBvc2l0aW9uaW5nIGlzIGFsd2F5cyB0b3AvbGVmdCBiYXNlZCwgYnV0IG5hdGl2ZSBwb3BvdmVyIHNlZW1zIHRvIHBvc2l0aW9uIGl0c2VsZlxuICAgICAgICAvLyB0byB0aGUgdG9wL3JpZ2h0IGlmIGA8aHRtbD5gIG9yIGA8Ym9keT5gIGhhdmUgYGRpcj1cInJ0bFwiYCAoc2VlICMyOTYwNCkuIFNldHRpbmcgaXRcbiAgICAgICAgLy8gdG8gYGF1dG9gIHB1c2hlZCBpdCB0byB0aGUgdG9wL2xlZnQgY29ybmVyIGluIFJUTCBhbmQgaXMgYSBub29wIGluIExUUi5cbiAgICAgICAgJ21hcmdpbic6IHN1cHBvcnRzUG9wb3ZlcihwcmV2aWV3KSA/ICcwIGF1dG8gMCAwJyA6ICcwJyxcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcbiAgICAgICAgJ3RvcCc6ICcwJyxcbiAgICAgICAgJ2xlZnQnOiAnMCcsXG4gICAgICAgICd6LWluZGV4JzogdGhpcy5fekluZGV4ICsgJycsXG4gICAgICB9LFxuICAgICAgaW1wb3J0YW50UHJvcGVydGllcyxcbiAgICApO1xuXG4gICAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhwcmV2aWV3LCBmYWxzZSk7XG4gICAgcHJldmlldy5jbGFzc0xpc3QuYWRkKCdjZGstZHJhZy1wcmV2aWV3Jyk7XG4gICAgcHJldmlldy5zZXRBdHRyaWJ1dGUoJ3BvcG92ZXInLCAnbWFudWFsJyk7XG4gICAgcHJldmlldy5zZXRBdHRyaWJ1dGUoJ2RpcicsIHRoaXMuX2RpcmVjdGlvbik7XG5cbiAgICBpZiAocHJldmlld0NsYXNzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwcmV2aWV3Q2xhc3MpKSB7XG4gICAgICAgIHByZXZpZXdDbGFzcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBwcmV2aWV3LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmV2aWV3LmNsYXNzTGlzdC5hZGQocHJldmlld0NsYXNzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcHJldmlldztcbiAgfVxufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSBzcGVjaWZpYyBlbGVtZW50IHN1cHBvcnRzIHRoZSBwb3BvdmVyIEFQSS4gKi9cbmZ1bmN0aW9uIHN1cHBvcnRzUG9wb3ZlcihlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gJ3Nob3dQb3BvdmVyJyBpbiBlbGVtZW50O1xufVxuIl19