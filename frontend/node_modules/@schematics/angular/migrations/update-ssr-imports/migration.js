"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const ts = __importStar(require("../../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const dependencies_1 = require("../../utility/dependencies");
function* visit(directory) {
    for (const path of directory.subfiles) {
        if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
            const entry = directory.file(path);
            if (entry) {
                const content = entry.content;
                if (content.includes('CommonEngine') && !content.includes('@angular/ssr/node')) {
                    const source = ts.createSourceFile(entry.path, content.toString().replace(/^\uFEFF/, ''), ts.ScriptTarget.Latest, true);
                    yield source;
                }
            }
        }
    }
    for (const path of directory.subdirs) {
        if (path === 'node_modules' || path.startsWith('.')) {
            continue;
        }
        yield* visit(directory.dir(path));
    }
}
/**
 * Schematics rule that identifies and updates import declarations in TypeScript files.
 * Specifically, it modifies imports of '@angular/ssr' by appending '/node' if the
 * `CommonEngine` is used from the old entry point.
 *
 */
function default_1() {
    return (tree) => {
        if (!(0, dependencies_1.getPackageJsonDependency)(tree, '@angular/ssr')) {
            return;
        }
        for (const sourceFile of visit(tree.root)) {
            let recorder;
            const allImportDeclarations = sourceFile.statements.filter((n) => ts.isImportDeclaration(n));
            if (allImportDeclarations.length === 0) {
                continue;
            }
            const ssrImports = allImportDeclarations.filter((n) => ts.isStringLiteral(n.moduleSpecifier) && n.moduleSpecifier.text === '@angular/ssr');
            for (const ssrImport of ssrImports) {
                const ssrNamedBinding = getNamedImports(ssrImport);
                if (ssrNamedBinding) {
                    const isUsingOldEntryPoint = ssrNamedBinding.elements.some((e) => e.name.text.startsWith('CommonEngine'));
                    if (!isUsingOldEntryPoint) {
                        continue;
                    }
                    recorder ??= tree.beginUpdate(sourceFile.fileName);
                    recorder.insertRight(ssrImport.moduleSpecifier.getEnd() - 1, '/node');
                }
            }
            if (recorder) {
                tree.commitUpdate(recorder);
            }
        }
    };
}
function getNamedImports(importDeclaration) {
    const namedBindings = importDeclaration?.importClause?.namedBindings;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
        return namedBindings;
    }
    return undefined;
}
