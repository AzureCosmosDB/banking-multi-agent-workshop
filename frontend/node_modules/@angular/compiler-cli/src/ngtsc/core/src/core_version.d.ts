/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ExternalReference } from '@angular/compiler';
import ts from 'typescript';
export declare function coreHasSymbol(program: ts.Program, symbol: ExternalReference): boolean | null;
export declare function isMaybeCore(sf: ts.SourceFile): boolean;
