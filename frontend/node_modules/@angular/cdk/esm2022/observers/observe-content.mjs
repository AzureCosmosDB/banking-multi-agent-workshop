/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceElement, coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, EventEmitter, Injectable, Input, NgModule, NgZone, Output, booleanAttribute, inject, } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import * as i0 from "@angular/core";
// Angular may add, remove, or edit comment nodes during change detection. We don't care about
// these changes because they don't affect the user-preceived content, and worse it can cause
// infinite change detection cycles where the change detection updates a comment, triggering the
// MutationObserver, triggering another change detection and kicking the cycle off again.
function shouldIgnoreRecord(record) {
    // Ignore changes to comment text.
    if (record.type === 'characterData' && record.target instanceof Comment) {
        return true;
    }
    // Ignore addition / removal of comments.
    if (record.type === 'childList') {
        for (let i = 0; i < record.addedNodes.length; i++) {
            if (!(record.addedNodes[i] instanceof Comment)) {
                return false;
            }
        }
        for (let i = 0; i < record.removedNodes.length; i++) {
            if (!(record.removedNodes[i] instanceof Comment)) {
                return false;
            }
        }
        return true;
    }
    // Observe everything else.
    return false;
}
/**
 * Factory that creates a new MutationObserver and allows us to stub it out in unit tests.
 * @docs-private
 */
export class MutationObserverFactory {
    create(callback) {
        return typeof MutationObserver === 'undefined' ? null : new MutationObserver(callback);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MutationObserverFactory, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MutationObserverFactory, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MutationObserverFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/** An injectable service that allows watching elements for changes to their content. */
export class ContentObserver {
    constructor(_mutationObserverFactory) {
        this._mutationObserverFactory = _mutationObserverFactory;
        /** Keeps track of the existing MutationObservers so they can be reused. */
        this._observedElements = new Map();
        this._ngZone = inject(NgZone);
    }
    ngOnDestroy() {
        this._observedElements.forEach((_, element) => this._cleanupObserver(element));
    }
    observe(elementOrRef) {
        const element = coerceElement(elementOrRef);
        return new Observable((observer) => {
            const stream = this._observeElement(element);
            const subscription = stream
                .pipe(map(records => records.filter(record => !shouldIgnoreRecord(record))), filter(records => !!records.length))
                .subscribe(records => {
                this._ngZone.run(() => {
                    observer.next(records);
                });
            });
            return () => {
                subscription.unsubscribe();
                this._unobserveElement(element);
            };
        });
    }
    /**
     * Observes the given element by using the existing MutationObserver if available, or creating a
     * new one if not.
     */
    _observeElement(element) {
        return this._ngZone.runOutsideAngular(() => {
            if (!this._observedElements.has(element)) {
                const stream = new Subject();
                const observer = this._mutationObserverFactory.create(mutations => stream.next(mutations));
                if (observer) {
                    observer.observe(element, {
                        characterData: true,
                        childList: true,
                        subtree: true,
                    });
                }
                this._observedElements.set(element, { observer, stream, count: 1 });
            }
            else {
                this._observedElements.get(element).count++;
            }
            return this._observedElements.get(element).stream;
        });
    }
    /**
     * Un-observes the given element and cleans up the underlying MutationObserver if nobody else is
     * observing this element.
     */
    _unobserveElement(element) {
        if (this._observedElements.has(element)) {
            this._observedElements.get(element).count--;
            if (!this._observedElements.get(element).count) {
                this._cleanupObserver(element);
            }
        }
    }
    /** Clean up the underlying MutationObserver for the specified element. */
    _cleanupObserver(element) {
        if (this._observedElements.has(element)) {
            const { observer, stream } = this._observedElements.get(element);
            if (observer) {
                observer.disconnect();
            }
            stream.complete();
            this._observedElements.delete(element);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ContentObserver, deps: [{ token: MutationObserverFactory }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ContentObserver, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ContentObserver, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: MutationObserverFactory }] });
/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
export class CdkObserveContent {
    /**
     * Whether observing content is disabled. This option can be used
     * to disconnect the underlying MutationObserver until it is needed.
     */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this._disabled ? this._unsubscribe() : this._subscribe();
    }
    /** Debounce interval for emitting the changes. */
    get debounce() {
        return this._debounce;
    }
    set debounce(value) {
        this._debounce = coerceNumberProperty(value);
        this._subscribe();
    }
    constructor(_contentObserver, _elementRef) {
        this._contentObserver = _contentObserver;
        this._elementRef = _elementRef;
        /** Event emitted for each change in the element's content. */
        this.event = new EventEmitter();
        this._disabled = false;
        this._currentSubscription = null;
    }
    ngAfterContentInit() {
        if (!this._currentSubscription && !this.disabled) {
            this._subscribe();
        }
    }
    ngOnDestroy() {
        this._unsubscribe();
    }
    _subscribe() {
        this._unsubscribe();
        const stream = this._contentObserver.observe(this._elementRef);
        this._currentSubscription = (this.debounce ? stream.pipe(debounceTime(this.debounce)) : stream).subscribe(this.event);
    }
    _unsubscribe() {
        this._currentSubscription?.unsubscribe();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkObserveContent, deps: [{ token: ContentObserver }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkObserveContent, isStandalone: true, selector: "[cdkObserveContent]", inputs: { disabled: ["cdkObserveContentDisabled", "disabled", booleanAttribute], debounce: "debounce" }, outputs: { event: "cdkObserveContent" }, exportAs: ["cdkObserveContent"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkObserveContent, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkObserveContent]',
                    exportAs: 'cdkObserveContent',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: ContentObserver }, { type: i0.ElementRef }], propDecorators: { event: [{
                type: Output,
                args: ['cdkObserveContent']
            }], disabled: [{
                type: Input,
                args: [{ alias: 'cdkObserveContentDisabled', transform: booleanAttribute }]
            }], debounce: [{
                type: Input
            }] } });
export class ObserversModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ObserversModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: ObserversModule, imports: [CdkObserveContent], exports: [CdkObserveContent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ObserversModule, providers: [MutationObserverFactory] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: ObserversModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkObserveContent],
                    exports: [CdkObserveContent],
                    providers: [MutationObserverFactory],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2ZS1jb250ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vYnNlcnZlcnMvb2JzZXJ2ZS1jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBYyxhQUFhLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osVUFBVSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUVOLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxVQUFVLEVBQVksT0FBTyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBQ2pFLE9BQU8sRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztBQUV6RCw4RkFBOEY7QUFDOUYsNkZBQTZGO0FBQzdGLGdHQUFnRztBQUNoRyx5RkFBeUY7QUFDekYsU0FBUyxrQkFBa0IsQ0FBQyxNQUFzQjtJQUNoRCxrQ0FBa0M7SUFDbEMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLGVBQWUsSUFBSSxNQUFNLENBQUMsTUFBTSxZQUFZLE9BQU8sRUFBRSxDQUFDO1FBQ3hFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELHlDQUF5QztJQUN6QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxPQUFPLENBQUMsRUFBRSxDQUFDO2dC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QzdCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjswR0FHdUMsS0FBSztzQkFBMUMsTUFBTTt1QkFBQyxtQkFBbUI7Z0JBT3ZCLFFBQVE7c0JBRFgsS0FBSzt1QkFBQyxFQUFDLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBWXBFLFFBQVE7c0JBRFgsS0FBSzs7QUE4Q1IsTUFBTSxPQUFPLGVBQWU7cUhBQWYsZUFBZTtzSEFBZixlQUFlLFlBakVmLGlCQUFpQixhQUFqQixpQkFBaUI7c0hBaUVqQixlQUFlLGFBRmYsQ0FBQyx1QkFBdUIsQ0FBQzs7a0dBRXpCLGVBQWU7a0JBTDNCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUM7b0JBQzVCLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDO29CQUM1QixTQUFTLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztpQkFDckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOdW1iZXJJbnB1dCwgY29lcmNlRWxlbWVudCwgY29lcmNlTnVtYmVyUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0YWJsZSxcbiAgSW5wdXQsXG4gIE5nTW9kdWxlLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBib29sZWFuQXR0cmlidXRlLFxuICBpbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlciwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGVib3VuY2VUaW1lLCBmaWx0ZXIsIG1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vLyBBbmd1bGFyIG1heSBhZGQsIHJlbW92ZSwgb3IgZWRpdCBjb21tZW50IG5vZGVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLiBXZSBkb24ndCBjYXJlIGFib3V0XG4vLyB0aGVzZSBjaGFuZ2VzIGJlY2F1c2UgdGhleSBkb24ndCBhZmZlY3QgdGhlIHVzZXItcHJlY2VpdmVkIGNvbnRlbnQsIGFuZCB3b3JzZSBpdCBjYW4gY2F1c2Vcbi8vIGluZmluaXRlIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIHdoZXJlIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHVwZGF0ZXMgYSBjb21tZW50LCB0cmlnZ2VyaW5nIHRoZVxuLy8gTXV0YXRpb25PYnNlcnZlciwgdHJpZ2dlcmluZyBhbm90aGVyIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGtpY2tpbmcgdGhlIGN5Y2xlIG9mZiBhZ2Fpbi5cbmZ1bmN0aW9uIHNob3VsZElnbm9yZVJlY29yZChyZWNvcmQ6IE11dGF0aW9uUmVjb3JkKSB7XG4gIC8vIElnbm9yZSBjaGFuZ2VzIHRvIGNvbW1lbnQgdGV4dC5cbiAgaWYgKHJlY29yZC50eXBlID09PSAnY2hhcmFjdGVyRGF0YScgJiYgcmVjb3JkLnRhcmdldCBpbnN0YW5jZW9mIENvbW1lbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvLyBJZ25vcmUgYWRkaXRpb24gLyByZW1vdmFsIG9mIGNvbW1lbnRzLlxuICBpZiAocmVjb3JkLnR5cGUgPT09ICdjaGlsZExpc3QnKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWNvcmQuYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCEocmVjb3JkLmFkZGVkTm9kZXNbaV0gaW5zdGFuY2VvZiBDb21tZW50KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjb3JkLnJlbW92ZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCEocmVjb3JkLnJlbW92ZWROb2Rlc1tpXSBpbnN0YW5jZW9mIENvbW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLy8gT2JzZXJ2ZSBldmVyeXRoaW5nIGVsc2UuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IHRoYXQgY3JlYXRlcyBhIG5ldyBNdXRhdGlvbk9ic2VydmVyIGFuZCBhbGxvd3MgdXMgdG8gc3R1YiBpdCBvdXQgaW4gdW5pdCB0ZXN0cy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTXV0YXRpb25PYnNlcnZlckZhY3Rvcnkge1xuICBjcmVhdGUoY2FsbGJhY2s6IE11dGF0aW9uQ2FsbGJhY2spOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBuZXcgTXV0YXRpb25PYnNlcnZlcihjYWxsYmFjayk7XG4gIH1cbn1cblxuLyoqIEFuIGluamVjdGFibGUgc2VydmljZSB0aGF0IGFsbG93cyB3YXRjaGluZyBlbGVtZW50cyBmb3IgY2hhbmdlcyB0byB0aGVpciBjb250ZW50LiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQ29udGVudE9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBleGlzdGluZyBNdXRhdGlvbk9ic2VydmVycyBzbyB0aGV5IGNhbiBiZSByZXVzZWQuICovXG4gIHByaXZhdGUgX29ic2VydmVkRWxlbWVudHMgPSBuZXcgTWFwPFxuICAgIEVsZW1lbnQsXG4gICAge1xuICAgICAgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsO1xuICAgICAgcmVhZG9ubHkgc3RyZWFtOiBTdWJqZWN0PE11dGF0aW9uUmVjb3JkW10+O1xuICAgICAgY291bnQ6IG51bWJlcjtcbiAgICB9XG4gID4oKTtcblxuICBwcml2YXRlIF9uZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tdXRhdGlvbk9ic2VydmVyRmFjdG9yeTogTXV0YXRpb25PYnNlcnZlckZhY3RvcnkpIHt9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5mb3JFYWNoKChfLCBlbGVtZW50KSA9PiB0aGlzLl9jbGVhbnVwT2JzZXJ2ZXIoZWxlbWVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9ic2VydmUgY29udGVudCBjaGFuZ2VzIG9uIGFuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIG9ic2VydmUgZm9yIGNvbnRlbnQgY2hhbmdlcy5cbiAgICovXG4gIG9ic2VydmUoZWxlbWVudDogRWxlbWVudCk6IE9ic2VydmFibGU8TXV0YXRpb25SZWNvcmRbXT47XG5cbiAgLyoqXG4gICAqIE9ic2VydmUgY29udGVudCBjaGFuZ2VzIG9uIGFuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIG9ic2VydmUgZm9yIGNvbnRlbnQgY2hhbmdlcy5cbiAgICovXG4gIG9ic2VydmUoZWxlbWVudDogRWxlbWVudFJlZjxFbGVtZW50Pik6IE9ic2VydmFibGU8TXV0YXRpb25SZWNvcmRbXT47XG5cbiAgb2JzZXJ2ZShlbGVtZW50T3JSZWY6IEVsZW1lbnQgfCBFbGVtZW50UmVmPEVsZW1lbnQ+KTogT2JzZXJ2YWJsZTxNdXRhdGlvblJlY29yZFtdPiB7XG4gICAgY29uc3QgZWxlbWVudCA9IGNvZXJjZUVsZW1lbnQoZWxlbWVudE9yUmVmKTtcblxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPE11dGF0aW9uUmVjb3JkW10+KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSB0aGlzLl9vYnNlcnZlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHN0cmVhbVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBtYXAocmVjb3JkcyA9PiByZWNvcmRzLmZpbHRlcihyZWNvcmQgPT4gIXNob3VsZElnbm9yZVJlY29yZChyZWNvcmQpKSksXG4gICAgICAgICAgZmlsdGVyKHJlY29yZHMgPT4gISFyZWNvcmRzLmxlbmd0aCksXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZShyZWNvcmRzID0+IHtcbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmVjb3Jkcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgdGhpcy5fdW5vYnNlcnZlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT2JzZXJ2ZXMgdGhlIGdpdmVuIGVsZW1lbnQgYnkgdXNpbmcgdGhlIGV4aXN0aW5nIE11dGF0aW9uT2JzZXJ2ZXIgaWYgYXZhaWxhYmxlLCBvciBjcmVhdGluZyBhXG4gICAqIG5ldyBvbmUgaWYgbm90LlxuICAgKi9cbiAgcHJpdmF0ZSBfb2JzZXJ2ZUVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IFN1YmplY3Q8TXV0YXRpb25SZWNvcmRbXT4ge1xuICAgIHJldHVybiB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBuZXcgU3ViamVjdDxNdXRhdGlvblJlY29yZFtdPigpO1xuICAgICAgICBjb25zdCBvYnNlcnZlciA9IHRoaXMuX211dGF0aW9uT2JzZXJ2ZXJGYWN0b3J5LmNyZWF0ZShtdXRhdGlvbnMgPT4gc3RyZWFtLm5leHQobXV0YXRpb25zKSk7XG4gICAgICAgIGlmIChvYnNlcnZlcikge1xuICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZWxlbWVudCwge1xuICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5zZXQoZWxlbWVudCwge29ic2VydmVyLCBzdHJlYW0sIGNvdW50OiAxfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuY291bnQrKztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuc3RyZWFtO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuLW9ic2VydmVzIHRoZSBnaXZlbiBlbGVtZW50IGFuZCBjbGVhbnMgdXAgdGhlIHVuZGVybHlpbmcgTXV0YXRpb25PYnNlcnZlciBpZiBub2JvZHkgZWxzZSBpc1xuICAgKiBvYnNlcnZpbmcgdGhpcyBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfdW5vYnNlcnZlRWxlbWVudChlbGVtZW50OiBFbGVtZW50KSB7XG4gICAgaWYgKHRoaXMuX29ic2VydmVkRWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuY291bnQtLTtcbiAgICAgIGlmICghdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5nZXQoZWxlbWVudCkhLmNvdW50KSB7XG4gICAgICAgIHRoaXMuX2NsZWFudXBPYnNlcnZlcihlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQ2xlYW4gdXAgdGhlIHVuZGVybHlpbmcgTXV0YXRpb25PYnNlcnZlciBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9jbGVhbnVwT2JzZXJ2ZXIoZWxlbWVudDogRWxlbWVudCkge1xuICAgIGlmICh0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xuICAgICAgY29uc3Qge29ic2VydmVyLCBzdHJlYW19ID0gdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5nZXQoZWxlbWVudCkhO1xuICAgICAgaWYgKG9ic2VydmVyKSB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cbiAgICAgIHN0cmVhbS5jb21wbGV0ZSgpO1xuICAgICAgdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5kZWxldGUoZWxlbWVudCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgYSBjYWxsYmFjayB3aGVuZXZlciB0aGUgY29udGVudCBvZlxuICogaXRzIGFzc29jaWF0ZWQgZWxlbWVudCBoYXMgY2hhbmdlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka09ic2VydmVDb250ZW50XScsXG4gIGV4cG9ydEFzOiAnY2RrT2JzZXJ2ZUNvbnRlbnQnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtPYnNlcnZlQ29udGVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBFdmVudCBlbWl0dGVkIGZvciBlYWNoIGNoYW5nZSBpbiB0aGUgZWxlbWVudCdzIGNvbnRlbnQuICovXG4gIEBPdXRwdXQoJ2Nka09ic2VydmVDb250ZW50JykgcmVhZG9ubHkgZXZlbnQgPSBuZXcgRXZlbnRFbWl0dGVyPE11dGF0aW9uUmVjb3JkW10+KCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb2JzZXJ2aW5nIGNvbnRlbnQgaXMgZGlzYWJsZWQuIFRoaXMgb3B0aW9uIGNhbiBiZSB1c2VkXG4gICAqIHRvIGRpc2Nvbm5lY3QgdGhlIHVuZGVybHlpbmcgTXV0YXRpb25PYnNlcnZlciB1bnRpbCBpdCBpcyBuZWVkZWQuXG4gICAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrT2JzZXJ2ZUNvbnRlbnREaXNhYmxlZCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgICB0aGlzLl9kaXNhYmxlZCA/IHRoaXMuX3Vuc3Vic2NyaWJlKCkgOiB0aGlzLl9zdWJzY3JpYmUoKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBEZWJvdW5jZSBpbnRlcnZhbCBmb3IgZW1pdHRpbmcgdGhlIGNoYW5nZXMuICovXG4gIEBJbnB1dCgpXG4gIGdldCBkZWJvdW5jZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9kZWJvdW5jZTtcbiAgfVxuICBzZXQgZGVib3VuY2UodmFsdWU6IE51bWJlcklucHV0KSB7XG4gICAgdGhpcy5fZGVib3VuY2UgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7XG4gICAgdGhpcy5fc3Vic2NyaWJlKCk7XG4gIH1cbiAgcHJpdmF0ZSBfZGVib3VuY2U6IG51bWJlcjtcblxuICBwcml2YXRlIF9jdXJyZW50U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jb250ZW50T2JzZXJ2ZXI6IENvbnRlbnRPYnNlcnZlcixcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRTdWJzY3JpcHRpb24gJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZSgpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmUoKSB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmUoKTtcbiAgICBjb25zdCBzdHJlYW0gPSB0aGlzLl9jb250ZW50T2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLl9lbGVtZW50UmVmKTtcblxuICAgIHRoaXMuX2N1cnJlbnRTdWJzY3JpcHRpb24gPSAoXG4gICAgICB0aGlzLmRlYm91bmNlID8gc3RyZWFtLnBpcGUoZGVib3VuY2VUaW1lKHRoaXMuZGVib3VuY2UpKSA6IHN0cmVhbVxuICAgICkuc3Vic2NyaWJlKHRoaXMuZXZlbnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmUoKSB7XG4gICAgdGhpcy5fY3VycmVudFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgfVxufVxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ2RrT2JzZXJ2ZUNvbnRlbnRdLFxuICBleHBvcnRzOiBbQ2RrT2JzZXJ2ZUNvbnRlbnRdLFxuICBwcm92aWRlcnM6IFtNdXRhdGlvbk9ic2VydmVyRmFjdG9yeV0sXG59KVxuZXhwb3J0IGNsYXNzIE9ic2VydmVyc01vZHVsZSB7fVxuIl19