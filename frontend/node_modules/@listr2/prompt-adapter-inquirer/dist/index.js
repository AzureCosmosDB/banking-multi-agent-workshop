var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/prompt.ts
import { ListrPromptAdapter, ListrTaskEventType, ListrTaskState } from "listr2";
var ListrInquirerPromptAdapter = class extends ListrPromptAdapter {
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
    context.output ??= this.wrapper.stdout(ListrTaskEventType.PROMPT);
    this.reportStarted();
    this.task.on(ListrTaskEventType.STATE, (event) => {
      if (event === ListrTaskState.SKIPPED && this.prompt) {
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
export {
  ListrInquirerPromptAdapter
};
