import { HandleChangePropsType } from "../../../types";
import { Select } from "../../Form";
import { FormFieldContainer, TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "select" | "select_multiple";
  currentValue: string | string[] | null;
  options: { id: string; value: string }[];
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isOpen?: boolean;
  isDrawer?: boolean;
};

export function TemplateSelectField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  options,
  isCollapsible,
  isDisabled,
  isDrawer,
  isReadOnly,
  isOpen,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <FormFieldContainer isDrawer={isDrawer}>
        <Select
          hasSearch
          isClearable
          isDisabled={isDisabled}
          isMultiple={fieldType === "select_multiple"}
          isReadOnly={isReadOnly}
          label={title}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
          options={options?.map((opt) => ({ label: opt.value, value: opt.id })) || []}
          value={currentValue as string | string[]}
          variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
        />
      </FormFieldContainer>
    </TemplateFieldContainer>
  );
}
