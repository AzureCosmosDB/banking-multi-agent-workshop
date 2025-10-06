/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, } from '@angular/core';
import { BasePortalOutlet } from './portal';
/**
 * A PortalOutlet for attaching portals to an arbitrary DOM element outside of the Angular
 * application context.
 */
export class DomPortalOutlet extends BasePortalOutlet {
    /**
     * @param outletElement Element into which the content is projected.
     * @param _componentFactoryResolver Used to resolve the component factory.
     *   Only required when attaching component portals.
     * @param _appRef Reference to the application. Only used in component portals when there
     *   is no `ViewContainerRef` available.
     * @param _defaultInjector Injector to use as a fallback when the portal being attached doesn't
     *   have one. Only used for component portals.
     * @param _document Reference to the document. Used when attaching a DOM portal. Will eventually
     *   become a required parameter.
     */
    constructor(
    /** Element into which the content is projected. */
    outletElement, _componentFactoryResolver, _appRef, _defaultInjector, 
    /**
     * @deprecated `_document` Parameter to be made required.
     * @breaking-change 10.0.0
     */
    _document) {
        super();
        this.outletElement = outletElement;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._appRef = _appRef;
        this._defaultInjector = _defaultInjector;
        /**
         * Attaches a DOM portal by transferring its content into the outlet.
         * @param portal Portal to be attached.
         * @deprecated To be turned into a method.
         * @breaking-change 10.0.0
         */
        this.attachDomPortal = (portal) => {
            // @breaking-change 10.0.0 Remove check and error once the
            // `_document` constructor parameter is required.
            if (!this._document && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Cannot attach DOM portal without _document constructor parameter');
            }
            const element = portal.element;
            if (!element.parentNode && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('DOM portal content must be attached to a parent node.');
            }
            // Anchor used to save the element's previous position so
            // that we can restore it when the portal is detached.
            const anchorNode = this._document.createComment('dom-portal');
            element.parentNode.insertBefore(anchorNode, element);
            this.outletElement.appendChild(element);
            this._attachedPortal = portal;
            super.setDisposeFn(() => {
                // We can't use `replaceWith` here because IE doesn't support it.
                if (anchorNode.parentNode) {
                    anchorNode.parentNode.replaceChild(element, anchorNode);
                }
            });
        };
        this._document = _document;
    }
    /**
     * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver.
     * @param portal Portal to be attached
     * @returns Reference to the created component.
     */
    attachComponentPortal(portal) {
        const resolver = (portal.componentFactoryResolver || this._componentFactoryResolver);
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && !resolver) {
            throw Error('Cannot attach component portal to outlet without a ComponentFactoryResolver.');
        }
        const componentFactory = resolver.resolveComponentFactory(portal.component);
        let componentRef;
        // If the portal specifies a ViewContainerRef, we will use that as the attachment point
        // for the component (in terms of Angular's component tree, not rendering).
        // When the ViewContainerRef is missing, we use the factory to create the component directly
        // and then manually attach the view to the application.
        if (portal.viewContainerRef) {
            componentRef = portal.viewContainerRef.createComponent(componentFactory, portal.viewContainerRef.length, portal.injector || portal.viewContainerRef.injector, portal.projectableNodes || undefined);
            this.setDisposeFn(() => componentRef.destroy());
        }
        else {
            if ((typeof ngDevMode === 'undefined' || ngDevMode) && !this._appRef) {
                throw Error('Cannot attach component portal to outlet without an ApplicationRef.');
            }
            componentRef = componentFactory.create(portal.injector || this._defaultInjector || Injector.NULL);
            this._appRef.attachView(componentRef.hostView);
            this.setDisposeFn(() => {
                // Verify that the ApplicationRef has registered views before trying to detach a host view.
                // This check also protects the `detachView` from being called on a destroyed ApplicationRef.
                if (this._appRef.viewCount > 0) {
                    this._appRef.detachView(componentRef.hostView);
                }
                componentRef.destroy();
            });
        }
        // At this point the component has been instantiated, so we move it to the location in the DOM
        // where we want it to be rendered.
        this.outletElement.appendChild(this._getComponentRootNode(componentRef));
        this._attachedPortal = portal;
        return componentRef;
    }
    /**
     * Attaches a template portal to the DOM as an embedded view.
     * @param portal Portal to be attached.
     * @returns Reference to the created embedded view.
     */
    attachTemplatePortal(portal) {
        let viewContainer = portal.viewContainerRef;
        let viewRef = viewContainer.createEmbeddedView(portal.templateRef, portal.context, {
            injector: portal.injector,
        });
        // The method `createEmbeddedView` will add the view as a child of the viewContainer.
        // But for the DomPortalOutlet the view can be added everywhere in the DOM
        // (e.g Overlay Container) To move the view to the specified host element. We just
        // re-append the existing root nodes.
        viewRef.rootNodes.forEach(rootNode => this.outletElement.appendChild(rootNode));
        // Note that we want to detect changes after the nodes have been moved so that
        // any directives inside the portal that are looking at the DOM inside a lifecycle
        // hook won't be invoked too early.
        viewRef.detectChanges();
        this.setDisposeFn(() => {
            let index = viewContainer.indexOf(viewRef);
            if (index !== -1) {
                viewContainer.remove(index);
            }
        });
        this._attachedPortal = portal;
        // TODO(jelbourn): Return locals from view.
        return viewRef;
    }
    /**
     * Clears out a portal from the DOM.
     */
    dispose() {
        super.dispose();
        this.outletElement.remove();
    }
    /** Gets the root HTMLElement for an instantiated component. */
    _getComponentRootNode(componentRef) {
        return componentRef.hostView.rootNodes[0];
    }
}
/**
 * @deprecated Use `DomPortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export class DomPortalHost extends DomPortalOutlet {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXBvcnRhbC1vdXRsZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3BvcnRhbC9kb20tcG9ydGFsLW91dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBS0wsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxnQkFBZ0IsRUFBNkMsTUFBTSxVQUFVLENBQUM7QUFFdEY7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGVBQWdCLFNBQVEsZ0JBQWdCO0lBR25EOzs7Ozs7Ozs7O09BVUc7SUFDSDtJQUNFLG1EQUFtRDtJQUM1QyxhQUFzQixFQUNyQix5QkFBb0QsRUFDcEQsT0FBd0IsRUFDeEIsZ0JBQTJCO0lBRW5DOzs7T0FHRztJQUNILFNBQWU7UUFFZixLQUFLLEVBQUUsQ0FBQztRQVhELGtCQUFhLEdBQWIsYUFBYSxDQUFTO1FBQ3JCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFDeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFXO1FBcUdyQzs7Ozs7V0FLRztRQUNNLG9CQUFlLEdBQUcsQ0FBQyxNQUFpQixFQUFFLEVBQUU7WUFDL0MsMERBQTBEO1lBQzFELGlEQUFpRDtZQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUN2RSxNQUFNLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzNFLE1BQU0sS0FBSyxD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LEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCwrREFBK0Q7SUFDdkQscUJBQXFCLENBQUMsWUFBK0I7UUFDM0QsT0FBUSxZQUFZLENBQUMsUUFBaUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFnQixDQUFDO0lBQ3JGLENBQUM7Q0FDRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxhQUFjLFNBQVEsZUFBZTtDQUFHIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFwcGxpY2F0aW9uUmVmLFxuICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIENvbXBvbmVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBJbmplY3Rvcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Jhc2VQb3J0YWxPdXRsZXQsIENvbXBvbmVudFBvcnRhbCwgRG9tUG9ydGFsLCBUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnLi9wb3J0YWwnO1xuXG4vKipcbiAqIEEgUG9ydGFsT3V0bGV0IGZvciBhdHRhY2hpbmcgcG9ydGFscyB0byBhbiBhcmJpdHJhcnkgRE9NIGVsZW1lbnQgb3V0c2lkZSBvZiB0aGUgQW5ndWxhclxuICogYXBwbGljYXRpb24gY29udGV4dC5cbiAqL1xuZXhwb3J0IGNsYXNzIERvbVBvcnRhbE91dGxldCBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQge1xuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBvdXRsZXRFbGVtZW50IEVsZW1lbnQgaW50byB3aGljaCB0aGUgY29udGVudCBpcyBwcm9qZWN0ZWQuXG4gICAqIEBwYXJhbSBfY29tcG9uZW50RmFjdG9yeVJlc29sdmVyIFVzZWQgdG8gcmVzb2x2ZSB0aGUgY29tcG9uZW50IGZhY3RvcnkuXG4gICAqICAgT25seSByZXF1aXJlZCB3aGVuIGF0dGFjaGluZyBjb21wb25lbnQgcG9ydGFscy5cbiAgICogQHBhcmFtIF9hcHBSZWYgUmVmZXJlbmNlIHRvIHRoZSBhcHBsaWNhdGlvbi4gT25seSB1c2VkIGluIGNvbXBvbmVudCBwb3J0YWxzIHdoZW4gdGhlcmVcbiAgICogICBpcyBubyBgVmlld0NvbnRhaW5lclJlZmAgYXZhaWxhYmxlLlxuICAgKiBAcGFyYW0gX2RlZmF1bHRJbmplY3RvciBJbmplY3RvciB0byB1c2UgYXMgYSBmYWxsYmFjayB3aGVuIHRoZSBwb3J0YWwgYmVpbmcgYXR0YWNoZWQgZG9lc24ndFxuICAgKiAgIGhhdmUgb25lLiBPbmx5IHVzZWQgZm9yIGNvbXBvbmVudCBwb3J0YWxzLlxuICAgKiBAcGFyYW0gX2RvY3VtZW50IFJlZmVyZW5jZSB0byB0aGUgZG9jdW1lbnQuIFVzZWQgd2hlbiBhdHRhY2hpbmcgYSBET00gcG9ydGFsLiBXaWxsIGV2ZW50dWFsbHlcbiAgICogICBiZWNvbWUgYSByZXF1aXJlZCBwYXJhbWV0ZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogRWxlbWVudCBpbnRvIHdoaWNoIHRoZSBjb250ZW50IGlzIHByb2plY3RlZC4gKi9cbiAgICBwdWJsaWMgb3V0bGV0RWxlbWVudDogRWxlbWVudCxcbiAgICBwcml2YXRlIF9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI/OiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBfYXBwUmVmPzogQXBwbGljYXRpb25SZWYsXG4gICAgcHJpdmF0ZSBfZGVmYXVsdEluamVjdG9yPzogSW5qZWN0b3IsXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBgX2RvY3VtZW50YCBQYXJhbWV0ZXIgdG8gYmUgbWFkZSByZXF1aXJlZC5cbiAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDEwLjAuMFxuICAgICAqL1xuICAgIF9kb2N1bWVudD86IGFueSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2ggdGhlIGdpdmVuIENvbXBvbmVudFBvcnRhbCB0byBET00gZWxlbWVudCB1c2luZyB0aGUgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZFxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIGNyZWF0ZWQgY29tcG9uZW50LlxuICAgKi9cbiAgYXR0YWNoQ29tcG9uZW50UG9ydGFsPFQ+KHBvcnRhbDogQ29tcG9uZW50UG9ydGFsPFQ+KTogQ29tcG9uZW50UmVmPFQ+IHtcbiAgICBjb25zdCByZXNvbHZlciA9IChwb3J0YWwuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHx8IHRoaXMuX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikhO1xuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICFyZXNvbHZlcikge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nhbm5vdCBhdHRhY2ggY29tcG9uZW50IHBvcnRhbCB0byBvdXRsZXQgd2l0aG91dCBhIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlci4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gcmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkocG9ydGFsLmNvbXBvbmVudCk7XG4gICAgbGV0IGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPFQ+O1xuXG4gICAgLy8gSWYgdGhlIHBvcnRhbCBzcGVjaWZpZXMgYSBWaWV3Q29udGFpbmVyUmVmLCB3ZSB3aWxsIHVzZSB0aGF0IGFzIHRoZSBhdHRhY2htZW50IHBvaW50XG4gICAgLy8gZm9yIHRoZSBjb21wb25lbnQgKGluIHRlcm1zIG9mIEFuZ3VsYXIncyBjb21wb25lbnQgdHJlZSwgbm90IHJlbmRlcmluZykuXG4gICAgLy8gV2hlbiB0aGUgVmlld0NvbnRhaW5lclJlZiBpcyBtaXNzaW5nLCB3ZSB1c2UgdGhlIGZhY3RvcnkgdG8gY3JlYXRlIHRoZSBjb21wb25lbnQgZGlyZWN0bHlcbiAgICAvLyBhbmQgdGhlbiBtYW51YWxseSBhdHRhY2ggdGhlIHZpZXcgdG8gdGhlIGFwcGxpY2F0aW9uLlxuICAgIGlmIChwb3J0YWwudmlld0NvbnRhaW5lclJlZikge1xuICAgICAgY29tcG9uZW50UmVmID0gcG9ydGFsLnZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KFxuICAgICAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgICAgICBwb3J0YWwudmlld0NvbnRhaW5lclJlZi5sZW5ndGgsXG4gICAgICAgIHBvcnRhbC5pbmplY3RvciB8fCBwb3J0YWwudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcixcbiAgICAgICAgcG9ydGFsLnByb2plY3RhYmxlTm9kZXMgfHwgdW5kZWZpbmVkLFxuICAgICAgKTtcblxuICAgICAgdGhpcy5zZXREaXNwb3NlRm4oKCkgPT4gY29tcG9uZW50UmVmLmRlc3Ryb3koKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiAhdGhpcy5fYXBwUmVmKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdDYW5ub3QgYXR0YWNoIGNvbXBvbmVudCBwb3J0YWwgdG8gb3V0bGV0IHdpdGhvdXQgYW4gQXBwbGljYXRpb25SZWYuJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudEZhY3RvcnkuY3JlYXRlKFxuICAgICAgICBwb3J0YWwuaW5qZWN0b3IgfHwgdGhpcy5fZGVmYXVsdEluamVjdG9yIHx8IEluamVjdG9yLk5VTEwsXG4gICAgICApO1xuICAgICAgdGhpcy5fYXBwUmVmIS5hdHRhY2hWaWV3KGNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgICB0aGlzLnNldERpc3Bvc2VGbigoKSA9PiB7XG4gICAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBBcHBsaWNhdGlvblJlZiBoYXMgcmVnaXN0ZXJlZCB2aWV3cyBiZWZvcmUgdHJ5aW5nIHRvIGRldGFjaCBhIGhvc3Qgdmlldy5cbiAgICAgICAgLy8gVGhpcyBjaGVjayBhbHNvIHByb3RlY3RzIHRoZSBgZGV0YWNoVmlld2AgZnJvbSBiZWluZyBjYWxsZWQgb24gYSBkZXN0cm95ZWQgQXBwbGljYXRpb25SZWYuXG4gICAgICAgIGlmICh0aGlzLl9hcHBSZWYhLnZpZXdDb3VudCA+IDApIHtcbiAgICAgICAgICB0aGlzLl9hcHBSZWYhLmRldGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBpbnN0YW50aWF0ZWQsIHNvIHdlIG1vdmUgaXQgdG8gdGhlIGxvY2F0aW9uIGluIHRoZSBET01cbiAgICAvLyB3aGVyZSB3ZSB3YW50IGl0IHRvIGJlIHJlbmRlcmVkLlxuICAgIHRoaXMub3V0bGV0RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9nZXRDb21wb25lbnRSb290Tm9kZShjb21wb25lbnRSZWYpKTtcbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcblxuICAgIHJldHVybiBjb21wb25lbnRSZWY7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYSB0ZW1wbGF0ZSBwb3J0YWwgdG8gdGhlIERPTSBhcyBhbiBlbWJlZGRlZCB2aWV3LlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZC5cbiAgICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBjcmVhdGVkIGVtYmVkZGVkIHZpZXcuXG4gICAqL1xuICBhdHRhY2hUZW1wbGF0ZVBvcnRhbDxDPihwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPEM+KTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICBsZXQgdmlld0NvbnRhaW5lciA9IHBvcnRhbC52aWV3Q29udGFpbmVyUmVmO1xuICAgIGxldCB2aWV3UmVmID0gdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcocG9ydGFsLnRlbXBsYXRlUmVmLCBwb3J0YWwuY29udGV4dCwge1xuICAgICAgaW5qZWN0b3I6IHBvcnRhbC5pbmplY3RvcixcbiAgICB9KTtcblxuICAgIC8vIFRoZSBtZXRob2QgYGNyZWF0ZUVtYmVkZGVkVmlld2Agd2lsbCBhZGQgdGhlIHZpZXcgYXMgYSBjaGlsZCBvZiB0aGUgdmlld0NvbnRhaW5lci5cbiAgICAvLyBCdXQgZm9yIHRoZSBEb21Qb3J0YWxPdXRsZXQgdGhlIHZpZXcgY2FuIGJlIGFkZGVkIGV2ZXJ5d2hlcmUgaW4gdGhlIERPTVxuICAgIC8vIChlLmcgT3ZlcmxheSBDb250YWluZXIpIFRvIG1vdmUgdGhlIHZpZXcgdG8gdGhlIHNwZWNpZmllZCBob3N0IGVsZW1lbnQuIFdlIGp1c3RcbiAgICAvLyByZS1hcHBlbmQgdGhlIGV4aXN0aW5nIHJvb3Qgbm9kZXMuXG4gICAgdmlld1JlZi5yb290Tm9kZXMuZm9yRWFjaChyb290Tm9kZSA9PiB0aGlzLm91dGxldEVsZW1lbnQuYXBwZW5kQ2hpbGQocm9vdE5vZGUpKTtcblxuICAgIC8vIE5vdGUgdGhhdCB3ZSB3YW50IHRvIGRldGVjdCBjaGFuZ2VzIGFmdGVyIHRoZSBub2RlcyBoYXZlIGJlZW4gbW92ZWQgc28gdGhhdFxuICAgIC8vIGFueSBkaXJlY3RpdmVzIGluc2lkZSB0aGUgcG9ydGFsIHRoYXQgYXJlIGxvb2tpbmcgYXQgdGhlIERPTSBpbnNpZGUgYSBsaWZlY3ljbGVcbiAgICAvLyBob29rIHdvbid0IGJlIGludm9rZWQgdG9vIGVhcmx5LlxuICAgIHZpZXdSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuXG4gICAgdGhpcy5zZXREaXNwb3NlRm4oKCkgPT4ge1xuICAgICAgbGV0IGluZGV4ID0gdmlld0NvbnRhaW5lci5pbmRleE9mKHZpZXdSZWYpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB2aWV3Q29udGFpbmVyLnJlbW92ZShpbmRleCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcblxuICAgIC8vIFRPRE8oamVsYm91cm4pOiBSZXR1cm4gbG9jYWxzIGZyb20gdmlldy5cbiAgICByZXR1cm4gdmlld1JlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIERPTSBwb3J0YWwgYnkgdHJhbnNmZXJyaW5nIGl0cyBjb250ZW50IGludG8gdGhlIG91dGxldC5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQuXG4gICAqIEBkZXByZWNhdGVkIFRvIGJlIHR1cm5lZCBpbnRvIGEgbWV0aG9kLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEwLjAuMFxuICAgKi9cbiAgb3ZlcnJpZGUgYXR0YWNoRG9tUG9ydGFsID0gKHBvcnRhbDogRG9tUG9ydGFsKSA9PiB7XG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMC4wLjAgUmVtb3ZlIGNoZWNrIGFuZCBlcnJvciBvbmNlIHRoZVxuICAgIC8vIGBfZG9jdW1lbnRgIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBpcyByZXF1aXJlZC5cbiAgICBpZiAoIXRoaXMuX2RvY3VtZW50ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2Fubm90IGF0dGFjaCBET00gcG9ydGFsIHdpdGhvdXQgX2RvY3VtZW50IGNvbnN0cnVjdG9yIHBhcmFtZXRlcicpO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSBwb3J0YWwuZWxlbWVudDtcbiAgICBpZiAoIWVsZW1lbnQucGFyZW50Tm9kZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0RPTSBwb3J0YWwgY29udGVudCBtdXN0IGJlIGF0dGFjaGVkIHRvIGEgcGFyZW50IG5vZGUuJyk7XG4gICAgfVxuXG4gICAgLy8gQW5jaG9yIHVzZWQgdG8gc2F2ZSB0aGUgZWxlbWVudCdzIHByZXZpb3VzIHBvc2l0aW9uIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gcmVzdG9yZSBpdCB3aGVuIHRoZSBwb3J0YWwgaXMgZGV0YWNoZWQuXG4gICAgY29uc3QgYW5jaG9yTm9kZSA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJ2RvbS1wb3J0YWwnKTtcblxuICAgIGVsZW1lbnQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKGFuY2hvck5vZGUsIGVsZW1lbnQpO1xuICAgIHRoaXMub3V0bGV0RWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcblxuICAgIHN1cGVyLnNldERpc3Bvc2VGbigoKSA9PiB7XG4gICAgICAvLyBXZSBjYW4ndCB1c2UgYHJlcGxhY2VXaXRoYCBoZXJlIGJlY2F1c2UgSUUgZG9lc24ndCBzdXBwb3J0IGl0LlxuICAgICAgaWYgKGFuY2hvck5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICBhbmNob3JOb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsZW1lbnQsIGFuY2hvck5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgb3V0IGEgcG9ydGFsIGZyb20gdGhlIERPTS5cbiAgICovXG4gIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMub3V0bGV0RWxlbWVudC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByb290IEhUTUxFbGVtZW50IGZvciBhbiBpbnN0YW50aWF0ZWQgY29tcG9uZW50LiAqL1xuICBwcml2YXRlIF9nZXRDb21wb25lbnRSb290Tm9kZShjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiAoY29tcG9uZW50UmVmLmhvc3RWaWV3IGFzIEVtYmVkZGVkVmlld1JlZjxhbnk+KS5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBVc2UgYERvbVBvcnRhbE91dGxldGAgaW5zdGVhZC5cbiAqIEBicmVha2luZy1jaGFuZ2UgOS4wLjBcbiAqL1xuZXhwb3J0IGNsYXNzIERvbVBvcnRhbEhvc3QgZXh0ZW5kcyBEb21Qb3J0YWxPdXRsZXQge31cbiJdfQ==