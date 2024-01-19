import { tracked } from "@glimmer/tracking";
// Lexical uses Prism, not Highlight.js. Some more languages:
import "prismjs/components/prism-yaml";
import {
  $isCodeNode,
  getDefaultCodeLanguage,
  registerCodeHighlighting,
} from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { registerMarkdownShortcuts } from "@lexical/markdown";
import { $isHeadingNode, registerRichText } from "@lexical/rich-text";
import { $isParentElementRTL } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  createEditor,
} from "lexical";
import { getSelectedNode } from "./lib/helpers";
import { getLexicalNodes } from "./nodes";
import theme from "./theme";

export default class Editor {
  static create(element, config = {}) {
    return new this(element, config);
  }

  /**
   * @typedef {Object} CurrentState
   * @property {boolean} isBold
   * @property {boolean} isItalic
   * @property {boolean} isUnderline
   * @property {boolean} isStrikethrough
   * @property {boolean} isCode
   * @property {boolean} isRTL
   * @property {boolean} isLink
   * @property {string} blockType
   * @property {string} codeLanguage
   */
  /**
   * @type {CurrentState}
   */
  @tracked currentState = {};

  config = {};
  engine = null;
  element = null;

  constructor(element, transformers, config = {}) {
    this.element = element;

    this.config = {
      ...config,
      theme,
      nodes: getLexicalNodes(),
    };

    this.engine = createEditor(this.config);
    this.engine.setRootElement(element);

    this.teardown = mergeRegister(
      registerRichText(this.engine),
      registerMarkdownShortcuts(this.engine, transformers),
      registerCodeHighlighting(this.engine),
      this.engine.registerUpdateListener(({ editorState }) => {
        editorState.read(() => this.updateState());
      }),
      this.engine.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          this.canUndo = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      this.engine.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          this.canRedo = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }
  updateState() {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = this.engine.getElementByKey(elementKey);

      this.currentState = {
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
        isStrikethrough: selection.hasFormat("strikethrough"),
        isCode: selection.hasFormat("code"),
        isRTL: $isParentElementRTL(selection),
      };

      if (elementDOM !== null) {
        this.selectedElementKey = elementKey;
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          this.currentState.blockType = parentList
            ? parentList.getTag()
            : element.getTag();
        } else {
          this.currentState.blockType = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if ($isCodeNode(element)) {
            this.currentState.codeLanguage =
              element.getLanguage() || getDefaultCodeLanguage();
          }
        }
      }

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      this.currentState.isLink = !!($isLinkNode(parent) || $isLinkNode(node));
    }
  }
}
