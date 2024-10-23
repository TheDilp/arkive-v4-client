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
  isOpen?: boolean;
};

export function TemplateBooleanField({
  isDisabled,
  isOpen,
  title,
  name,
  currentValue,
  handleChange,
  id,
  isCollapsible,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className="col-span-1 md:col-span-1">
        <Checkbox
          isDisabled={isDisabled}
          label={title}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
          value={currentValue as boolean}
          variant="secondary"
        />
      </div>
    </TemplateFieldContainer>
  );
}
