/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Doc, Heading, RemirrorRenderer, TextHandler } from "@remirror/react";
import { useSetAtom } from "jotai";
import { ComponentType, ReactElement } from "react";
import { Link, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { deleteObjectPropsRecursive, dialogAtom, IconEnum } from "../../../utils";
import { Collapsible } from "../../Layout";
import { DocumentMention, GraphMention, MapMention } from "./Extensions/Mention";
import { CharacterMention } from "./Extensions/Mention/CharacterMention";
// import WordMention from "../Mention/WordMention";

export type MarkMap = Partial<Record<string, string | ComponentType<any>>>;

function StaticRenderImage({ data }: { data: any }) {
  const setDialog = useSetAtom(dialogAtom);
  if (data?.node?.attrs)
    return (
      <img
        {...data.node.attrs}
        alt={data.node.attrs.title}
        className="cursor-pointer"
        onClick={() =>
          setDialog({
            title: data.node.attrs.title,
            type: "image_view",
            data: { title: data.node.attrs.title, image: data.node.attrs.src },
          })
        }
      />
    );
  return null;
}

function typeMap(project_id: string, isPublicView?: boolean) {
  return {
    bulletList: "ul",
    doc: Doc,
    hardBreak: "br",
    heading: (args: any) => {
      return <div style={{ textAlign: args?.node?.attrs?.nodetextalignment || "left" }}>{Heading(args)}</div>;
    },
    link: "a",
    listItem: "li",
    paragraph: "p",
    orderedList: "ol",
    text: TextHandler,
    blockquote: "blockquote",
    callout: (data: any) => {
      return (
        <div
          data-callout-type={data?.node?.attrs?.type ?? "custom"}
          style={{
            backgroundColor: `${data?.node?.attrs?.customcolor}50`,
            borderColor: `${data?.node?.attrs?.customcolor}`,
          }}>
          {data?.children ?? null}
        </div>
      );
    },
    horizontalRule: "hr",
    tableofcontents: "p",
    secret: (data: any) => {
      if (isPublicView) return null;
      return (
        <Collapsible icon={IconEnum.eye} initialOpen={false} label="Secret">
          {data?.children || null}
        </Collapsible>
      );
    },

    image: (data: any) => StaticRenderImage({ data }),
    table: (...props: any) => {
      return (
        <div className="h-min w-full">
          <table className="w-full">
            <tbody className="w-1/2">{props?.[0]?.children?.map((c: ReactElement) => c)}</tbody>
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
            return <CharacterMention id={id} isPublic={isPublicView} label={label} project_id={project_id} title={label} />;
          if (type === "documents")
            return (
              <DocumentMention
                alterId={alterId}
                id={id}
                isDisabledTooltip
                isPublic={isPublicView}
                label={label}
                project_id={project_id}
                title={label}
              />
            );

          if (type === "maps") return <MapMention id={id} label={label} project_id={project_id} />;

          if (type === "graphs") return <GraphMention id={id} label={label} project_id={project_id} />;
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
  };
}

const markMap: MarkMap = {
  italic: "em",
  bold: "strong",
  underline: "u",
  link: "a",
  spoiler: (data: any) => {
    return <span className="spoiler">{data?.children || null}</span>;
  },
};

export function StaticRender({ content, isPublicView }: { content: RemirrorJSON; isPublicView?: boolean }) {
  const { project_id } = useParams();
  const parsedContent = deleteObjectPropsRecursive(content, ["style", "closed", "resizable", "nested"]);
  if (!parsedContent) return null;
  return (
    <div className="staticRendererContainer">
      <RemirrorRenderer
        json={parsedContent as RemirrorJSON}
        markMap={markMap}
        typeMap={typeMap(project_id as string, isPublicView)}
      />
    </div>
  );
}
