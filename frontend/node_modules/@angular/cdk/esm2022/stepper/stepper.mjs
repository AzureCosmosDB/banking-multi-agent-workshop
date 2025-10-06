/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, InjectionToken, Input, Optional, Output, QueryList, TemplateRef, ViewChild, ViewEncapsulation, booleanAttribute, numberAttribute, } from '@angular/core';
import { ControlContainer, } from '@angular/forms';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { of as observableOf, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CdkStepHeader } from './step-header';
import { CdkStepLabel } from './step-label';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
/** Used to generate unique ID for each stepper component. */
let nextId = 0;
/** Change event emitted on selection changes. */
export class StepperSelectionEvent {
}
/** Enum to represent the different states of the steps. */
export const STEP_STATE = {
    NUMBER: 'number',
    EDIT: 'edit',
    DONE: 'done',
    ERROR: 'error',
};
/** InjectionToken that can be used to specify the global stepper options. */
export const STEPPER_GLOBAL_OPTIONS = new InjectionToken('STEPPER_GLOBAL_OPTIONS');
export class CdkStep {
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
export class CdkStepper {
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
        (this._dir ? this._dir.change : observableOf())
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc3RlcHBlci9zdGVwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBa0IsZUFBZSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkUsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ25FLE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULGlCQUFpQixFQUVqQixnQkFBZ0IsRUFDaEIsZUFBZSxHQUNoQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsZ0JBQWdCLEdBSWpCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFDLGlDQUFpQyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFhLEVBQUUsSUFBSSxZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdELE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7QUFFMUMsNkRBQTZEO0FBQzdELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQVdmLGlEQUFpRDtBQUNqRCxNQUFNLE9BQU8s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S0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbiwgRm9jdXNLZXlNYW5hZ2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RU5URVIsIGhhc01vZGlmaWVyS2V5LCBTUEFDRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIENvbnRyb2xDb250YWluZXIsXG4gIHR5cGUgQWJzdHJhY3RDb250cm9sLFxuICB0eXBlIE5nRm9ybSxcbiAgdHlwZSBGb3JtR3JvdXBEaXJlY3RpdmUsXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7X2dldEZvY3VzZWRFbGVtZW50UGllcmNlU2hhZG93RG9tfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzdGFydFdpdGgsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0Nka1N0ZXBIZWFkZXJ9IGZyb20gJy4vc3RlcC1oZWFkZXInO1xuaW1wb3J0IHtDZGtTdGVwTGFiZWx9IGZyb20gJy4vc3RlcC1sYWJlbCc7XG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3IgZWFjaCBzdGVwcGVyIGNvbXBvbmVudC4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIFBvc2l0aW9uIHN0YXRlIG9mIHRoZSBjb250ZW50IG9mIGVhY2ggc3RlcCBpbiBzdGVwcGVyIHRoYXQgaXMgdXNlZCBmb3IgdHJhbnNpdGlvbmluZ1xuICogdGhlIGNvbnRlbnQgaW50byBjb3JyZWN0IHBvc2l0aW9uIHVwb24gc3RlcCBzZWxlY3Rpb24gY2hhbmdlLlxuICovXG5leHBvcnQgdHlwZSBTdGVwQ29udGVudFBvc2l0aW9uU3RhdGUgPSAncHJldmlvdXMnIHwgJ2N1cnJlbnQnIHwgJ25leHQnO1xuXG4vKiogUG9zc2libGUgb3JpZW50YXRpb24gb2YgYSBzdGVwcGVyLiAqL1xuZXhwb3J0IHR5cGUgU3RlcHBlck9yaWVudGF0aW9uID0gJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJztcblxuLyoqIENoYW5nZSBldmVudCBlbWl0dGVkIG9uIHNlbGVjdGlvbiBjaGFuZ2VzLiAqL1xuZXhwb3J0IGNsYXNzIFN0ZXBwZXJTZWxlY3Rpb25FdmVudCB7XG4gIC8qKiBJbmRleCBvZiB0aGUgc3RlcCBub3cgc2VsZWN0ZWQuICovXG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcblxuICAvKiogSW5kZXggb2YgdGhlIHN0ZXAgcHJldmlvdXNseSBzZWxlY3RlZC4gKi9cbiAgcHJldmlvdXNseVNlbGVjdGVkSW5kZXg6IG51bWJlcjtcblxuICAvKiogVGhlIHN0ZXAgaW5zdGFuY2Ugbm93IHNlbGVjdGVkLiAqL1xuICBzZWxlY3RlZFN0ZXA6IENka1N0ZXA7XG5cbiAgLyoqIFRoZSBzdGVwIGluc3RhbmNlIHByZXZpb3VzbHkgc2VsZWN0ZWQuICovXG4gIHByZXZpb3VzbHlTZWxlY3RlZFN0ZXA6IENka1N0ZXA7XG59XG5cbi8qKiBUaGUgc3RhdGUgb2YgZWFjaCBzdGVwLiAqL1xuZXhwb3J0IHR5cGUgU3RlcFN0YXRlID0gJ251bWJlcicgfCAnZWRpdCcgfCAnZG9uZScgfCAnZXJyb3InIHwgc3RyaW5nO1xuXG4vKiogRW51bSB0byByZXByZXNlbnQgdGhlIGRpZmZlcmVudCBzdGF0ZXMgb2YgdGhlIHN0ZXBzLiAqL1xuZXhwb3J0IGNvbnN0IFNURVBfU1RBVEUgPSB7XG4gIE5VTUJFUjogJ251bWJlcicsXG4gIEVESVQ6ICdlZGl0JyxcbiAgRE9ORTogJ2RvbmUnLFxuICBFUlJPUjogJ2Vycm9yJyxcbn07XG5cbi8qKiBJbmplY3Rpb25Ub2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHNwZWNpZnkgdGhlIGdsb2JhbCBzdGVwcGVyIG9wdGlvbnMuICovXG5leHBvcnQgY29uc3QgU1RFUFBFUl9HTE9CQUxfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxTdGVwcGVyT3B0aW9ucz4oJ1NURVBQRVJfR0xPQkFMX09QVElPTlMnKTtcblxuLyoqIENvbmZpZ3VyYWJsZSBvcHRpb25zIGZvciBzdGVwcGVyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGVwcGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzdGVwcGVyIHNob3VsZCBkaXNwbGF5IGFuIGVycm9yIHN0YXRlIG9yIG5vdC5cbiAgICogRGVmYXVsdCBiZWhhdmlvciBpcyBhc3N1bWVkIHRvIGJlIGZhbHNlLlxuICAgKi9cbiAgc2hvd0Vycm9yPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RlcHBlciBzaG91bGQgZGlzcGxheSB0aGUgZGVmYXVsdCBpbmRpY2F0b3IgdHlwZVxuICAgKiBvciBub3QuXG4gICAqIERlZmF1bHQgYmVoYXZpb3IgaXMgYXNzdW1lZCB0byBiZSB0cnVlLlxuICAgKi9cbiAgZGlzcGxheURlZmF1bHRJbmRpY2F0b3JUeXBlPzogYm9vbGVhbjtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLXN0ZXAnLFxuICBleHBvcnRBczogJ2Nka1N0ZXAnLFxuICB0ZW1wbGF0ZTogJzxuZy10ZW1wbGF0ZT48bmctY29udGVudC8+PC9uZy10ZW1wbGF0ZT4nLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU3RlcCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByaXZhdGUgX3N0ZXBwZXJPcHRpb25zOiBTdGVwcGVyT3B0aW9ucztcbiAgX2Rpc3BsYXlEZWZhdWx0SW5kaWNhdG9yVHlwZTogYm9vbGVhbjtcblxuICAvKiogVGVtcGxhdGUgZm9yIHN0ZXAgbGFiZWwgaWYgaXQgZXhpc3RzLiAqL1xuICBAQ29udGVudENoaWxkKENka1N0ZXBMYWJlbCkgc3RlcExhYmVsOiBDZGtTdGVwTGFiZWw7XG5cbiAgLyoqIEZvcm1zIHRoYXQgaGF2ZSBiZWVuIHByb2plY3RlZCBpbnRvIHRoZSBzdGVwLiAqL1xuICBAQ29udGVudENoaWxkcmVuKFxuICAgIC8vIE5vdGU6IHdlIGxvb2sgZm9yIGBDb250cm9sQ29udGFpbmVyYCBoZXJlLCBiZWNhdXNlIGJvdGggYE5nRm9ybWAgYW5kIGBGb3JtR3JvdXBEaXJlY3RpdmVgXG4gICAgLy8gcHJvdmlkZXMgdGhlbXNlbHZlcyBhcyBzdWNoLCBidXQgd2UgZG9uJ3Qgd2FudCB0byBoYXZlIGEgY29uY3JldGUgcmVmZXJlbmNlIHRvIGJvdGggb2ZcbiAgICAvLyB0aGUgZGlyZWN0aXZlcy4gVGhlIHR5cGUgaXMgbWFya2VkIGFzIGBQYXJ0aWFsYCBpbiBjYXNlIHdlIHJ1biBpbnRvIGEgY2xhc3MgdGhhdCBwcm92aWRlc1xuICAgIC8vIGl0c2VsZiBhcyBgQ29udHJvbENvbnRhaW5lcmAgYnV0IGRvZXNuJ3QgaGF2ZSB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgdGhlIGRpcmVjdGl2ZXMuXG4gICAgQ29udHJvbENvbnRhaW5lcixcbiAgICB7XG4gICAgICBkZXNjZW5kYW50czogdHJ1ZSxcbiAgICB9LFxuICApXG4gIHByb3RlY3RlZCBfY2hpbGRGb3JtczogUXVlcnlMaXN0PFBhcnRpYWw8TmdGb3JtIHwgRm9ybUdyb3VwRGlyZWN0aXZlPj4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFRlbXBsYXRlIGZvciBzdGVwIGNvbnRlbnQuICovXG4gIEBWaWV3Q2hpbGQoVGVtcGxhdGVSZWYsIHtzdGF0aWM6IHRydWV9KSBjb250ZW50OiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIC8qKiBUaGUgdG9wIGxldmVsIGFic3RyYWN0IGNvbnRyb2wgb2YgdGhlIHN0ZXAuICovXG4gIEBJbnB1dCgpIHN0ZXBDb250cm9sOiBBYnN0cmFjdENvbnRyb2w7XG5cbiAgLyoqIFdoZXRoZXIgdXNlciBoYXMgYXR0ZW1wdGVkIHRvIG1vdmUgYXdheSBmcm9tIHRoZSBzdGVwLiAqL1xuICBpbnRlcmFjdGVkID0gZmFsc2U7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgaGFzIGF0dGVtcHRlZCB0byBtb3ZlIGF3YXkgZnJvbSB0aGUgc3RlcC4gKi9cbiAgQE91dHB1dCgnaW50ZXJhY3RlZCcpXG4gIHJlYWRvbmx5IGludGVyYWN0ZWRTdHJlYW06IEV2ZW50RW1pdHRlcjxDZGtTdGVwPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2RrU3RlcD4oKTtcblxuICAvKiogUGxhaW4gdGV4dCBsYWJlbCBvZiB0aGUgc3RlcC4gKi9cbiAgQElucHV0KCkgbGFiZWw6IHN0cmluZztcblxuICAvKiogRXJyb3IgbWVzc2FnZSB0byBkaXNwbGF5IHdoZW4gdGhlcmUncyBhbiBlcnJvci4gKi9cbiAgQElucHV0KCkgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XG5cbiAgLyoqIEFyaWEgbGFiZWwgZm9yIHRoZSB0YWIuICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdGhhdCB0aGUgdGFiIGlzIGxhYmVsbGVkIGJ5LlxuICAgKiBXaWxsIGJlIGNsZWFyZWQgaWYgYGFyaWEtbGFiZWxgIGlzIHNldCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgKi9cbiAgQElucHV0KCdhcmlhLWxhYmVsbGVkYnknKSBhcmlhTGFiZWxsZWRieTogc3RyaW5nO1xuXG4gIC8qKiBTdGF0ZSBvZiB0aGUgc3RlcC4gKi9cbiAgQElucHV0KCkgc3RhdGU6IFN0ZXBTdGF0ZTtcblxuICAvKiogV2hldGhlciB0aGUgdXNlciBjYW4gcmV0dXJuIHRvIHRoaXMgc3RlcCBvbmNlIGl0IGhhcyBiZWVuIG1hcmtlZCBhcyBjb21wbGV0ZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZWRpdGFibGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb21wbGV0aW9uIG9mIHN0ZXAgaXMgb3B0aW9uYWwuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgb3B0aW9uYWw6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciBzdGVwIGlzIG1hcmtlZCBhcyBjb21wbGV0ZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGNvbXBsZXRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGxldGVkT3ZlcnJpZGUgPT0gbnVsbCA/IHRoaXMuX2dldERlZmF1bHRDb21wbGV0ZWQoKSA6IHRoaXMuX2NvbXBsZXRlZE92ZXJyaWRlO1xuICB9XG4gIHNldCBjb21wbGV0ZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9jb21wbGV0ZWRPdmVycmlkZSA9IHZhbHVlO1xuICB9XG4gIF9jb21wbGV0ZWRPdmVycmlkZTogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX2dldERlZmF1bHRDb21wbGV0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RlcENvbnRyb2wgPyB0aGlzLnN0ZXBDb250cm9sLnZhbGlkICYmIHRoaXMuaW50ZXJhY3RlZCA6IHRoaXMuaW50ZXJhY3RlZDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHN0ZXAgaGFzIGFuIGVycm9yLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBoYXNFcnJvcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY3VzdG9tRXJyb3IgPT0gbnVsbCA/IHRoaXMuX2dldERlZmF1bHRFcnJvcigpIDogdGhpcy5fY3VzdG9tRXJyb3I7XG4gIH1cbiAgc2V0IGhhc0Vycm9yKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fY3VzdG9tRXJyb3IgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9jdXN0b21FcnJvcjogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX2dldERlZmF1bHRFcnJvcigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGVwQ29udHJvbCAmJiB0aGlzLnN0ZXBDb250cm9sLmludmFsaWQgJiYgdGhpcy5pbnRlcmFjdGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChmb3J3YXJkUmVmKCgpID0+IENka1N0ZXBwZXIpKSBwdWJsaWMgX3N0ZXBwZXI6IENka1N0ZXBwZXIsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChTVEVQUEVSX0dMT0JBTF9PUFRJT05TKSBzdGVwcGVyT3B0aW9ucz86IFN0ZXBwZXJPcHRpb25zLFxuICApIHtcbiAgICB0aGlzLl9zdGVwcGVyT3B0aW9ucyA9IHN0ZXBwZXJPcHRpb25zID8gc3RlcHBlck9wdGlvbnMgOiB7fTtcbiAgICB0aGlzLl9kaXNwbGF5RGVmYXVsdEluZGljYXRvclR5cGUgPSB0aGlzLl9zdGVwcGVyT3B0aW9ucy5kaXNwbGF5RGVmYXVsdEluZGljYXRvclR5cGUgIT09IGZhbHNlO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgdGhpcyBzdGVwIGNvbXBvbmVudC4gKi9cbiAgc2VsZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0ZXBwZXIuc2VsZWN0ZWQgPSB0aGlzO1xuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgc3RlcCB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gTm90ZSB0aGF0IHRoaXMgaW5jbHVkZXMgcmVzZXR0aW5nIGZvcm0gZGF0YS4gKi9cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcmFjdGVkID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5fY29tcGxldGVkT3ZlcnJpZGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fY29tcGxldGVkT3ZlcnJpZGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3VzdG9tRXJyb3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fY3VzdG9tRXJyb3IgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGVwQ29udHJvbCkge1xuICAgICAgLy8gUmVzZXQgdGhlIGZvcm1zIHNpbmNlIHRoZSBkZWZhdWx0IGVycm9yIHN0YXRlIG1hdGNoZXJzIHdpbGwgc2hvdyBlcnJvcnMgb24gc3VibWl0IGFuZCB3ZVxuICAgICAgLy8gd2FudCB0aGUgZm9ybSB0byBiZSBiYWNrIHRvIGl0cyBpbml0aWFsIHN0YXRlIChzZWUgIzI5NzgxKS4gU3VibWl0dGVkIHN0YXRlIGlzIG9uIHRoZVxuICAgICAgLy8gaW5kaXZpZHVhbCBkaXJlY3RpdmVzLCByYXRoZXIgdGhhbiB0aGUgY29udHJvbCwgc28gd2UgbmVlZCB0byByZXNldCB0aGVtIG91cnNlbHZlcy5cbiAgICAgIHRoaXMuX2NoaWxkRm9ybXM/LmZvckVhY2goZm9ybSA9PiBmb3JtLnJlc2V0Rm9ybT8uKCkpO1xuICAgICAgdGhpcy5zdGVwQ29udHJvbC5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIC8vIFNpbmNlIGJhc2ljYWxseSBhbGwgaW5wdXRzIG9mIHRoZSBNYXRTdGVwIGdldCBwcm94aWVkIHRocm91Z2ggdGhlIHZpZXcgZG93biB0byB0aGVcbiAgICAvLyB1bmRlcmx5aW5nIE1hdFN0ZXBIZWFkZXIsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgY2hhbmdlIGRldGVjdGlvbiBydW5zIGNvcnJlY3RseS5cbiAgICB0aGlzLl9zdGVwcGVyLl9zdGF0ZUNoYW5nZWQoKTtcbiAgfVxuXG4gIF9tYXJrQXNJbnRlcmFjdGVkKCkge1xuICAgIGlmICghdGhpcy5pbnRlcmFjdGVkKSB7XG4gICAgICB0aGlzLmludGVyYWN0ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5pbnRlcmFjdGVkU3RyZWFtLmVtaXQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERldGVybWluZXMgd2hldGhlciB0aGUgZXJyb3Igc3RhdGUgY2FuIGJlIHNob3duLiAqL1xuICBfc2hvd0Vycm9yKCk6IGJvb2xlYW4ge1xuICAgIC8vIFdlIHdhbnQgdG8gc2hvdyB0aGUgZXJyb3Igc3RhdGUgZWl0aGVyIGlmIHRoZSB1c2VyIG9wdGVkIGludG8vb3V0IG9mIGl0IHVzaW5nIHRoZVxuICAgIC8vIGdsb2JhbCBvcHRpb25zLCBvciBpZiB0aGV5J3ZlIGV4cGxpY2l0bHkgc2V0IGl0IHRocm91Z2ggdGhlIGBoYXNFcnJvcmAgaW5wdXQuXG4gICAgcmV0dXJuIHRoaXMuX3N0ZXBwZXJPcHRpb25zLnNob3dFcnJvciA/PyB0aGlzLl9jdXN0b21FcnJvciAhPSBudWxsO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtTdGVwcGVyXScsXG4gIGV4cG9ydEFzOiAnY2RrU3RlcHBlcicsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1N0ZXBwZXIgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKiogRW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBVc2VkIGZvciBtYW5hZ2luZyBrZXlib2FyZCBmb2N1cy4gKi9cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPEZvY3VzYWJsZU9wdGlvbj47XG5cbiAgLyoqIEZ1bGwgbGlzdCBvZiBzdGVwcyBpbnNpZGUgdGhlIHN0ZXBwZXIsIGluY2x1ZGluZyBpbnNpZGUgbmVzdGVkIHN0ZXBwZXJzLiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka1N0ZXAsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9zdGVwczogUXVlcnlMaXN0PENka1N0ZXA+O1xuXG4gIC8qKiBTdGVwcyB0aGF0IGJlbG9uZyB0byB0aGUgY3VycmVudCBzdGVwcGVyLCBleGNsdWRpbmcgb25lcyBmcm9tIG5lc3RlZCBzdGVwcGVycy4gKi9cbiAgcmVhZG9ubHkgc3RlcHM6IFF1ZXJ5TGlzdDxDZGtTdGVwPiA9IG5ldyBRdWVyeUxpc3Q8Q2RrU3RlcD4oKTtcblxuICAvKiogVGhlIGxpc3Qgb2Ygc3RlcCBoZWFkZXJzIG9mIHRoZSBzdGVwcyBpbiB0aGUgc3RlcHBlci4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtTdGVwSGVhZGVyLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfc3RlcEhlYWRlcjogUXVlcnlMaXN0PENka1N0ZXBIZWFkZXI+O1xuXG4gIC8qKiBMaXN0IG9mIHN0ZXAgaGVhZGVycyBzb3J0ZWQgYmFzZWQgb24gdGhlaXIgRE9NIG9yZGVyLiAqL1xuICBwcml2YXRlIF9zb3J0ZWRIZWFkZXJzID0gbmV3IFF1ZXJ5TGlzdDxDZGtTdGVwSGVhZGVyPigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB2YWxpZGl0eSBvZiBwcmV2aW91cyBzdGVwcyBzaG91bGQgYmUgY2hlY2tlZCBvciBub3QuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgbGluZWFyOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgc2VsZWN0ZWQgc3RlcC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pXG4gIGdldCBzZWxlY3RlZEluZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSW5kZXg7XG4gIH1cbiAgc2V0IHNlbGVjdGVkSW5kZXgoaW5kZXg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLnN0ZXBzICYmIHRoaXMuX3N0ZXBzKSB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgaW5kZXggY2FuJ3QgYmUgb3V0IG9mIGJvdW5kcy5cbiAgICAgIGlmICghdGhpcy5faXNWYWxpZEluZGV4KGluZGV4KSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICB0aHJvdyBFcnJvcignY2RrU3RlcHBlcjogQ2Fubm90IGFzc2lnbiBvdXQtb2YtYm91bmRzIHZhbHVlIHRvIGBzZWxlY3RlZEluZGV4YC4nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZWxlY3RlZD8uX21hcmtBc0ludGVyYWN0ZWQoKTtcblxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ICE9PSBpbmRleCAmJlxuICAgICAgICAhdGhpcy5fYW55Q29udHJvbHNJbnZhbGlkT3JQZW5kaW5nKGluZGV4KSAmJlxuICAgICAgICAoaW5kZXggPj0gdGhpcy5fc2VsZWN0ZWRJbmRleCB8fCB0aGlzLnN0ZXBzLnRvQXJyYXkoKVtpbmRleF0uZWRpdGFibGUpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRJdGVtSW5kZXgoaW5kZXgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3NlbGVjdGVkSW5kZXggPSAwO1xuXG4gIC8qKiBUaGUgc3RlcCB0aGF0IGlzIHNlbGVjdGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogQ2RrU3RlcCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuc3RlcHMgPyB0aGlzLnN0ZXBzLnRvQXJyYXkoKVt0aGlzLnNlbGVjdGVkSW5kZXhdIDogdW5kZWZpbmVkO1xuICB9XG4gIHNldCBzZWxlY3RlZChzdGVwOiBDZGtTdGVwIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gc3RlcCAmJiB0aGlzLnN0ZXBzID8gdGhpcy5zdGVwcy50b0FycmF5KCkuaW5kZXhPZihzdGVwKSA6IC0xO1xuICB9XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgc2VsZWN0ZWQgc3RlcCBoYXMgY2hhbmdlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGlvbkNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8U3RlcHBlclNlbGVjdGlvbkV2ZW50PigpO1xuXG4gIC8qKiBPdXRwdXQgdG8gc3VwcG9ydCB0d28td2F5IGJpbmRpbmcgb24gYFsoc2VsZWN0ZWRJbmRleCldYCAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0ZWRJbmRleENoYW5nZTogRXZlbnRFbWl0dGVyPG51bWJlcj4gPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4oKTtcblxuICAvKiogVXNlZCB0byB0cmFjayB1bmlxdWUgSUQgZm9yIGVhY2ggc3RlcHBlciBjb21wb25lbnQuICovXG4gIF9ncm91cElkOiBudW1iZXI7XG5cbiAgLyoqIE9yaWVudGF0aW9uIG9mIHRoZSBzdGVwcGVyLiAqL1xuICBASW5wdXQoKVxuICBnZXQgb3JpZW50YXRpb24oKTogU3RlcHBlck9yaWVudGF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fb3JpZW50YXRpb247XG4gIH1cbiAgc2V0IG9yaWVudGF0aW9uKHZhbHVlOiBTdGVwcGVyT3JpZW50YXRpb24pIHtcbiAgICAvLyBUaGlzIGlzIGEgcHJvdGVjdGVkIG1ldGhvZCBzbyB0aGF0IGBNYXRTdGVwcGVyYCBjYW4gaG9vayBpbnRvIGl0LlxuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5fa2V5TWFuYWdlcikge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbih2YWx1ZSA9PT0gJ3ZlcnRpY2FsJyk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX29yaWVudGF0aW9uOiBTdGVwcGVyT3JpZW50YXRpb24gPSAnaG9yaXpvbnRhbCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICkge1xuICAgIHRoaXMuX2dyb3VwSWQgPSBuZXh0SWQrKztcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9zdGVwcy5jaGFuZ2VzXG4gICAgICAucGlwZShzdGFydFdpdGgodGhpcy5fc3RlcHMpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKHN0ZXBzOiBRdWVyeUxpc3Q8Q2RrU3RlcD4pID0+IHtcbiAgICAgICAgdGhpcy5zdGVwcy5yZXNldChzdGVwcy5maWx0ZXIoc3RlcCA9PiBzdGVwLl9zdGVwcGVyID09PSB0aGlzKSk7XG4gICAgICAgIHRoaXMuc3RlcHMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBJZiB0aGUgc3RlcCBoZWFkZXJzIGFyZSBkZWZpbmVkIG91dHNpZGUgb2YgdGhlIGBuZ0ZvcmAgdGhhdCByZW5kZXJzIHRoZSBzdGVwcywgbGlrZSBpbiB0aGVcbiAgICAvLyBNYXRlcmlhbCBzdGVwcGVyLCB0aGV5IHdvbid0IGFwcGVhciBpbiB0aGUgYFF1ZXJ5TGlzdGAgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhleSdyZVxuICAgIC8vIHJlbmRlcmVkIGluIHRoZSBET00gd2hpY2ggd2lsbCBsZWFkIHRvIGluY29ycmVjdCBrZXlib2FyZCBuYXZpZ2F0aW9uLiBXZSBuZWVkIHRvIHNvcnRcbiAgICAvLyB0aGVtIG1hbnVhbGx5IHRvIGVuc3VyZSB0aGF0IHRoZXkncmUgY29ycmVjdC4gQWx0ZXJuYXRpdmVseSwgd2UgY2FuIGNoYW5nZSB0aGUgTWF0ZXJpYWxcbiAgICAvLyB0ZW1wbGF0ZSB0byBpbmxpbmUgdGhlIGhlYWRlcnMgaW4gdGhlIGBuZ0ZvcmAsIGJ1dCB0aGF0J2xsIHJlc3VsdCBpbiBhIGxvdCBvZlxuICAgIC8vIGNvZGUgZHVwbGljYXRpb24uIFNlZSAjMjM1MzkuXG4gICAgdGhpcy5fc3RlcEhlYWRlci5jaGFuZ2VzXG4gICAgICAucGlwZShzdGFydFdpdGgodGhpcy5fc3RlcEhlYWRlciksIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoaGVhZGVyczogUXVlcnlMaXN0PENka1N0ZXBIZWFkZXI+KSA9PiB7XG4gICAgICAgIHRoaXMuX3NvcnRlZEhlYWRlcnMucmVzZXQoXG4gICAgICAgICAgaGVhZGVycy50b0FycmF5KCkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRQb3NpdGlvbiA9IGEuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihcbiAgICAgICAgICAgICAgYi5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gYGNvbXBhcmVEb2N1bWVudFBvc2l0aW9uYCByZXR1cm5zIGEgYml0bWFzayBzbyB3ZSBoYXZlIHRvIHVzZSBhIGJpdHdpc2Ugb3BlcmF0b3IuXG4gICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS9jb21wYXJlRG9jdW1lbnRQb3NpdGlvblxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudFBvc2l0aW9uICYgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9GT0xMT1dJTkcgPyAtMSA6IDE7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX3NvcnRlZEhlYWRlcnMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB3aGlsZSB0aGUgc3RlcCBoZWFkZXJzIGFyZSBjb250ZW50IGNoaWxkcmVuIGJ5IGRlZmF1bHQsIGFueSBjb21wb25lbnRzIHRoYXRcbiAgICAvLyBleHRlbmQgdGhpcyBvbmUgbWlnaHQgaGF2ZSB0aGVtIGFzIHZpZXcgY2hpbGRyZW4uIFdlIGluaXRpYWxpemUgdGhlIGtleWJvYXJkIGhhbmRsaW5nIGluXG4gICAgLy8gQWZ0ZXJWaWV3SW5pdCBzbyB3ZSdyZSBndWFyYW50ZWVkIGZvciBib3RoIHZpZXcgYW5kIGNvbnRlbnQgY2hpbGRyZW4gdG8gYmUgZGVmaW5lZC5cbiAgICB0aGlzLl9rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcjxGb2N1c2FibGVPcHRpb24+KHRoaXMuX3NvcnRlZEhlYWRlcnMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKClcbiAgICAgIC53aXRoVmVydGljYWxPcmllbnRhdGlvbih0aGlzLl9vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyk7XG5cbiAgICAodGhpcy5fZGlyID8gKHRoaXMuX2Rpci5jaGFuZ2UgYXMgT2JzZXJ2YWJsZTxEaXJlY3Rpb24+KSA6IG9ic2VydmFibGVPZjxEaXJlY3Rpb24+KCkpXG4gICAgICAucGlwZShzdGFydFdpdGgodGhpcy5fbGF5b3V0RGlyZWN0aW9uKCkpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoZGlyZWN0aW9uID0+IHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbihkaXJlY3Rpb24pKTtcblxuICAgIHRoaXMuX2tleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbSh0aGlzLl9zZWxlY3RlZEluZGV4KTtcblxuICAgIC8vIE5vIG5lZWQgdG8gYHRha2VVbnRpbGAgaGVyZSwgYmVjYXVzZSB3ZSdyZSB0aGUgb25lcyBkZXN0cm95aW5nIGBzdGVwc2AuXG4gICAgdGhpcy5zdGVwcy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRJbmRleCA9IE1hdGgubWF4KHRoaXMuX3NlbGVjdGVkSW5kZXggLSAxLCAwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRoZSBsb2dpYyB3aGljaCBhc3NlcnRzIHRoYXQgdGhlIHNlbGVjdGVkIGluZGV4IGlzIHdpdGhpbiBib3VuZHMgZG9lc24ndCBydW4gYmVmb3JlIHRoZVxuICAgIC8vIHN0ZXBzIGFyZSBpbml0aWFsaXplZCwgYmVjYXVzZSB3ZSBkb24ndCBob3cgbWFueSBzdGVwcyB0aGVyZSBhcmUgeWV0IHNvIHdlIG1heSBoYXZlIGFuXG4gICAgLy8gaW52YWxpZCBpbmRleCBvbiBpbml0LiBJZiB0aGF0J3MgdGhlIGNhc2UsIGF1dG8tY29ycmVjdCB0byB0aGUgZGVmYXVsdCBzbyB3ZSBkb24ndCB0aHJvdy5cbiAgICBpZiAoIXRoaXMuX2lzVmFsaWRJbmRleCh0aGlzLl9zZWxlY3RlZEluZGV4KSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlcj8uZGVzdHJveSgpO1xuICAgIHRoaXMuc3RlcHMuZGVzdHJveSgpO1xuICAgIHRoaXMuX3NvcnRlZEhlYWRlcnMuZGVzdHJveSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogU2VsZWN0cyBhbmQgZm9jdXNlcyB0aGUgbmV4dCBzdGVwIGluIGxpc3QuICovXG4gIG5leHQoKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gTWF0aC5taW4odGhpcy5fc2VsZWN0ZWRJbmRleCArIDEsIHRoaXMuc3RlcHMubGVuZ3RoIC0gMSk7XG4gIH1cblxuICAvKiogU2VsZWN0cyBhbmQgZm9jdXNlcyB0aGUgcHJldmlvdXMgc3RlcCBpbiBsaXN0LiAqL1xuICBwcmV2aW91cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1heCh0aGlzLl9zZWxlY3RlZEluZGV4IC0gMSwgMCk7XG4gIH1cblxuICAvKiogUmVzZXRzIHRoZSBzdGVwcGVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLiBOb3RlIHRoYXQgdGhpcyBpbmNsdWRlcyBjbGVhcmluZyBmb3JtIGRhdGEuICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGVkSXRlbUluZGV4KDApO1xuICAgIHRoaXMuc3RlcHMuZm9yRWFjaChzdGVwID0+IHN0ZXAucmVzZXQoKSk7XG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VkKCk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIHVuaXF1ZSBpZCBmb3IgZWFjaCBzdGVwIGxhYmVsIGVsZW1lbnQuICovXG4gIF9nZXRTdGVwTGFiZWxJZChpOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBgY2RrLXN0ZXAtbGFiZWwtJHt0aGlzLl9ncm91cElkfS0ke2l9YDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHVuaXF1ZSBpZCBmb3IgZWFjaCBzdGVwIGNvbnRlbnQgZWxlbWVudC4gKi9cbiAgX2dldFN0ZXBDb250ZW50SWQoaTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGNkay1zdGVwLWNvbnRlbnQtJHt0aGlzLl9ncm91cElkfS0ke2l9YDtcbiAgfVxuXG4gIC8qKiBNYXJrcyB0aGUgY29tcG9uZW50IHRvIGJlIGNoYW5nZSBkZXRlY3RlZC4gKi9cbiAgX3N0YXRlQ2hhbmdlZCgpIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHBvc2l0aW9uIHN0YXRlIG9mIHRoZSBzdGVwIHdpdGggdGhlIGdpdmVuIGluZGV4LiAqL1xuICBfZ2V0QW5pbWF0aW9uRGlyZWN0aW9uKGluZGV4OiBudW1iZXIpOiBTdGVwQ29udGVudFBvc2l0aW9uU3RhdGUge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gaW5kZXggLSB0aGlzLl9zZWxlY3RlZEluZGV4O1xuICAgIGlmIChwb3NpdGlvbiA8IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl9sYXlvdXREaXJlY3Rpb24oKSA9PT0gJ3J0bCcgPyAnbmV4dCcgOiAncHJldmlvdXMnO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbGF5b3V0RGlyZWN0aW9uKCkgPT09ICdydGwnID8gJ3ByZXZpb3VzJyA6ICduZXh0JztcbiAgICB9XG4gICAgcmV0dXJuICdjdXJyZW50JztcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB0eXBlIG9mIGljb24gdG8gYmUgZGlzcGxheWVkLiAqL1xuICBfZ2V0SW5kaWNhdG9yVHlwZShpbmRleDogbnVtYmVyLCBzdGF0ZTogU3RlcFN0YXRlID0gU1RFUF9TVEFURS5OVU1CRVIpOiBTdGVwU3RhdGUge1xuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXBzLnRvQXJyYXkoKVtpbmRleF07XG4gICAgY29uc3QgaXNDdXJyZW50U3RlcCA9IHRoaXMuX2lzQ3VycmVudFN0ZXAoaW5kZXgpO1xuXG4gICAgcmV0dXJuIHN0ZXAuX2Rpc3BsYXlEZWZhdWx0SW5kaWNhdG9yVHlwZVxuICAgICAgPyB0aGlzLl9nZXREZWZhdWx0SW5kaWNhdG9yTG9naWMoc3RlcCwgaXNDdXJyZW50U3RlcClcbiAgICAgIDogdGhpcy5fZ2V0R3VpZGVsaW5lTG9naWMoc3RlcCwgaXNDdXJyZW50U3RlcCwgc3RhdGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RGVmYXVsdEluZGljYXRvckxvZ2ljKHN0ZXA6IENka1N0ZXAsIGlzQ3VycmVudFN0ZXA6IGJvb2xlYW4pOiBTdGVwU3RhdGUge1xuICAgIGlmIChzdGVwLl9zaG93RXJyb3IoKSAmJiBzdGVwLmhhc0Vycm9yICYmICFpc0N1cnJlbnRTdGVwKSB7XG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5FUlJPUjtcbiAgICB9IGVsc2UgaWYgKCFzdGVwLmNvbXBsZXRlZCB8fCBpc0N1cnJlbnRTdGVwKSB7XG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5OVU1CRVI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdGVwLmVkaXRhYmxlID8gU1RFUF9TVEFURS5FRElUIDogU1RFUF9TVEFURS5ET05FO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEd1aWRlbGluZUxvZ2ljKFxuICAgIHN0ZXA6IENka1N0ZXAsXG4gICAgaXNDdXJyZW50U3RlcDogYm9vbGVhbixcbiAgICBzdGF0ZTogU3RlcFN0YXRlID0gU1RFUF9TVEFURS5OVU1CRVIsXG4gICk6IFN0ZXBTdGF0ZSB7XG4gICAgaWYgKHN0ZXAuX3Nob3dFcnJvcigpICYmIHN0ZXAuaGFzRXJyb3IgJiYgIWlzQ3VycmVudFN0ZXApIHtcbiAgICAgIHJldHVybiBTVEVQX1NUQVRFLkVSUk9SO1xuICAgIH0gZWxzZSBpZiAoc3RlcC5jb21wbGV0ZWQgJiYgIWlzQ3VycmVudFN0ZXApIHtcbiAgICAgIHJldHVybiBTVEVQX1NUQVRFLkRPTkU7XG4gICAgfSBlbHNlIGlmIChzdGVwLmNvbXBsZXRlZCAmJiBpc0N1cnJlbnRTdGVwKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfSBlbHNlIGlmIChzdGVwLmVkaXRhYmxlICYmIGlzQ3VycmVudFN0ZXApIHtcbiAgICAgIHJldHVybiBTVEVQX1NUQVRFLkVESVQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pc0N1cnJlbnRTdGVwKGluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRJbmRleCA9PT0gaW5kZXg7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRseS1mb2N1c2VkIHN0ZXAgaGVhZGVyLiAqL1xuICBfZ2V0Rm9jdXNJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5TWFuYWdlciA/IHRoaXMuX2tleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4IDogdGhpcy5fc2VsZWN0ZWRJbmRleDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVNlbGVjdGVkSXRlbUluZGV4KG5ld0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBzdGVwc0FycmF5ID0gdGhpcy5zdGVwcy50b0FycmF5KCk7XG4gICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2UuZW1pdCh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBuZXdJbmRleCxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZEluZGV4OiB0aGlzLl9zZWxlY3RlZEluZGV4LFxuICAgICAgc2VsZWN0ZWRTdGVwOiBzdGVwc0FycmF5W25ld0luZGV4XSxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZFN0ZXA6IHN0ZXBzQXJyYXlbdGhpcy5fc2VsZWN0ZWRJbmRleF0sXG4gICAgfSk7XG5cbiAgICAvLyBJZiBmb2N1cyBpcyBpbnNpZGUgdGhlIHN0ZXBwZXIsIG1vdmUgaXQgdG8gdGhlIG5leHQgaGVhZGVyLCBvdGhlcndpc2UgaXQgbWF5IGJlY29tZVxuICAgIC8vIGxvc3Qgd2hlbiB0aGUgYWN0aXZlIHN0ZXAgY29udGVudCBpcyBoaWRkZW4uIFdlIGNhbid0IGJlIG1vcmUgZ3JhbnVsYXIgd2l0aCB0aGUgY2hlY2tcbiAgICAvLyAoZS5nLiBjaGVja2luZyB3aGV0aGVyIGZvY3VzIGlzIGluc2lkZSB0aGUgYWN0aXZlIHN0ZXApLCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgYVxuICAgIC8vIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudHMgdGhhdCBhcmUgcmVuZGVyaW5nIG91dCB0aGUgY29udGVudC5cbiAgICB0aGlzLl9jb250YWluc0ZvY3VzKClcbiAgICAgID8gdGhpcy5fa2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKG5ld0luZGV4KVxuICAgICAgOiB0aGlzLl9rZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0obmV3SW5kZXgpO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWRJbmRleCA9IG5ld0luZGV4O1xuICAgIHRoaXMuc2VsZWN0ZWRJbmRleENoYW5nZS5lbWl0KHRoaXMuX3NlbGVjdGVkSW5kZXgpO1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlZCgpO1xuICB9XG5cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGhhc01vZGlmaWVyID0gaGFzTW9kaWZpZXJLZXkoZXZlbnQpO1xuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIGNvbnN0IG1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuXG4gICAgaWYgKFxuICAgICAgbWFuYWdlci5hY3RpdmVJdGVtSW5kZXggIT0gbnVsbCAmJlxuICAgICAgIWhhc01vZGlmaWVyICYmXG4gICAgICAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpXG4gICAgKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBtYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleDtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJykub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hbnlDb250cm9sc0ludmFsaWRPclBlbmRpbmcoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmxpbmVhciAmJiBpbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGVwc1xuICAgICAgICAudG9BcnJheSgpXG4gICAgICAgIC5zbGljZSgwLCBpbmRleClcbiAgICAgICAgLnNvbWUoc3RlcCA9PiB7XG4gICAgICAgICAgY29uc3QgY29udHJvbCA9IHN0ZXAuc3RlcENvbnRyb2w7XG4gICAgICAgICAgY29uc3QgaXNJbmNvbXBsZXRlID0gY29udHJvbFxuICAgICAgICAgICAgPyBjb250cm9sLmludmFsaWQgfHwgY29udHJvbC5wZW5kaW5nIHx8ICFzdGVwLmludGVyYWN0ZWRcbiAgICAgICAgICAgIDogIXN0ZXAuY29tcGxldGVkO1xuICAgICAgICAgIHJldHVybiBpc0luY29tcGxldGUgJiYgIXN0ZXAub3B0aW9uYWwgJiYgIXN0ZXAuX2NvbXBsZXRlZE92ZXJyaWRlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9sYXlvdXREaXJlY3Rpb24oKTogRGlyZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncnRsJyA6ICdsdHInO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzdGVwcGVyIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQuICovXG4gIHByaXZhdGUgX2NvbnRhaW5zRm9jdXMoKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3RlcHBlckVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgZm9jdXNlZEVsZW1lbnQgPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcbiAgICByZXR1cm4gc3RlcHBlckVsZW1lbnQgPT09IGZvY3VzZWRFbGVtZW50IHx8IHN0ZXBwZXJFbGVtZW50LmNvbnRhaW5zKGZvY3VzZWRFbGVtZW50KTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgcGFzc2VkLWluIGluZGV4IGlzIGEgdmFsaWQgc3RlcCBpbmRleC4gKi9cbiAgcHJpdmF0ZSBfaXNWYWxpZEluZGV4KGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaW5kZXggPiAtMSAmJiAoIXRoaXMuc3RlcHMgfHwgaW5kZXggPCB0aGlzLnN0ZXBzLmxlbmd0aCk7XG4gIH1cbn1cbiJdfQ==