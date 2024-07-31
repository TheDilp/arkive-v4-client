import type { CommandFunction, KeyBindingProps, PrimitiveSelection } from "@remirror/core";
import {
  ApplySchemaAttributes,
  command,
  extension,
  ExtensionTag,
  getTextSelection,
  keyBinding,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  ProsemirrorNode,
  toggleMark,
} from "remirror";

@extension({
  staticKeys: [],
  defaultOptions: {},
  handlerKeys: [],
})
export class SpoilerExtension extends MarkExtension<SpoilerOptions> {
  get name() {
    return "spoiler" as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: extra.defaults(),

      parseDOM: [
        {
          tag: "span",
          getAttrs: extra.parse,
        },

        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        return ["span", { ...extra.dom(node), class: "spoiler", spellcheck: "false" }, 0];
      },
    };
  }

  // @ts-expect-error remirror types are not updated
  @command()
  toggleSpoiler(selection?: PrimitiveSelection): CommandFunction {
    return toggleMark({ type: this.type, selection });
  }

  // @ts-expect-error remirror types are not updated
  @command()
  setSpoiler(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc as ProsemirrorNode);
      dispatch?.(tr.addMark(from, to, this.type.create() as any));

      return true;
    };
  }

  // @ts-expect-error remirror types are not updated
  @command()
  removeSpoiler(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc as ProsemirrorNode);

      // @ts-expect-error remirror types are not up to date
      if (!tr.doc.rangeHasMark(from, to, this.type)) {
        return false;
      }

      // @ts-expect-error remirror types are not up to date

      dispatch?.(tr.removeMark(from, to, this.type));

      return true;
    };
  }

  // @ts-expect-error remirror types are not updated
  @keyBinding({ shortcut: "Mod-Shift-s", command: "toggleSpoiler" })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleSpoiler()(props);
  }
}
interface SpoilerOptions {}

export default SpoilerExtension;
