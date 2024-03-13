import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { buildEmojiUrl, isCustomEmoji } from "pretty-text/emoji";
import { emojiOptions } from "discourse/lib/text";

function imageFor(code, opts) {
  code = code.toLowerCase();
  const url = buildEmojiUrl(code, opts);
  if (url) {
    const title = `:${code}:`;
    const classes = isCustomEmoji(code, opts) ? "emoji emoji-custom" : "emoji";
    return { url, title, classes };
  }
}

export default class EmojiComponent extends Component {
  @tracked isOnlyEmoji;

  image = imageFor(this.args.data.__emojiName, emojiOptions());

  constructor() {
    super(...arguments);

    this.updateIsOnlyEmoji();

    this.teardownRegisters = this.args.editor.registerUpdateListener(() =>
      this.updateIsOnlyEmoji()
    );
  }

  updateIsOnlyEmoji() {
    this.isOnlyEmoji = this.args.editor
      .getEditorState()
      .read(() => this.args.data.getParent().getChildrenSize() === 1);
  }

  get classes() {
    return this.image.classes + (this.isOnlyEmoji ? " only-emoji" : "");
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.teardownRegisters();
  }

  <template>
    <img
      src={{this.image.url}}
      alt={{this.image.title}}
      title={{this.image.title}}
      class={{this.classes}}
      loading="lazy"
      width="20"
      height="20"
    />
  </template>
}
