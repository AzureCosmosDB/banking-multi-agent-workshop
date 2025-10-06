/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TaskConfiguration, TaskConfigurationGenerator } from '../../src';
import { NodePackageTaskOptions } from './options';
/**
 * @deprecated since version 18. Create a custom task if required.
 */
export declare class NodePackageLinkTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
    packageName?: string | undefined;
    workingDirectory?: string | undefined;
    quiet: boolean;
    constructor(packageName?: string | undefined, workingDirectory?: string | undefined);
    toConfiguration(): TaskConfiguration<NodePackageTaskOptions>;
}
