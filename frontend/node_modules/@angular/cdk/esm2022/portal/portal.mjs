/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, } from '@angular/core';
import { throwNullPortalOutletError, throwPortalAlreadyAttachedError, throwNoPortalAttachedError, throwNullPortalError, throwPortalOutletAlreadyDisposedError, throwUnknownPortalTypeError, } from './portal-errors';
/**
 * A `Portal` is something that you want to render somewhere else.
 * It can be attach to / detached from a `PortalOutlet`.
 */
export class Portal {
    /** Attach this portal to a host. */
    attach(host) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (host == null) {
                throwNullPortalOutletError();
            }
            if (host.hasAttached()) {
                throwPortalAlreadyAttachedError();
            }
        }
        this._attachedHost = host;
        return host.attach(this);
    }
    /** Detach this portal from its host */
    detach() {
        let host = this._attachedHost;
        if (host != null) {
            this._attachedHost = null;
            host.detach();
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throwNoPortalAttachedError();
        }
    }
    /** Whether this portal is attached to a host. */
    get isAttached() {
        return this._attachedHost != null;
    }
    /**
     * Sets the PortalOutlet reference without performing `attach()`. This is used directly by
     * the PortalOutlet when it is performing an `attach()` or `detach()`.
     */
    setAttachedHost(host) {
        this._attachedHost = host;
    }
}
/**
 * A `ComponentPortal` is a portal that instantiates some Component upon attachment.
 */
export class ComponentPortal extends Portal {
    constructor(component, viewContainerRef, injector, componentFactoryResolver, projectableNodes) {
        super();
        this.component = component;
        this.viewContainerRef = viewContainerRef;
        this.injector = injector;
        this.componentFactoryResolver = componentFactoryResolver;
        this.projectableNodes = projectableNodes;
    }
}
/**
 * A `TemplatePortal` is a portal that represents some embedded template (TemplateRef).
 */
export class TemplatePortal extends Portal {
    constructor(
    /** The embedded template that will be used to instantiate an embedded View in the host. */
    templateRef, 
    /** Reference to the ViewContainer into which the template will be stamped out. */
    viewContainerRef, 
    /** Contextual data to be passed in to the embedded view. */
    context, 
    /** The injector to use for the embedded view. */
    injector) {
        super();
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.context = context;
        this.injector = injector;
    }
    get origin() {
        return this.templateRef.elementRef;
    }
    /**
     * Attach the portal to the provided `PortalOutlet`.
     * When a context is provided it will override the `context` property of the `TemplatePortal`
     * instance.
     */
    attach(host, context = this.context) {
        this.context = context;
        return super.attach(host);
    }
    detach() {
        this.context = undefined;
        return super.detach();
    }
}
/**
 * A `DomPortal` is a portal whose DOM element will be taken from its current position
 * in the DOM and moved into a portal outlet, when it is attached. On detach, the content
 * will be restored to its original position.
 */
export class DomPortal extends Portal {
    constructor(element) {
        super();
        this.element = element instanceof ElementRef ? element.nativeElement : element;
    }
}
/**
 * Partial implementation of PortalOutlet that handles attaching
 * ComponentPortal and TemplatePortal.
 */
export class BasePortalOutlet {
    constructor() {
        /** Whether this host has already been permanently disposed. */
        this._isDisposed = false;
        // @breaking-change 10.0.0 `attachDomPortal` to become a required abstract method.
        this.attachDomPortal = null;
    }
    /** Whether this host has an attached portal. */
    hasAttached() {
        return !!this._attachedPortal;
    }
    /** Attaches a portal. */
    attach(portal) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!portal) {
                throwNullPortalError();
            }
            if (this.hasAttached()) {
                throwPortalAlreadyAttachedError();
            }
            if (this._isDisposed) {
                throwPortalOutletAlreadyDisposedError();
            }
        }
        if (portal instanceof ComponentPortal) {
            this._attachedPortal = portal;
            return this.attachComponentPortal(portal);
        }
        else if (portal instanceof TemplatePortal) {
            this._attachedPortal = portal;
            return this.attachTemplatePortal(portal);
            // @breaking-change 10.0.0 remove null check for `this.attachDomPortal`.
        }
        else if (this.attachDomPortal && portal instanceof DomPortal) {
            this._attachedPortal = portal;
            return this.attachDomPortal(portal);
        }
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throwUnknownPortalTypeError();
        }
    }
    /** Detaches a previously attached portal. */
    detach() {
        if (this._attachedPortal) {
            this._attachedPortal.setAttachedHost(null);
            this._attachedPortal = null;
        }
        this._invokeDisposeFn();
    }
    /** Permanently dispose of this portal host. */
    dispose() {
        if (this.hasAttached()) {
            this.detach();
        }
        this._invokeDisposeFn();
        this._isDisposed = true;
    }
    /** @docs-private */
    setDisposeFn(fn) {
        this._disposeFn = fn;
    }
    _invokeDisposeFn() {
        if (this._disposeFn) {
            this._disposeFn();
            this._disposeFn = null;
        }
    }
}
/**
 * @deprecated Use `BasePortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export class BasePortalHost extends BasePortalOutlet {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9wb3J0YWwvcG9ydGFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFHTCxVQUFVLEdBS1gsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLDBCQUEwQixFQUMxQiwrQkFBK0IsRUFDL0IsMEJBQTBCLEVBQzFCLG9CQUFvQixFQUNwQixxQ0FBcUMsRUFDckMsMkJBQTJCLEdBQzVCLE1BQU0saUJBQWlCLENBQUM7QUFPekI7OztHQUdHO0FBQ0gsTUFBTSxPQUFnQixNQUFNO0lBRzFCLG9DQUFvQztJQUNwQyxNQUFNLENBQUMsSUFBa0I7UUFDdkIsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7WUFDbEQsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2pCLDBCQUEwQixFQUFFLENBQUM7WUFDL0IsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZCLCtCQUErQixFQUFFLENBQUM7WUFDcEMsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMxQixPQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELHVDQUF1QztJQUN2QyxNQUFNO1FBQ0osSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUU5QixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQzthQUFNLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3pELDBCQUEw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QztRQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsb0JBQW9CO0lBQ3BCLFlBQVksQ0FBQyxFQUFjO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQWdCLGNBQWUsU0FBUSxnQkFBZ0I7Q0FBRyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgRWxlbWVudFJlZixcbiAgQ29tcG9uZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEluamVjdG9yLFxuICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgdGhyb3dOdWxsUG9ydGFsT3V0bGV0RXJyb3IsXG4gIHRocm93UG9ydGFsQWxyZWFkeUF0dGFjaGVkRXJyb3IsXG4gIHRocm93Tm9Qb3J0YWxBdHRhY2hlZEVycm9yLFxuICB0aHJvd051bGxQb3J0YWxFcnJvcixcbiAgdGhyb3dQb3J0YWxPdXRsZXRBbHJlYWR5RGlzcG9zZWRFcnJvcixcbiAgdGhyb3dVbmtub3duUG9ydGFsVHlwZUVycm9yLFxufSBmcm9tICcuL3BvcnRhbC1lcnJvcnMnO1xuXG4vKiogSW50ZXJmYWNlIHRoYXQgY2FuIGJlIHVzZWQgdG8gZ2VuZXJpY2FsbHkgdHlwZSBhIGNsYXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRUeXBlPFQ+IHtcbiAgbmV3ICguLi5hcmdzOiBhbnlbXSk6IFQ7XG59XG5cbi8qKlxuICogQSBgUG9ydGFsYCBpcyBzb21ldGhpbmcgdGhhdCB5b3Ugd2FudCB0byByZW5kZXIgc29tZXdoZXJlIGVsc2UuXG4gKiBJdCBjYW4gYmUgYXR0YWNoIHRvIC8gZGV0YWNoZWQgZnJvbSBhIGBQb3J0YWxPdXRsZXRgLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUG9ydGFsPFQ+IHtcbiAgcHJpdmF0ZSBfYXR0YWNoZWRIb3N0OiBQb3J0YWxPdXRsZXQgfCBudWxsO1xuXG4gIC8qKiBBdHRhY2ggdGhpcyBwb3J0YWwgdG8gYSBob3N0LiAqL1xuICBhdHRhY2goaG9zdDogUG9ydGFsT3V0bGV0KTogVCB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgaWYgKGhvc3QgPT0gbnVsbCkge1xuICAgICAgICB0aHJvd051bGxQb3J0YWxPdXRsZXRFcnJvcigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaG9zdC5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICAgIHRocm93UG9ydGFsQWxyZWFkeUF0dGFjaGVkRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hdHRhY2hlZEhvc3QgPSBob3N0O1xuICAgIHJldHVybiA8VD5ob3N0LmF0dGFjaCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBEZXRhY2ggdGhpcyBwb3J0YWwgZnJvbSBpdHMgaG9zdCAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgbGV0IGhvc3QgPSB0aGlzLl9hdHRhY2hlZEhvc3Q7XG5cbiAgICBpZiAoaG9zdCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hdHRhY2hlZEhvc3QgPSBudWxsO1xuICAgICAgaG9zdC5kZXRhY2goKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3dOb1BvcnRhbEF0dGFjaGVkRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGlzIHBvcnRhbCBpcyBhdHRhY2hlZCB0byBhIGhvc3QuICovXG4gIGdldCBpc0F0dGFjaGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hdHRhY2hlZEhvc3QgIT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBQb3J0YWxPdXRsZXQgcmVmZXJlbmNlIHdpdGhvdXQgcGVyZm9ybWluZyBgYXR0YWNoKClgLiBUaGlzIGlzIHVzZWQgZGlyZWN0bHkgYnlcbiAgICogdGhlIFBvcnRhbE91dGxldCB3aGVuIGl0IGlzIHBlcmZvcm1pbmcgYW4gYGF0dGFjaCgpYCBvciBgZGV0YWNoKClgLlxuICAgKi9cbiAgc2V0QXR0YWNoZWRIb3N0KGhvc3Q6IFBvcnRhbE91dGxldCB8IG51bGwpIHtcbiAgICB0aGlzLl9hdHRhY2hlZEhvc3QgPSBob3N0O1xuICB9XG59XG5cbi8qKlxuICogQSBgQ29tcG9uZW50UG9ydGFsYCBpcyBhIHBvcnRhbCB0aGF0IGluc3RhbnRpYXRlcyBzb21lIENvbXBvbmVudCB1cG9uIGF0dGFjaG1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRQb3J0YWw8VD4gZXh0ZW5kcyBQb3J0YWw8Q29tcG9uZW50UmVmPFQ+PiB7XG4gIC8qKiBUaGUgdHlwZSBvZiB0aGUgY29tcG9uZW50IHRoYXQgd2lsbCBiZSBpbnN0YW50aWF0ZWQgZm9yIGF0dGFjaG1lbnQuICovXG4gIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxUPjtcblxuICAvKipcbiAgICogV2hlcmUgdGhlIGF0dGFjaGVkIGNvbXBvbmVudCBzaG91bGQgbGl2ZSBpbiBBbmd1bGFyJ3MgKmxvZ2ljYWwqIGNvbXBvbmVudCB0cmVlLlxuICAgKiBUaGlzIGlzIGRpZmZlcmVudCBmcm9tIHdoZXJlIHRoZSBjb21wb25lbnQgKnJlbmRlcnMqLCB3aGljaCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBQb3J0YWxPdXRsZXQuXG4gICAqIFRoZSBvcmlnaW4gaXMgbmVjZXNzYXJ5IHdoZW4gdGhlIGhvc3QgaXMgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciBhcHBsaWNhdGlvbiBjb250ZXh0LlxuICAgKi9cbiAgdmlld0NvbnRhaW5lclJlZj86IFZpZXdDb250YWluZXJSZWYgfCBudWxsO1xuXG4gIC8qKiBJbmplY3RvciB1c2VkIGZvciB0aGUgaW5zdGFudGlhdGlvbiBvZiB0aGUgY29tcG9uZW50LiAqL1xuICBpbmplY3Rvcj86IEluamVjdG9yIHwgbnVsbDtcblxuICAvKipcbiAgICogQWx0ZXJuYXRlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIHRvIHVzZSB3aGVuIHJlc29sdmluZyB0aGUgYXNzb2NpYXRlZCBjb21wb25lbnQuXG4gICAqIERlZmF1bHRzIHRvIHVzaW5nIHRoZSByZXNvbHZlciBmcm9tIHRoZSBvdXRsZXQgdGhhdCB0aGUgcG9ydGFsIGlzIGF0dGFjaGVkIHRvLlxuICAgKi9cbiAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyPzogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHwgbnVsbDtcblxuICAvKipcbiAgICogTGlzdCBvZiBET00gbm9kZXMgdGhhdCBzaG91bGQgYmUgcHJvamVjdGVkIHRocm91Z2ggYDxuZy1jb250ZW50PmAgb2YgdGhlIGF0dGFjaGVkIGNvbXBvbmVudC5cbiAgICovXG4gIHByb2plY3RhYmxlTm9kZXM/OiBOb2RlW11bXSB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY29tcG9uZW50OiBDb21wb25lbnRUeXBlPFQ+LFxuICAgIHZpZXdDb250YWluZXJSZWY/OiBWaWV3Q29udGFpbmVyUmVmIHwgbnVsbCxcbiAgICBpbmplY3Rvcj86IEluamVjdG9yIHwgbnVsbCxcbiAgICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI/OiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgfCBudWxsLFxuICAgIHByb2plY3RhYmxlTm9kZXM/OiBOb2RlW11bXSB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgdGhpcy52aWV3Q29udGFpbmVyUmVmID0gdmlld0NvbnRhaW5lclJlZjtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG4gICAgdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI7XG4gICAgdGhpcy5wcm9qZWN0YWJsZU5vZGVzID0gcHJvamVjdGFibGVOb2RlcztcbiAgfVxufVxuXG4vKipcbiAqIEEgYFRlbXBsYXRlUG9ydGFsYCBpcyBhIHBvcnRhbCB0aGF0IHJlcHJlc2VudHMgc29tZSBlbWJlZGRlZCB0ZW1wbGF0ZSAoVGVtcGxhdGVSZWYpLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQb3J0YWw8QyA9IGFueT4gZXh0ZW5kcyBQb3J0YWw8RW1iZWRkZWRWaWV3UmVmPEM+PiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgZW1iZWRkZWQgdGVtcGxhdGUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaW5zdGFudGlhdGUgYW4gZW1iZWRkZWQgVmlldyBpbiB0aGUgaG9zdC4gKi9cbiAgICBwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPEM+LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIFZpZXdDb250YWluZXIgaW50byB3aGljaCB0aGUgdGVtcGxhdGUgd2lsbCBiZSBzdGFtcGVkIG91dC4gKi9cbiAgICBwdWJsaWMgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAvKiogQ29udGV4dHVhbCBkYXRhIHRvIGJlIHBhc3NlZCBpbiB0byB0aGUgZW1iZWRkZWQgdmlldy4gKi9cbiAgICBwdWJsaWMgY29udGV4dD86IEMsXG4gICAgLyoqIFRoZSBpbmplY3RvciB0byB1c2UgZm9yIHRoZSBlbWJlZGRlZCB2aWV3LiAqL1xuICAgIHB1YmxpYyBpbmplY3Rvcj86IEluamVjdG9yLFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IG9yaWdpbigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVJlZi5lbGVtZW50UmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCB0aGUgcG9ydGFsIHRvIHRoZSBwcm92aWRlZCBgUG9ydGFsT3V0bGV0YC5cbiAgICogV2hlbiBhIGNvbnRleHQgaXMgcHJvdmlkZWQgaXQgd2lsbCBvdmVycmlkZSB0aGUgYGNvbnRleHRgIHByb3BlcnR5IG9mIHRoZSBgVGVtcGxhdGVQb3J0YWxgXG4gICAqIGluc3RhbmNlLlxuICAgKi9cbiAgb3ZlcnJpZGUgYXR0YWNoKGhvc3Q6IFBvcnRhbE91dGxldCwgY29udGV4dDogQyB8IHVuZGVmaW5lZCA9IHRoaXMuY29udGV4dCk6IEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICByZXR1cm4gc3VwZXIuYXR0YWNoKGhvc3QpO1xuICB9XG5cbiAgb3ZlcnJpZGUgZGV0YWNoKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGV4dCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3VwZXIuZGV0YWNoKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGBEb21Qb3J0YWxgIGlzIGEgcG9ydGFsIHdob3NlIERPTSBlbGVtZW50IHdpbGwgYmUgdGFrZW4gZnJvbSBpdHMgY3VycmVudCBwb3NpdGlvblxuICogaW4gdGhlIERPTSBhbmQgbW92ZWQgaW50byBhIHBvcnRhbCBvdXRsZXQsIHdoZW4gaXQgaXMgYXR0YWNoZWQuIE9uIGRldGFjaCwgdGhlIGNvbnRlbnRcbiAqIHdpbGwgYmUgcmVzdG9yZWQgdG8gaXRzIG9yaWdpbmFsIHBvc2l0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRG9tUG9ydGFsPFQgPSBIVE1MRWxlbWVudD4gZXh0ZW5kcyBQb3J0YWw8VD4ge1xuICAvKiogRE9NIG5vZGUgaG9zdGluZyB0aGUgcG9ydGFsJ3MgY29udGVudC4gKi9cbiAgcmVhZG9ubHkgZWxlbWVudDogVDtcblxuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBUIHwgRWxlbWVudFJlZjxUPikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudCBpbnN0YW5jZW9mIEVsZW1lbnRSZWYgPyBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQgOiBlbGVtZW50O1xuICB9XG59XG5cbi8qKiBBIGBQb3J0YWxPdXRsZXRgIGlzIGEgc3BhY2UgdGhhdCBjYW4gY29udGFpbiBhIHNpbmdsZSBgUG9ydGFsYC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9ydGFsT3V0bGV0IHtcbiAgLyoqIEF0dGFjaGVzIGEgcG9ydGFsIHRvIHRoaXMgb3V0bGV0LiAqL1xuICBhdHRhY2gocG9ydGFsOiBQb3J0YWw8YW55Pik6IGFueTtcblxuICAvKiogRGV0YWNoZXMgdGhlIGN1cnJlbnRseSBhdHRhY2hlZCBwb3J0YWwgZnJvbSB0aGlzIG91dGxldC4gKi9cbiAgZGV0YWNoKCk6IGFueTtcblxuICAvKiogUGVyZm9ybXMgY2xlYW51cCBiZWZvcmUgdGhlIG91dGxldCBpcyBkZXN0cm95ZWQuICovXG4gIGRpc3Bvc2UoKTogdm9pZDtcblxuICAvKiogV2hldGhlciB0aGVyZSBpcyBjdXJyZW50bHkgYSBwb3J0YWwgYXR0YWNoZWQgdG8gdGhpcyBvdXRsZXQuICovXG4gIGhhc0F0dGFjaGVkKCk6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBQb3J0YWxPdXRsZXRgIGluc3RlYWQuXG4gKiBAYnJlYWtpbmctY2hhbmdlIDkuMC4wXG4gKi9cbmV4cG9ydCB0eXBlIFBvcnRhbEhvc3QgPSBQb3J0YWxPdXRsZXQ7XG5cbi8qKlxuICogUGFydGlhbCBpbXBsZW1lbnRhdGlvbiBvZiBQb3J0YWxPdXRsZXQgdGhhdCBoYW5kbGVzIGF0dGFjaGluZ1xuICogQ29tcG9uZW50UG9ydGFsIGFuZCBUZW1wbGF0ZVBvcnRhbC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBQb3J0YWxPdXRsZXQge1xuICAvKiogVGhlIHBvcnRhbCBjdXJyZW50bHkgYXR0YWNoZWQgdG8gdGhlIGhvc3QuICovXG4gIHByb3RlY3RlZCBfYXR0YWNoZWRQb3J0YWw6IFBvcnRhbDxhbnk+IHwgbnVsbDtcblxuICAvKiogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGVybWFuZW50bHkgZGlzcG9zZSB0aGlzIGhvc3QuICovXG4gIHByaXZhdGUgX2Rpc3Bvc2VGbjogKCgpID0+IHZvaWQpIHwgbnVsbDtcblxuICAvKiogV2hldGhlciB0aGlzIGhvc3QgaGFzIGFscmVhZHkgYmVlbiBwZXJtYW5lbnRseSBkaXNwb3NlZC4gKi9cbiAgcHJpdmF0ZSBfaXNEaXNwb3NlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgaG9zdCBoYXMgYW4gYXR0YWNoZWQgcG9ydGFsLiAqL1xuICBoYXNBdHRhY2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9hdHRhY2hlZFBvcnRhbDtcbiAgfVxuXG4gIGF0dGFjaDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPjtcbiAgYXR0YWNoPFQ+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8VD4pOiBFbWJlZGRlZFZpZXdSZWY8VD47XG4gIGF0dGFjaChwb3J0YWw6IGFueSk6IGFueTtcblxuICAvKiogQXR0YWNoZXMgYSBwb3J0YWwuICovXG4gIGF0dGFjaChwb3J0YWw6IFBvcnRhbDxhbnk+KTogYW55IHtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXBvcnRhbCkge1xuICAgICAgICB0aHJvd051bGxQb3J0YWxFcnJvcigpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICAgIHRocm93UG9ydGFsQWxyZWFkeUF0dGFjaGVkRXJyb3IoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgdGhyb3dQb3J0YWxPdXRsZXRBbHJlYWR5RGlzcG9zZWRFcnJvcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3J0YWwgaW5zdGFuY2VvZiBDb21wb25lbnRQb3J0YWwpIHtcbiAgICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gcG9ydGFsO1xuICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XG4gICAgfSBlbHNlIGlmIChwb3J0YWwgaW5zdGFuY2VvZiBUZW1wbGF0ZVBvcnRhbCkge1xuICAgICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwgPSBwb3J0YWw7XG4gICAgICByZXR1cm4gdGhpcy5hdHRhY2hUZW1wbGF0ZVBvcnRhbChwb3J0YWwpO1xuICAgICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMC4wLjAgcmVtb3ZlIG51bGwgY2hlY2sgZm9yIGB0aGlzLmF0dGFjaERvbVBvcnRhbGAuXG4gICAgfSBlbHNlIGlmICh0aGlzLmF0dGFjaERvbVBvcnRhbCAmJiBwb3J0YWwgaW5zdGFuY2VvZiBEb21Qb3J0YWwpIHtcbiAgICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gcG9ydGFsO1xuICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoRG9tUG9ydGFsKHBvcnRhbCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3dVbmtub3duUG9ydGFsVHlwZUVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgYWJzdHJhY3QgYXR0YWNoQ29tcG9uZW50UG9ydGFsPFQ+KHBvcnRhbDogQ29tcG9uZW50UG9ydGFsPFQ+KTogQ29tcG9uZW50UmVmPFQ+O1xuXG4gIGFic3RyYWN0IGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz47XG5cbiAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMC4wLjAgYGF0dGFjaERvbVBvcnRhbGAgdG8gYmVjb21lIGEgcmVxdWlyZWQgYWJzdHJhY3QgbWV0aG9kLlxuICByZWFkb25seSBhdHRhY2hEb21Qb3J0YWw6IG51bGwgfCAoKHBvcnRhbDogRG9tUG9ydGFsKSA9PiBhbnkpID0gbnVsbDtcblxuICAvKiogRGV0YWNoZXMgYSBwcmV2aW91c2x5IGF0dGFjaGVkIHBvcnRhbC4gKi9cbiAgZGV0YWNoKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hdHRhY2hlZFBvcnRhbCkge1xuICAgICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwuc2V0QXR0YWNoZWRIb3N0KG51bGwpO1xuICAgICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2ludm9rZURpc3Bvc2VGbigpO1xuICB9XG5cbiAgLyoqIFBlcm1hbmVudGx5IGRpc3Bvc2Ugb2YgdGhpcyBwb3J0YWwgaG9zdC4gKi9cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aGlzLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2ludm9rZURpc3Bvc2VGbigpO1xuICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgc2V0RGlzcG9zZUZuKGZuOiAoKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fZGlzcG9zZUZuID0gZm47XG4gIH1cblxuICBwcml2YXRlIF9pbnZva2VEaXNwb3NlRm4oKSB7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2VGbikge1xuICAgICAgdGhpcy5fZGlzcG9zZUZuKCk7XG4gICAgICB0aGlzLl9kaXNwb3NlRm4gPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgQmFzZVBvcnRhbE91dGxldGAgaW5zdGVhZC5cbiAqIEBicmVha2luZy1jaGFuZ2UgOS4wLjBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VQb3J0YWxIb3N0IGV4dGVuZHMgQmFzZVBvcnRhbE91dGxldCB7fVxuIl19