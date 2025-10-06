"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComponent = buildComponent;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const schema_1 = require("@schematics/angular/component/schema");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const validation_1 = require("@schematics/angular/utility/validation");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const fs_1 = require("fs");
const path_1 = require("path");
const ts = require("typescript");
const get_project_1 = require("./get-project");
const schematic_options_1 = require("./schematic-options");
/**
 * Build a default project path for generating.
 * @param project The project to build the path for.
 */
function buildDefaultPath(project) {
    const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
    const projectDirName = project.extensions['projectType'] === workspace_models_1.ProjectType.Application ? 'app' : 'lib';
    return `${root}${projectDirName}`;
}
/**
 * List of style extensions which are CSS compatible. All supported CLI style extensions can be
 * found here: angular/angular-cli/main/packages/schematics/angular/ng-new/schema.json#L118-L122
 */
const supportedCssExtensions = ['css', 'scss', 'less'];
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    return ts.createSourceFile(modulePath, text.toString('utf-8'), ts.ScriptTarget.Latest, true);
}
function addDeclarationToNgModule(options) {
    return (host) => {
        if (options.skipImport || options.standalone || !options.module) {
            return host;
        }
        const modulePath = options.module;
        let source = readIntoSourceFile(host, modulePath);
        const componentPath = `/${options.path}/` +
            (options.flat ? '' : core_1.strings.dasherize(options.name) + '/') +
            core_1.strings.dasherize(options.name) +
            '.component';
        const relativePath = (0, find_module_1.buildRelativePath)(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(`${options.name}Component`);
        const declarationChanges = (0, ast_utils_1.addDeclarationToModule)(source, modulePath, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        if (options.export) {
            // Need to refresh the AST because we overwrote the file in the host.
            source = readIntoSourceFile(host, modulePath);
            const exportRecorder = host.beginUpdate(modulePath);
            const exportChanges = (0, ast_utils_1.addExportToModule)(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
            for (const change of exportChanges) {
                if (change instanceof change_1.InsertChange) {
                    exportRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(exportRecorder);
        }
        return host;
    };
}
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
/**
 * Indents the text content with the amount of specified spaces. The spaces will be added after
 * every line-break. This utility function can be used inside of EJS templates to properly
 * include the additional files.
 */
function indentTextContent(text, numSpaces) {
    // In the Material project there should be only LF line-endings, but the schematic files
    // are not being linted and therefore there can be also CRLF or just CR line-endings.
    return text.replace(/(\r\n|\r|\n)/g, `$1${' '.repeat(numSpaces)}`);
}
/**
 * Rule that copies and interpolates the files that belong to this schematic context. Additionally
 * a list of file paths can be passed to this rule in order to expose them inside the EJS
 * template context.
 *
 * This allows inlining the external template or stylesheet files in EJS without having
 * to manually duplicate the file content.
 */
function buildComponent(options, additionalFiles = {}) {
    return async (host, ctx) => {
        const context = ctx;
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, get_project_1.getProjectFromWorkspace)(workspace, options.project);
        const defaultComponentOptions = (0, schematic_options_1.getDefaultComponentOptions)(project);
        // TODO(devversion): Remove if we drop support for older CLI versions.
        // This handles an unreported breaking change from the @angular-devkit/schematics. Previously
        // the description path resolved to the factory file, but starting from 6.2.0, it resolves
        // to the factory directory.
        const schematicPath = (0, fs_1.statSync)(context.schematic.description.path).isDirectory()
            ? context.schematic.description.path
            : (0, path_1.dirname)(context.schematic.description.path);
        const schematicFilesUrl = './files';
        const schematicFilesPath = (0, path_1.resolve)(schematicPath, schematicFilesUrl);
        // Add the default component option values to the options if an option is not explicitly
        // specified but a default component option is available.
        Object.keys(options)
            .filter(key => options[key] == null &&
            defaultComponentOptions[key])
            .forEach(key => (options[key] = defaultComponentOptions[key]));
        if (options.path === undefined) {
            options.path = buildDefaultPath(project);
        }
        options.standalone = await (0, schematic_options_1.isStandaloneSchematic)(host, options);
        if (!options.standalone) {
            options.module = (0, find_module_1.findModuleFromOptions)(host, options);
        }
        const parsedPath = (0, parse_name_1.parseName)(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        (0, validation_1.validateHtmlSelector)(options.selector);
        // In case the specified style extension is not part of the supported CSS supersets,
        // we generate the stylesheets with the "css" extension. This ensures that we don't
        // accidentally generate invalid stylesheets (e.g. drag-drop-comp.styl) which will
        // break the Angular CLI project. See: https://github.com/angular/components/issues/15164
        if (!supportedCssExtensions.includes(options.style)) {
            options.style = schema_1.Style.Css;
        }
        // Object that will be used as context for the EJS templates.
        const baseTemplateContext = {
            ...core_1.strings,
            'if-flat': (s) => (options.flat ? '' : s),
            ...options,
        };
        // Key-value object that includes the specified additional files with their loaded content.
        // The resolved contents can be used inside EJS templates.
        const resolvedFiles = {};
        for (let key in additionalFiles) {
            if (additionalFiles[key]) {
                const fileContent = (0, fs_1.readFileSync)((0, path_1.join)(schematicFilesPath, additionalFiles[key]), 'utf-8');
                // Interpolate the additional files with the base EJS template context.
                resolvedFiles[key] = (0, core_1.template)(fileContent)(baseTemplateContext);
            }
        }
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)(schematicFilesUrl), [
            options.skipTests ? (0, schematics_1.filter)(path => !path.endsWith('.spec.ts.template')) : (0, schematics_1.noop)(),
            options.inlineStyle ? (0, schematics_1.filter)(path => !path.endsWith('.__style__.template')) : (0, schematics_1.noop)(),
            options.inlineTemplate ? (0, schematics_1.filter)(path => !path.endsWith('.html.template')) : (0, schematics_1.noop)(),
            // Treat the template options as any, because the type definition for the template options
            // is made unnecessarily explicit. Every type of object can be used in the EJS template.
            (0, schematics_1.applyTemplates)({ indentTextContent, resolvedFiles, ...baseTemplateContext }),
            // TODO(devversion): figure out why we cannot just remove the first parameter
            // See for example: angular-cli#schematics/angular/component/index.ts#L160
            (0, schematics_1.move)(null, parsedPath.path),
        ]);
        return () => (0, schematics_1.chain)([
            (0, schematics_1.branchAndMerge)((0, schematics_1.chain)([addDeclarationToNgModule(options), (0, schematics_1.mergeWith)(templateSource)])),
        ])(host, context);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL2J1aWxkLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQWtKSCx3Q0FtR0M7QUFuUEQsK0NBQTBGO0FBQzFGLDJEQWFvQztBQUVwQyxpRUFBdUY7QUFDdkYsK0RBQWdFO0FBQ2hFLHFFQUFtRTtBQUNuRSx5RUFBaUc7QUFDakcsdUVBQWlFO0FBQ2pFLHVFQUE0RTtBQUM1RSxtRkFBeUU7QUFDekUscUVBQWdHO0FBQ2hHLDJCQUEwQztBQUMxQywrQkFBNEM7QUFDNUMsaUNBQWlDO0FBQ2pDLCtDQUFzRDtBQUN0RCwyREFBc0Y7QUFFdEY7OztHQUdHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFxQztJQUM3RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUM7SUFFdEYsTUFBTSxjQUFjLEdBQ2xCLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQUssOEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBRWhGLE9BQU8sR0FBRyxJQUFJLEdBQUcsY0FBYyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRXZELFNBQVMsa0JBQWtCLENBQUMsSUFBVSxFQUFFLFVBQWtCO0lBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsSUFBSSxJQUFJ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QUFBLHNCQUFTLEVBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RGLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3N0cmluZ3MsIHRlbXBsYXRlIGFzIGludGVycG9sYXRlVGVtcGxhdGUsIHdvcmtzcGFjZXN9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIGFwcGx5LFxuICBhcHBseVRlbXBsYXRlcyxcbiAgYnJhbmNoQW5kTWVyZ2UsXG4gIGNoYWluLFxuICBmaWx0ZXIsXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgbm9vcCxcbiAgUnVsZSxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgdXJsLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge0ZpbGVTeXN0ZW1TY2hlbWF0aWNDb250ZXh0fSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90b29scyc7XG5pbXBvcnQge1NjaGVtYSBhcyBDb21wb25lbnRPcHRpb25zLCBTdHlsZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci9jb21wb25lbnQvc2NoZW1hJztcbmltcG9ydCB7SW5zZXJ0Q2hhbmdlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvY2hhbmdlJztcbmltcG9ydCB7Z2V0V29ya3NwYWNlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvd29ya3NwYWNlJztcbmltcG9ydCB7YnVpbGRSZWxhdGl2ZVBhdGgsIGZpbmRNb2R1bGVGcm9tT3B0aW9uc30gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2ZpbmQtbW9kdWxlJztcbmltcG9ydCB7cGFyc2VOYW1lfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvcGFyc2UtbmFtZSc7XG5pbXBvcnQge3ZhbGlkYXRlSHRtbFNlbGVjdG9yfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvdmFsaWRhdGlvbic7XG5pbXBvcnQge1Byb2plY3RUeXBlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvd29ya3NwYWNlLW1vZGVscyc7XG5pbXBvcnQge2FkZERlY2xhcmF0aW9uVG9Nb2R1bGUsIGFkZEV4cG9ydFRvTW9kdWxlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvYXN0LXV0aWxzJztcbmltcG9ydCB7cmVhZEZpbGVTeW5jLCBzdGF0U3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2luLCByZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZX0gZnJvbSAnLi9nZXQtcHJvamVjdCc7XG5pbXBvcnQge2dldERlZmF1bHRDb21wb25lbnRPcHRpb25zLCBpc1N0YW5kYWxvbmVTY2hlbWF0aWN9IGZyb20gJy4vc2NoZW1hdGljLW9wdGlvbnMnO1xuXG4vKipcbiAqIEJ1aWxkIGEgZGVmYXVsdCBwcm9qZWN0IHBhdGggZm9yIGdlbmVyYXRpbmcuXG4gKiBAcGFyYW0gcHJvamVjdCBUaGUgcHJvamVjdCB0byBidWlsZCB0aGUgcGF0aCBmb3IuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkRGVmYXVsdFBhdGgocHJvamVjdDogd29ya3NwYWNlcy5Qcm9qZWN0RGVmaW5pdGlvbik6IHN0cmluZyB7XG4gIGNvbnN0IHJvb3QgPSBwcm9qZWN0LnNvdXJjZVJvb3QgPyBgLyR7cHJvamVjdC5zb3VyY2VSb290fS9gIDogYC8ke3Byb2plY3Qucm9vdH0vc3JjL2A7XG5cbiAgY29uc3QgcHJvamVjdERpck5hbWUgPVxuICAgIHByb2plY3QuZXh0ZW5zaW9uc1sncHJvamVjdFR5cGUnXSA9PT0gUHJvamVjdFR5cGUuQXBwbGljYXRpb24gPyAnYXBwJyA6ICdsaWInO1xuXG4gIHJldHVybiBgJHtyb290fSR7cHJvamVjdERpck5hbWV9YDtcbn1cblxuLyoqXG4gKiBMaXN0IG9mIHN0eWxlIGV4dGVuc2lvbnMgd2hpY2ggYXJlIENTUyBjb21wYXRpYmxlLiBBbGwgc3VwcG9ydGVkIENMSSBzdHlsZSBleHRlbnNpb25zIGNhbiBiZVxuICogZm91bmQgaGVyZTogYW5ndWxhci9hbmd1bGFyLWNsaS9tYWluL3BhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9uZy1uZXcvc2NoZW1hLmpzb24jTDExOC1MMTIyXG4gKi9cbmNvbnN0IHN1cHBvcnRlZENzc0V4dGVuc2lvbnMgPSBbJ2NzcycsICdzY3NzJywgJ2xlc3MnXTtcblxuZnVuY3Rpb24gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCB0ZXh0ID0gaG9zdC5yZWFkKG1vZHVsZVBhdGgpO1xuICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7bW9kdWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gIH1cblxuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShtb2R1bGVQYXRoLCB0ZXh0LnRvU3RyaW5nKCd1dGYtOCcpLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gYWRkRGVjbGFyYXRpb25Ub05nTW9kdWxlKG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKG9wdGlvbnMuc2tpcEltcG9ydCB8fCBvcHRpb25zLnN0YW5kYWxvbmUgfHwgIW9wdGlvbnMubW9kdWxlKSB7XG4gICAgICByZXR1cm4gaG9zdDtcbiAgICB9XG5cbiAgICBjb25zdCBtb2R1bGVQYXRoID0gb3B0aW9ucy5tb2R1bGU7XG4gICAgbGV0IHNvdXJjZSA9IHJlYWRJbnRvU291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcblxuICAgIGNvbnN0IGNvbXBvbmVudFBhdGggPVxuICAgICAgYC8ke29wdGlvbnMucGF0aH0vYCArXG4gICAgICAob3B0aW9ucy5mbGF0ID8gJycgOiBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICsgJy8nKSArXG4gICAgICBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICtcbiAgICAgICcuY29tcG9uZW50JztcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBidWlsZFJlbGF0aXZlUGF0aChtb2R1bGVQYXRoLCBjb21wb25lbnRQYXRoKTtcbiAgICBjb25zdCBjbGFzc2lmaWVkTmFtZSA9IHN0cmluZ3MuY2xhc3NpZnkoYCR7b3B0aW9ucy5uYW1lfUNvbXBvbmVudGApO1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb25DaGFuZ2VzID0gYWRkRGVjbGFyYXRpb25Ub01vZHVsZShcbiAgICAgIHNvdXJjZSxcbiAgICAgIG1vZHVsZVBhdGgsXG4gICAgICBjbGFzc2lmaWVkTmFtZSxcbiAgICAgIHJlbGF0aXZlUGF0aCxcbiAgICApO1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb25SZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgZGVjbGFyYXRpb25DaGFuZ2VzKSB7XG4gICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgIGRlY2xhcmF0aW9uUmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgfVxuICAgIH1cbiAgICBob3N0LmNvbW1pdFVwZGF0ZShkZWNsYXJhdGlvblJlY29yZGVyKTtcblxuICAgIGlmIChvcHRpb25zLmV4cG9ydCkge1xuICAgICAgLy8gTmVlZCB0byByZWZyZXNoIHRoZSBBU1QgYmVjYXVzZSB3ZSBvdmVyd3JvdGUgdGhlIGZpbGUgaW4gdGhlIGhvc3QuXG4gICAgICBzb3VyY2UgPSByZWFkSW50b1NvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG5cbiAgICAgIGNvbnN0IGV4cG9ydFJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICAgIGNvbnN0IGV4cG9ydENoYW5nZXMgPSBhZGRFeHBvcnRUb01vZHVsZShcbiAgICAgICAgc291cmNlLFxuICAgICAgICBtb2R1bGVQYXRoLFxuICAgICAgICBzdHJpbmdzLmNsYXNzaWZ5KGAke29wdGlvbnMubmFtZX1Db21wb25lbnRgKSxcbiAgICAgICAgcmVsYXRpdmVQYXRoLFxuICAgICAgKTtcblxuICAgICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgZXhwb3J0Q2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgICAgZXhwb3J0UmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBob3N0LmNvbW1pdFVwZGF0ZShleHBvcnRSZWNvcmRlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkU2VsZWN0b3Iob3B0aW9uczogQ29tcG9uZW50T3B0aW9ucywgcHJvamVjdFByZWZpeD86IHN0cmluZykge1xuICBsZXQgc2VsZWN0b3IgPSBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpO1xuICBpZiAob3B0aW9ucy5wcmVmaXgpIHtcbiAgICBzZWxlY3RvciA9IGAke29wdGlvbnMucHJlZml4fS0ke3NlbGVjdG9yfWA7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5wcmVmaXggPT09IHVuZGVmaW5lZCAmJiBwcm9qZWN0UHJlZml4KSB7XG4gICAgc2VsZWN0b3IgPSBgJHtwcm9qZWN0UHJlZml4fS0ke3NlbGVjdG9yfWA7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3I7XG59XG5cbi8qKlxuICogSW5kZW50cyB0aGUgdGV4dCBjb250ZW50IHdpdGggdGhlIGFtb3VudCBvZiBzcGVjaWZpZWQgc3BhY2VzLiBUaGUgc3BhY2VzIHdpbGwgYmUgYWRkZWQgYWZ0ZXJcbiAqIGV2ZXJ5IGxpbmUtYnJlYWsuIFRoaXMgdXRpbGl0eSBmdW5jdGlvbiBjYW4gYmUgdXNlZCBpbnNpZGUgb2YgRUpTIHRlbXBsYXRlcyB0byBwcm9wZXJseVxuICogaW5jbHVkZSB0aGUgYWRkaXRpb25hbCBmaWxlcy5cbiAqL1xuZnVuY3Rpb24gaW5kZW50VGV4dENvbnRlbnQodGV4dDogc3RyaW5nLCBudW1TcGFjZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIC8vIEluIHRoZSBNYXRlcmlhbCBwcm9qZWN0IHRoZXJlIHNob3VsZCBiZSBvbmx5IExGIGxpbmUtZW5kaW5ncywgYnV0IHRoZSBzY2hlbWF0aWMgZmlsZXNcbiAgLy8gYXJlIG5vdCBiZWluZyBsaW50ZWQgYW5kIHRoZXJlZm9yZSB0aGVyZSBjYW4gYmUgYWxzbyBDUkxGIG9yIGp1c3QgQ1IgbGluZS1lbmRpbmdzLlxuICByZXR1cm4gdGV4dC5yZXBsYWNlKC8oXFxyXFxufFxccnxcXG4pL2csIGAkMSR7JyAnLnJlcGVhdChudW1TcGFjZXMpfWApO1xufVxuXG4vKipcbiAqIFJ1bGUgdGhhdCBjb3BpZXMgYW5kIGludGVycG9sYXRlcyB0aGUgZmlsZXMgdGhhdCBiZWxvbmcgdG8gdGhpcyBzY2hlbWF0aWMgY29udGV4dC4gQWRkaXRpb25hbGx5XG4gKiBhIGxpc3Qgb2YgZmlsZSBwYXRocyBjYW4gYmUgcGFzc2VkIHRvIHRoaXMgcnVsZSBpbiBvcmRlciB0byBleHBvc2UgdGhlbSBpbnNpZGUgdGhlIEVKU1xuICogdGVtcGxhdGUgY29udGV4dC5cbiAqXG4gKiBUaGlzIGFsbG93cyBpbmxpbmluZyB0aGUgZXh0ZXJuYWwgdGVtcGxhdGUgb3Igc3R5bGVzaGVldCBmaWxlcyBpbiBFSlMgd2l0aG91dCBoYXZpbmdcbiAqIHRvIG1hbnVhbGx5IGR1cGxpY2F0ZSB0aGUgZmlsZSBjb250ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21wb25lbnQoXG4gIG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMsXG4gIGFkZGl0aW9uYWxGaWxlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fSxcbik6IFJ1bGUge1xuICByZXR1cm4gYXN5bmMgKGhvc3QsIGN0eCkgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSBjdHggYXMgRmlsZVN5c3RlbVNjaGVtYXRpY0NvbnRleHQ7XG4gICAgY29uc3Qgd29ya3NwYWNlID0gYXdhaXQgZ2V0V29ya3NwYWNlKGhvc3QpO1xuICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSh3b3Jrc3BhY2UsIG9wdGlvbnMucHJvamVjdCk7XG4gICAgY29uc3QgZGVmYXVsdENvbXBvbmVudE9wdGlvbnMgPSBnZXREZWZhdWx0Q29tcG9uZW50T3B0aW9ucyhwcm9qZWN0KTtcblxuICAgIC8vIFRPRE8oZGV2dmVyc2lvbik6IFJlbW92ZSBpZiB3ZSBkcm9wIHN1cHBvcnQgZm9yIG9sZGVyIENMSSB2ZXJzaW9ucy5cbiAgICAvLyBUaGlzIGhhbmRsZXMgYW4gdW5yZXBvcnRlZCBicmVha2luZyBjaGFuZ2UgZnJvbSB0aGUgQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MuIFByZXZpb3VzbHlcbiAgICAvLyB0aGUgZGVzY3JpcHRpb24gcGF0aCByZXNvbHZlZCB0byB0aGUgZmFjdG9yeSBmaWxlLCBidXQgc3RhcnRpbmcgZnJvbSA2LjIuMCwgaXQgcmVzb2x2ZXNcbiAgICAvLyB0byB0aGUgZmFjdG9yeSBkaXJlY3RvcnkuXG4gICAgY29uc3Qgc2NoZW1hdGljUGF0aCA9IHN0YXRTeW5jKGNvbnRleHQuc2NoZW1hdGljLmRlc2NyaXB0aW9uLnBhdGgpLmlzRGlyZWN0b3J5KClcbiAgICAgID8gY29udGV4dC5zY2hlbWF0aWMuZGVzY3JpcHRpb24ucGF0aFxuICAgICAgOiBkaXJuYW1lKGNvbnRleHQuc2NoZW1hdGljLmRlc2NyaXB0aW9uLnBhdGgpO1xuXG4gICAgY29uc3Qgc2NoZW1hdGljRmlsZXNVcmwgPSAnLi9maWxlcyc7XG4gICAgY29uc3Qgc2NoZW1hdGljRmlsZXNQYXRoID0gcmVzb2x2ZShzY2hlbWF0aWNQYXRoLCBzY2hlbWF0aWNGaWxlc1VybCk7XG5cbiAgICAvLyBBZGQgdGhlIGRlZmF1bHQgY29tcG9uZW50IG9wdGlvbiB2YWx1ZXMgdG8gdGhlIG9wdGlvbnMgaWYgYW4gb3B0aW9uIGlzIG5vdCBleHBsaWNpdGx5XG4gICAgLy8gc3BlY2lmaWVkIGJ1dCBhIGRlZmF1bHQgY29tcG9uZW50IG9wdGlvbiBpcyBhdmFpbGFibGUuXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucylcbiAgICAgIC5maWx0ZXIoXG4gICAgICAgIGtleSA9PlxuICAgICAgICAgIG9wdGlvbnNba2V5IGFzIGtleW9mIENvbXBvbmVudE9wdGlvbnNdID09IG51bGwgJiZcbiAgICAgICAgICBkZWZhdWx0Q29tcG9uZW50T3B0aW9uc1trZXkgYXMga2V5b2YgQ29tcG9uZW50T3B0aW9uc10sXG4gICAgICApXG4gICAgICAuZm9yRWFjaChcbiAgICAgICAga2V5ID0+XG4gICAgICAgICAgKChvcHRpb25zIGFzIGFueSlba2V5XSA9IChkZWZhdWx0Q29tcG9uZW50T3B0aW9ucyBhcyBDb21wb25lbnRPcHRpb25zKVtcbiAgICAgICAgICAgIGtleSBhcyBrZXlvZiBDb21wb25lbnRPcHRpb25zXG4gICAgICAgICAgXSksXG4gICAgICApO1xuXG4gICAgaWYgKG9wdGlvbnMucGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLnBhdGggPSBidWlsZERlZmF1bHRQYXRoKHByb2plY3QpO1xuICAgIH1cblxuICAgIG9wdGlvbnMuc3RhbmRhbG9uZSA9IGF3YWl0IGlzU3RhbmRhbG9uZVNjaGVtYXRpYyhob3N0LCBvcHRpb25zKTtcblxuICAgIGlmICghb3B0aW9ucy5zdGFuZGFsb25lKSB7XG4gICAgICBvcHRpb25zLm1vZHVsZSA9IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhob3N0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWRQYXRoID0gcGFyc2VOYW1lKG9wdGlvbnMucGF0aCEsIG9wdGlvbnMubmFtZSk7XG5cbiAgICBvcHRpb25zLm5hbWUgPSBwYXJzZWRQYXRoLm5hbWU7XG4gICAgb3B0aW9ucy5wYXRoID0gcGFyc2VkUGF0aC5wYXRoO1xuICAgIG9wdGlvbnMuc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yIHx8IGJ1aWxkU2VsZWN0b3Iob3B0aW9ucywgcHJvamVjdC5wcmVmaXgpO1xuXG4gICAgdmFsaWRhdGVIdG1sU2VsZWN0b3Iob3B0aW9ucy5zZWxlY3RvciEpO1xuXG4gICAgLy8gSW4gY2FzZSB0aGUgc3BlY2lmaWVkIHN0eWxlIGV4dGVuc2lvbiBpcyBub3QgcGFydCBvZiB0aGUgc3VwcG9ydGVkIENTUyBzdXBlcnNldHMsXG4gICAgLy8gd2UgZ2VuZXJhdGUgdGhlIHN0eWxlc2hlZXRzIHdpdGggdGhlIFwiY3NzXCIgZXh0ZW5zaW9uLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBnZW5lcmF0ZSBpbnZhbGlkIHN0eWxlc2hlZXRzIChlLmcuIGRyYWctZHJvcC1jb21wLnN0eWwpIHdoaWNoIHdpbGxcbiAgICAvLyBicmVhayB0aGUgQW5ndWxhciBDTEkgcHJvamVjdC4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNTE2NFxuICAgIGlmICghc3VwcG9ydGVkQ3NzRXh0ZW5zaW9ucy5pbmNsdWRlcyhvcHRpb25zLnN0eWxlISkpIHtcbiAgICAgIG9wdGlvbnMuc3R5bGUgPSBTdHlsZS5Dc3M7XG4gICAgfVxuXG4gICAgLy8gT2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIGFzIGNvbnRleHQgZm9yIHRoZSBFSlMgdGVtcGxhdGVzLlxuICAgIGNvbnN0IGJhc2VUZW1wbGF0ZUNvbnRleHQgPSB7XG4gICAgICAuLi5zdHJpbmdzLFxuICAgICAgJ2lmLWZsYXQnOiAoczogc3RyaW5nKSA9PiAob3B0aW9ucy5mbGF0ID8gJycgOiBzKSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIC8vIEtleS12YWx1ZSBvYmplY3QgdGhhdCBpbmNsdWRlcyB0aGUgc3BlY2lmaWVkIGFkZGl0aW9uYWwgZmlsZXMgd2l0aCB0aGVpciBsb2FkZWQgY29udGVudC5cbiAgICAvLyBUaGUgcmVzb2x2ZWQgY29udGVudHMgY2FuIGJlIHVzZWQgaW5zaWRlIEVKUyB0ZW1wbGF0ZXMuXG4gICAgY29uc3QgcmVzb2x2ZWRGaWxlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4gICAgZm9yIChsZXQga2V5IGluIGFkZGl0aW9uYWxGaWxlcykge1xuICAgICAgaWYgKGFkZGl0aW9uYWxGaWxlc1trZXldKSB7XG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50ID0gcmVhZEZpbGVTeW5jKGpvaW4oc2NoZW1hdGljRmlsZXNQYXRoLCBhZGRpdGlvbmFsRmlsZXNba2V5XSksICd1dGYtOCcpO1xuXG4gICAgICAgIC8vIEludGVycG9sYXRlIHRoZSBhZGRpdGlvbmFsIGZpbGVzIHdpdGggdGhlIGJhc2UgRUpTIHRlbXBsYXRlIGNvbnRleHQuXG4gICAgICAgIHJlc29sdmVkRmlsZXNba2V5XSA9IGludGVycG9sYXRlVGVtcGxhdGUoZmlsZUNvbnRlbnQpKGJhc2VUZW1wbGF0ZUNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gYXBwbHkodXJsKHNjaGVtYXRpY0ZpbGVzVXJsKSwgW1xuICAgICAgb3B0aW9ucy5za2lwVGVzdHMgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLnNwZWMudHMudGVtcGxhdGUnKSkgOiBub29wKCksXG4gICAgICBvcHRpb25zLmlubGluZVN0eWxlID8gZmlsdGVyKHBhdGggPT4gIXBhdGguZW5kc1dpdGgoJy5fX3N0eWxlX18udGVtcGxhdGUnKSkgOiBub29wKCksXG4gICAgICBvcHRpb25zLmlubGluZVRlbXBsYXRlID8gZmlsdGVyKHBhdGggPT4gIXBhdGguZW5kc1dpdGgoJy5odG1sLnRlbXBsYXRlJykpIDogbm9vcCgpLFxuICAgICAgLy8gVHJlYXQgdGhlIHRlbXBsYXRlIG9wdGlvbnMgYXMgYW55LCBiZWNhdXNlIHRoZSB0eXBlIGRlZmluaXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBvcHRpb25zXG4gICAgICAvLyBpcyBtYWRlIHVubmVjZXNzYXJpbHkgZXhwbGljaXQuIEV2ZXJ5IHR5cGUgb2Ygb2JqZWN0IGNhbiBiZSB1c2VkIGluIHRoZSBFSlMgdGVtcGxhdGUuXG4gICAgICBhcHBseVRlbXBsYXRlcyh7aW5kZW50VGV4dENvbnRlbnQsIHJlc29sdmVkRmlsZXMsIC4uLmJhc2VUZW1wbGF0ZUNvbnRleHR9IGFzIGFueSksXG4gICAgICAvLyBUT0RPKGRldnZlcnNpb24pOiBmaWd1cmUgb3V0IHdoeSB3ZSBjYW5ub3QganVzdCByZW1vdmUgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgLy8gU2VlIGZvciBleGFtcGxlOiBhbmd1bGFyLWNsaSNzY2hlbWF0aWNzL2FuZ3VsYXIvY29tcG9uZW50L2luZGV4LnRzI0wxNjBcbiAgICAgIG1vdmUobnVsbCBhcyBhbnksIHBhcnNlZFBhdGgucGF0aCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gKCkgPT5cbiAgICAgIGNoYWluKFtcbiAgICAgICAgYnJhbmNoQW5kTWVyZ2UoY2hhaW4oW2FkZERlY2xhcmF0aW9uVG9OZ01vZHVsZShvcHRpb25zKSwgbWVyZ2VXaXRoKHRlbXBsYXRlU291cmNlKV0pKSxcbiAgICAgIF0pKGhvc3QsIGNvbnRleHQpO1xuICB9O1xufVxuIl19