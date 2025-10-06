import { ElementRef, NgZone, PipeTransform, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService, ParseOptions, RenderOptions } from './markdown.service';
import * as i0 from "@angular/core";
export type MarkdownPipeOptions = ParseOptions & RenderOptions;
export declare class MarkdownPipe implements PipeTransform {
    private domSanitizer;
    private elementRef;
    private markdownService;
    private viewContainerRef;
    private zone;
    constructor(domSanitizer: DomSanitizer, elementRef: ElementRef<HTMLElement>, markdownService: MarkdownService, viewContainerRef: ViewContainerRef, zone: NgZone);
    transform(value: string, options?: MarkdownPipeOptions): Promise<SafeHtml>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarkdownPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MarkdownPipe, "markdown", true>;
}
