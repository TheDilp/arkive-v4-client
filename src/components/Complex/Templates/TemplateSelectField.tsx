import { HandleChangePropsType } from "../../../types";
import { Select } from "../../Form";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "select" | "select_multiple";
  currentValue: string | string[] | null;
  options: { id: string; value: string }[];
};

export function TemplateSelectField({ title, name, handleChange, id, fieldType, currentValue, options }: Props) {
  return (
    <Select
      hasSearch
      isClearable
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
    />
  );
}
