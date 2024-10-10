export default {
  name: "insert",
  label: "Insert",
  icon: "plus",
  options: [
    {
      icon: "paragraph",
      label: "Paragraph",
      command(composer) {
        composer.insertNode("paragraph");
      },
    },
    {
      icon: "heading",
      label: "Heading 1",
      command(composer) {
        composer.insertNode("heading", "h1");
      },
    },
    {
      icon: "heading",
      label: "Heading 2",
      command(composer) {
        composer.insertNode("heading", "h2");
      },
    },
    {
      icon: "heading",
      label: "Heading 3",
      command(composer) {
        composer.insertNode("heading", "h3");
      },
    },
    {
      icon: "list-ul",
      label: "Bulleted list",
      command(composer) {
        composer.insertNode("paragraph");
        composer.insertList("bullet");
      },
    },
    {
      icon: "list-ol",
      label: "Numbered list",
      command(composer) {
        composer.insertList("number");
      },
    },
    {
      icon: "quote-right",
      label: "Block quote",
      command(composer) {
        composer.insertNode("quote");
      },
    },
    {
      icon: "code",
      label: "Code block",
      command(composer) {
        composer.insertNode("code");
      },
    },
  ],
};
