/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A pending copy-to-clipboard operation.
 *
 * The implementation of copying text to the clipboard modifies the DOM and
 * forces a re-layout. This re-layout can take too long if the string is large,
 * causing the execCommand('copy') to happen too long after the user clicked.
 * This results in the browser refusing to copy. This object lets the
 * re-layout happen in a separate tick from copying by providing a copy function
 * that can be called later.
 *
 * Destroy must be called when no longer in use, regardless of whether `copy` is
 * called.
 */
export class PendingCopy {
    constructor(text, _document) {
        this._document = _document;
        const textarea = (this._textarea = this._document.createElement('textarea'));
        const styles = textarea.style;
        // Hide the element for display and accessibility. Set a fixed position so the page layout
        // isn't affected. We use `fixed` with `top: 0`, because focus is moved into the textarea
        // for a split second and if it's off-screen, some browsers will attempt to scroll it into view.
        styles.position = 'fixed';
        styles.top = styles.opacity = '0';
        styles.left = '-999em';
        textarea.setAttribute('aria-hidden', 'true');
        textarea.value = text;
        // Making the textarea `readonly` prevents the screen from jumping on iOS Safari (see #25169).
        textarea.readOnly = true;
        // The element needs to be inserted into the fullscreen container, if the page
        // is in fullscreen mode, otherwise the browser won't execute the copy command.
        (this._document.fullscreenElement || this._document.body).appendChild(textarea);
    }
    /** Finishes copying the text. */
    copy() {
        const textarea = this._textarea;
        let successful = false;
        try {
            // Older browsers could throw if copy is not supported.
            if (textarea) {
                const currentFocus = this._document.activeElement;
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                successful = this._document.execCommand('copy');
                if (currentFocus) {
                    currentFocus.focus();
                }
            }
        }
        catch {
            // Discard error.
            // Initial setting of {@code successful} will represent failure here.
        }
        return successful;
    }
    /** Cleans up DOM changes used to perform the copy operation. */
    destroy() {
        const textarea = this._textarea;
        if (textarea) {
            textarea.remove();
            this._textarea = undefined;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy1jb3B5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jbGlwYm9hcmQvcGVuZGluZy1jb3B5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBR3RCLFlBQ0UsSUFBWSxFQUNLLFNBQW1CO1FBQW5CLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFFcEMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDN0UsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUU5QiwwRkFBMEY7UUFDMUYseUZBQXlGO1FBQ3pGLGdHQUFnRztRQUNoRyxNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLFFBQVEsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLDhGQUE4RjtRQUM5RixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUN6Qiw4RUFBOEU7UUFDOUUsK0VBQStFO1FBQy9FLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLElBQUk7UUFDRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLENBQUM7WUFDSCx1REFBdUQ7WUFDdkQsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDYixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQXdDLENBQUM7Z0JBRTdFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWhELElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ2pCLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsaUJBQWlCO1lBQ2pCLHFFQUFxRTtRQUN2RSxDQUFDO1FBRUQsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxPQUFPO1FBQ0wsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUVoQyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzdCLENBQUM7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIHBlbmRpbmcgY29weS10by1jbGlwYm9hcmQgb3BlcmF0aW9uLlxuICpcbiAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBjb3B5aW5nIHRleHQgdG8gdGhlIGNsaXBib2FyZCBtb2RpZmllcyB0aGUgRE9NIGFuZFxuICogZm9yY2VzIGEgcmUtbGF5b3V0LiBUaGlzIHJlLWxheW91dCBjYW4gdGFrZSB0b28gbG9uZyBpZiB0aGUgc3RyaW5nIGlzIGxhcmdlLFxuICogY2F1c2luZyB0aGUgZXhlY0NvbW1hbmQoJ2NvcHknKSB0byBoYXBwZW4gdG9vIGxvbmcgYWZ0ZXIgdGhlIHVzZXIgY2xpY2tlZC5cbiAqIFRoaXMgcmVzdWx0cyBpbiB0aGUgYnJvd3NlciByZWZ1c2luZyB0byBjb3B5LiBUaGlzIG9iamVjdCBsZXRzIHRoZVxuICogcmUtbGF5b3V0IGhhcHBlbiBpbiBhIHNlcGFyYXRlIHRpY2sgZnJvbSBjb3B5aW5nIGJ5IHByb3ZpZGluZyBhIGNvcHkgZnVuY3Rpb25cbiAqIHRoYXQgY2FuIGJlIGNhbGxlZCBsYXRlci5cbiAqXG4gKiBEZXN0cm95IG11c3QgYmUgY2FsbGVkIHdoZW4gbm8gbG9uZ2VyIGluIHVzZSwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIGBjb3B5YCBpc1xuICogY2FsbGVkLlxuICovXG5leHBvcnQgY2xhc3MgUGVuZGluZ0NvcHkge1xuICBwcml2YXRlIF90ZXh0YXJlYTogSFRNTFRleHRBcmVhRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50LFxuICApIHtcbiAgICBjb25zdCB0ZXh0YXJlYSA9ICh0aGlzLl90ZXh0YXJlYSA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJykpO1xuICAgIGNvbnN0IHN0eWxlcyA9IHRleHRhcmVhLnN0eWxlO1xuXG4gICAgLy8gSGlkZSB0aGUgZWxlbWVudCBmb3IgZGlzcGxheSBhbmQgYWNjZXNzaWJpbGl0eS4gU2V0IGEgZml4ZWQgcG9zaXRpb24gc28gdGhlIHBhZ2UgbGF5b3V0XG4gICAgLy8gaXNuJ3QgYWZmZWN0ZWQuIFdlIHVzZSBgZml4ZWRgIHdpdGggYHRvcDogMGAsIGJlY2F1c2UgZm9jdXMgaXMgbW92ZWQgaW50byB0aGUgdGV4dGFyZWFcbiAgICAvLyBmb3IgYSBzcGxpdCBzZWNvbmQgYW5kIGlmIGl0J3Mgb2ZmLXNjcmVlbiwgc29tZSBicm93c2VycyB3aWxsIGF0dGVtcHQgdG8gc2Nyb2xsIGl0IGludG8gdmlldy5cbiAgICBzdHlsZXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIHN0eWxlcy50b3AgPSBzdHlsZXMub3BhY2l0eSA9ICcwJztcbiAgICBzdHlsZXMubGVmdCA9ICctOTk5ZW0nO1xuICAgIHRleHRhcmVhLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIHRleHRhcmVhLnZhbHVlID0gdGV4dDtcbiAgICAvLyBNYWtpbmcgdGhlIHRleHRhcmVhIGByZWFkb25seWAgcHJldmVudHMgdGhlIHNjcmVlbiBmcm9tIGp1bXBpbmcgb24gaU9TIFNhZmFyaSAoc2VlICMyNTE2OSkuXG4gICAgdGV4dGFyZWEucmVhZE9ubHkgPSB0cnVlO1xuICAgIC8vIFRoZSBlbGVtZW50IG5lZWRzIHRvIGJlIGluc2VydGVkIGludG8gdGhlIGZ1bGxzY3JlZW4gY29udGFpbmVyLCBpZiB0aGUgcGFnZVxuICAgIC8vIGlzIGluIGZ1bGxzY3JlZW4gbW9kZSwgb3RoZXJ3aXNlIHRoZSBicm93c2VyIHdvbid0IGV4ZWN1dGUgdGhlIGNvcHkgY29tbWFuZC5cbiAgICAodGhpcy5fZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgdGhpcy5fZG9jdW1lbnQuYm9keSkuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuICB9XG5cbiAgLyoqIEZpbmlzaGVzIGNvcHlpbmcgdGhlIHRleHQuICovXG4gIGNvcHkoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdGV4dGFyZWEgPSB0aGlzLl90ZXh0YXJlYTtcbiAgICBsZXQgc3VjY2Vzc2Z1bCA9IGZhbHNlO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIE9sZGVyIGJyb3dzZXJzIGNvdWxkIHRocm93IGlmIGNvcHkgaXMgbm90IHN1cHBvcnRlZC5cbiAgICAgIGlmICh0ZXh0YXJlYSkge1xuICAgICAgICBjb25zdCBjdXJyZW50Rm9jdXMgPSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxPclNWR0VsZW1lbnQgfCBudWxsO1xuXG4gICAgICAgIHRleHRhcmVhLnNlbGVjdCgpO1xuICAgICAgICB0ZXh0YXJlYS5zZXRTZWxlY3Rpb25SYW5nZSgwLCB0ZXh0YXJlYS52YWx1ZS5sZW5ndGgpO1xuICAgICAgICBzdWNjZXNzZnVsID0gdGhpcy5fZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcblxuICAgICAgICBpZiAoY3VycmVudEZvY3VzKSB7XG4gICAgICAgICAgY3VycmVudEZvY3VzLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIERpc2NhcmQgZXJyb3IuXG4gICAgICAvLyBJbml0aWFsIHNldHRpbmcgb2Yge0Bjb2RlIHN1Y2Nlc3NmdWx9IHdpbGwgcmVwcmVzZW50IGZhaWx1cmUgaGVyZS5cbiAgICB9XG5cbiAgICByZXR1cm4gc3VjY2Vzc2Z1bDtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgRE9NIGNoYW5nZXMgdXNlZCB0byBwZXJmb3JtIHRoZSBjb3B5IG9wZXJhdGlvbi4gKi9cbiAgZGVzdHJveSgpIHtcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHRoaXMuX3RleHRhcmVhO1xuXG4gICAgaWYgKHRleHRhcmVhKSB7XG4gICAgICB0ZXh0YXJlYS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuX3RleHRhcmVhID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIl19