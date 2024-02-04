import { importSync } from "@embroider/macros";
import loaderShim from "discourse-common/lib/loader-shim";

// AMD shims for the app bundle, see the comment in loader-shim.js
// These effectively become public APIs for plugins, so add/remove them carefully
loaderShim("@discourse/itsatrap", () => importSync("@discourse/itsatrap"));
loaderShim("@ember-compat/tracked-built-ins", () =>
  importSync("@ember-compat/tracked-built-ins")
);
loaderShim("@popperjs/core", () => importSync("@popperjs/core"));
loaderShim("@floating-ui/dom", () => importSync("@floating-ui/dom"));
loaderShim("@uppy/aws-s3", () => importSync("@uppy/aws-s3"));
loaderShim("@uppy/aws-s3-multipart", () =>
  importSync("@uppy/aws-s3-multipart")
);
loaderShim("@uppy/core", () => importSync("@uppy/core"));
loaderShim("@uppy/drop-target", () => importSync("@uppy/drop-target"));
loaderShim("@uppy/utils/lib/AbortController", () =>
  importSync("@uppy/utils/lib/AbortController")
);
loaderShim("@uppy/utils/lib/delay", () => importSync("@uppy/utils/lib/delay"));
loaderShim("@uppy/utils/lib/EventTracker", () =>
  importSync("@uppy/utils/lib/EventTracker")
);
loaderShim("@uppy/xhr-upload", () => importSync("@uppy/xhr-upload"));
loaderShim("a11y-dialog", () => importSync("a11y-dialog"));
loaderShim("discourse-i18n", () => importSync("discourse-i18n"));
loaderShim("ember-modifier", () => importSync("ember-modifier"));
loaderShim("ember-route-template", () => importSync("ember-route-template"));
loaderShim("handlebars", () => importSync("handlebars"));
loaderShim("jquery", () => importSync("jquery"));
loaderShim("js-yaml", () => importSync("js-yaml"));
loaderShim("message-bus-client", () => importSync("message-bus-client"));
loaderShim("virtual-dom", () => importSync("virtual-dom"));
loaderShim("xss", () => importSync("xss"));

// TODO this is necessary so details/footnotes/spoiler plugins can import Lexical classes
// And, of course, the lexical-rich-editor plugin itself.
// In an ideal world, theme components will be able to import packages
loaderShim("lexical", () => importSync("lexical"));
loaderShim("@lexical/utils", () => importSync("@lexical/utils"));
loaderShim("@lexical/code", () => importSync("@lexical/code"));
loaderShim("@lexical/link", () => importSync("@lexical/link"));
loaderShim("@lexical/list", () => importSync("@lexical/list"));
loaderShim("@lexical/rich-text", () => importSync("@lexical/rich-text"));
loaderShim("@lexical/table", () => importSync("@lexical/table"));
loaderShim("@lexical/selection", () => importSync("@lexical/selection"));
loaderShim("@lexical/text", () => importSync("@lexical/text"));
loaderShim("@lexical/markdown", () => importSync("@lexical/markdown"));
loaderShim("@lexical/hashtag", () => importSync("@lexical/hashtag"));
loaderShim("@lexical/clipboard", () => importSync("@lexical/clipboard"));
loaderShim("mdast-util-to-markdown", () =>
  importSync("mdast-util-to-markdown")
);
