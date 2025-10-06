import * as i0 from "@angular/core";
export declare class ClipboardButtonComponent {
    private _buttonClick$;
    readonly copied$: import("rxjs").Observable<boolean>;
    readonly copiedText$: import("rxjs").Observable<"Copy" | "Copied">;
    onCopyToClipboardClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ClipboardButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ClipboardButtonComponent, "markdown-clipboard", never, {}, {}, never, never, true, never>;
}
