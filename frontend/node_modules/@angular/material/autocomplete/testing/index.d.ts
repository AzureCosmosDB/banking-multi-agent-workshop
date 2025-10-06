import { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { ComponentHarnessConstructor } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';
import { MatOptgroupHarness } from '@angular/material/core/testing';
import { MatOptionHarness } from '@angular/material/core/testing';
import { OptgroupHarnessFilters } from '@angular/material/core/testing';
import { OptionHarnessFilters } from '@angular/material/core/testing';

/** A set of criteria that can be used to filter a list of `MatAutocompleteHarness` instances. */
export declare interface AutocompleteHarnessFilters extends BaseHarnessFilters {
    /** Only find instances whose associated input element matches the given value. */
    value?: string | RegExp;
    /** Only find instances which match the given disabled state. */
    disabled?: boolean;
}

export declare class MatAutocompleteHarness extends ComponentHarness {
    private _documentRootLocator;
    /** The selector for the host element of a `MatAutocomplete` instance. */
    static hostSelector: string;
    /**
     * Gets a `HarnessPredicate` that can be used to search for an autocomplete with specific
     * attributes.
     * @param options Options for filtering which autocomplete instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with<T extends MatAutocompleteHarness>(this: ComponentHarnessConstructor<T>, options?: AutocompleteHarnessFilters): HarnessPredicate<T>;
    /** Gets the value of the autocomplete input. */
    getValue(): Promise<string>;
    /** Whether the autocomplete input is disabled. */
    isDisabled(): Promise<boolean>;
    /** Focuses the autocomplete input. */
    focus(): Promise<void>;
    /** Blurs the autocomplete input. */
    blur(): Promise<void>;
    /** Whether the autocomplete input is focused. */
    isFocused(): Promise<boolean>;
    /** Enters text into the autocomplete. */
    enterText(value: string): Promise<void>;
    /** Clears the input value. */
    clear(): Promise<void>;
    /** Gets the options inside the autocomplete panel. */
    getOptions(filters?: Omit<OptionHarnessFilters, 'ancestor'>): Promise<MatOptionHarness[]>;
    /** Gets the option groups inside the autocomplete panel. */
    getOptionGroups(filters?: Omit<OptgroupHarnessFilters, 'ancestor'>): Promise<MatOptgroupHarness[]>;
    /** Selects the first option matching the given filters. */
    selectOption(filters: OptionHarnessFilters): Promise<void>;
    /** Whether the autocomplete is open. */
    isOpen(): Promise<boolean>;
    /** Gets the panel associated with this autocomplete trigger. */
    private _getPanel;
    /** Gets the selector that can be used to find the autocomplete trigger's panel. */
    protected _getPanelSelector(): Promise<string>;
}

export { }
