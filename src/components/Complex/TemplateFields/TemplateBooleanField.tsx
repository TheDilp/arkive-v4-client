import { HandleChangePropsType } from "../../../types";
import { Checkbox } from "../../Form";
import { Collapsible } from "../../Layout";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: boolean | null;
};

export function TemplateBooleanField({ title, name, currentValue, handleChange, id }: Props) {
  return (
    <Collapsible label={title}>
      <div className="flex flex-nowrap justify-end">
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
    </Collapsible>
  );
}
