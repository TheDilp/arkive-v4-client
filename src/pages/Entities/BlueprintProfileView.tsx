import { useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isRemirrorJSON } from "remirror";
import { tv } from "tailwind-variants";

import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  CarouselEntityPreview,
  Collapsible,
  EntityPreview,
  FormattedDate,
  Gallery,
  Input,
  Skeleton,
  StaticRender,
  Tabs,
  Tooltip,
} from "../../components";
import { useBreakpoint, useChangeNavbarTitle, useGetEntity, useGetSubEntity } from "../../hooks";
import {
  BlueprintFieldType,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  BlueprintType,
  RandomTableOptionType,
} from "../../types";
import { breadcrumbsAtom, drawerAtom, formatDateToString, IconEnum } from "../../utils";

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
      dice_roll: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      text: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      select: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      select_multiple: "col-span-6 sm:col-span-3 md:col-span-2 xl:col-span-1",
      characters_single: "col-span-6 sm:col-span-3  md:col-span-2 xl:col-span-1",
      characters_multiple: "col-span-6 sm:col-span-6 md:col-span-6 xl:col-span-6",
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
  blueprint_field,
  blueprint_field_data,
}: {
  isPreview: boolean;
  blueprint_field: BlueprintFieldType;
  blueprint_field_data: BlueprintInstanceBlueprintFieldType;
}) {
  const value = blueprint_field_data?.value;
  const { project_id } = useParams();
  const fieldClasses = fieldSizeClass({ type: blueprint_field.field_type || "text", isPreview });
  const setDrawer = useSetAtom(drawerAtom);
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
      {blueprint_field.field_type === "textarea" && isRemirrorJSON(value) ? (
        <>
          <span className="text-sm text-zinc-300">{blueprint_field.title}</span>
          <div className="rounded-md border border-zinc-700 bg-zinc-900">
            <StaticRender content={(value || {}) as any} />
          </div>
        </>
      ) : null}
      {blueprint_field.field_type === "date" ? <DateField field={blueprint_field} fieldData={blueprint_field_data} /> : null}
      {blueprint_field.field_type === "characters_single" ? (
        <div className="w-full">
          <EntityPreview
            id={blueprint_field_data.characters?.[0]?.character.id}
            image_id={blueprint_field_data.characters?.[0]?.character?.portrait_id}
            label={blueprint_field.title}
            previewAction={
              blueprint_field_data.characters?.[0]?.character
                ? (id, parent_id) => {
                    setDrawer((prev) => ({
                      ...prev,
                      title: "Preview",
                      data: { id, parent_id, entity_type: "characters" },
                      type: "entity_preview",
                      size: "half",
                    }));
                  }
                : undefined
            }
            title={blueprint_field_data.characters?.[0]?.character?.full_name || ""}
            type="characters"
            variant="primary"
          />
        </div>
      ) : null}
      {blueprint_field.field_type === "characters_multiple" ? (
        <div className="grid w-full grid-cols-6 gap-1 truncate">
          <CarouselEntityPreview
            field_label={blueprint_field.title}
            items={(blueprint_field_data.characters || []).map((char) => ({
              id: char.related_id,
              title: char.character.full_name || "",
              image_id: char.character.portrait_id,
              type: "characters",
              link: `/projects/${project_id}/characters/${char.related_id}/resources`,
            }))}
          />
        </div>
      ) : null}
      {blueprint_field.field_type === "blueprints_single" || blueprint_field.field_type === "blueprints_multiple" ? (
        <div className="w-full">
          <CarouselEntityPreview
            field_label={blueprint_field.title}
            items={(blueprint_field_data.blueprint_instances || []).map((blueprint_instance) => ({
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
            variant="primary"
          />
        </div>
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
          type="images"
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
    </div>
  );
}

export default function BlueprintProfileView({ id, parent_id }: { id?: string; parent_id?: string }) {
  const { project_id, item_id, subitem_id } = useParams();
  const { isMd, isLg } = useBreakpoint();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const setDrawer = useSetAtom(drawerAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);

  const { data: blueprint } = useGetEntity<BlueprintType>(
    parent_id || item_id,
    "blueprints",
    {
      data: {
        id: parent_id || item_id,
      },
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
    },
    { staleTime: 3 * 60 * 1000 },
  );

  const { data: blueprintInstance, isLoading } = useGetSubEntity<BlueprintInstanceType>(
    id || subitem_id,
    "blueprint_instances",
    {
      data: { id: id || subitem_id },
      relations: {
        blueprint_fields: true,
        tags: true,
      },
    },
    { enabled: !!blueprint?.data, staleTime: 3 * 60 * 1000 },
  );

  function openEditTagDrawer() {
    if (blueprintInstance?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "edit_tags",
        title: "Edit tags",
        data: {
          tags: blueprintInstance?.data?.tags || [],
          entity: { type: "blueprint_instances", id: blueprintInstance?.data?.id },
        },
      }));
    }
  }

  useLayoutEffect(() => {
    if (blueprint?.data) {
      setBreadcrumbs({
        items: [{ id: blueprint.data.id, title: blueprint.data.title, is_folder: false, parent_id: null }],
        type: "blueprints",
      });
    }
  }, [blueprint?.data]);

  useChangeNavbarTitle(
    `Blueprints | ${blueprint?.data?.title} | ${blueprintInstance?.data?.title}`,
    !!blueprint?.data && !!blueprintInstance?.data,
  );

  return (
    <div className="flex h-full min-h-full flex-col gap-y-2">
      {item_id ? (
        <div className="flex h-12 min-h-[3rem] items-center justify-between">
          <Breadcrumbs />
          <div className="flex flex-nowrap gap-x-2">
            <div className="max-w-[208px] lg:w-52">
              <Button
                icon={IconEnum.edit}
                label="Edit current blueprint"
                onClick={() => {
                  setDrawer((prev) => ({
                    ...prev,
                    size: "lg",
                    title: "Edit blueprint",
                    type: "blueprints",
                    data: { id: parent_id || (item_id as string), project_id: project_id as string },
                  }));
                }}
                tooltip={isMd ? undefined : "Edit current blueprint"}
              />
            </div>
            <div className="lg:w-52">
              <Button
                icon={IconEnum.edit}
                label="Edit current blueprint instance"
                onClick={() => {
                  setDrawer((prev) => ({
                    ...prev,
                    size: "lg",
                    title: "Edit blueprint instance",
                    type: "blueprint_instances",
                    data: { id: id || (subitem_id as string), project_id: project_id as string },
                  }));
                }}
                tooltip={isMd ? undefined : "Edit current blueprint instance"}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div className="max-h-[calc(100vh-40%)] w-full flex-1 content-start gap-4 pt-0 lg:grid lg:max-h-[calc(100vh-25%)] lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div
            className={`${id ? "" : "p-4"} flex max-h-full flex-col items-center gap-y-2 rounded-lg bg-zinc-800 lg:col-span-1`}>
            <div className="mt-2 flex flex-col gap-y-1">
              <h2 className="text-center font-merriweather text-lg">{`${blueprintInstance?.data?.title || ""}`.trimEnd()}</h2>
            </div>
            <div className="w-full">
              <Tabs
                isVertical
                onChange={(tab, index) => {
                  navigate(
                    `/projects/${project_id}/blueprints/${parent_id || item_id}/${id || subitem_id}/${tab.label.toLowerCase()}`,
                  );
                  setSelectedTab(index);
                }}
                selectedTab={selectedTab}
                tabs={tabs}
              />
            </div>
          </div>
        ) : null}
        {!isLoading && !isLg ? (
          <div className="mb-2 w-full">
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
        <div className="flex max-h-full flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4">
          <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
            <span className="flex">{tabs[selectedTab].label}</span>
          </h2>
          <div className="flex flex-col gap-y-2">
            <Collapsible icon={IconEnum.additional_fields} initialOpen label="Fields">
              <div className="grid h-full max-h-[calc(100%-3rem)] grid-cols-6 flex-col content-start gap-y-2 overflow-auto">
                {blueprintInstance?.data
                  ? blueprintInstance?.data?.blueprint_fields
                      ?.toSorted((a, b) => a.sort - b.sort)
                      .map((blueprint_field) => {
                        const blueprintField = blueprint?.data?.blueprint_fields?.find(
                          (field) => field.id === blueprint_field.id,
                        );
                        if (!blueprintField) return null;
                        return (
                          <AdditionalFieldDisplay
                            key={blueprint_field.id}
                            blueprint_field={blueprintField}
                            blueprint_field_data={blueprint_field}
                            isPreview={!!id}
                          />
                        );
                      })
                  : null}
              </div>
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
              {blueprintInstance?.data?.tags?.length ? (
                <div className="mt-2 flex w-full flex-wrap gap-2 animate-in fade-in fill-mode-both">
                  {blueprintInstance.data.tags.map((tag) => (
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
        </div>
      </div>
    </div>
  );
}
