/* eslint-disable no-restricted-syntax */
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useEffect, useState } from "react";

import { useGetEntity, useHandleChange } from "../../../hooks";
import { DocumentTemplateType, TabType } from "../../../types";
import { DocumentTemplateFieldRegex, IconEnum } from "../../../utils";
import { Editor, MatchField } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};

const tabs: TabType[] = [
  { id: "1", label: "Keys", icon: IconEnum.permissions },
  { id: "2", label: "Preview", icon: IconEnum.document },
  { id: "3", label: "Automention", icon: IconEnum.mention },
];

export function DocumentFromTemplate({ data }: Props) {
  // const { project_id } = useParams();

  const [existingTemplateId, setExistingTemplateId] = useState<string | undefined>(undefined);

  const { data: existingTemplateData } = useGetEntity<DocumentTemplateType>(
    existingTemplateId,
    "document_templates",
    {
      fields: ["id", "owner_id", "title"],
      relations: { fields: true },
    },
    {
      enabled: !!existingTemplateId,
    },
  );

  const [selectedTab, setSelectedTab] = useState(0);
  const [content] = useState(data.getContext.getState().doc);
  const [existingTemplate, setExistingTemplate] = useState<DocumentTemplateType | null>();
  const [template, setTemplate] = useState<Partial<DocumentTemplateType>>({ fields: [] });
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  // const { mutateAsync: createDocumentFromTemplate, isLoading } = useCreateFromTemplate(project_id as string);

  useEffect(() => {
    if (existingTemplateData?.data) setExistingTemplate(existingTemplateData?.data);
  }, [existingTemplateData]);
  useEffect(() => {
    if (existingTemplate) {
      const temp = { ...template };
      for (let index = 0; index < existingTemplate.fields.length || 0; index += 1) {
        const field = existingTemplate.fields[index];

        const idx = (template.fields || []).findIndex((f) => f.key === field.key);
        if (typeof idx === "number" && idx > -1 && temp.fields) {
          temp.fields[idx] = field;
        }
      }
      setTemplate(temp);
    }
  }, [existingTemplateId, existingTemplate]);

  useEffect(() => {
    if (content) {
      // Replace with existing template
      const tempFields: DocumentTemplateType["fields"] = [];
      const { textContent } = content;
      if (textContent) {
        for (const match of textContent.matchAll(DocumentTemplateFieldRegex)) {
          const matchKey = match?.at(1) as string;
          const idx = tempFields.findIndex((f) => f?.key === matchKey);
          if (idx > -1) {
            if (match?.at(1)) {
              tempFields[idx] = { ...tempFields[idx], key: matchKey as string };
            }
          } else if (idx === -1 && match?.at(1)) {
            tempFields[tempFields.length] = {
              id: crypto.randomUUID(),
              value: "",
              formula: null,
              parent_id: "",
              entity_type: null,
              is_randomized: null,
              derive_formula: null,
              derive_from: null,
              key: matchKey as string,
            };
          }
        }
        setTemplate((prev) => ({ ...prev, fields: tempFields }));
      }
    }
  }, []);

  useEffect(() => {
    // const templateContent = data.getContext.getState().doc;
    // if (templateContent && template.matches) {
    //   let contentToAlter = JSON.stringify(templateContent);
    //   const matches = Object.entries(template.matches);
    //   for (let index = 0; index < matches.length; index += 1) {
    //     if (matches[index][0] && matches[index][1]?.value) {
    //       contentToAlter = contentToAlter.replaceAll(`%{${matches[index][0]}}%`, matches[index][1]?.value);
    //     }
    //   }
    //   const newContent = JSON.parse(contentToAlter);
    //   const state = data.getContext.manager.createState({ content: newContent });
    //   setContent(state.doc);}
  }, [template]);

  if (!data.getContext.getState().doc.content) return null;
  return (
    <DrawerLayout>
      <div className="flex flex-nowrap gap-x-2">
        <Input
          label="New document's title (required)"
          name="title"
          onChange={handleChange}
          value={template?.title || ""}
          variant={template?.title ? "primary" : "error"}
        />
        {existingTemplate ? (
          <div className="min-w-64">
            <EntityPreview
              clearAction={() => {
                setExistingTemplate(null);
              }}
              id={existingTemplate?.id}
              label="Template"
              title={existingTemplate?.title}
              type="document_templates"
            />
          </div>
        ) : (
          <Search
            label="Use template (optional)"
            name="template"
            onChange={({ value }) => setExistingTemplateId(value as string)}
            searchEntity="document_templates"
          />
        )}
      </div>
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      <div className={`flex max-h-[80%] flex-col gap-y-2 overflow-auto ${tabs[selectedTab].id === "1" ? "" : "hidden"}`}>
        {(template.fields || []).map((f, idx) => (
          <MatchField
            key={f.id}
            allMatches={template?.fields || []}
            entity_type={f.entity_type}
            formula={f.formula}
            handleChange={handleChange}
            idx={idx}
            is_randomized={false}
            match={f.key}
            value={f?.value || ""}
          />
        ))}
      </div>
      {tabs[selectedTab].id === "2" ? (
        <div className="flex h-full justify-center">
          <div className="lg:max-w-[60%] [&>.editor-component]:bg-zinc-800">
            {/* @ts-ignore */}
            <Editor initialContent={content || undefined} isDisabled isFullHeight isOutsideControlled isReadOnly />
          </div>
        </div>
      ) : null}

      <Button
        icon={IconEnum.add}
        isDisabled
        label="Create"
        onClick={() => {
          // createDocumentFromTemplate(template);
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
