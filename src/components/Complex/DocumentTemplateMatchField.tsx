import { useEffect, useState } from "react";

import { useGetEntity } from "../../hooks";
import {
  AvailableEntityType,
  BlueprintType,
  DocumentTemplateFieldType,
  DocumentType,
  HandleChangePropsType,
  MatchType,
} from "../../types";
import { AvailableIcons, DefaultTagColor, Dice, DiceRollParser, IconEnum, useNotifications } from "../../utils";
import { EntityPreview } from "../DataDisplay";
import { Button, Checkbox, Input, Search, Select } from "../Form";

const MatchReplacementOptions: { label: string; value: MatchType; icon: AvailableIcons }[] = [
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
    label: "Words",
    value: "words",
    icon: IconEnum.word,
  },
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
const DeriveFromFormulas: { label: string; value: string }[] = [
  { label: "D&D 5e ability bonus", value: "dnd_5e_ability_bonus" as const },
];

export function MatchField({
  allMatches,
  match,
  value,
  entity_type,
  is_randomized,
  related_id,
  formula,
  idx,
  isEditable,
  derive_formula,
  derive_from,
  handleChange,
}: {
  allMatches: DocumentType["template_fields"];
  match: DocumentTemplateFieldType["key"];
  idx: number;
  isEditable?: boolean;
  handleChange: (props: HandleChangePropsType) => void;
} & Pick<
  DocumentTemplateFieldType,
  "entity_type" | "value" | "derive_formula" | "derive_from" | "formula" | "related_id" | "is_randomized"
>) {
  const [parent, setParent] = useState<{
    label: string;
    value: string;
    image: string | null;
    icon: string | null;
  } | null>();
  const [selectedEntity, setSelectedEntity] = useState<{
    label: string;
    value: string;
    image: string | null;
    icon: string | null;
  } | null>();
  const createNotification = useNotifications();

  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (selectedEntity) {
      handleChange({ name: `template_fields[${idx}].value`, value: selectedEntity.label });
    }
  }, [selectedEntity]);

  const { data: relatedBlueprint, isFetching } = useGetEntity<BlueprintType>(
    related_id as string | undefined,
    "blueprints",
    {
      data: {
        id: related_id,
      },
      fields: ["id", "title", "icon"],
    },
    {
      enabled: !!related_id && entity_type === "blueprints",
    },
  );

  useEffect(() => {
    if (relatedBlueprint?.data) {
      if (entity_type === "characters") {
        // setParent({
        //   label: relatedBlueprint?.data?.full_name,
        //   value: relatedBlueprint?.data?.id,
        //   icon: null,
        //   image: relatedBlueprint?.data?.portrait_id,
        // });
      } else {
        setParent({
          label: relatedBlueprint?.data?.title,
          value: relatedBlueprint?.data?.id,
          icon: relatedBlueprint?.data?.icon || null,
          image: null,
        });
      }
    }
  }, [relatedBlueprint]);

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
          />
        </div>

        <div className="col-span-1 flex items-center gap-x-1">
          <Select
            hasSearch
            label="Entity type"
            name={`template_fields[${idx}].entity_type`}
            onChange={(e) => {
              const toChange = [e, { name: `template_fields[${idx}].value`, value: null }];
              if (entity_type === "custom" || entity_type === "derived") {
                toChange.push({ name: `template_fields[${idx}].is_randomized`, value: null });
              }
              handleChange(toChange);
              if (selectedEntity) setSelectedEntity(null);
              if (parent) setParent(null);

              handleChange(toChange);
            }}
            options={MatchReplacementOptions}
            value={entity_type}
          />
          {entity_type === "derived" && !isEditable ? (
            <div>
              <Input isDisabled label="Result" name="value" onChange={() => {}} value={value || ""} />
            </div>
          ) : null}
        </div>
        {entity_type === "custom" ? (
          <div className="col-span-1 w-full">
            <Input label="Replace with" name={`template_fields[${idx}].value`} onChange={handleChange} value={value || ""} />
          </div>
        ) : null}
        {entity_type !== "custom" && entity_type !== "derived" ? (
          <div className="col-span-2 flex w-full flex-1 gap-x-4">
            {!!entity_type && entity_type === "blueprint_instances" && !parent ? (
              <div className="flex-1">
                <Search
                  isDisabled={isFetching}
                  isLoading={isFetching}
                  label="Blueprint"
                  name="value"
                  onChange={({ label, value: newValue, image, icon }) => {
                    handleChange({ name: `template_fields[${idx}].related_id`, value: newValue });
                    setParent({
                      label: label || "",
                      value: newValue,
                      image: image || null,
                      icon: icon || null,
                    });
                  }}
                  searchEntity="blueprints"
                  value={related_id}
                />
              </div>
            ) : null}
            {!!entity_type && entity_type === "blueprint_instances" && parent ? (
              <div className="flex-1">
                <EntityPreview
                  clearAction={() => setParent(null)}
                  icon={parent.icon || ""}
                  id={parent.value}
                  image_id={parent.image}
                  label="Blueprint"
                  title={parent.label}
                  type="blueprints"
                />
              </div>
            ) : null}
            {entity_type !== "dice_roll" &&
            !is_randomized &&
            !!entity_type &&
            !selectedEntity &&
            ((entity_type === "blueprint_instances" && parent && (!is_randomized || !isEditable)) ||
              entity_type !== "blueprint_instances") ? (
              <div className="flex-1">
                <Search
                  isDisabled={(entity_type === "blueprint_instances" && !parent) || isFetching}
                  isLoading={isFetching}
                  label="Replace with"
                  name={`template_fields[${idx}].value`}
                  onChange={({ label, value: newValue, image, icon }) =>
                    setSelectedEntity({
                      label: label || "",
                      value: newValue,
                      image: image || null,
                      icon: icon || null,
                    })
                  }
                  parent_id={parent?.value}
                  searchEntity={entity_type}
                  value={value}
                />
              </div>
            ) : null}
            {entity_type !== "dice_roll" && !!entity_type && !is_randomized && selectedEntity?.value && entity_type ? (
              <div className="flex-1">
                <EntityPreview
                  clearAction={() => setSelectedEntity(null)}
                  icon={selectedEntity.icon || ""}
                  id={selectedEntity.value}
                  image_id={selectedEntity.image}
                  label="Replace with"
                  title={selectedEntity.label}
                  type={entity_type as AvailableEntityType}
                />
              </div>
            ) : null}
            {entity_type === "dice_roll" ? (
              <Input
                label="Formula"
                name={`template_fields[${idx}].formula`}
                onChange={({ value: newValue }) => {
                  handleChange({
                    name: `template_fields[${idx}].formula`,
                    value: newValue && typeof newValue === "string" ? newValue : null,
                  });
                }}
                value={formula || ""}
              />
            ) : null}
            {entity_type === "dice_roll" && !is_randomized && !isEditable ? (
              <div className="flex gap-x-4">
                <Input isDisabled label="Result" name="value" onChange={() => {}} value={value || ""} />
                <div className="flex self-end pb-1.5">
                  <Button
                    hasNoBackground
                    icon={IconEnum.d20}
                    iconSize={24}
                    isDisabled={isRolling}
                    isLoading={isRolling}
                    onClick={() => {
                      setIsRolling(true);
                      try {
                        const parsedNotation = DiceRollParser.parseNotation(formula);
                        Dice.updateConfig({ themeColor: DefaultTagColor, suspendSimulation: true });

                        Dice.roll(parsedNotation)
                          .then((r: any) => {
                            const rollData = DiceRollParser.parseFinalResults(r);
                            if (rollData?.valid) {
                              handleChange({ name: `template_fields[${idx}].value`, value: rollData?.value?.toString() });
                              // handleChange([
                              //   { name: `${name}.id`, value: id },
                              //   { name: `${name}.value`, value: rollData.value },
                              // ]);
                            }
                          })
                          .catch(() => {
                            createNotification({
                              timer: 2,
                              title: "The dice roll notation is not valid.",
                              icon: IconEnum.warning,
                              variant: "error",
                              position: "top",
                            });
                          });
                        Dice.updateConfig({ themeColor: DefaultTagColor, suspendSimulation: false });
                      } catch (error) {
                        createNotification({
                          timer: 2,
                          title: "The dice roll notation is not valid.",
                          icon: IconEnum.warning,
                          variant: "error",
                          position: "top",
                        });
                      }
                      setIsRolling(false);
                    }}
                  />
                </div>
              </div>
            ) : null}

            {entity_type !== "dice_roll" && !!entity_type ? (
              <div className="h-full [&>div]:gap-y-2">
                <Checkbox
                  label="Randomize?"
                  name={`template_fields[${idx}].is_randomized`}
                  onChange={handleChange}
                  value={!!is_randomized}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {entity_type === "derived" ? (
        <div className="flex gap-x-1">
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
      ) : null}
    </div>
  );
}
