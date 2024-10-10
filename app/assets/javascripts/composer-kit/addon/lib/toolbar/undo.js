export default {
  name: "undo",
  label: "Undo",
  icon: "undo",
  command(composer) {
    composer.undo();
  },
};
