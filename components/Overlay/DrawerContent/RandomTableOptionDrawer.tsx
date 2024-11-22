import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetSubEntity, useHandleChange, useToggledResetAtom, useUpdateSubEntity } from "../../../hooks";
import { RandomTableOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { IconEnum, optionRelatedEntities } from "../../../utils";
import { UpdateRandomTableOptionSchema } from "../../../validation/random_tables";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Select, Textarea } from "../../Form";
import { Tabs } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: { id?: string };
};

const tabs = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];
export function RandomTableOptionDrawer({ data }: Props) {
  const queryClient = useQueryClient();
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);

  const resetDrawer = useToggledResetAtom();

  const {
    data: existingOption,
    isInitialLoading,
    isFetching,
  } = useGetSubEntity<RandomTableOptionType>(
    data?.id,
    "random_table_options",
    {
      fields: ["id", "title", "description", "related_data"],
      relations: { random_table_suboptions: true },
    },
    {
      enabled: !!data?.id,
    }
  );

  const [randomTableOption, setRandomTableOption] = useState<Partial<RandomTableOptionType>>(
    existingOption?.data || { id: data?.id }
  );
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateSubEntity(
    "random_table_options",
    project_id as string,
    randomTableOption?.parent_id
  );

  const { handleChange } = useHandleChange({ data: randomTableOption, setData: setRandomTableOption });
  useLayoutEffect(() => {
    if (existingOption?.data) setRandomTableOption(existingOption?.data);
  }, [existingOption]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  if (!existingOption?.data || !data?.id) return <Alert label="This option does not exist." variant="error" />;

  return (
    <>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      <div className="flex flex-col gap-y-2 overflow-hidden">
        {selectedTab === 0 ? (
          <div className="flex flex-col gap-y-2">
            <div className="flex w-full items-center gap-x-2">
              {!randomTableOption.related_data || randomTableOption?.related_data?.type === "text" ? (
                <Input
                  label="Title (required)"
                  name={"title"}
                  onChange={handleChange}
                  value={randomTableOption.title || ""}
                  variant={randomTableOption.title ? "primary" : "error"}
                />
              ) : null}

              {randomTableOption.related_data &&
              !randomTableOption?.related_data?.id &&
              randomTableOption.related_data?.type !== "text" ? (
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
                      { name: "title", value: itemToChange?.label },
                      {
                        name: "related_data",
                        value: {
                          id: itemToChange.value,
                          title: itemToChange.label,
                          icon: itemToChange?.icon,
                          image_id: itemToChange?.image,
                          type: randomTableOption.related_data?.type,
                        },
                      },
                    ]);

                    handleChange(itemToChange);
                  }}
                  onChange={(e) => {
                    handleChange([
                      { name: "title", value: e.label },
                      {
                        name: "related_data",
                        value: {
                          id: e.value,
                          title: e.label,
                          icon: e.icon,
                          image_id: e.image,
                          type: randomTableOption.related_data?.type,
                        },
                      },
                    ]);
                  }}
                  searchEntity={randomTableOption.related_data?.type}
                  variant={randomTableOption.related_data?.id ? "primary" : "error"}
                />
              ) : null}
              {!!randomTableOption.related_data?.id && randomTableOption.related_data?.type !== "text" ? (
                <div className="flex-1">
                  <EntityPreview
                    clearAction={() => {
                      handleChange([
                        { name: "title", value: null },
                        {
                          name: "related_data",
                          value: { type: randomTableOption.related_data?.type },
                        },
                      ]);
                    }}
                    icon={randomTableOption.related_data?.icon}
                    id={randomTableOption.related_data?.id || ""}
                    image_id={randomTableOption.related_data?.image_id || null}
                    label="Entity"
                    title={randomTableOption.related_data?.title || ""}
                    type={randomTableOption.related_data.type}
                  />
                </div>
              ) : null}
              <div className="min-w-[33%]">
                <Select
                  label="Type"
                  name={"related_data.type"}
                  onChange={(e) => {
                    handleChange({ name: "related_data", value: { type: e.value } });
                  }}
                  options={optionRelatedEntities}
                  value={randomTableOption?.related_data?.type || "text"}
                />
              </div>
            </div>
            <div>
              <Textarea
                label="Description (optional)"
                name={"description"}
                onChange={handleChange}
                value={randomTableOption.description || ""}
              />
            </div>
          </div>
        ) : null}

        <div className="w-full">
          <Button
            icon={IconEnum.add}
            isDisabled={isFetching || isUpdating}
            isLoading={isFetching || isUpdating}
            label="Save"
            onClick={async () => {
              const parsedData = UpdateRandomTableOptionSchema.parse({
                data: randomTableOption,
              });
              await update(parsedData, {
                onSuccess: (d) => {
                  queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, "random_table_options"] });
                  if (d.ok) resetDrawer();
                },
              });
            }}
            variant="success"
          />
        </div>
      </div>
    </>
  );
}
