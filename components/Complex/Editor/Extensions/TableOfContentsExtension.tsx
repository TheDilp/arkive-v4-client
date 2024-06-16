 
 
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

export type TOCHeadingType = { id: string; text: string; level: number };

interface TableOfContentsOptions {}

@extension<TableOfContentsOptions>({ defaultOptions: {} })
class TableOfContentsExtension extends NodeExtension<TableOfContentsOptions> {
  get name() {
    return "tableofcontents" as const;
  }

  ReactComponent = function ({ view }: { view: EditorView }) {
    const headings: TOCHeadingType[] = [];
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
            <li className="pointer-events-auto font-lato" key={heading.id || i.toString()}>
              <span
                className="pointer-events-auto cursor-pointer select-none hover:text-blue-400"
                onClick={() => {
                  const el = document.getElementById(heading.id);
                  if (el) {
                    const editor = document.getElementById("editor");
                    if (editor) editor.scrollTo({ top: el.offsetTop, behavior: "smooth" });
                  }
                }}
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
export default TableOfContentsExtension;
declare global {
  namespace Remirror {
    interface AllExtensions {
      tableofcontents: TableOfContentsExtension;
    }
  }
}

// Needed for static render

export function TableOfContents({ headings }: { headings: TOCHeadingType[] }) {
  return (
    <ul className="tableOfContentsList m-0 flex list-none flex-col border border-zinc-600">
      <h2 className="font-merriweather underline">Table of contents</h2>
      {headings?.length ? (
        headings.map((heading, i) => (
          <li className="pointer-events-auto font-lato" key={`${heading}+${i.toString()}`}>
            <span
              className="pointer-events-auto cursor-pointer select-none hover:text-blue-400"
              onClick={() => {
                const el = document.getElementById(heading.id);

                if (el) {
                  const editor = document.querySelector(".staticRendererContainer")?.parentElement;

                  if (editor) editor.scrollTo({ top: el.offsetTop - 130, behavior: "smooth" });
                }
              }}
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
}
