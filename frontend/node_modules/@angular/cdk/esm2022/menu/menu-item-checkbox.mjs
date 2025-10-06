/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
export class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
    /**
     * Toggle the checked state of the checkbox.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this.checked = !this.checked;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemCheckbox, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkMenuItemCheckbox, isStandalone: true, selector: "[cdkMenuItemCheckbox]", host: { attributes: { "role": "menuitemcheckbox" }, properties: { "class.cdk-menu-item-checkbox": "true" } }, providers: [
            { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
            { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
        ], exportAs: ["cdkMenuItemCheckbox"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkMenuItemCheckbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemCheckbox]',
                    exportAs: 'cdkMenuItemCheckbox',
                    standalone: true,
                    host: {
                        'role': 'menuitemcheckbox',
                        '[class.cdk-menu-item-checkbox]': 'true',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtaXRlbS1jaGVja2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzdELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7O0FBRXhDOzs7R0FHRztBQWNILE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxxQkFBcUI7SUFDNUQ7Ozs7T0FJRztJQUNNLE9BQU8sQ0FBQyxPQUE2QjtRQUM1QyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7cUhBWlUsbUJBQW1CO3lHQUFuQixtQkFBbUIsa0xBTG5CO1lBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFDO1lBQ2xFLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7U0FDM0Q7O2tHQUVVLG1CQUFtQjtrQkFiL0IsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxrQkFBa0I7d0JBQzFCLGdDQUFnQyxFQUFFLE1BQU07cUJBQ3pDO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLHFCQUFxQixFQUFDO3dCQUNsRSxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO3FCQUMzRDtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtU2VsZWN0YWJsZX0gZnJvbSAnLi9tZW51LWl0ZW0tc2VsZWN0YWJsZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgcHJvdmlkaW5nIGJlaGF2aW9yIGZvciB0aGUgXCJtZW51aXRlbWNoZWNrYm94XCIgQVJJQSByb2xlLCB3aGljaCBiZWhhdmVzIHNpbWlsYXJseSB0byBhXG4gKiBjb252ZW50aW9uYWwgY2hlY2tib3guXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbUNoZWNrYm94XScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW1DaGVja2JveCcsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdtZW51aXRlbWNoZWNrYm94JyxcbiAgICAnW2NsYXNzLmNkay1tZW51LWl0ZW0tY2hlY2tib3hdJzogJ3RydWUnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1DaGVja2JveH0sXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1DaGVja2JveCBleHRlbmRzIENka01lbnVJdGVtU2VsZWN0YWJsZSB7XG4gIC8qKlxuICAgKiBUb2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIGNoZWNrYm94LlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoZSBjb25maWd1cmUgaG93IHRoZSBpdGVtIGlzIHRyaWdnZXJlZFxuICAgKiAgIC0ga2VlcE9wZW46IHNwZWNpZmllcyB0aGF0IHRoZSBtZW51IHNob3VsZCBiZSBrZXB0IG9wZW4gYWZ0ZXIgdHJpZ2dlcmluZyB0aGUgaXRlbS5cbiAgICovXG4gIG92ZXJyaWRlIHRyaWdnZXIob3B0aW9ucz86IHtrZWVwT3BlbjogYm9vbGVhbn0pIHtcbiAgICBzdXBlci50cmlnZ2VyKG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkO1xuICAgIH1cbiAgfVxufVxuIl19