import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { deepMerge, isArray } from "remirror";

import { useFillQuestionnaire, useGetEntityQuestionnaire, useHandleChange } from "../../../hooks";
import { EntityQuestionnaireType } from "../../../types/EntityTypes/questionnaireTypes";
import { drawerAtom, IconEnum } from "../../../utils";
import {
  TemplateBlueprintField,
  TemplateCharacterField,
  TemplateDocumentField,
  TemplateEventField,
  TemplateImageField,
  TemplateLocationsField,
} from "../../Complex";
import { Button, Checkbox, Input, Select, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id: string;
    character_id: string | undefined;
    blueprint_instance_id: string | undefined;
  };
};

export default function QuestionnaireAnswerDrawer({ data }: Props) {
  const [answers, setAnswers] = useState<EntityQuestionnaireType | null>();
  const { handleChange } = useHandleChange({ data: answers, setData: setAnswers });
  const resetDrawer = useResetAtom(drawerAtom);
  const { mutate, isLoading: isMutating } = useFillQuestionnaire();
  const { data: entityQuestionnaire, isInitialLoading } = useGetEntityQuestionnaire(
    data.id,
    data.character_id || data.blueprint_instance_id || "",
    "characters",
  );

  useLayoutEffect(() => {
    if (entityQuestionnaire?.data) {
      setAnswers(entityQuestionnaire?.data);
    }
  }, [entityQuestionnaire]);
  if (isInitialLoading || !answers) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      {(answers.questions || []).map((q, index) => {
        if ((q.type === "text" || q.type === "number") && !isArray(q?.answer?.value) && typeof q?.answer?.value !== "boolean")
          return (
            <div>
              <Title label={q.title} />
              <Input
                name={`questions[${index}].answer.value`}
                onChange={handleChange}
                type={q.type}
                value={q?.answer?.value || ""}
              />
            </div>
          );
        if (q.type === "boolean")
          return (
            <div className="flex flex-nowrap items-center justify-between">
              <Title label={q.title} />
              <div className="w-min">
                <Checkbox name={`questions[${index}].answer.value`} onChange={handleChange} value={!!q?.answer?.value} />
              </div>
            </div>
          );
        if (q.type === "select_single" || q.type === "select_multiple")
          return (
            <div>
              <Title label={q.title} />
              <Select
                isDisabled={!q.options || q.options.length === 0}
                name={`questions[${index}].answer.value`}
                onChange={handleChange}
                options={q.options.map((opt) => ({ label: opt.value, value: opt.id })) || []}
                value={(q?.answer?.value || "") as string | string[]}
              />
            </div>
          );

        if (q.type === "characters_single" || q.type === "characters_multiple")
          return (
            <TemplateCharacterField
              key={q.id}
              currentValue={q?.answer?.characters || []}
              fieldType={q.type}
              handleChange={handleChange}
              id={q.id}
              isCollapsible
              isGlobal
              isQuestionnaire
              name={`questions[${index}].answer.characters`}
              title={q.title}
            />
          );

        if (q.type === "blueprints_single" || q.type === "blueprints_multiple")
          return (
            <TemplateBlueprintField
              key={q.id}
              blueprint_id={q.blueprint_id}
              currentValue={q?.answer?.blueprint_instances || []}
              fieldType={q.type}
              handleChange={handleChange}
              id={q.id}
              isCollapsible
              isGlobal
              isQuestionnaire
              name={`questions[${index}].blueprint_instances`}
              title={q.title}
            />
          );

        if (q.type === "documents_single" || q.type === "documents_multiple") {
          return (
            <TemplateDocumentField
              key={q.id}
              currentValue={q?.answer?.documents}
              fieldType={q.type}
              handleChange={handleChange}
              id={q.id}
              isCollapsible
              isGlobal
              isQuestionnaire
              name={`questions[${index}].answer.documents`}
              title={q.title}
            />
          );
        }
        if (q.type === "locations_single" || q.type === "locations_multiple") {
          return (
            <TemplateLocationsField
              key={q.id}
              currentValue={q?.answer?.map_pins}
              fieldType={q.type}
              handleChange={handleChange}
              id={q.id}
              isCollapsible
              isGlobal
              isQuestionnaire
              name={`questions[${index}].answer`}
              title={q.title}
            />
          );
        }
        if (q.type === "events_single" || q.type === "events_multiple") {
          return (
            <TemplateEventField
              key={q.id}
              currentValue={q?.answer?.events}
              fieldType={q.type}
              handleChange={handleChange}
              id={q.id}
              isCollapsible
              isGlobal
              isQuestionnaire
              name={`questions[${index}].answer.events`}
              title={q.title}
            />
          );
        }
        if (q.type === "images_single" || q.type === "images_multiple") {
          return (
            <TemplateImageField
              key={q.id}
              currentValue={q?.answer?.images}
              fieldType={q.type}
              handleChange={handleChange}
              id={q.id}
              isCollapsible
              isGlobal
              isQuestionnaire
              name={`questions[${index}].answer.images`}
              title={q.title}
            />
          );
        }

        return null;
      })}
      <div className="mt-auto">
        <Button
          icon={IconEnum.check_circle}
          isDisabled={isMutating}
          isLoading={isMutating}
          label="Complete"
          onClick={() => {
            mutate(
              {
                data: {
                  character_id: data.character_id,
                  blueprint_instance_id: data.blueprint_instance_id,
                  answers: answers.questions.map((q) => ({
                    parent_id: q.id,
                    value: q?.answer?.value,
                    relations: deepMerge(
                      q?.answer?.characters || [],
                      q?.answer?.blueprint_instances || [],
                      q?.answer?.documents || [],
                      q?.answer?.map_pins || [],
                      q?.answer?.events || [],
                      q?.answer?.images || [],
                    )?.map((item: { id: string; related_id: string }) => {
                      return {
                        answer_id: q.answer.id || crypto.randomUUID(),
                        related_id: item.related_id || item.id,
                      };
                    }),
                  })),
                },
              },
              { onSuccess: resetDrawer },
            );
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
