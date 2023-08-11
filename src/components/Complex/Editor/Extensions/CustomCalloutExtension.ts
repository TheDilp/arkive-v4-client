/* eslint-disable class-methods-use-this */
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  InputRule,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  NodeViewMethod,
  omitExtraAttributes,
  toggleWrap,
} from "@remirror/core";
import { TextSelection } from "@remirror/pm/state";

export type CalloutType = "info" | "success" | "warning" | "error" | "custom";

function getCalloutColor(type: CalloutType, customColor?: string | null): string {
  if (type === "custom") {
    if (customColor) return customColor;
    return "#eef6fc";
  }
  if (type === "info") return "#eef6fc";
  if (type === "success") return "#effaf3";
  if (type === "warning") return "#fffbeb";
  if (type === "error") return "#feecf0";
  return "#eef6fc";
}

function getCalloutBorderColor(type: CalloutType, customColor?: string | null): string {
  if (type === "custom") {
    if (customColor) return customColor;
    return "#3298dc";
  }
  if (type === "info") return "#3298dc";
  if (type === "success") return "#48c774";
  if (type === "warning") return "#ffdd57";
  if (type === "error") return "#f14668";
  return "#3298dc";
}

export interface CustomCalloutOptions {
  type: CalloutType;
  customColor?: string | null;
}

@extension<CustomCalloutOptions>({
  defaultOptions: {
    type: "info",
    customColor: null,
  },
})
export class CustomCalloutExtension extends NodeExtension<CustomCalloutOptions> {
  get name() {
    return "samp" as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeViews(): NodeViewMethod {
    return (node) => {
      const { customColor, type } = node.attrs;
      const dom = document.createElement("div");
      const contentDOM = document.createElement("div");

      contentDOM.setAttribute(
        "style",
        `background-color: ${getCalloutColor(type, customColor)}; 
        border-style: solid;
        border-color:${getCalloutBorderColor(type, customColor)};
        border-width: 0 0 0 ${type === "custom" ? 0 : 4}px;
        padding: 8px;
        border-top-left-radius: 0.25rem; 
        border-bottom-left-radius: 0.25rem; 
        `,
      );
      dom.append(contentDOM);

      return { dom, contentDOM };
    };
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    //    @ts-ignore
    const { type, customColor, classNames } = this.options;

    return {
      content: "block+",
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        classNames: { default: classNames },
        type: { default: type ?? "info" },
        customColor: { default: customColor ?? "" },
      },

      parseDOM: [
        {
          tag: "p",
          getAttrs: (node: any) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const content = node.textContent;
            return {
              ...extra.parse(node),
              classNames,
              content,
              type,
              customColor,
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

          type,
          customColor: customColor ?? "",
        };
        return ["p", attributes, 0];
      },
    };
  }

  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^::: $/,
        type: this.type,
        beforeDispatch: ({ tr, start }: { tr: any; start: number }) => {
          const $pos = tr.doc.resolve(start);
          tr.setSelection(TextSelection.near($pos));
        },
        getAttributes: () => {
          return {
            secret: true,
          };
        },
      }),
    ];
  }

  @command()
  toggleCallout(attributes?: { type: CalloutType; customColor?: string | null }): CommandFunction {
    return toggleWrap(this.type, attributes);
  }
}
