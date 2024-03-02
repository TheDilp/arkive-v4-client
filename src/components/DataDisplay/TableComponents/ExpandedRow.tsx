import set from "lodash.set";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useGetEntities, useGetSubEntity, useSearch } from "../../../hooks";
import {
  CharacterFieldType,
  CharacterType,
  FormattedRelationship,
  SearchAllEntitiesByTagType,
  TableType,
  WordType,
} from "../../../types";
import { RandomTableSubOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { getSentenceCase, IconEnum, sortCharacters } from "../../../utils";
import { Textarea } from "../../Form";
import { Tabs } from "../../Layout";
import { Alert, Skeleton, Spinner } from "../../Misc";
import { Badge } from "../../Misc/Badge";
import { EntityPreview } from "../EntityPreview";

const ExpandedTableRowClasses = tv({
  base: "p-4 border-b border-zinc-600 bg-zinc-800 max-w-full w-full",
});

function expandedTagRowTabs(counts: number[]) {
  return [
    { id: "1", label: `Characters (${counts[0]})`, icon: IconEnum.character },
    { id: "2", label: `Documents (${counts[1]})`, icon: IconEnum.document },
    { id: "3", label: `Maps (${counts[2]})`, icon: IconEnum.map },
    { id: "4", label: `Graphs (${counts[3]})`, icon: IconEnum.graph },
    { id: "5", label: `Nodes (${counts[4]})`, icon: IconEnum.node },
    { id: "6", label: `Edges (${counts[5]})`, icon: IconEnum.edge },
    { id: "8", label: `Calendars (${counts[6]})`, icon: IconEnum.calendar },
    { id: "9", label: `Dictionaries (${counts[7]})`, icon: IconEnum.dictionary },
  ];
}

type FormattedTagEntitiesSearch = Record<"characters", Pick<CharacterType, "id" | "full_name" | "portrait_id">[]> &
  Record<"documents" | "maps" | "graphs" | "calendars" | "dictionaries", { id: string; title: string; icon?: string }[]> &
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
    <ul className="mt-2 flex max-h-96 flex-col gap-y-2 overflow-y-auto">
      {type === "characters"
        ? data[type]
            .sort(sortCharacters)
            .map((item) => (
              <EntityPreview
                key={item.id}
                id={item.id}
                image_id={item.portrait_id}
                link={`/projects/${project_id}/characters/${item.id}/biography`}
                title={item?.full_name || ""}
                type="characters"
              />
            ))
        : null}
      {type === "nodes" || type === "edges"
        ? data[type].map((item) => (
            <EntityPreview
              key={item.id}
              id={item.id}
              link={`/projects/${project_id}/graphs/${item.parent_id}/${item.id}`}
              title={item.label}
              type="graphs"
            />
          ))
        : null}

      {type !== "characters" && type !== "nodes" && type !== "edges"
        ? data[type].map((item) => (
            <EntityPreview
              key={item.id}
              id={item.id}
              link={`/projects/${project_id}/${type}/${item.id}`}
              title={item.title}
              type={type}
            />
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
      fields: ["id", "title", "field_type"],
      filters: {
        and: [
          {
            id: "expanded_row_fields",
            header_name: "Expanded row fields",
            field: "parent_id",
            value: templateId,
            operator: "eq",
          },
        ],
      },
      orderBy: [
        {
          field: "sort",
          sort: "asc",
        },
      ],
    },
    "character_fields",
  );
  return (
    <div className="flex min-h-[5rem] flex-col divide-y divide-zinc-700">
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
                {field.options.map((opt) => (
                  <li key={opt.id}>{opt.value}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
function ExpandedRandomOption({ random_table_suboptions }: { random_table_suboptions: RandomTableSubOptionType[] }) {
  return (
    <div className="flex flex-col gap-y-2">
      {random_table_suboptions?.map((suboption) => (
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
function ExpandedRelationships({ relationships }: { relationships: FormattedRelationship["relationships"] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {(relationships || []).map((rel) => {
        return (
          <li key={`${rel.relation_title}${rel.relation_type_title}`} className="w-min">
            <Badge
              label={
                rel?.relation_title
                  ? `${getSentenceCase(rel?.relation_title || "")} (${rel?.relation_type_title || ""})`
                  : getSentenceCase(rel?.relation_type_title || "")
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
function ExpandedTag({ id }: { id: string }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const { project_id } = useParams();
  const { data: searchByTagsData, isFetching } = useSearch<SearchAllEntitiesByTagType | null>(
    { data: { tag_ids: [id], match: "all" }, limit: 100 },
    "by_tags",
    project_id as string,
    { queryKeyConcat: [id] },
  );

  const formatted: FormattedTagEntitiesSearch = (searchByTagsData?.data || []).reduce(
    (accumulator, curr) => {
      set(accumulator, curr.name, curr.result);
      return accumulator;
    },
    { characters: [], documents: [], maps: [], graphs: [], nodes: [], edges: [], calendars: [], dictionaries: [] },
  );

  if (isFetching) return <Skeleton type="expanded_tag" />;

  return (
    <div className="w-full max-w-full">
      <Tabs
        onChange={(_, index) => setSelectedTab(index)}
        selectedTab={selectedTab}
        tabs={expandedTagRowTabs(Object.values(formatted).map((items) => items.length))}
      />
      {selectedTab === 0 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="characters" />
      ) : null}
      {selectedTab === 1 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="documents" />
      ) : null}
      {selectedTab === 2 ? <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="maps" /> : null}
      {selectedTab === 3 ? (
        <ExpandedRowTagListWrapper data={formatted} project_id={project_id as string} type="graphs" />
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
function ExpandedWord({ id }: { id: string }) {
  const { data, isFetching } = useGetSubEntity<WordType>(
    id,
    "words",
    {
      data: {
        id,
      },
      fields: ["description"],
    },
    {
      enabled: !!id,
    },
  );
  if (isFetching) return <Spinner />;
  return <Textarea hasNoBackground isDisabled name="description" onChange={() => {}} value={data?.data?.description} />;
}

export function ExpandedTableRow({ data, type }: { data: any } & Pick<TableType, "type">) {
  return (
    <div className={ExpandedTableRowClasses()}>
      {/* {type === "documents" ? <ExpandedDocument id={data?.id} /> : null} */}
      {type === "character_fields_templates" ? <ExpandedTemplateFields templateId={data?.id} /> : null}
      {/* Random table options have suboptions fetched with them in order to use the "Roll on table" feature */}
      {/* Therefore they can be passed as prop directly, instead of using an id to fetch them */}
      {type === "random_table_options" ? (
        <ExpandedRandomOption random_table_suboptions={data?.random_table_suboptions || []} />
      ) : null}
      {type === "relationships" ? <ExpandedRelationships relationships={data?.relationships || []} /> : null}
      {type === "words" ? <ExpandedWord id={data?.id} /> : null}
      {type === "tags" ? <ExpandedTag id={data?.id} /> : null}
    </div>
  );
}
