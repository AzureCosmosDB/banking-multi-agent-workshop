/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
/** Harness for interacting with a mat-tooltip in tests. */
export class MatTooltipHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._optionalPanel = this.documentRootLocatorFactory().locatorForOptional('.mat-mdc-tooltip');
        this._hiddenClass = 'mat-mdc-tooltip-hide';
        this._disabledClass = 'mat-mdc-tooltip-disabled';
        this._showAnimationName = 'mat-mdc-tooltip-show';
        this._hideAnimationName = 'mat-mdc-tooltip-hide';
    }
    static { this.hostSelector = '.mat-mdc-tooltip-trigger'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tooltip trigger with specific
     * attributes.
     * @param options Options for narrowing the search.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options);
    }
    /** Shows the tooltip. */
    async show() {
        const host = await this.host();
        // We need to dispatch both `touchstart` and a hover event, because the tooltip binds
        // different events depending on the device. The `changedTouches` is there in case the
        // element has ripples.
        await host.dispatchEvent('touchstart', { changedTouches: [] });
        await host.hover();
        const panel = await this._optionalPanel();
        await panel?.dispatchEvent('animationend', { animationName: this._showAnimationName });
    }
    /** Hides the tooltip. */
    async hide() {
        const host = await this.host();
        // We need to dispatch both `touchstart` and a hover event, because
        // the tooltip binds different events depending on the device.
        await host.dispatchEvent('touchend');
        await host.mouseAway();
        const panel = await this._optionalPanel();
        await panel?.dispatchEvent('animationend', { animationName: this._hideAnimationName });
    }
    /** Gets whether the tooltip is open. */
    async isOpen() {
        const panel = await this._optionalPanel();
        return !!panel && !(await panel.hasClass(this._hiddenClass));
    }
    /** Gets whether the tooltip is disabled */
    async isDisabled() {
        const host = await this.host();
        return host.hasClass(this._disabledClass);
    }
    /** Gets a promise for the tooltip panel's text. */
    async getTooltipText() {
        const panel = await this._optionalPanel();
        return panel ? panel.text() : '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3Rvb2x0aXAvdGVzdGluZy90b29sdGlwLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsR0FDakIsTUFBTSxzQkFBc0IsQ0FBQztBQUc5QiwyREFBMkQ7QUFDM0QsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGdCQUFnQjtJQUF2RDs7UUFHVSxtQkFBYyxHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUYsaUJBQVksR0FBRyxzQkFBc0IsQ0FBQztRQUN0QyxtQkFBYyxHQUFHLDBCQUEwQixDQUFDO1FBQzVDLHVCQUFrQixHQUFHLHNCQUFzQixDQUFDO1FBQzVDLHVCQUFrQixHQUFHLHNCQUFzQixDQUFDO0lBeUR0RCxDQUFDO2FBL0RRLGlCQUFZLEdBQUcsMEJBQTBCLEFBQTdCLENBQThCO0lBUWpEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FFVCxVQUFpQyxFQUFFO1FBRW5DLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELHlCQUF5QjtJQUN6QixLQUFLLENBQUMsSUFBSTtRQUNSLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRS9CLHFGQUFxRjtRQUNyRixzRkFBc0Y7UUFDdEYsdUJBQXVCO1FBQ3ZCLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBQyxjQUFjLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUM3RCxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQyxNQUFNLEtBQUssRUFBRSxhQUFhLENBQUMsY0FBYyxFQUFFLEVBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELHlCQUF5QjtJQUN6QixLQUFLLENBQUMsSUFBSTtRQUNSLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRS9CLG1FQUFtRTtRQUNuRSw4REFBOEQ7UUFDOUQsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFDLE1BQU0sS0FBSyxFQUFFLGFBQWEsQ0FBQyxjQUFjLEVBQUUsRUFBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLEtBQUssQ0FBQyxNQUFNO1FBQ1YsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxLQUFLLENBQUMsVUFBVTtRQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxLQUFLLENBQUMsY0FBYztRQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7VG9vbHRpcEhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3Rvb2x0aXAtaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBtYXQtdG9vbHRpcCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUb29sdGlwSGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLXRvb2x0aXAtdHJpZ2dlcic7XG5cbiAgcHJpdmF0ZSBfb3B0aW9uYWxQYW5lbCA9IHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKS5sb2NhdG9yRm9yT3B0aW9uYWwoJy5tYXQtbWRjLXRvb2x0aXAnKTtcbiAgcHJpdmF0ZSBfaGlkZGVuQ2xhc3MgPSAnbWF0LW1kYy10b29sdGlwLWhpZGUnO1xuICBwcml2YXRlIF9kaXNhYmxlZENsYXNzID0gJ21hdC1tZGMtdG9vbHRpcC1kaXNhYmxlZCc7XG4gIHByaXZhdGUgX3Nob3dBbmltYXRpb25OYW1lID0gJ21hdC1tZGMtdG9vbHRpcC1zaG93JztcbiAgcHJpdmF0ZSBfaGlkZUFuaW1hdGlvbk5hbWUgPSAnbWF0LW1kYy10b29sdGlwLWhpZGUnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHRvb2x0aXAgdHJpZ2dlciB3aXRoIHNwZWNpZmljXG4gICAqIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoPFQgZXh0ZW5kcyBNYXRUb29sdGlwSGFybmVzcz4oXG4gICAgdGhpczogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LFxuICAgIG9wdGlvbnM6IFRvb2x0aXBIYXJuZXNzRmlsdGVycyA9IHt9LFxuICApOiBIYXJuZXNzUHJlZGljYXRlPFQ+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUodGhpcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogU2hvd3MgdGhlIHRvb2x0aXAuICovXG4gIGFzeW5jIHNob3coKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuXG4gICAgLy8gV2UgbmVlZCB0byBkaXNwYXRjaCBib3RoIGB0b3VjaHN0YXJ0YCBhbmQgYSBob3ZlciBldmVudCwgYmVjYXVzZSB0aGUgdG9vbHRpcCBiaW5kc1xuICAgIC8vIGRpZmZlcmVudCBldmVudHMgZGVwZW5kaW5nIG9uIHRoZSBkZXZpY2UuIFRoZSBgY2hhbmdlZFRvdWNoZXNgIGlzIHRoZXJlIGluIGNhc2UgdGhlXG4gICAgLy8gZWxlbWVudCBoYXMgcmlwcGxlcy5cbiAgICBhd2FpdCBob3N0LmRpc3BhdGNoRXZlbnQoJ3RvdWNoc3RhcnQnLCB7Y2hhbmdlZFRvdWNoZXM6IFtdfSk7XG4gICAgYXdhaXQgaG9zdC5ob3ZlcigpO1xuICAgIGNvbnN0IHBhbmVsID0gYXdhaXQgdGhpcy5fb3B0aW9uYWxQYW5lbCgpO1xuICAgIGF3YWl0IHBhbmVsPy5kaXNwYXRjaEV2ZW50KCdhbmltYXRpb25lbmQnLCB7YW5pbWF0aW9uTmFtZTogdGhpcy5fc2hvd0FuaW1hdGlvbk5hbWV9KTtcbiAgfVxuXG4gIC8qKiBIaWRlcyB0aGUgdG9vbHRpcC4gKi9cbiAgYXN5bmMgaGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGRpc3BhdGNoIGJvdGggYHRvdWNoc3RhcnRgIGFuZCBhIGhvdmVyIGV2ZW50LCBiZWNhdXNlXG4gICAgLy8gdGhlIHRvb2x0aXAgYmluZHMgZGlmZmVyZW50IGV2ZW50cyBkZXBlbmRpbmcgb24gdGhlIGRldmljZS5cbiAgICBhd2FpdCBob3N0LmRpc3BhdGNoRXZlbnQoJ3RvdWNoZW5kJyk7XG4gICAgYXdhaXQgaG9zdC5tb3VzZUF3YXkoKTtcbiAgICBjb25zdCBwYW5lbCA9IGF3YWl0IHRoaXMuX29wdGlvbmFsUGFuZWwoKTtcbiAgICBhd2FpdCBwYW5lbD8uZGlzcGF0Y2hFdmVudCgnYW5pbWF0aW9uZW5kJywge2FuaW1hdGlvbk5hbWU6IHRoaXMuX2hpZGVBbmltYXRpb25OYW1lfSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSB0b29sdGlwIGlzIG9wZW4uICovXG4gIGFzeW5jIGlzT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBwYW5lbCA9IGF3YWl0IHRoaXMuX29wdGlvbmFsUGFuZWwoKTtcbiAgICByZXR1cm4gISFwYW5lbCAmJiAhKGF3YWl0IHBhbmVsLmhhc0NsYXNzKHRoaXMuX2hpZGRlbkNsYXNzKSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSB0b29sdGlwIGlzIGRpc2FibGVkICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIHJldHVybiBob3N0Lmhhc0NsYXNzKHRoaXMuX2Rpc2FibGVkQ2xhc3MpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBwcm9taXNlIGZvciB0aGUgdG9vbHRpcCBwYW5lbCdzIHRleHQuICovXG4gIGFzeW5jIGdldFRvb2x0aXBUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcGFuZWwgPSBhd2FpdCB0aGlzLl9vcHRpb25hbFBhbmVsKCk7XG4gICAgcmV0dXJuIHBhbmVsID8gcGFuZWwudGV4dCgpIDogJyc7XG4gIH1cbn1cbiJdfQ==