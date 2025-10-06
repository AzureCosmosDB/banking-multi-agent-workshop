import {
  stateDb_default,
  stateDiagram_default,
  stateRenderer_v3_unified_default,
  styles_default
} from "./chunk-LT65WG3R.mjs";
import "./chunk-HL6ZG6DQ.mjs";
import "./chunk-GNHAFPA7.mjs";
import "./chunk-3BWXXFTK.mjs";
import "./chunk-RWEIGK6A.mjs";
import "./chunk-VKJI5BFR.mjs";
import "./chunk-SVWLYT5M.mjs";
import "./chunk-LU4NW57Z.mjs";
import "./chunk-KBGNOQRL.mjs";
import "./chunk-YSL6RPJU.mjs";
import "./chunk-GKOISANM.mjs";
import "./chunk-QWSBXEHK.mjs";
import "./chunk-HD3LK5B5.mjs";
import {
  __name
} from "./chunk-DLQEHMXD.mjs";

// src/diagrams/state/stateDiagram-v2.ts
var diagram = {
  parser: stateDiagram_default,
  db: stateDb_default,
  renderer: stateRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.state) {
      cnf.state = {};
    }
    cnf.state.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    stateDb_default.clear();
  }, "init")
};
export {
  diagram
};
