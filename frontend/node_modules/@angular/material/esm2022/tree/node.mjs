/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CDK_TREE_NODE_OUTLET_NODE, CdkNestedTreeNode, CdkTree, CdkTreeNode, CdkTreeNodeDef, } from '@angular/cdk/tree';
import { Attribute, Directive, ElementRef, Input, IterableDiffers, booleanAttribute, numberAttribute, } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/tree";
/**
 * Determinte if argument TreeKeyManager is the NoopTreeKeyManager. This function is safe to use with SSR.
 */
function isNoopTreeKeyManager(keyManager) {
    return !!keyManager._isNoopTreeKeyManager;
}
/**
 * Wrapper for the CdkTree node with Material design styles.
 */
export class MatTreeNode extends CdkTreeNode {
    /**
     * The tabindex of the tree node.
     *
     * @deprecated By default MatTreeNode manages focus using TreeKeyManager instead of tabIndex.
     *   Recommend to avoid setting tabIndex directly to prevent TreeKeyManager form getting into
     *   an unexpected state. Tabindex to be removed in a future version.
     * @breaking-change 21.0.0 Remove this attribute.
     */
    get tabIndexInputBinding() {
        return this._tabIndexInputBinding;
    }
    set tabIndexInputBinding(value) {
        // If the specified tabIndex value is null or undefined, fall back to the default value.
        this._tabIndexInputBinding = value;
    }
    _getTabindexAttribute() {
        if (isNoopTreeKeyManager(this._tree._keyManager)) {
            return this.tabIndexInputBinding;
        }
        return this._tabindex;
    }
    /**
     * Whether the component is disabled.
     *
     * @deprecated This is an alias for `isDisabled`.
     * @breaking-change 21.0.0 Remove this input
     */
    get disabled() {
        return this.isDisabled;
    }
    set disabled(value) {
        this.isDisabled = value;
    }
    constructor(elementRef, tree, 
    /**
     * The tabindex of the tree node.
     *
     * @deprecated By default MatTreeNode manages focus using TreeKeyManager instead of tabIndex.
     *   Recommend to avoid setting tabIndex directly to prevent TreeKeyManager form getting into
     *   an unexpected state. Tabindex to be removed in a future version.
     * @breaking-change 21.0.0 Remove this attribute.
     */
    tabIndex) {
        super(elementRef, tree);
        /**
         * The default tabindex of the tree node.
         *
         * @deprecated By default MatTreeNode manages focus using TreeKeyManager instead of tabIndex.
         *   Recommend to avoid setting tabIndex directly to prevent TreeKeyManager form getting into
         *   an unexpected state. Tabindex to be removed in a future version.
         * @breaking-change 21.0.0 Remove this attribute.
         */
        this.defaultTabIndex = 0;
        this.tabIndexInputBinding = Number(tabIndex) || this.defaultTabIndex;
    }
    // This is a workaround for https://github.com/angular/angular/issues/23091
    // In aot mode, the lifecycle hooks from parent class are not called.
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTreeNode, deps: [{ token: i0.ElementRef }, { token: i1.CdkTree }, { token: 'tabindex', attribute: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatTreeNode, isStandalone: true, selector: "mat-tree-node", inputs: { tabIndexInputBinding: ["tabIndex", "tabIndexInputBinding", (value) => (value == null ? 0 : numberAttribute(value))], disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { activation: "activation", expandedChange: "expandedChange" }, host: { listeners: { "click": "_focusItem()" }, properties: { "attr.aria-expanded": "_getAriaExpanded()", "attr.aria-level": "level + 1", "attr.aria-posinset": "_getPositionInSet()", "attr.aria-setsize": "_getSetSize()", "tabindex": "_getTabindexAttribute()" }, classAttribute: "mat-tree-node" }, providers: [{ provide: CdkTreeNode, useExisting: MatTreeNode }], exportAs: ["matTreeNode"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTreeNode, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-tree-node',
                    exportAs: 'matTreeNode',
                    outputs: ['activation', 'expandedChange'],
                    providers: [{ provide: CdkTreeNode, useExisting: MatTreeNode }],
                    host: {
                        'class': 'mat-tree-node',
                        '[attr.aria-expanded]': '_getAriaExpanded()',
                        '[attr.aria-level]': 'level + 1',
                        '[attr.aria-posinset]': '_getPositionInSet()',
                        '[attr.aria-setsize]': '_getSetSize()',
                        '(click)': '_focusItem()',
                        '[tabindex]': '_getTabindexAttribute()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.CdkTree }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['tabindex']
                }] }], propDecorators: { tabIndexInputBinding: [{
                type: Input,
                args: [{
                        transform: (value) => (value == null ? 0 : numberAttribute(value)),
                        alias: 'tabIndex',
                    }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
/**
 * Wrapper for the CdkTree node definition with Material design styles.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
export class MatTreeNodeDef extends CdkTreeNodeDef {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTreeNodeDef, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatTreeNodeDef, isStandalone: true, selector: "[matTreeNodeDef]", inputs: { when: ["matTreeNodeDefWhen", "when"], data: ["matTreeNode", "data"] }, providers: [{ provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTreeNodeDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matTreeNodeDef]',
                    inputs: [{ name: 'when', alias: 'matTreeNodeDefWhen' }],
                    providers: [{ provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef }],
                    standalone: true,
                }]
        }], propDecorators: { data: [{
                type: Input,
                args: ['matTreeNode']
            }] } });
/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
export class MatNestedTreeNode extends CdkNestedTreeNode {
    /**
     * Whether the node is disabled.
     *
     * @deprecated This is an alias for `isDisabled`.
     * @breaking-change 21.0.0 Remove this input
     */
    get disabled() {
        return this.isDisabled;
    }
    set disabled(value) {
        this.isDisabled = value;
    }
    /** Tabindex of the node. */
    get tabIndex() {
        return this.isDisabled ? -1 : this._tabIndex;
    }
    set tabIndex(value) {
        // If the specified tabIndex value is null or undefined, fall back to the default value.
        this._tabIndex = value;
    }
    constructor(elementRef, tree, differs, 
    // Ignore tabindex attribute. MatTree manages its own active state using TreeKeyManager.
    // Keeping tabIndex in constructor for backwards compatibility with trees created before
    // introducing TreeKeyManager.
    tabIndex) {
        super(elementRef, tree, differs);
    }
    // This is a workaround for https://github.com/angular/angular/issues/19145
    // In aot mode, the lifecycle hooks from parent class are not called.
    // TODO(tinayuangao): Remove when the angular issue #19145 is fixed
    ngOnInit() {
        super.ngOnInit();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatNestedTreeNode, deps: [{ token: i0.ElementRef }, { token: i1.CdkTree }, { token: i0.IterableDiffers }, { token: 'tabindex', attribute: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: MatNestedTreeNode, isStandalone: true, selector: "mat-nested-tree-node", inputs: { node: ["matNestedTreeNode", "node"], disabled: ["disabled", "disabled", booleanAttribute], tabIndex: ["tabIndex", "tabIndex", (value) => (value == null ? 0 : numberAttribute(value))] }, outputs: { activation: "activation", expandedChange: "expandedChange" }, host: { classAttribute: "mat-nested-tree-node" }, providers: [
            { provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode },
            { provide: CdkTreeNode, useExisting: MatNestedTreeNode },
            { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode },
        ], exportAs: ["matNestedTreeNode"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatNestedTreeNode, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-nested-tree-node',
                    exportAs: 'matNestedTreeNode',
                    outputs: ['activation', 'expandedChange'],
                    providers: [
                        { provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode },
                        { provide: CdkTreeNode, useExisting: MatNestedTreeNode },
                        { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode },
                    ],
                    host: {
                        'class': 'mat-nested-tree-node',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.CdkTree }, { type: i0.IterableDiffers }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['tabindex']
                }] }], propDecorators: { node: [{
                type: Input,
                args: ['matNestedTreeNode']
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], tabIndex: [{
                type: Input,
                args: [{
                        transform: (value) => (value == null ? 0 : numberAttribute(value)),
                    }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsT0FBTyxFQUNQLFdBQVcsRUFDWCxjQUFjLEdBQ2YsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBRUwsU0FBUyxFQUNULFNBQVMsRUFDVCxVQUFVLEVBQ1YsS0FBSyxFQUNMLGVBQWUsRUFHZixnQkFBZ0IsRUFDaEIsZUFBZSxHQUNoQixNQUFNLGVBQWUsQ0FBQzs7O0FBR3ZCOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsVUFBcUM7SUFFckMsT0FBTyxDQUFDLENBQUUsVUFBa0IsQ0FBQyxxQkFBcUIsQ0FBQztBQUNyRCxDQUFDO0FBRUQ7O0dBRUc7QUFpQkgsTUFBTSxPQUFPLFdBQXNCLFNBQVEsV0FBaUI7SUFDMUQ7Ozs7Ozs7T0FPRztJQUNILElBSUksb0JBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDO0lBQ3BDLENBQUM7SUFDRCxJQUFJLG9CQUFvQixDQUFDLEtBQWE7UUFDcEMsd0ZBQXdGO1FBQ3hGLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7SUFDckMsQ0FBQztJQWFTLHFCQUFxQjtRQUM3QixJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUNqRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBYztR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QUUsaUJBQWlCLEVBQUM7WUFDdEQsRUFBQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFDO1NBQ3JFOztrR0FNVSxpQkFBaUI7a0JBZDdCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDO29CQUN6QyxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxtQkFBbUIsRUFBQzt3QkFDNUQsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsbUJBQW1CLEVBQUM7d0JBQ3RELEVBQUMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLFdBQVcsbUJBQW1CLEVBQUM7cUJBQ3JFO29CQUNELElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsc0JBQXNCO3FCQUNoQztvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQXlDSSxTQUFTOzJCQUFDLFVBQVU7eUNBcENLLElBQUk7c0JBQS9CLEtBQUs7dUJBQUMsbUJBQW1CO2dCQVN0QixRQUFRO3NCQURYLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBWWhDLFFBQVE7c0JBSFgsS0FBSzt1QkFBQzt3QkFDTCxTQUFTLEVBQUUsQ0FBQyxLQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQzVFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENES19UUkVFX05PREVfT1VUTEVUX05PREUsXG4gIENka05lc3RlZFRyZWVOb2RlLFxuICBDZGtUcmVlLFxuICBDZGtUcmVlTm9kZSxcbiAgQ2RrVHJlZU5vZGVEZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90cmVlJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Tm9vcFRyZWVLZXlNYW5hZ2VyLCBUcmVlS2V5TWFuYWdlckl0ZW0sIFRyZWVLZXlNYW5hZ2VyU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcblxuLyoqXG4gKiBEZXRlcm1pbnRlIGlmIGFyZ3VtZW50IFRyZWVLZXlNYW5hZ2VyIGlzIHRoZSBOb29wVHJlZUtleU1hbmFnZXIuIFRoaXMgZnVuY3Rpb24gaXMgc2FmZSB0byB1c2Ugd2l0aCBTU1IuXG4gKi9cbmZ1bmN0aW9uIGlzTm9vcFRyZWVLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBUcmVlS2V5TWFuYWdlckl0ZW0+KFxuICBrZXlNYW5hZ2VyOiBUcmVlS2V5TWFuYWdlclN0cmF0ZWd5PFQ+LFxuKToga2V5TWFuYWdlciBpcyBOb29wVHJlZUtleU1hbmFnZXI8VD4ge1xuICByZXR1cm4gISEoa2V5TWFuYWdlciBhcyBhbnkpLl9pc05vb3BUcmVlS2V5TWFuYWdlcjtcbn1cblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVHJlZSBub2RlIHdpdGggTWF0ZXJpYWwgZGVzaWduIHN0eWxlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LXRyZWUtbm9kZScsXG4gIGV4cG9ydEFzOiAnbWF0VHJlZU5vZGUnLFxuICBvdXRwdXRzOiBbJ2FjdGl2YXRpb24nLCAnZXhwYW5kZWRDaGFuZ2UnXSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENka1RyZWVOb2RlLCB1c2VFeGlzdGluZzogTWF0VHJlZU5vZGV9XSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtdHJlZS1ub2RlJyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnX2dldEFyaWFFeHBhbmRlZCgpJyxcbiAgICAnW2F0dHIuYXJpYS1sZXZlbF0nOiAnbGV2ZWwgKyAxJyxcbiAgICAnW2F0dHIuYXJpYS1wb3NpbnNldF0nOiAnX2dldFBvc2l0aW9uSW5TZXQoKScsXG4gICAgJ1thdHRyLmFyaWEtc2V0c2l6ZV0nOiAnX2dldFNldFNpemUoKScsXG4gICAgJyhjbGljayknOiAnX2ZvY3VzSXRlbSgpJyxcbiAgICAnW3RhYmluZGV4XSc6ICdfZ2V0VGFiaW5kZXhBdHRyaWJ1dGUoKScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRyZWVOb2RlPFQsIEsgPSBUPiBleHRlbmRzIENka1RyZWVOb2RlPFQsIEs+IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogVGhlIHRhYmluZGV4IG9mIHRoZSB0cmVlIG5vZGUuXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIEJ5IGRlZmF1bHQgTWF0VHJlZU5vZGUgbWFuYWdlcyBmb2N1cyB1c2luZyBUcmVlS2V5TWFuYWdlciBpbnN0ZWFkIG9mIHRhYkluZGV4LlxuICAgKiAgIFJlY29tbWVuZCB0byBhdm9pZCBzZXR0aW5nIHRhYkluZGV4IGRpcmVjdGx5IHRvIHByZXZlbnQgVHJlZUtleU1hbmFnZXIgZm9ybSBnZXR0aW5nIGludG9cbiAgICogICBhbiB1bmV4cGVjdGVkIHN0YXRlLiBUYWJpbmRleCB0byBiZSByZW1vdmVkIGluIGEgZnV0dXJlIHZlcnNpb24uXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMjEuMC4wIFJlbW92ZSB0aGlzIGF0dHJpYnV0ZS5cbiAgICovXG4gIEBJbnB1dCh7XG4gICAgdHJhbnNmb3JtOiAodmFsdWU6IHVua25vd24pID0+ICh2YWx1ZSA9PSBudWxsID8gMCA6IG51bWJlckF0dHJpYnV0ZSh2YWx1ZSkpLFxuICAgIGFsaWFzOiAndGFiSW5kZXgnLFxuICB9KVxuICBnZXQgdGFiSW5kZXhJbnB1dEJpbmRpbmcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdGFiSW5kZXhJbnB1dEJpbmRpbmc7XG4gIH1cbiAgc2V0IHRhYkluZGV4SW5wdXRCaW5kaW5nKHZhbHVlOiBudW1iZXIpIHtcbiAgICAvLyBJZiB0aGUgc3BlY2lmaWVkIHRhYkluZGV4IHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBmYWxsIGJhY2sgdG8gdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgdGhpcy5fdGFiSW5kZXhJbnB1dEJpbmRpbmcgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF90YWJJbmRleElucHV0QmluZGluZzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCB0YWJpbmRleCBvZiB0aGUgdHJlZSBub2RlLlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBCeSBkZWZhdWx0IE1hdFRyZWVOb2RlIG1hbmFnZXMgZm9jdXMgdXNpbmcgVHJlZUtleU1hbmFnZXIgaW5zdGVhZCBvZiB0YWJJbmRleC5cbiAgICogICBSZWNvbW1lbmQgdG8gYXZvaWQgc2V0dGluZyB0YWJJbmRleCBkaXJlY3RseSB0byBwcmV2ZW50IFRyZWVLZXlNYW5hZ2VyIGZvcm0gZ2V0dGluZyBpbnRvXG4gICAqICAgYW4gdW5leHBlY3RlZCBzdGF0ZS4gVGFiaW5kZXggdG8gYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMCBSZW1vdmUgdGhpcyBhdHRyaWJ1dGUuXG4gICAqL1xuICBkZWZhdWx0VGFiSW5kZXggPSAwO1xuXG4gIHByb3RlY3RlZCBfZ2V0VGFiaW5kZXhBdHRyaWJ1dGUoKSB7XG4gICAgaWYgKGlzTm9vcFRyZWVLZXlNYW5hZ2VyKHRoaXMuX3RyZWUuX2tleU1hbmFnZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50YWJJbmRleElucHV0QmluZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3RhYmluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgVGhpcyBpcyBhbiBhbGlhcyBmb3IgYGlzRGlzYWJsZWRgLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMCBSZW1vdmUgdGhpcyBpbnB1dFxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNEaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmlzRGlzYWJsZWQgPSB2YWx1ZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHRyZWU6IENka1RyZWU8VCwgSz4sXG4gICAgLyoqXG4gICAgICogVGhlIHRhYmluZGV4IG9mIHRoZSB0cmVlIG5vZGUuXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZCBCeSBkZWZhdWx0IE1hdFRyZWVOb2RlIG1hbmFnZXMgZm9jdXMgdXNpbmcgVHJlZUtleU1hbmFnZXIgaW5zdGVhZCBvZiB0YWJJbmRleC5cbiAgICAgKiAgIFJlY29tbWVuZCB0byBhdm9pZCBzZXR0aW5nIHRhYkluZGV4IGRpcmVjdGx5IHRvIHByZXZlbnQgVHJlZUtleU1hbmFnZXIgZm9ybSBnZXR0aW5nIGludG9cbiAgICAgKiAgIGFuIHVuZXhwZWN0ZWQgc3RhdGUuIFRhYmluZGV4IHRvIGJlIHJlbW92ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbi5cbiAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMCBSZW1vdmUgdGhpcyBhdHRyaWJ1dGUuXG4gICAgICovXG4gICAgQEF0dHJpYnV0ZSgndGFiaW5kZXgnKSB0YWJJbmRleDogc3RyaW5nLFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCB0cmVlKTtcblxuICAgIHRoaXMudGFiSW5kZXhJbnB1dEJpbmRpbmcgPSBOdW1iZXIodGFiSW5kZXgpIHx8IHRoaXMuZGVmYXVsdFRhYkluZGV4O1xuICB9XG5cbiAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzIzMDkxXG4gIC8vIEluIGFvdCBtb2RlLCB0aGUgbGlmZWN5Y2xlIGhvb2tzIGZyb20gcGFyZW50IGNsYXNzIGFyZSBub3QgY2FsbGVkLlxuICBvdmVycmlkZSBuZ09uSW5pdCgpIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXBwZXIgZm9yIHRoZSBDZGtUcmVlIG5vZGUgZGVmaW5pdGlvbiB3aXRoIE1hdGVyaWFsIGRlc2lnbiBzdHlsZXMuXG4gKiBDYXB0dXJlcyB0aGUgbm9kZSdzIHRlbXBsYXRlIGFuZCBhIHdoZW4gcHJlZGljYXRlIHRoYXQgZGVzY3JpYmVzIHdoZW4gdGhpcyBub2RlIHNob3VsZCBiZSB1c2VkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0VHJlZU5vZGVEZWZdJyxcbiAgaW5wdXRzOiBbe25hbWU6ICd3aGVuJywgYWxpYXM6ICdtYXRUcmVlTm9kZURlZldoZW4nfV0sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBDZGtUcmVlTm9kZURlZiwgdXNlRXhpc3Rpbmc6IE1hdFRyZWVOb2RlRGVmfV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRyZWVOb2RlRGVmPFQ+IGV4dGVuZHMgQ2RrVHJlZU5vZGVEZWY8VD4ge1xuICBASW5wdXQoJ21hdFRyZWVOb2RlJykgZGF0YTogVDtcbn1cblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVHJlZSBuZXN0ZWQgbm9kZSB3aXRoIE1hdGVyaWFsIGRlc2lnbiBzdHlsZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ21hdC1uZXN0ZWQtdHJlZS1ub2RlJyxcbiAgZXhwb3J0QXM6ICdtYXROZXN0ZWRUcmVlTm9kZScsXG4gIG91dHB1dHM6IFsnYWN0aXZhdGlvbicsICdleHBhbmRlZENoYW5nZSddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTmVzdGVkVHJlZU5vZGUsIHVzZUV4aXN0aW5nOiBNYXROZXN0ZWRUcmVlTm9kZX0sXG4gICAge3Byb3ZpZGU6IENka1RyZWVOb2RlLCB1c2VFeGlzdGluZzogTWF0TmVzdGVkVHJlZU5vZGV9LFxuICAgIHtwcm92aWRlOiBDREtfVFJFRV9OT0RFX09VVExFVF9OT0RFLCB1c2VFeGlzdGluZzogTWF0TmVzdGVkVHJlZU5vZGV9LFxuICBdLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1uZXN0ZWQtdHJlZS1ub2RlJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TmVzdGVkVHJlZU5vZGU8VCwgSyA9IFQ+XG4gIGV4dGVuZHMgQ2RrTmVzdGVkVHJlZU5vZGU8VCwgSz5cbiAgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3ksIE9uSW5pdFxue1xuICBASW5wdXQoJ21hdE5lc3RlZFRyZWVOb2RlJykgbm9kZTogVDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgbm9kZSBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgVGhpcyBpcyBhbiBhbGlhcyBmb3IgYGlzRGlzYWJsZWRgLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMCBSZW1vdmUgdGhpcyBpbnB1dFxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNEaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmlzRGlzYWJsZWQgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBUYWJpbmRleCBvZiB0aGUgbm9kZS4gKi9cbiAgQElucHV0KHtcbiAgICB0cmFuc2Zvcm06ICh2YWx1ZTogdW5rbm93bikgPT4gKHZhbHVlID09IG51bGwgPyAwIDogbnVtYmVyQXR0cmlidXRlKHZhbHVlKSksXG4gIH0pXG4gIGdldCB0YWJJbmRleCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmlzRGlzYWJsZWQgPyAtMSA6IHRoaXMuX3RhYkluZGV4O1xuICB9XG4gIHNldCB0YWJJbmRleCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgLy8gSWYgdGhlIHNwZWNpZmllZCB0YWJJbmRleCB2YWx1ZSBpcyBudWxsIG9yIHVuZGVmaW5lZCwgZmFsbCBiYWNrIHRvIHRoZSBkZWZhdWx0IHZhbHVlLlxuICAgIHRoaXMuX3RhYkluZGV4ID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfdGFiSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICB0cmVlOiBDZGtUcmVlPFQsIEs+LFxuICAgIGRpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICAvLyBJZ25vcmUgdGFiaW5kZXggYXR0cmlidXRlLiBNYXRUcmVlIG1hbmFnZXMgaXRzIG93biBhY3RpdmUgc3RhdGUgdXNpbmcgVHJlZUtleU1hbmFnZXIuXG4gICAgLy8gS2VlcGluZyB0YWJJbmRleCBpbiBjb25zdHJ1Y3RvciBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCB0cmVlcyBjcmVhdGVkIGJlZm9yZVxuICAgIC8vIGludHJvZHVjaW5nIFRyZWVLZXlNYW5hZ2VyLlxuICAgIEBBdHRyaWJ1dGUoJ3RhYmluZGV4JykgdGFiSW5kZXg6IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgdHJlZSwgZGlmZmVycyk7XG4gIH1cblxuICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTkxNDVcbiAgLy8gSW4gYW90IG1vZGUsIHRoZSBsaWZlY3ljbGUgaG9va3MgZnJvbSBwYXJlbnQgY2xhc3MgYXJlIG5vdCBjYWxsZWQuXG4gIC8vIFRPRE8odGluYXl1YW5nYW8pOiBSZW1vdmUgd2hlbiB0aGUgYW5ndWxhciBpc3N1ZSAjMTkxNDUgaXMgZml4ZWRcbiAgb3ZlcnJpZGUgbmdPbkluaXQoKSB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==