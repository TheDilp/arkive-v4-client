/* eslint-disable class-methods-use-this */
import { ApplySchemaAttributes, NodeExtensionSpec, NodeSpecOverride } from "remirror";
import { ImageExtension } from "remirror/extensions";

export class CustomImageExtension extends ImageExtension {
  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const spec = super.createNodeSpec(extra, override);

    return {
      ...spec,
      attrs: {
        ...spec.attrs,
        title: { default: "" },
      },
      toDOM: (node) => [
        "figure",
        {
          style: "border: 2px solid #479e0c; padding: 8px; margin: 8px; text-align: center;",
        },
        spec.toDOM!(node),
        ["figcaption", { style: "background-color: #3d3d3d; color: #f1f1f1; padding: 8px;" }, node.attrs.figcaptionText],
      ],
    };
  }
}
