
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  angularJitApplicationTransform
} from "./chunk-KJL3BXPI.js";
import {
  CompilationMode,
  ComponentDecoratorHandler,
  ComponentScopeKind,
  CompoundComponentScopeReader,
  CompoundMetadataReader,
  CompoundMetadataRegistry,
  DirectiveDecoratorHandler,
  DtsMetadataReader,
  DtsTransformRegistry,
  ExportedProviderStatusResolver,
  HostDirectivesResolver,
  INPUT_INITIALIZER_FN,
  InjectableClassRegistry,
  InjectableDecoratorHandler,
  JitDeclarationRegistry,
  LocalMetadataRegistry,
  LocalModuleScopeRegistry,
  MODEL_INITIALIZER_FN,
  MetaKind,
  MetadataDtsModuleScopeResolver,
  NgModuleDecoratorHandler,
  NgOriginalFile,
  NoopReferencesRegistry,
  OUTPUT_INITIALIZER_FNS,
  OptimizeFor,
  PartialEvaluator,
  PipeDecoratorHandler,
  QUERY_INITIALIZER_FNS,
  ResourceRegistry,
  SemanticDepGraphUpdater,
  ShimAdapter,
  ShimReferenceTagger,
  SymbolKind,
  TemplateTypeCheckerImpl,
  TraitCompiler,
  TsCreateProgramDriver,
  TypeCheckScopeRegistry,
  TypeCheckShimGenerator,
  aliasTransformFactory,
  declarationTransformFactory,
  isShim,
  ivyTransformFactory,
  retagAllTsFiles,
  tryParseInitializerApi,
  untagAllTsFiles
} from "./chunk-GEKWXKEG.js";
import {
  AbsoluteModuleStrategy,
  AliasStrategy,
  COMPILER_ERRORS_WITH_GUIDES,
  DefaultImportTracker,
  DeferredSymbolTracker,
  ERROR_DETAILS_PAGE_BASE_URL,
  ErrorCode,
  ExtendedTemplateDiagnosticName,
  ImportedSymbolsTracker,
  LocalCompilationExtraImportsTracker,
  LocalIdentifierStrategy,
  LogicalProjectStrategy,
  ModuleResolver,
  NoopImportRewriter,
  PrivateExportAliasingHost,
  R3SymbolsImportRewriter,
  Reference,
  ReferenceEmitter,
  RelativePathStrategy,
  TypeScriptReflectionHost,
  UnifiedModulesAliasingHost,
  UnifiedModulesStrategy,
  getRootDirs,
  getSourceFileOrNull,
  isDtsPath,
  isFatalDiagnosticError,
  isNamedClassDeclaration,
  isNonDeclarationTsPath,
  makeDiagnostic,
  ngErrorCode,
  normalizeSeparators,
  relativePathBetween,
  replaceTsWithNgInErrors,
  toUnredirectedSourceFile
} from "./chunk-RMJDBMCH.js";
import {
  ActivePerfRecorder,
  DelegatingPerfRecorder,
  PerfCheckpoint,
  PerfEvent,
  PerfPhase
} from "./chunk-Q2WE7ECN.js";
import {
  LogicalFileSystem,
  absoluteFrom,
  absoluteFromSourceFile,
  createFileSystemTsReadDirectoryFn,
  dirname,
  getFileSystem,
  join,
  resolve
} from "./chunk-37JMVF7H.js";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/transformers/api.mjs
var DEFAULT_ERROR_CODE = 100;
var UNKNOWN_ERROR_CODE = 500;
var SOURCE = "angular";
function isTsDiagnostic(diagnostic) {
  return diagnostic != null && diagnostic.source !== "angular";
}
var EmitFlags;
(function(EmitFlags2) {
  EmitFlags2[EmitFlags2["DTS"] = 1] = "DTS";
  EmitFlags2[EmitFlags2["JS"] = 2] = "JS";
  EmitFlags2[EmitFlags2["Metadata"] = 4] = "Metadata";
  EmitFlags2[EmitFlags2["I18nBundle"] = 8] = "I18nBundle";
  EmitFlags2[EmitFlags2["Codegen"] = 16] = "Codegen";
  EmitFlags2[EmitFlags2["Default"] = 19] = "Default";
  EmitFlags2[EmitFlags2["All"] = 31] = "All";
})(EmitFlags || (EmitFlags = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/transformers/compiler_host.mjs
import ts from "typescript";
var wrapHostForTest = null;
function createCompilerHost({ options, tsHost = ts.createCompilerHost(options, true) }) {
  if (wrapHostForTest !== null) {
    tsHost = wrapHostForTest(tsHost);
  }
  return tsHost;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/entities.mjs
var EntryType;
(function(EntryType2) {
  EntryType2["Block"] = "block";
  EntryType2["Component"] = "component";
  EntryType2["Constant"] = "constant";
  EntryType2["Decorator"] = "decorator";
  EntryType2["Directive"] = "directive";
  EntryType2["Element"] = "element";
  EntryType2["Enum"] = "enum";
  EntryType2["Function"] = "function";
  EntryType2["Interface"] = "interface";
  EntryType2["NgModule"] = "ng_module";
  EntryType2["Pipe"] = "pipe";
  EntryType2["TypeAlias"] = "type_alias";
  EntryType2["UndecoratedClass"] = "undecorated_class";
  EntryType2["InitializerApiFunction"] = "initializer_api_function";
})(EntryType || (EntryType = {}));
var MemberType;
(function(MemberType2) {
  MemberType2["Property"] = "property";
  MemberType2["Method"] = "method";
  MemberType2["Getter"] = "getter";
  MemberType2["Setter"] = "setter";
  MemberType2["EnumItem"] = "enum_item";
})(MemberType || (MemberType = {}));
var DecoratorType;
(function(DecoratorType2) {
  DecoratorType2["Class"] = "class";
  DecoratorType2["Member"] = "member";
  DecoratorType2["Parameter"] = "parameter";
})(DecoratorType || (DecoratorType = {}));
var MemberTags;
(function(MemberTags2) {
  MemberTags2["Abstract"] = "abstract";
  MemberTags2["Static"] = "static";
  MemberTags2["Readonly"] = "readonly";
  MemberTags2["Protected"] = "protected";
  MemberTags2["Optional"] = "optional";
  MemberTags2["Input"] = "input";
  MemberTags2["Output"] = "output";
  MemberTags2["Inherited"] = "override";
})(MemberTags || (MemberTags = {}));
function isDocEntryWithSourceInfo(entry) {
  return "source" in entry;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/extractor.mjs
import ts11 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/class_extractor.mjs
import ts5 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/filters.mjs
function isAngularPrivateName(name) {
  var _a;
  const firstChar = (_a = name[0]) != null ? _a : "";
  return firstChar === "\u0275" || firstChar === "_";
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/function_extractor.mjs
import ts3 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/generics_extractor.mjs
function extractGenerics(declaration) {
  var _a, _b;
  return (_b = (_a = declaration.typeParameters) == null ? void 0 : _a.map((typeParam) => {
    var _a2, _b2;
    return {
      name: typeParam.name.getText(),
      constraint: (_a2 = typeParam.constraint) == null ? void 0 : _a2.getText(),
      default: (_b2 = typeParam.default) == null ? void 0 : _b2.getText()
    };
  })) != null ? _b : [];
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/jsdoc_extractor.mjs
import ts2 from "typescript";
var decoratorExpression = /@(?=(Injectable|Component|Directive|Pipe|NgModule|Input|Output|HostBinding|HostListener|Inject|Optional|Self|Host|SkipSelf|ViewChild|ViewChildren|ContentChild|ContentChildren))/g;
function extractJsDocTags(node) {
  const escapedNode = getEscapedNode(node);
  return ts2.getJSDocTags(escapedNode).map((t) => {
    var _a;
    return {
      name: t.tagName.getText(),
      comment: unescapeAngularDecorators((_a = ts2.getTextOfJSDocComment(t.comment)) != null ? _a : "")
    };
  });
}
function extractJsDocDescription(node) {
  var _a, _b;
  const escapedNode = getEscapedNode(node);
  const commentOrTag = ts2.getJSDocCommentsAndTags(escapedNode).find((d) => {
    return ts2.isJSDoc(d) || ts2.isJSDocParameterTag(d);
  });
  const comment = (_a = commentOrTag == null ? void 0 : commentOrTag.comment) != null ? _a : "";
  const description = typeof comment === "string" ? comment : (_b = ts2.getTextOfJSDocComment(comment)) != null ? _b : "";
  return unescapeAngularDecorators(description);
}
function extractRawJsDoc(node) {
  var _a, _b;
  const comment = (_b = (_a = ts2.getJSDocCommentsAndTags(node).find(ts2.isJSDoc)) == null ? void 0 : _a.getFullText()) != null ? _b : "";
  return unescapeAngularDecorators(comment);
}
function getEscapedNode(node) {
  if (ts2.isParameter(node)) {
    return node;
  }
  const rawComment = extractRawJsDoc(node);
  const escaped = escapeAngularDecorators(rawComment);
  const file = ts2.createSourceFile("x.ts", `${escaped}class X {}`, ts2.ScriptTarget.ES2020, true);
  return file.statements.find((s) => ts2.isClassDeclaration(s));
}
function escapeAngularDecorators(comment) {
  return comment.replace(decoratorExpression, "_NG_AT_");
}
function unescapeAngularDecorators(comment) {
  return comment.replace(/_NG_AT_/g, "@");
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/type_extractor.mjs
function extractResolvedTypeString(node, checker) {
  return checker.typeToString(checker.getTypeAtLocation(node));
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/function_extractor.mjs
var FunctionExtractor = class {
  name;
  exportDeclaration;
  typeChecker;
  constructor(name, exportDeclaration, typeChecker) {
    this.name = name;
    this.exportDeclaration = exportDeclaration;
    this.typeChecker = typeChecker;
  }
  extract() {
    var _a, _b;
    const signature = this.typeChecker.getSignatureFromDeclaration(this.exportDeclaration);
    const returnType = signature ? this.typeChecker.typeToString(
      this.typeChecker.getReturnTypeOfSignature(signature),
      void 0,
      ts3.TypeFormatFlags.NoTypeReduction | ts3.TypeFormatFlags.NoTruncation
    ) : "unknown";
    const implementation = (_a = findImplementationOfFunction(this.exportDeclaration, this.typeChecker)) != null ? _a : this.exportDeclaration;
    const type = this.typeChecker.getTypeAtLocation(this.exportDeclaration);
    const overloads = extractCallSignatures(this.name, this.typeChecker, type);
    const jsdocsTags = extractJsDocTags(implementation);
    const description = extractJsDocDescription(implementation);
    return {
      name: this.name,
      signatures: overloads,
      implementation: {
        params: extractAllParams(implementation.parameters, this.typeChecker),
        isNewType: ts3.isConstructSignatureDeclaration(implementation),
        returnType,
        returnDescription: (_b = jsdocsTags.find((tag) => tag.name === "returns")) == null ? void 0 : _b.comment,
        generics: extractGenerics(implementation),
        name: this.name,
        description,
        entryType: EntryType.Function,
        jsdocTags: jsdocsTags,
        rawComment: extractRawJsDoc(implementation)
      },
      entryType: EntryType.Function,
      description,
      jsdocTags: jsdocsTags,
      rawComment: extractRawJsDoc(implementation)
    };
  }
};
function extractAllParams(params, typeChecker) {
  return params.map((param) => ({
    name: param.name.getText(),
    description: extractJsDocDescription(param),
    type: extractResolvedTypeString(param, typeChecker),
    isOptional: !!(param.questionToken || param.initializer),
    isRestParam: !!param.dotDotDotToken
  }));
}
function filterSignatureDeclarations(signatures) {
  const result = [];
  for (const signature of signatures) {
    const decl = signature.getDeclaration();
    if (ts3.isFunctionDeclaration(decl) || ts3.isCallSignatureDeclaration(decl) || ts3.isMethodDeclaration(decl)) {
      result.push({ signature, decl });
    }
  }
  return result;
}
function extractCallSignatures(name, typeChecker, type) {
  return filterSignatureDeclarations(type.getCallSignatures()).map(({ decl, signature }) => ({
    name,
    entryType: EntryType.Function,
    description: extractJsDocDescription(decl),
    generics: extractGenerics(decl),
    isNewType: false,
    jsdocTags: extractJsDocTags(decl),
    params: extractAllParams(decl.parameters, typeChecker),
    rawComment: extractRawJsDoc(decl),
    returnType: typeChecker.typeToString(
      typeChecker.getReturnTypeOfSignature(signature),
      void 0,
      ts3.TypeFormatFlags.NoTypeReduction | ts3.TypeFormatFlags.NoTruncation
    )
  }));
}
function findImplementationOfFunction(node, typeChecker) {
  var _a;
  if (node.body !== void 0 || node.name === void 0) {
    return node;
  }
  const symbol = typeChecker.getSymbolAtLocation(node.name);
  const implementation = (_a = symbol == null ? void 0 : symbol.declarations) == null ? void 0 : _a.find((s) => ts3.isFunctionDeclaration(s) && s.body !== void 0);
  return implementation;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/internal.mjs
import ts4 from "typescript";
function isInternal(member) {
  return extractJsDocTags(member).some((tag) => tag.name === "internal") || hasLeadingInternalComment(member);
}
function hasLeadingInternalComment(member) {
  var _a;
  const memberText = member.getSourceFile().text;
  return (_a = ts4.reduceEachLeadingCommentRange(
    memberText,
    member.getFullStart(),
    (pos, end, kind, hasTrailingNewLine, containsInternal) => {
      return containsInternal || memberText.slice(pos, end).includes("@internal");
    },
    false,
    false
  )) != null ? _a : false;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/class_extractor.mjs
var ClassExtractor = class {
  declaration;
  typeChecker;
  constructor(declaration, typeChecker) {
    this.declaration = declaration;
    this.typeChecker = typeChecker;
  }
  extract() {
    return {
      name: this.declaration.name.text,
      isAbstract: this.isAbstract(),
      entryType: ts5.isInterfaceDeclaration(this.declaration) ? EntryType.Interface : EntryType.UndecoratedClass,
      members: this.extractSignatures().concat(this.extractAllClassMembers()),
      generics: extractGenerics(this.declaration),
      description: extractJsDocDescription(this.declaration),
      jsdocTags: extractJsDocTags(this.declaration),
      rawComment: extractRawJsDoc(this.declaration),
      extends: this.extractInheritance(this.declaration),
      implements: this.extractInterfaceConformance(this.declaration)
    };
  }
  extractAllClassMembers() {
    const members = [];
    for (const member of this.getMemberDeclarations()) {
      if (this.isMemberExcluded(member))
        continue;
      const memberEntry = this.extractClassMember(member);
      if (memberEntry) {
        members.push(memberEntry);
      }
    }
    return members;
  }
  extractClassMember(memberDeclaration) {
    if (this.isMethod(memberDeclaration)) {
      return this.extractMethod(memberDeclaration);
    } else if (this.isProperty(memberDeclaration) && !this.hasPrivateComputedProperty(memberDeclaration)) {
      return this.extractClassProperty(memberDeclaration);
    } else if (ts5.isAccessor(memberDeclaration)) {
      return this.extractGetterSetter(memberDeclaration);
    }
    return void 0;
  }
  extractSignatures() {
    return this.computeAllSignatureDeclarations().map((s) => this.extractSignature(s));
  }
  extractMethod(methodDeclaration) {
    const functionExtractor = new FunctionExtractor(methodDeclaration.name.getText(), methodDeclaration, this.typeChecker);
    return {
      ...functionExtractor.extract(),
      memberType: MemberType.Method,
      memberTags: this.getMemberTags(methodDeclaration)
    };
  }
  extractSignature(signature) {
    const functionExtractor = new FunctionExtractor(ts5.isConstructSignatureDeclaration(signature) ? "new" : "", signature, this.typeChecker);
    return {
      ...functionExtractor.extract(),
      memberType: MemberType.Method,
      memberTags: []
    };
  }
  extractClassProperty(propertyDeclaration) {
    return {
      name: propertyDeclaration.name.getText(),
      type: extractResolvedTypeString(propertyDeclaration, this.typeChecker),
      memberType: MemberType.Property,
      memberTags: this.getMemberTags(propertyDeclaration),
      description: extractJsDocDescription(propertyDeclaration),
      jsdocTags: extractJsDocTags(propertyDeclaration)
    };
  }
  extractGetterSetter(accessor) {
    return {
      ...this.extractClassProperty(accessor),
      memberType: ts5.isGetAccessor(accessor) ? MemberType.Getter : MemberType.Setter
    };
  }
  extractInheritance(declaration) {
    if (!declaration.heritageClauses) {
      return void 0;
    }
    for (const clause of declaration.heritageClauses) {
      if (clause.token === ts5.SyntaxKind.ExtendsKeyword) {
        const types = clause.types;
        if (types.length > 0) {
          const baseClass = types[0];
          return baseClass.getText();
        }
      }
    }
    return void 0;
  }
  extractInterfaceConformance(declaration) {
    var _a, _b;
    const implementClause = (_a = declaration.heritageClauses) == null ? void 0 : _a.find((clause) => clause.token === ts5.SyntaxKind.ImplementsKeyword);
    return (_b = implementClause == null ? void 0 : implementClause.types.map((m) => m.getText())) != null ? _b : [];
  }
  getMemberTags(member) {
    var _a;
    const tags = this.getMemberTagsFromModifiers((_a = member.modifiers) != null ? _a : []);
    if (member.questionToken) {
      tags.push(MemberTags.Optional);
    }
    if (member.parent !== this.declaration) {
      tags.push(MemberTags.Inherited);
    }
    return tags;
  }
  computeAllSignatureDeclarations() {
    const type = this.typeChecker.getTypeAtLocation(this.declaration);
    const signatures = [...type.getCallSignatures(), ...type.getConstructSignatures()];
    const result = [];
    for (const signature of signatures) {
      const decl = signature.getDeclaration();
      if (this.isDocumentableSignature(decl) && this.isDocumentableMember(decl)) {
        result.push(decl);
      }
    }
    return result;
  }
  getMemberDeclarations() {
    var _a;
    const type = this.typeChecker.getTypeAtLocation(this.declaration);
    const members = type.getProperties();
    const typeOfConstructor = this.typeChecker.getTypeOfSymbol(type.symbol);
    const staticMembers = typeOfConstructor.getProperties();
    const result = [];
    for (const member of [...members, ...staticMembers]) {
      const memberDeclarations = this.filterMethodOverloads((_a = member.getDeclarations()) != null ? _a : []);
      for (const memberDeclaration of memberDeclarations) {
        if (this.isDocumentableMember(memberDeclaration)) {
          result.push(memberDeclaration);
        }
      }
    }
    return result;
  }
  filterMethodOverloads(declarations) {
    return declarations.filter((declaration, index) => {
      var _a;
      if (ts5.isFunctionDeclaration(declaration) || ts5.isMethodDeclaration(declaration)) {
        const nextDeclaration = declarations[index + 1];
        const isNextAbstractMethodWithSameName = nextDeclaration && ts5.isMethodDeclaration(nextDeclaration) && nextDeclaration.name.getText() === ((_a = declaration.name) == null ? void 0 : _a.getText());
        return !isNextAbstractMethodWithSameName;
      }
      return true;
    });
  }
  getMemberTagsFromModifiers(mods) {
    const tags = [];
    for (const mod of mods) {
      const tag = this.getTagForMemberModifier(mod);
      if (tag)
        tags.push(tag);
    }
    return tags;
  }
  getTagForMemberModifier(mod) {
    switch (mod.kind) {
      case ts5.SyntaxKind.StaticKeyword:
        return MemberTags.Static;
      case ts5.SyntaxKind.ReadonlyKeyword:
        return MemberTags.Readonly;
      case ts5.SyntaxKind.ProtectedKeyword:
        return MemberTags.Protected;
      case ts5.SyntaxKind.AbstractKeyword:
        return MemberTags.Abstract;
      default:
        return void 0;
    }
  }
  isMemberExcluded(member) {
    var _a;
    return !member.name || !this.isDocumentableMember(member) || !ts5.isCallSignatureDeclaration(member) && ((_a = member.modifiers) == null ? void 0 : _a.some((mod) => mod.kind === ts5.SyntaxKind.PrivateKeyword)) || member.name.getText() === "prototype" || isAngularPrivateName(member.name.getText()) || isInternal(member);
  }
  isDocumentableMember(member) {
    return this.isMethod(member) || this.isProperty(member) || ts5.isAccessor(member) || ts5.isCallSignatureDeclaration(member);
  }
  isPublicConstructorParameterProperty(node) {
    if (ts5.isParameterPropertyDeclaration(node, node.parent) && node.modifiers) {
      return node.modifiers.some((modifier) => modifier.kind === ts5.SyntaxKind.PublicKeyword);
    }
    return false;
  }
  isProperty(member) {
    return ts5.isPropertyDeclaration(member) || ts5.isPropertySignature(member) || this.isPublicConstructorParameterProperty(member);
  }
  isMethod(member) {
    return ts5.isMethodDeclaration(member) || ts5.isMethodSignature(member);
  }
  isDocumentableSignature(signature) {
    return ts5.isConstructSignatureDeclaration(signature) || ts5.isCallSignatureDeclaration(signature);
  }
  isAbstract() {
    var _a;
    const modifiers = (_a = this.declaration.modifiers) != null ? _a : [];
    return modifiers.some((mod) => mod.kind === ts5.SyntaxKind.AbstractKeyword);
  }
  hasPrivateComputedProperty(property) {
    return ts5.isComputedPropertyName(property.name) && property.name.expression.getText().startsWith("\u0275");
  }
};
var DirectiveExtractor = class extends ClassExtractor {
  reference;
  metadata;
  constructor(declaration, reference, metadata, checker) {
    super(declaration, checker);
    this.reference = reference;
    this.metadata = metadata;
  }
  extract() {
    var _a, _b;
    return {
      ...super.extract(),
      isStandalone: this.metadata.isStandalone,
      selector: (_a = this.metadata.selector) != null ? _a : "",
      exportAs: (_b = this.metadata.exportAs) != null ? _b : [],
      entryType: this.metadata.isComponent ? EntryType.Component : EntryType.Directive
    };
  }
  extractClassProperty(propertyDeclaration) {
    const entry = super.extractClassProperty(propertyDeclaration);
    const inputMetadata = this.getInputMetadata(propertyDeclaration);
    if (inputMetadata) {
      entry.memberTags.push(MemberTags.Input);
      entry.inputAlias = inputMetadata.bindingPropertyName;
      entry.isRequiredInput = inputMetadata.required;
    }
    const outputMetadata = this.getOutputMetadata(propertyDeclaration);
    if (outputMetadata) {
      entry.memberTags.push(MemberTags.Output);
      entry.outputAlias = outputMetadata.bindingPropertyName;
    }
    return entry;
  }
  getInputMetadata(prop) {
    var _a, _b;
    const propName = prop.name.getText();
    return (_b = (_a = this.metadata.inputs) == null ? void 0 : _a.getByClassPropertyName(propName)) != null ? _b : void 0;
  }
  getOutputMetadata(prop) {
    var _a, _b, _c;
    const propName = prop.name.getText();
    return (_c = (_b = (_a = this.metadata) == null ? void 0 : _a.outputs) == null ? void 0 : _b.getByClassPropertyName(propName)) != null ? _c : void 0;
  }
};
var PipeExtractor = class extends ClassExtractor {
  reference;
  metadata;
  constructor(declaration, reference, metadata, typeChecker) {
    super(declaration, typeChecker);
    this.reference = reference;
    this.metadata = metadata;
  }
  extract() {
    return {
      ...super.extract(),
      pipeName: this.metadata.name,
      entryType: EntryType.Pipe,
      isStandalone: this.metadata.isStandalone
    };
  }
};
var NgModuleExtractor = class extends ClassExtractor {
  reference;
  metadata;
  constructor(declaration, reference, metadata, typeChecker) {
    super(declaration, typeChecker);
    this.reference = reference;
    this.metadata = metadata;
  }
  extract() {
    return {
      ...super.extract(),
      entryType: EntryType.NgModule
    };
  }
};
function extractClass(classDeclaration, metadataReader, typeChecker) {
  const ref = new Reference(classDeclaration);
  let extractor;
  let directiveMetadata = metadataReader.getDirectiveMetadata(ref);
  let pipeMetadata = metadataReader.getPipeMetadata(ref);
  let ngModuleMetadata = metadataReader.getNgModuleMetadata(ref);
  if (directiveMetadata) {
    extractor = new DirectiveExtractor(classDeclaration, ref, directiveMetadata, typeChecker);
  } else if (pipeMetadata) {
    extractor = new PipeExtractor(classDeclaration, ref, pipeMetadata, typeChecker);
  } else if (ngModuleMetadata) {
    extractor = new NgModuleExtractor(classDeclaration, ref, ngModuleMetadata, typeChecker);
  } else {
    extractor = new ClassExtractor(classDeclaration, typeChecker);
  }
  return extractor.extract();
}
function extractInterface(declaration, typeChecker) {
  const extractor = new ClassExtractor(declaration, typeChecker);
  return extractor.extract();
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/constant_extractor.mjs
import ts6 from "typescript";
var LITERAL_AS_ENUM_TAG = "object-literal-as-enum";
function extractConstant(declaration, typeChecker) {
  const resolvedType = typeChecker.getBaseTypeOfLiteralType(typeChecker.getTypeAtLocation(declaration));
  const rawComment = extractRawJsDoc(declaration.parent.parent);
  const jsdocTags = extractJsDocTags(declaration);
  const description = extractJsDocDescription(declaration);
  const name = declaration.name.getText();
  if (jsdocTags.some((tag) => tag.name === LITERAL_AS_ENUM_TAG)) {
    return {
      name,
      entryType: EntryType.Enum,
      members: extractLiteralPropertiesAsEnumMembers(declaration),
      rawComment,
      description,
      jsdocTags: jsdocTags.filter((tag) => tag.name !== LITERAL_AS_ENUM_TAG)
    };
  }
  return {
    name,
    type: typeChecker.typeToString(resolvedType),
    entryType: EntryType.Constant,
    rawComment,
    description,
    jsdocTags
  };
}
function isSyntheticAngularConstant(declaration) {
  return declaration.name.getText() === "USED_FOR_NG_TYPE_CHECKING";
}
function extractLiteralPropertiesAsEnumMembers(declaration) {
  let initializer = declaration.initializer;
  while (initializer && (ts6.isAsExpression(initializer) || ts6.isParenthesizedExpression(initializer))) {
    initializer = initializer.expression;
  }
  if (initializer === void 0 || !ts6.isObjectLiteralExpression(initializer)) {
    throw new Error(`Declaration tagged with "${LITERAL_AS_ENUM_TAG}" must be initialized to an object literal, but received ${initializer ? ts6.SyntaxKind[initializer.kind] : "undefined"}`);
  }
  return initializer.properties.map((prop) => {
    if (!ts6.isPropertyAssignment(prop) || !ts6.isIdentifier(prop.name)) {
      throw new Error(`Property in declaration tagged with "${LITERAL_AS_ENUM_TAG}" must be a property assignment with a static name`);
    }
    if (!ts6.isNumericLiteral(prop.initializer) && !ts6.isStringLiteralLike(prop.initializer)) {
      throw new Error(`Property in declaration tagged with "${LITERAL_AS_ENUM_TAG}" must be initialized to a number or string literal`);
    }
    return {
      name: prop.name.text,
      type: `${declaration.name.getText()}.${prop.name.text}`,
      value: prop.initializer.getText(),
      memberType: MemberType.EnumItem,
      jsdocTags: extractJsDocTags(prop),
      description: extractJsDocDescription(prop),
      memberTags: []
    };
  });
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/decorator_extractor.mjs
import ts7 from "typescript";
function extractorDecorator(declaration, typeChecker) {
  const documentedNode = getDecoratorJsDocNode(declaration);
  const decoratorType = getDecoratorType(declaration);
  if (!decoratorType) {
    throw new Error(`"${declaration.name.getText()} is not a decorator."`);
  }
  return {
    name: declaration.name.getText(),
    decoratorType,
    entryType: EntryType.Decorator,
    rawComment: extractRawJsDoc(documentedNode),
    description: extractJsDocDescription(documentedNode),
    jsdocTags: extractJsDocTags(documentedNode),
    members: getDecoratorOptions(declaration, typeChecker)
  };
}
function isDecoratorDeclaration(declaration) {
  return !!getDecoratorType(declaration);
}
function isDecoratorOptionsInterface(declaration) {
  return declaration.getSourceFile().statements.some((s) => ts7.isVariableStatement(s) && s.declarationList.declarations.some((d) => isDecoratorDeclaration(d) && d.name.getText() === declaration.name.getText()));
}
function getDecoratorType(declaration) {
  var _a, _b;
  const initializer = (_b = (_a = declaration.initializer) == null ? void 0 : _a.getFullText()) != null ? _b : "";
  if (initializer.includes("makeDecorator"))
    return DecoratorType.Class;
  if (initializer.includes("makePropDecorator"))
    return DecoratorType.Member;
  if (initializer.includes("makeParamDecorator"))
    return DecoratorType.Parameter;
  return void 0;
}
function getDecoratorOptions(declaration, typeChecker) {
  var _a, _b;
  const name = declaration.name.getText();
  const optionsDeclaration = declaration.getSourceFile().statements.find((node) => {
    return (ts7.isInterfaceDeclaration(node) || ts7.isTypeAliasDeclaration(node)) && node.name.getText() === name;
  });
  if (!optionsDeclaration) {
    throw new Error(`Decorator "${name}" has no corresponding options interface.`);
  }
  let optionsInterface;
  if (ts7.isTypeAliasDeclaration(optionsDeclaration)) {
    const aliasedType = typeChecker.getTypeAtLocation(optionsDeclaration.type);
    optionsInterface = ((_b = (_a = aliasedType.getSymbol()) == null ? void 0 : _a.getDeclarations()) != null ? _b : []).find((d) => ts7.isInterfaceDeclaration(d));
  } else {
    optionsInterface = optionsDeclaration;
  }
  if (!optionsInterface || !ts7.isInterfaceDeclaration(optionsInterface)) {
    throw new Error(`Options for decorator "${name}" is not an interface.`);
  }
  return extractInterface(optionsInterface, typeChecker).members;
}
function getDecoratorJsDocNode(declaration) {
  const name = declaration.name.getText();
  const decoratorInterface = declaration.getSourceFile().statements.find((s) => {
    return ts7.isInterfaceDeclaration(s) && s.name.getText() === `${name}Decorator`;
  });
  if (!decoratorInterface || !ts7.isInterfaceDeclaration(decoratorInterface)) {
    throw new Error(`No interface "${name}Decorator" found.`);
  }
  const callSignature = decoratorInterface.members.find((node) => {
    return ts7.isCallSignatureDeclaration(node) && extractRawJsDoc(node);
  });
  if (!callSignature || !ts7.isCallSignatureDeclaration(callSignature)) {
    throw new Error(`No call signature with JsDoc on "${name}Decorator"`);
  }
  return callSignature;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/enum_extractor.mjs
import ts8 from "typescript";
function extractEnum(declaration, typeChecker) {
  return {
    name: declaration.name.getText(),
    entryType: EntryType.Enum,
    members: extractEnumMembers(declaration, typeChecker),
    rawComment: extractRawJsDoc(declaration),
    description: extractJsDocDescription(declaration),
    jsdocTags: extractJsDocTags(declaration)
  };
}
function extractEnumMembers(declaration, checker) {
  return declaration.members.map((member) => ({
    name: member.name.getText(),
    type: extractResolvedTypeString(member, checker),
    value: getEnumMemberValue(member),
    memberType: MemberType.EnumItem,
    jsdocTags: extractJsDocTags(member),
    description: extractJsDocDescription(member),
    memberTags: []
  }));
}
function getEnumMemberValue(memberNode) {
  var _a;
  const literal = memberNode.getChildren().find((n) => {
    return ts8.isNumericLiteral(n) || ts8.isStringLiteral(n) || ts8.isPrefixUnaryExpression(n) && n.operator === ts8.SyntaxKind.MinusToken && ts8.isNumericLiteral(n.operand);
  });
  return (_a = literal == null ? void 0 : literal.getText()) != null ? _a : "";
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/initializer_api_function_extractor.mjs
import ts9 from "typescript";
var initializerApiTag = "initializerApiFunction";
function isInitializerApiFunction(node, typeChecker) {
  if (ts9.isFunctionDeclaration(node) && node.name !== void 0 && node.body === void 0) {
    const implementation = findImplementationOfFunction(node, typeChecker);
    if (implementation !== void 0) {
      node = implementation;
    }
  }
  if (!ts9.isFunctionDeclaration(node) && !ts9.isVariableDeclaration(node)) {
    return false;
  }
  let tagContainer = ts9.isFunctionDeclaration(node) ? node : getContainerVariableStatement(node);
  if (tagContainer === null) {
    return false;
  }
  const tags = ts9.getJSDocTags(tagContainer);
  return tags.some((t) => t.tagName.text === initializerApiTag);
}
function extractInitializerApiFunction(node, typeChecker) {
  var _a;
  if (node.name === void 0 || !ts9.isIdentifier(node.name)) {
    throw new Error(`Initializer API: Expected literal variable name.`);
  }
  const container = ts9.isFunctionDeclaration(node) ? node : getContainerVariableStatement(node);
  if (container === null) {
    throw new Error("Initializer API: Could not find container AST node of variable.");
  }
  const name = node.name.text;
  const type = typeChecker.getTypeAtLocation(node);
  const callFunction = extractFunctionWithOverloads(name, type, typeChecker);
  const subFunctions = [];
  for (const property of type.getProperties()) {
    const subName = property.getName();
    const subDecl = (_a = property.getDeclarations()) == null ? void 0 : _a[0];
    if (subDecl === void 0 || !ts9.isPropertySignature(subDecl)) {
      throw new Error(`Initializer API: Could not resolve declaration of sub-property: ${name}.${subName}`);
    }
    const subType = typeChecker.getTypeAtLocation(subDecl);
    subFunctions.push(extractFunctionWithOverloads(subName, subType, typeChecker));
  }
  let jsdocTags;
  let description;
  let rawComment;
  if (ts9.isFunctionDeclaration(node)) {
    const implementation = findImplementationOfFunction(node, typeChecker);
    if (implementation === void 0) {
      throw new Error(`Initializer API: Could not find implementation of function: ${name}`);
    }
    callFunction.implementation = {
      name,
      entryType: EntryType.Function,
      isNewType: false,
      description: extractJsDocDescription(implementation),
      generics: extractGenerics(implementation),
      jsdocTags: extractJsDocTags(implementation),
      params: extractAllParams(implementation.parameters, typeChecker),
      rawComment: extractRawJsDoc(implementation),
      returnType: typeChecker.typeToString(typeChecker.getReturnTypeOfSignature(typeChecker.getSignatureFromDeclaration(implementation)))
    };
    jsdocTags = callFunction.implementation.jsdocTags;
    description = callFunction.implementation.description;
    rawComment = callFunction.implementation.description;
  } else {
    jsdocTags = extractJsDocTags(container);
    description = extractJsDocDescription(container);
    rawComment = extractRawJsDoc(container);
  }
  const metadataTag = jsdocTags.find((t) => t.name === initializerApiTag);
  if (metadataTag === void 0) {
    throw new Error(`Initializer API: Detected initializer API function does not have "@initializerApiFunction" tag: ${name}`);
  }
  let parsedMetadata = void 0;
  if (metadataTag.comment.trim() !== "") {
    try {
      parsedMetadata = JSON.parse(metadataTag.comment);
    } catch (e) {
      throw new Error(`Could not parse initializer API function metadata: ${e}`);
    }
  }
  return {
    entryType: EntryType.InitializerApiFunction,
    name,
    description,
    jsdocTags,
    rawComment,
    callFunction,
    subFunctions,
    __docsMetadata__: parsedMetadata
  };
}
function getContainerVariableStatement(node) {
  if (!ts9.isVariableDeclarationList(node.parent)) {
    return null;
  }
  if (!ts9.isVariableStatement(node.parent.parent)) {
    return null;
  }
  return node.parent.parent;
}
function extractFunctionWithOverloads(name, type, typeChecker) {
  return {
    name,
    signatures: extractCallSignatures(name, typeChecker, type),
    implementation: null
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/type_alias_extractor.mjs
function extractTypeAlias(declaration) {
  return {
    name: declaration.name.getText(),
    type: declaration.type.getText(),
    entryType: EntryType.TypeAlias,
    generics: extractGenerics(declaration),
    rawComment: extractRawJsDoc(declaration),
    description: extractJsDocDescription(declaration),
    jsdocTags: extractJsDocTags(declaration)
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/import_extractor.mjs
import ts10 from "typescript";
function getImportedSymbols(sourceFile) {
  const importSpecifiers = /* @__PURE__ */ new Map();
  function visit(node) {
    var _a;
    if (ts10.isImportDeclaration(node)) {
      let moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, "");
      if (moduleSpecifier.startsWith("@angular/")) {
        const namedBindings = (_a = node.importClause) == null ? void 0 : _a.namedBindings;
        if (namedBindings && ts10.isNamedImports(namedBindings)) {
          namedBindings.elements.forEach((importSpecifier) => {
            const importName = importSpecifier.name.text;
            const importAlias = importSpecifier.propertyName ? importSpecifier.propertyName.text : void 0;
            importSpecifiers.set(importAlias != null ? importAlias : importName, moduleSpecifier);
          });
        }
      }
    }
    ts10.forEachChild(node, visit);
  }
  visit(sourceFile);
  return importSpecifiers;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/docs/src/extractor.mjs
var DocsExtractor = class {
  typeChecker;
  metadataReader;
  constructor(typeChecker, metadataReader) {
    this.typeChecker = typeChecker;
    this.metadataReader = metadataReader;
  }
  extractAll(sourceFile, rootDir, privateModules) {
    const entries = [];
    const symbols = /* @__PURE__ */ new Map();
    const exportedDeclarations = this.getExportedDeclarations(sourceFile);
    for (const [exportName, node] of exportedDeclarations) {
      if (isAngularPrivateName(exportName)) {
        continue;
      }
      const entry = this.extractDeclaration(node);
      if (entry && !isIgnoredDocEntry(entry)) {
        const realSourceFile = node.getSourceFile();
        const importedSymbols = getImportedSymbols(realSourceFile);
        importedSymbols.forEach((moduleName, symbolName) => {
          if (symbolName.startsWith("\u0275") || privateModules.has(moduleName)) {
            return;
          }
          if (symbols.has(symbolName) && symbols.get(symbolName) !== moduleName) {
            throw new Error(`Ambigous symbol \`${symbolName}\` exported by both ${symbols.get(symbolName)} & ${moduleName}`);
          }
          symbols.set(symbolName, moduleName);
        });
        entry.source = {
          filePath: getRelativeFilePath(realSourceFile, rootDir),
          startLine: ts11.getLineAndCharacterOfPosition(realSourceFile, node.getStart()).line + 1,
          endLine: ts11.getLineAndCharacterOfPosition(realSourceFile, node.getEnd()).line + 1
        };
        entries.push({ ...entry, name: exportName });
      }
    }
    return { entries, symbols };
  }
  extractDeclaration(node) {
    if (isNamedClassDeclaration(node)) {
      return extractClass(node, this.metadataReader, this.typeChecker);
    }
    if (isInitializerApiFunction(node, this.typeChecker)) {
      return extractInitializerApiFunction(node, this.typeChecker);
    }
    if (ts11.isInterfaceDeclaration(node) && !isIgnoredInterface(node)) {
      return extractInterface(node, this.typeChecker);
    }
    if (ts11.isFunctionDeclaration(node)) {
      const functionExtractor = new FunctionExtractor(node.name.getText(), node, this.typeChecker);
      return functionExtractor.extract();
    }
    if (ts11.isVariableDeclaration(node) && !isSyntheticAngularConstant(node)) {
      return isDecoratorDeclaration(node) ? extractorDecorator(node, this.typeChecker) : extractConstant(node, this.typeChecker);
    }
    if (ts11.isTypeAliasDeclaration(node)) {
      return extractTypeAlias(node);
    }
    if (ts11.isEnumDeclaration(node)) {
      return extractEnum(node, this.typeChecker);
    }
    return null;
  }
  getExportedDeclarations(sourceFile) {
    var _a;
    const reflector = new TypeScriptReflectionHost(this.typeChecker, false, true);
    const exportedDeclarationMap = reflector.getExportsOfModule(sourceFile);
    let exportedDeclarations = Array.from((_a = exportedDeclarationMap == null ? void 0 : exportedDeclarationMap.entries()) != null ? _a : []).map(([exportName, declaration]) => [exportName, declaration.node]);
    return exportedDeclarations.sort(([a, declarationA], [b, declarationB]) => declarationA.pos - declarationB.pos);
  }
};
function isIgnoredInterface(node) {
  return node.name.getText().endsWith("Decorator") || isDecoratorOptionsInterface(node);
}
function isIgnoredDocEntry(entry) {
  const isDocsPrivate = entry.jsdocTags.find((e) => e.name === "docsPrivate");
  if (isDocsPrivate !== void 0 && isDocsPrivate.comment === "") {
    throw new Error(`Docs extraction: Entry "${entry.name}" is marked as "@docsPrivate" but without reasoning.`);
  }
  return isDocsPrivate !== void 0;
}
function getRelativeFilePath(sourceFile, rootDir) {
  const fullPath = sourceFile.fileName;
  const relativePath = fullPath.replace(rootDir, "");
  return relativePath;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/program.mjs
import { HtmlParser, MessageBundle } from "@angular/compiler";
import ts26 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/transformers/i18n.mjs
import { Xliff, Xliff2, Xmb } from "@angular/compiler";
import * as path from "path";
function i18nGetExtension(formatName) {
  const format = formatName.toLowerCase();
  switch (format) {
    case "xmb":
      return "xmb";
    case "xlf":
    case "xlif":
    case "xliff":
    case "xlf2":
    case "xliff2":
      return "xlf";
  }
  throw new Error(`Unsupported format "${formatName}"`);
}
function i18nExtract(formatName, outFile, host, options, bundle, pathResolve = path.resolve) {
  formatName = formatName || "xlf";
  const ext = i18nGetExtension(formatName);
  const content = i18nSerialize(bundle, formatName, options);
  const dstFile = outFile || `messages.${ext}`;
  const dstPath = pathResolve(options.outDir || options.basePath, dstFile);
  host.writeFile(dstPath, content, false, void 0, []);
  return [dstPath];
}
function i18nSerialize(bundle, formatName, options) {
  const format = formatName.toLowerCase();
  let serializer;
  switch (format) {
    case "xmb":
      serializer = new Xmb();
      break;
    case "xliff2":
    case "xlf2":
      serializer = new Xliff2();
      break;
    case "xlf":
    case "xliff":
    default:
      serializer = new Xliff();
  }
  return bundle.write(serializer, getPathNormalizer(options.basePath));
}
function getPathNormalizer(basePath) {
  return (sourcePath) => {
    sourcePath = basePath ? path.relative(basePath, sourcePath) : sourcePath;
    return sourcePath.split(path.sep).join("/");
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/typescript_support.mjs
import ts12 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/version_helpers.mjs
function toNumbers(value) {
  const suffixIndex = value.lastIndexOf("-");
  return value.slice(0, suffixIndex === -1 ? value.length : suffixIndex).split(".").map((segment) => {
    const parsed = parseInt(segment, 10);
    if (isNaN(parsed)) {
      throw Error(`Unable to parse version string ${value}.`);
    }
    return parsed;
  });
}
function compareNumbers(a, b) {
  const max = Math.max(a.length, b.length);
  const min = Math.min(a.length, b.length);
  for (let i = 0; i < min; i++) {
    if (a[i] > b[i])
      return 1;
    if (a[i] < b[i])
      return -1;
  }
  if (min !== max) {
    const longestArray = a.length === max ? a : b;
    const comparisonResult = a.length === max ? 1 : -1;
    for (let i = min; i < max; i++) {
      if (longestArray[i] > 0) {
        return comparisonResult;
      }
    }
  }
  return 0;
}
function compareVersions(v1, v2) {
  return compareNumbers(toNumbers(v1), toNumbers(v2));
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/typescript_support.mjs
var MIN_TS_VERSION = "5.5.0";
var MAX_TS_VERSION = "5.8.0";
var tsVersion = ts12.version;
function checkVersion(version, minVersion, maxVersion) {
  if (compareVersions(version, minVersion) < 0 || compareVersions(version, maxVersion) >= 0) {
    throw new Error(`The Angular Compiler requires TypeScript >=${minVersion} and <${maxVersion} but ${version} was found instead.`);
  }
}
function verifySupportedTypeScriptVersion() {
  checkVersion(tsVersion, MIN_TS_VERSION, MAX_TS_VERSION);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/core/src/compiler.mjs
import { R3Identifiers } from "@angular/compiler";
import ts24 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/cycles/src/analyzer.mjs
var CycleAnalyzer = class {
  importGraph;
  cachedResults = null;
  constructor(importGraph) {
    this.importGraph = importGraph;
  }
  wouldCreateCycle(from, to) {
    if (this.cachedResults === null || this.cachedResults.from !== from) {
      this.cachedResults = new CycleResults(from, this.importGraph);
    }
    return this.cachedResults.wouldBeCyclic(to) ? new Cycle(this.importGraph, from, to) : null;
  }
  recordSyntheticImport(from, to) {
    this.cachedResults = null;
    this.importGraph.addSyntheticImport(from, to);
  }
};
var NgCyclicResult = Symbol("NgCyclicResult");
var CycleResults = class {
  from;
  importGraph;
  cyclic = {};
  acyclic = {};
  constructor(from, importGraph) {
    this.from = from;
    this.importGraph = importGraph;
  }
  wouldBeCyclic(sf) {
    const cached = this.getCachedResult(sf);
    if (cached !== null) {
      return cached;
    }
    if (sf === this.from) {
      return true;
    }
    this.markAcyclic(sf);
    const imports = this.importGraph.importsOf(sf);
    for (const imported of imports) {
      if (this.wouldBeCyclic(imported)) {
        this.markCyclic(sf);
        return true;
      }
    }
    return false;
  }
  getCachedResult(sf) {
    const result = sf[NgCyclicResult];
    if (result === this.cyclic) {
      return true;
    } else if (result === this.acyclic) {
      return false;
    } else {
      return null;
    }
  }
  markCyclic(sf) {
    sf[NgCyclicResult] = this.cyclic;
  }
  markAcyclic(sf) {
    sf[NgCyclicResult] = this.acyclic;
  }
};
var Cycle = class {
  importGraph;
  from;
  to;
  constructor(importGraph, from, to) {
    this.importGraph = importGraph;
    this.from = from;
    this.to = to;
  }
  getPath() {
    return [this.from, ...this.importGraph.findPath(this.to, this.from)];
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/cycles/src/imports.mjs
import ts13 from "typescript";
var ImportGraph = class {
  checker;
  perf;
  imports = /* @__PURE__ */ new Map();
  constructor(checker, perf) {
    this.checker = checker;
    this.perf = perf;
  }
  importsOf(sf) {
    if (!this.imports.has(sf)) {
      this.imports.set(sf, this.scanImports(sf));
    }
    return this.imports.get(sf);
  }
  findPath(start, end) {
    if (start === end) {
      return [start];
    }
    const found = /* @__PURE__ */ new Set([start]);
    const queue = [new Found(start, null)];
    while (queue.length > 0) {
      const current = queue.shift();
      const imports = this.importsOf(current.sourceFile);
      for (const importedFile of imports) {
        if (!found.has(importedFile)) {
          const next = new Found(importedFile, current);
          if (next.sourceFile === end) {
            return next.toPath();
          }
          found.add(importedFile);
          queue.push(next);
        }
      }
    }
    return null;
  }
  addSyntheticImport(sf, imported) {
    if (isLocalFile(imported)) {
      this.importsOf(sf).add(imported);
    }
  }
  scanImports(sf) {
    return this.perf.inPhase(PerfPhase.CycleDetection, () => {
      const imports = /* @__PURE__ */ new Set();
      for (const stmt of sf.statements) {
        if (!ts13.isImportDeclaration(stmt) && !ts13.isExportDeclaration(stmt) || stmt.moduleSpecifier === void 0) {
          continue;
        }
        if (ts13.isImportDeclaration(stmt) && stmt.importClause !== void 0 && isTypeOnlyImportClause(stmt.importClause)) {
          continue;
        }
        const symbol = this.checker.getSymbolAtLocation(stmt.moduleSpecifier);
        if (symbol === void 0 || symbol.valueDeclaration === void 0) {
          continue;
        }
        const moduleFile = symbol.valueDeclaration;
        if (ts13.isSourceFile(moduleFile) && isLocalFile(moduleFile)) {
          imports.add(moduleFile);
        }
      }
      return imports;
    });
  }
};
function isLocalFile(sf) {
  return !sf.isDeclarationFile;
}
function isTypeOnlyImportClause(node) {
  if (node.isTypeOnly) {
    return true;
  }
  if (node.namedBindings !== void 0 && ts13.isNamedImports(node.namedBindings) && node.namedBindings.elements.every((specifier) => specifier.isTypeOnly)) {
    return true;
  }
  return false;
}
var Found = class {
  sourceFile;
  parent;
  constructor(sourceFile, parent) {
    this.sourceFile = sourceFile;
    this.parent = parent;
  }
  toPath() {
    const array = [];
    let current = this;
    while (current !== null) {
      array.push(current.sourceFile);
      current = current.parent;
    }
    return array.reverse();
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/entry_point/src/generator.mjs
import ts14 from "typescript";
var FlatIndexGenerator = class {
  entryPoint;
  moduleName;
  flatIndexPath;
  shouldEmit = true;
  constructor(entryPoint, relativeFlatIndexPath, moduleName) {
    this.entryPoint = entryPoint;
    this.moduleName = moduleName;
    this.flatIndexPath = join(dirname(entryPoint), relativeFlatIndexPath).replace(/\.js$/, "") + ".ts";
  }
  makeTopLevelShim() {
    const relativeEntryPoint = relativePathBetween(this.flatIndexPath, this.entryPoint);
    const contents = `/**
 * Generated bundle index. Do not edit.
 */

export * from '${relativeEntryPoint}';
`;
    const genFile = ts14.createSourceFile(this.flatIndexPath, contents, ts14.ScriptTarget.ES2015, true, ts14.ScriptKind.TS);
    if (this.moduleName !== null) {
      genFile.moduleName = this.moduleName;
    }
    return genFile;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/entry_point/src/logic.mjs
function findFlatIndexEntryPoint(rootFiles) {
  const tsFiles = rootFiles.filter((file) => isNonDeclarationTsPath(file));
  let resolvedEntryPoint = null;
  if (tsFiles.length === 1) {
    resolvedEntryPoint = tsFiles[0];
  } else {
    for (const tsFile of tsFiles) {
      if (getFileSystem().basename(tsFile) === "index.ts" && (resolvedEntryPoint === null || tsFile.length <= resolvedEntryPoint.length)) {
        resolvedEntryPoint = tsFile;
      }
    }
  }
  return resolvedEntryPoint;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/entry_point/src/private_export_checker.mjs
import ts15 from "typescript";
function checkForPrivateExports(entryPoint, checker, refGraph) {
  const diagnostics = [];
  const topLevelExports = /* @__PURE__ */ new Set();
  const moduleSymbol = checker.getSymbolAtLocation(entryPoint);
  if (moduleSymbol === void 0) {
    throw new Error(`Internal error: failed to get symbol for entrypoint`);
  }
  const exportedSymbols = checker.getExportsOfModule(moduleSymbol);
  exportedSymbols.forEach((symbol) => {
    if (symbol.flags & ts15.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    const decl = symbol.valueDeclaration;
    if (decl !== void 0) {
      topLevelExports.add(decl);
    }
  });
  const checkedSet = /* @__PURE__ */ new Set();
  topLevelExports.forEach((mainExport) => {
    refGraph.transitiveReferencesOf(mainExport).forEach((transitiveReference) => {
      if (checkedSet.has(transitiveReference)) {
        return;
      }
      checkedSet.add(transitiveReference);
      if (!topLevelExports.has(transitiveReference)) {
        const descriptor = getDescriptorOfDeclaration(transitiveReference);
        const name = getNameOfDeclaration(transitiveReference);
        let visibleVia = "NgModule exports";
        const transitivePath = refGraph.pathFrom(mainExport, transitiveReference);
        if (transitivePath !== null) {
          visibleVia = transitivePath.map((seg) => getNameOfDeclaration(seg)).join(" -> ");
        }
        const diagnostic = {
          category: ts15.DiagnosticCategory.Error,
          code: ngErrorCode(ErrorCode.SYMBOL_NOT_EXPORTED),
          file: transitiveReference.getSourceFile(),
          ...getPosOfDeclaration(transitiveReference),
          messageText: `Unsupported private ${descriptor} ${name}. This ${descriptor} is visible to consumers via ${visibleVia}, but is not exported from the top-level library entrypoint.`
        };
        diagnostics.push(diagnostic);
      }
    });
  });
  return diagnostics;
}
function getPosOfDeclaration(decl) {
  const node = getIdentifierOfDeclaration(decl) || decl;
  return {
    start: node.getStart(),
    length: node.getEnd() + 1 - node.getStart()
  };
}
function getIdentifierOfDeclaration(decl) {
  if ((ts15.isClassDeclaration(decl) || ts15.isVariableDeclaration(decl) || ts15.isFunctionDeclaration(decl)) && decl.name !== void 0 && ts15.isIdentifier(decl.name)) {
    return decl.name;
  } else {
    return null;
  }
}
function getNameOfDeclaration(decl) {
  const id = getIdentifierOfDeclaration(decl);
  return id !== null ? id.text : "(unnamed)";
}
function getDescriptorOfDeclaration(decl) {
  switch (decl.kind) {
    case ts15.SyntaxKind.ClassDeclaration:
      return "class";
    case ts15.SyntaxKind.FunctionDeclaration:
      return "function";
    case ts15.SyntaxKind.VariableDeclaration:
      return "variable";
    case ts15.SyntaxKind.EnumDeclaration:
      return "enum";
    default:
      return "declaration";
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/entry_point/src/reference_graph.mjs
var ReferenceGraph = class {
  references = /* @__PURE__ */ new Map();
  add(from, to) {
    if (!this.references.has(from)) {
      this.references.set(from, /* @__PURE__ */ new Set());
    }
    this.references.get(from).add(to);
  }
  transitiveReferencesOf(target) {
    const set = /* @__PURE__ */ new Set();
    this.collectTransitiveReferences(set, target);
    return set;
  }
  pathFrom(source, target) {
    return this.collectPathFrom(source, target, /* @__PURE__ */ new Set());
  }
  collectPathFrom(source, target, seen) {
    if (source === target) {
      return [target];
    } else if (seen.has(source)) {
      return null;
    }
    seen.add(source);
    if (!this.references.has(source)) {
      return null;
    } else {
      let candidatePath = null;
      this.references.get(source).forEach((edge) => {
        if (candidatePath !== null) {
          return;
        }
        const partialPath = this.collectPathFrom(edge, target, seen);
        if (partialPath !== null) {
          candidatePath = [source, ...partialPath];
        }
      });
      return candidatePath;
    }
  }
  collectTransitiveReferences(set, decl) {
    if (this.references.has(decl)) {
      this.references.get(decl).forEach((ref) => {
        if (!set.has(ref)) {
          set.add(ref);
          this.collectTransitiveReferences(set, ref);
        }
      });
    }
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/src/dependency_tracking.mjs
var FileDependencyGraph = class {
  nodes = /* @__PURE__ */ new Map();
  addDependency(from, on) {
    this.nodeFor(from).dependsOn.add(absoluteFromSourceFile(on));
  }
  addResourceDependency(from, resource) {
    this.nodeFor(from).usesResources.add(resource);
  }
  recordDependencyAnalysisFailure(file) {
    this.nodeFor(file).failedAnalysis = true;
  }
  getResourceDependencies(from) {
    const node = this.nodes.get(from);
    return node ? [...node.usesResources] : [];
  }
  updateWithPhysicalChanges(previous, changedTsPaths, deletedTsPaths, changedResources) {
    const logicallyChanged = /* @__PURE__ */ new Set();
    for (const sf of previous.nodes.keys()) {
      const sfPath = absoluteFromSourceFile(sf);
      const node = previous.nodeFor(sf);
      if (isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources)) {
        logicallyChanged.add(sfPath);
      } else if (!deletedTsPaths.has(sfPath)) {
        this.nodes.set(sf, {
          dependsOn: new Set(node.dependsOn),
          usesResources: new Set(node.usesResources),
          failedAnalysis: false
        });
      }
    }
    return logicallyChanged;
  }
  nodeFor(sf) {
    if (!this.nodes.has(sf)) {
      this.nodes.set(sf, {
        dependsOn: /* @__PURE__ */ new Set(),
        usesResources: /* @__PURE__ */ new Set(),
        failedAnalysis: false
      });
    }
    return this.nodes.get(sf);
  }
};
function isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources) {
  if (node.failedAnalysis) {
    return true;
  }
  const sfPath = absoluteFromSourceFile(sf);
  if (changedTsPaths.has(sfPath) || deletedTsPaths.has(sfPath)) {
    return true;
  }
  for (const dep of node.dependsOn) {
    if (changedTsPaths.has(dep) || deletedTsPaths.has(dep)) {
      return true;
    }
  }
  for (const dep of node.usesResources) {
    if (changedResources.has(dep)) {
      return true;
    }
  }
  return false;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/src/state.mjs
var IncrementalStateKind;
(function(IncrementalStateKind2) {
  IncrementalStateKind2[IncrementalStateKind2["Fresh"] = 0] = "Fresh";
  IncrementalStateKind2[IncrementalStateKind2["Delta"] = 1] = "Delta";
  IncrementalStateKind2[IncrementalStateKind2["Analyzed"] = 2] = "Analyzed";
})(IncrementalStateKind || (IncrementalStateKind = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/src/incremental.mjs
var PhaseKind;
(function(PhaseKind2) {
  PhaseKind2[PhaseKind2["Analysis"] = 0] = "Analysis";
  PhaseKind2[PhaseKind2["TypeCheckAndEmit"] = 1] = "TypeCheckAndEmit";
})(PhaseKind || (PhaseKind = {}));
var IncrementalCompilation = class {
  depGraph;
  versions;
  step;
  phase;
  _state;
  constructor(state, depGraph, versions, step) {
    this.depGraph = depGraph;
    this.versions = versions;
    this.step = step;
    this._state = state;
    this.phase = {
      kind: PhaseKind.Analysis,
      semanticDepGraphUpdater: new SemanticDepGraphUpdater(step !== null ? step.priorState.semanticDepGraph : null)
    };
  }
  static fresh(program, versions) {
    const state = {
      kind: IncrementalStateKind.Fresh
    };
    return new IncrementalCompilation(state, new FileDependencyGraph(), versions, null);
  }
  static incremental(program, newVersions, oldProgram, oldState, modifiedResourceFiles, perf) {
    return perf.inPhase(PerfPhase.Reconciliation, () => {
      const physicallyChangedTsFiles = /* @__PURE__ */ new Set();
      const changedResourceFiles = new Set(modifiedResourceFiles != null ? modifiedResourceFiles : []);
      let priorAnalysis;
      switch (oldState.kind) {
        case IncrementalStateKind.Fresh:
          return IncrementalCompilation.fresh(program, newVersions);
        case IncrementalStateKind.Analyzed:
          priorAnalysis = oldState;
          break;
        case IncrementalStateKind.Delta:
          priorAnalysis = oldState.lastAnalyzedState;
          for (const sfPath of oldState.physicallyChangedTsFiles) {
            physicallyChangedTsFiles.add(sfPath);
          }
          for (const resourcePath of oldState.changedResourceFiles) {
            changedResourceFiles.add(resourcePath);
          }
          break;
      }
      const oldVersions = priorAnalysis.versions;
      const oldFilesArray = oldProgram.getSourceFiles().map(toOriginalSourceFile);
      const oldFiles = new Set(oldFilesArray);
      const deletedTsFiles = new Set(oldFilesArray.map((sf) => absoluteFromSourceFile(sf)));
      for (const possiblyRedirectedNewFile of program.getSourceFiles()) {
        const sf = toOriginalSourceFile(possiblyRedirectedNewFile);
        const sfPath = absoluteFromSourceFile(sf);
        deletedTsFiles.delete(sfPath);
        if (oldFiles.has(sf)) {
          if (oldVersions === null || newVersions === null) {
            continue;
          }
          if (oldVersions.has(sfPath) && newVersions.has(sfPath) && oldVersions.get(sfPath) === newVersions.get(sfPath)) {
            continue;
          }
        }
        if (sf.isDeclarationFile) {
          return IncrementalCompilation.fresh(program, newVersions);
        }
        physicallyChangedTsFiles.add(sfPath);
      }
      for (const deletedFileName of deletedTsFiles) {
        physicallyChangedTsFiles.delete(resolve(deletedFileName));
      }
      const depGraph = new FileDependencyGraph();
      const logicallyChangedTsFiles = depGraph.updateWithPhysicalChanges(priorAnalysis.depGraph, physicallyChangedTsFiles, deletedTsFiles, changedResourceFiles);
      for (const sfPath of physicallyChangedTsFiles) {
        logicallyChangedTsFiles.add(sfPath);
      }
      const state = {
        kind: IncrementalStateKind.Delta,
        physicallyChangedTsFiles,
        changedResourceFiles,
        lastAnalyzedState: priorAnalysis
      };
      return new IncrementalCompilation(state, depGraph, newVersions, {
        priorState: priorAnalysis,
        logicallyChangedTsFiles
      });
    });
  }
  get state() {
    return this._state;
  }
  get semanticDepGraphUpdater() {
    if (this.phase.kind !== PhaseKind.Analysis) {
      throw new Error(`AssertionError: Cannot update the SemanticDepGraph after analysis completes`);
    }
    return this.phase.semanticDepGraphUpdater;
  }
  recordSuccessfulAnalysis(traitCompiler) {
    if (this.phase.kind !== PhaseKind.Analysis) {
      throw new Error(`AssertionError: Incremental compilation in phase ${PhaseKind[this.phase.kind]}, expected Analysis`);
    }
    const { needsEmit, needsTypeCheckEmit, newGraph } = this.phase.semanticDepGraphUpdater.finalize();
    let emitted;
    if (this.step === null) {
      emitted = /* @__PURE__ */ new Set();
    } else {
      emitted = new Set(this.step.priorState.emitted);
      for (const sfPath of this.step.logicallyChangedTsFiles) {
        emitted.delete(sfPath);
      }
      for (const sfPath of needsEmit) {
        emitted.delete(sfPath);
      }
    }
    this._state = {
      kind: IncrementalStateKind.Analyzed,
      versions: this.versions,
      depGraph: this.depGraph,
      semanticDepGraph: newGraph,
      priorAnalysis: traitCompiler.getAnalyzedRecords(),
      typeCheckResults: null,
      emitted
    };
    this.phase = {
      kind: PhaseKind.TypeCheckAndEmit,
      needsEmit,
      needsTypeCheckEmit
    };
  }
  recordSuccessfulTypeCheck(results) {
    if (this._state.kind !== IncrementalStateKind.Analyzed) {
      throw new Error(`AssertionError: Expected successfully analyzed compilation.`);
    } else if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
      throw new Error(`AssertionError: Incremental compilation in phase ${PhaseKind[this.phase.kind]}, expected TypeCheck`);
    }
    this._state.typeCheckResults = results;
  }
  recordSuccessfulEmit(sf) {
    if (this._state.kind !== IncrementalStateKind.Analyzed) {
      throw new Error(`AssertionError: Expected successfully analyzed compilation.`);
    }
    this._state.emitted.add(absoluteFromSourceFile(sf));
  }
  priorAnalysisFor(sf) {
    if (this.step === null) {
      return null;
    }
    const sfPath = absoluteFromSourceFile(sf);
    if (this.step.logicallyChangedTsFiles.has(sfPath)) {
      return null;
    }
    const priorAnalysis = this.step.priorState.priorAnalysis;
    if (!priorAnalysis.has(sf)) {
      return null;
    }
    return priorAnalysis.get(sf);
  }
  priorTypeCheckingResultsFor(sf) {
    if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
      throw new Error(`AssertionError: Expected successfully analyzed compilation.`);
    }
    if (this.step === null) {
      return null;
    }
    const sfPath = absoluteFromSourceFile(sf);
    if (this.step.logicallyChangedTsFiles.has(sfPath) || this.phase.needsTypeCheckEmit.has(sfPath)) {
      return null;
    }
    if (this.step.priorState.typeCheckResults === null || !this.step.priorState.typeCheckResults.has(sfPath)) {
      return null;
    }
    const priorResults = this.step.priorState.typeCheckResults.get(sfPath);
    if (priorResults.hasInlines) {
      return null;
    }
    return priorResults;
  }
  safeToSkipEmit(sf) {
    if (this.step === null) {
      return false;
    }
    const sfPath = absoluteFromSourceFile(sf);
    if (this.step.logicallyChangedTsFiles.has(sfPath)) {
      return false;
    }
    if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
      throw new Error(`AssertionError: Expected successful analysis before attempting to emit files`);
    }
    if (this.phase.needsEmit.has(sfPath)) {
      return false;
    }
    return this.step.priorState.emitted.has(sfPath);
  }
};
function toOriginalSourceFile(sf) {
  const unredirectedSf = toUnredirectedSourceFile(sf);
  const originalFile = unredirectedSf[NgOriginalFile];
  if (originalFile !== void 0) {
    return originalFile;
  } else {
    return unredirectedSf;
  }
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/incremental/src/strategy.mjs
var TrackedIncrementalBuildStrategy = class {
  state = null;
  isSet = false;
  getIncrementalState() {
    return this.state;
  }
  setIncrementalState(state) {
    this.state = state;
    this.isSet = true;
  }
  toNextBuildStrategy() {
    const strategy = new TrackedIncrementalBuildStrategy();
    strategy.state = this.isSet ? this.state : null;
    return strategy;
  }
};
var PatchedProgramIncrementalBuildStrategy = class {
  getIncrementalState(program) {
    const state = program[SYM_INCREMENTAL_STATE];
    if (state === void 0) {
      return null;
    }
    return state;
  }
  setIncrementalState(state, program) {
    program[SYM_INCREMENTAL_STATE] = state;
  }
  toNextBuildStrategy() {
    return this;
  }
};
var SYM_INCREMENTAL_STATE = Symbol("NgIncrementalState");

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/indexer/src/api.mjs
var IdentifierKind;
(function(IdentifierKind2) {
  IdentifierKind2[IdentifierKind2["Property"] = 0] = "Property";
  IdentifierKind2[IdentifierKind2["Method"] = 1] = "Method";
  IdentifierKind2[IdentifierKind2["Element"] = 2] = "Element";
  IdentifierKind2[IdentifierKind2["Template"] = 3] = "Template";
  IdentifierKind2[IdentifierKind2["Attribute"] = 4] = "Attribute";
  IdentifierKind2[IdentifierKind2["Reference"] = 5] = "Reference";
  IdentifierKind2[IdentifierKind2["Variable"] = 6] = "Variable";
  IdentifierKind2[IdentifierKind2["LetDeclaration"] = 7] = "LetDeclaration";
})(IdentifierKind || (IdentifierKind = {}));
var AbsoluteSourceSpan = class {
  start;
  end;
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/indexer/src/context.mjs
var IndexingContext = class {
  components = /* @__PURE__ */ new Set();
  addComponent(info) {
    this.components.add(info);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/indexer/src/transform.mjs
import { ParseSourceFile } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/indexer/src/template.mjs
import { ASTWithSource, ImplicitReceiver, PropertyRead, PropertyWrite, RecursiveAstVisitor, TmplAstBoundDeferredTrigger, TmplAstElement, TmplAstRecursiveVisitor, TmplAstReference, TmplAstTemplate, TmplAstVariable } from "@angular/compiler";
var ExpressionVisitor = class extends RecursiveAstVisitor {
  expressionStr;
  absoluteOffset;
  boundTemplate;
  targetToIdentifier;
  identifiers = [];
  errors = [];
  constructor(expressionStr, absoluteOffset, boundTemplate, targetToIdentifier) {
    super();
    this.expressionStr = expressionStr;
    this.absoluteOffset = absoluteOffset;
    this.boundTemplate = boundTemplate;
    this.targetToIdentifier = targetToIdentifier;
  }
  static getIdentifiers(ast, source, absoluteOffset, boundTemplate, targetToIdentifier) {
    const visitor = new ExpressionVisitor(source, absoluteOffset, boundTemplate, targetToIdentifier);
    visitor.visit(ast);
    return { identifiers: visitor.identifiers, errors: visitor.errors };
  }
  visit(ast) {
    ast.visit(this);
  }
  visitPropertyRead(ast, context) {
    this.visitIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyRead(ast, context);
  }
  visitPropertyWrite(ast, context) {
    this.visitIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyWrite(ast, context);
  }
  visitIdentifier(ast, kind) {
    if (!(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }
    let identifierStart = ast.sourceSpan.start - this.absoluteOffset;
    if (ast instanceof PropertyRead || ast instanceof PropertyWrite) {
      identifierStart = ast.nameSpan.start - this.absoluteOffset;
    }
    if (!this.expressionStr.substring(identifierStart).startsWith(ast.name)) {
      this.errors.push(new Error(`Impossible state: "${ast.name}" not found in "${this.expressionStr}" at location ${identifierStart}`));
      return;
    }
    const absoluteStart = this.absoluteOffset + identifierStart;
    const span = new AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);
    const targetAst = this.boundTemplate.getExpressionTarget(ast);
    const target = targetAst ? this.targetToIdentifier(targetAst) : null;
    const identifier = {
      name: ast.name,
      span,
      kind,
      target
    };
    this.identifiers.push(identifier);
  }
};
var TemplateVisitor = class extends TmplAstRecursiveVisitor {
  boundTemplate;
  identifiers = /* @__PURE__ */ new Set();
  errors = [];
  targetIdentifierCache = /* @__PURE__ */ new Map();
  elementAndTemplateIdentifierCache = /* @__PURE__ */ new Map();
  constructor(boundTemplate) {
    super();
    this.boundTemplate = boundTemplate;
  }
  visit(node) {
    node.visit(this);
  }
  visitAll(nodes) {
    nodes.forEach((node) => this.visit(node));
  }
  visitElement(element) {
    const elementIdentifier = this.elementOrTemplateToIdentifier(element);
    if (elementIdentifier !== null) {
      this.identifiers.add(elementIdentifier);
    }
    this.visitAll(element.references);
    this.visitAll(element.inputs);
    this.visitAll(element.attributes);
    this.visitAll(element.children);
    this.visitAll(element.outputs);
  }
  visitTemplate(template) {
    const templateIdentifier = this.elementOrTemplateToIdentifier(template);
    if (templateIdentifier !== null) {
      this.identifiers.add(templateIdentifier);
    }
    this.visitAll(template.variables);
    this.visitAll(template.attributes);
    this.visitAll(template.templateAttrs);
    this.visitAll(template.children);
    this.visitAll(template.references);
  }
  visitBoundAttribute(attribute) {
    if (attribute.valueSpan === void 0) {
      return;
    }
    const { identifiers, errors } = ExpressionVisitor.getIdentifiers(attribute.value, attribute.valueSpan.toString(), attribute.valueSpan.start.offset, this.boundTemplate, this.targetToIdentifier.bind(this));
    identifiers.forEach((id) => this.identifiers.add(id));
    this.errors.push(...errors);
  }
  visitBoundEvent(attribute) {
    this.visitExpression(attribute.handler);
  }
  visitBoundText(text) {
    this.visitExpression(text.value);
  }
  visitReference(reference) {
    const referenceIdentifier = this.targetToIdentifier(reference);
    if (referenceIdentifier === null) {
      return;
    }
    this.identifiers.add(referenceIdentifier);
  }
  visitVariable(variable) {
    const variableIdentifier = this.targetToIdentifier(variable);
    if (variableIdentifier === null) {
      return;
    }
    this.identifiers.add(variableIdentifier);
  }
  visitDeferredBlock(deferred) {
    deferred.visitAll(this);
  }
  visitDeferredBlockPlaceholder(block) {
    this.visitAll(block.children);
  }
  visitDeferredBlockError(block) {
    this.visitAll(block.children);
  }
  visitDeferredBlockLoading(block) {
    this.visitAll(block.children);
  }
  visitDeferredTrigger(trigger) {
    if (trigger instanceof TmplAstBoundDeferredTrigger) {
      this.visitExpression(trigger.value);
    }
  }
  visitSwitchBlock(block) {
    this.visitExpression(block.expression);
    this.visitAll(block.cases);
  }
  visitSwitchBlockCase(block) {
    block.expression && this.visitExpression(block.expression);
    this.visitAll(block.children);
  }
  visitForLoopBlock(block) {
    var _a;
    block.item.visit(this);
    this.visitAll(block.contextVariables);
    this.visitExpression(block.expression);
    this.visitAll(block.children);
    (_a = block.empty) == null ? void 0 : _a.visit(this);
  }
  visitForLoopBlockEmpty(block) {
    this.visitAll(block.children);
  }
  visitIfBlock(block) {
    this.visitAll(block.branches);
  }
  visitIfBlockBranch(block) {
    var _a;
    block.expression && this.visitExpression(block.expression);
    (_a = block.expressionAlias) == null ? void 0 : _a.visit(this);
    this.visitAll(block.children);
  }
  visitLetDeclaration(decl) {
    const identifier = this.targetToIdentifier(decl);
    if (identifier !== null) {
      this.identifiers.add(identifier);
    }
    this.visitExpression(decl.value);
  }
  elementOrTemplateToIdentifier(node) {
    var _a;
    if (this.elementAndTemplateIdentifierCache.has(node)) {
      return this.elementAndTemplateIdentifierCache.get(node);
    }
    let name;
    let kind;
    if (node instanceof TmplAstTemplate) {
      name = (_a = node.tagName) != null ? _a : "ng-template";
      kind = IdentifierKind.Template;
    } else {
      name = node.name;
      kind = IdentifierKind.Element;
    }
    if (name.startsWith(":")) {
      name = name.split(":").pop();
    }
    const sourceSpan = node.startSourceSpan;
    const start = this.getStartLocation(name, sourceSpan);
    if (start === null) {
      return null;
    }
    const absoluteSpan = new AbsoluteSourceSpan(start, start + name.length);
    const attributes = node.attributes.map(({ name: name2, sourceSpan: sourceSpan2 }) => {
      return {
        name: name2,
        span: new AbsoluteSourceSpan(sourceSpan2.start.offset, sourceSpan2.end.offset),
        kind: IdentifierKind.Attribute
      };
    });
    const usedDirectives = this.boundTemplate.getDirectivesOfNode(node) || [];
    const identifier = {
      name,
      span: absoluteSpan,
      kind,
      attributes: new Set(attributes),
      usedDirectives: new Set(usedDirectives.map((dir) => {
        return {
          node: dir.ref.node,
          selector: dir.selector
        };
      }))
    };
    this.elementAndTemplateIdentifierCache.set(node, identifier);
    return identifier;
  }
  targetToIdentifier(node) {
    if (this.targetIdentifierCache.has(node)) {
      return this.targetIdentifierCache.get(node);
    }
    const { name, sourceSpan } = node;
    const start = this.getStartLocation(name, sourceSpan);
    if (start === null) {
      return null;
    }
    const span = new AbsoluteSourceSpan(start, start + name.length);
    let identifier;
    if (node instanceof TmplAstReference) {
      const refTarget = this.boundTemplate.getReferenceTarget(node);
      let target = null;
      if (refTarget) {
        let node2 = null;
        let directive = null;
        if (refTarget instanceof TmplAstElement || refTarget instanceof TmplAstTemplate) {
          node2 = this.elementOrTemplateToIdentifier(refTarget);
        } else {
          node2 = this.elementOrTemplateToIdentifier(refTarget.node);
          directive = refTarget.directive.ref.node;
        }
        if (node2 === null) {
          return null;
        }
        target = {
          node: node2,
          directive
        };
      }
      identifier = {
        name,
        span,
        kind: IdentifierKind.Reference,
        target
      };
    } else if (node instanceof TmplAstVariable) {
      identifier = {
        name,
        span,
        kind: IdentifierKind.Variable
      };
    } else {
      identifier = {
        name,
        span,
        kind: IdentifierKind.LetDeclaration
      };
    }
    this.targetIdentifierCache.set(node, identifier);
    return identifier;
  }
  getStartLocation(name, context) {
    const localStr = context.toString();
    if (!localStr.includes(name)) {
      this.errors.push(new Error(`Impossible state: "${name}" not found in "${localStr}"`));
      return null;
    }
    return context.start.offset + localStr.indexOf(name);
  }
  visitExpression(ast) {
    if (ast instanceof ASTWithSource && ast.source !== null) {
      const targetToIdentifier = this.targetToIdentifier.bind(this);
      const absoluteOffset = ast.sourceSpan.start;
      const { identifiers, errors } = ExpressionVisitor.getIdentifiers(ast, ast.source, absoluteOffset, this.boundTemplate, targetToIdentifier);
      identifiers.forEach((id) => this.identifiers.add(id));
      this.errors.push(...errors);
    }
  }
};
function getTemplateIdentifiers(boundTemplate) {
  const visitor = new TemplateVisitor(boundTemplate);
  if (boundTemplate.target.template !== void 0) {
    visitor.visitAll(boundTemplate.target.template);
  }
  return { identifiers: visitor.identifiers, errors: visitor.errors };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/indexer/src/transform.mjs
function generateAnalysis(context) {
  const analysis = /* @__PURE__ */ new Map();
  context.components.forEach(({ declaration, selector, boundTemplate, templateMeta }) => {
    const name = declaration.name.getText();
    const usedComponents = /* @__PURE__ */ new Set();
    const usedDirs = boundTemplate.getUsedDirectives();
    usedDirs.forEach((dir) => {
      if (dir.isComponent) {
        usedComponents.add(dir.ref.node);
      }
    });
    const componentFile = new ParseSourceFile(declaration.getSourceFile().getFullText(), declaration.getSourceFile().fileName);
    let templateFile;
    if (templateMeta.isInline) {
      templateFile = componentFile;
    } else {
      templateFile = templateMeta.file;
    }
    const { identifiers, errors } = getTemplateIdentifiers(boundTemplate);
    analysis.set(declaration, {
      name,
      selector,
      file: componentFile,
      template: {
        identifiers,
        usedComponents,
        isInline: templateMeta.isInline,
        file: templateFile
      },
      errors
    });
  });
  return analysis;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/metadata/src/ng_module_index.mjs
var NgModuleIndexImpl = class {
  metaReader;
  localReader;
  constructor(metaReader, localReader) {
    this.metaReader = metaReader;
    this.localReader = localReader;
  }
  ngModuleAuthoritativeReference = /* @__PURE__ */ new Map();
  typeToExportingModules = /* @__PURE__ */ new Map();
  indexed = false;
  updateWith(cache, key, elem) {
    if (cache.has(key)) {
      cache.get(key).add(elem);
    } else {
      const set = /* @__PURE__ */ new Set();
      set.add(elem);
      cache.set(key, set);
    }
  }
  index() {
    const seenTypesWithReexports = /* @__PURE__ */ new Map();
    const locallyDeclaredDirsAndNgModules = [
      ...this.localReader.getKnown(MetaKind.NgModule),
      ...this.localReader.getKnown(MetaKind.Directive)
    ];
    for (const decl of locallyDeclaredDirsAndNgModules) {
      this.indexTrait(new Reference(decl), seenTypesWithReexports);
    }
    this.indexed = true;
  }
  indexTrait(ref, seenTypesWithReexports) {
    var _a, _b, _c;
    if (seenTypesWithReexports.has(ref.node)) {
      return;
    }
    seenTypesWithReexports.set(ref.node, /* @__PURE__ */ new Set());
    const meta = (_a = this.metaReader.getDirectiveMetadata(ref)) != null ? _a : this.metaReader.getNgModuleMetadata(ref);
    if (meta === null) {
      return;
    }
    if (meta.imports !== null) {
      for (const childRef of meta.imports) {
        this.indexTrait(childRef, seenTypesWithReexports);
      }
    }
    if (meta.kind === MetaKind.NgModule) {
      if (!this.ngModuleAuthoritativeReference.has(ref.node)) {
        this.ngModuleAuthoritativeReference.set(ref.node, ref);
      }
      for (const childRef of meta.exports) {
        this.indexTrait(childRef, seenTypesWithReexports);
        const childMeta = (_c = (_b = this.metaReader.getDirectiveMetadata(childRef)) != null ? _b : this.metaReader.getPipeMetadata(childRef)) != null ? _c : this.metaReader.getNgModuleMetadata(childRef);
        if (childMeta === null) {
          continue;
        }
        switch (childMeta.kind) {
          case MetaKind.Directive:
          case MetaKind.Pipe:
            this.updateWith(this.typeToExportingModules, childRef.node, ref.node);
            this.updateWith(seenTypesWithReexports, ref.node, childRef.node);
            break;
          case MetaKind.NgModule:
            if (seenTypesWithReexports.has(childRef.node)) {
              for (const reexported of seenTypesWithReexports.get(childRef.node)) {
                this.updateWith(this.typeToExportingModules, reexported, ref.node);
                this.updateWith(seenTypesWithReexports, ref.node, reexported);
              }
            }
            break;
        }
      }
    }
  }
  getNgModulesExporting(directiveOrPipe) {
    if (!this.indexed) {
      this.index();
    }
    if (!this.typeToExportingModules.has(directiveOrPipe)) {
      return [];
    }
    const refs = [];
    for (const ngModule of this.typeToExportingModules.get(directiveOrPipe)) {
      if (this.ngModuleAuthoritativeReference.has(ngModule)) {
        refs.push(this.ngModuleAuthoritativeReference.get(ngModule));
      }
    }
    return refs;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/resource/src/loader.mjs
import ts16 from "typescript";
var CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;
var RESOURCE_MARKER = ".$ngresource$";
var RESOURCE_MARKER_TS = RESOURCE_MARKER + ".ts";
var AdapterResourceLoader = class {
  adapter;
  options;
  cache = /* @__PURE__ */ new Map();
  fetching = /* @__PURE__ */ new Map();
  lookupResolutionHost;
  canPreload;
  canPreprocess;
  constructor(adapter, options) {
    this.adapter = adapter;
    this.options = options;
    this.lookupResolutionHost = createLookupResolutionHost(this.adapter);
    this.canPreload = !!this.adapter.readResource;
    this.canPreprocess = !!this.adapter.transformResource;
  }
  resolve(url, fromFile) {
    let resolvedUrl = null;
    if (this.adapter.resourceNameToFileName) {
      resolvedUrl = this.adapter.resourceNameToFileName(url, fromFile, (url2, fromFile2) => this.fallbackResolve(url2, fromFile2));
    } else {
      resolvedUrl = this.fallbackResolve(url, fromFile);
    }
    if (resolvedUrl === null) {
      throw new Error(`HostResourceResolver: could not resolve ${url} in context of ${fromFile})`);
    }
    return resolvedUrl;
  }
  preload(resolvedUrl, context) {
    if (!this.adapter.readResource) {
      throw new Error("HostResourceLoader: the CompilerHost provided does not support pre-loading resources.");
    }
    if (this.cache.has(resolvedUrl)) {
      return void 0;
    } else if (this.fetching.has(resolvedUrl)) {
      return this.fetching.get(resolvedUrl);
    }
    let result = this.adapter.readResource(resolvedUrl);
    if (this.adapter.transformResource && context.type === "style") {
      const resourceContext = {
        type: "style",
        containingFile: context.containingFile,
        resourceFile: resolvedUrl,
        className: context.className
      };
      result = Promise.resolve(result).then(async (str) => {
        const transformResult = await this.adapter.transformResource(str, resourceContext);
        return transformResult === null ? str : transformResult.content;
      });
    }
    if (typeof result === "string") {
      this.cache.set(resolvedUrl, result);
      return void 0;
    } else {
      const fetchCompletion = result.then((str) => {
        this.fetching.delete(resolvedUrl);
        this.cache.set(resolvedUrl, str);
      });
      this.fetching.set(resolvedUrl, fetchCompletion);
      return fetchCompletion;
    }
  }
  async preprocessInline(data, context) {
    if (!this.adapter.transformResource || context.type !== "style") {
      return data;
    }
    const transformResult = await this.adapter.transformResource(data, {
      type: "style",
      containingFile: context.containingFile,
      resourceFile: null,
      order: context.order,
      className: context.className
    });
    if (transformResult === null) {
      return data;
    }
    return transformResult.content;
  }
  load(resolvedUrl) {
    if (this.cache.has(resolvedUrl)) {
      return this.cache.get(resolvedUrl);
    }
    const result = this.adapter.readResource ? this.adapter.readResource(resolvedUrl) : this.adapter.readFile(resolvedUrl);
    if (typeof result !== "string") {
      throw new Error(`HostResourceLoader: loader(${resolvedUrl}) returned a Promise`);
    }
    this.cache.set(resolvedUrl, result);
    return result;
  }
  invalidate() {
    this.cache.clear();
  }
  fallbackResolve(url, fromFile) {
    let candidateLocations;
    if (url.startsWith("/")) {
      candidateLocations = this.getRootedCandidateLocations(url);
    } else {
      if (!url.startsWith(".")) {
        url = `./${url}`;
      }
      candidateLocations = this.getResolvedCandidateLocations(url, fromFile);
    }
    for (const candidate of candidateLocations) {
      if (this.adapter.fileExists(candidate)) {
        return candidate;
      } else if (CSS_PREPROCESSOR_EXT.test(candidate)) {
        const cssFallbackUrl = candidate.replace(CSS_PREPROCESSOR_EXT, ".css");
        if (this.adapter.fileExists(cssFallbackUrl)) {
          return cssFallbackUrl;
        }
      }
    }
    return null;
  }
  getRootedCandidateLocations(url) {
    const segment = "." + url;
    return this.adapter.rootDirs.map((rootDir) => join(rootDir, segment));
  }
  getResolvedCandidateLocations(url, fromFile) {
    const failedLookup = ts16.resolveModuleName(url + RESOURCE_MARKER, fromFile, this.options, this.lookupResolutionHost);
    if (failedLookup.failedLookupLocations === void 0) {
      throw new Error(`Internal error: expected to find failedLookupLocations during resolution of resource '${url}' in context of ${fromFile}`);
    }
    return failedLookup.failedLookupLocations.filter((candidate) => candidate.endsWith(RESOURCE_MARKER_TS)).map((candidate) => candidate.slice(0, -RESOURCE_MARKER_TS.length));
  }
};
function createLookupResolutionHost(adapter) {
  var _a, _b, _c;
  return {
    directoryExists(directoryName) {
      if (directoryName.includes(RESOURCE_MARKER)) {
        return false;
      } else if (adapter.directoryExists !== void 0) {
        return adapter.directoryExists(directoryName);
      } else {
        return true;
      }
    },
    fileExists(fileName) {
      if (fileName.includes(RESOURCE_MARKER)) {
        return false;
      } else {
        return adapter.fileExists(fileName);
      }
    },
    readFile: adapter.readFile.bind(adapter),
    getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
    getDirectories: (_a = adapter.getDirectories) == null ? void 0 : _a.bind(adapter),
    realpath: (_b = adapter.realpath) == null ? void 0 : _b.bind(adapter),
    trace: (_c = adapter.trace) == null ? void 0 : _c.bind(adapter),
    useCaseSensitiveFileNames: typeof adapter.useCaseSensitiveFileNames === "function" ? adapter.useCaseSensitiveFileNames.bind(adapter) : adapter.useCaseSensitiveFileNames
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/scope/src/standalone.mjs
var StandaloneComponentScopeReader = class {
  metaReader;
  localModuleReader;
  dtsModuleReader;
  cache = /* @__PURE__ */ new Map();
  constructor(metaReader, localModuleReader, dtsModuleReader) {
    this.metaReader = metaReader;
    this.localModuleReader = localModuleReader;
    this.dtsModuleReader = dtsModuleReader;
  }
  getScopeForComponent(clazz) {
    var _a;
    if (!this.cache.has(clazz)) {
      const clazzRef = new Reference(clazz);
      const clazzMeta = this.metaReader.getDirectiveMetadata(clazzRef);
      if (clazzMeta === null || !clazzMeta.isComponent || !clazzMeta.isStandalone) {
        this.cache.set(clazz, null);
        return null;
      }
      const dependencies = /* @__PURE__ */ new Set([clazzMeta]);
      const deferredDependencies = /* @__PURE__ */ new Set();
      const seen = /* @__PURE__ */ new Set([clazz]);
      let isPoisoned = clazzMeta.isPoisoned;
      if (clazzMeta.imports !== null) {
        for (const ref of clazzMeta.imports) {
          if (seen.has(ref.node)) {
            continue;
          }
          seen.add(ref.node);
          const dirMeta = this.metaReader.getDirectiveMetadata(ref);
          if (dirMeta !== null) {
            dependencies.add({ ...dirMeta, ref });
            isPoisoned = isPoisoned || dirMeta.isPoisoned || !dirMeta.isStandalone;
            continue;
          }
          const pipeMeta = this.metaReader.getPipeMetadata(ref);
          if (pipeMeta !== null) {
            dependencies.add({ ...pipeMeta, ref });
            isPoisoned = isPoisoned || !pipeMeta.isStandalone;
            continue;
          }
          const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
          if (ngModuleMeta !== null) {
            dependencies.add({ ...ngModuleMeta, ref });
            let ngModuleScope;
            if (ref.node.getSourceFile().isDeclarationFile) {
              ngModuleScope = this.dtsModuleReader.resolve(ref);
            } else {
              ngModuleScope = this.localModuleReader.getScopeOfModule(ref.node);
            }
            if (ngModuleScope === null) {
              isPoisoned = true;
              continue;
            }
            isPoisoned = isPoisoned || ngModuleScope.exported.isPoisoned;
            for (const dep of ngModuleScope.exported.dependencies) {
              if (!seen.has(dep.ref.node)) {
                seen.add(dep.ref.node);
                dependencies.add(dep);
              }
            }
            continue;
          }
          isPoisoned = true;
        }
      }
      if (clazzMeta.deferredImports !== null) {
        for (const ref of clazzMeta.deferredImports) {
          const dirMeta = this.metaReader.getDirectiveMetadata(ref);
          if (dirMeta !== null) {
            deferredDependencies.add({ ...dirMeta, ref, isExplicitlyDeferred: true });
            isPoisoned = isPoisoned || dirMeta.isPoisoned || !dirMeta.isStandalone;
            continue;
          }
          const pipeMeta = this.metaReader.getPipeMetadata(ref);
          if (pipeMeta !== null) {
            deferredDependencies.add({ ...pipeMeta, ref, isExplicitlyDeferred: true });
            isPoisoned = isPoisoned || !pipeMeta.isStandalone;
            continue;
          }
        }
      }
      this.cache.set(clazz, {
        kind: ComponentScopeKind.Standalone,
        component: clazz,
        dependencies: Array.from(dependencies),
        deferredDependencies: Array.from(deferredDependencies),
        isPoisoned,
        schemas: (_a = clazzMeta.schemas) != null ? _a : []
      });
    }
    return this.cache.get(clazz);
  }
  getRemoteScope() {
    return null;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/interpolated_signal_not_invoked/index.mjs
import { ASTWithSource as ASTWithSource3, BindingType, Interpolation, PropertyRead as PropertyRead2, TmplAstBoundAttribute } from "@angular/compiler";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/src/symbol_util.mjs
import ts17 from "typescript";
var SIGNAL_FNS = /* @__PURE__ */ new Set([
  "WritableSignal",
  "Signal",
  "InputSignal",
  "InputSignalWithTransform",
  "ModelSignal"
]);
function isSignalReference(symbol) {
  return (symbol.kind === SymbolKind.Expression || symbol.kind === SymbolKind.Variable || symbol.kind === SymbolKind.LetDeclaration) && (symbol.tsType.symbol !== void 0 && isSignalSymbol(symbol.tsType.symbol) || symbol.tsType.aliasSymbol !== void 0 && isSignalSymbol(symbol.tsType.aliasSymbol));
}
function isSignalSymbol(symbol) {
  const declarations = symbol.getDeclarations();
  return declarations !== void 0 && declarations.some((decl) => {
    const fileName = decl.getSourceFile().fileName;
    return (ts17.isInterfaceDeclaration(decl) || ts17.isTypeAliasDeclaration(decl)) && SIGNAL_FNS.has(decl.name.text) && (fileName.includes("@angular/core") || fileName.includes("angular2/rc/packages/core"));
  });
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/api/api.mjs
import { ASTWithSource as ASTWithSource2, RecursiveAstVisitor as RecursiveAstVisitor2, TmplAstBoundDeferredTrigger as TmplAstBoundDeferredTrigger2 } from "@angular/compiler";
var TemplateCheckWithVisitor = class {
  canVisitStructuralAttributes = true;
  run(ctx, component, template) {
    const visitor = new TemplateVisitor2(ctx, component, this);
    return visitor.getDiagnostics(template);
  }
};
var TemplateVisitor2 = class extends RecursiveAstVisitor2 {
  ctx;
  component;
  check;
  diagnostics = [];
  constructor(ctx, component, check) {
    super();
    this.ctx = ctx;
    this.component = component;
    this.check = check;
  }
  visit(node, context) {
    this.diagnostics.push(...this.check.visitNode(this.ctx, this.component, node));
    node.visit(this);
  }
  visitAllNodes(nodes) {
    for (const node of nodes) {
      this.visit(node);
    }
  }
  visitAst(ast) {
    if (ast instanceof ASTWithSource2) {
      ast = ast.ast;
    }
    this.visit(ast);
  }
  visitElement(element) {
    this.visitAllNodes(element.attributes);
    this.visitAllNodes(element.inputs);
    this.visitAllNodes(element.outputs);
    this.visitAllNodes(element.references);
    this.visitAllNodes(element.children);
  }
  visitTemplate(template) {
    const isInlineTemplate = template.tagName === "ng-template";
    this.visitAllNodes(template.attributes);
    if (isInlineTemplate) {
      this.visitAllNodes(template.inputs);
      this.visitAllNodes(template.outputs);
    }
    if (this.check.canVisitStructuralAttributes || isInlineTemplate) {
      this.visitAllNodes(template.templateAttrs);
    }
    this.visitAllNodes(template.variables);
    this.visitAllNodes(template.references);
    this.visitAllNodes(template.children);
  }
  visitContent(content) {
    this.visitAllNodes(content.children);
  }
  visitVariable(variable) {
  }
  visitReference(reference) {
  }
  visitTextAttribute(attribute) {
  }
  visitUnknownBlock(block) {
  }
  visitBoundAttribute(attribute) {
    this.visitAst(attribute.value);
  }
  visitBoundEvent(attribute) {
    this.visitAst(attribute.handler);
  }
  visitText(text) {
  }
  visitBoundText(text) {
    this.visitAst(text.value);
  }
  visitIcu(icu) {
    Object.keys(icu.vars).forEach((key) => this.visit(icu.vars[key]));
    Object.keys(icu.placeholders).forEach((key) => this.visit(icu.placeholders[key]));
  }
  visitDeferredBlock(deferred) {
    deferred.visitAll(this);
  }
  visitDeferredTrigger(trigger) {
    if (trigger instanceof TmplAstBoundDeferredTrigger2) {
      this.visitAst(trigger.value);
    }
  }
  visitDeferredBlockPlaceholder(block) {
    this.visitAllNodes(block.children);
  }
  visitDeferredBlockError(block) {
    this.visitAllNodes(block.children);
  }
  visitDeferredBlockLoading(block) {
    this.visitAllNodes(block.children);
  }
  visitSwitchBlock(block) {
    this.visitAst(block.expression);
    this.visitAllNodes(block.cases);
  }
  visitSwitchBlockCase(block) {
    block.expression && this.visitAst(block.expression);
    this.visitAllNodes(block.children);
  }
  visitForLoopBlock(block) {
    var _a;
    block.item.visit(this);
    this.visitAllNodes(block.contextVariables);
    this.visitAst(block.expression);
    this.visitAllNodes(block.children);
    (_a = block.empty) == null ? void 0 : _a.visit(this);
  }
  visitForLoopBlockEmpty(block) {
    this.visitAllNodes(block.children);
  }
  visitIfBlock(block) {
    this.visitAllNodes(block.branches);
  }
  visitIfBlockBranch(block) {
    var _a;
    block.expression && this.visitAst(block.expression);
    (_a = block.expressionAlias) == null ? void 0 : _a.visit(this);
    this.visitAllNodes(block.children);
  }
  visitLetDeclaration(decl) {
    this.visitAst(decl.value);
  }
  getDiagnostics(template) {
    this.diagnostics = [];
    this.visitAllNodes(template);
    return this.diagnostics;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/interpolated_signal_not_invoked/index.mjs
var SIGNAL_INSTANCE_PROPERTIES = /* @__PURE__ */ new Set(["set", "update", "asReadonly"]);
var FUNCTION_INSTANCE_PROPERTIES = /* @__PURE__ */ new Set(["name", "length", "prototype"]);
var InterpolatedSignalCheck = class extends TemplateCheckWithVisitor {
  code = ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED;
  visitNode(ctx, component, node) {
    if (node instanceof Interpolation) {
      return node.expressions.filter((item) => item instanceof PropertyRead2).flatMap((item) => buildDiagnosticForSignal(ctx, item, component));
    } else if (node instanceof TmplAstBoundAttribute) {
      const usedDirectives = ctx.templateTypeChecker.getUsedDirectives(component);
      if (usedDirectives !== null && usedDirectives.some((dir) => dir.inputs.getByBindingPropertyName(node.name) !== null)) {
        return [];
      }
      if ((node.type === BindingType.Property || node.type === BindingType.Class || node.type === BindingType.Style || node.type === BindingType.Attribute || node.type === BindingType.Animation) && node.value instanceof ASTWithSource3 && node.value.ast instanceof PropertyRead2) {
        return buildDiagnosticForSignal(ctx, node.value.ast, component);
      }
    }
    return [];
  }
};
function isFunctionInstanceProperty(name) {
  return FUNCTION_INSTANCE_PROPERTIES.has(name);
}
function isSignalInstanceProperty(name) {
  return SIGNAL_INSTANCE_PROPERTIES.has(name);
}
function buildDiagnosticForSignal(ctx, node, component) {
  const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
  if (symbol !== null && symbol.kind === SymbolKind.Expression && isSignalReference(symbol)) {
    const templateMapping = ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbol.tcbLocation);
    const errorString = `${node.name} is a function and should be invoked: ${node.name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }
  const symbolOfReceiver = ctx.templateTypeChecker.getSymbolOfNode(node.receiver, component);
  if ((isFunctionInstanceProperty(node.name) || isSignalInstanceProperty(node.name)) && symbolOfReceiver !== null && symbolOfReceiver.kind === SymbolKind.Expression && isSignalReference(symbolOfReceiver)) {
    const templateMapping = ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbolOfReceiver.tcbLocation);
    const errorString = `${node.receiver.name} is a function and should be invoked: ${node.receiver.name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }
  return [];
}
var factory = {
  code: ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  name: ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED,
  create: () => new InterpolatedSignalCheck()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/invalid_banana_in_box/index.mjs
import { TmplAstBoundEvent } from "@angular/compiler";
var InvalidBananaInBoxCheck = class extends TemplateCheckWithVisitor {
  code = ErrorCode.INVALID_BANANA_IN_BOX;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstBoundEvent))
      return [];
    const name = node.name;
    if (!name.startsWith("[") || !name.endsWith("]"))
      return [];
    const boundSyntax = node.sourceSpan.toString();
    const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);
    const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, `In the two-way binding syntax the parentheses should be inside the brackets, ex. '${expectedBoundSyntax}'.
        Find more at https://angular.dev/guide/templates/two-way-binding`);
    return [diagnostic];
  }
};
var factory2 = {
  code: ErrorCode.INVALID_BANANA_IN_BOX,
  name: ExtendedTemplateDiagnosticName.INVALID_BANANA_IN_BOX,
  create: () => new InvalidBananaInBoxCheck()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/missing_control_flow_directive/index.mjs
import { TmplAstTemplate as TmplAstTemplate2 } from "@angular/compiler";
var KNOWN_CONTROL_FLOW_DIRECTIVES = /* @__PURE__ */ new Map([
  ["ngIf", { directive: "NgIf", builtIn: "@if" }],
  ["ngFor", { directive: "NgFor", builtIn: "@for" }],
  ["ngSwitchCase", { directive: "NgSwitchCase", builtIn: "@switch with @case" }],
  ["ngSwitchDefault", { directive: "NgSwitchDefault", builtIn: "@switch with @default" }]
]);
var MissingControlFlowDirectiveCheck = class extends TemplateCheckWithVisitor {
  code = ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE;
  run(ctx, component, template) {
    const componentMetadata = ctx.templateTypeChecker.getDirectiveMetadata(component);
    if (!componentMetadata || !componentMetadata.isStandalone) {
      return [];
    }
    return super.run(ctx, component, template);
  }
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstTemplate2))
      return [];
    const controlFlowAttr = node.templateAttrs.find((attr) => KNOWN_CONTROL_FLOW_DIRECTIVES.has(attr.name));
    if (!controlFlowAttr)
      return [];
    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
    if (symbol === null || symbol.directives.length > 0) {
      return [];
    }
    const sourceSpan = controlFlowAttr.keySpan || controlFlowAttr.sourceSpan;
    const directiveAndBuiltIn = KNOWN_CONTROL_FLOW_DIRECTIVES.get(controlFlowAttr.name);
    const errorMessage = `The \`*${controlFlowAttr.name}\` directive was used in the template, but neither the \`${directiveAndBuiltIn == null ? void 0 : directiveAndBuiltIn.directive}\` directive nor the \`CommonModule\` was imported. Use Angular's built-in control flow ${directiveAndBuiltIn == null ? void 0 : directiveAndBuiltIn.builtIn} or make sure that either the \`${directiveAndBuiltIn == null ? void 0 : directiveAndBuiltIn.directive}\` directive or the \`CommonModule\` is included in the \`@Component.imports\` array of this component.`;
    const diagnostic = ctx.makeTemplateDiagnostic(sourceSpan, errorMessage);
    return [diagnostic];
  }
};
var factory3 = {
  code: ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE,
  name: ExtendedTemplateDiagnosticName.MISSING_CONTROL_FLOW_DIRECTIVE,
  create: (options) => {
    return new MissingControlFlowDirectiveCheck();
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/missing_ngforof_let/index.mjs
import { TmplAstTemplate as TmplAstTemplate3 } from "@angular/compiler";
var MissingNgForOfLetCheck = class extends TemplateCheckWithVisitor {
  code = ErrorCode.MISSING_NGFOROF_LET;
  visitNode(ctx, component, node) {
    const isTemplate = node instanceof TmplAstTemplate3;
    if (!(node instanceof TmplAstTemplate3)) {
      return [];
    }
    if (node.templateAttrs.length === 0) {
      return [];
    }
    const attr = node.templateAttrs.find((x) => x.name === "ngFor");
    if (attr === void 0) {
      return [];
    }
    if (node.variables.length > 0) {
      return [];
    }
    const errorString = "Your ngFor is missing a value. Did you forget to add the `let` keyword?";
    const diagnostic = ctx.makeTemplateDiagnostic(attr.sourceSpan, errorString);
    return [diagnostic];
  }
};
var factory4 = {
  code: ErrorCode.MISSING_NGFOROF_LET,
  name: ExtendedTemplateDiagnosticName.MISSING_NGFOROF_LET,
  create: () => new MissingNgForOfLetCheck()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/nullish_coalescing_not_nullable/index.mjs
import { Binary } from "@angular/compiler";
import ts18 from "typescript";
var NullishCoalescingNotNullableCheck = class extends TemplateCheckWithVisitor {
  canVisitStructuralAttributes = false;
  code = ErrorCode.NULLISH_COALESCING_NOT_NULLABLE;
  visitNode(ctx, component, node) {
    if (!(node instanceof Binary) || node.operation !== "??")
      return [];
    const symbolLeft = ctx.templateTypeChecker.getSymbolOfNode(node.left, component);
    if (symbolLeft === null || symbolLeft.kind !== SymbolKind.Expression) {
      return [];
    }
    const typeLeft = symbolLeft.tsType;
    if (typeLeft.flags & (ts18.TypeFlags.Any | ts18.TypeFlags.Unknown)) {
      return [];
    }
    if (typeLeft.getNonNullableType() !== typeLeft)
      return [];
    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
    if (symbol.kind !== SymbolKind.Expression) {
      return [];
    }
    const templateMapping = ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbol.tcbLocation);
    if (templateMapping === null) {
      return [];
    }
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, `The left side of this nullish coalescing operation does not include 'null' or 'undefined' in its type, therefore the '??' operator can be safely removed.`);
    return [diagnostic];
  }
};
var factory5 = {
  code: ErrorCode.NULLISH_COALESCING_NOT_NULLABLE,
  name: ExtendedTemplateDiagnosticName.NULLISH_COALESCING_NOT_NULLABLE,
  create: (options) => {
    const strictNullChecks = options.strictNullChecks === void 0 ? !!options.strict : !!options.strictNullChecks;
    if (!strictNullChecks) {
      return null;
    }
    return new NullishCoalescingNotNullableCheck();
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/optional_chain_not_nullable/index.mjs
import { SafeCall, SafeKeyedRead, SafePropertyRead } from "@angular/compiler";
import ts19 from "typescript";
var OptionalChainNotNullableCheck = class extends TemplateCheckWithVisitor {
  canVisitStructuralAttributes = false;
  code = ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE;
  visitNode(ctx, component, node) {
    if (!(node instanceof SafeCall) && !(node instanceof SafePropertyRead) && !(node instanceof SafeKeyedRead))
      return [];
    const symbolLeft = ctx.templateTypeChecker.getSymbolOfNode(node.receiver, component);
    if (symbolLeft === null || symbolLeft.kind !== SymbolKind.Expression) {
      return [];
    }
    const typeLeft = symbolLeft.tsType;
    if (typeLeft.flags & (ts19.TypeFlags.Any | ts19.TypeFlags.Unknown)) {
      return [];
    }
    if (typeLeft.getNonNullableType() !== typeLeft)
      return [];
    const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
    if (symbol.kind !== SymbolKind.Expression) {
      return [];
    }
    const templateMapping = ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(symbol.tcbLocation);
    if (templateMapping === null) {
      return [];
    }
    const advice = node instanceof SafePropertyRead ? `the '?.' operator can be replaced with the '.' operator` : `the '?.' operator can be safely removed`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, `The left side of this optional chain operation does not include 'null' or 'undefined' in its type, therefore ${advice}.`);
    return [diagnostic];
  }
};
var factory6 = {
  code: ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE,
  name: ExtendedTemplateDiagnosticName.OPTIONAL_CHAIN_NOT_NULLABLE,
  create: (options) => {
    const strictNullChecks = options.strictNullChecks === void 0 ? !!options.strict : !!options.strictNullChecks;
    if (!strictNullChecks) {
      return null;
    }
    return new OptionalChainNotNullableCheck();
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/suffix_not_supported/index.mjs
import { TmplAstBoundAttribute as TmplAstBoundAttribute2 } from "@angular/compiler";
var STYLE_SUFFIXES = ["px", "%", "em"];
var SuffixNotSupportedCheck = class extends TemplateCheckWithVisitor {
  code = ErrorCode.SUFFIX_NOT_SUPPORTED;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstBoundAttribute2))
      return [];
    if (!node.keySpan.toString().startsWith("attr.") || !STYLE_SUFFIXES.some((suffix) => node.name.endsWith(`.${suffix}`))) {
      return [];
    }
    const diagnostic = ctx.makeTemplateDiagnostic(node.keySpan, `The ${STYLE_SUFFIXES.map((suffix) => `'.${suffix}'`).join(", ")} suffixes are only supported on style bindings.`);
    return [diagnostic];
  }
};
var factory7 = {
  code: ErrorCode.SUFFIX_NOT_SUPPORTED,
  name: ExtendedTemplateDiagnosticName.SUFFIX_NOT_SUPPORTED,
  create: () => new SuffixNotSupportedCheck()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/text_attribute_not_binding/index.mjs
import { TmplAstTextAttribute } from "@angular/compiler";
var TextAttributeNotBindingSpec = class extends TemplateCheckWithVisitor {
  code = ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstTextAttribute))
      return [];
    const name = node.name;
    if (!name.startsWith("attr.") && !name.startsWith("style.") && !name.startsWith("class.")) {
      return [];
    }
    let errorString;
    if (name.startsWith("attr.")) {
      const staticAttr = name.replace("attr.", "");
      errorString = `Static attributes should be written without the 'attr.' prefix.`;
      if (node.value) {
        errorString += ` For example, ${staticAttr}="${node.value}".`;
      }
    } else {
      const expectedKey = `[${name}]`;
      const expectedValue = node.value === "true" || node.value === "false" ? node.value : `'${node.value}'`;
      errorString = "Attribute, style, and class bindings should be enclosed with square braces.";
      if (node.value) {
        errorString += ` For example, '${expectedKey}="${expectedValue}"'.`;
      }
    }
    const diagnostic = ctx.makeTemplateDiagnostic(node.sourceSpan, errorString);
    return [diagnostic];
  }
};
var factory8 = {
  code: ErrorCode.TEXT_ATTRIBUTE_NOT_BINDING,
  name: ExtendedTemplateDiagnosticName.TEXT_ATTRIBUTE_NOT_BINDING,
  create: () => new TextAttributeNotBindingSpec()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/uninvoked_function_in_event_binding/index.mjs
import { ASTWithSource as ASTWithSource4, Call, Chain, Conditional, ParsedEventType, PropertyRead as PropertyRead3, SafeCall as SafeCall2, SafePropertyRead as SafePropertyRead2, TmplAstBoundEvent as TmplAstBoundEvent2 } from "@angular/compiler";
var UninvokedFunctionInEventBindingSpec = class extends TemplateCheckWithVisitor {
  code = ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING;
  visitNode(ctx, component, node) {
    if (!(node instanceof TmplAstBoundEvent2))
      return [];
    if (node.type !== ParsedEventType.Regular && node.type !== ParsedEventType.Animation)
      return [];
    if (!(node.handler instanceof ASTWithSource4))
      return [];
    const sourceExpressionText = node.handler.source || "";
    if (node.handler.ast instanceof Chain) {
      return node.handler.ast.expressions.flatMap((expression) => assertExpressionInvoked(expression, component, node, sourceExpressionText, ctx));
    }
    if (node.handler.ast instanceof Conditional) {
      const { trueExp, falseExp } = node.handler.ast;
      return [trueExp, falseExp].flatMap((expression) => assertExpressionInvoked(expression, component, node, sourceExpressionText, ctx));
    }
    return assertExpressionInvoked(node.handler.ast, component, node, sourceExpressionText, ctx);
  }
};
function assertExpressionInvoked(expression, component, node, expressionText, ctx) {
  var _a;
  if (expression instanceof Call || expression instanceof SafeCall2) {
    return [];
  }
  if (!(expression instanceof PropertyRead3) && !(expression instanceof SafePropertyRead2)) {
    return [];
  }
  const symbol = ctx.templateTypeChecker.getSymbolOfNode(expression, component);
  if (symbol !== null && symbol.kind === SymbolKind.Expression) {
    if (((_a = symbol.tsType.getCallSignatures()) == null ? void 0 : _a.length) > 0) {
      const fullExpressionText = generateStringFromExpression(expression, expressionText);
      const errorString = `Function in event binding should be invoked: ${fullExpressionText}()`;
      return [ctx.makeTemplateDiagnostic(node.sourceSpan, errorString)];
    }
  }
  return [];
}
function generateStringFromExpression(expression, source) {
  return source.substring(expression.span.start, expression.span.end);
}
var factory9 = {
  code: ErrorCode.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  name: ExtendedTemplateDiagnosticName.UNINVOKED_FUNCTION_IN_EVENT_BINDING,
  create: () => new UninvokedFunctionInEventBindingSpec()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/checks/unused_let_declaration/index.mjs
import { AST, ASTWithSource as ASTWithSource5, TmplAstLetDeclaration } from "@angular/compiler";
var UnusedLetDeclarationCheck = class extends TemplateCheckWithVisitor {
  code = ErrorCode.UNUSED_LET_DECLARATION;
  analysis = /* @__PURE__ */ new Map();
  run(ctx, component, template) {
    super.run(ctx, component, template);
    const diagnostics = [];
    const { allLetDeclarations, usedLetDeclarations } = this.getAnalysis(component);
    for (const decl of allLetDeclarations) {
      if (!usedLetDeclarations.has(decl)) {
        diagnostics.push(ctx.makeTemplateDiagnostic(decl.sourceSpan, `@let ${decl.name} is declared but its value is never read.`));
      }
    }
    this.analysis.clear();
    return diagnostics;
  }
  visitNode(ctx, component, node) {
    if (node instanceof TmplAstLetDeclaration) {
      this.getAnalysis(component).allLetDeclarations.add(node);
    } else if (node instanceof AST) {
      const unwrappedNode = node instanceof ASTWithSource5 ? node.ast : node;
      const target = ctx.templateTypeChecker.getExpressionTarget(unwrappedNode, component);
      if (target !== null && target instanceof TmplAstLetDeclaration) {
        this.getAnalysis(component).usedLetDeclarations.add(target);
      }
    }
    return [];
  }
  getAnalysis(node) {
    if (!this.analysis.has(node)) {
      this.analysis.set(node, { allLetDeclarations: /* @__PURE__ */ new Set(), usedLetDeclarations: /* @__PURE__ */ new Set() });
    }
    return this.analysis.get(node);
  }
};
var factory10 = {
  code: ErrorCode.UNUSED_LET_DECLARATION,
  name: ExtendedTemplateDiagnosticName.UNUSED_LET_DECLARATION,
  create: () => new UnusedLetDeclarationCheck()
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/src/extended_template_checker.mjs
import ts20 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/core/api/src/public_options.mjs
var DiagnosticCategoryLabel;
(function(DiagnosticCategoryLabel2) {
  DiagnosticCategoryLabel2["Warning"] = "warning";
  DiagnosticCategoryLabel2["Error"] = "error";
  DiagnosticCategoryLabel2["Suppress"] = "suppress";
})(DiagnosticCategoryLabel || (DiagnosticCategoryLabel = {}));

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/src/extended_template_checker.mjs
var ExtendedTemplateCheckerImpl = class {
  partialCtx;
  templateChecks;
  constructor(templateTypeChecker, typeChecker, templateCheckFactories, options) {
    var _a, _b, _c, _d, _e;
    this.partialCtx = { templateTypeChecker, typeChecker };
    this.templateChecks = /* @__PURE__ */ new Map();
    for (const factory11 of templateCheckFactories) {
      const category = diagnosticLabelToCategory((_e = (_d = (_b = (_a = options == null ? void 0 : options.extendedDiagnostics) == null ? void 0 : _a.checks) == null ? void 0 : _b[factory11.name]) != null ? _d : (_c = options == null ? void 0 : options.extendedDiagnostics) == null ? void 0 : _c.defaultCategory) != null ? _e : DiagnosticCategoryLabel.Warning);
      if (category === null) {
        continue;
      }
      const check = factory11.create(options);
      if (check === null) {
        continue;
      }
      this.templateChecks.set(check, category);
    }
  }
  getDiagnosticsForComponent(component) {
    const template = this.partialCtx.templateTypeChecker.getTemplate(component);
    if (template === null) {
      return [];
    }
    const diagnostics = [];
    for (const [check, category] of this.templateChecks.entries()) {
      const ctx = {
        ...this.partialCtx,
        makeTemplateDiagnostic: (span, message, relatedInformation) => {
          return this.partialCtx.templateTypeChecker.makeTemplateDiagnostic(component, span, category, check.code, message, relatedInformation);
        }
      };
      diagnostics.push(...check.run(ctx, component, template));
    }
    return diagnostics;
  }
};
function diagnosticLabelToCategory(label) {
  switch (label) {
    case DiagnosticCategoryLabel.Warning:
      return ts20.DiagnosticCategory.Warning;
    case DiagnosticCategoryLabel.Error:
      return ts20.DiagnosticCategory.Error;
    case DiagnosticCategoryLabel.Suppress:
      return null;
    default:
      return assertNever(label);
  }
}
function assertNever(value) {
  throw new Error(`Unexpected call to 'assertNever()' with value:
${value}`);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/extended/index.mjs
var ALL_DIAGNOSTIC_FACTORIES = [
  factory2,
  factory5,
  factory6,
  factory3,
  factory8,
  factory4,
  factory7,
  factory,
  factory9,
  factory10
];
var SUPPORTED_DIAGNOSTIC_NAMES = /* @__PURE__ */ new Set([
  ExtendedTemplateDiagnosticName.CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION,
  ExtendedTemplateDiagnosticName.UNUSED_STANDALONE_IMPORTS,
  ...ALL_DIAGNOSTIC_FACTORIES.map((factory11) => factory11.name)
]);

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/typecheck/template_semantics/src/template_semantics_checker.mjs
import { ASTWithSource as ASTWithSource6, ImplicitReceiver as ImplicitReceiver2, ParsedEventType as ParsedEventType2, RecursiveAstVisitor as RecursiveAstVisitor3, TmplAstBoundEvent as TmplAstBoundEvent3, TmplAstLetDeclaration as TmplAstLetDeclaration2, TmplAstRecursiveVisitor as TmplAstRecursiveVisitor2, TmplAstVariable as TmplAstVariable2 } from "@angular/compiler";
import ts21 from "typescript";
var TemplateSemanticsCheckerImpl = class {
  templateTypeChecker;
  constructor(templateTypeChecker) {
    this.templateTypeChecker = templateTypeChecker;
  }
  getDiagnosticsForComponent(component) {
    const template = this.templateTypeChecker.getTemplate(component);
    return template !== null ? TemplateSemanticsVisitor.visit(template, component, this.templateTypeChecker) : [];
  }
};
var TemplateSemanticsVisitor = class extends TmplAstRecursiveVisitor2 {
  expressionVisitor;
  constructor(expressionVisitor) {
    super();
    this.expressionVisitor = expressionVisitor;
  }
  static visit(nodes, component, templateTypeChecker) {
    const diagnostics = [];
    const expressionVisitor = new ExpressionsSemanticsVisitor(templateTypeChecker, component, diagnostics);
    const templateVisitor = new TemplateSemanticsVisitor(expressionVisitor);
    nodes.forEach((node) => node.visit(templateVisitor));
    return diagnostics;
  }
  visitBoundEvent(event) {
    super.visitBoundEvent(event);
    event.handler.visit(this.expressionVisitor, event);
  }
};
var ExpressionsSemanticsVisitor = class extends RecursiveAstVisitor3 {
  templateTypeChecker;
  component;
  diagnostics;
  constructor(templateTypeChecker, component, diagnostics) {
    super();
    this.templateTypeChecker = templateTypeChecker;
    this.component = component;
    this.diagnostics = diagnostics;
  }
  visitPropertyWrite(ast, context) {
    super.visitPropertyWrite(ast, context);
    this.checkForIllegalWriteInEventBinding(ast, context);
  }
  visitPropertyRead(ast, context) {
    super.visitPropertyRead(ast, context);
    this.checkForIllegalWriteInTwoWayBinding(ast, context);
  }
  checkForIllegalWriteInEventBinding(ast, context) {
    if (!(context instanceof TmplAstBoundEvent3) || !(ast.receiver instanceof ImplicitReceiver2)) {
      return;
    }
    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    if (target instanceof TmplAstVariable2) {
      const errorMessage = `Cannot use variable '${target.name}' as the left-hand side of an assignment expression. Template variables are read-only.`;
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }
  checkForIllegalWriteInTwoWayBinding(ast, context) {
    if (!(context instanceof TmplAstBoundEvent3) || context.type !== ParsedEventType2.TwoWay || !(ast.receiver instanceof ImplicitReceiver2) || ast !== unwrapAstWithSource(context.handler)) {
      return;
    }
    const target = this.templateTypeChecker.getExpressionTarget(ast, this.component);
    const isVariable = target instanceof TmplAstVariable2;
    const isLet = target instanceof TmplAstLetDeclaration2;
    if (!isVariable && !isLet) {
      return;
    }
    const symbol = this.templateTypeChecker.getSymbolOfNode(target, this.component);
    if (symbol !== null && !isSignalReference(symbol)) {
      let errorMessage;
      if (isVariable) {
        errorMessage = `Cannot use a non-signal variable '${target.name}' in a two-way binding expression. Template variables are read-only.`;
      } else {
        errorMessage = `Cannot use non-signal @let declaration '${target.name}' in a two-way binding expression. @let declarations are read-only.`;
      }
      this.diagnostics.push(this.makeIllegalTemplateVarDiagnostic(target, context, errorMessage));
    }
  }
  makeIllegalTemplateVarDiagnostic(target, expressionNode, errorMessage) {
    const span = target instanceof TmplAstVariable2 ? target.valueSpan || target.sourceSpan : target.sourceSpan;
    return this.templateTypeChecker.makeTemplateDiagnostic(this.component, expressionNode.handlerSpan, ts21.DiagnosticCategory.Error, ngErrorCode(ErrorCode.WRITE_TO_READ_ONLY_VARIABLE), errorMessage, [
      {
        text: `'${target.name}' is declared here.`,
        start: span.start.offset,
        end: span.end.offset,
        sourceFile: this.component.getSourceFile()
      }
    ]);
  }
};
function unwrapAstWithSource(ast) {
  return ast instanceof ASTWithSource6 ? ast.ast : ast;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/validation/src/rules/initializer_api_usage_rule.mjs
import ts22 from "typescript";
var APIS_TO_CHECK = [
  INPUT_INITIALIZER_FN,
  MODEL_INITIALIZER_FN,
  ...OUTPUT_INITIALIZER_FNS,
  ...QUERY_INITIALIZER_FNS
];
var InitializerApiUsageRule = class {
  reflector;
  importedSymbolsTracker;
  constructor(reflector, importedSymbolsTracker) {
    this.reflector = reflector;
    this.importedSymbolsTracker = importedSymbolsTracker;
  }
  shouldCheck(sourceFile) {
    return APIS_TO_CHECK.some(({ functionName, owningModule }) => {
      return this.importedSymbolsTracker.hasNamedImport(sourceFile, functionName, owningModule) || this.importedSymbolsTracker.hasNamespaceImport(sourceFile, owningModule);
    });
  }
  checkNode(node) {
    if (!ts22.isCallExpression(node)) {
      return null;
    }
    while (node.parent && (ts22.isParenthesizedExpression(node.parent) || ts22.isAsExpression(node.parent))) {
      node = node.parent;
    }
    if (!node.parent || !ts22.isCallExpression(node)) {
      return null;
    }
    const identifiedInitializer = tryParseInitializerApi(APIS_TO_CHECK, node, this.reflector, this.importedSymbolsTracker);
    if (identifiedInitializer === null) {
      return null;
    }
    const functionName = identifiedInitializer.api.functionName + (identifiedInitializer.isRequired ? ".required" : "");
    if (ts22.isPropertyDeclaration(node.parent) && node.parent.initializer === node) {
      let closestClass = node.parent;
      while (closestClass && !ts22.isClassDeclaration(closestClass)) {
        closestClass = closestClass.parent;
      }
      if (closestClass && ts22.isClassDeclaration(closestClass)) {
        const decorators = this.reflector.getDecoratorsOfDeclaration(closestClass);
        const isComponentOrDirective = decorators !== null && decorators.some((decorator) => {
          var _a;
          return ((_a = decorator.import) == null ? void 0 : _a.from) === "@angular/core" && (decorator.name === "Component" || decorator.name === "Directive");
        });
        return isComponentOrDirective ? null : makeDiagnostic(ErrorCode.UNSUPPORTED_INITIALIZER_API_USAGE, node, `Unsupported call to the ${functionName} function. This function can only be used as the initializer of a property on a @Component or @Directive class.`);
      }
    }
    return makeDiagnostic(ErrorCode.UNSUPPORTED_INITIALIZER_API_USAGE, node, `Unsupported call to the ${functionName} function. This function can only be called in the initializer of a class member.`);
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/validation/src/rules/unused_standalone_imports_rule.mjs
import ts23 from "typescript";
var UnusedStandaloneImportsRule = class {
  templateTypeChecker;
  typeCheckingConfig;
  importedSymbolsTracker;
  constructor(templateTypeChecker, typeCheckingConfig, importedSymbolsTracker) {
    this.templateTypeChecker = templateTypeChecker;
    this.typeCheckingConfig = typeCheckingConfig;
    this.importedSymbolsTracker = importedSymbolsTracker;
  }
  shouldCheck(sourceFile) {
    return this.typeCheckingConfig.unusedStandaloneImports !== "suppress" && (this.importedSymbolsTracker.hasNamedImport(sourceFile, "Component", "@angular/core") || this.importedSymbolsTracker.hasNamespaceImport(sourceFile, "@angular/core"));
  }
  checkNode(node) {
    if (!ts23.isClassDeclaration(node)) {
      return null;
    }
    const metadata = this.templateTypeChecker.getDirectiveMetadata(node);
    if (!metadata || !metadata.isStandalone || metadata.rawImports === null || metadata.imports === null || metadata.imports.length === 0) {
      return null;
    }
    const usedDirectives = this.templateTypeChecker.getUsedDirectives(node);
    const usedPipes = this.templateTypeChecker.getUsedPipes(node);
    if (!usedDirectives || !usedPipes) {
      return null;
    }
    const unused = this.getUnusedSymbols(metadata, new Set(usedDirectives.map((dir) => dir.ref.node)), new Set(usedPipes));
    if (unused === null) {
      return null;
    }
    const propertyAssignment = closestNode(metadata.rawImports, ts23.isPropertyAssignment);
    const category = this.typeCheckingConfig.unusedStandaloneImports === "error" ? ts23.DiagnosticCategory.Error : ts23.DiagnosticCategory.Warning;
    if (unused.length === metadata.imports.length && propertyAssignment !== null) {
      return makeDiagnostic(ErrorCode.UNUSED_STANDALONE_IMPORTS, propertyAssignment.name, "All imports are unused", void 0, category);
    }
    return unused.map((ref) => {
      const diagnosticNode = ref.getIdentityInExpression(metadata.rawImports) || ref.getIdentityIn(node.getSourceFile()) || metadata.rawImports;
      return makeDiagnostic(ErrorCode.UNUSED_STANDALONE_IMPORTS, diagnosticNode, `${ref.node.name.text} is not used within the template of ${metadata.name}`, void 0, category);
    });
  }
  getUnusedSymbols(metadata, usedDirectives, usedPipes) {
    const { imports, rawImports } = metadata;
    if (imports === null || rawImports === null) {
      return null;
    }
    let unused = null;
    for (const current of imports) {
      const currentNode = current.node;
      const dirMeta = this.templateTypeChecker.getDirectiveMetadata(currentNode);
      if (dirMeta !== null) {
        if (dirMeta.isStandalone && !usedDirectives.has(currentNode) && !this.isPotentialSharedReference(current, rawImports)) {
          unused != null ? unused : unused = [];
          unused.push(current);
        }
        continue;
      }
      const pipeMeta = this.templateTypeChecker.getPipeMetadata(currentNode);
      if (pipeMeta !== null && pipeMeta.isStandalone && !usedPipes.has(pipeMeta.name) && !this.isPotentialSharedReference(current, rawImports)) {
        unused != null ? unused : unused = [];
        unused.push(current);
      }
    }
    return unused;
  }
  isPotentialSharedReference(reference, rawImports) {
    var _a, _b;
    if (reference.getIdentityInExpression(rawImports) !== null) {
      return false;
    }
    let current = reference.getIdentityIn(rawImports.getSourceFile());
    while (current !== null) {
      if (ts23.isVariableStatement(current)) {
        return !!((_a = current.modifiers) == null ? void 0 : _a.some((m) => m.kind === ts23.SyntaxKind.ExportKeyword));
      }
      current = (_b = current.parent) != null ? _b : null;
    }
    return true;
  }
};
function closestNode(start, predicate) {
  let current = start.parent;
  while (current) {
    if (predicate(current)) {
      return current;
    } else {
      current = current.parent;
    }
  }
  return null;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/validation/src/config.mjs
var UNUSED_STANDALONE_IMPORTS_RULE_ENABLED = true;

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/validation/src/source_file_validator.mjs
var SourceFileValidator = class {
  rules;
  constructor(reflector, importedSymbolsTracker, templateTypeChecker, typeCheckingConfig) {
    this.rules = [new InitializerApiUsageRule(reflector, importedSymbolsTracker)];
    if (UNUSED_STANDALONE_IMPORTS_RULE_ENABLED) {
      this.rules.push(new UnusedStandaloneImportsRule(templateTypeChecker, typeCheckingConfig, importedSymbolsTracker));
    }
  }
  getDiagnosticsForFile(sourceFile) {
    if (sourceFile.isDeclarationFile || sourceFile.fileName.endsWith(".ngtypecheck.ts")) {
      return null;
    }
    let rulesToRun = null;
    for (const rule of this.rules) {
      if (rule.shouldCheck(sourceFile)) {
        rulesToRun != null ? rulesToRun : rulesToRun = [];
        rulesToRun.push(rule);
      }
    }
    if (rulesToRun === null) {
      return null;
    }
    let fileDiagnostics = null;
    sourceFile.forEachChild(function walk(node) {
      for (const rule of rulesToRun) {
        const nodeDiagnostics = rule.checkNode(node);
        if (nodeDiagnostics !== null) {
          fileDiagnostics != null ? fileDiagnostics : fileDiagnostics = [];
          if (Array.isArray(nodeDiagnostics)) {
            fileDiagnostics.push(...nodeDiagnostics);
          } else {
            fileDiagnostics.push(nodeDiagnostics);
          }
        }
      }
      node.forEachChild(walk);
    });
    return fileDiagnostics;
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/core/src/core_version.mjs
function coreHasSymbol(program, symbol) {
  const checker = program.getTypeChecker();
  for (const sf of program.getSourceFiles().filter(isMaybeCore)) {
    const sym = checker.getSymbolAtLocation(sf);
    if (sym === void 0 || sym.exports === void 0) {
      continue;
    }
    if (!sym.exports.has("\u0275\u0275template")) {
      continue;
    }
    return sym.exports.has(symbol.name);
  }
  return null;
}
function isMaybeCore(sf) {
  return sf.isDeclarationFile && sf.fileName.includes("@angular/core") && sf.fileName.endsWith("index.d.ts");
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/core/src/feature_detection.mjs
import semver from "semver";
function coreVersionSupportsFeature(coreVersion, minVersion) {
  if (coreVersion === `0.0.0-${"PLACEHOLDER"}`) {
    return true;
  }
  return semver.satisfies(coreVersion, minVersion, { includePrerelease: true });
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/core/src/compiler.mjs
var CompilationTicketKind;
(function(CompilationTicketKind2) {
  CompilationTicketKind2[CompilationTicketKind2["Fresh"] = 0] = "Fresh";
  CompilationTicketKind2[CompilationTicketKind2["IncrementalTypeScript"] = 1] = "IncrementalTypeScript";
  CompilationTicketKind2[CompilationTicketKind2["IncrementalResource"] = 2] = "IncrementalResource";
})(CompilationTicketKind || (CompilationTicketKind = {}));
function freshCompilationTicket(tsProgram, options, incrementalBuildStrategy, programDriver, perfRecorder, enableTemplateTypeChecker, usePoisonedData) {
  return {
    kind: CompilationTicketKind.Fresh,
    tsProgram,
    options,
    incrementalBuildStrategy,
    programDriver,
    enableTemplateTypeChecker,
    usePoisonedData,
    perfRecorder: perfRecorder != null ? perfRecorder : ActivePerfRecorder.zeroedToNow()
  };
}
function incrementalFromCompilerTicket(oldCompiler, newProgram, incrementalBuildStrategy, programDriver, modifiedResourceFiles, perfRecorder) {
  const oldProgram = oldCompiler.getCurrentProgram();
  const oldState = oldCompiler.incrementalStrategy.getIncrementalState(oldProgram);
  if (oldState === null) {
    return freshCompilationTicket(newProgram, oldCompiler.options, incrementalBuildStrategy, programDriver, perfRecorder, oldCompiler.enableTemplateTypeChecker, oldCompiler.usePoisonedData);
  }
  if (perfRecorder === null) {
    perfRecorder = ActivePerfRecorder.zeroedToNow();
  }
  const incrementalCompilation = IncrementalCompilation.incremental(newProgram, versionMapFromProgram(newProgram, programDriver), oldProgram, oldState, modifiedResourceFiles, perfRecorder);
  return {
    kind: CompilationTicketKind.IncrementalTypeScript,
    enableTemplateTypeChecker: oldCompiler.enableTemplateTypeChecker,
    usePoisonedData: oldCompiler.usePoisonedData,
    options: oldCompiler.options,
    incrementalBuildStrategy,
    incrementalCompilation,
    programDriver,
    newProgram,
    perfRecorder
  };
}
function incrementalFromStateTicket(oldProgram, oldState, newProgram, options, incrementalBuildStrategy, programDriver, modifiedResourceFiles, perfRecorder, enableTemplateTypeChecker, usePoisonedData) {
  if (perfRecorder === null) {
    perfRecorder = ActivePerfRecorder.zeroedToNow();
  }
  const incrementalCompilation = IncrementalCompilation.incremental(newProgram, versionMapFromProgram(newProgram, programDriver), oldProgram, oldState, modifiedResourceFiles, perfRecorder);
  return {
    kind: CompilationTicketKind.IncrementalTypeScript,
    newProgram,
    options,
    incrementalBuildStrategy,
    incrementalCompilation,
    programDriver,
    enableTemplateTypeChecker,
    usePoisonedData,
    perfRecorder
  };
}
var NgCompiler = class {
  adapter;
  options;
  inputProgram;
  programDriver;
  incrementalStrategy;
  incrementalCompilation;
  usePoisonedData;
  livePerfRecorder;
  compilation = null;
  constructionDiagnostics = [];
  nonTemplateDiagnostics = null;
  closureCompilerEnabled;
  currentProgram;
  entryPoint;
  moduleResolver;
  resourceManager;
  cycleAnalyzer;
  ignoreForDiagnostics;
  ignoreForEmit;
  enableTemplateTypeChecker;
  enableBlockSyntax;
  enableLetSyntax;
  angularCoreVersion;
  enableHmr;
  implicitStandaloneValue;
  delegatingPerfRecorder;
  static fromTicket(ticket, adapter) {
    switch (ticket.kind) {
      case CompilationTicketKind.Fresh:
        return new NgCompiler(adapter, ticket.options, ticket.tsProgram, ticket.programDriver, ticket.incrementalBuildStrategy, IncrementalCompilation.fresh(ticket.tsProgram, versionMapFromProgram(ticket.tsProgram, ticket.programDriver)), ticket.enableTemplateTypeChecker, ticket.usePoisonedData, ticket.perfRecorder);
      case CompilationTicketKind.IncrementalTypeScript:
        return new NgCompiler(adapter, ticket.options, ticket.newProgram, ticket.programDriver, ticket.incrementalBuildStrategy, ticket.incrementalCompilation, ticket.enableTemplateTypeChecker, ticket.usePoisonedData, ticket.perfRecorder);
      case CompilationTicketKind.IncrementalResource:
        const compiler = ticket.compiler;
        compiler.updateWithChangedResources(ticket.modifiedResourceFiles, ticket.perfRecorder);
        return compiler;
    }
  }
  constructor(adapter, options, inputProgram, programDriver, incrementalStrategy, incrementalCompilation, enableTemplateTypeChecker, usePoisonedData, livePerfRecorder) {
    var _a, _b, _c;
    this.adapter = adapter;
    this.options = options;
    this.inputProgram = inputProgram;
    this.programDriver = programDriver;
    this.incrementalStrategy = incrementalStrategy;
    this.incrementalCompilation = incrementalCompilation;
    this.usePoisonedData = usePoisonedData;
    this.livePerfRecorder = livePerfRecorder;
    this.angularCoreVersion = (_a = options["_angularCoreVersion"]) != null ? _a : null;
    this.delegatingPerfRecorder = new DelegatingPerfRecorder(this.perfRecorder);
    this.usePoisonedData = usePoisonedData || !!options._compilePoisonedComponents;
    this.enableTemplateTypeChecker = enableTemplateTypeChecker || !!options._enableTemplateTypeChecker;
    this.enableBlockSyntax = (_b = options["_enableBlockSyntax"]) != null ? _b : true;
    this.enableLetSyntax = (_c = options["_enableLetSyntax"]) != null ? _c : true;
    this.implicitStandaloneValue = this.angularCoreVersion === null || coreVersionSupportsFeature(this.angularCoreVersion, ">= 19.0.0");
    this.enableHmr = !!options["_enableHmr"];
    this.constructionDiagnostics.push(...this.adapter.constructionDiagnostics, ...verifyCompatibleTypeCheckOptions(this.options));
    this.currentProgram = inputProgram;
    this.closureCompilerEnabled = !!this.options.annotateForClosureCompiler;
    this.entryPoint = adapter.entryPoint !== null ? getSourceFileOrNull(inputProgram, adapter.entryPoint) : null;
    const moduleResolutionCache = ts24.createModuleResolutionCache(
      this.adapter.getCurrentDirectory(),
      this.adapter.getCanonicalFileName.bind(this.adapter)
    );
    this.moduleResolver = new ModuleResolver(inputProgram, this.options, this.adapter, moduleResolutionCache);
    this.resourceManager = new AdapterResourceLoader(adapter, this.options);
    this.cycleAnalyzer = new CycleAnalyzer(new ImportGraph(inputProgram.getTypeChecker(), this.delegatingPerfRecorder));
    this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, inputProgram);
    this.ignoreForDiagnostics = new Set(inputProgram.getSourceFiles().filter((sf) => this.adapter.isShim(sf)));
    this.ignoreForEmit = this.adapter.ignoreForEmit;
    let dtsFileCount = 0;
    let nonDtsFileCount = 0;
    for (const sf of inputProgram.getSourceFiles()) {
      if (sf.isDeclarationFile) {
        dtsFileCount++;
      } else {
        nonDtsFileCount++;
      }
    }
    livePerfRecorder.eventCount(PerfEvent.InputDtsFile, dtsFileCount);
    livePerfRecorder.eventCount(PerfEvent.InputTsFile, nonDtsFileCount);
  }
  get perfRecorder() {
    return this.livePerfRecorder;
  }
  updateWithChangedResources(changedResources, perfRecorder) {
    this.livePerfRecorder = perfRecorder;
    this.delegatingPerfRecorder.target = perfRecorder;
    perfRecorder.inPhase(PerfPhase.ResourceUpdate, () => {
      if (this.compilation === null) {
        return;
      }
      this.resourceManager.invalidate();
      const classesToUpdate = /* @__PURE__ */ new Set();
      for (const resourceFile of changedResources) {
        for (const templateClass of this.getComponentsWithTemplateFile(resourceFile)) {
          classesToUpdate.add(templateClass);
        }
        for (const styleClass of this.getComponentsWithStyleFile(resourceFile)) {
          classesToUpdate.add(styleClass);
        }
      }
      for (const clazz of classesToUpdate) {
        this.compilation.traitCompiler.updateResources(clazz);
        if (!ts24.isClassDeclaration(clazz)) {
          continue;
        }
        this.compilation.templateTypeChecker.invalidateClass(clazz);
      }
    });
  }
  getResourceDependencies(file) {
    this.ensureAnalyzed();
    return this.incrementalCompilation.depGraph.getResourceDependencies(file);
  }
  getDiagnostics() {
    const diagnostics = [...this.getNonTemplateDiagnostics()];
    try {
      diagnostics.push(...this.getTemplateDiagnostics(), ...this.runAdditionalChecks());
    } catch (err) {
      if (!isFatalDiagnosticError(err)) {
        throw err;
      }
      diagnostics.push(err.toDiagnostic());
    }
    return this.addMessageTextDetails(diagnostics);
  }
  getDiagnosticsForFile(file, optimizeFor) {
    const diagnostics = [
      ...this.getNonTemplateDiagnostics().filter((diag) => diag.file === file)
    ];
    try {
      diagnostics.push(...this.getTemplateDiagnosticsForFile(file, optimizeFor), ...this.runAdditionalChecks(file));
    } catch (err) {
      if (!isFatalDiagnosticError(err)) {
        throw err;
      }
      diagnostics.push(err.toDiagnostic());
    }
    return this.addMessageTextDetails(diagnostics);
  }
  getDiagnosticsForComponent(component) {
    const compilation = this.ensureAnalyzed();
    const ttc = compilation.templateTypeChecker;
    const diagnostics = [];
    try {
      diagnostics.push(...ttc.getDiagnosticsForComponent(component));
      const { extendedTemplateChecker, templateSemanticsChecker } = compilation;
      if (templateSemanticsChecker !== null) {
        diagnostics.push(...templateSemanticsChecker.getDiagnosticsForComponent(component));
      }
      if (this.options.strictTemplates && extendedTemplateChecker !== null) {
        diagnostics.push(...extendedTemplateChecker.getDiagnosticsForComponent(component));
      }
    } catch (err) {
      if (!isFatalDiagnosticError(err)) {
        throw err;
      }
      diagnostics.push(err.toDiagnostic());
    }
    return this.addMessageTextDetails(diagnostics);
  }
  addMessageTextDetails(diagnostics) {
    return diagnostics.map((diag) => {
      if (diag.code && COMPILER_ERRORS_WITH_GUIDES.has(ngErrorCode(diag.code))) {
        return {
          ...diag,
          messageText: diag.messageText + `. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG${ngErrorCode(diag.code)}`
        };
      }
      return diag;
    });
  }
  getOptionDiagnostics() {
    return this.constructionDiagnostics;
  }
  getCurrentProgram() {
    return this.currentProgram;
  }
  getTemplateTypeChecker() {
    if (!this.enableTemplateTypeChecker) {
      throw new Error("The `TemplateTypeChecker` does not work without `enableTemplateTypeChecker`.");
    }
    return this.ensureAnalyzed().templateTypeChecker;
  }
  getComponentsWithTemplateFile(templateFilePath) {
    const { resourceRegistry } = this.ensureAnalyzed();
    return resourceRegistry.getComponentsWithTemplate(resolve(templateFilePath));
  }
  getComponentsWithStyleFile(styleFilePath) {
    const { resourceRegistry } = this.ensureAnalyzed();
    return resourceRegistry.getComponentsWithStyle(resolve(styleFilePath));
  }
  getComponentResources(classDecl) {
    if (!isNamedClassDeclaration(classDecl)) {
      return null;
    }
    const { resourceRegistry } = this.ensureAnalyzed();
    const styles = resourceRegistry.getStyles(classDecl);
    const template = resourceRegistry.getTemplate(classDecl);
    if (template === null) {
      return null;
    }
    return { styles, template };
  }
  getMeta(classDecl) {
    var _a;
    if (!isNamedClassDeclaration(classDecl)) {
      return null;
    }
    const ref = new Reference(classDecl);
    const { metaReader } = this.ensureAnalyzed();
    const meta = (_a = metaReader.getPipeMetadata(ref)) != null ? _a : metaReader.getDirectiveMetadata(ref);
    if (meta === null) {
      return null;
    }
    return meta;
  }
  async analyzeAsync() {
    if (this.compilation !== null) {
      return;
    }
    await this.perfRecorder.inPhase(PerfPhase.Analysis, async () => {
      this.compilation = this.makeCompilation();
      const promises = [];
      for (const sf of this.inputProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }
        let analysisPromise = this.compilation.traitCompiler.analyzeAsync(sf);
        if (analysisPromise !== void 0) {
          promises.push(analysisPromise);
        }
      }
      await Promise.all(promises);
      this.perfRecorder.memory(PerfCheckpoint.Analysis);
      this.resolveCompilation(this.compilation.traitCompiler);
    });
  }
  prepareEmit() {
    const compilation = this.ensureAnalyzed();
    untagAllTsFiles(this.inputProgram);
    const coreImportsFrom = compilation.isCore ? getR3SymbolsFile(this.inputProgram) : null;
    let importRewriter;
    if (coreImportsFrom !== null) {
      importRewriter = new R3SymbolsImportRewriter(coreImportsFrom.fileName);
    } else {
      importRewriter = new NoopImportRewriter();
    }
    const defaultImportTracker = new DefaultImportTracker();
    const before = [
      ivyTransformFactory(compilation.traitCompiler, compilation.reflector, importRewriter, defaultImportTracker, compilation.localCompilationExtraImportsTracker, this.delegatingPerfRecorder, compilation.isCore, this.closureCompilerEnabled),
      aliasTransformFactory(compilation.traitCompiler.exportStatements),
      defaultImportTracker.importPreservingTransformer()
    ];
    if (compilation.supportJitMode && compilation.jitDeclarationRegistry.jitDeclarations.size > 0) {
      const { jitDeclarations } = compilation.jitDeclarationRegistry;
      const jitDeclarationsArray = Array.from(jitDeclarations);
      const jitDeclarationOriginalNodes = new Set(jitDeclarationsArray.map((d) => ts24.getOriginalNode(d)));
      const sourceFilesWithJit = new Set(jitDeclarationsArray.map((d) => d.getSourceFile().fileName));
      before.push((ctx) => {
        const reflectionHost = new TypeScriptReflectionHost(this.inputProgram.getTypeChecker());
        const jitTransform = angularJitApplicationTransform(this.inputProgram, compilation.isCore, (node) => {
          node = ts24.getOriginalNode(node, ts24.isClassDeclaration);
          return reflectionHost.isClass(node) && jitDeclarationOriginalNodes.has(node);
        })(ctx);
        return (sourceFile) => {
          if (!sourceFilesWithJit.has(sourceFile.fileName)) {
            return sourceFile;
          }
          return jitTransform(sourceFile);
        };
      });
    }
    const afterDeclarations = [];
    if (this.options.compilationMode !== "experimental-local" && compilation.dtsTransforms !== null) {
      afterDeclarations.push(declarationTransformFactory(compilation.dtsTransforms, compilation.reflector, compilation.refEmitter, importRewriter));
    }
    if (compilation.aliasingHost !== null && compilation.aliasingHost.aliasExportsInDts) {
      afterDeclarations.push(aliasTransformFactory(compilation.traitCompiler.exportStatements));
    }
    return { transformers: { before, afterDeclarations } };
  }
  getIndexedComponents() {
    const compilation = this.ensureAnalyzed();
    const context = new IndexingContext();
    compilation.traitCompiler.index(context);
    return generateAnalysis(context);
  }
  getApiDocumentation(entryPoint, privateModules) {
    const compilation = this.ensureAnalyzed();
    const checker = this.inputProgram.getTypeChecker();
    const docsExtractor = new DocsExtractor(checker, compilation.metaReader);
    const entryPointSourceFile = this.inputProgram.getSourceFiles().find((sourceFile) => {
      return sourceFile.fileName.includes(entryPoint);
    });
    if (!entryPointSourceFile) {
      throw new Error(`Entry point "${entryPoint}" not found in program sources.`);
    }
    const rootDir = this.inputProgram.getCurrentDirectory();
    return docsExtractor.extractAll(entryPointSourceFile, rootDir, privateModules);
  }
  xi18n(ctx) {
    const compilation = this.ensureAnalyzed();
    compilation.traitCompiler.xi18n(ctx);
  }
  emitHmrUpdateModule(node) {
    const { traitCompiler, reflector } = this.ensureAnalyzed();
    if (!reflector.isClass(node)) {
      return null;
    }
    const callback = traitCompiler.compileHmrUpdateCallback(node);
    if (callback === null) {
      return null;
    }
    const sourceFile = node.getSourceFile();
    const printer = ts24.createPrinter();
    const nodeText = printer.printNode(ts24.EmitHint.Unspecified, callback, sourceFile);
    return ts24.transpileModule(nodeText, {
      compilerOptions: this.options,
      fileName: sourceFile.fileName,
      reportDiagnostics: false
    }).outputText;
  }
  ensureAnalyzed() {
    if (this.compilation === null) {
      this.analyzeSync();
    }
    return this.compilation;
  }
  analyzeSync() {
    this.perfRecorder.inPhase(PerfPhase.Analysis, () => {
      this.compilation = this.makeCompilation();
      for (const sf of this.inputProgram.getSourceFiles()) {
        if (sf.isDeclarationFile) {
          continue;
        }
        this.compilation.traitCompiler.analyzeSync(sf);
      }
      this.perfRecorder.memory(PerfCheckpoint.Analysis);
      this.resolveCompilation(this.compilation.traitCompiler);
    });
  }
  resolveCompilation(traitCompiler) {
    this.perfRecorder.inPhase(PerfPhase.Resolve, () => {
      traitCompiler.resolve();
      this.incrementalCompilation.recordSuccessfulAnalysis(traitCompiler);
      this.perfRecorder.memory(PerfCheckpoint.Resolve);
    });
  }
  get fullTemplateTypeCheck() {
    const strictTemplates = !!this.options.strictTemplates;
    return strictTemplates || !!this.options.fullTemplateTypeCheck;
  }
  getTypeCheckingConfig() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const strictTemplates = !!this.options.strictTemplates;
    const useInlineTypeConstructors = this.programDriver.supportsInlineOperations;
    const checkTwoWayBoundEvents = (_a = this.options["_checkTwoWayBoundEvents"]) != null ? _a : false;
    let allowSignalsInTwoWayBindings = (_b = coreHasSymbol(this.inputProgram, R3Identifiers.unwrapWritableSignal)) != null ? _b : this.angularCoreVersion === null || coreVersionSupportsFeature(this.angularCoreVersion, ">= 17.2.0");
    let typeCheckingConfig;
    if (this.fullTemplateTypeCheck) {
      typeCheckingConfig = {
        applyTemplateContextGuards: strictTemplates,
        checkQueries: false,
        checkTemplateBodies: true,
        alwaysCheckSchemaInTemplateBodies: true,
        checkTypeOfInputBindings: strictTemplates,
        honorAccessModifiersForInputBindings: false,
        checkControlFlowBodies: true,
        strictNullInputBindings: strictTemplates,
        checkTypeOfAttributes: strictTemplates,
        checkTypeOfDomBindings: false,
        checkTypeOfOutputEvents: strictTemplates,
        checkTypeOfAnimationEvents: strictTemplates,
        checkTypeOfDomEvents: strictTemplates,
        checkTypeOfDomReferences: strictTemplates,
        checkTypeOfNonDomReferences: true,
        checkTypeOfPipes: true,
        strictSafeNavigationTypes: strictTemplates,
        useContextGenericType: strictTemplates,
        strictLiteralTypes: true,
        enableTemplateTypeChecker: this.enableTemplateTypeChecker,
        useInlineTypeConstructors,
        suggestionsForSuboptimalTypeInference: this.enableTemplateTypeChecker && !strictTemplates,
        controlFlowPreventingContentProjection: ((_c = this.options.extendedDiagnostics) == null ? void 0 : _c.defaultCategory) || DiagnosticCategoryLabel.Warning,
        unusedStandaloneImports: ((_d = this.options.extendedDiagnostics) == null ? void 0 : _d.defaultCategory) || DiagnosticCategoryLabel.Warning,
        allowSignalsInTwoWayBindings,
        checkTwoWayBoundEvents
      };
    } else {
      typeCheckingConfig = {
        applyTemplateContextGuards: false,
        checkQueries: false,
        checkTemplateBodies: false,
        checkControlFlowBodies: false,
        alwaysCheckSchemaInTemplateBodies: this.closureCompilerEnabled,
        checkTypeOfInputBindings: false,
        strictNullInputBindings: false,
        honorAccessModifiersForInputBindings: false,
        checkTypeOfAttributes: false,
        checkTypeOfDomBindings: false,
        checkTypeOfOutputEvents: false,
        checkTypeOfAnimationEvents: false,
        checkTypeOfDomEvents: false,
        checkTypeOfDomReferences: false,
        checkTypeOfNonDomReferences: false,
        checkTypeOfPipes: false,
        strictSafeNavigationTypes: false,
        useContextGenericType: false,
        strictLiteralTypes: false,
        enableTemplateTypeChecker: this.enableTemplateTypeChecker,
        useInlineTypeConstructors,
        suggestionsForSuboptimalTypeInference: false,
        controlFlowPreventingContentProjection: ((_e = this.options.extendedDiagnostics) == null ? void 0 : _e.defaultCategory) || DiagnosticCategoryLabel.Warning,
        unusedStandaloneImports: ((_f = this.options.extendedDiagnostics) == null ? void 0 : _f.defaultCategory) || DiagnosticCategoryLabel.Warning,
        allowSignalsInTwoWayBindings,
        checkTwoWayBoundEvents
      };
    }
    if (this.options.strictInputTypes !== void 0) {
      typeCheckingConfig.checkTypeOfInputBindings = this.options.strictInputTypes;
      typeCheckingConfig.applyTemplateContextGuards = this.options.strictInputTypes;
    }
    if (this.options.strictInputAccessModifiers !== void 0) {
      typeCheckingConfig.honorAccessModifiersForInputBindings = this.options.strictInputAccessModifiers;
    }
    if (this.options.strictNullInputTypes !== void 0) {
      typeCheckingConfig.strictNullInputBindings = this.options.strictNullInputTypes;
    }
    if (this.options.strictOutputEventTypes !== void 0) {
      typeCheckingConfig.checkTypeOfOutputEvents = this.options.strictOutputEventTypes;
      typeCheckingConfig.checkTypeOfAnimationEvents = this.options.strictOutputEventTypes;
    }
    if (this.options.strictDomEventTypes !== void 0) {
      typeCheckingConfig.checkTypeOfDomEvents = this.options.strictDomEventTypes;
    }
    if (this.options.strictSafeNavigationTypes !== void 0) {
      typeCheckingConfig.strictSafeNavigationTypes = this.options.strictSafeNavigationTypes;
    }
    if (this.options.strictDomLocalRefTypes !== void 0) {
      typeCheckingConfig.checkTypeOfDomReferences = this.options.strictDomLocalRefTypes;
    }
    if (this.options.strictAttributeTypes !== void 0) {
      typeCheckingConfig.checkTypeOfAttributes = this.options.strictAttributeTypes;
    }
    if (this.options.strictContextGenerics !== void 0) {
      typeCheckingConfig.useContextGenericType = this.options.strictContextGenerics;
    }
    if (this.options.strictLiteralTypes !== void 0) {
      typeCheckingConfig.strictLiteralTypes = this.options.strictLiteralTypes;
    }
    if (((_h = (_g = this.options.extendedDiagnostics) == null ? void 0 : _g.checks) == null ? void 0 : _h.controlFlowPreventingContentProjection) !== void 0) {
      typeCheckingConfig.controlFlowPreventingContentProjection = this.options.extendedDiagnostics.checks.controlFlowPreventingContentProjection;
    }
    if (((_j = (_i = this.options.extendedDiagnostics) == null ? void 0 : _i.checks) == null ? void 0 : _j.unusedStandaloneImports) !== void 0) {
      typeCheckingConfig.unusedStandaloneImports = this.options.extendedDiagnostics.checks.unusedStandaloneImports;
    }
    return typeCheckingConfig;
  }
  getTemplateDiagnostics() {
    const compilation = this.ensureAnalyzed();
    const diagnostics = [];
    for (const sf of this.inputProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || this.adapter.isShim(sf)) {
        continue;
      }
      diagnostics.push(...compilation.templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram));
    }
    const program = this.programDriver.getProgram();
    this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, program);
    this.currentProgram = program;
    return diagnostics;
  }
  getTemplateDiagnosticsForFile(sf, optimizeFor) {
    const compilation = this.ensureAnalyzed();
    const diagnostics = [];
    if (!sf.isDeclarationFile && !this.adapter.isShim(sf)) {
      diagnostics.push(...compilation.templateTypeChecker.getDiagnosticsForFile(sf, optimizeFor));
    }
    const program = this.programDriver.getProgram();
    this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, program);
    this.currentProgram = program;
    return diagnostics;
  }
  getNonTemplateDiagnostics() {
    if (this.nonTemplateDiagnostics === null) {
      const compilation = this.ensureAnalyzed();
      this.nonTemplateDiagnostics = [...compilation.traitCompiler.diagnostics];
      if (this.entryPoint !== null && compilation.exportReferenceGraph !== null) {
        this.nonTemplateDiagnostics.push(...checkForPrivateExports(this.entryPoint, this.inputProgram.getTypeChecker(), compilation.exportReferenceGraph));
      }
    }
    return this.nonTemplateDiagnostics;
  }
  runAdditionalChecks(sf) {
    const diagnostics = [];
    const compilation = this.ensureAnalyzed();
    const { extendedTemplateChecker, templateSemanticsChecker, sourceFileValidator } = compilation;
    const files = sf ? [sf] : this.inputProgram.getSourceFiles();
    for (const sf2 of files) {
      if (sourceFileValidator !== null) {
        const sourceFileDiagnostics = sourceFileValidator.getDiagnosticsForFile(sf2);
        if (sourceFileDiagnostics !== null) {
          diagnostics.push(...sourceFileDiagnostics);
        }
      }
      if (templateSemanticsChecker !== null) {
        diagnostics.push(...compilation.traitCompiler.runAdditionalChecks(sf2, (clazz, handler) => {
          var _a;
          return ((_a = handler.templateSemanticsCheck) == null ? void 0 : _a.call(handler, clazz, templateSemanticsChecker)) || null;
        }));
      }
      if (this.options.strictTemplates && extendedTemplateChecker !== null) {
        diagnostics.push(...compilation.traitCompiler.runAdditionalChecks(sf2, (clazz, handler) => {
          var _a;
          return ((_a = handler.extendedTemplateCheck) == null ? void 0 : _a.call(handler, clazz, extendedTemplateChecker)) || null;
        }));
      }
    }
    return diagnostics;
  }
  makeCompilation() {
    var _a, _b, _c, _d, _e, _f;
    const isCore = isAngularCorePackage(this.inputProgram);
    let compilationMode = CompilationMode.FULL;
    if (!isCore) {
      switch (this.options.compilationMode) {
        case "full":
          compilationMode = CompilationMode.FULL;
          break;
        case "partial":
          compilationMode = CompilationMode.PARTIAL;
          break;
        case "experimental-local":
          compilationMode = CompilationMode.LOCAL;
          break;
      }
    }
    const checker = this.inputProgram.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker, compilationMode === CompilationMode.LOCAL);
    let refEmitter;
    let aliasingHost = null;
    if (this.adapter.unifiedModulesHost === null || !this.options["_useHostForImportGeneration"] && !this.options["_useHostForImportAndAliasGeneration"]) {
      let localImportStrategy;
      if (this.options.rootDir !== void 0 || this.options.rootDirs !== void 0 && this.options.rootDirs.length > 0) {
        localImportStrategy = new LogicalProjectStrategy(reflector, new LogicalFileSystem([...this.adapter.rootDirs], this.adapter));
      } else {
        localImportStrategy = new RelativePathStrategy(reflector);
      }
      refEmitter = new ReferenceEmitter([
        new LocalIdentifierStrategy(),
        new AbsoluteModuleStrategy(this.inputProgram, checker, this.moduleResolver, reflector),
        localImportStrategy
      ]);
      if (this.entryPoint === null && this.options.generateDeepReexports === true) {
        aliasingHost = new PrivateExportAliasingHost(reflector);
      }
    } else {
      refEmitter = new ReferenceEmitter([
        new LocalIdentifierStrategy(),
        ...this.options["_useHostForImportAndAliasGeneration"] ? [new AliasStrategy()] : [],
        new UnifiedModulesStrategy(reflector, this.adapter.unifiedModulesHost)
      ]);
      if (this.options["_useHostForImportAndAliasGeneration"]) {
        aliasingHost = new UnifiedModulesAliasingHost(this.adapter.unifiedModulesHost);
      }
    }
    const evaluator = new PartialEvaluator(reflector, checker, this.incrementalCompilation.depGraph);
    const dtsReader = new DtsMetadataReader(checker, reflector);
    const localMetaRegistry = new LocalMetadataRegistry();
    const localMetaReader = localMetaRegistry;
    const depScopeReader = new MetadataDtsModuleScopeResolver(dtsReader, aliasingHost);
    const metaReader = new CompoundMetadataReader([localMetaReader, dtsReader]);
    const ngModuleIndex = new NgModuleIndexImpl(metaReader, localMetaReader);
    const ngModuleScopeRegistry = new LocalModuleScopeRegistry(localMetaReader, metaReader, depScopeReader, refEmitter, aliasingHost);
    const standaloneScopeReader = new StandaloneComponentScopeReader(metaReader, ngModuleScopeRegistry, depScopeReader);
    const scopeReader = new CompoundComponentScopeReader([
      ngModuleScopeRegistry,
      standaloneScopeReader
    ]);
    const semanticDepGraphUpdater = this.incrementalCompilation.semanticDepGraphUpdater;
    const metaRegistry = new CompoundMetadataRegistry([localMetaRegistry, ngModuleScopeRegistry]);
    const injectableRegistry = new InjectableClassRegistry(reflector, isCore);
    const hostDirectivesResolver = new HostDirectivesResolver(metaReader);
    const exportedProviderStatusResolver = new ExportedProviderStatusResolver(metaReader);
    const importTracker = new ImportedSymbolsTracker();
    const typeCheckScopeRegistry = new TypeCheckScopeRegistry(scopeReader, metaReader, hostDirectivesResolver);
    let referencesRegistry;
    let exportReferenceGraph = null;
    if (this.entryPoint !== null) {
      exportReferenceGraph = new ReferenceGraph();
      referencesRegistry = new ReferenceGraphAdapter(exportReferenceGraph);
    } else {
      referencesRegistry = new NoopReferencesRegistry();
    }
    const dtsTransforms = new DtsTransformRegistry();
    const resourceRegistry = new ResourceRegistry();
    const deferredSymbolsTracker = new DeferredSymbolTracker(this.inputProgram.getTypeChecker(), (_a = this.options.onlyExplicitDeferDependencyImports) != null ? _a : false);
    let localCompilationExtraImportsTracker = null;
    if (compilationMode === CompilationMode.LOCAL && this.options.generateExtraImportsInLocalMode) {
      localCompilationExtraImportsTracker = new LocalCompilationExtraImportsTracker(checker);
    }
    const cycleHandlingStrategy = compilationMode === CompilationMode.PARTIAL ? 1 : 0;
    const strictCtorDeps = this.options.strictInjectionParameters || false;
    const supportJitMode = (_b = this.options["supportJitMode"]) != null ? _b : true;
    const supportTestBed = (_c = this.options["supportTestBed"]) != null ? _c : true;
    const externalRuntimeStyles = (_d = this.options["externalRuntimeStyles"]) != null ? _d : false;
    if (supportTestBed === false && compilationMode === CompilationMode.PARTIAL) {
      throw new Error('TestBed support ("supportTestBed" option) cannot be disabled in partial compilation mode.');
    }
    if (supportJitMode === false && compilationMode === CompilationMode.PARTIAL) {
      throw new Error('JIT mode support ("supportJitMode" option) cannot be disabled in partial compilation mode.');
    }
    if (supportJitMode === false && this.options.forbidOrphanComponents) {
      throw new Error('JIT mode support ("supportJitMode" option) cannot be disabled when forbidOrphanComponents is set to true');
    }
    const jitDeclarationRegistry = new JitDeclarationRegistry();
    const handlers = [
      new ComponentDecoratorHandler(reflector, evaluator, metaRegistry, metaReader, scopeReader, this.adapter, ngModuleScopeRegistry, typeCheckScopeRegistry, resourceRegistry, isCore, strictCtorDeps, this.resourceManager, this.adapter.rootDirs, this.options.preserveWhitespaces || false, this.options.i18nUseExternalIds !== false, this.options.enableI18nLegacyMessageIdFormat !== false, this.usePoisonedData, this.options.i18nNormalizeLineEndingsInICUs === true, this.moduleResolver, this.cycleAnalyzer, cycleHandlingStrategy, refEmitter, referencesRegistry, this.incrementalCompilation.depGraph, injectableRegistry, semanticDepGraphUpdater, this.closureCompilerEnabled, this.delegatingPerfRecorder, hostDirectivesResolver, importTracker, supportTestBed, compilationMode, deferredSymbolsTracker, !!this.options.forbidOrphanComponents, this.enableBlockSyntax, this.enableLetSyntax, externalRuntimeStyles, localCompilationExtraImportsTracker, jitDeclarationRegistry, (_e = this.options.i18nPreserveWhitespaceForLegacyExtraction) != null ? _e : true, !!this.options.strictStandalone, this.enableHmr, this.implicitStandaloneValue),
      new DirectiveDecoratorHandler(reflector, evaluator, metaRegistry, ngModuleScopeRegistry, metaReader, injectableRegistry, refEmitter, referencesRegistry, isCore, strictCtorDeps, semanticDepGraphUpdater, this.closureCompilerEnabled, this.delegatingPerfRecorder, importTracker, supportTestBed, compilationMode, jitDeclarationRegistry, !!this.options.strictStandalone, this.implicitStandaloneValue),
      new PipeDecoratorHandler(reflector, evaluator, metaRegistry, ngModuleScopeRegistry, injectableRegistry, isCore, this.delegatingPerfRecorder, supportTestBed, compilationMode, !!this.options.generateExtraImportsInLocalMode, !!this.options.strictStandalone, this.implicitStandaloneValue),
      new InjectableDecoratorHandler(reflector, evaluator, isCore, strictCtorDeps, injectableRegistry, this.delegatingPerfRecorder, supportTestBed, compilationMode),
      new NgModuleDecoratorHandler(reflector, evaluator, metaReader, metaRegistry, ngModuleScopeRegistry, referencesRegistry, exportedProviderStatusResolver, semanticDepGraphUpdater, isCore, refEmitter, this.closureCompilerEnabled, (_f = this.options.onlyPublishPublicTypingsForNgModules) != null ? _f : false, injectableRegistry, this.delegatingPerfRecorder, supportTestBed, supportJitMode, compilationMode, localCompilationExtraImportsTracker, jitDeclarationRegistry)
    ];
    const traitCompiler = new TraitCompiler(handlers, reflector, this.delegatingPerfRecorder, this.incrementalCompilation, this.options.compileNonExportedClasses !== false, compilationMode, dtsTransforms, semanticDepGraphUpdater, this.adapter);
    const notifyingDriver = new NotifyingProgramDriverWrapper(this.programDriver, (program) => {
      this.incrementalStrategy.setIncrementalState(this.incrementalCompilation.state, program);
      this.currentProgram = program;
    });
    const typeCheckingConfig = this.getTypeCheckingConfig();
    const templateTypeChecker = new TemplateTypeCheckerImpl(this.inputProgram, notifyingDriver, traitCompiler, typeCheckingConfig, refEmitter, reflector, this.adapter, this.incrementalCompilation, metaReader, localMetaReader, ngModuleIndex, scopeReader, typeCheckScopeRegistry, this.delegatingPerfRecorder);
    const extendedTemplateChecker = this.constructionDiagnostics.length === 0 ? new ExtendedTemplateCheckerImpl(templateTypeChecker, checker, ALL_DIAGNOSTIC_FACTORIES, this.options) : null;
    const templateSemanticsChecker = this.constructionDiagnostics.length === 0 ? new TemplateSemanticsCheckerImpl(templateTypeChecker) : null;
    const sourceFileValidator = this.constructionDiagnostics.length === 0 ? new SourceFileValidator(reflector, importTracker, templateTypeChecker, typeCheckingConfig) : null;
    return {
      isCore,
      traitCompiler,
      reflector,
      scopeRegistry: ngModuleScopeRegistry,
      dtsTransforms,
      exportReferenceGraph,
      metaReader,
      typeCheckScopeRegistry,
      aliasingHost,
      refEmitter,
      templateTypeChecker,
      resourceRegistry,
      extendedTemplateChecker,
      localCompilationExtraImportsTracker,
      jitDeclarationRegistry,
      templateSemanticsChecker,
      sourceFileValidator,
      supportJitMode
    };
  }
};
function isAngularCorePackage(program) {
  const r3Symbols = getR3SymbolsFile(program);
  if (r3Symbols === null) {
    return false;
  }
  return r3Symbols.statements.some((stmt) => {
    if (!ts24.isVariableStatement(stmt)) {
      return false;
    }
    const modifiers = ts24.getModifiers(stmt);
    if (modifiers === void 0 || !modifiers.some((mod) => mod.kind === ts24.SyntaxKind.ExportKeyword)) {
      return false;
    }
    return stmt.declarationList.declarations.some((decl) => {
      if (!ts24.isIdentifier(decl.name) || decl.name.text !== "ITS_JUST_ANGULAR") {
        return false;
      }
      if (decl.initializer === void 0 || decl.initializer.kind !== ts24.SyntaxKind.TrueKeyword) {
        return false;
      }
      return true;
    });
  });
}
function getR3SymbolsFile(program) {
  return program.getSourceFiles().find((file) => file.fileName.indexOf("r3_symbols.ts") >= 0) || null;
}
function* verifyCompatibleTypeCheckOptions(options) {
  var _a, _b, _c;
  if (options.fullTemplateTypeCheck === false && options.strictTemplates === true) {
    yield makeConfigDiagnostic({
      category: ts24.DiagnosticCategory.Error,
      code: ErrorCode.CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK,
      messageText: `
Angular compiler option "strictTemplates" is enabled, however "fullTemplateTypeCheck" is disabled.

Having the "strictTemplates" flag enabled implies that "fullTemplateTypeCheck" is also enabled, so
the latter can not be explicitly disabled.

One of the following actions is required:
1. Remove the "fullTemplateTypeCheck" option.
2. Remove "strictTemplates" or set it to 'false'.

More information about the template type checking compiler options can be found in the documentation:
https://angular.dev/tools/cli/template-typecheck
      `.trim()
    });
  }
  if (options.extendedDiagnostics && options.strictTemplates === false) {
    yield makeConfigDiagnostic({
      category: ts24.DiagnosticCategory.Error,
      code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES,
      messageText: `
Angular compiler option "extendedDiagnostics" is configured, however "strictTemplates" is disabled.

Using "extendedDiagnostics" requires that "strictTemplates" is also enabled.

One of the following actions is required:
1. Remove "strictTemplates: false" to enable it.
2. Remove "extendedDiagnostics" configuration to disable them.
      `.trim()
    });
  }
  const allowedCategoryLabels = Array.from(Object.values(DiagnosticCategoryLabel));
  const defaultCategory = (_a = options.extendedDiagnostics) == null ? void 0 : _a.defaultCategory;
  if (defaultCategory && !allowedCategoryLabels.includes(defaultCategory)) {
    yield makeConfigDiagnostic({
      category: ts24.DiagnosticCategory.Error,
      code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL,
      messageText: `
Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "${defaultCategory}".

Allowed diagnostic categories are:
${allowedCategoryLabels.join("\n")}
      `.trim()
    });
  }
  for (const [checkName, category] of Object.entries((_c = (_b = options.extendedDiagnostics) == null ? void 0 : _b.checks) != null ? _c : {})) {
    if (!SUPPORTED_DIAGNOSTIC_NAMES.has(checkName)) {
      yield makeConfigDiagnostic({
        category: ts24.DiagnosticCategory.Error,
        code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK,
        messageText: `
Angular compiler option "extendedDiagnostics.checks" has an unknown check: "${checkName}".

Allowed check names are:
${Array.from(SUPPORTED_DIAGNOSTIC_NAMES).join("\n")}
        `.trim()
      });
    }
    if (!allowedCategoryLabels.includes(category)) {
      yield makeConfigDiagnostic({
        category: ts24.DiagnosticCategory.Error,
        code: ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL,
        messageText: `
Angular compiler option "extendedDiagnostics.checks['${checkName}']" has an unknown diagnostic category: "${category}".

Allowed diagnostic categories are:
${allowedCategoryLabels.join("\n")}
        `.trim()
      });
    }
  }
}
function makeConfigDiagnostic({ category, code, messageText }) {
  return {
    category,
    code: ngErrorCode(code),
    file: void 0,
    start: void 0,
    length: void 0,
    messageText
  };
}
var ReferenceGraphAdapter = class {
  graph;
  constructor(graph) {
    this.graph = graph;
  }
  add(source, ...references) {
    for (const { node } of references) {
      let sourceFile = node.getSourceFile();
      if (sourceFile === void 0) {
        sourceFile = ts24.getOriginalNode(node).getSourceFile();
      }
      if (sourceFile === void 0 || !isDtsPath(sourceFile.fileName)) {
        this.graph.add(source, node);
      }
    }
  }
};
var NotifyingProgramDriverWrapper = class {
  delegate;
  notifyNewProgram;
  getSourceFileVersion;
  constructor(delegate, notifyNewProgram) {
    var _a;
    this.delegate = delegate;
    this.notifyNewProgram = notifyNewProgram;
    this.getSourceFileVersion = (_a = this.delegate.getSourceFileVersion) == null ? void 0 : _a.bind(this);
  }
  get supportsInlineOperations() {
    return this.delegate.supportsInlineOperations;
  }
  getProgram() {
    return this.delegate.getProgram();
  }
  updateFiles(contents, updateMode) {
    this.delegate.updateFiles(contents, updateMode);
    this.notifyNewProgram(this.delegate.getProgram());
  }
};
function versionMapFromProgram(program, driver) {
  if (driver.getSourceFileVersion === void 0) {
    return null;
  }
  const versions = /* @__PURE__ */ new Map();
  for (const possiblyRedirectedSourceFile of program.getSourceFiles()) {
    const sf = toUnredirectedSourceFile(possiblyRedirectedSourceFile);
    versions.set(absoluteFromSourceFile(sf), driver.getSourceFileVersion(sf));
  }
  return versions;
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/core/src/host.mjs
import ts25 from "typescript";
var DelegatingCompilerHost = class {
  delegate;
  createHash;
  directoryExists;
  fileNameToModuleName;
  getCancellationToken;
  getCanonicalFileName;
  getCurrentDirectory;
  getDefaultLibFileName;
  getDefaultLibLocation;
  getDirectories;
  getEnvironmentVariable;
  getModifiedResourceFiles;
  getNewLine;
  getParsedCommandLine;
  getSourceFileByPath;
  readDirectory;
  readFile;
  readResource;
  transformResource;
  realpath;
  resolveModuleNames;
  resolveTypeReferenceDirectives;
  resourceNameToFileName;
  trace;
  useCaseSensitiveFileNames;
  writeFile;
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
    this.fileNameToModuleName = this.delegateMethod("fileNameToModuleName");
    this.getCancellationToken = this.delegateMethod("getCancellationToken");
    this.getCanonicalFileName = this.delegateMethod("getCanonicalFileName");
    this.getCurrentDirectory = this.delegateMethod("getCurrentDirectory");
    this.getDefaultLibFileName = this.delegateMethod("getDefaultLibFileName");
    this.getDefaultLibLocation = this.delegateMethod("getDefaultLibLocation");
    this.getDirectories = this.delegateMethod("getDirectories");
    this.getEnvironmentVariable = this.delegateMethod("getEnvironmentVariable");
    this.getModifiedResourceFiles = this.delegateMethod("getModifiedResourceFiles");
    this.getNewLine = this.delegateMethod("getNewLine");
    this.getParsedCommandLine = this.delegateMethod("getParsedCommandLine");
    this.getSourceFileByPath = this.delegateMethod("getSourceFileByPath");
    this.readDirectory = this.delegateMethod("readDirectory");
    this.readFile = this.delegateMethod("readFile");
    this.readResource = this.delegateMethod("readResource");
    this.transformResource = this.delegateMethod("transformResource");
    this.realpath = this.delegateMethod("realpath");
    this.resolveModuleNames = this.delegateMethod("resolveModuleNames");
    this.resolveTypeReferenceDirectives = this.delegateMethod("resolveTypeReferenceDirectives");
    this.resourceNameToFileName = this.delegateMethod("resourceNameToFileName");
    this.trace = this.delegateMethod("trace");
    this.useCaseSensitiveFileNames = this.delegateMethod("useCaseSensitiveFileNames");
    this.writeFile = this.delegateMethod("writeFile");
    this.getModuleResolutionCache = this.delegateMethod("getModuleResolutionCache");
    this.hasInvalidatedResolutions = this.delegateMethod("hasInvalidatedResolutions");
    this.resolveModuleNameLiterals = this.delegateMethod("resolveModuleNameLiterals");
    this.resolveTypeReferenceDirectiveReferences = this.delegateMethod("resolveTypeReferenceDirectiveReferences");
  }
  delegateMethod(name) {
    return this.delegate[name] !== void 0 ? this.delegate[name].bind(this.delegate) : void 0;
  }
};
var NgCompilerHost = class extends DelegatingCompilerHost {
  shimAdapter;
  shimTagger;
  entryPoint = null;
  constructionDiagnostics;
  inputFiles;
  rootDirs;
  constructor(delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, diagnostics) {
    super(delegate);
    this.shimAdapter = shimAdapter;
    this.shimTagger = shimTagger;
    this.entryPoint = entryPoint;
    this.constructionDiagnostics = diagnostics;
    this.inputFiles = [...inputFiles, ...shimAdapter.extraInputFiles];
    this.rootDirs = rootDirs;
    if (this.resolveModuleNames === void 0) {
      this.resolveModuleNames = this.createCachedResolveModuleNamesFunction();
    }
  }
  get ignoreForEmit() {
    return this.shimAdapter.ignoreForEmit;
  }
  get shimExtensionPrefixes() {
    return this.shimAdapter.extensionPrefixes;
  }
  postProgramCreationCleanup() {
    this.shimTagger.finalize();
  }
  static wrap(delegate, inputFiles, options, oldProgram) {
    const topLevelShimGenerators = [];
    const perFileShimGenerators = [];
    const rootDirs = getRootDirs(delegate, options);
    perFileShimGenerators.push(new TypeCheckShimGenerator());
    let diagnostics = [];
    const normalizedTsInputFiles = [];
    for (const inputFile of inputFiles) {
      if (!isNonDeclarationTsPath(inputFile)) {
        continue;
      }
      normalizedTsInputFiles.push(resolve(inputFile));
    }
    let entryPoint = null;
    if (options.flatModuleOutFile != null && options.flatModuleOutFile !== "") {
      entryPoint = findFlatIndexEntryPoint(normalizedTsInputFiles);
      if (entryPoint === null) {
        diagnostics.push({
          category: ts25.DiagnosticCategory.Error,
          code: ngErrorCode(ErrorCode.CONFIG_FLAT_MODULE_NO_INDEX),
          file: void 0,
          start: void 0,
          length: void 0,
          messageText: 'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.'
        });
      } else {
        const flatModuleId = options.flatModuleId || null;
        const flatModuleOutFile = normalizeSeparators(options.flatModuleOutFile);
        const flatIndexGenerator = new FlatIndexGenerator(entryPoint, flatModuleOutFile, flatModuleId);
        topLevelShimGenerators.push(flatIndexGenerator);
      }
    }
    const shimAdapter = new ShimAdapter(delegate, normalizedTsInputFiles, topLevelShimGenerators, perFileShimGenerators, oldProgram);
    const shimTagger = new ShimReferenceTagger(perFileShimGenerators.map((gen) => gen.extensionPrefix));
    return new NgCompilerHost(delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, diagnostics);
  }
  isShim(sf) {
    return isShim(sf);
  }
  isResource(sf) {
    return false;
  }
  getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) {
    const shimSf = this.shimAdapter.maybeGenerate(resolve(fileName));
    if (shimSf !== null) {
      return shimSf;
    }
    const sf = this.delegate.getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
    if (sf === void 0) {
      return void 0;
    }
    this.shimTagger.tag(sf);
    return sf;
  }
  fileExists(fileName) {
    return this.delegate.fileExists(fileName) || this.shimAdapter.maybeGenerate(resolve(fileName)) != null;
  }
  get unifiedModulesHost() {
    return this.fileNameToModuleName !== void 0 ? this : null;
  }
  createCachedResolveModuleNamesFunction() {
    const moduleResolutionCache = ts25.createModuleResolutionCache(this.getCurrentDirectory(), this.getCanonicalFileName.bind(this));
    return (moduleNames, containingFile, reusedNames, redirectedReference, options) => {
      return moduleNames.map((moduleName) => {
        const module = ts25.resolveModuleName(moduleName, containingFile, options, this, moduleResolutionCache, redirectedReference);
        return module.resolvedModule;
      });
    };
  }
};

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/ngtsc/program.mjs
var NgtscProgram = class {
  options;
  compiler;
  tsProgram;
  host;
  incrementalStrategy;
  constructor(rootNames, options, delegateHost, oldProgram) {
    this.options = options;
    const perfRecorder = ActivePerfRecorder.zeroedToNow();
    perfRecorder.phase(PerfPhase.Setup);
    if (!options.disableTypeScriptVersionCheck) {
      verifySupportedTypeScriptVersion();
    }
    if (options.compilationMode === "experimental-local") {
      options.noEmitOnError = false;
    }
    const reuseProgram = oldProgram == null ? void 0 : oldProgram.compiler.getCurrentProgram();
    this.host = NgCompilerHost.wrap(delegateHost, rootNames, options, reuseProgram != null ? reuseProgram : null);
    if (reuseProgram !== void 0) {
      retagAllTsFiles(reuseProgram);
    }
    this.tsProgram = perfRecorder.inPhase(PerfPhase.TypeScriptProgramCreate, () => ts26.createProgram(this.host.inputFiles, options, this.host, reuseProgram));
    perfRecorder.phase(PerfPhase.Unaccounted);
    perfRecorder.memory(PerfCheckpoint.TypeScriptProgramCreate);
    this.host.postProgramCreationCleanup();
    const programDriver = new TsCreateProgramDriver(this.tsProgram, this.host, this.options, this.host.shimExtensionPrefixes);
    this.incrementalStrategy = oldProgram !== void 0 ? oldProgram.incrementalStrategy.toNextBuildStrategy() : new TrackedIncrementalBuildStrategy();
    const modifiedResourceFiles = /* @__PURE__ */ new Set();
    if (this.host.getModifiedResourceFiles !== void 0) {
      const strings = this.host.getModifiedResourceFiles();
      if (strings !== void 0) {
        for (const fileString of strings) {
          modifiedResourceFiles.add(absoluteFrom(fileString));
        }
      }
    }
    let ticket;
    if (oldProgram === void 0) {
      ticket = freshCompilationTicket(
        this.tsProgram,
        options,
        this.incrementalStrategy,
        programDriver,
        perfRecorder,
        false,
        false
      );
    } else {
      ticket = incrementalFromCompilerTicket(oldProgram.compiler, this.tsProgram, this.incrementalStrategy, programDriver, modifiedResourceFiles, perfRecorder);
    }
    this.compiler = NgCompiler.fromTicket(ticket, this.host);
  }
  getTsProgram() {
    return this.tsProgram;
  }
  getReuseTsProgram() {
    return this.compiler.getCurrentProgram();
  }
  getTsOptionDiagnostics(cancellationToken) {
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => this.tsProgram.getOptionsDiagnostics(cancellationToken));
  }
  getTsSyntacticDiagnostics(sourceFile, cancellationToken) {
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => {
      const ignoredFiles = this.compiler.ignoreForDiagnostics;
      let res;
      if (sourceFile !== void 0) {
        if (ignoredFiles.has(sourceFile)) {
          return [];
        }
        res = this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
      } else {
        const diagnostics = [];
        for (const sf of this.tsProgram.getSourceFiles()) {
          if (!ignoredFiles.has(sf)) {
            diagnostics.push(...this.tsProgram.getSyntacticDiagnostics(sf, cancellationToken));
          }
        }
        res = diagnostics;
      }
      return res;
    });
  }
  getTsSemanticDiagnostics(sourceFile, cancellationToken) {
    if (this.options.compilationMode === "experimental-local") {
      return [];
    }
    return this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptDiagnostics, () => {
      const ignoredFiles = this.compiler.ignoreForDiagnostics;
      let res;
      if (sourceFile !== void 0) {
        if (ignoredFiles.has(sourceFile)) {
          return [];
        }
        res = this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
      } else {
        const diagnostics = [];
        for (const sf of this.tsProgram.getSourceFiles()) {
          if (!ignoredFiles.has(sf)) {
            diagnostics.push(...this.tsProgram.getSemanticDiagnostics(sf, cancellationToken));
          }
        }
        res = diagnostics;
      }
      return res;
    });
  }
  getNgOptionDiagnostics(cancellationToken) {
    return this.compiler.getOptionDiagnostics();
  }
  getNgStructuralDiagnostics(cancellationToken) {
    return [];
  }
  getNgSemanticDiagnostics(fileName, cancellationToken) {
    let sf = void 0;
    if (fileName !== void 0) {
      sf = this.tsProgram.getSourceFile(fileName);
      if (sf === void 0) {
        return [];
      }
    }
    if (sf === void 0) {
      return this.compiler.getDiagnostics();
    } else {
      return this.compiler.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
    }
  }
  loadNgStructureAsync() {
    return this.compiler.analyzeAsync();
  }
  listLazyRoutes(entryRoute) {
    return [];
  }
  emitXi18n() {
    var _a, _b, _c;
    const ctx = new MessageBundle(new HtmlParser(), [], {}, (_a = this.options.i18nOutLocale) != null ? _a : null, this.options.i18nPreserveWhitespaceForLegacyExtraction);
    this.compiler.xi18n(ctx);
    i18nExtract((_b = this.options.i18nOutFormat) != null ? _b : null, (_c = this.options.i18nOutFile) != null ? _c : null, this.host, this.options, ctx, resolve);
  }
  emit(opts) {
    var _a;
    if (opts !== void 0 && opts.emitFlags !== void 0 && opts.emitFlags & EmitFlags.I18nBundle) {
      this.emitXi18n();
      if (!(opts.emitFlags & EmitFlags.JS)) {
        return {
          diagnostics: [],
          emitSkipped: true,
          emittedFiles: []
        };
      }
    }
    const forceEmit = (_a = opts == null ? void 0 : opts.forceEmit) != null ? _a : false;
    this.compiler.perfRecorder.memory(PerfCheckpoint.PreEmit);
    const res = this.compiler.perfRecorder.inPhase(PerfPhase.TypeScriptEmit, () => {
      var _a2;
      const { transformers } = this.compiler.prepareEmit();
      const ignoreFiles = this.compiler.ignoreForEmit;
      const emitCallback = (_a2 = opts == null ? void 0 : opts.emitCallback) != null ? _a2 : defaultEmitCallback;
      const writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
        if (sourceFiles !== void 0) {
          for (const writtenSf of sourceFiles) {
            if (writtenSf.isDeclarationFile) {
              continue;
            }
            this.compiler.incrementalCompilation.recordSuccessfulEmit(writtenSf);
          }
        }
        this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
      };
      const customTransforms = opts && opts.customTransformers;
      const beforeTransforms = transformers.before || [];
      const afterDeclarationsTransforms = transformers.afterDeclarations;
      if (customTransforms !== void 0 && customTransforms.beforeTs !== void 0) {
        beforeTransforms.push(...customTransforms.beforeTs);
      }
      const emitResults = [];
      for (const targetSourceFile of this.tsProgram.getSourceFiles()) {
        if (targetSourceFile.isDeclarationFile || ignoreFiles.has(targetSourceFile)) {
          continue;
        }
        if (!forceEmit && this.compiler.incrementalCompilation.safeToSkipEmit(targetSourceFile)) {
          this.compiler.perfRecorder.eventCount(PerfEvent.EmitSkipSourceFile);
          continue;
        }
        this.compiler.perfRecorder.eventCount(PerfEvent.EmitSourceFile);
        emitResults.push(emitCallback({
          targetSourceFile,
          program: this.tsProgram,
          host: this.host,
          options: this.options,
          emitOnlyDtsFiles: false,
          writeFile,
          customTransformers: {
            before: beforeTransforms,
            after: customTransforms && customTransforms.afterTs,
            afterDeclarations: afterDeclarationsTransforms
          }
        }));
      }
      this.compiler.perfRecorder.memory(PerfCheckpoint.Emit);
      return (opts && opts.mergeEmitResultsCallback || mergeEmitResults)(emitResults);
    });
    if (this.options.tracePerformance !== void 0) {
      const perf = this.compiler.perfRecorder.finalize();
      getFileSystem().writeFile(getFileSystem().resolve(this.options.tracePerformance), JSON.stringify(perf, null, 2));
    }
    return res;
  }
  getIndexedComponents() {
    return this.compiler.getIndexedComponents();
  }
  getApiDocumentation(entryPoint, privateModules) {
    return this.compiler.getApiDocumentation(entryPoint, privateModules);
  }
  getEmittedSourceFiles() {
    throw new Error("Method not implemented.");
  }
};
var defaultEmitCallback = ({ program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers }) => program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
function mergeEmitResults(emitResults) {
  const diagnostics = [];
  let emitSkipped = false;
  const emittedFiles = [];
  for (const er of emitResults) {
    diagnostics.push(...er.diagnostics);
    emitSkipped = emitSkipped || er.emitSkipped;
    emittedFiles.push(...er.emittedFiles || []);
  }
  return { diagnostics, emitSkipped, emittedFiles };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/transformers/program.mjs
function createProgram({ rootNames, options, host, oldProgram }) {
  return new NgtscProgram(rootNames, options, host, oldProgram);
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/perform_compile.mjs
import ts28 from "typescript";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/transformers/util.mjs
import ts27 from "typescript";
function createMessageDiagnostic(messageText) {
  return {
    file: void 0,
    start: void 0,
    length: void 0,
    category: ts27.DiagnosticCategory.Message,
    messageText,
    code: DEFAULT_ERROR_CODE,
    source: SOURCE
  };
}

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/perform_compile.mjs
var defaultFormatHost = {
  getCurrentDirectory: () => ts28.sys.getCurrentDirectory(),
  getCanonicalFileName: (fileName) => fileName,
  getNewLine: () => ts28.sys.newLine
};
function formatDiagnostics(diags, host = defaultFormatHost) {
  if (diags && diags.length) {
    return diags.map((diagnostic) => replaceTsWithNgInErrors(ts28.formatDiagnosticsWithColorAndContext([diagnostic], host))).join("");
  } else {
    return "";
  }
}
function calcProjectFileAndBasePath(project, host = getFileSystem()) {
  const absProject = host.resolve(project);
  const projectIsDir = host.lstat(absProject).isDirectory();
  const projectFile = projectIsDir ? host.join(absProject, "tsconfig.json") : absProject;
  const projectDir = projectIsDir ? absProject : host.dirname(absProject);
  const basePath = host.resolve(projectDir);
  return { projectFile, basePath };
}
function readConfiguration(project, existingOptions, host = getFileSystem()) {
  var _a;
  try {
    const fs = getFileSystem();
    const readConfigFile = (configFile) => ts28.readConfigFile(configFile, (file) => host.readFile(host.resolve(file)));
    const readAngularCompilerOptions = (configFile, parentOptions = {}) => {
      var _a2, _b;
      const { config: config2, error: error2 } = readConfigFile(configFile);
      if (error2) {
        return parentOptions;
      }
      const angularCompilerOptions = (_b = config2.angularCompilerOptions) != null ? _b : (_a2 = config2.bazelOptions) == null ? void 0 : _a2.angularCompilerOptions;
      let existingNgCompilerOptions = { ...angularCompilerOptions, ...parentOptions };
      if (!config2.extends) {
        return existingNgCompilerOptions;
      }
      const extendsPaths = typeof config2.extends === "string" ? [config2.extends] : config2.extends;
      return [...extendsPaths].reverse().reduce((prevOptions, extendsPath) => {
        const extendedConfigPath = getExtendedConfigPath(configFile, extendsPath, host, fs);
        return extendedConfigPath === null ? prevOptions : readAngularCompilerOptions(extendedConfigPath, prevOptions);
      }, existingNgCompilerOptions);
    };
    const { projectFile, basePath } = calcProjectFileAndBasePath(project, host);
    const configFileName = host.resolve(host.pwd(), projectFile);
    const { config, error } = readConfigFile(projectFile);
    if (error) {
      return {
        project,
        errors: [error],
        rootNames: [],
        options: {},
        emitFlags: EmitFlags.Default
      };
    }
    const existingCompilerOptions = {
      genDir: basePath,
      basePath,
      ...readAngularCompilerOptions(configFileName),
      ...existingOptions
    };
    const parseConfigHost = createParseConfigHost(host, fs);
    const { options, errors, fileNames: rootNames, projectReferences } = ts28.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingCompilerOptions, configFileName);
    let emitFlags = EmitFlags.Default;
    if (!(options["skipMetadataEmit"] || options["flatModuleOutFile"])) {
      emitFlags |= EmitFlags.Metadata;
    }
    if (options["skipTemplateCodegen"]) {
      emitFlags = emitFlags & ~EmitFlags.Codegen;
    }
    return { project: projectFile, rootNames, projectReferences, options, errors, emitFlags };
  } catch (e) {
    const errors = [
      {
        category: ts28.DiagnosticCategory.Error,
        messageText: (_a = e.stack) != null ? _a : e.message,
        file: void 0,
        start: void 0,
        length: void 0,
        source: "angular",
        code: UNKNOWN_ERROR_CODE
      }
    ];
    return { project: "", errors, rootNames: [], options: {}, emitFlags: EmitFlags.Default };
  }
}
function createParseConfigHost(host, fs = getFileSystem()) {
  return {
    fileExists: host.exists.bind(host),
    readDirectory: createFileSystemTsReadDirectoryFn(fs),
    readFile: host.readFile.bind(host),
    useCaseSensitiveFileNames: fs.isCaseSensitive()
  };
}
function getExtendedConfigPath(configFile, extendsValue, host, fs) {
  const result = getExtendedConfigPathWorker(configFile, extendsValue, host, fs);
  if (result !== null) {
    return result;
  }
  return getExtendedConfigPathWorker(configFile, `${extendsValue}.json`, host, fs);
}
function getExtendedConfigPathWorker(configFile, extendsValue, host, fs) {
  if (extendsValue.startsWith(".") || fs.isRooted(extendsValue)) {
    const extendedConfigPath = host.resolve(host.dirname(configFile), extendsValue);
    if (host.exists(extendedConfigPath)) {
      return extendedConfigPath;
    }
  } else {
    const parseConfigHost = createParseConfigHost(host, fs);
    const { resolvedModule } = ts28.nodeModuleNameResolver(extendsValue, configFile, { moduleResolution: ts28.ModuleResolutionKind.Node10, resolveJsonModule: true }, parseConfigHost);
    if (resolvedModule) {
      return absoluteFrom(resolvedModule.resolvedFileName);
    }
  }
  return null;
}
function exitCodeFromResult(diags) {
  if (!diags)
    return 0;
  if (diags.every((diag) => diag.category !== ts28.DiagnosticCategory.Error)) {
    return 0;
  }
  return diags.some((d) => d.source === "angular" && d.code === UNKNOWN_ERROR_CODE) ? 2 : 1;
}
function performCompilation({ rootNames, options, host, oldProgram, emitCallback, mergeEmitResultsCallback, gatherDiagnostics = defaultGatherDiagnostics, customTransformers, emitFlags = EmitFlags.Default, forceEmit = false, modifiedResourceFiles = null }) {
  var _a;
  let program;
  let emitResult;
  let allDiagnostics = [];
  try {
    if (!host) {
      host = createCompilerHost({ options });
    }
    if (modifiedResourceFiles) {
      host.getModifiedResourceFiles = () => modifiedResourceFiles;
    }
    program = createProgram({ rootNames, host, options, oldProgram });
    const beforeDiags = Date.now();
    allDiagnostics.push(...gatherDiagnostics(program));
    if (options.diagnostics) {
      const afterDiags = Date.now();
      allDiagnostics.push(createMessageDiagnostic(`Time for diagnostics: ${afterDiags - beforeDiags}ms.`));
    }
    if (!hasErrors(allDiagnostics)) {
      emitResult = program.emit({
        emitCallback,
        mergeEmitResultsCallback,
        customTransformers,
        emitFlags,
        forceEmit
      });
      allDiagnostics.push(...emitResult.diagnostics);
      return { diagnostics: allDiagnostics, program, emitResult };
    }
    return { diagnostics: allDiagnostics, program };
  } catch (e) {
    program = void 0;
    allDiagnostics.push({
      category: ts28.DiagnosticCategory.Error,
      messageText: (_a = e.stack) != null ? _a : e.message,
      code: UNKNOWN_ERROR_CODE,
      file: void 0,
      start: void 0,
      length: void 0
    });
    return { diagnostics: allDiagnostics, program };
  }
}
function defaultGatherDiagnostics(program) {
  const allDiagnostics = [];
  function checkDiagnostics(diags) {
    if (diags) {
      allDiagnostics.push(...diags);
      return !hasErrors(diags);
    }
    return true;
  }
  let checkOtherDiagnostics = true;
  checkOtherDiagnostics = checkOtherDiagnostics && checkDiagnostics([...program.getTsOptionDiagnostics(), ...program.getNgOptionDiagnostics()]);
  checkOtherDiagnostics = checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());
  checkOtherDiagnostics = checkOtherDiagnostics && checkDiagnostics([
    ...program.getTsSemanticDiagnostics(),
    ...program.getNgStructuralDiagnostics()
  ]);
  checkOtherDiagnostics = checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());
  return allDiagnostics;
}
function hasErrors(diags) {
  return diags.some((d) => d.category === ts28.DiagnosticCategory.Error);
}

export {
  DEFAULT_ERROR_CODE,
  UNKNOWN_ERROR_CODE,
  SOURCE,
  isTsDiagnostic,
  EmitFlags,
  createCompilerHost,
  EntryType,
  MemberType,
  DecoratorType,
  MemberTags,
  isDocEntryWithSourceInfo,
  DocsExtractor,
  PatchedProgramIncrementalBuildStrategy,
  freshCompilationTicket,
  incrementalFromStateTicket,
  NgCompiler,
  NgCompilerHost,
  NgtscProgram,
  createProgram,
  createMessageDiagnostic,
  formatDiagnostics,
  calcProjectFileAndBasePath,
  readConfiguration,
  exitCodeFromResult,
  performCompilation,
  defaultGatherDiagnostics
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
//# sourceMappingURL=chunk-CKLAD5Y5.js.map
