/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
export class _MatCellHarnessBase extends ContentContainerComponentHarness {
    /** Gets the cell's text. */
    async getText() {
        return (await this.host()).text();
    }
    /** Gets the name of the column that the cell belongs to. */
    async getColumnName() {
        const host = await this.host();
        const classAttribute = await host.getAttribute('class');
        if (classAttribute) {
            const prefix = 'mat-column-';
            const name = classAttribute
                .split(' ')
                .map(c => c.trim())
                .find(c => c.startsWith(prefix));
            if (name) {
                return name.split(prefix)[1];
            }
        }
        throw Error('Could not determine column name of cell.');
    }
    static _getCellPredicate(type, options) {
        return new HarnessPredicate(type, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('columnName', options.columnName, (harness, name) => HarnessPredicate.stringMatches(harness.getColumnName(), name));
    }
}
/** Harness for interacting with an Angular Material table cell. */
export class MatCellHarness extends _MatCellHarnessBase {
    /** The selector for the host element of a `MatCellHarness` instance. */
    static { this.hostSelector = '.mat-mdc-cell'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table cell with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return _MatCellHarnessBase._getCellPredicate(this, options);
    }
}
/** Harness for interacting with an Angular Material table header cell. */
export class MatHeaderCellHarness extends _MatCellHarnessBase {
    /** The selector for the host element of a `MatHeaderCellHarness` instance. */
    static { this.hostSelector = '.mat-mdc-header-cell'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table header cell with specific
     * attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return _MatCellHarnessBase._getCellPredicate(this, options);
    }
}
/** Harness for interacting with an Angular Material table footer cell. */
export class MatFooterCellHarness extends _MatCellHarnessBase {
    /** The selector for the host element of a `MatFooterCellHarness` instance. */
    static { this.hostSelector = '.mat-mdc-footer-cell'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table footer cell with specific
     * attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return _MatCellHarnessBase._getCellPredicate(this, options);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYmxlL3Rlc3RpbmcvY2VsbC1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxnQ0FBZ0MsRUFDaEMsZ0JBQWdCLEdBQ2pCLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsTUFBTSxPQUFnQixtQkFBb0IsU0FBUSxnQ0FBZ0M7SUFDaEYsNEJBQTRCO0lBQzVCLEtBQUssQ0FBQyxPQUFPO1FBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELDREQUE0RDtJQUM1RCxLQUFLLENBQUMsYUFBYTtRQUNqQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFeEQsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNuQixNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUM7WUFDN0IsTUFBTSxJQUFJLEdBQUcsY0FBYztpQkFDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQztpQkFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUVuQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVTLE1BQU0sQ0FBQyxpQkFBaUIsQ0FDaEMsSUFBb0MsRUFDcEMsT0FBMkI7UUFFM0IsT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7YUFDdkMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQ2pELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQ3hEO2FBQ0EsU0FBUyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQzdELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQzlELENBQUM7SUFDTixDQUFDO0NBQ0Y7QUFFRCxtRUFBbUU7QUFDbkUsTUFBTSxPQUFPLGNBQWUsU0FBUSxtQkFBbUI7SUFDckQsd0VBQXdFO2FBQ2pFLGlCQUFZLEdBQUcsZUFBZSxDQUFDO0lBRXRDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQThCLEVBQUU7UUFDMUMsT0FBTyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUQsQ0FBQzs7QUFHSCwwRUFBMEU7QUFDMUUsTUFBTSxPQUFPLG9CQUFxQixTQUFRLG1CQUFtQjtJQUMzRCw4RUFBOEU7YUFDdkUsaUJBQVksR0FBRyxzQkFBc0IsQ0FBQztJQUU3Qzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBOEIsRUFBRTtRQUMxQyxPQUFPLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RCxDQUFDOztBQUdILDBFQUEwRTtBQUMxRSxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsbUJBQW1CO0lBQzNELDhFQUE4RTthQUN2RSxpQkFBWSxHQUFHLHNCQUFzQixDQUFDO0lBRTdDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUE4QixFQUFFO1FBQzFDLE9BQU8sbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcyxcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtDZWxsSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vdGFibGUtaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRDZWxsSGFybmVzc0Jhc2UgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBHZXRzIHRoZSBjZWxsJ3MgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuYW1lIG9mIHRoZSBjb2x1bW4gdGhhdCB0aGUgY2VsbCBiZWxvbmdzIHRvLiAqL1xuICBhc3luYyBnZXRDb2x1bW5OYW1lKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIGNvbnN0IGNsYXNzQXR0cmlidXRlID0gYXdhaXQgaG9zdC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyk7XG5cbiAgICBpZiAoY2xhc3NBdHRyaWJ1dGUpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9ICdtYXQtY29sdW1uLSc7XG4gICAgICBjb25zdCBuYW1lID0gY2xhc3NBdHRyaWJ1dGVcbiAgICAgICAgLnNwbGl0KCcgJylcbiAgICAgICAgLm1hcChjID0+IGMudHJpbSgpKVxuICAgICAgICAuZmluZChjID0+IGMuc3RhcnRzV2l0aChwcmVmaXgpKTtcblxuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWUuc3BsaXQocHJlZml4KVsxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSBjb2x1bW4gbmFtZSBvZiBjZWxsLicpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN0YXRpYyBfZ2V0Q2VsbFByZWRpY2F0ZTxUIGV4dGVuZHMgTWF0Q2VsbEhhcm5lc3M+KFxuICAgIHR5cGU6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgICBvcHRpb25zOiBDZWxsSGFybmVzc0ZpbHRlcnMsXG4gICk6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZSh0eXBlLCBvcHRpb25zKVxuICAgICAgLmFkZE9wdGlvbigndGV4dCcsIG9wdGlvbnMudGV4dCwgKGhhcm5lc3MsIHRleHQpID0+XG4gICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCksXG4gICAgICApXG4gICAgICAuYWRkT3B0aW9uKCdjb2x1bW5OYW1lJywgb3B0aW9ucy5jb2x1bW5OYW1lLCAoaGFybmVzcywgbmFtZSkgPT5cbiAgICAgICAgSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0Q29sdW1uTmFtZSgpLCBuYW1lKSxcbiAgICAgICk7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYW4gQW5ndWxhciBNYXRlcmlhbCB0YWJsZSBjZWxsLiAqL1xuZXhwb3J0IGNsYXNzIE1hdENlbGxIYXJuZXNzIGV4dGVuZHMgX01hdENlbGxIYXJuZXNzQmFzZSB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0Q2VsbEhhcm5lc3NgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLWNlbGwnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHRhYmxlIGNlbGwgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaFxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IENlbGxIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRDZWxsSGFybmVzcz4ge1xuICAgIHJldHVybiBfTWF0Q2VsbEhhcm5lc3NCYXNlLl9nZXRDZWxsUHJlZGljYXRlKHRoaXMsIG9wdGlvbnMpO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGFuIEFuZ3VsYXIgTWF0ZXJpYWwgdGFibGUgaGVhZGVyIGNlbGwuICovXG5leHBvcnQgY2xhc3MgTWF0SGVhZGVyQ2VsbEhhcm5lc3MgZXh0ZW5kcyBfTWF0Q2VsbEhhcm5lc3NCYXNlIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRIZWFkZXJDZWxsSGFybmVzc2AgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1tZGMtaGVhZGVyLWNlbGwnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHRhYmxlIGhlYWRlciBjZWxsIHdpdGggc3BlY2lmaWNcbiAgICogYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbmFycm93aW5nIHRoZSBzZWFyY2hcbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBDZWxsSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0SGVhZGVyQ2VsbEhhcm5lc3M+IHtcbiAgICByZXR1cm4gX01hdENlbGxIYXJuZXNzQmFzZS5fZ2V0Q2VsbFByZWRpY2F0ZSh0aGlzLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhbiBBbmd1bGFyIE1hdGVyaWFsIHRhYmxlIGZvb3RlciBjZWxsLiAqL1xuZXhwb3J0IGNsYXNzIE1hdEZvb3RlckNlbGxIYXJuZXNzIGV4dGVuZHMgX01hdENlbGxIYXJuZXNzQmFzZSB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0Rm9vdGVyQ2VsbEhhcm5lc3NgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtbWRjLWZvb3Rlci1jZWxsJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0YWJsZSBmb290ZXIgY2VsbCB3aXRoIHNwZWNpZmljXG4gICAqIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogQ2VsbEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEZvb3RlckNlbGxIYXJuZXNzPiB7XG4gICAgcmV0dXJuIF9NYXRDZWxsSGFybmVzc0Jhc2UuX2dldENlbGxQcmVkaWNhdGUodGhpcywgb3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==