/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
/** Context provided to the tree node component. */
export class CdkTreeNodeOutletContext {
    constructor(data) {
        this.$implicit = data;
    }
}
/**
 * Data node definition for the CdkTree.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
export class CdkTreeNodeDef {
    /** @docs-private */
    constructor(template) {
        this.template = template;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeNodeDef, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkTreeNodeDef, isStandalone: true, selector: "[cdkTreeNodeDef]", inputs: { when: ["cdkTreeNodeDefWhen", "when"] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeNodeDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTreeNodeDef]',
                    inputs: [{ name: 'when', alias: 'cdkTreeNodeDefWhen' }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUVyRCxtREFBbUQ7QUFDbkQsTUFBTSxPQUFPLHdCQUF3QjtJQWFuQyxZQUFZLElBQU87UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBRUQ7OztHQUdHO0FBTUgsTUFBTSxPQUFPLGNBQWM7SUFVekIsb0JBQW9CO0lBQ3BCLFlBQW1CLFFBQTBCO1FBQTFCLGFBQVEsR0FBUixRQUFRLENBQWtCO0lBQUcsQ0FBQztxSEFYdEMsY0FBYzt5R0FBZCxjQUFjOztrR0FBZCxjQUFjO2tCQUwxQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLE1BQU0sRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQztvQkFDckQsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKiBDb250ZXh0IHByb3ZpZGVkIHRvIHRoZSB0cmVlIG5vZGUgY29tcG9uZW50LiAqL1xuZXhwb3J0IGNsYXNzIENka1RyZWVOb2RlT3V0bGV0Q29udGV4dDxUPiB7XG4gIC8qKiBEYXRhIGZvciB0aGUgbm9kZS4gKi9cbiAgJGltcGxpY2l0OiBUO1xuXG4gIC8qKiBEZXB0aCBvZiB0aGUgbm9kZS4gKi9cbiAgbGV2ZWw6IG51bWJlcjtcblxuICAvKiogSW5kZXggbG9jYXRpb24gb2YgdGhlIG5vZGUuICovXG4gIGluZGV4PzogbnVtYmVyO1xuXG4gIC8qKiBMZW5ndGggb2YgdGhlIG51bWJlciBvZiB0b3RhbCBkYXRhTm9kZXMuICovXG4gIGNvdW50PzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IFQpIHtcbiAgICB0aGlzLiRpbXBsaWNpdCA9IGRhdGE7XG4gIH1cbn1cblxuLyoqXG4gKiBEYXRhIG5vZGUgZGVmaW5pdGlvbiBmb3IgdGhlIENka1RyZWUuXG4gKiBDYXB0dXJlcyB0aGUgbm9kZSdzIHRlbXBsYXRlIGFuZCBhIHdoZW4gcHJlZGljYXRlIHRoYXQgZGVzY3JpYmVzIHdoZW4gdGhpcyBub2RlIHNob3VsZCBiZSB1c2VkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVHJlZU5vZGVEZWZdJyxcbiAgaW5wdXRzOiBbe25hbWU6ICd3aGVuJywgYWxpYXM6ICdjZGtUcmVlTm9kZURlZldoZW4nfV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1RyZWVOb2RlRGVmPFQ+IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiB0cnVlIGlmIHRoaXMgbm9kZSB0ZW1wbGF0ZSBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHByb3ZpZGVkIG5vZGVcbiAgICogZGF0YSBhbmQgaW5kZXguIElmIGxlZnQgdW5kZWZpbmVkLCB0aGlzIG5vZGUgd2lsbCBiZSBjb25zaWRlcmVkIHRoZSBkZWZhdWx0IG5vZGUgdGVtcGxhdGUgdG9cbiAgICogdXNlIHdoZW4gbm8gb3RoZXIgd2hlbiBmdW5jdGlvbnMgcmV0dXJuIHRydWUgZm9yIHRoZSBkYXRhLlxuICAgKiBGb3IgZXZlcnkgbm9kZSwgdGhlcmUgbXVzdCBiZSBhdCBsZWFzdCBvbmUgd2hlbiBmdW5jdGlvbiB0aGF0IHBhc3NlcyBvciBhbiB1bmRlZmluZWQgdG9cbiAgICogZGVmYXVsdC5cbiAgICovXG4gIHdoZW46IChpbmRleDogbnVtYmVyLCBub2RlRGF0YTogVCkgPT4gYm9vbGVhbjtcblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG4iXX0=