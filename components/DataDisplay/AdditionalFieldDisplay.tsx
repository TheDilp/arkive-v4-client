import { useParams } from "react-router-dom";

import { useGetSubEntity } from "../../hooks";
import { CharacterFieldType, FieldDataType, RandomTableOptionType } from "../../types";
import { FieldClasses, formatDateToString, getEntityLink, IconEnum } from "../../utils";
import { EntityPreview, FormattedDate, Gallery, GroupEntityPreview, Input, StaticRender, Tooltip } from "..";

function RandomTableField({
  random_table_id,
  random_table_option_id,
  title,
}: {
  random_table_id: string | undefined | null;
  random_table_option_id: string | undefined;
  title: string;
}) {
  const { data: option, isLoading } = useGetSubEntity<RandomTableOptionType>(random_table_option_id, "random_table_options", {
    data: { parent_id: random_table_id },
    fields: ["id", "title"],
    relations: {
      random_table_suboptions: true,
    },
  });

  return (
    <div>
      <Input
        isDisabled={isLoading}
        isLoading={isLoading}
        isReadOnly
        label={title}
        name={title}
        onChange={() => {}}
        value={option?.data?.title}
      />
    </div>
  );
}

function DateField({ fieldData, field }: { fieldData: FieldDataType | null; field: CharacterFieldType }) {
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
    field?.calendar?.months
  );
  const endStringDate = formatDateToString(
    fieldData?.calendar?.end_day,
    fieldData?.calendar?.end_year,
    fieldData?.calendar?.end_month_id,
    field?.calendar?.months
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

export function AdditionalFieldDisplay({
  isPreview,
  character_field,
  character_field_data,
}: {
  isPreview: boolean;
  character_field: CharacterFieldType;
  character_field_data: FieldDataType | null;
}) {
  const value = character_field_data?.value;
  const { project_id } = useParams();
  const fieldClasses = FieldClasses({ type: character_field.field_type || "text", isPreview });

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

      {character_field.field_type === "characters_single" || character_field.field_type === "characters_multiple" ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
          <GroupEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.characters || [])
              .filter((character) => !!character.character)
              .map((character) => ({
                id: character.character.id,
                parent_id: undefined,
                title: character.character.full_name || "",
                image_id: character?.character?.portrait_id,
                icon: IconEnum.character,
                type: "characters",
                link: getEntityLink(project_id as string, "characters", character.related_id, null),
              }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "blueprints_single" || character_field.field_type === "blueprints_multiple" ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
          <GroupEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.blueprint_instances || [])
              .filter((blueprint_instance) => !!blueprint_instance.blueprint_instance)
              .map((blueprint_instance) => ({
                id: blueprint_instance.blueprint_instance.id,
                parent_id: blueprint_instance.blueprint_instance.parent_id,
                title: blueprint_instance.blueprint_instance.title || "",
                icon: blueprint_instance.blueprint_instance.icon || IconEnum.document,
                type: "blueprint_instances",
                link: getEntityLink(
                  project_id as string,
                  "blueprint_instances",
                  blueprint_instance.related_id,
                  blueprint_instance.blueprint_instance.parent_id
                ),
              }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "documents_single" || character_field.field_type === "documents_multiple" ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
          <GroupEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.documents || [])
              .filter((doc) => !!doc.document)
              .map((doc) => ({
                id: doc.related_id,
                title: doc.document.title,
                icon: doc.document.icon || IconEnum.document,
                type: "documents" as const,
                link: getEntityLink(project_id as string, "documemnts", doc.related_id, undefined),
              }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "locations_single" || character_field.field_type === "locations_multiple" ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
          <GroupEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.map_pins || [])
              .filter((map_pin) => !!map_pin.map_pin)
              .map((map_pin) => ({
                id: map_pin.map_pin.id,
                parent_id: map_pin.map_pin.parent_id,
                title: map_pin.map_pin.title || "",
                icon: map_pin.map_pin.icon || IconEnum.document,
                type: "map_pins",
                link: getEntityLink(project_id as string, "map_pins", map_pin.related_id, map_pin.map_pin.parent_id),
              }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "events_single" || character_field.field_type === "events_multiple" ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
          <GroupEntityPreview
            field_label={character_field.title}
            items={(character_field_data?.events || [])
              .filter((event) => !!event.event)
              .map((event) => ({
                id: event.event.id,
                parent_id: event.event.parent_id,
                title: event.event.title || "",
                icon: IconEnum.event,
                type: "events",
                link: getEntityLink(project_id as string, "events", event.related_id, event.event.parent_id),
              }))}
          />
        </div>
      ) : null}
      {character_field.field_type === "images_single" && character_field_data?.images?.[0] ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
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
          title={character_field.title}
        />
      ) : null}
    </div>
  );
}
