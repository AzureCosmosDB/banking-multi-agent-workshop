/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AriaDescriber, InteractivityChecker } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, booleanAttribute, ChangeDetectionStrategy, Component, createComponent, Directive, ElementRef, EnvironmentInjector, inject, Inject, Input, NgZone, Optional, Renderer2, ViewEncapsulation, ANIMATION_MODULE_TYPE, } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
let nextId = 0;
const BADGE_CONTENT_CLASS = 'mat-badge-content';
/** Keeps track of the apps currently containing badges. */
const badgeApps = new Set();
/**
 * Component used to load the structural styles of the badge.
 * @docs-private
 */
export class _MatBadgeStyleLoader {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatBadgeStyleLoader, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: _MatBadgeStyleLoader, isStandalone: true, selector: "ng-component", ngImport: i0, template: '', isInline: true, styles: [".mat-badge{position:relative}.mat-badge.mat-badge{overflow:visible}.mat-badge-content{position:absolute;text-align:center;display:inline-block;transition:transform 200ms ease-in-out;transform:scale(0.6);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;pointer-events:none;background-color:var(--mat-badge-background-color, var(--mat-app-error));color:var(--mat-badge-text-color, var(--mat-app-on-error));font-family:var(--mat-badge-text-font, var(--mat-app-label-small-font));font-weight:var(--mat-badge-text-weight, var(--mat-app-label-small-weight));border-radius:var(--mat-badge-container-shape, var(--mat-app-corner-full))}.cdk-high-contrast-active .mat-badge-content{outline:solid 1px;border-radius:0}.mat-badge-above .mat-badge-content{bottom:100%}.mat-badge-below .mat-badge-content{top:100%}.mat-badge-before .mat-badge-content{right:100%}[dir=rtl] .mat-badge-before .mat-badge-content{right:auto;left:100%}.mat-badge-after .mat-badge-content{left:100%}[dir=rtl] .mat-badge-after .mat-badge-content{left:auto;right:100%}.mat-badge-disabled .mat-badge-content{background-color:var(--mat-badge-disabled-state-background-color);color:var(--mat-badge-disabled-state-text-color, var(--mat-app-on-error))}.mat-badge-hidden .mat-badge-content{display:none}.ng-animate-disabled .mat-badge-content,.mat-badge-content._mat-animation-noopable{transition:none}.mat-badge-content.mat-badge-active{transform:none}.mat-badge-small .mat-badge-content{width:var(--mat-badge-legacy-small-size-container-size);height:var(--mat-badge-legacy-small-size-container-size);min-width:var(--mat-badge-small-size-container-size);min-height:var(--mat-badge-small-size-container-size);line-height:var(--mat-badge-small-size-line-height);padding:var(--mat-badge-small-size-container-padding);font-size:var(--mat-badge-small-size-text-size);margin:var(--mat-badge-small-size-container-offset)}.mat-badge-small.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-small-size-container-overlap-offset)}.mat-badge-medium .mat-badge-content{width:var(--mat-badge-legacy-container-size);height:var(--mat-badge-legacy-container-size);min-width:var(--mat-badge-container-size);min-height:var(--mat-badge-container-size);line-height:var(--mat-badge-line-height);padding:var(--mat-badge-container-padding);font-size:var(--mat-badge-text-size, var(--mat-app-label-small-size));margin:var(--mat-badge-container-offset)}.mat-badge-medium.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-container-overlap-offset)}.mat-badge-large .mat-badge-content{width:var(--mat-badge-legacy-large-size-container-size);height:var(--mat-badge-legacy-large-size-container-size);min-width:var(--mat-badge-large-size-container-size);min-height:var(--mat-badge-large-size-container-size);line-height:var(--mat-badge-large-size-line-height);padding:var(--mat-badge-large-size-container-padding);font-size:var(--mat-badge-large-size-text-size, var(--mat-app-label-small-size));margin:var(--mat-badge-large-size-container-offset)}.mat-badge-large.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-large-size-container-overlap-offset)}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: _MatBadgeStyleLoader, decorators: [{
            type: Component,
            args: [{ standalone: true, encapsulation: ViewEncapsulation.None, template: '', changeDetection: ChangeDetectionStrategy.OnPush, styles: [".mat-badge{position:relative}.mat-badge.mat-badge{overflow:visible}.mat-badge-content{position:absolute;text-align:center;display:inline-block;transition:transform 200ms ease-in-out;transform:scale(0.6);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;pointer-events:none;background-color:var(--mat-badge-background-color, var(--mat-app-error));color:var(--mat-badge-text-color, var(--mat-app-on-error));font-family:var(--mat-badge-text-font, var(--mat-app-label-small-font));font-weight:var(--mat-badge-text-weight, var(--mat-app-label-small-weight));border-radius:var(--mat-badge-container-shape, var(--mat-app-corner-full))}.cdk-high-contrast-active .mat-badge-content{outline:solid 1px;border-radius:0}.mat-badge-above .mat-badge-content{bottom:100%}.mat-badge-below .mat-badge-content{top:100%}.mat-badge-before .mat-badge-content{right:100%}[dir=rtl] .mat-badge-before .mat-badge-content{right:auto;left:100%}.mat-badge-after .mat-badge-content{left:100%}[dir=rtl] .mat-badge-after .mat-badge-content{left:auto;right:100%}.mat-badge-disabled .mat-badge-content{background-color:var(--mat-badge-disabled-state-background-color);color:var(--mat-badge-disabled-state-text-color, var(--mat-app-on-error))}.mat-badge-hidden .mat-badge-content{display:none}.ng-animate-disabled .mat-badge-content,.mat-badge-content._mat-animation-noopable{transition:none}.mat-badge-content.mat-badge-active{transform:none}.mat-badge-small .mat-badge-content{width:var(--mat-badge-legacy-small-size-container-size);height:var(--mat-badge-legacy-small-size-container-size);min-width:var(--mat-badge-small-size-container-size);min-height:var(--mat-badge-small-size-container-size);line-height:var(--mat-badge-small-size-line-height);padding:var(--mat-badge-small-size-container-padding);font-size:var(--mat-badge-small-size-text-size);margin:var(--mat-badge-small-size-container-offset)}.mat-badge-small.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-small-size-container-overlap-offset)}.mat-badge-medium .mat-badge-content{width:var(--mat-badge-legacy-container-size);height:var(--mat-badge-legacy-container-size);min-width:var(--mat-badge-container-size);min-height:var(--mat-badge-container-size);line-height:var(--mat-badge-line-height);padding:var(--mat-badge-container-padding);font-size:var(--mat-badge-text-size, var(--mat-app-label-small-size));margin:var(--mat-badge-container-offset)}.mat-badge-medium.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-container-overlap-offset)}.mat-badge-large .mat-badge-content{width:var(--mat-badge-legacy-large-size-container-size);height:var(--mat-badge-legacy-large-size-container-size);min-width:var(--mat-badge-large-size-container-size);min-height:var(--mat-badge-large-size-container-size);line-height:var(--mat-badge-large-size-line-height);padding:var(--mat-badge-large-size-container-padding);font-size:var(--mat-badge-large-size-text-size, var(--mat-app-label-small-size));margin:var(--mat-badge-large-size-container-offset)}.mat-badge-large.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-large-size-container-overlap-offset)}"] }]
        }] });
/** Directive to display a text badge. */
export class MatBadge {
    /**
     * Theme color of the badge. This API is supported in M2 themes only, it
     * has no effect in M3 themes.
     *
     * For information on applying color variants in M3, see
     * https://material.angular.io/guide/theming#using-component-color-variants.
     */
    get color() {
        return this._color;
    }
    set color(value) {
        this._setColor(value);
        this._color = value;
    }
    /** The content for the badge */
    get content() {
        return this._content;
    }
    set content(newContent) {
        this._updateRenderedContent(newContent);
    }
    /** Message used to describe the decorated element via aria-describedby */
    get description() {
        return this._description;
    }
    set description(newDescription) {
        this._updateDescription(newDescription);
    }
    constructor(_ngZone, _elementRef, _ariaDescriber, _renderer, _animationMode) {
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._ariaDescriber = _ariaDescriber;
        this._renderer = _renderer;
        this._animationMode = _animationMode;
        this._color = 'primary';
        /** Whether the badge should overlap its contents or not */
        this.overlap = true;
        /**
         * Position the badge should reside.
         * Accepts any combination of 'above'|'below' and 'before'|'after'
         */
        this.position = 'above after';
        /** Size of the badge. Can be 'small', 'medium', or 'large'. */
        this.size = 'medium';
        /** Unique id for the badge */
        this._id = nextId++;
        /** Whether the OnInit lifecycle hook has run yet */
        this._isInitialized = false;
        /** InteractivityChecker to determine if the badge host is focusable. */
        this._interactivityChecker = inject(InteractivityChecker);
        this._document = inject(DOCUMENT);
        const appRef = inject(ApplicationRef);
        if (!badgeApps.has(appRef)) {
            badgeApps.add(appRef);
            const componentRef = createComponent(_MatBadgeStyleLoader, {
                environmentInjector: inject(EnvironmentInjector),
            });
            appRef.onDestroy(() => {
                badgeApps.delete(appRef);
                componentRef.destroy();
            });
        }
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const nativeElement = _elementRef.nativeElement;
            if (nativeElement.nodeType !== nativeElement.ELEMENT_NODE) {
                throw Error('matBadge must be attached to an element node.');
            }
            const matIconTagName = 'mat-icon';
            // Heads-up for developers to avoid putting matBadge on <mat-icon>
            // as it is aria-hidden by default docs mention this at:
            // https://material.angular.io/components/badge/overview#accessibility
            if (nativeElement.tagName.toLowerCase() === matIconTagName &&
                nativeElement.getAttribute('aria-hidden') === 'true') {
                console.warn(`Detected a matBadge on an "aria-hidden" "<mat-icon>". ` +
                    `Consider setting aria-hidden="false" in order to surface the information assistive technology.` +
                    `\n${nativeElement.outerHTML}`);
            }
        }
    }
    /** Whether the badge is above the host or not */
    isAbove() {
        return this.position.indexOf('below') === -1;
    }
    /** Whether the badge is after the host or not */
    isAfter() {
        return this.position.indexOf('before') === -1;
    }
    /**
     * Gets the element into which the badge's content is being rendered. Undefined if the element
     * hasn't been created (e.g. if the badge doesn't have content).
     */
    getBadgeElement() {
        return this._badgeElement;
    }
    ngOnInit() {
        // We may have server-side rendered badge that we need to clear.
        // We need to do this in ngOnInit because the full content of the component
        // on which the badge is attached won't necessarily be in the DOM until this point.
        this._clearExistingBadges();
        if (this.content && !this._badgeElement) {
            this._badgeElement = this._createBadgeElement();
            this._updateRenderedContent(this.content);
        }
        this._isInitialized = true;
    }
    ngOnDestroy() {
        // ViewEngine only: when creating a badge through the Renderer, Angular remembers its index.
        // We have to destroy it ourselves, otherwise it'll be retained in memory.
        if (this._renderer.destroyNode) {
            this._renderer.destroyNode(this._badgeElement);
            this._inlineBadgeDescription?.remove();
        }
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.description);
    }
    /** Gets whether the badge's host element is interactive. */
    _isHostInteractive() {
        // Ignore visibility since it requires an expensive style caluclation.
        return this._interactivityChecker.isFocusable(this._elementRef.nativeElement, {
            ignoreVisibility: true,
        });
    }
    /** Creates the badge element */
    _createBadgeElement() {
        const badgeElement = this._renderer.createElement('span');
        const activeClass = 'mat-badge-active';
        badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);
        // The badge is aria-hidden because we don't want it to appear in the page's navigation
        // flow. Instead, we use the badge to describe the decorated element with aria-describedby.
        badgeElement.setAttribute('aria-hidden', 'true');
        badgeElement.classList.add(BADGE_CONTENT_CLASS);
        if (this._animationMode === 'NoopAnimations') {
            badgeElement.classList.add('_mat-animation-noopable');
        }
        this._elementRef.nativeElement.appendChild(badgeElement);
        // animate in after insertion
        if (typeof requestAnimationFrame === 'function' && this._animationMode !== 'NoopAnimations') {
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => {
                    badgeElement.classList.add(activeClass);
                });
            });
        }
        else {
            badgeElement.classList.add(activeClass);
        }
        return badgeElement;
    }
    /** Update the text content of the badge element in the DOM, creating the element if necessary. */
    _updateRenderedContent(newContent) {
        const newContentNormalized = `${newContent ?? ''}`.trim();
        // Don't create the badge element if the directive isn't initialized because we want to
        // append the badge element to the *end* of the host element's content for backwards
        // compatibility.
        if (this._isInitialized && newContentNormalized && !this._badgeElement) {
            this._badgeElement = this._createBadgeElement();
        }
        if (this._badgeElement) {
            this._badgeElement.textContent = newContentNormalized;
        }
        this._content = newContentNormalized;
    }
    /** Updates the host element's aria description via AriaDescriber. */
    _updateDescription(newDescription) {
        // Always start by removing the aria-describedby; we will add a new one if necessary.
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.description);
        // NOTE: We only check whether the host is interactive here, which happens during
        // when then badge content changes. It is possible that the host changes
        // interactivity status separate from one of these. However, watching the interactivity
        // status of the host would require a `MutationObserver`, which is likely more code + overhead
        // than it's worth; from usages inside Google, we see that the vats majority of badges either
        // never change interactivity, or also set `matBadgeHidden` based on the same condition.
        if (!newDescription || this._isHostInteractive()) {
            this._removeInlineDescription();
        }
        this._description = newDescription;
        // We don't add `aria-describedby` for non-interactive hosts elements because we
        // instead insert the description inline.
        if (this._isHostInteractive()) {
            this._ariaDescriber.describe(this._elementRef.nativeElement, newDescription);
        }
        else {
            this._updateInlineDescription();
        }
    }
    _updateInlineDescription() {
        // Create the inline description element if it doesn't exist
        if (!this._inlineBadgeDescription) {
            this._inlineBadgeDescription = this._document.createElement('span');
            this._inlineBadgeDescription.classList.add('cdk-visually-hidden');
        }
        this._inlineBadgeDescription.textContent = this.description;
        this._badgeElement?.appendChild(this._inlineBadgeDescription);
    }
    _removeInlineDescription() {
        this._inlineBadgeDescription?.remove();
        this._inlineBadgeDescription = undefined;
    }
    /** Adds css theme class given the color to the component host */
    _setColor(colorPalette) {
        const classList = this._elementRef.nativeElement.classList;
        classList.remove(`mat-badge-${this._color}`);
        if (colorPalette) {
            classList.add(`mat-badge-${colorPalette}`);
        }
    }
    /** Clears any existing badges that might be left over from server-side rendering. */
    _clearExistingBadges() {
        // Only check direct children of this host element in order to avoid deleting
        // any badges that might exist in descendant elements.
        const badges = this._elementRef.nativeElement.querySelectorAll(`:scope > .${BADGE_CONTENT_CLASS}`);
        for (const badgeElement of Array.from(badges)) {
            if (badgeElement !== this._badgeElement) {
                badgeElement.remove();
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBadge, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i1.AriaDescriber }, { token: i0.Renderer2 }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatBadge, isStandalone: true, selector: "[matBadge]", inputs: { color: ["matBadgeColor", "color"], overlap: ["matBadgeOverlap", "overlap", booleanAttribute], disabled: ["matBadgeDisabled", "disabled", booleanAttribute], position: ["matBadgePosition", "position"], content: ["matBadge", "content"], description: ["matBadgeDescription", "description"], size: ["matBadgeSize", "size"], hidden: ["matBadgeHidden", "hidden", booleanAttribute] }, host: { properties: { "class.mat-badge-overlap": "overlap", "class.mat-badge-above": "isAbove()", "class.mat-badge-below": "!isAbove()", "class.mat-badge-before": "!isAfter()", "class.mat-badge-after": "isAfter()", "class.mat-badge-small": "size === \"small\"", "class.mat-badge-medium": "size === \"medium\"", "class.mat-badge-large": "size === \"large\"", "class.mat-badge-hidden": "hidden || !content", "class.mat-badge-disabled": "disabled" }, classAttribute: "mat-badge" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatBadge, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matBadge]',
                    host: {
                        'class': 'mat-badge',
                        '[class.mat-badge-overlap]': 'overlap',
                        '[class.mat-badge-above]': 'isAbove()',
                        '[class.mat-badge-below]': '!isAbove()',
                        '[class.mat-badge-before]': '!isAfter()',
                        '[class.mat-badge-after]': 'isAfter()',
                        '[class.mat-badge-small]': 'size === "small"',
                        '[class.mat-badge-medium]': 'size === "medium"',
                        '[class.mat-badge-large]': 'size === "large"',
                        '[class.mat-badge-hidden]': 'hidden || !content',
                        '[class.mat-badge-disabled]': 'disabled',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i1.AriaDescriber }, { type: i0.Renderer2 }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }], propDecorators: { color: [{
                type: Input,
                args: ['matBadgeColor']
            }], overlap: [{
                type: Input,
                args: [{ alias: 'matBadgeOverlap', transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ alias: 'matBadgeDisabled', transform: booleanAttribute }]
            }], position: [{
                type: Input,
                args: ['matBadgePosition']
            }], content: [{
                type: Input,
                args: ['matBadge']
            }], description: [{
                type: Input,
                args: ['matBadgeDescription']
            }], size: [{
                type: Input,
                args: ['matBadgeSize']
            }], hidden: [{
                type: Input,
                args: [{ alias: 'matBadgeHidden', transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYmFkZ2UvYmFkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsY0FBYyxFQUNkLGdCQUFnQixFQUNoQix1QkFBdUIsRUFDdkIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBR04sUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIscUJBQXFCLEdBQ3RCLE1BQU0sZUFBZSxDQUFDOzs7QUFHdkIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBZ0JmLE1BQU0sbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7QUFFaEQsMkRBQTJEO0FBQzNELE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBRTVDOzs7R0FHRztBQVFILE1BQU0sT0FBTyxvQkFBb0I7cUhBQXBCLG9CQUFvQjt5R0FBcEIsb0JBQW9CLHdFQUhyQixFQUFFOztrR0FHRCxvQkFBb0I7a0JBUGhDLFNBQVM7aUNBQ0ksSUFBSSxpQkFFRCxpQkFBaUIsQ0FBQyxJQUFJLFlBQzNCLEVBQUUsbUJBQ0ssdUJBQXVCLENBQUMsTUFBTTs7QUFJakQseUNBQXlDO0FBa0J6QyxNQUFNLE9BQU8sUUFBUTtJQUNuQjs7Ozs7O09BTUc7SUFDSCxJQUNJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUNELElBQUksS0FBSyxDQUFDLEtBQW1CO1FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMs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QUFDO2dCQUdHLFFBQVE7c0JBQXhFLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQU1wQyxRQUFRO3NCQUFsQyxLQUFLO3VCQUFDLGtCQUFrQjtnQkFJckIsT0FBTztzQkFEVixLQUFLO3VCQUFDLFVBQVU7Z0JBV2IsV0FBVztzQkFEZCxLQUFLO3VCQUFDLHFCQUFxQjtnQkFVTCxJQUFJO3NCQUExQixLQUFLO3VCQUFDLGNBQWM7Z0JBRzBDLE1BQU07c0JBQXBFLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJpYURlc2NyaWJlciwgSW50ZXJhY3Rpdml0eUNoZWNrZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBcHBsaWNhdGlvblJlZixcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgY3JlYXRlQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEVudmlyb25tZW50SW5qZWN0b3IsXG4gIGluamVjdCxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFJlbmRlcmVyMixcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEFOSU1BVElPTl9NT0RVTEVfVFlQRSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1RoZW1lUGFsZXR0ZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG4vKiogQWxsb3dlZCBwb3NpdGlvbiBvcHRpb25zIGZvciBtYXRCYWRnZVBvc2l0aW9uICovXG5leHBvcnQgdHlwZSBNYXRCYWRnZVBvc2l0aW9uID1cbiAgfCAnYWJvdmUgYWZ0ZXInXG4gIHwgJ2Fib3ZlIGJlZm9yZSdcbiAgfCAnYmVsb3cgYmVmb3JlJ1xuICB8ICdiZWxvdyBhZnRlcidcbiAgfCAnYmVmb3JlJ1xuICB8ICdhZnRlcidcbiAgfCAnYWJvdmUnXG4gIHwgJ2JlbG93JztcblxuLyoqIEFsbG93ZWQgc2l6ZSBvcHRpb25zIGZvciBtYXRCYWRnZVNpemUgKi9cbmV4cG9ydCB0eXBlIE1hdEJhZGdlU2l6ZSA9ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZSc7XG5cbmNvbnN0IEJBREdFX0NPTlRFTlRfQ0xBU1MgPSAnbWF0LWJhZGdlLWNvbnRlbnQnO1xuXG4vKiogS2VlcHMgdHJhY2sgb2YgdGhlIGFwcHMgY3VycmVudGx5IGNvbnRhaW5pbmcgYmFkZ2VzLiAqL1xuY29uc3QgYmFkZ2VBcHBzID0gbmV3IFNldDxBcHBsaWNhdGlvblJlZj4oKTtcblxuLyoqXG4gKiBDb21wb25lbnQgdXNlZCB0byBsb2FkIHRoZSBzdHJ1Y3R1cmFsIHN0eWxlcyBvZiB0aGUgYmFkZ2UuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzdHlsZVVybDogJ2JhZGdlLmNzcycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHRlbXBsYXRlOiAnJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIF9NYXRCYWRnZVN0eWxlTG9hZGVyIHt9XG5cbi8qKiBEaXJlY3RpdmUgdG8gZGlzcGxheSBhIHRleHQgYmFkZ2UuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0QmFkZ2VdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtYmFkZ2UnLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLW92ZXJsYXBdJzogJ292ZXJsYXAnLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWFib3ZlXSc6ICdpc0Fib3ZlKCknLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWJlbG93XSc6ICchaXNBYm92ZSgpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1iZWZvcmVdJzogJyFpc0FmdGVyKCknLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWFmdGVyXSc6ICdpc0FmdGVyKCknLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLXNtYWxsXSc6ICdzaXplID09PSBcInNtYWxsXCInLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLW1lZGl1bV0nOiAnc2l6ZSA9PT0gXCJtZWRpdW1cIicsXG4gICAgJ1tjbGFzcy5tYXQtYmFkZ2UtbGFyZ2VdJzogJ3NpemUgPT09IFwibGFyZ2VcIicsXG4gICAgJ1tjbGFzcy5tYXQtYmFkZ2UtaGlkZGVuXSc6ICdoaWRkZW4gfHwgIWNvbnRlbnQnLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEJhZGdlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogVGhlbWUgY29sb3Igb2YgdGhlIGJhZGdlLiBUaGlzIEFQSSBpcyBzdXBwb3J0ZWQgaW4gTTIgdGhlbWVzIG9ubHksIGl0XG4gICAqIGhhcyBubyBlZmZlY3QgaW4gTTMgdGhlbWVzLlxuICAgKlxuICAgKiBGb3IgaW5mb3JtYXRpb24gb24gYXBwbHlpbmcgY29sb3IgdmFyaWFudHMgaW4gTTMsIHNlZVxuICAgKiBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vZ3VpZGUvdGhlbWluZyN1c2luZy1jb21wb25lbnQtY29sb3ItdmFyaWFudHMuXG4gICAqL1xuICBASW5wdXQoJ21hdEJhZGdlQ29sb3InKVxuICBnZXQgY29sb3IoKTogVGhlbWVQYWxldHRlIHtcbiAgICByZXR1cm4gdGhpcy5fY29sb3I7XG4gIH1cbiAgc2V0IGNvbG9yKHZhbHVlOiBUaGVtZVBhbGV0dGUpIHtcbiAgICB0aGlzLl9zZXRDb2xvcih2YWx1ZSk7XG4gICAgdGhpcy5fY29sb3IgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9jb2xvcjogVGhlbWVQYWxldHRlID0gJ3ByaW1hcnknO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBiYWRnZSBzaG91bGQgb3ZlcmxhcCBpdHMgY29udGVudHMgb3Igbm90ICovXG4gIEBJbnB1dCh7YWxpYXM6ICdtYXRCYWRnZU92ZXJsYXAnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBvdmVybGFwOiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogV2hldGhlciB0aGUgYmFkZ2UgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdtYXRCYWRnZURpc2FibGVkJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9uIHRoZSBiYWRnZSBzaG91bGQgcmVzaWRlLlxuICAgKiBBY2NlcHRzIGFueSBjb21iaW5hdGlvbiBvZiAnYWJvdmUnfCdiZWxvdycgYW5kICdiZWZvcmUnfCdhZnRlcidcbiAgICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VQb3NpdGlvbicpIHBvc2l0aW9uOiBNYXRCYWRnZVBvc2l0aW9uID0gJ2Fib3ZlIGFmdGVyJztcblxuICAvKiogVGhlIGNvbnRlbnQgZm9yIHRoZSBiYWRnZSAqL1xuICBASW5wdXQoJ21hdEJhZGdlJylcbiAgZ2V0IGNvbnRlbnQoKTogc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnQ7XG4gIH1cbiAgc2V0IGNvbnRlbnQobmV3Q29udGVudDogc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCkge1xuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkQ29udGVudChuZXdDb250ZW50KTtcbiAgfVxuICBwcml2YXRlIF9jb250ZW50OiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsO1xuXG4gIC8qKiBNZXNzYWdlIHVzZWQgdG8gZGVzY3JpYmUgdGhlIGRlY29yYXRlZCBlbGVtZW50IHZpYSBhcmlhLWRlc2NyaWJlZGJ5ICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VEZXNjcmlwdGlvbicpXG4gIGdldCBkZXNjcmlwdGlvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjtcbiAgfVxuICBzZXQgZGVzY3JpcHRpb24obmV3RGVzY3JpcHRpb246IHN0cmluZykge1xuICAgIHRoaXMuX3VwZGF0ZURlc2NyaXB0aW9uKG5ld0Rlc2NyaXB0aW9uKTtcbiAgfVxuICBwcml2YXRlIF9kZXNjcmlwdGlvbjogc3RyaW5nO1xuXG4gIC8qKiBTaXplIG9mIHRoZSBiYWRnZS4gQ2FuIGJlICdzbWFsbCcsICdtZWRpdW0nLCBvciAnbGFyZ2UnLiAqL1xuICBASW5wdXQoJ21hdEJhZGdlU2l6ZScpIHNpemU6IE1hdEJhZGdlU2l6ZSA9ICdtZWRpdW0nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBiYWRnZSBpcyBoaWRkZW4uICovXG4gIEBJbnB1dCh7YWxpYXM6ICdtYXRCYWRnZUhpZGRlbicsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGhpZGRlbjogYm9vbGVhbjtcblxuICAvKiogVW5pcXVlIGlkIGZvciB0aGUgYmFkZ2UgKi9cbiAgX2lkOiBudW1iZXIgPSBuZXh0SWQrKztcblxuICAvKiogVmlzaWJsZSBiYWRnZSBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9iYWRnZUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBJbmxpbmUgYmFkZ2UgZGVzY3JpcHRpb24uIFVzZWQgd2hlbiB0aGUgYmFkZ2UgaXMgYXBwbGllZCB0byBub24taW50ZXJhY3RpdmUgaG9zdCBlbGVtZW50cy4gKi9cbiAgcHJpdmF0ZSBfaW5saW5lQmFkZ2VEZXNjcmlwdGlvbjogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIE9uSW5pdCBsaWZlY3ljbGUgaG9vayBoYXMgcnVuIHlldCAqL1xuICBwcml2YXRlIF9pc0luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgLyoqIEludGVyYWN0aXZpdHlDaGVja2VyIHRvIGRldGVybWluZSBpZiB0aGUgYmFkZ2UgaG9zdCBpcyBmb2N1c2FibGUuICovXG4gIHByaXZhdGUgX2ludGVyYWN0aXZpdHlDaGVja2VyID0gaW5qZWN0KEludGVyYWN0aXZpdHlDaGVja2VyKTtcblxuICBwcml2YXRlIF9kb2N1bWVudCA9IGluamVjdChET0NVTUVOVCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfYXJpYURlc2NyaWJlcjogQXJpYURlc2NyaWJlcixcbiAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwcml2YXRlIF9hbmltYXRpb25Nb2RlPzogc3RyaW5nLFxuICApIHtcbiAgICBjb25zdCBhcHBSZWYgPSBpbmplY3QoQXBwbGljYXRpb25SZWYpO1xuXG4gICAgaWYgKCFiYWRnZUFwcHMuaGFzKGFwcFJlZikpIHtcbiAgICAgIGJhZGdlQXBwcy5hZGQoYXBwUmVmKTtcblxuICAgICAgY29uc3QgY29tcG9uZW50UmVmID0gY3JlYXRlQ29tcG9uZW50KF9NYXRCYWRnZVN0eWxlTG9hZGVyLCB7XG4gICAgICAgIGVudmlyb25tZW50SW5qZWN0b3I6IGluamVjdChFbnZpcm9ubWVudEluamVjdG9yKSxcbiAgICAgIH0pO1xuXG4gICAgICBhcHBSZWYub25EZXN0cm95KCgpID0+IHtcbiAgICAgICAgYmFkZ2VBcHBzLmRlbGV0ZShhcHBSZWYpO1xuICAgICAgICBjb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlVHlwZSAhPT0gbmF0aXZlRWxlbWVudC5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ21hdEJhZGdlIG11c3QgYmUgYXR0YWNoZWQgdG8gYW4gZWxlbWVudCBub2RlLicpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRJY29uVGFnTmFtZTogc3RyaW5nID0gJ21hdC1pY29uJztcblxuICAgICAgLy8gSGVhZHMtdXAgZm9yIGRldmVsb3BlcnMgdG8gYXZvaWQgcHV0dGluZyBtYXRCYWRnZSBvbiA8bWF0LWljb24+XG4gICAgICAvLyBhcyBpdCBpcyBhcmlhLWhpZGRlbiBieSBkZWZhdWx0IGRvY3MgbWVudGlvbiB0aGlzIGF0OlxuICAgICAgLy8gaHR0cHM6Ly9tYXRlcmlhbC5hbmd1bGFyLmlvL2NvbXBvbmVudHMvYmFkZ2Uvb3ZlcnZpZXcjYWNjZXNzaWJpbGl0eVxuICAgICAgaWYgKFxuICAgICAgICBuYXRpdmVFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gbWF0SWNvblRhZ05hbWUgJiZcbiAgICAgICAgbmF0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJykgPT09ICd0cnVlJ1xuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgRGV0ZWN0ZWQgYSBtYXRCYWRnZSBvbiBhbiBcImFyaWEtaGlkZGVuXCIgXCI8bWF0LWljb24+XCIuIGAgK1xuICAgICAgICAgICAgYENvbnNpZGVyIHNldHRpbmcgYXJpYS1oaWRkZW49XCJmYWxzZVwiIGluIG9yZGVyIHRvIHN1cmZhY2UgdGhlIGluZm9ybWF0aW9uIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LmAgK1xuICAgICAgICAgICAgYFxcbiR7bmF0aXZlRWxlbWVudC5vdXRlckhUTUx9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYmFkZ2UgaXMgYWJvdmUgdGhlIGhvc3Qgb3Igbm90ICovXG4gIGlzQWJvdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uaW5kZXhPZignYmVsb3cnKSA9PT0gLTE7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYmFkZ2UgaXMgYWZ0ZXIgdGhlIGhvc3Qgb3Igbm90ICovXG4gIGlzQWZ0ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uaW5kZXhPZignYmVmb3JlJykgPT09IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGVsZW1lbnQgaW50byB3aGljaCB0aGUgYmFkZ2UncyBjb250ZW50IGlzIGJlaW5nIHJlbmRlcmVkLiBVbmRlZmluZWQgaWYgdGhlIGVsZW1lbnRcbiAgICogaGFzbid0IGJlZW4gY3JlYXRlZCAoZS5nLiBpZiB0aGUgYmFkZ2UgZG9lc24ndCBoYXZlIGNvbnRlbnQpLlxuICAgKi9cbiAgZ2V0QmFkZ2VFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fYmFkZ2VFbGVtZW50O1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gV2UgbWF5IGhhdmUgc2VydmVyLXNpZGUgcmVuZGVyZWQgYmFkZ2UgdGhhdCB3ZSBuZWVkIHRvIGNsZWFyLlxuICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcyBpbiBuZ09uSW5pdCBiZWNhdXNlIHRoZSBmdWxsIGNvbnRlbnQgb2YgdGhlIGNvbXBvbmVudFxuICAgIC8vIG9uIHdoaWNoIHRoZSBiYWRnZSBpcyBhdHRhY2hlZCB3b24ndCBuZWNlc3NhcmlseSBiZSBpbiB0aGUgRE9NIHVudGlsIHRoaXMgcG9pbnQuXG4gICAgdGhpcy5fY2xlYXJFeGlzdGluZ0JhZGdlcygpO1xuXG4gICAgaWYgKHRoaXMuY29udGVudCAmJiAhdGhpcy5fYmFkZ2VFbGVtZW50KSB7XG4gICAgICB0aGlzLl9iYWRnZUVsZW1lbnQgPSB0aGlzLl9jcmVhdGVCYWRnZUVsZW1lbnQoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkQ29udGVudCh0aGlzLmNvbnRlbnQpO1xuICAgIH1cblxuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gVmlld0VuZ2luZSBvbmx5OiB3aGVuIGNyZWF0aW5nIGEgYmFkZ2UgdGhyb3VnaCB0aGUgUmVuZGVyZXIsIEFuZ3VsYXIgcmVtZW1iZXJzIGl0cyBpbmRleC5cbiAgICAvLyBXZSBoYXZlIHRvIGRlc3Ryb3kgaXQgb3Vyc2VsdmVzLCBvdGhlcndpc2UgaXQnbGwgYmUgcmV0YWluZWQgaW4gbWVtb3J5LlxuICAgIGlmICh0aGlzLl9yZW5kZXJlci5kZXN0cm95Tm9kZSkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuZGVzdHJveU5vZGUodGhpcy5fYmFkZ2VFbGVtZW50KTtcbiAgICAgIHRoaXMuX2lubGluZUJhZGdlRGVzY3JpcHRpb24/LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2FyaWFEZXNjcmliZXIucmVtb3ZlRGVzY3JpcHRpb24odGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLmRlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGJhZGdlJ3MgaG9zdCBlbGVtZW50IGlzIGludGVyYWN0aXZlLiAqL1xuICBwcml2YXRlIF9pc0hvc3RJbnRlcmFjdGl2ZSgpOiBib29sZWFuIHtcbiAgICAvLyBJZ25vcmUgdmlzaWJpbGl0eSBzaW5jZSBpdCByZXF1aXJlcyBhbiBleHBlbnNpdmUgc3R5bGUgY2FsdWNsYXRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZpdHlDaGVja2VyLmlzRm9jdXNhYmxlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwge1xuICAgICAgaWdub3JlVmlzaWJpbGl0eTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIHRoZSBiYWRnZSBlbGVtZW50ICovXG4gIHByaXZhdGUgX2NyZWF0ZUJhZGdlRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgY29uc3QgYmFkZ2VFbGVtZW50ID0gdGhpcy5fcmVuZGVyZXIuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGNvbnN0IGFjdGl2ZUNsYXNzID0gJ21hdC1iYWRnZS1hY3RpdmUnO1xuXG4gICAgYmFkZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCBgbWF0LWJhZGdlLWNvbnRlbnQtJHt0aGlzLl9pZH1gKTtcblxuICAgIC8vIFRoZSBiYWRnZSBpcyBhcmlhLWhpZGRlbiBiZWNhdXNlIHdlIGRvbid0IHdhbnQgaXQgdG8gYXBwZWFyIGluIHRoZSBwYWdlJ3MgbmF2aWdhdGlvblxuICAgIC8vIGZsb3cuIEluc3RlYWQsIHdlIHVzZSB0aGUgYmFkZ2UgdG8gZGVzY3JpYmUgdGhlIGRlY29yYXRlZCBlbGVtZW50IHdpdGggYXJpYS1kZXNjcmliZWRieS5cbiAgICBiYWRnZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgYmFkZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoQkFER0VfQ09OVEVOVF9DTEFTUyk7XG5cbiAgICBpZiAodGhpcy5fYW5pbWF0aW9uTW9kZSA9PT0gJ05vb3BBbmltYXRpb25zJykge1xuICAgICAgYmFkZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ19tYXQtYW5pbWF0aW9uLW5vb3BhYmxlJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKGJhZGdlRWxlbWVudCk7XG5cbiAgICAvLyBhbmltYXRlIGluIGFmdGVyIGluc2VydGlvblxuICAgIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAnZnVuY3Rpb24nICYmIHRoaXMuX2FuaW1hdGlvbk1vZGUgIT09ICdOb29wQW5pbWF0aW9ucycpIHtcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgYmFkZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYWRnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChhY3RpdmVDbGFzcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhZGdlRWxlbWVudDtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIHRleHQgY29udGVudCBvZiB0aGUgYmFkZ2UgZWxlbWVudCBpbiB0aGUgRE9NLCBjcmVhdGluZyB0aGUgZWxlbWVudCBpZiBuZWNlc3NhcnkuICovXG4gIHByaXZhdGUgX3VwZGF0ZVJlbmRlcmVkQ29udGVudChuZXdDb250ZW50OiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKTogdm9pZCB7XG4gICAgY29uc3QgbmV3Q29udGVudE5vcm1hbGl6ZWQ6IHN0cmluZyA9IGAke25ld0NvbnRlbnQgPz8gJyd9YC50cmltKCk7XG5cbiAgICAvLyBEb24ndCBjcmVhdGUgdGhlIGJhZGdlIGVsZW1lbnQgaWYgdGhlIGRpcmVjdGl2ZSBpc24ndCBpbml0aWFsaXplZCBiZWNhdXNlIHdlIHdhbnQgdG9cbiAgICAvLyBhcHBlbmQgdGhlIGJhZGdlIGVsZW1lbnQgdG8gdGhlICplbmQqIG9mIHRoZSBob3N0IGVsZW1lbnQncyBjb250ZW50IGZvciBiYWNrd2FyZHNcbiAgICAvLyBjb21wYXRpYmlsaXR5LlxuICAgIGlmICh0aGlzLl9pc0luaXRpYWxpemVkICYmIG5ld0NvbnRlbnROb3JtYWxpemVkICYmICF0aGlzLl9iYWRnZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2JhZGdlRWxlbWVudCA9IHRoaXMuX2NyZWF0ZUJhZGdlRWxlbWVudCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9iYWRnZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2JhZGdlRWxlbWVudC50ZXh0Q29udGVudCA9IG5ld0NvbnRlbnROb3JtYWxpemVkO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbnRlbnQgPSBuZXdDb250ZW50Tm9ybWFsaXplZDtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBob3N0IGVsZW1lbnQncyBhcmlhIGRlc2NyaXB0aW9uIHZpYSBBcmlhRGVzY3JpYmVyLiAqL1xuICBwcml2YXRlIF91cGRhdGVEZXNjcmlwdGlvbihuZXdEZXNjcmlwdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gQWx3YXlzIHN0YXJ0IGJ5IHJlbW92aW5nIHRoZSBhcmlhLWRlc2NyaWJlZGJ5OyB3ZSB3aWxsIGFkZCBhIG5ldyBvbmUgaWYgbmVjZXNzYXJ5LlxuICAgIHRoaXMuX2FyaWFEZXNjcmliZXIucmVtb3ZlRGVzY3JpcHRpb24odGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLmRlc2NyaXB0aW9uKTtcblxuICAgIC8vIE5PVEU6IFdlIG9ubHkgY2hlY2sgd2hldGhlciB0aGUgaG9zdCBpcyBpbnRlcmFjdGl2ZSBoZXJlLCB3aGljaCBoYXBwZW5zIGR1cmluZ1xuICAgIC8vIHdoZW4gdGhlbiBiYWRnZSBjb250ZW50IGNoYW5nZXMuIEl0IGlzIHBvc3NpYmxlIHRoYXQgdGhlIGhvc3QgY2hhbmdlc1xuICAgIC8vIGludGVyYWN0aXZpdHkgc3RhdHVzIHNlcGFyYXRlIGZyb20gb25lIG9mIHRoZXNlLiBIb3dldmVyLCB3YXRjaGluZyB0aGUgaW50ZXJhY3Rpdml0eVxuICAgIC8vIHN0YXR1cyBvZiB0aGUgaG9zdCB3b3VsZCByZXF1aXJlIGEgYE11dGF0aW9uT2JzZXJ2ZXJgLCB3aGljaCBpcyBsaWtlbHkgbW9yZSBjb2RlICsgb3ZlcmhlYWRcbiAgICAvLyB0aGFuIGl0J3Mgd29ydGg7IGZyb20gdXNhZ2VzIGluc2lkZSBHb29nbGUsIHdlIHNlZSB0aGF0IHRoZSB2YXRzIG1ham9yaXR5IG9mIGJhZGdlcyBlaXRoZXJcbiAgICAvLyBuZXZlciBjaGFuZ2UgaW50ZXJhY3Rpdml0eSwgb3IgYWxzbyBzZXQgYG1hdEJhZGdlSGlkZGVuYCBiYXNlZCBvbiB0aGUgc2FtZSBjb25kaXRpb24uXG5cbiAgICBpZiAoIW5ld0Rlc2NyaXB0aW9uIHx8IHRoaXMuX2lzSG9zdEludGVyYWN0aXZlKCkpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUlubGluZURlc2NyaXB0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVzY3JpcHRpb24gPSBuZXdEZXNjcmlwdGlvbjtcblxuICAgIC8vIFdlIGRvbid0IGFkZCBgYXJpYS1kZXNjcmliZWRieWAgZm9yIG5vbi1pbnRlcmFjdGl2ZSBob3N0cyBlbGVtZW50cyBiZWNhdXNlIHdlXG4gICAgLy8gaW5zdGVhZCBpbnNlcnQgdGhlIGRlc2NyaXB0aW9uIGlubGluZS5cbiAgICBpZiAodGhpcy5faXNIb3N0SW50ZXJhY3RpdmUoKSkge1xuICAgICAgdGhpcy5fYXJpYURlc2NyaWJlci5kZXNjcmliZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIG5ld0Rlc2NyaXB0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdXBkYXRlSW5saW5lRGVzY3JpcHRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVJbmxpbmVEZXNjcmlwdGlvbigpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGlubGluZSBkZXNjcmlwdGlvbiBlbGVtZW50IGlmIGl0IGRvZXNuJ3QgZXhpc3RcbiAgICBpZiAoIXRoaXMuX2lubGluZUJhZGdlRGVzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2lubGluZUJhZGdlRGVzY3JpcHRpb24gPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICB0aGlzLl9pbmxpbmVCYWRnZURlc2NyaXB0aW9uLmNsYXNzTGlzdC5hZGQoJ2Nkay12aXN1YWxseS1oaWRkZW4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbmxpbmVCYWRnZURlc2NyaXB0aW9uLnRleHRDb250ZW50ID0gdGhpcy5kZXNjcmlwdGlvbjtcbiAgICB0aGlzLl9iYWRnZUVsZW1lbnQ/LmFwcGVuZENoaWxkKHRoaXMuX2lubGluZUJhZGdlRGVzY3JpcHRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVtb3ZlSW5saW5lRGVzY3JpcHRpb24oKSB7XG4gICAgdGhpcy5faW5saW5lQmFkZ2VEZXNjcmlwdGlvbj8ucmVtb3ZlKCk7XG4gICAgdGhpcy5faW5saW5lQmFkZ2VEZXNjcmlwdGlvbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKiBBZGRzIGNzcyB0aGVtZSBjbGFzcyBnaXZlbiB0aGUgY29sb3IgdG8gdGhlIGNvbXBvbmVudCBob3N0ICovXG4gIHByaXZhdGUgX3NldENvbG9yKGNvbG9yUGFsZXR0ZTogVGhlbWVQYWxldHRlKSB7XG4gICAgY29uc3QgY2xhc3NMaXN0ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdDtcbiAgICBjbGFzc0xpc3QucmVtb3ZlKGBtYXQtYmFkZ2UtJHt0aGlzLl9jb2xvcn1gKTtcbiAgICBpZiAoY29sb3JQYWxldHRlKSB7XG4gICAgICBjbGFzc0xpc3QuYWRkKGBtYXQtYmFkZ2UtJHtjb2xvclBhbGV0dGV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFycyBhbnkgZXhpc3RpbmcgYmFkZ2VzIHRoYXQgbWlnaHQgYmUgbGVmdCBvdmVyIGZyb20gc2VydmVyLXNpZGUgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIF9jbGVhckV4aXN0aW5nQmFkZ2VzKCkge1xuICAgIC8vIE9ubHkgY2hlY2sgZGlyZWN0IGNoaWxkcmVuIG9mIHRoaXMgaG9zdCBlbGVtZW50IGluIG9yZGVyIHRvIGF2b2lkIGRlbGV0aW5nXG4gICAgLy8gYW55IGJhZGdlcyB0aGF0IG1pZ2h0IGV4aXN0IGluIGRlc2NlbmRhbnQgZWxlbWVudHMuXG4gICAgY29uc3QgYmFkZ2VzID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgOnNjb3BlID4gLiR7QkFER0VfQ09OVEVOVF9DTEFTU31gLFxuICAgICk7XG4gICAgZm9yIChjb25zdCBiYWRnZUVsZW1lbnQgb2YgQXJyYXkuZnJvbShiYWRnZXMpKSB7XG4gICAgICBpZiAoYmFkZ2VFbGVtZW50ICE9PSB0aGlzLl9iYWRnZUVsZW1lbnQpIHtcbiAgICAgICAgYmFkZ2VFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19