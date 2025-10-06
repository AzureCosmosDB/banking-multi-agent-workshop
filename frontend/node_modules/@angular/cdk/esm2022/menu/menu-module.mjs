/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkMenu } from './menu';
import { CdkMenuBar } from './menu-bar';
import { CdkMenuItem } from './menu-item';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuItemRadio } from './menu-item-radio';
import { CdkMenuItemCheckbox } from './menu-item-checkbox';
import { CdkMenuTrigger } from './menu-trigger';
import { CdkContextMenuTrigger } from './context-menu-trigger';
import { CdkTargetMenuAim } from './menu-aim';
import * as i0 from "@angular/core";
const MENU_DIRECTIVES = [
    CdkMenuBar,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemRadio,
    CdkMenuItemCheckbox,
    CdkMenuTrigger,
    CdkMenuGroup,
    CdkContextMenuTrigger,
    CdkTargetMenuAim,
];
/** Module that declares components and directives for the CDK menu. */
export class CdkMenuModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, imports: [OverlayModule, CdkMenuBar,
            CdkMenu,
            CdkMenuItem,
            CdkMenuItemRadio,
            CdkMenuItemCheckbox,
            CdkMenuTrigger,
            CdkMenuGroup,
            CdkContextMenuTrigger,
            CdkTargetMenuAim], exports: [CdkMenuBar,
            CdkMenu,
            CdkMenuItem,
            CdkMenuItemRadio,
            CdkMenuItemCheckbox,
            CdkMenuTrigger,
            CdkMenuGroup,
            CdkContextMenuTrigger,
            CdkTargetMenuAim] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, imports: [OverlayModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, ...MENU_DIRECTIVES],
                    exports: MENU_DIRECTIVES,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMvQixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUU1QyxNQUFNLGVBQWUsR0FBRztJQUN0QixVQUFVO0lBQ1YsT0FBTztJQUNQLFdBQVc7SUFDWCxnQkFBZ0I7SUFDaEIsbUJBQW1CO0lBQ25CLGNBQWM7SUFDZCxZQUFZO0lBQ1oscUJBQXFCO0lBQ3JCLGdCQUFnQjtDQUNqQixDQUFDO0FBRUYsdUVBQXVFO0FBS3ZFLE1BQU0sT0FBTyxhQUFhO3FIQUFiLGFBQWE7c0hBQWIsYUFBYSxZQUhkLGFBQWEsRUFidkIsVUFBVTtZQUNWLE9BQU87WUFDUCxXQUFXO1lBQ1gsZ0JBQWdCO1lBQ2hCLG1CQUFtQjtZQUNuQixjQUFjO1lBQ2QsWUFBWTtZQUNaLHFCQUFxQjtZQUNyQixnQkFBZ0IsYUFSaEIsVUFBVTtZQUNWLE9BQU87WUFDUCxXQUFXO1lBQ1gsZ0JBQWdCO1lBQ2hCLG1CQUFtQjtZQUNuQixjQUFjO1lBQ2QsWUFBWTtZQUNaLHFCQUFxQjtZQUNyQixnQkFBZ0I7c0hBUUwsYUFBYSxZQUhkLGFBQWE7O2tHQUdaLGFBQWE7a0JBSnpCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLEdBQUcsZUFBZSxDQUFDO29CQUM1QyxPQUFPLEVBQUUsZUFBZTtpQkFDekIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7Q2RrTWVudX0gZnJvbSAnLi9tZW51JztcbmltcG9ydCB7Q2RrTWVudUJhcn0gZnJvbSAnLi9tZW51LWJhcic7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1SYWRpb30gZnJvbSAnLi9tZW51LWl0ZW0tcmFkaW8nO1xuaW1wb3J0IHtDZGtNZW51SXRlbUNoZWNrYm94fSBmcm9tICcuL21lbnUtaXRlbS1jaGVja2JveCc7XG5pbXBvcnQge0Nka01lbnVUcmlnZ2VyfSBmcm9tICcuL21lbnUtdHJpZ2dlcic7XG5pbXBvcnQge0Nka0NvbnRleHRNZW51VHJpZ2dlcn0gZnJvbSAnLi9jb250ZXh0LW1lbnUtdHJpZ2dlcic7XG5pbXBvcnQge0Nka1RhcmdldE1lbnVBaW19IGZyb20gJy4vbWVudS1haW0nO1xuXG5jb25zdCBNRU5VX0RJUkVDVElWRVMgPSBbXG4gIENka01lbnVCYXIsXG4gIENka01lbnUsXG4gIENka01lbnVJdGVtLFxuICBDZGtNZW51SXRlbVJhZGlvLFxuICBDZGtNZW51SXRlbUNoZWNrYm94LFxuICBDZGtNZW51VHJpZ2dlcixcbiAgQ2RrTWVudUdyb3VwLFxuICBDZGtDb250ZXh0TWVudVRyaWdnZXIsXG4gIENka1RhcmdldE1lbnVBaW0sXG5dO1xuXG4vKiogTW9kdWxlIHRoYXQgZGVjbGFyZXMgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyBmb3IgdGhlIENESyBtZW51LiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW092ZXJsYXlNb2R1bGUsIC4uLk1FTlVfRElSRUNUSVZFU10sXG4gIGV4cG9ydHM6IE1FTlVfRElSRUNUSVZFUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudU1vZHVsZSB7fVxuIl19