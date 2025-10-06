/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The options passed to the inliner for each file request
 */
interface InlineRequest {
    /**
     * The filename that should be processed. The data for the file is provided to the Worker
     * during Worker initialization.
     */
    filename: string;
    /**
     * The locale specifier that should be used during the inlining process of the file.
     */
    locale: string;
    /**
     * The translation messages for the locale that should be used during the inlining process of the file.
     */
    translation?: Record<string, unknown>;
}
/**
 * Inlines the provided locale and translation into a JavaScript file that contains `$localize` usage.
 * This function is the main entry for the Worker's action that is called by the worker pool.
 *
 * @param request An InlineRequest object representing the options for inlining
 * @returns An array containing the inlined file and optional map content.
 */
export default function inlineLocale(request: InlineRequest): Promise<{
    file: string;
    code: string;
    map: string | undefined;
    messages: {
        type: "warning" | "error";
        message: string;
    }[];
}>;
export {};
