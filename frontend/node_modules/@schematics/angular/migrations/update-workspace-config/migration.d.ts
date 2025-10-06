/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Rule } from '@angular-devkit/schematics';
/**
 * Main entry point for the migration rule.
 *
 * This schematic migration performs updates to the Angular workspace configuration
 * to ensure that application projects are properly configured with polyfills
 * required for internationalization (`localize`).
 *
 * It specifically targets application projects that use either the `application`
 * or `browser-esbuild` builders.
 *
 * The migration process involves:
 *
 * 1. Iterating over all projects in the workspace.
 * 2. Checking each project to determine if it is an application-type project.
 * 3. For each application project, examining the associated build targets.
 * 4. If a build target's `localize` option is enabled but the polyfill
 *    `@angular/localize/init` is missing from the `polyfills` array, the polyfill
 *    is automatically added to ensure proper internationalization support.
 *
 * Additionally, this migration updates projects that use the `dev-server` or `extract-i18n`
 * builders to ensure that deprecated `browserTarget` options are migrated to the
 * newer `buildTarget` field.
 *
 */
export default function (): Rule;
