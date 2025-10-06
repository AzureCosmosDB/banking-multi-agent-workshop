/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class to be added to the overlay pane wrapper. */
const wrapperClass = 'cdk-global-overlay-wrapper';
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy {
    constructor() {
        this._cssPosition = 'static';
        this._topOffset = '';
        this._bottomOffset = '';
        this._alignItems = '';
        this._xPosition = '';
        this._xOffset = '';
        this._width = '';
        this._height = '';
        this._isDisposed = false;
    }
    attach(overlayRef) {
        const config = overlayRef.getConfig();
        this._overlayRef = overlayRef;
        if (this._width && !config.width) {
            overlayRef.updateSize({ width: this._width });
        }
        if (this._height && !config.height) {
            overlayRef.updateSize({ height: this._height });
        }
        overlayRef.hostElement.classList.add(wrapperClass);
        this._isDisposed = false;
    }
    /**
     * Sets the top position of the overlay. Clears any previously set vertical position.
     * @param value New top offset.
     */
    top(value = '') {
        this._bottomOffset = '';
        this._topOffset = value;
        this._alignItems = 'flex-start';
        return this;
    }
    /**
     * Sets the left position of the overlay. Clears any previously set horizontal position.
     * @param value New left offset.
     */
    left(value = '') {
        this._xOffset = value;
        this._xPosition = 'left';
        return this;
    }
    /**
     * Sets the bottom position of the overlay. Clears any previously set vertical position.
     * @param value New bottom offset.
     */
    bottom(value = '') {
        this._topOffset = '';
        this._bottomOffset = value;
        this._alignItems = 'flex-end';
        return this;
    }
    /**
     * Sets the right position of the overlay. Clears any previously set horizontal position.
     * @param value New right offset.
     */
    right(value = '') {
        this._xOffset = value;
        this._xPosition = 'right';
        return this;
    }
    /**
     * Sets the overlay to the start of the viewport, depending on the overlay direction.
     * This will be to the left in LTR layouts and to the right in RTL.
     * @param offset Offset from the edge of the screen.
     */
    start(value = '') {
        this._xOffset = value;
        this._xPosition = 'start';
        return this;
    }
    /**
     * Sets the overlay to the end of the viewport, depending on the overlay direction.
     * This will be to the right in LTR layouts and to the left in RTL.
     * @param offset Offset from the edge of the screen.
     */
    end(value = '') {
        this._xOffset = value;
        this._xPosition = 'end';
        return this;
    }
    /**
     * Sets the overlay width and clears any previously set width.
     * @param value New width for the overlay
     * @deprecated Pass the `width` through the `OverlayConfig`.
     * @breaking-change 8.0.0
     */
    width(value = '') {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ width: value });
        }
        else {
            this._width = value;
        }
        return this;
    }
    /**
     * Sets the overlay height and clears any previously set height.
     * @param value New height for the overlay
     * @deprecated Pass the `height` through the `OverlayConfig`.
     * @breaking-change 8.0.0
     */
    height(value = '') {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ height: value });
        }
        else {
            this._height = value;
        }
        return this;
    }
    /**
     * Centers the overlay horizontally with an optional offset.
     * Clears any previously set horizontal position.
     *
     * @param offset Overlay offset from the horizontal center.
     */
    centerHorizontally(offset = '') {
        this.left(offset);
        this._xPosition = 'center';
        return this;
    }
    /**
     * Centers the overlay vertically with an optional offset.
     * Clears any previously set vertical position.
     *
     * @param offset Overlay offset from the vertical center.
     */
    centerVertically(offset = '') {
        this.top(offset);
        this._alignItems = 'center';
        return this;
    }
    /**
     * Apply the position to the element.
     * @docs-private
     */
    apply() {
        // Since the overlay ref applies the strategy asynchronously, it could
        // have been disposed before it ends up being applied. If that is the
        // case, we shouldn't do anything.
        if (!this._overlayRef || !this._overlayRef.hasAttached()) {
            return;
        }
        const styles = this._overlayRef.overlayElement.style;
        const parentStyles = this._overlayRef.hostElement.style;
        const config = this._overlayRef.getConfig();
        const { width, height, maxWidth, maxHeight } = config;
        const shouldBeFlushHorizontally = (width === '100%' || width === '100vw') &&
            (!maxWidth || maxWidth === '100%' || maxWidth === '100vw');
        const shouldBeFlushVertically = (height === '100%' || height === '100vh') &&
            (!maxHeight || maxHeight === '100%' || maxHeight === '100vh');
        const xPosition = this._xPosition;
        const xOffset = this._xOffset;
        const isRtl = this._overlayRef.getConfig().direction === 'rtl';
        let marginLeft = '';
        let marginRight = '';
        let justifyContent = '';
        if (shouldBeFlushHorizontally) {
            justifyContent = 'flex-start';
        }
        else if (xPosition === 'center') {
            justifyContent = 'center';
            if (isRtl) {
                marginRight = xOffset;
            }
            else {
                marginLeft = xOffset;
            }
        }
        else if (isRtl) {
            if (xPosition === 'left' || xPosition === 'end') {
                justifyContent = 'flex-end';
                marginLeft = xOffset;
            }
            else if (xPosition === 'right' || xPosition === 'start') {
                justifyContent = 'flex-start';
                marginRight = xOffset;
            }
        }
        else if (xPosition === 'left' || xPosition === 'start') {
            justifyContent = 'flex-start';
            marginLeft = xOffset;
        }
        else if (xPosition === 'right' || xPosition === 'end') {
            justifyContent = 'flex-end';
            marginRight = xOffset;
        }
        styles.position = this._cssPosition;
        styles.marginLeft = shouldBeFlushHorizontally ? '0' : marginLeft;
        styles.marginTop = shouldBeFlushVertically ? '0' : this._topOffset;
        styles.marginBottom = this._bottomOffset;
        styles.marginRight = shouldBeFlushHorizontally ? '0' : marginRight;
        parentStyles.justifyContent = justifyContent;
        parentStyles.alignItems = shouldBeFlushVertically ? 'flex-start' : this._alignItems;
    }
    /**
     * Cleans up the DOM changes from the position strategy.
     * @docs-private
     */
    dispose() {
        if (this._isDisposed || !this._overlayRef) {
            return;
        }
        const styles = this._overlayRef.overlayElement.style;
        const parent = this._overlayRef.hostElement;
        const parentStyles = parent.style;
        parent.classList.remove(wrapperClass);
        parentStyles.justifyContent =
            parentStyles.alignItems =
                styles.marginTop =
                    styles.marginBottom =
                        styles.marginLeft =
                            styles.marginRight =
                                styles.position =
                                    '';
        this._overlayRef = null;
        this._isDisposed = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLXBvc2l0aW9uLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Bvc2l0aW9uL2dsb2JhbC1wb3NpdGlvbi1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxxREFBcUQ7QUFDckQsTUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUM7QUFFbEQ7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sc0JBQXNCO0lBQW5DO1FBR1UsaUJBQVksR0FBRyxRQUFRLENBQUM7UUFDeEIsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNuQixnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUNqQixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLGdCQUFXLEdBQUcsS0FBSyxDQUFDO0lBcU85QixDQUFDO0lBbk9DLE1BQU0sQ0FBQyxVQUFzQjtRQUMzQixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFFOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxD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SUFBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge092ZXJsYXlSZWZ9IGZyb20gJy4uL292ZXJsYXktcmVmJztcbmltcG9ydCB7UG9zaXRpb25TdHJhdGVneX0gZnJvbSAnLi9wb3NpdGlvbi1zdHJhdGVneSc7XG5cbi8qKiBDbGFzcyB0byBiZSBhZGRlZCB0byB0aGUgb3ZlcmxheSBwYW5lIHdyYXBwZXIuICovXG5jb25zdCB3cmFwcGVyQ2xhc3MgPSAnY2RrLWdsb2JhbC1vdmVybGF5LXdyYXBwZXInO1xuXG4vKipcbiAqIEEgc3RyYXRlZ3kgZm9yIHBvc2l0aW9uaW5nIG92ZXJsYXlzLiBVc2luZyB0aGlzIHN0cmF0ZWd5LCBhbiBvdmVybGF5IGlzIGdpdmVuIGFuXG4gKiBleHBsaWNpdCBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgYnJvd3NlcidzIHZpZXdwb3J0LiBXZSB1c2UgZmxleGJveCwgaW5zdGVhZCBvZlxuICogdHJhbnNmb3JtcywgaW4gb3JkZXIgdG8gYXZvaWQgaXNzdWVzIHdpdGggc3VicGl4ZWwgcmVuZGVyaW5nIHdoaWNoIGNhbiBjYXVzZSB0aGVcbiAqIGVsZW1lbnQgdG8gYmVjb21lIGJsdXJyeS5cbiAqL1xuZXhwb3J0IGNsYXNzIEdsb2JhbFBvc2l0aW9uU3RyYXRlZ3kgaW1wbGVtZW50cyBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgLyoqIFRoZSBvdmVybGF5IHRvIHdoaWNoIHRoaXMgc3RyYXRlZ3kgaXMgYXR0YWNoZWQuICovXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWY7XG4gIHByaXZhdGUgX2Nzc1Bvc2l0aW9uID0gJ3N0YXRpYyc7XG4gIHByaXZhdGUgX3RvcE9mZnNldCA9ICcnO1xuICBwcml2YXRlIF9ib3R0b21PZmZzZXQgPSAnJztcbiAgcHJpdmF0ZSBfYWxpZ25JdGVtcyA9ICcnO1xuICBwcml2YXRlIF94UG9zaXRpb24gPSAnJztcbiAgcHJpdmF0ZSBfeE9mZnNldCA9ICcnO1xuICBwcml2YXRlIF93aWR0aCA9ICcnO1xuICBwcml2YXRlIF9oZWlnaHQgPSAnJztcbiAgcHJpdmF0ZSBfaXNEaXNwb3NlZCA9IGZhbHNlO1xuXG4gIGF0dGFjaChvdmVybGF5UmVmOiBPdmVybGF5UmVmKTogdm9pZCB7XG4gICAgY29uc3QgY29uZmlnID0gb3ZlcmxheVJlZi5nZXRDb25maWcoKTtcblxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSBvdmVybGF5UmVmO1xuXG4gICAgaWYgKHRoaXMuX3dpZHRoICYmICFjb25maWcud2lkdGgpIHtcbiAgICAgIG92ZXJsYXlSZWYudXBkYXRlU2l6ZSh7d2lkdGg6IHRoaXMuX3dpZHRofSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2hlaWdodCAmJiAhY29uZmlnLmhlaWdodCkge1xuICAgICAgb3ZlcmxheVJlZi51cGRhdGVTaXplKHtoZWlnaHQ6IHRoaXMuX2hlaWdodH0pO1xuICAgIH1cblxuICAgIG92ZXJsYXlSZWYuaG9zdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCh3cmFwcGVyQ2xhc3MpO1xuICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0b3AgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgdmVydGljYWwgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgdG9wIG9mZnNldC5cbiAgICovXG4gIHRvcCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLl9ib3R0b21PZmZzZXQgPSAnJztcbiAgICB0aGlzLl90b3BPZmZzZXQgPSB2YWx1ZTtcbiAgICB0aGlzLl9hbGlnbkl0ZW1zID0gJ2ZsZXgtc3RhcnQnO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHZhbHVlIE5ldyBsZWZ0IG9mZnNldC5cbiAgICovXG4gIGxlZnQodmFsdWU6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5feE9mZnNldCA9IHZhbHVlO1xuICAgIHRoaXMuX3hQb3NpdGlvbiA9ICdsZWZ0JztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBib3R0b20gcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgdmVydGljYWwgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgYm90dG9tIG9mZnNldC5cbiAgICovXG4gIGJvdHRvbSh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLl90b3BPZmZzZXQgPSAnJztcbiAgICB0aGlzLl9ib3R0b21PZmZzZXQgPSB2YWx1ZTtcbiAgICB0aGlzLl9hbGlnbkl0ZW1zID0gJ2ZsZXgtZW5kJztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByaWdodCBwb3NpdGlvbiBvZiB0aGUgb3ZlcmxheS4gQ2xlYXJzIGFueSBwcmV2aW91c2x5IHNldCBob3Jpem9udGFsIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IHJpZ2h0IG9mZnNldC5cbiAgICovXG4gIHJpZ2h0KHZhbHVlOiBzdHJpbmcgPSAnJyk6IHRoaXMge1xuICAgIHRoaXMuX3hPZmZzZXQgPSB2YWx1ZTtcbiAgICB0aGlzLl94UG9zaXRpb24gPSAncmlnaHQnO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG92ZXJsYXkgdG8gdGhlIHN0YXJ0IG9mIHRoZSB2aWV3cG9ydCwgZGVwZW5kaW5nIG9uIHRoZSBvdmVybGF5IGRpcmVjdGlvbi5cbiAgICogVGhpcyB3aWxsIGJlIHRvIHRoZSBsZWZ0IGluIExUUiBsYXlvdXRzIGFuZCB0byB0aGUgcmlnaHQgaW4gUlRMLlxuICAgKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCBmcm9tIHRoZSBlZGdlIG9mIHRoZSBzY3JlZW4uXG4gICAqL1xuICBzdGFydCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLl94T2Zmc2V0ID0gdmFsdWU7XG4gICAgdGhpcy5feFBvc2l0aW9uID0gJ3N0YXJ0JztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBvdmVybGF5IHRvIHRoZSBlbmQgb2YgdGhlIHZpZXdwb3J0LCBkZXBlbmRpbmcgb24gdGhlIG92ZXJsYXkgZGlyZWN0aW9uLlxuICAgKiBUaGlzIHdpbGwgYmUgdG8gdGhlIHJpZ2h0IGluIExUUiBsYXlvdXRzIGFuZCB0byB0aGUgbGVmdCBpbiBSVEwuXG4gICAqIEBwYXJhbSBvZmZzZXQgT2Zmc2V0IGZyb20gdGhlIGVkZ2Ugb2YgdGhlIHNjcmVlbi5cbiAgICovXG4gIGVuZCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcbiAgICB0aGlzLl94T2Zmc2V0ID0gdmFsdWU7XG4gICAgdGhpcy5feFBvc2l0aW9uID0gJ2VuZCc7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgb3ZlcmxheSB3aWR0aCBhbmQgY2xlYXJzIGFueSBwcmV2aW91c2x5IHNldCB3aWR0aC5cbiAgICogQHBhcmFtIHZhbHVlIE5ldyB3aWR0aCBmb3IgdGhlIG92ZXJsYXlcbiAgICogQGRlcHJlY2F0ZWQgUGFzcyB0aGUgYHdpZHRoYCB0aHJvdWdoIHRoZSBgT3ZlcmxheUNvbmZpZ2AuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIHdpZHRoKHZhbHVlOiBzdHJpbmcgPSAnJyk6IHRoaXMge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVNpemUoe3dpZHRoOiB2YWx1ZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93aWR0aCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG92ZXJsYXkgaGVpZ2h0IGFuZCBjbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IGhlaWdodC5cbiAgICogQHBhcmFtIHZhbHVlIE5ldyBoZWlnaHQgZm9yIHRoZSBvdmVybGF5XG4gICAqIEBkZXByZWNhdGVkIFBhc3MgdGhlIGBoZWlnaHRgIHRocm91Z2ggdGhlIGBPdmVybGF5Q29uZmlnYC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICAgKi9cbiAgaGVpZ2h0KHZhbHVlOiBzdHJpbmcgPSAnJyk6IHRoaXMge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVNpemUoe2hlaWdodDogdmFsdWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGVpZ2h0ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2VudGVycyB0aGUgb3ZlcmxheSBob3Jpem9udGFsbHkgd2l0aCBhbiBvcHRpb25hbCBvZmZzZXQuXG4gICAqIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG9mZnNldCBPdmVybGF5IG9mZnNldCBmcm9tIHRoZSBob3Jpem9udGFsIGNlbnRlci5cbiAgICovXG4gIGNlbnRlckhvcml6b250YWxseShvZmZzZXQ6IHN0cmluZyA9ICcnKTogdGhpcyB7XG4gICAgdGhpcy5sZWZ0KG9mZnNldCk7XG4gICAgdGhpcy5feFBvc2l0aW9uID0gJ2NlbnRlcic7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2VudGVycyB0aGUgb3ZlcmxheSB2ZXJ0aWNhbGx5IHdpdGggYW4gb3B0aW9uYWwgb2Zmc2V0LlxuICAgKiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IHZlcnRpY2FsIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gb2Zmc2V0IE92ZXJsYXkgb2Zmc2V0IGZyb20gdGhlIHZlcnRpY2FsIGNlbnRlci5cbiAgICovXG4gIGNlbnRlclZlcnRpY2FsbHkob2Zmc2V0OiBzdHJpbmcgPSAnJyk6IHRoaXMge1xuICAgIHRoaXMudG9wKG9mZnNldCk7XG4gICAgdGhpcy5fYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IHRoZSBwb3NpdGlvbiB0byB0aGUgZWxlbWVudC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHkoKTogdm9pZCB7XG4gICAgLy8gU2luY2UgdGhlIG92ZXJsYXkgcmVmIGFwcGxpZXMgdGhlIHN0cmF0ZWd5IGFzeW5jaHJvbm91c2x5LCBpdCBjb3VsZFxuICAgIC8vIGhhdmUgYmVlbiBkaXNwb3NlZCBiZWZvcmUgaXQgZW5kcyB1cCBiZWluZyBhcHBsaWVkLiBJZiB0aGF0IGlzIHRoZVxuICAgIC8vIGNhc2UsIHdlIHNob3VsZG4ndCBkbyBhbnl0aGluZy5cbiAgICBpZiAoIXRoaXMuX292ZXJsYXlSZWYgfHwgIXRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlcyA9IHRoaXMuX292ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuc3R5bGU7XG4gICAgY29uc3QgcGFyZW50U3R5bGVzID0gdGhpcy5fb3ZlcmxheVJlZi5ob3N0RWxlbWVudC5zdHlsZTtcbiAgICBjb25zdCBjb25maWcgPSB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpO1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBtYXhXaWR0aCwgbWF4SGVpZ2h0fSA9IGNvbmZpZztcbiAgICBjb25zdCBzaG91bGRCZUZsdXNoSG9yaXpvbnRhbGx5ID1cbiAgICAgICh3aWR0aCA9PT0gJzEwMCUnIHx8IHdpZHRoID09PSAnMTAwdncnKSAmJlxuICAgICAgKCFtYXhXaWR0aCB8fCBtYXhXaWR0aCA9PT0gJzEwMCUnIHx8IG1heFdpZHRoID09PSAnMTAwdncnKTtcbiAgICBjb25zdCBzaG91bGRCZUZsdXNoVmVydGljYWxseSA9XG4gICAgICAoaGVpZ2h0ID09PSAnMTAwJScgfHwgaGVpZ2h0ID09PSAnMTAwdmgnKSAmJlxuICAgICAgKCFtYXhIZWlnaHQgfHwgbWF4SGVpZ2h0ID09PSAnMTAwJScgfHwgbWF4SGVpZ2h0ID09PSAnMTAwdmgnKTtcbiAgICBjb25zdCB4UG9zaXRpb24gPSB0aGlzLl94UG9zaXRpb247XG4gICAgY29uc3QgeE9mZnNldCA9IHRoaXMuX3hPZmZzZXQ7XG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLmRpcmVjdGlvbiA9PT0gJ3J0bCc7XG4gICAgbGV0IG1hcmdpbkxlZnQgPSAnJztcbiAgICBsZXQgbWFyZ2luUmlnaHQgPSAnJztcbiAgICBsZXQganVzdGlmeUNvbnRlbnQgPSAnJztcblxuICAgIGlmIChzaG91bGRCZUZsdXNoSG9yaXpvbnRhbGx5KSB7XG4gICAgICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JztcbiAgICB9IGVsc2UgaWYgKHhQb3NpdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIGp1c3RpZnlDb250ZW50ID0gJ2NlbnRlcic7XG5cbiAgICAgIGlmIChpc1J0bCkge1xuICAgICAgICBtYXJnaW5SaWdodCA9IHhPZmZzZXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXJnaW5MZWZ0ID0geE9mZnNldDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzUnRsKSB7XG4gICAgICBpZiAoeFBvc2l0aW9uID09PSAnbGVmdCcgfHwgeFBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAgICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LWVuZCc7XG4gICAgICAgIG1hcmdpbkxlZnQgPSB4T2Zmc2V0O1xuICAgICAgfSBlbHNlIGlmICh4UG9zaXRpb24gPT09ICdyaWdodCcgfHwgeFBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnO1xuICAgICAgICBtYXJnaW5SaWdodCA9IHhPZmZzZXQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh4UG9zaXRpb24gPT09ICdsZWZ0JyB8fCB4UG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnO1xuICAgICAgbWFyZ2luTGVmdCA9IHhPZmZzZXQ7XG4gICAgfSBlbHNlIGlmICh4UG9zaXRpb24gPT09ICdyaWdodCcgfHwgeFBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1lbmQnO1xuICAgICAgbWFyZ2luUmlnaHQgPSB4T2Zmc2V0O1xuICAgIH1cblxuICAgIHN0eWxlcy5wb3NpdGlvbiA9IHRoaXMuX2Nzc1Bvc2l0aW9uO1xuICAgIHN0eWxlcy5tYXJnaW5MZWZ0ID0gc2hvdWxkQmVGbHVzaEhvcml6b250YWxseSA/ICcwJyA6IG1hcmdpbkxlZnQ7XG4gICAgc3R5bGVzLm1hcmdpblRvcCA9IHNob3VsZEJlRmx1c2hWZXJ0aWNhbGx5ID8gJzAnIDogdGhpcy5fdG9wT2Zmc2V0O1xuICAgIHN0eWxlcy5tYXJnaW5Cb3R0b20gPSB0aGlzLl9ib3R0b21PZmZzZXQ7XG4gICAgc3R5bGVzLm1hcmdpblJpZ2h0ID0gc2hvdWxkQmVGbHVzaEhvcml6b250YWxseSA/ICcwJyA6IG1hcmdpblJpZ2h0O1xuICAgIHBhcmVudFN0eWxlcy5qdXN0aWZ5Q29udGVudCA9IGp1c3RpZnlDb250ZW50O1xuICAgIHBhcmVudFN0eWxlcy5hbGlnbkl0ZW1zID0gc2hvdWxkQmVGbHVzaFZlcnRpY2FsbHkgPyAnZmxleC1zdGFydCcgOiB0aGlzLl9hbGlnbkl0ZW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyB1cCB0aGUgRE9NIGNoYW5nZXMgZnJvbSB0aGUgcG9zaXRpb24gc3RyYXRlZ3kuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzRGlzcG9zZWQgfHwgIXRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLl9vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnN0eWxlO1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX292ZXJsYXlSZWYuaG9zdEVsZW1lbnQ7XG4gICAgY29uc3QgcGFyZW50U3R5bGVzID0gcGFyZW50LnN0eWxlO1xuXG4gICAgcGFyZW50LmNsYXNzTGlzdC5yZW1vdmUod3JhcHBlckNsYXNzKTtcbiAgICBwYXJlbnRTdHlsZXMuanVzdGlmeUNvbnRlbnQgPVxuICAgICAgcGFyZW50U3R5bGVzLmFsaWduSXRlbXMgPVxuICAgICAgc3R5bGVzLm1hcmdpblRvcCA9XG4gICAgICBzdHlsZXMubWFyZ2luQm90dG9tID1cbiAgICAgIHN0eWxlcy5tYXJnaW5MZWZ0ID1cbiAgICAgIHN0eWxlcy5tYXJnaW5SaWdodCA9XG4gICAgICBzdHlsZXMucG9zaXRpb24gPVxuICAgICAgICAnJztcblxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsITtcbiAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgfVxufVxuIl19