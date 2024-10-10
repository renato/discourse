

export default {
  name: "indent",
  label: "Indent",
  command(composer) {
    composer.indent();
  },
  icon: "arrow-right",
  shouldRender: ({ blockType }) => ["ul", "ol"].includes(blockType),
};
