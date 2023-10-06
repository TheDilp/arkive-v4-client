import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { uniqueBy } from "remirror";
import { tv } from "tailwind-variants";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Collapsible,
  createColumnHelper,
  Dropdown,
  Editor,
  Gallery,
  Skeleton,
  Table,
  TablePageLayout,
  Tabs,
  Title,
} from "../../components";
import {
  useChangeNavbarTitle,
  useDownloadImage,
  useGetEntities,
  useGetEntity,
  useRemoveFromEntity,
  useTable,
} from "../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterFieldType,
  CharacterFieldValueType,
  CharacterLocationType,
  CharacterRelatedType,
  CharacterType,
  DocumentType,
  ImageType,
  MapType,
} from "../../types";
import {
  dialogAtom,
  drawerAtom,
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  getSentenceCase,
  IconEnum,
  NameFilters,
  sortEntities,
} from "../../utils";
import { RemoveFromCharacterSchema } from "../../validation";

const relationshipColumnHelper = createColumnHelper<CharacterRelatedType>();
const documentsColumnHelper = createColumnHelper<DocumentType>();
const locationsColumnHelper = createColumnHelper<MapType>();
const assetColumnHelper = createColumnHelper<ImageType>();

const tabs = [
  { id: "1", label: "Resources", icon: IconEnum.document },
  { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
];

const fieldSizeClass = tv({
  base: "flex flex-col justify-center text-center mt-1 bg-zinc-800 rounded shadow-sm p-0.5",
  variants: {
    type: {
      dice_roll: "col-span-6 sm:col-span-3 lg:col-span-1",
      text: "col-span-6 sm:col-span-3 lg:col-span-2",
      select: "col-span-6 sm:col-span-3 lg:col-span-2",
      select_multiple: "col-span-6 sm:col-span-3 lg:col-span-2",
      number: "col-span-6 sm:col-span-3 lg:col-span-2",
      random_table: "col-span-6 sm:col-span-3 lg:col-span-2",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
    },
  },
});

function relationshipTableColumns(project_id: string, naivgate: NavigateFunction) {
  return [
    relationshipColumnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(project_id, "images", row.original?.portrait_id || "")}
            initials={getAvatarInitials(row.original.first_name, row.original?.last_name || "")}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.first_name, row.original?.last_name || "")}
            size="sm"
          />
        </div>
      ),
      meta: {
        centered: true,
      },
      minSize: 5,
      maxSize: 5,
    }),
    relationshipColumnHelper.display({
      id: "first_name",
      header: "First name",
      cell: ({ row }) => row.original.first_name,
    }),

    relationshipColumnHelper.display({
      id: "nickname",
      header: "Nickname",
      cell: ({ row }) => row.original?.nickname,
    }),
    relationshipColumnHelper.display({
      id: "last_name",
      header: "Last name",
      cell: ({ row }) => row.original.last_name,
    }),
    relationshipColumnHelper.display({
      id: "relation_type",
      header: "Relation",
      cell: ({ row }) =>
        `${
          row?.original?.relation_title
            ? `${getSentenceCase(row?.original?.relation_title)} (${row.original?.relation_type_title || ""})`
            : getSentenceCase(row.original?.relation_type_title || "")
        }`,
    }),
    relationshipColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "1",
                label: `View profile of ${getCharacterFullName(row.original.first_name, undefined, row.original?.last_name)}`,
                icon: IconEnum.edit,
                onClick: () => naivgate(`/projects/${project_id}/characters/${row.original.id}`),
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function disableShowRelationshipTree(character: CharacterType | undefined) {
  if (!character) return true;
  if (!character?.related_from?.length && !character?.related_to?.length && !character?.related_other?.length) return true;
  return false;
}

function documentsTableColumns(
  removeItem: UseMutateAsyncFunction<
    any,
    unknown,
    {
      data: {
        [key: string]:
          | string
          | {
              data: {
                id: string;
              };
            };
      };
    },
    unknown
  >,
  character_id: string,
) {
  return [
    documentsColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="w-full max-w-full truncate">{row.original.title}</div>,
    }),
    documentsColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "expand",
                label: `${!row.getIsExpanded() ? "Show" : "Hide"} content`,
                icon: IconEnum.document,
                onClick: row.getToggleExpandedHandler(),
              },
              {
                id: "2",
                label: "Remove document",
                icon: IconEnum.trash,
                onClick: async () => {
                  await removeItem({ data: { id: character_id, document: { data: { id: row.original.id } } } });
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function locationsTableColumns(project_id: string) {
  return [
    locationsColumnHelper.display({
      id: "image_id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(project_id, "maps", row.original.image_id)}
            isTooltipDisabled
            label={row.original.title}
            size="sm"
          />
        </div>
      ),
      minSize: 5,
      maxSize: 5,
      meta: {
        centered: true,
      },
    }),
    locationsColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="w-full max-w-full truncate">{row.original.title}</div>,
    }),
  ];
}
function assetTableColumns(
  downloadImage: UseMutateAsyncFunction<
    {
      data: string;
    },
    unknown,
    {
      data: {
        id: string;
        title: string;
      };
    },
    unknown
  >,
  project_id: string | undefined,
  character_id: string,
  removeItem: UseMutateAsyncFunction<
    any,
    unknown,
    {
      data: {
        [key: string]:
          | string
          | {
              data: {
                id: string;
              };
            };
      };
    },
    unknown
  >,
) {
  return [
    assetColumnHelper.display({
      id: "id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(project_id as string, "images", row.original?.id || "")}
            isBordered
            isTooltipDisabled
            label={getAvatarInitials(row.original.title)}
            size="sm"
          />
        </div>
      ),
      meta: {
        noLink: true,
        centered: true,
      },
      minSize: 4.5,
      maxSize: 4.5,
    }),
    assetColumnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
      },
    }),

    assetColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "2",
                label: "Download",
                icon: IconEnum.download,
                onClick: () => downloadImage({ data: row.original }),
              },
              {
                id: "delete_image",
                label: "Remove image",
                icon: IconEnum.trash,
                onClick: async () => {
                  const parsedData = RemoveFromCharacterSchema.parse({
                    data: { id: character_id, image: { data: { id: row.original.id } } },
                  });
                  await removeItem(parsedData);
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}

function AdditionalFieldDisplay({
  character_fields,
  character_field_data,
  template_title,
}: {
  character_fields: CharacterFieldType[];
  character_field_data: CharacterFieldValueType[];
  template_title: string;
}) {
  return (
    <Collapsible initialOpen label={template_title}>
      <div className="grid grid-cols-6 gap-2">
        {character_fields.map((field) => {
          const fieldData = character_field_data.find((f) => f.id === field.id);
          const value =
            fieldData?.value && fieldData?.value?.value
              ? `${fieldData?.value?.value} ${fieldData?.value?.subOptionValue ? `- ${fieldData?.value?.subOptionValue}` : ""}`
              : "";
          const fieldClasses = fieldSizeClass({ type: field.field_type || "text" });
          const randomTable =
            field.field_type === "random_table"
              ? character_fields
                  .find((f) => f.id === field?.id)
                  ?.random_table_options?.find((opt) => opt.id === fieldData?.value?.value)
              : null;

          const subOption = randomTable
            ? randomTable.suboptions?.find((subOpt) => subOpt.id === fieldData?.value?.subOptionValue)
            : null;

          return (
            <div key={field?.id} className={fieldClasses}>
              <Title label={field.title} size="xl" />
              {(field.field_type === "text" || field.field_type === "number" || field.field_type === "dice_roll") && value ? (
                <Title label={value || ""} size="lg" />
              ) : null}
              {(field.field_type === "select" || field.field_type === "select_multiple") && value ? (
                <Title label={field?.options?.find((opt) => opt.id === fieldData?.value?.value)?.value || ""} size="lg" />
              ) : null}
              {field.field_type === "random_table" ? (
                <div>
                  <Title label={randomTable?.title || ""} size="lg" />
                  <Title label={subOption?.title || ""} />
                </div>
              ) : null}
              {field.field_type === "textarea" && value ? (
                <Editor initialContent={value || ""} isReadOnly name={field.title} onChange={() => {}} />
              ) : null}
            </div>
          );
        })}
      </div>
    </Collapsible>
  );
}

export function CharacterProfileView() {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [assetView, setAssetView] = useState<"table" | "card">("table");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const {
    data: existingCharacter,
    isLoading,
    isFetching,
  } = useGetEntity<CharacterType>(
    item_id,
    "characters",
    {
      relations: {
        tags: true,
        character_fields: true,
        locations: true,
        relationships: true,
        character_relationship_types: true,
        documents: true,
        images: true,
      },
    },
    {
      staleTime: 60 * 1000,
    },
  );
  const { mutateAsync: downloadImage } = useDownloadImage(project_id, "images");
  const { mutateAsync: removeItem } = useRemoveFromEntity("characters", project_id as string);
  const navigate = useNavigate();

  const relationships = [
    ...(existingCharacter?.data?.related_to || []),
    ...(existingCharacter?.data?.related_from || []),
    ...(existingCharacter?.data?.related_other || []),
  ].filter((r) => !!r);

  useChangeNavbarTitle(
    `The Arkive | Characters | ${getCharacterFullName(
      existingCharacter?.data?.first_name || "",
      undefined,
      existingCharacter?.data?.last_name,
    )}`,
    !!existingCharacter?.data,
  );

  const [, dispatch] = useTable({});

  const { data: existingTemplates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id },
      fields: ["id", "title"],
      relations: { character_fields: true },
      relationFilters: { tags: (existingCharacter?.data?.tags || [])?.map((t) => t.id) },
    },
    "character_fields_templates",
    { enabled: selectedTab === 2 && !!existingCharacter?.data?.tags?.length, staleTime: 5 * 60 * 1000 },
  );
  function showRelationshipTree() {
    if (existingCharacter?.data)
      setDialog({
        type: "family_tree",
        title: `Family tree of ${getCharacterFullName(
          existingCharacter?.data.first_name,
          existingCharacter?.data?.nickname || "",
          existingCharacter?.data?.last_name || "",
        )}`,
        data: { id: existingCharacter?.data.id },
        size: "lg",
      });
  }
  function openAddDocumentDrawer() {
    if (existingCharacter?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "character_add",
        title: "Add documents",
        data: { id: existingCharacter?.data?.id, type: "documents" },
      }));
    }
  }
  function openAddImageDrawer() {
    if (existingCharacter?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "character_add",
        title: "Add images",
        data: { id: existingCharacter?.data?.id, type: "images" },
      }));
    }
  }
  function openEditTagDrawer() {
    if (existingCharacter?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "edit_tags",
        title: "Edit tags",
        data: { tags: existingCharacter?.data?.tags || [], entity: { type: "characters", id: existingCharacter?.data?.id } },
      }));
    }
  }

  const columns = useMemo(() => relationshipTableColumns(project_id as string, navigate), []);
  return (
    <div className="grid h-full max-h-full w-full grid-cols-5 content-start gap-4 overflow-hidden pt-0 lg:content-stretch">
      {isLoading ? (
        <Skeleton type="character_profile" />
      ) : (
        <div className="col-span-5 flex h-full min-h-fit flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1 lg:h-full lg:max-h-full lg:overflow-hidden">
          <Avatar
            hasShowImage
            image={getImageURL(project_id as string, "images", existingCharacter?.data?.portrait_id)}
            initials={
              getAvatarInitials(existingCharacter?.data?.first_name || "", existingCharacter?.data?.last_name || "") || ""
            }
            isTooltipDisabled
            size="4xl"
          />

          <div className="mt-2 flex flex-col gap-y-1">
            <h2 className="text-center font-merriweather text-lg">
              {`${existingCharacter?.data?.first_name || ""} ${existingCharacter?.data?.last_name || ""}`.trimEnd()}
            </h2>
            {existingCharacter?.data?.nickname ? (
              <h3 className="text-center font-lato">{existingCharacter?.data?.nickname || ""}</h3>
            ) : null}
          </div>

          <div className="w-full">
            <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
          </div>
        </div>
      )}
      <div className="col-span-5 min-h-full rounded-lg bg-zinc-950 p-4 lg:col-span-4">
        <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
          {tabs[selectedTab].label}
          {selectedTab === 1 ? (
            <div className="ml-auto w-min">
              <Button
                icon={IconEnum.family_tree}
                isDisabled={disableShowRelationshipTree(existingCharacter?.data)}
                label="Show relationship tree"
                onClick={showRelationshipTree}
                size="sm"
                variant="info"
              />
            </div>
          ) : null}
        </h2>
        {selectedTab === 0 ? (
          <div className="flex h-full max-h-[calc(100%-3rem)] flex-col gap-y-2 overflow-auto">
            <Collapsible
              actions={[
                {
                  icon: IconEnum.add,
                  tooltip: "Add document",
                  onClick: openAddDocumentDrawer,
                },
              ]}
              icon={IconEnum.document}
              initialOpen={false}
              label="Documents">
              {existingCharacter?.data?.documents?.length ? (
                <div className="mt-2 animate-in fade-in fill-mode-both">
                  <Table
                    columns={documentsTableColumns(removeItem, existingCharacter?.data?.id)}
                    config={{
                      expandable: true,
                      hasNoHeaderGap: true,
                      getLink: (rowData: DocumentType) => `/projects/${project_id}/documents/${rowData.id}`,
                    }}
                    data={existingCharacter?.data?.documents || []}
                    dispatch={dispatch}
                    type="documents"
                  />
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <Alert label="There is no content." variant="info" />
                </div>
              )}
            </Collapsible>

            <Collapsible icon={IconEnum.map_pin} initialOpen={false} label="Locations">
              <div className="mt-2 animate-in fade-in fill-mode-both">
                {existingCharacter?.data?.locations?.length ? (
                  <Table
                    columns={locationsTableColumns(project_id as string)}
                    config={{
                      expandable: true,
                      hasNoHeaderGap: true,
                      getLink: (rowData: CharacterLocationType) =>
                        `/projects/${project_id}/maps/${rowData.id}/${rowData.map_pin_id}`,
                    }}
                    data={existingCharacter?.data?.locations || []}
                    dispatch={dispatch}
                    type="documents"
                  />
                ) : (
                  <div className="mt-2 w-full">
                    <Alert label="There is no content." variant="info" />
                  </div>
                )}
              </div>
            </Collapsible>
            <Collapsible
              actions={[
                {
                  icon: assetView === "card" ? IconEnum.card : IconEnum.table,
                  tooltip: "Change view",
                  onClick: () => setAssetView(assetView === "card" ? "table" : "card"),
                },
                {
                  icon: IconEnum.add,
                  tooltip: "Add assets",
                  onClick: openAddImageDrawer,
                },
              ]}
              icon={IconEnum.image}
              initialOpen={false}
              label="Assets">
              {existingCharacter?.data?.images?.length ? (
                <div className="mt-2 animate-in fade-in fill-mode-both">
                  {assetView === "table" ? (
                    <Table
                      columns={assetTableColumns(downloadImage, project_id, existingCharacter?.data?.id, removeItem)}
                      config={{
                        hasNoHeaderGap: true,
                      }}
                      data={existingCharacter?.data?.images || []}
                      dispatch={dispatch}
                      type="images"
                    />
                  ) : (
                    <Gallery columns={4} images={existingCharacter?.data?.images} isOpenable />
                  )}
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <Alert label="There is no content." variant="info" />
                </div>
              )}
            </Collapsible>

            <Collapsible
              actions={[
                {
                  icon: IconEnum.edit,
                  tooltip: "Edit tags",
                  onClick: openEditTagDrawer,
                },
              ]}
              icon={IconEnum.tags}
              initialOpen={false}
              label="Tags">
              {existingCharacter?.data?.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in fill-mode-both">
                  {existingCharacter.data.tags.map((tag) => (
                    <div key={tag.id}>
                      <Badge customColor={tag.color} label={tag.title} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <Alert label="There is no content." variant="info" />
                </div>
              )}
            </Collapsible>
          </div>
        ) : null}
        {selectedTab === 1 ? (
          <div>
            <TablePageLayout>
              {isFetching ? (
                <div className="pt-10">
                  <Skeleton limit={5} type="table" />
                </div>
              ) : (
                <div className="h-full max-h-full w-full overflow-hidden">
                  <Table
                    columns={columns}
                    config={{
                      getLink: (rowData: any) => `/projects/${project_id}/characters/${rowData.id}`,
                    }}
                    data={relationships.sort((a, b) => {
                      if (a.first_name < b.first_name) return -1;
                      if (a.first_name > b.first_name) return 1;
                      if (a.id < b.id) return -1;
                      if (a.id > b.id) return 1;
                      if ((a.relation_title || "") < (b.relation_title || "")) return -1;
                      if ((a.relation_title || "") > (b.relation_title || "")) return 1;
                      return 0;
                    })}
                    dispatch={dispatch}
                    type="characters"
                  />
                </div>
              )}
            </TablePageLayout>
          </div>
        ) : null}
        {selectedTab === 2 ? (
          <ul className="flex flex-col gap-y-2 overflow-hidden animate-in fade-in fill-mode-both">
            {isFetchingTemplates ? <Skeleton type="character_profile_main" /> : null}
            {existingTemplates?.data?.length && !isFetchingTemplates
              ? uniqueBy(existingTemplates?.data, ["id"])
                  ?.sort(sortEntities)
                  ?.map((t) => (
                    <div key={t.id} className="flex flex-col">
                      <AdditionalFieldDisplay
                        character_field_data={
                          existingCharacter?.data?.character_fields?.filter((field) => field.template_id === t.id) || []
                        }
                        character_fields={t.character_fields}
                        template_title={t.title}
                      />
                    </div>
                  ))
              : null}
            {!isFetchingTemplates && !existingTemplates?.data?.length ? (
              <Alert label="There are no templates available." variant="info" />
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
