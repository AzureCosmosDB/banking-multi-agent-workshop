var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/tslib/tslib.js
var require_tslib = __commonJS({
  "node_modules/tslib/tslib.js"(exports, module2) {
    var __extends;
    var __assign;
    var __rest;
    var __decorate;
    var __param;
    var __esDecorate;
    var __runInitializers;
    var __propKey;
    var __setFunctionName;
    var __metadata;
    var __awaiter;
    var __generator;
    var __exportStar;
    var __values;
    var __read;
    var __spread;
    var __spreadArrays;
    var __spreadArray;
    var __await;
    var __asyncGenerator;
    var __asyncDelegator;
    var __asyncValues;
    var __makeTemplateObject;
    var __importStar;
    var __importDefault;
    var __classPrivateFieldGet;
    var __classPrivateFieldSet;
    var __classPrivateFieldIn;
    var __createBinding;
    var __addDisposableResource;
    var __disposeResources;
    (function(factory) {
      var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
      if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function(exports2) {
          factory(createExporter(root, createExporter(exports2)));
        });
      } else if (typeof module2 === "object" && typeof module2.exports === "object") {
        factory(createExporter(root, createExporter(module2.exports)));
      } else {
        factory(createExporter(root));
      }
      function createExporter(exports2, previous) {
        if (exports2 !== root) {
          if (typeof Object.create === "function") {
            Object.defineProperty(exports2, "__esModule", { value: true });
          } else {
            exports2.__esModule = true;
          }
        }
        return function(id, v) {
          return exports2[id] = previous ? previous(id, v) : v;
        };
      }
    })(function(exporter) {
      var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      __extends = function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      __rest = function(s, e) {
        var t = {};
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
          }
        return t;
      };
      __decorate = function(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          r = Reflect.decorate(decorators, target, key, desc);
        else
          for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
              r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
      };
      __param = function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) {
          if (f !== void 0 && typeof f !== "function")
            throw new TypeError("Function expected");
          return f;
        }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
          var context = {};
          for (var p in contextIn)
            context[p] = p === "access" ? {} : contextIn[p];
          for (var p in contextIn.access)
            context.access[p] = contextIn.access[p];
          context.addInitializer = function(f) {
            if (done)
              throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
          };
          var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
          if (kind === "accessor") {
            if (result === void 0)
              continue;
            if (result === null || typeof result !== "object")
              throw new TypeError("Object expected");
            if (_ = accept(result.get))
              descriptor.get = _;
            if (_ = accept(result.set))
              descriptor.set = _;
            if (_ = accept(result.init))
              initializers.unshift(_);
          } else if (_ = accept(result)) {
            if (kind === "field")
              initializers.unshift(_);
            else
              descriptor[key] = _;
          }
        }
        if (target)
          Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
      };
      __runInitializers = function(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
          value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
      };
      __propKey = function(x) {
        return typeof x === "symbol" ? x : "".concat(x);
      };
      __setFunctionName = function(f, name, prefix) {
        if (typeof name === "symbol")
          name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
      };
      __metadata = function(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(metadataKey, metadataValue);
      };
      __awaiter = function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      __generator = function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      __exportStar = function(m, o) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
            __createBinding(o, m, p);
      };
      __createBinding = Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      };
      __values = function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
          return m.call(o);
        if (o && typeof o.length === "number")
          return {
            next: function() {
              if (o && i >= o.length)
                o = void 0;
              return { value: o && o[i++], done: !o };
            }
          };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      __read = function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
          return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
            ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"]))
              m.call(i);
          } finally {
            if (e)
              throw e.error;
          }
        }
        return ar;
      };
      __spread = function() {
        for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read(arguments[i]));
        return ar;
      };
      __spreadArrays = function() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
          s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
        return r;
      };
      __spreadArray = function(to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
              if (!ar)
                ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      };
      __await = function(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
      };
      __asyncGenerator = function(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;
        function awaitReturn(f) {
          return function(v) {
            return Promise.resolve(v).then(f, reject);
          };
        }
        function verb(n, f) {
          if (g[n]) {
            i[n] = function(v) {
              return new Promise(function(a, b) {
                q.push([n, v, a, b]) > 1 || resume(n, v);
              });
            };
            if (f)
              i[n] = f(i[n]);
          }
        }
        function resume(n, v) {
          try {
            step(g[n](v));
          } catch (e) {
            settle(q[0][3], e);
          }
        }
        function step(r) {
          r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
        }
        function fulfill(value) {
          resume("next", value);
        }
        function reject(value) {
          resume("throw", value);
        }
        function settle(f, v) {
          if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]);
        }
      };
      __asyncDelegator = function(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function(e) {
          throw e;
        }), verb("return"), i[Symbol.iterator] = function() {
          return this;
        }, i;
        function verb(n, f) {
          i[n] = o[n] ? function(v) {
            return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
          } : f;
        }
      };
      __asyncValues = function(o) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
          return this;
        }, i);
        function verb(n) {
          i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
              v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
          };
        }
        function settle(resolve, reject, d, v) {
          Promise.resolve(v).then(function(v2) {
            resolve({ value: v2, done: d });
          }, reject);
        }
      };
      __makeTemplateObject = function(cooked, raw) {
        if (Object.defineProperty) {
          Object.defineProperty(cooked, "raw", { value: raw });
        } else {
          cooked.raw = raw;
        }
        return cooked;
      };
      var __setModuleDefault = Object.create ? function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      } : function(o, v) {
        o["default"] = v;
      };
      __importStar = function(mod) {
        if (mod && mod.__esModule)
          return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
              __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
      __importDefault = function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      __classPrivateFieldGet = function(receiver, state, kind, f) {
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
          throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      };
      __classPrivateFieldSet = function(receiver, state, value, kind, f) {
        if (kind === "m")
          throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
          throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      };
      __classPrivateFieldIn = function(state, receiver) {
        if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
          throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
      };
      __addDisposableResource = function(env, value, async) {
        if (value !== null && value !== void 0) {
          if (typeof value !== "object" && typeof value !== "function")
            throw new TypeError("Object expected.");
          var dispose, inner;
          if (async) {
            if (!Symbol.asyncDispose)
              throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
          }
          if (dispose === void 0) {
            if (!Symbol.dispose)
              throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async)
              inner = dispose;
          }
          if (typeof dispose !== "function")
            throw new TypeError("Object not disposable.");
          if (inner)
            dispose = function() {
              try {
                inner.call(this);
              } catch (e) {
                return Promise.reject(e);
              }
            };
          env.stack.push({ value, dispose, async });
        } else if (async) {
          env.stack.push({ async: true });
        }
        return value;
      };
      var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
      };
      __disposeResources = function(env) {
        function fail(e) {
          env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
          env.hasError = true;
        }
        function next() {
          while (env.stack.length) {
            var rec = env.stack.pop();
            try {
              var result = rec.dispose && rec.dispose.call(rec.value);
              if (rec.async)
                return Promise.resolve(result).then(next, function(e) {
                  fail(e);
                  return next();
                });
            } catch (e) {
              fail(e);
            }
          }
          if (env.hasError)
            throw env.error;
        }
        return next();
      };
      exporter("__extends", __extends);
      exporter("__assign", __assign);
      exporter("__rest", __rest);
      exporter("__decorate", __decorate);
      exporter("__param", __param);
      exporter("__esDecorate", __esDecorate);
      exporter("__runInitializers", __runInitializers);
      exporter("__propKey", __propKey);
      exporter("__setFunctionName", __setFunctionName);
      exporter("__metadata", __metadata);
      exporter("__awaiter", __awaiter);
      exporter("__generator", __generator);
      exporter("__exportStar", __exportStar);
      exporter("__createBinding", __createBinding);
      exporter("__values", __values);
      exporter("__read", __read);
      exporter("__spread", __spread);
      exporter("__spreadArrays", __spreadArrays);
      exporter("__spreadArray", __spreadArray);
      exporter("__await", __await);
      exporter("__asyncGenerator", __asyncGenerator);
      exporter("__asyncDelegator", __asyncDelegator);
      exporter("__asyncValues", __asyncValues);
      exporter("__makeTemplateObject", __makeTemplateObject);
      exporter("__importStar", __importStar);
      exporter("__importDefault", __importDefault);
      exporter("__classPrivateFieldGet", __classPrivateFieldGet);
      exporter("__classPrivateFieldSet", __classPrivateFieldSet);
      exporter("__classPrivateFieldIn", __classPrivateFieldIn);
      exporter("__addDisposableResource", __addDisposableResource);
      exporter("__disposeResources", __disposeResources);
    });
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/attribute-selectors.js
var require_attribute_selectors = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/attribute-selectors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.attributeSelectors = void 0;
    exports.attributeSelectors = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/class-names.js
var require_class_names = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/class-names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.classNames = void 0;
    exports.classNames = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/constructor-checks.js
var require_constructor_checks = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/constructor-checks.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.constructorChecks = void 0;
    exports.constructorChecks = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/css-selectors.js
var require_css_selectors = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/css-selectors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cssSelectors = void 0;
    exports.cssSelectors = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/css-tokens.js
var require_css_tokens = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/css-tokens.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cssTokens = void 0;
    var schematics_1 = require("@angular/cdk/schematics");
    exports.cssTokens = {
      [schematics_1.TargetVersion.V18]: [
        {
          pr: "https://github.com/angular/components/pull/29026",
          changes: [
            {
              replace: "--mdc-form-field-label-text-color",
              replaceWith: "--mat-checkbox-label-text-color"
            },
            {
              replace: "--mdc-form-field-label-text-font",
              replaceWith: "--mat-checkbox-label-text-font"
            },
            {
              replace: "--mdc-form-field-label-text-line-height",
              replaceWith: "--mat-checkbox-label-text-line-height"
            },
            {
              replace: "--mdc-form-field-label-text-size",
              replaceWith: "--mat-checkbox-label-text-size"
            },
            {
              replace: "--mdc-form-field-label-text-tracking",
              replaceWith: "--mat-checkbox-label-text-tracking"
            },
            {
              replace: "--mdc-form-field-label-text-weight",
              replaceWith: "--mat-checkbox-label-text-weight"
            }
          ]
        }
      ]
    };
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/element-selectors.js
var require_element_selectors = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/element-selectors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.elementSelectors = void 0;
    exports.elementSelectors = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/input-names.js
var require_input_names = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/input-names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inputNames = void 0;
    exports.inputNames = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/method-call-checks.js
var require_method_call_checks = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/method-call-checks.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.methodCallChecks = void 0;
    exports.methodCallChecks = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/output-names.js
var require_output_names = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/output-names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.outputNames = void 0;
    exports.outputNames = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/property-names.js
var require_property_names = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/property-names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.propertyNames = void 0;
    exports.propertyNames = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/symbol-removal.js
var require_symbol_removal = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/symbol-removal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.symbolRemoval = void 0;
    exports.symbolRemoval = {};
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/index.js
var require_data = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/data/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require_tslib();
    tslib_1.__exportStar(require_attribute_selectors(), exports);
    tslib_1.__exportStar(require_class_names(), exports);
    tslib_1.__exportStar(require_constructor_checks(), exports);
    tslib_1.__exportStar(require_css_selectors(), exports);
    tslib_1.__exportStar(require_css_tokens(), exports);
    tslib_1.__exportStar(require_element_selectors(), exports);
    tslib_1.__exportStar(require_input_names(), exports);
    tslib_1.__exportStar(require_method_call_checks(), exports);
    tslib_1.__exportStar(require_output_names(), exports);
    tslib_1.__exportStar(require_property_names(), exports);
    tslib_1.__exportStar(require_symbol_removal(), exports);
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/upgrade-data.js
var require_upgrade_data = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/upgrade-data.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.materialUpgradeData = void 0;
    var data_1 = require_data();
    exports.materialUpgradeData = {
      attributeSelectors: data_1.attributeSelectors,
      classNames: data_1.classNames,
      constructorChecks: data_1.constructorChecks,
      cssSelectors: data_1.cssSelectors,
      cssTokens: data_1.cssTokens,
      elementSelectors: data_1.elementSelectors,
      inputNames: data_1.inputNames,
      methodCallChecks: data_1.methodCallChecks,
      outputNames: data_1.outputNames,
      propertyNames: data_1.propertyNames,
      symbolRemoval: data_1.symbolRemoval
    };
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/migrations/m2-theming-v18/migration.js
var require_migration = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/migrations/m2-theming-v18/migration.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateM2ThemingApiUsages = migrateM2ThemingApiUsages;
    var RENAMED_FUNCTIONS = [
      "define-light-theme",
      "define-dark-theme",
      "define-palette",
      "get-contrast-color-from-palette",
      "get-color-from-palette",
      "get-color-config",
      "get-typography-config",
      "get-density-config",
      "define-typography-level",
      "define-rem-typography-config",
      "define-typography-config",
      "define-legacy-typography-config",
      "typography-level",
      "font-size",
      "line-height",
      "font-weight",
      "letter-spacing",
      "font-family"
    ];
    var RENAMED_VARIABLES = [
      "red-palette",
      "pink-palette",
      "indigo-palette",
      "purple-palette",
      "deep-purple-palette",
      "blue-palette",
      "light-blue-palette",
      "cyan-palette",
      "teal-palette",
      "green-palette",
      "light-green-palette",
      "lime-palette",
      "yellow-palette",
      "amber-palette",
      "orange-palette",
      "deep-orange-palette",
      "brown-palette",
      "grey-palette",
      "gray-palette",
      "blue-grey-palette",
      "blue-gray-palette",
      "light-theme-background-palette",
      "dark-theme-background-palette",
      "light-theme-foreground-palette",
      "dark-theme-foreground-palette"
    ];
    var M3_FUNCTIONS = ["define-theme", "define-colors", "define-typography", "define-density"];
    var M3_VARIABLES = [
      "red-palette",
      "green-palette",
      "blue-palette",
      "yellow-palette",
      "cyan-palette",
      "magenta-palette",
      "orange-palette",
      "chartreuse-palette",
      "azure-palette",
      "violet-palette",
      "rose-palette"
    ];
    var COMMENT_PAIRS = /* @__PURE__ */ new Map([
      ["/*", "*/"],
      ["//", "\n"]
    ]);
    var COMMENT_PLACEHOLDER_START = "__<<ngM2ThemingMigrationEscapedComment";
    var COMMENT_PLACEHOLDER_END = ">>__";
    function migrateM2ThemingApiUsages(fileContent) {
      let { content, placeholders } = escapeComments(fileContent);
      const materialNamespaces = getNamespaces("@angular/material", content);
      const experimentalNamespaces = getNamespaces("@angular/material-experimental", content);
      for (const namespace of materialNamespaces) {
        for (const name of RENAMED_FUNCTIONS) {
          content = migrateFunction(content, namespace, name, namespace, "m2-" + name);
        }
        for (const name of RENAMED_VARIABLES) {
          content = migrateVariable(content, namespace, name, namespace, "m2-" + name);
        }
      }
      if (experimentalNamespaces.length > 0) {
        const preExperimentalContent = content;
        const stableNamespace = materialNamespaces.length === 0 ? "mat" : materialNamespaces[0];
        for (const namespace of experimentalNamespaces) {
          content = migrateMixin(content, namespace, "color-variants-back-compat", stableNamespace, "color-variants-backwards-compatibility");
          for (const name of M3_FUNCTIONS) {
            content = migrateFunction(content, namespace, name, stableNamespace, name);
          }
          for (const name of M3_VARIABLES) {
            content = migrateVariable(content, namespace, "m3-" + name, stableNamespace, name);
          }
        }
        if (materialNamespaces.length === 0 && content !== preExperimentalContent) {
          content = `@use '@angular/material' as ${stableNamespace};
` + content;
        }
      }
      return restoreComments(content, placeholders);
    }
    function migrateFunction(fileContent, oldNamespace, oldName, newNamespace, newName) {
      return fileContent.replace(new RegExp(`${oldNamespace}\\.${oldName}\\(`, "g"), `${newNamespace}.${newName}(`);
    }
    function migrateVariable(fileContent, oldNamespace, oldName, newNamespace, newName) {
      return fileContent.replace(new RegExp(`${oldNamespace}\\.\\$${oldName}(?!\\s+:|[-_a-zA-Z0-9:])`, "g"), `${newNamespace}.$${newName}`);
    }
    function migrateMixin(fileContent, oldNamespace, oldName, newNamespace, newName) {
      const pattern = new RegExp(`@include +${oldNamespace}\\.${oldName}`, "g");
      return fileContent.replace(pattern, `@include ${newNamespace}.${newName}`);
    }
    function escapeComments(content) {
      const placeholders = {};
      let commentCounter = 0;
      let [openIndex, closeIndex] = findComment(content);
      while (openIndex > -1 && closeIndex > -1) {
        const placeholder = COMMENT_PLACEHOLDER_START + commentCounter++ + COMMENT_PLACEHOLDER_END;
        placeholders[placeholder] = content.slice(openIndex, closeIndex);
        content = content.slice(0, openIndex) + placeholder + content.slice(closeIndex);
        [openIndex, closeIndex] = findComment(content);
      }
      return { content, placeholders };
    }
    function findComment(content) {
      content += "\n";
      for (const [open, close] of COMMENT_PAIRS.entries()) {
        const openIndex = content.indexOf(open);
        if (openIndex > -1) {
          const closeIndex = content.indexOf(close, openIndex + 1);
          return closeIndex > -1 ? [openIndex, closeIndex + close.length] : [-1, -1];
        }
      }
      return [-1, -1];
    }
    function restoreComments(content, placeholders) {
      Object.keys(placeholders).forEach((key) => content = content.replace(key, placeholders[key]));
      return content;
    }
    function extractNamespaceFromUseStatement(fullImport) {
      const closeQuoteIndex = Math.max(fullImport.lastIndexOf(`"`), fullImport.lastIndexOf(`'`));
      if (closeQuoteIndex > -1) {
        const asExpression = "as ";
        const asIndex = fullImport.indexOf(asExpression, closeQuoteIndex);
        if (asIndex > -1) {
          return fullImport.slice(asIndex + asExpression.length).split(";")[0].trim();
        }
        const lastSlashIndex = fullImport.lastIndexOf("/", closeQuoteIndex);
        if (lastSlashIndex > -1) {
          const fileName = fullImport.slice(lastSlashIndex + 1, closeQuoteIndex).replace(/^_|(\.import)?\.scss$|\.import$/g, "");
          if (fileName === "index") {
            const nextSlashIndex = fullImport.lastIndexOf("/", lastSlashIndex - 1);
            if (nextSlashIndex > -1) {
              return fullImport.slice(nextSlashIndex + 1, lastSlashIndex);
            }
          } else {
            return fileName;
          }
        }
      }
      throw Error(`Could not extract namespace from import "${fullImport}".`);
    }
    function getNamespaces(moduleName, content) {
      const namespaces = /* @__PURE__ */ new Set();
      const escapedName = moduleName.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
      const pattern = new RegExp(`@use +['"]${escapedName}['"].*;?\\r?\\n`, "g");
      let match = null;
      while (match = pattern.exec(content)) {
        namespaces.add(extractNamespaceFromUseStatement(match[0]));
      }
      return Array.from(namespaces);
    }
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/migrations/m2-theming-v18/index.js
var require_m2_theming_v18 = __commonJS({
  "bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/migrations/m2-theming-v18/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.M2ThemingMigration = void 0;
    var core_1 = require("@angular-devkit/core");
    var schematics_1 = require("@angular/cdk/schematics");
    var migration_1 = require_migration();
    var M2ThemingMigration2 = class extends schematics_1.DevkitMigration {
      constructor() {
        super(...arguments);
        this._potentialThemes = [];
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V18;
      }
      visitStylesheet(stylesheet) {
        if ((0, core_1.extname)(stylesheet.filePath) === ".scss" && stylesheet.content.includes("@angular/material")) {
          this._potentialThemes.push(stylesheet);
        }
      }
      postAnalysis() {
        for (const theme of this._potentialThemes) {
          const migrated = (0, migration_1.migrateM2ThemingApiUsages)(theme.content);
          if (migrated !== theme.content) {
            this.fileSystem.edit(theme.filePath).remove(0, theme.content.length).insertLeft(0, migrated);
            this.fileSystem.commitEdits();
          }
        }
      }
    };
    exports.M2ThemingMigration = M2ThemingMigration2;
  }
});

// bazel-out/k8-fastbuild/bin/src/material/schematics/ng-update/index.mjs
var ng_update_exports = {};
__export(ng_update_exports, {
  updateToV18: () => updateToV18
});
module.exports = __toCommonJS(ng_update_exports);
var import_schematics = require("@angular/cdk/schematics");
var import_upgrade_data = __toESM(require_upgrade_data(), 1);
var import_m2_theming_v18 = __toESM(require_m2_theming_v18(), 1);
var materialMigrations = [import_m2_theming_v18.M2ThemingMigration];
function updateToV18() {
  return (0, import_schematics.createMigrationSchematicRule)(import_schematics.TargetVersion.V18, materialMigrations, import_upgrade_data.materialUpgradeData, onMigrationComplete);
}
function onMigrationComplete(context, targetVersion, hasFailures) {
  context.logger.info("");
  context.logger.info(`  \u2713  Updated Angular Material to ${targetVersion}`);
  context.logger.info("");
  if (hasFailures) {
    context.logger.warn("  \u26A0  Some issues were detected but could not be fixed automatically. Please check the output above and fix these issues manually.");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateToV18
});
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=index_bundled.js.map
