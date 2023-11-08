import { useQuery } from "@tanstack/react-query";

import { BlueprintFieldType, BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { baseURLS, FetchFunction, IconEnum } from "../../../utils";
import { Button, Select } from "../../Form";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: BlueprintInstanceBlueprintFieldType["random_table"] | null;
  random_table?: BlueprintFieldType["random_table"];
};

export function TemplateRandomTableField({ title, name, id, currentValue, handleChange, random_table }: Props) {
  const { refetch, isFetching } = useQuery({
    // @ts-ignore
    queryKey: ["allEntities", "random_table_options", "random_roll", random_table?.id],

    queryFn: async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/random_table_options/random/${random_table?.id || ""}`,
        body: JSON.stringify({
          data: {
            count: 1,
          },
        }),
        method: "POST",
      }),

    enabled: false,
  });
  const availableSuboptions = random_table?.random_table_options?.find(
    (opt) => opt?.id === currentValue?.option_id,
  )?.random_table_suboptions;
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-nowrap items-center gap-x-2">
        <Select
          hasSearch
          isClearable
          isDisabled={isFetching}
          label={title}
          name={`${name}`}
          onChange={({ value }) => {
            handleChange([
              { name: `${name}.id`, value: id },
              {
                name: `${name}.random_table.related_id`,
                value: random_table?.id,
                // subOptionValue: res?.data?.data?.[0]?.subitem_id,
              },
              {
                name: `${name}.random_table.option_id`,
                value,
                // subOptionValue: res?.data?.data?.[0]?.subitem_id,
              },
            ]);
          }}
          options={(random_table?.random_table_options || []).map((opt) => ({ label: opt.title, value: opt.id }))}
          value={currentValue?.option_id || ""}
        />
        <div className="flex self-end pb-1.5">
          <Button
            hasNoBackground
            icon={IconEnum.d20}
            iconSize={24}
            isIconOnly
            isLoading={isFetching}
            onClick={async () => {
              refetch().then((res) => {
                if (res?.data?.data?.[0]?.title) {
                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.random_table.related_id`,
                      value: random_table?.id,
                      // subOptionValue: res?.data?.data?.[0]?.subitem_id,
                    },
                    {
                      name: `${name}.random_table.option_id`,
                      value: res?.data?.data?.[0]?.id,
                      // subOptionValue: res?.data?.data?.[0]?.subitem_id,
                    },
                  ]);
                }
              });
            }}
            tooltip={`Roll ${random_table?.title ? `(${random_table?.title})` : ""}`}
          />
        </div>
      </div>
      <div className="flex flex-col pl-4 pr-[1.55rem]">
        {availableSuboptions?.length ? (
          <div className="flex flex-nowrap gap-x-2">
            <Select
              isClearable
              name={name}
              onChange={({ value }) =>
                handleChange([
                  {
                    name: `${name}.random_table.suboption_id`,
                    value,
                  },
                ])
              }
              options={availableSuboptions.map((subopt) => ({ label: subopt.title, value: subopt.id }))}
              value={currentValue?.suboption_id || ""}
            />
            <div className="flex self-end pb-1.5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
