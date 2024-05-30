import { useEffect, useState } from "react";

import { AvailableEntityType, DocumentTemplateFieldType, DocumentType, HandleChangePropsType, MatchType } from "../../types";
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
  formula,
  idx,
  isEditable,
  handleChange,
}: {
  allMatches: DocumentType["template_fields"];
  match: DocumentTemplateFieldType["key"];
  idx: number;
  isEditable?: boolean;
  handleChange: (props: HandleChangePropsType) => void;
} & Pick<DocumentTemplateFieldType, "entity_type" | "value" | "formula" | "is_randomized">) {
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
  const [derived, setDerived] = useState<{ derive_from: string | null; derive_formula: string | null }>({
    derive_from: null,
    derive_formula: null,
  });
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (selectedEntity) {
      handleChange({ name: `fields[${idx}].value`, value: selectedEntity.label });
    }
  }, [selectedEntity]);

  useEffect(() => {
    if (derived?.derive_from && derived?.derive_formula) {
      const parentIdx = allMatches.findIndex((m) => m?.key === derived?.derive_from);
      if (parentIdx > -1) {
        const newVal = Math.floor((Number(allMatches[parentIdx]?.value || 10) - 10) / 2).toString();
        if (value !== newVal) {
          handleChange({
            name: `fields.${parentIdx}.value`,
            value: Math.floor((Number(allMatches[parentIdx]?.value || 10) - 10) / 2).toString(),
          });
        }
      }
    }
  }, [derived?.derive_formula, allMatches]);
  return (
    <div className="flex w-full flex-col gap-y-2 border-b border-zinc-700">
      <div className="flex flex-nowrap items-center gap-x-1">
        {isEditable ? (
          <div className="flex-1">
            <Input label="Key (must be unique)" name={`fields[${idx}].key`} onChange={handleChange} value={match} />
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="min-w-48 max-w-[25%] self-end pb-2.5 text-sm text-zinc-300">Key</span>

            <span className="min-w-48 max-w-[25%] self-end">{match}</span>
          </div>
        )}

        <div className="w-48">
          <Select
            label="Entity type"
            name={`fields[${idx}].entity_type`}
            onChange={(e) => {
              const toChange = [e, { name: `fields[${idx}].value`, value: null }];
              if (entity_type === "custom" || entity_type === "derived") {
                toChange.push({ name: `fields[${idx}].is_randomized`, value: null });
              }
              handleChange(toChange);
              if (selectedEntity) setSelectedEntity(null);
              if (parent) setParent(null);

              handleChange(toChange);
            }}
            options={MatchReplacementOptions}
            value={entity_type}
          />
        </div>
        {entity_type === "custom" ? (
          <div className="w-full">
            <Input label="Replace with" name={`fields[${idx}].value`} onChange={handleChange} value={value || ""} />
          </div>
        ) : null}
        <div className="flex flex-1 items-center gap-x-4">
          <div className="flex-1 ">
            <div className="flex flex-1 gap-x-4">
              {!!entity_type && entity_type === "blueprint_instances" && !parent ? (
                <Search
                  label="Blueprint"
                  name="value"
                  onChange={({ label, value: newValue, image, icon }) =>
                    setParent({
                      label: label || "",
                      value: newValue,
                      image: image || null,
                      icon: icon || null,
                    })
                  }
                  searchEntity="blueprints"
                  value={value}
                />
              ) : null}
              {!!entity_type && !is_randomized && entity_type === "blueprint_instances" && parent ? (
                <EntityPreview
                  clearAction={() => setParent(null)}
                  icon={parent.icon || ""}
                  id={parent.value}
                  image_id={parent.image}
                  label="Blueprint"
                  title={parent.label}
                  type="blueprints"
                />
              ) : null}
              {entity_type !== "custom" &&
              entity_type !== "dice_roll" &&
              entity_type !== "derived" &&
              !is_randomized &&
              !!entity_type &&
              !selectedEntity &&
              ((entity_type === "blueprint_instances" && parent) || entity_type !== "blueprint_instances") ? (
                <Search
                  isDisabled={entity_type === "blueprint_instances" && !parent}
                  label="Replace with"
                  name={`fields[${idx}].value`}
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
              ) : null}
              {entity_type !== "custom" &&
              entity_type !== "dice_roll" &&
              entity_type !== "derived" &&
              !!entity_type &&
              !is_randomized &&
              selectedEntity?.value &&
              entity_type ? (
                <EntityPreview
                  clearAction={() => setSelectedEntity(null)}
                  icon={selectedEntity.icon || ""}
                  id={selectedEntity.value}
                  image_id={selectedEntity.image}
                  label="Replace with"
                  title={selectedEntity.label}
                  type={entity_type as AvailableEntityType}
                />
              ) : null}
              {entity_type === "dice_roll" ? (
                <Input
                  label="Formula"
                  name={`fields[${idx}].formula`}
                  onChange={({ value: newValue }) => {
                    handleChange({
                      name: `fields[${idx}].formula`,
                      value: newValue && typeof newValue === "string" ? newValue : null,
                    });
                  }}
                  value={formula || ""}
                />
              ) : null}
              {entity_type === "dice_roll" && !is_randomized ? (
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
                                handleChange({ name: `fields[${idx}].value`, value: rollData?.value?.toString() });
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
              {entity_type === "derived" ? (
                <>
                  <div className="flex-1">
                    <Select
                      label="Derive from"
                      name="derive_from"
                      onChange={({ value: df }) => {
                        setDerived((prev) => ({ ...prev, derive_from: df as string }));
                      }}
                      options={Object.entries(allMatches)
                        .filter(([key, v]) => !!key && !!v?.value && !!v?.entity_type && key !== match)
                        .map(([key]) => ({ label: key, value: key }))}
                      value={derived.derive_from || ""}
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      label="Derive formula"
                      name="derive_from"
                      onChange={({ value: df }) => {
                        if (derived.derive_from) {
                          if (df === "dnd_5e_ability_bonus") {
                            setDerived((prev) => ({ ...prev, derive_formula: "dnd_5e_ability_bonus" }));
                          }
                        }
                      }}
                      options={DeriveFromFormulas}
                      value={derived.derive_formula || ""}
                    />
                  </div>
                </>
              ) : null}
              {entity_type !== "custom" && entity_type !== "derived" && !!entity_type ? (
                <div className="h-full [&>div]:gap-y-2">
                  <Checkbox
                    label="Randomize?"
                    name={`fields[${idx}].is_randomized`}
                    onChange={handleChange}
                    value={!!is_randomized}
                  />
                </div>
              ) : null}
              {isEditable ? (
                <div className="mt-5">
                  <Button
                    hasNoBackground
                    icon={IconEnum.trash}
                    iconSize={22}
                    isIconOnly
                    onClick={() => {
                      const newFields = allMatches.filter((_, i) => i !== idx);
                      handleChange({ name: "fields", value: newFields });
                    }}
                    variant="error"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
