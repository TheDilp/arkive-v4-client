import { Callout, Doc, Heading, RemirrorRenderer, TextHandler } from "@remirror/react";
import { ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { deleteObjectPropsRecursive } from "../../../utils";
import { DocumentMention, GraphMention, MapMention } from "./Extensions/Mention";
// import WordMention from "../Mention/WordMention";

export type MarkMap = Partial<Record<string, string | ComponentType<any>>>;

const typeMap = (project_id: string, isReadOnly?: boolean): MarkMap => ({
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
  image: "img",
  // tableRow: (...props: any) => <div className="flex h-96 w-full">{props?.[0]?.children?.map((c: ReactElement) => c)}</div>,
  // tableCell: (...props: any) => {
  //   console.log(props?.[0]?.node?.attrs?.colwidth);
  //   return (
  //     <div className="h-full overflow-y-auto border" style={{ width: "33.3%" }}>
  //       {props?.[0]?.children?.map((c: ReactElement) => (
  //         <div className="max-w-sm break-all ">{c}</div>
  //       ))}
  //     </div>
  //   );
  // },
  // tableHeaderCell: () => "test",
  // table: (...props: any) => {
  //   return (
  //     <div className="w-full">
  //       <div className="w-full">{props?.[0]?.children?.map((c: ReactElement) => c)}</div>
  //     </div>
  //   );
  // },

  mentionAtom: (...props: any) => {
    if (props?.[0]?.node) {
      const { attrs } = props[0].node;
      if (attrs) {
        const { id, label, alterId, name: type } = attrs;
        if (type === "documents")
          return (
            <DocumentMention
              alterId={alterId}
              id={id}
              isDisabledTooltip
              isReadOnly={isReadOnly}
              label={label}
              project_id={project_id}
              title={label}
            />
          );

        if (type === "maps") return <MapMention nodeId={id} nodeLabel={label} project_id={project_id} />;

        if (type === "boards" || type === "graphs")
          return <GraphMention nodeId={id} nodeLabel={label} project_id={project_id} />;
        // if (type === "words") return <WordMention id={id} label={label} title={label} />;

        return (
          <Link className="font-Lato text-sm font-bold text-white underline" to={`../../${type}/${id}`}>
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

export default function StaticRender({ content, isReadOnly }: { content: RemirrorJSON; isReadOnly?: boolean }) {
  const { project_id } = useParams();
  const parsedContent = deleteObjectPropsRecursive(content, ["style", "resizable"]);
  if (!parsedContent) return null;
  return (
    <div className="staticRendererContainer">
      <RemirrorRenderer
        json={parsedContent as RemirrorJSON}
        markMap={markMap}
        typeMap={typeMap(project_id as string, isReadOnly)}
      />
    </div>
  );
}
