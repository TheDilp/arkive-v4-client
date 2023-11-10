import { RemirrorJSON } from "remirror";

import { HandleChangePropsType } from "../../../types";
import { Collapsible } from "../../Layout";
import { Editor } from "../Editor";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: RemirrorJSON;
};

export function TemplateTextareaField({ title, name, currentValue, handleChange, id }: Props) {
  return (
    <Collapsible label={title}>
      <div className="flex max-h-[30rem] min-h-fit flex-col p-2">
        <span className="text-sm text-zinc-300">{title}</span>
        <Editor
          initialContent={currentValue as any}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
        />
      </div>
    </Collapsible>
  );
}
