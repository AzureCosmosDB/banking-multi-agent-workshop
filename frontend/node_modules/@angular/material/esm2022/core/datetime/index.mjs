/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { DateAdapter } from './date-adapter';
import { MAT_DATE_FORMATS } from './date-formats';
import { NativeDateAdapter } from './native-date-adapter';
import { MAT_NATIVE_DATE_FORMATS } from './native-date-formats';
import * as i0 from "@angular/core";
export * from './date-adapter';
export * from './date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';
export class NativeDateModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: NativeDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: NativeDateModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: NativeDateModule, providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: NativeDateModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
                }]
        }] });
export class MatNativeDateModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatNativeDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatNativeDateModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatNativeDateModule, providers: [provideNativeDateAdapter()] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatNativeDateModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [provideNativeDateAdapter()],
                }]
        }] });
export function provideNativeDateAdapter(formats = MAT_NATIVE_DATE_FORMATS) {
    return [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: formats },
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY29yZS9kYXRldGltZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQWlCLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBRTlELGNBQWMsZ0JBQWdCLENBQUM7QUFDL0IsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLHVCQUF1QixDQUFDO0FBQ3RDLGNBQWMsdUJBQXVCLENBQUM7QUFLdEMsTUFBTSxPQUFPLGdCQUFnQjtxSEFBaEIsZ0JBQWdCO3NIQUFoQixnQkFBZ0I7c0hBQWhCLGdCQUFnQixhQUZoQixDQUFDLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQzs7a0dBRXJELGdCQUFnQjtrQkFINUIsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFDLENBQUM7aUJBQ2pFOztBQU1ELE1BQU0sT0FBTyxtQkFBbUI7cUhBQW5CLG1CQUFtQjtzSEFBbkIsbUJBQW1CO3NIQUFuQixtQkFBbUIsYUFGbkIsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDOztrR0FFNUIsbUJBQW1CO2tCQUgvQixRQUFRO21CQUFDO29CQUNSLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLENBQUM7aUJBQ3hDOztBQUdELE1BQU0sVUFBVSx3QkFBd0IsQ0FDdEMsVUFBMEIsdUJBQXVCO0lBRWpELE9BQU87UUFDTCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFDO1FBQ25ELEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUM7S0FDL0MsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZSwgUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEYXRlQWRhcHRlcn0gZnJvbSAnLi9kYXRlLWFkYXB0ZXInO1xuaW1wb3J0IHtNQVRfREFURV9GT1JNQVRTLCBNYXREYXRlRm9ybWF0c30gZnJvbSAnLi9kYXRlLWZvcm1hdHMnO1xuaW1wb3J0IHtOYXRpdmVEYXRlQWRhcHRlcn0gZnJvbSAnLi9uYXRpdmUtZGF0ZS1hZGFwdGVyJztcbmltcG9ydCB7TUFUX05BVElWRV9EQVRFX0ZPUk1BVFN9IGZyb20gJy4vbmF0aXZlLWRhdGUtZm9ybWF0cyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vZGF0ZS1hZGFwdGVyJztcbmV4cG9ydCAqIGZyb20gJy4vZGF0ZS1mb3JtYXRzJztcbmV4cG9ydCAqIGZyb20gJy4vbmF0aXZlLWRhdGUtYWRhcHRlcic7XG5leHBvcnQgKiBmcm9tICcuL25hdGl2ZS1kYXRlLWZvcm1hdHMnO1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogRGF0ZUFkYXB0ZXIsIHVzZUNsYXNzOiBOYXRpdmVEYXRlQWRhcHRlcn1dLFxufSlcbmV4cG9ydCBjbGFzcyBOYXRpdmVEYXRlTW9kdWxlIHt9XG5cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW3Byb3ZpZGVOYXRpdmVEYXRlQWRhcHRlcigpXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TmF0aXZlRGF0ZU1vZHVsZSB7fVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU5hdGl2ZURhdGVBZGFwdGVyKFxuICBmb3JtYXRzOiBNYXREYXRlRm9ybWF0cyA9IE1BVF9OQVRJVkVfREFURV9GT1JNQVRTLFxuKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAge3Byb3ZpZGU6IERhdGVBZGFwdGVyLCB1c2VDbGFzczogTmF0aXZlRGF0ZUFkYXB0ZXJ9LFxuICAgIHtwcm92aWRlOiBNQVRfREFURV9GT1JNQVRTLCB1c2VWYWx1ZTogZm9ybWF0c30sXG4gIF07XG59XG4iXX0=