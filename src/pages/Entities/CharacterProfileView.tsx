import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import omit from "lodash.omit";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  CarouselEntityPreview,
  Checkbox,
  Collapsible,
  createColumnHelper,
  Dropdown,
  EntityPreview,
  FormattedDate,
  Gallery,
  Icon,
  Input,
  Skeleton,
  StaticRender,
  Table,
  Tabs,
  Tooltip,
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
  useUpdateEntityResource,
} from "../../hooks";
import {
  CharacterCharacterFieldType,
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
  WebhookType,
} from "../../types";
import {
  baseURLS,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  formatDateToString,
  getAvatarInitials,
  getCharacterFullName,
  getCharacterProfileTabFromType,
  getDefaultEntityIcon,
  getFirstLetters,
  getImageURL,
  getSentenceCase,
  IconEnum,
  sortCharactersByName,
  userAtom,
} from "../../utils";
import { RemoveFromCharacterSchema } from "../../validation";
import { ConversationView } from ".";

const relationshipColumnHelper = createColumnHelper<CharacterRelatedType>();
const documentsColumnHelper = createColumnHelper<DocumentType & { is_main_page: boolean | null }>();
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

function relationshipTableColumns(
  project_id: string,
  navigate: NavigateFunction,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  isPreview?: boolean,
) {
  return [
    relationshipColumnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(project_id, "images", row.original?.portrait_id || "")}
            initials={getAvatarInitials(row.original.full_name || "")}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.full_name || "")}
            size="sm"
          />
        </div>
      ),
      meta: {
        pinned: true,
        centered: true,
      },
      minSize: 5,
      maxSize: 5,
    }),
    relationshipColumnHelper.display({
      id: "Name",
      header: "Name",
      cell: ({ row }) => row.original.full_name,
      meta: {
        pinned: true,
      },
      minSize: 15,
    }),
    relationshipColumnHelper.display({
      id: "relation_type",
      header: "Relation",
      cell: ({ row }) => (
        <div className="truncate">
          {row?.original?.relation_title
            ? `${getSentenceCase(row?.original?.relation_title)} (${row.original?.relation_type_title || ""})`
            : getSentenceCase(row.original?.relation_type_title || "")}
        </div>
      ),
      minSize: 20,
      maxSize: 20,
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
                title: `Preview profile of ${row.original.full_name}`,
                icon: IconEnum.eye,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    title: "Preview character",
                    data: { id: row.original.id, entity_type: "characters" },
                    type: "entity_preview",
                    size: "half",
                  })),
              },
              {
                id: "2",
                title: `View profile of ${row.original.full_name}`,
                icon: IconEnum.character,
                onClick: isPreview
                  ? () => {}
                  : () => navigate(`/projects/${project_id}/characters/${row.original.id}/resources`),
              },
              {
                id: "3",
                title: `View conversations of ${row.original.full_name}`,
                icon: IconEnum.conversation,
                onClick: () =>
                  isPreview ? () => {} : navigate(`/projects/${project_id}/characters/${row.original.id}/conversations`),
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
  removeItem: UseMutateAsyncFunction<any, unknown, { relations: { [key: string]: { id: string }[] } }, unknown>,
  updateResource: UseMutateAsyncFunction<
    any,
    unknown,
    {
      relations: {
        [key: string]: {
          [key: string]: string | boolean | number | null;
        }[];
      };
    },
    unknown
  >,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
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
      id: "is_main_page",
      header: "Is main page",
      cell: ({ row }) => (
        <Checkbox
          name="is_main_page"
          onChange={async () =>
            updateResource({
              relations: {
                documents: [
                  {
                    id: row.original.id,
                    is_main_page: !row.original.is_main_page,
                  },
                ],
              },
            })
          }
          value={!!row.original.is_main_page}
        />
      ),
      maxSize: 5,
      size: 5,
      minSize: 5,
      meta: {
        centered: true,
        noLink: true,
      },
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
                id: "preview",
                title: "Preview content",
                icon: IconEnum.document,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    data: {
                      id: row.original.id,
                      entity_type: "documents",
                    },
                    title: "Preview document",
                    type: "entity_preview",
                    size: "half",
                  })),
              },
              {
                id: "2",
                title: "Remove document",
                icon: IconEnum.trash,
                onClick: async () => {
                  await removeItem({ relations: { documents: [{ id: row.original.id }] } });
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
  removeItem: UseMutateAsyncFunction<
    any,
    unknown,
    {
      relations: {
        [key: string]: {
          id: string;
        }[];
      };
    },
    unknown
  >,
  webhooks: WebhookType[],
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
                id: "download_image",
                title: "Download",
                icon: IconEnum.download,
                onClick: () => downloadImage({ data: row.original }),
              },
              {
                id: "send_to_discord",
                title: "Send to Discord",
                icon: IconEnum.discord,
                subItems: webhooks.map((webhook) => ({
                  id: webhook.id,
                  title: webhook.title,
                  onClick: () =>
                    FetchFunction({
                      url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                      body: JSON.stringify({
                        data: { id: row.original.id, type: "image" },
                      }),
                      method: "POST",
                    }),
                })),
              },
              {
                id: "delete_image",
                title: "Remove image",
                icon: IconEnum.trash,
                onClick: async () => {
                  const parsedData = RemoveFromCharacterSchema.parse({
                    relations: { images: [{ id: row.original.id }] },
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
        <div className="flex w-full items-center justify-center">
          {row.original.characters.map((char) => (
            <div key={char.id} className="-ml-4 first:ml-0">
              <Avatar
                image={getImageURL(project_id, "images", char?.portrait_id || "")}
                initials={getAvatarInitials(char?.full_name || "")}
                isBordered
                isTooltipDisabled
                label={getCharacterFullName(char?.full_name || "")}
                size="sm"
              />
            </div>
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
                title: "Edit conversation",
                icon: IconEnum.edit,
                onClick: () => {
                  const char = row.original.characters.find((c) => c.id === item_id);
                  if (char) {
                    setDrawer((prev) => {
                      if (char.full_name) {
                        return {
                          ...prev,
                          data: {
                            character: { full_name: char.full_name, id: char.id, portrait_id: char.portrait_id },
                            conversation_id: row.original.id,
                          },
                          title: `Edit conversation - ${row.original.title}`,
                          type: "conversations",
                        };
                      }
                      return prev;
                    });
                  }
                },
              },
              {
                id: "generate_document",
                title: "Create document from conversation",
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
                title: "Delete conversation",
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
function RandomTableField({
  random_table_id,
  random_table_option_id,
  title,
  suboptionValue,
}: {
  random_table_id: string | undefined | null;
  random_table_option_id: string | undefined;
  title: string;
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
        label={title}
        name={title}
        onChange={() => {}}
        value={`${option?.data?.title || ""} ${subOption?.title ? `(${subOption?.title})` : ""}` || ""}
      />
    </div>
  );
}

function DateField({ fieldData, field }: { fieldData: CharacterCharacterFieldType | null; field: CharacterFieldType }) {
  const startMonthIdx =
    field?.calendar && field.calendar.months.length
      ? field.calendar.months.findIndex((m) => m.id === fieldData?.calendar?.start_month_id)
      : null;
  const endMonthIdx =
    field?.calendar && field.calendar.months.length
      ? field.calendar.months.findIndex((m) => m.id === fieldData?.calendar?.end_month_id)
      : null;

  const startStringDate = formatDateToString(
    fieldData?.calendar?.start_day,
    fieldData?.calendar?.start_year,
    fieldData?.calendar?.start_month_id,
    field?.calendar?.months,
  );
  const endStringDate = formatDateToString(
    fieldData?.calendar?.end_day,
    fieldData?.calendar?.end_year,
    fieldData?.calendar?.end_month_id,
    field?.calendar?.months,
  );

  return (
    <div className="flex flex-col">
      <span className="block min-h-[20px] truncate text-sm">{field.title}</span>
      <Tooltip
        content={`${startStringDate}${endStringDate ? ` - ${endStringDate}` : ""}`}
        delay={{ openDelay: 500 }}
        isDisabled={!startStringDate.trim() && !endStringDate.trim()}>
        <span className="h-10 cursor-not-allowed truncate rounded-md border border-zinc-700 bg-zinc-900 p-2 text-white outline-none">
          <FormattedDate
            end_day={fieldData?.calendar?.end_day}
            end_month={typeof endMonthIdx === "number" ? field.calendar?.months[endMonthIdx]?.title || "" : ""}
            end_year={fieldData?.calendar?.end_year}
            start_day={fieldData?.calendar?.start_day}
            start_month={typeof startMonthIdx === "number" ? field.calendar?.months[startMonthIdx]?.title || "" : ""}
            start_year={fieldData?.calendar?.start_year}
          />
        </span>
      </Tooltip>
    </div>
  );
}

const fieldSizeClass = tv({
  base: "flex flex-col justify-center mt-1 p-0.5",
  variants: {
    type: {
      dice_roll: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      text: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      select: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      select_multiple: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      locations_single: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      locations_multiple: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      blueprints_single: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      blueprints_multiple: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      images_single: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      images_multiple: "col-span-6 sm:col-span-6 lg:col-span-6",
      number: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      random_table: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
      date: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      boolean: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
    },
  },
  compoundVariants: [
    {
      type: [
        "dice_roll",
        "text",
        "select",
        "select_multiple",
        "characters_single",
        "characters_multiple",
        "locations_single",
        "locations_multiple",
        "blueprints_single",
        "blueprints_multiple",
        "images_single",
        "number",
        "date",
        "boolean",
      ],
      isPreview: true,
      className: "col-span-6 sm:col-span-6 md:col-span-6 xl:col-span-6",
    },
  ],
});

function AdditionalFieldDisplay({
  isPreview,
  character_field,
  character_field_data,
}: {
  isPreview: boolean;
  character_field: CharacterFieldType;
  character_field_data: CharacterCharacterFieldType | null;
}) {
  const value = character_field_data?.value;
  const { project_id } = useParams();
  const fieldClasses = fieldSizeClass({ type: character_field.field_type || "text", isPreview });
  return (
    <div className={fieldClasses}>
      {character_field.field_type === "text" ||
      character_field.field_type === "number" ||
      character_field.field_type === "dice_roll" ? (
        <Input
          isReadOnly
          label={character_field.title}
          name={character_field.title}
          onChange={() => {}}
          value={(value as string | number | null) || ""}
        />
      ) : null}
      {character_field.field_type === "select" || character_field.field_type === "select_multiple" ? (
        <Input
          isReadOnly
          label={character_field.title}
          name={character_field.title}
          onChange={() => {}}
          value={character_field?.options?.find((opt) => opt.id === character_field_data?.value)?.value || ""}
        />
      ) : null}
      {character_field.field_type === "textarea" ? (
        <>
          <span className="text-sm text-zinc-300">{character_field.title}</span>
          <div className="rounded-md border border-zinc-700 bg-zinc-900">
            <StaticRender content={(value || undefined) as any} />
          </div>
        </>
      ) : null}
      {character_field.field_type === "date" ? <DateField field={character_field} fieldData={character_field_data} /> : null}

      {character_field.field_type === "blueprints_single" || character_field.field_type === "blueprints_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.blueprint_instances || []).map((blueprint_instance) => ({
              id: blueprint_instance.blueprint_instance.id,
              parent_id: blueprint_instance.blueprint_instance.parent_id,
              title: blueprint_instance.blueprint_instance.title || "",
              icon: blueprint_instance.blueprint_instance.icon || IconEnum.document,
              type: "blueprint_instances",
              link: `/projects/${project_id}/blueprints/${blueprint_instance.blueprint_instance.parent_id}/${blueprint_instance.related_id}`,
            }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "documents_single" || character_field.field_type === "documents_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.documents || []).map((doc) => ({
              id: doc.related_id,
              title: doc.document.title,
              icon: doc.document.icon || IconEnum.document,
              type: "documents",
              link: `/projects/${project_id}/documents/${doc.related_id}`,
            }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "locations_single" || character_field.field_type === "locations_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.map_pins || []).map((map_pin) => ({
              id: map_pin.map_pin.id,
              parent_id: map_pin.map_pin.parent_id,
              title: map_pin.map_pin.title || "",
              icon: map_pin.map_pin.icon || IconEnum.document,
              type: "map_pins",
              link: `/projects/${project_id}/maps/${map_pin.map_pin.parent_id}/${map_pin.related_id}`,
            }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "events_single" || character_field.field_type === "events_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.events || []).map((event) => ({
              id: event.event.id,
              parent_id: event.event.parent_id,
              title: event.event.title || "",
              icon: IconEnum.event,
              type: "events",
              link: `/projects/${project_id}/calendars/${event.event.parent_id}/${event.related_id}`,
            }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "images_single" && character_field_data?.images?.[0] ? (
        <div className="w-full">
          <EntityPreview
            id={character_field_data.images[0].related_id as string}
            image_id={character_field_data?.images?.[0].image.id}
            label={character_field.title}
            title={character_field_data?.images?.[0].image.title}
            type="images"
            variant="primary"
          />
        </div>
      ) : null}
      {character_field.field_type === "images_multiple" && character_field_data?.images?.length ? (
        <Gallery
          columns={6}
          images={character_field_data.images.map((img) => ({
            id: img.image.id,
            title: img.image.title,
            project_id: project_id as string,
            type: "images",
          }))}
          isOpenable
          type="images"
        />
      ) : null}
      {character_field.field_type === "random_table" ? (
        <RandomTableField
          random_table_id={character_field_data?.random_table.related_id}
          random_table_option_id={character_field_data?.random_table.option_id as string | undefined}
          suboptionValue={character_field_data?.random_table.suboption_id}
          title={character_field.title}
        />
      ) : null}
    </div>
  );
}

export function CharacterProfileView({ id, isPreview, isPublic }: { id?: string; isPreview?: boolean; isPublic?: boolean }) {
  const { project_id, item_id, type, subitem_id } = useParams();
  const navigate = useNavigate();
  const { isLg } = useBreakpoint();
  const [selectedTab, setSelectedTab] = useState(getCharacterProfileTabFromType(type));
  const [assetView, setAssetView] = useState<"table" | "card">("table");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const user = useAtomValue(userAtom);

  const {
    data: existingCharacter,
    isLoading,
    isFetching,
  } = useGetEntity<CharacterType>(
    id || item_id,
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
      fields: ["id", "full_name", "portrait_id", "age"],
    },
    {
      staleTime: 60 * 1000,
      isPublic,
    },
  );
  const { mutateAsync: downloadImage } = useDownloadImage(project_id, "images");
  const { mutateAsync: removeItem } = useRemoveFromEntity("characters", item_id as string, project_id as string);
  const { mutateAsync: generateDocument } = useGenerateDocument("conversations");
  const { mutateAsync: updateResource } = useUpdateEntityResource(item_id as string, "characters");

  const relationships = [
    ...(existingCharacter?.data?.related_to || []),
    ...(existingCharacter?.data?.related_from || []),
    ...(existingCharacter?.data?.related_other || []),
  ].filter((r) => !!r);

  useChangeNavbarTitle(`Characters | ${existingCharacter?.data?.full_name}`, !!existingCharacter?.data);

  const [, dispatch] = useTable({});

  const { data: existingTemplates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id },
      fields: ["id", "title"],
      relations: { character_fields: true },
      relationFilters: {
        or: (existingCharacter?.data?.tags || [])?.map((t) => ({
          id: "tags",
          header_name: "Tags",
          operator: "in",
          value: t.id,
          relationalData: { blueprint_field_id: "tags" },
          field: "tags",
        })),
      },
    },
    "character_fields_templates",
    { enabled: selectedTab === 2 && !!existingCharacter?.data?.tags?.length, staleTime: 5 * 60 * 1000 },
  );
  const { data: existingConversations, isFetching: isLoadingConversations } = useGetEntities<ConversationType>(
    {
      data: {
        character_id: existingCharacter?.data?.id,
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
        title: `Family tree of ${existingCharacter?.data.full_name || ""}`,
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
        size: "md",
        data: { tags: existingCharacter?.data?.tags || [], entity: { type: "characters", id: existingCharacter?.data?.id } },
      }));
    }
  }
  function openConversationDrawer() {
    if (existingCharacter?.data?.full_name)
      setDrawer({
        type: "conversations",
        title: "Start new conversation",
        data: {
          character: {
            id: existingCharacter?.data.id,
            full_name: existingCharacter?.data?.full_name,
            portrait_id: existingCharacter?.data?.portrait_id,
          },
        },
        size: "lg",
      });
  }
  const columns = useMemo(() => relationshipTableColumns(project_id as string, navigate, setDrawer, isPreview), []);

  useEffect(() => {
    setSelectedTab(getCharacterProfileTabFromType(type));
  }, [type]);

  // const relationTypeArray = Object.values(
  //   relationships.reduce((acc, obj) => {
  //     const { relation_type_title } = obj;
  //     if (!acc[relation_type_title]) {
  //       acc[relation_type_title] = {
  //         relation_type_title,
  //         items: [],
  //       };
  //     }
  //     acc[relation_type_title].items.push(obj);
  //     return acc;
  //   }, {}),
  // );

  // console.log(relationTypeArray);

  return (
    <div
      className={`flex flex-col gap-y-2 overflow-y-auto ${
        isPreview
          ? "max-h-[calc(100vh-20rem)] min-h-[calc(100vh-20rem)] lg:max-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-10rem)]"
          : "max-h-[calc(100vh-10rem)] min-h-[calc(100vh-10rem)] lg:max-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-6rem)]"
      }`}>
      {isPreview ? null : (
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
                    data: { id: id || (item_id as string), project_id: project_id as string },
                  }));
                }}
              />
            </div>
          ) : null}
        </div>
      )}
      <div className="w-full content-start gap-4 overflow-auto pt-0 lg:grid lg:flex-1 lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div className="flex max-h-full flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
            <Avatar
              hasShowImage
              image={
                existingCharacter?.data?.portrait_id
                  ? getImageURL(project_id as string, "images", existingCharacter?.data?.portrait_id)
                  : undefined
              }
              initials={getFirstLetters(existingCharacter?.data?.full_name || "")}
              isTooltipDisabled
              size="4xl"
            />

            <div className="mt-2 flex flex-col gap-y-1">
              <h2 className="text-center font-merriweather text-lg">{`${existingCharacter?.data?.full_name}`.trimEnd()}</h2>
              {existingCharacter?.data?.nickname ? (
                <h3 className="text-center font-lato">{existingCharacter?.data?.nickname || ""}</h3>
              ) : null}
            </div>

            <div className="w-full">
              <Tabs
                isVertical
                onChange={(tab, index) => {
                  if (!isPreview) {
                    navigate(`/projects/${project_id}/characters/${item_id}/${tab.label.toLowerCase()}`);
                  }
                  setSelectedTab(index);
                }}
                selectedTab={selectedTab}
                tabs={isPublic ? tabs.slice(0, 3) : tabs.map((t) => (isPreview ? omit(t, ["icon"]) : t))}
              />
            </div>
          </div>
        ) : null}
        {!isLoading && !isLg ? (
          <div className="mb-2 w-full">
            <Tabs
              onChange={(tab, index) => {
                if (!isPreview) {
                  navigate(`/projects/${project_id}/characters/${item_id}/${tab.label.toLowerCase()}`);
                }
                setSelectedTab(index);
              }}
              selectedTab={selectedTab}
              tabs={isPublic ? tabs.slice(0, 3) : tabs}
            />
          </div>
        ) : null}
        <div className="flex max-h-full flex-col overflow-auto rounded-lg bg-zinc-950 p-4 lg:col-span-4">
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
              {tabs[selectedTab].label} {subitem_id && tabs[selectedTab].label === "conversations" ? "-" : ""}
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
          {(isPreview ? selectedTab === 0 : type === "resources") ? (
            <div className="flex h-[calc(100%-3rem)] max-h-[calc(100%-3rem)] flex-col gap-y-2 overflow-auto">
              <Collapsible
                actions={
                  isPublic
                    ? []
                    : [
                        {
                          icon: IconEnum.add,
                          tooltip: "Add document",
                          onClick: openAddDocumentDrawer,
                        },
                      ]
                }
                icon={IconEnum.document}
                initialOpen={false}
                label="Documents">
                {existingCharacter?.data?.documents?.length ? (
                  <div className="mt-2 animate-in fade-in fill-mode-both">
                    <Table
                      columns={documentsTableColumns(removeItem, updateResource, setDrawer, project_id as string)}
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
                actions={
                  isPublic
                    ? []
                    : [
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
                      ]
                }
                icon={IconEnum.image}
                initialOpen={false}
                label="Assets">
                {existingCharacter?.data?.images?.length ? (
                  <div className="mt-2 animate-in fade-in fill-mode-both">
                    {assetView === "table" ? (
                      <Table
                        columns={assetTableColumns(downloadImage, project_id, removeItem, user?.webhooks || [])}
                        config={{
                          hasNoHeaderGap: true,
                        }}
                        data={existingCharacter?.data?.images || []}
                        dispatch={dispatch}
                        type="images"
                      />
                    ) : (
                      <Gallery columns={4} images={existingCharacter?.data?.images} isOpenable size="2xl" type="images" />
                    )}
                  </div>
                ) : (
                  <div className="mt-2 w-full">
                    <Alert label="There is no content." variant="info" />
                  </div>
                )}
              </Collapsible>

              <Collapsible
                actions={
                  isPublic
                    ? []
                    : [
                        {
                          icon: IconEnum.edit,
                          tooltip: "Edit tags",
                          onClick: openEditTagDrawer,
                        },
                      ]
                }
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
          {(isPreview ? selectedTab === 1 : type === "relationships") ? (
            <div className="h-full">
              {isFetching ? (
                <div className="pt-10">
                  <Skeleton limit={5} type="table" />
                </div>
              ) : (
                <div className="h-fit w-full">
                  <Table
                    columns={columns}
                    config={{
                      getLink: (rowData: any) => `/projects/${project_id}/characters/${rowData.id}/relationships`,
                    }}
                    data={relationships.toSorted(sortCharactersByName)}
                    dispatch={dispatch}
                    type="characters"
                  />
                </div>
              )}
            </div>
          ) : null}
          {(isPreview ? selectedTab === 2 : type === "additional fields") ? (
            <ul className="flex flex-col gap-y-2 overflow-y-auto animate-in fade-in fill-mode-both">
              {isFetchingTemplates ? <Skeleton type="character_profile_main" /> : null}
              {(existingTemplates?.data || []).map((t) => {
                return (
                  <Collapsible key={t.id} label={t.title}>
                    <div className="grid h-full grid-cols-6 flex-col content-start gap-y-2">
                      {t.character_fields.map((template_field) => {
                        const characterField = existingCharacter?.data?.character_fields?.find(
                          (f) => f.id === template_field.id,
                        );
                        return (
                          <AdditionalFieldDisplay
                            key={template_field.id}
                            character_field={template_field}
                            character_field_data={characterField ?? null}
                            isPreview={!!id}
                          />
                        );
                      })}
                    </div>
                  </Collapsible>
                );
              })}

              {!isFetchingTemplates && !existingTemplates?.data?.length ? (
                <Alert label="There are no templates available." variant="info" />
              ) : null}
            </ul>
          ) : null}
          {(isPreview ? selectedTab === 3 : type === "conversations") ? (
            <div className="flex-1">
              {subitem_id && !isPreview ? null : (
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
                      onRowClick: isPreview
                        ? undefined
                        : (rowData: ConversationType) => {
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
                {subitem_id && !isPreview ? <ConversationView id={subitem_id} /> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
