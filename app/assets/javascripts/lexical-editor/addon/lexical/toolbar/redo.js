import { REDO_COMMAND } from "lexical";

export default {
  name: "redo",
  label: "Redo",
  icon: "redo",
  command(engine) {
    engine.dispatchCommand(REDO_COMMAND);
  },
};
