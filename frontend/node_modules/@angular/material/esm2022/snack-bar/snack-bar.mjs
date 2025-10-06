/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf, TemplateRef, } from '@angular/core';
import { SimpleSnackBar } from './simple-snack-bar';
import { MatSnackBarContainer } from './snack-bar-container';
import { MAT_SNACK_BAR_DATA, MatSnackBarConfig } from './snack-bar-config';
import { MatSnackBarRef } from './snack-bar-ref';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { takeUntil } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/a11y";
import * as i3 from "@angular/cdk/layout";
import * as i4 from "./snack-bar-config";
/** @docs-private */
export function MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY() {
    return new MatSnackBarConfig();
}
/** Injection token that can be used to specify default snack bar. */
export const MAT_SNACK_BAR_DEFAULT_OPTIONS = new InjectionToken('mat-snack-bar-default-options', {
    providedIn: 'root',
    factory: MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY,
});
/**
 * Service to dispatch Material Design snack bar messages.
 */
export class MatSnackBar {
    /** Reference to the currently opened snackbar at *any* level. */
    get _openedSnackBarRef() {
        const parent = this._parentSnackBar;
        return parent ? parent._openedSnackBarRef : this._snackBarRefAtThisLevel;
    }
    set _openedSnackBarRef(value) {
        if (this._parentSnackBar) {
            this._parentSnackBar._openedSnackBarRef = value;
        }
        else {
            this._snackBarRefAtThisLevel = value;
        }
    }
    constructor(_overlay, _live, _injector, _breakpointObserver, _parentSnackBar, _defaultConfig) {
        this._overlay = _overlay;
        this._live = _live;
        this._injector = _injector;
        this._breakpointObserver = _breakpointObserver;
        this._parentSnackBar = _parentSnackBar;
        this._defaultConfig = _defaultConfig;
        /**
         * Reference to the current snack bar in the view *at this level* (in the Angular injector tree).
         * If there is a parent snack-bar service, all operations should delegate to that parent
         * via `_openedSnackBarRef`.
         */
        this._snackBarRefAtThisLevel = null;
        /** The component that should be rendered as the snack bar's simple component. */
        this.simpleSnackBarComponent = SimpleSnackBar;
        /** The container component that attaches the provided template or component. */
        this.snackBarContainerComponent = MatSnackBarContainer;
        /** The CSS class to apply for handset mode. */
        this.handsetCssClass = 'mat-mdc-snack-bar-handset';
    }
    /**
     * Creates and dispatches a snack bar with a custom component for the content, removing any
     * currently opened snack bars.
     *
     * @param component Component to be instantiated.
     * @param config Extra configuration for the snack bar.
     */
    openFromComponent(component, config) {
        return this._attach(component, config);
    }
    /**
     * Creates and dispatches a snack bar with a custom template for the content, removing any
     * currently opened snack bars.
     *
     * @param template Template to be instantiated.
     * @param config Extra configuration for the snack bar.
     */
    openFromTemplate(template, config) {
        return this._attach(template, config);
    }
    /**
     * Opens a snackbar with a message and an optional action.
     * @param message The message to show in the snackbar.
     * @param action The label for the snackbar action.
     * @param config Additional configuration options for the snackbar.
     */
    open(message, action = '', config) {
        const _config = { ...this._defaultConfig, ...config };
        // Since the user doesn't have access to the component, we can
        // override the data to pass in our own message and action.
        _config.data = { message, action };
        // Since the snack bar has `role="alert"`, we don't
        // want to announce the same message twice.
        if (_config.announcementMessage === message) {
            _config.announcementMessage = undefined;
        }
        return this.openFromComponent(this.simpleSnackBarComponent, _config);
    }
    /**
     * Dismisses the currently-visible snack bar.
     */
    dismiss() {
        if (this._openedSnackBarRef) {
            this._openedSnackBarRef.dismiss();
        }
    }
    ngOnDestroy() {
        // Only dismiss the snack bar at the current level on destroy.
        if (this._snackBarRefAtThisLevel) {
            this._snackBarRefAtThisLevel.dismiss();
        }
    }
    /**
     * Attaches the snack bar container component to the overlay.
     */
    _attachSnackBarContainer(overlayRef, config) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        const injector = Injector.create({
            parent: userInjector || this._injector,
            providers: [{ provide: MatSnackBarConfig, useValue: config }],
        });
        const containerPortal = new ComponentPortal(this.snackBarContainerComponent, config.viewContainerRef, injector);
        const containerRef = overlayRef.attach(containerPortal);
        containerRef.instance.snackBarConfig = config;
        return containerRef.instance;
    }
    /**
     * Places a new component or a template as the content of the snack bar container.
     */
    _attach(content, userConfig) {
        const config = { ...new MatSnackBarConfig(), ...this._defaultConfig, ...userConfig };
        const overlayRef = this._createOverlay(config);
        const container = this._attachSnackBarContainer(overlayRef, config);
        const snackBarRef = new MatSnackBarRef(container, overlayRef);
        if (content instanceof TemplateRef) {
            const portal = new TemplatePortal(content, null, {
                $implicit: config.data,
                snackBarRef,
            });
            snackBarRef.instance = container.attachTemplatePortal(portal);
        }
        else {
            const injector = this._createInjector(config, snackBarRef);
            const portal = new ComponentPortal(content, undefined, injector);
            const contentRef = container.attachComponentPortal(portal);
            // We can't pass this via the injector, because the injector is created earlier.
            snackBarRef.instance = contentRef.instance;
        }
        // Subscribe to the breakpoint observer and attach the mat-snack-bar-handset class as
        // appropriate. This class is applied to the overlay element because the overlay must expand to
        // fill the width of the screen for full width snackbars.
        this._breakpointObserver
            .observe(Breakpoints.HandsetPortrait)
            .pipe(takeUntil(overlayRef.detachments()))
            .subscribe(state => {
            overlayRef.overlayElement.classList.toggle(this.handsetCssClass, state.matches);
        });
        if (config.announcementMessage) {
            // Wait until the snack bar contents have been announced then deliver this message.
            container._onAnnounce.subscribe(() => {
                this._live.announce(config.announcementMessage, config.politeness);
            });
        }
        this._animateSnackBar(snackBarRef, config);
        this._openedSnackBarRef = snackBarRef;
        return this._openedSnackBarRef;
    }
    /** Animates the old snack bar out and the new one in. */
    _animateSnackBar(snackBarRef, config) {
        // When the snackbar is dismissed, clear the reference to it.
        snackBarRef.afterDismissed().subscribe(() => {
            // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
            if (this._openedSnackBarRef == snackBarRef) {
                this._openedSnackBarRef = null;
            }
            if (config.announcementMessage) {
                this._live.clear();
            }
        });
        if (this._openedSnackBarRef) {
            // If a snack bar is already in view, dismiss it and enter the
            // new snack bar after exit animation is complete.
            this._openedSnackBarRef.afterDismissed().subscribe(() => {
                snackBarRef.containerInstance.enter();
            });
            this._openedSnackBarRef.dismiss();
        }
        else {
            // If no snack bar is in view, enter the new snack bar.
            snackBarRef.containerInstance.enter();
        }
        // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
        if (config.duration && config.duration > 0) {
            snackBarRef.afterOpened().subscribe(() => snackBarRef._dismissAfter(config.duration));
        }
    }
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified snack bar config.
     */
    _createOverlay(config) {
        const overlayConfig = new OverlayConfig();
        overlayConfig.direction = config.direction;
        let positionStrategy = this._overlay.position().global();
        // Set horizontal position.
        const isRtl = config.direction === 'rtl';
        const isLeft = config.horizontalPosition === 'left' ||
            (config.horizontalPosition === 'start' && !isRtl) ||
            (config.horizontalPosition === 'end' && isRtl);
        const isRight = !isLeft && config.horizontalPosition !== 'center';
        if (isLeft) {
            positionStrategy.left('0');
        }
        else if (isRight) {
            positionStrategy.right('0');
        }
        else {
            positionStrategy.centerHorizontally();
        }
        // Set horizontal position.
        if (config.verticalPosition === 'top') {
            positionStrategy.top('0');
        }
        else {
            positionStrategy.bottom('0');
        }
        overlayConfig.positionStrategy = positionStrategy;
        return this._overlay.create(overlayConfig);
    }
    /**
     * Creates an injector to be used inside of a snack bar component.
     * @param config Config that was used to create the snack bar.
     * @param snackBarRef Reference to the snack bar.
     */
    _createInjector(config, snackBarRef) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        return Injector.create({
            parent: userInjector || this._injector,
            providers: [
                { provide: MatSnackBarRef, useValue: snackBarRef },
                { provide: MAT_SNACK_BAR_DATA, useValue: config.data },
            ],
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBar, deps: [{ token: i1.Overlay }, { token: i2.LiveAnnouncer }, { token: i0.Injector }, { token: i3.BreakpointObserver }, { token: MatSnackBar, optional: true, skipSelf: true }, { token: MAT_SNACK_BAR_DEFAULT_OPTIONS }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBar, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatSnackBar, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i2.LiveAnnouncer }, { type: i0.Injector }, { type: i3.BreakpointObserver }, { type: MatSnackBar, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i4.MatSnackBarConfig, decorators: [{
                    type: Inject,
                    args: [MAT_SNACK_BAR_DEFAULT_OPTIONS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NuYWNrLWJhci9zbmFjay1iYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBQWdCLE9BQU8sRUFBRSxhQUFhLEVBQWEsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RixPQUFPLEVBR0wsTUFBTSxFQUNOLFVBQVUsRUFDVixjQUFjLEVBQ2QsUUFBUSxFQUVSLFFBQVEsRUFDUixRQUFRLEVBQ1IsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQW1CLE1BQU0sb0JBQW9CLENBQUM7QUFDcEUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDekUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7QUFFekMsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSxxQ0FBcUM7SUFDbkQsT0FBTyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFDakMsQ0FBQztBQUVELHFFQUFxRTtBQUNyRSxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLGNBQWMsQ0FDN0QsK0JBQStCLEVBQy9CO0lBQ0UsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLHFDQUFxQztDQUMv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Q0FBQzthQUFNLENBQUM7WUFDTixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELGFBQWEsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUNsRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssZUFBZSxDQUFJLE1BQXlCLEVBQUUsV0FBOEI7UUFDbEYsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO1FBRTNGLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNyQixNQUFNLEVBQUUsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTO1lBQ3RDLFNBQVMsRUFBRTtnQkFDVCxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBQztnQkFDaEQsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUM7YUFDckQ7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO3FIQXhRVSxXQUFXLHdMQXFDWiw2QkFBNkI7eUhBckM1QixXQUFXLGNBREMsTUFBTTs7a0dBQ2xCLFdBQVc7a0JBRHZCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFxQzNCLFFBQVE7OzBCQUFJLFFBQVE7OzBCQUNwQixNQUFNOzJCQUFDLDZCQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpdmVBbm5vdW5jZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7QnJlYWtwb2ludE9ic2VydmVyLCBCcmVha3BvaW50c30gZnJvbSAnQGFuZ3VsYXIvY2RrL2xheW91dCc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGUsIE92ZXJsYXksIE92ZXJsYXlDb25maWcsIE92ZXJsYXlSZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3RvcixcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgU2tpcFNlbGYsXG4gIFRlbXBsYXRlUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U2ltcGxlU25hY2tCYXIsIFRleHRPbmx5U25hY2tCYXJ9IGZyb20gJy4vc2ltcGxlLXNuYWNrLWJhcic7XG5pbXBvcnQge01hdFNuYWNrQmFyQ29udGFpbmVyfSBmcm9tICcuL3NuYWNrLWJhci1jb250YWluZXInO1xuaW1wb3J0IHtNQVRfU05BQ0tfQkFSX0RBVEEsIE1hdFNuYWNrQmFyQ29uZmlnfSBmcm9tICcuL3NuYWNrLWJhci1jb25maWcnO1xuaW1wb3J0IHtNYXRTbmFja0JhclJlZn0gZnJvbSAnLi9zbmFjay1iYXItcmVmJztcbmltcG9ydCB7Q29tcG9uZW50UG9ydGFsLCBUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9TTkFDS19CQVJfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogTWF0U25hY2tCYXJDb25maWcge1xuICByZXR1cm4gbmV3IE1hdFNuYWNrQmFyQ29uZmlnKCk7XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBzcGVjaWZ5IGRlZmF1bHQgc25hY2sgYmFyLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9TTkFDS19CQVJfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPE1hdFNuYWNrQmFyQ29uZmlnPihcbiAgJ21hdC1zbmFjay1iYXItZGVmYXVsdC1vcHRpb25zJyxcbiAge1xuICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICBmYWN0b3J5OiBNQVRfU05BQ0tfQkFSX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZLFxuICB9LFxuKTtcblxuLyoqXG4gKiBTZXJ2aWNlIHRvIGRpc3BhdGNoIE1hdGVyaWFsIERlc2lnbiBzbmFjayBiYXIgbWVzc2FnZXMuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE1hdFNuYWNrQmFyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBzbmFjayBiYXIgaW4gdGhlIHZpZXcgKmF0IHRoaXMgbGV2ZWwqIChpbiB0aGUgQW5ndWxhciBpbmplY3RvciB0cmVlKS5cbiAgICogSWYgdGhlcmUgaXMgYSBwYXJlbnQgc25hY2stYmFyIHNlcnZpY2UsIGFsbCBvcGVyYXRpb25zIHNob3VsZCBkZWxlZ2F0ZSB0byB0aGF0IHBhcmVudFxuICAgKiB2aWEgYF9vcGVuZWRTbmFja0JhclJlZmAuXG4gICAqL1xuICBwcml2YXRlIF9zbmFja0JhclJlZkF0VGhpc0xldmVsOiBNYXRTbmFja0JhclJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb21wb25lbnQgdGhhdCBzaG91bGQgYmUgcmVuZGVyZWQgYXMgdGhlIHNuYWNrIGJhcidzIHNpbXBsZSBjb21wb25lbnQuICovXG4gIHNpbXBsZVNuYWNrQmFyQ29tcG9uZW50ID0gU2ltcGxlU25hY2tCYXI7XG5cbiAgLyoqIFRoZSBjb250YWluZXIgY29tcG9uZW50IHRoYXQgYXR0YWNoZXMgdGhlIHByb3ZpZGVkIHRlbXBsYXRlIG9yIGNvbXBvbmVudC4gKi9cbiAgc25hY2tCYXJDb250YWluZXJDb21wb25lbnQgPSBNYXRTbmFja0JhckNvbnRhaW5lcjtcblxuICAvKiogVGhlIENTUyBjbGFzcyB0byBhcHBseSBmb3IgaGFuZHNldCBtb2RlLiAqL1xuICBoYW5kc2V0Q3NzQ2xhc3MgPSAnbWF0LW1kYy1zbmFjay1iYXItaGFuZHNldCc7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudGx5IG9wZW5lZCBzbmFja2JhciBhdCAqYW55KiBsZXZlbC4gKi9cbiAgZ2V0IF9vcGVuZWRTbmFja0JhclJlZigpOiBNYXRTbmFja0JhclJlZjxhbnk+IHwgbnVsbCB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50U25hY2tCYXI7XG4gICAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5fb3BlbmVkU25hY2tCYXJSZWYgOiB0aGlzLl9zbmFja0JhclJlZkF0VGhpc0xldmVsO1xuICB9XG5cbiAgc2V0IF9vcGVuZWRTbmFja0JhclJlZih2YWx1ZTogTWF0U25hY2tCYXJSZWY8YW55PiB8IG51bGwpIHtcbiAgICBpZiAodGhpcy5fcGFyZW50U25hY2tCYXIpIHtcbiAgICAgIHRoaXMuX3BhcmVudFNuYWNrQmFyLl9vcGVuZWRTbmFja0JhclJlZiA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zbmFja0JhclJlZkF0VGhpc0xldmVsID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcml2YXRlIF9saXZlOiBMaXZlQW5ub3VuY2VyLFxuICAgIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcixcbiAgICBwcml2YXRlIF9icmVha3BvaW50T2JzZXJ2ZXI6IEJyZWFrcG9pbnRPYnNlcnZlcixcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnRTbmFja0JhcjogTWF0U25hY2tCYXIsXG4gICAgQEluamVjdChNQVRfU05BQ0tfQkFSX0RFRkFVTFRfT1BUSU9OUykgcHJpdmF0ZSBfZGVmYXVsdENvbmZpZzogTWF0U25hY2tCYXJDb25maWcsXG4gICkge31cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgZGlzcGF0Y2hlcyBhIHNuYWNrIGJhciB3aXRoIGEgY3VzdG9tIGNvbXBvbmVudCBmb3IgdGhlIGNvbnRlbnQsIHJlbW92aW5nIGFueVxuICAgKiBjdXJyZW50bHkgb3BlbmVkIHNuYWNrIGJhcnMuXG4gICAqXG4gICAqIEBwYXJhbSBjb21wb25lbnQgQ29tcG9uZW50IHRvIGJlIGluc3RhbnRpYXRlZC5cbiAgICogQHBhcmFtIGNvbmZpZyBFeHRyYSBjb25maWd1cmF0aW9uIGZvciB0aGUgc25hY2sgYmFyLlxuICAgKi9cbiAgb3BlbkZyb21Db21wb25lbnQ8VCwgRCA9IGFueT4oXG4gICAgY29tcG9uZW50OiBDb21wb25lbnRUeXBlPFQ+LFxuICAgIGNvbmZpZz86IE1hdFNuYWNrQmFyQ29uZmlnPEQ+LFxuICApOiBNYXRTbmFja0JhclJlZjxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaChjb21wb25lbnQsIGNvbmZpZykgYXMgTWF0U25hY2tCYXJSZWY8VD47XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgZGlzcGF0Y2hlcyBhIHNuYWNrIGJhciB3aXRoIGEgY3VzdG9tIHRlbXBsYXRlIGZvciB0aGUgY29udGVudCwgcmVtb3ZpbmcgYW55XG4gICAqIGN1cnJlbnRseSBvcGVuZWQgc25hY2sgYmFycy5cbiAgICpcbiAgICogQHBhcmFtIHRlbXBsYXRlIFRlbXBsYXRlIHRvIGJlIGluc3RhbnRpYXRlZC5cbiAgICogQHBhcmFtIGNvbmZpZyBFeHRyYSBjb25maWd1cmF0aW9uIGZvciB0aGUgc25hY2sgYmFyLlxuICAgKi9cbiAgb3BlbkZyb21UZW1wbGF0ZShcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PixcbiAgICBjb25maWc/OiBNYXRTbmFja0JhckNvbmZpZyxcbiAgKTogTWF0U25hY2tCYXJSZWY8RW1iZWRkZWRWaWV3UmVmPGFueT4+IHtcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoKHRlbXBsYXRlLCBjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgc25hY2tiYXIgd2l0aCBhIG1lc3NhZ2UgYW5kIGFuIG9wdGlvbmFsIGFjdGlvbi5cbiAgICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgc25hY2tiYXIuXG4gICAqIEBwYXJhbSBhY3Rpb24gVGhlIGxhYmVsIGZvciB0aGUgc25hY2tiYXIgYWN0aW9uLlxuICAgKiBAcGFyYW0gY29uZmlnIEFkZGl0aW9uYWwgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgc25hY2tiYXIuXG4gICAqL1xuICBvcGVuKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBhY3Rpb246IHN0cmluZyA9ICcnLFxuICAgIGNvbmZpZz86IE1hdFNuYWNrQmFyQ29uZmlnLFxuICApOiBNYXRTbmFja0JhclJlZjxUZXh0T25seVNuYWNrQmFyPiB7XG4gICAgY29uc3QgX2NvbmZpZyA9IHsuLi50aGlzLl9kZWZhdWx0Q29uZmlnLCAuLi5jb25maWd9O1xuXG4gICAgLy8gU2luY2UgdGhlIHVzZXIgZG9lc24ndCBoYXZlIGFjY2VzcyB0byB0aGUgY29tcG9uZW50LCB3ZSBjYW5cbiAgICAvLyBvdmVycmlkZSB0aGUgZGF0YSB0byBwYXNzIGluIG91ciBvd24gbWVzc2FnZSBhbmQgYWN0aW9uLlxuICAgIF9jb25maWcuZGF0YSA9IHttZXNzYWdlLCBhY3Rpb259O1xuXG4gICAgLy8gU2luY2UgdGhlIHNuYWNrIGJhciBoYXMgYHJvbGU9XCJhbGVydFwiYCwgd2UgZG9uJ3RcbiAgICAvLyB3YW50IHRvIGFubm91bmNlIHRoZSBzYW1lIG1lc3NhZ2UgdHdpY2UuXG4gICAgaWYgKF9jb25maWcuYW5ub3VuY2VtZW50TWVzc2FnZSA9PT0gbWVzc2FnZSkge1xuICAgICAgX2NvbmZpZy5hbm5vdW5jZW1lbnRNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wZW5Gcm9tQ29tcG9uZW50KHRoaXMuc2ltcGxlU25hY2tCYXJDb21wb25lbnQsIF9jb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgY3VycmVudGx5LXZpc2libGUgc25hY2sgYmFyLlxuICAgKi9cbiAgZGlzbWlzcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb3BlbmVkU25hY2tCYXJSZWYpIHtcbiAgICAgIHRoaXMuX29wZW5lZFNuYWNrQmFyUmVmLmRpc21pc3MoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBPbmx5IGRpc21pc3MgdGhlIHNuYWNrIGJhciBhdCB0aGUgY3VycmVudCBsZXZlbCBvbiBkZXN0cm95LlxuICAgIGlmICh0aGlzLl9zbmFja0JhclJlZkF0VGhpc0xldmVsKSB7XG4gICAgICB0aGlzLl9zbmFja0JhclJlZkF0VGhpc0xldmVsLmRpc21pc3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIHNuYWNrIGJhciBjb250YWluZXIgY29tcG9uZW50IHRvIHRoZSBvdmVybGF5LlxuICAgKi9cbiAgcHJpdmF0ZSBfYXR0YWNoU25hY2tCYXJDb250YWluZXIoXG4gICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICBjb25maWc6IE1hdFNuYWNrQmFyQ29uZmlnLFxuICApOiBNYXRTbmFja0JhckNvbnRhaW5lciB7XG4gICAgY29uc3QgdXNlckluamVjdG9yID0gY29uZmlnICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xuICAgIGNvbnN0IGluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHBhcmVudDogdXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLFxuICAgICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IE1hdFNuYWNrQmFyQ29uZmlnLCB1c2VWYWx1ZTogY29uZmlnfV0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250YWluZXJQb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKFxuICAgICAgdGhpcy5zbmFja0JhckNvbnRhaW5lckNvbXBvbmVudCxcbiAgICAgIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgaW5qZWN0b3IsXG4gICAgKTtcbiAgICBjb25zdCBjb250YWluZXJSZWY6IENvbXBvbmVudFJlZjxNYXRTbmFja0JhckNvbnRhaW5lcj4gPSBvdmVybGF5UmVmLmF0dGFjaChjb250YWluZXJQb3J0YWwpO1xuICAgIGNvbnRhaW5lclJlZi5pbnN0YW5jZS5zbmFja0JhckNvbmZpZyA9IGNvbmZpZztcbiAgICByZXR1cm4gY29udGFpbmVyUmVmLmluc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFBsYWNlcyBhIG5ldyBjb21wb25lbnQgb3IgYSB0ZW1wbGF0ZSBhcyB0aGUgY29udGVudCBvZiB0aGUgc25hY2sgYmFyIGNvbnRhaW5lci5cbiAgICovXG4gIHByaXZhdGUgX2F0dGFjaDxUPihcbiAgICBjb250ZW50OiBDb21wb25lbnRUeXBlPFQ+IHwgVGVtcGxhdGVSZWY8VD4sXG4gICAgdXNlckNvbmZpZz86IE1hdFNuYWNrQmFyQ29uZmlnLFxuICApOiBNYXRTbmFja0JhclJlZjxUIHwgRW1iZWRkZWRWaWV3UmVmPGFueT4+IHtcbiAgICBjb25zdCBjb25maWcgPSB7Li4ubmV3IE1hdFNuYWNrQmFyQ29uZmlnKCksIC4uLnRoaXMuX2RlZmF1bHRDb25maWcsIC4uLnVzZXJDb25maWd9O1xuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5KGNvbmZpZyk7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5fYXR0YWNoU25hY2tCYXJDb250YWluZXIob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCBzbmFja0JhclJlZiA9IG5ldyBNYXRTbmFja0JhclJlZjxUIHwgRW1iZWRkZWRWaWV3UmVmPGFueT4+KGNvbnRhaW5lciwgb3ZlcmxheVJlZik7XG5cbiAgICBpZiAoY29udGVudCBpbnN0YW5jZW9mIFRlbXBsYXRlUmVmKSB7XG4gICAgICBjb25zdCBwb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwoY29udGVudCwgbnVsbCEsIHtcbiAgICAgICAgJGltcGxpY2l0OiBjb25maWcuZGF0YSxcbiAgICAgICAgc25hY2tCYXJSZWYsXG4gICAgICB9IGFzIGFueSk7XG5cbiAgICAgIHNuYWNrQmFyUmVmLmluc3RhbmNlID0gY29udGFpbmVyLmF0dGFjaFRlbXBsYXRlUG9ydGFsKHBvcnRhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5fY3JlYXRlSW5qZWN0b3IoY29uZmlnLCBzbmFja0JhclJlZik7XG4gICAgICBjb25zdCBwb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbnRlbnQsIHVuZGVmaW5lZCwgaW5qZWN0b3IpO1xuICAgICAgY29uc3QgY29udGVudFJlZiA9IGNvbnRhaW5lci5hdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsKTtcblxuICAgICAgLy8gV2UgY2FuJ3QgcGFzcyB0aGlzIHZpYSB0aGUgaW5qZWN0b3IsIGJlY2F1c2UgdGhlIGluamVjdG9yIGlzIGNyZWF0ZWQgZWFybGllci5cbiAgICAgIHNuYWNrQmFyUmVmLmluc3RhbmNlID0gY29udGVudFJlZi5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gdGhlIGJyZWFrcG9pbnQgb2JzZXJ2ZXIgYW5kIGF0dGFjaCB0aGUgbWF0LXNuYWNrLWJhci1oYW5kc2V0IGNsYXNzIGFzXG4gICAgLy8gYXBwcm9wcmlhdGUuIFRoaXMgY2xhc3MgaXMgYXBwbGllZCB0byB0aGUgb3ZlcmxheSBlbGVtZW50IGJlY2F1c2UgdGhlIG92ZXJsYXkgbXVzdCBleHBhbmQgdG9cbiAgICAvLyBmaWxsIHRoZSB3aWR0aCBvZiB0aGUgc2NyZWVuIGZvciBmdWxsIHdpZHRoIHNuYWNrYmFycy5cbiAgICB0aGlzLl9icmVha3BvaW50T2JzZXJ2ZXJcbiAgICAgIC5vYnNlcnZlKEJyZWFrcG9pbnRzLkhhbmRzZXRQb3J0cmFpdClcbiAgICAgIC5waXBlKHRha2VVbnRpbChvdmVybGF5UmVmLmRldGFjaG1lbnRzKCkpKVxuICAgICAgLnN1YnNjcmliZShzdGF0ZSA9PiB7XG4gICAgICAgIG92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmhhbmRzZXRDc3NDbGFzcywgc3RhdGUubWF0Y2hlcyk7XG4gICAgICB9KTtcblxuICAgIGlmIChjb25maWcuYW5ub3VuY2VtZW50TWVzc2FnZSkge1xuICAgICAgLy8gV2FpdCB1bnRpbCB0aGUgc25hY2sgYmFyIGNvbnRlbnRzIGhhdmUgYmVlbiBhbm5vdW5jZWQgdGhlbiBkZWxpdmVyIHRoaXMgbWVzc2FnZS5cbiAgICAgIGNvbnRhaW5lci5fb25Bbm5vdW5jZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9saXZlLmFubm91bmNlKGNvbmZpZy5hbm5vdW5jZW1lbnRNZXNzYWdlISwgY29uZmlnLnBvbGl0ZW5lc3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYW5pbWF0ZVNuYWNrQmFyKHNuYWNrQmFyUmVmLCBjb25maWcpO1xuICAgIHRoaXMuX29wZW5lZFNuYWNrQmFyUmVmID0gc25hY2tCYXJSZWY7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5lZFNuYWNrQmFyUmVmO1xuICB9XG5cbiAgLyoqIEFuaW1hdGVzIHRoZSBvbGQgc25hY2sgYmFyIG91dCBhbmQgdGhlIG5ldyBvbmUgaW4uICovXG4gIHByaXZhdGUgX2FuaW1hdGVTbmFja0JhcihzbmFja0JhclJlZjogTWF0U25hY2tCYXJSZWY8YW55PiwgY29uZmlnOiBNYXRTbmFja0JhckNvbmZpZykge1xuICAgIC8vIFdoZW4gdGhlIHNuYWNrYmFyIGlzIGRpc21pc3NlZCwgY2xlYXIgdGhlIHJlZmVyZW5jZSB0byBpdC5cbiAgICBzbmFja0JhclJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAvLyBDbGVhciB0aGUgc25hY2tiYXIgcmVmIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gcmVwbGFjZWQgYnkgYSBuZXdlciBzbmFja2Jhci5cbiAgICAgIGlmICh0aGlzLl9vcGVuZWRTbmFja0JhclJlZiA9PSBzbmFja0JhclJlZikge1xuICAgICAgICB0aGlzLl9vcGVuZWRTbmFja0JhclJlZiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuYW5ub3VuY2VtZW50TWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9saXZlLmNsZWFyKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5fb3BlbmVkU25hY2tCYXJSZWYpIHtcbiAgICAgIC8vIElmIGEgc25hY2sgYmFyIGlzIGFscmVhZHkgaW4gdmlldywgZGlzbWlzcyBpdCBhbmQgZW50ZXIgdGhlXG4gICAgICAvLyBuZXcgc25hY2sgYmFyIGFmdGVyIGV4aXQgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLlxuICAgICAgdGhpcy5fb3BlbmVkU25hY2tCYXJSZWYuYWZ0ZXJEaXNtaXNzZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBzbmFja0JhclJlZi5jb250YWluZXJJbnN0YW5jZS5lbnRlcigpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9vcGVuZWRTbmFja0JhclJlZi5kaXNtaXNzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIG5vIHNuYWNrIGJhciBpcyBpbiB2aWV3LCBlbnRlciB0aGUgbmV3IHNuYWNrIGJhci5cbiAgICAgIHNuYWNrQmFyUmVmLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgYSBkaXNtaXNzIHRpbWVvdXQgaXMgcHJvdmlkZWQsIHNldCB1cCBkaXNtaXNzIGJhc2VkIG9uIGFmdGVyIHRoZSBzbmFja2JhciBpcyBvcGVuZWQuXG4gICAgaWYgKGNvbmZpZy5kdXJhdGlvbiAmJiBjb25maWcuZHVyYXRpb24gPiAwKSB7XG4gICAgICBzbmFja0JhclJlZi5hZnRlck9wZW5lZCgpLnN1YnNjcmliZSgoKSA9PiBzbmFja0JhclJlZi5fZGlzbWlzc0FmdGVyKGNvbmZpZy5kdXJhdGlvbiEpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBvdmVybGF5IGFuZCBwbGFjZXMgaXQgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24uXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHVzZXItc3BlY2lmaWVkIHNuYWNrIGJhciBjb25maWcuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KGNvbmZpZzogTWF0U25hY2tCYXJDb25maWcpOiBPdmVybGF5UmVmIHtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gbmV3IE92ZXJsYXlDb25maWcoKTtcbiAgICBvdmVybGF5Q29uZmlnLmRpcmVjdGlvbiA9IGNvbmZpZy5kaXJlY3Rpb247XG5cbiAgICBsZXQgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMuX292ZXJsYXkucG9zaXRpb24oKS5nbG9iYWwoKTtcbiAgICAvLyBTZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICBjb25zdCBpc1J0bCA9IGNvbmZpZy5kaXJlY3Rpb24gPT09ICdydGwnO1xuICAgIGNvbnN0IGlzTGVmdCA9XG4gICAgICBjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnbGVmdCcgfHxcbiAgICAgIChjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnc3RhcnQnICYmICFpc1J0bCkgfHxcbiAgICAgIChjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnZW5kJyAmJiBpc1J0bCk7XG4gICAgY29uc3QgaXNSaWdodCA9ICFpc0xlZnQgJiYgY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiAhPT0gJ2NlbnRlcic7XG4gICAgaWYgKGlzTGVmdCkge1xuICAgICAgcG9zaXRpb25TdHJhdGVneS5sZWZ0KCcwJyk7XG4gICAgfSBlbHNlIGlmIChpc1JpZ2h0KSB7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LnJpZ2h0KCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kuY2VudGVySG9yaXpvbnRhbGx5KCk7XG4gICAgfVxuICAgIC8vIFNldCBob3Jpem9udGFsIHBvc2l0aW9uLlxuICAgIGlmIChjb25maWcudmVydGljYWxQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kudG9wKCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kuYm90dG9tKCcwJyk7XG4gICAgfVxuXG4gICAgb3ZlcmxheUNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5ID0gcG9zaXRpb25TdHJhdGVneTtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5jcmVhdGUob3ZlcmxheUNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbmplY3RvciB0byBiZSB1c2VkIGluc2lkZSBvZiBhIHNuYWNrIGJhciBjb21wb25lbnQuXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlnIHRoYXQgd2FzIHVzZWQgdG8gY3JlYXRlIHRoZSBzbmFjayBiYXIuXG4gICAqIEBwYXJhbSBzbmFja0JhclJlZiBSZWZlcmVuY2UgdG8gdGhlIHNuYWNrIGJhci5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUluamVjdG9yPFQ+KGNvbmZpZzogTWF0U25hY2tCYXJDb25maWcsIHNuYWNrQmFyUmVmOiBNYXRTbmFja0JhclJlZjxUPik6IEluamVjdG9yIHtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG5cbiAgICByZXR1cm4gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHBhcmVudDogdXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtwcm92aWRlOiBNYXRTbmFja0JhclJlZiwgdXNlVmFsdWU6IHNuYWNrQmFyUmVmfSxcbiAgICAgICAge3Byb3ZpZGU6IE1BVF9TTkFDS19CQVJfREFUQSwgdXNlVmFsdWU6IGNvbmZpZy5kYXRhfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==