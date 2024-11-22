import { useQueryClient } from "@tanstack/react-query";
import omit from "lodash.omit";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntities, useHandleChange, useToggledResetAtom } from "../../../hooks";
import { RandomTableOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { IconEnum, optionRelatedEntities } from "../../../utils";
import { InsertRandomTableOptionSchema, InsertRandomTableOptionType } from "../../../validation/random_tables";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Select, Textarea } from "../../Form";
import { Collapsible } from "../../Layout";

export function RandomTableOptionsDrawer({ data }: { data: { parent_id: string } }) {
  const queryClient = useQueryClient();
  const { project_id } = useParams();
  const [options, setOptions] = useState<RandomTableOptionType[]>([]);
  const resetDrawerAtom = useToggledResetAtom();
  const { mutateAsync: create, isLoading: isCreating } = useCreateSubEntities<{
    data: (InsertRandomTableOptionType & { data: { parent_id: string } })[];
  }>("random_table_options", data.parent_id);
  const [areAllOpen, setAreAllOpen] = useState(false);

  const { handleChange } = useHandleChange({ data: options, setData: setOptions });
  return (
    <div className="flex h-full flex-col gap-y-2">
      <div className="flex w-full items-center justify-between">
        <span>Insert new option:</span>
        <div className="flex gap-x-2">
          <div className="h-8 w-8">
            <Button
              icon={IconEnum.add}
              onClick={() =>
                setOptions((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    title: "New option",
                    character_id: null,
                    blueprint_instance_id: null,
                    document_id: null,
                    map_id: null,
                    map_pin_id: null,
                    graph_id: null,
                    event_id: null,
                    word_id: null,
                    image_id: null,
                    related_data: null,
                    parent_id: data.parent_id,
                  },
                ])
              }
              variant="info"
            />
          </div>
          <div className="h-8 w-8">
            <Button
              icon={areAllOpen ? IconEnum.chevron_down : IconEnum.chevron_up}
              onClick={() => setAreAllOpen((prev) => !prev)}
              tooltip={"Open/Close all"}
              variant="info"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 overflow-auto">
        {options.map((option, idx) => (
          <Collapsible
            key={option.id}
            actions={[
              {
                icon: IconEnum.trash,
                variant: "error",
                onClick: () => {
                  setOptions(options?.toSpliced(idx, 1));
                },
                isIconOnly: true,
                hasNoBackground: true,
              },
            ]}
            initialOpen={areAllOpen}
            label={option.title}
            variant={option?.title ? "primary" : "error"}>
            <div className="flex flex-col gap-y-2 p-2">
              <div className="flex w-full items-center gap-x-2">
                {!option.related_data || option?.related_data?.type === "text" ? (
                  <Input
                    label="Title (required)"
                    name={`[${idx}].title`}
                    onChange={handleChange}
                    value={option.title || ""}
                    variant={option.title ? "primary" : "error"}
                  />
                ) : null}

                {option.related_data && !option?.related_data?.id && option.related_data?.type !== "text" ? (
                  <Search
                    label="Entity (required)"
                    name="related_id"
                    onBrowserChange={(props) => {
                      const itemToChange: {
                        name: string;
                        value: string;
                        label?: string;
                        image?: string | undefined;
                        icon?: string | undefined;
                      } = props?.[0];

                      handleChange([
                        { name: `[${idx}].title`, value: itemToChange?.label },
                        {
                          name: `[${idx}].related_data`,
                          value: {
                            id: itemToChange.value,
                            title: itemToChange.label,
                            icon: itemToChange?.icon,
                            image_id: itemToChange?.image,
                            type: option.related_data?.type,
                          },
                        },
                      ]);

                      handleChange(itemToChange);
                    }}
                    onChange={(e) => {
                      handleChange([
                        { name: `[${idx}].title`, value: e.label },
                        {
                          name: `[${idx}].related_data`,
                          value: {
                            id: e.value,
                            title: e.label,
                            icon: e.icon,
                            image_id: e.image,
                            type: option.related_data?.type,
                          },
                        },
                      ]);
                    }}
                    searchEntity={option.related_data?.type}
                    variant={option.related_data?.id ? "primary" : "error"}
                  />
                ) : null}
                {!!option.related_data?.id && option.related_data?.type !== "text" ? (
                  <div className="flex-1">
                    <EntityPreview
                      clearAction={() => {
                        handleChange([
                          { name: `[${idx}].title`, value: null },
                          {
                            name: `[${idx}].related_data`,
                            value: { type: option.related_data?.type },
                          },
                        ]);
                      }}
                      icon={option.related_data?.icon}
                      id={option.related_data?.id || ""}
                      image_id={option.related_data?.image_id || null}
                      label="Entity"
                      title={option.related_data?.title || ""}
                      type={option.related_data.type}
                    />
                  </div>
                ) : null}
                <div className="min-w-[33%]">
                  <Select
                    label="Type"
                    name={`[${idx}].related_data.type`}
                    onChange={(e) => {
                      handleChange({ name: `[${idx}].related_data`, value: { type: e.value } });
                    }}
                    options={optionRelatedEntities}
                    value={option?.related_data?.type || "text"}
                  />
                </div>
              </div>
              <div>
                <Textarea
                  label="Description (optional)"
                  name={`[${idx}].description`}
                  onChange={handleChange}
                  value={option.description || ""}
                />
              </div>
            </div>
          </Collapsible>
        ))}
      </div>
      <div className="w-full">
        <Button
          icon={IconEnum.add}
          isDisabled={!options.length || options.some((opt) => !opt.title) || isCreating}
          isLoading={isCreating}
          label="Add"
          onClick={async () => {
            const optionsToCreate = options.map((opt) => {
              const temp = omit(opt, ["id", "related_data"]);
              if (opt.related_data?.type === "characters") temp.character_id = opt.related_data.id;
              else if (opt.related_data?.type === "blueprint_instances") temp.blueprint_instance_id = opt.related_data.id;
              else if (opt.related_data?.type === "documents") temp.document_id = opt.related_data.id;
              else if (opt.related_data?.type === "maps") temp.map_id = opt.related_data.id;
              else if (opt.related_data?.type === "map_pins") temp.map_pin_id = opt.related_data.id;
              else if (opt.related_data?.type === "graphs") temp.graph_id = opt.related_data.id;
              else if (opt.related_data?.type === "events") temp.event_id = opt.related_data.id;
              else if (opt.related_data?.type === "words") temp.word_id = opt.related_data.id;
              else if (opt.related_data?.type === "images") temp.image_id = opt.related_data.id;
              return { data: temp };
            });
            const parsedData = InsertRandomTableOptionSchema.transform((item) => ({
              ...item,
              data: { ...item.data, parent_id: data.parent_id },
            }))
              .array()
              .parse(optionsToCreate);

            await create(
              { data: parsedData },
              {
                onSuccess: (res) => {
                  if (res?.ok) {
                    resetDrawerAtom();
                    setOptions([]);
                    queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, "random_table_options"] });
                  }
                },
              }
            );
          }}
          variant="success"
        />
      </div>
    </div>
  );
}
