import type { PrioritizedKeyBindings } from "@remirror/core";
import { TableExtension } from "remirror/extensions";

export class CustomTableExtension extends TableExtension {
  createKeymap(): PrioritizedKeyBindings {
    return {
      "Shift-Mod-Delete": (props) => this.deleteTable()(props),
      "Mod-Delete": (props) => this.deleteTableColumn()(props),
      "Mod-Insert": (props) => {
        this.setTableCellAttribute("selected", true);
        return this.addTableRowAfter()(props);
      },
      "Shift-Delete": (props) => this.deleteTableRow()(props),
      "Shift-Mod-Insert": (props) => this.addTableColumnAfter()(props),
    };
  }
}
