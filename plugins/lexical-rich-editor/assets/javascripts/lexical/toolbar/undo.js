import { UNDO_COMMAND } from "lexical";

export default {
  name: "undo",
  label: "Undo",
  icon: "undo",
  command(engine) {
    engine.dispatchCommand(UNDO_COMMAND);
  },
};
