import { HandleChangePropsType } from "../../../types";
import { Input } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "text" | "number";
  currentValue: string | number | null;
  isCollapsible?: boolean;
  isDisabled?: boolean;
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
  isDisabled,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className={`col-span-1 md:col-span-1 ${IS_GATEWAY ? "lg:col-span-1" : "lg:col-span-2"}`}>
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
          variant={IS_GATEWAY ? "primary" : "secondary"}
        />
      </div>
    </TemplateFieldContainer>
  );
}
