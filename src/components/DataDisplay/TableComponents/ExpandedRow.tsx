import set from "lodash.set";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";
import { tv } from "tailwind-variants";

import { useGetEntities, useGetEntity, useSearch } from "../../../hooks";
import { CharacterFieldType, CharacterType, DocumentType, SearchAllEntitiesByTagType, TableType } from "../../../types";
import { RandomTableSubOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { getCharacterFullName, getSentenceCase, IconEnum } from "../../../utils";
import { StaticRender } from "../../Complex";
import { Tabs } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";
import { Badge } from "../../Misc/Badge";
import { ItemPreview } from "../ItemPreview";

const ExpandedTableRowClasses = tv({
  base: "p-4 border-b border-zinc-600 bg-zinc-800",
});

const expandedTagRowTabs = [
  { id: "1", label: "Characters", icon: IconEnum.character },
  { id: "2", label: "Documents", icon: IconEnum.document },
  { id: "3", label: "Maps", icon: IconEnum.map },
  { id: "4", label: "Graphs", icon: IconEnum.board },
  { id: "5", label: "Nodes", icon: IconEnum.node },
  { id: "6", label: "Edges", icon: IconEnum.edge },
  { id: "8", label: "Calendars", icon: IconEnum.calendar },
  { id: "9", label: "Dictionaries", icon: IconEnum.dictionary },
];

type FormattedTagEntitiesSearch = Record<
  "characters",
  Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">[]
> &
  Record<"documents" | "maps" | "boards" | "calendars" | "dictionaries", { id: string; title: string; icon?: string }[]> &
  Record<"nodes" | "edges", { id: string; label: string; parent_id: string }[]>;

function ExpandedRowTagListWrapper({
  data,
  type,
  project_id,
}: {
  data: FormattedTagEntitiesSearch;
  type: keyof FormattedTagEntitiesSearch;
  project_id: string;
}) {
  if (!data[type]?.length)
    return (
      <div className="mt-2">
        <Alert label="There is no content." variant="info" />
      </div>
    );
  return (
    <ul className="mt-2 flex flex-col gap-y-2 overflow-y-auto">
      {type === "characters"
        ? data[type].map((item) => (
            <Link key={item.id} className="hover:text-blue-400" to={`/projects/${project_id}/characters/${item.id}`}>
              <ItemPreview
                id={item.id}
                image_id={item.portrait_id}
                title={getCharacterFullName(item.first_name, undefined, item?.last_name)}
                type="characters"
              />
            </Link>
          ))
        : null}
      {type === "nodes" || type === "edges"
        ? data[type].map((item) => (
            <Link
              key={item.id}
              className="hover:text-blue-400"
              to={`/projects/${project_id}/graphs/${item.parent_id}/${item.id}`}>
              <ItemPreview id={item.id} title={item.label} type="graphs" />
            </Link>
          ))
        : null}

      {type !== "characters" && type !== "nodes" && type !== "edges"
        ? data[type].map((item) => (
            <Link key={item.id} className="hover:text-blue-400" to={`/projects/${project_id}/${type}/${item.id}`}>
              <ItemPreview id={item.id} title={item.title} type={type === "boards" ? "graphs" : type} />
            </Link>
          ))
        : null}
    </ul>
  );
}

function ExpandedTemplateFields({ templateId }: { templateId: string }) {
  const { project_id } = useParams();
  const { data } = useGetEntities<CharacterFieldType>(
    {
      data: {
        project_id,
        parent_id: templateId,
      },
      filters: {
        and: [
          {
            field: "parent_id",
            value: templateId,
            operator: "eq",
          },
        ],
      },
    },
    "character_fields",
  );

  return (
    <div className="flex flex-col divide-y divide-zinc-700">
      {data?.data?.map((field) => (
        <div key={field.id} className="flex flex-col py-2 font-lato">
          <div className="flex gap-x-2">
            <span>{field.title}</span>
            <span className="ml-auto">
              <Badge label={getSentenceCase(field.field_type || "")} variant="info" />
            </span>
          </div>
          {(field.field_type === "select" || field.field_type === "select_multiple") && field.options?.length ? (
            <div className="flex flex-col pl-4 text-sm">
              <h5 className="mt-2 w-max border-b">Available options</h5>
              <ul>
                {field.options.map((opt: string) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
function ExpandedRandomOption({ suboptions }: { suboptions: RandomTableSubOptionType[] }) {
  return (
    <div className="flex flex-col gap-y-2">
      {suboptions?.map((suboption) => (
        <div key={suboption.id} className="flex flex-col font-lato">
          <div className="flex w-full max-w-full items-center gap-x-2">
            <span>
              <Badge label={getSentenceCase(suboption.title || "")} variant="info" />
            </span>
            {suboption?.description ? (
              <>
                <span>-</span>
                <div className="truncate text-sm">{suboption?.description}</div>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
function ExpandedDocument({ id }: { id: string }) {
  const { data, isFetching } = useGetEntity<DocumentType>(
    id,
    "documents",
    {
      data: {
        id,
      },
      fields: ["id", "content"],
    },
    {
      enabled: !!id,
    },
  );
  if (isFetching) return <Skeleton type="editor" />;
  return data?.data?.content ? (
    <div className="w-min min-w-fit">
      <StaticRender content={data?.data?.content as RemirrorJSON} />
    </div>
  ) : null;
}

function ExpandedTag({ id }: { id: string }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const { project_id } = useParams();
  const { data: searchByTagsData } = useSearch<SearchAllEntitiesByTagType | null>(
    { data: { tag_ids: [id], match: "all" }, limit: 100 },
    "by_tags",
    project_id as string,
    { queryKeyConcat: [id], staleTime: 3 * 60 * 1000 },
  );

  const formatted: FormattedTagEntitiesSearch = (searchByTagsData?.data || []).reduce(
    (accumulator, curr) => {
      set(accumulator, curr.name, curr.result);
      return accumulator;
    },
    { characters: [], documents: [], maps: [], boards: [], nodes: [], edges: [], calendars: [], dictionaries: [] },
  );

  return (
    <div className="w-min min-w-fit">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={expandedTagRowTabs} />
      {selectedTab === 0 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="characters" />
      ) : null}
      {selectedTab === 1 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="documents" />
      ) : null}
      {selectedTab === 2 ? <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="maps" /> : null}
      {selectedTab === 3 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="boards" />
      ) : null}
      {selectedTab === 4 ? <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="nodes" /> : null}
      {selectedTab === 5 ? <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="edges" /> : null}
      {selectedTab === 6 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="calendars" />
      ) : null}
      {selectedTab === 7 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="dictionaries" />
      ) : null}
    </div>
  );
}

export function ExpandedTableRow({ data, type }: { data: any } & Pick<TableType, "type">) {
  return (
    <div className={ExpandedTableRowClasses()}>
      {type === "documents" ? <ExpandedDocument id={data?.id} /> : null}

      {type === "character_fields_templates" ? <ExpandedTemplateFields templateId={data?.id} /> : null}
      {/* Random table options have suboptions fetched with them in order to use the "Roll on table" feature */}
      {/* Therefore they can be passed as prop directly, instead of using an id to fetch them */}
      {type === "random_table_options" ? <ExpandedRandomOption suboptions={data?.suboptions || []} /> : null}
      {type === "tags" ? <ExpandedTag id={data?.id} /> : null}
    </div>
  );
}
