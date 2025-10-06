/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TestKey } from '@angular/cdk/testing';
import { MatChipEditInputHarness } from './chip-edit-input-harness';
import { MatChipHarness } from './chip-harness';
/** Harness for interacting with a mat-chip-row in tests. */
export class MatChipRowHarness extends MatChipHarness {
    static { this.hostSelector = '.mat-mdc-chip-row'; }
    /** Whether the chip is editable. */
    async isEditable() {
        return (await this.host()).hasClass('mat-mdc-chip-editable');
    }
    /** Whether the chip is currently being edited. */
    async isEditing() {
        return (await this.host()).hasClass('mat-mdc-chip-editing');
    }
    /** Sets the chip row into an editing state, if it is editable. */
    async startEditing() {
        if (!(await this.isEditable())) {
            throw new Error('Cannot begin editing a chip that is not editable.');
        }
        return (await this.host()).dispatchEvent('dblclick');
    }
    /** Stops editing the chip, if it was in the editing state. */
    async finishEditing() {
        if (await this.isEditing()) {
            await (await this.host()).sendKeys(TestKey.ENTER);
        }
    }
    /** Gets the edit input inside the chip row. */
    async getEditInput(filter = {}) {
        return this.locatorFor(MatChipEditInputHarness.with(filter))();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC1yb3ctaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jaGlwcy90ZXN0aW5nL2NoaXAtcm93LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc5Qyw0REFBNEQ7QUFDNUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGNBQWM7YUFDbkMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztJQUVuRCxvQ0FBb0M7SUFDcEMsS0FBSyxDQUFDLFVBQVU7UUFDZCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELEtBQUssQ0FBQyxTQUFTO1FBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSxLQUFLLENBQUMsWUFBWTtRQUNoQixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFDRCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELDhEQUE4RDtJQUM5RCxLQUFLLENBQUMsYUFBYTtRQUNqQixJQUFJLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7WUFDM0IsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRCxDQUFDO0lBQ0gsQ0FBQztJQUVELCtDQUErQztJQUMvQyxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQXNDLEVBQUU7UUFDekQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDakUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Rlc3RLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0Q2hpcEVkaXRJbnB1dEhhcm5lc3N9IGZyb20gJy4vY2hpcC1lZGl0LWlucHV0LWhhcm5lc3MnO1xuaW1wb3J0IHtNYXRDaGlwSGFybmVzc30gZnJvbSAnLi9jaGlwLWhhcm5lc3MnO1xuaW1wb3J0IHtDaGlwRWRpdElucHV0SGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vY2hpcC1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG1hdC1jaGlwLXJvdyBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRDaGlwUm93SGFybmVzcyBleHRlbmRzIE1hdENoaXBIYXJuZXNzIHtcbiAgc3RhdGljIG92ZXJyaWRlIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1jaGlwLXJvdyc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoaXAgaXMgZWRpdGFibGUuICovXG4gIGFzeW5jIGlzRWRpdGFibGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1tZGMtY2hpcC1lZGl0YWJsZScpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoaXAgaXMgY3VycmVudGx5IGJlaW5nIGVkaXRlZC4gKi9cbiAgYXN5bmMgaXNFZGl0aW5nKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtbWRjLWNoaXAtZWRpdGluZycpO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGNoaXAgcm93IGludG8gYW4gZWRpdGluZyBzdGF0ZSwgaWYgaXQgaXMgZWRpdGFibGUuICovXG4gIGFzeW5jIHN0YXJ0RWRpdGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmlzRWRpdGFibGUoKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGJlZ2luIGVkaXRpbmcgYSBjaGlwIHRoYXQgaXMgbm90IGVkaXRhYmxlLicpO1xuICAgIH1cbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5kaXNwYXRjaEV2ZW50KCdkYmxjbGljaycpO1xuICB9XG5cbiAgLyoqIFN0b3BzIGVkaXRpbmcgdGhlIGNoaXAsIGlmIGl0IHdhcyBpbiB0aGUgZWRpdGluZyBzdGF0ZS4gKi9cbiAgYXN5bmMgZmluaXNoRWRpdGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5pc0VkaXRpbmcoKSkge1xuICAgICAgYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5zZW5kS2V5cyhUZXN0S2V5LkVOVEVSKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZWRpdCBpbnB1dCBpbnNpZGUgdGhlIGNoaXAgcm93LiAqL1xuICBhc3luYyBnZXRFZGl0SW5wdXQoZmlsdGVyOiBDaGlwRWRpdElucHV0SGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8TWF0Q2hpcEVkaXRJbnB1dEhhcm5lc3M+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yKE1hdENoaXBFZGl0SW5wdXRIYXJuZXNzLndpdGgoZmlsdGVyKSkoKTtcbiAgfVxufVxuIl19