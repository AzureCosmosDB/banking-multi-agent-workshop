"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheCleanModule = void 0;
const node_fs_1 = require("node:fs");
const command_module_1 = require("../../../command-builder/command-module");
const utilities_1 = require("../utilities");
class CacheCleanModule extends command_module_1.CommandModule {
    command = 'clean';
    describe = 'Deletes persistent disk cache from disk.';
    longDescriptionPath;
    scope = command_module_1.CommandScope.In;
    builder(localYargs) {
        return localYargs.strict();
    }
    run() {
        const { path } = (0, utilities_1.getCacheConfig)(this.context.workspace);
        return node_fs_1.promises.rm(path, {
            force: true,
            recursive: true,
            maxRetries: 3,
        });
    }
}
exports.CacheCleanModule = CacheCleanModule;
