/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, APP_ID, inject } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId } from './aria-reference';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/**
 * ID used for the body container where all messages are appended.
 * @deprecated No longer being used. To be removed.
 * @breaking-change 14.0.0
 */
export const MESSAGES_CONTAINER_ID = 'cdk-describedby-message-container';
/**
 * ID prefix used for each created message element.
 * @deprecated To be turned into a private variable.
 * @breaking-change 14.0.0
 */
export const CDK_DESCRIBEDBY_ID_PREFIX = 'cdk-describedby-message';
/**
 * Attribute given to each host element that is described by a message element.
 * @deprecated To be turned into a private variable.
 * @breaking-change 14.0.0
 */
export const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = 'cdk-describedby-host';
/** Global incremental identifier for each registered message element. */
let nextId = 0;
/**
 * Utility that creates visually hidden elements with a message content. Useful for elements that
 * want to use aria-describedby to further describe themselves without adding additional visual
 * content.
 */
export class AriaDescriber {
    constructor(_document, 
    /**
     * @deprecated To be turned into a required parameter.
     * @breaking-change 14.0.0
     */
    _platform) {
        this._platform = _platform;
        /** Map of all registered message elements that have been placed into the document. */
        this._messageRegistry = new Map();
        /** Container for all registered messages. */
        this._messagesContainer = null;
        /** Unique ID for the service. */
        this._id = `${nextId++}`;
        this._document = _document;
        this._id = inject(APP_ID) + '-' + nextId++;
    }
    describe(hostElement, message, role) {
        if (!this._canBeDescribed(hostElement, message)) {
            return;
        }
        const key = getKey(message, role);
        if (typeof message !== 'string') {
            // We need to ensure that the element has an ID.
            setMessageId(message, this._id);
            this._messageRegistry.set(key, { messageElement: message, referenceCount: 0 });
        }
        else if (!this._messageRegistry.has(key)) {
            this._createMessageElement(message, role);
        }
        if (!this._isElementDescribedByMessage(hostElement, key)) {
            this._addMessageReference(hostElement, key);
        }
    }
    removeDescription(hostElement, message, role) {
        if (!message || !this._isElementNode(hostElement)) {
            return;
        }
        const key = getKey(message, role);
        if (this._isElementDescribedByMessage(hostElement, key)) {
            this._removeMessageReference(hostElement, key);
        }
        // If the message is a string, it means that it's one that we created for the
        // consumer so we can remove it safely, otherwise we should leave it in place.
        if (typeof message === 'string') {
            const registeredMessage = this._messageRegistry.get(key);
            if (registeredMessage && registeredMessage.referenceCount === 0) {
                this._deleteMessageElement(key);
            }
        }
        if (this._messagesContainer?.childNodes.length === 0) {
            this._messagesContainer.remove();
            this._messagesContainer = null;
        }
    }
    /** Unregisters all created message elements and removes the message container. */
    ngOnDestroy() {
        const describedElements = this._document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}="${this._id}"]`);
        for (let i = 0; i < describedElements.length; i++) {
            this._removeCdkDescribedByReferenceIds(describedElements[i]);
            describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
        }
        this._messagesContainer?.remove();
        this._messagesContainer = null;
        this._messageRegistry.clear();
    }
    /**
     * Creates a new element in the visually hidden message container element with the message
     * as its content and adds it to the message registry.
     */
    _createMessageElement(message, role) {
        const messageElement = this._document.createElement('div');
        setMessageId(messageElement, this._id);
        messageElement.textContent = message;
        if (role) {
            messageElement.setAttribute('role', role);
        }
        this._createMessagesContainer();
        this._messagesContainer.appendChild(messageElement);
        this._messageRegistry.set(getKey(message, role), { messageElement, referenceCount: 0 });
    }
    /** Deletes the message element from the global messages container. */
    _deleteMessageElement(key) {
        this._messageRegistry.get(key)?.messageElement?.remove();
        this._messageRegistry.delete(key);
    }
    /** Creates the global container for all aria-describedby messages. */
    _createMessagesContainer() {
        if (this._messagesContainer) {
            return;
        }
        const containerClassName = 'cdk-describedby-message-container';
        const serverContainers = this._document.querySelectorAll(`.${containerClassName}[platform="server"]`);
        for (let i = 0; i < serverContainers.length; i++) {
            // When going from the server to the client, we may end up in a situation where there's
            // already a container on the page, but we don't have a reference to it. Clear the
            // old container so we don't get duplicates. Doing this, instead of emptying the previous
            // container, should be slightly faster.
            serverContainers[i].remove();
        }
        const messagesContainer = this._document.createElement('div');
        // We add `visibility: hidden` in order to prevent text in this container from
        // being searchable by the browser's Ctrl + F functionality.
        // Screen-readers will still read the description for elements with aria-describedby even
        // when the description element is not visible.
        messagesContainer.style.visibility = 'hidden';
        // Even though we use `visibility: hidden`, we still apply `cdk-visually-hidden` so that
        // the description element doesn't impact page layout.
        messagesContainer.classList.add(containerClassName);
        messagesContainer.classList.add('cdk-visually-hidden');
        // @breaking-change 14.0.0 Remove null check for `_platform`.
        if (this._platform && !this._platform.isBrowser) {
            messagesContainer.setAttribute('platform', 'server');
        }
        this._document.body.appendChild(messagesContainer);
        this._messagesContainer = messagesContainer;
    }
    /** Removes all cdk-describedby messages that are hosted through the element. */
    _removeCdkDescribedByReferenceIds(element) {
        // Remove all aria-describedby reference IDs that are prefixed by CDK_DESCRIBEDBY_ID_PREFIX
        const originalReferenceIds = getAriaReferenceIds(element, 'aria-describedby').filter(id => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0);
        element.setAttribute('aria-describedby', originalReferenceIds.join(' '));
    }
    /**
     * Adds a message reference to the element using aria-describedby and increments the registered
     * message's reference count.
     */
    _addMessageReference(element, key) {
        const registeredMessage = this._messageRegistry.get(key);
        // Add the aria-describedby reference and set the
        // describedby_host attribute to mark the element.
        addAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
        element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, this._id);
        registeredMessage.referenceCount++;
    }
    /**
     * Removes a message reference from the element using aria-describedby
     * and decrements the registered message's reference count.
     */
    _removeMessageReference(element, key) {
        const registeredMessage = this._messageRegistry.get(key);
        registeredMessage.referenceCount--;
        removeAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
        element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    }
    /** Returns true if the element has been described by the provided message ID. */
    _isElementDescribedByMessage(element, key) {
        const referenceIds = getAriaReferenceIds(element, 'aria-describedby');
        const registeredMessage = this._messageRegistry.get(key);
        const messageId = registeredMessage && registeredMessage.messageElement.id;
        return !!messageId && referenceIds.indexOf(messageId) != -1;
    }
    /** Determines whether a message can be described on a particular element. */
    _canBeDescribed(element, message) {
        if (!this._isElementNode(element)) {
            return false;
        }
        if (message && typeof message === 'object') {
            // We'd have to make some assumptions about the description element's text, if the consumer
            // passed in an element. Assume that if an element is passed in, the consumer has verified
            // that it can be used as a description.
            return true;
        }
        const trimmedMessage = message == null ? '' : `${message}`.trim();
        const ariaLabel = element.getAttribute('aria-label');
        // We shouldn't set descriptions if they're exactly the same as the `aria-label` of the
        // element, because screen readers will end up reading out the same text twice in a row.
        return trimmedMessage ? !ariaLabel || ariaLabel.trim() !== trimmedMessage : false;
    }
    /** Checks whether a node is an Element node. */
    _isElementNode(element) {
        return element.nodeType === this._document.ELEMENT_NODE;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: AriaDescriber, deps: [{ token: DOCUMENT }, { token: i1.Platform }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: AriaDescriber, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: AriaDescriber, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.Platform }] });
/** Gets a key that can be used to look messages up in the registry. */
function getKey(message, role) {
    return typeof message === 'string' ? `${role || ''}/${message}` : message;
}
/** Assigns a unique ID to an element, if it doesn't have one already. */
function setMessageId(element, serviceId) {
    if (!element.id) {
        element.id = `${CDK_DESCRIBEDBY_ID_PREFIX}-${serviceId}-${nextId++}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpYS1kZXNjcmliZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvYXJpYS1kZXNjcmliZXIvYXJpYS1kZXNjcmliZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFhLE1BQU0sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDOzs7QUFjbEc7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLG1DQUFtQyxDQUFDO0FBRXpFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyx5QkFBeUIsQ0FBQztBQUVuRTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsc0JBQXNCLENBQUM7QUFFckUseUVBQXlFO0FBQ3pFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQVl4QixZQUNvQixTQUFjO0lBQ2hDOzs7T0FHRztJQUNLLFNBQW9CO1FBQXBCLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFmOUIsc0ZBQXNGO1FBQzlFLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO1FBRTFFLDZDQUE2QztRQUNyQyx1QkFBa0IsR0FBdUIsSUFBSSxDQUFDO1FBRXRELGlDQUFpQztRQUNoQixRQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBVW5DLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxD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QUNwRixDQUFDO0lBRUQsZ0RBQWdEO0lBQ3hDLGNBQWMsQ0FBQyxPQUFhO1FBQ2xDLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztJQUMxRCxDQUFDO3FIQTVPVSxhQUFhLGtCQWFkLFFBQVE7eUhBYlAsYUFBYSxjQURELE1BQU07O2tHQUNsQixhQUFhO2tCQUR6QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBYzNCLE1BQU07MkJBQUMsUUFBUTs7QUFrT3BCLHVFQUF1RTtBQUN2RSxTQUFTLE1BQU0sQ0FBQyxPQUF5QixFQUFFLElBQWE7SUFDdEQsT0FBTyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzVFLENBQUM7QUFFRCx5RUFBeUU7QUFDekUsU0FBUyxZQUFZLENBQUMsT0FBb0IsRUFBRSxTQUFpQjtJQUMzRCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsR0FBRyx5QkFBeUIsSUFBSSxTQUFTLElBQUksTUFBTSxFQUFFLEVBQUUsQ0FBQztJQUN2RSxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgQVBQX0lELCBpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7YWRkQXJpYVJlZmVyZW5jZWRJZCwgZ2V0QXJpYVJlZmVyZW5jZUlkcywgcmVtb3ZlQXJpYVJlZmVyZW5jZWRJZH0gZnJvbSAnLi9hcmlhLXJlZmVyZW5jZSc7XG5cbi8qKlxuICogSW50ZXJmYWNlIHVzZWQgdG8gcmVnaXN0ZXIgbWVzc2FnZSBlbGVtZW50cyBhbmQga2VlcCBhIGNvdW50IG9mIGhvdyBtYW55IHJlZ2lzdHJhdGlvbnMgaGF2ZVxuICogdGhlIHNhbWUgbWVzc2FnZSBhbmQgdGhlIHJlZmVyZW5jZSB0byB0aGUgbWVzc2FnZSBlbGVtZW50IHVzZWQgZm9yIHRoZSBgYXJpYS1kZXNjcmliZWRieWAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0ZXJlZE1lc3NhZ2Uge1xuICAvKiogVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgbWVzc2FnZS4gKi9cbiAgbWVzc2FnZUVsZW1lbnQ6IEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhhdCByZWZlcmVuY2UgdGhpcyBtZXNzYWdlIGVsZW1lbnQgdmlhIGBhcmlhLWRlc2NyaWJlZGJ5YC4gKi9cbiAgcmVmZXJlbmNlQ291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBJRCB1c2VkIGZvciB0aGUgYm9keSBjb250YWluZXIgd2hlcmUgYWxsIG1lc3NhZ2VzIGFyZSBhcHBlbmRlZC5cbiAqIEBkZXByZWNhdGVkIE5vIGxvbmdlciBiZWluZyB1c2VkLiBUbyBiZSByZW1vdmVkLlxuICogQGJyZWFraW5nLWNoYW5nZSAxNC4wLjBcbiAqL1xuZXhwb3J0IGNvbnN0IE1FU1NBR0VTX0NPTlRBSU5FUl9JRCA9ICdjZGstZGVzY3JpYmVkYnktbWVzc2FnZS1jb250YWluZXInO1xuXG4vKipcbiAqIElEIHByZWZpeCB1c2VkIGZvciBlYWNoIGNyZWF0ZWQgbWVzc2FnZSBlbGVtZW50LlxuICogQGRlcHJlY2F0ZWQgVG8gYmUgdHVybmVkIGludG8gYSBwcml2YXRlIHZhcmlhYmxlLlxuICogQGJyZWFraW5nLWNoYW5nZSAxNC4wLjBcbiAqL1xuZXhwb3J0IGNvbnN0IENES19ERVNDUklCRURCWV9JRF9QUkVGSVggPSAnY2RrLWRlc2NyaWJlZGJ5LW1lc3NhZ2UnO1xuXG4vKipcbiAqIEF0dHJpYnV0ZSBnaXZlbiB0byBlYWNoIGhvc3QgZWxlbWVudCB0aGF0IGlzIGRlc2NyaWJlZCBieSBhIG1lc3NhZ2UgZWxlbWVudC5cbiAqIEBkZXByZWNhdGVkIFRvIGJlIHR1cm5lZCBpbnRvIGEgcHJpdmF0ZSB2YXJpYWJsZS5cbiAqIEBicmVha2luZy1jaGFuZ2UgMTQuMC4wXG4gKi9cbmV4cG9ydCBjb25zdCBDREtfREVTQ1JJQkVEQllfSE9TVF9BVFRSSUJVVEUgPSAnY2RrLWRlc2NyaWJlZGJ5LWhvc3QnO1xuXG4vKiogR2xvYmFsIGluY3JlbWVudGFsIGlkZW50aWZpZXIgZm9yIGVhY2ggcmVnaXN0ZXJlZCBtZXNzYWdlIGVsZW1lbnQuICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBVdGlsaXR5IHRoYXQgY3JlYXRlcyB2aXN1YWxseSBoaWRkZW4gZWxlbWVudHMgd2l0aCBhIG1lc3NhZ2UgY29udGVudC4gVXNlZnVsIGZvciBlbGVtZW50cyB0aGF0XG4gKiB3YW50IHRvIHVzZSBhcmlhLWRlc2NyaWJlZGJ5IHRvIGZ1cnRoZXIgZGVzY3JpYmUgdGhlbXNlbHZlcyB3aXRob3V0IGFkZGluZyBhZGRpdGlvbmFsIHZpc3VhbFxuICogY29udGVudC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQXJpYURlc2NyaWJlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICAvKiogTWFwIG9mIGFsbCByZWdpc3RlcmVkIG1lc3NhZ2UgZWxlbWVudHMgdGhhdCBoYXZlIGJlZW4gcGxhY2VkIGludG8gdGhlIGRvY3VtZW50LiAqL1xuICBwcml2YXRlIF9tZXNzYWdlUmVnaXN0cnkgPSBuZXcgTWFwPHN0cmluZyB8IEVsZW1lbnQsIFJlZ2lzdGVyZWRNZXNzYWdlPigpO1xuXG4gIC8qKiBDb250YWluZXIgZm9yIGFsbCByZWdpc3RlcmVkIG1lc3NhZ2VzLiAqL1xuICBwcml2YXRlIF9tZXNzYWdlc0NvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVW5pcXVlIElEIGZvciB0aGUgc2VydmljZS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaWQgPSBgJHtuZXh0SWQrK31gO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFRvIGJlIHR1cm5lZCBpbnRvIGEgcmVxdWlyZWQgcGFyYW1ldGVyLlxuICAgICAqIEBicmVha2luZy1jaGFuZ2UgMTQuMC4wXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcGxhdGZvcm0/OiBQbGF0Zm9ybSxcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gICAgdGhpcy5faWQgPSBpbmplY3QoQVBQX0lEKSArICctJyArIG5leHRJZCsrO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhlIGhvc3QgZWxlbWVudCBhbiBhcmlhLWRlc2NyaWJlZGJ5IHJlZmVyZW5jZSB0byBhIGhpZGRlbiBlbGVtZW50IHRoYXQgY29udGFpbnNcbiAgICogdGhlIG1lc3NhZ2UuIElmIHRoZSBzYW1lIG1lc3NhZ2UgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkLCB0aGVuIGl0IHdpbGwgcmV1c2UgdGhlIGNyZWF0ZWRcbiAgICogbWVzc2FnZSBlbGVtZW50LlxuICAgKi9cbiAgZGVzY3JpYmUoaG9zdEVsZW1lbnQ6IEVsZW1lbnQsIG1lc3NhZ2U6IHN0cmluZywgcm9sZT86IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhlIGhvc3QgZWxlbWVudCBhbiBhcmlhLWRlc2NyaWJlZGJ5IHJlZmVyZW5jZSB0byBhbiBhbHJlYWR5LWV4aXN0aW5nIG1lc3NhZ2UgZWxlbWVudC5cbiAgICovXG4gIGRlc2NyaWJlKGhvc3RFbGVtZW50OiBFbGVtZW50LCBtZXNzYWdlOiBIVE1MRWxlbWVudCk6IHZvaWQ7XG5cbiAgZGVzY3JpYmUoaG9zdEVsZW1lbnQ6IEVsZW1lbnQsIG1lc3NhZ2U6IHN0cmluZyB8IEhUTUxFbGVtZW50LCByb2xlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW5CZURlc2NyaWJlZChob3N0RWxlbWVudCwgbWVzc2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBnZXRLZXkobWVzc2FnZSwgcm9sZSk7XG5cbiAgICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGVuc3VyZSB0aGF0IHRoZSBlbGVtZW50IGhhcyBhbiBJRC5cbiAgICAgIHNldE1lc3NhZ2VJZChtZXNzYWdlLCB0aGlzLl9pZCk7XG4gICAgICB0aGlzLl9tZXNzYWdlUmVnaXN0cnkuc2V0KGtleSwge21lc3NhZ2VFbGVtZW50OiBtZXNzYWdlLCByZWZlcmVuY2VDb3VudDogMH0pO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX21lc3NhZ2VSZWdpc3RyeS5oYXMoa2V5KSkge1xuICAgICAgdGhpcy5fY3JlYXRlTWVzc2FnZUVsZW1lbnQobWVzc2FnZSwgcm9sZSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9pc0VsZW1lbnREZXNjcmliZWRCeU1lc3NhZ2UoaG9zdEVsZW1lbnQsIGtleSkpIHtcbiAgICAgIHRoaXMuX2FkZE1lc3NhZ2VSZWZlcmVuY2UoaG9zdEVsZW1lbnQsIGtleSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZXMgdGhlIGhvc3QgZWxlbWVudCdzIGFyaWEtZGVzY3JpYmVkYnkgcmVmZXJlbmNlIHRvIHRoZSBtZXNzYWdlLiAqL1xuICByZW1vdmVEZXNjcmlwdGlvbihob3N0RWxlbWVudDogRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nLCByb2xlPzogc3RyaW5nKTogdm9pZDtcblxuICAvKiogUmVtb3ZlcyB0aGUgaG9zdCBlbGVtZW50J3MgYXJpYS1kZXNjcmliZWRieSByZWZlcmVuY2UgdG8gdGhlIG1lc3NhZ2UgZWxlbWVudC4gKi9cbiAgcmVtb3ZlRGVzY3JpcHRpb24oaG9zdEVsZW1lbnQ6IEVsZW1lbnQsIG1lc3NhZ2U6IEhUTUxFbGVtZW50KTogdm9pZDtcblxuICByZW1vdmVEZXNjcmlwdGlvbihob3N0RWxlbWVudDogRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nIHwgSFRNTEVsZW1lbnQsIHJvbGU/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIW1lc3NhZ2UgfHwgIXRoaXMuX2lzRWxlbWVudE5vZGUoaG9zdEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gZ2V0S2V5KG1lc3NhZ2UsIHJvbGUpO1xuXG4gICAgaWYgKHRoaXMuX2lzRWxlbWVudERlc2NyaWJlZEJ5TWVzc2FnZShob3N0RWxlbWVudCwga2V5KSkge1xuICAgICAgdGhpcy5fcmVtb3ZlTWVzc2FnZVJlZmVyZW5jZShob3N0RWxlbWVudCwga2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgbWVzc2FnZSBpcyBhIHN0cmluZywgaXQgbWVhbnMgdGhhdCBpdCdzIG9uZSB0aGF0IHdlIGNyZWF0ZWQgZm9yIHRoZVxuICAgIC8vIGNvbnN1bWVyIHNvIHdlIGNhbiByZW1vdmUgaXQgc2FmZWx5LCBvdGhlcndpc2Ugd2Ugc2hvdWxkIGxlYXZlIGl0IGluIHBsYWNlLlxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdGVyZWRNZXNzYWdlID0gdGhpcy5fbWVzc2FnZVJlZ2lzdHJ5LmdldChrZXkpO1xuICAgICAgaWYgKHJlZ2lzdGVyZWRNZXNzYWdlICYmIHJlZ2lzdGVyZWRNZXNzYWdlLnJlZmVyZW5jZUNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2RlbGV0ZU1lc3NhZ2VFbGVtZW50KGtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21lc3NhZ2VzQ29udGFpbmVyPy5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fbWVzc2FnZXNDb250YWluZXIucmVtb3ZlKCk7XG4gICAgICB0aGlzLl9tZXNzYWdlc0NvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVucmVnaXN0ZXJzIGFsbCBjcmVhdGVkIG1lc3NhZ2UgZWxlbWVudHMgYW5kIHJlbW92ZXMgdGhlIG1lc3NhZ2UgY29udGFpbmVyLiAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBkZXNjcmliZWRFbGVtZW50cyA9IHRoaXMuX2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgWyR7Q0RLX0RFU0NSSUJFREJZX0hPU1RfQVRUUklCVVRFfT1cIiR7dGhpcy5faWR9XCJdYCxcbiAgICApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXNjcmliZWRFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fcmVtb3ZlQ2RrRGVzY3JpYmVkQnlSZWZlcmVuY2VJZHMoZGVzY3JpYmVkRWxlbWVudHNbaV0pO1xuICAgICAgZGVzY3JpYmVkRWxlbWVudHNbaV0ucmVtb3ZlQXR0cmlidXRlKENES19ERVNDUklCRURCWV9IT1NUX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbWVzc2FnZXNDb250YWluZXI/LnJlbW92ZSgpO1xuICAgIHRoaXMuX21lc3NhZ2VzQ29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLl9tZXNzYWdlUmVnaXN0cnkuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGVsZW1lbnQgaW4gdGhlIHZpc3VhbGx5IGhpZGRlbiBtZXNzYWdlIGNvbnRhaW5lciBlbGVtZW50IHdpdGggdGhlIG1lc3NhZ2VcbiAgICogYXMgaXRzIGNvbnRlbnQgYW5kIGFkZHMgaXQgdG8gdGhlIG1lc3NhZ2UgcmVnaXN0cnkuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVNZXNzYWdlRWxlbWVudChtZXNzYWdlOiBzdHJpbmcsIHJvbGU/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHNldE1lc3NhZ2VJZChtZXNzYWdlRWxlbWVudCwgdGhpcy5faWQpO1xuICAgIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTtcblxuICAgIGlmIChyb2xlKSB7XG4gICAgICBtZXNzYWdlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCByb2xlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGVNZXNzYWdlc0NvbnRhaW5lcigpO1xuICAgIHRoaXMuX21lc3NhZ2VzQ29udGFpbmVyIS5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XG4gICAgdGhpcy5fbWVzc2FnZVJlZ2lzdHJ5LnNldChnZXRLZXkobWVzc2FnZSwgcm9sZSksIHttZXNzYWdlRWxlbWVudCwgcmVmZXJlbmNlQ291bnQ6IDB9KTtcbiAgfVxuXG4gIC8qKiBEZWxldGVzIHRoZSBtZXNzYWdlIGVsZW1lbnQgZnJvbSB0aGUgZ2xvYmFsIG1lc3NhZ2VzIGNvbnRhaW5lci4gKi9cbiAgcHJpdmF0ZSBfZGVsZXRlTWVzc2FnZUVsZW1lbnQoa2V5OiBzdHJpbmcgfCBFbGVtZW50KSB7XG4gICAgdGhpcy5fbWVzc2FnZVJlZ2lzdHJ5LmdldChrZXkpPy5tZXNzYWdlRWxlbWVudD8ucmVtb3ZlKCk7XG4gICAgdGhpcy5fbWVzc2FnZVJlZ2lzdHJ5LmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgdGhlIGdsb2JhbCBjb250YWluZXIgZm9yIGFsbCBhcmlhLWRlc2NyaWJlZGJ5IG1lc3NhZ2VzLiAqL1xuICBwcml2YXRlIF9jcmVhdGVNZXNzYWdlc0NvbnRhaW5lcigpIHtcbiAgICBpZiAodGhpcy5fbWVzc2FnZXNDb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250YWluZXJDbGFzc05hbWUgPSAnY2RrLWRlc2NyaWJlZGJ5LW1lc3NhZ2UtY29udGFpbmVyJztcbiAgICBjb25zdCBzZXJ2ZXJDb250YWluZXJzID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIGAuJHtjb250YWluZXJDbGFzc05hbWV9W3BsYXRmb3JtPVwic2VydmVyXCJdYCxcbiAgICApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXJ2ZXJDb250YWluZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBXaGVuIGdvaW5nIGZyb20gdGhlIHNlcnZlciB0byB0aGUgY2xpZW50LCB3ZSBtYXkgZW5kIHVwIGluIGEgc2l0dWF0aW9uIHdoZXJlIHRoZXJlJ3NcbiAgICAgIC8vIGFscmVhZHkgYSBjb250YWluZXIgb24gdGhlIHBhZ2UsIGJ1dCB3ZSBkb24ndCBoYXZlIGEgcmVmZXJlbmNlIHRvIGl0LiBDbGVhciB0aGVcbiAgICAgIC8vIG9sZCBjb250YWluZXIgc28gd2UgZG9uJ3QgZ2V0IGR1cGxpY2F0ZXMuIERvaW5nIHRoaXMsIGluc3RlYWQgb2YgZW1wdHlpbmcgdGhlIHByZXZpb3VzXG4gICAgICAvLyBjb250YWluZXIsIHNob3VsZCBiZSBzbGlnaHRseSBmYXN0ZXIuXG4gICAgICBzZXJ2ZXJDb250YWluZXJzW2ldLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VzQ29udGFpbmVyID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAvLyBXZSBhZGQgYHZpc2liaWxpdHk6IGhpZGRlbmAgaW4gb3JkZXIgdG8gcHJldmVudCB0ZXh0IGluIHRoaXMgY29udGFpbmVyIGZyb21cbiAgICAvLyBiZWluZyBzZWFyY2hhYmxlIGJ5IHRoZSBicm93c2VyJ3MgQ3RybCArIEYgZnVuY3Rpb25hbGl0eS5cbiAgICAvLyBTY3JlZW4tcmVhZGVycyB3aWxsIHN0aWxsIHJlYWQgdGhlIGRlc2NyaXB0aW9uIGZvciBlbGVtZW50cyB3aXRoIGFyaWEtZGVzY3JpYmVkYnkgZXZlblxuICAgIC8vIHdoZW4gdGhlIGRlc2NyaXB0aW9uIGVsZW1lbnQgaXMgbm90IHZpc2libGUuXG4gICAgbWVzc2FnZXNDb250YWluZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIC8vIEV2ZW4gdGhvdWdoIHdlIHVzZSBgdmlzaWJpbGl0eTogaGlkZGVuYCwgd2Ugc3RpbGwgYXBwbHkgYGNkay12aXN1YWxseS1oaWRkZW5gIHNvIHRoYXRcbiAgICAvLyB0aGUgZGVzY3JpcHRpb24gZWxlbWVudCBkb2Vzbid0IGltcGFjdCBwYWdlIGxheW91dC5cbiAgICBtZXNzYWdlc0NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGNvbnRhaW5lckNsYXNzTmFtZSk7XG4gICAgbWVzc2FnZXNDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnY2RrLXZpc3VhbGx5LWhpZGRlbicpO1xuXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxNC4wLjAgUmVtb3ZlIG51bGwgY2hlY2sgZm9yIGBfcGxhdGZvcm1gLlxuICAgIGlmICh0aGlzLl9wbGF0Zm9ybSAmJiAhdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICBtZXNzYWdlc0NvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3BsYXRmb3JtJywgJ3NlcnZlcicpO1xuICAgIH1cblxuICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVzc2FnZXNDb250YWluZXIpO1xuICAgIHRoaXMuX21lc3NhZ2VzQ29udGFpbmVyID0gbWVzc2FnZXNDb250YWluZXI7XG4gIH1cblxuICAvKiogUmVtb3ZlcyBhbGwgY2RrLWRlc2NyaWJlZGJ5IG1lc3NhZ2VzIHRoYXQgYXJlIGhvc3RlZCB0aHJvdWdoIHRoZSBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9yZW1vdmVDZGtEZXNjcmliZWRCeVJlZmVyZW5jZUlkcyhlbGVtZW50OiBFbGVtZW50KSB7XG4gICAgLy8gUmVtb3ZlIGFsbCBhcmlhLWRlc2NyaWJlZGJ5IHJlZmVyZW5jZSBJRHMgdGhhdCBhcmUgcHJlZml4ZWQgYnkgQ0RLX0RFU0NSSUJFREJZX0lEX1BSRUZJWFxuICAgIGNvbnN0IG9yaWdpbmFsUmVmZXJlbmNlSWRzID0gZ2V0QXJpYVJlZmVyZW5jZUlkcyhlbGVtZW50LCAnYXJpYS1kZXNjcmliZWRieScpLmZpbHRlcihcbiAgICAgIGlkID0+IGlkLmluZGV4T2YoQ0RLX0RFU0NSSUJFREJZX0lEX1BSRUZJWCkgIT0gMCxcbiAgICApO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jywgb3JpZ2luYWxSZWZlcmVuY2VJZHMuam9pbignICcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbWVzc2FnZSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdXNpbmcgYXJpYS1kZXNjcmliZWRieSBhbmQgaW5jcmVtZW50cyB0aGUgcmVnaXN0ZXJlZFxuICAgKiBtZXNzYWdlJ3MgcmVmZXJlbmNlIGNvdW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfYWRkTWVzc2FnZVJlZmVyZW5jZShlbGVtZW50OiBFbGVtZW50LCBrZXk6IHN0cmluZyB8IEVsZW1lbnQpIHtcbiAgICBjb25zdCByZWdpc3RlcmVkTWVzc2FnZSA9IHRoaXMuX21lc3NhZ2VSZWdpc3RyeS5nZXQoa2V5KSE7XG5cbiAgICAvLyBBZGQgdGhlIGFyaWEtZGVzY3JpYmVkYnkgcmVmZXJlbmNlIGFuZCBzZXQgdGhlXG4gICAgLy8gZGVzY3JpYmVkYnlfaG9zdCBhdHRyaWJ1dGUgdG8gbWFyayB0aGUgZWxlbWVudC5cbiAgICBhZGRBcmlhUmVmZXJlbmNlZElkKGVsZW1lbnQsICdhcmlhLWRlc2NyaWJlZGJ5JywgcmVnaXN0ZXJlZE1lc3NhZ2UubWVzc2FnZUVsZW1lbnQuaWQpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKENES19ERVNDUklCRURCWV9IT1NUX0FUVFJJQlVURSwgdGhpcy5faWQpO1xuICAgIHJlZ2lzdGVyZWRNZXNzYWdlLnJlZmVyZW5jZUNvdW50Kys7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIG1lc3NhZ2UgcmVmZXJlbmNlIGZyb20gdGhlIGVsZW1lbnQgdXNpbmcgYXJpYS1kZXNjcmliZWRieVxuICAgKiBhbmQgZGVjcmVtZW50cyB0aGUgcmVnaXN0ZXJlZCBtZXNzYWdlJ3MgcmVmZXJlbmNlIGNvdW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlTWVzc2FnZVJlZmVyZW5jZShlbGVtZW50OiBFbGVtZW50LCBrZXk6IHN0cmluZyB8IEVsZW1lbnQpIHtcbiAgICBjb25zdCByZWdpc3RlcmVkTWVzc2FnZSA9IHRoaXMuX21lc3NhZ2VSZWdpc3RyeS5nZXQoa2V5KSE7XG4gICAgcmVnaXN0ZXJlZE1lc3NhZ2UucmVmZXJlbmNlQ291bnQtLTtcblxuICAgIHJlbW92ZUFyaWFSZWZlcmVuY2VkSWQoZWxlbWVudCwgJ2FyaWEtZGVzY3JpYmVkYnknLCByZWdpc3RlcmVkTWVzc2FnZS5tZXNzYWdlRWxlbWVudC5pZCk7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoQ0RLX0RFU0NSSUJFREJZX0hPU1RfQVRUUklCVVRFKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgaGFzIGJlZW4gZGVzY3JpYmVkIGJ5IHRoZSBwcm92aWRlZCBtZXNzYWdlIElELiAqL1xuICBwcml2YXRlIF9pc0VsZW1lbnREZXNjcmliZWRCeU1lc3NhZ2UoZWxlbWVudDogRWxlbWVudCwga2V5OiBzdHJpbmcgfCBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmVmZXJlbmNlSWRzID0gZ2V0QXJpYVJlZmVyZW5jZUlkcyhlbGVtZW50LCAnYXJpYS1kZXNjcmliZWRieScpO1xuICAgIGNvbnN0IHJlZ2lzdGVyZWRNZXNzYWdlID0gdGhpcy5fbWVzc2FnZVJlZ2lzdHJ5LmdldChrZXkpO1xuICAgIGNvbnN0IG1lc3NhZ2VJZCA9IHJlZ2lzdGVyZWRNZXNzYWdlICYmIHJlZ2lzdGVyZWRNZXNzYWdlLm1lc3NhZ2VFbGVtZW50LmlkO1xuXG4gICAgcmV0dXJuICEhbWVzc2FnZUlkICYmIHJlZmVyZW5jZUlkcy5pbmRleE9mKG1lc3NhZ2VJZCkgIT0gLTE7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgbWVzc2FnZSBjYW4gYmUgZGVzY3JpYmVkIG9uIGEgcGFydGljdWxhciBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9jYW5CZURlc2NyaWJlZChlbGVtZW50OiBFbGVtZW50LCBtZXNzYWdlOiBzdHJpbmcgfCBIVE1MRWxlbWVudCB8IHZvaWQpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuX2lzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZSAmJiB0eXBlb2YgbWVzc2FnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIFdlJ2QgaGF2ZSB0byBtYWtlIHNvbWUgYXNzdW1wdGlvbnMgYWJvdXQgdGhlIGRlc2NyaXB0aW9uIGVsZW1lbnQncyB0ZXh0LCBpZiB0aGUgY29uc3VtZXJcbiAgICAgIC8vIHBhc3NlZCBpbiBhbiBlbGVtZW50LiBBc3N1bWUgdGhhdCBpZiBhbiBlbGVtZW50IGlzIHBhc3NlZCBpbiwgdGhlIGNvbnN1bWVyIGhhcyB2ZXJpZmllZFxuICAgICAgLy8gdGhhdCBpdCBjYW4gYmUgdXNlZCBhcyBhIGRlc2NyaXB0aW9uLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpbW1lZE1lc3NhZ2UgPSBtZXNzYWdlID09IG51bGwgPyAnJyA6IGAke21lc3NhZ2V9YC50cmltKCk7XG4gICAgY29uc3QgYXJpYUxhYmVsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcblxuICAgIC8vIFdlIHNob3VsZG4ndCBzZXQgZGVzY3JpcHRpb25zIGlmIHRoZXkncmUgZXhhY3RseSB0aGUgc2FtZSBhcyB0aGUgYGFyaWEtbGFiZWxgIG9mIHRoZVxuICAgIC8vIGVsZW1lbnQsIGJlY2F1c2Ugc2NyZWVuIHJlYWRlcnMgd2lsbCBlbmQgdXAgcmVhZGluZyBvdXQgdGhlIHNhbWUgdGV4dCB0d2ljZSBpbiBhIHJvdy5cbiAgICByZXR1cm4gdHJpbW1lZE1lc3NhZ2UgPyAhYXJpYUxhYmVsIHx8IGFyaWFMYWJlbC50cmltKCkgIT09IHRyaW1tZWRNZXNzYWdlIDogZmFsc2U7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSBub2RlIGlzIGFuIEVsZW1lbnQgbm9kZS4gKi9cbiAgcHJpdmF0ZSBfaXNFbGVtZW50Tm9kZShlbGVtZW50OiBOb2RlKTogZWxlbWVudCBpcyBFbGVtZW50IHtcbiAgICByZXR1cm4gZWxlbWVudC5ub2RlVHlwZSA9PT0gdGhpcy5fZG9jdW1lbnQuRUxFTUVOVF9OT0RFO1xuICB9XG59XG5cbi8qKiBHZXRzIGEga2V5IHRoYXQgY2FuIGJlIHVzZWQgdG8gbG9vayBtZXNzYWdlcyB1cCBpbiB0aGUgcmVnaXN0cnkuICovXG5mdW5jdGlvbiBnZXRLZXkobWVzc2FnZTogc3RyaW5nIHwgRWxlbWVudCwgcm9sZT86IHN0cmluZyk6IHN0cmluZyB8IEVsZW1lbnQge1xuICByZXR1cm4gdHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnID8gYCR7cm9sZSB8fCAnJ30vJHttZXNzYWdlfWAgOiBtZXNzYWdlO1xufVxuXG4vKiogQXNzaWducyBhIHVuaXF1ZSBJRCB0byBhbiBlbGVtZW50LCBpZiBpdCBkb2Vzbid0IGhhdmUgb25lIGFscmVhZHkuICovXG5mdW5jdGlvbiBzZXRNZXNzYWdlSWQoZWxlbWVudDogSFRNTEVsZW1lbnQsIHNlcnZpY2VJZDogc3RyaW5nKSB7XG4gIGlmICghZWxlbWVudC5pZCkge1xuICAgIGVsZW1lbnQuaWQgPSBgJHtDREtfREVTQ1JJQkVEQllfSURfUFJFRklYfS0ke3NlcnZpY2VJZH0tJHtuZXh0SWQrK31gO1xuICB9XG59XG4iXX0=