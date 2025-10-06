This file compiles the list of functional changes for each version. For backward-incompatible API changes, see `UPGRADING.md`.


# 2.0.0

 - The final expression does not use a non-capturing group for its first set of alternations. The `s9e\RegexpBuilder\Builder::$standalone` property can be used to control this behaviour.
     - Old: `(?:aa|bb(?:cc|dd))
     - New: `aa|bb(?:cc|dd)`

 - The Java output uses `\uHHHH` instead of `\u{HHHH}`.

 - Expressions created from meta-characters are moved to the end of a group.
     - Old: `(?:.*|x)`
     - New: `(?:x|.*)`

 - Strings are sorted *after* surrogate pairs are created.
     - Old: `\uD83C\uDD90(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?`
     - New: `\uD83C\uDD90(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?`

