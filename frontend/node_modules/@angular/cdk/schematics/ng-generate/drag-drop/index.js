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
const utils_1 = require("../../utils");
/** Scaffolds a new Angular component that uses the Drag and Drop module. */
function default_1(options) {
    return (0, schematics_1.chain)([
        (0, utils_1.buildComponent)({ ...options }, {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? (0, schematics_1.noop)() : addDragDropModulesToModule(options),
    ]);
}
/** Adds the required modules to the main module of the CLI project. */
function addDragDropModulesToModule(options) {
    return async (host) => {
        const isStandalone = await (0, utils_1.isStandaloneSchematic)(host, options);
        if (!isStandalone) {
            const modulePath = await (0, utils_1.findModuleFromOptions)(host, options);
            (0, utils_1.addModuleImportToModule)(host, modulePath, 'DragDropModule', '@angular/cdk/drag-drop');
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctZ2VuZXJhdGUvZHJhZy1kcm9wL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBWUgsNEJBYUM7QUF2QkQsMkRBQW1FO0FBQ25FLHVDQUtxQjtBQUdyQiw0RUFBNEU7QUFDNUUsbUJBQXlCLE9BQWU7SUFDdEMsT0FBTyxJQUFBLGtCQUFLLEVBQUM7UUFDWCxJQUFBLHNCQUFjLEVBQ1osRUFBQyxHQUFHLE9BQU8sRUFBQyxFQUNaO1lBQ0UsUUFBUSxFQUNOLGtGQUFrRjtZQUNwRixVQUFVLEVBQ1IsdUZBQXVGO1NBQzFGLENBQ0Y7UUFDRCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFBLGlCQUFJLEdBQUUsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDO0tBQ2xFLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCx1RUFBdUU7QUFDdkUsU0FBUywwQkFBMEIsQ0FBQyxPQUFlO0lBQ2pELE9BQU8sS0FBSyxFQUFFLElBQVUsRUFBRSxFQUFFO1FBQzFCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBQSw2QkFBcUIsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFaEUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2xCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSw2QkFBcUIsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUQsSUFBQSwrQkFBdUIsRUFBQyxJQUFJLEVBQUUsVUFBVyxFQUFFLGdCQUFnQixFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDekYsQ0FBQztJQUNILENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjaGFpbiwgbm9vcCwgUnVsZSwgVHJlZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtcbiAgYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUsXG4gIGJ1aWxkQ29tcG9uZW50LFxuICBmaW5kTW9kdWxlRnJvbU9wdGlvbnMsXG4gIGlzU3RhbmRhbG9uZVNjaGVtYXRpYyxcbn0gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4vc2NoZW1hJztcblxuLyoqIFNjYWZmb2xkcyBhIG5ldyBBbmd1bGFyIGNvbXBvbmVudCB0aGF0IHVzZXMgdGhlIERyYWcgYW5kIERyb3AgbW9kdWxlLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xuICByZXR1cm4gY2hhaW4oW1xuICAgIGJ1aWxkQ29tcG9uZW50KFxuICAgICAgey4uLm9wdGlvbnN9LFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Lmh0bWwudGVtcGxhdGUnLFxuICAgICAgICBzdHlsZXNoZWV0OlxuICAgICAgICAgICcuL19fcGF0aF9fL19fbmFtZUBkYXNoZXJpemVAaWYtZmxhdF9fL19fbmFtZUBkYXNoZXJpemVfXy5jb21wb25lbnQuX19zdHlsZV9fLnRlbXBsYXRlJyxcbiAgICAgIH0sXG4gICAgKSxcbiAgICBvcHRpb25zLnNraXBJbXBvcnQgPyBub29wKCkgOiBhZGREcmFnRHJvcE1vZHVsZXNUb01vZHVsZShvcHRpb25zKSxcbiAgXSk7XG59XG5cbi8qKiBBZGRzIHRoZSByZXF1aXJlZCBtb2R1bGVzIHRvIHRoZSBtYWluIG1vZHVsZSBvZiB0aGUgQ0xJIHByb2plY3QuICovXG5mdW5jdGlvbiBhZGREcmFnRHJvcE1vZHVsZXNUb01vZHVsZShvcHRpb25zOiBTY2hlbWEpIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3QgaXNTdGFuZGFsb25lID0gYXdhaXQgaXNTdGFuZGFsb25lU2NoZW1hdGljKGhvc3QsIG9wdGlvbnMpO1xuXG4gICAgaWYgKCFpc1N0YW5kYWxvbmUpIHtcbiAgICAgIGNvbnN0IG1vZHVsZVBhdGggPSBhd2FpdCBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucyk7XG4gICAgICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoISwgJ0RyYWdEcm9wTW9kdWxlJywgJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnKTtcbiAgICB9XG4gIH07XG59XG4iXX0=