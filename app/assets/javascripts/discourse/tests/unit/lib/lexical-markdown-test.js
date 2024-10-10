import DiscourseMarkdownIt from "discourse-markdown-it";
import { setupTest } from "ember-qunit";
import { $convertToMarkdown } from "lexical-editor/lexical/exporter";
import {
  $convertFromMarkdownItTokens,
  markdownItTokens,
} from "lexical-editor/lexical/importer";
import { createHeadlessEditor } from "lexical-editor/lexical/lib/converters";
import { module, test } from "qunit";

const testCases = [
  {
    name: "it works with a quick reference",
    markdown: `# Title
Sub-title
---------

### Sub-sub-title ###

> This chunk of text is in a block quote. Its multiple lines will all be
> indented a bit from the rest of the text.
>
> > Multiple levels of block quotes also work.

    Code fences

>     Code fences

# This is H1
## This is H2
### This is H3 with some extra pounds ###
#### You get the idea ####
##### I don't need extra pounds at the end
###### H6 is the max

# Links

Bare URL: <https://www.github.com>.
Next is an inline link to [Google](https://www.google.com).
This is a reference-style link to [Wikipedia] [1].
Lastly, here's a pretty link to [YahoO].

[1]: https://www.wikipedia.org
[Yahoo]: https://www.yahoo.com

Title attribute [inline link](https://www.bing.com "Bing").
You can also go to [W3C] [2] and maybe visit a [friend].

[2]: https://w3c.org (The W3C puts out specs for web-based things)
[Friend]: https://facebook.com "Facebook!"

Email addresses in plain text: test@example.com.
Email addresses in angle brackets: <test@example.com>.

# Lists

* This is a bulleted list
* Great for shopping lists
- You can also use hyphens
+ Or plus symbols

The above is an "unordered" list. Now, on for a bit of order.

1. Numbered lists are also easy
2. Just start with a number
3738762. However, the actual number doesn't matter when converted to HTML.
1. This will still show up as 4.

You might want a few advanced lists:

- This top-level list is wrapped in paragraph tags
- This generates an extra space between each top-level item.

- You do it by adding a blank line

- This nested list also has blank lines between the list items.

- How to create nested lists
  1. Start your regular list
  2. Indent nested lists with two spaces
  3. Further nesting means you should indent with two more spaces
    * This line is indented with four spaces.

- List items can be quite lengthy. You can keep typing and either continue
them on the next line with no indentation.

- Alternately, if that looks ugly, you can also
  indent the next line a bit for a prettier look.

- You can put large blocks of text in your list by just indenting with two spaces.

  This is formatted the same as code, but it's not.

  You can keep adding more and more paragraphs.

  You really only need to indent the first line,
but that looks ugly.

- Lists support blockquotes

  > Just like this example here. By the way, you can
  > nest lists inside blockquotes!
  > - Fantastic!

- Lists support preformatted text

      You just need to indent an additional four spaces.

# Horizontal Rule


---
****************************
_ _ _ _ _ _ _

# Images

![Google Logo](https://www.google.com/images/errors/logo_sm.gif) and ![Happy].

[Happy]: https://wpclipart.com/smiley/happy/simple_colors/smiley_face_simple_green_small.png ("Smiley face")

# Inline HTML

<strike>crazy</strike> HTML. Span-level HTML <u>can *still* use markdown</u>.

<div style='font-family: "Comic Sans MS", "Comic Sans", cursive;'>
Another HTML test
</div>`,
  },
];

const rawOpts = {
  siteSettings: {
    enable_emoji: true,
    enable_emoji_shortcuts: true,
    enable_mentions: true,
    emoji_set: "twitter",
    external_emoji_url: "",
    highlighted_languages: "json|ruby|javascript|xml",
    default_code_lang: "auto",
    enable_markdown_linkify: true,
    markdown_linkify_tlds: "com",
    display_name_on_posts: false,
    prioritize_username_in_ux: true,
  },
  getURL: (url) => url,
};

function build(options = rawOpts) {
  return DiscourseMarkdownIt.withDefaultFeatures().withOptions(options);
}

module("Unit | Utility | Lexical markdown importer", function (hooks) {
  setupTest(hooks);
  test("from markdown equals to markdown", async function (assert) {
    const editor = createHeadlessEditor();

    for (const testCase of testCases) {
      const tokens = await markdownItTokens(testCase.markdown);
      editor.update(() => $convertFromMarkdownItTokens(tokens), {
        discrete: true,
      });

      const generatedMarkdown = editor
        .getEditorState()
        .read(() => $convertToMarkdown());

      const markdownIt = build();
      const originalCooked = markdownIt.cook(testCase.markdown);
      const generatedCooked = markdownIt.cook(generatedMarkdown);

      assert.strictEqual(
        originalCooked,
        generatedCooked,
        "cooked HTML output should be equal"
      );
    }
  });
});
