import { registerLexicalTextEntity } from "@lexical/text";
import { mergeRegister } from "@lexical/utils";
import { mentionRegex } from "pretty-text/mentions";
import {
  $createMentionNode,
  MentionNode,
} from "../nodes/mention-node";

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
  // TODO use siteSettings.unicode_usernames on mentionRegex
  const matchArr = mentionRegex().exec(text);

  if (matchArr === null) {
    return null;
  }

  return { start: matchArr.index, end: matchArr.index + matchArr[0].length };
}
