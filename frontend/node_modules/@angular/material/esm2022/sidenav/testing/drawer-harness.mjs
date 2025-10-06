/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/**
 * Base class for the drawer harness functionality.
 * @docs-private
 */
export class MatDrawerHarnessBase extends ContentContainerComponentHarness {
    /** Whether the drawer is open. */
    async isOpen() {
        return (await this.host()).hasClass('mat-drawer-opened');
    }
    /** Gets the position of the drawer inside its container. */
    async getPosition() {
        const host = await this.host();
        return (await host.hasClass('mat-drawer-end')) ? 'end' : 'start';
    }
    /** Gets the mode that the drawer is in. */
    async getMode() {
        const host = await this.host();
        if (await host.hasClass('mat-drawer-push')) {
            return 'push';
        }
        if (await host.hasClass('mat-drawer-side')) {
            return 'side';
        }
        return 'over';
    }
}
/** Harness for interacting with a standard mat-drawer in tests. */
export class MatDrawerHarness extends MatDrawerHarnessBase {
    /** The selector for the host element of a `MatDrawer` instance. */
    static { this.hostSelector = '.mat-drawer'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDrawerHarness` that meets
     * certain criteria.
     * @param options Options for filtering which drawer instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatDrawerHarness, options).addOption('position', options.position, async (harness, position) => (await harness.getPosition()) === position);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2VyLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2lkZW5hdi90ZXN0aW5nL2RyYXdlci1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBR3hGOzs7R0FHRztBQUNILE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxnQ0FBd0M7SUFDaEYsa0NBQWtDO0lBQ2xDLEtBQUssQ0FBQyxNQUFNO1FBQ1YsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELDREQUE0RDtJQUM1RCxLQUFLLENBQUMsV0FBVztRQUNmLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUNuRSxDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLEtBQUssQ0FBQyxPQUFPO1FBQ1gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFL0IsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQzNDLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7WUFDM0MsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FDRjtBQUVELG1FQUFtRTtBQUNuRSxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsb0JBQW9CO0lBQ3hELG1FQUFtRTthQUM1RCxpQkFBWSxHQUFHLGFBQWEsQ0FBQztJQUVwQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBZ0MsRUFBRTtRQUM1QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUM5RCxVQUFVLEVBQ1YsT0FBTyxDQUFDLFFBQVEsRUFDaEIsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxRQUFRLENBQ3hFLENBQUM7SUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7RHJhd2VySGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vZHJhd2VyLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgdGhlIGRyYXdlciBoYXJuZXNzIGZ1bmN0aW9uYWxpdHkuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXREcmF3ZXJIYXJuZXNzQmFzZSBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPHN0cmluZz4ge1xuICAvKiogV2hldGhlciB0aGUgZHJhd2VyIGlzIG9wZW4uICovXG4gIGFzeW5jIGlzT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWRyYXdlci1vcGVuZWQnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhd2VyIGluc2lkZSBpdHMgY29udGFpbmVyLiAqL1xuICBhc3luYyBnZXRQb3NpdGlvbigpOiBQcm9taXNlPCdzdGFydCcgfCAnZW5kJz4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICByZXR1cm4gKGF3YWl0IGhvc3QuaGFzQ2xhc3MoJ21hdC1kcmF3ZXItZW5kJykpID8gJ2VuZCcgOiAnc3RhcnQnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1vZGUgdGhhdCB0aGUgZHJhd2VyIGlzIGluLiAqL1xuICBhc3luYyBnZXRNb2RlKCk6IFByb21pc2U8J292ZXInIHwgJ3B1c2gnIHwgJ3NpZGUnPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuXG4gICAgaWYgKGF3YWl0IGhvc3QuaGFzQ2xhc3MoJ21hdC1kcmF3ZXItcHVzaCcpKSB7XG4gICAgICByZXR1cm4gJ3B1c2gnO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtZHJhd2VyLXNpZGUnKSkge1xuICAgICAgcmV0dXJuICdzaWRlJztcbiAgICB9XG5cbiAgICByZXR1cm4gJ292ZXInO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LWRyYXdlciBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXREcmF3ZXJIYXJuZXNzIGV4dGVuZHMgTWF0RHJhd2VySGFybmVzc0Jhc2Uge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdERyYXdlcmAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1kcmF3ZXInO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXREcmF3ZXJIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBkcmF3ZXIgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogRHJhd2VySGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0RHJhd2VySGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXREcmF3ZXJIYXJuZXNzLCBvcHRpb25zKS5hZGRPcHRpb24oXG4gICAgICAncG9zaXRpb24nLFxuICAgICAgb3B0aW9ucy5wb3NpdGlvbixcbiAgICAgIGFzeW5jIChoYXJuZXNzLCBwb3NpdGlvbikgPT4gKGF3YWl0IGhhcm5lc3MuZ2V0UG9zaXRpb24oKSkgPT09IHBvc2l0aW9uLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==