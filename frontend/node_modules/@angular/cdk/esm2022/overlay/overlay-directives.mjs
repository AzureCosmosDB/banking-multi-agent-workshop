/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, EventEmitter, Inject, InjectionToken, Input, NgZone, Optional, Output, TemplateRef, ViewContainerRef, booleanAttribute, inject, } from '@angular/core';
import { _getEventTarget } from '@angular/cdk/platform';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';
import { FlexibleConnectedPositionStrategy, } from './position/flexible-connected-position-strategy';
import * as i0 from "@angular/core";
import * as i1 from "./overlay";
import * as i2 from "@angular/cdk/bidi";
/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
const defaultPositionList = [
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
    },
    {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
    },
];
/** Injection token that determines the scroll handling while the connected overlay is open. */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY = new InjectionToken('cdk-connected-overlay-scroll-strategy', {
    providedIn: 'root',
    factory: () => {
        const overlay = inject(Overlay);
        return () => overlay.scrollStrategies.reposition();
    },
});
/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
export class CdkOverlayOrigin {
    constructor(
    /** Reference to the element on which the directive is applied. */
    elementRef) {
        this.elementRef = elementRef;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkOverlayOrigin, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkOverlayOrigin, isStandalone: true, selector: "[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]", exportAs: ["cdkOverlayOrigin"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkOverlayOrigin, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]',
                    exportAs: 'cdkOverlayOrigin',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });
/**
 * Directive to facilitate declarative creation of an
 * Overlay using a FlexibleConnectedPositionStrategy.
 */
export class CdkConnectedOverlay {
    /** The offset in pixels for the overlay connection point on the x-axis */
    get offsetX() {
        return this._offsetX;
    }
    set offsetX(offsetX) {
        this._offsetX = offsetX;
        if (this._position) {
            this._updatePositionStrategy(this._position);
        }
    }
    /** The offset in pixels for the overlay connection point on the y-axis */
    get offsetY() {
        return this._offsetY;
    }
    set offsetY(offsetY) {
        this._offsetY = offsetY;
        if (this._position) {
            this._updatePositionStrategy(this._position);
        }
    }
    /** Whether the overlay should be disposed of when the user goes backwards/forwards in history. */
    get disposeOnNavigation() {
        return this._disposeOnNavigation;
    }
    set disposeOnNavigation(value) {
        this._disposeOnNavigation = value;
    }
    // TODO(jelbourn): inputs for size, scroll behavior, animation, etc.
    constructor(_overlay, templateRef, viewContainerRef, scrollStrategyFactory, _dir) {
        this._overlay = _overlay;
        this._dir = _dir;
        this._backdropSubscription = Subscription.EMPTY;
        this._attachSubscription = Subscription.EMPTY;
        this._detachSubscription = Subscription.EMPTY;
        this._positionSubscription = Subscription.EMPTY;
        this._disposeOnNavigation = false;
        this._ngZone = inject(NgZone);
        /** Margin between the overlay and the viewport edges. */
        this.viewportMargin = 0;
        /** Whether the overlay is open. */
        this.open = false;
        /** Whether the overlay can be closed by user interaction. */
        this.disableClose = false;
        /** Whether or not the overlay should attach a backdrop. */
        this.hasBackdrop = false;
        /** Whether or not the overlay should be locked when scrolling. */
        this.lockPosition = false;
        /** Whether the overlay's width and height can be constrained to fit within the viewport. */
        this.flexibleDimensions = false;
        /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
        this.growAfterOpen = false;
        /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
        this.push = false;
        /** Event emitted when the backdrop is clicked. */
        this.backdropClick = new EventEmitter();
        /** Event emitted when the position has changed. */
        this.positionChange = new EventEmitter();
        /** Event emitted when the overlay has been attached. */
        this.attach = new EventEmitter();
        /** Event emitted when the overlay has been detached. */
        this.detach = new EventEmitter();
        /** Emits when there are keyboard events that are targeted at the overlay. */
        this.overlayKeydown = new EventEmitter();
        /** Emits when there are mouse outside click events that are targeted at the overlay. */
        this.overlayOutsideClick = new EventEmitter();
        this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
        this._scrollStrategyFactory = scrollStrategyFactory;
        this.scrollStrategy = this._scrollStrategyFactory();
    }
    /** The associated overlay reference. */
    get overlayRef() {
        return this._overlayRef;
    }
    /** The element's layout direction. */
    get dir() {
        return this._dir ? this._dir.value : 'ltr';
    }
    ngOnDestroy() {
        this._attachSubscription.unsubscribe();
        this._detachSubscription.unsubscribe();
        this._backdropSubscription.unsubscribe();
        this._positionSubscription.unsubscribe();
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }
    ngOnChanges(changes) {
        if (this._position) {
            this._updatePositionStrategy(this._position);
            this._overlayRef.updateSize({
                width: this.width,
                minWidth: this.minWidth,
                height: this.height,
                minHeight: this.minHeight,
            });
            if (changes['origin'] && this.open) {
                this._position.apply();
            }
        }
        if (changes['open']) {
            this.open ? this._attachOverlay() : this._detachOverlay();
        }
    }
    /** Creates an overlay */
    _createOverlay() {
        if (!this.positions || !this.positions.length) {
            this.positions = defaultPositionList;
        }
        const overlayRef = (this._overlayRef = this._overlay.create(this._buildConfig()));
        this._attachSubscription = overlayRef.attachments().subscribe(() => this.attach.emit());
        this._detachSubscription = overlayRef.detachments().subscribe(() => this.detach.emit());
        overlayRef.keydownEvents().subscribe((event) => {
            this.overlayKeydown.next(event);
            if (event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)) {
                event.preventDefault();
                this._detachOverlay();
            }
        });
        this._overlayRef.outsidePointerEvents().subscribe((event) => {
            const origin = this._getOriginElement();
            const target = _getEventTarget(event);
            if (!origin || (origin !== target && !origin.contains(target))) {
                this.overlayOutsideClick.next(event);
            }
        });
    }
    /** Builds the overlay config based on the directive's inputs */
    _buildConfig() {
        const positionStrategy = (this._position =
            this.positionStrategy || this._createPositionStrategy());
        const overlayConfig = new OverlayConfig({
            direction: this._dir,
            positionStrategy,
            scrollStrategy: this.scrollStrategy,
            hasBackdrop: this.hasBackdrop,
            disposeOnNavigation: this.disposeOnNavigation,
        });
        if (this.width || this.width === 0) {
            overlayConfig.width = this.width;
        }
        if (this.height || this.height === 0) {
            overlayConfig.height = this.height;
        }
        if (this.minWidth || this.minWidth === 0) {
            overlayConfig.minWidth = this.minWidth;
        }
        if (this.minHeight || this.minHeight === 0) {
            overlayConfig.minHeight = this.minHeight;
        }
        if (this.backdropClass) {
            overlayConfig.backdropClass = this.backdropClass;
        }
        if (this.panelClass) {
            overlayConfig.panelClass = this.panelClass;
        }
        return overlayConfig;
    }
    /** Updates the state of a position strategy, based on the values of the directive inputs. */
    _updatePositionStrategy(positionStrategy) {
        const positions = this.positions.map(currentPosition => ({
            originX: currentPosition.originX,
            originY: currentPosition.originY,
            overlayX: currentPosition.overlayX,
            overlayY: currentPosition.overlayY,
            offsetX: currentPosition.offsetX || this.offsetX,
            offsetY: currentPosition.offsetY || this.offsetY,
            panelClass: currentPosition.panelClass || undefined,
        }));
        return positionStrategy
            .setOrigin(this._getOrigin())
            .withPositions(positions)
            .withFlexibleDimensions(this.flexibleDimensions)
            .withPush(this.push)
            .withGrowAfterOpen(this.growAfterOpen)
            .withViewportMargin(this.viewportMargin)
            .withLockedPosition(this.lockPosition)
            .withTransformOriginOn(this.transformOriginSelector);
    }
    /** Returns the position strategy of the overlay to be set on the overlay config */
    _createPositionStrategy() {
        const strategy = this._overlay.position().flexibleConnectedTo(this._getOrigin());
        this._updatePositionStrategy(strategy);
        return strategy;
    }
    _getOrigin() {
        if (this.origin instanceof CdkOverlayOrigin) {
            return this.origin.elementRef;
        }
        else {
            return this.origin;
        }
    }
    _getOriginElement() {
        if (this.origin instanceof CdkOverlayOrigin) {
            return this.origin.elementRef.nativeElement;
        }
        if (this.origin instanceof ElementRef) {
            return this.origin.nativeElement;
        }
        if (typeof Element !== 'undefined' && this.origin instanceof Element) {
            return this.origin;
        }
        return null;
    }
    /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
    _attachOverlay() {
        if (!this._overlayRef) {
            this._createOverlay();
        }
        else {
            // Update the overlay size, in case the directive's inputs have changed
            this._overlayRef.getConfig().hasBackdrop = this.hasBackdrop;
        }
        if (!this._overlayRef.hasAttached()) {
            this._overlayRef.attach(this._templatePortal);
        }
        if (this.hasBackdrop) {
            this._backdropSubscription = this._overlayRef.backdropClick().subscribe(event => {
                this.backdropClick.emit(event);
            });
        }
        else {
            this._backdropSubscription.unsubscribe();
        }
        this._positionSubscription.unsubscribe();
        // Only subscribe to `positionChanges` if requested, because putting
        // together all the information for it can be expensive.
        if (this.positionChange.observers.length > 0) {
            this._positionSubscription = this._position.positionChanges
                .pipe(takeWhile(() => this.positionChange.observers.length > 0))
                .subscribe(position => {
                this._ngZone.run(() => this.positionChange.emit(position));
                if (this.positionChange.observers.length === 0) {
                    this._positionSubscription.unsubscribe();
                }
            });
        }
    }
    /** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
    _detachOverlay() {
        if (this._overlayRef) {
            this._overlayRef.detach();
        }
        this._backdropSubscription.unsubscribe();
        this._positionSubscription.unsubscribe();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkConnectedOverlay, deps: [{ token: i1.Overlay }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkConnectedOverlay, isStandalone: true, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: { origin: ["cdkConnectedOverlayOrigin", "origin"], positions: ["cdkConnectedOverlayPositions", "positions"], positionStrategy: ["cdkConnectedOverlayPositionStrategy", "positionStrategy"], offsetX: ["cdkConnectedOverlayOffsetX", "offsetX"], offsetY: ["cdkConnectedOverlayOffsetY", "offsetY"], width: ["cdkConnectedOverlayWidth", "width"], height: ["cdkConnectedOverlayHeight", "height"], minWidth: ["cdkConnectedOverlayMinWidth", "minWidth"], minHeight: ["cdkConnectedOverlayMinHeight", "minHeight"], backdropClass: ["cdkConnectedOverlayBackdropClass", "backdropClass"], panelClass: ["cdkConnectedOverlayPanelClass", "panelClass"], viewportMargin: ["cdkConnectedOverlayViewportMargin", "viewportMargin"], scrollStrategy: ["cdkConnectedOverlayScrollStrategy", "scrollStrategy"], open: ["cdkConnectedOverlayOpen", "open"], disableClose: ["cdkConnectedOverlayDisableClose", "disableClose"], transformOriginSelector: ["cdkConnectedOverlayTransformOriginOn", "transformOriginSelector"], hasBackdrop: ["cdkConnectedOverlayHasBackdrop", "hasBackdrop", booleanAttribute], lockPosition: ["cdkConnectedOverlayLockPosition", "lockPosition", booleanAttribute], flexibleDimensions: ["cdkConnectedOverlayFlexibleDimensions", "flexibleDimensions", booleanAttribute], growAfterOpen: ["cdkConnectedOverlayGrowAfterOpen", "growAfterOpen", booleanAttribute], push: ["cdkConnectedOverlayPush", "push", booleanAttribute], disposeOnNavigation: ["cdkConnectedOverlayDisposeOnNavigation", "disposeOnNavigation", booleanAttribute] }, outputs: { backdropClick: "backdropClick", positionChange: "positionChange", attach: "attach", detach: "detach", overlayKeydown: "overlayKeydown", overlayOutsideClick: "overlayOutsideClick" }, exportAs: ["cdkConnectedOverlay"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkConnectedOverlay, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]',
                    exportAs: 'cdkConnectedOverlay',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { origin: [{
                type: Input,
                args: ['cdkConnectedOverlayOrigin']
            }], positions: [{
                type: Input,
                args: ['cdkConnectedOverlayPositions']
            }], positionStrategy: [{
                type: Input,
                args: ['cdkConnectedOverlayPositionStrategy']
            }], offsetX: [{
                type: Input,
                args: ['cdkConnectedOverlayOffsetX']
            }], offsetY: [{
                type: Input,
                args: ['cdkConnectedOverlayOffsetY']
            }], width: [{
                type: Input,
                args: ['cdkConnectedOverlayWidth']
            }], height: [{
                type: Input,
                args: ['cdkConnectedOverlayHeight']
            }], minWidth: [{
                type: Input,
                args: ['cdkConnectedOverlayMinWidth']
            }], minHeight: [{
                type: Input,
                args: ['cdkConnectedOverlayMinHeight']
            }], backdropClass: [{
                type: Input,
                args: ['cdkConnectedOverlayBackdropClass']
            }], panelClass: [{
                type: Input,
                args: ['cdkConnectedOverlayPanelClass']
            }], viewportMargin: [{
                type: Input,
                args: ['cdkConnectedOverlayViewportMargin']
            }], scrollStrategy: [{
                type: Input,
                args: ['cdkConnectedOverlayScrollStrategy']
            }], open: [{
                type: Input,
                args: ['cdkConnectedOverlayOpen']
            }], disableClose: [{
                type: Input,
                args: ['cdkConnectedOverlayDisableClose']
            }], transformOriginSelector: [{
                type: Input,
                args: ['cdkConnectedOverlayTransformOriginOn']
            }], hasBackdrop: [{
                type: Input,
                args: [{ alias: 'cdkConnectedOverlayHasBackdrop', transform: booleanAttribute }]
            }], lockPosition: [{
                type: Input,
                args: [{ alias: 'cdkConnectedOverlayLockPosition', transform: booleanAttribute }]
            }], flexibleDimensions: [{
                type: Input,
                args: [{ alias: 'cdkConnectedOverlayFlexibleDimensions', transform: booleanAttribute }]
            }], growAfterOpen: [{
                type: Input,
                args: [{ alias: 'cdkConnectedOverlayGrowAfterOpen', transform: booleanAttribute }]
            }], push: [{
                type: Input,
                args: [{ alias: 'cdkConnectedOverlayPush', transform: booleanAttribute }]
            }], disposeOnNavigation: [{
                type: Input,
                args: [{ alias: 'cdkConnectedOverlayDisposeOnNavigation', transform: booleanAttribute }]
            }], backdropClick: [{
                type: Output
            }], positionChange: [{
                type: Output
            }], attach: [{
                type: Output
            }], detach: [{
                type: Output
            }], overlayKeydown: [{
                type: Output
            }], overlayOutsideClick: [{
                type: Output
            }] } });
/** @docs-private */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
    provide: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L292ZXJsYXktZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVksY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUQsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFHTixRQUFRLEVBQ1IsTUFBTSxFQUVOLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHL0MsT0FBTyxFQUVMLGlDQUFpQyxHQUVsQyxNQUFNLGlEQUFpRCxDQUFDOzs7O0FBR3pELG9GQUFvRjtBQUNwRixNQUFNLG1CQUFtQixHQUF3QjtJQUMvQztRQUNFLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO0tBQ2hCO0lBQ0Q7UUFDRSxPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFP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RSxtQkFBbUI7c0JBRHRCLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsd0NBQXdDLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQVNsRSxhQUFhO3NCQUEvQixNQUFNO2dCQUdZLGNBQWM7c0JBQWhDLE1BQU07Z0JBR1ksTUFBTTtzQkFBeEIsTUFBTTtnQkFHWSxNQUFNO3NCQUF4QixNQUFNO2dCQUdZLGNBQWM7c0JBQWhDLE1BQU07Z0JBR1ksbUJBQW1CO3NCQUFyQyxNQUFNOztBQW1PVCxvQkFBb0I7QUFDcEIsTUFBTSxVQUFVLHNEQUFzRCxDQUNwRSxPQUFnQjtJQUVoQixPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNyRCxDQUFDO0FBRUQsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxNQUFNLDhDQUE4QyxHQUFHO0lBQzVELE9BQU8sRUFBRSxxQ0FBcUM7SUFDOUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQ2YsVUFBVSxFQUFFLHNEQUFzRDtDQUNuRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtFU0NBUEUsIGhhc01vZGlmaWVyS2V5fSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBpbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtfZ2V0RXZlbnRUYXJnZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VXaGlsZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtPdmVybGF5fSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0IHtPdmVybGF5Q29uZmlnfSBmcm9tICcuL292ZXJsYXktY29uZmlnJztcbmltcG9ydCB7T3ZlcmxheVJlZn0gZnJvbSAnLi9vdmVybGF5LXJlZic7XG5pbXBvcnQge0Nvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZX0gZnJvbSAnLi9wb3NpdGlvbi9jb25uZWN0ZWQtcG9zaXRpb24nO1xuaW1wb3J0IHtcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5T3JpZ2luLFxufSBmcm9tICcuL3Bvc2l0aW9uL2ZsZXhpYmxlLWNvbm5lY3RlZC1wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQge1JlcG9zaXRpb25TY3JvbGxTdHJhdGVneSwgU2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vc2Nyb2xsL2luZGV4JztcblxuLyoqIERlZmF1bHQgc2V0IG9mIHBvc2l0aW9ucyBmb3IgdGhlIG92ZXJsYXkuIEZvbGxvd3MgdGhlIGJlaGF2aW9yIG9mIGEgZHJvcGRvd24uICovXG5jb25zdCBkZWZhdWx0UG9zaXRpb25MaXN0OiBDb25uZWN0ZWRQb3NpdGlvbltdID0gW1xuICB7XG4gICAgb3JpZ2luWDogJ3N0YXJ0JyxcbiAgICBvcmlnaW5ZOiAnYm90dG9tJyxcbiAgICBvdmVybGF5WDogJ3N0YXJ0JyxcbiAgICBvdmVybGF5WTogJ3RvcCcsXG4gIH0sXG4gIHtcbiAgICBvcmlnaW5YOiAnc3RhcnQnLFxuICAgIG9yaWdpblk6ICd0b3AnLFxuICAgIG92ZXJsYXlYOiAnc3RhcnQnLFxuICAgIG92ZXJsYXlZOiAnYm90dG9tJyxcbiAgfSxcbiAge1xuICAgIG9yaWdpblg6ICdlbmQnLFxuICAgIG9yaWdpblk6ICd0b3AnLFxuICAgIG92ZXJsYXlYOiAnZW5kJyxcbiAgICBvdmVybGF5WTogJ2JvdHRvbScsXG4gIH0sXG4gIHtcbiAgICBvcmlnaW5YOiAnZW5kJyxcbiAgICBvcmlnaW5ZOiAnYm90dG9tJyxcbiAgICBvdmVybGF5WDogJ2VuZCcsXG4gICAgb3ZlcmxheVk6ICd0b3AnLFxuICB9LFxuXTtcblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGRldGVybWluZXMgdGhlIHNjcm9sbCBoYW5kbGluZyB3aGlsZSB0aGUgY29ubmVjdGVkIG92ZXJsYXkgaXMgb3Blbi4gKi9cbmV4cG9ydCBjb25zdCBDREtfQ09OTkVDVEVEX09WRVJMQVlfU0NST0xMX1NUUkFURUdZID0gbmV3IEluamVjdGlvblRva2VuPCgpID0+IFNjcm9sbFN0cmF0ZWd5PihcbiAgJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheS1zY3JvbGwtc3RyYXRlZ3knLFxuICB7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IHtcbiAgICAgIGNvbnN0IG92ZXJsYXkgPSBpbmplY3QoT3ZlcmxheSk7XG4gICAgICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKTtcbiAgICB9LFxuICB9LFxuKTtcblxuLyoqXG4gKiBEaXJlY3RpdmUgYXBwbGllZCB0byBhbiBlbGVtZW50IHRvIG1ha2UgaXQgdXNhYmxlIGFzIGFuIG9yaWdpbiBmb3IgYW4gT3ZlcmxheSB1c2luZyBhXG4gKiBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrLW92ZXJsYXktb3JpZ2luXSwgW292ZXJsYXktb3JpZ2luXSwgW2Nka092ZXJsYXlPcmlnaW5dJyxcbiAgZXhwb3J0QXM6ICdjZGtPdmVybGF5T3JpZ2luJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrT3ZlcmxheU9yaWdpbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgb24gd2hpY2ggdGhlIGRpcmVjdGl2ZSBpcyBhcHBsaWVkLiAqL1xuICAgIHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICApIHt9XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHRvIGZhY2lsaXRhdGUgZGVjbGFyYXRpdmUgY3JlYXRpb24gb2YgYW5cbiAqIE92ZXJsYXkgdXNpbmcgYSBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGstY29ubmVjdGVkLW92ZXJsYXldLCBbY29ubmVjdGVkLW92ZXJsYXldLCBbY2RrQ29ubmVjdGVkT3ZlcmxheV0nLFxuICBleHBvcnRBczogJ2Nka0Nvbm5lY3RlZE92ZXJsYXknLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb25uZWN0ZWRPdmVybGF5IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkNoYW5nZXMge1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmO1xuICBwcml2YXRlIF90ZW1wbGF0ZVBvcnRhbDogVGVtcGxhdGVQb3J0YWw7XG4gIHByaXZhdGUgX2JhY2tkcm9wU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9hdHRhY2hTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX2RldGFjaFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfcG9zaXRpb25TdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX29mZnNldFg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfb2Zmc2V0WTogbnVtYmVyO1xuICBwcml2YXRlIF9wb3NpdGlvbjogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5O1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneUZhY3Rvcnk6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuICBwcml2YXRlIF9kaXNwb3NlT25OYXZpZ2F0aW9uID0gZmFsc2U7XG4gIHByaXZhdGUgX25nWm9uZSA9IGluamVjdChOZ1pvbmUpO1xuXG4gIC8qKiBPcmlnaW4gZm9yIHRoZSBjb25uZWN0ZWQgb3ZlcmxheS4gKi9cbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5T3JpZ2luJylcbiAgb3JpZ2luOiBDZGtPdmVybGF5T3JpZ2luIHwgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5T3JpZ2luO1xuXG4gIC8qKiBSZWdpc3RlcmVkIGNvbm5lY3RlZCBwb3NpdGlvbiBwYWlycy4gKi9cbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25zJykgcG9zaXRpb25zOiBDb25uZWN0ZWRQb3NpdGlvbltdO1xuXG4gIC8qKlxuICAgKiBUaGlzIGlucHV0IG92ZXJyaWRlcyB0aGUgcG9zaXRpb25zIGlucHV0IGlmIHNwZWNpZmllZC4gSXQgbGV0cyB1c2VycyBwYXNzXG4gICAqIGluIGFyYml0cmFyeSBwb3NpdGlvbmluZyBzdHJhdGVnaWVzLlxuICAgKi9cbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25TdHJhdGVneScpIHBvc2l0aW9uU3RyYXRlZ3k6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneTtcblxuICAvKiogVGhlIG9mZnNldCBpbiBwaXhlbHMgZm9yIHRoZSBvdmVybGF5IGNvbm5lY3Rpb24gcG9pbnQgb24gdGhlIHgtYXhpcyAqL1xuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlPZmZzZXRYJylcbiAgZ2V0IG9mZnNldFgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0WDtcbiAgfVxuICBzZXQgb2Zmc2V0WChvZmZzZXRYOiBudW1iZXIpIHtcbiAgICB0aGlzLl9vZmZzZXRYID0gb2Zmc2V0WDtcblxuICAgIGlmICh0aGlzLl9wb3NpdGlvbikge1xuICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb25TdHJhdGVneSh0aGlzLl9wb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBvZmZzZXQgaW4gcGl4ZWxzIGZvciB0aGUgb3ZlcmxheSBjb25uZWN0aW9uIHBvaW50IG9uIHRoZSB5LWF4aXMgKi9cbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5T2Zmc2V0WScpXG4gIGdldCBvZmZzZXRZKCkge1xuICAgIHJldHVybiB0aGlzLl9vZmZzZXRZO1xuICB9XG4gIHNldCBvZmZzZXRZKG9mZnNldFk6IG51bWJlcikge1xuICAgIHRoaXMuX29mZnNldFkgPSBvZmZzZXRZO1xuXG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHRoaXMuX3Bvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIHdpZHRoIG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlXaWR0aCcpIHdpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG5cbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIG92ZXJsYXkgcGFuZWwuICovXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheUhlaWdodCcpIGhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xuXG4gIC8qKiBUaGUgbWluIHdpZHRoIG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlNaW5XaWR0aCcpIG1pbldpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG5cbiAgLyoqIFRoZSBtaW4gaGVpZ2h0IG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlNaW5IZWlnaHQnKSBtaW5IZWlnaHQ6IG51bWJlciB8IHN0cmluZztcblxuICAvKiogVGhlIGN1c3RvbSBjbGFzcyB0byBiZSBzZXQgb24gdGhlIGJhY2tkcm9wIGVsZW1lbnQuICovXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheUJhY2tkcm9wQ2xhc3MnKSBiYWNrZHJvcENsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAvKiogVGhlIGN1c3RvbSBjbGFzcyB0byBhZGQgdG8gdGhlIG92ZXJsYXkgcGFuZSBlbGVtZW50LiAqL1xuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlQYW5lbENsYXNzJykgcGFuZWxDbGFzczogc3RyaW5nIHwgc3RyaW5nW107XG5cbiAgLyoqIE1hcmdpbiBiZXR3ZWVuIHRoZSBvdmVybGF5IGFuZCB0aGUgdmlld3BvcnQgZWRnZXMuICovXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVZpZXdwb3J0TWFyZ2luJykgdmlld3BvcnRNYXJnaW46IG51bWJlciA9IDA7XG5cbiAgLyoqIFN0cmF0ZWd5IHRvIGJlIHVzZWQgd2hlbiBoYW5kbGluZyBzY3JvbGwgZXZlbnRzIHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uICovXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVNjcm9sbFN0cmF0ZWd5Jykgc2Nyb2xsU3RyYXRlZ3k6IFNjcm9sbFN0cmF0ZWd5O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGlzIG9wZW4uICovXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheU9wZW4nKSBvcGVuOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG92ZXJsYXkgY2FuIGJlIGNsb3NlZCBieSB1c2VyIGludGVyYWN0aW9uLiAqL1xuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlEaXNhYmxlQ2xvc2UnKSBkaXNhYmxlQ2xvc2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogQ1NTIHNlbGVjdG9yIHdoaWNoIHRvIHNldCB0aGUgdHJhbnNmb3JtIG9yaWdpbi4gKi9cbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5VHJhbnNmb3JtT3JpZ2luT24nKSB0cmFuc2Zvcm1PcmlnaW5TZWxlY3Rvcjogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGUgb3ZlcmxheSBzaG91bGQgYXR0YWNoIGEgYmFja2Ryb3AuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtDb25uZWN0ZWRPdmVybGF5SGFzQmFja2Ryb3AnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBoYXNCYWNrZHJvcDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGUgb3ZlcmxheSBzaG91bGQgYmUgbG9ja2VkIHdoZW4gc2Nyb2xsaW5nLiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrQ29ubmVjdGVkT3ZlcmxheUxvY2tQb3NpdGlvbicsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGxvY2tQb3NpdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5J3Mgd2lkdGggYW5kIGhlaWdodCBjYW4gYmUgY29uc3RyYWluZWQgdG8gZml0IHdpdGhpbiB0aGUgdmlld3BvcnQuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtDb25uZWN0ZWRPdmVybGF5RmxleGlibGVEaW1lbnNpb25zJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZmxleGlibGVEaW1lbnNpb25zOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG92ZXJsYXkgY2FuIGdyb3cgYWZ0ZXIgdGhlIGluaXRpYWwgb3BlbiB3aGVuIGZsZXhpYmxlIHBvc2l0aW9uaW5nIGlzIHR1cm5lZCBvbi4gKi9cbiAgQElucHV0KHthbGlhczogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlHcm93QWZ0ZXJPcGVuJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ3Jvd0FmdGVyT3BlbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGNhbiBiZSBwdXNoZWQgb24tc2NyZWVuIGlmIG5vbmUgb2YgdGhlIHByb3ZpZGVkIHBvc2l0aW9ucyBmaXQuICovXG4gIEBJbnB1dCh7YWxpYXM6ICdjZGtDb25uZWN0ZWRPdmVybGF5UHVzaCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIHB1c2g6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgb3ZlcmxheSBzaG91bGQgYmUgZGlzcG9zZWQgb2Ygd2hlbiB0aGUgdXNlciBnb2VzIGJhY2t3YXJkcy9mb3J3YXJkcyBpbiBoaXN0b3J5LiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrQ29ubmVjdGVkT3ZlcmxheURpc3Bvc2VPbk5hdmlnYXRpb24nLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBnZXQgZGlzcG9zZU9uTmF2aWdhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzcG9zZU9uTmF2aWdhdGlvbjtcbiAgfVxuICBzZXQgZGlzcG9zZU9uTmF2aWdhdGlvbih2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc3Bvc2VPbk5hdmlnYXRpb24gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIGJhY2tkcm9wIGlzIGNsaWNrZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBiYWNrZHJvcENsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHBvc2l0aW9uIGhhcyBjaGFuZ2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgcG9zaXRpb25DaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZT4oKTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBvdmVybGF5IGhhcyBiZWVuIGF0dGFjaGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgYXR0YWNoID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG92ZXJsYXkgaGFzIGJlZW4gZGV0YWNoZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkZXRhY2ggPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlcmUgYXJlIGtleWJvYXJkIGV2ZW50cyB0aGF0IGFyZSB0YXJnZXRlZCBhdCB0aGUgb3ZlcmxheS4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG92ZXJsYXlLZXlkb3duID0gbmV3IEV2ZW50RW1pdHRlcjxLZXlib2FyZEV2ZW50PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZXJlIGFyZSBtb3VzZSBvdXRzaWRlIGNsaWNrIGV2ZW50cyB0aGF0IGFyZSB0YXJnZXRlZCBhdCB0aGUgb3ZlcmxheS4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG92ZXJsYXlPdXRzaWRlQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XG5cbiAgLy8gVE9ETyhqZWxib3Vybik6IGlucHV0cyBmb3Igc2l6ZSwgc2Nyb2xsIGJlaGF2aW9yLCBhbmltYXRpb24sIGV0Yy5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChDREtfQ09OTkVDVEVEX09WRVJMQVlfU0NST0xMX1NUUkFURUdZKSBzY3JvbGxTdHJhdGVneUZhY3Rvcnk6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI6IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICB0aGlzLl90ZW1wbGF0ZVBvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0ZW1wbGF0ZVJlZiwgdmlld0NvbnRhaW5lclJlZik7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3lGYWN0b3J5ID0gc2Nyb2xsU3RyYXRlZ3lGYWN0b3J5O1xuICAgIHRoaXMuc2Nyb2xsU3RyYXRlZ3kgPSB0aGlzLl9zY3JvbGxTdHJhdGVneUZhY3RvcnkoKTtcbiAgfVxuXG4gIC8qKiBUaGUgYXNzb2NpYXRlZCBvdmVybGF5IHJlZmVyZW5jZS4gKi9cbiAgZ2V0IG92ZXJsYXlSZWYoKTogT3ZlcmxheVJlZiB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWY7XG4gIH1cblxuICAvKiogVGhlIGVsZW1lbnQncyBsYXlvdXQgZGlyZWN0aW9uLiAqL1xuICBnZXQgZGlyKCk6IERpcmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpciA/IHRoaXMuX2Rpci52YWx1ZSA6ICdsdHInO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fYXR0YWNoU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fZGV0YWNoU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fYmFja2Ryb3BTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9wb3NpdGlvblN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAodGhpcy5fcG9zaXRpb24pIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uU3RyYXRlZ3kodGhpcy5fcG9zaXRpb24pO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVTaXplKHtcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIG1pbldpZHRoOiB0aGlzLm1pbldpZHRoLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICBtaW5IZWlnaHQ6IHRoaXMubWluSGVpZ2h0LFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChjaGFuZ2VzWydvcmlnaW4nXSAmJiB0aGlzLm9wZW4pIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24uYXBwbHkoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1snb3BlbiddKSB7XG4gICAgICB0aGlzLm9wZW4gPyB0aGlzLl9hdHRhY2hPdmVybGF5KCkgOiB0aGlzLl9kZXRhY2hPdmVybGF5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENyZWF0ZXMgYW4gb3ZlcmxheSAqL1xuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KCkge1xuICAgIGlmICghdGhpcy5wb3NpdGlvbnMgfHwgIXRoaXMucG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgdGhpcy5wb3NpdGlvbnMgPSBkZWZhdWx0UG9zaXRpb25MaXN0O1xuICAgIH1cblxuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSAodGhpcy5fb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2J1aWxkQ29uZmlnKCkpKTtcbiAgICB0aGlzLl9hdHRhY2hTdWJzY3JpcHRpb24gPSBvdmVybGF5UmVmLmF0dGFjaG1lbnRzKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuYXR0YWNoLmVtaXQoKSk7XG4gICAgdGhpcy5fZGV0YWNoU3Vic2NyaXB0aW9uID0gb3ZlcmxheVJlZi5kZXRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmRldGFjaC5lbWl0KCkpO1xuICAgIG92ZXJsYXlSZWYua2V5ZG93bkV2ZW50cygpLnN1YnNjcmliZSgoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIHRoaXMub3ZlcmxheUtleWRvd24ubmV4dChldmVudCk7XG5cbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBFU0NBUEUgJiYgIXRoaXMuZGlzYWJsZUNsb3NlICYmICFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5fZGV0YWNoT3ZlcmxheSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fb3ZlcmxheVJlZi5vdXRzaWRlUG9pbnRlckV2ZW50cygpLnN1YnNjcmliZSgoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMuX2dldE9yaWdpbkVsZW1lbnQoKTtcbiAgICAgIGNvbnN0IHRhcmdldCA9IF9nZXRFdmVudFRhcmdldChldmVudCkgYXMgRWxlbWVudCB8IG51bGw7XG5cbiAgICAgIGlmICghb3JpZ2luIHx8IChvcmlnaW4gIT09IHRhcmdldCAmJiAhb3JpZ2luLmNvbnRhaW5zKHRhcmdldCkpKSB7XG4gICAgICAgIHRoaXMub3ZlcmxheU91dHNpZGVDbGljay5uZXh0KGV2ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBCdWlsZHMgdGhlIG92ZXJsYXkgY29uZmlnIGJhc2VkIG9uIHRoZSBkaXJlY3RpdmUncyBpbnB1dHMgKi9cbiAgcHJpdmF0ZSBfYnVpbGRDb25maWcoKTogT3ZlcmxheUNvbmZpZyB7XG4gICAgY29uc3QgcG9zaXRpb25TdHJhdGVneSA9ICh0aGlzLl9wb3NpdGlvbiA9XG4gICAgICB0aGlzLnBvc2l0aW9uU3RyYXRlZ3kgfHwgdGhpcy5fY3JlYXRlUG9zaXRpb25TdHJhdGVneSgpKTtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXIsXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuc2Nyb2xsU3RyYXRlZ3ksXG4gICAgICBoYXNCYWNrZHJvcDogdGhpcy5oYXNCYWNrZHJvcCxcbiAgICAgIGRpc3Bvc2VPbk5hdmlnYXRpb246IHRoaXMuZGlzcG9zZU9uTmF2aWdhdGlvbixcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLndpZHRoIHx8IHRoaXMud2lkdGggPT09IDApIHtcbiAgICAgIG92ZXJsYXlDb25maWcud2lkdGggPSB0aGlzLndpZHRoO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhlaWdodCB8fCB0aGlzLmhlaWdodCA9PT0gMCkge1xuICAgICAgb3ZlcmxheUNvbmZpZy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5taW5XaWR0aCB8fCB0aGlzLm1pbldpZHRoID09PSAwKSB7XG4gICAgICBvdmVybGF5Q29uZmlnLm1pbldpZHRoID0gdGhpcy5taW5XaWR0aDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5taW5IZWlnaHQgfHwgdGhpcy5taW5IZWlnaHQgPT09IDApIHtcbiAgICAgIG92ZXJsYXlDb25maWcubWluSGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYmFja2Ryb3BDbGFzcykge1xuICAgICAgb3ZlcmxheUNvbmZpZy5iYWNrZHJvcENsYXNzID0gdGhpcy5iYWNrZHJvcENsYXNzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhbmVsQ2xhc3MpIHtcbiAgICAgIG92ZXJsYXlDb25maWcucGFuZWxDbGFzcyA9IHRoaXMucGFuZWxDbGFzcztcbiAgICB9XG5cbiAgICByZXR1cm4gb3ZlcmxheUNvbmZpZztcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzdGF0ZSBvZiBhIHBvc2l0aW9uIHN0cmF0ZWd5LCBiYXNlZCBvbiB0aGUgdmFsdWVzIG9mIHRoZSBkaXJlY3RpdmUgaW5wdXRzLiAqL1xuICBwcml2YXRlIF91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHBvc2l0aW9uU3RyYXRlZ3k6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSkge1xuICAgIGNvbnN0IHBvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXSA9IHRoaXMucG9zaXRpb25zLm1hcChjdXJyZW50UG9zaXRpb24gPT4gKHtcbiAgICAgIG9yaWdpblg6IGN1cnJlbnRQb3NpdGlvbi5vcmlnaW5YLFxuICAgICAgb3JpZ2luWTogY3VycmVudFBvc2l0aW9uLm9yaWdpblksXG4gICAgICBvdmVybGF5WDogY3VycmVudFBvc2l0aW9uLm92ZXJsYXlYLFxuICAgICAgb3ZlcmxheVk6IGN1cnJlbnRQb3NpdGlvbi5vdmVybGF5WSxcbiAgICAgIG9mZnNldFg6IGN1cnJlbnRQb3NpdGlvbi5vZmZzZXRYIHx8IHRoaXMub2Zmc2V0WCxcbiAgICAgIG9mZnNldFk6IGN1cnJlbnRQb3NpdGlvbi5vZmZzZXRZIHx8IHRoaXMub2Zmc2V0WSxcbiAgICAgIHBhbmVsQ2xhc3M6IGN1cnJlbnRQb3NpdGlvbi5wYW5lbENsYXNzIHx8IHVuZGVmaW5lZCxcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gcG9zaXRpb25TdHJhdGVneVxuICAgICAgLnNldE9yaWdpbih0aGlzLl9nZXRPcmlnaW4oKSlcbiAgICAgIC53aXRoUG9zaXRpb25zKHBvc2l0aW9ucylcbiAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKHRoaXMuZmxleGlibGVEaW1lbnNpb25zKVxuICAgICAgLndpdGhQdXNoKHRoaXMucHVzaClcbiAgICAgIC53aXRoR3Jvd0FmdGVyT3Blbih0aGlzLmdyb3dBZnRlck9wZW4pXG4gICAgICAud2l0aFZpZXdwb3J0TWFyZ2luKHRoaXMudmlld3BvcnRNYXJnaW4pXG4gICAgICAud2l0aExvY2tlZFBvc2l0aW9uKHRoaXMubG9ja1Bvc2l0aW9uKVxuICAgICAgLndpdGhUcmFuc2Zvcm1PcmlnaW5Pbih0aGlzLnRyYW5zZm9ybU9yaWdpblNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBzdHJhdGVneSBvZiB0aGUgb3ZlcmxheSB0byBiZSBzZXQgb24gdGhlIG92ZXJsYXkgY29uZmlnICovXG4gIHByaXZhdGUgX2NyZWF0ZVBvc2l0aW9uU3RyYXRlZ3koKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuX292ZXJsYXkucG9zaXRpb24oKS5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2dldE9yaWdpbigpKTtcbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHN0cmF0ZWd5KTtcbiAgICByZXR1cm4gc3RyYXRlZ3k7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPcmlnaW4oKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5T3JpZ2luIHtcbiAgICBpZiAodGhpcy5vcmlnaW4gaW5zdGFuY2VvZiBDZGtPdmVybGF5T3JpZ2luKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcmlnaW4uZWxlbWVudFJlZjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMub3JpZ2luO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldE9yaWdpbkVsZW1lbnQoKTogRWxlbWVudCB8IG51bGwge1xuICAgIGlmICh0aGlzLm9yaWdpbiBpbnN0YW5jZW9mIENka092ZXJsYXlPcmlnaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLm9yaWdpbi5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3JpZ2luIGluc3RhbmNlb2YgRWxlbWVudFJlZikge1xuICAgICAgcmV0dXJuIHRoaXMub3JpZ2luLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLm9yaWdpbiBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLm9yaWdpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBBdHRhY2hlcyB0aGUgb3ZlcmxheSBhbmQgc3Vic2NyaWJlcyB0byBiYWNrZHJvcCBjbGlja3MgaWYgYmFja2Ryb3AgZXhpc3RzICovXG4gIHByaXZhdGUgX2F0dGFjaE92ZXJsYXkoKSB7XG4gICAgaWYgKCF0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9jcmVhdGVPdmVybGF5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgb3ZlcmxheSBzaXplLCBpbiBjYXNlIHRoZSBkaXJlY3RpdmUncyBpbnB1dHMgaGF2ZSBjaGFuZ2VkXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLmhhc0JhY2tkcm9wID0gdGhpcy5oYXNCYWNrZHJvcDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fdGVtcGxhdGVQb3J0YWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc0JhY2tkcm9wKSB7XG4gICAgICB0aGlzLl9iYWNrZHJvcFN1YnNjcmlwdGlvbiA9IHRoaXMuX292ZXJsYXlSZWYuYmFja2Ryb3BDbGljaygpLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIHRoaXMuYmFja2Ryb3BDbGljay5lbWl0KGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9iYWNrZHJvcFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX3Bvc2l0aW9uU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cbiAgICAvLyBPbmx5IHN1YnNjcmliZSB0byBgcG9zaXRpb25DaGFuZ2VzYCBpZiByZXF1ZXN0ZWQsIGJlY2F1c2UgcHV0dGluZ1xuICAgIC8vIHRvZ2V0aGVyIGFsbCB0aGUgaW5mb3JtYXRpb24gZm9yIGl0IGNhbiBiZSBleHBlbnNpdmUuXG4gICAgaWYgKHRoaXMucG9zaXRpb25DaGFuZ2Uub2JzZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3Bvc2l0aW9uU3Vic2NyaXB0aW9uID0gdGhpcy5fcG9zaXRpb24ucG9zaXRpb25DaGFuZ2VzXG4gICAgICAgIC5waXBlKHRha2VXaGlsZSgoKSA9PiB0aGlzLnBvc2l0aW9uQ2hhbmdlLm9ic2VydmVycy5sZW5ndGggPiAwKSlcbiAgICAgICAgLnN1YnNjcmliZShwb3NpdGlvbiA9PiB7XG4gICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLnBvc2l0aW9uQ2hhbmdlLmVtaXQocG9zaXRpb24pKTtcblxuICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uQ2hhbmdlLm9ic2VydmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhlIG92ZXJsYXkgYW5kIHVuc3Vic2NyaWJlcyB0byBiYWNrZHJvcCBjbGlja3MgaWYgYmFja2Ryb3AgZXhpc3RzICovXG4gIHByaXZhdGUgX2RldGFjaE92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fYmFja2Ryb3BTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9wb3NpdGlvblN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUl9GQUNUT1JZKFxuICBvdmVybGF5OiBPdmVybGF5LFxuKTogKCkgPT4gUmVwb3NpdGlvblNjcm9sbFN0cmF0ZWd5IHtcbiAgcmV0dXJuICgpID0+IG92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCk7XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgY29uc3QgQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWSxcbiAgZGVwczogW092ZXJsYXldLFxuICB1c2VGYWN0b3J5OiBDREtfQ09OTkVDVEVEX09WRVJMQVlfU0NST0xMX1NUUkFURUdZX1BST1ZJREVSX0ZBQ1RPUlksXG59O1xuIl19