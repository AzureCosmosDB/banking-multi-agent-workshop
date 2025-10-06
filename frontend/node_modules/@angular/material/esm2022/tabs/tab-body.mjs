import { Directionality } from '@angular/cdk/bidi';
import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, Optional, Output, ViewChild, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { matTabsAnimations } from './tabs-animations';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
export class MatTabBodyPortal extends CdkPortalOutlet {
    constructor(componentFactoryResolver, viewContainerRef, _host, _document) {
        super(componentFactoryResolver, viewContainerRef, _document);
        this._host = _host;
        /** Subscription to events for when the tab body begins centering. */
        this._centeringSub = Subscription.EMPTY;
        /** Subscription to events for when the tab body finishes leaving from center position. */
        this._leavingSub = Subscription.EMPTY;
    }
    /** Set initial visibility or set up subscription for changing visibility. */
    ngOnInit() {
        super.ngOnInit();
        this._centeringSub = this._host._beforeCentering
            .pipe(startWith(this._host._isCenterPosition(this._host._position)))
            .subscribe((isCentering) => {
            if (this._host._content && isCentering && !this.hasAttached()) {
                this.attach(this._host._content);
            }
        });
        this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
            if (!this._host.preserveContent) {
                this.detach();
            }
        });
    }
    /** Clean up centering subscription. */
    ngOnDestroy() {
        super.ngOnDestroy();
        this._centeringSub.unsubscribe();
        this._leavingSub.unsubscribe();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTabBodyPortal, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.ViewContainerRef }, { token: forwardRef(() => MatTabBody) }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatTabBodyPortal, isStandalone: true, selector: "[matTabBodyHost]", usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTabBodyPortal, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matTabBodyHost]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ComponentFactoryResolver }, { type: i0.ViewContainerRef }, { type: MatTabBody, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => MatTabBody)]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
export class MatTabBody {
    /** The shifted index position of the tab body, where zero represents the active center tab. */
    set position(position) {
        this._positionIndex = position;
        this._computePositionAnimationState();
    }
    constructor(_elementRef, _dir, changeDetectorRef) {
        this._elementRef = _elementRef;
        this._dir = _dir;
        /** Subscription to the directionality change observable. */
        this._dirChangeSubscription = Subscription.EMPTY;
        /** Emits when an animation on the tab is complete. */
        this._translateTabComplete = new Subject();
        /** Event emitted when the tab begins to animate towards the center as the active tab. */
        this._onCentering = new EventEmitter();
        /** Event emitted before the centering of the tab begins. */
        this._beforeCentering = new EventEmitter();
        /** Event emitted before the centering of the tab begins. */
        this._afterLeavingCenter = new EventEmitter();
        /** Event emitted when the tab completes its animation towards the center. */
        this._onCentered = new EventEmitter(true);
        // Note that the default value will always be overwritten by `MatTabBody`, but we need one
        // anyway to prevent the animations module from throwing an error if the body is used on its own.
        /** Duration for the tab's animation. */
        this.animationDuration = '500ms';
        /** Whether the tab's content should be kept in the DOM while it's off-screen. */
        this.preserveContent = false;
        if (_dir) {
            this._dirChangeSubscription = _dir.change.subscribe((dir) => {
                this._computePositionAnimationState(dir);
                changeDetectorRef.markForCheck();
            });
        }
        this._translateTabComplete.subscribe(event => {
            // If the transition to the center is complete, emit an event.
            if (this._isCenterPosition(event.toState) && this._isCenterPosition(this._position)) {
                this._onCentered.emit();
            }
            if (this._isCenterPosition(event.fromState) && !this._isCenterPosition(this._position)) {
                this._afterLeavingCenter.emit();
            }
        });
    }
    /**
     * After initialized, check if the content is centered and has an origin. If so, set the
     * special position states that transition the tab from the left or right before centering.
     */
    ngOnInit() {
        if (this._position == 'center' && this.origin != null) {
            this._position = this._computePositionFromOrigin(this.origin);
        }
    }
    ngOnDestroy() {
        this._dirChangeSubscription.unsubscribe();
        this._translateTabComplete.complete();
    }
    _onTranslateTabStarted(event) {
        const isCentering = this._isCenterPosition(event.toState);
        this._beforeCentering.emit(isCentering);
        if (isCentering) {
            this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
        }
    }
    /** The text direction of the containing app. */
    _getLayoutDirection() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Whether the provided position state is considered center, regardless of origin. */
    _isCenterPosition(position) {
        return (position == 'center' || position == 'left-origin-center' || position == 'right-origin-center');
    }
    /** Computes the position state that will be used for the tab-body animation trigger. */
    _computePositionAnimationState(dir = this._getLayoutDirection()) {
        if (this._positionIndex < 0) {
            this._position = dir == 'ltr' ? 'left' : 'right';
        }
        else if (this._positionIndex > 0) {
            this._position = dir == 'ltr' ? 'right' : 'left';
        }
        else {
            this._position = 'center';
        }
    }
    /**
     * Computes the position state based on the specified origin position. This is used if the
     * tab is becoming visible immediately after creation.
     */
    _computePositionFromOrigin(origin) {
        const dir = this._getLayoutDirection();
        if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
            return 'left-origin-center';
        }
        return 'right-origin-center';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTabBody, deps: [{ token: i0.ElementRef }, { token: i1.Directionality, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatTabBody, isStandalone: true, selector: "mat-tab-body", inputs: { _content: ["content", "_content"], origin: "origin", animationDuration: "animationDuration", preserveContent: "preserveContent", position: "position" }, outputs: { _onCentering: "_onCentering", _beforeCentering: "_beforeCentering", _afterLeavingCenter: "_afterLeavingCenter", _onCentered: "_onCentered" }, host: { classAttribute: "mat-mdc-tab-body" }, viewQueries: [{ propertyName: "_portalHost", first: true, predicate: CdkPortalOutlet, descendants: true }], ngImport: i0, template: "<div class=\"mat-mdc-tab-body-content\" #content\n     [@translateTab]=\"{\n        value: _position,\n        params: {animationDuration: animationDuration}\n     }\"\n     (@translateTab.start)=\"_onTranslateTabStarted($event)\"\n     (@translateTab.done)=\"_translateTabComplete.next($event)\"\n     cdkScrollable>\n  <ng-template matTabBodyHost></ng-template>\n</div>\n", styles: [".mat-mdc-tab-body{top:0;left:0;right:0;bottom:0;position:absolute;display:block;overflow:hidden;outline:0;flex-basis:100%}.mat-mdc-tab-body.mat-mdc-tab-body-active{position:relative;overflow-x:hidden;overflow-y:auto;z-index:1;flex-grow:1}.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active{overflow-y:hidden}.mat-mdc-tab-body-content{height:100%;overflow:auto}.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content{overflow:hidden}.mat-mdc-tab-body-content[style*=\"visibility: hidden\"]{display:none}"], dependencies: [{ kind: "directive", type: MatTabBodyPortal, selector: "[matTabBodyHost]" }, { kind: "directive", type: CdkScrollable, selector: "[cdk-scrollable], [cdkScrollable]" }], animations: [matTabsAnimations.translateTab], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatTabBody, decorators: [{
            type: Component,
            args: [{ selector: 'mat-tab-body', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, animations: [matTabsAnimations.translateTab], host: {
                        'class': 'mat-mdc-tab-body',
                    }, standalone: true, imports: [MatTabBodyPortal, CdkScrollable], template: "<div class=\"mat-mdc-tab-body-content\" #content\n     [@translateTab]=\"{\n        value: _position,\n        params: {animationDuration: animationDuration}\n     }\"\n     (@translateTab.start)=\"_onTranslateTabStarted($event)\"\n     (@translateTab.done)=\"_translateTabComplete.next($event)\"\n     cdkScrollable>\n  <ng-template matTabBodyHost></ng-template>\n</div>\n", styles: [".mat-mdc-tab-body{top:0;left:0;right:0;bottom:0;position:absolute;display:block;overflow:hidden;outline:0;flex-basis:100%}.mat-mdc-tab-body.mat-mdc-tab-body-active{position:relative;overflow-x:hidden;overflow-y:auto;z-index:1;flex-grow:1}.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active{overflow-y:hidden}.mat-mdc-tab-body-content{height:100%;overflow:auto}.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content{overflow:hidden}.mat-mdc-tab-body-content[style*=\"visibility: hidden\"]{display:none}"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }], propDecorators: { _onCentering: [{
                type: Output
            }], _beforeCentering: [{
                type: Output
            }], _afterLeavingCenter: [{
                type: Output
            }], _onCentered: [{
                type: Output
            }], _portalHost: [{
                type: ViewChild,
                args: [CdkPortalOutlet]
            }], _content: [{
                type: Input,
                args: ['content']
            }], origin: [{
                type: Input
            }], animationDuration: [{
                type: Input
            }], preserveContent: [{
                type: Input
            }], position: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWJvZHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFicy90YWItYm9keS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJzL3RhYi1ib2R5Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1Qsd0JBQXdCLEVBQ3hCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUdMLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULGdCQUFnQixFQUNoQixpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDOzs7QUFFcEQ7OztHQUdHO0FBS0gsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGVBQWU7SUFNbkQsWUFDRSx3QkFBa0QsRUFDbEQsZ0JBQWtDLEVBQ1ksS0FBaUIsRUFDN0MsU0FBYztRQUVoQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFIZixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBUmpFLHFFQUFxRTtRQUM3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QUlGLFFBQVE7c0JBRFgsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7RGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDZGtQb3J0YWxPdXRsZXQsIFRlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7Q2RrU2Nyb2xsYWJsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7c3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge21hdFRhYnNBbmltYXRpb25zfSBmcm9tICcuL3RhYnMtYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogVGhlIHBvcnRhbCBob3N0IGRpcmVjdGl2ZSBmb3IgdGhlIGNvbnRlbnRzIG9mIHRoZSB0YWIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRUYWJCb2R5SG9zdF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUYWJCb2R5UG9ydGFsIGV4dGVuZHMgQ2RrUG9ydGFsT3V0bGV0IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKiogU3Vic2NyaXB0aW9uIHRvIGV2ZW50cyBmb3Igd2hlbiB0aGUgdGFiIGJvZHkgYmVnaW5zIGNlbnRlcmluZy4gKi9cbiAgcHJpdmF0ZSBfY2VudGVyaW5nU3ViID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICAvKiogU3Vic2NyaXB0aW9uIHRvIGV2ZW50cyBmb3Igd2hlbiB0aGUgdGFiIGJvZHkgZmluaXNoZXMgbGVhdmluZyBmcm9tIGNlbnRlciBwb3NpdGlvbi4gKi9cbiAgcHJpdmF0ZSBfbGVhdmluZ1N1YiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBNYXRUYWJCb2R5KSkgcHJpdmF0ZSBfaG9zdDogTWF0VGFiQm9keSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgKSB7XG4gICAgc3VwZXIoY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCB2aWV3Q29udGFpbmVyUmVmLCBfZG9jdW1lbnQpO1xuICB9XG5cbiAgLyoqIFNldCBpbml0aWFsIHZpc2liaWxpdHkgb3Igc2V0IHVwIHN1YnNjcmlwdGlvbiBmb3IgY2hhbmdpbmcgdmlzaWJpbGl0eS4gKi9cbiAgb3ZlcnJpZGUgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcblxuICAgIHRoaXMuX2NlbnRlcmluZ1N1YiA9IHRoaXMuX2hvc3QuX2JlZm9yZUNlbnRlcmluZ1xuICAgICAgLnBpcGUoc3RhcnRXaXRoKHRoaXMuX2hvc3QuX2lzQ2VudGVyUG9zaXRpb24odGhpcy5faG9zdC5fcG9zaXRpb24pKSlcbiAgICAgIC5zdWJzY3JpYmUoKGlzQ2VudGVyaW5nOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9ob3N0Ll9jb250ZW50ICYmIGlzQ2VudGVyaW5nICYmICF0aGlzLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgICAgICB0aGlzLmF0dGFjaCh0aGlzLl9ob3N0Ll9jb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLl9sZWF2aW5nU3ViID0gdGhpcy5faG9zdC5fYWZ0ZXJMZWF2aW5nQ2VudGVyLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2hvc3QucHJlc2VydmVDb250ZW50KSB7XG4gICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ2xlYW4gdXAgY2VudGVyaW5nIHN1YnNjcmlwdGlvbi4gKi9cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9jZW50ZXJpbmdTdWIudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9sZWF2aW5nU3ViLnVuc3Vic2NyaWJlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGVzZSBwb3NpdGlvbiBzdGF0ZXMgYXJlIHVzZWQgaW50ZXJuYWxseSBhcyBhbmltYXRpb24gc3RhdGVzIGZvciB0aGUgdGFiIGJvZHkuIFNldHRpbmcgdGhlXG4gKiBwb3NpdGlvbiBzdGF0ZSB0byBsZWZ0LCByaWdodCwgb3IgY2VudGVyIHdpbGwgdHJhbnNpdGlvbiB0aGUgdGFiIGJvZHkgZnJvbSBpdHMgY3VycmVudFxuICogcG9zaXRpb24gdG8gaXRzIHJlc3BlY3RpdmUgc3RhdGUuIElmIHRoZXJlIGlzIG5vdCBjdXJyZW50IHBvc2l0aW9uICh2b2lkLCBpbiB0aGUgY2FzZSBvZiBhIG5ld1xuICogdGFiIGJvZHkpLCB0aGVuIHRoZXJlIHdpbGwgYmUgbm8gdHJhbnNpdGlvbiBhbmltYXRpb24gdG8gaXRzIHN0YXRlLlxuICpcbiAqIEluIHRoZSBjYXNlIG9mIGEgbmV3IHRhYiBib2R5IHRoYXQgc2hvdWxkIGltbWVkaWF0ZWx5IGJlIGNlbnRlcmVkIHdpdGggYW4gYW5pbWF0aW5nIHRyYW5zaXRpb24sXG4gKiB0aGVuIGxlZnQtb3JpZ2luLWNlbnRlciBvciByaWdodC1vcmlnaW4tY2VudGVyIGNhbiBiZSB1c2VkLCB3aGljaCB3aWxsIHVzZSBsZWZ0IG9yIHJpZ2h0IGFzIGl0c1xuICogcHNldWRvLXByaW9yIHN0YXRlLlxuICovXG5leHBvcnQgdHlwZSBNYXRUYWJCb2R5UG9zaXRpb25TdGF0ZSA9XG4gIHwgJ2xlZnQnXG4gIHwgJ2NlbnRlcidcbiAgfCAncmlnaHQnXG4gIHwgJ2xlZnQtb3JpZ2luLWNlbnRlcidcbiAgfCAncmlnaHQtb3JpZ2luLWNlbnRlcic7XG5cbi8qKlxuICogV3JhcHBlciBmb3IgdGhlIGNvbnRlbnRzIG9mIGEgdGFiLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtdGFiLWJvZHknLFxuICB0ZW1wbGF0ZVVybDogJ3RhYi1ib2R5Lmh0bWwnLFxuICBzdHlsZVVybDogJ3RhYi1ib2R5LmNzcycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgYW5pbWF0aW9uczogW21hdFRhYnNBbmltYXRpb25zLnRyYW5zbGF0ZVRhYl0sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy10YWItYm9keScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtNYXRUYWJCb2R5UG9ydGFsLCBDZGtTY3JvbGxhYmxlXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0VGFiQm9keSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIEN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIHRhYi1ib2R5IGluIHRoZSB0YWItZ3JvdXAuIFplcm8gbWVhbnMgdGhhdCB0aGUgdGFiIGlzIHZpc2libGUuICovXG4gIHByaXZhdGUgX3Bvc2l0aW9uSW5kZXg6IG51bWJlcjtcblxuICAvKiogU3Vic2NyaXB0aW9uIHRvIHRoZSBkaXJlY3Rpb25hbGl0eSBjaGFuZ2Ugb2JzZXJ2YWJsZS4gKi9cbiAgcHJpdmF0ZSBfZGlyQ2hhbmdlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBUYWIgYm9keSBwb3NpdGlvbiBzdGF0ZS4gVXNlZCBieSB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50IHN0YXRlLiAqL1xuICBfcG9zaXRpb246IE1hdFRhYkJvZHlQb3NpdGlvblN0YXRlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIGFuaW1hdGlvbiBvbiB0aGUgdGFiIGlzIGNvbXBsZXRlLiAqL1xuICByZWFkb25seSBfdHJhbnNsYXRlVGFiQ29tcGxldGUgPSBuZXcgU3ViamVjdDxBbmltYXRpb25FdmVudD4oKTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB0YWIgYmVnaW5zIHRvIGFuaW1hdGUgdG93YXJkcyB0aGUgY2VudGVyIGFzIHRoZSBhY3RpdmUgdGFiLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX29uQ2VudGVyaW5nOiBFdmVudEVtaXR0ZXI8bnVtYmVyPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIGJlZm9yZSB0aGUgY2VudGVyaW5nIG9mIHRoZSB0YWIgYmVnaW5zLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX2JlZm9yZUNlbnRlcmluZzogRXZlbnRFbWl0dGVyPGJvb2xlYW4+ID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIGJlZm9yZSB0aGUgY2VudGVyaW5nIG9mIHRoZSB0YWIgYmVnaW5zLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX2FmdGVyTGVhdmluZ0NlbnRlcjogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHRhYiBjb21wbGV0ZXMgaXRzIGFuaW1hdGlvbiB0b3dhcmRzIHRoZSBjZW50ZXIuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBfb25DZW50ZXJlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPih0cnVlKTtcblxuICAvKiogVGhlIHBvcnRhbCBob3N0IGluc2lkZSBvZiB0aGlzIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSB0YWIgYm9keSBjb250ZW50IHdpbGwgYmUgbG9hZGVkLiAqL1xuICBAVmlld0NoaWxkKENka1BvcnRhbE91dGxldCkgX3BvcnRhbEhvc3Q6IENka1BvcnRhbE91dGxldDtcblxuICAvKiogVGhlIHRhYiBib2R5IGNvbnRlbnQgdG8gZGlzcGxheS4gKi9cbiAgQElucHV0KCdjb250ZW50JykgX2NvbnRlbnQ6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIC8qKiBQb3NpdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB3aGVuIHRoZSB0YWIgaXMgaW1tZWRpYXRlbHkgYmVjb21pbmcgdmlzaWJsZSBhZnRlciBjcmVhdGlvbi4gKi9cbiAgQElucHV0KCkgb3JpZ2luOiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIE5vdGUgdGhhdCB0aGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBvdmVyd3JpdHRlbiBieSBgTWF0VGFiQm9keWAsIGJ1dCB3ZSBuZWVkIG9uZVxuICAvLyBhbnl3YXkgdG8gcHJldmVudCB0aGUgYW5pbWF0aW9ucyBtb2R1bGUgZnJvbSB0aHJvd2luZyBhbiBlcnJvciBpZiB0aGUgYm9keSBpcyB1c2VkIG9uIGl0cyBvd24uXG4gIC8qKiBEdXJhdGlvbiBmb3IgdGhlIHRhYidzIGFuaW1hdGlvbi4gKi9cbiAgQElucHV0KCkgYW5pbWF0aW9uRHVyYXRpb246IHN0cmluZyA9ICc1MDBtcyc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYidzIGNvbnRlbnQgc2hvdWxkIGJlIGtlcHQgaW4gdGhlIERPTSB3aGlsZSBpdCdzIG9mZi1zY3JlZW4uICovXG4gIEBJbnB1dCgpIHByZXNlcnZlQ29udGVudDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgc2hpZnRlZCBpbmRleCBwb3NpdGlvbiBvZiB0aGUgdGFiIGJvZHksIHdoZXJlIHplcm8gcmVwcmVzZW50cyB0aGUgYWN0aXZlIGNlbnRlciB0YWIuICovXG4gIEBJbnB1dCgpXG4gIHNldCBwb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyKSB7XG4gICAgdGhpcy5fcG9zaXRpb25JbmRleCA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX2NvbXB1dGVQb3NpdGlvbkFuaW1hdGlvblN0YXRlKCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI6IERpcmVjdGlvbmFsaXR5LFxuICAgIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgKSB7XG4gICAgaWYgKF9kaXIpIHtcbiAgICAgIHRoaXMuX2RpckNoYW5nZVN1YnNjcmlwdGlvbiA9IF9kaXIuY2hhbmdlLnN1YnNjcmliZSgoZGlyOiBEaXJlY3Rpb24pID0+IHtcbiAgICAgICAgdGhpcy5fY29tcHV0ZVBvc2l0aW9uQW5pbWF0aW9uU3RhdGUoZGlyKTtcbiAgICAgICAgY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl90cmFuc2xhdGVUYWJDb21wbGV0ZS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgLy8gSWYgdGhlIHRyYW5zaXRpb24gdG8gdGhlIGNlbnRlciBpcyBjb21wbGV0ZSwgZW1pdCBhbiBldmVudC5cbiAgICAgIGlmICh0aGlzLl9pc0NlbnRlclBvc2l0aW9uKGV2ZW50LnRvU3RhdGUpICYmIHRoaXMuX2lzQ2VudGVyUG9zaXRpb24odGhpcy5fcG9zaXRpb24pKSB7XG4gICAgICAgIHRoaXMuX29uQ2VudGVyZWQuZW1pdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5faXNDZW50ZXJQb3NpdGlvbihldmVudC5mcm9tU3RhdGUpICYmICF0aGlzLl9pc0NlbnRlclBvc2l0aW9uKHRoaXMuX3Bvc2l0aW9uKSkge1xuICAgICAgICB0aGlzLl9hZnRlckxlYXZpbmdDZW50ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFmdGVyIGluaXRpYWxpemVkLCBjaGVjayBpZiB0aGUgY29udGVudCBpcyBjZW50ZXJlZCBhbmQgaGFzIGFuIG9yaWdpbi4gSWYgc28sIHNldCB0aGVcbiAgICogc3BlY2lhbCBwb3NpdGlvbiBzdGF0ZXMgdGhhdCB0cmFuc2l0aW9uIHRoZSB0YWIgZnJvbSB0aGUgbGVmdCBvciByaWdodCBiZWZvcmUgY2VudGVyaW5nLlxuICAgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uID09ICdjZW50ZXInICYmIHRoaXMub3JpZ2luICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdGhpcy5fY29tcHV0ZVBvc2l0aW9uRnJvbU9yaWdpbih0aGlzLm9yaWdpbik7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGlyQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdHJhbnNsYXRlVGFiQ29tcGxldGUuY29tcGxldGUoKTtcbiAgfVxuXG4gIF9vblRyYW5zbGF0ZVRhYlN0YXJ0ZWQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgaXNDZW50ZXJpbmcgPSB0aGlzLl9pc0NlbnRlclBvc2l0aW9uKGV2ZW50LnRvU3RhdGUpO1xuICAgIHRoaXMuX2JlZm9yZUNlbnRlcmluZy5lbWl0KGlzQ2VudGVyaW5nKTtcbiAgICBpZiAoaXNDZW50ZXJpbmcpIHtcbiAgICAgIHRoaXMuX29uQ2VudGVyaW5nLmVtaXQodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSB0ZXh0IGRpcmVjdGlvbiBvZiB0aGUgY29udGFpbmluZyBhcHAuICovXG4gIF9nZXRMYXlvdXREaXJlY3Rpb24oKTogRGlyZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncnRsJyA6ICdsdHInO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHByb3ZpZGVkIHBvc2l0aW9uIHN0YXRlIGlzIGNvbnNpZGVyZWQgY2VudGVyLCByZWdhcmRsZXNzIG9mIG9yaWdpbi4gKi9cbiAgX2lzQ2VudGVyUG9zaXRpb24ocG9zaXRpb246IE1hdFRhYkJvZHlQb3NpdGlvblN0YXRlIHwgc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvc2l0aW9uID09ICdjZW50ZXInIHx8IHBvc2l0aW9uID09ICdsZWZ0LW9yaWdpbi1jZW50ZXInIHx8IHBvc2l0aW9uID09ICdyaWdodC1vcmlnaW4tY2VudGVyJ1xuICAgICk7XG4gIH1cblxuICAvKiogQ29tcHV0ZXMgdGhlIHBvc2l0aW9uIHN0YXRlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciB0aGUgdGFiLWJvZHkgYW5pbWF0aW9uIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX2NvbXB1dGVQb3NpdGlvbkFuaW1hdGlvblN0YXRlKGRpcjogRGlyZWN0aW9uID0gdGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCkpIHtcbiAgICBpZiAodGhpcy5fcG9zaXRpb25JbmRleCA8IDApIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gZGlyID09ICdsdHInID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Bvc2l0aW9uSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9wb3NpdGlvbiA9IGRpciA9PSAnbHRyJyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uID0gJ2NlbnRlcic7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBwb3NpdGlvbiBzdGF0ZSBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIG9yaWdpbiBwb3NpdGlvbi4gVGhpcyBpcyB1c2VkIGlmIHRoZVxuICAgKiB0YWIgaXMgYmVjb21pbmcgdmlzaWJsZSBpbW1lZGlhdGVseSBhZnRlciBjcmVhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2NvbXB1dGVQb3NpdGlvbkZyb21PcmlnaW4ob3JpZ2luOiBudW1iZXIpOiBNYXRUYWJCb2R5UG9zaXRpb25TdGF0ZSB7XG4gICAgY29uc3QgZGlyID0gdGhpcy5fZ2V0TGF5b3V0RGlyZWN0aW9uKCk7XG5cbiAgICBpZiAoKGRpciA9PSAnbHRyJyAmJiBvcmlnaW4gPD0gMCkgfHwgKGRpciA9PSAncnRsJyAmJiBvcmlnaW4gPiAwKSkge1xuICAgICAgcmV0dXJuICdsZWZ0LW9yaWdpbi1jZW50ZXInO1xuICAgIH1cblxuICAgIHJldHVybiAncmlnaHQtb3JpZ2luLWNlbnRlcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3JpZ2luIHN0YXRlIGlzIGFuIGludGVybmFsbHkgdXNlZCBzdGF0ZSB0aGF0IGlzIHNldCBvbiBhIG5ldyB0YWIgYm9keSBpbmRpY2F0aW5nIGlmIGl0XG4gKiBiZWdhbiB0byB0aGUgbGVmdCBvciByaWdodCBvZiB0aGUgcHJpb3Igc2VsZWN0ZWQgaW5kZXguIEZvciBleGFtcGxlLCBpZiB0aGUgc2VsZWN0ZWQgaW5kZXggd2FzXG4gKiBzZXQgdG8gMSwgYW5kIGEgbmV3IHRhYiBpcyBjcmVhdGVkIGFuZCBzZWxlY3RlZCBhdCBpbmRleCAyLCB0aGVuIHRoZSB0YWIgYm9keSB3b3VsZCBoYXZlIGFuXG4gKiBvcmlnaW4gb2YgcmlnaHQgYmVjYXVzZSBpdHMgaW5kZXggd2FzIGdyZWF0ZXIgdGhhbiB0aGUgcHJpb3Igc2VsZWN0ZWQgaW5kZXguXG4gKi9cbmV4cG9ydCB0eXBlIE1hdFRhYkJvZHlPcmlnaW5TdGF0ZSA9ICdsZWZ0JyB8ICdyaWdodCc7XG4iLCI8ZGl2IGNsYXNzPVwibWF0LW1kYy10YWItYm9keS1jb250ZW50XCIgI2NvbnRlbnRcbiAgICAgW0B0cmFuc2xhdGVUYWJdPVwie1xuICAgICAgICB2YWx1ZTogX3Bvc2l0aW9uLFxuICAgICAgICBwYXJhbXM6IHthbmltYXRpb25EdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb259XG4gICAgIH1cIlxuICAgICAoQHRyYW5zbGF0ZVRhYi5zdGFydCk9XCJfb25UcmFuc2xhdGVUYWJTdGFydGVkKCRldmVudClcIlxuICAgICAoQHRyYW5zbGF0ZVRhYi5kb25lKT1cIl90cmFuc2xhdGVUYWJDb21wbGV0ZS5uZXh0KCRldmVudClcIlxuICAgICBjZGtTY3JvbGxhYmxlPlxuICA8bmctdGVtcGxhdGUgbWF0VGFiQm9keUhvc3Q+PC9uZy10ZW1wbGF0ZT5cbjwvZGl2PlxuIl19