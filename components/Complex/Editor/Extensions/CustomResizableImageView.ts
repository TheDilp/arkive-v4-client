import { setStyle } from "@remirror/core";
import { EditorView, NodeView, ProsemirrorNode } from "@remirror/pm";
import { ResizableNodeView, ResizableRatioType } from "prosemirror-resizable-view";

import { getAssetURL, getImageURL } from "../../../../utils";

/**
 * ResizableImageView is a NodeView for image. You can resize the image by
 * dragging the handle over the image.
 */
export class ResizableImageView extends ResizableNodeView implements NodeView {
  constructor(node: ProsemirrorNode, view: EditorView, getPos: () => number) {
    super({ node, view, getPos, aspectRatio: ResizableRatioType.Fixed });
  }

  createElement({ node }: { node: ProsemirrorNode }): HTMLImageElement {
    const inner = document.createElement("img");

    async function fetchImageUrl() {
      try {
        const url = await getImageURL(getAssetURL(node.attrs.project_id, "images", node.attrs.id));

        inner.src = url; // Update the image source with fetched URL
        inner.alt = node.attrs.alt || "";
      } catch (error) {
        console.error("Image fetch error:", error);
      }
    }
    fetchImageUrl();

    setStyle(inner, {
      width: "100%",
      minWidth: "50px",
      objectFit: "contain", // maintain image's aspect ratio
    });
    return inner;
  }
}
