"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ListrInquirerPromptAdapter: () => ListrInquirerPromptAdapter
});
module.exports = __toCommonJS(src_exports);

// src/prompt.ts
var import_listr2 = require("listr2");
var ListrInquirerPromptAdapter = class extends import_listr2.ListrPromptAdapter {
  static {
    __name(this, "ListrInquirerPromptAdapter");
  }
  prompt;
  /**
   * Get the current running instance of `inquirer`.
   */
  get instance() {
    return this.prompt;
  }
  /**
   * Create a new prompt with `inquirer`.
   */
  async run(prompt, ...[config, context]) {
    context ??= {};
    context.output ??= this.wrapper.stdout(import_listr2.ListrTaskEventType.PROMPT);
    this.reportStarted();
    this.task.on(import_listr2.ListrTaskEventType.STATE, (event) => {
      if (event === import_listr2.ListrTaskState.SKIPPED && this.prompt) {
        this.cancel();
      }
    });
    this.prompt = prompt(config, context);
    let result;
    try {
      result = await this.prompt;
      this.reportCompleted();
    } catch (e) {
      this.reportFailed();
      throw e;
    }
    return result;
  }
  /**
   * Cancel the ongoing prompt.
   */
  cancel() {
    if (!this.prompt) {
      return;
    }
    this.reportFailed();
    this.prompt.cancel();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ListrInquirerPromptAdapter
});
