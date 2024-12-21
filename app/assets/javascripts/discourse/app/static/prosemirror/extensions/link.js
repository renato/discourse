import { generateLinkifyFunction } from "discourse/static/markdown-it";

const markdownUrlInputRule = ({ schema, markInputRule }) =>
  markInputRule(
    /\[([^\]]+)]\(([^)\s]+)(?:\s+[“"']([^“"']+)[”"'])?\)$/,
    schema.marks.link,
    (match) => {
      return { href: match[2], title: match[3] };
    }
  );

const linkify = generateLinkifyFunction();

export default {
  markSpec: {
    link: {
      attrs: {
        href: {},
        title: { default: null },
        autoLink: { default: null },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(dom) {
            return {
              href: dom.getAttribute("href"),
              title: dom.getAttribute("title"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["a", node.attrs];
      },
    },
  },
  parse: {
    link: {
      mark: "link",
      getAttrs: (tok) => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title") || null,
        autoLink: tok.markup === "autolink",
      }),
    },
  },
  inputRules: [markdownUrlInputRule],
  plugins: ({
    Plugin,
    Slice,
    Fragment,
    undoDepth,
    ReplaceAroundStep,
    ReplaceStep,
    AddMarkStep,
    RemoveMarkStep,
  }) =>
    new Plugin({
      // Auto-linkify typed URLs
      appendTransaction: (transactions, prevState, state) => {
        const isUndo = undoDepth(prevState) - undoDepth(state) === 1;
        if (isUndo) {
          return;
        }

        const docChanged = transactions.some(
          (transaction) => transaction.docChanged
        );
        if (!docChanged) {
          return;
        }

        const composedTransaction = composeSteps(transactions, prevState);
        const changes = getChangedRanges(
          composedTransaction,
          [ReplaceAroundStep, ReplaceStep],
          [AddMarkStep, ReplaceAroundStep, ReplaceStep, RemoveMarkStep]
        );
        const { mapping } = composedTransaction;
        const { tr, doc } = state;

        for (const { prevFrom, prevTo, from, to } of changes) {
          findTextBlocksInRange(doc, { from, to }).forEach(
            ({ text, positionStart }) => {
              const matches = linkify.match(text);
              if (!matches) {
                return;
              }

              for (const match of matches) {
                const { index, lastIndex, raw } = match;
                const start = positionStart + index;
                const end = positionStart + lastIndex + 1;
                const href = raw;
                tr.setMeta("autolinking", true).addMark(
                  start,
                  end,
                  state.schema.marks.link.create({ href })
                );
              }
            }
          );
        }

        return tr;
      },
      props: {
        // Auto-linkify plain-text pasted URLs
        clipboardTextParser(text, $context, plain, view) {
          if (view.state.selection.empty || !linkify.test(text)) {
            return;
          }

          const marks = $context.marks();
          const selectedText = view.state.doc.textBetween(
            view.state.selection.from,
            view.state.selection.to
          );
          const textNode = view.state.schema.text(selectedText, [
            ...marks,
            view.state.schema.marks.link.create({ href: text }),
          ]);
          return new Slice(Fragment.from(textNode), 0, 0);
        },

        // Auto-linkify rich content with a single text node that is a URL
        transformPasted(paste, view) {
          if (
            paste.content.childCount === 1 &&
            paste.content.firstChild.isText &&
            !paste.content.firstChild.marks.some(
              (mark) => mark.type.name === "link"
            )
          ) {
            const matches = linkify.match(paste.content.firstChild.text);
            const isFullMatch =
              matches &&
              matches.length === 1 &&
              matches[0].raw === paste.content.firstChild.text;

            if (!isFullMatch) {
              return paste;
            }

            const marks = view.state.selection.$head.marks();
            const originalText = view.state.doc.textBetween(
              view.state.selection.from,
              view.state.selection.to
            );
            const textNode = view.state.schema.text(originalText, [
              ...marks,
              view.state.schema.marks.link.create({
                href: paste.content.firstChild.text,
              }),
            ]);
            paste = new Slice(Fragment.from(textNode), 0, 0);
          }
          return paste;
        },
      },
    }),
};

function composeSteps(transactions, prevState) {
  const { tr } = prevState;

  transactions.forEach((transaction) => {
    transaction.steps.forEach((step) => {
      tr.step(step);
    });
  });

  return tr;
}

function getChangedRanges(tr, replaceTypes, rangeTypes) {
  const ranges = [];
  const { steps, mapping } = tr;
  const inverseMapping = mapping.invert();

  steps.forEach((step, i) => {
    if (!isValidStep(step, replaceTypes)) {
      return;
    }

    const rawRanges = [];
    const stepMap = step.getMap();
    const mappingSlice = mapping.slice(i);

    if (stepMap.ranges.length === 0 && isValidStep(step, rangeTypes)) {
      const { from, to } = step;
      rawRanges.push({ from, to });
    } else {
      stepMap.forEach((from, to) => {
        rawRanges.push({ from, to });
      });
    }

    rawRanges.forEach((range) => {
      const from = mappingSlice.map(range.from, -1);
      const to = mappingSlice.map(range.to);

      ranges.push({
        from,
        to,
        prevFrom: inverseMapping.map(from, -1),
        prevTo: inverseMapping.map(to),
      });
    });
  });

  return ranges.sort((a, z) => a.from - z.from);
}

function isValidStep(step, types) {
  return types.some((type) => step instanceof type);
}

function findTextBlocksInRange(doc, range) {
  const nodesWithPos = [];

  // define a placeholder for leaf nodes to calculate link position
  doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (!node.isTextblock || !node.type.allowsMarkType("link")) {
      return;
    }

    nodesWithPos.push({ node, pos });
  });

  return nodesWithPos.map((textBlock) => ({
    text: doc.textBetween(
      textBlock.pos,
      textBlock.pos + textBlock.node.nodeSize,
      undefined,
      " "
    ),
    positionStart: textBlock.pos,
  }));
}
