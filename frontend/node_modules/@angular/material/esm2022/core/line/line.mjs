/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule, Directive } from '@angular/core';
import { startWith } from 'rxjs/operators';
import { MatCommonModule } from '../common-behaviors/common-module';
import * as i0 from "@angular/core";
/**
 * Shared directive to count lines inside a text area, such as a list item.
 * Line elements can be extracted with a @ContentChildren(MatLine) query, then
 * counted by checking the query list's length.
 */
export class MatLine {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLine, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatLine, isStandalone: true, selector: "[mat-line], [matLine]", host: { classAttribute: "mat-line" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLine, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-line], [matLine]',
                    host: { 'class': 'mat-line' },
                    standalone: true,
                }]
        }] });
/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 */
export function setLines(lines, element, prefix = 'mat') {
    // Note: doesn't need to unsubscribe, because `changes`
    // gets completed by Angular when the view is destroyed.
    lines.changes.pipe(startWith(lines)).subscribe(({ length }) => {
        setClass(element, `${prefix}-2-line`, false);
        setClass(element, `${prefix}-3-line`, false);
        setClass(element, `${prefix}-multi-line`, false);
        if (length === 2 || length === 3) {
            setClass(element, `${prefix}-${length}-line`, true);
        }
        else if (length > 3) {
            setClass(element, `${prefix}-multi-line`, true);
        }
    });
}
/** Adds or removes a class from an element. */
function setClass(element, className, isAdd) {
    element.nativeElement.classList.toggle(className, isAdd);
}
export class MatLineModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLineModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLineModule, imports: [MatCommonModule, MatLine], exports: [MatLine, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLineModule, imports: [MatCommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatLineModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, MatLine],
                    exports: [MatLine, MatCommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL2xpbmUvbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBd0IsTUFBTSxlQUFlLENBQUM7QUFDekUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQzs7QUFFbEU7Ozs7R0FJRztBQU1ILE1BQU0sT0FBTyxPQUFPO3FIQUFQLE9BQU87eUdBQVAsT0FBTzs7a0dBQVAsT0FBTztrQkFMbkIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxJQUFJLEVBQUUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDO29CQUMzQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBR0Q7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFFBQVEsQ0FDdEIsS0FBeUIsRUFDekIsT0FBZ0MsRUFDaEMsTUFBTSxHQUFHLEtBQUs7SUFFZCx1REFBdUQ7SUFDdkQsd0RBQXdEO0lBQ3hELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLEVBQUUsRUFBRTtRQUMxRCxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsTUFBTSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVqRCxJQUFJLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLElBQUksTUFBTSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQzthQUFNLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3RCLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsK0NBQStDO0FBQy9DLFNBQVMsUUFBUSxDQUFDLE9BQWdDLEVBQUUsU0FBaUIsRUFBRSxLQUFjO0lBQ25GLE9BQU8sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQU1ELE1BQU0sT0FBTyxhQUFhO3FIQUFiLGFBQWE7c0hBQWIsYUFBYSxZQUhkLGVBQWUsRUFoQ2QsT0FBTyxhQUFQLE9BQU8sRUFpQ0MsZUFBZTtzSEFFdkIsYUFBYSxZQUhkLGVBQWUsRUFDTixlQUFlOztrR0FFdkIsYUFBYTtrQkFKekIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDO29CQUNuQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO2lCQUNwQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIFF1ZXJ5TGlzdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3N0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtNYXRDb21tb25Nb2R1bGV9IGZyb20gJy4uL2NvbW1vbi1iZWhhdmlvcnMvY29tbW9uLW1vZHVsZSc7XG5cbi8qKlxuICogU2hhcmVkIGRpcmVjdGl2ZSB0byBjb3VudCBsaW5lcyBpbnNpZGUgYSB0ZXh0IGFyZWEsIHN1Y2ggYXMgYSBsaXN0IGl0ZW0uXG4gKiBMaW5lIGVsZW1lbnRzIGNhbiBiZSBleHRyYWN0ZWQgd2l0aCBhIEBDb250ZW50Q2hpbGRyZW4oTWF0TGluZSkgcXVlcnksIHRoZW5cbiAqIGNvdW50ZWQgYnkgY2hlY2tpbmcgdGhlIHF1ZXJ5IGxpc3QncyBsZW5ndGguXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXQtbGluZV0sIFttYXRMaW5lXScsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LWxpbmUnfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TGluZSB7fVxuXG4vKipcbiAqIEhlbHBlciB0aGF0IHRha2VzIGEgcXVlcnkgbGlzdCBvZiBsaW5lcyBhbmQgc2V0cyB0aGUgY29ycmVjdCBjbGFzcyBvbiB0aGUgaG9zdC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldExpbmVzKFxuICBsaW5lczogUXVlcnlMaXN0PHVua25vd24+LFxuICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgcHJlZml4ID0gJ21hdCcsXG4pIHtcbiAgLy8gTm90ZTogZG9lc24ndCBuZWVkIHRvIHVuc3Vic2NyaWJlLCBiZWNhdXNlIGBjaGFuZ2VzYFxuICAvLyBnZXRzIGNvbXBsZXRlZCBieSBBbmd1bGFyIHdoZW4gdGhlIHZpZXcgaXMgZGVzdHJveWVkLlxuICBsaW5lcy5jaGFuZ2VzLnBpcGUoc3RhcnRXaXRoKGxpbmVzKSkuc3Vic2NyaWJlKCh7bGVuZ3RofSkgPT4ge1xuICAgIHNldENsYXNzKGVsZW1lbnQsIGAke3ByZWZpeH0tMi1saW5lYCwgZmFsc2UpO1xuICAgIHNldENsYXNzKGVsZW1lbnQsIGAke3ByZWZpeH0tMy1saW5lYCwgZmFsc2UpO1xuICAgIHNldENsYXNzKGVsZW1lbnQsIGAke3ByZWZpeH0tbXVsdGktbGluZWAsIGZhbHNlKTtcblxuICAgIGlmIChsZW5ndGggPT09IDIgfHwgbGVuZ3RoID09PSAzKSB7XG4gICAgICBzZXRDbGFzcyhlbGVtZW50LCBgJHtwcmVmaXh9LSR7bGVuZ3RofS1saW5lYCwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChsZW5ndGggPiAzKSB7XG4gICAgICBzZXRDbGFzcyhlbGVtZW50LCBgJHtwcmVmaXh9LW11bHRpLWxpbmVgLCB0cnVlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKiogQWRkcyBvciByZW1vdmVzIGEgY2xhc3MgZnJvbSBhbiBlbGVtZW50LiAqL1xuZnVuY3Rpb24gc2V0Q2xhc3MoZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIGNsYXNzTmFtZTogc3RyaW5nLCBpc0FkZDogYm9vbGVhbik6IHZvaWQge1xuICBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUsIGlzQWRkKTtcbn1cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW01hdENvbW1vbk1vZHVsZSwgTWF0TGluZV0sXG4gIGV4cG9ydHM6IFtNYXRMaW5lLCBNYXRDb21tb25Nb2R1bGVdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRMaW5lTW9kdWxlIHt9XG4iXX0=