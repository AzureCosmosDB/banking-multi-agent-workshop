/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Input, Output, NgZone, InjectionToken, Inject, Optional, } from '@angular/core';
import { Clipboard } from './clipboard';
import * as i0 from "@angular/core";
import * as i1 from "./clipboard";
/** Injection token that can be used to provide the default options to `CdkCopyToClipboard`. */
export const CDK_COPY_TO_CLIPBOARD_CONFIG = new InjectionToken('CDK_COPY_TO_CLIPBOARD_CONFIG');
/**
 * Provides behavior for a button that when clicked copies content into user's
 * clipboard.
 */
export class CdkCopyToClipboard {
    constructor(_clipboard, _ngZone, config) {
        this._clipboard = _clipboard;
        this._ngZone = _ngZone;
        /** Content to be copied. */
        this.text = '';
        /**
         * How many times to attempt to copy the text. This may be necessary for longer text, because
         * the browser needs time to fill an intermediate textarea element and copy the content.
         */
        this.attempts = 1;
        /**
         * Emits when some text is copied to the clipboard. The
         * emitted value indicates whether copying was successful.
         */
        this.copied = new EventEmitter();
        /** Copies that are currently being attempted. */
        this._pending = new Set();
        if (config && config.attempts != null) {
            this.attempts = config.attempts;
        }
    }
    /** Copies the current text to the clipboard. */
    copy(attempts = this.attempts) {
        if (attempts > 1) {
            let remainingAttempts = attempts;
            const pending = this._clipboard.beginCopy(this.text);
            this._pending.add(pending);
            const attempt = () => {
                const successful = pending.copy();
                if (!successful && --remainingAttempts && !this._destroyed) {
                    // We use 1 for the timeout since it's more predictable when flushing in unit tests.
                    this._currentTimeout = this._ngZone.runOutsideAngular(() => setTimeout(attempt, 1));
                }
                else {
                    this._currentTimeout = null;
                    this._pending.delete(pending);
                    pending.destroy();
                    this.copied.emit(successful);
                }
            };
            attempt();
        }
        else {
            this.copied.emit(this._clipboard.copy(this.text));
        }
    }
    ngOnDestroy() {
        if (this._currentTimeout) {
            clearTimeout(this._currentTimeout);
        }
        this._pending.forEach(copy => copy.destroy());
        this._pending.clear();
        this._destroyed = true;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkCopyToClipboard, deps: [{ token: i1.Clipboard }, { token: i0.NgZone }, { token: CDK_COPY_TO_CLIPBOARD_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkCopyToClipboard, isStandalone: true, selector: "[cdkCopyToClipboard]", inputs: { text: ["cdkCopyToClipboard", "text"], attempts: ["cdkCopyToClipboardAttempts", "attempts"] }, outputs: { copied: "cdkCopyToClipboardCopied" }, host: { listeners: { "click": "copy()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkCopyToClipboard, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkCopyToClipboard]',
                    host: {
                        '(click)': 'copy()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.Clipboard }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_COPY_TO_CLIPBOARD_CONFIG]
                }] }], propDecorators: { text: [{
                type: Input,
                args: ['cdkCopyToClipboard']
            }], attempts: [{
                type: Input,
                args: ['cdkCopyToClipboardAttempts']
            }], copied: [{
                type: Output,
                args: ['cdkCopyToClipboardCopied']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS10by1jbGlwYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2NsaXBib2FyZC9jb3B5LXRvLWNsaXBib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixjQUFjLEVBQ2QsTUFBTSxFQUNOLFFBQVEsR0FFVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7QUFTdEMsK0ZBQStGO0FBQy9GLE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLElBQUksY0FBYyxDQUM1RCw4QkFBOEIsQ0FDL0IsQ0FBQztBQUVGOzs7R0FHRztBQVFILE1BQU0sT0FBTyxrQkFBa0I7SUF5QjdCLFlBQ1UsVUFBcUIsRUFDckIsT0FBZSxFQUMyQixNQUFpQztRQUYzRSxlQUFVLEdBQVYsVUFBVSxDQUFXO1FBQ3JCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUExQnpCLDRCQUE0QjtRQUNDLFNBQUksR0FBVyxFQUFFLENBQUM7UUFFL0M7OztXQUdHO1FBQ2tDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFMUQ7OztXQUdHO1FBQzBDLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBVyxDQUFDO1FBRWxGLGlEQUFpRDtRQUN6QyxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQWF4QyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNsQyxDQUFDO0lBQ0gsQ0FBQztJQUVELGdEQUFnRDtJQUNoRCxJQUFJLENBQUMsV0FBbUIsSUFBSSxDQUFDLFFBQVE7UUFDbkMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakIsSUFBSSxpQkFBaUIsR0FBRyxRQUFRLENBQUM7WUFDakMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTNCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtnQkFDbkIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzNELG9GQUFvRjtvQkFDcEYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDOUIsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNILENBQUMsQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN6QixZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztxSEFwRVUsa0JBQWtCLGlFQTRCUCw0QkFBNEI7eUdBNUJ2QyxrQkFBa0I7O2tHQUFsQixrQkFBa0I7a0JBUDlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsSUFBSSxFQUFFO3dCQUNKLFNBQVMsRUFBRSxRQUFRO3FCQUNwQjtvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQTZCSSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLDRCQUE0Qjt5Q0ExQnJCLElBQUk7c0JBQWhDLEtBQUs7dUJBQUMsb0JBQW9CO2dCQU1VLFFBQVE7c0JBQTVDLEtBQUs7dUJBQUMsNEJBQTRCO2dCQU1VLE1BQU07c0JBQWxELE1BQU07dUJBQUMsMEJBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBOZ1pvbmUsXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDbGlwYm9hcmR9IGZyb20gJy4vY2xpcGJvYXJkJztcbmltcG9ydCB7UGVuZGluZ0NvcHl9IGZyb20gJy4vcGVuZGluZy1jb3B5JztcblxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgQ2RrQ29weVRvQ2xpcGJvYXJkYC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2RrQ29weVRvQ2xpcGJvYXJkQ29uZmlnIHtcbiAgLyoqIERlZmF1bHQgbnVtYmVyIG9mIGF0dGVtcHRzIHRvIG1ha2Ugd2hlbiBjb3B5aW5nIHRleHQgdG8gdGhlIGNsaXBib2FyZC4gKi9cbiAgYXR0ZW1wdHM/OiBudW1iZXI7XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBwcm92aWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMgdG8gYENka0NvcHlUb0NsaXBib2FyZGAuICovXG5leHBvcnQgY29uc3QgQ0RLX0NPUFlfVE9fQ0xJUEJPQVJEX0NPTkZJRyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxDZGtDb3B5VG9DbGlwYm9hcmRDb25maWc+KFxuICAnQ0RLX0NPUFlfVE9fQ0xJUEJPQVJEX0NPTkZJRycsXG4pO1xuXG4vKipcbiAqIFByb3ZpZGVzIGJlaGF2aW9yIGZvciBhIGJ1dHRvbiB0aGF0IHdoZW4gY2xpY2tlZCBjb3BpZXMgY29udGVudCBpbnRvIHVzZXInc1xuICogY2xpcGJvYXJkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29weVRvQ2xpcGJvYXJkXScsXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdjb3B5KCknLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb3B5VG9DbGlwYm9hcmQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQ29udGVudCB0byBiZSBjb3BpZWQuICovXG4gIEBJbnB1dCgnY2RrQ29weVRvQ2xpcGJvYXJkJykgdGV4dDogc3RyaW5nID0gJyc7XG5cbiAgLyoqXG4gICAqIEhvdyBtYW55IHRpbWVzIHRvIGF0dGVtcHQgdG8gY29weSB0aGUgdGV4dC4gVGhpcyBtYXkgYmUgbmVjZXNzYXJ5IGZvciBsb25nZXIgdGV4dCwgYmVjYXVzZVxuICAgKiB0aGUgYnJvd3NlciBuZWVkcyB0aW1lIHRvIGZpbGwgYW4gaW50ZXJtZWRpYXRlIHRleHRhcmVhIGVsZW1lbnQgYW5kIGNvcHkgdGhlIGNvbnRlbnQuXG4gICAqL1xuICBASW5wdXQoJ2Nka0NvcHlUb0NsaXBib2FyZEF0dGVtcHRzJykgYXR0ZW1wdHM6IG51bWJlciA9IDE7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gc29tZSB0ZXh0IGlzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLiBUaGVcbiAgICogZW1pdHRlZCB2YWx1ZSBpbmRpY2F0ZXMgd2hldGhlciBjb3B5aW5nIHdhcyBzdWNjZXNzZnVsLlxuICAgKi9cbiAgQE91dHB1dCgnY2RrQ29weVRvQ2xpcGJvYXJkQ29waWVkJykgcmVhZG9ubHkgY29waWVkID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIC8qKiBDb3BpZXMgdGhhdCBhcmUgY3VycmVudGx5IGJlaW5nIGF0dGVtcHRlZC4gKi9cbiAgcHJpdmF0ZSBfcGVuZGluZyA9IG5ldyBTZXQ8UGVuZGluZ0NvcHk+KCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRpcmVjdGl2ZSBoYXMgYmVlbiBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3llZDogYm9vbGVhbjtcblxuICAvKiogVGltZW91dCBmb3IgdGhlIGN1cnJlbnQgY29weSBhdHRlbXB0LiAqL1xuICBwcml2YXRlIF9jdXJyZW50VGltZW91dDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NsaXBib2FyZDogQ2xpcGJvYXJkLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX0NPUFlfVE9fQ0xJUEJPQVJEX0NPTkZJRykgY29uZmlnPzogQ2RrQ29weVRvQ2xpcGJvYXJkQ29uZmlnLFxuICApIHtcbiAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5hdHRlbXB0cyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmF0dGVtcHRzID0gY29uZmlnLmF0dGVtcHRzO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDb3BpZXMgdGhlIGN1cnJlbnQgdGV4dCB0byB0aGUgY2xpcGJvYXJkLiAqL1xuICBjb3B5KGF0dGVtcHRzOiBudW1iZXIgPSB0aGlzLmF0dGVtcHRzKTogdm9pZCB7XG4gICAgaWYgKGF0dGVtcHRzID4gMSkge1xuICAgICAgbGV0IHJlbWFpbmluZ0F0dGVtcHRzID0gYXR0ZW1wdHM7XG4gICAgICBjb25zdCBwZW5kaW5nID0gdGhpcy5fY2xpcGJvYXJkLmJlZ2luQ29weSh0aGlzLnRleHQpO1xuICAgICAgdGhpcy5fcGVuZGluZy5hZGQocGVuZGluZyk7XG5cbiAgICAgIGNvbnN0IGF0dGVtcHQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NmdWwgPSBwZW5kaW5nLmNvcHkoKTtcbiAgICAgICAgaWYgKCFzdWNjZXNzZnVsICYmIC0tcmVtYWluaW5nQXR0ZW1wdHMgJiYgIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgIC8vIFdlIHVzZSAxIGZvciB0aGUgdGltZW91dCBzaW5jZSBpdCdzIG1vcmUgcHJlZGljdGFibGUgd2hlbiBmbHVzaGluZyBpbiB1bml0IHRlc3RzLlxuICAgICAgICAgIHRoaXMuX2N1cnJlbnRUaW1lb3V0ID0gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHNldFRpbWVvdXQoYXR0ZW1wdCwgMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nLmRlbGV0ZShwZW5kaW5nKTtcbiAgICAgICAgICBwZW5kaW5nLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzLmNvcGllZC5lbWl0KHN1Y2Nlc3NmdWwpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgYXR0ZW1wdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvcGllZC5lbWl0KHRoaXMuX2NsaXBib2FyZC5jb3B5KHRoaXMudGV4dCkpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50VGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2N1cnJlbnRUaW1lb3V0KTtcbiAgICB9XG5cbiAgICB0aGlzLl9wZW5kaW5nLmZvckVhY2goY29weSA9PiBjb3B5LmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fcGVuZGluZy5jbGVhcigpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gIH1cbn1cbiJdfQ==