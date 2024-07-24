import { useParams } from "react-router-dom";
import { isRemirrorJSON } from "remirror";

import { useGetSubEntity } from "../../hooks";
import { BlueprintFieldType, BlueprintInstanceBlueprintFieldType, RandomTableOptionType } from "../../types";
import { FieldClasses, formatDateToString, getEntityLink, IconEnum } from "../../utils";
import { StaticRender } from "../Complex";
import { Input } from "../Form";
import { Alert, FormattedDate } from "../Misc";
import { Tooltip } from "../Overlay";
import { Gallery } from "./Gallery";
import { GroupEntityPreview } from "./GroupEntityPreview";

const tooltipFields = ["text", "number", "select_multiple"];

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

function DateField({ fieldData, field }: { fieldData: BlueprintInstanceBlueprintFieldType; field: BlueprintFieldType }) {
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

export function AdditionalBlueprintFieldDisplay({
  isPreview,
  blueprint_field,
  blueprint_field_data,
}: {
  isPreview: boolean;
  blueprint_field: BlueprintFieldType;
  blueprint_field_data: BlueprintInstanceBlueprintFieldType;
}) {
  const value = blueprint_field_data?.value;
  const { project_id } = useParams();
  const fieldClasses = FieldClasses({ type: blueprint_field.field_type || "text", isPreview });
  const selectMultipleFormatted =
    blueprint_field.field_type === "select_multiple"
      ? blueprint_field?.options
          ?.filter((opt) => (value as string[]).includes(opt.id))
          .map((opt) => opt.value)
          ?.join(", ") || ""
      : "";
  return (
    <Tooltip
      allowedPlacements={["top", "bottom"]}
      content={(
        (blueprint_field_data.field_type === "select_multiple"
          ? selectMultipleFormatted
          : (blueprint_field_data.value as string)) || ""
      ).toString()}
      isDisabled={!tooltipFields.includes(blueprint_field.field_type)}
      variant="secondary">
      <div className={fieldClasses}>
        {blueprint_field.field_type === "text" ||
        blueprint_field.field_type === "number" ||
        blueprint_field.field_type === "dice_roll" ? (
          <Input
            isReadOnly
            label={blueprint_field.title}
            name={blueprint_field.title}
            onChange={() => {}}
            value={(value as string | number | null) || ""}
          />
        ) : null}
        {blueprint_field.field_type === "select" ? (
          <Input
            isReadOnly
            label={blueprint_field.title}
            name={blueprint_field.title}
            onChange={() => {}}
            value={blueprint_field?.options?.find((opt) => opt.id === value)?.value || ""}
          />
        ) : null}
        {blueprint_field.field_type === "select_multiple" ? (
          <Input
            isReadOnly
            label={blueprint_field.title}
            name={blueprint_field.title}
            onChange={() => {}}
            value={selectMultipleFormatted}
          />
        ) : null}
        {blueprint_field.field_type === "textarea" ? (
          <>
            <span className="mb-2 border-b border-zinc-700 text-sm text-zinc-300">{blueprint_field.title}</span>
            <div className="rounded-md bg-zinc-900">
              {isRemirrorJSON(value) ? <StaticRender content={(value || {}) as any} /> : <Alert label="There is no content." />}
            </div>
          </>
        ) : null}
        {blueprint_field.field_type === "date" ? <DateField field={blueprint_field} fieldData={blueprint_field_data} /> : null}

        {blueprint_field.field_type === "characters_single" || blueprint_field.field_type === "characters_multiple" ? (
          <div className="grid w-full grid-cols-6 gap-1 truncate">
            <GroupEntityPreview
              field_label={blueprint_field.title}
              items={(blueprint_field_data.characters || [])
                .filter((char) => !!char.character)
                .map((char) => ({
                  id: char.related_id,
                  title: char.character.full_name || "",
                  image_id: char.character.portrait_id,
                  type: "characters",
                  link: getEntityLink(project_id as string, "characters", char.related_id, undefined),
                }))}
            />
          </div>
        ) : null}
        {blueprint_field.field_type === "blueprints_single" || blueprint_field.field_type === "blueprints_multiple" ? (
          <div className="grid w-full grid-cols-6 gap-1 truncate">
            <GroupEntityPreview
              field_label={blueprint_field.title}
              items={(blueprint_field_data.blueprint_instances || [])
                .filter((bpi) => !!bpi.blueprint_instance)
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
        {blueprint_field.field_type === "documents_single" || blueprint_field.field_type === "documents_multiple" ? (
          <div className="grid w-full grid-cols-6 gap-1 truncate">
            <GroupEntityPreview
              field_label={blueprint_field.title}
              items={(blueprint_field_data.documents || [])
                .filter((d) => !!d.document)
                .map((doc) => ({
                  id: doc.related_id,
                  title: doc.document.title,
                  icon: doc.document.icon || IconEnum.document,
                  type: "documents",
                  link: getEntityLink(project_id as string, "documemnts", doc.related_id, undefined),
                }))}
            />
          </div>
        ) : null}
        {blueprint_field.field_type === "locations_single" || blueprint_field.field_type === "locations_multiple" ? (
          <div className="grid w-full grid-cols-6 gap-1 truncate">
            <GroupEntityPreview
              field_label={blueprint_field.title}
              items={(blueprint_field_data.map_pins || [])
                .filter((m) => !!m.map_pin)
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
        {blueprint_field.field_type === "images_single" ? (
          <div className="grid w-full grid-cols-6 gap-1 truncate">
            <GroupEntityPreview
              field_label={blueprint_field.title}
              items={
                blueprint_field_data?.images?.[0]
                  ? [
                      {
                        id: blueprint_field_data.images[0].related_id as string,
                        image_id: blueprint_field_data?.images?.[0].image.id,
                        title: blueprint_field_data?.images?.[0].image.title,
                        label: blueprint_field.title,
                        type: "images",
                      },
                    ]
                  : []
              }
            />
          </div>
        ) : null}
        {blueprint_field.field_type === "images_multiple" && blueprint_field_data?.images?.length ? (
          <Gallery
            columns={6}
            images={blueprint_field_data.images
              .filter((img) => !!img.image)
              .map((img) => ({
                id: img.image.id,
                title: img.image.title,
                project_id: project_id as string,
                type: "images",
              }))}
            isOpenable
            type="images"
          />
        ) : null}
        {blueprint_field.field_type === "random_table" ? (
          <RandomTableField
            random_table_id={blueprint_field_data?.random_table?.related_id}
            random_table_option_id={blueprint_field_data?.random_table?.option_id as string | undefined}
            suboptionValue={blueprint_field_data?.random_table?.suboption_id}
            title={blueprint_field.title}
          />
        ) : null}
      </div>
    </Tooltip>
  );
}

