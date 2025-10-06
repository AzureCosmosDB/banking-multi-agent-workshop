import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { RippleRef, RippleState } from './ripple-ref';
import { RippleEventManager } from './ripple-event-manager';
/**
 * Default ripple animation configuration for ripples without an explicit
 * animation config specified.
 */
export const defaultRippleAnimationConfig = {
    enterDuration: 225,
    exitDuration: 150,
};
/**
 * Timeout for ignoring mouse events. Mouse events will be temporary ignored after touch
 * events to avoid synthetic mouse events.
 */
const ignoreMouseEventsTimeout = 800;
/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
});
/** Events that signal that the pointer is down. */
const pointerDownEvents = ['mousedown', 'touchstart'];
/** Events that signal that the pointer is up. */
const pointerUpEvents = ['mouseup', 'mouseleave', 'touchend', 'touchcancel'];
/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 * The constructor takes a reference to the ripple directive's host element and a map of DOM
 * event handlers to be installed on the element that triggers ripple animations.
 * This will eventually become a custom renderer once Angular support exists.
 * @docs-private
 */
export class RippleRenderer {
    static { this._eventManager = new RippleEventManager(); }
    constructor(_target, _ngZone, elementOrElementRef, _platform) {
        this._target = _target;
        this._ngZone = _ngZone;
        this._platform = _platform;
        /** Whether the pointer is currently down or not. */
        this._isPointerDown = false;
        /**
         * Map of currently active ripple references.
         * The ripple reference is mapped to its element event listeners.
         * The reason why `| null` is used is that event listeners are added only
         * when the condition is truthy (see the `_startFadeOutTransition` method).
         */
        this._activeRipples = new Map();
        /** Whether pointer-up event listeners have been registered. */
        this._pointerUpEventsRegistered = false;
        // Only do anything if we're on the browser.
        if (_platform.isBrowser) {
            this._containerElement = coerceElement(elementOrElementRef);
        }
    }
    /**
     * Fades in a ripple at the given coordinates.
     * @param x Coordinate within the element, along the X axis at which to start the ripple.
     * @param y Coordinate within the element, along the Y axis at which to start the ripple.
     * @param config Extra ripple options.
     */
    fadeInRipple(x, y, config = {}) {
        const containerRect = (this._containerRect =
            this._containerRect || this._containerElement.getBoundingClientRect());
        const animationConfig = { ...defaultRippleAnimationConfig, ...config.animation };
        if (config.centered) {
            x = containerRect.left + containerRect.width / 2;
            y = containerRect.top + containerRect.height / 2;
        }
        const radius = config.radius || distanceToFurthestCorner(x, y, containerRect);
        const offsetX = x - containerRect.left;
        const offsetY = y - containerRect.top;
        const enterDuration = animationConfig.enterDuration;
        const ripple = document.createElement('div');
        ripple.classList.add('mat-ripple-element');
        ripple.style.left = `${offsetX - radius}px`;
        ripple.style.top = `${offsetY - radius}px`;
        ripple.style.height = `${radius * 2}px`;
        ripple.style.width = `${radius * 2}px`;
        // If a custom color has been specified, set it as inline style. If no color is
        // set, the default color will be applied through the ripple theme styles.
        if (config.color != null) {
            ripple.style.backgroundColor = config.color;
        }
        ripple.style.transitionDuration = `${enterDuration}ms`;
        this._containerElement.appendChild(ripple);
        // By default the browser does not recalculate the styles of dynamically created
        // ripple elements. This is critical to ensure that the `scale` animates properly.
        // We enforce a style recalculation by calling `getComputedStyle` and *accessing* a property.
        // See: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        const computedStyles = window.getComputedStyle(ripple);
        const userTransitionProperty = computedStyles.transitionProperty;
        const userTransitionDuration = computedStyles.transitionDuration;
        // Note: We detect whether animation is forcibly disabled through CSS (e.g. through
        // `transition: none` or `display: none`). This is technically unexpected since animations are
        // controlled through the animation config, but this exists for backwards compatibility. This
        // logic does not need to be super accurate since it covers some edge cases which can be easily
        // avoided by users.
        const animationForciblyDisabledThroughCss = userTransitionProperty === 'none' ||
            // Note: The canonical unit for serialized CSS `<time>` properties is seconds. Additionally
            // some browsers expand the duration for every property (in our case `opacity` and `transform`).
            userTransitionDuration === '0s' ||
            userTransitionDuration === '0s, 0s' ||
            // If the container is 0x0, it's likely `display: none`.
            (containerRect.width === 0 && containerRect.height === 0);
        // Exposed reference to the ripple that will be returned.
        const rippleRef = new RippleRef(this, ripple, config, animationForciblyDisabledThroughCss);
        // Start the enter animation by setting the transform/scale to 100%. The animation will
        // execute as part of this statement because we forced a style recalculation before.
        // Note: We use a 3d transform here in order to avoid an issue in Safari where
        // the ripples aren't clipped when inside the shadow DOM (see #24028).
        ripple.style.transform = 'scale3d(1, 1, 1)';
        rippleRef.state = RippleState.FADING_IN;
        if (!config.persistent) {
            this._mostRecentTransientRipple = rippleRef;
        }
        let eventListeners = null;
        // Do not register the `transition` event listener if fade-in and fade-out duration
        // are set to zero. The events won't fire anyway and we can save resources here.
        if (!animationForciblyDisabledThroughCss && (enterDuration || animationConfig.exitDuration)) {
            this._ngZone.runOutsideAngular(() => {
                const onTransitionEnd = () => {
                    // Clear the fallback timer since the transition fired correctly.
                    if (eventListeners) {
                        eventListeners.fallbackTimer = null;
                    }
                    clearTimeout(fallbackTimer);
                    this._finishRippleTransition(rippleRef);
                };
                const onTransitionCancel = () => this._destroyRipple(rippleRef);
                // In some cases where there's a higher load on the browser, it can choose not to dispatch
                // neither `transitionend` nor `transitioncancel` (see b/227356674). This timer serves as a
                // fallback for such cases so that the ripple doesn't become stuck. We add a 100ms buffer
                // because timers aren't precise. Note that another approach can be to transition the ripple
                // to the `VISIBLE` state immediately above and to `FADING_IN` afterwards inside
                // `transitionstart`. We go with the timer because it's one less event listener and
                // it's less likely to break existing tests.
                const fallbackTimer = setTimeout(onTransitionCancel, enterDuration + 100);
                ripple.addEventListener('transitionend', onTransitionEnd);
                // If the transition is cancelled (e.g. due to DOM removal), we destroy the ripple
                // directly as otherwise we would keep it part of the ripple container forever.
                // https://www.w3.org/TR/css-transitions-1/#:~:text=no%20longer%20in%20the%20document.
                ripple.addEventListener('transitioncancel', onTransitionCancel);
                eventListeners = { onTransitionEnd, onTransitionCancel, fallbackTimer };
            });
        }
        // Add the ripple reference to the list of all active ripples.
        this._activeRipples.set(rippleRef, eventListeners);
        // In case there is no fade-in transition duration, we need to manually call the transition
        // end listener because `transitionend` doesn't fire if there is no transition.
        if (animationForciblyDisabledThroughCss || !enterDuration) {
            this._finishRippleTransition(rippleRef);
        }
        return rippleRef;
    }
    /** Fades out a ripple reference. */
    fadeOutRipple(rippleRef) {
        // For ripples already fading out or hidden, this should be a noop.
        if (rippleRef.state === RippleState.FADING_OUT || rippleRef.state === RippleState.HIDDEN) {
            return;
        }
        const rippleEl = rippleRef.element;
        const animationConfig = { ...defaultRippleAnimationConfig, ...rippleRef.config.animation };
        // This starts the fade-out transition and will fire the transition end listener that
        // removes the ripple element from the DOM.
        rippleEl.style.transitionDuration = `${animationConfig.exitDuration}ms`;
        rippleEl.style.opacity = '0';
        rippleRef.state = RippleState.FADING_OUT;
        // In case there is no fade-out transition duration, we need to manually call the
        // transition end listener because `transitionend` doesn't fire if there is no transition.
        if (rippleRef._animationForciblyDisabledThroughCss || !animationConfig.exitDuration) {
            this._finishRippleTransition(rippleRef);
        }
    }
    /** Fades out all currently active ripples. */
    fadeOutAll() {
        this._getActiveRipples().forEach(ripple => ripple.fadeOut());
    }
    /** Fades out all currently active non-persistent ripples. */
    fadeOutAllNonPersistent() {
        this._getActiveRipples().forEach(ripple => {
            if (!ripple.config.persistent) {
                ripple.fadeOut();
            }
        });
    }
    /** Sets up the trigger event listeners */
    setupTriggerEvents(elementOrElementRef) {
        const element = coerceElement(elementOrElementRef);
        if (!this._platform.isBrowser || !element || element === this._triggerElement) {
            return;
        }
        // Remove all previously registered event listeners from the trigger element.
        this._removeTriggerEvents();
        this._triggerElement = element;
        // Use event delegation for the trigger events since they're
        // set up during creation and are performance-sensitive.
        pointerDownEvents.forEach(type => {
            RippleRenderer._eventManager.addHandler(this._ngZone, type, element, this);
        });
    }
    /**
     * Handles all registered events.
     * @docs-private
     */
    handleEvent(event) {
        if (event.type === 'mousedown') {
            this._onMousedown(event);
        }
        else if (event.type === 'touchstart') {
            this._onTouchStart(event);
        }
        else {
            this._onPointerUp();
        }
        // If pointer-up events haven't been registered yet, do so now.
        // We do this on-demand in order to reduce the total number of event listeners
        // registered by the ripples, which speeds up the rendering time for large UIs.
        if (!this._pointerUpEventsRegistered) {
            // The events for hiding the ripple are bound directly on the trigger, because:
            // 1. Some of them occur frequently (e.g. `mouseleave`) and any advantage we get from
            // delegation will be diminished by having to look through all the data structures often.
            // 2. They aren't as performance-sensitive, because they're bound only after the user
            // has interacted with an element.
            this._ngZone.runOutsideAngular(() => {
                pointerUpEvents.forEach(type => {
                    this._triggerElement.addEventListener(type, this, passiveCapturingEventOptions);
                });
            });
            this._pointerUpEventsRegistered = true;
        }
    }
    /** Method that will be called if the fade-in or fade-in transition completed. */
    _finishRippleTransition(rippleRef) {
        if (rippleRef.state === RippleState.FADING_IN) {
            this._startFadeOutTransition(rippleRef);
        }
        else if (rippleRef.state === RippleState.FADING_OUT) {
            this._destroyRipple(rippleRef);
        }
    }
    /**
     * Starts the fade-out transition of the given ripple if it's not persistent and the pointer
     * is not held down anymore.
     */
    _startFadeOutTransition(rippleRef) {
        const isMostRecentTransientRipple = rippleRef === this._mostRecentTransientRipple;
        const { persistent } = rippleRef.config;
        rippleRef.state = RippleState.VISIBLE;
        // When the timer runs out while the user has kept their pointer down, we want to
        // keep only the persistent ripples and the latest transient ripple. We do this,
        // because we don't want stacked transient ripples to appear after their enter
        // animation has finished.
        if (!persistent && (!isMostRecentTransientRipple || !this._isPointerDown)) {
            rippleRef.fadeOut();
        }
    }
    /** Destroys the given ripple by removing it from the DOM and updating its state. */
    _destroyRipple(rippleRef) {
        const eventListeners = this._activeRipples.get(rippleRef) ?? null;
        this._activeRipples.delete(rippleRef);
        // Clear out the cached bounding rect if we have no more ripples.
        if (!this._activeRipples.size) {
            this._containerRect = null;
        }
        // If the current ref is the most recent transient ripple, unset it
        // avoid memory leaks.
        if (rippleRef === this._mostRecentTransientRipple) {
            this._mostRecentTransientRipple = null;
        }
        rippleRef.state = RippleState.HIDDEN;
        if (eventListeners !== null) {
            rippleRef.element.removeEventListener('transitionend', eventListeners.onTransitionEnd);
            rippleRef.element.removeEventListener('transitioncancel', eventListeners.onTransitionCancel);
            if (eventListeners.fallbackTimer !== null) {
                clearTimeout(eventListeners.fallbackTimer);
            }
        }
        rippleRef.element.remove();
    }
    /** Function being called whenever the trigger is being pressed using mouse. */
    _onMousedown(event) {
        // Screen readers will fire fake mouse events for space/enter. Skip launching a
        // ripple in this case for consistency with the non-screen-reader experience.
        const isFakeMousedown = isFakeMousedownFromScreenReader(event);
        const isSyntheticEvent = this._lastTouchStartEvent &&
            Date.now() < this._lastTouchStartEvent + ignoreMouseEventsTimeout;
        if (!this._target.rippleDisabled && !isFakeMousedown && !isSyntheticEvent) {
            this._isPointerDown = true;
            this.fadeInRipple(event.clientX, event.clientY, this._target.rippleConfig);
        }
    }
    /** Function being called whenever the trigger is being pressed using touch. */
    _onTouchStart(event) {
        if (!this._target.rippleDisabled && !isFakeTouchstartFromScreenReader(event)) {
            // Some browsers fire mouse events after a `touchstart` event. Those synthetic mouse
            // events will launch a second ripple if we don't ignore mouse events for a specific
            // time after a touchstart event.
            this._lastTouchStartEvent = Date.now();
            this._isPointerDown = true;
            // Use `changedTouches` so we skip any touches where the user put
            // their finger down, but used another finger to tap the element again.
            const touches = event.changedTouches;
            // According to the typings the touches should always be defined, but in some cases
            // the browser appears to not assign them in tests which leads to flakes.
            if (touches) {
                for (let i = 0; i < touches.length; i++) {
                    this.fadeInRipple(touches[i].clientX, touches[i].clientY, this._target.rippleConfig);
                }
            }
        }
    }
    /** Function being called whenever the trigger is being released. */
    _onPointerUp() {
        if (!this._isPointerDown) {
            return;
        }
        this._isPointerDown = false;
        // Fade-out all ripples that are visible and not persistent.
        this._getActiveRipples().forEach(ripple => {
            // By default, only ripples that are completely visible will fade out on pointer release.
            // If the `terminateOnPointerUp` option is set, ripples that still fade in will also fade out.
            const isVisible = ripple.state === RippleState.VISIBLE ||
                (ripple.config.terminateOnPointerUp && ripple.state === RippleState.FADING_IN);
            if (!ripple.config.persistent && isVisible) {
                ripple.fadeOut();
            }
        });
    }
    _getActiveRipples() {
        return Array.from(this._activeRipples.keys());
    }
    /** Removes previously registered event listeners from the trigger element. */
    _removeTriggerEvents() {
        const trigger = this._triggerElement;
        if (trigger) {
            pointerDownEvents.forEach(type => RippleRenderer._eventManager.removeHandler(type, trigger, this));
            if (this._pointerUpEventsRegistered) {
                pointerUpEvents.forEach(type => trigger.removeEventListener(type, this, passiveCapturingEventOptions));
                this._pointerUpEventsRegistered = false;
            }
        }
    }
}
/**
 * Returns the distance from the point (x, y) to the furthest corner of a rectangle.
 */
function distanceToFurthestCorner(x, y, rect) {
    const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
    const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
    return Math.sqrt(distX * distX + distY * distY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwcGxlLXJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvcmlwcGxlL3JpcHBsZS1yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQVcsK0JBQStCLEVBQWtCLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFDLCtCQUErQixFQUFFLGdDQUFnQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFlLE1BQU0sY0FBYyxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBcUIxRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRztJQUMxQyxhQUFhLEVBQUUsR0FBRztJQUNsQixZQUFZLEVBQUUsR0FBRztDQUNsQixDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUM7QUFFckMsc0RBQXNEO0FBQ3RELE1BQU0sNEJBQTRCLEdBQUcsK0JBQStCLENBQUM7SUFDbkUsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQztBQUVILG1EQUFtRDtBQUNuRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXRELGlEQUFpRDtBQUNqRCxNQUFNLGVBQWUsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRTdFOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxjQUFjO2FBaUNWLGtCQUFhLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxBQUEzQixDQUE0QjtJQUV4RCxZQUNVLE9BQXFCLEVBQ3JC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LEVBQUUsQ0FBQztnQkFDcEMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUM3QixPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSw0QkFBNEIsQ0FBQyxDQUN0RSxDQUFDO2dCQUVGLElBQUksQ0FBQywwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDMUMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDOztBQUdIOztHQUVHO0FBQ0gsU0FBUyx3QkFBd0IsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLElBQWE7SUFDbkUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDMUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RWxlbWVudFJlZiwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UGxhdGZvcm0sIG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMsIF9nZXRFdmVudFRhcmdldH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7aXNGYWtlTW91c2Vkb3duRnJvbVNjcmVlblJlYWRlciwgaXNGYWtlVG91Y2hzdGFydEZyb21TY3JlZW5SZWFkZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Y29lcmNlRWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7UmlwcGxlUmVmLCBSaXBwbGVTdGF0ZSwgUmlwcGxlQ29uZmlnfSBmcm9tICcuL3JpcHBsZS1yZWYnO1xuaW1wb3J0IHtSaXBwbGVFdmVudE1hbmFnZXJ9IGZyb20gJy4vcmlwcGxlLWV2ZW50LW1hbmFnZXInO1xuXG4vKipcbiAqIEludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyB0aGUgdGFyZ2V0IGZvciBsYXVuY2hpbmcgcmlwcGxlcy5cbiAqIEl0IGRlZmluZXMgdGhlIHJpcHBsZSBjb25maWd1cmF0aW9uIGFuZCBkaXNhYmxlZCBzdGF0ZSBmb3IgaW50ZXJhY3Rpb24gcmlwcGxlcy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSaXBwbGVUYXJnZXQge1xuICAvKiogQ29uZmlndXJhdGlvbiBmb3IgcmlwcGxlcyB0aGF0IGFyZSBsYXVuY2hlZCBvbiBwb2ludGVyIGRvd24uICovXG4gIHJpcHBsZUNvbmZpZzogUmlwcGxlQ29uZmlnO1xuICAvKiogV2hldGhlciByaXBwbGVzIG9uIHBvaW50ZXIgZG93biBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIHJpcHBsZURpc2FibGVkOiBib29sZWFuO1xufVxuXG4vKiogSW50ZXJmYWNlcyB0aGUgZGVmaW5lcyByaXBwbGUgZWxlbWVudCB0cmFuc2l0aW9uIGV2ZW50IGxpc3RlbmVycy4gKi9cbmludGVyZmFjZSBSaXBwbGVFdmVudExpc3RlbmVycyB7XG4gIG9uVHJhbnNpdGlvbkVuZDogRXZlbnRMaXN0ZW5lcjtcbiAgb25UcmFuc2l0aW9uQ2FuY2VsOiBFdmVudExpc3RlbmVyO1xuICBmYWxsYmFja1RpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGw7XG59XG5cbi8qKlxuICogRGVmYXVsdCByaXBwbGUgYW5pbWF0aW9uIGNvbmZpZ3VyYXRpb24gZm9yIHJpcHBsZXMgd2l0aG91dCBhbiBleHBsaWNpdFxuICogYW5pbWF0aW9uIGNvbmZpZyBzcGVjaWZpZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0UmlwcGxlQW5pbWF0aW9uQ29uZmlnID0ge1xuICBlbnRlckR1cmF0aW9uOiAyMjUsXG4gIGV4aXREdXJhdGlvbjogMTUwLFxufTtcblxuLyoqXG4gKiBUaW1lb3V0IGZvciBpZ25vcmluZyBtb3VzZSBldmVudHMuIE1vdXNlIGV2ZW50cyB3aWxsIGJlIHRlbXBvcmFyeSBpZ25vcmVkIGFmdGVyIHRvdWNoXG4gKiBldmVudHMgdG8gYXZvaWQgc3ludGhldGljIG1vdXNlIGV2ZW50cy5cbiAqL1xuY29uc3QgaWdub3JlTW91c2VFdmVudHNUaW1lb3V0ID0gODAwO1xuXG4vKiogT3B0aW9ucyB1c2VkIHRvIGJpbmQgYSBwYXNzaXZlIGNhcHR1cmluZyBldmVudC4gKi9cbmNvbnN0IHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtcbiAgcGFzc2l2ZTogdHJ1ZSxcbiAgY2FwdHVyZTogdHJ1ZSxcbn0pO1xuXG4vKiogRXZlbnRzIHRoYXQgc2lnbmFsIHRoYXQgdGhlIHBvaW50ZXIgaXMgZG93bi4gKi9cbmNvbnN0IHBvaW50ZXJEb3duRXZlbnRzID0gWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddO1xuXG4vKiogRXZlbnRzIHRoYXQgc2lnbmFsIHRoYXQgdGhlIHBvaW50ZXIgaXMgdXAuICovXG5jb25zdCBwb2ludGVyVXBFdmVudHMgPSBbJ21vdXNldXAnLCAnbW91c2VsZWF2ZScsICd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCddO1xuXG4vKipcbiAqIEhlbHBlciBzZXJ2aWNlIHRoYXQgcGVyZm9ybXMgRE9NIG1hbmlwdWxhdGlvbnMuIE5vdCBpbnRlbmRlZCB0byBiZSB1c2VkIG91dHNpZGUgdGhpcyBtb2R1bGUuXG4gKiBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSByZWZlcmVuY2UgdG8gdGhlIHJpcHBsZSBkaXJlY3RpdmUncyBob3N0IGVsZW1lbnQgYW5kIGEgbWFwIG9mIERPTVxuICogZXZlbnQgaGFuZGxlcnMgdG8gYmUgaW5zdGFsbGVkIG9uIHRoZSBlbGVtZW50IHRoYXQgdHJpZ2dlcnMgcmlwcGxlIGFuaW1hdGlvbnMuXG4gKiBUaGlzIHdpbGwgZXZlbnR1YWxseSBiZWNvbWUgYSBjdXN0b20gcmVuZGVyZXIgb25jZSBBbmd1bGFyIHN1cHBvcnQgZXhpc3RzLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgUmlwcGxlUmVuZGVyZXIgaW1wbGVtZW50cyBFdmVudExpc3RlbmVyT2JqZWN0IHtcbiAgLyoqIEVsZW1lbnQgd2hlcmUgdGhlIHJpcHBsZXMgYXJlIGJlaW5nIGFkZGVkIHRvLiAqL1xuICBwcml2YXRlIF9jb250YWluZXJFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAvKiogRWxlbWVudCB3aGljaCB0cmlnZ2VycyB0aGUgcmlwcGxlIGVsZW1lbnRzIG9uIG1vdXNlIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBfdHJpZ2dlckVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbDtcblxuICAvKiogV2hldGhlciB0aGUgcG9pbnRlciBpcyBjdXJyZW50bHkgZG93biBvciBub3QuICovXG4gIHByaXZhdGUgX2lzUG9pbnRlckRvd24gPSBmYWxzZTtcblxuICAvKipcbiAgICogTWFwIG9mIGN1cnJlbnRseSBhY3RpdmUgcmlwcGxlIHJlZmVyZW5jZXMuXG4gICAqIFRoZSByaXBwbGUgcmVmZXJlbmNlIGlzIG1hcHBlZCB0byBpdHMgZWxlbWVudCBldmVudCBsaXN0ZW5lcnMuXG4gICAqIFRoZSByZWFzb24gd2h5IGB8IG51bGxgIGlzIHVzZWQgaXMgdGhhdCBldmVudCBsaXN0ZW5lcnMgYXJlIGFkZGVkIG9ubHlcbiAgICogd2hlbiB0aGUgY29uZGl0aW9uIGlzIHRydXRoeSAoc2VlIHRoZSBgX3N0YXJ0RmFkZU91dFRyYW5zaXRpb25gIG1ldGhvZCkuXG4gICAqL1xuICBwcml2YXRlIF9hY3RpdmVSaXBwbGVzID0gbmV3IE1hcDxSaXBwbGVSZWYsIFJpcHBsZUV2ZW50TGlzdGVuZXJzIHwgbnVsbD4oKTtcblxuICAvKiogTGF0ZXN0IG5vbi1wZXJzaXN0ZW50IHJpcHBsZSB0aGF0IHdhcyB0cmlnZ2VyZWQuICovXG4gIHByaXZhdGUgX21vc3RSZWNlbnRUcmFuc2llbnRSaXBwbGU6IFJpcHBsZVJlZiB8IG51bGw7XG5cbiAgLyoqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHdoZW4gdGhlIGxhc3QgdG91Y2hzdGFydCBldmVudCBoYXBwZW5lZC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFRvdWNoU3RhcnRFdmVudDogbnVtYmVyO1xuXG4gIC8qKiBXaGV0aGVyIHBvaW50ZXItdXAgZXZlbnQgbGlzdGVuZXJzIGhhdmUgYmVlbiByZWdpc3RlcmVkLiAqL1xuICBwcml2YXRlIF9wb2ludGVyVXBFdmVudHNSZWdpc3RlcmVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIENhY2hlZCBkaW1lbnNpb25zIG9mIHRoZSByaXBwbGUgY29udGFpbmVyLiBTZXQgd2hlbiB0aGUgZmlyc3RcbiAgICogcmlwcGxlIGlzIHNob3duIGFuZCBjbGVhcmVkIG9uY2Ugbm8gbW9yZSByaXBwbGVzIGFyZSB2aXNpYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBfY29udGFpbmVyUmVjdDogRE9NUmVjdCB8IG51bGw7XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2V2ZW50TWFuYWdlciA9IG5ldyBSaXBwbGVFdmVudE1hbmFnZXIoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF90YXJnZXQ6IFJpcHBsZVRhcmdldCxcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBlbGVtZW50T3JFbGVtZW50UmVmOiBIVE1MRWxlbWVudCB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgKSB7XG4gICAgLy8gT25seSBkbyBhbnl0aGluZyBpZiB3ZSdyZSBvbiB0aGUgYnJvd3Nlci5cbiAgICBpZiAoX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgdGhpcy5fY29udGFpbmVyRWxlbWVudCA9IGNvZXJjZUVsZW1lbnQoZWxlbWVudE9yRWxlbWVudFJlZik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZhZGVzIGluIGEgcmlwcGxlIGF0IHRoZSBnaXZlbiBjb29yZGluYXRlcy5cbiAgICogQHBhcmFtIHggQ29vcmRpbmF0ZSB3aXRoaW4gdGhlIGVsZW1lbnQsIGFsb25nIHRoZSBYIGF4aXMgYXQgd2hpY2ggdG8gc3RhcnQgdGhlIHJpcHBsZS5cbiAgICogQHBhcmFtIHkgQ29vcmRpbmF0ZSB3aXRoaW4gdGhlIGVsZW1lbnQsIGFsb25nIHRoZSBZIGF4aXMgYXQgd2hpY2ggdG8gc3RhcnQgdGhlIHJpcHBsZS5cbiAgICogQHBhcmFtIGNvbmZpZyBFeHRyYSByaXBwbGUgb3B0aW9ucy5cbiAgICovXG4gIGZhZGVJblJpcHBsZSh4OiBudW1iZXIsIHk6IG51bWJlciwgY29uZmlnOiBSaXBwbGVDb25maWcgPSB7fSk6IFJpcHBsZVJlZiB7XG4gICAgY29uc3QgY29udGFpbmVyUmVjdCA9ICh0aGlzLl9jb250YWluZXJSZWN0ID1cbiAgICAgIHRoaXMuX2NvbnRhaW5lclJlY3QgfHwgdGhpcy5fY29udGFpbmVyRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgY29uc3QgYW5pbWF0aW9uQ29uZmlnID0gey4uLmRlZmF1bHRSaXBwbGVBbmltYXRpb25Db25maWcsIC4uLmNvbmZpZy5hbmltYXRpb259O1xuXG4gICAgaWYgKGNvbmZpZy5jZW50ZXJlZCkge1xuICAgICAgeCA9IGNvbnRhaW5lclJlY3QubGVmdCArIGNvbnRhaW5lclJlY3Qud2lkdGggLyAyO1xuICAgICAgeSA9IGNvbnRhaW5lclJlY3QudG9wICsgY29udGFpbmVyUmVjdC5oZWlnaHQgLyAyO1xuICAgIH1cblxuICAgIGNvbnN0IHJhZGl1cyA9IGNvbmZpZy5yYWRpdXMgfHwgZGlzdGFuY2VUb0Z1cnRoZXN0Q29ybmVyKHgsIHksIGNvbnRhaW5lclJlY3QpO1xuICAgIGNvbnN0IG9mZnNldFggPSB4IC0gY29udGFpbmVyUmVjdC5sZWZ0O1xuICAgIGNvbnN0IG9mZnNldFkgPSB5IC0gY29udGFpbmVyUmVjdC50b3A7XG4gICAgY29uc3QgZW50ZXJEdXJhdGlvbiA9IGFuaW1hdGlvbkNvbmZpZy5lbnRlckR1cmF0aW9uO1xuXG4gICAgY29uc3QgcmlwcGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcmlwcGxlLmNsYXNzTGlzdC5hZGQoJ21hdC1yaXBwbGUtZWxlbWVudCcpO1xuXG4gICAgcmlwcGxlLnN0eWxlLmxlZnQgPSBgJHtvZmZzZXRYIC0gcmFkaXVzfXB4YDtcbiAgICByaXBwbGUuc3R5bGUudG9wID0gYCR7b2Zmc2V0WSAtIHJhZGl1c31weGA7XG4gICAgcmlwcGxlLnN0eWxlLmhlaWdodCA9IGAke3JhZGl1cyAqIDJ9cHhgO1xuICAgIHJpcHBsZS5zdHlsZS53aWR0aCA9IGAke3JhZGl1cyAqIDJ9cHhgO1xuXG4gICAgLy8gSWYgYSBjdXN0b20gY29sb3IgaGFzIGJlZW4gc3BlY2lmaWVkLCBzZXQgaXQgYXMgaW5saW5lIHN0eWxlLiBJZiBubyBjb2xvciBpc1xuICAgIC8vIHNldCwgdGhlIGRlZmF1bHQgY29sb3Igd2lsbCBiZSBhcHBsaWVkIHRocm91Z2ggdGhlIHJpcHBsZSB0aGVtZSBzdHlsZXMuXG4gICAgaWYgKGNvbmZpZy5jb2xvciAhPSBudWxsKSB7XG4gICAgICByaXBwbGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29uZmlnLmNvbG9yO1xuICAgIH1cblxuICAgIHJpcHBsZS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBgJHtlbnRlckR1cmF0aW9ufW1zYDtcblxuICAgIHRoaXMuX2NvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQocmlwcGxlKTtcblxuICAgIC8vIEJ5IGRlZmF1bHQgdGhlIGJyb3dzZXIgZG9lcyBub3QgcmVjYWxjdWxhdGUgdGhlIHN0eWxlcyBvZiBkeW5hbWljYWxseSBjcmVhdGVkXG4gICAgLy8gcmlwcGxlIGVsZW1lbnRzLiBUaGlzIGlzIGNyaXRpY2FsIHRvIGVuc3VyZSB0aGF0IHRoZSBgc2NhbGVgIGFuaW1hdGVzIHByb3Blcmx5LlxuICAgIC8vIFdlIGVuZm9yY2UgYSBzdHlsZSByZWNhbGN1bGF0aW9uIGJ5IGNhbGxpbmcgYGdldENvbXB1dGVkU3R5bGVgIGFuZCAqYWNjZXNzaW5nKiBhIHByb3BlcnR5LlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzVkNTJmYjA4MWIzNTcwYzgxZTNhXG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShyaXBwbGUpO1xuICAgIGNvbnN0IHVzZXJUcmFuc2l0aW9uUHJvcGVydHkgPSBjb21wdXRlZFN0eWxlcy50cmFuc2l0aW9uUHJvcGVydHk7XG4gICAgY29uc3QgdXNlclRyYW5zaXRpb25EdXJhdGlvbiA9IGNvbXB1dGVkU3R5bGVzLnRyYW5zaXRpb25EdXJhdGlvbjtcblxuICAgIC8vIE5vdGU6IFdlIGRldGVjdCB3aGV0aGVyIGFuaW1hdGlvbiBpcyBmb3JjaWJseSBkaXNhYmxlZCB0aHJvdWdoIENTUyAoZS5nLiB0aHJvdWdoXG4gICAgLy8gYHRyYW5zaXRpb246IG5vbmVgIG9yIGBkaXNwbGF5OiBub25lYCkuIFRoaXMgaXMgdGVjaG5pY2FsbHkgdW5leHBlY3RlZCBzaW5jZSBhbmltYXRpb25zIGFyZVxuICAgIC8vIGNvbnRyb2xsZWQgdGhyb3VnaCB0aGUgYW5pbWF0aW9uIGNvbmZpZywgYnV0IHRoaXMgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS4gVGhpc1xuICAgIC8vIGxvZ2ljIGRvZXMgbm90IG5lZWQgdG8gYmUgc3VwZXIgYWNjdXJhdGUgc2luY2UgaXQgY292ZXJzIHNvbWUgZWRnZSBjYXNlcyB3aGljaCBjYW4gYmUgZWFzaWx5XG4gICAgLy8gYXZvaWRlZCBieSB1c2Vycy5cbiAgICBjb25zdCBhbmltYXRpb25Gb3JjaWJseURpc2FibGVkVGhyb3VnaENzcyA9XG4gICAgICB1c2VyVHJhbnNpdGlvblByb3BlcnR5ID09PSAnbm9uZScgfHxcbiAgICAgIC8vIE5vdGU6IFRoZSBjYW5vbmljYWwgdW5pdCBmb3Igc2VyaWFsaXplZCBDU1MgYDx0aW1lPmAgcHJvcGVydGllcyBpcyBzZWNvbmRzLiBBZGRpdGlvbmFsbHlcbiAgICAgIC8vIHNvbWUgYnJvd3NlcnMgZXhwYW5kIHRoZSBkdXJhdGlvbiBmb3IgZXZlcnkgcHJvcGVydHkgKGluIG91ciBjYXNlIGBvcGFjaXR5YCBhbmQgYHRyYW5zZm9ybWApLlxuICAgICAgdXNlclRyYW5zaXRpb25EdXJhdGlvbiA9PT0gJzBzJyB8fFxuICAgICAgdXNlclRyYW5zaXRpb25EdXJhdGlvbiA9PT0gJzBzLCAwcycgfHxcbiAgICAgIC8vIElmIHRoZSBjb250YWluZXIgaXMgMHgwLCBpdCdzIGxpa2VseSBgZGlzcGxheTogbm9uZWAuXG4gICAgICAoY29udGFpbmVyUmVjdC53aWR0aCA9PT0gMCAmJiBjb250YWluZXJSZWN0LmhlaWdodCA9PT0gMCk7XG5cbiAgICAvLyBFeHBvc2VkIHJlZmVyZW5jZSB0byB0aGUgcmlwcGxlIHRoYXQgd2lsbCBiZSByZXR1cm5lZC5cbiAgICBjb25zdCByaXBwbGVSZWYgPSBuZXcgUmlwcGxlUmVmKHRoaXMsIHJpcHBsZSwgY29uZmlnLCBhbmltYXRpb25Gb3JjaWJseURpc2FibGVkVGhyb3VnaENzcyk7XG5cbiAgICAvLyBTdGFydCB0aGUgZW50ZXIgYW5pbWF0aW9uIGJ5IHNldHRpbmcgdGhlIHRyYW5zZm9ybS9zY2FsZSB0byAxMDAlLiBUaGUgYW5pbWF0aW9uIHdpbGxcbiAgICAvLyBleGVjdXRlIGFzIHBhcnQgb2YgdGhpcyBzdGF0ZW1lbnQgYmVjYXVzZSB3ZSBmb3JjZWQgYSBzdHlsZSByZWNhbGN1bGF0aW9uIGJlZm9yZS5cbiAgICAvLyBOb3RlOiBXZSB1c2UgYSAzZCB0cmFuc2Zvcm0gaGVyZSBpbiBvcmRlciB0byBhdm9pZCBhbiBpc3N1ZSBpbiBTYWZhcmkgd2hlcmVcbiAgICAvLyB0aGUgcmlwcGxlcyBhcmVuJ3QgY2xpcHBlZCB3aGVuIGluc2lkZSB0aGUgc2hhZG93IERPTSAoc2VlICMyNDAyOCkuXG4gICAgcmlwcGxlLnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZTNkKDEsIDEsIDEpJztcblxuICAgIHJpcHBsZVJlZi5zdGF0ZSA9IFJpcHBsZVN0YXRlLkZBRElOR19JTjtcblxuICAgIGlmICghY29uZmlnLnBlcnNpc3RlbnQpIHtcbiAgICAgIHRoaXMuX21vc3RSZWNlbnRUcmFuc2llbnRSaXBwbGUgPSByaXBwbGVSZWY7XG4gICAgfVxuXG4gICAgbGV0IGV2ZW50TGlzdGVuZXJzOiBSaXBwbGVFdmVudExpc3RlbmVycyB8IG51bGwgPSBudWxsO1xuXG4gICAgLy8gRG8gbm90IHJlZ2lzdGVyIHRoZSBgdHJhbnNpdGlvbmAgZXZlbnQgbGlzdGVuZXIgaWYgZmFkZS1pbiBhbmQgZmFkZS1vdXQgZHVyYXRpb25cbiAgICAvLyBhcmUgc2V0IHRvIHplcm8uIFRoZSBldmVudHMgd29uJ3QgZmlyZSBhbnl3YXkgYW5kIHdlIGNhbiBzYXZlIHJlc291cmNlcyBoZXJlLlxuICAgIGlmICghYW5pbWF0aW9uRm9yY2libHlEaXNhYmxlZFRocm91Z2hDc3MgJiYgKGVudGVyRHVyYXRpb24gfHwgYW5pbWF0aW9uQ29uZmlnLmV4aXREdXJhdGlvbikpIHtcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uVHJhbnNpdGlvbkVuZCA9ICgpID0+IHtcbiAgICAgICAgICAvLyBDbGVhciB0aGUgZmFsbGJhY2sgdGltZXIgc2luY2UgdGhlIHRyYW5zaXRpb24gZmlyZWQgY29ycmVjdGx5LlxuICAgICAgICAgIGlmIChldmVudExpc3RlbmVycykge1xuICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMuZmFsbGJhY2tUaW1lciA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNsZWFyVGltZW91dChmYWxsYmFja1RpbWVyKTtcbiAgICAgICAgICB0aGlzLl9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uVHJhbnNpdGlvbkNhbmNlbCA9ICgpID0+IHRoaXMuX2Rlc3Ryb3lSaXBwbGUocmlwcGxlUmVmKTtcblxuICAgICAgICAvLyBJbiBzb21lIGNhc2VzIHdoZXJlIHRoZXJlJ3MgYSBoaWdoZXIgbG9hZCBvbiB0aGUgYnJvd3NlciwgaXQgY2FuIGNob29zZSBub3QgdG8gZGlzcGF0Y2hcbiAgICAgICAgLy8gbmVpdGhlciBgdHJhbnNpdGlvbmVuZGAgbm9yIGB0cmFuc2l0aW9uY2FuY2VsYCAoc2VlIGIvMjI3MzU2Njc0KS4gVGhpcyB0aW1lciBzZXJ2ZXMgYXMgYVxuICAgICAgICAvLyBmYWxsYmFjayBmb3Igc3VjaCBjYXNlcyBzbyB0aGF0IHRoZSByaXBwbGUgZG9lc24ndCBiZWNvbWUgc3R1Y2suIFdlIGFkZCBhIDEwMG1zIGJ1ZmZlclxuICAgICAgICAvLyBiZWNhdXNlIHRpbWVycyBhcmVuJ3QgcHJlY2lzZS4gTm90ZSB0aGF0IGFub3RoZXIgYXBwcm9hY2ggY2FuIGJlIHRvIHRyYW5zaXRpb24gdGhlIHJpcHBsZVxuICAgICAgICAvLyB0byB0aGUgYFZJU0lCTEVgIHN0YXRlIGltbWVkaWF0ZWx5IGFib3ZlIGFuZCB0byBgRkFESU5HX0lOYCBhZnRlcndhcmRzIGluc2lkZVxuICAgICAgICAvLyBgdHJhbnNpdGlvbnN0YXJ0YC4gV2UgZ28gd2l0aCB0aGUgdGltZXIgYmVjYXVzZSBpdCdzIG9uZSBsZXNzIGV2ZW50IGxpc3RlbmVyIGFuZFxuICAgICAgICAvLyBpdCdzIGxlc3MgbGlrZWx5IHRvIGJyZWFrIGV4aXN0aW5nIHRlc3RzLlxuICAgICAgICBjb25zdCBmYWxsYmFja1RpbWVyID0gc2V0VGltZW91dChvblRyYW5zaXRpb25DYW5jZWwsIGVudGVyRHVyYXRpb24gKyAxMDApO1xuXG4gICAgICAgIHJpcHBsZS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgLy8gSWYgdGhlIHRyYW5zaXRpb24gaXMgY2FuY2VsbGVkIChlLmcuIGR1ZSB0byBET00gcmVtb3ZhbCksIHdlIGRlc3Ryb3kgdGhlIHJpcHBsZVxuICAgICAgICAvLyBkaXJlY3RseSBhcyBvdGhlcndpc2Ugd2Ugd291bGQga2VlcCBpdCBwYXJ0IG9mIHRoZSByaXBwbGUgY29udGFpbmVyIGZvcmV2ZXIuXG4gICAgICAgIC8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtdHJhbnNpdGlvbnMtMS8jOn46dGV4dD1ubyUyMGxvbmdlciUyMGluJTIwdGhlJTIwZG9jdW1lbnQuXG4gICAgICAgIHJpcHBsZS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uY2FuY2VsJywgb25UcmFuc2l0aW9uQ2FuY2VsKTtcbiAgICAgICAgZXZlbnRMaXN0ZW5lcnMgPSB7b25UcmFuc2l0aW9uRW5kLCBvblRyYW5zaXRpb25DYW5jZWwsIGZhbGxiYWNrVGltZXJ9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSByaXBwbGUgcmVmZXJlbmNlIHRvIHRoZSBsaXN0IG9mIGFsbCBhY3RpdmUgcmlwcGxlcy5cbiAgICB0aGlzLl9hY3RpdmVSaXBwbGVzLnNldChyaXBwbGVSZWYsIGV2ZW50TGlzdGVuZXJzKTtcblxuICAgIC8vIEluIGNhc2UgdGhlcmUgaXMgbm8gZmFkZS1pbiB0cmFuc2l0aW9uIGR1cmF0aW9uLCB3ZSBuZWVkIHRvIG1hbnVhbGx5IGNhbGwgdGhlIHRyYW5zaXRpb25cbiAgICAvLyBlbmQgbGlzdGVuZXIgYmVjYXVzZSBgdHJhbnNpdGlvbmVuZGAgZG9lc24ndCBmaXJlIGlmIHRoZXJlIGlzIG5vIHRyYW5zaXRpb24uXG4gICAgaWYgKGFuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzIHx8ICFlbnRlckR1cmF0aW9uKSB7XG4gICAgICB0aGlzLl9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJpcHBsZVJlZjtcbiAgfVxuXG4gIC8qKiBGYWRlcyBvdXQgYSByaXBwbGUgcmVmZXJlbmNlLiAqL1xuICBmYWRlT3V0UmlwcGxlKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgLy8gRm9yIHJpcHBsZXMgYWxyZWFkeSBmYWRpbmcgb3V0IG9yIGhpZGRlbiwgdGhpcyBzaG91bGQgYmUgYSBub29wLlxuICAgIGlmIChyaXBwbGVSZWYuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkZBRElOR19PVVQgfHwgcmlwcGxlUmVmLnN0YXRlID09PSBSaXBwbGVTdGF0ZS5ISURERU4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByaXBwbGVFbCA9IHJpcHBsZVJlZi5lbGVtZW50O1xuICAgIGNvbnN0IGFuaW1hdGlvbkNvbmZpZyA9IHsuLi5kZWZhdWx0UmlwcGxlQW5pbWF0aW9uQ29uZmlnLCAuLi5yaXBwbGVSZWYuY29uZmlnLmFuaW1hdGlvbn07XG5cbiAgICAvLyBUaGlzIHN0YXJ0cyB0aGUgZmFkZS1vdXQgdHJhbnNpdGlvbiBhbmQgd2lsbCBmaXJlIHRoZSB0cmFuc2l0aW9uIGVuZCBsaXN0ZW5lciB0aGF0XG4gICAgLy8gcmVtb3ZlcyB0aGUgcmlwcGxlIGVsZW1lbnQgZnJvbSB0aGUgRE9NLlxuICAgIHJpcHBsZUVsLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAke2FuaW1hdGlvbkNvbmZpZy5leGl0RHVyYXRpb259bXNgO1xuICAgIHJpcHBsZUVsLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuRkFESU5HX09VVDtcblxuICAgIC8vIEluIGNhc2UgdGhlcmUgaXMgbm8gZmFkZS1vdXQgdHJhbnNpdGlvbiBkdXJhdGlvbiwgd2UgbmVlZCB0byBtYW51YWxseSBjYWxsIHRoZVxuICAgIC8vIHRyYW5zaXRpb24gZW5kIGxpc3RlbmVyIGJlY2F1c2UgYHRyYW5zaXRpb25lbmRgIGRvZXNuJ3QgZmlyZSBpZiB0aGVyZSBpcyBubyB0cmFuc2l0aW9uLlxuICAgIGlmIChyaXBwbGVSZWYuX2FuaW1hdGlvbkZvcmNpYmx5RGlzYWJsZWRUaHJvdWdoQ3NzIHx8ICFhbmltYXRpb25Db25maWcuZXhpdER1cmF0aW9uKSB7XG4gICAgICB0aGlzLl9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZhZGVzIG91dCBhbGwgY3VycmVudGx5IGFjdGl2ZSByaXBwbGVzLiAqL1xuICBmYWRlT3V0QWxsKCkge1xuICAgIHRoaXMuX2dldEFjdGl2ZVJpcHBsZXMoKS5mb3JFYWNoKHJpcHBsZSA9PiByaXBwbGUuZmFkZU91dCgpKTtcbiAgfVxuXG4gIC8qKiBGYWRlcyBvdXQgYWxsIGN1cnJlbnRseSBhY3RpdmUgbm9uLXBlcnNpc3RlbnQgcmlwcGxlcy4gKi9cbiAgZmFkZU91dEFsbE5vblBlcnNpc3RlbnQoKSB7XG4gICAgdGhpcy5fZ2V0QWN0aXZlUmlwcGxlcygpLmZvckVhY2gocmlwcGxlID0+IHtcbiAgICAgIGlmICghcmlwcGxlLmNvbmZpZy5wZXJzaXN0ZW50KSB7XG4gICAgICAgIHJpcHBsZS5mYWRlT3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogU2V0cyB1cCB0aGUgdHJpZ2dlciBldmVudCBsaXN0ZW5lcnMgKi9cbiAgc2V0dXBUcmlnZ2VyRXZlbnRzKGVsZW1lbnRPckVsZW1lbnRSZWY6IEhUTUxFbGVtZW50IHwgRWxlbWVudFJlZjxIVE1MRWxlbWVudD4pIHtcbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudChlbGVtZW50T3JFbGVtZW50UmVmKTtcblxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyIHx8ICFlbGVtZW50IHx8IGVsZW1lbnQgPT09IHRoaXMuX3RyaWdnZXJFbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFsbCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAgICB0aGlzLl9yZW1vdmVUcmlnZ2VyRXZlbnRzKCk7XG4gICAgdGhpcy5fdHJpZ2dlckVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLy8gVXNlIGV2ZW50IGRlbGVnYXRpb24gZm9yIHRoZSB0cmlnZ2VyIGV2ZW50cyBzaW5jZSB0aGV5J3JlXG4gICAgLy8gc2V0IHVwIGR1cmluZyBjcmVhdGlvbiBhbmQgYXJlIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZS5cbiAgICBwb2ludGVyRG93bkV2ZW50cy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgUmlwcGxlUmVuZGVyZXIuX2V2ZW50TWFuYWdlci5hZGRIYW5kbGVyKHRoaXMuX25nWm9uZSwgdHlwZSwgZWxlbWVudCwgdGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhbGwgcmVnaXN0ZXJlZCBldmVudHMuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGhhbmRsZUV2ZW50KGV2ZW50OiBFdmVudCkge1xuICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgdGhpcy5fb25Nb3VzZWRvd24oZXZlbnQgYXMgTW91c2VFdmVudCk7XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgIHRoaXMuX29uVG91Y2hTdGFydChldmVudCBhcyBUb3VjaEV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fb25Qb2ludGVyVXAoKTtcbiAgICB9XG5cbiAgICAvLyBJZiBwb2ludGVyLXVwIGV2ZW50cyBoYXZlbid0IGJlZW4gcmVnaXN0ZXJlZCB5ZXQsIGRvIHNvIG5vdy5cbiAgICAvLyBXZSBkbyB0aGlzIG9uLWRlbWFuZCBpbiBvcmRlciB0byByZWR1Y2UgdGhlIHRvdGFsIG51bWJlciBvZiBldmVudCBsaXN0ZW5lcnNcbiAgICAvLyByZWdpc3RlcmVkIGJ5IHRoZSByaXBwbGVzLCB3aGljaCBzcGVlZHMgdXAgdGhlIHJlbmRlcmluZyB0aW1lIGZvciBsYXJnZSBVSXMuXG4gICAgaWYgKCF0aGlzLl9wb2ludGVyVXBFdmVudHNSZWdpc3RlcmVkKSB7XG4gICAgICAvLyBUaGUgZXZlbnRzIGZvciBoaWRpbmcgdGhlIHJpcHBsZSBhcmUgYm91bmQgZGlyZWN0bHkgb24gdGhlIHRyaWdnZXIsIGJlY2F1c2U6XG4gICAgICAvLyAxLiBTb21lIG9mIHRoZW0gb2NjdXIgZnJlcXVlbnRseSAoZS5nLiBgbW91c2VsZWF2ZWApIGFuZCBhbnkgYWR2YW50YWdlIHdlIGdldCBmcm9tXG4gICAgICAvLyBkZWxlZ2F0aW9uIHdpbGwgYmUgZGltaW5pc2hlZCBieSBoYXZpbmcgdG8gbG9vayB0aHJvdWdoIGFsbCB0aGUgZGF0YSBzdHJ1Y3R1cmVzIG9mdGVuLlxuICAgICAgLy8gMi4gVGhleSBhcmVuJ3QgYXMgcGVyZm9ybWFuY2Utc2Vuc2l0aXZlLCBiZWNhdXNlIHRoZXkncmUgYm91bmQgb25seSBhZnRlciB0aGUgdXNlclxuICAgICAgLy8gaGFzIGludGVyYWN0ZWQgd2l0aCBhbiBlbGVtZW50LlxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgcG9pbnRlclVwRXZlbnRzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgICAgdGhpcy5fdHJpZ2dlckVsZW1lbnQhLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcywgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BvaW50ZXJVcEV2ZW50c1JlZ2lzdGVyZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBNZXRob2QgdGhhdCB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgZmFkZS1pbiBvciBmYWRlLWluIHRyYW5zaXRpb24gY29tcGxldGVkLiAqL1xuICBwcml2YXRlIF9maW5pc2hSaXBwbGVUcmFuc2l0aW9uKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgaWYgKHJpcHBsZVJlZi5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuRkFESU5HX0lOKSB7XG4gICAgICB0aGlzLl9zdGFydEZhZGVPdXRUcmFuc2l0aW9uKHJpcHBsZVJlZik7XG4gICAgfSBlbHNlIGlmIChyaXBwbGVSZWYuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkZBRElOR19PVVQpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lSaXBwbGUocmlwcGxlUmVmKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBmYWRlLW91dCB0cmFuc2l0aW9uIG9mIHRoZSBnaXZlbiByaXBwbGUgaWYgaXQncyBub3QgcGVyc2lzdGVudCBhbmQgdGhlIHBvaW50ZXJcbiAgICogaXMgbm90IGhlbGQgZG93biBhbnltb3JlLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3RhcnRGYWRlT3V0VHJhbnNpdGlvbihyaXBwbGVSZWY6IFJpcHBsZVJlZikge1xuICAgIGNvbnN0IGlzTW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSA9IHJpcHBsZVJlZiA9PT0gdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZTtcbiAgICBjb25zdCB7cGVyc2lzdGVudH0gPSByaXBwbGVSZWYuY29uZmlnO1xuXG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuVklTSUJMRTtcblxuICAgIC8vIFdoZW4gdGhlIHRpbWVyIHJ1bnMgb3V0IHdoaWxlIHRoZSB1c2VyIGhhcyBrZXB0IHRoZWlyIHBvaW50ZXIgZG93biwgd2Ugd2FudCB0b1xuICAgIC8vIGtlZXAgb25seSB0aGUgcGVyc2lzdGVudCByaXBwbGVzIGFuZCB0aGUgbGF0ZXN0IHRyYW5zaWVudCByaXBwbGUuIFdlIGRvIHRoaXMsXG4gICAgLy8gYmVjYXVzZSB3ZSBkb24ndCB3YW50IHN0YWNrZWQgdHJhbnNpZW50IHJpcHBsZXMgdG8gYXBwZWFyIGFmdGVyIHRoZWlyIGVudGVyXG4gICAgLy8gYW5pbWF0aW9uIGhhcyBmaW5pc2hlZC5cbiAgICBpZiAoIXBlcnNpc3RlbnQgJiYgKCFpc01vc3RSZWNlbnRUcmFuc2llbnRSaXBwbGUgfHwgIXRoaXMuX2lzUG9pbnRlckRvd24pKSB7XG4gICAgICByaXBwbGVSZWYuZmFkZU91dCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXN0cm95cyB0aGUgZ2l2ZW4gcmlwcGxlIGJ5IHJlbW92aW5nIGl0IGZyb20gdGhlIERPTSBhbmQgdXBkYXRpbmcgaXRzIHN0YXRlLiAqL1xuICBwcml2YXRlIF9kZXN0cm95UmlwcGxlKHJpcHBsZVJlZjogUmlwcGxlUmVmKSB7XG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSB0aGlzLl9hY3RpdmVSaXBwbGVzLmdldChyaXBwbGVSZWYpID8/IG51bGw7XG4gICAgdGhpcy5fYWN0aXZlUmlwcGxlcy5kZWxldGUocmlwcGxlUmVmKTtcblxuICAgIC8vIENsZWFyIG91dCB0aGUgY2FjaGVkIGJvdW5kaW5nIHJlY3QgaWYgd2UgaGF2ZSBubyBtb3JlIHJpcHBsZXMuXG4gICAgaWYgKCF0aGlzLl9hY3RpdmVSaXBwbGVzLnNpemUpIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lclJlY3QgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBjdXJyZW50IHJlZiBpcyB0aGUgbW9zdCByZWNlbnQgdHJhbnNpZW50IHJpcHBsZSwgdW5zZXQgaXRcbiAgICAvLyBhdm9pZCBtZW1vcnkgbGVha3MuXG4gICAgaWYgKHJpcHBsZVJlZiA9PT0gdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSkge1xuICAgICAgdGhpcy5fbW9zdFJlY2VudFRyYW5zaWVudFJpcHBsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmlwcGxlUmVmLnN0YXRlID0gUmlwcGxlU3RhdGUuSElEREVOO1xuICAgIGlmIChldmVudExpc3RlbmVycyAhPT0gbnVsbCkge1xuICAgICAgcmlwcGxlUmVmLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGV2ZW50TGlzdGVuZXJzLm9uVHJhbnNpdGlvbkVuZCk7XG4gICAgICByaXBwbGVSZWYuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uY2FuY2VsJywgZXZlbnRMaXN0ZW5lcnMub25UcmFuc2l0aW9uQ2FuY2VsKTtcbiAgICAgIGlmIChldmVudExpc3RlbmVycy5mYWxsYmFja1RpbWVyICE9PSBudWxsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChldmVudExpc3RlbmVycy5mYWxsYmFja1RpbWVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmlwcGxlUmVmLmVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICAvKiogRnVuY3Rpb24gYmVpbmcgY2FsbGVkIHdoZW5ldmVyIHRoZSB0cmlnZ2VyIGlzIGJlaW5nIHByZXNzZWQgdXNpbmcgbW91c2UuICovXG4gIHByaXZhdGUgX29uTW91c2Vkb3duKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gU2NyZWVuIHJlYWRlcnMgd2lsbCBmaXJlIGZha2UgbW91c2UgZXZlbnRzIGZvciBzcGFjZS9lbnRlci4gU2tpcCBsYXVuY2hpbmcgYVxuICAgIC8vIHJpcHBsZSBpbiB0aGlzIGNhc2UgZm9yIGNvbnNpc3RlbmN5IHdpdGggdGhlIG5vbi1zY3JlZW4tcmVhZGVyIGV4cGVyaWVuY2UuXG4gICAgY29uc3QgaXNGYWtlTW91c2Vkb3duID0gaXNGYWtlTW91c2Vkb3duRnJvbVNjcmVlblJlYWRlcihldmVudCk7XG4gICAgY29uc3QgaXNTeW50aGV0aWNFdmVudCA9XG4gICAgICB0aGlzLl9sYXN0VG91Y2hTdGFydEV2ZW50ICYmXG4gICAgICBEYXRlLm5vdygpIDwgdGhpcy5fbGFzdFRvdWNoU3RhcnRFdmVudCArIGlnbm9yZU1vdXNlRXZlbnRzVGltZW91dDtcblxuICAgIGlmICghdGhpcy5fdGFyZ2V0LnJpcHBsZURpc2FibGVkICYmICFpc0Zha2VNb3VzZWRvd24gJiYgIWlzU3ludGhldGljRXZlbnQpIHtcbiAgICAgIHRoaXMuX2lzUG9pbnRlckRvd24gPSB0cnVlO1xuICAgICAgdGhpcy5mYWRlSW5SaXBwbGUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgdGhpcy5fdGFyZ2V0LnJpcHBsZUNvbmZpZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZ1bmN0aW9uIGJlaW5nIGNhbGxlZCB3aGVuZXZlciB0aGUgdHJpZ2dlciBpcyBiZWluZyBwcmVzc2VkIHVzaW5nIHRvdWNoLiAqL1xuICBwcml2YXRlIF9vblRvdWNoU3RhcnQoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3RhcmdldC5yaXBwbGVEaXNhYmxlZCAmJiAhaXNGYWtlVG91Y2hzdGFydEZyb21TY3JlZW5SZWFkZXIoZXZlbnQpKSB7XG4gICAgICAvLyBTb21lIGJyb3dzZXJzIGZpcmUgbW91c2UgZXZlbnRzIGFmdGVyIGEgYHRvdWNoc3RhcnRgIGV2ZW50LiBUaG9zZSBzeW50aGV0aWMgbW91c2VcbiAgICAgIC8vIGV2ZW50cyB3aWxsIGxhdW5jaCBhIHNlY29uZCByaXBwbGUgaWYgd2UgZG9uJ3QgaWdub3JlIG1vdXNlIGV2ZW50cyBmb3IgYSBzcGVjaWZpY1xuICAgICAgLy8gdGltZSBhZnRlciBhIHRvdWNoc3RhcnQgZXZlbnQuXG4gICAgICB0aGlzLl9sYXN0VG91Y2hTdGFydEV2ZW50ID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMuX2lzUG9pbnRlckRvd24gPSB0cnVlO1xuXG4gICAgICAvLyBVc2UgYGNoYW5nZWRUb3VjaGVzYCBzbyB3ZSBza2lwIGFueSB0b3VjaGVzIHdoZXJlIHRoZSB1c2VyIHB1dFxuICAgICAgLy8gdGhlaXIgZmluZ2VyIGRvd24sIGJ1dCB1c2VkIGFub3RoZXIgZmluZ2VyIHRvIHRhcCB0aGUgZWxlbWVudCBhZ2Fpbi5cbiAgICAgIGNvbnN0IHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcyBhcyBUb3VjaExpc3QgfCB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIEFjY29yZGluZyB0byB0aGUgdHlwaW5ncyB0aGUgdG91Y2hlcyBzaG91bGQgYWx3YXlzIGJlIGRlZmluZWQsIGJ1dCBpbiBzb21lIGNhc2VzXG4gICAgICAvLyB0aGUgYnJvd3NlciBhcHBlYXJzIHRvIG5vdCBhc3NpZ24gdGhlbSBpbiB0ZXN0cyB3aGljaCBsZWFkcyB0byBmbGFrZXMuXG4gICAgICBpZiAodG91Y2hlcykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmZhZGVJblJpcHBsZSh0b3VjaGVzW2ldLmNsaWVudFgsIHRvdWNoZXNbaV0uY2xpZW50WSwgdGhpcy5fdGFyZ2V0LnJpcHBsZUNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogRnVuY3Rpb24gYmVpbmcgY2FsbGVkIHdoZW5ldmVyIHRoZSB0cmlnZ2VyIGlzIGJlaW5nIHJlbGVhc2VkLiAqL1xuICBwcml2YXRlIF9vblBvaW50ZXJVcCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzUG9pbnRlckRvd24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc1BvaW50ZXJEb3duID0gZmFsc2U7XG5cbiAgICAvLyBGYWRlLW91dCBhbGwgcmlwcGxlcyB0aGF0IGFyZSB2aXNpYmxlIGFuZCBub3QgcGVyc2lzdGVudC5cbiAgICB0aGlzLl9nZXRBY3RpdmVSaXBwbGVzKCkuZm9yRWFjaChyaXBwbGUgPT4ge1xuICAgICAgLy8gQnkgZGVmYXVsdCwgb25seSByaXBwbGVzIHRoYXQgYXJlIGNvbXBsZXRlbHkgdmlzaWJsZSB3aWxsIGZhZGUgb3V0IG9uIHBvaW50ZXIgcmVsZWFzZS5cbiAgICAgIC8vIElmIHRoZSBgdGVybWluYXRlT25Qb2ludGVyVXBgIG9wdGlvbiBpcyBzZXQsIHJpcHBsZXMgdGhhdCBzdGlsbCBmYWRlIGluIHdpbGwgYWxzbyBmYWRlIG91dC5cbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9XG4gICAgICAgIHJpcHBsZS5zdGF0ZSA9PT0gUmlwcGxlU3RhdGUuVklTSUJMRSB8fFxuICAgICAgICAocmlwcGxlLmNvbmZpZy50ZXJtaW5hdGVPblBvaW50ZXJVcCAmJiByaXBwbGUuc3RhdGUgPT09IFJpcHBsZVN0YXRlLkZBRElOR19JTik7XG5cbiAgICAgIGlmICghcmlwcGxlLmNvbmZpZy5wZXJzaXN0ZW50ICYmIGlzVmlzaWJsZSkge1xuICAgICAgICByaXBwbGUuZmFkZU91dCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QWN0aXZlUmlwcGxlcygpOiBSaXBwbGVSZWZbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fYWN0aXZlUmlwcGxlcy5rZXlzKCkpO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgcHJldmlvdXNseSByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycyBmcm9tIHRoZSB0cmlnZ2VyIGVsZW1lbnQuICovXG4gIF9yZW1vdmVUcmlnZ2VyRXZlbnRzKCkge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyRWxlbWVudDtcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICBwb2ludGVyRG93bkV2ZW50cy5mb3JFYWNoKHR5cGUgPT5cbiAgICAgICAgUmlwcGxlUmVuZGVyZXIuX2V2ZW50TWFuYWdlci5yZW1vdmVIYW5kbGVyKHR5cGUsIHRyaWdnZXIsIHRoaXMpLFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMuX3BvaW50ZXJVcEV2ZW50c1JlZ2lzdGVyZWQpIHtcbiAgICAgICAgcG9pbnRlclVwRXZlbnRzLmZvckVhY2godHlwZSA9PlxuICAgICAgICAgIHRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLl9wb2ludGVyVXBFdmVudHNSZWdpc3RlcmVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcG9pbnQgKHgsIHkpIHRvIHRoZSBmdXJ0aGVzdCBjb3JuZXIgb2YgYSByZWN0YW5nbGUuXG4gKi9cbmZ1bmN0aW9uIGRpc3RhbmNlVG9GdXJ0aGVzdENvcm5lcih4OiBudW1iZXIsIHk6IG51bWJlciwgcmVjdDogRE9NUmVjdCkge1xuICBjb25zdCBkaXN0WCA9IE1hdGgubWF4KE1hdGguYWJzKHggLSByZWN0LmxlZnQpLCBNYXRoLmFicyh4IC0gcmVjdC5yaWdodCkpO1xuICBjb25zdCBkaXN0WSA9IE1hdGgubWF4KE1hdGguYWJzKHkgLSByZWN0LnRvcCksIE1hdGguYWJzKHkgLSByZWN0LmJvdHRvbSkpO1xuICByZXR1cm4gTWF0aC5zcXJ0KGRpc3RYICogZGlzdFggKyBkaXN0WSAqIGRpc3RZKTtcbn1cbiJdfQ==