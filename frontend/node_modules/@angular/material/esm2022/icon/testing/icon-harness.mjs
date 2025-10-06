/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { IconType } from './icon-harness-filters';
/** Harness for interacting with a standard mat-icon in tests. */
export class MatIconHarness extends ComponentHarness {
    /** The selector for the host element of a `MatIcon` instance. */
    static { this.hostSelector = '.mat-icon'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatIconHarness` that meets
     * certain criteria.
     * @param options Options for filtering which icon instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatIconHarness, options)
            .addOption('type', options.type, async (harness, type) => (await harness.getType()) === type)
            .addOption('name', options.name, (harness, text) => HarnessPredicate.stringMatches(harness.getName(), text))
            .addOption('namespace', options.namespace, (harness, text) => HarnessPredicate.stringMatches(harness.getNamespace(), text));
    }
    /** Gets the type of the icon. */
    async getType() {
        const type = await (await this.host()).getAttribute('data-mat-icon-type');
        return type === 'svg' ? IconType.SVG : IconType.FONT;
    }
    /** Gets the name of the icon. */
    async getName() {
        const host = await this.host();
        const nameFromDom = await host.getAttribute('data-mat-icon-name');
        // If we managed to figure out the name from the attribute, use it.
        if (nameFromDom) {
            return nameFromDom;
        }
        // Some icons support defining the icon as a ligature.
        // As a fallback, try to extract it from the DOM text.
        if ((await this.getType()) === IconType.FONT) {
            // Other directives may add content to the icon (e.g. `MatBadge`), however only the direct
            // text nodes affect the name of the icon. Exclude all element descendants from the result.
            const text = await host.text({ exclude: '*' });
            // There are some internal cases where the icon name is wrapped in another node.
            // Fall back to extracting the entire text if we ended up excluding everything above.
            return text.length > 0 ? text : host.text();
        }
        return null;
    }
    /** Gets the namespace of the icon. */
    async getNamespace() {
        return (await this.host()).getAttribute('data-mat-icon-namespace');
    }
    /** Gets whether the icon is inline. */
    async isInline() {
        return (await this.host()).hasClass('mat-icon-inline');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2ljb24vdGVzdGluZy9pY29uLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDeEUsT0FBTyxFQUFxQixRQUFRLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUVwRSxpRUFBaUU7QUFDakUsTUFBTSxPQUFPLGNBQWUsU0FBUSxnQkFBZ0I7SUFDbEQsaUVBQWlFO2FBQzFELGlCQUFZLEdBQUcsV0FBVyxDQUFDO0lBRWxDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUE4QixFQUFFO1FBQzFDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO2FBQ2pELFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQzthQUM1RixTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FDakQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FDeEQ7YUFDQSxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FDM0QsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FDN0QsQ0FBQztJQUNOLENBQUM7SUFFRCxpQ0FBaUM7SUFDakMsS0FBSyxDQUFDLE9BQU87UUFDWCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMxRSxPQUFPLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDdkQsQ0FBQztJQUVELGlDQUFpQztJQUNqQyxLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRWxFLG1FQUFtRTtRQUNuRSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sV0FBVyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxzREFBc0Q7UUFDdEQsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QywwRkFBMEY7WUFDMUYsMkZBQTJGO1lBQzNGLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1lBRTdDLGdGQUFnRjtZQUNoRixxRkFBcUY7WUFDckYsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxLQUFLLENBQUMsWUFBWTtRQUNoQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsdUNBQXVDO0lBQ3ZDLEtBQUssQ0FBQyxRQUFRO1FBQ1osT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7SWNvbkhhcm5lc3NGaWx0ZXJzLCBJY29uVHlwZX0gZnJvbSAnLi9pY29uLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LWljb24gaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0SWNvbkhhcm5lc3MgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRJY29uYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWljb24nO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRJY29uSGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggaWNvbiBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBJY29uSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0SWNvbkhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0SWNvbkhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAuYWRkT3B0aW9uKCd0eXBlJywgb3B0aW9ucy50eXBlLCBhc3luYyAoaGFybmVzcywgdHlwZSkgPT4gKGF3YWl0IGhhcm5lc3MuZ2V0VHlwZSgpKSA9PT0gdHlwZSlcbiAgICAgIC5hZGRPcHRpb24oJ25hbWUnLCBvcHRpb25zLm5hbWUsIChoYXJuZXNzLCB0ZXh0KSA9PlxuICAgICAgICBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXROYW1lKCksIHRleHQpLFxuICAgICAgKVxuICAgICAgLmFkZE9wdGlvbignbmFtZXNwYWNlJywgb3B0aW9ucy5uYW1lc3BhY2UsIChoYXJuZXNzLCB0ZXh0KSA9PlxuICAgICAgICBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXROYW1lc3BhY2UoKSwgdGV4dCksXG4gICAgICApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHR5cGUgb2YgdGhlIGljb24uICovXG4gIGFzeW5jIGdldFR5cGUoKTogUHJvbWlzZTxJY29uVHlwZT4ge1xuICAgIGNvbnN0IHR5cGUgPSBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnZGF0YS1tYXQtaWNvbi10eXBlJyk7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdzdmcnID8gSWNvblR5cGUuU1ZHIDogSWNvblR5cGUuRk9OVDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuYW1lIG9mIHRoZSBpY29uLiAqL1xuICBhc3luYyBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBjb25zdCBuYW1lRnJvbURvbSA9IGF3YWl0IGhvc3QuZ2V0QXR0cmlidXRlKCdkYXRhLW1hdC1pY29uLW5hbWUnKTtcblxuICAgIC8vIElmIHdlIG1hbmFnZWQgdG8gZmlndXJlIG91dCB0aGUgbmFtZSBmcm9tIHRoZSBhdHRyaWJ1dGUsIHVzZSBpdC5cbiAgICBpZiAobmFtZUZyb21Eb20pIHtcbiAgICAgIHJldHVybiBuYW1lRnJvbURvbTtcbiAgICB9XG5cbiAgICAvLyBTb21lIGljb25zIHN1cHBvcnQgZGVmaW5pbmcgdGhlIGljb24gYXMgYSBsaWdhdHVyZS5cbiAgICAvLyBBcyBhIGZhbGxiYWNrLCB0cnkgdG8gZXh0cmFjdCBpdCBmcm9tIHRoZSBET00gdGV4dC5cbiAgICBpZiAoKGF3YWl0IHRoaXMuZ2V0VHlwZSgpKSA9PT0gSWNvblR5cGUuRk9OVCkge1xuICAgICAgLy8gT3RoZXIgZGlyZWN0aXZlcyBtYXkgYWRkIGNvbnRlbnQgdG8gdGhlIGljb24gKGUuZy4gYE1hdEJhZGdlYCksIGhvd2V2ZXIgb25seSB0aGUgZGlyZWN0XG4gICAgICAvLyB0ZXh0IG5vZGVzIGFmZmVjdCB0aGUgbmFtZSBvZiB0aGUgaWNvbi4gRXhjbHVkZSBhbGwgZWxlbWVudCBkZXNjZW5kYW50cyBmcm9tIHRoZSByZXN1bHQuXG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgaG9zdC50ZXh0KHtleGNsdWRlOiAnKid9KTtcblxuICAgICAgLy8gVGhlcmUgYXJlIHNvbWUgaW50ZXJuYWwgY2FzZXMgd2hlcmUgdGhlIGljb24gbmFtZSBpcyB3cmFwcGVkIGluIGFub3RoZXIgbm9kZS5cbiAgICAgIC8vIEZhbGwgYmFjayB0byBleHRyYWN0aW5nIHRoZSBlbnRpcmUgdGV4dCBpZiB3ZSBlbmRlZCB1cCBleGNsdWRpbmcgZXZlcnl0aGluZyBhYm92ZS5cbiAgICAgIHJldHVybiB0ZXh0Lmxlbmd0aCA+IDAgPyB0ZXh0IDogaG9zdC50ZXh0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmFtZXNwYWNlIG9mIHRoZSBpY29uLiAqL1xuICBhc3luYyBnZXROYW1lc3BhY2UoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdkYXRhLW1hdC1pY29uLW5hbWVzcGFjZScpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgaWNvbiBpcyBpbmxpbmUuICovXG4gIGFzeW5jIGlzSW5saW5lKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtaWNvbi1pbmxpbmUnKTtcbiAgfVxufVxuIl19