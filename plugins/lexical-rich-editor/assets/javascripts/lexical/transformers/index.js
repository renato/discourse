import elementTransformers from "./element";
// import emojiTransformer from "./emoji";
import imageTransformer from "./image";
import mentionTransformer from "./mention";
import textFormatTransformers from "./text-format";
import textMatchTransformers from "./text-match";

// TODO This is currently only being used for registerMarkdownShortcuts

export default function getTransformers() {
  return [
    // emojiTransformer,
    imageTransformer,
    mentionTransformer,
    ...elementTransformers,
    ...textFormatTransformers,
    ...textMatchTransformers,
  ];
}
