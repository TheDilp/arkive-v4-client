/* eslint-disable no-dupe-class-members */
import { keyBinding, KeyBindingProps } from "remirror";
import { TableExtension } from "remirror/extensions";

export class CustomTableExtension extends TableExtension {
  @keyBinding({ shortcut: "Mod-Shift-Delete", command: "deleteTable" })
  delTableShortcut(props: KeyBindingProps): boolean {
    return this.deleteTable()(props);
  }

  @keyBinding({ shortcut: "Mod-Delete", command: "deleteCol" })
  delColShortcut(props: KeyBindingProps): boolean {
    return this.deleteTableColumn()(props);
  }

  @keyBinding({ shortcut: "Shift-Delete", command: "deleteRow" })
  delRowShortcut(props: KeyBindingProps): boolean {
    return this.deleteTableRow()(props);
  }

  @keyBinding({ shortcut: "Mod-Insert", command: "addCol" })
  addColShortcut(props: KeyBindingProps): boolean {
    return this.addTableColumnAfter()(props);
  }

  @keyBinding({ shortcut: "Insert", command: "addRow" })
  addRowShortcut(props: KeyBindingProps): boolean {
    this.setTableCellAttribute("selected", true);
    return this.addTableRowAfter()(props);
  }
}
