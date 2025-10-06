import { AsyncFactoryFn } from '@angular/cdk/testing';
import { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { ComponentHarnessConstructor } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestElement } from '@angular/cdk/testing';

/** Harness for interacting with a mat-paginator in tests. */
export declare class MatPaginatorHarness extends ComponentHarness {
    /** Selector used to find paginator instances. */
    static hostSelector: string;
    private _nextButton;
    private _previousButton;
    private _firstPageButton;
    private _lastPageButton;
    _select: AsyncFactoryFn<MatSelectHarness | null>;
    private _pageSizeFallback;
    _rangeLabel: AsyncFactoryFn<TestElement>;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a paginator with specific attributes.
     * @param options Options for filtering which paginator instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with<T extends MatPaginatorHarness>(this: ComponentHarnessConstructor<T>, options?: PaginatorHarnessFilters): HarnessPredicate<T>;
    /** Goes to the next page in the paginator. */
    goToNextPage(): Promise<void>;
    /** Returns whether or not the next page button is disabled. */
    isNextPageDisabled(): Promise<boolean>;
    isPreviousPageDisabled(): Promise<boolean>;
    /** Goes to the previous page in the paginator. */
    goToPreviousPage(): Promise<void>;
    /** Goes to the first page in the paginator. */
    goToFirstPage(): Promise<void>;
    /** Goes to the last page in the paginator. */
    goToLastPage(): Promise<void>;
    /**
     * Sets the page size of the paginator.
     * @param size Page size that should be select.
     */
    setPageSize(size: number): Promise<void>;
    /** Gets the page size of the paginator. */
    getPageSize(): Promise<number>;
    /** Gets the text of the range label of the paginator. */
    getRangeLabel(): Promise<string>;
}

/** A set of criteria that can be used to filter a list of `MatPaginatorHarness` instances. */
export declare interface PaginatorHarnessFilters extends BaseHarnessFilters {
}

export { }
