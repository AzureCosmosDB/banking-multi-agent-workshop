
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  LogicalProjectPath,
  absoluteFrom,
  absoluteFromSourceFile,
  dirname,
  getFileSystem,
  relative,
  resolve,
  stripExtension,
  toRelativeImport
} from "./chunk-37JMVF7H.js";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/diagnostics/src/error_code.mjs
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["DECORATOR_ARG_NOT_LITERAL"] = 1001] = "DECORATOR_ARG_NOT_LITERAL";
  ErrorCode2[ErrorCode2["DECORATOR_ARITY_WRONG"] = 1002] = "DECORATOR_ARITY_WRONG";
  ErrorCode2[ErrorCode2["DECORATOR_NOT_CALLED"] = 1003] = "DECORATOR_NOT_CALLED";
  ErrorCode2[ErrorCode2["DECORATOR_UNEXPECTED"] = 1005] = "DECORATOR_UNEXPECTED";
  ErrorCode2[ErrorCode2["DECORATOR_COLLISION"] = 1006] = "DECORATOR_COLLISION";
  ErrorCode2[ErrorCode2["VALUE_HAS_WRONG_TYPE"] = 1010] = "VALUE_HAS_WRONG_TYPE";
  ErrorCode2[ErrorCode2["VALUE_NOT_LITERAL"] = 1011] = "VALUE_NOT_LITERAL";
  ErrorCode2[ErrorCode2["INITIALIZER_API_WITH_DISALLOWED_DECORATOR"] = 1050] = "INITIALIZER_API_WITH_DISALLOWED_DECORATOR";
  ErrorCode2[ErrorCode2["INITIALIZER_API_DECORATOR_METADATA_COLLISION"] = 1051] = "INITIALIZER_API_DECORATOR_METADATA_COLLISION";
  ErrorCode2[ErrorCode2["INITIALIZER_API_NO_REQUIRED_FUNCTION"] = 1052] = "INITIALIZER_API_NO_REQUIRED_FUNCTION";
  ErrorCode2[ErrorCode2["INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY"] = 1053] = "INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY";
  ErrorCode2[ErrorCode2["INCORRECTLY_DECLARED_ON_STATIC_MEMBER"] = 1100] = "INCORRECTLY_DECLARED_ON_STATIC_MEMBER";
  ErrorCode2[ErrorCode2["COMPONENT_MISSING_TEMPLATE"] = 2001] = "COMPONENT_MISSING_TEMPLATE";
  ErrorCode2[ErrorCode2["PIPE_MISSING_NAME"] = 2002] = "PIPE_MISSING_NAME";
  ErrorCode2[ErrorCode2["PARAM_MISSING_TOKEN"] = 2003] = "PARAM_MISSING_TOKEN";
  ErrorCode2[ErrorCode2["DIRECTIVE_MISSING_SELECTOR"] = 2004] = "DIRECTIVE_MISSING_SELECTOR";
  ErrorCode2[ErrorCode2["UNDECORATED_PROVIDER"] = 2005] = "UNDECORATED_PROVIDER";
  ErrorCode2[ErrorCode2["DIRECTIVE_INHERITS_UNDECORATED_CTOR"] = 2006] = "DIRECTIVE_INHERITS_UNDECORATED_CTOR";
  ErrorCode2[ErrorCode2["UNDECORATED_CLASS_USING_ANGULAR_FEATURES"] = 2007] = "UNDECORATED_CLASS_USING_ANGULAR_FEATURES";
  ErrorCode2[ErrorCode2["COMPONENT_RESOURCE_NOT_FOUND"] = 2008] = "COMPONENT_RESOURCE_NOT_FOUND";
  ErrorCode2[ErrorCode2["COMPONENT_INVALID_SHADOW_DOM_SELECTOR"] = 2009] = "COMPONENT_INVALID_SHADOW_DOM_SELECTOR";
  ErrorCode2[ErrorCode2["COMPONENT_NOT_STANDALONE"] = 2010] = "COMPONENT_NOT_STANDALONE";
  ErrorCode2[ErrorCode2["COMPONENT_IMPORT_NOT_STANDALONE"] = 2011] = "COMPONENT_IMPORT_NOT_STANDALONE";
  ErrorCode2[ErrorCode2["COMPONENT_UNKNOWN_IMPORT"] = 2012] = "COMPONENT_UNKNOWN_IMPORT";
  ErrorCode2[ErrorCode2["HOST_DIRECTIVE_INVALID"] = 2013] = "HOST_DIRECTIVE_INVALID";
  ErrorCode2[ErrorCode2["HOST_DIRECTIVE_NOT_STANDALONE"] = 2014] = "HOST_DIRECTIVE_NOT_STANDALONE";
  ErrorCode2[ErrorCode2["HOST_DIRECTIVE_COMPONENT"] = 2015] = "HOST_DIRECTIVE_COMPONENT";
  ErrorCode2[ErrorCode2["INJECTABLE_INHERITS_INVALID_CONSTRUCTOR"] = 2016] = "INJECTABLE_INHERITS_INVALID_CONSTRUCTOR";
  ErrorCode2[ErrorCode2["HOST_DIRECTIVE_UNDEFINED_BINDING"] = 2017] = "HOST_DIRECTIVE_UNDEFINED_BINDING";
  ErrorCode2[ErrorCode2["HOST_DIRECTIVE_CONFLICTING_ALIAS"] = 2018] = "HOST_DIRECTIVE_CONFLICTING_ALIAS";
  ErrorCode2[ErrorCode2["HOST_DIRECTIVE_MISSING_REQUIRED_BINDING"] = 2019] = "HOST_DIRECTIVE_MISSING_REQUIRED_BINDING";
  ErrorCode2[ErrorCode2["CONFLICTING_INPUT_TRANSFORM"] = 2020] = "CONFLICTING_INPUT_TRANSFORM";
  ErrorCode2[ErrorCode2["COMPONENT_INVALID_STYLE_URLS"] = 2021] = "COMPONENT_INVALID_STYLE_URLS";
  ErrorCode2[ErrorCode2["COMPONENT_UNKNOWN_DEFERRED_IMPORT"] = 2022] = "COMPONENT_UNKNOWN_DEFERRED_IMPORT";
  ErrorCode2[ErrorCode2["NON_STANDALONE_NOT_ALLOWED"] = 2023] = "NON_STANDALONE_NOT_ALLOWED";
  ErrorCode2[ErrorCode2["SYMBOL_NOT_EXPORTED"] = 3001] = "SYMBOL_NOT_EXPORTED";
  ErrorCode2[ErrorCode2["IMPORT_CYCLE_DETECTED"] = 3003] = "IMPORT_CYCLE_DETECTED";
  ErrorCode2[ErrorCode2["IMPORT_GENERATION_FAILURE"] = 3004] = "IMPORT_GENERATION_FAILURE";
  ErrorCode2[ErrorCode2["CONFIG_FLAT_MODULE_NO_INDEX"] = 4001] = "CONFIG_FLAT_MODULE_NO_INDEX";
  ErrorCode2[ErrorCode2["CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK"] = 4002] = "CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK";
  ErrorCode2[ErrorCode2["CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES"] = 4003] = "CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES";
  ErrorCode2[ErrorCode2["CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL"] = 4004] = "CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL";
  ErrorCode2[ErrorCode2["CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK"] = 4005] = "CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK";
  ErrorCode2[ErrorCode2["HOST_BINDING_PARSE_ERROR"] = 5001] = "HOST_BINDING_PARSE_ERROR";
  ErrorCode2[ErrorCode2["TEMPLATE_PARSE_ERROR"] = 5002] = "TEMPLATE_PARSE_ERROR";
  ErrorCode2[ErrorCode2["NGMODULE_INVALID_DECLARATION"] = 6001] = "NGMODULE_INVALID_DECLARATION";
  ErrorCode2[ErrorCode2["NGMODULE_INVALID_IMPORT"] = 6002] = "NGMODULE_INVALID_IMPORT";
  ErrorCode2[ErrorCode2["NGMODULE_INVALID_EXPORT"] = 6003] = "NGMODULE_INVALID_EXPORT";
  ErrorCode2[ErrorCode2["NGMODULE_INVALID_REEXPORT"] = 6004] = "NGMODULE_INVALID_REEXPORT";
  ErrorCode2[ErrorCode2["NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC"] = 6005] = "NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC";
  ErrorCode2[ErrorCode2["NGMODULE_REEXPORT_NAME_COLLISION"] = 6006] = "NGMODULE_REEXPORT_NAME_COLLISION";
  ErrorCode2[ErrorCode2["NGMODULE_DECLARATION_NOT_UNIQUE"] = 6007] = "NGMODULE_DECLARATION_NOT_UNIQUE";
  ErrorCode2[ErrorCode2["NGMODULE_DECLARATION_IS_STANDALONE"] = 6008] = "NGMODULE_DECLARATION_IS_STANDALONE";
  ErrorCode2[ErrorCode2["NGMODULE_BOOTSTRAP_IS_STANDALONE"] = 6009] = "NGMODULE_BOOTSTRAP_IS_STANDALONE";
  ErrorCode2[ErrorCode2["WARN_NGMODULE_ID_UNNECESSARY"] = 6100] = "WARN_NGMODULE_ID_UNNECESSARY";
  ErrorCode2[ErrorCode2["SCHEMA_INVALID_ELEMENT"] = 8001] = "SCHEMA_INVALID_ELEMENT";
  ErrorCode2[ErrorCode2["SCHEMA_INVALID_ATTRIBUTE"] = 8002] = "SCHEMA_INVALID_ATTRIBUTE";
  ErrorCode2[ErrorCode2["MISSING_REFERENCE_TARGET"] = 8003] = "MISSING_REFERENCE_TARGET";
  ErrorCode2[ErrorCode2["MISSING_PIPE"] = 8004] = "MISSING_PIPE";
  ErrorCode2[ErrorCode2["WRITE_TO_READ_ONLY_VARIABLE"] = 8005] = "WRITE_TO_READ_ONLY_VARIABLE";
  ErrorCode2[ErrorCode2["DUPLICATE_VARIABLE_DECLARATION"] = 8006] = "DUPLICATE_VARIABLE_DECLARATION";
  ErrorCode2[ErrorCode2["SPLIT_TWO_WAY_BINDING"] = 8007] = "SPLIT_TWO_WAY_BINDING";
  ErrorCode2[ErrorCode2["MISSING_REQUIRED_INPUTS"] = 8008] = "MISSING_REQUIRED_INPUTS";
  ErrorCode2[ErrorCode2["ILLEGAL_FOR_LOOP_TRACK_ACCESS"] = 8009] = "ILLEGAL_FOR_LOOP_TRACK_ACCESS";
  ErrorCode2[ErrorCode2["INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT"] = 8010] = "INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT";
  ErrorCode2[ErrorCode2["CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION"] = 8011] = "CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION";
  ErrorCode2[ErrorCode2["DEFERRED_PIPE_USED_EAGERLY"] = 8012] = "DEFERRED_PIPE_USED_EAGERLY";
  ErrorCode2[ErrorCode2["DEFERRED_DIRECTIVE_USED_EAGERLY"] = 8013] = "DEFERRED_DIRECTIVE_USED_EAGERLY";
  ErrorCode2[ErrorCode2["DEFERRED_DEPENDENCY_IMPORTED_EAGERLY"] = 8014] = "DEFERRED_DEPENDENCY_IMPORTED_EAGERLY";
  ErrorCode2[ErrorCode2["ILLEGAL_LET_WRITE"] = 8015] = "ILLEGAL_LET_WRITE";
  ErrorCode2[ErrorCode2["LET_USED_BEFORE_DEFINITION"] = 8016] = "LET_USED_BEFORE_DEFINITION";
  ErrorCode2[ErrorCode2["CONFLICTING_LET_DECLARATION"] = 8017] = "CONFLICTING_LET_DECLARATION";
  ErrorCode2[ErrorCode2["INVALID_BANANA_IN_BOX"] = 8101] = "INVALID_BANANA_IN_BOX";
  ErrorCode2[ErrorCode2["NULLISH_COALESCING_NOT_NULLABLE"] = 8102] = "NULLISH_COALESCING_NOT_NULLABLE";
  ErrorCode2[ErrorCode2["MISSING_CONTROL_FLOW_DIRECTIVE"] = 8103] = "MISSING_CONTROL_FLOW_DIRECTIVE";
  ErrorCode2[ErrorCode2["TEXT_ATTRIBUTE_NOT_BINDING"] = 8104] = "TEXT_ATTRIBUTE_NOT_BINDING";
  ErrorCode2[ErrorCode2["MISSING_NGFOROF_LET"] = 8105] = "MISSING_NGFOROF_LET";
  ErrorCode2[ErrorCode2["SUFFIX_NOT_SUPPORTED"] = 8106] = "SUFFIX_NOT_SUPPORTED";
  ErrorCode2[ErrorCode2["OPTIONAL_CHAIN_NOT_NULLABLE"] = 8107] = "OPTIONAL_CHAIN_NOT_NULLABLE";
  ErrorCode2[ErrorCode2["SKIP_HYDRATION_NOT_STATIC"] = 8108] = "SKIP_HYDRATION_NOT_STATIC";
  ErrorCode2[ErrorCode2["INTERPOLATED_SIGNAL_NOT_INVOKED"] = 8109] = "INTERPOLATED_SIGNAL_NOT_INVOKED";
  ErrorCode2[ErrorCode2["UNSUPPORTED_INITIALIZER_API_USAGE"] = 8110] = "UNSUPPORTED_INITIALIZER_API_USAGE";
  ErrorCode2[ErrorCode2["UNINVOKED_FUNCTION_IN_EVENT_BINDING"] = 8111] = "UNINVOKED_FUNCTION_IN_EVENT_BINDING";
  ErrorCode2[ErrorCode2["UNUSED_LET_DECLARATION"] = 8112] = "UNUSED_LET_DECLARATION";
  ErrorCode2[ErrorCode2["UNUSED_STANDALONE_IMPORTS"] = 8113] = "UNUSED_STANDALONE_IMPORTS";
  ErrorCode2[ErrorCode2["INLINE_TCB_REQUIRED"] = 8900] = "INLINE_TCB_REQUIRED";
  ErrorCode2[ErrorCode2["INLINE_TYPE_CTOR_REQUIRED"] = 8901] = "INLINE_TYPE_CTOR_REQUIRED";
  ErrorCode2[ErrorCode2["INJECTABLE_DUPLICATE_PROV"] = 9001] = "INJECTABLE_DUPLICATE_PROV";
  ErrorCode2[ErrorCode2["SUGGEST_STRICT_TEMPLATES"] = 10001] = "SUGGEST_STRICT_TEMPLATES";
  ErrorCode2[ErrorCode2["SUGGEST_SUBOPTIMAL_TYPE_INFERENCE"] = 10002] = "SUGGEST_SUBOPTIMAL_TYPE_INFERENCE";
  ErrorCode2[ErrorCode2["LOCAL_COMPILATION_UNRESOLVED_CONST"] = 11001] = "LOCAL_COMPILATION_UNRESOLVED_CONST";
  ErrorCode2[ErrorCode2["LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION"] = 11003] = "LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION";
})(ErrorCode || (ErrorCode = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/diagnostics/src/util.mjs
var ERROR_CODE_MATCHER = /(\u001b\[\d+m ?)TS-99(\d+: ?\u001b\[\d+m)/g;
function replaceTsWithNgInErrors(errors) {
  return errors.replace(ERROR_CODE_MATCHER, "$1NG$2");
}
function ngErrorCode(code) {
  return parseInt("-99" + code);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/diagnostics/src/error.mjs
import ts from "typescript";
var FatalDiagnosticError = class extends Error {
  code;
  node;
  diagnosticMessage;
  relatedInformation;
  constructor(code, node, diagnosticMessage, relatedInformation) {
    super(`FatalDiagnosticError: Code: ${code}, Message: ${ts.flattenDiagnosticMessageText(diagnosticMessage, "\n")}`);
    this.code = code;
    this.node = node;
    this.diagnosticMessage = diagnosticMessage;
    this.relatedInformation = relatedInformation;
    Object.setPrototypeOf(this, new.target.prototype);
  }
  _isFatalDiagnosticError = true;
  toDiagnostic() {
    return makeDiagnostic(this.code, this.node, this.diagnosticMessage, this.relatedInformation);
  }
};
function makeDiagnostic(code, node, messageText, relatedInformation, category = ts.DiagnosticCategory.Error) {
  node = ts.getOriginalNode(node);
  return {
    category,
    code: ngErrorCode(code),
    file: ts.getOriginalNode(node).getSourceFile(),
    start: node.getStart(void 0, false),
    length: node.getWidth(),
    messageText,
    relatedInformation
  };
}
function makeDiagnosticChain(messageText, next) {
  return {
    category: ts.DiagnosticCategory.Message,
    code: 0,
    messageText,
    next
  };
}
function makeRelatedInformation(node, messageText) {
  node = ts.getOriginalNode(node);
  return {
    category: ts.DiagnosticCategory.Message,
    code: 0,
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    messageText
  };
}
function addDiagnosticChain(messageText, add) {
  if (typeof messageText === "string") {
    return makeDiagnosticChain(messageText, add);
  }
  if (messageText.next === void 0) {
    messageText.next = add;
  } else {
    messageText.next.push(...add);
  }
  return messageText;
}
function isFatalDiagnosticError(err) {
  return err._isFatalDiagnosticError === true;
}
function isLocalCompilationDiagnostics(diagnostic) {
  return diagnostic.code === ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST) || diagnostic.code === ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/diagnostics/src/docs.mjs
var COMPILER_ERRORS_WITH_GUIDES = /* @__PURE__ */ new Set([
  ErrorCode.DECORATOR_ARG_NOT_LITERAL,
  ErrorCode.IMPORT_CYCLE_DETECTED,
  ErrorCode.PARAM_MISSING_TOKEN,
  ErrorCode.SCHEMA_INVALID_ELEMENT,
  ErrorCode.SCHEMA_INVALID_ATTRIBUTE,
  ErrorCode.MISSING_REFERENCE_TARGET,
  ErrorCode.COMPONENT_INVALID_SHADOW_DOM_SELECTOR,
  ErrorCode.WARN_NGMODULE_ID_UNNECESSARY
]);

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.mjs
var ERROR_DETAILS_PAGE_BASE_URL = "https://angular.dev/errors";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/diagnostics/src/extended_template_diagnostic_name.mjs
var ExtendedTemplateDiagnosticName;
(function(ExtendedTemplateDiagnosticName2) {
  ExtendedTemplateDiagnosticName2["INVALID_BANANA_IN_BOX"] = "invalidBananaInBox";
  ExtendedTemplateDiagnosticName2["NULLISH_COALESCING_NOT_NULLABLE"] = "nullishCoalescingNotNullable";
  ExtendedTemplateDiagnosticName2["OPTIONAL_CHAIN_NOT_NULLABLE"] = "optionalChainNotNullable";
  ExtendedTemplateDiagnosticName2["MISSING_CONTROL_FLOW_DIRECTIVE"] = "missingControlFlowDirective";
  ExtendedTemplateDiagnosticName2["TEXT_ATTRIBUTE_NOT_BINDING"] = "textAttributeNotBinding";
  ExtendedTemplateDiagnosticName2["UNINVOKED_FUNCTION_IN_EVENT_BINDING"] = "uninvokedFunctionInEventBinding";
  ExtendedTemplateDiagnosticName2["MISSING_NGFOROF_LET"] = "missingNgForOfLet";
  ExtendedTemplateDiagnosticName2["SUFFIX_NOT_SUPPORTED"] = "suffixNotSupported";
  ExtendedTemplateDiagnosticName2["SKIP_HYDRATION_NOT_STATIC"] = "skipHydrationNotStatic";
  ExtendedTemplateDiagnosticName2["INTERPOLATED_SIGNAL_NOT_INVOKED"] = "interpolatedSignalNotInvoked";
  ExtendedTemplateDiagnosticName2["CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION"] = "controlFlowPreventingContentProjection";
  ExtendedTemplateDiagnosticName2["UNUSED_LET_DECLARATION"] = "unusedLetDeclaration";
  ExtendedTemplateDiagnosticName2["UNUSED_STANDALONE_IMPORTS"] = "unusedStandaloneImports";
})(ExtendedTemplateDiagnosticName || (ExtendedTemplateDiagnosticName = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/reflection/src/typescript.mjs
import ts5 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/reflection/src/host.mjs
import ts2 from "typescript";
function isDecoratorIdentifier(exp) {
  return ts2.isIdentifier(exp) || ts2.isPropertyAccessExpression(exp) && ts2.isIdentifier(exp.expression) && ts2.isIdentifier(exp.name);
}
var ClassMemberKind;
(function(ClassMemberKind2) {
  ClassMemberKind2[ClassMemberKind2["Constructor"] = 0] = "Constructor";
  ClassMemberKind2[ClassMemberKind2["Getter"] = 1] = "Getter";
  ClassMemberKind2[ClassMemberKind2["Setter"] = 2] = "Setter";
  ClassMemberKind2[ClassMemberKind2["Property"] = 3] = "Property";
  ClassMemberKind2[ClassMemberKind2["Method"] = 4] = "Method";
})(ClassMemberKind || (ClassMemberKind = {}));
var ClassMemberAccessLevel;
(function(ClassMemberAccessLevel2) {
  ClassMemberAccessLevel2[ClassMemberAccessLevel2["PublicWritable"] = 0] = "PublicWritable";
  ClassMemberAccessLevel2[ClassMemberAccessLevel2["PublicReadonly"] = 1] = "PublicReadonly";
  ClassMemberAccessLevel2[ClassMemberAccessLevel2["Protected"] = 2] = "Protected";
  ClassMemberAccessLevel2[ClassMemberAccessLevel2["Private"] = 3] = "Private";
  ClassMemberAccessLevel2[ClassMemberAccessLevel2["EcmaScriptPrivate"] = 4] = "EcmaScriptPrivate";
})(ClassMemberAccessLevel || (ClassMemberAccessLevel = {}));
var AmbientImport = {};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/reflection/src/type_to_value.mjs
import ts3 from "typescript";
function typeToValue(typeNode, checker, isLocalCompilation) {
  var _a, _b;
  if (typeNode === null) {
    return missingType();
  }
  if (!ts3.isTypeReferenceNode(typeNode)) {
    return unsupportedType(typeNode);
  }
  const symbols = resolveTypeSymbols(typeNode, checker);
  if (symbols === null) {
    return unknownReference(typeNode);
  }
  const { local, decl } = symbols;
  if (decl.valueDeclaration === void 0 || decl.flags & ts3.SymbolFlags.ConstEnum) {
    let typeOnlyDecl = null;
    if (decl.declarations !== void 0 && decl.declarations.length > 0) {
      typeOnlyDecl = decl.declarations[0];
    }
    if (!isLocalCompilation || typeOnlyDecl && [
      ts3.SyntaxKind.TypeParameter,
      ts3.SyntaxKind.TypeAliasDeclaration,
      ts3.SyntaxKind.InterfaceDeclaration
    ].includes(typeOnlyDecl.kind)) {
      return noValueDeclaration(typeNode, typeOnlyDecl);
    }
  }
  const firstDecl = local.declarations && local.declarations[0];
  if (firstDecl !== void 0) {
    if (ts3.isImportClause(firstDecl) && firstDecl.name !== void 0) {
      if (firstDecl.isTypeOnly) {
        return typeOnlyImport(typeNode, firstDecl);
      }
      if (!ts3.isImportDeclaration(firstDecl.parent)) {
        return unsupportedType(typeNode);
      }
      return {
        kind: 0,
        expression: firstDecl.name,
        defaultImportStatement: firstDecl.parent
      };
    } else if (ts3.isImportSpecifier(firstDecl)) {
      if (firstDecl.isTypeOnly) {
        return typeOnlyImport(typeNode, firstDecl);
      }
      if (firstDecl.parent.parent.isTypeOnly) {
        return typeOnlyImport(typeNode, firstDecl.parent.parent);
      }
      const importedName = (firstDecl.propertyName || firstDecl.name).text;
      const [_localName, ...nestedPath] = symbols.symbolNames;
      const importDeclaration = firstDecl.parent.parent.parent;
      if (!ts3.isImportDeclaration(importDeclaration)) {
        return unsupportedType(typeNode);
      }
      const moduleName = extractModuleName(importDeclaration);
      return {
        kind: 1,
        valueDeclaration: (_a = decl.valueDeclaration) != null ? _a : null,
        moduleName,
        importedName,
        nestedPath
      };
    } else if (ts3.isNamespaceImport(firstDecl)) {
      if (firstDecl.parent.isTypeOnly) {
        return typeOnlyImport(typeNode, firstDecl.parent);
      }
      if (symbols.symbolNames.length === 1) {
        return namespaceImport(typeNode, firstDecl.parent);
      }
      const [_ns, importedName, ...nestedPath] = symbols.symbolNames;
      const importDeclaration = firstDecl.parent.parent;
      if (!ts3.isImportDeclaration(importDeclaration)) {
        return unsupportedType(typeNode);
      }
      const moduleName = extractModuleName(importDeclaration);
      return {
        kind: 1,
        valueDeclaration: (_b = decl.valueDeclaration) != null ? _b : null,
        moduleName,
        importedName,
        nestedPath
      };
    }
  }
  const expression = typeNodeToValueExpr(typeNode);
  if (expression !== null) {
    return {
      kind: 0,
      expression,
      defaultImportStatement: null
    };
  } else {
    return unsupportedType(typeNode);
  }
}
function unsupportedType(typeNode) {
  return {
    kind: 2,
    reason: { kind: 5, typeNode }
  };
}
function noValueDeclaration(typeNode, decl) {
  return {
    kind: 2,
    reason: { kind: 1, typeNode, decl }
  };
}
function typeOnlyImport(typeNode, node) {
  return {
    kind: 2,
    reason: { kind: 2, typeNode, node }
  };
}
function unknownReference(typeNode) {
  return {
    kind: 2,
    reason: { kind: 3, typeNode }
  };
}
function namespaceImport(typeNode, importClause) {
  return {
    kind: 2,
    reason: { kind: 4, typeNode, importClause }
  };
}
function missingType() {
  return {
    kind: 2,
    reason: { kind: 0 }
  };
}
function typeNodeToValueExpr(node) {
  if (ts3.isTypeReferenceNode(node)) {
    return entityNameToValue(node.typeName);
  } else {
    return null;
  }
}
function resolveTypeSymbols(typeRef, checker) {
  const typeName = typeRef.typeName;
  const typeRefSymbol = checker.getSymbolAtLocation(typeName);
  if (typeRefSymbol === void 0) {
    return null;
  }
  let local = typeRefSymbol;
  let leftMost = typeName;
  const symbolNames = [];
  while (ts3.isQualifiedName(leftMost)) {
    symbolNames.unshift(leftMost.right.text);
    leftMost = leftMost.left;
  }
  symbolNames.unshift(leftMost.text);
  if (leftMost !== typeName) {
    const localTmp = checker.getSymbolAtLocation(leftMost);
    if (localTmp !== void 0) {
      local = localTmp;
    }
  }
  let decl = typeRefSymbol;
  if (typeRefSymbol.flags & ts3.SymbolFlags.Alias) {
    decl = checker.getAliasedSymbol(typeRefSymbol);
  }
  return { local, decl, symbolNames };
}
function entityNameToValue(node) {
  if (ts3.isQualifiedName(node)) {
    const left = entityNameToValue(node.left);
    return left !== null ? ts3.factory.createPropertyAccessExpression(left, node.right) : null;
  } else if (ts3.isIdentifier(node)) {
    const clone = ts3.setOriginalNode(ts3.factory.createIdentifier(node.text), node);
    clone.parent = node.parent;
    return clone;
  } else {
    return null;
  }
}
function extractModuleName(node) {
  if (!ts3.isStringLiteral(node.moduleSpecifier)) {
    throw new Error("not a module specifier");
  }
  return node.moduleSpecifier.text;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/reflection/src/util.mjs
import ts4 from "typescript";
function isNamedClassDeclaration(node) {
  return ts4.isClassDeclaration(node) && isIdentifier(node.name);
}
function isIdentifier(node) {
  return node !== void 0 && ts4.isIdentifier(node);
}
function classMemberAccessLevelToString(level) {
  switch (level) {
    case ClassMemberAccessLevel.EcmaScriptPrivate:
      return "ES private";
    case ClassMemberAccessLevel.Private:
      return "private";
    case ClassMemberAccessLevel.Protected:
      return "protected";
    case ClassMemberAccessLevel.PublicReadonly:
      return "public readonly";
    case ClassMemberAccessLevel.PublicWritable:
    default:
      return "public";
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/reflection/src/typescript.mjs
var TypeScriptReflectionHost = class {
  checker;
  isLocalCompilation;
  skipPrivateValueDeclarationTypes;
  constructor(checker, isLocalCompilation = false, skipPrivateValueDeclarationTypes = false) {
    this.checker = checker;
    this.isLocalCompilation = isLocalCompilation;
    this.skipPrivateValueDeclarationTypes = skipPrivateValueDeclarationTypes;
  }
  getDecoratorsOfDeclaration(declaration) {
    const decorators = ts5.canHaveDecorators(declaration) ? ts5.getDecorators(declaration) : void 0;
    return decorators !== void 0 && decorators.length ? decorators.map((decorator) => this._reflectDecorator(decorator)).filter((dec) => dec !== null) : null;
  }
  getMembersOfClass(clazz) {
    const tsClazz = castDeclarationToClassOrDie(clazz);
    return tsClazz.members.map((member) => {
      const result = reflectClassMember(member);
      if (result === null) {
        return null;
      }
      return {
        ...result,
        decorators: this.getDecoratorsOfDeclaration(member)
      };
    }).filter((member) => member !== null);
  }
  getConstructorParameters(clazz) {
    const tsClazz = castDeclarationToClassOrDie(clazz);
    const isDeclaration2 = tsClazz.getSourceFile().isDeclarationFile;
    const ctor = tsClazz.members.find((member) => ts5.isConstructorDeclaration(member) && (isDeclaration2 || member.body !== void 0));
    if (ctor === void 0) {
      return null;
    }
    return ctor.parameters.map((node) => {
      const name = parameterName(node.name);
      const decorators = this.getDecoratorsOfDeclaration(node);
      let originalTypeNode = node.type || null;
      let typeNode = originalTypeNode;
      if (typeNode && ts5.isUnionTypeNode(typeNode)) {
        let childTypeNodes = typeNode.types.filter((childTypeNode) => !(ts5.isLiteralTypeNode(childTypeNode) && childTypeNode.literal.kind === ts5.SyntaxKind.NullKeyword));
        if (childTypeNodes.length === 1) {
          typeNode = childTypeNodes[0];
        }
      }
      const typeValueReference = typeToValue(typeNode, this.checker, this.isLocalCompilation);
      return {
        name,
        nameNode: node.name,
        typeValueReference,
        typeNode: originalTypeNode,
        decorators
      };
    });
  }
  getImportOfIdentifier(id) {
    const directImport = this.getDirectImportOfIdentifier(id);
    if (directImport !== null) {
      return directImport;
    } else if (ts5.isQualifiedName(id.parent) && id.parent.right === id) {
      return this.getImportOfNamespacedIdentifier(id, getQualifiedNameRoot(id.parent));
    } else if (ts5.isPropertyAccessExpression(id.parent) && id.parent.name === id) {
      return this.getImportOfNamespacedIdentifier(id, getFarLeftIdentifier(id.parent));
    } else {
      return null;
    }
  }
  getExportsOfModule(node) {
    if (!ts5.isSourceFile(node)) {
      throw new Error(`getExportsOfModule() called on non-SourceFile in TS code`);
    }
    const symbol = this.checker.getSymbolAtLocation(node);
    if (symbol === void 0) {
      return null;
    }
    const map = /* @__PURE__ */ new Map();
    this.checker.getExportsOfModule(symbol).forEach((exportSymbol) => {
      const decl = this.getDeclarationOfSymbol(exportSymbol, null);
      if (decl !== null) {
        map.set(exportSymbol.name, decl);
      }
    });
    return map;
  }
  isClass(node) {
    return isNamedClassDeclaration(node);
  }
  hasBaseClass(clazz) {
    return this.getBaseClassExpression(clazz) !== null;
  }
  getBaseClassExpression(clazz) {
    if (!(ts5.isClassDeclaration(clazz) || ts5.isClassExpression(clazz)) || clazz.heritageClauses === void 0) {
      return null;
    }
    const extendsClause = clazz.heritageClauses.find((clause) => clause.token === ts5.SyntaxKind.ExtendsKeyword);
    if (extendsClause === void 0) {
      return null;
    }
    const extendsType = extendsClause.types[0];
    if (extendsType === void 0) {
      return null;
    }
    return extendsType.expression;
  }
  getDeclarationOfIdentifier(id) {
    let symbol = this.checker.getSymbolAtLocation(id);
    if (symbol === void 0) {
      return null;
    }
    return this.getDeclarationOfSymbol(symbol, id);
  }
  getDefinitionOfFunction(node) {
    if (!ts5.isFunctionDeclaration(node) && !ts5.isMethodDeclaration(node) && !ts5.isFunctionExpression(node) && !ts5.isArrowFunction(node)) {
      return null;
    }
    let body = null;
    if (node.body !== void 0) {
      body = ts5.isBlock(node.body) ? Array.from(node.body.statements) : [ts5.factory.createReturnStatement(node.body)];
    }
    const type = this.checker.getTypeAtLocation(node);
    const signatures = this.checker.getSignaturesOfType(type, ts5.SignatureKind.Call);
    return {
      node,
      body,
      signatureCount: signatures.length,
      typeParameters: node.typeParameters === void 0 ? null : Array.from(node.typeParameters),
      parameters: node.parameters.map((param) => {
        const name = parameterName(param.name);
        const initializer = param.initializer || null;
        return { name, node: param, initializer, type: param.type || null };
      })
    };
  }
  getGenericArityOfClass(clazz) {
    if (!ts5.isClassDeclaration(clazz)) {
      return null;
    }
    return clazz.typeParameters !== void 0 ? clazz.typeParameters.length : 0;
  }
  getVariableValue(declaration) {
    return declaration.initializer || null;
  }
  isStaticallyExported(decl) {
    let topLevel = decl;
    if (ts5.isVariableDeclaration(decl) && ts5.isVariableDeclarationList(decl.parent)) {
      topLevel = decl.parent.parent;
    }
    const modifiers = ts5.canHaveModifiers(topLevel) ? ts5.getModifiers(topLevel) : void 0;
    if (modifiers !== void 0 && modifiers.some((modifier) => modifier.kind === ts5.SyntaxKind.ExportKeyword)) {
      return true;
    }
    if (topLevel.parent === void 0 || !ts5.isSourceFile(topLevel.parent)) {
      return false;
    }
    const localExports = this.getLocalExportedDeclarationsOfSourceFile(decl.getSourceFile());
    return localExports.has(decl);
  }
  getDirectImportOfIdentifier(id) {
    const symbol = this.checker.getSymbolAtLocation(id);
    if (symbol === void 0 || symbol.declarations === void 0 || symbol.declarations.length !== 1) {
      return null;
    }
    const decl = symbol.declarations[0];
    const importDecl = getContainingImportDeclaration(decl);
    if (importDecl === null) {
      return null;
    }
    if (!ts5.isStringLiteral(importDecl.moduleSpecifier)) {
      return null;
    }
    return {
      from: importDecl.moduleSpecifier.text,
      name: getExportedName(decl, id),
      node: importDecl
    };
  }
  getImportOfNamespacedIdentifier(id, namespaceIdentifier) {
    if (namespaceIdentifier === null) {
      return null;
    }
    const namespaceSymbol = this.checker.getSymbolAtLocation(namespaceIdentifier);
    if (!namespaceSymbol || namespaceSymbol.declarations === void 0) {
      return null;
    }
    const declaration = namespaceSymbol.declarations.length === 1 ? namespaceSymbol.declarations[0] : null;
    if (!declaration) {
      return null;
    }
    const namespaceDeclaration = ts5.isNamespaceImport(declaration) ? declaration : null;
    if (!namespaceDeclaration) {
      return null;
    }
    const importDeclaration = namespaceDeclaration.parent.parent;
    if (!ts5.isImportDeclaration(importDeclaration) || !ts5.isStringLiteral(importDeclaration.moduleSpecifier)) {
      return null;
    }
    return {
      from: importDeclaration.moduleSpecifier.text,
      name: id.text,
      node: importDeclaration
    };
  }
  getDeclarationOfSymbol(symbol, originalId) {
    let valueDeclaration = void 0;
    if (symbol.valueDeclaration !== void 0) {
      valueDeclaration = symbol.valueDeclaration;
    } else if (symbol.declarations !== void 0 && symbol.declarations.length > 0) {
      valueDeclaration = symbol.declarations[0];
    }
    if (valueDeclaration !== void 0 && ts5.isShorthandPropertyAssignment(valueDeclaration)) {
      const shorthandSymbol = this.checker.getShorthandAssignmentValueSymbol(valueDeclaration);
      if (shorthandSymbol === void 0) {
        return null;
      }
      return this.getDeclarationOfSymbol(shorthandSymbol, originalId);
    } else if (valueDeclaration !== void 0 && ts5.isExportSpecifier(valueDeclaration)) {
      const targetSymbol = this.checker.getExportSpecifierLocalTargetSymbol(valueDeclaration);
      if (targetSymbol === void 0) {
        return null;
      }
      return this.getDeclarationOfSymbol(targetSymbol, originalId);
    }
    const importInfo = originalId && this.getImportOfIdentifier(originalId);
    while (symbol.flags & ts5.SymbolFlags.Alias) {
      symbol = this.checker.getAliasedSymbol(symbol);
    }
    if (symbol.valueDeclaration !== void 0 && (!this.skipPrivateValueDeclarationTypes || !isPrivateSymbol(this.checker, symbol))) {
      return {
        node: symbol.valueDeclaration,
        viaModule: this._viaModule(symbol.valueDeclaration, originalId, importInfo)
      };
    } else if (symbol.declarations !== void 0 && symbol.declarations.length > 0) {
      return {
        node: symbol.declarations[0],
        viaModule: this._viaModule(symbol.declarations[0], originalId, importInfo)
      };
    } else {
      return null;
    }
  }
  _reflectDecorator(node) {
    let decoratorExpr = node.expression;
    let args = null;
    if (ts5.isCallExpression(decoratorExpr)) {
      args = Array.from(decoratorExpr.arguments);
      decoratorExpr = decoratorExpr.expression;
    }
    if (!isDecoratorIdentifier(decoratorExpr)) {
      return null;
    }
    const decoratorIdentifier = ts5.isIdentifier(decoratorExpr) ? decoratorExpr : decoratorExpr.name;
    const importDecl = this.getImportOfIdentifier(decoratorIdentifier);
    return {
      name: decoratorIdentifier.text,
      identifier: decoratorExpr,
      import: importDecl,
      node,
      args
    };
  }
  getLocalExportedDeclarationsOfSourceFile(file) {
    const cacheSf = file;
    if (cacheSf[LocalExportedDeclarations] !== void 0) {
      return cacheSf[LocalExportedDeclarations];
    }
    const exportSet = /* @__PURE__ */ new Set();
    cacheSf[LocalExportedDeclarations] = exportSet;
    const sfSymbol = this.checker.getSymbolAtLocation(cacheSf);
    if (sfSymbol === void 0 || sfSymbol.exports === void 0) {
      return exportSet;
    }
    const iter = sfSymbol.exports.values();
    let item = iter.next();
    while (item.done !== true) {
      let exportedSymbol = item.value;
      if (exportedSymbol.flags & ts5.SymbolFlags.Alias) {
        exportedSymbol = this.checker.getAliasedSymbol(exportedSymbol);
      }
      if (exportedSymbol.valueDeclaration !== void 0 && exportedSymbol.valueDeclaration.getSourceFile() === file) {
        exportSet.add(exportedSymbol.valueDeclaration);
      }
      item = iter.next();
    }
    return exportSet;
  }
  _viaModule(declaration, originalId, importInfo) {
    if (importInfo === null && originalId !== null && declaration.getSourceFile() !== originalId.getSourceFile()) {
      return AmbientImport;
    }
    return importInfo !== null && importInfo.from !== null && !importInfo.from.startsWith(".") ? importInfo.from : null;
  }
};
var TypeEntityToDeclarationError = class extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
function reflectTypeEntityToDeclaration(type, checker) {
  let realSymbol = checker.getSymbolAtLocation(type);
  if (realSymbol === void 0) {
    throw new TypeEntityToDeclarationError(`Cannot resolve type entity ${type.getText()} to symbol`);
  }
  while (realSymbol.flags & ts5.SymbolFlags.Alias) {
    realSymbol = checker.getAliasedSymbol(realSymbol);
  }
  let node = null;
  if (realSymbol.valueDeclaration !== void 0) {
    node = realSymbol.valueDeclaration;
  } else if (realSymbol.declarations !== void 0 && realSymbol.declarations.length === 1) {
    node = realSymbol.declarations[0];
  } else {
    throw new TypeEntityToDeclarationError(`Cannot resolve type entity symbol to declaration`);
  }
  if (ts5.isQualifiedName(type)) {
    if (!ts5.isIdentifier(type.left)) {
      throw new TypeEntityToDeclarationError(`Cannot handle qualified name with non-identifier lhs`);
    }
    const symbol = checker.getSymbolAtLocation(type.left);
    if (symbol === void 0 || symbol.declarations === void 0 || symbol.declarations.length !== 1) {
      throw new TypeEntityToDeclarationError(`Cannot resolve qualified type entity lhs to symbol`);
    }
    const decl = symbol.declarations[0];
    if (ts5.isNamespaceImport(decl)) {
      const clause = decl.parent;
      const importDecl = clause.parent;
      if (!ts5.isStringLiteral(importDecl.moduleSpecifier)) {
        throw new TypeEntityToDeclarationError(`Module specifier is not a string`);
      }
      return { node, from: importDecl.moduleSpecifier.text };
    } else if (ts5.isModuleDeclaration(decl)) {
      return { node, from: null };
    } else {
      throw new TypeEntityToDeclarationError(`Unknown import type?`);
    }
  } else {
    return { node, from: null };
  }
}
function filterToMembersWithDecorator(members, name, module) {
  return members.filter((member) => !member.isStatic).map((member) => {
    if (member.decorators === null) {
      return null;
    }
    const decorators = member.decorators.filter((dec) => {
      if (dec.import !== null) {
        return dec.import.name === name && (module === void 0 || dec.import.from === module);
      } else {
        return dec.name === name && module === void 0;
      }
    });
    if (decorators.length === 0) {
      return null;
    }
    return { member, decorators };
  }).filter((value) => value !== null);
}
function extractModifiersOfMember(node) {
  const modifiers = ts5.getModifiers(node);
  let isStatic = false;
  let isReadonly = false;
  let accessLevel = ClassMemberAccessLevel.PublicWritable;
  if (modifiers !== void 0) {
    for (const modifier of modifiers) {
      switch (modifier.kind) {
        case ts5.SyntaxKind.StaticKeyword:
          isStatic = true;
          break;
        case ts5.SyntaxKind.PrivateKeyword:
          accessLevel = ClassMemberAccessLevel.Private;
          break;
        case ts5.SyntaxKind.ProtectedKeyword:
          accessLevel = ClassMemberAccessLevel.Protected;
          break;
        case ts5.SyntaxKind.ReadonlyKeyword:
          isReadonly = true;
          break;
      }
    }
  }
  if (isReadonly && accessLevel === ClassMemberAccessLevel.PublicWritable) {
    accessLevel = ClassMemberAccessLevel.PublicReadonly;
  }
  if (node.name !== void 0 && ts5.isPrivateIdentifier(node.name)) {
    accessLevel = ClassMemberAccessLevel.EcmaScriptPrivate;
  }
  return { accessLevel, isStatic };
}
function reflectClassMember(node) {
  let kind = null;
  let value = null;
  let name = null;
  let nameNode = null;
  if (ts5.isPropertyDeclaration(node)) {
    kind = ClassMemberKind.Property;
    value = node.initializer || null;
  } else if (ts5.isGetAccessorDeclaration(node)) {
    kind = ClassMemberKind.Getter;
  } else if (ts5.isSetAccessorDeclaration(node)) {
    kind = ClassMemberKind.Setter;
  } else if (ts5.isMethodDeclaration(node)) {
    kind = ClassMemberKind.Method;
  } else if (ts5.isConstructorDeclaration(node)) {
    kind = ClassMemberKind.Constructor;
  } else {
    return null;
  }
  if (ts5.isConstructorDeclaration(node)) {
    name = "constructor";
  } else if (ts5.isIdentifier(node.name)) {
    name = node.name.text;
    nameNode = node.name;
  } else if (ts5.isStringLiteral(node.name)) {
    name = node.name.text;
    nameNode = node.name;
  } else if (ts5.isPrivateIdentifier(node.name)) {
    name = node.name.text;
    nameNode = node.name;
  } else {
    return null;
  }
  const { accessLevel, isStatic } = extractModifiersOfMember(node);
  return {
    node,
    implementation: node,
    kind,
    type: node.type || null,
    accessLevel,
    name,
    nameNode,
    value,
    isStatic
  };
}
function reflectObjectLiteral(node) {
  const map = /* @__PURE__ */ new Map();
  node.properties.forEach((prop) => {
    if (ts5.isPropertyAssignment(prop)) {
      const name = propertyNameToString(prop.name);
      if (name === null) {
        return;
      }
      map.set(name, prop.initializer);
    } else if (ts5.isShorthandPropertyAssignment(prop)) {
      map.set(prop.name.text, prop.name);
    } else {
      return;
    }
  });
  return map;
}
function castDeclarationToClassOrDie(declaration) {
  if (!ts5.isClassDeclaration(declaration)) {
    throw new Error(`Reflecting on a ${ts5.SyntaxKind[declaration.kind]} instead of a ClassDeclaration.`);
  }
  return declaration;
}
function parameterName(name) {
  if (ts5.isIdentifier(name)) {
    return name.text;
  } else {
    return null;
  }
}
function propertyNameToString(node) {
  if (ts5.isIdentifier(node) || ts5.isStringLiteral(node) || ts5.isNumericLiteral(node)) {
    return node.text;
  } else {
    return null;
  }
}
function isPrivateSymbol(typeChecker, symbol) {
  var _a;
  if (symbol.valueDeclaration !== void 0) {
    const symbolType = typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    return ((_a = symbolType == null ? void 0 : symbolType.symbol) == null ? void 0 : _a.name.startsWith("\u0275")) === true;
  }
  return false;
}
function getQualifiedNameRoot(qualifiedName) {
  while (ts5.isQualifiedName(qualifiedName.left)) {
    qualifiedName = qualifiedName.left;
  }
  return ts5.isIdentifier(qualifiedName.left) ? qualifiedName.left : null;
}
function getFarLeftIdentifier(propertyAccess) {
  while (ts5.isPropertyAccessExpression(propertyAccess.expression)) {
    propertyAccess = propertyAccess.expression;
  }
  return ts5.isIdentifier(propertyAccess.expression) ? propertyAccess.expression : null;
}
function getContainingImportDeclaration(node) {
  let parent = node.parent;
  while (parent && !ts5.isSourceFile(parent)) {
    if (ts5.isImportDeclaration(parent)) {
      return parent;
    }
    parent = parent.parent;
  }
  return null;
}
function getExportedName(decl, originalId) {
  return ts5.isImportSpecifier(decl) ? (decl.propertyName !== void 0 ? decl.propertyName : decl.name).text : originalId.text;
}
var LocalExportedDeclarations = Symbol("LocalExportedDeclarations");

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/util/src/typescript.mjs
import ts6 from "typescript";
var TS = /\.tsx?$/i;
var D_TS = /\.d\.ts$/i;
function isSymbolWithValueDeclaration(symbol) {
  return symbol != null && symbol.valueDeclaration !== void 0 && symbol.declarations !== void 0;
}
function isDtsPath(filePath) {
  return D_TS.test(filePath);
}
function isNonDeclarationTsPath(filePath) {
  return TS.test(filePath) && !D_TS.test(filePath);
}
function isFromDtsFile(node) {
  let sf = node.getSourceFile();
  if (sf === void 0) {
    sf = ts6.getOriginalNode(node).getSourceFile();
  }
  return sf !== void 0 && sf.isDeclarationFile;
}
function nodeNameForError(node) {
  if (node.name !== void 0 && ts6.isIdentifier(node.name)) {
    return node.name.text;
  } else {
    const kind = ts6.SyntaxKind[node.kind];
    const { line, character } = ts6.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    return `${kind}@${line}:${character}`;
  }
}
function getSourceFile(node) {
  const directSf = node.getSourceFile();
  return directSf !== void 0 ? directSf : ts6.getOriginalNode(node).getSourceFile();
}
function getSourceFileOrNull(program, fileName) {
  return program.getSourceFile(fileName) || null;
}
function getTokenAtPosition(sf, pos) {
  return ts6.getTokenAtPosition(sf, pos);
}
function identifierOfNode(decl) {
  if (decl.name !== void 0 && ts6.isIdentifier(decl.name)) {
    return decl.name;
  } else {
    return null;
  }
}
function isDeclaration(node) {
  return isValueDeclaration(node) || isTypeDeclaration(node);
}
function isValueDeclaration(node) {
  return ts6.isClassDeclaration(node) || ts6.isFunctionDeclaration(node) || ts6.isVariableDeclaration(node);
}
function isTypeDeclaration(node) {
  return ts6.isEnumDeclaration(node) || ts6.isTypeAliasDeclaration(node) || ts6.isInterfaceDeclaration(node);
}
function isNamedDeclaration(node) {
  const namedNode = node;
  return namedNode.name !== void 0 && ts6.isIdentifier(namedNode.name);
}
function getRootDirs(host, options) {
  const rootDirs = [];
  const cwd = host.getCurrentDirectory();
  const fs = getFileSystem();
  if (options.rootDirs !== void 0) {
    rootDirs.push(...options.rootDirs);
  } else if (options.rootDir !== void 0) {
    rootDirs.push(options.rootDir);
  } else {
    rootDirs.push(cwd);
  }
  return rootDirs.map((rootDir) => fs.resolve(cwd, host.getCanonicalFileName(rootDir)));
}
function nodeDebugInfo(node) {
  const sf = getSourceFile(node);
  const { line, character } = ts6.getLineAndCharacterOfPosition(sf, node.pos);
  return `[${sf.fileName}: ${ts6.SyntaxKind[node.kind]} @ ${line}:${character}]`;
}
function resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache) {
  if (compilerHost.resolveModuleNames) {
    return compilerHost.resolveModuleNames(
      [moduleName],
      containingFile,
      void 0,
      void 0,
      compilerOptions
    )[0];
  } else {
    return ts6.resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache !== null ? moduleResolutionCache : void 0).resolvedModule;
  }
}
function isAssignment(node) {
  return ts6.isBinaryExpression(node) && node.operatorToken.kind === ts6.SyntaxKind.EqualsToken;
}
function toUnredirectedSourceFile(sf) {
  const redirectInfo = sf.redirectInfo;
  if (redirectInfo === void 0) {
    return sf;
  }
  return redirectInfo.unredirected;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/references.mjs
var Reference = class {
  node;
  bestGuessOwningModule;
  identifiers = [];
  synthetic = false;
  _alias = null;
  isAmbient;
  constructor(node, bestGuessOwningModule = null) {
    this.node = node;
    if (bestGuessOwningModule === AmbientImport) {
      this.isAmbient = true;
      this.bestGuessOwningModule = null;
    } else {
      this.isAmbient = false;
      this.bestGuessOwningModule = bestGuessOwningModule;
    }
    const id = identifierOfNode(node);
    if (id !== null) {
      this.identifiers.push(id);
    }
  }
  get ownedByModuleGuess() {
    if (this.bestGuessOwningModule !== null) {
      return this.bestGuessOwningModule.specifier;
    } else {
      return null;
    }
  }
  get hasOwningModuleGuess() {
    return this.bestGuessOwningModule !== null;
  }
  get debugName() {
    const id = identifierOfNode(this.node);
    return id !== null ? id.text : null;
  }
  get alias() {
    return this._alias;
  }
  addIdentifier(identifier) {
    this.identifiers.push(identifier);
  }
  getIdentityIn(context) {
    return this.identifiers.find((id) => id.getSourceFile() === context) || null;
  }
  getIdentityInExpression(expr) {
    const sf = expr.getSourceFile();
    return this.identifiers.find((id) => {
      if (id.getSourceFile() !== sf) {
        return false;
      }
      return id.pos >= expr.pos && id.end <= expr.end;
    }) || null;
  }
  getOriginForDiagnostics(container, fallback = container) {
    const id = this.getIdentityInExpression(container);
    return id !== null ? id : fallback;
  }
  cloneWithAlias(alias) {
    const ref = new Reference(this.node, this.isAmbient ? AmbientImport : this.bestGuessOwningModule);
    ref.identifiers = [...this.identifiers];
    ref._alias = alias;
    return ref;
  }
  cloneWithNoIdentifiers() {
    const ref = new Reference(this.node, this.isAmbient ? AmbientImport : this.bestGuessOwningModule);
    ref._alias = this._alias;
    ref.identifiers = [];
    return ref;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/alias.mjs
import { ExternalExpr as ExternalExpr2 } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/emitter.mjs
import { ExternalExpr, ExternalReference, WrappedNodeExpr } from "@angular/compiler";
import ts7 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/find_export.mjs
function findExportedNameOfNode(target, file, reflector) {
  const exports = reflector.getExportsOfModule(file);
  if (exports === null) {
    return null;
  }
  const declaredName = isNamedDeclaration(target) ? target.name.text : null;
  let foundExportName = null;
  for (const [exportName, declaration] of exports) {
    if (declaration.node !== target) {
      continue;
    }
    if (exportName === declaredName) {
      return exportName;
    }
    foundExportName = exportName;
  }
  return foundExportName;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/emitter.mjs
var ImportFlags;
(function(ImportFlags2) {
  ImportFlags2[ImportFlags2["None"] = 0] = "None";
  ImportFlags2[ImportFlags2["ForceNewImport"] = 1] = "ForceNewImport";
  ImportFlags2[ImportFlags2["NoAliasing"] = 2] = "NoAliasing";
  ImportFlags2[ImportFlags2["AllowTypeImports"] = 4] = "AllowTypeImports";
  ImportFlags2[ImportFlags2["AllowRelativeDtsImports"] = 8] = "AllowRelativeDtsImports";
  ImportFlags2[ImportFlags2["AllowAmbientReferences"] = 16] = "AllowAmbientReferences";
})(ImportFlags || (ImportFlags = {}));
var ReferenceEmitKind;
(function(ReferenceEmitKind2) {
  ReferenceEmitKind2[ReferenceEmitKind2["Success"] = 0] = "Success";
  ReferenceEmitKind2[ReferenceEmitKind2["Failed"] = 1] = "Failed";
})(ReferenceEmitKind || (ReferenceEmitKind = {}));
function assertSuccessfulReferenceEmit(result, origin, typeKind) {
  if (result.kind === ReferenceEmitKind.Success) {
    return;
  }
  const message = makeDiagnosticChain(`Unable to import ${typeKind} ${nodeNameForError(result.ref.node)}.`, [makeDiagnosticChain(result.reason)]);
  throw new FatalDiagnosticError(ErrorCode.IMPORT_GENERATION_FAILURE, origin, message, [
    makeRelatedInformation(result.ref.node, `The ${typeKind} is declared here.`)
  ]);
}
var ReferenceEmitter = class {
  strategies;
  constructor(strategies) {
    this.strategies = strategies;
  }
  emit(ref, context, importFlags = ImportFlags.None) {
    for (const strategy of this.strategies) {
      const emitted = strategy.emit(ref, context, importFlags);
      if (emitted !== null) {
        return emitted;
      }
    }
    return {
      kind: ReferenceEmitKind.Failed,
      ref,
      context,
      reason: `Unable to write a reference to ${nodeNameForError(ref.node)}.`
    };
  }
};
var LocalIdentifierStrategy = class {
  emit(ref, context, importFlags) {
    const refSf = getSourceFile(ref.node);
    if (importFlags & ImportFlags.ForceNewImport && refSf !== context) {
      return null;
    }
    if (!isDeclaration(ref.node) && refSf === context) {
      return {
        kind: ReferenceEmitKind.Success,
        expression: new WrappedNodeExpr(ref.node),
        importedFile: null
      };
    }
    if (ref.isAmbient && importFlags & ImportFlags.AllowAmbientReferences) {
      const identifier2 = identifierOfNode(ref.node);
      if (identifier2 !== null) {
        return {
          kind: ReferenceEmitKind.Success,
          expression: new WrappedNodeExpr(identifier2),
          importedFile: null
        };
      } else {
        return null;
      }
    }
    const identifier = ref.getIdentityIn(context);
    if (identifier !== null) {
      return {
        kind: ReferenceEmitKind.Success,
        expression: new WrappedNodeExpr(identifier),
        importedFile: null
      };
    } else {
      return null;
    }
  }
};
var AbsoluteModuleStrategy = class {
  program;
  checker;
  moduleResolver;
  reflectionHost;
  moduleExportsCache = /* @__PURE__ */ new Map();
  constructor(program, checker, moduleResolver, reflectionHost) {
    this.program = program;
    this.checker = checker;
    this.moduleResolver = moduleResolver;
    this.reflectionHost = reflectionHost;
  }
  emit(ref, context, importFlags) {
    if (ref.bestGuessOwningModule === null) {
      return null;
    } else if (!isDeclaration(ref.node)) {
      throw new Error(`Debug assert: unable to import a Reference to non-declaration of type ${ts7.SyntaxKind[ref.node.kind]}.`);
    } else if ((importFlags & ImportFlags.AllowTypeImports) === 0 && isTypeDeclaration(ref.node)) {
      throw new Error(`Importing a type-only declaration of type ${ts7.SyntaxKind[ref.node.kind]} in a value position is not allowed.`);
    }
    const { specifier, resolutionContext } = ref.bestGuessOwningModule;
    const exports = this.getExportsOfModule(specifier, resolutionContext);
    if (exports.module === null) {
      return {
        kind: ReferenceEmitKind.Failed,
        ref,
        context,
        reason: `The module '${specifier}' could not be found.`
      };
    } else if (exports.exportMap === null || !exports.exportMap.has(ref.node)) {
      return {
        kind: ReferenceEmitKind.Failed,
        ref,
        context,
        reason: `The symbol is not exported from ${exports.module.fileName} (module '${specifier}').`
      };
    }
    const symbolName = exports.exportMap.get(ref.node);
    return {
      kind: ReferenceEmitKind.Success,
      expression: new ExternalExpr(new ExternalReference(specifier, symbolName)),
      importedFile: exports.module
    };
  }
  getExportsOfModule(moduleName, fromFile) {
    if (!this.moduleExportsCache.has(moduleName)) {
      this.moduleExportsCache.set(moduleName, this.enumerateExportsOfModule(moduleName, fromFile));
    }
    return this.moduleExportsCache.get(moduleName);
  }
  enumerateExportsOfModule(specifier, fromFile) {
    const entryPointFile = this.moduleResolver.resolveModule(specifier, fromFile);
    if (entryPointFile === null) {
      return { module: null, exportMap: null };
    }
    const exports = this.reflectionHost.getExportsOfModule(entryPointFile);
    if (exports === null) {
      return { module: entryPointFile, exportMap: null };
    }
    const exportMap = /* @__PURE__ */ new Map();
    for (const [name, declaration] of exports) {
      if (exportMap.has(declaration.node)) {
        const existingExport = exportMap.get(declaration.node);
        if (isNamedDeclaration(declaration.node) && declaration.node.name.text === existingExport) {
          continue;
        }
      }
      exportMap.set(declaration.node, name);
    }
    return { module: entryPointFile, exportMap };
  }
};
var LogicalProjectStrategy = class {
  reflector;
  logicalFs;
  relativePathStrategy;
  constructor(reflector, logicalFs) {
    this.reflector = reflector;
    this.logicalFs = logicalFs;
    this.relativePathStrategy = new RelativePathStrategy(this.reflector);
  }
  emit(ref, context, importFlags) {
    const destSf = getSourceFile(ref.node);
    const destPath = this.logicalFs.logicalPathOfSf(destSf);
    if (destPath === null) {
      if (destSf.isDeclarationFile && importFlags & ImportFlags.AllowRelativeDtsImports) {
        return this.relativePathStrategy.emit(ref, context);
      }
      return {
        kind: ReferenceEmitKind.Failed,
        ref,
        context,
        reason: `The file ${destSf.fileName} is outside of the configured 'rootDir'.`
      };
    }
    const originPath = this.logicalFs.logicalPathOfSf(context);
    if (originPath === null) {
      throw new Error(`Debug assert: attempt to import from ${context.fileName} but it's outside the program?`);
    }
    if (destPath === originPath) {
      return null;
    }
    const name = findExportedNameOfNode(ref.node, destSf, this.reflector);
    if (name === null) {
      return {
        kind: ReferenceEmitKind.Failed,
        ref,
        context,
        reason: `The symbol is not exported from ${destSf.fileName}.`
      };
    }
    const moduleName = LogicalProjectPath.relativePathBetween(originPath, destPath);
    return {
      kind: ReferenceEmitKind.Success,
      expression: new ExternalExpr({ moduleName, name }),
      importedFile: destSf
    };
  }
};
var RelativePathStrategy = class {
  reflector;
  constructor(reflector) {
    this.reflector = reflector;
  }
  emit(ref, context) {
    const destSf = getSourceFile(ref.node);
    const relativePath = relative(dirname(absoluteFromSourceFile(context)), absoluteFromSourceFile(destSf));
    const moduleName = toRelativeImport(stripExtension(relativePath));
    const name = findExportedNameOfNode(ref.node, destSf, this.reflector);
    if (name === null) {
      return {
        kind: ReferenceEmitKind.Failed,
        ref,
        context,
        reason: `The symbol is not exported from ${destSf.fileName}.`
      };
    }
    return {
      kind: ReferenceEmitKind.Success,
      expression: new ExternalExpr({ moduleName, name }),
      importedFile: destSf
    };
  }
};
var UnifiedModulesStrategy = class {
  reflector;
  unifiedModulesHost;
  constructor(reflector, unifiedModulesHost) {
    this.reflector = reflector;
    this.unifiedModulesHost = unifiedModulesHost;
  }
  emit(ref, context) {
    const destSf = getSourceFile(ref.node);
    const name = findExportedNameOfNode(ref.node, destSf, this.reflector);
    if (name === null) {
      return null;
    }
    const moduleName = this.unifiedModulesHost.fileNameToModuleName(destSf.fileName, context.fileName);
    return {
      kind: ReferenceEmitKind.Success,
      expression: new ExternalExpr({ moduleName, name }),
      importedFile: destSf
    };
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/alias.mjs
var CHARS_TO_ESCAPE = /[^a-zA-Z0-9/_]/g;
var UnifiedModulesAliasingHost = class {
  unifiedModulesHost;
  constructor(unifiedModulesHost) {
    this.unifiedModulesHost = unifiedModulesHost;
  }
  aliasExportsInDts = false;
  maybeAliasSymbolAs(ref, context, ngModuleName, isReExport) {
    if (!isReExport) {
      return null;
    }
    return this.aliasName(ref.node, context);
  }
  getAliasIn(decl, via, isReExport) {
    if (!isReExport) {
      return null;
    }
    const moduleName = this.unifiedModulesHost.fileNameToModuleName(via.fileName, via.fileName);
    return new ExternalExpr2({ moduleName, name: this.aliasName(decl, via) });
  }
  aliasName(decl, context) {
    const declModule = this.unifiedModulesHost.fileNameToModuleName(decl.getSourceFile().fileName, context.fileName);
    const replaced = declModule.replace(CHARS_TO_ESCAPE, "_").replace(/\//g, "$");
    return "\u0275ng$" + replaced + "$$" + decl.name.text;
  }
};
var PrivateExportAliasingHost = class {
  host;
  constructor(host) {
    this.host = host;
  }
  aliasExportsInDts = true;
  maybeAliasSymbolAs(ref, context, ngModuleName) {
    if (ref.hasOwningModuleGuess) {
      return null;
    }
    const exports = this.host.getExportsOfModule(context);
    if (exports === null) {
      throw new Error(`Could not determine the exports of: ${context.fileName}`);
    }
    let found = false;
    exports.forEach((value) => {
      if (value.node === ref.node) {
        found = true;
      }
    });
    if (found) {
      return null;
    }
    return `\u0275ngExport\u0275${ngModuleName}\u0275${ref.node.name.text}`;
  }
  getAliasIn() {
    return null;
  }
};
var AliasStrategy = class {
  emit(ref, context, importMode) {
    if (importMode & ImportFlags.NoAliasing || ref.alias === null) {
      return null;
    }
    return {
      kind: ReferenceEmitKind.Success,
      expression: ref.alias,
      importedFile: "unknown"
    };
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/util/src/path.mjs
function relativePathBetween(from, to) {
  const relativePath = stripExtension(relative(dirname(resolve(from)), resolve(to)));
  return relativePath !== "" ? toRelativeImport(relativePath) : null;
}
function normalizeSeparators(path) {
  return path.replace(/\\/g, "/");
}
function getProjectRelativePath(fileName, rootDirs, compilerHost) {
  const filePath = compilerHost.getCanonicalFileName(fileName);
  for (const rootDir of rootDirs) {
    const rel = relative(compilerHost.getCanonicalFileName(rootDir), filePath);
    if (!rel.startsWith("..")) {
      return rel;
    }
  }
  return null;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/core.mjs
var NoopImportRewriter = class {
  rewriteSymbol(symbol, specifier) {
    return symbol;
  }
  rewriteSpecifier(specifier, inContextOfFile) {
    return specifier;
  }
  rewriteNamespaceImportIdentifier(specifier) {
    return specifier;
  }
};
var CORE_SUPPORTED_SYMBOLS = /* @__PURE__ */ new Map([
  ["\u0275\u0275defineInjectable", "\u0275\u0275defineInjectable"],
  ["\u0275\u0275defineInjector", "\u0275\u0275defineInjector"],
  ["\u0275\u0275defineNgModule", "\u0275\u0275defineNgModule"],
  ["\u0275\u0275setNgModuleScope", "\u0275\u0275setNgModuleScope"],
  ["\u0275\u0275inject", "\u0275\u0275inject"],
  ["\u0275\u0275FactoryDeclaration", "\u0275\u0275FactoryDeclaration"],
  ["\u0275setClassMetadata", "setClassMetadata"],
  ["\u0275setClassMetadataAsync", "setClassMetadataAsync"],
  ["\u0275\u0275InjectableDeclaration", "\u0275\u0275InjectableDeclaration"],
  ["\u0275\u0275InjectorDeclaration", "\u0275\u0275InjectorDeclaration"],
  ["\u0275\u0275NgModuleDeclaration", "\u0275\u0275NgModuleDeclaration"],
  ["\u0275NgModuleFactory", "NgModuleFactory"],
  ["\u0275noSideEffects", "\u0275noSideEffects"]
]);
var CORE_MODULE = "@angular/core";
var R3SymbolsImportRewriter = class {
  r3SymbolsPath;
  constructor(r3SymbolsPath) {
    this.r3SymbolsPath = r3SymbolsPath;
  }
  rewriteSymbol(symbol, specifier) {
    if (specifier !== CORE_MODULE) {
      return symbol;
    }
    return validateAndRewriteCoreSymbol(symbol);
  }
  rewriteSpecifier(specifier, inContextOfFile) {
    if (specifier !== CORE_MODULE) {
      return specifier;
    }
    const relativePathToR3Symbols = relativePathBetween(inContextOfFile, this.r3SymbolsPath);
    if (relativePathToR3Symbols === null) {
      throw new Error(`Failed to rewrite import inside ${CORE_MODULE}: ${inContextOfFile} -> ${this.r3SymbolsPath}`);
    }
    return relativePathToR3Symbols;
  }
  rewriteNamespaceImportIdentifier(specifier) {
    return specifier;
  }
};
function validateAndRewriteCoreSymbol(name) {
  if (!CORE_SUPPORTED_SYMBOLS.has(name)) {
    throw new Error(`Importing unexpected symbol ${name} while compiling ${CORE_MODULE}`);
  }
  return CORE_SUPPORTED_SYMBOLS.get(name);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/patch_alias_reference_resolution.mjs
import ts8 from "typescript";
var patchedReferencedAliasesSymbol = Symbol("patchedReferencedAliases");
function loadIsReferencedAliasDeclarationPatch(context) {
  if (!isTransformationContextWithEmitResolver(context)) {
    throwIncompatibleTransformationContextError();
  }
  const emitResolver = context.getEmitResolver();
  if (emitResolver === void 0) {
    return null;
  }
  const existingReferencedAliases = emitResolver[patchedReferencedAliasesSymbol];
  if (existingReferencedAliases !== void 0) {
    return existingReferencedAliases;
  }
  const originalIsReferencedAliasDeclaration = emitResolver.isReferencedAliasDeclaration;
  if (originalIsReferencedAliasDeclaration === void 0) {
    throwIncompatibleTransformationContextError();
  }
  const referencedAliases = /* @__PURE__ */ new Set();
  emitResolver.isReferencedAliasDeclaration = function(node, ...args) {
    if (isAliasImportDeclaration(node) && referencedAliases.has(node)) {
      return true;
    }
    return originalIsReferencedAliasDeclaration.call(emitResolver, node, ...args);
  };
  return emitResolver[patchedReferencedAliasesSymbol] = referencedAliases;
}
function isAliasImportDeclaration(node) {
  return ts8.isImportSpecifier(node) || ts8.isNamespaceImport(node) || ts8.isImportClause(node);
}
function isTransformationContextWithEmitResolver(context) {
  return context.getEmitResolver !== void 0;
}
function throwIncompatibleTransformationContextError() {
  throw Error("Angular compiler is incompatible with this version of the TypeScript compiler.\n\nIf you recently updated TypeScript and this issue surfaces now, consider downgrading.\n\nPlease report an issue on the Angular repositories when this issue surfaces and you are using a supposedly compatible TypeScript version.");
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/default.mjs
var DefaultImportDeclaration = Symbol("DefaultImportDeclaration");
function attachDefaultImportDeclaration(expr, importDecl) {
  expr[DefaultImportDeclaration] = importDecl;
}
function getDefaultImportDeclaration(expr) {
  var _a;
  return (_a = expr[DefaultImportDeclaration]) != null ? _a : null;
}
var DefaultImportTracker = class {
  sourceFileToUsedImports = /* @__PURE__ */ new Map();
  recordUsedImport(importDecl) {
    if (importDecl.importClause) {
      const sf = getSourceFile(importDecl);
      if (!this.sourceFileToUsedImports.has(sf.fileName)) {
        this.sourceFileToUsedImports.set(sf.fileName, /* @__PURE__ */ new Set());
      }
      this.sourceFileToUsedImports.get(sf.fileName).add(importDecl.importClause);
    }
  }
  importPreservingTransformer() {
    return (context) => {
      let clausesToPreserve = null;
      return (sourceFile) => {
        const clausesForFile = this.sourceFileToUsedImports.get(sourceFile.fileName);
        if (clausesForFile !== void 0) {
          for (const clause of clausesForFile) {
            if (clausesToPreserve === null) {
              clausesToPreserve = loadIsReferencedAliasDeclarationPatch(context);
            }
            clausesToPreserve == null ? void 0 : clausesToPreserve.add(clause);
          }
        }
        return sourceFile;
      };
    };
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/deferred_symbol_tracker.mjs
import ts9 from "typescript";
var AssumeEager = "AssumeEager";
var DeferredSymbolTracker = class {
  typeChecker;
  onlyExplicitDeferDependencyImports;
  imports = /* @__PURE__ */ new Map();
  explicitlyDeferredImports = /* @__PURE__ */ new Map();
  constructor(typeChecker, onlyExplicitDeferDependencyImports) {
    this.typeChecker = typeChecker;
    this.onlyExplicitDeferDependencyImports = onlyExplicitDeferDependencyImports;
  }
  extractImportedSymbols(importDecl) {
    const symbolMap = /* @__PURE__ */ new Map();
    if (importDecl.importClause === void 0) {
      throw new Error(`Provided import declaration doesn't have any symbols.`);
    }
    if (importDecl.importClause.isTypeOnly) {
      return symbolMap;
    }
    if (importDecl.importClause.namedBindings !== void 0) {
      const bindings = importDecl.importClause.namedBindings;
      if (ts9.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          if (!element.isTypeOnly) {
            symbolMap.set(element.name.text, AssumeEager);
          }
        }
      } else {
        symbolMap.set(bindings.name.text, AssumeEager);
      }
    } else if (importDecl.importClause.name !== void 0) {
      symbolMap.set(importDecl.importClause.name.text, AssumeEager);
    } else {
      throw new Error("Unrecognized import structure.");
    }
    return symbolMap;
  }
  getNonRemovableDeferredImports(sourceFile, classDecl) {
    var _a;
    const affectedImports = [];
    const importDecls = (_a = this.explicitlyDeferredImports.get(classDecl)) != null ? _a : [];
    for (const importDecl of importDecls) {
      if (importDecl.getSourceFile() === sourceFile && !this.canDefer(importDecl)) {
        affectedImports.push(importDecl);
      }
    }
    return affectedImports;
  }
  markAsDeferrableCandidate(identifier, importDecl, componentClassDecl, isExplicitlyDeferred) {
    if (this.onlyExplicitDeferDependencyImports && !isExplicitlyDeferred) {
      return;
    }
    if (isExplicitlyDeferred) {
      if (this.explicitlyDeferredImports.has(componentClassDecl)) {
        this.explicitlyDeferredImports.get(componentClassDecl).push(importDecl);
      } else {
        this.explicitlyDeferredImports.set(componentClassDecl, [importDecl]);
      }
    }
    let symbolMap = this.imports.get(importDecl);
    if (!symbolMap) {
      symbolMap = this.extractImportedSymbols(importDecl);
      this.imports.set(importDecl, symbolMap);
    }
    if (!symbolMap.has(identifier.text)) {
      throw new Error(`The '${identifier.text}' identifier doesn't belong to the provided import declaration.`);
    }
    if (symbolMap.get(identifier.text) === AssumeEager) {
      symbolMap.set(identifier.text, this.lookupIdentifiersInSourceFile(identifier.text, importDecl));
    }
    const identifiers = symbolMap.get(identifier.text);
    identifiers.delete(identifier);
  }
  canDefer(importDecl) {
    if (!this.imports.has(importDecl)) {
      return false;
    }
    const symbolsMap = this.imports.get(importDecl);
    for (const refs of symbolsMap.values()) {
      if (refs === AssumeEager || refs.size > 0) {
        return false;
      }
    }
    return true;
  }
  getDeferrableImportDecls() {
    const deferrableDecls = /* @__PURE__ */ new Set();
    for (const [importDecl] of this.imports) {
      if (this.canDefer(importDecl)) {
        deferrableDecls.add(importDecl);
      }
    }
    return deferrableDecls;
  }
  lookupIdentifiersInSourceFile(name, importDecl) {
    const results = /* @__PURE__ */ new Set();
    const visit = (node) => {
      if (node === importDecl || ts9.isTypeNode(node)) {
        return;
      }
      if (ts9.isIdentifier(node) && node.text === name) {
        const sym = this.typeChecker.getSymbolAtLocation(node);
        if (sym === void 0) {
          return;
        }
        if (sym.declarations === void 0 || sym.declarations.length === 0) {
          return;
        }
        const importClause = sym.declarations[0];
        const decl = getContainingImportDeclaration(importClause);
        if (decl !== importDecl) {
          return;
        }
        results.add(node);
      }
      ts9.forEachChild(node, visit);
    };
    visit(importDecl.getSourceFile());
    return results;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/imported_symbols_tracker.mjs
import ts10 from "typescript";
var ImportedSymbolsTracker = class {
  fileToNamedImports = /* @__PURE__ */ new WeakMap();
  fileToNamespaceImports = /* @__PURE__ */ new WeakMap();
  isPotentialReferenceToNamedImport(node, exportedName, moduleName) {
    const sourceFile = node.getSourceFile();
    this.scanImports(sourceFile);
    const fileImports = this.fileToNamedImports.get(sourceFile);
    const moduleImports = fileImports.get(moduleName);
    const symbolImports = moduleImports == null ? void 0 : moduleImports.get(exportedName);
    return symbolImports !== void 0 && symbolImports.has(node.text);
  }
  isPotentialReferenceToNamespaceImport(node, moduleName) {
    var _a, _b;
    const sourceFile = node.getSourceFile();
    this.scanImports(sourceFile);
    const namespaces = this.fileToNamespaceImports.get(sourceFile);
    return (_b = (_a = namespaces.get(moduleName)) == null ? void 0 : _a.has(node.text)) != null ? _b : false;
  }
  hasNamedImport(sourceFile, exportedName, moduleName) {
    this.scanImports(sourceFile);
    const fileImports = this.fileToNamedImports.get(sourceFile);
    const moduleImports = fileImports.get(moduleName);
    return moduleImports !== void 0 && moduleImports.has(exportedName);
  }
  hasNamespaceImport(sourceFile, moduleName) {
    this.scanImports(sourceFile);
    const namespaces = this.fileToNamespaceImports.get(sourceFile);
    return namespaces.has(moduleName);
  }
  scanImports(sourceFile) {
    var _a, _b;
    if (this.fileToNamedImports.has(sourceFile) && this.fileToNamespaceImports.has(sourceFile)) {
      return;
    }
    const namedImports = /* @__PURE__ */ new Map();
    const namespaceImports = /* @__PURE__ */ new Map();
    this.fileToNamedImports.set(sourceFile, namedImports);
    this.fileToNamespaceImports.set(sourceFile, namespaceImports);
    for (const stmt of sourceFile.statements) {
      if (!ts10.isImportDeclaration(stmt) || !ts10.isStringLiteralLike(stmt.moduleSpecifier) || ((_a = stmt.importClause) == null ? void 0 : _a.namedBindings) === void 0) {
        continue;
      }
      const moduleName = stmt.moduleSpecifier.text;
      if (ts10.isNamespaceImport(stmt.importClause.namedBindings)) {
        if (!namespaceImports.has(moduleName)) {
          namespaceImports.set(moduleName, /* @__PURE__ */ new Set());
        }
        namespaceImports.get(moduleName).add(stmt.importClause.namedBindings.name.text);
      } else {
        for (const element of stmt.importClause.namedBindings.elements) {
          const localName = element.name.text;
          const exportedName = element.propertyName === void 0 ? localName : element.propertyName.text;
          if (!namedImports.has(moduleName)) {
            namedImports.set(moduleName, /* @__PURE__ */ new Map());
          }
          const localNames = namedImports.get(moduleName);
          if (!localNames.has(exportedName)) {
            localNames.set(exportedName, /* @__PURE__ */ new Set());
          }
          (_b = localNames.get(exportedName)) == null ? void 0 : _b.add(localName);
        }
      }
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/local_compilation_extra_imports_tracker.mjs
import ts11 from "typescript";
var LocalCompilationExtraImportsTracker = class {
  typeChecker;
  localImportsMap = /* @__PURE__ */ new Map();
  globalImportsSet = /* @__PURE__ */ new Set();
  markedFilesSet = /* @__PURE__ */ new Set();
  constructor(typeChecker) {
    this.typeChecker = typeChecker;
  }
  markFileForExtraImportGeneration(sf) {
    this.markedFilesSet.add(sf.fileName);
  }
  addImportForFile(sf, moduleName) {
    if (!this.localImportsMap.has(sf.fileName)) {
      this.localImportsMap.set(sf.fileName, /* @__PURE__ */ new Set());
    }
    this.localImportsMap.get(sf.fileName).add(moduleName);
  }
  addGlobalImportFromIdentifier(node) {
    var _a;
    let identifier = null;
    if (ts11.isIdentifier(node)) {
      identifier = node;
    } else if (ts11.isPropertyAccessExpression(node) && ts11.isIdentifier(node.expression)) {
      identifier = node.expression;
    }
    if (identifier === null) {
      return;
    }
    const sym = this.typeChecker.getSymbolAtLocation(identifier);
    if (!((_a = sym == null ? void 0 : sym.declarations) == null ? void 0 : _a.length)) {
      return;
    }
    const importClause = sym.declarations[0];
    const decl = getContainingImportDeclaration(importClause);
    if (decl !== null) {
      this.globalImportsSet.add(removeQuotations(decl.moduleSpecifier.getText()));
    }
  }
  getImportsForFile(sf) {
    var _a;
    if (!this.markedFilesSet.has(sf.fileName)) {
      return [];
    }
    return [...this.globalImportsSet, ...(_a = this.localImportsMap.get(sf.fileName)) != null ? _a : []];
  }
};
function removeQuotations(s) {
  return s.substring(1, s.length - 1).trim();
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/imports/src/resolver.mjs
var ModuleResolver = class {
  program;
  compilerOptions;
  host;
  moduleResolutionCache;
  constructor(program, compilerOptions, host, moduleResolutionCache) {
    this.program = program;
    this.compilerOptions = compilerOptions;
    this.host = host;
    this.moduleResolutionCache = moduleResolutionCache;
  }
  resolveModule(moduleName, containingFile) {
    const resolved = resolveModuleName(moduleName, containingFile, this.compilerOptions, this.host, this.moduleResolutionCache);
    if (resolved === void 0) {
      return null;
    }
    return getSourceFileOrNull(this.program, absoluteFrom(resolved.resolvedFileName));
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/import_manager/import_manager.mjs
import ts16 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/import_manager/check_unique_identifier_name.mjs
import ts12 from "typescript";
function createGenerateUniqueIdentifierHelper() {
  const generatedIdentifiers = /* @__PURE__ */ new Set();
  const isGeneratedIdentifier = (sf, identifierName) => generatedIdentifiers.has(`${sf.fileName}@@${identifierName}`);
  const markIdentifierAsGenerated = (sf, identifierName) => generatedIdentifiers.add(`${sf.fileName}@@${identifierName}`);
  return (sourceFile, symbolName) => {
    const sf = sourceFile;
    if (sf.identifiers === void 0) {
      throw new Error("Source file unexpectedly lacks map of parsed `identifiers`.");
    }
    const isUniqueIdentifier = (name2) => !sf.identifiers.has(name2) && !isGeneratedIdentifier(sf, name2);
    if (isUniqueIdentifier(symbolName)) {
      markIdentifierAsGenerated(sf, symbolName);
      return null;
    }
    let name = null;
    let counter = 1;
    do {
      name = `${symbolName}_${counter++}`;
    } while (!isUniqueIdentifier(name));
    markIdentifierAsGenerated(sf, name);
    return ts12.factory.createUniqueName(name, ts12.GeneratedIdentifierFlags.Optimistic);
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/import_manager/import_typescript_transform.mjs
import ts13 from "typescript";
function createTsTransformForImportManager(manager, extraStatementsForFiles) {
  return (ctx) => {
    const { affectedFiles, newImports, updatedImports, reusedOriginalAliasDeclarations, deletedImports } = manager.finalize();
    if (reusedOriginalAliasDeclarations.size > 0) {
      const referencedAliasDeclarations = loadIsReferencedAliasDeclarationPatch(ctx);
      if (referencedAliasDeclarations !== null) {
        reusedOriginalAliasDeclarations.forEach((aliasDecl) => referencedAliasDeclarations.add(aliasDecl));
      }
    }
    if (extraStatementsForFiles !== void 0) {
      for (const [fileName, statements] of extraStatementsForFiles.entries()) {
        if (statements.length > 0) {
          affectedFiles.add(fileName);
        }
      }
    }
    const visitStatement = (node) => {
      if (!ts13.isImportDeclaration(node)) {
        return node;
      }
      if (deletedImports.has(node)) {
        return void 0;
      }
      if (node.importClause === void 0 || !ts13.isImportClause(node.importClause)) {
        return node;
      }
      const clause = node.importClause;
      if (clause.namedBindings === void 0 || !ts13.isNamedImports(clause.namedBindings) || !updatedImports.has(clause.namedBindings)) {
        return node;
      }
      const newClause = ctx.factory.updateImportClause(clause, clause.isTypeOnly, clause.name, updatedImports.get(clause.namedBindings));
      const newImport = ctx.factory.updateImportDeclaration(node, node.modifiers, newClause, node.moduleSpecifier, node.attributes);
      ts13.setOriginalNode(newImport, {
        importClause: newClause,
        kind: newImport.kind
      });
      return newImport;
    };
    return (sourceFile) => {
      var _a, _b;
      if (!affectedFiles.has(sourceFile.fileName)) {
        return sourceFile;
      }
      sourceFile = ts13.visitEachChild(sourceFile, visitStatement, ctx);
      const extraStatements = (_a = extraStatementsForFiles == null ? void 0 : extraStatementsForFiles.get(sourceFile.fileName)) != null ? _a : [];
      const existingImports = [];
      const body = [];
      for (const statement of sourceFile.statements) {
        if (isImportStatement(statement)) {
          existingImports.push(statement);
        } else {
          body.push(statement);
        }
      }
      return ctx.factory.updateSourceFile(sourceFile, [
        ...existingImports,
        ...(_b = newImports.get(sourceFile.fileName)) != null ? _b : [],
        ...extraStatements,
        ...body
      ], sourceFile.isDeclarationFile, sourceFile.referencedFiles, sourceFile.typeReferenceDirectives, sourceFile.hasNoDefaultLib, sourceFile.libReferenceDirectives);
    };
  };
}
function isImportStatement(stmt) {
  return ts13.isImportDeclaration(stmt) || ts13.isImportEqualsDeclaration(stmt) || ts13.isNamespaceImport(stmt);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/import_manager/reuse_generated_imports.mjs
import ts14 from "typescript";
function attemptToReuseGeneratedImports(tracker, request) {
  const requestHash = hashImportRequest(request);
  const existingExactImport = tracker.directReuseCache.get(requestHash);
  if (existingExactImport !== void 0) {
    return existingExactImport;
  }
  const potentialNamespaceImport = tracker.namespaceImportReuseCache.get(request.exportModuleSpecifier);
  if (potentialNamespaceImport === void 0) {
    return null;
  }
  if (request.exportSymbolName === null) {
    return potentialNamespaceImport;
  }
  return [potentialNamespaceImport, ts14.factory.createIdentifier(request.exportSymbolName)];
}
function captureGeneratedImport(request, tracker, referenceNode) {
  tracker.directReuseCache.set(hashImportRequest(request), referenceNode);
  if (request.exportSymbolName === null && !Array.isArray(referenceNode)) {
    tracker.namespaceImportReuseCache.set(request.exportModuleSpecifier, referenceNode);
  }
}
function hashImportRequest(req) {
  return `${req.requestedFile.fileName}:${req.exportModuleSpecifier}:${req.exportSymbolName}${req.unsafeAliasOverride ? ":" + req.unsafeAliasOverride : ""}`;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/import_manager/reuse_source_file_imports.mjs
import ts15 from "typescript";
function attemptToReuseExistingSourceFileImports(tracker, sourceFile, request) {
  let candidateImportToBeUpdated = null;
  for (let i = sourceFile.statements.length - 1; i >= 0; i--) {
    const statement = sourceFile.statements[i];
    if (!ts15.isImportDeclaration(statement) || !ts15.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }
    if (!statement.importClause || statement.importClause.isTypeOnly) {
      continue;
    }
    const moduleSpecifier = statement.moduleSpecifier.text;
    if (moduleSpecifier !== request.exportModuleSpecifier) {
      continue;
    }
    if (statement.importClause.namedBindings) {
      const namedBindings = statement.importClause.namedBindings;
      if (ts15.isNamespaceImport(namedBindings)) {
        tracker.reusedAliasDeclarations.add(namedBindings);
        if (request.exportSymbolName === null) {
          return namedBindings.name;
        }
        return [namedBindings.name, ts15.factory.createIdentifier(request.exportSymbolName)];
      }
      if (ts15.isNamedImports(namedBindings) && request.exportSymbolName !== null) {
        const existingElement = namedBindings.elements.find((e) => {
          var _a;
          let nameMatches;
          if (request.unsafeAliasOverride) {
            nameMatches = ((_a = e.propertyName) == null ? void 0 : _a.text) === request.exportSymbolName && e.name.text === request.unsafeAliasOverride;
          } else {
            nameMatches = e.propertyName ? e.propertyName.text === request.exportSymbolName : e.name.text === request.exportSymbolName;
          }
          return !e.isTypeOnly && nameMatches;
        });
        if (existingElement !== void 0) {
          tracker.reusedAliasDeclarations.add(existingElement);
          return existingElement.name;
        }
        candidateImportToBeUpdated = statement;
      }
    }
  }
  if (candidateImportToBeUpdated === null || request.exportSymbolName === null) {
    return null;
  }
  if (!tracker.updatedImports.has(candidateImportToBeUpdated)) {
    tracker.updatedImports.set(candidateImportToBeUpdated, []);
  }
  const symbolsToBeImported = tracker.updatedImports.get(candidateImportToBeUpdated);
  const propertyName = ts15.factory.createIdentifier(request.exportSymbolName);
  const fileUniqueAlias = request.unsafeAliasOverride ? ts15.factory.createIdentifier(request.unsafeAliasOverride) : tracker.generateUniqueIdentifier(sourceFile, request.exportSymbolName);
  symbolsToBeImported.push({
    propertyName,
    fileUniqueAlias
  });
  return fileUniqueAlias != null ? fileUniqueAlias : propertyName;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/import_manager/import_manager.mjs
var presetImportManagerForceNamespaceImports = {
  disableOriginalSourceFileReuse: true,
  forceGenerateNamespacesForNewImports: true
};
var ImportManager = class {
  newImports = /* @__PURE__ */ new Map();
  removedImports = /* @__PURE__ */ new Map();
  nextUniqueIndex = 0;
  config;
  reuseSourceFileImportsTracker;
  reuseGeneratedImportsTracker = {
    directReuseCache: /* @__PURE__ */ new Map(),
    namespaceImportReuseCache: /* @__PURE__ */ new Map()
  };
  constructor(config = {}) {
    var _a, _b, _c, _d, _e, _f;
    this.config = {
      shouldUseSingleQuotes: (_a = config.shouldUseSingleQuotes) != null ? _a : () => false,
      rewriter: (_b = config.rewriter) != null ? _b : null,
      disableOriginalSourceFileReuse: (_c = config.disableOriginalSourceFileReuse) != null ? _c : false,
      forceGenerateNamespacesForNewImports: (_d = config.forceGenerateNamespacesForNewImports) != null ? _d : false,
      namespaceImportPrefix: (_e = config.namespaceImportPrefix) != null ? _e : "i",
      generateUniqueIdentifier: (_f = config.generateUniqueIdentifier) != null ? _f : createGenerateUniqueIdentifierHelper()
    };
    this.reuseSourceFileImportsTracker = {
      generateUniqueIdentifier: this.config.generateUniqueIdentifier,
      reusedAliasDeclarations: /* @__PURE__ */ new Set(),
      updatedImports: /* @__PURE__ */ new Map()
    };
  }
  addSideEffectImport(requestedFile, moduleSpecifier) {
    if (this.config.rewriter !== null) {
      moduleSpecifier = this.config.rewriter.rewriteSpecifier(moduleSpecifier, requestedFile.fileName);
    }
    this._getNewImportsTrackerForFile(requestedFile).sideEffectImports.add(moduleSpecifier);
  }
  addImport(request) {
    var _a, _b;
    if (this.config.rewriter !== null) {
      if (request.exportSymbolName !== null) {
        request.exportSymbolName = this.config.rewriter.rewriteSymbol(request.exportSymbolName, request.exportModuleSpecifier);
      }
      request.exportModuleSpecifier = this.config.rewriter.rewriteSpecifier(request.exportModuleSpecifier, request.requestedFile.fileName);
    }
    if (request.exportSymbolName !== null && !request.asTypeReference) {
      (_b = (_a = this.removedImports.get(request.requestedFile)) == null ? void 0 : _a.get(request.exportModuleSpecifier)) == null ? void 0 : _b.delete(request.exportSymbolName);
    }
    const previousGeneratedImportRef = attemptToReuseGeneratedImports(this.reuseGeneratedImportsTracker, request);
    if (previousGeneratedImportRef !== null) {
      return createImportReference(!!request.asTypeReference, previousGeneratedImportRef);
    }
    const resultImportRef = this._generateNewImport(request);
    captureGeneratedImport(request, this.reuseGeneratedImportsTracker, resultImportRef);
    return createImportReference(!!request.asTypeReference, resultImportRef);
  }
  removeImport(requestedFile, exportSymbolName, moduleSpecifier) {
    let moduleMap = this.removedImports.get(requestedFile);
    if (!moduleMap) {
      moduleMap = /* @__PURE__ */ new Map();
      this.removedImports.set(requestedFile, moduleMap);
    }
    let removedSymbols = moduleMap.get(moduleSpecifier);
    if (!removedSymbols) {
      removedSymbols = /* @__PURE__ */ new Set();
      moduleMap.set(moduleSpecifier, removedSymbols);
    }
    removedSymbols.add(exportSymbolName);
  }
  _generateNewImport(request) {
    var _a;
    const { requestedFile: sourceFile } = request;
    const disableOriginalSourceFileReuse = this.config.disableOriginalSourceFileReuse;
    const forceGenerateNamespacesForNewImports = this.config.forceGenerateNamespacesForNewImports;
    if (!disableOriginalSourceFileReuse) {
      const reuseResult = attemptToReuseExistingSourceFileImports(this.reuseSourceFileImportsTracker, sourceFile, request);
      if (reuseResult !== null) {
        return reuseResult;
      }
    }
    const { namedImports, namespaceImports } = this._getNewImportsTrackerForFile(sourceFile);
    if (request.exportSymbolName === null || forceGenerateNamespacesForNewImports) {
      let namespaceImportName = `${this.config.namespaceImportPrefix}${this.nextUniqueIndex++}`;
      if (this.config.rewriter) {
        namespaceImportName = this.config.rewriter.rewriteNamespaceImportIdentifier(namespaceImportName, request.exportModuleSpecifier);
      }
      const namespaceImport2 = ts16.factory.createNamespaceImport((_a = this.config.generateUniqueIdentifier(sourceFile, namespaceImportName)) != null ? _a : ts16.factory.createIdentifier(namespaceImportName));
      namespaceImports.set(request.exportModuleSpecifier, namespaceImport2);
      captureGeneratedImport({ ...request, exportSymbolName: null }, this.reuseGeneratedImportsTracker, namespaceImport2.name);
      if (request.exportSymbolName !== null) {
        return [namespaceImport2.name, ts16.factory.createIdentifier(request.exportSymbolName)];
      }
      return namespaceImport2.name;
    }
    if (!namedImports.has(request.exportModuleSpecifier)) {
      namedImports.set(request.exportModuleSpecifier, []);
    }
    const exportSymbolName = ts16.factory.createIdentifier(request.exportSymbolName);
    const fileUniqueName = request.unsafeAliasOverride ? null : this.config.generateUniqueIdentifier(sourceFile, request.exportSymbolName);
    let needsAlias;
    let specifierName;
    if (request.unsafeAliasOverride) {
      needsAlias = true;
      specifierName = ts16.factory.createIdentifier(request.unsafeAliasOverride);
    } else if (fileUniqueName !== null) {
      needsAlias = true;
      specifierName = fileUniqueName;
    } else {
      needsAlias = false;
      specifierName = exportSymbolName;
    }
    namedImports.get(request.exportModuleSpecifier).push(ts16.factory.createImportSpecifier(false, needsAlias ? exportSymbolName : void 0, specifierName));
    return specifierName;
  }
  finalize() {
    const affectedFiles = /* @__PURE__ */ new Set();
    const updatedImportsResult = /* @__PURE__ */ new Map();
    const newImportsResult = /* @__PURE__ */ new Map();
    const deletedImports = /* @__PURE__ */ new Set();
    const importDeclarationsPerFile = /* @__PURE__ */ new Map();
    const addNewImport = (fileName, importDecl) => {
      affectedFiles.add(fileName);
      if (newImportsResult.has(fileName)) {
        newImportsResult.get(fileName).push(importDecl);
      } else {
        newImportsResult.set(fileName, [importDecl]);
      }
    };
    this.reuseSourceFileImportsTracker.updatedImports.forEach((expressions, importDecl) => {
      const sourceFile = importDecl.getSourceFile();
      const namedBindings = importDecl.importClause.namedBindings;
      const moduleName = importDecl.moduleSpecifier.text;
      const newElements = namedBindings.elements.concat(expressions.map(({ propertyName, fileUniqueAlias }) => ts16.factory.createImportSpecifier(false, fileUniqueAlias !== null ? propertyName : void 0, fileUniqueAlias != null ? fileUniqueAlias : propertyName))).filter((specifier) => this._canAddSpecifier(sourceFile, moduleName, specifier));
      affectedFiles.add(sourceFile.fileName);
      if (newElements.length === 0) {
        deletedImports.add(importDecl);
      } else {
        updatedImportsResult.set(namedBindings, ts16.factory.updateNamedImports(namedBindings, newElements));
      }
    });
    this.removedImports.forEach((removeMap, sourceFile) => {
      var _a;
      if (removeMap.size === 0) {
        return;
      }
      let allImports = importDeclarationsPerFile.get(sourceFile);
      if (!allImports) {
        allImports = sourceFile.statements.filter(ts16.isImportDeclaration);
        importDeclarationsPerFile.set(sourceFile, allImports);
      }
      for (const node of allImports) {
        if (!((_a = node.importClause) == null ? void 0 : _a.namedBindings) || !ts16.isNamedImports(node.importClause.namedBindings) || this.reuseSourceFileImportsTracker.updatedImports.has(node) || deletedImports.has(node)) {
          continue;
        }
        const namedBindings = node.importClause.namedBindings;
        const moduleName = node.moduleSpecifier.text;
        const newImports = namedBindings.elements.filter((specifier) => this._canAddSpecifier(sourceFile, moduleName, specifier));
        if (newImports.length === 0) {
          affectedFiles.add(sourceFile.fileName);
          deletedImports.add(node);
        } else if (newImports.length !== namedBindings.elements.length) {
          affectedFiles.add(sourceFile.fileName);
          updatedImportsResult.set(namedBindings, ts16.factory.updateNamedImports(namedBindings, newImports));
        }
      }
    });
    this.newImports.forEach(({ namedImports, namespaceImports, sideEffectImports }, sourceFile) => {
      const useSingleQuotes = this.config.shouldUseSingleQuotes(sourceFile);
      const fileName = sourceFile.fileName;
      sideEffectImports.forEach((moduleName) => {
        addNewImport(fileName, ts16.factory.createImportDeclaration(void 0, void 0, ts16.factory.createStringLiteral(moduleName)));
      });
      namespaceImports.forEach((namespaceImport2, moduleName) => {
        const newImport = ts16.factory.createImportDeclaration(void 0, ts16.factory.createImportClause(false, void 0, namespaceImport2), ts16.factory.createStringLiteral(moduleName, useSingleQuotes));
        ts16.setOriginalNode(namespaceImport2.name, newImport);
        addNewImport(fileName, newImport);
      });
      namedImports.forEach((specifiers, moduleName) => {
        const filteredSpecifiers = specifiers.filter((specifier) => this._canAddSpecifier(sourceFile, moduleName, specifier));
        if (filteredSpecifiers.length > 0) {
          const newImport = ts16.factory.createImportDeclaration(void 0, ts16.factory.createImportClause(false, void 0, ts16.factory.createNamedImports(filteredSpecifiers)), ts16.factory.createStringLiteral(moduleName, useSingleQuotes));
          addNewImport(fileName, newImport);
        }
      });
    });
    return {
      affectedFiles,
      newImports: newImportsResult,
      updatedImports: updatedImportsResult,
      reusedOriginalAliasDeclarations: this.reuseSourceFileImportsTracker.reusedAliasDeclarations,
      deletedImports
    };
  }
  toTsTransform(extraStatementsMap) {
    return createTsTransformForImportManager(this, extraStatementsMap);
  }
  transformTsFile(ctx, file, extraStatementsAfterImports) {
    const extraStatementsMap = extraStatementsAfterImports ? /* @__PURE__ */ new Map([[file.fileName, extraStatementsAfterImports]]) : void 0;
    return this.toTsTransform(extraStatementsMap)(ctx)(file);
  }
  _getNewImportsTrackerForFile(file) {
    if (!this.newImports.has(file)) {
      this.newImports.set(file, {
        namespaceImports: /* @__PURE__ */ new Map(),
        namedImports: /* @__PURE__ */ new Map(),
        sideEffectImports: /* @__PURE__ */ new Set()
      });
    }
    return this.newImports.get(file);
  }
  _canAddSpecifier(sourceFile, moduleSpecifier, specifier) {
    var _a, _b;
    return !((_b = (_a = this.removedImports.get(sourceFile)) == null ? void 0 : _a.get(moduleSpecifier)) == null ? void 0 : _b.has((specifier.propertyName || specifier.name).text));
  }
};
function createImportReference(asTypeReference, ref) {
  if (asTypeReference) {
    return Array.isArray(ref) ? ts16.factory.createQualifiedName(ref[0], ref[1]) : ref;
  } else {
    return Array.isArray(ref) ? ts16.factory.createPropertyAccessExpression(ref[0], ref[1]) : ref;
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/context.mjs
var Context = class {
  isStatement;
  constructor(isStatement) {
    this.isStatement = isStatement;
  }
  get withExpressionMode() {
    return this.isStatement ? new Context(false) : this;
  }
  get withStatementMode() {
    return !this.isStatement ? new Context(true) : this;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/translator.mjs
import * as o from "@angular/compiler";
var UNARY_OPERATORS = /* @__PURE__ */ new Map([
  [o.UnaryOperator.Minus, "-"],
  [o.UnaryOperator.Plus, "+"]
]);
var BINARY_OPERATORS = /* @__PURE__ */ new Map([
  [o.BinaryOperator.And, "&&"],
  [o.BinaryOperator.Bigger, ">"],
  [o.BinaryOperator.BiggerEquals, ">="],
  [o.BinaryOperator.BitwiseAnd, "&"],
  [o.BinaryOperator.BitwiseOr, "|"],
  [o.BinaryOperator.Divide, "/"],
  [o.BinaryOperator.Equals, "=="],
  [o.BinaryOperator.Identical, "==="],
  [o.BinaryOperator.Lower, "<"],
  [o.BinaryOperator.LowerEquals, "<="],
  [o.BinaryOperator.Minus, "-"],
  [o.BinaryOperator.Modulo, "%"],
  [o.BinaryOperator.Multiply, "*"],
  [o.BinaryOperator.NotEquals, "!="],
  [o.BinaryOperator.NotIdentical, "!=="],
  [o.BinaryOperator.Or, "||"],
  [o.BinaryOperator.Plus, "+"],
  [o.BinaryOperator.NullishCoalesce, "??"]
]);
var ExpressionTranslatorVisitor = class {
  factory;
  imports;
  contextFile;
  downlevelTaggedTemplates;
  downlevelVariableDeclarations;
  recordWrappedNode;
  constructor(factory, imports, contextFile, options) {
    this.factory = factory;
    this.imports = imports;
    this.contextFile = contextFile;
    this.downlevelTaggedTemplates = options.downlevelTaggedTemplates === true;
    this.downlevelVariableDeclarations = options.downlevelVariableDeclarations === true;
    this.recordWrappedNode = options.recordWrappedNode || (() => {
    });
  }
  visitDeclareVarStmt(stmt, context) {
    var _a;
    const varType = this.downlevelVariableDeclarations ? "var" : stmt.hasModifier(o.StmtModifier.Final) ? "const" : "let";
    return this.attachComments(this.factory.createVariableDeclaration(stmt.name, (_a = stmt.value) == null ? void 0 : _a.visitExpression(this, context.withExpressionMode), varType), stmt.leadingComments);
  }
  visitDeclareFunctionStmt(stmt, context) {
    return this.attachComments(this.factory.createFunctionDeclaration(stmt.name, stmt.params.map((param) => param.name), this.factory.createBlock(this.visitStatements(stmt.statements, context.withStatementMode))), stmt.leadingComments);
  }
  visitExpressionStmt(stmt, context) {
    return this.attachComments(this.factory.createExpressionStatement(stmt.expr.visitExpression(this, context.withStatementMode)), stmt.leadingComments);
  }
  visitReturnStmt(stmt, context) {
    return this.attachComments(this.factory.createReturnStatement(stmt.value.visitExpression(this, context.withExpressionMode)), stmt.leadingComments);
  }
  visitIfStmt(stmt, context) {
    return this.attachComments(this.factory.createIfStatement(stmt.condition.visitExpression(this, context), this.factory.createBlock(this.visitStatements(stmt.trueCase, context.withStatementMode)), stmt.falseCase.length > 0 ? this.factory.createBlock(this.visitStatements(stmt.falseCase, context.withStatementMode)) : null), stmt.leadingComments);
  }
  visitReadVarExpr(ast, _context) {
    const identifier = this.factory.createIdentifier(ast.name);
    this.setSourceMapRange(identifier, ast.sourceSpan);
    return identifier;
  }
  visitWriteVarExpr(expr, context) {
    const assignment = this.factory.createAssignment(this.setSourceMapRange(this.factory.createIdentifier(expr.name), expr.sourceSpan), expr.value.visitExpression(this, context));
    return context.isStatement ? assignment : this.factory.createParenthesizedExpression(assignment);
  }
  visitWriteKeyExpr(expr, context) {
    const exprContext = context.withExpressionMode;
    const target = this.factory.createElementAccess(expr.receiver.visitExpression(this, exprContext), expr.index.visitExpression(this, exprContext));
    const assignment = this.factory.createAssignment(target, expr.value.visitExpression(this, exprContext));
    return context.isStatement ? assignment : this.factory.createParenthesizedExpression(assignment);
  }
  visitWritePropExpr(expr, context) {
    const target = this.factory.createPropertyAccess(expr.receiver.visitExpression(this, context), expr.name);
    return this.factory.createAssignment(target, expr.value.visitExpression(this, context));
  }
  visitInvokeFunctionExpr(ast, context) {
    return this.setSourceMapRange(this.factory.createCallExpression(ast.fn.visitExpression(this, context), ast.args.map((arg) => arg.visitExpression(this, context)), ast.pure), ast.sourceSpan);
  }
  visitTaggedTemplateExpr(ast, context) {
    return this.setSourceMapRange(this.createTaggedTemplateExpression(ast.tag.visitExpression(this, context), {
      elements: ast.template.elements.map((e) => {
        var _a;
        return createTemplateElement({
          cooked: e.text,
          raw: e.rawText,
          range: (_a = e.sourceSpan) != null ? _a : ast.sourceSpan
        });
      }),
      expressions: ast.template.expressions.map((e) => e.visitExpression(this, context))
    }), ast.sourceSpan);
  }
  visitInstantiateExpr(ast, context) {
    return this.factory.createNewExpression(ast.classExpr.visitExpression(this, context), ast.args.map((arg) => arg.visitExpression(this, context)));
  }
  visitLiteralExpr(ast, _context) {
    return this.setSourceMapRange(this.factory.createLiteral(ast.value), ast.sourceSpan);
  }
  visitLocalizedString(ast, context) {
    const elements = [createTemplateElement(ast.serializeI18nHead())];
    const expressions = [];
    for (let i = 0; i < ast.expressions.length; i++) {
      const placeholder = this.setSourceMapRange(ast.expressions[i].visitExpression(this, context), ast.getPlaceholderSourceSpan(i));
      expressions.push(placeholder);
      elements.push(createTemplateElement(ast.serializeI18nTemplatePart(i + 1)));
    }
    const localizeTag = this.factory.createIdentifier("$localize");
    return this.setSourceMapRange(this.createTaggedTemplateExpression(localizeTag, { elements, expressions }), ast.sourceSpan);
  }
  createTaggedTemplateExpression(tag, template) {
    return this.downlevelTaggedTemplates ? this.createES5TaggedTemplateFunctionCall(tag, template) : this.factory.createTaggedTemplate(tag, template);
  }
  createES5TaggedTemplateFunctionCall(tagHandler, { elements, expressions }) {
    const __makeTemplateObjectHelper = this.imports.addImport({
      exportModuleSpecifier: "tslib",
      exportSymbolName: "__makeTemplateObject",
      requestedFile: this.contextFile
    });
    const cooked = [];
    const raw = [];
    for (const element of elements) {
      cooked.push(this.factory.setSourceMapRange(this.factory.createLiteral(element.cooked), element.range));
      raw.push(this.factory.setSourceMapRange(this.factory.createLiteral(element.raw), element.range));
    }
    const templateHelperCall = this.factory.createCallExpression(
      __makeTemplateObjectHelper,
      [this.factory.createArrayLiteral(cooked), this.factory.createArrayLiteral(raw)],
      false
    );
    return this.factory.createCallExpression(
      tagHandler,
      [templateHelperCall, ...expressions],
      false
    );
  }
  visitExternalExpr(ast, _context) {
    if (ast.value.name === null) {
      if (ast.value.moduleName === null) {
        throw new Error("Invalid import without name nor moduleName");
      }
      return this.imports.addImport({
        exportModuleSpecifier: ast.value.moduleName,
        exportSymbolName: null,
        requestedFile: this.contextFile
      });
    }
    if (ast.value.moduleName !== null) {
      return this.imports.addImport({
        exportModuleSpecifier: ast.value.moduleName,
        exportSymbolName: ast.value.name,
        requestedFile: this.contextFile
      });
    } else {
      return this.factory.createIdentifier(ast.value.name);
    }
  }
  visitConditionalExpr(ast, context) {
    let cond = ast.condition.visitExpression(this, context);
    if (ast.condition instanceof o.ConditionalExpr) {
      cond = this.factory.createParenthesizedExpression(cond);
    }
    return this.factory.createConditional(cond, ast.trueCase.visitExpression(this, context), ast.falseCase.visitExpression(this, context));
  }
  visitDynamicImportExpr(ast, context) {
    const urlExpression = typeof ast.url === "string" ? this.factory.createLiteral(ast.url) : ast.url.visitExpression(this, context);
    if (ast.urlComment) {
      this.factory.attachComments(urlExpression, [o.leadingComment(ast.urlComment, true)]);
    }
    return this.factory.createDynamicImport(urlExpression);
  }
  visitNotExpr(ast, context) {
    return this.factory.createUnaryExpression("!", ast.condition.visitExpression(this, context));
  }
  visitFunctionExpr(ast, context) {
    var _a;
    return this.factory.createFunctionExpression((_a = ast.name) != null ? _a : null, ast.params.map((param) => param.name), this.factory.createBlock(this.visitStatements(ast.statements, context)));
  }
  visitArrowFunctionExpr(ast, context) {
    return this.factory.createArrowFunctionExpression(ast.params.map((param) => param.name), Array.isArray(ast.body) ? this.factory.createBlock(this.visitStatements(ast.body, context)) : ast.body.visitExpression(this, context));
  }
  visitBinaryOperatorExpr(ast, context) {
    if (!BINARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown binary operator: ${o.BinaryOperator[ast.operator]}`);
    }
    return this.factory.createBinaryExpression(ast.lhs.visitExpression(this, context), BINARY_OPERATORS.get(ast.operator), ast.rhs.visitExpression(this, context));
  }
  visitReadPropExpr(ast, context) {
    return this.factory.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
  }
  visitReadKeyExpr(ast, context) {
    return this.factory.createElementAccess(ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context));
  }
  visitLiteralArrayExpr(ast, context) {
    return this.factory.createArrayLiteral(ast.entries.map((expr) => this.setSourceMapRange(expr.visitExpression(this, context), ast.sourceSpan)));
  }
  visitLiteralMapExpr(ast, context) {
    const properties = ast.entries.map((entry) => {
      return {
        propertyName: entry.key,
        quoted: entry.quoted,
        value: entry.value.visitExpression(this, context)
      };
    });
    return this.setSourceMapRange(this.factory.createObjectLiteral(properties), ast.sourceSpan);
  }
  visitCommaExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitWrappedNodeExpr(ast, _context) {
    this.recordWrappedNode(ast);
    return ast.node;
  }
  visitTypeofExpr(ast, context) {
    return this.factory.createTypeOfExpression(ast.expr.visitExpression(this, context));
  }
  visitUnaryOperatorExpr(ast, context) {
    if (!UNARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown unary operator: ${o.UnaryOperator[ast.operator]}`);
    }
    return this.factory.createUnaryExpression(UNARY_OPERATORS.get(ast.operator), ast.expr.visitExpression(this, context));
  }
  visitStatements(statements, context) {
    return statements.map((stmt) => stmt.visitStatement(this, context)).filter((stmt) => stmt !== void 0);
  }
  setSourceMapRange(ast, span) {
    return this.factory.setSourceMapRange(ast, createRange(span));
  }
  attachComments(statement, leadingComments) {
    if (leadingComments !== void 0) {
      this.factory.attachComments(statement, leadingComments);
    }
    return statement;
  }
};
function createTemplateElement({ cooked, raw, range }) {
  return { cooked, raw, range: createRange(range) };
}
function createRange(span) {
  if (span === null) {
    return null;
  }
  const { start, end } = span;
  const { url, content } = start.file;
  if (!url) {
    return null;
  }
  return {
    url,
    content,
    start: { offset: start.offset, line: start.line, column: start.col },
    end: { offset: end.offset, line: end.line, column: end.col }
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/type_emitter.mjs
import ts17 from "typescript";
var INELIGIBLE = {};
function canEmitType(type, canEmit) {
  return canEmitTypeWorker(type);
  function canEmitTypeWorker(type2) {
    return visitNode(type2) !== INELIGIBLE;
  }
  function visitNode(node) {
    if (ts17.isImportTypeNode(node)) {
      return INELIGIBLE;
    }
    if (ts17.isTypeReferenceNode(node) && !canEmitTypeReference(node)) {
      return INELIGIBLE;
    } else {
      return ts17.forEachChild(node, visitNode);
    }
  }
  function canEmitTypeReference(type2) {
    if (!canEmit(type2)) {
      return false;
    }
    return type2.typeArguments === void 0 || type2.typeArguments.every(canEmitTypeWorker);
  }
}
var TypeEmitter = class {
  translator;
  constructor(translator) {
    this.translator = translator;
  }
  emitType(type) {
    const typeReferenceTransformer = (context) => {
      const visitNode = (node) => {
        if (ts17.isImportTypeNode(node)) {
          throw new Error("Unable to emit import type");
        }
        if (ts17.isTypeReferenceNode(node)) {
          return this.emitTypeReference(node);
        } else if (ts17.isLiteralExpression(node)) {
          let clone;
          if (ts17.isStringLiteral(node)) {
            clone = ts17.factory.createStringLiteral(node.text);
          } else if (ts17.isNumericLiteral(node)) {
            clone = ts17.factory.createNumericLiteral(node.text);
          } else if (ts17.isBigIntLiteral(node)) {
            clone = ts17.factory.createBigIntLiteral(node.text);
          } else if (ts17.isNoSubstitutionTemplateLiteral(node)) {
            clone = ts17.factory.createNoSubstitutionTemplateLiteral(node.text, node.rawText);
          } else if (ts17.isRegularExpressionLiteral(node)) {
            clone = ts17.factory.createRegularExpressionLiteral(node.text);
          } else {
            throw new Error(`Unsupported literal kind ${ts17.SyntaxKind[node.kind]}`);
          }
          ts17.setTextRange(clone, { pos: -1, end: -1 });
          return clone;
        } else {
          return ts17.visitEachChild(node, visitNode, context);
        }
      };
      return (node) => ts17.visitNode(node, visitNode, ts17.isTypeNode);
    };
    return ts17.transform(type, [typeReferenceTransformer]).transformed[0];
  }
  emitTypeReference(type) {
    const translatedType = this.translator(type);
    if (translatedType === null) {
      throw new Error("Unable to emit an unresolved reference");
    }
    let typeArguments = void 0;
    if (type.typeArguments !== void 0) {
      typeArguments = ts17.factory.createNodeArray(type.typeArguments.map((typeArg) => this.emitType(typeArg)));
    }
    return ts17.factory.updateTypeReferenceNode(type, translatedType.typeName, typeArguments);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/type_translator.mjs
import * as o2 from "@angular/compiler";
import ts19 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/ts_util.mjs
import ts18 from "typescript";
function tsNumericExpression(value) {
  if (value < 0) {
    const operand = ts18.factory.createNumericLiteral(Math.abs(value));
    return ts18.factory.createPrefixUnaryExpression(ts18.SyntaxKind.MinusToken, operand);
  }
  return ts18.factory.createNumericLiteral(value);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/type_translator.mjs
function translateType(type, contextFile, reflector, refEmitter, imports) {
  return type.visitType(new TypeTranslatorVisitor(imports, contextFile, reflector, refEmitter), new Context(false));
}
var TypeTranslatorVisitor = class {
  imports;
  contextFile;
  reflector;
  refEmitter;
  constructor(imports, contextFile, reflector, refEmitter) {
    this.imports = imports;
    this.contextFile = contextFile;
    this.reflector = reflector;
    this.refEmitter = refEmitter;
  }
  visitBuiltinType(type, context) {
    switch (type.name) {
      case o2.BuiltinTypeName.Bool:
        return ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.BooleanKeyword);
      case o2.BuiltinTypeName.Dynamic:
        return ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.AnyKeyword);
      case o2.BuiltinTypeName.Int:
      case o2.BuiltinTypeName.Number:
        return ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.NumberKeyword);
      case o2.BuiltinTypeName.String:
        return ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.StringKeyword);
      case o2.BuiltinTypeName.None:
        return ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.NeverKeyword);
      default:
        throw new Error(`Unsupported builtin type: ${o2.BuiltinTypeName[type.name]}`);
    }
  }
  visitExpressionType(type, context) {
    const typeNode = this.translateExpression(type.value, context);
    if (type.typeParams === null) {
      return typeNode;
    }
    if (!ts19.isTypeReferenceNode(typeNode)) {
      throw new Error("An ExpressionType with type arguments must translate into a TypeReferenceNode");
    } else if (typeNode.typeArguments !== void 0) {
      throw new Error(`An ExpressionType with type arguments cannot have multiple levels of type arguments`);
    }
    const typeArgs = type.typeParams.map((param) => this.translateType(param, context));
    return ts19.factory.createTypeReferenceNode(typeNode.typeName, typeArgs);
  }
  visitArrayType(type, context) {
    return ts19.factory.createArrayTypeNode(this.translateType(type.of, context));
  }
  visitMapType(type, context) {
    const parameter = ts19.factory.createParameterDeclaration(void 0, void 0, "key", void 0, ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.StringKeyword));
    const typeArgs = type.valueType !== null ? this.translateType(type.valueType, context) : ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.UnknownKeyword);
    const indexSignature = ts19.factory.createIndexSignature(void 0, [parameter], typeArgs);
    return ts19.factory.createTypeLiteralNode([indexSignature]);
  }
  visitTransplantedType(ast, context) {
    const node = ast.type instanceof Reference ? ast.type.node : ast.type;
    if (!ts19.isTypeNode(node)) {
      throw new Error(`A TransplantedType must wrap a TypeNode`);
    }
    const viaModule = ast.type instanceof Reference ? ast.type.bestGuessOwningModule : null;
    const emitter = new TypeEmitter((typeRef) => this.translateTypeReference(typeRef, context, viaModule));
    return emitter.emitType(node);
  }
  visitReadVarExpr(ast, context) {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ts19.factory.createTypeQueryNode(ts19.factory.createIdentifier(ast.name));
  }
  visitWriteVarExpr(expr, context) {
    throw new Error("Method not implemented.");
  }
  visitWriteKeyExpr(expr, context) {
    throw new Error("Method not implemented.");
  }
  visitWritePropExpr(expr, context) {
    throw new Error("Method not implemented.");
  }
  visitInvokeFunctionExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitTaggedTemplateExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitInstantiateExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitLiteralExpr(ast, context) {
    if (ast.value === null) {
      return ts19.factory.createLiteralTypeNode(ts19.factory.createNull());
    } else if (ast.value === void 0) {
      return ts19.factory.createKeywordTypeNode(ts19.SyntaxKind.UndefinedKeyword);
    } else if (typeof ast.value === "boolean") {
      return ts19.factory.createLiteralTypeNode(ast.value ? ts19.factory.createTrue() : ts19.factory.createFalse());
    } else if (typeof ast.value === "number") {
      return ts19.factory.createLiteralTypeNode(tsNumericExpression(ast.value));
    } else {
      return ts19.factory.createLiteralTypeNode(ts19.factory.createStringLiteral(ast.value));
    }
  }
  visitLocalizedString(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitExternalExpr(ast, context) {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol`);
    }
    const typeName = this.imports.addImport({
      exportModuleSpecifier: ast.value.moduleName,
      exportSymbolName: ast.value.name,
      requestedFile: this.contextFile,
      asTypeReference: true
    });
    const typeArguments = ast.typeParams !== null ? ast.typeParams.map((type) => this.translateType(type, context)) : void 0;
    return ts19.factory.createTypeReferenceNode(typeName, typeArguments);
  }
  visitConditionalExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitDynamicImportExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitNotExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitFunctionExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitArrowFunctionExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitUnaryOperatorExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitBinaryOperatorExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitReadPropExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitReadKeyExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitLiteralArrayExpr(ast, context) {
    const values = ast.entries.map((expr) => this.translateExpression(expr, context));
    return ts19.factory.createTupleTypeNode(values);
  }
  visitLiteralMapExpr(ast, context) {
    const entries = ast.entries.map((entry) => {
      const { key, quoted } = entry;
      const type = this.translateExpression(entry.value, context);
      return ts19.factory.createPropertySignature(
        void 0,
        quoted ? ts19.factory.createStringLiteral(key) : key,
        void 0,
        type
      );
    });
    return ts19.factory.createTypeLiteralNode(entries);
  }
  visitCommaExpr(ast, context) {
    throw new Error("Method not implemented.");
  }
  visitWrappedNodeExpr(ast, context) {
    const node = ast.node;
    if (ts19.isEntityName(node)) {
      return ts19.factory.createTypeReferenceNode(node, void 0);
    } else if (ts19.isTypeNode(node)) {
      return node;
    } else if (ts19.isLiteralExpression(node)) {
      return ts19.factory.createLiteralTypeNode(node);
    } else {
      throw new Error(`Unsupported WrappedNodeExpr in TypeTranslatorVisitor: ${ts19.SyntaxKind[node.kind]}`);
    }
  }
  visitTypeofExpr(ast, context) {
    const typeNode = this.translateExpression(ast.expr, context);
    if (!ts19.isTypeReferenceNode(typeNode)) {
      throw new Error(`The target of a typeof expression must be a type reference, but it was
          ${ts19.SyntaxKind[typeNode.kind]}`);
    }
    return ts19.factory.createTypeQueryNode(typeNode.typeName);
  }
  translateType(type, context) {
    const typeNode = type.visitType(this, context);
    if (!ts19.isTypeNode(typeNode)) {
      throw new Error(`A Type must translate to a TypeNode, but was ${ts19.SyntaxKind[typeNode.kind]}`);
    }
    return typeNode;
  }
  translateExpression(expr, context) {
    const typeNode = expr.visitExpression(this, context);
    if (!ts19.isTypeNode(typeNode)) {
      throw new Error(`An Expression must translate to a TypeNode, but was ${ts19.SyntaxKind[typeNode.kind]}`);
    }
    return typeNode;
  }
  translateTypeReference(type, context, viaModule) {
    const target = ts19.isIdentifier(type.typeName) ? type.typeName : type.typeName.right;
    const declaration = this.reflector.getDeclarationOfIdentifier(target);
    if (declaration === null) {
      throw new Error(`Unable to statically determine the declaration file of type node ${target.text}`);
    }
    let owningModule = viaModule;
    if (typeof declaration.viaModule === "string") {
      owningModule = {
        specifier: declaration.viaModule,
        resolutionContext: type.getSourceFile().fileName
      };
    }
    const reference = new Reference(declaration.node, declaration.viaModule === AmbientImport ? AmbientImport : owningModule);
    const emittedType = this.refEmitter.emit(reference, this.contextFile, ImportFlags.NoAliasing | ImportFlags.AllowTypeImports | ImportFlags.AllowAmbientReferences);
    assertSuccessfulReferenceEmit(emittedType, target, "type");
    const typeNode = this.translateExpression(emittedType.expression, context);
    if (!ts19.isTypeReferenceNode(typeNode)) {
      throw new Error(`Expected TypeReferenceNode for emitted reference, got ${ts19.SyntaxKind[typeNode.kind]}.`);
    }
    return typeNode;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/typescript_ast_factory.mjs
import ts20 from "typescript";
var PureAnnotation;
(function(PureAnnotation2) {
  PureAnnotation2["CLOSURE"] = "* @pureOrBreakMyCode ";
  PureAnnotation2["TERSER"] = "@__PURE__";
})(PureAnnotation || (PureAnnotation = {}));
var UNARY_OPERATORS2 = {
  "+": ts20.SyntaxKind.PlusToken,
  "-": ts20.SyntaxKind.MinusToken,
  "!": ts20.SyntaxKind.ExclamationToken
};
var BINARY_OPERATORS2 = {
  "&&": ts20.SyntaxKind.AmpersandAmpersandToken,
  ">": ts20.SyntaxKind.GreaterThanToken,
  ">=": ts20.SyntaxKind.GreaterThanEqualsToken,
  "&": ts20.SyntaxKind.AmpersandToken,
  "|": ts20.SyntaxKind.BarToken,
  "/": ts20.SyntaxKind.SlashToken,
  "==": ts20.SyntaxKind.EqualsEqualsToken,
  "===": ts20.SyntaxKind.EqualsEqualsEqualsToken,
  "<": ts20.SyntaxKind.LessThanToken,
  "<=": ts20.SyntaxKind.LessThanEqualsToken,
  "-": ts20.SyntaxKind.MinusToken,
  "%": ts20.SyntaxKind.PercentToken,
  "*": ts20.SyntaxKind.AsteriskToken,
  "!=": ts20.SyntaxKind.ExclamationEqualsToken,
  "!==": ts20.SyntaxKind.ExclamationEqualsEqualsToken,
  "||": ts20.SyntaxKind.BarBarToken,
  "+": ts20.SyntaxKind.PlusToken,
  "??": ts20.SyntaxKind.QuestionQuestionToken
};
var VAR_TYPES = {
  "const": ts20.NodeFlags.Const,
  "let": ts20.NodeFlags.Let,
  "var": ts20.NodeFlags.None
};
var TypeScriptAstFactory = class {
  annotateForClosureCompiler;
  externalSourceFiles = /* @__PURE__ */ new Map();
  constructor(annotateForClosureCompiler) {
    this.annotateForClosureCompiler = annotateForClosureCompiler;
  }
  attachComments = attachComments;
  createArrayLiteral = ts20.factory.createArrayLiteralExpression;
  createAssignment(target, value) {
    return ts20.factory.createBinaryExpression(target, ts20.SyntaxKind.EqualsToken, value);
  }
  createBinaryExpression(leftOperand, operator, rightOperand) {
    return ts20.factory.createBinaryExpression(leftOperand, BINARY_OPERATORS2[operator], rightOperand);
  }
  createBlock(body) {
    return ts20.factory.createBlock(body);
  }
  createCallExpression(callee, args, pure) {
    const call = ts20.factory.createCallExpression(callee, void 0, args);
    if (pure) {
      ts20.addSyntheticLeadingComment(
        call,
        ts20.SyntaxKind.MultiLineCommentTrivia,
        this.annotateForClosureCompiler ? PureAnnotation.CLOSURE : PureAnnotation.TERSER,
        false
      );
    }
    return call;
  }
  createConditional(condition, whenTrue, whenFalse) {
    return ts20.factory.createConditionalExpression(condition, void 0, whenTrue, void 0, whenFalse);
  }
  createElementAccess = ts20.factory.createElementAccessExpression;
  createExpressionStatement = ts20.factory.createExpressionStatement;
  createDynamicImport(url) {
    return ts20.factory.createCallExpression(
      ts20.factory.createToken(ts20.SyntaxKind.ImportKeyword),
      void 0,
      [typeof url === "string" ? ts20.factory.createStringLiteral(url) : url]
    );
  }
  createFunctionDeclaration(functionName, parameters, body) {
    if (!ts20.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts20.SyntaxKind[body.kind]}.`);
    }
    return ts20.factory.createFunctionDeclaration(void 0, void 0, functionName, void 0, parameters.map((param) => ts20.factory.createParameterDeclaration(void 0, void 0, param)), void 0, body);
  }
  createFunctionExpression(functionName, parameters, body) {
    if (!ts20.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts20.SyntaxKind[body.kind]}.`);
    }
    return ts20.factory.createFunctionExpression(void 0, void 0, functionName != null ? functionName : void 0, void 0, parameters.map((param) => ts20.factory.createParameterDeclaration(void 0, void 0, param)), void 0, body);
  }
  createArrowFunctionExpression(parameters, body) {
    if (ts20.isStatement(body) && !ts20.isBlock(body)) {
      throw new Error(`Invalid syntax, expected a block, but got ${ts20.SyntaxKind[body.kind]}.`);
    }
    return ts20.factory.createArrowFunction(void 0, void 0, parameters.map((param) => ts20.factory.createParameterDeclaration(void 0, void 0, param)), void 0, void 0, body);
  }
  createIdentifier = ts20.factory.createIdentifier;
  createIfStatement(condition, thenStatement, elseStatement) {
    return ts20.factory.createIfStatement(condition, thenStatement, elseStatement != null ? elseStatement : void 0);
  }
  createLiteral(value) {
    if (value === void 0) {
      return ts20.factory.createIdentifier("undefined");
    } else if (value === null) {
      return ts20.factory.createNull();
    } else if (typeof value === "boolean") {
      return value ? ts20.factory.createTrue() : ts20.factory.createFalse();
    } else if (typeof value === "number") {
      return tsNumericExpression(value);
    } else {
      return ts20.factory.createStringLiteral(value);
    }
  }
  createNewExpression(expression, args) {
    return ts20.factory.createNewExpression(expression, void 0, args);
  }
  createObjectLiteral(properties) {
    return ts20.factory.createObjectLiteralExpression(properties.map((prop) => ts20.factory.createPropertyAssignment(prop.quoted ? ts20.factory.createStringLiteral(prop.propertyName) : ts20.factory.createIdentifier(prop.propertyName), prop.value)));
  }
  createParenthesizedExpression = ts20.factory.createParenthesizedExpression;
  createPropertyAccess = ts20.factory.createPropertyAccessExpression;
  createReturnStatement(expression) {
    return ts20.factory.createReturnStatement(expression != null ? expression : void 0);
  }
  createTaggedTemplate(tag, template) {
    let templateLiteral;
    const length = template.elements.length;
    const head = template.elements[0];
    if (length === 1) {
      templateLiteral = ts20.factory.createNoSubstitutionTemplateLiteral(head.cooked, head.raw);
    } else {
      const spans = [];
      for (let i = 1; i < length - 1; i++) {
        const { cooked, raw, range } = template.elements[i];
        const middle = createTemplateMiddle(cooked, raw);
        if (range !== null) {
          this.setSourceMapRange(middle, range);
        }
        spans.push(ts20.factory.createTemplateSpan(template.expressions[i - 1], middle));
      }
      const resolvedExpression = template.expressions[length - 2];
      const templatePart = template.elements[length - 1];
      const templateTail = createTemplateTail(templatePart.cooked, templatePart.raw);
      if (templatePart.range !== null) {
        this.setSourceMapRange(templateTail, templatePart.range);
      }
      spans.push(ts20.factory.createTemplateSpan(resolvedExpression, templateTail));
      templateLiteral = ts20.factory.createTemplateExpression(ts20.factory.createTemplateHead(head.cooked, head.raw), spans);
    }
    if (head.range !== null) {
      this.setSourceMapRange(templateLiteral, head.range);
    }
    return ts20.factory.createTaggedTemplateExpression(tag, void 0, templateLiteral);
  }
  createThrowStatement = ts20.factory.createThrowStatement;
  createTypeOfExpression = ts20.factory.createTypeOfExpression;
  createUnaryExpression(operator, operand) {
    return ts20.factory.createPrefixUnaryExpression(UNARY_OPERATORS2[operator], operand);
  }
  createVariableDeclaration(variableName, initializer, type) {
    return ts20.factory.createVariableStatement(void 0, ts20.factory.createVariableDeclarationList([
      ts20.factory.createVariableDeclaration(variableName, void 0, void 0, initializer != null ? initializer : void 0)
    ], VAR_TYPES[type]));
  }
  setSourceMapRange(node, sourceMapRange) {
    if (sourceMapRange === null) {
      return node;
    }
    const url = sourceMapRange.url;
    if (!this.externalSourceFiles.has(url)) {
      this.externalSourceFiles.set(url, ts20.createSourceMapSource(url, sourceMapRange.content, (pos) => pos));
    }
    const source = this.externalSourceFiles.get(url);
    ts20.setSourceMapRange(node, {
      pos: sourceMapRange.start.offset,
      end: sourceMapRange.end.offset,
      source
    });
    return node;
  }
};
function createTemplateMiddle(cooked, raw) {
  const node = ts20.factory.createTemplateHead(cooked, raw);
  node.kind = ts20.SyntaxKind.TemplateMiddle;
  return node;
}
function createTemplateTail(cooked, raw) {
  const node = ts20.factory.createTemplateHead(cooked, raw);
  node.kind = ts20.SyntaxKind.TemplateTail;
  return node;
}
function attachComments(statement, leadingComments) {
  for (const comment of leadingComments) {
    const commentKind = comment.multiline ? ts20.SyntaxKind.MultiLineCommentTrivia : ts20.SyntaxKind.SingleLineCommentTrivia;
    if (comment.multiline) {
      ts20.addSyntheticLeadingComment(statement, commentKind, comment.toString(), comment.trailingNewline);
    } else {
      for (const line of comment.toString().split("\n")) {
        ts20.addSyntheticLeadingComment(statement, commentKind, line, comment.trailingNewline);
      }
    }
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/translator/src/typescript_translator.mjs
function translateExpression(contextFile, expression, imports, options = {}) {
  return expression.visitExpression(new ExpressionTranslatorVisitor(new TypeScriptAstFactory(options.annotateForClosureCompiler === true), imports, contextFile, options), new Context(false));
}
function translateStatement(contextFile, statement, imports, options = {}) {
  return statement.visitStatement(new ExpressionTranslatorVisitor(new TypeScriptAstFactory(options.annotateForClosureCompiler === true), imports, contextFile, options), new Context(true));
}

export {
  ErrorCode,
  COMPILER_ERRORS_WITH_GUIDES,
  replaceTsWithNgInErrors,
  ngErrorCode,
  FatalDiagnosticError,
  makeDiagnostic,
  makeDiagnosticChain,
  makeRelatedInformation,
  addDiagnosticChain,
  isFatalDiagnosticError,
  isLocalCompilationDiagnostics,
  ERROR_DETAILS_PAGE_BASE_URL,
  ExtendedTemplateDiagnosticName,
  isSymbolWithValueDeclaration,
  isDtsPath,
  isNonDeclarationTsPath,
  isFromDtsFile,
  nodeNameForError,
  getSourceFile,
  getSourceFileOrNull,
  getTokenAtPosition,
  identifierOfNode,
  isDeclaration,
  getRootDirs,
  nodeDebugInfo,
  isAssignment,
  toUnredirectedSourceFile,
  ImportFlags,
  ReferenceEmitKind,
  assertSuccessfulReferenceEmit,
  ReferenceEmitter,
  LocalIdentifierStrategy,
  AbsoluteModuleStrategy,
  LogicalProjectStrategy,
  RelativePathStrategy,
  UnifiedModulesStrategy,
  UnifiedModulesAliasingHost,
  PrivateExportAliasingHost,
  AliasStrategy,
  relativePathBetween,
  normalizeSeparators,
  getProjectRelativePath,
  NoopImportRewriter,
  R3SymbolsImportRewriter,
  loadIsReferencedAliasDeclarationPatch,
  isAliasImportDeclaration,
  attachDefaultImportDeclaration,
  getDefaultImportDeclaration,
  DefaultImportTracker,
  ClassMemberKind,
  ClassMemberAccessLevel,
  AmbientImport,
  typeNodeToValueExpr,
  entityNameToValue,
  isNamedClassDeclaration,
  classMemberAccessLevelToString,
  TypeScriptReflectionHost,
  TypeEntityToDeclarationError,
  reflectTypeEntityToDeclaration,
  filterToMembersWithDecorator,
  reflectClassMember,
  reflectObjectLiteral,
  DeferredSymbolTracker,
  ImportedSymbolsTracker,
  LocalCompilationExtraImportsTracker,
  Reference,
  ModuleResolver,
  Context,
  presetImportManagerForceNamespaceImports,
  ImportManager,
  ExpressionTranslatorVisitor,
  canEmitType,
  TypeEmitter,
  translateType,
  translateExpression,
  translateStatement
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
//# sourceMappingURL=chunk-RMJDBMCH.js.map
