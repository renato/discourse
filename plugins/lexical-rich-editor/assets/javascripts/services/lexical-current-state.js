import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Service from "@ember/service";
import { $isCodeNode, getDefaultCodeLanguage } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isParentElementRTL } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import { getSelectedNode } from "lexical-editor/lib/helpers";

// TODO refactor, shouldn't be a service
export default class LexicalCurrentState extends Service {
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

  @action
  updateState(editor) {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

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
