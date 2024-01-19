import { $createImageNode, $isImageNode, ImageNode } from "../nodes/image-node";

const UPLOAD_PREFIX = "upload://";

export default {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }

    const thumbnail = node.isThumbnail ? "|thumbnail" : "";

    return `![${node.altText}|${node.width}x${node.height}${thumbnail}](${
      node.shortUrl ?? node.src
    })`;
  },
  // importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  importRegExp:
    /!(?:\[([^|\]]*)\|?(?:(\d+)x(\d+))?(?:\|(thumbnail))?\])(?:\(([^(]+)\))/,
  regExp:
    /!(?:\[([^|\]]*)\|?(?:(\d+)x(\d+))?(?:\|(thumbnail))?\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, width, height, thumbnail, src] = match;
    const isThumbnail = thumbnail === "thumbnail";
    // console.log("replace", { altText, width, height, thumbnail, src });

    const imageNode = $createImageNode({
      altText,
      width,
      height,
      src: src?.startsWith(UPLOAD_PREFIX) ? null : src,
      shortUrl: src.startsWith(UPLOAD_PREFIX) ? src : null,
      isThumbnail,
    });

    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};
