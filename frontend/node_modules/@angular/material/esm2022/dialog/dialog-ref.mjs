/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { merge, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
export var MatDialogState;
(function (MatDialogState) {
    MatDialogState[MatDialogState["OPEN"] = 0] = "OPEN";
    MatDialogState[MatDialogState["CLOSING"] = 1] = "CLOSING";
    MatDialogState[MatDialogState["CLOSED"] = 2] = "CLOSED";
})(MatDialogState || (MatDialogState = {}));
/**
 * Reference to a dialog opened via the MatDialog service.
 */
export class MatDialogRef {
    constructor(_ref, config, _containerInstance) {
        this._ref = _ref;
        this._containerInstance = _containerInstance;
        /** Subject for notifying the user that the dialog has finished opening. */
        this._afterOpened = new Subject();
        /** Subject for notifying the user that the dialog has started closing. */
        this._beforeClosed = new Subject();
        /** Current state of the dialog. */
        this._state = MatDialogState.OPEN;
        this.disableClose = config.disableClose;
        this.id = _ref.id;
        // Used to target panels specifically tied to dialogs.
        _ref.addPanelClass('mat-mdc-dialog-panel');
        // Emit when opening animation completes
        _containerInstance._animationStateChanged
            .pipe(filter(event => event.state === 'opened'), take(1))
            .subscribe(() => {
            this._afterOpened.next();
            this._afterOpened.complete();
        });
        // Dispose overlay when closing animation is complete
        _containerInstance._animationStateChanged
            .pipe(filter(event => event.state === 'closed'), take(1))
            .subscribe(() => {
            clearTimeout(this._closeFallbackTimeout);
            this._finishDialogClose();
        });
        _ref.overlayRef.detachments().subscribe(() => {
            this._beforeClosed.next(this._result);
            this._beforeClosed.complete();
            this._finishDialogClose();
        });
        merge(this.backdropClick(), this.keydownEvents().pipe(filter(event => event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)))).subscribe(event => {
            if (!this.disableClose) {
                event.preventDefault();
                _closeDialogVia(this, event.type === 'keydown' ? 'keyboard' : 'mouse');
            }
        });
    }
    /**
     * Close the dialog.
     * @param dialogResult Optional result to return to the dialog opener.
     */
    close(dialogResult) {
        this._result = dialogResult;
        // Transition the backdrop in parallel to the dialog.
        this._containerInstance._animationStateChanged
            .pipe(filter(event => event.state === 'closing'), take(1))
            .subscribe(event => {
            this._beforeClosed.next(dialogResult);
            this._beforeClosed.complete();
            this._ref.overlayRef.detachBackdrop();
            // The logic that disposes of the overlay depends on the exit animation completing, however
            // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
            // timeout which will clean everything up if the animation hasn't fired within the specified
            // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
            // vast majority of cases the timeout will have been cleared before it has the chance to fire.
            this._closeFallbackTimeout = setTimeout(() => this._finishDialogClose(), event.totalTime + 100);
        });
        this._state = MatDialogState.CLOSING;
        this._containerInstance._startExitAnimation();
    }
    /**
     * Gets an observable that is notified when the dialog is finished opening.
     */
    afterOpened() {
        return this._afterOpened;
    }
    /**
     * Gets an observable that is notified when the dialog is finished closing.
     */
    afterClosed() {
        return this._ref.closed;
    }
    /**
     * Gets an observable that is notified when the dialog has started closing.
     */
    beforeClosed() {
        return this._beforeClosed;
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick() {
        return this._ref.backdropClick;
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._ref.keydownEvents;
    }
    /**
     * Updates the dialog's position.
     * @param position New dialog position.
     */
    updatePosition(position) {
        let strategy = this._ref.config.positionStrategy;
        if (position && (position.left || position.right)) {
            position.left ? strategy.left(position.left) : strategy.right(position.right);
        }
        else {
            strategy.centerHorizontally();
        }
        if (position && (position.top || position.bottom)) {
            position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
        }
        else {
            strategy.centerVertically();
        }
        this._ref.updatePosition();
        return this;
    }
    /**
     * Updates the dialog's width and height.
     * @param width New width of the dialog.
     * @param height New height of the dialog.
     */
    updateSize(width = '', height = '') {
        this._ref.updateSize(width, height);
        return this;
    }
    /** Add a CSS class or an array of classes to the overlay pane. */
    addPanelClass(classes) {
        this._ref.addPanelClass(classes);
        return this;
    }
    /** Remove a CSS class or an array of classes from the overlay pane. */
    removePanelClass(classes) {
        this._ref.removePanelClass(classes);
        return this;
    }
    /** Gets the current state of the dialog's lifecycle. */
    getState() {
        return this._state;
    }
    /**
     * Finishes the dialog close by updating the state of the dialog
     * and disposing the overlay.
     */
    _finishDialogClose() {
        this._state = MatDialogState.CLOSED;
        this._ref.close(this._result, { focusOrigin: this._closeInteractionType });
        this.componentInstance = null;
    }
}
/**
 * Closes the dialog with the specified interaction type. This is currently not part of
 * `MatDialogRef` as that would conflict with custom dialog ref mocks provided in tests.
 * More details. See: https://github.com/angular/components/pull/9257#issuecomment-651342226.
 */
// TODO: Move this back into `MatDialogRef` when we provide an official mock dialog ref.
export function _closeDialogVia(ref, interactionType, result) {
    ref._closeInteractionType = interactionType;
    return ref.close(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsS0FBSyxFQUFjLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUloRCxPQUFPLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFJN0QsTUFBTSxDQUFOLElBQVksY0FJWDtBQUpELFdBQVksY0FBYztJQUN4QixtREFBSSxDQUFBO0lBQ0oseURBQU8sQ0FBQTtJQUNQLHVEQUFNLENBQUE7QUFDUixDQUFDLEVBSlcsY0FBYyxLQUFkLGNBQWMsUUFJekI7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBc0N2QixZQUNVLElBQXFCLEVBQzdCLE1BQXVCLEVBQ2hCLGtCQUFzQztRQUZyQyxTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUV0Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBekIvQywyRUFBMkU7UUFDMUQsaUJBQVksR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRXBELDBFQUEwRTtRQUN6RCxrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFpQixDQUFDO1FBUTlELG1DQUFtQztRQUMzQixXQUFNLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQztRQWNuQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDeEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBRWxCLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFM0Msd0NBQXdDO1FBQ3hDLGtCQUFrQixDQUFD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Q0FDRjtBQUVEOzs7O0dBSUc7QUFDSCx3RkFBd0Y7QUFDeEYsTUFBTSxVQUFVLGVBQWUsQ0FBSSxHQUFvQixFQUFFLGVBQTRCLEVBQUUsTUFBVTtJQUM5RixHQUF1RCxDQUFDLHFCQUFxQixHQUFHLGVBQWUsQ0FBQztJQUNqRyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogUG9zc2libGUgc3RhdGVzIG9mIHRoZSBsaWZlY3ljbGUgb2YgYSBkaWFsb2cuICovXG5pbXBvcnQge0ZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge21lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7RGlhbG9nUmVmfSBmcm9tICdAYW5ndWxhci9jZGsvZGlhbG9nJztcbmltcG9ydCB7RGlhbG9nUG9zaXRpb24sIE1hdERpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcbmltcG9ydCB7TWF0RGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuaW1wb3J0IHtmaWx0ZXIsIHRha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RVNDQVBFLCBoYXNNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7R2xvYmFsUG9zaXRpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDb21wb25lbnRSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgZW51bSBNYXREaWFsb2dTdGF0ZSB7XG4gIE9QRU4sXG4gIENMT1NJTkcsXG4gIENMT1NFRCxcbn1cblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gYSBkaWFsb2cgb3BlbmVkIHZpYSB0aGUgTWF0RGlhbG9nIHNlcnZpY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXREaWFsb2dSZWY8VCwgUiA9IGFueT4ge1xuICAvKiogVGhlIGluc3RhbmNlIG9mIGNvbXBvbmVudCBvcGVuZWQgaW50byB0aGUgZGlhbG9nLiAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogVDtcblxuICAvKipcbiAgICogYENvbXBvbmVudFJlZmAgb2YgdGhlIGNvbXBvbmVudCBvcGVuZWQgaW50byB0aGUgZGlhbG9nLiBXaWxsIGJlXG4gICAqIG51bGwgd2hlbiB0aGUgZGlhbG9nIGlzIG9wZW5lZCB1c2luZyBhIGBUZW1wbGF0ZVJlZmAuXG4gICAqL1xuICByZWFkb25seSBjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxUPiB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgaXMgYWxsb3dlZCB0byBjbG9zZSB0aGUgZGlhbG9nLiAqL1xuICBkaXNhYmxlQ2xvc2U6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFVuaXF1ZSBJRCBmb3IgdGhlIGRpYWxvZy4gKi9cbiAgaWQ6IHN0cmluZztcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoZSB1c2VyIHRoYXQgdGhlIGRpYWxvZyBoYXMgZmluaXNoZWQgb3BlbmluZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfYWZ0ZXJPcGVuZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhlIHVzZXIgdGhhdCB0aGUgZGlhbG9nIGhhcyBzdGFydGVkIGNsb3NpbmcuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2JlZm9yZUNsb3NlZCA9IG5ldyBTdWJqZWN0PFIgfCB1bmRlZmluZWQ+KCk7XG5cbiAgLyoqIFJlc3VsdCB0byBiZSBwYXNzZWQgdG8gYWZ0ZXJDbG9zZWQuICovXG4gIHByaXZhdGUgX3Jlc3VsdDogUiB8IHVuZGVmaW5lZDtcblxuICAvKiogSGFuZGxlIHRvIHRoZSB0aW1lb3V0IHRoYXQncyBydW5uaW5nIGFzIGEgZmFsbGJhY2sgaW4gY2FzZSB0aGUgZXhpdCBhbmltYXRpb24gZG9lc24ndCBmaXJlLiAqL1xuICBwcml2YXRlIF9jbG9zZUZhbGxiYWNrVGltZW91dDogbnVtYmVyO1xuXG4gIC8qKiBDdXJyZW50IHN0YXRlIG9mIHRoZSBkaWFsb2cuICovXG4gIHByaXZhdGUgX3N0YXRlID0gTWF0RGlhbG9nU3RhdGUuT1BFTjtcblxuICAvLyBUT0RPKGNyaXNiZXRvKTogd2Ugc2hvdWxkbid0IGhhdmUgdG8gZGVjbGFyZSB0aGlzIHByb3BlcnR5LCBiZWNhdXNlIGBEaWFsb2dSZWYuY2xvc2VgXG4gIC8vIGFscmVhZHkgaGFzIGEgc2Vjb25kIGBvcHRpb25zYCBwYXJhbWV0ZXIgdGhhdCB3ZSBjYW4gdXNlLiBUaGUgcHJvYmxlbSBpcyB0aGF0IGludGVybmFsIHRlc3RzXG4gIC8vIGhhdmUgYXNzZXJ0aW9ucyBsaWtlIGBleHBlY3QoTWF0RGlhbG9nUmVmLmNsb3NlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChmb28pYCB3aGljaCB3aWxsIGJyZWFrLFxuICAvLyBiZWNhdXNlIGl0J2xsIGJlIGNhbGxlZCB3aXRoIHR3byBhcmd1bWVudHMgYnkgdGhpbmdzIGxpa2UgYE1hdERpYWxvZ0Nsb3NlYC5cbiAgLyoqIEludGVyYWN0aW9uIHRoYXQgY2F1c2VkIHRoZSBkaWFsb2cgdG8gY2xvc2UuICovXG4gIHByaXZhdGUgX2Nsb3NlSW50ZXJhY3Rpb25UeXBlOiBGb2N1c09yaWdpbiB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9yZWY6IERpYWxvZ1JlZjxSLCBUPixcbiAgICBjb25maWc6IE1hdERpYWxvZ0NvbmZpZyxcbiAgICBwdWJsaWMgX2NvbnRhaW5lckluc3RhbmNlOiBNYXREaWFsb2dDb250YWluZXIsXG4gICkge1xuICAgIHRoaXMuZGlzYWJsZUNsb3NlID0gY29uZmlnLmRpc2FibGVDbG9zZTtcbiAgICB0aGlzLmlkID0gX3JlZi5pZDtcblxuICAgIC8vIFVzZWQgdG8gdGFyZ2V0IHBhbmVscyBzcGVjaWZpY2FsbHkgdGllZCB0byBkaWFsb2dzLlxuICAgIF9yZWYuYWRkUGFuZWxDbGFzcygnbWF0LW1kYy1kaWFsb2ctcGFuZWwnKTtcblxuICAgIC8vIEVtaXQgd2hlbiBvcGVuaW5nIGFuaW1hdGlvbiBjb21wbGV0ZXNcbiAgICBfY29udGFpbmVySW5zdGFuY2UuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5zdGF0ZSA9PT0gJ29wZW5lZCcpLFxuICAgICAgICB0YWtlKDEpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLm5leHQoKTtcbiAgICAgICAgdGhpcy5fYWZ0ZXJPcGVuZWQuY29tcGxldGUoKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gRGlzcG9zZSBvdmVybGF5IHdoZW4gY2xvc2luZyBhbmltYXRpb24gaXMgY29tcGxldGVcbiAgICBfY29udGFpbmVySW5zdGFuY2UuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5zdGF0ZSA9PT0gJ2Nsb3NlZCcpLFxuICAgICAgICB0YWtlKDEpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9jbG9zZUZhbGxiYWNrVGltZW91dCk7XG4gICAgICAgIHRoaXMuX2ZpbmlzaERpYWxvZ0Nsb3NlKCk7XG4gICAgICB9KTtcblxuICAgIF9yZWYub3ZlcmxheVJlZi5kZXRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9iZWZvcmVDbG9zZWQubmV4dCh0aGlzLl9yZXN1bHQpO1xuICAgICAgdGhpcy5fYmVmb3JlQ2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLl9maW5pc2hEaWFsb2dDbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgbWVyZ2UoXG4gICAgICB0aGlzLmJhY2tkcm9wQ2xpY2soKSxcbiAgICAgIHRoaXMua2V5ZG93bkV2ZW50cygpLnBpcGUoXG4gICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5rZXlDb2RlID09PSBFU0NBUEUgJiYgIXRoaXMuZGlzYWJsZUNsb3NlICYmICFoYXNNb2RpZmllcktleShldmVudCkpLFxuICAgICAgKSxcbiAgICApLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZUNsb3NlKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF9jbG9zZURpYWxvZ1ZpYSh0aGlzLCBldmVudC50eXBlID09PSAna2V5ZG93bicgPyAna2V5Ym9hcmQnIDogJ21vdXNlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIGRpYWxvZ1Jlc3VsdCBPcHRpb25hbCByZXN1bHQgdG8gcmV0dXJuIHRvIHRoZSBkaWFsb2cgb3BlbmVyLlxuICAgKi9cbiAgY2xvc2UoZGlhbG9nUmVzdWx0PzogUik6IHZvaWQge1xuICAgIHRoaXMuX3Jlc3VsdCA9IGRpYWxvZ1Jlc3VsdDtcblxuICAgIC8vIFRyYW5zaXRpb24gdGhlIGJhY2tkcm9wIGluIHBhcmFsbGVsIHRvIHRoZSBkaWFsb2cuXG4gICAgdGhpcy5fY29udGFpbmVySW5zdGFuY2UuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5zdGF0ZSA9PT0gJ2Nsb3NpbmcnKSxcbiAgICAgICAgdGFrZSgxKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLl9iZWZvcmVDbG9zZWQubmV4dChkaWFsb2dSZXN1bHQpO1xuICAgICAgICB0aGlzLl9iZWZvcmVDbG9zZWQuY29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5fcmVmLm92ZXJsYXlSZWYuZGV0YWNoQmFja2Ryb3AoKTtcblxuICAgICAgICAvLyBUaGUgbG9naWMgdGhhdCBkaXNwb3NlcyBvZiB0aGUgb3ZlcmxheSBkZXBlbmRzIG9uIHRoZSBleGl0IGFuaW1hdGlvbiBjb21wbGV0aW5nLCBob3dldmVyXG4gICAgICAgIC8vIGl0IGlzbid0IGd1YXJhbnRlZWQgaWYgdGhlIHBhcmVudCB2aWV3IGlzIGRlc3Ryb3llZCB3aGlsZSBpdCdzIHJ1bm5pbmcuIEFkZCBhIGZhbGxiYWNrXG4gICAgICAgIC8vIHRpbWVvdXQgd2hpY2ggd2lsbCBjbGVhbiBldmVyeXRoaW5nIHVwIGlmIHRoZSBhbmltYXRpb24gaGFzbid0IGZpcmVkIHdpdGhpbiB0aGUgc3BlY2lmaWVkXG4gICAgICAgIC8vIGFtb3VudCBvZiB0aW1lIHBsdXMgMTAwbXMuIFdlIGRvbid0IG5lZWQgdG8gcnVuIHRoaXMgb3V0c2lkZSB0aGUgTmdab25lLCBiZWNhdXNlIGZvciB0aGVcbiAgICAgICAgLy8gdmFzdCBtYWpvcml0eSBvZiBjYXNlcyB0aGUgdGltZW91dCB3aWxsIGhhdmUgYmVlbiBjbGVhcmVkIGJlZm9yZSBpdCBoYXMgdGhlIGNoYW5jZSB0byBmaXJlLlxuICAgICAgICB0aGlzLl9jbG9zZUZhbGxiYWNrVGltZW91dCA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgKCkgPT4gdGhpcy5fZmluaXNoRGlhbG9nQ2xvc2UoKSxcbiAgICAgICAgICBldmVudC50b3RhbFRpbWUgKyAxMDAsXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX3N0YXRlID0gTWF0RGlhbG9nU3RhdGUuQ0xPU0lORztcbiAgICB0aGlzLl9jb250YWluZXJJbnN0YW5jZS5fc3RhcnRFeGl0QW5pbWF0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgZGlhbG9nIGlzIGZpbmlzaGVkIG9wZW5pbmcuXG4gICAqL1xuICBhZnRlck9wZW5lZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYWZ0ZXJPcGVuZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgZGlhbG9nIGlzIGZpbmlzaGVkIGNsb3NpbmcuXG4gICAqL1xuICBhZnRlckNsb3NlZCgpOiBPYnNlcnZhYmxlPFIgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVmLmNsb3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBkaWFsb2cgaGFzIHN0YXJ0ZWQgY2xvc2luZy5cbiAgICovXG4gIGJlZm9yZUNsb3NlZCgpOiBPYnNlcnZhYmxlPFIgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fYmVmb3JlQ2xvc2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gdGhlIG92ZXJsYXkncyBiYWNrZHJvcCBoYXMgYmVlbiBjbGlja2VkLlxuICAgKi9cbiAgYmFja2Ryb3BDbGljaygpOiBPYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVmLmJhY2tkcm9wQ2xpY2s7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBrZXlkb3duIGV2ZW50cyBhcmUgdGFyZ2V0ZWQgb24gdGhlIG92ZXJsYXkuXG4gICAqL1xuICBrZXlkb3duRXZlbnRzKCk6IE9ic2VydmFibGU8S2V5Ym9hcmRFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9yZWYua2V5ZG93bkV2ZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWFsb2cncyBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIE5ldyBkaWFsb2cgcG9zaXRpb24uXG4gICAqL1xuICB1cGRhdGVQb3NpdGlvbihwb3NpdGlvbj86IERpYWxvZ1Bvc2l0aW9uKTogdGhpcyB7XG4gICAgbGV0IHN0cmF0ZWd5ID0gdGhpcy5fcmVmLmNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5IGFzIEdsb2JhbFBvc2l0aW9uU3RyYXRlZ3k7XG5cbiAgICBpZiAocG9zaXRpb24gJiYgKHBvc2l0aW9uLmxlZnQgfHwgcG9zaXRpb24ucmlnaHQpKSB7XG4gICAgICBwb3NpdGlvbi5sZWZ0ID8gc3RyYXRlZ3kubGVmdChwb3NpdGlvbi5sZWZ0KSA6IHN0cmF0ZWd5LnJpZ2h0KHBvc2l0aW9uLnJpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyYXRlZ3kuY2VudGVySG9yaXpvbnRhbGx5KCk7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uICYmIChwb3NpdGlvbi50b3AgfHwgcG9zaXRpb24uYm90dG9tKSkge1xuICAgICAgcG9zaXRpb24udG9wID8gc3RyYXRlZ3kudG9wKHBvc2l0aW9uLnRvcCkgOiBzdHJhdGVneS5ib3R0b20ocG9zaXRpb24uYm90dG9tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyYXRlZ3kuY2VudGVyVmVydGljYWxseSgpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlZi51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlhbG9nJ3Mgd2lkdGggYW5kIGhlaWdodC5cbiAgICogQHBhcmFtIHdpZHRoIE5ldyB3aWR0aCBvZiB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0gaGVpZ2h0IE5ldyBoZWlnaHQgb2YgdGhlIGRpYWxvZy5cbiAgICovXG4gIHVwZGF0ZVNpemUod2lkdGg6IHN0cmluZyA9ICcnLCBoZWlnaHQ6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5fcmVmLnVwZGF0ZVNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogQWRkIGEgQ1NTIGNsYXNzIG9yIGFuIGFycmF5IG9mIGNsYXNzZXMgdG8gdGhlIG92ZXJsYXkgcGFuZS4gKi9cbiAgYWRkUGFuZWxDbGFzcyhjbGFzc2VzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IHRoaXMge1xuICAgIHRoaXMuX3JlZi5hZGRQYW5lbENsYXNzKGNsYXNzZXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIFJlbW92ZSBhIENTUyBjbGFzcyBvciBhbiBhcnJheSBvZiBjbGFzc2VzIGZyb20gdGhlIG92ZXJsYXkgcGFuZS4gKi9cbiAgcmVtb3ZlUGFuZWxDbGFzcyhjbGFzc2VzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IHRoaXMge1xuICAgIHRoaXMuX3JlZi5yZW1vdmVQYW5lbENsYXNzKGNsYXNzZXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGRpYWxvZydzIGxpZmVjeWNsZS4gKi9cbiAgZ2V0U3RhdGUoKTogTWF0RGlhbG9nU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5pc2hlcyB0aGUgZGlhbG9nIGNsb3NlIGJ5IHVwZGF0aW5nIHRoZSBzdGF0ZSBvZiB0aGUgZGlhbG9nXG4gICAqIGFuZCBkaXNwb3NpbmcgdGhlIG92ZXJsYXkuXG4gICAqL1xuICBwcml2YXRlIF9maW5pc2hEaWFsb2dDbG9zZSgpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IE1hdERpYWxvZ1N0YXRlLkNMT1NFRDtcbiAgICB0aGlzLl9yZWYuY2xvc2UodGhpcy5fcmVzdWx0LCB7Zm9jdXNPcmlnaW46IHRoaXMuX2Nsb3NlSW50ZXJhY3Rpb25UeXBlfSk7XG4gICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZSA9IG51bGwhO1xuICB9XG59XG5cbi8qKlxuICogQ2xvc2VzIHRoZSBkaWFsb2cgd2l0aCB0aGUgc3BlY2lmaWVkIGludGVyYWN0aW9uIHR5cGUuIFRoaXMgaXMgY3VycmVudGx5IG5vdCBwYXJ0IG9mXG4gKiBgTWF0RGlhbG9nUmVmYCBhcyB0aGF0IHdvdWxkIGNvbmZsaWN0IHdpdGggY3VzdG9tIGRpYWxvZyByZWYgbW9ja3MgcHJvdmlkZWQgaW4gdGVzdHMuXG4gKiBNb3JlIGRldGFpbHMuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzkyNTcjaXNzdWVjb21tZW50LTY1MTM0MjIyNi5cbiAqL1xuLy8gVE9ETzogTW92ZSB0aGlzIGJhY2sgaW50byBgTWF0RGlhbG9nUmVmYCB3aGVuIHdlIHByb3ZpZGUgYW4gb2ZmaWNpYWwgbW9jayBkaWFsb2cgcmVmLlxuZXhwb3J0IGZ1bmN0aW9uIF9jbG9zZURpYWxvZ1ZpYTxSPihyZWY6IE1hdERpYWxvZ1JlZjxSPiwgaW50ZXJhY3Rpb25UeXBlOiBGb2N1c09yaWdpbiwgcmVzdWx0PzogUikge1xuICAocmVmIGFzIHVua25vd24gYXMge19jbG9zZUludGVyYWN0aW9uVHlwZTogRm9jdXNPcmlnaW59KS5fY2xvc2VJbnRlcmFjdGlvblR5cGUgPSBpbnRlcmFjdGlvblR5cGU7XG4gIHJldHVybiByZWYuY2xvc2UocmVzdWx0KTtcbn1cbiJdfQ==