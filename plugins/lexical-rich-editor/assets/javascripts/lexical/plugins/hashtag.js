import { $createHashtagNode, HashtagNode } from "@lexical/hashtag";
import { registerLexicalTextEntity } from "@lexical/text";
import { mergeRegister } from "@lexical/utils";
import { ALLOWED_LETTERS_REGEXP } from "discourse/lib/autocomplete";

// TODO re-use if there's already a similar regex somewhere
const HASHTAG_REGEX = new RegExp(`(?<=^|${ALLOWED_LETTERS_REGEXP.source})#[a-zA-Z0-9_\\-:]+`);

export default function HashtagPlugin(engine) {
  return mergeRegister(
    ...registerLexicalTextEntity(
      engine,
      getHashtagMatch,
      HashtagNode,
      (textNode) => $createHashtagNode(textNode.getTextContent())
    )
  );
}

function getHashtagMatch(text) {
  const matchArr = HASHTAG_REGEX.exec(text);

  if (matchArr === null) {
    return null;
  }

  return { start: matchArr.index, end: matchArr.index + matchArr[0].length };
}
