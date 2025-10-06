"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeChunks = optimizeChunks;
const node_assert_1 = __importDefault(require("node:assert"));
const rollup_1 = require("rollup");
const bundler_context_1 = require("../../tools/esbuild/bundler-context");
const utils_1 = require("../../tools/esbuild/utils");
const error_1 = require("../../utils/error");
async function optimizeChunks(original, sourcemap) {
    // Failed builds cannot be optimized
    if (original.errors) {
        return original;
    }
    // Find the main browser entrypoint
    let mainFile;
    for (const [file, record] of original.initialFiles) {
        if (record.name === 'main' &&
            record.entrypoint &&
            !record.serverFile &&
            record.type === 'script') {
            mainFile = file;
            break;
        }
    }
    // No action required if no browser main entrypoint
    if (!mainFile) {
        return original;
    }
    const chunks = {};
    const maps = {};
    for (const originalFile of original.outputFiles) {
        if (originalFile.type !== bundler_context_1.BuildOutputFileType.Browser) {
            continue;
        }
        if (originalFile.path.endsWith('.js')) {
            chunks[originalFile.path] = originalFile;
        }
        else if (originalFile.path.endsWith('.js.map')) {
            // Create mapping of JS file to sourcemap content
            maps[originalFile.path.slice(0, -4)] = originalFile;
        }
    }
    const usedChunks = new Set();
    let bundle;
    let optimizedOutput;
    try {
        bundle = await (0, rollup_1.rollup)({
            input: mainFile,
            plugins: [
                {
                    name: 'angular-bundle',
                    resolveId(source) {
                        // Remove leading `./` if present
                        const file = source[0] === '.' && source[1] === '/' ? source.slice(2) : source;
                        if (chunks[file]) {
                            return file;
                        }
                        // All other identifiers are considered external to maintain behavior
                        return { id: source, external: true };
                    },
                    load(id) {
                        (0, node_assert_1.default)(chunks[id], `Angular chunk content should always be present in chunk optimizer [${id}].`);
                        usedChunks.add(id);
                        const result = {
                            code: chunks[id].text,
                            map: maps[id]?.text,
                        };
                        return result;
                    },
                },
            ],
        });
        const result = await bundle.generate({
            compact: true,
            sourcemap,
            chunkFileNames: (chunkInfo) => `${chunkInfo.name.replace(/-[a-zA-Z0-9]{8}$/, '')}-[hash].js`,
        });
        optimizedOutput = result.output;
    }
    catch (e) {
        (0, error_1.assertIsError)(e);
        return {
            errors: [
                // Most of these fields are not actually needed for printing the error
                {
                    id: '',
                    text: 'Chunk optimization failed',
                    detail: undefined,
                    pluginName: '',
                    location: null,
                    notes: [
                        {
                            text: e.message,
                            location: null,
                        },
                    ],
                },
            ],
            warnings: original.warnings,
        };
    }
    finally {
        await bundle?.close();
    }
    // Remove used chunks and associated sourcemaps from the original result
    original.outputFiles = original.outputFiles.filter((file) => !usedChunks.has(file.path) &&
        !(file.path.endsWith('.map') && usedChunks.has(file.path.slice(0, -4))));
    // Add new optimized chunks
    const importsPerFile = {};
    for (const optimizedFile of optimizedOutput) {
        if (optimizedFile.type !== 'chunk') {
            continue;
        }
        importsPerFile[optimizedFile.fileName] = optimizedFile.imports;
        original.outputFiles.push((0, utils_1.createOutputFile)(optimizedFile.fileName, optimizedFile.code, bundler_context_1.BuildOutputFileType.Browser));
        if (optimizedFile.map && optimizedFile.sourcemapFileName) {
            original.outputFiles.push((0, utils_1.createOutputFile)(optimizedFile.sourcemapFileName, optimizedFile.map.toString(), bundler_context_1.BuildOutputFileType.Browser));
        }
    }
    // Update initial files to reflect optimized chunks
    const entriesToAnalyze = [];
    for (const usedFile of usedChunks) {
        // Leave the main file since its information did not change
        if (usedFile === mainFile) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            entriesToAnalyze.push([mainFile, original.initialFiles.get(mainFile)]);
            continue;
        }
        // Remove all other used chunks
        original.initialFiles.delete(usedFile);
    }
    // Analyze for transitive initial files
    let currentEntry;
    while ((currentEntry = entriesToAnalyze.pop())) {
        const [entryPath, entryRecord] = currentEntry;
        for (const importPath of importsPerFile[entryPath]) {
            const existingRecord = original.initialFiles.get(importPath);
            if (existingRecord) {
                // Store the smallest value depth
                if (existingRecord.depth > entryRecord.depth + 1) {
                    existingRecord.depth = entryRecord.depth + 1;
                }
                continue;
            }
            const record = {
                type: 'script',
                entrypoint: false,
                external: false,
                serverFile: false,
                depth: entryRecord.depth + 1,
            };
            entriesToAnalyze.push([importPath, record]);
        }
    }
    return original;
}
