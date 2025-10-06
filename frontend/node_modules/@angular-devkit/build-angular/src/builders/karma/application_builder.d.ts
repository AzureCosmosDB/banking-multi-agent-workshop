/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ResultFile } from '@angular/build/private';
import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import type { ConfigOptions } from 'karma';
import { Observable } from 'rxjs';
import { Configuration } from 'webpack';
import { ExecutionTransformer } from '../../transforms';
import { Schema as KarmaBuilderOptions } from './schema';
export declare function execute(options: KarmaBuilderOptions, context: BuilderContext, karmaOptions: ConfigOptions, transforms?: {
    webpackConfiguration?: ExecutionTransformer<Configuration>;
    karmaOptions?: (options: ConfigOptions) => ConfigOptions;
}): Observable<BuilderOutput>;
export declare function writeTestFiles(files: Record<string, ResultFile>, testDir: string): Promise<void>;
