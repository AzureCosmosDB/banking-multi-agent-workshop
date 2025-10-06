/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Used to generate unique IDs for events. */
let uniqueIds = 0;
/**
 * Creates a browser MouseEvent with the specified options.
 * @docs-private
 */
export function createMouseEvent(type, clientX = 0, clientY = 0, offsetX = 0, offsetY = 0, button = 0, modifiers = {}) {
    // Note: We cannot determine the position of the mouse event based on the screen
    // because the dimensions and position of the browser window are not available
    // To provide reasonable `screenX` and `screenY` coordinates, we simply use the
    // client coordinates as if the browser is opened in fullscreen.
    const screenX = clientX;
    const screenY = clientY;
    const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true, // Required for shadow DOM events.
        view: window,
        detail: 1,
        relatedTarget: null,
        screenX,
        screenY,
        clientX,
        clientY,
        ctrlKey: modifiers.control,
        altKey: modifiers.alt,
        shiftKey: modifiers.shift,
        metaKey: modifiers.meta,
        button: button,
        buttons: 1,
    });
    // The `MouseEvent` constructor doesn't allow us to pass these properties into the constructor.
    // Override them to `1`, because they're used for fake screen reader event detection.
    if (offsetX != null) {
        defineReadonlyEventProperty(event, 'offsetX', offsetX);
    }
    if (offsetY != null) {
        defineReadonlyEventProperty(event, 'offsetY', offsetY);
    }
    return event;
}
/**
 * Creates a browser `PointerEvent` with the specified options. Pointer events
 * by default will appear as if they are the primary pointer of their type.
 * https://www.w3.org/TR/pointerevents2/#dom-pointerevent-isprimary.
 *
 * For example, if pointer events for a multi-touch interaction are created, the non-primary
 * pointer touches would need to be represented by non-primary pointer events.
 *
 * @docs-private
 */
export function createPointerEvent(type, clientX = 0, clientY = 0, offsetX, offsetY, options = { isPrimary: true }) {
    const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true, // Required for shadow DOM events.
        view: window,
        clientX,
        clientY,
        ...options,
    });
    if (offsetX != null) {
        defineReadonlyEventProperty(event, 'offsetX', offsetX);
    }
    if (offsetY != null) {
        defineReadonlyEventProperty(event, 'offsetY', offsetY);
    }
    return event;
}
/**
 * Creates a browser TouchEvent with the specified pointer coordinates.
 * @docs-private
 */
export function createTouchEvent(type, pageX = 0, pageY = 0, clientX = 0, clientY = 0) {
    // We cannot use the `TouchEvent` or `Touch` because Firefox and Safari lack support.
    // TODO: Switch to the constructor API when it is available for Firefox and Safari.
    const event = document.createEvent('UIEvent');
    const touchDetails = { pageX, pageY, clientX, clientY, identifier: uniqueIds++ };
    // TS3.6 removes the initUIEvent method and suggests porting to "new UIEvent()".
    event.initUIEvent(type, true, true, window, 0);
    // Most of the browsers don't have a "initTouchEvent" method that can be used to define
    // the touch details.
    defineReadonlyEventProperty(event, 'touches', [touchDetails]);
    defineReadonlyEventProperty(event, 'targetTouches', [touchDetails]);
    defineReadonlyEventProperty(event, 'changedTouches', [touchDetails]);
    return event;
}
/**
 * Creates a keyboard event with the specified key and modifiers.
 * @docs-private
 */
export function createKeyboardEvent(type, keyCode = 0, key = '', modifiers = {}) {
    return new KeyboardEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true, // Required for shadow DOM events.
        view: window,
        keyCode: keyCode,
        key: key,
        shiftKey: modifiers.shift,
        metaKey: modifiers.meta,
        altKey: modifiers.alt,
        ctrlKey: modifiers.control,
    });
}
/**
 * Creates a fake event object with any desired event type.
 * @docs-private
 */
export function createFakeEvent(type, bubbles = false, cancelable = true, composed = true) {
    return new Event(type, { bubbles, cancelable, composed });
}
/**
 * Defines a readonly property on the given event object. Readonly properties on an event object
 * are always set as configurable as that matches default readonly properties for DOM event objects.
 */
function defineReadonlyEventProperty(event, propertyName, value) {
    Object.defineProperty(event, propertyName, { get: () => value, configurable: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtb2JqZWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGVzdGluZy90ZXN0YmVkL2Zha2UtZXZlbnRzL2V2ZW50LW9iamVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsOENBQThDO0FBQzlDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUVsQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQzlCLElBQVksRUFDWixPQUFPLEdBQUcsQ0FBQyxFQUNYLE9BQU8sR0FBRyxDQUFDLEVBQ1gsT0FBTyxHQUFHLENBQUMsRUFDWCxPQUFPLEdBQUcsQ0FBQyxFQUNYLE1BQU0sR0FBRyxDQUFDLEVBQ1YsWUFBMEIsRUFBRTtJQUU1QixnRkFBZ0Y7SUFDaEYsOEVBQThFO0lBQzlFLCtFQUErRTtJQUMvRSxnRUFBZ0U7SUFDaEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUV4QixNQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7UUFDakMsT0FBTyxFQUFFLElBQUk7UUFDYixVQUFVLEVBQUUsSUFBSTtRQUNoQixRQUFRLEVBQUUsSUFBSSxFQUFFLGtDQUFrQztRQUNsRCxJQUFJLEVBQUUsTUFBTTtRQUNaLE1BQU0sRUFBRSxDQUFDO1FBQ1QsYUFBYSxFQUFFLElBQUk7UUFDbkIsT0FBTztRQUNQLE9BQU87UUFDUCxPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTztRQUMxQixNQUFNLEVBQUUsU0FBUyxDQUFDLEdBQUc7UUFDckIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxLQUFLO1FBQ3pCLE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSTtRQUN2QixNQUFNLEVBQUUsTUFBTTtRQUNkLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQyxD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QUN2QixNQUFNLEVBQUUsU0FBUyxDQUFDLEdBQUc7UUFDckIsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPO0tBQzNCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLElBQVksRUFBRSxPQUFPLEdBQUcsS0FBSyxFQUFFLFVBQVUsR0FBRyxJQUFJLEVBQUUsUUFBUSxHQUFHLElBQUk7SUFDL0YsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsMkJBQTJCLENBQUMsS0FBWSxFQUFFLFlBQW9CLEVBQUUsS0FBVTtJQUNqRixNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ3JGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNb2RpZmllcktleXN9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcblxuLyoqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyBmb3IgZXZlbnRzLiAqL1xubGV0IHVuaXF1ZUlkcyA9IDA7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJyb3dzZXIgTW91c2VFdmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgb3B0aW9ucy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vdXNlRXZlbnQoXG4gIHR5cGU6IHN0cmluZyxcbiAgY2xpZW50WCA9IDAsXG4gIGNsaWVudFkgPSAwLFxuICBvZmZzZXRYID0gMCxcbiAgb2Zmc2V0WSA9IDAsXG4gIGJ1dHRvbiA9IDAsXG4gIG1vZGlmaWVyczogTW9kaWZpZXJLZXlzID0ge30sXG4pIHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IGRldGVybWluZSB0aGUgcG9zaXRpb24gb2YgdGhlIG1vdXNlIGV2ZW50IGJhc2VkIG9uIHRoZSBzY3JlZW5cbiAgLy8gYmVjYXVzZSB0aGUgZGltZW5zaW9ucyBhbmQgcG9zaXRpb24gb2YgdGhlIGJyb3dzZXIgd2luZG93IGFyZSBub3QgYXZhaWxhYmxlXG4gIC8vIFRvIHByb3ZpZGUgcmVhc29uYWJsZSBgc2NyZWVuWGAgYW5kIGBzY3JlZW5ZYCBjb29yZGluYXRlcywgd2Ugc2ltcGx5IHVzZSB0aGVcbiAgLy8gY2xpZW50IGNvb3JkaW5hdGVzIGFzIGlmIHRoZSBicm93c2VyIGlzIG9wZW5lZCBpbiBmdWxsc2NyZWVuLlxuICBjb25zdCBzY3JlZW5YID0gY2xpZW50WDtcbiAgY29uc3Qgc2NyZWVuWSA9IGNsaWVudFk7XG5cbiAgY29uc3QgZXZlbnQgPSBuZXcgTW91c2VFdmVudCh0eXBlLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGNvbXBvc2VkOiB0cnVlLCAvLyBSZXF1aXJlZCBmb3Igc2hhZG93IERPTSBldmVudHMuXG4gICAgdmlldzogd2luZG93LFxuICAgIGRldGFpbDogMSxcbiAgICByZWxhdGVkVGFyZ2V0OiBudWxsLFxuICAgIHNjcmVlblgsXG4gICAgc2NyZWVuWSxcbiAgICBjbGllbnRYLFxuICAgIGNsaWVudFksXG4gICAgY3RybEtleTogbW9kaWZpZXJzLmNvbnRyb2wsXG4gICAgYWx0S2V5OiBtb2RpZmllcnMuYWx0LFxuICAgIHNoaWZ0S2V5OiBtb2RpZmllcnMuc2hpZnQsXG4gICAgbWV0YUtleTogbW9kaWZpZXJzLm1ldGEsXG4gICAgYnV0dG9uOiBidXR0b24sXG4gICAgYnV0dG9uczogMSxcbiAgfSk7XG5cbiAgLy8gVGhlIGBNb3VzZUV2ZW50YCBjb25zdHJ1Y3RvciBkb2Vzbid0IGFsbG93IHVzIHRvIHBhc3MgdGhlc2UgcHJvcGVydGllcyBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgLy8gT3ZlcnJpZGUgdGhlbSB0byBgMWAsIGJlY2F1c2UgdGhleSdyZSB1c2VkIGZvciBmYWtlIHNjcmVlbiByZWFkZXIgZXZlbnQgZGV0ZWN0aW9uLlxuICBpZiAob2Zmc2V0WCAhPSBudWxsKSB7XG4gICAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAnb2Zmc2V0WCcsIG9mZnNldFgpO1xuICB9XG5cbiAgaWYgKG9mZnNldFkgIT0gbnVsbCkge1xuICAgIGRlZmluZVJlYWRvbmx5RXZlbnRQcm9wZXJ0eShldmVudCwgJ29mZnNldFknLCBvZmZzZXRZKTtcbiAgfVxuXG4gIHJldHVybiBldmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYnJvd3NlciBgUG9pbnRlckV2ZW50YCB3aXRoIHRoZSBzcGVjaWZpZWQgb3B0aW9ucy4gUG9pbnRlciBldmVudHNcbiAqIGJ5IGRlZmF1bHQgd2lsbCBhcHBlYXIgYXMgaWYgdGhleSBhcmUgdGhlIHByaW1hcnkgcG9pbnRlciBvZiB0aGVpciB0eXBlLlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL3BvaW50ZXJldmVudHMyLyNkb20tcG9pbnRlcmV2ZW50LWlzcHJpbWFyeS5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgaWYgcG9pbnRlciBldmVudHMgZm9yIGEgbXVsdGktdG91Y2ggaW50ZXJhY3Rpb24gYXJlIGNyZWF0ZWQsIHRoZSBub24tcHJpbWFyeVxuICogcG9pbnRlciB0b3VjaGVzIHdvdWxkIG5lZWQgdG8gYmUgcmVwcmVzZW50ZWQgYnkgbm9uLXByaW1hcnkgcG9pbnRlciBldmVudHMuXG4gKlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9pbnRlckV2ZW50KFxuICB0eXBlOiBzdHJpbmcsXG4gIGNsaWVudFggPSAwLFxuICBjbGllbnRZID0gMCxcbiAgb2Zmc2V0WD86IG51bWJlcixcbiAgb2Zmc2V0WT86IG51bWJlcixcbiAgb3B0aW9uczogUG9pbnRlckV2ZW50SW5pdCA9IHtpc1ByaW1hcnk6IHRydWV9LFxuKSB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IFBvaW50ZXJFdmVudCh0eXBlLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGNvbXBvc2VkOiB0cnVlLCAvLyBSZXF1aXJlZCBmb3Igc2hhZG93IERPTSBldmVudHMuXG4gICAgdmlldzogd2luZG93LFxuICAgIGNsaWVudFgsXG4gICAgY2xpZW50WSxcbiAgICAuLi5vcHRpb25zLFxuICB9KTtcblxuICBpZiAob2Zmc2V0WCAhPSBudWxsKSB7XG4gICAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAnb2Zmc2V0WCcsIG9mZnNldFgpO1xuICB9XG5cbiAgaWYgKG9mZnNldFkgIT0gbnVsbCkge1xuICAgIGRlZmluZVJlYWRvbmx5RXZlbnRQcm9wZXJ0eShldmVudCwgJ29mZnNldFknLCBvZmZzZXRZKTtcbiAgfVxuXG4gIHJldHVybiBldmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYnJvd3NlciBUb3VjaEV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwb2ludGVyIGNvb3JkaW5hdGVzLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG91Y2hFdmVudCh0eXBlOiBzdHJpbmcsIHBhZ2VYID0gMCwgcGFnZVkgPSAwLCBjbGllbnRYID0gMCwgY2xpZW50WSA9IDApIHtcbiAgLy8gV2UgY2Fubm90IHVzZSB0aGUgYFRvdWNoRXZlbnRgIG9yIGBUb3VjaGAgYmVjYXVzZSBGaXJlZm94IGFuZCBTYWZhcmkgbGFjayBzdXBwb3J0LlxuICAvLyBUT0RPOiBTd2l0Y2ggdG8gdGhlIGNvbnN0cnVjdG9yIEFQSSB3aGVuIGl0IGlzIGF2YWlsYWJsZSBmb3IgRmlyZWZveCBhbmQgU2FmYXJpLlxuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdVSUV2ZW50Jyk7XG4gIGNvbnN0IHRvdWNoRGV0YWlscyA9IHtwYWdlWCwgcGFnZVksIGNsaWVudFgsIGNsaWVudFksIGlkZW50aWZpZXI6IHVuaXF1ZUlkcysrfTtcblxuICAvLyBUUzMuNiByZW1vdmVzIHRoZSBpbml0VUlFdmVudCBtZXRob2QgYW5kIHN1Z2dlc3RzIHBvcnRpbmcgdG8gXCJuZXcgVUlFdmVudCgpXCIuXG4gIChldmVudCBhcyBhbnkpLmluaXRVSUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMCk7XG5cbiAgLy8gTW9zdCBvZiB0aGUgYnJvd3NlcnMgZG9uJ3QgaGF2ZSBhIFwiaW5pdFRvdWNoRXZlbnRcIiBtZXRob2QgdGhhdCBjYW4gYmUgdXNlZCB0byBkZWZpbmVcbiAgLy8gdGhlIHRvdWNoIGRldGFpbHMuXG4gIGRlZmluZVJlYWRvbmx5RXZlbnRQcm9wZXJ0eShldmVudCwgJ3RvdWNoZXMnLCBbdG91Y2hEZXRhaWxzXSk7XG4gIGRlZmluZVJlYWRvbmx5RXZlbnRQcm9wZXJ0eShldmVudCwgJ3RhcmdldFRvdWNoZXMnLCBbdG91Y2hEZXRhaWxzXSk7XG4gIGRlZmluZVJlYWRvbmx5RXZlbnRQcm9wZXJ0eShldmVudCwgJ2NoYW5nZWRUb3VjaGVzJywgW3RvdWNoRGV0YWlsc10pO1xuXG4gIHJldHVybiBldmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEga2V5Ym9hcmQgZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBhbmQgbW9kaWZpZXJzLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5Ym9hcmRFdmVudChcbiAgdHlwZTogc3RyaW5nLFxuICBrZXlDb2RlOiBudW1iZXIgPSAwLFxuICBrZXk6IHN0cmluZyA9ICcnLFxuICBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyA9IHt9LFxuKSB7XG4gIHJldHVybiBuZXcgS2V5Ym9hcmRFdmVudCh0eXBlLCB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGNvbXBvc2VkOiB0cnVlLCAvLyBSZXF1aXJlZCBmb3Igc2hhZG93IERPTSBldmVudHMuXG4gICAgdmlldzogd2luZG93LFxuICAgIGtleUNvZGU6IGtleUNvZGUsXG4gICAga2V5OiBrZXksXG4gICAgc2hpZnRLZXk6IG1vZGlmaWVycy5zaGlmdCxcbiAgICBtZXRhS2V5OiBtb2RpZmllcnMubWV0YSxcbiAgICBhbHRLZXk6IG1vZGlmaWVycy5hbHQsXG4gICAgY3RybEtleTogbW9kaWZpZXJzLmNvbnRyb2wsXG4gIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmYWtlIGV2ZW50IG9iamVjdCB3aXRoIGFueSBkZXNpcmVkIGV2ZW50IHR5cGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGYWtlRXZlbnQodHlwZTogc3RyaW5nLCBidWJibGVzID0gZmFsc2UsIGNhbmNlbGFibGUgPSB0cnVlLCBjb21wb3NlZCA9IHRydWUpIHtcbiAgcmV0dXJuIG5ldyBFdmVudCh0eXBlLCB7YnViYmxlcywgY2FuY2VsYWJsZSwgY29tcG9zZWR9KTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgcmVhZG9ubHkgcHJvcGVydHkgb24gdGhlIGdpdmVuIGV2ZW50IG9iamVjdC4gUmVhZG9ubHkgcHJvcGVydGllcyBvbiBhbiBldmVudCBvYmplY3RcbiAqIGFyZSBhbHdheXMgc2V0IGFzIGNvbmZpZ3VyYWJsZSBhcyB0aGF0IG1hdGNoZXMgZGVmYXVsdCByZWFkb25seSBwcm9wZXJ0aWVzIGZvciBET00gZXZlbnQgb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50OiBFdmVudCwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV2ZW50LCBwcm9wZXJ0eU5hbWUsIHtnZXQ6ICgpID0+IHZhbHVlLCBjb25maWd1cmFibGU6IHRydWV9KTtcbn1cbiJdfQ==