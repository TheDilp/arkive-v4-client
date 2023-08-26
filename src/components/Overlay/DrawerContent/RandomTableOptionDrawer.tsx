import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetSubEntity, useHandleChange, useUpdateRandomTableOption } from "../../../hooks";
import { RandomTableOptionType, RandomTableSubOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { drawerAtom, IconEnum } from "../../../utils";
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
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);

  const resetDrawer = useResetAtom(drawerAtom);

  const { data: existingOption, isFetching } = useGetSubEntity<RandomTableOptionType>(
    data?.id,
    "random_table_options",
    {
      data: {},
      relations: { suboptions: true },
    },
    {
      enabled: !!data?.id,
    },
  );

  const [randomTableOption, setRandomTableOption] = useState<Partial<RandomTableOptionType>>(
    existingOption?.data || { id: data?.id },
  );
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateRandomTableOption(
    randomTableOption?.parent_id,
    project_id as string,
  );

  const { handleChange } = useHandleChange({ data: randomTableOption, setData: setRandomTableOption });
  useLayoutEffect(() => {
    if (existingOption?.data) setRandomTableOption(existingOption?.data);
  }, [existingOption]);

  if (isFetching) return <Skeleton type="drawer_form" />;

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
        {selectedTab === 1 ? (
          <>
            <div className="flex w-full items-center justify-between">
              <span>Insert new option:</span>
              <div className="h-8 w-8">
                <Button
                  icon={IconEnum.add}
                  onClick={() =>
                    handleChange({
                      name: "suboptions",
                      value: (randomTableOption?.suboptions || []).concat({
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        parent_id: data.id,
                      } as RandomTableSubOptionType),
                    })
                  }
                  variant="info"
                />
              </div>
            </div>
            <div className="flex max-h-full flex-col gap-y-2 overflow-y-auto">
              {randomTableOption.suboptions?.map((suboption, index) => (
                <div key={suboption.id} className="flex flex-col gap-y-1">
                  <div className="flex flex-nowrap items-center gap-x-2 border-t border-zinc-700 pt-2">
                    <div className="flex flex-1 items-center gap-x-2">
                      <Input
                        label="Title (required)"
                        name={`suboptions[${index}].title`}
                        onChange={handleChange}
                        value={suboption?.title || ""}
                      />
                      <div className="h-10 w-min self-end">
                        <Button
                          hasNoBackground
                          icon={IconEnum.trash}
                          onClick={() => {
                            handleChange({
                              name: "suboptions",
                              value: randomTableOption.suboptions?.filter((subopt) => subopt.id !== suboption.id),
                            });
                          }}
                          variant="error"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Textarea
                      label="Description (optional)"
                      name={`suboptions[${index}].description`}
                      onChange={handleChange}
                      value={suboption?.description || ""}
                    />
                  </div>
                </div>
              ))}
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
              const { suboptions, ...rest } = randomTableOption;
              const parsedData = UpdateRandomTableOptionSchema.parse({ data: rest, relations: { suboptions } });
              await update(parsedData, {
                onSuccess: (d) => {
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
