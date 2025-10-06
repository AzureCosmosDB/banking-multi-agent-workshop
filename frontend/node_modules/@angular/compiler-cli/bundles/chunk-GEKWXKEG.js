
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  AmbientImport,
  ClassMemberAccessLevel,
  ClassMemberKind,
  ErrorCode,
  FatalDiagnosticError,
  ImportFlags,
  ImportManager,
  Reference,
  ReferenceEmitKind,
  TypeEmitter,
  TypeEntityToDeclarationError,
  addDiagnosticChain,
  assertSuccessfulReferenceEmit,
  attachDefaultImportDeclaration,
  canEmitType,
  classMemberAccessLevelToString,
  entityNameToValue,
  filterToMembersWithDecorator,
  getDefaultImportDeclaration,
  getProjectRelativePath,
  getSourceFile,
  getSourceFileOrNull,
  getTokenAtPosition,
  identifierOfNode,
  isAssignment,
  isDeclaration,
  isDtsPath,
  isFromDtsFile,
  isNamedClassDeclaration,
  isNonDeclarationTsPath,
  isSymbolWithValueDeclaration,
  makeDiagnostic,
  makeDiagnosticChain,
  makeRelatedInformation,
  ngErrorCode,
  nodeDebugInfo,
  nodeNameForError,
  presetImportManagerForceNamespaceImports,
  reflectObjectLiteral,
  reflectTypeEntityToDeclaration,
  toUnredirectedSourceFile,
  translateExpression,
  translateStatement,
  translateType,
  typeNodeToValueExpr
} from "./chunk-RMJDBMCH.js";
import {
  PerfCheckpoint,
  PerfEvent,
  PerfPhase
} from "./chunk-Q2WE7ECN.js";
import {
  absoluteFrom,
  absoluteFromSourceFile,
  getSourceFileOrError,
  relative
} from "./chunk-37JMVF7H.js";
import {
  __publicField
} from "./chunk-KPQ72R34.js";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/util.mjs
import { ExternalExpr, ParseLocation, ParseSourceFile, ParseSourceSpan, ReadPropExpr, WrappedNodeExpr } from "@angular/compiler";
import ts from "typescript";
var CORE_MODULE = "@angular/core";
function valueReferenceToExpression(valueRef) {
  if (valueRef.kind === 2) {
    return null;
  } else if (valueRef.kind === 0) {
    const expr = new WrappedNodeExpr(valueRef.expression);
    if (valueRef.defaultImportStatement !== null) {
      attachDefaultImportDeclaration(expr, valueRef.defaultImportStatement);
    }
    return expr;
  } else {
    let importExpr = new ExternalExpr({
      moduleName: valueRef.moduleName,
      name: valueRef.importedName
    });
    if (valueRef.nestedPath !== null) {
      for (const property of valueRef.nestedPath) {
        importExpr = new ReadPropExpr(importExpr, property);
      }
    }
    return importExpr;
  }
}
function toR3Reference(origin, ref, context, refEmitter) {
  const emittedValueRef = refEmitter.emit(ref, context);
  assertSuccessfulReferenceEmit(emittedValueRef, origin, "class");
  const emittedTypeRef = refEmitter.emit(ref, context, ImportFlags.ForceNewImport | ImportFlags.AllowTypeImports);
  assertSuccessfulReferenceEmit(emittedTypeRef, origin, "class");
  return {
    value: emittedValueRef.expression,
    type: emittedTypeRef.expression
  };
}
function isAngularCore(decorator) {
  return decorator.import !== null && decorator.import.from === CORE_MODULE;
}
function isAngularCoreReference(reference, symbolName) {
  return reference.ownedByModuleGuess === CORE_MODULE && reference.debugName === symbolName;
}
function findAngularDecorator(decorators, name, isCore) {
  return decorators.find((decorator) => isAngularDecorator(decorator, name, isCore));
}
function isAngularDecorator(decorator, name, isCore) {
  if (isCore) {
    return decorator.name === name;
  } else if (isAngularCore(decorator)) {
    return decorator.import.name === name;
  }
  return false;
}
function getAngularDecorators(decorators, names, isCore) {
  return decorators.filter((decorator) => {
    var _a;
    const name = isCore ? decorator.name : (_a = decorator.import) == null ? void 0 : _a.name;
    if (name === void 0 || !names.includes(name)) {
      return false;
    }
    return isCore || isAngularCore(decorator);
  });
}
function unwrapExpression(node) {
  while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node;
}
function expandForwardRef(arg) {
  arg = unwrapExpression(arg);
  if (!ts.isArrowFunction(arg) && !ts.isFunctionExpression(arg)) {
    return null;
  }
  const body = arg.body;
  if (ts.isBlock(body)) {
    if (body.statements.length !== 1) {
      return null;
    }
    const stmt = body.statements[0];
    if (!ts.isReturnStatement(stmt) || stmt.expression === void 0) {
      return null;
    }
    return stmt.expression;
  } else {
    return body;
  }
}
function tryUnwrapForwardRef(node, reflector) {
  node = unwrapExpression(node);
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
    return null;
  }
  const fn = ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression;
  if (!ts.isIdentifier(fn)) {
    return null;
  }
  const expr = expandForwardRef(node.arguments[0]);
  if (expr === null) {
    return null;
  }
  const imp = reflector.getImportOfIdentifier(fn);
  if (imp === null || imp.from !== "@angular/core" || imp.name !== "forwardRef") {
    return null;
  }
  return expr;
}
var forwardRefResolver = (fn, callExpr, resolve, unresolvable) => {
  if (!isAngularCoreReference(fn, "forwardRef") || callExpr.arguments.length !== 1) {
    return unresolvable;
  }
  const expanded = expandForwardRef(callExpr.arguments[0]);
  if (expanded !== null) {
    return resolve(expanded);
  } else {
    return unresolvable;
  }
};
function combineResolvers(resolvers) {
  return (fn, callExpr, resolve, unresolvable) => {
    for (const resolver of resolvers) {
      const resolved = resolver(fn, callExpr, resolve, unresolvable);
      if (resolved !== unresolvable) {
        return resolved;
      }
    }
    return unresolvable;
  };
}
function isExpressionForwardReference(expr, context, contextSource) {
  if (isWrappedTsNodeExpr(expr)) {
    const node = ts.getOriginalNode(expr.node);
    return node.getSourceFile() === contextSource && context.pos < node.pos;
  } else {
    return false;
  }
}
function isWrappedTsNodeExpr(expr) {
  return expr instanceof WrappedNodeExpr;
}
function readBaseClass(node, reflector, evaluator) {
  const baseExpression = reflector.getBaseClassExpression(node);
  if (baseExpression !== null) {
    const baseClass = evaluator.evaluate(baseExpression);
    if (baseClass instanceof Reference && reflector.isClass(baseClass.node)) {
      return baseClass;
    } else {
      return "dynamic";
    }
  }
  return null;
}
var parensWrapperTransformerFactory = (context) => {
  const visitor = (node) => {
    const visited = ts.visitEachChild(node, visitor, context);
    if (ts.isArrowFunction(visited) || ts.isFunctionExpression(visited)) {
      return ts.factory.createParenthesizedExpression(visited);
    }
    return visited;
  };
  return (node) => ts.visitEachChild(node, visitor, context);
};
function wrapFunctionExpressionsInParens(expression) {
  return ts.transform(expression, [parensWrapperTransformerFactory]).transformed[0];
}
function resolveProvidersRequiringFactory(rawProviders, reflector, evaluator) {
  const providers = /* @__PURE__ */ new Set();
  const resolvedProviders = evaluator.evaluate(rawProviders);
  if (!Array.isArray(resolvedProviders)) {
    return providers;
  }
  resolvedProviders.forEach(function processProviders(provider) {
    let tokenClass = null;
    if (Array.isArray(provider)) {
      provider.forEach(processProviders);
    } else if (provider instanceof Reference) {
      tokenClass = provider;
    } else if (provider instanceof Map && provider.has("useClass") && !provider.has("deps")) {
      const useExisting = provider.get("useClass");
      if (useExisting instanceof Reference) {
        tokenClass = useExisting;
      }
    }
    if (tokenClass !== null && !tokenClass.node.getSourceFile().isDeclarationFile && reflector.isClass(tokenClass.node)) {
      const constructorParameters = reflector.getConstructorParameters(tokenClass.node);
      if (constructorParameters !== null && constructorParameters.length > 0) {
        providers.add(tokenClass);
      }
    }
  });
  return providers;
}
function wrapTypeReference(reflector, clazz) {
  const value = new WrappedNodeExpr(clazz.name);
  const type = value;
  return { value, type };
}
function createSourceSpan(node) {
  const sf = node.getSourceFile();
  const [startOffset, endOffset] = [node.getStart(), node.getEnd()];
  const { line: startLine, character: startCol } = sf.getLineAndCharacterOfPosition(startOffset);
  const { line: endLine, character: endCol } = sf.getLineAndCharacterOfPosition(endOffset);
  const parseSf = new ParseSourceFile(sf.getFullText(), sf.fileName);
  return new ParseSourceSpan(new ParseLocation(parseSf, startOffset, startLine + 1, startCol + 1), new ParseLocation(parseSf, endOffset, endLine + 1, endCol + 1));
}
function compileResults(fac, def, metadataStmt, propName, additionalFields, deferrableImports, debugInfo = null, hmrInitializer = null) {
  const statements = def.statements;
  if (metadataStmt !== null) {
    statements.push(metadataStmt);
  }
  if (debugInfo !== null) {
    statements.push(debugInfo);
  }
  if (hmrInitializer !== null) {
    statements.push(hmrInitializer);
  }
  const results = [
    fac,
    {
      name: propName,
      initializer: def.expression,
      statements: def.statements,
      type: def.type,
      deferrableImports
    }
  ];
  if (additionalFields !== null) {
    results.push(...additionalFields);
  }
  return results;
}
function toFactoryMetadata(meta, target) {
  return {
    name: meta.name,
    type: meta.type,
    typeArgumentCount: meta.typeArgumentCount,
    deps: meta.deps,
    target
  };
}
function resolveImportedFile(moduleResolver, importedFile, expr, origin) {
  if (importedFile !== "unknown") {
    return importedFile;
  }
  if (!(expr instanceof ExternalExpr)) {
    return null;
  }
  return moduleResolver.resolveModule(expr.value.moduleName, origin.fileName);
}
function getOriginNodeForDiagnostics(expr, container) {
  const nodeSf = expr.getSourceFile();
  const exprSf = container.getSourceFile();
  if (nodeSf === exprSf && expr.pos >= container.pos && expr.end <= container.end) {
    return expr;
  } else {
    return container;
  }
}
function isAbstractClassDeclaration(clazz) {
  return ts.canHaveModifiers(clazz) && clazz.modifiers !== void 0 ? clazz.modifiers.some((mod) => mod.kind === ts.SyntaxKind.AbstractKeyword) : false;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/dynamic.mjs
var DynamicValue = class {
  node;
  reason;
  code;
  constructor(node, reason, code) {
    this.node = node;
    this.reason = reason;
    this.code = code;
  }
  static fromDynamicInput(node, input) {
    return new DynamicValue(node, input, 0);
  }
  static fromDynamicString(node) {
    return new DynamicValue(node, void 0, 1);
  }
  static fromExternalReference(node, ref) {
    return new DynamicValue(node, ref, 2);
  }
  static fromUnsupportedSyntax(node) {
    return new DynamicValue(node, void 0, 3);
  }
  static fromUnknownIdentifier(node) {
    return new DynamicValue(node, void 0, 4);
  }
  static fromInvalidExpressionType(node, value) {
    return new DynamicValue(node, value, 5);
  }
  static fromComplexFunctionCall(node, fn) {
    return new DynamicValue(node, fn, 6);
  }
  static fromDynamicType(node) {
    return new DynamicValue(node, void 0, 7);
  }
  static fromSyntheticInput(node, value) {
    return new DynamicValue(node, value, 8);
  }
  static fromUnknown(node) {
    return new DynamicValue(node, void 0, 9);
  }
  isFromDynamicInput() {
    return this.code === 0;
  }
  isFromDynamicString() {
    return this.code === 1;
  }
  isFromExternalReference() {
    return this.code === 2;
  }
  isFromUnsupportedSyntax() {
    return this.code === 3;
  }
  isFromUnknownIdentifier() {
    return this.code === 4;
  }
  isFromInvalidExpressionType() {
    return this.code === 5;
  }
  isFromComplexFunctionCall() {
    return this.code === 6;
  }
  isFromDynamicType() {
    return this.code === 7;
  }
  isFromUnknown() {
    return this.code === 9;
  }
  accept(visitor) {
    switch (this.code) {
      case 0:
        return visitor.visitDynamicInput(this);
      case 1:
        return visitor.visitDynamicString(this);
      case 2:
        return visitor.visitExternalReference(this);
      case 3:
        return visitor.visitUnsupportedSyntax(this);
      case 4:
        return visitor.visitUnknownIdentifier(this);
      case 5:
        return visitor.visitInvalidExpressionType(this);
      case 6:
        return visitor.visitComplexFunctionCall(this);
      case 7:
        return visitor.visitDynamicType(this);
      case 8:
        return visitor.visitSyntheticInput(this);
      case 9:
        return visitor.visitUnknown(this);
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.mjs
import ts2 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/result.mjs
var ResolvedModule = class {
  exports;
  evaluate;
  constructor(exports, evaluate) {
    this.exports = exports;
    this.evaluate = evaluate;
  }
  getExport(name) {
    if (!this.exports.has(name)) {
      return void 0;
    }
    return this.evaluate(this.exports.get(name));
  }
  getExports() {
    const map = /* @__PURE__ */ new Map();
    this.exports.forEach((decl, name) => {
      map.set(name, this.evaluate(decl));
    });
    return map;
  }
};
var EnumValue = class {
  enumRef;
  name;
  resolved;
  constructor(enumRef, name, resolved) {
    this.enumRef = enumRef;
    this.name = name;
    this.resolved = resolved;
  }
};
var KnownFn = class {
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/builtin.mjs
var ArraySliceBuiltinFn = class extends KnownFn {
  lhs;
  constructor(lhs) {
    super();
    this.lhs = lhs;
  }
  evaluate(node, args) {
    if (args.length === 0) {
      return this.lhs;
    } else {
      return DynamicValue.fromUnknown(node);
    }
  }
};
var ArrayConcatBuiltinFn = class extends KnownFn {
  lhs;
  constructor(lhs) {
    super();
    this.lhs = lhs;
  }
  evaluate(node, args) {
    const result = [...this.lhs];
    for (const arg of args) {
      if (arg instanceof DynamicValue) {
        result.push(DynamicValue.fromDynamicInput(node, arg));
      } else if (Array.isArray(arg)) {
        result.push(...arg);
      } else {
        result.push(arg);
      }
    }
    return result;
  }
};
var StringConcatBuiltinFn = class extends KnownFn {
  lhs;
  constructor(lhs) {
    super();
    this.lhs = lhs;
  }
  evaluate(node, args) {
    let result = this.lhs;
    for (const arg of args) {
      const resolved = arg instanceof EnumValue ? arg.resolved : arg;
      if (typeof resolved === "string" || typeof resolved === "number" || typeof resolved === "boolean" || resolved == null) {
        result = result.concat(resolved);
      } else {
        return DynamicValue.fromUnknown(node);
      }
    }
    return result;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/synthetic.mjs
var SyntheticValue = class {
  value;
  constructor(value) {
    this.value = value;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.mjs
function literalBinaryOp(op) {
  return { op, literal: true };
}
function referenceBinaryOp(op) {
  return { op, literal: false };
}
var BINARY_OPERATORS = /* @__PURE__ */ new Map([
  [ts2.SyntaxKind.PlusToken, literalBinaryOp((a, b) => a + b)],
  [ts2.SyntaxKind.MinusToken, literalBinaryOp((a, b) => a - b)],
  [ts2.SyntaxKind.AsteriskToken, literalBinaryOp((a, b) => a * b)],
  [ts2.SyntaxKind.SlashToken, literalBinaryOp((a, b) => a / b)],
  [ts2.SyntaxKind.PercentToken, literalBinaryOp((a, b) => a % b)],
  [ts2.SyntaxKind.AmpersandToken, literalBinaryOp((a, b) => a & b)],
  [ts2.SyntaxKind.BarToken, literalBinaryOp((a, b) => a | b)],
  [ts2.SyntaxKind.CaretToken, literalBinaryOp((a, b) => a ^ b)],
  [ts2.SyntaxKind.LessThanToken, literalBinaryOp((a, b) => a < b)],
  [ts2.SyntaxKind.LessThanEqualsToken, literalBinaryOp((a, b) => a <= b)],
  [ts2.SyntaxKind.GreaterThanToken, literalBinaryOp((a, b) => a > b)],
  [ts2.SyntaxKind.GreaterThanEqualsToken, literalBinaryOp((a, b) => a >= b)],
  [ts2.SyntaxKind.EqualsEqualsToken, literalBinaryOp((a, b) => a == b)],
  [ts2.SyntaxKind.EqualsEqualsEqualsToken, literalBinaryOp((a, b) => a === b)],
  [ts2.SyntaxKind.ExclamationEqualsToken, literalBinaryOp((a, b) => a != b)],
  [ts2.SyntaxKind.ExclamationEqualsEqualsToken, literalBinaryOp((a, b) => a !== b)],
  [ts2.SyntaxKind.LessThanLessThanToken, literalBinaryOp((a, b) => a << b)],
  [ts2.SyntaxKind.GreaterThanGreaterThanToken, literalBinaryOp((a, b) => a >> b)],
  [ts2.SyntaxKind.GreaterThanGreaterThanGreaterThanToken, literalBinaryOp((a, b) => a >>> b)],
  [ts2.SyntaxKind.AsteriskAsteriskToken, literalBinaryOp((a, b) => Math.pow(a, b))],
  [ts2.SyntaxKind.AmpersandAmpersandToken, referenceBinaryOp((a, b) => a && b)],
  [ts2.SyntaxKind.BarBarToken, referenceBinaryOp((a, b) => a || b)]
]);
var UNARY_OPERATORS = /* @__PURE__ */ new Map([
  [ts2.SyntaxKind.TildeToken, (a) => ~a],
  [ts2.SyntaxKind.MinusToken, (a) => -a],
  [ts2.SyntaxKind.PlusToken, (a) => +a],
  [ts2.SyntaxKind.ExclamationToken, (a) => !a]
]);
var StaticInterpreter = class {
  host;
  checker;
  dependencyTracker;
  constructor(host, checker, dependencyTracker) {
    this.host = host;
    this.checker = checker;
    this.dependencyTracker = dependencyTracker;
  }
  visit(node, context) {
    return this.visitExpression(node, context);
  }
  visitExpression(node, context) {
    let result;
    if (node.kind === ts2.SyntaxKind.TrueKeyword) {
      return true;
    } else if (node.kind === ts2.SyntaxKind.FalseKeyword) {
      return false;
    } else if (node.kind === ts2.SyntaxKind.NullKeyword) {
      return null;
    } else if (ts2.isStringLiteral(node)) {
      return node.text;
    } else if (ts2.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    } else if (ts2.isTemplateExpression(node)) {
      result = this.visitTemplateExpression(node, context);
    } else if (ts2.isNumericLiteral(node)) {
      return parseFloat(node.text);
    } else if (ts2.isObjectLiteralExpression(node)) {
      result = this.visitObjectLiteralExpression(node, context);
    } else if (ts2.isIdentifier(node)) {
      result = this.visitIdentifier(node, context);
    } else if (ts2.isPropertyAccessExpression(node)) {
      result = this.visitPropertyAccessExpression(node, context);
    } else if (ts2.isCallExpression(node)) {
      result = this.visitCallExpression(node, context);
    } else if (ts2.isConditionalExpression(node)) {
      result = this.visitConditionalExpression(node, context);
    } else if (ts2.isPrefixUnaryExpression(node)) {
      result = this.visitPrefixUnaryExpression(node, context);
    } else if (ts2.isBinaryExpression(node)) {
      result = this.visitBinaryExpression(node, context);
    } else if (ts2.isArrayLiteralExpression(node)) {
      result = this.visitArrayLiteralExpression(node, context);
    } else if (ts2.isParenthesizedExpression(node)) {
      result = this.visitParenthesizedExpression(node, context);
    } else if (ts2.isElementAccessExpression(node)) {
      result = this.visitElementAccessExpression(node, context);
    } else if (ts2.isAsExpression(node)) {
      result = this.visitExpression(node.expression, context);
    } else if (ts2.isNonNullExpression(node)) {
      result = this.visitExpression(node.expression, context);
    } else if (this.host.isClass(node)) {
      result = this.visitDeclaration(node, context);
    } else {
      return DynamicValue.fromUnsupportedSyntax(node);
    }
    if (result instanceof DynamicValue && result.node !== node) {
      return DynamicValue.fromDynamicInput(node, result);
    }
    return result;
  }
  visitArrayLiteralExpression(node, context) {
    const array = [];
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i];
      if (ts2.isSpreadElement(element)) {
        array.push(...this.visitSpreadElement(element, context));
      } else {
        array.push(this.visitExpression(element, context));
      }
    }
    return array;
  }
  visitObjectLiteralExpression(node, context) {
    const map = /* @__PURE__ */ new Map();
    for (let i = 0; i < node.properties.length; i++) {
      const property = node.properties[i];
      if (ts2.isPropertyAssignment(property)) {
        const name = this.stringNameFromPropertyName(property.name, context);
        if (name === void 0) {
          return DynamicValue.fromDynamicInput(node, DynamicValue.fromDynamicString(property.name));
        }
        map.set(name, this.visitExpression(property.initializer, context));
      } else if (ts2.isShorthandPropertyAssignment(property)) {
        const symbol = this.checker.getShorthandAssignmentValueSymbol(property);
        if (symbol === void 0 || symbol.valueDeclaration === void 0) {
          map.set(property.name.text, DynamicValue.fromUnknown(property));
        } else {
          map.set(property.name.text, this.visitDeclaration(symbol.valueDeclaration, context));
        }
      } else if (ts2.isSpreadAssignment(property)) {
        const spread = this.visitExpression(property.expression, context);
        if (spread instanceof DynamicValue) {
          return DynamicValue.fromDynamicInput(node, spread);
        } else if (spread instanceof Map) {
          spread.forEach((value, key) => map.set(key, value));
        } else if (spread instanceof ResolvedModule) {
          spread.getExports().forEach((value, key) => map.set(key, value));
        } else {
          return DynamicValue.fromDynamicInput(node, DynamicValue.fromInvalidExpressionType(property, spread));
        }
      } else {
        return DynamicValue.fromUnknown(node);
      }
    }
    return map;
  }
  visitTemplateExpression(node, context) {
    const pieces = [node.head.text];
    for (let i = 0; i < node.templateSpans.length; i++) {
      const span = node.templateSpans[i];
      const value = literal(this.visit(span.expression, context), () => DynamicValue.fromDynamicString(span.expression));
      if (value instanceof DynamicValue) {
        return DynamicValue.fromDynamicInput(node, value);
      }
      pieces.push(`${value}`, span.literal.text);
    }
    return pieces.join("");
  }
  visitIdentifier(node, context) {
    const decl = this.host.getDeclarationOfIdentifier(node);
    if (decl === null) {
      if (ts2.identifierToKeywordKind(node) === ts2.SyntaxKind.UndefinedKeyword) {
        return void 0;
      } else {
        if (this.dependencyTracker !== null && this.host.getImportOfIdentifier(node) !== null) {
          this.dependencyTracker.recordDependencyAnalysisFailure(context.originatingFile);
        }
        return DynamicValue.fromUnknownIdentifier(node);
      }
    }
    const declContext = { ...context, ...joinModuleContext(context, node, decl) };
    const result = this.visitDeclaration(decl.node, declContext);
    if (result instanceof Reference) {
      if (!result.synthetic) {
        result.addIdentifier(node);
      }
    } else if (result instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, result);
    }
    return result;
  }
  visitDeclaration(node, context) {
    if (this.dependencyTracker !== null) {
      this.dependencyTracker.addDependency(context.originatingFile, node.getSourceFile());
    }
    if (this.host.isClass(node)) {
      return this.getReference(node, context);
    } else if (ts2.isVariableDeclaration(node)) {
      return this.visitVariableDeclaration(node, context);
    } else if (ts2.isParameter(node) && context.scope.has(node)) {
      return context.scope.get(node);
    } else if (ts2.isExportAssignment(node)) {
      return this.visitExpression(node.expression, context);
    } else if (ts2.isEnumDeclaration(node)) {
      return this.visitEnumDeclaration(node, context);
    } else if (ts2.isSourceFile(node)) {
      return this.visitSourceFile(node, context);
    } else if (ts2.isBindingElement(node)) {
      return this.visitBindingElement(node, context);
    } else {
      return this.getReference(node, context);
    }
  }
  visitVariableDeclaration(node, context) {
    const value = this.host.getVariableValue(node);
    if (value !== null) {
      return this.visitExpression(value, context);
    } else if (isVariableDeclarationDeclared(node)) {
      if (node.type !== void 0) {
        const evaluatedType = this.visitType(node.type, context);
        if (!(evaluatedType instanceof DynamicValue)) {
          return evaluatedType;
        }
      }
      return this.getReference(node, context);
    } else {
      return void 0;
    }
  }
  visitEnumDeclaration(node, context) {
    const enumRef = this.getReference(node, context);
    const map = /* @__PURE__ */ new Map();
    node.members.forEach((member, index) => {
      const name = this.stringNameFromPropertyName(member.name, context);
      if (name !== void 0) {
        const resolved = member.initializer ? this.visit(member.initializer, context) : index;
        map.set(name, new EnumValue(enumRef, name, resolved));
      }
    });
    return map;
  }
  visitElementAccessExpression(node, context) {
    const lhs = this.visitExpression(node.expression, context);
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    }
    const rhs = this.visitExpression(node.argumentExpression, context);
    if (rhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, rhs);
    }
    if (typeof rhs !== "string" && typeof rhs !== "number") {
      return DynamicValue.fromInvalidExpressionType(node, rhs);
    }
    return this.accessHelper(node, lhs, rhs, context);
  }
  visitPropertyAccessExpression(node, context) {
    const lhs = this.visitExpression(node.expression, context);
    const rhs = node.name.text;
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    }
    return this.accessHelper(node, lhs, rhs, context);
  }
  visitSourceFile(node, context) {
    const declarations = this.host.getExportsOfModule(node);
    if (declarations === null) {
      return DynamicValue.fromUnknown(node);
    }
    return new ResolvedModule(declarations, (decl) => {
      const declContext = {
        ...context,
        ...joinModuleContext(context, node, decl)
      };
      return this.visitDeclaration(decl.node, declContext);
    });
  }
  accessHelper(node, lhs, rhs, context) {
    const strIndex = `${rhs}`;
    if (lhs instanceof Map) {
      if (lhs.has(strIndex)) {
        return lhs.get(strIndex);
      } else {
        return void 0;
      }
    } else if (lhs instanceof ResolvedModule) {
      return lhs.getExport(strIndex);
    } else if (Array.isArray(lhs)) {
      if (rhs === "length") {
        return lhs.length;
      } else if (rhs === "slice") {
        return new ArraySliceBuiltinFn(lhs);
      } else if (rhs === "concat") {
        return new ArrayConcatBuiltinFn(lhs);
      }
      if (typeof rhs !== "number" || !Number.isInteger(rhs)) {
        return DynamicValue.fromInvalidExpressionType(node, rhs);
      }
      return lhs[rhs];
    } else if (typeof lhs === "string" && rhs === "concat") {
      return new StringConcatBuiltinFn(lhs);
    } else if (lhs instanceof Reference) {
      const ref = lhs.node;
      if (this.host.isClass(ref)) {
        const module = owningModule(context, lhs.bestGuessOwningModule);
        let value = void 0;
        const member = this.host.getMembersOfClass(ref).find((member2) => member2.isStatic && member2.name === strIndex);
        if (member !== void 0) {
          if (member.value !== null) {
            value = this.visitExpression(member.value, context);
          } else if (member.implementation !== null) {
            value = new Reference(member.implementation, module);
          } else if (member.node) {
            value = new Reference(member.node, module);
          }
        }
        return value;
      } else if (isDeclaration(ref)) {
        return DynamicValue.fromDynamicInput(node, DynamicValue.fromExternalReference(ref, lhs));
      }
    } else if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    } else if (lhs instanceof SyntheticValue) {
      return DynamicValue.fromSyntheticInput(node, lhs);
    }
    return DynamicValue.fromUnknown(node);
  }
  visitCallExpression(node, context) {
    const lhs = this.visitExpression(node.expression, context);
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    }
    if (lhs instanceof KnownFn) {
      return lhs.evaluate(node, this.evaluateFunctionArguments(node, context));
    }
    if (!(lhs instanceof Reference)) {
      return DynamicValue.fromInvalidExpressionType(node.expression, lhs);
    }
    const fn = this.host.getDefinitionOfFunction(lhs.node);
    if (fn === null) {
      return DynamicValue.fromInvalidExpressionType(node.expression, lhs);
    }
    if (!isFunctionOrMethodReference(lhs)) {
      return DynamicValue.fromInvalidExpressionType(node.expression, lhs);
    }
    const resolveFfrExpr = (expr) => {
      let contextExtension = {};
      if (fn.body === null && expr.getSourceFile() !== node.expression.getSourceFile() && lhs.bestGuessOwningModule !== null) {
        contextExtension = {
          absoluteModuleName: lhs.bestGuessOwningModule.specifier,
          resolutionContext: lhs.bestGuessOwningModule.resolutionContext
        };
      }
      return this.visitFfrExpression(expr, { ...context, ...contextExtension });
    };
    if (fn.body === null && context.foreignFunctionResolver !== void 0) {
      const unresolvable = DynamicValue.fromDynamicInput(node, DynamicValue.fromExternalReference(node.expression, lhs));
      return context.foreignFunctionResolver(lhs, node, resolveFfrExpr, unresolvable);
    }
    const res = this.visitFunctionBody(node, fn, context);
    if (res instanceof DynamicValue && context.foreignFunctionResolver !== void 0) {
      const unresolvable = DynamicValue.fromComplexFunctionCall(node, fn);
      return context.foreignFunctionResolver(lhs, node, resolveFfrExpr, unresolvable);
    }
    return res;
  }
  visitFfrExpression(expr, context) {
    const res = this.visitExpression(expr, context);
    if (res instanceof Reference) {
      res.synthetic = true;
    }
    return res;
  }
  visitFunctionBody(node, fn, context) {
    if (fn.body === null) {
      return DynamicValue.fromUnknown(node);
    } else if (fn.body.length !== 1 || !ts2.isReturnStatement(fn.body[0])) {
      return DynamicValue.fromComplexFunctionCall(node, fn);
    }
    const ret = fn.body[0];
    const args = this.evaluateFunctionArguments(node, context);
    const newScope = /* @__PURE__ */ new Map();
    const calleeContext = { ...context, scope: newScope };
    fn.parameters.forEach((param, index) => {
      let arg = args[index];
      if (param.node.dotDotDotToken !== void 0) {
        arg = args.slice(index);
      }
      if (arg === void 0 && param.initializer !== null) {
        arg = this.visitExpression(param.initializer, calleeContext);
      }
      newScope.set(param.node, arg);
    });
    return ret.expression !== void 0 ? this.visitExpression(ret.expression, calleeContext) : void 0;
  }
  visitConditionalExpression(node, context) {
    const condition = this.visitExpression(node.condition, context);
    if (condition instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, condition);
    }
    if (condition) {
      return this.visitExpression(node.whenTrue, context);
    } else {
      return this.visitExpression(node.whenFalse, context);
    }
  }
  visitPrefixUnaryExpression(node, context) {
    const operatorKind = node.operator;
    if (!UNARY_OPERATORS.has(operatorKind)) {
      return DynamicValue.fromUnsupportedSyntax(node);
    }
    const op = UNARY_OPERATORS.get(operatorKind);
    const value = this.visitExpression(node.operand, context);
    if (value instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, value);
    } else {
      return op(value);
    }
  }
  visitBinaryExpression(node, context) {
    const tokenKind = node.operatorToken.kind;
    if (!BINARY_OPERATORS.has(tokenKind)) {
      return DynamicValue.fromUnsupportedSyntax(node);
    }
    const opRecord = BINARY_OPERATORS.get(tokenKind);
    let lhs, rhs;
    if (opRecord.literal) {
      lhs = literal(this.visitExpression(node.left, context), (value) => DynamicValue.fromInvalidExpressionType(node.left, value));
      rhs = literal(this.visitExpression(node.right, context), (value) => DynamicValue.fromInvalidExpressionType(node.right, value));
    } else {
      lhs = this.visitExpression(node.left, context);
      rhs = this.visitExpression(node.right, context);
    }
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    } else if (rhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, rhs);
    } else {
      return opRecord.op(lhs, rhs);
    }
  }
  visitParenthesizedExpression(node, context) {
    return this.visitExpression(node.expression, context);
  }
  evaluateFunctionArguments(node, context) {
    const args = [];
    for (const arg of node.arguments) {
      if (ts2.isSpreadElement(arg)) {
        args.push(...this.visitSpreadElement(arg, context));
      } else {
        args.push(this.visitExpression(arg, context));
      }
    }
    return args;
  }
  visitSpreadElement(node, context) {
    const spread = this.visitExpression(node.expression, context);
    if (spread instanceof DynamicValue) {
      return [DynamicValue.fromDynamicInput(node, spread)];
    } else if (!Array.isArray(spread)) {
      return [DynamicValue.fromInvalidExpressionType(node, spread)];
    } else {
      return spread;
    }
  }
  visitBindingElement(node, context) {
    const path = [];
    let closestDeclaration = node;
    while (ts2.isBindingElement(closestDeclaration) || ts2.isArrayBindingPattern(closestDeclaration) || ts2.isObjectBindingPattern(closestDeclaration)) {
      if (ts2.isBindingElement(closestDeclaration)) {
        path.unshift(closestDeclaration);
      }
      closestDeclaration = closestDeclaration.parent;
    }
    if (!ts2.isVariableDeclaration(closestDeclaration) || closestDeclaration.initializer === void 0) {
      return DynamicValue.fromUnknown(node);
    }
    let value = this.visit(closestDeclaration.initializer, context);
    for (const element of path) {
      let key;
      if (ts2.isArrayBindingPattern(element.parent)) {
        key = element.parent.elements.indexOf(element);
      } else {
        const name = element.propertyName || element.name;
        if (ts2.isIdentifier(name)) {
          key = name.text;
        } else {
          return DynamicValue.fromUnknown(element);
        }
      }
      value = this.accessHelper(element, value, key, context);
      if (value instanceof DynamicValue) {
        return value;
      }
    }
    return value;
  }
  stringNameFromPropertyName(node, context) {
    if (ts2.isIdentifier(node) || ts2.isStringLiteral(node) || ts2.isNumericLiteral(node)) {
      return node.text;
    } else if (ts2.isComputedPropertyName(node)) {
      const literal3 = this.visitExpression(node.expression, context);
      return typeof literal3 === "string" ? literal3 : void 0;
    } else {
      return void 0;
    }
  }
  getReference(node, context) {
    return new Reference(node, owningModule(context));
  }
  visitType(node, context) {
    if (ts2.isLiteralTypeNode(node)) {
      return this.visitExpression(node.literal, context);
    } else if (ts2.isTupleTypeNode(node)) {
      return this.visitTupleType(node, context);
    } else if (ts2.isNamedTupleMember(node)) {
      return this.visitType(node.type, context);
    } else if (ts2.isTypeOperatorNode(node) && node.operator === ts2.SyntaxKind.ReadonlyKeyword) {
      return this.visitType(node.type, context);
    } else if (ts2.isTypeQueryNode(node)) {
      return this.visitTypeQuery(node, context);
    }
    return DynamicValue.fromDynamicType(node);
  }
  visitTupleType(node, context) {
    const res = [];
    for (const elem of node.elements) {
      res.push(this.visitType(elem, context));
    }
    return res;
  }
  visitTypeQuery(node, context) {
    if (!ts2.isIdentifier(node.exprName)) {
      return DynamicValue.fromUnknown(node);
    }
    const decl = this.host.getDeclarationOfIdentifier(node.exprName);
    if (decl === null) {
      return DynamicValue.fromUnknownIdentifier(node.exprName);
    }
    const declContext = { ...context, ...joinModuleContext(context, node, decl) };
    return this.visitDeclaration(decl.node, declContext);
  }
};
function isFunctionOrMethodReference(ref) {
  return ts2.isFunctionDeclaration(ref.node) || ts2.isMethodDeclaration(ref.node) || ts2.isFunctionExpression(ref.node);
}
function literal(value, reject) {
  if (value instanceof EnumValue) {
    value = value.resolved;
  }
  if (value instanceof DynamicValue || value === null || value === void 0 || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return reject(value);
}
function isVariableDeclarationDeclared(node) {
  if (node.parent === void 0 || !ts2.isVariableDeclarationList(node.parent)) {
    return false;
  }
  const declList = node.parent;
  if (declList.parent === void 0 || !ts2.isVariableStatement(declList.parent)) {
    return false;
  }
  const varStmt = declList.parent;
  const modifiers = ts2.getModifiers(varStmt);
  return modifiers !== void 0 && modifiers.some((mod) => mod.kind === ts2.SyntaxKind.DeclareKeyword);
}
var EMPTY = {};
function joinModuleContext(existing, node, decl) {
  if (typeof decl.viaModule === "string" && decl.viaModule !== existing.absoluteModuleName) {
    return {
      absoluteModuleName: decl.viaModule,
      resolutionContext: node.getSourceFile().fileName
    };
  } else {
    return EMPTY;
  }
}
function owningModule(context, override = null) {
  let specifier = context.absoluteModuleName;
  if (override !== null) {
    specifier = override.specifier;
  }
  if (specifier !== null) {
    return {
      specifier,
      resolutionContext: context.resolutionContext
    };
  } else {
    return null;
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interface.mjs
var PartialEvaluator = class {
  host;
  checker;
  dependencyTracker;
  constructor(host, checker, dependencyTracker) {
    this.host = host;
    this.checker = checker;
    this.dependencyTracker = dependencyTracker;
  }
  evaluate(expr, foreignFunctionResolver) {
    const interpreter = new StaticInterpreter(this.host, this.checker, this.dependencyTracker);
    const sourceFile = expr.getSourceFile();
    return interpreter.visit(expr, {
      originatingFile: sourceFile,
      absoluteModuleName: null,
      resolutionContext: sourceFile.fileName,
      scope: /* @__PURE__ */ new Map(),
      foreignFunctionResolver
    });
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/partial_evaluator/src/diagnostics.mjs
import ts3 from "typescript";
function describeResolvedType(value, maxDepth = 1) {
  var _a, _b;
  if (value === null) {
    return "null";
  } else if (value === void 0) {
    return "undefined";
  } else if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return typeof value;
  } else if (value instanceof Map) {
    if (maxDepth === 0) {
      return "object";
    }
    const entries = Array.from(value.entries()).map(([key, v]) => {
      return `${quoteKey(key)}: ${describeResolvedType(v, maxDepth - 1)}`;
    });
    return entries.length > 0 ? `{ ${entries.join("; ")} }` : "{}";
  } else if (value instanceof ResolvedModule) {
    return "(module)";
  } else if (value instanceof EnumValue) {
    return (_a = value.enumRef.debugName) != null ? _a : "(anonymous)";
  } else if (value instanceof Reference) {
    return (_b = value.debugName) != null ? _b : "(anonymous)";
  } else if (Array.isArray(value)) {
    if (maxDepth === 0) {
      return "Array";
    }
    return `[${value.map((v) => describeResolvedType(v, maxDepth - 1)).join(", ")}]`;
  } else if (value instanceof DynamicValue) {
    return "(not statically analyzable)";
  } else if (value instanceof KnownFn) {
    return "Function";
  } else {
    return "unknown";
  }
}
function quoteKey(key) {
  if (/^[a-z0-9_]+$/i.test(key)) {
    return key;
  } else {
    return `'${key.replace(/'/g, "\\'")}'`;
  }
}
function traceDynamicValue(node, value) {
  return value.accept(new TraceDynamicValueVisitor(node));
}
var TraceDynamicValueVisitor = class {
  node;
  currentContainerNode = null;
  constructor(node) {
    this.node = node;
  }
  visitDynamicInput(value) {
    const trace = value.reason.accept(this);
    if (this.shouldTrace(value.node)) {
      const info = makeRelatedInformation(value.node, "Unable to evaluate this expression statically.");
      trace.unshift(info);
    }
    return trace;
  }
  visitSyntheticInput(value) {
    return [makeRelatedInformation(value.node, "Unable to evaluate this expression further.")];
  }
  visitDynamicString(value) {
    return [
      makeRelatedInformation(value.node, "A string value could not be determined statically.")
    ];
  }
  visitExternalReference(value) {
    const name = value.reason.debugName;
    const description = name !== null ? `'${name}'` : "an anonymous declaration";
    return [
      makeRelatedInformation(value.node, `A value for ${description} cannot be determined statically, as it is an external declaration.`)
    ];
  }
  visitComplexFunctionCall(value) {
    return [
      makeRelatedInformation(value.node, "Unable to evaluate function call of complex function. A function must have exactly one return statement."),
      makeRelatedInformation(value.reason.node, "Function is declared here.")
    ];
  }
  visitInvalidExpressionType(value) {
    return [makeRelatedInformation(value.node, "Unable to evaluate an invalid expression.")];
  }
  visitUnknown(value) {
    return [makeRelatedInformation(value.node, "Unable to evaluate statically.")];
  }
  visitUnknownIdentifier(value) {
    return [makeRelatedInformation(value.node, "Unknown reference.")];
  }
  visitDynamicType(value) {
    return [makeRelatedInformation(value.node, "Dynamic type.")];
  }
  visitUnsupportedSyntax(value) {
    return [makeRelatedInformation(value.node, "This syntax is not supported.")];
  }
  shouldTrace(node) {
    if (node === this.node) {
      return false;
    }
    const container = getContainerNode(node);
    if (container === this.currentContainerNode) {
      return false;
    }
    this.currentContainerNode = container;
    return true;
  }
};
function getContainerNode(node) {
  let currentNode = node;
  while (currentNode !== void 0) {
    switch (currentNode.kind) {
      case ts3.SyntaxKind.ExpressionStatement:
      case ts3.SyntaxKind.VariableStatement:
      case ts3.SyntaxKind.ReturnStatement:
      case ts3.SyntaxKind.IfStatement:
      case ts3.SyntaxKind.SwitchStatement:
      case ts3.SyntaxKind.DoStatement:
      case ts3.SyntaxKind.WhileStatement:
      case ts3.SyntaxKind.ForStatement:
      case ts3.SyntaxKind.ForInStatement:
      case ts3.SyntaxKind.ForOfStatement:
      case ts3.SyntaxKind.ContinueStatement:
      case ts3.SyntaxKind.BreakStatement:
      case ts3.SyntaxKind.ThrowStatement:
      case ts3.SyntaxKind.ObjectBindingPattern:
      case ts3.SyntaxKind.ArrayBindingPattern:
        return currentNode;
    }
    currentNode = currentNode.parent;
  }
  return node.getSourceFile();
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/api/checker.mjs
var OptimizeFor;
(function(OptimizeFor2) {
  OptimizeFor2[OptimizeFor2["SingleFile"] = 0] = "SingleFile";
  OptimizeFor2[OptimizeFor2["WholeProgram"] = 1] = "WholeProgram";
})(OptimizeFor || (OptimizeFor = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/api/scope.mjs
var PotentialImportKind;
(function(PotentialImportKind2) {
  PotentialImportKind2[PotentialImportKind2["NgModule"] = 0] = "NgModule";
  PotentialImportKind2[PotentialImportKind2["Standalone"] = 1] = "Standalone";
})(PotentialImportKind || (PotentialImportKind = {}));
var PotentialImportMode;
(function(PotentialImportMode2) {
  PotentialImportMode2[PotentialImportMode2["Normal"] = 0] = "Normal";
  PotentialImportMode2[PotentialImportMode2["ForceDirect"] = 1] = "ForceDirect";
})(PotentialImportMode || (PotentialImportMode = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/api/completion.mjs
var CompletionKind;
(function(CompletionKind2) {
  CompletionKind2[CompletionKind2["Reference"] = 0] = "Reference";
  CompletionKind2[CompletionKind2["Variable"] = 1] = "Variable";
  CompletionKind2[CompletionKind2["LetDeclaration"] = 2] = "LetDeclaration";
})(CompletionKind || (CompletionKind = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/api/symbols.mjs
var SymbolKind;
(function(SymbolKind2) {
  SymbolKind2[SymbolKind2["Input"] = 0] = "Input";
  SymbolKind2[SymbolKind2["Output"] = 1] = "Output";
  SymbolKind2[SymbolKind2["Binding"] = 2] = "Binding";
  SymbolKind2[SymbolKind2["Reference"] = 3] = "Reference";
  SymbolKind2[SymbolKind2["Variable"] = 4] = "Variable";
  SymbolKind2[SymbolKind2["Directive"] = 5] = "Directive";
  SymbolKind2[SymbolKind2["Element"] = 6] = "Element";
  SymbolKind2[SymbolKind2["Template"] = 7] = "Template";
  SymbolKind2[SymbolKind2["Expression"] = 8] = "Expression";
  SymbolKind2[SymbolKind2["DomBinding"] = 9] = "DomBinding";
  SymbolKind2[SymbolKind2["Pipe"] = 10] = "Pipe";
  SymbolKind2[SymbolKind2["LetDeclaration"] = 11] = "LetDeclaration";
})(SymbolKind || (SymbolKind = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/di.mjs
import { LiteralExpr, WrappedNodeExpr as WrappedNodeExpr2 } from "@angular/compiler";
import ts4 from "typescript";
function getConstructorDependencies(clazz, reflector, isCore) {
  const deps = [];
  const errors = [];
  let ctorParams = reflector.getConstructorParameters(clazz);
  if (ctorParams === null) {
    if (reflector.hasBaseClass(clazz)) {
      return null;
    } else {
      ctorParams = [];
    }
  }
  ctorParams.forEach((param, idx) => {
    let token = valueReferenceToExpression(param.typeValueReference);
    let attributeNameType = null;
    let optional = false, self = false, skipSelf = false, host = false;
    (param.decorators || []).filter((dec) => isCore || isAngularCore(dec)).forEach((dec) => {
      const name = isCore || dec.import === null ? dec.name : dec.import.name;
      if (name === "Inject") {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, dec.node, `Unexpected number of arguments to @Inject().`);
        }
        token = new WrappedNodeExpr2(dec.args[0]);
      } else if (name === "Optional") {
        optional = true;
      } else if (name === "SkipSelf") {
        skipSelf = true;
      } else if (name === "Self") {
        self = true;
      } else if (name === "Host") {
        host = true;
      } else if (name === "Attribute") {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, dec.node, `Unexpected number of arguments to @Attribute().`);
        }
        const attributeName = dec.args[0];
        token = new WrappedNodeExpr2(attributeName);
        if (ts4.isStringLiteralLike(attributeName)) {
          attributeNameType = new LiteralExpr(attributeName.text);
        } else {
          attributeNameType = new WrappedNodeExpr2(ts4.factory.createKeywordTypeNode(ts4.SyntaxKind.UnknownKeyword));
        }
      } else {
        throw new FatalDiagnosticError(ErrorCode.DECORATOR_UNEXPECTED, dec.node, `Unexpected decorator ${name} on parameter.`);
      }
    });
    if (token === null) {
      if (param.typeValueReference.kind !== 2) {
        throw new Error("Illegal state: expected value reference to be unavailable if no token is present");
      }
      errors.push({
        index: idx,
        param,
        reason: param.typeValueReference.reason
      });
    } else {
      deps.push({ token, attributeNameType, optional, self, skipSelf, host });
    }
  });
  if (errors.length === 0) {
    return { deps };
  } else {
    return { deps: null, errors };
  }
}
function unwrapConstructorDependencies(deps) {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    return deps.deps;
  } else {
    return "invalid";
  }
}
function getValidConstructorDependencies(clazz, reflector, isCore) {
  return validateConstructorDependencies(clazz, getConstructorDependencies(clazz, reflector, isCore));
}
function validateConstructorDependencies(clazz, deps) {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    return deps.deps;
  } else {
    const error = deps.errors[0];
    throw createUnsuitableInjectionTokenError(clazz, error);
  }
}
function createUnsuitableInjectionTokenError(clazz, error) {
  const { param, index, reason } = error;
  let chainMessage = void 0;
  let hints = void 0;
  switch (reason.kind) {
    case 5:
      chainMessage = "Consider using the @Inject decorator to specify an injection token.";
      hints = [
        makeRelatedInformation(reason.typeNode, "This type is not supported as injection token.")
      ];
      break;
    case 1:
      chainMessage = "Consider using the @Inject decorator to specify an injection token.";
      hints = [
        makeRelatedInformation(reason.typeNode, "This type does not have a value, so it cannot be used as injection token.")
      ];
      if (reason.decl !== null) {
        hints.push(makeRelatedInformation(reason.decl, "The type is declared here."));
      }
      break;
    case 2:
      chainMessage = "Consider changing the type-only import to a regular import, or use the @Inject decorator to specify an injection token.";
      hints = [
        makeRelatedInformation(reason.typeNode, "This type is imported using a type-only import, which prevents it from being usable as an injection token."),
        makeRelatedInformation(reason.node, "The type-only import occurs here.")
      ];
      break;
    case 4:
      chainMessage = "Consider using the @Inject decorator to specify an injection token.";
      hints = [
        makeRelatedInformation(reason.typeNode, "This type corresponds with a namespace, which cannot be used as injection token."),
        makeRelatedInformation(reason.importClause, "The namespace import occurs here.")
      ];
      break;
    case 3:
      chainMessage = "The type should reference a known declaration.";
      hints = [makeRelatedInformation(reason.typeNode, "This type could not be resolved.")];
      break;
    case 0:
      chainMessage = "Consider adding a type to the parameter or use the @Inject decorator to specify an injection token.";
      break;
  }
  const chain = {
    messageText: `No suitable injection token for parameter '${param.name || index}' of class '${clazz.name.text}'.`,
    category: ts4.DiagnosticCategory.Error,
    code: 0,
    next: [
      {
        messageText: chainMessage,
        category: ts4.DiagnosticCategory.Message,
        code: 0
      }
    ]
  };
  return new FatalDiagnosticError(ErrorCode.PARAM_MISSING_TOKEN, param.nameNode, chain, hints);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/diagnostics.mjs
import ts12 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/api.mjs
var MetaKind;
(function(MetaKind2) {
  MetaKind2[MetaKind2["Directive"] = 0] = "Directive";
  MetaKind2[MetaKind2["Pipe"] = 1] = "Pipe";
  MetaKind2[MetaKind2["NgModule"] = 2] = "NgModule";
})(MetaKind || (MetaKind = {}));
var MatchSource;
(function(MatchSource2) {
  MatchSource2[MatchSource2["Selector"] = 0] = "Selector";
  MatchSource2[MatchSource2["HostDirective"] = 1] = "HostDirective";
})(MatchSource || (MatchSource = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/dts.mjs
import ts6 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/property_mapping.mjs
var ClassPropertyMapping = class {
  forwardMap;
  reverseMap;
  constructor(forwardMap) {
    this.forwardMap = forwardMap;
    this.reverseMap = reverseMapFromForwardMap(forwardMap);
  }
  static empty() {
    return new ClassPropertyMapping(/* @__PURE__ */ new Map());
  }
  static fromMappedObject(obj) {
    const forwardMap = /* @__PURE__ */ new Map();
    for (const classPropertyName of Object.keys(obj)) {
      const value = obj[classPropertyName];
      let inputOrOutput;
      if (typeof value === "string") {
        inputOrOutput = {
          classPropertyName,
          bindingPropertyName: value,
          isSignal: false
        };
      } else {
        inputOrOutput = value;
      }
      forwardMap.set(classPropertyName, inputOrOutput);
    }
    return new ClassPropertyMapping(forwardMap);
  }
  static merge(a, b) {
    const forwardMap = new Map(a.forwardMap.entries());
    for (const [classPropertyName, inputOrOutput] of b.forwardMap) {
      forwardMap.set(classPropertyName, inputOrOutput);
    }
    return new ClassPropertyMapping(forwardMap);
  }
  get classPropertyNames() {
    return Array.from(this.forwardMap.keys());
  }
  get propertyNames() {
    return Array.from(this.reverseMap.keys());
  }
  hasBindingPropertyName(propertyName) {
    return this.reverseMap.has(propertyName);
  }
  getByBindingPropertyName(propertyName) {
    return this.reverseMap.has(propertyName) ? this.reverseMap.get(propertyName) : null;
  }
  getByClassPropertyName(classPropertyName) {
    return this.forwardMap.has(classPropertyName) ? this.forwardMap.get(classPropertyName) : null;
  }
  toDirectMappedObject() {
    const obj = {};
    for (const [classPropertyName, inputOrOutput] of this.forwardMap) {
      obj[classPropertyName] = inputOrOutput.bindingPropertyName;
    }
    return obj;
  }
  toJointMappedObject(transform) {
    const obj = {};
    for (const [classPropertyName, inputOrOutput] of this.forwardMap) {
      obj[classPropertyName] = transform(inputOrOutput);
    }
    return obj;
  }
  *[Symbol.iterator]() {
    for (const inputOrOutput of this.forwardMap.values()) {
      yield inputOrOutput;
    }
  }
};
function reverseMapFromForwardMap(forwardMap) {
  const reverseMap = /* @__PURE__ */ new Map();
  for (const [_, inputOrOutput] of forwardMap) {
    if (!reverseMap.has(inputOrOutput.bindingPropertyName)) {
      reverseMap.set(inputOrOutput.bindingPropertyName, []);
    }
    reverseMap.get(inputOrOutput.bindingPropertyName).push(inputOrOutput);
  }
  return reverseMap;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/util.mjs
import ts5 from "typescript";
function extractReferencesFromType(checker, def, bestGuessOwningModule) {
  if (!ts5.isTupleTypeNode(def)) {
    return { result: [], isIncomplete: false };
  }
  const result = [];
  let isIncomplete = false;
  for (const element of def.elements) {
    if (!ts5.isTypeQueryNode(element)) {
      throw new Error(`Expected TypeQueryNode: ${nodeDebugInfo(element)}`);
    }
    const ref = extraReferenceFromTypeQuery(checker, element, def, bestGuessOwningModule);
    if (ref === null) {
      isIncomplete = true;
    } else {
      result.push(ref);
    }
  }
  return { result, isIncomplete };
}
function extraReferenceFromTypeQuery(checker, typeNode, origin, bestGuessOwningModule) {
  const type = typeNode.exprName;
  let node;
  let from;
  try {
    const result = reflectTypeEntityToDeclaration(type, checker);
    node = result.node;
    from = result.from;
  } catch (e) {
    if (e instanceof TypeEntityToDeclarationError) {
      return null;
    }
    throw e;
  }
  if (!isNamedClassDeclaration(node)) {
    throw new Error(`Expected named ClassDeclaration: ${nodeDebugInfo(node)}`);
  }
  if (from !== null && !from.startsWith(".")) {
    return new Reference(node, {
      specifier: from,
      resolutionContext: origin.getSourceFile().fileName
    });
  }
  return new Reference(node, bestGuessOwningModule);
}
function readBooleanType(type) {
  if (!ts5.isLiteralTypeNode(type)) {
    return null;
  }
  switch (type.literal.kind) {
    case ts5.SyntaxKind.TrueKeyword:
      return true;
    case ts5.SyntaxKind.FalseKeyword:
      return false;
    default:
      return null;
  }
}
function readStringType(type) {
  if (!ts5.isLiteralTypeNode(type) || !ts5.isStringLiteral(type.literal)) {
    return null;
  }
  return type.literal.text;
}
function readMapType(type, valueTransform) {
  if (!ts5.isTypeLiteralNode(type)) {
    return {};
  }
  const obj = {};
  type.members.forEach((member) => {
    if (!ts5.isPropertySignature(member) || member.type === void 0 || member.name === void 0 || !ts5.isStringLiteral(member.name) && !ts5.isIdentifier(member.name)) {
      return;
    }
    const value = valueTransform(member.type);
    if (value !== null) {
      obj[member.name.text] = value;
    }
  });
  return obj;
}
function readStringArrayType(type) {
  if (!ts5.isTupleTypeNode(type)) {
    return [];
  }
  const res = [];
  type.elements.forEach((el) => {
    if (!ts5.isLiteralTypeNode(el) || !ts5.isStringLiteral(el.literal)) {
      return;
    }
    res.push(el.literal.text);
  });
  return res;
}
function extractDirectiveTypeCheckMeta(node, inputs, reflector) {
  const members = reflector.getMembersOfClass(node);
  const staticMembers = members.filter((member) => member.isStatic);
  const ngTemplateGuards = staticMembers.map(extractTemplateGuard).filter((guard) => guard !== null);
  const hasNgTemplateContextGuard = staticMembers.some((member) => member.kind === ClassMemberKind.Method && member.name === "ngTemplateContextGuard");
  const coercedInputFields = new Set(staticMembers.map(extractCoercedInput).filter((inputName) => {
    var _a;
    if (inputName === null || ((_a = inputs.getByClassPropertyName(inputName)) == null ? void 0 : _a.isSignal)) {
      return false;
    }
    return true;
  }));
  const restrictedInputFields = /* @__PURE__ */ new Set();
  const stringLiteralInputFields = /* @__PURE__ */ new Set();
  const undeclaredInputFields = /* @__PURE__ */ new Set();
  for (const { classPropertyName, transform } of inputs) {
    const field = members.find((member) => member.name === classPropertyName);
    if (field === void 0 || field.node === null) {
      undeclaredInputFields.add(classPropertyName);
      continue;
    }
    if (isRestricted(field.node)) {
      restrictedInputFields.add(classPropertyName);
    }
    if (field.nameNode !== null && ts5.isStringLiteral(field.nameNode)) {
      stringLiteralInputFields.add(classPropertyName);
    }
    if (transform !== null) {
      coercedInputFields.add(classPropertyName);
    }
  }
  const arity = reflector.getGenericArityOfClass(node);
  return {
    hasNgTemplateContextGuard,
    ngTemplateGuards,
    coercedInputFields,
    restrictedInputFields,
    stringLiteralInputFields,
    undeclaredInputFields,
    isGeneric: arity !== null && arity > 0
  };
}
function isRestricted(node) {
  const modifiers = ts5.canHaveModifiers(node) ? ts5.getModifiers(node) : void 0;
  return modifiers !== void 0 && modifiers.some(({ kind }) => {
    return kind === ts5.SyntaxKind.PrivateKeyword || kind === ts5.SyntaxKind.ProtectedKeyword || kind === ts5.SyntaxKind.ReadonlyKeyword;
  });
}
function extractTemplateGuard(member) {
  if (!member.name.startsWith("ngTemplateGuard_")) {
    return null;
  }
  const inputName = afterUnderscore(member.name);
  if (member.kind === ClassMemberKind.Property) {
    let type = null;
    if (member.type !== null && ts5.isLiteralTypeNode(member.type) && ts5.isStringLiteral(member.type.literal)) {
      type = member.type.literal.text;
    }
    if (type !== "binding") {
      return null;
    }
    return { inputName, type };
  } else if (member.kind === ClassMemberKind.Method) {
    return { inputName, type: "invocation" };
  } else {
    return null;
  }
}
function extractCoercedInput(member) {
  if (member.kind !== ClassMemberKind.Property || !member.name.startsWith("ngAcceptInputType_")) {
    return null;
  }
  return afterUnderscore(member.name);
}
var CompoundMetadataReader = class {
  readers;
  constructor(readers) {
    this.readers = readers;
  }
  getDirectiveMetadata(node) {
    for (const reader of this.readers) {
      const meta = reader.getDirectiveMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
  getNgModuleMetadata(node) {
    for (const reader of this.readers) {
      const meta = reader.getNgModuleMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
  getPipeMetadata(node) {
    for (const reader of this.readers) {
      const meta = reader.getPipeMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
};
function afterUnderscore(str) {
  const pos = str.indexOf("_");
  if (pos === -1) {
    throw new Error(`Expected '${str}' to contain '_'`);
  }
  return str.slice(pos + 1);
}
function hasInjectableFields(clazz, host) {
  const members = host.getMembersOfClass(clazz);
  return members.some(({ isStatic, name }) => isStatic && (name === "\u0275prov" || name === "\u0275fac"));
}
function isHostDirectiveMetaForGlobalMode(hostDirectiveMeta) {
  return hostDirectiveMeta.directive instanceof Reference;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/dts.mjs
var DtsMetadataReader = class {
  checker;
  reflector;
  constructor(checker, reflector) {
    this.checker = checker;
    this.reflector = reflector;
  }
  getNgModuleMetadata(ref) {
    const clazz = ref.node;
    const ngModuleDef = this.reflector.getMembersOfClass(clazz).find((member) => member.name === "\u0275mod" && member.isStatic);
    if (ngModuleDef === void 0) {
      return null;
    } else if (ngModuleDef.type === null || !ts6.isTypeReferenceNode(ngModuleDef.type) || ngModuleDef.type.typeArguments === void 0 || ngModuleDef.type.typeArguments.length !== 4) {
      return null;
    }
    const [_, declarationMetadata, importMetadata, exportMetadata] = ngModuleDef.type.typeArguments;
    const declarations = extractReferencesFromType(this.checker, declarationMetadata, ref.bestGuessOwningModule);
    const exports = extractReferencesFromType(this.checker, exportMetadata, ref.bestGuessOwningModule);
    const imports = extractReferencesFromType(this.checker, importMetadata, ref.bestGuessOwningModule);
    const isPoisoned = exports.isIncomplete;
    return {
      kind: MetaKind.NgModule,
      ref,
      declarations: declarations.result,
      isPoisoned,
      exports: exports.result,
      imports: imports.result,
      schemas: [],
      rawDeclarations: null,
      rawImports: null,
      rawExports: null,
      decorator: null,
      mayDeclareProviders: true
    };
  }
  getDirectiveMetadata(ref) {
    var _a, _b, _c;
    const clazz = ref.node;
    const def = this.reflector.getMembersOfClass(clazz).find((field) => field.isStatic && (field.name === "\u0275cmp" || field.name === "\u0275dir"));
    if (def === void 0) {
      return null;
    } else if (def.type === null || !ts6.isTypeReferenceNode(def.type) || def.type.typeArguments === void 0 || def.type.typeArguments.length < 2) {
      return null;
    }
    const isComponent = def.name === "\u0275cmp";
    const ctorParams = this.reflector.getConstructorParameters(clazz);
    const isStructural = !isComponent && ctorParams !== null && ctorParams.some((param) => {
      return param.typeValueReference.kind === 1 && param.typeValueReference.moduleName === "@angular/core" && param.typeValueReference.importedName === "TemplateRef";
    });
    const ngContentSelectors = def.type.typeArguments.length > 6 ? readStringArrayType(def.type.typeArguments[6]) : null;
    const isStandalone = def.type.typeArguments.length > 7 && ((_a = readBooleanType(def.type.typeArguments[7])) != null ? _a : false);
    const inputs = ClassPropertyMapping.fromMappedObject(readInputsType(def.type.typeArguments[3]));
    const outputs = ClassPropertyMapping.fromMappedObject(readMapType(def.type.typeArguments[4], readStringType));
    const hostDirectives = def.type.typeArguments.length > 8 ? readHostDirectivesType(this.checker, def.type.typeArguments[8], ref.bestGuessOwningModule) : null;
    const isSignal = def.type.typeArguments.length > 9 && ((_b = readBooleanType(def.type.typeArguments[9])) != null ? _b : false);
    const isPoisoned = hostDirectives !== null && (hostDirectives == null ? void 0 : hostDirectives.isIncomplete);
    return {
      kind: MetaKind.Directive,
      matchSource: MatchSource.Selector,
      ref,
      name: clazz.name.text,
      isComponent,
      selector: readStringType(def.type.typeArguments[1]),
      exportAs: readStringArrayType(def.type.typeArguments[2]),
      inputs,
      outputs,
      hostDirectives: (_c = hostDirectives == null ? void 0 : hostDirectives.result) != null ? _c : null,
      queries: readStringArrayType(def.type.typeArguments[5]),
      ...extractDirectiveTypeCheckMeta(clazz, inputs, this.reflector),
      baseClass: readBaseClass2(clazz, this.checker, this.reflector),
      isPoisoned,
      isStructural,
      animationTriggerNames: null,
      ngContentSelectors,
      isStandalone,
      isSignal,
      inputFieldNamesFromMetadataArray: null,
      imports: null,
      rawImports: null,
      deferredImports: null,
      schemas: null,
      decorator: null,
      assumedToExportProviders: isComponent && isStandalone,
      preserveWhitespaces: false,
      isExplicitlyDeferred: false
    };
  }
  getPipeMetadata(ref) {
    var _a;
    const def = this.reflector.getMembersOfClass(ref.node).find((field) => field.isStatic && field.name === "\u0275pipe");
    if (def === void 0) {
      return null;
    } else if (def.type === null || !ts6.isTypeReferenceNode(def.type) || def.type.typeArguments === void 0 || def.type.typeArguments.length < 2) {
      return null;
    }
    const type = def.type.typeArguments[1];
    if (!ts6.isLiteralTypeNode(type) || !ts6.isStringLiteral(type.literal)) {
      return null;
    }
    const name = type.literal.text;
    const isStandalone = def.type.typeArguments.length > 2 && ((_a = readBooleanType(def.type.typeArguments[2])) != null ? _a : false);
    return {
      kind: MetaKind.Pipe,
      ref,
      name,
      nameExpr: null,
      isStandalone,
      decorator: null,
      isExplicitlyDeferred: false
    };
  }
};
function readInputsType(type) {
  const inputsMap = {};
  if (ts6.isTypeLiteralNode(type)) {
    for (const member of type.members) {
      if (!ts6.isPropertySignature(member) || member.type === void 0 || member.name === void 0 || !ts6.isStringLiteral(member.name) && !ts6.isIdentifier(member.name)) {
        continue;
      }
      const stringValue = readStringType(member.type);
      const classPropertyName = member.name.text;
      if (stringValue != null) {
        inputsMap[classPropertyName] = {
          bindingPropertyName: stringValue,
          classPropertyName,
          required: false,
          isSignal: false,
          transform: null
        };
      } else {
        const config = readMapType(member.type, (innerValue) => {
          var _a;
          return (_a = readStringType(innerValue)) != null ? _a : readBooleanType(innerValue);
        });
        inputsMap[classPropertyName] = {
          classPropertyName,
          bindingPropertyName: config.alias,
          required: config.required,
          isSignal: !!config.isSignal,
          transform: null
        };
      }
    }
  }
  return inputsMap;
}
function readBaseClass2(clazz, checker, reflector) {
  if (!isNamedClassDeclaration(clazz)) {
    return reflector.hasBaseClass(clazz) ? "dynamic" : null;
  }
  if (clazz.heritageClauses !== void 0) {
    for (const clause of clazz.heritageClauses) {
      if (clause.token === ts6.SyntaxKind.ExtendsKeyword) {
        const baseExpr = clause.types[0].expression;
        let symbol = checker.getSymbolAtLocation(baseExpr);
        if (symbol === void 0) {
          return "dynamic";
        } else if (symbol.flags & ts6.SymbolFlags.Alias) {
          symbol = checker.getAliasedSymbol(symbol);
        }
        if (symbol.valueDeclaration !== void 0 && isNamedClassDeclaration(symbol.valueDeclaration)) {
          return new Reference(symbol.valueDeclaration);
        } else {
          return "dynamic";
        }
      }
    }
  }
  return null;
}
function readHostDirectivesType(checker, type, bestGuessOwningModule) {
  if (!ts6.isTupleTypeNode(type) || type.elements.length === 0) {
    return null;
  }
  const result = [];
  let isIncomplete = false;
  for (const hostDirectiveType of type.elements) {
    const { directive, inputs, outputs } = readMapType(hostDirectiveType, (type2) => type2);
    if (directive) {
      if (!ts6.isTypeQueryNode(directive)) {
        throw new Error(`Expected TypeQueryNode: ${nodeDebugInfo(directive)}`);
      }
      const ref = extraReferenceFromTypeQuery(checker, directive, type, bestGuessOwningModule);
      if (ref === null) {
        isIncomplete = true;
        continue;
      }
      result.push({
        directive: ref,
        isForwardReference: false,
        inputs: readMapType(inputs, readStringType),
        outputs: readMapType(outputs, readStringType)
      });
    }
  }
  return result.length > 0 ? { result, isIncomplete } : null;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/inheritance.mjs
function flattenInheritedDirectiveMetadata(reader, dir) {
  const topMeta = reader.getDirectiveMetadata(dir);
  if (topMeta === null) {
    return null;
  }
  if (topMeta.baseClass === null) {
    return topMeta;
  }
  const coercedInputFields = /* @__PURE__ */ new Set();
  const undeclaredInputFields = /* @__PURE__ */ new Set();
  const restrictedInputFields = /* @__PURE__ */ new Set();
  const stringLiteralInputFields = /* @__PURE__ */ new Set();
  let hostDirectives = null;
  let isDynamic = false;
  let inputs = ClassPropertyMapping.empty();
  let outputs = ClassPropertyMapping.empty();
  let isStructural = false;
  const addMetadata = (meta) => {
    if (meta.baseClass === "dynamic") {
      isDynamic = true;
    } else if (meta.baseClass !== null) {
      const baseMeta = reader.getDirectiveMetadata(meta.baseClass);
      if (baseMeta !== null) {
        addMetadata(baseMeta);
      } else {
        isDynamic = true;
      }
    }
    isStructural = isStructural || meta.isStructural;
    inputs = ClassPropertyMapping.merge(inputs, meta.inputs);
    outputs = ClassPropertyMapping.merge(outputs, meta.outputs);
    for (const coercedInputField of meta.coercedInputFields) {
      coercedInputFields.add(coercedInputField);
    }
    for (const undeclaredInputField of meta.undeclaredInputFields) {
      undeclaredInputFields.add(undeclaredInputField);
    }
    for (const restrictedInputField of meta.restrictedInputFields) {
      restrictedInputFields.add(restrictedInputField);
    }
    for (const field of meta.stringLiteralInputFields) {
      stringLiteralInputFields.add(field);
    }
    if (meta.hostDirectives !== null && meta.hostDirectives.length > 0) {
      hostDirectives != null ? hostDirectives : hostDirectives = [];
      hostDirectives.push(...meta.hostDirectives);
    }
  };
  addMetadata(topMeta);
  return {
    ...topMeta,
    inputs,
    outputs,
    coercedInputFields,
    undeclaredInputFields,
    restrictedInputFields,
    stringLiteralInputFields,
    baseClass: isDynamic ? "dynamic" : null,
    isStructural,
    hostDirectives
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/registry.mjs
var LocalMetadataRegistry = class {
  directives = /* @__PURE__ */ new Map();
  ngModules = /* @__PURE__ */ new Map();
  pipes = /* @__PURE__ */ new Map();
  getDirectiveMetadata(ref) {
    return this.directives.has(ref.node) ? this.directives.get(ref.node) : null;
  }
  getNgModuleMetadata(ref) {
    return this.ngModules.has(ref.node) ? this.ngModules.get(ref.node) : null;
  }
  getPipeMetadata(ref) {
    return this.pipes.has(ref.node) ? this.pipes.get(ref.node) : null;
  }
  registerDirectiveMetadata(meta) {
    this.directives.set(meta.ref.node, meta);
  }
  registerNgModuleMetadata(meta) {
    this.ngModules.set(meta.ref.node, meta);
  }
  registerPipeMetadata(meta) {
    this.pipes.set(meta.ref.node, meta);
  }
  getKnown(kind) {
    switch (kind) {
      case MetaKind.Directive:
        return Array.from(this.directives.values()).map((v) => v.ref.node);
      case MetaKind.Pipe:
        return Array.from(this.pipes.values()).map((v) => v.ref.node);
      case MetaKind.NgModule:
        return Array.from(this.ngModules.values()).map((v) => v.ref.node);
    }
  }
};
var CompoundMetadataRegistry = class {
  registries;
  constructor(registries) {
    this.registries = registries;
  }
  registerDirectiveMetadata(meta) {
    for (const registry of this.registries) {
      registry.registerDirectiveMetadata(meta);
    }
  }
  registerNgModuleMetadata(meta) {
    for (const registry of this.registries) {
      registry.registerNgModuleMetadata(meta);
    }
  }
  registerPipeMetadata(meta) {
    for (const registry of this.registries) {
      registry.registerPipeMetadata(meta);
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/resource_registry.mjs
var ResourceRegistry = class {
  externalTemplateToComponentsMap = /* @__PURE__ */ new Map();
  componentToTemplateMap = /* @__PURE__ */ new Map();
  componentToStylesMap = /* @__PURE__ */ new Map();
  externalStyleToComponentsMap = /* @__PURE__ */ new Map();
  getComponentsWithTemplate(template) {
    if (!this.externalTemplateToComponentsMap.has(template)) {
      return /* @__PURE__ */ new Set();
    }
    return this.externalTemplateToComponentsMap.get(template);
  }
  registerResources(resources, component) {
    if (resources.template !== null) {
      this.registerTemplate(resources.template, component);
    }
    for (const style of resources.styles) {
      this.registerStyle(style, component);
    }
  }
  registerTemplate(templateResource, component) {
    const { path } = templateResource;
    if (path !== null) {
      if (!this.externalTemplateToComponentsMap.has(path)) {
        this.externalTemplateToComponentsMap.set(path, /* @__PURE__ */ new Set());
      }
      this.externalTemplateToComponentsMap.get(path).add(component);
    }
    this.componentToTemplateMap.set(component, templateResource);
  }
  getTemplate(component) {
    if (!this.componentToTemplateMap.has(component)) {
      return null;
    }
    return this.componentToTemplateMap.get(component);
  }
  registerStyle(styleResource, component) {
    const { path } = styleResource;
    if (!this.componentToStylesMap.has(component)) {
      this.componentToStylesMap.set(component, /* @__PURE__ */ new Set());
    }
    if (path !== null) {
      if (!this.externalStyleToComponentsMap.has(path)) {
        this.externalStyleToComponentsMap.set(path, /* @__PURE__ */ new Set());
      }
      this.externalStyleToComponentsMap.get(path).add(component);
    }
    this.componentToStylesMap.get(component).add(styleResource);
  }
  getStyles(component) {
    if (!this.componentToStylesMap.has(component)) {
      return /* @__PURE__ */ new Set();
    }
    return this.componentToStylesMap.get(component);
  }
  getComponentsWithStyle(styleUrl) {
    if (!this.externalStyleToComponentsMap.has(styleUrl)) {
      return /* @__PURE__ */ new Set();
    }
    return this.externalStyleToComponentsMap.get(styleUrl);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/providers.mjs
var ExportedProviderStatusResolver = class {
  metaReader;
  calculating = /* @__PURE__ */ new Set();
  constructor(metaReader) {
    this.metaReader = metaReader;
  }
  mayExportProviders(ref, dependencyCallback) {
    var _a;
    if (this.calculating.has(ref.node)) {
      return false;
    }
    this.calculating.add(ref.node);
    if (dependencyCallback !== void 0) {
      dependencyCallback(ref);
    }
    try {
      const dirMeta = this.metaReader.getDirectiveMetadata(ref);
      if (dirMeta !== null) {
        if (!dirMeta.isComponent || !dirMeta.isStandalone) {
          return false;
        }
        if (dirMeta.assumedToExportProviders) {
          return true;
        }
        return ((_a = dirMeta.imports) != null ? _a : []).some((importRef) => this.mayExportProviders(importRef, dependencyCallback));
      }
      const pipeMeta = this.metaReader.getPipeMetadata(ref);
      if (pipeMeta !== null) {
        return false;
      }
      const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
      if (ngModuleMeta !== null) {
        if (ngModuleMeta.mayDeclareProviders) {
          return true;
        }
        return ngModuleMeta.imports.some((importRef) => this.mayExportProviders(importRef, dependencyCallback));
      }
      return false;
    } finally {
      this.calculating.delete(ref.node);
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/host_directives_resolver.mjs
var EMPTY_ARRAY = [];
var HostDirectivesResolver = class {
  metaReader;
  cache = /* @__PURE__ */ new Map();
  constructor(metaReader) {
    this.metaReader = metaReader;
  }
  resolve(metadata) {
    if (this.cache.has(metadata.ref.node)) {
      return this.cache.get(metadata.ref.node);
    }
    const results = metadata.hostDirectives && metadata.hostDirectives.length > 0 ? this.walkHostDirectives(metadata.hostDirectives, []) : EMPTY_ARRAY;
    this.cache.set(metadata.ref.node, results);
    return results;
  }
  walkHostDirectives(directives, results) {
    for (const current of directives) {
      if (!isHostDirectiveMetaForGlobalMode(current)) {
        throw new Error("Impossible state: resolving code path in local compilation mode");
      }
      const hostMeta = flattenInheritedDirectiveMetadata(this.metaReader, current.directive);
      if (hostMeta === null) {
        continue;
      }
      if (hostMeta.hostDirectives) {
        this.walkHostDirectives(hostMeta.hostDirectives, results);
      }
      results.push({
        ...hostMeta,
        matchSource: MatchSource.HostDirective,
        inputs: ClassPropertyMapping.fromMappedObject(this.filterMappings(hostMeta.inputs, current.inputs, resolveInput)),
        outputs: ClassPropertyMapping.fromMappedObject(this.filterMappings(hostMeta.outputs, current.outputs, resolveOutput))
      });
    }
    return results;
  }
  filterMappings(source, allowedProperties, valueResolver) {
    const result = {};
    if (allowedProperties !== null) {
      for (const publicName in allowedProperties) {
        if (allowedProperties.hasOwnProperty(publicName)) {
          const bindings = source.getByBindingPropertyName(publicName);
          if (bindings !== null) {
            for (const binding of bindings) {
              result[binding.classPropertyName] = valueResolver(allowedProperties[publicName], binding);
            }
          }
        }
      }
    }
    return result;
  }
};
function resolveInput(bindingName, binding) {
  return {
    bindingPropertyName: bindingName,
    classPropertyName: binding.classPropertyName,
    required: binding.required,
    transform: binding.transform,
    isSignal: binding.isSignal
  };
}
function resolveOutput(bindingName) {
  return bindingName;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/api.mjs
var CompilationMode;
(function(CompilationMode2) {
  CompilationMode2[CompilationMode2["FULL"] = 0] = "FULL";
  CompilationMode2[CompilationMode2["PARTIAL"] = 1] = "PARTIAL";
  CompilationMode2[CompilationMode2["LOCAL"] = 2] = "LOCAL";
})(CompilationMode || (CompilationMode = {}));
var HandlerPrecedence;
(function(HandlerPrecedence2) {
  HandlerPrecedence2[HandlerPrecedence2["PRIMARY"] = 0] = "PRIMARY";
  HandlerPrecedence2[HandlerPrecedence2["SHARED"] = 1] = "SHARED";
  HandlerPrecedence2[HandlerPrecedence2["WEAK"] = 2] = "WEAK";
})(HandlerPrecedence || (HandlerPrecedence = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/alias.mjs
import ts7 from "typescript";
function aliasTransformFactory(exportStatements) {
  return () => {
    return (file) => {
      if (ts7.isBundle(file) || !exportStatements.has(file.fileName)) {
        return file;
      }
      const statements = [...file.statements];
      exportStatements.get(file.fileName).forEach(([moduleName, symbolName], aliasName) => {
        const stmt = ts7.factory.createExportDeclaration(
          void 0,
          false,
          ts7.factory.createNamedExports([
            ts7.factory.createExportSpecifier(false, symbolName, aliasName)
          ]),
          ts7.factory.createStringLiteral(moduleName)
        );
        statements.push(stmt);
      });
      return ts7.factory.updateSourceFile(file, statements);
    };
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/compilation.mjs
import ts8 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/trait.mjs
var TraitState;
(function(TraitState2) {
  TraitState2[TraitState2["Pending"] = 0] = "Pending";
  TraitState2[TraitState2["Analyzed"] = 1] = "Analyzed";
  TraitState2[TraitState2["Resolved"] = 2] = "Resolved";
  TraitState2[TraitState2["Skipped"] = 3] = "Skipped";
})(TraitState || (TraitState = {}));
var Trait = {
  pending: (handler, detected) => TraitImpl.pending(handler, detected)
};
var TraitImpl = class {
  state = TraitState.Pending;
  handler;
  detected;
  analysis = null;
  symbol = null;
  resolution = null;
  analysisDiagnostics = null;
  resolveDiagnostics = null;
  typeCheckDiagnostics = null;
  constructor(handler, detected) {
    this.handler = handler;
    this.detected = detected;
  }
  toAnalyzed(analysis, diagnostics, symbol) {
    this.assertTransitionLegal(TraitState.Pending, TraitState.Analyzed);
    this.analysis = analysis;
    this.analysisDiagnostics = diagnostics;
    this.symbol = symbol;
    this.state = TraitState.Analyzed;
    return this;
  }
  toResolved(resolution, diagnostics) {
    this.assertTransitionLegal(TraitState.Analyzed, TraitState.Resolved);
    if (this.analysis === null) {
      throw new Error(`Cannot transition an Analyzed trait with a null analysis to Resolved`);
    }
    this.resolution = resolution;
    this.state = TraitState.Resolved;
    this.resolveDiagnostics = diagnostics;
    this.typeCheckDiagnostics = null;
    return this;
  }
  toSkipped() {
    this.assertTransitionLegal(TraitState.Pending, TraitState.Skipped);
    this.state = TraitState.Skipped;
    return this;
  }
  assertTransitionLegal(allowedState, transitionTo) {
    if (!(this.state === allowedState)) {
      throw new Error(`Assertion failure: cannot transition from ${TraitState[this.state]} to ${TraitState[transitionTo]}.`);
    }
  }
  static pending(handler, detected) {
    return new TraitImpl(handler, detected);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/compilation.mjs
var TraitCompiler = class {
  handlers;
  reflector;
  perf;
  incrementalBuild;
  compileNonExportedClasses;
  compilationMode;
  dtsTransforms;
  semanticDepGraphUpdater;
  sourceFileTypeIdentifier;
  classes = /* @__PURE__ */ new Map();
  fileToClasses = /* @__PURE__ */ new Map();
  filesWithoutTraits = /* @__PURE__ */ new Set();
  reexportMap = /* @__PURE__ */ new Map();
  handlersByName = /* @__PURE__ */ new Map();
  constructor(handlers, reflector, perf, incrementalBuild, compileNonExportedClasses, compilationMode, dtsTransforms, semanticDepGraphUpdater, sourceFileTypeIdentifier) {
    this.handlers = handlers;
    this.reflector = reflector;
    this.perf = perf;
    this.incrementalBuild = incrementalBuild;
    this.compileNonExportedClasses = compileNonExportedClasses;
    this.compilationMode = compilationMode;
    this.dtsTransforms = dtsTransforms;
    this.semanticDepGraphUpdater = semanticDepGraphUpdater;
    this.sourceFileTypeIdentifier = sourceFileTypeIdentifier;
    for (const handler of handlers) {
      this.handlersByName.set(handler.name, handler);
    }
  }
  analyzeSync(sf) {
    this.analyze(sf, false);
  }
  analyzeAsync(sf) {
    return this.analyze(sf, true);
  }
  analyze(sf, preanalyze) {
    if (sf.isDeclarationFile || this.sourceFileTypeIdentifier.isShim(sf) || this.sourceFileTypeIdentifier.isResource(sf)) {
      return void 0;
    }
    const promises = [];
    const priorWork = this.compilationMode !== CompilationMode.LOCAL ? this.incrementalBuild.priorAnalysisFor(sf) : null;
    if (priorWork !== null) {
      this.perf.eventCount(PerfEvent.SourceFileReuseAnalysis);
      if (priorWork.length > 0) {
        for (const priorRecord of priorWork) {
          this.adopt(priorRecord);
        }
        this.perf.eventCount(PerfEvent.TraitReuseAnalysis, priorWork.length);
      } else {
        this.filesWithoutTraits.add(sf);
      }
      return;
    }
    const visit2 = (node) => {
      if (this.reflector.isClass(node)) {
        this.analyzeClass(node, preanalyze ? promises : null);
      }
      ts8.forEachChild(node, visit2);
    };
    visit2(sf);
    if (!this.fileToClasses.has(sf)) {
      this.filesWithoutTraits.add(sf);
    }
    if (preanalyze && promises.length > 0) {
      return Promise.all(promises).then(() => void 0);
    } else {
      return void 0;
    }
  }
  recordFor(clazz) {
    if (this.classes.has(clazz)) {
      return this.classes.get(clazz);
    } else {
      return null;
    }
  }
  getAnalyzedRecords() {
    const result = /* @__PURE__ */ new Map();
    for (const [sf, classes] of this.fileToClasses) {
      const records = [];
      for (const clazz of classes) {
        records.push(this.classes.get(clazz));
      }
      result.set(sf, records);
    }
    for (const sf of this.filesWithoutTraits) {
      result.set(sf, []);
    }
    return result;
  }
  adopt(priorRecord) {
    const record = {
      hasPrimaryHandler: priorRecord.hasPrimaryHandler,
      hasWeakHandlers: priorRecord.hasWeakHandlers,
      metaDiagnostics: priorRecord.metaDiagnostics,
      node: priorRecord.node,
      traits: []
    };
    for (const priorTrait of priorRecord.traits) {
      const handler = this.handlersByName.get(priorTrait.handler.name);
      let trait = Trait.pending(handler, priorTrait.detected);
      if (priorTrait.state === TraitState.Analyzed || priorTrait.state === TraitState.Resolved) {
        const symbol = this.makeSymbolForTrait(handler, record.node, priorTrait.analysis);
        trait = trait.toAnalyzed(priorTrait.analysis, priorTrait.analysisDiagnostics, symbol);
        if (trait.analysis !== null && trait.handler.register !== void 0) {
          trait.handler.register(record.node, trait.analysis);
        }
      } else if (priorTrait.state === TraitState.Skipped) {
        trait = trait.toSkipped();
      }
      record.traits.push(trait);
    }
    this.classes.set(record.node, record);
    const sf = record.node.getSourceFile();
    if (!this.fileToClasses.has(sf)) {
      this.fileToClasses.set(sf, /* @__PURE__ */ new Set());
    }
    this.fileToClasses.get(sf).add(record.node);
  }
  scanClassForTraits(clazz) {
    if (!this.compileNonExportedClasses && !this.reflector.isStaticallyExported(clazz)) {
      return null;
    }
    const decorators = this.reflector.getDecoratorsOfDeclaration(clazz);
    return this.detectTraits(clazz, decorators);
  }
  detectTraits(clazz, decorators) {
    let record = this.recordFor(clazz);
    let foundTraits = [];
    const nonNgDecoratorsInLocalMode = this.compilationMode === CompilationMode.LOCAL ? new Set(decorators) : null;
    for (const handler of this.handlers) {
      const result = handler.detect(clazz, decorators);
      if (result === void 0) {
        continue;
      }
      if (nonNgDecoratorsInLocalMode !== null && result.decorator !== null) {
        nonNgDecoratorsInLocalMode.delete(result.decorator);
      }
      const isPrimaryHandler = handler.precedence === HandlerPrecedence.PRIMARY;
      const isWeakHandler = handler.precedence === HandlerPrecedence.WEAK;
      const trait = Trait.pending(handler, result);
      foundTraits.push(trait);
      if (record === null) {
        record = {
          node: clazz,
          traits: [trait],
          metaDiagnostics: null,
          hasPrimaryHandler: isPrimaryHandler,
          hasWeakHandlers: isWeakHandler
        };
        this.classes.set(clazz, record);
        const sf = clazz.getSourceFile();
        if (!this.fileToClasses.has(sf)) {
          this.fileToClasses.set(sf, /* @__PURE__ */ new Set());
        }
        this.fileToClasses.get(sf).add(clazz);
      } else {
        if (!isWeakHandler && record.hasWeakHandlers) {
          record.traits = record.traits.filter((field) => field.handler.precedence !== HandlerPrecedence.WEAK);
          record.hasWeakHandlers = false;
        } else if (isWeakHandler && !record.hasWeakHandlers) {
          continue;
        }
        if (isPrimaryHandler && record.hasPrimaryHandler) {
          record.metaDiagnostics = [
            {
              category: ts8.DiagnosticCategory.Error,
              code: Number("-99" + ErrorCode.DECORATOR_COLLISION),
              file: getSourceFile(clazz),
              start: clazz.getStart(void 0, false),
              length: clazz.getWidth(),
              messageText: "Two incompatible decorators on class"
            }
          ];
          record.traits = foundTraits = [];
          break;
        }
        record.traits.push(trait);
        record.hasPrimaryHandler = record.hasPrimaryHandler || isPrimaryHandler;
      }
    }
    if (nonNgDecoratorsInLocalMode !== null && nonNgDecoratorsInLocalMode.size > 0 && record !== null && record.metaDiagnostics === null) {
      record.metaDiagnostics = [...nonNgDecoratorsInLocalMode].map((decorator) => ({
        category: ts8.DiagnosticCategory.Error,
        code: Number("-99" + ErrorCode.DECORATOR_UNEXPECTED),
        file: getSourceFile(clazz),
        start: decorator.node.getStart(),
        length: decorator.node.getWidth(),
        messageText: "In local compilation mode, Angular does not support custom decorators. Ensure all class decorators are from Angular."
      }));
      record.traits = foundTraits = [];
    }
    return foundTraits.length > 0 ? foundTraits : null;
  }
  makeSymbolForTrait(handler, decl, analysis) {
    if (analysis === null) {
      return null;
    }
    const symbol = handler.symbol(decl, analysis);
    if (symbol !== null && this.semanticDepGraphUpdater !== null) {
      const isPrimary = handler.precedence === HandlerPrecedence.PRIMARY;
      if (!isPrimary) {
        throw new Error(`AssertionError: ${handler.name} returned a symbol but is not a primary handler.`);
      }
      this.semanticDepGraphUpdater.registerSymbol(symbol);
    }
    return symbol;
  }
  analyzeClass(clazz, preanalyzeQueue) {
    const traits = this.scanClassForTraits(clazz);
    if (traits === null) {
      return;
    }
    for (const trait of traits) {
      const analyze = () => this.analyzeTrait(clazz, trait);
      let preanalysis = null;
      if (preanalyzeQueue !== null && trait.handler.preanalyze !== void 0) {
        try {
          preanalysis = trait.handler.preanalyze(clazz, trait.detected.metadata) || null;
        } catch (err) {
          if (err instanceof FatalDiagnosticError) {
            trait.toAnalyzed(null, [err.toDiagnostic()], null);
            return;
          } else {
            throw err;
          }
        }
      }
      if (preanalysis !== null) {
        preanalyzeQueue.push(preanalysis.then(analyze));
      } else {
        analyze();
      }
    }
  }
  analyzeTrait(clazz, trait) {
    var _a, _b, _c;
    if (trait.state !== TraitState.Pending) {
      throw new Error(`Attempt to analyze trait of ${clazz.name.text} in state ${TraitState[trait.state]} (expected DETECTED)`);
    }
    this.perf.eventCount(PerfEvent.TraitAnalyze);
    let result;
    try {
      result = trait.handler.analyze(clazz, trait.detected.metadata);
    } catch (err) {
      if (err instanceof FatalDiagnosticError) {
        trait.toAnalyzed(null, [err.toDiagnostic()], null);
        return;
      } else {
        throw err;
      }
    }
    const symbol = this.makeSymbolForTrait(trait.handler, clazz, (_a = result.analysis) != null ? _a : null);
    if (result.analysis !== void 0 && trait.handler.register !== void 0) {
      trait.handler.register(clazz, result.analysis);
    }
    trait = trait.toAnalyzed((_b = result.analysis) != null ? _b : null, (_c = result.diagnostics) != null ? _c : null, symbol);
  }
  resolve() {
    var _a, _b;
    const classes = this.classes.keys();
    for (const clazz of classes) {
      const record = this.classes.get(clazz);
      for (let trait of record.traits) {
        const handler = trait.handler;
        switch (trait.state) {
          case TraitState.Skipped:
            continue;
          case TraitState.Pending:
            throw new Error(`Resolving a trait that hasn't been analyzed: ${clazz.name.text} / ${trait.handler.name}`);
          case TraitState.Resolved:
            throw new Error(`Resolving an already resolved trait`);
        }
        if (trait.analysis === null) {
          continue;
        }
        if (handler.resolve === void 0) {
          trait = trait.toResolved(null, null);
          continue;
        }
        let result;
        try {
          result = handler.resolve(clazz, trait.analysis, trait.symbol);
        } catch (err) {
          if (err instanceof FatalDiagnosticError) {
            trait = trait.toResolved(null, [err.toDiagnostic()]);
            continue;
          } else {
            throw err;
          }
        }
        trait = trait.toResolved((_a = result.data) != null ? _a : null, (_b = result.diagnostics) != null ? _b : null);
        if (result.reexports !== void 0) {
          const fileName = clazz.getSourceFile().fileName;
          if (!this.reexportMap.has(fileName)) {
            this.reexportMap.set(fileName, /* @__PURE__ */ new Map());
          }
          const fileReexports = this.reexportMap.get(fileName);
          for (const reexport of result.reexports) {
            fileReexports.set(reexport.asAlias, [reexport.fromModule, reexport.symbolName]);
          }
        }
      }
    }
  }
  typeCheck(sf, ctx) {
    if (!this.fileToClasses.has(sf) || this.compilationMode === CompilationMode.LOCAL) {
      return;
    }
    for (const clazz of this.fileToClasses.get(sf)) {
      const record = this.classes.get(clazz);
      for (const trait of record.traits) {
        if (trait.state !== TraitState.Resolved) {
          continue;
        } else if (trait.handler.typeCheck === void 0) {
          continue;
        }
        if (trait.resolution !== null) {
          trait.handler.typeCheck(ctx, clazz, trait.analysis, trait.resolution);
        }
      }
    }
  }
  runAdditionalChecks(sf, check) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return [];
    }
    const classes = this.fileToClasses.get(sf);
    if (classes === void 0) {
      return [];
    }
    const diagnostics = [];
    for (const clazz of classes) {
      if (!isNamedClassDeclaration(clazz)) {
        continue;
      }
      const record = this.classes.get(clazz);
      for (const trait of record.traits) {
        const result = check(clazz, trait.handler);
        if (result !== null) {
          diagnostics.push(...result);
        }
      }
    }
    return diagnostics;
  }
  index(ctx) {
    for (const clazz of this.classes.keys()) {
      const record = this.classes.get(clazz);
      for (const trait of record.traits) {
        if (trait.state !== TraitState.Resolved) {
          continue;
        } else if (trait.handler.index === void 0) {
          continue;
        }
        if (trait.resolution !== null) {
          trait.handler.index(ctx, clazz, trait.analysis, trait.resolution);
        }
      }
    }
  }
  xi18n(bundle) {
    for (const clazz of this.classes.keys()) {
      const record = this.classes.get(clazz);
      for (const trait of record.traits) {
        if (trait.state !== TraitState.Analyzed && trait.state !== TraitState.Resolved) {
          continue;
        } else if (trait.handler.xi18n === void 0) {
          continue;
        }
        if (trait.analysis !== null) {
          trait.handler.xi18n(bundle, clazz, trait.analysis);
        }
      }
    }
  }
  updateResources(clazz) {
    if (this.compilationMode === CompilationMode.LOCAL || !this.reflector.isClass(clazz) || !this.classes.has(clazz)) {
      return;
    }
    const record = this.classes.get(clazz);
    for (const trait of record.traits) {
      if (trait.state !== TraitState.Resolved || trait.handler.updateResources === void 0) {
        continue;
      }
      trait.handler.updateResources(clazz, trait.analysis, trait.resolution);
    }
  }
  compile(clazz, constantPool) {
    const original = ts8.getOriginalNode(clazz);
    if (!this.reflector.isClass(clazz) || !this.reflector.isClass(original) || !this.classes.has(original)) {
      return null;
    }
    const record = this.classes.get(original);
    let res = [];
    for (const trait of record.traits) {
      let compileRes;
      if (trait.state !== TraitState.Resolved || containsErrors(trait.analysisDiagnostics) || containsErrors(trait.resolveDiagnostics)) {
        continue;
      }
      if (this.compilationMode === CompilationMode.LOCAL) {
        compileRes = trait.handler.compileLocal(clazz, trait.analysis, trait.resolution, constantPool);
      } else {
        if (this.compilationMode === CompilationMode.PARTIAL && trait.handler.compilePartial !== void 0) {
          compileRes = trait.handler.compilePartial(clazz, trait.analysis, trait.resolution);
        } else {
          compileRes = trait.handler.compileFull(clazz, trait.analysis, trait.resolution, constantPool);
        }
      }
      const compileMatchRes = compileRes;
      if (Array.isArray(compileMatchRes)) {
        for (const result of compileMatchRes) {
          if (!res.some((r) => r.name === result.name)) {
            res.push(result);
          }
        }
      } else if (!res.some((result) => result.name === compileMatchRes.name)) {
        res.push(compileMatchRes);
      }
    }
    this.dtsTransforms.getIvyDeclarationTransform(original.getSourceFile()).addFields(original, res);
    return res.length > 0 ? res : null;
  }
  compileHmrUpdateCallback(clazz) {
    const original = ts8.getOriginalNode(clazz);
    if (!this.reflector.isClass(clazz) || !this.reflector.isClass(original) || !this.classes.has(original)) {
      return null;
    }
    const record = this.classes.get(original);
    for (const trait of record.traits) {
      if (trait.state === TraitState.Resolved && trait.handler.compileHmrUpdateDeclaration !== void 0 && !containsErrors(trait.analysisDiagnostics) && !containsErrors(trait.resolveDiagnostics)) {
        return trait.handler.compileHmrUpdateDeclaration(clazz, trait.analysis, trait.resolution);
      }
    }
    return null;
  }
  decoratorsFor(node) {
    const original = ts8.getOriginalNode(node);
    if (!this.reflector.isClass(original) || !this.classes.has(original)) {
      return [];
    }
    const record = this.classes.get(original);
    const decorators = [];
    for (const trait of record.traits) {
      if (this.compilationMode !== CompilationMode.LOCAL && trait.state !== TraitState.Resolved) {
        continue;
      }
      if (trait.detected.trigger !== null && ts8.isDecorator(trait.detected.trigger)) {
        decorators.push(trait.detected.trigger);
      }
    }
    return decorators;
  }
  get diagnostics() {
    var _a;
    const diagnostics = [];
    for (const clazz of this.classes.keys()) {
      const record = this.classes.get(clazz);
      if (record.metaDiagnostics !== null) {
        diagnostics.push(...record.metaDiagnostics);
      }
      for (const trait of record.traits) {
        if ((trait.state === TraitState.Analyzed || trait.state === TraitState.Resolved) && trait.analysisDiagnostics !== null) {
          diagnostics.push(...trait.analysisDiagnostics);
        }
        if (trait.state === TraitState.Resolved) {
          diagnostics.push(...(_a = trait.resolveDiagnostics) != null ? _a : []);
        }
      }
    }
    return diagnostics;
  }
  get exportStatements() {
    return this.reexportMap;
  }
};
function containsErrors(diagnostics) {
  return diagnostics !== null && diagnostics.some((diag) => diag.category === ts8.DiagnosticCategory.Error);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/declaration.mjs
import ts9 from "typescript";
var DtsTransformRegistry = class {
  ivyDeclarationTransforms = /* @__PURE__ */ new Map();
  getIvyDeclarationTransform(sf) {
    if (!this.ivyDeclarationTransforms.has(sf)) {
      this.ivyDeclarationTransforms.set(sf, new IvyDeclarationDtsTransform());
    }
    return this.ivyDeclarationTransforms.get(sf);
  }
  getAllTransforms(sf) {
    if (!sf.isDeclarationFile) {
      return null;
    }
    const originalSf = ts9.getOriginalNode(sf);
    let transforms = null;
    if (this.ivyDeclarationTransforms.has(originalSf)) {
      transforms = [];
      transforms.push(this.ivyDeclarationTransforms.get(originalSf));
    }
    return transforms;
  }
};
function declarationTransformFactory(transformRegistry, reflector, refEmitter, importRewriter) {
  return (context) => {
    const transformer = new DtsTransformer(context, reflector, refEmitter, importRewriter);
    return (fileOrBundle) => {
      if (ts9.isBundle(fileOrBundle)) {
        return fileOrBundle;
      }
      const transforms = transformRegistry.getAllTransforms(fileOrBundle);
      if (transforms === null) {
        return fileOrBundle;
      }
      return transformer.transform(fileOrBundle, transforms);
    };
  };
}
var DtsTransformer = class {
  ctx;
  reflector;
  refEmitter;
  importRewriter;
  constructor(ctx, reflector, refEmitter, importRewriter) {
    this.ctx = ctx;
    this.reflector = reflector;
    this.refEmitter = refEmitter;
    this.importRewriter = importRewriter;
  }
  transform(sf, transforms) {
    const imports = new ImportManager({
      ...presetImportManagerForceNamespaceImports,
      rewriter: this.importRewriter
    });
    const visitor = (node) => {
      if (ts9.isClassDeclaration(node)) {
        return this.transformClassDeclaration(node, transforms, imports);
      } else if (ts9.isFunctionDeclaration(node)) {
        return this.transformFunctionDeclaration(node, transforms, imports);
      } else {
        return ts9.visitEachChild(node, visitor, this.ctx);
      }
    };
    sf = ts9.visitNode(sf, visitor, ts9.isSourceFile) || sf;
    return imports.transformTsFile(this.ctx, sf);
  }
  transformClassDeclaration(clazz, transforms, imports) {
    let elements = clazz.members;
    let elementsChanged = false;
    for (const transform of transforms) {
      if (transform.transformClassElement !== void 0) {
        for (let i = 0; i < elements.length; i++) {
          const res = transform.transformClassElement(elements[i], imports);
          if (res !== elements[i]) {
            if (!elementsChanged) {
              elements = [...elements];
              elementsChanged = true;
            }
            elements[i] = res;
          }
        }
      }
    }
    let newClazz = clazz;
    for (const transform of transforms) {
      if (transform.transformClass !== void 0) {
        const inputMembers = clazz === newClazz ? elements : newClazz.members;
        newClazz = transform.transformClass(newClazz, inputMembers, this.reflector, this.refEmitter, imports);
      }
    }
    if (elementsChanged && clazz === newClazz) {
      newClazz = ts9.factory.updateClassDeclaration(
        clazz,
        clazz.modifiers,
        clazz.name,
        clazz.typeParameters,
        clazz.heritageClauses,
        elements
      );
    }
    return newClazz;
  }
  transformFunctionDeclaration(declaration, transforms, imports) {
    let newDecl = declaration;
    for (const transform of transforms) {
      if (transform.transformFunctionDeclaration !== void 0) {
        newDecl = transform.transformFunctionDeclaration(newDecl, imports);
      }
    }
    return newDecl;
  }
};
var IvyDeclarationDtsTransform = class {
  declarationFields = /* @__PURE__ */ new Map();
  addFields(decl, fields) {
    this.declarationFields.set(decl, fields);
  }
  transformClass(clazz, members, reflector, refEmitter, imports) {
    const original = ts9.getOriginalNode(clazz);
    if (!this.declarationFields.has(original)) {
      return clazz;
    }
    const fields = this.declarationFields.get(original);
    const newMembers = fields.map((decl) => {
      const modifiers = [ts9.factory.createModifier(ts9.SyntaxKind.StaticKeyword)];
      const typeRef = translateType(decl.type, original.getSourceFile(), reflector, refEmitter, imports);
      markForEmitAsSingleLine(typeRef);
      return ts9.factory.createPropertyDeclaration(
        modifiers,
        decl.name,
        void 0,
        typeRef,
        void 0
      );
    });
    return ts9.factory.updateClassDeclaration(
      clazz,
      clazz.modifiers,
      clazz.name,
      clazz.typeParameters,
      clazz.heritageClauses,
      [...members, ...newMembers]
    );
  }
};
function markForEmitAsSingleLine(node) {
  ts9.setEmitFlags(node, ts9.EmitFlags.SingleLine);
  ts9.forEachChild(node, markForEmitAsSingleLine);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/transform.mjs
import { ConstantPool } from "@angular/compiler";
import ts11 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/util/src/visitor.mjs
import ts10 from "typescript";
function visit(node, visitor, context) {
  return visitor._visit(node, context);
}
var Visitor = class {
  _before = /* @__PURE__ */ new Map();
  _after = /* @__PURE__ */ new Map();
  _visitListEntryNode(node, visitor) {
    const result = visitor(node);
    if (result.before !== void 0) {
      this._before.set(result.node, result.before);
    }
    if (result.after !== void 0) {
      this._after.set(result.node, result.after);
    }
    return result.node;
  }
  visitOtherNode(node) {
    return node;
  }
  _visit(node, context) {
    let visitedNode = null;
    node = ts10.visitEachChild(node, (child) => child && this._visit(child, context), context);
    if (ts10.isClassDeclaration(node)) {
      visitedNode = this._visitListEntryNode(node, (node2) => this.visitClassDeclaration(node2));
    } else {
      visitedNode = this.visitOtherNode(node);
    }
    if (visitedNode && (ts10.isBlock(visitedNode) || ts10.isSourceFile(visitedNode))) {
      visitedNode = this._maybeProcessStatements(visitedNode);
    }
    return visitedNode;
  }
  _maybeProcessStatements(node) {
    if (node.statements.every((stmt) => !this._before.has(stmt) && !this._after.has(stmt))) {
      return node;
    }
    const newStatements = [];
    node.statements.forEach((stmt) => {
      if (this._before.has(stmt)) {
        newStatements.push(...this._before.get(stmt));
        this._before.delete(stmt);
      }
      newStatements.push(stmt);
      if (this._after.has(stmt)) {
        newStatements.push(...this._after.get(stmt));
        this._after.delete(stmt);
      }
    });
    const statementsArray = ts10.factory.createNodeArray(newStatements, node.statements.hasTrailingComma);
    if (ts10.isBlock(node)) {
      return ts10.factory.updateBlock(node, statementsArray);
    } else {
      return ts10.factory.updateSourceFile(node, statementsArray, node.isDeclarationFile, node.referencedFiles, node.typeReferenceDirectives, node.hasNoDefaultLib, node.libReferenceDirectives);
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/transform/src/transform.mjs
var NO_DECORATORS = /* @__PURE__ */ new Set();
var CLOSURE_FILE_OVERVIEW_REGEXP = /\s+@fileoverview\s+/i;
function ivyTransformFactory(compilation, reflector, importRewriter, defaultImportTracker, localCompilationExtraImportsTracker, perf, isCore, isClosureCompilerEnabled) {
  const recordWrappedNode = createRecorderFn(defaultImportTracker);
  return (context) => {
    return (file) => {
      return perf.inPhase(PerfPhase.Compile, () => transformIvySourceFile(compilation, context, reflector, importRewriter, localCompilationExtraImportsTracker, file, isCore, isClosureCompilerEnabled, recordWrappedNode));
    };
  };
}
var IvyCompilationVisitor = class extends Visitor {
  compilation;
  constantPool;
  classCompilationMap = /* @__PURE__ */ new Map();
  deferrableImports = /* @__PURE__ */ new Set();
  constructor(compilation, constantPool) {
    super();
    this.compilation = compilation;
    this.constantPool = constantPool;
  }
  visitClassDeclaration(node) {
    const result = this.compilation.compile(node, this.constantPool);
    if (result !== null) {
      this.classCompilationMap.set(node, result);
      for (const classResult of result) {
        if (classResult.deferrableImports !== null && classResult.deferrableImports.size > 0) {
          classResult.deferrableImports.forEach((importDecl) => this.deferrableImports.add(importDecl));
        }
      }
    }
    return { node };
  }
};
var IvyTransformationVisitor = class extends Visitor {
  compilation;
  classCompilationMap;
  reflector;
  importManager;
  recordWrappedNodeExpr;
  isClosureCompilerEnabled;
  isCore;
  deferrableImports;
  constructor(compilation, classCompilationMap, reflector, importManager, recordWrappedNodeExpr, isClosureCompilerEnabled, isCore, deferrableImports) {
    super();
    this.compilation = compilation;
    this.classCompilationMap = classCompilationMap;
    this.reflector = reflector;
    this.importManager = importManager;
    this.recordWrappedNodeExpr = recordWrappedNodeExpr;
    this.isClosureCompilerEnabled = isClosureCompilerEnabled;
    this.isCore = isCore;
    this.deferrableImports = deferrableImports;
  }
  visitClassDeclaration(node) {
    if (!this.classCompilationMap.has(node)) {
      return { node };
    }
    const translateOptions = {
      recordWrappedNode: this.recordWrappedNodeExpr,
      annotateForClosureCompiler: this.isClosureCompilerEnabled
    };
    const statements = [];
    const members = [...node.members];
    const sourceFile = ts11.getOriginalNode(node).getSourceFile();
    for (const field of this.classCompilationMap.get(node)) {
      if (field.initializer === null) {
        continue;
      }
      const exprNode = translateExpression(sourceFile, field.initializer, this.importManager, translateOptions);
      const property = ts11.factory.createPropertyDeclaration([ts11.factory.createToken(ts11.SyntaxKind.StaticKeyword)], field.name, void 0, void 0, exprNode);
      if (this.isClosureCompilerEnabled) {
        ts11.addSyntheticLeadingComment(
          property,
          ts11.SyntaxKind.MultiLineCommentTrivia,
          "* @nocollapse ",
          false
        );
      }
      field.statements.map((stmt) => translateStatement(sourceFile, stmt, this.importManager, translateOptions)).forEach((stmt) => statements.push(stmt));
      members.push(property);
    }
    const filteredDecorators = maybeFilterDecorator(ts11.getDecorators(node), this.compilation.decoratorsFor(node));
    const nodeModifiers = ts11.getModifiers(node);
    let updatedModifiers;
    if ((filteredDecorators == null ? void 0 : filteredDecorators.length) || (nodeModifiers == null ? void 0 : nodeModifiers.length)) {
      updatedModifiers = [...filteredDecorators || [], ...nodeModifiers || []];
    }
    node = ts11.factory.updateClassDeclaration(
      node,
      updatedModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses || [],
      members.map((member) => this._stripAngularDecorators(member))
    );
    return { node, after: statements };
  }
  visitOtherNode(node) {
    if (ts11.isImportDeclaration(node) && this.deferrableImports.has(node)) {
      return null;
    }
    return node;
  }
  _angularCoreDecorators(decl) {
    const decorators = this.reflector.getDecoratorsOfDeclaration(decl);
    if (decorators === null) {
      return NO_DECORATORS;
    }
    const coreDecorators = decorators.filter((dec) => this.isCore || isFromAngularCore(dec)).map((dec) => dec.node);
    if (coreDecorators.length > 0) {
      return new Set(coreDecorators);
    } else {
      return NO_DECORATORS;
    }
  }
  _nonCoreDecoratorsOnly(node) {
    const decorators = ts11.getDecorators(node);
    if (decorators === void 0) {
      return void 0;
    }
    const coreDecorators = this._angularCoreDecorators(node);
    if (coreDecorators.size === decorators.length) {
      return void 0;
    } else if (coreDecorators.size === 0) {
      return nodeArrayFromDecoratorsArray(decorators);
    }
    const filtered = decorators.filter((dec) => !coreDecorators.has(dec));
    if (filtered.length === 0) {
      return void 0;
    }
    return nodeArrayFromDecoratorsArray(filtered);
  }
  _stripAngularDecorators(node) {
    const modifiers = ts11.canHaveModifiers(node) ? ts11.getModifiers(node) : void 0;
    const nonCoreDecorators = ts11.canHaveDecorators(node) ? this._nonCoreDecoratorsOnly(node) : void 0;
    const combinedModifiers = [...nonCoreDecorators || [], ...modifiers || []];
    if (ts11.isParameter(node)) {
      node = ts11.factory.updateParameterDeclaration(node, combinedModifiers, node.dotDotDotToken, node.name, node.questionToken, node.type, node.initializer);
    } else if (ts11.isMethodDeclaration(node)) {
      node = ts11.factory.updateMethodDeclaration(node, combinedModifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
    } else if (ts11.isPropertyDeclaration(node)) {
      node = ts11.factory.updatePropertyDeclaration(node, combinedModifiers, node.name, node.questionToken, node.type, node.initializer);
    } else if (ts11.isGetAccessor(node)) {
      node = ts11.factory.updateGetAccessorDeclaration(node, combinedModifiers, node.name, node.parameters, node.type, node.body);
    } else if (ts11.isSetAccessor(node)) {
      node = ts11.factory.updateSetAccessorDeclaration(node, combinedModifiers, node.name, node.parameters, node.body);
    } else if (ts11.isConstructorDeclaration(node)) {
      const parameters = node.parameters.map((param) => this._stripAngularDecorators(param));
      node = ts11.factory.updateConstructorDeclaration(node, modifiers, parameters, node.body);
    }
    return node;
  }
};
function transformIvySourceFile(compilation, context, reflector, importRewriter, localCompilationExtraImportsTracker, file, isCore, isClosureCompilerEnabled, recordWrappedNode) {
  const constantPool = new ConstantPool(isClosureCompilerEnabled);
  const importManager = new ImportManager({
    ...presetImportManagerForceNamespaceImports,
    rewriter: importRewriter
  });
  const compilationVisitor = new IvyCompilationVisitor(compilation, constantPool);
  visit(file, compilationVisitor, context);
  const transformationVisitor = new IvyTransformationVisitor(compilation, compilationVisitor.classCompilationMap, reflector, importManager, recordWrappedNode, isClosureCompilerEnabled, isCore, compilationVisitor.deferrableImports);
  let sf = visit(file, transformationVisitor, context);
  const downlevelTranslatedCode = getLocalizeCompileTarget(context) < ts11.ScriptTarget.ES2015;
  const constants = constantPool.statements.map((stmt) => translateStatement(file, stmt, importManager, {
    recordWrappedNode,
    downlevelTaggedTemplates: downlevelTranslatedCode,
    downlevelVariableDeclarations: downlevelTranslatedCode,
    annotateForClosureCompiler: isClosureCompilerEnabled
  }));
  const fileOverviewMeta = isClosureCompilerEnabled ? getFileOverviewComment(sf.statements) : null;
  if (localCompilationExtraImportsTracker !== null) {
    for (const moduleName of localCompilationExtraImportsTracker.getImportsForFile(sf)) {
      importManager.addSideEffectImport(sf, moduleName);
    }
  }
  sf = importManager.transformTsFile(context, sf, constants);
  if (fileOverviewMeta !== null) {
    sf = insertFileOverviewComment(sf, fileOverviewMeta);
  }
  return sf;
}
function getLocalizeCompileTarget(context) {
  const target = context.getCompilerOptions().target || ts11.ScriptTarget.ES2015;
  return target !== ts11.ScriptTarget.JSON ? target : ts11.ScriptTarget.ES2015;
}
function getFileOverviewComment(statements) {
  if (statements.length > 0) {
    const host = statements[0];
    let trailing = false;
    let comments = ts11.getSyntheticLeadingComments(host);
    if (!comments || comments.length === 0) {
      trailing = true;
      comments = ts11.getSyntheticTrailingComments(host);
    }
    if (comments && comments.length > 0 && CLOSURE_FILE_OVERVIEW_REGEXP.test(comments[0].text)) {
      return { comments, host, trailing };
    }
  }
  return null;
}
function insertFileOverviewComment(sf, fileoverview) {
  const { comments, host, trailing } = fileoverview;
  if (sf.statements.length > 0 && host !== sf.statements[0]) {
    if (trailing) {
      ts11.setSyntheticTrailingComments(host, void 0);
    } else {
      ts11.setSyntheticLeadingComments(host, void 0);
    }
    const commentNode = ts11.factory.createNotEmittedStatement(sf);
    ts11.setSyntheticLeadingComments(commentNode, comments);
    return ts11.factory.updateSourceFile(sf, [commentNode, ...sf.statements], sf.isDeclarationFile, sf.referencedFiles, sf.typeReferenceDirectives, sf.hasNoDefaultLib, sf.libReferenceDirectives);
  }
  return sf;
}
function maybeFilterDecorator(decorators, toRemove) {
  if (decorators === void 0) {
    return void 0;
  }
  const filtered = decorators.filter((dec) => toRemove.find((decToRemove) => ts11.getOriginalNode(dec) === decToRemove) === void 0);
  if (filtered.length === 0) {
    return void 0;
  }
  return ts11.factory.createNodeArray(filtered);
}
function isFromAngularCore(decorator) {
  return decorator.import !== null && decorator.import.from === "@angular/core";
}
function createRecorderFn(defaultImportTracker) {
  return (node) => {
    const importDecl = getDefaultImportDeclaration(node);
    if (importDecl !== null) {
      defaultImportTracker.recordUsedImport(importDecl);
    }
  };
}
function nodeArrayFromDecoratorsArray(decorators) {
  const array = ts11.factory.createNodeArray(decorators);
  if (array.length > 0) {
    array.pos = decorators[0].pos;
    array.end = decorators[decorators.length - 1].end;
  }
  return array;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/diagnostics.mjs
function makeDuplicateDeclarationError(node, data, kind) {
  const context = [];
  for (const decl of data) {
    if (decl.rawDeclarations === null) {
      continue;
    }
    const contextNode = decl.ref.getOriginForDiagnostics(decl.rawDeclarations, decl.ngModule.name);
    context.push(makeRelatedInformation(contextNode, `'${node.name.text}' is listed in the declarations of the NgModule '${decl.ngModule.name.text}'.`));
  }
  return makeDiagnostic(ErrorCode.NGMODULE_DECLARATION_NOT_UNIQUE, node.name, `The ${kind} '${node.name.text}' is declared by more than one NgModule.`, context);
}
function createValueHasWrongTypeError(node, value, messageText) {
  var _a;
  let chainedMessage;
  let relatedInformation;
  if (value instanceof DynamicValue) {
    chainedMessage = "Value could not be determined statically.";
    relatedInformation = traceDynamicValue(node, value);
  } else if (value instanceof Reference) {
    const target = value.debugName !== null ? `'${value.debugName}'` : "an anonymous declaration";
    chainedMessage = `Value is a reference to ${target}.`;
    const referenceNode = (_a = identifierOfNode(value.node)) != null ? _a : value.node;
    relatedInformation = [makeRelatedInformation(referenceNode, "Reference is declared here.")];
  } else {
    chainedMessage = `Value is of type '${describeResolvedType(value)}'.`;
  }
  const chain = {
    messageText,
    category: ts12.DiagnosticCategory.Error,
    code: 0,
    next: [
      {
        messageText: chainedMessage,
        category: ts12.DiagnosticCategory.Message,
        code: 0
      }
    ]
  };
  return new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, node, chain, relatedInformation);
}
function getProviderDiagnostics(providerClasses, providersDeclaration, registry) {
  const diagnostics = [];
  for (const provider of providerClasses) {
    const injectableMeta = registry.getInjectableMeta(provider.node);
    if (injectableMeta !== null) {
      continue;
    }
    const contextNode = provider.getOriginForDiagnostics(providersDeclaration);
    diagnostics.push(makeDiagnostic(ErrorCode.UNDECORATED_PROVIDER, contextNode, `The class '${provider.node.name.text}' cannot be created via dependency injection, as it does not have an Angular decorator. This will result in an error at runtime.

Either add the @Injectable() decorator to '${provider.node.name.text}', or configure a different provider (such as a provider with 'useFactory').
`, [makeRelatedInformation(provider.node, `'${provider.node.name.text}' is declared here.`)]));
  }
  return diagnostics;
}
function getDirectiveDiagnostics(node, injectableRegistry, evaluator, reflector, scopeRegistry, strictInjectionParameters, kind) {
  let diagnostics = [];
  const addDiagnostics = (more) => {
    if (more === null) {
      return;
    } else if (diagnostics === null) {
      diagnostics = Array.isArray(more) ? more : [more];
    } else if (Array.isArray(more)) {
      diagnostics.push(...more);
    } else {
      diagnostics.push(more);
    }
  };
  const duplicateDeclarations = scopeRegistry.getDuplicateDeclarations(node);
  if (duplicateDeclarations !== null) {
    addDiagnostics(makeDuplicateDeclarationError(node, duplicateDeclarations, kind));
  }
  addDiagnostics(checkInheritanceOfInjectable(node, injectableRegistry, reflector, evaluator, strictInjectionParameters, kind));
  return diagnostics;
}
function validateHostDirectives(origin, hostDirectives, metaReader) {
  const diagnostics = [];
  for (const current of hostDirectives) {
    if (!isHostDirectiveMetaForGlobalMode(current)) {
      throw new Error("Impossible state: diagnostics code path for local compilation");
    }
    const hostMeta = flattenInheritedDirectiveMetadata(metaReader, current.directive);
    if (hostMeta === null) {
      diagnostics.push(makeDiagnostic(ErrorCode.HOST_DIRECTIVE_INVALID, current.directive.getOriginForDiagnostics(origin), `${current.directive.debugName} must be a standalone directive to be used as a host directive`));
      continue;
    }
    if (!hostMeta.isStandalone) {
      diagnostics.push(makeDiagnostic(ErrorCode.HOST_DIRECTIVE_NOT_STANDALONE, current.directive.getOriginForDiagnostics(origin), `Host directive ${hostMeta.name} must be standalone`));
    }
    if (hostMeta.isComponent) {
      diagnostics.push(makeDiagnostic(ErrorCode.HOST_DIRECTIVE_COMPONENT, current.directive.getOriginForDiagnostics(origin), `Host directive ${hostMeta.name} cannot be a component`));
    }
    const requiredInputNames = Array.from(hostMeta.inputs).filter((input) => input.required).map((input) => input.classPropertyName);
    validateHostDirectiveMappings("input", current, hostMeta, origin, diagnostics, requiredInputNames.length > 0 ? new Set(requiredInputNames) : null);
    validateHostDirectiveMappings("output", current, hostMeta, origin, diagnostics, null);
  }
  return diagnostics;
}
function validateHostDirectiveMappings(bindingType, hostDirectiveMeta, meta, origin, diagnostics, requiredBindings) {
  if (!isHostDirectiveMetaForGlobalMode(hostDirectiveMeta)) {
    throw new Error("Impossible state: diagnostics code path for local compilation");
  }
  const className = meta.name;
  const hostDirectiveMappings = bindingType === "input" ? hostDirectiveMeta.inputs : hostDirectiveMeta.outputs;
  const existingBindings = bindingType === "input" ? meta.inputs : meta.outputs;
  const exposedRequiredBindings = /* @__PURE__ */ new Set();
  for (const publicName in hostDirectiveMappings) {
    if (hostDirectiveMappings.hasOwnProperty(publicName)) {
      const bindings = existingBindings.getByBindingPropertyName(publicName);
      if (bindings === null) {
        diagnostics.push(makeDiagnostic(ErrorCode.HOST_DIRECTIVE_UNDEFINED_BINDING, hostDirectiveMeta.directive.getOriginForDiagnostics(origin), `Directive ${className} does not have an ${bindingType} with a public name of ${publicName}.`));
      } else if (requiredBindings !== null) {
        for (const field of bindings) {
          if (requiredBindings.has(field.classPropertyName)) {
            exposedRequiredBindings.add(field.classPropertyName);
          }
        }
      }
      const remappedPublicName = hostDirectiveMappings[publicName];
      const bindingsForPublicName = existingBindings.getByBindingPropertyName(remappedPublicName);
      if (bindingsForPublicName !== null) {
        for (const binding of bindingsForPublicName) {
          if (binding.bindingPropertyName !== publicName) {
            diagnostics.push(makeDiagnostic(ErrorCode.HOST_DIRECTIVE_CONFLICTING_ALIAS, hostDirectiveMeta.directive.getOriginForDiagnostics(origin), `Cannot alias ${bindingType} ${publicName} of host directive ${className} to ${remappedPublicName}, because it already has a different ${bindingType} with the same public name.`));
          }
        }
      }
    }
  }
  if (requiredBindings !== null && requiredBindings.size !== exposedRequiredBindings.size) {
    const missingBindings = [];
    for (const publicName of requiredBindings) {
      if (!exposedRequiredBindings.has(publicName)) {
        const name = existingBindings.getByClassPropertyName(publicName);
        if (name) {
          missingBindings.push(`'${name.bindingPropertyName}'`);
        }
      }
    }
    diagnostics.push(makeDiagnostic(ErrorCode.HOST_DIRECTIVE_MISSING_REQUIRED_BINDING, hostDirectiveMeta.directive.getOriginForDiagnostics(origin), `Required ${bindingType}${missingBindings.length === 1 ? "" : "s"} ${missingBindings.join(", ")} from host directive ${className} must be exposed.`));
  }
}
function getUndecoratedClassWithAngularFeaturesDiagnostic(node) {
  return makeDiagnostic(ErrorCode.UNDECORATED_CLASS_USING_ANGULAR_FEATURES, node.name, `Class is using Angular features but is not decorated. Please add an explicit Angular decorator.`);
}
function checkInheritanceOfInjectable(node, injectableRegistry, reflector, evaluator, strictInjectionParameters, kind) {
  const classWithCtor = findInheritedCtor(node, injectableRegistry, reflector, evaluator);
  if (classWithCtor === null || classWithCtor.isCtorValid) {
    return null;
  }
  if (!classWithCtor.isDecorated) {
    return getInheritedUndecoratedCtorDiagnostic(node, classWithCtor.ref, kind);
  }
  if (isFromDtsFile(classWithCtor.ref.node)) {
    return null;
  }
  if (!strictInjectionParameters || isAbstractClassDeclaration(node)) {
    return null;
  }
  return getInheritedInvalidCtorDiagnostic(node, classWithCtor.ref, kind);
}
function findInheritedCtor(node, injectableRegistry, reflector, evaluator) {
  if (!reflector.isClass(node) || reflector.getConstructorParameters(node) !== null) {
    return null;
  }
  let baseClass = readBaseClass(node, reflector, evaluator);
  while (baseClass !== null) {
    if (baseClass === "dynamic") {
      return null;
    }
    const injectableMeta = injectableRegistry.getInjectableMeta(baseClass.node);
    if (injectableMeta !== null) {
      if (injectableMeta.ctorDeps !== null) {
        return {
          ref: baseClass,
          isCtorValid: injectableMeta.ctorDeps !== "invalid",
          isDecorated: true
        };
      }
    } else {
      const baseClassConstructorParams = reflector.getConstructorParameters(baseClass.node);
      if (baseClassConstructorParams !== null) {
        return {
          ref: baseClass,
          isCtorValid: baseClassConstructorParams.length === 0,
          isDecorated: false
        };
      }
    }
    baseClass = readBaseClass(baseClass.node, reflector, evaluator);
  }
  return null;
}
function getInheritedInvalidCtorDiagnostic(node, baseClass, kind) {
  const baseClassName = baseClass.debugName;
  return makeDiagnostic(ErrorCode.INJECTABLE_INHERITS_INVALID_CONSTRUCTOR, node.name, `The ${kind.toLowerCase()} ${node.name.text} inherits its constructor from ${baseClassName}, but the latter has a constructor parameter that is not compatible with dependency injection. Either add an explicit constructor to ${node.name.text} or change ${baseClassName}'s constructor to use parameters that are valid for DI.`);
}
function getInheritedUndecoratedCtorDiagnostic(node, baseClass, kind) {
  const baseClassName = baseClass.debugName;
  const baseNeedsDecorator = kind === "Component" || kind === "Directive" ? "Directive" : "Injectable";
  return makeDiagnostic(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR, node.name, `The ${kind.toLowerCase()} ${node.name.text} inherits its constructor from ${baseClassName}, but the latter does not have an Angular decorator of its own. Dependency injection will not be able to resolve the parameters of ${baseClassName}'s constructor. Either add a @${baseNeedsDecorator} decorator to ${baseClassName}, or add an explicit constructor to ${node.name.text}.`);
}
function assertLocalCompilationUnresolvedConst(compilationMode, value, nodeToHighlight, errorMessage) {
  if (compilationMode === CompilationMode.LOCAL && value instanceof DynamicValue && value.isFromUnknownIdentifier()) {
    throw new FatalDiagnosticError(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST, nodeToHighlight != null ? nodeToHighlight : value.node, errorMessage);
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/evaluation.mjs
import { ViewEncapsulation } from "@angular/compiler";
import ts13 from "typescript";
function resolveEnumValue(evaluator, metadata, field, enumSymbolName) {
  let resolved = null;
  if (metadata.has(field)) {
    const expr = metadata.get(field);
    const value = evaluator.evaluate(expr);
    if (value instanceof EnumValue && isAngularCoreReference(value.enumRef, enumSymbolName)) {
      resolved = value.resolved;
    } else {
      throw createValueHasWrongTypeError(expr, value, `${field} must be a member of ${enumSymbolName} enum from @angular/core`);
    }
  }
  return resolved;
}
function resolveEncapsulationEnumValueLocally(expr) {
  if (!expr) {
    return null;
  }
  const exprText = expr.getText().trim();
  for (const key in ViewEncapsulation) {
    if (!Number.isNaN(Number(key))) {
      continue;
    }
    const suffix = `ViewEncapsulation.${key}`;
    if (exprText === suffix || exprText.endsWith(`.${suffix}`)) {
      const ans = Number(ViewEncapsulation[key]);
      return ans;
    }
  }
  return null;
}
function isStringArray(resolvedValue) {
  return Array.isArray(resolvedValue) && resolvedValue.every((elem) => typeof elem === "string");
}
function resolveLiteral(decorator, literalCache) {
  if (literalCache.has(decorator)) {
    return literalCache.get(decorator);
  }
  if (decorator.args === null || decorator.args.length !== 1) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, `Incorrect number of arguments to @${decorator.name} decorator`);
  }
  const meta = unwrapExpression(decorator.args[0]);
  if (!ts13.isObjectLiteralExpression(meta)) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, `Decorator argument must be literal.`);
  }
  literalCache.set(decorator, meta);
  return meta;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/factory.mjs
import { compileDeclareFactoryFunction, compileFactoryFunction } from "@angular/compiler";
function compileNgFactoryDefField(metadata) {
  const res = compileFactoryFunction(metadata);
  return {
    name: "\u0275fac",
    initializer: res.expression,
    statements: res.statements,
    type: res.type,
    deferrableImports: null
  };
}
function compileDeclareFactory(metadata) {
  const res = compileDeclareFactoryFunction(metadata);
  return {
    name: "\u0275fac",
    initializer: res.expression,
    statements: res.statements,
    type: res.type,
    deferrableImports: null
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/injectable_registry.mjs
var InjectableClassRegistry = class {
  host;
  isCore;
  classes = /* @__PURE__ */ new Map();
  constructor(host, isCore) {
    this.host = host;
    this.isCore = isCore;
  }
  registerInjectable(declaration, meta) {
    this.classes.set(declaration, meta);
  }
  getInjectableMeta(declaration) {
    if (this.classes.has(declaration)) {
      return this.classes.get(declaration);
    }
    if (!hasInjectableFields(declaration, this.host)) {
      return null;
    }
    const ctorDeps = getConstructorDependencies(declaration, this.host, this.isCore);
    const meta = {
      ctorDeps: unwrapConstructorDependencies(ctorDeps)
    };
    this.classes.set(declaration, meta);
    return meta;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.mjs
import { ArrowFunctionExpr, LiteralArrayExpr, LiteralExpr as LiteralExpr2, literalMap, WrappedNodeExpr as WrappedNodeExpr3 } from "@angular/compiler";
import ts14 from "typescript";
function extractClassMetadata(clazz, reflection, isCore, annotateForClosureCompiler, angularDecoratorTransform = (dec) => dec) {
  if (!reflection.isClass(clazz)) {
    return null;
  }
  const id = clazz.name;
  const classDecorators = reflection.getDecoratorsOfDeclaration(clazz);
  if (classDecorators === null) {
    return null;
  }
  const ngClassDecorators = classDecorators.filter((dec) => isAngularDecorator2(dec, isCore)).map((decorator) => decoratorToMetadata(angularDecoratorTransform(decorator), annotateForClosureCompiler)).map((decorator) => removeIdentifierReferences(decorator, id.text));
  if (ngClassDecorators.length === 0) {
    return null;
  }
  const metaDecorators = new WrappedNodeExpr3(ts14.factory.createArrayLiteralExpression(ngClassDecorators));
  let metaCtorParameters = null;
  const classCtorParameters = reflection.getConstructorParameters(clazz);
  if (classCtorParameters !== null) {
    const ctorParameters = classCtorParameters.map((param) => ctorParameterToMetadata(param, isCore));
    metaCtorParameters = new ArrowFunctionExpr([], new LiteralArrayExpr(ctorParameters));
  }
  let metaPropDecorators = null;
  const classMembers = reflection.getMembersOfClass(clazz).filter((member) => !member.isStatic && member.decorators !== null && member.decorators.length > 0);
  const duplicateDecoratedMemberNames = classMembers.map((member) => member.name).filter((name, i, arr) => arr.indexOf(name) < i);
  if (duplicateDecoratedMemberNames.length > 0) {
    throw new Error(`Duplicate decorated properties found on class '${clazz.name.text}': ` + duplicateDecoratedMemberNames.join(", "));
  }
  const decoratedMembers = classMembers.map((member) => {
    var _a;
    return classMemberToMetadata((_a = member.nameNode) != null ? _a : member.name, member.decorators, isCore);
  });
  if (decoratedMembers.length > 0) {
    metaPropDecorators = new WrappedNodeExpr3(ts14.factory.createObjectLiteralExpression(decoratedMembers));
  }
  return {
    type: new WrappedNodeExpr3(id),
    decorators: metaDecorators,
    ctorParameters: metaCtorParameters,
    propDecorators: metaPropDecorators
  };
}
function ctorParameterToMetadata(param, isCore) {
  const type = param.typeValueReference.kind !== 2 ? valueReferenceToExpression(param.typeValueReference) : new LiteralExpr2(void 0);
  const mapEntries = [
    { key: "type", value: type, quoted: false }
  ];
  if (param.decorators !== null) {
    const ngDecorators = param.decorators.filter((dec) => isAngularDecorator2(dec, isCore)).map((decorator) => decoratorToMetadata(decorator));
    const value = new WrappedNodeExpr3(ts14.factory.createArrayLiteralExpression(ngDecorators));
    mapEntries.push({ key: "decorators", value, quoted: false });
  }
  return literalMap(mapEntries);
}
function classMemberToMetadata(name, decorators, isCore) {
  const ngDecorators = decorators.filter((dec) => isAngularDecorator2(dec, isCore)).map((decorator) => decoratorToMetadata(decorator));
  const decoratorMeta = ts14.factory.createArrayLiteralExpression(ngDecorators);
  return ts14.factory.createPropertyAssignment(name, decoratorMeta);
}
function decoratorToMetadata(decorator, wrapFunctionsInParens) {
  if (decorator.identifier === null) {
    throw new Error("Illegal state: synthesized decorator cannot be emitted in class metadata.");
  }
  const properties = [
    ts14.factory.createPropertyAssignment("type", decorator.identifier)
  ];
  if (decorator.args !== null && decorator.args.length > 0) {
    const args = decorator.args.map((arg) => {
      return wrapFunctionsInParens ? wrapFunctionExpressionsInParens(arg) : arg;
    });
    properties.push(ts14.factory.createPropertyAssignment("args", ts14.factory.createArrayLiteralExpression(args)));
  }
  return ts14.factory.createObjectLiteralExpression(properties, true);
}
function isAngularDecorator2(decorator, isCore) {
  return isCore || decorator.import !== null && decorator.import.from === "@angular/core";
}
function removeIdentifierReferences(node, names) {
  const result = ts14.transform(node, [
    (context) => (root) => ts14.visitNode(root, function walk(current) {
      return ts14.isIdentifier(current) && (typeof names === "string" ? current.text === names : names.has(current.text)) ? ts14.factory.createIdentifier(current.text) : ts14.visitEachChild(current, walk, context);
    })
  ]);
  return result.transformed[0];
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/debug_info.mjs
import { literal as literal2, WrappedNodeExpr as WrappedNodeExpr4 } from "@angular/compiler";
function extractClassDebugInfo(clazz, reflection, compilerHost, rootDirs, forbidOrphanRendering) {
  if (!reflection.isClass(clazz)) {
    return null;
  }
  const srcFile = clazz.getSourceFile();
  const srcFileMaybeRelativePath = getProjectRelativePath(srcFile.fileName, rootDirs, compilerHost);
  return {
    type: new WrappedNodeExpr4(clazz.name),
    className: literal2(clazz.name.getText()),
    filePath: srcFileMaybeRelativePath ? literal2(srcFileMaybeRelativePath) : null,
    lineNumber: literal2(srcFile.getLineAndCharacterOfPosition(clazz.name.pos).line + 1),
    forbidOrphanRendering
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/references_registry.mjs
var NoopReferencesRegistry = class {
  add(source, ...references) {
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/schema.mjs
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/compiler";
function extractSchemas(rawExpr, evaluator, context) {
  const schemas = [];
  const result = evaluator.evaluate(rawExpr);
  if (!Array.isArray(result)) {
    throw createValueHasWrongTypeError(rawExpr, result, `${context}.schemas must be an array`);
  }
  for (const schemaRef of result) {
    if (!(schemaRef instanceof Reference)) {
      throw createValueHasWrongTypeError(rawExpr, result, `${context}.schemas must be an array of schemas`);
    }
    const id = schemaRef.getIdentityIn(schemaRef.node.getSourceFile());
    if (id === null || schemaRef.ownedByModuleGuess !== "@angular/core") {
      throw createValueHasWrongTypeError(rawExpr, result, `${context}.schemas must be an array of schemas`);
    }
    switch (id.text) {
      case "CUSTOM_ELEMENTS_SCHEMA":
        schemas.push(CUSTOM_ELEMENTS_SCHEMA);
        break;
      case "NO_ERRORS_SCHEMA":
        schemas.push(NO_ERRORS_SCHEMA);
        break;
      default:
        throw createValueHasWrongTypeError(rawExpr, schemaRef, `'${schemaRef.debugName}' is not a valid ${context} schema`);
    }
  }
  return schemas;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/input_transforms.mjs
import { outputAst } from "@angular/compiler";
function compileInputTransformFields(inputs) {
  const extraFields = [];
  for (const input of inputs) {
    if (input.transform) {
      extraFields.push({
        name: `ngAcceptInputType_${input.classPropertyName}`,
        type: outputAst.transplantedType(input.transform.type),
        statements: [],
        initializer: null,
        deferrableImports: null
      });
    }
  }
  return extraFields;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/common/src/jit_declaration_registry.mjs
var JitDeclarationRegistry = class {
  jitDeclarations = /* @__PURE__ */ new Set();
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.mjs
import { compileClassDebugInfo, compileHmrInitializer, compileComponentClassMetadata, compileComponentDeclareClassMetadata, compileComponentFromMetadata, compileDeclareComponentFromMetadata, compileDeferResolverFunction, ConstantPool as ConstantPool2, CssSelector as CssSelector4, DEFAULT_INTERPOLATION_CONFIG as DEFAULT_INTERPOLATION_CONFIG2, DomElementSchemaRegistry as DomElementSchemaRegistry3, ExternalExpr as ExternalExpr8, FactoryTarget as FactoryTarget3, makeBindingParser as makeBindingParser2, outputAst as o4, R3TargetBinder, R3TemplateDependencyKind, SelectorMatcher as SelectorMatcher3, ViewEncapsulation as ViewEncapsulation2 } from "@angular/compiler";
import ts47 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/semantic_graph/src/api.mjs
import ts15 from "typescript";
var SemanticSymbol = class {
  decl;
  path;
  identifier;
  constructor(decl) {
    this.decl = decl;
    this.path = absoluteFromSourceFile(decl.getSourceFile());
    this.identifier = getSymbolIdentifier(decl);
  }
};
function getSymbolIdentifier(decl) {
  if (!ts15.isSourceFile(decl.parent)) {
    return null;
  }
  return decl.name.text;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/semantic_graph/src/graph.mjs
import { ExternalExpr as ExternalExpr2 } from "@angular/compiler";
var OpaqueSymbol = class extends SemanticSymbol {
  isPublicApiAffected() {
    return false;
  }
  isTypeCheckApiAffected() {
    return false;
  }
};
var SemanticDepGraph = class {
  files = /* @__PURE__ */ new Map();
  symbolByDecl = /* @__PURE__ */ new Map();
  registerSymbol(symbol) {
    this.symbolByDecl.set(symbol.decl, symbol);
    if (symbol.identifier !== null) {
      if (!this.files.has(symbol.path)) {
        this.files.set(symbol.path, /* @__PURE__ */ new Map());
      }
      this.files.get(symbol.path).set(symbol.identifier, symbol);
    }
  }
  getEquivalentSymbol(symbol) {
    let previousSymbol = this.getSymbolByDecl(symbol.decl);
    if (previousSymbol === null && symbol.identifier !== null) {
      previousSymbol = this.getSymbolByName(symbol.path, symbol.identifier);
    }
    return previousSymbol;
  }
  getSymbolByName(path, identifier) {
    if (!this.files.has(path)) {
      return null;
    }
    const file = this.files.get(path);
    if (!file.has(identifier)) {
      return null;
    }
    return file.get(identifier);
  }
  getSymbolByDecl(decl) {
    if (!this.symbolByDecl.has(decl)) {
      return null;
    }
    return this.symbolByDecl.get(decl);
  }
};
var SemanticDepGraphUpdater = class {
  priorGraph;
  newGraph = new SemanticDepGraph();
  opaqueSymbols = /* @__PURE__ */ new Map();
  constructor(priorGraph) {
    this.priorGraph = priorGraph;
  }
  registerSymbol(symbol) {
    this.newGraph.registerSymbol(symbol);
  }
  finalize() {
    if (this.priorGraph === null) {
      return {
        needsEmit: /* @__PURE__ */ new Set(),
        needsTypeCheckEmit: /* @__PURE__ */ new Set(),
        newGraph: this.newGraph
      };
    }
    const needsEmit = this.determineInvalidatedFiles(this.priorGraph);
    const needsTypeCheckEmit = this.determineInvalidatedTypeCheckFiles(this.priorGraph);
    return {
      needsEmit,
      needsTypeCheckEmit,
      newGraph: this.newGraph
    };
  }
  determineInvalidatedFiles(priorGraph) {
    const isPublicApiAffected = /* @__PURE__ */ new Set();
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isPublicApiAffected(previousSymbol)) {
        isPublicApiAffected.add(symbol);
      }
    }
    const needsEmit = /* @__PURE__ */ new Set();
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      if (symbol.isEmitAffected === void 0) {
        continue;
      }
      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isEmitAffected(previousSymbol, isPublicApiAffected)) {
        needsEmit.add(symbol.path);
      }
    }
    return needsEmit;
  }
  determineInvalidatedTypeCheckFiles(priorGraph) {
    const isTypeCheckApiAffected = /* @__PURE__ */ new Set();
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isTypeCheckApiAffected(previousSymbol)) {
        isTypeCheckApiAffected.add(symbol);
      }
    }
    const needsTypeCheckEmit = /* @__PURE__ */ new Set();
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      if (symbol.isTypeCheckBlockAffected === void 0) {
        continue;
      }
      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isTypeCheckBlockAffected(previousSymbol, isTypeCheckApiAffected)) {
        needsTypeCheckEmit.add(symbol.path);
      }
    }
    return needsTypeCheckEmit;
  }
  getSemanticReference(decl, expr) {
    return {
      symbol: this.getSymbol(decl),
      importPath: getImportPath(expr)
    };
  }
  getSymbol(decl) {
    const symbol = this.newGraph.getSymbolByDecl(decl);
    if (symbol === null) {
      return this.getOpaqueSymbol(decl);
    }
    return symbol;
  }
  getOpaqueSymbol(decl) {
    if (this.opaqueSymbols.has(decl)) {
      return this.opaqueSymbols.get(decl);
    }
    const symbol = new OpaqueSymbol(decl);
    this.opaqueSymbols.set(decl, symbol);
    return symbol;
  }
};
function getImportPath(expr) {
  if (expr instanceof ExternalExpr2) {
    return `${expr.value.moduleName}$${expr.value.name}`;
  } else {
    return null;
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/semantic_graph/src/type_parameters.mjs
import ts16 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/semantic_graph/src/util.mjs
function isSymbolEqual(a, b) {
  if (a.decl === b.decl) {
    return true;
  }
  if (a.identifier === null || b.identifier === null) {
    return false;
  }
  return a.path === b.path && a.identifier === b.identifier;
}
function isReferenceEqual(a, b) {
  if (!isSymbolEqual(a.symbol, b.symbol)) {
    return false;
  }
  return a.importPath === b.importPath;
}
function referenceEquality(a, b) {
  return a === b;
}
function isArrayEqual(a, b, equalityTester = referenceEquality) {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.length !== b.length) {
    return false;
  }
  return !a.some((item, index) => !equalityTester(item, b[index]));
}
function isSetEqual(a, b, equalityTester = referenceEquality) {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const itemA of a) {
    let found = false;
    for (const itemB of b) {
      if (equalityTester(itemA, itemB)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/semantic_graph/src/type_parameters.mjs
function extractSemanticTypeParameters(node) {
  if (!ts16.isClassDeclaration(node) || node.typeParameters === void 0) {
    return null;
  }
  return node.typeParameters.map((typeParam) => ({
    hasGenericTypeBound: typeParam.constraint !== void 0
  }));
}
function areTypeParametersEqual(current, previous) {
  if (!isArrayEqual(current, previous, isTypeParameterEqual)) {
    return false;
  }
  if (current !== null && current.some((typeParam) => typeParam.hasGenericTypeBound)) {
    return false;
  }
  return true;
}
function isTypeParameterEqual(a, b) {
  return a.hasGenericTypeBound === b.hasGenericTypeBound;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/api.mjs
var ComponentScopeKind;
(function(ComponentScopeKind2) {
  ComponentScopeKind2[ComponentScopeKind2["NgModule"] = 0] = "NgModule";
  ComponentScopeKind2[ComponentScopeKind2["Standalone"] = 1] = "Standalone";
})(ComponentScopeKind || (ComponentScopeKind = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/component_scope.mjs
var CompoundComponentScopeReader = class {
  readers;
  constructor(readers) {
    this.readers = readers;
  }
  getScopeForComponent(clazz) {
    for (const reader of this.readers) {
      const meta = reader.getScopeForComponent(clazz);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
  getRemoteScope(clazz) {
    for (const reader of this.readers) {
      const remoteScope = reader.getRemoteScope(clazz);
      if (remoteScope !== null) {
        return remoteScope;
      }
    }
    return null;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/dependency.mjs
var MetadataDtsModuleScopeResolver = class {
  dtsMetaReader;
  aliasingHost;
  cache = /* @__PURE__ */ new Map();
  constructor(dtsMetaReader, aliasingHost) {
    this.dtsMetaReader = dtsMetaReader;
    this.aliasingHost = aliasingHost;
  }
  resolve(ref) {
    const clazz = ref.node;
    const sourceFile = clazz.getSourceFile();
    if (!sourceFile.isDeclarationFile) {
      throw new Error(`Debug error: DtsModuleScopeResolver.read(${ref.debugName} from ${sourceFile.fileName}), but not a .d.ts file`);
    }
    if (this.cache.has(clazz)) {
      return this.cache.get(clazz);
    }
    const dependencies = [];
    const meta = this.dtsMetaReader.getNgModuleMetadata(ref);
    if (meta === null) {
      this.cache.set(clazz, null);
      return null;
    }
    const declarations = /* @__PURE__ */ new Set();
    for (const declRef of meta.declarations) {
      declarations.add(declRef.node);
    }
    for (const exportRef of meta.exports) {
      const directive = this.dtsMetaReader.getDirectiveMetadata(exportRef);
      if (directive !== null) {
        const isReExport = !declarations.has(exportRef.node);
        dependencies.push(this.maybeAlias(directive, sourceFile, isReExport));
        continue;
      }
      const pipe = this.dtsMetaReader.getPipeMetadata(exportRef);
      if (pipe !== null) {
        const isReExport = !declarations.has(exportRef.node);
        dependencies.push(this.maybeAlias(pipe, sourceFile, isReExport));
        continue;
      }
      const exportScope2 = this.resolve(exportRef);
      if (exportScope2 !== null) {
        if (this.aliasingHost === null) {
          dependencies.push(...exportScope2.exported.dependencies);
        } else {
          for (const dep of exportScope2.exported.dependencies) {
            dependencies.push(this.maybeAlias(dep, sourceFile, true));
          }
        }
      }
      continue;
    }
    const exportScope = {
      exported: {
        dependencies,
        isPoisoned: meta.isPoisoned
      }
    };
    this.cache.set(clazz, exportScope);
    return exportScope;
  }
  maybeAlias(dirOrPipe, maybeAliasFrom, isReExport) {
    const ref = dirOrPipe.ref;
    if (this.aliasingHost === null || ref.node.getSourceFile() === maybeAliasFrom) {
      return dirOrPipe;
    }
    const alias = this.aliasingHost.getAliasIn(ref.node, maybeAliasFrom, isReExport);
    if (alias === null) {
      return dirOrPipe;
    }
    return {
      ...dirOrPipe,
      ref: ref.cloneWithAlias(alias)
    };
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/local.mjs
import { ExternalExpr as ExternalExpr3 } from "@angular/compiler";
import ts17 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/util.mjs
function getDiagnosticNode(ref, rawExpr) {
  return rawExpr !== null ? ref.getOriginForDiagnostics(rawExpr) : ref.node.name;
}
function makeNotStandaloneDiagnostic(scopeReader, ref, rawExpr, kind) {
  const scope = scopeReader.getScopeForComponent(ref.node);
  let message = `The ${kind} '${ref.node.name.text}' appears in 'imports', but is not standalone and cannot be imported directly.`;
  let relatedInformation = void 0;
  if (scope !== null && scope.kind === ComponentScopeKind.NgModule) {
    const isExported = scope.exported.dependencies.some((dep) => dep.ref.node === ref.node);
    const relatedInfoMessageText = isExported ? `It can be imported using its '${scope.ngModule.name.text}' NgModule instead.` : `It's declared in the '${scope.ngModule.name.text}' NgModule, but is not exported. Consider exporting it and importing the NgModule instead.`;
    relatedInformation = [makeRelatedInformation(scope.ngModule.name, relatedInfoMessageText)];
  } else {
  }
  if (relatedInformation === void 0) {
    message += " It must be imported via an NgModule.";
  }
  return makeDiagnostic(ErrorCode.COMPONENT_IMPORT_NOT_STANDALONE, getDiagnosticNode(ref, rawExpr), message, relatedInformation);
}
function makeUnknownComponentImportDiagnostic(ref, rawExpr) {
  return makeDiagnostic(ErrorCode.COMPONENT_UNKNOWN_IMPORT, getDiagnosticNode(ref, rawExpr), `Component imports must be standalone components, directives, pipes, or must be NgModules.`);
}
function makeUnknownComponentDeferredImportDiagnostic(ref, rawExpr) {
  return makeDiagnostic(ErrorCode.COMPONENT_UNKNOWN_DEFERRED_IMPORT, getDiagnosticNode(ref, rawExpr), `Component deferred imports must be standalone components, directives or pipes.`);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/local.mjs
var IN_PROGRESS_RESOLUTION = {};
var LocalModuleScopeRegistry = class {
  localReader;
  fullReader;
  dependencyScopeReader;
  refEmitter;
  aliasingHost;
  sealed = false;
  declarationToModule = /* @__PURE__ */ new Map();
  duplicateDeclarations = /* @__PURE__ */ new Map();
  moduleToRef = /* @__PURE__ */ new Map();
  cache = /* @__PURE__ */ new Map();
  remoteScoping = /* @__PURE__ */ new Map();
  scopeErrors = /* @__PURE__ */ new Map();
  modulesWithStructuralErrors = /* @__PURE__ */ new Set();
  constructor(localReader, fullReader, dependencyScopeReader, refEmitter, aliasingHost) {
    this.localReader = localReader;
    this.fullReader = fullReader;
    this.dependencyScopeReader = dependencyScopeReader;
    this.refEmitter = refEmitter;
    this.aliasingHost = aliasingHost;
  }
  registerNgModuleMetadata(data) {
    this.assertCollecting();
    const ngModule = data.ref.node;
    this.moduleToRef.set(data.ref.node, data.ref);
    for (const decl of data.declarations) {
      this.registerDeclarationOfModule(ngModule, decl, data.rawDeclarations);
    }
  }
  registerDirectiveMetadata(directive) {
  }
  registerPipeMetadata(pipe) {
  }
  getScopeForComponent(clazz) {
    const scope = !this.declarationToModule.has(clazz) ? null : this.getScopeOfModule(this.declarationToModule.get(clazz).ngModule);
    return scope;
  }
  getDuplicateDeclarations(node) {
    if (!this.duplicateDeclarations.has(node)) {
      return null;
    }
    return Array.from(this.duplicateDeclarations.get(node).values());
  }
  getScopeOfModule(clazz) {
    return this.moduleToRef.has(clazz) ? this.getScopeOfModuleReference(this.moduleToRef.get(clazz)) : null;
  }
  getDiagnosticsOfModule(clazz) {
    this.getScopeOfModule(clazz);
    if (this.scopeErrors.has(clazz)) {
      return this.scopeErrors.get(clazz);
    } else {
      return null;
    }
  }
  registerDeclarationOfModule(ngModule, decl, rawDeclarations) {
    const declData = {
      ngModule,
      ref: decl,
      rawDeclarations
    };
    if (this.duplicateDeclarations.has(decl.node)) {
      this.duplicateDeclarations.get(decl.node).set(ngModule, declData);
    } else if (this.declarationToModule.has(decl.node) && this.declarationToModule.get(decl.node).ngModule !== ngModule) {
      const duplicateDeclMap = /* @__PURE__ */ new Map();
      const firstDeclData = this.declarationToModule.get(decl.node);
      this.modulesWithStructuralErrors.add(firstDeclData.ngModule);
      this.modulesWithStructuralErrors.add(ngModule);
      duplicateDeclMap.set(firstDeclData.ngModule, firstDeclData);
      duplicateDeclMap.set(ngModule, declData);
      this.duplicateDeclarations.set(decl.node, duplicateDeclMap);
      this.declarationToModule.delete(decl.node);
    } else {
      this.declarationToModule.set(decl.node, declData);
    }
  }
  getScopeOfModuleReference(ref) {
    if (this.cache.has(ref.node)) {
      const cachedValue = this.cache.get(ref.node);
      if (cachedValue !== IN_PROGRESS_RESOLUTION) {
        return cachedValue;
      }
    }
    this.cache.set(ref.node, IN_PROGRESS_RESOLUTION);
    this.sealed = true;
    const ngModule = this.localReader.getNgModuleMetadata(ref);
    if (ngModule === null) {
      this.cache.set(ref.node, null);
      return null;
    }
    const diagnostics = [];
    const compilationDirectives = /* @__PURE__ */ new Map();
    const compilationPipes = /* @__PURE__ */ new Map();
    const declared = /* @__PURE__ */ new Set();
    const exportDirectives = /* @__PURE__ */ new Map();
    const exportPipes = /* @__PURE__ */ new Map();
    let isPoisoned = false;
    if (this.modulesWithStructuralErrors.has(ngModule.ref.node)) {
      isPoisoned = true;
    }
    for (const decl of ngModule.imports) {
      const importScope = this.getExportedScope(decl, diagnostics, ref.node, "import");
      if (importScope !== null) {
        if (importScope === "invalid" || importScope === "cycle" || importScope.exported.isPoisoned) {
          isPoisoned = true;
          if (importScope !== "cycle") {
            diagnostics.push(invalidTransitiveNgModuleRef(decl, ngModule.rawImports, "import"));
          }
          if (importScope === "invalid" || importScope === "cycle") {
            continue;
          }
        }
        for (const dep of importScope.exported.dependencies) {
          if (dep.kind === MetaKind.Directive) {
            compilationDirectives.set(dep.ref.node, dep);
          } else if (dep.kind === MetaKind.Pipe) {
            compilationPipes.set(dep.ref.node, dep);
          }
        }
        continue;
      }
      const directive = this.fullReader.getDirectiveMetadata(decl);
      if (directive !== null) {
        if (directive.isStandalone) {
          compilationDirectives.set(directive.ref.node, directive);
        } else {
          diagnostics.push(makeNotStandaloneDiagnostic(this, decl, ngModule.rawImports, directive.isComponent ? "component" : "directive"));
          isPoisoned = true;
        }
        continue;
      }
      const pipe = this.fullReader.getPipeMetadata(decl);
      if (pipe !== null) {
        if (pipe.isStandalone) {
          compilationPipes.set(pipe.ref.node, pipe);
        } else {
          diagnostics.push(makeNotStandaloneDiagnostic(this, decl, ngModule.rawImports, "pipe"));
          isPoisoned = true;
        }
        continue;
      }
      diagnostics.push(invalidRef(decl, ngModule.rawImports, "import"));
      isPoisoned = true;
    }
    for (const decl of ngModule.declarations) {
      const directive = this.localReader.getDirectiveMetadata(decl);
      const pipe = this.localReader.getPipeMetadata(decl);
      if (directive !== null) {
        if (directive.isStandalone) {
          const refType = directive.isComponent ? "Component" : "Directive";
          diagnostics.push(makeDiagnostic(ErrorCode.NGMODULE_DECLARATION_IS_STANDALONE, decl.getOriginForDiagnostics(ngModule.rawDeclarations), `${refType} ${decl.node.name.text} is standalone, and cannot be declared in an NgModule. Did you mean to import it instead?`));
          isPoisoned = true;
          continue;
        }
        compilationDirectives.set(decl.node, { ...directive, ref: decl });
        if (directive.isPoisoned) {
          isPoisoned = true;
        }
      } else if (pipe !== null) {
        if (pipe.isStandalone) {
          diagnostics.push(makeDiagnostic(ErrorCode.NGMODULE_DECLARATION_IS_STANDALONE, decl.getOriginForDiagnostics(ngModule.rawDeclarations), `Pipe ${decl.node.name.text} is standalone, and cannot be declared in an NgModule. Did you mean to import it instead?`));
          isPoisoned = true;
          continue;
        }
        compilationPipes.set(decl.node, { ...pipe, ref: decl });
      } else {
        const errorNode = decl.getOriginForDiagnostics(ngModule.rawDeclarations);
        diagnostics.push(makeDiagnostic(ErrorCode.NGMODULE_INVALID_DECLARATION, errorNode, `The class '${decl.node.name.text}' is listed in the declarations of the NgModule '${ngModule.ref.node.name.text}', but is not a directive, a component, or a pipe. Either remove it from the NgModule's declarations, or add an appropriate Angular decorator.`, [makeRelatedInformation(decl.node.name, `'${decl.node.name.text}' is declared here.`)]));
        isPoisoned = true;
        continue;
      }
      declared.add(decl.node);
    }
    for (const decl of ngModule.exports) {
      const exportScope = this.getExportedScope(decl, diagnostics, ref.node, "export");
      if (exportScope === "invalid" || exportScope === "cycle" || exportScope !== null && exportScope.exported.isPoisoned) {
        isPoisoned = true;
        if (exportScope !== "cycle") {
          diagnostics.push(invalidTransitiveNgModuleRef(decl, ngModule.rawExports, "export"));
        }
        if (exportScope === "invalid" || exportScope === "cycle") {
          continue;
        }
      } else if (exportScope !== null) {
        for (const dep of exportScope.exported.dependencies) {
          if (dep.kind == MetaKind.Directive) {
            exportDirectives.set(dep.ref.node, dep);
          } else if (dep.kind === MetaKind.Pipe) {
            exportPipes.set(dep.ref.node, dep);
          }
        }
      } else if (compilationDirectives.has(decl.node)) {
        const directive = compilationDirectives.get(decl.node);
        exportDirectives.set(decl.node, directive);
      } else if (compilationPipes.has(decl.node)) {
        const pipe = compilationPipes.get(decl.node);
        exportPipes.set(decl.node, pipe);
      } else {
        const dirMeta = this.fullReader.getDirectiveMetadata(decl);
        const pipeMeta = this.fullReader.getPipeMetadata(decl);
        if (dirMeta !== null || pipeMeta !== null) {
          const isStandalone = dirMeta !== null ? dirMeta.isStandalone : pipeMeta.isStandalone;
          diagnostics.push(invalidReexport(decl, ngModule.rawExports, isStandalone));
        } else {
          diagnostics.push(invalidRef(decl, ngModule.rawExports, "export"));
        }
        isPoisoned = true;
        continue;
      }
    }
    const exported = {
      dependencies: [...exportDirectives.values(), ...exportPipes.values()],
      isPoisoned
    };
    const reexports = this.getReexports(ngModule, ref, declared, exported.dependencies, diagnostics);
    const scope = {
      kind: ComponentScopeKind.NgModule,
      ngModule: ngModule.ref.node,
      compilation: {
        dependencies: [...compilationDirectives.values(), ...compilationPipes.values()],
        isPoisoned
      },
      exported,
      reexports,
      schemas: ngModule.schemas
    };
    if (diagnostics.length > 0) {
      this.scopeErrors.set(ref.node, diagnostics);
      this.modulesWithStructuralErrors.add(ref.node);
    }
    this.cache.set(ref.node, scope);
    return scope;
  }
  getRemoteScope(node) {
    return this.remoteScoping.has(node) ? this.remoteScoping.get(node) : null;
  }
  setComponentRemoteScope(node, directives, pipes) {
    this.remoteScoping.set(node, { directives, pipes });
  }
  getExportedScope(ref, diagnostics, ownerForErrors, type) {
    if (ref.node.getSourceFile().isDeclarationFile) {
      if (!ts17.isClassDeclaration(ref.node)) {
        const code = type === "import" ? ErrorCode.NGMODULE_INVALID_IMPORT : ErrorCode.NGMODULE_INVALID_EXPORT;
        diagnostics.push(makeDiagnostic(code, identifierOfNode(ref.node) || ref.node, `Appears in the NgModule.${type}s of ${nodeNameForError(ownerForErrors)}, but could not be resolved to an NgModule`));
        return "invalid";
      }
      return this.dependencyScopeReader.resolve(ref);
    } else {
      if (this.cache.get(ref.node) === IN_PROGRESS_RESOLUTION) {
        diagnostics.push(makeDiagnostic(type === "import" ? ErrorCode.NGMODULE_INVALID_IMPORT : ErrorCode.NGMODULE_INVALID_EXPORT, identifierOfNode(ref.node) || ref.node, `NgModule "${type}" field contains a cycle`));
        return "cycle";
      }
      return this.getScopeOfModuleReference(ref);
    }
  }
  getReexports(ngModule, ref, declared, exported, diagnostics) {
    let reexports = null;
    const sourceFile = ref.node.getSourceFile();
    if (this.aliasingHost === null) {
      return null;
    }
    reexports = [];
    const reexportMap = /* @__PURE__ */ new Map();
    const ngModuleRef = ref;
    const addReexport = (exportRef) => {
      if (exportRef.node.getSourceFile() === sourceFile) {
        return;
      }
      const isReExport = !declared.has(exportRef.node);
      const exportName = this.aliasingHost.maybeAliasSymbolAs(exportRef, sourceFile, ngModule.ref.node.name.text, isReExport);
      if (exportName === null) {
        return;
      }
      if (!reexportMap.has(exportName)) {
        if (exportRef.alias && exportRef.alias instanceof ExternalExpr3) {
          reexports.push({
            fromModule: exportRef.alias.value.moduleName,
            symbolName: exportRef.alias.value.name,
            asAlias: exportName
          });
        } else {
          const emittedRef = this.refEmitter.emit(exportRef.cloneWithNoIdentifiers(), sourceFile);
          assertSuccessfulReferenceEmit(emittedRef, ngModuleRef.node.name, "class");
          const expr = emittedRef.expression;
          if (!(expr instanceof ExternalExpr3) || expr.value.moduleName === null || expr.value.name === null) {
            throw new Error("Expected ExternalExpr");
          }
          reexports.push({
            fromModule: expr.value.moduleName,
            symbolName: expr.value.name,
            asAlias: exportName
          });
        }
        reexportMap.set(exportName, exportRef);
      } else {
        const prevRef = reexportMap.get(exportName);
        diagnostics.push(reexportCollision(ngModuleRef.node, prevRef, exportRef));
      }
    };
    for (const { ref: ref2 } of exported) {
      addReexport(ref2);
    }
    return reexports;
  }
  assertCollecting() {
    if (this.sealed) {
      throw new Error(`Assertion: LocalModuleScopeRegistry is not COLLECTING`);
    }
  }
};
function invalidRef(decl, rawExpr, type) {
  const code = type === "import" ? ErrorCode.NGMODULE_INVALID_IMPORT : ErrorCode.NGMODULE_INVALID_EXPORT;
  const resolveTarget = type === "import" ? "NgModule" : "NgModule, Component, Directive, or Pipe";
  const message = `'${decl.node.name.text}' does not appear to be an ${resolveTarget} class.`;
  const library = decl.ownedByModuleGuess !== null ? ` (${decl.ownedByModuleGuess})` : "";
  const sf = decl.node.getSourceFile();
  let relatedMessage;
  if (!sf.isDeclarationFile) {
    const annotationType = type === "import" ? "@NgModule" : "Angular";
    relatedMessage = `Is it missing an ${annotationType} annotation?`;
  } else if (sf.fileName.indexOf("node_modules") !== -1) {
    relatedMessage = `This likely means that the library${library} which declares ${decl.debugName} is not compatible with Angular Ivy. Check if a newer version of the library is available, and update if so. Also consider checking with the library's authors to see if the library is expected to be compatible with Ivy.`;
  } else {
    relatedMessage = `This likely means that the dependency${library} which declares ${decl.debugName} is not compatible with Angular Ivy.`;
  }
  return makeDiagnostic(code, getDiagnosticNode(decl, rawExpr), message, [
    makeRelatedInformation(decl.node.name, relatedMessage)
  ]);
}
function invalidTransitiveNgModuleRef(decl, rawExpr, type) {
  const code = type === "import" ? ErrorCode.NGMODULE_INVALID_IMPORT : ErrorCode.NGMODULE_INVALID_EXPORT;
  return makeDiagnostic(code, getDiagnosticNode(decl, rawExpr), `This ${type} contains errors, which may affect components that depend on this NgModule.`);
}
function invalidReexport(decl, rawExpr, isStandalone) {
  let message = `Can't be exported from this NgModule, as `;
  if (isStandalone) {
    message += "it must be imported first";
  } else if (decl.node.getSourceFile().isDeclarationFile) {
    message += "it must be imported via its NgModule first";
  } else {
    message += "it must be either declared by this NgModule, or imported here via its NgModule first";
  }
  return makeDiagnostic(ErrorCode.NGMODULE_INVALID_REEXPORT, getDiagnosticNode(decl, rawExpr), message);
}
function reexportCollision(module, refA, refB) {
  const childMessageText = `This directive/pipe is part of the exports of '${module.name.text}' and shares the same name as another exported directive/pipe.`;
  return makeDiagnostic(ErrorCode.NGMODULE_REEXPORT_NAME_COLLISION, module.name, `
    There was a name collision between two classes named '${refA.node.name.text}', which are both part of the exports of '${module.name.text}'.

    Angular generates re-exports of an NgModule's exported directives/pipes from the module's source file in certain cases, using the declared name of the class. If two classes of the same name are exported, this automatic naming does not work.

    To fix this problem please re-export one or both classes directly from this file.
  `.trim(), [
    makeRelatedInformation(refA.node.name, childMessageText),
    makeRelatedInformation(refB.node.name, childMessageText)
  ]);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/typecheck.mjs
import { CssSelector, SelectorMatcher } from "@angular/compiler";
import ts18 from "typescript";
var TypeCheckScopeRegistry = class {
  scopeReader;
  metaReader;
  hostDirectivesResolver;
  flattenedDirectiveMetaCache = /* @__PURE__ */ new Map();
  scopeCache = /* @__PURE__ */ new Map();
  constructor(scopeReader, metaReader, hostDirectivesResolver) {
    this.scopeReader = scopeReader;
    this.metaReader = metaReader;
    this.hostDirectivesResolver = hostDirectivesResolver;
  }
  getTypeCheckScope(node) {
    const matcher = new SelectorMatcher();
    const directives = [];
    const pipes = /* @__PURE__ */ new Map();
    const scope = this.scopeReader.getScopeForComponent(node);
    if (scope === null) {
      return {
        matcher,
        directives,
        pipes,
        schemas: [],
        isPoisoned: false
      };
    }
    const isNgModuleScope = scope.kind === ComponentScopeKind.NgModule;
    const cacheKey = isNgModuleScope ? scope.ngModule : scope.component;
    const dependencies = isNgModuleScope ? scope.compilation.dependencies : scope.dependencies;
    if (this.scopeCache.has(cacheKey)) {
      return this.scopeCache.get(cacheKey);
    }
    let allDependencies = dependencies;
    if (!isNgModuleScope && Array.isArray(scope.deferredDependencies) && scope.deferredDependencies.length > 0) {
      allDependencies = [...allDependencies, ...scope.deferredDependencies];
    }
    for (const meta of allDependencies) {
      if (meta.kind === MetaKind.Directive && meta.selector !== null) {
        const extMeta = this.getTypeCheckDirectiveMetadata(meta.ref);
        if (extMeta === null) {
          continue;
        }
        const directiveMeta = this.applyExplicitlyDeferredFlag(extMeta, meta.isExplicitlyDeferred);
        matcher.addSelectables(CssSelector.parse(meta.selector), [
          ...this.hostDirectivesResolver.resolve(directiveMeta),
          directiveMeta
        ]);
        directives.push(directiveMeta);
      } else if (meta.kind === MetaKind.Pipe) {
        if (!ts18.isClassDeclaration(meta.ref.node)) {
          throw new Error(`Unexpected non-class declaration ${ts18.SyntaxKind[meta.ref.node.kind]} for pipe ${meta.ref.debugName}`);
        }
        pipes.set(meta.name, meta);
      }
    }
    const typeCheckScope = {
      matcher,
      directives,
      pipes,
      schemas: scope.schemas,
      isPoisoned: scope.kind === ComponentScopeKind.NgModule ? scope.compilation.isPoisoned || scope.exported.isPoisoned : scope.isPoisoned
    };
    this.scopeCache.set(cacheKey, typeCheckScope);
    return typeCheckScope;
  }
  getTypeCheckDirectiveMetadata(ref) {
    const clazz = ref.node;
    if (this.flattenedDirectiveMetaCache.has(clazz)) {
      return this.flattenedDirectiveMetaCache.get(clazz);
    }
    const meta = flattenInheritedDirectiveMetadata(this.metaReader, ref);
    if (meta === null) {
      return null;
    }
    this.flattenedDirectiveMetaCache.set(clazz, meta);
    return meta;
  }
  applyExplicitlyDeferredFlag(meta, isExplicitlyDeferred) {
    return isExplicitlyDeferred === true ? { ...meta, isExplicitlyDeferred } : meta;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/handler.mjs
import { compileClassMetadata, compileDeclareClassMetadata, compileDeclareDirectiveFromMetadata, compileDirectiveFromMetadata, FactoryTarget, makeBindingParser, WrappedNodeExpr as WrappedNodeExpr6 } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.mjs
import { createMayBeForwardRefExpression as createMayBeForwardRefExpression2, emitDistinctChangesOnlyDefaultValue, ExternalExpr as ExternalExpr4, getSafePropertyAccessString, parseHostBindings, ParserError, verifyHostBindings, WrappedNodeExpr as WrappedNodeExpr5 } from "@angular/compiler";
import ts22 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/initializer_function_access.mjs
function validateAccessOfInitializerApiMember({ api, call }, member) {
  if (!api.allowedAccessLevels.includes(member.accessLevel)) {
    throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY, call, makeDiagnosticChain(`Cannot use "${api.functionName}" on a class member that is declared as ${classMemberAccessLevelToString(member.accessLevel)}.`, [
      makeDiagnosticChain(`Update the class field to be either: ` + api.allowedAccessLevels.map((l) => classMemberAccessLevelToString(l)).join(", "))
    ]));
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/initializer_functions.mjs
import ts19 from "typescript";
function tryParseInitializerApi(functions, expression, reflector, importTracker) {
  if (!ts19.isCallExpression(expression)) {
    return null;
  }
  const staticResult = parseTopLevelCall(expression, functions, importTracker) || parseTopLevelRequiredCall(expression, functions, importTracker) || parseTopLevelCallFromNamespace(expression, functions, importTracker);
  if (staticResult === null) {
    return null;
  }
  const { api, apiReference, isRequired } = staticResult;
  const resolvedImport = reflector.getImportOfIdentifier(apiReference);
  if (resolvedImport === null || api.functionName !== resolvedImport.name || api.owningModule !== resolvedImport.from) {
    return null;
  }
  return {
    api,
    call: expression,
    isRequired
  };
}
function parseTopLevelCall(call, functions, importTracker) {
  const node = call.expression;
  if (!ts19.isIdentifier(node)) {
    return null;
  }
  const matchingApi = functions.find((fn) => importTracker.isPotentialReferenceToNamedImport(node, fn.functionName, fn.owningModule));
  if (matchingApi === void 0) {
    return null;
  }
  return { api: matchingApi, apiReference: node, isRequired: false };
}
function parseTopLevelRequiredCall(call, functions, importTracker) {
  const node = call.expression;
  if (!ts19.isPropertyAccessExpression(node) || !ts19.isIdentifier(node.expression) || node.name.text !== "required") {
    return null;
  }
  const expression = node.expression;
  const matchingApi = functions.find((fn) => importTracker.isPotentialReferenceToNamedImport(expression, fn.functionName, fn.owningModule));
  if (matchingApi === void 0) {
    return null;
  }
  return { api: matchingApi, apiReference: expression, isRequired: true };
}
function parseTopLevelCallFromNamespace(call, functions, importTracker) {
  const node = call.expression;
  if (!ts19.isPropertyAccessExpression(node)) {
    return null;
  }
  let apiReference = null;
  let matchingApi = void 0;
  let isRequired = false;
  if (ts19.isIdentifier(node.expression) && ts19.isIdentifier(node.name)) {
    const namespaceRef = node.expression;
    apiReference = node.name;
    matchingApi = functions.find((fn) => node.name.text === fn.functionName && importTracker.isPotentialReferenceToNamespaceImport(namespaceRef, fn.owningModule));
  } else if (ts19.isPropertyAccessExpression(node.expression) && ts19.isIdentifier(node.expression.expression) && ts19.isIdentifier(node.expression.name) && node.name.text === "required") {
    const potentialName = node.expression.name.text;
    const namespaceRef = node.expression.expression;
    apiReference = node.expression.name;
    matchingApi = functions.find((fn) => fn.functionName === potentialName && importTracker.isPotentialReferenceToNamespaceImport(namespaceRef, fn.owningModule));
    isRequired = true;
  }
  if (matchingApi === void 0 || apiReference === null) {
    return null;
  }
  return { api: matchingApi, apiReference, isRequired };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/input_output_parse_options.mjs
import ts20 from "typescript";
function parseAndValidateInputAndOutputOptions(optionsNode) {
  if (!ts20.isObjectLiteralExpression(optionsNode)) {
    throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, optionsNode, "Argument needs to be an object literal that is statically analyzable.");
  }
  const options = reflectObjectLiteral(optionsNode);
  let alias = void 0;
  if (options.has("alias")) {
    const aliasExpr = options.get("alias");
    if (!ts20.isStringLiteralLike(aliasExpr)) {
      throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, aliasExpr, "Alias needs to be a string that is statically analyzable.");
    }
    alias = aliasExpr.text;
  }
  return { alias };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/input_function.mjs
var INPUT_INITIALIZER_FN = {
  functionName: "input",
  owningModule: "@angular/core",
  allowedAccessLevels: [
    ClassMemberAccessLevel.PublicWritable,
    ClassMemberAccessLevel.PublicReadonly,
    ClassMemberAccessLevel.Protected
  ]
};
function tryParseSignalInputMapping(member, reflector, importTracker) {
  var _a;
  if (member.value === null) {
    return null;
  }
  const signalInput = tryParseInitializerApi([INPUT_INITIALIZER_FN], member.value, reflector, importTracker);
  if (signalInput === null) {
    return null;
  }
  validateAccessOfInitializerApiMember(signalInput, member);
  const optionsNode = signalInput.isRequired ? signalInput.call.arguments[0] : signalInput.call.arguments[1];
  const options = optionsNode !== void 0 ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;
  return {
    isSignal: true,
    classPropertyName,
    bindingPropertyName: (_a = options == null ? void 0 : options.alias) != null ? _a : classPropertyName,
    required: signalInput.isRequired,
    transform: null
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/model_function.mjs
var MODEL_INITIALIZER_FN = {
  functionName: "model",
  owningModule: "@angular/core",
  allowedAccessLevels: [
    ClassMemberAccessLevel.PublicWritable,
    ClassMemberAccessLevel.PublicReadonly,
    ClassMemberAccessLevel.Protected
  ]
};
function tryParseSignalModelMapping(member, reflector, importTracker) {
  var _a;
  if (member.value === null) {
    return null;
  }
  const model = tryParseInitializerApi([MODEL_INITIALIZER_FN], member.value, reflector, importTracker);
  if (model === null) {
    return null;
  }
  validateAccessOfInitializerApiMember(model, member);
  const optionsNode = model.isRequired ? model.call.arguments[0] : model.call.arguments[1];
  const options = optionsNode !== void 0 ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;
  const bindingPropertyName = (_a = options == null ? void 0 : options.alias) != null ? _a : classPropertyName;
  return {
    call: model.call,
    input: {
      isSignal: true,
      transform: null,
      classPropertyName,
      bindingPropertyName,
      required: model.isRequired
    },
    output: {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: bindingPropertyName + "Change"
    }
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/output_function.mjs
var allowedAccessLevels = [
  ClassMemberAccessLevel.PublicWritable,
  ClassMemberAccessLevel.PublicReadonly,
  ClassMemberAccessLevel.Protected
];
var OUTPUT_INITIALIZER_FNS = [
  {
    functionName: "output",
    owningModule: "@angular/core",
    allowedAccessLevels
  },
  {
    functionName: "outputFromObservable",
    owningModule: "@angular/core/rxjs-interop",
    allowedAccessLevels
  }
];
function tryParseInitializerBasedOutput(member, reflector, importTracker) {
  var _a;
  if (member.value === null) {
    return null;
  }
  const output = tryParseInitializerApi(OUTPUT_INITIALIZER_FNS, member.value, reflector, importTracker);
  if (output === null) {
    return null;
  }
  if (output.isRequired) {
    throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_NO_REQUIRED_FUNCTION, output.call, `Output does not support ".required()".`);
  }
  validateAccessOfInitializerApiMember(output, member);
  const optionsNode = output.api.functionName === "output" ? output.call.arguments[0] : output.call.arguments[1];
  const options = optionsNode !== void 0 ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;
  return {
    call: output.call,
    metadata: {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: (_a = options == null ? void 0 : options.alias) != null ? _a : classPropertyName
    }
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/query_functions.mjs
import { createMayBeForwardRefExpression, outputAst as o } from "@angular/compiler";
import ts21 from "typescript";
var queryFunctionNames = [
  "viewChild",
  "viewChildren",
  "contentChild",
  "contentChildren"
];
var QUERY_INITIALIZER_FNS = queryFunctionNames.map((fnName) => ({
  functionName: fnName,
  owningModule: "@angular/core",
  allowedAccessLevels: [
    ClassMemberAccessLevel.PublicWritable,
    ClassMemberAccessLevel.PublicReadonly,
    ClassMemberAccessLevel.Protected,
    ClassMemberAccessLevel.Private
  ]
}));
var defaultDescendantsValue = (type) => type !== "contentChildren";
function tryParseSignalQueryFromInitializer(member, reflector, importTracker) {
  if (member.value === null) {
    return null;
  }
  const query = tryParseInitializerApi(QUERY_INITIALIZER_FNS, member.value, reflector, importTracker);
  if (query === null) {
    return null;
  }
  validateAccessOfInitializerApiMember(query, member);
  const { functionName } = query.api;
  const isSingleQuery = functionName === "viewChild" || functionName === "contentChild";
  const predicateNode = query.call.arguments[0];
  if (predicateNode === void 0) {
    throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, query.call, "No locator specified.");
  }
  const optionsNode = query.call.arguments[1];
  if (optionsNode !== void 0 && !ts21.isObjectLiteralExpression(optionsNode)) {
    throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, optionsNode, "Argument needs to be an object literal.");
  }
  const options = optionsNode && reflectObjectLiteral(optionsNode);
  const read = (options == null ? void 0 : options.has("read")) ? parseReadOption(options.get("read")) : null;
  const descendants = (options == null ? void 0 : options.has("descendants")) ? parseDescendantsOption(options.get("descendants")) : defaultDescendantsValue(functionName);
  return {
    name: functionName,
    call: query.call,
    metadata: {
      isSignal: true,
      propertyName: member.name,
      static: false,
      emitDistinctChangesOnly: true,
      predicate: parseLocator(predicateNode, reflector),
      first: isSingleQuery,
      read,
      descendants
    }
  };
}
function parseLocator(expression, reflector) {
  const unwrappedExpression = tryUnwrapForwardRef(expression, reflector);
  if (unwrappedExpression !== null) {
    expression = unwrappedExpression;
  }
  if (ts21.isStringLiteralLike(expression)) {
    return [expression.text];
  }
  return createMayBeForwardRefExpression(new o.WrappedNodeExpr(expression), unwrappedExpression !== null ? 2 : 0);
}
function parseReadOption(value) {
  if (ts21.isExpressionWithTypeArguments(value) || ts21.isParenthesizedExpression(value) || ts21.isAsExpression(value)) {
    return parseReadOption(value.expression);
  }
  if (ts21.isPropertyAccessExpression(value) && ts21.isIdentifier(value.expression) || ts21.isIdentifier(value)) {
    return new o.WrappedNodeExpr(value);
  }
  throw new FatalDiagnosticError(ErrorCode.VALUE_NOT_LITERAL, value, `Query "read" option expected a literal class reference.`);
}
function parseDescendantsOption(value) {
  if (value.kind === ts21.SyntaxKind.TrueKeyword) {
    return true;
  } else if (value.kind === ts21.SyntaxKind.FalseKeyword) {
    return false;
  }
  throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, value, `Expected "descendants" option to be a boolean literal.`);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.mjs
var EMPTY_OBJECT = {};
var queryDecoratorNames = [
  "ViewChild",
  "ViewChildren",
  "ContentChild",
  "ContentChildren"
];
var QUERY_TYPES = new Set(queryDecoratorNames);
function extractDirectiveMetadata(clazz, decorator, reflector, importTracker, evaluator, refEmitter, referencesRegistry, isCore, annotateForClosureCompiler, compilationMode, defaultSelector, strictStandalone, implicitStandaloneValue) {
  let directive;
  if (decorator.args === null || decorator.args.length === 0) {
    directive = /* @__PURE__ */ new Map();
  } else if (decorator.args.length !== 1) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, `Incorrect number of arguments to @${decorator.name} decorator`);
  } else {
    const meta = unwrapExpression(decorator.args[0]);
    if (!ts22.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, `@${decorator.name} argument must be an object literal`);
    }
    directive = reflectObjectLiteral(meta);
  }
  if (directive.has("jit")) {
    return { jitForced: true };
  }
  const members = reflector.getMembersOfClass(clazz);
  const decoratedElements = members.filter((member) => !member.isStatic && member.decorators !== null);
  const coreModule = isCore ? void 0 : "@angular/core";
  const inputsFromMeta = parseInputsArray(clazz, directive, evaluator, reflector, refEmitter, compilationMode);
  const inputsFromFields = parseInputFields(clazz, members, evaluator, reflector, importTracker, refEmitter, isCore, compilationMode, inputsFromMeta, decorator);
  const inputs = ClassPropertyMapping.fromMappedObject({ ...inputsFromMeta, ...inputsFromFields });
  const outputsFromMeta = parseOutputsArray(directive, evaluator);
  const outputsFromFields = parseOutputFields(clazz, decorator, members, isCore, reflector, importTracker, evaluator, outputsFromMeta);
  const outputs = ClassPropertyMapping.fromMappedObject({ ...outputsFromMeta, ...outputsFromFields });
  const { viewQueries, contentQueries } = parseQueriesOfClassFields(members, reflector, importTracker, evaluator, isCore);
  if (directive.has("queries")) {
    const signalQueryFields = new Set([...viewQueries, ...contentQueries].filter((q) => q.isSignal).map((q) => q.propertyName));
    const queriesFromDecorator = extractQueriesFromDecorator(directive.get("queries"), reflector, evaluator, isCore);
    const checkAndUnwrapQuery = (q) => {
      if (signalQueryFields.has(q.metadata.propertyName)) {
        throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_DECORATOR_METADATA_COLLISION, q.expr, `Query is declared multiple times. "@${decorator.name}" declares a query for the same property.`);
      }
      return q.metadata;
    };
    contentQueries.push(...queriesFromDecorator.content.map((q) => checkAndUnwrapQuery(q)));
    viewQueries.push(...queriesFromDecorator.view.map((q) => checkAndUnwrapQuery(q)));
  }
  let selector = defaultSelector;
  if (directive.has("selector")) {
    const expr = directive.get("selector");
    const resolved = evaluator.evaluate(expr);
    assertLocalCompilationUnresolvedConst(compilationMode, resolved, null, "Unresolved identifier found for @Component.selector field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the selector");
    if (typeof resolved !== "string") {
      throw createValueHasWrongTypeError(expr, resolved, `selector must be a string`);
    }
    selector = resolved === "" ? defaultSelector : resolved;
    if (!selector) {
      throw new FatalDiagnosticError(ErrorCode.DIRECTIVE_MISSING_SELECTOR, expr, `Directive ${clazz.name.text} has no selector, please add it!`);
    }
  }
  const host = extractHostBindings(decoratedElements, evaluator, coreModule, compilationMode, directive);
  const providers = directive.has("providers") ? new WrappedNodeExpr5(annotateForClosureCompiler ? wrapFunctionExpressionsInParens(directive.get("providers")) : directive.get("providers")) : null;
  const usesOnChanges = members.some((member) => !member.isStatic && member.kind === ClassMemberKind.Method && member.name === "ngOnChanges");
  let exportAs = null;
  if (directive.has("exportAs")) {
    const expr = directive.get("exportAs");
    const resolved = evaluator.evaluate(expr);
    assertLocalCompilationUnresolvedConst(compilationMode, resolved, null, "Unresolved identifier found for exportAs field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the selector");
    if (typeof resolved !== "string") {
      throw createValueHasWrongTypeError(expr, resolved, `exportAs must be a string`);
    }
    exportAs = resolved.split(",").map((part) => part.trim());
  }
  const rawCtorDeps = getConstructorDependencies(clazz, reflector, isCore);
  const ctorDeps = selector !== null ? validateConstructorDependencies(clazz, rawCtorDeps) : unwrapConstructorDependencies(rawCtorDeps);
  const isStructural = ctorDeps !== null && ctorDeps !== "invalid" && ctorDeps.some((dep) => dep.token instanceof ExternalExpr4 && dep.token.value.moduleName === "@angular/core" && dep.token.value.name === "TemplateRef");
  let isStandalone = implicitStandaloneValue;
  if (directive.has("standalone")) {
    const expr = directive.get("standalone");
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== "boolean") {
      throw createValueHasWrongTypeError(expr, resolved, `standalone flag must be a boolean`);
    }
    isStandalone = resolved;
    if (!isStandalone && strictStandalone) {
      throw new FatalDiagnosticError(ErrorCode.NON_STANDALONE_NOT_ALLOWED, expr, `Only standalone components/directives are allowed when 'strictStandalone' is enabled.`);
    }
  }
  let isSignal = false;
  if (directive.has("signals")) {
    const expr = directive.get("signals");
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== "boolean") {
      throw createValueHasWrongTypeError(expr, resolved, `signals flag must be a boolean`);
    }
    isSignal = resolved;
  }
  const usesInheritance = reflector.hasBaseClass(clazz);
  const sourceFile = clazz.getSourceFile();
  const type = wrapTypeReference(reflector, clazz);
  const rawHostDirectives = directive.get("hostDirectives") || null;
  const hostDirectives = rawHostDirectives === null ? null : extractHostDirectives(rawHostDirectives, evaluator, compilationMode);
  if (compilationMode !== CompilationMode.LOCAL && hostDirectives !== null) {
    referencesRegistry.add(clazz, ...hostDirectives.map((hostDir) => {
      if (!isHostDirectiveMetaForGlobalMode(hostDir)) {
        throw new Error("Impossible state");
      }
      return hostDir.directive;
    }));
  }
  const metadata = {
    name: clazz.name.text,
    deps: ctorDeps,
    host: {
      ...host
    },
    lifecycle: {
      usesOnChanges
    },
    inputs: inputs.toJointMappedObject(toR3InputMetadata),
    outputs: outputs.toDirectMappedObject(),
    queries: contentQueries,
    viewQueries,
    selector,
    fullInheritance: false,
    type,
    typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
    typeSourceSpan: createSourceSpan(clazz.name),
    usesInheritance,
    exportAs,
    providers,
    isStandalone,
    isSignal,
    hostDirectives: (hostDirectives == null ? void 0 : hostDirectives.map((hostDir) => toHostDirectiveMetadata(hostDir, sourceFile, refEmitter))) || null
  };
  return {
    jitForced: false,
    decorator: directive,
    metadata,
    inputs,
    outputs,
    isStructural,
    hostDirectives,
    rawHostDirectives,
    inputFieldNamesFromMetadataArray: new Set(Object.values(inputsFromMeta).map((i) => i.classPropertyName))
  };
}
function extractDecoratorQueryMetadata(exprNode, name, args, propertyName, reflector, evaluator) {
  if (args.length === 0) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, exprNode, `@${name} must have arguments`);
  }
  const first = name === "ViewChild" || name === "ContentChild";
  const forwardReferenceTarget = tryUnwrapForwardRef(args[0], reflector);
  const node = forwardReferenceTarget != null ? forwardReferenceTarget : args[0];
  const arg = evaluator.evaluate(node);
  let isStatic = false;
  let predicate = null;
  if (arg instanceof Reference || arg instanceof DynamicValue) {
    predicate = createMayBeForwardRefExpression2(new WrappedNodeExpr5(node), forwardReferenceTarget !== null ? 2 : 0);
  } else if (typeof arg === "string") {
    predicate = [arg];
  } else if (isStringArrayOrDie(arg, `@${name} predicate`, node)) {
    predicate = arg;
  } else {
    throw createValueHasWrongTypeError(node, arg, `@${name} predicate cannot be interpreted`);
  }
  let read = null;
  let descendants = name !== "ContentChildren";
  let emitDistinctChangesOnly = emitDistinctChangesOnlyDefaultValue;
  if (args.length === 2) {
    const optionsExpr = unwrapExpression(args[1]);
    if (!ts22.isObjectLiteralExpression(optionsExpr)) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARG_NOT_LITERAL, optionsExpr, `@${name} options must be an object literal`);
    }
    const options = reflectObjectLiteral(optionsExpr);
    if (options.has("read")) {
      read = new WrappedNodeExpr5(options.get("read"));
    }
    if (options.has("descendants")) {
      const descendantsExpr = options.get("descendants");
      const descendantsValue = evaluator.evaluate(descendantsExpr);
      if (typeof descendantsValue !== "boolean") {
        throw createValueHasWrongTypeError(descendantsExpr, descendantsValue, `@${name} options.descendants must be a boolean`);
      }
      descendants = descendantsValue;
    }
    if (options.has("emitDistinctChangesOnly")) {
      const emitDistinctChangesOnlyExpr = options.get("emitDistinctChangesOnly");
      const emitDistinctChangesOnlyValue = evaluator.evaluate(emitDistinctChangesOnlyExpr);
      if (typeof emitDistinctChangesOnlyValue !== "boolean") {
        throw createValueHasWrongTypeError(emitDistinctChangesOnlyExpr, emitDistinctChangesOnlyValue, `@${name} options.emitDistinctChangesOnly must be a boolean`);
      }
      emitDistinctChangesOnly = emitDistinctChangesOnlyValue;
    }
    if (options.has("static")) {
      const staticValue = evaluator.evaluate(options.get("static"));
      if (typeof staticValue !== "boolean") {
        throw createValueHasWrongTypeError(node, staticValue, `@${name} options.static must be a boolean`);
      }
      isStatic = staticValue;
    }
  } else if (args.length > 2) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, node, `@${name} has too many arguments`);
  }
  return {
    isSignal: false,
    propertyName,
    predicate,
    first,
    descendants,
    read,
    static: isStatic,
    emitDistinctChangesOnly
  };
}
function extractHostBindings(members, evaluator, coreModule, compilationMode, metadata) {
  let bindings;
  if (metadata && metadata.has("host")) {
    bindings = evaluateHostExpressionBindings(metadata.get("host"), evaluator);
  } else {
    bindings = parseHostBindings({});
  }
  filterToMembersWithDecorator(members, "HostBinding", coreModule).forEach(({ member, decorators }) => {
    decorators.forEach((decorator) => {
      let hostPropertyName = member.name;
      if (decorator.args !== null && decorator.args.length > 0) {
        if (decorator.args.length !== 1) {
          throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, `@HostBinding can have at most one argument, got ${decorator.args.length} argument(s)`);
        }
        const resolved = evaluator.evaluate(decorator.args[0]);
        assertLocalCompilationUnresolvedConst(compilationMode, resolved, null, "Unresolved identifier found for @HostBinding's argument! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the argument");
        if (typeof resolved !== "string") {
          throw createValueHasWrongTypeError(decorator.node, resolved, `@HostBinding's argument must be a string`);
        }
        hostPropertyName = resolved;
      }
      bindings.properties[hostPropertyName] = getSafePropertyAccessString("this", member.name);
    });
  });
  filterToMembersWithDecorator(members, "HostListener", coreModule).forEach(({ member, decorators }) => {
    decorators.forEach((decorator) => {
      let eventName = member.name;
      let args = [];
      if (decorator.args !== null && decorator.args.length > 0) {
        if (decorator.args.length > 2) {
          throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.args[2], `@HostListener can have at most two arguments`);
        }
        const resolved = evaluator.evaluate(decorator.args[0]);
        assertLocalCompilationUnresolvedConst(compilationMode, resolved, null, "Unresolved identifier found for @HostListener's event name argument! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the argument");
        if (typeof resolved !== "string") {
          throw createValueHasWrongTypeError(decorator.args[0], resolved, `@HostListener's event name argument must be a string`);
        }
        eventName = resolved;
        if (decorator.args.length === 2) {
          const expression = decorator.args[1];
          const resolvedArgs = evaluator.evaluate(decorator.args[1]);
          if (!isStringArrayOrDie(resolvedArgs, "@HostListener.args", expression)) {
            throw createValueHasWrongTypeError(decorator.args[1], resolvedArgs, `@HostListener's second argument must be a string array`);
          }
          args = resolvedArgs;
        }
      }
      bindings.listeners[eventName] = `${member.name}(${args.join(",")})`;
    });
  });
  return bindings;
}
function extractQueriesFromDecorator(queryData, reflector, evaluator, isCore) {
  const content = [];
  const view = [];
  if (!ts22.isObjectLiteralExpression(queryData)) {
    throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, "Decorator queries metadata must be an object literal");
  }
  reflectObjectLiteral(queryData).forEach((queryExpr, propertyName) => {
    queryExpr = unwrapExpression(queryExpr);
    if (!ts22.isNewExpression(queryExpr)) {
      throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, "Decorator query metadata must be an instance of a query type");
    }
    const queryType = ts22.isPropertyAccessExpression(queryExpr.expression) ? queryExpr.expression.name : queryExpr.expression;
    if (!ts22.isIdentifier(queryType)) {
      throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, "Decorator query metadata must be an instance of a query type");
    }
    const type = reflector.getImportOfIdentifier(queryType);
    if (type === null || !isCore && type.from !== "@angular/core" || !QUERY_TYPES.has(type.name)) {
      throw new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, "Decorator query metadata must be an instance of a query type");
    }
    const query = extractDecoratorQueryMetadata(queryExpr, type.name, queryExpr.arguments || [], propertyName, reflector, evaluator);
    if (type.name.startsWith("Content")) {
      content.push({ expr: queryExpr, metadata: query });
    } else {
      view.push({ expr: queryExpr, metadata: query });
    }
  });
  return { content, view };
}
function parseDirectiveStyles(directive, evaluator, compilationMode) {
  var _a;
  const expression = directive.get("styles");
  if (!expression) {
    return null;
  }
  const evaluated = evaluator.evaluate(expression);
  const value = typeof evaluated === "string" ? [evaluated] : evaluated;
  if (compilationMode === CompilationMode.LOCAL) {
    let unresolvedNode = null;
    if (Array.isArray(value)) {
      const entry = value.find((e) => e instanceof DynamicValue && e.isFromUnknownIdentifier());
      unresolvedNode = (_a = entry == null ? void 0 : entry.node) != null ? _a : null;
    } else if (value instanceof DynamicValue && value.isFromUnknownIdentifier()) {
      unresolvedNode = value.node;
    }
    if (unresolvedNode !== null) {
      throw new FatalDiagnosticError(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST, unresolvedNode, "Unresolved identifier found for @Component.styles field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declarations into a file within the compilation unit, 2) Inline the styles, 3) Move the styles into separate files and include it using @Component.styleUrls");
    }
  }
  if (!isStringArrayOrDie(value, "styles", expression)) {
    throw createValueHasWrongTypeError(expression, value, `Failed to resolve @Component.styles to a string or an array of strings`);
  }
  return value;
}
function parseFieldStringArrayValue(directive, field, evaluator) {
  if (!directive.has(field)) {
    return null;
  }
  const expression = directive.get(field);
  const value = evaluator.evaluate(expression);
  if (!isStringArrayOrDie(value, field, expression)) {
    throw createValueHasWrongTypeError(expression, value, `Failed to resolve @Directive.${field} to a string array`);
  }
  return value;
}
function isStringArrayOrDie(value, name, node) {
  if (!Array.isArray(value)) {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "string") {
      throw createValueHasWrongTypeError(node, value[i], `Failed to resolve ${name} at position ${i} to a string`);
    }
  }
  return true;
}
function tryGetQueryFromFieldDecorator(member, reflector, evaluator, isCore) {
  var _a, _b, _c;
  const decorators = member.decorators;
  if (decorators === null) {
    return null;
  }
  const queryDecorators = getAngularDecorators(decorators, queryDecoratorNames, isCore);
  if (queryDecorators.length === 0) {
    return null;
  }
  if (queryDecorators.length !== 1) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_COLLISION, (_a = member.node) != null ? _a : queryDecorators[0].node, "Cannot combine multiple query decorators.");
  }
  const decorator = queryDecorators[0];
  const node = member.node || decorator.node;
  if (decorators.some((v) => v.name === "Input")) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_COLLISION, node, "Cannot combine @Input decorators with query decorators");
  }
  if (!isPropertyTypeMember(member)) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_UNEXPECTED, node, "Query decorator must go on a property-type member");
  }
  const name = (_c = (_b = decorator.import) == null ? void 0 : _b.name) != null ? _c : decorator.name;
  return {
    name,
    decorator,
    metadata: extractDecoratorQueryMetadata(node, name, decorator.args || [], member.name, reflector, evaluator)
  };
}
function isPropertyTypeMember(member) {
  return member.kind === ClassMemberKind.Getter || member.kind === ClassMemberKind.Setter || member.kind === ClassMemberKind.Property;
}
function parseMappingStringArray(values) {
  return values.reduce((results, value) => {
    if (typeof value !== "string") {
      throw new Error("Mapping value must be a string");
    }
    const [bindingPropertyName, fieldName] = parseMappingString(value);
    results[fieldName] = bindingPropertyName;
    return results;
  }, {});
}
function parseMappingString(value) {
  const [fieldName, bindingPropertyName] = value.split(":", 2).map((str) => str.trim());
  return [bindingPropertyName != null ? bindingPropertyName : fieldName, fieldName];
}
function parseInputsArray(clazz, decoratorMetadata, evaluator, reflector, refEmitter, compilationMode) {
  const inputsField = decoratorMetadata.get("inputs");
  if (inputsField === void 0) {
    return {};
  }
  const inputs = {};
  const inputsArray = evaluator.evaluate(inputsField);
  if (!Array.isArray(inputsArray)) {
    throw createValueHasWrongTypeError(inputsField, inputsArray, `Failed to resolve @Directive.inputs to an array`);
  }
  for (let i = 0; i < inputsArray.length; i++) {
    const value = inputsArray[i];
    if (typeof value === "string") {
      const [bindingPropertyName, classPropertyName] = parseMappingString(value);
      inputs[classPropertyName] = {
        bindingPropertyName,
        classPropertyName,
        required: false,
        transform: null,
        isSignal: false
      };
    } else if (value instanceof Map) {
      const name = value.get("name");
      const alias = value.get("alias");
      const required = value.get("required");
      let transform = null;
      if (typeof name !== "string") {
        throw createValueHasWrongTypeError(inputsField, name, `Value at position ${i} of @Directive.inputs array must have a "name" property`);
      }
      if (value.has("transform")) {
        const transformValue = value.get("transform");
        if (!(transformValue instanceof DynamicValue) && !(transformValue instanceof Reference)) {
          throw createValueHasWrongTypeError(inputsField, transformValue, `Transform of value at position ${i} of @Directive.inputs array must be a function`);
        }
        transform = parseDecoratorInputTransformFunction(clazz, name, transformValue, reflector, refEmitter, compilationMode);
      }
      inputs[name] = {
        classPropertyName: name,
        bindingPropertyName: typeof alias === "string" ? alias : name,
        required: required === true,
        isSignal: false,
        transform
      };
    } else {
      throw createValueHasWrongTypeError(inputsField, value, `@Directive.inputs array can only contain strings or object literals`);
    }
  }
  return inputs;
}
function tryGetDecoratorOnMember(member, decoratorName, isCore) {
  if (member.decorators === null) {
    return null;
  }
  for (const decorator of member.decorators) {
    if (isAngularDecorator(decorator, decoratorName, isCore)) {
      return decorator;
    }
  }
  return null;
}
function tryParseInputFieldMapping(clazz, member, evaluator, reflector, importTracker, isCore, refEmitter, compilationMode) {
  const classPropertyName = member.name;
  const decorator = tryGetDecoratorOnMember(member, "Input", isCore);
  const signalInputMapping = tryParseSignalInputMapping(member, reflector, importTracker);
  const modelInputMapping = tryParseSignalModelMapping(member, reflector, importTracker);
  if (decorator !== null && signalInputMapping !== null) {
    throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR, decorator.node, `Using @Input with a signal input is not allowed.`);
  }
  if (decorator !== null && modelInputMapping !== null) {
    throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR, decorator.node, `Using @Input with a model input is not allowed.`);
  }
  if (decorator !== null) {
    if (decorator.args !== null && decorator.args.length > 1) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, `@${decorator.name} can have at most one argument, got ${decorator.args.length} argument(s)`);
    }
    const optionsNode = decorator.args !== null && decorator.args.length === 1 ? decorator.args[0] : void 0;
    const options = optionsNode !== void 0 ? evaluator.evaluate(optionsNode) : null;
    const required = options instanceof Map ? options.get("required") === true : false;
    if (options !== null && typeof options !== "string" && !(options instanceof Map)) {
      throw createValueHasWrongTypeError(decorator.node, options, `@${decorator.name} decorator argument must resolve to a string or an object literal`);
    }
    let alias = null;
    if (typeof options === "string") {
      alias = options;
    } else if (options instanceof Map && typeof options.get("alias") === "string") {
      alias = options.get("alias");
    }
    const publicInputName = alias != null ? alias : classPropertyName;
    let transform = null;
    if (options instanceof Map && options.has("transform")) {
      const transformValue = options.get("transform");
      if (!(transformValue instanceof DynamicValue) && !(transformValue instanceof Reference)) {
        throw createValueHasWrongTypeError(optionsNode, transformValue, `Input transform must be a function`);
      }
      transform = parseDecoratorInputTransformFunction(clazz, classPropertyName, transformValue, reflector, refEmitter, compilationMode);
    }
    return {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: publicInputName,
      transform,
      required
    };
  }
  if (signalInputMapping !== null) {
    return signalInputMapping;
  }
  if (modelInputMapping !== null) {
    return modelInputMapping.input;
  }
  return null;
}
function parseInputFields(clazz, members, evaluator, reflector, importTracker, refEmitter, isCore, compilationMode, inputsFromClassDecorator, classDecorator) {
  var _a, _b;
  const inputs = {};
  for (const member of members) {
    const classPropertyName = member.name;
    const inputMapping = tryParseInputFieldMapping(clazz, member, evaluator, reflector, importTracker, isCore, refEmitter, compilationMode);
    if (inputMapping === null) {
      continue;
    }
    if (member.isStatic) {
      throw new FatalDiagnosticError(ErrorCode.INCORRECTLY_DECLARED_ON_STATIC_MEMBER, (_a = member.node) != null ? _a : clazz, `Input "${member.name}" is incorrectly declared as static member of "${clazz.name.text}".`);
    }
    if (inputMapping.isSignal && inputsFromClassDecorator.hasOwnProperty(classPropertyName)) {
      throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_DECORATOR_METADATA_COLLISION, (_b = member.node) != null ? _b : clazz, `Input "${member.name}" is also declared as non-signal in @${classDecorator.name}.`);
    }
    inputs[classPropertyName] = inputMapping;
  }
  return inputs;
}
function parseDecoratorInputTransformFunction(clazz, classPropertyName, value, reflector, refEmitter, compilationMode) {
  var _a;
  if (compilationMode === CompilationMode.LOCAL) {
    const node2 = value instanceof Reference ? value.getIdentityIn(clazz.getSourceFile()) : value.node;
    if (node2 === null) {
      throw createValueHasWrongTypeError(value.node, value, "Input transform function could not be referenced");
    }
    return {
      node: node2,
      type: new Reference(ts22.factory.createKeywordTypeNode(ts22.SyntaxKind.UnknownKeyword))
    };
  }
  const definition = reflector.getDefinitionOfFunction(value.node);
  if (definition === null) {
    throw createValueHasWrongTypeError(value.node, value, "Input transform must be a function");
  }
  if (definition.typeParameters !== null && definition.typeParameters.length > 0) {
    throw createValueHasWrongTypeError(value.node, value, "Input transform function cannot be generic");
  }
  if (definition.signatureCount > 1) {
    throw createValueHasWrongTypeError(value.node, value, "Input transform function cannot have multiple signatures");
  }
  const members = reflector.getMembersOfClass(clazz);
  for (const member of members) {
    const conflictingName = `ngAcceptInputType_${classPropertyName}`;
    if (member.name === conflictingName && member.isStatic) {
      throw new FatalDiagnosticError(ErrorCode.CONFLICTING_INPUT_TRANSFORM, value.node, `Class cannot have both a transform function on Input ${classPropertyName} and a static member called ${conflictingName}`);
    }
  }
  const node = value instanceof Reference ? value.getIdentityIn(clazz.getSourceFile()) : value.node;
  if (node === null) {
    throw createValueHasWrongTypeError(value.node, value, "Input transform function could not be referenced");
  }
  const firstParam = ((_a = definition.parameters[0]) == null ? void 0 : _a.name) === "this" ? definition.parameters[1] : definition.parameters[0];
  if (!firstParam) {
    return {
      node,
      type: new Reference(ts22.factory.createKeywordTypeNode(ts22.SyntaxKind.UnknownKeyword))
    };
  }
  if (!firstParam.type) {
    throw createValueHasWrongTypeError(value.node, value, "Input transform function first parameter must have a type");
  }
  if (firstParam.node.dotDotDotToken) {
    throw createValueHasWrongTypeError(value.node, value, "Input transform function first parameter cannot be a spread parameter");
  }
  assertEmittableInputType(firstParam.type, clazz.getSourceFile(), reflector, refEmitter);
  const viaModule = value instanceof Reference ? value.bestGuessOwningModule : null;
  return { node, type: new Reference(firstParam.type, viaModule) };
}
function assertEmittableInputType(type, contextFile, reflector, refEmitter) {
  (function walk(node) {
    if (ts22.isTypeReferenceNode(node) && ts22.isIdentifier(node.typeName)) {
      const declaration = reflector.getDeclarationOfIdentifier(node.typeName);
      if (declaration !== null) {
        if (declaration.node.getSourceFile() !== contextFile) {
          const emittedType = refEmitter.emit(new Reference(declaration.node, declaration.viaModule === AmbientImport ? AmbientImport : null), contextFile, ImportFlags.NoAliasing | ImportFlags.AllowTypeImports | ImportFlags.AllowRelativeDtsImports | ImportFlags.AllowAmbientReferences);
          assertSuccessfulReferenceEmit(emittedType, node, "type");
        } else if (!reflector.isStaticallyExported(declaration.node)) {
          throw new FatalDiagnosticError(ErrorCode.SYMBOL_NOT_EXPORTED, type, `Symbol must be exported in order to be used as the type of an Input transform function`, [makeRelatedInformation(declaration.node, `The symbol is declared here.`)]);
        }
      }
    }
    node.forEachChild(walk);
  })(type);
}
function parseQueriesOfClassFields(members, reflector, importTracker, evaluator, isCore) {
  var _a;
  const viewQueries = [];
  const contentQueries = [];
  const decoratorViewChild = [];
  const decoratorViewChildren = [];
  const decoratorContentChild = [];
  const decoratorContentChildren = [];
  for (const member of members) {
    const decoratorQuery = tryGetQueryFromFieldDecorator(member, reflector, evaluator, isCore);
    const signalQuery = tryParseSignalQueryFromInitializer(member, reflector, importTracker);
    if (decoratorQuery !== null && signalQuery !== null) {
      throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR, decoratorQuery.decorator.node, `Using @${decoratorQuery.name} with a signal-based query is not allowed.`);
    }
    const queryNode = (_a = decoratorQuery == null ? void 0 : decoratorQuery.decorator.node) != null ? _a : signalQuery == null ? void 0 : signalQuery.call;
    if (queryNode !== void 0 && member.isStatic) {
      throw new FatalDiagnosticError(ErrorCode.INCORRECTLY_DECLARED_ON_STATIC_MEMBER, queryNode, `Query is incorrectly declared on a static class member.`);
    }
    if (decoratorQuery !== null) {
      switch (decoratorQuery.name) {
        case "ViewChild":
          decoratorViewChild.push(decoratorQuery.metadata);
          break;
        case "ViewChildren":
          decoratorViewChildren.push(decoratorQuery.metadata);
          break;
        case "ContentChild":
          decoratorContentChild.push(decoratorQuery.metadata);
          break;
        case "ContentChildren":
          decoratorContentChildren.push(decoratorQuery.metadata);
          break;
      }
    } else if (signalQuery !== null) {
      switch (signalQuery.name) {
        case "viewChild":
        case "viewChildren":
          viewQueries.push(signalQuery.metadata);
          break;
        case "contentChild":
        case "contentChildren":
          contentQueries.push(signalQuery.metadata);
          break;
      }
    }
  }
  return {
    viewQueries: [...viewQueries, ...decoratorViewChild, ...decoratorViewChildren],
    contentQueries: [...contentQueries, ...decoratorContentChild, ...decoratorContentChildren]
  };
}
function parseOutputsArray(directive, evaluator) {
  const metaValues = parseFieldStringArrayValue(directive, "outputs", evaluator);
  return metaValues ? parseMappingStringArray(metaValues) : EMPTY_OBJECT;
}
function parseOutputFields(clazz, classDecorator, members, isCore, reflector, importTracker, evaluator, outputsFromMeta) {
  var _a, _b, _c;
  const outputs = {};
  for (const member of members) {
    const decoratorOutput = tryParseDecoratorOutput(member, evaluator, isCore);
    const initializerOutput = tryParseInitializerBasedOutput(member, reflector, importTracker);
    const modelMapping = tryParseSignalModelMapping(member, reflector, importTracker);
    if (decoratorOutput !== null && initializerOutput !== null) {
      throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR, decoratorOutput.decorator.node, `Using "@Output" with "output()" is not allowed.`);
    }
    if (decoratorOutput !== null && modelMapping !== null) {
      throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR, decoratorOutput.decorator.node, `Using @Output with a model input is not allowed.`);
    }
    const queryNode = (_b = (_a = decoratorOutput == null ? void 0 : decoratorOutput.decorator.node) != null ? _a : initializerOutput == null ? void 0 : initializerOutput.call) != null ? _b : modelMapping == null ? void 0 : modelMapping.call;
    if (queryNode !== void 0 && member.isStatic) {
      throw new FatalDiagnosticError(ErrorCode.INCORRECTLY_DECLARED_ON_STATIC_MEMBER, queryNode, `Output is incorrectly declared on a static class member.`);
    }
    let bindingPropertyName;
    if (decoratorOutput !== null) {
      bindingPropertyName = decoratorOutput.metadata.bindingPropertyName;
    } else if (initializerOutput !== null) {
      bindingPropertyName = initializerOutput.metadata.bindingPropertyName;
    } else if (modelMapping !== null) {
      bindingPropertyName = modelMapping.output.bindingPropertyName;
    } else {
      continue;
    }
    if ((initializerOutput !== null || modelMapping !== null) && outputsFromMeta.hasOwnProperty(member.name)) {
      throw new FatalDiagnosticError(ErrorCode.INITIALIZER_API_DECORATOR_METADATA_COLLISION, (_c = member.node) != null ? _c : clazz, `Output "${member.name}" is unexpectedly declared in @${classDecorator.name} as well.`);
    }
    outputs[member.name] = bindingPropertyName;
  }
  return outputs;
}
function tryParseDecoratorOutput(member, evaluator, isCore) {
  var _a;
  const decorator = tryGetDecoratorOnMember(member, "Output", isCore);
  if (decorator === null) {
    return null;
  }
  if (decorator.args !== null && decorator.args.length > 1) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, `@Output can have at most one argument, got ${decorator.args.length} argument(s)`);
  }
  const classPropertyName = member.name;
  let alias = null;
  if (((_a = decorator.args) == null ? void 0 : _a.length) === 1) {
    const resolvedAlias = evaluator.evaluate(decorator.args[0]);
    if (typeof resolvedAlias !== "string") {
      throw createValueHasWrongTypeError(decorator.node, resolvedAlias, `@Output decorator argument must resolve to a string`);
    }
    alias = resolvedAlias;
  }
  return {
    decorator,
    metadata: {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: alias != null ? alias : classPropertyName
    }
  };
}
function evaluateHostExpressionBindings(hostExpr, evaluator) {
  const hostMetaMap = evaluator.evaluate(hostExpr);
  if (!(hostMetaMap instanceof Map)) {
    throw createValueHasWrongTypeError(hostExpr, hostMetaMap, `Decorator host metadata must be an object`);
  }
  const hostMetadata = {};
  hostMetaMap.forEach((value, key) => {
    if (value instanceof EnumValue) {
      value = value.resolved;
    }
    if (typeof key !== "string") {
      throw createValueHasWrongTypeError(hostExpr, key, `Decorator host metadata must be a string -> string object, but found unparseable key`);
    }
    if (typeof value == "string") {
      hostMetadata[key] = value;
    } else if (value instanceof DynamicValue) {
      hostMetadata[key] = new WrappedNodeExpr5(value.node);
    } else {
      throw createValueHasWrongTypeError(hostExpr, value, `Decorator host metadata must be a string -> string object, but found unparseable value`);
    }
  });
  const bindings = parseHostBindings(hostMetadata);
  const errors = verifyHostBindings(bindings, createSourceSpan(hostExpr));
  if (errors.length > 0) {
    throw new FatalDiagnosticError(ErrorCode.HOST_BINDING_PARSE_ERROR, getHostBindingErrorNode(errors[0], hostExpr), errors.map((error) => error.msg).join("\n"));
  }
  return bindings;
}
function getHostBindingErrorNode(error, hostExpr) {
  if (ts22.isObjectLiteralExpression(hostExpr) && error.relatedError instanceof ParserError) {
    for (const prop of hostExpr.properties) {
      if (ts22.isPropertyAssignment(prop) && ts22.isStringLiteralLike(prop.initializer) && prop.initializer.text === error.relatedError.input) {
        return prop.initializer;
      }
    }
  }
  return hostExpr;
}
function extractHostDirectives(rawHostDirectives, evaluator, compilationMode) {
  const resolved = evaluator.evaluate(rawHostDirectives, forwardRefResolver);
  if (!Array.isArray(resolved)) {
    throw createValueHasWrongTypeError(rawHostDirectives, resolved, "hostDirectives must be an array");
  }
  return resolved.map((value) => {
    const hostReference = value instanceof Map ? value.get("directive") : value;
    if (compilationMode !== CompilationMode.LOCAL) {
      if (!(hostReference instanceof Reference)) {
        throw createValueHasWrongTypeError(rawHostDirectives, hostReference, "Host directive must be a reference");
      }
      if (!isNamedClassDeclaration(hostReference.node)) {
        throw createValueHasWrongTypeError(rawHostDirectives, hostReference, "Host directive reference must be a class");
      }
    }
    let directive;
    let nameForErrors = (fieldName) => "@Directive.hostDirectives";
    if (compilationMode === CompilationMode.LOCAL && hostReference instanceof DynamicValue) {
      if (!ts22.isIdentifier(hostReference.node) && !ts22.isPropertyAccessExpression(hostReference.node)) {
        throw new FatalDiagnosticError(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION, hostReference.node, `In local compilation mode, host directive cannot be an expression. Use an identifier instead`);
      }
      directive = new WrappedNodeExpr5(hostReference.node);
    } else if (hostReference instanceof Reference) {
      directive = hostReference;
      nameForErrors = (fieldName) => `@Directive.hostDirectives.${directive.node.name.text}.${fieldName}`;
    } else {
      throw new Error("Impossible state");
    }
    const meta = {
      directive,
      isForwardReference: hostReference instanceof Reference && hostReference.synthetic,
      inputs: parseHostDirectivesMapping("inputs", value, nameForErrors("input"), rawHostDirectives),
      outputs: parseHostDirectivesMapping("outputs", value, nameForErrors("output"), rawHostDirectives)
    };
    return meta;
  });
}
function parseHostDirectivesMapping(field, resolvedValue, nameForErrors, sourceExpression) {
  if (resolvedValue instanceof Map && resolvedValue.has(field)) {
    const rawInputs = resolvedValue.get(field);
    if (isStringArrayOrDie(rawInputs, nameForErrors, sourceExpression)) {
      return parseMappingStringArray(rawInputs);
    }
  }
  return null;
}
function toHostDirectiveMetadata(hostDirective, context, refEmitter) {
  let directive;
  if (hostDirective.directive instanceof Reference) {
    directive = toR3Reference(hostDirective.directive.node, hostDirective.directive, context, refEmitter);
  } else {
    directive = {
      value: hostDirective.directive,
      type: hostDirective.directive
    };
  }
  return {
    directive,
    isForwardReference: hostDirective.isForwardReference,
    inputs: hostDirective.inputs || null,
    outputs: hostDirective.outputs || null
  };
}
function toR3InputMetadata(mapping) {
  return {
    classPropertyName: mapping.classPropertyName,
    bindingPropertyName: mapping.bindingPropertyName,
    required: mapping.required,
    transformFunction: mapping.transform !== null ? new WrappedNodeExpr5(mapping.transform.node) : null,
    isSignal: mapping.isSignal
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/symbol.mjs
var DirectiveSymbol = class extends SemanticSymbol {
  selector;
  inputs;
  outputs;
  exportAs;
  typeCheckMeta;
  typeParameters;
  baseClass = null;
  constructor(decl, selector, inputs, outputs, exportAs, typeCheckMeta, typeParameters) {
    super(decl);
    this.selector = selector;
    this.inputs = inputs;
    this.outputs = outputs;
    this.exportAs = exportAs;
    this.typeCheckMeta = typeCheckMeta;
    this.typeParameters = typeParameters;
  }
  isPublicApiAffected(previousSymbol) {
    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return true;
    }
    return this.selector !== previousSymbol.selector || !isArrayEqual(this.inputs.propertyNames, previousSymbol.inputs.propertyNames) || !isArrayEqual(this.outputs.propertyNames, previousSymbol.outputs.propertyNames) || !isArrayEqual(this.exportAs, previousSymbol.exportAs);
  }
  isTypeCheckApiAffected(previousSymbol) {
    if (this.isPublicApiAffected(previousSymbol)) {
      return true;
    }
    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return true;
    }
    if (!isArrayEqual(Array.from(this.inputs), Array.from(previousSymbol.inputs), isInputMappingEqual) || !isArrayEqual(Array.from(this.outputs), Array.from(previousSymbol.outputs), isInputOrOutputEqual)) {
      return true;
    }
    if (!areTypeParametersEqual(this.typeParameters, previousSymbol.typeParameters)) {
      return true;
    }
    if (!isTypeCheckMetaEqual(this.typeCheckMeta, previousSymbol.typeCheckMeta)) {
      return true;
    }
    if (!isBaseClassEqual(this.baseClass, previousSymbol.baseClass)) {
      return true;
    }
    return false;
  }
};
function isInputMappingEqual(current, previous) {
  return isInputOrOutputEqual(current, previous) && current.required === previous.required;
}
function isInputOrOutputEqual(current, previous) {
  return current.classPropertyName === previous.classPropertyName && current.bindingPropertyName === previous.bindingPropertyName && current.isSignal === previous.isSignal;
}
function isTypeCheckMetaEqual(current, previous) {
  if (current.hasNgTemplateContextGuard !== previous.hasNgTemplateContextGuard) {
    return false;
  }
  if (current.isGeneric !== previous.isGeneric) {
    return false;
  }
  if (!isArrayEqual(current.ngTemplateGuards, previous.ngTemplateGuards, isTemplateGuardEqual)) {
    return false;
  }
  if (!isSetEqual(current.coercedInputFields, previous.coercedInputFields)) {
    return false;
  }
  if (!isSetEqual(current.restrictedInputFields, previous.restrictedInputFields)) {
    return false;
  }
  if (!isSetEqual(current.stringLiteralInputFields, previous.stringLiteralInputFields)) {
    return false;
  }
  if (!isSetEqual(current.undeclaredInputFields, previous.undeclaredInputFields)) {
    return false;
  }
  return true;
}
function isTemplateGuardEqual(current, previous) {
  return current.inputName === previous.inputName && current.type === previous.type;
}
function isBaseClassEqual(current, previous) {
  if (current === null || previous === null) {
    return current === previous;
  }
  return isSymbolEqual(current, previous);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/directive/src/handler.mjs
var FIELD_DECORATORS = [
  "Input",
  "Output",
  "ViewChild",
  "ViewChildren",
  "ContentChild",
  "ContentChildren",
  "HostBinding",
  "HostListener"
];
var LIFECYCLE_HOOKS = /* @__PURE__ */ new Set([
  "ngOnChanges",
  "ngOnInit",
  "ngOnDestroy",
  "ngDoCheck",
  "ngAfterViewInit",
  "ngAfterViewChecked",
  "ngAfterContentInit",
  "ngAfterContentChecked"
]);
var DirectiveDecoratorHandler = class {
  reflector;
  evaluator;
  metaRegistry;
  scopeRegistry;
  metaReader;
  injectableRegistry;
  refEmitter;
  referencesRegistry;
  isCore;
  strictCtorDeps;
  semanticDepGraphUpdater;
  annotateForClosureCompiler;
  perf;
  importTracker;
  includeClassMetadata;
  compilationMode;
  jitDeclarationRegistry;
  strictStandalone;
  implicitStandaloneValue;
  constructor(reflector, evaluator, metaRegistry, scopeRegistry, metaReader, injectableRegistry, refEmitter, referencesRegistry, isCore, strictCtorDeps, semanticDepGraphUpdater, annotateForClosureCompiler, perf, importTracker, includeClassMetadata, compilationMode, jitDeclarationRegistry, strictStandalone, implicitStandaloneValue) {
    this.reflector = reflector;
    this.evaluator = evaluator;
    this.metaRegistry = metaRegistry;
    this.scopeRegistry = scopeRegistry;
    this.metaReader = metaReader;
    this.injectableRegistry = injectableRegistry;
    this.refEmitter = refEmitter;
    this.referencesRegistry = referencesRegistry;
    this.isCore = isCore;
    this.strictCtorDeps = strictCtorDeps;
    this.semanticDepGraphUpdater = semanticDepGraphUpdater;
    this.annotateForClosureCompiler = annotateForClosureCompiler;
    this.perf = perf;
    this.importTracker = importTracker;
    this.includeClassMetadata = includeClassMetadata;
    this.compilationMode = compilationMode;
    this.jitDeclarationRegistry = jitDeclarationRegistry;
    this.strictStandalone = strictStandalone;
    this.implicitStandaloneValue = implicitStandaloneValue;
  }
  precedence = HandlerPrecedence.PRIMARY;
  name = "DirectiveDecoratorHandler";
  detect(node, decorators) {
    if (!decorators) {
      const angularField = this.findClassFieldWithAngularFeatures(node);
      return angularField ? { trigger: angularField.node, decorator: null, metadata: null } : void 0;
    } else {
      const decorator = findAngularDecorator(decorators, "Directive", this.isCore);
      return decorator ? { trigger: decorator.node, decorator, metadata: decorator } : void 0;
    }
  }
  analyze(node, decorator) {
    var _a;
    if (decorator === null) {
      if (this.isCore) {
        return {};
      }
      return { diagnostics: [getUndecoratedClassWithAngularFeaturesDiagnostic(node)] };
    }
    this.perf.eventCount(PerfEvent.AnalyzeDirective);
    const directiveResult = extractDirectiveMetadata(
      node,
      decorator,
      this.reflector,
      this.importTracker,
      this.evaluator,
      this.refEmitter,
      this.referencesRegistry,
      this.isCore,
      this.annotateForClosureCompiler,
      this.compilationMode,
      null,
      this.strictStandalone,
      this.implicitStandaloneValue
    );
    if (directiveResult.jitForced) {
      this.jitDeclarationRegistry.jitDeclarations.add(node);
      return {};
    }
    const analysis = directiveResult.metadata;
    let providersRequiringFactory = null;
    if (directiveResult !== void 0 && directiveResult.decorator.has("providers")) {
      providersRequiringFactory = resolveProvidersRequiringFactory(directiveResult.decorator.get("providers"), this.reflector, this.evaluator);
    }
    return {
      analysis: {
        inputs: directiveResult.inputs,
        inputFieldNamesFromMetadataArray: directiveResult.inputFieldNamesFromMetadataArray,
        outputs: directiveResult.outputs,
        meta: analysis,
        hostDirectives: directiveResult.hostDirectives,
        rawHostDirectives: directiveResult.rawHostDirectives,
        classMetadata: this.includeClassMetadata ? extractClassMetadata(node, this.reflector, this.isCore, this.annotateForClosureCompiler) : null,
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, directiveResult.inputs, this.reflector),
        providersRequiringFactory,
        isPoisoned: false,
        isStructural: directiveResult.isStructural,
        decorator: (_a = decorator == null ? void 0 : decorator.node) != null ? _a : null
      }
    };
  }
  symbol(node, analysis) {
    const typeParameters = extractSemanticTypeParameters(node);
    return new DirectiveSymbol(node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs, analysis.typeCheckMeta, typeParameters);
  }
  register(node, analysis) {
    const ref = new Reference(node);
    this.metaRegistry.registerDirectiveMetadata({
      kind: MetaKind.Directive,
      matchSource: MatchSource.Selector,
      ref,
      name: node.name.text,
      selector: analysis.meta.selector,
      exportAs: analysis.meta.exportAs,
      inputs: analysis.inputs,
      inputFieldNamesFromMetadataArray: analysis.inputFieldNamesFromMetadataArray,
      outputs: analysis.outputs,
      queries: analysis.meta.queries.map((query) => query.propertyName),
      isComponent: false,
      baseClass: analysis.baseClass,
      hostDirectives: analysis.hostDirectives,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: analysis.isStructural,
      animationTriggerNames: null,
      isStandalone: analysis.meta.isStandalone,
      isSignal: analysis.meta.isSignal,
      imports: null,
      rawImports: null,
      deferredImports: null,
      schemas: null,
      ngContentSelectors: null,
      decorator: analysis.decorator,
      preserveWhitespaces: false,
      assumedToExportProviders: false,
      isExplicitlyDeferred: false
    });
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps
    });
  }
  resolve(node, analysis, symbol) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }
    if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof Reference) {
      symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
    }
    const diagnostics = [];
    if (analysis.providersRequiringFactory !== null && analysis.meta.providers instanceof WrappedNodeExpr6) {
      const providerDiagnostics = getProviderDiagnostics(analysis.providersRequiringFactory, analysis.meta.providers.node, this.injectableRegistry);
      diagnostics.push(...providerDiagnostics);
    }
    const directiveDiagnostics = getDirectiveDiagnostics(node, this.injectableRegistry, this.evaluator, this.reflector, this.scopeRegistry, this.strictCtorDeps, "Directive");
    if (directiveDiagnostics !== null) {
      diagnostics.push(...directiveDiagnostics);
    }
    const hostDirectivesDiagnotics = analysis.hostDirectives && analysis.rawHostDirectives ? validateHostDirectives(analysis.rawHostDirectives, analysis.hostDirectives, this.metaReader) : null;
    if (hostDirectivesDiagnotics !== null) {
      diagnostics.push(...hostDirectivesDiagnotics);
    }
    return { diagnostics: diagnostics.length > 0 ? diagnostics : void 0 };
  }
  compileFull(node, analysis, resolution, pool) {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDirectiveFromMetadata(analysis.meta, pool, makeBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ? compileClassMetadata(analysis.classMetadata).toStmt() : null;
    return compileResults(fac, def, classMetadata, "\u0275dir", inputTransformFields, null);
  }
  compilePartial(node, analysis, resolution) {
    const fac = compileDeclareFactory(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDeclareDirectiveFromMetadata(analysis.meta);
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ? compileDeclareClassMetadata(analysis.classMetadata).toStmt() : null;
    return compileResults(fac, def, classMetadata, "\u0275dir", inputTransformFields, null);
  }
  compileLocal(node, analysis, resolution, pool) {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDirectiveFromMetadata(analysis.meta, pool, makeBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ? compileClassMetadata(analysis.classMetadata).toStmt() : null;
    return compileResults(fac, def, classMetadata, "\u0275dir", inputTransformFields, null);
  }
  findClassFieldWithAngularFeatures(node) {
    return this.reflector.getMembersOfClass(node).find((member) => {
      if (!member.isStatic && member.kind === ClassMemberKind.Method && LIFECYCLE_HOOKS.has(member.name)) {
        return true;
      }
      if (member.decorators) {
        return member.decorators.some((decorator) => FIELD_DECORATORS.some((decoratorName) => isAngularDecorator(decorator, decoratorName, this.isCore)));
      }
      return false;
    });
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.mjs
import { compileClassMetadata as compileClassMetadata2, compileDeclareClassMetadata as compileDeclareClassMetadata2, compileDeclareInjectorFromMetadata, compileDeclareNgModuleFromMetadata, compileInjector, compileNgModule, ExternalExpr as ExternalExpr5, FactoryTarget as FactoryTarget2, FunctionExpr, InvokeFunctionExpr, LiteralArrayExpr as LiteralArrayExpr2, R3Identifiers, R3NgModuleMetadataKind, R3SelectorScopeMode, ReturnStatement, WrappedNodeExpr as WrappedNodeExpr7 } from "@angular/compiler";
import ts24 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/module_with_providers.mjs
import ts23 from "typescript";
function createModuleWithProvidersResolver(reflector, isCore) {
  function _reflectModuleFromTypeParam(type, node) {
    if (!ts23.isTypeReferenceNode(type)) {
      return null;
    }
    const typeName = type && (ts23.isIdentifier(type.typeName) && type.typeName || ts23.isQualifiedName(type.typeName) && type.typeName.right) || null;
    if (typeName === null) {
      return null;
    }
    const id = reflector.getImportOfIdentifier(typeName);
    if (id === null || id.name !== "ModuleWithProviders") {
      return null;
    }
    if (!isCore && id.from !== "@angular/core") {
      return null;
    }
    if (type.typeArguments === void 0 || type.typeArguments.length !== 1) {
      const parent = ts23.isMethodDeclaration(node) && ts23.isClassDeclaration(node.parent) ? node.parent : null;
      const symbolName = (parent && parent.name ? parent.name.getText() + "." : "") + (node.name ? node.name.getText() : "anonymous");
      throw new FatalDiagnosticError(ErrorCode.NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC, type, `${symbolName} returns a ModuleWithProviders type without a generic type argument. Please add a generic type argument to the ModuleWithProviders type. If this occurrence is in library code you don't control, please contact the library authors.`);
    }
    const arg = type.typeArguments[0];
    return typeNodeToValueExpr(arg);
  }
  function _reflectModuleFromLiteralType(type) {
    if (!ts23.isIntersectionTypeNode(type)) {
      return null;
    }
    for (const t of type.types) {
      if (ts23.isTypeLiteralNode(t)) {
        for (const m of t.members) {
          const ngModuleType = ts23.isPropertySignature(m) && ts23.isIdentifier(m.name) && m.name.text === "ngModule" && m.type || null;
          let ngModuleExpression = null;
          if (ngModuleType !== null && ts23.isTypeQueryNode(ngModuleType)) {
            ngModuleExpression = entityNameToValue(ngModuleType.exprName);
          } else if (ngModuleType !== null) {
            ngModuleExpression = typeNodeToValueExpr(ngModuleType);
          }
          if (ngModuleExpression) {
            return ngModuleExpression;
          }
        }
      }
    }
    return null;
  }
  return (fn, callExpr, resolve, unresolvable) => {
    var _a;
    const rawType = fn.node.type;
    if (rawType === void 0) {
      return unresolvable;
    }
    const type = (_a = _reflectModuleFromTypeParam(rawType, fn.node)) != null ? _a : _reflectModuleFromLiteralType(rawType);
    if (type === null) {
      return unresolvable;
    }
    const ngModule = resolve(type);
    if (!(ngModule instanceof Reference) || !isNamedClassDeclaration(ngModule.node)) {
      return unresolvable;
    }
    return new SyntheticValue({
      ngModule,
      mwpCall: callExpr
    });
  };
}
function isResolvedModuleWithProviders(sv) {
  return typeof sv.value === "object" && sv.value != null && sv.value.hasOwnProperty("ngModule") && sv.value.hasOwnProperty("mwpCall");
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.mjs
var NgModuleSymbol = class extends SemanticSymbol {
  hasProviders;
  remotelyScopedComponents = [];
  transitiveImportsFromStandaloneComponents = /* @__PURE__ */ new Set();
  constructor(decl, hasProviders) {
    super(decl);
    this.hasProviders = hasProviders;
  }
  isPublicApiAffected(previousSymbol) {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }
    if (previousSymbol.hasProviders !== this.hasProviders) {
      return true;
    }
    return false;
  }
  isEmitAffected(previousSymbol) {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }
    if (previousSymbol.remotelyScopedComponents.length !== this.remotelyScopedComponents.length) {
      return true;
    }
    for (const currEntry of this.remotelyScopedComponents) {
      const prevEntry = previousSymbol.remotelyScopedComponents.find((prevEntry2) => {
        return isSymbolEqual(prevEntry2.component, currEntry.component);
      });
      if (prevEntry === void 0) {
        return true;
      }
      if (!isArrayEqual(currEntry.usedDirectives, prevEntry.usedDirectives, isReferenceEqual)) {
        return true;
      }
      if (!isArrayEqual(currEntry.usedPipes, prevEntry.usedPipes, isReferenceEqual)) {
        return true;
      }
    }
    if (previousSymbol.transitiveImportsFromStandaloneComponents.size !== this.transitiveImportsFromStandaloneComponents.size) {
      return true;
    }
    const previousImports = Array.from(previousSymbol.transitiveImportsFromStandaloneComponents);
    for (const transitiveImport of this.transitiveImportsFromStandaloneComponents) {
      const prevEntry = previousImports.find((prevEntry2) => isSymbolEqual(prevEntry2, transitiveImport));
      if (prevEntry === void 0) {
        return true;
      }
      if (transitiveImport.isPublicApiAffected(prevEntry)) {
        return true;
      }
    }
    return false;
  }
  isTypeCheckApiAffected(previousSymbol) {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return true;
    }
    return false;
  }
  addRemotelyScopedComponent(component, usedDirectives, usedPipes) {
    this.remotelyScopedComponents.push({ component, usedDirectives, usedPipes });
  }
  addTransitiveImportFromStandaloneComponent(importedSymbol) {
    this.transitiveImportsFromStandaloneComponents.add(importedSymbol);
  }
};
var NgModuleDecoratorHandler = class {
  reflector;
  evaluator;
  metaReader;
  metaRegistry;
  scopeRegistry;
  referencesRegistry;
  exportedProviderStatusResolver;
  semanticDepGraphUpdater;
  isCore;
  refEmitter;
  annotateForClosureCompiler;
  onlyPublishPublicTypings;
  injectableRegistry;
  perf;
  includeClassMetadata;
  includeSelectorScope;
  compilationMode;
  localCompilationExtraImportsTracker;
  jitDeclarationRegistry;
  constructor(reflector, evaluator, metaReader, metaRegistry, scopeRegistry, referencesRegistry, exportedProviderStatusResolver, semanticDepGraphUpdater, isCore, refEmitter, annotateForClosureCompiler, onlyPublishPublicTypings, injectableRegistry, perf, includeClassMetadata, includeSelectorScope, compilationMode, localCompilationExtraImportsTracker, jitDeclarationRegistry) {
    this.reflector = reflector;
    this.evaluator = evaluator;
    this.metaReader = metaReader;
    this.metaRegistry = metaRegistry;
    this.scopeRegistry = scopeRegistry;
    this.referencesRegistry = referencesRegistry;
    this.exportedProviderStatusResolver = exportedProviderStatusResolver;
    this.semanticDepGraphUpdater = semanticDepGraphUpdater;
    this.isCore = isCore;
    this.refEmitter = refEmitter;
    this.annotateForClosureCompiler = annotateForClosureCompiler;
    this.onlyPublishPublicTypings = onlyPublishPublicTypings;
    this.injectableRegistry = injectableRegistry;
    this.perf = perf;
    this.includeClassMetadata = includeClassMetadata;
    this.includeSelectorScope = includeSelectorScope;
    this.compilationMode = compilationMode;
    this.localCompilationExtraImportsTracker = localCompilationExtraImportsTracker;
    this.jitDeclarationRegistry = jitDeclarationRegistry;
  }
  precedence = HandlerPrecedence.PRIMARY;
  name = "NgModuleDecoratorHandler";
  detect(node, decorators) {
    if (!decorators) {
      return void 0;
    }
    const decorator = findAngularDecorator(decorators, "NgModule", this.isCore);
    if (decorator !== void 0) {
      return {
        trigger: decorator.node,
        decorator,
        metadata: decorator
      };
    } else {
      return void 0;
    }
  }
  analyze(node, decorator) {
    var _a, _b, _c, _d, _e;
    this.perf.eventCount(PerfEvent.AnalyzeNgModule);
    const name = node.name.text;
    if (decorator.args === null || decorator.args.length > 1) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, `Incorrect number of arguments to @NgModule decorator`);
    }
    const meta = decorator.args.length === 1 ? unwrapExpression(decorator.args[0]) : ts24.factory.createObjectLiteralExpression([]);
    if (!ts24.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, "@NgModule argument must be an object literal");
    }
    const ngModule = reflectObjectLiteral(meta);
    if (ngModule.has("jit")) {
      this.jitDeclarationRegistry.jitDeclarations.add(node);
      return {};
    }
    const moduleResolvers = combineResolvers([
      createModuleWithProvidersResolver(this.reflector, this.isCore),
      forwardRefResolver
    ]);
    const diagnostics = [];
    let declarationRefs = [];
    const rawDeclarations = (_a = ngModule.get("declarations")) != null ? _a : null;
    if (rawDeclarations !== null) {
      const declarationMeta = this.evaluator.evaluate(rawDeclarations, forwardRefResolver);
      declarationRefs = this.resolveTypeList(rawDeclarations, declarationMeta, name, "declarations", 0, this.compilationMode === CompilationMode.LOCAL).references;
      for (const ref of declarationRefs) {
        if (ref.node.getSourceFile().isDeclarationFile) {
          const errorNode = ref.getOriginForDiagnostics(rawDeclarations);
          diagnostics.push(makeDiagnostic(ErrorCode.NGMODULE_INVALID_DECLARATION, errorNode, `Cannot declare '${ref.node.name.text}' in an NgModule as it's not a part of the current compilation.`, [makeRelatedInformation(ref.node.name, `'${ref.node.name.text}' is declared here.`)]));
        }
      }
    }
    if (diagnostics.length > 0) {
      return { diagnostics };
    }
    let importRefs = [];
    let rawImports = (_b = ngModule.get("imports")) != null ? _b : null;
    if (rawImports !== null) {
      const importsMeta = this.evaluator.evaluate(rawImports, moduleResolvers);
      const result = this.resolveTypeList(rawImports, importsMeta, name, "imports", 0, this.compilationMode === CompilationMode.LOCAL);
      if (this.compilationMode === CompilationMode.LOCAL && this.localCompilationExtraImportsTracker !== null) {
        for (const d of result.dynamicValues) {
          this.localCompilationExtraImportsTracker.addGlobalImportFromIdentifier(d.node);
        }
      }
      importRefs = result.references;
    }
    let exportRefs = [];
    const rawExports = (_c = ngModule.get("exports")) != null ? _c : null;
    if (rawExports !== null) {
      const exportsMeta = this.evaluator.evaluate(rawExports, moduleResolvers);
      exportRefs = this.resolveTypeList(rawExports, exportsMeta, name, "exports", 0, this.compilationMode === CompilationMode.LOCAL).references;
      this.referencesRegistry.add(node, ...exportRefs);
    }
    let bootstrapRefs = [];
    const rawBootstrap = (_d = ngModule.get("bootstrap")) != null ? _d : null;
    if (this.compilationMode !== CompilationMode.LOCAL && rawBootstrap !== null) {
      const bootstrapMeta = this.evaluator.evaluate(rawBootstrap, forwardRefResolver);
      bootstrapRefs = this.resolveTypeList(
        rawBootstrap,
        bootstrapMeta,
        name,
        "bootstrap",
        0,
        false
      ).references;
      for (const ref of bootstrapRefs) {
        const dirMeta = this.metaReader.getDirectiveMetadata(ref);
        if (dirMeta == null ? void 0 : dirMeta.isStandalone) {
          diagnostics.push(makeStandaloneBootstrapDiagnostic(node, ref, rawBootstrap));
        }
      }
    }
    const schemas = this.compilationMode !== CompilationMode.LOCAL && ngModule.has("schemas") ? extractSchemas(ngModule.get("schemas"), this.evaluator, "NgModule") : [];
    let id = null;
    if (ngModule.has("id")) {
      const idExpr = ngModule.get("id");
      if (!isModuleIdExpression(idExpr)) {
        id = new WrappedNodeExpr7(idExpr);
      } else {
        const diag = makeDiagnostic(ErrorCode.WARN_NGMODULE_ID_UNNECESSARY, idExpr, `Using 'module.id' for NgModule.id is a common anti-pattern that is ignored by the Angular compiler.`);
        diag.category = ts24.DiagnosticCategory.Warning;
        diagnostics.push(diag);
      }
    }
    const valueContext = node.getSourceFile();
    const exportedNodes = new Set(exportRefs.map((ref) => ref.node));
    const declarations = [];
    const exportedDeclarations = [];
    const bootstrap = bootstrapRefs.map((bootstrap2) => this._toR3Reference(bootstrap2.getOriginForDiagnostics(meta, node.name), bootstrap2, valueContext));
    for (const ref of declarationRefs) {
      const decl = this._toR3Reference(ref.getOriginForDiagnostics(meta, node.name), ref, valueContext);
      declarations.push(decl);
      if (exportedNodes.has(ref.node)) {
        exportedDeclarations.push(decl.type);
      }
    }
    const imports = importRefs.map((imp) => this._toR3Reference(imp.getOriginForDiagnostics(meta, node.name), imp, valueContext));
    const exports = exportRefs.map((exp) => this._toR3Reference(exp.getOriginForDiagnostics(meta, node.name), exp, valueContext));
    const isForwardReference = (ref) => isExpressionForwardReference(ref.value, node.name, valueContext);
    const containsForwardDecls = bootstrap.some(isForwardReference) || declarations.some(isForwardReference) || imports.some(isForwardReference) || exports.some(isForwardReference);
    const type = wrapTypeReference(this.reflector, node);
    let ngModuleMetadata;
    if (this.compilationMode === CompilationMode.LOCAL) {
      ngModuleMetadata = {
        kind: R3NgModuleMetadataKind.Local,
        type,
        bootstrapExpression: rawBootstrap ? new WrappedNodeExpr7(rawBootstrap) : null,
        declarationsExpression: rawDeclarations ? new WrappedNodeExpr7(rawDeclarations) : null,
        exportsExpression: rawExports ? new WrappedNodeExpr7(rawExports) : null,
        importsExpression: rawImports ? new WrappedNodeExpr7(rawImports) : null,
        id,
        selectorScopeMode: R3SelectorScopeMode.SideEffect,
        schemas: []
      };
    } else {
      ngModuleMetadata = {
        kind: R3NgModuleMetadataKind.Global,
        type,
        bootstrap,
        declarations,
        publicDeclarationTypes: this.onlyPublishPublicTypings ? exportedDeclarations : null,
        exports,
        imports,
        includeImportTypes: !this.onlyPublishPublicTypings,
        containsForwardDecls,
        id,
        selectorScopeMode: this.includeSelectorScope ? R3SelectorScopeMode.SideEffect : R3SelectorScopeMode.Omit,
        schemas: []
      };
    }
    const rawProviders = ngModule.has("providers") ? ngModule.get("providers") : null;
    let wrappedProviders = null;
    if (rawProviders !== null && (!ts24.isArrayLiteralExpression(rawProviders) || rawProviders.elements.length > 0)) {
      wrappedProviders = new WrappedNodeExpr7(this.annotateForClosureCompiler ? wrapFunctionExpressionsInParens(rawProviders) : rawProviders);
    }
    const topLevelImports = [];
    if (this.compilationMode !== CompilationMode.LOCAL && ngModule.has("imports")) {
      const rawImports2 = unwrapExpression(ngModule.get("imports"));
      let topLevelExpressions = [];
      if (ts24.isArrayLiteralExpression(rawImports2)) {
        for (const element of rawImports2.elements) {
          if (ts24.isSpreadElement(element)) {
            topLevelExpressions.push(element.expression);
            continue;
          }
          topLevelExpressions.push(element);
        }
      } else {
        topLevelExpressions.push(rawImports2);
      }
      let absoluteIndex = 0;
      for (const importExpr of topLevelExpressions) {
        const resolved = this.evaluator.evaluate(importExpr, moduleResolvers);
        const { references, hasModuleWithProviders } = this.resolveTypeList(
          importExpr,
          [resolved],
          node.name.text,
          "imports",
          absoluteIndex,
          false
        );
        absoluteIndex += references.length;
        topLevelImports.push({
          expression: importExpr,
          resolvedReferences: references,
          hasModuleWithProviders
        });
      }
    }
    const injectorMetadata = {
      name,
      type,
      providers: wrappedProviders,
      imports: []
    };
    if (this.compilationMode === CompilationMode.LOCAL) {
      for (const exp of [rawImports, rawExports]) {
        if (exp === null) {
          continue;
        }
        if (ts24.isArrayLiteralExpression(exp)) {
          if (exp.elements) {
            injectorMetadata.imports.push(...exp.elements.map((n2) => new WrappedNodeExpr7(n2)));
          }
        } else {
          injectorMetadata.imports.push(new WrappedNodeExpr7(exp));
        }
      }
    }
    const factoryMetadata = {
      name,
      type,
      typeArgumentCount: 0,
      deps: getValidConstructorDependencies(node, this.reflector, this.isCore),
      target: FactoryTarget2.NgModule
    };
    const remoteScopesMayRequireCycleProtection = declarationRefs.some(isSyntheticReference) || importRefs.some(isSyntheticReference);
    return {
      diagnostics: diagnostics.length > 0 ? diagnostics : void 0,
      analysis: {
        id,
        schemas,
        mod: ngModuleMetadata,
        inj: injectorMetadata,
        fac: factoryMetadata,
        declarations: declarationRefs,
        rawDeclarations,
        imports: topLevelImports,
        rawImports,
        importRefs,
        exports: exportRefs,
        rawExports,
        providers: rawProviders,
        providersRequiringFactory: rawProviders ? resolveProvidersRequiringFactory(rawProviders, this.reflector, this.evaluator) : null,
        classMetadata: this.includeClassMetadata ? extractClassMetadata(node, this.reflector, this.isCore, this.annotateForClosureCompiler) : null,
        factorySymbolName: node.name.text,
        remoteScopesMayRequireCycleProtection,
        decorator: (_e = decorator == null ? void 0 : decorator.node) != null ? _e : null
      }
    };
  }
  symbol(node, analysis) {
    return new NgModuleSymbol(node, analysis.providers !== null);
  }
  register(node, analysis) {
    this.metaRegistry.registerNgModuleMetadata({
      kind: MetaKind.NgModule,
      ref: new Reference(node),
      schemas: analysis.schemas,
      declarations: analysis.declarations,
      imports: analysis.importRefs,
      exports: analysis.exports,
      rawDeclarations: analysis.rawDeclarations,
      rawImports: analysis.rawImports,
      rawExports: analysis.rawExports,
      decorator: analysis.decorator,
      mayDeclareProviders: analysis.providers !== null,
      isPoisoned: false
    });
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.fac.deps
    });
  }
  resolve(node, analysis) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }
    const scope = this.scopeRegistry.getScopeOfModule(node);
    const diagnostics = [];
    const scopeDiagnostics = this.scopeRegistry.getDiagnosticsOfModule(node);
    if (scopeDiagnostics !== null) {
      diagnostics.push(...scopeDiagnostics);
    }
    if (analysis.providersRequiringFactory !== null) {
      const providerDiagnostics = getProviderDiagnostics(analysis.providersRequiringFactory, analysis.providers, this.injectableRegistry);
      diagnostics.push(...providerDiagnostics);
    }
    const data = {
      injectorImports: []
    };
    for (const topLevelImport of analysis.imports) {
      if (topLevelImport.hasModuleWithProviders) {
        data.injectorImports.push(new WrappedNodeExpr7(topLevelImport.expression));
        continue;
      }
      const refsToEmit = [];
      let symbol = null;
      if (this.semanticDepGraphUpdater !== null) {
        const sym = this.semanticDepGraphUpdater.getSymbol(node);
        if (sym instanceof NgModuleSymbol) {
          symbol = sym;
        }
      }
      for (const ref of topLevelImport.resolvedReferences) {
        const dirMeta = this.metaReader.getDirectiveMetadata(ref);
        if (dirMeta !== null) {
          if (!dirMeta.isComponent) {
            continue;
          }
          const mayExportProviders = this.exportedProviderStatusResolver.mayExportProviders(dirMeta.ref, (importRef) => {
            if (symbol !== null && this.semanticDepGraphUpdater !== null) {
              const importSymbol = this.semanticDepGraphUpdater.getSymbol(importRef.node);
              symbol.addTransitiveImportFromStandaloneComponent(importSymbol);
            }
          });
          if (!mayExportProviders) {
            continue;
          }
        }
        const pipeMeta = dirMeta === null ? this.metaReader.getPipeMetadata(ref) : null;
        if (pipeMeta !== null) {
          continue;
        }
        refsToEmit.push(ref);
      }
      if (refsToEmit.length === topLevelImport.resolvedReferences.length) {
        data.injectorImports.push(new WrappedNodeExpr7(topLevelImport.expression));
      } else {
        const context = node.getSourceFile();
        for (const ref of refsToEmit) {
          const emittedRef = this.refEmitter.emit(ref, context);
          assertSuccessfulReferenceEmit(emittedRef, topLevelImport.expression, "class");
          data.injectorImports.push(emittedRef.expression);
        }
      }
    }
    if (scope !== null && !scope.compilation.isPoisoned) {
      const context = getSourceFile(node);
      for (const exportRef of analysis.exports) {
        if (isNgModule(exportRef.node, scope.compilation)) {
          const type = this.refEmitter.emit(exportRef, context);
          assertSuccessfulReferenceEmit(type, node, "NgModule");
          data.injectorImports.push(type.expression);
        }
      }
      for (const decl of analysis.declarations) {
        const dirMeta = this.metaReader.getDirectiveMetadata(decl);
        if (dirMeta !== null) {
          const refType = dirMeta.isComponent ? "Component" : "Directive";
          if (dirMeta.selector === null) {
            throw new FatalDiagnosticError(ErrorCode.DIRECTIVE_MISSING_SELECTOR, decl.node, `${refType} ${decl.node.name.text} has no selector, please add it!`);
          }
          continue;
        }
      }
    }
    if (diagnostics.length > 0) {
      return { diagnostics };
    }
    if (scope === null || scope.compilation.isPoisoned || scope.exported.isPoisoned || scope.reexports === null) {
      return { data };
    } else {
      return {
        data,
        reexports: scope.reexports
      };
    }
  }
  compileFull(node, { inj, mod, fac, classMetadata, declarations, remoteScopesMayRequireCycleProtection }, { injectorImports }) {
    const factoryFn = compileNgFactoryDefField(fac);
    const ngInjectorDef = compileInjector({
      ...inj,
      imports: injectorImports
    });
    const ngModuleDef = compileNgModule(mod);
    const statements = ngModuleDef.statements;
    const metadata = classMetadata !== null ? compileClassMetadata2(classMetadata) : null;
    this.insertMetadataStatement(statements, metadata);
    this.appendRemoteScopingStatements(statements, node, declarations, remoteScopesMayRequireCycleProtection);
    return this.compileNgModule(factoryFn, ngInjectorDef, ngModuleDef);
  }
  compilePartial(node, { inj, fac, mod, classMetadata }, { injectorImports }) {
    const factoryFn = compileDeclareFactory(fac);
    const injectorDef = compileDeclareInjectorFromMetadata({
      ...inj,
      imports: injectorImports
    });
    const ngModuleDef = compileDeclareNgModuleFromMetadata(mod);
    const metadata = classMetadata !== null ? compileDeclareClassMetadata2(classMetadata) : null;
    this.insertMetadataStatement(ngModuleDef.statements, metadata);
    return this.compileNgModule(factoryFn, injectorDef, ngModuleDef);
  }
  compileLocal(node, { inj, mod, fac, classMetadata, declarations, remoteScopesMayRequireCycleProtection }) {
    const factoryFn = compileNgFactoryDefField(fac);
    const ngInjectorDef = compileInjector({
      ...inj
    });
    const ngModuleDef = compileNgModule(mod);
    const statements = ngModuleDef.statements;
    const metadata = classMetadata !== null ? compileClassMetadata2(classMetadata) : null;
    this.insertMetadataStatement(statements, metadata);
    this.appendRemoteScopingStatements(statements, node, declarations, remoteScopesMayRequireCycleProtection);
    return this.compileNgModule(factoryFn, ngInjectorDef, ngModuleDef);
  }
  insertMetadataStatement(ngModuleStatements, metadata) {
    if (metadata !== null) {
      ngModuleStatements.unshift(metadata.toStmt());
    }
  }
  appendRemoteScopingStatements(ngModuleStatements, node, declarations, remoteScopesMayRequireCycleProtection) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return;
    }
    const context = getSourceFile(node);
    for (const decl of declarations) {
      const remoteScope = this.scopeRegistry.getRemoteScope(decl.node);
      if (remoteScope !== null) {
        const directives = remoteScope.directives.map((directive) => {
          const type = this.refEmitter.emit(directive, context);
          assertSuccessfulReferenceEmit(type, node, "directive");
          return type.expression;
        });
        const pipes = remoteScope.pipes.map((pipe) => {
          const type = this.refEmitter.emit(pipe, context);
          assertSuccessfulReferenceEmit(type, node, "pipe");
          return type.expression;
        });
        const directiveArray = new LiteralArrayExpr2(directives);
        const pipesArray = new LiteralArrayExpr2(pipes);
        const directiveExpr = remoteScopesMayRequireCycleProtection && directives.length > 0 ? new FunctionExpr([], [new ReturnStatement(directiveArray)]) : directiveArray;
        const pipesExpr = remoteScopesMayRequireCycleProtection && pipes.length > 0 ? new FunctionExpr([], [new ReturnStatement(pipesArray)]) : pipesArray;
        const componentType = this.refEmitter.emit(decl, context);
        assertSuccessfulReferenceEmit(componentType, node, "component");
        const declExpr = componentType.expression;
        const setComponentScope = new ExternalExpr5(R3Identifiers.setComponentScope);
        const callExpr = new InvokeFunctionExpr(setComponentScope, [
          declExpr,
          directiveExpr,
          pipesExpr
        ]);
        ngModuleStatements.push(callExpr.toStmt());
      }
    }
  }
  compileNgModule(factoryFn, injectorDef, ngModuleDef) {
    const res = [
      factoryFn,
      {
        name: "\u0275mod",
        initializer: ngModuleDef.expression,
        statements: ngModuleDef.statements,
        type: ngModuleDef.type,
        deferrableImports: null
      },
      {
        name: "\u0275inj",
        initializer: injectorDef.expression,
        statements: injectorDef.statements,
        type: injectorDef.type,
        deferrableImports: null
      }
    ];
    return res;
  }
  _toR3Reference(origin, valueRef, valueContext) {
    if (valueRef.hasOwningModuleGuess) {
      return toR3Reference(origin, valueRef, valueContext, this.refEmitter);
    } else {
      return toR3Reference(origin, valueRef, valueContext, this.refEmitter);
    }
  }
  isClassDeclarationReference(ref) {
    return this.reflector.isClass(ref.node);
  }
  resolveTypeList(expr, resolvedList, className, arrayName, absoluteIndex, allowUnresolvedReferences) {
    let hasModuleWithProviders = false;
    const refList = [];
    const dynamicValueSet = /* @__PURE__ */ new Set();
    if (!Array.isArray(resolvedList)) {
      if (allowUnresolvedReferences) {
        return {
          references: [],
          hasModuleWithProviders: false,
          dynamicValues: []
        };
      }
      throw createValueHasWrongTypeError(expr, resolvedList, `Expected array when reading the NgModule.${arrayName} of ${className}`);
    }
    for (let idx = 0; idx < resolvedList.length; idx++) {
      let entry = resolvedList[idx];
      if (entry instanceof SyntheticValue && isResolvedModuleWithProviders(entry)) {
        entry = entry.value.ngModule;
        hasModuleWithProviders = true;
      } else if (entry instanceof Map && entry.has("ngModule")) {
        entry = entry.get("ngModule");
        hasModuleWithProviders = true;
      }
      if (Array.isArray(entry)) {
        const recursiveResult = this.resolveTypeList(expr, entry, className, arrayName, absoluteIndex, allowUnresolvedReferences);
        refList.push(...recursiveResult.references);
        for (const d of recursiveResult.dynamicValues) {
          dynamicValueSet.add(d);
        }
        absoluteIndex += recursiveResult.references.length;
        hasModuleWithProviders = hasModuleWithProviders || recursiveResult.hasModuleWithProviders;
      } else if (entry instanceof Reference) {
        if (!this.isClassDeclarationReference(entry)) {
          throw createValueHasWrongTypeError(entry.node, entry, `Value at position ${absoluteIndex} in the NgModule.${arrayName} of ${className} is not a class`);
        }
        refList.push(entry);
        absoluteIndex += 1;
      } else if (entry instanceof DynamicValue && allowUnresolvedReferences) {
        dynamicValueSet.add(entry);
        continue;
      } else {
        throw createValueHasWrongTypeError(expr, entry, `Value at position ${absoluteIndex} in the NgModule.${arrayName} of ${className} is not a reference`);
      }
    }
    return {
      references: refList,
      hasModuleWithProviders,
      dynamicValues: [...dynamicValueSet]
    };
  }
};
function isNgModule(node, compilation) {
  return !compilation.dependencies.some((dep) => dep.ref.node === node);
}
function isModuleIdExpression(expr) {
  return ts24.isPropertyAccessExpression(expr) && ts24.isIdentifier(expr.expression) && expr.expression.text === "module" && expr.name.text === "id";
}
function makeStandaloneBootstrapDiagnostic(ngModuleClass, bootstrappedClassRef, rawBootstrapExpr) {
  const componentClassName = bootstrappedClassRef.node.name.text;
  const message = `The \`${componentClassName}\` class is a standalone component, which can not be used in the \`@NgModule.bootstrap\` array. Use the \`bootstrapApplication\` function for bootstrap instead.`;
  const relatedInformation = [
    makeRelatedInformation(ngModuleClass, `The 'bootstrap' array is present on this NgModule.`)
  ];
  return makeDiagnostic(ErrorCode.NGMODULE_BOOTSTRAP_IS_STANDALONE, getDiagnosticNode(bootstrappedClassRef, rawBootstrapExpr), message, relatedInformation);
}
function isSyntheticReference(ref) {
  return ref.synthetic;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/component/src/diagnostics.mjs
function makeCyclicImportInfo(ref, type, cycle) {
  const name = ref.debugName || "(unknown)";
  const path = cycle.getPath().map((sf) => sf.fileName).join(" -> ");
  const message = `The ${type} '${name}' is used in the template but importing it would create a cycle: `;
  return makeRelatedInformation(ref.node, message + path);
}
function checkCustomElementSelectorForErrors(selector) {
  if (selector.includes(".") || selector.includes("[") && selector.includes("]")) {
    return null;
  }
  if (!/^[a-z]/.test(selector)) {
    return "Selector of a ShadowDom-encapsulated component must start with a lower case letter.";
  }
  if (/[A-Z]/.test(selector)) {
    return "Selector of a ShadowDom-encapsulated component must all be in lower case.";
  }
  if (!selector.includes("-")) {
    return "Selector of a component that uses ViewEncapsulation.ShadowDom must contain a hyphen.";
  }
  return null;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.mjs
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig, ParseSourceFile as ParseSourceFile2, parseTemplate } from "@angular/compiler";
import ts25 from "typescript";
function getTemplateDeclarationNodeForError(declaration) {
  return declaration.isInline ? declaration.expression : declaration.templateUrlExpression;
}
function extractTemplate(node, template, evaluator, depTracker, resourceLoader, options, compilationMode) {
  if (template.isInline) {
    let sourceStr;
    let sourceParseRange = null;
    let templateContent;
    let sourceMapping;
    let escapedString = false;
    let sourceMapUrl;
    if (ts25.isStringLiteral(template.expression) || ts25.isNoSubstitutionTemplateLiteral(template.expression)) {
      sourceParseRange = getTemplateRange(template.expression);
      sourceStr = template.expression.getSourceFile().text;
      templateContent = template.expression.text;
      escapedString = true;
      sourceMapping = {
        type: "direct",
        node: template.expression
      };
      sourceMapUrl = template.resolvedTemplateUrl;
    } else {
      const resolvedTemplate = evaluator.evaluate(template.expression);
      assertLocalCompilationUnresolvedConst(compilationMode, resolvedTemplate, template.expression, "Unresolved identifier found for @Component.template field! Did you import this identifier from a file outside of the compilation unit? This is not allowed when Angular compiler runs in local mode. Possible solutions: 1) Move the declaration into a file within the compilation unit, 2) Inline the template, 3) Move the template into a separate .html file and include it using @Component.templateUrl");
      if (typeof resolvedTemplate !== "string") {
        throw createValueHasWrongTypeError(template.expression, resolvedTemplate, "template must be a string");
      }
      sourceStr = resolvedTemplate;
      templateContent = resolvedTemplate;
      sourceMapping = {
        type: "indirect",
        node: template.expression,
        componentClass: node,
        template: templateContent
      };
      sourceMapUrl = null;
    }
    return {
      ...parseExtractedTemplate(template, sourceStr, sourceParseRange, escapedString, sourceMapUrl, options),
      content: templateContent,
      sourceMapping,
      declaration: template
    };
  } else {
    const templateContent = resourceLoader.load(template.resolvedTemplateUrl);
    if (depTracker !== null) {
      depTracker.addResourceDependency(node.getSourceFile(), absoluteFrom(template.resolvedTemplateUrl));
    }
    return {
      ...parseExtractedTemplate(
        template,
        templateContent,
        null,
        false,
        template.resolvedTemplateUrl,
        options
      ),
      content: templateContent,
      sourceMapping: {
        type: "external",
        componentClass: node,
        node: template.templateUrlExpression,
        template: templateContent,
        templateUrl: template.resolvedTemplateUrl
      },
      declaration: template
    };
  }
}
function parseExtractedTemplate(template, sourceStr, sourceParseRange, escapedString, sourceMapUrl, options) {
  const i18nNormalizeLineEndingsInICUs = escapedString || options.i18nNormalizeLineEndingsInICUs;
  const commonParseOptions = {
    interpolationConfig: template.interpolationConfig,
    range: sourceParseRange != null ? sourceParseRange : void 0,
    enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat,
    i18nNormalizeLineEndingsInICUs,
    alwaysAttemptHtmlToR3AstConversion: options.usePoisonedData,
    escapedString,
    enableBlockSyntax: options.enableBlockSyntax,
    enableLetSyntax: options.enableLetSyntax
  };
  const parsedTemplate = parseTemplate(sourceStr, sourceMapUrl != null ? sourceMapUrl : "", {
    ...commonParseOptions,
    preserveWhitespaces: template.preserveWhitespaces,
    preserveSignificantWhitespace: options.preserveSignificantWhitespace
  });
  const { nodes: diagNodes } = parseTemplate(sourceStr, sourceMapUrl != null ? sourceMapUrl : "", {
    ...commonParseOptions,
    preserveWhitespaces: true,
    preserveLineEndings: true,
    preserveSignificantWhitespace: true,
    leadingTriviaChars: []
  });
  return {
    ...parsedTemplate,
    diagNodes,
    file: new ParseSourceFile2(sourceStr, sourceMapUrl != null ? sourceMapUrl : "")
  };
}
function parseTemplateDeclaration(node, decorator, component, containingFile, evaluator, depTracker, resourceLoader, defaultPreserveWhitespaces) {
  let preserveWhitespaces = defaultPreserveWhitespaces;
  if (component.has("preserveWhitespaces")) {
    const expr = component.get("preserveWhitespaces");
    const value = evaluator.evaluate(expr);
    if (typeof value !== "boolean") {
      throw createValueHasWrongTypeError(expr, value, "preserveWhitespaces must be a boolean");
    }
    preserveWhitespaces = value;
  }
  let interpolationConfig = DEFAULT_INTERPOLATION_CONFIG;
  if (component.has("interpolation")) {
    const expr = component.get("interpolation");
    const value = evaluator.evaluate(expr);
    if (!Array.isArray(value) || value.length !== 2 || !value.every((element) => typeof element === "string")) {
      throw createValueHasWrongTypeError(expr, value, "interpolation must be an array with 2 elements of string type");
    }
    interpolationConfig = InterpolationConfig.fromArray(value);
  }
  if (component.has("templateUrl")) {
    const templateUrlExpr = component.get("templateUrl");
    const templateUrl = evaluator.evaluate(templateUrlExpr);
    if (typeof templateUrl !== "string") {
      throw createValueHasWrongTypeError(templateUrlExpr, templateUrl, "templateUrl must be a string");
    }
    try {
      const resourceUrl = resourceLoader.resolve(templateUrl, containingFile);
      return {
        isInline: false,
        interpolationConfig,
        preserveWhitespaces,
        templateUrl,
        templateUrlExpression: templateUrlExpr,
        resolvedTemplateUrl: resourceUrl
      };
    } catch (e) {
      if (depTracker !== null) {
        depTracker.recordDependencyAnalysisFailure(node.getSourceFile());
      }
      throw makeResourceNotFoundError(templateUrl, templateUrlExpr, 0);
    }
  } else if (component.has("template")) {
    return {
      isInline: true,
      interpolationConfig,
      preserveWhitespaces,
      expression: component.get("template"),
      templateUrl: containingFile,
      resolvedTemplateUrl: containingFile
    };
  } else {
    throw new FatalDiagnosticError(ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node, "component is missing a template");
  }
}
function preloadAndParseTemplate(evaluator, resourceLoader, depTracker, preanalyzeTemplateCache, node, decorator, component, containingFile, defaultPreserveWhitespaces, options, compilationMode) {
  if (component.has("templateUrl")) {
    const templateUrlExpr = component.get("templateUrl");
    const templateUrl = evaluator.evaluate(templateUrlExpr);
    if (typeof templateUrl !== "string") {
      throw createValueHasWrongTypeError(templateUrlExpr, templateUrl, "templateUrl must be a string");
    }
    try {
      const resourceUrl = resourceLoader.resolve(templateUrl, containingFile);
      const templatePromise = resourceLoader.preload(resourceUrl, {
        type: "template",
        containingFile,
        className: node.name.text
      });
      if (templatePromise !== void 0) {
        return templatePromise.then(() => {
          const templateDecl = parseTemplateDeclaration(node, decorator, component, containingFile, evaluator, depTracker, resourceLoader, defaultPreserveWhitespaces);
          const template = extractTemplate(node, templateDecl, evaluator, depTracker, resourceLoader, options, compilationMode);
          preanalyzeTemplateCache.set(node, template);
          return template;
        });
      } else {
        return Promise.resolve(null);
      }
    } catch (e) {
      if (depTracker !== null) {
        depTracker.recordDependencyAnalysisFailure(node.getSourceFile());
      }
      throw makeResourceNotFoundError(templateUrl, templateUrlExpr, 0);
    }
  } else {
    const templateDecl = parseTemplateDeclaration(node, decorator, component, containingFile, evaluator, depTracker, resourceLoader, defaultPreserveWhitespaces);
    const template = extractTemplate(node, templateDecl, evaluator, depTracker, resourceLoader, options, compilationMode);
    preanalyzeTemplateCache.set(node, template);
    return Promise.resolve(template);
  }
}
function getTemplateRange(templateExpr) {
  const startPos = templateExpr.getStart() + 1;
  const { line, character } = ts25.getLineAndCharacterOfPosition(templateExpr.getSourceFile(), startPos);
  return {
    startPos,
    startLine: line,
    startCol: character,
    endPos: templateExpr.getEnd() - 1
  };
}
function makeResourceNotFoundError(file, nodeForError, resourceType) {
  let errorText;
  switch (resourceType) {
    case 0:
      errorText = `Could not find template file '${file}'.`;
      break;
    case 1:
      errorText = `Could not find stylesheet file '${file}' linked from the template.`;
      break;
    case 2:
      errorText = `Could not find stylesheet file '${file}'.`;
      break;
  }
  return new FatalDiagnosticError(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND, nodeForError, errorText);
}
function transformDecoratorResources(dec, component, styles, template) {
  if (dec.name !== "Component") {
    return dec;
  }
  if (!component.has("templateUrl") && !component.has("styleUrls") && !component.has("styleUrl") && !component.has("styles")) {
    return dec;
  }
  const metadata = new Map(component);
  if (metadata.has("templateUrl")) {
    metadata.delete("templateUrl");
    metadata.set("template", ts25.factory.createStringLiteral(template.content));
  }
  if (metadata.has("styleUrls") || metadata.has("styleUrl") || metadata.has("styles")) {
    metadata.delete("styles");
    metadata.delete("styleUrls");
    metadata.delete("styleUrl");
    if (styles.length > 0) {
      const styleNodes = styles.reduce((result, style) => {
        if (style.trim().length > 0) {
          result.push(ts25.factory.createStringLiteral(style));
        }
        return result;
      }, []);
      if (styleNodes.length > 0) {
        metadata.set("styles", ts25.factory.createArrayLiteralExpression(styleNodes));
      }
    }
  }
  const newMetadataFields = [];
  for (const [name, value] of metadata.entries()) {
    newMetadataFields.push(ts25.factory.createPropertyAssignment(name, value));
  }
  return { ...dec, args: [ts25.factory.createObjectLiteralExpression(newMetadataFields)] };
}
function extractComponentStyleUrls(evaluator, component) {
  const styleUrlsExpr = component.get("styleUrls");
  const styleUrlExpr = component.get("styleUrl");
  if (styleUrlsExpr !== void 0 && styleUrlExpr !== void 0) {
    throw new FatalDiagnosticError(ErrorCode.COMPONENT_INVALID_STYLE_URLS, styleUrlExpr, "@Component cannot define both `styleUrl` and `styleUrls`. Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple");
  }
  if (styleUrlsExpr !== void 0) {
    return extractStyleUrlsFromExpression(evaluator, component.get("styleUrls"));
  }
  if (styleUrlExpr !== void 0) {
    const styleUrl = evaluator.evaluate(styleUrlExpr);
    if (typeof styleUrl !== "string") {
      throw createValueHasWrongTypeError(styleUrlExpr, styleUrl, "styleUrl must be a string");
    }
    return [
      {
        url: styleUrl,
        source: 2,
        expression: styleUrlExpr
      }
    ];
  }
  return [];
}
function extractStyleUrlsFromExpression(evaluator, styleUrlsExpr) {
  const styleUrls = [];
  if (ts25.isArrayLiteralExpression(styleUrlsExpr)) {
    for (const styleUrlExpr of styleUrlsExpr.elements) {
      if (ts25.isSpreadElement(styleUrlExpr)) {
        styleUrls.push(...extractStyleUrlsFromExpression(evaluator, styleUrlExpr.expression));
      } else {
        const styleUrl = evaluator.evaluate(styleUrlExpr);
        if (typeof styleUrl !== "string") {
          throw createValueHasWrongTypeError(styleUrlExpr, styleUrl, "styleUrl must be a string");
        }
        styleUrls.push({
          url: styleUrl,
          source: 2,
          expression: styleUrlExpr
        });
      }
    }
  } else {
    const evaluatedStyleUrls = evaluator.evaluate(styleUrlsExpr);
    if (!isStringArray(evaluatedStyleUrls)) {
      throw createValueHasWrongTypeError(styleUrlsExpr, evaluatedStyleUrls, "styleUrls must be an array of strings");
    }
    for (const styleUrl of evaluatedStyleUrls) {
      styleUrls.push({
        url: styleUrl,
        source: 2,
        expression: styleUrlsExpr
      });
    }
  }
  return styleUrls;
}
function extractInlineStyleResources(component) {
  const styles = /* @__PURE__ */ new Set();
  function stringLiteralElements(array) {
    return array.elements.filter((e) => ts25.isStringLiteralLike(e));
  }
  const stylesExpr = component.get("styles");
  if (stylesExpr !== void 0) {
    if (ts25.isArrayLiteralExpression(stylesExpr)) {
      for (const expression of stringLiteralElements(stylesExpr)) {
        styles.add({ path: null, expression });
      }
    } else if (ts25.isStringLiteralLike(stylesExpr)) {
      styles.add({ path: null, expression: stylesExpr });
    }
  }
  return styles;
}
function _extractTemplateStyleUrls(template) {
  if (template.styleUrls === null) {
    return [];
  }
  const expression = getTemplateDeclarationNodeForError(template.declaration);
  return template.styleUrls.map((url) => ({
    url,
    source: 1,
    expression
  }));
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/component/src/symbol.mjs
var ComponentSymbol = class extends DirectiveSymbol {
  usedDirectives = [];
  usedPipes = [];
  isRemotelyScoped = false;
  isEmitAffected(previousSymbol, publicApiAffected) {
    if (!(previousSymbol instanceof ComponentSymbol)) {
      return true;
    }
    const isSymbolUnaffected = (current, previous) => isReferenceEqual(current, previous) && !publicApiAffected.has(current.symbol);
    return this.isRemotelyScoped !== previousSymbol.isRemotelyScoped || !isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isSymbolUnaffected) || !isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isSymbolUnaffected);
  }
  isTypeCheckBlockAffected(previousSymbol, typeCheckApiAffected) {
    if (!(previousSymbol instanceof ComponentSymbol)) {
      return true;
    }
    const isInheritanceChainAffected = (symbol) => {
      let currentSymbol = symbol;
      while (currentSymbol instanceof DirectiveSymbol) {
        if (typeCheckApiAffected.has(currentSymbol)) {
          return true;
        }
        currentSymbol = currentSymbol.baseClass;
      }
      return false;
    };
    const isDirectiveUnaffected = (current, previous) => isReferenceEqual(current, previous) && !isInheritanceChainAffected(current.symbol);
    const isPipeUnaffected = (current, previous) => isReferenceEqual(current, previous) && !typeCheckApiAffected.has(current.symbol);
    return !isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isDirectiveUnaffected) || !isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isPipeUnaffected);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/component/src/util.mjs
function collectAnimationNames(value, animationTriggerNames) {
  if (value instanceof Map) {
    const name = value.get("name");
    if (typeof name === "string") {
      animationTriggerNames.staticTriggerNames.push(name);
    } else {
      animationTriggerNames.includesDynamicAnimations = true;
    }
  } else if (Array.isArray(value)) {
    for (const resolvedValue of value) {
      collectAnimationNames(resolvedValue, animationTriggerNames);
    }
  } else {
    animationTriggerNames.includesDynamicAnimations = true;
  }
}
function isAngularAnimationsReference(reference, symbolName) {
  return reference.ownedByModuleGuess === "@angular/animations" && reference.debugName === symbolName;
}
var animationTriggerResolver = (fn, node, resolve, unresolvable) => {
  const animationTriggerMethodName = "trigger";
  if (!isAngularAnimationsReference(fn, animationTriggerMethodName)) {
    return unresolvable;
  }
  const triggerNameExpression = node.arguments[0];
  if (!triggerNameExpression) {
    return unresolvable;
  }
  const res = /* @__PURE__ */ new Map();
  res.set("name", resolve(triggerNameExpression));
  return res;
};
function validateAndFlattenComponentImports(imports, expr, isDeferred) {
  const flattened = [];
  const errorMessage = isDeferred ? `'deferredImports' must be an array of components, directives, or pipes.` : `'imports' must be an array of components, directives, pipes, or NgModules.`;
  if (!Array.isArray(imports)) {
    const error = createValueHasWrongTypeError(expr, imports, errorMessage).toDiagnostic();
    return {
      imports: [],
      diagnostics: [error]
    };
  }
  const diagnostics = [];
  for (const ref of imports) {
    if (Array.isArray(ref)) {
      const { imports: childImports, diagnostics: childDiagnostics } = validateAndFlattenComponentImports(ref, expr, isDeferred);
      flattened.push(...childImports);
      diagnostics.push(...childDiagnostics);
    } else if (ref instanceof Reference) {
      if (isNamedClassDeclaration(ref.node)) {
        flattened.push(ref);
      } else {
        diagnostics.push(createValueHasWrongTypeError(ref.getOriginForDiagnostics(expr), ref, errorMessage).toDiagnostic());
      }
    } else if (isLikelyModuleWithProviders(ref)) {
      let origin = expr;
      if (ref instanceof SyntheticValue) {
        origin = getOriginNodeForDiagnostics(ref.value.mwpCall, expr);
      }
      diagnostics.push(makeDiagnostic(ErrorCode.COMPONENT_UNKNOWN_IMPORT, origin, `Component imports contains a ModuleWithProviders value, likely the result of a 'Module.forRoot()'-style call. These calls are not used to configure components and are not valid in standalone component imports - consider importing them in the application bootstrap instead.`));
    } else {
      diagnostics.push(createValueHasWrongTypeError(expr, imports, errorMessage).toDiagnostic());
    }
  }
  return { imports: flattened, diagnostics };
}
function isLikelyModuleWithProviders(value) {
  if (value instanceof SyntheticValue && isResolvedModuleWithProviders(value)) {
    return true;
  }
  if (value instanceof Map && value.has("ngModule")) {
    return true;
  }
  return false;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/checker.mjs
import { CssSelector as CssSelector3, DomElementSchemaRegistry as DomElementSchemaRegistry2, ExternalExpr as ExternalExpr7, WrappedNodeExpr as WrappedNodeExpr9 } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/program_driver/src/api.mjs
var NgOriginalFile = Symbol("NgOriginalFile");
var UpdateMode;
(function(UpdateMode2) {
  UpdateMode2[UpdateMode2["Complete"] = 0] = "Complete";
  UpdateMode2[UpdateMode2["Incremental"] = 1] = "Incremental";
})(UpdateMode || (UpdateMode = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/program_driver/src/ts_create_program_driver.mjs
import ts27 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/shims/src/adapter.mjs
import ts26 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/shims/src/expando.mjs
var NgExtension = Symbol("NgExtension");
function isExtended(sf) {
  return sf[NgExtension] !== void 0;
}
function sfExtensionData(sf) {
  const extSf = sf;
  if (extSf[NgExtension] !== void 0) {
    return extSf[NgExtension];
  }
  const extension = {
    isTopLevelShim: false,
    fileShim: null,
    originalReferencedFiles: null,
    taggedReferenceFiles: null
  };
  extSf[NgExtension] = extension;
  return extension;
}
function isFileShimSourceFile(sf) {
  return isExtended(sf) && sf[NgExtension].fileShim !== null;
}
function isShim(sf) {
  return isExtended(sf) && (sf[NgExtension].fileShim !== null || sf[NgExtension].isTopLevelShim);
}
function copyFileShimData(from, to) {
  if (!isFileShimSourceFile(from)) {
    return;
  }
  sfExtensionData(to).fileShim = sfExtensionData(from).fileShim;
}
function untagAllTsFiles(program) {
  for (const sf of program.getSourceFiles()) {
    untagTsFile(sf);
  }
}
function retagAllTsFiles(program) {
  for (const sf of program.getSourceFiles()) {
    retagTsFile(sf);
  }
}
function untagTsFile(sf) {
  if (sf.isDeclarationFile || !isExtended(sf)) {
    return;
  }
  const ext = sfExtensionData(sf);
  if (ext.originalReferencedFiles !== null) {
    sf.referencedFiles = ext.originalReferencedFiles;
  }
}
function retagTsFile(sf) {
  if (sf.isDeclarationFile || !isExtended(sf)) {
    return;
  }
  const ext = sfExtensionData(sf);
  if (ext.taggedReferenceFiles !== null) {
    sf.referencedFiles = ext.taggedReferenceFiles;
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/shims/src/util.mjs
var TS_EXTENSIONS = /\.tsx?$/i;
function makeShimFileName(fileName, suffix) {
  return absoluteFrom(fileName.replace(TS_EXTENSIONS, suffix));
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/shims/src/adapter.mjs
var ShimAdapter = class {
  delegate;
  shims = /* @__PURE__ */ new Map();
  priorShims = /* @__PURE__ */ new Map();
  notShims = /* @__PURE__ */ new Set();
  generators = [];
  ignoreForEmit = /* @__PURE__ */ new Set();
  extraInputFiles;
  extensionPrefixes = [];
  constructor(delegate, tsRootFiles, topLevelGenerators, perFileGenerators, oldProgram) {
    this.delegate = delegate;
    for (const gen of perFileGenerators) {
      const pattern = `^(.*)\\.${gen.extensionPrefix}\\.ts$`;
      const regexp = new RegExp(pattern, "i");
      this.generators.push({
        generator: gen,
        test: regexp,
        suffix: `.${gen.extensionPrefix}.ts`
      });
      this.extensionPrefixes.push(gen.extensionPrefix);
    }
    const extraInputFiles = [];
    for (const gen of topLevelGenerators) {
      const sf = gen.makeTopLevelShim();
      sfExtensionData(sf).isTopLevelShim = true;
      if (!gen.shouldEmit) {
        this.ignoreForEmit.add(sf);
      }
      const fileName = absoluteFromSourceFile(sf);
      this.shims.set(fileName, sf);
      extraInputFiles.push(fileName);
    }
    for (const rootFile of tsRootFiles) {
      for (const gen of this.generators) {
        extraInputFiles.push(makeShimFileName(rootFile, gen.suffix));
      }
    }
    this.extraInputFiles = extraInputFiles;
    if (oldProgram !== null) {
      for (const oldSf of oldProgram.getSourceFiles()) {
        if (oldSf.isDeclarationFile || !isFileShimSourceFile(oldSf)) {
          continue;
        }
        this.priorShims.set(absoluteFromSourceFile(oldSf), oldSf);
      }
    }
  }
  maybeGenerate(fileName) {
    if (this.notShims.has(fileName)) {
      return null;
    } else if (this.shims.has(fileName)) {
      return this.shims.get(fileName);
    }
    if (isDtsPath(fileName)) {
      this.notShims.add(fileName);
      return null;
    }
    for (const record of this.generators) {
      const match = record.test.exec(fileName);
      if (match === null) {
        continue;
      }
      const prefix = match[1];
      let baseFileName = absoluteFrom(prefix + ".ts");
      let inputFile = this.delegate.getSourceFile(baseFileName, ts26.ScriptTarget.Latest);
      if (inputFile === void 0) {
        baseFileName = absoluteFrom(prefix + ".tsx");
        inputFile = this.delegate.getSourceFile(baseFileName, ts26.ScriptTarget.Latest);
      }
      if (inputFile === void 0 || isShim(inputFile)) {
        return void 0;
      }
      return this.generateSpecific(fileName, record.generator, inputFile);
    }
    this.notShims.add(fileName);
    return null;
  }
  generateSpecific(fileName, generator, inputFile) {
    let priorShimSf = null;
    if (this.priorShims.has(fileName)) {
      priorShimSf = this.priorShims.get(fileName);
      this.priorShims.delete(fileName);
    }
    const shimSf = generator.generateShimForFile(inputFile, fileName, priorShimSf);
    sfExtensionData(shimSf).fileShim = {
      extension: generator.extensionPrefix,
      generatedFrom: absoluteFromSourceFile(inputFile)
    };
    if (!generator.shouldEmit) {
      this.ignoreForEmit.add(shimSf);
    }
    this.shims.set(fileName, shimSf);
    return shimSf;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/shims/src/reference_tagger.mjs
var ShimReferenceTagger = class {
  suffixes;
  tagged = /* @__PURE__ */ new Set();
  enabled = true;
  constructor(shimExtensions) {
    this.suffixes = shimExtensions.map((extension) => `.${extension}.ts`);
  }
  tag(sf) {
    if (!this.enabled || sf.isDeclarationFile || isShim(sf) || this.tagged.has(sf) || !isNonDeclarationTsPath(sf.fileName)) {
      return;
    }
    const ext = sfExtensionData(sf);
    if (ext.originalReferencedFiles === null) {
      ext.originalReferencedFiles = sf.referencedFiles;
    }
    const referencedFiles = [...ext.originalReferencedFiles];
    const sfPath = absoluteFromSourceFile(sf);
    for (const suffix of this.suffixes) {
      referencedFiles.push({
        fileName: makeShimFileName(sfPath, suffix),
        pos: 0,
        end: 0
      });
    }
    ext.taggedReferenceFiles = referencedFiles;
    sf.referencedFiles = referencedFiles;
    this.tagged.add(sf);
  }
  finalize() {
    this.enabled = false;
    this.tagged.clear();
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/program_driver/src/ts_create_program_driver.mjs
var DelegatingCompilerHost = class {
  delegate;
  createHash;
  directoryExists;
  getCancellationToken;
  getCanonicalFileName;
  getCurrentDirectory;
  getDefaultLibFileName;
  getDefaultLibLocation;
  getDirectories;
  getEnvironmentVariable;
  getNewLine;
  getParsedCommandLine;
  getSourceFileByPath;
  readDirectory;
  readFile;
  realpath;
  resolveModuleNames;
  resolveTypeReferenceDirectives;
  trace;
  useCaseSensitiveFileNames;
  getModuleResolutionCache;
  hasInvalidatedResolutions;
  resolveModuleNameLiterals;
  resolveTypeReferenceDirectiveReferences;
  get jsDocParsingMode() {
    return this.delegate.jsDocParsingMode;
  }
  set jsDocParsingMode(mode) {
    this.delegate.jsDocParsingMode = mode;
  }
  constructor(delegate) {
    this.delegate = delegate;
    this.createHash = this.delegateMethod("createHash");
    this.directoryExists = this.delegateMethod("directoryExists");
    this.getCancellationToken = this.delegateMethod("getCancellationToken");
    this.getCanonicalFileName = this.delegateMethod("getCanonicalFileName");
    this.getCurrentDirectory = this.delegateMethod("getCurrentDirectory");
    this.getDefaultLibFileName = this.delegateMethod("getDefaultLibFileName");
    this.getDefaultLibLocation = this.delegateMethod("getDefaultLibLocation");
    this.getDirectories = this.delegateMethod("getDirectories");
    this.getEnvironmentVariable = this.delegateMethod("getEnvironmentVariable");
    this.getNewLine = this.delegateMethod("getNewLine");
    this.getParsedCommandLine = this.delegateMethod("getParsedCommandLine");
    this.getSourceFileByPath = this.delegateMethod("getSourceFileByPath");
    this.readDirectory = this.delegateMethod("readDirectory");
    this.readFile = this.delegateMethod("readFile");
    this.realpath = this.delegateMethod("realpath");
    this.resolveModuleNames = this.delegateMethod("resolveModuleNames");
    this.resolveTypeReferenceDirectives = this.delegateMethod("resolveTypeReferenceDirectives");
    this.trace = this.delegateMethod("trace");
    this.useCaseSensitiveFileNames = this.delegateMethod("useCaseSensitiveFileNames");
    this.getModuleResolutionCache = this.delegateMethod("getModuleResolutionCache");
    this.hasInvalidatedResolutions = this.delegateMethod("hasInvalidatedResolutions");
    this.resolveModuleNameLiterals = this.delegateMethod("resolveModuleNameLiterals");
    this.resolveTypeReferenceDirectiveReferences = this.delegateMethod("resolveTypeReferenceDirectiveReferences");
  }
  delegateMethod(name) {
    return this.delegate[name] !== void 0 ? this.delegate[name].bind(this.delegate) : void 0;
  }
};
var UpdatedProgramHost = class extends DelegatingCompilerHost {
  originalProgram;
  shimExtensionPrefixes;
  sfMap;
  shimTagger;
  constructor(sfMap, originalProgram, delegate, shimExtensionPrefixes) {
    super(delegate);
    this.originalProgram = originalProgram;
    this.shimExtensionPrefixes = shimExtensionPrefixes;
    this.shimTagger = new ShimReferenceTagger(this.shimExtensionPrefixes);
    this.sfMap = sfMap;
  }
  getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) {
    let delegateSf = this.originalProgram.getSourceFile(fileName);
    if (delegateSf === void 0) {
      delegateSf = this.delegate.getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
    }
    if (delegateSf === void 0) {
      return void 0;
    }
    let sf;
    if (this.sfMap.has(fileName)) {
      sf = this.sfMap.get(fileName);
      copyFileShimData(delegateSf, sf);
    } else {
      sf = delegateSf;
    }
    sf = toUnredirectedSourceFile(sf);
    this.shimTagger.tag(sf);
    return sf;
  }
  postProgramCreationCleanup() {
    this.shimTagger.finalize();
  }
  writeFile() {
    throw new Error(`TypeCheckProgramHost should never write files`);
  }
  fileExists(fileName) {
    return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
  }
};
var TsCreateProgramDriver = class {
  originalProgram;
  originalHost;
  options;
  shimExtensionPrefixes;
  sfMap = /* @__PURE__ */ new Map();
  program;
  constructor(originalProgram, originalHost, options, shimExtensionPrefixes) {
    this.originalProgram = originalProgram;
    this.originalHost = originalHost;
    this.options = options;
    this.shimExtensionPrefixes = shimExtensionPrefixes;
    this.program = this.originalProgram;
  }
  supportsInlineOperations = true;
  getProgram() {
    return this.program;
  }
  updateFiles(contents, updateMode) {
    if (contents.size === 0) {
      if (updateMode !== UpdateMode.Complete || this.sfMap.size === 0) {
        return;
      }
    }
    if (updateMode === UpdateMode.Complete) {
      this.sfMap.clear();
    }
    for (const [filePath, { newText, originalFile }] of contents.entries()) {
      const sf = ts27.createSourceFile(filePath, newText, ts27.ScriptTarget.Latest, true);
      if (originalFile !== null) {
        sf[NgOriginalFile] = originalFile;
      }
      this.sfMap.set(filePath, sf);
    }
    const host = new UpdatedProgramHost(this.sfMap, this.originalProgram, this.originalHost, this.shimExtensionPrefixes);
    const oldProgram = this.program;
    retagAllTsFiles(oldProgram);
    this.program = ts27.createProgram({
      host,
      rootNames: this.program.getRootFileNames(),
      options: this.options,
      oldProgram
    });
    host.postProgramCreationCleanup();
    untagAllTsFiles(oldProgram);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/diagnostics/src/diagnostic.mjs
import ts28 from "typescript";
function makeTemplateDiagnostic(templateId, mapping, span, category, code, messageText, relatedMessages) {
  var _a;
  if (mapping.type === "direct") {
    let relatedInformation = void 0;
    if (relatedMessages !== void 0) {
      relatedInformation = [];
      for (const relatedMessage of relatedMessages) {
        relatedInformation.push({
          category: ts28.DiagnosticCategory.Message,
          code: 0,
          file: relatedMessage.sourceFile,
          start: relatedMessage.start,
          length: relatedMessage.end - relatedMessage.start,
          messageText: relatedMessage.text
        });
      }
    }
    return {
      source: "ngtsc",
      code,
      category,
      messageText,
      file: mapping.node.getSourceFile(),
      componentFile: mapping.node.getSourceFile(),
      templateId,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      relatedInformation
    };
  } else if (mapping.type === "indirect" || mapping.type === "external") {
    const componentSf = mapping.componentClass.getSourceFile();
    const componentName = mapping.componentClass.name.text;
    const fileName = mapping.type === "indirect" ? `${componentSf.fileName} (${componentName} template)` : mapping.templateUrl;
    let relatedInformation = [];
    if (relatedMessages !== void 0) {
      for (const relatedMessage of relatedMessages) {
        relatedInformation.push({
          category: ts28.DiagnosticCategory.Message,
          code: 0,
          file: relatedMessage.sourceFile,
          start: relatedMessage.start,
          length: relatedMessage.end - relatedMessage.start,
          messageText: relatedMessage.text
        });
      }
    }
    let sf;
    try {
      sf = getParsedTemplateSourceFile(fileName, mapping);
    } catch (e) {
      const failureChain = makeDiagnosticChain(`Failed to report an error in '${fileName}' at ${span.start.line + 1}:${span.start.col + 1}`, [makeDiagnosticChain((_a = e == null ? void 0 : e.stack) != null ? _a : `${e}`)]);
      return {
        source: "ngtsc",
        category,
        code,
        messageText: addDiagnosticChain(messageText, [failureChain]),
        file: componentSf,
        componentFile: componentSf,
        templateId,
        start: mapping.node.getStart(),
        length: mapping.node.getEnd() - mapping.node.getStart(),
        relatedInformation
      };
    }
    relatedInformation.push({
      category: ts28.DiagnosticCategory.Message,
      code: 0,
      file: componentSf,
      start: mapping.node.getStart(),
      length: mapping.node.getEnd() - mapping.node.getStart(),
      messageText: `Error occurs in the template of component ${componentName}.`
    });
    return {
      source: "ngtsc",
      category,
      code,
      messageText,
      file: sf,
      componentFile: componentSf,
      templateId,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      relatedInformation
    };
  } else {
    throw new Error(`Unexpected source mapping type: ${mapping.type}`);
  }
}
var TemplateSourceFile = Symbol("TemplateSourceFile");
function getParsedTemplateSourceFile(fileName, mapping) {
  if (mapping[TemplateSourceFile] === void 0) {
    mapping[TemplateSourceFile] = parseTemplateAsSourceFile(fileName, mapping.template);
  }
  return mapping[TemplateSourceFile];
}
var parseTemplateAsSourceFileForTest = null;
function parseTemplateAsSourceFile(fileName, template) {
  if (parseTemplateAsSourceFileForTest !== null) {
    return parseTemplateAsSourceFileForTest(fileName, template);
  }
  return ts28.createSourceFile(
    fileName,
    template,
    ts28.ScriptTarget.Latest,
    false,
    ts28.ScriptKind.JSX
  );
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/diagnostics/src/id.mjs
var TEMPLATE_ID = Symbol("ngTemplateId");
var NEXT_TEMPLATE_ID = Symbol("ngNextTemplateId");
function getTemplateId(clazz) {
  const node = clazz;
  if (node[TEMPLATE_ID] === void 0) {
    node[TEMPLATE_ID] = allocateTemplateId(node.getSourceFile());
  }
  return node[TEMPLATE_ID];
}
function allocateTemplateId(sf) {
  if (sf[NEXT_TEMPLATE_ID] === void 0) {
    sf[NEXT_TEMPLATE_ID] = 1;
  }
  return `tcb${sf[NEXT_TEMPLATE_ID]++}`;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/completion.mjs
import { EmptyExpr, ImplicitReceiver, PropertyRead, PropertyWrite, SafePropertyRead, TmplAstLetDeclaration, TmplAstReference, TmplAstTextAttribute } from "@angular/compiler";
import ts30 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/comments.mjs
import { AbsoluteSourceSpan } from "@angular/compiler";
import ts29 from "typescript";
var parseSpanComment = /^(\d+),(\d+)$/;
function readSpanComment(node, sourceFile = node.getSourceFile()) {
  return ts29.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
    if (kind !== ts29.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    const match = commentText.match(parseSpanComment);
    if (match === null) {
      return null;
    }
    return new AbsoluteSourceSpan(+match[1], +match[2]);
  }) || null;
}
var CommentTriviaType;
(function(CommentTriviaType2) {
  CommentTriviaType2["DIAGNOSTIC"] = "D";
  CommentTriviaType2["EXPRESSION_TYPE_IDENTIFIER"] = "T";
})(CommentTriviaType || (CommentTriviaType = {}));
var ExpressionIdentifier;
(function(ExpressionIdentifier2) {
  ExpressionIdentifier2["DIRECTIVE"] = "DIR";
  ExpressionIdentifier2["COMPONENT_COMPLETION"] = "COMPCOMP";
  ExpressionIdentifier2["EVENT_PARAMETER"] = "EP";
  ExpressionIdentifier2["VARIABLE_AS_EXPRESSION"] = "VAE";
})(ExpressionIdentifier || (ExpressionIdentifier = {}));
function addExpressionIdentifier(node, identifier) {
  ts29.addSyntheticTrailingComment(
    node,
    ts29.SyntaxKind.MultiLineCommentTrivia,
    `${CommentTriviaType.EXPRESSION_TYPE_IDENTIFIER}:${identifier}`,
    false
  );
}
var IGNORE_FOR_DIAGNOSTICS_MARKER = `${CommentTriviaType.DIAGNOSTIC}:ignore`;
function markIgnoreDiagnostics(node) {
  ts29.addSyntheticTrailingComment(
    node,
    ts29.SyntaxKind.MultiLineCommentTrivia,
    IGNORE_FOR_DIAGNOSTICS_MARKER,
    false
  );
}
function hasIgnoreForDiagnosticsMarker(node, sourceFile) {
  return ts29.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
    if (kind !== ts29.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText === IGNORE_FOR_DIAGNOSTICS_MARKER;
  }) === true;
}
function makeRecursiveVisitor(visitor) {
  function recursiveVisitor(node) {
    const res = visitor(node);
    return res !== null ? res : node.forEachChild(recursiveVisitor);
  }
  return recursiveVisitor;
}
function getSpanFromOptions(opts) {
  let withSpan = null;
  if (opts.withSpan !== void 0) {
    if (opts.withSpan instanceof AbsoluteSourceSpan) {
      withSpan = opts.withSpan;
    } else {
      withSpan = { start: opts.withSpan.start.offset, end: opts.withSpan.end.offset };
    }
  }
  return withSpan;
}
function findFirstMatchingNode(tcb, opts) {
  var _a;
  const withSpan = getSpanFromOptions(opts);
  const withExpressionIdentifier = opts.withExpressionIdentifier;
  const sf = tcb.getSourceFile();
  const visitor = makeRecursiveVisitor((node) => {
    if (!opts.filter(node)) {
      return null;
    }
    if (withSpan !== null) {
      const comment = readSpanComment(node, sf);
      if (comment === null || withSpan.start !== comment.start || withSpan.end !== comment.end) {
        return null;
      }
    }
    if (withExpressionIdentifier !== void 0 && !hasExpressionIdentifier(sf, node, withExpressionIdentifier)) {
      return null;
    }
    return node;
  });
  return (_a = tcb.forEachChild(visitor)) != null ? _a : null;
}
function findAllMatchingNodes(tcb, opts) {
  const withSpan = getSpanFromOptions(opts);
  const withExpressionIdentifier = opts.withExpressionIdentifier;
  const results = [];
  const stack = [tcb];
  const sf = tcb.getSourceFile();
  while (stack.length > 0) {
    const node = stack.pop();
    if (!opts.filter(node)) {
      stack.push(...node.getChildren());
      continue;
    }
    if (withSpan !== null) {
      const comment = readSpanComment(node, sf);
      if (comment === null || withSpan.start !== comment.start || withSpan.end !== comment.end) {
        stack.push(...node.getChildren());
        continue;
      }
    }
    if (withExpressionIdentifier !== void 0 && !hasExpressionIdentifier(sf, node, withExpressionIdentifier)) {
      continue;
    }
    results.push(node);
  }
  return results;
}
function hasExpressionIdentifier(sourceFile, node, identifier) {
  return ts29.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
    if (kind !== ts29.SyntaxKind.MultiLineCommentTrivia) {
      return false;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText === `${CommentTriviaType.EXPRESSION_TYPE_IDENTIFIER}:${identifier}`;
  }) || false;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/completion.mjs
var CompletionEngine = class {
  tcb;
  data;
  tcbPath;
  tcbIsShim;
  componentContext;
  templateContextCache = /* @__PURE__ */ new Map();
  expressionCompletionCache = /* @__PURE__ */ new Map();
  constructor(tcb, data, tcbPath, tcbIsShim) {
    this.tcb = tcb;
    this.data = data;
    this.tcbPath = tcbPath;
    this.tcbIsShim = tcbIsShim;
    const globalRead = findFirstMatchingNode(this.tcb, {
      filter: ts30.isPropertyAccessExpression,
      withExpressionIdentifier: ExpressionIdentifier.COMPONENT_COMPLETION
    });
    if (globalRead !== null) {
      this.componentContext = {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile: globalRead.name.getStart()
      };
    } else {
      this.componentContext = null;
    }
  }
  getGlobalCompletions(context, node) {
    if (this.componentContext === null) {
      return null;
    }
    const templateContext = this.getTemplateContextCompletions(context);
    if (templateContext === null) {
      return null;
    }
    let nodeContext = null;
    if (node instanceof EmptyExpr) {
      const nodeLocation = findFirstMatchingNode(this.tcb, {
        filter: ts30.isIdentifier,
        withSpan: node.sourceSpan
      });
      if (nodeLocation !== null) {
        nodeContext = {
          tcbPath: this.tcbPath,
          isShimFile: this.tcbIsShim,
          positionInFile: nodeLocation.getStart()
        };
      }
    }
    if (node instanceof PropertyRead && node.receiver instanceof ImplicitReceiver) {
      const nodeLocation = findFirstMatchingNode(this.tcb, {
        filter: ts30.isPropertyAccessExpression,
        withSpan: node.sourceSpan
      });
      if (nodeLocation) {
        nodeContext = {
          tcbPath: this.tcbPath,
          isShimFile: this.tcbIsShim,
          positionInFile: nodeLocation.getStart()
        };
      }
    }
    return {
      componentContext: this.componentContext,
      templateContext,
      nodeContext
    };
  }
  getExpressionCompletionLocation(expr) {
    if (this.expressionCompletionCache.has(expr)) {
      return this.expressionCompletionCache.get(expr);
    }
    let tsExpr = null;
    if (expr instanceof PropertyRead || expr instanceof PropertyWrite) {
      tsExpr = findFirstMatchingNode(this.tcb, {
        filter: ts30.isPropertyAccessExpression,
        withSpan: expr.nameSpan
      });
    } else if (expr instanceof SafePropertyRead) {
      const ternaryExpr = findFirstMatchingNode(this.tcb, {
        filter: ts30.isParenthesizedExpression,
        withSpan: expr.sourceSpan
      });
      if (ternaryExpr === null || !ts30.isConditionalExpression(ternaryExpr.expression)) {
        return null;
      }
      const whenTrue = ternaryExpr.expression.whenTrue;
      if (ts30.isPropertyAccessExpression(whenTrue)) {
        tsExpr = whenTrue;
      } else if (ts30.isCallExpression(whenTrue) && ts30.isPropertyAccessExpression(whenTrue.expression)) {
        tsExpr = whenTrue.expression;
      }
    }
    if (tsExpr === null) {
      return null;
    }
    const res = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: tsExpr.name.getEnd()
    };
    this.expressionCompletionCache.set(expr, res);
    return res;
  }
  getLiteralCompletionLocation(expr) {
    if (this.expressionCompletionCache.has(expr)) {
      return this.expressionCompletionCache.get(expr);
    }
    let tsExpr = null;
    if (expr instanceof TmplAstTextAttribute) {
      const strNode = findFirstMatchingNode(this.tcb, {
        filter: ts30.isParenthesizedExpression,
        withSpan: expr.sourceSpan
      });
      if (strNode !== null && ts30.isStringLiteral(strNode.expression)) {
        tsExpr = strNode.expression;
      }
    } else {
      tsExpr = findFirstMatchingNode(this.tcb, {
        filter: (n2) => ts30.isStringLiteral(n2) || ts30.isNumericLiteral(n2),
        withSpan: expr.sourceSpan
      });
    }
    if (tsExpr === null) {
      return null;
    }
    let positionInShimFile = tsExpr.getEnd();
    if (ts30.isStringLiteral(tsExpr)) {
      positionInShimFile -= 1;
    }
    const res = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: positionInShimFile
    };
    this.expressionCompletionCache.set(expr, res);
    return res;
  }
  getTemplateContextCompletions(context) {
    if (this.templateContextCache.has(context)) {
      return this.templateContextCache.get(context);
    }
    const templateContext = /* @__PURE__ */ new Map();
    for (const node of this.data.boundTarget.getEntitiesInScope(context)) {
      if (node instanceof TmplAstReference) {
        templateContext.set(node.name, {
          kind: CompletionKind.Reference,
          node
        });
      } else if (node instanceof TmplAstLetDeclaration) {
        templateContext.set(node.name, {
          kind: CompletionKind.LetDeclaration,
          node
        });
      } else {
        templateContext.set(node.name, {
          kind: CompletionKind.Variable,
          node
        });
      }
    }
    this.templateContextCache.set(context, templateContext);
    return templateContext;
  }
};

// node_modules/magic-string/dist/magic-string.es.mjs
import { encode } from "@jridgewell/sourcemap-codec";
var BitSet = class {
  constructor(arg) {
    this.bits = arg instanceof BitSet ? arg.bits.slice() : [];
  }
  add(n2) {
    this.bits[n2 >> 5] |= 1 << (n2 & 31);
  }
  has(n2) {
    return !!(this.bits[n2 >> 5] & 1 << (n2 & 31));
  }
};
var Chunk = class {
  constructor(start, end, content) {
    this.start = start;
    this.end = end;
    this.original = content;
    this.intro = "";
    this.outro = "";
    this.content = content;
    this.storeName = false;
    this.edited = false;
    {
      this.previous = null;
      this.next = null;
    }
  }
  appendLeft(content) {
    this.outro += content;
  }
  appendRight(content) {
    this.intro = this.intro + content;
  }
  clone() {
    const chunk = new Chunk(this.start, this.end, this.original);
    chunk.intro = this.intro;
    chunk.outro = this.outro;
    chunk.content = this.content;
    chunk.storeName = this.storeName;
    chunk.edited = this.edited;
    return chunk;
  }
  contains(index) {
    return this.start < index && index < this.end;
  }
  eachNext(fn) {
    let chunk = this;
    while (chunk) {
      fn(chunk);
      chunk = chunk.next;
    }
  }
  eachPrevious(fn) {
    let chunk = this;
    while (chunk) {
      fn(chunk);
      chunk = chunk.previous;
    }
  }
  edit(content, storeName, contentOnly) {
    this.content = content;
    if (!contentOnly) {
      this.intro = "";
      this.outro = "";
    }
    this.storeName = storeName;
    this.edited = true;
    return this;
  }
  prependLeft(content) {
    this.outro = content + this.outro;
  }
  prependRight(content) {
    this.intro = content + this.intro;
  }
  reset() {
    this.intro = "";
    this.outro = "";
    if (this.edited) {
      this.content = this.original;
      this.storeName = false;
      this.edited = false;
    }
  }
  split(index) {
    const sliceIndex = index - this.start;
    const originalBefore = this.original.slice(0, sliceIndex);
    const originalAfter = this.original.slice(sliceIndex);
    this.original = originalBefore;
    const newChunk = new Chunk(index, this.end, originalAfter);
    newChunk.outro = this.outro;
    this.outro = "";
    this.end = index;
    if (this.edited) {
      newChunk.edit("", false);
      this.content = "";
    } else {
      this.content = originalBefore;
    }
    newChunk.next = this.next;
    if (newChunk.next)
      newChunk.next.previous = newChunk;
    newChunk.previous = this;
    this.next = newChunk;
    return newChunk;
  }
  toString() {
    return this.intro + this.content + this.outro;
  }
  trimEnd(rx) {
    this.outro = this.outro.replace(rx, "");
    if (this.outro.length)
      return true;
    const trimmed = this.content.replace(rx, "");
    if (trimmed.length) {
      if (trimmed !== this.content) {
        this.split(this.start + trimmed.length).edit("", void 0, true);
        if (this.edited) {
          this.edit(trimmed, this.storeName, true);
        }
      }
      return true;
    } else {
      this.edit("", void 0, true);
      this.intro = this.intro.replace(rx, "");
      if (this.intro.length)
        return true;
    }
  }
  trimStart(rx) {
    this.intro = this.intro.replace(rx, "");
    if (this.intro.length)
      return true;
    const trimmed = this.content.replace(rx, "");
    if (trimmed.length) {
      if (trimmed !== this.content) {
        const newChunk = this.split(this.end - trimmed.length);
        if (this.edited) {
          newChunk.edit(trimmed, this.storeName, true);
        }
        this.edit("", void 0, true);
      }
      return true;
    } else {
      this.edit("", void 0, true);
      this.outro = this.outro.replace(rx, "");
      if (this.outro.length)
        return true;
    }
  }
};
function getBtoa() {
  if (typeof globalThis !== "undefined" && typeof globalThis.btoa === "function") {
    return (str) => globalThis.btoa(unescape(encodeURIComponent(str)));
  } else if (typeof Buffer === "function") {
    return (str) => Buffer.from(str, "utf-8").toString("base64");
  } else {
    return () => {
      throw new Error("Unsupported environment: `window.btoa` or `Buffer` should be supported.");
    };
  }
}
var btoa = /* @__PURE__ */ getBtoa();
var SourceMap = class {
  constructor(properties) {
    this.version = 3;
    this.file = properties.file;
    this.sources = properties.sources;
    this.sourcesContent = properties.sourcesContent;
    this.names = properties.names;
    this.mappings = encode(properties.mappings);
    if (typeof properties.x_google_ignoreList !== "undefined") {
      this.x_google_ignoreList = properties.x_google_ignoreList;
    }
    if (typeof properties.debugId !== "undefined") {
      this.debugId = properties.debugId;
    }
  }
  toString() {
    return JSON.stringify(this);
  }
  toUrl() {
    return "data:application/json;charset=utf-8;base64," + btoa(this.toString());
  }
};
function guessIndent(code) {
  const lines = code.split("\n");
  const tabbed = lines.filter((line) => /^\t+/.test(line));
  const spaced = lines.filter((line) => /^ {2,}/.test(line));
  if (tabbed.length === 0 && spaced.length === 0) {
    return null;
  }
  if (tabbed.length >= spaced.length) {
    return "	";
  }
  const min = spaced.reduce((previous, current) => {
    const numSpaces = /^ +/.exec(current)[0].length;
    return Math.min(numSpaces, previous);
  }, Infinity);
  return new Array(min + 1).join(" ");
}
function getRelativePath(from, to) {
  const fromParts = from.split(/[/\\]/);
  const toParts = to.split(/[/\\]/);
  fromParts.pop();
  while (fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }
  if (fromParts.length) {
    let i = fromParts.length;
    while (i--)
      fromParts[i] = "..";
  }
  return fromParts.concat(toParts).join("/");
}
var toString = Object.prototype.toString;
function isObject(thing) {
  return toString.call(thing) === "[object Object]";
}
function getLocator(source) {
  const originalLines = source.split("\n");
  const lineOffsets = [];
  for (let i = 0, pos = 0; i < originalLines.length; i++) {
    lineOffsets.push(pos);
    pos += originalLines[i].length + 1;
  }
  return function locate(index) {
    let i = 0;
    let j = lineOffsets.length;
    while (i < j) {
      const m = i + j >> 1;
      if (index < lineOffsets[m]) {
        j = m;
      } else {
        i = m + 1;
      }
    }
    const line = i - 1;
    const column = index - lineOffsets[line];
    return { line, column };
  };
}
var wordRegex = /\w/;
var Mappings = class {
  constructor(hires) {
    this.hires = hires;
    this.generatedCodeLine = 0;
    this.generatedCodeColumn = 0;
    this.raw = [];
    this.rawSegments = this.raw[this.generatedCodeLine] = [];
    this.pending = null;
  }
  addEdit(sourceIndex, content, loc, nameIndex) {
    if (content.length) {
      const contentLengthMinusOne = content.length - 1;
      let contentLineEnd = content.indexOf("\n", 0);
      let previousContentLineEnd = -1;
      while (contentLineEnd >= 0 && contentLengthMinusOne > contentLineEnd) {
        const segment2 = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
        if (nameIndex >= 0) {
          segment2.push(nameIndex);
        }
        this.rawSegments.push(segment2);
        this.generatedCodeLine += 1;
        this.raw[this.generatedCodeLine] = this.rawSegments = [];
        this.generatedCodeColumn = 0;
        previousContentLineEnd = contentLineEnd;
        contentLineEnd = content.indexOf("\n", contentLineEnd + 1);
      }
      const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
      if (nameIndex >= 0) {
        segment.push(nameIndex);
      }
      this.rawSegments.push(segment);
      this.advance(content.slice(previousContentLineEnd + 1));
    } else if (this.pending) {
      this.rawSegments.push(this.pending);
      this.advance(content);
    }
    this.pending = null;
  }
  addUneditedChunk(sourceIndex, chunk, original, loc, sourcemapLocations) {
    let originalCharIndex = chunk.start;
    let first = true;
    let charInHiresBoundary = false;
    while (originalCharIndex < chunk.end) {
      if (original[originalCharIndex] === "\n") {
        loc.line += 1;
        loc.column = 0;
        this.generatedCodeLine += 1;
        this.raw[this.generatedCodeLine] = this.rawSegments = [];
        this.generatedCodeColumn = 0;
        first = true;
        charInHiresBoundary = false;
      } else {
        if (this.hires || first || sourcemapLocations.has(originalCharIndex)) {
          const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
          if (this.hires === "boundary") {
            if (wordRegex.test(original[originalCharIndex])) {
              if (!charInHiresBoundary) {
                this.rawSegments.push(segment);
                charInHiresBoundary = true;
              }
            } else {
              this.rawSegments.push(segment);
              charInHiresBoundary = false;
            }
          } else {
            this.rawSegments.push(segment);
          }
        }
        loc.column += 1;
        this.generatedCodeColumn += 1;
        first = false;
      }
      originalCharIndex += 1;
    }
    this.pending = null;
  }
  advance(str) {
    if (!str)
      return;
    const lines = str.split("\n");
    if (lines.length > 1) {
      for (let i = 0; i < lines.length - 1; i++) {
        this.generatedCodeLine++;
        this.raw[this.generatedCodeLine] = this.rawSegments = [];
      }
      this.generatedCodeColumn = 0;
    }
    this.generatedCodeColumn += lines[lines.length - 1].length;
  }
};
var n = "\n";
var warned = {
  insertLeft: false,
  insertRight: false,
  storeName: false
};
var MagicString = class {
  constructor(string, options = {}) {
    const chunk = new Chunk(0, string.length, string);
    Object.defineProperties(this, {
      original: { writable: true, value: string },
      outro: { writable: true, value: "" },
      intro: { writable: true, value: "" },
      firstChunk: { writable: true, value: chunk },
      lastChunk: { writable: true, value: chunk },
      lastSearchedChunk: { writable: true, value: chunk },
      byStart: { writable: true, value: {} },
      byEnd: { writable: true, value: {} },
      filename: { writable: true, value: options.filename },
      indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
      sourcemapLocations: { writable: true, value: new BitSet() },
      storedNames: { writable: true, value: {} },
      indentStr: { writable: true, value: void 0 },
      ignoreList: { writable: true, value: options.ignoreList },
      offset: { writable: true, value: options.offset || 0 }
    });
    this.byStart[0] = chunk;
    this.byEnd[string.length] = chunk;
  }
  addSourcemapLocation(char) {
    this.sourcemapLocations.add(char);
  }
  append(content) {
    if (typeof content !== "string")
      throw new TypeError("outro content must be a string");
    this.outro += content;
    return this;
  }
  appendLeft(index, content) {
    index = index + this.offset;
    if (typeof content !== "string")
      throw new TypeError("inserted content must be a string");
    this._split(index);
    const chunk = this.byEnd[index];
    if (chunk) {
      chunk.appendLeft(content);
    } else {
      this.intro += content;
    }
    return this;
  }
  appendRight(index, content) {
    index = index + this.offset;
    if (typeof content !== "string")
      throw new TypeError("inserted content must be a string");
    this._split(index);
    const chunk = this.byStart[index];
    if (chunk) {
      chunk.appendRight(content);
    } else {
      this.outro += content;
    }
    return this;
  }
  clone() {
    const cloned = new MagicString(this.original, { filename: this.filename, offset: this.offset });
    let originalChunk = this.firstChunk;
    let clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();
    while (originalChunk) {
      cloned.byStart[clonedChunk.start] = clonedChunk;
      cloned.byEnd[clonedChunk.end] = clonedChunk;
      const nextOriginalChunk = originalChunk.next;
      const nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();
      if (nextClonedChunk) {
        clonedChunk.next = nextClonedChunk;
        nextClonedChunk.previous = clonedChunk;
        clonedChunk = nextClonedChunk;
      }
      originalChunk = nextOriginalChunk;
    }
    cloned.lastChunk = clonedChunk;
    if (this.indentExclusionRanges) {
      cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
    }
    cloned.sourcemapLocations = new BitSet(this.sourcemapLocations);
    cloned.intro = this.intro;
    cloned.outro = this.outro;
    return cloned;
  }
  generateDecodedMap(options) {
    options = options || {};
    const sourceIndex = 0;
    const names = Object.keys(this.storedNames);
    const mappings = new Mappings(options.hires);
    const locate = getLocator(this.original);
    if (this.intro) {
      mappings.advance(this.intro);
    }
    this.firstChunk.eachNext((chunk) => {
      const loc = locate(chunk.start);
      if (chunk.intro.length)
        mappings.advance(chunk.intro);
      if (chunk.edited) {
        mappings.addEdit(
          sourceIndex,
          chunk.content,
          loc,
          chunk.storeName ? names.indexOf(chunk.original) : -1
        );
      } else {
        mappings.addUneditedChunk(sourceIndex, chunk, this.original, loc, this.sourcemapLocations);
      }
      if (chunk.outro.length)
        mappings.advance(chunk.outro);
    });
    return {
      file: options.file ? options.file.split(/[/\\]/).pop() : void 0,
      sources: [
        options.source ? getRelativePath(options.file || "", options.source) : options.file || ""
      ],
      sourcesContent: options.includeContent ? [this.original] : void 0,
      names,
      mappings: mappings.raw,
      x_google_ignoreList: this.ignoreList ? [sourceIndex] : void 0
    };
  }
  generateMap(options) {
    return new SourceMap(this.generateDecodedMap(options));
  }
  _ensureindentStr() {
    if (this.indentStr === void 0) {
      this.indentStr = guessIndent(this.original);
    }
  }
  _getRawIndentString() {
    this._ensureindentStr();
    return this.indentStr;
  }
  getIndentString() {
    this._ensureindentStr();
    return this.indentStr === null ? "	" : this.indentStr;
  }
  indent(indentStr, options) {
    const pattern = /^[^\r\n]/gm;
    if (isObject(indentStr)) {
      options = indentStr;
      indentStr = void 0;
    }
    if (indentStr === void 0) {
      this._ensureindentStr();
      indentStr = this.indentStr || "	";
    }
    if (indentStr === "")
      return this;
    options = options || {};
    const isExcluded = {};
    if (options.exclude) {
      const exclusions = typeof options.exclude[0] === "number" ? [options.exclude] : options.exclude;
      exclusions.forEach((exclusion) => {
        for (let i = exclusion[0]; i < exclusion[1]; i += 1) {
          isExcluded[i] = true;
        }
      });
    }
    let shouldIndentNextCharacter = options.indentStart !== false;
    const replacer = (match) => {
      if (shouldIndentNextCharacter)
        return `${indentStr}${match}`;
      shouldIndentNextCharacter = true;
      return match;
    };
    this.intro = this.intro.replace(pattern, replacer);
    let charIndex = 0;
    let chunk = this.firstChunk;
    while (chunk) {
      const end = chunk.end;
      if (chunk.edited) {
        if (!isExcluded[charIndex]) {
          chunk.content = chunk.content.replace(pattern, replacer);
          if (chunk.content.length) {
            shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === "\n";
          }
        }
      } else {
        charIndex = chunk.start;
        while (charIndex < end) {
          if (!isExcluded[charIndex]) {
            const char = this.original[charIndex];
            if (char === "\n") {
              shouldIndentNextCharacter = true;
            } else if (char !== "\r" && shouldIndentNextCharacter) {
              shouldIndentNextCharacter = false;
              if (charIndex === chunk.start) {
                chunk.prependRight(indentStr);
              } else {
                this._splitChunk(chunk, charIndex);
                chunk = chunk.next;
                chunk.prependRight(indentStr);
              }
            }
          }
          charIndex += 1;
        }
      }
      charIndex = chunk.end;
      chunk = chunk.next;
    }
    this.outro = this.outro.replace(pattern, replacer);
    return this;
  }
  insert() {
    throw new Error(
      "magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)"
    );
  }
  insertLeft(index, content) {
    if (!warned.insertLeft) {
      console.warn(
        "magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead"
      );
      warned.insertLeft = true;
    }
    return this.appendLeft(index, content);
  }
  insertRight(index, content) {
    if (!warned.insertRight) {
      console.warn(
        "magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead"
      );
      warned.insertRight = true;
    }
    return this.prependRight(index, content);
  }
  move(start, end, index) {
    start = start + this.offset;
    end = end + this.offset;
    index = index + this.offset;
    if (index >= start && index <= end)
      throw new Error("Cannot move a selection inside itself");
    this._split(start);
    this._split(end);
    this._split(index);
    const first = this.byStart[start];
    const last = this.byEnd[end];
    const oldLeft = first.previous;
    const oldRight = last.next;
    const newRight = this.byStart[index];
    if (!newRight && last === this.lastChunk)
      return this;
    const newLeft = newRight ? newRight.previous : this.lastChunk;
    if (oldLeft)
      oldLeft.next = oldRight;
    if (oldRight)
      oldRight.previous = oldLeft;
    if (newLeft)
      newLeft.next = first;
    if (newRight)
      newRight.previous = last;
    if (!first.previous)
      this.firstChunk = last.next;
    if (!last.next) {
      this.lastChunk = first.previous;
      this.lastChunk.next = null;
    }
    first.previous = newLeft;
    last.next = newRight || null;
    if (!newLeft)
      this.firstChunk = first;
    if (!newRight)
      this.lastChunk = last;
    return this;
  }
  overwrite(start, end, content, options) {
    options = options || {};
    return this.update(start, end, content, { ...options, overwrite: !options.contentOnly });
  }
  update(start, end, content, options) {
    start = start + this.offset;
    end = end + this.offset;
    if (typeof content !== "string")
      throw new TypeError("replacement content must be a string");
    if (this.original.length !== 0) {
      while (start < 0)
        start += this.original.length;
      while (end < 0)
        end += this.original.length;
    }
    if (end > this.original.length)
      throw new Error("end is out of bounds");
    if (start === end)
      throw new Error(
        "Cannot overwrite a zero-length range \u2013 use appendLeft or prependRight instead"
      );
    this._split(start);
    this._split(end);
    if (options === true) {
      if (!warned.storeName) {
        console.warn(
          "The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string"
        );
        warned.storeName = true;
      }
      options = { storeName: true };
    }
    const storeName = options !== void 0 ? options.storeName : false;
    const overwrite = options !== void 0 ? options.overwrite : false;
    if (storeName) {
      const original = this.original.slice(start, end);
      Object.defineProperty(this.storedNames, original, {
        writable: true,
        value: true,
        enumerable: true
      });
    }
    const first = this.byStart[start];
    const last = this.byEnd[end];
    if (first) {
      let chunk = first;
      while (chunk !== last) {
        if (chunk.next !== this.byStart[chunk.end]) {
          throw new Error("Cannot overwrite across a split point");
        }
        chunk = chunk.next;
        chunk.edit("", false);
      }
      first.edit(content, storeName, !overwrite);
    } else {
      const newChunk = new Chunk(start, end, "").edit(content, storeName);
      last.next = newChunk;
      newChunk.previous = last;
    }
    return this;
  }
  prepend(content) {
    if (typeof content !== "string")
      throw new TypeError("outro content must be a string");
    this.intro = content + this.intro;
    return this;
  }
  prependLeft(index, content) {
    index = index + this.offset;
    if (typeof content !== "string")
      throw new TypeError("inserted content must be a string");
    this._split(index);
    const chunk = this.byEnd[index];
    if (chunk) {
      chunk.prependLeft(content);
    } else {
      this.intro = content + this.intro;
    }
    return this;
  }
  prependRight(index, content) {
    index = index + this.offset;
    if (typeof content !== "string")
      throw new TypeError("inserted content must be a string");
    this._split(index);
    const chunk = this.byStart[index];
    if (chunk) {
      chunk.prependRight(content);
    } else {
      this.outro = content + this.outro;
    }
    return this;
  }
  remove(start, end) {
    start = start + this.offset;
    end = end + this.offset;
    if (this.original.length !== 0) {
      while (start < 0)
        start += this.original.length;
      while (end < 0)
        end += this.original.length;
    }
    if (start === end)
      return this;
    if (start < 0 || end > this.original.length)
      throw new Error("Character is out of bounds");
    if (start > end)
      throw new Error("end must be greater than start");
    this._split(start);
    this._split(end);
    let chunk = this.byStart[start];
    while (chunk) {
      chunk.intro = "";
      chunk.outro = "";
      chunk.edit("");
      chunk = end > chunk.end ? this.byStart[chunk.end] : null;
    }
    return this;
  }
  reset(start, end) {
    start = start + this.offset;
    end = end + this.offset;
    if (this.original.length !== 0) {
      while (start < 0)
        start += this.original.length;
      while (end < 0)
        end += this.original.length;
    }
    if (start === end)
      return this;
    if (start < 0 || end > this.original.length)
      throw new Error("Character is out of bounds");
    if (start > end)
      throw new Error("end must be greater than start");
    this._split(start);
    this._split(end);
    let chunk = this.byStart[start];
    while (chunk) {
      chunk.reset();
      chunk = end > chunk.end ? this.byStart[chunk.end] : null;
    }
    return this;
  }
  lastChar() {
    if (this.outro.length)
      return this.outro[this.outro.length - 1];
    let chunk = this.lastChunk;
    do {
      if (chunk.outro.length)
        return chunk.outro[chunk.outro.length - 1];
      if (chunk.content.length)
        return chunk.content[chunk.content.length - 1];
      if (chunk.intro.length)
        return chunk.intro[chunk.intro.length - 1];
    } while (chunk = chunk.previous);
    if (this.intro.length)
      return this.intro[this.intro.length - 1];
    return "";
  }
  lastLine() {
    let lineIndex = this.outro.lastIndexOf(n);
    if (lineIndex !== -1)
      return this.outro.substr(lineIndex + 1);
    let lineStr = this.outro;
    let chunk = this.lastChunk;
    do {
      if (chunk.outro.length > 0) {
        lineIndex = chunk.outro.lastIndexOf(n);
        if (lineIndex !== -1)
          return chunk.outro.substr(lineIndex + 1) + lineStr;
        lineStr = chunk.outro + lineStr;
      }
      if (chunk.content.length > 0) {
        lineIndex = chunk.content.lastIndexOf(n);
        if (lineIndex !== -1)
          return chunk.content.substr(lineIndex + 1) + lineStr;
        lineStr = chunk.content + lineStr;
      }
      if (chunk.intro.length > 0) {
        lineIndex = chunk.intro.lastIndexOf(n);
        if (lineIndex !== -1)
          return chunk.intro.substr(lineIndex + 1) + lineStr;
        lineStr = chunk.intro + lineStr;
      }
    } while (chunk = chunk.previous);
    lineIndex = this.intro.lastIndexOf(n);
    if (lineIndex !== -1)
      return this.intro.substr(lineIndex + 1) + lineStr;
    return this.intro + lineStr;
  }
  slice(start = 0, end = this.original.length - this.offset) {
    start = start + this.offset;
    end = end + this.offset;
    if (this.original.length !== 0) {
      while (start < 0)
        start += this.original.length;
      while (end < 0)
        end += this.original.length;
    }
    let result = "";
    let chunk = this.firstChunk;
    while (chunk && (chunk.start > start || chunk.end <= start)) {
      if (chunk.start < end && chunk.end >= end) {
        return result;
      }
      chunk = chunk.next;
    }
    if (chunk && chunk.edited && chunk.start !== start)
      throw new Error(`Cannot use replaced character ${start} as slice start anchor.`);
    const startChunk = chunk;
    while (chunk) {
      if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
        result += chunk.intro;
      }
      const containsEnd = chunk.start < end && chunk.end >= end;
      if (containsEnd && chunk.edited && chunk.end !== end)
        throw new Error(`Cannot use replaced character ${end} as slice end anchor.`);
      const sliceStart = startChunk === chunk ? start - chunk.start : 0;
      const sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;
      result += chunk.content.slice(sliceStart, sliceEnd);
      if (chunk.outro && (!containsEnd || chunk.end === end)) {
        result += chunk.outro;
      }
      if (containsEnd) {
        break;
      }
      chunk = chunk.next;
    }
    return result;
  }
  snip(start, end) {
    const clone = this.clone();
    clone.remove(0, start);
    clone.remove(end, clone.original.length);
    return clone;
  }
  _split(index) {
    if (this.byStart[index] || this.byEnd[index])
      return;
    let chunk = this.lastSearchedChunk;
    const searchForward = index > chunk.end;
    while (chunk) {
      if (chunk.contains(index))
        return this._splitChunk(chunk, index);
      chunk = searchForward ? this.byStart[chunk.end] : this.byEnd[chunk.start];
    }
  }
  _splitChunk(chunk, index) {
    if (chunk.edited && chunk.content.length) {
      const loc = getLocator(this.original)(index);
      throw new Error(
        `Cannot split a chunk that has already been edited (${loc.line}:${loc.column} \u2013 "${chunk.original}")`
      );
    }
    const newChunk = chunk.split(index);
    this.byEnd[index] = chunk;
    this.byStart[index] = newChunk;
    this.byEnd[newChunk.end] = newChunk;
    if (chunk === this.lastChunk)
      this.lastChunk = newChunk;
    this.lastSearchedChunk = chunk;
    return true;
  }
  toString() {
    let str = this.intro;
    let chunk = this.firstChunk;
    while (chunk) {
      str += chunk.toString();
      chunk = chunk.next;
    }
    return str + this.outro;
  }
  isEmpty() {
    let chunk = this.firstChunk;
    do {
      if (chunk.intro.length && chunk.intro.trim() || chunk.content.length && chunk.content.trim() || chunk.outro.length && chunk.outro.trim())
        return false;
    } while (chunk = chunk.next);
    return true;
  }
  length() {
    let chunk = this.firstChunk;
    let length = 0;
    do {
      length += chunk.intro.length + chunk.content.length + chunk.outro.length;
    } while (chunk = chunk.next);
    return length;
  }
  trimLines() {
    return this.trim("[\\r\\n]");
  }
  trim(charType) {
    return this.trimStart(charType).trimEnd(charType);
  }
  trimEndAborted(charType) {
    const rx = new RegExp((charType || "\\s") + "+$");
    this.outro = this.outro.replace(rx, "");
    if (this.outro.length)
      return true;
    let chunk = this.lastChunk;
    do {
      const end = chunk.end;
      const aborted = chunk.trimEnd(rx);
      if (chunk.end !== end) {
        if (this.lastChunk === chunk) {
          this.lastChunk = chunk.next;
        }
        this.byEnd[chunk.end] = chunk;
        this.byStart[chunk.next.start] = chunk.next;
        this.byEnd[chunk.next.end] = chunk.next;
      }
      if (aborted)
        return true;
      chunk = chunk.previous;
    } while (chunk);
    return false;
  }
  trimEnd(charType) {
    this.trimEndAborted(charType);
    return this;
  }
  trimStartAborted(charType) {
    const rx = new RegExp("^" + (charType || "\\s") + "+");
    this.intro = this.intro.replace(rx, "");
    if (this.intro.length)
      return true;
    let chunk = this.firstChunk;
    do {
      const end = chunk.end;
      const aborted = chunk.trimStart(rx);
      if (chunk.end !== end) {
        if (chunk === this.lastChunk)
          this.lastChunk = chunk.next;
        this.byEnd[chunk.end] = chunk;
        this.byStart[chunk.next.start] = chunk.next;
        this.byEnd[chunk.next.end] = chunk.next;
      }
      if (aborted)
        return true;
      chunk = chunk.next;
    } while (chunk);
    return false;
  }
  trimStart(charType) {
    this.trimStartAborted(charType);
    return this;
  }
  hasChanged() {
    return this.original !== this.toString();
  }
  _replaceRegexp(searchValue, replacement) {
    function getReplacement(match, str) {
      if (typeof replacement === "string") {
        return replacement.replace(/\$(\$|&|\d+)/g, (_, i) => {
          if (i === "$")
            return "$";
          if (i === "&")
            return match[0];
          const num = +i;
          if (num < match.length)
            return match[+i];
          return `$${i}`;
        });
      } else {
        return replacement(...match, match.index, str, match.groups);
      }
    }
    function matchAll(re, str) {
      let match;
      const matches = [];
      while (match = re.exec(str)) {
        matches.push(match);
      }
      return matches;
    }
    if (searchValue.global) {
      const matches = matchAll(searchValue, this.original);
      matches.forEach((match) => {
        if (match.index != null) {
          const replacement2 = getReplacement(match, this.original);
          if (replacement2 !== match[0]) {
            this.overwrite(match.index, match.index + match[0].length, replacement2);
          }
        }
      });
    } else {
      const match = this.original.match(searchValue);
      if (match && match.index != null) {
        const replacement2 = getReplacement(match, this.original);
        if (replacement2 !== match[0]) {
          this.overwrite(match.index, match.index + match[0].length, replacement2);
        }
      }
    }
    return this;
  }
  _replaceString(string, replacement) {
    const { original } = this;
    const index = original.indexOf(string);
    if (index !== -1) {
      this.overwrite(index, index + string.length, replacement);
    }
    return this;
  }
  replace(searchValue, replacement) {
    if (typeof searchValue === "string") {
      return this._replaceString(searchValue, replacement);
    }
    return this._replaceRegexp(searchValue, replacement);
  }
  _replaceAllString(string, replacement) {
    const { original } = this;
    const stringLength = string.length;
    for (let index = original.indexOf(string); index !== -1; index = original.indexOf(string, index + stringLength)) {
      const previous = original.slice(index, index + stringLength);
      if (previous !== replacement)
        this.overwrite(index, index + stringLength, replacement);
    }
    return this;
  }
  replaceAll(searchValue, replacement) {
    if (typeof searchValue === "string") {
      return this._replaceAllString(searchValue, replacement);
    }
    if (!searchValue.global) {
      throw new TypeError(
        "MagicString.prototype.replaceAll called with a non-global RegExp argument"
      );
    }
    return this._replaceRegexp(searchValue, replacement);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/context.mjs
import ts43 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/dom.mjs
import { DomElementSchemaRegistry } from "@angular/compiler";
import ts31 from "typescript";
var REGISTRY = new DomElementSchemaRegistry();
var REMOVE_XHTML_REGEX = /^:xhtml:/;
var RegistryDomSchemaChecker = class {
  resolver;
  _diagnostics = [];
  get diagnostics() {
    return this._diagnostics;
  }
  constructor(resolver) {
    this.resolver = resolver;
  }
  checkElement(id, element, schemas, hostIsStandalone) {
    const name = element.name.replace(REMOVE_XHTML_REGEX, "");
    if (!REGISTRY.hasElement(name, schemas)) {
      const mapping = this.resolver.getSourceMapping(id);
      const schemas2 = `'${hostIsStandalone ? "@Component" : "@NgModule"}.schemas'`;
      let errorMsg = `'${name}' is not a known element:
`;
      errorMsg += `1. If '${name}' is an Angular component, then verify that it is ${hostIsStandalone ? "included in the '@Component.imports' of this component" : "part of this module"}.
`;
      if (name.indexOf("-") > -1) {
        errorMsg += `2. If '${name}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas2} of this component to suppress this message.`;
      } else {
        errorMsg += `2. To allow any element add 'NO_ERRORS_SCHEMA' to the ${schemas2} of this component.`;
      }
      const diag = makeTemplateDiagnostic(id, mapping, element.startSourceSpan, ts31.DiagnosticCategory.Error, ngErrorCode(ErrorCode.SCHEMA_INVALID_ELEMENT), errorMsg);
      this._diagnostics.push(diag);
    }
  }
  checkProperty(id, element, name, span, schemas, hostIsStandalone) {
    if (!REGISTRY.hasProperty(element.name, name, schemas)) {
      const mapping = this.resolver.getSourceMapping(id);
      const decorator = hostIsStandalone ? "@Component" : "@NgModule";
      const schemas2 = `'${decorator}.schemas'`;
      let errorMsg = `Can't bind to '${name}' since it isn't a known property of '${element.name}'.`;
      if (element.name.startsWith("ng-")) {
        errorMsg += `
1. If '${name}' is an Angular directive, then add 'CommonModule' to the '${decorator}.imports' of this component.
2. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas2} of this component.`;
      } else if (element.name.indexOf("-") > -1) {
        errorMsg += `
1. If '${element.name}' is an Angular component and it has '${name}' input, then verify that it is ${hostIsStandalone ? "included in the '@Component.imports' of this component" : "part of this module"}.
2. If '${element.name}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas2} of this component to suppress this message.
3. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas2} of this component.`;
      }
      const diag = makeTemplateDiagnostic(id, mapping, span, ts31.DiagnosticCategory.Error, ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE), errorMsg);
      this._diagnostics.push(diag);
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/environment.mjs
import ts36 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/reference_emit_environment.mjs
import { ExpressionType, ExternalExpr as ExternalExpr6, TypeModifier } from "@angular/compiler";
var ReferenceEmitEnvironment = class {
  importManager;
  refEmitter;
  reflector;
  contextFile;
  constructor(importManager, refEmitter, reflector, contextFile) {
    this.importManager = importManager;
    this.refEmitter = refEmitter;
    this.reflector = reflector;
    this.contextFile = contextFile;
  }
  canReferenceType(ref, flags = ImportFlags.NoAliasing | ImportFlags.AllowTypeImports | ImportFlags.AllowRelativeDtsImports) {
    const result = this.refEmitter.emit(ref, this.contextFile, flags);
    return result.kind === ReferenceEmitKind.Success;
  }
  referenceType(ref, flags = ImportFlags.NoAliasing | ImportFlags.AllowTypeImports | ImportFlags.AllowRelativeDtsImports) {
    const ngExpr = this.refEmitter.emit(ref, this.contextFile, flags);
    assertSuccessfulReferenceEmit(ngExpr, this.contextFile, "symbol");
    return translateType(new ExpressionType(ngExpr.expression), this.contextFile, this.reflector, this.refEmitter, this.importManager);
  }
  referenceExternalSymbol(moduleName, name) {
    const external = new ExternalExpr6({ moduleName, name });
    return translateExpression(this.contextFile, external, this.importManager);
  }
  referenceExternalType(moduleName, name, typeParams) {
    const external = new ExternalExpr6({ moduleName, name });
    return translateType(new ExpressionType(external, TypeModifier.None, typeParams), this.contextFile, this.reflector, this.refEmitter, this.importManager);
  }
  referenceTransplantedType(type) {
    return translateType(type, this.contextFile, this.reflector, this.refEmitter, this.importManager);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/ts_util.mjs
import ts32 from "typescript";
var SAFE_TO_CAST_WITHOUT_PARENS = /* @__PURE__ */ new Set([
  ts32.SyntaxKind.ParenthesizedExpression,
  ts32.SyntaxKind.Identifier,
  ts32.SyntaxKind.CallExpression,
  ts32.SyntaxKind.NonNullExpression,
  ts32.SyntaxKind.ElementAccessExpression,
  ts32.SyntaxKind.PropertyAccessExpression,
  ts32.SyntaxKind.ArrayLiteralExpression,
  ts32.SyntaxKind.ObjectLiteralExpression,
  ts32.SyntaxKind.StringLiteral,
  ts32.SyntaxKind.NumericLiteral,
  ts32.SyntaxKind.TrueKeyword,
  ts32.SyntaxKind.FalseKeyword,
  ts32.SyntaxKind.NullKeyword,
  ts32.SyntaxKind.UndefinedKeyword
]);
function tsCastToAny(expr) {
  if (!SAFE_TO_CAST_WITHOUT_PARENS.has(expr.kind)) {
    expr = ts32.factory.createParenthesizedExpression(expr);
  }
  return ts32.factory.createParenthesizedExpression(ts32.factory.createAsExpression(expr, ts32.factory.createKeywordTypeNode(ts32.SyntaxKind.AnyKeyword)));
}
function tsCreateElement(tagName) {
  const createElement = ts32.factory.createPropertyAccessExpression(
    ts32.factory.createIdentifier("document"),
    "createElement"
  );
  return ts32.factory.createCallExpression(
    createElement,
    void 0,
    [ts32.factory.createStringLiteral(tagName)]
  );
}
function tsDeclareVariable(id, type) {
  addExpressionIdentifier(type, ExpressionIdentifier.VARIABLE_AS_EXPRESSION);
  const initializer = ts32.factory.createAsExpression(ts32.factory.createNonNullExpression(ts32.factory.createNull()), type);
  const decl = ts32.factory.createVariableDeclaration(
    id,
    void 0,
    void 0,
    initializer
  );
  return ts32.factory.createVariableStatement(
    void 0,
    [decl]
  );
}
function tsCreateTypeQueryForCoercedInput(typeName, coercedInputName) {
  return ts32.factory.createTypeQueryNode(ts32.factory.createQualifiedName(typeName, `ngAcceptInputType_${coercedInputName}`));
}
function tsCreateVariable(id, initializer, flags = null) {
  const decl = ts32.factory.createVariableDeclaration(
    id,
    void 0,
    void 0,
    initializer
  );
  return ts32.factory.createVariableStatement(
    void 0,
    flags === null ? [decl] : ts32.factory.createVariableDeclarationList([decl], flags)
  );
}
function tsCallMethod(receiver, methodName, args = []) {
  const methodAccess = ts32.factory.createPropertyAccessExpression(receiver, methodName);
  return ts32.factory.createCallExpression(
    methodAccess,
    void 0,
    args
  );
}
function isAccessExpression(node) {
  return ts32.isPropertyAccessExpression(node) || ts32.isElementAccessExpression(node);
}
function tsNumericExpression(value) {
  if (value < 0) {
    const operand = ts32.factory.createNumericLiteral(Math.abs(value));
    return ts32.factory.createPrefixUnaryExpression(ts32.SyntaxKind.MinusToken, operand);
  }
  return ts32.factory.createNumericLiteral(value);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/type_constructor.mjs
import { ExpressionType as ExpressionType2, R3Identifiers as R3Identifiers3, WrappedNodeExpr as WrappedNodeExpr8 } from "@angular/compiler";
import ts35 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/tcb_util.mjs
import { R3Identifiers as R3Identifiers2 } from "@angular/compiler";
import ts34 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter.mjs
import ts33 from "typescript";
var TypeParameterEmitter = class {
  typeParameters;
  reflector;
  constructor(typeParameters, reflector) {
    this.typeParameters = typeParameters;
    this.reflector = reflector;
  }
  canEmit(canEmitReference) {
    if (this.typeParameters === void 0) {
      return true;
    }
    return this.typeParameters.every((typeParam) => {
      return this.canEmitType(typeParam.constraint, canEmitReference) && this.canEmitType(typeParam.default, canEmitReference);
    });
  }
  canEmitType(type, canEmitReference) {
    if (type === void 0) {
      return true;
    }
    return canEmitType(type, (typeReference) => {
      const reference = this.resolveTypeReference(typeReference);
      if (reference === null) {
        return false;
      }
      if (reference instanceof Reference) {
        return canEmitReference(reference);
      }
      return true;
    });
  }
  emit(emitReference) {
    if (this.typeParameters === void 0) {
      return void 0;
    }
    const emitter = new TypeEmitter((type) => this.translateTypeReference(type, emitReference));
    return this.typeParameters.map((typeParam) => {
      const constraint = typeParam.constraint !== void 0 ? emitter.emitType(typeParam.constraint) : void 0;
      const defaultType = typeParam.default !== void 0 ? emitter.emitType(typeParam.default) : void 0;
      return ts33.factory.updateTypeParameterDeclaration(typeParam, typeParam.modifiers, typeParam.name, constraint, defaultType);
    });
  }
  resolveTypeReference(type) {
    const target = ts33.isIdentifier(type.typeName) ? type.typeName : type.typeName.right;
    const declaration = this.reflector.getDeclarationOfIdentifier(target);
    if (declaration === null || declaration.node === null) {
      return null;
    }
    if (this.isLocalTypeParameter(declaration.node)) {
      return type;
    }
    let owningModule2 = null;
    if (typeof declaration.viaModule === "string") {
      owningModule2 = {
        specifier: declaration.viaModule,
        resolutionContext: type.getSourceFile().fileName
      };
    }
    return new Reference(declaration.node, declaration.viaModule === AmbientImport ? AmbientImport : owningModule2);
  }
  translateTypeReference(type, emitReference) {
    const reference = this.resolveTypeReference(type);
    if (!(reference instanceof Reference)) {
      return reference;
    }
    const typeNode = emitReference(reference);
    if (typeNode === null) {
      return null;
    }
    if (!ts33.isTypeReferenceNode(typeNode)) {
      throw new Error(`Expected TypeReferenceNode for emitted reference, got ${ts33.SyntaxKind[typeNode.kind]}.`);
    }
    return typeNode;
  }
  isLocalTypeParameter(decl) {
    return this.typeParameters.some((param) => param === decl);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/tcb_util.mjs
var TCB_FILE_IMPORT_GRAPH_PREPARE_IDENTIFIERS = [
  R3Identifiers2.InputSignalBrandWriteType
];
var TcbInliningRequirement;
(function(TcbInliningRequirement2) {
  TcbInliningRequirement2[TcbInliningRequirement2["MustInline"] = 0] = "MustInline";
  TcbInliningRequirement2[TcbInliningRequirement2["ShouldInlineForGenericBounds"] = 1] = "ShouldInlineForGenericBounds";
  TcbInliningRequirement2[TcbInliningRequirement2["None"] = 2] = "None";
})(TcbInliningRequirement || (TcbInliningRequirement = {}));
function requiresInlineTypeCheckBlock(ref, env, usedPipes, reflector) {
  if (!env.canReferenceType(ref)) {
    return TcbInliningRequirement.MustInline;
  } else if (!checkIfGenericTypeBoundsCanBeEmitted(ref.node, reflector, env)) {
    return TcbInliningRequirement.ShouldInlineForGenericBounds;
  } else if (usedPipes.some((pipeRef) => !env.canReferenceType(pipeRef))) {
    return TcbInliningRequirement.MustInline;
  } else {
    return TcbInliningRequirement.None;
  }
}
function getTemplateMapping(shimSf, position, resolver, isDiagnosticRequest) {
  const node = getTokenAtPosition(shimSf, position);
  const sourceLocation = findSourceLocation(node, shimSf, isDiagnosticRequest);
  if (sourceLocation === null) {
    return null;
  }
  const mapping = resolver.getSourceMapping(sourceLocation.id);
  const span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
  if (span === null) {
    return null;
  }
  return { sourceLocation, templateSourceMapping: mapping, span };
}
function findTypeCheckBlock(file, id, isDiagnosticRequest) {
  for (const stmt of file.statements) {
    if (ts34.isFunctionDeclaration(stmt) && getTemplateId2(stmt, file, isDiagnosticRequest) === id) {
      return stmt;
    }
  }
  return null;
}
function findSourceLocation(node, sourceFile, isDiagnosticsRequest) {
  while (node !== void 0 && !ts34.isFunctionDeclaration(node)) {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticsRequest) {
      return null;
    }
    const span = readSpanComment(node, sourceFile);
    if (span !== null) {
      const id = getTemplateId2(node, sourceFile, isDiagnosticsRequest);
      if (id === null) {
        return null;
      }
      return { id, span };
    }
    node = node.parent;
  }
  return null;
}
function getTemplateId2(node, sourceFile, isDiagnosticRequest) {
  while (!ts34.isFunctionDeclaration(node)) {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticRequest) {
      return null;
    }
    node = node.parent;
    if (node === void 0) {
      return null;
    }
  }
  const start = node.getFullStart();
  return ts34.forEachLeadingCommentRange(sourceFile.text, start, (pos, end, kind) => {
    if (kind !== ts34.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText;
  }) || null;
}
function ensureTypeCheckFilePreparationImports(env) {
  for (const identifier of TCB_FILE_IMPORT_GRAPH_PREPARE_IDENTIFIERS) {
    env.importManager.addImport({
      exportModuleSpecifier: identifier.moduleName,
      exportSymbolName: identifier.name,
      requestedFile: env.contextFile
    });
  }
}
function checkIfGenericTypeBoundsCanBeEmitted(node, reflector, env) {
  const emitter = new TypeParameterEmitter(node.typeParameters, reflector);
  return emitter.canEmit((ref) => env.canReferenceType(ref));
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/type_constructor.mjs
function generateTypeCtorDeclarationFn(env, meta, nodeTypeRef, typeParams) {
  const rawTypeArgs = typeParams !== void 0 ? generateGenericArgs(typeParams) : void 0;
  const rawType = ts35.factory.createTypeReferenceNode(nodeTypeRef, rawTypeArgs);
  const initParam = constructTypeCtorParameter(env, meta, rawType);
  const typeParameters = typeParametersWithDefaultTypes(typeParams);
  if (meta.body) {
    const fnType = ts35.factory.createFunctionTypeNode(
      typeParameters,
      [initParam],
      rawType
    );
    const decl = ts35.factory.createVariableDeclaration(
      meta.fnName,
      void 0,
      fnType,
      ts35.factory.createNonNullExpression(ts35.factory.createNull())
    );
    const declList = ts35.factory.createVariableDeclarationList([decl], ts35.NodeFlags.Const);
    return ts35.factory.createVariableStatement(
      void 0,
      declList
    );
  } else {
    return ts35.factory.createFunctionDeclaration(
      [ts35.factory.createModifier(ts35.SyntaxKind.DeclareKeyword)],
      void 0,
      meta.fnName,
      typeParameters,
      [initParam],
      rawType,
      void 0
    );
  }
}
function generateInlineTypeCtor(env, node, meta) {
  const rawTypeArgs = node.typeParameters !== void 0 ? generateGenericArgs(node.typeParameters) : void 0;
  const rawType = ts35.factory.createTypeReferenceNode(node.name, rawTypeArgs);
  const initParam = constructTypeCtorParameter(env, meta, rawType);
  let body = void 0;
  if (meta.body) {
    body = ts35.factory.createBlock([
      ts35.factory.createReturnStatement(ts35.factory.createNonNullExpression(ts35.factory.createNull()))
    ]);
  }
  return ts35.factory.createMethodDeclaration(
    [ts35.factory.createModifier(ts35.SyntaxKind.StaticKeyword)],
    void 0,
    meta.fnName,
    void 0,
    typeParametersWithDefaultTypes(node.typeParameters),
    [initParam],
    rawType,
    body
  );
}
function constructTypeCtorParameter(env, meta, rawType) {
  let initType = null;
  const plainKeys = [];
  const coercedKeys = [];
  const signalInputKeys = [];
  for (const { classPropertyName, transform, isSignal } of meta.fields.inputs) {
    if (isSignal) {
      signalInputKeys.push(ts35.factory.createLiteralTypeNode(ts35.factory.createStringLiteral(classPropertyName)));
    } else if (!meta.coercedInputFields.has(classPropertyName)) {
      plainKeys.push(ts35.factory.createLiteralTypeNode(ts35.factory.createStringLiteral(classPropertyName)));
    } else {
      const coercionType = transform != null ? transform.type.node : tsCreateTypeQueryForCoercedInput(rawType.typeName, classPropertyName);
      coercedKeys.push(ts35.factory.createPropertySignature(
        void 0,
        classPropertyName,
        void 0,
        coercionType
      ));
    }
  }
  if (plainKeys.length > 0) {
    const keyTypeUnion = ts35.factory.createUnionTypeNode(plainKeys);
    initType = ts35.factory.createTypeReferenceNode("Pick", [rawType, keyTypeUnion]);
  }
  if (coercedKeys.length > 0) {
    const coercedLiteral = ts35.factory.createTypeLiteralNode(coercedKeys);
    initType = initType !== null ? ts35.factory.createIntersectionTypeNode([initType, coercedLiteral]) : coercedLiteral;
  }
  if (signalInputKeys.length > 0) {
    const keyTypeUnion = ts35.factory.createUnionTypeNode(signalInputKeys);
    const unwrapDirectiveSignalInputsExpr = env.referenceExternalType(R3Identifiers3.UnwrapDirectiveSignalInputs.moduleName, R3Identifiers3.UnwrapDirectiveSignalInputs.name, [
      new ExpressionType2(new WrappedNodeExpr8(rawType)),
      new ExpressionType2(new WrappedNodeExpr8(keyTypeUnion))
    ]);
    initType = initType !== null ? ts35.factory.createIntersectionTypeNode([initType, unwrapDirectiveSignalInputsExpr]) : unwrapDirectiveSignalInputsExpr;
  }
  if (initType === null) {
    initType = ts35.factory.createTypeLiteralNode([]);
  }
  return ts35.factory.createParameterDeclaration(
    void 0,
    void 0,
    "init",
    void 0,
    initType,
    void 0
  );
}
function generateGenericArgs(params) {
  return params.map((param) => ts35.factory.createTypeReferenceNode(param.name, void 0));
}
function requiresInlineTypeCtor(node, host, env) {
  return !checkIfGenericTypeBoundsCanBeEmitted(node, host, env);
}
function typeParametersWithDefaultTypes(params) {
  if (params === void 0) {
    return void 0;
  }
  return params.map((param) => {
    if (param.default === void 0) {
      return ts35.factory.updateTypeParameterDeclaration(param, param.modifiers, param.name, param.constraint, ts35.factory.createKeywordTypeNode(ts35.SyntaxKind.AnyKeyword));
    } else {
      return param;
    }
  });
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/environment.mjs
var Environment = class extends ReferenceEmitEnvironment {
  config;
  nextIds = {
    pipeInst: 1,
    typeCtor: 1
  };
  typeCtors = /* @__PURE__ */ new Map();
  typeCtorStatements = [];
  pipeInsts = /* @__PURE__ */ new Map();
  pipeInstStatements = [];
  constructor(config, importManager, refEmitter, reflector, contextFile) {
    super(importManager, refEmitter, reflector, contextFile);
    this.config = config;
  }
  typeCtorFor(dir) {
    const dirRef = dir.ref;
    const node = dirRef.node;
    if (this.typeCtors.has(node)) {
      return this.typeCtors.get(node);
    }
    if (requiresInlineTypeCtor(node, this.reflector, this)) {
      const ref = this.reference(dirRef);
      const typeCtorExpr = ts36.factory.createPropertyAccessExpression(ref, "ngTypeCtor");
      this.typeCtors.set(node, typeCtorExpr);
      return typeCtorExpr;
    } else {
      const fnName = `_ctor${this.nextIds.typeCtor++}`;
      const nodeTypeRef = this.referenceType(dirRef);
      if (!ts36.isTypeReferenceNode(nodeTypeRef)) {
        throw new Error(`Expected TypeReferenceNode from reference to ${dirRef.debugName}`);
      }
      const meta = {
        fnName,
        body: true,
        fields: {
          inputs: dir.inputs,
          queries: dir.queries
        },
        coercedInputFields: dir.coercedInputFields
      };
      const typeParams = this.emitTypeParameters(node);
      const typeCtor = generateTypeCtorDeclarationFn(this, meta, nodeTypeRef.typeName, typeParams);
      this.typeCtorStatements.push(typeCtor);
      const fnId = ts36.factory.createIdentifier(fnName);
      this.typeCtors.set(node, fnId);
      return fnId;
    }
  }
  pipeInst(ref) {
    if (this.pipeInsts.has(ref.node)) {
      return this.pipeInsts.get(ref.node);
    }
    const pipeType = this.referenceType(ref);
    const pipeInstId = ts36.factory.createIdentifier(`_pipe${this.nextIds.pipeInst++}`);
    this.pipeInstStatements.push(tsDeclareVariable(pipeInstId, pipeType));
    this.pipeInsts.set(ref.node, pipeInstId);
    return pipeInstId;
  }
  reference(ref) {
    const ngExpr = this.refEmitter.emit(ref, this.contextFile, ImportFlags.NoAliasing);
    assertSuccessfulReferenceEmit(ngExpr, this.contextFile, "class");
    return translateExpression(this.contextFile, ngExpr.expression, this.importManager);
  }
  emitTypeParameters(declaration) {
    const emitter = new TypeParameterEmitter(declaration.typeParameters, this.reflector);
    return emitter.emit((ref) => this.referenceType(ref));
  }
  getPreludeStatements() {
    return [...this.pipeInstStatements, ...this.typeCtorStatements];
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/oob.mjs
import { AbsoluteSourceSpan as AbsoluteSourceSpan2, TmplAstElement } from "@angular/compiler";
import ts37 from "typescript";
var OutOfBandDiagnosticRecorderImpl = class {
  resolver;
  _diagnostics = [];
  recordedPipes = /* @__PURE__ */ new Set();
  constructor(resolver) {
    this.resolver = resolver;
  }
  get diagnostics() {
    return this._diagnostics;
  }
  missingReferenceTarget(templateId, ref) {
    const mapping = this.resolver.getSourceMapping(templateId);
    const value = ref.value.trim();
    const errorMsg = `No directive found with exportAs '${value}'.`;
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, ref.valueSpan || ref.sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.MISSING_REFERENCE_TARGET), errorMsg));
  }
  missingPipe(templateId, ast) {
    if (this.recordedPipes.has(ast)) {
      return;
    }
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `No pipe found with name '${ast.name}'.`;
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, ast.nameSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.MISSING_PIPE), errorMsg));
    this.recordedPipes.add(ast);
  }
  deferredPipeUsedEagerly(templateId, ast) {
    if (this.recordedPipes.has(ast)) {
      return;
    }
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Pipe '${ast.name}' was imported  via \`@Component.deferredImports\`, but was used outside of a \`@defer\` block in a template. To fix this, either use the '${ast.name}' pipe inside of a \`@defer\` block or import this dependency using the \`@Component.imports\` field.`;
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, ast.nameSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.DEFERRED_PIPE_USED_EAGERLY), errorMsg));
    this.recordedPipes.add(ast);
  }
  deferredComponentUsedEagerly(templateId, element) {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Element '${element.name}' contains a component or a directive that was imported  via \`@Component.deferredImports\`, but the element itself is located outside of a \`@defer\` block in a template. To fix this, either use the '${element.name}' element inside of a \`@defer\` block or import referenced component/directive dependency using the \`@Component.imports\` field.`;
    const { start, end } = element.startSourceSpan;
    const absoluteSourceSpan = new AbsoluteSourceSpan2(start.offset, end.offset);
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, absoluteSourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for usage of pipe '${element.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.DEFERRED_DIRECTIVE_USED_EAGERLY), errorMsg));
  }
  duplicateTemplateVar(templateId, variable, firstDecl) {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Cannot redeclare variable '${variable.name}' as it was previously declared elsewhere for the same template.`;
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, variable.sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.DUPLICATE_VARIABLE_DECLARATION), errorMsg, [
      {
        text: `The variable '${firstDecl.name}' was first declared here.`,
        start: firstDecl.sourceSpan.start.offset,
        end: firstDecl.sourceSpan.end.offset,
        sourceFile: mapping.node.getSourceFile()
      }
    ]));
  }
  requiresInlineTcb(templateId, node) {
    this._diagnostics.push(makeInlineDiagnostic(templateId, ErrorCode.INLINE_TCB_REQUIRED, node.name, `This component requires inline template type-checking, which is not supported by the current environment.`));
  }
  requiresInlineTypeConstructors(templateId, node, directives) {
    let message;
    if (directives.length > 1) {
      message = `This component uses directives which require inline type constructors, which are not supported by the current environment.`;
    } else {
      message = `This component uses a directive which requires an inline type constructor, which is not supported by the current environment.`;
    }
    this._diagnostics.push(makeInlineDiagnostic(templateId, ErrorCode.INLINE_TYPE_CTOR_REQUIRED, node.name, message, directives.map((dir) => makeRelatedInformation(dir.name, `Requires an inline type constructor.`))));
  }
  suboptimalTypeInference(templateId, variables) {
    const mapping = this.resolver.getSourceMapping(templateId);
    let diagnosticVar = null;
    for (const variable of variables) {
      if (diagnosticVar === null || variable.value === "" || variable.value === "$implicit") {
        diagnosticVar = variable;
      }
    }
    if (diagnosticVar === null) {
      return;
    }
    let varIdentification = `'${diagnosticVar.name}'`;
    if (variables.length === 2) {
      varIdentification += ` (and 1 other)`;
    } else if (variables.length > 2) {
      varIdentification += ` (and ${variables.length - 1} others)`;
    }
    const message = `This structural directive supports advanced type inference, but the current compiler configuration prevents its usage. The variable ${varIdentification} will have type 'any' as a result.

Consider enabling the 'strictTemplates' option in your tsconfig.json for better type inference within this template.`;
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, diagnosticVar.keySpan, ts37.DiagnosticCategory.Suggestion, ngErrorCode(ErrorCode.SUGGEST_SUBOPTIMAL_TYPE_INFERENCE), message));
  }
  splitTwoWayBinding(templateId, input, output, inputConsumer, outputConsumer) {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `The property and event halves of the two-way binding '${input.name}' are not bound to the same target.
            Find more at https://angular.dev/guide/templates/two-way-binding#how-two-way-binding-works`;
    const relatedMessages = [];
    relatedMessages.push({
      text: `The property half of the binding is to the '${inputConsumer.name.text}' component.`,
      start: inputConsumer.name.getStart(),
      end: inputConsumer.name.getEnd(),
      sourceFile: inputConsumer.name.getSourceFile()
    });
    if (outputConsumer instanceof TmplAstElement) {
      let message = `The event half of the binding is to a native event called '${input.name}' on the <${outputConsumer.name}> DOM element.`;
      if (!mapping.node.getSourceFile().isDeclarationFile) {
        message += `
 
 Are you missing an output declaration called '${output.name}'?`;
      }
      relatedMessages.push({
        text: message,
        start: outputConsumer.sourceSpan.start.offset + 1,
        end: outputConsumer.sourceSpan.start.offset + outputConsumer.name.length + 1,
        sourceFile: mapping.node.getSourceFile()
      });
    } else {
      relatedMessages.push({
        text: `The event half of the binding is to the '${outputConsumer.name.text}' component.`,
        start: outputConsumer.name.getStart(),
        end: outputConsumer.name.getEnd(),
        sourceFile: outputConsumer.name.getSourceFile()
      });
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, input.keySpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.SPLIT_TWO_WAY_BINDING), errorMsg, relatedMessages));
  }
  missingRequiredInputs(templateId, element, directiveName, isComponent, inputAliases) {
    const message = `Required input${inputAliases.length === 1 ? "" : "s"} ${inputAliases.map((n2) => `'${n2}'`).join(", ")} from ${isComponent ? "component" : "directive"} ${directiveName} must be specified.`;
    this._diagnostics.push(makeTemplateDiagnostic(templateId, this.resolver.getSourceMapping(templateId), element.startSourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.MISSING_REQUIRED_INPUTS), message));
  }
  illegalForLoopTrackAccess(templateId, block, access) {
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, access.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property read.`);
    }
    const messageVars = [block.item, ...block.contextVariables.filter((v) => v.value === "$index")].map((v) => `'${v.name}'`).join(", ");
    const message = `Cannot access '${access.name}' inside of a track expression. Only ${messageVars} and properties on the containing component are available to this expression.`;
    this._diagnostics.push(makeTemplateDiagnostic(templateId, this.resolver.getSourceMapping(templateId), sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.ILLEGAL_FOR_LOOP_TRACK_ACCESS), message));
  }
  inaccessibleDeferredTriggerElement(templateId, trigger) {
    let message;
    if (trigger.reference === null) {
      message = `Trigger cannot find reference. Make sure that the @defer block has a @placeholder with at least one root element node.`;
    } else {
      message = `Trigger cannot find reference "${trigger.reference}".
Check that an element with #${trigger.reference} exists in the same template and it's accessible from the @defer block.
Deferred blocks can only access triggers in same view, a parent embedded view or the root view of the @placeholder block.`;
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, this.resolver.getSourceMapping(templateId), trigger.sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT), message));
  }
  controlFlowPreventingContentProjection(templateId, category, projectionNode, componentName, slotSelector, controlFlowNode, preservesWhitespaces) {
    const blockName = controlFlowNode.nameSpan.toString().trim();
    const lines = [
      `Node matches the "${slotSelector}" slot of the "${componentName}" component, but will not be projected into the specific slot because the surrounding ${blockName} has more than one node at its root. To project the node in the right slot, you can:
`,
      `1. Wrap the content of the ${blockName} block in an <ng-container/> that matches the "${slotSelector}" selector.`,
      `2. Split the content of the ${blockName} block across multiple ${blockName} blocks such that each one only has a single projectable node at its root.`,
      `3. Remove all content from the ${blockName} block, except for the node being projected.`
    ];
    if (preservesWhitespaces) {
      lines.push("Note: the host component has `preserveWhitespaces: true` which may cause whitespace to affect content projection.");
    }
    lines.push("", 'This check can be disabled using the `extendedDiagnostics.checks.controlFlowPreventingContentProjection = "suppress" compiler option.`');
    this._diagnostics.push(makeTemplateDiagnostic(templateId, this.resolver.getSourceMapping(templateId), projectionNode.startSourceSpan, category, ngErrorCode(ErrorCode.CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION), lines.join("\n")));
  }
  illegalWriteToLetDeclaration(templateId, node, target) {
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, node.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property write.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, this.resolver.getSourceMapping(templateId), sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.ILLEGAL_LET_WRITE), `Cannot assign to @let declaration '${target.name}'.`));
  }
  letUsedBeforeDefinition(templateId, node, target) {
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, node.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property read.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(templateId, this.resolver.getSourceMapping(templateId), sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.LET_USED_BEFORE_DEFINITION), `Cannot read @let declaration '${target.name}' before it has been defined.`));
  }
  conflictingDeclaration(templateId, decl) {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Cannot declare @let called '${decl.name}' as there is another symbol in the template with the same name.`;
    this._diagnostics.push(makeTemplateDiagnostic(templateId, mapping, decl.sourceSpan, ts37.DiagnosticCategory.Error, ngErrorCode(ErrorCode.CONFLICTING_LET_DECLARATION), errorMsg));
  }
};
function makeInlineDiagnostic(templateId, code, node, messageText, relatedInformation) {
  return {
    ...makeDiagnostic(code, node, messageText, relatedInformation),
    componentFile: node.getSourceFile(),
    templateId
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/shim.mjs
import ts38 from "typescript";
var TypeCheckShimGenerator = class {
  extensionPrefix = "ngtypecheck";
  shouldEmit = false;
  generateShimForFile(sf, genFilePath, priorShimSf) {
    if (priorShimSf !== null) {
      return priorShimSf;
    }
    return ts38.createSourceFile(genFilePath, "export const USED_FOR_NG_TYPE_CHECKING = true;", ts38.ScriptTarget.Latest, true, ts38.ScriptKind.TS);
  }
  static shimFor(fileName) {
    return absoluteFrom(fileName.replace(/\.tsx?$/, ".ngtypecheck.ts"));
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/type_check_block.mjs
import { BindingPipe, BindingType, Call as Call2, createCssSelectorFromNode, CssSelector as CssSelector2, DYNAMIC_TYPE, ImplicitReceiver as ImplicitReceiver2, ParsedEventType, PropertyRead as PropertyRead3, PropertyWrite as PropertyWrite2, R3Identifiers as R3Identifiers4, SafeCall, SafePropertyRead as SafePropertyRead3, SelectorMatcher as SelectorMatcher2, ThisReceiver, TmplAstBoundAttribute, TmplAstBoundText, TmplAstContent, TmplAstDeferredBlock, TmplAstElement as TmplAstElement2, TmplAstForLoopBlock, TmplAstIcu, TmplAstIfBlock, TmplAstIfBlockBranch, TmplAstLetDeclaration as TmplAstLetDeclaration2, TmplAstReference as TmplAstReference2, TmplAstSwitchBlock, TmplAstTemplate, TmplAstText, TmplAstTextAttribute as TmplAstTextAttribute2, TmplAstVariable, TransplantedType } from "@angular/compiler";
import ts41 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/diagnostics.mjs
import { AbsoluteSourceSpan as AbsoluteSourceSpan3 } from "@angular/compiler";
import ts39 from "typescript";
function wrapForDiagnostics(expr) {
  return ts39.factory.createParenthesizedExpression(expr);
}
function wrapForTypeChecker(expr) {
  return ts39.factory.createParenthesizedExpression(expr);
}
function addParseSpanInfo(node, span) {
  let commentText;
  if (span instanceof AbsoluteSourceSpan3) {
    commentText = `${span.start},${span.end}`;
  } else {
    commentText = `${span.start.offset},${span.end.offset}`;
  }
  ts39.addSyntheticTrailingComment(
    node,
    ts39.SyntaxKind.MultiLineCommentTrivia,
    commentText,
    false
  );
}
function addTemplateId(tcb, id) {
  ts39.addSyntheticLeadingComment(tcb, ts39.SyntaxKind.MultiLineCommentTrivia, id, true);
}
function shouldReportDiagnostic(diagnostic) {
  const { code } = diagnostic;
  if (code === 6133) {
    return false;
  } else if (code === 6199) {
    return false;
  } else if (code === 2695) {
    return false;
  } else if (code === 7006) {
    return false;
  }
  return true;
}
function translateDiagnostic(diagnostic, resolver) {
  if (diagnostic.file === void 0 || diagnostic.start === void 0) {
    return null;
  }
  const fullMapping = getTemplateMapping(
    diagnostic.file,
    diagnostic.start,
    resolver,
    true
  );
  if (fullMapping === null) {
    return null;
  }
  const { sourceLocation, templateSourceMapping, span } = fullMapping;
  return makeTemplateDiagnostic(sourceLocation.id, templateSourceMapping, span, diagnostic.category, diagnostic.code, diagnostic.messageText);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/expression.mjs
import { ASTWithSource, Call, EmptyExpr as EmptyExpr2, PropertyRead as PropertyRead2, SafeKeyedRead, SafePropertyRead as SafePropertyRead2 } from "@angular/compiler";
import ts40 from "typescript";
var ANY_EXPRESSION = ts40.factory.createAsExpression(ts40.factory.createNumericLiteral("0"), ts40.factory.createKeywordTypeNode(ts40.SyntaxKind.AnyKeyword));
var UNDEFINED = ts40.factory.createIdentifier("undefined");
var UNARY_OPS = /* @__PURE__ */ new Map([
  ["+", ts40.SyntaxKind.PlusToken],
  ["-", ts40.SyntaxKind.MinusToken]
]);
var BINARY_OPS = /* @__PURE__ */ new Map([
  ["+", ts40.SyntaxKind.PlusToken],
  ["-", ts40.SyntaxKind.MinusToken],
  ["<", ts40.SyntaxKind.LessThanToken],
  [">", ts40.SyntaxKind.GreaterThanToken],
  ["<=", ts40.SyntaxKind.LessThanEqualsToken],
  [">=", ts40.SyntaxKind.GreaterThanEqualsToken],
  ["==", ts40.SyntaxKind.EqualsEqualsToken],
  ["===", ts40.SyntaxKind.EqualsEqualsEqualsToken],
  ["*", ts40.SyntaxKind.AsteriskToken],
  ["/", ts40.SyntaxKind.SlashToken],
  ["%", ts40.SyntaxKind.PercentToken],
  ["!=", ts40.SyntaxKind.ExclamationEqualsToken],
  ["!==", ts40.SyntaxKind.ExclamationEqualsEqualsToken],
  ["||", ts40.SyntaxKind.BarBarToken],
  ["&&", ts40.SyntaxKind.AmpersandAmpersandToken],
  ["&", ts40.SyntaxKind.AmpersandToken],
  ["|", ts40.SyntaxKind.BarToken],
  ["??", ts40.SyntaxKind.QuestionQuestionToken]
]);
function astToTypescript(ast, maybeResolve, config) {
  const translator = new AstTranslator(maybeResolve, config);
  return translator.translate(ast);
}
var AstTranslator = class {
  maybeResolve;
  config;
  constructor(maybeResolve, config) {
    this.maybeResolve = maybeResolve;
    this.config = config;
  }
  translate(ast) {
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }
    if (ast instanceof EmptyExpr2) {
      const res = ts40.factory.createIdentifier("undefined");
      addParseSpanInfo(res, ast.sourceSpan);
      return res;
    }
    const resolved = this.maybeResolve(ast);
    if (resolved !== null) {
      return resolved;
    }
    return ast.visit(this);
  }
  visitUnary(ast) {
    const expr = this.translate(ast.expr);
    const op = UNARY_OPS.get(ast.operator);
    if (op === void 0) {
      throw new Error(`Unsupported Unary.operator: ${ast.operator}`);
    }
    const node = wrapForDiagnostics(ts40.factory.createPrefixUnaryExpression(op, expr));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitBinary(ast) {
    const lhs = wrapForDiagnostics(this.translate(ast.left));
    const rhs = wrapForDiagnostics(this.translate(ast.right));
    const op = BINARY_OPS.get(ast.operation);
    if (op === void 0) {
      throw new Error(`Unsupported Binary.operation: ${ast.operation}`);
    }
    const node = ts40.factory.createBinaryExpression(lhs, op, rhs);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitChain(ast) {
    const elements = ast.expressions.map((expr) => this.translate(expr));
    const node = wrapForDiagnostics(ts40.factory.createCommaListExpression(elements));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitConditional(ast) {
    const condExpr = this.translate(ast.condition);
    const trueExpr = this.translate(ast.trueExp);
    const falseExpr = wrapForTypeChecker(this.translate(ast.falseExp));
    const node = ts40.factory.createParenthesizedExpression(ts40.factory.createConditionalExpression(condExpr, void 0, trueExpr, void 0, falseExpr));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitImplicitReceiver(ast) {
    throw new Error("Method not implemented.");
  }
  visitThisReceiver(ast) {
    throw new Error("Method not implemented.");
  }
  visitInterpolation(ast) {
    return ast.expressions.reduce((lhs, ast2) => ts40.factory.createBinaryExpression(lhs, ts40.SyntaxKind.PlusToken, wrapForTypeChecker(this.translate(ast2))), ts40.factory.createStringLiteral(""));
  }
  visitKeyedRead(ast) {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const key = this.translate(ast.key);
    const node = ts40.factory.createElementAccessExpression(receiver, key);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitKeyedWrite(ast) {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const left = ts40.factory.createElementAccessExpression(receiver, this.translate(ast.key));
    const right = wrapForTypeChecker(this.translate(ast.value));
    const node = wrapForDiagnostics(ts40.factory.createBinaryExpression(left, ts40.SyntaxKind.EqualsToken, right));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitLiteralArray(ast) {
    const elements = ast.expressions.map((expr) => this.translate(expr));
    const literal3 = ts40.factory.createArrayLiteralExpression(elements);
    const node = this.config.strictLiteralTypes ? literal3 : tsCastToAny(literal3);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitLiteralMap(ast) {
    const properties = ast.keys.map(({ key }, idx) => {
      const value = this.translate(ast.values[idx]);
      return ts40.factory.createPropertyAssignment(ts40.factory.createStringLiteral(key), value);
    });
    const literal3 = ts40.factory.createObjectLiteralExpression(properties, true);
    const node = this.config.strictLiteralTypes ? literal3 : tsCastToAny(literal3);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitLiteralPrimitive(ast) {
    let node;
    if (ast.value === void 0) {
      node = ts40.factory.createIdentifier("undefined");
    } else if (ast.value === null) {
      node = ts40.factory.createNull();
    } else if (typeof ast.value === "string") {
      node = ts40.factory.createStringLiteral(ast.value);
    } else if (typeof ast.value === "number") {
      node = tsNumericExpression(ast.value);
    } else if (typeof ast.value === "boolean") {
      node = ast.value ? ts40.factory.createTrue() : ts40.factory.createFalse();
    } else {
      throw Error(`Unsupported AST value of type ${typeof ast.value}`);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitNonNullAssert(ast) {
    const expr = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts40.factory.createNonNullExpression(expr);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitPipe(ast) {
    throw new Error("Method not implemented.");
  }
  visitPrefixNot(ast) {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts40.factory.createLogicalNot(expression);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitTypeofExpression(ast) {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts40.factory.createTypeOfExpression(expression);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitPropertyRead(ast) {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const name = ts40.factory.createPropertyAccessExpression(receiver, ast.name);
    addParseSpanInfo(name, ast.nameSpan);
    const node = wrapForDiagnostics(name);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitPropertyWrite(ast) {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const left = ts40.factory.createPropertyAccessExpression(receiver, ast.name);
    addParseSpanInfo(left, ast.nameSpan);
    const leftWithPath = wrapForDiagnostics(left);
    addParseSpanInfo(leftWithPath, ast.sourceSpan);
    const right = wrapForTypeChecker(this.translate(ast.value));
    const node = wrapForDiagnostics(ts40.factory.createBinaryExpression(leftWithPath, ts40.SyntaxKind.EqualsToken, right));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitSafePropertyRead(ast) {
    let node;
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    if (this.config.strictSafeNavigationTypes) {
      const expr = ts40.factory.createPropertyAccessExpression(ts40.factory.createNonNullExpression(receiver), ast.name);
      addParseSpanInfo(expr, ast.nameSpan);
      node = ts40.factory.createParenthesizedExpression(ts40.factory.createConditionalExpression(ANY_EXPRESSION, void 0, expr, void 0, UNDEFINED));
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      node = ts40.factory.createPropertyAccessExpression(tsCastToAny(receiver), ast.name);
    } else {
      const expr = ts40.factory.createPropertyAccessExpression(ts40.factory.createNonNullExpression(receiver), ast.name);
      addParseSpanInfo(expr, ast.nameSpan);
      node = tsCastToAny(expr);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitSafeKeyedRead(ast) {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const key = this.translate(ast.key);
    let node;
    if (this.config.strictSafeNavigationTypes) {
      const expr = ts40.factory.createElementAccessExpression(ts40.factory.createNonNullExpression(receiver), key);
      addParseSpanInfo(expr, ast.sourceSpan);
      node = ts40.factory.createParenthesizedExpression(ts40.factory.createConditionalExpression(ANY_EXPRESSION, void 0, expr, void 0, UNDEFINED));
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      node = ts40.factory.createElementAccessExpression(tsCastToAny(receiver), key);
    } else {
      const expr = ts40.factory.createElementAccessExpression(ts40.factory.createNonNullExpression(receiver), key);
      addParseSpanInfo(expr, ast.sourceSpan);
      node = tsCastToAny(expr);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitCall(ast) {
    const args = ast.args.map((expr2) => this.translate(expr2));
    let expr;
    const receiver = ast.receiver;
    if (receiver instanceof PropertyRead2) {
      const resolved = this.maybeResolve(receiver);
      if (resolved !== null) {
        expr = resolved;
      } else {
        const propertyReceiver = wrapForDiagnostics(this.translate(receiver.receiver));
        expr = ts40.factory.createPropertyAccessExpression(propertyReceiver, receiver.name);
        addParseSpanInfo(expr, receiver.nameSpan);
      }
    } else {
      expr = this.translate(receiver);
    }
    let node;
    if (ast.receiver instanceof SafePropertyRead2 || ast.receiver instanceof SafeKeyedRead) {
      node = this.convertToSafeCall(ast, expr, args);
    } else {
      node = ts40.factory.createCallExpression(expr, void 0, args);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  visitSafeCall(ast) {
    const args = ast.args.map((expr2) => this.translate(expr2));
    const expr = wrapForDiagnostics(this.translate(ast.receiver));
    const node = this.convertToSafeCall(ast, expr, args);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
  convertToSafeCall(ast, expr, args) {
    if (this.config.strictSafeNavigationTypes) {
      const call = ts40.factory.createCallExpression(ts40.factory.createNonNullExpression(expr), void 0, args);
      return ts40.factory.createParenthesizedExpression(ts40.factory.createConditionalExpression(ANY_EXPRESSION, void 0, call, void 0, UNDEFINED));
    }
    if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      return ts40.factory.createCallExpression(tsCastToAny(expr), void 0, args);
    }
    return tsCastToAny(ts40.factory.createCallExpression(ts40.factory.createNonNullExpression(expr), void 0, args));
  }
};
var _VeSafeLhsInferenceBugDetector = class {
  static veWillInferAnyFor(ast) {
    const visitor = _VeSafeLhsInferenceBugDetector.SINGLETON;
    return ast instanceof Call ? ast.visit(visitor) : ast.receiver.visit(visitor);
  }
  visitUnary(ast) {
    return ast.expr.visit(this);
  }
  visitBinary(ast) {
    return ast.left.visit(this) || ast.right.visit(this);
  }
  visitChain(ast) {
    return false;
  }
  visitConditional(ast) {
    return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
  }
  visitCall(ast) {
    return true;
  }
  visitSafeCall(ast) {
    return false;
  }
  visitImplicitReceiver(ast) {
    return false;
  }
  visitThisReceiver(ast) {
    return false;
  }
  visitInterpolation(ast) {
    return ast.expressions.some((exp) => exp.visit(this));
  }
  visitKeyedRead(ast) {
    return false;
  }
  visitKeyedWrite(ast) {
    return false;
  }
  visitLiteralArray(ast) {
    return true;
  }
  visitLiteralMap(ast) {
    return true;
  }
  visitLiteralPrimitive(ast) {
    return false;
  }
  visitPipe(ast) {
    return true;
  }
  visitPrefixNot(ast) {
    return ast.expression.visit(this);
  }
  visitTypeofExpression(ast) {
    return ast.expression.visit(this);
  }
  visitNonNullAssert(ast) {
    return ast.expression.visit(this);
  }
  visitPropertyRead(ast) {
    return false;
  }
  visitPropertyWrite(ast) {
    return false;
  }
  visitSafePropertyRead(ast) {
    return false;
  }
  visitSafeKeyedRead(ast) {
    return false;
  }
};
var VeSafeLhsInferenceBugDetector = _VeSafeLhsInferenceBugDetector;
__publicField(VeSafeLhsInferenceBugDetector, "SINGLETON", new _VeSafeLhsInferenceBugDetector());

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/type_check_block.mjs
var TcbGenericContextBehavior;
(function(TcbGenericContextBehavior2) {
  TcbGenericContextBehavior2[TcbGenericContextBehavior2["UseEmitter"] = 0] = "UseEmitter";
  TcbGenericContextBehavior2[TcbGenericContextBehavior2["CopyClassNodes"] = 1] = "CopyClassNodes";
  TcbGenericContextBehavior2[TcbGenericContextBehavior2["FallbackToAny"] = 2] = "FallbackToAny";
})(TcbGenericContextBehavior || (TcbGenericContextBehavior = {}));
function generateTypeCheckBlock(env, ref, name, meta, domSchemaChecker, oobRecorder, genericContextBehavior) {
  const tcb = new Context(env, domSchemaChecker, oobRecorder, meta.id, meta.boundTarget, meta.pipes, meta.schemas, meta.isStandalone, meta.preserveWhitespaces);
  const scope = Scope.forNodes(tcb, null, null, tcb.boundTarget.target.template, null);
  const ctxRawType = env.referenceType(ref);
  if (!ts41.isTypeReferenceNode(ctxRawType)) {
    throw new Error(`Expected TypeReferenceNode when referencing the ctx param for ${ref.debugName}`);
  }
  let typeParameters = void 0;
  let typeArguments = void 0;
  if (ref.node.typeParameters !== void 0) {
    if (!env.config.useContextGenericType) {
      genericContextBehavior = TcbGenericContextBehavior.FallbackToAny;
    }
    switch (genericContextBehavior) {
      case TcbGenericContextBehavior.UseEmitter:
        typeParameters = new TypeParameterEmitter(ref.node.typeParameters, env.reflector).emit((typeRef) => env.referenceType(typeRef));
        typeArguments = typeParameters.map((param) => ts41.factory.createTypeReferenceNode(param.name));
        break;
      case TcbGenericContextBehavior.CopyClassNodes:
        typeParameters = [...ref.node.typeParameters];
        typeArguments = typeParameters.map((param) => ts41.factory.createTypeReferenceNode(param.name));
        break;
      case TcbGenericContextBehavior.FallbackToAny:
        typeArguments = ref.node.typeParameters.map(() => ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
        break;
    }
  }
  const paramList = [tcbThisParam(ctxRawType.typeName, typeArguments)];
  const scopeStatements = scope.render();
  const innerBody = ts41.factory.createBlock([...env.getPreludeStatements(), ...scopeStatements]);
  const body = ts41.factory.createBlock([
    ts41.factory.createIfStatement(ts41.factory.createTrue(), innerBody, void 0)
  ]);
  const fnDecl = ts41.factory.createFunctionDeclaration(
    void 0,
    void 0,
    name,
    env.config.useContextGenericType ? typeParameters : void 0,
    paramList,
    void 0,
    body
  );
  addTemplateId(fnDecl, meta.id);
  return fnDecl;
}
var TcbOp = class {
  circularFallback() {
    return INFER_TYPE_FOR_CIRCULAR_OP_EXPR;
  }
};
var TcbElementOp = class extends TcbOp {
  tcb;
  scope;
  element;
  constructor(tcb, scope, element) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.element = element;
  }
  get optional() {
    return true;
  }
  execute() {
    const id = this.tcb.allocateId();
    const initializer = tsCreateElement(this.element.name);
    addParseSpanInfo(initializer, this.element.startSourceSpan || this.element.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
};
var TcbTemplateVariableOp = class extends TcbOp {
  tcb;
  scope;
  template;
  variable;
  constructor(tcb, scope, template, variable) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.template = template;
    this.variable = variable;
  }
  get optional() {
    return false;
  }
  execute() {
    const ctx = this.scope.resolve(this.template);
    const id = this.tcb.allocateId();
    const initializer = ts41.factory.createPropertyAccessExpression(
      ctx,
      this.variable.value || "$implicit"
    );
    addParseSpanInfo(id, this.variable.keySpan);
    let variable;
    if (this.variable.valueSpan !== void 0) {
      addParseSpanInfo(initializer, this.variable.valueSpan);
      variable = tsCreateVariable(id, wrapForTypeChecker(initializer));
    } else {
      variable = tsCreateVariable(id, initializer);
    }
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
};
var TcbTemplateContextOp = class extends TcbOp {
  tcb;
  scope;
  constructor(tcb, scope) {
    super();
    this.tcb = tcb;
    this.scope = scope;
  }
  optional = true;
  execute() {
    const ctx = this.tcb.allocateId();
    const type = ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword);
    this.scope.addStatement(tsDeclareVariable(ctx, type));
    return ctx;
  }
};
var TcbLetDeclarationOp = class extends TcbOp {
  tcb;
  scope;
  node;
  constructor(tcb, scope, node) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
  }
  optional = false;
  execute() {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.node.nameSpan);
    const value = tcbExpression(this.node.value, this.tcb, this.scope);
    const varStatement = tsCreateVariable(id, wrapForTypeChecker(value), ts41.NodeFlags.Const);
    addParseSpanInfo(varStatement.declarationList.declarations[0], this.node.sourceSpan);
    this.scope.addStatement(varStatement);
    return id;
  }
};
var TcbTemplateBodyOp = class extends TcbOp {
  tcb;
  scope;
  template;
  constructor(tcb, scope, template) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.template = template;
  }
  get optional() {
    return false;
  }
  execute() {
    const directiveGuards = [];
    const directives = this.tcb.boundTarget.getDirectivesOfNode(this.template);
    if (directives !== null) {
      for (const dir of directives) {
        const dirInstId = this.scope.resolve(this.template, dir);
        const dirId = this.tcb.env.reference(dir.ref);
        dir.ngTemplateGuards.forEach((guard2) => {
          const boundInput = this.template.inputs.find((i) => i.name === guard2.inputName) || this.template.templateAttrs.find((i) => i instanceof TmplAstBoundAttribute && i.name === guard2.inputName);
          if (boundInput !== void 0) {
            const expr = tcbExpression(boundInput.value, this.tcb, this.scope);
            markIgnoreDiagnostics(expr);
            if (guard2.type === "binding") {
              directiveGuards.push(expr);
            } else {
              const guardInvoke = tsCallMethod(dirId, `ngTemplateGuard_${guard2.inputName}`, [
                dirInstId,
                expr
              ]);
              addParseSpanInfo(guardInvoke, boundInput.value.sourceSpan);
              directiveGuards.push(guardInvoke);
            }
          }
        });
        if (dir.hasNgTemplateContextGuard) {
          if (this.tcb.env.config.applyTemplateContextGuards) {
            const ctx = this.scope.resolve(this.template);
            const guardInvoke = tsCallMethod(dirId, "ngTemplateContextGuard", [dirInstId, ctx]);
            addParseSpanInfo(guardInvoke, this.template.sourceSpan);
            directiveGuards.push(guardInvoke);
          } else if (this.template.variables.length > 0 && this.tcb.env.config.suggestionsForSuboptimalTypeInference) {
            this.tcb.oobRecorder.suboptimalTypeInference(this.tcb.id, this.template.variables);
          }
        }
      }
    }
    let guard = null;
    if (directiveGuards.length > 0) {
      guard = directiveGuards.reduce((expr, dirGuard) => ts41.factory.createBinaryExpression(expr, ts41.SyntaxKind.AmpersandAmpersandToken, dirGuard), directiveGuards.pop());
    }
    const tmplScope = Scope.forNodes(this.tcb, this.scope, this.template, this.template.children, guard);
    const statements = tmplScope.render();
    if (statements.length === 0) {
      return null;
    }
    let tmplBlock = ts41.factory.createBlock(statements);
    if (guard !== null) {
      tmplBlock = ts41.factory.createIfStatement(
        guard,
        tmplBlock
      );
    }
    this.scope.addStatement(tmplBlock);
    return null;
  }
};
var TcbExpressionOp = class extends TcbOp {
  tcb;
  scope;
  expression;
  constructor(tcb, scope, expression) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.expression = expression;
  }
  get optional() {
    return false;
  }
  execute() {
    const expr = tcbExpression(this.expression, this.tcb, this.scope);
    this.scope.addStatement(ts41.factory.createExpressionStatement(expr));
    return null;
  }
};
var TcbDirectiveTypeOpBase = class extends TcbOp {
  tcb;
  scope;
  node;
  dir;
  constructor(tcb, scope, node, dir) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
    this.dir = dir;
  }
  get optional() {
    return true;
  }
  execute() {
    const dirRef = this.dir.ref;
    const rawType = this.tcb.env.referenceType(this.dir.ref);
    let type;
    if (this.dir.isGeneric === false || dirRef.node.typeParameters === void 0) {
      type = rawType;
    } else {
      if (!ts41.isTypeReferenceNode(rawType)) {
        throw new Error(`Expected TypeReferenceNode when referencing the type for ${this.dir.ref.debugName}`);
      }
      const typeArguments = dirRef.node.typeParameters.map(() => ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
      type = ts41.factory.createTypeReferenceNode(rawType.typeName, typeArguments);
    }
    const id = this.tcb.allocateId();
    addExpressionIdentifier(id, ExpressionIdentifier.DIRECTIVE);
    addParseSpanInfo(id, this.node.startSourceSpan || this.node.sourceSpan);
    this.scope.addStatement(tsDeclareVariable(id, type));
    return id;
  }
};
var TcbNonGenericDirectiveTypeOp = class extends TcbDirectiveTypeOpBase {
  execute() {
    const dirRef = this.dir.ref;
    if (this.dir.isGeneric) {
      throw new Error(`Assertion Error: expected ${dirRef.debugName} not to be generic.`);
    }
    return super.execute();
  }
};
var TcbGenericDirectiveTypeWithAnyParamsOp = class extends TcbDirectiveTypeOpBase {
  execute() {
    const dirRef = this.dir.ref;
    if (dirRef.node.typeParameters === void 0) {
      throw new Error(`Assertion Error: expected typeParameters when creating a declaration for ${dirRef.debugName}`);
    }
    return super.execute();
  }
};
var TcbReferenceOp = class extends TcbOp {
  tcb;
  scope;
  node;
  host;
  target;
  constructor(tcb, scope, node, host, target) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
    this.host = host;
    this.target = target;
  }
  optional = true;
  execute() {
    const id = this.tcb.allocateId();
    let initializer = this.target instanceof TmplAstTemplate || this.target instanceof TmplAstElement2 ? this.scope.resolve(this.target) : this.scope.resolve(this.host, this.target);
    if (this.target instanceof TmplAstElement2 && !this.tcb.env.config.checkTypeOfDomReferences || !this.tcb.env.config.checkTypeOfNonDomReferences) {
      initializer = ts41.factory.createAsExpression(initializer, ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
    } else if (this.target instanceof TmplAstTemplate) {
      initializer = ts41.factory.createAsExpression(initializer, ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
      initializer = ts41.factory.createAsExpression(initializer, this.tcb.env.referenceExternalType("@angular/core", "TemplateRef", [DYNAMIC_TYPE]));
      initializer = ts41.factory.createParenthesizedExpression(initializer);
    }
    addParseSpanInfo(initializer, this.node.sourceSpan);
    addParseSpanInfo(id, this.node.keySpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
};
var TcbInvalidReferenceOp = class extends TcbOp {
  tcb;
  scope;
  constructor(tcb, scope) {
    super();
    this.tcb = tcb;
    this.scope = scope;
  }
  optional = true;
  execute() {
    const id = this.tcb.allocateId();
    this.scope.addStatement(tsCreateVariable(id, ANY_EXPRESSION));
    return id;
  }
};
var TcbDirectiveCtorOp = class extends TcbOp {
  tcb;
  scope;
  node;
  dir;
  constructor(tcb, scope, node, dir) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
    this.dir = dir;
  }
  get optional() {
    return true;
  }
  execute() {
    const id = this.tcb.allocateId();
    addExpressionIdentifier(id, ExpressionIdentifier.DIRECTIVE);
    addParseSpanInfo(id, this.node.startSourceSpan || this.node.sourceSpan);
    const genericInputs = /* @__PURE__ */ new Map();
    const boundAttrs = getBoundAttributes(this.dir, this.node);
    for (const attr of boundAttrs) {
      if (!this.tcb.env.config.checkTypeOfAttributes && attr.attribute instanceof TmplAstTextAttribute2) {
        continue;
      }
      for (const { fieldName, isTwoWayBinding } of attr.inputs) {
        if (genericInputs.has(fieldName)) {
          continue;
        }
        const expression = translateInput(attr.attribute, this.tcb, this.scope);
        genericInputs.set(fieldName, {
          type: "binding",
          field: fieldName,
          expression,
          sourceSpan: attr.attribute.sourceSpan,
          isTwoWayBinding
        });
      }
    }
    for (const { classPropertyName } of this.dir.inputs) {
      if (!genericInputs.has(classPropertyName)) {
        genericInputs.set(classPropertyName, { type: "unset", field: classPropertyName });
      }
    }
    const typeCtor = tcbCallTypeCtor(this.dir, this.tcb, Array.from(genericInputs.values()));
    markIgnoreDiagnostics(typeCtor);
    this.scope.addStatement(tsCreateVariable(id, typeCtor));
    return id;
  }
  circularFallback() {
    return new TcbDirectiveCtorCircularFallbackOp(this.tcb, this.scope, this.node, this.dir);
  }
};
var TcbDirectiveInputsOp = class extends TcbOp {
  tcb;
  scope;
  node;
  dir;
  constructor(tcb, scope, node, dir) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
    this.dir = dir;
  }
  get optional() {
    return false;
  }
  execute() {
    let dirId = null;
    const boundAttrs = getBoundAttributes(this.dir, this.node);
    const seenRequiredInputs = /* @__PURE__ */ new Set();
    for (const attr of boundAttrs) {
      const expr = widenBinding(translateInput(attr.attribute, this.tcb, this.scope), this.tcb);
      let assignment = wrapForDiagnostics(expr);
      for (const { fieldName, required, transformType, isSignal, isTwoWayBinding } of attr.inputs) {
        let target;
        if (required) {
          seenRequiredInputs.add(fieldName);
        }
        if (this.dir.coercedInputFields.has(fieldName)) {
          let type;
          if (transformType !== null) {
            type = this.tcb.env.referenceTransplantedType(new TransplantedType(transformType));
          } else {
            const dirTypeRef = this.tcb.env.referenceType(this.dir.ref);
            if (!ts41.isTypeReferenceNode(dirTypeRef)) {
              throw new Error(`Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`);
            }
            type = tsCreateTypeQueryForCoercedInput(dirTypeRef.typeName, fieldName);
          }
          const id = this.tcb.allocateId();
          this.scope.addStatement(tsDeclareVariable(id, type));
          target = id;
        } else if (this.dir.undeclaredInputFields.has(fieldName)) {
          continue;
        } else if (!this.tcb.env.config.honorAccessModifiersForInputBindings && this.dir.restrictedInputFields.has(fieldName)) {
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }
          const id = this.tcb.allocateId();
          const dirTypeRef = this.tcb.env.referenceType(this.dir.ref);
          if (!ts41.isTypeReferenceNode(dirTypeRef)) {
            throw new Error(`Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`);
          }
          const type = ts41.factory.createIndexedAccessTypeNode(ts41.factory.createTypeQueryNode(dirId), ts41.factory.createLiteralTypeNode(ts41.factory.createStringLiteral(fieldName)));
          const temp = tsDeclareVariable(id, type);
          this.scope.addStatement(temp);
          target = id;
        } else {
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }
          target = this.dir.stringLiteralInputFields.has(fieldName) ? ts41.factory.createElementAccessExpression(dirId, ts41.factory.createStringLiteral(fieldName)) : ts41.factory.createPropertyAccessExpression(dirId, ts41.factory.createIdentifier(fieldName));
        }
        if (isSignal) {
          const inputSignalBrandWriteSymbol = this.tcb.env.referenceExternalSymbol(R3Identifiers4.InputSignalBrandWriteType.moduleName, R3Identifiers4.InputSignalBrandWriteType.name);
          if (!ts41.isIdentifier(inputSignalBrandWriteSymbol) && !ts41.isPropertyAccessExpression(inputSignalBrandWriteSymbol)) {
            throw new Error(`Expected identifier or property access for reference to ${R3Identifiers4.InputSignalBrandWriteType.name}`);
          }
          target = ts41.factory.createElementAccessExpression(target, inputSignalBrandWriteSymbol);
        }
        if (attr.attribute.keySpan !== void 0) {
          addParseSpanInfo(target, attr.attribute.keySpan);
        }
        if (isTwoWayBinding && this.tcb.env.config.allowSignalsInTwoWayBindings) {
          assignment = unwrapWritableSignal(assignment, this.tcb);
        }
        assignment = ts41.factory.createBinaryExpression(target, ts41.SyntaxKind.EqualsToken, assignment);
      }
      addParseSpanInfo(assignment, attr.attribute.sourceSpan);
      if (!this.tcb.env.config.checkTypeOfAttributes && attr.attribute instanceof TmplAstTextAttribute2) {
        markIgnoreDiagnostics(assignment);
      }
      this.scope.addStatement(ts41.factory.createExpressionStatement(assignment));
    }
    this.checkRequiredInputs(seenRequiredInputs);
    return null;
  }
  checkRequiredInputs(seenRequiredInputs) {
    const missing = [];
    for (const input of this.dir.inputs) {
      if (input.required && !seenRequiredInputs.has(input.classPropertyName)) {
        missing.push(input.bindingPropertyName);
      }
    }
    if (missing.length > 0) {
      this.tcb.oobRecorder.missingRequiredInputs(this.tcb.id, this.node, this.dir.name, this.dir.isComponent, missing);
    }
  }
};
var TcbDirectiveCtorCircularFallbackOp = class extends TcbOp {
  tcb;
  scope;
  node;
  dir;
  constructor(tcb, scope, node, dir) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
    this.dir = dir;
  }
  get optional() {
    return false;
  }
  execute() {
    const id = this.tcb.allocateId();
    const typeCtor = this.tcb.env.typeCtorFor(this.dir);
    const circularPlaceholder = ts41.factory.createCallExpression(
      typeCtor,
      void 0,
      [ts41.factory.createNonNullExpression(ts41.factory.createNull())]
    );
    this.scope.addStatement(tsCreateVariable(id, circularPlaceholder));
    return id;
  }
};
var TcbDomSchemaCheckerOp = class extends TcbOp {
  tcb;
  element;
  checkElement;
  claimedInputs;
  constructor(tcb, element, checkElement, claimedInputs) {
    super();
    this.tcb = tcb;
    this.element = element;
    this.checkElement = checkElement;
    this.claimedInputs = claimedInputs;
  }
  get optional() {
    return false;
  }
  execute() {
    var _a;
    if (this.checkElement) {
      this.tcb.domSchemaChecker.checkElement(this.tcb.id, this.element, this.tcb.schemas, this.tcb.hostIsStandalone);
    }
    for (const binding of this.element.inputs) {
      const isPropertyBinding = binding.type === BindingType.Property || binding.type === BindingType.TwoWay;
      if (isPropertyBinding && this.claimedInputs.has(binding.name)) {
        continue;
      }
      if (isPropertyBinding && binding.name !== "style" && binding.name !== "class") {
        const propertyName = (_a = ATTR_TO_PROP.get(binding.name)) != null ? _a : binding.name;
        this.tcb.domSchemaChecker.checkProperty(this.tcb.id, this.element, propertyName, binding.sourceSpan, this.tcb.schemas, this.tcb.hostIsStandalone);
      }
    }
    return null;
  }
};
var TcbControlFlowContentProjectionOp = class extends TcbOp {
  tcb;
  element;
  ngContentSelectors;
  componentName;
  category;
  constructor(tcb, element, ngContentSelectors, componentName) {
    super();
    this.tcb = tcb;
    this.element = element;
    this.ngContentSelectors = ngContentSelectors;
    this.componentName = componentName;
    this.category = tcb.env.config.controlFlowPreventingContentProjection === "error" ? ts41.DiagnosticCategory.Error : ts41.DiagnosticCategory.Warning;
  }
  optional = false;
  execute() {
    const controlFlowToCheck = this.findPotentialControlFlowNodes();
    if (controlFlowToCheck.length > 0) {
      const matcher = new SelectorMatcher2();
      for (const selector of this.ngContentSelectors) {
        if (selector !== "*") {
          matcher.addSelectables(CssSelector2.parse(selector), selector);
        }
      }
      for (const root of controlFlowToCheck) {
        for (const child of root.children) {
          if (child instanceof TmplAstElement2 || child instanceof TmplAstTemplate) {
            matcher.match(createCssSelectorFromNode(child), (_, originalSelector) => {
              this.tcb.oobRecorder.controlFlowPreventingContentProjection(this.tcb.id, this.category, child, this.componentName, originalSelector, root, this.tcb.hostPreserveWhitespaces);
            });
          }
        }
      }
    }
    return null;
  }
  findPotentialControlFlowNodes() {
    const result = [];
    for (const child of this.element.children) {
      if (child instanceof TmplAstForLoopBlock) {
        if (this.shouldCheck(child)) {
          result.push(child);
        }
        if (child.empty !== null && this.shouldCheck(child.empty)) {
          result.push(child.empty);
        }
      } else if (child instanceof TmplAstIfBlock) {
        for (const branch of child.branches) {
          if (this.shouldCheck(branch)) {
            result.push(branch);
          }
        }
      } else if (child instanceof TmplAstSwitchBlock) {
        for (const current of child.cases) {
          if (this.shouldCheck(current)) {
            result.push(current);
          }
        }
      }
    }
    return result;
  }
  shouldCheck(node) {
    if (node.children.length < 2) {
      return false;
    }
    let hasSeenRootNode = false;
    for (const child of node.children) {
      if (!(child instanceof TmplAstText) || this.tcb.hostPreserveWhitespaces || child.value.trim().length > 0) {
        if (hasSeenRootNode) {
          return true;
        }
        hasSeenRootNode = true;
      }
    }
    return false;
  }
};
var ATTR_TO_PROP = new Map(Object.entries({
  "class": "className",
  "for": "htmlFor",
  "formaction": "formAction",
  "innerHtml": "innerHTML",
  "readonly": "readOnly",
  "tabindex": "tabIndex"
}));
var TcbUnclaimedInputsOp = class extends TcbOp {
  tcb;
  scope;
  element;
  claimedInputs;
  constructor(tcb, scope, element, claimedInputs) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.element = element;
    this.claimedInputs = claimedInputs;
  }
  get optional() {
    return false;
  }
  execute() {
    var _a;
    let elId = null;
    for (const binding of this.element.inputs) {
      const isPropertyBinding = binding.type === BindingType.Property || binding.type === BindingType.TwoWay;
      if (isPropertyBinding && this.claimedInputs.has(binding.name)) {
        continue;
      }
      const expr = widenBinding(tcbExpression(binding.value, this.tcb, this.scope), this.tcb);
      if (this.tcb.env.config.checkTypeOfDomBindings && isPropertyBinding) {
        if (binding.name !== "style" && binding.name !== "class") {
          if (elId === null) {
            elId = this.scope.resolve(this.element);
          }
          const propertyName = (_a = ATTR_TO_PROP.get(binding.name)) != null ? _a : binding.name;
          const prop = ts41.factory.createElementAccessExpression(elId, ts41.factory.createStringLiteral(propertyName));
          const stmt = ts41.factory.createBinaryExpression(prop, ts41.SyntaxKind.EqualsToken, wrapForDiagnostics(expr));
          addParseSpanInfo(stmt, binding.sourceSpan);
          this.scope.addStatement(ts41.factory.createExpressionStatement(stmt));
        } else {
          this.scope.addStatement(ts41.factory.createExpressionStatement(expr));
        }
      } else {
        this.scope.addStatement(ts41.factory.createExpressionStatement(expr));
      }
    }
    return null;
  }
};
var TcbDirectiveOutputsOp = class extends TcbOp {
  tcb;
  scope;
  node;
  dir;
  constructor(tcb, scope, node, dir) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.node = node;
    this.dir = dir;
  }
  get optional() {
    return false;
  }
  execute() {
    let dirId = null;
    const outputs = this.dir.outputs;
    for (const output of this.node.outputs) {
      if (output.type === ParsedEventType.Animation || !outputs.hasBindingPropertyName(output.name)) {
        continue;
      }
      if (this.tcb.env.config.checkTypeOfOutputEvents && output.name.endsWith("Change")) {
        const inputName = output.name.slice(0, -6);
        checkSplitTwoWayBinding(inputName, output, this.node.inputs, this.tcb);
      }
      const field = outputs.getByBindingPropertyName(output.name)[0].classPropertyName;
      if (dirId === null) {
        dirId = this.scope.resolve(this.node, this.dir);
      }
      const outputField = ts41.factory.createElementAccessExpression(dirId, ts41.factory.createStringLiteral(field));
      addParseSpanInfo(outputField, output.keySpan);
      if (this.tcb.env.config.checkTypeOfOutputEvents) {
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, 0);
        const subscribeFn = ts41.factory.createPropertyAccessExpression(outputField, "subscribe");
        const call = ts41.factory.createCallExpression(subscribeFn, void 0, [
          handler
        ]);
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts41.factory.createExpressionStatement(call));
      } else {
        this.scope.addStatement(ts41.factory.createExpressionStatement(outputField));
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, 1);
        this.scope.addStatement(ts41.factory.createExpressionStatement(handler));
      }
    }
    return null;
  }
};
var TcbUnclaimedOutputsOp = class extends TcbOp {
  tcb;
  scope;
  element;
  claimedOutputs;
  constructor(tcb, scope, element, claimedOutputs) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.element = element;
    this.claimedOutputs = claimedOutputs;
  }
  get optional() {
    return false;
  }
  execute() {
    let elId = null;
    for (const output of this.element.outputs) {
      if (this.claimedOutputs.has(output.name)) {
        continue;
      }
      if (this.tcb.env.config.checkTypeOfOutputEvents && output.name.endsWith("Change")) {
        const inputName = output.name.slice(0, -6);
        if (checkSplitTwoWayBinding(inputName, output, this.element.inputs, this.tcb)) {
          continue;
        }
      }
      if (output.type === ParsedEventType.Animation) {
        const eventType = this.tcb.env.config.checkTypeOfAnimationEvents ? this.tcb.env.referenceExternalType("@angular/animations", "AnimationEvent") : 1;
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType);
        this.scope.addStatement(ts41.factory.createExpressionStatement(handler));
      } else if (this.tcb.env.config.checkTypeOfDomEvents) {
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, 0);
        if (elId === null) {
          elId = this.scope.resolve(this.element);
        }
        const propertyAccess = ts41.factory.createPropertyAccessExpression(elId, "addEventListener");
        addParseSpanInfo(propertyAccess, output.keySpan);
        const call = ts41.factory.createCallExpression(
          propertyAccess,
          void 0,
          [ts41.factory.createStringLiteral(output.name), handler]
        );
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts41.factory.createExpressionStatement(call));
      } else {
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, 1);
        this.scope.addStatement(ts41.factory.createExpressionStatement(handler));
      }
    }
    return null;
  }
};
var TcbComponentContextCompletionOp = class extends TcbOp {
  scope;
  constructor(scope) {
    super();
    this.scope = scope;
  }
  optional = false;
  execute() {
    const ctx = ts41.factory.createThis();
    const ctxDot = ts41.factory.createPropertyAccessExpression(ctx, "");
    markIgnoreDiagnostics(ctxDot);
    addExpressionIdentifier(ctxDot, ExpressionIdentifier.COMPONENT_COMPLETION);
    this.scope.addStatement(ts41.factory.createExpressionStatement(ctxDot));
    return null;
  }
};
var TcbBlockVariableOp = class extends TcbOp {
  tcb;
  scope;
  initializer;
  variable;
  constructor(tcb, scope, initializer, variable) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.initializer = initializer;
    this.variable = variable;
  }
  get optional() {
    return false;
  }
  execute() {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.variable.keySpan);
    const variable = tsCreateVariable(id, wrapForTypeChecker(this.initializer));
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
};
var TcbBlockImplicitVariableOp = class extends TcbOp {
  tcb;
  scope;
  type;
  variable;
  constructor(tcb, scope, type, variable) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.type = type;
    this.variable = variable;
  }
  optional = true;
  execute() {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.variable.keySpan);
    const variable = tsDeclareVariable(id, this.type);
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
};
var TcbIfOp = class extends TcbOp {
  tcb;
  scope;
  block;
  expressionScopes = /* @__PURE__ */ new Map();
  constructor(tcb, scope, block) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.block = block;
  }
  get optional() {
    return false;
  }
  execute() {
    const root = this.generateBranch(0);
    root && this.scope.addStatement(root);
    return null;
  }
  generateBranch(index) {
    const branch = this.block.branches[index];
    if (!branch) {
      return void 0;
    }
    if (branch.expression === null) {
      const branchScope = this.getBranchScope(this.scope, branch, index);
      return ts41.factory.createBlock(branchScope.render());
    }
    const outerScope = Scope.forNodes(this.tcb, this.scope, branch, [], null);
    outerScope.render().forEach((stmt) => this.scope.addStatement(stmt));
    this.expressionScopes.set(branch, outerScope);
    let expression = tcbExpression(branch.expression, this.tcb, this.scope);
    if (branch.expressionAlias !== null) {
      expression = ts41.factory.createBinaryExpression(ts41.factory.createParenthesizedExpression(expression), ts41.SyntaxKind.AmpersandAmpersandToken, outerScope.resolve(branch.expressionAlias));
    }
    const bodyScope = this.getBranchScope(outerScope, branch, index);
    return ts41.factory.createIfStatement(expression, ts41.factory.createBlock(bodyScope.render()), this.generateBranch(index + 1));
  }
  getBranchScope(parentScope, branch, index) {
    const checkBody = this.tcb.env.config.checkControlFlowBodies;
    return Scope.forNodes(this.tcb, parentScope, null, checkBody ? branch.children : [], checkBody ? this.generateBranchGuard(index) : null);
  }
  generateBranchGuard(index) {
    let guard = null;
    for (let i = 0; i <= index; i++) {
      const branch = this.block.branches[i];
      if (branch.expression === null) {
        continue;
      }
      if (!this.expressionScopes.has(branch)) {
        throw new Error(`Could not determine expression scope of branch at index ${i}`);
      }
      const expressionScope = this.expressionScopes.get(branch);
      let expression;
      expression = tcbExpression(branch.expression, this.tcb, expressionScope);
      if (branch.expressionAlias !== null) {
        expression = ts41.factory.createBinaryExpression(ts41.factory.createParenthesizedExpression(expression), ts41.SyntaxKind.AmpersandAmpersandToken, expressionScope.resolve(branch.expressionAlias));
      }
      markIgnoreDiagnostics(expression);
      const comparisonExpression = i === index ? expression : ts41.factory.createPrefixUnaryExpression(ts41.SyntaxKind.ExclamationToken, ts41.factory.createParenthesizedExpression(expression));
      guard = guard === null ? comparisonExpression : ts41.factory.createBinaryExpression(guard, ts41.SyntaxKind.AmpersandAmpersandToken, comparisonExpression);
    }
    return guard;
  }
};
var TcbSwitchOp = class extends TcbOp {
  tcb;
  scope;
  block;
  constructor(tcb, scope, block) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.block = block;
  }
  get optional() {
    return false;
  }
  execute() {
    const switchExpression = tcbExpression(this.block.expression, this.tcb, this.scope);
    const clauses = this.block.cases.map((current) => {
      const checkBody = this.tcb.env.config.checkControlFlowBodies;
      const clauseScope = Scope.forNodes(this.tcb, this.scope, null, checkBody ? current.children : [], checkBody ? this.generateGuard(current, switchExpression) : null);
      const statements = [...clauseScope.render(), ts41.factory.createBreakStatement()];
      return current.expression === null ? ts41.factory.createDefaultClause(statements) : ts41.factory.createCaseClause(tcbExpression(current.expression, this.tcb, clauseScope), statements);
    });
    this.scope.addStatement(ts41.factory.createSwitchStatement(switchExpression, ts41.factory.createCaseBlock(clauses)));
    return null;
  }
  generateGuard(node, switchValue) {
    if (node.expression !== null) {
      const expression = tcbExpression(node.expression, this.tcb, this.scope);
      markIgnoreDiagnostics(expression);
      return ts41.factory.createBinaryExpression(switchValue, ts41.SyntaxKind.EqualsEqualsEqualsToken, expression);
    }
    let guard = null;
    for (const current of this.block.cases) {
      if (current.expression === null) {
        continue;
      }
      const expression = tcbExpression(current.expression, this.tcb, this.scope);
      markIgnoreDiagnostics(expression);
      const comparison = ts41.factory.createBinaryExpression(switchValue, ts41.SyntaxKind.ExclamationEqualsEqualsToken, expression);
      if (guard === null) {
        guard = comparison;
      } else {
        guard = ts41.factory.createBinaryExpression(guard, ts41.SyntaxKind.AmpersandAmpersandToken, comparison);
      }
    }
    return guard;
  }
};
var TcbForOfOp = class extends TcbOp {
  tcb;
  scope;
  block;
  constructor(tcb, scope, block) {
    super();
    this.tcb = tcb;
    this.scope = scope;
    this.block = block;
  }
  get optional() {
    return false;
  }
  execute() {
    const loopScope = Scope.forNodes(this.tcb, this.scope, this.block, this.tcb.env.config.checkControlFlowBodies ? this.block.children : [], null);
    const initializerId = loopScope.resolve(this.block.item);
    if (!ts41.isIdentifier(initializerId)) {
      throw new Error(`Could not resolve for loop variable ${this.block.item.name} to an identifier`);
    }
    const initializer = ts41.factory.createVariableDeclarationList([ts41.factory.createVariableDeclaration(initializerId)], ts41.NodeFlags.Const);
    addParseSpanInfo(initializer, this.block.item.keySpan);
    const expression = ts41.factory.createNonNullExpression(tcbExpression(this.block.expression, this.tcb, this.scope));
    const trackTranslator = new TcbForLoopTrackTranslator(this.tcb, loopScope, this.block);
    const trackExpression = trackTranslator.translate(this.block.trackBy);
    const statements = [
      ...loopScope.render(),
      ts41.factory.createExpressionStatement(trackExpression)
    ];
    this.scope.addStatement(ts41.factory.createForOfStatement(void 0, initializer, expression, ts41.factory.createBlock(statements)));
    return null;
  }
};
var INFER_TYPE_FOR_CIRCULAR_OP_EXPR = ts41.factory.createNonNullExpression(ts41.factory.createNull());
var Context = class {
  env;
  domSchemaChecker;
  oobRecorder;
  id;
  boundTarget;
  pipes;
  schemas;
  hostIsStandalone;
  hostPreserveWhitespaces;
  nextId = 1;
  constructor(env, domSchemaChecker, oobRecorder, id, boundTarget, pipes, schemas, hostIsStandalone, hostPreserveWhitespaces) {
    this.env = env;
    this.domSchemaChecker = domSchemaChecker;
    this.oobRecorder = oobRecorder;
    this.id = id;
    this.boundTarget = boundTarget;
    this.pipes = pipes;
    this.schemas = schemas;
    this.hostIsStandalone = hostIsStandalone;
    this.hostPreserveWhitespaces = hostPreserveWhitespaces;
  }
  allocateId() {
    return ts41.factory.createIdentifier(`_t${this.nextId++}`);
  }
  getPipeByName(name) {
    if (!this.pipes.has(name)) {
      return null;
    }
    return this.pipes.get(name);
  }
};
var _Scope = class {
  tcb;
  parent;
  guard;
  opQueue = [];
  elementOpMap = /* @__PURE__ */ new Map();
  directiveOpMap = /* @__PURE__ */ new Map();
  referenceOpMap = /* @__PURE__ */ new Map();
  templateCtxOpMap = /* @__PURE__ */ new Map();
  varMap = /* @__PURE__ */ new Map();
  letDeclOpMap = /* @__PURE__ */ new Map();
  statements = [];
  constructor(tcb, parent = null, guard = null) {
    this.tcb = tcb;
    this.parent = parent;
    this.guard = guard;
  }
  static forNodes(tcb, parentScope, scopedNode, children, guard) {
    const scope = new _Scope(tcb, parentScope, guard);
    if (parentScope === null && tcb.env.config.enableTemplateTypeChecker) {
      scope.opQueue.push(new TcbComponentContextCompletionOp(scope));
    }
    if (scopedNode instanceof TmplAstTemplate) {
      const varMap = /* @__PURE__ */ new Map();
      for (const v of scopedNode.variables) {
        if (!varMap.has(v.name)) {
          varMap.set(v.name, v);
        } else {
          const firstDecl = varMap.get(v.name);
          tcb.oobRecorder.duplicateTemplateVar(tcb.id, v, firstDecl);
        }
        this.registerVariable(scope, v, new TcbTemplateVariableOp(tcb, scope, scopedNode, v));
      }
    } else if (scopedNode instanceof TmplAstIfBlockBranch) {
      const { expression, expressionAlias } = scopedNode;
      if (expression !== null && expressionAlias !== null) {
        this.registerVariable(scope, expressionAlias, new TcbBlockVariableOp(tcb, scope, tcbExpression(expression, tcb, scope), expressionAlias));
      }
    } else if (scopedNode instanceof TmplAstForLoopBlock) {
      const loopInitializer = tcb.allocateId();
      addParseSpanInfo(loopInitializer, scopedNode.item.sourceSpan);
      scope.varMap.set(scopedNode.item, loopInitializer);
      for (const variable of scopedNode.contextVariables) {
        if (!this.forLoopContextVariableTypes.has(variable.value)) {
          throw new Error(`Unrecognized for loop context variable ${variable.name}`);
        }
        const type = ts41.factory.createKeywordTypeNode(this.forLoopContextVariableTypes.get(variable.value));
        this.registerVariable(scope, variable, new TcbBlockImplicitVariableOp(tcb, scope, type, variable));
      }
    }
    for (const node of children) {
      scope.appendNode(node);
    }
    for (const variable of scope.varMap.keys()) {
      _Scope.checkConflictingLet(scope, variable);
    }
    for (const ref of scope.referenceOpMap.keys()) {
      _Scope.checkConflictingLet(scope, ref);
    }
    return scope;
  }
  static registerVariable(scope, variable, op) {
    const opIndex = scope.opQueue.push(op) - 1;
    scope.varMap.set(variable, opIndex);
  }
  resolve(node, directive) {
    const res = this.resolveLocal(node, directive);
    if (res !== null) {
      let clone;
      if (ts41.isIdentifier(res)) {
        clone = ts41.factory.createIdentifier(res.text);
      } else if (ts41.isNonNullExpression(res)) {
        clone = ts41.factory.createNonNullExpression(res.expression);
      } else {
        throw new Error(`Could not resolve ${node} to an Identifier or a NonNullExpression`);
      }
      ts41.setOriginalNode(clone, res);
      clone.parent = clone.parent;
      return ts41.setSyntheticTrailingComments(clone, []);
    } else if (this.parent !== null) {
      return this.parent.resolve(node, directive);
    } else {
      throw new Error(`Could not resolve ${node} / ${directive}`);
    }
  }
  addStatement(stmt) {
    this.statements.push(stmt);
  }
  render() {
    for (let i = 0; i < this.opQueue.length; i++) {
      const skipOptional = !this.tcb.env.config.enableTemplateTypeChecker;
      this.executeOp(i, skipOptional);
    }
    return this.statements;
  }
  guards() {
    let parentGuards = null;
    if (this.parent !== null) {
      parentGuards = this.parent.guards();
    }
    if (this.guard === null) {
      return parentGuards;
    } else if (parentGuards === null) {
      return this.guard;
    } else {
      return ts41.factory.createBinaryExpression(parentGuards, ts41.SyntaxKind.AmpersandAmpersandToken, this.guard);
    }
  }
  isLocal(node) {
    if (node instanceof TmplAstVariable) {
      return this.varMap.has(node);
    }
    if (node instanceof TmplAstLetDeclaration2) {
      return this.letDeclOpMap.has(node.name);
    }
    return this.referenceOpMap.has(node);
  }
  resolveLocal(ref, directive) {
    if (ref instanceof TmplAstReference2 && this.referenceOpMap.has(ref)) {
      return this.resolveOp(this.referenceOpMap.get(ref));
    } else if (ref instanceof TmplAstLetDeclaration2 && this.letDeclOpMap.has(ref.name)) {
      return this.resolveOp(this.letDeclOpMap.get(ref.name).opIndex);
    } else if (ref instanceof TmplAstVariable && this.varMap.has(ref)) {
      const opIndexOrNode = this.varMap.get(ref);
      return typeof opIndexOrNode === "number" ? this.resolveOp(opIndexOrNode) : opIndexOrNode;
    } else if (ref instanceof TmplAstTemplate && directive === void 0 && this.templateCtxOpMap.has(ref)) {
      return this.resolveOp(this.templateCtxOpMap.get(ref));
    } else if ((ref instanceof TmplAstElement2 || ref instanceof TmplAstTemplate) && directive !== void 0 && this.directiveOpMap.has(ref)) {
      const dirMap = this.directiveOpMap.get(ref);
      if (dirMap.has(directive)) {
        return this.resolveOp(dirMap.get(directive));
      } else {
        return null;
      }
    } else if (ref instanceof TmplAstElement2 && this.elementOpMap.has(ref)) {
      return this.resolveOp(this.elementOpMap.get(ref));
    } else {
      return null;
    }
  }
  resolveOp(opIndex) {
    const res = this.executeOp(opIndex, false);
    if (res === null) {
      throw new Error(`Error resolving operation, got null`);
    }
    return res;
  }
  executeOp(opIndex, skipOptional) {
    const op = this.opQueue[opIndex];
    if (!(op instanceof TcbOp)) {
      return op;
    }
    if (skipOptional && op.optional) {
      return null;
    }
    this.opQueue[opIndex] = op.circularFallback();
    const res = op.execute();
    this.opQueue[opIndex] = res;
    return res;
  }
  appendNode(node) {
    if (node instanceof TmplAstElement2) {
      const opIndex = this.opQueue.push(new TcbElementOp(this.tcb, this, node)) - 1;
      this.elementOpMap.set(node, opIndex);
      if (this.tcb.env.config.controlFlowPreventingContentProjection !== "suppress") {
        this.appendContentProjectionCheckOp(node);
      }
      this.appendDirectivesAndInputsOfNode(node);
      this.appendOutputsOfNode(node);
      this.appendChildren(node);
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstTemplate) {
      this.appendDirectivesAndInputsOfNode(node);
      this.appendOutputsOfNode(node);
      const ctxIndex = this.opQueue.push(new TcbTemplateContextOp(this.tcb, this)) - 1;
      this.templateCtxOpMap.set(node, ctxIndex);
      if (this.tcb.env.config.checkTemplateBodies) {
        this.opQueue.push(new TcbTemplateBodyOp(this.tcb, this, node));
      } else if (this.tcb.env.config.alwaysCheckSchemaInTemplateBodies) {
        this.appendDeepSchemaChecks(node.children);
      }
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstDeferredBlock) {
      this.appendDeferredBlock(node);
    } else if (node instanceof TmplAstIfBlock) {
      this.opQueue.push(new TcbIfOp(this.tcb, this, node));
    } else if (node instanceof TmplAstSwitchBlock) {
      this.opQueue.push(new TcbSwitchOp(this.tcb, this, node));
    } else if (node instanceof TmplAstForLoopBlock) {
      this.opQueue.push(new TcbForOfOp(this.tcb, this, node));
      node.empty && this.tcb.env.config.checkControlFlowBodies && this.appendChildren(node.empty);
    } else if (node instanceof TmplAstBoundText) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, node.value));
    } else if (node instanceof TmplAstIcu) {
      this.appendIcuExpressions(node);
    } else if (node instanceof TmplAstContent) {
      this.appendChildren(node);
    } else if (node instanceof TmplAstLetDeclaration2) {
      const opIndex = this.opQueue.push(new TcbLetDeclarationOp(this.tcb, this, node)) - 1;
      if (this.isLocal(node)) {
        this.tcb.oobRecorder.conflictingDeclaration(this.tcb.id, node);
      } else {
        this.letDeclOpMap.set(node.name, { opIndex, node });
      }
    }
  }
  appendChildren(node) {
    for (const child of node.children) {
      this.appendNode(child);
    }
  }
  checkAndAppendReferencesOfNode(node) {
    for (const ref of node.references) {
      const target = this.tcb.boundTarget.getReferenceTarget(ref);
      let ctxIndex;
      if (target === null) {
        this.tcb.oobRecorder.missingReferenceTarget(this.tcb.id, ref);
        ctxIndex = this.opQueue.push(new TcbInvalidReferenceOp(this.tcb, this)) - 1;
      } else if (target instanceof TmplAstTemplate || target instanceof TmplAstElement2) {
        ctxIndex = this.opQueue.push(new TcbReferenceOp(this.tcb, this, ref, node, target)) - 1;
      } else {
        ctxIndex = this.opQueue.push(new TcbReferenceOp(this.tcb, this, ref, node, target.directive)) - 1;
      }
      this.referenceOpMap.set(ref, ctxIndex);
    }
  }
  appendDirectivesAndInputsOfNode(node) {
    const claimedInputs = /* @__PURE__ */ new Set();
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    if (directives === null || directives.length === 0) {
      if (node instanceof TmplAstElement2) {
        this.opQueue.push(new TcbUnclaimedInputsOp(this.tcb, this, node, claimedInputs));
        this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, true, claimedInputs));
      }
      return;
    } else {
      if (node instanceof TmplAstElement2) {
        const isDeferred = this.tcb.boundTarget.isDeferred(node);
        if (!isDeferred && directives.some((dirMeta) => dirMeta.isExplicitlyDeferred)) {
          this.tcb.oobRecorder.deferredComponentUsedEagerly(this.tcb.id, node);
        }
      }
    }
    const dirMap = /* @__PURE__ */ new Map();
    for (const dir of directives) {
      let directiveOp;
      const host = this.tcb.env.reflector;
      const dirRef = dir.ref;
      if (!dir.isGeneric) {
        directiveOp = new TcbNonGenericDirectiveTypeOp(this.tcb, this, node, dir);
      } else if (!requiresInlineTypeCtor(dirRef.node, host, this.tcb.env) || this.tcb.env.config.useInlineTypeConstructors) {
        directiveOp = new TcbDirectiveCtorOp(this.tcb, this, node, dir);
      } else {
        directiveOp = new TcbGenericDirectiveTypeWithAnyParamsOp(this.tcb, this, node, dir);
      }
      const dirIndex = this.opQueue.push(directiveOp) - 1;
      dirMap.set(dir, dirIndex);
      this.opQueue.push(new TcbDirectiveInputsOp(this.tcb, this, node, dir));
    }
    this.directiveOpMap.set(node, dirMap);
    if (node instanceof TmplAstElement2) {
      for (const dir of directives) {
        for (const propertyName of dir.inputs.propertyNames) {
          claimedInputs.add(propertyName);
        }
      }
      this.opQueue.push(new TcbUnclaimedInputsOp(this.tcb, this, node, claimedInputs));
      const checkElement = directives.length === 0;
      this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, checkElement, claimedInputs));
    }
  }
  appendOutputsOfNode(node) {
    const claimedOutputs = /* @__PURE__ */ new Set();
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    if (directives === null || directives.length === 0) {
      if (node instanceof TmplAstElement2) {
        this.opQueue.push(new TcbUnclaimedOutputsOp(this.tcb, this, node, claimedOutputs));
      }
      return;
    }
    for (const dir of directives) {
      this.opQueue.push(new TcbDirectiveOutputsOp(this.tcb, this, node, dir));
    }
    if (node instanceof TmplAstElement2) {
      for (const dir of directives) {
        for (const outputProperty of dir.outputs.propertyNames) {
          claimedOutputs.add(outputProperty);
        }
      }
      this.opQueue.push(new TcbUnclaimedOutputsOp(this.tcb, this, node, claimedOutputs));
    }
  }
  appendDeepSchemaChecks(nodes) {
    for (const node of nodes) {
      if (!(node instanceof TmplAstElement2 || node instanceof TmplAstTemplate)) {
        continue;
      }
      if (node instanceof TmplAstElement2) {
        const claimedInputs = /* @__PURE__ */ new Set();
        const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
        let hasDirectives;
        if (directives === null || directives.length === 0) {
          hasDirectives = false;
        } else {
          hasDirectives = true;
          for (const dir of directives) {
            for (const propertyName of dir.inputs.propertyNames) {
              claimedInputs.add(propertyName);
            }
          }
        }
        this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, !hasDirectives, claimedInputs));
      }
      this.appendDeepSchemaChecks(node.children);
    }
  }
  appendIcuExpressions(node) {
    for (const variable of Object.values(node.vars)) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, variable.value));
    }
    for (const placeholder of Object.values(node.placeholders)) {
      if (placeholder instanceof TmplAstBoundText) {
        this.opQueue.push(new TcbExpressionOp(this.tcb, this, placeholder.value));
      }
    }
  }
  appendContentProjectionCheckOp(root) {
    var _a;
    const meta = ((_a = this.tcb.boundTarget.getDirectivesOfNode(root)) == null ? void 0 : _a.find((meta2) => meta2.isComponent)) || null;
    if (meta !== null && meta.ngContentSelectors !== null && meta.ngContentSelectors.length > 0) {
      const selectors = meta.ngContentSelectors;
      if (selectors.length > 1 || selectors.length === 1 && selectors[0] !== "*") {
        this.opQueue.push(new TcbControlFlowContentProjectionOp(this.tcb, root, selectors, meta.name));
      }
    }
  }
  appendDeferredBlock(block) {
    this.appendDeferredTriggers(block, block.triggers);
    this.appendDeferredTriggers(block, block.prefetchTriggers);
    if (block.hydrateTriggers.when) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, block.hydrateTriggers.when.value));
    }
    this.appendChildren(block);
    if (block.placeholder !== null) {
      this.appendChildren(block.placeholder);
    }
    if (block.loading !== null) {
      this.appendChildren(block.loading);
    }
    if (block.error !== null) {
      this.appendChildren(block.error);
    }
  }
  appendDeferredTriggers(block, triggers) {
    if (triggers.when !== void 0) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, triggers.when.value));
    }
    if (triggers.hover !== void 0) {
      this.appendReferenceBasedDeferredTrigger(block, triggers.hover);
    }
    if (triggers.interaction !== void 0) {
      this.appendReferenceBasedDeferredTrigger(block, triggers.interaction);
    }
    if (triggers.viewport !== void 0) {
      this.appendReferenceBasedDeferredTrigger(block, triggers.viewport);
    }
  }
  appendReferenceBasedDeferredTrigger(block, trigger) {
    if (this.tcb.boundTarget.getDeferredTriggerTarget(block, trigger) === null) {
      this.tcb.oobRecorder.inaccessibleDeferredTriggerElement(this.tcb.id, trigger);
    }
  }
  static checkConflictingLet(scope, node) {
    if (scope.letDeclOpMap.has(node.name)) {
      scope.tcb.oobRecorder.conflictingDeclaration(scope.tcb.id, scope.letDeclOpMap.get(node.name).node);
    }
  }
};
var Scope = _Scope;
__publicField(Scope, "forLoopContextVariableTypes", /* @__PURE__ */ new Map([
  ["$first", ts41.SyntaxKind.BooleanKeyword],
  ["$last", ts41.SyntaxKind.BooleanKeyword],
  ["$even", ts41.SyntaxKind.BooleanKeyword],
  ["$odd", ts41.SyntaxKind.BooleanKeyword],
  ["$index", ts41.SyntaxKind.NumberKeyword],
  ["$count", ts41.SyntaxKind.NumberKeyword]
]));
function tcbThisParam(name, typeArguments) {
  return ts41.factory.createParameterDeclaration(
    void 0,
    void 0,
    "this",
    void 0,
    ts41.factory.createTypeReferenceNode(name, typeArguments),
    void 0
  );
}
function tcbExpression(ast, tcb, scope) {
  const translator = new TcbExpressionTranslator(tcb, scope);
  return translator.translate(ast);
}
var TcbExpressionTranslator = class {
  tcb;
  scope;
  constructor(tcb, scope) {
    this.tcb = tcb;
    this.scope = scope;
  }
  translate(ast) {
    return astToTypescript(ast, (ast2) => this.resolve(ast2), this.tcb.env.config);
  }
  resolve(ast) {
    if (ast instanceof PropertyRead3 && ast.receiver instanceof ImplicitReceiver2 && !(ast.receiver instanceof ThisReceiver)) {
      const target = this.tcb.boundTarget.getExpressionTarget(ast);
      const targetExpression = target === null ? null : this.getTargetNodeExpression(target, ast);
      if (target instanceof TmplAstLetDeclaration2 && !this.isValidLetDeclarationAccess(target, ast)) {
        this.tcb.oobRecorder.letUsedBeforeDefinition(this.tcb.id, ast, target);
        if (targetExpression !== null) {
          return ts41.factory.createAsExpression(targetExpression, ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
        }
      }
      return targetExpression;
    } else if (ast instanceof PropertyWrite2 && ast.receiver instanceof ImplicitReceiver2) {
      const target = this.tcb.boundTarget.getExpressionTarget(ast);
      if (target === null) {
        return null;
      }
      const targetExpression = this.getTargetNodeExpression(target, ast);
      const expr = this.translate(ast.value);
      const result = ts41.factory.createParenthesizedExpression(ts41.factory.createBinaryExpression(targetExpression, ts41.SyntaxKind.EqualsToken, expr));
      addParseSpanInfo(result, ast.sourceSpan);
      if (target instanceof TmplAstLetDeclaration2) {
        markIgnoreDiagnostics(result);
        this.tcb.oobRecorder.illegalWriteToLetDeclaration(this.tcb.id, ast, target);
      }
      return result;
    } else if (ast instanceof ImplicitReceiver2) {
      return ts41.factory.createThis();
    } else if (ast instanceof BindingPipe) {
      const expr = this.translate(ast.exp);
      const pipeMeta = this.tcb.getPipeByName(ast.name);
      let pipe;
      if (pipeMeta === null) {
        this.tcb.oobRecorder.missingPipe(this.tcb.id, ast);
        pipe = ANY_EXPRESSION;
      } else if (pipeMeta.isExplicitlyDeferred && this.tcb.boundTarget.getEagerlyUsedPipes().includes(ast.name)) {
        this.tcb.oobRecorder.deferredPipeUsedEagerly(this.tcb.id, ast);
        pipe = ANY_EXPRESSION;
      } else {
        pipe = this.tcb.env.pipeInst(pipeMeta.ref);
      }
      const args = ast.args.map((arg) => this.translate(arg));
      let methodAccess = ts41.factory.createPropertyAccessExpression(pipe, "transform");
      addParseSpanInfo(methodAccess, ast.nameSpan);
      if (!this.tcb.env.config.checkTypeOfPipes) {
        methodAccess = ts41.factory.createAsExpression(methodAccess, ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
      }
      const result = ts41.factory.createCallExpression(
        methodAccess,
        void 0,
        [expr, ...args]
      );
      addParseSpanInfo(result, ast.sourceSpan);
      return result;
    } else if ((ast instanceof Call2 || ast instanceof SafeCall) && (ast.receiver instanceof PropertyRead3 || ast.receiver instanceof SafePropertyRead3)) {
      if (ast.receiver.receiver instanceof ImplicitReceiver2 && !(ast.receiver.receiver instanceof ThisReceiver) && ast.receiver.name === "$any" && ast.args.length === 1) {
        const expr = this.translate(ast.args[0]);
        const exprAsAny = ts41.factory.createAsExpression(expr, ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword));
        const result = ts41.factory.createParenthesizedExpression(exprAsAny);
        addParseSpanInfo(result, ast.sourceSpan);
        return result;
      }
      const target = this.tcb.boundTarget.getExpressionTarget(ast);
      if (target === null) {
        return null;
      }
      const receiver = this.getTargetNodeExpression(target, ast);
      const method = wrapForDiagnostics(receiver);
      addParseSpanInfo(method, ast.receiver.nameSpan);
      const args = ast.args.map((arg) => this.translate(arg));
      const node = ts41.factory.createCallExpression(method, void 0, args);
      addParseSpanInfo(node, ast.sourceSpan);
      return node;
    } else {
      return null;
    }
  }
  getTargetNodeExpression(targetNode, expressionNode) {
    const expr = this.scope.resolve(targetNode);
    addParseSpanInfo(expr, expressionNode.sourceSpan);
    return expr;
  }
  isValidLetDeclarationAccess(target, ast) {
    const targetStart = target.sourceSpan.start.offset;
    const targetEnd = target.sourceSpan.end.offset;
    const astStart = ast.sourceSpan.start;
    return targetStart < astStart && astStart > targetEnd || !this.scope.isLocal(target);
  }
};
function tcbCallTypeCtor(dir, tcb, inputs) {
  const typeCtor = tcb.env.typeCtorFor(dir);
  const members = inputs.map((input) => {
    const propertyName = ts41.factory.createStringLiteral(input.field);
    if (input.type === "binding") {
      let expr = widenBinding(input.expression, tcb);
      if (input.isTwoWayBinding && tcb.env.config.allowSignalsInTwoWayBindings) {
        expr = unwrapWritableSignal(expr, tcb);
      }
      const assignment = ts41.factory.createPropertyAssignment(propertyName, wrapForDiagnostics(expr));
      addParseSpanInfo(assignment, input.sourceSpan);
      return assignment;
    } else {
      return ts41.factory.createPropertyAssignment(propertyName, ANY_EXPRESSION);
    }
  });
  return ts41.factory.createCallExpression(
    typeCtor,
    void 0,
    [ts41.factory.createObjectLiteralExpression(members)]
  );
}
function getBoundAttributes(directive, node) {
  const boundInputs = [];
  const processAttribute = (attr) => {
    if (attr instanceof TmplAstBoundAttribute && attr.type !== BindingType.Property && attr.type !== BindingType.TwoWay) {
      return;
    }
    const inputs = directive.inputs.getByBindingPropertyName(attr.name);
    if (inputs !== null) {
      boundInputs.push({
        attribute: attr,
        inputs: inputs.map((input) => {
          var _a;
          return {
            fieldName: input.classPropertyName,
            required: input.required,
            transformType: ((_a = input.transform) == null ? void 0 : _a.type) || null,
            isSignal: input.isSignal,
            isTwoWayBinding: attr instanceof TmplAstBoundAttribute && attr.type === BindingType.TwoWay
          };
        })
      });
    }
  };
  node.inputs.forEach(processAttribute);
  node.attributes.forEach(processAttribute);
  if (node instanceof TmplAstTemplate) {
    node.templateAttrs.forEach(processAttribute);
  }
  return boundInputs;
}
function translateInput(attr, tcb, scope) {
  if (attr instanceof TmplAstBoundAttribute) {
    return tcbExpression(attr.value, tcb, scope);
  } else {
    return ts41.factory.createStringLiteral(attr.value);
  }
}
function widenBinding(expr, tcb) {
  if (!tcb.env.config.checkTypeOfInputBindings) {
    return tsCastToAny(expr);
  } else if (!tcb.env.config.strictNullInputBindings) {
    if (ts41.isObjectLiteralExpression(expr) || ts41.isArrayLiteralExpression(expr)) {
      return expr;
    } else {
      return ts41.factory.createNonNullExpression(expr);
    }
  } else {
    return expr;
  }
}
function unwrapWritableSignal(expression, tcb) {
  const unwrapRef = tcb.env.referenceExternalSymbol(R3Identifiers4.unwrapWritableSignal.moduleName, R3Identifiers4.unwrapWritableSignal.name);
  return ts41.factory.createCallExpression(unwrapRef, void 0, [expression]);
}
var EVENT_PARAMETER = "$event";
function tcbCreateEventHandler(event, tcb, scope, eventType) {
  const handler = tcbEventHandlerExpression(event.handler, tcb, scope);
  const statements = [];
  if (event.type === ParsedEventType.TwoWay && tcb.env.config.checkTwoWayBoundEvents) {
    const target = tcb.allocateId();
    const assignment = ts41.factory.createBinaryExpression(target, ts41.SyntaxKind.EqualsToken, ts41.factory.createIdentifier(EVENT_PARAMETER));
    statements.push(tsCreateVariable(target, tcb.env.config.allowSignalsInTwoWayBindings ? unwrapWritableSignal(handler, tcb) : handler), ts41.factory.createExpressionStatement(assignment));
  } else {
    statements.push(ts41.factory.createExpressionStatement(handler));
  }
  let eventParamType;
  if (eventType === 0) {
    eventParamType = void 0;
  } else if (eventType === 1) {
    eventParamType = ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword);
  } else {
    eventParamType = eventType;
  }
  const guards = scope.guards();
  let body = ts41.factory.createBlock(statements);
  if (guards !== null) {
    body = ts41.factory.createBlock([ts41.factory.createIfStatement(guards, body)]);
  }
  const eventParam = ts41.factory.createParameterDeclaration(
    void 0,
    void 0,
    EVENT_PARAMETER,
    void 0,
    eventParamType
  );
  addExpressionIdentifier(eventParam, ExpressionIdentifier.EVENT_PARAMETER);
  return ts41.factory.createArrowFunction(
    void 0,
    void 0,
    [eventParam],
    ts41.factory.createKeywordTypeNode(ts41.SyntaxKind.AnyKeyword),
    void 0,
    body
  );
}
function tcbEventHandlerExpression(ast, tcb, scope) {
  const translator = new TcbEventHandlerTranslator(tcb, scope);
  return translator.translate(ast);
}
function checkSplitTwoWayBinding(inputName, output, inputs, tcb) {
  const input = inputs.find((input2) => input2.name === inputName);
  if (input === void 0 || input.sourceSpan !== output.sourceSpan) {
    return false;
  }
  const inputConsumer = tcb.boundTarget.getConsumerOfBinding(input);
  const outputConsumer = tcb.boundTarget.getConsumerOfBinding(output);
  if (outputConsumer === null || inputConsumer.ref === void 0 || outputConsumer instanceof TmplAstTemplate) {
    return false;
  }
  if (outputConsumer instanceof TmplAstElement2) {
    tcb.oobRecorder.splitTwoWayBinding(tcb.id, input, output, inputConsumer.ref.node, outputConsumer);
    return true;
  } else if (outputConsumer.ref !== inputConsumer.ref) {
    tcb.oobRecorder.splitTwoWayBinding(tcb.id, input, output, inputConsumer.ref.node, outputConsumer.ref.node);
    return true;
  }
  return false;
}
var TcbEventHandlerTranslator = class extends TcbExpressionTranslator {
  resolve(ast) {
    if (ast instanceof PropertyRead3 && ast.receiver instanceof ImplicitReceiver2 && !(ast.receiver instanceof ThisReceiver) && ast.name === EVENT_PARAMETER) {
      const event = ts41.factory.createIdentifier(EVENT_PARAMETER);
      addParseSpanInfo(event, ast.nameSpan);
      return event;
    }
    return super.resolve(ast);
  }
  isValidLetDeclarationAccess() {
    return true;
  }
};
var TcbForLoopTrackTranslator = class extends TcbExpressionTranslator {
  block;
  allowedVariables;
  constructor(tcb, scope, block) {
    super(tcb, scope);
    this.block = block;
    this.allowedVariables = /* @__PURE__ */ new Set([block.item]);
    for (const variable of block.contextVariables) {
      if (variable.value === "$index") {
        this.allowedVariables.add(variable);
      }
    }
  }
  resolve(ast) {
    if (ast instanceof PropertyRead3 && ast.receiver instanceof ImplicitReceiver2) {
      const target = this.tcb.boundTarget.getExpressionTarget(ast);
      if (target !== null && (!(target instanceof TmplAstVariable) || !this.allowedVariables.has(target))) {
        this.tcb.oobRecorder.illegalForLoopTrackAccess(this.tcb.id, this.block, ast);
      }
    }
    return super.resolve(ast);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/type_check_file.mjs
import ts42 from "typescript";
var TypeCheckFile = class extends Environment {
  fileName;
  nextTcbId = 1;
  tcbStatements = [];
  constructor(fileName, config, refEmitter, reflector, compilerHost) {
    super(config, new ImportManager({
      forceGenerateNamespacesForNewImports: true,
      shouldUseSingleQuotes: () => true
    }), refEmitter, reflector, ts42.createSourceFile(compilerHost.getCanonicalFileName(fileName), "", ts42.ScriptTarget.Latest, true));
    this.fileName = fileName;
  }
  addTypeCheckBlock(ref, meta, domSchemaChecker, oobRecorder, genericContextBehavior) {
    const fnId = ts42.factory.createIdentifier(`_tcb${this.nextTcbId++}`);
    const fn = generateTypeCheckBlock(this, ref, fnId, meta, domSchemaChecker, oobRecorder, genericContextBehavior);
    this.tcbStatements.push(fn);
  }
  render(removeComments) {
    ensureTypeCheckFilePreparationImports(this);
    const importChanges = this.importManager.finalize();
    if (importChanges.updatedImports.size > 0) {
      throw new Error("AssertionError: Expected no imports to be updated for a new type check file.");
    }
    const printer = ts42.createPrinter({ removeComments });
    let source = "";
    const newImports = importChanges.newImports.get(this.contextFile.fileName);
    if (newImports !== void 0) {
      source += newImports.map((i) => printer.printNode(ts42.EmitHint.Unspecified, i, this.contextFile)).join("\n");
    }
    source += "\n";
    for (const stmt of this.pipeInstStatements) {
      source += printer.printNode(ts42.EmitHint.Unspecified, stmt, this.contextFile) + "\n";
    }
    for (const stmt of this.typeCtorStatements) {
      source += printer.printNode(ts42.EmitHint.Unspecified, stmt, this.contextFile) + "\n";
    }
    source += "\n";
    for (const stmt of this.tcbStatements) {
      source += printer.printNode(ts42.EmitHint.Unspecified, stmt, this.contextFile) + "\n";
    }
    source += "\nexport const IS_A_MODULE = true;\n";
    return source;
  }
  getPreludeStatements() {
    return [];
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/context.mjs
var InliningMode;
(function(InliningMode2) {
  InliningMode2[InliningMode2["InlineOps"] = 0] = "InlineOps";
  InliningMode2[InliningMode2["Error"] = 1] = "Error";
})(InliningMode || (InliningMode = {}));
var TypeCheckContextImpl = class {
  config;
  compilerHost;
  refEmitter;
  reflector;
  host;
  inlining;
  perf;
  fileMap = /* @__PURE__ */ new Map();
  constructor(config, compilerHost, refEmitter, reflector, host, inlining, perf) {
    this.config = config;
    this.compilerHost = compilerHost;
    this.refEmitter = refEmitter;
    this.reflector = reflector;
    this.host = host;
    this.inlining = inlining;
    this.perf = perf;
    if (inlining === InliningMode.Error && config.useInlineTypeConstructors) {
      throw new Error(`AssertionError: invalid inlining configuration.`);
    }
  }
  opMap = /* @__PURE__ */ new Map();
  typeCtorPending = /* @__PURE__ */ new Set();
  addTemplate(ref, binder, template, pipes, schemas, sourceMapping, file, parseErrors, isStandalone, preserveWhitespaces) {
    if (!this.host.shouldCheckComponent(ref.node)) {
      return;
    }
    const fileData = this.dataForFile(ref.node.getSourceFile());
    const shimData = this.pendingShimForComponent(ref.node);
    const templateId = fileData.sourceManager.getTemplateId(ref.node);
    const templateDiagnostics = [];
    if (parseErrors !== null) {
      templateDiagnostics.push(...getTemplateDiagnostics(parseErrors, templateId, sourceMapping));
    }
    const boundTarget = binder.bind({ template });
    if (this.inlining === InliningMode.InlineOps) {
      for (const dir of boundTarget.getUsedDirectives()) {
        const dirRef = dir.ref;
        const dirNode = dirRef.node;
        if (!dir.isGeneric || !requiresInlineTypeCtor(dirNode, this.reflector, shimData.file)) {
          continue;
        }
        this.addInlineTypeCtor(fileData, dirNode.getSourceFile(), dirRef, {
          fnName: "ngTypeCtor",
          body: !dirNode.getSourceFile().isDeclarationFile,
          fields: {
            inputs: dir.inputs,
            queries: dir.queries
          },
          coercedInputFields: dir.coercedInputFields
        });
      }
    }
    shimData.templates.set(templateId, {
      template,
      boundTarget,
      templateDiagnostics
    });
    const usedPipes = [];
    for (const name of boundTarget.getUsedPipes()) {
      if (!pipes.has(name)) {
        continue;
      }
      usedPipes.push(pipes.get(name).ref);
    }
    const inliningRequirement = requiresInlineTypeCheckBlock(ref, shimData.file, usedPipes, this.reflector);
    if (this.inlining === InliningMode.Error && inliningRequirement === TcbInliningRequirement.MustInline) {
      shimData.oobRecorder.requiresInlineTcb(templateId, ref.node);
      this.perf.eventCount(PerfEvent.SkipGenerateTcbNoInline);
      return;
    }
    const meta = {
      id: fileData.sourceManager.captureSource(ref.node, sourceMapping, file),
      boundTarget,
      pipes,
      schemas,
      isStandalone,
      preserveWhitespaces
    };
    this.perf.eventCount(PerfEvent.GenerateTcb);
    if (inliningRequirement !== TcbInliningRequirement.None && this.inlining === InliningMode.InlineOps) {
      this.addInlineTypeCheckBlock(fileData, shimData, ref, meta);
    } else if (inliningRequirement === TcbInliningRequirement.ShouldInlineForGenericBounds && this.inlining === InliningMode.Error) {
      shimData.file.addTypeCheckBlock(ref, meta, shimData.domSchemaChecker, shimData.oobRecorder, TcbGenericContextBehavior.FallbackToAny);
    } else {
      shimData.file.addTypeCheckBlock(ref, meta, shimData.domSchemaChecker, shimData.oobRecorder, TcbGenericContextBehavior.UseEmitter);
    }
  }
  addInlineTypeCtor(fileData, sf, ref, ctorMeta) {
    if (this.typeCtorPending.has(ref.node)) {
      return;
    }
    this.typeCtorPending.add(ref.node);
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf);
    ops.push(new TypeCtorOp(ref, this.reflector, ctorMeta));
    fileData.hasInlines = true;
  }
  transform(sf) {
    if (!this.opMap.has(sf)) {
      return null;
    }
    const printer = ts43.createPrinter({ omitTrailingSemicolon: true });
    const importManager = new ImportManager({
      forceGenerateNamespacesForNewImports: true,
      shouldUseSingleQuotes: () => true
    });
    const updates = this.opMap.get(sf).map((op) => {
      return {
        pos: op.splitPoint,
        text: op.execute(importManager, sf, this.refEmitter, printer)
      };
    });
    const { newImports, updatedImports } = importManager.finalize();
    if (newImports.has(sf.fileName)) {
      newImports.get(sf.fileName).forEach((newImport) => {
        updates.push({
          pos: 0,
          text: printer.printNode(ts43.EmitHint.Unspecified, newImport, sf)
        });
      });
    }
    for (const [oldBindings, newBindings] of updatedImports.entries()) {
      if (oldBindings.getSourceFile() !== sf) {
        throw new Error("Unexpected updates to unrelated source files.");
      }
      updates.push({
        pos: oldBindings.getStart(),
        deletePos: oldBindings.getEnd(),
        text: printer.printNode(ts43.EmitHint.Unspecified, newBindings, sf)
      });
    }
    const result = new MagicString(sf.text, { filename: sf.fileName });
    for (const update of updates) {
      if (update.deletePos !== void 0) {
        result.remove(update.pos, update.deletePos);
      }
      result.appendLeft(update.pos, update.text);
    }
    return result.toString();
  }
  finalize() {
    const updates = /* @__PURE__ */ new Map();
    for (const originalSf of this.opMap.keys()) {
      const newText = this.transform(originalSf);
      if (newText !== null) {
        updates.set(absoluteFromSourceFile(originalSf), {
          newText,
          originalFile: originalSf
        });
      }
    }
    for (const [sfPath, pendingFileData] of this.fileMap) {
      for (const pendingShimData of pendingFileData.shimData.values()) {
        this.host.recordShimData(sfPath, {
          genesisDiagnostics: [
            ...pendingShimData.domSchemaChecker.diagnostics,
            ...pendingShimData.oobRecorder.diagnostics
          ],
          hasInlines: pendingFileData.hasInlines,
          path: pendingShimData.file.fileName,
          templates: pendingShimData.templates
        });
        const sfText = pendingShimData.file.render(false);
        updates.set(pendingShimData.file.fileName, {
          newText: sfText,
          originalFile: null
        });
      }
    }
    return updates;
  }
  addInlineTypeCheckBlock(fileData, shimData, ref, tcbMeta) {
    const sf = ref.node.getSourceFile();
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf);
    ops.push(new InlineTcbOp(ref, tcbMeta, this.config, this.reflector, shimData.domSchemaChecker, shimData.oobRecorder));
    fileData.hasInlines = true;
  }
  pendingShimForComponent(node) {
    const fileData = this.dataForFile(node.getSourceFile());
    const shimPath = TypeCheckShimGenerator.shimFor(absoluteFromSourceFile(node.getSourceFile()));
    if (!fileData.shimData.has(shimPath)) {
      fileData.shimData.set(shimPath, {
        domSchemaChecker: new RegistryDomSchemaChecker(fileData.sourceManager),
        oobRecorder: new OutOfBandDiagnosticRecorderImpl(fileData.sourceManager),
        file: new TypeCheckFile(shimPath, this.config, this.refEmitter, this.reflector, this.compilerHost),
        templates: /* @__PURE__ */ new Map()
      });
    }
    return fileData.shimData.get(shimPath);
  }
  dataForFile(sf) {
    const sfPath = absoluteFromSourceFile(sf);
    if (!this.fileMap.has(sfPath)) {
      const data = {
        hasInlines: false,
        sourceManager: this.host.getSourceManager(sfPath),
        shimData: /* @__PURE__ */ new Map()
      };
      this.fileMap.set(sfPath, data);
    }
    return this.fileMap.get(sfPath);
  }
};
function getTemplateDiagnostics(parseErrors, templateId, sourceMapping) {
  return parseErrors.map((error) => {
    const span = error.span;
    if (span.start.offset === span.end.offset) {
      span.end.offset++;
    }
    return makeTemplateDiagnostic(templateId, sourceMapping, span, ts43.DiagnosticCategory.Error, ngErrorCode(ErrorCode.TEMPLATE_PARSE_ERROR), error.msg);
  });
}
var InlineTcbOp = class {
  ref;
  meta;
  config;
  reflector;
  domSchemaChecker;
  oobRecorder;
  constructor(ref, meta, config, reflector, domSchemaChecker, oobRecorder) {
    this.ref = ref;
    this.meta = meta;
    this.config = config;
    this.reflector = reflector;
    this.domSchemaChecker = domSchemaChecker;
    this.oobRecorder = oobRecorder;
  }
  get splitPoint() {
    return this.ref.node.end + 1;
  }
  execute(im, sf, refEmitter, printer) {
    const env = new Environment(this.config, im, refEmitter, this.reflector, sf);
    const fnName = ts43.factory.createIdentifier(`_tcb_${this.ref.node.pos}`);
    const fn = generateTypeCheckBlock(env, this.ref, fnName, this.meta, this.domSchemaChecker, this.oobRecorder, TcbGenericContextBehavior.CopyClassNodes);
    return printer.printNode(ts43.EmitHint.Unspecified, fn, sf);
  }
};
var TypeCtorOp = class {
  ref;
  reflector;
  meta;
  constructor(ref, reflector, meta) {
    this.ref = ref;
    this.reflector = reflector;
    this.meta = meta;
  }
  get splitPoint() {
    return this.ref.node.end - 1;
  }
  execute(im, sf, refEmitter, printer) {
    const emitEnv = new ReferenceEmitEnvironment(im, refEmitter, this.reflector, sf);
    const tcb = generateInlineTypeCtor(emitEnv, this.ref.node, this.meta);
    return printer.printNode(ts43.EmitHint.Unspecified, tcb, sf);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/source.mjs
import { ParseLocation as ParseLocation2, ParseSourceSpan as ParseSourceSpan2 } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/line_mappings.mjs
var LF_CHAR = 10;
var CR_CHAR = 13;
var LINE_SEP_CHAR = 8232;
var PARAGRAPH_CHAR = 8233;
function getLineAndCharacterFromPosition(lineStartsMap, position) {
  const lineIndex = findClosestLineStartPosition(lineStartsMap, position);
  return { character: position - lineStartsMap[lineIndex], line: lineIndex };
}
function computeLineStartsMap(text) {
  const result = [0];
  let pos = 0;
  while (pos < text.length) {
    const char = text.charCodeAt(pos++);
    if (char === CR_CHAR) {
      if (text.charCodeAt(pos) === LF_CHAR) {
        pos++;
      }
      result.push(pos);
    } else if (char === LF_CHAR || char === LINE_SEP_CHAR || char === PARAGRAPH_CHAR) {
      result.push(pos);
    }
  }
  result.push(pos);
  return result;
}
function findClosestLineStartPosition(linesMap, position, low = 0, high = linesMap.length - 1) {
  while (low <= high) {
    const pivotIdx = Math.floor((low + high) / 2);
    const pivotEl = linesMap[pivotIdx];
    if (pivotEl === position) {
      return pivotIdx;
    } else if (position > pivotEl) {
      low = pivotIdx + 1;
    } else {
      high = pivotIdx - 1;
    }
  }
  return low - 1;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/source.mjs
var TemplateSource = class {
  mapping;
  file;
  lineStarts = null;
  constructor(mapping, file) {
    this.mapping = mapping;
    this.file = file;
  }
  toParseSourceSpan(start, end) {
    const startLoc = this.toParseLocation(start);
    const endLoc = this.toParseLocation(end);
    return new ParseSourceSpan2(startLoc, endLoc);
  }
  toParseLocation(position) {
    const lineStarts = this.acquireLineStarts();
    const { line, character } = getLineAndCharacterFromPosition(lineStarts, position);
    return new ParseLocation2(this.file, position, line, character);
  }
  acquireLineStarts() {
    if (this.lineStarts === null) {
      this.lineStarts = computeLineStartsMap(this.file.content);
    }
    return this.lineStarts;
  }
};
var TemplateSourceManager = class {
  templateSources = /* @__PURE__ */ new Map();
  getTemplateId(node) {
    return getTemplateId(node);
  }
  captureSource(node, mapping, file) {
    const id = getTemplateId(node);
    this.templateSources.set(id, new TemplateSource(mapping, file));
    return id;
  }
  getSourceMapping(id) {
    if (!this.templateSources.has(id)) {
      throw new Error(`Unexpected unknown template ID: ${id}`);
    }
    return this.templateSources.get(id).mapping;
  }
  toParseSourceSpan(id, span) {
    if (!this.templateSources.has(id)) {
      return null;
    }
    const templateSource = this.templateSources.get(id);
    return templateSource.toParseSourceSpan(span.start, span.end);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/template_symbol_builder.mjs
import { AST, ASTWithName, ASTWithSource as ASTWithSource2, BindingPipe as BindingPipe2, PropertyRead as PropertyRead4, PropertyWrite as PropertyWrite3, R3Identifiers as R3Identifiers5, SafePropertyRead as SafePropertyRead4, TmplAstBoundAttribute as TmplAstBoundAttribute2, TmplAstBoundEvent, TmplAstElement as TmplAstElement3, TmplAstLetDeclaration as TmplAstLetDeclaration3, TmplAstReference as TmplAstReference3, TmplAstTemplate as TmplAstTemplate2, TmplAstTextAttribute as TmplAstTextAttribute3, TmplAstVariable as TmplAstVariable2 } from "@angular/compiler";
import ts44 from "typescript";
var SymbolBuilder = class {
  tcbPath;
  tcbIsShim;
  typeCheckBlock;
  templateData;
  componentScopeReader;
  getTypeChecker;
  symbolCache = /* @__PURE__ */ new Map();
  constructor(tcbPath, tcbIsShim, typeCheckBlock, templateData, componentScopeReader, getTypeChecker) {
    this.tcbPath = tcbPath;
    this.tcbIsShim = tcbIsShim;
    this.typeCheckBlock = typeCheckBlock;
    this.templateData = templateData;
    this.componentScopeReader = componentScopeReader;
    this.getTypeChecker = getTypeChecker;
  }
  getSymbol(node) {
    if (this.symbolCache.has(node)) {
      return this.symbolCache.get(node);
    }
    let symbol = null;
    if (node instanceof TmplAstBoundAttribute2 || node instanceof TmplAstTextAttribute3) {
      symbol = this.getSymbolOfInputBinding(node);
    } else if (node instanceof TmplAstBoundEvent) {
      symbol = this.getSymbolOfBoundEvent(node);
    } else if (node instanceof TmplAstElement3) {
      symbol = this.getSymbolOfElement(node);
    } else if (node instanceof TmplAstTemplate2) {
      symbol = this.getSymbolOfAstTemplate(node);
    } else if (node instanceof TmplAstVariable2) {
      symbol = this.getSymbolOfVariable(node);
    } else if (node instanceof TmplAstLetDeclaration3) {
      symbol = this.getSymbolOfLetDeclaration(node);
    } else if (node instanceof TmplAstReference3) {
      symbol = this.getSymbolOfReference(node);
    } else if (node instanceof BindingPipe2) {
      symbol = this.getSymbolOfPipe(node);
    } else if (node instanceof AST) {
      symbol = this.getSymbolOfTemplateExpression(node);
    } else {
    }
    this.symbolCache.set(node, symbol);
    return symbol;
  }
  getSymbolOfAstTemplate(template) {
    const directives = this.getDirectivesOfNode(template);
    return { kind: SymbolKind.Template, directives, templateNode: template };
  }
  getSymbolOfElement(element) {
    var _a;
    const elementSourceSpan = (_a = element.startSourceSpan) != null ? _a : element.sourceSpan;
    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: elementSourceSpan,
      filter: ts44.isVariableDeclaration
    });
    if (node === null) {
      return null;
    }
    const symbolFromDeclaration = this.getSymbolOfTsNode(node);
    if (symbolFromDeclaration === null || symbolFromDeclaration.tsSymbol === null) {
      return null;
    }
    const directives = this.getDirectivesOfNode(element);
    return {
      ...symbolFromDeclaration,
      kind: SymbolKind.Element,
      directives,
      templateNode: element
    };
  }
  getDirectivesOfNode(element) {
    var _a;
    const elementSourceSpan = (_a = element.startSourceSpan) != null ? _a : element.sourceSpan;
    const tcbSourceFile = this.typeCheckBlock.getSourceFile();
    const isDirectiveDeclaration = (node) => (ts44.isTypeNode(node) || ts44.isIdentifier(node)) && ts44.isVariableDeclaration(node.parent) && hasExpressionIdentifier(tcbSourceFile, node, ExpressionIdentifier.DIRECTIVE);
    const nodes = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: elementSourceSpan,
      filter: isDirectiveDeclaration
    });
    const symbols = [];
    for (const node of nodes) {
      const symbol = this.getSymbolOfTsNode(node.parent);
      if (symbol === null || !isSymbolWithValueDeclaration(symbol.tsSymbol) || !ts44.isClassDeclaration(symbol.tsSymbol.valueDeclaration)) {
        continue;
      }
      const meta = this.getDirectiveMeta(element, symbol.tsSymbol.valueDeclaration);
      if (meta !== null && meta.selector !== null) {
        const ref = new Reference(symbol.tsSymbol.valueDeclaration);
        if (meta.hostDirectives !== null) {
          this.addHostDirectiveSymbols(element, meta.hostDirectives, symbols);
        }
        const directiveSymbol = {
          ...symbol,
          ref,
          tsSymbol: symbol.tsSymbol,
          selector: meta.selector,
          isComponent: meta.isComponent,
          ngModule: this.getDirectiveModule(symbol.tsSymbol.valueDeclaration),
          kind: SymbolKind.Directive,
          isStructural: meta.isStructural,
          isInScope: true,
          isHostDirective: false
        };
        symbols.push(directiveSymbol);
      }
    }
    return symbols;
  }
  addHostDirectiveSymbols(host, hostDirectives, symbols) {
    for (const current of hostDirectives) {
      if (!isHostDirectiveMetaForGlobalMode(current)) {
        throw new Error("Impossible state: typecheck code path in local compilation mode.");
      }
      if (!ts44.isClassDeclaration(current.directive.node)) {
        continue;
      }
      const symbol = this.getSymbolOfTsNode(current.directive.node);
      const meta = this.getDirectiveMeta(host, current.directive.node);
      if (meta !== null && symbol !== null && isSymbolWithValueDeclaration(symbol.tsSymbol)) {
        if (meta.hostDirectives !== null) {
          this.addHostDirectiveSymbols(host, meta.hostDirectives, symbols);
        }
        const directiveSymbol = {
          ...symbol,
          isHostDirective: true,
          ref: current.directive,
          tsSymbol: symbol.tsSymbol,
          exposedInputs: current.inputs,
          exposedOutputs: current.outputs,
          selector: meta.selector,
          isComponent: meta.isComponent,
          ngModule: this.getDirectiveModule(current.directive.node),
          kind: SymbolKind.Directive,
          isStructural: meta.isStructural,
          isInScope: true
        };
        symbols.push(directiveSymbol);
      }
    }
  }
  getDirectiveMeta(host, directiveDeclaration) {
    var _a;
    let directives = this.templateData.boundTarget.getDirectivesOfNode(host);
    const firstChild = host.children[0];
    if (firstChild instanceof TmplAstElement3) {
      const isMicrosyntaxTemplate = host instanceof TmplAstTemplate2 && sourceSpanEqual(firstChild.sourceSpan, host.sourceSpan);
      if (isMicrosyntaxTemplate) {
        const firstChildDirectives = this.templateData.boundTarget.getDirectivesOfNode(firstChild);
        if (firstChildDirectives !== null && directives !== null) {
          directives = directives.concat(firstChildDirectives);
        } else {
          directives = directives != null ? directives : firstChildDirectives;
        }
      }
    }
    if (directives === null) {
      return null;
    }
    return (_a = directives.find((m) => m.ref.node === directiveDeclaration)) != null ? _a : null;
  }
  getDirectiveModule(declaration) {
    const scope = this.componentScopeReader.getScopeForComponent(declaration);
    if (scope === null || scope.kind !== ComponentScopeKind.NgModule) {
      return null;
    }
    return scope.ngModule;
  }
  getSymbolOfBoundEvent(eventBinding) {
    const consumer = this.templateData.boundTarget.getConsumerOfBinding(eventBinding);
    if (consumer === null) {
      return null;
    }
    let expectedAccess;
    if (consumer instanceof TmplAstTemplate2 || consumer instanceof TmplAstElement3) {
      expectedAccess = "addEventListener";
    } else {
      const bindingPropertyNames = consumer.outputs.getByBindingPropertyName(eventBinding.name);
      if (bindingPropertyNames === null || bindingPropertyNames.length === 0) {
        return null;
      }
      expectedAccess = bindingPropertyNames[0].classPropertyName;
    }
    function filter(n2) {
      if (!isAccessExpression(n2)) {
        return false;
      }
      if (ts44.isPropertyAccessExpression(n2)) {
        return n2.name.getText() === expectedAccess;
      } else {
        return ts44.isStringLiteral(n2.argumentExpression) && n2.argumentExpression.text === expectedAccess;
      }
    }
    const outputFieldAccesses = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: eventBinding.keySpan,
      filter
    });
    const bindings = [];
    for (const outputFieldAccess of outputFieldAccesses) {
      if (consumer instanceof TmplAstTemplate2 || consumer instanceof TmplAstElement3) {
        if (!ts44.isPropertyAccessExpression(outputFieldAccess)) {
          continue;
        }
        const addEventListener = outputFieldAccess.name;
        const tsSymbol = this.getTypeChecker().getSymbolAtLocation(addEventListener);
        const tsType = this.getTypeChecker().getTypeAtLocation(addEventListener);
        const positionInFile = this.getTcbPositionForNode(addEventListener);
        const target = this.getSymbol(consumer);
        if (target === null || tsSymbol === void 0) {
          continue;
        }
        bindings.push({
          kind: SymbolKind.Binding,
          tsSymbol,
          tsType,
          target,
          tcbLocation: {
            tcbPath: this.tcbPath,
            isShimFile: this.tcbIsShim,
            positionInFile
          }
        });
      } else {
        if (!ts44.isElementAccessExpression(outputFieldAccess)) {
          continue;
        }
        const tsSymbol = this.getTypeChecker().getSymbolAtLocation(outputFieldAccess.argumentExpression);
        if (tsSymbol === void 0) {
          continue;
        }
        const target = this.getDirectiveSymbolForAccessExpression(outputFieldAccess, consumer);
        if (target === null) {
          continue;
        }
        const positionInFile = this.getTcbPositionForNode(outputFieldAccess);
        const tsType = this.getTypeChecker().getTypeAtLocation(outputFieldAccess);
        bindings.push({
          kind: SymbolKind.Binding,
          tsSymbol,
          tsType,
          target,
          tcbLocation: {
            tcbPath: this.tcbPath,
            isShimFile: this.tcbIsShim,
            positionInFile
          }
        });
      }
    }
    if (bindings.length === 0) {
      return null;
    }
    return { kind: SymbolKind.Output, bindings };
  }
  getSymbolOfInputBinding(binding) {
    const consumer = this.templateData.boundTarget.getConsumerOfBinding(binding);
    if (consumer === null) {
      return null;
    }
    if (consumer instanceof TmplAstElement3 || consumer instanceof TmplAstTemplate2) {
      const host = this.getSymbol(consumer);
      return host !== null ? { kind: SymbolKind.DomBinding, host } : null;
    }
    const nodes = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: binding.sourceSpan,
      filter: isAssignment
    });
    const bindings = [];
    for (const node of nodes) {
      if (!isAccessExpression(node.left)) {
        continue;
      }
      const signalInputAssignment = unwrapSignalInputWriteTAccessor(node.left);
      let fieldAccessExpr;
      let symbolInfo = null;
      if (signalInputAssignment !== null) {
        if (ts44.isIdentifier(signalInputAssignment.fieldExpr)) {
          continue;
        }
        const fieldSymbol = this.getSymbolOfTsNode(signalInputAssignment.fieldExpr);
        const typeSymbol = this.getSymbolOfTsNode(signalInputAssignment.typeExpr);
        fieldAccessExpr = signalInputAssignment.fieldExpr;
        symbolInfo = fieldSymbol === null || typeSymbol === null ? null : {
          tcbLocation: fieldSymbol.tcbLocation,
          tsSymbol: fieldSymbol.tsSymbol,
          tsType: typeSymbol.tsType
        };
      } else {
        fieldAccessExpr = node.left;
        symbolInfo = this.getSymbolOfTsNode(node.left);
      }
      if (symbolInfo === null || symbolInfo.tsSymbol === null) {
        continue;
      }
      const target = this.getDirectiveSymbolForAccessExpression(fieldAccessExpr, consumer);
      if (target === null) {
        continue;
      }
      bindings.push({
        ...symbolInfo,
        tsSymbol: symbolInfo.tsSymbol,
        kind: SymbolKind.Binding,
        target
      });
    }
    if (bindings.length === 0) {
      return null;
    }
    return { kind: SymbolKind.Input, bindings };
  }
  getDirectiveSymbolForAccessExpression(fieldAccessExpr, { isComponent, selector, isStructural }) {
    var _a;
    const tsSymbol = this.getTypeChecker().getSymbolAtLocation(fieldAccessExpr.expression);
    if ((tsSymbol == null ? void 0 : tsSymbol.declarations) === void 0 || tsSymbol.declarations.length === 0 || selector === null) {
      return null;
    }
    const [declaration] = tsSymbol.declarations;
    if (!ts44.isVariableDeclaration(declaration) || !hasExpressionIdentifier(
      declaration.getSourceFile(),
      (_a = declaration.type) != null ? _a : declaration.name,
      ExpressionIdentifier.DIRECTIVE
    )) {
      return null;
    }
    const symbol = this.getSymbolOfTsNode(declaration);
    if (symbol === null || !isSymbolWithValueDeclaration(symbol.tsSymbol) || !ts44.isClassDeclaration(symbol.tsSymbol.valueDeclaration)) {
      return null;
    }
    const ref = new Reference(symbol.tsSymbol.valueDeclaration);
    const ngModule = this.getDirectiveModule(symbol.tsSymbol.valueDeclaration);
    return {
      ref,
      kind: SymbolKind.Directive,
      tsSymbol: symbol.tsSymbol,
      tsType: symbol.tsType,
      tcbLocation: symbol.tcbLocation,
      isComponent,
      isStructural,
      selector,
      ngModule,
      isHostDirective: false,
      isInScope: true
    };
  }
  getSymbolOfVariable(variable) {
    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: variable.sourceSpan,
      filter: ts44.isVariableDeclaration
    });
    if (node === null) {
      return null;
    }
    let nodeValueSymbol = null;
    if (ts44.isForOfStatement(node.parent.parent)) {
      nodeValueSymbol = this.getSymbolOfTsNode(node);
    } else if (node.initializer !== void 0) {
      nodeValueSymbol = this.getSymbolOfTsNode(node.initializer);
    }
    if (nodeValueSymbol === null) {
      return null;
    }
    return {
      tsType: nodeValueSymbol.tsType,
      tsSymbol: nodeValueSymbol.tsSymbol,
      initializerLocation: nodeValueSymbol.tcbLocation,
      kind: SymbolKind.Variable,
      declaration: variable,
      localVarLocation: {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile: this.getTcbPositionForNode(node.name)
      }
    };
  }
  getSymbolOfReference(ref) {
    const target = this.templateData.boundTarget.getReferenceTarget(ref);
    let node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: ref.sourceSpan,
      filter: ts44.isVariableDeclaration
    });
    if (node === null || target === null || node.initializer === void 0) {
      return null;
    }
    const originalDeclaration = ts44.isParenthesizedExpression(node.initializer) && ts44.isAsExpression(node.initializer.expression) ? this.getTypeChecker().getSymbolAtLocation(node.name) : this.getTypeChecker().getSymbolAtLocation(node.initializer);
    if (originalDeclaration === void 0 || originalDeclaration.valueDeclaration === void 0) {
      return null;
    }
    const symbol = this.getSymbolOfTsNode(originalDeclaration.valueDeclaration);
    if (symbol === null || symbol.tsSymbol === null) {
      return null;
    }
    const referenceVarTcbLocation = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: this.getTcbPositionForNode(node)
    };
    if (target instanceof TmplAstTemplate2 || target instanceof TmplAstElement3) {
      return {
        kind: SymbolKind.Reference,
        tsSymbol: symbol.tsSymbol,
        tsType: symbol.tsType,
        target,
        declaration: ref,
        targetLocation: symbol.tcbLocation,
        referenceVarLocation: referenceVarTcbLocation
      };
    } else {
      if (!ts44.isClassDeclaration(target.directive.ref.node)) {
        return null;
      }
      return {
        kind: SymbolKind.Reference,
        tsSymbol: symbol.tsSymbol,
        tsType: symbol.tsType,
        declaration: ref,
        target: target.directive.ref.node,
        targetLocation: symbol.tcbLocation,
        referenceVarLocation: referenceVarTcbLocation
      };
    }
  }
  getSymbolOfLetDeclaration(decl) {
    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: decl.sourceSpan,
      filter: ts44.isVariableDeclaration
    });
    if (node === null) {
      return null;
    }
    const nodeValueSymbol = this.getSymbolOfTsNode(node.initializer);
    if (nodeValueSymbol === null) {
      return null;
    }
    return {
      tsType: nodeValueSymbol.tsType,
      tsSymbol: nodeValueSymbol.tsSymbol,
      initializerLocation: nodeValueSymbol.tcbLocation,
      kind: SymbolKind.LetDeclaration,
      declaration: decl,
      localVarLocation: {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile: this.getTcbPositionForNode(node.name)
      }
    };
  }
  getSymbolOfPipe(expression) {
    const methodAccess = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: expression.nameSpan,
      filter: ts44.isPropertyAccessExpression
    });
    if (methodAccess === null) {
      return null;
    }
    const pipeVariableNode = methodAccess.expression;
    const pipeDeclaration = this.getTypeChecker().getSymbolAtLocation(pipeVariableNode);
    if (pipeDeclaration === void 0 || pipeDeclaration.valueDeclaration === void 0) {
      return null;
    }
    const pipeInstance = this.getSymbolOfTsNode(pipeDeclaration.valueDeclaration);
    if (pipeInstance === null || !isSymbolWithValueDeclaration(pipeInstance.tsSymbol)) {
      return null;
    }
    const symbolInfo = this.getSymbolOfTsNode(methodAccess);
    if (symbolInfo === null) {
      return null;
    }
    return {
      kind: SymbolKind.Pipe,
      ...symbolInfo,
      classSymbol: {
        ...pipeInstance,
        tsSymbol: pipeInstance.tsSymbol
      }
    };
  }
  getSymbolOfTemplateExpression(expression) {
    if (expression instanceof ASTWithSource2) {
      expression = expression.ast;
    }
    const expressionTarget = this.templateData.boundTarget.getExpressionTarget(expression);
    if (expressionTarget !== null) {
      return this.getSymbol(expressionTarget);
    }
    let withSpan = expression.sourceSpan;
    if (expression instanceof PropertyWrite3 || expression instanceof ASTWithName && !(expression instanceof SafePropertyRead4)) {
      withSpan = expression.nameSpan;
    }
    let node = null;
    if (expression instanceof PropertyRead4) {
      node = findFirstMatchingNode(this.typeCheckBlock, {
        withSpan,
        filter: ts44.isPropertyAccessExpression
      });
    }
    if (node === null) {
      node = findFirstMatchingNode(this.typeCheckBlock, { withSpan, filter: anyNodeFilter });
    }
    if (node === null) {
      return null;
    }
    while (ts44.isParenthesizedExpression(node)) {
      node = node.expression;
    }
    if (expression instanceof SafePropertyRead4 && ts44.isConditionalExpression(node)) {
      const whenTrueSymbol = this.getSymbolOfTsNode(node.whenTrue);
      if (whenTrueSymbol === null) {
        return null;
      }
      return {
        ...whenTrueSymbol,
        kind: SymbolKind.Expression,
        tsType: this.getTypeChecker().getTypeAtLocation(node)
      };
    } else {
      const symbolInfo = this.getSymbolOfTsNode(node);
      return symbolInfo === null ? null : { ...symbolInfo, kind: SymbolKind.Expression };
    }
  }
  getSymbolOfTsNode(node) {
    var _a;
    while (ts44.isParenthesizedExpression(node)) {
      node = node.expression;
    }
    let tsSymbol;
    if (ts44.isPropertyAccessExpression(node)) {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.name);
    } else if (ts44.isCallExpression(node)) {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.expression);
    } else {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node);
    }
    const positionInFile = this.getTcbPositionForNode(node);
    const type = this.getTypeChecker().getTypeAtLocation(node);
    return {
      tsSymbol: (_a = tsSymbol != null ? tsSymbol : type.symbol) != null ? _a : null,
      tsType: type,
      tcbLocation: {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile
      }
    };
  }
  getTcbPositionForNode(node) {
    if (ts44.isTypeReferenceNode(node)) {
      return this.getTcbPositionForNode(node.typeName);
    } else if (ts44.isQualifiedName(node)) {
      return node.right.getStart();
    } else if (ts44.isPropertyAccessExpression(node)) {
      return node.name.getStart();
    } else if (ts44.isElementAccessExpression(node)) {
      return node.argumentExpression.getStart();
    } else {
      return node.getStart();
    }
  }
};
function anyNodeFilter(n2) {
  return true;
}
function sourceSpanEqual(a, b) {
  return a.start.offset === b.start.offset && a.end.offset === b.end.offset;
}
function unwrapSignalInputWriteTAccessor(expr) {
  if (!ts44.isElementAccessExpression(expr) || !ts44.isPropertyAccessExpression(expr.argumentExpression)) {
    return null;
  }
  if (!ts44.isIdentifier(expr.argumentExpression.name) || expr.argumentExpression.name.text !== R3Identifiers5.InputSignalBrandWriteType.name) {
    return null;
  }
  if (!ts44.isPropertyAccessExpression(expr.expression) && !ts44.isElementAccessExpression(expr.expression) && !ts44.isIdentifier(expr.expression)) {
    throw new Error("Unexpected expression for signal input write type.");
  }
  return {
    fieldExpr: expr.expression,
    typeExpr: expr
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/checker.mjs
var REGISTRY2 = new DomElementSchemaRegistry2();
var TemplateTypeCheckerImpl = class {
  originalProgram;
  programDriver;
  typeCheckAdapter;
  config;
  refEmitter;
  reflector;
  compilerHost;
  priorBuild;
  metaReader;
  localMetaReader;
  ngModuleIndex;
  componentScopeReader;
  typeCheckScopeRegistry;
  perf;
  state = /* @__PURE__ */ new Map();
  completionCache = /* @__PURE__ */ new Map();
  symbolBuilderCache = /* @__PURE__ */ new Map();
  scopeCache = /* @__PURE__ */ new Map();
  elementTagCache = /* @__PURE__ */ new Map();
  isComplete = false;
  constructor(originalProgram, programDriver, typeCheckAdapter, config, refEmitter, reflector, compilerHost, priorBuild, metaReader, localMetaReader, ngModuleIndex, componentScopeReader, typeCheckScopeRegistry, perf) {
    this.originalProgram = originalProgram;
    this.programDriver = programDriver;
    this.typeCheckAdapter = typeCheckAdapter;
    this.config = config;
    this.refEmitter = refEmitter;
    this.reflector = reflector;
    this.compilerHost = compilerHost;
    this.priorBuild = priorBuild;
    this.metaReader = metaReader;
    this.localMetaReader = localMetaReader;
    this.ngModuleIndex = ngModuleIndex;
    this.componentScopeReader = componentScopeReader;
    this.typeCheckScopeRegistry = typeCheckScopeRegistry;
    this.perf = perf;
  }
  getTemplate(component, optimizeFor) {
    const { data } = this.getLatestComponentState(component, optimizeFor);
    if (data === null) {
      return null;
    }
    return data.template;
  }
  getUsedDirectives(component) {
    var _a;
    return ((_a = this.getLatestComponentState(component).data) == null ? void 0 : _a.boundTarget.getUsedDirectives()) || null;
  }
  getUsedPipes(component) {
    var _a;
    return ((_a = this.getLatestComponentState(component).data) == null ? void 0 : _a.boundTarget.getUsedPipes()) || null;
  }
  getLatestComponentState(component, optimizeFor = OptimizeFor.SingleFile) {
    switch (optimizeFor) {
      case OptimizeFor.WholeProgram:
        this.ensureAllShimsForAllFiles();
        break;
      case OptimizeFor.SingleFile:
        this.ensureShimForComponent(component);
        break;
    }
    const sf = component.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileRecord = this.getFileData(sfPath);
    if (!fileRecord.shimData.has(shimPath)) {
      return { data: null, tcb: null, tcbPath: shimPath, tcbIsShim: true };
    }
    const templateId = fileRecord.sourceManager.getTemplateId(component);
    const shimRecord = fileRecord.shimData.get(shimPath);
    const id = fileRecord.sourceManager.getTemplateId(component);
    const program = this.programDriver.getProgram();
    const shimSf = getSourceFileOrNull(program, shimPath);
    if (shimSf === null || !fileRecord.shimData.has(shimPath)) {
      throw new Error(`Error: no shim file in program: ${shimPath}`);
    }
    let tcb = findTypeCheckBlock(shimSf, id, false);
    let tcbPath = shimPath;
    if (tcb === null) {
      const inlineSf = getSourceFileOrError(program, sfPath);
      tcb = findTypeCheckBlock(inlineSf, id, false);
      if (tcb !== null) {
        tcbPath = sfPath;
      }
    }
    let data = null;
    if (shimRecord.templates.has(templateId)) {
      data = shimRecord.templates.get(templateId);
    }
    return { data, tcb, tcbPath, tcbIsShim: tcbPath === shimPath };
  }
  isTrackedTypeCheckFile(filePath) {
    return this.getFileAndShimRecordsForPath(filePath) !== null;
  }
  getFileRecordForTcbLocation({ tcbPath, isShimFile }) {
    if (!isShimFile) {
      if (this.state.has(tcbPath)) {
        return this.state.get(tcbPath);
      } else {
        return null;
      }
    }
    const records = this.getFileAndShimRecordsForPath(tcbPath);
    if (records !== null) {
      return records.fileRecord;
    } else {
      return null;
    }
  }
  getFileAndShimRecordsForPath(shimPath) {
    for (const fileRecord of this.state.values()) {
      if (fileRecord.shimData.has(shimPath)) {
        return { fileRecord, shimRecord: fileRecord.shimData.get(shimPath) };
      }
    }
    return null;
  }
  getTemplateMappingAtTcbLocation(tcbLocation) {
    const fileRecord = this.getFileRecordForTcbLocation(tcbLocation);
    if (fileRecord === null) {
      return null;
    }
    const shimSf = this.programDriver.getProgram().getSourceFile(tcbLocation.tcbPath);
    if (shimSf === void 0) {
      return null;
    }
    return getTemplateMapping(
      shimSf,
      tcbLocation.positionInFile,
      fileRecord.sourceManager,
      false
    );
  }
  generateAllTypeCheckBlocks() {
    this.ensureAllShimsForAllFiles();
  }
  getDiagnosticsForFile(sf, optimizeFor) {
    switch (optimizeFor) {
      case OptimizeFor.WholeProgram:
        this.ensureAllShimsForAllFiles();
        break;
      case OptimizeFor.SingleFile:
        this.ensureAllShimsForOneFile(sf);
        break;
    }
    return this.perf.inPhase(PerfPhase.TtcDiagnostics, () => {
      const sfPath = absoluteFromSourceFile(sf);
      const fileRecord = this.state.get(sfPath);
      const typeCheckProgram = this.programDriver.getProgram();
      const diagnostics = [];
      if (fileRecord.hasInlines) {
        const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
        diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(inlineSf).map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)));
      }
      for (const [shimPath, shimRecord] of fileRecord.shimData) {
        const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
        diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(shimSf).map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)));
        diagnostics.push(...shimRecord.genesisDiagnostics);
        for (const templateData of shimRecord.templates.values()) {
          diagnostics.push(...templateData.templateDiagnostics);
        }
      }
      return diagnostics.filter((diag) => diag !== null);
    });
  }
  getDiagnosticsForComponent(component) {
    this.ensureShimForComponent(component);
    return this.perf.inPhase(PerfPhase.TtcDiagnostics, () => {
      const sf = component.getSourceFile();
      const sfPath = absoluteFromSourceFile(sf);
      const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
      const fileRecord = this.getFileData(sfPath);
      if (!fileRecord.shimData.has(shimPath)) {
        return [];
      }
      const templateId = fileRecord.sourceManager.getTemplateId(component);
      const shimRecord = fileRecord.shimData.get(shimPath);
      const typeCheckProgram = this.programDriver.getProgram();
      const diagnostics = [];
      if (shimRecord.hasInlines) {
        const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
        diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(inlineSf).map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)));
      }
      const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
      diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(shimSf).map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)));
      diagnostics.push(...shimRecord.genesisDiagnostics);
      for (const templateData of shimRecord.templates.values()) {
        diagnostics.push(...templateData.templateDiagnostics);
      }
      return diagnostics.filter((diag) => diag !== null && diag.templateId === templateId);
    });
  }
  getTypeCheckBlock(component) {
    return this.getLatestComponentState(component).tcb;
  }
  getGlobalCompletions(context, component, node) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () => engine.getGlobalCompletions(context, node));
  }
  getExpressionCompletionLocation(ast, component) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () => engine.getExpressionCompletionLocation(ast));
  }
  getLiteralCompletionLocation(node, component) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () => engine.getLiteralCompletionLocation(node));
  }
  invalidateClass(clazz) {
    this.completionCache.delete(clazz);
    this.symbolBuilderCache.delete(clazz);
    this.scopeCache.delete(clazz);
    this.elementTagCache.delete(clazz);
    const sf = clazz.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileData = this.getFileData(sfPath);
    const templateId = fileData.sourceManager.getTemplateId(clazz);
    fileData.shimData.delete(shimPath);
    fileData.isComplete = false;
    this.isComplete = false;
  }
  getExpressionTarget(expression, clazz) {
    var _a;
    return ((_a = this.getLatestComponentState(clazz).data) == null ? void 0 : _a.boundTarget.getExpressionTarget(expression)) || null;
  }
  makeTemplateDiagnostic(clazz, sourceSpan, category, errorCode, message, relatedInformation) {
    const sfPath = absoluteFromSourceFile(clazz.getSourceFile());
    const fileRecord = this.state.get(sfPath);
    const templateId = fileRecord.sourceManager.getTemplateId(clazz);
    const mapping = fileRecord.sourceManager.getSourceMapping(templateId);
    return {
      ...makeTemplateDiagnostic(templateId, mapping, sourceSpan, category, ngErrorCode(errorCode), message, relatedInformation),
      __ngCode: errorCode
    };
  }
  getOrCreateCompletionEngine(component) {
    if (this.completionCache.has(component)) {
      return this.completionCache.get(component);
    }
    const { tcb, data, tcbPath, tcbIsShim } = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }
    const engine = new CompletionEngine(tcb, data, tcbPath, tcbIsShim);
    this.completionCache.set(component, engine);
    return engine;
  }
  maybeAdoptPriorResultsForFile(sf) {
    const sfPath = absoluteFromSourceFile(sf);
    if (this.state.has(sfPath)) {
      const existingResults = this.state.get(sfPath);
      if (existingResults.isComplete) {
        return;
      }
    }
    const previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
    if (previousResults === null || !previousResults.isComplete) {
      return;
    }
    this.perf.eventCount(PerfEvent.ReuseTypeCheckFile);
    this.state.set(sfPath, previousResults);
  }
  ensureAllShimsForAllFiles() {
    if (this.isComplete) {
      return;
    }
    this.perf.inPhase(PerfPhase.TcbGeneration, () => {
      const host = new WholeProgramTypeCheckingHost(this);
      const ctx = this.newContext(host);
      for (const sf of this.originalProgram.getSourceFiles()) {
        if (sf.isDeclarationFile || isShim(sf)) {
          continue;
        }
        this.maybeAdoptPriorResultsForFile(sf);
        const sfPath = absoluteFromSourceFile(sf);
        const fileData = this.getFileData(sfPath);
        if (fileData.isComplete) {
          continue;
        }
        this.typeCheckAdapter.typeCheck(sf, ctx);
        fileData.isComplete = true;
      }
      this.updateFromContext(ctx);
      this.isComplete = true;
    });
  }
  ensureAllShimsForOneFile(sf) {
    this.perf.inPhase(PerfPhase.TcbGeneration, () => {
      this.maybeAdoptPriorResultsForFile(sf);
      const sfPath = absoluteFromSourceFile(sf);
      const fileData = this.getFileData(sfPath);
      if (fileData.isComplete) {
        return;
      }
      const host = new SingleFileTypeCheckingHost(sfPath, fileData, this);
      const ctx = this.newContext(host);
      this.typeCheckAdapter.typeCheck(sf, ctx);
      fileData.isComplete = true;
      this.updateFromContext(ctx);
    });
  }
  ensureShimForComponent(component) {
    const sf = component.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    this.maybeAdoptPriorResultsForFile(sf);
    const fileData = this.getFileData(sfPath);
    if (fileData.shimData.has(shimPath)) {
      return;
    }
    const host = new SingleShimTypeCheckingHost(sfPath, fileData, this, shimPath);
    const ctx = this.newContext(host);
    this.typeCheckAdapter.typeCheck(sf, ctx);
    this.updateFromContext(ctx);
  }
  newContext(host) {
    const inlining = this.programDriver.supportsInlineOperations ? InliningMode.InlineOps : InliningMode.Error;
    return new TypeCheckContextImpl(this.config, this.compilerHost, this.refEmitter, this.reflector, host, inlining, this.perf);
  }
  clearAllShimDataUsingInlines() {
    for (const fileData of this.state.values()) {
      if (!fileData.hasInlines) {
        continue;
      }
      for (const [shimFile, shimData] of fileData.shimData.entries()) {
        if (shimData.hasInlines) {
          fileData.shimData.delete(shimFile);
        }
      }
      fileData.hasInlines = false;
      fileData.isComplete = false;
      this.isComplete = false;
    }
  }
  updateFromContext(ctx) {
    const updates = ctx.finalize();
    return this.perf.inPhase(PerfPhase.TcbUpdateProgram, () => {
      if (updates.size > 0) {
        this.perf.eventCount(PerfEvent.UpdateTypeCheckProgram);
      }
      this.programDriver.updateFiles(updates, UpdateMode.Incremental);
      this.priorBuild.recordSuccessfulTypeCheck(this.state);
      this.perf.memory(PerfCheckpoint.TtcUpdateProgram);
    });
  }
  getFileData(path) {
    if (!this.state.has(path)) {
      this.state.set(path, {
        hasInlines: false,
        sourceManager: new TemplateSourceManager(),
        isComplete: false,
        shimData: /* @__PURE__ */ new Map()
      });
    }
    return this.state.get(path);
  }
  getSymbolOfNode(node, component) {
    const builder = this.getOrCreateSymbolBuilder(component);
    if (builder === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcSymbol, () => builder.getSymbol(node));
  }
  getOrCreateSymbolBuilder(component) {
    if (this.symbolBuilderCache.has(component)) {
      return this.symbolBuilderCache.get(component);
    }
    const { tcb, data, tcbPath, tcbIsShim } = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }
    const builder = new SymbolBuilder(tcbPath, tcbIsShim, tcb, data, this.componentScopeReader, () => this.programDriver.getProgram().getTypeChecker());
    this.symbolBuilderCache.set(component, builder);
    return builder;
  }
  getPotentialTemplateDirectives(component) {
    var _a, _b;
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    const inScopeDirectives = (_b = (_a = this.getScopeData(component)) == null ? void 0 : _a.directives) != null ? _b : [];
    const resultingDirectives = /* @__PURE__ */ new Map();
    for (const d of inScopeDirectives) {
      resultingDirectives.set(d.ref.node, d);
    }
    for (const directiveClass of this.localMetaReader.getKnown(MetaKind.Directive)) {
      const directiveMeta = this.metaReader.getDirectiveMetadata(new Reference(directiveClass));
      if (directiveMeta === null)
        continue;
      if (resultingDirectives.has(directiveClass))
        continue;
      const withScope = this.scopeDataOfDirectiveMeta(typeChecker, directiveMeta);
      if (withScope === null)
        continue;
      resultingDirectives.set(directiveClass, { ...withScope, isInScope: false });
    }
    return Array.from(resultingDirectives.values());
  }
  getPotentialPipes(component) {
    var _a, _b;
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    const inScopePipes = (_b = (_a = this.getScopeData(component)) == null ? void 0 : _a.pipes) != null ? _b : [];
    const resultingPipes = /* @__PURE__ */ new Map();
    for (const p of inScopePipes) {
      resultingPipes.set(p.ref.node, p);
    }
    for (const pipeClass of this.localMetaReader.getKnown(MetaKind.Pipe)) {
      const pipeMeta = this.metaReader.getPipeMetadata(new Reference(pipeClass));
      if (pipeMeta === null)
        continue;
      if (resultingPipes.has(pipeClass))
        continue;
      const withScope = this.scopeDataOfPipeMeta(typeChecker, pipeMeta);
      if (withScope === null)
        continue;
      resultingPipes.set(pipeClass, { ...withScope, isInScope: false });
    }
    return Array.from(resultingPipes.values());
  }
  getDirectiveMetadata(dir) {
    if (!isNamedClassDeclaration(dir)) {
      return null;
    }
    return this.typeCheckScopeRegistry.getTypeCheckDirectiveMetadata(new Reference(dir));
  }
  getNgModuleMetadata(module) {
    if (!isNamedClassDeclaration(module)) {
      return null;
    }
    return this.metaReader.getNgModuleMetadata(new Reference(module));
  }
  getPipeMetadata(pipe) {
    if (!isNamedClassDeclaration(pipe)) {
      return null;
    }
    return this.metaReader.getPipeMetadata(new Reference(pipe));
  }
  getPotentialElementTags(component) {
    if (this.elementTagCache.has(component)) {
      return this.elementTagCache.get(component);
    }
    const tagMap = /* @__PURE__ */ new Map();
    for (const tag of REGISTRY2.allKnownElementNames()) {
      tagMap.set(tag, null);
    }
    const potentialDirectives = this.getPotentialTemplateDirectives(component);
    for (const directive of potentialDirectives) {
      if (directive.selector === null) {
        continue;
      }
      for (const selector of CssSelector3.parse(directive.selector)) {
        if (selector.element === null || tagMap.has(selector.element)) {
          continue;
        }
        tagMap.set(selector.element, directive);
      }
    }
    this.elementTagCache.set(component, tagMap);
    return tagMap;
  }
  getPotentialDomBindings(tagName) {
    const attributes = REGISTRY2.allKnownAttributesOfElement(tagName);
    return attributes.map((attribute) => ({
      attribute,
      property: REGISTRY2.getMappedPropName(attribute)
    }));
  }
  getPotentialDomEvents(tagName) {
    return REGISTRY2.allKnownEventsOfElement(tagName);
  }
  getPrimaryAngularDecorator(target) {
    this.ensureAllShimsForOneFile(target.getSourceFile());
    if (!isNamedClassDeclaration(target)) {
      return null;
    }
    const ref = new Reference(target);
    const dirMeta = this.metaReader.getDirectiveMetadata(ref);
    if (dirMeta !== null) {
      return dirMeta.decorator;
    }
    const pipeMeta = this.metaReader.getPipeMetadata(ref);
    if (pipeMeta !== null) {
      return pipeMeta.decorator;
    }
    const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
    if (ngModuleMeta !== null) {
      return ngModuleMeta.decorator;
    }
    return null;
  }
  getOwningNgModule(component) {
    if (!isNamedClassDeclaration(component)) {
      return null;
    }
    const dirMeta = this.metaReader.getDirectiveMetadata(new Reference(component));
    if (dirMeta !== null && dirMeta.isStandalone) {
      return null;
    }
    const scope = this.componentScopeReader.getScopeForComponent(component);
    if (scope === null || scope.kind !== ComponentScopeKind.NgModule || !isNamedClassDeclaration(scope.ngModule)) {
      return null;
    }
    return scope.ngModule;
  }
  emit(kind, refTo, inContext) {
    var _a, _b;
    const emittedRef = this.refEmitter.emit(refTo, inContext.getSourceFile());
    if (emittedRef.kind === ReferenceEmitKind.Failed) {
      return null;
    }
    const emitted = emittedRef.expression;
    if (emitted instanceof WrappedNodeExpr9) {
      if (refTo.node === inContext) {
        return null;
      }
      let isForwardReference = false;
      if (emitted.node.getStart() > inContext.getStart()) {
        const declaration = (_b = (_a = this.programDriver.getProgram().getTypeChecker().getTypeAtLocation(emitted.node).getSymbol()) == null ? void 0 : _a.declarations) == null ? void 0 : _b[0];
        if (declaration && declaration.getSourceFile() === inContext.getSourceFile()) {
          isForwardReference = true;
        }
      }
      return { kind, symbolName: emitted.node.text, isForwardReference };
    } else if (emitted instanceof ExternalExpr7 && emitted.value.moduleName !== null && emitted.value.name !== null) {
      return {
        kind,
        moduleSpecifier: emitted.value.moduleName,
        symbolName: emitted.value.name,
        isForwardReference: false
      };
    }
    return null;
  }
  getPotentialImportsFor(toImport, inContext, importMode) {
    var _a;
    const imports = [];
    const meta = (_a = this.metaReader.getDirectiveMetadata(toImport)) != null ? _a : this.metaReader.getPipeMetadata(toImport);
    if (meta === null) {
      return imports;
    }
    if (meta.isStandalone || importMode === PotentialImportMode.ForceDirect) {
      const emitted = this.emit(PotentialImportKind.Standalone, toImport, inContext);
      if (emitted !== null) {
        imports.push(emitted);
      }
    }
    const exportingNgModules = this.ngModuleIndex.getNgModulesExporting(meta.ref.node);
    if (exportingNgModules !== null) {
      for (const exporter of exportingNgModules) {
        const emittedRef = this.emit(PotentialImportKind.NgModule, exporter, inContext);
        if (emittedRef !== null) {
          imports.push(emittedRef);
        }
      }
    }
    return imports;
  }
  getScopeData(component) {
    if (this.scopeCache.has(component)) {
      return this.scopeCache.get(component);
    }
    if (!isNamedClassDeclaration(component)) {
      throw new Error(`AssertionError: components must have names`);
    }
    const scope = this.componentScopeReader.getScopeForComponent(component);
    if (scope === null) {
      return null;
    }
    const dependencies = scope.kind === ComponentScopeKind.NgModule ? scope.compilation.dependencies : scope.dependencies;
    const data = {
      directives: [],
      pipes: [],
      isPoisoned: scope.kind === ComponentScopeKind.NgModule ? scope.compilation.isPoisoned : scope.isPoisoned
    };
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    for (const dep of dependencies) {
      if (dep.kind === MetaKind.Directive) {
        const dirScope = this.scopeDataOfDirectiveMeta(typeChecker, dep);
        if (dirScope === null)
          continue;
        data.directives.push({ ...dirScope, isInScope: true });
      } else if (dep.kind === MetaKind.Pipe) {
        const pipeScope = this.scopeDataOfPipeMeta(typeChecker, dep);
        if (pipeScope === null)
          continue;
        data.pipes.push({ ...pipeScope, isInScope: true });
      }
    }
    this.scopeCache.set(component, data);
    return data;
  }
  scopeDataOfDirectiveMeta(typeChecker, dep) {
    if (dep.selector === null) {
      return null;
    }
    const tsSymbol = typeChecker.getSymbolAtLocation(dep.ref.node.name);
    if (!isSymbolWithValueDeclaration(tsSymbol)) {
      return null;
    }
    let ngModule = null;
    const moduleScopeOfDir = this.componentScopeReader.getScopeForComponent(dep.ref.node);
    if (moduleScopeOfDir !== null && moduleScopeOfDir.kind === ComponentScopeKind.NgModule) {
      ngModule = moduleScopeOfDir.ngModule;
    }
    return {
      ref: dep.ref,
      isComponent: dep.isComponent,
      isStructural: dep.isStructural,
      selector: dep.selector,
      tsSymbol,
      ngModule
    };
  }
  scopeDataOfPipeMeta(typeChecker, dep) {
    const tsSymbol = typeChecker.getSymbolAtLocation(dep.ref.node.name);
    if (tsSymbol === void 0) {
      return null;
    }
    return {
      ref: dep.ref,
      name: dep.name,
      tsSymbol
    };
  }
};
function convertDiagnostic(diag, sourceResolver) {
  if (!shouldReportDiagnostic(diag)) {
    return null;
  }
  return translateDiagnostic(diag, sourceResolver);
}
var WholeProgramTypeCheckingHost = class {
  impl;
  constructor(impl) {
    this.impl = impl;
  }
  getSourceManager(sfPath) {
    return this.impl.getFileData(sfPath).sourceManager;
  }
  shouldCheckComponent(node) {
    const sfPath = absoluteFromSourceFile(node.getSourceFile());
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileData = this.impl.getFileData(sfPath);
    return !fileData.shimData.has(shimPath);
  }
  recordShimData(sfPath, data) {
    const fileData = this.impl.getFileData(sfPath);
    fileData.shimData.set(data.path, data);
    if (data.hasInlines) {
      fileData.hasInlines = true;
    }
  }
  recordComplete(sfPath) {
    this.impl.getFileData(sfPath).isComplete = true;
  }
};
var SingleFileTypeCheckingHost = class {
  sfPath;
  fileData;
  impl;
  seenInlines = false;
  constructor(sfPath, fileData, impl) {
    this.sfPath = sfPath;
    this.fileData = fileData;
    this.impl = impl;
  }
  assertPath(sfPath) {
    if (this.sfPath !== sfPath) {
      throw new Error(`AssertionError: querying TypeCheckingHost outside of assigned file`);
    }
  }
  getSourceManager(sfPath) {
    this.assertPath(sfPath);
    return this.fileData.sourceManager;
  }
  shouldCheckComponent(node) {
    if (this.sfPath !== absoluteFromSourceFile(node.getSourceFile())) {
      return false;
    }
    const shimPath = TypeCheckShimGenerator.shimFor(this.sfPath);
    return !this.fileData.shimData.has(shimPath);
  }
  recordShimData(sfPath, data) {
    this.assertPath(sfPath);
    if (data.hasInlines && !this.seenInlines) {
      this.impl.clearAllShimDataUsingInlines();
      this.seenInlines = true;
    }
    this.fileData.shimData.set(data.path, data);
    if (data.hasInlines) {
      this.fileData.hasInlines = true;
    }
  }
  recordComplete(sfPath) {
    this.assertPath(sfPath);
    this.fileData.isComplete = true;
  }
};
var SingleShimTypeCheckingHost = class extends SingleFileTypeCheckingHost {
  shimPath;
  constructor(sfPath, fileData, impl, shimPath) {
    super(sfPath, fileData, impl);
    this.shimPath = shimPath;
  }
  shouldCheckNode(node) {
    if (this.sfPath !== absoluteFromSourceFile(node.getSourceFile())) {
      return false;
    }
    const shimPath = TypeCheckShimGenerator.shimFor(this.sfPath);
    if (shimPath !== this.shimPath) {
      return false;
    }
    return !this.fileData.shimData.has(shimPath);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/hmr/src/metadata.mjs
import { outputAst as o3 } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/hmr/src/extract_dependencies.mjs
import { outputAst as o2 } from "@angular/compiler";
import ts45 from "typescript";
function extractHmrDependencies(node, definition, factory, deferBlockMetadata, classMetadata, debugInfo, reflection, evaluator) {
  var _a, _b;
  const name = ts45.isClassDeclaration(node) && node.name ? node.name.text : null;
  const visitor = new PotentialTopLevelReadsVisitor();
  const sourceFile = node.getSourceFile();
  definition.expression.visitExpression(visitor, null);
  definition.statements.forEach((statement) => statement.visitStatement(visitor, null));
  (_a = factory.initializer) == null ? void 0 : _a.visitExpression(visitor, null);
  factory.statements.forEach((statement) => statement.visitStatement(visitor, null));
  classMetadata == null ? void 0 : classMetadata.visitStatement(visitor, null);
  debugInfo == null ? void 0 : debugInfo.visitStatement(visitor, null);
  if (deferBlockMetadata.mode === 0) {
    deferBlockMetadata.blocks.forEach((loader) => loader == null ? void 0 : loader.visitExpression(visitor, null));
  } else {
    (_b = deferBlockMetadata.dependenciesFn) == null ? void 0 : _b.visitExpression(visitor, null);
  }
  const availableTopLevel = getTopLevelDeclarationNames(sourceFile);
  const local = [];
  const seenLocals = /* @__PURE__ */ new Set();
  for (const readNode of visitor.allReads) {
    const readName = readNode instanceof o2.ReadVarExpr ? readNode.name : readNode.text;
    if (readName !== name && !seenLocals.has(readName) && availableTopLevel.has(readName)) {
      const runtimeRepresentation = getRuntimeRepresentation(readNode, reflection, evaluator);
      if (runtimeRepresentation === null) {
        return null;
      }
      local.push({ name: readName, runtimeRepresentation });
      seenLocals.add(readName);
    }
  }
  return {
    local,
    external: Array.from(visitor.namespaceReads, (name2, index) => ({
      moduleName: name2,
      assignedName: `\u0275hmr${index}`
    }))
  };
}
function getRuntimeRepresentation(node, reflection, evaluator) {
  if (node instanceof o2.ReadVarExpr) {
    return o2.variable(node.name);
  }
  if (isConstEnumReference(node, reflection)) {
    const evaluated = evaluator.evaluate(node);
    if (evaluated instanceof Map) {
      const members = [];
      for (const [name, value] of evaluated.entries()) {
        if (value instanceof EnumValue && (value.resolved == null || typeof value.resolved === "string" || typeof value.resolved === "boolean" || typeof value.resolved === "number")) {
          members.push({
            key: name,
            quoted: false,
            value: o2.literal(value.resolved)
          });
        } else {
          return null;
        }
      }
      return o2.literalMap(members);
    }
  }
  return o2.variable(node.text);
}
function getTopLevelDeclarationNames(sourceFile) {
  const results = /* @__PURE__ */ new Set();
  for (const node of sourceFile.statements) {
    if (ts45.isClassDeclaration(node) || ts45.isFunctionDeclaration(node) || ts45.isEnumDeclaration(node)) {
      if (node.name) {
        results.add(node.name.text);
      }
      continue;
    }
    if (ts45.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        trackBindingName(decl.name, results);
      }
      continue;
    }
    if (ts45.isImportDeclaration(node) && node.importClause) {
      const importClause = node.importClause;
      if (importClause.isTypeOnly) {
        continue;
      }
      if (importClause.name) {
        results.add(importClause.name.text);
      }
      if (importClause.namedBindings) {
        const namedBindings = importClause.namedBindings;
        if (ts45.isNamespaceImport(namedBindings)) {
          results.add(namedBindings.name.text);
        } else {
          namedBindings.elements.forEach((el) => {
            if (!el.isTypeOnly) {
              results.add(el.name.text);
            }
          });
        }
      }
      continue;
    }
  }
  return results;
}
function trackBindingName(node, results) {
  if (ts45.isIdentifier(node)) {
    results.add(node.text);
  } else {
    for (const el of node.elements) {
      if (!ts45.isOmittedExpression(el)) {
        trackBindingName(el.name, results);
      }
    }
  }
}
var PotentialTopLevelReadsVisitor = class extends o2.RecursiveAstVisitor {
  allReads = /* @__PURE__ */ new Set();
  namespaceReads = /* @__PURE__ */ new Set();
  visitExternalExpr(ast, context) {
    if (ast.value.moduleName !== null) {
      this.namespaceReads.add(ast.value.moduleName);
    }
    super.visitExternalExpr(ast, context);
  }
  visitReadVarExpr(ast, context) {
    this.allReads.add(ast);
    super.visitReadVarExpr(ast, context);
  }
  visitWrappedNodeExpr(ast, context) {
    if (this.isTypeScriptNode(ast.node)) {
      this.addAllTopLevelIdentifiers(ast.node);
    }
    super.visitWrappedNodeExpr(ast, context);
  }
  addAllTopLevelIdentifiers = (node) => {
    if (ts45.isIdentifier(node) && this.isTopLevelIdentifierReference(node)) {
      this.allReads.add(node);
    } else {
      ts45.forEachChild(node, this.addAllTopLevelIdentifiers);
    }
  };
  isTopLevelIdentifierReference(identifier) {
    let node = identifier;
    let parent = node.parent;
    if (!parent) {
      return false;
    }
    if (ts45.isParenthesizedExpression(parent) && parent.expression === node) {
      while (parent && ts45.isParenthesizedExpression(parent)) {
        node = parent;
        parent = parent.parent;
      }
    }
    if (ts45.isSourceFile(parent)) {
      return true;
    }
    if (ts45.isCallExpression(parent)) {
      return parent.expression === node || parent.arguments.includes(node);
    }
    if (ts45.isExpressionStatement(parent) || ts45.isPropertyAccessExpression(parent) || ts45.isComputedPropertyName(parent) || ts45.isTemplateSpan(parent) || ts45.isSpreadAssignment(parent) || ts45.isSpreadElement(parent) || ts45.isAwaitExpression(parent) || ts45.isNonNullExpression(parent) || ts45.isIfStatement(parent) || ts45.isDoStatement(parent) || ts45.isWhileStatement(parent) || ts45.isSwitchStatement(parent) || ts45.isCaseClause(parent) || ts45.isThrowStatement(parent) || ts45.isNewExpression(parent)) {
      return parent.expression === node;
    }
    if (ts45.isArrayLiteralExpression(parent)) {
      return parent.elements.includes(node);
    }
    if (ts45.isPropertyAssignment(parent) || ts45.isParameter(parent) || ts45.isBindingElement(parent) || ts45.isPropertyDeclaration(parent) || ts45.isEnumMember(parent)) {
      return parent.initializer === node;
    }
    if (ts45.isVariableDeclaration(parent)) {
      return parent.name === node || parent.initializer === node;
    }
    if (ts45.isClassDeclaration(parent) || ts45.isFunctionDeclaration(parent) || ts45.isShorthandPropertyAssignment(parent)) {
      return parent.name === node;
    }
    if (ts45.isElementAccessExpression(parent)) {
      return parent.expression === node || parent.argumentExpression === node;
    }
    if (ts45.isBinaryExpression(parent)) {
      return parent.left === node || parent.right === node;
    }
    if (ts45.isForInStatement(parent) || ts45.isForOfStatement(parent)) {
      return parent.expression === node || parent.initializer === node;
    }
    if (ts45.isForStatement(parent)) {
      return parent.condition === node || parent.initializer === node || parent.incrementor === node;
    }
    if (ts45.isArrowFunction(parent)) {
      return parent.body === node;
    }
    if (ts45.isImportSpecifier(parent) || ts45.isExportSpecifier(parent)) {
      return (parent.propertyName || parent.name) === node;
    }
    if (ts45.isConditionalExpression(parent)) {
      return parent.condition === node || parent.whenFalse === node || parent.whenTrue === node;
    }
    return false;
  }
  isTypeScriptNode(value) {
    return !!value && typeof value.kind === "number";
  }
};
function isConstEnumReference(node, reflection) {
  var _a;
  const parent = node.parent;
  if (!parent || !ts45.isPropertyAccessExpression(parent) || parent.expression !== node || !ts45.isIdentifier(parent.name)) {
    return false;
  }
  const declaration = reflection.getDeclarationOfIdentifier(node);
  return declaration !== null && ts45.isEnumDeclaration(declaration.node) && !!((_a = declaration.node.modifiers) == null ? void 0 : _a.some((m) => m.kind === ts45.SyntaxKind.ConstKeyword));
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/hmr/src/metadata.mjs
function extractHmrMetatadata(clazz, reflection, evaluator, compilerHost, rootDirs, definition, factory, deferBlockMetadata, classMetadata, debugInfo) {
  if (!reflection.isClass(clazz)) {
    return null;
  }
  const sourceFile = clazz.getSourceFile();
  const filePath = getProjectRelativePath(sourceFile.fileName, rootDirs, compilerHost) || compilerHost.getCanonicalFileName(sourceFile.fileName);
  const dependencies = extractHmrDependencies(clazz, definition, factory, deferBlockMetadata, classMetadata, debugInfo, reflection, evaluator);
  if (dependencies === null) {
    return null;
  }
  const meta = {
    type: new o3.WrappedNodeExpr(clazz.name),
    className: clazz.name.text,
    filePath,
    localDependencies: dependencies.local,
    namespaceDependencies: dependencies.external
  };
  return meta;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/hmr/src/update_declaration.mjs
import { compileHmrUpdateCallback } from "@angular/compiler";
import ts46 from "typescript";
function getHmrUpdateDeclaration(compilationResults, constantStatements, meta, sourceFile) {
  const namespaceSpecifiers = meta.namespaceDependencies.reduce((result, current) => {
    result.set(current.moduleName, current.assignedName);
    return result;
  }, /* @__PURE__ */ new Map());
  const importRewriter = new HmrModuleImportRewriter(namespaceSpecifiers);
  const importManager = new ImportManager({
    ...presetImportManagerForceNamespaceImports,
    rewriter: importRewriter
  });
  const callback = compileHmrUpdateCallback(compilationResults, constantStatements, meta);
  const node = translateStatement(sourceFile, callback, importManager);
  return ts46.factory.updateFunctionDeclaration(node, [
    ts46.factory.createToken(ts46.SyntaxKind.ExportKeyword),
    ts46.factory.createToken(ts46.SyntaxKind.DefaultKeyword)
  ], node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body);
}
var HmrModuleImportRewriter = class {
  lookup;
  constructor(lookup) {
    this.lookup = lookup;
  }
  rewriteNamespaceImportIdentifier(specifier, moduleName) {
    return this.lookup.has(moduleName) ? this.lookup.get(moduleName) : specifier;
  }
  rewriteSymbol(symbol) {
    return symbol;
  }
  rewriteSpecifier(specifier) {
    return specifier;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.mjs
var EMPTY_ARRAY2 = [];
var isUsedDirective = (decl) => decl.kind === R3TemplateDependencyKind.Directive;
var isUsedPipe = (decl) => decl.kind === R3TemplateDependencyKind.Pipe;
var ComponentDecoratorHandler = class {
  reflector;
  evaluator;
  metaRegistry;
  metaReader;
  scopeReader;
  compilerHost;
  scopeRegistry;
  typeCheckScopeRegistry;
  resourceRegistry;
  isCore;
  strictCtorDeps;
  resourceLoader;
  rootDirs;
  defaultPreserveWhitespaces;
  i18nUseExternalIds;
  enableI18nLegacyMessageIdFormat;
  usePoisonedData;
  i18nNormalizeLineEndingsInICUs;
  moduleResolver;
  cycleAnalyzer;
  cycleHandlingStrategy;
  refEmitter;
  referencesRegistry;
  depTracker;
  injectableRegistry;
  semanticDepGraphUpdater;
  annotateForClosureCompiler;
  perf;
  hostDirectivesResolver;
  importTracker;
  includeClassMetadata;
  compilationMode;
  deferredSymbolTracker;
  forbidOrphanRendering;
  enableBlockSyntax;
  enableLetSyntax;
  externalRuntimeStyles;
  localCompilationExtraImportsTracker;
  jitDeclarationRegistry;
  i18nPreserveSignificantWhitespace;
  strictStandalone;
  enableHmr;
  implicitStandaloneValue;
  constructor(reflector, evaluator, metaRegistry, metaReader, scopeReader, compilerHost, scopeRegistry, typeCheckScopeRegistry, resourceRegistry, isCore, strictCtorDeps, resourceLoader, rootDirs, defaultPreserveWhitespaces, i18nUseExternalIds, enableI18nLegacyMessageIdFormat, usePoisonedData, i18nNormalizeLineEndingsInICUs, moduleResolver, cycleAnalyzer, cycleHandlingStrategy, refEmitter, referencesRegistry, depTracker, injectableRegistry, semanticDepGraphUpdater, annotateForClosureCompiler, perf, hostDirectivesResolver, importTracker, includeClassMetadata, compilationMode, deferredSymbolTracker, forbidOrphanRendering, enableBlockSyntax, enableLetSyntax, externalRuntimeStyles, localCompilationExtraImportsTracker, jitDeclarationRegistry, i18nPreserveSignificantWhitespace, strictStandalone, enableHmr, implicitStandaloneValue) {
    this.reflector = reflector;
    this.evaluator = evaluator;
    this.metaRegistry = metaRegistry;
    this.metaReader = metaReader;
    this.scopeReader = scopeReader;
    this.compilerHost = compilerHost;
    this.scopeRegistry = scopeRegistry;
    this.typeCheckScopeRegistry = typeCheckScopeRegistry;
    this.resourceRegistry = resourceRegistry;
    this.isCore = isCore;
    this.strictCtorDeps = strictCtorDeps;
    this.resourceLoader = resourceLoader;
    this.rootDirs = rootDirs;
    this.defaultPreserveWhitespaces = defaultPreserveWhitespaces;
    this.i18nUseExternalIds = i18nUseExternalIds;
    this.enableI18nLegacyMessageIdFormat = enableI18nLegacyMessageIdFormat;
    this.usePoisonedData = usePoisonedData;
    this.i18nNormalizeLineEndingsInICUs = i18nNormalizeLineEndingsInICUs;
    this.moduleResolver = moduleResolver;
    this.cycleAnalyzer = cycleAnalyzer;
    this.cycleHandlingStrategy = cycleHandlingStrategy;
    this.refEmitter = refEmitter;
    this.referencesRegistry = referencesRegistry;
    this.depTracker = depTracker;
    this.injectableRegistry = injectableRegistry;
    this.semanticDepGraphUpdater = semanticDepGraphUpdater;
    this.annotateForClosureCompiler = annotateForClosureCompiler;
    this.perf = perf;
    this.hostDirectivesResolver = hostDirectivesResolver;
    this.importTracker = importTracker;
    this.includeClassMetadata = includeClassMetadata;
    this.compilationMode = compilationMode;
    this.deferredSymbolTracker = deferredSymbolTracker;
    this.forbidOrphanRendering = forbidOrphanRendering;
    this.enableBlockSyntax = enableBlockSyntax;
    this.enableLetSyntax = enableLetSyntax;
    this.externalRuntimeStyles = externalRuntimeStyles;
    this.localCompilationExtraImportsTracker = localCompilationExtraImportsTracker;
    this.jitDeclarationRegistry = jitDeclarationRegistry;
    this.i18nPreserveSignificantWhitespace = i18nPreserveSignificantWhitespace;
    this.strictStandalone = strictStandalone;
    this.enableHmr = enableHmr;
    this.implicitStandaloneValue = implicitStandaloneValue;
    this.extractTemplateOptions = {
      enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
      usePoisonedData: this.usePoisonedData,
      enableBlockSyntax: this.enableBlockSyntax,
      enableLetSyntax: this.enableLetSyntax,
      preserveSignificantWhitespace: this.i18nPreserveSignificantWhitespace
    };
    this.canDeferDeps = !enableHmr;
  }
  literalCache = /* @__PURE__ */ new Map();
  elementSchemaRegistry = new DomElementSchemaRegistry3();
  preanalyzeTemplateCache = /* @__PURE__ */ new Map();
  preanalyzeStylesCache = /* @__PURE__ */ new Map();
  canDeferDeps;
  extractTemplateOptions;
  precedence = HandlerPrecedence.PRIMARY;
  name = "ComponentDecoratorHandler";
  detect(node, decorators) {
    if (!decorators) {
      return void 0;
    }
    const decorator = findAngularDecorator(decorators, "Component", this.isCore);
    if (decorator !== void 0) {
      return {
        trigger: decorator.node,
        decorator,
        metadata: decorator
      };
    } else {
      return void 0;
    }
  }
  preanalyze(node, decorator) {
    if (!this.resourceLoader.canPreload) {
      return void 0;
    }
    const meta = resolveLiteral(decorator, this.literalCache);
    const component = reflectObjectLiteral(meta);
    const containingFile = node.getSourceFile().fileName;
    const resolveStyleUrl = (styleUrl) => {
      try {
        const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
        return this.resourceLoader.preload(resourceUrl, {
          type: "style",
          containingFile,
          className: node.name.text
        });
      } catch {
        return void 0;
      }
    };
    const templateAndTemplateStyleResources = preloadAndParseTemplate(this.evaluator, this.resourceLoader, this.depTracker, this.preanalyzeTemplateCache, node, decorator, component, containingFile, this.defaultPreserveWhitespaces, this.extractTemplateOptions, this.compilationMode).then((template) => {
      if (template === null) {
        return { templateStyles: [], templateStyleUrls: [] };
      }
      let templateUrl;
      if (template.sourceMapping.type === "external") {
        templateUrl = template.sourceMapping.templateUrl;
      }
      return {
        templateUrl,
        templateStyles: template.styles,
        templateStyleUrls: template.styleUrls
      };
    });
    const componentStyleUrls = extractComponentStyleUrls(this.evaluator, component);
    return templateAndTemplateStyleResources.then(async (templateInfo) => {
      let styles = null;
      let orderOffset = 0;
      const rawStyles = parseDirectiveStyles(component, this.evaluator, this.compilationMode);
      if (rawStyles == null ? void 0 : rawStyles.length) {
        styles = await Promise.all(rawStyles.map((style) => this.resourceLoader.preprocessInline(style, {
          type: "style",
          containingFile,
          order: orderOffset++,
          className: node.name.text
        })));
      }
      if (templateInfo.templateStyles) {
        styles != null ? styles : styles = [];
        styles.push(...await Promise.all(templateInfo.templateStyles.map((style) => {
          var _a;
          return this.resourceLoader.preprocessInline(style, {
            type: "style",
            containingFile: (_a = templateInfo.templateUrl) != null ? _a : containingFile,
            order: orderOffset++,
            className: node.name.text
          });
        })));
      }
      this.preanalyzeStylesCache.set(node, styles);
      if (this.externalRuntimeStyles) {
        return;
      }
      await Promise.all([
        ...componentStyleUrls.map((styleUrl) => resolveStyleUrl(styleUrl.url)),
        ...templateInfo.templateStyleUrls.map((url) => resolveStyleUrl(url))
      ]);
    });
  }
  analyze(node, decorator) {
    var _a, _b, _c, _d, _e, _f;
    this.perf.eventCount(PerfEvent.AnalyzeComponent);
    const containingFile = node.getSourceFile().fileName;
    this.literalCache.delete(decorator);
    let diagnostics;
    let isPoisoned = false;
    const directiveResult = extractDirectiveMetadata(node, decorator, this.reflector, this.importTracker, this.evaluator, this.refEmitter, this.referencesRegistry, this.isCore, this.annotateForClosureCompiler, this.compilationMode, this.elementSchemaRegistry.getDefaultComponentElementName(), this.strictStandalone, this.implicitStandaloneValue);
    if (directiveResult.jitForced) {
      this.jitDeclarationRegistry.jitDeclarations.add(node);
      return {};
    }
    const { decorator: component, metadata, inputs, outputs, hostDirectives, rawHostDirectives } = directiveResult;
    const encapsulation = (_a = this.compilationMode !== CompilationMode.LOCAL ? resolveEnumValue(this.evaluator, component, "encapsulation", "ViewEncapsulation") : resolveEncapsulationEnumValueLocally(component.get("encapsulation"))) != null ? _a : ViewEncapsulation2.Emulated;
    let changeDetection = null;
    if (this.compilationMode !== CompilationMode.LOCAL) {
      changeDetection = resolveEnumValue(this.evaluator, component, "changeDetection", "ChangeDetectionStrategy");
    } else if (component.has("changeDetection")) {
      changeDetection = new o4.WrappedNodeExpr(component.get("changeDetection"));
    }
    let animations = null;
    let animationTriggerNames = null;
    if (component.has("animations")) {
      const animationExpression = component.get("animations");
      animations = new o4.WrappedNodeExpr(animationExpression);
      const animationsValue = this.evaluator.evaluate(animationExpression, animationTriggerResolver);
      animationTriggerNames = { includesDynamicAnimations: false, staticTriggerNames: [] };
      collectAnimationNames(animationsValue, animationTriggerNames);
    }
    const relativeContextFilePath = this.rootDirs.reduce((previous, rootDir) => {
      const candidate = relative(absoluteFrom(rootDir), absoluteFrom(containingFile));
      if (previous === void 0 || candidate.length < previous.length) {
        return candidate;
      } else {
        return previous;
      }
    }, void 0);
    let viewProvidersRequiringFactory = null;
    let providersRequiringFactory = null;
    let wrappedViewProviders = null;
    if (component.has("viewProviders")) {
      const viewProviders = component.get("viewProviders");
      viewProvidersRequiringFactory = resolveProvidersRequiringFactory(viewProviders, this.reflector, this.evaluator);
      wrappedViewProviders = new o4.WrappedNodeExpr(this.annotateForClosureCompiler ? wrapFunctionExpressionsInParens(viewProviders) : viewProviders);
    }
    if (component.has("providers")) {
      providersRequiringFactory = resolveProvidersRequiringFactory(component.get("providers"), this.reflector, this.evaluator);
    }
    let resolvedImports = null;
    let resolvedDeferredImports = null;
    let rawImports = (_b = component.get("imports")) != null ? _b : null;
    let rawDeferredImports = (_c = component.get("deferredImports")) != null ? _c : null;
    if ((rawImports || rawDeferredImports) && !metadata.isStandalone) {
      if (diagnostics === void 0) {
        diagnostics = [];
      }
      const importsField = rawImports ? "imports" : "deferredImports";
      diagnostics.push(makeDiagnostic(ErrorCode.COMPONENT_NOT_STANDALONE, component.get(importsField), `'${importsField}' is only valid on a component that is standalone.`, [
        makeRelatedInformation(node.name, `Did you forget to add 'standalone: true' to this @Component?`)
      ]));
      isPoisoned = true;
    } else if (this.compilationMode !== CompilationMode.LOCAL && (rawImports || rawDeferredImports)) {
      const importResolvers = combineResolvers([
        createModuleWithProvidersResolver(this.reflector, this.isCore),
        forwardRefResolver
      ]);
      const importDiagnostics = [];
      if (rawImports) {
        const expr = rawImports;
        const imported = this.evaluator.evaluate(expr, importResolvers);
        const { imports: flattened, diagnostics: diagnostics2 } = validateAndFlattenComponentImports(imported, expr, false);
        importDiagnostics.push(...diagnostics2);
        resolvedImports = flattened;
        rawImports = expr;
      }
      if (rawDeferredImports) {
        const expr = rawDeferredImports;
        const imported = this.evaluator.evaluate(expr, importResolvers);
        const { imports: flattened, diagnostics: diagnostics2 } = validateAndFlattenComponentImports(imported, expr, true);
        importDiagnostics.push(...diagnostics2);
        resolvedDeferredImports = flattened;
        rawDeferredImports = expr;
      }
      if (importDiagnostics.length > 0) {
        isPoisoned = true;
        if (diagnostics === void 0) {
          diagnostics = [];
        }
        diagnostics.push(...importDiagnostics);
      }
    }
    let schemas = null;
    if (component.has("schemas") && !metadata.isStandalone) {
      if (diagnostics === void 0) {
        diagnostics = [];
      }
      diagnostics.push(makeDiagnostic(ErrorCode.COMPONENT_NOT_STANDALONE, component.get("schemas"), `'schemas' is only valid on a component that is standalone.`));
    } else if (this.compilationMode !== CompilationMode.LOCAL && component.has("schemas")) {
      schemas = extractSchemas(component.get("schemas"), this.evaluator, "Component");
    } else if (metadata.isStandalone) {
      schemas = [];
    }
    let template;
    if (this.preanalyzeTemplateCache.has(node)) {
      const preanalyzed = this.preanalyzeTemplateCache.get(node);
      this.preanalyzeTemplateCache.delete(node);
      template = preanalyzed;
    } else {
      const templateDecl = parseTemplateDeclaration(node, decorator, component, containingFile, this.evaluator, this.depTracker, this.resourceLoader, this.defaultPreserveWhitespaces);
      template = extractTemplate(node, templateDecl, this.evaluator, this.depTracker, this.resourceLoader, {
        enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
        i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
        usePoisonedData: this.usePoisonedData,
        enableBlockSyntax: this.enableBlockSyntax,
        enableLetSyntax: this.enableLetSyntax,
        preserveSignificantWhitespace: this.i18nPreserveSignificantWhitespace
      }, this.compilationMode);
      if (this.compilationMode === CompilationMode.LOCAL && template.errors && template.errors.length > 0) {
        if (diagnostics === void 0) {
          diagnostics = [];
        }
        diagnostics.push(...getTemplateDiagnostics(
          template.errors,
          "",
          template.sourceMapping
        ));
      }
    }
    const templateResource = template.declaration.isInline ? { path: null, expression: component.get("template") } : {
      path: absoluteFrom(template.declaration.resolvedTemplateUrl),
      expression: template.sourceMapping.node
    };
    const relativeTemplatePath = getProjectRelativePath((_d = templateResource.path) != null ? _d : ts47.getOriginalNode(node).getSourceFile().fileName, this.rootDirs, this.compilerHost);
    let styles = [];
    const externalStyles = [];
    const styleResources = extractInlineStyleResources(component);
    const styleUrls = [
      ...extractComponentStyleUrls(this.evaluator, component),
      ..._extractTemplateStyleUrls(template)
    ];
    for (const styleUrl of styleUrls) {
      try {
        const resourceUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
        if (this.externalRuntimeStyles) {
          externalStyles.push(resourceUrl);
          continue;
        }
        if (styleUrl.source === 2 && ts47.isStringLiteralLike(styleUrl.expression)) {
          styleResources.add({
            path: absoluteFrom(resourceUrl),
            expression: styleUrl.expression
          });
        }
        const resourceStr = this.resourceLoader.load(resourceUrl);
        styles.push(resourceStr);
        if (this.depTracker !== null) {
          this.depTracker.addResourceDependency(node.getSourceFile(), absoluteFrom(resourceUrl));
        }
      } catch {
        if (this.depTracker !== null) {
          this.depTracker.recordDependencyAnalysisFailure(node.getSourceFile());
        }
        if (diagnostics === void 0) {
          diagnostics = [];
        }
        const resourceType = styleUrl.source === 2 ? 2 : 1;
        diagnostics.push(makeResourceNotFoundError(styleUrl.url, styleUrl.expression, resourceType).toDiagnostic());
      }
    }
    if (encapsulation === ViewEncapsulation2.ShadowDom && metadata.selector !== null) {
      const selectorError = checkCustomElementSelectorForErrors(metadata.selector);
      if (selectorError !== null) {
        if (diagnostics === void 0) {
          diagnostics = [];
        }
        diagnostics.push(makeDiagnostic(ErrorCode.COMPONENT_INVALID_SHADOW_DOM_SELECTOR, component.get("selector"), selectorError));
      }
    }
    let inlineStyles = null;
    if (this.preanalyzeStylesCache.has(node)) {
      inlineStyles = this.preanalyzeStylesCache.get(node);
      this.preanalyzeStylesCache.delete(node);
      if (inlineStyles == null ? void 0 : inlineStyles.length) {
        if (this.externalRuntimeStyles) {
          externalStyles.push(...inlineStyles);
        } else {
          styles.push(...inlineStyles);
        }
      }
    } else {
      if (this.resourceLoader.canPreprocess) {
        throw new Error("Inline resource processing requires asynchronous preanalyze.");
      }
      if (component.has("styles")) {
        const litStyles = parseDirectiveStyles(component, this.evaluator, this.compilationMode);
        if (litStyles !== null) {
          inlineStyles = [...litStyles];
          styles.push(...litStyles);
        }
      }
      if (template.styles.length > 0) {
        styles.push(...template.styles);
      }
    }
    let explicitlyDeferredTypes = null;
    if (metadata.isStandalone && rawDeferredImports !== null) {
      const deferredTypes = this.collectExplicitlyDeferredSymbols(rawDeferredImports);
      for (const [deferredType, importDetails] of deferredTypes) {
        explicitlyDeferredTypes != null ? explicitlyDeferredTypes : explicitlyDeferredTypes = [];
        explicitlyDeferredTypes.push({
          symbolName: importDetails.name,
          importPath: importDetails.from,
          isDefaultImport: isDefaultImport(importDetails.node)
        });
        this.deferredSymbolTracker.markAsDeferrableCandidate(deferredType, importDetails.node, node, true);
      }
    }
    const output = {
      analysis: {
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        inputs,
        inputFieldNamesFromMetadataArray: directiveResult.inputFieldNamesFromMetadataArray,
        outputs,
        hostDirectives,
        rawHostDirectives,
        meta: {
          ...metadata,
          template,
          encapsulation,
          changeDetection,
          interpolation: (_e = template.interpolationConfig) != null ? _e : DEFAULT_INTERPOLATION_CONFIG2,
          styles,
          externalStyles,
          animations,
          viewProviders: wrappedViewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds,
          relativeContextFilePath,
          rawImports: rawImports !== null ? new o4.WrappedNodeExpr(rawImports) : void 0,
          relativeTemplatePath
        },
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, inputs, this.reflector),
        classMetadata: this.includeClassMetadata ? extractClassMetadata(node, this.reflector, this.isCore, this.annotateForClosureCompiler, (dec) => transformDecoratorResources(dec, component, styles, template)) : null,
        classDebugInfo: extractClassDebugInfo(
          node,
          this.reflector,
          this.compilerHost,
          this.rootDirs,
          this.forbidOrphanRendering
        ),
        template,
        providersRequiringFactory,
        viewProvidersRequiringFactory,
        inlineStyles,
        styleUrls,
        resources: {
          styles: styleResources,
          template: templateResource
        },
        isPoisoned,
        animationTriggerNames,
        rawImports,
        resolvedImports,
        rawDeferredImports,
        resolvedDeferredImports,
        explicitlyDeferredTypes,
        schemas,
        decorator: (_f = decorator == null ? void 0 : decorator.node) != null ? _f : null
      },
      diagnostics
    };
    return output;
  }
  symbol(node, analysis) {
    const typeParameters = extractSemanticTypeParameters(node);
    return new ComponentSymbol(node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs, analysis.typeCheckMeta, typeParameters);
  }
  register(node, analysis) {
    var _a;
    const ref = new Reference(node);
    this.metaRegistry.registerDirectiveMetadata({
      kind: MetaKind.Directive,
      matchSource: MatchSource.Selector,
      ref,
      name: node.name.text,
      selector: analysis.meta.selector,
      exportAs: analysis.meta.exportAs,
      inputs: analysis.inputs,
      inputFieldNamesFromMetadataArray: analysis.inputFieldNamesFromMetadataArray,
      outputs: analysis.outputs,
      queries: analysis.meta.queries.map((query) => query.propertyName),
      isComponent: true,
      baseClass: analysis.baseClass,
      hostDirectives: analysis.hostDirectives,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: false,
      isStandalone: analysis.meta.isStandalone,
      isSignal: analysis.meta.isSignal,
      imports: analysis.resolvedImports,
      rawImports: analysis.rawImports,
      deferredImports: analysis.resolvedDeferredImports,
      animationTriggerNames: analysis.animationTriggerNames,
      schemas: analysis.schemas,
      decorator: analysis.decorator,
      assumedToExportProviders: false,
      ngContentSelectors: analysis.template.ngContentSelectors,
      preserveWhitespaces: (_a = analysis.template.preserveWhitespaces) != null ? _a : false,
      isExplicitlyDeferred: false
    });
    this.resourceRegistry.registerResources(analysis.resources, node);
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps
    });
  }
  index(context, node, analysis) {
    if (analysis.isPoisoned && !this.usePoisonedData) {
      return null;
    }
    const scope = this.scopeReader.getScopeForComponent(node);
    const selector = analysis.meta.selector;
    const matcher = new SelectorMatcher3();
    if (scope !== null) {
      let { dependencies, isPoisoned } = scope.kind === ComponentScopeKind.NgModule ? scope.compilation : scope;
      if ((isPoisoned || scope.kind === ComponentScopeKind.NgModule && scope.exported.isPoisoned) && !this.usePoisonedData) {
        return null;
      }
      for (const dep of dependencies) {
        if (dep.kind === MetaKind.Directive && dep.selector !== null) {
          matcher.addSelectables(CssSelector4.parse(dep.selector), [
            ...this.hostDirectivesResolver.resolve(dep),
            dep
          ]);
        }
      }
    }
    const binder = new R3TargetBinder(matcher);
    const boundTemplate = binder.bind({ template: analysis.template.diagNodes });
    context.addComponent({
      declaration: node,
      selector,
      boundTemplate,
      templateMeta: {
        isInline: analysis.template.declaration.isInline,
        file: analysis.template.file
      }
    });
    return null;
  }
  typeCheck(ctx, node, meta) {
    var _a;
    if (this.typeCheckScopeRegistry === null || !ts47.isClassDeclaration(node)) {
      return;
    }
    if (meta.isPoisoned && !this.usePoisonedData) {
      return;
    }
    const scope = this.typeCheckScopeRegistry.getTypeCheckScope(node);
    if (scope.isPoisoned && !this.usePoisonedData) {
      return;
    }
    const binder = new R3TargetBinder(scope.matcher);
    ctx.addTemplate(new Reference(node), binder, meta.template.diagNodes, scope.pipes, scope.schemas, meta.template.sourceMapping, meta.template.file, meta.template.errors, meta.meta.isStandalone, (_a = meta.meta.template.preserveWhitespaces) != null ? _a : false);
  }
  extendedTemplateCheck(component, extendedTemplateChecker) {
    return extendedTemplateChecker.getDiagnosticsForComponent(component);
  }
  templateSemanticsCheck(component, templateSemanticsChecker) {
    return templateSemanticsChecker.getDiagnosticsForComponent(component);
  }
  resolve(node, analysis, symbol) {
    var _a, _b;
    const metadata = analysis.meta;
    const diagnostics = [];
    const context = getSourceFile(node);
    const nonRemovableImports = this.deferredSymbolTracker.getNonRemovableDeferredImports(context, node);
    if (nonRemovableImports.length > 0) {
      for (const importDecl of nonRemovableImports) {
        const diagnostic = makeDiagnostic(ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY, importDecl, `This import contains symbols that are used both inside and outside of the \`@Component.deferredImports\` fields in the file. This renders all these defer imports useless as this import remains and its module is eagerly loaded. To fix this, make sure that all symbols from the import are *only* used within \`@Component.deferredImports\` arrays and there are no other references to those symbols present in this file.`);
        diagnostics.push(diagnostic);
      }
      return { diagnostics };
    }
    let data;
    if (this.compilationMode === CompilationMode.LOCAL) {
      data = {
        declarations: EMPTY_ARRAY2,
        declarationListEmitMode: !analysis.meta.isStandalone || analysis.rawImports !== null ? 3 : 0,
        deferPerBlockDependencies: this.locateDeferBlocksWithoutScope(analysis.template),
        deferBlockDepsEmitMode: 1,
        deferrableDeclToImportDecl: /* @__PURE__ */ new Map(),
        deferPerComponentDependencies: (_a = analysis.explicitlyDeferredTypes) != null ? _a : []
      };
      if (this.localCompilationExtraImportsTracker === null) {
        return { data };
      }
    } else {
      data = {
        declarations: EMPTY_ARRAY2,
        declarationListEmitMode: 0,
        deferPerBlockDependencies: /* @__PURE__ */ new Map(),
        deferBlockDepsEmitMode: 0,
        deferrableDeclToImportDecl: /* @__PURE__ */ new Map(),
        deferPerComponentDependencies: []
      };
    }
    if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof Reference) {
      symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
    }
    if (analysis.isPoisoned && !this.usePoisonedData) {
      return {};
    }
    const scope = this.scopeReader.getScopeForComponent(node);
    if (scope !== null) {
      const isModuleScope = scope.kind === ComponentScopeKind.NgModule;
      const dependencies = isModuleScope ? scope.compilation.dependencies : scope.dependencies;
      const explicitlyDeferredDependencies = getExplicitlyDeferredDeps(scope);
      if (isModuleScope && context.fileName !== getSourceFile(scope.ngModule).fileName) {
        (_b = this.localCompilationExtraImportsTracker) == null ? void 0 : _b.markFileForExtraImportGeneration(context);
      }
      if (metadata.isStandalone && analysis.rawDeferredImports !== null && explicitlyDeferredDependencies.length > 0) {
        const diagnostic = validateNoImportOverlap(dependencies, explicitlyDeferredDependencies, analysis.rawDeferredImports);
        if (diagnostic !== null) {
          diagnostics.push(diagnostic);
        }
      }
      const binder = createTargetBinder(dependencies);
      const pipes = extractPipes(dependencies);
      let allDependencies = dependencies;
      let deferBlockBinder = binder;
      if (explicitlyDeferredDependencies.length > 0) {
        allDependencies = [...explicitlyDeferredDependencies, ...dependencies];
        deferBlockBinder = createTargetBinder(allDependencies);
      }
      const bound = binder.bind({ template: metadata.template.nodes });
      const deferBlocks = /* @__PURE__ */ new Map();
      for (const deferBlock of bound.getDeferBlocks()) {
        deferBlocks.set(deferBlock, deferBlockBinder.bind({ template: deferBlock.children }));
      }
      const eagerlyUsed = /* @__PURE__ */ new Set();
      if (this.enableHmr) {
        for (const dep of dependencies) {
          if (dep.ref.node !== node) {
            eagerlyUsed.add(dep.ref.node);
          } else {
            const used = bound.getEagerlyUsedDirectives();
            if (used.some((current) => current.ref.node === node)) {
              eagerlyUsed.add(node);
            }
          }
        }
      } else {
        for (const dir of bound.getEagerlyUsedDirectives()) {
          eagerlyUsed.add(dir.ref.node);
        }
        for (const name of bound.getEagerlyUsedPipes()) {
          if (!pipes.has(name)) {
            continue;
          }
          eagerlyUsed.add(pipes.get(name).ref.node);
        }
      }
      const wholeTemplateUsed = new Set(eagerlyUsed);
      for (const bound2 of deferBlocks.values()) {
        for (const dir of bound2.getEagerlyUsedDirectives()) {
          wholeTemplateUsed.add(dir.ref.node);
        }
        for (const name of bound2.getEagerlyUsedPipes()) {
          if (!pipes.has(name)) {
            continue;
          }
          wholeTemplateUsed.add(pipes.get(name).ref.node);
        }
      }
      const declarations = /* @__PURE__ */ new Map();
      for (const dep of allDependencies) {
        if (declarations.has(dep.ref.node)) {
          continue;
        }
        switch (dep.kind) {
          case MetaKind.Directive:
            if (!wholeTemplateUsed.has(dep.ref.node) || dep.matchSource !== MatchSource.Selector) {
              continue;
            }
            const dirType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(dirType, node.name, dep.isComponent ? "component" : "directive");
            declarations.set(dep.ref.node, {
              kind: R3TemplateDependencyKind.Directive,
              ref: dep.ref,
              type: dirType.expression,
              importedFile: dirType.importedFile,
              selector: dep.selector,
              inputs: dep.inputs.propertyNames,
              outputs: dep.outputs.propertyNames,
              exportAs: dep.exportAs,
              isComponent: dep.isComponent
            });
            break;
          case MetaKind.Pipe:
            if (!wholeTemplateUsed.has(dep.ref.node)) {
              continue;
            }
            const pipeType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(pipeType, node.name, "pipe");
            declarations.set(dep.ref.node, {
              kind: R3TemplateDependencyKind.Pipe,
              type: pipeType.expression,
              name: dep.name,
              ref: dep.ref,
              importedFile: pipeType.importedFile
            });
            break;
          case MetaKind.NgModule:
            const ngModuleType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(ngModuleType, node.name, "NgModule");
            declarations.set(dep.ref.node, {
              kind: R3TemplateDependencyKind.NgModule,
              type: ngModuleType.expression,
              importedFile: ngModuleType.importedFile
            });
            break;
        }
      }
      const getSemanticReference = (decl) => this.semanticDepGraphUpdater.getSemanticReference(decl.ref.node, decl.type);
      if (this.semanticDepGraphUpdater !== null) {
        symbol.usedDirectives = Array.from(declarations.values()).filter(isUsedDirective).map(getSemanticReference);
        symbol.usedPipes = Array.from(declarations.values()).filter(isUsedPipe).map(getSemanticReference);
      }
      const eagerDeclarations = Array.from(declarations.values()).filter((decl) => decl.kind === R3TemplateDependencyKind.NgModule || eagerlyUsed.has(decl.ref.node));
      if (this.compilationMode !== CompilationMode.LOCAL) {
        this.resolveDeferBlocks(node, deferBlocks, declarations, data, analysis, eagerlyUsed);
      }
      const cyclesFromDirectives = /* @__PURE__ */ new Map();
      const cyclesFromPipes = /* @__PURE__ */ new Map();
      if (!metadata.isStandalone) {
        for (const usedDep of eagerDeclarations) {
          const cycle = this._checkForCyclicImport(usedDep.importedFile, usedDep.type, context);
          if (cycle !== null) {
            switch (usedDep.kind) {
              case R3TemplateDependencyKind.Directive:
                cyclesFromDirectives.set(usedDep, cycle);
                break;
              case R3TemplateDependencyKind.Pipe:
                cyclesFromPipes.set(usedDep, cycle);
                break;
            }
          }
        }
      }
      const standaloneImportMayBeForwardDeclared = analysis.resolvedImports !== null && analysis.resolvedImports.some((ref) => ref.synthetic);
      const cycleDetected = cyclesFromDirectives.size !== 0 || cyclesFromPipes.size !== 0;
      if (!cycleDetected) {
        for (const { type, importedFile } of eagerDeclarations) {
          this.maybeRecordSyntheticImport(importedFile, type, context);
        }
        const declarationIsForwardDeclared = eagerDeclarations.some((decl) => isExpressionForwardReference(decl.type, node.name, context));
        if (this.compilationMode !== CompilationMode.LOCAL && (declarationIsForwardDeclared || standaloneImportMayBeForwardDeclared)) {
          data.declarationListEmitMode = 1;
        }
        data.declarations = eagerDeclarations;
        if (this.compilationMode === CompilationMode.LOCAL && this.localCompilationExtraImportsTracker !== null) {
          for (const { type } of eagerDeclarations) {
            if (type instanceof ExternalExpr8 && type.value.moduleName) {
              this.localCompilationExtraImportsTracker.addImportForFile(context, type.value.moduleName);
            }
          }
        }
      } else {
        if (this.cycleHandlingStrategy === 0) {
          this.scopeRegistry.setComponentRemoteScope(node, eagerDeclarations.filter(isUsedDirective).map((dir) => dir.ref), eagerDeclarations.filter(isUsedPipe).map((pipe) => pipe.ref));
          symbol.isRemotelyScoped = true;
          if (this.semanticDepGraphUpdater !== null && scope.kind === ComponentScopeKind.NgModule && scope.ngModule !== null) {
            const moduleSymbol = this.semanticDepGraphUpdater.getSymbol(scope.ngModule);
            if (!(moduleSymbol instanceof NgModuleSymbol)) {
              throw new Error(`AssertionError: Expected ${scope.ngModule.name} to be an NgModuleSymbol.`);
            }
            moduleSymbol.addRemotelyScopedComponent(symbol, symbol.usedDirectives, symbol.usedPipes);
          }
        } else {
          const relatedMessages = [];
          for (const [dir, cycle] of cyclesFromDirectives) {
            relatedMessages.push(makeCyclicImportInfo(dir.ref, dir.isComponent ? "component" : "directive", cycle));
          }
          for (const [pipe, cycle] of cyclesFromPipes) {
            relatedMessages.push(makeCyclicImportInfo(pipe.ref, "pipe", cycle));
          }
          throw new FatalDiagnosticError(ErrorCode.IMPORT_CYCLE_DETECTED, node, "One or more import cycles would need to be created to compile this component, which is not supported by the current compiler configuration.", relatedMessages);
        }
      }
    } else {
      data.deferPerBlockDependencies = this.locateDeferBlocksWithoutScope(metadata.template);
    }
    if (this.compilationMode !== CompilationMode.LOCAL) {
      if (analysis.resolvedImports !== null && analysis.rawImports !== null) {
        const importDiagnostics = validateStandaloneImports(analysis.resolvedImports, analysis.rawImports, this.metaReader, this.scopeReader, false);
        diagnostics.push(...importDiagnostics);
      }
      if (analysis.resolvedDeferredImports !== null && analysis.rawDeferredImports !== null) {
        const importDiagnostics = validateStandaloneImports(analysis.resolvedDeferredImports, analysis.rawDeferredImports, this.metaReader, this.scopeReader, true);
        diagnostics.push(...importDiagnostics);
      }
      if (analysis.providersRequiringFactory !== null && analysis.meta.providers instanceof o4.WrappedNodeExpr) {
        const providerDiagnostics = getProviderDiagnostics(analysis.providersRequiringFactory, analysis.meta.providers.node, this.injectableRegistry);
        diagnostics.push(...providerDiagnostics);
      }
      if (analysis.viewProvidersRequiringFactory !== null && analysis.meta.viewProviders instanceof o4.WrappedNodeExpr) {
        const viewProviderDiagnostics = getProviderDiagnostics(analysis.viewProvidersRequiringFactory, analysis.meta.viewProviders.node, this.injectableRegistry);
        diagnostics.push(...viewProviderDiagnostics);
      }
      const directiveDiagnostics = getDirectiveDiagnostics(node, this.injectableRegistry, this.evaluator, this.reflector, this.scopeRegistry, this.strictCtorDeps, "Component");
      if (directiveDiagnostics !== null) {
        diagnostics.push(...directiveDiagnostics);
      }
      const hostDirectivesDiagnostics = analysis.hostDirectives && analysis.rawHostDirectives ? validateHostDirectives(analysis.rawHostDirectives, analysis.hostDirectives, this.metaReader) : null;
      if (hostDirectivesDiagnostics !== null) {
        diagnostics.push(...hostDirectivesDiagnostics);
      }
    }
    if (diagnostics.length > 0) {
      return { diagnostics };
    }
    return { data };
  }
  xi18n(ctx, node, analysis) {
    var _a;
    ctx.updateFromTemplate(analysis.template.content, analysis.template.declaration.resolvedTemplateUrl, (_a = analysis.template.interpolationConfig) != null ? _a : DEFAULT_INTERPOLATION_CONFIG2);
  }
  updateResources(node, analysis) {
    const containingFile = node.getSourceFile().fileName;
    const templateDecl = analysis.template.declaration;
    if (!templateDecl.isInline) {
      analysis.template = extractTemplate(node, templateDecl, this.evaluator, this.depTracker, this.resourceLoader, this.extractTemplateOptions, this.compilationMode);
    }
    let styles = [];
    if (analysis.styleUrls !== null) {
      for (const styleUrl of analysis.styleUrls) {
        try {
          const resolvedStyleUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
          const styleText = this.resourceLoader.load(resolvedStyleUrl);
          styles.push(styleText);
        } catch (e) {
        }
      }
    }
    if (analysis.inlineStyles !== null) {
      for (const styleText of analysis.inlineStyles) {
        styles.push(styleText);
      }
    }
    for (const styleText of analysis.template.styles) {
      styles.push(styleText);
    }
    analysis.meta.styles = styles.filter((s) => s.trim().length > 0);
  }
  compileFull(node, analysis, resolution, pool) {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const perComponentDeferredDeps = this.canDeferDeps ? this.resolveAllDeferredDependencies(resolution) : null;
    const defer = this.compileDeferBlocks(resolution);
    const meta = {
      ...analysis.meta,
      ...resolution,
      defer
    };
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget3.Component));
    if (perComponentDeferredDeps !== null) {
      removeDeferrableTypesFromComponentDecorator(analysis, perComponentDeferredDeps);
    }
    const def = compileComponentFromMetadata(meta, pool, makeBindingParser2());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ? compileComponentClassMetadata(analysis.classMetadata, perComponentDeferredDeps).toStmt() : null;
    const debugInfo = analysis.classDebugInfo !== null ? compileClassDebugInfo(analysis.classDebugInfo).toStmt() : null;
    const hmrMeta = this.enableHmr ? extractHmrMetatadata(node, this.reflector, this.evaluator, this.compilerHost, this.rootDirs, def, fac, defer, classMetadata, debugInfo) : null;
    const hmrInitializer = hmrMeta ? compileHmrInitializer(hmrMeta).toStmt() : null;
    const deferrableImports = this.canDeferDeps ? this.deferredSymbolTracker.getDeferrableImportDecls() : null;
    return compileResults(fac, def, classMetadata, "\u0275cmp", inputTransformFields, deferrableImports, debugInfo, hmrInitializer);
  }
  compilePartial(node, analysis, resolution) {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const templateInfo = {
      content: analysis.template.content,
      sourceUrl: analysis.template.declaration.resolvedTemplateUrl,
      isInline: analysis.template.declaration.isInline,
      inlineTemplateLiteralExpression: analysis.template.sourceMapping.type === "direct" ? new o4.WrappedNodeExpr(analysis.template.sourceMapping.node) : null
    };
    const perComponentDeferredDeps = this.canDeferDeps ? this.resolveAllDeferredDependencies(resolution) : null;
    const defer = this.compileDeferBlocks(resolution);
    const meta = {
      ...analysis.meta,
      ...resolution,
      defer
    };
    const fac = compileDeclareFactory(toFactoryMetadata(meta, FactoryTarget3.Component));
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const def = compileDeclareComponentFromMetadata(meta, analysis.template, templateInfo);
    const classMetadata = analysis.classMetadata !== null ? compileComponentDeclareClassMetadata(analysis.classMetadata, perComponentDeferredDeps).toStmt() : null;
    const hmrMeta = this.enableHmr ? extractHmrMetatadata(node, this.reflector, this.evaluator, this.compilerHost, this.rootDirs, def, fac, defer, classMetadata, null) : null;
    const hmrInitializer = hmrMeta ? compileHmrInitializer(hmrMeta).toStmt() : null;
    const deferrableImports = this.canDeferDeps ? this.deferredSymbolTracker.getDeferrableImportDecls() : null;
    return compileResults(fac, def, classMetadata, "\u0275cmp", inputTransformFields, deferrableImports, null, hmrInitializer);
  }
  compileLocal(node, analysis, resolution, pool) {
    const deferrableTypes = this.canDeferDeps ? analysis.explicitlyDeferredTypes : null;
    const defer = this.compileDeferBlocks(resolution);
    const meta = {
      ...analysis.meta,
      ...resolution,
      defer
    };
    if (deferrableTypes !== null) {
      removeDeferrableTypesFromComponentDecorator(analysis, deferrableTypes);
    }
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget3.Component));
    const def = compileComponentFromMetadata(meta, pool, makeBindingParser2());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ? compileComponentClassMetadata(analysis.classMetadata, deferrableTypes).toStmt() : null;
    const debugInfo = analysis.classDebugInfo !== null ? compileClassDebugInfo(analysis.classDebugInfo).toStmt() : null;
    const hmrMeta = this.enableHmr ? extractHmrMetatadata(node, this.reflector, this.evaluator, this.compilerHost, this.rootDirs, def, fac, defer, classMetadata, debugInfo) : null;
    const hmrInitializer = hmrMeta ? compileHmrInitializer(hmrMeta).toStmt() : null;
    const deferrableImports = this.canDeferDeps ? this.deferredSymbolTracker.getDeferrableImportDecls() : null;
    return compileResults(fac, def, classMetadata, "\u0275cmp", inputTransformFields, deferrableImports, debugInfo, hmrInitializer);
  }
  compileHmrUpdateDeclaration(node, analysis, resolution) {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return null;
    }
    const pool = new ConstantPool2();
    const defer = this.compileDeferBlocks(resolution);
    const meta = {
      ...analysis.meta,
      ...resolution,
      defer
    };
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget3.Component));
    const def = compileComponentFromMetadata(meta, pool, makeBindingParser2());
    const classMetadata = analysis.classMetadata !== null ? compileComponentClassMetadata(analysis.classMetadata, null).toStmt() : null;
    const debugInfo = analysis.classDebugInfo !== null ? compileClassDebugInfo(analysis.classDebugInfo).toStmt() : null;
    const hmrMeta = this.enableHmr ? extractHmrMetatadata(node, this.reflector, this.evaluator, this.compilerHost, this.rootDirs, def, fac, defer, classMetadata, debugInfo) : null;
    const res = compileResults(fac, def, classMetadata, "\u0275cmp", null, null, debugInfo, null);
    return hmrMeta === null || res.length === 0 ? null : getHmrUpdateDeclaration(res, pool.statements, hmrMeta, node.getSourceFile());
  }
  locateDeferBlocksWithoutScope(template) {
    const deferBlocks = /* @__PURE__ */ new Map();
    const directivelessBinder = new R3TargetBinder(new SelectorMatcher3());
    const bound = directivelessBinder.bind({ template: template.nodes });
    const deferredBlocks = bound.getDeferBlocks();
    for (const block of deferredBlocks) {
      deferBlocks.set(block, []);
    }
    return deferBlocks;
  }
  resolveAllDeferredDependencies(resolution) {
    var _a;
    const seenDeps = /* @__PURE__ */ new Set();
    const deferrableTypes = [];
    for (const [_, deps] of resolution.deferPerBlockDependencies) {
      for (const deferBlockDep of deps) {
        const node = deferBlockDep.declaration.node;
        const importDecl = (_a = resolution.deferrableDeclToImportDecl.get(node)) != null ? _a : null;
        if (importDecl !== null && this.deferredSymbolTracker.canDefer(importDecl)) {
          deferBlockDep.isDeferrable = true;
          deferBlockDep.importPath = importDecl.moduleSpecifier.text;
          deferBlockDep.isDefaultImport = isDefaultImport(importDecl);
          if (!seenDeps.has(node)) {
            seenDeps.add(node);
            deferrableTypes.push(deferBlockDep);
          }
        }
      }
    }
    return deferrableTypes;
  }
  collectExplicitlyDeferredSymbols(rawDeferredImports) {
    const deferredTypes = /* @__PURE__ */ new Map();
    if (!ts47.isArrayLiteralExpression(rawDeferredImports)) {
      return deferredTypes;
    }
    for (const element of rawDeferredImports.elements) {
      const node = tryUnwrapForwardRef(element, this.reflector) || element;
      if (!ts47.isIdentifier(node)) {
        continue;
      }
      const imp = this.reflector.getImportOfIdentifier(node);
      if (imp !== null) {
        deferredTypes.set(node, imp);
      }
    }
    return deferredTypes;
  }
  _checkForCyclicImport(importedFile, expr, origin) {
    const imported = resolveImportedFile(this.moduleResolver, importedFile, expr, origin);
    if (imported === null) {
      return null;
    }
    return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
  }
  maybeRecordSyntheticImport(importedFile, expr, origin) {
    const imported = resolveImportedFile(this.moduleResolver, importedFile, expr, origin);
    if (imported === null) {
      return;
    }
    this.cycleAnalyzer.recordSyntheticImport(origin, imported);
  }
  resolveDeferBlocks(componentClassDecl, deferBlocks, deferrableDecls, resolutionData, analysisData, eagerlyUsedDecls) {
    const allDeferredDecls = /* @__PURE__ */ new Set();
    for (const [deferBlock, bound] of deferBlocks) {
      const usedDirectives = new Set(bound.getEagerlyUsedDirectives().map((d) => d.ref.node));
      const usedPipes = new Set(bound.getEagerlyUsedPipes());
      let deps;
      if (resolutionData.deferPerBlockDependencies.has(deferBlock)) {
        deps = resolutionData.deferPerBlockDependencies.get(deferBlock);
      } else {
        deps = [];
        resolutionData.deferPerBlockDependencies.set(deferBlock, deps);
      }
      for (const decl of Array.from(deferrableDecls.values())) {
        if (decl.kind === R3TemplateDependencyKind.NgModule) {
          continue;
        }
        if (decl.kind === R3TemplateDependencyKind.Directive && !usedDirectives.has(decl.ref.node)) {
          continue;
        }
        if (decl.kind === R3TemplateDependencyKind.Pipe && !usedPipes.has(decl.name)) {
          continue;
        }
        deps.push({
          typeReference: decl.type,
          symbolName: decl.ref.node.name.text,
          isDeferrable: false,
          importPath: null,
          isDefaultImport: false,
          declaration: decl.ref
        });
        allDeferredDecls.add(decl.ref.node);
      }
    }
    if (analysisData.meta.isStandalone) {
      if (analysisData.rawImports !== null) {
        this.registerDeferrableCandidates(componentClassDecl, analysisData.rawImports, false, allDeferredDecls, eagerlyUsedDecls, resolutionData);
      }
      if (analysisData.rawDeferredImports !== null) {
        this.registerDeferrableCandidates(componentClassDecl, analysisData.rawDeferredImports, true, allDeferredDecls, eagerlyUsedDecls, resolutionData);
      }
    }
  }
  registerDeferrableCandidates(componentClassDecl, importsExpr, isDeferredImport, allDeferredDecls, eagerlyUsedDecls, resolutionData) {
    if (!ts47.isArrayLiteralExpression(importsExpr)) {
      return;
    }
    for (const element of importsExpr.elements) {
      const node = tryUnwrapForwardRef(element, this.reflector) || element;
      if (!ts47.isIdentifier(node)) {
        continue;
      }
      const imp = this.reflector.getImportOfIdentifier(node);
      if (imp === null) {
        continue;
      }
      const decl = this.reflector.getDeclarationOfIdentifier(node);
      if (decl === null) {
        continue;
      }
      if (!isNamedClassDeclaration(decl.node)) {
        continue;
      }
      if (!allDeferredDecls.has(decl.node)) {
        continue;
      }
      if (eagerlyUsedDecls.has(decl.node)) {
        continue;
      }
      const dirMeta = this.metaReader.getDirectiveMetadata(new Reference(decl.node));
      if (dirMeta !== null && !dirMeta.isStandalone) {
        continue;
      }
      const pipeMeta = this.metaReader.getPipeMetadata(new Reference(decl.node));
      if (pipeMeta !== null && !pipeMeta.isStandalone) {
        continue;
      }
      if (dirMeta === null && pipeMeta === null) {
        continue;
      }
      resolutionData.deferrableDeclToImportDecl.set(decl.node, imp.node);
      this.deferredSymbolTracker.markAsDeferrableCandidate(node, imp.node, componentClassDecl, isDeferredImport);
    }
  }
  compileDeferBlocks(resolution) {
    const { deferBlockDepsEmitMode: mode, deferPerBlockDependencies: perBlockDeps, deferPerComponentDependencies: perComponentDeps } = resolution;
    if (mode === 0) {
      if (!perBlockDeps) {
        throw new Error("Internal error: deferPerBlockDependencies must be present when compiling in PerBlock mode");
      }
      const blocks = /* @__PURE__ */ new Map();
      for (const [block, dependencies] of perBlockDeps) {
        blocks.set(block, dependencies.length === 0 ? null : compileDeferResolverFunction({ mode, dependencies }));
      }
      return { mode, blocks };
    }
    if (mode === 1) {
      if (!perComponentDeps) {
        throw new Error("Internal error: deferPerComponentDependencies must be present in PerComponent mode");
      }
      return {
        mode,
        dependenciesFn: perComponentDeps.length === 0 ? null : compileDeferResolverFunction({ mode, dependencies: perComponentDeps })
      };
    }
    throw new Error(`Invalid deferBlockDepsEmitMode. Cannot compile deferred block metadata.`);
  }
};
function createTargetBinder(dependencies) {
  const matcher = new SelectorMatcher3();
  for (const dep of dependencies) {
    if (dep.kind === MetaKind.Directive && dep.selector !== null) {
      matcher.addSelectables(CssSelector4.parse(dep.selector), [dep]);
    }
  }
  return new R3TargetBinder(matcher);
}
function getExplicitlyDeferredDeps(scope) {
  return scope.kind === ComponentScopeKind.NgModule ? [] : scope.deferredDependencies;
}
function extractPipes(dependencies) {
  const pipes = /* @__PURE__ */ new Map();
  for (const dep of dependencies) {
    if (dep.kind === MetaKind.Pipe) {
      pipes.set(dep.name, dep);
    }
  }
  return pipes;
}
function removeDeferrableTypesFromComponentDecorator(analysis, deferrableTypes) {
  if (analysis.classMetadata) {
    const deferrableSymbols = new Set(deferrableTypes.map((t) => t.symbolName));
    const rewrittenDecoratorsNode = removeIdentifierReferences(analysis.classMetadata.decorators.node, deferrableSymbols);
    analysis.classMetadata.decorators = new o4.WrappedNodeExpr(rewrittenDecoratorsNode);
  }
}
function validateNoImportOverlap(eagerDeps, deferredDeps, rawDeferredImports) {
  let diagnostic = null;
  const eagerDepsSet = /* @__PURE__ */ new Set();
  for (const eagerDep of eagerDeps) {
    eagerDepsSet.add(eagerDep.ref.node);
  }
  for (const deferredDep of deferredDeps) {
    if (eagerDepsSet.has(deferredDep.ref.node)) {
      const classInfo = deferredDep.ref.debugName ? `The \`${deferredDep.ref.debugName}\`` : "One of the dependencies";
      diagnostic = makeDiagnostic(ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY, getDiagnosticNode(deferredDep.ref, rawDeferredImports), `\`${classInfo}\` is imported via both \`@Component.imports\` and \`@Component.deferredImports\`. To fix this, make sure that dependencies are imported only once.`);
      break;
    }
  }
  return diagnostic;
}
function validateStandaloneImports(importRefs, importExpr, metaReader, scopeReader, isDeferredImport) {
  const diagnostics = [];
  for (const ref of importRefs) {
    const dirMeta = metaReader.getDirectiveMetadata(ref);
    if (dirMeta !== null) {
      if (!dirMeta.isStandalone) {
        diagnostics.push(makeNotStandaloneDiagnostic(scopeReader, ref, importExpr, dirMeta.isComponent ? "component" : "directive"));
      }
      continue;
    }
    const pipeMeta = metaReader.getPipeMetadata(ref);
    if (pipeMeta !== null) {
      if (!pipeMeta.isStandalone) {
        diagnostics.push(makeNotStandaloneDiagnostic(scopeReader, ref, importExpr, "pipe"));
      }
      continue;
    }
    const ngModuleMeta = metaReader.getNgModuleMetadata(ref);
    if (!isDeferredImport && ngModuleMeta !== null) {
      continue;
    }
    const error = isDeferredImport ? makeUnknownComponentDeferredImportDiagnostic(ref, importExpr) : makeUnknownComponentImportDiagnostic(ref, importExpr);
    diagnostics.push(error);
  }
  return diagnostics;
}
function isDefaultImport(node) {
  return node.importClause !== void 0 && node.importClause.namedBindings === void 0;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/src/injectable.mjs
import { compileClassMetadata as compileClassMetadata3, compileDeclareClassMetadata as compileDeclareClassMetadata3, compileDeclareInjectableFromMetadata, compileInjectable, createMayBeForwardRefExpression as createMayBeForwardRefExpression3, FactoryTarget as FactoryTarget4, LiteralExpr as LiteralExpr3, WrappedNodeExpr as WrappedNodeExpr10 } from "@angular/compiler";
import ts48 from "typescript";
var InjectableDecoratorHandler = class {
  reflector;
  evaluator;
  isCore;
  strictCtorDeps;
  injectableRegistry;
  perf;
  includeClassMetadata;
  compilationMode;
  errorOnDuplicateProv;
  constructor(reflector, evaluator, isCore, strictCtorDeps, injectableRegistry, perf, includeClassMetadata, compilationMode, errorOnDuplicateProv = true) {
    this.reflector = reflector;
    this.evaluator = evaluator;
    this.isCore = isCore;
    this.strictCtorDeps = strictCtorDeps;
    this.injectableRegistry = injectableRegistry;
    this.perf = perf;
    this.includeClassMetadata = includeClassMetadata;
    this.compilationMode = compilationMode;
    this.errorOnDuplicateProv = errorOnDuplicateProv;
  }
  precedence = HandlerPrecedence.SHARED;
  name = "InjectableDecoratorHandler";
  detect(node, decorators) {
    if (!decorators) {
      return void 0;
    }
    const decorator = findAngularDecorator(decorators, "Injectable", this.isCore);
    if (decorator !== void 0) {
      return {
        trigger: decorator.node,
        decorator,
        metadata: decorator
      };
    } else {
      return void 0;
    }
  }
  analyze(node, decorator) {
    this.perf.eventCount(PerfEvent.AnalyzeInjectable);
    const meta = extractInjectableMetadata(node, decorator, this.reflector);
    const decorators = this.reflector.getDecoratorsOfDeclaration(node);
    return {
      analysis: {
        meta,
        ctorDeps: extractInjectableCtorDeps(node, meta, decorator, this.reflector, this.isCore, this.strictCtorDeps),
        classMetadata: this.includeClassMetadata ? extractClassMetadata(node, this.reflector, this.isCore) : null,
        needsFactory: !decorators || decorators.every((current) => !isAngularCore(current) || current.name === "Injectable")
      }
    };
  }
  symbol() {
    return null;
  }
  register(node, analysis) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return;
    }
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.ctorDeps
    });
  }
  resolve(node, analysis) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }
    if (requiresValidCtor(analysis.meta)) {
      const diagnostic = checkInheritanceOfInjectable(node, this.injectableRegistry, this.reflector, this.evaluator, this.strictCtorDeps, "Injectable");
      if (diagnostic !== null) {
        return {
          diagnostics: [diagnostic]
        };
      }
    }
    return {};
  }
  compileFull(node, analysis) {
    return this.compile(compileNgFactoryDefField, (meta) => compileInjectable(meta, false), compileClassMetadata3, node, analysis);
  }
  compilePartial(node, analysis) {
    return this.compile(compileDeclareFactory, compileDeclareInjectableFromMetadata, compileDeclareClassMetadata3, node, analysis);
  }
  compileLocal(node, analysis) {
    return this.compile(compileNgFactoryDefField, (meta) => compileInjectable(meta, false), compileClassMetadata3, node, analysis);
  }
  compile(compileFactoryFn, compileInjectableFn, compileClassMetadataFn, node, analysis) {
    const results = [];
    if (analysis.needsFactory) {
      const meta = analysis.meta;
      const factoryRes = compileFactoryFn(toFactoryMetadata({ ...meta, deps: analysis.ctorDeps }, FactoryTarget4.Injectable));
      if (analysis.classMetadata !== null) {
        factoryRes.statements.push(compileClassMetadataFn(analysis.classMetadata).toStmt());
      }
      results.push(factoryRes);
    }
    const \u0275prov = this.reflector.getMembersOfClass(node).find((member) => member.name === "\u0275prov");
    if (\u0275prov !== void 0 && this.errorOnDuplicateProv) {
      throw new FatalDiagnosticError(ErrorCode.INJECTABLE_DUPLICATE_PROV, \u0275prov.nameNode || \u0275prov.node || node, "Injectables cannot contain a static \u0275prov property, because the compiler is going to generate one.");
    }
    if (\u0275prov === void 0) {
      const res = compileInjectableFn(analysis.meta);
      results.push({
        name: "\u0275prov",
        initializer: res.expression,
        statements: res.statements,
        type: res.type,
        deferrableImports: null
      });
    }
    return results;
  }
};
function extractInjectableMetadata(clazz, decorator, reflector) {
  const name = clazz.name.text;
  const type = wrapTypeReference(reflector, clazz);
  const typeArgumentCount = reflector.getGenericArityOfClass(clazz) || 0;
  if (decorator.args === null) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_NOT_CALLED, decorator.node, "@Injectable must be called");
  }
  if (decorator.args.length === 0) {
    return {
      name,
      type,
      typeArgumentCount,
      providedIn: createMayBeForwardRefExpression3(new LiteralExpr3(null), 0)
    };
  } else if (decorator.args.length === 1) {
    const metaNode = decorator.args[0];
    if (!ts48.isObjectLiteralExpression(metaNode)) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARG_NOT_LITERAL, metaNode, `@Injectable argument must be an object literal`);
    }
    const meta = reflectObjectLiteral(metaNode);
    const providedIn = meta.has("providedIn") ? getProviderExpression(meta.get("providedIn"), reflector) : createMayBeForwardRefExpression3(new LiteralExpr3(null), 0);
    let deps = void 0;
    if ((meta.has("useClass") || meta.has("useFactory")) && meta.has("deps")) {
      const depsExpr = meta.get("deps");
      if (!ts48.isArrayLiteralExpression(depsExpr)) {
        throw new FatalDiagnosticError(ErrorCode.VALUE_NOT_LITERAL, depsExpr, `@Injectable deps metadata must be an inline array`);
      }
      deps = depsExpr.elements.map((dep) => getDep(dep, reflector));
    }
    const result = { name, type, typeArgumentCount, providedIn };
    if (meta.has("useValue")) {
      result.useValue = getProviderExpression(meta.get("useValue"), reflector);
    } else if (meta.has("useExisting")) {
      result.useExisting = getProviderExpression(meta.get("useExisting"), reflector);
    } else if (meta.has("useClass")) {
      result.useClass = getProviderExpression(meta.get("useClass"), reflector);
      result.deps = deps;
    } else if (meta.has("useFactory")) {
      result.useFactory = new WrappedNodeExpr10(meta.get("useFactory"));
      result.deps = deps;
    }
    return result;
  } else {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.args[2], "Too many arguments to @Injectable");
  }
}
function getProviderExpression(expression, reflector) {
  const forwardRefValue = tryUnwrapForwardRef(expression, reflector);
  return createMayBeForwardRefExpression3(new WrappedNodeExpr10(forwardRefValue != null ? forwardRefValue : expression), forwardRefValue !== null ? 2 : 0);
}
function extractInjectableCtorDeps(clazz, meta, decorator, reflector, isCore, strictCtorDeps) {
  if (decorator.args === null) {
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_NOT_CALLED, decorator.node, "@Injectable must be called");
  }
  let ctorDeps = null;
  if (decorator.args.length === 0) {
    if (strictCtorDeps && !isAbstractClassDeclaration(clazz)) {
      ctorDeps = getValidConstructorDependencies(clazz, reflector, isCore);
    } else {
      ctorDeps = unwrapConstructorDependencies(getConstructorDependencies(clazz, reflector, isCore));
    }
    return ctorDeps;
  } else if (decorator.args.length === 1) {
    const rawCtorDeps = getConstructorDependencies(clazz, reflector, isCore);
    if (strictCtorDeps && !isAbstractClassDeclaration(clazz) && requiresValidCtor(meta)) {
      ctorDeps = validateConstructorDependencies(clazz, rawCtorDeps);
    } else {
      ctorDeps = unwrapConstructorDependencies(rawCtorDeps);
    }
  }
  return ctorDeps;
}
function requiresValidCtor(meta) {
  return meta.useValue === void 0 && meta.useExisting === void 0 && meta.useClass === void 0 && meta.useFactory === void 0;
}
function getDep(dep, reflector) {
  const meta = {
    token: new WrappedNodeExpr10(dep),
    attributeNameType: null,
    host: false,
    optional: false,
    self: false,
    skipSelf: false
  };
  function maybeUpdateDecorator(dec, reflector2, token) {
    const source = reflector2.getImportOfIdentifier(dec);
    if (source === null || source.from !== "@angular/core") {
      return false;
    }
    switch (source.name) {
      case "Inject":
        if (token !== void 0) {
          meta.token = new WrappedNodeExpr10(token);
        }
        break;
      case "Optional":
        meta.optional = true;
        break;
      case "SkipSelf":
        meta.skipSelf = true;
        break;
      case "Self":
        meta.self = true;
        break;
      default:
        return false;
    }
    return true;
  }
  if (ts48.isArrayLiteralExpression(dep)) {
    dep.elements.forEach((el) => {
      let isDecorator = false;
      if (ts48.isIdentifier(el)) {
        isDecorator = maybeUpdateDecorator(el, reflector);
      } else if (ts48.isNewExpression(el) && ts48.isIdentifier(el.expression)) {
        const token = el.arguments && el.arguments.length > 0 && el.arguments[0] || void 0;
        isDecorator = maybeUpdateDecorator(el.expression, reflector, token);
      }
      if (!isDecorator) {
        meta.token = new WrappedNodeExpr10(el);
      }
    });
  }
  return meta;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/annotations/src/pipe.mjs
import { compileClassMetadata as compileClassMetadata4, compileDeclareClassMetadata as compileDeclareClassMetadata4, compileDeclarePipeFromMetadata, compilePipeFromMetadata, FactoryTarget as FactoryTarget5 } from "@angular/compiler";
import ts49 from "typescript";
var PipeSymbol = class extends SemanticSymbol {
  name;
  constructor(decl, name) {
    super(decl);
    this.name = name;
  }
  isPublicApiAffected(previousSymbol) {
    if (!(previousSymbol instanceof PipeSymbol)) {
      return true;
    }
    return this.name !== previousSymbol.name;
  }
  isTypeCheckApiAffected(previousSymbol) {
    return this.isPublicApiAffected(previousSymbol);
  }
};
var PipeDecoratorHandler = class {
  reflector;
  evaluator;
  metaRegistry;
  scopeRegistry;
  injectableRegistry;
  isCore;
  perf;
  includeClassMetadata;
  compilationMode;
  generateExtraImportsInLocalMode;
  strictStandalone;
  implicitStandaloneValue;
  constructor(reflector, evaluator, metaRegistry, scopeRegistry, injectableRegistry, isCore, perf, includeClassMetadata, compilationMode, generateExtraImportsInLocalMode, strictStandalone, implicitStandaloneValue) {
    this.reflector = reflector;
    this.evaluator = evaluator;
    this.metaRegistry = metaRegistry;
    this.scopeRegistry = scopeRegistry;
    this.injectableRegistry = injectableRegistry;
    this.isCore = isCore;
    this.perf = perf;
    this.includeClassMetadata = includeClassMetadata;
    this.compilationMode = compilationMode;
    this.generateExtraImportsInLocalMode = generateExtraImportsInLocalMode;
    this.strictStandalone = strictStandalone;
    this.implicitStandaloneValue = implicitStandaloneValue;
  }
  precedence = HandlerPrecedence.PRIMARY;
  name = "PipeDecoratorHandler";
  detect(node, decorators) {
    if (!decorators) {
      return void 0;
    }
    const decorator = findAngularDecorator(decorators, "Pipe", this.isCore);
    if (decorator !== void 0) {
      return {
        trigger: decorator.node,
        decorator,
        metadata: decorator
      };
    } else {
      return void 0;
    }
  }
  analyze(clazz, decorator) {
    var _a;
    this.perf.eventCount(PerfEvent.AnalyzePipe);
    const name = clazz.name.text;
    const type = wrapTypeReference(this.reflector, clazz);
    if (decorator.args === null) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_NOT_CALLED, decorator.node, `@Pipe must be called`);
    }
    if (decorator.args.length !== 1) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, "@Pipe must have exactly one argument");
    }
    const meta = unwrapExpression(decorator.args[0]);
    if (!ts49.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, "@Pipe must have a literal argument");
    }
    const pipe = reflectObjectLiteral(meta);
    if (!pipe.has("name")) {
      throw new FatalDiagnosticError(ErrorCode.PIPE_MISSING_NAME, meta, `@Pipe decorator is missing name field`);
    }
    const pipeNameExpr = pipe.get("name");
    const pipeName = this.evaluator.evaluate(pipeNameExpr);
    if (typeof pipeName !== "string") {
      throw createValueHasWrongTypeError(pipeNameExpr, pipeName, `@Pipe.name must be a string`);
    }
    let pure = true;
    if (pipe.has("pure")) {
      const expr = pipe.get("pure");
      const pureValue = this.evaluator.evaluate(expr);
      if (typeof pureValue !== "boolean") {
        throw createValueHasWrongTypeError(expr, pureValue, `@Pipe.pure must be a boolean`);
      }
      pure = pureValue;
    }
    let isStandalone = this.implicitStandaloneValue;
    if (pipe.has("standalone")) {
      const expr = pipe.get("standalone");
      const resolved = this.evaluator.evaluate(expr);
      if (typeof resolved !== "boolean") {
        throw createValueHasWrongTypeError(expr, resolved, `standalone flag must be a boolean`);
      }
      isStandalone = resolved;
      if (!isStandalone && this.strictStandalone) {
        throw new FatalDiagnosticError(ErrorCode.NON_STANDALONE_NOT_ALLOWED, expr, `Only standalone pipes are allowed when 'strictStandalone' is enabled.`);
      }
    }
    return {
      analysis: {
        meta: {
          name,
          type,
          typeArgumentCount: this.reflector.getGenericArityOfClass(clazz) || 0,
          pipeName,
          deps: getValidConstructorDependencies(clazz, this.reflector, this.isCore),
          pure,
          isStandalone
        },
        classMetadata: this.includeClassMetadata ? extractClassMetadata(clazz, this.reflector, this.isCore) : null,
        pipeNameExpr,
        decorator: (_a = decorator == null ? void 0 : decorator.node) != null ? _a : null
      }
    };
  }
  symbol(node, analysis) {
    return new PipeSymbol(node, analysis.meta.pipeName);
  }
  register(node, analysis) {
    const ref = new Reference(node);
    this.metaRegistry.registerPipeMetadata({
      kind: MetaKind.Pipe,
      ref,
      name: analysis.meta.pipeName,
      nameExpr: analysis.pipeNameExpr,
      isStandalone: analysis.meta.isStandalone,
      decorator: analysis.decorator,
      isExplicitlyDeferred: false
    });
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps
    });
  }
  resolve(node) {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }
    const duplicateDeclData = this.scopeRegistry.getDuplicateDeclarations(node);
    if (duplicateDeclData !== null) {
      return {
        diagnostics: [makeDuplicateDeclarationError(node, duplicateDeclData, "Pipe")]
      };
    }
    return {};
  }
  compileFull(node, analysis) {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget5.Pipe));
    const def = compilePipeFromMetadata(analysis.meta);
    const classMetadata = analysis.classMetadata !== null ? compileClassMetadata4(analysis.classMetadata).toStmt() : null;
    return compileResults(fac, def, classMetadata, "\u0275pipe", null, null);
  }
  compilePartial(node, analysis) {
    const fac = compileDeclareFactory(toFactoryMetadata(analysis.meta, FactoryTarget5.Pipe));
    const def = compileDeclarePipeFromMetadata(analysis.meta);
    const classMetadata = analysis.classMetadata !== null ? compileDeclareClassMetadata4(analysis.classMetadata).toStmt() : null;
    return compileResults(fac, def, classMetadata, "\u0275pipe", null, null);
  }
  compileLocal(node, analysis) {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget5.Pipe));
    const def = compilePipeFromMetadata(analysis.meta);
    const classMetadata = analysis.classMetadata !== null ? compileClassMetadata4(analysis.classMetadata).toStmt() : null;
    return compileResults(fac, def, classMetadata, "\u0275pipe", null, null);
  }
};

export {
  isAngularDecorator,
  getAngularDecorators,
  forwardRefResolver,
  MetaKind,
  CompoundMetadataReader,
  DtsMetadataReader,
  LocalMetadataRegistry,
  CompoundMetadataRegistry,
  ResourceRegistry,
  ExportedProviderStatusResolver,
  HostDirectivesResolver,
  DynamicValue,
  StaticInterpreter,
  PartialEvaluator,
  CompilationMode,
  aliasTransformFactory,
  TraitCompiler,
  DtsTransformRegistry,
  declarationTransformFactory,
  ivyTransformFactory,
  InjectableClassRegistry,
  NoopReferencesRegistry,
  JitDeclarationRegistry,
  SemanticDepGraphUpdater,
  ComponentScopeKind,
  CompoundComponentScopeReader,
  MetadataDtsModuleScopeResolver,
  LocalModuleScopeRegistry,
  TypeCheckScopeRegistry,
  tryParseInitializerApi,
  INPUT_INITIALIZER_FN,
  tryParseSignalInputMapping,
  MODEL_INITIALIZER_FN,
  tryParseSignalModelMapping,
  OUTPUT_INITIALIZER_FNS,
  tryParseInitializerBasedOutput,
  QUERY_INITIALIZER_FNS,
  tryParseSignalQueryFromInitializer,
  queryDecoratorNames,
  DirectiveDecoratorHandler,
  NgModuleDecoratorHandler,
  NgOriginalFile,
  isShim,
  untagAllTsFiles,
  retagAllTsFiles,
  ShimAdapter,
  ShimReferenceTagger,
  TsCreateProgramDriver,
  OptimizeFor,
  PotentialImportKind,
  PotentialImportMode,
  SymbolKind,
  TypeCheckShimGenerator,
  TemplateTypeCheckerImpl,
  ComponentDecoratorHandler,
  InjectableDecoratorHandler,
  PipeDecoratorHandler
};
/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
//# sourceMappingURL=chunk-GEKWXKEG.js.map
