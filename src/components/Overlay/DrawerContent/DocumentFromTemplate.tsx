import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateFromTemplate, useHandleChange, useToggledResetAtom } from "../../../hooks";
import { IconEnum } from "../../../utils";
import { Button, Input, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id: string;
    title: string;
  };
};

export function DocumentFromTemplate({ data }: Props) {
  const { project_id } = useParams();
  const [template, setTemplate] = useState<{ titles: string[]; count: number }>({ titles: [], count: 1 });
  const resetDrawer = useToggledResetAtom();
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  const { mutateAsync: createDocumentFromTemplate, isLoading } = useCreateFromTemplate(project_id as string);

  return (
    <DrawerLayout>
      <Input
        label="Count (min 1, max 10)"
        max={10}
        min={1}
        name="count"
        onChange={handleChange}
        type="number"
        value={template.count}
      />
      <Title isDrawerTitle label="Documents" />
      {[...Array(template.count).keys()].map((index) => (
        <Input
          label="Rename document (optional)"
          name={`titles[${index}]`}
          onChange={handleChange}
          placeholder="Enter custom name"
          value={template?.titles?.[index] ?? data.title}
        />
      ))}
      <Button
        icon={IconEnum.add}
        isDisabled={isLoading}
        isLoading={isLoading}
        label="Create"
        onClick={async () => {
          createDocumentFromTemplate(
            {
              id: data.id,
              titles: template.titles.slice(0, template.count),
              count: template.count,
            },
            { onSuccess: resetDrawer },
          );
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
