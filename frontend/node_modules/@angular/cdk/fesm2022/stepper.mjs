import { FocusKeyManager } from '@angular/cdk/a11y';
import * as i1 from '@angular/cdk/bidi';
import { BidiModule } from '@angular/cdk/bidi';
import { hasModifierKey, SPACE, ENTER } from '@angular/cdk/keycodes';
import * as i0 from '@angular/core';
import { Directive, InjectionToken, EventEmitter, forwardRef, booleanAttribute, TemplateRef, Component, ViewEncapsulation, ChangeDetectionStrategy, Inject, Optional, ContentChild, ContentChildren, ViewChild, Input, Output, QueryList, numberAttribute, NgModule } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { Subject, of } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

class CdkStepHeader {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
    /** Focuses the step header. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepHeader, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkStepHeader, isStandalone: true, selector: "[cdkStepHeader]", host: { attributes: { "role": "tab" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepHeader, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkStepHeader]',
                    host: {
                        'role': 'tab',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });

class CdkStepLabel {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepLabel, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkStepLabel, isStandalone: true, selector: "[cdkStepLabel]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepLabel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkStepLabel]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

/** Used to generate unique ID for each stepper component. */
let nextId = 0;
/** Change event emitted on selection changes. */
class StepperSelectionEvent {
}
/** Enum to represent the different states of the steps. */
const STEP_STATE = {
    NUMBER: 'number',
    EDIT: 'edit',
    DONE: 'done',
    ERROR: 'error',
};
/** InjectionToken that can be used to specify the global stepper options. */
const STEPPER_GLOBAL_OPTIONS = new InjectionToken('STEPPER_GLOBAL_OPTIONS');
class CdkStep {
    /** Whether step is marked as completed. */
    get completed() {
        return this._completedOverride == null ? this._getDefaultCompleted() : this._completedOverride;
    }
    set completed(value) {
        this._completedOverride = value;
    }
    _getDefaultCompleted() {
        return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
    }
    /** Whether step has an error. */
    get hasError() {
        return this._customError == null ? this._getDefaultError() : this._customError;
    }
    set hasError(value) {
        this._customError = value;
    }
    _getDefaultError() {
        return this.stepControl && this.stepControl.invalid && this.interacted;
    }
    constructor(_stepper, stepperOptions) {
        this._stepper = _stepper;
        /** Whether user has attempted to move away from the step. */
        this.interacted = false;
        /** Emits when the user has attempted to move away from the step. */
        this.interactedStream = new EventEmitter();
        /** Whether the user can return to this step once it has been marked as completed. */
        this.editable = true;
        /** Whether the completion of step is optional. */
        this.optional = false;
        this._completedOverride = null;
        this._customError = null;
        this._stepperOptions = stepperOptions ? stepperOptions : {};
        this._displayDefaultIndicatorType = this._stepperOptions.displayDefaultIndicatorType !== false;
    }
    /** Selects this step component. */
    select() {
        this._stepper.selected = this;
    }
    /** Resets the step to its initial state. Note that this includes resetting form data. */
    reset() {
        this.interacted = false;
        if (this._completedOverride != null) {
            this._completedOverride = false;
        }
        if (this._customError != null) {
            this._customError = false;
        }
        if (this.stepControl) {
            // Reset the forms since the default error state matchers will show errors on submit and we
            // want the form to be back to its initial state (see #29781). Submitted state is on the
            // individual directives, rather than the control, so we need to reset them ourselves.
            this._childForms?.forEach(form => form.resetForm?.());
            this.stepControl.reset();
        }
    }
    ngOnChanges() {
        // Since basically all inputs of the MatStep get proxied through the view down to the
        // underlying MatStepHeader, we have to make sure that change detection runs correctly.
        this._stepper._stateChanged();
    }
    _markAsInteracted() {
        if (!this.interacted) {
            this.interacted = true;
            this.interactedStream.emit(this);
        }
    }
    /** Determines whether the error state can be shown. */
    _showError() {
        // We want to show the error state either if the user opted into/out of it using the
        // global options, or if they've explicitly set it through the `hasError` input.
        return this._stepperOptions.showError ?? this._customError != null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStep, deps: [{ token: forwardRef(() => CdkStepper) }, { token: STEPPER_GLOBAL_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkStep, isStandalone: true, selector: "cdk-step", inputs: { stepControl: "stepControl", label: "label", errorMessage: "errorMessage", ariaLabel: ["aria-label", "ariaLabel"], ariaLabelledby: ["aria-labelledby", "ariaLabelledby"], state: "state", editable: ["editable", "editable", booleanAttribute], optional: ["optional", "optional", booleanAttribute], completed: ["completed", "completed", booleanAttribute], hasError: ["hasError", "hasError", booleanAttribute] }, outputs: { interactedStream: "interacted" }, queries: [{ propertyName: "stepLabel", first: true, predicate: CdkStepLabel, descendants: true }, { propertyName: "_childForms", predicate: 
                // Note: we look for `ControlContainer` here, because both `NgForm` and `FormGroupDirective`
                // provides themselves as such, but we don't want to have a concrete reference to both of
                // the directives. The type is marked as `Partial` in case we run into a class that provides
                // itself as `ControlContainer` but doesn't have the same interface as the directives.
                ControlContainer, descendants: true }], viewQueries: [{ propertyName: "content", first: true, predicate: TemplateRef, descendants: true, static: true }], exportAs: ["cdkStep"], usesOnChanges: true, ngImport: i0, template: '<ng-template><ng-content/></ng-template>', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStep, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-step',
                    exportAs: 'cdkStep',
                    template: '<ng-template><ng-content/></ng-template>',
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: CdkStepper, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => CdkStepper)]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [STEPPER_GLOBAL_OPTIONS]
                }] }], propDecorators: { stepLabel: [{
                type: ContentChild,
                args: [CdkStepLabel]
            }], _childForms: [{
                type: ContentChildren,
                args: [
                    // Note: we look for `ControlContainer` here, because both `NgForm` and `FormGroupDirective`
                    // provides themselves as such, but we don't want to have a concrete reference to both of
                    // the directives. The type is marked as `Partial` in case we run into a class that provides
                    // itself as `ControlContainer` but doesn't have the same interface as the directives.
                    ControlContainer,
                    {
                        descendants: true,
                    }]
            }], content: [{
                type: ViewChild,
                args: [TemplateRef, { static: true }]
            }], stepControl: [{
                type: Input
            }], interactedStream: [{
                type: Output,
                args: ['interacted']
            }], label: [{
                type: Input
            }], errorMessage: [{
                type: Input
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], ariaLabelledby: [{
                type: Input,
                args: ['aria-labelledby']
            }], state: [{
                type: Input
            }], editable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], optional: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], completed: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hasError: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
class CdkStepper {
    /** The index of the selected step. */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(index) {
        if (this.steps && this._steps) {
            // Ensure that the index can't be out of bounds.
            if (!this._isValidIndex(index) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
            }
            this.selected?._markAsInteracted();
            if (this._selectedIndex !== index &&
                !this._anyControlsInvalidOrPending(index) &&
                (index >= this._selectedIndex || this.steps.toArray()[index].editable)) {
                this._updateSelectedItemIndex(index);
            }
        }
        else {
            this._selectedIndex = index;
        }
    }
    /** The step that is selected. */
    get selected() {
        return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined;
    }
    set selected(step) {
        this.selectedIndex = step && this.steps ? this.steps.toArray().indexOf(step) : -1;
    }
    /** Orientation of the stepper. */
    get orientation() {
        return this._orientation;
    }
    set orientation(value) {
        // This is a protected method so that `MatStepper` can hook into it.
        this._orientation = value;
        if (this._keyManager) {
            this._keyManager.withVerticalOrientation(value === 'vertical');
        }
    }
    constructor(_dir, _changeDetectorRef, _elementRef) {
        this._dir = _dir;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /** Steps that belong to the current stepper, excluding ones from nested steppers. */
        this.steps = new QueryList();
        /** List of step headers sorted based on their DOM order. */
        this._sortedHeaders = new QueryList();
        /** Whether the validity of previous steps should be checked or not. */
        this.linear = false;
        this._selectedIndex = 0;
        /** Event emitted when the selected step has changed. */
        this.selectionChange = new EventEmitter();
        /** Output to support two-way binding on `[(selectedIndex)]` */
        this.selectedIndexChange = new EventEmitter();
        this._orientation = 'horizontal';
        this._groupId = nextId++;
    }
    ngAfterContentInit() {
        this._steps.changes
            .pipe(startWith(this._steps), takeUntil(this._destroyed))
            .subscribe((steps) => {
            this.steps.reset(steps.filter(step => step._stepper === this));
            this.steps.notifyOnChanges();
        });
    }
    ngAfterViewInit() {
        // If the step headers are defined outside of the `ngFor` that renders the steps, like in the
        // Material stepper, they won't appear in the `QueryList` in the same order as they're
        // rendered in the DOM which will lead to incorrect keyboard navigation. We need to sort
        // them manually to ensure that they're correct. Alternatively, we can change the Material
        // template to inline the headers in the `ngFor`, but that'll result in a lot of
        // code duplication. See #23539.
        this._stepHeader.changes
            .pipe(startWith(this._stepHeader), takeUntil(this._destroyed))
            .subscribe((headers) => {
            this._sortedHeaders.reset(headers.toArray().sort((a, b) => {
                const documentPosition = a._elementRef.nativeElement.compareDocumentPosition(b._elementRef.nativeElement);
                // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
                // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
                // tslint:disable-next-line:no-bitwise
                return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            }));
            this._sortedHeaders.notifyOnChanges();
        });
        // Note that while the step headers are content children by default, any components that
        // extend this one might have them as view children. We initialize the keyboard handling in
        // AfterViewInit so we're guaranteed for both view and content children to be defined.
        this._keyManager = new FocusKeyManager(this._sortedHeaders)
            .withWrap()
            .withHomeAndEnd()
            .withVerticalOrientation(this._orientation === 'vertical');
        (this._dir ? this._dir.change : of())
            .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
            .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));
        this._keyManager.updateActiveItem(this._selectedIndex);
        // No need to `takeUntil` here, because we're the ones destroying `steps`.
        this.steps.changes.subscribe(() => {
            if (!this.selected) {
                this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
            }
        });
        // The logic which asserts that the selected index is within bounds doesn't run before the
        // steps are initialized, because we don't how many steps there are yet so we may have an
        // invalid index on init. If that's the case, auto-correct to the default so we don't throw.
        if (!this._isValidIndex(this._selectedIndex)) {
            this._selectedIndex = 0;
        }
    }
    ngOnDestroy() {
        this._keyManager?.destroy();
        this.steps.destroy();
        this._sortedHeaders.destroy();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Selects and focuses the next step in list. */
    next() {
        this.selectedIndex = Math.min(this._selectedIndex + 1, this.steps.length - 1);
    }
    /** Selects and focuses the previous step in list. */
    previous() {
        this.selectedIndex = Math.max(this._selectedIndex - 1, 0);
    }
    /** Resets the stepper to its initial state. Note that this includes clearing form data. */
    reset() {
        this._updateSelectedItemIndex(0);
        this.steps.forEach(step => step.reset());
        this._stateChanged();
    }
    /** Returns a unique id for each step label element. */
    _getStepLabelId(i) {
        return `cdk-step-label-${this._groupId}-${i}`;
    }
    /** Returns unique id for each step content element. */
    _getStepContentId(i) {
        return `cdk-step-content-${this._groupId}-${i}`;
    }
    /** Marks the component to be change detected. */
    _stateChanged() {
        this._changeDetectorRef.markForCheck();
    }
    /** Returns position state of the step with the given index. */
    _getAnimationDirection(index) {
        const position = index - this._selectedIndex;
        if (position < 0) {
            return this._layoutDirection() === 'rtl' ? 'next' : 'previous';
        }
        else if (position > 0) {
            return this._layoutDirection() === 'rtl' ? 'previous' : 'next';
        }
        return 'current';
    }
    /** Returns the type of icon to be displayed. */
    _getIndicatorType(index, state = STEP_STATE.NUMBER) {
        const step = this.steps.toArray()[index];
        const isCurrentStep = this._isCurrentStep(index);
        return step._displayDefaultIndicatorType
            ? this._getDefaultIndicatorLogic(step, isCurrentStep)
            : this._getGuidelineLogic(step, isCurrentStep, state);
    }
    _getDefaultIndicatorLogic(step, isCurrentStep) {
        if (step._showError() && step.hasError && !isCurrentStep) {
            return STEP_STATE.ERROR;
        }
        else if (!step.completed || isCurrentStep) {
            return STEP_STATE.NUMBER;
        }
        else {
            return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
        }
    }
    _getGuidelineLogic(step, isCurrentStep, state = STEP_STATE.NUMBER) {
        if (step._showError() && step.hasError && !isCurrentStep) {
            return STEP_STATE.ERROR;
        }
        else if (step.completed && !isCurrentStep) {
            return STEP_STATE.DONE;
        }
        else if (step.completed && isCurrentStep) {
            return state;
        }
        else if (step.editable && isCurrentStep) {
            return STEP_STATE.EDIT;
        }
        else {
            return state;
        }
    }
    _isCurrentStep(index) {
        return this._selectedIndex === index;
    }
    /** Returns the index of the currently-focused step header. */
    _getFocusIndex() {
        return this._keyManager ? this._keyManager.activeItemIndex : this._selectedIndex;
    }
    _updateSelectedItemIndex(newIndex) {
        const stepsArray = this.steps.toArray();
        this.selectionChange.emit({
            selectedIndex: newIndex,
            previouslySelectedIndex: this._selectedIndex,
            selectedStep: stepsArray[newIndex],
            previouslySelectedStep: stepsArray[this._selectedIndex],
        });
        // If focus is inside the stepper, move it to the next header, otherwise it may become
        // lost when the active step content is hidden. We can't be more granular with the check
        // (e.g. checking whether focus is inside the active step), because we don't have a
        // reference to the elements that are rendering out the content.
        this._containsFocus()
            ? this._keyManager.setActiveItem(newIndex)
            : this._keyManager.updateActiveItem(newIndex);
        this._selectedIndex = newIndex;
        this.selectedIndexChange.emit(this._selectedIndex);
        this._stateChanged();
    }
    _onKeydown(event) {
        const hasModifier = hasModifierKey(event);
        const keyCode = event.keyCode;
        const manager = this._keyManager;
        if (manager.activeItemIndex != null &&
            !hasModifier &&
            (keyCode === SPACE || keyCode === ENTER)) {
            this.selectedIndex = manager.activeItemIndex;
            event.preventDefault();
        }
        else {
            manager.setFocusOrigin('keyboard').onKeydown(event);
        }
    }
    _anyControlsInvalidOrPending(index) {
        if (this.linear && index >= 0) {
            return this.steps
                .toArray()
                .slice(0, index)
                .some(step => {
                const control = step.stepControl;
                const isIncomplete = control
                    ? control.invalid || control.pending || !step.interacted
                    : !step.completed;
                return isIncomplete && !step.optional && !step._completedOverride;
            });
        }
        return false;
    }
    _layoutDirection() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Checks whether the stepper contains the focused element. */
    _containsFocus() {
        const stepperElement = this._elementRef.nativeElement;
        const focusedElement = _getFocusedElementPierceShadowDom();
        return stepperElement === focusedElement || stepperElement.contains(focusedElement);
    }
    /** Checks whether the passed-in index is a valid step index. */
    _isValidIndex(index) {
        return index > -1 && (!this.steps || index < this.steps.length);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepper, deps: [{ token: i1.Directionality, optional: true }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkStepper, isStandalone: true, selector: "[cdkStepper]", inputs: { linear: ["linear", "linear", booleanAttribute], selectedIndex: ["selectedIndex", "selectedIndex", numberAttribute], selected: "selected", orientation: "orientation" }, outputs: { selectionChange: "selectionChange", selectedIndexChange: "selectedIndexChange" }, queries: [{ propertyName: "_steps", predicate: CdkStep, descendants: true }, { propertyName: "_stepHeader", predicate: CdkStepHeader, descendants: true }], exportAs: ["cdkStepper"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepper, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkStepper]',
                    exportAs: 'cdkStepper',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }], propDecorators: { _steps: [{
                type: ContentChildren,
                args: [CdkStep, { descendants: true }]
            }], _stepHeader: [{
                type: ContentChildren,
                args: [CdkStepHeader, { descendants: true }]
            }], linear: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], selectedIndex: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], selected: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }], selectedIndexChange: [{
                type: Output
            }], orientation: [{
                type: Input
            }] } });

/** Button that moves to the next step in a stepper workflow. */
class CdkStepperNext {
    constructor(_stepper) {
        this._stepper = _stepper;
        /** Type of the next button. Defaults to "submit" if not specified. */
        this.type = 'submit';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperNext, deps: [{ token: CdkStepper }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkStepperNext, isStandalone: true, selector: "button[cdkStepperNext]", inputs: { type: "type" }, host: { listeners: { "click": "_stepper.next()" }, properties: { "type": "type" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperNext, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkStepperNext]',
                    host: {
                        '[type]': 'type',
                        '(click)': '_stepper.next()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: CdkStepper }], propDecorators: { type: [{
                type: Input
            }] } });
/** Button that moves to the previous step in a stepper workflow. */
class CdkStepperPrevious {
    constructor(_stepper) {
        this._stepper = _stepper;
        /** Type of the previous button. Defaults to "button" if not specified. */
        this.type = 'button';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperPrevious, deps: [{ token: CdkStepper }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkStepperPrevious, isStandalone: true, selector: "button[cdkStepperPrevious]", inputs: { type: "type" }, host: { listeners: { "click": "_stepper.previous()" }, properties: { "type": "type" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperPrevious, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkStepperPrevious]',
                    host: {
                        '[type]': 'type',
                        '(click)': '_stepper.previous()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: CdkStepper }], propDecorators: { type: [{
                type: Input
            }] } });

class CdkStepperModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperModule, imports: [BidiModule,
            CdkStep,
            CdkStepper,
            CdkStepHeader,
            CdkStepLabel,
            CdkStepperNext,
            CdkStepperPrevious], exports: [CdkStep, CdkStepper, CdkStepHeader, CdkStepLabel, CdkStepperNext, CdkStepperPrevious] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperModule, imports: [BidiModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkStepperModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        BidiModule,
                        CdkStep,
                        CdkStepper,
                        CdkStepHeader,
                        CdkStepLabel,
                        CdkStepperNext,
                        CdkStepperPrevious,
                    ],
                    exports: [CdkStep, CdkStepper, CdkStepHeader, CdkStepLabel, CdkStepperNext, CdkStepperPrevious],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CdkStep, CdkStepHeader, CdkStepLabel, CdkStepper, CdkStepperModule, CdkStepperNext, CdkStepperPrevious, STEPPER_GLOBAL_OPTIONS, STEP_STATE, StepperSelectionEvent };
//# sourceMappingURL=stepper.mjs.map
