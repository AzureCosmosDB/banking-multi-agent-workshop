"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFontsToIndex = addFontsToIndex;
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const workspace_1 = require("@schematics/angular/utility/workspace");
/** Adds the Material Design fonts to the index HTML file. */
function addFontsToIndex(options) {
    return async (host) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        const projectIndexFiles = (0, schematics_2.getProjectIndexFiles)(project);
        if (!projectIndexFiles.length) {
            throw new schematics_1.SchematicsException('No project index HTML file could be found.');
        }
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
        ];
        projectIndexFiles.forEach(indexFilePath => {
            fonts.forEach(font => {
                (0, schematics_2.appendHtmlElementToHead)(host, indexFilePath, `<link href="${font}" rel="stylesheet">`);
            });
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZm9udHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1hZGQvZm9udHMvbWF0ZXJpYWwtZm9udHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFZSCwwQ0FxQkM7QUEvQkQsMkRBQTJFO0FBQzNFLHdEQUlpQztBQUNqQyxxRUFBbUU7QUFHbkUsNkRBQTZEO0FBQzdELFNBQWdCLGVBQWUsQ0FBQyxPQUFlO0lBQzdDLE9BQU8sS0FBSyxFQUFFLElBQVUsRUFBRSxFQUFFO1FBQzFCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSx3QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUEsb0NBQXVCLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLGlCQUFpQixHQUFHLElBQUEsaUNBQW9CLEVBQUMsT0FBTyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRztZQUNaLCtFQUErRTtZQUMvRSx5REFBeUQ7U0FDMUQsQ0FBQztRQUVGLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN4QyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNuQixJQUFBLG9DQUF1QixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsZUFBZSxJQUFJLHFCQUFxQixDQUFDLENBQUM7WUFDekYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdWxlLCBTY2hlbWF0aWNzRXhjZXB0aW9uLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhcHBlbmRIdG1sRWxlbWVudFRvSGVhZCxcbiAgZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2UsXG4gIGdldFByb2plY3RJbmRleEZpbGVzLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge2dldFdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi4vc2NoZW1hJztcblxuLyoqIEFkZHMgdGhlIE1hdGVyaWFsIERlc2lnbiBmb250cyB0byB0aGUgaW5kZXggSFRNTCBmaWxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEZvbnRzVG9JbmRleChvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3Qgd29ya3NwYWNlID0gYXdhaXQgZ2V0V29ya3NwYWNlKGhvc3QpO1xuICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSh3b3Jrc3BhY2UsIG9wdGlvbnMucHJvamVjdCk7XG4gICAgY29uc3QgcHJvamVjdEluZGV4RmlsZXMgPSBnZXRQcm9qZWN0SW5kZXhGaWxlcyhwcm9qZWN0KTtcblxuICAgIGlmICghcHJvamVjdEluZGV4RmlsZXMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignTm8gcHJvamVjdCBpbmRleCBIVE1MIGZpbGUgY291bGQgYmUgZm91bmQuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9udHMgPSBbXG4gICAgICAnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1Sb2JvdG86d2dodEAzMDA7NDAwOzUwMCZkaXNwbGF5PXN3YXAnLFxuICAgICAgJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vaWNvbj9mYW1pbHk9TWF0ZXJpYWwrSWNvbnMnLFxuICAgIF07XG5cbiAgICBwcm9qZWN0SW5kZXhGaWxlcy5mb3JFYWNoKGluZGV4RmlsZVBhdGggPT4ge1xuICAgICAgZm9udHMuZm9yRWFjaChmb250ID0+IHtcbiAgICAgICAgYXBwZW5kSHRtbEVsZW1lbnRUb0hlYWQoaG9zdCwgaW5kZXhGaWxlUGF0aCwgYDxsaW5rIGhyZWY9XCIke2ZvbnR9XCIgcmVsPVwic3R5bGVzaGVldFwiPmApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG4iXX0=