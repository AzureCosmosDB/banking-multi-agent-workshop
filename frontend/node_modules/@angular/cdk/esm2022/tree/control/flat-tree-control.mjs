/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseTreeControl } from './base-tree-control';
/**
 * Flat tree control. Able to expand/collapse a subtree recursively for flattened tree.
 *
 * @deprecated Use one of levelAccessor or childrenAccessor instead. To be removed in a future
 * version.
 * @breaking-change 21.0.0
 */
export class FlatTreeControl extends BaseTreeControl {
    /** Construct with flat tree data node functions getLevel and isExpandable. */
    constructor(getLevel, isExpandable, options) {
        super();
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.options = options;
        if (this.options) {
            this.trackBy = this.options.trackBy;
        }
    }
    /**
     * Gets a list of the data node's subtree of descendent data nodes.
     *
     * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
     * with correct levels.
     */
    getDescendants(dataNode) {
        const startIndex = this.dataNodes.indexOf(dataNode);
        const results = [];
        // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
        // The level of descendants of a tree node must be greater than the level of the given
        // tree node.
        // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
        // If we reach a node whose level is greater than the level of the tree node, we hit a
        // sibling of an ancestor.
        for (let i = startIndex + 1; i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]); i++) {
            results.push(this.dataNodes[i]);
        }
        return results;
    }
    /**
     * Expands all data nodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
     * data nodes of the tree.
     */
    expandAll() {
        this.expansionModel.select(...this.dataNodes.map(node => this._trackByValue(node)));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC10cmVlLWNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RyZWUvY29udHJvbC9mbGF0LXRyZWUtY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFPcEQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLGVBQTBCLFNBQVEsZUFBcUI7SUFDbEUsOEVBQThFO0lBQzlFLFlBQ2tCLFFBQWlDLEVBQ2pDLFlBQXNDLEVBQy9DLE9BQXNDO1FBRTdDLEtBQUssRUFBRSxDQUFDO1FBSlEsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUFDakMsaUJBQVksR0FBWixZQUFZLENBQTBCO1FBQy9DLFlBQU8sR0FBUCxPQUFPLENBQStCO1FBSTdDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDdEMsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxRQUFXO1FBQ3hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUV4Qix1RkFBdUY7UUFDdkYsc0ZBQXNGO1FBQ3RGLGFBQWE7UUFDYiwyRkFBMkY7UUFDM0Ysc0ZBQXNGO1FBQ3RGLDBCQUEwQjtRQUMxQixLQUNFLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEVBQ3RCLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RixDQUFDLEVBQUUsRUFDSCxDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQVM7UUFDUCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEYsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFzZVRyZWVDb250cm9sfSBmcm9tICcuL2Jhc2UtdHJlZS1jb250cm9sJztcblxuLyoqIE9wdGlvbmFsIHNldCBvZiBjb25maWd1cmF0aW9uIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHRvIHRoZSBGbGF0VHJlZUNvbnRyb2wuICovXG5leHBvcnQgaW50ZXJmYWNlIEZsYXRUcmVlQ29udHJvbE9wdGlvbnM8VCwgSz4ge1xuICB0cmFja0J5PzogKGRhdGFOb2RlOiBUKSA9PiBLO1xufVxuXG4vKipcbiAqIEZsYXQgdHJlZSBjb250cm9sLiBBYmxlIHRvIGV4cGFuZC9jb2xsYXBzZSBhIHN1YnRyZWUgcmVjdXJzaXZlbHkgZm9yIGZsYXR0ZW5lZCB0cmVlLlxuICpcbiAqIEBkZXByZWNhdGVkIFVzZSBvbmUgb2YgbGV2ZWxBY2Nlc3NvciBvciBjaGlsZHJlbkFjY2Vzc29yIGluc3RlYWQuIFRvIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmVcbiAqIHZlcnNpb24uXG4gKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMFxuICovXG5leHBvcnQgY2xhc3MgRmxhdFRyZWVDb250cm9sPFQsIEsgPSBUPiBleHRlbmRzIEJhc2VUcmVlQ29udHJvbDxULCBLPiB7XG4gIC8qKiBDb25zdHJ1Y3Qgd2l0aCBmbGF0IHRyZWUgZGF0YSBub2RlIGZ1bmN0aW9ucyBnZXRMZXZlbCBhbmQgaXNFeHBhbmRhYmxlLiAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0TGV2ZWw6IChkYXRhTm9kZTogVCkgPT4gbnVtYmVyLFxuICAgIHB1YmxpYyBvdmVycmlkZSBpc0V4cGFuZGFibGU6IChkYXRhTm9kZTogVCkgPT4gYm9vbGVhbixcbiAgICBwdWJsaWMgb3B0aW9ucz86IEZsYXRUcmVlQ29udHJvbE9wdGlvbnM8VCwgSz4sXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICB0aGlzLnRyYWNrQnkgPSB0aGlzLm9wdGlvbnMudHJhY2tCeTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGxpc3Qgb2YgdGhlIGRhdGEgbm9kZSdzIHN1YnRyZWUgb2YgZGVzY2VuZGVudCBkYXRhIG5vZGVzLlxuICAgKlxuICAgKiBUbyBtYWtlIHRoaXMgd29ya2luZywgdGhlIGBkYXRhTm9kZXNgIG9mIHRoZSBUcmVlQ29udHJvbCBtdXN0IGJlIGZsYXR0ZW5lZCB0cmVlIG5vZGVzXG4gICAqIHdpdGggY29ycmVjdCBsZXZlbHMuXG4gICAqL1xuICBnZXREZXNjZW5kYW50cyhkYXRhTm9kZTogVCk6IFRbXSB7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMuZGF0YU5vZGVzLmluZGV4T2YoZGF0YU5vZGUpO1xuICAgIGNvbnN0IHJlc3VsdHM6IFRbXSA9IFtdO1xuXG4gICAgLy8gR29lcyB0aHJvdWdoIGZsYXR0ZW5lZCB0cmVlIG5vZGVzIGluIHRoZSBgZGF0YU5vZGVzYCBhcnJheSwgYW5kIGdldCBhbGwgZGVzY2VuZGFudHMuXG4gICAgLy8gVGhlIGxldmVsIG9mIGRlc2NlbmRhbnRzIG9mIGEgdHJlZSBub2RlIG11c3QgYmUgZ3JlYXRlciB0aGFuIHRoZSBsZXZlbCBvZiB0aGUgZ2l2ZW5cbiAgICAvLyB0cmVlIG5vZGUuXG4gICAgLy8gSWYgd2UgcmVhY2ggYSBub2RlIHdob3NlIGxldmVsIGlzIGVxdWFsIHRvIHRoZSBsZXZlbCBvZiB0aGUgdHJlZSBub2RlLCB3ZSBoaXQgYSBzaWJsaW5nLlxuICAgIC8vIElmIHdlIHJlYWNoIGEgbm9kZSB3aG9zZSBsZXZlbCBpcyBncmVhdGVyIHRoYW4gdGhlIGxldmVsIG9mIHRoZSB0cmVlIG5vZGUsIHdlIGhpdCBhXG4gICAgLy8gc2libGluZyBvZiBhbiBhbmNlc3Rvci5cbiAgICBmb3IgKFxuICAgICAgbGV0IGkgPSBzdGFydEluZGV4ICsgMTtcbiAgICAgIGkgPCB0aGlzLmRhdGFOb2Rlcy5sZW5ndGggJiYgdGhpcy5nZXRMZXZlbChkYXRhTm9kZSkgPCB0aGlzLmdldExldmVsKHRoaXMuZGF0YU5vZGVzW2ldKTtcbiAgICAgIGkrK1xuICAgICkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZGF0YU5vZGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyBhbGwgZGF0YSBub2RlcyBpbiB0aGUgdHJlZS5cbiAgICpcbiAgICogVG8gbWFrZSB0aGlzIHdvcmtpbmcsIHRoZSBgZGF0YU5vZGVzYCB2YXJpYWJsZSBvZiB0aGUgVHJlZUNvbnRyb2wgbXVzdCBiZSBzZXQgdG8gYWxsIGZsYXR0ZW5lZFxuICAgKiBkYXRhIG5vZGVzIG9mIHRoZSB0cmVlLlxuICAgKi9cbiAgZXhwYW5kQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuZXhwYW5zaW9uTW9kZWwuc2VsZWN0KC4uLnRoaXMuZGF0YU5vZGVzLm1hcChub2RlID0+IHRoaXMuX3RyYWNrQnlWYWx1ZShub2RlKSkpO1xuICB9XG59XG4iXX0=