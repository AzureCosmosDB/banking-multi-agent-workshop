/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Directive, IterableDiffers, TemplateRef, ViewContainerRef, ViewEncapsulation, Inject, Optional, Input, booleanAttribute, } from '@angular/core';
import { CDK_TABLE } from './tokens';
import * as i0 from "@angular/core";
/**
 * The row template that can be used by the mat-table. Should not be used outside of the
 * material library.
 */
export const CDK_ROW_TEMPLATE = `<ng-container cdkCellOutlet></ng-container>`;
/**
 * Base class for the CdkHeaderRowDef and CdkRowDef that handles checking their columns inputs
 * for changes and notifying the table.
 */
export class BaseRowDef {
    constructor(
    /** @docs-private */ template, _differs) {
        this.template = template;
        this._differs = _differs;
    }
    ngOnChanges(changes) {
        // Create a new columns differ if one does not yet exist. Initialize it based on initial value
        // of the columns property or an empty array if none is provided.
        if (!this._columnsDiffer) {
            const columns = (changes['columns'] && changes['columns'].currentValue) || [];
            this._columnsDiffer = this._differs.find(columns).create();
            this._columnsDiffer.diff(columns);
        }
    }
    /**
     * Returns the difference between the current columns and the columns from the last diff, or null
     * if there is no difference.
     */
    getColumnsDiff() {
        return this._columnsDiffer.diff(this.columns);
    }
    /** Gets this row def's relevant cell template from the provided column def. */
    extractCellTemplate(column) {
        if (this instanceof CdkHeaderRowDef) {
            return column.headerCell.template;
        }
        if (this instanceof CdkFooterRowDef) {
            return column.footerCell.template;
        }
        else {
            return column.cell.template;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: BaseRowDef, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: BaseRowDef, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: BaseRowDef, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }] });
/**
 * Header row definition for the CDK table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
export class CdkHeaderRowDef extends BaseRowDef {
    /** Whether the row is sticky. */
    get sticky() {
        return this._sticky;
    }
    set sticky(value) {
        if (value !== this._sticky) {
            this._sticky = value;
            this._hasStickyChanged = true;
        }
    }
    constructor(template, _differs, _table) {
        super(template, _differs);
        this._table = _table;
        this._hasStickyChanged = false;
        this._sticky = false;
    }
    // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
    // Explicitly define it so that the method is called as part of the Angular lifecycle.
    ngOnChanges(changes) {
        super.ngOnChanges(changes);
    }
    /** Whether the sticky state has changed. */
    hasStickyChanged() {
        const hasStickyChanged = this._hasStickyChanged;
        this.resetStickyChanged();
        return hasStickyChanged;
    }
    /** Resets the sticky changed state. */
    resetStickyChanged() {
        this._hasStickyChanged = false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkHeaderRowDef, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: CDK_TABLE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkHeaderRowDef, isStandalone: true, selector: "[cdkHeaderRowDef]", inputs: { columns: ["cdkHeaderRowDef", "columns"], sticky: ["cdkHeaderRowDefSticky", "sticky", booleanAttribute] }, usesInheritance: true, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkHeaderRowDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkHeaderRowDef]',
                    inputs: [{ name: 'columns', alias: 'cdkHeaderRowDef' }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_TABLE]
                }, {
                    type: Optional
                }] }], propDecorators: { sticky: [{
                type: Input,
                args: [{ alias: 'cdkHeaderRowDefSticky', transform: booleanAttribute }]
            }] } });
/**
 * Footer row definition for the CDK table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
export class CdkFooterRowDef extends BaseRowDef {
    /** Whether the row is sticky. */
    get sticky() {
        return this._sticky;
    }
    set sticky(value) {
        if (value !== this._sticky) {
            this._sticky = value;
            this._hasStickyChanged = true;
        }
    }
    constructor(template, _differs, _table) {
        super(template, _differs);
        this._table = _table;
        this._hasStickyChanged = false;
        this._sticky = false;
    }
    // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
    // Explicitly define it so that the method is called as part of the Angular lifecycle.
    ngOnChanges(changes) {
        super.ngOnChanges(changes);
    }
    /** Whether the sticky state has changed. */
    hasStickyChanged() {
        const hasStickyChanged = this._hasStickyChanged;
        this.resetStickyChanged();
        return hasStickyChanged;
    }
    /** Resets the sticky changed state. */
    resetStickyChanged() {
        this._hasStickyChanged = false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkFooterRowDef, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: CDK_TABLE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkFooterRowDef, isStandalone: true, selector: "[cdkFooterRowDef]", inputs: { columns: ["cdkFooterRowDef", "columns"], sticky: ["cdkFooterRowDefSticky", "sticky", booleanAttribute] }, usesInheritance: true, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkFooterRowDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkFooterRowDef]',
                    inputs: [{ name: 'columns', alias: 'cdkFooterRowDef' }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_TABLE]
                }, {
                    type: Optional
                }] }], propDecorators: { sticky: [{
                type: Input,
                args: [{ alias: 'cdkFooterRowDefSticky', transform: booleanAttribute }]
            }] } });
/**
 * Data row definition for the CDK table.
 * Captures the header row's template and other row properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
export class CdkRowDef extends BaseRowDef {
    // TODO(andrewseguin): Add an input for providing a switch function to determine
    //   if this template should be used.
    constructor(template, _differs, _table) {
        super(template, _differs);
        this._table = _table;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkRowDef, deps: [{ token: i0.TemplateRef }, { token: i0.IterableDiffers }, { token: CDK_TABLE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkRowDef, isStandalone: true, selector: "[cdkRowDef]", inputs: { columns: ["cdkRowDefColumns", "columns"], when: ["cdkRowDefWhen", "when"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkRowDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRowDef]',
                    inputs: [
                        { name: 'columns', alias: 'cdkRowDefColumns' },
                        { name: 'when', alias: 'cdkRowDefWhen' },
                    ],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.IterableDiffers }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_TABLE]
                }, {
                    type: Optional
                }] }] });
/**
 * Outlet for rendering cells inside of a row or header row.
 * @docs-private
 */
export class CdkCellOutlet {
    /**
     * Static property containing the latest constructed instance of this class.
     * Used by the CDK table when each CdkHeaderRow and CdkRow component is created using
     * createEmbeddedView. After one of these components are created, this property will provide
     * a handle to provide that component's cells and context. After init, the CdkCellOutlet will
     * construct the cells with the provided context.
     */
    static { this.mostRecentCellOutlet = null; }
    constructor(_viewContainer) {
        this._viewContainer = _viewContainer;
        CdkCellOutlet.mostRecentCellOutlet = this;
    }
    ngOnDestroy() {
        // If this was the last outlet being rendered in the view, remove the reference
        // from the static property after it has been destroyed to avoid leaking memory.
        if (CdkCellOutlet.mostRecentCellOutlet === this) {
            CdkCellOutlet.mostRecentCellOutlet = null;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkCellOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkCellOutlet, isStandalone: true, selector: "[cdkCellOutlet]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkCellOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkCellOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }] });
/** Header template container that contains the cell outlet. Adds the right class and role. */
export class CdkHeaderRow {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkHeaderRow, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkHeaderRow, isStandalone: true, selector: "cdk-header-row, tr[cdk-header-row]", host: { attributes: { "role": "row" }, classAttribute: "cdk-header-row" }, ngImport: i0, template: "<ng-container cdkCellOutlet></ng-container>", isInline: true, dependencies: [{ kind: "directive", type: CdkCellOutlet, selector: "[cdkCellOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkHeaderRow, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-header-row, tr[cdk-header-row]',
                    template: CDK_ROW_TEMPLATE,
                    host: {
                        'class': 'cdk-header-row',
                        'role': 'row',
                    },
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: ChangeDetectionStrategy.Default,
                    encapsulation: ViewEncapsulation.None,
                    standalone: true,
                    imports: [CdkCellOutlet],
                }]
        }] });
/** Footer template container that contains the cell outlet. Adds the right class and role. */
export class CdkFooterRow {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkFooterRow, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkFooterRow, isStandalone: true, selector: "cdk-footer-row, tr[cdk-footer-row]", host: { attributes: { "role": "row" }, classAttribute: "cdk-footer-row" }, ngImport: i0, template: "<ng-container cdkCellOutlet></ng-container>", isInline: true, dependencies: [{ kind: "directive", type: CdkCellOutlet, selector: "[cdkCellOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkFooterRow, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-footer-row, tr[cdk-footer-row]',
                    template: CDK_ROW_TEMPLATE,
                    host: {
                        'class': 'cdk-footer-row',
                        'role': 'row',
                    },
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: ChangeDetectionStrategy.Default,
                    encapsulation: ViewEncapsulation.None,
                    standalone: true,
                    imports: [CdkCellOutlet],
                }]
        }] });
/** Data row template container that contains the cell outlet. Adds the right class and role. */
export class CdkRow {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkRow, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkRow, isStandalone: true, selector: "cdk-row, tr[cdk-row]", host: { attributes: { "role": "row" }, classAttribute: "cdk-row" }, ngImport: i0, template: "<ng-container cdkCellOutlet></ng-container>", isInline: true, dependencies: [{ kind: "directive", type: CdkCellOutlet, selector: "[cdkCellOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkRow, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-row, tr[cdk-row]',
                    template: CDK_ROW_TEMPLATE,
                    host: {
                        'class': 'cdk-row',
                        'role': 'row',
                    },
                    // See note on CdkTable for explanation on why this uses the default change detection strategy.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: ChangeDetectionStrategy.Default,
                    encapsulation: ViewEncapsulation.None,
                    standalone: true,
                    imports: [CdkCellOutlet],
                }]
        }] });
/** Row that can be used to display a message when no data is shown in the table. */
export class CdkNoDataRow {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._contentClassName = 'cdk-no-data-row';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkNoDataRow, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkNoDataRow, isStandalone: true, selector: "ng-template[cdkNoDataRow]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkNoDataRow, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkNoDataRow]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90YWJsZS9yb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsU0FBUyxFQUdULGVBQWUsRUFJZixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssRUFDTCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsNkNBQTZDLENBQUM7QUFFOUU7OztHQUdHO0FBRUgsTUFBTSxPQUFnQixVQUFVO0lBTzlCO0lBQ0Usb0JBQW9CLENBQVEsUUFBMEIsRUFDNUMsUUFBeUI7UUFEUCxhQUFRLEdBQVIsUUFBUSxDQUFrQjtRQUM1QyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtJQUNsQyxDQUFDO0lBRUosV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLDhGQUE4RjtRQUM5RixpRUFBaUU7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QixNQUFNLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzlFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELCtFQUErRTtJQUMvRSxtQkFBbUIsQ0FBQyxNQUFvQjtRQUN0QyxJQUFJLElBQUksWUFBWSxlQUFlLEVBQUUsQ0FBQztZQUNwQyxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3BDLENBQUM7UUFDRCxJQUFJLElBQUksWUFBWSxlQUFlLEVBQUUsQ0FBQztZQUNwQyxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3BDLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztxSEF4Q21CLFVBQVU7eUdBQVYsVUFBVTs7a0dBQVYsVUFBVTtrQkFEL0IsU0FBUzs7QUE0Q1Y7OztHQUdHO0FBTUgsTUFBTSxPQUFPLGVBQWdCLFNBQVEsVUFBVTtJQUc3QyxpQ0FBaUM7SUFDakMsSUFDSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxLQUFjO1FBQ3ZCLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBR0QsWUFDRSxRQUEwQixFQUMxQixRQUF5QixFQUNhLE1BQVk7UUFFbEQsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUZZLFdBQU0sR0FBTixNQUFNLENBQU07UUFsQjVDLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQWExQixZQUFPLEdBQUcsS0FBSyxDQUFDO0lBUXhCLENBQUM7SUFFRCw2RkFBNkY7SUFDN0Ysc0ZBQXNGO0lBQzdFLFdBQVcsQ0FBQyxPQUFzQjtRQUN6QyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCw0Q0FBNEM7SUFDNUMsZ0JBQWdCO1FBQ2QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDaEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsT0FBTyxnQkFBZ0IsQ0FBQztJQUMxQixDQUFDO0lBRUQsdUNBQXVDO0lBQ3ZDLGtCQUFrQjtRQUNoQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0lBQ2pDLENBQUM7cUhBeENVLGVBQWUsNEVBbUJoQixTQUFTO3lHQW5CUixlQUFlLG9KQUl5QixnQkFBZ0I7O2tHQUp4RCxlQUFlO2tCQUwzQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLE1BQU0sRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztvQkFDckQsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkFvQkksTUFBTTsyQkFBQyxTQUFTOzswQkFBRyxRQUFRO3lDQWQxQixNQUFNO3NCQURULEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDOztBQXVDdEU7OztHQUdHO0FBTUgsTUFBTSxPQUFPLGVBQWdCLFNBQVEsVUFBVTtJQUc3QyxpQ0FBaUM7SUFDakMsSUFDSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxLQUFjO1FBQ3ZCLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBR0QsWUFDRSxRQUEwQixFQUMxQixRQUF5QixFQUNhLE1BQVk7UUFFbEQsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUZZLFdBQU0sR0FBTixNQUFNLENBQU07UUFsQjVDLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQWExQixZQUFPLEdBQUcsS0FBSyxDQUFDO0lBUXhCLENBQUM7SUFFRCw2RkFBNkY7SUFDN0Ysc0ZBQXNGO0lBQzdFLFdBQVcsQ0FBQyxPQUFzQjtRQUN6QyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCw0Q0FBNEM7SUFDNUMsZ0JBQWdCO1FBQ2QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDaEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsT0FBTyxnQkFBZ0IsQ0FBQztJQUMxQixDQUFDO0lBRUQsdUNBQXVDO0lBQ3ZDLGtCQUFrQjtRQUNoQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0lBQ2pDLENBQUM7cUhBeENVLGVBQWUsNEVBbUJoQixTQUFTO3lHQW5CUixlQUFlLG9KQUl5QixnQkFBZ0I7O2tHQUp4RCxlQUFlO2tCQUwzQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLE1BQU0sRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztvQkFDckQsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkFvQkksTUFBTTsyQkFBQyxTQUFTOzswQkFBRyxRQUFRO3lDQWQxQixNQUFNO3NCQURULEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDOztBQXVDdEU7Ozs7R0FJRztBQVNILE1BQU0sT0FBTyxTQUFhLFNBQVEsVUFBVTtJQVMxQyxnRkFBZ0Y7SUFDaEYscUNBQXFDO0lBQ3JDLFlBQ0UsUUFBMEIsRUFDMUIsUUFBeUIsRUFDYSxNQUFZO1FBRWxELEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFGWSxXQUFNLEdBQU4sTUFBTSxDQUFNO0lBR3BELENBQUM7cUhBakJVLFNBQVMsNEVBY1YsU0FBUzt5R0FkUixTQUFTOztrR0FBVCxTQUFTO2tCQVJyQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxhQUFhO29CQUN2QixNQUFNLEVBQUU7d0JBQ04sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBQzt3QkFDNUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUM7cUJBQ3ZDO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBZUksTUFBTTsyQkFBQyxTQUFTOzswQkFBRyxRQUFROztBQTZEaEM7OztHQUdHO0FBS0gsTUFBTSxPQUFPLGFBQWE7SUFPeEI7Ozs7OztPQU1HO2FBQ0kseUJBQW9CLEdBQXlCLElBQUksQUFBN0IsQ0FBOEI7SUFFekQsWUFBbUIsY0FBZ0M7UUFBaEMsbUJBQWMsR0FBZCxjQUFjLENBQWtCO1FBQ2pELGFBQWEsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFDNUMsQ0FBQztJQUVELFdBQVc7UUFDVCwrRUFBK0U7UUFDL0UsZ0ZBQWdGO1FBQ2hGLElBQUksYUFBYSxDQUFDLG9CQUFvQixLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2hELGFBQWEsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7cUhBMUJVLGFBQWE7eUdBQWIsYUFBYTs7a0dBQWIsYUFBYTtrQkFKekIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7O0FBOEJELDhGQUE4RjtBQWU5RixNQUFNLE9BQU8sWUFBWTtxSEFBWixZQUFZO3lHQUFaLFlBQVksa1JBNUNaLGFBQWE7O2tHQTRDYixZQUFZO2tCQWR4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQ0FBb0M7b0JBQzlDLFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsZ0JBQWdCO3dCQUN6QixNQUFNLEVBQUUsS0FBSztxQkFDZDtvQkFDRCwrRkFBK0Y7b0JBQy9GLCtDQUErQztvQkFDL0MsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87b0JBQ2hELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO2lCQUN6Qjs7QUFHRCw4RkFBOEY7QUFlOUYsTUFBTSxPQUFPLFlBQVk7cUhBQVosWUFBWTt5R0FBWixZQUFZLGtSQTdEWixhQUFhOztrR0E2RGIsWUFBWTtrQkFkeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0NBQW9DO29CQUM5QyxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLGdCQUFnQjt3QkFDekIsTUFBTSxFQUFFLEtBQUs7cUJBQ2Q7b0JBQ0QsK0ZBQStGO29CQUMvRiwrQ0FBK0M7b0JBQy9DLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO29CQUNoRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtvQkFDckMsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztpQkFDekI7O0FBR0QsZ0dBQWdHO0FBZWhHLE1BQU0sT0FBTyxNQUFNO3FIQUFOLE1BQU07eUdBQU4sTUFBTSw2UEE5RU4sYUFBYTs7a0dBOEViLE1BQU07a0JBZGxCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxTQUFTO3dCQUNsQixNQUFNLEVBQUUsS0FBSztxQkFDZDtvQkFDRCwrRkFBK0Y7b0JBQy9GLCtDQUErQztvQkFDL0MsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87b0JBQ2hELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO2lCQUN6Qjs7QUFHRCxvRkFBb0Y7QUFLcEYsTUFBTSxPQUFPLFlBQVk7SUFFdkIsWUFBbUIsV0FBNkI7UUFBN0IsZ0JBQVcsR0FBWCxXQUFXLENBQWtCO1FBRGhELHNCQUFpQixHQUFHLGlCQUFpQixDQUFDO0lBQ2EsQ0FBQztxSEFGekMsWUFBWTt5R0FBWixZQUFZOztrR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSwyQkFBMkI7b0JBQ3JDLFVBQVUsRUFBRSxJQUFJO2lCQUNqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEl0ZXJhYmxlQ2hhbmdlcyxcbiAgSXRlcmFibGVEaWZmZXIsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgSW5wdXQsXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDYW5TdGlja30gZnJvbSAnLi9jYW4tc3RpY2snO1xuaW1wb3J0IHtDZGtDZWxsRGVmLCBDZGtDb2x1bW5EZWZ9IGZyb20gJy4vY2VsbCc7XG5pbXBvcnQge0NES19UQUJMRX0gZnJvbSAnLi90b2tlbnMnO1xuXG4vKipcbiAqIFRoZSByb3cgdGVtcGxhdGUgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGUgbWF0LXRhYmxlLiBTaG91bGQgbm90IGJlIHVzZWQgb3V0c2lkZSBvZiB0aGVcbiAqIG1hdGVyaWFsIGxpYnJhcnkuXG4gKi9cbmV4cG9ydCBjb25zdCBDREtfUk9XX1RFTVBMQVRFID0gYDxuZy1jb250YWluZXIgY2RrQ2VsbE91dGxldD48L25nLWNvbnRhaW5lcj5gO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIHRoZSBDZGtIZWFkZXJSb3dEZWYgYW5kIENka1Jvd0RlZiB0aGF0IGhhbmRsZXMgY2hlY2tpbmcgdGhlaXIgY29sdW1ucyBpbnB1dHNcbiAqIGZvciBjaGFuZ2VzIGFuZCBub3RpZnlpbmcgdGhlIHRhYmxlLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlUm93RGVmIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqIFRoZSBjb2x1bW5zIHRvIGJlIGRpc3BsYXllZCBvbiB0aGlzIHJvdy4gKi9cbiAgY29sdW1uczogSXRlcmFibGU8c3RyaW5nPjtcblxuICAvKiogRGlmZmVyIHVzZWQgdG8gY2hlY2sgaWYgYW55IGNoYW5nZXMgd2VyZSBtYWRlIHRvIHRoZSBjb2x1bW5zLiAqL1xuICBwcm90ZWN0ZWQgX2NvbHVtbnNEaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPGFueT47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzLXByaXZhdGUgKi8gcHVibGljIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHByb3RlY3RlZCBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICApIHt9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIC8vIENyZWF0ZSBhIG5ldyBjb2x1bW5zIGRpZmZlciBpZiBvbmUgZG9lcyBub3QgeWV0IGV4aXN0LiBJbml0aWFsaXplIGl0IGJhc2VkIG9uIGluaXRpYWwgdmFsdWVcbiAgICAvLyBvZiB0aGUgY29sdW1ucyBwcm9wZXJ0eSBvciBhbiBlbXB0eSBhcnJheSBpZiBub25lIGlzIHByb3ZpZGVkLlxuICAgIGlmICghdGhpcy5fY29sdW1uc0RpZmZlcikge1xuICAgICAgY29uc3QgY29sdW1ucyA9IChjaGFuZ2VzWydjb2x1bW5zJ10gJiYgY2hhbmdlc1snY29sdW1ucyddLmN1cnJlbnRWYWx1ZSkgfHwgW107XG4gICAgICB0aGlzLl9jb2x1bW5zRGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKGNvbHVtbnMpLmNyZWF0ZSgpO1xuICAgICAgdGhpcy5fY29sdW1uc0RpZmZlci5kaWZmKGNvbHVtbnMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGN1cnJlbnQgY29sdW1ucyBhbmQgdGhlIGNvbHVtbnMgZnJvbSB0aGUgbGFzdCBkaWZmLCBvciBudWxsXG4gICAqIGlmIHRoZXJlIGlzIG5vIGRpZmZlcmVuY2UuXG4gICAqL1xuICBnZXRDb2x1bW5zRGlmZigpOiBJdGVyYWJsZUNoYW5nZXM8YW55PiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb2x1bW5zRGlmZmVyLmRpZmYodGhpcy5jb2x1bW5zKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoaXMgcm93IGRlZidzIHJlbGV2YW50IGNlbGwgdGVtcGxhdGUgZnJvbSB0aGUgcHJvdmlkZWQgY29sdW1uIGRlZi4gKi9cbiAgZXh0cmFjdENlbGxUZW1wbGF0ZShjb2x1bW46IENka0NvbHVtbkRlZik6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgQ2RrSGVhZGVyUm93RGVmKSB7XG4gICAgICByZXR1cm4gY29sdW1uLmhlYWRlckNlbGwudGVtcGxhdGU7XG4gICAgfVxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgQ2RrRm9vdGVyUm93RGVmKSB7XG4gICAgICByZXR1cm4gY29sdW1uLmZvb3RlckNlbGwudGVtcGxhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb2x1bW4uY2VsbC50ZW1wbGF0ZTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBIZWFkZXIgcm93IGRlZmluaXRpb24gZm9yIHRoZSBDREsgdGFibGUuXG4gKiBDYXB0dXJlcyB0aGUgaGVhZGVyIHJvdydzIHRlbXBsYXRlIGFuZCBvdGhlciBoZWFkZXIgcHJvcGVydGllcyBzdWNoIGFzIHRoZSBjb2x1bW5zIHRvIGRpc3BsYXkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtIZWFkZXJSb3dEZWZdJyxcbiAgaW5wdXRzOiBbe25hbWU6ICdjb2x1bW5zJywgYWxpYXM6ICdjZGtIZWFkZXJSb3dEZWYnfV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka0hlYWRlclJvd0RlZiBleHRlbmRzIEJhc2VSb3dEZWYgaW1wbGVtZW50cyBDYW5TdGljaywgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBfaGFzU3RpY2t5Q2hhbmdlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSByb3cgaXMgc3RpY2t5LiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrSGVhZGVyUm93RGVmU3RpY2t5JywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IHN0aWNreSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RpY2t5O1xuICB9XG4gIHNldCBzdGlja3kodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX3N0aWNreSkge1xuICAgICAgdGhpcy5fc3RpY2t5ID0gdmFsdWU7XG4gICAgICB0aGlzLl9oYXNTdGlja3lDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfc3RpY2t5ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4sXG4gICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICBASW5qZWN0KENES19UQUJMRSkgQE9wdGlvbmFsKCkgcHVibGljIF90YWJsZT86IGFueSxcbiAgKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIF9kaWZmZXJzKTtcbiAgfVxuXG4gIC8vIFByZXJlbmRlciBmYWlscyB0byByZWNvZ25pemUgdGhhdCBuZ09uQ2hhbmdlcyBpbiBhIHBhcnQgb2YgdGhpcyBjbGFzcyB0aHJvdWdoIGluaGVyaXRhbmNlLlxuICAvLyBFeHBsaWNpdGx5IGRlZmluZSBpdCBzbyB0aGF0IHRoZSBtZXRob2QgaXMgY2FsbGVkIGFzIHBhcnQgb2YgdGhlIEFuZ3VsYXIgbGlmZWN5Y2xlLlxuICBvdmVycmlkZSBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkNoYW5nZXMoY2hhbmdlcyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3RpY2t5IHN0YXRlIGhhcyBjaGFuZ2VkLiAqL1xuICBoYXNTdGlja3lDaGFuZ2VkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGhhc1N0aWNreUNoYW5nZWQgPSB0aGlzLl9oYXNTdGlja3lDaGFuZ2VkO1xuICAgIHRoaXMucmVzZXRTdGlja3lDaGFuZ2VkKCk7XG4gICAgcmV0dXJuIGhhc1N0aWNreUNoYW5nZWQ7XG4gIH1cblxuICAvKiogUmVzZXRzIHRoZSBzdGlja3kgY2hhbmdlZCBzdGF0ZS4gKi9cbiAgcmVzZXRTdGlja3lDaGFuZ2VkKCk6IHZvaWQge1xuICAgIHRoaXMuX2hhc1N0aWNreUNoYW5nZWQgPSBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEZvb3RlciByb3cgZGVmaW5pdGlvbiBmb3IgdGhlIENESyB0YWJsZS5cbiAqIENhcHR1cmVzIHRoZSBmb290ZXIgcm93J3MgdGVtcGxhdGUgYW5kIG90aGVyIGZvb3RlciBwcm9wZXJ0aWVzIHN1Y2ggYXMgdGhlIGNvbHVtbnMgdG8gZGlzcGxheS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0Zvb3RlclJvd0RlZl0nLFxuICBpbnB1dHM6IFt7bmFtZTogJ2NvbHVtbnMnLCBhbGlhczogJ2Nka0Zvb3RlclJvd0RlZid9XSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRm9vdGVyUm93RGVmIGV4dGVuZHMgQmFzZVJvd0RlZiBpbXBsZW1lbnRzIENhblN0aWNrLCBPbkNoYW5nZXMge1xuICBwcml2YXRlIF9oYXNTdGlja3lDaGFuZ2VkID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHJvdyBpcyBzdGlja3kuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtGb290ZXJSb3dEZWZTdGlja3knLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgc3RpY2t5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdGlja3k7XG4gIH1cbiAgc2V0IHN0aWNreSh2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fc3RpY2t5KSB7XG4gICAgICB0aGlzLl9zdGlja3kgPSB2YWx1ZTtcbiAgICAgIHRoaXMuX2hhc1N0aWNreUNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9zdGlja3kgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PixcbiAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICAgIEBJbmplY3QoQ0RLX1RBQkxFKSBAT3B0aW9uYWwoKSBwdWJsaWMgX3RhYmxlPzogYW55LFxuICApIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgX2RpZmZlcnMpO1xuICB9XG5cbiAgLy8gUHJlcmVuZGVyIGZhaWxzIHRvIHJlY29nbml6ZSB0aGF0IG5nT25DaGFuZ2VzIGluIGEgcGFydCBvZiB0aGlzIGNsYXNzIHRocm91Z2ggaW5oZXJpdGFuY2UuXG4gIC8vIEV4cGxpY2l0bHkgZGVmaW5lIGl0IHNvIHRoYXQgdGhlIG1ldGhvZCBpcyBjYWxsZWQgYXMgcGFydCBvZiB0aGUgQW5ndWxhciBsaWZlY3ljbGUuXG4gIG92ZXJyaWRlIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzdGlja3kgc3RhdGUgaGFzIGNoYW5nZWQuICovXG4gIGhhc1N0aWNreUNoYW5nZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaGFzU3RpY2t5Q2hhbmdlZCA9IHRoaXMuX2hhc1N0aWNreUNoYW5nZWQ7XG4gICAgdGhpcy5yZXNldFN0aWNreUNoYW5nZWQoKTtcbiAgICByZXR1cm4gaGFzU3RpY2t5Q2hhbmdlZDtcbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIHN0aWNreSBjaGFuZ2VkIHN0YXRlLiAqL1xuICByZXNldFN0aWNreUNoYW5nZWQoKTogdm9pZCB7XG4gICAgdGhpcy5faGFzU3RpY2t5Q2hhbmdlZCA9IGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGF0YSByb3cgZGVmaW5pdGlvbiBmb3IgdGhlIENESyB0YWJsZS5cbiAqIENhcHR1cmVzIHRoZSBoZWFkZXIgcm93J3MgdGVtcGxhdGUgYW5kIG90aGVyIHJvdyBwcm9wZXJ0aWVzIHN1Y2ggYXMgdGhlIGNvbHVtbnMgdG8gZGlzcGxheSBhbmRcbiAqIGEgd2hlbiBwcmVkaWNhdGUgdGhhdCBkZXNjcmliZXMgd2hlbiB0aGlzIHJvdyBzaG91bGQgYmUgdXNlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1Jvd0RlZl0nLFxuICBpbnB1dHM6IFtcbiAgICB7bmFtZTogJ2NvbHVtbnMnLCBhbGlhczogJ2Nka1Jvd0RlZkNvbHVtbnMnfSxcbiAgICB7bmFtZTogJ3doZW4nLCBhbGlhczogJ2Nka1Jvd0RlZldoZW4nfSxcbiAgXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUm93RGVmPFQ+IGV4dGVuZHMgQmFzZVJvd0RlZiB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gdHJ1ZSBpZiB0aGlzIHJvdyB0ZW1wbGF0ZSBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHByb3ZpZGVkIGluZGV4XG4gICAqIGFuZCByb3cgZGF0YS4gSWYgbGVmdCB1bmRlZmluZWQsIHRoaXMgcm93IHdpbGwgYmUgY29uc2lkZXJlZCB0aGUgZGVmYXVsdCByb3cgdGVtcGxhdGUgdG8gdXNlXG4gICAqIHdoZW4gbm8gb3RoZXIgd2hlbiBmdW5jdGlvbnMgcmV0dXJuIHRydWUgZm9yIHRoZSBkYXRhLlxuICAgKiBGb3IgZXZlcnkgcm93LCB0aGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSB3aGVuIGZ1bmN0aW9uIHRoYXQgcGFzc2VzIG9yIGFuIHVuZGVmaW5lZCB0byBkZWZhdWx0LlxuICAgKi9cbiAgd2hlbjogKGluZGV4OiBudW1iZXIsIHJvd0RhdGE6IFQpID0+IGJvb2xlYW47XG5cbiAgLy8gVE9ETyhhbmRyZXdzZWd1aW4pOiBBZGQgYW4gaW5wdXQgZm9yIHByb3ZpZGluZyBhIHN3aXRjaCBmdW5jdGlvbiB0byBkZXRlcm1pbmVcbiAgLy8gICBpZiB0aGlzIHRlbXBsYXRlIHNob3VsZCBiZSB1c2VkLlxuICBjb25zdHJ1Y3RvcihcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PixcbiAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICAgIEBJbmplY3QoQ0RLX1RBQkxFKSBAT3B0aW9uYWwoKSBwdWJsaWMgX3RhYmxlPzogYW55LFxuICApIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgX2RpZmZlcnMpO1xuICB9XG59XG5cbi8qKiBDb250ZXh0IHByb3ZpZGVkIHRvIHRoZSByb3cgY2VsbHMgd2hlbiBgbXVsdGlUZW1wbGF0ZURhdGFSb3dzYCBpcyBmYWxzZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDZGtDZWxsT3V0bGV0Um93Q29udGV4dDxUPiB7XG4gIC8qKiBEYXRhIGZvciB0aGUgcm93IHRoYXQgdGhpcyBjZWxsIGlzIGxvY2F0ZWQgd2l0aGluLiAqL1xuICAkaW1wbGljaXQ/OiBUO1xuXG4gIC8qKiBJbmRleCBvZiB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHByb3ZpZGVkIGRhdGEgYXJyYXkuICovXG4gIGluZGV4PzogbnVtYmVyO1xuXG4gIC8qKiBMZW5ndGggb2YgdGhlIG51bWJlciBvZiB0b3RhbCByb3dzLiAqL1xuICBjb3VudD86IG51bWJlcjtcblxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIHRoZSBmaXJzdCByb3cuICovXG4gIGZpcnN0PzogYm9vbGVhbjtcblxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIHRoZSBsYXN0IHJvdy4gKi9cbiAgbGFzdD86IGJvb2xlYW47XG5cbiAgLyoqIFRydWUgaWYgdGhpcyBjZWxsIGlzIGNvbnRhaW5lZCBpbiBhIHJvdyB3aXRoIGFuIGV2ZW4tbnVtYmVyZWQgaW5kZXguICovXG4gIGV2ZW4/OiBib29sZWFuO1xuXG4gIC8qKiBUcnVlIGlmIHRoaXMgY2VsbCBpcyBjb250YWluZWQgaW4gYSByb3cgd2l0aCBhbiBvZGQtbnVtYmVyZWQgaW5kZXguICovXG4gIG9kZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ29udGV4dCBwcm92aWRlZCB0byB0aGUgcm93IGNlbGxzIHdoZW4gYG11bHRpVGVtcGxhdGVEYXRhUm93c2AgaXMgdHJ1ZS4gVGhpcyBjb250ZXh0IGlzIHRoZSBzYW1lXG4gKiBhcyBDZGtDZWxsT3V0bGV0Um93Q29udGV4dCBleGNlcHQgdGhhdCB0aGUgc2luZ2xlIGBpbmRleGAgdmFsdWUgaXMgcmVwbGFjZWQgYnkgYGRhdGFJbmRleGAgYW5kXG4gKiBgcmVuZGVySW5kZXhgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENka0NlbGxPdXRsZXRNdWx0aVJvd0NvbnRleHQ8VD4ge1xuICAvKiogRGF0YSBmb3IgdGhlIHJvdyB0aGF0IHRoaXMgY2VsbCBpcyBsb2NhdGVkIHdpdGhpbi4gKi9cbiAgJGltcGxpY2l0PzogVDtcblxuICAvKiogSW5kZXggb2YgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSBwcm92aWRlZCBkYXRhIGFycmF5LiAqL1xuICBkYXRhSW5kZXg/OiBudW1iZXI7XG5cbiAgLyoqIEluZGV4IGxvY2F0aW9uIG9mIHRoZSByZW5kZXJlZCByb3cgdGhhdCB0aGlzIGNlbGwgaXMgbG9jYXRlZCB3aXRoaW4uICovXG4gIHJlbmRlckluZGV4PzogbnVtYmVyO1xuXG4gIC8qKiBMZW5ndGggb2YgdGhlIG51bWJlciBvZiB0b3RhbCByb3dzLiAqL1xuICBjb3VudD86IG51bWJlcjtcblxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIHRoZSBmaXJzdCByb3cuICovXG4gIGZpcnN0PzogYm9vbGVhbjtcblxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIHRoZSBsYXN0IHJvdy4gKi9cbiAgbGFzdD86IGJvb2xlYW47XG5cbiAgLyoqIFRydWUgaWYgdGhpcyBjZWxsIGlzIGNvbnRhaW5lZCBpbiBhIHJvdyB3aXRoIGFuIGV2ZW4tbnVtYmVyZWQgaW5kZXguICovXG4gIGV2ZW4/OiBib29sZWFuO1xuXG4gIC8qKiBUcnVlIGlmIHRoaXMgY2VsbCBpcyBjb250YWluZWQgaW4gYSByb3cgd2l0aCBhbiBvZGQtbnVtYmVyZWQgaW5kZXguICovXG4gIG9kZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogT3V0bGV0IGZvciByZW5kZXJpbmcgY2VsbHMgaW5zaWRlIG9mIGEgcm93IG9yIGhlYWRlciByb3cuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDZWxsT3V0bGV0XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka0NlbGxPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogVGhlIG9yZGVyZWQgbGlzdCBvZiBjZWxscyB0byByZW5kZXIgd2l0aGluIHRoaXMgb3V0bGV0J3MgdmlldyBjb250YWluZXIgKi9cbiAgY2VsbHM6IENka0NlbGxEZWZbXTtcblxuICAvKiogVGhlIGRhdGEgY29udGV4dCB0byBiZSBwcm92aWRlZCB0byBlYWNoIGNlbGwgKi9cbiAgY29udGV4dDogYW55O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgcHJvcGVydHkgY29udGFpbmluZyB0aGUgbGF0ZXN0IGNvbnN0cnVjdGVkIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gICAqIFVzZWQgYnkgdGhlIENESyB0YWJsZSB3aGVuIGVhY2ggQ2RrSGVhZGVyUm93IGFuZCBDZGtSb3cgY29tcG9uZW50IGlzIGNyZWF0ZWQgdXNpbmdcbiAgICogY3JlYXRlRW1iZWRkZWRWaWV3LiBBZnRlciBvbmUgb2YgdGhlc2UgY29tcG9uZW50cyBhcmUgY3JlYXRlZCwgdGhpcyBwcm9wZXJ0eSB3aWxsIHByb3ZpZGVcbiAgICogYSBoYW5kbGUgdG8gcHJvdmlkZSB0aGF0IGNvbXBvbmVudCdzIGNlbGxzIGFuZCBjb250ZXh0LiBBZnRlciBpbml0LCB0aGUgQ2RrQ2VsbE91dGxldCB3aWxsXG4gICAqIGNvbnN0cnVjdCB0aGUgY2VsbHMgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dC5cbiAgICovXG4gIHN0YXRpYyBtb3N0UmVjZW50Q2VsbE91dGxldDogQ2RrQ2VsbE91dGxldCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIENka0NlbGxPdXRsZXQubW9zdFJlY2VudENlbGxPdXRsZXQgPSB0aGlzO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gSWYgdGhpcyB3YXMgdGhlIGxhc3Qgb3V0bGV0IGJlaW5nIHJlbmRlcmVkIGluIHRoZSB2aWV3LCByZW1vdmUgdGhlIHJlZmVyZW5jZVxuICAgIC8vIGZyb20gdGhlIHN0YXRpYyBwcm9wZXJ0eSBhZnRlciBpdCBoYXMgYmVlbiBkZXN0cm95ZWQgdG8gYXZvaWQgbGVha2luZyBtZW1vcnkuXG4gICAgaWYgKENka0NlbGxPdXRsZXQubW9zdFJlY2VudENlbGxPdXRsZXQgPT09IHRoaXMpIHtcbiAgICAgIENka0NlbGxPdXRsZXQubW9zdFJlY2VudENlbGxPdXRsZXQgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG4vKiogSGVhZGVyIHRlbXBsYXRlIGNvbnRhaW5lciB0aGF0IGNvbnRhaW5zIHRoZSBjZWxsIG91dGxldC4gQWRkcyB0aGUgcmlnaHQgY2xhc3MgYW5kIHJvbGUuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstaGVhZGVyLXJvdywgdHJbY2RrLWhlYWRlci1yb3ddJyxcbiAgdGVtcGxhdGU6IENES19ST1dfVEVNUExBVEUsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLWhlYWRlci1yb3cnLFxuICAgICdyb2xlJzogJ3JvdycsXG4gIH0sXG4gIC8vIFNlZSBub3RlIG9uIENka1RhYmxlIGZvciBleHBsYW5hdGlvbiBvbiB3aHkgdGhpcyB1c2VzIHRoZSBkZWZhdWx0IGNoYW5nZSBkZXRlY3Rpb24gc3RyYXRlZ3kuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0Nka0NlbGxPdXRsZXRdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtIZWFkZXJSb3cge31cblxuLyoqIEZvb3RlciB0ZW1wbGF0ZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgY2VsbCBvdXRsZXQuIEFkZHMgdGhlIHJpZ2h0IGNsYXNzIGFuZCByb2xlLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLWZvb3Rlci1yb3csIHRyW2Nkay1mb290ZXItcm93XScsXG4gIHRlbXBsYXRlOiBDREtfUk9XX1RFTVBMQVRFLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1mb290ZXItcm93JyxcbiAgICAncm9sZSc6ICdyb3cnLFxuICB9LFxuICAvLyBTZWUgbm90ZSBvbiBDZGtUYWJsZSBmb3IgZXhwbGFuYXRpb24gb24gd2h5IHRoaXMgdXNlcyB0aGUgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0aW9uIHN0cmF0ZWd5LlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDZGtDZWxsT3V0bGV0XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRm9vdGVyUm93IHt9XG5cbi8qKiBEYXRhIHJvdyB0ZW1wbGF0ZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgY2VsbCBvdXRsZXQuIEFkZHMgdGhlIHJpZ2h0IGNsYXNzIGFuZCByb2xlLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLXJvdywgdHJbY2RrLXJvd10nLFxuICB0ZW1wbGF0ZTogQ0RLX1JPV19URU1QTEFURSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstcm93JyxcbiAgICAncm9sZSc6ICdyb3cnLFxuICB9LFxuICAvLyBTZWUgbm90ZSBvbiBDZGtUYWJsZSBmb3IgZXhwbGFuYXRpb24gb24gd2h5IHRoaXMgdXNlcyB0aGUgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0aW9uIHN0cmF0ZWd5LlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDZGtDZWxsT3V0bGV0XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUm93IHt9XG5cbi8qKiBSb3cgdGhhdCBjYW4gYmUgdXNlZCB0byBkaXNwbGF5IGEgbWVzc2FnZSB3aGVuIG5vIGRhdGEgaXMgc2hvd24gaW4gdGhlIHRhYmxlLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrTm9EYXRhUm93XScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka05vRGF0YVJvdyB7XG4gIF9jb250ZW50Q2xhc3NOYW1lID0gJ2Nkay1uby1kYXRhLXJvdyc7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cbiJdfQ==