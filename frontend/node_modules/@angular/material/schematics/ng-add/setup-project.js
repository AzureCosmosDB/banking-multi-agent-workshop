"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const workspace_1 = require("@schematics/angular/utility/workspace");
const utility_1 = require("@schematics/angular/utility");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const material_fonts_1 = require("./fonts/material-fonts");
const theming_1 = require("./theming/theming");
/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.module
 */
function default_1(options) {
    return async (host, context) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        if (project.extensions['projectType'] === workspace_models_1.ProjectType.Application) {
            return (0, schematics_1.chain)([
                addAnimations(options),
                (0, theming_1.addThemeToAppStyles)(options),
                (0, material_fonts_1.addFontsToIndex)(options),
                addMaterialAppStyles(options),
                (0, theming_1.addTypographyClass)(options),
            ]);
        }
        context.logger.warn('Angular Material has been set up in your workspace. There is no additional setup ' +
            'required for consuming Angular Material in your library project.\n\n' +
            'If you intended to run the schematic on a different project, pass the `--project` ' +
            'option.');
        return;
    };
}
/**
 * Adds custom Material styles to the project style file. The custom CSS sets up the Roboto font
 * and reset the default browser body margin.
 */
function addMaterialAppStyles(options) {
    return async (host, context) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        const styleFilePath = (0, schematics_2.getProjectStyleFile)(project);
        const logger = context.logger;
        if (!styleFilePath) {
            logger.error(`Could not find the default style file for this project.`);
            logger.info(`Consider manually adding the Roboto font to your CSS.`);
            logger.info(`More information at https://fonts.google.com/specimen/Roboto`);
            return;
        }
        const buffer = host.read(styleFilePath);
        if (!buffer) {
            logger.error(`Could not read the default style file within the project ` + `(${styleFilePath})`);
            logger.info(`Please consider manually setting up the Roboto font.`);
            return;
        }
        const htmlContent = buffer.toString();
        const insertion = '\n' +
            `html, body { height: 100%; }\n` +
            `body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }\n`;
        if (htmlContent.includes(insertion)) {
            return;
        }
        const recorder = host.beginUpdate(styleFilePath);
        recorder.insertLeft(htmlContent.length, insertion);
        host.commitUpdate(recorder);
    };
}
/** Adds the animations package to the project based on the conffiguration. */
function addAnimations(options) {
    return (host, context) => {
        const animationsRule = options.animations === 'excluded'
            ? (0, schematics_1.noop)()
            : (0, utility_1.addRootProvider)(options.project, ({ code, external }) => {
                return code `${external('provideAnimationsAsync', '@angular/platform-browser/animations/async')}(${options.animations === 'disabled' ? `'noop'` : ''})`;
            });
        // The `addRootProvider` rule can throw in some custom scenarios (see #28640).
        // Add some error handling around it so the setup isn't interrupted.
        return (0, schematics_1.callRule)(animationsRule, host, context).pipe((0, operators_1.catchError)(() => {
            context.logger.error('Failed to add animations to project. Continuing with the Angular Material setup.');
            context.logger.info('Read more about setting up the animations manually: https://angular.io/guide/animations');
            return (0, rxjs_1.of)(host);
        }));
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLWFkZC9zZXR1cC1wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBbUJILDRCQXNCQztBQXZDRCwyREFBK0Y7QUFDL0Ysd0RBQXFGO0FBQ3JGLHFFQUFtRTtBQUNuRSx5REFBNEQ7QUFDNUQsbUZBQXlFO0FBQ3pFLCtCQUF3QztBQUN4Qyw4Q0FBMEM7QUFDMUMsMkRBQXVEO0FBRXZELCtDQUEwRTtBQUUxRTs7Ozs7R0FLRztBQUNILG1CQUF5QixPQUFlO0lBQ3RDLE9BQU8sS0FBSyxFQUFFLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDckQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHdCQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBQSxvQ0FBdUIsRUFBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBFLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyw4QkFBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xFLE9BQU8sSUFBQSxrQkFBSyxFQUFDO2dCQUNYLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RCLElBQUEsNkJBQW1CLEVBQUMsT0FBTyxDQUFDO2dCQUM1QixJQUFBLGdDQUFlLEVBQUMsT0FBTyxDQUFDO2dCQUN4QixvQkFBb0IsQ0FBQyxPQUFPLENBQUM7Z0JBQzdCLElBQUEsNEJBQWtCLEVBQUMsT0FBTyxDQUFDO2FBQzVCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDakIsbUZBQW1GO1lBQ2pGLHNFQUFzRTtZQUN0RSxvRkFBb0Y7WUFDcEYsU0FBUyxDQUNaLENBQUM7UUFDRixPQUFPO0lBQ1QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsb0JBQW9CLENBQUMsT0FBZTtJQUMzQyxPQUFPLEtBQUssRUFBRSxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQ3JELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSx3QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUEsb0NBQXVCLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLGFBQWEsR0FBRyxJQUFBLGdDQUFtQixFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMseURBQXlELENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDckUsTUFBTSxDQUFDLElBQUksQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1lBQzVFLE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixNQUFNLENBQUMsS0FBSyxDQUNWLDJEQUEyRCxHQUFHLElBQUksYUFBYSxHQUFHLENBQ25GLENBQUM7WUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7WUFDcEUsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEMsTUFBTSxTQUFTLEdBQ2IsSUFBSTtZQUNKLGdDQUFnQztZQUNoQywwRUFBMEUsQ0FBQztRQUU3RSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFakQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELDhFQUE4RTtBQUM5RSxTQUFTLGFBQWEsQ0FBQyxPQUFlO0lBQ3BDLE9BQU8sQ0FBQyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sY0FBYyxHQUNsQixPQUFPLENBQUMsVUFBVSxLQUFLLFVBQVU7WUFDL0IsQ0FBQyxDQUFDLElBQUEsaUJBQUksR0FBRTtZQUNSLENBQUMsQ0FBQyxJQUFBLHlCQUFlLEVBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFFLEVBQUU7Z0JBQ3BELE9BQU8sSUFBSSxDQUFBLEdBQUcsUUFBUSxDQUNwQix3QkFBd0IsRUFDeEIsNENBQTRDLENBQzdDLElBQUksT0FBTyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFFVCw4RUFBOEU7UUFDOUUsb0VBQW9FO1FBQ3BFLE9BQU8sSUFBQSxxQkFBUSxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNqRCxJQUFBLHNCQUFVLEVBQUMsR0FBRyxFQUFFO1lBQ2QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ2xCLGtGQUFrRixDQUNuRixDQUFDO1lBQ0YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2pCLHlGQUF5RixDQUMxRixDQUFDO1lBQ0YsT0FBTyxJQUFBLFNBQVksRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NoYWluLCBub29wLCBSdWxlLCBTY2hlbWF0aWNDb250ZXh0LCBUcmVlLCBjYWxsUnVsZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSwgZ2V0UHJvamVjdFN0eWxlRmlsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtnZXRXb3Jrc3BhY2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS93b3Jrc3BhY2UnO1xuaW1wb3J0IHthZGRSb290UHJvdmlkZXJ9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eSc7XG5pbXBvcnQge1Byb2plY3RUeXBlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvd29ya3NwYWNlLW1vZGVscyc7XG5pbXBvcnQge29mIGFzIG9ic2VydmFibGVPZn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2NhdGNoRXJyb3J9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7YWRkRm9udHNUb0luZGV4fSBmcm9tICcuL2ZvbnRzL21hdGVyaWFsLWZvbnRzJztcbmltcG9ydCB7U2NoZW1hfSBmcm9tICcuL3NjaGVtYSc7XG5pbXBvcnQge2FkZFRoZW1lVG9BcHBTdHlsZXMsIGFkZFR5cG9ncmFwaHlDbGFzc30gZnJvbSAnLi90aGVtaW5nL3RoZW1pbmcnO1xuXG4vKipcbiAqIFNjYWZmb2xkcyB0aGUgYmFzaWNzIG9mIGEgQW5ndWxhciBNYXRlcmlhbCBhcHBsaWNhdGlvbiwgdGhpcyBpbmNsdWRlczpcbiAqICAtIEFkZCBQYWNrYWdlcyB0byBwYWNrYWdlLmpzb25cbiAqICAtIEFkZHMgcHJlLWJ1aWx0IHRoZW1lcyB0byBzdHlsZXMuZXh0XG4gKiAgLSBBZGRzIEJyb3dzZXIgQW5pbWF0aW9uIHRvIGFwcC5tb2R1bGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcblxuICAgIGlmIChwcm9qZWN0LmV4dGVuc2lvbnNbJ3Byb2plY3RUeXBlJ10gPT09IFByb2plY3RUeXBlLkFwcGxpY2F0aW9uKSB7XG4gICAgICByZXR1cm4gY2hhaW4oW1xuICAgICAgICBhZGRBbmltYXRpb25zKG9wdGlvbnMpLFxuICAgICAgICBhZGRUaGVtZVRvQXBwU3R5bGVzKG9wdGlvbnMpLFxuICAgICAgICBhZGRGb250c1RvSW5kZXgob3B0aW9ucyksXG4gICAgICAgIGFkZE1hdGVyaWFsQXBwU3R5bGVzKG9wdGlvbnMpLFxuICAgICAgICBhZGRUeXBvZ3JhcGh5Q2xhc3Mob3B0aW9ucyksXG4gICAgICBdKTtcbiAgICB9XG4gICAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAgICdBbmd1bGFyIE1hdGVyaWFsIGhhcyBiZWVuIHNldCB1cCBpbiB5b3VyIHdvcmtzcGFjZS4gVGhlcmUgaXMgbm8gYWRkaXRpb25hbCBzZXR1cCAnICtcbiAgICAgICAgJ3JlcXVpcmVkIGZvciBjb25zdW1pbmcgQW5ndWxhciBNYXRlcmlhbCBpbiB5b3VyIGxpYnJhcnkgcHJvamVjdC5cXG5cXG4nICtcbiAgICAgICAgJ0lmIHlvdSBpbnRlbmRlZCB0byBydW4gdGhlIHNjaGVtYXRpYyBvbiBhIGRpZmZlcmVudCBwcm9qZWN0LCBwYXNzIHRoZSBgLS1wcm9qZWN0YCAnICtcbiAgICAgICAgJ29wdGlvbi4nLFxuICAgICk7XG4gICAgcmV0dXJuO1xuICB9O1xufVxuXG4vKipcbiAqIEFkZHMgY3VzdG9tIE1hdGVyaWFsIHN0eWxlcyB0byB0aGUgcHJvamVjdCBzdHlsZSBmaWxlLiBUaGUgY3VzdG9tIENTUyBzZXRzIHVwIHRoZSBSb2JvdG8gZm9udFxuICogYW5kIHJlc2V0IHRoZSBkZWZhdWx0IGJyb3dzZXIgYm9keSBtYXJnaW4uXG4gKi9cbmZ1bmN0aW9uIGFkZE1hdGVyaWFsQXBwU3R5bGVzKG9wdGlvbnM6IFNjaGVtYSkge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBjb25zdCBzdHlsZUZpbGVQYXRoID0gZ2V0UHJvamVjdFN0eWxlRmlsZShwcm9qZWN0KTtcbiAgICBjb25zdCBsb2dnZXIgPSBjb250ZXh0LmxvZ2dlcjtcblxuICAgIGlmICghc3R5bGVGaWxlUGF0aCkge1xuICAgICAgbG9nZ2VyLmVycm9yKGBDb3VsZCBub3QgZmluZCB0aGUgZGVmYXVsdCBzdHlsZSBmaWxlIGZvciB0aGlzIHByb2plY3QuYCk7XG4gICAgICBsb2dnZXIuaW5mbyhgQ29uc2lkZXIgbWFudWFsbHkgYWRkaW5nIHRoZSBSb2JvdG8gZm9udCB0byB5b3VyIENTUy5gKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBNb3JlIGluZm9ybWF0aW9uIGF0IGh0dHBzOi8vZm9udHMuZ29vZ2xlLmNvbS9zcGVjaW1lbi9Sb2JvdG9gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSBob3N0LnJlYWQoc3R5bGVGaWxlUGF0aCk7XG5cbiAgICBpZiAoIWJ1ZmZlcikge1xuICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICBgQ291bGQgbm90IHJlYWQgdGhlIGRlZmF1bHQgc3R5bGUgZmlsZSB3aXRoaW4gdGhlIHByb2plY3QgYCArIGAoJHtzdHlsZUZpbGVQYXRofSlgLFxuICAgICAgKTtcbiAgICAgIGxvZ2dlci5pbmZvKGBQbGVhc2UgY29uc2lkZXIgbWFudWFsbHkgc2V0dGluZyB1cCB0aGUgUm9ib3RvIGZvbnQuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaHRtbENvbnRlbnQgPSBidWZmZXIudG9TdHJpbmcoKTtcbiAgICBjb25zdCBpbnNlcnRpb24gPVxuICAgICAgJ1xcbicgK1xuICAgICAgYGh0bWwsIGJvZHkgeyBoZWlnaHQ6IDEwMCU7IH1cXG5gICtcbiAgICAgIGBib2R5IHsgbWFyZ2luOiAwOyBmb250LWZhbWlseTogUm9ib3RvLCBcIkhlbHZldGljYSBOZXVlXCIsIHNhbnMtc2VyaWY7IH1cXG5gO1xuXG4gICAgaWYgKGh0bWxDb250ZW50LmluY2x1ZGVzKGluc2VydGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUoc3R5bGVGaWxlUGF0aCk7XG5cbiAgICByZWNvcmRlci5pbnNlcnRMZWZ0KGh0bWxDb250ZW50Lmxlbmd0aCwgaW5zZXJ0aW9uKTtcbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gIH07XG59XG5cbi8qKiBBZGRzIHRoZSBhbmltYXRpb25zIHBhY2thZ2UgdG8gdGhlIHByb2plY3QgYmFzZWQgb24gdGhlIGNvbmZmaWd1cmF0aW9uLiAqL1xuZnVuY3Rpb24gYWRkQW5pbWF0aW9ucyhvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgYW5pbWF0aW9uc1J1bGUgPVxuICAgICAgb3B0aW9ucy5hbmltYXRpb25zID09PSAnZXhjbHVkZWQnXG4gICAgICAgID8gbm9vcCgpXG4gICAgICAgIDogYWRkUm9vdFByb3ZpZGVyKG9wdGlvbnMucHJvamVjdCwgKHtjb2RlLCBleHRlcm5hbH0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlYCR7ZXh0ZXJuYWwoXG4gICAgICAgICAgICAgICdwcm92aWRlQW5pbWF0aW9uc0FzeW5jJyxcbiAgICAgICAgICAgICAgJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXIvYW5pbWF0aW9ucy9hc3luYycsXG4gICAgICAgICAgICApfSgke29wdGlvbnMuYW5pbWF0aW9ucyA9PT0gJ2Rpc2FibGVkJyA/IGAnbm9vcCdgIDogJyd9KWA7XG4gICAgICAgICAgfSk7XG5cbiAgICAvLyBUaGUgYGFkZFJvb3RQcm92aWRlcmAgcnVsZSBjYW4gdGhyb3cgaW4gc29tZSBjdXN0b20gc2NlbmFyaW9zIChzZWUgIzI4NjQwKS5cbiAgICAvLyBBZGQgc29tZSBlcnJvciBoYW5kbGluZyBhcm91bmQgaXQgc28gdGhlIHNldHVwIGlzbid0IGludGVycnVwdGVkLlxuICAgIHJldHVybiBjYWxsUnVsZShhbmltYXRpb25zUnVsZSwgaG9zdCwgY29udGV4dCkucGlwZShcbiAgICAgIGNhdGNoRXJyb3IoKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnRmFpbGVkIHRvIGFkZCBhbmltYXRpb25zIHRvIHByb2plY3QuIENvbnRpbnVpbmcgd2l0aCB0aGUgQW5ndWxhciBNYXRlcmlhbCBzZXR1cC4nLFxuICAgICAgICApO1xuICAgICAgICBjb250ZXh0LmxvZ2dlci5pbmZvKFxuICAgICAgICAgICdSZWFkIG1vcmUgYWJvdXQgc2V0dGluZyB1cCB0aGUgYW5pbWF0aW9ucyBtYW51YWxseTogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2FuaW1hdGlvbnMnLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKGhvc3QpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfTtcbn1cbiJdfQ==