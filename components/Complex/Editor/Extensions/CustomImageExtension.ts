import {
  ApplySchemaAttributes,
  EditorView,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
} from "remirror";
import { ImageExtension } from "remirror/extensions";

import { ResizableImageView } from "./CustomResizableImageView";

export class CustomImageExtension extends ImageExtension {
  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const spec = super.createNodeSpec(extra, override);
    return {
      ...spec,
      attrs: {
        ...spec.attrs,
        title: { default: "" },
      },

      toDOM: (node) => {
        return [
          "img",
          {
            id: node.attrs.id,
            project_id: node.attrs.project_id,
            alt: node.attrs.alt,
            title: node.attrs.title,
            height: node.attrs.height,
            width: node.attrs.width,
            // src: await getImageURL(getAssetURL(node.attrs.project_id, "images", node.attrs.id)),
          },
        ];
      },
    };
  }

  createNodeViews(): NodeViewMethod | Record<string, NodeViewMethod> {
    return (node: ProsemirrorNode, view: EditorView, getPos: () => number | undefined) => {
      const p = new ResizableImageView(node, view, getPos as () => number);
      return p;
    };
  }
}
