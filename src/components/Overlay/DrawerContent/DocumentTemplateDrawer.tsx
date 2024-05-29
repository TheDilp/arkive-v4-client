import omit from "lodash.omit";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useToggledResetAtom, useUpdateEntity } from "../../../hooks";
import { DocumentTemplateType } from "../../../types";
import { IconEnum } from "../../../utils";
import { InsertDocumentTemplateSchema, UpdateDocumentTemplateSchema, UpdateDocumentTemplateType } from "../../../validation";
import { MatchField } from "../../Complex";
import { Button, Input } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
  };
};

export default function DocumentTemplateDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { mutate: create, isLoading: isCreating } = useCreateEntity("document_templates");
  const { mutate: update, isLoading: isUpdating } = useUpdateEntity<UpdateDocumentTemplateType>(
    "document_templates",
    project_id as string,
  );
  const resetDrawer = useToggledResetAtom();
  const [template, setTemplate] = useState<Partial<DocumentTemplateType> | null>(null);

  const {
    data: existingTemplate,
    isLoading,
    isFetching,
  } = useGetEntity<DocumentTemplateType>(
    data?.id,
    "document_templates",
    {
      data: {},
      fields: ["id", "title", "owner_id", "project_id"],
      relations: { fields: true },
    },
    { enabled: !!data?.id },
  );

  useEffect(() => {
    if (existingTemplate?.data && !template) {
      setTemplate(existingTemplate?.data);
    }
  }, [existingTemplate]);

  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });

  if (isLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Input
        label="Template's title (required)"
        name="title"
        onChange={handleChange}
        value={template?.title}
        variant={template?.title ? "primary" : "error"}
      />
      <Collapsible
        actions={[
          {
            variant: "info",
            icon: IconEnum.add,
            onClick: () =>
              handleChange({
                name: "fields",
                value: (template?.fields || []).concat({
                  id: "",
                  key: "",
                  parent_id: "",
                  value: "",
                  formula: null,
                  derive_formula: null,
                  derive_from: null,
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
              formula={f.formula}
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
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={
          isCreating ||
          isUpdating ||
          isFetching ||
          !template?.fields?.length ||
          (template?.fields || []).some((v) => !v.value && !v.is_randomized)
        }
        isLoading={isCreating || isUpdating || isLoading || isFetching}
        label={data?.id ? "Update" : "Create"}
        onClick={() => {
          if (data?.id && existingTemplate?.data && template) {
            const { fields, ...rest } = template;

            const parsed = UpdateDocumentTemplateSchema.parse({
              data: omit(rest, ["owner_id"]),
              relations: { fields: (fields || [])?.map((f) => ({ data: omit(f, ["parent_id"]) })) },
            });
            update(parsed, { onSuccess: () => resetDrawer() });
          } else if (!data?.id && template) {
            const { fields, ...rest } = template;
            const parsed = InsertDocumentTemplateSchema.parse({
              data: rest,
              relations: { fields: (fields || [])?.map((f) => ({ data: f })) },
            });
            create(parsed, { onSuccess: () => setTemplate(null) });
          }
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
