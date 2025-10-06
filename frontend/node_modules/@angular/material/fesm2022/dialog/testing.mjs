import { ContentContainerComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';
import { __decorate, __metadata } from 'tslib';
import { inject, NgZone, Component, ChangeDetectionStrategy, ViewEncapsulation, NgModule } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/** Selectors for different sections of the mat-dialog that can contain user content. */
var MatDialogSection;
(function (MatDialogSection) {
    MatDialogSection["TITLE"] = ".mat-mdc-dialog-title";
    MatDialogSection["CONTENT"] = ".mat-mdc-dialog-content";
    MatDialogSection["ACTIONS"] = ".mat-mdc-dialog-actions";
})(MatDialogSection || (MatDialogSection = {}));
/** Harness for interacting with a standard `MatDialog` in tests. */
class MatDialogHarness
// @breaking-change 14.0.0 change generic type to MatDialogSection.
 extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._title = this.locatorForOptional(MatDialogSection.TITLE);
        this._content = this.locatorForOptional(MatDialogSection.CONTENT);
        this._actions = this.locatorForOptional(MatDialogSection.ACTIONS);
    }
    /** The selector for the host element of a `MatDialog` instance. */
    static { this.hostSelector = '.mat-mdc-dialog-container'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a dialog with specific attributes.
     * @param options Options for filtering which dialog instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(this, options);
    }
    /** Gets the id of the dialog. */
    async getId() {
        const id = await (await this.host()).getAttribute('id');
        // In case no id has been specified, the "id" property always returns
        // an empty string. To make this method more explicit, we return null.
        return id !== '' ? id : null;
    }
    /** Gets the role of the dialog. */
    async getRole() {
        return (await this.host()).getAttribute('role');
    }
    /** Gets the value of the dialog's "aria-label" attribute. */
    async getAriaLabel() {
        return (await this.host()).getAttribute('aria-label');
    }
    /** Gets the value of the dialog's "aria-labelledby" attribute. */
    async getAriaLabelledby() {
        return (await this.host()).getAttribute('aria-labelledby');
    }
    /** Gets the value of the dialog's "aria-describedby" attribute. */
    async getAriaDescribedby() {
        return (await this.host()).getAttribute('aria-describedby');
    }
    /**
     * Closes the dialog by pressing escape.
     *
     * Note: this method does nothing if `disableClose` has been set to `true` for the dialog.
     */
    async close() {
        await (await this.host()).sendKeys(TestKey.ESCAPE);
    }
    /** Gets te dialog's text. */
    async getText() {
        return (await this.host()).text();
    }
    /** Gets the dialog's title text. This only works if the dialog is using mat-dialog-title. */
    async getTitleText() {
        return (await this._title())?.text() ?? '';
    }
    /** Gets the dialog's content text. This only works if the dialog is using mat-dialog-content. */
    async getContentText() {
        return (await this._content())?.text() ?? '';
    }
    /** Gets the dialog's actions text. This only works if the dialog is using mat-dialog-actions. */
    async getActionsText() {
        return (await this._actions())?.text() ?? '';
    }
}

var MatTestDialogOpener_1;
/** Test component that immediately opens a dialog when bootstrapped. */
let MatTestDialogOpener = class MatTestDialogOpener {
    static { MatTestDialogOpener_1 = this; }
    /** Static method that prepares this class to open the provided component. */
    static withComponent(component, config) {
        MatTestDialogOpener_1.component = component;
        MatTestDialogOpener_1.config = config;
        return MatTestDialogOpener_1;
    }
    constructor(dialog) {
        this.dialog = dialog;
        this._ngZone = inject(NgZone);
        if (!MatTestDialogOpener_1.component) {
            throw new Error(`MatTestDialogOpener does not have a component provided.`);
        }
        this.dialogRef = this._ngZone.run(() => this.dialog.open(MatTestDialogOpener_1.component, MatTestDialogOpener_1.config || {}));
        this._afterClosedSubscription = this.dialogRef.afterClosed().subscribe(result => {
            this.closedResult = result;
        });
    }
    ngOnDestroy() {
        this._afterClosedSubscription.unsubscribe();
        MatTestDialogOpener_1.component = undefined;
        MatTestDialogOpener_1.config = undefined;
    }
};
MatTestDialogOpener = MatTestDialogOpener_1 = __decorate([
    Component({
        selector: 'mat-test-dialog-opener',
        template: '',
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None,
        standalone: true,
    }),
    __metadata("design:paramtypes", [MatDialog])
], MatTestDialogOpener);
let MatTestDialogOpenerModule = class MatTestDialogOpenerModule {
};
MatTestDialogOpenerModule = __decorate([
    NgModule({
        imports: [MatDialogModule, NoopAnimationsModule, MatTestDialogOpener],
    })
], MatTestDialogOpenerModule);

export { MatDialogHarness, MatDialogSection, MatTestDialogOpener, MatTestDialogOpenerModule };
//# sourceMappingURL=testing.mjs.map
