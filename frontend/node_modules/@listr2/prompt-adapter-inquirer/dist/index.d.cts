import { CancelablePromise, Prompt } from '@inquirer/type';
import { ListrPromptAdapter } from 'listr2';

declare class ListrInquirerPromptAdapter extends ListrPromptAdapter {
    private prompt;
    /**
     * Get the current running instance of `inquirer`.
     */
    get instance(): CancelablePromise<any>;
    /**
     * Create a new prompt with `inquirer`.
     */
    run<T extends Prompt<any, any> = Prompt<any, any>>(prompt: T, ...[config, context]: Parameters<T>): Promise<ReturnType<T>>;
    /**
     * Cancel the ongoing prompt.
     */
    cancel(): void;
}

export { ListrInquirerPromptAdapter };
