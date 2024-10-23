import { HandleChangePropsType } from "../../../types";
import { Select } from "../../Form";
import { TemplateFieldContainer } from ".";

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
  isEditEnabled?: boolean;
  isOpen?: boolean;
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
  isOpen,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className="col-span-1 md:col-span-2">
        <Select
          hasSearch
          isClearable
          isDisabled={isDisabled}
          isMultiple={fieldType === "select_multiple"}
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
          variant="secondary"
        />
      </div>
    </TemplateFieldContainer>
  );
}
