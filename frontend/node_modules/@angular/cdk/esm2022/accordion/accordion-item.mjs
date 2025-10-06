/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Output, Directive, EventEmitter, Input, Optional, ChangeDetectorRef, SkipSelf, Inject, booleanAttribute, } from '@angular/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { CDK_ACCORDION, CdkAccordion } from './accordion';
import { Subscription } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/collections";
import * as i2 from "./accordion";
/** Used to generate unique ID for each accordion item. */
let nextId = 0;
/**
 * A basic directive expected to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by a CdkAccordion parent.
 */
export class CdkAccordionItem {
    /** Whether the AccordionItem is expanded. */
    get expanded() {
        return this._expanded;
    }
    set expanded(expanded) {
        // Only emit events and update the internal value if the value changes.
        if (this._expanded !== expanded) {
            this._expanded = expanded;
            this.expandedChange.emit(expanded);
            if (expanded) {
                this.opened.emit();
                /**
                 * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
                 * the name value is the id of the accordion.
                 */
                const accordionId = this.accordion ? this.accordion.id : this.id;
                this._expansionDispatcher.notify(this.id, accordionId);
            }
            else {
                this.closed.emit();
            }
            // Ensures that the animation will run when the value is set outside of an `@Input`.
            // This includes cases like the open, close and toggle methods.
            this._changeDetectorRef.markForCheck();
        }
    }
    constructor(accordion, _changeDetectorRef, _expansionDispatcher) {
        this.accordion = accordion;
        this._changeDetectorRef = _changeDetectorRef;
        this._expansionDispatcher = _expansionDispatcher;
        /** Subscription to openAll/closeAll events. */
        this._openCloseAllSubscription = Subscription.EMPTY;
        /** Event emitted every time the AccordionItem is closed. */
        this.closed = new EventEmitter();
        /** Event emitted every time the AccordionItem is opened. */
        this.opened = new EventEmitter();
        /** Event emitted when the AccordionItem is destroyed. */
        this.destroyed = new EventEmitter();
        /**
         * Emits whenever the expanded state of the accordion changes.
         * Primarily used to facilitate two-way binding.
         * @docs-private
         */
        this.expandedChange = new EventEmitter();
        /** The unique AccordionItem id. */
        this.id = `cdk-accordion-child-${nextId++}`;
        this._expanded = false;
        /** Whether the AccordionItem is disabled. */
        this.disabled = false;
        /** Unregister function for _expansionDispatcher. */
        this._removeUniqueSelectionListener = () => { };
        this._removeUniqueSelectionListener = _expansionDispatcher.listen((id, accordionId) => {
            if (this.accordion &&
                !this.accordion.multi &&
                this.accordion.id === accordionId &&
                this.id !== id) {
                this.expanded = false;
            }
        });
        // When an accordion item is hosted in an accordion, subscribe to open/close events.
        if (this.accordion) {
            this._openCloseAllSubscription = this._subscribeToOpenCloseAllActions();
        }
    }
    /** Emits an event for the accordion item being destroyed. */
    ngOnDestroy() {
        this.opened.complete();
        this.closed.complete();
        this.destroyed.emit();
        this.destroyed.complete();
        this._removeUniqueSelectionListener();
        this._openCloseAllSubscription.unsubscribe();
    }
    /** Toggles the expanded state of the accordion item. */
    toggle() {
        if (!this.disabled) {
            this.expanded = !this.expanded;
        }
    }
    /** Sets the expanded state of the accordion item to false. */
    close() {
        if (!this.disabled) {
            this.expanded = false;
        }
    }
    /** Sets the expanded state of the accordion item to true. */
    open() {
        if (!this.disabled) {
            this.expanded = true;
        }
    }
    _subscribeToOpenCloseAllActions() {
        return this.accordion._openCloseAllActions.subscribe(expanded => {
            // Only change expanded state if item is enabled
            if (!this.disabled) {
                this.expanded = expanded;
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkAccordionItem, deps: [{ token: CDK_ACCORDION, optional: true, skipSelf: true }, { token: i0.ChangeDetectorRef }, { token: i1.UniqueSelectionDispatcher }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkAccordionItem, isStandalone: true, selector: "cdk-accordion-item, [cdkAccordionItem]", inputs: { expanded: ["expanded", "expanded", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { closed: "closed", opened: "opened", destroyed: "destroyed", expandedChange: "expandedChange" }, providers: [
            // Provide `CDK_ACCORDION` as undefined to prevent nested accordion items from
            // registering to the same accordion.
            { provide: CDK_ACCORDION, useValue: undefined },
        ], exportAs: ["cdkAccordionItem"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkAccordionItem, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-accordion-item, [cdkAccordionItem]',
                    exportAs: 'cdkAccordionItem',
                    providers: [
                        // Provide `CDK_ACCORDION` as undefined to prevent nested accordion items from
                        // registering to the same accordion.
                        { provide: CDK_ACCORDION, useValue: undefined },
                    ],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i2.CdkAccordion, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_ACCORDION]
                }, {
                    type: SkipSelf
                }] }, { type: i0.ChangeDetectorRef }, { type: i1.UniqueSelectionDispatcher }], propDecorators: { closed: [{
                type: Output
            }], opened: [{
                type: Output
            }], destroyed: [{
                type: Output
            }], expandedChange: [{
                type: Output
            }], expanded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLWl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2FjY29yZGlvbi9hY2NvcmRpb24taXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsUUFBUSxFQUNSLE1BQU0sRUFDTixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQzs7OztBQUVsQywwREFBMEQ7QUFDMUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7OztHQUdHO0FBV0gsTUFBTSxPQUFPLGdCQUFnQjtJQW9CM0IsNkNBQTZDO0lBQzdDLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsUUFBaUI7UUFDNUIsdUVBQXVFO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuQyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25COzs7bUJBR0c7Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FB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c0JBQTdDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgT3V0cHV0LFxuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBTa2lwU2VsZixcbiAgSW5qZWN0LFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7Q0RLX0FDQ09SRElPTiwgQ2RrQWNjb3JkaW9ufSBmcm9tICcuL2FjY29yZGlvbic7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3IgZWFjaCBhY2NvcmRpb24gaXRlbS4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEEgYmFzaWMgZGlyZWN0aXZlIGV4cGVjdGVkIHRvIGJlIGV4dGVuZGVkIGFuZCBkZWNvcmF0ZWQgYXMgYSBjb21wb25lbnQuICBTZXRzIHVwIGFsbFxuICogZXZlbnRzIGFuZCBhdHRyaWJ1dGVzIG5lZWRlZCB0byBiZSBtYW5hZ2VkIGJ5IGEgQ2RrQWNjb3JkaW9uIHBhcmVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLWFjY29yZGlvbi1pdGVtLCBbY2RrQWNjb3JkaW9uSXRlbV0nLFxuICBleHBvcnRBczogJ2Nka0FjY29yZGlvbkl0ZW0nLFxuICBwcm92aWRlcnM6IFtcbiAgICAvLyBQcm92aWRlIGBDREtfQUNDT1JESU9OYCBhcyB1bmRlZmluZWQgdG8gcHJldmVudCBuZXN0ZWQgYWNjb3JkaW9uIGl0ZW1zIGZyb21cbiAgICAvLyByZWdpc3RlcmluZyB0byB0aGUgc2FtZSBhY2NvcmRpb24uXG4gICAge3Byb3ZpZGU6IENES19BQ0NPUkRJT04sIHVzZVZhbHVlOiB1bmRlZmluZWR9LFxuICBdLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtBY2NvcmRpb25JdGVtIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFN1YnNjcmlwdGlvbiB0byBvcGVuQWxsL2Nsb3NlQWxsIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBfb3BlbkNsb3NlQWxsU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICAvKiogRXZlbnQgZW1pdHRlZCBldmVyeSB0aW1lIHRoZSBBY2NvcmRpb25JdGVtIGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAvKiogRXZlbnQgZW1pdHRlZCBldmVyeSB0aW1lIHRoZSBBY2NvcmRpb25JdGVtIGlzIG9wZW5lZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBBY2NvcmRpb25JdGVtIGlzIGRlc3Ryb3llZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRlc3Ryb3llZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGVuZXZlciB0aGUgZXhwYW5kZWQgc3RhdGUgb2YgdGhlIGFjY29yZGlvbiBjaGFuZ2VzLlxuICAgKiBQcmltYXJpbHkgdXNlZCB0byBmYWNpbGl0YXRlIHR3by13YXkgYmluZGluZy5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGV4cGFuZGVkQ2hhbmdlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgLyoqIFRoZSB1bmlxdWUgQWNjb3JkaW9uSXRlbSBpZC4gKi9cbiAgcmVhZG9ubHkgaWQ6IHN0cmluZyA9IGBjZGstYWNjb3JkaW9uLWNoaWxkLSR7bmV4dElkKyt9YDtcblxuICAvKiogV2hldGhlciB0aGUgQWNjb3JkaW9uSXRlbSBpcyBleHBhbmRlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZXhwYW5kZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2V4cGFuZGVkO1xuICB9XG4gIHNldCBleHBhbmRlZChleHBhbmRlZDogYm9vbGVhbikge1xuICAgIC8vIE9ubHkgZW1pdCBldmVudHMgYW5kIHVwZGF0ZSB0aGUgaW50ZXJuYWwgdmFsdWUgaWYgdGhlIHZhbHVlIGNoYW5nZXMuXG4gICAgaWYgKHRoaXMuX2V4cGFuZGVkICE9PSBleHBhbmRlZCkge1xuICAgICAgdGhpcy5fZXhwYW5kZWQgPSBleHBhbmRlZDtcbiAgICAgIHRoaXMuZXhwYW5kZWRDaGFuZ2UuZW1pdChleHBhbmRlZCk7XG5cbiAgICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgICB0aGlzLm9wZW5lZC5lbWl0KCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbiB0aGUgdW5pcXVlIHNlbGVjdGlvbiBkaXNwYXRjaGVyLCB0aGUgaWQgcGFyYW1ldGVyIGlzIHRoZSBpZCBvZiB0aGUgQ2RrQWNjb3JkaW9uSXRlbSxcbiAgICAgICAgICogdGhlIG5hbWUgdmFsdWUgaXMgdGhlIGlkIG9mIHRoZSBhY2NvcmRpb24uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBhY2NvcmRpb25JZCA9IHRoaXMuYWNjb3JkaW9uID8gdGhpcy5hY2NvcmRpb24uaWQgOiB0aGlzLmlkO1xuICAgICAgICB0aGlzLl9leHBhbnNpb25EaXNwYXRjaGVyLm5vdGlmeSh0aGlzLmlkLCBhY2NvcmRpb25JZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsb3NlZC5lbWl0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVuc3VyZXMgdGhhdCB0aGUgYW5pbWF0aW9uIHdpbGwgcnVuIHdoZW4gdGhlIHZhbHVlIGlzIHNldCBvdXRzaWRlIG9mIGFuIGBASW5wdXRgLlxuICAgICAgLy8gVGhpcyBpbmNsdWRlcyBjYXNlcyBsaWtlIHRoZSBvcGVuLCBjbG9zZSBhbmQgdG9nZ2xlIG1ldGhvZHMuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZXhwYW5kZWQgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgQWNjb3JkaW9uSXRlbSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBVbnJlZ2lzdGVyIGZ1bmN0aW9uIGZvciBfZXhwYW5zaW9uRGlzcGF0Y2hlci4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlVW5pcXVlU2VsZWN0aW9uTGlzdGVuZXI6ICgpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENES19BQ0NPUkRJT04pIEBTa2lwU2VsZigpIHB1YmxpYyBhY2NvcmRpb246IENka0FjY29yZGlvbixcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJvdGVjdGVkIF9leHBhbnNpb25EaXNwYXRjaGVyOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyLFxuICApIHtcbiAgICB0aGlzLl9yZW1vdmVVbmlxdWVTZWxlY3Rpb25MaXN0ZW5lciA9IF9leHBhbnNpb25EaXNwYXRjaGVyLmxpc3RlbihcbiAgICAgIChpZDogc3RyaW5nLCBhY2NvcmRpb25JZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmFjY29yZGlvbiAmJlxuICAgICAgICAgICF0aGlzLmFjY29yZGlvbi5tdWx0aSAmJlxuICAgICAgICAgIHRoaXMuYWNjb3JkaW9uLmlkID09PSBhY2NvcmRpb25JZCAmJlxuICAgICAgICAgIHRoaXMuaWQgIT09IGlkXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuXG4gICAgLy8gV2hlbiBhbiBhY2NvcmRpb24gaXRlbSBpcyBob3N0ZWQgaW4gYW4gYWNjb3JkaW9uLCBzdWJzY3JpYmUgdG8gb3Blbi9jbG9zZSBldmVudHMuXG4gICAgaWYgKHRoaXMuYWNjb3JkaW9uKSB7XG4gICAgICB0aGlzLl9vcGVuQ2xvc2VBbGxTdWJzY3JpcHRpb24gPSB0aGlzLl9zdWJzY3JpYmVUb09wZW5DbG9zZUFsbEFjdGlvbnMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogRW1pdHMgYW4gZXZlbnQgZm9yIHRoZSBhY2NvcmRpb24gaXRlbSBiZWluZyBkZXN0cm95ZWQuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMub3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5lbWl0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLl9yZW1vdmVVbmlxdWVTZWxlY3Rpb25MaXN0ZW5lcigpO1xuICAgIHRoaXMuX29wZW5DbG9zZUFsbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIGV4cGFuZGVkIHN0YXRlIG9mIHRoZSBhY2NvcmRpb24gaXRlbS4gKi9cbiAgdG9nZ2xlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBleHBhbmRlZCBzdGF0ZSBvZiB0aGUgYWNjb3JkaW9uIGl0ZW0gdG8gZmFsc2UuICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBleHBhbmRlZCBzdGF0ZSBvZiB0aGUgYWNjb3JkaW9uIGl0ZW0gdG8gdHJ1ZS4gKi9cbiAgb3BlbigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZXhwYW5kZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvT3BlbkNsb3NlQWxsQWN0aW9ucygpOiBTdWJzY3JpcHRpb24ge1xuICAgIHJldHVybiB0aGlzLmFjY29yZGlvbi5fb3BlbkNsb3NlQWxsQWN0aW9ucy5zdWJzY3JpYmUoZXhwYW5kZWQgPT4ge1xuICAgICAgLy8gT25seSBjaGFuZ2UgZXhwYW5kZWQgc3RhdGUgaWYgaXRlbSBpcyBlbmFibGVkXG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5leHBhbmRlZCA9IGV4cGFuZGVkO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=