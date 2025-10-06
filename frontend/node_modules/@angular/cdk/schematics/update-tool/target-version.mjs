"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetVersion = void 0;
exports.getAllVersionNames = getAllVersionNames;
/** Possible versions that can be automatically migrated by `ng update`. */
// tslint:disable-next-line:prefer-const-enum
var TargetVersion;
(function (TargetVersion) {
    TargetVersion["V18"] = "version 18";
})(TargetVersion || (exports.TargetVersion = TargetVersion = {}));
/**
 * Returns all versions that are supported by "ng update". The versions are determined
 * based on the "TargetVersion" enum.
 */
function getAllVersionNames() {
    return Object.keys(TargetVersion).filter(enumValue => {
        return typeof TargetVersion[enumValue] === 'string';
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LXZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBYUgsZ0RBSUM7QUFmRCwyRUFBMkU7QUFFM0UsNkNBQTZDO0FBQzdDLElBQVksYUFFWDtBQUZELFdBQVksYUFBYTtJQUN2QixtQ0FBa0IsQ0FBQTtBQUNwQixDQUFDLEVBRlcsYUFBYSw2QkFBYixhQUFhLFFBRXhCO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0Isa0JBQWtCO0lBQ2hDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDbkQsT0FBTyxPQUFRLGFBQW9ELENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUSxDQUFDO0lBQzlGLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogUG9zc2libGUgdmVyc2lvbnMgdGhhdCBjYW4gYmUgYXV0b21hdGljYWxseSBtaWdyYXRlZCBieSBgbmcgdXBkYXRlYC4gKi9cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnByZWZlci1jb25zdC1lbnVtXG5leHBvcnQgZW51bSBUYXJnZXRWZXJzaW9uIHtcbiAgVjE4ID0gJ3ZlcnNpb24gMTgnLFxufVxuXG4vKipcbiAqIFJldHVybnMgYWxsIHZlcnNpb25zIHRoYXQgYXJlIHN1cHBvcnRlZCBieSBcIm5nIHVwZGF0ZVwiLiBUaGUgdmVyc2lvbnMgYXJlIGRldGVybWluZWRcbiAqIGJhc2VkIG9uIHRoZSBcIlRhcmdldFZlcnNpb25cIiBlbnVtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsVmVyc2lvbk5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKFRhcmdldFZlcnNpb24pLmZpbHRlcihlbnVtVmFsdWUgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgKFRhcmdldFZlcnNpb24gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkPilbZW51bVZhbHVlXSA9PT0gJ3N0cmluZyc7XG4gIH0pO1xufVxuIl19