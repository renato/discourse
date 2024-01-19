import $ from "jquery";
import { registerLexicalTextEntity } from "@lexical/text";
import { mergeRegister } from "@lexical/utils";
import { getOwnerWithFallback } from "discourse-common/lib/get-owner";
import { findRawTemplate } from "discourse-common/lib/raw-templates";
import {
  destroyUserStatuses,
  initUserStatusHtml,
  renderUserStatusHtml,
} from "discourse/lib/user-status-on-autocomplete";
import { caretPosition, inCodeBlock } from "discourse/lib/utilities";
import { $getSelection } from "lexical";
import { mentionRegex } from "pretty-text/addon/mentions";
import userSearch from "discourse/lib/user-search";
import { getDOMRange, getSelectedNode } from "../lib/helpers";
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from "../nodes/mention-node";
import MentionMenu from "./mention-menu";

// TODO debounce a username lookup to render different styles for valid/invalid mentions
// the composer preview does a single req like /composer/mentions?names%5B%5D=user1&names%5B%5D=user2

function getWord(selection) {
  const anchor = selection.anchor;

  if (!anchor || anchor.type !== "text") {
    return null;
  }

  const anchorNode = anchor.getNode();
  if (!$isMentionNode(anchorNode)) {
    return null;
  }

  const anchorOffset = anchor.offset;
  const lastSpace =
    anchorNode.getTextContent().lastIndexOf(" ", anchorOffset) + 1;
  return anchorNode.getTextContent().slice(lastSpace, anchorOffset);
}

function isCodeBlock() {
  // TODO
  return false;
}

function getItemMention(item) {
  return `@${item.username ?? item.name}`;
}

// TODO
let engine;

const textManipulationImpl = {
  performAutocomplete({
    me,
    options,
    state,
    updateAutoComplete,
    dataSource,
    checkTriggerRule,
  }) {
    engine.getEditorState().read(async () => {
      const selection = $getSelection();
      if (!selection) {
        return;
      }

      state.completeStart = 0;

      const term = getWord(selection);
      console.log({term});
      updateAutoComplete(dataSource(term, options));
    });
  }
};

export default function MentionPlugin(_engine, { menu, composer }) {
  engine = _engine;

  // TODO ignore if !siteSettings.enable_mentions

  // let menuInstance;
  // TODO destroy menuInstance

  return mergeRegister(
    // engine.registerUpdateListener(() => {
    //   engine.getEditorState().read(async () => {
    //     const selection = $getSelection();
    //     if (!selection) {
    //       return;
    //     }
    //
    //     const text = getWord(selection);
    //
    //     // TODO use siteSettings.unicode_usernames on mentionRegex
    //     if (!text || isCodeBlock(selection) || !mentionRegex().test(text)) {
    //       menuInstance?.close();
    //       return;
    //     }
    //
    //     const nativeSelection = window.getSelection();
    //
    //     // console.dir({selection}, {depth: null});
    //     // word where the caret is located may be a mention
    //     // console.log("mention", text);
    //     const range = getDOMRange(nativeSelection, engine.rootElement);
    //
    //     const searchOpts = {
    //       term: text,
    //       topicId: composer?.topic?.id,
    //       categoryId: composer?.topic?.category_id || composer?.categoryId,
    //       includeGroups: true,
    //     };
    //
    //     const items = await userSearch(searchOpts);
    //
    //     const hasSingleEqual =
    //       items.length === 1 && getItemMention(items[0]) === text;
    //     if (items !== "__CANCELLED" && items.length > 0 && !hasSingleEqual) {
    //       const options = {
    //         identifier: "d-editor-mention-menu",
    //         component: MentionMenu,
    //         inline: true,
    //         placement: "top-start",
    //         fallbackPlacements: ["bottom-start"],
    //         data: {
    //           items,
    //           onSelect(selected) {
    //             engine.update(() => {
    //               const mentionNode = $createMentionNode(
    //                 getItemMention(selected)
    //               );
    //               const node = getSelectedNode(selection);
    //               node.replace(mentionNode);
    //               mentionNode.selectEnd();
    //             });
    //             menuInstance?.close();
    //           },
    //         },
    //       };
    //
    //       menuInstance = await menu.show(range, options);
    //     }
    //   });
    // }),
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
