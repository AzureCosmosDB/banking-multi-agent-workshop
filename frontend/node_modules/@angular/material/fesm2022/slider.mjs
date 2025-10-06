import * as i1 from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import * as i0 from '@angular/core';
import { InjectionToken, inject, Component, ChangeDetectionStrategy, ViewEncapsulation, Inject, Input, ViewChild, ANIMATION_MODULE_TYPE, booleanAttribute, numberAttribute, Optional, ViewChildren, ContentChild, ContentChildren, forwardRef, EventEmitter, signal, Directive, Output, NgModule } from '@angular/core';
import { RippleState, MatRipple, MAT_RIPPLE_GLOBAL_OPTIONS, MatCommonModule, MatRippleModule } from '@angular/material/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Thumb types: range slider has two thumbs (START, END) whereas single point
 * slider only has one thumb (END).
 */
var _MatThumb;
(function (_MatThumb) {
    _MatThumb[_MatThumb["START"] = 1] = "START";
    _MatThumb[_MatThumb["END"] = 2] = "END";
})(_MatThumb || (_MatThumb = {}));
/** Tick mark enum, for discrete sliders. */
var _MatTickMark;
(function (_MatTickMark) {
    _MatTickMark[_MatTickMark["ACTIVE"] = 0] = "ACTIVE";
    _MatTickMark[_MatTickMark["INACTIVE"] = 1] = "INACTIVE";
})(_MatTickMark || (_MatTickMark = {}));
/**
 * Injection token that can be used for a `MatSlider` to provide itself as a
 * parent to the `MatSliderThumb` and `MatSliderRangeThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
const MAT_SLIDER = new InjectionToken('_MatSlider');
/**
 * Injection token that can be used to query for a `MatSliderThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
const MAT_SLIDER_THUMB = new InjectionToken('_MatSliderThumb');
/**
 * Injection token that can be used to query for a `MatSliderRangeThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
const MAT_SLIDER_RANGE_THUMB = new InjectionToken('_MatSliderRangeThumb');
/**
 * Injection token that can be used to query for a `MatSliderVisualThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
const MAT_SLIDER_VISUAL_THUMB = new InjectionToken('_MatSliderVisualThumb');
/**
 * A simple change event emitted by the MatSlider component.
 * @deprecated Use event bindings directly on the MatSliderThumbs for `change` and `input` events. See https://v17.material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
class MatSliderChange {
}

/**
 * The visual slider thumb.
 *
 * Handles the slider thumb ripple states (hover, focus, and active),
 * and displaying the value tooltip on discrete sliders.
 * @docs-private
 */
class MatSliderVisualThumb {
    constructor(_cdr, _ngZone, _elementRef, _slider) {
        this._cdr = _cdr;
        this._ngZone = _ngZone;
        this._slider = _slider;
        /** Whether the slider thumb is currently being hovered. */
        this._isHovered = false;
        /** Whether the slider thumb is currently being pressed. */
        this._isActive = false;
        /** Whether the value indicator tooltip is visible. */
        this._isValueIndicatorVisible = false;
        this._platform = inject(Platform);
        this._onPointerMove = (event) => {
            if (this._sliderInput._isFocused) {
                return;
            }
            const rect = this._hostElement.getBoundingClientRect();
            const isHovered = this._slider._isCursorOnSliderThumb(event, rect);
            this._isHovered = isHovered;
            if (isHovered) {
                this._showHoverRipple();
            }
            else {
                this._hideRipple(this._hoverRippleRef);
            }
        };
        this._onMouseLeave = () => {
            this._isHovered = false;
            this._hideRipple(this._hoverRippleRef);
        };
        this._onFocus = () => {
            // We don't want to show the hover ripple on top of the focus ripple.
            // Happen when the users cursor is over a thumb and then the user tabs to it.
            this._hideRipple(this._hoverRippleRef);
            this._showFocusRipple();
            this._hostElement.classList.add('mdc-slider__thumb--focused');
        };
        this._onBlur = () => {
            // Happens when the user tabs away while still dragging a thumb.
            if (!this._isActive) {
                this._hideRipple(this._focusRippleRef);
            }
            // Happens when the user tabs away from a thumb but their cursor is still over it.
            if (this._isHovered) {
                this._showHoverRipple();
            }
            this._hostElement.classList.remove('mdc-slider__thumb--focused');
        };
        this._onDragStart = (event) => {
            if (event.button !== 0) {
                return;
            }
            this._isActive = true;
            this._showActiveRipple();
        };
        this._onDragEnd = () => {
            this._isActive = false;
            this._hideRipple(this._activeRippleRef);
            // Happens when the user starts dragging a thumb, tabs away, and then stops dragging.
            if (!this._sliderInput._isFocused) {
                this._hideRipple(this._focusRippleRef);
            }
            // On Safari we need to immediately re-show the hover ripple because
            // sliders do not retain focus from pointer events on that platform.
            if (this._platform.SAFARI) {
                this._showHoverRipple();
            }
        };
        this._hostElement = _elementRef.nativeElement;
    }
    ngAfterViewInit() {
        const sliderInput = this._slider._getInput(this.thumbPosition);
        // No-op if the slider isn't configured properly. `MatSlider` will
        // throw an error instructing the user how to set up the slider.
        if (!sliderInput) {
            return;
        }
        this._ripple.radius = 24;
        this._sliderInput = sliderInput;
        this._sliderInputEl = this._sliderInput._hostElement;
        // These listeners don't update any data bindings so we bind them outside
        // of the NgZone to prevent Angular from needlessly running change detection.
        this._ngZone.runOutsideAngular(() => {
            const input = this._sliderInputEl;
            input.addEventListener('pointermove', this._onPointerMove);
            input.addEventListener('pointerdown', this._onDragStart);
            input.addEventListener('pointerup', this._onDragEnd);
            input.addEventListener('pointerleave', this._onMouseLeave);
            input.addEventListener('focus', this._onFocus);
            input.addEventListener('blur', this._onBlur);
        });
    }
    ngOnDestroy() {
        const input = this._sliderInputEl;
        if (input) {
            input.removeEventListener('pointermove', this._onPointerMove);
            input.removeEventListener('pointerdown', this._onDragStart);
            input.removeEventListener('pointerup', this._onDragEnd);
            input.removeEventListener('pointerleave', this._onMouseLeave);
            input.removeEventListener('focus', this._onFocus);
            input.removeEventListener('blur', this._onBlur);
        }
    }
    /** Handles displaying the hover ripple. */
    _showHoverRipple() {
        if (!this._isShowingRipple(this._hoverRippleRef)) {
            this._hoverRippleRef = this._showRipple({ enterDuration: 0, exitDuration: 0 });
            this._hoverRippleRef?.element.classList.add('mat-mdc-slider-hover-ripple');
        }
    }
    /** Handles displaying the focus ripple. */
    _showFocusRipple() {
        // Show the focus ripple event if noop animations are enabled.
        if (!this._isShowingRipple(this._focusRippleRef)) {
            this._focusRippleRef = this._showRipple({ enterDuration: 0, exitDuration: 0 }, true);
            this._focusRippleRef?.element.classList.add('mat-mdc-slider-focus-ripple');
        }
    }
    /** Handles displaying the active ripple. */
    _showActiveRipple() {
        if (!this._isShowingRipple(this._activeRippleRef)) {
            this._activeRippleRef = this._showRipple({ enterDuration: 225, exitDuration: 400 });
            this._activeRippleRef?.element.classList.add('mat-mdc-slider-active-ripple');
        }
    }
    /** Whether the given rippleRef is currently fading in or visible. */
    _isShowingRipple(rippleRef) {
        return rippleRef?.state === RippleState.FADING_IN || rippleRef?.state === RippleState.VISIBLE;
    }
    /** Manually launches the slider thumb ripple using the specified ripple animation config. */
    _showRipple(animation, ignoreGlobalRippleConfig) {
        if (this._slider.disabled) {
            return;
        }
        this._showValueIndicator();
        if (this._slider._isRange) {
            const sibling = this._slider._getThumb(this.thumbPosition === _MatThumb.START ? _MatThumb.END : _MatThumb.START);
            sibling._showValueIndicator();
        }
        if (this._slider._globalRippleOptions?.disabled && !ignoreGlobalRippleConfig) {
            return;
        }
        return this._ripple.launch({
            animation: this._slider._noopAnimations ? { enterDuration: 0, exitDuration: 0 } : animation,
            centered: true,
            persistent: true,
        });
    }
    /**
     * Fades out the given ripple.
     * Also hides the value indicator if no ripple is showing.
     */
    _hideRipple(rippleRef) {
        rippleRef?.fadeOut();
        if (this._isShowingAnyRipple()) {
            return;
        }
        if (!this._slider._isRange) {
            this._hideValueIndicator();
        }
        const sibling = this._getSibling();
        if (!sibling._isShowingAnyRipple()) {
            this._hideValueIndicator();
            sibling._hideValueIndicator();
        }
    }
    /** Shows the value indicator ui. */
    _showValueIndicator() {
        this._hostElement.classList.add('mdc-slider__thumb--with-indicator');
    }
    /** Hides the value indicator ui. */
    _hideValueIndicator() {
        this._hostElement.classList.remove('mdc-slider__thumb--with-indicator');
    }
    _getSibling() {
        return this._slider._getThumb(this.thumbPosition === _MatThumb.START ? _MatThumb.END : _MatThumb.START);
    }
    /** Gets the value indicator container's native HTML element. */
    _getValueIndicatorContainer() {
        return this._valueIndicatorContainer?.nativeElement;
    }
    /** Gets the native HTML element of the slider thumb knob. */
    _getKnob() {
        return this._knob.nativeElement;
    }
    _isShowingAnyRipple() {
        return (this._isShowingRipple(this._hoverRippleRef) ||
            this._isShowingRipple(this._focusRippleRef) ||
            this._isShowingRipple(this._activeRippleRef));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderVisualThumb, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: i0.ElementRef }, { token: MAT_SLIDER }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatSliderVisualThumb, isStandalone: true, selector: "mat-slider-visual-thumb", inputs: { discrete: "discrete", thumbPosition: "thumbPosition", valueIndicatorText: "valueIndicatorText" }, host: { classAttribute: "mdc-slider__thumb mat-mdc-slider-visual-thumb" }, providers: [{ provide: MAT_SLIDER_VISUAL_THUMB, useExisting: MatSliderVisualThumb }], viewQueries: [{ propertyName: "_ripple", first: true, predicate: MatRipple, descendants: true }, { propertyName: "_knob", first: true, predicate: ["knob"], descendants: true }, { propertyName: "_valueIndicatorContainer", first: true, predicate: ["valueIndicatorContainer"], descendants: true }], ngImport: i0, template: "@if (discrete) {\n  <div class=\"mdc-slider__value-indicator-container\" #valueIndicatorContainer>\n    <div class=\"mdc-slider__value-indicator\">\n      <span class=\"mdc-slider__value-indicator-text\">{{valueIndicatorText}}</span>\n    </div>\n  </div>\n}\n<div class=\"mdc-slider__thumb-knob\" #knob></div>\n<div matRipple class=\"mat-mdc-focus-indicator\" [matRippleDisabled]=\"true\"></div>\n", styles: [".mat-mdc-slider-visual-thumb .mat-ripple{height:100%;width:100%}.mat-mdc-slider .mdc-slider__tick-marks{justify-content:start}.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--inactive{position:absolute;left:2px}"], dependencies: [{ kind: "directive", type: MatRipple, selector: "[mat-ripple], [matRipple]", inputs: ["matRippleColor", "matRippleUnbounded", "matRippleCentered", "matRippleRadius", "matRippleAnimation", "matRippleDisabled", "matRippleTrigger"], exportAs: ["matRipple"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderVisualThumb, decorators: [{
            type: Component,
            args: [{ selector: 'mat-slider-visual-thumb', host: {
                        'class': 'mdc-slider__thumb mat-mdc-slider-visual-thumb',
                    }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [{ provide: MAT_SLIDER_VISUAL_THUMB, useExisting: MatSliderVisualThumb }], standalone: true, imports: [MatRipple], template: "@if (discrete) {\n  <div class=\"mdc-slider__value-indicator-container\" #valueIndicatorContainer>\n    <div class=\"mdc-slider__value-indicator\">\n      <span class=\"mdc-slider__value-indicator-text\">{{valueIndicatorText}}</span>\n    </div>\n  </div>\n}\n<div class=\"mdc-slider__thumb-knob\" #knob></div>\n<div matRipple class=\"mat-mdc-focus-indicator\" [matRippleDisabled]=\"true\"></div>\n", styles: [".mat-mdc-slider-visual-thumb .mat-ripple{height:100%;width:100%}.mat-mdc-slider .mdc-slider__tick-marks{justify-content:start}.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--active,.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--inactive{position:absolute;left:2px}"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_SLIDER]
                }] }], propDecorators: { discrete: [{
                type: Input
            }], thumbPosition: [{
                type: Input
            }], valueIndicatorText: [{
                type: Input
            }], _ripple: [{
                type: ViewChild,
                args: [MatRipple]
            }], _knob: [{
                type: ViewChild,
                args: ['knob']
            }], _valueIndicatorContainer: [{
                type: ViewChild,
                args: ['valueIndicatorContainer']
            }] } });

// TODO(wagnermaciel): maybe handle the following edge case:
// 1. start dragging discrete slider
// 2. tab to disable checkbox
// 3. without ending drag, disable the slider
/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
class MatSlider {
    /** Whether the slider is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(v) {
        this._disabled = v;
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
        if (endInput) {
            endInput.disabled = this._disabled;
        }
        if (startInput) {
            startInput.disabled = this._disabled;
        }
    }
    /** Whether the slider displays a numeric value label upon pressing the thumb. */
    get discrete() {
        return this._discrete;
    }
    set discrete(v) {
        this._discrete = v;
        this._updateValueIndicatorUIs();
    }
    /** The minimum value that the slider can have. */
    get min() {
        return this._min;
    }
    set min(v) {
        const min = isNaN(v) ? this._min : v;
        if (this._min !== min) {
            this._updateMin(min);
        }
    }
    _updateMin(min) {
        const prevMin = this._min;
        this._min = min;
        this._isRange ? this._updateMinRange({ old: prevMin, new: min }) : this._updateMinNonRange(min);
        this._onMinMaxOrStepChange();
    }
    _updateMinRange(min) {
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
        const oldEndValue = endInput.value;
        const oldStartValue = startInput.value;
        startInput.min = min.new;
        endInput.min = Math.max(min.new, startInput.value);
        startInput.max = Math.min(endInput.max, endInput.value);
        startInput._updateWidthInactive();
        endInput._updateWidthInactive();
        min.new < min.old
            ? this._onTranslateXChangeBySideEffect(endInput, startInput)
            : this._onTranslateXChangeBySideEffect(startInput, endInput);
        if (oldEndValue !== endInput.value) {
            this._onValueChange(endInput);
        }
        if (oldStartValue !== startInput.value) {
            this._onValueChange(startInput);
        }
    }
    _updateMinNonRange(min) {
        const input = this._getInput(_MatThumb.END);
        if (input) {
            const oldValue = input.value;
            input.min = min;
            input._updateThumbUIByValue();
            this._updateTrackUI(input);
            if (oldValue !== input.value) {
                this._onValueChange(input);
            }
        }
    }
    /** The maximum value that the slider can have. */
    get max() {
        return this._max;
    }
    set max(v) {
        const max = isNaN(v) ? this._max : v;
        if (this._max !== max) {
            this._updateMax(max);
        }
    }
    _updateMax(max) {
        const prevMax = this._max;
        this._max = max;
        this._isRange ? this._updateMaxRange({ old: prevMax, new: max }) : this._updateMaxNonRange(max);
        this._onMinMaxOrStepChange();
    }
    _updateMaxRange(max) {
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
        const oldEndValue = endInput.value;
        const oldStartValue = startInput.value;
        endInput.max = max.new;
        startInput.max = Math.min(max.new, endInput.value);
        endInput.min = startInput.value;
        endInput._updateWidthInactive();
        startInput._updateWidthInactive();
        max.new > max.old
            ? this._onTranslateXChangeBySideEffect(startInput, endInput)
            : this._onTranslateXChangeBySideEffect(endInput, startInput);
        if (oldEndValue !== endInput.value) {
            this._onValueChange(endInput);
        }
        if (oldStartValue !== startInput.value) {
            this._onValueChange(startInput);
        }
    }
    _updateMaxNonRange(max) {
        const input = this._getInput(_MatThumb.END);
        if (input) {
            const oldValue = input.value;
            input.max = max;
            input._updateThumbUIByValue();
            this._updateTrackUI(input);
            if (oldValue !== input.value) {
                this._onValueChange(input);
            }
        }
    }
    /** The values at which the thumb will snap. */
    get step() {
        return this._step;
    }
    set step(v) {
        const step = isNaN(v) ? this._step : v;
        if (this._step !== step) {
            this._updateStep(step);
        }
    }
    _updateStep(step) {
        this._step = step;
        this._isRange ? this._updateStepRange() : this._updateStepNonRange();
        this._onMinMaxOrStepChange();
    }
    _updateStepRange() {
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
        const oldEndValue = endInput.value;
        const oldStartValue = startInput.value;
        const prevStartValue = startInput.value;
        endInput.min = this._min;
        startInput.max = this._max;
        endInput.step = this._step;
        startInput.step = this._step;
        if (this._platform.SAFARI) {
            endInput.value = endInput.value;
            startInput.value = startInput.value;
        }
        endInput.min = Math.max(this._min, startInput.value);
        startInput.max = Math.min(this._max, endInput.value);
        startInput._updateWidthInactive();
        endInput._updateWidthInactive();
        endInput.value < prevStartValue
            ? this._onTranslateXChangeBySideEffect(startInput, endInput)
            : this._onTranslateXChangeBySideEffect(endInput, startInput);
        if (oldEndValue !== endInput.value) {
            this._onValueChange(endInput);
        }
        if (oldStartValue !== startInput.value) {
            this._onValueChange(startInput);
        }
    }
    _updateStepNonRange() {
        const input = this._getInput(_MatThumb.END);
        if (input) {
            const oldValue = input.value;
            input.step = this._step;
            if (this._platform.SAFARI) {
                input.value = input.value;
            }
            input._updateThumbUIByValue();
            if (oldValue !== input.value) {
                this._onValueChange(input);
            }
        }
    }
    constructor(_ngZone, _cdr, _elementRef, _dir, _globalRippleOptions, animationMode) {
        this._ngZone = _ngZone;
        this._cdr = _cdr;
        this._elementRef = _elementRef;
        this._dir = _dir;
        this._globalRippleOptions = _globalRippleOptions;
        this._disabled = false;
        this._discrete = false;
        /** Whether the slider displays tick marks along the slider track. */
        this.showTickMarks = false;
        this._min = 0;
        /** Whether ripples are disabled in the slider. */
        this.disableRipple = false;
        this._max = 100;
        this._step = 1;
        /**
         * Function that will be used to format the value before it is displayed
         * in the thumb label. Can be used to format very large number in order
         * for them to fit into the slider thumb.
         */
        this.displayWith = (value) => `${value}`;
        this._rippleRadius = 24;
        // The value indicator tooltip text for the visual slider thumb(s).
        /** @docs-private */
        this.startValueIndicatorText = '';
        /** @docs-private */
        this.endValueIndicatorText = '';
        this._isRange = false;
        /** Whether the slider is rtl. */
        this._isRtl = false;
        this._hasViewInitialized = false;
        /**
         * The width of the tick mark track.
         * The tick mark track width is different from full track width
         */
        this._tickMarkTrackWidth = 0;
        this._hasAnimation = false;
        this._resizeTimer = null;
        this._platform = inject(Platform);
        /** The radius of the native slider's knob. AFAIK there is no way to avoid hardcoding this. */
        this._knobRadius = 8;
        /** Whether or not the slider thumbs overlap. */
        this._thumbsOverlap = false;
        this._noopAnimations = animationMode === 'NoopAnimations';
        this._dirChangeSubscription = this._dir.change.subscribe(() => this._onDirChange());
        this._isRtl = this._dir.value === 'rtl';
    }
    ngAfterViewInit() {
        if (this._platform.isBrowser) {
            this._updateDimensions();
        }
        const eInput = this._getInput(_MatThumb.END);
        const sInput = this._getInput(_MatThumb.START);
        this._isRange = !!eInput && !!sInput;
        this._cdr.detectChanges();
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            _validateInputs(this._isRange, this._getInput(_MatThumb.END), this._getInput(_MatThumb.START));
        }
        const thumb = this._getThumb(_MatThumb.END);
        this._rippleRadius = thumb._ripple.radius;
        this._inputPadding = this._rippleRadius - this._knobRadius;
        this._isRange
            ? this._initUIRange(eInput, sInput)
            : this._initUINonRange(eInput);
        this._updateTrackUI(eInput);
        this._updateTickMarkUI();
        this._updateTickMarkTrackUI();
        this._observeHostResize();
        this._cdr.detectChanges();
    }
    _initUINonRange(eInput) {
        eInput.initProps();
        eInput.initUI();
        this._updateValueIndicatorUI(eInput);
        this._hasViewInitialized = true;
        eInput._updateThumbUIByValue();
    }
    _initUIRange(eInput, sInput) {
        eInput.initProps();
        eInput.initUI();
        sInput.initProps();
        sInput.initUI();
        eInput._updateMinMax();
        sInput._updateMinMax();
        eInput._updateStaticStyles();
        sInput._updateStaticStyles();
        this._updateValueIndicatorUIs();
        this._hasViewInitialized = true;
        eInput._updateThumbUIByValue();
        sInput._updateThumbUIByValue();
    }
    ngOnDestroy() {
        this._dirChangeSubscription.unsubscribe();
        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
    }
    /** Handles updating the slider ui after a dir change. */
    _onDirChange() {
        this._isRtl = this._dir.value === 'rtl';
        this._isRange ? this._onDirChangeRange() : this._onDirChangeNonRange();
        this._updateTickMarkUI();
    }
    _onDirChangeRange() {
        const endInput = this._getInput(_MatThumb.END);
        const startInput = this._getInput(_MatThumb.START);
        endInput._setIsLeftThumb();
        startInput._setIsLeftThumb();
        endInput.translateX = endInput._calcTranslateXByValue();
        startInput.translateX = startInput._calcTranslateXByValue();
        endInput._updateStaticStyles();
        startInput._updateStaticStyles();
        endInput._updateWidthInactive();
        startInput._updateWidthInactive();
        endInput._updateThumbUIByValue();
        startInput._updateThumbUIByValue();
    }
    _onDirChangeNonRange() {
        const input = this._getInput(_MatThumb.END);
        input._updateThumbUIByValue();
    }
    /** Starts observing and updating the slider if the host changes its size. */
    _observeHostResize() {
        if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
            return;
        }
        this._ngZone.runOutsideAngular(() => {
            this._resizeObserver = new ResizeObserver(() => {
                if (this._isActive()) {
                    return;
                }
                if (this._resizeTimer) {
                    clearTimeout(this._resizeTimer);
                }
                this._onResize();
            });
            this._resizeObserver.observe(this._elementRef.nativeElement);
        });
    }
    /** Whether any of the thumbs are currently active. */
    _isActive() {
        return this._getThumb(_MatThumb.START)._isActive || this._getThumb(_MatThumb.END)._isActive;
    }
    _getValue(thumbPosition = _MatThumb.END) {
        const input = this._getInput(thumbPosition);
        if (!input) {
            return this.min;
        }
        return input.value;
    }
    _skipUpdate() {
        return !!(this._getInput(_MatThumb.START)?._skipUIUpdate || this._getInput(_MatThumb.END)?._skipUIUpdate);
    }
    /** Stores the slider dimensions. */
    _updateDimensions() {
        this._cachedWidth = this._elementRef.nativeElement.offsetWidth;
        this._cachedLeft = this._elementRef.nativeElement.getBoundingClientRect().left;
    }
    /** Sets the styles for the active portion of the track. */
    _setTrackActiveStyles(styles) {
        const trackStyle = this._trackActive.nativeElement.style;
        trackStyle.left = styles.left;
        trackStyle.right = styles.right;
        trackStyle.transformOrigin = styles.transformOrigin;
        trackStyle.transform = styles.transform;
    }
    /** Returns the translateX positioning for a tick mark based on it's index. */
    _calcTickMarkTransform(index) {
        // TODO(wagnermaciel): See if we can avoid doing this and just using flex to position these.
        const translateX = index * (this._tickMarkTrackWidth / (this._tickMarks.length - 1));
        return `translateX(${translateX}px`;
    }
    // Handlers for updating the slider ui.
    _onTranslateXChange(source) {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateThumbUI(source);
        this._updateTrackUI(source);
        this._updateOverlappingThumbUI(source);
    }
    _onTranslateXChangeBySideEffect(input1, input2) {
        if (!this._hasViewInitialized) {
            return;
        }
        input1._updateThumbUIByValue();
        input2._updateThumbUIByValue();
    }
    _onValueChange(source) {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateValueIndicatorUI(source);
        this._updateTickMarkUI();
        this._cdr.detectChanges();
    }
    _onMinMaxOrStepChange() {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateTickMarkUI();
        this._updateTickMarkTrackUI();
        this._cdr.markForCheck();
    }
    _onResize() {
        if (!this._hasViewInitialized) {
            return;
        }
        this._updateDimensions();
        if (this._isRange) {
            const eInput = this._getInput(_MatThumb.END);
            const sInput = this._getInput(_MatThumb.START);
            eInput._updateThumbUIByValue();
            sInput._updateThumbUIByValue();
            eInput._updateStaticStyles();
            sInput._updateStaticStyles();
            eInput._updateMinMax();
            sInput._updateMinMax();
            eInput._updateWidthInactive();
            sInput._updateWidthInactive();
        }
        else {
            const eInput = this._getInput(_MatThumb.END);
            if (eInput) {
                eInput._updateThumbUIByValue();
            }
        }
        this._updateTickMarkUI();
        this._updateTickMarkTrackUI();
        this._cdr.detectChanges();
    }
    /** Returns true if the slider knobs are overlapping one another. */
    _areThumbsOverlapping() {
        const startInput = this._getInput(_MatThumb.START);
        const endInput = this._getInput(_MatThumb.END);
        if (!startInput || !endInput) {
            return false;
        }
        return endInput.translateX - startInput.translateX < 20;
    }
    /**
     * Updates the class names of overlapping slider thumbs so
     * that the current active thumb is styled to be on "top".
     */
    _updateOverlappingThumbClassNames(source) {
        const sibling = source.getSibling();
        const sourceThumb = this._getThumb(source.thumbPosition);
        const siblingThumb = this._getThumb(sibling.thumbPosition);
        siblingThumb._hostElement.classList.remove('mdc-slider__thumb--top');
        sourceThumb._hostElement.classList.toggle('mdc-slider__thumb--top', this._thumbsOverlap);
    }
    /** Updates the UI of slider thumbs when they begin or stop overlapping. */
    _updateOverlappingThumbUI(source) {
        if (!this._isRange || this._skipUpdate()) {
            return;
        }
        if (this._thumbsOverlap !== this._areThumbsOverlapping()) {
            this._thumbsOverlap = !this._thumbsOverlap;
            this._updateOverlappingThumbClassNames(source);
        }
    }
    // _MatThumb styles update conditions
    //
    // 1. TranslateX, resize, or dir change
    //    - Reason: The thumb styles need to be updated according to the new translateX.
    // 2. Min, max, or step
    //    - Reason: The value may have silently changed.
    /** Updates the translateX of the given thumb. */
    _updateThumbUI(source) {
        if (this._skipUpdate()) {
            return;
        }
        const thumb = this._getThumb(source.thumbPosition === _MatThumb.END ? _MatThumb.END : _MatThumb.START);
        thumb._hostElement.style.transform = `translateX(${source.translateX}px)`;
    }
    // Value indicator text update conditions
    //
    // 1. Value
    //    - Reason: The value displayed needs to be updated.
    // 2. Min, max, or step
    //    - Reason: The value may have silently changed.
    /** Updates the value indicator tooltip ui for the given thumb. */
    _updateValueIndicatorUI(source) {
        if (this._skipUpdate()) {
            return;
        }
        const valuetext = this.displayWith(source.value);
        this._hasViewInitialized
            ? source._valuetext.set(valuetext)
            : source._hostElement.setAttribute('aria-valuetext', valuetext);
        if (this.discrete) {
            source.thumbPosition === _MatThumb.START
                ? (this.startValueIndicatorText = valuetext)
                : (this.endValueIndicatorText = valuetext);
            const visualThumb = this._getThumb(source.thumbPosition);
            valuetext.length < 3
                ? visualThumb._hostElement.classList.add('mdc-slider__thumb--short-value')
                : visualThumb._hostElement.classList.remove('mdc-slider__thumb--short-value');
        }
    }
    /** Updates all value indicator UIs in the slider. */
    _updateValueIndicatorUIs() {
        const eInput = this._getInput(_MatThumb.END);
        const sInput = this._getInput(_MatThumb.START);
        if (eInput) {
            this._updateValueIndicatorUI(eInput);
        }
        if (sInput) {
            this._updateValueIndicatorUI(sInput);
        }
    }
    // Update Tick Mark Track Width
    //
    // 1. Min, max, or step
    //    - Reason: The maximum reachable value may have changed.
    //    - Side note: The maximum reachable value is different from the maximum value set by the
    //      user. For example, a slider with [min: 5, max: 100, step: 10] would have a maximum
    //      reachable value of 95.
    // 2. Resize
    //    - Reason: The position for the maximum reachable value needs to be recalculated.
    /** Updates the width of the tick mark track. */
    _updateTickMarkTrackUI() {
        if (!this.showTickMarks || this._skipUpdate()) {
            return;
        }
        const step = this._step && this._step > 0 ? this._step : 1;
        const maxValue = Math.floor(this.max / step) * step;
        const percentage = (maxValue - this.min) / (this.max - this.min);
        this._tickMarkTrackWidth = this._cachedWidth * percentage - 6;
    }
    // Track active update conditions
    //
    // 1. TranslateX
    //    - Reason: The track active should line up with the new thumb position.
    // 2. Min or max
    //    - Reason #1: The 'active' percentage needs to be recalculated.
    //    - Reason #2: The value may have silently changed.
    // 3. Step
    //    - Reason: The value may have silently changed causing the thumb(s) to shift.
    // 4. Dir change
    //    - Reason: The track active will need to be updated according to the new thumb position(s).
    // 5. Resize
    //    - Reason: The total width the 'active' tracks translateX is based on has changed.
    /** Updates the scale on the active portion of the track. */
    _updateTrackUI(source) {
        if (this._skipUpdate()) {
            return;
        }
        this._isRange
            ? this._updateTrackUIRange(source)
            : this._updateTrackUINonRange(source);
    }
    _updateTrackUIRange(source) {
        const sibling = source.getSibling();
        if (!sibling || !this._cachedWidth) {
            return;
        }
        const activePercentage = Math.abs(sibling.translateX - source.translateX) / this._cachedWidth;
        if (source._isLeftThumb && this._cachedWidth) {
            this._setTrackActiveStyles({
                left: 'auto',
                right: `${this._cachedWidth - sibling.translateX}px`,
                transformOrigin: 'right',
                transform: `scaleX(${activePercentage})`,
            });
        }
        else {
            this._setTrackActiveStyles({
                left: `${sibling.translateX}px`,
                right: 'auto',
                transformOrigin: 'left',
                transform: `scaleX(${activePercentage})`,
            });
        }
    }
    _updateTrackUINonRange(source) {
        this._isRtl
            ? this._setTrackActiveStyles({
                left: 'auto',
                right: '0px',
                transformOrigin: 'right',
                transform: `scaleX(${1 - source.fillPercentage})`,
            })
            : this._setTrackActiveStyles({
                left: '0px',
                right: 'auto',
                transformOrigin: 'left',
                transform: `scaleX(${source.fillPercentage})`,
            });
    }
    // Tick mark update conditions
    //
    // 1. Value
    //    - Reason: a tick mark which was once active might now be inactive or vice versa.
    // 2. Min, max, or step
    //    - Reason #1: the number of tick marks may have changed.
    //    - Reason #2: The value may have silently changed.
    /** Updates the dots along the slider track. */
    _updateTickMarkUI() {
        if (!this.showTickMarks ||
            this.step === undefined ||
            this.min === undefined ||
            this.max === undefined) {
            return;
        }
        const step = this.step > 0 ? this.step : 1;
        this._isRange ? this._updateTickMarkUIRange(step) : this._updateTickMarkUINonRange(step);
        if (this._isRtl) {
            this._tickMarks.reverse();
        }
    }
    _updateTickMarkUINonRange(step) {
        const value = this._getValue();
        let numActive = Math.max(Math.round((value - this.min) / step), 0);
        let numInactive = Math.max(Math.round((this.max - value) / step), 0);
        this._isRtl ? numActive++ : numInactive++;
        this._tickMarks = Array(numActive)
            .fill(_MatTickMark.ACTIVE)
            .concat(Array(numInactive).fill(_MatTickMark.INACTIVE));
    }
    _updateTickMarkUIRange(step) {
        const endValue = this._getValue();
        const startValue = this._getValue(_MatThumb.START);
        const numInactiveBeforeStartThumb = Math.max(Math.round((startValue - this.min) / step), 0);
        const numActive = Math.max(Math.round((endValue - startValue) / step) + 1, 0);
        const numInactiveAfterEndThumb = Math.max(Math.round((this.max - endValue) / step), 0);
        this._tickMarks = Array(numInactiveBeforeStartThumb)
            .fill(_MatTickMark.INACTIVE)
            .concat(Array(numActive).fill(_MatTickMark.ACTIVE), Array(numInactiveAfterEndThumb).fill(_MatTickMark.INACTIVE));
    }
    /** Gets the slider thumb input of the given thumb position. */
    _getInput(thumbPosition) {
        if (thumbPosition === _MatThumb.END && this._input) {
            return this._input;
        }
        if (this._inputs?.length) {
            return thumbPosition === _MatThumb.START ? this._inputs.first : this._inputs.last;
        }
        return;
    }
    /** Gets the slider thumb HTML input element of the given thumb position. */
    _getThumb(thumbPosition) {
        return thumbPosition === _MatThumb.END ? this._thumbs?.last : this._thumbs?.first;
    }
    _setTransition(withAnimation) {
        this._hasAnimation = !this._platform.IOS && withAnimation && !this._noopAnimations;
        this._elementRef.nativeElement.classList.toggle('mat-mdc-slider-with-animation', this._hasAnimation);
    }
    /** Whether the given pointer event occurred within the bounds of the slider pointer's DOM Rect. */
    _isCursorOnSliderThumb(event, rect) {
        const radius = rect.width / 2;
        const centerX = rect.x + radius;
        const centerY = rect.y + radius;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        return Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlider, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.Directionality, optional: true }, { token: MAT_RIPPLE_GLOBAL_OPTIONS, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0-next.2", type: MatSlider, isStandalone: true, selector: "mat-slider", inputs: { disabled: ["disabled", "disabled", booleanAttribute], discrete: ["discrete", "discrete", booleanAttribute], showTickMarks: ["showTickMarks", "showTickMarks", booleanAttribute], min: ["min", "min", numberAttribute], color: "color", disableRipple: ["disableRipple", "disableRipple", booleanAttribute], max: ["max", "max", numberAttribute], step: ["step", "step", numberAttribute], displayWith: "displayWith" }, host: { properties: { "class": "\"mat-\" + (color || \"primary\")", "class.mdc-slider--range": "_isRange", "class.mdc-slider--disabled": "disabled", "class.mdc-slider--discrete": "discrete", "class.mdc-slider--tick-marks": "showTickMarks", "class._mat-animation-noopable": "_noopAnimations" }, classAttribute: "mat-mdc-slider mdc-slider" }, providers: [{ provide: MAT_SLIDER, useExisting: MatSlider }], queries: [{ propertyName: "_input", first: true, predicate: MAT_SLIDER_THUMB, descendants: true }, { propertyName: "_inputs", predicate: MAT_SLIDER_RANGE_THUMB }], viewQueries: [{ propertyName: "_trackActive", first: true, predicate: ["trackActive"], descendants: true }, { propertyName: "_thumbs", predicate: MAT_SLIDER_VISUAL_THUMB, descendants: true }], exportAs: ["matSlider"], ngImport: i0, template: "<!-- Inputs -->\n<ng-content></ng-content>\n\n<!-- Track -->\n<div class=\"mdc-slider__track\">\n  <div class=\"mdc-slider__track--inactive\"></div>\n  <div class=\"mdc-slider__track--active\">\n    <div #trackActive class=\"mdc-slider__track--active_fill\"></div>\n  </div>\n  @if (showTickMarks) {\n    <div class=\"mdc-slider__tick-marks\" #tickMarkContainer>\n      @if (_cachedWidth) {\n        @for (tickMark of _tickMarks; track i; let i = $index) {\n          <div\n            [class]=\"tickMark === 0 ? 'mdc-slider__tick-mark--active' : 'mdc-slider__tick-mark--inactive'\"\n            [style.transform]=\"_calcTickMarkTransform(i)\"></div>\n        }\n      }\n    </div>\n  }\n</div>\n\n<!-- Thumbs -->\n@if (_isRange) {\n  <mat-slider-visual-thumb\n    [discrete]=\"discrete\"\n    [thumbPosition]=\"1\"\n    [valueIndicatorText]=\"startValueIndicatorText\">\n  </mat-slider-visual-thumb>\n}\n\n<mat-slider-visual-thumb\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"2\"\n  [valueIndicatorText]=\"endValueIndicatorText\">\n</mat-slider-visual-thumb>\n", styles: [".mdc-slider__track{position:absolute;top:50%;transform:translateY(-50%);width:100%;pointer-events:none;height:var(--mdc-slider-inactive-track-height)}.mdc-slider__track--active,.mdc-slider__track--inactive{display:flex;height:100%;position:absolute;width:100%}.mdc-slider__track--active{overflow:hidden;border-radius:var(--mdc-slider-active-track-shape, var(--mat-app-corner-full));height:var(--mdc-slider-active-track-height);top:calc((var(--mdc-slider-inactive-track-height) - var(--mdc-slider-active-track-height))/2)}.mdc-slider__track--active_fill{border-top-style:solid;box-sizing:border-box;height:100%;width:100%;position:relative;transform-origin:left;transition:transform 80ms ease;border-color:var(--mdc-slider-active-track-color, var(--mat-app-primary));border-top-width:var(--mdc-slider-active-track-height)}.mdc-slider--disabled .mdc-slider__track--active_fill{border-color:var(--mdc-slider-disabled-active-track-color, var(--mat-app-on-surface))}[dir=rtl] .mdc-slider__track--active_fill{-webkit-transform-origin:right;transform-origin:right}.mdc-slider__track--inactive{left:0;top:0;opacity:.24;background-color:var(--mdc-slider-inactive-track-color, var(--mat-app-surface-variant));height:var(--mdc-slider-inactive-track-height);border-radius:var(--mdc-slider-inactive-track-shape, var(--mat-app-corner-full))}.mdc-slider--disabled .mdc-slider__track--inactive{background-color:var(--mdc-slider-disabled-inactive-track-color, var(--mat-app-on-surface));opacity:.24}.mdc-slider__track--inactive::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}.cdk-high-contrast-active .mdc-slider__track--inactive::before{border-color:CanvasText}.mdc-slider__value-indicator-container{bottom:44px;left:50%;pointer-events:none;position:absolute;transform:translateX(-50%);transform:var(--mat-slider-value-indicator-container-transform)}.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container{pointer-events:auto}.mdc-slider__value-indicator{display:flex;align-items:center;border-radius:4px;height:32px;padding:0 12px;transform:scale(0);transform-origin:bottom;opacity:1;transition:transform 100ms cubic-bezier(0.4, 0, 1, 1);word-break:normal;background-color:var(--mdc-slider-label-container-color, var(--mat-app-primary));color:var(--mdc-slider-label-label-text-color, var(--mat-app-on-primary));width:var(--mat-slider-value-indicator-width);height:var(--mat-slider-value-indicator-height);padding:var(--mat-slider-value-indicator-padding);opacity:var(--mat-slider-value-indicator-opacity);border-radius:var(--mat-slider-value-indicator-border-radius)}.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:transform 100ms cubic-bezier(0, 0, 0.2, 1);transform:scale(1)}.mdc-slider__value-indicator::before{border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-top:6px solid;bottom:-5px;content:\"\";height:0;left:50%;position:absolute;transform:translateX(-50%);width:0;display:var(--mat-slider-value-indicator-caret-display);border-top-color:var(--mdc-slider-label-container-color, var(--mat-app-primary))}.mdc-slider__value-indicator::after{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}.cdk-high-contrast-active .mdc-slider__value-indicator::after{border-color:CanvasText}.mdc-slider__value-indicator-text{text-align:center;width:var(--mat-slider-value-indicator-width);transform:var(--mat-slider-value-indicator-text-transform);font-family:var(--mdc-slider-label-label-text-font, var(--mat-app-label-medium-font));font-size:var(--mdc-slider-label-label-text-size, var(--mat-app-label-medium-size));font-weight:var(--mdc-slider-label-label-text-weight, var(--mat-app-label-medium-weight));line-height:var(--mdc-slider-label-label-text-line-height, var(--mat-app-label-medium-line-height));letter-spacing:var(--mdc-slider-label-label-text-tracking, var(--mat-app-label-medium-tracking))}.mdc-slider__thumb{-webkit-user-select:none;user-select:none;display:flex;left:-24px;outline:none;position:absolute;height:48px;width:48px;pointer-events:none}.mdc-slider--discrete .mdc-slider__thumb{transition:transform 80ms ease}.mdc-slider--disabled .mdc-slider__thumb{pointer-events:none}.mdc-slider__thumb--top{z-index:1}.mdc-slider__thumb-knob{position:absolute;box-sizing:border-box;left:50%;top:50%;transform:translate(-50%, -50%);border-style:solid;width:var(--mdc-slider-handle-width);height:var(--mdc-slider-handle-height);border-width:calc(var(--mdc-slider-handle-height)/2) calc(var(--mdc-slider-handle-width)/2);box-shadow:var(--mdc-slider-handle-elevation, var(--mat-app-level1));background-color:var(--mdc-slider-handle-color, var(--mat-app-primary));border-color:var(--mdc-slider-handle-color, var(--mat-app-primary));border-radius:var(--mdc-slider-handle-shape, var(--mat-app-corner-full))}.mdc-slider__thumb:hover .mdc-slider__thumb-knob{background-color:var(--mdc-slider-hover-handle-color, var(--mat-app-primary));border-color:var(--mdc-slider-hover-handle-color, var(--mat-app-primary))}.mdc-slider__thumb--focused .mdc-slider__thumb-knob{background-color:var(--mdc-slider-focus-handle-color, var(--mat-app-primary));border-color:var(--mdc-slider-focus-handle-color, var(--mat-app-primary))}.mdc-slider--disabled .mdc-slider__thumb-knob{background-color:var(--mdc-slider-disabled-handle-color, var(--mat-app-on-surface));border-color:var(--mdc-slider-disabled-handle-color, var(--mat-app-on-surface))}.mdc-slider__thumb--top .mdc-slider__thumb-knob,.mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border:solid 1px #fff;box-sizing:content-box;border-color:var(--mdc-slider-with-overlap-handle-outline-color, var(--mat-app-on-primary));border-width:var(--mdc-slider-with-overlap-handle-outline-width)}.mdc-slider__tick-marks{align-items:center;box-sizing:border-box;display:flex;height:100%;justify-content:space-between;padding:0 1px;position:absolute;width:100%}.mdc-slider__tick-mark--active,.mdc-slider__tick-mark--inactive{width:var(--mdc-slider-with-tick-marks-container-size);height:var(--mdc-slider-with-tick-marks-container-size);border-radius:var(--mdc-slider-with-tick-marks-container-shape, var(--mat-app-corner-full))}.mdc-slider__tick-mark--inactive{opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity);background-color:var(--mdc-slider-with-tick-marks-inactive-container-color, var(--mat-app-on-surface-variant))}.mdc-slider--disabled .mdc-slider__tick-mark--inactive{opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity);background-color:var(--mdc-slider-with-tick-marks-disabled-container-color, var(--mat-app-on-surface))}.mdc-slider__tick-mark--active{opacity:var(--mdc-slider-with-tick-marks-active-container-opacity);background-color:var(--mdc-slider-with-tick-marks-active-container-color, var(--mat-app-on-primary))}.mdc-slider__input{cursor:pointer;left:2px;margin:0;height:44px;opacity:0;position:absolute;top:2px;width:44px;box-sizing:content-box}.mdc-slider__input.mat-mdc-slider-input-no-pointer-events{pointer-events:none}.mdc-slider__input.mat-slider__right-input{left:auto;right:0}.mat-mdc-slider{display:inline-block;box-sizing:border-box;outline:none;vertical-align:middle;cursor:pointer;height:48px;margin:0 8px;position:relative;touch-action:pan-y;width:auto;min-width:112px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-slider.mdc-slider--disabled{cursor:auto;opacity:.38}.mat-mdc-slider .mdc-slider__thumb,.mat-mdc-slider .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider .mat-ripple .mat-ripple-element{background-color:var(--mat-slider-ripple-color, var(--mat-app-primary))}.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple{background-color:var(--mat-slider-hover-state-layer-color)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple{background-color:var(--mat-slider-focus-state-layer-color)}.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator{transition:none}.mat-mdc-slider .mat-mdc-focus-indicator::before{border-radius:50%}.mdc-slider__thumb--focused .mat-mdc-focus-indicator::before{content:\"\"}"], dependencies: [{ kind: "component", type: MatSliderVisualThumb, selector: "mat-slider-visual-thumb", inputs: ["discrete", "thumbPosition", "valueIndicatorText"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSlider, decorators: [{
            type: Component,
            args: [{ selector: 'mat-slider', host: {
                        'class': 'mat-mdc-slider mdc-slider',
                        '[class]': '"mat-" + (color || "primary")',
                        '[class.mdc-slider--range]': '_isRange',
                        '[class.mdc-slider--disabled]': 'disabled',
                        '[class.mdc-slider--discrete]': 'discrete',
                        '[class.mdc-slider--tick-marks]': 'showTickMarks',
                        '[class._mat-animation-noopable]': '_noopAnimations',
                    }, exportAs: 'matSlider', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [{ provide: MAT_SLIDER, useExisting: MatSlider }], standalone: true, imports: [MatSliderVisualThumb], template: "<!-- Inputs -->\n<ng-content></ng-content>\n\n<!-- Track -->\n<div class=\"mdc-slider__track\">\n  <div class=\"mdc-slider__track--inactive\"></div>\n  <div class=\"mdc-slider__track--active\">\n    <div #trackActive class=\"mdc-slider__track--active_fill\"></div>\n  </div>\n  @if (showTickMarks) {\n    <div class=\"mdc-slider__tick-marks\" #tickMarkContainer>\n      @if (_cachedWidth) {\n        @for (tickMark of _tickMarks; track i; let i = $index) {\n          <div\n            [class]=\"tickMark === 0 ? 'mdc-slider__tick-mark--active' : 'mdc-slider__tick-mark--inactive'\"\n            [style.transform]=\"_calcTickMarkTransform(i)\"></div>\n        }\n      }\n    </div>\n  }\n</div>\n\n<!-- Thumbs -->\n@if (_isRange) {\n  <mat-slider-visual-thumb\n    [discrete]=\"discrete\"\n    [thumbPosition]=\"1\"\n    [valueIndicatorText]=\"startValueIndicatorText\">\n  </mat-slider-visual-thumb>\n}\n\n<mat-slider-visual-thumb\n  [discrete]=\"discrete\"\n  [thumbPosition]=\"2\"\n  [valueIndicatorText]=\"endValueIndicatorText\">\n</mat-slider-visual-thumb>\n", styles: [".mdc-slider__track{position:absolute;top:50%;transform:translateY(-50%);width:100%;pointer-events:none;height:var(--mdc-slider-inactive-track-height)}.mdc-slider__track--active,.mdc-slider__track--inactive{display:flex;height:100%;position:absolute;width:100%}.mdc-slider__track--active{overflow:hidden;border-radius:var(--mdc-slider-active-track-shape, var(--mat-app-corner-full));height:var(--mdc-slider-active-track-height);top:calc((var(--mdc-slider-inactive-track-height) - var(--mdc-slider-active-track-height))/2)}.mdc-slider__track--active_fill{border-top-style:solid;box-sizing:border-box;height:100%;width:100%;position:relative;transform-origin:left;transition:transform 80ms ease;border-color:var(--mdc-slider-active-track-color, var(--mat-app-primary));border-top-width:var(--mdc-slider-active-track-height)}.mdc-slider--disabled .mdc-slider__track--active_fill{border-color:var(--mdc-slider-disabled-active-track-color, var(--mat-app-on-surface))}[dir=rtl] .mdc-slider__track--active_fill{-webkit-transform-origin:right;transform-origin:right}.mdc-slider__track--inactive{left:0;top:0;opacity:.24;background-color:var(--mdc-slider-inactive-track-color, var(--mat-app-surface-variant));height:var(--mdc-slider-inactive-track-height);border-radius:var(--mdc-slider-inactive-track-shape, var(--mat-app-corner-full))}.mdc-slider--disabled .mdc-slider__track--inactive{background-color:var(--mdc-slider-disabled-inactive-track-color, var(--mat-app-on-surface));opacity:.24}.mdc-slider__track--inactive::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}.cdk-high-contrast-active .mdc-slider__track--inactive::before{border-color:CanvasText}.mdc-slider__value-indicator-container{bottom:44px;left:50%;pointer-events:none;position:absolute;transform:translateX(-50%);transform:var(--mat-slider-value-indicator-container-transform)}.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container{pointer-events:auto}.mdc-slider__value-indicator{display:flex;align-items:center;border-radius:4px;height:32px;padding:0 12px;transform:scale(0);transform-origin:bottom;opacity:1;transition:transform 100ms cubic-bezier(0.4, 0, 1, 1);word-break:normal;background-color:var(--mdc-slider-label-container-color, var(--mat-app-primary));color:var(--mdc-slider-label-label-text-color, var(--mat-app-on-primary));width:var(--mat-slider-value-indicator-width);height:var(--mat-slider-value-indicator-height);padding:var(--mat-slider-value-indicator-padding);opacity:var(--mat-slider-value-indicator-opacity);border-radius:var(--mat-slider-value-indicator-border-radius)}.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator{transition:transform 100ms cubic-bezier(0, 0, 0.2, 1);transform:scale(1)}.mdc-slider__value-indicator::before{border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-top:6px solid;bottom:-5px;content:\"\";height:0;left:50%;position:absolute;transform:translateX(-50%);width:0;display:var(--mat-slider-value-indicator-caret-display);border-top-color:var(--mdc-slider-label-container-color, var(--mat-app-primary))}.mdc-slider__value-indicator::after{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:\"\";pointer-events:none}.cdk-high-contrast-active .mdc-slider__value-indicator::after{border-color:CanvasText}.mdc-slider__value-indicator-text{text-align:center;width:var(--mat-slider-value-indicator-width);transform:var(--mat-slider-value-indicator-text-transform);font-family:var(--mdc-slider-label-label-text-font, var(--mat-app-label-medium-font));font-size:var(--mdc-slider-label-label-text-size, var(--mat-app-label-medium-size));font-weight:var(--mdc-slider-label-label-text-weight, var(--mat-app-label-medium-weight));line-height:var(--mdc-slider-label-label-text-line-height, var(--mat-app-label-medium-line-height));letter-spacing:var(--mdc-slider-label-label-text-tracking, var(--mat-app-label-medium-tracking))}.mdc-slider__thumb{-webkit-user-select:none;user-select:none;display:flex;left:-24px;outline:none;position:absolute;height:48px;width:48px;pointer-events:none}.mdc-slider--discrete .mdc-slider__thumb{transition:transform 80ms ease}.mdc-slider--disabled .mdc-slider__thumb{pointer-events:none}.mdc-slider__thumb--top{z-index:1}.mdc-slider__thumb-knob{position:absolute;box-sizing:border-box;left:50%;top:50%;transform:translate(-50%, -50%);border-style:solid;width:var(--mdc-slider-handle-width);height:var(--mdc-slider-handle-height);border-width:calc(var(--mdc-slider-handle-height)/2) calc(var(--mdc-slider-handle-width)/2);box-shadow:var(--mdc-slider-handle-elevation, var(--mat-app-level1));background-color:var(--mdc-slider-handle-color, var(--mat-app-primary));border-color:var(--mdc-slider-handle-color, var(--mat-app-primary));border-radius:var(--mdc-slider-handle-shape, var(--mat-app-corner-full))}.mdc-slider__thumb:hover .mdc-slider__thumb-knob{background-color:var(--mdc-slider-hover-handle-color, var(--mat-app-primary));border-color:var(--mdc-slider-hover-handle-color, var(--mat-app-primary))}.mdc-slider__thumb--focused .mdc-slider__thumb-knob{background-color:var(--mdc-slider-focus-handle-color, var(--mat-app-primary));border-color:var(--mdc-slider-focus-handle-color, var(--mat-app-primary))}.mdc-slider--disabled .mdc-slider__thumb-knob{background-color:var(--mdc-slider-disabled-handle-color, var(--mat-app-on-surface));border-color:var(--mdc-slider-disabled-handle-color, var(--mat-app-on-surface))}.mdc-slider__thumb--top .mdc-slider__thumb-knob,.mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob,.mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob{border:solid 1px #fff;box-sizing:content-box;border-color:var(--mdc-slider-with-overlap-handle-outline-color, var(--mat-app-on-primary));border-width:var(--mdc-slider-with-overlap-handle-outline-width)}.mdc-slider__tick-marks{align-items:center;box-sizing:border-box;display:flex;height:100%;justify-content:space-between;padding:0 1px;position:absolute;width:100%}.mdc-slider__tick-mark--active,.mdc-slider__tick-mark--inactive{width:var(--mdc-slider-with-tick-marks-container-size);height:var(--mdc-slider-with-tick-marks-container-size);border-radius:var(--mdc-slider-with-tick-marks-container-shape, var(--mat-app-corner-full))}.mdc-slider__tick-mark--inactive{opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity);background-color:var(--mdc-slider-with-tick-marks-inactive-container-color, var(--mat-app-on-surface-variant))}.mdc-slider--disabled .mdc-slider__tick-mark--inactive{opacity:var(--mdc-slider-with-tick-marks-inactive-container-opacity);background-color:var(--mdc-slider-with-tick-marks-disabled-container-color, var(--mat-app-on-surface))}.mdc-slider__tick-mark--active{opacity:var(--mdc-slider-with-tick-marks-active-container-opacity);background-color:var(--mdc-slider-with-tick-marks-active-container-color, var(--mat-app-on-primary))}.mdc-slider__input{cursor:pointer;left:2px;margin:0;height:44px;opacity:0;position:absolute;top:2px;width:44px;box-sizing:content-box}.mdc-slider__input.mat-mdc-slider-input-no-pointer-events{pointer-events:none}.mdc-slider__input.mat-slider__right-input{left:auto;right:0}.mat-mdc-slider{display:inline-block;box-sizing:border-box;outline:none;vertical-align:middle;cursor:pointer;height:48px;margin:0 8px;position:relative;touch-action:pan-y;width:auto;min-width:112px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-slider.mdc-slider--disabled{cursor:auto;opacity:.38}.mat-mdc-slider .mdc-slider__thumb,.mat-mdc-slider .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill{transition-duration:0ms}.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill{transition-duration:80ms}.mat-mdc-slider .mat-ripple .mat-ripple-element{background-color:var(--mat-slider-ripple-color, var(--mat-app-primary))}.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple{background-color:var(--mat-slider-hover-state-layer-color)}.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple{background-color:var(--mat-slider-focus-state-layer-color)}.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb,.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator{transition:none}.mat-mdc-slider .mat-mdc-focus-indicator::before{border-radius:50%}.mdc-slider__thumb--focused .mat-mdc-focus-indicator::before{content:\"\"}"] }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_RIPPLE_GLOBAL_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }], propDecorators: { _trackActive: [{
                type: ViewChild,
                args: ['trackActive']
            }], _thumbs: [{
                type: ViewChildren,
                args: [MAT_SLIDER_VISUAL_THUMB]
            }], _input: [{
                type: ContentChild,
                args: [MAT_SLIDER_THUMB]
            }], _inputs: [{
                type: ContentChildren,
                args: [MAT_SLIDER_RANGE_THUMB, { descendants: false }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], discrete: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], showTickMarks: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], min: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], color: [{
                type: Input
            }], disableRipple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], max: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], step: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], displayWith: [{
                type: Input
            }] } });
/** Ensures that there is not an invalid configuration for the slider thumb inputs. */
function _validateInputs(isRange, endInputElement, startInputElement) {
    const startValid = !isRange || startInputElement?._hostElement.hasAttribute('matSliderStartThumb');
    const endValid = endInputElement?._hostElement.hasAttribute(isRange ? 'matSliderEndThumb' : 'matSliderThumb');
    if (!startValid || !endValid) {
        _throwInvalidInputConfigurationError();
    }
}
function _throwInvalidInputConfigurationError() {
    throw Error(`Invalid slider thumb input configuration!

   Valid configurations are as follows:

     <mat-slider>
       <input matSliderThumb>
     </mat-slider>

     or

     <mat-slider>
       <input matSliderStartThumb>
       <input matSliderEndThumb>
     </mat-slider>
   `);
}

/**
 * Provider that allows the slider thumb to register as a ControlValueAccessor.
 * @docs-private
 */
const MAT_SLIDER_THUMB_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatSliderThumb),
    multi: true,
};
/**
 * Provider that allows the range slider thumb to register as a ControlValueAccessor.
 * @docs-private
 */
const MAT_SLIDER_RANGE_THUMB_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatSliderRangeThumb),
    multi: true,
};
/**
 * Directive that adds slider-specific behaviors to an input element inside `<mat-slider>`.
 * Up to two may be placed inside of a `<mat-slider>`.
 *
 * If one is used, the selector `matSliderThumb` must be used, and the outcome will be a normal
 * slider. If two are used, the selectors `matSliderStartThumb` and `matSliderEndThumb` must be
 * used, and the outcome will be a range slider with two slider thumbs.
 */
class MatSliderThumb {
    get value() {
        return numberAttribute(this._hostElement.value, 0);
    }
    set value(value) {
        value = isNaN(value) ? 0 : value;
        const stringValue = value + '';
        if (!this._hasSetInitialValue) {
            this._initialValue = stringValue;
            return;
        }
        if (this._isActive) {
            return;
        }
        this._setValue(stringValue);
    }
    /**
     * Handles programmatic value setting. This has been split out to
     * allow the range thumb to override it and add additional necessary logic.
     */
    _setValue(value) {
        this._hostElement.value = value;
        this._updateThumbUIByValue();
        this._slider._onValueChange(this);
        this._cdr.detectChanges();
        this._slider._cdr.markForCheck();
    }
    /**
     * The current translateX in px of the slider visual thumb.
     * @docs-private
     */
    get translateX() {
        if (this._slider.min >= this._slider.max) {
            this._translateX = this._tickMarkOffset;
            return this._translateX;
        }
        if (this._translateX === undefined) {
            this._translateX = this._calcTranslateXByValue();
        }
        return this._translateX;
    }
    set translateX(v) {
        this._translateX = v;
    }
    /** @docs-private */
    get min() {
        return numberAttribute(this._hostElement.min, 0);
    }
    set min(v) {
        this._hostElement.min = v + '';
        this._cdr.detectChanges();
    }
    /** @docs-private */
    get max() {
        return numberAttribute(this._hostElement.max, 0);
    }
    set max(v) {
        this._hostElement.max = v + '';
        this._cdr.detectChanges();
    }
    get step() {
        return numberAttribute(this._hostElement.step, 0);
    }
    set step(v) {
        this._hostElement.step = v + '';
        this._cdr.detectChanges();
    }
    /** @docs-private */
    get disabled() {
        return booleanAttribute(this._hostElement.disabled);
    }
    set disabled(v) {
        this._hostElement.disabled = v;
        this._cdr.detectChanges();
        if (this._slider.disabled !== this.disabled) {
            this._slider.disabled = this.disabled;
        }
    }
    /** The percentage of the slider that coincides with the value. */
    get percentage() {
        if (this._slider.min >= this._slider.max) {
            return this._slider._isRtl ? 1 : 0;
        }
        return (this.value - this._slider.min) / (this._slider.max - this._slider.min);
    }
    /** @docs-private */
    get fillPercentage() {
        if (!this._slider._cachedWidth) {
            return this._slider._isRtl ? 1 : 0;
        }
        if (this._translateX === 0) {
            return 0;
        }
        return this.translateX / this._slider._cachedWidth;
    }
    /** Used to relay updates to _isFocused to the slider visual thumbs. */
    _setIsFocused(v) {
        this._isFocused = v;
    }
    constructor(_ngZone, _elementRef, _cdr, _slider) {
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._cdr = _cdr;
        this._slider = _slider;
        /** Event emitted when the `value` is changed. */
        this.valueChange = new EventEmitter();
        /** Event emitted when the slider thumb starts being dragged. */
        this.dragStart = new EventEmitter();
        /** Event emitted when the slider thumb stops being dragged. */
        this.dragEnd = new EventEmitter();
        /**
         * Indicates whether this thumb is the start or end thumb.
         * @docs-private
         */
        this.thumbPosition = _MatThumb.END;
        /** The aria-valuetext string representation of the input's value. */
        this._valuetext = signal('');
        /** The radius of a native html slider's knob. */
        this._knobRadius = 8;
        /** The distance in px from the start of the slider track to the first tick mark. */
        this._tickMarkOffset = 3;
        /** Whether user's cursor is currently in a mouse down state on the input. */
        this._isActive = false;
        /** Whether the input is currently focused (either by tab or after clicking). */
        this._isFocused = false;
        /**
         * Whether the initial value has been set.
         * This exists because the initial value cannot be immediately set because the min and max
         * must first be relayed from the parent MatSlider component, which can only happen later
         * in the component lifecycle.
         */
        this._hasSetInitialValue = false;
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /**
         * Indicates whether UI updates should be skipped.
         *
         * This flag is used to avoid flickering
         * when correcting values on pointer up/down.
         */
        this._skipUIUpdate = false;
        /** Callback called when the slider input has been touched. */
        this._onTouchedFn = () => { };
        /**
         * Whether the NgModel has been initialized.
         *
         * This flag is used to ignore ghost null calls to
         * writeValue which can break slider initialization.
         *
         * See https://github.com/angular/angular/issues/14988.
         */
        this._isControlInitialized = false;
        this._platform = inject(Platform);
        this._hostElement = _elementRef.nativeElement;
        this._ngZone.runOutsideAngular(() => {
            this._hostElement.addEventListener('pointerdown', this._onPointerDown.bind(this));
            this._hostElement.addEventListener('pointermove', this._onPointerMove.bind(this));
            this._hostElement.addEventListener('pointerup', this._onPointerUp.bind(this));
        });
    }
    ngOnDestroy() {
        this._hostElement.removeEventListener('pointerdown', this._onPointerDown);
        this._hostElement.removeEventListener('pointermove', this._onPointerMove);
        this._hostElement.removeEventListener('pointerup', this._onPointerUp);
        this._destroyed.next();
        this._destroyed.complete();
        this.dragStart.complete();
        this.dragEnd.complete();
    }
    /** @docs-private */
    initProps() {
        this._updateWidthInactive();
        // If this or the parent slider is disabled, just make everything disabled.
        if (this.disabled !== this._slider.disabled) {
            // The MatSlider setter for disabled will relay this and disable both inputs.
            this._slider.disabled = true;
        }
        this.step = this._slider.step;
        this.min = this._slider.min;
        this.max = this._slider.max;
        this._initValue();
    }
    /** @docs-private */
    initUI() {
        this._updateThumbUIByValue();
    }
    _initValue() {
        this._hasSetInitialValue = true;
        if (this._initialValue === undefined) {
            this.value = this._getDefaultValue();
        }
        else {
            this._hostElement.value = this._initialValue;
            this._updateThumbUIByValue();
            this._slider._onValueChange(this);
            this._cdr.detectChanges();
        }
    }
    _getDefaultValue() {
        return this.min;
    }
    _onBlur() {
        this._setIsFocused(false);
        this._onTouchedFn();
    }
    _onFocus() {
        this._slider._setTransition(false);
        this._slider._updateTrackUI(this);
        this._setIsFocused(true);
    }
    _onChange() {
        this.valueChange.emit(this.value);
        // only used to handle the edge case where user
        // mousedown on the slider then uses arrow keys.
        if (this._isActive) {
            this._updateThumbUIByValue({ withAnimation: true });
        }
    }
    _onInput() {
        this._onChangeFn?.(this.value);
        // handles arrowing and updating the value when
        // a step is defined.
        if (this._slider.step || !this._isActive) {
            this._updateThumbUIByValue({ withAnimation: true });
        }
        this._slider._onValueChange(this);
    }
    _onNgControlValueChange() {
        // only used to handle when the value change
        // originates outside of the slider.
        if (!this._isActive || !this._isFocused) {
            this._slider._onValueChange(this);
            this._updateThumbUIByValue();
        }
        this._slider.disabled = this._formControl.disabled;
    }
    _onPointerDown(event) {
        if (this.disabled || event.button !== 0) {
            return;
        }
        // On IOS, dragging only works if the pointer down happens on the
        // slider thumb and the slider does not receive focus from pointer events.
        if (this._platform.IOS) {
            const isCursorOnSliderThumb = this._slider._isCursorOnSliderThumb(event, this._slider._getThumb(this.thumbPosition)._hostElement.getBoundingClientRect());
            this._isActive = isCursorOnSliderThumb;
            this._updateWidthActive();
            this._slider._updateDimensions();
            return;
        }
        this._isActive = true;
        this._setIsFocused(true);
        this._updateWidthActive();
        this._slider._updateDimensions();
        // Does nothing if a step is defined because we
        // want the value to snap to the values on input.
        if (!this._slider.step) {
            this._updateThumbUIByPointerEvent(event, { withAnimation: true });
        }
        if (!this.disabled) {
            this._handleValueCorrection(event);
            this.dragStart.emit({ source: this, parent: this._slider, value: this.value });
        }
    }
    /**
     * Corrects the value of the slider on pointer up/down.
     *
     * Called on pointer down and up because the value is set based
     * on the inactive width instead of the active width.
     */
    _handleValueCorrection(event) {
        // Don't update the UI with the current value! The value on pointerdown
        // and pointerup is calculated in the split second before the input(s)
        // resize. See _updateWidthInactive() and _updateWidthActive() for more
        // details.
        this._skipUIUpdate = true;
        // Note that this function gets triggered before the actual value of the
        // slider is updated. This means if we were to set the value here, it
        // would immediately be overwritten. Using setTimeout ensures the setting
        // of the value happens after the value has been updated by the
        // pointerdown event.
        setTimeout(() => {
            this._skipUIUpdate = false;
            this._fixValue(event);
        }, 0);
    }
    /** Corrects the value of the slider based on the pointer event's position. */
    _fixValue(event) {
        const xPos = event.clientX - this._slider._cachedLeft;
        const width = this._slider._cachedWidth;
        const step = this._slider.step === 0 ? 1 : this._slider.step;
        const numSteps = Math.floor((this._slider.max - this._slider.min) / step);
        const percentage = this._slider._isRtl ? 1 - xPos / width : xPos / width;
        // To ensure the percentage is rounded to the necessary number of decimals.
        const fixedPercentage = Math.round(percentage * numSteps) / numSteps;
        const impreciseValue = fixedPercentage * (this._slider.max - this._slider.min) + this._slider.min;
        const value = Math.round(impreciseValue / step) * step;
        const prevValue = this.value;
        if (value === prevValue) {
            // Because we prevented UI updates, if it turns out that the race
            // condition didn't happen and the value is already correct, we
            // have to apply the ui updates now.
            this._slider._onValueChange(this);
            this._slider.step > 0
                ? this._updateThumbUIByValue()
                : this._updateThumbUIByPointerEvent(event, { withAnimation: this._slider._hasAnimation });
            return;
        }
        this.value = value;
        this.valueChange.emit(this.value);
        this._onChangeFn?.(this.value);
        this._slider._onValueChange(this);
        this._slider.step > 0
            ? this._updateThumbUIByValue()
            : this._updateThumbUIByPointerEvent(event, { withAnimation: this._slider._hasAnimation });
    }
    _onPointerMove(event) {
        // Again, does nothing if a step is defined because
        // we want the value to snap to the values on input.
        if (!this._slider.step && this._isActive) {
            this._updateThumbUIByPointerEvent(event);
        }
    }
    _onPointerUp() {
        if (this._isActive) {
            this._isActive = false;
            if (this._platform.SAFARI) {
                this._setIsFocused(false);
            }
            this.dragEnd.emit({ source: this, parent: this._slider, value: this.value });
            // This setTimeout is to prevent the pointerup from triggering a value
            // change on the input based on the inactive width. It's not clear why
            // but for some reason on IOS this race condition is even more common so
            // the timeout needs to be increased.
            setTimeout(() => this._updateWidthInactive(), this._platform.IOS ? 10 : 0);
        }
    }
    _clamp(v) {
        const min = this._tickMarkOffset;
        const max = this._slider._cachedWidth - this._tickMarkOffset;
        return Math.max(Math.min(v, max), min);
    }
    _calcTranslateXByValue() {
        if (this._slider._isRtl) {
            return ((1 - this.percentage) * (this._slider._cachedWidth - this._tickMarkOffset * 2) +
                this._tickMarkOffset);
        }
        return (this.percentage * (this._slider._cachedWidth - this._tickMarkOffset * 2) +
            this._tickMarkOffset);
    }
    _calcTranslateXByPointerEvent(event) {
        return event.clientX - this._slider._cachedLeft;
    }
    /**
     * Used to set the slider width to the correct
     * dimensions while the user is dragging.
     */
    _updateWidthActive() { }
    /**
     * Sets the slider input to disproportionate dimensions to allow for touch
     * events to be captured on touch devices.
     */
    _updateWidthInactive() {
        this._hostElement.style.padding = `0 ${this._slider._inputPadding}px`;
        this._hostElement.style.width = `calc(100% + ${this._slider._inputPadding - this._tickMarkOffset * 2}px)`;
        this._hostElement.style.left = `-${this._slider._rippleRadius - this._tickMarkOffset}px`;
    }
    _updateThumbUIByValue(options) {
        this.translateX = this._clamp(this._calcTranslateXByValue());
        this._updateThumbUI(options);
    }
    _updateThumbUIByPointerEvent(event, options) {
        this.translateX = this._clamp(this._calcTranslateXByPointerEvent(event));
        this._updateThumbUI(options);
    }
    _updateThumbUI(options) {
        this._slider._setTransition(!!options?.withAnimation);
        this._slider._onTranslateXChange(this);
    }
    /**
     * Sets the input's value.
     * @param value The new value of the input
     * @docs-private
     */
    writeValue(value) {
        if (this._isControlInitialized || value !== null) {
            this.value = value;
        }
    }
    /**
     * Registers a callback to be invoked when the input's value changes from user input.
     * @param fn The callback to register
     * @docs-private
     */
    registerOnChange(fn) {
        this._onChangeFn = fn;
        this._isControlInitialized = true;
    }
    /**
     * Registers a callback to be invoked when the input is blurred by the user.
     * @param fn The callback to register
     * @docs-private
     */
    registerOnTouched(fn) {
        this._onTouchedFn = fn;
    }
    /**
     * Sets the disabled state of the slider.
     * @param isDisabled The new disabled state
     * @docs-private
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    focus() {
        this._hostElement.focus();
    }
    blur() {
        this._hostElement.blur();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderThumb, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: MAT_SLIDER }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatSliderThumb, isStandalone: true, selector: "input[matSliderThumb]", inputs: { value: ["value", "value", numberAttribute] }, outputs: { valueChange: "valueChange", dragStart: "dragStart", dragEnd: "dragEnd" }, host: { attributes: { "type": "range" }, listeners: { "change": "_onChange()", "input": "_onInput()", "blur": "_onBlur()", "focus": "_onFocus()" }, properties: { "attr.aria-valuetext": "_valuetext()" }, classAttribute: "mdc-slider__input" }, providers: [
            MAT_SLIDER_THUMB_VALUE_ACCESSOR,
            { provide: MAT_SLIDER_THUMB, useExisting: MatSliderThumb },
        ], exportAs: ["matSliderThumb"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderThumb, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[matSliderThumb]',
                    exportAs: 'matSliderThumb',
                    host: {
                        'class': 'mdc-slider__input',
                        'type': 'range',
                        '[attr.aria-valuetext]': '_valuetext()',
                        '(change)': '_onChange()',
                        '(input)': '_onInput()',
                        // TODO(wagnermaciel): Consider using a global event listener instead.
                        // Reason: I have found a semi-consistent way to mouse up without triggering this event.
                        '(blur)': '_onBlur()',
                        '(focus)': '_onFocus()',
                    },
                    providers: [
                        MAT_SLIDER_THUMB_VALUE_ACCESSOR,
                        { provide: MAT_SLIDER_THUMB, useExisting: MatSliderThumb },
                    ],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_SLIDER]
                }] }], propDecorators: { value: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], valueChange: [{
                type: Output
            }], dragStart: [{
                type: Output
            }], dragEnd: [{
                type: Output
            }] } });
class MatSliderRangeThumb extends MatSliderThumb {
    /** @docs-private */
    getSibling() {
        if (!this._sibling) {
            this._sibling = this._slider._getInput(this._isEndThumb ? _MatThumb.START : _MatThumb.END);
        }
        return this._sibling;
    }
    /**
     * Returns the minimum translateX position allowed for this slider input's visual thumb.
     * @docs-private
     */
    getMinPos() {
        const sibling = this.getSibling();
        if (!this._isLeftThumb && sibling) {
            return sibling.translateX;
        }
        return this._tickMarkOffset;
    }
    /**
     * Returns the maximum translateX position allowed for this slider input's visual thumb.
     * @docs-private
     */
    getMaxPos() {
        const sibling = this.getSibling();
        if (this._isLeftThumb && sibling) {
            return sibling.translateX;
        }
        return this._slider._cachedWidth - this._tickMarkOffset;
    }
    _setIsLeftThumb() {
        this._isLeftThumb =
            (this._isEndThumb && this._slider._isRtl) || (!this._isEndThumb && !this._slider._isRtl);
    }
    constructor(_ngZone, _slider, _elementRef, _cdr) {
        super(_ngZone, _elementRef, _cdr, _slider);
        this._cdr = _cdr;
        this._isEndThumb = this._hostElement.hasAttribute('matSliderEndThumb');
        this._setIsLeftThumb();
        this.thumbPosition = this._isEndThumb ? _MatThumb.END : _MatThumb.START;
    }
    _getDefaultValue() {
        return this._isEndThumb && this._slider._isRange ? this.max : this.min;
    }
    _onInput() {
        super._onInput();
        this._updateSibling();
        if (!this._isActive) {
            this._updateWidthInactive();
        }
    }
    _onNgControlValueChange() {
        super._onNgControlValueChange();
        this.getSibling()?._updateMinMax();
    }
    _onPointerDown(event) {
        if (this.disabled || event.button !== 0) {
            return;
        }
        if (this._sibling) {
            this._sibling._updateWidthActive();
            this._sibling._hostElement.classList.add('mat-mdc-slider-input-no-pointer-events');
        }
        super._onPointerDown(event);
    }
    _onPointerUp() {
        super._onPointerUp();
        if (this._sibling) {
            setTimeout(() => {
                this._sibling._updateWidthInactive();
                this._sibling._hostElement.classList.remove('mat-mdc-slider-input-no-pointer-events');
            });
        }
    }
    _onPointerMove(event) {
        super._onPointerMove(event);
        if (!this._slider.step && this._isActive) {
            this._updateSibling();
        }
    }
    _fixValue(event) {
        super._fixValue(event);
        this._sibling?._updateMinMax();
    }
    _clamp(v) {
        return Math.max(Math.min(v, this.getMaxPos()), this.getMinPos());
    }
    _updateMinMax() {
        const sibling = this.getSibling();
        if (!sibling) {
            return;
        }
        if (this._isEndThumb) {
            this.min = Math.max(this._slider.min, sibling.value);
            this.max = this._slider.max;
        }
        else {
            this.min = this._slider.min;
            this.max = Math.min(this._slider.max, sibling.value);
        }
    }
    _updateWidthActive() {
        const minWidth = this._slider._rippleRadius * 2 - this._slider._inputPadding * 2;
        const maxWidth = this._slider._cachedWidth + this._slider._inputPadding - minWidth - this._tickMarkOffset * 2;
        const percentage = this._slider.min < this._slider.max
            ? (this.max - this.min) / (this._slider.max - this._slider.min)
            : 1;
        const width = maxWidth * percentage + minWidth;
        this._hostElement.style.width = `${width}px`;
        this._hostElement.style.padding = `0 ${this._slider._inputPadding}px`;
    }
    _updateWidthInactive() {
        const sibling = this.getSibling();
        if (!sibling) {
            return;
        }
        const maxWidth = this._slider._cachedWidth - this._tickMarkOffset * 2;
        const midValue = this._isEndThumb
            ? this.value - (this.value - sibling.value) / 2
            : this.value + (sibling.value - this.value) / 2;
        const _percentage = this._isEndThumb
            ? (this.max - midValue) / (this._slider.max - this._slider.min)
            : (midValue - this.min) / (this._slider.max - this._slider.min);
        const percentage = this._slider.min < this._slider.max ? _percentage : 1;
        // Extend the native input width by the radius of the ripple
        let ripplePadding = this._slider._rippleRadius;
        // If one of the inputs is maximally sized (the value of both thumbs is
        // equal to the min or max), make that input take up all of the width and
        // make the other unselectable.
        if (percentage === 1) {
            ripplePadding = 48;
        }
        else if (percentage === 0) {
            ripplePadding = 0;
        }
        const width = maxWidth * percentage + ripplePadding;
        this._hostElement.style.width = `${width}px`;
        this._hostElement.style.padding = '0px';
        if (this._isLeftThumb) {
            this._hostElement.style.left = `-${this._slider._rippleRadius - this._tickMarkOffset}px`;
            this._hostElement.style.right = 'auto';
        }
        else {
            this._hostElement.style.left = 'auto';
            this._hostElement.style.right = `-${this._slider._rippleRadius - this._tickMarkOffset}px`;
        }
    }
    _updateStaticStyles() {
        this._hostElement.classList.toggle('mat-slider__right-input', !this._isLeftThumb);
    }
    _updateSibling() {
        const sibling = this.getSibling();
        if (!sibling) {
            return;
        }
        sibling._updateMinMax();
        if (this._isActive) {
            sibling._updateWidthActive();
        }
        else {
            sibling._updateWidthInactive();
        }
    }
    /**
     * Sets the input's value.
     * @param value The new value of the input
     * @docs-private
     */
    writeValue(value) {
        if (this._isControlInitialized || value !== null) {
            this.value = value;
            this._updateWidthInactive();
            this._updateSibling();
        }
    }
    _setValue(value) {
        super._setValue(value);
        this._updateWidthInactive();
        this._updateSibling();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderRangeThumb, deps: [{ token: i0.NgZone }, { token: MAT_SLIDER }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatSliderRangeThumb, isStandalone: true, selector: "input[matSliderStartThumb], input[matSliderEndThumb]", providers: [
            MAT_SLIDER_RANGE_THUMB_VALUE_ACCESSOR,
            { provide: MAT_SLIDER_RANGE_THUMB, useExisting: MatSliderRangeThumb },
        ], exportAs: ["matSliderRangeThumb"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderRangeThumb, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[matSliderStartThumb], input[matSliderEndThumb]',
                    exportAs: 'matSliderRangeThumb',
                    providers: [
                        MAT_SLIDER_RANGE_THUMB_VALUE_ACCESSOR,
                        { provide: MAT_SLIDER_RANGE_THUMB, useExisting: MatSliderRangeThumb },
                    ],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_SLIDER]
                }] }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }] });

class MatSliderModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderModule, imports: [MatCommonModule,
            MatRippleModule,
            MatSlider,
            MatSliderThumb,
            MatSliderRangeThumb,
            MatSliderVisualThumb], exports: [MatSlider, MatSliderThumb, MatSliderRangeThumb] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderModule, imports: [MatCommonModule,
            MatRippleModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSliderModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        MatCommonModule,
                        MatRippleModule,
                        MatSlider,
                        MatSliderThumb,
                        MatSliderRangeThumb,
                        MatSliderVisualThumb,
                    ],
                    exports: [MatSlider, MatSliderThumb, MatSliderRangeThumb],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { MatSlider, MatSliderChange, MatSliderModule, MatSliderRangeThumb, MatSliderThumb, MatSliderVisualThumb };
//# sourceMappingURL=slider.mjs.map
