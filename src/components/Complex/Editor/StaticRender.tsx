import { Callout, Doc, Heading, RemirrorRenderer, TextHandler } from "@remirror/react";
import { ComponentType, ReactElement } from "react";
import { Link, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { deleteObjectPropsRecursive } from "../../../utils";
import { DocumentMention, GraphMention, MapMention } from "./Extensions/Mention";
import { CharacterMention } from "./Extensions/Mention/CharacterMention";
// import WordMention from "../Mention/WordMention";

export type MarkMap = Partial<Record<string, string | ComponentType<any>>>;

const typeMap = (project_id: string): MarkMap => ({
  bulletList: "ul",
  doc: Doc,
  hardBreak: "br",
  heading: Heading,
  link: "a",
  listItem: "li",
  paragraph: "p",
  orderedList: "ol",
  text: TextHandler,
  blockquote: "blockquote",
  callout: Callout,
  horizontalRule: "hr",
  tableofcontents: "p",
  image: "img",
  table: (...props: any) => {
    return (
      <div className="h-min w-full">
        <table className="">
          <tbody>{props?.[0]?.children?.map((c: ReactElement) => c)}</tbody>
        </table>
      </div>
    );
  },
  tableHeaderCell: (...props: any) => (
    <th className="flex w-full items-center justify-center">{props?.[0]?.children?.map((c: ReactElement) => c)}</th>
  ),
  tableRow: (...props: any) => <tr className="flex w-full">{props?.[0]?.children?.map((c: ReactElement) => c)}</tr>,
  tableCell: (...props: any) => {
    return (
      <td className="w-full overflow-y-auto border">
        {props?.[0]?.children?.map((c: ReactElement) => {
          const id = crypto.randomUUID();
          return (
            <div key={id} className="max-w-sm break-all ">
              {c}
            </div>
          );
        })}
      </td>
    );
  },

  mentionAtom: (...props: any) => {
    if (props?.[0]?.node) {
      const { attrs } = props[0].node;
      if (attrs) {
        const { id, label, alterId, name: type } = attrs;
        if (type === "characters")
          return <CharacterMention nodeId={id} nodeLabel={label} project_id={project_id} title={label} />;
        if (type === "documents")
          return (
            <DocumentMention alterId={alterId} id={id} isDisabledTooltip label={label} project_id={project_id} title={label} />
          );

        if (type === "maps") return <MapMention nodeId={id} nodeLabel={label} project_id={project_id} />;

        if (type === "boards" || type === "graphs")
          return <GraphMention nodeId={id} nodeLabel={label} project_id={project_id} />;
        // if (type === "words") return <WordMention id={id} label={label} title={label} />;

        return (
          <Link className="font-lato text-sm font-bold text-white underline" to={`../../${type}/${id}`}>
            {label}
          </Link>
        );
      }
    }
    return null;
  },
  secret: () => null,
});

const markMap: MarkMap = {
  italic: "em",
  bold: "strong",
  underline: "u",
  link: "a",
};

export function StaticRender({ content }: { content: RemirrorJSON }) {
  const { project_id } = useParams();
  const parsedContent = deleteObjectPropsRecursive(content, ["style", "closed", "resizable", "nested"]);
  if (!parsedContent) return null;
  return (
    <div className="staticRendererContainer">
      <RemirrorRenderer json={parsedContent as RemirrorJSON} markMap={markMap} typeMap={typeMap(project_id as string)} />
    </div>
  );
}
