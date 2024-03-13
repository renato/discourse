import { action, observer } from "@ember/object";
import Mixin from "@ember/object/mixin";

/**
 * TODO !!!! This is TOO hacky, just an attempt to separate the text manipulation logic
 *      in the composer and toolbar actions without changing core too much. WILL BE REMOVED!
 *
 * Ideally, we would re-implement the toolbar with a new higher level plugin API,
 * not relying on these methods directly.
 *
 */
export default Mixin.create({
  init() {
    this._super(...arguments);
  },

  textManipulationImplChanged: observer("textManipulationImpl", function () {
    this.textManipulationImpl.init.call(this, ...arguments);
  }),

  focusTextArea() {
    this.textManipulationImpl.focusTextArea.call(this, ...arguments);
  },

  insertBlock() {
    this.textManipulationImpl.insertBlock.call(this, ...arguments);
  },

  insertText() {
    this.textManipulationImpl.insertText.call(this, ...arguments);
  },

  getSelected() {
    return this.textManipulationImpl.getSelected.call(this, ...arguments);
  },

  selectText() {
    return this.textManipulationImpl.selectText.call(this, ...arguments);
  },

  replaceText() {
    return this.textManipulationImpl.replaceText.call(this, ...arguments);
  },

  applySurround() {
    Object.assign(this.textManipulationImpl, this);
    this.textManipulationImpl.applySurround(...arguments);
  },

  addText() {
    this.textManipulationImpl.addText.call(this, ...arguments);
  },

  extractTable() {
    this.textManipulationImpl.extractTable.call(this, ...arguments);
  },

  isInside() {
    return this.textManipulationImpl.isInside.call(this, ...arguments);
  },

  paste() {
    return this.textManipulationImpl.paste.call(this, ...arguments);
  },

  indentSelection() {
    this.textManipulationImpl.indentSelection.call(this, ...arguments);
  },

  @action
  emojiSelected() {
    this.textManipulationImpl.emojiSelected.call(this, ...arguments);
  },
});
