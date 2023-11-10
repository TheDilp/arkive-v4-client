import { useSetAtom } from "jotai";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import {
  Button,
  CarouselEntityPreview,
  Editor,
  EntityPreview,
  FormattedDate,
  Gallery,
  Input,
  Skeleton,
  Tabs,
  Tooltip,
} from "../../components";
import { useBreakpoint, useChangeNavbarTitle, useGetEntities, useGetEntity, useGetSubEntity } from "../../hooks";
import {
  BlueprintFieldType,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  BlueprintType,
  RandomTableOptionType,
} from "../../types";
import { drawerAtom, formatDateToString, getCharacterFullName, IconEnum } from "../../utils";

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  //   { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  //   { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  //   { id: "4", label: "Conversations", icon: IconEnum.conversation },
];

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
function BlueprintField({ field, value }: { field: BlueprintFieldType; value: string | string[] }) {
  const { data: instances, isLoading } = useGetEntities<BlueprintInstanceType>(
    {
      data: {},
      fields: ["id", "title"],
      filters: {
        and: [
          {
            field: "id",
            operator: Array.isArray(value) ? "in" : "eq",
            value: Array.isArray(value) ? value : value,
          },
        ],
      },
    },
    "blueprint_instances",
    {},
  );

  return (
    <div>
      <Input
        isDisabled={isLoading}
        isLoading={isLoading}
        isReadOnly
        label={field.title}
        name={field.title}
        onChange={() => {}}
        value={instances?.data?.map((instance) => instance.title).join(",") || ""}
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
      dice_roll: "col-span-6 sm:col-span-3 lg:col-span-1",
      text: "col-span-6 sm:col-span-3 lg:col-span-1",
      image: "col-span-6 sm:col-span-3 lg:col-span-1",
      select: "col-span-6 sm:col-span-3 lg:col-span-1",
      select_multiple: "col-span-6 sm:col-span-3 lg:col-span-1",
      characters_single: "col-span-6 sm:col-span-3  mg:col-span-2 xl:col-span-1",
      characters_multiple: "col-span-6 sm:col-span-3  mg:col-span-2 xl:col-span-1",
      locations_single: "col-span-6 sm:col-span-3  mg:col-span-2 xl:col-span-1",
      locations_multiple: "col-span-6 sm:col-span-3 mg:col-span-2 xl:col-span-1",
      blueprints_single: "col-span-6 sm:col-span-3  mg:col-span-2 xl:col-span-1",
      blueprints_multiple: "col-span-6 sm:col-span-3  mg:col-span-2 xl:col-span-1",
      images_single: "col-span-6 sm:col-span-3 lg:col-span-1",
      images_multiple: "col-span-6 sm:col-span-6 lg:col-span-6",
      number: "col-span-6 sm:col-span-3 lg:col-span-1",
      random_table: "col-span-6 sm:col-span-3 lg:col-span-1",
      textarea: "col-span-6 bg-transparent rounded-none shadow-none",
      date: "col-span-6 sm:col-span-3 lg:col-span-1",
      boolean: "col-span-6 sm:col-span-3 lg:col-span-1",
    },
  },
});

function AdditionalFieldDisplay({
  blueprint_field,
  blueprint_field_data,
}: {
  blueprint_field: BlueprintFieldType;
  blueprint_field_data: BlueprintInstanceBlueprintFieldType;
}) {
  const value = blueprint_field_data?.value;
  const { project_id } = useParams();
  const fieldClasses = fieldSizeClass({ type: blueprint_field.field_type || "text" });

  return (
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
      {blueprint_field.field_type === "select" || blueprint_field.field_type === "select_multiple" ? (
        <Input
          isReadOnly
          label={blueprint_field.title}
          name={blueprint_field.title}
          onChange={() => {}}
          value={blueprint_field?.options?.find((opt) => opt.id === blueprint_field_data.id)?.value || ""}
        />
      ) : null}
      {blueprint_field.field_type === "textarea" ? (
        <>
          <span className="text-sm text-zinc-300">{blueprint_field.title}</span>
          <Editor initialContent={(value || {}) as any} isReadOnly name={blueprint_field.title} onChange={() => {}} />
        </>
      ) : null}

      {blueprint_field.field_type === "date" ? <DateField field={blueprint_field} fieldData={blueprint_field_data} /> : null}

      {blueprint_field.field_type === "characters_single" || blueprint_field.field_type === "characters_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={blueprint_field.title}
            items={(blueprint_field_data.characters || []).map((char) => ({
              id: char.related_id,
              title: getCharacterFullName(char.character.first_name, undefined, char.character?.last_name),
              image_id: char.character.portrait_id,
              type: "characters",
              link: `/projects/${project_id}/characters/${char.related_id}/resources`,
            }))}
          />
        </div>
      ) : null}
      {blueprint_field.field_type === "documents_single" || blueprint_field.field_type === "documents_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={blueprint_field.title}
            items={(blueprint_field_data.documents || []).map((doc) => ({
              id: doc.related_id,
              title: doc.document.title,
              icon: doc.document.icon || IconEnum.document,
              type: "documents",
              link: `/projects/${project_id}/documents/${doc.related_id}`,
            }))}
          />
        </div>
      ) : null}
      {blueprint_field.field_type === "locations_single" || blueprint_field.field_type === "locations_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={blueprint_field.title}
            items={(blueprint_field_data.map_pins || []).map((map_pin) => ({
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
      {blueprint_field.field_type === "images_single" && blueprint_field_data?.images?.[0] ? (
        <div className="w-full">
          <EntityPreview
            id={blueprint_field_data.images[0].related_id as string}
            image_id={blueprint_field_data?.images?.[0].image.id}
            label={blueprint_field.title}
            title={blueprint_field_data?.images?.[0].image.title}
            type="images"
          />
        </div>
      ) : null}
      {blueprint_field.field_type === "blueprints_single" || blueprint_field.field_type === "blueprints_multiple" ? (
        <BlueprintField field={blueprint_field} value={(value as string | string[] | null) || ""} />
      ) : null}
      {blueprint_field.field_type === "images_multiple" && blueprint_field_data?.images?.length ? (
        <Gallery
          columns={6}
          images={blueprint_field_data.images.map((img) => ({
            id: img.image.id,
            title: img.image.title,
            project_id: project_id as string,
            type: "images",
          }))}
          isOpenable
        />
      ) : null}
      {blueprint_field.field_type === "random_table" ? (
        <RandomTableField
          random_table_id={blueprint_field_data.random_table.related_id}
          random_table_option_id={blueprint_field_data.random_table.option_id as string | undefined}
          suboptionValue={blueprint_field_data.random_table.suboption_id}
          title={blueprint_field.title}
        />
      ) : null}

      {/* {blueprint_field.field_type === "date" && value ? (
        <div>
          <Input
            isReadOnly
            label={blueprint_field.title}
            name={blueprint_field.title}
            onChange={() => {}}
            value={formatDateToString(date?.day, date?.year, date?.month, blueprint_field_data?.calendar?.months || [])}
          />
        </div>
      ) : null} */}
    </div>
  );
}

export default function BlueprintProfileView() {
  const { project_id, item_id, subitem_id } = useParams();
  const { isLg } = useBreakpoint();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const setDrawer = useSetAtom(drawerAtom);

  const { data: blueprint, isFetching: isFetchingBlueprint } = useGetEntity<BlueprintType>(
    item_id,
    "blueprints",
    {
      data: {
        id: item_id,
      },
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
    },
    { staleTime: 3 * 60 * 1000 },
  );

  const {
    data: blueprintInstance,
    isLoading,
    isFetching,
  } = useGetSubEntity<BlueprintInstanceType>(
    subitem_id,
    "blueprint_instances",
    {
      data: { id: subitem_id },
      relations: {
        blueprint_fields: true,
      },
    },
    { enabled: !!blueprint?.data, staleTime: 3 * 60 * 1000 },
  );

  useChangeNavbarTitle(
    `Blueprints | ${blueprint?.data?.title} | ${blueprintInstance?.data?.title}`,
    !!blueprint?.data && !!blueprintInstance?.data,
  );

  return (
    <div className="flex h-full min-h-full flex-col gap-y-2">
      {item_id ? (
        <div className="flex w-full flex-col items-end gap-y-2">
          <div className="w-52 max-w-[208px]">
            <Button
              icon={IconEnum.edit}
              label="Edit current blueprint"
              onClick={() => {
                setDrawer((prev) => ({
                  ...prev,
                  size: "lg",
                  title: "Edit blueprint",
                  type: "blueprints",
                  data: { id: item_id as string, project_id: project_id as string },
                }));
              }}
            />
          </div>
          <div className="w-52">
            <Button
              icon={IconEnum.edit}
              label="Edit current blueprint instance"
              onClick={() => {
                setDrawer((prev) => ({
                  ...prev,
                  size: "lg",
                  title: "Edit blueprint instance",
                  type: "blueprint_instances",
                  data: { id: subitem_id as string, project_id: project_id as string },
                }));
              }}
            />
          </div>
        </div>
      ) : null}
      <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
            <div className="mt-2 flex flex-col gap-y-1">
              <h2 className="text-center font-merriweather text-lg">{`${blueprintInstance?.data?.title || ""}`.trimEnd()}</h2>
            </div>
            <div className="w-full">
              <Tabs
                isVertical
                onChange={(tab, index) => {
                  navigate(`/projects/${project_id}/blueprints/${item_id}/${subitem_id}/${tab.label.toLowerCase()}`);
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
        <div className="flex h-[calc(100vh-15rem)] max-h-[calc(100vh-15rem)] flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4 lg:h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-12rem)]">
          <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
            <span className="flex">{tabs[selectedTab].label}</span>
          </h2>
          {isLoading ? (
            <Skeleton type="character_profile_main" />
          ) : (
            <div className="grid h-full max-h-[calc(100%-3rem)] grid-cols-6 flex-col content-start gap-y-2 overflow-auto">
              {blueprintInstance?.data && !isFetching && !isFetchingBlueprint
                ? blueprintInstance?.data?.blueprint_fields.map((blueprint_field) => {
                    const blueprintField = blueprint?.data?.blueprint_fields?.find((field) => field.id === blueprint_field.id);
                    if (!blueprintField) return null;
                    return (
                      <AdditionalFieldDisplay
                        key={blueprint_field.id}
                        blueprint_field={blueprintField}
                        blueprint_field_data={blueprint_field}
                      />
                    );
                  })
                : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
