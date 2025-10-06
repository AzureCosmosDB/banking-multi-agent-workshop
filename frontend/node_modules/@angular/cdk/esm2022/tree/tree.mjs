/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TREE_KEY_MANAGER, } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { isDataSource, SelectionModel, } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, Input, IterableDiffers, Output, QueryList, ViewChild, ViewEncapsulation, numberAttribute, inject, booleanAttribute, } from '@angular/core';
import { coerceObservable } from '@angular/cdk/coercion/private';
import { BehaviorSubject, combineLatest, concat, EMPTY, Subject, isObservable, of as observableOf, } from 'rxjs';
import { distinctUntilChanged, concatMap, map, reduce, startWith, switchMap, take, takeUntil, tap, } from 'rxjs/operators';
import { CdkTreeNodeDef, CdkTreeNodeOutletContext } from './node';
import { CdkTreeNodeOutlet } from './outlet';
import { getMultipleTreeControlsError, getTreeControlMissingError, getTreeMissingMatchingNodeDefError, getTreeMultipleDefaultNodeDefsError, getTreeNoValidDataSourceError, } from './tree-errors';
import * as i0 from "@angular/core";
/**
 * CDK tree component that connects with a data source to retrieve data of type `T` and renders
 * dataNodes with hierarchy. Updates the dataNodes when new data is provided by the data source.
 */
export class CdkTree {
    /**
     * Provides a stream containing the latest data array to render. Influenced by the tree's
     * stream of view window (what dataNodes are currently on screen).
     * Data source can be an observable of data array, or a data array to render.
     */
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(dataSource) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    constructor(_differs, _changeDetectorRef) {
        this._differs = _differs;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = inject(ElementRef);
        this._dir = inject(Directionality);
        /** Subject that emits when the component has been destroyed. */
        this._onDestroy = new Subject();
        /** Level of nodes */
        this._levels = new Map();
        /** The immediate parents for a node. This is `null` if there is no parent. */
        this._parents = new Map();
        /**
         * Nodes grouped into each set, which is a list of nodes displayed together in the DOM.
         *
         * Lookup key is the parent of a set. Root nodes have key of null.
         *
         * Values is a 'set' of tree nodes. Each tree node maps to a treeitem element. Sets are in the
         * order that it is rendered. Each set maps directly to aria-posinset and aria-setsize attributes.
         */
        this._ariaSets = new Map();
        // TODO(tinayuangao): Setup a listener for scrolling, emit the calculated view to viewChange.
        //     Remove the MAX_VALUE in viewChange
        /**
         * Stream containing the latest information on what rows are being displayed on screen.
         * Can be used by the data source to as a heuristic of what data should be provided.
         */
        this.viewChange = new BehaviorSubject({
            start: 0,
            end: Number.MAX_VALUE,
        });
        /**
         * Maintain a synchronous cache of flattened data nodes. This will only be
         * populated after initial render, and in certain cases, will be delayed due to
         * relying on Observable `getChildren` calls.
         */
        this._flattenedNodes = new BehaviorSubject([]);
        /** The automatically determined node type for the tree. */
        this._nodeType = new BehaviorSubject(null);
        /** The mapping between data and the node that is rendered. */
        this._nodes = new BehaviorSubject(new Map());
        /**
         * Synchronous cache of nodes for the `TreeKeyManager`. This is separate
         * from `_flattenedNodes` so they can be independently updated at different
         * times.
         */
        this._keyManagerNodes = new BehaviorSubject([]);
        this._keyManagerFactory = inject(TREE_KEY_MANAGER);
        this._viewInit = false;
    }
    ngAfterContentInit() {
        this._initializeKeyManager();
    }
    ngAfterContentChecked() {
        this._updateDefaultNodeDefinition();
        this._subscribeToDataChanges();
    }
    ngOnDestroy() {
        this._nodeOutlet.viewContainer.clear();
        this.viewChange.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
        if (this._dataSource && typeof this._dataSource.disconnect === 'function') {
            this.dataSource.disconnect(this);
        }
        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
        // In certain tests, the tree might be destroyed before this is initialized
        // in `ngAfterContentInit`.
        this._keyManager?.destroy();
    }
    ngOnInit() {
        this._checkTreeControlUsage();
        this._initializeDataDiffer();
    }
    ngAfterViewInit() {
        this._viewInit = true;
    }
    _updateDefaultNodeDefinition() {
        const defaultNodeDefs = this._nodeDefs.filter(def => !def.when);
        if (defaultNodeDefs.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeMultipleDefaultNodeDefsError();
        }
        this._defaultNodeDef = defaultNodeDefs[0];
    }
    /**
     * Sets the node type for the tree, if it hasn't been set yet.
     *
     * This will be called by the first node that's rendered in order for the tree
     * to determine what data transformations are required.
     */
    _setNodeTypeIfUnset(nodeType) {
        if (this._nodeType.value === null) {
            this._nodeType.next(nodeType);
        }
    }
    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the node outlet. Otherwise start listening for new data.
     */
    _switchDataSource(dataSource) {
        if (this._dataSource && typeof this._dataSource.disconnect === 'function') {
            this.dataSource.disconnect(this);
        }
        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
        // Remove the all dataNodes if there is now no data source
        if (!dataSource) {
            this._nodeOutlet.viewContainer.clear();
        }
        this._dataSource = dataSource;
        if (this._nodeDefs) {
            this._subscribeToDataChanges();
        }
    }
    _getExpansionModel() {
        if (!this.treeControl) {
            this._expansionModel ??= new SelectionModel(true);
            return this._expansionModel;
        }
        return this.treeControl.expansionModel;
    }
    /** Set up a subscription for the data provided by the data source. */
    _subscribeToDataChanges() {
        if (this._dataSubscription) {
            return;
        }
        let dataStream;
        if (isDataSource(this._dataSource)) {
            dataStream = this._dataSource.connect(this);
        }
        else if (isObservable(this._dataSource)) {
            dataStream = this._dataSource;
        }
        else if (Array.isArray(this._dataSource)) {
            dataStream = observableOf(this._dataSource);
        }
        if (!dataStream) {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw getTreeNoValidDataSourceError();
            }
            return;
        }
        this._dataSubscription = this._getRenderData(dataStream)
            .pipe(takeUntil(this._onDestroy))
            .subscribe(renderingData => {
            this._renderDataChanges(renderingData);
        });
    }
    /** Given an Observable containing a stream of the raw data, returns an Observable containing the RenderingData */
    _getRenderData(dataStream) {
        const expansionModel = this._getExpansionModel();
        return combineLatest([
            dataStream,
            this._nodeType,
            // We don't use the expansion data directly, however we add it here to essentially
            // trigger data rendering when expansion changes occur.
            expansionModel.changed.pipe(startWith(null), tap(expansionChanges => {
                this._emitExpansionChanges(expansionChanges);
            })),
        ]).pipe(switchMap(([data, nodeType]) => {
            if (nodeType === null) {
                return observableOf({ renderNodes: data, flattenedNodes: null, nodeType });
            }
            // If we're here, then we know what our node type is, and therefore can
            // perform our usual rendering pipeline, which necessitates converting the data
            return this._computeRenderingData(data, nodeType).pipe(map(convertedData => ({ ...convertedData, nodeType })));
        }));
    }
    _renderDataChanges(data) {
        if (data.nodeType === null) {
            this.renderNodeChanges(data.renderNodes);
            return;
        }
        // If we're here, then we know what our node type is, and therefore can
        // perform our usual rendering pipeline.
        this._updateCachedData(data.flattenedNodes);
        this.renderNodeChanges(data.renderNodes);
        this._updateKeyManagerItems(data.flattenedNodes);
    }
    _emitExpansionChanges(expansionChanges) {
        if (!expansionChanges) {
            return;
        }
        const nodes = this._nodes.value;
        for (const added of expansionChanges.added) {
            const node = nodes.get(added);
            node?._emitExpansionState(true);
        }
        for (const removed of expansionChanges.removed) {
            const node = nodes.get(removed);
            node?._emitExpansionState(false);
        }
    }
    _initializeKeyManager() {
        const items = combineLatest([this._keyManagerNodes, this._nodes]).pipe(map(([keyManagerNodes, renderNodes]) => keyManagerNodes.reduce((items, data) => {
            const node = renderNodes.get(this._getExpansionKey(data));
            if (node) {
                items.push(node);
            }
            return items;
        }, [])));
        const keyManagerOptions = {
            trackBy: node => this._getExpansionKey(node.data),
            skipPredicate: node => !!node.isDisabled,
            typeAheadDebounceInterval: true,
            horizontalOrientation: this._dir.value,
        };
        this._keyManager = this._keyManagerFactory(items, keyManagerOptions);
    }
    _initializeDataDiffer() {
        // Provide a default trackBy based on `_getExpansionKey` if one isn't provided.
        const trackBy = this.trackBy ?? ((_index, item) => this._getExpansionKey(item));
        this._dataDiffer = this._differs.find([]).create(trackBy);
    }
    _checkTreeControlUsage() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // Verify that Tree follows API contract of using one of TreeControl, levelAccessor or
            // childrenAccessor. Throw an appropriate error if contract is not met.
            let numTreeControls = 0;
            if (this.treeControl) {
                numTreeControls++;
            }
            if (this.levelAccessor) {
                numTreeControls++;
            }
            if (this.childrenAccessor) {
                numTreeControls++;
            }
            if (!numTreeControls) {
                throw getTreeControlMissingError();
            }
            else if (numTreeControls > 1) {
                throw getMultipleTreeControlsError();
            }
        }
    }
    /** Check for changes made in the data and render each change (node added/removed/moved). */
    renderNodeChanges(data, dataDiffer = this._dataDiffer, viewContainer = this._nodeOutlet.viewContainer, parentData) {
        const changes = dataDiffer.diff(data);
        // Some tree consumers expect change detection to propagate to nodes
        // even when the array itself hasn't changed; we explicitly detect changes
        // anyways in order for nodes to update their data.
        //
        // However, if change detection is called while the component's view is
        // still initing, then the order of child views initing will be incorrect;
        // to prevent this, we only exit early if the view hasn't initialized yet.
        if (!changes && !this._viewInit) {
            return;
        }
        changes?.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                this.insertNode(data[currentIndex], currentIndex, viewContainer, parentData);
            }
            else if (currentIndex == null) {
                viewContainer.remove(adjustedPreviousIndex);
            }
            else {
                const view = viewContainer.get(adjustedPreviousIndex);
                viewContainer.move(view, currentIndex);
            }
        });
        // If the data itself changes, but keeps the same trackBy, we need to update the templates'
        // context to reflect the new object.
        changes?.forEachIdentityChange((record) => {
            const newData = record.item;
            if (record.currentIndex != undefined) {
                const view = viewContainer.get(record.currentIndex);
                view.context.$implicit = newData;
            }
        });
        // Note: we only `detectChanges` from a top-level call, otherwise we risk overflowing
        // the call stack since this method is called recursively (see #29733.)
        // TODO: change to `this._changeDetectorRef.markForCheck()`,
        // or just switch this component to use signals.
        if (parentData) {
            this._changeDetectorRef.markForCheck();
        }
        else {
            this._changeDetectorRef.detectChanges();
        }
    }
    /**
     * Finds the matching node definition that should be used for this node data. If there is only
     * one node definition, it is returned. Otherwise, find the node definition that has a when
     * predicate that returns true with the data. If none return true, return the default node
     * definition.
     */
    _getNodeDef(data, i) {
        if (this._nodeDefs.length === 1) {
            return this._nodeDefs.first;
        }
        const nodeDef = this._nodeDefs.find(def => def.when && def.when(i, data)) || this._defaultNodeDef;
        if (!nodeDef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeMissingMatchingNodeDefError();
        }
        return nodeDef;
    }
    /**
     * Create the embedded view for the data node template and place it in the correct index location
     * within the data node view container.
     */
    insertNode(nodeData, index, viewContainer, parentData) {
        const levelAccessor = this._getLevelAccessor();
        const node = this._getNodeDef(nodeData, index);
        const key = this._getExpansionKey(nodeData);
        // Node context that will be provided to created embedded view
        const context = new CdkTreeNodeOutletContext(nodeData);
        parentData ??= this._parents.get(key) ?? undefined;
        // If the tree is flat tree, then use the `getLevel` function in flat tree control
        // Otherwise, use the level of parent node.
        if (levelAccessor) {
            context.level = levelAccessor(nodeData);
        }
        else if (parentData !== undefined && this._levels.has(this._getExpansionKey(parentData))) {
            context.level = this._levels.get(this._getExpansionKey(parentData)) + 1;
        }
        else {
            context.level = 0;
        }
        this._levels.set(key, context.level);
        // Use default tree nodeOutlet, or nested node's nodeOutlet
        const container = viewContainer ? viewContainer : this._nodeOutlet.viewContainer;
        container.createEmbeddedView(node.template, context, index);
        // Set the data to just created `CdkTreeNode`.
        // The `CdkTreeNode` created from `createEmbeddedView` will be saved in static variable
        //     `mostRecentTreeNode`. We get it from static variable and pass the node data to it.
        if (CdkTreeNode.mostRecentTreeNode) {
            CdkTreeNode.mostRecentTreeNode.data = nodeData;
        }
    }
    /** Whether the data node is expanded or collapsed. Returns true if it's expanded. */
    isExpanded(dataNode) {
        return !!(this.treeControl?.isExpanded(dataNode) ||
            this._expansionModel?.isSelected(this._getExpansionKey(dataNode)));
    }
    /** If the data node is currently expanded, collapse it. Otherwise, expand it. */
    toggle(dataNode) {
        if (this.treeControl) {
            this.treeControl.toggle(dataNode);
        }
        else if (this._expansionModel) {
            this._expansionModel.toggle(this._getExpansionKey(dataNode));
        }
    }
    /** Expand the data node. If it is already expanded, does nothing. */
    expand(dataNode) {
        if (this.treeControl) {
            this.treeControl.expand(dataNode);
        }
        else if (this._expansionModel) {
            this._expansionModel.select(this._getExpansionKey(dataNode));
        }
    }
    /** Collapse the data node. If it is already collapsed, does nothing. */
    collapse(dataNode) {
        if (this.treeControl) {
            this.treeControl.collapse(dataNode);
        }
        else if (this._expansionModel) {
            this._expansionModel.deselect(this._getExpansionKey(dataNode));
        }
    }
    /**
     * If the data node is currently expanded, collapse it and all its descendants.
     * Otherwise, expand it and all its descendants.
     */
    toggleDescendants(dataNode) {
        if (this.treeControl) {
            this.treeControl.toggleDescendants(dataNode);
        }
        else if (this._expansionModel) {
            if (this.isExpanded(dataNode)) {
                this.collapseDescendants(dataNode);
            }
            else {
                this.expandDescendants(dataNode);
            }
        }
    }
    /**
     * Expand the data node and all its descendants. If they are already expanded, does nothing.
     */
    expandDescendants(dataNode) {
        if (this.treeControl) {
            this.treeControl.expandDescendants(dataNode);
        }
        else if (this._expansionModel) {
            const expansionModel = this._expansionModel;
            expansionModel.select(this._getExpansionKey(dataNode));
            this._getDescendants(dataNode)
                .pipe(take(1), takeUntil(this._onDestroy))
                .subscribe(children => {
                expansionModel.select(...children.map(child => this._getExpansionKey(child)));
            });
        }
    }
    /** Collapse the data node and all its descendants. If it is already collapsed, does nothing. */
    collapseDescendants(dataNode) {
        if (this.treeControl) {
            this.treeControl.collapseDescendants(dataNode);
        }
        else if (this._expansionModel) {
            const expansionModel = this._expansionModel;
            expansionModel.deselect(this._getExpansionKey(dataNode));
            this._getDescendants(dataNode)
                .pipe(take(1), takeUntil(this._onDestroy))
                .subscribe(children => {
                expansionModel.deselect(...children.map(child => this._getExpansionKey(child)));
            });
        }
    }
    /** Expands all data nodes in the tree. */
    expandAll() {
        if (this.treeControl) {
            this.treeControl.expandAll();
        }
        else if (this._expansionModel) {
            const expansionModel = this._expansionModel;
            expansionModel.select(...this._flattenedNodes.value.map(child => this._getExpansionKey(child)));
        }
    }
    /** Collapse all data nodes in the tree. */
    collapseAll() {
        if (this.treeControl) {
            this.treeControl.collapseAll();
        }
        else if (this._expansionModel) {
            const expansionModel = this._expansionModel;
            expansionModel.deselect(...this._flattenedNodes.value.map(child => this._getExpansionKey(child)));
        }
    }
    /** Level accessor, used for compatibility between the old Tree and new Tree */
    _getLevelAccessor() {
        return this.treeControl?.getLevel?.bind(this.treeControl) ?? this.levelAccessor;
    }
    /** Children accessor, used for compatibility between the old Tree and new Tree */
    _getChildrenAccessor() {
        return this.treeControl?.getChildren?.bind(this.treeControl) ?? this.childrenAccessor;
    }
    /**
     * Gets the direct children of a node; used for compatibility between the old tree and the
     * new tree.
     */
    _getDirectChildren(dataNode) {
        const levelAccessor = this._getLevelAccessor();
        const expansionModel = this._expansionModel ?? this.treeControl?.expansionModel;
        if (!expansionModel) {
            return observableOf([]);
        }
        const key = this._getExpansionKey(dataNode);
        const isExpanded = expansionModel.changed.pipe(switchMap(changes => {
            if (changes.added.includes(key)) {
                return observableOf(true);
            }
            else if (changes.removed.includes(key)) {
                return observableOf(false);
            }
            return EMPTY;
        }), startWith(this.isExpanded(dataNode)));
        if (levelAccessor) {
            return combineLatest([isExpanded, this._flattenedNodes]).pipe(map(([expanded, flattenedNodes]) => {
                if (!expanded) {
                    return [];
                }
                return this._findChildrenByLevel(levelAccessor, flattenedNodes, dataNode, 1);
            }));
        }
        const childrenAccessor = this._getChildrenAccessor();
        if (childrenAccessor) {
            return coerceObservable(childrenAccessor(dataNode) ?? []);
        }
        throw getTreeControlMissingError();
    }
    /**
     * Given the list of flattened nodes, the level accessor, and the level range within
     * which to consider children, finds the children for a given node.
     *
     * For example, for direct children, `levelDelta` would be 1. For all descendants,
     * `levelDelta` would be Infinity.
     */
    _findChildrenByLevel(levelAccessor, flattenedNodes, dataNode, levelDelta) {
        const key = this._getExpansionKey(dataNode);
        const startIndex = flattenedNodes.findIndex(node => this._getExpansionKey(node) === key);
        const dataNodeLevel = levelAccessor(dataNode);
        const expectedLevel = dataNodeLevel + levelDelta;
        const results = [];
        // Goes through flattened tree nodes in the `flattenedNodes` array, and get all
        // descendants within a certain level range.
        //
        // If we reach a node whose level is equal to or less than the level of the tree node,
        // we hit a sibling or parent's sibling, and should stop.
        for (let i = startIndex + 1; i < flattenedNodes.length; i++) {
            const currentLevel = levelAccessor(flattenedNodes[i]);
            if (currentLevel <= dataNodeLevel) {
                break;
            }
            if (currentLevel <= expectedLevel) {
                results.push(flattenedNodes[i]);
            }
        }
        return results;
    }
    /**
     * Adds the specified node component to the tree's internal registry.
     *
     * This primarily facilitates keyboard navigation.
     */
    _registerNode(node) {
        this._nodes.value.set(this._getExpansionKey(node.data), node);
        this._nodes.next(this._nodes.value);
    }
    /** Removes the specified node component from the tree's internal registry. */
    _unregisterNode(node) {
        this._nodes.value.delete(this._getExpansionKey(node.data));
        this._nodes.next(this._nodes.value);
    }
    /**
     * For the given node, determine the level where this node appears in the tree.
     *
     * This is intended to be used for `aria-level` but is 0-indexed.
     */
    _getLevel(node) {
        return this._levels.get(this._getExpansionKey(node));
    }
    /**
     * For the given node, determine the size of the parent's child set.
     *
     * This is intended to be used for `aria-setsize`.
     */
    _getSetSize(dataNode) {
        const set = this._getAriaSet(dataNode);
        return set.length;
    }
    /**
     * For the given node, determine the index (starting from 1) of the node in its parent's child set.
     *
     * This is intended to be used for `aria-posinset`.
     */
    _getPositionInSet(dataNode) {
        const set = this._getAriaSet(dataNode);
        const key = this._getExpansionKey(dataNode);
        return set.findIndex(node => this._getExpansionKey(node) === key) + 1;
    }
    /** Given a CdkTreeNode, gets the node that renders that node's parent's data. */
    _getNodeParent(node) {
        const parent = this._parents.get(this._getExpansionKey(node.data));
        return parent && this._nodes.value.get(this._getExpansionKey(parent));
    }
    /** Given a CdkTreeNode, gets the nodes that renders that node's child data. */
    _getNodeChildren(node) {
        return this._getDirectChildren(node.data).pipe(map(children => children.reduce((nodes, child) => {
            const value = this._nodes.value.get(this._getExpansionKey(child));
            if (value) {
                nodes.push(value);
            }
            return nodes;
        }, [])));
    }
    /** `keydown` event handler; this just passes the event to the `TreeKeyManager`. */
    _sendKeydownToKeyManager(event) {
        // Only handle events directly on the tree or directly on one of the nodes, otherwise
        // we risk interfering with events in the projected content (see #29828).
        if (event.target === this._elementRef.nativeElement) {
            this._keyManager.onKeydown(event);
        }
        else {
            const nodes = this._nodes.getValue();
            for (const [, node] of nodes) {
                if (event.target === node._elementRef.nativeElement) {
                    this._keyManager.onKeydown(event);
                    break;
                }
            }
        }
    }
    /** Gets all nested descendants of a given node. */
    _getDescendants(dataNode) {
        if (this.treeControl) {
            return observableOf(this.treeControl.getDescendants(dataNode));
        }
        if (this.levelAccessor) {
            const results = this._findChildrenByLevel(this.levelAccessor, this._flattenedNodes.value, dataNode, Infinity);
            return observableOf(results);
        }
        if (this.childrenAccessor) {
            return this._getAllChildrenRecursively(dataNode).pipe(reduce((allChildren, nextChildren) => {
                allChildren.push(...nextChildren);
                return allChildren;
            }, []));
        }
        throw getTreeControlMissingError();
    }
    /**
     * Gets all children and sub-children of the provided node.
     *
     * This will emit multiple times, in the order that the children will appear
     * in the tree, and can be combined with a `reduce` operator.
     */
    _getAllChildrenRecursively(dataNode) {
        if (!this.childrenAccessor) {
            return observableOf([]);
        }
        return coerceObservable(this.childrenAccessor(dataNode)).pipe(take(1), switchMap(children => {
            // Here, we cache the parents of a particular child so that we can compute the levels.
            for (const child of children) {
                this._parents.set(this._getExpansionKey(child), dataNode);
            }
            return observableOf(...children).pipe(concatMap(child => concat(observableOf([child]), this._getAllChildrenRecursively(child))));
        }));
    }
    _getExpansionKey(dataNode) {
        // In the case that a key accessor function was not provided by the
        // tree user, we'll default to using the node object itself as the key.
        //
        // This cast is safe since:
        // - if an expansionKey is provided, TS will infer the type of K to be
        //   the return type.
        // - if it's not, then K will be defaulted to T.
        return this.expansionKey?.(dataNode) ?? dataNode;
    }
    _getAriaSet(node) {
        const key = this._getExpansionKey(node);
        const parent = this._parents.get(key);
        const parentKey = parent ? this._getExpansionKey(parent) : null;
        const set = this._ariaSets.get(parentKey);
        return set ?? [node];
    }
    /**
     * Finds the parent for the given node. If this is a root node, this
     * returns null. If we're unable to determine the parent, for example,
     * if we don't have cached node data, this returns undefined.
     */
    _findParentForNode(node, index, cachedNodes) {
        // In all cases, we have a mapping from node to level; all we need to do here is backtrack in
        // our flattened list of nodes to determine the first node that's of a level lower than the
        // provided node.
        if (!cachedNodes.length) {
            return null;
        }
        const currentLevel = this._levels.get(this._getExpansionKey(node)) ?? 0;
        for (let parentIndex = index - 1; parentIndex >= 0; parentIndex--) {
            const parentNode = cachedNodes[parentIndex];
            const parentLevel = this._levels.get(this._getExpansionKey(parentNode)) ?? 0;
            if (parentLevel < currentLevel) {
                return parentNode;
            }
        }
        return null;
    }
    /**
     * Given a set of root nodes and the current node level, flattens any nested
     * nodes into a single array.
     *
     * If any nodes are not expanded, then their children will not be added into the array.
     * This will still traverse all nested children in order to build up our internal data
     * models, but will not include them in the returned array.
     */
    _flattenNestedNodesWithExpansion(nodes, level = 0) {
        const childrenAccessor = this._getChildrenAccessor();
        // If we're using a level accessor, we don't need to flatten anything.
        if (!childrenAccessor) {
            return observableOf([...nodes]);
        }
        return observableOf(...nodes).pipe(concatMap(node => {
            const parentKey = this._getExpansionKey(node);
            if (!this._parents.has(parentKey)) {
                this._parents.set(parentKey, null);
            }
            this._levels.set(parentKey, level);
            const children = coerceObservable(childrenAccessor(node));
            return concat(observableOf([node]), children.pipe(take(1), tap(childNodes => {
                this._ariaSets.set(parentKey, [...(childNodes ?? [])]);
                for (const child of childNodes ?? []) {
                    const childKey = this._getExpansionKey(child);
                    this._parents.set(childKey, node);
                    this._levels.set(childKey, level + 1);
                }
            }), switchMap(childNodes => {
                if (!childNodes) {
                    return observableOf([]);
                }
                return this._flattenNestedNodesWithExpansion(childNodes, level + 1).pipe(map(nestedNodes => (this.isExpanded(node) ? nestedNodes : [])));
            })));
        }), reduce((results, children) => {
            results.push(...children);
            return results;
        }, []));
    }
    /**
     * Converts children for certain tree configurations.
     *
     * This also computes parent, level, and group data.
     */
    _computeRenderingData(nodes, nodeType) {
        // The only situations where we have to convert children types is when
        // they're mismatched; i.e. if the tree is using a childrenAccessor and the
        // nodes are flat, or if the tree is using a levelAccessor and the nodes are
        // nested.
        if (this.childrenAccessor && nodeType === 'flat') {
            // This flattens children into a single array.
            this._ariaSets.set(null, [...nodes]);
            return this._flattenNestedNodesWithExpansion(nodes).pipe(map(flattenedNodes => ({
                renderNodes: flattenedNodes,
                flattenedNodes,
            })));
        }
        else if (this.levelAccessor && nodeType === 'nested') {
            // In the nested case, we only look for root nodes. The CdkNestedNode
            // itself will handle rendering each individual node's children.
            const levelAccessor = this.levelAccessor;
            return observableOf(nodes.filter(node => levelAccessor(node) === 0)).pipe(map(rootNodes => ({
                renderNodes: rootNodes,
                flattenedNodes: nodes,
            })), tap(({ flattenedNodes }) => {
                this._calculateParents(flattenedNodes);
            }));
        }
        else if (nodeType === 'flat') {
            // In the case of a TreeControl, we know that the node type matches up
            // with the TreeControl, and so no conversions are necessary. Otherwise,
            // we've already confirmed that the data model matches up with the
            // desired node type here.
            return observableOf({ renderNodes: nodes, flattenedNodes: nodes }).pipe(tap(({ flattenedNodes }) => {
                this._calculateParents(flattenedNodes);
            }));
        }
        else {
            // For nested nodes, we still need to perform the node flattening in order
            // to maintain our caches for various tree operations.
            this._ariaSets.set(null, [...nodes]);
            return this._flattenNestedNodesWithExpansion(nodes).pipe(map(flattenedNodes => ({
                renderNodes: nodes,
                flattenedNodes,
            })));
        }
    }
    _updateCachedData(flattenedNodes) {
        this._flattenedNodes.next(flattenedNodes);
    }
    _updateKeyManagerItems(flattenedNodes) {
        this._keyManagerNodes.next(flattenedNodes);
    }
    /** Traverse the flattened node data and compute parents, levels, and group data. */
    _calculateParents(flattenedNodes) {
        const levelAccessor = this._getLevelAccessor();
        if (!levelAccessor) {
            return;
        }
        this._parents.clear();
        this._ariaSets.clear();
        for (let index = 0; index < flattenedNodes.length; index++) {
            const dataNode = flattenedNodes[index];
            const key = this._getExpansionKey(dataNode);
            this._levels.set(key, levelAccessor(dataNode));
            const parent = this._findParentForNode(dataNode, index, flattenedNodes);
            this._parents.set(key, parent);
            const parentKey = parent ? this._getExpansionKey(parent) : null;
            const group = this._ariaSets.get(parentKey) ?? [];
            group.splice(index, 0, dataNode);
            this._ariaSets.set(parentKey, group);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTree, deps: [{ token: i0.IterableDiffers }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0-next.2", type: CdkTree, isStandalone: true, selector: "cdk-tree", inputs: { dataSource: "dataSource", treeControl: "treeControl", levelAccessor: "levelAccessor", childrenAccessor: "childrenAccessor", trackBy: "trackBy", expansionKey: "expansionKey" }, host: { attributes: { "role": "tree" }, listeners: { "keydown": "_sendKeydownToKeyManager($event)" }, classAttribute: "cdk-tree" }, queries: [{ propertyName: "_nodeDefs", predicate: CdkTreeNodeDef, descendants: true }], viewQueries: [{ propertyName: "_nodeOutlet", first: true, predicate: CdkTreeNodeOutlet, descendants: true, static: true }], exportAs: ["cdkTree"], ngImport: i0, template: `<ng-container cdkTreeNodeOutlet></ng-container>`, isInline: true, dependencies: [{ kind: "directive", type: CdkTreeNodeOutlet, selector: "[cdkTreeNodeOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTree, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-tree',
                    exportAs: 'cdkTree',
                    template: `<ng-container cdkTreeNodeOutlet></ng-container>`,
                    host: {
                        'class': 'cdk-tree',
                        'role': 'tree',
                        '(keydown)': '_sendKeydownToKeyManager($event)',
                    },
                    encapsulation: ViewEncapsulation.None,
                    // The "OnPush" status for the `CdkTree` component is effectively a noop, so we are removing it.
                    // The view for `CdkTree` consists entirely of templates declared in other views. As they are
                    // declared elsewhere, they are checked when their declaration points are checked.
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: ChangeDetectionStrategy.Default,
                    standalone: true,
                    imports: [CdkTreeNodeOutlet],
                }]
        }], ctorParameters: () => [{ type: i0.IterableDiffers }, { type: i0.ChangeDetectorRef }], propDecorators: { dataSource: [{
                type: Input
            }], treeControl: [{
                type: Input
            }], levelAccessor: [{
                type: Input
            }], childrenAccessor: [{
                type: Input
            }], trackBy: [{
                type: Input
            }], expansionKey: [{
                type: Input
            }], _nodeOutlet: [{
                type: ViewChild,
                args: [CdkTreeNodeOutlet, { static: true }]
            }], _nodeDefs: [{
                type: ContentChildren,
                args: [CdkTreeNodeDef, {
                        // We need to use `descendants: true`, because Ivy will no longer match
                        // indirect descendants if it's left as false.
                        descendants: true,
                    }]
            }] } });
/**
 * Tree node for CdkTree. It contains the data in the tree node.
 */
export class CdkTreeNode {
    /**
     * The role of the tree node.
     *
     * @deprecated This will be ignored; the tree will automatically determine the appropriate role
     * for tree node. This input will be removed in a future version.
     * @breaking-change 21.0.0
     */
    get role() {
        return 'treeitem';
    }
    set role(_role) {
        // ignore any role setting, we handle this internally.
    }
    /**
     * Whether or not this node is expandable.
     *
     * If not using `FlatTreeControl`, or if `isExpandable` is not provided to
     * `NestedTreeControl`, this should be provided for correct node a11y.
     */
    get isExpandable() {
        return this._isExpandable();
    }
    set isExpandable(isExpandable) {
        this._inputIsExpandable = isExpandable;
        if ((this.data && !this._isExpandable) || !this._inputIsExpandable) {
            return;
        }
        // If the node is being set to expandable, ensure that the status of the
        // node is propagated
        if (this._inputIsExpanded) {
            this.expand();
        }
        else if (this._inputIsExpanded === false) {
            this.collapse();
        }
    }
    get isExpanded() {
        return this._tree.isExpanded(this._data);
    }
    set isExpanded(isExpanded) {
        this._inputIsExpanded = isExpanded;
        if (isExpanded) {
            this.expand();
        }
        else {
            this.collapse();
        }
    }
    getLabel() {
        return this.typeaheadLabel || this._elementRef.nativeElement.textContent?.trim() || '';
    }
    /**
     * The most recently created `CdkTreeNode`. We save it in static variable so we can retrieve it
     * in `CdkTree` and set the data to it.
     */
    static { this.mostRecentTreeNode = null; }
    /** The tree node's data. */
    get data() {
        return this._data;
    }
    set data(value) {
        if (value !== this._data) {
            this._data = value;
            this._dataChanges.next();
        }
    }
    /* If leaf node, return true to not assign aria-expanded attribute */
    get isLeafNode() {
        // If flat tree node data returns false for expandable property, it's a leaf node
        if (this._tree.treeControl?.isExpandable !== undefined &&
            !this._tree.treeControl.isExpandable(this._data)) {
            return true;
            // If nested tree node data returns 0 descendants, it's a leaf node
        }
        else if (this._tree.treeControl?.isExpandable === undefined &&
            this._tree.treeControl?.getDescendants(this._data).length === 0) {
            return true;
        }
        return false;
    }
    get level() {
        // If the tree has a levelAccessor, use it to get the level. Otherwise read the
        // aria-level off the parent node and use it as the level for this node (note aria-level is
        // 1-indexed, while this property is 0-indexed, so we don't need to increment).
        return this._tree._getLevel(this._data) ?? this._parentNodeAriaLevel;
    }
    /** Determines if the tree node is expandable. */
    _isExpandable() {
        if (this._tree.treeControl) {
            if (this.isLeafNode) {
                return false;
            }
            // For compatibility with trees created using TreeControl before we added
            // CdkTreeNode#isExpandable.
            return true;
        }
        return this._inputIsExpandable;
    }
    /**
     * Determines the value for `aria-expanded`.
     *
     * For non-expandable nodes, this is `null`.
     */
    _getAriaExpanded() {
        if (!this._isExpandable()) {
            return null;
        }
        return String(this.isExpanded);
    }
    /**
     * Determines the size of this node's parent's child set.
     *
     * This is intended to be used for `aria-setsize`.
     */
    _getSetSize() {
        return this._tree._getSetSize(this._data);
    }
    /**
     * Determines the index (starting from 1) of this node in its parent's child set.
     *
     * This is intended to be used for `aria-posinset`.
     */
    _getPositionInSet() {
        return this._tree._getPositionInSet(this._data);
    }
    constructor(_elementRef, _tree) {
        this._elementRef = _elementRef;
        this._tree = _tree;
        this._tabindex = -1;
        /** This emits when the node has been programatically activated or activated by keyboard. */
        this.activation = new EventEmitter();
        /** This emits when the node's expansion status has been changed. */
        this.expandedChange = new EventEmitter();
        /** Subject that emits when the component has been destroyed. */
        this._destroyed = new Subject();
        /** Emits when the node's data has changed. */
        this._dataChanges = new Subject();
        this._inputIsExpandable = false;
        this._inputIsExpanded = undefined;
        /**
         * Flag used to determine whether or not we should be focusing the actual element based on
         * some user interaction (click or focus). On click, we don't forcibly focus the element
         * since the click could trigger some other component that wants to grab its own focus
         * (e.g. menu, dialog).
         */
        this._shouldFocus = true;
        this._changeDetectorRef = inject(ChangeDetectorRef);
        CdkTreeNode.mostRecentTreeNode = this;
    }
    ngOnInit() {
        this._parentNodeAriaLevel = getParentNodeAriaLevel(this._elementRef.nativeElement);
        this._tree
            ._getExpansionModel()
            .changed.pipe(map(() => this.isExpanded), distinctUntilChanged())
            .subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });
        this._tree._setNodeTypeIfUnset('flat');
        this._tree._registerNode(this);
    }
    ngOnDestroy() {
        // If this is the last tree node being destroyed,
        // clear out the reference to avoid leaking memory.
        if (CdkTreeNode.mostRecentTreeNode === this) {
            CdkTreeNode.mostRecentTreeNode = null;
        }
        this._dataChanges.complete();
        this._destroyed.next();
        this._destroyed.complete();
    }
    getParent() {
        return this._tree._getNodeParent(this) ?? null;
    }
    getChildren() {
        return this._tree._getNodeChildren(this);
    }
    /** Focuses this data node. Implemented for TreeKeyManagerItem. */
    focus() {
        this._tabindex = 0;
        if (this._shouldFocus) {
            this._elementRef.nativeElement.focus();
        }
        this._changeDetectorRef.markForCheck();
    }
    /** Defocus this data node. */
    unfocus() {
        this._tabindex = -1;
        this._changeDetectorRef.markForCheck();
    }
    /** Emits an activation event. Implemented for TreeKeyManagerItem. */
    activate() {
        if (this.isDisabled) {
            return;
        }
        this.activation.next(this._data);
    }
    /** Collapses this data node. Implemented for TreeKeyManagerItem. */
    collapse() {
        if (this.isExpandable) {
            this._tree.collapse(this._data);
        }
    }
    /** Expands this data node. Implemented for TreeKeyManagerItem. */
    expand() {
        if (this.isExpandable) {
            this._tree.expand(this._data);
        }
    }
    /** Makes the node focusable. Implemented for TreeKeyManagerItem. */
    makeFocusable() {
        this._tabindex = 0;
        this._changeDetectorRef.markForCheck();
    }
    _focusItem() {
        if (this.isDisabled) {
            return;
        }
        this._tree._keyManager.focusItem(this);
    }
    _setActiveItem() {
        if (this.isDisabled) {
            return;
        }
        this._shouldFocus = false;
        this._tree._keyManager.focusItem(this);
        this._shouldFocus = true;
    }
    _emitExpansionState(expanded) {
        this.expandedChange.emit(expanded);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeNode, deps: [{ token: i0.ElementRef }, { token: CdkTree }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.0-next.2", type: CdkTreeNode, isStandalone: true, selector: "cdk-tree-node", inputs: { role: "role", isExpandable: ["isExpandable", "isExpandable", booleanAttribute], isExpanded: "isExpanded", isDisabled: ["isDisabled", "isDisabled", booleanAttribute], typeaheadLabel: ["cdkTreeNodeTypeaheadLabel", "typeaheadLabel"] }, outputs: { activation: "activation", expandedChange: "expandedChange" }, host: { attributes: { "role": "treeitem" }, listeners: { "click": "_setActiveItem()", "focus": "_focusItem()" }, properties: { "attr.aria-expanded": "_getAriaExpanded()", "attr.aria-level": "level + 1", "attr.aria-posinset": "_getPositionInSet()", "attr.aria-setsize": "_getSetSize()", "tabindex": "_tabindex" }, classAttribute: "cdk-tree-node" }, exportAs: ["cdkTreeNode"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkTreeNode, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-tree-node',
                    exportAs: 'cdkTreeNode',
                    host: {
                        'class': 'cdk-tree-node',
                        '[attr.aria-expanded]': '_getAriaExpanded()',
                        '[attr.aria-level]': 'level + 1',
                        '[attr.aria-posinset]': '_getPositionInSet()',
                        '[attr.aria-setsize]': '_getSetSize()',
                        '[tabindex]': '_tabindex',
                        'role': 'treeitem',
                        '(click)': '_setActiveItem()',
                        '(focus)': '_focusItem()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: CdkTree }], propDecorators: { role: [{
                type: Input
            }], isExpandable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isExpanded: [{
                type: Input
            }], isDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], typeaheadLabel: [{
                type: Input,
                args: ['cdkTreeNodeTypeaheadLabel']
            }], activation: [{
                type: Output
            }], expandedChange: [{
                type: Output
            }] } });
function getParentNodeAriaLevel(nodeElement) {
    let parent = nodeElement.parentElement;
    while (parent && !isNodeElement(parent)) {
        parent = parent.parentElement;
    }
    if (!parent) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw Error('Incorrect tree structure containing detached node.');
        }
        else {
            return -1;
        }
    }
    else if (parent.classList.contains('cdk-nested-tree-node')) {
        return numberAttribute(parent.getAttribute('aria-level'));
    }
    else {
        // The ancestor element is the cdk-tree itself
        return 0;
    }
}
function isNodeElement(element) {
    const classList = element.classList;
    return !!(classList?.contains('cdk-nested-tree-node') || classList?.contains('cdk-tree'));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS90cmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxnQkFBZ0IsR0FLakIsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUdMLFlBQVksRUFFWixjQUFjLEdBQ2YsTUFBTSwwQkFBMEIsQ0FBQztBQUNsQyxPQUFPLEVBSUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUVaLEtBQUssRUFHTCxlQUFlLEVBR2YsTUFBTSxFQUNOLFNBQVMsRUFFVCxTQUFTLEVBRVQsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixNQUFNLEVBQ04sZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLE1BQU0sRUFDTixLQUFLLEVBRUwsT0FBTyxFQUVQLFlBQVksRUFDWixFQUFFLElBQUksWUFBWSxHQUNuQixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFDTCxvQkFBb0IsRUFDcEIsU0FBUyxFQUNULEdBQUcsRUFDSCxNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxJQUFJLEVBQ0osU0FBUyxFQUNULEdBQUcsR0FDSixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBQyxjQUFjLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDaEUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzNDLE9BQU8sRUFDTCw0QkFBNEIsRUFDNUIsMEJBQTBCLEVBQzFC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QWpELEtBQUs7dUJBQUMsMkJBQTJCO2dCQVF6QixVQUFVO3NCQURsQixNQUFNO2dCQUtFLGNBQWM7c0JBRHRCLE1BQU07O0FBMk5ULFNBQVMsc0JBQXNCLENBQUMsV0FBd0I7SUFDdEQsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQztJQUN2QyxPQUFPLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ2hDLENBQUM7SUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNsRCxNQUFNLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUM7SUFDSCxDQUFDO1NBQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUM7UUFDN0QsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUM7U0FBTSxDQUFDO1FBQ04sOENBQThDO1FBQzlDLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxPQUFvQjtJQUN6QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUM1RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBUUkVFX0tFWV9NQU5BR0VSLFxuICBUcmVlS2V5TWFuYWdlckZhY3RvcnksXG4gIFRyZWVLZXlNYW5hZ2VySXRlbSxcbiAgVHJlZUtleU1hbmFnZXJPcHRpb25zLFxuICBUcmVlS2V5TWFuYWdlclN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1xuICBDb2xsZWN0aW9uVmlld2VyLFxuICBEYXRhU291cmNlLFxuICBpc0RhdGFTb3VyY2UsXG4gIFNlbGVjdGlvbkNoYW5nZSxcbiAgU2VsZWN0aW9uTW9kZWwsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRDaGVja2VkLFxuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBJbnB1dCxcbiAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXG4gIEl0ZXJhYmxlRGlmZmVyLFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgVHJhY2tCeUZ1bmN0aW9uLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBudW1iZXJBdHRyaWJ1dGUsXG4gIGluamVjdCxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvZXJjZU9ic2VydmFibGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbi9wcml2YXRlJztcbmltcG9ydCB7XG4gIEJlaGF2aW9yU3ViamVjdCxcbiAgY29tYmluZUxhdGVzdCxcbiAgY29uY2F0LFxuICBFTVBUWSxcbiAgT2JzZXJ2YWJsZSxcbiAgU3ViamVjdCxcbiAgU3Vic2NyaXB0aW9uLFxuICBpc09ic2VydmFibGUsXG4gIG9mIGFzIG9ic2VydmFibGVPZixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBkaXN0aW5jdFVudGlsQ2hhbmdlZCxcbiAgY29uY2F0TWFwLFxuICBtYXAsXG4gIHJlZHVjZSxcbiAgc3RhcnRXaXRoLFxuICBzd2l0Y2hNYXAsXG4gIHRha2UsXG4gIHRha2VVbnRpbCxcbiAgdGFwLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1RyZWVDb250cm9sfSBmcm9tICcuL2NvbnRyb2wvdHJlZS1jb250cm9sJztcbmltcG9ydCB7Q2RrVHJlZU5vZGVEZWYsIENka1RyZWVOb2RlT3V0bGV0Q29udGV4dH0gZnJvbSAnLi9ub2RlJztcbmltcG9ydCB7Q2RrVHJlZU5vZGVPdXRsZXR9IGZyb20gJy4vb3V0bGV0JztcbmltcG9ydCB7XG4gIGdldE11bHRpcGxlVHJlZUNvbnRyb2xzRXJyb3IsXG4gIGdldFRyZWVDb250cm9sTWlzc2luZ0Vycm9yLFxuICBnZXRUcmVlTWlzc2luZ01hdGNoaW5nTm9kZURlZkVycm9yLFxuICBnZXRUcmVlTXVsdGlwbGVEZWZhdWx0Tm9kZURlZnNFcnJvcixcbiAgZ2V0VHJlZU5vVmFsaWREYXRhU291cmNlRXJyb3IsXG59IGZyb20gJy4vdHJlZS1lcnJvcnMnO1xuXG50eXBlIFJlbmRlcmluZ0RhdGE8VD4gPVxuICB8IHtcbiAgICAgIGZsYXR0ZW5lZE5vZGVzOiBudWxsO1xuICAgICAgbm9kZVR5cGU6IG51bGw7XG4gICAgICByZW5kZXJOb2RlczogcmVhZG9ubHkgVFtdO1xuICAgIH1cbiAgfCB7XG4gICAgICBmbGF0dGVuZWROb2RlczogcmVhZG9ubHkgVFtdO1xuICAgICAgbm9kZVR5cGU6ICduZXN0ZWQnIHwgJ2ZsYXQnO1xuICAgICAgcmVuZGVyTm9kZXM6IHJlYWRvbmx5IFRbXTtcbiAgICB9O1xuXG4vKipcbiAqIENESyB0cmVlIGNvbXBvbmVudCB0aGF0IGNvbm5lY3RzIHdpdGggYSBkYXRhIHNvdXJjZSB0byByZXRyaWV2ZSBkYXRhIG9mIHR5cGUgYFRgIGFuZCByZW5kZXJzXG4gKiBkYXRhTm9kZXMgd2l0aCBoaWVyYXJjaHkuIFVwZGF0ZXMgdGhlIGRhdGFOb2RlcyB3aGVuIG5ldyBkYXRhIGlzIHByb3ZpZGVkIGJ5IHRoZSBkYXRhIHNvdXJjZS5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLXRyZWUnLFxuICBleHBvcnRBczogJ2Nka1RyZWUnLFxuICB0ZW1wbGF0ZTogYDxuZy1jb250YWluZXIgY2RrVHJlZU5vZGVPdXRsZXQ+PC9uZy1jb250YWluZXI+YCxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstdHJlZScsXG4gICAgJ3JvbGUnOiAndHJlZScsXG4gICAgJyhrZXlkb3duKSc6ICdfc2VuZEtleWRvd25Ub0tleU1hbmFnZXIoJGV2ZW50KScsXG4gIH0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIC8vIFRoZSBcIk9uUHVzaFwiIHN0YXR1cyBmb3IgdGhlIGBDZGtUcmVlYCBjb21wb25lbnQgaXMgZWZmZWN0aXZlbHkgYSBub29wLCBzbyB3ZSBhcmUgcmVtb3ZpbmcgaXQuXG4gIC8vIFRoZSB2aWV3IGZvciBgQ2RrVHJlZWAgY29uc2lzdHMgZW50aXJlbHkgb2YgdGVtcGxhdGVzIGRlY2xhcmVkIGluIG90aGVyIHZpZXdzLiBBcyB0aGV5IGFyZVxuICAvLyBkZWNsYXJlZCBlbHNld2hlcmUsIHRoZXkgYXJlIGNoZWNrZWQgd2hlbiB0aGVpciBkZWNsYXJhdGlvbiBwb2ludHMgYXJlIGNoZWNrZWQuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0Nka1RyZWVOb2RlT3V0bGV0XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVHJlZTxULCBLID0gVD5cbiAgaW1wbGVtZW50c1xuICAgIEFmdGVyQ29udGVudENoZWNrZWQsXG4gICAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbGxlY3Rpb25WaWV3ZXIsXG4gICAgT25EZXN0cm95LFxuICAgIE9uSW5pdFxue1xuICBwcml2YXRlIF9lbGVtZW50UmVmID0gaW5qZWN0KEVsZW1lbnRSZWYpO1xuICBwcml2YXRlIF9kaXIgPSBpbmplY3QoRGlyZWN0aW9uYWxpdHkpO1xuXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfb25EZXN0cm95ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogRGlmZmVyIHVzZWQgdG8gZmluZCB0aGUgY2hhbmdlcyBpbiB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX2RhdGFEaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+O1xuXG4gIC8qKiBTdG9yZXMgdGhlIG5vZGUgZGVmaW5pdGlvbiB0aGF0IGRvZXMgbm90IGhhdmUgYSB3aGVuIHByZWRpY2F0ZS4gKi9cbiAgcHJpdmF0ZSBfZGVmYXVsdE5vZGVEZWY6IENka1RyZWVOb2RlRGVmPFQ+IHwgbnVsbDtcblxuICAvKiogRGF0YSBzdWJzY3JpcHRpb24gKi9cbiAgcHJpdmF0ZSBfZGF0YVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbDtcblxuICAvKiogTGV2ZWwgb2Ygbm9kZXMgKi9cbiAgcHJpdmF0ZSBfbGV2ZWxzOiBNYXA8SywgbnVtYmVyPiA9IG5ldyBNYXA8SywgbnVtYmVyPigpO1xuXG4gIC8qKiBUaGUgaW1tZWRpYXRlIHBhcmVudHMgZm9yIGEgbm9kZS4gVGhpcyBpcyBgbnVsbGAgaWYgdGhlcmUgaXMgbm8gcGFyZW50LiAqL1xuICBwcml2YXRlIF9wYXJlbnRzOiBNYXA8SywgVCB8IG51bGw+ID0gbmV3IE1hcDxLLCBUIHwgbnVsbD4oKTtcblxuICAvKipcbiAgICogTm9kZXMgZ3JvdXBlZCBpbnRvIGVhY2ggc2V0LCB3aGljaCBpcyBhIGxpc3Qgb2Ygbm9kZXMgZGlzcGxheWVkIHRvZ2V0aGVyIGluIHRoZSBET00uXG4gICAqXG4gICAqIExvb2t1cCBrZXkgaXMgdGhlIHBhcmVudCBvZiBhIHNldC4gUm9vdCBub2RlcyBoYXZlIGtleSBvZiBudWxsLlxuICAgKlxuICAgKiBWYWx1ZXMgaXMgYSAnc2V0JyBvZiB0cmVlIG5vZGVzLiBFYWNoIHRyZWUgbm9kZSBtYXBzIHRvIGEgdHJlZWl0ZW0gZWxlbWVudC4gU2V0cyBhcmUgaW4gdGhlXG4gICAqIG9yZGVyIHRoYXQgaXQgaXMgcmVuZGVyZWQuIEVhY2ggc2V0IG1hcHMgZGlyZWN0bHkgdG8gYXJpYS1wb3NpbnNldCBhbmQgYXJpYS1zZXRzaXplIGF0dHJpYnV0ZXMuXG4gICAqL1xuICBwcml2YXRlIF9hcmlhU2V0czogTWFwPEsgfCBudWxsLCBUW10+ID0gbmV3IE1hcDxLIHwgbnVsbCwgVFtdPigpO1xuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIHN0cmVhbSBjb250YWluaW5nIHRoZSBsYXRlc3QgZGF0YSBhcnJheSB0byByZW5kZXIuIEluZmx1ZW5jZWQgYnkgdGhlIHRyZWUnc1xuICAgKiBzdHJlYW0gb2YgdmlldyB3aW5kb3cgKHdoYXQgZGF0YU5vZGVzIGFyZSBjdXJyZW50bHkgb24gc2NyZWVuKS5cbiAgICogRGF0YSBzb3VyY2UgY2FuIGJlIGFuIG9ic2VydmFibGUgb2YgZGF0YSBhcnJheSwgb3IgYSBkYXRhIGFycmF5IHRvIHJlbmRlci5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBkYXRhU291cmNlKCk6IERhdGFTb3VyY2U8VD4gfCBPYnNlcnZhYmxlPFRbXT4gfCBUW10ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xuICB9XG4gIHNldCBkYXRhU291cmNlKGRhdGFTb3VyY2U6IERhdGFTb3VyY2U8VD4gfCBPYnNlcnZhYmxlPFRbXT4gfCBUW10pIHtcbiAgICBpZiAodGhpcy5fZGF0YVNvdXJjZSAhPT0gZGF0YVNvdXJjZSkge1xuICAgICAgdGhpcy5fc3dpdGNoRGF0YVNvdXJjZShkYXRhU291cmNlKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGF0YVNvdXJjZTogRGF0YVNvdXJjZTxUPiB8IE9ic2VydmFibGU8VFtdPiB8IFRbXTtcblxuICAvKipcbiAgICogVGhlIHRyZWUgY29udHJvbGxlclxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBVc2Ugb25lIG9mIGBsZXZlbEFjY2Vzc29yYCBvciBgY2hpbGRyZW5BY2Nlc3NvcmAgaW5zdGVhZC4gVG8gYmUgcmVtb3ZlZCBpbiBhXG4gICAqIGZ1dHVyZSB2ZXJzaW9uLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMFxuICAgKi9cbiAgQElucHV0KCkgdHJlZUNvbnRyb2w/OiBUcmVlQ29udHJvbDxULCBLPjtcblxuICAvKipcbiAgICogR2l2ZW4gYSBkYXRhIG5vZGUsIGRldGVybWluZXMgd2hhdCB0cmVlIGxldmVsIHRoZSBub2RlIGlzIGF0LlxuICAgKlxuICAgKiBPbmUgb2YgbGV2ZWxBY2Nlc3NvciBvciBjaGlsZHJlbkFjY2Vzc29yIG11c3QgYmUgc3BlY2lmaWVkLCBub3QgYm90aC5cbiAgICogVGhpcyBpcyBlbmZvcmNlZCBhdCBydW4tdGltZS5cbiAgICovXG4gIEBJbnB1dCgpIGxldmVsQWNjZXNzb3I/OiAoZGF0YU5vZGU6IFQpID0+IG51bWJlcjtcblxuICAvKipcbiAgICogR2l2ZW4gYSBkYXRhIG5vZGUsIGRldGVybWluZXMgd2hhdCB0aGUgY2hpbGRyZW4gb2YgdGhhdCBub2RlIGFyZS5cbiAgICpcbiAgICogT25lIG9mIGxldmVsQWNjZXNzb3Igb3IgY2hpbGRyZW5BY2Nlc3NvciBtdXN0IGJlIHNwZWNpZmllZCwgbm90IGJvdGguXG4gICAqIFRoaXMgaXMgZW5mb3JjZWQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBASW5wdXQoKSBjaGlsZHJlbkFjY2Vzc29yPzogKGRhdGFOb2RlOiBUKSA9PiBUW10gfCBPYnNlcnZhYmxlPFRbXT47XG5cbiAgLyoqXG4gICAqIFRyYWNraW5nIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGNoZWNrIHRoZSBkaWZmZXJlbmNlcyBpbiBkYXRhIGNoYW5nZXMuIFVzZWQgc2ltaWxhcmx5XG4gICAqIHRvIGBuZ0ZvcmAgYHRyYWNrQnlgIGZ1bmN0aW9uLiBPcHRpbWl6ZSBub2RlIG9wZXJhdGlvbnMgYnkgaWRlbnRpZnlpbmcgYSBub2RlIGJhc2VkIG9uIGl0cyBkYXRhXG4gICAqIHJlbGF0aXZlIHRvIHRoZSBmdW5jdGlvbiB0byBrbm93IGlmIGEgbm9kZSBzaG91bGQgYmUgYWRkZWQvcmVtb3ZlZC9tb3ZlZC5cbiAgICogQWNjZXB0cyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdHdvIHBhcmFtZXRlcnMsIGBpbmRleGAgYW5kIGBpdGVtYC5cbiAgICovXG4gIEBJbnB1dCgpIHRyYWNrQnk6IFRyYWNrQnlGdW5jdGlvbjxUPjtcblxuICAvKipcbiAgICogR2l2ZW4gYSBkYXRhIG5vZGUsIGRldGVybWluZXMgdGhlIGtleSBieSB3aGljaCB3ZSBkZXRlcm1pbmUgd2hldGhlciBvciBub3QgdGhpcyBub2RlIGlzIGV4cGFuZGVkLlxuICAgKi9cbiAgQElucHV0KCkgZXhwYW5zaW9uS2V5PzogKGRhdGFOb2RlOiBUKSA9PiBLO1xuXG4gIC8vIE91dGxldHMgd2l0aGluIHRoZSB0cmVlJ3MgdGVtcGxhdGUgd2hlcmUgdGhlIGRhdGFOb2RlcyB3aWxsIGJlIGluc2VydGVkLlxuICBAVmlld0NoaWxkKENka1RyZWVOb2RlT3V0bGV0LCB7c3RhdGljOiB0cnVlfSkgX25vZGVPdXRsZXQ6IENka1RyZWVOb2RlT3V0bGV0O1xuXG4gIC8qKiBUaGUgdHJlZSBub2RlIHRlbXBsYXRlIGZvciB0aGUgdHJlZSAqL1xuICBAQ29udGVudENoaWxkcmVuKENka1RyZWVOb2RlRGVmLCB7XG4gICAgLy8gV2UgbmVlZCB0byB1c2UgYGRlc2NlbmRhbnRzOiB0cnVlYCwgYmVjYXVzZSBJdnkgd2lsbCBubyBsb25nZXIgbWF0Y2hcbiAgICAvLyBpbmRpcmVjdCBkZXNjZW5kYW50cyBpZiBpdCdzIGxlZnQgYXMgZmFsc2UuXG4gICAgZGVzY2VuZGFudHM6IHRydWUsXG4gIH0pXG4gIF9ub2RlRGVmczogUXVlcnlMaXN0PENka1RyZWVOb2RlRGVmPFQ+PjtcblxuICAvLyBUT0RPKHRpbmF5dWFuZ2FvKTogU2V0dXAgYSBsaXN0ZW5lciBmb3Igc2Nyb2xsaW5nLCBlbWl0IHRoZSBjYWxjdWxhdGVkIHZpZXcgdG8gdmlld0NoYW5nZS5cbiAgLy8gICAgIFJlbW92ZSB0aGUgTUFYX1ZBTFVFIGluIHZpZXdDaGFuZ2VcbiAgLyoqXG4gICAqIFN0cmVhbSBjb250YWluaW5nIHRoZSBsYXRlc3QgaW5mb3JtYXRpb24gb24gd2hhdCByb3dzIGFyZSBiZWluZyBkaXNwbGF5ZWQgb24gc2NyZWVuLlxuICAgKiBDYW4gYmUgdXNlZCBieSB0aGUgZGF0YSBzb3VyY2UgdG8gYXMgYSBoZXVyaXN0aWMgb2Ygd2hhdCBkYXRhIHNob3VsZCBiZSBwcm92aWRlZC5cbiAgICovXG4gIHJlYWRvbmx5IHZpZXdDaGFuZ2UgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PHtzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlcn0+KHtcbiAgICBzdGFydDogMCxcbiAgICBlbmQ6IE51bWJlci5NQVhfVkFMVUUsXG4gIH0pO1xuXG4gIC8qKiBLZWVwIHRyYWNrIG9mIHdoaWNoIG5vZGVzIGFyZSBleHBhbmRlZC4gKi9cbiAgcHJpdmF0ZSBfZXhwYW5zaW9uTW9kZWw/OiBTZWxlY3Rpb25Nb2RlbDxLPjtcblxuICAvKipcbiAgICogTWFpbnRhaW4gYSBzeW5jaHJvbm91cyBjYWNoZSBvZiBmbGF0dGVuZWQgZGF0YSBub2Rlcy4gVGhpcyB3aWxsIG9ubHkgYmVcbiAgICogcG9wdWxhdGVkIGFmdGVyIGluaXRpYWwgcmVuZGVyLCBhbmQgaW4gY2VydGFpbiBjYXNlcywgd2lsbCBiZSBkZWxheWVkIGR1ZSB0b1xuICAgKiByZWx5aW5nIG9uIE9ic2VydmFibGUgYGdldENoaWxkcmVuYCBjYWxscy5cbiAgICovXG4gIHByaXZhdGUgX2ZsYXR0ZW5lZE5vZGVzOiBCZWhhdmlvclN1YmplY3Q8cmVhZG9ubHkgVFtdPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8cmVhZG9ubHkgVFtdPihbXSk7XG5cbiAgLyoqIFRoZSBhdXRvbWF0aWNhbGx5IGRldGVybWluZWQgbm9kZSB0eXBlIGZvciB0aGUgdHJlZS4gKi9cbiAgcHJpdmF0ZSBfbm9kZVR5cGU6IEJlaGF2aW9yU3ViamVjdDwnZmxhdCcgfCAnbmVzdGVkJyB8IG51bGw+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxcbiAgICAnZmxhdCcgfCAnbmVzdGVkJyB8IG51bGxcbiAgPihudWxsKTtcblxuICAvKiogVGhlIG1hcHBpbmcgYmV0d2VlbiBkYXRhIGFuZCB0aGUgbm9kZSB0aGF0IGlzIHJlbmRlcmVkLiAqL1xuICBwcml2YXRlIF9ub2RlczogQmVoYXZpb3JTdWJqZWN0PE1hcDxLLCBDZGtUcmVlTm9kZTxULCBLPj4+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChcbiAgICBuZXcgTWFwPEssIENka1RyZWVOb2RlPFQsIEs+PigpLFxuICApO1xuXG4gIC8qKlxuICAgKiBTeW5jaHJvbm91cyBjYWNoZSBvZiBub2RlcyBmb3IgdGhlIGBUcmVlS2V5TWFuYWdlcmAuIFRoaXMgaXMgc2VwYXJhdGVcbiAgICogZnJvbSBgX2ZsYXR0ZW5lZE5vZGVzYCBzbyB0aGV5IGNhbiBiZSBpbmRlcGVuZGVudGx5IHVwZGF0ZWQgYXQgZGlmZmVyZW50XG4gICAqIHRpbWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlck5vZGVzOiBCZWhhdmlvclN1YmplY3Q8cmVhZG9ubHkgVFtdPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8cmVhZG9ubHkgVFtdPihbXSk7XG5cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlckZhY3RvcnkgPSBpbmplY3QoVFJFRV9LRVlfTUFOQUdFUikgYXMgVHJlZUtleU1hbmFnZXJGYWN0b3J5PENka1RyZWVOb2RlPFQsIEs+PjtcblxuICAvKiogVGhlIGtleSBtYW5hZ2VyIGZvciB0aGlzIHRyZWUuIEhhbmRsZXMgZm9jdXMgYW5kIGFjdGl2YXRpb24gYmFzZWQgb24gdXNlciBrZXlib2FyZCBpbnB1dC4gKi9cbiAgX2tleU1hbmFnZXI6IFRyZWVLZXlNYW5hZ2VyU3RyYXRlZ3k8Q2RrVHJlZU5vZGU8VCwgSz4+O1xuICBwcml2YXRlIF92aWV3SW5pdCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICkge31cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZUtleU1hbmFnZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICB0aGlzLl91cGRhdGVEZWZhdWx0Tm9kZURlZmluaXRpb24oKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb0RhdGFDaGFuZ2VzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9ub2RlT3V0bGV0LnZpZXdDb250YWluZXIuY2xlYXIoKTtcblxuICAgIHRoaXMudmlld0NoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5fZGF0YVNvdXJjZSAmJiB0eXBlb2YgKHRoaXMuX2RhdGFTb3VyY2UgYXMgRGF0YVNvdXJjZTxUPikuZGlzY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgKHRoaXMuZGF0YVNvdXJjZSBhcyBEYXRhU291cmNlPFQ+KS5kaXNjb25uZWN0KHRoaXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9kYXRhU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9kYXRhU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl9kYXRhU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBJbiBjZXJ0YWluIHRlc3RzLCB0aGUgdHJlZSBtaWdodCBiZSBkZXN0cm95ZWQgYmVmb3JlIHRoaXMgaXMgaW5pdGlhbGl6ZWRcbiAgICAvLyBpbiBgbmdBZnRlckNvbnRlbnRJbml0YC5cbiAgICB0aGlzLl9rZXlNYW5hZ2VyPy5kZXN0cm95KCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9jaGVja1RyZWVDb250cm9sVXNhZ2UoKTtcbiAgICB0aGlzLl9pbml0aWFsaXplRGF0YURpZmZlcigpO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX3ZpZXdJbml0ID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZURlZmF1bHROb2RlRGVmaW5pdGlvbigpIHtcbiAgICBjb25zdCBkZWZhdWx0Tm9kZURlZnMgPSB0aGlzLl9ub2RlRGVmcy5maWx0ZXIoZGVmID0+ICFkZWYud2hlbik7XG4gICAgaWYgKGRlZmF1bHROb2RlRGVmcy5sZW5ndGggPiAxICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBnZXRUcmVlTXVsdGlwbGVEZWZhdWx0Tm9kZURlZnNFcnJvcigpO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Tm9kZURlZiA9IGRlZmF1bHROb2RlRGVmc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBub2RlIHR5cGUgZm9yIHRoZSB0cmVlLCBpZiBpdCBoYXNuJ3QgYmVlbiBzZXQgeWV0LlxuICAgKlxuICAgKiBUaGlzIHdpbGwgYmUgY2FsbGVkIGJ5IHRoZSBmaXJzdCBub2RlIHRoYXQncyByZW5kZXJlZCBpbiBvcmRlciBmb3IgdGhlIHRyZWVcbiAgICogdG8gZGV0ZXJtaW5lIHdoYXQgZGF0YSB0cmFuc2Zvcm1hdGlvbnMgYXJlIHJlcXVpcmVkLlxuICAgKi9cbiAgX3NldE5vZGVUeXBlSWZVbnNldChub2RlVHlwZTogJ2ZsYXQnIHwgJ25lc3RlZCcpIHtcbiAgICBpZiAodGhpcy5fbm9kZVR5cGUudmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX25vZGVUeXBlLm5leHQobm9kZVR5cGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTd2l0Y2ggdG8gdGhlIHByb3ZpZGVkIGRhdGEgc291cmNlIGJ5IHJlc2V0dGluZyB0aGUgZGF0YSBhbmQgdW5zdWJzY3JpYmluZyBmcm9tIHRoZSBjdXJyZW50XG4gICAqIHJlbmRlciBjaGFuZ2Ugc3Vic2NyaXB0aW9uIGlmIG9uZSBleGlzdHMuIElmIHRoZSBkYXRhIHNvdXJjZSBpcyBudWxsLCBpbnRlcnByZXQgdGhpcyBieVxuICAgKiBjbGVhcmluZyB0aGUgbm9kZSBvdXRsZXQuIE90aGVyd2lzZSBzdGFydCBsaXN0ZW5pbmcgZm9yIG5ldyBkYXRhLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3dpdGNoRGF0YVNvdXJjZShkYXRhU291cmNlOiBEYXRhU291cmNlPFQ+IHwgT2JzZXJ2YWJsZTxUW10+IHwgVFtdKSB7XG4gICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UgJiYgdHlwZW9mICh0aGlzLl9kYXRhU291cmNlIGFzIERhdGFTb3VyY2U8VD4pLmRpc2Nvbm5lY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICh0aGlzLmRhdGFTb3VyY2UgYXMgRGF0YVNvdXJjZTxUPikuZGlzY29ubmVjdCh0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGF0YVN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fZGF0YVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5fZGF0YVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBhbGwgZGF0YU5vZGVzIGlmIHRoZXJlIGlzIG5vdyBubyBkYXRhIHNvdXJjZVxuICAgIGlmICghZGF0YVNvdXJjZSkge1xuICAgICAgdGhpcy5fbm9kZU91dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gICAgaWYgKHRoaXMuX25vZGVEZWZzKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb0RhdGFDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgX2dldEV4cGFuc2lvbk1vZGVsKCkge1xuICAgIGlmICghdGhpcy50cmVlQ29udHJvbCkge1xuICAgICAgdGhpcy5fZXhwYW5zaW9uTW9kZWwgPz89IG5ldyBTZWxlY3Rpb25Nb2RlbDxLPih0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHBhbnNpb25Nb2RlbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJlZUNvbnRyb2wuZXhwYW5zaW9uTW9kZWw7XG4gIH1cblxuICAvKiogU2V0IHVwIGEgc3Vic2NyaXB0aW9uIGZvciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvRGF0YUNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX2RhdGFTdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZGF0YVN0cmVhbTogT2JzZXJ2YWJsZTxyZWFkb25seSBUW10+IHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKGlzRGF0YVNvdXJjZSh0aGlzLl9kYXRhU291cmNlKSkge1xuICAgICAgZGF0YVN0cmVhbSA9IHRoaXMuX2RhdGFTb3VyY2UuY29ubmVjdCh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZSh0aGlzLl9kYXRhU291cmNlKSkge1xuICAgICAgZGF0YVN0cmVhbSA9IHRoaXMuX2RhdGFTb3VyY2U7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICBkYXRhU3RyZWFtID0gb2JzZXJ2YWJsZU9mKHRoaXMuX2RhdGFTb3VyY2UpO1xuICAgIH1cblxuICAgIGlmICghZGF0YVN0cmVhbSkge1xuICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICB0aHJvdyBnZXRUcmVlTm9WYWxpZERhdGFTb3VyY2VFcnJvcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2RhdGFTdWJzY3JpcHRpb24gPSB0aGlzLl9nZXRSZW5kZXJEYXRhKGRhdGFTdHJlYW0pXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcbiAgICAgIC5zdWJzY3JpYmUocmVuZGVyaW5nRGF0YSA9PiB7XG4gICAgICAgIHRoaXMuX3JlbmRlckRhdGFDaGFuZ2VzKHJlbmRlcmluZ0RhdGEpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKiogR2l2ZW4gYW4gT2JzZXJ2YWJsZSBjb250YWluaW5nIGEgc3RyZWFtIG9mIHRoZSByYXcgZGF0YSwgcmV0dXJucyBhbiBPYnNlcnZhYmxlIGNvbnRhaW5pbmcgdGhlIFJlbmRlcmluZ0RhdGEgKi9cbiAgcHJpdmF0ZSBfZ2V0UmVuZGVyRGF0YShkYXRhU3RyZWFtOiBPYnNlcnZhYmxlPHJlYWRvbmx5IFRbXT4pOiBPYnNlcnZhYmxlPFJlbmRlcmluZ0RhdGE8VD4+IHtcbiAgICBjb25zdCBleHBhbnNpb25Nb2RlbCA9IHRoaXMuX2dldEV4cGFuc2lvbk1vZGVsKCk7XG4gICAgcmV0dXJuIGNvbWJpbmVMYXRlc3QoW1xuICAgICAgZGF0YVN0cmVhbSxcbiAgICAgIHRoaXMuX25vZGVUeXBlLFxuICAgICAgLy8gV2UgZG9uJ3QgdXNlIHRoZSBleHBhbnNpb24gZGF0YSBkaXJlY3RseSwgaG93ZXZlciB3ZSBhZGQgaXQgaGVyZSB0byBlc3NlbnRpYWxseVxuICAgICAgLy8gdHJpZ2dlciBkYXRhIHJlbmRlcmluZyB3aGVuIGV4cGFuc2lvbiBjaGFuZ2VzIG9jY3VyLlxuICAgICAgZXhwYW5zaW9uTW9kZWwuY2hhbmdlZC5waXBlKFxuICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgIHRhcChleHBhbnNpb25DaGFuZ2VzID0+IHtcbiAgICAgICAgICB0aGlzLl9lbWl0RXhwYW5zaW9uQ2hhbmdlcyhleHBhbnNpb25DaGFuZ2VzKTtcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgIF0pLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKFtkYXRhLCBub2RlVHlwZV0pID0+IHtcbiAgICAgICAgaWYgKG5vZGVUeXBlID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG9ic2VydmFibGVPZih7cmVuZGVyTm9kZXM6IGRhdGEsIGZsYXR0ZW5lZE5vZGVzOiBudWxsLCBub2RlVHlwZX0gYXMgY29uc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UncmUgaGVyZSwgdGhlbiB3ZSBrbm93IHdoYXQgb3VyIG5vZGUgdHlwZSBpcywgYW5kIHRoZXJlZm9yZSBjYW5cbiAgICAgICAgLy8gcGVyZm9ybSBvdXIgdXN1YWwgcmVuZGVyaW5nIHBpcGVsaW5lLCB3aGljaCBuZWNlc3NpdGF0ZXMgY29udmVydGluZyB0aGUgZGF0YVxuICAgICAgICByZXR1cm4gdGhpcy5fY29tcHV0ZVJlbmRlcmluZ0RhdGEoZGF0YSwgbm9kZVR5cGUpLnBpcGUoXG4gICAgICAgICAgbWFwKGNvbnZlcnRlZERhdGEgPT4gKHsuLi5jb252ZXJ0ZWREYXRhLCBub2RlVHlwZX0pIGFzIGNvbnN0KSxcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9yZW5kZXJEYXRhQ2hhbmdlcyhkYXRhOiBSZW5kZXJpbmdEYXRhPFQ+KSB7XG4gICAgaWYgKGRhdGEubm9kZVR5cGUgPT09IG51bGwpIHtcbiAgICAgIHRoaXMucmVuZGVyTm9kZUNoYW5nZXMoZGF0YS5yZW5kZXJOb2Rlcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgd2UncmUgaGVyZSwgdGhlbiB3ZSBrbm93IHdoYXQgb3VyIG5vZGUgdHlwZSBpcywgYW5kIHRoZXJlZm9yZSBjYW5cbiAgICAvLyBwZXJmb3JtIG91ciB1c3VhbCByZW5kZXJpbmcgcGlwZWxpbmUuXG4gICAgdGhpcy5fdXBkYXRlQ2FjaGVkRGF0YShkYXRhLmZsYXR0ZW5lZE5vZGVzKTtcbiAgICB0aGlzLnJlbmRlck5vZGVDaGFuZ2VzKGRhdGEucmVuZGVyTm9kZXMpO1xuICAgIHRoaXMuX3VwZGF0ZUtleU1hbmFnZXJJdGVtcyhkYXRhLmZsYXR0ZW5lZE5vZGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXRFeHBhbnNpb25DaGFuZ2VzKGV4cGFuc2lvbkNoYW5nZXM6IFNlbGVjdGlvbkNoYW5nZTxLPiB8IG51bGwpIHtcbiAgICBpZiAoIWV4cGFuc2lvbkNoYW5nZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlcyA9IHRoaXMuX25vZGVzLnZhbHVlO1xuICAgIGZvciAoY29uc3QgYWRkZWQgb2YgZXhwYW5zaW9uQ2hhbmdlcy5hZGRlZCkge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzLmdldChhZGRlZCk7XG4gICAgICBub2RlPy5fZW1pdEV4cGFuc2lvblN0YXRlKHRydWUpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHJlbW92ZWQgb2YgZXhwYW5zaW9uQ2hhbmdlcy5yZW1vdmVkKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZXMuZ2V0KHJlbW92ZWQpO1xuICAgICAgbm9kZT8uX2VtaXRFeHBhbnNpb25TdGF0ZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZUtleU1hbmFnZXIoKSB7XG4gICAgY29uc3QgaXRlbXMgPSBjb21iaW5lTGF0ZXN0KFt0aGlzLl9rZXlNYW5hZ2VyTm9kZXMsIHRoaXMuX25vZGVzXSkucGlwZShcbiAgICAgIG1hcCgoW2tleU1hbmFnZXJOb2RlcywgcmVuZGVyTm9kZXNdKSA9PlxuICAgICAgICBrZXlNYW5hZ2VyTm9kZXMucmVkdWNlPENka1RyZWVOb2RlPFQsIEs+W10+KChpdGVtcywgZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSByZW5kZXJOb2Rlcy5nZXQodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KGRhdGEpKTtcbiAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgaXRlbXMucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LCBbXSksXG4gICAgICApLFxuICAgICk7XG5cbiAgICBjb25zdCBrZXlNYW5hZ2VyT3B0aW9uczogVHJlZUtleU1hbmFnZXJPcHRpb25zPENka1RyZWVOb2RlPFQsIEs+PiA9IHtcbiAgICAgIHRyYWNrQnk6IG5vZGUgPT4gdGhpcy5fZ2V0RXhwYW5zaW9uS2V5KG5vZGUuZGF0YSksXG4gICAgICBza2lwUHJlZGljYXRlOiBub2RlID0+ICEhbm9kZS5pc0Rpc2FibGVkLFxuICAgICAgdHlwZUFoZWFkRGVib3VuY2VJbnRlcnZhbDogdHJ1ZSxcbiAgICAgIGhvcml6b250YWxPcmllbnRhdGlvbjogdGhpcy5fZGlyLnZhbHVlLFxuICAgIH07XG5cbiAgICB0aGlzLl9rZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlckZhY3RvcnkoaXRlbXMsIGtleU1hbmFnZXJPcHRpb25zKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRpYWxpemVEYXRhRGlmZmVyKCkge1xuICAgIC8vIFByb3ZpZGUgYSBkZWZhdWx0IHRyYWNrQnkgYmFzZWQgb24gYF9nZXRFeHBhbnNpb25LZXlgIGlmIG9uZSBpc24ndCBwcm92aWRlZC5cbiAgICBjb25zdCB0cmFja0J5ID0gdGhpcy50cmFja0J5ID8/ICgoX2luZGV4OiBudW1iZXIsIGl0ZW06IFQpID0+IHRoaXMuX2dldEV4cGFuc2lvbktleShpdGVtKSk7XG4gICAgdGhpcy5fZGF0YURpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZChbXSkuY3JlYXRlKHRyYWNrQnkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tUcmVlQ29udHJvbFVzYWdlKCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIC8vIFZlcmlmeSB0aGF0IFRyZWUgZm9sbG93cyBBUEkgY29udHJhY3Qgb2YgdXNpbmcgb25lIG9mIFRyZWVDb250cm9sLCBsZXZlbEFjY2Vzc29yIG9yXG4gICAgICAvLyBjaGlsZHJlbkFjY2Vzc29yLiBUaHJvdyBhbiBhcHByb3ByaWF0ZSBlcnJvciBpZiBjb250cmFjdCBpcyBub3QgbWV0LlxuICAgICAgbGV0IG51bVRyZWVDb250cm9scyA9IDA7XG5cbiAgICAgIGlmICh0aGlzLnRyZWVDb250cm9sKSB7XG4gICAgICAgIG51bVRyZWVDb250cm9scysrO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGV2ZWxBY2Nlc3Nvcikge1xuICAgICAgICBudW1UcmVlQ29udHJvbHMrKztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuQWNjZXNzb3IpIHtcbiAgICAgICAgbnVtVHJlZUNvbnRyb2xzKys7XG4gICAgICB9XG5cbiAgICAgIGlmICghbnVtVHJlZUNvbnRyb2xzKSB7XG4gICAgICAgIHRocm93IGdldFRyZWVDb250cm9sTWlzc2luZ0Vycm9yKCk7XG4gICAgICB9IGVsc2UgaWYgKG51bVRyZWVDb250cm9scyA+IDEpIHtcbiAgICAgICAgdGhyb3cgZ2V0TXVsdGlwbGVUcmVlQ29udHJvbHNFcnJvcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVjayBmb3IgY2hhbmdlcyBtYWRlIGluIHRoZSBkYXRhIGFuZCByZW5kZXIgZWFjaCBjaGFuZ2UgKG5vZGUgYWRkZWQvcmVtb3ZlZC9tb3ZlZCkuICovXG4gIHJlbmRlck5vZGVDaGFuZ2VzKFxuICAgIGRhdGE6IHJlYWRvbmx5IFRbXSxcbiAgICBkYXRhRGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPiA9IHRoaXMuX2RhdGFEaWZmZXIsXG4gICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiA9IHRoaXMuX25vZGVPdXRsZXQudmlld0NvbnRhaW5lcixcbiAgICBwYXJlbnREYXRhPzogVCxcbiAgKSB7XG4gICAgY29uc3QgY2hhbmdlcyA9IGRhdGFEaWZmZXIuZGlmZihkYXRhKTtcblxuICAgIC8vIFNvbWUgdHJlZSBjb25zdW1lcnMgZXhwZWN0IGNoYW5nZSBkZXRlY3Rpb24gdG8gcHJvcGFnYXRlIHRvIG5vZGVzXG4gICAgLy8gZXZlbiB3aGVuIHRoZSBhcnJheSBpdHNlbGYgaGFzbid0IGNoYW5nZWQ7IHdlIGV4cGxpY2l0bHkgZGV0ZWN0IGNoYW5nZXNcbiAgICAvLyBhbnl3YXlzIGluIG9yZGVyIGZvciBub2RlcyB0byB1cGRhdGUgdGhlaXIgZGF0YS5cbiAgICAvL1xuICAgIC8vIEhvd2V2ZXIsIGlmIGNoYW5nZSBkZXRlY3Rpb24gaXMgY2FsbGVkIHdoaWxlIHRoZSBjb21wb25lbnQncyB2aWV3IGlzXG4gICAgLy8gc3RpbGwgaW5pdGluZywgdGhlbiB0aGUgb3JkZXIgb2YgY2hpbGQgdmlld3MgaW5pdGluZyB3aWxsIGJlIGluY29ycmVjdDtcbiAgICAvLyB0byBwcmV2ZW50IHRoaXMsIHdlIG9ubHkgZXhpdCBlYXJseSBpZiB0aGUgdmlldyBoYXNuJ3QgaW5pdGlhbGl6ZWQgeWV0LlxuICAgIGlmICghY2hhbmdlcyAmJiAhdGhpcy5fdmlld0luaXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjaGFuZ2VzPy5mb3JFYWNoT3BlcmF0aW9uKFxuICAgICAgKFxuICAgICAgICBpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxUPixcbiAgICAgICAgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXIgfCBudWxsLFxuICAgICAgICBjdXJyZW50SW5kZXg6IG51bWJlciB8IG51bGwsXG4gICAgICApID0+IHtcbiAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5pbnNlcnROb2RlKGRhdGFbY3VycmVudEluZGV4IV0sIGN1cnJlbnRJbmRleCEsIHZpZXdDb250YWluZXIsIHBhcmVudERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgdmlld0NvbnRhaW5lci5yZW1vdmUoYWRqdXN0ZWRQcmV2aW91c0luZGV4ISk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdmlldyA9IHZpZXdDb250YWluZXIuZ2V0KGFkanVzdGVkUHJldmlvdXNJbmRleCEpO1xuICAgICAgICAgIHZpZXdDb250YWluZXIubW92ZSh2aWV3ISwgY3VycmVudEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuXG4gICAgLy8gSWYgdGhlIGRhdGEgaXRzZWxmIGNoYW5nZXMsIGJ1dCBrZWVwcyB0aGUgc2FtZSB0cmFja0J5LCB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgdGVtcGxhdGVzJ1xuICAgIC8vIGNvbnRleHQgdG8gcmVmbGVjdCB0aGUgbmV3IG9iamVjdC5cbiAgICBjaGFuZ2VzPy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8VD4pID0+IHtcbiAgICAgIGNvbnN0IG5ld0RhdGEgPSByZWNvcmQuaXRlbTtcbiAgICAgIGlmIChyZWNvcmQuY3VycmVudEluZGV4ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB2aWV3ID0gdmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxhbnk+KS5jb250ZXh0LiRpbXBsaWNpdCA9IG5ld0RhdGE7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlOiB3ZSBvbmx5IGBkZXRlY3RDaGFuZ2VzYCBmcm9tIGEgdG9wLWxldmVsIGNhbGwsIG90aGVyd2lzZSB3ZSByaXNrIG92ZXJmbG93aW5nXG4gICAgLy8gdGhlIGNhbGwgc3RhY2sgc2luY2UgdGhpcyBtZXRob2QgaXMgY2FsbGVkIHJlY3Vyc2l2ZWx5IChzZWUgIzI5NzMzLilcbiAgICAvLyBUT0RPOiBjaGFuZ2UgdG8gYHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpYCxcbiAgICAvLyBvciBqdXN0IHN3aXRjaCB0aGlzIGNvbXBvbmVudCB0byB1c2Ugc2lnbmFscy5cbiAgICBpZiAocGFyZW50RGF0YSkge1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIG1hdGNoaW5nIG5vZGUgZGVmaW5pdGlvbiB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGlzIG5vZGUgZGF0YS4gSWYgdGhlcmUgaXMgb25seVxuICAgKiBvbmUgbm9kZSBkZWZpbml0aW9uLCBpdCBpcyByZXR1cm5lZC4gT3RoZXJ3aXNlLCBmaW5kIHRoZSBub2RlIGRlZmluaXRpb24gdGhhdCBoYXMgYSB3aGVuXG4gICAqIHByZWRpY2F0ZSB0aGF0IHJldHVybnMgdHJ1ZSB3aXRoIHRoZSBkYXRhLiBJZiBub25lIHJldHVybiB0cnVlLCByZXR1cm4gdGhlIGRlZmF1bHQgbm9kZVxuICAgKiBkZWZpbml0aW9uLlxuICAgKi9cbiAgX2dldE5vZGVEZWYoZGF0YTogVCwgaTogbnVtYmVyKTogQ2RrVHJlZU5vZGVEZWY8VD4ge1xuICAgIGlmICh0aGlzLl9ub2RlRGVmcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ub2RlRGVmcy5maXJzdCE7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZURlZiA9XG4gICAgICB0aGlzLl9ub2RlRGVmcy5maW5kKGRlZiA9PiBkZWYud2hlbiAmJiBkZWYud2hlbihpLCBkYXRhKSkgfHwgdGhpcy5fZGVmYXVsdE5vZGVEZWY7XG5cbiAgICBpZiAoIW5vZGVEZWYgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGdldFRyZWVNaXNzaW5nTWF0Y2hpbmdOb2RlRGVmRXJyb3IoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZURlZiE7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHRoZSBlbWJlZGRlZCB2aWV3IGZvciB0aGUgZGF0YSBub2RlIHRlbXBsYXRlIGFuZCBwbGFjZSBpdCBpbiB0aGUgY29ycmVjdCBpbmRleCBsb2NhdGlvblxuICAgKiB3aXRoaW4gdGhlIGRhdGEgbm9kZSB2aWV3IGNvbnRhaW5lci5cbiAgICovXG4gIGluc2VydE5vZGUobm9kZURhdGE6IFQsIGluZGV4OiBudW1iZXIsIHZpZXdDb250YWluZXI/OiBWaWV3Q29udGFpbmVyUmVmLCBwYXJlbnREYXRhPzogVCkge1xuICAgIGNvbnN0IGxldmVsQWNjZXNzb3IgPSB0aGlzLl9nZXRMZXZlbEFjY2Vzc29yKCk7XG5cbiAgICBjb25zdCBub2RlID0gdGhpcy5fZ2V0Tm9kZURlZihub2RlRGF0YSwgaW5kZXgpO1xuICAgIGNvbnN0IGtleSA9IHRoaXMuX2dldEV4cGFuc2lvbktleShub2RlRGF0YSk7XG5cbiAgICAvLyBOb2RlIGNvbnRleHQgdGhhdCB3aWxsIGJlIHByb3ZpZGVkIHRvIGNyZWF0ZWQgZW1iZWRkZWQgdmlld1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQ2RrVHJlZU5vZGVPdXRsZXRDb250ZXh0PFQ+KG5vZGVEYXRhKTtcblxuICAgIHBhcmVudERhdGEgPz89IHRoaXMuX3BhcmVudHMuZ2V0KGtleSkgPz8gdW5kZWZpbmVkO1xuICAgIC8vIElmIHRoZSB0cmVlIGlzIGZsYXQgdHJlZSwgdGhlbiB1c2UgdGhlIGBnZXRMZXZlbGAgZnVuY3Rpb24gaW4gZmxhdCB0cmVlIGNvbnRyb2xcbiAgICAvLyBPdGhlcndpc2UsIHVzZSB0aGUgbGV2ZWwgb2YgcGFyZW50IG5vZGUuXG4gICAgaWYgKGxldmVsQWNjZXNzb3IpIHtcbiAgICAgIGNvbnRleHQubGV2ZWwgPSBsZXZlbEFjY2Vzc29yKG5vZGVEYXRhKTtcbiAgICB9IGVsc2UgaWYgKHBhcmVudERhdGEgIT09IHVuZGVmaW5lZCAmJiB0aGlzLl9sZXZlbHMuaGFzKHRoaXMuX2dldEV4cGFuc2lvbktleShwYXJlbnREYXRhKSkpIHtcbiAgICAgIGNvbnRleHQubGV2ZWwgPSB0aGlzLl9sZXZlbHMuZ2V0KHRoaXMuX2dldEV4cGFuc2lvbktleShwYXJlbnREYXRhKSkhICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dC5sZXZlbCA9IDA7XG4gICAgfVxuICAgIHRoaXMuX2xldmVscy5zZXQoa2V5LCBjb250ZXh0LmxldmVsKTtcblxuICAgIC8vIFVzZSBkZWZhdWx0IHRyZWUgbm9kZU91dGxldCwgb3IgbmVzdGVkIG5vZGUncyBub2RlT3V0bGV0XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld0NvbnRhaW5lciA/IHZpZXdDb250YWluZXIgOiB0aGlzLl9ub2RlT3V0bGV0LnZpZXdDb250YWluZXI7XG4gICAgY29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhub2RlLnRlbXBsYXRlLCBjb250ZXh0LCBpbmRleCk7XG5cbiAgICAvLyBTZXQgdGhlIGRhdGEgdG8ganVzdCBjcmVhdGVkIGBDZGtUcmVlTm9kZWAuXG4gICAgLy8gVGhlIGBDZGtUcmVlTm9kZWAgY3JlYXRlZCBmcm9tIGBjcmVhdGVFbWJlZGRlZFZpZXdgIHdpbGwgYmUgc2F2ZWQgaW4gc3RhdGljIHZhcmlhYmxlXG4gICAgLy8gICAgIGBtb3N0UmVjZW50VHJlZU5vZGVgLiBXZSBnZXQgaXQgZnJvbSBzdGF0aWMgdmFyaWFibGUgYW5kIHBhc3MgdGhlIG5vZGUgZGF0YSB0byBpdC5cbiAgICBpZiAoQ2RrVHJlZU5vZGUubW9zdFJlY2VudFRyZWVOb2RlKSB7XG4gICAgICBDZGtUcmVlTm9kZS5tb3N0UmVjZW50VHJlZU5vZGUuZGF0YSA9IG5vZGVEYXRhO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRhIG5vZGUgaXMgZXhwYW5kZWQgb3IgY29sbGFwc2VkLiBSZXR1cm5zIHRydWUgaWYgaXQncyBleHBhbmRlZC4gKi9cbiAgaXNFeHBhbmRlZChkYXRhTm9kZTogVCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShcbiAgICAgIHRoaXMudHJlZUNvbnRyb2w/LmlzRXhwYW5kZWQoZGF0YU5vZGUpIHx8XG4gICAgICB0aGlzLl9leHBhbnNpb25Nb2RlbD8uaXNTZWxlY3RlZCh0aGlzLl9nZXRFeHBhbnNpb25LZXkoZGF0YU5vZGUpKVxuICAgICk7XG4gIH1cblxuICAvKiogSWYgdGhlIGRhdGEgbm9kZSBpcyBjdXJyZW50bHkgZXhwYW5kZWQsIGNvbGxhcHNlIGl0LiBPdGhlcndpc2UsIGV4cGFuZCBpdC4gKi9cbiAgdG9nZ2xlKGRhdGFOb2RlOiBUKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJlZUNvbnRyb2wpIHtcbiAgICAgIHRoaXMudHJlZUNvbnRyb2wudG9nZ2xlKGRhdGFOb2RlKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2V4cGFuc2lvbk1vZGVsKSB7XG4gICAgICB0aGlzLl9leHBhbnNpb25Nb2RlbC50b2dnbGUodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KGRhdGFOb2RlKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV4cGFuZCB0aGUgZGF0YSBub2RlLiBJZiBpdCBpcyBhbHJlYWR5IGV4cGFuZGVkLCBkb2VzIG5vdGhpbmcuICovXG4gIGV4cGFuZChkYXRhTm9kZTogVCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnRyZWVDb250cm9sKSB7XG4gICAgICB0aGlzLnRyZWVDb250cm9sLmV4cGFuZChkYXRhTm9kZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9leHBhbnNpb25Nb2RlbCkge1xuICAgICAgdGhpcy5fZXhwYW5zaW9uTW9kZWwuc2VsZWN0KHRoaXMuX2dldEV4cGFuc2lvbktleShkYXRhTm9kZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDb2xsYXBzZSB0aGUgZGF0YSBub2RlLiBJZiBpdCBpcyBhbHJlYWR5IGNvbGxhcHNlZCwgZG9lcyBub3RoaW5nLiAqL1xuICBjb2xsYXBzZShkYXRhTm9kZTogVCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnRyZWVDb250cm9sKSB7XG4gICAgICB0aGlzLnRyZWVDb250cm9sLmNvbGxhcHNlKGRhdGFOb2RlKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2V4cGFuc2lvbk1vZGVsKSB7XG4gICAgICB0aGlzLl9leHBhbnNpb25Nb2RlbC5kZXNlbGVjdCh0aGlzLl9nZXRFeHBhbnNpb25LZXkoZGF0YU5vZGUpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGRhdGEgbm9kZSBpcyBjdXJyZW50bHkgZXhwYW5kZWQsIGNvbGxhcHNlIGl0IGFuZCBhbGwgaXRzIGRlc2NlbmRhbnRzLlxuICAgKiBPdGhlcndpc2UsIGV4cGFuZCBpdCBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbiAgICovXG4gIHRvZ2dsZURlc2NlbmRhbnRzKGRhdGFOb2RlOiBUKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJlZUNvbnRyb2wpIHtcbiAgICAgIHRoaXMudHJlZUNvbnRyb2wudG9nZ2xlRGVzY2VuZGFudHMoZGF0YU5vZGUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZXhwYW5zaW9uTW9kZWwpIHtcbiAgICAgIGlmICh0aGlzLmlzRXhwYW5kZWQoZGF0YU5vZGUpKSB7XG4gICAgICAgIHRoaXMuY29sbGFwc2VEZXNjZW5kYW50cyhkYXRhTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmV4cGFuZERlc2NlbmRhbnRzKGRhdGFOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kIHRoZSBkYXRhIG5vZGUgYW5kIGFsbCBpdHMgZGVzY2VuZGFudHMuIElmIHRoZXkgYXJlIGFscmVhZHkgZXhwYW5kZWQsIGRvZXMgbm90aGluZy5cbiAgICovXG4gIGV4cGFuZERlc2NlbmRhbnRzKGRhdGFOb2RlOiBUKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJlZUNvbnRyb2wpIHtcbiAgICAgIHRoaXMudHJlZUNvbnRyb2wuZXhwYW5kRGVzY2VuZGFudHMoZGF0YU5vZGUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZXhwYW5zaW9uTW9kZWwpIHtcbiAgICAgIGNvbnN0IGV4cGFuc2lvbk1vZGVsID0gdGhpcy5fZXhwYW5zaW9uTW9kZWw7XG4gICAgICBleHBhbnNpb25Nb2RlbC5zZWxlY3QodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KGRhdGFOb2RlKSk7XG4gICAgICB0aGlzLl9nZXREZXNjZW5kYW50cyhkYXRhTm9kZSlcbiAgICAgICAgLnBpcGUodGFrZSgxKSwgdGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXG4gICAgICAgIC5zdWJzY3JpYmUoY2hpbGRyZW4gPT4ge1xuICAgICAgICAgIGV4cGFuc2lvbk1vZGVsLnNlbGVjdCguLi5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gdGhpcy5fZ2V0RXhwYW5zaW9uS2V5KGNoaWxkKSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogQ29sbGFwc2UgdGhlIGRhdGEgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy4gSWYgaXQgaXMgYWxyZWFkeSBjb2xsYXBzZWQsIGRvZXMgbm90aGluZy4gKi9cbiAgY29sbGFwc2VEZXNjZW5kYW50cyhkYXRhTm9kZTogVCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnRyZWVDb250cm9sKSB7XG4gICAgICB0aGlzLnRyZWVDb250cm9sLmNvbGxhcHNlRGVzY2VuZGFudHMoZGF0YU5vZGUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZXhwYW5zaW9uTW9kZWwpIHtcbiAgICAgIGNvbnN0IGV4cGFuc2lvbk1vZGVsID0gdGhpcy5fZXhwYW5zaW9uTW9kZWw7XG4gICAgICBleHBhbnNpb25Nb2RlbC5kZXNlbGVjdCh0aGlzLl9nZXRFeHBhbnNpb25LZXkoZGF0YU5vZGUpKTtcbiAgICAgIHRoaXMuX2dldERlc2NlbmRhbnRzKGRhdGFOb2RlKVxuICAgICAgICAucGlwZSh0YWtlKDEpLCB0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcbiAgICAgICAgLnN1YnNjcmliZShjaGlsZHJlbiA9PiB7XG4gICAgICAgICAgZXhwYW5zaW9uTW9kZWwuZGVzZWxlY3QoLi4uY2hpbGRyZW4ubWFwKGNoaWxkID0+IHRoaXMuX2dldEV4cGFuc2lvbktleShjaGlsZCkpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV4cGFuZHMgYWxsIGRhdGEgbm9kZXMgaW4gdGhlIHRyZWUuICovXG4gIGV4cGFuZEFsbCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50cmVlQ29udHJvbCkge1xuICAgICAgdGhpcy50cmVlQ29udHJvbC5leHBhbmRBbGwoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2V4cGFuc2lvbk1vZGVsKSB7XG4gICAgICBjb25zdCBleHBhbnNpb25Nb2RlbCA9IHRoaXMuX2V4cGFuc2lvbk1vZGVsO1xuICAgICAgZXhwYW5zaW9uTW9kZWwuc2VsZWN0KFxuICAgICAgICAuLi50aGlzLl9mbGF0dGVuZWROb2Rlcy52YWx1ZS5tYXAoY2hpbGQgPT4gdGhpcy5fZ2V0RXhwYW5zaW9uS2V5KGNoaWxkKSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDb2xsYXBzZSBhbGwgZGF0YSBub2RlcyBpbiB0aGUgdHJlZS4gKi9cbiAgY29sbGFwc2VBbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJlZUNvbnRyb2wpIHtcbiAgICAgIHRoaXMudHJlZUNvbnRyb2wuY29sbGFwc2VBbGwoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2V4cGFuc2lvbk1vZGVsKSB7XG4gICAgICBjb25zdCBleHBhbnNpb25Nb2RlbCA9IHRoaXMuX2V4cGFuc2lvbk1vZGVsO1xuICAgICAgZXhwYW5zaW9uTW9kZWwuZGVzZWxlY3QoXG4gICAgICAgIC4uLnRoaXMuX2ZsYXR0ZW5lZE5vZGVzLnZhbHVlLm1hcChjaGlsZCA9PiB0aGlzLl9nZXRFeHBhbnNpb25LZXkoY2hpbGQpKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqIExldmVsIGFjY2Vzc29yLCB1c2VkIGZvciBjb21wYXRpYmlsaXR5IGJldHdlZW4gdGhlIG9sZCBUcmVlIGFuZCBuZXcgVHJlZSAqL1xuICBfZ2V0TGV2ZWxBY2Nlc3NvcigpIHtcbiAgICByZXR1cm4gdGhpcy50cmVlQ29udHJvbD8uZ2V0TGV2ZWw/LmJpbmQodGhpcy50cmVlQ29udHJvbCkgPz8gdGhpcy5sZXZlbEFjY2Vzc29yO1xuICB9XG5cbiAgLyoqIENoaWxkcmVuIGFjY2Vzc29yLCB1c2VkIGZvciBjb21wYXRpYmlsaXR5IGJldHdlZW4gdGhlIG9sZCBUcmVlIGFuZCBuZXcgVHJlZSAqL1xuICBfZ2V0Q2hpbGRyZW5BY2Nlc3NvcigpIHtcbiAgICByZXR1cm4gdGhpcy50cmVlQ29udHJvbD8uZ2V0Q2hpbGRyZW4/LmJpbmQodGhpcy50cmVlQ29udHJvbCkgPz8gdGhpcy5jaGlsZHJlbkFjY2Vzc29yO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGRpcmVjdCBjaGlsZHJlbiBvZiBhIG5vZGU7IHVzZWQgZm9yIGNvbXBhdGliaWxpdHkgYmV0d2VlbiB0aGUgb2xkIHRyZWUgYW5kIHRoZVxuICAgKiBuZXcgdHJlZS5cbiAgICovXG4gIF9nZXREaXJlY3RDaGlsZHJlbihkYXRhTm9kZTogVCk6IE9ic2VydmFibGU8VFtdPiB7XG4gICAgY29uc3QgbGV2ZWxBY2Nlc3NvciA9IHRoaXMuX2dldExldmVsQWNjZXNzb3IoKTtcbiAgICBjb25zdCBleHBhbnNpb25Nb2RlbCA9IHRoaXMuX2V4cGFuc2lvbk1vZGVsID8/IHRoaXMudHJlZUNvbnRyb2w/LmV4cGFuc2lvbk1vZGVsO1xuICAgIGlmICghZXhwYW5zaW9uTW9kZWwpIHtcbiAgICAgIHJldHVybiBvYnNlcnZhYmxlT2YoW10pO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IHRoaXMuX2dldEV4cGFuc2lvbktleShkYXRhTm9kZSk7XG5cbiAgICBjb25zdCBpc0V4cGFuZGVkID0gZXhwYW5zaW9uTW9kZWwuY2hhbmdlZC5waXBlKFxuICAgICAgc3dpdGNoTWFwKGNoYW5nZXMgPT4ge1xuICAgICAgICBpZiAoY2hhbmdlcy5hZGRlZC5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgcmV0dXJuIG9ic2VydmFibGVPZih0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaGFuZ2VzLnJlbW92ZWQuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBvYnNlcnZhYmxlT2YoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBFTVBUWTtcbiAgICAgIH0pLFxuICAgICAgc3RhcnRXaXRoKHRoaXMuaXNFeHBhbmRlZChkYXRhTm9kZSkpLFxuICAgICk7XG5cbiAgICBpZiAobGV2ZWxBY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIGNvbWJpbmVMYXRlc3QoW2lzRXhwYW5kZWQsIHRoaXMuX2ZsYXR0ZW5lZE5vZGVzXSkucGlwZShcbiAgICAgICAgbWFwKChbZXhwYW5kZWQsIGZsYXR0ZW5lZE5vZGVzXSkgPT4ge1xuICAgICAgICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRDaGlsZHJlbkJ5TGV2ZWwoXG4gICAgICAgICAgICBsZXZlbEFjY2Vzc29yLFxuICAgICAgICAgICAgZmxhdHRlbmVkTm9kZXMsXG5cbiAgICAgICAgICAgIGRhdGFOb2RlLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICApO1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGNoaWxkcmVuQWNjZXNzb3IgPSB0aGlzLl9nZXRDaGlsZHJlbkFjY2Vzc29yKCk7XG4gICAgaWYgKGNoaWxkcmVuQWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiBjb2VyY2VPYnNlcnZhYmxlKGNoaWxkcmVuQWNjZXNzb3IoZGF0YU5vZGUpID8/IFtdKTtcbiAgICB9XG4gICAgdGhyb3cgZ2V0VHJlZUNvbnRyb2xNaXNzaW5nRXJyb3IoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0aGUgbGlzdCBvZiBmbGF0dGVuZWQgbm9kZXMsIHRoZSBsZXZlbCBhY2Nlc3NvciwgYW5kIHRoZSBsZXZlbCByYW5nZSB3aXRoaW5cbiAgICogd2hpY2ggdG8gY29uc2lkZXIgY2hpbGRyZW4sIGZpbmRzIHRoZSBjaGlsZHJlbiBmb3IgYSBnaXZlbiBub2RlLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgZm9yIGRpcmVjdCBjaGlsZHJlbiwgYGxldmVsRGVsdGFgIHdvdWxkIGJlIDEuIEZvciBhbGwgZGVzY2VuZGFudHMsXG4gICAqIGBsZXZlbERlbHRhYCB3b3VsZCBiZSBJbmZpbml0eS5cbiAgICovXG4gIHByaXZhdGUgX2ZpbmRDaGlsZHJlbkJ5TGV2ZWwoXG4gICAgbGV2ZWxBY2Nlc3NvcjogKG5vZGU6IFQpID0+IG51bWJlcixcbiAgICBmbGF0dGVuZWROb2RlczogcmVhZG9ubHkgVFtdLFxuICAgIGRhdGFOb2RlOiBULFxuICAgIGxldmVsRGVsdGE6IG51bWJlcixcbiAgKTogVFtdIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRFeHBhbnNpb25LZXkoZGF0YU5vZGUpO1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBmbGF0dGVuZWROb2Rlcy5maW5kSW5kZXgobm9kZSA9PiB0aGlzLl9nZXRFeHBhbnNpb25LZXkobm9kZSkgPT09IGtleSk7XG4gICAgY29uc3QgZGF0YU5vZGVMZXZlbCA9IGxldmVsQWNjZXNzb3IoZGF0YU5vZGUpO1xuICAgIGNvbnN0IGV4cGVjdGVkTGV2ZWwgPSBkYXRhTm9kZUxldmVsICsgbGV2ZWxEZWx0YTtcbiAgICBjb25zdCByZXN1bHRzOiBUW10gPSBbXTtcblxuICAgIC8vIEdvZXMgdGhyb3VnaCBmbGF0dGVuZWQgdHJlZSBub2RlcyBpbiB0aGUgYGZsYXR0ZW5lZE5vZGVzYCBhcnJheSwgYW5kIGdldCBhbGxcbiAgICAvLyBkZXNjZW5kYW50cyB3aXRoaW4gYSBjZXJ0YWluIGxldmVsIHJhbmdlLlxuICAgIC8vXG4gICAgLy8gSWYgd2UgcmVhY2ggYSBub2RlIHdob3NlIGxldmVsIGlzIGVxdWFsIHRvIG9yIGxlc3MgdGhhbiB0aGUgbGV2ZWwgb2YgdGhlIHRyZWUgbm9kZSxcbiAgICAvLyB3ZSBoaXQgYSBzaWJsaW5nIG9yIHBhcmVudCdzIHNpYmxpbmcsIGFuZCBzaG91bGQgc3RvcC5cbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleCArIDE7IGkgPCBmbGF0dGVuZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudExldmVsID0gbGV2ZWxBY2Nlc3NvcihmbGF0dGVuZWROb2Rlc1tpXSk7XG4gICAgICBpZiAoY3VycmVudExldmVsIDw9IGRhdGFOb2RlTGV2ZWwpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudExldmVsIDw9IGV4cGVjdGVkTGV2ZWwpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGZsYXR0ZW5lZE5vZGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgc3BlY2lmaWVkIG5vZGUgY29tcG9uZW50IHRvIHRoZSB0cmVlJ3MgaW50ZXJuYWwgcmVnaXN0cnkuXG4gICAqXG4gICAqIFRoaXMgcHJpbWFyaWx5IGZhY2lsaXRhdGVzIGtleWJvYXJkIG5hdmlnYXRpb24uXG4gICAqL1xuICBfcmVnaXN0ZXJOb2RlKG5vZGU6IENka1RyZWVOb2RlPFQsIEs+KSB7XG4gICAgdGhpcy5fbm9kZXMudmFsdWUuc2V0KHRoaXMuX2dldEV4cGFuc2lvbktleShub2RlLmRhdGEpLCBub2RlKTtcbiAgICB0aGlzLl9ub2Rlcy5uZXh0KHRoaXMuX25vZGVzLnZhbHVlKTtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgbm9kZSBjb21wb25lbnQgZnJvbSB0aGUgdHJlZSdzIGludGVybmFsIHJlZ2lzdHJ5LiAqL1xuICBfdW5yZWdpc3Rlck5vZGUobm9kZTogQ2RrVHJlZU5vZGU8VCwgSz4pIHtcbiAgICB0aGlzLl9ub2Rlcy52YWx1ZS5kZWxldGUodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KG5vZGUuZGF0YSkpO1xuICAgIHRoaXMuX25vZGVzLm5leHQodGhpcy5fbm9kZXMudmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciB0aGUgZ2l2ZW4gbm9kZSwgZGV0ZXJtaW5lIHRoZSBsZXZlbCB3aGVyZSB0aGlzIG5vZGUgYXBwZWFycyBpbiB0aGUgdHJlZS5cbiAgICpcbiAgICogVGhpcyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciBgYXJpYS1sZXZlbGAgYnV0IGlzIDAtaW5kZXhlZC5cbiAgICovXG4gIF9nZXRMZXZlbChub2RlOiBUKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xldmVscy5nZXQodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KG5vZGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIG5vZGUsIGRldGVybWluZSB0aGUgc2l6ZSBvZiB0aGUgcGFyZW50J3MgY2hpbGQgc2V0LlxuICAgKlxuICAgKiBUaGlzIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgZm9yIGBhcmlhLXNldHNpemVgLlxuICAgKi9cbiAgX2dldFNldFNpemUoZGF0YU5vZGU6IFQpIHtcbiAgICBjb25zdCBzZXQgPSB0aGlzLl9nZXRBcmlhU2V0KGRhdGFOb2RlKTtcbiAgICByZXR1cm4gc2V0Lmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIG5vZGUsIGRldGVybWluZSB0aGUgaW5kZXggKHN0YXJ0aW5nIGZyb20gMSkgb2YgdGhlIG5vZGUgaW4gaXRzIHBhcmVudCdzIGNoaWxkIHNldC5cbiAgICpcbiAgICogVGhpcyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciBgYXJpYS1wb3NpbnNldGAuXG4gICAqL1xuICBfZ2V0UG9zaXRpb25JblNldChkYXRhTm9kZTogVCkge1xuICAgIGNvbnN0IHNldCA9IHRoaXMuX2dldEFyaWFTZXQoZGF0YU5vZGUpO1xuICAgIGNvbnN0IGtleSA9IHRoaXMuX2dldEV4cGFuc2lvbktleShkYXRhTm9kZSk7XG4gICAgcmV0dXJuIHNldC5maW5kSW5kZXgobm9kZSA9PiB0aGlzLl9nZXRFeHBhbnNpb25LZXkobm9kZSkgPT09IGtleSkgKyAxO1xuICB9XG5cbiAgLyoqIEdpdmVuIGEgQ2RrVHJlZU5vZGUsIGdldHMgdGhlIG5vZGUgdGhhdCByZW5kZXJzIHRoYXQgbm9kZSdzIHBhcmVudCdzIGRhdGEuICovXG4gIF9nZXROb2RlUGFyZW50KG5vZGU6IENka1RyZWVOb2RlPFQsIEs+KSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50cy5nZXQodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KG5vZGUuZGF0YSkpO1xuICAgIHJldHVybiBwYXJlbnQgJiYgdGhpcy5fbm9kZXMudmFsdWUuZ2V0KHRoaXMuX2dldEV4cGFuc2lvbktleShwYXJlbnQpKTtcbiAgfVxuXG4gIC8qKiBHaXZlbiBhIENka1RyZWVOb2RlLCBnZXRzIHRoZSBub2RlcyB0aGF0IHJlbmRlcnMgdGhhdCBub2RlJ3MgY2hpbGQgZGF0YS4gKi9cbiAgX2dldE5vZGVDaGlsZHJlbihub2RlOiBDZGtUcmVlTm9kZTxULCBLPikge1xuICAgIHJldHVybiB0aGlzLl9nZXREaXJlY3RDaGlsZHJlbihub2RlLmRhdGEpLnBpcGUoXG4gICAgICBtYXAoY2hpbGRyZW4gPT5cbiAgICAgICAgY2hpbGRyZW4ucmVkdWNlPENka1RyZWVOb2RlPFQsIEs+W10+KChub2RlcywgY2hpbGQpID0+IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX25vZGVzLnZhbHVlLmdldCh0aGlzLl9nZXRFeHBhbnNpb25LZXkoY2hpbGQpKTtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIG5vZGVzLnB1c2godmFsdWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBub2RlcztcbiAgICAgICAgfSwgW10pLFxuICAgICAgKSxcbiAgICApO1xuICB9XG5cbiAgLyoqIGBrZXlkb3duYCBldmVudCBoYW5kbGVyOyB0aGlzIGp1c3QgcGFzc2VzIHRoZSBldmVudCB0byB0aGUgYFRyZWVLZXlNYW5hZ2VyYC4gKi9cbiAgcHJvdGVjdGVkIF9zZW5kS2V5ZG93blRvS2V5TWFuYWdlcihldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIC8vIE9ubHkgaGFuZGxlIGV2ZW50cyBkaXJlY3RseSBvbiB0aGUgdHJlZSBvciBkaXJlY3RseSBvbiBvbmUgb2YgdGhlIG5vZGVzLCBvdGhlcndpc2VcbiAgICAvLyB3ZSByaXNrIGludGVyZmVyaW5nIHdpdGggZXZlbnRzIGluIHRoZSBwcm9qZWN0ZWQgY29udGVudCAoc2VlICMyOTgyOCkuXG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9rZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fbm9kZXMuZ2V0VmFsdWUoKTtcbiAgICAgIGZvciAoY29uc3QgWywgbm9kZV0gb2Ygbm9kZXMpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbm9kZS5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5fa2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgYWxsIG5lc3RlZCBkZXNjZW5kYW50cyBvZiBhIGdpdmVuIG5vZGUuICovXG4gIHByaXZhdGUgX2dldERlc2NlbmRhbnRzKGRhdGFOb2RlOiBUKTogT2JzZXJ2YWJsZTxUW10+IHtcbiAgICBpZiAodGhpcy50cmVlQ29udHJvbCkge1xuICAgICAgcmV0dXJuIG9ic2VydmFibGVPZih0aGlzLnRyZWVDb250cm9sLmdldERlc2NlbmRhbnRzKGRhdGFOb2RlKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxldmVsQWNjZXNzb3IpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLl9maW5kQ2hpbGRyZW5CeUxldmVsKFxuICAgICAgICB0aGlzLmxldmVsQWNjZXNzb3IsXG4gICAgICAgIHRoaXMuX2ZsYXR0ZW5lZE5vZGVzLnZhbHVlLFxuICAgICAgICBkYXRhTm9kZSxcbiAgICAgICAgSW5maW5pdHksXG4gICAgICApO1xuICAgICAgcmV0dXJuIG9ic2VydmFibGVPZihyZXN1bHRzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hpbGRyZW5BY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEFsbENoaWxkcmVuUmVjdXJzaXZlbHkoZGF0YU5vZGUpLnBpcGUoXG4gICAgICAgIHJlZHVjZSgoYWxsQ2hpbGRyZW46IFRbXSwgbmV4dENoaWxkcmVuKSA9PiB7XG4gICAgICAgICAgYWxsQ2hpbGRyZW4ucHVzaCguLi5uZXh0Q2hpbGRyZW4pO1xuICAgICAgICAgIHJldHVybiBhbGxDaGlsZHJlbjtcbiAgICAgICAgfSwgW10pLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhyb3cgZ2V0VHJlZUNvbnRyb2xNaXNzaW5nRXJyb3IoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCBjaGlsZHJlbiBhbmQgc3ViLWNoaWxkcmVuIG9mIHRoZSBwcm92aWRlZCBub2RlLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgZW1pdCBtdWx0aXBsZSB0aW1lcywgaW4gdGhlIG9yZGVyIHRoYXQgdGhlIGNoaWxkcmVuIHdpbGwgYXBwZWFyXG4gICAqIGluIHRoZSB0cmVlLCBhbmQgY2FuIGJlIGNvbWJpbmVkIHdpdGggYSBgcmVkdWNlYCBvcGVyYXRvci5cbiAgICovXG4gIHByaXZhdGUgX2dldEFsbENoaWxkcmVuUmVjdXJzaXZlbHkoZGF0YU5vZGU6IFQpOiBPYnNlcnZhYmxlPFRbXT4ge1xuICAgIGlmICghdGhpcy5jaGlsZHJlbkFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29lcmNlT2JzZXJ2YWJsZSh0aGlzLmNoaWxkcmVuQWNjZXNzb3IoZGF0YU5vZGUpKS5waXBlKFxuICAgICAgdGFrZSgxKSxcbiAgICAgIHN3aXRjaE1hcChjaGlsZHJlbiA9PiB7XG4gICAgICAgIC8vIEhlcmUsIHdlIGNhY2hlIHRoZSBwYXJlbnRzIG9mIGEgcGFydGljdWxhciBjaGlsZCBzbyB0aGF0IHdlIGNhbiBjb21wdXRlIHRoZSBsZXZlbHMuXG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICB0aGlzLl9wYXJlbnRzLnNldCh0aGlzLl9nZXRFeHBhbnNpb25LZXkoY2hpbGQpLCBkYXRhTm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGVPZiguLi5jaGlsZHJlbikucGlwZShcbiAgICAgICAgICBjb25jYXRNYXAoY2hpbGQgPT4gY29uY2F0KG9ic2VydmFibGVPZihbY2hpbGRdKSwgdGhpcy5fZ2V0QWxsQ2hpbGRyZW5SZWN1cnNpdmVseShjaGlsZCkpKSxcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRFeHBhbnNpb25LZXkoZGF0YU5vZGU6IFQpOiBLIHtcbiAgICAvLyBJbiB0aGUgY2FzZSB0aGF0IGEga2V5IGFjY2Vzc29yIGZ1bmN0aW9uIHdhcyBub3QgcHJvdmlkZWQgYnkgdGhlXG4gICAgLy8gdHJlZSB1c2VyLCB3ZSdsbCBkZWZhdWx0IHRvIHVzaW5nIHRoZSBub2RlIG9iamVjdCBpdHNlbGYgYXMgdGhlIGtleS5cbiAgICAvL1xuICAgIC8vIFRoaXMgY2FzdCBpcyBzYWZlIHNpbmNlOlxuICAgIC8vIC0gaWYgYW4gZXhwYW5zaW9uS2V5IGlzIHByb3ZpZGVkLCBUUyB3aWxsIGluZmVyIHRoZSB0eXBlIG9mIEsgdG8gYmVcbiAgICAvLyAgIHRoZSByZXR1cm4gdHlwZS5cbiAgICAvLyAtIGlmIGl0J3Mgbm90LCB0aGVuIEsgd2lsbCBiZSBkZWZhdWx0ZWQgdG8gVC5cbiAgICByZXR1cm4gdGhpcy5leHBhbnNpb25LZXk/LihkYXRhTm9kZSkgPz8gKGRhdGFOb2RlIGFzIHVua25vd24gYXMgSyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBcmlhU2V0KG5vZGU6IFQpIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRFeHBhbnNpb25LZXkobm9kZSk7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50cy5nZXQoa2V5KTtcbiAgICBjb25zdCBwYXJlbnRLZXkgPSBwYXJlbnQgPyB0aGlzLl9nZXRFeHBhbnNpb25LZXkocGFyZW50KSA6IG51bGw7XG4gICAgY29uc3Qgc2V0ID0gdGhpcy5fYXJpYVNldHMuZ2V0KHBhcmVudEtleSk7XG4gICAgcmV0dXJuIHNldCA/PyBbbm9kZV07XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIHBhcmVudCBmb3IgdGhlIGdpdmVuIG5vZGUuIElmIHRoaXMgaXMgYSByb290IG5vZGUsIHRoaXNcbiAgICogcmV0dXJucyBudWxsLiBJZiB3ZSdyZSB1bmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBwYXJlbnQsIGZvciBleGFtcGxlLFxuICAgKiBpZiB3ZSBkb24ndCBoYXZlIGNhY2hlZCBub2RlIGRhdGEsIHRoaXMgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuICBwcml2YXRlIF9maW5kUGFyZW50Rm9yTm9kZShub2RlOiBULCBpbmRleDogbnVtYmVyLCBjYWNoZWROb2RlczogcmVhZG9ubHkgVFtdKTogVCB8IG51bGwge1xuICAgIC8vIEluIGFsbCBjYXNlcywgd2UgaGF2ZSBhIG1hcHBpbmcgZnJvbSBub2RlIHRvIGxldmVsOyBhbGwgd2UgbmVlZCB0byBkbyBoZXJlIGlzIGJhY2t0cmFjayBpblxuICAgIC8vIG91ciBmbGF0dGVuZWQgbGlzdCBvZiBub2RlcyB0byBkZXRlcm1pbmUgdGhlIGZpcnN0IG5vZGUgdGhhdCdzIG9mIGEgbGV2ZWwgbG93ZXIgdGhhbiB0aGVcbiAgICAvLyBwcm92aWRlZCBub2RlLlxuICAgIGlmICghY2FjaGVkTm9kZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudExldmVsID0gdGhpcy5fbGV2ZWxzLmdldCh0aGlzLl9nZXRFeHBhbnNpb25LZXkobm9kZSkpID8/IDA7XG4gICAgZm9yIChsZXQgcGFyZW50SW5kZXggPSBpbmRleCAtIDE7IHBhcmVudEluZGV4ID49IDA7IHBhcmVudEluZGV4LS0pIHtcbiAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSBjYWNoZWROb2Rlc1twYXJlbnRJbmRleF07XG4gICAgICBjb25zdCBwYXJlbnRMZXZlbCA9IHRoaXMuX2xldmVscy5nZXQodGhpcy5fZ2V0RXhwYW5zaW9uS2V5KHBhcmVudE5vZGUpKSA/PyAwO1xuXG4gICAgICBpZiAocGFyZW50TGV2ZWwgPCBjdXJyZW50TGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc2V0IG9mIHJvb3Qgbm9kZXMgYW5kIHRoZSBjdXJyZW50IG5vZGUgbGV2ZWwsIGZsYXR0ZW5zIGFueSBuZXN0ZWRcbiAgICogbm9kZXMgaW50byBhIHNpbmdsZSBhcnJheS5cbiAgICpcbiAgICogSWYgYW55IG5vZGVzIGFyZSBub3QgZXhwYW5kZWQsIHRoZW4gdGhlaXIgY2hpbGRyZW4gd2lsbCBub3QgYmUgYWRkZWQgaW50byB0aGUgYXJyYXkuXG4gICAqIFRoaXMgd2lsbCBzdGlsbCB0cmF2ZXJzZSBhbGwgbmVzdGVkIGNoaWxkcmVuIGluIG9yZGVyIHRvIGJ1aWxkIHVwIG91ciBpbnRlcm5hbCBkYXRhXG4gICAqIG1vZGVscywgYnV0IHdpbGwgbm90IGluY2x1ZGUgdGhlbSBpbiB0aGUgcmV0dXJuZWQgYXJyYXkuXG4gICAqL1xuICBwcml2YXRlIF9mbGF0dGVuTmVzdGVkTm9kZXNXaXRoRXhwYW5zaW9uKG5vZGVzOiByZWFkb25seSBUW10sIGxldmVsID0gMCk6IE9ic2VydmFibGU8VFtdPiB7XG4gICAgY29uc3QgY2hpbGRyZW5BY2Nlc3NvciA9IHRoaXMuX2dldENoaWxkcmVuQWNjZXNzb3IoKTtcbiAgICAvLyBJZiB3ZSdyZSB1c2luZyBhIGxldmVsIGFjY2Vzc29yLCB3ZSBkb24ndCBuZWVkIHRvIGZsYXR0ZW4gYW55dGhpbmcuXG4gICAgaWYgKCFjaGlsZHJlbkFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKFsuLi5ub2Rlc10pO1xuICAgIH1cblxuICAgIHJldHVybiBvYnNlcnZhYmxlT2YoLi4ubm9kZXMpLnBpcGUoXG4gICAgICBjb25jYXRNYXAobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmVudEtleSA9IHRoaXMuX2dldEV4cGFuc2lvbktleShub2RlKTtcbiAgICAgICAgaWYgKCF0aGlzLl9wYXJlbnRzLmhhcyhwYXJlbnRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcGFyZW50cy5zZXQocGFyZW50S2V5LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sZXZlbHMuc2V0KHBhcmVudEtleSwgbGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gY29lcmNlT2JzZXJ2YWJsZShjaGlsZHJlbkFjY2Vzc29yKG5vZGUpKTtcbiAgICAgICAgcmV0dXJuIGNvbmNhdChcbiAgICAgICAgICBvYnNlcnZhYmxlT2YoW25vZGVdKSxcbiAgICAgICAgICBjaGlsZHJlbi5waXBlKFxuICAgICAgICAgICAgdGFrZSgxKSxcbiAgICAgICAgICAgIHRhcChjaGlsZE5vZGVzID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fYXJpYVNldHMuc2V0KHBhcmVudEtleSwgWy4uLihjaGlsZE5vZGVzID8/IFtdKV0pO1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkTm9kZXMgPz8gW10pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEtleSA9IHRoaXMuX2dldEV4cGFuc2lvbktleShjaGlsZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50cy5zZXQoY2hpbGRLZXksIG5vZGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xldmVscy5zZXQoY2hpbGRLZXksIGxldmVsICsgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgc3dpdGNoTWFwKGNoaWxkTm9kZXMgPT4ge1xuICAgICAgICAgICAgICBpZiAoIWNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKFtdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmxhdHRlbk5lc3RlZE5vZGVzV2l0aEV4cGFuc2lvbihjaGlsZE5vZGVzLCBsZXZlbCArIDEpLnBpcGUoXG4gICAgICAgICAgICAgICAgbWFwKG5lc3RlZE5vZGVzID0+ICh0aGlzLmlzRXhwYW5kZWQobm9kZSkgPyBuZXN0ZWROb2RlcyA6IFtdKSksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgICByZWR1Y2UoKHJlc3VsdHMsIGNoaWxkcmVuKSA9PiB7XG4gICAgICAgIHJlc3VsdHMucHVzaCguLi5jaGlsZHJlbik7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSwgW10gYXMgVFtdKSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGNoaWxkcmVuIGZvciBjZXJ0YWluIHRyZWUgY29uZmlndXJhdGlvbnMuXG4gICAqXG4gICAqIFRoaXMgYWxzbyBjb21wdXRlcyBwYXJlbnQsIGxldmVsLCBhbmQgZ3JvdXAgZGF0YS5cbiAgICovXG4gIHByaXZhdGUgX2NvbXB1dGVSZW5kZXJpbmdEYXRhKFxuICAgIG5vZGVzOiByZWFkb25seSBUW10sXG4gICAgbm9kZVR5cGU6ICdmbGF0JyB8ICduZXN0ZWQnLFxuICApOiBPYnNlcnZhYmxlPHtcbiAgICByZW5kZXJOb2RlczogcmVhZG9ubHkgVFtdO1xuICAgIGZsYXR0ZW5lZE5vZGVzOiByZWFkb25seSBUW107XG4gIH0+IHtcbiAgICAvLyBUaGUgb25seSBzaXR1YXRpb25zIHdoZXJlIHdlIGhhdmUgdG8gY29udmVydCBjaGlsZHJlbiB0eXBlcyBpcyB3aGVuXG4gICAgLy8gdGhleSdyZSBtaXNtYXRjaGVkOyBpLmUuIGlmIHRoZSB0cmVlIGlzIHVzaW5nIGEgY2hpbGRyZW5BY2Nlc3NvciBhbmQgdGhlXG4gICAgLy8gbm9kZXMgYXJlIGZsYXQsIG9yIGlmIHRoZSB0cmVlIGlzIHVzaW5nIGEgbGV2ZWxBY2Nlc3NvciBhbmQgdGhlIG5vZGVzIGFyZVxuICAgIC8vIG5lc3RlZC5cbiAgICBpZiAodGhpcy5jaGlsZHJlbkFjY2Vzc29yICYmIG5vZGVUeXBlID09PSAnZmxhdCcpIHtcbiAgICAgIC8vIFRoaXMgZmxhdHRlbnMgY2hpbGRyZW4gaW50byBhIHNpbmdsZSBhcnJheS5cbiAgICAgIHRoaXMuX2FyaWFTZXRzLnNldChudWxsLCBbLi4ubm9kZXNdKTtcbiAgICAgIHJldHVybiB0aGlzLl9mbGF0dGVuTmVzdGVkTm9kZXNXaXRoRXhwYW5zaW9uKG5vZGVzKS5waXBlKFxuICAgICAgICBtYXAoZmxhdHRlbmVkTm9kZXMgPT4gKHtcbiAgICAgICAgICByZW5kZXJOb2RlczogZmxhdHRlbmVkTm9kZXMsXG4gICAgICAgICAgZmxhdHRlbmVkTm9kZXMsXG4gICAgICAgIH0pKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmxldmVsQWNjZXNzb3IgJiYgbm9kZVR5cGUgPT09ICduZXN0ZWQnKSB7XG4gICAgICAvLyBJbiB0aGUgbmVzdGVkIGNhc2UsIHdlIG9ubHkgbG9vayBmb3Igcm9vdCBub2Rlcy4gVGhlIENka05lc3RlZE5vZGVcbiAgICAgIC8vIGl0c2VsZiB3aWxsIGhhbmRsZSByZW5kZXJpbmcgZWFjaCBpbmRpdmlkdWFsIG5vZGUncyBjaGlsZHJlbi5cbiAgICAgIGNvbnN0IGxldmVsQWNjZXNzb3IgPSB0aGlzLmxldmVsQWNjZXNzb3I7XG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKG5vZGVzLmZpbHRlcihub2RlID0+IGxldmVsQWNjZXNzb3Iobm9kZSkgPT09IDApKS5waXBlKFxuICAgICAgICBtYXAocm9vdE5vZGVzID0+ICh7XG4gICAgICAgICAgcmVuZGVyTm9kZXM6IHJvb3ROb2RlcyxcbiAgICAgICAgICBmbGF0dGVuZWROb2Rlczogbm9kZXMsXG4gICAgICAgIH0pKSxcbiAgICAgICAgdGFwKCh7ZmxhdHRlbmVkTm9kZXN9KSA9PiB7XG4gICAgICAgICAgdGhpcy5fY2FsY3VsYXRlUGFyZW50cyhmbGF0dGVuZWROb2Rlcyk7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKG5vZGVUeXBlID09PSAnZmxhdCcpIHtcbiAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGEgVHJlZUNvbnRyb2wsIHdlIGtub3cgdGhhdCB0aGUgbm9kZSB0eXBlIG1hdGNoZXMgdXBcbiAgICAgIC8vIHdpdGggdGhlIFRyZWVDb250cm9sLCBhbmQgc28gbm8gY29udmVyc2lvbnMgYXJlIG5lY2Vzc2FyeS4gT3RoZXJ3aXNlLFxuICAgICAgLy8gd2UndmUgYWxyZWFkeSBjb25maXJtZWQgdGhhdCB0aGUgZGF0YSBtb2RlbCBtYXRjaGVzIHVwIHdpdGggdGhlXG4gICAgICAvLyBkZXNpcmVkIG5vZGUgdHlwZSBoZXJlLlxuICAgICAgcmV0dXJuIG9ic2VydmFibGVPZih7cmVuZGVyTm9kZXM6IG5vZGVzLCBmbGF0dGVuZWROb2Rlczogbm9kZXN9KS5waXBlKFxuICAgICAgICB0YXAoKHtmbGF0dGVuZWROb2Rlc30pID0+IHtcbiAgICAgICAgICB0aGlzLl9jYWxjdWxhdGVQYXJlbnRzKGZsYXR0ZW5lZE5vZGVzKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGb3IgbmVzdGVkIG5vZGVzLCB3ZSBzdGlsbCBuZWVkIHRvIHBlcmZvcm0gdGhlIG5vZGUgZmxhdHRlbmluZyBpbiBvcmRlclxuICAgICAgLy8gdG8gbWFpbnRhaW4gb3VyIGNhY2hlcyBmb3IgdmFyaW91cyB0cmVlIG9wZXJhdGlvbnMuXG4gICAgICB0aGlzLl9hcmlhU2V0cy5zZXQobnVsbCwgWy4uLm5vZGVzXSk7XG4gICAgICByZXR1cm4gdGhpcy5fZmxhdHRlbk5lc3RlZE5vZGVzV2l0aEV4cGFuc2lvbihub2RlcykucGlwZShcbiAgICAgICAgbWFwKGZsYXR0ZW5lZE5vZGVzID0+ICh7XG4gICAgICAgICAgcmVuZGVyTm9kZXM6IG5vZGVzLFxuICAgICAgICAgIGZsYXR0ZW5lZE5vZGVzLFxuICAgICAgICB9KSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUNhY2hlZERhdGEoZmxhdHRlbmVkTm9kZXM6IHJlYWRvbmx5IFRbXSkge1xuICAgIHRoaXMuX2ZsYXR0ZW5lZE5vZGVzLm5leHQoZmxhdHRlbmVkTm9kZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlS2V5TWFuYWdlckl0ZW1zKGZsYXR0ZW5lZE5vZGVzOiByZWFkb25seSBUW10pIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyTm9kZXMubmV4dChmbGF0dGVuZWROb2Rlcyk7XG4gIH1cblxuICAvKiogVHJhdmVyc2UgdGhlIGZsYXR0ZW5lZCBub2RlIGRhdGEgYW5kIGNvbXB1dGUgcGFyZW50cywgbGV2ZWxzLCBhbmQgZ3JvdXAgZGF0YS4gKi9cbiAgcHJpdmF0ZSBfY2FsY3VsYXRlUGFyZW50cyhmbGF0dGVuZWROb2RlczogcmVhZG9ubHkgVFtdKTogdm9pZCB7XG4gICAgY29uc3QgbGV2ZWxBY2Nlc3NvciA9IHRoaXMuX2dldExldmVsQWNjZXNzb3IoKTtcbiAgICBpZiAoIWxldmVsQWNjZXNzb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9wYXJlbnRzLmNsZWFyKCk7XG4gICAgdGhpcy5fYXJpYVNldHMuY2xlYXIoKTtcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBmbGF0dGVuZWROb2Rlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGRhdGFOb2RlID0gZmxhdHRlbmVkTm9kZXNbaW5kZXhdO1xuICAgICAgY29uc3Qga2V5ID0gdGhpcy5fZ2V0RXhwYW5zaW9uS2V5KGRhdGFOb2RlKTtcbiAgICAgIHRoaXMuX2xldmVscy5zZXQoa2V5LCBsZXZlbEFjY2Vzc29yKGRhdGFOb2RlKSk7XG4gICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9maW5kUGFyZW50Rm9yTm9kZShkYXRhTm9kZSwgaW5kZXgsIGZsYXR0ZW5lZE5vZGVzKTtcbiAgICAgIHRoaXMuX3BhcmVudHMuc2V0KGtleSwgcGFyZW50KTtcbiAgICAgIGNvbnN0IHBhcmVudEtleSA9IHBhcmVudCA/IHRoaXMuX2dldEV4cGFuc2lvbktleShwYXJlbnQpIDogbnVsbDtcblxuICAgICAgY29uc3QgZ3JvdXAgPSB0aGlzLl9hcmlhU2V0cy5nZXQocGFyZW50S2V5KSA/PyBbXTtcbiAgICAgIGdyb3VwLnNwbGljZShpbmRleCwgMCwgZGF0YU5vZGUpO1xuICAgICAgdGhpcy5fYXJpYVNldHMuc2V0KHBhcmVudEtleSwgZ3JvdXApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRyZWUgbm9kZSBmb3IgQ2RrVHJlZS4gSXQgY29udGFpbnMgdGhlIGRhdGEgaW4gdGhlIHRyZWUgbm9kZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXRyZWUtbm9kZScsXG4gIGV4cG9ydEFzOiAnY2RrVHJlZU5vZGUnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay10cmVlLW5vZGUnLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdfZ2V0QXJpYUV4cGFuZGVkKCknLFxuICAgICdbYXR0ci5hcmlhLWxldmVsXSc6ICdsZXZlbCArIDEnLFxuICAgICdbYXR0ci5hcmlhLXBvc2luc2V0XSc6ICdfZ2V0UG9zaXRpb25JblNldCgpJyxcbiAgICAnW2F0dHIuYXJpYS1zZXRzaXplXSc6ICdfZ2V0U2V0U2l6ZSgpJyxcbiAgICAnW3RhYmluZGV4XSc6ICdfdGFiaW5kZXgnLFxuICAgICdyb2xlJzogJ3RyZWVpdGVtJyxcbiAgICAnKGNsaWNrKSc6ICdfc2V0QWN0aXZlSXRlbSgpJyxcbiAgICAnKGZvY3VzKSc6ICdfZm9jdXNJdGVtKCknLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUcmVlTm9kZTxULCBLID0gVD4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCwgVHJlZUtleU1hbmFnZXJJdGVtIHtcbiAgcHJvdGVjdGVkIF90YWJpbmRleDogbnVtYmVyIHwgbnVsbCA9IC0xO1xuXG4gIC8qKlxuICAgKiBUaGUgcm9sZSBvZiB0aGUgdHJlZSBub2RlLlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgaWdub3JlZDsgdGhlIHRyZWUgd2lsbCBhdXRvbWF0aWNhbGx5IGRldGVybWluZSB0aGUgYXBwcm9wcmlhdGUgcm9sZVxuICAgKiBmb3IgdHJlZSBub2RlLiBUaGlzIGlucHV0IHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDIxLjAuMFxuICAgKi9cbiAgQElucHV0KCkgZ2V0IHJvbGUoKTogJ3RyZWVpdGVtJyB8ICdncm91cCcge1xuICAgIHJldHVybiAndHJlZWl0ZW0nO1xuICB9XG5cbiAgc2V0IHJvbGUoX3JvbGU6ICd0cmVlaXRlbScgfCAnZ3JvdXAnKSB7XG4gICAgLy8gaWdub3JlIGFueSByb2xlIHNldHRpbmcsIHdlIGhhbmRsZSB0aGlzIGludGVybmFsbHkuXG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhpcyBub2RlIGlzIGV4cGFuZGFibGUuXG4gICAqXG4gICAqIElmIG5vdCB1c2luZyBgRmxhdFRyZWVDb250cm9sYCwgb3IgaWYgYGlzRXhwYW5kYWJsZWAgaXMgbm90IHByb3ZpZGVkIHRvXG4gICAqIGBOZXN0ZWRUcmVlQ29udHJvbGAsIHRoaXMgc2hvdWxkIGJlIHByb3ZpZGVkIGZvciBjb3JyZWN0IG5vZGUgYTExeS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGlzRXhwYW5kYWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNFeHBhbmRhYmxlKCk7XG4gIH1cbiAgc2V0IGlzRXhwYW5kYWJsZShpc0V4cGFuZGFibGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9pbnB1dElzRXhwYW5kYWJsZSA9IGlzRXhwYW5kYWJsZTtcbiAgICBpZiAoKHRoaXMuZGF0YSAmJiAhdGhpcy5faXNFeHBhbmRhYmxlKSB8fCAhdGhpcy5faW5wdXRJc0V4cGFuZGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gSWYgdGhlIG5vZGUgaXMgYmVpbmcgc2V0IHRvIGV4cGFuZGFibGUsIGVuc3VyZSB0aGF0IHRoZSBzdGF0dXMgb2YgdGhlXG4gICAgLy8gbm9kZSBpcyBwcm9wYWdhdGVkXG4gICAgaWYgKHRoaXMuX2lucHV0SXNFeHBhbmRlZCkge1xuICAgICAgdGhpcy5leHBhbmQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lucHV0SXNFeHBhbmRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdHJlZS5pc0V4cGFuZGVkKHRoaXMuX2RhdGEpO1xuICB9XG4gIHNldCBpc0V4cGFuZGVkKGlzRXhwYW5kZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9pbnB1dElzRXhwYW5kZWQgPSBpc0V4cGFuZGVkO1xuICAgIGlmIChpc0V4cGFuZGVkKSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbGxhcHNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgbm9kZSBpcyBkaXNhYmxlZC4gSWYgaXQncyBkaXNhYmxlZCwgdGhlbiB0aGUgdXNlciB3b24ndCBiZSBhYmxlIHRvIGZvY3VzXG4gICAqIG9yIGFjdGl2YXRlIHRoaXMgbm9kZS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgaXNEaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIHRleHQgdXNlZCB0byBsb2NhdGUgdGhpcyBpdGVtIGR1cmluZyB0eXBlYWhlYWQuIElmIG5vdCBzcGVjaWZpZWQsIHRoZSBgdGV4dENvbnRlbnRgIHdpbGxcbiAgICogd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgQElucHV0KCdjZGtUcmVlTm9kZVR5cGVhaGVhZExhYmVsJykgdHlwZWFoZWFkTGFiZWw6IHN0cmluZyB8IG51bGw7XG5cbiAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50eXBlYWhlYWRMYWJlbCB8fCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIC8qKiBUaGlzIGVtaXRzIHdoZW4gdGhlIG5vZGUgaGFzIGJlZW4gcHJvZ3JhbWF0aWNhbGx5IGFjdGl2YXRlZCBvciBhY3RpdmF0ZWQgYnkga2V5Ym9hcmQuICovXG4gIEBPdXRwdXQoKVxuICByZWFkb25seSBhY3RpdmF0aW9uOiBFdmVudEVtaXR0ZXI8VD4gPSBuZXcgRXZlbnRFbWl0dGVyPFQ+KCk7XG5cbiAgLyoqIFRoaXMgZW1pdHMgd2hlbiB0aGUgbm9kZSdzIGV4cGFuc2lvbiBzdGF0dXMgaGFzIGJlZW4gY2hhbmdlZC4gKi9cbiAgQE91dHB1dCgpXG4gIHJlYWRvbmx5IGV4cGFuZGVkQ2hhbmdlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBtb3N0IHJlY2VudGx5IGNyZWF0ZWQgYENka1RyZWVOb2RlYC4gV2Ugc2F2ZSBpdCBpbiBzdGF0aWMgdmFyaWFibGUgc28gd2UgY2FuIHJldHJpZXZlIGl0XG4gICAqIGluIGBDZGtUcmVlYCBhbmQgc2V0IHRoZSBkYXRhIHRvIGl0LlxuICAgKi9cbiAgc3RhdGljIG1vc3RSZWNlbnRUcmVlTm9kZTogQ2RrVHJlZU5vZGU8YW55PiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBub2RlJ3MgZGF0YSBoYXMgY2hhbmdlZC4gKi9cbiAgcmVhZG9ubHkgX2RhdGFDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBwcml2YXRlIF9pbnB1dElzRXhwYW5kYWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9pbnB1dElzRXhwYW5kZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBGbGFnIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgb3Igbm90IHdlIHNob3VsZCBiZSBmb2N1c2luZyB0aGUgYWN0dWFsIGVsZW1lbnQgYmFzZWQgb25cbiAgICogc29tZSB1c2VyIGludGVyYWN0aW9uIChjbGljayBvciBmb2N1cykuIE9uIGNsaWNrLCB3ZSBkb24ndCBmb3JjaWJseSBmb2N1cyB0aGUgZWxlbWVudFxuICAgKiBzaW5jZSB0aGUgY2xpY2sgY291bGQgdHJpZ2dlciBzb21lIG90aGVyIGNvbXBvbmVudCB0aGF0IHdhbnRzIHRvIGdyYWIgaXRzIG93biBmb2N1c1xuICAgKiAoZS5nLiBtZW51LCBkaWFsb2cpLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvdWxkRm9jdXMgPSB0cnVlO1xuICBwcml2YXRlIF9wYXJlbnROb2RlQXJpYUxldmVsOiBudW1iZXI7XG5cbiAgLyoqIFRoZSB0cmVlIG5vZGUncyBkYXRhLiAqL1xuICBnZXQgZGF0YSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgfVxuICBzZXQgZGF0YSh2YWx1ZTogVCkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHZhbHVlO1xuICAgICAgdGhpcy5fZGF0YUNoYW5nZXMubmV4dCgpO1xuICAgIH1cbiAgfVxuICBwcm90ZWN0ZWQgX2RhdGE6IFQ7XG5cbiAgLyogSWYgbGVhZiBub2RlLCByZXR1cm4gdHJ1ZSB0byBub3QgYXNzaWduIGFyaWEtZXhwYW5kZWQgYXR0cmlidXRlICovXG4gIGdldCBpc0xlYWZOb2RlKCk6IGJvb2xlYW4ge1xuICAgIC8vIElmIGZsYXQgdHJlZSBub2RlIGRhdGEgcmV0dXJucyBmYWxzZSBmb3IgZXhwYW5kYWJsZSBwcm9wZXJ0eSwgaXQncyBhIGxlYWYgbm9kZVxuICAgIGlmIChcbiAgICAgIHRoaXMuX3RyZWUudHJlZUNvbnRyb2w/LmlzRXhwYW5kYWJsZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAhdGhpcy5fdHJlZS50cmVlQ29udHJvbC5pc0V4cGFuZGFibGUodGhpcy5fZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAvLyBJZiBuZXN0ZWQgdHJlZSBub2RlIGRhdGEgcmV0dXJucyAwIGRlc2NlbmRhbnRzLCBpdCdzIGEgbGVhZiBub2RlXG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMuX3RyZWUudHJlZUNvbnRyb2w/LmlzRXhwYW5kYWJsZSA9PT0gdW5kZWZpbmVkICYmXG4gICAgICB0aGlzLl90cmVlLnRyZWVDb250cm9sPy5nZXREZXNjZW5kYW50cyh0aGlzLl9kYXRhKS5sZW5ndGggPT09IDBcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldCBsZXZlbCgpOiBudW1iZXIge1xuICAgIC8vIElmIHRoZSB0cmVlIGhhcyBhIGxldmVsQWNjZXNzb3IsIHVzZSBpdCB0byBnZXQgdGhlIGxldmVsLiBPdGhlcndpc2UgcmVhZCB0aGVcbiAgICAvLyBhcmlhLWxldmVsIG9mZiB0aGUgcGFyZW50IG5vZGUgYW5kIHVzZSBpdCBhcyB0aGUgbGV2ZWwgZm9yIHRoaXMgbm9kZSAobm90ZSBhcmlhLWxldmVsIGlzXG4gICAgLy8gMS1pbmRleGVkLCB3aGlsZSB0aGlzIHByb3BlcnR5IGlzIDAtaW5kZXhlZCwgc28gd2UgZG9uJ3QgbmVlZCB0byBpbmNyZW1lbnQpLlxuICAgIHJldHVybiB0aGlzLl90cmVlLl9nZXRMZXZlbCh0aGlzLl9kYXRhKSA/PyB0aGlzLl9wYXJlbnROb2RlQXJpYUxldmVsO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgaWYgdGhlIHRyZWUgbm9kZSBpcyBleHBhbmRhYmxlLiAqL1xuICBfaXNFeHBhbmRhYmxlKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl90cmVlLnRyZWVDb250cm9sKSB7XG4gICAgICBpZiAodGhpcy5pc0xlYWZOb2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIGNvbXBhdGliaWxpdHkgd2l0aCB0cmVlcyBjcmVhdGVkIHVzaW5nIFRyZWVDb250cm9sIGJlZm9yZSB3ZSBhZGRlZFxuICAgICAgLy8gQ2RrVHJlZU5vZGUjaXNFeHBhbmRhYmxlLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pbnB1dElzRXhwYW5kYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHRoZSB2YWx1ZSBmb3IgYGFyaWEtZXhwYW5kZWRgLlxuICAgKlxuICAgKiBGb3Igbm9uLWV4cGFuZGFibGUgbm9kZXMsIHRoaXMgaXMgYG51bGxgLlxuICAgKi9cbiAgX2dldEFyaWFFeHBhbmRlZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIXRoaXMuX2lzRXhwYW5kYWJsZSgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLmlzRXhwYW5kZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIHNpemUgb2YgdGhpcyBub2RlJ3MgcGFyZW50J3MgY2hpbGQgc2V0LlxuICAgKlxuICAgKiBUaGlzIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgZm9yIGBhcmlhLXNldHNpemVgLlxuICAgKi9cbiAgX2dldFNldFNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHJlZS5fZ2V0U2V0U2l6ZSh0aGlzLl9kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHRoZSBpbmRleCAoc3RhcnRpbmcgZnJvbSAxKSBvZiB0aGlzIG5vZGUgaW4gaXRzIHBhcmVudCdzIGNoaWxkIHNldC5cbiAgICpcbiAgICogVGhpcyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciBgYXJpYS1wb3NpbnNldGAuXG4gICAqL1xuICBfZ2V0UG9zaXRpb25JblNldCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90cmVlLl9nZXRQb3NpdGlvbkluU2V0KHRoaXMuX2RhdGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWYgPSBpbmplY3QoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJvdGVjdGVkIF90cmVlOiBDZGtUcmVlPFQsIEs+LFxuICApIHtcbiAgICBDZGtUcmVlTm9kZS5tb3N0UmVjZW50VHJlZU5vZGUgPSB0aGlzIGFzIENka1RyZWVOb2RlPFQsIEs+O1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcGFyZW50Tm9kZUFyaWFMZXZlbCA9IGdldFBhcmVudE5vZGVBcmlhTGV2ZWwodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICB0aGlzLl90cmVlXG4gICAgICAuX2dldEV4cGFuc2lvbk1vZGVsKClcbiAgICAgIC5jaGFuZ2VkLnBpcGUoXG4gICAgICAgIG1hcCgoKSA9PiB0aGlzLmlzRXhwYW5kZWQpLFxuICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gICAgdGhpcy5fdHJlZS5fc2V0Tm9kZVR5cGVJZlVuc2V0KCdmbGF0Jyk7XG4gICAgdGhpcy5fdHJlZS5fcmVnaXN0ZXJOb2RlKHRoaXMpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gSWYgdGhpcyBpcyB0aGUgbGFzdCB0cmVlIG5vZGUgYmVpbmcgZGVzdHJveWVkLFxuICAgIC8vIGNsZWFyIG91dCB0aGUgcmVmZXJlbmNlIHRvIGF2b2lkIGxlYWtpbmcgbWVtb3J5LlxuICAgIGlmIChDZGtUcmVlTm9kZS5tb3N0UmVjZW50VHJlZU5vZGUgPT09IHRoaXMpIHtcbiAgICAgIENka1RyZWVOb2RlLm1vc3RSZWNlbnRUcmVlTm9kZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fZGF0YUNoYW5nZXMuY29tcGxldGUoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgZ2V0UGFyZW50KCk6IENka1RyZWVOb2RlPFQsIEs+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3RyZWUuX2dldE5vZGVQYXJlbnQodGhpcykgPz8gbnVsbDtcbiAgfVxuXG4gIGdldENoaWxkcmVuKCk6IENka1RyZWVOb2RlPFQsIEs+W10gfCBPYnNlcnZhYmxlPENka1RyZWVOb2RlPFQsIEs+W10+IHtcbiAgICByZXR1cm4gdGhpcy5fdHJlZS5fZ2V0Tm9kZUNoaWxkcmVuKHRoaXMpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhpcyBkYXRhIG5vZGUuIEltcGxlbWVudGVkIGZvciBUcmVlS2V5TWFuYWdlckl0ZW0uICovXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuX3RhYmluZGV4ID0gMDtcbiAgICBpZiAodGhpcy5fc2hvdWxkRm9jdXMpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgIH1cblxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIERlZm9jdXMgdGhpcyBkYXRhIG5vZGUuICovXG4gIHVuZm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5fdGFiaW5kZXggPSAtMTtcblxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIEVtaXRzIGFuIGFjdGl2YXRpb24gZXZlbnQuIEltcGxlbWVudGVkIGZvciBUcmVlS2V5TWFuYWdlckl0ZW0uICovXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzRGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmF0aW9uLm5leHQodGhpcy5fZGF0YSk7XG4gIH1cblxuICAvKiogQ29sbGFwc2VzIHRoaXMgZGF0YSBub2RlLiBJbXBsZW1lbnRlZCBmb3IgVHJlZUtleU1hbmFnZXJJdGVtLiAqL1xuICBjb2xsYXBzZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUpIHtcbiAgICAgIHRoaXMuX3RyZWUuY29sbGFwc2UodGhpcy5fZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV4cGFuZHMgdGhpcyBkYXRhIG5vZGUuIEltcGxlbWVudGVkIGZvciBUcmVlS2V5TWFuYWdlckl0ZW0uICovXG4gIGV4cGFuZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUpIHtcbiAgICAgIHRoaXMuX3RyZWUuZXhwYW5kKHRoaXMuX2RhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBNYWtlcyB0aGUgbm9kZSBmb2N1c2FibGUuIEltcGxlbWVudGVkIGZvciBUcmVlS2V5TWFuYWdlckl0ZW0uICovXG4gIG1ha2VGb2N1c2FibGUoKTogdm9pZCB7XG4gICAgdGhpcy5fdGFiaW5kZXggPSAwO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgX2ZvY3VzSXRlbSgpIHtcbiAgICBpZiAodGhpcy5pc0Rpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3RyZWUuX2tleU1hbmFnZXIuZm9jdXNJdGVtKHRoaXMpO1xuICB9XG5cbiAgX3NldEFjdGl2ZUl0ZW0oKSB7XG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zaG91bGRGb2N1cyA9IGZhbHNlO1xuICAgIHRoaXMuX3RyZWUuX2tleU1hbmFnZXIuZm9jdXNJdGVtKHRoaXMpO1xuICAgIHRoaXMuX3Nob3VsZEZvY3VzID0gdHJ1ZTtcbiAgfVxuXG4gIF9lbWl0RXhwYW5zaW9uU3RhdGUoZXhwYW5kZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmV4cGFuZGVkQ2hhbmdlLmVtaXQoZXhwYW5kZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBhcmVudE5vZGVBcmlhTGV2ZWwobm9kZUVsZW1lbnQ6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgbGV0IHBhcmVudCA9IG5vZGVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gIHdoaWxlIChwYXJlbnQgJiYgIWlzTm9kZUVsZW1lbnQocGFyZW50KSkge1xuICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnRFbGVtZW50O1xuICB9XG4gIGlmICghcGFyZW50KSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0luY29ycmVjdCB0cmVlIHN0cnVjdHVyZSBjb250YWluaW5nIGRldGFjaGVkIG5vZGUuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnY2RrLW5lc3RlZC10cmVlLW5vZGUnKSkge1xuICAgIHJldHVybiBudW1iZXJBdHRyaWJ1dGUocGFyZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sZXZlbCcpISk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlIGFuY2VzdG9yIGVsZW1lbnQgaXMgdGhlIGNkay10cmVlIGl0c2VsZlxuICAgIHJldHVybiAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTm9kZUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgY29uc3QgY2xhc3NMaXN0ID0gZWxlbWVudC5jbGFzc0xpc3Q7XG4gIHJldHVybiAhIShjbGFzc0xpc3Q/LmNvbnRhaW5zKCdjZGstbmVzdGVkLXRyZWUtbm9kZScpIHx8IGNsYXNzTGlzdD8uY29udGFpbnMoJ2Nkay10cmVlJykpO1xufVxuIl19