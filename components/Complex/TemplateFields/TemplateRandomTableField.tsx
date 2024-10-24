import { BlueprintFieldType, BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { chooseRandomItems, IconEnum } from "../../../utils";
import { Button, Select } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["random_table"] | null;
  random_table?: BlueprintFieldType["random_table"];
};

export function TemplateRandomTableField({
  title,
  name,
  id,
  currentValue,
  handleChange,
  random_table,
  isCollapsible,
  isDisabled,
  isOpen,
}: Props) {
  const availableSuboptions = random_table?.random_table_options?.find(
    (opt) => opt?.id === currentValue?.option_id
  )?.random_table_suboptions;

  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className={`col-span-1 flex flex-col gap-y-1 ${IS_GATEWAY ? "md:col-span-1" : "md:col-span-2"}`}>
        <div className="flex flex-nowrap items-center gap-x-2">
          <Select
            hasSearch
            isClearable
            isDisabled={isDisabled}
            isReadOnly
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
            variant={IS_GATEWAY ? "primary" : "secondary"}
          />
          <div className="flex self-end pb-1.5">
            <Button
              hasNoBackground
              icon={IconEnum.d20}
              iconSize={24}
              isDisabled={isDisabled}
              isIconOnly
              onClick={() => {
                const items = chooseRandomItems(random_table?.random_table_options || [], 1);
                if (items?.[0]) {
                  const { id: option_id } = items[0];

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.random_table.related_id`,
                      value: random_table?.id,
                    },
                    {
                      name: `${name}.random_table.option_id`,
                      value: option_id,
                    },
                  ]);
                }
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
                isDisabled={isDisabled}
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
                variant={IS_GATEWAY ? "primary" : "secondary"}
              />
              <div className="flex self-end pb-1.5" />
            </div>
          ) : null}
        </div>
      </div>
    </TemplateFieldContainer>
  );
}
