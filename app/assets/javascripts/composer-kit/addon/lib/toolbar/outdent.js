export default {
  name: "outdent",
  label: "Outdent",
  command(composer) {
    composer.outdent();
  },
  icon: "arrow-left",
  shouldRender: ({ blockType }) => ["ul", "ol"].includes(blockType),
};
