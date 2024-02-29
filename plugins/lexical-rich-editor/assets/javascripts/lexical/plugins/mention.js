import { registerLexicalTextEntity } from "@lexical/text";
import { mergeRegister } from "@lexical/utils";
import { mentionRegex } from "pretty-text/mentions";
import { allowedLettersRegex } from "discourse/lib/autocomplete";
import {
  $createMentionNode,
  MentionNode,
} from "../nodes/mention-node";

// TODO use siteSettings.unicode_usernames on mentionRegex
const MENTION_REGEX = new RegExp(`(?<=^|${allowedLettersRegex.source})(${mentionRegex().source})`);

export default function MentionPlugin(engine) {
  return mergeRegister(
    ...registerLexicalTextEntity(
      engine,
      getMentionMatch,
      MentionNode,
      (textNode) => $createMentionNode(textNode.getTextContent())
    )
  );
}

function getMentionMatch(text) {
  const matchArr = MENTION_REGEX.exec(text);

  if (matchArr === null) {
    return null;
  }

  return { start: matchArr.index, end: matchArr.index + matchArr[0].length };
}
