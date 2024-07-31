import type { keyBinding, KeyBindingProps } from "remirror";
import { TableExtension } from "remirror/extensions";

export class CustomTableExtension extends TableExtension {
  // @ts-expect-error remirror types are not updated
  @keyBinding({ shortcut: "Shift-Mod-Delete", command: "deleteTable" })
  delTableShortcut(props: KeyBindingProps): boolean {
    return this.deleteTable()(props);
  }

  // @ts-expect-error remirror types are not updated
  @keyBinding({ shortcut: "Mod-Delete", command: "deleteCol" })
  delColShortcut(props: KeyBindingProps): boolean {
    return this.deleteTableColumn()(props);
  }

  // @ts-expect-error remirror types are not updated
  @keyBinding({ shortcut: "Shift-Delete", command: "deleteRow" })
  delRowShortcut(props: KeyBindingProps): boolean {
    return this.deleteTableRow()(props);
  }

  // @ts-expect-error remirror types are not updated
  @keyBinding({ shortcut: "Shift-Mod-Insert", command: "addCol" })
  addColShortcut(props: KeyBindingProps): boolean {
    return this.addTableColumnAfter()(props);
  }

  // @ts-expect-error remirror types are not updated
  @keyBinding({ shortcut: "Mod-Insert", command: "addRow" })
  addRowShortcut(props: KeyBindingProps): boolean {
    this.setTableCellAttribute("selected", true);
    return this.addTableRowAfter()(props);
  }
}
