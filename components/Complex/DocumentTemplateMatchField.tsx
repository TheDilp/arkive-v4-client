import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useGetEntity, useGetImages } from "../../hooks";
import {
  AvailableEntityType,
  AvailableSubEntityType,
  DocumentTemplateFieldType,
  DocumentType,
  HandleChangePropsType,
  SearchableEntities,
  SelectOptionType,
} from "../../types";
import { capitalizeFirstLetter, getParentEntityType, getSingularEntityType, IconEnum } from "../../utils";
import { EntityPreview } from "../DataDisplay";
import { Checkbox, Input, Search, Select } from "../Form";

const MatchReplacementOptions: SelectOptionType[] = [
  {
    label: "Characters",
    value: "characters",
    icon: IconEnum.character,
  },
  {
    label: "Blueprints",
    value: "blueprint_instances",
    icon: IconEnum.blueprint,
  },
  {
    label: "Documents",
    value: "documents",
    icon: IconEnum.document,
  },
  {
    label: "Maps",
    value: "maps",
    icon: IconEnum.map,
  },
  {
    label: "Map pins",
    value: "map_pins",
    icon: IconEnum.map_pin,
  },
  {
    label: "Graph",
    value: "graphs",
    icon: IconEnum.graph,
  },
  {
    label: "Events",
    value: "events",
    icon: IconEnum.event,
  },
  {
    label: "Words",
    value: "words",
    icon: IconEnum.word,
  },
  { label: "Images", value: "images", icon: IconEnum.image },
  {
    label: "Random tables",
    value: "random_tables",
    icon: IconEnum.random_table,
  },
  {
    label: "Dice roll",
    value: "dice_roll",
    icon: IconEnum.d20,
  },
  { label: "Derived field", value: "derived", icon: IconEnum.derived },
  {
    label: "Custom",
    value: "custom",
    icon: IconEnum.additional_fields,
  },
];
const RandomCountOptions: SelectOptionType[] = [
  {
    label: "Single",
    value: "single",
  },
  { label: "Max 2", value: "max_2" },
  { label: "Max 3", value: "max_3" },
  { label: "Max 4", value: "max_4" },
  { label: "Max 5", value: "max_5" },
  { label: "Max 6", value: "max_6" },
  { label: "Max 7", value: "max_7" },
  { label: "Max 8", value: "max_8" },
  { label: "Max 9", value: "max_9" },
  { label: "Max 10", value: "max_10" },
  { label: "Max 11", value: "max_11" },
  { label: "Max 12", value: "max_12" },
  { label: "Max 13", value: "max_13" },
  { label: "Max 14", value: "max_14" },
  { label: "Max 15", value: "max_15" },
  { label: "Max 16", value: "max_16" },
  { label: "Max 17", value: "max_17" },
  { label: "Max 18", value: "max_18" },
  { label: "Max 19", value: "max_19" },
  { label: "Max 20", value: "max_20" },
];
const DeriveFromFormulas: { label: string; value: string }[] = [
  { label: "D&D 5e ability bonus", value: "dnd_5e_ability_bonus" as const },
];
const EntitiesWithRelated = [
  "characters",
  "blueprint_instances",
  "documents",
  "maps",
  "map_pins",
  "graphs",
  "events",
  "words",
  "random_tables",
  "images",
];
const EntitiesWithParents = ["blueprint_instances", "map_pins", "events", "words"];

type EntitiesWithRelatedType =
  | "characters"
  | "documents"
  | "blueprint_instances"
  | "maps"
  | "map_pins"
  | "graphs"
  | "events"
  | "words"
  | "random_tables"
  | "images";

function getParentIdField(entity_type: DocumentTemplateFieldType["entity_type"]) {
  if (entity_type === "blueprint_instances") return "blueprint_id";
  if (entity_type === "map_pins") return "map_id";
  if (entity_type === "events") return "calendar_id";
  if (entity_type === "words") return "dictionary_id";
  return null;
}

function getMaxEntityCount(random_count: DocumentTemplateFieldType["random_count"]) {
  if (random_count === "single") return 1;
  if (random_count) {
    const count_string = random_count?.replace("max_", "");
    return Number(count_string);
  }
  return 0;
}

function EntityWithRelatedRow({
  isEditable,
  blueprint_id,
  map_id,
  calendar_id,
  dictionary_id,
  isRandomized,
  match,
  handleChange,
  related,
  entity_type,
  additional_data,
  idx,
  random_count,
}: {
  isEditable?: boolean;
  isRandomized?: boolean | null;
  match: DocumentTemplateFieldType["key"];
  handleChange: (props: HandleChangePropsType) => void;
  idx: number;
} & Pick<
  DocumentTemplateFieldType,
  "entity_type" | "blueprint_id" | "calendar_id" | "map_id" | "dictionary_id" | "related" | "additional_data" | "random_count"
>) {
  const { project_id } = useParams();
  const [selectedEntities, setSelectedEntities] = useState<
    {
      label: string;
      value: string;
      image: string | null;
      icon: string | null;
    }[]
  >([]);

  const { data: relatedEntities } = useGetEntities(
    {
      data: {},
      fields:
        entity_type === "characters"
          ? ["id as value", "full_name as label", "portrait_id as image"]
          : ["id as value", "title as label"],
      filters: { and: [{ field: "id", id: "name", header_name: "Full name", value: related, operator: "in" }] },
    },
    entity_type as
      | "characters"
      | "blueprint_instances"
      | "documents"
      | "maps"
      | "map_pins"
      | "events"
      | "words"
      | "random_tables",
    { enabled: !!related?.length && entity_type !== "images", queryKeyConcat: related }
  );

  const { data: images } = useGetImages(
    project_id as string,
    "images",
    {
      fields: ["id as value", "title as label"],
      filters: { and: [{ field: "id", id: "name", header_name: "Full name", value: related, operator: "in" }] },
    },
    { enabled: !!related.length && entity_type === "images" }
  );

  const { data: parent } = useGetEntity(
    (blueprint_id || map_id || calendar_id || dictionary_id) as string,
    getParentEntityType(entity_type as AvailableSubEntityType) as AvailableEntityType,
    {
      data: { id: blueprint_id || map_id || calendar_id || dictionary_id },
      fields: ["id", "title", "icon"],
    },
    { enabled: !!blueprint_id || !!map_id || !!calendar_id || !!dictionary_id }
  );
  useLayoutEffect(() => {
    if (relatedEntities?.data)
      setSelectedEntities(
        // @ts-expect-error ts can't correctly infer this
        (relatedEntities?.data || []) as {
          label: string;
          value: string;
          image: string | null;
          icon: string | null;
        }[]
      );
  }, [relatedEntities, related]);
  useLayoutEffect(() => {
    if (related.length) {
      if (images?.data)
        setSelectedEntities(
          // @ts-expect-error ts can't correctly infer this
          (images?.data || []) as {
            label: string;
            value: string;
            image: string | null;
            icon: string | null;
          }[]
        );
    } else {
      setSelectedEntities([]);
    }
  }, [images, related]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-nowrap gap-x-1">
        <div className="flex-1">
          <Input
            isDisabled={!isEditable}
            label="Key (must be unique)"
            name={`template_fields[${idx}].key`}
            onChange={handleChange}
            value={match}
            variant={match ? "primary" : "error"}
          />
        </div>
        <div className="w-1/4">
          <Select
            hasSearch
            label="Entity type"
            name={`template_fields[${idx}].entity_type`}
            onChange={(e) => {
              setSelectedEntities([]);
              const toChange = [
                e,
                { name: `template_fields[${idx}].value`, value: null },
                { name: `template_fields[${idx}].related`, value: [] },
              ];
              handleChange(toChange);
            }}
            options={MatchReplacementOptions}
            value={entity_type}
          />
        </div>
        {entity_type === "images" ? null : (
          <div className="flex w-16 items-center justify-between px-2">
            <Checkbox
              label="Random"
              name={`template_fields[${idx}].is_randomized`}
              onChange={(e) => {
                const toChange = [
                  e,
                  { name: `template_fields[${idx}].value`, value: null },
                  { name: `template_fields[${idx}].related`, value: [] },
                ];
                setSelectedEntities([]);
                handleChange(toChange);
              }}
              tooltip="Keys will be replaced when generating the document."
              value={!!isRandomized}
            />
          </div>
        )}
      </div>
      <div className={"flex flex-1 flex-col items-center gap-2"}>
        {EntitiesWithParents.includes(entity_type) ? (
          <>
            <div className="w-full">
              {parent ? (
                <div className="w-full">
                  <EntityPreview
                    clearAction={() => {
                      const parent_id = getParentIdField(entity_type as "blueprint_instances" | "map_pins" | "events");
                      if (parent_id) handleChange({ name: `template_fields[${idx}].${parent_id}`, value: null });
                    }}
                    icon={parent?.data?.icon}
                    id={parent?.data?.id}
                    label="Choose from"
                    title={parent?.data?.title}
                    type={
                      getParentEntityType(entity_type as "blueprint_instances" | "map_pins" | "events") as AvailableEntityType
                    }
                  />
                </div>
              ) : (
                <Search
                  label={capitalizeFirstLetter(
                    getSingularEntityType(
                      (getParentEntityType(
                        (entity_type || "blueprint_instances") as "blueprint_instances" | "map_pins" | "events"
                      ) as AvailableEntityType) || ""
                    )
                  )}
                  name="value"
                  onBrowserChange={(props) => {
                    const parent_id = getParentIdField(entity_type as "blueprint_instances" | "map_pins" | "events");

                    const itemsToChange: { name: string; value: string | Record<string, any> }[] = props.map(({ value }) => ({
                      name: `template_fields[${idx}].${parent_id}`,
                      value,
                    }));
                    handleChange(itemsToChange);
                  }}
                  onChange={({ value: newValue }) => {
                    const parent_id = getParentIdField(entity_type as "blueprint_instances" | "map_pins" | "events");
                    if (parent_id) handleChange({ name: `template_fields[${idx}].${parent_id}`, value: newValue });
                  }}
                  searchEntity={
                    getParentEntityType(entity_type as "blueprint_instances" | "map_pins" | "events") as SearchableEntities
                  }
                />
              )}
            </div>
            <div className="flex w-full flex-col gap-y-2">
              {isRandomized ? (
                <div className="flex-1">
                  <Select
                    hasSearch
                    label="Random count"
                    name={`template_fields[${idx}].random_count`}
                    onChange={handleChange}
                    options={RandomCountOptions}
                    value={random_count}
                  />
                </div>
              ) : null}
              {isRandomized ? null : (
                <div className="flex flex-1 flex-col gap-y-2">
                  <Search
                    isAutofocused
                    isDisabled={
                      !parent?.data?.id || (!!isRandomized && !!(selectedEntities.length >= getMaxEntityCount(random_count)))
                    }
                    isMultiple
                    label="Replace with"
                    name={`template_fields[${idx}].related`}
                    onBrowserChange={(props) => {
                      const updateValues = [...(related || [])];
                      props.forEach(({ value }, itemIndex) => {
                        if (updateValues?.includes(value)) {
                          updateValues.splice(itemIndex, 1);
                        } else {
                          updateValues.push(value);
                        }
                      });
                      handleChange({ name: `template_fields[${idx}].related`, value: updateValues });
                    }}
                    onChange={({ value: newValue }) => {
                      if (related?.includes(newValue))
                        handleChange({ name: `template_fields[${idx}].related`, value: related.filter((v) => v !== newValue) });
                      else handleChange({ name: `template_fields[${idx}].related`, value: related.concat(newValue) });
                    }}
                    parent_id={parent?.data?.id}
                    searchEntity={entity_type as EntitiesWithRelatedType}
                    value={related}
                  />
                </div>
              )}
            </div>
          </>
        ) : null}
        {EntitiesWithRelated.includes(entity_type) && !EntitiesWithParents.includes(entity_type) ? (
          <div className="flex w-full flex-col gap-y-2">
            {entity_type === "images" ? (
              <div className="grid grid-cols-2">
                <Input
                  helperText={additional_data?.width ? "" : "Images must have a width"}
                  label="Width"
                  max={5000}
                  min={0}
                  name={`template_fields[${idx}].additional_data.width`}
                  onChange={(e) => {
                    handleChange({ name: e.name, value: Number(e.value || 50) });
                  }}
                  type="number"
                  value={additional_data?.width || 0}
                  variant={additional_data?.width ? "primary" : "error"}
                />
                <Input
                  helperText={additional_data?.height ? "" : "Images must have a height"}
                  label="Height"
                  max={5000}
                  min={0}
                  name={`template_fields[${idx}].additional_data.height`}
                  onChange={(e) => {
                    handleChange({ name: e.name, value: Number(e.value || 50) });
                  }}
                  type="number"
                  value={additional_data?.height || 0}
                  variant={additional_data?.height ? "primary" : "error"}
                />
              </div>
            ) : null}
            {isRandomized || (related.length && entity_type === "images") ? null : (
              <Search
                isAutofocused
                isDisabled={!!isRandomized}
                isMultiple={entity_type !== "images"}
                label="Replace with"
                name={`template_fields[${idx}].related`}
                onBrowserChange={(props) => {
                  const itemsToChange = props.map(({ label, value }) => {
                    if (related?.includes(value))
                      return [
                        { name: `template_fields[${idx}].related`, value: related.filter((v) => v !== value) },
                        { name: `template_fields[${idx}].additional_data`, value: null },
                      ];
                    else if (entity_type === "images") {
                      return [
                        { name: `template_fields[${idx}].related`, value: [value] },
                        {
                          name: `template_fields[${idx}].additional_data.title`,
                          value: label as string,
                        },
                      ];
                    }
                    return [{ name: `template_fields[${idx}].related`, value: related.concat(value) }];
                  });
                  handleChange(itemsToChange.flat());
                }}
                onChange={({ value: newValue, label }) => {
                  if (related?.includes(newValue))
                    handleChange([
                      { name: `template_fields[${idx}].related`, value: related.filter((v) => v !== newValue) },
                      { name: `template_fields[${idx}].additional_data`, value: null },
                    ]);
                  else if (entity_type === "images") {
                    handleChange([
                      { name: `template_fields[${idx}].related`, value: [newValue] },
                      {
                        name: `template_fields[${idx}].additional_data.title`,
                        value: label,
                      },
                    ]);
                  } else {
                    handleChange([
                      { name: `template_fields[${idx}].related`, value: related.concat(newValue) },
                      {
                        name: `template_fields[${idx}].additional_data.title`,
                        value: label,
                      },
                    ]);
                  }
                }}
                searchEntity={entity_type as EntitiesWithRelatedType}
                value={entity_type === "images" ? related?.[0] : related}
              />
            )}
          </div>
        ) : null}
        <div className="flex w-full flex-col gap-y-2">
          {selectedEntities.map((ent) => (
            <EntityPreview
              key={ent.value}
              clearAction={() =>
                handleChange({ name: `template_fields[${idx}].related`, value: related.filter((v) => v !== ent.value) })
              }
              icon={ent.icon || parent?.data?.icon || ""}
              id={ent.value}
              image_id={entity_type === "images" ? ent.value : ent.image}
              title={ent.label}
              type={entity_type as AvailableEntityType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchField({
  blueprint_id,
  map_id,
  calendar_id,
  dictionary_id,
  allMatches,
  match,
  value,
  entity_type,
  is_randomized,
  related,
  formula,
  idx,
  isEditable,
  derive_formula,
  derive_from,
  random_count,
  additional_data,
  handleChange,
}: {
  allMatches: DocumentType["template_fields"];
  match: DocumentTemplateFieldType["key"];
  idx: number;
  isEditable?: boolean;
  handleChange: (props: HandleChangePropsType) => void;
} & Pick<
  DocumentTemplateFieldType,
  | "blueprint_id"
  | "map_id"
  | "calendar_id"
  | "dictionary_id"
  | "entity_type"
  | "value"
  | "derive_formula"
  | "derive_from"
  | "formula"
  | "related"
  | "is_randomized"
  | "random_count"
  | "additional_data"
>) {
  useLayoutEffect(() => {
    if (entity_type) {
      handleChange({ name: `template_fields[${idx}].parent_id`, value: null });
    }
  }, [entity_type]);

  const parentIdx = entity_type === "derived" ? allMatches.findIndex((m) => m?.id === derive_from) : null;
  const derivedParentValue = typeof parentIdx === "number" && parentIdx > -1 ? allMatches[parentIdx].value : null;

  useEffect(() => {
    if (derive_from && derive_formula && !isEditable) {
      if (typeof parentIdx === "number") {
        if (derive_formula === "dnd_5e_ability_bonus") {
          const newVal = Math.floor((Number(derivedParentValue || 10) - 10) / 2).toString();
          if (value !== newVal) {
            handleChange({
              name: `template_fields[${idx}].value`,
              value: Math.floor((Number(derivedParentValue || 10) - 10) / 2).toString(),
            });
          }
        }
      }
    }
  }, [derive_formula, derivedParentValue]);
  if (EntitiesWithRelated.includes(entity_type))
    return (
      <EntityWithRelatedRow
        additional_data={additional_data}
        blueprint_id={blueprint_id}
        calendar_id={calendar_id}
        dictionary_id={dictionary_id}
        entity_type={entity_type as EntitiesWithRelatedType}
        handleChange={handleChange}
        idx={idx}
        isEditable={isEditable}
        isRandomized={is_randomized}
        map_id={map_id}
        match={match}
        random_count={random_count}
        related={related}
      />
    );

  if (entity_type === "custom") {
    return (
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-nowrap gap-x-1">
          <div className="flex-1">
            <Input
              isDisabled={!isEditable}
              label="Key (must be unique)"
              name={`template_fields[${idx}].key`}
              onChange={handleChange}
              value={match}
              variant={match ? "primary" : "error"}
            />
          </div>
          <div className="w-1/4">
            <Select
              hasSearch
              label="Entity type"
              name={`template_fields[${idx}].entity_type`}
              onChange={(e) => {
                const toChange = [e, { name: `template_fields[${idx}].value`, value: null }];
                if (is_randomized) {
                  toChange.push({ name: `template_fields[${idx}].is_randomized`, value: null });
                }
                handleChange(toChange);
              }}
              options={MatchReplacementOptions}
              value={entity_type}
            />
          </div>
        </div>
      </div>
    );
  }
  if (entity_type === "dice_roll") {
    return (
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-nowrap gap-x-1">
          <div className="flex-1">
            <Input
              isDisabled={!isEditable}
              label="Key (must be unique)"
              name={`template_fields[${idx}].key`}
              onChange={handleChange}
              value={match}
              variant={match ? "primary" : "error"}
            />
          </div>
          <div className="w-1/4">
            <Select
              hasSearch
              label="Entity type"
              name={`template_fields[${idx}].entity_type`}
              onChange={(e) => handleChange([e, { name: `template_fields[${idx}].value`, value: null }])}
              options={MatchReplacementOptions}
              value={entity_type}
            />
          </div>
        </div>
        <Input
          helperText={!formula ? "This field is required" : ""}
          label="Formula"
          name={`template_fields[${idx}].formula`}
          onChange={({ value: newValue }) => {
            handleChange({
              name: `template_fields[${idx}].formula`,
              value: newValue && typeof newValue === "string" ? newValue : null,
            });
          }}
          value={formula || ""}
          variant={!formula ? "error" : "primary"}
        />
      </div>
    );
  }
  if (entity_type === "derived") {
    return (
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-nowrap gap-x-1">
          <div className="flex-1">
            <Input
              isDisabled={!isEditable}
              label="Key (must be unique)"
              name={`template_fields[${idx}].key`}
              onChange={handleChange}
              value={match}
              variant={match ? "primary" : "error"}
            />
          </div>
          <div className="w-1/4">
            <Select
              hasSearch
              label="Entity type"
              name={`template_fields[${idx}].entity_type`}
              onChange={(e) => {
                const toChange = [e, { name: `template_fields[${idx}].value`, value: null }];
                handleChange(toChange);
              }}
              options={MatchReplacementOptions}
              value={entity_type}
            />
          </div>
        </div>
        <div className="flex flex-nowrap gap-x-1">
          <div className="flex-1">
            <Select
              label="Derive from"
              name={`template_fields[${idx}].derive_from`}
              onChange={handleChange}
              options={allMatches
                .filter((v) => !!v.key && v?.entity_type === "dice_roll" && v.key !== match)
                .map((v) => ({ label: v.key, value: v.id }))}
              value={derive_from || ""}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Derive formula"
              name={`template_fields[${idx}].derive_formula`}
              onChange={handleChange}
              options={DeriveFromFormulas}
              value={derive_formula || ""}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-y-2 border-b border-zinc-700 pb-1">
      <div className="grid w-full max-w-full grid-cols-2 items-center gap-x-1 gap-y-2">
        <div className="col-span-1">
          <Input
            isDisabled={!isEditable}
            label="Key (must be unique)"
            name={`template_fields[${idx}].key`}
            onChange={handleChange}
            value={match}
            variant={match ? "primary" : "error"}
          />
        </div>
      </div>
    </div>
  );
}
