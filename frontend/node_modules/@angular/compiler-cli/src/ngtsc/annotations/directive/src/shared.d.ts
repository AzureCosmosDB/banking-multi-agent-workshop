/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ParsedHostBindings, R3DirectiveMetadata, R3QueryMetadata } from '@angular/compiler';
import ts from 'typescript';
import { ImportedSymbolsTracker, Reference, ReferenceEmitter } from '../../../imports';
import { ClassPropertyMapping, DecoratorInputTransform, HostDirectiveMeta, InputMapping } from '../../../metadata';
import { DynamicValue, PartialEvaluator } from '../../../partial_evaluator';
import { ClassDeclaration, ClassMember, Decorator, ReflectionHost } from '../../../reflection';
import { CompilationMode } from '../../../transform';
import { ReferencesRegistry } from '../../common';
type QueryDecoratorName = 'ViewChild' | 'ViewChildren' | 'ContentChild' | 'ContentChildren';
export declare const queryDecoratorNames: QueryDecoratorName[];
/**
 * Helper function to extract metadata from a `Directive` or `Component`. `Directive`s without a
 * selector are allowed to be used for abstract base classes. These abstract directives should not
 * appear in the declarations of an `NgModule` and additional verification is done when processing
 * the module.
 */
export declare function extractDirectiveMetadata(clazz: ClassDeclaration, decorator: Readonly<Decorator>, reflector: ReflectionHost, importTracker: ImportedSymbolsTracker, evaluator: PartialEvaluator, refEmitter: ReferenceEmitter, referencesRegistry: ReferencesRegistry, isCore: boolean, annotateForClosureCompiler: boolean, compilationMode: CompilationMode, defaultSelector: string | null, strictStandalone: boolean, implicitStandaloneValue: boolean): {
    jitForced: false;
    decorator: Map<string, ts.Expression>;
    metadata: R3DirectiveMetadata;
    inputs: ClassPropertyMapping<InputMapping>;
    outputs: ClassPropertyMapping;
    isStructural: boolean;
    hostDirectives: HostDirectiveMeta[] | null;
    rawHostDirectives: ts.Expression | null;
    inputFieldNamesFromMetadataArray: Set<string>;
} | {
    jitForced: true;
};
export declare function extractDecoratorQueryMetadata(exprNode: ts.Node, name: string, args: ReadonlyArray<ts.Expression>, propertyName: string, reflector: ReflectionHost, evaluator: PartialEvaluator): R3QueryMetadata;
export declare function extractHostBindings(members: ClassMember[], evaluator: PartialEvaluator, coreModule: string | undefined, compilationMode: CompilationMode, metadata?: Map<string, ts.Expression>): ParsedHostBindings;
export declare function parseDirectiveStyles(directive: Map<string, ts.Expression>, evaluator: PartialEvaluator, compilationMode: CompilationMode): null | string[];
export declare function parseFieldStringArrayValue(directive: Map<string, ts.Expression>, field: string, evaluator: PartialEvaluator): null | string[];
/**
 * Parses the `transform` function and its type for a decorator `@Input`.
 *
 * This logic verifies feasibility of extracting the transform write type
 * into a different place, so that the input write type can be captured at
 * a later point in a static acceptance member.
 *
 * Note: This is not needed for signal inputs where the transform type is
 * automatically captured in the type of the `InputSignal`.
 *
 */
export declare function parseDecoratorInputTransformFunction(clazz: ClassDeclaration, classPropertyName: string, value: DynamicValue | Reference, reflector: ReflectionHost, refEmitter: ReferenceEmitter, compilationMode: CompilationMode): DecoratorInputTransform;
export {};
