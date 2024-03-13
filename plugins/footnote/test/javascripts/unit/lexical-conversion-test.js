import { getOwner } from "@ember/application";
import { setupTest } from "ember-qunit";
import { $convertToMarkdown } from "lexical-editor/lexical/exporter";
import {
  $convertFromMarkdownItTokens,
  markdownItTokens,
} from "lexical-editor/lexical/importer";
import { createHeadlessEditor } from "lexical-editor/lexical/lib/converters";
import { module, test } from "qunit";

module("discourse-footnote | lib | lexical-conversion", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const siteSettings = getOwner(this).lookup("service:site-settings");
    siteSettings.enable_markdown_footnotes = true;
  });

  hooks.afterEach(function () {
    const siteSettings = getOwner(this).lookup("service:site-settings");
    siteSettings.enable_markdown_footnotes = false;
  });

  test("from markdown equals to markdown", async function (assert) {
    const editor = createHeadlessEditor();

    const markdown = `A sentence with an inline footnote. ^[The
multiline inline footnote]

A sentence with a footnote. [^1]
Another sentence with a footnote. [^footnote_alias]
Reusing the first footnote. [^1]

[^1]: A multiline
footnote
[^footnote_alias]: The second footnote`;

    const tokens = await markdownItTokens(markdown);
    editor.update(() => $convertFromMarkdownItTokens(tokens), {
      discrete: true,
    });

    const generatedMarkdown = editor
      .getEditorState()
      .read(() => $convertToMarkdown());

    assert.strictEqual(generatedMarkdown, markdown, "footnote markdown is imported/exported correctly");
  });
});
