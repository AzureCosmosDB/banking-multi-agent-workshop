/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, InjectionToken, Input, booleanAttribute, } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Used to generate unique ID for each accordion. */
let nextId = 0;
/**
 * Injection token that can be used to reference instances of `CdkAccordion`. It serves
 * as alternative token to the actual `CdkAccordion` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_ACCORDION = new InjectionToken('CdkAccordion');
/**
 * Directive whose purpose is to manage the expanded state of CdkAccordionItem children.
 */
export class CdkAccordion {
    constructor() {
        /** Emits when the state of the accordion changes */
        this._stateChanges = new Subject();
        /** Stream that emits true/false when openAll/closeAll is triggered. */
        this._openCloseAllActions = new Subject();
        /** A readonly id value to use for unique selection coordination. */
        this.id = `cdk-accordion-${nextId++}`;
        /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
        this.multi = false;
    }
    /** Opens all enabled accordion items in an accordion where multi is enabled. */
    openAll() {
        if (this.multi) {
            this._openCloseAllActions.next(true);
        }
    }
    /** Closes all enabled accordion items. */
    closeAll() {
        this._openCloseAllActions.next(false);
    }
    ngOnChanges(changes) {
        this._stateChanges.next(changes);
    }
    ngOnDestroy() {
        this._stateChanges.complete();
        this._openCloseAllActions.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkAccordion, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkAccordion, isStandalone: true, selector: "cdk-accordion, [cdkAccordion]", inputs: { multi: ["multi", "multi", booleanAttribute] }, providers: [{ provide: CDK_ACCORDION, useExisting: CdkAccordion }], exportAs: ["cdkAccordion"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkAccordion, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-accordion, [cdkAccordion]',
                    exportAs: 'cdkAccordion',
                    providers: [{ provide: CDK_ACCORDION, useExisting: CdkAccordion }],
                    standalone: true,
                }]
        }], propDecorators: { multi: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsY0FBYyxFQUNkLEtBQUssRUFJTCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQzs7QUFFN0IscURBQXFEO0FBQ3JELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxjQUFjLENBQWUsY0FBYyxDQUFDLENBQUM7QUFFOUU7O0dBRUc7QUFPSCxNQUFNLE9BQU8sWUFBWTtJQU56QjtRQU9FLG9EQUFvRDtRQUMzQyxrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFpQixDQUFDO1FBRXRELHVFQUF1RTtRQUM5RCx5QkFBb0IsR0FBcUIsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUV6RSxvRUFBb0U7UUFDM0QsT0FBRSxHQUFXLGlCQUFpQixNQUFNLEVBQUUsRUFBRSxDQUFDO1FBRWxELDJGQUEyRjtRQUNyRCxVQUFLLEdBQVksS0FBSyxDQUFDO0tBc0I5RDtJQXBCQyxnRkFBZ0Y7SUFDaEYsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQUVELDBDQUEwQztJQUMxQyxRQUFRO1FBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkMsQ0FBQztxSEFoQ1UsWUFBWTt5R0FBWixZQUFZLHFHQVdKLGdCQUFnQixnQkFkeEIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBQyxDQUFDOztrR0FHckQsWUFBWTtrQkFOeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsK0JBQStCO29CQUN6QyxRQUFRLEVBQUUsY0FBYztvQkFDeEIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsY0FBYyxFQUFDLENBQUM7b0JBQ2hFLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs4QkFZdUMsS0FBSztzQkFBMUMsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIFNpbXBsZUNoYW5nZXMsXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEIGZvciBlYWNoIGFjY29yZGlvbi4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0FjY29yZGlvbmAuIEl0IHNlcnZlc1xuICogYXMgYWx0ZXJuYXRpdmUgdG9rZW4gdG8gdGhlIGFjdHVhbCBgQ2RrQWNjb3JkaW9uYCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IENES19BQ0NPUkRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrQWNjb3JkaW9uPignQ2RrQWNjb3JkaW9uJyk7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdob3NlIHB1cnBvc2UgaXMgdG8gbWFuYWdlIHRoZSBleHBhbmRlZCBzdGF0ZSBvZiBDZGtBY2NvcmRpb25JdGVtIGNoaWxkcmVuLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstYWNjb3JkaW9uLCBbY2RrQWNjb3JkaW9uXScsXG4gIGV4cG9ydEFzOiAnY2RrQWNjb3JkaW9uJyxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENES19BQ0NPUkRJT04sIHVzZUV4aXN0aW5nOiBDZGtBY2NvcmRpb259XSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQWNjb3JkaW9uIGltcGxlbWVudHMgT25EZXN0cm95LCBPbkNoYW5nZXMge1xuICAvKiogRW1pdHMgd2hlbiB0aGUgc3RhdGUgb2YgdGhlIGFjY29yZGlvbiBjaGFuZ2VzICovXG4gIHJlYWRvbmx5IF9zdGF0ZUNoYW5nZXMgPSBuZXcgU3ViamVjdDxTaW1wbGVDaGFuZ2VzPigpO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB0cnVlL2ZhbHNlIHdoZW4gb3BlbkFsbC9jbG9zZUFsbCBpcyB0cmlnZ2VyZWQuICovXG4gIHJlYWRvbmx5IF9vcGVuQ2xvc2VBbGxBY3Rpb25zOiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcblxuICAvKiogQSByZWFkb25seSBpZCB2YWx1ZSB0byB1c2UgZm9yIHVuaXF1ZSBzZWxlY3Rpb24gY29vcmRpbmF0aW9uLiAqL1xuICByZWFkb25seSBpZDogc3RyaW5nID0gYGNkay1hY2NvcmRpb24tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBhY2NvcmRpb24gc2hvdWxkIGFsbG93IG11bHRpcGxlIGV4cGFuZGVkIGFjY29yZGlvbiBpdGVtcyBzaW11bHRhbmVvdXNseS4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBtdWx0aTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBPcGVucyBhbGwgZW5hYmxlZCBhY2NvcmRpb24gaXRlbXMgaW4gYW4gYWNjb3JkaW9uIHdoZXJlIG11bHRpIGlzIGVuYWJsZWQuICovXG4gIG9wZW5BbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubXVsdGkpIHtcbiAgICAgIHRoaXMuX29wZW5DbG9zZUFsbEFjdGlvbnMubmV4dCh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2VzIGFsbCBlbmFibGVkIGFjY29yZGlvbiBpdGVtcy4gKi9cbiAgY2xvc2VBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlbkNsb3NlQWxsQWN0aW9ucy5uZXh0KGZhbHNlKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMubmV4dChjaGFuZ2VzKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX29wZW5DbG9zZUFsbEFjdGlvbnMuY29tcGxldGUoKTtcbiAgfVxufVxuIl19