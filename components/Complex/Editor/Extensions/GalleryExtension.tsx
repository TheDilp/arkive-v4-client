import type { CommandFunction } from "@remirror/core";
import {
  ApplySchemaAttributes,
  command,
  extension,
  ExtensionTag,
  isElementDomNode,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  omitExtraAttributes,
  toggleWrap,
} from "@remirror/core";
import { CreateEventHandlers } from "remirror/extensions";

import EditorGallery from "./Gallery/EditorGallery";

interface GalleryOptions {
  classNames?: string;
  imageIds: [];
}

@extension<GalleryOptions>({
  staticKeys: [],
  handlerKeys: [],
  customHandlerKeys: [],
  defaultOptions: {
    classNames: "editorGallery",
    imageIds: [],
  },
})
class GalleryExtension extends NodeExtension<GalleryOptions> {
  get name() {
    return "gallery" as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    //    @ts-ignore
    const { classNames } = this.options;

    return {
      content: "block+",
      leafText: () => "\n",
      atom: true,
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        classNames: { default: classNames },
        imageIds: { default: [] },
      },

      parseDOM: [
        {
          tag: "p",
          attrs: {
            ...extra.defaults(),
            imageIds: { default: [] },
          },
          getAttrs: (node: any) => {
            if (!isElementDomNode(node)) {
              return false;
            }
            const imageIds = node.getAttribute("data-imageIds");
            const content = node.textContent;
            return {
              ...extra.parse(node),
              classNames,
              content,
              imageIds,
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { ...rest } = omitExtraAttributes(node.attrs, extra);
        const attributes = {
          ...extra.dom(node),
          ...rest,
          classNames,
        };
        return ["p", attributes, 0];
      },
    };
  }

  ReactComponent: any = EditorGallery;

  @command()
  toggleGallery(attributes?: { classNames: string }): CommandFunction {
    return toggleWrap(this.type, attributes);
  }

  createKeymap(): KeyBindings {
    return {
      Enter: () => {
        this.store.commands.insertHardBreak();
        return true;
      },
    };
  }

  createEventHandlers(): CreateEventHandlers {
    return {
      copy: () => {
        return true;
      },
    };
  }
}
export default GalleryExtension;
declare global {
  namespace Remirror {
    interface AllExtensions {
      gallery: GalleryExtension;
    }
  }
}
