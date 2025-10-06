"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStylesheetFiles = findStylesheetFiles;
const core_1 = require("@angular-devkit/core");
/** Regular expression that matches stylesheet paths */
const STYLESHEET_REGEX = /.*\.(css|scss)$/;
/**
 * Finds stylesheets in the given directory from within the specified tree.
 * @param tree Devkit tree where stylesheet files can be found in.
 * @param startDirectory Optional start directory where stylesheets should be searched in.
 *   This can be useful if only stylesheets within a given folder are relevant (to avoid
 *   unnecessary iterations).
 */
function findStylesheetFiles(tree, startDirectory = '/') {
    const result = [];
    const visitDir = (dirPath) => {
        const { subfiles, subdirs } = tree.getDir(dirPath);
        subfiles.forEach(fileName => {
            if (STYLESHEET_REGEX.test(fileName)) {
                result.push((0, core_1.join)(dirPath, fileName));
            }
        });
        // Visit directories within the current directory to find other stylesheets.
        subdirs.forEach(fragment => {
            // Do not visit directories or files inside node modules or `dist/` folders.
            if (fragment !== 'node_modules' && fragment !== 'dist') {
                visitDir((0, core_1.join)(dirPath, fragment));
            }
        });
    };
    visitDir(startDirectory);
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1zdHlsZXNoZWV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvZmluZC1zdHlsZXNoZWV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQWVILGtEQXFCQztBQWxDRCwrQ0FBZ0Q7QUFHaEQsdURBQXVEO0FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7QUFFM0M7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsSUFBVSxFQUFFLGlCQUF5QixHQUFHO0lBQzFFLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQWEsRUFBRSxFQUFFO1FBQ2pDLE1BQU0sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVqRCxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFJLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdkMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsNEVBQTRFO1FBQzVFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDekIsNEVBQTRFO1lBQzVFLElBQUksUUFBUSxLQUFLLGNBQWMsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQ3ZELFFBQVEsQ0FBQyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7SUFDRixRQUFRLENBQUMsY0FBc0IsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2luLCBQYXRofSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1RyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcblxuLyoqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgc3R5bGVzaGVldCBwYXRocyAqL1xuY29uc3QgU1RZTEVTSEVFVF9SRUdFWCA9IC8uKlxcLihjc3N8c2NzcykkLztcblxuLyoqXG4gKiBGaW5kcyBzdHlsZXNoZWV0cyBpbiB0aGUgZ2l2ZW4gZGlyZWN0b3J5IGZyb20gd2l0aGluIHRoZSBzcGVjaWZpZWQgdHJlZS5cbiAqIEBwYXJhbSB0cmVlIERldmtpdCB0cmVlIHdoZXJlIHN0eWxlc2hlZXQgZmlsZXMgY2FuIGJlIGZvdW5kIGluLlxuICogQHBhcmFtIHN0YXJ0RGlyZWN0b3J5IE9wdGlvbmFsIHN0YXJ0IGRpcmVjdG9yeSB3aGVyZSBzdHlsZXNoZWV0cyBzaG91bGQgYmUgc2VhcmNoZWQgaW4uXG4gKiAgIFRoaXMgY2FuIGJlIHVzZWZ1bCBpZiBvbmx5IHN0eWxlc2hlZXRzIHdpdGhpbiBhIGdpdmVuIGZvbGRlciBhcmUgcmVsZXZhbnQgKHRvIGF2b2lkXG4gKiAgIHVubmVjZXNzYXJ5IGl0ZXJhdGlvbnMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFN0eWxlc2hlZXRGaWxlcyh0cmVlOiBUcmVlLCBzdGFydERpcmVjdG9yeTogc3RyaW5nID0gJy8nKTogc3RyaW5nW10ge1xuICBjb25zdCByZXN1bHQ6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IHZpc2l0RGlyID0gKGRpclBhdGg6IFBhdGgpID0+IHtcbiAgICBjb25zdCB7c3ViZmlsZXMsIHN1YmRpcnN9ID0gdHJlZS5nZXREaXIoZGlyUGF0aCk7XG5cbiAgICBzdWJmaWxlcy5mb3JFYWNoKGZpbGVOYW1lID0+IHtcbiAgICAgIGlmIChTVFlMRVNIRUVUX1JFR0VYLnRlc3QoZmlsZU5hbWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGpvaW4oZGlyUGF0aCwgZmlsZU5hbWUpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFZpc2l0IGRpcmVjdG9yaWVzIHdpdGhpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgdG8gZmluZCBvdGhlciBzdHlsZXNoZWV0cy5cbiAgICBzdWJkaXJzLmZvckVhY2goZnJhZ21lbnQgPT4ge1xuICAgICAgLy8gRG8gbm90IHZpc2l0IGRpcmVjdG9yaWVzIG9yIGZpbGVzIGluc2lkZSBub2RlIG1vZHVsZXMgb3IgYGRpc3QvYCBmb2xkZXJzLlxuICAgICAgaWYgKGZyYWdtZW50ICE9PSAnbm9kZV9tb2R1bGVzJyAmJiBmcmFnbWVudCAhPT0gJ2Rpc3QnKSB7XG4gICAgICAgIHZpc2l0RGlyKGpvaW4oZGlyUGF0aCwgZnJhZ21lbnQpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgdmlzaXREaXIoc3RhcnREaXJlY3RvcnkgYXMgUGF0aCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=