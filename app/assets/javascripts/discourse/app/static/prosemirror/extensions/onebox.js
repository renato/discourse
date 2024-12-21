import {
  applyCachedInlineOnebox,
  cachedInlineOnebox,
} from "pretty-text/inline-oneboxer";
import { addToLoadingQueue, loadNext } from "pretty-text/oneboxer";
import { lookupCache } from "pretty-text/oneboxer-cache";
import { ajax } from "discourse/lib/ajax";

export default {
  nodeSpec: {
    onebox: {
      attrs: { url: {}, html: {} },
      selectable: true,
      group: "block",
      atom: true,
      draggable: true,
      parseDOM: [
        {
          tag: "aside.onebox",
          getAttrs(dom) {
            return { url: dom["data-onebox-src"], html: dom.outerHTML };
          },
        },
      ],
      toDOM(node) {
        const template = document.createElement("template");
        template.innerHTML = node.attrs.html;
        return template.content.firstChild;
      },
    },
    onebox_inline: {
      attrs: { url: {}, title: {} },
      inline: true,
      group: "inline",
      selectable: true,
      atom: true,
      draggable: true,
      parseDOM: [
        {
          // TODO link marks are still processed before this when pasting
          tag: "a.inline-onebox",
          getAttrs(dom) {
            return { url: dom.getAttribute("href"), title: dom.textContent };
          },
        },
      ],
      toDOM(node) {
        return [
          "a",
          {
            class: "inline-onebox",
            href: node.attrs.url,
            contentEditable: false,
          },
          node.attrs.title,
        ];
      },
    },
  },
  serializeNode: {
    onebox(state, node) {
      state.ensureNewLine();
      state.write(`${node.attrs.url}\n\n`);
    },
    onebox_inline(state, node) {
      if (!/(^|\n| )$/.test(state.out)) {
        state.write(" ");
      }
      state.text(`${node.attrs.url} `);
    },
  },

  plugins: ({ Plugin }) => {
    const plugin = new Plugin({
      state: {
        init() {
          return { full: {}, inline: {} };
        },
        apply(tr, value) {
          const updated = { full: [], inline: [] };

          console.log(tr.getMeta("autolinking"));

          // we shouldn't check all descendants, but only the ones that have changed
          // it's a problem in other plugins too where we need to optimize
          tr.doc.descendants((node, pos) => {
            // if node has the link mark
            const link = node.marks.find((mark) => mark.type.name === "link");
            if (
              !tr.getMeta("autolinking") &&
              !link?.attrs.autoLink &&
              link?.attrs.href === node.textContent
            ) {
              const resolvedPos = tr.doc.resolve(pos);

              const isAtRoot = resolvedPos.depth === 1;

              const parent = resolvedPos.parent;
              const index = resolvedPos.index();
              const prev = index > 0 ? parent.child(index - 1) : null;
              const next =
                index < parent.childCount - 1 ? parent.child(index + 1) : null;

              const isAlone =
                (!prev || prev.type.name === "hard_break") &&
                (!next || next.type.name === "hard_break");

              const isInline = !isAtRoot || !isAlone;

              const obj = isInline ? updated.inline : updated.full;

              obj[node.textContent] ??= [];
              obj[node.textContent].push(pos);
            }
          });

          return updated;
        },
      },

      view() {
        return {
          async update(view, prevState) {
            if (prevState.doc.eq(view.state.doc)) {
              return;
            }

            const { full, inline } = plugin.getState(view.state);

            for (const [url, list] of Object.entries(full)) {
              const html = await loadFullOnebox(url, view.props.discourse);

              const tr = view.state.tr;
              for (const pos of list) {
                const node = view.state.doc.nodeAt(pos);
                tr.replaceWith(
                  pos - 1,
                  pos + node.nodeSize,
                  view.state.schema.nodes.onebox.create({ url, html })
                );
              }
              view.dispatch(tr);
            }

            const inlineOneboxes = await loadInlineOneboxes(
              Object.keys(inline),
              view.props.discourse
            );

            const tr = view.state.tr;

            for (const [url, onebox] of Object.entries(inlineOneboxes)) {
              for (const pos of inline[url]) {
                const node = view.state.doc.nodeAt(pos);
                tr.replaceWith(
                  pos,
                  pos + node.nodeSize,
                  view.state.schema.nodes.onebox_inline.create({
                    url,
                    title: onebox.title,
                  })
                );
              }
            }

            view.dispatch(tr);
          },
        };
      },
    });

    return plugin;
  },
};

async function loadInlineOneboxes(urls, { categoryId, topicId }) {
  const allOneboxes = {};

  const uncachedUrls = [];
  for (const url of urls) {
    const cached = cachedInlineOnebox(url);
    if (cached) {
      allOneboxes[url] = cached;
    } else {
      uncachedUrls.push(url);
    }
  }

  if (uncachedUrls.length === 0) {
    return allOneboxes;
  }

  const { "inline-oneboxes": oneboxes } = await ajax("/inline-onebox", {
    data: { urls: uncachedUrls, categoryId, topicId },
  });

  oneboxes.forEach((onebox) => {
    if (onebox.title) {
      applyCachedInlineOnebox(onebox.url, onebox);
      allOneboxes[onebox.url] = onebox;
    }
  });

  return allOneboxes;
}

async function loadFullOnebox(url, { categoryId, topicId }) {
  const cached = lookupCache(url);
  if (cached) {
    return cached;
  }

  return new Promise((onResolve) => {
    addToLoadingQueue({ url, categoryId, topicId, onResolve });
    loadNext(ajax);
  });
}
