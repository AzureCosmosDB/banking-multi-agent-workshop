/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Rule } from '@angular-devkit/schematics';
/**
 * Schematics rule that identifies and updates import declarations in TypeScript files.
 * Specifically, it modifies imports of '@angular/ssr' by appending '/node' if the
 * `CommonEngine` is used from the old entry point.
 *
 */
export default function (): Rule;
