import {
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import emojiTransformer from "./emoji";
import imageTransformer from "./image";
import mentionTransformer from "./mention";

// TODO This is currently only being used with registerMarkdownShortcuts

export default function getTransformers() {
  return [
    emojiTransformer,
    imageTransformer,
    mentionTransformer,
    ...ELEMENT_TRANSFORMERS,
    ...TEXT_FORMAT_TRANSFORMERS,
    ...TEXT_MATCH_TRANSFORMERS,
  ];
}
