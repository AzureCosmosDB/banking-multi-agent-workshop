/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { addAriaReferencedId, removeAriaReferencedId } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER, ESCAPE, TAB, UP_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { _getEventTarget } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Directive, ElementRef, Host, Inject, InjectionToken, Injector, Input, NgZone, Optional, ViewContainerRef, afterNextRender, booleanAttribute, forwardRef, inject, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatOptionSelectionChange, _countGroupLabelsBeforeOption, _getOptionScrollPosition, } from '@angular/material/core';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { Observable, Subject, Subscription, defer, fromEvent, merge, of as observableOf } from 'rxjs';
import { delay, filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, MatAutocomplete, } from './autocomplete';
import { MatAutocompleteOrigin } from './autocomplete-origin';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "@angular/cdk/scrolling";
import * as i4 from "@angular/material/form-field";
/**
 * Provider that allows the autocomplete to register as a ControlValueAccessor.
 * @docs-private
 */
export const MAT_AUTOCOMPLETE_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatAutocompleteTrigger),
    multi: true,
};
/**
 * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
 * @docs-private
 */
export function getMatAutocompleteMissingPanelError() {
    return Error('Attempting to open an undefined instance of `mat-autocomplete`. ' +
        'Make sure that the id passed to the `matAutocomplete` is correct and that ' +
        "you're attempting to open it after the ngAfterContentInit hook.");
}
/** Injection token that determines the scroll handling while the autocomplete panel is open. */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY = new InjectionToken('mat-autocomplete-scroll-strategy', {
    providedIn: 'root',
    factory: () => {
        const overlay = inject(Overlay);
        return () => overlay.scrollStrategies.reposition();
    },
});
/** @docs-private */
export function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,
};
/** Base class with all of the `MatAutocompleteTrigger` functionality. */
export class MatAutocompleteTrigger {
    constructor(_element, _overlay, _viewContainerRef, _zone, _changeDetectorRef, scrollStrategy, _dir, _formField, _document, _viewportRuler, _defaults) {
        this._element = _element;
        this._overlay = _overlay;
        this._viewContainerRef = _viewContainerRef;
        this._zone = _zone;
        this._changeDetectorRef = _changeDetectorRef;
        this._dir = _dir;
        this._formField = _formField;
        this._document = _document;
        this._viewportRuler = _viewportRuler;
        this._defaults = _defaults;
        this._componentDestroyed = false;
        /** Whether or not the label state is being overridden. */
        this._manuallyFloatingLabel = false;
        /** Subscription to viewport size changes. */
        this._viewportSubscription = Subscription.EMPTY;
        /** Implements BreakpointObserver to be used to detect handset landscape */
        this._breakpointObserver = inject(BreakpointObserver);
        this._handsetLandscapeSubscription = Subscription.EMPTY;
        /**
         * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
         * closed autocomplete from being reopened if the user switches to another browser tab and then
         * comes back.
         */
        this._canOpenOnNextFocus = true;
        /** Stream of keyboard events that can close the panel. */
        this._closeKeyEventStream = new Subject();
        /**
         * Event handler for when the window is blurred. Needs to be an
         * arrow function in order to preserve the context.
         */
        this._windowBlurHandler = () => {
            // If the user blurred the window while the autocomplete is focused, it means that it'll be
            // refocused when they come back. In this case we want to skip the first focus event, if the
            // pane was closed, in order to avoid reopening it unintentionally.
            this._canOpenOnNextFocus =
                this._document.activeElement !== this._element.nativeElement || this.panelOpen;
        };
        /** `View -> model callback called when value changes` */
        this._onChange = () => { };
        /** `View -> model callback called when autocomplete has been touched` */
        this._onTouched = () => { };
        /**
         * Position of the autocomplete panel relative to the trigger element. A position of `auto`
         * will render the panel underneath the trigger if there is enough space for it to fit in
         * the viewport, otherwise the panel will be shown above it. If the position is set to
         * `above` or `below`, the panel will always be shown above or below the trigger. no matter
         * whether it fits completely in the viewport.
         */
        this.position = 'auto';
        /**
         * `autocomplete` attribute to be set on the input element.
         * @docs-private
         */
        this.autocompleteAttribute = 'off';
        this._initialized = new Subject();
        this._injector = inject(Injector);
        /** Class to apply to the panel when it's above the input. */
        this._aboveClass = 'mat-mdc-autocomplete-panel-above';
        this._overlayAttached = false;
        /** Stream of changes to the selection state of the autocomplete options. */
        this.optionSelections = defer(() => {
            const options = this.autocomplete ? this.autocomplete.options : null;
            if (options) {
                return options.changes.pipe(startWith(options), switchMap(() => merge(...options.map(option => option.onSelectionChange))));
            }
            // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
            // Return a stream that we'll replace with the real one once everything is in place.
            return this._initialized.pipe(switchMap(() => this.optionSelections));
        });
        /** Handles keyboard events coming from the overlay panel. */
        this._handlePanelKeydown = (event) => {
            // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
            // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
            if ((event.keyCode === ESCAPE && !hasModifierKey(event)) ||
                (event.keyCode === UP_ARROW && hasModifierKey(event, 'altKey'))) {
                // If the user had typed something in before we autoselected an option, and they decided
                // to cancel the selection, restore the input value to the one they had typed in.
                if (this._pendingAutoselectedOption) {
                    this._updateNativeInputValue(this._valueBeforeAutoSelection ?? '');
                    this._pendingAutoselectedOption = null;
                }
                this._closeKeyEventStream.next();
                this._resetActiveItem();
                // We need to stop propagation, otherwise the event will eventually
                // reach the input itself and cause the overlay to be reopened.
                event.stopPropagation();
                event.preventDefault();
            }
        };
        /**
         * Track which modal we have modified the `aria-owns` attribute of. When the combobox trigger is
         * inside an aria-modal, we apply aria-owns to the parent modal with the `id` of the options
         * panel. Track the modal we have changed so we can undo the changes on destroy.
         */
        this._trackedModal = null;
        this._scrollStrategy = scrollStrategy;
    }
    ngAfterViewInit() {
        this._initialized.next();
        this._initialized.complete();
        const window = this._getWindow();
        if (typeof window !== 'undefined') {
            this._zone.runOutsideAngular(() => window.addEventListener('blur', this._windowBlurHandler));
        }
    }
    ngOnChanges(changes) {
        if (changes['position'] && this._positionStrategy) {
            this._setStrategyPositions(this._positionStrategy);
            if (this.panelOpen) {
                this._overlayRef.updatePosition();
            }
        }
    }
    ngOnDestroy() {
        const window = this._getWindow();
        if (typeof window !== 'undefined') {
            window.removeEventListener('blur', this._windowBlurHandler);
        }
        this._handsetLandscapeSubscription.unsubscribe();
        this._viewportSubscription.unsubscribe();
        this._componentDestroyed = true;
        this._destroyPanel();
        this._closeKeyEventStream.complete();
        this._clearFromModal();
    }
    /** Whether or not the autocomplete panel is open. */
    get panelOpen() {
        return this._overlayAttached && this.autocomplete.showPanel;
    }
    /** Opens the autocomplete suggestion panel. */
    openPanel() {
        this._openPanelInternal();
    }
    /** Closes the autocomplete suggestion panel. */
    closePanel() {
        this._resetLabel();
        if (!this._overlayAttached) {
            return;
        }
        if (this.panelOpen) {
            // Only emit if the panel was visible.
            // `afterNextRender` always runs outside of the Angular zone, so all the subscriptions from
            // `_subscribeToClosingActions()` are also outside of the Angular zone.
            // We should manually run in Angular zone to update UI after panel closing.
            this._zone.run(() => {
                this.autocomplete.closed.emit();
            });
        }
        // Only reset if this trigger is the latest one that opened the
        // autocomplete since another may have taken it over.
        if (this.autocomplete._latestOpeningTrigger === this) {
            this.autocomplete._isOpen = false;
            this.autocomplete._latestOpeningTrigger = null;
        }
        this._overlayAttached = false;
        this._pendingAutoselectedOption = null;
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
            this._closingActionsSubscription.unsubscribe();
        }
        this._updatePanelState();
        // Note that in some cases this can end up being called after the component is destroyed.
        // Add a check to ensure that we don't try to run change detection on a destroyed view.
        if (!this._componentDestroyed) {
            // We need to trigger change detection manually, because
            // `fromEvent` doesn't seem to do it at the proper time.
            // This ensures that the label is reset when the
            // user clicks outside.
            this._changeDetectorRef.detectChanges();
        }
        // Remove aria-owns attribute when the autocomplete is no longer visible.
        if (this._trackedModal) {
            removeAriaReferencedId(this._trackedModal, 'aria-owns', this.autocomplete.id);
        }
    }
    /**
     * Updates the position of the autocomplete suggestion panel to ensure that it fits all options
     * within the viewport.
     */
    updatePosition() {
        if (this._overlayAttached) {
            this._overlayRef.updatePosition();
        }
    }
    /**
     * A stream of actions that should close the autocomplete panel, including
     * when an option is selected, on blur, and when TAB is pressed.
     */
    get panelClosingActions() {
        return merge(this.optionSelections, this.autocomplete._keyManager.tabOut.pipe(filter(() => this._overlayAttached)), this._closeKeyEventStream, this._getOutsideClickStream(), this._overlayRef
            ? this._overlayRef.detachments().pipe(filter(() => this._overlayAttached))
            : observableOf()).pipe(
        // Normalize the output so we return a consistent type.
        map(event => (event instanceof MatOptionSelectionChange ? event : null)));
    }
    /** The currently active option, coerced to MatOption type. */
    get activeOption() {
        if (this.autocomplete && this.autocomplete._keyManager) {
            return this.autocomplete._keyManager.activeItem;
        }
        return null;
    }
    /** Stream of clicks outside of the autocomplete panel. */
    _getOutsideClickStream() {
        return merge(fromEvent(this._document, 'click'), fromEvent(this._document, 'auxclick'), fromEvent(this._document, 'touchend')).pipe(filter(event => {
            // If we're in the Shadow DOM, the event target will be the shadow root, so we have to
            // fall back to check the first element in the path of the click event.
            const clickTarget = _getEventTarget(event);
            const formField = this._formField
                ? this._formField.getConnectedOverlayOrigin().nativeElement
                : null;
            const customOrigin = this.connectedTo ? this.connectedTo.elementRef.nativeElement : null;
            return (this._overlayAttached &&
                clickTarget !== this._element.nativeElement &&
                // Normally focus moves inside `mousedown` so this condition will almost always be
                // true. Its main purpose is to handle the case where the input is focused from an
                // outside click which propagates up to the `body` listener within the same sequence
                // and causes the panel to close immediately (see #3106).
                this._document.activeElement !== this._element.nativeElement &&
                (!formField || !formField.contains(clickTarget)) &&
                (!customOrigin || !customOrigin.contains(clickTarget)) &&
                !!this._overlayRef &&
                !this._overlayRef.overlayElement.contains(clickTarget));
        }));
    }
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
        Promise.resolve(null).then(() => this._assignOptionValue(value));
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
        this._onChange = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
        this._element.nativeElement.disabled = isDisabled;
    }
    _handleKeydown(event) {
        const keyCode = event.keyCode;
        const hasModifier = hasModifierKey(event);
        // Prevent the default action on all escape key presses. This is here primarily to bring IE
        // in line with other browsers. By default, pressing escape on IE will cause it to revert
        // the input value to the one that it had on focus, however it won't dispatch any events
        // which means that the model value will be out of sync with the view.
        if (keyCode === ESCAPE && !hasModifier) {
            event.preventDefault();
        }
        this._valueOnLastKeydown = this._element.nativeElement.value;
        if (this.activeOption && keyCode === ENTER && this.panelOpen && !hasModifier) {
            this.activeOption._selectViaInteraction();
            this._resetActiveItem();
            event.preventDefault();
        }
        else if (this.autocomplete) {
            const prevActiveItem = this.autocomplete._keyManager.activeItem;
            const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;
            if (keyCode === TAB || (isArrowKey && !hasModifier && this.panelOpen)) {
                this.autocomplete._keyManager.onKeydown(event);
            }
            else if (isArrowKey && this._canOpen()) {
                this._openPanelInternal(this._valueOnLastKeydown);
            }
            if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
                this._scrollToOption(this.autocomplete._keyManager.activeItemIndex || 0);
                if (this.autocomplete.autoSelectActiveOption && this.activeOption) {
                    if (!this._pendingAutoselectedOption) {
                        this._valueBeforeAutoSelection = this._valueOnLastKeydown;
                    }
                    this._pendingAutoselectedOption = this.activeOption;
                    this._assignOptionValue(this.activeOption.value);
                }
            }
        }
    }
    _handleInput(event) {
        let target = event.target;
        let value = target.value;
        // Based on `NumberValueAccessor` from forms.
        if (target.type === 'number') {
            value = value == '' ? null : parseFloat(value);
        }
        // If the input has a placeholder, IE will fire the `input` event on page load,
        // focus and blur, in addition to when the user actually changed the value. To
        // filter out all of the extra events, we save the value on focus and between
        // `input` events, and we check whether it changed.
        // See: https://connect.microsoft.com/IE/feedback/details/885747/
        if (this._previousValue !== value) {
            this._previousValue = value;
            this._pendingAutoselectedOption = null;
            // If selection is required we don't write to the CVA while the user is typing.
            // At the end of the selection either the user will have picked something
            // or we'll reset the value back to null.
            if (!this.autocomplete || !this.autocomplete.requireSelection) {
                this._onChange(value);
            }
            if (!value) {
                this._clearPreviousSelectedOption(null, false);
            }
            else if (this.panelOpen && !this.autocomplete.requireSelection) {
                // Note that we don't reset this when `requireSelection` is enabled,
                // because the option will be reset when the panel is closed.
                const selectedOption = this.autocomplete.options?.find(option => option.selected);
                if (selectedOption) {
                    const display = this._getDisplayValue(selectedOption.value);
                    if (value !== display) {
                        selectedOption.deselect(false);
                    }
                }
            }
            if (this._canOpen() && this._document.activeElement === event.target) {
                // When the `input` event fires, the input's value will have already changed. This means
                // that if we take the `this._element.nativeElement.value` directly, it'll be one keystroke
                // behind. This can be a problem when the user selects a value, changes a character while
                // the input still has focus and then clicks away (see #28432). To work around it, we
                // capture the value in `keydown` so we can use it here.
                const valueOnAttach = this._valueOnLastKeydown ?? this._element.nativeElement.value;
                this._valueOnLastKeydown = null;
                this._openPanelInternal(valueOnAttach);
            }
        }
    }
    _handleFocus() {
        if (!this._canOpenOnNextFocus) {
            this._canOpenOnNextFocus = true;
        }
        else if (this._canOpen()) {
            this._previousValue = this._element.nativeElement.value;
            this._attachOverlay(this._previousValue);
            this._floatLabel(true);
        }
    }
    _handleClick() {
        if (this._canOpen() && !this.panelOpen) {
            this._openPanelInternal();
        }
    }
    /**
     * In "auto" mode, the label will animate down as soon as focus is lost.
     * This causes the value to jump when selecting an option with the mouse.
     * This method manually floats the label until the panel can be closed.
     * @param shouldAnimate Whether the label should be animated when it is floated.
     */
    _floatLabel(shouldAnimate = false) {
        if (this._formField && this._formField.floatLabel === 'auto') {
            if (shouldAnimate) {
                this._formField._animateAndLockLabel();
            }
            else {
                this._formField.floatLabel = 'always';
            }
            this._manuallyFloatingLabel = true;
        }
    }
    /** If the label has been manually elevated, return it to its normal state. */
    _resetLabel() {
        if (this._manuallyFloatingLabel) {
            if (this._formField) {
                this._formField.floatLabel = 'auto';
            }
            this._manuallyFloatingLabel = false;
        }
    }
    /**
     * This method listens to a stream of panel closing actions and resets the
     * stream every time the option list changes.
     */
    _subscribeToClosingActions() {
        const initialRender = new Observable(subscriber => {
            afterNextRender(() => {
                subscriber.next();
            }, { injector: this._injector });
        });
        const optionChanges = this.autocomplete.options.changes.pipe(tap(() => this._positionStrategy.reapplyLastPosition()), 
        // Defer emitting to the stream until the next tick, because changing
        // bindings in here will cause "changed after checked" errors.
        delay(0));
        // When the options are initially rendered, and when the option list changes...
        return (merge(initialRender, optionChanges)
            .pipe(
        // create a new stream of panelClosingActions, replacing any previous streams
        // that were created, and flatten it so our stream only emits closing events...
        switchMap(() => this._zone.run(() => {
            // `afterNextRender` always runs outside of the Angular zone, thus we have to re-enter
            // the Angular zone. This will lead to change detection being called outside of the Angular
            // zone and the `autocomplete.opened` will also emit outside of the Angular.
            const wasOpen = this.panelOpen;
            this._resetActiveItem();
            this._updatePanelState();
            this._changeDetectorRef.detectChanges();
            if (this.panelOpen) {
                this._overlayRef.updatePosition();
            }
            if (wasOpen !== this.panelOpen) {
                // If the `panelOpen` state changed, we need to make sure to emit the `opened` or
                // `closed` event, because we may not have emitted it. This can happen
                // - if the users opens the panel and there are no options, but the
                //   options come in slightly later or as a result of the value changing,
                // - if the panel is closed after the user entered a string that did not match any
                //   of the available options,
                // - if a valid string is entered after an invalid one.
                if (this.panelOpen) {
                    this._emitOpened();
                }
                else {
                    this.autocomplete.closed.emit();
                }
            }
            return this.panelClosingActions;
        })), 
        // when the first closing event occurs...
        take(1))
            // set the value, close the panel, and complete.
            .subscribe(event => this._setValueAndClose(event)));
    }
    /**
     * Emits the opened event once it's known that the panel will be shown and stores
     * the state of the trigger right before the opening sequence was finished.
     */
    _emitOpened() {
        this.autocomplete.opened.emit();
    }
    /** Destroys the autocomplete suggestion panel. */
    _destroyPanel() {
        if (this._overlayRef) {
            this.closePanel();
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }
    /** Given a value, returns the string that should be shown within the input. */
    _getDisplayValue(value) {
        const autocomplete = this.autocomplete;
        return autocomplete && autocomplete.displayWith ? autocomplete.displayWith(value) : value;
    }
    _assignOptionValue(value) {
        const toDisplay = this._getDisplayValue(value);
        if (value == null) {
            this._clearPreviousSelectedOption(null, false);
        }
        // Simply falling back to an empty string if the display value is falsy does not work properly.
        // The display value can also be the number zero and shouldn't fall back to an empty string.
        this._updateNativeInputValue(toDisplay != null ? toDisplay : '');
    }
    _updateNativeInputValue(value) {
        // If it's used within a `MatFormField`, we should set it through the property so it can go
        // through change detection.
        if (this._formField) {
            this._formField._control.value = value;
        }
        else {
            this._element.nativeElement.value = value;
        }
        this._previousValue = value;
    }
    /**
     * This method closes the panel, and if a value is specified, also sets the associated
     * control to that value. It will also mark the control as dirty if this interaction
     * stemmed from the user.
     */
    _setValueAndClose(event) {
        const panel = this.autocomplete;
        const toSelect = event ? event.source : this._pendingAutoselectedOption;
        if (toSelect) {
            this._clearPreviousSelectedOption(toSelect);
            this._assignOptionValue(toSelect.value);
            // TODO(crisbeto): this should wait until the animation is done, otherwise the value
            // gets reset while the panel is still animating which looks glitchy. It'll likely break
            // some tests to change it at this point.
            this._onChange(toSelect.value);
            panel._emitSelectEvent(toSelect);
            this._element.nativeElement.focus();
        }
        else if (panel.requireSelection &&
            this._element.nativeElement.value !== this._valueOnAttach) {
            this._clearPreviousSelectedOption(null);
            this._assignOptionValue(null);
            // Wait for the animation to finish before clearing the form control value, otherwise
            // the options might change while the animation is running which looks glitchy.
            if (panel._animationDone) {
                panel._animationDone.pipe(take(1)).subscribe(() => this._onChange(null));
            }
            else {
                this._onChange(null);
            }
        }
        this.closePanel();
    }
    /**
     * Clear any previous selected option and emit a selection change event for this option
     */
    _clearPreviousSelectedOption(skip, emitEvent) {
        // Null checks are necessary here, because the autocomplete
        // or its options may not have been assigned yet.
        this.autocomplete?.options?.forEach(option => {
            if (option !== skip && option.selected) {
                option.deselect(emitEvent);
            }
        });
    }
    _openPanelInternal(valueOnAttach = this._element.nativeElement.value) {
        this._attachOverlay(valueOnAttach);
        this._floatLabel();
        // Add aria-owns attribute when the autocomplete becomes visible.
        if (this._trackedModal) {
            const panelId = this.autocomplete.id;
            addAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
        }
    }
    _attachOverlay(valueOnAttach) {
        if (!this.autocomplete && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMatAutocompleteMissingPanelError();
        }
        let overlayRef = this._overlayRef;
        if (!overlayRef) {
            this._portal = new TemplatePortal(this.autocomplete.template, this._viewContainerRef, {
                id: this._formField?.getLabelId(),
            });
            overlayRef = this._overlay.create(this._getOverlayConfig());
            this._overlayRef = overlayRef;
            this._viewportSubscription = this._viewportRuler.change().subscribe(() => {
                if (this.panelOpen && overlayRef) {
                    overlayRef.updateSize({ width: this._getPanelWidth() });
                }
            });
            // Subscribe to the breakpoint events stream to detect when screen is in
            // handsetLandscape.
            this._handsetLandscapeSubscription = this._breakpointObserver
                .observe(Breakpoints.HandsetLandscape)
                .subscribe(result => {
                const isHandsetLandscape = result.matches;
                // Check if result.matches Breakpoints.HandsetLandscape. Apply HandsetLandscape
                // settings to prevent overlay cutoff in that breakpoint. Fixes b/284148377
                if (isHandsetLandscape) {
                    this._positionStrategy
                        .withFlexibleDimensions(true)
                        .withGrowAfterOpen(true)
                        .withViewportMargin(8);
                }
                else {
                    this._positionStrategy
                        .withFlexibleDimensions(false)
                        .withGrowAfterOpen(false)
                        .withViewportMargin(0);
                }
            });
        }
        else {
            // Update the trigger, panel width and direction, in case anything has changed.
            this._positionStrategy.setOrigin(this._getConnectedElement());
            overlayRef.updateSize({ width: this._getPanelWidth() });
        }
        if (overlayRef && !overlayRef.hasAttached()) {
            overlayRef.attach(this._portal);
            this._valueOnAttach = valueOnAttach;
            this._valueOnLastKeydown = null;
            this._closingActionsSubscription = this._subscribeToClosingActions();
        }
        const wasOpen = this.panelOpen;
        this.autocomplete._isOpen = this._overlayAttached = true;
        this.autocomplete._latestOpeningTrigger = this;
        this.autocomplete._setColor(this._formField?.color);
        this._updatePanelState();
        this._applyModalPanelOwnership();
        // We need to do an extra `panelOpen` check in here, because the
        // autocomplete won't be shown if there are no options.
        if (this.panelOpen && wasOpen !== this.panelOpen) {
            this._emitOpened();
        }
    }
    /** Updates the panel's visibility state and any trigger state tied to id. */
    _updatePanelState() {
        this.autocomplete._setVisibility();
        // Note that here we subscribe and unsubscribe based on the panel's visiblity state,
        // because the act of subscribing will prevent events from reaching other overlays and
        // we don't want to block the events if there are no options.
        if (this.panelOpen) {
            const overlayRef = this._overlayRef;
            if (!this._keydownSubscription) {
                // Use the `keydownEvents` in order to take advantage of
                // the overlay event targeting provided by the CDK overlay.
                this._keydownSubscription = overlayRef.keydownEvents().subscribe(this._handlePanelKeydown);
            }
            if (!this._outsideClickSubscription) {
                // Subscribe to the pointer events stream so that it doesn't get picked up by other overlays.
                // TODO(crisbeto): we should switch `_getOutsideClickStream` eventually to use this stream,
                // but the behvior isn't exactly the same and it ends up breaking some internal tests.
                this._outsideClickSubscription = overlayRef.outsidePointerEvents().subscribe();
            }
        }
        else {
            this._keydownSubscription?.unsubscribe();
            this._outsideClickSubscription?.unsubscribe();
            this._keydownSubscription = this._outsideClickSubscription = null;
        }
    }
    _getOverlayConfig() {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPosition(),
            scrollStrategy: this._scrollStrategy(),
            width: this._getPanelWidth(),
            direction: this._dir ?? undefined,
            panelClass: this._defaults?.overlayPanelClass,
        });
    }
    _getOverlayPosition() {
        // Set default Overlay Position
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this._getConnectedElement())
            .withFlexibleDimensions(false)
            .withPush(false);
        this._setStrategyPositions(strategy);
        this._positionStrategy = strategy;
        return strategy;
    }
    /** Sets the positions on a position strategy based on the directive's input state. */
    _setStrategyPositions(positionStrategy) {
        // Note that we provide horizontal fallback positions, even though by default the dropdown
        // width matches the input, because consumers can override the width. See #18854.
        const belowPositions = [
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
            { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        ];
        // The overlay edge connected to the trigger should have squared corners, while
        // the opposite end has rounded corners. We apply a CSS class to swap the
        // border-radius based on the overlay position.
        const panelClass = this._aboveClass;
        const abovePositions = [
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass },
            { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass },
        ];
        let positions;
        if (this.position === 'above') {
            positions = abovePositions;
        }
        else if (this.position === 'below') {
            positions = belowPositions;
        }
        else {
            positions = [...belowPositions, ...abovePositions];
        }
        positionStrategy.withPositions(positions);
    }
    _getConnectedElement() {
        if (this.connectedTo) {
            return this.connectedTo.elementRef;
        }
        return this._formField ? this._formField.getConnectedOverlayOrigin() : this._element;
    }
    _getPanelWidth() {
        return this.autocomplete.panelWidth || this._getHostWidth();
    }
    /** Returns the width of the input element, so the panel width can match it. */
    _getHostWidth() {
        return this._getConnectedElement().nativeElement.getBoundingClientRect().width;
    }
    /**
     * Reset the active item to -1. This is so that pressing arrow keys will activate the correct
     * option.
     *
     * If the consumer opted-in to automatically activatating the first option, activate the first
     * *enabled* option.
     */
    _resetActiveItem() {
        const autocomplete = this.autocomplete;
        if (autocomplete.autoActiveFirstOption) {
            // Find the index of the first *enabled* option. Avoid calling `_keyManager.setActiveItem`
            // because it activates the first option that passes the skip predicate, rather than the
            // first *enabled* option.
            let firstEnabledOptionIndex = -1;
            for (let index = 0; index < autocomplete.options.length; index++) {
                const option = autocomplete.options.get(index);
                if (!option.disabled) {
                    firstEnabledOptionIndex = index;
                    break;
                }
            }
            autocomplete._keyManager.setActiveItem(firstEnabledOptionIndex);
        }
        else {
            autocomplete._keyManager.setActiveItem(-1);
        }
    }
    /** Determines whether the panel can be opened. */
    _canOpen() {
        const element = this._element.nativeElement;
        return !element.readOnly && !element.disabled && !this.autocompleteDisabled;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document?.defaultView || window;
    }
    /** Scrolls to a particular option in the list. */
    _scrollToOption(index) {
        // Given that we are not actually focusing active options, we must manually adjust scroll
        // to reveal options below the fold. First, we find the offset of the option from the top
        // of the panel. If that offset is below the fold, the new scrollTop will be the offset -
        // the panel height + the option height, so the active option will be just visible at the
        // bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
        // will become the offset. If that offset is visible within the panel already, the scrollTop is
        // not adjusted.
        const autocomplete = this.autocomplete;
        const labelCount = _countGroupLabelsBeforeOption(index, autocomplete.options, autocomplete.optionGroups);
        if (index === 0 && labelCount === 1) {
            // If we've got one group label before the option and we're at the top option,
            // scroll the list to the top. This is better UX than scrolling the list to the
            // top of the option, because it allows the user to read the top group's label.
            autocomplete._setScrollTop(0);
        }
        else if (autocomplete.panel) {
            const option = autocomplete.options.toArray()[index];
            if (option) {
                const element = option._getHostElement();
                const newScrollPosition = _getOptionScrollPosition(element.offsetTop, element.offsetHeight, autocomplete._getScrollTop(), autocomplete.panel.nativeElement.offsetHeight);
                autocomplete._setScrollTop(newScrollPosition);
            }
        }
    }
    /**
     * If the autocomplete trigger is inside of an `aria-modal` element, connect
     * that modal to the options panel with `aria-owns`.
     *
     * For some browser + screen reader combinations, when navigation is inside
     * of an `aria-modal` element, the screen reader treats everything outside
     * of that modal as hidden or invisible.
     *
     * This causes a problem when the combobox trigger is _inside_ of a modal, because the
     * options panel is rendered _outside_ of that modal, preventing screen reader navigation
     * from reaching the panel.
     *
     * We can work around this issue by applying `aria-owns` to the modal with the `id` of
     * the options panel. This effectively communicates to assistive technology that the
     * options panel is part of the same interaction as the modal.
     *
     * At time of this writing, this issue is present in VoiceOver.
     * See https://github.com/angular/components/issues/20694
     */
    _applyModalPanelOwnership() {
        // TODO(http://github.com/angular/components/issues/26853): consider de-duplicating this with
        // the `LiveAnnouncer` and any other usages.
        //
        // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
        // section of the DOM we need to look through. This should cover all the cases we support, but
        // the selector can be expanded if it turns out to be too narrow.
        const modal = this._element.nativeElement.closest('body > .cdk-overlay-container [aria-modal="true"]');
        if (!modal) {
            // Most commonly, the autocomplete trigger is not inside a modal.
            return;
        }
        const panelId = this.autocomplete.id;
        if (this._trackedModal) {
            removeAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
        }
        addAriaReferencedId(modal, 'aria-owns', panelId);
        this._trackedModal = modal;
    }
    /** Clears the references to the listbox overlay element from the modal it was added to. */
    _clearFromModal() {
        if (this._trackedModal) {
            const panelId = this.autocomplete.id;
            removeAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
            this._trackedModal = null;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocompleteTrigger, deps: [{ token: i0.ElementRef }, { token: i1.Overlay }, { token: i0.ViewContainerRef }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: MAT_AUTOCOMPLETE_SCROLL_STRATEGY }, { token: i2.Directionality, optional: true }, { token: MAT_FORM_FIELD, host: true, optional: true }, { token: DOCUMENT, optional: true }, { token: i3.ViewportRuler }, { token: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatAutocompleteTrigger, isStandalone: true, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: { autocomplete: ["matAutocomplete", "autocomplete"], position: ["matAutocompletePosition", "position"], connectedTo: ["matAutocompleteConnectedTo", "connectedTo"], autocompleteAttribute: ["autocomplete", "autocompleteAttribute"], autocompleteDisabled: ["matAutocompleteDisabled", "autocompleteDisabled", booleanAttribute] }, host: { listeners: { "focusin": "_handleFocus()", "blur": "_onTouched()", "input": "_handleInput($event)", "keydown": "_handleKeydown($event)", "click": "_handleClick()" }, properties: { "attr.autocomplete": "autocompleteAttribute", "attr.role": "autocompleteDisabled ? null : \"combobox\"", "attr.aria-autocomplete": "autocompleteDisabled ? null : \"list\"", "attr.aria-activedescendant": "(panelOpen && activeOption) ? activeOption.id : null", "attr.aria-expanded": "autocompleteDisabled ? null : panelOpen.toString()", "attr.aria-controls": "(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id", "attr.aria-haspopup": "autocompleteDisabled ? null : \"listbox\"" }, classAttribute: "mat-mdc-autocomplete-trigger" }, providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR], exportAs: ["matAutocompleteTrigger"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatAutocompleteTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: `input[matAutocomplete], textarea[matAutocomplete]`,
                    host: {
                        'class': 'mat-mdc-autocomplete-trigger',
                        '[attr.autocomplete]': 'autocompleteAttribute',
                        '[attr.role]': 'autocompleteDisabled ? null : "combobox"',
                        '[attr.aria-autocomplete]': 'autocompleteDisabled ? null : "list"',
                        '[attr.aria-activedescendant]': '(panelOpen && activeOption) ? activeOption.id : null',
                        '[attr.aria-expanded]': 'autocompleteDisabled ? null : panelOpen.toString()',
                        '[attr.aria-controls]': '(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id',
                        '[attr.aria-haspopup]': 'autocompleteDisabled ? null : "listbox"',
                        // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
                        // a little earlier. This avoids issues where IE delays the focusing of the input.
                        '(focusin)': '_handleFocus()',
                        '(blur)': '_onTouched()',
                        '(input)': '_handleInput($event)',
                        '(keydown)': '_handleKeydown($event)',
                        '(click)': '_handleClick()',
                    },
                    exportAs: 'matAutocompleteTrigger',
                    providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Overlay }, { type: i0.ViewContainerRef }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i4.MatFormField, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_FORM_FIELD]
                }, {
                    type: Host
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i3.ViewportRuler }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_AUTOCOMPLETE_DEFAULT_OPTIONS]
                }] }], propDecorators: { autocomplete: [{
                type: Input,
                args: ['matAutocomplete']
            }], position: [{
                type: Input,
                args: ['matAutocompletePosition']
            }], connectedTo: [{
                type: Input,
                args: ['matAutocompleteConnectedTo']
            }], autocompleteAttribute: [{
                type: Input,
                args: ['autocomplete']
            }], autocompleteDisabled: [{
                type: Input,
                args: [{ alias: 'matAutocompleteDisabled', transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYXV0b2NvbXBsZXRlL2F1dG9jb21wbGV0ZS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTlFLE9BQU8sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9GLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsR0FJZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsSUFBSSxFQUNKLE1BQU0sRUFDTixjQUFjLEVBQ2QsUUFBUSxFQUNSLEtBQUssRUFDTCxNQUFNLEVBR04sUUFBUSxFQUVSLGdCQUFnQixFQUNoQixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDVixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZFLE9BQU8sRUFFTCx3QkFBd0IsRUFDeEIsNkJBQTZCLEVBQzdCLHdCQUF3QixHQUN6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Ii8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2FkZEFyaWFSZWZlcmVuY2VkSWQsIHJlbW92ZUFyaWFSZWZlcmVuY2VkSWR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RE9XTl9BUlJPVywgRU5URVIsIEVTQ0FQRSwgVEFCLCBVUF9BUlJPVywgaGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0JyZWFrcG9pbnRPYnNlcnZlciwgQnJlYWtwb2ludHN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9sYXlvdXQnO1xuaW1wb3J0IHtcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgT3ZlcmxheSxcbiAgT3ZlcmxheUNvbmZpZyxcbiAgT3ZlcmxheVJlZixcbiAgUG9zaXRpb25TdHJhdGVneSxcbiAgU2Nyb2xsU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7X2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1ZpZXdwb3J0UnVsZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEhvc3QsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIGFmdGVyTmV4dFJlbmRlcixcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgZm9yd2FyZFJlZixcbiAgaW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge1xuICBNYXRPcHRpb24sXG4gIE1hdE9wdGlvblNlbGVjdGlvbkNoYW5nZSxcbiAgX2NvdW50R3JvdXBMYWJlbHNCZWZvcmVPcHRpb24sXG4gIF9nZXRPcHRpb25TY3JvbGxQb3NpdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01BVF9GT1JNX0ZJRUxELCBNYXRGb3JtRmllbGR9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0LCBTdWJzY3JpcHRpb24sIGRlZmVyLCBmcm9tRXZlbnQsIG1lcmdlLCBvZiBhcyBvYnNlcnZhYmxlT2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkZWxheSwgZmlsdGVyLCBtYXAsIHN0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlLCB0YXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIE1BVF9BVVRPQ09NUExFVEVfREVGQVVMVF9PUFRJT05TLFxuICBNYXRBdXRvY29tcGxldGUsXG4gIE1hdEF1dG9jb21wbGV0ZURlZmF1bHRPcHRpb25zLFxufSBmcm9tICcuL2F1dG9jb21wbGV0ZSc7XG5pbXBvcnQge01hdEF1dG9jb21wbGV0ZU9yaWdpbn0gZnJvbSAnLi9hdXRvY29tcGxldGUtb3JpZ2luJztcblxuLyoqXG4gKiBQcm92aWRlciB0aGF0IGFsbG93cyB0aGUgYXV0b2NvbXBsZXRlIHRvIHJlZ2lzdGVyIGFzIGEgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQVVUT0NPTVBMRVRFX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XG4gIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRBdXRvY29tcGxldGVUcmlnZ2VyKSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gZXJyb3IgdG8gYmUgdGhyb3duIHdoZW4gYXR0ZW1wdGluZyB0byB1c2UgYW4gYXV0b2NvbXBsZXRlIHRyaWdnZXIgd2l0aG91dCBhIHBhbmVsLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0QXV0b2NvbXBsZXRlTWlzc2luZ1BhbmVsRXJyb3IoKTogRXJyb3Ige1xuICByZXR1cm4gRXJyb3IoXG4gICAgJ0F0dGVtcHRpbmcgdG8gb3BlbiBhbiB1bmRlZmluZWQgaW5zdGFuY2Ugb2YgYG1hdC1hdXRvY29tcGxldGVgLiAnICtcbiAgICAgICdNYWtlIHN1cmUgdGhhdCB0aGUgaWQgcGFzc2VkIHRvIHRoZSBgbWF0QXV0b2NvbXBsZXRlYCBpcyBjb3JyZWN0IGFuZCB0aGF0ICcgK1xuICAgICAgXCJ5b3UncmUgYXR0ZW1wdGluZyB0byBvcGVuIGl0IGFmdGVyIHRoZSBuZ0FmdGVyQ29udGVudEluaXQgaG9vay5cIixcbiAgKTtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGRldGVybWluZXMgdGhlIHNjcm9sbCBoYW5kbGluZyB3aGlsZSB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsIGlzIG9wZW4uICovXG5leHBvcnQgY29uc3QgTUFUX0FVVE9DT01QTEVURV9TQ1JPTExfU1RSQVRFR1kgPSBuZXcgSW5qZWN0aW9uVG9rZW48KCkgPT4gU2Nyb2xsU3RyYXRlZ3k+KFxuICAnbWF0LWF1dG9jb21wbGV0ZS1zY3JvbGwtc3RyYXRlZ3knLFxuICB7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IHtcbiAgICAgIGNvbnN0IG92ZXJsYXkgPSBpbmplY3QoT3ZlcmxheSk7XG4gICAgICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKTtcbiAgICB9LFxuICB9LFxuKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfQVVUT0NPTVBMRVRFX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZKG92ZXJsYXk6IE92ZXJsYXkpOiAoKSA9PiBTY3JvbGxTdHJhdGVneSB7XG4gIHJldHVybiAoKSA9PiBvdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IE1BVF9BVVRPQ09NUExFVEVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IE1BVF9BVVRPQ09NUExFVEVfU0NST0xMX1NUUkFURUdZLFxuICBkZXBzOiBbT3ZlcmxheV0sXG4gIHVzZUZhY3Rvcnk6IE1BVF9BVVRPQ09NUExFVEVfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUlksXG59O1xuXG4vKiogQmFzZSBjbGFzcyB3aXRoIGFsbCBvZiB0aGUgYE1hdEF1dG9jb21wbGV0ZVRyaWdnZXJgIGZ1bmN0aW9uYWxpdHkuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6IGBpbnB1dFttYXRBdXRvY29tcGxldGVdLCB0ZXh0YXJlYVttYXRBdXRvY29tcGxldGVdYCxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtbWRjLWF1dG9jb21wbGV0ZS10cmlnZ2VyJyxcbiAgICAnW2F0dHIuYXV0b2NvbXBsZXRlXSc6ICdhdXRvY29tcGxldGVBdHRyaWJ1dGUnLFxuICAgICdbYXR0ci5yb2xlXSc6ICdhdXRvY29tcGxldGVEaXNhYmxlZCA/IG51bGwgOiBcImNvbWJvYm94XCInLFxuICAgICdbYXR0ci5hcmlhLWF1dG9jb21wbGV0ZV0nOiAnYXV0b2NvbXBsZXRlRGlzYWJsZWQgPyBudWxsIDogXCJsaXN0XCInLFxuICAgICdbYXR0ci5hcmlhLWFjdGl2ZWRlc2NlbmRhbnRdJzogJyhwYW5lbE9wZW4gJiYgYWN0aXZlT3B0aW9uKSA/IGFjdGl2ZU9wdGlvbi5pZCA6IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdhdXRvY29tcGxldGVEaXNhYmxlZCA/IG51bGwgOiBwYW5lbE9wZW4udG9TdHJpbmcoKScsXG4gICAgJ1thdHRyLmFyaWEtY29udHJvbHNdJzogJyhhdXRvY29tcGxldGVEaXNhYmxlZCB8fCAhcGFuZWxPcGVuKSA/IG51bGwgOiBhdXRvY29tcGxldGU/LmlkJyxcbiAgICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnYXV0b2NvbXBsZXRlRGlzYWJsZWQgPyBudWxsIDogXCJsaXN0Ym94XCInLFxuICAgIC8vIE5vdGU6IHdlIHVzZSBgZm9jdXNpbmAsIGFzIG9wcG9zZWQgdG8gYGZvY3VzYCwgaW4gb3JkZXIgdG8gb3BlbiB0aGUgcGFuZWxcbiAgICAvLyBhIGxpdHRsZSBlYXJsaWVyLiBUaGlzIGF2b2lkcyBpc3N1ZXMgd2hlcmUgSUUgZGVsYXlzIHRoZSBmb2N1c2luZyBvZiB0aGUgaW5wdXQuXG4gICAgJyhmb2N1c2luKSc6ICdfaGFuZGxlRm9jdXMoKScsXG4gICAgJyhibHVyKSc6ICdfb25Ub3VjaGVkKCknLFxuICAgICcoaW5wdXQpJzogJ19oYW5kbGVJbnB1dCgkZXZlbnQpJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlkb3duKCRldmVudCknLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVDbGljaygpJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdtYXRBdXRvY29tcGxldGVUcmlnZ2VyJyxcbiAgcHJvdmlkZXJzOiBbTUFUX0FVVE9DT01QTEVURV9WQUxVRV9BQ0NFU1NPUl0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdEF1dG9jb21wbGV0ZVRyaWdnZXJcbiAgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3lcbntcbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGw7XG4gIHByaXZhdGUgX3BvcnRhbDogVGVtcGxhdGVQb3J0YWw7XG4gIHByaXZhdGUgX2NvbXBvbmVudERlc3Ryb3llZCA9IGZhbHNlO1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XG4gIHByaXZhdGUgX2tleWRvd25TdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiB8IG51bGw7XG4gIHByaXZhdGUgX291dHNpZGVDbGlja1N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbDtcblxuICAvKiogT2xkIHZhbHVlIG9mIHRoZSBuYXRpdmUgaW5wdXQuIFVzZWQgdG8gd29yayBhcm91bmQgaXNzdWVzIHdpdGggdGhlIGBpbnB1dGAgZXZlbnQgb24gSUUuICovXG4gIHByaXZhdGUgX3ByZXZpb3VzVmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFZhbHVlIG9mIHRoZSBpbnB1dCBlbGVtZW50IHdoZW4gdGhlIHBhbmVsIHdhcyBhdHRhY2hlZCAoZXZlbiBpZiB0aGVyZSBhcmUgbm8gb3B0aW9ucykuICovXG4gIHByaXZhdGUgX3ZhbHVlT25BdHRhY2g6IHN0cmluZyB8IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFZhbHVlIG9uIHRoZSBwcmV2aW91cyBrZXlkb3duIGV2ZW50LiAqL1xuICBwcml2YXRlIF92YWx1ZU9uTGFzdEtleWRvd246IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIFN0cmF0ZWd5IHRoYXQgaXMgdXNlZCB0byBwb3NpdGlvbiB0aGUgcGFuZWwuICovXG4gIHByaXZhdGUgX3Bvc2l0aW9uU3RyYXRlZ3k6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneTtcblxuICAvKiogV2hldGhlciBvciBub3QgdGhlIGxhYmVsIHN0YXRlIGlzIGJlaW5nIG92ZXJyaWRkZW4uICovXG4gIHByaXZhdGUgX21hbnVhbGx5RmxvYXRpbmdMYWJlbCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgc3Vic2NyaXB0aW9uIGZvciBjbG9zaW5nIGFjdGlvbnMgKHNvbWUgYXJlIGJvdW5kIHRvIGRvY3VtZW50KS4gKi9cbiAgcHJpdmF0ZSBfY2xvc2luZ0FjdGlvbnNTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAvKiogU3Vic2NyaXB0aW9uIHRvIHZpZXdwb3J0IHNpemUgY2hhbmdlcy4gKi9cbiAgcHJpdmF0ZSBfdmlld3BvcnRTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIEltcGxlbWVudHMgQnJlYWtwb2ludE9ic2VydmVyIHRvIGJlIHVzZWQgdG8gZGV0ZWN0IGhhbmRzZXQgbGFuZHNjYXBlICovXG4gIHByaXZhdGUgX2JyZWFrcG9pbnRPYnNlcnZlciA9IGluamVjdChCcmVha3BvaW50T2JzZXJ2ZXIpO1xuICBwcml2YXRlIF9oYW5kc2V0TGFuZHNjYXBlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBhdXRvY29tcGxldGUgY2FuIG9wZW4gdGhlIG5leHQgdGltZSBpdCBpcyBmb2N1c2VkLiBVc2VkIHRvIHByZXZlbnQgYSBmb2N1c2VkLFxuICAgKiBjbG9zZWQgYXV0b2NvbXBsZXRlIGZyb20gYmVpbmcgcmVvcGVuZWQgaWYgdGhlIHVzZXIgc3dpdGNoZXMgdG8gYW5vdGhlciBicm93c2VyIHRhYiBhbmQgdGhlblxuICAgKiBjb21lcyBiYWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2FuT3Blbk9uTmV4dEZvY3VzID0gdHJ1ZTtcblxuICAvKiogVmFsdWUgaW5zaWRlIHRoZSBpbnB1dCBiZWZvcmUgd2UgYXV0by1zZWxlY3RlZCBhbiBvcHRpb24uICovXG4gIHByaXZhdGUgX3ZhbHVlQmVmb3JlQXV0b1NlbGVjdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IG9wdGlvbiB0aGF0IHdlIGhhdmUgYXV0by1zZWxlY3RlZCBhcyB0aGUgdXNlciBpcyBuYXZpZ2F0aW5nLFxuICAgKiBidXQgd2hpY2ggaGFzbid0IGJlZW4gcHJvcGFnYXRlZCB0byB0aGUgbW9kZWwgdmFsdWUgeWV0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcGVuZGluZ0F1dG9zZWxlY3RlZE9wdGlvbjogTWF0T3B0aW9uIHwgbnVsbDtcblxuICAvKiogU3RyZWFtIG9mIGtleWJvYXJkIGV2ZW50cyB0aGF0IGNhbiBjbG9zZSB0aGUgcGFuZWwuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Nsb3NlS2V5RXZlbnRTdHJlYW0gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBFdmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSB3aW5kb3cgaXMgYmx1cnJlZC4gTmVlZHMgdG8gYmUgYW5cbiAgICogYXJyb3cgZnVuY3Rpb24gaW4gb3JkZXIgdG8gcHJlc2VydmUgdGhlIGNvbnRleHQuXG4gICAqL1xuICBwcml2YXRlIF93aW5kb3dCbHVySGFuZGxlciA9ICgpID0+IHtcbiAgICAvLyBJZiB0aGUgdXNlciBibHVycmVkIHRoZSB3aW5kb3cgd2hpbGUgdGhlIGF1dG9jb21wbGV0ZSBpcyBmb2N1c2VkLCBpdCBtZWFucyB0aGF0IGl0J2xsIGJlXG4gICAgLy8gcmVmb2N1c2VkIHdoZW4gdGhleSBjb21lIGJhY2suIEluIHRoaXMgY2FzZSB3ZSB3YW50IHRvIHNraXAgdGhlIGZpcnN0IGZvY3VzIGV2ZW50LCBpZiB0aGVcbiAgICAvLyBwYW5lIHdhcyBjbG9zZWQsIGluIG9yZGVyIHRvIGF2b2lkIHJlb3BlbmluZyBpdCB1bmludGVudGlvbmFsbHkuXG4gICAgdGhpcy5fY2FuT3Blbk9uTmV4dEZvY3VzID1cbiAgICAgIHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCB8fCB0aGlzLnBhbmVsT3BlbjtcbiAgfTtcblxuICAvKiogYFZpZXcgLT4gbW9kZWwgY2FsbGJhY2sgY2FsbGVkIHdoZW4gdmFsdWUgY2hhbmdlc2AgKi9cbiAgX29uQ2hhbmdlOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBgVmlldyAtPiBtb2RlbCBjYWxsYmFjayBjYWxsZWQgd2hlbiBhdXRvY29tcGxldGUgaGFzIGJlZW4gdG91Y2hlZGAgKi9cbiAgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIC8qKiBUaGUgYXV0b2NvbXBsZXRlIHBhbmVsIHRvIGJlIGF0dGFjaGVkIHRvIHRoaXMgdHJpZ2dlci4gKi9cbiAgQElucHV0KCdtYXRBdXRvY29tcGxldGUnKSBhdXRvY29tcGxldGU6IE1hdEF1dG9jb21wbGV0ZTtcblxuICAvKipcbiAgICogUG9zaXRpb24gb2YgdGhlIGF1dG9jb21wbGV0ZSBwYW5lbCByZWxhdGl2ZSB0byB0aGUgdHJpZ2dlciBlbGVtZW50LiBBIHBvc2l0aW9uIG9mIGBhdXRvYFxuICAgKiB3aWxsIHJlbmRlciB0aGUgcGFuZWwgdW5kZXJuZWF0aCB0aGUgdHJpZ2dlciBpZiB0aGVyZSBpcyBlbm91Z2ggc3BhY2UgZm9yIGl0IHRvIGZpdCBpblxuICAgKiB0aGUgdmlld3BvcnQsIG90aGVyd2lzZSB0aGUgcGFuZWwgd2lsbCBiZSBzaG93biBhYm92ZSBpdC4gSWYgdGhlIHBvc2l0aW9uIGlzIHNldCB0b1xuICAgKiBgYWJvdmVgIG9yIGBiZWxvd2AsIHRoZSBwYW5lbCB3aWxsIGFsd2F5cyBiZSBzaG93biBhYm92ZSBvciBiZWxvdyB0aGUgdHJpZ2dlci4gbm8gbWF0dGVyXG4gICAqIHdoZXRoZXIgaXQgZml0cyBjb21wbGV0ZWx5IGluIHRoZSB2aWV3cG9ydC5cbiAgICovXG4gIEBJbnB1dCgnbWF0QXV0b2NvbXBsZXRlUG9zaXRpb24nKSBwb3NpdGlvbjogJ2F1dG8nIHwgJ2Fib3ZlJyB8ICdiZWxvdycgPSAnYXV0byc7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSByZWxhdGl2ZSB0byB3aGljaCB0byBwb3NpdGlvbiB0aGUgYXV0b2NvbXBsZXRlIHBhbmVsLlxuICAgKiBEZWZhdWx0cyB0byB0aGUgYXV0b2NvbXBsZXRlIHRyaWdnZXIgZWxlbWVudC5cbiAgICovXG4gIEBJbnB1dCgnbWF0QXV0b2NvbXBsZXRlQ29ubmVjdGVkVG8nKSBjb25uZWN0ZWRUbzogTWF0QXV0b2NvbXBsZXRlT3JpZ2luO1xuXG4gIC8qKlxuICAgKiBgYXV0b2NvbXBsZXRlYCBhdHRyaWJ1dGUgdG8gYmUgc2V0IG9uIHRoZSBpbnB1dCBlbGVtZW50LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBASW5wdXQoJ2F1dG9jb21wbGV0ZScpIGF1dG9jb21wbGV0ZUF0dHJpYnV0ZTogc3RyaW5nID0gJ29mZic7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGF1dG9jb21wbGV0ZSBpcyBkaXNhYmxlZC4gV2hlbiBkaXNhYmxlZCwgdGhlIGVsZW1lbnQgd2lsbFxuICAgKiBhY3QgYXMgYSByZWd1bGFyIGlucHV0IGFuZCB0aGUgdXNlciB3b24ndCBiZSBhYmxlIHRvIG9wZW4gdGhlIHBhbmVsLlxuICAgKi9cbiAgQElucHV0KHthbGlhczogJ21hdEF1dG9jb21wbGV0ZURpc2FibGVkJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgYXV0b2NvbXBsZXRlRGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZWQgPSBuZXcgU3ViamVjdCgpO1xuXG4gIHByaXZhdGUgX2luamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwcml2YXRlIF96b25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBJbmplY3QoTUFUX0FVVE9DT01QTEVURV9TQ1JPTExfU1RSQVRFR1kpIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb25hbGl0eSB8IG51bGwsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfRk9STV9GSUVMRCkgQEhvc3QoKSBwcml2YXRlIF9mb3JtRmllbGQ6IE1hdEZvcm1GaWVsZCB8IG51bGwsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueSxcbiAgICBwcml2YXRlIF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChNQVRfQVVUT0NPTVBMRVRFX0RFRkFVTFRfT1BUSU9OUylcbiAgICBwcml2YXRlIF9kZWZhdWx0cz86IE1hdEF1dG9jb21wbGV0ZURlZmF1bHRPcHRpb25zIHwgbnVsbCxcbiAgKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBzY3JvbGxTdHJhdGVneTtcbiAgfVxuXG4gIC8qKiBDbGFzcyB0byBhcHBseSB0byB0aGUgcGFuZWwgd2hlbiBpdCdzIGFib3ZlIHRoZSBpbnB1dC4gKi9cbiAgcHJpdmF0ZSBfYWJvdmVDbGFzcyA9ICdtYXQtbWRjLWF1dG9jb21wbGV0ZS1wYW5lbC1hYm92ZSc7XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2luaXRpYWxpemVkLm5leHQoKTtcbiAgICB0aGlzLl9pbml0aWFsaXplZC5jb21wbGV0ZSgpO1xuXG4gICAgY29uc3Qgd2luZG93ID0gdGhpcy5fZ2V0V2luZG93KCk7XG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl93aW5kb3dCbHVySGFuZGxlcikpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlc1sncG9zaXRpb24nXSAmJiB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgICB0aGlzLl9zZXRTdHJhdGVneVBvc2l0aW9ucyh0aGlzLl9wb3NpdGlvblN0cmF0ZWd5KTtcblxuICAgICAgaWYgKHRoaXMucGFuZWxPcGVuKSB7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgY29uc3Qgd2luZG93ID0gdGhpcy5fZ2V0V2luZG93KCk7XG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fd2luZG93Qmx1ckhhbmRsZXIpO1xuICAgIH1cblxuICAgIHRoaXMuX2hhbmRzZXRMYW5kc2NhcGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl92aWV3cG9ydFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2NvbXBvbmVudERlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fZGVzdHJveVBhbmVsKCk7XG4gICAgdGhpcy5fY2xvc2VLZXlFdmVudFN0cmVhbS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2NsZWFyRnJvbU1vZGFsKCk7XG4gIH1cblxuICAvKiogV2hldGhlciBvciBub3QgdGhlIGF1dG9jb21wbGV0ZSBwYW5lbCBpcyBvcGVuLiAqL1xuICBnZXQgcGFuZWxPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5QXR0YWNoZWQgJiYgdGhpcy5hdXRvY29tcGxldGUuc2hvd1BhbmVsO1xuICB9XG4gIHByaXZhdGUgX292ZXJsYXlBdHRhY2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBPcGVucyB0aGUgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb24gcGFuZWwuICovXG4gIG9wZW5QYW5lbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuUGFuZWxJbnRlcm5hbCgpO1xuICB9XG5cbiAgLyoqIENsb3NlcyB0aGUgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb24gcGFuZWwuICovXG4gIGNsb3NlUGFuZWwoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXRMYWJlbCgpO1xuXG4gICAgaWYgKCF0aGlzLl9vdmVybGF5QXR0YWNoZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYW5lbE9wZW4pIHtcbiAgICAgIC8vIE9ubHkgZW1pdCBpZiB0aGUgcGFuZWwgd2FzIHZpc2libGUuXG4gICAgICAvLyBgYWZ0ZXJOZXh0UmVuZGVyYCBhbHdheXMgcnVucyBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUsIHNvIGFsbCB0aGUgc3Vic2NyaXB0aW9ucyBmcm9tXG4gICAgICAvLyBgX3N1YnNjcmliZVRvQ2xvc2luZ0FjdGlvbnMoKWAgYXJlIGFsc28gb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgICAgLy8gV2Ugc2hvdWxkIG1hbnVhbGx5IHJ1biBpbiBBbmd1bGFyIHpvbmUgdG8gdXBkYXRlIFVJIGFmdGVyIHBhbmVsIGNsb3NpbmcuXG4gICAgICB0aGlzLl96b25lLnJ1bigoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLmNsb3NlZC5lbWl0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IHJlc2V0IGlmIHRoaXMgdHJpZ2dlciBpcyB0aGUgbGF0ZXN0IG9uZSB0aGF0IG9wZW5lZCB0aGVcbiAgICAvLyBhdXRvY29tcGxldGUgc2luY2UgYW5vdGhlciBtYXkgaGF2ZSB0YWtlbiBpdCBvdmVyLlxuICAgIGlmICh0aGlzLmF1dG9jb21wbGV0ZS5fbGF0ZXN0T3BlbmluZ1RyaWdnZXIgPT09IHRoaXMpIHtcbiAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLl9pc09wZW4gPSBmYWxzZTtcbiAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLl9sYXRlc3RPcGVuaW5nVHJpZ2dlciA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fb3ZlcmxheUF0dGFjaGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcGVuZGluZ0F1dG9zZWxlY3RlZE9wdGlvbiA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZiAmJiB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICB0aGlzLl9jbG9zaW5nQWN0aW9uc1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZVBhbmVsU3RhdGUoKTtcblxuICAgIC8vIE5vdGUgdGhhdCBpbiBzb21lIGNhc2VzIHRoaXMgY2FuIGVuZCB1cCBiZWluZyBjYWxsZWQgYWZ0ZXIgdGhlIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQuXG4gICAgLy8gQWRkIGEgY2hlY2sgdG8gZW5zdXJlIHRoYXQgd2UgZG9uJ3QgdHJ5IHRvIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uIG9uIGEgZGVzdHJveWVkIHZpZXcuXG4gICAgaWYgKCF0aGlzLl9jb21wb25lbnREZXN0cm95ZWQpIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIG1hbnVhbGx5LCBiZWNhdXNlXG4gICAgICAvLyBgZnJvbUV2ZW50YCBkb2Vzbid0IHNlZW0gdG8gZG8gaXQgYXQgdGhlIHByb3BlciB0aW1lLlxuICAgICAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgdGhlIGxhYmVsIGlzIHJlc2V0IHdoZW4gdGhlXG4gICAgICAvLyB1c2VyIGNsaWNrcyBvdXRzaWRlLlxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhcmlhLW93bnMgYXR0cmlidXRlIHdoZW4gdGhlIGF1dG9jb21wbGV0ZSBpcyBubyBsb25nZXIgdmlzaWJsZS5cbiAgICBpZiAodGhpcy5fdHJhY2tlZE1vZGFsKSB7XG4gICAgICByZW1vdmVBcmlhUmVmZXJlbmNlZElkKHRoaXMuX3RyYWNrZWRNb2RhbCwgJ2FyaWEtb3ducycsIHRoaXMuYXV0b2NvbXBsZXRlLmlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcG9zaXRpb24gb2YgdGhlIGF1dG9jb21wbGV0ZSBzdWdnZXN0aW9uIHBhbmVsIHRvIGVuc3VyZSB0aGF0IGl0IGZpdHMgYWxsIG9wdGlvbnNcbiAgICogd2l0aGluIHRoZSB2aWV3cG9ydC5cbiAgICovXG4gIHVwZGF0ZVBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vdmVybGF5QXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgc3RyZWFtIG9mIGFjdGlvbnMgdGhhdCBzaG91bGQgY2xvc2UgdGhlIGF1dG9jb21wbGV0ZSBwYW5lbCwgaW5jbHVkaW5nXG4gICAqIHdoZW4gYW4gb3B0aW9uIGlzIHNlbGVjdGVkLCBvbiBibHVyLCBhbmQgd2hlbiBUQUIgaXMgcHJlc3NlZC5cbiAgICovXG4gIGdldCBwYW5lbENsb3NpbmdBY3Rpb25zKCk6IE9ic2VydmFibGU8TWF0T3B0aW9uU2VsZWN0aW9uQ2hhbmdlIHwgbnVsbD4ge1xuICAgIHJldHVybiBtZXJnZShcbiAgICAgIHRoaXMub3B0aW9uU2VsZWN0aW9ucyxcbiAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLl9rZXlNYW5hZ2VyLnRhYk91dC5waXBlKGZpbHRlcigoKSA9PiB0aGlzLl9vdmVybGF5QXR0YWNoZWQpKSxcbiAgICAgIHRoaXMuX2Nsb3NlS2V5RXZlbnRTdHJlYW0sXG4gICAgICB0aGlzLl9nZXRPdXRzaWRlQ2xpY2tTdHJlYW0oKSxcbiAgICAgIHRoaXMuX292ZXJsYXlSZWZcbiAgICAgICAgPyB0aGlzLl9vdmVybGF5UmVmLmRldGFjaG1lbnRzKCkucGlwZShmaWx0ZXIoKCkgPT4gdGhpcy5fb3ZlcmxheUF0dGFjaGVkKSlcbiAgICAgICAgOiBvYnNlcnZhYmxlT2YoKSxcbiAgICApLnBpcGUoXG4gICAgICAvLyBOb3JtYWxpemUgdGhlIG91dHB1dCBzbyB3ZSByZXR1cm4gYSBjb25zaXN0ZW50IHR5cGUuXG4gICAgICBtYXAoZXZlbnQgPT4gKGV2ZW50IGluc3RhbmNlb2YgTWF0T3B0aW9uU2VsZWN0aW9uQ2hhbmdlID8gZXZlbnQgOiBudWxsKSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBTdHJlYW0gb2YgY2hhbmdlcyB0byB0aGUgc2VsZWN0aW9uIHN0YXRlIG9mIHRoZSBhdXRvY29tcGxldGUgb3B0aW9ucy4gKi9cbiAgcmVhZG9ubHkgb3B0aW9uU2VsZWN0aW9uczogT2JzZXJ2YWJsZTxNYXRPcHRpb25TZWxlY3Rpb25DaGFuZ2U+ID0gZGVmZXIoKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmF1dG9jb21wbGV0ZSA/IHRoaXMuYXV0b2NvbXBsZXRlLm9wdGlvbnMgOiBudWxsO1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmNoYW5nZXMucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKG9wdGlvbnMpLFxuICAgICAgICBzd2l0Y2hNYXAoKCkgPT4gbWVyZ2UoLi4ub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi5vblNlbGVjdGlvbkNoYW5nZSkpKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGFueSBzdWJzY3JpYmVycyBiZWZvcmUgYG5nQWZ0ZXJWaWV3SW5pdGAsIHRoZSBgYXV0b2NvbXBsZXRlYCB3aWxsIGJlIHVuZGVmaW5lZC5cbiAgICAvLyBSZXR1cm4gYSBzdHJlYW0gdGhhdCB3ZSdsbCByZXBsYWNlIHdpdGggdGhlIHJlYWwgb25lIG9uY2UgZXZlcnl0aGluZyBpcyBpbiBwbGFjZS5cbiAgICByZXR1cm4gdGhpcy5faW5pdGlhbGl6ZWQucGlwZShzd2l0Y2hNYXAoKCkgPT4gdGhpcy5vcHRpb25TZWxlY3Rpb25zKSk7XG4gIH0pIGFzIE9ic2VydmFibGU8TWF0T3B0aW9uU2VsZWN0aW9uQ2hhbmdlPjtcblxuICAvKiogVGhlIGN1cnJlbnRseSBhY3RpdmUgb3B0aW9uLCBjb2VyY2VkIHRvIE1hdE9wdGlvbiB0eXBlLiAqL1xuICBnZXQgYWN0aXZlT3B0aW9uKCk6IE1hdE9wdGlvbiB8IG51bGwge1xuICAgIGlmICh0aGlzLmF1dG9jb21wbGV0ZSAmJiB0aGlzLmF1dG9jb21wbGV0ZS5fa2V5TWFuYWdlcikge1xuICAgICAgcmV0dXJuIHRoaXMuYXV0b2NvbXBsZXRlLl9rZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogU3RyZWFtIG9mIGNsaWNrcyBvdXRzaWRlIG9mIHRoZSBhdXRvY29tcGxldGUgcGFuZWwuICovXG4gIHByaXZhdGUgX2dldE91dHNpZGVDbGlja1N0cmVhbSgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiBtZXJnZShcbiAgICAgIGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ2NsaWNrJykgYXMgT2JzZXJ2YWJsZTxNb3VzZUV2ZW50PixcbiAgICAgIGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ2F1eGNsaWNrJykgYXMgT2JzZXJ2YWJsZTxNb3VzZUV2ZW50PixcbiAgICAgIGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ3RvdWNoZW5kJykgYXMgT2JzZXJ2YWJsZTxUb3VjaEV2ZW50PixcbiAgICApLnBpcGUoXG4gICAgICBmaWx0ZXIoZXZlbnQgPT4ge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpbiB0aGUgU2hhZG93IERPTSwgdGhlIGV2ZW50IHRhcmdldCB3aWxsIGJlIHRoZSBzaGFkb3cgcm9vdCwgc28gd2UgaGF2ZSB0b1xuICAgICAgICAvLyBmYWxsIGJhY2sgdG8gY2hlY2sgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHBhdGggb2YgdGhlIGNsaWNrIGV2ZW50LlxuICAgICAgICBjb25zdCBjbGlja1RhcmdldCA9IF9nZXRFdmVudFRhcmdldDxIVE1MRWxlbWVudD4oZXZlbnQpITtcbiAgICAgICAgY29uc3QgZm9ybUZpZWxkID0gdGhpcy5fZm9ybUZpZWxkXG4gICAgICAgICAgPyB0aGlzLl9mb3JtRmllbGQuZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbigpLm5hdGl2ZUVsZW1lbnRcbiAgICAgICAgICA6IG51bGw7XG4gICAgICAgIGNvbnN0IGN1c3RvbU9yaWdpbiA9IHRoaXMuY29ubmVjdGVkVG8gPyB0aGlzLmNvbm5lY3RlZFRvLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICB0aGlzLl9vdmVybGF5QXR0YWNoZWQgJiZcbiAgICAgICAgICBjbGlja1RhcmdldCAhPT0gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50ICYmXG4gICAgICAgICAgLy8gTm9ybWFsbHkgZm9jdXMgbW92ZXMgaW5zaWRlIGBtb3VzZWRvd25gIHNvIHRoaXMgY29uZGl0aW9uIHdpbGwgYWxtb3N0IGFsd2F5cyBiZVxuICAgICAgICAgIC8vIHRydWUuIEl0cyBtYWluIHB1cnBvc2UgaXMgdG8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZSBpbnB1dCBpcyBmb2N1c2VkIGZyb20gYW5cbiAgICAgICAgICAvLyBvdXRzaWRlIGNsaWNrIHdoaWNoIHByb3BhZ2F0ZXMgdXAgdG8gdGhlIGBib2R5YCBsaXN0ZW5lciB3aXRoaW4gdGhlIHNhbWUgc2VxdWVuY2VcbiAgICAgICAgICAvLyBhbmQgY2F1c2VzIHRoZSBwYW5lbCB0byBjbG9zZSBpbW1lZGlhdGVseSAoc2VlICMzMTA2KS5cbiAgICAgICAgICB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQgJiZcbiAgICAgICAgICAoIWZvcm1GaWVsZCB8fCAhZm9ybUZpZWxkLmNvbnRhaW5zKGNsaWNrVGFyZ2V0KSkgJiZcbiAgICAgICAgICAoIWN1c3RvbU9yaWdpbiB8fCAhY3VzdG9tT3JpZ2luLmNvbnRhaW5zKGNsaWNrVGFyZ2V0KSkgJiZcbiAgICAgICAgICAhIXRoaXMuX292ZXJsYXlSZWYgJiZcbiAgICAgICAgICAhdGhpcy5fb3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5jb250YWlucyhjbGlja1RhcmdldClcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBQcm9taXNlLnJlc29sdmUobnVsbCkudGhlbigoKSA9PiB0aGlzLl9hc3NpZ25PcHRpb25WYWx1ZSh2YWx1ZSkpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHt9KTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSkge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgY29uc3QgaGFzTW9kaWZpZXIgPSBoYXNNb2RpZmllcktleShldmVudCk7XG5cbiAgICAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IGFjdGlvbiBvbiBhbGwgZXNjYXBlIGtleSBwcmVzc2VzLiBUaGlzIGlzIGhlcmUgcHJpbWFyaWx5IHRvIGJyaW5nIElFXG4gICAgLy8gaW4gbGluZSB3aXRoIG90aGVyIGJyb3dzZXJzLiBCeSBkZWZhdWx0LCBwcmVzc2luZyBlc2NhcGUgb24gSUUgd2lsbCBjYXVzZSBpdCB0byByZXZlcnRcbiAgICAvLyB0aGUgaW5wdXQgdmFsdWUgdG8gdGhlIG9uZSB0aGF0IGl0IGhhZCBvbiBmb2N1cywgaG93ZXZlciBpdCB3b24ndCBkaXNwYXRjaCBhbnkgZXZlbnRzXG4gICAgLy8gd2hpY2ggbWVhbnMgdGhhdCB0aGUgbW9kZWwgdmFsdWUgd2lsbCBiZSBvdXQgb2Ygc3luYyB3aXRoIHRoZSB2aWV3LlxuICAgIGlmIChrZXlDb2RlID09PSBFU0NBUEUgJiYgIWhhc01vZGlmaWVyKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHRoaXMuX3ZhbHVlT25MYXN0S2V5ZG93biA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC52YWx1ZTtcblxuICAgIGlmICh0aGlzLmFjdGl2ZU9wdGlvbiAmJiBrZXlDb2RlID09PSBFTlRFUiAmJiB0aGlzLnBhbmVsT3BlbiAmJiAhaGFzTW9kaWZpZXIpIHtcbiAgICAgIHRoaXMuYWN0aXZlT3B0aW9uLl9zZWxlY3RWaWFJbnRlcmFjdGlvbigpO1xuICAgICAgdGhpcy5fcmVzZXRBY3RpdmVJdGVtKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5hdXRvY29tcGxldGUpIHtcbiAgICAgIGNvbnN0IHByZXZBY3RpdmVJdGVtID0gdGhpcy5hdXRvY29tcGxldGUuX2tleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGNvbnN0IGlzQXJyb3dLZXkgPSBrZXlDb2RlID09PSBVUF9BUlJPVyB8fCBrZXlDb2RlID09PSBET1dOX0FSUk9XO1xuXG4gICAgICBpZiAoa2V5Q29kZSA9PT0gVEFCIHx8IChpc0Fycm93S2V5ICYmICFoYXNNb2RpZmllciAmJiB0aGlzLnBhbmVsT3BlbikpIHtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGUuX2tleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJvd0tleSAmJiB0aGlzLl9jYW5PcGVuKCkpIHtcbiAgICAgICAgdGhpcy5fb3BlblBhbmVsSW50ZXJuYWwodGhpcy5fdmFsdWVPbkxhc3RLZXlkb3duKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQXJyb3dLZXkgfHwgdGhpcy5hdXRvY29tcGxldGUuX2tleU1hbmFnZXIuYWN0aXZlSXRlbSAhPT0gcHJldkFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsVG9PcHRpb24odGhpcy5hdXRvY29tcGxldGUuX2tleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4IHx8IDApO1xuXG4gICAgICAgIGlmICh0aGlzLmF1dG9jb21wbGV0ZS5hdXRvU2VsZWN0QWN0aXZlT3B0aW9uICYmIHRoaXMuYWN0aXZlT3B0aW9uKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9wZW5kaW5nQXV0b3NlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZUJlZm9yZUF1dG9TZWxlY3Rpb24gPSB0aGlzLl92YWx1ZU9uTGFzdEtleWRvd247XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fcGVuZGluZ0F1dG9zZWxlY3RlZE9wdGlvbiA9IHRoaXMuYWN0aXZlT3B0aW9uO1xuICAgICAgICAgIHRoaXMuX2Fzc2lnbk9wdGlvblZhbHVlKHRoaXMuYWN0aXZlT3B0aW9uLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVJbnB1dChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBsZXQgdmFsdWU6IG51bWJlciB8IHN0cmluZyB8IG51bGwgPSB0YXJnZXQudmFsdWU7XG5cbiAgICAvLyBCYXNlZCBvbiBgTnVtYmVyVmFsdWVBY2Nlc3NvcmAgZnJvbSBmb3Jtcy5cbiAgICBpZiAodGFyZ2V0LnR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlID09ICcnID8gbnVsbCA6IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBpbnB1dCBoYXMgYSBwbGFjZWhvbGRlciwgSUUgd2lsbCBmaXJlIHRoZSBgaW5wdXRgIGV2ZW50IG9uIHBhZ2UgbG9hZCxcbiAgICAvLyBmb2N1cyBhbmQgYmx1ciwgaW4gYWRkaXRpb24gdG8gd2hlbiB0aGUgdXNlciBhY3R1YWxseSBjaGFuZ2VkIHRoZSB2YWx1ZS4gVG9cbiAgICAvLyBmaWx0ZXIgb3V0IGFsbCBvZiB0aGUgZXh0cmEgZXZlbnRzLCB3ZSBzYXZlIHRoZSB2YWx1ZSBvbiBmb2N1cyBhbmQgYmV0d2VlblxuICAgIC8vIGBpbnB1dGAgZXZlbnRzLCBhbmQgd2UgY2hlY2sgd2hldGhlciBpdCBjaGFuZ2VkLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84ODU3NDcvXG4gICAgaWYgKHRoaXMuX3ByZXZpb3VzVmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c1ZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9wZW5kaW5nQXV0b3NlbGVjdGVkT3B0aW9uID0gbnVsbDtcblxuICAgICAgLy8gSWYgc2VsZWN0aW9uIGlzIHJlcXVpcmVkIHdlIGRvbid0IHdyaXRlIHRvIHRoZSBDVkEgd2hpbGUgdGhlIHVzZXIgaXMgdHlwaW5nLlxuICAgICAgLy8gQXQgdGhlIGVuZCBvZiB0aGUgc2VsZWN0aW9uIGVpdGhlciB0aGUgdXNlciB3aWxsIGhhdmUgcGlja2VkIHNvbWV0aGluZ1xuICAgICAgLy8gb3Igd2UnbGwgcmVzZXQgdGhlIHZhbHVlIGJhY2sgdG8gbnVsbC5cbiAgICAgIGlmICghdGhpcy5hdXRvY29tcGxldGUgfHwgIXRoaXMuYXV0b2NvbXBsZXRlLnJlcXVpcmVTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2NsZWFyUHJldmlvdXNTZWxlY3RlZE9wdGlvbihudWxsLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGFuZWxPcGVuICYmICF0aGlzLmF1dG9jb21wbGV0ZS5yZXF1aXJlU2VsZWN0aW9uKSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBkb24ndCByZXNldCB0aGlzIHdoZW4gYHJlcXVpcmVTZWxlY3Rpb25gIGlzIGVuYWJsZWQsXG4gICAgICAgIC8vIGJlY2F1c2UgdGhlIG9wdGlvbiB3aWxsIGJlIHJlc2V0IHdoZW4gdGhlIHBhbmVsIGlzIGNsb3NlZC5cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLmF1dG9jb21wbGV0ZS5vcHRpb25zPy5maW5kKG9wdGlvbiA9PiBvcHRpb24uc2VsZWN0ZWQpO1xuXG4gICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgIGNvbnN0IGRpc3BsYXkgPSB0aGlzLl9nZXREaXNwbGF5VmFsdWUoc2VsZWN0ZWRPcHRpb24udmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHZhbHVlICE9PSBkaXNwbGF5KSB7XG4gICAgICAgICAgICBzZWxlY3RlZE9wdGlvbi5kZXNlbGVjdChmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9jYW5PcGVuKCkgJiYgdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGBpbnB1dGAgZXZlbnQgZmlyZXMsIHRoZSBpbnB1dCdzIHZhbHVlIHdpbGwgaGF2ZSBhbHJlYWR5IGNoYW5nZWQuIFRoaXMgbWVhbnNcbiAgICAgICAgLy8gdGhhdCBpZiB3ZSB0YWtlIHRoZSBgdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LnZhbHVlYCBkaXJlY3RseSwgaXQnbGwgYmUgb25lIGtleXN0cm9rZVxuICAgICAgICAvLyBiZWhpbmQuIFRoaXMgY2FuIGJlIGEgcHJvYmxlbSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSB2YWx1ZSwgY2hhbmdlcyBhIGNoYXJhY3RlciB3aGlsZVxuICAgICAgICAvLyB0aGUgaW5wdXQgc3RpbGwgaGFzIGZvY3VzIGFuZCB0aGVuIGNsaWNrcyBhd2F5IChzZWUgIzI4NDMyKS4gVG8gd29yayBhcm91bmQgaXQsIHdlXG4gICAgICAgIC8vIGNhcHR1cmUgdGhlIHZhbHVlIGluIGBrZXlkb3duYCBzbyB3ZSBjYW4gdXNlIGl0IGhlcmUuXG4gICAgICAgIGNvbnN0IHZhbHVlT25BdHRhY2ggPSB0aGlzLl92YWx1ZU9uTGFzdEtleWRvd24gPz8gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGlzLl92YWx1ZU9uTGFzdEtleWRvd24gPSBudWxsO1xuICAgICAgICB0aGlzLl9vcGVuUGFuZWxJbnRlcm5hbCh2YWx1ZU9uQXR0YWNoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGFuZGxlRm9jdXMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW5PcGVuT25OZXh0Rm9jdXMpIHtcbiAgICAgIHRoaXMuX2Nhbk9wZW5Pbk5leHRGb2N1cyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9jYW5PcGVuKCkpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzVmFsdWUgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQudmFsdWU7XG4gICAgICB0aGlzLl9hdHRhY2hPdmVybGF5KHRoaXMuX3ByZXZpb3VzVmFsdWUpO1xuICAgICAgdGhpcy5fZmxvYXRMYWJlbCh0cnVlKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQ2xpY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nhbk9wZW4oKSAmJiAhdGhpcy5wYW5lbE9wZW4pIHtcbiAgICAgIHRoaXMuX29wZW5QYW5lbEludGVybmFsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluIFwiYXV0b1wiIG1vZGUsIHRoZSBsYWJlbCB3aWxsIGFuaW1hdGUgZG93biBhcyBzb29uIGFzIGZvY3VzIGlzIGxvc3QuXG4gICAqIFRoaXMgY2F1c2VzIHRoZSB2YWx1ZSB0byBqdW1wIHdoZW4gc2VsZWN0aW5nIGFuIG9wdGlvbiB3aXRoIHRoZSBtb3VzZS5cbiAgICogVGhpcyBtZXRob2QgbWFudWFsbHkgZmxvYXRzIHRoZSBsYWJlbCB1bnRpbCB0aGUgcGFuZWwgY2FuIGJlIGNsb3NlZC5cbiAgICogQHBhcmFtIHNob3VsZEFuaW1hdGUgV2hldGhlciB0aGUgbGFiZWwgc2hvdWxkIGJlIGFuaW1hdGVkIHdoZW4gaXQgaXMgZmxvYXRlZC5cbiAgICovXG4gIHByaXZhdGUgX2Zsb2F0TGFiZWwoc2hvdWxkQW5pbWF0ZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Zvcm1GaWVsZCAmJiB0aGlzLl9mb3JtRmllbGQuZmxvYXRMYWJlbCA9PT0gJ2F1dG8nKSB7XG4gICAgICBpZiAoc2hvdWxkQW5pbWF0ZSkge1xuICAgICAgICB0aGlzLl9mb3JtRmllbGQuX2FuaW1hdGVBbmRMb2NrTGFiZWwoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2Zvcm1GaWVsZC5mbG9hdExhYmVsID0gJ2Fsd2F5cyc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX21hbnVhbGx5RmxvYXRpbmdMYWJlbCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBsYWJlbCBoYXMgYmVlbiBtYW51YWxseSBlbGV2YXRlZCwgcmV0dXJuIGl0IHRvIGl0cyBub3JtYWwgc3RhdGUuICovXG4gIHByaXZhdGUgX3Jlc2V0TGFiZWwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21hbnVhbGx5RmxvYXRpbmdMYWJlbCkge1xuICAgICAgaWYgKHRoaXMuX2Zvcm1GaWVsZCkge1xuICAgICAgICB0aGlzLl9mb3JtRmllbGQuZmxvYXRMYWJlbCA9ICdhdXRvJztcbiAgICAgIH1cbiAgICAgIHRoaXMuX21hbnVhbGx5RmxvYXRpbmdMYWJlbCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBsaXN0ZW5zIHRvIGEgc3RyZWFtIG9mIHBhbmVsIGNsb3NpbmcgYWN0aW9ucyBhbmQgcmVzZXRzIHRoZVxuICAgKiBzdHJlYW0gZXZlcnkgdGltZSB0aGUgb3B0aW9uIGxpc3QgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvQ2xvc2luZ0FjdGlvbnMoKTogU3Vic2NyaXB0aW9uIHtcbiAgICBjb25zdCBpbml0aWFsUmVuZGVyID0gbmV3IE9ic2VydmFibGUoc3Vic2NyaWJlciA9PiB7XG4gICAgICBhZnRlck5leHRSZW5kZXIoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoKTtcbiAgICAgICAgfSxcbiAgICAgICAge2luamVjdG9yOiB0aGlzLl9pbmplY3Rvcn0sXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnN0IG9wdGlvbkNoYW5nZXMgPSB0aGlzLmF1dG9jb21wbGV0ZS5vcHRpb25zLmNoYW5nZXMucGlwZShcbiAgICAgIHRhcCgoKSA9PiB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LnJlYXBwbHlMYXN0UG9zaXRpb24oKSksXG4gICAgICAvLyBEZWZlciBlbWl0dGluZyB0byB0aGUgc3RyZWFtIHVudGlsIHRoZSBuZXh0IHRpY2ssIGJlY2F1c2UgY2hhbmdpbmdcbiAgICAgIC8vIGJpbmRpbmdzIGluIGhlcmUgd2lsbCBjYXVzZSBcImNoYW5nZWQgYWZ0ZXIgY2hlY2tlZFwiIGVycm9ycy5cbiAgICAgIGRlbGF5KDApLFxuICAgICk7XG5cbiAgICAvLyBXaGVuIHRoZSBvcHRpb25zIGFyZSBpbml0aWFsbHkgcmVuZGVyZWQsIGFuZCB3aGVuIHRoZSBvcHRpb24gbGlzdCBjaGFuZ2VzLi4uXG4gICAgcmV0dXJuIChcbiAgICAgIG1lcmdlKGluaXRpYWxSZW5kZXIsIG9wdGlvbkNoYW5nZXMpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBzdHJlYW0gb2YgcGFuZWxDbG9zaW5nQWN0aW9ucywgcmVwbGFjaW5nIGFueSBwcmV2aW91cyBzdHJlYW1zXG4gICAgICAgICAgLy8gdGhhdCB3ZXJlIGNyZWF0ZWQsIGFuZCBmbGF0dGVuIGl0IHNvIG91ciBzdHJlYW0gb25seSBlbWl0cyBjbG9zaW5nIGV2ZW50cy4uLlxuICAgICAgICAgIHN3aXRjaE1hcCgoKSA9PlxuICAgICAgICAgICAgdGhpcy5fem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBgYWZ0ZXJOZXh0UmVuZGVyYCBhbHdheXMgcnVucyBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUsIHRodXMgd2UgaGF2ZSB0byByZS1lbnRlclxuICAgICAgICAgICAgICAvLyB0aGUgQW5ndWxhciB6b25lLiBUaGlzIHdpbGwgbGVhZCB0byBjaGFuZ2UgZGV0ZWN0aW9uIGJlaW5nIGNhbGxlZCBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyXG4gICAgICAgICAgICAgIC8vIHpvbmUgYW5kIHRoZSBgYXV0b2NvbXBsZXRlLm9wZW5lZGAgd2lsbCBhbHNvIGVtaXQgb3V0c2lkZSBvZiB0aGUgQW5ndWxhci5cbiAgICAgICAgICAgICAgY29uc3Qgd2FzT3BlbiA9IHRoaXMucGFuZWxPcGVuO1xuICAgICAgICAgICAgICB0aGlzLl9yZXNldEFjdGl2ZUl0ZW0oKTtcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGFuZWxTdGF0ZSgpO1xuICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICAgICAgICAgICAgaWYgKHRoaXMucGFuZWxPcGVuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb3ZlcmxheVJlZiEudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICh3YXNPcGVuICE9PSB0aGlzLnBhbmVsT3Blbikge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBgcGFuZWxPcGVuYCBzdGF0ZSBjaGFuZ2VkLCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0byBlbWl0IHRoZSBgb3BlbmVkYCBvclxuICAgICAgICAgICAgICAgIC8vIGBjbG9zZWRgIGV2ZW50LCBiZWNhdXNlIHdlIG1heSBub3QgaGF2ZSBlbWl0dGVkIGl0LiBUaGlzIGNhbiBoYXBwZW5cbiAgICAgICAgICAgICAgICAvLyAtIGlmIHRoZSB1c2VycyBvcGVucyB0aGUgcGFuZWwgYW5kIHRoZXJlIGFyZSBubyBvcHRpb25zLCBidXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gICBvcHRpb25zIGNvbWUgaW4gc2xpZ2h0bHkgbGF0ZXIgb3IgYXMgYSByZXN1bHQgb2YgdGhlIHZhbHVlIGNoYW5naW5nLFxuICAgICAgICAgICAgICAgIC8vIC0gaWYgdGhlIHBhbmVsIGlzIGNsb3NlZCBhZnRlciB0aGUgdXNlciBlbnRlcmVkIGEgc3RyaW5nIHRoYXQgZGlkIG5vdCBtYXRjaCBhbnlcbiAgICAgICAgICAgICAgICAvLyAgIG9mIHRoZSBhdmFpbGFibGUgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAvLyAtIGlmIGEgdmFsaWQgc3RyaW5nIGlzIGVudGVyZWQgYWZ0ZXIgYW4gaW52YWxpZCBvbmUuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFuZWxPcGVuKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9lbWl0T3BlbmVkKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLmNsb3NlZC5lbWl0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFuZWxDbG9zaW5nQWN0aW9ucztcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICksXG4gICAgICAgICAgLy8gd2hlbiB0aGUgZmlyc3QgY2xvc2luZyBldmVudCBvY2N1cnMuLi5cbiAgICAgICAgICB0YWtlKDEpLFxuICAgICAgICApXG4gICAgICAgIC8vIHNldCB0aGUgdmFsdWUsIGNsb3NlIHRoZSBwYW5lbCwgYW5kIGNvbXBsZXRlLlxuICAgICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHRoaXMuX3NldFZhbHVlQW5kQ2xvc2UoZXZlbnQpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgdGhlIG9wZW5lZCBldmVudCBvbmNlIGl0J3Mga25vd24gdGhhdCB0aGUgcGFuZWwgd2lsbCBiZSBzaG93biBhbmQgc3RvcmVzXG4gICAqIHRoZSBzdGF0ZSBvZiB0aGUgdHJpZ2dlciByaWdodCBiZWZvcmUgdGhlIG9wZW5pbmcgc2VxdWVuY2Ugd2FzIGZpbmlzaGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZW1pdE9wZW5lZCgpIHtcbiAgICB0aGlzLmF1dG9jb21wbGV0ZS5vcGVuZWQuZW1pdCgpO1xuICB9XG5cbiAgLyoqIERlc3Ryb3lzIHRoZSBhdXRvY29tcGxldGUgc3VnZ2VzdGlvbiBwYW5lbC4gKi9cbiAgcHJpdmF0ZSBfZGVzdHJveVBhbmVsKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLmNsb3NlUGFuZWwoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdpdmVuIGEgdmFsdWUsIHJldHVybnMgdGhlIHN0cmluZyB0aGF0IHNob3VsZCBiZSBzaG93biB3aXRoaW4gdGhlIGlucHV0LiAqL1xuICBwcml2YXRlIF9nZXREaXNwbGF5VmFsdWU8VD4odmFsdWU6IFQpOiBUIHwgc3RyaW5nIHtcbiAgICBjb25zdCBhdXRvY29tcGxldGUgPSB0aGlzLmF1dG9jb21wbGV0ZTtcbiAgICByZXR1cm4gYXV0b2NvbXBsZXRlICYmIGF1dG9jb21wbGV0ZS5kaXNwbGF5V2l0aCA/IGF1dG9jb21wbGV0ZS5kaXNwbGF5V2l0aCh2YWx1ZSkgOiB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2lnbk9wdGlvblZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCB0b0Rpc3BsYXkgPSB0aGlzLl9nZXREaXNwbGF5VmFsdWUodmFsdWUpO1xuXG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NsZWFyUHJldmlvdXNTZWxlY3RlZE9wdGlvbihudWxsLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLy8gU2ltcGx5IGZhbGxpbmcgYmFjayB0byBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlIGRpc3BsYXkgdmFsdWUgaXMgZmFsc3kgZG9lcyBub3Qgd29yayBwcm9wZXJseS5cbiAgICAvLyBUaGUgZGlzcGxheSB2YWx1ZSBjYW4gYWxzbyBiZSB0aGUgbnVtYmVyIHplcm8gYW5kIHNob3VsZG4ndCBmYWxsIGJhY2sgdG8gYW4gZW1wdHkgc3RyaW5nLlxuICAgIHRoaXMuX3VwZGF0ZU5hdGl2ZUlucHV0VmFsdWUodG9EaXNwbGF5ICE9IG51bGwgPyB0b0Rpc3BsYXkgOiAnJyk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVOYXRpdmVJbnB1dFZhbHVlKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBJZiBpdCdzIHVzZWQgd2l0aGluIGEgYE1hdEZvcm1GaWVsZGAsIHdlIHNob3VsZCBzZXQgaXQgdGhyb3VnaCB0aGUgcHJvcGVydHkgc28gaXQgY2FuIGdvXG4gICAgLy8gdGhyb3VnaCBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgIGlmICh0aGlzLl9mb3JtRmllbGQpIHtcbiAgICAgIHRoaXMuX2Zvcm1GaWVsZC5fY29udHJvbC52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9wcmV2aW91c1ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY2xvc2VzIHRoZSBwYW5lbCwgYW5kIGlmIGEgdmFsdWUgaXMgc3BlY2lmaWVkLCBhbHNvIHNldHMgdGhlIGFzc29jaWF0ZWRcbiAgICogY29udHJvbCB0byB0aGF0IHZhbHVlLiBJdCB3aWxsIGFsc28gbWFyayB0aGUgY29udHJvbCBhcyBkaXJ0eSBpZiB0aGlzIGludGVyYWN0aW9uXG4gICAqIHN0ZW1tZWQgZnJvbSB0aGUgdXNlci5cbiAgICovXG4gIHByaXZhdGUgX3NldFZhbHVlQW5kQ2xvc2UoZXZlbnQ6IE1hdE9wdGlvblNlbGVjdGlvbkNoYW5nZSB8IG51bGwpOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuYXV0b2NvbXBsZXRlO1xuICAgIGNvbnN0IHRvU2VsZWN0ID0gZXZlbnQgPyBldmVudC5zb3VyY2UgOiB0aGlzLl9wZW5kaW5nQXV0b3NlbGVjdGVkT3B0aW9uO1xuXG4gICAgaWYgKHRvU2VsZWN0KSB7XG4gICAgICB0aGlzLl9jbGVhclByZXZpb3VzU2VsZWN0ZWRPcHRpb24odG9TZWxlY3QpO1xuICAgICAgdGhpcy5fYXNzaWduT3B0aW9uVmFsdWUodG9TZWxlY3QudmFsdWUpO1xuICAgICAgLy8gVE9ETyhjcmlzYmV0byk6IHRoaXMgc2hvdWxkIHdhaXQgdW50aWwgdGhlIGFuaW1hdGlvbiBpcyBkb25lLCBvdGhlcndpc2UgdGhlIHZhbHVlXG4gICAgICAvLyBnZXRzIHJlc2V0IHdoaWxlIHRoZSBwYW5lbCBpcyBzdGlsbCBhbmltYXRpbmcgd2hpY2ggbG9va3MgZ2xpdGNoeS4gSXQnbGwgbGlrZWx5IGJyZWFrXG4gICAgICAvLyBzb21lIHRlc3RzIHRvIGNoYW5nZSBpdCBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5fb25DaGFuZ2UodG9TZWxlY3QudmFsdWUpO1xuICAgICAgcGFuZWwuX2VtaXRTZWxlY3RFdmVudCh0b1NlbGVjdCk7XG4gICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcGFuZWwucmVxdWlyZVNlbGVjdGlvbiAmJlxuICAgICAgdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LnZhbHVlICE9PSB0aGlzLl92YWx1ZU9uQXR0YWNoXG4gICAgKSB7XG4gICAgICB0aGlzLl9jbGVhclByZXZpb3VzU2VsZWN0ZWRPcHRpb24obnVsbCk7XG4gICAgICB0aGlzLl9hc3NpZ25PcHRpb25WYWx1ZShudWxsKTtcbiAgICAgIC8vIFdhaXQgZm9yIHRoZSBhbmltYXRpb24gdG8gZmluaXNoIGJlZm9yZSBjbGVhcmluZyB0aGUgZm9ybSBjb250cm9sIHZhbHVlLCBvdGhlcndpc2VcbiAgICAgIC8vIHRoZSBvcHRpb25zIG1pZ2h0IGNoYW5nZSB3aGlsZSB0aGUgYW5pbWF0aW9uIGlzIHJ1bm5pbmcgd2hpY2ggbG9va3MgZ2xpdGNoeS5cbiAgICAgIGlmIChwYW5lbC5fYW5pbWF0aW9uRG9uZSkge1xuICAgICAgICBwYW5lbC5fYW5pbWF0aW9uRG9uZS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9vbkNoYW5nZShudWxsKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vbkNoYW5nZShudWxsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNsb3NlUGFuZWwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbnkgcHJldmlvdXMgc2VsZWN0ZWQgb3B0aW9uIGFuZCBlbWl0IGEgc2VsZWN0aW9uIGNoYW5nZSBldmVudCBmb3IgdGhpcyBvcHRpb25cbiAgICovXG4gIHByaXZhdGUgX2NsZWFyUHJldmlvdXNTZWxlY3RlZE9wdGlvbihza2lwOiBNYXRPcHRpb24gfCBudWxsLCBlbWl0RXZlbnQ/OiBib29sZWFuKSB7XG4gICAgLy8gTnVsbCBjaGVja3MgYXJlIG5lY2Vzc2FyeSBoZXJlLCBiZWNhdXNlIHRoZSBhdXRvY29tcGxldGVcbiAgICAvLyBvciBpdHMgb3B0aW9ucyBtYXkgbm90IGhhdmUgYmVlbiBhc3NpZ25lZCB5ZXQuXG4gICAgdGhpcy5hdXRvY29tcGxldGU/Lm9wdGlvbnM/LmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgIGlmIChvcHRpb24gIT09IHNraXAgJiYgb3B0aW9uLnNlbGVjdGVkKSB7XG4gICAgICAgIG9wdGlvbi5kZXNlbGVjdChlbWl0RXZlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3BlblBhbmVsSW50ZXJuYWwodmFsdWVPbkF0dGFjaCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC52YWx1ZSkge1xuICAgIHRoaXMuX2F0dGFjaE92ZXJsYXkodmFsdWVPbkF0dGFjaCk7XG4gICAgdGhpcy5fZmxvYXRMYWJlbCgpO1xuICAgIC8vIEFkZCBhcmlhLW93bnMgYXR0cmlidXRlIHdoZW4gdGhlIGF1dG9jb21wbGV0ZSBiZWNvbWVzIHZpc2libGUuXG4gICAgaWYgKHRoaXMuX3RyYWNrZWRNb2RhbCkge1xuICAgICAgY29uc3QgcGFuZWxJZCA9IHRoaXMuYXV0b2NvbXBsZXRlLmlkO1xuICAgICAgYWRkQXJpYVJlZmVyZW5jZWRJZCh0aGlzLl90cmFja2VkTW9kYWwsICdhcmlhLW93bnMnLCBwYW5lbElkKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRhY2hPdmVybGF5KHZhbHVlT25BdHRhY2g6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5hdXRvY29tcGxldGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGdldE1hdEF1dG9jb21wbGV0ZU1pc3NpbmdQYW5lbEVycm9yKCk7XG4gICAgfVxuXG4gICAgbGV0IG92ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmO1xuXG4gICAgaWYgKCFvdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9wb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5hdXRvY29tcGxldGUudGVtcGxhdGUsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYsIHtcbiAgICAgICAgaWQ6IHRoaXMuX2Zvcm1GaWVsZD8uZ2V0TGFiZWxJZCgpLFxuICAgICAgfSk7XG4gICAgICBvdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZygpKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSBvdmVybGF5UmVmO1xuICAgICAgdGhpcy5fdmlld3BvcnRTdWJzY3JpcHRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmNoYW5nZSgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBhbmVsT3BlbiAmJiBvdmVybGF5UmVmKSB7XG4gICAgICAgICAgb3ZlcmxheVJlZi51cGRhdGVTaXplKHt3aWR0aDogdGhpcy5fZ2V0UGFuZWxXaWR0aCgpfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBicmVha3BvaW50IGV2ZW50cyBzdHJlYW0gdG8gZGV0ZWN0IHdoZW4gc2NyZWVuIGlzIGluXG4gICAgICAvLyBoYW5kc2V0TGFuZHNjYXBlLlxuICAgICAgdGhpcy5faGFuZHNldExhbmRzY2FwZVN1YnNjcmlwdGlvbiA9IHRoaXMuX2JyZWFrcG9pbnRPYnNlcnZlclxuICAgICAgICAub2JzZXJ2ZShCcmVha3BvaW50cy5IYW5kc2V0TGFuZHNjYXBlKVxuICAgICAgICAuc3Vic2NyaWJlKHJlc3VsdCA9PiB7XG4gICAgICAgICAgY29uc3QgaXNIYW5kc2V0TGFuZHNjYXBlID0gcmVzdWx0Lm1hdGNoZXM7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgcmVzdWx0Lm1hdGNoZXMgQnJlYWtwb2ludHMuSGFuZHNldExhbmRzY2FwZS4gQXBwbHkgSGFuZHNldExhbmRzY2FwZVxuICAgICAgICAgIC8vIHNldHRpbmdzIHRvIHByZXZlbnQgb3ZlcmxheSBjdXRvZmYgaW4gdGhhdCBicmVha3BvaW50LiBGaXhlcyBiLzI4NDE0ODM3N1xuICAgICAgICAgIGlmIChpc0hhbmRzZXRMYW5kc2NhcGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICAgICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnModHJ1ZSlcbiAgICAgICAgICAgICAgLndpdGhHcm93QWZ0ZXJPcGVuKHRydWUpXG4gICAgICAgICAgICAgIC53aXRoVmlld3BvcnRNYXJnaW4oOCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICAgICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnMoZmFsc2UpXG4gICAgICAgICAgICAgIC53aXRoR3Jvd0FmdGVyT3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgLndpdGhWaWV3cG9ydE1hcmdpbigwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIHRyaWdnZXIsIHBhbmVsIHdpZHRoIGFuZCBkaXJlY3Rpb24sIGluIGNhc2UgYW55dGhpbmcgaGFzIGNoYW5nZWQuXG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LnNldE9yaWdpbih0aGlzLl9nZXRDb25uZWN0ZWRFbGVtZW50KCkpO1xuICAgICAgb3ZlcmxheVJlZi51cGRhdGVTaXplKHt3aWR0aDogdGhpcy5fZ2V0UGFuZWxXaWR0aCgpfSk7XG4gICAgfVxuXG4gICAgaWYgKG92ZXJsYXlSZWYgJiYgIW92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fcG9ydGFsKTtcbiAgICAgIHRoaXMuX3ZhbHVlT25BdHRhY2ggPSB2YWx1ZU9uQXR0YWNoO1xuICAgICAgdGhpcy5fdmFsdWVPbkxhc3RLZXlkb3duID0gbnVsbDtcbiAgICAgIHRoaXMuX2Nsb3NpbmdBY3Rpb25zU3Vic2NyaXB0aW9uID0gdGhpcy5fc3Vic2NyaWJlVG9DbG9zaW5nQWN0aW9ucygpO1xuICAgIH1cblxuICAgIGNvbnN0IHdhc09wZW4gPSB0aGlzLnBhbmVsT3BlbjtcblxuICAgIHRoaXMuYXV0b2NvbXBsZXRlLl9pc09wZW4gPSB0aGlzLl9vdmVybGF5QXR0YWNoZWQgPSB0cnVlO1xuICAgIHRoaXMuYXV0b2NvbXBsZXRlLl9sYXRlc3RPcGVuaW5nVHJpZ2dlciA9IHRoaXM7XG4gICAgdGhpcy5hdXRvY29tcGxldGUuX3NldENvbG9yKHRoaXMuX2Zvcm1GaWVsZD8uY29sb3IpO1xuICAgIHRoaXMuX3VwZGF0ZVBhbmVsU3RhdGUoKTtcbiAgICB0aGlzLl9hcHBseU1vZGFsUGFuZWxPd25lcnNoaXAoKTtcblxuICAgIC8vIFdlIG5lZWQgdG8gZG8gYW4gZXh0cmEgYHBhbmVsT3BlbmAgY2hlY2sgaW4gaGVyZSwgYmVjYXVzZSB0aGVcbiAgICAvLyBhdXRvY29tcGxldGUgd29uJ3QgYmUgc2hvd24gaWYgdGhlcmUgYXJlIG5vIG9wdGlvbnMuXG4gICAgaWYgKHRoaXMucGFuZWxPcGVuICYmIHdhc09wZW4gIT09IHRoaXMucGFuZWxPcGVuKSB7XG4gICAgICB0aGlzLl9lbWl0T3BlbmVkKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGNvbWluZyBmcm9tIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuICBwcml2YXRlIF9oYW5kbGVQYW5lbEtleWRvd24gPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAvLyBDbG9zZSB3aGVuIHByZXNzaW5nIEVTQ0FQRSBvciBBTFQgKyBVUF9BUlJPVywgYmFzZWQgb24gdGhlIGExMXkgZ3VpZGVsaW5lcy5cbiAgICAvLyBTZWU6IGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMtMS4xLyN0ZXh0Ym94LWtleWJvYXJkLWludGVyYWN0aW9uXG4gICAgaWYgKFxuICAgICAgKGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB8fFxuICAgICAgKGV2ZW50LmtleUNvZGUgPT09IFVQX0FSUk9XICYmIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnYWx0S2V5JykpXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYWQgdHlwZWQgc29tZXRoaW5nIGluIGJlZm9yZSB3ZSBhdXRvc2VsZWN0ZWQgYW4gb3B0aW9uLCBhbmQgdGhleSBkZWNpZGVkXG4gICAgICAvLyB0byBjYW5jZWwgdGhlIHNlbGVjdGlvbiwgcmVzdG9yZSB0aGUgaW5wdXQgdmFsdWUgdG8gdGhlIG9uZSB0aGV5IGhhZCB0eXBlZCBpbi5cbiAgICAgIGlmICh0aGlzLl9wZW5kaW5nQXV0b3NlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU5hdGl2ZUlucHV0VmFsdWUodGhpcy5fdmFsdWVCZWZvcmVBdXRvU2VsZWN0aW9uID8/ICcnKTtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0F1dG9zZWxlY3RlZE9wdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9jbG9zZUtleUV2ZW50U3RyZWFtLm5leHQoKTtcbiAgICAgIHRoaXMuX3Jlc2V0QWN0aXZlSXRlbSgpO1xuICAgICAgLy8gV2UgbmVlZCB0byBzdG9wIHByb3BhZ2F0aW9uLCBvdGhlcndpc2UgdGhlIGV2ZW50IHdpbGwgZXZlbnR1YWxseVxuICAgICAgLy8gcmVhY2ggdGhlIGlucHV0IGl0c2VsZiBhbmQgY2F1c2UgdGhlIG92ZXJsYXkgdG8gYmUgcmVvcGVuZWQuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKiBVcGRhdGVzIHRoZSBwYW5lbCdzIHZpc2liaWxpdHkgc3RhdGUgYW5kIGFueSB0cmlnZ2VyIHN0YXRlIHRpZWQgdG8gaWQuICovXG4gIHByaXZhdGUgX3VwZGF0ZVBhbmVsU3RhdGUoKSB7XG4gICAgdGhpcy5hdXRvY29tcGxldGUuX3NldFZpc2liaWxpdHkoKTtcblxuICAgIC8vIE5vdGUgdGhhdCBoZXJlIHdlIHN1YnNjcmliZSBhbmQgdW5zdWJzY3JpYmUgYmFzZWQgb24gdGhlIHBhbmVsJ3MgdmlzaWJsaXR5IHN0YXRlLFxuICAgIC8vIGJlY2F1c2UgdGhlIGFjdCBvZiBzdWJzY3JpYmluZyB3aWxsIHByZXZlbnQgZXZlbnRzIGZyb20gcmVhY2hpbmcgb3RoZXIgb3ZlcmxheXMgYW5kXG4gICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBibG9jayB0aGUgZXZlbnRzIGlmIHRoZXJlIGFyZSBubyBvcHRpb25zLlxuICAgIGlmICh0aGlzLnBhbmVsT3Blbikge1xuICAgICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXlSZWYhO1xuXG4gICAgICBpZiAoIXRoaXMuX2tleWRvd25TdWJzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gVXNlIHRoZSBga2V5ZG93bkV2ZW50c2AgaW4gb3JkZXIgdG8gdGFrZSBhZHZhbnRhZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIG92ZXJsYXkgZXZlbnQgdGFyZ2V0aW5nIHByb3ZpZGVkIGJ5IHRoZSBDREsgb3ZlcmxheS5cbiAgICAgICAgdGhpcy5fa2V5ZG93blN1YnNjcmlwdGlvbiA9IG92ZXJsYXlSZWYua2V5ZG93bkV2ZW50cygpLnN1YnNjcmliZSh0aGlzLl9oYW5kbGVQYW5lbEtleWRvd24pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX291dHNpZGVDbGlja1N1YnNjcmlwdGlvbikge1xuICAgICAgICAvLyBTdWJzY3JpYmUgdG8gdGhlIHBvaW50ZXIgZXZlbnRzIHN0cmVhbSBzbyB0aGF0IGl0IGRvZXNuJ3QgZ2V0IHBpY2tlZCB1cCBieSBvdGhlciBvdmVybGF5cy5cbiAgICAgICAgLy8gVE9ETyhjcmlzYmV0byk6IHdlIHNob3VsZCBzd2l0Y2ggYF9nZXRPdXRzaWRlQ2xpY2tTdHJlYW1gIGV2ZW50dWFsbHkgdG8gdXNlIHRoaXMgc3RyZWFtLFxuICAgICAgICAvLyBidXQgdGhlIGJlaHZpb3IgaXNuJ3QgZXhhY3RseSB0aGUgc2FtZSBhbmQgaXQgZW5kcyB1cCBicmVha2luZyBzb21lIGludGVybmFsIHRlc3RzLlxuICAgICAgICB0aGlzLl9vdXRzaWRlQ2xpY2tTdWJzY3JpcHRpb24gPSBvdmVybGF5UmVmLm91dHNpZGVQb2ludGVyRXZlbnRzKCkuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2tleWRvd25TdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl9vdXRzaWRlQ2xpY2tTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl9rZXlkb3duU3Vic2NyaXB0aW9uID0gdGhpcy5fb3V0c2lkZUNsaWNrU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCk6IE92ZXJsYXlDb25maWcge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb24oKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuICAgICAgd2lkdGg6IHRoaXMuX2dldFBhbmVsV2lkdGgoKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyID8/IHVuZGVmaW5lZCxcbiAgICAgIHBhbmVsQ2xhc3M6IHRoaXMuX2RlZmF1bHRzPy5vdmVybGF5UGFuZWxDbGFzcyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvbigpOiBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICAvLyBTZXQgZGVmYXVsdCBPdmVybGF5IFBvc2l0aW9uXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZ2V0Q29ubmVjdGVkRWxlbWVudCgpKVxuICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnMoZmFsc2UpXG4gICAgICAud2l0aFB1c2goZmFsc2UpO1xuXG4gICAgdGhpcy5fc2V0U3RyYXRlZ3lQb3NpdGlvbnMoc3RyYXRlZ3kpO1xuICAgIHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3kgPSBzdHJhdGVneTtcbiAgICByZXR1cm4gc3RyYXRlZ3k7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgcG9zaXRpb25zIG9uIGEgcG9zaXRpb24gc3RyYXRlZ3kgYmFzZWQgb24gdGhlIGRpcmVjdGl2ZSdzIGlucHV0IHN0YXRlLiAqL1xuICBwcml2YXRlIF9zZXRTdHJhdGVneVBvc2l0aW9ucyhwb3NpdGlvblN0cmF0ZWd5OiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgcHJvdmlkZSBob3Jpem9udGFsIGZhbGxiYWNrIHBvc2l0aW9ucywgZXZlbiB0aG91Z2ggYnkgZGVmYXVsdCB0aGUgZHJvcGRvd25cbiAgICAvLyB3aWR0aCBtYXRjaGVzIHRoZSBpbnB1dCwgYmVjYXVzZSBjb25zdW1lcnMgY2FuIG92ZXJyaWRlIHRoZSB3aWR0aC4gU2VlICMxODg1NC5cbiAgICBjb25zdCBiZWxvd1Bvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXSA9IFtcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgXTtcblxuICAgIC8vIFRoZSBvdmVybGF5IGVkZ2UgY29ubmVjdGVkIHRvIHRoZSB0cmlnZ2VyIHNob3VsZCBoYXZlIHNxdWFyZWQgY29ybmVycywgd2hpbGVcbiAgICAvLyB0aGUgb3Bwb3NpdGUgZW5kIGhhcyByb3VuZGVkIGNvcm5lcnMuIFdlIGFwcGx5IGEgQ1NTIGNsYXNzIHRvIHN3YXAgdGhlXG4gICAgLy8gYm9yZGVyLXJhZGl1cyBiYXNlZCBvbiB0aGUgb3ZlcmxheSBwb3NpdGlvbi5cbiAgICBjb25zdCBwYW5lbENsYXNzID0gdGhpcy5fYWJvdmVDbGFzcztcbiAgICBjb25zdCBhYm92ZVBvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXSA9IFtcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAnYm90dG9tJywgcGFuZWxDbGFzc30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJywgcGFuZWxDbGFzc30sXG4gICAgXTtcblxuICAgIGxldCBwb3NpdGlvbnM6IENvbm5lY3RlZFBvc2l0aW9uW107XG5cbiAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ2Fib3ZlJykge1xuICAgICAgcG9zaXRpb25zID0gYWJvdmVQb3NpdGlvbnM7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBvc2l0aW9uID09PSAnYmVsb3cnKSB7XG4gICAgICBwb3NpdGlvbnMgPSBiZWxvd1Bvc2l0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb25zID0gWy4uLmJlbG93UG9zaXRpb25zLCAuLi5hYm92ZVBvc2l0aW9uc107XG4gICAgfVxuXG4gICAgcG9zaXRpb25TdHJhdGVneS53aXRoUG9zaXRpb25zKHBvc2l0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDb25uZWN0ZWRFbGVtZW50KCk6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHtcbiAgICBpZiAodGhpcy5jb25uZWN0ZWRUbykge1xuICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdGVkVG8uZWxlbWVudFJlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkID8gdGhpcy5fZm9ybUZpZWxkLmdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKSA6IHRoaXMuX2VsZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYW5lbFdpZHRoKCk6IG51bWJlciB8IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYXV0b2NvbXBsZXRlLnBhbmVsV2lkdGggfHwgdGhpcy5fZ2V0SG9zdFdpZHRoKCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIGlucHV0IGVsZW1lbnQsIHNvIHRoZSBwYW5lbCB3aWR0aCBjYW4gbWF0Y2ggaXQuICovXG4gIHByaXZhdGUgX2dldEhvc3RXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9nZXRDb25uZWN0ZWRFbGVtZW50KCkubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgYWN0aXZlIGl0ZW0gdG8gLTEuIFRoaXMgaXMgc28gdGhhdCBwcmVzc2luZyBhcnJvdyBrZXlzIHdpbGwgYWN0aXZhdGUgdGhlIGNvcnJlY3RcbiAgICogb3B0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgY29uc3VtZXIgb3B0ZWQtaW4gdG8gYXV0b21hdGljYWxseSBhY3RpdmF0YXRpbmcgdGhlIGZpcnN0IG9wdGlvbiwgYWN0aXZhdGUgdGhlIGZpcnN0XG4gICAqICplbmFibGVkKiBvcHRpb24uXG4gICAqL1xuICBwcml2YXRlIF9yZXNldEFjdGl2ZUl0ZW0oKTogdm9pZCB7XG4gICAgY29uc3QgYXV0b2NvbXBsZXRlID0gdGhpcy5hdXRvY29tcGxldGU7XG5cbiAgICBpZiAoYXV0b2NvbXBsZXRlLmF1dG9BY3RpdmVGaXJzdE9wdGlvbikge1xuICAgICAgLy8gRmluZCB0aGUgaW5kZXggb2YgdGhlIGZpcnN0ICplbmFibGVkKiBvcHRpb24uIEF2b2lkIGNhbGxpbmcgYF9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW1gXG4gICAgICAvLyBiZWNhdXNlIGl0IGFjdGl2YXRlcyB0aGUgZmlyc3Qgb3B0aW9uIHRoYXQgcGFzc2VzIHRoZSBza2lwIHByZWRpY2F0ZSwgcmF0aGVyIHRoYW4gdGhlXG4gICAgICAvLyBmaXJzdCAqZW5hYmxlZCogb3B0aW9uLlxuICAgICAgbGV0IGZpcnN0RW5hYmxlZE9wdGlvbkluZGV4ID0gLTE7XG5cbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhdXRvY29tcGxldGUub3B0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gYXV0b2NvbXBsZXRlLm9wdGlvbnMuZ2V0KGluZGV4KSE7XG4gICAgICAgIGlmICghb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICAgICAgZmlyc3RFbmFibGVkT3B0aW9uSW5kZXggPSBpbmRleDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXV0b2NvbXBsZXRlLl9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oZmlyc3RFbmFibGVkT3B0aW9uSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhdXRvY29tcGxldGUuX2tleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSgtMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERldGVybWluZXMgd2hldGhlciB0aGUgcGFuZWwgY2FuIGJlIG9wZW5lZC4gKi9cbiAgcHJpdmF0ZSBfY2FuT3BlbigpOiBib29sZWFuIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIHJldHVybiAhZWxlbWVudC5yZWFkT25seSAmJiAhZWxlbWVudC5kaXNhYmxlZCAmJiAhdGhpcy5hdXRvY29tcGxldGVEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBVc2UgZGVmYXVsdFZpZXcgb2YgaW5qZWN0ZWQgZG9jdW1lbnQgaWYgYXZhaWxhYmxlIG9yIGZhbGxiYWNrIHRvIGdsb2JhbCB3aW5kb3cgcmVmZXJlbmNlICovXG4gIHByaXZhdGUgX2dldFdpbmRvdygpOiBXaW5kb3cge1xuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudD8uZGVmYXVsdFZpZXcgfHwgd2luZG93O1xuICB9XG5cbiAgLyoqIFNjcm9sbHMgdG8gYSBwYXJ0aWN1bGFyIG9wdGlvbiBpbiB0aGUgbGlzdC4gKi9cbiAgcHJpdmF0ZSBfc2Nyb2xsVG9PcHRpb24oaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEdpdmVuIHRoYXQgd2UgYXJlIG5vdCBhY3R1YWxseSBmb2N1c2luZyBhY3RpdmUgb3B0aW9ucywgd2UgbXVzdCBtYW51YWxseSBhZGp1c3Qgc2Nyb2xsXG4gICAgLy8gdG8gcmV2ZWFsIG9wdGlvbnMgYmVsb3cgdGhlIGZvbGQuIEZpcnN0LCB3ZSBmaW5kIHRoZSBvZmZzZXQgb2YgdGhlIG9wdGlvbiBmcm9tIHRoZSB0b3BcbiAgICAvLyBvZiB0aGUgcGFuZWwuIElmIHRoYXQgb2Zmc2V0IGlzIGJlbG93IHRoZSBmb2xkLCB0aGUgbmV3IHNjcm9sbFRvcCB3aWxsIGJlIHRoZSBvZmZzZXQgLVxuICAgIC8vIHRoZSBwYW5lbCBoZWlnaHQgKyB0aGUgb3B0aW9uIGhlaWdodCwgc28gdGhlIGFjdGl2ZSBvcHRpb24gd2lsbCBiZSBqdXN0IHZpc2libGUgYXQgdGhlXG4gICAgLy8gYm90dG9tIG9mIHRoZSBwYW5lbC4gSWYgdGhhdCBvZmZzZXQgaXMgYWJvdmUgdGhlIHRvcCBvZiB0aGUgdmlzaWJsZSBwYW5lbCwgdGhlIG5ldyBzY3JvbGxUb3BcbiAgICAvLyB3aWxsIGJlY29tZSB0aGUgb2Zmc2V0LiBJZiB0aGF0IG9mZnNldCBpcyB2aXNpYmxlIHdpdGhpbiB0aGUgcGFuZWwgYWxyZWFkeSwgdGhlIHNjcm9sbFRvcCBpc1xuICAgIC8vIG5vdCBhZGp1c3RlZC5cbiAgICBjb25zdCBhdXRvY29tcGxldGUgPSB0aGlzLmF1dG9jb21wbGV0ZTtcbiAgICBjb25zdCBsYWJlbENvdW50ID0gX2NvdW50R3JvdXBMYWJlbHNCZWZvcmVPcHRpb24oXG4gICAgICBpbmRleCxcbiAgICAgIGF1dG9jb21wbGV0ZS5vcHRpb25zLFxuICAgICAgYXV0b2NvbXBsZXRlLm9wdGlvbkdyb3VwcyxcbiAgICApO1xuXG4gICAgaWYgKGluZGV4ID09PSAwICYmIGxhYmVsQ291bnQgPT09IDEpIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGdvdCBvbmUgZ3JvdXAgbGFiZWwgYmVmb3JlIHRoZSBvcHRpb24gYW5kIHdlJ3JlIGF0IHRoZSB0b3Agb3B0aW9uLFxuICAgICAgLy8gc2Nyb2xsIHRoZSBsaXN0IHRvIHRoZSB0b3AuIFRoaXMgaXMgYmV0dGVyIFVYIHRoYW4gc2Nyb2xsaW5nIHRoZSBsaXN0IHRvIHRoZVxuICAgICAgLy8gdG9wIG9mIHRoZSBvcHRpb24sIGJlY2F1c2UgaXQgYWxsb3dzIHRoZSB1c2VyIHRvIHJlYWQgdGhlIHRvcCBncm91cCdzIGxhYmVsLlxuICAgICAgYXV0b2NvbXBsZXRlLl9zZXRTY3JvbGxUb3AoMCk7XG4gICAgfSBlbHNlIGlmIChhdXRvY29tcGxldGUucGFuZWwpIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGF1dG9jb21wbGV0ZS5vcHRpb25zLnRvQXJyYXkoKVtpbmRleF07XG5cbiAgICAgIGlmIChvcHRpb24pIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IG9wdGlvbi5fZ2V0SG9zdEVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgbmV3U2Nyb2xsUG9zaXRpb24gPSBfZ2V0T3B0aW9uU2Nyb2xsUG9zaXRpb24oXG4gICAgICAgICAgZWxlbWVudC5vZmZzZXRUb3AsXG4gICAgICAgICAgZWxlbWVudC5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgYXV0b2NvbXBsZXRlLl9nZXRTY3JvbGxUb3AoKSxcbiAgICAgICAgICBhdXRvY29tcGxldGUucGFuZWwubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQsXG4gICAgICAgICk7XG5cbiAgICAgICAgYXV0b2NvbXBsZXRlLl9zZXRTY3JvbGxUb3AobmV3U2Nyb2xsUG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFjayB3aGljaCBtb2RhbCB3ZSBoYXZlIG1vZGlmaWVkIHRoZSBgYXJpYS1vd25zYCBhdHRyaWJ1dGUgb2YuIFdoZW4gdGhlIGNvbWJvYm94IHRyaWdnZXIgaXNcbiAgICogaW5zaWRlIGFuIGFyaWEtbW9kYWwsIHdlIGFwcGx5IGFyaWEtb3ducyB0byB0aGUgcGFyZW50IG1vZGFsIHdpdGggdGhlIGBpZGAgb2YgdGhlIG9wdGlvbnNcbiAgICogcGFuZWwuIFRyYWNrIHRoZSBtb2RhbCB3ZSBoYXZlIGNoYW5nZWQgc28gd2UgY2FuIHVuZG8gdGhlIGNoYW5nZXMgb24gZGVzdHJveS5cbiAgICovXG4gIHByaXZhdGUgX3RyYWNrZWRNb2RhbDogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJZiB0aGUgYXV0b2NvbXBsZXRlIHRyaWdnZXIgaXMgaW5zaWRlIG9mIGFuIGBhcmlhLW1vZGFsYCBlbGVtZW50LCBjb25uZWN0XG4gICAqIHRoYXQgbW9kYWwgdG8gdGhlIG9wdGlvbnMgcGFuZWwgd2l0aCBgYXJpYS1vd25zYC5cbiAgICpcbiAgICogRm9yIHNvbWUgYnJvd3NlciArIHNjcmVlbiByZWFkZXIgY29tYmluYXRpb25zLCB3aGVuIG5hdmlnYXRpb24gaXMgaW5zaWRlXG4gICAqIG9mIGFuIGBhcmlhLW1vZGFsYCBlbGVtZW50LCB0aGUgc2NyZWVuIHJlYWRlciB0cmVhdHMgZXZlcnl0aGluZyBvdXRzaWRlXG4gICAqIG9mIHRoYXQgbW9kYWwgYXMgaGlkZGVuIG9yIGludmlzaWJsZS5cbiAgICpcbiAgICogVGhpcyBjYXVzZXMgYSBwcm9ibGVtIHdoZW4gdGhlIGNvbWJvYm94IHRyaWdnZXIgaXMgX2luc2lkZV8gb2YgYSBtb2RhbCwgYmVjYXVzZSB0aGVcbiAgICogb3B0aW9ucyBwYW5lbCBpcyByZW5kZXJlZCBfb3V0c2lkZV8gb2YgdGhhdCBtb2RhbCwgcHJldmVudGluZyBzY3JlZW4gcmVhZGVyIG5hdmlnYXRpb25cbiAgICogZnJvbSByZWFjaGluZyB0aGUgcGFuZWwuXG4gICAqXG4gICAqIFdlIGNhbiB3b3JrIGFyb3VuZCB0aGlzIGlzc3VlIGJ5IGFwcGx5aW5nIGBhcmlhLW93bnNgIHRvIHRoZSBtb2RhbCB3aXRoIHRoZSBgaWRgIG9mXG4gICAqIHRoZSBvcHRpb25zIHBhbmVsLiBUaGlzIGVmZmVjdGl2ZWx5IGNvbW11bmljYXRlcyB0byBhc3Npc3RpdmUgdGVjaG5vbG9neSB0aGF0IHRoZVxuICAgKiBvcHRpb25zIHBhbmVsIGlzIHBhcnQgb2YgdGhlIHNhbWUgaW50ZXJhY3Rpb24gYXMgdGhlIG1vZGFsLlxuICAgKlxuICAgKiBBdCB0aW1lIG9mIHRoaXMgd3JpdGluZywgdGhpcyBpc3N1ZSBpcyBwcmVzZW50IGluIFZvaWNlT3Zlci5cbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzIwNjk0XG4gICAqL1xuICBwcml2YXRlIF9hcHBseU1vZGFsUGFuZWxPd25lcnNoaXAoKSB7XG4gICAgLy8gVE9ETyhodHRwOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzI2ODUzKTogY29uc2lkZXIgZGUtZHVwbGljYXRpbmcgdGhpcyB3aXRoXG4gICAgLy8gdGhlIGBMaXZlQW5ub3VuY2VyYCBhbmQgYW55IG90aGVyIHVzYWdlcy5cbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCB0aGUgc2VsZWN0b3IgaGVyZSBpcyBsaW1pdGVkIHRvIENESyBvdmVybGF5cyBhdCB0aGUgbW9tZW50IGluIG9yZGVyIHRvIHJlZHVjZSB0aGVcbiAgICAvLyBzZWN0aW9uIG9mIHRoZSBET00gd2UgbmVlZCB0byBsb29rIHRocm91Z2guIFRoaXMgc2hvdWxkIGNvdmVyIGFsbCB0aGUgY2FzZXMgd2Ugc3VwcG9ydCwgYnV0XG4gICAgLy8gdGhlIHNlbGVjdG9yIGNhbiBiZSBleHBhbmRlZCBpZiBpdCB0dXJucyBvdXQgdG8gYmUgdG9vIG5hcnJvdy5cbiAgICBjb25zdCBtb2RhbCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC5jbG9zZXN0KFxuICAgICAgJ2JvZHkgPiAuY2RrLW92ZXJsYXktY29udGFpbmVyIFthcmlhLW1vZGFsPVwidHJ1ZVwiXScsXG4gICAgKTtcblxuICAgIGlmICghbW9kYWwpIHtcbiAgICAgIC8vIE1vc3QgY29tbW9ubHksIHRoZSBhdXRvY29tcGxldGUgdHJpZ2dlciBpcyBub3QgaW5zaWRlIGEgbW9kYWwuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFuZWxJZCA9IHRoaXMuYXV0b2NvbXBsZXRlLmlkO1xuXG4gICAgaWYgKHRoaXMuX3RyYWNrZWRNb2RhbCkge1xuICAgICAgcmVtb3ZlQXJpYVJlZmVyZW5jZWRJZCh0aGlzLl90cmFja2VkTW9kYWwsICdhcmlhLW93bnMnLCBwYW5lbElkKTtcbiAgICB9XG5cbiAgICBhZGRBcmlhUmVmZXJlbmNlZElkKG1vZGFsLCAnYXJpYS1vd25zJywgcGFuZWxJZCk7XG4gICAgdGhpcy5fdHJhY2tlZE1vZGFsID0gbW9kYWw7XG4gIH1cblxuICAvKiogQ2xlYXJzIHRoZSByZWZlcmVuY2VzIHRvIHRoZSBsaXN0Ym94IG92ZXJsYXkgZWxlbWVudCBmcm9tIHRoZSBtb2RhbCBpdCB3YXMgYWRkZWQgdG8uICovXG4gIHByaXZhdGUgX2NsZWFyRnJvbU1vZGFsKCkge1xuICAgIGlmICh0aGlzLl90cmFja2VkTW9kYWwpIHtcbiAgICAgIGNvbnN0IHBhbmVsSWQgPSB0aGlzLmF1dG9jb21wbGV0ZS5pZDtcblxuICAgICAgcmVtb3ZlQXJpYVJlZmVyZW5jZWRJZCh0aGlzLl90cmFja2VkTW9kYWwsICdhcmlhLW93bnMnLCBwYW5lbElkKTtcbiAgICAgIHRoaXMuX3RyYWNrZWRNb2RhbCA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=