/* eslint-disable class-methods-use-this */
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  InputRule,
  isElementDomNode,
  keyBinding,
  KeyBindingProps,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  NodeViewMethod,
  omitExtraAttributes,
  toggleWrap,
} from "@remirror/core";
import { TextSelection } from "@remirror/pm/state";

interface SecretOptions {
  secret?: boolean;
  classNames?: string;
}

@extension<SecretOptions>({
  defaultOptions: {
    secret: true,
    classNames: "secretBlock",
  },
})
export class SecretExtension extends NodeExtension<SecretOptions> {
  get name() {
    return "secret" as const;
  }

  readonly tags = [ExtensionTag.Block];

  createNodeViews(): NodeViewMethod {
    return (node) => {
      const { secret, classNames } = node.attrs;
      const dom = document.createElement("div");
      dom.setAttribute("secret", secret);
      dom.setAttribute("class", classNames);

      const contentDOM = document.createElement("div");

      const secretIcon = document.createElement("i");
      secretIcon.classList.add("pi", "pi-eye-slash");

      dom.append(secretIcon);
      dom.append(contentDOM);

      return { dom, contentDOM };
    };
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    //    @ts-ignore
    const { classNames, secret } = this.options;

    return {
      content: "block+",
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        classNames: { default: classNames },
        secret: { default: secret },
      },

      parseDOM: [
        {
          tag: `p[secret="${secret}"]`,
          getAttrs: (node: any) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const content = node.textContent;
            return {
              ...extra.parse(node),
              secret,
              classNames,
              content,
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

  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^::s$/,
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
  toggleSecret(attributes?: { secret: boolean; classNames: string }): CommandFunction {
    return toggleWrap(this.type, attributes);
  }

  @keyBinding({ shortcut: "Mod-g", command: "toggleSecret" })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleSecret()(props);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      secret: SecretExtension;
    }
  }
}
