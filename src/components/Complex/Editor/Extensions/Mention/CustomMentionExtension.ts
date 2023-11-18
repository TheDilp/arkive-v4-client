/* eslint-disable class-methods-use-this */
import { NodeViewComponentProps } from "@remirror/react";
import { ComponentType } from "react";
import { ApplySchemaAttributes, ExtensionTag, NodeExtensionSpec, NodeSpecOverride } from "remirror";
import { CreateEventHandlers, MentionAtomExtension } from "remirror/extensions";

import { MentionReactComponent } from "./MentionReactComponent";

export class CustomMentionExtension extends MentionAtomExtension {
  get name() {
    return "mentionAtom" as const;
  }

  createTags() {
    return [ExtensionTag.InlineNode, ExtensionTag.Behavior];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      attrs: {
        alterId: { default: "" },
        projectId: { default: "" },
        id: { default: "" },
        icon: { default: "" },
        parentId: { default: "" },
        name: { default: "" },
        label: { default: "" },
      },
      inline: true,
      atom: true,
      marks: "",
      selectable: this.options.selectable,
      draggable: this.options.draggable,
      ...override,
      parseDOM: [
        {
          attrs: {
            ...extra.defaults(),
            id: { default: null },
            alterId: { default: null },
            projectId: { default: null },
            icon: { default: null },
            parentId: { default: null },
            name: { default: null },
            label: { default: null },
          },
          tag: `${this.options.mentionTag}`,
          getAttrs: (dom) => {
            const node = dom as HTMLAnchorElement;
            const id = node.getAttribute("data-id");
            const alterId = node.getAttribute("data-alterId");
            const projectId = node.getAttribute("data-projectId");
            const parentId = node.getAttribute("data-parentId");
            const icon = node.getAttribute("data-icon");
            const name = node.getAttribute("data-name");
            const label = node.getAttribute("data-label");

            return {
              id,
              alterId,
              projectId,
              parentId,
              icon,
              name,
              label,
            };
          },
        },
      ],
      toDOM: (node) => ["span", extra.dom(node)],
    };
  }

  ReactComponent?: ComponentType<NodeViewComponentProps> = MentionReactComponent;

  createEventHandlers(): CreateEventHandlers {
    return {
      copy: () => {
        return true;
      },
    };
  }
}
