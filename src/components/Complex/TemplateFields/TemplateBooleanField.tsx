import { HandleChangePropsType } from "../../../types";
import { Checkbox } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: boolean | null;
  isCollapsible?: boolean;
};

export function TemplateBooleanField({ title, name, currentValue, handleChange, id, isCollapsible }: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex flex-nowrap justify-end">
        <Checkbox
          isReadOnly
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
          value={currentValue as boolean}
        />
      </div>
    </TemplateFieldContainer>
  );
}
