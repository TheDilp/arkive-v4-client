import { RemirrorJSON } from "remirror";

import { HandleChangePropsType } from "../../../types";
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
    <div className="flex max-h-[30rem] min-h-fit flex-col">
      <span className="text-sm text-zinc-300">{title}</span>
      <Editor
        initialContent={currentValue as any}
        name={name}
        onChange={({ value }) =>
          handleChange([
            { name: `${name}.id`, value: id },
            { name: `${name}.value`, value: { value } },
          ])
        }
      />
      {/* <Textarea
        label={title}
      name={name}
        onChange={({ value }) => {
          handleChange({ name, value: { id, value } });
        }}
        value={currentValue as string}
      /> */}
    </div>
  );
}
