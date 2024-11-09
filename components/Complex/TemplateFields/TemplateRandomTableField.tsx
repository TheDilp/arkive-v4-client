import { BlueprintFieldType, FieldDataType, HandleChangePropsType } from "../../../types";
import { chooseRandomItems, IconEnum } from "../../../utils";
import { Button, Select } from "../../Form";
import { FormFieldContainer, TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isDrawer?: boolean;
  isReadOnly?: boolean;
  isOpen?: boolean;
  currentValue: FieldDataType["random_table"] | null;
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
  isDrawer,
  isReadOnly,
  isDisabled,
  isOpen,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <FormFieldContainer isDrawer={isDrawer}>
        <div className="flex flex-nowrap items-center gap-x-2">
          <Select
            hasSearch
            isClearable
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
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
            variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
          />
          {isDisabled || isReadOnly ? null : (
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
          )}
        </div>
      </FormFieldContainer>
    </TemplateFieldContainer>
  );
}
