import {
  classDb_default,
  classDiagram_default,
  classRenderer_v3_unified_default,
  styles_default
} from "./chunk-HCVG3JJI.mjs";
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

// src/diagrams/class/classDiagram.ts
var diagram = {
  parser: classDiagram_default,
  db: classDb_default,
  renderer: classRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.class) {
      cnf.class = {};
    }
    cnf.class.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    classDb_default.clear();
  }, "init")
};
export {
  diagram
};
