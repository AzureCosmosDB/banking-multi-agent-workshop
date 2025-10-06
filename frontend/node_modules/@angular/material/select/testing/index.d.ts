import { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarnessConstructor } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing/control';
import { MatOptgroupHarness } from '@angular/material/core/testing';
import { MatOptionHarness } from '@angular/material/core/testing';
import { OptgroupHarnessFilters } from '@angular/material/core/testing';
import { OptionHarnessFilters } from '@angular/material/core/testing';

/** Harness for interacting with a mat-select in tests. */
export declare class MatSelectHarness extends MatFormFieldControlHarness {
    static hostSelector: string;
    private _prefix;
    private _optionClass;
    private _optionGroupClass;
    private _documentRootLocator;
    private _backdrop;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a select with specific attributes.
     * @param options Options for filtering which select instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with<T extends MatSelectHarness>(this: ComponentHarnessConstructor<T>, options?: SelectHarnessFilters): HarnessPredicate<T>;
    /** Gets a boolean promise indicating if the select is disabled. */
    isDisabled(): Promise<boolean>;
    /** Gets a boolean promise indicating if the select is valid. */
    isValid(): Promise<boolean>;
    /** Gets a boolean promise indicating if the select is required. */
    isRequired(): Promise<boolean>;
    /** Gets a boolean promise indicating if the select is empty (no value is selected). */
    isEmpty(): Promise<boolean>;
    /** Gets a boolean promise indicating if the select is in multi-selection mode. */
    isMultiple(): Promise<boolean>;
    /** Gets a promise for the select's value text. */
    getValueText(): Promise<string>;
    /** Focuses the select and returns a void promise that indicates when the action is complete. */
    focus(): Promise<void>;
    /** Blurs the select and returns a void promise that indicates when the action is complete. */
    blur(): Promise<void>;
    /** Whether the select is focused. */
    isFocused(): Promise<boolean>;
    /** Gets the options inside the select panel. */
    getOptions(filter?: Omit<OptionHarnessFilters, 'ancestor'>): Promise<MatOptionHarness[]>;
    /** Gets the groups of options inside the panel. */
    getOptionGroups(filter?: Omit<OptgroupHarnessFilters, 'ancestor'>): Promise<MatOptgroupHarness[]>;
    /** Gets whether the select is open. */
    isOpen(): Promise<boolean>;
    /** Opens the select's panel. */
    open(): Promise<void>;
    /**
     * Clicks the options that match the passed-in filter. If the select is in multi-selection
     * mode all options will be clicked, otherwise the harness will pick the first matching option.
     */
    clickOptions(filter?: OptionHarnessFilters): Promise<void>;
    /** Closes the select's panel. */
    close(): Promise<void>;
    /** Gets the selector that should be used to find this select's panel. */
    private _getPanelSelector;
}

/** A set of criteria that can be used to filter a list of `MatSelectHarness` instances. */
export declare interface SelectHarnessFilters extends BaseHarnessFilters {
    /** Only find instances which match the given disabled state. */
    disabled?: boolean;
}

export { }
