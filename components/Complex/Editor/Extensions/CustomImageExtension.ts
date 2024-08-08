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
      toDOM: (node) => {
        console.log(node);

        return [
          "img",
          {
            alt: node.attrs.alt,
            title: node.attrs.title,
            height: node.attrs.height,
            width: node.attrs.width,
            src: node.attrs.src,
          },
        ];
      },
    };
  }
}
