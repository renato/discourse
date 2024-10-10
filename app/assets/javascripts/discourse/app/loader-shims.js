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
loaderShim("truth-helpers", () => importSync("truth-helpers"));
loaderShim("truth-helpers/helpers/and", () =>
  importSync("truth-helpers/helpers/and")
);
loaderShim("truth-helpers/helpers/eq", () =>
  importSync("truth-helpers/helpers/eq")
);
loaderShim("truth-helpers/helpers/gt", () =>
  importSync("truth-helpers/helpers/gt")
);
loaderShim("truth-helpers/helpers/gte", () =>
  importSync("truth-helpers/helpers/gte")
);
loaderShim("truth-helpers/helpers/includes", () =>
  importSync("truth-helpers/helpers/includes")
);
loaderShim("truth-helpers/helpers/lt", () =>
  importSync("truth-helpers/helpers/lt")
);
loaderShim("truth-helpers/helpers/lte", () =>
  importSync("truth-helpers/helpers/lte")
);
loaderShim("truth-helpers/helpers/not-eq", () =>
  importSync("truth-helpers/helpers/not-eq")
);
loaderShim("truth-helpers/helpers/not", () =>
  importSync("truth-helpers/helpers/not")
);
loaderShim("truth-helpers/helpers/or", () =>
  importSync("truth-helpers/helpers/or")
);
loaderShim("@messageformat/runtime/messages", () =>
  importSync("@messageformat/runtime/messages")
);
loaderShim("@messageformat/runtime", () =>
  importSync("@messageformat/runtime")
);
loaderShim("@messageformat/runtime/lib/cardinals", () =>
  importSync("@messageformat/runtime/lib/cardinals")
);
loaderShim("@ember/string", () => importSync("@ember/string"));

// TODO this is necessary so details/footnotes/spoiler plugins can import Lexical classes
// And, of course, the lexical-rich-editor plugin itself;
loaderShim("lexical", () => importSync("lexical"));
loaderShim("@lexical/plain-text", () => importSync("@lexical/plain-text"));
loaderShim("@lexical/history", () => importSync("@lexical/history"));
loaderShim("@lexical/utils", () => importSync("@lexical/utils"));
loaderShim("@lexical/code", () => importSync("@lexical/code"));
loaderShim("@lexical/selection", () => importSync("@lexical/selection"));

loaderShim("@lexical/link", () => importSync("@lexical/link"));
loaderShim("@lexical/list", () => importSync("@lexical/list"));
loaderShim("@lexical/rich-text", () => importSync("@lexical/rich-text"));
loaderShim("@lexical/table", () => importSync("@lexical/table"));
loaderShim("@lexical/text", () => importSync("@lexical/text"));
loaderShim("@lexical/hashtag", () => importSync("@lexical/hashtag"));
loaderShim("@lexical/clipboard", () => importSync("@lexical/clipboard"));
loaderShim("mdast-util-to-markdown", () =>
  importSync("mdast-util-to-markdown")
);
loaderShim("@tiptap/core", () => importSync("@tiptap/core"));
loaderShim("@tiptap/pm", () => importSync("@tiptap/pm"));
loaderShim("@tiptap/pm/model", () => importSync("@tiptap/pm/model"));
loaderShim("@tiptap/pm/state", () => importSync("@tiptap/pm/state"));
loaderShim("@tiptap/starter-kit", () => importSync("@tiptap/starter-kit"));
loaderShim("@tiptap/extension-link", () =>
  importSync("@tiptap/extension-link")
);
