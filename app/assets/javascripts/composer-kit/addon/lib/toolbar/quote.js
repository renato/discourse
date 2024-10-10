export default {
  name: "quote",
  label: "Quote",
  icon: "quote-right",
  command(composer) {
    composer.quoteSelection();
  },
};
