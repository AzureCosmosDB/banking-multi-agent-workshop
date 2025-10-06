import { HttpClient } from '@angular/common/http';
import { InjectionToken, SecurityContext, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkedExtension, Renderer } from 'marked';
import { Observable } from 'rxjs';
import { ClipboardOptions, ClipboardRenderOptions } from './clipboard-options';
import { KatexOptions } from './katex-options';
import { MarkedOptions } from './marked-options';
import { MarkedRenderer } from './marked-renderer';
import { MermaidAPI } from './mermaid-options';
import * as i0 from "@angular/core";
export declare const errorJoyPixelsNotLoaded = "[ngx-markdown] When using the `emoji` attribute you *have to* include Emoji-Toolkit files to `angular.json` or use imports. See README for more information";
export declare const errorKatexNotLoaded = "[ngx-markdown] When using the `katex` attribute you *have to* include KaTeX files to `angular.json` or use imports. See README for more information";
export declare const errorMermaidNotLoaded = "[ngx-markdown] When using the `mermaid` attribute you *have to* include Mermaid files to `angular.json` or use imports. See README for more information";
export declare const errorClipboardNotLoaded = "[ngx-markdown] When using the `clipboard` attribute you *have to* include Clipboard files to `angular.json` or use imports. See README for more information";
export declare const errorClipboardViewContainerRequired = "[ngx-markdown] When using the `clipboard` attribute you *have to* provide the `viewContainerRef` parameter to `MarkdownService.render()` function";
export declare const errorSrcWithoutHttpClient = "[ngx-markdown] When using the `src` attribute you *have to* pass the `HttpClient` as a parameter of the `forRoot` method. See README for more information";
export declare const SECURITY_CONTEXT: InjectionToken<SecurityContext>;
export interface ParseOptions {
    decodeHtml?: boolean;
    inline?: boolean;
    emoji?: boolean;
    mermaid?: boolean;
    markedOptions?: MarkedOptions;
    disableSanitizer?: boolean;
}
export interface RenderOptions {
    clipboard?: boolean;
    clipboardOptions?: ClipboardRenderOptions;
    katex?: boolean;
    katexOptions?: KatexOptions;
    mermaid?: boolean;
    mermaidOptions?: MermaidAPI.MermaidConfig;
}
export declare class ExtendedRenderer extends Renderer {
    ɵNgxMarkdownRendererExtendedForExtensions: boolean;
    ɵNgxMarkdownRendererExtendedForMermaid: boolean;
}
export declare class MarkdownService {
    private clipboardOptions;
    private extensions;
    private mermaidOptions;
    private platform;
    private securityContext;
    private http;
    private sanitizer;
    private readonly DEFAULT_MARKED_OPTIONS;
    private readonly DEFAULT_KATEX_OPTIONS;
    private readonly DEFAULT_MERMAID_OPTIONS;
    private readonly DEFAULT_CLIPBOARD_OPTIONS;
    private readonly DEFAULT_PARSE_OPTIONS;
    private readonly DEFAULT_RENDER_OPTIONS;
    private _options;
    get options(): MarkedOptions;
    set options(value: MarkedOptions | undefined);
    get renderer(): MarkedRenderer;
    set renderer(value: MarkedRenderer);
    private readonly _reload$;
    readonly reload$: Observable<void>;
    constructor(clipboardOptions: ClipboardOptions, extensions: MarkedExtension[], options: MarkedOptions, mermaidOptions: MermaidAPI.MermaidConfig, platform: Object, securityContext: SecurityContext, http: HttpClient, sanitizer: DomSanitizer);
    parse(markdown: string, parseOptions?: ParseOptions): string | Promise<string>;
    render(element: HTMLElement, options?: RenderOptions, viewContainerRef?: ViewContainerRef): void;
    reload(): void;
    getSource(src: string): Observable<string>;
    highlight(element?: Element | Document): void;
    private decodeHtml;
    private extendsRendererForExtensions;
    private extendsRendererForMermaid;
    private handleExtension;
    private parseMarked;
    private parseEmoji;
    private renderKatex;
    private renderClipboard;
    private renderMermaid;
    private trimIndentation;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarkdownService, [{ optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, null, null, { optional: true; }, null]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MarkdownService>;
}
