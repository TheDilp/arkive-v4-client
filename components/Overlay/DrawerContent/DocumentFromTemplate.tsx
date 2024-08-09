import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useAtomValue } from "jotai";
import ls from "localstorage-slim";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { findChildrenByNode, replaceNodeAtPosition } from "remirror";

import { useCreateEntity, useCreateFromTemplate, useGetEntity, useHandleChange } from "../../../hooks";
import { DocumentType, InsertDocumentType, TabType } from "../../../types";
import {
  DefaultTagColor,
  Dice,
  DiceRollParser,
  DocumentTemplateFieldRegex,
  getImageURL,
  getMatchFieldVariant,
  getSentenceCase,
  IconEnum,
  userAtom,
} from "../../../utils";
import { Editor, MatchField } from "../../Complex";
import { Button, Input } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { AutomentionDrawer } from "./AutomentionDrawer";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};

function getTabs(isPreviewDisabled: boolean): TabType[] {
  return [
    { id: "1", label: "Keys", icon: IconEnum.permissions },
    { id: "2", label: "Preview", icon: IconEnum.document, isDisabled: isPreviewDisabled },
    { id: "3", label: "Automention", icon: IconEnum.mention, isDisabled: isPreviewDisabled },
  ];
}

async function generateAllDiceRollFields({
  hasDiceRollFields,
  template_fields,
  setTemplate,
  content,
}: {
  hasDiceRollFields: boolean;
  template_fields: DocumentType["template_fields"];
  setTemplate: Dispatch<SetStateAction<Partial<DocumentType>>>;
  content: string;
}) {
  if (hasDiceRollFields) {
    let tempContent = content;
    const tempFields = [...(template_fields || [])];
    Dice.updateConfig({ themeColor: DefaultTagColor, suspendSimulation: true });
    for (let index = 0; index < tempFields?.length || 0; index += 1) {
      if (tempFields[index]?.entity_type === "dice_roll" && !!tempFields[index].formula) {
        const parsedNotation = await DiceRollParser.parseNotation(tempFields[index].formula);

        const r = Dice.roll(parsedNotation);

        const rollData = await DiceRollParser.parseFinalResults(r);

        if (rollData?.valid) {
          tempFields[index].value = rollData?.value?.toString() || "";
          tempContent = tempContent.replaceAll(`%{${tempFields[index].key}}%`, tempFields[index].value || "");
          const derivedFields = tempFields.filter((f) => f.derive_from === tempFields[index].id);
          for (let j = 0; j < derivedFields.length; j += 1) {
            if (derivedFields[j].derive_formula === "dnd_5e_ability_bonus") {
              derivedFields[j].value = Math.floor((Number(tempFields[index].value || 10) - 10) / 2).toString();
              tempContent = tempContent.replaceAll(`%{${derivedFields[j].key}}%`, derivedFields[j].value || "");
            }
          }
        }
      }
    }

    setTemplate((prev) => ({ ...prev, template_fields: tempFields, content: JSON.parse(tempContent) }));
    return tempContent;
  }
  return content;
}

export function DocumentFromTemplate({ data }: Props) {
  const { project_id } = useParams();
  const user = useAtomValue(userAtom);

  const defaultDiceColor = ls.get("default_dice_color");
  const {
    data: existingTemplate,
    isLoading,
    isFetching,
  } = useGetEntity<DocumentType>(
    data?.id,
    "documents",
    {
      fields: ["id"],
      relations: { template_fields: true },
    },
    {
      enabled: !!data?.id,
    }
  );

  const [previewContext, setPreviewContext] = useState<ReactFrameworkOutput<Remirror.Extensions> | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState(0);
  const [template, setTemplate] = useState<Partial<DocumentType>>({});
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  const { mutateAsync: generatePreview, isLoading: isGeneratingPreview } = useCreateFromTemplate(
    existingTemplate?.data?.id as string,
    project_id as string
  );

  const { mutate, isLoading: isCreating } = useCreateEntity<{
    data: Partial<InsertDocumentType> & { project_id: string };
    relations: { [key: string]: any };
  }>("documents");

  const isPreviewDisabled =
    !template?.template_fields?.length ||
    (template?.template_fields || []).some(
      (f) => !f.related.length && !f.is_randomized && f.entity_type !== "dice_roll" && f.entity_type !== "derived"
    ) ||
    isCreating ||
    isGeneratingPreview;

  const tabs = getTabs(isPreviewDisabled);

  const hasDiceRollFields = (template?.template_fields || []).some((f) => f.entity_type === "dice_roll");

  useEffect(() => {
    if (previewContext?.getState()?.doc && existingTemplate?.data && !template.template_fields) {
      // Replace with existing template
      const tempFields: DocumentType["template_fields"] = [];
      const { textContent } = data?.getContext?.getState()?.doc || { textContent: "" };
      if (textContent) {
        for (const match of textContent.matchAll(DocumentTemplateFieldRegex)) {
          const matchKey = match?.at(1) as string;
          const idx = existingTemplate?.data?.template_fields?.findIndex((f) => f?.key === matchKey);
          if (idx === -1 && match?.at(1)?.trim()) {
            tempFields.push({
              id: crypto.randomUUID(),
              value: "",
              formula: null,
              parent_id: "",
              entity_type: "documents",
              is_randomized: null,
              derive_formula: null,
              derive_from: null,
              related: [],
              additional_data: null,
              random_count: null,
              key: matchKey as string,
              sort: tempFields.length,
            });
          } else if (idx > -1 && match?.at(1)?.trim()) {
            tempFields.push(existingTemplate?.data?.template_fields?.[idx]);
          }
        }
        setTemplate((prev) => ({ ...prev, template_fields: tempFields }));
      } else {
        setTemplate((prev) => ({ ...prev, template_fields: existingTemplate?.data?.template_fields || [] }));
      }
    }
  }, [previewContext?.getState()?.doc, isGeneratingPreview, existingTemplate, isFetching]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const templateContent = previewContext?.getState().doc;
      if (templateContent && template.template_fields) {
        let contentToAlter = JSON.stringify(templateContent);
        const matches = template.template_fields || [];
        for (let index = 0; index < matches.length; index += 1) {
          if (matches[index].key && matches[index]?.value) {
            contentToAlter = contentToAlter.replaceAll(`%{${matches[index].key}}%`, matches[index]?.value || "");
          }
        }
        const newContent = JSON.parse(contentToAlter);
        const state = previewContext?.manager?.createState({ content: newContent });
        if (state) previewContext?.manager?.view?.updateState(state);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [template]);

  if (isLoading || isFetching) return <Skeleton type="drawer_form" />;
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
      </div>
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      {isGeneratingPreview ? null : (
        <div className={`flex max-h-[80%] flex-col gap-y-2 overflow-auto ${tabs[selectedTab].id === "1" ? "" : "hidden"}`}>
          {(template.template_fields || []).map((f, idx) => (
            <Collapsible key={f.id} label={getSentenceCase(f.key)} variant={getMatchFieldVariant(f)}>
              <div className="flex max-h-[80%] flex-col gap-y-2 overflow-auto p-2" key={f.id}>
                <MatchField
                  additional_data={f?.additional_data}
                  allMatches={template?.template_fields || []}
                  blueprint_id={f?.blueprint_id}
                  calendar_id={f?.calendar_id}
                  derive_formula={f.derive_formula}
                  derive_from={f.derive_from}
                  dictionary_id={f?.dictionary_id}
                  entity_type={f?.entity_type}
                  formula={f.formula}
                  handleChange={handleChange}
                  idx={idx}
                  is_randomized={f?.is_randomized}
                  map_id={f?.map_id}
                  match={f?.key}
                  random_count={f.random_count}
                  related={f?.related}
                  value={f?.value}
                />
              </div>
            </Collapsible>
          ))}
        </div>
      )}

      {isGeneratingPreview ? <Skeleton isFullWidth type="editor" /> : null}
      {isGeneratingPreview ? null : (
        <div className={`flex h-full justify-center ${tabs[selectedTab].id === "2" && !isGeneratingPreview ? "" : "hidden"}`}>
          <div className="w-full [&>.editor-component]:bg-zinc-800">
            <Editor
              // @ts-ignore
              initialContent={previewContext?.getState()?.doc || undefined}
              isDisabled
              isFullHeight
              isOutsideControlled
              isReadOnly
              setContext={setPreviewContext}
            />
          </div>
        </div>
      )}

      {tabs[selectedTab].id === "3" && previewContext ? (
        <div className="flex h-full justify-center">
          <AutomentionDrawer data={{ getContext: previewContext, id: data.id, title: data.title }} />
        </div>
      ) : null}
      <div className="flex flex-nowrap gap-x-2">
        <Button
          icon={IconEnum.add}
          isDisabled={isPreviewDisabled}
          label="Generate preview"
          onClick={async () => {
            const c = await generateAllDiceRollFields({
              hasDiceRollFields,
              template_fields: template?.template_fields || [],
              setTemplate,
              content: JSON.stringify(data.getContext.getState().doc),
            });
            Dice.updateConfig({
              themeColor: defaultDiceColor || user?.feature_flags?.default_dice_color || DefaultTagColor,
              suspendSimulation: true,
            });

            await generatePreview(
              {
                data: {
                  project_id: project_id as string,
                  title: template.title || "",
                  content: c,
                },
                relations: { template_fields: template?.template_fields || [] },
              },
              {
                onSuccess: (res: { data: DocumentType }) => {
                  if (res?.data && res?.data?.content) {
                    // setContent(res?.data?.content as any);
                    const state = previewContext?.manager?.createState({
                      content: JSON.parse(res?.data?.content as string),
                    });
                    if (state) {
                      previewContext?.manager?.view?.updateState(state);
                      const imageFields = (template?.template_fields || []).filter((f) => f.entity_type === "images");
                      if (imageFields.length) {
                        const imageKeys = imageFields.map((f) => `%{${f.key}}%`);
                        const textNodeType = previewContext?.getState()?.schema?.nodes?.text;
                        if (textNodeType) {
                          const nodes = findChildrenByNode({
                            node: previewContext?.getState()?.doc,
                            type: textNodeType,
                          });

                          nodes
                            .map((node) => ({ text: node.node.textContent.trim(), pos: node.pos }))
                            .filter((node) => imageKeys.includes(node.text))
                            .forEach((node) => {
                              const nodeField = imageFields.find((field) => `%{${field.key}}%` === node.text.trim());
                              if (nodeField) {
                                const tr = replaceNodeAtPosition({
                                  pos: node.pos,
                                  tr: previewContext?.view?.state?.tr,
                                  content: previewContext?.getState()?.schema?.nodes.image.create({
                                    id: nodeField?.related?.[0],
                                    alt: nodeField?.additional_data?.title || "template",
                                    src: getImageURL(project_id as string, "images", nodeField?.related?.[0]),
                                    crop: null,
                                    title: nodeField?.additional_data?.title,
                                    width: nodeField?.additional_data?.width || 250,
                                    height: nodeField?.additional_data?.height || 250,
                                    rotate: null,
                                    fileName: nodeField?.additional_data?.title,
                                    resizable: false,
                                  }),
                                });
                                previewContext?.view?.dispatch(tr);
                              }
                            });
                        }
                      }
                    }

                    setSelectedTab(1);
                  }
                },
              }
            );
          }}
          variant="info"
        />
        <Button
          icon={IconEnum.add}
          isDisabled={
            !template?.title ||
            !template?.template_fields?.length ||
            (template?.template_fields || []).some(
              (f) => !f.value && !f.is_randomized && (f.entity_type === "blueprint_instances" ? !f.related.length : false)
            ) ||
            isCreating ||
            isGeneratingPreview
          }
          isLoading={isCreating}
          label="Create document"
          onClick={() =>
            mutate(
              {
                data: {
                  project_id: project_id as string,
                  title: template.title || "",
                  content: JSON.stringify(previewContext?.getState()?.doc || {}),
                },
                relations: { template_fields: template?.template_fields || [] },
              },
              {
                onSuccess: (res: { data: DocumentType }) => {
                  if (res?.data && res?.data?.content) {
                    setSelectedTab(1);
                  }
                },
              }
            )
          }
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
