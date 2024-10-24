import { HandleChangePropsType } from "../../../types";
import { Input } from "../../Form";
import { FormFieldContainer, TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "text" | "number";
  currentValue: string | number | null;
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isDrawer?: boolean;
  isOpen?: boolean;
};

export function TemplateInputField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  isCollapsible,
  isOpen,
  isDrawer,
  isDisabled,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <FormFieldContainer isDrawer={isDrawer}>
        <Input
          isDisabled={isDisabled}
          label={isCollapsible ? "" : title}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
          type={fieldType}
          value={currentValue || ""}
          variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
        />
      </FormFieldContainer>
    </TemplateFieldContainer>
  );
}
