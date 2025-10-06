/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, Input, Optional, QueryList, ViewEncapsulation, booleanAttribute, numberAttribute, } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MatChip } from './chip';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
/**
 * Basic container component for the MatChip component.
 *
 * Extended by MatChipListbox and MatChipGrid for different interaction patterns.
 */
export class MatChipSet {
    /** Combined stream of all of the child chips' focus events. */
    get chipFocusChanges() {
        return this._getChipStream(chip => chip._onFocus);
    }
    /** Combined stream of all of the child chips' destroy events. */
    get chipDestroyedChanges() {
        return this._getChipStream(chip => chip.destroyed);
    }
    /** Combined stream of all of the child chips' remove events. */
    get chipRemovedChanges() {
        return this._getChipStream(chip => chip.removed);
    }
    /** Whether the chip set is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._syncChipsState();
    }
    /** Whether the chip list contains chips or not. */
    get empty() {
        return !this._chips || this._chips.length === 0;
    }
    /** The ARIA role applied to the chip set. */
    get role() {
        if (this._explicitRole) {
            return this._explicitRole;
        }
        return this.empty ? null : this._defaultRole;
    }
    set role(value) {
        this._explicitRole = value;
    }
    /** Whether any of the chips inside of this chip-set has focus. */
    get focused() {
        return this._hasFocusedChip();
    }
    constructor(_elementRef, _changeDetectorRef, _dir) {
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._dir = _dir;
        /** Index of the last destroyed chip that had focus. */
        this._lastDestroyedFocusedChipIndex = null;
        /** Subject that emits when the component has been destroyed. */
        this._destroyed = new Subject();
        /** Role to use if it hasn't been overwritten by the user. */
        this._defaultRole = 'presentation';
        this._disabled = false;
        /** Tabindex of the chip set. */
        this.tabIndex = 0;
        this._explicitRole = null;
        /** Flat list of all the actions contained within the chips. */
        this._chipActions = new QueryList();
    }
    ngAfterViewInit() {
        this._setUpFocusManagement();
        this._trackChipSetChanges();
        this._trackDestroyedFocusedChip();
    }
    ngOnDestroy() {
        this._keyManager?.destroy();
        this._chipActions.destroy();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Checks whether any of the chips is focused. */
    _hasFocusedChip() {
        return this._chips && this._chips.some(chip => chip._hasFocus());
    }
    /** Syncs the chip-set's state with the individual chips. */
    _syncChipsState() {
        this._chips?.forEach(chip => {
            chip._chipListDisabled = this._disabled;
            chip._changeDetectorRef.markForCheck();
        });
    }
    /** Dummy method for subclasses to override. Base chip set cannot be focused. */
    focus() { }
    /** Handles keyboard events on the chip set. */
    _handleKeydown(event) {
        if (this._originatesFromChip(event)) {
            this._keyManager.onKeydown(event);
        }
    }
    /**
     * Utility to ensure all indexes are valid.
     *
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of chips.
     */
    _isValidIndex(index) {
        return index >= 0 && index < this._chips.length;
    }
    /**
     * Removes the `tabindex` from the chip set and resets it back afterwards, allowing the
     * user to tab out of it. This prevents the set from capturing focus and redirecting
     * it back to the first chip, creating a focus trap, if it user tries to tab away.
     */
    _allowFocusEscape() {
        const previous = this._elementRef.nativeElement.tabIndex;
        if (previous !== -1) {
            // Set the tabindex directly on the element, instead of going through
            // the data binding, because we aren't guaranteed that change detection
            // will run quickly enough to allow focus to escape.
            this._elementRef.nativeElement.tabIndex = -1;
            // Note that this needs to be a `setTimeout`, because a `Promise.resolve`
            // doesn't allow enough time for the focus to escape.
            setTimeout(() => (this._elementRef.nativeElement.tabIndex = previous));
        }
    }
    /**
     * Gets a stream of events from all the chips within the set.
     * The stream will automatically incorporate any newly-added chips.
     */
    _getChipStream(mappingFunction) {
        return this._chips.changes.pipe(startWith(null), switchMap(() => merge(...this._chips.map(mappingFunction))));
    }
    /** Checks whether an event comes from inside a chip element. */
    _originatesFromChip(event) {
        let currentElement = event.target;
        while (currentElement && currentElement !== this._elementRef.nativeElement) {
            if (currentElement.classList.contains('mat-mdc-chip')) {
                return true;
            }
            currentElement = currentElement.parentElement;
        }
        return false;
    }
    /** Sets up the chip set's focus management logic. */
    _setUpFocusManagement() {
        // Create a flat `QueryList` containing the actions of all of the chips.
        // This allows us to navigate both within the chip and move to the next/previous
        // one using the existing `ListKeyManager`.
        this._chips.changes.pipe(startWith(this._chips)).subscribe((chips) => {
            const actions = [];
            chips.forEach(chip => chip._getActions().forEach(action => actions.push(action)));
            this._chipActions.reset(actions);
            this._chipActions.notifyOnChanges();
        });
        this._keyManager = new FocusKeyManager(this._chipActions)
            .withVerticalOrientation()
            .withHorizontalOrientation(this._dir ? this._dir.value : 'ltr')
            .withHomeAndEnd()
            .skipPredicate(action => this._skipPredicate(action));
        // Keep the manager active index in sync so that navigation picks
        // up from the current chip if the user clicks into the list directly.
        this.chipFocusChanges.pipe(takeUntil(this._destroyed)).subscribe(({ chip }) => {
            const action = chip._getSourceAction(document.activeElement);
            if (action) {
                this._keyManager.updateActiveItem(action);
            }
        });
        this._dir?.change
            .pipe(takeUntil(this._destroyed))
            .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));
    }
    /**
     * Determines if key manager should avoid putting a given chip action in the tab index. Skip
     * non-interactive and disabled actions since the user can't do anything with them.
     */
    _skipPredicate(action) {
        // Skip chips that the user cannot interact with. `mat-chip-set` does not permit focusing disabled
        // chips.
        return !action.isInteractive || action.disabled;
    }
    /** Listens to changes in the chip set and syncs up the state of the individual chips. */
    _trackChipSetChanges() {
        this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
            if (this.disabled) {
                // Since this happens after the content has been
                // checked, we need to defer it to the next tick.
                Promise.resolve().then(() => this._syncChipsState());
            }
            this._redirectDestroyedChipFocus();
        });
    }
    /** Starts tracking the destroyed chips in order to capture the focused one. */
    _trackDestroyedFocusedChip() {
        this.chipDestroyedChanges.pipe(takeUntil(this._destroyed)).subscribe((event) => {
            const chipArray = this._chips.toArray();
            const chipIndex = chipArray.indexOf(event.chip);
            // If the focused chip is destroyed, save its index so that we can move focus to the next
            // chip. We only save the index here, rather than move the focus immediately, because we want
            // to wait until the chip is removed from the chip list before focusing the next one. This
            // allows us to keep focus on the same index if the chip gets swapped out.
            if (this._isValidIndex(chipIndex) && event.chip._hasFocus()) {
                this._lastDestroyedFocusedChipIndex = chipIndex;
            }
        });
    }
    /**
     * Finds the next appropriate chip to move focus to,
     * if the currently-focused chip is destroyed.
     */
    _redirectDestroyedChipFocus() {
        if (this._lastDestroyedFocusedChipIndex == null) {
            return;
        }
        if (this._chips.length) {
            const newIndex = Math.min(this._lastDestroyedFocusedChipIndex, this._chips.length - 1);
            const chipToFocus = this._chips.toArray()[newIndex];
            if (chipToFocus.disabled) {
                // If we're down to one disabled chip, move focus back to the set.
                if (this._chips.length === 1) {
                    this.focus();
                }
                else {
                    this._keyManager.setPreviousItemActive();
                }
            }
            else {
                chipToFocus.focus();
            }
        }
        else {
            this.focus();
        }
        this._lastDestroyedFocusedChipIndex = null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipSet, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatChipSet, isStandalone: true, selector: "mat-chip-set", inputs: { disabled: ["disabled", "disabled", booleanAttribute], role: "role", tabIndex: ["tabIndex", "tabIndex", (value) => (value == null ? 0 : numberAttribute(value))] }, host: { listeners: { "keydown": "_handleKeydown($event)" }, properties: { "attr.role": "role" }, classAttribute: "mat-mdc-chip-set mdc-evolution-chip-set" }, queries: [{ propertyName: "_chips", predicate: MatChip, descendants: true }], ngImport: i0, template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [".mat-mdc-chip-set{display:flex}.mat-mdc-chip-set:focus{outline:none}.mat-mdc-chip-set .mdc-evolution-chip-set__chips{min-width:100%;margin-left:-8px;margin-right:0}.mat-mdc-chip-set .mdc-evolution-chip{margin:4px 0 4px 8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips{margin-left:0;margin-right:-8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip{margin-left:0;margin-right:8px}.mdc-evolution-chip-set__chips{display:flex;flex-flow:wrap;min-width:0}.mat-mdc-chip-set-stacked{flex-direction:column;align-items:flex-start}.mat-mdc-chip-set-stacked .mat-mdc-chip{width:100%}.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic{flex-grow:0}.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary{flex-basis:100%;justify-content:start}input.mat-mdc-chip-input{flex:1 0 150px;margin-left:8px}[dir=rtl] input.mat-mdc-chip-input{margin-left:0;margin-right:8px}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipSet, decorators: [{
            type: Component,
            args: [{ selector: 'mat-chip-set', template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `, host: {
                        'class': 'mat-mdc-chip-set mdc-evolution-chip-set',
                        '(keydown)': '_handleKeydown($event)',
                        '[attr.role]': 'role',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, styles: [".mat-mdc-chip-set{display:flex}.mat-mdc-chip-set:focus{outline:none}.mat-mdc-chip-set .mdc-evolution-chip-set__chips{min-width:100%;margin-left:-8px;margin-right:0}.mat-mdc-chip-set .mdc-evolution-chip{margin:4px 0 4px 8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip-set__chips{margin-left:0;margin-right:-8px}[dir=rtl] .mat-mdc-chip-set .mdc-evolution-chip{margin-left:0;margin-right:8px}.mdc-evolution-chip-set__chips{display:flex;flex-flow:wrap;min-width:0}.mat-mdc-chip-set-stacked{flex-direction:column;align-items:flex-start}.mat-mdc-chip-set-stacked .mat-mdc-chip{width:100%}.mat-mdc-chip-set-stacked .mdc-evolution-chip__graphic{flex-grow:0}.mat-mdc-chip-set-stacked .mdc-evolution-chip__action--primary{flex-basis:100%;justify-content:start}input.mat-mdc-chip-input{flex:1 0 150px;margin-left:8px}[dir=rtl] input.mat-mdc-chip-input{margin-left:0;margin-right:8px}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], role: [{
                type: Input
            }], tabIndex: [{
                type: Input,
                args: [{
                        transform: (value) => (value == null ? 0 : numberAttribute(value)),
                    }]
            }], _chips: [{
                type: ContentChildren,
                args: [MatChip, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true,
                    }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1zZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2hpcHMvY2hpcC1zZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsZUFBZSxFQUNmLFVBQVUsRUFDVixLQUFLLEVBRUwsUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFhLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDaEQsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0QsT0FBTyxFQUFDLE9BQU8sRUFBZSxNQUFNLFFBQVEsQ0FBQzs7O0FBRzdDOzs7O0dBSUc7QUFrQkgsTUFBTSxPQUFPLFVBQVU7SUFhckIsK0RBQStEO0lBQy9ELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsaUVBQWlFO0lBQ2pFLElBQUksb0JBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLElBQUksa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElB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QyxJQUFJO3NCQURQLEtBQUs7Z0JBYU4sUUFBUTtzQkFIUCxLQUFLO3VCQUFDO3dCQUNMLFNBQVMsRUFBRSxDQUFDLEtBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDNUU7Z0JBbUJELE1BQU07c0JBTEwsZUFBZTt1QkFBQyxPQUFPLEVBQUU7d0JBQ3hCLHVFQUF1RTt3QkFDdkUsOENBQThDO3dCQUM5QyxXQUFXLEVBQUUsSUFBSTtxQkFDbEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBRdWVyeUxpc3QsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBudW1iZXJBdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0LCBtZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TWF0Q2hpcCwgTWF0Q2hpcEV2ZW50fSBmcm9tICcuL2NoaXAnO1xuaW1wb3J0IHtNYXRDaGlwQWN0aW9ufSBmcm9tICcuL2NoaXAtYWN0aW9uJztcblxuLyoqXG4gKiBCYXNpYyBjb250YWluZXIgY29tcG9uZW50IGZvciB0aGUgTWF0Q2hpcCBjb21wb25lbnQuXG4gKlxuICogRXh0ZW5kZWQgYnkgTWF0Q2hpcExpc3Rib3ggYW5kIE1hdENoaXBHcmlkIGZvciBkaWZmZXJlbnQgaW50ZXJhY3Rpb24gcGF0dGVybnMuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1jaGlwLXNldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cIm1kYy1ldm9sdXRpb24tY2hpcC1zZXRfX2NoaXBzXCIgcm9sZT1cInByZXNlbnRhdGlvblwiPlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDwvZGl2PlxuICBgLFxuICBzdHlsZVVybDogJ2NoaXAtc2V0LmNzcycsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1jaGlwLXNldCBtZGMtZXZvbHV0aW9uLWNoaXAtc2V0JyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlkb3duKCRldmVudCknLFxuICAgICdbYXR0ci5yb2xlXSc6ICdyb2xlJyxcbiAgfSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENoaXBTZXQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKiogSW5kZXggb2YgdGhlIGxhc3QgZGVzdHJveWVkIGNoaXAgdGhhdCBoYWQgZm9jdXMuICovXG4gIHByaXZhdGUgX2xhc3REZXN0cm95ZWRGb2N1c2VkQ2hpcEluZGV4OiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKiogVXNlZCB0byBtYW5hZ2UgZm9jdXMgd2l0aGluIHRoZSBjaGlwIGxpc3QuICovXG4gIHByb3RlY3RlZCBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPE1hdENoaXBBY3Rpb24+O1xuXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBSb2xlIHRvIHVzZSBpZiBpdCBoYXNuJ3QgYmVlbiBvdmVyd3JpdHRlbiBieSB0aGUgdXNlci4gKi9cbiAgcHJvdGVjdGVkIF9kZWZhdWx0Um9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gIC8qKiBDb21iaW5lZCBzdHJlYW0gb2YgYWxsIG9mIHRoZSBjaGlsZCBjaGlwcycgZm9jdXMgZXZlbnRzLiAqL1xuICBnZXQgY2hpcEZvY3VzQ2hhbmdlcygpOiBPYnNlcnZhYmxlPE1hdENoaXBFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRDaGlwU3RyZWFtKGNoaXAgPT4gY2hpcC5fb25Gb2N1cyk7XG4gIH1cblxuICAvKiogQ29tYmluZWQgc3RyZWFtIG9mIGFsbCBvZiB0aGUgY2hpbGQgY2hpcHMnIGRlc3Ryb3kgZXZlbnRzLiAqL1xuICBnZXQgY2hpcERlc3Ryb3llZENoYW5nZXMoKTogT2JzZXJ2YWJsZTxNYXRDaGlwRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2hpcFN0cmVhbShjaGlwID0+IGNoaXAuZGVzdHJveWVkKTtcbiAgfVxuXG4gIC8qKiBDb21iaW5lZCBzdHJlYW0gb2YgYWxsIG9mIHRoZSBjaGlsZCBjaGlwcycgcmVtb3ZlIGV2ZW50cy4gKi9cbiAgZ2V0IGNoaXBSZW1vdmVkQ2hhbmdlcygpOiBPYnNlcnZhYmxlPE1hdENoaXBFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRDaGlwU3RyZWFtKGNoaXAgPT4gY2hpcC5yZW1vdmVkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGlwIHNldCBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgdGhpcy5fc3luY0NoaXBzU3RhdGUoKTtcbiAgfVxuICBwcm90ZWN0ZWQgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoaXAgbGlzdCBjb250YWlucyBjaGlwcyBvciBub3QuICovXG4gIGdldCBlbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuX2NoaXBzIHx8IHRoaXMuX2NoaXBzLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIC8qKiBUaGUgQVJJQSByb2xlIGFwcGxpZWQgdG8gdGhlIGNoaXAgc2V0LiAqL1xuICBASW5wdXQoKVxuICBnZXQgcm9sZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAodGhpcy5fZXhwbGljaXRSb2xlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwbGljaXRSb2xlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVtcHR5ID8gbnVsbCA6IHRoaXMuX2RlZmF1bHRSb2xlO1xuICB9XG5cbiAgLyoqIFRhYmluZGV4IG9mIHRoZSBjaGlwIHNldC4gKi9cbiAgQElucHV0KHtcbiAgICB0cmFuc2Zvcm06ICh2YWx1ZTogdW5rbm93bikgPT4gKHZhbHVlID09IG51bGwgPyAwIDogbnVtYmVyQXR0cmlidXRlKHZhbHVlKSksXG4gIH0pXG4gIHRhYkluZGV4OiBudW1iZXIgPSAwO1xuXG4gIHNldCByb2xlKHZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgdGhpcy5fZXhwbGljaXRSb2xlID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfZXhwbGljaXRSb2xlOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKiogV2hldGhlciBhbnkgb2YgdGhlIGNoaXBzIGluc2lkZSBvZiB0aGlzIGNoaXAtc2V0IGhhcyBmb2N1cy4gKi9cbiAgZ2V0IGZvY3VzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc0ZvY3VzZWRDaGlwKCk7XG4gIH1cblxuICAvKiogVGhlIGNoaXBzIHRoYXQgYXJlIHBhcnQgb2YgdGhpcyBjaGlwIHNldC4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihNYXRDaGlwLCB7XG4gICAgLy8gV2UgbmVlZCB0byB1c2UgYGRlc2NlbmRhbnRzOiB0cnVlYCwgYmVjYXVzZSBJdnkgd2lsbCBubyBsb25nZXIgbWF0Y2hcbiAgICAvLyBpbmRpcmVjdCBkZXNjZW5kYW50cyBpZiBpdCdzIGxlZnQgYXMgZmFsc2UuXG4gICAgZGVzY2VuZGFudHM6IHRydWUsXG4gIH0pXG4gIF9jaGlwczogUXVlcnlMaXN0PE1hdENoaXA+O1xuXG4gIC8qKiBGbGF0IGxpc3Qgb2YgYWxsIHRoZSBhY3Rpb25zIGNvbnRhaW5lZCB3aXRoaW4gdGhlIGNoaXBzLiAqL1xuICBfY2hpcEFjdGlvbnMgPSBuZXcgUXVlcnlMaXN0PE1hdENoaXBBY3Rpb24+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI6IERpcmVjdGlvbmFsaXR5LFxuICApIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX3NldFVwRm9jdXNNYW5hZ2VtZW50KCk7XG4gICAgdGhpcy5fdHJhY2tDaGlwU2V0Q2hhbmdlcygpO1xuICAgIHRoaXMuX3RyYWNrRGVzdHJveWVkRm9jdXNlZENoaXAoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXI/LmRlc3Ryb3koKTtcbiAgICB0aGlzLl9jaGlwQWN0aW9ucy5kZXN0cm95KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhbnkgb2YgdGhlIGNoaXBzIGlzIGZvY3VzZWQuICovXG4gIHByb3RlY3RlZCBfaGFzRm9jdXNlZENoaXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoaXBzICYmIHRoaXMuX2NoaXBzLnNvbWUoY2hpcCA9PiBjaGlwLl9oYXNGb2N1cygpKTtcbiAgfVxuXG4gIC8qKiBTeW5jcyB0aGUgY2hpcC1zZXQncyBzdGF0ZSB3aXRoIHRoZSBpbmRpdmlkdWFsIGNoaXBzLiAqL1xuICBwcm90ZWN0ZWQgX3N5bmNDaGlwc1N0YXRlKCkge1xuICAgIHRoaXMuX2NoaXBzPy5mb3JFYWNoKGNoaXAgPT4ge1xuICAgICAgY2hpcC5fY2hpcExpc3REaXNhYmxlZCA9IHRoaXMuX2Rpc2FibGVkO1xuICAgICAgY2hpcC5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRHVtbXkgbWV0aG9kIGZvciBzdWJjbGFzc2VzIHRvIG92ZXJyaWRlLiBCYXNlIGNoaXAgc2V0IGNhbm5vdCBiZSBmb2N1c2VkLiAqL1xuICBmb2N1cygpIHt9XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIG9uIHRoZSBjaGlwIHNldC4gKi9cbiAgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5fb3JpZ2luYXRlc0Zyb21DaGlwKGV2ZW50KSkge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGVuc3VyZSBhbGwgaW5kZXhlcyBhcmUgdmFsaWQuXG4gICAqXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggdG8gYmUgY2hlY2tlZC5cbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgaW5kZXggaXMgdmFsaWQgZm9yIG91ciBsaXN0IG9mIGNoaXBzLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9pc1ZhbGlkSW5kZXgoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5fY2hpcHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGB0YWJpbmRleGAgZnJvbSB0aGUgY2hpcCBzZXQgYW5kIHJlc2V0cyBpdCBiYWNrIGFmdGVyd2FyZHMsIGFsbG93aW5nIHRoZVxuICAgKiB1c2VyIHRvIHRhYiBvdXQgb2YgaXQuIFRoaXMgcHJldmVudHMgdGhlIHNldCBmcm9tIGNhcHR1cmluZyBmb2N1cyBhbmQgcmVkaXJlY3RpbmdcbiAgICogaXQgYmFjayB0byB0aGUgZmlyc3QgY2hpcCwgY3JlYXRpbmcgYSBmb2N1cyB0cmFwLCBpZiBpdCB1c2VyIHRyaWVzIHRvIHRhYiBhd2F5LlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hbGxvd0ZvY3VzRXNjYXBlKCkge1xuICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRhYkluZGV4O1xuXG4gICAgaWYgKHByZXZpb3VzICE9PSAtMSkge1xuICAgICAgLy8gU2V0IHRoZSB0YWJpbmRleCBkaXJlY3RseSBvbiB0aGUgZWxlbWVudCwgaW5zdGVhZCBvZiBnb2luZyB0aHJvdWdoXG4gICAgICAvLyB0aGUgZGF0YSBiaW5kaW5nLCBiZWNhdXNlIHdlIGFyZW4ndCBndWFyYW50ZWVkIHRoYXQgY2hhbmdlIGRldGVjdGlvblxuICAgICAgLy8gd2lsbCBydW4gcXVpY2tseSBlbm91Z2ggdG8gYWxsb3cgZm9jdXMgdG8gZXNjYXBlLlxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRhYkluZGV4ID0gLTE7XG5cbiAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIG5lZWRzIHRvIGJlIGEgYHNldFRpbWVvdXRgLCBiZWNhdXNlIGEgYFByb21pc2UucmVzb2x2ZWBcbiAgICAgIC8vIGRvZXNuJ3QgYWxsb3cgZW5vdWdoIHRpbWUgZm9yIHRoZSBmb2N1cyB0byBlc2NhcGUuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+ICh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGFiSW5kZXggPSBwcmV2aW91cykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc3RyZWFtIG9mIGV2ZW50cyBmcm9tIGFsbCB0aGUgY2hpcHMgd2l0aGluIHRoZSBzZXQuXG4gICAqIFRoZSBzdHJlYW0gd2lsbCBhdXRvbWF0aWNhbGx5IGluY29ycG9yYXRlIGFueSBuZXdseS1hZGRlZCBjaGlwcy5cbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0Q2hpcFN0cmVhbTxULCBDIGV4dGVuZHMgTWF0Q2hpcCA9IE1hdENoaXA+KFxuICAgIG1hcHBpbmdGdW5jdGlvbjogKGNoaXA6IEMpID0+IE9ic2VydmFibGU8VD4sXG4gICk6IE9ic2VydmFibGU8VD4ge1xuICAgIHJldHVybiB0aGlzLl9jaGlwcy5jaGFuZ2VzLnBpcGUoXG4gICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gbWVyZ2UoLi4uKHRoaXMuX2NoaXBzIGFzIFF1ZXJ5TGlzdDxDPikubWFwKG1hcHBpbmdGdW5jdGlvbikpKSxcbiAgICApO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGFuIGV2ZW50IGNvbWVzIGZyb20gaW5zaWRlIGEgY2hpcCBlbGVtZW50LiAqL1xuICBwcm90ZWN0ZWQgX29yaWdpbmF0ZXNGcm9tQ2hpcChldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICBsZXQgY3VycmVudEVsZW1lbnQgPSBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgd2hpbGUgKGN1cnJlbnRFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIGlmIChjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdC1tZGMtY2hpcCcpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgY3VycmVudEVsZW1lbnQgPSBjdXJyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogU2V0cyB1cCB0aGUgY2hpcCBzZXQncyBmb2N1cyBtYW5hZ2VtZW50IGxvZ2ljLiAqL1xuICBwcml2YXRlIF9zZXRVcEZvY3VzTWFuYWdlbWVudCgpIHtcbiAgICAvLyBDcmVhdGUgYSBmbGF0IGBRdWVyeUxpc3RgIGNvbnRhaW5pbmcgdGhlIGFjdGlvbnMgb2YgYWxsIG9mIHRoZSBjaGlwcy5cbiAgICAvLyBUaGlzIGFsbG93cyB1cyB0byBuYXZpZ2F0ZSBib3RoIHdpdGhpbiB0aGUgY2hpcCBhbmQgbW92ZSB0byB0aGUgbmV4dC9wcmV2aW91c1xuICAgIC8vIG9uZSB1c2luZyB0aGUgZXhpc3RpbmcgYExpc3RLZXlNYW5hZ2VyYC5cbiAgICB0aGlzLl9jaGlwcy5jaGFuZ2VzLnBpcGUoc3RhcnRXaXRoKHRoaXMuX2NoaXBzKSkuc3Vic2NyaWJlKChjaGlwczogUXVlcnlMaXN0PE1hdENoaXA+KSA9PiB7XG4gICAgICBjb25zdCBhY3Rpb25zOiBNYXRDaGlwQWN0aW9uW10gPSBbXTtcbiAgICAgIGNoaXBzLmZvckVhY2goY2hpcCA9PiBjaGlwLl9nZXRBY3Rpb25zKCkuZm9yRWFjaChhY3Rpb24gPT4gYWN0aW9ucy5wdXNoKGFjdGlvbikpKTtcbiAgICAgIHRoaXMuX2NoaXBBY3Rpb25zLnJlc2V0KGFjdGlvbnMpO1xuICAgICAgdGhpcy5fY2hpcEFjdGlvbnMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLl9jaGlwQWN0aW9ucylcbiAgICAgIC53aXRoVmVydGljYWxPcmllbnRhdGlvbigpXG4gICAgICAud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXIgPyB0aGlzLl9kaXIudmFsdWUgOiAnbHRyJylcbiAgICAgIC53aXRoSG9tZUFuZEVuZCgpXG4gICAgICAuc2tpcFByZWRpY2F0ZShhY3Rpb24gPT4gdGhpcy5fc2tpcFByZWRpY2F0ZShhY3Rpb24pKTtcblxuICAgIC8vIEtlZXAgdGhlIG1hbmFnZXIgYWN0aXZlIGluZGV4IGluIHN5bmMgc28gdGhhdCBuYXZpZ2F0aW9uIHBpY2tzXG4gICAgLy8gdXAgZnJvbSB0aGUgY3VycmVudCBjaGlwIGlmIHRoZSB1c2VyIGNsaWNrcyBpbnRvIHRoZSBsaXN0IGRpcmVjdGx5LlxuICAgIHRoaXMuY2hpcEZvY3VzQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKHtjaGlwfSkgPT4ge1xuICAgICAgY29uc3QgYWN0aW9uID0gY2hpcC5fZ2V0U291cmNlQWN0aW9uKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgRWxlbWVudCk7XG5cbiAgICAgIGlmIChhY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fa2V5TWFuYWdlci51cGRhdGVBY3RpdmVJdGVtKGFjdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9kaXI/LmNoYW5nZVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGRpcmVjdGlvbiA9PiB0aGlzLl9rZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24oZGlyZWN0aW9uKSk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBrZXkgbWFuYWdlciBzaG91bGQgYXZvaWQgcHV0dGluZyBhIGdpdmVuIGNoaXAgYWN0aW9uIGluIHRoZSB0YWIgaW5kZXguIFNraXBcbiAgICogbm9uLWludGVyYWN0aXZlIGFuZCBkaXNhYmxlZCBhY3Rpb25zIHNpbmNlIHRoZSB1c2VyIGNhbid0IGRvIGFueXRoaW5nIHdpdGggdGhlbS5cbiAgICovXG4gIHByb3RlY3RlZCBfc2tpcFByZWRpY2F0ZShhY3Rpb246IE1hdENoaXBBY3Rpb24pOiBib29sZWFuIHtcbiAgICAvLyBTa2lwIGNoaXBzIHRoYXQgdGhlIHVzZXIgY2Fubm90IGludGVyYWN0IHdpdGguIGBtYXQtY2hpcC1zZXRgIGRvZXMgbm90IHBlcm1pdCBmb2N1c2luZyBkaXNhYmxlZFxuICAgIC8vIGNoaXBzLlxuICAgIHJldHVybiAhYWN0aW9uLmlzSW50ZXJhY3RpdmUgfHwgYWN0aW9uLmRpc2FibGVkO1xuICB9XG5cbiAgLyoqIExpc3RlbnMgdG8gY2hhbmdlcyBpbiB0aGUgY2hpcCBzZXQgYW5kIHN5bmNzIHVwIHRoZSBzdGF0ZSBvZiB0aGUgaW5kaXZpZHVhbCBjaGlwcy4gKi9cbiAgcHJpdmF0ZSBfdHJhY2tDaGlwU2V0Q2hhbmdlcygpIHtcbiAgICB0aGlzLl9jaGlwcy5jaGFuZ2VzLnBpcGUoc3RhcnRXaXRoKG51bGwpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgIC8vIFNpbmNlIHRoaXMgaGFwcGVucyBhZnRlciB0aGUgY29udGVudCBoYXMgYmVlblxuICAgICAgICAvLyBjaGVja2VkLCB3ZSBuZWVkIHRvIGRlZmVyIGl0IHRvIHRoZSBuZXh0IHRpY2suXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gdGhpcy5fc3luY0NoaXBzU3RhdGUoKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3JlZGlyZWN0RGVzdHJveWVkQ2hpcEZvY3VzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogU3RhcnRzIHRyYWNraW5nIHRoZSBkZXN0cm95ZWQgY2hpcHMgaW4gb3JkZXIgdG8gY2FwdHVyZSB0aGUgZm9jdXNlZCBvbmUuICovXG4gIHByaXZhdGUgX3RyYWNrRGVzdHJveWVkRm9jdXNlZENoaXAoKSB7XG4gICAgdGhpcy5jaGlwRGVzdHJveWVkQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKGV2ZW50OiBNYXRDaGlwRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGNoaXBBcnJheSA9IHRoaXMuX2NoaXBzLnRvQXJyYXkoKTtcbiAgICAgIGNvbnN0IGNoaXBJbmRleCA9IGNoaXBBcnJheS5pbmRleE9mKGV2ZW50LmNoaXApO1xuXG4gICAgICAvLyBJZiB0aGUgZm9jdXNlZCBjaGlwIGlzIGRlc3Ryb3llZCwgc2F2ZSBpdHMgaW5kZXggc28gdGhhdCB3ZSBjYW4gbW92ZSBmb2N1cyB0byB0aGUgbmV4dFxuICAgICAgLy8gY2hpcC4gV2Ugb25seSBzYXZlIHRoZSBpbmRleCBoZXJlLCByYXRoZXIgdGhhbiBtb3ZlIHRoZSBmb2N1cyBpbW1lZGlhdGVseSwgYmVjYXVzZSB3ZSB3YW50XG4gICAgICAvLyB0byB3YWl0IHVudGlsIHRoZSBjaGlwIGlzIHJlbW92ZWQgZnJvbSB0aGUgY2hpcCBsaXN0IGJlZm9yZSBmb2N1c2luZyB0aGUgbmV4dCBvbmUuIFRoaXNcbiAgICAgIC8vIGFsbG93cyB1cyB0byBrZWVwIGZvY3VzIG9uIHRoZSBzYW1lIGluZGV4IGlmIHRoZSBjaGlwIGdldHMgc3dhcHBlZCBvdXQuXG4gICAgICBpZiAodGhpcy5faXNWYWxpZEluZGV4KGNoaXBJbmRleCkgJiYgZXZlbnQuY2hpcC5faGFzRm9jdXMoKSkge1xuICAgICAgICB0aGlzLl9sYXN0RGVzdHJveWVkRm9jdXNlZENoaXBJbmRleCA9IGNoaXBJbmRleDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgbmV4dCBhcHByb3ByaWF0ZSBjaGlwIHRvIG1vdmUgZm9jdXMgdG8sXG4gICAqIGlmIHRoZSBjdXJyZW50bHktZm9jdXNlZCBjaGlwIGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIHByaXZhdGUgX3JlZGlyZWN0RGVzdHJveWVkQ2hpcEZvY3VzKCkge1xuICAgIGlmICh0aGlzLl9sYXN0RGVzdHJveWVkRm9jdXNlZENoaXBJbmRleCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NoaXBzLmxlbmd0aCkge1xuICAgICAgY29uc3QgbmV3SW5kZXggPSBNYXRoLm1pbih0aGlzLl9sYXN0RGVzdHJveWVkRm9jdXNlZENoaXBJbmRleCwgdGhpcy5fY2hpcHMubGVuZ3RoIC0gMSk7XG4gICAgICBjb25zdCBjaGlwVG9Gb2N1cyA9IHRoaXMuX2NoaXBzLnRvQXJyYXkoKVtuZXdJbmRleF07XG5cbiAgICAgIGlmIChjaGlwVG9Gb2N1cy5kaXNhYmxlZCkge1xuICAgICAgICAvLyBJZiB3ZSdyZSBkb3duIHRvIG9uZSBkaXNhYmxlZCBjaGlwLCBtb3ZlIGZvY3VzIGJhY2sgdG8gdGhlIHNldC5cbiAgICAgICAgaWYgKHRoaXMuX2NoaXBzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGlwVG9Gb2N1cy5mb2N1cygpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGFzdERlc3Ryb3llZEZvY3VzZWRDaGlwSW5kZXggPSBudWxsO1xuICB9XG59XG4iXX0=