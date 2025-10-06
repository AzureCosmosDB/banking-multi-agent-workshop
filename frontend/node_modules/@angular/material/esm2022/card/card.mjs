/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Directive, Inject, InjectionToken, Input, Optional, ViewEncapsulation, } from '@angular/core';
import * as i0 from "@angular/core";
/** Injection token that can be used to provide the default options the card module. */
export const MAT_CARD_CONFIG = new InjectionToken('MAT_CARD_CONFIG');
/**
 * Material Design card component. Cards contain content and actions about a single subject.
 * See https://material.io/design/components/cards.html
 *
 * MatCard provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCard {
    constructor(config) {
        this.appearance = config?.appearance || 'raised';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCard, deps: [{ token: MAT_CARD_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCard, isStandalone: true, selector: "mat-card", inputs: { appearance: "appearance" }, host: { properties: { "class.mat-mdc-card-outlined": "appearance === \"outlined\"", "class.mdc-card--outlined": "appearance === \"outlined\"" }, classAttribute: "mat-mdc-card mdc-card" }, exportAs: ["matCard"], ngImport: i0, template: "<ng-content></ng-content>\n", styles: [".mat-mdc-card{display:flex;flex-direction:column;box-sizing:border-box;position:relative;border-style:solid;border-width:0;background-color:var(--mdc-elevated-card-container-color, var(--mat-app-surface-container-low));border-color:var(--mdc-elevated-card-container-color, var(--mat-app-surface-container-low));border-radius:var(--mdc-elevated-card-container-shape, var(--mat-app-corner-medium));box-shadow:var(--mdc-elevated-card-container-elevation, var(--mat-app-level1))}.mat-mdc-card::after{position:absolute;top:0;left:0;width:100%;height:100%;border:solid 1px rgba(0,0,0,0);content:\"\";display:block;pointer-events:none;box-sizing:border-box;border-radius:var(--mdc-elevated-card-container-shape, var(--mat-app-corner-medium))}.mat-mdc-card-outlined{background-color:var(--mdc-outlined-card-container-color, var(--mat-app-surface));border-radius:var(--mdc-outlined-card-container-shape, var(--mat-app-corner-medium));border-width:var(--mdc-outlined-card-outline-width);border-color:var(--mdc-outlined-card-outline-color, var(--mat-app-outline-variant));box-shadow:var(--mdc-outlined-card-container-elevation, var(--mat-app-level0))}.mat-mdc-card-outlined::after{border:none}.mdc-card__media{position:relative;box-sizing:border-box;background-repeat:no-repeat;background-position:center;background-size:cover}.mdc-card__media::before{display:block;content:\"\"}.mdc-card__media:first-child{border-top-left-radius:inherit;border-top-right-radius:inherit}.mdc-card__media:last-child{border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}.mat-mdc-card-actions{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;min-height:52px;padding:8px}.mat-mdc-card-title{font-family:var(--mat-card-title-text-font, var(--mat-app-title-large-font));line-height:var(--mat-card-title-text-line-height, var(--mat-app-title-large-line-height));font-size:var(--mat-card-title-text-size, var(--mat-app-title-large-size));letter-spacing:var(--mat-card-title-text-tracking, var(--mat-app-title-large-tracking));font-weight:var(--mat-card-title-text-weight, var(--mat-app-title-large-weight))}.mat-mdc-card-subtitle{color:var(--mat-card-subtitle-text-color, var(--mat-app-on-surface));font-family:var(--mat-card-subtitle-text-font, var(--mat-app-title-medium-font));line-height:var(--mat-card-subtitle-text-line-height, var(--mat-app-title-medium-line-height));font-size:var(--mat-card-subtitle-text-size, var(--mat-app-title-medium-size));letter-spacing:var(--mat-card-subtitle-text-tracking, var(--mat-app-title-medium-tracking));font-weight:var(--mat-card-subtitle-text-weight, var(--mat-app-title-medium-weight))}.mat-mdc-card-title,.mat-mdc-card-subtitle{display:block;margin:0}.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-title,.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-subtitle{padding:16px 16px 0}.mat-mdc-card-header{display:flex;padding:16px 16px 0}.mat-mdc-card-content{display:block;padding:0 16px}.mat-mdc-card-content:first-child{padding-top:16px}.mat-mdc-card-content:last-child{padding-bottom:16px}.mat-mdc-card-title-group{display:flex;justify-content:space-between;width:100%}.mat-mdc-card-avatar{height:40px;width:40px;border-radius:50%;flex-shrink:0;margin-bottom:16px;object-fit:cover}.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-subtitle,.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-title{line-height:normal}.mat-mdc-card-sm-image{width:80px;height:80px}.mat-mdc-card-md-image{width:112px;height:112px}.mat-mdc-card-lg-image{width:152px;height:152px}.mat-mdc-card-xl-image{width:240px;height:240px}.mat-mdc-card-subtitle~.mat-mdc-card-title,.mat-mdc-card-title~.mat-mdc-card-subtitle,.mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-title,.mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-subtitle,.mat-mdc-card-title-group .mat-mdc-card-title,.mat-mdc-card-title-group .mat-mdc-card-subtitle{padding-top:0}.mat-mdc-card-content>:last-child:not(.mat-mdc-card-footer){margin-bottom:0}.mat-mdc-card-actions-align-end{justify-content:flex-end}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCard, decorators: [{
            type: Component,
            args: [{ selector: 'mat-card', host: {
                        'class': 'mat-mdc-card mdc-card',
                        '[class.mat-mdc-card-outlined]': 'appearance === "outlined"',
                        '[class.mdc-card--outlined]': 'appearance === "outlined"',
                    }, exportAs: 'matCard', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, template: "<ng-content></ng-content>\n", styles: [".mat-mdc-card{display:flex;flex-direction:column;box-sizing:border-box;position:relative;border-style:solid;border-width:0;background-color:var(--mdc-elevated-card-container-color, var(--mat-app-surface-container-low));border-color:var(--mdc-elevated-card-container-color, var(--mat-app-surface-container-low));border-radius:var(--mdc-elevated-card-container-shape, var(--mat-app-corner-medium));box-shadow:var(--mdc-elevated-card-container-elevation, var(--mat-app-level1))}.mat-mdc-card::after{position:absolute;top:0;left:0;width:100%;height:100%;border:solid 1px rgba(0,0,0,0);content:\"\";display:block;pointer-events:none;box-sizing:border-box;border-radius:var(--mdc-elevated-card-container-shape, var(--mat-app-corner-medium))}.mat-mdc-card-outlined{background-color:var(--mdc-outlined-card-container-color, var(--mat-app-surface));border-radius:var(--mdc-outlined-card-container-shape, var(--mat-app-corner-medium));border-width:var(--mdc-outlined-card-outline-width);border-color:var(--mdc-outlined-card-outline-color, var(--mat-app-outline-variant));box-shadow:var(--mdc-outlined-card-container-elevation, var(--mat-app-level0))}.mat-mdc-card-outlined::after{border:none}.mdc-card__media{position:relative;box-sizing:border-box;background-repeat:no-repeat;background-position:center;background-size:cover}.mdc-card__media::before{display:block;content:\"\"}.mdc-card__media:first-child{border-top-left-radius:inherit;border-top-right-radius:inherit}.mdc-card__media:last-child{border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}.mat-mdc-card-actions{display:flex;flex-direction:row;align-items:center;box-sizing:border-box;min-height:52px;padding:8px}.mat-mdc-card-title{font-family:var(--mat-card-title-text-font, var(--mat-app-title-large-font));line-height:var(--mat-card-title-text-line-height, var(--mat-app-title-large-line-height));font-size:var(--mat-card-title-text-size, var(--mat-app-title-large-size));letter-spacing:var(--mat-card-title-text-tracking, var(--mat-app-title-large-tracking));font-weight:var(--mat-card-title-text-weight, var(--mat-app-title-large-weight))}.mat-mdc-card-subtitle{color:var(--mat-card-subtitle-text-color, var(--mat-app-on-surface));font-family:var(--mat-card-subtitle-text-font, var(--mat-app-title-medium-font));line-height:var(--mat-card-subtitle-text-line-height, var(--mat-app-title-medium-line-height));font-size:var(--mat-card-subtitle-text-size, var(--mat-app-title-medium-size));letter-spacing:var(--mat-card-subtitle-text-tracking, var(--mat-app-title-medium-tracking));font-weight:var(--mat-card-subtitle-text-weight, var(--mat-app-title-medium-weight))}.mat-mdc-card-title,.mat-mdc-card-subtitle{display:block;margin:0}.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-title,.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-subtitle{padding:16px 16px 0}.mat-mdc-card-header{display:flex;padding:16px 16px 0}.mat-mdc-card-content{display:block;padding:0 16px}.mat-mdc-card-content:first-child{padding-top:16px}.mat-mdc-card-content:last-child{padding-bottom:16px}.mat-mdc-card-title-group{display:flex;justify-content:space-between;width:100%}.mat-mdc-card-avatar{height:40px;width:40px;border-radius:50%;flex-shrink:0;margin-bottom:16px;object-fit:cover}.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-subtitle,.mat-mdc-card-avatar~.mat-mdc-card-header-text .mat-mdc-card-title{line-height:normal}.mat-mdc-card-sm-image{width:80px;height:80px}.mat-mdc-card-md-image{width:112px;height:112px}.mat-mdc-card-lg-image{width:152px;height:152px}.mat-mdc-card-xl-image{width:240px;height:240px}.mat-mdc-card-subtitle~.mat-mdc-card-title,.mat-mdc-card-title~.mat-mdc-card-subtitle,.mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-title,.mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-subtitle,.mat-mdc-card-title-group .mat-mdc-card-title,.mat-mdc-card-title-group .mat-mdc-card-subtitle{padding-top:0}.mat-mdc-card-content>:last-child:not(.mat-mdc-card-footer){margin-bottom:0}.mat-mdc-card-actions-align-end{justify-content:flex-end}"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_CARD_CONFIG]
                }, {
                    type: Optional
                }] }], propDecorators: { appearance: [{
                type: Input
            }] } });
// TODO(jelbourn): add `MatActionCard`, which is a card that acts like a button (and has a ripple).
// Supported in MDC with `.mdc-card__primary-action`. Will require additional a11y docs for users.
/**
 * Title of a card, intended for use within `<mat-card>`. This component is an optional
 * convenience for one variety of card title; any custom title element may be used in its place.
 *
 * MatCardTitle provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardTitle {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardTitle, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardTitle, isStandalone: true, selector: "mat-card-title, [mat-card-title], [matCardTitle]", host: { classAttribute: "mat-mdc-card-title" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardTitle, decorators: [{
            type: Directive,
            args: [{
                    selector: `mat-card-title, [mat-card-title], [matCardTitle]`,
                    host: { 'class': 'mat-mdc-card-title' },
                    standalone: true,
                }]
        }] });
/**
 * Container intended to be used within the `<mat-card>` component. Can contain exactly one
 * `<mat-card-title>`, one `<mat-card-subtitle>` and one content image of any size
 * (e.g. `<img matCardLgImage>`).
 */
export class MatCardTitleGroup {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardTitleGroup, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardTitleGroup, isStandalone: true, selector: "mat-card-title-group", host: { classAttribute: "mat-mdc-card-title-group" }, ngImport: i0, template: "<div>\n  <ng-content\n      select=\"mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]\"></ng-content>\n</div>\n<ng-content select=\"[mat-card-image], [matCardImage],\n                    [mat-card-sm-image], [matCardImageSmall],\n                    [mat-card-md-image], [matCardImageMedium],\n                    [mat-card-lg-image], [matCardImageLarge],\n                    [mat-card-xl-image], [matCardImageXLarge]\"></ng-content>\n<ng-content></ng-content>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardTitleGroup, decorators: [{
            type: Component,
            args: [{ selector: 'mat-card-title-group', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, host: { 'class': 'mat-mdc-card-title-group' }, standalone: true, template: "<div>\n  <ng-content\n      select=\"mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]\"></ng-content>\n</div>\n<ng-content select=\"[mat-card-image], [matCardImage],\n                    [mat-card-sm-image], [matCardImageSmall],\n                    [mat-card-md-image], [matCardImageMedium],\n                    [mat-card-lg-image], [matCardImageLarge],\n                    [mat-card-xl-image], [matCardImageXLarge]\"></ng-content>\n<ng-content></ng-content>\n" }]
        }] });
/**
 * Content of a card, intended for use within `<mat-card>`. This component is an optional
 * convenience for use with other convenience elements, such as `<mat-card-title>`; any custom
 * content block element may be used in its place.
 *
 * MatCardContent provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardContent {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardContent, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardContent, isStandalone: true, selector: "mat-card-content", host: { classAttribute: "mat-mdc-card-content" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-card-content',
                    host: { 'class': 'mat-mdc-card-content' },
                    standalone: true,
                }]
        }] });
/**
 * Sub-title of a card, intended for use within `<mat-card>` beneath a `<mat-card-title>`. This
 * component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-title>`.
 *
 * MatCardSubtitle provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardSubtitle {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardSubtitle, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardSubtitle, isStandalone: true, selector: "mat-card-subtitle, [mat-card-subtitle], [matCardSubtitle]", host: { classAttribute: "mat-mdc-card-subtitle" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardSubtitle, decorators: [{
            type: Directive,
            args: [{
                    selector: `mat-card-subtitle, [mat-card-subtitle], [matCardSubtitle]`,
                    host: { 'class': 'mat-mdc-card-subtitle' },
                    standalone: true,
                }]
        }] });
/**
 * Bottom area of a card that contains action buttons, intended for use within `<mat-card>`.
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-content>`; any custom action block element may be used in its place.
 *
 * MatCardActions provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardActions {
    constructor() {
        // TODO(jelbourn): deprecate `align` in favor of `actionPosition` or `actionAlignment`
        // as to not conflict with the native `align` attribute.
        /** Position of the actions inside the card. */
        this.align = 'start';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardActions, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardActions, isStandalone: true, selector: "mat-card-actions", inputs: { align: "align" }, host: { properties: { "class.mat-mdc-card-actions-align-end": "align === \"end\"" }, classAttribute: "mat-mdc-card-actions mdc-card__actions" }, exportAs: ["matCardActions"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardActions, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-card-actions',
                    exportAs: 'matCardActions',
                    host: {
                        'class': 'mat-mdc-card-actions mdc-card__actions',
                        '[class.mat-mdc-card-actions-align-end]': 'align === "end"',
                    },
                    standalone: true,
                }]
        }], propDecorators: { align: [{
                type: Input
            }] } });
/**
 * Header region of a card, intended for use within `<mat-card>`. This header captures
 * a card title, subtitle, and avatar.  This component is an optional convenience for use with
 * other convenience elements, such as `<mat-card-footer>`; any custom header block element may be
 * used in its place.
 *
 * MatCardHeader provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardHeader {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardHeader, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardHeader, isStandalone: true, selector: "mat-card-header", host: { classAttribute: "mat-mdc-card-header" }, ngImport: i0, template: "<ng-content select=\"[mat-card-avatar], [matCardAvatar]\"></ng-content>\n<div class=\"mat-mdc-card-header-text\">\n  <ng-content\n      select=\"mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]\"></ng-content>\n</div>\n<ng-content></ng-content>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardHeader, decorators: [{
            type: Component,
            args: [{ selector: 'mat-card-header', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, host: { 'class': 'mat-mdc-card-header' }, standalone: true, template: "<ng-content select=\"[mat-card-avatar], [matCardAvatar]\"></ng-content>\n<div class=\"mat-mdc-card-header-text\">\n  <ng-content\n      select=\"mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]\"></ng-content>\n</div>\n<ng-content></ng-content>\n" }]
        }] });
/**
 * Footer area a card, intended for use within `<mat-card>`.
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-content>`; any custom footer block element may be used in its place.
 *
 * MatCardFooter provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardFooter {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardFooter, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardFooter, isStandalone: true, selector: "mat-card-footer", host: { classAttribute: "mat-mdc-card-footer" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardFooter, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-card-footer',
                    host: { 'class': 'mat-mdc-card-footer' },
                    standalone: true,
                }]
        }] });
// TODO(jelbourn): deprecate the "image" selectors to replace with "media".
// TODO(jelbourn): support `.mdc-card__media-content`.
/**
 * Primary image content for a card, intended for use within `<mat-card>`. Can be applied to
 * any media element, such as `<img>` or `<picture>`.
 *
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-content>`; any custom media element may be used in its place.
 *
 * MatCardImage provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardImage {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardImage, isStandalone: true, selector: "[mat-card-image], [matCardImage]", host: { classAttribute: "mat-mdc-card-image mdc-card__media" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardImage, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-card-image], [matCardImage]',
                    host: { 'class': 'mat-mdc-card-image mdc-card__media' },
                    standalone: true,
                }]
        }] });
/** Same as `MatCardImage`, but small. */
export class MatCardSmImage {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardSmImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardSmImage, isStandalone: true, selector: "[mat-card-sm-image], [matCardImageSmall]", host: { classAttribute: "mat-mdc-card-sm-image mdc-card__media" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardSmImage, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-card-sm-image], [matCardImageSmall]',
                    host: { 'class': 'mat-mdc-card-sm-image mdc-card__media' },
                    standalone: true,
                }]
        }] });
/** Same as `MatCardImage`, but medium. */
export class MatCardMdImage {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardMdImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardMdImage, isStandalone: true, selector: "[mat-card-md-image], [matCardImageMedium]", host: { classAttribute: "mat-mdc-card-md-image mdc-card__media" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardMdImage, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-card-md-image], [matCardImageMedium]',
                    host: { 'class': 'mat-mdc-card-md-image mdc-card__media' },
                    standalone: true,
                }]
        }] });
/** Same as `MatCardImage`, but large. */
export class MatCardLgImage {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardLgImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardLgImage, isStandalone: true, selector: "[mat-card-lg-image], [matCardImageLarge]", host: { classAttribute: "mat-mdc-card-lg-image mdc-card__media" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardLgImage, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-card-lg-image], [matCardImageLarge]',
                    host: { 'class': 'mat-mdc-card-lg-image mdc-card__media' },
                    standalone: true,
                }]
        }] });
/** Same as `MatCardImage`, but extra-large. */
export class MatCardXlImage {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardXlImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardXlImage, isStandalone: true, selector: "[mat-card-xl-image], [matCardImageXLarge]", host: { classAttribute: "mat-mdc-card-xl-image mdc-card__media" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardXlImage, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-card-xl-image], [matCardImageXLarge]',
                    host: { 'class': 'mat-mdc-card-xl-image mdc-card__media' },
                    standalone: true,
                }]
        }] });
/**
 * Avatar image content for a card, intended for use within `<mat-card>`. Can be applied to
 * any media element, such as `<img>` or `<picture>`.
 *
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-title>`; any custom media element may be used in its place.
 *
 * MatCardAvatar provides no behaviors, instead serving as a purely visual treatment.
 */
export class MatCardAvatar {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardAvatar, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.0-next.2", type: MatCardAvatar, isStandalone: true, selector: "[mat-card-avatar], [matCardAvatar]", host: { classAttribute: "mat-mdc-card-avatar" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: MatCardAvatar, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mat-card-avatar], [matCardAvatar]',
                    host: { 'class': 'mat-mdc-card-avatar' },
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jYXJkL2NhcmQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2FyZC9jYXJkLmh0bWwiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2FyZC9jYXJkLXRpdGxlLWdyb3VwLmh0bWwiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvY2FyZC9jYXJkLWhlYWRlci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFNBQVMsRUFDVCxNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFDTCxRQUFRLEVBQ1IsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDOztBQVV2Qix1RkFBdUY7QUFDdkYsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLElBQUksY0FBYyxDQUFnQixpQkFBaUIsQ0FBQyxDQUFDO0FBRXBGOzs7OztHQUtHO0FBZUgsTUFBTSxPQUFPLE9BQU87SUFHbEIsWUFBaUQsTUFBc0I7UUFDckUsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLEVBQUUsVUFBVSxJQUFJLFFBQVEsQ0FBQztJQUNuRCxDQUFDO3FIQUxVLE9BQU8sa0JBR0UsZUFBZTt5R0FIeEIsT0FBTyw2VENsRHBCLDZCQUNBOztrR0RpRGEsT0FBTztrQkFkbkIsU0FBUzsrQkFDRSxVQUFVLFFBR2Q7d0JBQ0osT0FBTyxFQUFFLHVCQUF1Qjt3QkFDaEMsK0JBQStCLEVBQUUsMkJBQTJCO3dCQUM1RCw0QkFBNEIsRUFBRSwyQkFBMkI7cUJBQzFELFlBQ1MsU0FBUyxpQkFDSixpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNLGNBQ25DLElBQUk7OzBCQUtILE1BQU07MkJBQUMsZUFBZTs7MEJBQUcsUUFBUTt5Q0FGckMs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aWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBPcHRpb25hbCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgdHlwZSBNYXRDYXJkQXBwZWFyYW5jZSA9ICdvdXRsaW5lZCcgfCAncmFpc2VkJztcblxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciB0aGUgY2FyZCBtb2R1bGUuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdENhcmRDb25maWcge1xuICAvKiogRGVmYXVsdCBhcHBlYXJhbmNlIGZvciBjYXJkcy4gKi9cbiAgYXBwZWFyYW5jZT86IE1hdENhcmRBcHBlYXJhbmNlO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIHRoZSBjYXJkIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBNQVRfQ0FSRF9DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0Q2FyZENvbmZpZz4oJ01BVF9DQVJEX0NPTkZJRycpO1xuXG4vKipcbiAqIE1hdGVyaWFsIERlc2lnbiBjYXJkIGNvbXBvbmVudC4gQ2FyZHMgY29udGFpbiBjb250ZW50IGFuZCBhY3Rpb25zIGFib3V0IGEgc2luZ2xlIHN1YmplY3QuXG4gKiBTZWUgaHR0cHM6Ly9tYXRlcmlhbC5pby9kZXNpZ24vY29tcG9uZW50cy9jYXJkcy5odG1sXG4gKlxuICogTWF0Q2FyZCBwcm92aWRlcyBubyBiZWhhdmlvcnMsIGluc3RlYWQgc2VydmluZyBhcyBhIHB1cmVseSB2aXN1YWwgdHJlYXRtZW50LlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtY2FyZCcsXG4gIHRlbXBsYXRlVXJsOiAnY2FyZC5odG1sJyxcbiAgc3R5bGVVcmw6ICdjYXJkLmNzcycsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1jYXJkIG1kYy1jYXJkJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtY2FyZC1vdXRsaW5lZF0nOiAnYXBwZWFyYW5jZSA9PT0gXCJvdXRsaW5lZFwiJyxcbiAgICAnW2NsYXNzLm1kYy1jYXJkLS1vdXRsaW5lZF0nOiAnYXBwZWFyYW5jZSA9PT0gXCJvdXRsaW5lZFwiJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdtYXRDYXJkJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmQge1xuICBASW5wdXQoKSBhcHBlYXJhbmNlOiBNYXRDYXJkQXBwZWFyYW5jZTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KE1BVF9DQVJEX0NPTkZJRykgQE9wdGlvbmFsKCkgY29uZmlnPzogTWF0Q2FyZENvbmZpZykge1xuICAgIHRoaXMuYXBwZWFyYW5jZSA9IGNvbmZpZz8uYXBwZWFyYW5jZSB8fCAncmFpc2VkJztcbiAgfVxufVxuXG4vLyBUT0RPKGplbGJvdXJuKTogYWRkIGBNYXRBY3Rpb25DYXJkYCwgd2hpY2ggaXMgYSBjYXJkIHRoYXQgYWN0cyBsaWtlIGEgYnV0dG9uIChhbmQgaGFzIGEgcmlwcGxlKS5cbi8vIFN1cHBvcnRlZCBpbiBNREMgd2l0aCBgLm1kYy1jYXJkX19wcmltYXJ5LWFjdGlvbmAuIFdpbGwgcmVxdWlyZSBhZGRpdGlvbmFsIGExMXkgZG9jcyBmb3IgdXNlcnMuXG5cbi8qKlxuICogVGl0bGUgb2YgYSBjYXJkLCBpbnRlbmRlZCBmb3IgdXNlIHdpdGhpbiBgPG1hdC1jYXJkPmAuIFRoaXMgY29tcG9uZW50IGlzIGFuIG9wdGlvbmFsXG4gKiBjb252ZW5pZW5jZSBmb3Igb25lIHZhcmlldHkgb2YgY2FyZCB0aXRsZTsgYW55IGN1c3RvbSB0aXRsZSBlbGVtZW50IG1heSBiZSB1c2VkIGluIGl0cyBwbGFjZS5cbiAqXG4gKiBNYXRDYXJkVGl0bGUgcHJvdmlkZXMgbm8gYmVoYXZpb3JzLCBpbnN0ZWFkIHNlcnZpbmcgYXMgYSBwdXJlbHkgdmlzdWFsIHRyZWF0bWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiBgbWF0LWNhcmQtdGl0bGUsIFttYXQtY2FyZC10aXRsZV0sIFttYXRDYXJkVGl0bGVdYCxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtdGl0bGUnfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2FyZFRpdGxlIHt9XG5cbi8qKlxuICogQ29udGFpbmVyIGludGVuZGVkIHRvIGJlIHVzZWQgd2l0aGluIHRoZSBgPG1hdC1jYXJkPmAgY29tcG9uZW50LiBDYW4gY29udGFpbiBleGFjdGx5IG9uZVxuICogYDxtYXQtY2FyZC10aXRsZT5gLCBvbmUgYDxtYXQtY2FyZC1zdWJ0aXRsZT5gIGFuZCBvbmUgY29udGVudCBpbWFnZSBvZiBhbnkgc2l6ZVxuICogKGUuZy4gYDxpbWcgbWF0Q2FyZExnSW1hZ2U+YCkuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1jYXJkLXRpdGxlLWdyb3VwJyxcbiAgdGVtcGxhdGVVcmw6ICdjYXJkLXRpdGxlLWdyb3VwLmh0bWwnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtdGl0bGUtZ3JvdXAnfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2FyZFRpdGxlR3JvdXAge31cblxuLyoqXG4gKiBDb250ZW50IG9mIGEgY2FyZCwgaW50ZW5kZWQgZm9yIHVzZSB3aXRoaW4gYDxtYXQtY2FyZD5gLiBUaGlzIGNvbXBvbmVudCBpcyBhbiBvcHRpb25hbFxuICogY29udmVuaWVuY2UgZm9yIHVzZSB3aXRoIG90aGVyIGNvbnZlbmllbmNlIGVsZW1lbnRzLCBzdWNoIGFzIGA8bWF0LWNhcmQtdGl0bGU+YDsgYW55IGN1c3RvbVxuICogY29udGVudCBibG9jayBlbGVtZW50IG1heSBiZSB1c2VkIGluIGl0cyBwbGFjZS5cbiAqXG4gKiBNYXRDYXJkQ29udGVudCBwcm92aWRlcyBubyBiZWhhdmlvcnMsIGluc3RlYWQgc2VydmluZyBhcyBhIHB1cmVseSB2aXN1YWwgdHJlYXRtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtY2FyZC1jb250ZW50JyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtY29udGVudCd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDYXJkQ29udGVudCB7fVxuXG4vKipcbiAqIFN1Yi10aXRsZSBvZiBhIGNhcmQsIGludGVuZGVkIGZvciB1c2Ugd2l0aGluIGA8bWF0LWNhcmQ+YCBiZW5lYXRoIGEgYDxtYXQtY2FyZC10aXRsZT5gLiBUaGlzXG4gKiBjb21wb25lbnQgaXMgYW4gb3B0aW9uYWwgY29udmVuaWVuY2UgZm9yIHVzZSB3aXRoIG90aGVyIGNvbnZlbmllbmNlIGVsZW1lbnRzLCBzdWNoIGFzXG4gKiBgPG1hdC1jYXJkLXRpdGxlPmAuXG4gKlxuICogTWF0Q2FyZFN1YnRpdGxlIHByb3ZpZGVzIG5vIGJlaGF2aW9ycywgaW5zdGVhZCBzZXJ2aW5nIGFzIGEgcHVyZWx5IHZpc3VhbCB0cmVhdG1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogYG1hdC1jYXJkLXN1YnRpdGxlLCBbbWF0LWNhcmQtc3VidGl0bGVdLCBbbWF0Q2FyZFN1YnRpdGxlXWAsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1jYXJkLXN1YnRpdGxlJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRTdWJ0aXRsZSB7fVxuXG4vKipcbiAqIEJvdHRvbSBhcmVhIG9mIGEgY2FyZCB0aGF0IGNvbnRhaW5zIGFjdGlvbiBidXR0b25zLCBpbnRlbmRlZCBmb3IgdXNlIHdpdGhpbiBgPG1hdC1jYXJkPmAuXG4gKiBUaGlzIGNvbXBvbmVudCBpcyBhbiBvcHRpb25hbCBjb252ZW5pZW5jZSBmb3IgdXNlIHdpdGggb3RoZXIgY29udmVuaWVuY2UgZWxlbWVudHMsIHN1Y2ggYXNcbiAqIGA8bWF0LWNhcmQtY29udGVudD5gOyBhbnkgY3VzdG9tIGFjdGlvbiBibG9jayBlbGVtZW50IG1heSBiZSB1c2VkIGluIGl0cyBwbGFjZS5cbiAqXG4gKiBNYXRDYXJkQWN0aW9ucyBwcm92aWRlcyBubyBiZWhhdmlvcnMsIGluc3RlYWQgc2VydmluZyBhcyBhIHB1cmVseSB2aXN1YWwgdHJlYXRtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtY2FyZC1hY3Rpb25zJyxcbiAgZXhwb3J0QXM6ICdtYXRDYXJkQWN0aW9ucycsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1jYXJkLWFjdGlvbnMgbWRjLWNhcmRfX2FjdGlvbnMnLFxuICAgICdbY2xhc3MubWF0LW1kYy1jYXJkLWFjdGlvbnMtYWxpZ24tZW5kXSc6ICdhbGlnbiA9PT0gXCJlbmRcIicsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRBY3Rpb25zIHtcbiAgLy8gVE9ETyhqZWxib3Vybik6IGRlcHJlY2F0ZSBgYWxpZ25gIGluIGZhdm9yIG9mIGBhY3Rpb25Qb3NpdGlvbmAgb3IgYGFjdGlvbkFsaWdubWVudGBcbiAgLy8gYXMgdG8gbm90IGNvbmZsaWN0IHdpdGggdGhlIG5hdGl2ZSBgYWxpZ25gIGF0dHJpYnV0ZS5cblxuICAvKiogUG9zaXRpb24gb2YgdGhlIGFjdGlvbnMgaW5zaWRlIHRoZSBjYXJkLiAqL1xuICBASW5wdXQoKSBhbGlnbjogJ3N0YXJ0JyB8ICdlbmQnID0gJ3N0YXJ0JztcblxuICAvLyBUT0RPKGplbGJvdXJuKTogc3VwcG9ydCBgLm1kYy1jYXJkX19hY3Rpb25zLS1mdWxsLWJsZWVkYC5cblxuICAvLyBUT0RPKGplbGJvdXJuKTogc3VwcG9ydCAgYC5tZGMtY2FyZF9fYWN0aW9uLWJ1dHRvbnNgIGFuZCBgLm1kYy1jYXJkX19hY3Rpb24taWNvbnNgLlxuXG4gIC8vIFRPRE8oamVsYm91cm4pOiBmaWd1cmUgb3V0IGhvdyB0byB1c2UgYC5tZGMtY2FyZF9fYWN0aW9uYCwgYC5tZGMtY2FyZF9fYWN0aW9uLS1idXR0b25gLCBhbmRcbiAgLy8gYG1kYy1jYXJkX19hY3Rpb24tLWljb25gLiBUaGV5J3JlIHVzZWQgcHJpbWFyaWx5IGZvciBwb3NpdGlvbmluZywgd2hpY2ggd2UgbWlnaHQgYmUgYWJsZSB0b1xuICAvLyBkbyBpbXBsaWNpdGx5LlxufVxuXG4vKipcbiAqIEhlYWRlciByZWdpb24gb2YgYSBjYXJkLCBpbnRlbmRlZCBmb3IgdXNlIHdpdGhpbiBgPG1hdC1jYXJkPmAuIFRoaXMgaGVhZGVyIGNhcHR1cmVzXG4gKiBhIGNhcmQgdGl0bGUsIHN1YnRpdGxlLCBhbmQgYXZhdGFyLiAgVGhpcyBjb21wb25lbnQgaXMgYW4gb3B0aW9uYWwgY29udmVuaWVuY2UgZm9yIHVzZSB3aXRoXG4gKiBvdGhlciBjb252ZW5pZW5jZSBlbGVtZW50cywgc3VjaCBhcyBgPG1hdC1jYXJkLWZvb3Rlcj5gOyBhbnkgY3VzdG9tIGhlYWRlciBibG9jayBlbGVtZW50IG1heSBiZVxuICogdXNlZCBpbiBpdHMgcGxhY2UuXG4gKlxuICogTWF0Q2FyZEhlYWRlciBwcm92aWRlcyBubyBiZWhhdmlvcnMsIGluc3RlYWQgc2VydmluZyBhcyBhIHB1cmVseSB2aXN1YWwgdHJlYXRtZW50LlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtY2FyZC1oZWFkZXInLFxuICB0ZW1wbGF0ZVVybDogJ2NhcmQtaGVhZGVyLmh0bWwnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtaGVhZGVyJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRIZWFkZXIge31cblxuLyoqXG4gKiBGb290ZXIgYXJlYSBhIGNhcmQsIGludGVuZGVkIGZvciB1c2Ugd2l0aGluIGA8bWF0LWNhcmQ+YC5cbiAqIFRoaXMgY29tcG9uZW50IGlzIGFuIG9wdGlvbmFsIGNvbnZlbmllbmNlIGZvciB1c2Ugd2l0aCBvdGhlciBjb252ZW5pZW5jZSBlbGVtZW50cywgc3VjaCBhc1xuICogYDxtYXQtY2FyZC1jb250ZW50PmA7IGFueSBjdXN0b20gZm9vdGVyIGJsb2NrIGVsZW1lbnQgbWF5IGJlIHVzZWQgaW4gaXRzIHBsYWNlLlxuICpcbiAqIE1hdENhcmRGb290ZXIgcHJvdmlkZXMgbm8gYmVoYXZpb3JzLCBpbnN0ZWFkIHNlcnZpbmcgYXMgYSBwdXJlbHkgdmlzdWFsIHRyZWF0bWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LWNhcmQtZm9vdGVyJyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtZm9vdGVyJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRGb290ZXIge31cblxuLy8gVE9ETyhqZWxib3Vybik6IGRlcHJlY2F0ZSB0aGUgXCJpbWFnZVwiIHNlbGVjdG9ycyB0byByZXBsYWNlIHdpdGggXCJtZWRpYVwiLlxuXG4vLyBUT0RPKGplbGJvdXJuKTogc3VwcG9ydCBgLm1kYy1jYXJkX19tZWRpYS1jb250ZW50YC5cblxuLyoqXG4gKiBQcmltYXJ5IGltYWdlIGNvbnRlbnQgZm9yIGEgY2FyZCwgaW50ZW5kZWQgZm9yIHVzZSB3aXRoaW4gYDxtYXQtY2FyZD5gLiBDYW4gYmUgYXBwbGllZCB0b1xuICogYW55IG1lZGlhIGVsZW1lbnQsIHN1Y2ggYXMgYDxpbWc+YCBvciBgPHBpY3R1cmU+YC5cbiAqXG4gKiBUaGlzIGNvbXBvbmVudCBpcyBhbiBvcHRpb25hbCBjb252ZW5pZW5jZSBmb3IgdXNlIHdpdGggb3RoZXIgY29udmVuaWVuY2UgZWxlbWVudHMsIHN1Y2ggYXNcbiAqIGA8bWF0LWNhcmQtY29udGVudD5gOyBhbnkgY3VzdG9tIG1lZGlhIGVsZW1lbnQgbWF5IGJlIHVzZWQgaW4gaXRzIHBsYWNlLlxuICpcbiAqIE1hdENhcmRJbWFnZSBwcm92aWRlcyBubyBiZWhhdmlvcnMsIGluc3RlYWQgc2VydmluZyBhcyBhIHB1cmVseSB2aXN1YWwgdHJlYXRtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0LWNhcmQtaW1hZ2VdLCBbbWF0Q2FyZEltYWdlXScsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1jYXJkLWltYWdlIG1kYy1jYXJkX19tZWRpYSd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDYXJkSW1hZ2Uge1xuICAvLyBUT0RPKGplbGJvdXJuKTogc3VwcG9ydCBgLm1kYy1jYXJkX19tZWRpYS0tc3F1YXJlYCBhbmQgYC5tZGMtY2FyZF9fbWVkaWEtLTE2LTlgLlxufVxuXG4vKiogU2FtZSBhcyBgTWF0Q2FyZEltYWdlYCwgYnV0IHNtYWxsLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdC1jYXJkLXNtLWltYWdlXSwgW21hdENhcmRJbWFnZVNtYWxsXScsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1jYXJkLXNtLWltYWdlIG1kYy1jYXJkX19tZWRpYSd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDYXJkU21JbWFnZSB7fVxuXG4vKiogU2FtZSBhcyBgTWF0Q2FyZEltYWdlYCwgYnV0IG1lZGl1bS4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXQtY2FyZC1tZC1pbWFnZV0sIFttYXRDYXJkSW1hZ2VNZWRpdW1dJyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtbWQtaW1hZ2UgbWRjLWNhcmRfX21lZGlhJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRNZEltYWdlIHt9XG5cbi8qKiBTYW1lIGFzIGBNYXRDYXJkSW1hZ2VgLCBidXQgbGFyZ2UuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0LWNhcmQtbGctaW1hZ2VdLCBbbWF0Q2FyZEltYWdlTGFyZ2VdJyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtbGctaW1hZ2UgbWRjLWNhcmRfX21lZGlhJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRMZ0ltYWdlIHt9XG5cbi8qKiBTYW1lIGFzIGBNYXRDYXJkSW1hZ2VgLCBidXQgZXh0cmEtbGFyZ2UuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0LWNhcmQteGwtaW1hZ2VdLCBbbWF0Q2FyZEltYWdlWExhcmdlXScsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnbWF0LW1kYy1jYXJkLXhsLWltYWdlIG1kYy1jYXJkX19tZWRpYSd9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDYXJkWGxJbWFnZSB7fVxuXG4vKipcbiAqIEF2YXRhciBpbWFnZSBjb250ZW50IGZvciBhIGNhcmQsIGludGVuZGVkIGZvciB1c2Ugd2l0aGluIGA8bWF0LWNhcmQ+YC4gQ2FuIGJlIGFwcGxpZWQgdG9cbiAqIGFueSBtZWRpYSBlbGVtZW50LCBzdWNoIGFzIGA8aW1nPmAgb3IgYDxwaWN0dXJlPmAuXG4gKlxuICogVGhpcyBjb21wb25lbnQgaXMgYW4gb3B0aW9uYWwgY29udmVuaWVuY2UgZm9yIHVzZSB3aXRoIG90aGVyIGNvbnZlbmllbmNlIGVsZW1lbnRzLCBzdWNoIGFzXG4gKiBgPG1hdC1jYXJkLXRpdGxlPmA7IGFueSBjdXN0b20gbWVkaWEgZWxlbWVudCBtYXkgYmUgdXNlZCBpbiBpdHMgcGxhY2UuXG4gKlxuICogTWF0Q2FyZEF2YXRhciBwcm92aWRlcyBubyBiZWhhdmlvcnMsIGluc3RlYWQgc2VydmluZyBhcyBhIHB1cmVseSB2aXN1YWwgdHJlYXRtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0LWNhcmQtYXZhdGFyXSwgW21hdENhcmRBdmF0YXJdJyxcbiAgaG9zdDogeydjbGFzcyc6ICdtYXQtbWRjLWNhcmQtYXZhdGFyJ30sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhcmRBdmF0YXIge31cbiIsIjxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiIsIjxkaXY+XG4gIDxuZy1jb250ZW50XG4gICAgICBzZWxlY3Q9XCJtYXQtY2FyZC10aXRsZSwgbWF0LWNhcmQtc3VidGl0bGUsXG4gICAgICBbbWF0LWNhcmQtdGl0bGVdLCBbbWF0LWNhcmQtc3VidGl0bGVdLFxuICAgICAgW21hdENhcmRUaXRsZV0sIFttYXRDYXJkU3VidGl0bGVdXCI+PC9uZy1jb250ZW50PlxuPC9kaXY+XG48bmctY29udGVudCBzZWxlY3Q9XCJbbWF0LWNhcmQtaW1hZ2VdLCBbbWF0Q2FyZEltYWdlXSxcbiAgICAgICAgICAgICAgICAgICAgW21hdC1jYXJkLXNtLWltYWdlXSwgW21hdENhcmRJbWFnZVNtYWxsXSxcbiAgICAgICAgICAgICAgICAgICAgW21hdC1jYXJkLW1kLWltYWdlXSwgW21hdENhcmRJbWFnZU1lZGl1bV0sXG4gICAgICAgICAgICAgICAgICAgIFttYXQtY2FyZC1sZy1pbWFnZV0sIFttYXRDYXJkSW1hZ2VMYXJnZV0sXG4gICAgICAgICAgICAgICAgICAgIFttYXQtY2FyZC14bC1pbWFnZV0sIFttYXRDYXJkSW1hZ2VYTGFyZ2VdXCI+PC9uZy1jb250ZW50PlxuPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuIiwiPG5nLWNvbnRlbnQgc2VsZWN0PVwiW21hdC1jYXJkLWF2YXRhcl0sIFttYXRDYXJkQXZhdGFyXVwiPjwvbmctY29udGVudD5cbjxkaXYgY2xhc3M9XCJtYXQtbWRjLWNhcmQtaGVhZGVyLXRleHRcIj5cbiAgPG5nLWNvbnRlbnRcbiAgICAgIHNlbGVjdD1cIm1hdC1jYXJkLXRpdGxlLCBtYXQtY2FyZC1zdWJ0aXRsZSxcbiAgICAgIFttYXQtY2FyZC10aXRsZV0sIFttYXQtY2FyZC1zdWJ0aXRsZV0sXG4gICAgICBbbWF0Q2FyZFRpdGxlXSwgW21hdENhcmRTdWJ0aXRsZV1cIj48L25nLWNvbnRlbnQ+XG48L2Rpdj5cbjxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiJdfQ==