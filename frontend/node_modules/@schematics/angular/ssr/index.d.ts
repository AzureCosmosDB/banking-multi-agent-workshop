/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Rule } from '@angular-devkit/schematics';
import { Schema as SSROptions } from './schema';
export default function (inputOptions: SSROptions): Rule;
export type Prompt = (message: string, defaultValue: boolean) => Promise<boolean>;
export declare function setPrompterForTestOnly(prompter?: Prompt): void;
