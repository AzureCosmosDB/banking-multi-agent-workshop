/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, InjectionToken, Input, booleanAttribute, inject, } from '@angular/core';
import * as i0 from "@angular/core";
/** Class that is applied when a tab indicator is active. */
const ACTIVE_CLASS = 'mdc-tab-indicator--active';
/** Class that is applied when the tab indicator should not transition. */
const NO_TRANSITION_CLASS = 'mdc-tab-indicator--no-transition';
/**
 * Abstraction around the MDC tab indicator that acts as the tab header's ink bar.
 * @docs-private
 */
export class MatInkBar {
    constructor(_items) {
        this._items = _items;
    }
    /** Hides the ink bar. */
    hide() {
        this._items.forEach(item => item.deactivateInkBar());
    }
    /** Aligns the ink bar to a DOM node. */
    alignToElement(element) {
        const correspondingItem = this._items.find(item => item.elementRef.nativeElement === element);
        const currentItem = this._currentItem;
        if (correspondingItem === currentItem) {
            return;
        }
        currentItem?.deactivateInkBar();
        if (correspondingItem) {
            const domRect = currentItem?.elementRef.nativeElement.getBoundingClientRect?.();
            // The ink bar won't animate unless we give it the `DOMRect` of the previous item.
            correspondingItem.activateInkBar(domRect);
            this._currentItem = correspondingItem;
        }
    }
}
export class InkBarItem {
    constructor() {
        this._elementRef = inject(ElementRef);
        this._fitToContent = false;
    }
    /** Whether the ink bar should fit to the entire tab or just its content. */
    get fitInkBarToContent() {
        return this._fitToContent;
    }
    set fitInkBarToContent(newValue) {
        if (this._fitToContent !== newValue) {
            this._fitToContent = newValue;
            if (this._inkBarElement) {
                this._appendInkBarElement();
            }
        }
    }
    /** Aligns the ink bar to the current item. */
    activateInkBar(previousIndicatorClientRect) {
        const element = this._elementRef.nativeElement;
        // Early exit if no indicator is present to handle cases where an indicator
        // may be activated without a prior indicator state
        if (!previousIndicatorClientRect ||
            !element.getBoundingClientRect ||
            !this._inkBarContentElement) {
            element.classList.add(ACTIVE_CLASS);
            return;
        }
        // This animation uses the FLIP approach. You can read more about it at the link below:
        // https://aerotwist.com/blog/flip-your-animations/
        // Calculate the dimensions based on the dimensions of the previous indicator
        const currentClientRect = element.getBoundingClientRect();
        const widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
        const xPosition = previousIndicatorClientRect.left - currentClientRect.left;
        element.classList.add(NO_TRANSITION_CLASS);
        this._inkBarContentElement.style.setProperty('transform', `translateX(${xPosition}px) scaleX(${widthDelta})`);
        // Force repaint before updating classes and transform to ensure the transform properly takes effect
        element.getBoundingClientRect();
        element.classList.remove(NO_TRANSITION_CLASS);
        element.classList.add(ACTIVE_CLASS);
        this._inkBarContentElement.style.setProperty('transform', '');
    }
    /** Removes the ink bar from the current item. */
    deactivateInkBar() {
        this._elementRef.nativeElement.classList.remove(ACTIVE_CLASS);
    }
    /** Initializes the foundation. */
    ngOnInit() {
        this._createInkBarElement();
    }
    /** Destroys the foundation. */
    ngOnDestroy() {
        this._inkBarElement?.remove();
        this._inkBarElement = this._inkBarContentElement = null;
    }
    /** Creates and appends the ink bar element. */
    _createInkBarElement() {
        const documentNode = this._elementRef.nativeElement.ownerDocument || document;
        const inkBarElement = (this._inkBarElement = documentNode.createElement('span'));
        const inkBarContentElement = (this._inkBarContentElement = documentNode.createElement('span'));
        inkBarElement.className = 'mdc-tab-indicator';
        inkBarContentElement.className =
            'mdc-tab-indicator__content mdc-tab-indicator__content--underline';
        inkBarElement.appendChild(this._inkBarContentElement);
        this._appendInkBarElement();
    }
    /**
     * Appends the ink bar to the tab host element or content, depending on whether
     * the ink bar should fit to content.
     */
    _appendInkBarElement() {
        if (!this._inkBarElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('Ink bar element has not been created and cannot be appended');
        }
        const parentElement = this._fitToContent
            ? this._elementRef.nativeElement.querySelector('.mdc-tab__content')
            : this._elementRef.nativeElement;
        if (!parentElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('Missing element to host the ink bar');
        }
        parentElement.appendChild(this._inkBarElement);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InkBarItem, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: InkBarItem, inputs: { fitInkBarToContent: ["fitInkBarToContent", "fitInkBarToContent", booleanAttribute] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: InkBarItem, decorators: [{
            type: Directive
        }], propDecorators: { fitInkBarToContent: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
/**
 * The default positioner function for the MatInkBar.
 * @docs-private
 */
export function _MAT_INK_BAR_POSITIONER_FACTORY() {
    const method = (element) => ({
        left: element ? (element.offsetLeft || 0) + 'px' : '0',
        width: element ? (element.offsetWidth || 0) + 'px' : '0',
    });
    return method;
}
/** Injection token for the MatInkBar's Positioner. */
export const _MAT_INK_BAR_POSITIONER = new InjectionToken('MatInkBarPositioner', {
    providedIn: 'root',
    factory: _MAT_INK_BAR_POSITIONER_FACTORY,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5rLWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJzL2luay1iYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsY0FBYyxFQUNkLEtBQUssRUFJTCxnQkFBZ0IsRUFDaEIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDOztBQWF2Qiw0REFBNEQ7QUFDNUQsTUFBTSxZQUFZLEdBQUcsMkJBQTJCLENBQUM7QUFFakQsMEVBQTBFO0FBQzFFLE1BQU0sbUJBQW1CLEdBQUcsa0NBQWtDLENBQUM7QUFFL0Q7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFJcEIsWUFBb0IsTUFBZ0M7UUFBaEMsV0FBTSxHQUFOLE1BQU0sQ0FBMEI7SUFBRyxDQUFDO0lBRXhELHlCQUF5QjtJQUN6QixJQUFJO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsY0FBYyxDQUFDLE9BQW9CO1FBQ2pDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM5RixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBRXRDLElBQUksaUJBQWlCLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsT0FBTztRQUNULENBQUM7UUFFRCxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztRQUVoQyxJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDdEIsTUFBTSxPQUFPLEdBQUcsV0FBVyxFQUFFLFVBQVUsQ0FBQyxh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VUFBVTtrQkFEL0IsU0FBUzs4QkFTSixrQkFBa0I7c0JBRHJCLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7O0FBNkd0Qzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsK0JBQStCO0lBQzdDLE1BQU0sTUFBTSxHQUFHLENBQUMsT0FBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHO1FBQ3RELEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUc7S0FDekQsQ0FBQyxDQUFDO0lBRUgsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLGNBQWMsQ0FDdkQscUJBQXFCLEVBQ3JCO0lBQ0UsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLCtCQUErQjtDQUN6QyxDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBRdWVyeUxpc3QsXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIGluamVjdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogSXRlbSBpbnNpZGUgYSB0YWIgaGVhZGVyIHJlbGF0aXZlIHRvIHdoaWNoIHRoZSBpbmsgYmFyIGNhbiBiZSBhbGlnbmVkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdElua0Jhckl0ZW0gZXh0ZW5kcyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuICBhY3RpdmF0ZUlua0JhcihwcmV2aW91c0luZGljYXRvckNsaWVudFJlY3Q/OiBET01SZWN0KTogdm9pZDtcbiAgZGVhY3RpdmF0ZUlua0JhcigpOiB2b2lkO1xuICBmaXRJbmtCYXJUb0NvbnRlbnQ6IGJvb2xlYW47XG59XG5cbi8qKiBDbGFzcyB0aGF0IGlzIGFwcGxpZWQgd2hlbiBhIHRhYiBpbmRpY2F0b3IgaXMgYWN0aXZlLiAqL1xuY29uc3QgQUNUSVZFX0NMQVNTID0gJ21kYy10YWItaW5kaWNhdG9yLS1hY3RpdmUnO1xuXG4vKiogQ2xhc3MgdGhhdCBpcyBhcHBsaWVkIHdoZW4gdGhlIHRhYiBpbmRpY2F0b3Igc2hvdWxkIG5vdCB0cmFuc2l0aW9uLiAqL1xuY29uc3QgTk9fVFJBTlNJVElPTl9DTEFTUyA9ICdtZGMtdGFiLWluZGljYXRvci0tbm8tdHJhbnNpdGlvbic7XG5cbi8qKlxuICogQWJzdHJhY3Rpb24gYXJvdW5kIHRoZSBNREMgdGFiIGluZGljYXRvciB0aGF0IGFjdHMgYXMgdGhlIHRhYiBoZWFkZXIncyBpbmsgYmFyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgTWF0SW5rQmFyIHtcbiAgLyoqIEl0ZW0gdG8gd2hpY2ggdGhlIGluayBiYXIgaXMgYWxpZ25lZCBjdXJyZW50bHkuICovXG4gIHByaXZhdGUgX2N1cnJlbnRJdGVtOiBNYXRJbmtCYXJJdGVtIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2l0ZW1zOiBRdWVyeUxpc3Q8TWF0SW5rQmFySXRlbT4pIHt9XG5cbiAgLyoqIEhpZGVzIHRoZSBpbmsgYmFyLiAqL1xuICBoaWRlKCkge1xuICAgIHRoaXMuX2l0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLmRlYWN0aXZhdGVJbmtCYXIoKSk7XG4gIH1cblxuICAvKiogQWxpZ25zIHRoZSBpbmsgYmFyIHRvIGEgRE9NIG5vZGUuICovXG4gIGFsaWduVG9FbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgY29ycmVzcG9uZGluZ0l0ZW0gPSB0aGlzLl9pdGVtcy5maW5kKGl0ZW0gPT4gaXRlbS5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgPT09IGVsZW1lbnQpO1xuICAgIGNvbnN0IGN1cnJlbnRJdGVtID0gdGhpcy5fY3VycmVudEl0ZW07XG5cbiAgICBpZiAoY29ycmVzcG9uZGluZ0l0ZW0gPT09IGN1cnJlbnRJdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3VycmVudEl0ZW0/LmRlYWN0aXZhdGVJbmtCYXIoKTtcblxuICAgIGlmIChjb3JyZXNwb25kaW5nSXRlbSkge1xuICAgICAgY29uc3QgZG9tUmVjdCA9IGN1cnJlbnRJdGVtPy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0Py4oKTtcblxuICAgICAgLy8gVGhlIGluayBiYXIgd29uJ3QgYW5pbWF0ZSB1bmxlc3Mgd2UgZ2l2ZSBpdCB0aGUgYERPTVJlY3RgIG9mIHRoZSBwcmV2aW91cyBpdGVtLlxuICAgICAgY29ycmVzcG9uZGluZ0l0ZW0uYWN0aXZhdGVJbmtCYXIoZG9tUmVjdCk7XG4gICAgICB0aGlzLl9jdXJyZW50SXRlbSA9IGNvcnJlc3BvbmRpbmdJdGVtO1xuICAgIH1cbiAgfVxufVxuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbmtCYXJJdGVtIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9lbGVtZW50UmVmID0gaW5qZWN0PEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+PihFbGVtZW50UmVmKTtcbiAgcHJpdmF0ZSBfaW5rQmFyRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsO1xuICBwcml2YXRlIF9pbmtCYXJDb250ZW50RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsO1xuICBwcml2YXRlIF9maXRUb0NvbnRlbnQgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgaW5rIGJhciBzaG91bGQgZml0IHRvIHRoZSBlbnRpcmUgdGFiIG9yIGp1c3QgaXRzIGNvbnRlbnQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGZpdElua0JhclRvQ29udGVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZml0VG9Db250ZW50O1xuICB9XG4gIHNldCBmaXRJbmtCYXJUb0NvbnRlbnQobmV3VmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fZml0VG9Db250ZW50ICE9PSBuZXdWYWx1ZSkge1xuICAgICAgdGhpcy5fZml0VG9Db250ZW50ID0gbmV3VmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLl9pbmtCYXJFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX2FwcGVuZElua0JhckVsZW1lbnQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQWxpZ25zIHRoZSBpbmsgYmFyIHRvIHRoZSBjdXJyZW50IGl0ZW0uICovXG4gIGFjdGl2YXRlSW5rQmFyKHByZXZpb3VzSW5kaWNhdG9yQ2xpZW50UmVjdD86IERPTVJlY3QpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gRWFybHkgZXhpdCBpZiBubyBpbmRpY2F0b3IgaXMgcHJlc2VudCB0byBoYW5kbGUgY2FzZXMgd2hlcmUgYW4gaW5kaWNhdG9yXG4gICAgLy8gbWF5IGJlIGFjdGl2YXRlZCB3aXRob3V0IGEgcHJpb3IgaW5kaWNhdG9yIHN0YXRlXG4gICAgaWYgKFxuICAgICAgIXByZXZpb3VzSW5kaWNhdG9yQ2xpZW50UmVjdCB8fFxuICAgICAgIWVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0IHx8XG4gICAgICAhdGhpcy5faW5rQmFyQ29udGVudEVsZW1lbnRcbiAgICApIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChBQ1RJVkVfQ0xBU1MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoaXMgYW5pbWF0aW9uIHVzZXMgdGhlIEZMSVAgYXBwcm9hY2guIFlvdSBjYW4gcmVhZCBtb3JlIGFib3V0IGl0IGF0IHRoZSBsaW5rIGJlbG93OlxuICAgIC8vIGh0dHBzOi8vYWVyb3R3aXN0LmNvbS9ibG9nL2ZsaXAteW91ci1hbmltYXRpb25zL1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkaW1lbnNpb25zIGJhc2VkIG9uIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBwcmV2aW91cyBpbmRpY2F0b3JcbiAgICBjb25zdCBjdXJyZW50Q2xpZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgd2lkdGhEZWx0YSA9IHByZXZpb3VzSW5kaWNhdG9yQ2xpZW50UmVjdC53aWR0aCAvIGN1cnJlbnRDbGllbnRSZWN0LndpZHRoO1xuICAgIGNvbnN0IHhQb3NpdGlvbiA9IHByZXZpb3VzSW5kaWNhdG9yQ2xpZW50UmVjdC5sZWZ0IC0gY3VycmVudENsaWVudFJlY3QubGVmdDtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoTk9fVFJBTlNJVElPTl9DTEFTUyk7XG4gICAgdGhpcy5faW5rQmFyQ29udGVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXG4gICAgICAndHJhbnNmb3JtJyxcbiAgICAgIGB0cmFuc2xhdGVYKCR7eFBvc2l0aW9ufXB4KSBzY2FsZVgoJHt3aWR0aERlbHRhfSlgLFxuICAgICk7XG5cbiAgICAvLyBGb3JjZSByZXBhaW50IGJlZm9yZSB1cGRhdGluZyBjbGFzc2VzIGFuZCB0cmFuc2Zvcm0gdG8gZW5zdXJlIHRoZSB0cmFuc2Zvcm0gcHJvcGVybHkgdGFrZXMgZWZmZWN0XG4gICAgZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShOT19UUkFOU0lUSU9OX0NMQVNTKTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoQUNUSVZFX0NMQVNTKTtcbiAgICB0aGlzLl9pbmtCYXJDb250ZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgndHJhbnNmb3JtJywgJycpO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgdGhlIGluayBiYXIgZnJvbSB0aGUgY3VycmVudCBpdGVtLiAqL1xuICBkZWFjdGl2YXRlSW5rQmFyKCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEFDVElWRV9DTEFTUyk7XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZXMgdGhlIGZvdW5kYXRpb24uICovXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2NyZWF0ZUlua0JhckVsZW1lbnQoKTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95cyB0aGUgZm91bmRhdGlvbi4gKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5faW5rQmFyRWxlbWVudD8ucmVtb3ZlKCk7XG4gICAgdGhpcy5faW5rQmFyRWxlbWVudCA9IHRoaXMuX2lua0JhckNvbnRlbnRFbGVtZW50ID0gbnVsbCE7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhbmQgYXBwZW5kcyB0aGUgaW5rIGJhciBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9jcmVhdGVJbmtCYXJFbGVtZW50KCkge1xuICAgIGNvbnN0IGRvY3VtZW50Tm9kZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50O1xuICAgIGNvbnN0IGlua0JhckVsZW1lbnQgPSAodGhpcy5faW5rQmFyRWxlbWVudCA9IGRvY3VtZW50Tm9kZS5jcmVhdGVFbGVtZW50KCdzcGFuJykpO1xuICAgIGNvbnN0IGlua0JhckNvbnRlbnRFbGVtZW50ID0gKHRoaXMuX2lua0JhckNvbnRlbnRFbGVtZW50ID0gZG9jdW1lbnROb2RlLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSk7XG5cbiAgICBpbmtCYXJFbGVtZW50LmNsYXNzTmFtZSA9ICdtZGMtdGFiLWluZGljYXRvcic7XG4gICAgaW5rQmFyQ29udGVudEVsZW1lbnQuY2xhc3NOYW1lID1cbiAgICAgICdtZGMtdGFiLWluZGljYXRvcl9fY29udGVudCBtZGMtdGFiLWluZGljYXRvcl9fY29udGVudC0tdW5kZXJsaW5lJztcblxuICAgIGlua0JhckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5faW5rQmFyQ29udGVudEVsZW1lbnQpO1xuICAgIHRoaXMuX2FwcGVuZElua0JhckVsZW1lbnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIHRoZSBpbmsgYmFyIHRvIHRoZSB0YWIgaG9zdCBlbGVtZW50IG9yIGNvbnRlbnQsIGRlcGVuZGluZyBvbiB3aGV0aGVyXG4gICAqIHRoZSBpbmsgYmFyIHNob3VsZCBmaXQgdG8gY29udGVudC5cbiAgICovXG4gIHByaXZhdGUgX2FwcGVuZElua0JhckVsZW1lbnQoKSB7XG4gICAgaWYgKCF0aGlzLl9pbmtCYXJFbGVtZW50ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignSW5rIGJhciBlbGVtZW50IGhhcyBub3QgYmVlbiBjcmVhdGVkIGFuZCBjYW5ub3QgYmUgYXBwZW5kZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gdGhpcy5fZml0VG9Db250ZW50XG4gICAgICA/IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubWRjLXRhYl9fY29udGVudCcpXG4gICAgICA6IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIGlmICghcGFyZW50RWxlbWVudCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ01pc3NpbmcgZWxlbWVudCB0byBob3N0IHRoZSBpbmsgYmFyJyk7XG4gICAgfVxuXG4gICAgcGFyZW50RWxlbWVudCEuYXBwZW5kQ2hpbGQodGhpcy5faW5rQmFyRWxlbWVudCEpO1xuICB9XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBhIE1hdElua0JhciBwb3NpdGlvbmVyIG1ldGhvZCwgZGVmaW5pbmcgdGhlIHBvc2l0aW9uaW5nIGFuZCB3aWR0aCBvZiB0aGUgaW5rXG4gKiBiYXIgaW4gYSBzZXQgb2YgdGFicy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBfTWF0SW5rQmFyUG9zaXRpb25lciB7XG4gIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHtsZWZ0OiBzdHJpbmc7IHdpZHRoOiBzdHJpbmd9O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHBvc2l0aW9uZXIgZnVuY3Rpb24gZm9yIHRoZSBNYXRJbmtCYXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfTUFUX0lOS19CQVJfUE9TSVRJT05FUl9GQUNUT1JZKCk6IF9NYXRJbmtCYXJQb3NpdGlvbmVyIHtcbiAgY29uc3QgbWV0aG9kID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiAoe1xuICAgIGxlZnQ6IGVsZW1lbnQgPyAoZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDApICsgJ3B4JyA6ICcwJyxcbiAgICB3aWR0aDogZWxlbWVudCA/IChlbGVtZW50Lm9mZnNldFdpZHRoIHx8IDApICsgJ3B4JyA6ICcwJyxcbiAgfSk7XG5cbiAgcmV0dXJuIG1ldGhvZDtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIE1hdElua0JhcidzIFBvc2l0aW9uZXIuICovXG5leHBvcnQgY29uc3QgX01BVF9JTktfQkFSX1BPU0lUSU9ORVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48X01hdElua0JhclBvc2l0aW9uZXI+KFxuICAnTWF0SW5rQmFyUG9zaXRpb25lcicsXG4gIHtcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogX01BVF9JTktfQkFSX1BPU0lUSU9ORVJfRkFDVE9SWSxcbiAgfSxcbik7XG4iXX0=