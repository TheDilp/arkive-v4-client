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
  isDisabled?: boolean;
};

export function TemplateTextareaField({ isDisabled, title, name, currentValue, handleChange, id, isCollapsible }: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-[30rem] min-h-fit flex-col">
        <span className="text-sm text-zinc-300">{title}</span>
        <Editor
          initialContent={currentValue as any}
          isDisabled={isDisabled}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
        />
      </div>
    </TemplateFieldContainer>
  );
}
