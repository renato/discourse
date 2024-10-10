export default {
  name: "move-up",
  label: "Move up",
  command(composer) {
    composer.moveSelectedNode("UP");
  },
  icon: "arrow-up",
  // TODO shouldRender only if not first
};
