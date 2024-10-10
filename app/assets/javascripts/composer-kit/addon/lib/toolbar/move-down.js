export default {
  name: "move-down",
  label: "Move down",
  command(composer) {
    composer.moveSelectedNode("DOWN");
  },
  icon: "arrow-down",
  // TODO shouldRender only if not last
};
