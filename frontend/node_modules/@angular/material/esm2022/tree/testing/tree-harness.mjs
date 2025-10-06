/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatTreeNodeHarness } from './node-harness';
/** Harness for interacting with a standard mat-tree in tests. */
export class MatTreeHarness extends ComponentHarness {
    /** The selector for the host element of a `MatTableHarness` instance. */
    static { this.hostSelector = '.mat-tree'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tree with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTreeHarness, options);
    }
    /** Gets all of the nodes in the tree. */
    async getNodes(filter = {}) {
        return this.locatorForAll(MatTreeNodeHarness.with(filter))();
    }
    /**
     * Gets an object representation for the visible tree structure
     * If a node is under an unexpanded node it will not be included.
     * Eg.
     * Tree (all nodes expanded):
     * `
     * <mat-tree>
     *   <mat-tree-node>Node 1<mat-tree-node>
     *   <mat-nested-tree-node>
     *     Node 2
     *     <mat-nested-tree-node>
     *       Node 2.1
     *       <mat-tree-node>
     *         Node 2.1.1
     *       <mat-tree-node>
     *     <mat-nested-tree-node>
     *     <mat-tree-node>
     *       Node 2.2
     *     <mat-tree-node>
     *   <mat-nested-tree-node>
     * </mat-tree>`
     *
     * Tree structure:
     * {
     *  children: [
     *    {
     *      text: 'Node 1',
     *      children: [
     *        {
     *          text: 'Node 2',
     *          children: [
     *            {
     *              text: 'Node 2.1',
     *              children: [{text: 'Node 2.1.1'}]
     *            },
     *            {text: 'Node 2.2'}
     *          ]
     *        }
     *      ]
     *    }
     *  ]
     * };
     */
    async getTreeStructure() {
        const nodes = await this.getNodes();
        const nodeInformation = await parallel(() => nodes.map(node => {
            return parallel(() => [node.getLevel(), node.getText(), node.isExpanded()]);
        }));
        return this._getTreeStructure(nodeInformation, 1, true);
    }
    /**
     * Recursively collect the structured text of the tree nodes.
     * @param nodes A list of tree nodes
     * @param level The level of nodes that are being accounted for during this iteration
     * @param parentExpanded Whether the parent of the first node in param nodes is expanded
     */
    _getTreeStructure(nodes, level, parentExpanded) {
        const result = {};
        for (let i = 0; i < nodes.length; i++) {
            const [nodeLevel, text, expanded] = nodes[i];
            const nextNodeLevel = nodes[i + 1]?.[0] ?? -1;
            // Return the accumulated value for the current level once we reach a shallower level node
            if (nodeLevel < level) {
                return result;
            }
            // Skip deeper level nodes during this iteration, they will be picked up in a later iteration
            if (nodeLevel > level) {
                continue;
            }
            // Only add to representation if it is visible (parent is expanded)
            if (parentExpanded) {
                // Collect the data under this node according to the following rules:
                // 1. If the next node in the list is a sibling of the current node add it to the child list
                // 2. If the next node is a child of the current node, get the sub-tree structure for the
                //    child and add it under this node
                // 3. If the next node has a shallower level, we've reached the end of the child nodes for
                //    the current parent.
                if (nextNodeLevel === level) {
                    this._addChildToNode(result, { text });
                }
                else if (nextNodeLevel > level) {
                    let children = this._getTreeStructure(nodes.slice(i + 1), nextNodeLevel, expanded)?.children;
                    let child = children ? { text, children } : { text };
                    this._addChildToNode(result, child);
                }
                else {
                    this._addChildToNode(result, { text });
                    return result;
                }
            }
        }
        return result;
    }
    _addChildToNode(result, child) {
        result.children ? result.children.push(child) : (result.children = [child]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RyZWUvdGVzdGluZy90cmVlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBUWxELGlFQUFpRTtBQUNqRSxNQUFNLE9BQU8sY0FBZSxTQUFRLGdCQUFnQjtJQUNsRCx5RUFBeUU7YUFDbEUsaUJBQVksR0FBRyxXQUFXLENBQUM7SUFFbEM7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBOEIsRUFBRTtRQUMxQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCx5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFpQyxFQUFFO1FBQ2hELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9ELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMENHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQjtRQUNwQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwQyxNQUFNLGVBQWUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FDMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNmLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUNILENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGlCQUFpQixDQUN2QixLQUFrQyxFQUNsQyxLQUFhLEVBQ2IsY0FBdUI7UUFFdkIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU5QywwRkFBMEY7WUFDMUYsSUFBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLENBQUM7Z0JBQ3RCLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLENBQUM7WUFDRCw2RkFBNkY7WUFDN0YsSUFBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLENBQUM7Z0JBQ3RCLFNBQVM7WUFDWCxDQUFDO1lBQ0QsbUVBQW1FO1lBQ25FLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ25CLHFFQUFxRTtnQkFDckUsNEZBQTRGO2dCQUM1Rix5RkFBeUY7Z0JBQ3pGLHNDQUFzQztnQkFDdEMsMEZBQTBGO2dCQUMxRix5QkFBeUI7Z0JBQ3pCLElBQUksYUFBYSxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUM1QixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7cUJBQU0sSUFBSSxhQUFhLEdBQUcsS0FBSyxFQUFFLENBQUM7b0JBQ2pDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FDbkMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ2xCLGFBQWEsRUFDYixRQUFRLENBQ1QsRUFBRSxRQUFRLENBQUM7b0JBQ1osSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7cUJBQU0sQ0FBQztvQkFDTixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7b0JBQ3JDLE9BQU8sTUFBTSxDQUFDO2dCQUNoQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRU8sZUFBZSxDQUFDLE1BQWdCLEVBQUUsS0FBZTtRQUN2RCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0VHJlZU5vZGVIYXJuZXNzfSBmcm9tICcuL25vZGUtaGFybmVzcyc7XG5pbXBvcnQge1RyZWVIYXJuZXNzRmlsdGVycywgVHJlZU5vZGVIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi90cmVlLWhhcm5lc3MtZmlsdGVycyc7XG5cbmV4cG9ydCB0eXBlIFRleHRUcmVlID0ge1xuICB0ZXh0Pzogc3RyaW5nO1xuICBjaGlsZHJlbj86IFRleHRUcmVlW107XG59O1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC10cmVlIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFRyZWVIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0VGFibGVIYXJuZXNzYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LXRyZWUnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIHRyZWUgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaFxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFRyZWVIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRUcmVlSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRUcmVlSGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgb2YgdGhlIG5vZGVzIGluIHRoZSB0cmVlLiAqL1xuICBhc3luYyBnZXROb2RlcyhmaWx0ZXI6IFRyZWVOb2RlSGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8TWF0VHJlZU5vZGVIYXJuZXNzW10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKE1hdFRyZWVOb2RlSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gZm9yIHRoZSB2aXNpYmxlIHRyZWUgc3RydWN0dXJlXG4gICAqIElmIGEgbm9kZSBpcyB1bmRlciBhbiB1bmV4cGFuZGVkIG5vZGUgaXQgd2lsbCBub3QgYmUgaW5jbHVkZWQuXG4gICAqIEVnLlxuICAgKiBUcmVlIChhbGwgbm9kZXMgZXhwYW5kZWQpOlxuICAgKiBgXG4gICAqIDxtYXQtdHJlZT5cbiAgICogICA8bWF0LXRyZWUtbm9kZT5Ob2RlIDE8bWF0LXRyZWUtbm9kZT5cbiAgICogICA8bWF0LW5lc3RlZC10cmVlLW5vZGU+XG4gICAqICAgICBOb2RlIDJcbiAgICogICAgIDxtYXQtbmVzdGVkLXRyZWUtbm9kZT5cbiAgICogICAgICAgTm9kZSAyLjFcbiAgICogICAgICAgPG1hdC10cmVlLW5vZGU+XG4gICAqICAgICAgICAgTm9kZSAyLjEuMVxuICAgKiAgICAgICA8bWF0LXRyZWUtbm9kZT5cbiAgICogICAgIDxtYXQtbmVzdGVkLXRyZWUtbm9kZT5cbiAgICogICAgIDxtYXQtdHJlZS1ub2RlPlxuICAgKiAgICAgICBOb2RlIDIuMlxuICAgKiAgICAgPG1hdC10cmVlLW5vZGU+XG4gICAqICAgPG1hdC1uZXN0ZWQtdHJlZS1ub2RlPlxuICAgKiA8L21hdC10cmVlPmBcbiAgICpcbiAgICogVHJlZSBzdHJ1Y3R1cmU6XG4gICAqIHtcbiAgICogIGNoaWxkcmVuOiBbXG4gICAqICAgIHtcbiAgICogICAgICB0ZXh0OiAnTm9kZSAxJyxcbiAgICogICAgICBjaGlsZHJlbjogW1xuICAgKiAgICAgICAge1xuICAgKiAgICAgICAgICB0ZXh0OiAnTm9kZSAyJyxcbiAgICogICAgICAgICAgY2hpbGRyZW46IFtcbiAgICogICAgICAgICAgICB7XG4gICAqICAgICAgICAgICAgICB0ZXh0OiAnTm9kZSAyLjEnLFxuICAgKiAgICAgICAgICAgICAgY2hpbGRyZW46IFt7dGV4dDogJ05vZGUgMi4xLjEnfV1cbiAgICogICAgICAgICAgICB9LFxuICAgKiAgICAgICAgICAgIHt0ZXh0OiAnTm9kZSAyLjInfVxuICAgKiAgICAgICAgICBdXG4gICAqICAgICAgICB9XG4gICAqICAgICAgXVxuICAgKiAgICB9XG4gICAqICBdXG4gICAqIH07XG4gICAqL1xuICBhc3luYyBnZXRUcmVlU3RydWN0dXJlKCk6IFByb21pc2U8VGV4dFRyZWU+IHtcbiAgICBjb25zdCBub2RlcyA9IGF3YWl0IHRoaXMuZ2V0Tm9kZXMoKTtcbiAgICBjb25zdCBub2RlSW5mb3JtYXRpb24gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PlxuICAgICAgbm9kZXMubWFwKG5vZGUgPT4ge1xuICAgICAgICByZXR1cm4gcGFyYWxsZWwoKCkgPT4gW25vZGUuZ2V0TGV2ZWwoKSwgbm9kZS5nZXRUZXh0KCksIG5vZGUuaXNFeHBhbmRlZCgpXSk7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLl9nZXRUcmVlU3RydWN0dXJlKG5vZGVJbmZvcm1hdGlvbiwgMSwgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgY29sbGVjdCB0aGUgc3RydWN0dXJlZCB0ZXh0IG9mIHRoZSB0cmVlIG5vZGVzLlxuICAgKiBAcGFyYW0gbm9kZXMgQSBsaXN0IG9mIHRyZWUgbm9kZXNcbiAgICogQHBhcmFtIGxldmVsIFRoZSBsZXZlbCBvZiBub2RlcyB0aGF0IGFyZSBiZWluZyBhY2NvdW50ZWQgZm9yIGR1cmluZyB0aGlzIGl0ZXJhdGlvblxuICAgKiBAcGFyYW0gcGFyZW50RXhwYW5kZWQgV2hldGhlciB0aGUgcGFyZW50IG9mIHRoZSBmaXJzdCBub2RlIGluIHBhcmFtIG5vZGVzIGlzIGV4cGFuZGVkXG4gICAqL1xuICBwcml2YXRlIF9nZXRUcmVlU3RydWN0dXJlKFxuICAgIG5vZGVzOiBbbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW5dW10sXG4gICAgbGV2ZWw6IG51bWJlcixcbiAgICBwYXJlbnRFeHBhbmRlZDogYm9vbGVhbixcbiAgKTogVGV4dFRyZWUge1xuICAgIGNvbnN0IHJlc3VsdDogVGV4dFRyZWUgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBbbm9kZUxldmVsLCB0ZXh0LCBleHBhbmRlZF0gPSBub2Rlc1tpXTtcbiAgICAgIGNvbnN0IG5leHROb2RlTGV2ZWwgPSBub2Rlc1tpICsgMV0/LlswXSA/PyAtMTtcblxuICAgICAgLy8gUmV0dXJuIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgbGV2ZWwgb25jZSB3ZSByZWFjaCBhIHNoYWxsb3dlciBsZXZlbCBub2RlXG4gICAgICBpZiAobm9kZUxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIC8vIFNraXAgZGVlcGVyIGxldmVsIG5vZGVzIGR1cmluZyB0aGlzIGl0ZXJhdGlvbiwgdGhleSB3aWxsIGJlIHBpY2tlZCB1cCBpbiBhIGxhdGVyIGl0ZXJhdGlvblxuICAgICAgaWYgKG5vZGVMZXZlbCA+IGxldmVsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gT25seSBhZGQgdG8gcmVwcmVzZW50YXRpb24gaWYgaXQgaXMgdmlzaWJsZSAocGFyZW50IGlzIGV4cGFuZGVkKVxuICAgICAgaWYgKHBhcmVudEV4cGFuZGVkKSB7XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIGRhdGEgdW5kZXIgdGhpcyBub2RlIGFjY29yZGluZyB0byB0aGUgZm9sbG93aW5nIHJ1bGVzOlxuICAgICAgICAvLyAxLiBJZiB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0IGlzIGEgc2libGluZyBvZiB0aGUgY3VycmVudCBub2RlIGFkZCBpdCB0byB0aGUgY2hpbGQgbGlzdFxuICAgICAgICAvLyAyLiBJZiB0aGUgbmV4dCBub2RlIGlzIGEgY2hpbGQgb2YgdGhlIGN1cnJlbnQgbm9kZSwgZ2V0IHRoZSBzdWItdHJlZSBzdHJ1Y3R1cmUgZm9yIHRoZVxuICAgICAgICAvLyAgICBjaGlsZCBhbmQgYWRkIGl0IHVuZGVyIHRoaXMgbm9kZVxuICAgICAgICAvLyAzLiBJZiB0aGUgbmV4dCBub2RlIGhhcyBhIHNoYWxsb3dlciBsZXZlbCwgd2UndmUgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBjaGlsZCBub2RlcyBmb3JcbiAgICAgICAgLy8gICAgdGhlIGN1cnJlbnQgcGFyZW50LlxuICAgICAgICBpZiAobmV4dE5vZGVMZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICB0aGlzLl9hZGRDaGlsZFRvTm9kZShyZXN1bHQsIHt0ZXh0fSk7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dE5vZGVMZXZlbCA+IGxldmVsKSB7XG4gICAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5fZ2V0VHJlZVN0cnVjdHVyZShcbiAgICAgICAgICAgIG5vZGVzLnNsaWNlKGkgKyAxKSxcbiAgICAgICAgICAgIG5leHROb2RlTGV2ZWwsXG4gICAgICAgICAgICBleHBhbmRlZCxcbiAgICAgICAgICApPy5jaGlsZHJlbjtcbiAgICAgICAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbiA/IHt0ZXh0LCBjaGlsZHJlbn0gOiB7dGV4dH07XG4gICAgICAgICAgdGhpcy5fYWRkQ2hpbGRUb05vZGUocmVzdWx0LCBjaGlsZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWRkQ2hpbGRUb05vZGUocmVzdWx0LCB7dGV4dH0pO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZENoaWxkVG9Ob2RlKHJlc3VsdDogVGV4dFRyZWUsIGNoaWxkOiBUZXh0VHJlZSkge1xuICAgIHJlc3VsdC5jaGlsZHJlbiA/IHJlc3VsdC5jaGlsZHJlbi5wdXNoKGNoaWxkKSA6IChyZXN1bHQuY2hpbGRyZW4gPSBbY2hpbGRdKTtcbiAgfVxufVxuIl19