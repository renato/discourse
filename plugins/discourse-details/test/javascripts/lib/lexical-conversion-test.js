import { setupTest } from "ember-qunit";
import { $convertToMarkdown } from "lexical-editor/lexical/exporter";
import {
  $convertFromMarkdownItTokens,
  markdownItTokens,
} from "lexical-editor/lexical/importer";
import { createHeadlessEditor } from "lexical-editor/lexical/lib/converters";
import { module, test } from "qunit";

module("discourse-details | lib | lexical-conversion", function (hooks) {
  setupTest(hooks);

  test("from markdown equals to markdown", async function (assert) {
    const editor = createHeadlessEditor();

    const markdown = `[details="Details title"]
# title

* list item
[/details]
`;

    const tokens = await markdownItTokens(markdown);
    editor.update(() => $convertFromMarkdownItTokens(tokens), {
      discrete: true,
    });

    const generatedMarkdown = editor
      .getEditorState()
      .read(() => $convertToMarkdown());

    assert.strictEqual(generatedMarkdown, markdown, "details markdown is imported/exported correctly");
  });
});
