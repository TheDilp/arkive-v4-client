import { useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
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
  Skeleton,
  Table,
  TablePageLayout,
  Tabs,
  Title,
} from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity, useTable } from "../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterFieldType,
  CharacterFieldValueType,
  CharacterLocationType,
  CharacterRelationType,
  CharacterType,
  DocumentType,
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
  sortEntities,
} from "../../utils";

const relationshipColumnHelper = createColumnHelper<CharacterRelationType>();
const documentsColumnHelper = createColumnHelper<DocumentType>();
const locationsColumnHelper = createColumnHelper<MapType>();

const tabs = [
  { id: "1", label: "Resources", icon: IconEnum.document },
  { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  { id: "4", label: "Images", icon: IconEnum.image },
];

const fieldSizeClass = tv({
  base: "flex flex-col justify-center text-center mt-1 bg-zinc-800 rounded shadow-sm p-0.5",
  variants: {
    type: {
      dice_roll: "col-span-6 sm:col-span-3 lg:col-span-1",
      text: "col-span-6 sm:col-span-3 lg:col-span-2",
      select: "col-span-6 sm:col-span-3 lg:col-span-2",
      number: "col-span-6 sm:col-span-3 lg:col-span-2",
      random_table: "col-span-6 sm:col-span-3 lg:col-span-2",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
    },
  },
});

const relationshipTableColumns = (project_id: string, naivgate: NavigateFunction) => [
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
    id: "last_name",
    header: "Last name",
    cell: ({ row }) => row.original.last_name,
  }),
  relationshipColumnHelper.display({
    id: "nickname",
    header: "Nickname",
    cell: ({ row }) => row.original?.nickname,
  }),
  relationshipColumnHelper.display({
    id: "relation_type",
    header: "Relation",
    cell: ({ row }) => getSentenceCase(row.original?.relation_type),
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

const documentsTableColumns = [
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
              label: "Unlink document",
              icon: IconEnum.unlink,
            },
          ]}>
          <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
        </Dropdown>
      </div>
    ),
  }),
];
const locationsTableColumns = (project_id: string) => [
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
              {(field.field_type === "text" ||
                field.field_type === "number" ||
                field.field_type === "dice_roll" ||
                field.field_type === "select" ||
                field.field_type === "select_multiple") &&
              value ? (
                <Title label={value || ""} size="lg" />
              ) : null}
              {field.field_type === "random_table" ? (
                <div>
                  <Title label={randomTable?.title || ""} />
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
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const { data: existingCharacter, isFetching } = useGetEntity<CharacterType>(
    item_id,
    "characters",
    {
      data: {},
      relations: { tags: true, character_fields: true, locations: true, relationships: true, documents: true },
    },
    {
      staleTime: 60 * 1000,
    },
  );

  const navigate = useNavigate();

  const relationships = [
    ...(existingCharacter?.data?.related_to || []),
    ...(existingCharacter?.data?.related_from?.map((relation) => ({
      ...relation,
      relation_type:
        relation.relation_type === "father" || relation.relation_type === "mother" ? "child" : relation.relation_type,
    })) || []),
    ...(existingCharacter?.data?.siblings?.map((sibling) => ({ ...sibling, relation_type: "sibling" })) || []),
  ];

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
    { data: { project_id }, fields: ["id", "title"], relations: { character_fields: true } },
    "character_fields_templates",
    { enabled: selectedTab === 2, staleTime: 5 * 60 * 1000 },
  );

  function showFamilyTree() {
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
  function openAddTagDrawer() {
    if (existingCharacter?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "character_add",
        title: "Add tags",
        data: { id: existingCharacter?.data?.id, type: "tags" },
      }));
    }
  }

  const columns = useMemo(() => relationshipTableColumns(project_id as string, navigate), []);

  return (
    <div className="grid h-full max-h-[calc(100%-2rem)] w-full grid-cols-5 content-start gap-4 overflow-hidden p-4 pb-16 lg:content-stretch">
      {isFetching ? (
        <Skeleton type="character_profile" />
      ) : (
        <div className="col-span-5 flex h-full flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-800 p-4 lg:col-span-1 lg:h-full lg:max-h-full">
          <Avatar
            image={getImageURL(project_id as string, "images", existingCharacter?.data?.portrait_id)}
            isTooltipDisabled
            label={getCharacterFullName(
              existingCharacter?.data?.first_name as string,
              existingCharacter?.data?.nickname || "",
              existingCharacter?.data?.last_name || "",
            )}
            size="4xl"
          />
          <div className="mt-2 flex flex-col gap-y-1">
            <h2 className="text-center font-merriweather text-lg">
              {`${existingCharacter?.data?.first_name} ${existingCharacter?.data?.last_name || ""}`.trimEnd()}
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
      <div className="col-span-5 h-full overflow-y-auto rounded-lg bg-zinc-950 p-4 pb-24 lg:col-span-4">
        <h2 className="mb-4 flex items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
          {tabs[selectedTab].label}
          {selectedTab === 1 ? (
            <div className="ml-auto w-min">
              <Button icon={IconEnum.family_tree} label="Show family tree" onClick={showFamilyTree} size="sm" variant="info" />
            </div>
          ) : null}
        </h2>
        {selectedTab === 0 ? (
          <div className="flex flex-col gap-y-2">
            {isFetching ? (
              <Skeleton type="character_profile_main" />
            ) : (
              <>
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
                        columns={documentsTableColumns}
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
                      icon: IconEnum.add,
                      tooltip: "Add tags",
                      onClick: openAddTagDrawer,
                    },
                  ]}
                  icon={IconEnum.tags}
                  initialOpen={false}
                  label="Tags">
                  {existingCharacter?.data?.tags?.length ? (
                    <div className="mt-2 flex flex-wrap">
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
              </>
            )}
          </div>
        ) : null}
        {selectedTab === 1 ? (
          <TablePageLayout>
            {isFetching ? (
              <div className="pt-10">
                <Skeleton type="table" />
              </div>
            ) : (
              <div className="h-full max-h-[85%] w-full overflow-hidden">
                <Table
                  columns={columns}
                  config={{
                    getLink: (rowData: any) => `/projects/${project_id}/characters/${rowData.id}`,
                  }}
                  data={relationships}
                  dispatch={dispatch}
                  type="characters"
                />
              </div>
            )}
          </TablePageLayout>
        ) : null}
        {selectedTab === 2 ? (
          <ul className="flex flex-col gap-y-2 overflow-y-auto animate-in fade-in fill-mode-both">
            {isFetchingTemplates ? <Skeleton type="character_profile_main" /> : null}
            {existingTemplates?.data?.length && !isFetchingTemplates
              ? existingTemplates?.data?.sort(sortEntities)?.map((t) => (
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
