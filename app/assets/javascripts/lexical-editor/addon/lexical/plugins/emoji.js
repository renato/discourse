import { COMMAND_PRIORITY_LOW, PASTE_COMMAND } from "lexical";

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

export default function EmojiPlugin(engine) {
  return engine.registerCommand(
    PASTE_COMMAND,
    handleEmojiPaste,
    COMMAND_PRIORITY_LOW
  );
}
