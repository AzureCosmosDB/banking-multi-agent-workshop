/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
/** Harness for interacting with a standard Angular Material tree node. */
export class MatTreeNodeHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._toggle = this.locatorForOptional('[matTreeNodeToggle]');
    }
    /** The selector of the host element of a `MatTreeNode` instance. */
    static { this.hostSelector = '.mat-tree-node, .mat-nested-tree-node'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tree node with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getNodePredicate(MatTreeNodeHarness, options);
    }
    /** Whether the tree node is expanded. */
    async isExpanded() {
        return coerceBooleanProperty(await (await this.host()).getAttribute('aria-expanded'));
    }
    /** Whether the tree node is expandable. */
    async isExpandable() {
        return (await (await this.host()).getAttribute('aria-expanded')) !== null;
    }
    /** Whether the tree node is disabled. */
    async isDisabled() {
        return coerceBooleanProperty(await (await this.host()).getProperty('aria-disabled'));
    }
    /** Gets the level of the tree node. Note that this gets the aria-level and is 1 indexed. */
    async getLevel() {
        return coerceNumberProperty(await (await this.host()).getAttribute('aria-level'));
    }
    /** Gets the tree node's text. */
    async getText() {
        return (await this.host()).text({ exclude: '.mat-tree-node, .mat-nested-tree-node, button' });
    }
    /** Toggles node between expanded/collapsed. Only works when node is not disabled. */
    async toggle() {
        const toggle = await this._toggle();
        if (toggle) {
            return toggle.click();
        }
    }
    /** Expands the node if it is collapsed. Only works when node is not disabled. */
    async expand() {
        if (!(await this.isExpanded())) {
            await this.toggle();
        }
    }
    /** Collapses the node if it is expanded. Only works when node is not disabled. */
    async collapse() {
        if (await this.isExpanded()) {
            await this.toggle();
        }
    }
}
function getNodePredicate(type, options) {
    return new HarnessPredicate(type, options)
        .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption('disabled', options.disabled, async (harness, disabled) => (await harness.isDisabled()) === disabled)
        .addOption('expanded', options.expanded, async (harness, expanded) => (await harness.isExpanded()) === expanded)
        .addOption('level', options.level, async (harness, level) => (await harness.getLevel()) === level);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RyZWUvdGVzdGluZy9ub2RlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLGdDQUFnQyxFQUNoQyxnQkFBZ0IsR0FDakIsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QixPQUFPLEVBQUMscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUVsRiwwRUFBMEU7QUFDMUUsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGdDQUF3QztJQUFoRjs7UUFJRSxZQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUF5RDNELENBQUM7SUE1REMsb0VBQW9FO2FBQzdELGlCQUFZLEdBQUcsdUNBQXVDLEFBQTFDLENBQTJDO0lBSTlEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLEtBQUssQ0FBQyxVQUFVO1FBQ2QsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLEtBQUssQ0FBQyxZQUFZO1FBQ2hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDNUUsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxLQUFLLENBQUMsVUFBVTtRQUNkLE9BQU8scUJBQXFCLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELDRGQUE0RjtJQUM1RixLQUFLLENBQUMsUUFBUTtRQUNaLE9BQU8sb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVELGlDQUFpQztJQUNqQyxLQUFLLENBQUMsT0FBTztRQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSwrQ0FBK0MsRUFBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUVELHFGQUFxRjtJQUNyRixLQUFLLENBQUMsTUFBTTtRQUNWLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztJQUVELGlGQUFpRjtJQUNqRixLQUFLLENBQUMsTUFBTTtRQUNWLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUMvQixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQztJQUVELGtGQUFrRjtJQUNsRixLQUFLLENBQUMsUUFBUTtRQUNaLElBQUksTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztZQUM1QixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0gsQ0FBQzs7QUFHSCxTQUFTLGdCQUFnQixDQUN2QixJQUFvQyxFQUNwQyxPQUErQjtJQUUvQixPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztTQUN2QyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FDakQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FDeEQ7U0FDQSxTQUFTLENBQ1IsVUFBVSxFQUNWLE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssUUFBUSxDQUN2RTtTQUNBLFNBQVMsQ0FDUixVQUFVLEVBQ1YsT0FBTyxDQUFDLFFBQVEsRUFDaEIsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxRQUFRLENBQ3ZFO1NBQ0EsU0FBUyxDQUNSLE9BQU8sRUFDUCxPQUFPLENBQUMsS0FBSyxFQUNiLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssS0FBSyxDQUMvRCxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge1RyZWVOb2RlSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vdHJlZS1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHksIGNvZXJjZU51bWJlclByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIEFuZ3VsYXIgTWF0ZXJpYWwgdHJlZSBub2RlLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFRyZWVOb2RlSGFybmVzcyBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPHN0cmluZz4ge1xuICAvKiogVGhlIHNlbGVjdG9yIG9mIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0VHJlZU5vZGVgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtdHJlZS1ub2RlLCAubWF0LW5lc3RlZC10cmVlLW5vZGUnO1xuXG4gIF90b2dnbGUgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnW21hdFRyZWVOb2RlVG9nZ2xlXScpO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHRyZWUgbm9kZSB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogVHJlZU5vZGVIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRUcmVlTm9kZUhhcm5lc3M+IHtcbiAgICByZXR1cm4gZ2V0Tm9kZVByZWRpY2F0ZShNYXRUcmVlTm9kZUhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRyZWUgbm9kZSBpcyBleHBhbmRlZC4gKi9cbiAgYXN5bmMgaXNFeHBhbmRlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJykpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRyZWUgbm9kZSBpcyBleHBhbmRhYmxlLiAqL1xuICBhc3luYyBpc0V4cGFuZGFibGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpKSAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0cmVlIG5vZGUgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldFByb3BlcnR5KCdhcmlhLWRpc2FibGVkJykpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxldmVsIG9mIHRoZSB0cmVlIG5vZGUuIE5vdGUgdGhhdCB0aGlzIGdldHMgdGhlIGFyaWEtbGV2ZWwgYW5kIGlzIDEgaW5kZXhlZC4gKi9cbiAgYXN5bmMgZ2V0TGV2ZWwoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gY29lcmNlTnVtYmVyUHJvcGVydHkoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGV2ZWwnKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdHJlZSBub2RlJ3MgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoe2V4Y2x1ZGU6ICcubWF0LXRyZWUtbm9kZSwgLm1hdC1uZXN0ZWQtdHJlZS1ub2RlLCBidXR0b24nfSk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyBub2RlIGJldHdlZW4gZXhwYW5kZWQvY29sbGFwc2VkLiBPbmx5IHdvcmtzIHdoZW4gbm9kZSBpcyBub3QgZGlzYWJsZWQuICovXG4gIGFzeW5jIHRvZ2dsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB0b2dnbGUgPSBhd2FpdCB0aGlzLl90b2dnbGUoKTtcbiAgICBpZiAodG9nZ2xlKSB7XG4gICAgICByZXR1cm4gdG9nZ2xlLmNsaWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV4cGFuZHMgdGhlIG5vZGUgaWYgaXQgaXMgY29sbGFwc2VkLiBPbmx5IHdvcmtzIHdoZW4gbm9kZSBpcyBub3QgZGlzYWJsZWQuICovXG4gIGFzeW5jIGV4cGFuZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmlzRXhwYW5kZWQoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENvbGxhcHNlcyB0aGUgbm9kZSBpZiBpdCBpcyBleHBhbmRlZC4gT25seSB3b3JrcyB3aGVuIG5vZGUgaXMgbm90IGRpc2FibGVkLiAqL1xuICBhc3luYyBjb2xsYXBzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldE5vZGVQcmVkaWNhdGU8VCBleHRlbmRzIE1hdFRyZWVOb2RlSGFybmVzcz4oXG4gIHR5cGU6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgb3B0aW9uczogVHJlZU5vZGVIYXJuZXNzRmlsdGVycyxcbik6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUodHlwZSwgb3B0aW9ucylcbiAgICAuYWRkT3B0aW9uKCd0ZXh0Jywgb3B0aW9ucy50ZXh0LCAoaGFybmVzcywgdGV4dCkgPT5cbiAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCksXG4gICAgKVxuICAgIC5hZGRPcHRpb24oXG4gICAgICAnZGlzYWJsZWQnLFxuICAgICAgb3B0aW9ucy5kaXNhYmxlZCxcbiAgICAgIGFzeW5jIChoYXJuZXNzLCBkaXNhYmxlZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNEaXNhYmxlZCgpKSA9PT0gZGlzYWJsZWQsXG4gICAgKVxuICAgIC5hZGRPcHRpb24oXG4gICAgICAnZXhwYW5kZWQnLFxuICAgICAgb3B0aW9ucy5leHBhbmRlZCxcbiAgICAgIGFzeW5jIChoYXJuZXNzLCBleHBhbmRlZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNFeHBhbmRlZCgpKSA9PT0gZXhwYW5kZWQsXG4gICAgKVxuICAgIC5hZGRPcHRpb24oXG4gICAgICAnbGV2ZWwnLFxuICAgICAgb3B0aW9ucy5sZXZlbCxcbiAgICAgIGFzeW5jIChoYXJuZXNzLCBsZXZlbCkgPT4gKGF3YWl0IGhhcm5lc3MuZ2V0TGV2ZWwoKSkgPT09IGxldmVsLFxuICAgICk7XG59XG4iXX0=