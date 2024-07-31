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

  @command()
  toggleSpoiler(selection?: PrimitiveSelection): CommandFunction {
    return toggleMark({ type: this.type, selection });
  }

  @command()
  setSpoiler(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc as ProsemirrorNode);
      dispatch?.(tr.addMark(from, to, this.type.create() as any));

      return true;
    };
  }

  @command()
  removeSpoiler(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc as ProsemirrorNode);

      if (!tr.doc.rangeHasMark(from, to, this.type)) {
        return false;
      }

      dispatch?.(tr.removeMark(from, to, this.type));

      return true;
    };
  }

  @keyBinding({ shortcut: "Mod-Shift-s", command: "toggleSpoiler" })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleSpoiler()(props);
  }
}
interface SpoilerOptions {}

export default SpoilerExtension;
