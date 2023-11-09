import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { uniqueBy } from "remirror";
import { tv } from "tailwind-variants";

import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Collapsible,
  createColumnHelper,
  Dropdown,
  Editor,
  Gallery,
  Icon,
  Input,
  Skeleton,
  Table,
  TablePageLayout,
  Tabs,
} from "../../components";
import {
  useBreakpoint,
  useChangeNavbarTitle,
  useDownloadImage,
  useGenerateDocument,
  useGetEntities,
  useGetEntity,
  useGetSubEntity,
  useRemoveFromEntity,
  useTable,
} from "../../hooks";
import {
  AdditionalFieldValueType,
  CharacterFieldTemplateType,
  CharacterFieldType,
  CharacterLocationType,
  CharacterRelatedType,
  CharacterType,
  ConversationType,
  DialogAtomType,
  DocumentType,
  DrawerAtomType,
  ImageType,
  MapType,
  RandomTableOptionType,
} from "../../types";
import {
  dialogAtom,
  drawerAtom,
  formatDateToString,
  getAvatarInitials,
  getCharacterFullName,
  getCharacterProfileTabFromType,
  getDefaultEntityIcon,
  getImageURL,
  getSentenceCase,
  IconEnum,
  NameFilters,
  sortCharactersByName,
  sortEntities,
} from "../../utils";
import { RemoveFromCharacterSchema } from "../../validation";
import { ConversationView } from ".";

const relationshipColumnHelper = createColumnHelper<CharacterRelatedType>();
const documentsColumnHelper = createColumnHelper<DocumentType>();
const locationsColumnHelper = createColumnHelper<MapType>();
const assetColumnHelper = createColumnHelper<ImageType>();
const conversationColumnHelper = createColumnHelper<ConversationType>();

type GenerateDocumentType = UseMutateAsyncFunction<
  {
    data: {
      id: string;
    };
  },
  unknown,
  {
    data: {
      title: string;
      project_id: string;
      parent_id?: string;
      content?: string;
    };
  },
  unknown
>;

const tabs = [
  { id: "1", label: "Resources", icon: IconEnum.document },
  { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  { id: "4", label: "Conversations", icon: IconEnum.conversation },
];

const fieldSizeClass = tv({
  base: "flex flex-col justify-center mt-1 p-0.5",
  variants: {
    type: {
      dice_roll: "col-span-6 sm:col-span-3 lg:col-span-1",
      text: "col-span-6 sm:col-span-3 lg:col-span-1",
      select: "col-span-6 sm:col-span-3 lg:col-span-1",
      select_multiple: "col-span-6 sm:col-span-3 lg:col-span-1",
      number: "col-span-6 sm:col-span-3 lg:col-span-1",
      random_table: "col-span-6 sm:col-span-3 lg:col-span-1",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
      date: "col-span-6 sm:col-span-3 lg:col-span-1",
      boolean: "col-span-6 sm:col-span-3 lg:col-span-1",
    },
  },
});

function RandomTableField({
  random_table_id,
  random_table_option_id,
  field,
  suboptionValue,
}: {
  random_table_id: string | undefined | null;
  random_table_option_id: string | undefined;
  field: CharacterFieldType;
  suboptionValue: string | undefined;
}) {
  const { data: option, isLoading } = useGetSubEntity<RandomTableOptionType>(random_table_option_id, "random_table_options", {
    data: { parent_id: random_table_id },
    fields: ["id", "title"],
    relations: {
      random_table_suboptions: true,
    },
  });
  const subOption =
    option?.data?.random_table_suboptions?.length && suboptionValue
      ? option?.data?.random_table_suboptions.find((subopt) => subopt.id === suboptionValue)
      : null;
  return (
    <div>
      <Input
        isDisabled={isLoading}
        isLoading={isLoading}
        isReadOnly
        label={field.title}
        name={field.title}
        onChange={() => {}}
        value={`${option?.data?.title || ""} ${subOption?.title ? `(${subOption?.title})` : ""}` || ""}
      />
    </div>
  );
}

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
      // minSize: 15,
      // maxSize: 15,
    }),
    relationshipColumnHelper.display({
      id: "nickname",
      header: "Nickname",
      cell: ({ row }) => row.original?.nickname,
      minSize: 15,
      maxSize: 15,
    }),
    relationshipColumnHelper.display({
      id: "last_name",
      header: "Last name",
      cell: ({ row }) => row.original.last_name,
      // minSize: 15,
      // maxSize: 15,
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
      minSize: 10,
      maxSize: 10,
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
                icon: IconEnum.character,
                onClick: () => naivgate(`/projects/${project_id}/characters/${row.original.id}/resources`),
              },
              {
                id: "2",
                label: `View conversations of ${getCharacterFullName(
                  row.original.first_name,
                  undefined,
                  row.original?.last_name,
                )}`,
                icon: IconEnum.conversation,
                onClick: () => naivgate(`/projects/${project_id}/characters/${row.original.id}/conversations`),
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
      minSize: 5,
      maxSize: 5,
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
  project_id: string,
) {
  return [
    documentsColumnHelper.display({
      id: "image_id",
      header: "",
      meta: {
        centered: true,
      },
      cell: ({ row }) =>
        "image_id" in row.original && row.original?.image_id ? (
          <Avatar
            image={getImageURL(project_id, "images", (row.original?.image_id as string) || "")}
            isBordered
            isTooltipDisabled
            size="sm"
          />
        ) : (
          <Icon fontSize={24} icon={row.original.is_folder ? IconEnum.folder : getDefaultEntityIcon("documents")} />
        ),
      minSize: 3.25,
      maxSize: 3.25,
    }),
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
            image={getImageURL(project_id, "map_images", row.original.image_id)}
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
function conversationTableColumns(
  project_id: string,
  item_id: string,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  generateDocument: GenerateDocumentType,
) {
  return [
    conversationColumnHelper.display({
      id: "characters",
      header: "Members",
      cell: ({ row }) => (
        <div className="-ml-4 flex w-full items-center justify-center first:ml-0">
          {row.original.characters.map((char) => (
            <Avatar
              key={char.id}
              image={getImageURL(project_id, "images", char?.portrait_id || "")}
              initials={getAvatarInitials(char.first_name, char?.last_name || "")}
              isBordered
              isTooltipDisabled
              label={getCharacterFullName(char.first_name, char?.last_name || "")}
              size="sm"
            />
          ))}
        </div>
      ),
      minSize: 6,
      maxSize: 6,
    }),
    conversationColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
      // minSize: 15,
      // maxSize: 15,
    }),
    conversationColumnHelper.display({
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
                id: "edit_conversation",
                label: "Edit conversation",
                icon: IconEnum.edit,
                onClick: () => {
                  const char = row.original.characters.find((c) => c.id === item_id);
                  if (char) {
                    setDrawer((prev) => ({
                      ...prev,
                      data: { character: char, conversation_id: row.original.id },
                      title: `Edit conversation - ${row.original.title}`,
                      type: "conversations",
                    }));
                  }
                },
              },
              {
                id: "generate_document",
                label: "Create document from conversation",
                icon: IconEnum.document,
                onClick: async () => {
                  await generateDocument({
                    data: {
                      title: row.original.title,
                      parent_id: row.original.id,
                      project_id,
                    },
                  });
                },
              },
              {
                id: "delete_conversation",
                label: "Delete conversation",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "conversations",
                    },
                    title: "Delete conversation",
                    size: "sm",
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
      minSize: 5,
      maxSize: 5,
    }),
  ];
}
function AdditionalFieldDisplay({
  character_fields,
  character_field_data,
  template_title,
}: {
  character_fields: CharacterFieldType[];
  character_field_data: AdditionalFieldValueType[];
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

          const date =
            field.field_type === "date" ? (fieldData?.value?.value as { day: number; year: number; month: string }) : null;

          return (
            <div key={field?.id} className={fieldClasses}>
              {/* <Title isDrawerTitle label={field.title} size="xl" /> */}
              {(field.field_type === "text" || field.field_type === "number" || field.field_type === "dice_roll") && value ? (
                <Input isReadOnly label={field.title} name={field.title} onChange={() => {}} value={value} />
              ) : null}
              {field.field_type === "images_single" && value ? (
                <Input isReadOnly label={field.title} name={field.title} onChange={() => {}} value={value} />
              ) : null}
              {(field.field_type === "select" || field.field_type === "select_multiple") && value ? (
                <Input
                  isReadOnly
                  label={field.title}
                  name={field.title}
                  onChange={() => {}}
                  value={field?.options?.find((opt) => opt.id === fieldData?.value?.value)?.value || ""}
                />
              ) : null}
              {field.field_type === "random_table" ? (
                <RandomTableField
                  field={field}
                  random_table_id={field.random_table_id}
                  random_table_option_id={fieldData?.value.value as string | undefined}
                  suboptionValue={fieldData?.value.subOptionValue}
                />
              ) : null}
              {field.field_type === "textarea" && value ? (
                <Editor initialContent={(value as string) || undefined} isReadOnly name={field.title} onChange={() => {}} />
              ) : null}
              {field.field_type === "date" && value ? (
                <div>
                  <Input
                    isReadOnly
                    label={field.title}
                    name={field.title}
                    onChange={() => {}}
                    value={formatDateToString(date?.day, date?.year, date?.month, field?.calendar?.months || [])}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Collapsible>
  );
}

export function CharacterProfileView() {
  const { project_id, item_id, type, subitem_id } = useParams();
  const navigate = useNavigate();
  const { isLg } = useBreakpoint();
  const [selectedTab, setSelectedTab] = useState(getCharacterProfileTabFromType(type));
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
  const { mutateAsync: generateDocument } = useGenerateDocument("conversations");

  const relationships = [
    ...(existingCharacter?.data?.related_to || []),
    ...(existingCharacter?.data?.related_from || []),
    ...(existingCharacter?.data?.related_other || []),
  ].filter((r) => !!r);

  useChangeNavbarTitle(
    ` Characters | ${getCharacterFullName(
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
  const { data: existingConversations, isFetching: isLoadingConversations } = useGetEntities<ConversationType>(
    {
      data: {
        character_id: item_id,
        project_id,
      },
      fields: ["id", "title"],
      relations: {
        characters: true,
      },
    },
    "conversations",
    { enabled: selectedTab === 3 && !!existingCharacter?.data, queryKeyConcat: [item_id as string] },
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
  function openConversationDrawer() {
    if (existingCharacter?.data)
      setDrawer({
        type: "conversations",
        title: "Start new conversation",
        data: {
          character: {
            id: existingCharacter?.data.id,
            first_name: existingCharacter?.data?.first_name,
            last_name: existingCharacter?.data?.last_name,
            portrait_id: existingCharacter?.data?.portrait_id,
          },
        },
        size: "lg",
      });
  }
  const columns = useMemo(() => relationshipTableColumns(project_id as string, navigate), []);

  useEffect(() => {
    setSelectedTab(getCharacterProfileTabFromType(type));
  }, [type]);
  return (
    <div className="flex h-full min-h-full flex-col gap-y-2">
      <div className="flex h-12 min-h-[3rem] items-center justify-between">
        <Breadcrumbs />
        {item_id ? (
          <div className="w-52">
            <Button
              icon={IconEnum.edit}
              label="Edit current character"
              onClick={() => {
                setDrawer((prev) => ({
                  ...prev,
                  size: "lg",
                  title: "Edit character",
                  type: "characters",
                  data: { id: item_id as string, project_id: project_id as string },
                }));
              }}
            />
          </div>
        ) : null}
      </div>
      <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
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
              <Tabs
                isVertical
                onChange={(tab, index) => {
                  navigate(`/projects/${project_id}/characters/${item_id}/${tab.label.toLowerCase()}`);
                  setSelectedTab(index);
                }}
                selectedTab={selectedTab}
                tabs={tabs}
              />
            </div>
          </div>
        ) : null}
        {!isLoading && !isLg ? (
          <div className="w-full">
            <Tabs
              onChange={(tab, index) => {
                navigate(`/projects/${project_id}/characters/${item_id}/${tab.label.toLowerCase()}`);
                setSelectedTab(index);
              }}
              selectedTab={selectedTab}
              tabs={tabs}
            />
          </div>
        ) : null}
        <div className="flex h-[calc(100vh-15rem)] max-h-[calc(100vh-15rem)] flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4 lg:h-[calc(100vh-9.5rem)] lg:max-h-[calc(100vh-9.5rem)]">
          <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
            <span className="flex">
              {type === "conversations" && subitem_id ? (
                <div className="ml-auto flex w-min items-center pr-2 text-sm">
                  <Button
                    hasNoBackground
                    icon={IconEnum.chevron_left}
                    isIconOnly
                    onClick={() => {
                      navigate(`/projects/${project_id}/characters/${item_id}/conversations`);
                    }}
                    size="sm"
                  />
                </div>
              ) : null}
              {tabs[selectedTab].label} {subitem_id ? "-" : ""}
              {existingConversations?.data?.find((convo) => convo?.id === subitem_id)?.title}
            </span>
            {type === "relationships" ? (
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
            {type === "conversations" && !subitem_id ? (
              <div className="ml-auto w-min">
                <Button
                  icon={IconEnum.conversation}
                  label="New conversation"
                  onClick={openConversationDrawer}
                  size="sm"
                  variant="info"
                />
              </div>
            ) : null}
          </h2>
          {type === "resources" ? (
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
                      columns={documentsTableColumns(removeItem, existingCharacter?.data?.id, project_id as string)}
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
                      <Gallery columns={4} images={existingCharacter?.data?.images} isOpenable size="2xl" />
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
          {type === "relationships" ? (
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
                        getLink: (rowData: any) => `/projects/${project_id}/characters/${rowData.id}/relationships`,
                      }}
                      data={relationships.sort(sortCharactersByName)}
                      dispatch={dispatch}
                      type="characters"
                    />
                  </div>
                )}
              </TablePageLayout>
            </div>
          ) : null}
          {type === "additional fields" ? (
            <ul className="flex flex-col gap-y-2 overflow-y-auto animate-in fade-in fill-mode-both">
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
          {type === "conversations" ? (
            <div className="flex-1">
              {subitem_id ? null : (
                <div className="col-span-3 flex max-h-full flex-col overflow-y-auto">
                  <Table
                    columns={conversationTableColumns(
                      project_id as string,
                      item_id as string,
                      setDialog,
                      setDrawer,
                      generateDocument,
                    )}
                    config={{
                      onRowClick: (rowData: ConversationType) => {
                        navigate(`/projects/${project_id}/characters/${item_id}/conversations/${rowData.id}`);
                      },
                    }}
                    data={existingConversations?.data || []}
                    dispatch={dispatch}
                    isLoading={isLoadingConversations}
                    type="conversations"
                  />
                </div>
              )}
              <div className="h-full max-h-[100%] overflow-hidden">
                {subitem_id ? <ConversationView id={subitem_id} /> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
