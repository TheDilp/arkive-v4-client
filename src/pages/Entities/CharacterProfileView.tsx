import { useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { Link, NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import {
  Alert,
  Avatar,
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
  CharacterRelationType,
  CharacterType,
} from "../../types";
import {
  dialogAtom,
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  getSentenceCase,
  IconEnum,
  sortEntities,
} from "../../utils";

const columnHelper = createColumnHelper<CharacterRelationType>();

const tabs = [
  { id: "1", label: "Links", icon: IconEnum.map_pin },
  { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  { id: "4", label: "Images", icon: IconEnum.image },
];

const fieldSizeClass = tv({
  base: "flex flex-col justify-center text-center mt-1 bg-zinc-800 rounded shadow-sm p-0.5",
  variants: {
    type: {
      dice_roll: "col-span-3 lg:col-span-1",
      text: "col-span-3 lg:col-span-2",
      select: "col-span-3 lg:col-span-2",
      number: "col-span-3 lg:col-span-2",
      random_table: "col-span-3 lg:col-span-2",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
    },
  },
});

const relationshipTableColumns = (project_id: string, naivgate: NavigateFunction) => [
  columnHelper.display({
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
    minSize: 5,
    maxSize: 5,
  }),
  columnHelper.display({
    id: "first_name",
    header: "First name",
    cell: ({ row }) => row.original.first_name,
  }),
  columnHelper.display({
    id: "last_name",
    header: "Last name",
    cell: ({ row }) => row.original.last_name,
  }),
  columnHelper.display({
    id: "nickname",
    header: "Nickname",
    cell: ({ row }) => row.original?.nickname,
  }),
  columnHelper.display({
    id: "relation_type",
    header: "Relation",
    cell: ({ row }) => getSentenceCase(row.original?.relation_type),
  }),
  columnHelper.display({
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
  const setDialog = useSetAtom(dialogAtom);
  const { data: existingCharacter, isFetching } = useGetEntity<CharacterType>(item_id, "characters", {
    data: {},
    relations: { tags: true, character_fields: true, locations: true, relationships: true },
  });

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

  const columns = useMemo(() => relationshipTableColumns(project_id as string, navigate), []);

  return (
    <div className="grid h-full max-h-[calc(100%-2rem)] w-full grid-cols-5 gap-4 overflow-hidden p-4 pb-16">
      {isFetching ? (
        <Skeleton type="character_profile" />
      ) : (
        <div className="col-span-5 flex h-fit flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-800 p-4 lg:col-span-1 lg:h-full lg:max-h-full">
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
      {isFetchingTemplates ? (
        <Skeleton type="character_profile_main" />
      ) : (
        <div className="col-span-5 overflow-y-auto rounded-lg bg-zinc-950 p-4 lg:col-span-4">
          {selectedTab === 0 ? (
            <div className="flex flex-col gap-y-2">
              {/* <Collapsible icon={IconEnum.document} initialOpen={false} label="Documents"></Collapsible> */}

              <Collapsible icon={IconEnum.map_pin} initialOpen={false} label="Locations">
                <ul className="mt-2 flex flex-col gap-y-2 animate-in fade-in fill-mode-both">
                  {existingCharacter?.data?.locations ? (
                    existingCharacter.data.locations.map((location) => (
                      <div
                        key={location.id}
                        className="flex w-full items-center gap-x-2 rounded bg-zinc-800 p-2 hover:text-blue-300">
                        <Avatar image={getImageURL(project_id as string, "maps", location.image_id)} label={location.title} />
                        <Link to={`/projects/${project_id}/maps/${location.id}/${location.map_pin_id}`}>{location.title}</Link>
                      </div>
                    ))
                  ) : (
                    <Alert label="There is no content." variant="info" />
                  )}
                </ul>
              </Collapsible>
            </div>
          ) : null}
          {selectedTab === 1 ? (
            <TablePageLayout>
              <div className="flex w-full">
                <div className="ml-auto w-min">
                  <Button icon={IconEnum.family_tree} label="Show family tree" onClick={showFamilyTree} variant="info" />
                </div>
              </div>
              <div className="h-full max-h-[85%] w-full overflow-hidden">
                <Table columns={columns} data={relationships} dispatch={dispatch} type="characters" />
              </div>
            </TablePageLayout>
          ) : null}
          {selectedTab === 2 ? (
            <ul className="flex flex-col gap-y-2 overflow-y-auto animate-in fade-in fill-mode-both">
              {existingTemplates?.data?.length ? (
                existingTemplates?.data?.sort(sortEntities)?.map(
                  (t) => (
                    <div key={t.id} className="flex flex-col">
                      <AdditionalFieldDisplay
                        character_field_data={
                          existingCharacter?.data?.character_fields?.filter((field) => field.template_id === t.id) || []
                        }
                        character_fields={t.character_fields}
                        template_title={t.title}
                      />
                    </div>
                  ),
                  // <FieldTemplateRow
                  //   key={t?.id}
                  //   character_fields={t.character_fields}
                  //   character_fields_data={character_fields}
                  //   createNotification={createNotification}
                  //   handleChange={handleChange}
                  //   id={t?.id}
                  //   selectedTemplates={selectedTemplates}
                  //   title={t?.title}
                  // />
                )
              ) : (
                <Alert label="There are no templates available." variant="info" />
              )}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
