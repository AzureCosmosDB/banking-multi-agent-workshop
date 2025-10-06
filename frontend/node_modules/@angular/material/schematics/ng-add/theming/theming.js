"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addThemeToAppStyles = addThemeToAppStyles;
exports.addTypographyClass = addTypographyClass;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const path_1 = require("path");
const create_custom_theme_1 = require("./create-custom-theme");
/** Path segment that can be found in paths that refer to a prebuilt theme. */
const prebuiltThemePathSegment = '@angular/material/prebuilt-themes';
/** Default file name of the custom theme that can be generated. */
const defaultCustomThemeFilename = 'custom-theme.scss';
/** Add pre-built styles to the main project style file. */
function addThemeToAppStyles(options) {
    return (host, context) => {
        const themeName = options.theme || 'azure-blue';
        return themeName === 'custom'
            ? insertCustomTheme(options.project, host, context.logger)
            : insertPrebuiltTheme(options.project, themeName, context.logger);
    };
}
/** Adds the global typography class to the body element. */
function addTypographyClass(options) {
    return async (host) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        const projectIndexFiles = (0, schematics_2.getProjectIndexFiles)(project);
        if (!projectIndexFiles.length) {
            throw new schematics_1.SchematicsException('No project index HTML file could be found.');
        }
        if (options.typography) {
            projectIndexFiles.forEach(path => (0, schematics_2.addBodyClass)(host, path, 'mat-typography'));
        }
    };
}
/**
 * Insert a custom theme to project style file. If no valid style file could be found, a new
 * Scss file for the custom theme will be created.
 */
async function insertCustomTheme(projectName, host, logger) {
    const workspace = await (0, workspace_1.getWorkspace)(host);
    const project = (0, schematics_2.getProjectFromWorkspace)(workspace, projectName);
    const stylesPath = (0, schematics_2.getProjectStyleFile)(project, 'scss');
    const themeContent = (0, create_custom_theme_1.createCustomTheme)(projectName);
    if (!stylesPath) {
        if (!project.sourceRoot) {
            throw new schematics_1.SchematicsException(`Could not find source root for project: "${projectName}". ` +
                `Please make sure that the "sourceRoot" property is set in the workspace config.`);
        }
        // Normalize the path through the devkit utilities because we want to avoid having
        // unnecessary path segments and windows backslash delimiters.
        const customThemePath = (0, core_1.normalize)((0, path_1.join)(project.sourceRoot, defaultCustomThemeFilename));
        if (host.exists(customThemePath)) {
            logger.warn(`Cannot create a custom Angular Material theme because
          ${customThemePath} already exists. Skipping custom theme generation.`);
            return (0, schematics_1.noop)();
        }
        host.create(customThemePath, themeContent);
        return addThemeStyleToTarget(projectName, 'build', customThemePath, logger);
    }
    const insertion = new change_1.InsertChange(stylesPath, 0, themeContent);
    const recorder = host.beginUpdate(stylesPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
    return (0, schematics_1.noop)();
}
/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project, theme, logger) {
    const themePath = `@angular/material/prebuilt-themes/${theme}.css`;
    return (0, schematics_1.chain)([
        addThemeStyleToTarget(project, 'build', themePath, logger),
        addThemeStyleToTarget(project, 'test', themePath, logger),
    ]);
}
/** Adds a theming style entry to the given project target options. */
function addThemeStyleToTarget(projectName, targetName, assetPath, logger) {
    return (0, workspace_1.updateWorkspace)(workspace => {
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, projectName);
        // Do not update the builder options in case the target does not use the default CLI builder.
        if (!validateDefaultTargetBuilder(project, targetName, logger)) {
            return;
        }
        const targetOptions = (0, schematics_2.getProjectTargetOptions)(project, targetName);
        const styles = targetOptions['styles'];
        if (!styles) {
            targetOptions['styles'] = [assetPath];
        }
        else {
            const existingStyles = styles.map(s => (typeof s === 'string' ? s : s.input));
            for (let [index, stylePath] of existingStyles.entries()) {
                // If the given asset is already specified in the styles, we don't need to do anything.
                if (stylePath === assetPath) {
                    return;
                }
                // In case a prebuilt theme is already set up, we can safely replace the theme with the new
                // theme file. If a custom theme is set up, we are not able to safely replace the custom
                // theme because these files can contain custom styles, while prebuilt themes are
                // always packaged and considered replaceable.
                if (stylePath.includes(defaultCustomThemeFilename)) {
                    logger.error(`Could not add the selected theme to the CLI project ` +
                        `configuration because there is already a custom theme file referenced.`);
                    logger.info(`Please manually add the following style file to your configuration:`);
                    logger.info(`    ${assetPath}`);
                    return;
                }
                else if (stylePath.includes(prebuiltThemePathSegment)) {
                    styles.splice(index, 1);
                }
            }
            styles.unshift(assetPath);
        }
    });
}
/**
 * Validates that the specified project target is configured with the default builders which are
 * provided by the Angular CLI. If the configured builder does not match the default builder,
 * this function can either throw or just show a warning.
 */
function validateDefaultTargetBuilder(project, targetName, logger) {
    const targets = targetName === 'test' ? (0, schematics_2.getProjectTestTargets)(project) : (0, schematics_2.getProjectBuildTargets)(project);
    const isDefaultBuilder = targets.length > 0;
    // Because the build setup for the Angular CLI can be customized by developers, we can't know
    // where to put the theme file in the workspace configuration if custom builders are being
    // used. In case the builder has been changed for the "build" target, we throw an error and
    // exit because setting up a theme is a primary goal of `ng-add`. Otherwise if just the "test"
    // builder has been changed, we warn because a theme is not mandatory for running tests
    // with Material. See: https://github.com/angular/components/issues/14176
    if (!isDefaultBuilder && targetName === 'build') {
        throw new schematics_1.SchematicsException(`Your project is not using the default builders for ` +
            `"${targetName}". The Angular Material schematics cannot add a theme to the workspace ` +
            `configuration if the builder has been changed.`);
    }
    else if (!isDefaultBuilder) {
        // for non-build targets we gracefully report the error without actually aborting the
        // setup schematic. This is because a theme is not mandatory for running tests.
        logger.warn(`Your project is not using the default builders for "${targetName}". This ` +
            `means that we cannot add the configured theme to the "${targetName}" target.`);
    }
    return isDefaultBuilder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC90aGVtaW5nL3RoZW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFpQ0gsa0RBT0M7QUFHRCxnREFjQztBQXZERCwrQ0FBb0U7QUFDcEUsMkRBT29DO0FBQ3BDLHdEQVFpQztBQUNqQywrREFBZ0U7QUFDaEUscUVBQW9GO0FBQ3BGLCtCQUEwQjtBQUUxQiwrREFBd0Q7QUFFeEQsOEVBQThFO0FBQzlFLE1BQU0sd0JBQXdCLEdBQUcsbUNBQW1DLENBQUM7QUFFckUsbUVBQW1FO0FBQ25FLE1BQU0sMEJBQTBCLEdBQUcsbUJBQW1CLENBQUM7QUFFdkQsMkRBQTJEO0FBQzNELFNBQWdCLG1CQUFtQixDQUFDLE9BQWU7SUFDakQsT0FBTyxDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDL0MsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxZQUFZLENBQUM7UUFDaEQsT0FBTyxTQUFTLEtBQUssUUFBUTtZQUMzQixDQUFDLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUMxRCxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCw0REFBNEQ7QUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsT0FBZTtJQUNoRCxPQUFPLEtBQUssRUFBRSxJQUFVLEVBQUUsRUFBRTtRQUMxQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsd0JBQVksRUFBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFBLG9DQUF1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LE1BQU0sQ0FBQyxJQUFJLENBQ1QsdURBQXVELFVBQVUsVUFBVTtZQUN6RSx5REFBeUQsVUFBVSxXQUFXLENBQ2pGLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplLCBsb2dnaW5nLCB3b3Jrc3BhY2VzfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBjaGFpbixcbiAgbm9vcCxcbiAgUnVsZSxcbiAgU2NoZW1hdGljQ29udGV4dCxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtcbiAgYWRkQm9keUNsYXNzLFxuICBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSxcbiAgZ2V0UHJvamVjdFN0eWxlRmlsZSxcbiAgZ2V0UHJvamVjdFRhcmdldE9wdGlvbnMsXG4gIGdldFByb2plY3RJbmRleEZpbGVzLFxuICBnZXRQcm9qZWN0VGVzdFRhcmdldHMsXG4gIGdldFByb2plY3RCdWlsZFRhcmdldHMsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY2hlbWF0aWNzJztcbmltcG9ydCB7SW5zZXJ0Q2hhbmdlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvY2hhbmdlJztcbmltcG9ydCB7Z2V0V29ya3NwYWNlLCB1cGRhdGVXb3Jrc3BhY2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS93b3Jrc3BhY2UnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7U2NoZW1hfSBmcm9tICcuLi9zY2hlbWEnO1xuaW1wb3J0IHtjcmVhdGVDdXN0b21UaGVtZX0gZnJvbSAnLi9jcmVhdGUtY3VzdG9tLXRoZW1lJztcblxuLyoqIFBhdGggc2VnbWVudCB0aGF0IGNhbiBiZSBmb3VuZCBpbiBwYXRocyB0aGF0IHJlZmVyIHRvIGEgcHJlYnVpbHQgdGhlbWUuICovXG5jb25zdCBwcmVidWlsdFRoZW1lUGF0aFNlZ21lbnQgPSAnQGFuZ3VsYXIvbWF0ZXJpYWwvcHJlYnVpbHQtdGhlbWVzJztcblxuLyoqIERlZmF1bHQgZmlsZSBuYW1lIG9mIHRoZSBjdXN0b20gdGhlbWUgdGhhdCBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuY29uc3QgZGVmYXVsdEN1c3RvbVRoZW1lRmlsZW5hbWUgPSAnY3VzdG9tLXRoZW1lLnNjc3MnO1xuXG4vKiogQWRkIHByZS1idWlsdCBzdHlsZXMgdG8gdGhlIG1haW4gcHJvamVjdCBzdHlsZSBmaWxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFRoZW1lVG9BcHBTdHlsZXMob3B0aW9uczogU2NoZW1hKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHRoZW1lTmFtZSA9IG9wdGlvbnMudGhlbWUgfHwgJ2F6dXJlLWJsdWUnO1xuICAgIHJldHVybiB0aGVtZU5hbWUgPT09ICdjdXN0b20nXG4gICAgICA/IGluc2VydEN1c3RvbVRoZW1lKG9wdGlvbnMucHJvamVjdCwgaG9zdCwgY29udGV4dC5sb2dnZXIpXG4gICAgICA6IGluc2VydFByZWJ1aWx0VGhlbWUob3B0aW9ucy5wcm9qZWN0LCB0aGVtZU5hbWUsIGNvbnRleHQubG9nZ2VyKTtcbiAgfTtcbn1cblxuLyoqIEFkZHMgdGhlIGdsb2JhbCB0eXBvZ3JhcGh5IGNsYXNzIHRvIHRoZSBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVHlwb2dyYXBoeUNsYXNzKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBjb25zdCBwcm9qZWN0SW5kZXhGaWxlcyA9IGdldFByb2plY3RJbmRleEZpbGVzKHByb2plY3QpO1xuXG4gICAgaWYgKCFwcm9qZWN0SW5kZXhGaWxlcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdObyBwcm9qZWN0IGluZGV4IEhUTUwgZmlsZSBjb3VsZCBiZSBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50eXBvZ3JhcGh5KSB7XG4gICAgICBwcm9qZWN0SW5kZXhGaWxlcy5mb3JFYWNoKHBhdGggPT4gYWRkQm9keUNsYXNzKGhvc3QsIHBhdGgsICdtYXQtdHlwb2dyYXBoeScpKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgY3VzdG9tIHRoZW1lIHRvIHByb2plY3Qgc3R5bGUgZmlsZS4gSWYgbm8gdmFsaWQgc3R5bGUgZmlsZSBjb3VsZCBiZSBmb3VuZCwgYSBuZXdcbiAqIFNjc3MgZmlsZSBmb3IgdGhlIGN1c3RvbSB0aGVtZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluc2VydEN1c3RvbVRoZW1lKFxuICBwcm9qZWN0TmFtZTogc3RyaW5nLFxuICBob3N0OiBUcmVlLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogUHJvbWlzZTxSdWxlPiB7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcbiAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgcHJvamVjdE5hbWUpO1xuICBjb25zdCBzdHlsZXNQYXRoID0gZ2V0UHJvamVjdFN0eWxlRmlsZShwcm9qZWN0LCAnc2NzcycpO1xuICBjb25zdCB0aGVtZUNvbnRlbnQgPSBjcmVhdGVDdXN0b21UaGVtZShwcm9qZWN0TmFtZSk7XG5cbiAgaWYgKCFzdHlsZXNQYXRoKSB7XG4gICAgaWYgKCFwcm9qZWN0LnNvdXJjZVJvb3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgICBgQ291bGQgbm90IGZpbmQgc291cmNlIHJvb3QgZm9yIHByb2plY3Q6IFwiJHtwcm9qZWN0TmFtZX1cIi4gYCArXG4gICAgICAgICAgYFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgXCJzb3VyY2VSb290XCIgcHJvcGVydHkgaXMgc2V0IGluIHRoZSB3b3Jrc3BhY2UgY29uZmlnLmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aCB0aHJvdWdoIHRoZSBkZXZraXQgdXRpbGl0aWVzIGJlY2F1c2Ugd2Ugd2FudCB0byBhdm9pZCBoYXZpbmdcbiAgICAvLyB1bm5lY2Vzc2FyeSBwYXRoIHNlZ21lbnRzIGFuZCB3aW5kb3dzIGJhY2tzbGFzaCBkZWxpbWl0ZXJzLlxuICAgIGNvbnN0IGN1c3RvbVRoZW1lUGF0aCA9IG5vcm1hbGl6ZShqb2luKHByb2plY3Quc291cmNlUm9vdCwgZGVmYXVsdEN1c3RvbVRoZW1lRmlsZW5hbWUpKTtcblxuICAgIGlmIChob3N0LmV4aXN0cyhjdXN0b21UaGVtZVBhdGgpKSB7XG4gICAgICBsb2dnZXIud2FybihgQ2Fubm90IGNyZWF0ZSBhIGN1c3RvbSBBbmd1bGFyIE1hdGVyaWFsIHRoZW1lIGJlY2F1c2VcbiAgICAgICAgICAke2N1c3RvbVRoZW1lUGF0aH0gYWxyZWFkeSBleGlzdHMuIFNraXBwaW5nIGN1c3RvbSB0aGVtZSBnZW5lcmF0aW9uLmApO1xuICAgICAgcmV0dXJuIG5vb3AoKTtcbiAgICB9XG5cbiAgICBob3N0LmNyZWF0ZShjdXN0b21UaGVtZVBhdGgsIHRoZW1lQ29udGVudCk7XG4gICAgcmV0dXJuIGFkZFRoZW1lU3R5bGVUb1RhcmdldChwcm9qZWN0TmFtZSwgJ2J1aWxkJywgY3VzdG9tVGhlbWVQYXRoLCBsb2dnZXIpO1xuICB9XG5cbiAgY29uc3QgaW5zZXJ0aW9uID0gbmV3IEluc2VydENoYW5nZShzdHlsZXNQYXRoLCAwLCB0aGVtZUNvbnRlbnQpO1xuICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUoc3R5bGVzUGF0aCk7XG5cbiAgcmVjb3JkZXIuaW5zZXJ0TGVmdChpbnNlcnRpb24ucG9zLCBpbnNlcnRpb24udG9BZGQpO1xuICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gIHJldHVybiBub29wKCk7XG59XG5cbi8qKiBJbnNlcnQgYSBwcmUtYnVpbHQgdGhlbWUgaW50byB0aGUgYW5ndWxhci5qc29uIGZpbGUuICovXG5mdW5jdGlvbiBpbnNlcnRQcmVidWlsdFRoZW1lKHByb2plY3Q6IHN0cmluZywgdGhlbWU6IHN0cmluZywgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSk6IFJ1bGUge1xuICBjb25zdCB0aGVtZVBhdGggPSBgQGFuZ3VsYXIvbWF0ZXJpYWwvcHJlYnVpbHQtdGhlbWVzLyR7dGhlbWV9LmNzc2A7XG5cbiAgcmV0dXJuIGNoYWluKFtcbiAgICBhZGRUaGVtZVN0eWxlVG9UYXJnZXQocHJvamVjdCwgJ2J1aWxkJywgdGhlbWVQYXRoLCBsb2dnZXIpLFxuICAgIGFkZFRoZW1lU3R5bGVUb1RhcmdldChwcm9qZWN0LCAndGVzdCcsIHRoZW1lUGF0aCwgbG9nZ2VyKSxcbiAgXSk7XG59XG5cbi8qKiBBZGRzIGEgdGhlbWluZyBzdHlsZSBlbnRyeSB0byB0aGUgZ2l2ZW4gcHJvamVjdCB0YXJnZXQgb3B0aW9ucy4gKi9cbmZ1bmN0aW9uIGFkZFRoZW1lU3R5bGVUb1RhcmdldChcbiAgcHJvamVjdE5hbWU6IHN0cmluZyxcbiAgdGFyZ2V0TmFtZTogJ3Rlc3QnIHwgJ2J1aWxkJyxcbiAgYXNzZXRQYXRoOiBzdHJpbmcsXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiBSdWxlIHtcbiAgcmV0dXJuIHVwZGF0ZVdvcmtzcGFjZSh3b3Jrc3BhY2UgPT4ge1xuICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSh3b3Jrc3BhY2UsIHByb2plY3ROYW1lKTtcblxuICAgIC8vIERvIG5vdCB1cGRhdGUgdGhlIGJ1aWxkZXIgb3B0aW9ucyBpbiBjYXNlIHRoZSB0YXJnZXQgZG9lcyBub3QgdXNlIHRoZSBkZWZhdWx0IENMSSBidWlsZGVyLlxuICAgIGlmICghdmFsaWRhdGVEZWZhdWx0VGFyZ2V0QnVpbGRlcihwcm9qZWN0LCB0YXJnZXROYW1lLCBsb2dnZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0T3B0aW9ucyA9IGdldFByb2plY3RUYXJnZXRPcHRpb25zKHByb2plY3QsIHRhcmdldE5hbWUpO1xuICAgIGNvbnN0IHN0eWxlcyA9IHRhcmdldE9wdGlvbnNbJ3N0eWxlcyddIGFzIChzdHJpbmcgfCB7aW5wdXQ6IHN0cmluZ30pW107XG5cbiAgICBpZiAoIXN0eWxlcykge1xuICAgICAgdGFyZ2V0T3B0aW9uc1snc3R5bGVzJ10gPSBbYXNzZXRQYXRoXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhpc3RpbmdTdHlsZXMgPSBzdHlsZXMubWFwKHMgPT4gKHR5cGVvZiBzID09PSAnc3RyaW5nJyA/IHMgOiBzLmlucHV0KSk7XG5cbiAgICAgIGZvciAobGV0IFtpbmRleCwgc3R5bGVQYXRoXSBvZiBleGlzdGluZ1N0eWxlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIGdpdmVuIGFzc2V0IGlzIGFscmVhZHkgc3BlY2lmaWVkIGluIHRoZSBzdHlsZXMsIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcuXG4gICAgICAgIGlmIChzdHlsZVBhdGggPT09IGFzc2V0UGF0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluIGNhc2UgYSBwcmVidWlsdCB0aGVtZSBpcyBhbHJlYWR5IHNldCB1cCwgd2UgY2FuIHNhZmVseSByZXBsYWNlIHRoZSB0aGVtZSB3aXRoIHRoZSBuZXdcbiAgICAgICAgLy8gdGhlbWUgZmlsZS4gSWYgYSBjdXN0b20gdGhlbWUgaXMgc2V0IHVwLCB3ZSBhcmUgbm90IGFibGUgdG8gc2FmZWx5IHJlcGxhY2UgdGhlIGN1c3RvbVxuICAgICAgICAvLyB0aGVtZSBiZWNhdXNlIHRoZXNlIGZpbGVzIGNhbiBjb250YWluIGN1c3RvbSBzdHlsZXMsIHdoaWxlIHByZWJ1aWx0IHRoZW1lcyBhcmVcbiAgICAgICAgLy8gYWx3YXlzIHBhY2thZ2VkIGFuZCBjb25zaWRlcmVkIHJlcGxhY2VhYmxlLlxuICAgICAgICBpZiAoc3R5bGVQYXRoLmluY2x1ZGVzKGRlZmF1bHRDdXN0b21UaGVtZUZpbGVuYW1lKSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgIGBDb3VsZCBub3QgYWRkIHRoZSBzZWxlY3RlZCB0aGVtZSB0byB0aGUgQ0xJIHByb2plY3QgYCArXG4gICAgICAgICAgICAgIGBjb25maWd1cmF0aW9uIGJlY2F1c2UgdGhlcmUgaXMgYWxyZWFkeSBhIGN1c3RvbSB0aGVtZSBmaWxlIHJlZmVyZW5jZWQuYCxcbiAgICAgICAgICApO1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBQbGVhc2UgbWFudWFsbHkgYWRkIHRoZSBmb2xsb3dpbmcgc3R5bGUgZmlsZSB0byB5b3VyIGNvbmZpZ3VyYXRpb246YCk7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oYCAgICAke2Fzc2V0UGF0aH1gKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoc3R5bGVQYXRoLmluY2x1ZGVzKHByZWJ1aWx0VGhlbWVQYXRoU2VnbWVudCkpIHtcbiAgICAgICAgICBzdHlsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdHlsZXMudW5zaGlmdChhc3NldFBhdGgpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgdGhlIHNwZWNpZmllZCBwcm9qZWN0IHRhcmdldCBpcyBjb25maWd1cmVkIHdpdGggdGhlIGRlZmF1bHQgYnVpbGRlcnMgd2hpY2ggYXJlXG4gKiBwcm92aWRlZCBieSB0aGUgQW5ndWxhciBDTEkuIElmIHRoZSBjb25maWd1cmVkIGJ1aWxkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGRlZmF1bHQgYnVpbGRlcixcbiAqIHRoaXMgZnVuY3Rpb24gY2FuIGVpdGhlciB0aHJvdyBvciBqdXN0IHNob3cgYSB3YXJuaW5nLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZURlZmF1bHRUYXJnZXRCdWlsZGVyKFxuICBwcm9qZWN0OiB3b3Jrc3BhY2VzLlByb2plY3REZWZpbml0aW9uLFxuICB0YXJnZXROYW1lOiAnYnVpbGQnIHwgJ3Rlc3QnLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKSB7XG4gIGNvbnN0IHRhcmdldHMgPVxuICAgIHRhcmdldE5hbWUgPT09ICd0ZXN0JyA/IGdldFByb2plY3RUZXN0VGFyZ2V0cyhwcm9qZWN0KSA6IGdldFByb2plY3RCdWlsZFRhcmdldHMocHJvamVjdCk7XG4gIGNvbnN0IGlzRGVmYXVsdEJ1aWxkZXIgPSB0YXJnZXRzLmxlbmd0aCA+IDA7XG5cbiAgLy8gQmVjYXVzZSB0aGUgYnVpbGQgc2V0dXAgZm9yIHRoZSBBbmd1bGFyIENMSSBjYW4gYmUgY3VzdG9taXplZCBieSBkZXZlbG9wZXJzLCB3ZSBjYW4ndCBrbm93XG4gIC8vIHdoZXJlIHRvIHB1dCB0aGUgdGhlbWUgZmlsZSBpbiB0aGUgd29ya3NwYWNlIGNvbmZpZ3VyYXRpb24gaWYgY3VzdG9tIGJ1aWxkZXJzIGFyZSBiZWluZ1xuICAvLyB1c2VkLiBJbiBjYXNlIHRoZSBidWlsZGVyIGhhcyBiZWVuIGNoYW5nZWQgZm9yIHRoZSBcImJ1aWxkXCIgdGFyZ2V0LCB3ZSB0aHJvdyBhbiBlcnJvciBhbmRcbiAgLy8gZXhpdCBiZWNhdXNlIHNldHRpbmcgdXAgYSB0aGVtZSBpcyBhIHByaW1hcnkgZ29hbCBvZiBgbmctYWRkYC4gT3RoZXJ3aXNlIGlmIGp1c3QgdGhlIFwidGVzdFwiXG4gIC8vIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZCwgd2Ugd2FybiBiZWNhdXNlIGEgdGhlbWUgaXMgbm90IG1hbmRhdG9yeSBmb3IgcnVubmluZyB0ZXN0c1xuICAvLyB3aXRoIE1hdGVyaWFsLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzE0MTc2XG4gIGlmICghaXNEZWZhdWx0QnVpbGRlciAmJiB0YXJnZXROYW1lID09PSAnYnVpbGQnKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICBgWW91ciBwcm9qZWN0IGlzIG5vdCB1c2luZyB0aGUgZGVmYXVsdCBidWlsZGVycyBmb3IgYCArXG4gICAgICAgIGBcIiR7dGFyZ2V0TmFtZX1cIi4gVGhlIEFuZ3VsYXIgTWF0ZXJpYWwgc2NoZW1hdGljcyBjYW5ub3QgYWRkIGEgdGhlbWUgdG8gdGhlIHdvcmtzcGFjZSBgICtcbiAgICAgICAgYGNvbmZpZ3VyYXRpb24gaWYgdGhlIGJ1aWxkZXIgaGFzIGJlZW4gY2hhbmdlZC5gLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoIWlzRGVmYXVsdEJ1aWxkZXIpIHtcbiAgICAvLyBmb3Igbm9uLWJ1aWxkIHRhcmdldHMgd2UgZ3JhY2VmdWxseSByZXBvcnQgdGhlIGVycm9yIHdpdGhvdXQgYWN0dWFsbHkgYWJvcnRpbmcgdGhlXG4gICAgLy8gc2V0dXAgc2NoZW1hdGljLiBUaGlzIGlzIGJlY2F1c2UgYSB0aGVtZSBpcyBub3QgbWFuZGF0b3J5IGZvciBydW5uaW5nIHRlc3RzLlxuICAgIGxvZ2dlci53YXJuKFxuICAgICAgYFlvdXIgcHJvamVjdCBpcyBub3QgdXNpbmcgdGhlIGRlZmF1bHQgYnVpbGRlcnMgZm9yIFwiJHt0YXJnZXROYW1lfVwiLiBUaGlzIGAgK1xuICAgICAgICBgbWVhbnMgdGhhdCB3ZSBjYW5ub3QgYWRkIHRoZSBjb25maWd1cmVkIHRoZW1lIHRvIHRoZSBcIiR7dGFyZ2V0TmFtZX1cIiB0YXJnZXQuYCxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGlzRGVmYXVsdEJ1aWxkZXI7XG59XG4iXX0=