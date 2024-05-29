import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useHandleChange } from "../../../hooks";
import { DocumentTemplateType } from "../../../types";
import { IconEnum } from "../../../utils";
import { InsertDocumentTemplateSchema } from "../../../validation";
import { MatchField } from "../../Complex";
import { Button, Input } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DocumentTemplateDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { mutate: create } = useCreateEntity("document_templates");
  const [template, setTemplate] = useState<Partial<DocumentTemplateType>>({ project_id, title: "", fields: [] });
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  return (
    <DrawerLayout>
      <Input
        label="Template's title (required)"
        name="title"
        onChange={handleChange}
        value={template.title}
        variant={template.title ? "primary" : "error"}
      />
      <Collapsible
        actions={[
          {
            variant: "info",
            icon: IconEnum.add,
            onClick: () =>
              handleChange({
                name: "fields",
                value: (template.fields || []).concat({
                  id: "",
                  key: "",
                  parent_id: "",
                  value: "",
                  formula: null,
                  derive: null,
                  entity_type: null,
                  is_randomized: null,
                }),
              }),
          },
        ]}
        initialOpen
        label="Keys">
        <div className="flex max-h-[80%] flex-col gap-y-2 overflow-auto p-2">
          {(template?.fields || [])?.map((f, idx) => (
            <MatchField
              key={f.id}
              allMatches={template?.fields || []}
              entity_type={f?.entity_type}
              handleChange={handleChange}
              idx={idx}
              is_randomized={f?.is_randomized}
              isEditable
              match={f?.key}
              value={f?.value}
            />
          ))}
        </div>
      </Collapsible>

      <Button
        icon={IconEnum.add}
        isDisabled={!template?.fields?.length || (template?.fields || []).some((v) => !v.value && !v.is_randomized)}
        label="Create"
        onClick={() => {
          const { fields, ...rest } = template;
          const parsed = InsertDocumentTemplateSchema.parse({
            data: rest,
            relations: { fields: (fields || [])?.map((f) => ({ data: f })) },
          });
          create(parsed);
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
