/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, booleanAttribute } from '@angular/core';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/** Base class providing checked state for selectable MenuItems. */
export class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        /** Whether the element is checked */
        this.checked = false;
        /** Whether the item should close the menu if triggered by the spacebar. */
        this.closeOnSpacebarTrigger = false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkMenuItemSelectable, isStandalone: true, inputs: { checked: ["cdkMenuItemChecked", "checked", booleanAttribute] }, host: { properties: { "attr.aria-checked": "!!checked", "attr.aria-disabled": "disabled || null" } }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-checked]': '!!checked',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                    standalone: true,
                }]
        }], propDecorators: { checked: [{
                type: Input,
                args: [{ alias: 'cdkMenuItemChecked', transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS1pdGVtLXNlbGVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFFeEMsbUVBQW1FO0FBUW5FLE1BQU0sT0FBZ0IscUJBQXNCLFNBQVEsV0FBVztJQVAvRDs7UUFRRSxxQ0FBcUM7UUFDOEIsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUU1RiwyRUFBMkU7UUFDeEQsMkJBQXNCLEdBQUcsS0FBSyxDQUFDO0tBQ25EO3FIQU5xQixxQkFBcUI7eUdBQXJCLHFCQUFxQiwyRUFFTyxnQkFBZ0I7O2tHQUY1QyxxQkFBcUI7a0JBUDFDLFNBQVM7bUJBQUM7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLHFCQUFxQixFQUFFLFdBQVc7d0JBQ2xDLHNCQUFzQixFQUFFLGtCQUFrQjtxQkFDM0M7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzhCQUdvRSxPQUFPO3NCQUF6RSxLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXQsIGJvb2xlYW5BdHRyaWJ1dGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKiogQmFzZSBjbGFzcyBwcm92aWRpbmcgY2hlY2tlZCBzdGF0ZSBmb3Igc2VsZWN0YWJsZSBNZW51SXRlbXMuICovXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLWNoZWNrZWRdJzogJyEhY2hlY2tlZCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDZGtNZW51SXRlbVNlbGVjdGFibGUgZXh0ZW5kcyBDZGtNZW51SXRlbSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGNoZWNrZWQgKi9cbiAgQElucHV0KHthbGlhczogJ2Nka01lbnVJdGVtQ2hlY2tlZCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGNoZWNrZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgaXRlbSBzaG91bGQgY2xvc2UgdGhlIG1lbnUgaWYgdHJpZ2dlcmVkIGJ5IHRoZSBzcGFjZWJhci4gKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNsb3NlT25TcGFjZWJhclRyaWdnZXIgPSBmYWxzZTtcbn1cbiJdfQ==