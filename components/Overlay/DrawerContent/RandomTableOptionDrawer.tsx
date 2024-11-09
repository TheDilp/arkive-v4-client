import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetSubEntity, useHandleChange, useToggledResetAtom, useUpdateSubEntity } from "../../../hooks";
import { RandomTableOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { IconEnum } from "../../../utils";
import { UpdateRandomTableOptionSchema } from "../../../validation/random_tables";
import { Button, Input, Textarea } from "../../Form";
import { Tabs } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: { id?: string };
};

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Suboptions", icon: IconEnum.random_table },
];
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
      fields: ["id", "title", "description", "icon", "icon_color"],
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
          <>
            <div className="flex flex-nowrap items-center gap-x-2">
              <div className="flex-1">
                <Input label="Title (required)" name="title" onChange={handleChange} value={randomTableOption?.title || ""} />
              </div>
            </div>
            <div className="h-56">
              <Textarea
                label="Description (optional)"
                name="description"
                onChange={handleChange}
                value={randomTableOption?.description || ""}
              />
            </div>
          </>
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
