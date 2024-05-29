import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useEffect, useState } from "react";

import { useHandleChange } from "../../../hooks";
import { DocumentTemplateType, TabType } from "../../../types";
import { IconEnum } from "../../../utils";
import { Editor } from "../../Complex";
import { Button, Input } from "../../Form";
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [content] = useState(data.getContext.getState().doc);
  const [template, setTemplate] = useState<DocumentTemplateType | null>(null);
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  // const { mutateAsync: createDocumentFromTemplate, isLoading } = useCreateFromTemplate(project_id as string);

  useEffect(() => {
    if (content) {
      // const tempMatches = { ...template.matches };
      // const { textContent } = content;
      // if (textContent) {
      //   for (const match of textContent.matchAll(DocumentTemplateFieldRegex)) {
      //     const matchKey = match?.at(1) as string;
      //     if (match?.at(1) && !tempMatches[matchKey]) {
      //       tempMatches[matchKey] = { type: null, value: "" };
      //     }
      //   }
      //   setTemplate((prev) => ({ ...prev, matches: tempMatches }));
      // }
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
      <Input
        label="New document's title (required)"
        name="title"
        onChange={handleChange}
        value={template?.title || ""}
        variant={template?.title ? "primary" : "error"}
      />
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      <div className={`flex max-h-[80%] flex-col gap-y-2 overflow-auto ${tabs[selectedTab].id === "1" ? "" : "hidden"}`}>
        {/* {Object.entries(template.matches).map(([key, value]) => (
          <MatchField
            key={key}
            allMatches={template.matches}
            handleChange={handleChange}
            match={key}
            type={value?.type}
            value={value?.value}
          />
        ))} */}
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
