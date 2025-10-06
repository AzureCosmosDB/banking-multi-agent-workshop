/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ENTER } from '@angular/cdk/keycodes';
import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatChip } from './chip';
import { MAT_CHIPS_DEFAULT_OPTIONS } from './tokens';
import { MatChipEditInput } from './chip-edit-input';
import { MatChipGrid } from './chip-grid';
import { MatChipAvatar, MatChipRemove, MatChipTrailingIcon } from './chip-icons';
import { MatChipInput } from './chip-input';
import { MatChipListbox } from './chip-listbox';
import { MatChipRow } from './chip-row';
import { MatChipOption } from './chip-option';
import { MatChipSet } from './chip-set';
import { MatChipAction } from './chip-action';
import * as i0 from "@angular/core";
const CHIP_DECLARATIONS = [
    MatChip,
    MatChipAvatar,
    MatChipEditInput,
    MatChipGrid,
    MatChipInput,
    MatChipListbox,
    MatChipOption,
    MatChipRemove,
    MatChipRow,
    MatChipSet,
    MatChipTrailingIcon,
];
export class MatChipsModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipsModule, imports: [MatCommonModule, MatRippleModule, MatChipAction, MatChip,
            MatChipAvatar,
            MatChipEditInput,
            MatChipGrid,
            MatChipInput,
            MatChipListbox,
            MatChipOption,
            MatChipRemove,
            MatChipRow,
            MatChipSet,
            MatChipTrailingIcon], exports: [MatCommonModule, MatChip,
            MatChipAvatar,
            MatChipEditInput,
            MatChipGrid,
            MatChipInput,
            MatChipListbox,
            MatChipOption,
            MatChipRemove,
            MatChipRow,
            MatChipSet,
            MatChipTrailingIcon] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipsModule, providers: [
            ErrorStateMatcher,
            {
                provide: MAT_CHIPS_DEFAULT_OPTIONS,
                useValue: {
                    separatorKeyCodes: [ENTER],
                },
            },
        ], imports: [MatCommonModule, MatRippleModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatChipsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, MatRippleModule, MatChipAction, CHIP_DECLARATIONS],
                    exports: [MatCommonModule, CHIP_DECLARATIONS],
                    providers: [
                        ErrorStateMatcher,
                        {
                            provide: MAT_CHIPS_DEFAULT_OPTIONS,
                            useValue: {
                                separatorKeyCodes: [ENTER],
                            },
                        },
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NoaXBzL21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzNGLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDL0IsT0FBTyxFQUFDLHlCQUF5QixFQUF5QixNQUFNLFVBQVUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQy9FLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBRTVDLE1BQU0saUJBQWlCLEdBQUc7SUFDeEIsT0FBTztJQUNQLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsV0FBVztJQUNYLFlBQVk7SUFDWixjQUFjO0lBQ2QsYUFBYTtJQUNiLGFBQWE7SUFDYixVQUFVO0lBQ1YsVUFBVTtJQUNWLG1CQUFtQjtDQUNwQixDQUFDO0FBZUYsTUFBTSxPQUFPLGNBQWM7cUhBQWQsY0FBYztzSEFBZCxjQUFjLFlBWmYsZUFBZSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBZHpELE9BQU87WUFDUCxhQUFhO1lBQ2IsZ0JBQWdCO1lBQ2hCLFdBQVc7WUFDWCxZQUFZO1lBQ1osY0FBYztZQUNkLGFBQWE7WUFDYixhQUFhO1lBQ2IsVUFBVTtZQUNWLFVBQVU7WUFDVixtQkFBbUIsYUFLVCxlQUFlLEVBZnpCLE9BQU87WUFDUCxhQUFhO1lBQ2IsZ0JBQWdCO1lBQ2hCLFdBQVc7WUFDWCxZQUFZO1lBQ1osY0FBYztZQUNkLGFBQWE7WUFDYixhQUFhO1lBQ2IsVUFBVTtZQUNWLFVBQVU7WUFDVixtQkFBbUI7c0hBZ0JSLGNBQWMsYUFWZDtZQUNULGlCQUFpQjtZQUNqQjtnQkFDRSxPQUFPLEVBQUUseUJBQXlCO2dCQUNsQyxRQUFRLEVBQUU7b0JBQ1IsaUJBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUM7aUJBQ0Q7YUFDNUI7U0FDRixZQVZTLGVBQWUsRUFBRSxlQUFlLEVBQ2hDLGVBQWU7O2tHQVdkLGNBQWM7a0JBYjFCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUM7b0JBQzdFLE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQztvQkFDN0MsU0FBUyxFQUFFO3dCQUNULGlCQUFpQjt3QkFDakI7NEJBQ0UsT0FBTyxFQUFFLHlCQUF5Qjs0QkFDbEMsUUFBUSxFQUFFO2dDQUNSLGlCQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDOzZCQUNEO3lCQUM1QjtxQkFDRjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VOVEVSfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Vycm9yU3RhdGVNYXRjaGVyLCBNYXRDb21tb25Nb2R1bGUsIE1hdFJpcHBsZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge01hdENoaXB9IGZyb20gJy4vY2hpcCc7XG5pbXBvcnQge01BVF9DSElQU19ERUZBVUxUX09QVElPTlMsIE1hdENoaXBzRGVmYXVsdE9wdGlvbnN9IGZyb20gJy4vdG9rZW5zJztcbmltcG9ydCB7TWF0Q2hpcEVkaXRJbnB1dH0gZnJvbSAnLi9jaGlwLWVkaXQtaW5wdXQnO1xuaW1wb3J0IHtNYXRDaGlwR3JpZH0gZnJvbSAnLi9jaGlwLWdyaWQnO1xuaW1wb3J0IHtNYXRDaGlwQXZhdGFyLCBNYXRDaGlwUmVtb3ZlLCBNYXRDaGlwVHJhaWxpbmdJY29ufSBmcm9tICcuL2NoaXAtaWNvbnMnO1xuaW1wb3J0IHtNYXRDaGlwSW5wdXR9IGZyb20gJy4vY2hpcC1pbnB1dCc7XG5pbXBvcnQge01hdENoaXBMaXN0Ym94fSBmcm9tICcuL2NoaXAtbGlzdGJveCc7XG5pbXBvcnQge01hdENoaXBSb3d9IGZyb20gJy4vY2hpcC1yb3cnO1xuaW1wb3J0IHtNYXRDaGlwT3B0aW9ufSBmcm9tICcuL2NoaXAtb3B0aW9uJztcbmltcG9ydCB7TWF0Q2hpcFNldH0gZnJvbSAnLi9jaGlwLXNldCc7XG5pbXBvcnQge01hdENoaXBBY3Rpb259IGZyb20gJy4vY2hpcC1hY3Rpb24nO1xuXG5jb25zdCBDSElQX0RFQ0xBUkFUSU9OUyA9IFtcbiAgTWF0Q2hpcCxcbiAgTWF0Q2hpcEF2YXRhcixcbiAgTWF0Q2hpcEVkaXRJbnB1dCxcbiAgTWF0Q2hpcEdyaWQsXG4gIE1hdENoaXBJbnB1dCxcbiAgTWF0Q2hpcExpc3Rib3gsXG4gIE1hdENoaXBPcHRpb24sXG4gIE1hdENoaXBSZW1vdmUsXG4gIE1hdENoaXBSb3csXG4gIE1hdENoaXBTZXQsXG4gIE1hdENoaXBUcmFpbGluZ0ljb24sXG5dO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTWF0Q29tbW9uTW9kdWxlLCBNYXRSaXBwbGVNb2R1bGUsIE1hdENoaXBBY3Rpb24sIENISVBfREVDTEFSQVRJT05TXSxcbiAgZXhwb3J0czogW01hdENvbW1vbk1vZHVsZSwgQ0hJUF9ERUNMQVJBVElPTlNdLFxuICBwcm92aWRlcnM6IFtcbiAgICBFcnJvclN0YXRlTWF0Y2hlcixcbiAgICB7XG4gICAgICBwcm92aWRlOiBNQVRfQ0hJUFNfREVGQVVMVF9PUFRJT05TLFxuICAgICAgdXNlVmFsdWU6IHtcbiAgICAgICAgc2VwYXJhdG9yS2V5Q29kZXM6IFtFTlRFUl0sXG4gICAgICB9IGFzIE1hdENoaXBzRGVmYXVsdE9wdGlvbnMsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2hpcHNNb2R1bGUge31cbiJdfQ==