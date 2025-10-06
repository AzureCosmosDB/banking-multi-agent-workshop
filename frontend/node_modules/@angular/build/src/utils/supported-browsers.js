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
exports.getSupportedBrowsers = getSupportedBrowsers;
const browserslist_1 = __importDefault(require("browserslist"));
function getSupportedBrowsers(projectRoot, logger) {
    browserslist_1.default.defaults = [
        'last 2 Chrome versions',
        'last 1 Firefox version',
        'last 2 Edge major versions',
        'last 2 Safari major versions',
        'last 2 iOS major versions',
        'last 2 Android major versions',
        'Firefox ESR',
    ];
    // Get browsers from config or default.
    const browsersFromConfigOrDefault = new Set((0, browserslist_1.default)(undefined, { path: projectRoot }));
    // Get browsers that support ES6 modules.
    const browsersThatSupportEs6 = new Set((0, browserslist_1.default)('supports es6-module'));
    const unsupportedBrowsers = [];
    for (const browser of browsersFromConfigOrDefault) {
        if (!browsersThatSupportEs6.has(browser)) {
            browsersFromConfigOrDefault.delete(browser);
            unsupportedBrowsers.push(browser);
        }
    }
    if (unsupportedBrowsers.length) {
        logger.warn(`One or more browsers which are configured in the project's Browserslist configuration ` +
            'will be ignored as ES5 output is not supported by the Angular CLI.\n' +
            `Ignored browsers: ${unsupportedBrowsers.join(', ')}`);
    }
    return Array.from(browsersFromConfigOrDefault);
}
