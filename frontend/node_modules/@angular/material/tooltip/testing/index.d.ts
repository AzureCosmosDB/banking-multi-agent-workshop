import { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { ComponentHarnessConstructor } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';

/** Harness for interacting with a mat-tooltip in tests. */
export declare class MatTooltipHarness extends ComponentHarness {
    static hostSelector: string;
    private _optionalPanel;
    private _hiddenClass;
    private _disabledClass;
    private _showAnimationName;
    private _hideAnimationName;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tooltip trigger with specific
     * attributes.
     * @param options Options for narrowing the search.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with<T extends MatTooltipHarness>(this: ComponentHarnessConstructor<T>, options?: TooltipHarnessFilters): HarnessPredicate<T>;
    /** Shows the tooltip. */
    show(): Promise<void>;
    /** Hides the tooltip. */
    hide(): Promise<void>;
    /** Gets whether the tooltip is open. */
    isOpen(): Promise<boolean>;
    /** Gets whether the tooltip is disabled */
    isDisabled(): Promise<boolean>;
    /** Gets a promise for the tooltip panel's text. */
    getTooltipText(): Promise<string>;
}

/** A set of criteria that can be used to filter a list of `MatTooltipHarness` instances. */
export declare interface TooltipHarnessFilters extends BaseHarnessFilters {
}

export { }
