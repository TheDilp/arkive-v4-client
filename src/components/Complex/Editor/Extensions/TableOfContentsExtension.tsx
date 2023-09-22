/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

/* eslint-disable func-names */
/* eslint-disable class-methods-use-this */
import { TextSelection } from "@remirror/pm/state";
import {
  ApplySchemaAttributes,
  EditorView,
  extension,
  ExtensionTag,
  InputRule,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  omitExtraAttributes,
} from "remirror";

import { Alert } from "../../../Misc";

interface TableOfContentsOptions {}

@extension<TableOfContentsOptions>({
  defaultOptions: {},
})
export class TableOfContentsExtension extends NodeExtension<TableOfContentsOptions> {
  get name() {
    return "tableofcontents" as const;
  }

  ReactComponent = function ({ view }: { view: EditorView }) {
    const headings: { id: string; text: string; level: number }[] = [];
    view.state.doc.forEach((n) => {
      if (n.type.name === "heading" && n.textContent) {
        headings.push({ id: n.attrs.id, text: n.textContent, level: n.attrs.level });
      }
    });

    return (
      <ul className="tableOfContentsList m-0 flex list-none flex-col border border-zinc-600">
        <h2 className="font-merriweather underline">Table of contents</h2>
        {headings?.length ? (
          headings.map((heading, i) => (
            <li
              key={`${heading}+${i.toString()}`}
              className="pointer-events-auto font-lato"
              onClick={() => {
                const el = document.getElementById(heading.id);
                if (el) {
                  const editor = document.getElementById("editor");
                  if (editor) editor.scrollTo({ top: el.offsetTop, behavior: "smooth" });
                }
              }}>
              <span
                className="pointer-events-auto cursor-pointer hover:text-blue-400"
                style={{
                  paddingLeft: `${0.45 * (heading.level - 1)}rem`,
                }}>
                {heading.text}
              </span>
            </li>
          ))
        ) : (
          <Alert label="There are no headings in this document." variant="info" />
        )}
      </ul>
    );
  };

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
      },

      parseDOM: [
        {
          tag: "p",
          getAttrs: (node: any) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            return {
              ...extra.parse(node),
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
        };
        return ["p", attributes, 0];
      },
    };
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^::toc$/,
        type: this.type,
        beforeDispatch: ({ tr, start }: { tr: any; start: number }) => {
          const $pos = tr.doc.resolve(start);
          tr.setSelection(TextSelection.near($pos));
        },
        getAttributes: () => {
          return {};
        },
      }),
    ];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      tableofcontents: TableOfContentsExtension;
    }
  }
}
