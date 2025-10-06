/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { MatCard, MatCardActions, MatCardAvatar, MatCardContent, MatCardFooter, MatCardHeader, MatCardImage, MatCardLgImage, MatCardMdImage, MatCardSmImage, MatCardSubtitle, MatCardTitle, MatCardTitleGroup, MatCardXlImage, } from './card';
import * as i0 from "@angular/core";
const CARD_DIRECTIVES = [
    MatCard,
    MatCardActions,
    MatCardAvatar,
    MatCardContent,
    MatCardFooter,
    MatCardHeader,
    MatCardImage,
    MatCardLgImage,
    MatCardMdImage,
    MatCardSmImage,
    MatCardSubtitle,
    MatCardTitle,
    MatCardTitleGroup,
    MatCardXlImage,
];
export class MatCardModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardModule, imports: [MatCommonModule, CommonModule, MatCard,
            MatCardActions,
            MatCardAvatar,
            MatCardContent,
            MatCardFooter,
            MatCardHeader,
            MatCardImage,
            MatCardLgImage,
            MatCardMdImage,
            MatCardSmImage,
            MatCardSubtitle,
            MatCardTitle,
            MatCardTitleGroup,
            MatCardXlImage], exports: [MatCard,
            MatCardActions,
            MatCardAvatar,
            MatCardContent,
            MatCardFooter,
            MatCardHeader,
            MatCardImage,
            MatCardLgImage,
            MatCardMdImage,
            MatCardSmImage,
            MatCardSubtitle,
            MatCardTitle,
            MatCardTitleGroup,
            MatCardXlImage, MatCommonModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardModule, imports: [MatCommonModule, CommonModule, MatCommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [MatCommonModule, CommonModule, ...CARD_DIRECTIVES],
                    exports: [CARD_DIRECTIVES, MatCommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NhcmQvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQ0wsT0FBTyxFQUNQLGNBQWMsRUFDZCxhQUFhLEVBQ2IsY0FBYyxFQUNkLGFBQWEsRUFDYixhQUFhLEVBQ2IsWUFBWSxFQUNaLGNBQWMsRUFDZCxjQUFjLEVBQ2QsY0FBYyxFQUNkLGVBQWUsRUFDZixZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLGNBQWMsR0FDZixNQUFNLFFBQVEsQ0FBQzs7QUFFaEIsTUFBTSxlQUFlLEdBQUc7SUFDdEIsT0FBTztJQUNQLGNBQWM7SUFDZCxhQUFhO0lBQ2IsY0FBYztJQUNkLGFBQWE7SUFDYixhQUFhO0lBQ2IsWUFBWTtJQUNaLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGVBQWU7SUFDZixZQUFZO0lBQ1osaUJBQWlCO0lBQ2pCLGNBQWM7Q0FDZixDQUFDO0FBTUYsTUFBTSxPQUFPLGFBQWE7cUhBQWIsYUFBYTtzSEFBYixhQUFhLFlBSGQsZUFBZSxFQUFFLFlBQVksRUFqQnZDLE9BQU87WUFDUCxjQUFjO1lBQ2QsYUFBYTtZQUNiLGNBQWM7WUFDZCxhQUFhO1lBQ2IsYUFBYTtZQUNiLFlBQVk7WUFDWixjQUFjO1lBQ2QsY0FBYztZQUNkLGNBQWM7WUFDZCxlQUFlO1lBQ2YsWUFBWTtZQUNaLGlCQUFpQjtZQUNqQixjQUFjLGFBYmQsT0FBTztZQUNQLGNBQWM7WUFDZCxhQUFhO1lBQ2IsY0FBYztZQUNkLGFBQWE7WUFDYixhQUFhO1lBQ2IsWUFBWTtZQUNaLGNBQWM7WUFDZCxjQUFjO1lBQ2QsY0FBYztZQUNkLGVBQWU7WUFDZixZQUFZO1lBQ1osaUJBQWlCO1lBQ2pCLGNBQWMsRUFLYSxlQUFlO3NIQUUvQixhQUFhLFlBSGQsZUFBZSxFQUFFLFlBQVksRUFDWixlQUFlOztrR0FFL0IsYUFBYTtrQkFKekIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsWUFBWSxFQUFFLEdBQUcsZUFBZSxDQUFDO29CQUM1RCxPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDO2lCQUM1QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtcbiAgTWF0Q2FyZCxcbiAgTWF0Q2FyZEFjdGlvbnMsXG4gIE1hdENhcmRBdmF0YXIsXG4gIE1hdENhcmRDb250ZW50LFxuICBNYXRDYXJkRm9vdGVyLFxuICBNYXRDYXJkSGVhZGVyLFxuICBNYXRDYXJkSW1hZ2UsXG4gIE1hdENhcmRMZ0ltYWdlLFxuICBNYXRDYXJkTWRJbWFnZSxcbiAgTWF0Q2FyZFNtSW1hZ2UsXG4gIE1hdENhcmRTdWJ0aXRsZSxcbiAgTWF0Q2FyZFRpdGxlLFxuICBNYXRDYXJkVGl0bGVHcm91cCxcbiAgTWF0Q2FyZFhsSW1hZ2UsXG59IGZyb20gJy4vY2FyZCc7XG5cbmNvbnN0IENBUkRfRElSRUNUSVZFUyA9IFtcbiAgTWF0Q2FyZCxcbiAgTWF0Q2FyZEFjdGlvbnMsXG4gIE1hdENhcmRBdmF0YXIsXG4gIE1hdENhcmRDb250ZW50LFxuICBNYXRDYXJkRm9vdGVyLFxuICBNYXRDYXJkSGVhZGVyLFxuICBNYXRDYXJkSW1hZ2UsXG4gIE1hdENhcmRMZ0ltYWdlLFxuICBNYXRDYXJkTWRJbWFnZSxcbiAgTWF0Q2FyZFNtSW1hZ2UsXG4gIE1hdENhcmRTdWJ0aXRsZSxcbiAgTWF0Q2FyZFRpdGxlLFxuICBNYXRDYXJkVGl0bGVHcm91cCxcbiAgTWF0Q2FyZFhsSW1hZ2UsXG5dO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbTWF0Q29tbW9uTW9kdWxlLCBDb21tb25Nb2R1bGUsIC4uLkNBUkRfRElSRUNUSVZFU10sXG4gIGV4cG9ydHM6IFtDQVJEX0RJUkVDVElWRVMsIE1hdENvbW1vbk1vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRNb2R1bGUge31cbiJdfQ==