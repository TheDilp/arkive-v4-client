import { HandleChangePropsType } from "../../../types";
import { Checkbox } from "../../Form";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: boolean | null;
};

export function TemplateBooleanField({ title, name, currentValue, handleChange, id }: Props) {
  return (
    <div className="flex flex-nowrap justify-between">
      <span>{title}</span>
      <Checkbox
        name={name}
        onChange={({ value }) =>
          handleChange([
            { name: `${name}.id`, value: id },
            { name: `${name}.value`, value: { value } },
          ])
        }
        value={currentValue as boolean}
      />
    </div>
  );
}
