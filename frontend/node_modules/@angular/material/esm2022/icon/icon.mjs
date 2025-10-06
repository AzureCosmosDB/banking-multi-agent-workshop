/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Attribute, booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, ErrorHandler, inject, Inject, InjectionToken, Input, Optional, ViewEncapsulation, } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatIconRegistry } from './icon-registry';
import * as i0 from "@angular/core";
import * as i1 from "./icon-registry";
/** Injection token to be used to override the default options for `mat-icon`. */
export const MAT_ICON_DEFAULT_OPTIONS = new InjectionToken('MAT_ICON_DEFAULT_OPTIONS');
/**
 * Injection token used to provide the current location to `MatIcon`.
 * Used to handle server-side rendering and to stub out during unit tests.
 * @docs-private
 */
export const MAT_ICON_LOCATION = new InjectionToken('mat-icon-location', {
    providedIn: 'root',
    factory: MAT_ICON_LOCATION_FACTORY,
});
/** @docs-private */
export function MAT_ICON_LOCATION_FACTORY() {
    const _document = inject(DOCUMENT);
    const _location = _document ? _document.location : null;
    return {
        // Note that this needs to be a function, rather than a property, because Angular
        // will only resolve it once, but we want the current path on each call.
        getPathname: () => (_location ? _location.pathname + _location.search : ''),
    };
}
/** SVG attributes that accept a FuncIRI (e.g. `url(<something>)`). */
const funcIriAttributes = [
    'clip-path',
    'color-profile',
    'src',
    'cursor',
    'fill',
    'filter',
    'marker',
    'marker-start',
    'marker-mid',
    'marker-end',
    'mask',
    'stroke',
];
/** Selector that can be used to find all elements that are using a `FuncIRI`. */
const funcIriAttributeSelector = funcIriAttributes.map(attr => `[${attr}]`).join(', ');
/** Regex that can be used to extract the id out of a FuncIRI. */
const funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;
/**
 * Component to display an icon. It can be used in the following ways:
 *
 * - Specify the svgIcon input to load an SVG icon from a URL previously registered with the
 *   addSvgIcon, addSvgIconInNamespace, addSvgIconSet, or addSvgIconSetInNamespace methods of
 *   MatIconRegistry. If the svgIcon value contains a colon it is assumed to be in the format
 *   "[namespace]:[name]", if not the value will be the name of an icon in the default namespace.
 *   Examples:
 *     `<mat-icon svgIcon="left-arrow"></mat-icon>
 *     <mat-icon svgIcon="animals:cat"></mat-icon>`
 *
 * - Use a font ligature as an icon by putting the ligature text in the `fontIcon` attribute or the
 *   content of the `<mat-icon>` component. If you register a custom font class, don't forget to also
 *   include the special class `mat-ligature-font`. It is recommended to use the attribute alternative
 *   to prevent the ligature text to be selectable and to appear in search engine results.
 *   By default, the Material icons font is used as described at
 *   http://google.github.io/material-design-icons/#icon-font-for-the-web. You can specify an
 *   alternate font by setting the fontSet input to either the CSS class to apply to use the
 *   desired font, or to an alias previously registered with MatIconRegistry.registerFontClassAlias.
 *   Examples:
 *     `<mat-icon fontIcon="home"></mat-icon>
 *     <mat-icon>home</mat-icon>
 *     <mat-icon fontSet="myfont" fontIcon="sun"></mat-icon>
 *     <mat-icon fontSet="myfont">sun</mat-icon>`
 *
 * - Specify a font glyph to be included via CSS rules by setting the fontSet input to specify the
 *   font, and the fontIcon input to specify the icon. Typically the fontIcon will specify a
 *   CSS class which causes the glyph to be displayed via a :before selector, as in
 *   https://fontawesome-v4.github.io/examples/
 *   Example:
 *     `<mat-icon fontSet="fa" fontIcon="alarm"></mat-icon>`
 */
export class MatIcon {
    /**
     * Theme color of the icon. This API is supported in M2 themes only, it
     * has no effect in M3 themes.
     *
     * For information on applying color variants in M3, see
     * https://material.angular.io/guide/theming#using-component-color-variants.
     */
    get color() {
        return this._color || this._defaultColor;
    }
    set color(value) {
        this._color = value;
    }
    /** Name of the icon in the SVG icon set. */
    get svgIcon() {
        return this._svgIcon;
    }
    set svgIcon(value) {
        if (value !== this._svgIcon) {
            if (value) {
                this._updateSvgIcon(value);
            }
            else if (this._svgIcon) {
                this._clearSvgElement();
            }
            this._svgIcon = value;
        }
    }
    /** Font set that the icon is a part of. */
    get fontSet() {
        return this._fontSet;
    }
    set fontSet(value) {
        const newValue = this._cleanupFontValue(value);
        if (newValue !== this._fontSet) {
            this._fontSet = newValue;
            this._updateFontIconClasses();
        }
    }
    /** Name of an icon within a font set. */
    get fontIcon() {
        return this._fontIcon;
    }
    set fontIcon(value) {
        const newValue = this._cleanupFontValue(value);
        if (newValue !== this._fontIcon) {
            this._fontIcon = newValue;
            this._updateFontIconClasses();
        }
    }
    constructor(_elementRef, _iconRegistry, ariaHidden, _location, _errorHandler, defaults) {
        this._elementRef = _elementRef;
        this._iconRegistry = _iconRegistry;
        this._location = _location;
        this._errorHandler = _errorHandler;
        /**
         * Whether the icon should be inlined, automatically sizing the icon to match the font size of
         * the element the icon is contained in.
         */
        this.inline = false;
        this._previousFontSetClass = [];
        /** Subscription to the current in-progress SVG icon request. */
        this._currentIconFetch = Subscription.EMPTY;
        if (defaults) {
            if (defaults.color) {
                this.color = this._defaultColor = defaults.color;
            }
            if (defaults.fontSet) {
                this.fontSet = defaults.fontSet;
            }
        }
        // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
        // the right thing to do for the majority of icon use-cases.
        if (!ariaHidden) {
            _elementRef.nativeElement.setAttribute('aria-hidden', 'true');
        }
    }
    /**
     * Splits an svgIcon binding value into its icon set and icon name components.
     * Returns a 2-element array of [(icon set), (icon name)].
     * The separator for the two fields is ':'. If there is no separator, an empty
     * string is returned for the icon set and the entire value is returned for
     * the icon name. If the argument is falsy, returns an array of two empty strings.
     * Throws an error if the name contains two or more ':' separators.
     * Examples:
     *   `'social:cake' -> ['social', 'cake']
     *   'penguin' -> ['', 'penguin']
     *   null -> ['', '']
     *   'a:b:c' -> (throws Error)`
     */
    _splitIconName(iconName) {
        if (!iconName) {
            return ['', ''];
        }
        const parts = iconName.split(':');
        switch (parts.length) {
            case 1:
                return ['', parts[0]]; // Use default namespace.
            case 2:
                return parts;
            default:
                throw Error(`Invalid icon name: "${iconName}"`); // TODO: add an ngDevMode check
        }
    }
    ngOnInit() {
        // Update font classes because ngOnChanges won't be called if none of the inputs are present,
        // e.g. <mat-icon>arrow</mat-icon> In this case we need to add a CSS class for the default font.
        this._updateFontIconClasses();
    }
    ngAfterViewChecked() {
        const cachedElements = this._elementsWithExternalReferences;
        if (cachedElements && cachedElements.size) {
            const newPath = this._location.getPathname();
            // We need to check whether the URL has changed on each change detection since
            // the browser doesn't have an API that will let us react on link clicks and
            // we can't depend on the Angular router. The references need to be updated,
            // because while most browsers don't care whether the URL is correct after
            // the first render, Safari will break if the user navigates to a different
            // page and the SVG isn't re-rendered.
            if (newPath !== this._previousPath) {
                this._previousPath = newPath;
                this._prependPathToReferences(newPath);
            }
        }
    }
    ngOnDestroy() {
        this._currentIconFetch.unsubscribe();
        if (this._elementsWithExternalReferences) {
            this._elementsWithExternalReferences.clear();
        }
    }
    _usingFontIcon() {
        return !this.svgIcon;
    }
    _setSvgElement(svg) {
        this._clearSvgElement();
        // Note: we do this fix here, rather than the icon registry, because the
        // references have to point to the URL at the time that the icon was created.
        const path = this._location.getPathname();
        this._previousPath = path;
        this._cacheChildrenWithExternalReferences(svg);
        this._prependPathToReferences(path);
        this._elementRef.nativeElement.appendChild(svg);
    }
    _clearSvgElement() {
        const layoutElement = this._elementRef.nativeElement;
        let childCount = layoutElement.childNodes.length;
        if (this._elementsWithExternalReferences) {
            this._elementsWithExternalReferences.clear();
        }
        // Remove existing non-element child nodes and SVGs, and add the new SVG element. Note that
        // we can't use innerHTML, because IE will throw if the element has a data binding.
        while (childCount--) {
            const child = layoutElement.childNodes[childCount];
            // 1 corresponds to Node.ELEMENT_NODE. We remove all non-element nodes in order to get rid
            // of any loose text nodes, as well as any SVG elements in order to remove any old icons.
            if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
                child.remove();
            }
        }
    }
    _updateFontIconClasses() {
        if (!this._usingFontIcon()) {
            return;
        }
        const elem = this._elementRef.nativeElement;
        const fontSetClasses = (this.fontSet
            ? this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/)
            : this._iconRegistry.getDefaultFontSetClass()).filter(className => className.length > 0);
        this._previousFontSetClass.forEach(className => elem.classList.remove(className));
        fontSetClasses.forEach(className => elem.classList.add(className));
        this._previousFontSetClass = fontSetClasses;
        if (this.fontIcon !== this._previousFontIconClass &&
            !fontSetClasses.includes('mat-ligature-font')) {
            if (this._previousFontIconClass) {
                elem.classList.remove(this._previousFontIconClass);
            }
            if (this.fontIcon) {
                elem.classList.add(this.fontIcon);
            }
            this._previousFontIconClass = this.fontIcon;
        }
    }
    /**
     * Cleans up a value to be used as a fontIcon or fontSet.
     * Since the value ends up being assigned as a CSS class, we
     * have to trim the value and omit space-separated values.
     */
    _cleanupFontValue(value) {
        return typeof value === 'string' ? value.trim().split(' ')[0] : value;
    }
    /**
     * Prepends the current path to all elements that have an attribute pointing to a `FuncIRI`
     * reference. This is required because WebKit browsers require references to be prefixed with
     * the current path, if the page has a `base` tag.
     */
    _prependPathToReferences(path) {
        const elements = this._elementsWithExternalReferences;
        if (elements) {
            elements.forEach((attrs, element) => {
                attrs.forEach(attr => {
                    element.setAttribute(attr.name, `url('${path}#${attr.value}')`);
                });
            });
        }
    }
    /**
     * Caches the children of an SVG element that have `url()`
     * references that we need to prefix with the current path.
     */
    _cacheChildrenWithExternalReferences(element) {
        const elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
        const elements = (this._elementsWithExternalReferences =
            this._elementsWithExternalReferences || new Map());
        for (let i = 0; i < elementsWithFuncIri.length; i++) {
            funcIriAttributes.forEach(attr => {
                const elementWithReference = elementsWithFuncIri[i];
                const value = elementWithReference.getAttribute(attr);
                const match = value ? value.match(funcIriPattern) : null;
                if (match) {
                    let attributes = elements.get(elementWithReference);
                    if (!attributes) {
                        attributes = [];
                        elements.set(elementWithReference, attributes);
                    }
                    attributes.push({ name: attr, value: match[1] });
                }
            });
        }
    }
    /** Sets a new SVG icon with a particular name. */
    _updateSvgIcon(rawName) {
        this._svgNamespace = null;
        this._svgName = null;
        this._currentIconFetch.unsubscribe();
        if (rawName) {
            const [namespace, iconName] = this._splitIconName(rawName);
            if (namespace) {
                this._svgNamespace = namespace;
            }
            if (iconName) {
                this._svgName = iconName;
            }
            this._currentIconFetch = this._iconRegistry
                .getNamedSvgIcon(iconName, namespace)
                .pipe(take(1))
                .subscribe(svg => this._setSvgElement(svg), (err) => {
                const errorMessage = `Error retrieving icon ${namespace}:${iconName}! ${err.message}`;
                this._errorHandler.handleError(new Error(errorMessage));
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatIcon, deps: [{ token: i0.ElementRef }, { token: i1.MatIconRegistry }, { token: 'aria-hidden', attribute: true }, { token: MAT_ICON_LOCATION }, { token: i0.ErrorHandler }, { token: MAT_ICON_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatIcon, isStandalone: true, selector: "mat-icon", inputs: { color: "color", inline: ["inline", "inline", booleanAttribute], svgIcon: "svgIcon", fontSet: "fontSet", fontIcon: "fontIcon" }, host: { attributes: { "role": "img" }, properties: { "class": "color ? \"mat-\" + color : \"\"", "attr.data-mat-icon-type": "_usingFontIcon() ? \"font\" : \"svg\"", "attr.data-mat-icon-name": "_svgName || fontIcon", "attr.data-mat-icon-namespace": "_svgNamespace || fontSet", "attr.fontIcon": "_usingFontIcon() ? fontIcon : null", "class.mat-icon-inline": "inline", "class.mat-icon-no-color": "color !== \"primary\" && color !== \"accent\" && color !== \"warn\"" }, classAttribute: "mat-icon notranslate" }, exportAs: ["matIcon"], ngImport: i0, template: '<ng-content></ng-content>', isInline: true, styles: ["mat-icon,mat-icon.mat-primary,mat-icon.mat-accent,mat-icon.mat-warn{color:var(--mat-icon-color)}.mat-icon{-webkit-user-select:none;user-select:none;background-repeat:no-repeat;display:inline-block;fill:currentColor;height:24px;width:24px;overflow:hidden}.mat-icon.mat-icon-inline{font-size:inherit;height:inherit;line-height:inherit;width:inherit}.mat-icon.mat-ligature-font[fontIcon]::before{content:attr(fontIcon)}[dir=rtl] .mat-icon-rtl-mirror{transform:scale(-1, 1)}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon{display:block}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon{margin:auto}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatIcon, decorators: [{
            type: Component,
            args: [{ template: '<ng-content></ng-content>', selector: 'mat-icon', exportAs: 'matIcon', host: {
                        'role': 'img',
                        'class': 'mat-icon notranslate',
                        '[class]': 'color ? "mat-" + color : ""',
                        '[attr.data-mat-icon-type]': '_usingFontIcon() ? "font" : "svg"',
                        '[attr.data-mat-icon-name]': '_svgName || fontIcon',
                        '[attr.data-mat-icon-namespace]': '_svgNamespace || fontSet',
                        '[attr.fontIcon]': '_usingFontIcon() ? fontIcon : null',
                        '[class.mat-icon-inline]': 'inline',
                        '[class.mat-icon-no-color]': 'color !== "primary" && color !== "accent" && color !== "warn"',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, styles: ["mat-icon,mat-icon.mat-primary,mat-icon.mat-accent,mat-icon.mat-warn{color:var(--mat-icon-color)}.mat-icon{-webkit-user-select:none;user-select:none;background-repeat:no-repeat;display:inline-block;fill:currentColor;height:24px;width:24px;overflow:hidden}.mat-icon.mat-icon-inline{font-size:inherit;height:inherit;line-height:inherit;width:inherit}.mat-icon.mat-ligature-font[fontIcon]::before{content:attr(fontIcon)}[dir=rtl] .mat-icon-rtl-mirror{transform:scale(-1, 1)}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon{display:block}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon{margin:auto}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.MatIconRegistry }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['aria-hidden']
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_ICON_LOCATION]
                }] }, { type: i0.ErrorHandler }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_ICON_DEFAULT_OPTIONS]
                }] }], propDecorators: { color: [{
                type: Input
            }], inline: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], svgIcon: [{
                type: Input
            }], fontSet: [{
                type: Input
            }], fontIcon: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9pY29uL2ljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBR0wsUUFBUSxFQUNSLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwQyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQWdCaEQsaUZBQWlGO0FBQ2pGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLElBQUksY0FBYyxDQUN4RCwwQkFBMEIsQ0FDM0IsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGNBQWMsQ0FBa0IsbUJBQW1CLEVBQUU7SUFDeEYsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLHlCQUF5QjtDQUNuQyxDQUFDLENBQUM7QUFVSCxvQkFBb0I7QUFDcEIsTUFBTSxVQUFVLHlCQUF5QjtJQUN2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFeEQsT0FBTztRQUNMLGlGQUFpRjtRQUNqRix3RUFBd0U7UUFDeEUsV0FBVyxFQUFF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QkFEVixLQUFLO2dCQWtCRixPQUFPO3NCQURWLEtBQUs7Z0JBZ0JGLFFBQVE7c0JBRFgsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgQXR0cmlidXRlLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFcnJvckhhbmRsZXIsXG4gIGluamVjdCxcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtUaGVtZVBhbGV0dGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7TWF0SWNvblJlZ2lzdHJ5fSBmcm9tICcuL2ljb24tcmVnaXN0cnknO1xuXG4vKiogRGVmYXVsdCBvcHRpb25zIGZvciBgbWF0LWljb25gLiAgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0SWNvbkRlZmF1bHRPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZW1lIGNvbG9yIG9mIHRoZSBpY29uLiBUaGlzIEFQSSBpcyBzdXBwb3J0ZWQgaW4gTTIgdGhlbWVzIG9ubHksIGl0XG4gICAqIGhhcyBubyBlZmZlY3QgaW4gTTMgdGhlbWVzLlxuICAgKlxuICAgKiBGb3IgaW5mb3JtYXRpb24gb24gYXBwbHlpbmcgY29sb3IgdmFyaWFudHMgaW4gTTMsIHNlZVxuICAgKiBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vZ3VpZGUvdGhlbWluZyN1c2luZy1jb21wb25lbnQtY29sb3ItdmFyaWFudHMuXG4gICAqL1xuICBjb2xvcj86IFRoZW1lUGFsZXR0ZTtcbiAgLyoqIEZvbnQgc2V0IHRoYXQgdGhlIGljb24gaXMgYSBwYXJ0IG9mLiAqL1xuICBmb250U2V0Pzogc3RyaW5nO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYG1hdC1pY29uYC4gKi9cbmV4cG9ydCBjb25zdCBNQVRfSUNPTl9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0SWNvbkRlZmF1bHRPcHRpb25zPihcbiAgJ01BVF9JQ09OX0RFRkFVTFRfT1BUSU9OUycsXG4pO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB1c2VkIHRvIHByb3ZpZGUgdGhlIGN1cnJlbnQgbG9jYXRpb24gdG8gYE1hdEljb25gLlxuICogVXNlZCB0byBoYW5kbGUgc2VydmVyLXNpZGUgcmVuZGVyaW5nIGFuZCB0byBzdHViIG91dCBkdXJpbmcgdW5pdCB0ZXN0cy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9JQ09OX0xPQ0FUSU9OID0gbmV3IEluamVjdGlvblRva2VuPE1hdEljb25Mb2NhdGlvbj4oJ21hdC1pY29uLWxvY2F0aW9uJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6IE1BVF9JQ09OX0xPQ0FUSU9OX0ZBQ1RPUlksXG59KTtcblxuLyoqXG4gKiBTdHViYmVkIG91dCBsb2NhdGlvbiBmb3IgYE1hdEljb25gLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdEljb25Mb2NhdGlvbiB7XG4gIGdldFBhdGhuYW1lOiAoKSA9PiBzdHJpbmc7XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFUX0lDT05fTE9DQVRJT05fRkFDVE9SWSgpOiBNYXRJY29uTG9jYXRpb24ge1xuICBjb25zdCBfZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQpO1xuICBjb25zdCBfbG9jYXRpb24gPSBfZG9jdW1lbnQgPyBfZG9jdW1lbnQubG9jYXRpb24gOiBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgbmVlZHMgdG8gYmUgYSBmdW5jdGlvbiwgcmF0aGVyIHRoYW4gYSBwcm9wZXJ0eSwgYmVjYXVzZSBBbmd1bGFyXG4gICAgLy8gd2lsbCBvbmx5IHJlc29sdmUgaXQgb25jZSwgYnV0IHdlIHdhbnQgdGhlIGN1cnJlbnQgcGF0aCBvbiBlYWNoIGNhbGwuXG4gICAgZ2V0UGF0aG5hbWU6ICgpID0+IChfbG9jYXRpb24gPyBfbG9jYXRpb24ucGF0aG5hbWUgKyBfbG9jYXRpb24uc2VhcmNoIDogJycpLFxuICB9O1xufVxuXG4vKiogU1ZHIGF0dHJpYnV0ZXMgdGhhdCBhY2NlcHQgYSBGdW5jSVJJIChlLmcuIGB1cmwoPHNvbWV0aGluZz4pYCkuICovXG5jb25zdCBmdW5jSXJpQXR0cmlidXRlcyA9IFtcbiAgJ2NsaXAtcGF0aCcsXG4gICdjb2xvci1wcm9maWxlJyxcbiAgJ3NyYycsXG4gICdjdXJzb3InLFxuICAnZmlsbCcsXG4gICdmaWx0ZXInLFxuICAnbWFya2VyJyxcbiAgJ21hcmtlci1zdGFydCcsXG4gICdtYXJrZXItbWlkJyxcbiAgJ21hcmtlci1lbmQnLFxuICAnbWFzaycsXG4gICdzdHJva2UnLFxuXTtcblxuLyoqIFNlbGVjdG9yIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhbGwgZWxlbWVudHMgdGhhdCBhcmUgdXNpbmcgYSBgRnVuY0lSSWAuICovXG5jb25zdCBmdW5jSXJpQXR0cmlidXRlU2VsZWN0b3IgPSBmdW5jSXJpQXR0cmlidXRlcy5tYXAoYXR0ciA9PiBgWyR7YXR0cn1dYCkuam9pbignLCAnKTtcblxuLyoqIFJlZ2V4IHRoYXQgY2FuIGJlIHVzZWQgdG8gZXh0cmFjdCB0aGUgaWQgb3V0IG9mIGEgRnVuY0lSSS4gKi9cbmNvbnN0IGZ1bmNJcmlQYXR0ZXJuID0gL151cmxcXChbJ1wiXT8jKC4qPylbJ1wiXT9cXCkkLztcblxuLyoqXG4gKiBDb21wb25lbnQgdG8gZGlzcGxheSBhbiBpY29uLiBJdCBjYW4gYmUgdXNlZCBpbiB0aGUgZm9sbG93aW5nIHdheXM6XG4gKlxuICogLSBTcGVjaWZ5IHRoZSBzdmdJY29uIGlucHV0IHRvIGxvYWQgYW4gU1ZHIGljb24gZnJvbSBhIFVSTCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgd2l0aCB0aGVcbiAqICAgYWRkU3ZnSWNvbiwgYWRkU3ZnSWNvbkluTmFtZXNwYWNlLCBhZGRTdmdJY29uU2V0LCBvciBhZGRTdmdJY29uU2V0SW5OYW1lc3BhY2UgbWV0aG9kcyBvZlxuICogICBNYXRJY29uUmVnaXN0cnkuIElmIHRoZSBzdmdJY29uIHZhbHVlIGNvbnRhaW5zIGEgY29sb24gaXQgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGUgZm9ybWF0XG4gKiAgIFwiW25hbWVzcGFjZV06W25hbWVdXCIsIGlmIG5vdCB0aGUgdmFsdWUgd2lsbCBiZSB0aGUgbmFtZSBvZiBhbiBpY29uIGluIHRoZSBkZWZhdWx0IG5hbWVzcGFjZS5cbiAqICAgRXhhbXBsZXM6XG4gKiAgICAgYDxtYXQtaWNvbiBzdmdJY29uPVwibGVmdC1hcnJvd1wiPjwvbWF0LWljb24+XG4gKiAgICAgPG1hdC1pY29uIHN2Z0ljb249XCJhbmltYWxzOmNhdFwiPjwvbWF0LWljb24+YFxuICpcbiAqIC0gVXNlIGEgZm9udCBsaWdhdHVyZSBhcyBhbiBpY29uIGJ5IHB1dHRpbmcgdGhlIGxpZ2F0dXJlIHRleHQgaW4gdGhlIGBmb250SWNvbmAgYXR0cmlidXRlIG9yIHRoZVxuICogICBjb250ZW50IG9mIHRoZSBgPG1hdC1pY29uPmAgY29tcG9uZW50LiBJZiB5b3UgcmVnaXN0ZXIgYSBjdXN0b20gZm9udCBjbGFzcywgZG9uJ3QgZm9yZ2V0IHRvIGFsc29cbiAqICAgaW5jbHVkZSB0aGUgc3BlY2lhbCBjbGFzcyBgbWF0LWxpZ2F0dXJlLWZvbnRgLiBJdCBpcyByZWNvbW1lbmRlZCB0byB1c2UgdGhlIGF0dHJpYnV0ZSBhbHRlcm5hdGl2ZVxuICogICB0byBwcmV2ZW50IHRoZSBsaWdhdHVyZSB0ZXh0IHRvIGJlIHNlbGVjdGFibGUgYW5kIHRvIGFwcGVhciBpbiBzZWFyY2ggZW5naW5lIHJlc3VsdHMuXG4gKiAgIEJ5IGRlZmF1bHQsIHRoZSBNYXRlcmlhbCBpY29ucyBmb250IGlzIHVzZWQgYXMgZGVzY3JpYmVkIGF0XG4gKiAgIGh0dHA6Ly9nb29nbGUuZ2l0aHViLmlvL21hdGVyaWFsLWRlc2lnbi1pY29ucy8jaWNvbi1mb250LWZvci10aGUtd2ViLiBZb3UgY2FuIHNwZWNpZnkgYW5cbiAqICAgYWx0ZXJuYXRlIGZvbnQgYnkgc2V0dGluZyB0aGUgZm9udFNldCBpbnB1dCB0byBlaXRoZXIgdGhlIENTUyBjbGFzcyB0byBhcHBseSB0byB1c2UgdGhlXG4gKiAgIGRlc2lyZWQgZm9udCwgb3IgdG8gYW4gYWxpYXMgcHJldmlvdXNseSByZWdpc3RlcmVkIHdpdGggTWF0SWNvblJlZ2lzdHJ5LnJlZ2lzdGVyRm9udENsYXNzQWxpYXMuXG4gKiAgIEV4YW1wbGVzOlxuICogICAgIGA8bWF0LWljb24gZm9udEljb249XCJob21lXCI+PC9tYXQtaWNvbj5cbiAqICAgICA8bWF0LWljb24+aG9tZTwvbWF0LWljb24+XG4gKiAgICAgPG1hdC1pY29uIGZvbnRTZXQ9XCJteWZvbnRcIiBmb250SWNvbj1cInN1blwiPjwvbWF0LWljb24+XG4gKiAgICAgPG1hdC1pY29uIGZvbnRTZXQ9XCJteWZvbnRcIj5zdW48L21hdC1pY29uPmBcbiAqXG4gKiAtIFNwZWNpZnkgYSBmb250IGdseXBoIHRvIGJlIGluY2x1ZGVkIHZpYSBDU1MgcnVsZXMgYnkgc2V0dGluZyB0aGUgZm9udFNldCBpbnB1dCB0byBzcGVjaWZ5IHRoZVxuICogICBmb250LCBhbmQgdGhlIGZvbnRJY29uIGlucHV0IHRvIHNwZWNpZnkgdGhlIGljb24uIFR5cGljYWxseSB0aGUgZm9udEljb24gd2lsbCBzcGVjaWZ5IGFcbiAqICAgQ1NTIGNsYXNzIHdoaWNoIGNhdXNlcyB0aGUgZ2x5cGggdG8gYmUgZGlzcGxheWVkIHZpYSBhIDpiZWZvcmUgc2VsZWN0b3IsIGFzIGluXG4gKiAgIGh0dHBzOi8vZm9udGF3ZXNvbWUtdjQuZ2l0aHViLmlvL2V4YW1wbGVzL1xuICogICBFeGFtcGxlOlxuICogICAgIGA8bWF0LWljb24gZm9udFNldD1cImZhXCIgZm9udEljb249XCJhbGFybVwiPjwvbWF0LWljb24+YFxuICovXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6ICc8bmctY29udGVudD48L25nLWNvbnRlbnQ+JyxcbiAgc2VsZWN0b3I6ICdtYXQtaWNvbicsXG4gIGV4cG9ydEFzOiAnbWF0SWNvbicsXG4gIHN0eWxlVXJsOiAnaWNvbi5jc3MnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnaW1nJyxcbiAgICAnY2xhc3MnOiAnbWF0LWljb24gbm90cmFuc2xhdGUnLFxuICAgICdbY2xhc3NdJzogJ2NvbG9yID8gXCJtYXQtXCIgKyBjb2xvciA6IFwiXCInLFxuICAgICdbYXR0ci5kYXRhLW1hdC1pY29uLXR5cGVdJzogJ191c2luZ0ZvbnRJY29uKCkgPyBcImZvbnRcIiA6IFwic3ZnXCInLFxuICAgICdbYXR0ci5kYXRhLW1hdC1pY29uLW5hbWVdJzogJ19zdmdOYW1lIHx8IGZvbnRJY29uJyxcbiAgICAnW2F0dHIuZGF0YS1tYXQtaWNvbi1uYW1lc3BhY2VdJzogJ19zdmdOYW1lc3BhY2UgfHwgZm9udFNldCcsXG4gICAgJ1thdHRyLmZvbnRJY29uXSc6ICdfdXNpbmdGb250SWNvbigpID8gZm9udEljb24gOiBudWxsJyxcbiAgICAnW2NsYXNzLm1hdC1pY29uLWlubGluZV0nOiAnaW5saW5lJyxcbiAgICAnW2NsYXNzLm1hdC1pY29uLW5vLWNvbG9yXSc6ICdjb2xvciAhPT0gXCJwcmltYXJ5XCIgJiYgY29sb3IgIT09IFwiYWNjZW50XCIgJiYgY29sb3IgIT09IFwid2FyblwiJyxcbiAgfSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEljb24gaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0NoZWNrZWQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RlZmF1bHRDb2xvcjogVGhlbWVQYWxldHRlO1xuXG4gIC8qKlxuICAgKiBUaGVtZSBjb2xvciBvZiB0aGUgaWNvbi4gVGhpcyBBUEkgaXMgc3VwcG9ydGVkIGluIE0yIHRoZW1lcyBvbmx5LCBpdFxuICAgKiBoYXMgbm8gZWZmZWN0IGluIE0zIHRoZW1lcy5cbiAgICpcbiAgICogRm9yIGluZm9ybWF0aW9uIG9uIGFwcGx5aW5nIGNvbG9yIHZhcmlhbnRzIGluIE0zLCBzZWVcbiAgICogaHR0cHM6Ly9tYXRlcmlhbC5hbmd1bGFyLmlvL2d1aWRlL3RoZW1pbmcjdXNpbmctY29tcG9uZW50LWNvbG9yLXZhcmlhbnRzLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IGNvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9jb2xvciB8fCB0aGlzLl9kZWZhdWx0Q29sb3I7XG4gIH1cbiAgc2V0IGNvbG9yKHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fY29sb3IgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9jb2xvcjogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgaWNvbiBzaG91bGQgYmUgaW5saW5lZCwgYXV0b21hdGljYWxseSBzaXppbmcgdGhlIGljb24gdG8gbWF0Y2ggdGhlIGZvbnQgc2l6ZSBvZlxuICAgKiB0aGUgZWxlbWVudCB0aGUgaWNvbiBpcyBjb250YWluZWQgaW4uXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGlubGluZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBOYW1lIG9mIHRoZSBpY29uIGluIHRoZSBTVkcgaWNvbiBzZXQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBzdmdJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N2Z0ljb247XG4gIH1cbiAgc2V0IHN2Z0ljb24odmFsdWU6IHN0cmluZykge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fc3ZnSWNvbikge1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN2Z0ljb24odmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9zdmdJY29uKSB7XG4gICAgICAgIHRoaXMuX2NsZWFyU3ZnRWxlbWVudCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3ZnSWNvbiA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9zdmdJY29uOiBzdHJpbmc7XG5cbiAgLyoqIEZvbnQgc2V0IHRoYXQgdGhlIGljb24gaXMgYSBwYXJ0IG9mLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZm9udFNldCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9mb250U2V0O1xuICB9XG4gIHNldCBmb250U2V0KHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMuX2NsZWFudXBGb250VmFsdWUodmFsdWUpO1xuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB0aGlzLl9mb250U2V0KSB7XG4gICAgICB0aGlzLl9mb250U2V0ID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLl91cGRhdGVGb250SWNvbkNsYXNzZXMoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZm9udFNldDogc3RyaW5nO1xuXG4gIC8qKiBOYW1lIG9mIGFuIGljb24gd2l0aGluIGEgZm9udCBzZXQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBmb250SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9mb250SWNvbjtcbiAgfVxuICBzZXQgZm9udEljb24odmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5fY2xlYW51cEZvbnRWYWx1ZSh2YWx1ZSk7XG5cbiAgICBpZiAobmV3VmFsdWUgIT09IHRoaXMuX2ZvbnRJY29uKSB7XG4gICAgICB0aGlzLl9mb250SWNvbiA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5fdXBkYXRlRm9udEljb25DbGFzc2VzKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2ZvbnRJY29uOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfcHJldmlvdXNGb250U2V0Q2xhc3M6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgX3ByZXZpb3VzRm9udEljb25DbGFzczogc3RyaW5nO1xuXG4gIF9zdmdOYW1lOiBzdHJpbmcgfCBudWxsO1xuICBfc3ZnTmFtZXNwYWNlOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudCBwYWdlIHBhdGguICovXG4gIHByaXZhdGUgX3ByZXZpb3VzUGF0aD86IHN0cmluZztcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzIHRoYXQgd2UndmUgcHJlZml4ZWQgd2l0aCB0aGUgY3VycmVudCBwYXRoLiAqL1xuICBwcml2YXRlIF9lbGVtZW50c1dpdGhFeHRlcm5hbFJlZmVyZW5jZXM/OiBNYXA8RWxlbWVudCwge25hbWU6IHN0cmluZzsgdmFsdWU6IHN0cmluZ31bXT47XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0aGUgY3VycmVudCBpbi1wcm9ncmVzcyBTVkcgaWNvbiByZXF1ZXN0LiAqL1xuICBwcml2YXRlIF9jdXJyZW50SWNvbkZldGNoID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9pY29uUmVnaXN0cnk6IE1hdEljb25SZWdpc3RyeSxcbiAgICBAQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpIGFyaWFIaWRkZW46IHN0cmluZyxcbiAgICBASW5qZWN0KE1BVF9JQ09OX0xPQ0FUSU9OKSBwcml2YXRlIF9sb2NhdGlvbjogTWF0SWNvbkxvY2F0aW9uLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Vycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChNQVRfSUNPTl9ERUZBVUxUX09QVElPTlMpXG4gICAgZGVmYXVsdHM/OiBNYXRJY29uRGVmYXVsdE9wdGlvbnMsXG4gICkge1xuICAgIGlmIChkZWZhdWx0cykge1xuICAgICAgaWYgKGRlZmF1bHRzLmNvbG9yKSB7XG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLl9kZWZhdWx0Q29sb3IgPSBkZWZhdWx0cy5jb2xvcjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlZmF1bHRzLmZvbnRTZXQpIHtcbiAgICAgICAgdGhpcy5mb250U2V0ID0gZGVmYXVsdHMuZm9udFNldDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdXNlciBoYXMgbm90IGV4cGxpY2l0bHkgc2V0IGFyaWEtaGlkZGVuLCBtYXJrIHRoZSBpY29uIGFzIGhpZGRlbiwgYXMgdGhpcyBpc1xuICAgIC8vIHRoZSByaWdodCB0aGluZyB0byBkbyBmb3IgdGhlIG1ham9yaXR5IG9mIGljb24gdXNlLWNhc2VzLlxuICAgIGlmICghYXJpYUhpZGRlbikge1xuICAgICAgX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3BsaXRzIGFuIHN2Z0ljb24gYmluZGluZyB2YWx1ZSBpbnRvIGl0cyBpY29uIHNldCBhbmQgaWNvbiBuYW1lIGNvbXBvbmVudHMuXG4gICAqIFJldHVybnMgYSAyLWVsZW1lbnQgYXJyYXkgb2YgWyhpY29uIHNldCksIChpY29uIG5hbWUpXS5cbiAgICogVGhlIHNlcGFyYXRvciBmb3IgdGhlIHR3byBmaWVsZHMgaXMgJzonLiBJZiB0aGVyZSBpcyBubyBzZXBhcmF0b3IsIGFuIGVtcHR5XG4gICAqIHN0cmluZyBpcyByZXR1cm5lZCBmb3IgdGhlIGljb24gc2V0IGFuZCB0aGUgZW50aXJlIHZhbHVlIGlzIHJldHVybmVkIGZvclxuICAgKiB0aGUgaWNvbiBuYW1lLiBJZiB0aGUgYXJndW1lbnQgaXMgZmFsc3ksIHJldHVybnMgYW4gYXJyYXkgb2YgdHdvIGVtcHR5IHN0cmluZ3MuXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgbmFtZSBjb250YWlucyB0d28gb3IgbW9yZSAnOicgc2VwYXJhdG9ycy5cbiAgICogRXhhbXBsZXM6XG4gICAqICAgYCdzb2NpYWw6Y2FrZScgLT4gWydzb2NpYWwnLCAnY2FrZSddXG4gICAqICAgJ3Blbmd1aW4nIC0+IFsnJywgJ3Blbmd1aW4nXVxuICAgKiAgIG51bGwgLT4gWycnLCAnJ11cbiAgICogICAnYTpiOmMnIC0+ICh0aHJvd3MgRXJyb3IpYFxuICAgKi9cbiAgcHJpdmF0ZSBfc3BsaXRJY29uTmFtZShpY29uTmFtZTogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gICAgaWYgKCFpY29uTmFtZSkge1xuICAgICAgcmV0dXJuIFsnJywgJyddO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0cyA9IGljb25OYW1lLnNwbGl0KCc6Jyk7XG4gICAgc3dpdGNoIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIFsnJywgcGFydHNbMF1dOyAvLyBVc2UgZGVmYXVsdCBuYW1lc3BhY2UuXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiA8W3N0cmluZywgc3RyaW5nXT5wYXJ0cztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGljb24gbmFtZTogXCIke2ljb25OYW1lfVwiYCk7IC8vIFRPRE86IGFkZCBhbiBuZ0Rldk1vZGUgY2hlY2tcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBVcGRhdGUgZm9udCBjbGFzc2VzIGJlY2F1c2UgbmdPbkNoYW5nZXMgd29uJ3QgYmUgY2FsbGVkIGlmIG5vbmUgb2YgdGhlIGlucHV0cyBhcmUgcHJlc2VudCxcbiAgICAvLyBlLmcuIDxtYXQtaWNvbj5hcnJvdzwvbWF0LWljb24+IEluIHRoaXMgY2FzZSB3ZSBuZWVkIHRvIGFkZCBhIENTUyBjbGFzcyBmb3IgdGhlIGRlZmF1bHQgZm9udC5cbiAgICB0aGlzLl91cGRhdGVGb250SWNvbkNsYXNzZXMoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpIHtcbiAgICBjb25zdCBjYWNoZWRFbGVtZW50cyA9IHRoaXMuX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcztcblxuICAgIGlmIChjYWNoZWRFbGVtZW50cyAmJiBjYWNoZWRFbGVtZW50cy5zaXplKSB7XG4gICAgICBjb25zdCBuZXdQYXRoID0gdGhpcy5fbG9jYXRpb24uZ2V0UGF0aG5hbWUoKTtcblxuICAgICAgLy8gV2UgbmVlZCB0byBjaGVjayB3aGV0aGVyIHRoZSBVUkwgaGFzIGNoYW5nZWQgb24gZWFjaCBjaGFuZ2UgZGV0ZWN0aW9uIHNpbmNlXG4gICAgICAvLyB0aGUgYnJvd3NlciBkb2Vzbid0IGhhdmUgYW4gQVBJIHRoYXQgd2lsbCBsZXQgdXMgcmVhY3Qgb24gbGluayBjbGlja3MgYW5kXG4gICAgICAvLyB3ZSBjYW4ndCBkZXBlbmQgb24gdGhlIEFuZ3VsYXIgcm91dGVyLiBUaGUgcmVmZXJlbmNlcyBuZWVkIHRvIGJlIHVwZGF0ZWQsXG4gICAgICAvLyBiZWNhdXNlIHdoaWxlIG1vc3QgYnJvd3NlcnMgZG9uJ3QgY2FyZSB3aGV0aGVyIHRoZSBVUkwgaXMgY29ycmVjdCBhZnRlclxuICAgICAgLy8gdGhlIGZpcnN0IHJlbmRlciwgU2FmYXJpIHdpbGwgYnJlYWsgaWYgdGhlIHVzZXIgbmF2aWdhdGVzIHRvIGEgZGlmZmVyZW50XG4gICAgICAvLyBwYWdlIGFuZCB0aGUgU1ZHIGlzbid0IHJlLXJlbmRlcmVkLlxuICAgICAgaWYgKG5ld1BhdGggIT09IHRoaXMuX3ByZXZpb3VzUGF0aCkge1xuICAgICAgICB0aGlzLl9wcmV2aW91c1BhdGggPSBuZXdQYXRoO1xuICAgICAgICB0aGlzLl9wcmVwZW5kUGF0aFRvUmVmZXJlbmNlcyhuZXdQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9jdXJyZW50SWNvbkZldGNoLnVuc3Vic2NyaWJlKCk7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNXaXRoRXh0ZXJuYWxSZWZlcmVuY2VzKSB7XG4gICAgICB0aGlzLl9lbGVtZW50c1dpdGhFeHRlcm5hbFJlZmVyZW5jZXMuY2xlYXIoKTtcbiAgICB9XG4gIH1cblxuICBfdXNpbmdGb250SWNvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuc3ZnSWNvbjtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFN2Z0VsZW1lbnQoc3ZnOiBTVkdFbGVtZW50KSB7XG4gICAgdGhpcy5fY2xlYXJTdmdFbGVtZW50KCk7XG5cbiAgICAvLyBOb3RlOiB3ZSBkbyB0aGlzIGZpeCBoZXJlLCByYXRoZXIgdGhhbiB0aGUgaWNvbiByZWdpc3RyeSwgYmVjYXVzZSB0aGVcbiAgICAvLyByZWZlcmVuY2VzIGhhdmUgdG8gcG9pbnQgdG8gdGhlIFVSTCBhdCB0aGUgdGltZSB0aGF0IHRoZSBpY29uIHdhcyBjcmVhdGVkLlxuICAgIGNvbnN0IHBhdGggPSB0aGlzLl9sb2NhdGlvbi5nZXRQYXRobmFtZSgpO1xuICAgIHRoaXMuX3ByZXZpb3VzUGF0aCA9IHBhdGg7XG4gICAgdGhpcy5fY2FjaGVDaGlsZHJlbldpdGhFeHRlcm5hbFJlZmVyZW5jZXMoc3ZnKTtcbiAgICB0aGlzLl9wcmVwZW5kUGF0aFRvUmVmZXJlbmNlcyhwYXRoKTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyU3ZnRWxlbWVudCgpIHtcbiAgICBjb25zdCBsYXlvdXRFbGVtZW50OiBIVE1MRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBsZXQgY2hpbGRDb3VudCA9IGxheW91dEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGg7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNXaXRoRXh0ZXJuYWxSZWZlcmVuY2VzKSB7XG4gICAgICB0aGlzLl9lbGVtZW50c1dpdGhFeHRlcm5hbFJlZmVyZW5jZXMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZXhpc3Rpbmcgbm9uLWVsZW1lbnQgY2hpbGQgbm9kZXMgYW5kIFNWR3MsIGFuZCBhZGQgdGhlIG5ldyBTVkcgZWxlbWVudC4gTm90ZSB0aGF0XG4gICAgLy8gd2UgY2FuJ3QgdXNlIGlubmVySFRNTCwgYmVjYXVzZSBJRSB3aWxsIHRocm93IGlmIHRoZSBlbGVtZW50IGhhcyBhIGRhdGEgYmluZGluZy5cbiAgICB3aGlsZSAoY2hpbGRDb3VudC0tKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGxheW91dEVsZW1lbnQuY2hpbGROb2Rlc1tjaGlsZENvdW50XTtcblxuICAgICAgLy8gMSBjb3JyZXNwb25kcyB0byBOb2RlLkVMRU1FTlRfTk9ERS4gV2UgcmVtb3ZlIGFsbCBub24tZWxlbWVudCBub2RlcyBpbiBvcmRlciB0byBnZXQgcmlkXG4gICAgICAvLyBvZiBhbnkgbG9vc2UgdGV4dCBub2RlcywgYXMgd2VsbCBhcyBhbnkgU1ZHIGVsZW1lbnRzIGluIG9yZGVyIHRvIHJlbW92ZSBhbnkgb2xkIGljb25zLlxuICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlICE9PSAxIHx8IGNoaWxkLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzdmcnKSB7XG4gICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUZvbnRJY29uQ2xhc3NlcygpIHtcbiAgICBpZiAoIXRoaXMuX3VzaW5nRm9udEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW06IEhUTUxFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGZvbnRTZXRDbGFzc2VzID0gKFxuICAgICAgdGhpcy5mb250U2V0XG4gICAgICAgID8gdGhpcy5faWNvblJlZ2lzdHJ5LmNsYXNzTmFtZUZvckZvbnRBbGlhcyh0aGlzLmZvbnRTZXQpLnNwbGl0KC8gKy8pXG4gICAgICAgIDogdGhpcy5faWNvblJlZ2lzdHJ5LmdldERlZmF1bHRGb250U2V0Q2xhc3MoKVxuICAgICkuZmlsdGVyKGNsYXNzTmFtZSA9PiBjbGFzc05hbWUubGVuZ3RoID4gMCk7XG5cbiAgICB0aGlzLl9wcmV2aW91c0ZvbnRTZXRDbGFzcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKSk7XG4gICAgZm9udFNldENsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gZWxlbS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSkpO1xuICAgIHRoaXMuX3ByZXZpb3VzRm9udFNldENsYXNzID0gZm9udFNldENsYXNzZXM7XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmZvbnRJY29uICE9PSB0aGlzLl9wcmV2aW91c0ZvbnRJY29uQ2xhc3MgJiZcbiAgICAgICFmb250U2V0Q2xhc3Nlcy5pbmNsdWRlcygnbWF0LWxpZ2F0dXJlLWZvbnQnKVxuICAgICkge1xuICAgICAgaWYgKHRoaXMuX3ByZXZpb3VzRm9udEljb25DbGFzcykge1xuICAgICAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fcHJldmlvdXNGb250SWNvbkNsYXNzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmZvbnRJY29uKSB7XG4gICAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZCh0aGlzLmZvbnRJY29uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3ByZXZpb3VzRm9udEljb25DbGFzcyA9IHRoaXMuZm9udEljb247XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyB1cCBhIHZhbHVlIHRvIGJlIHVzZWQgYXMgYSBmb250SWNvbiBvciBmb250U2V0LlxuICAgKiBTaW5jZSB0aGUgdmFsdWUgZW5kcyB1cCBiZWluZyBhc3NpZ25lZCBhcyBhIENTUyBjbGFzcywgd2VcbiAgICogaGF2ZSB0byB0cmltIHRoZSB2YWx1ZSBhbmQgb21pdCBzcGFjZS1zZXBhcmF0ZWQgdmFsdWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2xlYW51cEZvbnRWYWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkuc3BsaXQoJyAnKVswXSA6IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmRzIHRoZSBjdXJyZW50IHBhdGggdG8gYWxsIGVsZW1lbnRzIHRoYXQgaGF2ZSBhbiBhdHRyaWJ1dGUgcG9pbnRpbmcgdG8gYSBgRnVuY0lSSWBcbiAgICogcmVmZXJlbmNlLiBUaGlzIGlzIHJlcXVpcmVkIGJlY2F1c2UgV2ViS2l0IGJyb3dzZXJzIHJlcXVpcmUgcmVmZXJlbmNlcyB0byBiZSBwcmVmaXhlZCB3aXRoXG4gICAqIHRoZSBjdXJyZW50IHBhdGgsIGlmIHRoZSBwYWdlIGhhcyBhIGBiYXNlYCB0YWcuXG4gICAqL1xuICBwcml2YXRlIF9wcmVwZW5kUGF0aFRvUmVmZXJlbmNlcyhwYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcztcblxuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgZWxlbWVudHMuZm9yRWFjaCgoYXR0cnMsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGB1cmwoJyR7cGF0aH0jJHthdHRyLnZhbHVlfScpYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhY2hlcyB0aGUgY2hpbGRyZW4gb2YgYW4gU1ZHIGVsZW1lbnQgdGhhdCBoYXZlIGB1cmwoKWBcbiAgICogcmVmZXJlbmNlcyB0aGF0IHdlIG5lZWQgdG8gcHJlZml4IHdpdGggdGhlIGN1cnJlbnQgcGF0aC5cbiAgICovXG4gIHByaXZhdGUgX2NhY2hlQ2hpbGRyZW5XaXRoRXh0ZXJuYWxSZWZlcmVuY2VzKGVsZW1lbnQ6IFNWR0VsZW1lbnQpIHtcbiAgICBjb25zdCBlbGVtZW50c1dpdGhGdW5jSXJpID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGZ1bmNJcmlBdHRyaWJ1dGVTZWxlY3Rvcik7XG4gICAgY29uc3QgZWxlbWVudHMgPSAodGhpcy5fZWxlbWVudHNXaXRoRXh0ZXJuYWxSZWZlcmVuY2VzID1cbiAgICAgIHRoaXMuX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcyB8fCBuZXcgTWFwKCkpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50c1dpdGhGdW5jSXJpLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmdW5jSXJpQXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50V2l0aFJlZmVyZW5jZSA9IGVsZW1lbnRzV2l0aEZ1bmNJcmlbaV07XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZWxlbWVudFdpdGhSZWZlcmVuY2UuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHZhbHVlID8gdmFsdWUubWF0Y2goZnVuY0lyaVBhdHRlcm4pIDogbnVsbDtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBsZXQgYXR0cmlidXRlcyA9IGVsZW1lbnRzLmdldChlbGVtZW50V2l0aFJlZmVyZW5jZSk7XG5cbiAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBbXTtcbiAgICAgICAgICAgIGVsZW1lbnRzLnNldChlbGVtZW50V2l0aFJlZmVyZW5jZSwgYXR0cmlidXRlcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXR0cmlidXRlcyEucHVzaCh7bmFtZTogYXR0ciwgdmFsdWU6IG1hdGNoWzFdfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIGEgbmV3IFNWRyBpY29uIHdpdGggYSBwYXJ0aWN1bGFyIG5hbWUuICovXG4gIHByaXZhdGUgX3VwZGF0ZVN2Z0ljb24ocmF3TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fc3ZnTmFtZXNwYWNlID0gbnVsbDtcbiAgICB0aGlzLl9zdmdOYW1lID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50SWNvbkZldGNoLnVuc3Vic2NyaWJlKCk7XG5cbiAgICBpZiAocmF3TmFtZSkge1xuICAgICAgY29uc3QgW25hbWVzcGFjZSwgaWNvbk5hbWVdID0gdGhpcy5fc3BsaXRJY29uTmFtZShyYXdOYW1lKTtcblxuICAgICAgaWYgKG5hbWVzcGFjZSkge1xuICAgICAgICB0aGlzLl9zdmdOYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChpY29uTmFtZSkge1xuICAgICAgICB0aGlzLl9zdmdOYW1lID0gaWNvbk5hbWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRJY29uRmV0Y2ggPSB0aGlzLl9pY29uUmVnaXN0cnlcbiAgICAgICAgLmdldE5hbWVkU3ZnSWNvbihpY29uTmFtZSwgbmFtZXNwYWNlKVxuICAgICAgICAucGlwZSh0YWtlKDEpKVxuICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgIHN2ZyA9PiB0aGlzLl9zZXRTdmdFbGVtZW50KHN2ZyksXG4gICAgICAgICAgKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFcnJvciByZXRyaWV2aW5nIGljb24gJHtuYW1lc3BhY2V9OiR7aWNvbk5hbWV9ISAke2Vyci5tZXNzYWdlfWA7XG4gICAgICAgICAgICB0aGlzLl9lcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IobmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=