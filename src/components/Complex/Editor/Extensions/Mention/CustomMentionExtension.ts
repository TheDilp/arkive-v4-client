/* eslint-disable class-methods-use-this */
import { NodeViewComponentProps } from "@remirror/react";
import { ComponentType } from "react";
import { NodeExtensionSpec } from "remirror";
import { MentionAtomExtension } from "remirror/extensions";

import { MentionReactComponent } from "./MentionReactComponent";

export class CustomMentionExtension extends MentionAtomExtension {
  get name() {
    return "mentionAtom" as const;
  }

  createNodeSpec(): NodeExtensionSpec {
    return {
      attrs: {
        alterId: { default: null },
        projectId: { default: null },
        id: { default: null },
        icon: { default: null },
        parentId: { default: null },
        name: { default: null },
        label: { default: null },
      },
      content: "inline",
      inline: true,

      parseDOM: [
        {
          attrs: {
            id: { default: null },
            alterId: { default: null },
            projectId: { default: null },
            icon: { default: null },
            parentId: { default: null },
            name: { default: null },
            label: { default: null },
          },
          tag: "div",
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
    };
  }

  ReactComponent?: ComponentType<NodeViewComponentProps> = MentionReactComponent;
}
