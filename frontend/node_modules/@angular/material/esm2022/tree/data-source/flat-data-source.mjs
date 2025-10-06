/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';
/**
 * Tree flattener to convert a normal type of node to node with children & level information.
 * Transform nested nodes of type `T` to flattened nodes of type `F`.
 *
 * For example, the input data of type `T` is nested, and contains its children data:
 *   SomeNode: {
 *     key: 'Fruits',
 *     children: [
 *       NodeOne: {
 *         key: 'Apple',
 *       },
 *       NodeTwo: {
 *        key: 'Pear',
 *      }
 *    ]
 *  }
 *  After flattener flatten the tree, the structure will become
 *  SomeNode: {
 *    key: 'Fruits',
 *    expandable: true,
 *    level: 1
 *  },
 *  NodeOne: {
 *    key: 'Apple',
 *    expandable: false,
 *    level: 2
 *  },
 *  NodeTwo: {
 *   key: 'Pear',
 *   expandable: false,
 *   level: 2
 * }
 * and the output flattened type is `F` with additional information.
 *
 * @deprecated Use MatTree#childrenAccessor and MatTreeNode#isExpandable
 * instead. To be removed in a future version.
 * @breaking-change 21.0.0
 */
export class MatTreeFlattener {
    constructor(transformFunction, getLevel, isExpandable, getChildren) {
        this.transformFunction = transformFunction;
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.getChildren = getChildren;
    }
    _flattenNode(node, level, resultNodes, parentMap) {
        const flatNode = this.transformFunction(node, level);
        resultNodes.push(flatNode);
        if (this.isExpandable(flatNode)) {
            const childrenNodes = this.getChildren(node);
            if (childrenNodes) {
                if (Array.isArray(childrenNodes)) {
                    this._flattenChildren(childrenNodes, level, resultNodes, parentMap);
                }
                else {
                    childrenNodes.pipe(take(1)).subscribe(children => {
                        this._flattenChildren(children, level, resultNodes, parentMap);
                    });
                }
            }
        }
        return resultNodes;
    }
    _flattenChildren(children, level, resultNodes, parentMap) {
        children.forEach((child, index) => {
            let childParentMap = parentMap.slice();
            childParentMap.push(index != children.length - 1);
            this._flattenNode(child, level + 1, resultNodes, childParentMap);
        });
    }
    /**
     * Flatten a list of node type T to flattened version of node F.
     * Please note that type T may be nested, and the length of `structuredData` may be different
     * from that of returned list `F[]`.
     */
    flattenNodes(structuredData) {
        let resultNodes = [];
        structuredData.forEach(node => this._flattenNode(node, 0, resultNodes, []));
        return resultNodes;
    }
    /**
     * Expand flattened node with current expansion status.
     * The returned list may have different length.
     */
    expandFlattenedNodes(nodes, treeControl) {
        let results = [];
        let currentExpand = [];
        currentExpand[0] = true;
        nodes.forEach(node => {
            let expand = true;
            for (let i = 0; i <= this.getLevel(node); i++) {
                expand = expand && currentExpand[i];
            }
            if (expand) {
                results.push(node);
            }
            if (this.isExpandable(node)) {
                currentExpand[this.getLevel(node) + 1] = treeControl.isExpanded(node);
            }
        });
        return results;
    }
}
/**
 * Data source for flat tree.
 * The data source need to handle expansion/collapsion of the tree node and change the data feed
 * to `MatTree`.
 * The nested tree nodes of type `T` are flattened through `MatTreeFlattener`, and converted
 * to type `F` for `MatTree` to consume.
 *
 * @deprecated Use one of levelAccessor or childrenAccessor instead. To be removed in a future
 * version.
 * @breaking-change 21.0.0
 */
export class MatTreeFlatDataSource extends DataSource {
    get data() {
        return this._data.value;
    }
    set data(value) {
        this._data.next(value);
        this._flattenedData.next(this._treeFlattener.flattenNodes(this.data));
        this._treeControl.dataNodes = this._flattenedData.value;
    }
    constructor(_treeControl, _treeFlattener, initialData) {
        super();
        this._treeControl = _treeControl;
        this._treeFlattener = _treeFlattener;
        this._flattenedData = new BehaviorSubject([]);
        this._expandedData = new BehaviorSubject([]);
        this._data = new BehaviorSubject([]);
        if (initialData) {
            // Assign the data through the constructor to ensure that all of the logic is executed.
            this.data = initialData;
        }
    }
    connect(collectionViewer) {
        return merge(collectionViewer.viewChange, this._treeControl.expansionModel.changed, this._flattenedData).pipe(map(() => {
            this._expandedData.next(this._treeFlattener.expandFlattenedNodes(this._flattenedData.value, this._treeControl));
            return this._expandedData.value;
        }));
    }
    disconnect() {
        // no op
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC1kYXRhLXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL2RhdGEtc291cmNlL2ZsYXQtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFtQixVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUV0RSxPQUFPLEVBQUMsZUFBZSxFQUFFLEtBQUssRUFBYSxNQUFNLE1BQU0sQ0FBQztBQUN4RCxPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUNHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUNTLGlCQUFnRCxFQUNoRCxRQUE2QixFQUM3QixZQUFrQyxFQUNsQyxXQUFrRTtRQUhsRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQStCO1FBQ2hELGFBQVEsR0FBUixRQUFRLENBQXFCO1FBQzdCLGlCQUFZLEdBQVosWUFBWSxDQUFzQjtRQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBdUQ7SUFDeEUsQ0FBQztJQUVKLFlBQVksQ0FBQyxJQUFPLEVBQUUsS0FBYSxFQUFFLFdBQWdCLEVBQUUsU0FBb0I7UUFDekUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxLQUFLLENBQUMsT0FBTyxD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QUNWLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbGxlY3Rpb25WaWV3ZXIsIERhdGFTb3VyY2V9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge0ZsYXRUcmVlQ29udHJvbCwgVHJlZUNvbnRyb2x9IGZyb20gJ0Bhbmd1bGFyL2Nkay90cmVlJztcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBtZXJnZSwgT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcCwgdGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKipcbiAqIFRyZWUgZmxhdHRlbmVyIHRvIGNvbnZlcnQgYSBub3JtYWwgdHlwZSBvZiBub2RlIHRvIG5vZGUgd2l0aCBjaGlsZHJlbiAmIGxldmVsIGluZm9ybWF0aW9uLlxuICogVHJhbnNmb3JtIG5lc3RlZCBub2RlcyBvZiB0eXBlIGBUYCB0byBmbGF0dGVuZWQgbm9kZXMgb2YgdHlwZSBgRmAuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBpbnB1dCBkYXRhIG9mIHR5cGUgYFRgIGlzIG5lc3RlZCwgYW5kIGNvbnRhaW5zIGl0cyBjaGlsZHJlbiBkYXRhOlxuICogICBTb21lTm9kZToge1xuICogICAgIGtleTogJ0ZydWl0cycsXG4gKiAgICAgY2hpbGRyZW46IFtcbiAqICAgICAgIE5vZGVPbmU6IHtcbiAqICAgICAgICAga2V5OiAnQXBwbGUnLFxuICogICAgICAgfSxcbiAqICAgICAgIE5vZGVUd286IHtcbiAqICAgICAgICBrZXk6ICdQZWFyJyxcbiAqICAgICAgfVxuICogICAgXVxuICogIH1cbiAqICBBZnRlciBmbGF0dGVuZXIgZmxhdHRlbiB0aGUgdHJlZSwgdGhlIHN0cnVjdHVyZSB3aWxsIGJlY29tZVxuICogIFNvbWVOb2RlOiB7XG4gKiAgICBrZXk6ICdGcnVpdHMnLFxuICogICAgZXhwYW5kYWJsZTogdHJ1ZSxcbiAqICAgIGxldmVsOiAxXG4gKiAgfSxcbiAqICBOb2RlT25lOiB7XG4gKiAgICBrZXk6ICdBcHBsZScsXG4gKiAgICBleHBhbmRhYmxlOiBmYWxzZSxcbiAqICAgIGxldmVsOiAyXG4gKiAgfSxcbiAqICBOb2RlVHdvOiB7XG4gKiAgIGtleTogJ1BlYXInLFxuICogICBleHBhbmRhYmxlOiBmYWxzZSxcbiAqICAgbGV2ZWw6IDJcbiAqIH1cbiAqIGFuZCB0aGUgb3V0cHV0IGZsYXR0ZW5lZCB0eXBlIGlzIGBGYCB3aXRoIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKlxuICogQGRlcHJlY2F0ZWQgVXNlIE1hdFRyZWUjY2hpbGRyZW5BY2Nlc3NvciBhbmQgTWF0VHJlZU5vZGUjaXNFeHBhbmRhYmxlXG4gKiBpbnN0ZWFkLiBUbyBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24uXG4gKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMFxuICovXG5leHBvcnQgY2xhc3MgTWF0VHJlZUZsYXR0ZW5lcjxULCBGLCBLID0gRj4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdHJhbnNmb3JtRnVuY3Rpb246IChub2RlOiBULCBsZXZlbDogbnVtYmVyKSA9PiBGLFxuICAgIHB1YmxpYyBnZXRMZXZlbDogKG5vZGU6IEYpID0+IG51bWJlcixcbiAgICBwdWJsaWMgaXNFeHBhbmRhYmxlOiAobm9kZTogRikgPT4gYm9vbGVhbixcbiAgICBwdWJsaWMgZ2V0Q2hpbGRyZW46IChub2RlOiBUKSA9PiBPYnNlcnZhYmxlPFRbXT4gfCBUW10gfCB1bmRlZmluZWQgfCBudWxsLFxuICApIHt9XG5cbiAgX2ZsYXR0ZW5Ob2RlKG5vZGU6IFQsIGxldmVsOiBudW1iZXIsIHJlc3VsdE5vZGVzOiBGW10sIHBhcmVudE1hcDogYm9vbGVhbltdKTogRltdIHtcbiAgICBjb25zdCBmbGF0Tm9kZSA9IHRoaXMudHJhbnNmb3JtRnVuY3Rpb24obm9kZSwgbGV2ZWwpO1xuICAgIHJlc3VsdE5vZGVzLnB1c2goZmxhdE5vZGUpO1xuXG4gICAgaWYgKHRoaXMuaXNFeHBhbmRhYmxlKGZsYXROb2RlKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW5Ob2RlcyA9IHRoaXMuZ2V0Q2hpbGRyZW4obm9kZSk7XG4gICAgICBpZiAoY2hpbGRyZW5Ob2Rlcykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbk5vZGVzKSkge1xuICAgICAgICAgIHRoaXMuX2ZsYXR0ZW5DaGlsZHJlbihjaGlsZHJlbk5vZGVzLCBsZXZlbCwgcmVzdWx0Tm9kZXMsIHBhcmVudE1hcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hpbGRyZW5Ob2Rlcy5waXBlKHRha2UoMSkpLnN1YnNjcmliZShjaGlsZHJlbiA9PiB7XG4gICAgICAgICAgICB0aGlzLl9mbGF0dGVuQ2hpbGRyZW4oY2hpbGRyZW4sIGxldmVsLCByZXN1bHROb2RlcywgcGFyZW50TWFwKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Tm9kZXM7XG4gIH1cblxuICBfZmxhdHRlbkNoaWxkcmVuKGNoaWxkcmVuOiBUW10sIGxldmVsOiBudW1iZXIsIHJlc3VsdE5vZGVzOiBGW10sIHBhcmVudE1hcDogYm9vbGVhbltdKTogdm9pZCB7XG4gICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQsIGluZGV4KSA9PiB7XG4gICAgICBsZXQgY2hpbGRQYXJlbnRNYXA6IGJvb2xlYW5bXSA9IHBhcmVudE1hcC5zbGljZSgpO1xuICAgICAgY2hpbGRQYXJlbnRNYXAucHVzaChpbmRleCAhPSBjaGlsZHJlbi5sZW5ndGggLSAxKTtcbiAgICAgIHRoaXMuX2ZsYXR0ZW5Ob2RlKGNoaWxkLCBsZXZlbCArIDEsIHJlc3VsdE5vZGVzLCBjaGlsZFBhcmVudE1hcCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbiBhIGxpc3Qgb2Ygbm9kZSB0eXBlIFQgdG8gZmxhdHRlbmVkIHZlcnNpb24gb2Ygbm9kZSBGLlxuICAgKiBQbGVhc2Ugbm90ZSB0aGF0IHR5cGUgVCBtYXkgYmUgbmVzdGVkLCBhbmQgdGhlIGxlbmd0aCBvZiBgc3RydWN0dXJlZERhdGFgIG1heSBiZSBkaWZmZXJlbnRcbiAgICogZnJvbSB0aGF0IG9mIHJldHVybmVkIGxpc3QgYEZbXWAuXG4gICAqL1xuICBmbGF0dGVuTm9kZXMoc3RydWN0dXJlZERhdGE6IFRbXSk6IEZbXSB7XG4gICAgbGV0IHJlc3VsdE5vZGVzOiBGW10gPSBbXTtcbiAgICBzdHJ1Y3R1cmVkRGF0YS5mb3JFYWNoKG5vZGUgPT4gdGhpcy5fZmxhdHRlbk5vZGUobm9kZSwgMCwgcmVzdWx0Tm9kZXMsIFtdKSk7XG4gICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZCBmbGF0dGVuZWQgbm9kZSB3aXRoIGN1cnJlbnQgZXhwYW5zaW9uIHN0YXR1cy5cbiAgICogVGhlIHJldHVybmVkIGxpc3QgbWF5IGhhdmUgZGlmZmVyZW50IGxlbmd0aC5cbiAgICovXG4gIGV4cGFuZEZsYXR0ZW5lZE5vZGVzKG5vZGVzOiBGW10sIHRyZWVDb250cm9sOiBUcmVlQ29udHJvbDxGLCBLPik6IEZbXSB7XG4gICAgbGV0IHJlc3VsdHM6IEZbXSA9IFtdO1xuICAgIGxldCBjdXJyZW50RXhwYW5kOiBib29sZWFuW10gPSBbXTtcbiAgICBjdXJyZW50RXhwYW5kWzBdID0gdHJ1ZTtcblxuICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBsZXQgZXhwYW5kID0gdHJ1ZTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHRoaXMuZ2V0TGV2ZWwobm9kZSk7IGkrKykge1xuICAgICAgICBleHBhbmQgPSBleHBhbmQgJiYgY3VycmVudEV4cGFuZFtpXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHBhbmQpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaXNFeHBhbmRhYmxlKG5vZGUpKSB7XG4gICAgICAgIGN1cnJlbnRFeHBhbmRbdGhpcy5nZXRMZXZlbChub2RlKSArIDFdID0gdHJlZUNvbnRyb2wuaXNFeHBhbmRlZChub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG4vKipcbiAqIERhdGEgc291cmNlIGZvciBmbGF0IHRyZWUuXG4gKiBUaGUgZGF0YSBzb3VyY2UgbmVlZCB0byBoYW5kbGUgZXhwYW5zaW9uL2NvbGxhcHNpb24gb2YgdGhlIHRyZWUgbm9kZSBhbmQgY2hhbmdlIHRoZSBkYXRhIGZlZWRcbiAqIHRvIGBNYXRUcmVlYC5cbiAqIFRoZSBuZXN0ZWQgdHJlZSBub2RlcyBvZiB0eXBlIGBUYCBhcmUgZmxhdHRlbmVkIHRocm91Z2ggYE1hdFRyZWVGbGF0dGVuZXJgLCBhbmQgY29udmVydGVkXG4gKiB0byB0eXBlIGBGYCBmb3IgYE1hdFRyZWVgIHRvIGNvbnN1bWUuXG4gKlxuICogQGRlcHJlY2F0ZWQgVXNlIG9uZSBvZiBsZXZlbEFjY2Vzc29yIG9yIGNoaWxkcmVuQWNjZXNzb3IgaW5zdGVhZC4gVG8gYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZVxuICogdmVyc2lvbi5cbiAqIEBicmVha2luZy1jaGFuZ2UgMjEuMC4wXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUcmVlRmxhdERhdGFTb3VyY2U8VCwgRiwgSyA9IEY+IGV4dGVuZHMgRGF0YVNvdXJjZTxGPiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZsYXR0ZW5lZERhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEZbXT4oW10pO1xuICBwcml2YXRlIHJlYWRvbmx5IF9leHBhbmRlZERhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEZbXT4oW10pO1xuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnZhbHVlO1xuICB9XG4gIHNldCBkYXRhKHZhbHVlOiBUW10pIHtcbiAgICB0aGlzLl9kYXRhLm5leHQodmFsdWUpO1xuICAgIHRoaXMuX2ZsYXR0ZW5lZERhdGEubmV4dCh0aGlzLl90cmVlRmxhdHRlbmVyLmZsYXR0ZW5Ob2Rlcyh0aGlzLmRhdGEpKTtcbiAgICB0aGlzLl90cmVlQ29udHJvbC5kYXRhTm9kZXMgPSB0aGlzLl9mbGF0dGVuZWREYXRhLnZhbHVlO1xuICB9XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFRbXT4oW10pO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3RyZWVDb250cm9sOiBGbGF0VHJlZUNvbnRyb2w8RiwgSz4sXG4gICAgcHJpdmF0ZSBfdHJlZUZsYXR0ZW5lcjogTWF0VHJlZUZsYXR0ZW5lcjxULCBGLCBLPixcbiAgICBpbml0aWFsRGF0YT86IFRbXSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChpbml0aWFsRGF0YSkge1xuICAgICAgLy8gQXNzaWduIHRoZSBkYXRhIHRocm91Z2ggdGhlIGNvbnN0cnVjdG9yIHRvIGVuc3VyZSB0aGF0IGFsbCBvZiB0aGUgbG9naWMgaXMgZXhlY3V0ZWQuXG4gICAgICB0aGlzLmRhdGEgPSBpbml0aWFsRGF0YTtcbiAgICB9XG4gIH1cblxuICBjb25uZWN0KGNvbGxlY3Rpb25WaWV3ZXI6IENvbGxlY3Rpb25WaWV3ZXIpOiBPYnNlcnZhYmxlPEZbXT4ge1xuICAgIHJldHVybiBtZXJnZShcbiAgICAgIGNvbGxlY3Rpb25WaWV3ZXIudmlld0NoYW5nZSxcbiAgICAgIHRoaXMuX3RyZWVDb250cm9sLmV4cGFuc2lvbk1vZGVsLmNoYW5nZWQsXG4gICAgICB0aGlzLl9mbGF0dGVuZWREYXRhLFxuICAgICkucGlwZShcbiAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2V4cGFuZGVkRGF0YS5uZXh0KFxuICAgICAgICAgIHRoaXMuX3RyZWVGbGF0dGVuZXIuZXhwYW5kRmxhdHRlbmVkTm9kZXModGhpcy5fZmxhdHRlbmVkRGF0YS52YWx1ZSwgdGhpcy5fdHJlZUNvbnRyb2wpLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kZWREYXRhLnZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgLy8gbm8gb3BcbiAgfVxufVxuIl19