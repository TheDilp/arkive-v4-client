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
  isDisabled?: boolean;
};

export function TemplateBooleanField({ isDisabled, title, name, currentValue, handleChange, id, isCollapsible }: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex flex-nowrap justify-end">
        <Checkbox
          isDisabled={isDisabled}
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
