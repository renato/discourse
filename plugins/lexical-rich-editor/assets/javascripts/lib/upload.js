import {
  isAudio,
  isImage,
  isVideo,
  markdownNameFromFileName,
} from "discourse/lib/uploads";
import { INSERT_IMAGE_COMMAND } from "../lexical/plugins/image";

function uploadToImageData(upload) {
  return {
    src: upload.url,
    shortUrl: upload.short_url,
    height: upload.thumbnail_height,
    width: upload.thumbnail_width,
    altText: markdownNameFromFileName(upload.original_filename),
  };
}

export function dispatchInsertCommand(upload, engine) {
  if (isImage(upload.original_filename)) {
    engine.dispatchCommand(INSERT_IMAGE_COMMAND, uploadToImageData(upload));
  } else if (isAudio(upload.original_filename)) {
    // TODO
    // return playableMediaMarkdown(upload, "audio");
  } else if (isVideo(upload.original_filename)) {
    // TODO
    // return playableMediaMarkdown(upload, "video");
  } else {
    // TODO
    // return attachmentMarkdown(upload);
  }
}
