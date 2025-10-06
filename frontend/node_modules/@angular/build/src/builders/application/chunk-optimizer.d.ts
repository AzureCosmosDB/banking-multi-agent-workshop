/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BundleContextResult } from '../../tools/esbuild/bundler-context';
export declare function optimizeChunks(original: BundleContextResult, sourcemap: boolean | 'hidden'): Promise<BundleContextResult>;
