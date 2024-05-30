/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateFromTemplate, useGetEntity, useHandleChange } from "../../../hooks";
import { DocumentType, TabType } from "../../../types";
import { DefaultTagColor, Dice, DiceRollParser, DocumentTemplateFieldRegex, getSentenceCase, IconEnum } from "../../../utils";
import { Editor, MatchField } from "../../Complex";
import { Button, Input } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

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
  const { project_id } = useParams();

  const { data: existingTemplate, isLoading } = useGetEntity<DocumentType>(
    data?.id,
    "documents",
    {
      fields: ["id"],
      relations: { template_fields: true },
    },
    {
      enabled: !!data?.id,
    },
  );

  const [selectedTab, setSelectedTab] = useState(0);
  const [content, setContent] = useState(data.getContext.getState().doc);
  const [template, setTemplate] = useState<Partial<DocumentType>>({});
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  const { mutateAsync: createDocumentFromTemplate, isLoading: isCreating } = useCreateFromTemplate(
    existingTemplate?.data?.id as string,
    project_id as string,
  );

  const hasDiceRollFields = (template?.template_fields || []).some((f) => f.entity_type === "dice_roll");

  useEffect(() => {
    if (content && existingTemplate?.data) {
      // Replace with existing template
      const tempFields: DocumentType["template_fields"] = existingTemplate?.data?.template_fields || [];
      const { textContent } = content;
      if (textContent) {
        for (const match of textContent.matchAll(DocumentTemplateFieldRegex)) {
          const matchKey = match?.at(1) as string;
          const idx = tempFields?.findIndex((f) => f?.key === matchKey);
          if (idx === -1 && match?.at(1)?.trim()) {
            tempFields[tempFields.length] = {
              id: crypto.randomUUID(),
              value: "",
              formula: null,
              parent_id: "",
              entity_type: null,
              is_randomized: null,
              derive_formula: null,
              derive_from: null,
              related_id: null,
              key: matchKey as string,
              sort: tempFields.length,
            };
          }
        }
        setTemplate((prev) => ({ ...prev, template_fields: tempFields }));
      } else {
        setTemplate((prev) => ({ ...prev, template_fields: existingTemplate?.data?.template_fields || [] }));
      }
    }
  }, [existingTemplate]);
  useEffect(() => {
    const templateContent = data.getContext.getState().doc;
    if (templateContent && template.template_fields) {
      let contentToAlter = JSON.stringify(templateContent);
      const matches = template.template_fields || [];
      for (let index = 0; index < matches.length; index += 1) {
        if (matches[index].key && matches[index]?.value) {
          contentToAlter = contentToAlter.replaceAll(`%{${matches[index].key}}%`, matches[index]?.value || "");
        }
      }
      const newContent = JSON.parse(contentToAlter);
      const state = data.getContext.manager.createState({ content: newContent });
      setContent(state.doc);
    }
  }, [template]);

  if (!data.getContext.getState().doc.content) return null;
  if (isLoading) return <Skeleton type="drawer_form" />;
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
        {hasDiceRollFields ? (
          <div className="w-24 self-end">
            <Button
              icon={IconEnum.d20}
              label="Roll all"
              onClick={async () => {
                if (hasDiceRollFields) {
                  const tempFields = [...(template?.template_fields || [])];
                  Dice.updateConfig({ themeColor: DefaultTagColor, suspendSimulation: true });

                  for (let index = 0; index < tempFields?.length || 0; index += 1) {
                    if (tempFields[index]?.entity_type === "dice_roll" && !!tempFields[index].formula) {
                      const parsedNotation = await DiceRollParser.parseNotation(tempFields[index].formula);
                      const r = await Dice.roll(parsedNotation);
                      const rollData = await DiceRollParser.parseFinalResults(r);
                      if (rollData?.valid) {
                        tempFields[index].value = rollData?.value?.toString() || "";
                        const derivedFields = tempFields.filter((f) => f.derive_from === tempFields[index].id);
                        for (let j = 0; j < derivedFields.length; j += 1) {
                          if (derivedFields[j].derive_formula === "dnd_5e_ability_bonus") {
                            derivedFields[j].value = Math.floor((Number(tempFields[index].value || 10) - 10) / 2).toString();
                          }
                        }
                      }
                    }
                  }

                  setTemplate((prev) => ({ ...prev, template_fields: tempFields }));
                }
              }}
              variant="info"
            />
          </div>
        ) : null}
      </div>
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      <div className={`flex max-h-[80%] flex-col gap-y-2 overflow-auto ${tabs[selectedTab].id === "1" ? "" : "hidden"}`}>
        {(template.template_fields || []).map((f, idx) => (
          <Collapsible label={getSentenceCase(f.key)}>
            <div key={f.id} className="flex max-h-[80%] flex-col gap-y-2 overflow-auto p-2">
              <MatchField
                allMatches={template?.template_fields || []}
                derive_formula={f.derive_formula}
                derive_from={f.derive_from}
                entity_type={f?.entity_type}
                formula={f.formula}
                handleChange={handleChange}
                idx={idx}
                is_randomized={f?.is_randomized}
                match={f?.key}
                related_id={f?.related_id}
                value={f?.value}
              />
            </div>
          </Collapsible>
          // <MatchField
          //   key={f.id}
          //   allMatches={template?.template_fields || []}
          //   derive_formula={f.derive_formula}
          //   derive_from={f.derive_from}
          //   entity_type={f.entity_type}
          //   formula={f.formula}
          //   handleChange={handleChange}
          //   idx={idx}
          //   is_randomized={false}
          //   match={f.key}
          //   value={f?.value || ""}
          // />
        ))}
      </div>
      {tabs[selectedTab].id === "2" ? (
        <div className="flex h-full justify-center">
          <div className="w-full [&>.editor-component]:bg-zinc-800">
            {/* @ts-ignore */}
            <Editor initialContent={content || undefined} isDisabled isFullHeight isOutsideControlled isReadOnly />
          </div>
        </div>
      ) : null}

      <Button
        icon={IconEnum.add}
        isDisabled={
          !template?.title ||
          !template?.template_fields?.length ||
          (template?.template_fields || []).some((f) => !f.value && !f.is_randomized && !f.related_id) ||
          isCreating
        }
        label="Create"
        onClick={() => {
          createDocumentFromTemplate({
            data: { title: template.title || "", content },
            relations: { template_fields: template?.template_fields || [] },
          });
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
