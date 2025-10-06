/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, booleanAttribute } from '@angular/core';
import { CdkTree, CdkTreeNode } from './tree';
import * as i0 from "@angular/core";
import * as i1 from "./tree";
/**
 * Node toggle to expand and collapse the node.
 */
export class CdkTreeNodeToggle {
    constructor(_tree, _treeNode) {
        this._tree = _tree;
        this._treeNode = _treeNode;
        /** Whether expand/collapse the node recursively. */
        this.recursive = false;
    }
    // Toggle the expanded or collapsed state of this node.
    //
    // Focus this node with expanding or collapsing it. This ensures that the active node will always
    // be visible when expanding and collapsing.
    _toggle() {
        this.recursive
            ? this._tree.toggleDescendants(this._treeNode.data)
            : this._tree.toggle(this._treeNode.data);
        this._tree._keyManager.focusItem(this._treeNode);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeNodeToggle, deps: [{ token: i1.CdkTree }, { token: i1.CdkTreeNode }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkTreeNodeToggle, isStandalone: true, selector: "[cdkTreeNodeToggle]", inputs: { recursive: ["cdkTreeNodeToggleRecursive", "recursive", booleanAttribute] }, host: { attributes: { "tabindex": "-1" }, listeners: { "click": "_toggle(); $event.stopPropagation();", "keydown.Enter": "_toggle(); $event.preventDefault();", "keydown.Space": "_toggle(); $event.preventDefault();" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeNodeToggle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTreeNodeToggle]',
                    host: {
                        '(click)': '_toggle(); $event.stopPropagation();',
                        '(keydown.Enter)': '_toggle(); $event.preventDefault();',
                        '(keydown.Space)': '_toggle(); $event.preventDefault();',
                        'tabindex': '-1',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.CdkTree }, { type: i1.CdkTreeNode }], propDecorators: { recursive: [{
                type: Input,
                args: [{ alias: 'cdkTreeNodeToggleRecursive', transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90cmVlL3RvZ2dsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7O0FBRTVDOztHQUVHO0FBV0gsTUFBTSxPQUFPLGlCQUFpQjtJQUs1QixZQUNZLEtBQW9CLEVBQ3BCLFNBQTRCO1FBRDVCLFVBQUssR0FBTCxLQUFLLENBQWU7UUFDcEIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFOeEMsb0RBQW9EO1FBRXBELGNBQVMsR0FBWSxLQUFLLENBQUM7SUFLeEIsQ0FBQztJQUVKLHVEQUF1RDtJQUN2RCxFQUFFO0lBQ0YsaUdBQWlHO0lBQ2pHLDRDQUE0QztJQUM1QyxPQUFPO1FBQ0wsSUFBSSxDQUFDLFNBQVM7WUFDWixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNuRCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7cUhBcEJVLGlCQUFpQjt5R0FBakIsaUJBQWlCLHdIQUU0QixnQkFBZ0I7O2tHQUY3RCxpQkFBaUI7a0JBVjdCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsSUFBSSxFQUFFO3dCQUNKLFNBQVMsRUFBRSxzQ0FBc0M7d0JBQ2pELGlCQUFpQixFQUFFLHFDQUFxQzt3QkFDeEQsaUJBQWlCLEVBQUUscUNBQXFDO3dCQUN4RCxVQUFVLEVBQUUsSUFBSTtxQkFDakI7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO3NHQUlDLFNBQVM7c0JBRFIsS0FBSzt1QkFBQyxFQUFDLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIElucHV0LCBib29sZWFuQXR0cmlidXRlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDZGtUcmVlLCBDZGtUcmVlTm9kZX0gZnJvbSAnLi90cmVlJztcblxuLyoqXG4gKiBOb2RlIHRvZ2dsZSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBub2RlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVHJlZU5vZGVUb2dnbGVdJyxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ190b2dnbGUoKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOycsXG4gICAgJyhrZXlkb3duLkVudGVyKSc6ICdfdG9nZ2xlKCk7ICRldmVudC5wcmV2ZW50RGVmYXVsdCgpOycsXG4gICAgJyhrZXlkb3duLlNwYWNlKSc6ICdfdG9nZ2xlKCk7ICRldmVudC5wcmV2ZW50RGVmYXVsdCgpOycsXG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVHJlZU5vZGVUb2dnbGU8VCwgSyA9IFQ+IHtcbiAgLyoqIFdoZXRoZXIgZXhwYW5kL2NvbGxhcHNlIHRoZSBub2RlIHJlY3Vyc2l2ZWx5LiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrVHJlZU5vZGVUb2dnbGVSZWN1cnNpdmUnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICByZWN1cnNpdmU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX3RyZWU6IENka1RyZWU8VCwgSz4sXG4gICAgcHJvdGVjdGVkIF90cmVlTm9kZTogQ2RrVHJlZU5vZGU8VCwgSz4sXG4gICkge31cblxuICAvLyBUb2dnbGUgdGhlIGV4cGFuZGVkIG9yIGNvbGxhcHNlZCBzdGF0ZSBvZiB0aGlzIG5vZGUuXG4gIC8vXG4gIC8vIEZvY3VzIHRoaXMgbm9kZSB3aXRoIGV4cGFuZGluZyBvciBjb2xsYXBzaW5nIGl0LiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgYWN0aXZlIG5vZGUgd2lsbCBhbHdheXNcbiAgLy8gYmUgdmlzaWJsZSB3aGVuIGV4cGFuZGluZyBhbmQgY29sbGFwc2luZy5cbiAgX3RvZ2dsZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlY3Vyc2l2ZVxuICAgICAgPyB0aGlzLl90cmVlLnRvZ2dsZURlc2NlbmRhbnRzKHRoaXMuX3RyZWVOb2RlLmRhdGEpXG4gICAgICA6IHRoaXMuX3RyZWUudG9nZ2xlKHRoaXMuX3RyZWVOb2RlLmRhdGEpO1xuXG4gICAgdGhpcy5fdHJlZS5fa2V5TWFuYWdlci5mb2N1c0l0ZW0odGhpcy5fdHJlZU5vZGUpO1xuICB9XG59XG4iXX0=