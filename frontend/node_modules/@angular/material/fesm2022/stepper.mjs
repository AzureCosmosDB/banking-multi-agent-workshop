import { TemplatePortal, CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { CdkStepLabel, CdkStepHeader, CdkStep, STEPPER_GLOBAL_OPTIONS, CdkStepper, CdkStepperNext, CdkStepperPrevious, CdkStepperModule } from '@angular/cdk/stepper';
import { NgTemplateOutlet, CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { Directive, Injectable, Optional, SkipSelf, Component, ViewEncapsulation, ChangeDetectionStrategy, Input, forwardRef, Inject, ContentChild, QueryList, EventEmitter, inject, ViewChildren, ContentChildren, Output, NgModule } from '@angular/core';
import * as i1 from '@angular/material/core';
import { MatRipple, ErrorStateMatcher, MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import * as i2 from '@angular/cdk/a11y';
import { Subject, Subscription } from 'rxjs';
import * as i2$1 from '@angular/cdk/bidi';
import { switchMap, map, startWith, takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, group, animate, query, animateChild } from '@angular/animations';
import { Platform } from '@angular/cdk/platform';

class MatStepLabel extends CdkStepLabel {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepLabel, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepLabel, isStandalone: true, selector: "[matStepLabel]", usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matStepLabel]',
                    standalone: true,
                }]
        }] });

/** Stepper data that is required for internationalization. */
class MatStepperIntl {
    constructor() {
        /**
         * Stream that emits whenever the labels here are changed. Use this to notify
         * components if the labels have changed after initialization.
         */
        this.changes = new Subject();
        /** Label that is rendered below optional steps. */
        this.optionalLabel = 'Optional';
        /** Label that is used to indicate step as completed to screen readers. */
        this.completedLabel = 'Completed';
        /** Label that is used to indicate step as editable to screen readers. */
        this.editableLabel = 'Editable';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIntl, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIntl, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIntl, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/** @docs-private */
function MAT_STEPPER_INTL_PROVIDER_FACTORY(parentIntl) {
    return parentIntl || new MatStepperIntl();
}
/** @docs-private */
const MAT_STEPPER_INTL_PROVIDER = {
    provide: MatStepperIntl,
    deps: [[new Optional(), new SkipSelf(), MatStepperIntl]],
    useFactory: MAT_STEPPER_INTL_PROVIDER_FACTORY,
};

class MatStepHeader extends CdkStepHeader {
    constructor(_intl, _focusMonitor, _elementRef, changeDetectorRef) {
        super(_elementRef);
        this._intl = _intl;
        this._focusMonitor = _focusMonitor;
        this._intlSubscription = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
    }
    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true);
    }
    ngOnDestroy() {
        this._intlSubscription.unsubscribe();
        this._focusMonitor.stopMonitoring(this._elementRef);
    }
    /** Focuses the step header. */
    focus(origin, options) {
        if (origin) {
            this._focusMonitor.focusVia(this._elementRef, origin, options);
        }
        else {
            this._elementRef.nativeElement.focus(options);
        }
    }
    /** Returns string label of given step if it is a text label. */
    _stringLabel() {
        return this.label instanceof MatStepLabel ? null : this.label;
    }
    /** Returns MatStepLabel if the label of given step is a template label. */
    _templateLabel() {
        return this.label instanceof MatStepLabel ? this.label : null;
    }
    /** Returns the host HTML element. */
    _getHostElement() {
        return this._elementRef.nativeElement;
    }
    /** Template context variables that are exposed to the `matStepperIcon` instances. */
    _getIconContext() {
        return {
            index: this.index,
            active: this.active,
            optional: this.optional,
        };
    }
    _getDefaultTextForState(state) {
        if (state == 'number') {
            return `${this.index + 1}`;
        }
        if (state == 'edit') {
            return 'create';
        }
        if (state == 'error') {
            return 'warning';
        }
        return state;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepHeader, deps: [{ token: MatStepperIntl }, { token: i2.FocusMonitor }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatStepHeader, isStandalone: true, selector: "mat-step-header", inputs: { state: "state", label: "label", errorMessage: "errorMessage", iconOverrides: "iconOverrides", index: "index", selected: "selected", active: "active", optional: "optional", disableRipple: "disableRipple", color: "color" }, host: { attributes: { "role": "tab" }, properties: { "class": "\"mat-\" + (color || \"primary\")" }, classAttribute: "mat-step-header" }, usesInheritance: true, ngImport: i0, template: "<div class=\"mat-step-header-ripple mat-focus-indicator\" matRipple\n     [matRippleTrigger]=\"_getHostElement()\"\n     [matRippleDisabled]=\"disableRipple\"></div>\n\n<div class=\"mat-step-icon-state-{{state}} mat-step-icon\" [class.mat-step-icon-selected]=\"selected\">\n  <div class=\"mat-step-icon-content\">\n    @if (iconOverrides && iconOverrides[state]) {\n      <ng-container\n        [ngTemplateOutlet]=\"iconOverrides[state]\"\n        [ngTemplateOutletContext]=\"_getIconContext()\"></ng-container>\n    } @else {\n      @switch (state) {\n        @case ('number') {\n          <span aria-hidden=\"true\">{{_getDefaultTextForState(state)}}</span>\n        }\n\n        @default {\n          @if (state === 'done') {\n            <span class=\"cdk-visually-hidden\">{{_intl.completedLabel}}</span>\n          } @else if (state === 'edit') {\n            <span class=\"cdk-visually-hidden\">{{_intl.editableLabel}}</span>\n          }\n\n          <mat-icon aria-hidden=\"true\">{{_getDefaultTextForState(state)}}</mat-icon>\n        }\n      }\n    }\n  </div>\n</div>\n<div class=\"mat-step-label\"\n     [class.mat-step-label-active]=\"active\"\n     [class.mat-step-label-selected]=\"selected\"\n     [class.mat-step-label-error]=\"state == 'error'\">\n  @if (_templateLabel(); as templateLabel) {\n    <!-- If there is a label template, use it. -->\n    <div class=\"mat-step-text-label\">\n      <ng-container [ngTemplateOutlet]=\"templateLabel.template\"></ng-container>\n    </div>\n  } @else if (_stringLabel()) {\n    <!-- If there is no label template, fall back to the text label. -->\n    <div class=\"mat-step-text-label\">{{label}}</div>\n  }\n\n  @if (optional && state != 'error') {\n    <div class=\"mat-step-optional\">{{_intl.optionalLabel}}</div>\n  }\n\n  @if (state === 'error') {\n    <div class=\"mat-step-sub-label-error\">{{errorMessage}}</div>\n  }\n</div>\n\n", styles: [".mat-step-header{overflow:hidden;outline:none;cursor:pointer;position:relative;box-sizing:content-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-step-header:focus .mat-focus-indicator::before{content:\"\"}.mat-step-header:hover[aria-disabled=true]{cursor:default}.mat-step-header:hover:not([aria-disabled]),.mat-step-header:hover[aria-disabled=false]{background-color:var(--mat-stepper-header-hover-state-layer-color);border-radius:var(--mat-stepper-header-hover-state-layer-shape, var(--mat-app-corner-medium))}.mat-step-header.cdk-keyboard-focused,.mat-step-header.cdk-program-focused{background-color:var(--mat-stepper-header-focus-state-layer-color);border-radius:var(--mat-stepper-header-focus-state-layer-shape, var(--mat-app-corner-medium))}@media(hover: none){.mat-step-header:hover{background:none}}.cdk-high-contrast-active .mat-step-header{outline:solid 1px}.cdk-high-contrast-active .mat-step-header[aria-selected=true] .mat-step-label{text-decoration:underline}.cdk-high-contrast-active .mat-step-header[aria-disabled=true]{outline-color:GrayText}.cdk-high-contrast-active .mat-step-header[aria-disabled=true] .mat-step-label,.cdk-high-contrast-active .mat-step-header[aria-disabled=true] .mat-step-icon,.cdk-high-contrast-active .mat-step-header[aria-disabled=true] .mat-step-optional{color:GrayText}.mat-step-optional{font-size:12px;color:var(--mat-stepper-header-optional-label-text-color, var(--mat-app-on-surface-variant))}.mat-step-sub-label-error{font-size:12px;font-weight:normal}.mat-step-icon{border-radius:50%;height:24px;width:24px;flex-shrink:0;position:relative;color:var(--mat-stepper-header-icon-foreground-color, var(--mat-app-surface));background-color:var(--mat-stepper-header-icon-background-color, var(--mat-app-on-surface-variant))}.mat-step-icon-content{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:flex}.mat-step-icon .mat-icon{font-size:16px;height:16px;width:16px}.mat-step-icon-state-error{background-color:var(--mat-stepper-header-error-state-icon-background-color);color:var(--mat-stepper-header-error-state-icon-foreground-color, var(--mat-app-error))}.mat-step-icon-state-error .mat-icon{font-size:24px;height:24px;width:24px}.mat-step-label{display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px;vertical-align:middle;font-family:var(--mat-stepper-header-label-text-font, var(--mat-app-title-small-font));font-size:var(--mat-stepper-header-label-text-size, var(--mat-app-title-small-size));font-weight:var(--mat-stepper-header-label-text-weight, var(--mat-app-title-small-weight));color:var(--mat-stepper-header-label-text-color, var(--mat-app-on-surface-variant))}.mat-step-label.mat-step-label-active{color:var(--mat-stepper-header-selected-state-label-text-color, var(--mat-app-on-surface-variant))}.mat-step-label.mat-step-label-error{color:var(--mat-stepper-header-error-state-label-text-color, var(--mat-app-error));font-size:var(--mat-stepper-header-error-state-label-text-size, var(--mat-app-title-small-size))}.mat-step-label.mat-step-label-selected{font-size:var(--mat-stepper-header-selected-state-label-text-size, var(--mat-app-title-small-size));font-weight:var(--mat-stepper-header-selected-state-label-text-weight, var(--mat-app-title-small-weight))}.mat-step-text-label{text-overflow:ellipsis;overflow:hidden}.mat-step-header .mat-step-header-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-step-icon-selected{background-color:var(--mat-stepper-header-selected-state-icon-background-color, var(--mat-app-primary));color:var(--mat-stepper-header-selected-state-icon-foreground-color, var(--mat-app-on-primary))}.mat-step-icon-state-done{background-color:var(--mat-stepper-header-done-state-icon-background-color);color:var(--mat-stepper-header-done-state-icon-foreground-color)}.mat-step-icon-state-edit{background-color:var(--mat-stepper-header-edit-state-icon-background-color, var(--mat-app-primary));color:var(--mat-stepper-header-edit-state-icon-foreground-color, var(--mat-app-on-primary))}"], dependencies: [{ kind: "directive", type: MatRipple, selector: "[mat-ripple], [matRipple]", inputs: ["matRippleColor", "matRippleUnbounded", "matRippleCentered", "matRippleRadius", "matRippleAnimation", "matRippleDisabled", "matRippleTrigger"], exportAs: ["matRipple"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepHeader, decorators: [{
            type: Component,
            args: [{ selector: 'mat-step-header', host: {
                        'class': 'mat-step-header',
                        '[class]': '"mat-" + (color || "primary")',
                        'role': 'tab',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [MatRipple, NgTemplateOutlet, MatIcon], template: "<div class=\"mat-step-header-ripple mat-focus-indicator\" matRipple\n     [matRippleTrigger]=\"_getHostElement()\"\n     [matRippleDisabled]=\"disableRipple\"></div>\n\n<div class=\"mat-step-icon-state-{{state}} mat-step-icon\" [class.mat-step-icon-selected]=\"selected\">\n  <div class=\"mat-step-icon-content\">\n    @if (iconOverrides && iconOverrides[state]) {\n      <ng-container\n        [ngTemplateOutlet]=\"iconOverrides[state]\"\n        [ngTemplateOutletContext]=\"_getIconContext()\"></ng-container>\n    } @else {\n      @switch (state) {\n        @case ('number') {\n          <span aria-hidden=\"true\">{{_getDefaultTextForState(state)}}</span>\n        }\n\n        @default {\n          @if (state === 'done') {\n            <span class=\"cdk-visually-hidden\">{{_intl.completedLabel}}</span>\n          } @else if (state === 'edit') {\n            <span class=\"cdk-visually-hidden\">{{_intl.editableLabel}}</span>\n          }\n\n          <mat-icon aria-hidden=\"true\">{{_getDefaultTextForState(state)}}</mat-icon>\n        }\n      }\n    }\n  </div>\n</div>\n<div class=\"mat-step-label\"\n     [class.mat-step-label-active]=\"active\"\n     [class.mat-step-label-selected]=\"selected\"\n     [class.mat-step-label-error]=\"state == 'error'\">\n  @if (_templateLabel(); as templateLabel) {\n    <!-- If there is a label template, use it. -->\n    <div class=\"mat-step-text-label\">\n      <ng-container [ngTemplateOutlet]=\"templateLabel.template\"></ng-container>\n    </div>\n  } @else if (_stringLabel()) {\n    <!-- If there is no label template, fall back to the text label. -->\n    <div class=\"mat-step-text-label\">{{label}}</div>\n  }\n\n  @if (optional && state != 'error') {\n    <div class=\"mat-step-optional\">{{_intl.optionalLabel}}</div>\n  }\n\n  @if (state === 'error') {\n    <div class=\"mat-step-sub-label-error\">{{errorMessage}}</div>\n  }\n</div>\n\n", styles: [".mat-step-header{overflow:hidden;outline:none;cursor:pointer;position:relative;box-sizing:content-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-step-header:focus .mat-focus-indicator::before{content:\"\"}.mat-step-header:hover[aria-disabled=true]{cursor:default}.mat-step-header:hover:not([aria-disabled]),.mat-step-header:hover[aria-disabled=false]{background-color:var(--mat-stepper-header-hover-state-layer-color);border-radius:var(--mat-stepper-header-hover-state-layer-shape, var(--mat-app-corner-medium))}.mat-step-header.cdk-keyboard-focused,.mat-step-header.cdk-program-focused{background-color:var(--mat-stepper-header-focus-state-layer-color);border-radius:var(--mat-stepper-header-focus-state-layer-shape, var(--mat-app-corner-medium))}@media(hover: none){.mat-step-header:hover{background:none}}.cdk-high-contrast-active .mat-step-header{outline:solid 1px}.cdk-high-contrast-active .mat-step-header[aria-selected=true] .mat-step-label{text-decoration:underline}.cdk-high-contrast-active .mat-step-header[aria-disabled=true]{outline-color:GrayText}.cdk-high-contrast-active .mat-step-header[aria-disabled=true] .mat-step-label,.cdk-high-contrast-active .mat-step-header[aria-disabled=true] .mat-step-icon,.cdk-high-contrast-active .mat-step-header[aria-disabled=true] .mat-step-optional{color:GrayText}.mat-step-optional{font-size:12px;color:var(--mat-stepper-header-optional-label-text-color, var(--mat-app-on-surface-variant))}.mat-step-sub-label-error{font-size:12px;font-weight:normal}.mat-step-icon{border-radius:50%;height:24px;width:24px;flex-shrink:0;position:relative;color:var(--mat-stepper-header-icon-foreground-color, var(--mat-app-surface));background-color:var(--mat-stepper-header-icon-background-color, var(--mat-app-on-surface-variant))}.mat-step-icon-content{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:flex}.mat-step-icon .mat-icon{font-size:16px;height:16px;width:16px}.mat-step-icon-state-error{background-color:var(--mat-stepper-header-error-state-icon-background-color);color:var(--mat-stepper-header-error-state-icon-foreground-color, var(--mat-app-error))}.mat-step-icon-state-error .mat-icon{font-size:24px;height:24px;width:24px}.mat-step-label{display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px;vertical-align:middle;font-family:var(--mat-stepper-header-label-text-font, var(--mat-app-title-small-font));font-size:var(--mat-stepper-header-label-text-size, var(--mat-app-title-small-size));font-weight:var(--mat-stepper-header-label-text-weight, var(--mat-app-title-small-weight));color:var(--mat-stepper-header-label-text-color, var(--mat-app-on-surface-variant))}.mat-step-label.mat-step-label-active{color:var(--mat-stepper-header-selected-state-label-text-color, var(--mat-app-on-surface-variant))}.mat-step-label.mat-step-label-error{color:var(--mat-stepper-header-error-state-label-text-color, var(--mat-app-error));font-size:var(--mat-stepper-header-error-state-label-text-size, var(--mat-app-title-small-size))}.mat-step-label.mat-step-label-selected{font-size:var(--mat-stepper-header-selected-state-label-text-size, var(--mat-app-title-small-size));font-weight:var(--mat-stepper-header-selected-state-label-text-weight, var(--mat-app-title-small-weight))}.mat-step-text-label{text-overflow:ellipsis;overflow:hidden}.mat-step-header .mat-step-header-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-step-icon-selected{background-color:var(--mat-stepper-header-selected-state-icon-background-color, var(--mat-app-primary));color:var(--mat-stepper-header-selected-state-icon-foreground-color, var(--mat-app-on-primary))}.mat-step-icon-state-done{background-color:var(--mat-stepper-header-done-state-icon-background-color);color:var(--mat-stepper-header-done-state-icon-foreground-color)}.mat-step-icon-state-edit{background-color:var(--mat-stepper-header-edit-state-icon-background-color, var(--mat-app-primary));color:var(--mat-stepper-header-edit-state-icon-foreground-color, var(--mat-app-on-primary))}"] }]
        }], ctorParameters: () => [{ type: MatStepperIntl }, { type: i2.FocusMonitor }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }], propDecorators: { state: [{
                type: Input
            }], label: [{
                type: Input
            }], errorMessage: [{
                type: Input
            }], iconOverrides: [{
                type: Input
            }], index: [{
                type: Input
            }], selected: [{
                type: Input
            }], active: [{
                type: Input
            }], optional: [{
                type: Input
            }], disableRipple: [{
                type: Input
            }], color: [{
                type: Input
            }] } });

const DEFAULT_HORIZONTAL_ANIMATION_DURATION = '500ms';
const DEFAULT_VERTICAL_ANIMATION_DURATION = '225ms';
/**
 * Animations used by the Material steppers.
 * @docs-private
 */
const matStepperAnimations = {
    /** Animation that transitions the step along the X axis in a horizontal stepper. */
    horizontalStepTransition: trigger('horizontalStepTransition', [
        state('previous', style({ transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden' })),
        // Transition to `inherit`, rather than `visible`,
        // because visibility on a child element the one from the parent,
        // making this element focusable inside of a `hidden` element.
        state('current', style({ transform: 'none', visibility: 'inherit' })),
        state('next', style({ transform: 'translate3d(100%, 0, 0)', visibility: 'hidden' })),
        transition('* => *', group([
            animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'),
            query('@*', animateChild(), { optional: true }),
        ]), {
            params: { 'animationDuration': DEFAULT_HORIZONTAL_ANIMATION_DURATION },
        }),
    ]),
    /** Animation that transitions the step along the Y axis in a vertical stepper. */
    verticalStepTransition: trigger('verticalStepTransition', [
        state('previous', style({ height: '0px', visibility: 'hidden' })),
        state('next', style({ height: '0px', visibility: 'hidden' })),
        // Transition to `inherit`, rather than `visible`,
        // because visibility on a child element the one from the parent,
        // making this element focusable inside of a `hidden` element.
        state('current', style({ height: '*', visibility: 'inherit' })),
        transition('* <=> current', group([
            animate('{{animationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)'),
            query('@*', animateChild(), { optional: true }),
        ]), {
            params: { 'animationDuration': DEFAULT_VERTICAL_ANIMATION_DURATION },
        }),
    ]),
};

/**
 * Template to be used to override the icons inside the step header.
 */
class MatStepperIcon {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIcon, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepperIcon, isStandalone: true, selector: "ng-template[matStepperIcon]", inputs: { name: ["matStepperIcon", "name"] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperIcon, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[matStepperIcon]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }], propDecorators: { name: [{
                type: Input,
                args: ['matStepperIcon']
            }] } });

/**
 * Content for a `mat-step` that will be rendered lazily.
 */
class MatStepContent {
    constructor(_template) {
        this._template = _template;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepContent, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepContent, isStandalone: true, selector: "ng-template[matStepContent]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[matStepContent]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

class MatStep extends CdkStep {
    constructor(stepper, _errorStateMatcher, _viewContainerRef, stepperOptions) {
        super(stepper, stepperOptions);
        this._errorStateMatcher = _errorStateMatcher;
        this._viewContainerRef = _viewContainerRef;
        this._isSelected = Subscription.EMPTY;
        /** Content for step label given by `<ng-template matStepLabel>`. */
        // We need an initializer here to avoid a TS error.
        this.stepLabel = undefined;
    }
    ngAfterContentInit() {
        this._isSelected = this._stepper.steps.changes
            .pipe(switchMap(() => {
            return this._stepper.selectionChange.pipe(map(event => event.selectedStep === this), startWith(this._stepper.selected === this));
        }))
            .subscribe(isSelected => {
            if (isSelected && this._lazyContent && !this._portal) {
                this._portal = new TemplatePortal(this._lazyContent._template, this._viewContainerRef);
            }
        });
    }
    ngOnDestroy() {
        this._isSelected.unsubscribe();
    }
    /** Custom error state matcher that additionally checks for validity of interacted form. */
    isErrorState(control, form) {
        const originalErrorState = this._errorStateMatcher.isErrorState(control, form);
        // Custom error state checks for the validity of form that is not submitted or touched
        // since user can trigger a form change by calling for another step without directly
        // interacting with the current form.
        const customErrorState = !!(control && control.invalid && this.interacted);
        return originalErrorState || customErrorState;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStep, deps: [{ token: forwardRef(() => MatStepper) }, { token: i1.ErrorStateMatcher, skipSelf: true }, { token: i0.ViewContainerRef }, { token: STEPPER_GLOBAL_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStep, isStandalone: true, selector: "mat-step", inputs: { color: "color" }, host: { attributes: { "hidden": "" } }, providers: [
            { provide: ErrorStateMatcher, useExisting: MatStep },
            { provide: CdkStep, useExisting: MatStep },
        ], queries: [{ propertyName: "stepLabel", first: true, predicate: MatStepLabel, descendants: true }, { propertyName: "_lazyContent", first: true, predicate: MatStepContent, descendants: true }], exportAs: ["matStep"], usesInheritance: true, ngImport: i0, template: "<ng-template>\n  <ng-content></ng-content>\n  <ng-template [cdkPortalOutlet]=\"_portal\"></ng-template>\n</ng-template>\n", dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStep, decorators: [{
            type: Component,
            args: [{ selector: 'mat-step', providers: [
                        { provide: ErrorStateMatcher, useExisting: MatStep },
                        { provide: CdkStep, useExisting: MatStep },
                    ], encapsulation: ViewEncapsulation.None, exportAs: 'matStep', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [CdkPortalOutlet], host: {
                        'hidden': '', // Hide the steps so they don't affect the layout.
                    }, template: "<ng-template>\n  <ng-content></ng-content>\n  <ng-template [cdkPortalOutlet]=\"_portal\"></ng-template>\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: MatStepper, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => MatStepper)]
                }] }, { type: i1.ErrorStateMatcher, decorators: [{
                    type: SkipSelf
                }] }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [STEPPER_GLOBAL_OPTIONS]
                }] }], propDecorators: { stepLabel: [{
                type: ContentChild,
                args: [MatStepLabel]
            }], color: [{
                type: Input
            }], _lazyContent: [{
                type: ContentChild,
                args: [MatStepContent, { static: false }]
            }] } });
class MatStepper extends CdkStepper {
    /** Duration for the animation. Will be normalized to milliseconds if no units are set. */
    get animationDuration() {
        return this._animationDuration;
    }
    set animationDuration(value) {
        this._animationDuration = /^\d+$/.test(value) ? value + 'ms' : value;
    }
    constructor(dir, changeDetectorRef, elementRef) {
        super(dir, changeDetectorRef, elementRef);
        /** The list of step headers of the steps in the stepper. */
        // We need an initializer here to avoid a TS error.
        this._stepHeader = undefined;
        /** Full list of steps inside the stepper, including inside nested steppers. */
        // We need an initializer here to avoid a TS error.
        this._steps = undefined;
        /** Steps that belong to the current stepper, excluding ones from nested steppers. */
        this.steps = new QueryList();
        /** Event emitted when the current step is done transitioning in. */
        this.animationDone = new EventEmitter();
        /**
         * Whether the label should display in bottom or end position.
         * Only applies in the `horizontal` orientation.
         */
        this.labelPosition = 'end';
        /**
         * Position of the stepper's header.
         * Only applies in the `horizontal` orientation.
         */
        this.headerPosition = 'top';
        /** Consumer-specified template-refs to be used to override the header icons. */
        this._iconOverrides = {};
        /** Stream of animation `done` events when the body expands/collapses. */
        this._animationDone = new Subject();
        this._animationDuration = '';
        /** Whether the stepper is rendering on the server. */
        this._isServer = !inject(Platform).isBrowser;
        const nodeName = elementRef.nativeElement.nodeName.toLowerCase();
        this.orientation = nodeName === 'mat-vertical-stepper' ? 'vertical' : 'horizontal';
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._icons.forEach(({ name, templateRef }) => (this._iconOverrides[name] = templateRef));
        // Mark the component for change detection whenever the content children query changes
        this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this._stateChanged();
        });
        this._animationDone.pipe(takeUntil(this._destroyed)).subscribe(event => {
            if (event.toState === 'current') {
                this.animationDone.emit();
            }
        });
    }
    _stepIsNavigable(index, step) {
        return step.completed || this.selectedIndex === index || !this.linear;
    }
    _getAnimationDuration() {
        if (this.animationDuration) {
            return this.animationDuration;
        }
        return this.orientation === 'horizontal'
            ? DEFAULT_HORIZONTAL_ANIMATION_DURATION
            : DEFAULT_VERTICAL_ANIMATION_DURATION;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepper, deps: [{ token: i2$1.Directionality, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatStepper, isStandalone: true, selector: "mat-stepper, mat-vertical-stepper, mat-horizontal-stepper, [matStepper]", inputs: { disableRipple: "disableRipple", color: "color", labelPosition: "labelPosition", headerPosition: "headerPosition", animationDuration: "animationDuration" }, outputs: { animationDone: "animationDone" }, host: { attributes: { "role": "tablist" }, properties: { "class.mat-stepper-horizontal": "orientation === \"horizontal\"", "class.mat-stepper-vertical": "orientation === \"vertical\"", "class.mat-stepper-label-position-end": "orientation === \"horizontal\" && labelPosition == \"end\"", "class.mat-stepper-label-position-bottom": "orientation === \"horizontal\" && labelPosition == \"bottom\"", "class.mat-stepper-header-position-bottom": "headerPosition === \"bottom\"", "attr.aria-orientation": "orientation" } }, providers: [{ provide: CdkStepper, useExisting: MatStepper }], queries: [{ propertyName: "_steps", predicate: MatStep, descendants: true }, { propertyName: "_icons", predicate: MatStepperIcon, descendants: true }], viewQueries: [{ propertyName: "_stepHeader", predicate: MatStepHeader, descendants: true }], exportAs: ["matStepper", "matVerticalStepper", "matHorizontalStepper"], usesInheritance: true, ngImport: i0, template: "<!--\n  We need to project the content somewhere to avoid hydration errors. Some observations:\n  1. This is only necessary on the server.\n  2. We get a hydration error if there aren't any nodes after the `ng-content`.\n  3. We get a hydration error if `ng-content` is wrapped in another element.\n-->\n@if (_isServer) {\n  <ng-content/>\n}\n\n@switch (orientation) {\n  @case ('horizontal') {\n    <div class=\"mat-horizontal-stepper-wrapper\">\n      <div class=\"mat-horizontal-stepper-header-container\">\n        @for (step of steps; track step; let i = $index, isLast = $last) {\n          <ng-container\n            [ngTemplateOutlet]=\"stepTemplate\"\n            [ngTemplateOutletContext]=\"{step: step, i: i}\"></ng-container>\n          @if (!isLast) {\n            <div class=\"mat-stepper-horizontal-line\"></div>\n          }\n        }\n      </div>\n\n      <div class=\"mat-horizontal-content-container\">\n        @for (step of steps; track step; let i = $index) {\n          <div class=\"mat-horizontal-stepper-content\" role=\"tabpanel\"\n               [@horizontalStepTransition]=\"{\n                  'value': _getAnimationDirection(i),\n                  'params': {'animationDuration': _getAnimationDuration()}\n                }\"\n               (@horizontalStepTransition.done)=\"_animationDone.next($event)\"\n               [id]=\"_getStepContentId(i)\"\n               [attr.aria-labelledby]=\"_getStepLabelId(i)\"\n               [class.mat-horizontal-stepper-content-inactive]=\"selectedIndex !== i\">\n            <ng-container [ngTemplateOutlet]=\"step.content\"></ng-container>\n          </div>\n        }\n      </div>\n    </div>\n  }\n\n  @case ('vertical') {\n    @for (step of steps; track step; let i = $index, isLast = $last) {\n      <div class=\"mat-step\">\n        <ng-container\n          [ngTemplateOutlet]=\"stepTemplate\"\n          [ngTemplateOutletContext]=\"{step: step, i: i}\"></ng-container>\n        <div class=\"mat-vertical-content-container\" [class.mat-stepper-vertical-line]=\"!isLast\">\n          <div class=\"mat-vertical-stepper-content\" role=\"tabpanel\"\n               [@verticalStepTransition]=\"{\n                  'value': _getAnimationDirection(i),\n                  'params': {'animationDuration': _getAnimationDuration()}\n                }\"\n               (@verticalStepTransition.done)=\"_animationDone.next($event)\"\n               [id]=\"_getStepContentId(i)\"\n               [attr.aria-labelledby]=\"_getStepLabelId(i)\"\n               [class.mat-vertical-stepper-content-inactive]=\"selectedIndex !== i\">\n            <div class=\"mat-vertical-content\">\n              <ng-container [ngTemplateOutlet]=\"step.content\"></ng-container>\n            </div>\n          </div>\n        </div>\n      </div>\n    }\n  }\n}\n\n<!-- Common step templating -->\n<ng-template let-step=\"step\" let-i=\"i\" #stepTemplate>\n  <mat-step-header\n    [class.mat-horizontal-stepper-header]=\"orientation === 'horizontal'\"\n    [class.mat-vertical-stepper-header]=\"orientation === 'vertical'\"\n    (click)=\"step.select()\"\n    (keydown)=\"_onKeydown($event)\"\n    [tabIndex]=\"_getFocusIndex() === i ? 0 : -1\"\n    [id]=\"_getStepLabelId(i)\"\n    [attr.aria-posinset]=\"i + 1\"\n    [attr.aria-setsize]=\"steps.length\"\n    [attr.aria-controls]=\"_getStepContentId(i)\"\n    [attr.aria-selected]=\"selectedIndex == i\"\n    [attr.aria-label]=\"step.ariaLabel || null\"\n    [attr.aria-labelledby]=\"(!step.ariaLabel && step.ariaLabelledby) ? step.ariaLabelledby : null\"\n    [attr.aria-disabled]=\"_stepIsNavigable(i, step) ? null : true\"\n    [index]=\"i\"\n    [state]=\"_getIndicatorType(i, step.state)\"\n    [label]=\"step.stepLabel || step.label\"\n    [selected]=\"selectedIndex === i\"\n    [active]=\"_stepIsNavigable(i, step)\"\n    [optional]=\"step.optional\"\n    [errorMessage]=\"step.errorMessage\"\n    [iconOverrides]=\"_iconOverrides\"\n    [disableRipple]=\"disableRipple || !_stepIsNavigable(i, step)\"\n    [color]=\"step.color || color\"></mat-step-header>\n</ng-template>\n", styles: [".mat-stepper-vertical,.mat-stepper-horizontal{display:block;font-family:var(--mat-stepper-container-text-font, var(--mat-app-body-medium-font));background:var(--mat-stepper-container-color, var(--mat-app-surface))}.mat-horizontal-stepper-header-container{white-space:nowrap;display:flex;align-items:center}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header-container{align-items:flex-start}.mat-stepper-header-position-bottom .mat-horizontal-stepper-header-container{order:1}.mat-stepper-horizontal-line{border-top-width:1px;border-top-style:solid;flex:auto;height:0;margin:0 -16px;min-width:32px;border-top-color:var(--mat-stepper-line-color, var(--mat-app-outline))}.mat-stepper-label-position-bottom .mat-stepper-horizontal-line{margin:0;min-width:0;position:relative;top:calc(calc((var(--mat-stepper-header-height) - 24px) / 2) + 12px)}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before,.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after{border-top-width:1px;border-top-style:solid;content:\"\";display:inline-block;height:0;position:absolute;width:calc(50% - 20px)}.mat-horizontal-stepper-header{display:flex;height:72px;overflow:hidden;align-items:center;padding:0 24px;height:var(--mat-stepper-header-height)}.mat-horizontal-stepper-header .mat-step-icon{margin-right:8px;flex:none}[dir=rtl] .mat-horizontal-stepper-header .mat-step-icon{margin-right:0;margin-left:8px}.mat-horizontal-stepper-header::before,.mat-horizontal-stepper-header::after{border-top-color:var(--mat-stepper-line-color, var(--mat-app-outline))}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header{padding:calc((var(--mat-stepper-header-height) - 24px) / 2) 24px}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header::before,.mat-stepper-label-position-bottom .mat-horizontal-stepper-header::after{top:calc(calc((var(--mat-stepper-header-height) - 24px) / 2) + 12px)}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header{box-sizing:border-box;flex-direction:column;height:auto}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after{right:0}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before{left:0}[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:last-child::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:first-child::after{display:none}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-icon{margin-right:0;margin-left:0}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-label{padding:16px 0 0 0;text-align:center;width:100%}.mat-vertical-stepper-header{display:flex;align-items:center;height:24px;padding:calc((var(--mat-stepper-header-height) - 24px) / 2) 24px}.mat-vertical-stepper-header .mat-step-icon{margin-right:12px}[dir=rtl] .mat-vertical-stepper-header .mat-step-icon{margin-right:0;margin-left:12px}.mat-horizontal-stepper-wrapper{display:flex;flex-direction:column}.mat-horizontal-stepper-content{outline:0}.mat-horizontal-stepper-content.mat-horizontal-stepper-content-inactive{height:0;overflow:hidden}.mat-horizontal-stepper-content:not(.mat-horizontal-stepper-content-inactive){visibility:inherit !important}.mat-horizontal-content-container{overflow:hidden;padding:0 24px 24px 24px}.cdk-high-contrast-active .mat-horizontal-content-container{outline:solid 1px}.mat-stepper-header-position-bottom .mat-horizontal-content-container{padding:24px 24px 0 24px}.mat-vertical-content-container{margin-left:36px;border:0;position:relative}.cdk-high-contrast-active .mat-vertical-content-container{outline:solid 1px}[dir=rtl] .mat-vertical-content-container{margin-left:0;margin-right:36px}.mat-stepper-vertical-line::before{content:\"\";position:absolute;left:0;border-left-width:1px;border-left-style:solid;border-left-color:var(--mat-stepper-line-color, var(--mat-app-outline));top:calc(8px - calc((var(--mat-stepper-header-height) - 24px) / 2));bottom:calc(8px - calc((var(--mat-stepper-header-height) - 24px) / 2))}[dir=rtl] .mat-stepper-vertical-line::before{left:auto;right:0}.mat-vertical-stepper-content{overflow:hidden;outline:0}.mat-vertical-stepper-content:not(.mat-vertical-stepper-content-inactive){visibility:inherit !important}.mat-vertical-content{padding:0 24px 24px 24px}.mat-step:last-child .mat-vertical-content-container{border:none}"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: MatStepHeader, selector: "mat-step-header", inputs: ["state", "label", "errorMessage", "iconOverrides", "index", "selected", "active", "optional", "disableRipple", "color"] }], animations: [
            matStepperAnimations.horizontalStepTransition,
            matStepperAnimations.verticalStepTransition,
        ], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepper, decorators: [{
            type: Component,
            args: [{ selector: 'mat-stepper, mat-vertical-stepper, mat-horizontal-stepper, [matStepper]', exportAs: 'matStepper, matVerticalStepper, matHorizontalStepper', host: {
                        '[class.mat-stepper-horizontal]': 'orientation === "horizontal"',
                        '[class.mat-stepper-vertical]': 'orientation === "vertical"',
                        '[class.mat-stepper-label-position-end]': 'orientation === "horizontal" && labelPosition == "end"',
                        '[class.mat-stepper-label-position-bottom]': 'orientation === "horizontal" && labelPosition == "bottom"',
                        '[class.mat-stepper-header-position-bottom]': 'headerPosition === "bottom"',
                        '[attr.aria-orientation]': 'orientation',
                        'role': 'tablist',
                    }, animations: [
                        matStepperAnimations.horizontalStepTransition,
                        matStepperAnimations.verticalStepTransition,
                    ], providers: [{ provide: CdkStepper, useExisting: MatStepper }], encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgTemplateOutlet, MatStepHeader], template: "<!--\n  We need to project the content somewhere to avoid hydration errors. Some observations:\n  1. This is only necessary on the server.\n  2. We get a hydration error if there aren't any nodes after the `ng-content`.\n  3. We get a hydration error if `ng-content` is wrapped in another element.\n-->\n@if (_isServer) {\n  <ng-content/>\n}\n\n@switch (orientation) {\n  @case ('horizontal') {\n    <div class=\"mat-horizontal-stepper-wrapper\">\n      <div class=\"mat-horizontal-stepper-header-container\">\n        @for (step of steps; track step; let i = $index, isLast = $last) {\n          <ng-container\n            [ngTemplateOutlet]=\"stepTemplate\"\n            [ngTemplateOutletContext]=\"{step: step, i: i}\"></ng-container>\n          @if (!isLast) {\n            <div class=\"mat-stepper-horizontal-line\"></div>\n          }\n        }\n      </div>\n\n      <div class=\"mat-horizontal-content-container\">\n        @for (step of steps; track step; let i = $index) {\n          <div class=\"mat-horizontal-stepper-content\" role=\"tabpanel\"\n               [@horizontalStepTransition]=\"{\n                  'value': _getAnimationDirection(i),\n                  'params': {'animationDuration': _getAnimationDuration()}\n                }\"\n               (@horizontalStepTransition.done)=\"_animationDone.next($event)\"\n               [id]=\"_getStepContentId(i)\"\n               [attr.aria-labelledby]=\"_getStepLabelId(i)\"\n               [class.mat-horizontal-stepper-content-inactive]=\"selectedIndex !== i\">\n            <ng-container [ngTemplateOutlet]=\"step.content\"></ng-container>\n          </div>\n        }\n      </div>\n    </div>\n  }\n\n  @case ('vertical') {\n    @for (step of steps; track step; let i = $index, isLast = $last) {\n      <div class=\"mat-step\">\n        <ng-container\n          [ngTemplateOutlet]=\"stepTemplate\"\n          [ngTemplateOutletContext]=\"{step: step, i: i}\"></ng-container>\n        <div class=\"mat-vertical-content-container\" [class.mat-stepper-vertical-line]=\"!isLast\">\n          <div class=\"mat-vertical-stepper-content\" role=\"tabpanel\"\n               [@verticalStepTransition]=\"{\n                  'value': _getAnimationDirection(i),\n                  'params': {'animationDuration': _getAnimationDuration()}\n                }\"\n               (@verticalStepTransition.done)=\"_animationDone.next($event)\"\n               [id]=\"_getStepContentId(i)\"\n               [attr.aria-labelledby]=\"_getStepLabelId(i)\"\n               [class.mat-vertical-stepper-content-inactive]=\"selectedIndex !== i\">\n            <div class=\"mat-vertical-content\">\n              <ng-container [ngTemplateOutlet]=\"step.content\"></ng-container>\n            </div>\n          </div>\n        </div>\n      </div>\n    }\n  }\n}\n\n<!-- Common step templating -->\n<ng-template let-step=\"step\" let-i=\"i\" #stepTemplate>\n  <mat-step-header\n    [class.mat-horizontal-stepper-header]=\"orientation === 'horizontal'\"\n    [class.mat-vertical-stepper-header]=\"orientation === 'vertical'\"\n    (click)=\"step.select()\"\n    (keydown)=\"_onKeydown($event)\"\n    [tabIndex]=\"_getFocusIndex() === i ? 0 : -1\"\n    [id]=\"_getStepLabelId(i)\"\n    [attr.aria-posinset]=\"i + 1\"\n    [attr.aria-setsize]=\"steps.length\"\n    [attr.aria-controls]=\"_getStepContentId(i)\"\n    [attr.aria-selected]=\"selectedIndex == i\"\n    [attr.aria-label]=\"step.ariaLabel || null\"\n    [attr.aria-labelledby]=\"(!step.ariaLabel && step.ariaLabelledby) ? step.ariaLabelledby : null\"\n    [attr.aria-disabled]=\"_stepIsNavigable(i, step) ? null : true\"\n    [index]=\"i\"\n    [state]=\"_getIndicatorType(i, step.state)\"\n    [label]=\"step.stepLabel || step.label\"\n    [selected]=\"selectedIndex === i\"\n    [active]=\"_stepIsNavigable(i, step)\"\n    [optional]=\"step.optional\"\n    [errorMessage]=\"step.errorMessage\"\n    [iconOverrides]=\"_iconOverrides\"\n    [disableRipple]=\"disableRipple || !_stepIsNavigable(i, step)\"\n    [color]=\"step.color || color\"></mat-step-header>\n</ng-template>\n", styles: [".mat-stepper-vertical,.mat-stepper-horizontal{display:block;font-family:var(--mat-stepper-container-text-font, var(--mat-app-body-medium-font));background:var(--mat-stepper-container-color, var(--mat-app-surface))}.mat-horizontal-stepper-header-container{white-space:nowrap;display:flex;align-items:center}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header-container{align-items:flex-start}.mat-stepper-header-position-bottom .mat-horizontal-stepper-header-container{order:1}.mat-stepper-horizontal-line{border-top-width:1px;border-top-style:solid;flex:auto;height:0;margin:0 -16px;min-width:32px;border-top-color:var(--mat-stepper-line-color, var(--mat-app-outline))}.mat-stepper-label-position-bottom .mat-stepper-horizontal-line{margin:0;min-width:0;position:relative;top:calc(calc((var(--mat-stepper-header-height) - 24px) / 2) + 12px)}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before,.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after{border-top-width:1px;border-top-style:solid;content:\"\";display:inline-block;height:0;position:absolute;width:calc(50% - 20px)}.mat-horizontal-stepper-header{display:flex;height:72px;overflow:hidden;align-items:center;padding:0 24px;height:var(--mat-stepper-header-height)}.mat-horizontal-stepper-header .mat-step-icon{margin-right:8px;flex:none}[dir=rtl] .mat-horizontal-stepper-header .mat-step-icon{margin-right:0;margin-left:8px}.mat-horizontal-stepper-header::before,.mat-horizontal-stepper-header::after{border-top-color:var(--mat-stepper-line-color, var(--mat-app-outline))}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header{padding:calc((var(--mat-stepper-header-height) - 24px) / 2) 24px}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header::before,.mat-stepper-label-position-bottom .mat-horizontal-stepper-header::after{top:calc(calc((var(--mat-stepper-header-height) - 24px) / 2) + 12px)}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header{box-sizing:border-box;flex-direction:column;height:auto}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after{right:0}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before{left:0}[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:last-child::before,[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:first-child::after{display:none}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-icon{margin-right:0;margin-left:0}.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-label{padding:16px 0 0 0;text-align:center;width:100%}.mat-vertical-stepper-header{display:flex;align-items:center;height:24px;padding:calc((var(--mat-stepper-header-height) - 24px) / 2) 24px}.mat-vertical-stepper-header .mat-step-icon{margin-right:12px}[dir=rtl] .mat-vertical-stepper-header .mat-step-icon{margin-right:0;margin-left:12px}.mat-horizontal-stepper-wrapper{display:flex;flex-direction:column}.mat-horizontal-stepper-content{outline:0}.mat-horizontal-stepper-content.mat-horizontal-stepper-content-inactive{height:0;overflow:hidden}.mat-horizontal-stepper-content:not(.mat-horizontal-stepper-content-inactive){visibility:inherit !important}.mat-horizontal-content-container{overflow:hidden;padding:0 24px 24px 24px}.cdk-high-contrast-active .mat-horizontal-content-container{outline:solid 1px}.mat-stepper-header-position-bottom .mat-horizontal-content-container{padding:24px 24px 0 24px}.mat-vertical-content-container{margin-left:36px;border:0;position:relative}.cdk-high-contrast-active .mat-vertical-content-container{outline:solid 1px}[dir=rtl] .mat-vertical-content-container{margin-left:0;margin-right:36px}.mat-stepper-vertical-line::before{content:\"\";position:absolute;left:0;border-left-width:1px;border-left-style:solid;border-left-color:var(--mat-stepper-line-color, var(--mat-app-outline));top:calc(8px - calc((var(--mat-stepper-header-height) - 24px) / 2));bottom:calc(8px - calc((var(--mat-stepper-header-height) - 24px) / 2))}[dir=rtl] .mat-stepper-vertical-line::before{left:auto;right:0}.mat-vertical-stepper-content{overflow:hidden;outline:0}.mat-vertical-stepper-content:not(.mat-vertical-stepper-content-inactive){visibility:inherit !important}.mat-vertical-content{padding:0 24px 24px 24px}.mat-step:last-child .mat-vertical-content-container{border:none}"] }]
        }], ctorParameters: () => [{ type: i2$1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }], propDecorators: { _stepHeader: [{
                type: ViewChildren,
                args: [MatStepHeader]
            }], _steps: [{
                type: ContentChildren,
                args: [MatStep, { descendants: true }]
            }], _icons: [{
                type: ContentChildren,
                args: [MatStepperIcon, { descendants: true }]
            }], animationDone: [{
                type: Output
            }], disableRipple: [{
                type: Input
            }], color: [{
                type: Input
            }], labelPosition: [{
                type: Input
            }], headerPosition: [{
                type: Input
            }], animationDuration: [{
                type: Input
            }] } });

/** Button that moves to the next step in a stepper workflow. */
class MatStepperNext extends CdkStepperNext {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperNext, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepperNext, isStandalone: true, selector: "button[matStepperNext]", host: { properties: { "type": "type" }, classAttribute: "mat-stepper-next" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperNext, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[matStepperNext]',
                    host: {
                        'class': 'mat-stepper-next',
                        '[type]': 'type',
                    },
                    standalone: true,
                }]
        }] });
/** Button that moves to the previous step in a stepper workflow. */
class MatStepperPrevious extends CdkStepperPrevious {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperPrevious, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatStepperPrevious, isStandalone: true, selector: "button[matStepperPrevious]", host: { properties: { "type": "type" }, classAttribute: "mat-stepper-previous" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperPrevious, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[matStepperPrevious]',
                    host: {
                        'class': 'mat-stepper-previous',
                        '[type]': 'type',
                    },
                    standalone: true,
                }]
        }] });

class MatStepperModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, imports: [MatCommonModule,
            CommonModule,
            PortalModule,
            CdkStepperModule,
            MatIconModule,
            MatRippleModule,
            MatStep,
            MatStepLabel,
            MatStepper,
            MatStepperNext,
            MatStepperPrevious,
            MatStepHeader,
            MatStepperIcon,
            MatStepContent], exports: [MatCommonModule,
            MatStep,
            MatStepLabel,
            MatStepper,
            MatStepperNext,
            MatStepperPrevious,
            MatStepHeader,
            MatStepperIcon,
            MatStepContent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, providers: [MAT_STEPPER_INTL_PROVIDER, ErrorStateMatcher], imports: [MatCommonModule,
            CommonModule,
            PortalModule,
            CdkStepperModule,
            MatIconModule,
            MatRippleModule,
            MatStepper,
            MatStepHeader, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatStepperModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        CommonModule,
                        PortalModule,
                        CdkStepperModule,
                        MatIconModule,
                        MatRippleModule,
                        MatStep,
                        MatStepLabel,
                        MatStepper,
                        MatStepperNext,
                        MatStepperPrevious,
                        MatStepHeader,
                        MatStepperIcon,
                        MatStepContent,
                    ],
                    exports: [
                        MatCommonModule,
                        MatStep,
                        MatStepLabel,
                        MatStepper,
                        MatStepperNext,
                        MatStepperPrevious,
                        MatStepHeader,
                        MatStepperIcon,
                        MatStepContent,
                    ],
                    providers: [MAT_STEPPER_INTL_PROVIDER, ErrorStateMatcher],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { MAT_STEPPER_INTL_PROVIDER, MAT_STEPPER_INTL_PROVIDER_FACTORY, MatStep, MatStepContent, MatStepHeader, MatStepLabel, MatStepper, MatStepperIcon, MatStepperIntl, MatStepperModule, MatStepperNext, MatStepperPrevious, matStepperAnimations };
//# sourceMappingURL=stepper.mjs.map
