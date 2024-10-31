import { RemirrorJSON } from "remirror";

import { HandleChangePropsType } from "../../../types";
import { Editor } from "../Editor";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: RemirrorJSON;
  isCollapsible?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isDrawer?: boolean;
  isOpen?: boolean;
};

export function TemplateTextareaField({
  isDisabled,
  isOpen,
  title,
  name,
  currentValue,
  handleChange,
  id,
  isDrawer,
  isReadOnly,
  isCollapsible,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      {/* Textarea should always span all columns */}
      <div className={"col-span-1 flex max-h-[30rem] min-h-fit flex-col gap-x-2 gap-y-4 md:col-span-2 lg:col-span-4"}>
        <Editor
          initialContent={currentValue as any}
          isDisabled={isDisabled}
          isPrintable
          isReadOnly={isReadOnly}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
          variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
        />
      </div>
    </TemplateFieldContainer>
  );
}
