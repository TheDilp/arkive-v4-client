import { Doc, Heading, RemirrorRenderer, TextHandler } from "@remirror/react";
import { useSetAtom } from "jotai";
import { ComponentType, ReactElement, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetImage } from "../../../hooks";
import { useImageURL } from "../../../hooks/ui/useImageURL";
import { deleteObjectPropsRecursive, dialogAtom, getAssetURL, IconEnum, useNotifications } from "../../../utils";
import { Collapsible } from "../../Layout";
import { Mention } from "./Extensions/Mention";
import { TableOfContents, TOCHeadingType } from "./Extensions/TableOfContentsExtension";
// import WordMention from "../Mention/WordMention";

type MarkMap = Partial<Record<string, string | ComponentType<any>>>;

function StaticRenderImage({ data }: { data: any }) {
  const setDialog = useSetAtom(dialogAtom);
  const { project_id } = useParams();
  const { data: imageData, isInitialLoading } = useGetImage(
    data.node.attrs.id,
    project_id as string,
    "images",
    {
      fields: ["is_public"],
    },
    { enabled: IS_PUBLIC }
  );

  const url = useImageURL(getAssetURL(data.node.attrs.project_id, "images", data.node.attrs.id));
  if (isInitialLoading) return null;
  if (!imageData?.data?.is_public && IS_PUBLIC) return null;
  if (data?.node?.attrs)
    return (
      <div className="inline-block max-w-full">
        <img
          {...data.node.attrs}
          alt={data.node.attrs.title}
          className="cursor-pointer"
          onClick={() =>
            setDialog({
              title: data.node.attrs.title,
              type: "image_view",
              data: { title: data.node.attrs.title, image_type: "images", url },
            })
          }
          src={url}
        />
      </div>
    );
  return null;
}

function typeMap(project_id: string, content: RemirrorJSON) {
  return {
    bulletList: "ul",
    taskList: (args: any) => <ul data-task-list>{args?.children}</ul>,
    taskListItem: (args: any) => {
      return (
        <li
          className="remirror-list-item-with-custom-mark list-none"
          data-checked={args?.node?.attrs?.checked}
          data-task-list-item>
          <label className="remirror-list-item-marker-container" contentEditable="false">
            <input
              checked={args?.node?.attrs?.checked}
              className="remirror-list-item-checkbox"
              contentEditable="false"
              type="checkbox"
            />
          </label>
          {args?.children}
        </li>
      );
    },
    doc: Doc,
    hardBreak: () => <br />,
    heading: (args: any) => {
      return (
        <div id={args?.node?.attrs?.id} style={{ textAlign: args?.node?.attrs?.nodetextalignment || "left" }}>
          {/* @ts-ignore */}
          {Heading(args)}
        </div>
      );
    },
    link: "a",
    listItem: "li",
    paragraph: (data: any) => {
      return (
        // @ts-ignore

        <p data-node-text-align={data?.node?.attrs?.nodetextalignment} nodetextalignment={data?.node?.attrs?.nodetextalignment}>
          {data?.children ?? null}
        </p>
      );
    },
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
    tableofcontents: () => {
      const headings: TOCHeadingType[] = [];
      content?.content?.forEach((n) => {
        if (n.type === "heading" && n?.content?.[0]?.text) {
          headings.push({ id: n.attrs?.id as string, text: n?.content?.[0]?.text, level: n.attrs?.level as number });
        }
      });
      return <TableOfContents headings={headings} />;
    },
    secret: (data: any) => {
      if (IS_PUBLIC) return null;
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
              <div key={id} className="max-w-sm break-all">
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
          const { id, label, alterName, title, projectId, icon, name: type, parentid } = attrs;
          return (
            <Mention
              alter_name={alterName}
              icon={icon}
              id={id}
              label={label}
              parent_id={parentid}
              project_id={project_id || projectId}
              title={title}
              type={type}
            />
          );
        }
      }
      return null;
    },
  };
}

function markMap(): MarkMap {
  return {
    italic: "em",
    bold: "strong",
    underline: "u",
    link: "a",
    spoiler: (data: any) => {
      return <span className="spoiler">{data?.children || null}</span>;
    },
    dice_roll: (...props) => {
      return <span>{props?.[0]?.children || ""}</span>;
    },
  };
}
export function StaticRender({ content }: { content: RemirrorJSON | undefined }) {
  const { project_id } = useParams();
  const location = useLocation();
  const createNotification = useNotifications();

  useEffect(() => {
    if (location?.hash?.length) {
      const headingHashTitle = decodeURIComponent(location.hash.replace("#", ""));

      const domEl = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).find(
        (heading: Element) => heading.textContent?.trim()?.toLowerCase() === headingHashTitle.trim().toLowerCase()
      );
      domEl?.scrollIntoView({ behavior: "smooth", block: "center", inline: "end" });
    }
  }, []);

  if (!content) return null;

  const parsedContent = deleteObjectPropsRecursive(content, ["style", "closed", "resizable", "nested"]);
  if (!parsedContent) return null;

  return (
    <div className={`staticRendererContainer ${IS_PUBLIC ? "p-4" : ""}`}>
      {/* @ts-ignore */}
      <RemirrorRenderer
        json={parsedContent as RemirrorJSON}
        // @ts-ignore
        markMap={markMap(createNotification)}
        typeMap={typeMap(project_id as string, content)}
      />
    </div>
  );
}
