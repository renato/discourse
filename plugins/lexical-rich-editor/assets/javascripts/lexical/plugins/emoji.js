import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND, TextNode } from "lexical";
import { translations } from "pretty-text/emoji/data";
import { $createEmojiNode } from "../nodes/emoji-node";

/*
async function getTypeFromObject(clipboardData, type) {
  try {
    return clipboardData instanceof DataTransfer
      ? clipboardData.getData(type)
      : clipboardData instanceof ClipboardItem
      ? await (await clipboardData.getType(type)).text()
      : "";
  } catch {
    return "";
  }
}*/

function handleEmojiPaste(event, editor) {
  editor.update(async () => {
    // let clipboardData =
    //   (event instanceof InputEvent ? null : event.clipboardData) || null;
    // TODO: handle image pastes that are actually Discourse emojis
    // console.log(await getTypeFromObject(clipboardData, "text/html"));
  });
}

function findAndTransformEmoji(node) {
  const text = node.getTextContent();

  // replace any occurrence of the translations key by the value
  // the size isn't fixed as 2
  for (const [key, value] of Object.entries(translations)) {
    const index = text.indexOf(key);

    if (index !== -1) {
      const targetNode = node.splitText(index, key.length);
      const emojiNode = $createEmojiNode(value);
      targetNode.replace(emojiNode);
      return emojiNode;
    }
  }



  if (false) {
    // TODO test if an emoji can appear here
    const emojiData = translations[text[i]] || translations[text.slice(i, i + 2)];

    if (emojiData === undefined) {
      // TODO re-use existing regex
      if (/:([a-z0-9_]+):/.test(text.slice(i))) {
        i += 1;
      }

    } else {
      let targetNode;

      if (i === 0) {
        [targetNode] = node.splitText(i + 2);
      } else {
        [, targetNode] = node.splitText(i, i + 2);
      }

      const emojiNode = $createEmojiNode(emojiData);
      targetNode.replace(emojiNode);
      return emojiNode;
    }
  }

  return null;
}


export default function EmojiPlugin(engine) {
  return mergeRegister(
    engine.registerCommand(
      PASTE_COMMAND,
      handleEmojiPaste,
      COMMAND_PRIORITY_LOW
    ),
    engine.registerNodeTransform(TextNode, (node) => {
      let targetNode = node;

      while (targetNode !== null) {
        // if (!targetNode.isSimpleText()) {
        //   return;
        // }

        targetNode = findAndTransformEmoji(targetNode);
      }
    })
  );
}
