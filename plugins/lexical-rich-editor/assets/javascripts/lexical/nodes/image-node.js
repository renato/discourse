import { $applyNodeReplacement, DecoratorNode } from "lexical";
import ImageComponent from "./image-component";

function convertImageElement(domNode) {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}

export class ImageNode extends DecoratorNode {
  static getType() {
    return "image";
  }

  static clone(serializedNode) {
    return new ImageNode(serializedNode);
  }

  static importJSON(serializedNode) {
    return $createImageNode(serializedNode);
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }
  __src;
  __shortUrl;
  __altText;
  __width;
  __height;
  __maxWidth;
  __isThumbnail;

  constructor({
    src,
    shortUrl,
    altText,
    title,
    maxWidth,
    width,
    height,
    isThumbnail,
    key,
  }) {
    super(key);

    this.__src = src;
    this.__shortUrl = shortUrl;
    this.__altText = altText;
    this.__title = title;
    this.__maxWidth = maxWidth;
    this.__width = width;
    this.__height = height;
    this.__isThumbnail = isThumbnail;
  }
  exportDOM() {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("width", this.__width.toString());
    element.setAttribute("height", this.__height.toString());
    return { element };
  }

  exportJSON() {
    return {
      altText: this.altText,
      height: this.height,
      maxWidth: this.__maxWidth,
      src: this.src,
      shortUrl: this.shortUrl,
      type: "image",
      version: 1,
      width: this.__width,
    };
  }

  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  get src() {
    return this.__src;
  }
  set src(src) {
    const writable = this.getWritable();
    writable.__src = src;
  }

  createDOM(config) {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }

    return span;
  }

  updateDOM() {
    return false;
  }

  get shortUrl() {
    return this.__shortUrl;
  }

  get altText() {
    return this.__altText;
  }

  get title() {
    return this.__title;
  }

  get width() {
    return this.__width;
  }

  get height() {
    return this.__height;
  }

  get isThumbnail() {
    return this.__isThumbnail;
  }

  decorate() {
    return { component: ImageComponent, data: this };
  }
}

export function $createImageNode(serializedNode) {
  return $applyNodeReplacement(new ImageNode(serializedNode));
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
