"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssTokensMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const literal_1 = require("../typescript/literal");
const upgrade_data_1 = require("../upgrade-data");
/** Characters that can be part of a valid token name. */
const TOKEN_CHARACTER = /[-_a-z0-9]/i;
/**
 * Migration that walks through every string literal, template and stylesheet in
 * order to migrate outdated CSS tokens to their new name.
 */
class CssTokensMigration extends migration_1.Migration {
    /** Change data that upgrades to the specified target version. */
    data = (0, upgrade_data_1.getVersionUpgradeData)(this, 'cssTokens');
    // Only enable the migration rule if there is upgrade data.
    enabled = this.data.length !== 0;
    visitNode(node) {
        if (ts.isStringLiteralLike(node)) {
            this._visitStringLiteralLike(node);
        }
    }
    visitTemplate(template) {
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.html) {
                return;
            }
            (0, literal_1.findAllSubstringIndices)(template.content, data.replace)
                .map(offset => template.start + offset)
                // Filter out matches that are followed by a valid token character, so that we don't match
                // partial token names.
                .filter(start => !TOKEN_CHARACTER.test(template.content[start + data.replace.length] || ''))
                .forEach(start => this._replaceSelector(template.filePath, start, data));
        });
    }
    visitStylesheet(stylesheet) {
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.stylesheet) {
                return;
            }
            (0, literal_1.findAllSubstringIndices)(stylesheet.content, data.replace)
                .map(offset => stylesheet.start + offset)
                // Filter out matches that are followed by a valid token character, so that we don't match
                // partial token names.
                .filter(start => !TOKEN_CHARACTER.test(stylesheet.content[start + data.replace.length] || ''))
                .forEach(start => this._replaceSelector(stylesheet.filePath, start, data));
        });
    }
    _visitStringLiteralLike(node) {
        const textContent = node.getText();
        const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.tsStringLiterals) {
                return;
            }
            (0, literal_1.findAllSubstringIndices)(textContent, data.replace)
                .map(offset => node.getStart() + offset)
                // Filter out matches that are followed by a valid token character, so that we don't match
                // partial token names.
                .filter(start => !TOKEN_CHARACTER.test(textContent[start + data.replace.length] || ''))
                .forEach(start => this._replaceSelector(filePath, start, data));
        });
    }
    _replaceSelector(filePath, start, data) {
        this.fileSystem
            .edit(filePath)
            .remove(start, data.replace.length)
            .insertRight(start, data.replaceWith);
    }
}
exports.CssTokensMigration = CssTokensMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLXRva2Vucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9jc3MtdG9rZW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUFpQztBQUdqQywyREFBc0Q7QUFFdEQsbURBQThEO0FBQzlELGtEQUFtRTtBQUVuRSx5REFBeUQ7QUFDekQsTUFBTSxlQUFlLEdBQUcsYUFBYSxDQUFDO0FBRXRDOzs7R0FHRztBQUNILE1BQWEsa0JBQW1CLFNBQVEscUJBQXNCO0lBQzVELGlFQUFpRTtJQUNqRSxJQUFJLEdBQTBCLElBQUEsb0NBQXFCLEVBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRXZFLDJEQUEyRDtJQUMzRCxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBRXhCLFNBQVMsQ0FBQyxJQUFhO1FBQzlCLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0lBRVEsYUFBYSxDQUFDLFFBQTBCO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBQSxpQ0FBdUIsRUFBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7aUJBQ3BELEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO2dCQUN2QywwRkFBMEY7Z0JBQzFGLHVCQUF1QjtpQkFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQzNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVRLGVBQWUsQ0FBQyxVQUE0QjtRQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNqRCxPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUEsaUNBQXVCLEVBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUN0RCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztnQkFDekMsMEZBQTBGO2dCQUMxRix1QkFBdUI7aUJBQ3RCLE1BQU0sQ0FDTCxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUN0RjtpQkFDQSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxJQUEwQjtRQUN4RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXhFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDdkQsT0FBTztZQUNULENBQUM7WUFFRCxJQUFBLGlDQUF1QixFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUMvQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUN4QywwRkFBMEY7Z0JBQzFGLHVCQUF1QjtpQkFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDdEYsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxRQUF1QixFQUFFLEtBQWEsRUFBRSxJQUF5QjtRQUN4RixJQUFJLENBQUMsVUFBVTthQUNaLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDZCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQ2xDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDRjtBQXJFRCxnREFxRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1Jlc29sdmVkUmVzb3VyY2V9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL2NvbXBvbmVudC1yZXNvdXJjZS1jb2xsZWN0b3InO1xuaW1wb3J0IHtXb3Jrc3BhY2VQYXRofSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9maWxlLXN5c3RlbSc7XG5pbXBvcnQge01pZ3JhdGlvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvbWlncmF0aW9uJztcbmltcG9ydCB7Q3NzVG9rZW5VcGdyYWRlRGF0YX0gZnJvbSAnLi4vZGF0YS9jc3MtdG9rZW5zJztcbmltcG9ydCB7ZmluZEFsbFN1YnN0cmluZ0luZGljZXN9IGZyb20gJy4uL3R5cGVzY3JpcHQvbGl0ZXJhbCc7XG5pbXBvcnQge2dldFZlcnNpb25VcGdyYWRlRGF0YSwgVXBncmFkZURhdGF9IGZyb20gJy4uL3VwZ3JhZGUtZGF0YSc7XG5cbi8qKiBDaGFyYWN0ZXJzIHRoYXQgY2FuIGJlIHBhcnQgb2YgYSB2YWxpZCB0b2tlbiBuYW1lLiAqL1xuY29uc3QgVE9LRU5fQ0hBUkFDVEVSID0gL1stX2EtejAtOV0vaTtcblxuLyoqXG4gKiBNaWdyYXRpb24gdGhhdCB3YWxrcyB0aHJvdWdoIGV2ZXJ5IHN0cmluZyBsaXRlcmFsLCB0ZW1wbGF0ZSBhbmQgc3R5bGVzaGVldCBpblxuICogb3JkZXIgdG8gbWlncmF0ZSBvdXRkYXRlZCBDU1MgdG9rZW5zIHRvIHRoZWlyIG5ldyBuYW1lLlxuICovXG5leHBvcnQgY2xhc3MgQ3NzVG9rZW5zTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPFVwZ3JhZGVEYXRhPiB7XG4gIC8qKiBDaGFuZ2UgZGF0YSB0aGF0IHVwZ3JhZGVzIHRvIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IHZlcnNpb24uICovXG4gIGRhdGE6IENzc1Rva2VuVXBncmFkZURhdGFbXSA9IGdldFZlcnNpb25VcGdyYWRlRGF0YSh0aGlzLCAnY3NzVG9rZW5zJyk7XG5cbiAgLy8gT25seSBlbmFibGUgdGhlIG1pZ3JhdGlvbiBydWxlIGlmIHRoZXJlIGlzIHVwZ3JhZGUgZGF0YS5cbiAgZW5hYmxlZCA9IHRoaXMuZGF0YS5sZW5ndGggIT09IDA7XG5cbiAgb3ZlcnJpZGUgdmlzaXROb2RlKG5vZGU6IHRzLk5vZGUpOiB2b2lkIHtcbiAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsTGlrZShub2RlKSkge1xuICAgICAgdGhpcy5fdmlzaXRTdHJpbmdMaXRlcmFsTGlrZShub2RlKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBSZXNvbHZlZFJlc291cmNlKTogdm9pZCB7XG4gICAgdGhpcy5kYXRhLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZXBsYWNlSW4gJiYgIWRhdGEucmVwbGFjZUluLmh0bWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmaW5kQWxsU3Vic3RyaW5nSW5kaWNlcyh0ZW1wbGF0ZS5jb250ZW50LCBkYXRhLnJlcGxhY2UpXG4gICAgICAgIC5tYXAob2Zmc2V0ID0+IHRlbXBsYXRlLnN0YXJ0ICsgb2Zmc2V0KVxuICAgICAgICAvLyBGaWx0ZXIgb3V0IG1hdGNoZXMgdGhhdCBhcmUgZm9sbG93ZWQgYnkgYSB2YWxpZCB0b2tlbiBjaGFyYWN0ZXIsIHNvIHRoYXQgd2UgZG9uJ3QgbWF0Y2hcbiAgICAgICAgLy8gcGFydGlhbCB0b2tlbiBuYW1lcy5cbiAgICAgICAgLmZpbHRlcihzdGFydCA9PiAhVE9LRU5fQ0hBUkFDVEVSLnRlc3QodGVtcGxhdGUuY29udGVudFtzdGFydCArIGRhdGEucmVwbGFjZS5sZW5ndGhdIHx8ICcnKSlcbiAgICAgICAgLmZvckVhY2goc3RhcnQgPT4gdGhpcy5fcmVwbGFjZVNlbGVjdG9yKHRlbXBsYXRlLmZpbGVQYXRoLCBzdGFydCwgZGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRTdHlsZXNoZWV0KHN0eWxlc2hlZXQ6IFJlc29sdmVkUmVzb3VyY2UpOiB2b2lkIHtcbiAgICB0aGlzLmRhdGEuZm9yRWFjaChkYXRhID0+IHtcbiAgICAgIGlmIChkYXRhLnJlcGxhY2VJbiAmJiAhZGF0YS5yZXBsYWNlSW4uc3R5bGVzaGVldCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZpbmRBbGxTdWJzdHJpbmdJbmRpY2VzKHN0eWxlc2hlZXQuY29udGVudCwgZGF0YS5yZXBsYWNlKVxuICAgICAgICAubWFwKG9mZnNldCA9PiBzdHlsZXNoZWV0LnN0YXJ0ICsgb2Zmc2V0KVxuICAgICAgICAvLyBGaWx0ZXIgb3V0IG1hdGNoZXMgdGhhdCBhcmUgZm9sbG93ZWQgYnkgYSB2YWxpZCB0b2tlbiBjaGFyYWN0ZXIsIHNvIHRoYXQgd2UgZG9uJ3QgbWF0Y2hcbiAgICAgICAgLy8gcGFydGlhbCB0b2tlbiBuYW1lcy5cbiAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICBzdGFydCA9PiAhVE9LRU5fQ0hBUkFDVEVSLnRlc3Qoc3R5bGVzaGVldC5jb250ZW50W3N0YXJ0ICsgZGF0YS5yZXBsYWNlLmxlbmd0aF0gfHwgJycpLFxuICAgICAgICApXG4gICAgICAgIC5mb3JFYWNoKHN0YXJ0ID0+IHRoaXMuX3JlcGxhY2VTZWxlY3RvcihzdHlsZXNoZWV0LmZpbGVQYXRoLCBzdGFydCwgZGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRTdHJpbmdMaXRlcmFsTGlrZShub2RlOiB0cy5TdHJpbmdMaXRlcmFsTGlrZSkge1xuICAgIGNvbnN0IHRleHRDb250ZW50ID0gbm9kZS5nZXRUZXh0KCk7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLmZpbGVTeXN0ZW0ucmVzb2x2ZShub2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaChkYXRhID0+IHtcbiAgICAgIGlmIChkYXRhLnJlcGxhY2VJbiAmJiAhZGF0YS5yZXBsYWNlSW4udHNTdHJpbmdMaXRlcmFscykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZpbmRBbGxTdWJzdHJpbmdJbmRpY2VzKHRleHRDb250ZW50LCBkYXRhLnJlcGxhY2UpXG4gICAgICAgIC5tYXAob2Zmc2V0ID0+IG5vZGUuZ2V0U3RhcnQoKSArIG9mZnNldClcbiAgICAgICAgLy8gRmlsdGVyIG91dCBtYXRjaGVzIHRoYXQgYXJlIGZvbGxvd2VkIGJ5IGEgdmFsaWQgdG9rZW4gY2hhcmFjdGVyLCBzbyB0aGF0IHdlIGRvbid0IG1hdGNoXG4gICAgICAgIC8vIHBhcnRpYWwgdG9rZW4gbmFtZXMuXG4gICAgICAgIC5maWx0ZXIoc3RhcnQgPT4gIVRPS0VOX0NIQVJBQ1RFUi50ZXN0KHRleHRDb250ZW50W3N0YXJ0ICsgZGF0YS5yZXBsYWNlLmxlbmd0aF0gfHwgJycpKVxuICAgICAgICAuZm9yRWFjaChzdGFydCA9PiB0aGlzLl9yZXBsYWNlU2VsZWN0b3IoZmlsZVBhdGgsIHN0YXJ0LCBkYXRhKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXBsYWNlU2VsZWN0b3IoZmlsZVBhdGg6IFdvcmtzcGFjZVBhdGgsIHN0YXJ0OiBudW1iZXIsIGRhdGE6IENzc1Rva2VuVXBncmFkZURhdGEpIHtcbiAgICB0aGlzLmZpbGVTeXN0ZW1cbiAgICAgIC5lZGl0KGZpbGVQYXRoKVxuICAgICAgLnJlbW92ZShzdGFydCwgZGF0YS5yZXBsYWNlLmxlbmd0aClcbiAgICAgIC5pbnNlcnRSaWdodChzdGFydCwgZGF0YS5yZXBsYWNlV2l0aCk7XG4gIH1cbn1cbiJdfQ==