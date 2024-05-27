/* eslint-disable no-restricted-syntax */
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useHandleChange } from "../../../hooks";
import { HandleChangePropsType, SearchableMentionEntities } from "../../../types";
import { AvailableIcons, IconEnum } from "../../../utils";
import { Editor } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Select } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};

type MatchType = SearchableMentionEntities | "custom";
type FromTemplateType = {
  id_template: string;
  project_id: string;
  title: string;
  matches: Record<string, string>;
};
const MatchReplacementOptions: { label: string; value: MatchType; icon: AvailableIcons }[] = [
  {
    label: "Characters",
    value: "characters",
    icon: IconEnum.character,
  },
  {
    label: "Blueprints",
    value: "blueprint_instances",
    icon: IconEnum.blueprint,
  },
  {
    label: "Documents",
    value: "documents",
    icon: IconEnum.document,
  },
  {
    label: "Maps",
    value: "maps",
    icon: IconEnum.map,
  },
  {
    label: "Map pins",
    value: "map_pins",
    icon: IconEnum.map_pin,
  },
  {
    label: "Graph",
    value: "graphs",
    icon: IconEnum.graph,
  },
  {
    label: "Words",
    value: "words",
    icon: IconEnum.word,
  },
  {
    label: "Custom",
    value: "custom",
    icon: IconEnum.additional_fields,
  },
];

function MatchField({
  match,
  value,
  handleChange,
}: {
  match: string;
  value: string;
  handleChange: (props: HandleChangePropsType) => void;
}) {
  const [parent, setParent] = useState<{
    label: string;
    value: string;
    image: string | null;
    icon: string | null;
  } | null>();
  const [selectedEntity, setSelectedEntity] = useState<{
    label: string;
    value: string;
    image: string | null;
    icon: string | null;
  } | null>();
  const [type, setType] = useState<MatchType | null>(null);

  useEffect(() => {
    if (selectedEntity) {
      handleChange({ name: `matches.${match}`, value: selectedEntity.label });
    }
  }, [selectedEntity]);
  useEffect(() => {
    handleChange({ name: `matches.${match}`, value: null });
    if (selectedEntity) setSelectedEntity(null);
    if (parent) setParent(null);
  }, [type]);

  return (
    <div className="flex flex-nowrap items-center gap-x-1">
      <span className="w-1/4 self-end pb-2.5">{match}</span>
      <div className="w-48">
        <Select
          label="Entity type"
          name="type"
          onChange={({ value: matchValue }) => setType(matchValue as MatchType)}
          options={MatchReplacementOptions}
          value={type}
        />
      </div>
      <div className="">
        {type === "custom" ? (
          <Input label="Replace with" name={`matches.${match}`} onChange={handleChange} value={value || ""} />
        ) : null}
      </div>
      <div className="flex flex-1 items-center gap-x-4">
        <div className="flex-1">
          <div className="flex flex-1 gap-x-4">
            {type !== "custom" && !!type && type === "blueprint_instances" && !parent ? (
              <Search
                label="Blueprint"
                name="value"
                onChange={({ label, value: newValue, image, icon }) =>
                  setParent({
                    label: label || "",
                    value: newValue,
                    image: image || null,
                    icon: icon || null,
                  })
                }
                searchEntity="blueprints"
                value={value}
              />
            ) : null}
            {type !== "custom" && !!type && type === "blueprint_instances" && parent ? (
              <EntityPreview
                clearAction={() => setParent(null)}
                icon={parent.icon || ""}
                id={parent.value}
                image_id={parent.image}
                label="Blueprint"
                title={parent.label}
                type="blueprints"
              />
            ) : null}
            {type !== "custom" && !!type && !selectedEntity && parent ? (
              <Search
                isDisabled={type === "blueprint_instances" && !parent}
                label="Replace with"
                name="value"
                onChange={({ label, value: newValue, image, icon }) =>
                  setSelectedEntity({
                    label: label || "",
                    value: newValue,
                    image: image || null,
                    icon: icon || null,
                  })
                }
                parent_id={parent?.value}
                searchEntity={type}
                value={value}
              />
            ) : null}

            {type !== "custom" && !!type && selectedEntity?.value ? (
              <EntityPreview
                clearAction={() => setSelectedEntity(null)}
                icon={selectedEntity.icon || ""}
                id={selectedEntity.value}
                image_id={selectedEntity.image}
                label="Replace with"
                title={selectedEntity.label}
                type={type}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentFromTemplate({ data }: Props) {
  const { project_id } = useParams();
  const [content, setContent] = useState(data.getContext.getState().doc);
  const [updating, setUpdating] = useState(false);
  const [template, setTemplate] = useState<FromTemplateType>({
    id_template: data.id,
    title: "",
    project_id: project_id as string,
    matches: {},
  });
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  // const { mutateAsync: createDocumentFromTemplate, isLoading } = useCreateFromTemplate(project_id as string);

  useEffect(() => {
    if (content) {
      const tempMatches = { ...template.matches };
      const { textContent } = content;
      if (textContent) {
        for (const match of textContent.matchAll(/%\{([^%{}]*)\}%/g)) {
          const matchKey = match?.at(1) as string;
          if (match?.at(1) && !tempMatches[matchKey]) {
            tempMatches[matchKey] = "";
          }
        }
        setTemplate((prev) => ({ ...prev, matches: tempMatches }));
      }
    }
  }, []);

  useEffect(() => {
    setUpdating(true);
    const timeout = setTimeout(() => {
      const templateContent = data.getContext.getState().doc;
      if (templateContent && template.matches) {
        let contentToAlter = JSON.stringify(templateContent);
        const matches = Object.entries(template.matches);
        for (let index = 0; index < matches.length; index += 1) {
          if (matches[index][0] && matches[index][1]) {
            contentToAlter = contentToAlter.replaceAll(`%{${matches[index][0]}}%`, matches[index][1]);
          }
        }
        const newContent = JSON.parse(contentToAlter);
        const state = data.getContext.manager.createState({ content: newContent });
        setContent(state.doc);
      }
      setUpdating(false);
    }, 650);
    return () => {
      clearTimeout(timeout);
    };
  }, [template]);

  if (!data.getContext.getState().doc.content) return null;
  return (
    <DrawerLayout>
      <Input
        label="New document's title (required)"
        name="title"
        onChange={handleChange}
        value={template.title}
        variant={template.title ? "primary" : "error"}
      />
      <div className="grid h-full grid-cols-2 gap-x-2">
        <div>
          {updating ? (
            <Skeleton isFullWidth type="editor" />
          ) : (
            // @ts-ignore
            <Editor initialContent={content || undefined} isDisabled isFullHeight isReadOnly />
          )}
        </div>
        <div className="flex max-h-[80%] flex-col gap-y-2 overflow-auto">
          {Object.entries(template.matches).map(([key, value]) => (
            <MatchField key={key} handleChange={handleChange} match={key} value={value} />
          ))}
        </div>
      </div>

      <Button
        icon={IconEnum.add}
        isDisabled={Object.values(template.matches).some((v) => !v)}
        label="Create"
        onClick={() => {
          // createDocumentFromTemplate(template);
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
