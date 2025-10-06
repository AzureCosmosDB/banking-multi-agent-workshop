/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatSlider } from './slider';
import { MatSliderVisualThumb } from './slider-thumb';
import { MatSliderThumb, MatSliderRangeThumb } from './slider-input';
import * as i0 from "@angular/core";
export class MatSliderModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NsaWRlci9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLGNBQWMsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztBQWFuRSxNQUFNLE9BQU8sZUFBZTtxSEFBZixlQUFlO3NIQUFmLGVBQWUsWUFUeEIsZUFBZTtZQUNmLGVBQWU7WUFDZixTQUFTO1lBQ1QsY0FBYztZQUNkLG1CQUFtQjtZQUNuQixvQkFBb0IsYUFFWixTQUFTLEVBQUUsY0FBYyxFQUFFLG1CQUFtQjtzSEFFN0MsZUFBZSxZQVR4QixlQUFlO1lBQ2YsZUFBZTs7a0dBUU4sZUFBZTtrQkFYM0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsZUFBZTt3QkFDZixlQUFlO3dCQUNmLFNBQVM7d0JBQ1QsY0FBYzt3QkFDZCxtQkFBbUI7d0JBQ25CLG9CQUFvQjtxQkFDckI7b0JBQ0QsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQztpQkFDMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENvbW1vbk1vZHVsZSwgTWF0UmlwcGxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0U2xpZGVyfSBmcm9tICcuL3NsaWRlcic7XG5pbXBvcnQge01hdFNsaWRlclZpc3VhbFRodW1ifSBmcm9tICcuL3NsaWRlci10aHVtYic7XG5pbXBvcnQge01hdFNsaWRlclRodW1iLCBNYXRTbGlkZXJSYW5nZVRodW1ifSBmcm9tICcuL3NsaWRlci1pbnB1dCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0UmlwcGxlTW9kdWxlLFxuICAgIE1hdFNsaWRlcixcbiAgICBNYXRTbGlkZXJUaHVtYixcbiAgICBNYXRTbGlkZXJSYW5nZVRodW1iLFxuICAgIE1hdFNsaWRlclZpc3VhbFRodW1iLFxuICBdLFxuICBleHBvcnRzOiBbTWF0U2xpZGVyLCBNYXRTbGlkZXJUaHVtYiwgTWF0U2xpZGVyUmFuZ2VUaHVtYl0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdFNsaWRlck1vZHVsZSB7fVxuIl19