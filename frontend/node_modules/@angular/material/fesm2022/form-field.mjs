import * as i0 from '@angular/core';
import { Directive, InjectionToken, Attribute, Input, inject, NgZone, Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, contentChild, Injector, computed, afterRender, ANIMATION_MODULE_TYPE, Optional, Inject, ContentChild, ContentChildren, NgModule } from '@angular/core';
import * as i1 from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as i2 from '@angular/cdk/platform';
import { DOCUMENT, NgTemplateOutlet, CommonModule } from '@angular/common';
import { Subscription, Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ObserversModule } from '@angular/cdk/observers';
import { MatCommonModule } from '@angular/material/core';

/** The floating label for a `mat-form-field`. */
class MatLabel {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLabel, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatLabel, isStandalone: true, selector: "mat-label", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-label',
                    standalone: true,
                }]
        }] });

let nextUniqueId$2 = 0;
/**
 * Injection token that can be used to reference instances of `MatError`. It serves as
 * alternative token to the actual `MatError` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const MAT_ERROR = new InjectionToken('MatError');
/** Single error message to be shown underneath the form-field. */
class MatError {
    constructor(ariaLive, elementRef) {
        this.id = `mat-mdc-error-${nextUniqueId$2++}`;
        // If no aria-live value is set add 'polite' as a default. This is preferred over setting
        // role='alert' so that screen readers do not interrupt the current task to read this aloud.
        if (!ariaLive) {
            elementRef.nativeElement.setAttribute('aria-live', 'polite');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatError, deps: [{ token: 'aria-live', attribute: true }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatError, isStandalone: true, selector: "mat-error, [matError]", inputs: { id: "id" }, host: { attributes: { "aria-atomic": "true" }, properties: { "id": "id" }, classAttribute: "mat-mdc-form-field-error mat-mdc-form-field-bottom-align" }, providers: [{ provide: MAT_ERROR, useExisting: MatError }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatError, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-error, [matError]',
                    host: {
                        'class': 'mat-mdc-form-field-error mat-mdc-form-field-bottom-align',
                        'aria-atomic': 'true',
                        '[id]': 'id',
                    },
                    providers: [{ provide: MAT_ERROR, useExisting: MatError }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['aria-live']
                }] }, { type: i0.ElementRef }], propDecorators: { id: [{
                type: Input
            }] } });

let nextUniqueId$1 = 0;
/** Hint text to be shown underneath the form field control. */
class MatHint {
    constructor() {
        /** Whether to align the hint label at the start or end of the line. */
        this.align = 'start';
        /** Unique ID for the hint. Used for the aria-describedby on the form field control. */
        this.id = `mat-mdc-hint-${nextUniqueId$1++}`;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatHint, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatHint, isStandalone: true, selector: "mat-hint", inputs: { align: "align", id: "id" }, host: { properties: { "class.mat-mdc-form-field-hint-end": "align === \"end\"", "id": "id", "attr.align": "null" }, classAttribute: "mat-mdc-form-field-hint mat-mdc-form-field-bottom-align" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatHint, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-hint',
                    host: {
                        'class': 'mat-mdc-form-field-hint mat-mdc-form-field-bottom-align',
                        '[class.mat-mdc-form-field-hint-end]': 'align === "end"',
                        '[id]': 'id',
                        // Remove align attribute to prevent it from interfering with layout.
                        '[attr.align]': 'null',
                    },
                    standalone: true,
                }]
        }], propDecorators: { align: [{
                type: Input
            }], id: [{
                type: Input
            }] } });

/**
 * Injection token that can be used to reference instances of `MatPrefix`. It serves as
 * alternative token to the actual `MatPrefix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const MAT_PREFIX = new InjectionToken('MatPrefix');
/** Prefix to be placed in front of the form field. */
class MatPrefix {
    constructor() {
        this._isText = false;
    }
    set _isTextSelector(value) {
        this._isText = true;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPrefix, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatPrefix, isStandalone: true, selector: "[matPrefix], [matIconPrefix], [matTextPrefix]", inputs: { _isTextSelector: ["matTextPrefix", "_isTextSelector"] }, providers: [{ provide: MAT_PREFIX, useExisting: MatPrefix }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatPrefix, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matPrefix], [matIconPrefix], [matTextPrefix]',
                    providers: [{ provide: MAT_PREFIX, useExisting: MatPrefix }],
                    standalone: true,
                }]
        }], propDecorators: { _isTextSelector: [{
                type: Input,
                args: ['matTextPrefix']
            }] } });

/**
 * Injection token that can be used to reference instances of `MatSuffix`. It serves as
 * alternative token to the actual `MatSuffix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
const MAT_SUFFIX = new InjectionToken('MatSuffix');
/** Suffix to be placed at the end of the form field. */
class MatSuffix {
    constructor() {
        this._isText = false;
    }
    set _isTextSelector(value) {
        this._isText = true;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSuffix, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatSuffix, isStandalone: true, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: { _isTextSelector: ["matTextSuffix", "_isTextSelector"] }, providers: [{ provide: MAT_SUFFIX, useExisting: MatSuffix }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSuffix, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matSuffix], [matIconSuffix], [matTextSuffix]',
                    providers: [{ provide: MAT_SUFFIX, useExisting: MatSuffix }],
                    standalone: true,
                }]
        }], propDecorators: { _isTextSelector: [{
                type: Input,
                args: ['matTextSuffix']
            }] } });

/** An injion token for the parent form-field. */
const FLOATING_LABEL_PARENT = new InjectionToken('FloatingLabelParent');
/**
 * Internal directive that maintains a MDC floating label. This directive does not
 * use the `MDCFloatingLabelFoundation` class, as it is not worth the size cost of
 * including it just to measure the label width and toggle some classes.
 *
 * The use of a directive allows us to conditionally render a floating label in the
 * template without having to manually manage instantiation and destruction of the
 * floating label component based on.
 *
 * The component is responsible for setting up the floating label styles, measuring label
 * width for the outline notch, and providing inputs that can be used to toggle the
 * label's floating or required state.
 */
class MatFormFieldFloatingLabel {
    /** Whether the label is floating. */
    get floating() {
        return this._floating;
    }
    set floating(value) {
        this._floating = value;
        if (this.monitorResize) {
            this._handleResize();
        }
    }
    /** Whether to monitor for resize events on the floating label. */
    get monitorResize() {
        return this._monitorResize;
    }
    set monitorResize(value) {
        this._monitorResize = value;
        if (this._monitorResize) {
            this._subscribeToResize();
        }
        else {
            this._resizeSubscription.unsubscribe();
        }
    }
    constructor(_elementRef) {
        this._elementRef = _elementRef;
        this._floating = false;
        this._monitorResize = false;
        /** The shared ResizeObserver. */
        this._resizeObserver = inject(SharedResizeObserver);
        /** The Angular zone. */
        this._ngZone = inject(NgZone);
        /** The parent form-field. */
        this._parent = inject(FLOATING_LABEL_PARENT);
        /** The current resize event subscription. */
        this._resizeSubscription = new Subscription();
    }
    ngOnDestroy() {
        this._resizeSubscription.unsubscribe();
    }
    /** Gets the width of the label. Used for the outline notch. */
    getWidth() {
        return estimateScrollWidth(this._elementRef.nativeElement);
    }
    /** Gets the HTML element for the floating label. */
    get element() {
        return this._elementRef.nativeElement;
    }
    /** Handles resize events from the ResizeObserver. */
    _handleResize() {
        // In the case where the label grows in size, the following sequence of events occurs:
        // 1. The label grows by 1px triggering the ResizeObserver
        // 2. The notch is expanded to accommodate the entire label
        // 3. The label expands to its full width, triggering the ResizeObserver again
        //
        // This is expected, but If we allow this to all happen within the same macro task it causes an
        // error: `ResizeObserver loop limit exceeded`. Therefore we push the notch resize out until
        // the next macro task.
        setTimeout(() => this._parent._handleLabelResized());
    }
    /** Subscribes to resize events. */
    _subscribeToResize() {
        this._resizeSubscription.unsubscribe();
        this._ngZone.runOutsideAngular(() => {
            this._resizeSubscription = this._resizeObserver
                .observe(this._elementRef.nativeElement, { box: 'border-box' })
                .subscribe(() => this._handleResize());
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldFloatingLabel, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldFloatingLabel, isStandalone: true, selector: "label[matFormFieldFloatingLabel]", inputs: { floating: "floating", monitorResize: "monitorResize" }, host: { properties: { "class.mdc-floating-label--float-above": "floating" }, classAttribute: "mdc-floating-label mat-mdc-floating-label" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldFloatingLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: 'label[matFormFieldFloatingLabel]',
                    host: {
                        'class': 'mdc-floating-label mat-mdc-floating-label',
                        '[class.mdc-floating-label--float-above]': 'floating',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { floating: [{
                type: Input
            }], monitorResize: [{
                type: Input
            }] } });
/**
 * Estimates the scroll width of an element.
 * via https://github.com/material-components/material-components-web/blob/c0a11ef0d000a098fd0c372be8f12d6a99302855/packages/mdc-dom/ponyfill.ts
 */
function estimateScrollWidth(element) {
    // Check the offsetParent. If the element inherits display: none from any
    // parent, the offsetParent property will be null (see
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent).
    // This check ensures we only clone the node when necessary.
    const htmlEl = element;
    if (htmlEl.offsetParent !== null) {
        return htmlEl.scrollWidth;
    }
    const clone = htmlEl.cloneNode(true);
    clone.style.setProperty('position', 'absolute');
    clone.style.setProperty('transform', 'translate(-9999px, -9999px)');
    document.documentElement.appendChild(clone);
    const scrollWidth = clone.scrollWidth;
    clone.remove();
    return scrollWidth;
}

/** Class added when the line ripple is active. */
const ACTIVATE_CLASS = 'mdc-line-ripple--active';
/** Class added when the line ripple is being deactivated. */
const DEACTIVATING_CLASS = 'mdc-line-ripple--deactivating';
/**
 * Internal directive that creates an instance of the MDC line-ripple component. Using a
 * directive allows us to conditionally render a line-ripple in the template without having
 * to manually create and destroy the `MDCLineRipple` component whenever the condition changes.
 *
 * The directive sets up the styles for the line-ripple and provides an API for activating
 * and deactivating the line-ripple.
 */
class MatFormFieldLineRipple {
    constructor(_elementRef, ngZone) {
        this._elementRef = _elementRef;
        this._handleTransitionEnd = (event) => {
            const classList = this._elementRef.nativeElement.classList;
            const isDeactivating = classList.contains(DEACTIVATING_CLASS);
            if (event.propertyName === 'opacity' && isDeactivating) {
                classList.remove(ACTIVATE_CLASS, DEACTIVATING_CLASS);
            }
        };
        ngZone.runOutsideAngular(() => {
            _elementRef.nativeElement.addEventListener('transitionend', this._handleTransitionEnd);
        });
    }
    activate() {
        const classList = this._elementRef.nativeElement.classList;
        classList.remove(DEACTIVATING_CLASS);
        classList.add(ACTIVATE_CLASS);
    }
    deactivate() {
        this._elementRef.nativeElement.classList.add(DEACTIVATING_CLASS);
    }
    ngOnDestroy() {
        this._elementRef.nativeElement.removeEventListener('transitionend', this._handleTransitionEnd);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldLineRipple, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldLineRipple, isStandalone: true, selector: "div[matFormFieldLineRipple]", host: { classAttribute: "mdc-line-ripple" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldLineRipple, decorators: [{
            type: Directive,
            args: [{
                    selector: 'div[matFormFieldLineRipple]',
                    host: {
                        'class': 'mdc-line-ripple',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }] });

/**
 * Internal component that creates an instance of the MDC notched-outline component.
 *
 * The component sets up the HTML structure and styles for the notched-outline. It provides
 * inputs to toggle the notch state and width.
 */
class MatFormFieldNotchedOutline {
    constructor(_elementRef, _ngZone) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        /** Whether the notch should be opened. */
        this.open = false;
    }
    ngAfterViewInit() {
        const label = this._elementRef.nativeElement.querySelector('.mdc-floating-label');
        if (label) {
            this._elementRef.nativeElement.classList.add('mdc-notched-outline--upgraded');
            if (typeof requestAnimationFrame === 'function') {
                label.style.transitionDuration = '0s';
                this._ngZone.runOutsideAngular(() => {
                    requestAnimationFrame(() => (label.style.transitionDuration = ''));
                });
            }
        }
        else {
            this._elementRef.nativeElement.classList.add('mdc-notched-outline--no-label');
        }
    }
    _setNotchWidth(labelWidth) {
        if (!this.open || !labelWidth) {
            this._notch.nativeElement.style.width = '';
        }
        else {
            const NOTCH_ELEMENT_PADDING = 8;
            const NOTCH_ELEMENT_BORDER = 1;
            this._notch.nativeElement.style.width = `calc(${labelWidth}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + ${NOTCH_ELEMENT_PADDING + NOTCH_ELEMENT_BORDER}px)`;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldNotchedOutline, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldNotchedOutline, isStandalone: true, selector: "div[matFormFieldNotchedOutline]", inputs: { open: ["matFormFieldNotchedOutlineOpen", "open"] }, host: { properties: { "class.mdc-notched-outline--notched": "open" }, classAttribute: "mdc-notched-outline" }, viewQueries: [{ propertyName: "_notch", first: true, predicate: ["notch"], descendants: true }], ngImport: i0, template: "<div class=\"mat-mdc-notch-piece mdc-notched-outline__leading\"></div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__notch\" #notch>\n  <ng-content></ng-content>\n</div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__trailing\"></div>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldNotchedOutline, decorators: [{
            type: Component,
            args: [{ selector: 'div[matFormFieldNotchedOutline]', host: {
                        'class': 'mdc-notched-outline',
                        // Besides updating the notch state through the MDC component, we toggle this class through
                        // a host binding in order to ensure that the notched-outline renders correctly on the server.
                        '[class.mdc-notched-outline--notched]': 'open',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, standalone: true, template: "<div class=\"mat-mdc-notch-piece mdc-notched-outline__leading\"></div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__notch\" #notch>\n  <ng-content></ng-content>\n</div>\n<div class=\"mat-mdc-notch-piece mdc-notched-outline__trailing\"></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { open: [{
                type: Input,
                args: ['matFormFieldNotchedOutlineOpen']
            }], _notch: [{
                type: ViewChild,
                args: ['notch']
            }] } });

/**
 * Animations used by the MatFormField.
 * @docs-private
 */
const matFormFieldAnimations = {
    /** Animation that transitions the form field's error and hint messages. */
    transitionMessages: trigger('transitionMessages', [
        // TODO(mmalerba): Use angular animations for label animation as well.
        state('enter', style({ opacity: 1, transform: 'translateY(0%)' })),
        transition('void => enter', [
            style({ opacity: 0, transform: 'translateY(-5px)' }),
            animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
        ]),
    ]),
};

/** An interface which allows a control to work inside of a `MatFormField`. */
class MatFormFieldControl {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldControl, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatFormFieldControl, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldControl, decorators: [{
            type: Directive
        }] });

/** @docs-private */
function getMatFormFieldPlaceholderConflictError() {
    return Error('Placeholder attribute and child element were both specified.');
}
/** @docs-private */
function getMatFormFieldDuplicatedHintError(align) {
    return Error(`A hint was already declared for 'align="${align}"'.`);
}
/** @docs-private */
function getMatFormFieldMissingControlError() {
    return Error('mat-form-field must contain a MatFormFieldControl.');
}

/**
 * Injection token that can be used to inject an instances of `MatFormField`. It serves
 * as alternative token to the actual `MatFormField` class which would cause unnecessary
 * retention of the `MatFormField` class and its component metadata.
 */
const MAT_FORM_FIELD = new InjectionToken('MatFormField');
/**
 * Injection token that can be used to configure the
 * default options for all form field within an app.
 */
const MAT_FORM_FIELD_DEFAULT_OPTIONS = new InjectionToken('MAT_FORM_FIELD_DEFAULT_OPTIONS');
let nextUniqueId = 0;
/** Default appearance used by the form field. */
const DEFAULT_APPEARANCE = 'fill';
/**
 * Whether the label for form fields should by default float `always`,
 * `never`, or `auto`.
 */
const DEFAULT_FLOAT_LABEL = 'auto';
/** Default way that the subscript element height is set. */
const DEFAULT_SUBSCRIPT_SIZING = 'fixed';
/**
 * Default transform for docked floating labels in a MDC text-field. This value has been
 * extracted from the MDC text-field styles because we programmatically modify the docked
 * label transform, but do not want to accidentally discard the default label transform.
 */
const FLOATING_LABEL_DEFAULT_DOCKED_TRANSFORM = `translateY(-50%)`;
/** Container for form controls that applies Material Design styling and behavior. */
class MatFormField {
    /** Whether the required marker should be hidden. */
    get hideRequiredMarker() {
        return this._hideRequiredMarker;
    }
    set hideRequiredMarker(value) {
        this._hideRequiredMarker = coerceBooleanProperty(value);
    }
    /** Whether the label should always float or float as the user types. */
    get floatLabel() {
        return this._floatLabel || this._defaults?.floatLabel || DEFAULT_FLOAT_LABEL;
    }
    set floatLabel(value) {
        if (value !== this._floatLabel) {
            this._floatLabel = value;
            // For backwards compatibility. Custom form field controls or directives might set
            // the "floatLabel" input and expect the form field view to be updated automatically.
            // e.g. autocomplete trigger. Ideally we'd get rid of this and the consumers would just
            // emit the "stateChanges" observable. TODO(devversion): consider removing.
            this._changeDetectorRef.markForCheck();
        }
    }
    /** The form field appearance style. */
    get appearance() {
        return this._appearance;
    }
    set appearance(value) {
        const oldValue = this._appearance;
        const newAppearance = value || this._defaults?.appearance || DEFAULT_APPEARANCE;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (newAppearance !== 'fill' && newAppearance !== 'outline') {
                throw new Error(`MatFormField: Invalid appearance "${newAppearance}", valid values are "fill" or "outline".`);
            }
        }
        this._appearance = newAppearance;
        if (this._appearance === 'outline' && this._appearance !== oldValue) {
            // If the appearance has been switched to `outline`, the label offset needs to be updated.
            // The update can happen once the view has been re-checked, but not immediately because
            // the view has not been updated and the notched-outline floating label is not present.
            this._needsOutlineLabelOffsetUpdate = true;
        }
    }
    /**
     * Whether the form field should reserve space for one line of hint/error text (default)
     * or to have the spacing grow from 0px as needed based on the size of the hint/error content.
     * Note that when using dynamic sizing, layout shifts will occur when hint/error text changes.
     */
    get subscriptSizing() {
        return this._subscriptSizing || this._defaults?.subscriptSizing || DEFAULT_SUBSCRIPT_SIZING;
    }
    set subscriptSizing(value) {
        this._subscriptSizing = value || this._defaults?.subscriptSizing || DEFAULT_SUBSCRIPT_SIZING;
    }
    /** Text for the form field hint. */
    get hintLabel() {
        return this._hintLabel;
    }
    set hintLabel(value) {
        this._hintLabel = value;
        this._processHints();
    }
    /** Gets the current form field control */
    get _control() {
        return this._explicitFormFieldControl || this._formFieldControl;
    }
    set _control(value) {
        this._explicitFormFieldControl = value;
    }
    constructor(_elementRef, _changeDetectorRef, 
    /**
     * @deprecated not needed, to be removed.
     * @breaking-change 19.0.0 remove this param
     */
    _unusedNgZone, _dir, _platform, _defaults, _animationMode, 
    /**
     * @deprecated not needed, to be removed.
     * @breaking-change 17.0.0 remove this param
     */
    _unusedDocument) {
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._dir = _dir;
        this._platform = _platform;
        this._defaults = _defaults;
        this._animationMode = _animationMode;
        this._labelChild = contentChild(MatLabel);
        this._hideRequiredMarker = false;
        /**
         * Theme color of the form field. This API is supported in M2 themes only, it
         * has no effect in M3 themes.
         *
         * For information on applying color variants in M3, see
         * https://material.angular.io/guide/theming#using-component-color-variants.
         */
        this.color = 'primary';
        this._appearance = DEFAULT_APPEARANCE;
        this._subscriptSizing = null;
        this._hintLabel = '';
        this._hasIconPrefix = false;
        this._hasTextPrefix = false;
        this._hasIconSuffix = false;
        this._hasTextSuffix = false;
        // Unique id for the internal form field label.
        this._labelId = `mat-mdc-form-field-label-${nextUniqueId++}`;
        // Unique id for the hint label.
        this._hintLabelId = `mat-mdc-hint-${nextUniqueId++}`;
        /** State of the mat-hint and mat-error animations. */
        this._subscriptAnimationState = '';
        this._destroyed = new Subject();
        this._isFocused = null;
        this._needsOutlineLabelOffsetUpdate = false;
        this._previousControl = null;
        this._injector = inject(Injector);
        /**
         * Gets the id of the label element. If no label is present, returns `null`.
         */
        this.getLabelId = computed(() => (this._hasFloatingLabel() ? this._labelId : null));
        this._hasFloatingLabel = computed(() => !!this._labelChild());
        if (_defaults) {
            if (_defaults.appearance) {
                this.appearance = _defaults.appearance;
            }
            this._hideRequiredMarker = Boolean(_defaults?.hideRequiredMarker);
            if (_defaults.color) {
                this.color = _defaults.color;
            }
        }
    }
    ngAfterViewInit() {
        // Initial focus state sync. This happens rarely, but we want to account for
        // it in case the form field control has "focused" set to true on init.
        this._updateFocusState();
        // Enable animations now. This ensures we don't animate on initial render.
        this._subscriptAnimationState = 'enter';
        // Because the above changes a value used in the template after it was checked, we need
        // to trigger CD or the change might not be reflected if there is no other CD scheduled.
        this._changeDetectorRef.detectChanges();
    }
    ngAfterContentInit() {
        this._assertFormFieldControl();
        this._initializeSubscript();
        this._initializePrefixAndSuffix();
        this._initializeOutlineLabelOffsetSubscriptions();
    }
    ngAfterContentChecked() {
        this._assertFormFieldControl();
        if (this._control !== this._previousControl) {
            this._initializeControl(this._previousControl);
            this._previousControl = this._control;
        }
    }
    ngOnDestroy() {
        this._stateChanges?.unsubscribe();
        this._valueChanges?.unsubscribe();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Gets an ElementRef for the element that a overlay attached to the form field
     * should be positioned relative to.
     */
    getConnectedOverlayOrigin() {
        return this._textField || this._elementRef;
    }
    /** Animates the placeholder up and locks it in position. */
    _animateAndLockLabel() {
        // This is for backwards compatibility only. Consumers of the form field might use
        // this method. e.g. the autocomplete trigger. This method has been added to the non-MDC
        // form field because setting "floatLabel" to "always" caused the label to float without
        // animation. This is different in MDC where the label always animates, so this method
        // is no longer necessary. There doesn't seem any benefit in adding logic to allow changing
        // the floating label state without animations. The non-MDC implementation was inconsistent
        // because it always animates if "floatLabel" is set away from "always".
        // TODO(devversion): consider removing this method when releasing the MDC form field.
        if (this._hasFloatingLabel()) {
            this.floatLabel = 'always';
        }
    }
    /** Initializes the registered form field control. */
    _initializeControl(previousControl) {
        const control = this._control;
        const classPrefix = 'mat-mdc-form-field-type-';
        if (previousControl) {
            this._elementRef.nativeElement.classList.remove(classPrefix + previousControl.controlType);
        }
        if (control.controlType) {
            this._elementRef.nativeElement.classList.add(classPrefix + control.controlType);
        }
        // Subscribe to changes in the child control state in order to update the form field UI.
        this._stateChanges?.unsubscribe();
        this._stateChanges = control.stateChanges.subscribe(() => {
            this._updateFocusState();
            this._syncDescribedByIds();
            this._changeDetectorRef.markForCheck();
        });
        this._valueChanges?.unsubscribe();
        // Run change detection if the value changes.
        if (control.ngControl && control.ngControl.valueChanges) {
            this._valueChanges = control.ngControl.valueChanges
                .pipe(takeUntil(this._destroyed))
                .subscribe(() => this._changeDetectorRef.markForCheck());
        }
    }
    _checkPrefixAndSuffixTypes() {
        this._hasIconPrefix = !!this._prefixChildren.find(p => !p._isText);
        this._hasTextPrefix = !!this._prefixChildren.find(p => p._isText);
        this._hasIconSuffix = !!this._suffixChildren.find(s => !s._isText);
        this._hasTextSuffix = !!this._suffixChildren.find(s => s._isText);
    }
    /** Initializes the prefix and suffix containers. */
    _initializePrefixAndSuffix() {
        this._checkPrefixAndSuffixTypes();
        // Mark the form field as dirty whenever the prefix or suffix children change. This
        // is necessary because we conditionally display the prefix/suffix containers based
        // on whether there is projected content.
        merge(this._prefixChildren.changes, this._suffixChildren.changes).subscribe(() => {
            this._checkPrefixAndSuffixTypes();
            this._changeDetectorRef.markForCheck();
        });
    }
    /**
     * Initializes the subscript by validating hints and synchronizing "aria-describedby" ids
     * with the custom form field control. Also subscribes to hint and error changes in order
     * to be able to validate and synchronize ids on change.
     */
    _initializeSubscript() {
        // Re-validate when the number of hints changes.
        this._hintChildren.changes.subscribe(() => {
            this._processHints();
            this._changeDetectorRef.markForCheck();
        });
        // Update the aria-described by when the number of errors changes.
        this._errorChildren.changes.subscribe(() => {
            this._syncDescribedByIds();
            this._changeDetectorRef.markForCheck();
        });
        // Initial mat-hint validation and subscript describedByIds sync.
        this._validateHints();
        this._syncDescribedByIds();
    }
    /** Throws an error if the form field's control is missing. */
    _assertFormFieldControl() {
        if (!this._control && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMatFormFieldMissingControlError();
        }
    }
    _updateFocusState() {
        // Usually the MDC foundation would call "activateFocus" and "deactivateFocus" whenever
        // certain DOM events are emitted. This is not possible in our implementation of the
        // form field because we support abstract form field controls which are not necessarily
        // of type input, nor do we have a reference to a native form field control element. Instead
        // we handle the focus by checking if the abstract form field control focused state changes.
        if (this._control.focused && !this._isFocused) {
            this._isFocused = true;
            this._lineRipple?.activate();
        }
        else if (!this._control.focused && (this._isFocused || this._isFocused === null)) {
            this._isFocused = false;
            this._lineRipple?.deactivate();
        }
        this._textField?.nativeElement.classList.toggle('mdc-text-field--focused', this._control.focused);
    }
    /**
     * The floating label in the docked state needs to account for prefixes. The horizontal offset
     * is calculated whenever the appearance changes to `outline`, the prefixes change, or when the
     * form field is added to the DOM. This method sets up all subscriptions which are needed to
     * trigger the label offset update.
     */
    _initializeOutlineLabelOffsetSubscriptions() {
        // Whenever the prefix changes, schedule an update of the label offset.
        // TODO(mmalerba): Use ResizeObserver to better support dynamically changing prefix content.
        this._prefixChildren.changes.subscribe(() => (this._needsOutlineLabelOffsetUpdate = true));
        // TODO(mmalerba): Split this into separate `afterRender` calls using the `EarlyRead` and
        //  `Write` phases.
        afterRender(() => {
            if (this._needsOutlineLabelOffsetUpdate) {
                this._needsOutlineLabelOffsetUpdate = false;
                this._updateOutlineLabelOffset();
            }
        }, {
            injector: this._injector,
        });
        this._dir.change
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => (this._needsOutlineLabelOffsetUpdate = true));
    }
    /** Whether the floating label should always float or not. */
    _shouldAlwaysFloat() {
        return this.floatLabel === 'always';
    }
    _hasOutline() {
        return this.appearance === 'outline';
    }
    /**
     * Whether the label should display in the infix. Labels in the outline appearance are
     * displayed as part of the notched-outline and are horizontally offset to account for
     * form field prefix content. This won't work in server side rendering since we cannot
     * measure the width of the prefix container. To make the docked label appear as if the
     * right offset has been calculated, we forcibly render the label inside the infix. Since
     * the label is part of the infix, the label cannot overflow the prefix content.
     */
    _forceDisplayInfixLabel() {
        return !this._platform.isBrowser && this._prefixChildren.length && !this._shouldLabelFloat();
    }
    _shouldLabelFloat() {
        if (!this._hasFloatingLabel()) {
            return false;
        }
        return this._control.shouldLabelFloat || this._shouldAlwaysFloat();
    }
    /**
     * Determines whether a class from the AbstractControlDirective
     * should be forwarded to the host element.
     */
    _shouldForward(prop) {
        const control = this._control ? this._control.ngControl : null;
        return control && control[prop];
    }
    /** Determines whether to display hints or errors. */
    _getDisplayedMessages() {
        return this._errorChildren && this._errorChildren.length > 0 && this._control.errorState
            ? 'error'
            : 'hint';
    }
    /** Handle label resize events. */
    _handleLabelResized() {
        this._refreshOutlineNotchWidth();
    }
    /** Refreshes the width of the outline-notch, if present. */
    _refreshOutlineNotchWidth() {
        if (!this._hasOutline() || !this._floatingLabel || !this._shouldLabelFloat()) {
            this._notchedOutline?._setNotchWidth(0);
        }
        else {
            this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());
        }
    }
    /** Does any extra processing that is required when handling the hints. */
    _processHints() {
        this._validateHints();
        this._syncDescribedByIds();
    }
    /**
     * Ensure that there is a maximum of one of each "mat-hint" alignment specified. The hint
     * label specified set through the input is being considered as "start" aligned.
     *
     * This method is a noop if Angular runs in production mode.
     */
    _validateHints() {
        if (this._hintChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            let startHint;
            let endHint;
            this._hintChildren.forEach((hint) => {
                if (hint.align === 'start') {
                    if (startHint || this.hintLabel) {
                        throw getMatFormFieldDuplicatedHintError('start');
                    }
                    startHint = hint;
                }
                else if (hint.align === 'end') {
                    if (endHint) {
                        throw getMatFormFieldDuplicatedHintError('end');
                    }
                    endHint = hint;
                }
            });
        }
    }
    /**
     * Sets the list of element IDs that describe the child control. This allows the control to update
     * its `aria-describedby` attribute accordingly.
     */
    _syncDescribedByIds() {
        if (this._control) {
            let ids = [];
            // TODO(wagnermaciel): Remove the type check when we find the root cause of this bug.
            if (this._control.userAriaDescribedBy &&
                typeof this._control.userAriaDescribedBy === 'string') {
                ids.push(...this._control.userAriaDescribedBy.split(' '));
            }
            if (this._getDisplayedMessages() === 'hint') {
                const startHint = this._hintChildren
                    ? this._hintChildren.find(hint => hint.align === 'start')
                    : null;
                const endHint = this._hintChildren
                    ? this._hintChildren.find(hint => hint.align === 'end')
                    : null;
                if (startHint) {
                    ids.push(startHint.id);
                }
                else if (this._hintLabel) {
                    ids.push(this._hintLabelId);
                }
                if (endHint) {
                    ids.push(endHint.id);
                }
            }
            else if (this._errorChildren) {
                ids.push(...this._errorChildren.map(error => error.id));
            }
            this._control.setDescribedByIds(ids);
        }
    }
    /**
     * Updates the horizontal offset of the label in the outline appearance. In the outline
     * appearance, the notched-outline and label are not relative to the infix container because
     * the outline intends to surround prefixes, suffixes and the infix. This means that the
     * floating label by default overlaps prefixes in the docked state. To avoid this, we need to
     * horizontally offset the label by the width of the prefix container. The MDC text-field does
     * not need to do this because they use a fixed width for prefixes. Hence, they can simply
     * incorporate the horizontal offset into their default text-field styles.
     */
    _updateOutlineLabelOffset() {
        if (!this._hasOutline() || !this._floatingLabel) {
            return;
        }
        const floatingLabel = this._floatingLabel.element;
        // If no prefix is displayed, reset the outline label offset from potential
        // previous label offset updates.
        if (!(this._iconPrefixContainer || this._textPrefixContainer)) {
            floatingLabel.style.transform = '';
            return;
        }
        // If the form field is not attached to the DOM yet (e.g. in a tab), we defer
        // the label offset update until the zone stabilizes.
        if (!this._isAttachedToDom()) {
            this._needsOutlineLabelOffsetUpdate = true;
            return;
        }
        const iconPrefixContainer = this._iconPrefixContainer?.nativeElement;
        const textPrefixContainer = this._textPrefixContainer?.nativeElement;
        const iconSuffixContainer = this._iconSuffixContainer?.nativeElement;
        const textSuffixContainer = this._textSuffixContainer?.nativeElement;
        const iconPrefixContainerWidth = iconPrefixContainer?.getBoundingClientRect().width ?? 0;
        const textPrefixContainerWidth = textPrefixContainer?.getBoundingClientRect().width ?? 0;
        const iconSuffixContainerWidth = iconSuffixContainer?.getBoundingClientRect().width ?? 0;
        const textSuffixContainerWidth = textSuffixContainer?.getBoundingClientRect().width ?? 0;
        // If the directionality is RTL, the x-axis transform needs to be inverted. This
        // is because `transformX` does not change based on the page directionality.
        const negate = this._dir.value === 'rtl' ? '-1' : '1';
        const prefixWidth = `${iconPrefixContainerWidth + textPrefixContainerWidth}px`;
        const labelOffset = `var(--mat-mdc-form-field-label-offset-x, 0px)`;
        const labelHorizontalOffset = `calc(${negate} * (${prefixWidth} + ${labelOffset}))`;
        // Update the translateX of the floating label to account for the prefix container,
        // but allow the CSS to override this setting via a CSS variable when the label is
        // floating.
        floatingLabel.style.transform = `var(
        --mat-mdc-form-field-label-transform,
        ${FLOATING_LABEL_DEFAULT_DOCKED_TRANSFORM} translateX(${labelHorizontalOffset})
    )`;
        // Prevent the label from overlapping the suffix when in resting position.
        const prefixAndSuffixWidth = iconPrefixContainerWidth +
            textPrefixContainerWidth +
            iconSuffixContainerWidth +
            textSuffixContainerWidth;
        this._elementRef.nativeElement.style.setProperty('--mat-form-field-notch-max-width', `calc(100% - ${prefixAndSuffixWidth}px)`);
    }
    /** Checks whether the form field is attached to the DOM. */
    _isAttachedToDom() {
        const element = this._elementRef.nativeElement;
        if (element.getRootNode) {
            const rootNode = element.getRootNode();
            // If the element is inside the DOM the root node will be either the document
            // or the closest shadow root, otherwise it'll be the element itself.
            return rootNode && rootNode !== element;
        }
        // Otherwise fall back to checking if it's in the document. This doesn't account for
        // shadow DOM, however browser that support shadow DOM should support `getRootNode` as well.
        return document.documentElement.contains(element);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormField, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: i1.Directionality }, { token: i2.Platform }, { token: MAT_FORM_FIELD_DEFAULT_OPTIONS, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatFormField, isStandalone: true, selector: "mat-form-field", inputs: { hideRequiredMarker: "hideRequiredMarker", color: "color", floatLabel: "floatLabel", appearance: "appearance", subscriptSizing: "subscriptSizing", hintLabel: "hintLabel" }, host: { properties: { "class.mat-mdc-form-field-label-always-float": "_shouldAlwaysFloat()", "class.mat-mdc-form-field-has-icon-prefix": "_hasIconPrefix", "class.mat-mdc-form-field-has-icon-suffix": "_hasIconSuffix", "class.mat-form-field-invalid": "_control.errorState", "class.mat-form-field-disabled": "_control.disabled", "class.mat-form-field-autofilled": "_control.autofilled", "class.mat-form-field-no-animations": "_animationMode === \"NoopAnimations\"", "class.mat-form-field-appearance-fill": "appearance == \"fill\"", "class.mat-form-field-appearance-outline": "appearance == \"outline\"", "class.mat-form-field-hide-placeholder": "_hasFloatingLabel() && !_shouldLabelFloat()", "class.mat-focused": "_control.focused", "class.mat-primary": "color !== \"accent\" && color !== \"warn\"", "class.mat-accent": "color === \"accent\"", "class.mat-warn": "color === \"warn\"", "class.ng-untouched": "_shouldForward(\"untouched\")", "class.ng-touched": "_shouldForward(\"touched\")", "class.ng-pristine": "_shouldForward(\"pristine\")", "class.ng-dirty": "_shouldForward(\"dirty\")", "class.ng-valid": "_shouldForward(\"valid\")", "class.ng-invalid": "_shouldForward(\"invalid\")", "class.ng-pending": "_shouldForward(\"pending\")" }, classAttribute: "mat-mdc-form-field" }, providers: [
            { provide: MAT_FORM_FIELD, useExisting: MatFormField },
            { provide: FLOATING_LABEL_PARENT, useExisting: MatFormField },
        ], queries: [{ propertyName: "_labelChild", first: true, predicate: MatLabel, descendants: true, isSignal: true }, { propertyName: "_formFieldControl", first: true, predicate: MatFormFieldControl, descendants: true }, { propertyName: "_prefixChildren", predicate: MAT_PREFIX, descendants: true }, { propertyName: "_suffixChildren", predicate: MAT_SUFFIX, descendants: true }, { propertyName: "_errorChildren", predicate: MAT_ERROR, descendants: true }, { propertyName: "_hintChildren", predicate: MatHint, descendants: true }], viewQueries: [{ propertyName: "_textField", first: true, predicate: ["textField"], descendants: true }, { propertyName: "_iconPrefixContainer", first: true, predicate: ["iconPrefixContainer"], descendants: true }, { propertyName: "_textPrefixContainer", first: true, predicate: ["textPrefixContainer"], descendants: true }, { propertyName: "_iconSuffixContainer", first: true, predicate: ["iconSuffixContainer"], descendants: true }, { propertyName: "_textSuffixContainer", first: true, predicate: ["textSuffixContainer"], descendants: true }, { propertyName: "_floatingLabel", first: true, predicate: MatFormFieldFloatingLabel, descendants: true }, { propertyName: "_notchedOutline", first: true, predicate: MatFormFieldNotchedOutline, descendants: true }, { propertyName: "_lineRipple", first: true, predicate: MatFormFieldLineRipple, descendants: true }], exportAs: ["matFormField"], ngImport: i0, template: "<ng-template #labelTemplate>\n  <!--\n    MDC recommends that the text-field is a `<label>` element. This rather complicates the\n    setup because it would require every form-field control to explicitly set `aria-labelledby`.\n    This is because the `<label>` itself contains more than the actual label (e.g. prefix, suffix\n    or other projected content), and screen readers could potentially read out undesired content.\n    Excluding elements from being printed out requires them to be marked with `aria-hidden`, or\n    the form control is set to a scoped element for the label (using `aria-labelledby`). Both of\n    these options seem to complicate the setup because we know exactly what content is rendered\n    as part of the label, and we don't want to spend resources on walking through projected content\n    to set `aria-hidden`. Nor do we want to set `aria-labelledby` on every form control if we could\n    simply link the label to the control using the label `for` attribute.\n  -->\n  @if (_hasFloatingLabel()) {\n    <label\n      matFormFieldFloatingLabel\n      [floating]=\"_shouldLabelFloat()\"\n      [monitorResize]=\"_hasOutline()\"\n      [id]=\"_labelId\"\n      [attr.for]=\"_control.disableAutomaticLabeling ? null : _control.id\"\n    >\n      <ng-content select=\"mat-label\"></ng-content>\n      <!--\n        We set the required marker as a separate element, in order to make it easier to target if\n        apps want to override it and to be able to set `aria-hidden` so that screen readers don't\n        pick it up.\n       -->\n      @if (!hideRequiredMarker && _control.required) {\n        <span\n          aria-hidden=\"true\"\n          class=\"mat-mdc-form-field-required-marker mdc-floating-label--required\"\n        ></span>\n      }\n    </label>\n  }\n</ng-template>\n\n<div\n  class=\"mat-mdc-text-field-wrapper mdc-text-field\"\n  #textField\n  [class.mdc-text-field--filled]=\"!_hasOutline()\"\n  [class.mdc-text-field--outlined]=\"_hasOutline()\"\n  [class.mdc-text-field--no-label]=\"!_hasFloatingLabel()\"\n  [class.mdc-text-field--disabled]=\"_control.disabled\"\n  [class.mdc-text-field--invalid]=\"_control.errorState\"\n  (click)=\"_control.onContainerClick($event)\"\n>\n  @if (!_hasOutline() && !_control.disabled) {\n    <div class=\"mat-mdc-form-field-focus-overlay\"></div>\n  }\n  <div class=\"mat-mdc-form-field-flex\">\n    @if (_hasOutline()) {\n      <div matFormFieldNotchedOutline [matFormFieldNotchedOutlineOpen]=\"_shouldLabelFloat()\">\n        @if (!_forceDisplayInfixLabel()) {\n          <ng-template [ngTemplateOutlet]=\"labelTemplate\"></ng-template>\n        }\n      </div>\n    }\n\n    @if (_hasIconPrefix) {\n      <div class=\"mat-mdc-form-field-icon-prefix\" #iconPrefixContainer>\n        <ng-content select=\"[matPrefix], [matIconPrefix]\"></ng-content>\n      </div>\n    }\n\n    @if (_hasTextPrefix) {\n      <div class=\"mat-mdc-form-field-text-prefix\" #textPrefixContainer>\n        <ng-content select=\"[matTextPrefix]\"></ng-content>\n      </div>\n    }\n\n    <div class=\"mat-mdc-form-field-infix\">\n      @if (!_hasOutline() || _forceDisplayInfixLabel()) {\n        <ng-template [ngTemplateOutlet]=\"labelTemplate\"></ng-template>\n      }\n\n      <ng-content></ng-content>\n    </div>\n\n    @if (_hasTextSuffix) {\n      <div class=\"mat-mdc-form-field-text-suffix\" #textSuffixContainer>\n        <ng-content select=\"[matTextSuffix]\"></ng-content>\n      </div>\n    }\n\n    @if (_hasIconSuffix) {\n      <div class=\"mat-mdc-form-field-icon-suffix\" #iconSuffixContainer>\n        <ng-content select=\"[matSuffix], [matIconSuffix]\"></ng-content>\n      </div>\n    }\n  </div>\n\n  @if (!_hasOutline()) {\n    <div matFormFieldLineRipple></div>\n  }\n</div>\n\n<div\n  class=\"mat-mdc-form-field-subscript-wrapper mat-mdc-form-field-bottom-align\"\n  [class.mat-mdc-form-field-subscript-dynamic-size]=\"subscriptSizing === 'dynamic'\"\n>\n  @switch (_getDisplayedMessages()) {\n    @case ('error') {\n      <div\n        class=\"mat-mdc-form-field-error-wrapper\"\n        [@transitionMessages]=\"_subscriptAnimationState\"\n      >\n        <ng-content select=\"mat-error, [matError]\"></ng-content>\n      </div>\n    }\n\n    @case ('hint') {\n      <div class=\"mat-mdc-form-field-hint-wrapper\" [@transitionMessages]=\"_subscriptAnimationState\">\n        @if (hintLabel) {\n          <mat-hint [id]=\"_hintLabelId\">{{hintLabel}}</mat-hint>\n        }\n        <ng-content select=\"mat-hint:not([align='end'])\"></ng-content>\n        <div class=\"mat-mdc-form-field-hint-spacer\"></div>\n        <ng-content select=\"mat-hint[align='end']\"></ng-content>\n      </div>\n    }\n  }\n</div>\n", styles: [".mdc-text-field{display:inline-flex;align-items:baseline;padding:0 16px;position:relative;box-sizing:border-box;overflow:hidden;will-change:opacity,transform,color;border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0}.mdc-text-field__input{width:100%;min-width:0;border:none;border-radius:0;background:none;padding:0;-moz-appearance:none;-webkit-appearance:none;height:28px}.mdc-text-field__input::-webkit-calendar-picker-indicator{display:none}.mdc-text-field__input::-ms-clear{display:none}.mdc-text-field__input:focus{outline:none}.mdc-text-field__input:invalid{box-shadow:none}.mdc-text-field__input::placeholder{opacity:0}.mdc-text-field__input::-moz-placeholder{opacity:0}.mdc-text-field__input::-webkit-input-placeholder{opacity:0}.mdc-text-field__input:-ms-input-placeholder{opacity:0}.mdc-text-field--no-label .mdc-text-field__input::placeholder,.mdc-text-field--focused .mdc-text-field__input::placeholder{opacity:1}.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder,.mdc-text-field--focused .mdc-text-field__input::-moz-placeholder{opacity:1}.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder,.mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder{opacity:1}.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder,.mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder{opacity:1}.mdc-text-field--outlined .mdc-text-field__input,.mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input{height:100%}.mdc-text-field--outlined .mdc-text-field__input{display:flex;border:none !important;background-color:rgba(0,0,0,0)}.mdc-text-field--disabled .mdc-text-field__input{pointer-events:auto}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input{color:var(--mdc-filled-text-field-input-text-color, var(--mat-app-on-surface));caret-color:var(--mdc-filled-text-field-caret-color, var(--mat-app-primary))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input{caret-color:var(--mdc-filled-text-field-error-caret-color)}.mdc-text-field--filled.mdc-text-field--disabled .mdc-text-field__input{color:var(--mdc-filled-text-field-disabled-input-text-color)}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input{color:var(--mdc-outlined-text-field-input-text-color, var(--mat-app-on-surface));caret-color:var(--mdc-outlined-text-field-caret-color, var(--mat-app-primary))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input{caret-color:var(--mdc-outlined-text-field-error-caret-color)}.mdc-text-field--outlined.mdc-text-field--disabled .mdc-text-field__input{color:var(--mdc-outlined-text-field-disabled-input-text-color)}.mdc-text-field--disabled .cdk-high-contrast-active .mdc-text-field__input{background-color:Window}.mdc-text-field--filled{height:56px;border-bottom-right-radius:0;border-bottom-left-radius:0;border-top-left-radius:var(--mdc-filled-text-field-container-shape, var(--mat-app-corner-extra-small-top));border-top-right-radius:var(--mdc-filled-text-field-container-shape, var(--mat-app-corner-extra-small-top))}.mdc-text-field--filled:not(.mdc-text-field--disabled){background-color:var(--mdc-filled-text-field-container-color, var(--mat-app-surface-variant))}.mdc-text-field--filled.mdc-text-field--disabled{background-color:var(--mdc-filled-text-field-disabled-container-color)}.mdc-text-field--outlined{height:56px;overflow:visible;padding-right:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)));padding-left:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)) + 4px)}[dir=rtl] .mdc-text-field--outlined{padding-right:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)) + 4px);padding-left:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)))}.mdc-floating-label{position:absolute;left:0;transform-origin:left top;line-height:1.15rem;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:text;overflow:hidden;will-change:transform}[dir=rtl] .mdc-floating-label{right:0;left:auto;transform-origin:right top;text-align:right}.mdc-text-field .mdc-floating-label{top:50%;transform:translateY(-50%);pointer-events:none}.mdc-notched-outline .mdc-floating-label{display:inline-block;position:relative;max-width:100%}.mdc-text-field--outlined .mdc-floating-label{left:4px;right:auto}[dir=rtl] .mdc-text-field--outlined .mdc-floating-label{left:auto;right:4px}.mdc-text-field--filled .mdc-floating-label{left:16px;right:auto}[dir=rtl] .mdc-text-field--filled .mdc-floating-label{left:auto;right:16px}.mdc-text-field--disabled .mdc-floating-label{cursor:default}.cdk-high-contrast-active .mdc-text-field--disabled .mdc-floating-label{z-index:1}.mdc-text-field--filled.mdc-text-field--no-label .mdc-floating-label{display:none}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-floating-label{color:var(--mdc-filled-text-field-label-text-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label{color:var(--mdc-filled-text-field-focus-label-text-color, var(--mat-app-primary))}.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label{color:var(--mdc-filled-text-field-hover-label-text-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled.mdc-text-field--disabled .mdc-floating-label{color:var(--mdc-filled-text-field-disabled-label-text-color)}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label{color:var(--mdc-filled-text-field-error-label-text-color, var(--mat-app-error))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label{color:var(--mdc-filled-text-field-error-focus-label-text-color, var(--mat-app-error))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label{color:var(--mdc-filled-text-field-error-hover-label-text-color, var(--mat-app-on-error-container))}.mdc-text-field--filled .mdc-floating-label{font-family:var(--mdc-filled-text-field-label-text-font, var(--mat-app-body-large-font));font-size:var(--mdc-filled-text-field-label-text-size, var(--mat-app-body-large-size));font-weight:var(--mdc-filled-text-field-label-text-weight, var(--mat-app-body-large-weight));letter-spacing:var(--mdc-filled-text-field-label-text-tracking, var(--mat-app-body-large-tracking))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-floating-label{color:var(--mdc-outlined-text-field-label-text-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label{color:var(--mdc-outlined-text-field-focus-label-text-color, var(--mat-app-primary))}.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label{color:var(--mdc-outlined-text-field-hover-label-text-color, var(--mat-app-on-surface))}.mdc-text-field--outlined.mdc-text-field--disabled .mdc-floating-label{color:var(--mdc-outlined-text-field-disabled-label-text-color)}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label{color:var(--mdc-outlined-text-field-error-label-text-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label{color:var(--mdc-outlined-text-field-error-focus-label-text-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label{color:var(--mdc-outlined-text-field-error-hover-label-text-color, var(--mat-app-on-error-container))}.mdc-text-field--outlined .mdc-floating-label{font-family:var(--mdc-outlined-text-field-label-text-font, var(--mat-app-body-large-font));font-size:var(--mdc-outlined-text-field-label-text-size, var(--mat-app-body-large-size));font-weight:var(--mdc-outlined-text-field-label-text-weight, var(--mat-app-body-large-weight));letter-spacing:var(--mdc-outlined-text-field-label-text-tracking, var(--mat-app-body-large-tracking))}.mdc-floating-label--float-above{cursor:auto;transform:translateY(-106%) scale(0.75)}.mdc-text-field--filled .mdc-floating-label--float-above{transform:translateY(-106%) scale(0.75)}.mdc-text-field--outlined .mdc-floating-label--float-above{transform:translateY(-37.25px) scale(1);font-size:.75rem}.mdc-notched-outline .mdc-floating-label--float-above{text-overflow:clip}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:133.3333333333%}.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) scale(0.75)}.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after{margin-left:1px;margin-right:0;content:\"*\"}[dir=rtl] .mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after{margin-left:0;margin-right:1px}.mdc-notched-outline{display:flex;position:absolute;top:0;right:0;left:0;box-sizing:border-box;width:100%;max-width:100%;height:100%;text-align:left;pointer-events:none}[dir=rtl] .mdc-notched-outline{text-align:right}.mdc-text-field--outlined .mdc-notched-outline{z-index:1}.mat-mdc-notch-piece{box-sizing:border-box;height:100%;pointer-events:none;border-top:1px solid;border-bottom:1px solid}.mdc-text-field--focused .mat-mdc-notch-piece{border-width:2px}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-outline-color, var(--mat-app-outline));border-width:var(--mdc-outlined-text-field-outline-width)}.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-hover-outline-color, var(--mat-app-on-surface))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-focus-outline-color, var(--mat-app-primary))}.mdc-text-field--outlined.mdc-text-field--disabled .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-disabled-outline-color)}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-error-outline-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-notched-outline .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-error-hover-outline-color, var(--mat-app-on-error-container))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-error-focus-outline-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline .mat-mdc-notch-piece{border-width:var(--mdc-outlined-text-field-focus-outline-width)}.mdc-notched-outline__leading{border-left:1px solid;border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;border-top-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading{width:max(12px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)))}[dir=rtl] .mdc-notched-outline__leading{border-left:none;border-right:1px solid;border-bottom-left-radius:0;border-top-left-radius:0;border-top-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}.mdc-notched-outline__trailing{flex-grow:1;border-left:none;border-right:1px solid;border-top-left-radius:0;border-bottom-left-radius:0;border-top-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}[dir=rtl] .mdc-notched-outline__trailing{border-left:1px solid;border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;border-top-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}.mdc-notched-outline__notch{flex:0 0 auto;width:auto}.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch{max-width:min(var(--mat-form-field-notch-max-width, 100%),100% - max(12px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)))*2)}.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:1px}.mdc-text-field--focused.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:2px}.mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:0;padding-right:8px;border-top:none;--mat-form-field-notch-max-width: 100%}[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:8px;padding-right:0}.mdc-notched-outline--no-label .mdc-notched-outline__notch{display:none}.mdc-line-ripple::before,.mdc-line-ripple::after{position:absolute;bottom:0;left:0;width:100%;border-bottom-style:solid;content:\"\"}.mdc-line-ripple::before{z-index:1;border-bottom-width:var(--mdc-filled-text-field-active-indicator-height)}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-active-indicator-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-hover-active-indicator-color, var(--mat-app-on-surface))}.mdc-text-field--filled.mdc-text-field--disabled .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-disabled-active-indicator-color)}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-error-active-indicator-color, var(--mat-app-error))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-error-hover-active-indicator-color, var(--mat-app-on-error-container))}.mdc-line-ripple::after{transform:scaleX(0);opacity:0;z-index:2}.mdc-text-field--filled .mdc-line-ripple::after{border-bottom-width:var(--mdc-filled-text-field-focus-active-indicator-height)}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::after{border-bottom-color:var(--mdc-filled-text-field-focus-active-indicator-color, var(--mat-app-primary))}.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::after{border-bottom-color:var(--mdc-filled-text-field-error-focus-active-indicator-color, var(--mat-app-error))}.mdc-line-ripple--active::after{transform:scaleX(1);opacity:1}.mdc-line-ripple--deactivating::after{opacity:0}.mdc-text-field--disabled{pointer-events:none}.mat-mdc-form-field-textarea-control{vertical-align:middle;resize:vertical;box-sizing:border-box;height:auto;margin:0;padding:0;border:none;overflow:auto}.mat-mdc-form-field-input-control.mat-mdc-form-field-input-control{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font:inherit;letter-spacing:inherit;text-decoration:inherit;text-transform:inherit;border:none}.mat-mdc-form-field .mat-mdc-floating-label.mdc-floating-label{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;line-height:normal;pointer-events:all;will-change:auto}.mat-mdc-form-field:not(.mat-form-field-disabled) .mat-mdc-floating-label.mdc-floating-label{cursor:inherit}.mdc-text-field--no-label:not(.mdc-text-field--textarea) .mat-mdc-form-field-input-control.mdc-text-field__input,.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control{height:auto}.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control.mdc-text-field__input[type=color]{height:23px}.mat-mdc-text-field-wrapper{height:auto;flex:auto;will-change:auto}.mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper{padding-left:0;--mat-mdc-form-field-label-offset-x: -16px}.mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper{padding-right:0}[dir=rtl] .mat-mdc-text-field-wrapper{padding-left:16px;padding-right:16px}[dir=rtl] .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper{padding-left:0}[dir=rtl] .mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper{padding-right:0}.mat-form-field-disabled .mdc-text-field__input::placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-form-field-disabled .mdc-text-field__input::-moz-placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-form-field-disabled .mdc-text-field__input::-webkit-input-placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-form-field-disabled .mdc-text-field__input:-ms-input-placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-mdc-form-field-label-always-float .mdc-text-field__input::placeholder{transition-delay:40ms;transition-duration:110ms;opacity:1}.mat-mdc-text-field-wrapper .mat-mdc-form-field-infix .mat-mdc-floating-label{left:auto;right:auto}.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-text-field__input{display:inline-block}.mat-mdc-form-field .mat-mdc-text-field-wrapper.mdc-text-field .mdc-notched-outline__notch{padding-top:0}.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch{border-left:1px solid rgba(0,0,0,0)}[dir=rtl] .mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch{border-left:none;border-right:1px solid rgba(0,0,0,0)}.mat-mdc-form-field-infix{min-height:var(--mat-form-field-container-height);padding-top:var(--mat-form-field-filled-with-label-container-padding-top);padding-bottom:var(--mat-form-field-filled-with-label-container-padding-bottom)}.mdc-text-field--outlined .mat-mdc-form-field-infix,.mdc-text-field--no-label .mat-mdc-form-field-infix{padding-top:var(--mat-form-field-container-vertical-padding);padding-bottom:var(--mat-form-field-container-vertical-padding)}.mat-mdc-text-field-wrapper .mat-mdc-form-field-flex .mat-mdc-floating-label{top:calc(var(--mat-form-field-container-height)/2)}.mdc-text-field--filled .mat-mdc-floating-label{display:var(--mat-form-field-filled-label-display, block)}.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{--mat-mdc-form-field-label-transform: translateY(calc(calc(6.75px + var(--mat-form-field-container-height) / 2) * -1)) scale(var(--mat-mdc-form-field-floating-label-scale, 0.75));transform:var(--mat-mdc-form-field-label-transform)}.mat-mdc-form-field-subscript-wrapper{box-sizing:border-box;width:100%;position:relative}.mat-mdc-form-field-hint-wrapper,.mat-mdc-form-field-error-wrapper{position:absolute;top:0;left:0;right:0;padding:0 16px}.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-hint-wrapper,.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-error-wrapper{position:static}.mat-mdc-form-field-bottom-align::before{content:\"\";display:inline-block;height:16px}.mat-mdc-form-field-bottom-align.mat-mdc-form-field-subscript-dynamic-size::before{content:unset}.mat-mdc-form-field-hint-end{order:1}.mat-mdc-form-field-hint-wrapper{display:flex}.mat-mdc-form-field-hint-spacer{flex:1 0 1em}.mat-mdc-form-field-error{display:block;color:var(--mat-form-field-error-text-color, var(--mat-app-error))}.mat-mdc-form-field-subscript-wrapper,.mat-mdc-form-field-bottom-align::before{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:var(--mat-form-field-subscript-text-font, var(--mat-app-body-small-font));line-height:var(--mat-form-field-subscript-text-line-height, var(--mat-app-body-small-line-height));font-size:var(--mat-form-field-subscript-text-size, var(--mat-app-body-small-size));letter-spacing:var(--mat-form-field-subscript-text-tracking, var(--mat-app-body-small-tracking));font-weight:var(--mat-form-field-subscript-text-weight, var(--mat-app-body-small-weight))}.mat-mdc-form-field-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;opacity:0;pointer-events:none;background-color:var(--mat-form-field-state-layer-color, var(--mat-app-on-surface))}.mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-focus-overlay{opacity:var(--mat-form-field-hover-state-layer-opacity, var(--mat-app-hover-state-layer-opacity))}.mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay{opacity:var(--mat-form-field-focus-state-layer-opacity)}select.mat-mdc-form-field-input-control{-moz-appearance:none;-webkit-appearance:none;background-color:rgba(0,0,0,0);display:inline-flex;box-sizing:border-box}select.mat-mdc-form-field-input-control:not(:disabled){cursor:pointer}select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option{color:var(--mat-form-field-select-option-text-color)}select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled{color:var(--mat-form-field-select-disabled-option-text-color)}.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after{content:\"\";width:0;height:0;border-left:5px solid rgba(0,0,0,0);border-right:5px solid rgba(0,0,0,0);border-top:5px solid;position:absolute;right:0;top:50%;margin-top:-2.5px;pointer-events:none;color:var(--mat-form-field-enabled-select-arrow-color, var(--mat-app-on-surface-variant))}[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after{right:auto;left:0}.mat-mdc-form-field-type-mat-native-select.mat-focused .mat-mdc-form-field-infix::after{color:var(--mat-form-field-focus-select-arrow-color, var(--mat-app-primary))}.mat-mdc-form-field-type-mat-native-select.mat-form-field-disabled .mat-mdc-form-field-infix::after{color:var(--mat-form-field-disabled-select-arrow-color)}.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control{padding-right:15px}[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control{padding-right:0;padding-left:15px}.cdk-high-contrast-active .mat-form-field-appearance-fill .mat-mdc-text-field-wrapper{outline:solid 1px}.cdk-high-contrast-active .mat-form-field-appearance-fill.mat-form-field-disabled .mat-mdc-text-field-wrapper{outline-color:GrayText}.cdk-high-contrast-active .mat-form-field-appearance-fill.mat-focused .mat-mdc-text-field-wrapper{outline:dashed 3px}.cdk-high-contrast-active .mat-mdc-form-field.mat-focused .mdc-notched-outline{border:dashed 3px}.mat-mdc-form-field-input-control[type=date],.mat-mdc-form-field-input-control[type=datetime],.mat-mdc-form-field-input-control[type=datetime-local],.mat-mdc-form-field-input-control[type=month],.mat-mdc-form-field-input-control[type=week],.mat-mdc-form-field-input-control[type=time]{line-height:1}.mat-mdc-form-field-input-control::-webkit-datetime-edit{line-height:1;padding:0;margin-bottom:-2px}.mat-mdc-form-field{--mat-mdc-form-field-floating-label-scale: 0.75;display:inline-flex;flex-direction:column;min-width:0;text-align:left;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:var(--mat-form-field-container-text-font, var(--mat-app-body-large-font));line-height:var(--mat-form-field-container-text-line-height, var(--mat-app-body-large-line-height));font-size:var(--mat-form-field-container-text-size, var(--mat-app-body-large-size));letter-spacing:var(--mat-form-field-container-text-tracking, var(--mat-app-body-large-tracking));font-weight:var(--mat-form-field-container-text-weight, var(--mat-app-body-large-weight))}[dir=rtl] .mat-mdc-form-field{text-align:right}.mat-mdc-form-field .mdc-text-field--outlined .mdc-floating-label--float-above{font-size:calc(var(--mat-form-field-outlined-label-text-populated-size)*var(--mat-mdc-form-field-floating-label-scale))}.mat-mdc-form-field .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:var(--mat-form-field-outlined-label-text-populated-size)}.mat-mdc-form-field-flex{display:inline-flex;align-items:baseline;box-sizing:border-box;width:100%}.mat-mdc-text-field-wrapper{width:100%;z-index:0}.mat-mdc-form-field-icon-prefix,.mat-mdc-form-field-icon-suffix{align-self:center;line-height:0;pointer-events:auto;position:relative;z-index:1}.mat-mdc-form-field-icon-prefix>.mat-icon,.mat-mdc-form-field-icon-suffix>.mat-icon{padding:0 12px;box-sizing:content-box}.mat-mdc-form-field-icon-prefix{color:var(--mat-form-field-leading-icon-color, var(--mat-app-on-surface-variant))}.mat-form-field-disabled .mat-mdc-form-field-icon-prefix{color:var(--mat-form-field-disabled-leading-icon-color)}.mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-trailing-icon-color, var(--mat-app-on-surface-variant))}.mat-form-field-disabled .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-disabled-trailing-icon-color)}.mat-form-field-invalid .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-error-trailing-icon-color, var(--mat-app-error))}.mat-form-field-invalid:not(.mat-focused):not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-error-hover-trailing-icon-color, var(--mat-app-on-error-container))}.mat-form-field-invalid.mat-focused .mat-mdc-text-field-wrapper .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-error-focus-trailing-icon-color, var(--mat-app-error))}.mat-mdc-form-field-icon-prefix,[dir=rtl] .mat-mdc-form-field-icon-suffix{padding:0 4px 0 0}.mat-mdc-form-field-icon-suffix,[dir=rtl] .mat-mdc-form-field-icon-prefix{padding:0 0 0 4px}.mat-mdc-form-field-subscript-wrapper .mat-icon,.mat-mdc-form-field label .mat-icon{width:1em;height:1em;font-size:inherit}.mat-mdc-form-field-infix{flex:auto;min-width:0;width:180px;position:relative;box-sizing:border-box}.mat-mdc-form-field-infix:has(textarea[cols]){width:auto}.mat-mdc-form-field .mdc-notched-outline__notch{margin-left:-1px;-webkit-clip-path:inset(-9em -999em -9em 1px);clip-path:inset(-9em -999em -9em 1px)}[dir=rtl] .mat-mdc-form-field .mdc-notched-outline__notch{margin-left:0;margin-right:-1px;-webkit-clip-path:inset(-9em 1px -9em -999em);clip-path:inset(-9em 1px -9em -999em)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-floating-label{transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1),color 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input{transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input::placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input::-moz-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input::-webkit-input-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input:-ms-input-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input::placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input::placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input::-moz-placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field--filled:not(.mdc-ripple-upgraded):focus .mdc-text-field__ripple::before{transition-duration:75ms}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-line-ripple::after{transition:transform 180ms cubic-bezier(0.4, 0, 0.2, 1),opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-notched-outline .mdc-floating-label{max-width:calc(100% + 1px)}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:calc(133.3333333333% + 1px)}"], dependencies: [{ kind: "directive", type: MatFormFieldFloatingLabel, selector: "label[matFormFieldFloatingLabel]", inputs: ["floating", "monitorResize"] }, { kind: "component", type: MatFormFieldNotchedOutline, selector: "div[matFormFieldNotchedOutline]", inputs: ["matFormFieldNotchedOutlineOpen"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: MatFormFieldLineRipple, selector: "div[matFormFieldLineRipple]" }, { kind: "directive", type: MatHint, selector: "mat-hint", inputs: ["align", "id"] }], animations: [matFormFieldAnimations.transitionMessages], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormField, decorators: [{
            type: Component,
            args: [{ selector: 'mat-form-field', exportAs: 'matFormField', animations: [matFormFieldAnimations.transitionMessages], host: {
                        'class': 'mat-mdc-form-field',
                        '[class.mat-mdc-form-field-label-always-float]': '_shouldAlwaysFloat()',
                        '[class.mat-mdc-form-field-has-icon-prefix]': '_hasIconPrefix',
                        '[class.mat-mdc-form-field-has-icon-suffix]': '_hasIconSuffix',
                        // Note that these classes reuse the same names as the non-MDC version, because they can be
                        // considered a public API since custom form controls may use them to style themselves.
                        // See https://github.com/angular/components/pull/20502#discussion_r486124901.
                        '[class.mat-form-field-invalid]': '_control.errorState',
                        '[class.mat-form-field-disabled]': '_control.disabled',
                        '[class.mat-form-field-autofilled]': '_control.autofilled',
                        '[class.mat-form-field-no-animations]': '_animationMode === "NoopAnimations"',
                        '[class.mat-form-field-appearance-fill]': 'appearance == "fill"',
                        '[class.mat-form-field-appearance-outline]': 'appearance == "outline"',
                        '[class.mat-form-field-hide-placeholder]': '_hasFloatingLabel() && !_shouldLabelFloat()',
                        '[class.mat-focused]': '_control.focused',
                        '[class.mat-primary]': 'color !== "accent" && color !== "warn"',
                        '[class.mat-accent]': 'color === "accent"',
                        '[class.mat-warn]': 'color === "warn"',
                        '[class.ng-untouched]': '_shouldForward("untouched")',
                        '[class.ng-touched]': '_shouldForward("touched")',
                        '[class.ng-pristine]': '_shouldForward("pristine")',
                        '[class.ng-dirty]': '_shouldForward("dirty")',
                        '[class.ng-valid]': '_shouldForward("valid")',
                        '[class.ng-invalid]': '_shouldForward("invalid")',
                        '[class.ng-pending]': '_shouldForward("pending")',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, providers: [
                        { provide: MAT_FORM_FIELD, useExisting: MatFormField },
                        { provide: FLOATING_LABEL_PARENT, useExisting: MatFormField },
                    ], standalone: true, imports: [
                        MatFormFieldFloatingLabel,
                        MatFormFieldNotchedOutline,
                        NgTemplateOutlet,
                        MatFormFieldLineRipple,
                        MatHint,
                    ], template: "<ng-template #labelTemplate>\n  <!--\n    MDC recommends that the text-field is a `<label>` element. This rather complicates the\n    setup because it would require every form-field control to explicitly set `aria-labelledby`.\n    This is because the `<label>` itself contains more than the actual label (e.g. prefix, suffix\n    or other projected content), and screen readers could potentially read out undesired content.\n    Excluding elements from being printed out requires them to be marked with `aria-hidden`, or\n    the form control is set to a scoped element for the label (using `aria-labelledby`). Both of\n    these options seem to complicate the setup because we know exactly what content is rendered\n    as part of the label, and we don't want to spend resources on walking through projected content\n    to set `aria-hidden`. Nor do we want to set `aria-labelledby` on every form control if we could\n    simply link the label to the control using the label `for` attribute.\n  -->\n  @if (_hasFloatingLabel()) {\n    <label\n      matFormFieldFloatingLabel\n      [floating]=\"_shouldLabelFloat()\"\n      [monitorResize]=\"_hasOutline()\"\n      [id]=\"_labelId\"\n      [attr.for]=\"_control.disableAutomaticLabeling ? null : _control.id\"\n    >\n      <ng-content select=\"mat-label\"></ng-content>\n      <!--\n        We set the required marker as a separate element, in order to make it easier to target if\n        apps want to override it and to be able to set `aria-hidden` so that screen readers don't\n        pick it up.\n       -->\n      @if (!hideRequiredMarker && _control.required) {\n        <span\n          aria-hidden=\"true\"\n          class=\"mat-mdc-form-field-required-marker mdc-floating-label--required\"\n        ></span>\n      }\n    </label>\n  }\n</ng-template>\n\n<div\n  class=\"mat-mdc-text-field-wrapper mdc-text-field\"\n  #textField\n  [class.mdc-text-field--filled]=\"!_hasOutline()\"\n  [class.mdc-text-field--outlined]=\"_hasOutline()\"\n  [class.mdc-text-field--no-label]=\"!_hasFloatingLabel()\"\n  [class.mdc-text-field--disabled]=\"_control.disabled\"\n  [class.mdc-text-field--invalid]=\"_control.errorState\"\n  (click)=\"_control.onContainerClick($event)\"\n>\n  @if (!_hasOutline() && !_control.disabled) {\n    <div class=\"mat-mdc-form-field-focus-overlay\"></div>\n  }\n  <div class=\"mat-mdc-form-field-flex\">\n    @if (_hasOutline()) {\n      <div matFormFieldNotchedOutline [matFormFieldNotchedOutlineOpen]=\"_shouldLabelFloat()\">\n        @if (!_forceDisplayInfixLabel()) {\n          <ng-template [ngTemplateOutlet]=\"labelTemplate\"></ng-template>\n        }\n      </div>\n    }\n\n    @if (_hasIconPrefix) {\n      <div class=\"mat-mdc-form-field-icon-prefix\" #iconPrefixContainer>\n        <ng-content select=\"[matPrefix], [matIconPrefix]\"></ng-content>\n      </div>\n    }\n\n    @if (_hasTextPrefix) {\n      <div class=\"mat-mdc-form-field-text-prefix\" #textPrefixContainer>\n        <ng-content select=\"[matTextPrefix]\"></ng-content>\n      </div>\n    }\n\n    <div class=\"mat-mdc-form-field-infix\">\n      @if (!_hasOutline() || _forceDisplayInfixLabel()) {\n        <ng-template [ngTemplateOutlet]=\"labelTemplate\"></ng-template>\n      }\n\n      <ng-content></ng-content>\n    </div>\n\n    @if (_hasTextSuffix) {\n      <div class=\"mat-mdc-form-field-text-suffix\" #textSuffixContainer>\n        <ng-content select=\"[matTextSuffix]\"></ng-content>\n      </div>\n    }\n\n    @if (_hasIconSuffix) {\n      <div class=\"mat-mdc-form-field-icon-suffix\" #iconSuffixContainer>\n        <ng-content select=\"[matSuffix], [matIconSuffix]\"></ng-content>\n      </div>\n    }\n  </div>\n\n  @if (!_hasOutline()) {\n    <div matFormFieldLineRipple></div>\n  }\n</div>\n\n<div\n  class=\"mat-mdc-form-field-subscript-wrapper mat-mdc-form-field-bottom-align\"\n  [class.mat-mdc-form-field-subscript-dynamic-size]=\"subscriptSizing === 'dynamic'\"\n>\n  @switch (_getDisplayedMessages()) {\n    @case ('error') {\n      <div\n        class=\"mat-mdc-form-field-error-wrapper\"\n        [@transitionMessages]=\"_subscriptAnimationState\"\n      >\n        <ng-content select=\"mat-error, [matError]\"></ng-content>\n      </div>\n    }\n\n    @case ('hint') {\n      <div class=\"mat-mdc-form-field-hint-wrapper\" [@transitionMessages]=\"_subscriptAnimationState\">\n        @if (hintLabel) {\n          <mat-hint [id]=\"_hintLabelId\">{{hintLabel}}</mat-hint>\n        }\n        <ng-content select=\"mat-hint:not([align='end'])\"></ng-content>\n        <div class=\"mat-mdc-form-field-hint-spacer\"></div>\n        <ng-content select=\"mat-hint[align='end']\"></ng-content>\n      </div>\n    }\n  }\n</div>\n", styles: [".mdc-text-field{display:inline-flex;align-items:baseline;padding:0 16px;position:relative;box-sizing:border-box;overflow:hidden;will-change:opacity,transform,color;border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0}.mdc-text-field__input{width:100%;min-width:0;border:none;border-radius:0;background:none;padding:0;-moz-appearance:none;-webkit-appearance:none;height:28px}.mdc-text-field__input::-webkit-calendar-picker-indicator{display:none}.mdc-text-field__input::-ms-clear{display:none}.mdc-text-field__input:focus{outline:none}.mdc-text-field__input:invalid{box-shadow:none}.mdc-text-field__input::placeholder{opacity:0}.mdc-text-field__input::-moz-placeholder{opacity:0}.mdc-text-field__input::-webkit-input-placeholder{opacity:0}.mdc-text-field__input:-ms-input-placeholder{opacity:0}.mdc-text-field--no-label .mdc-text-field__input::placeholder,.mdc-text-field--focused .mdc-text-field__input::placeholder{opacity:1}.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder,.mdc-text-field--focused .mdc-text-field__input::-moz-placeholder{opacity:1}.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder,.mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder{opacity:1}.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder,.mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder{opacity:1}.mdc-text-field--outlined .mdc-text-field__input,.mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input{height:100%}.mdc-text-field--outlined .mdc-text-field__input{display:flex;border:none !important;background-color:rgba(0,0,0,0)}.mdc-text-field--disabled .mdc-text-field__input{pointer-events:auto}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input{color:var(--mdc-filled-text-field-input-text-color, var(--mat-app-on-surface));caret-color:var(--mdc-filled-text-field-caret-color, var(--mat-app-primary))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder{color:var(--mdc-filled-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input{caret-color:var(--mdc-filled-text-field-error-caret-color)}.mdc-text-field--filled.mdc-text-field--disabled .mdc-text-field__input{color:var(--mdc-filled-text-field-disabled-input-text-color)}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input{color:var(--mdc-outlined-text-field-input-text-color, var(--mat-app-on-surface));caret-color:var(--mdc-outlined-text-field-caret-color, var(--mat-app-primary))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder{color:var(--mdc-outlined-text-field-input-text-placeholder-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input{caret-color:var(--mdc-outlined-text-field-error-caret-color)}.mdc-text-field--outlined.mdc-text-field--disabled .mdc-text-field__input{color:var(--mdc-outlined-text-field-disabled-input-text-color)}.mdc-text-field--disabled .cdk-high-contrast-active .mdc-text-field__input{background-color:Window}.mdc-text-field--filled{height:56px;border-bottom-right-radius:0;border-bottom-left-radius:0;border-top-left-radius:var(--mdc-filled-text-field-container-shape, var(--mat-app-corner-extra-small-top));border-top-right-radius:var(--mdc-filled-text-field-container-shape, var(--mat-app-corner-extra-small-top))}.mdc-text-field--filled:not(.mdc-text-field--disabled){background-color:var(--mdc-filled-text-field-container-color, var(--mat-app-surface-variant))}.mdc-text-field--filled.mdc-text-field--disabled{background-color:var(--mdc-filled-text-field-disabled-container-color)}.mdc-text-field--outlined{height:56px;overflow:visible;padding-right:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)));padding-left:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)) + 4px)}[dir=rtl] .mdc-text-field--outlined{padding-right:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)) + 4px);padding-left:max(16px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)))}.mdc-floating-label{position:absolute;left:0;transform-origin:left top;line-height:1.15rem;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:text;overflow:hidden;will-change:transform}[dir=rtl] .mdc-floating-label{right:0;left:auto;transform-origin:right top;text-align:right}.mdc-text-field .mdc-floating-label{top:50%;transform:translateY(-50%);pointer-events:none}.mdc-notched-outline .mdc-floating-label{display:inline-block;position:relative;max-width:100%}.mdc-text-field--outlined .mdc-floating-label{left:4px;right:auto}[dir=rtl] .mdc-text-field--outlined .mdc-floating-label{left:auto;right:4px}.mdc-text-field--filled .mdc-floating-label{left:16px;right:auto}[dir=rtl] .mdc-text-field--filled .mdc-floating-label{left:auto;right:16px}.mdc-text-field--disabled .mdc-floating-label{cursor:default}.cdk-high-contrast-active .mdc-text-field--disabled .mdc-floating-label{z-index:1}.mdc-text-field--filled.mdc-text-field--no-label .mdc-floating-label{display:none}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-floating-label{color:var(--mdc-filled-text-field-label-text-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label{color:var(--mdc-filled-text-field-focus-label-text-color, var(--mat-app-primary))}.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label{color:var(--mdc-filled-text-field-hover-label-text-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled.mdc-text-field--disabled .mdc-floating-label{color:var(--mdc-filled-text-field-disabled-label-text-color)}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label{color:var(--mdc-filled-text-field-error-label-text-color, var(--mat-app-error))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label{color:var(--mdc-filled-text-field-error-focus-label-text-color, var(--mat-app-error))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label{color:var(--mdc-filled-text-field-error-hover-label-text-color, var(--mat-app-on-error-container))}.mdc-text-field--filled .mdc-floating-label{font-family:var(--mdc-filled-text-field-label-text-font, var(--mat-app-body-large-font));font-size:var(--mdc-filled-text-field-label-text-size, var(--mat-app-body-large-size));font-weight:var(--mdc-filled-text-field-label-text-weight, var(--mat-app-body-large-weight));letter-spacing:var(--mdc-filled-text-field-label-text-tracking, var(--mat-app-body-large-tracking))}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-floating-label{color:var(--mdc-outlined-text-field-label-text-color, var(--mat-app-on-surface-variant))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label{color:var(--mdc-outlined-text-field-focus-label-text-color, var(--mat-app-primary))}.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label{color:var(--mdc-outlined-text-field-hover-label-text-color, var(--mat-app-on-surface))}.mdc-text-field--outlined.mdc-text-field--disabled .mdc-floating-label{color:var(--mdc-outlined-text-field-disabled-label-text-color)}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label{color:var(--mdc-outlined-text-field-error-label-text-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label{color:var(--mdc-outlined-text-field-error-focus-label-text-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label{color:var(--mdc-outlined-text-field-error-hover-label-text-color, var(--mat-app-on-error-container))}.mdc-text-field--outlined .mdc-floating-label{font-family:var(--mdc-outlined-text-field-label-text-font, var(--mat-app-body-large-font));font-size:var(--mdc-outlined-text-field-label-text-size, var(--mat-app-body-large-size));font-weight:var(--mdc-outlined-text-field-label-text-weight, var(--mat-app-body-large-weight));letter-spacing:var(--mdc-outlined-text-field-label-text-tracking, var(--mat-app-body-large-tracking))}.mdc-floating-label--float-above{cursor:auto;transform:translateY(-106%) scale(0.75)}.mdc-text-field--filled .mdc-floating-label--float-above{transform:translateY(-106%) scale(0.75)}.mdc-text-field--outlined .mdc-floating-label--float-above{transform:translateY(-37.25px) scale(1);font-size:.75rem}.mdc-notched-outline .mdc-floating-label--float-above{text-overflow:clip}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:133.3333333333%}.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) scale(0.75)}.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after{margin-left:1px;margin-right:0;content:\"*\"}[dir=rtl] .mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after{margin-left:0;margin-right:1px}.mdc-notched-outline{display:flex;position:absolute;top:0;right:0;left:0;box-sizing:border-box;width:100%;max-width:100%;height:100%;text-align:left;pointer-events:none}[dir=rtl] .mdc-notched-outline{text-align:right}.mdc-text-field--outlined .mdc-notched-outline{z-index:1}.mat-mdc-notch-piece{box-sizing:border-box;height:100%;pointer-events:none;border-top:1px solid;border-bottom:1px solid}.mdc-text-field--focused .mat-mdc-notch-piece{border-width:2px}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-outline-color, var(--mat-app-outline));border-width:var(--mdc-outlined-text-field-outline-width)}.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-hover-outline-color, var(--mat-app-on-surface))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-focus-outline-color, var(--mat-app-primary))}.mdc-text-field--outlined.mdc-text-field--disabled .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-disabled-outline-color)}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-error-outline-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-notched-outline .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-error-hover-outline-color, var(--mat-app-on-error-container))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mat-mdc-notch-piece{border-color:var(--mdc-outlined-text-field-error-focus-outline-color, var(--mat-app-error))}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline .mat-mdc-notch-piece{border-width:var(--mdc-outlined-text-field-focus-outline-width)}.mdc-notched-outline__leading{border-left:1px solid;border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;border-top-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading{width:max(12px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)))}[dir=rtl] .mdc-notched-outline__leading{border-left:none;border-right:1px solid;border-bottom-left-radius:0;border-top-left-radius:0;border-top-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}.mdc-notched-outline__trailing{flex-grow:1;border-left:none;border-right:1px solid;border-top-left-radius:0;border-bottom-left-radius:0;border-top-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-right-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}[dir=rtl] .mdc-notched-outline__trailing{border-left:1px solid;border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;border-top-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small));border-bottom-left-radius:var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small))}.mdc-notched-outline__notch{flex:0 0 auto;width:auto}.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch{max-width:min(var(--mat-form-field-notch-max-width, 100%),100% - max(12px,var(--mdc-outlined-text-field-container-shape, var(--mat-app-corner-extra-small)))*2)}.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:1px}.mdc-text-field--focused.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:2px}.mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:0;padding-right:8px;border-top:none;--mat-form-field-notch-max-width: 100%}[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:8px;padding-right:0}.mdc-notched-outline--no-label .mdc-notched-outline__notch{display:none}.mdc-line-ripple::before,.mdc-line-ripple::after{position:absolute;bottom:0;left:0;width:100%;border-bottom-style:solid;content:\"\"}.mdc-line-ripple::before{z-index:1;border-bottom-width:var(--mdc-filled-text-field-active-indicator-height)}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-active-indicator-color, var(--mat-app-on-surface-variant))}.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-hover-active-indicator-color, var(--mat-app-on-surface))}.mdc-text-field--filled.mdc-text-field--disabled .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-disabled-active-indicator-color)}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-error-active-indicator-color, var(--mat-app-error))}.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-line-ripple::before{border-bottom-color:var(--mdc-filled-text-field-error-hover-active-indicator-color, var(--mat-app-on-error-container))}.mdc-line-ripple::after{transform:scaleX(0);opacity:0;z-index:2}.mdc-text-field--filled .mdc-line-ripple::after{border-bottom-width:var(--mdc-filled-text-field-focus-active-indicator-height)}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::after{border-bottom-color:var(--mdc-filled-text-field-focus-active-indicator-color, var(--mat-app-primary))}.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::after{border-bottom-color:var(--mdc-filled-text-field-error-focus-active-indicator-color, var(--mat-app-error))}.mdc-line-ripple--active::after{transform:scaleX(1);opacity:1}.mdc-line-ripple--deactivating::after{opacity:0}.mdc-text-field--disabled{pointer-events:none}.mat-mdc-form-field-textarea-control{vertical-align:middle;resize:vertical;box-sizing:border-box;height:auto;margin:0;padding:0;border:none;overflow:auto}.mat-mdc-form-field-input-control.mat-mdc-form-field-input-control{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font:inherit;letter-spacing:inherit;text-decoration:inherit;text-transform:inherit;border:none}.mat-mdc-form-field .mat-mdc-floating-label.mdc-floating-label{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;line-height:normal;pointer-events:all;will-change:auto}.mat-mdc-form-field:not(.mat-form-field-disabled) .mat-mdc-floating-label.mdc-floating-label{cursor:inherit}.mdc-text-field--no-label:not(.mdc-text-field--textarea) .mat-mdc-form-field-input-control.mdc-text-field__input,.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control{height:auto}.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control.mdc-text-field__input[type=color]{height:23px}.mat-mdc-text-field-wrapper{height:auto;flex:auto;will-change:auto}.mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper{padding-left:0;--mat-mdc-form-field-label-offset-x: -16px}.mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper{padding-right:0}[dir=rtl] .mat-mdc-text-field-wrapper{padding-left:16px;padding-right:16px}[dir=rtl] .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper{padding-left:0}[dir=rtl] .mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper{padding-right:0}.mat-form-field-disabled .mdc-text-field__input::placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-form-field-disabled .mdc-text-field__input::-moz-placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-form-field-disabled .mdc-text-field__input::-webkit-input-placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-form-field-disabled .mdc-text-field__input:-ms-input-placeholder{color:var(--mat-form-field-disabled-input-text-placeholder-color)}.mat-mdc-form-field-label-always-float .mdc-text-field__input::placeholder{transition-delay:40ms;transition-duration:110ms;opacity:1}.mat-mdc-text-field-wrapper .mat-mdc-form-field-infix .mat-mdc-floating-label{left:auto;right:auto}.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-text-field__input{display:inline-block}.mat-mdc-form-field .mat-mdc-text-field-wrapper.mdc-text-field .mdc-notched-outline__notch{padding-top:0}.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch{border-left:1px solid rgba(0,0,0,0)}[dir=rtl] .mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch{border-left:none;border-right:1px solid rgba(0,0,0,0)}.mat-mdc-form-field-infix{min-height:var(--mat-form-field-container-height);padding-top:var(--mat-form-field-filled-with-label-container-padding-top);padding-bottom:var(--mat-form-field-filled-with-label-container-padding-bottom)}.mdc-text-field--outlined .mat-mdc-form-field-infix,.mdc-text-field--no-label .mat-mdc-form-field-infix{padding-top:var(--mat-form-field-container-vertical-padding);padding-bottom:var(--mat-form-field-container-vertical-padding)}.mat-mdc-text-field-wrapper .mat-mdc-form-field-flex .mat-mdc-floating-label{top:calc(var(--mat-form-field-container-height)/2)}.mdc-text-field--filled .mat-mdc-floating-label{display:var(--mat-form-field-filled-label-display, block)}.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{--mat-mdc-form-field-label-transform: translateY(calc(calc(6.75px + var(--mat-form-field-container-height) / 2) * -1)) scale(var(--mat-mdc-form-field-floating-label-scale, 0.75));transform:var(--mat-mdc-form-field-label-transform)}.mat-mdc-form-field-subscript-wrapper{box-sizing:border-box;width:100%;position:relative}.mat-mdc-form-field-hint-wrapper,.mat-mdc-form-field-error-wrapper{position:absolute;top:0;left:0;right:0;padding:0 16px}.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-hint-wrapper,.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-error-wrapper{position:static}.mat-mdc-form-field-bottom-align::before{content:\"\";display:inline-block;height:16px}.mat-mdc-form-field-bottom-align.mat-mdc-form-field-subscript-dynamic-size::before{content:unset}.mat-mdc-form-field-hint-end{order:1}.mat-mdc-form-field-hint-wrapper{display:flex}.mat-mdc-form-field-hint-spacer{flex:1 0 1em}.mat-mdc-form-field-error{display:block;color:var(--mat-form-field-error-text-color, var(--mat-app-error))}.mat-mdc-form-field-subscript-wrapper,.mat-mdc-form-field-bottom-align::before{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:var(--mat-form-field-subscript-text-font, var(--mat-app-body-small-font));line-height:var(--mat-form-field-subscript-text-line-height, var(--mat-app-body-small-line-height));font-size:var(--mat-form-field-subscript-text-size, var(--mat-app-body-small-size));letter-spacing:var(--mat-form-field-subscript-text-tracking, var(--mat-app-body-small-tracking));font-weight:var(--mat-form-field-subscript-text-weight, var(--mat-app-body-small-weight))}.mat-mdc-form-field-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;opacity:0;pointer-events:none;background-color:var(--mat-form-field-state-layer-color, var(--mat-app-on-surface))}.mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-focus-overlay{opacity:var(--mat-form-field-hover-state-layer-opacity, var(--mat-app-hover-state-layer-opacity))}.mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay{opacity:var(--mat-form-field-focus-state-layer-opacity)}select.mat-mdc-form-field-input-control{-moz-appearance:none;-webkit-appearance:none;background-color:rgba(0,0,0,0);display:inline-flex;box-sizing:border-box}select.mat-mdc-form-field-input-control:not(:disabled){cursor:pointer}select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option{color:var(--mat-form-field-select-option-text-color)}select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled{color:var(--mat-form-field-select-disabled-option-text-color)}.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after{content:\"\";width:0;height:0;border-left:5px solid rgba(0,0,0,0);border-right:5px solid rgba(0,0,0,0);border-top:5px solid;position:absolute;right:0;top:50%;margin-top:-2.5px;pointer-events:none;color:var(--mat-form-field-enabled-select-arrow-color, var(--mat-app-on-surface-variant))}[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after{right:auto;left:0}.mat-mdc-form-field-type-mat-native-select.mat-focused .mat-mdc-form-field-infix::after{color:var(--mat-form-field-focus-select-arrow-color, var(--mat-app-primary))}.mat-mdc-form-field-type-mat-native-select.mat-form-field-disabled .mat-mdc-form-field-infix::after{color:var(--mat-form-field-disabled-select-arrow-color)}.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control{padding-right:15px}[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control{padding-right:0;padding-left:15px}.cdk-high-contrast-active .mat-form-field-appearance-fill .mat-mdc-text-field-wrapper{outline:solid 1px}.cdk-high-contrast-active .mat-form-field-appearance-fill.mat-form-field-disabled .mat-mdc-text-field-wrapper{outline-color:GrayText}.cdk-high-contrast-active .mat-form-field-appearance-fill.mat-focused .mat-mdc-text-field-wrapper{outline:dashed 3px}.cdk-high-contrast-active .mat-mdc-form-field.mat-focused .mdc-notched-outline{border:dashed 3px}.mat-mdc-form-field-input-control[type=date],.mat-mdc-form-field-input-control[type=datetime],.mat-mdc-form-field-input-control[type=datetime-local],.mat-mdc-form-field-input-control[type=month],.mat-mdc-form-field-input-control[type=week],.mat-mdc-form-field-input-control[type=time]{line-height:1}.mat-mdc-form-field-input-control::-webkit-datetime-edit{line-height:1;padding:0;margin-bottom:-2px}.mat-mdc-form-field{--mat-mdc-form-field-floating-label-scale: 0.75;display:inline-flex;flex-direction:column;min-width:0;text-align:left;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:var(--mat-form-field-container-text-font, var(--mat-app-body-large-font));line-height:var(--mat-form-field-container-text-line-height, var(--mat-app-body-large-line-height));font-size:var(--mat-form-field-container-text-size, var(--mat-app-body-large-size));letter-spacing:var(--mat-form-field-container-text-tracking, var(--mat-app-body-large-tracking));font-weight:var(--mat-form-field-container-text-weight, var(--mat-app-body-large-weight))}[dir=rtl] .mat-mdc-form-field{text-align:right}.mat-mdc-form-field .mdc-text-field--outlined .mdc-floating-label--float-above{font-size:calc(var(--mat-form-field-outlined-label-text-populated-size)*var(--mat-mdc-form-field-floating-label-scale))}.mat-mdc-form-field .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:var(--mat-form-field-outlined-label-text-populated-size)}.mat-mdc-form-field-flex{display:inline-flex;align-items:baseline;box-sizing:border-box;width:100%}.mat-mdc-text-field-wrapper{width:100%;z-index:0}.mat-mdc-form-field-icon-prefix,.mat-mdc-form-field-icon-suffix{align-self:center;line-height:0;pointer-events:auto;position:relative;z-index:1}.mat-mdc-form-field-icon-prefix>.mat-icon,.mat-mdc-form-field-icon-suffix>.mat-icon{padding:0 12px;box-sizing:content-box}.mat-mdc-form-field-icon-prefix{color:var(--mat-form-field-leading-icon-color, var(--mat-app-on-surface-variant))}.mat-form-field-disabled .mat-mdc-form-field-icon-prefix{color:var(--mat-form-field-disabled-leading-icon-color)}.mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-trailing-icon-color, var(--mat-app-on-surface-variant))}.mat-form-field-disabled .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-disabled-trailing-icon-color)}.mat-form-field-invalid .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-error-trailing-icon-color, var(--mat-app-error))}.mat-form-field-invalid:not(.mat-focused):not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-error-hover-trailing-icon-color, var(--mat-app-on-error-container))}.mat-form-field-invalid.mat-focused .mat-mdc-text-field-wrapper .mat-mdc-form-field-icon-suffix{color:var(--mat-form-field-error-focus-trailing-icon-color, var(--mat-app-error))}.mat-mdc-form-field-icon-prefix,[dir=rtl] .mat-mdc-form-field-icon-suffix{padding:0 4px 0 0}.mat-mdc-form-field-icon-suffix,[dir=rtl] .mat-mdc-form-field-icon-prefix{padding:0 0 0 4px}.mat-mdc-form-field-subscript-wrapper .mat-icon,.mat-mdc-form-field label .mat-icon{width:1em;height:1em;font-size:inherit}.mat-mdc-form-field-infix{flex:auto;min-width:0;width:180px;position:relative;box-sizing:border-box}.mat-mdc-form-field-infix:has(textarea[cols]){width:auto}.mat-mdc-form-field .mdc-notched-outline__notch{margin-left:-1px;-webkit-clip-path:inset(-9em -999em -9em 1px);clip-path:inset(-9em -999em -9em 1px)}[dir=rtl] .mat-mdc-form-field .mdc-notched-outline__notch{margin-left:0;margin-right:-1px;-webkit-clip-path:inset(-9em 1px -9em -999em);clip-path:inset(-9em 1px -9em -999em)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-floating-label{transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1),color 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input{transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input::placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input::-moz-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input::-webkit-input-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field__input:-ms-input-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input::placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input::placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input::-moz-placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder,.mat-mdc-form-field:not(.mat-form-field-no-animations).mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder{transition-delay:40ms;transition-duration:110ms}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-text-field--filled:not(.mdc-ripple-upgraded):focus .mdc-text-field__ripple::before{transition-duration:75ms}.mat-mdc-form-field:not(.mat-form-field-no-animations) .mdc-line-ripple::after{transition:transform 180ms cubic-bezier(0.4, 0, 0.2, 1),opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-notched-outline .mdc-floating-label{max-width:calc(100% + 1px)}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:calc(133.3333333333% + 1px)}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: i1.Directionality }, { type: i2.Platform }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_FORM_FIELD_DEFAULT_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }], propDecorators: { _textField: [{
                type: ViewChild,
                args: ['textField']
            }], _iconPrefixContainer: [{
                type: ViewChild,
                args: ['iconPrefixContainer']
            }], _textPrefixContainer: [{
                type: ViewChild,
                args: ['textPrefixContainer']
            }], _iconSuffixContainer: [{
                type: ViewChild,
                args: ['iconSuffixContainer']
            }], _textSuffixContainer: [{
                type: ViewChild,
                args: ['textSuffixContainer']
            }], _floatingLabel: [{
                type: ViewChild,
                args: [MatFormFieldFloatingLabel]
            }], _notchedOutline: [{
                type: ViewChild,
                args: [MatFormFieldNotchedOutline]
            }], _lineRipple: [{
                type: ViewChild,
                args: [MatFormFieldLineRipple]
            }], _formFieldControl: [{
                type: ContentChild,
                args: [MatFormFieldControl]
            }], _prefixChildren: [{
                type: ContentChildren,
                args: [MAT_PREFIX, { descendants: true }]
            }], _suffixChildren: [{
                type: ContentChildren,
                args: [MAT_SUFFIX, { descendants: true }]
            }], _errorChildren: [{
                type: ContentChildren,
                args: [MAT_ERROR, { descendants: true }]
            }], _hintChildren: [{
                type: ContentChildren,
                args: [MatHint, { descendants: true }]
            }], hideRequiredMarker: [{
                type: Input
            }], color: [{
                type: Input
            }], floatLabel: [{
                type: Input
            }], appearance: [{
                type: Input
            }], subscriptSizing: [{
                type: Input
            }], hintLabel: [{
                type: Input
            }] } });

class MatFormFieldModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldModule, imports: [MatCommonModule,
            CommonModule,
            ObserversModule,
            MatFormField,
            MatLabel,
            MatError,
            MatHint,
            MatPrefix,
            MatSuffix], exports: [MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldModule, imports: [MatCommonModule,
            CommonModule,
            ObserversModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatFormFieldModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        CommonModule,
                        ObserversModule,
                        MatFormField,
                        MatLabel,
                        MatError,
                        MatHint,
                        MatPrefix,
                        MatSuffix,
                    ],
                    exports: [MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix, MatCommonModule],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { MAT_ERROR, MAT_FORM_FIELD, MAT_FORM_FIELD_DEFAULT_OPTIONS, MAT_PREFIX, MAT_SUFFIX, MatError, MatFormField, MatFormFieldControl, MatFormFieldModule, MatHint, MatLabel, MatPrefix, MatSuffix, getMatFormFieldDuplicatedHintError, getMatFormFieldMissingControlError, getMatFormFieldPlaceholderConflictError, matFormFieldAnimations };
//# sourceMappingURL=form-field.mjs.map
