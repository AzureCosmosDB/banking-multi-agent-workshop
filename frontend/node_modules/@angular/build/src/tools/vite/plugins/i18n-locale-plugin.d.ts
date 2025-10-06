/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Plugin } from 'vite';
/**
 * Creates a Vite plugin that resolves Angular locale data files from `@angular/common`.
 *
 * @returns A Vite plugin.
 */
export declare function createAngularLocaleDataPlugin(): Plugin;
