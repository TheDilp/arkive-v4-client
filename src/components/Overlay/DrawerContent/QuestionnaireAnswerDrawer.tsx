import { useLayoutEffect, useState } from "react";

import { useFillQuestionnaire, useGetEntityQuestionnaire, useHandleChange } from "../../../hooks";
import { EntityQuestionnaireType } from "../../../types/EntityTypes/questionnaireTypes";
import { IconEnum } from "../../../utils";
import { Button, Input, Title } from "../../Form";
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
        if (q.type === "text" || q.type === "number")
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

        return null;
      })}
      <div className="mt-auto">
        <Button
          icon={IconEnum.check_circle}
          isDisabled={isMutating}
          isLoading={isMutating}
          label="Complete"
          onClick={() => {
            mutate({
              data: {
                character_id: data.character_id,
                blueprint_instance_id: data.blueprint_instance_id,
                answers: answers.questions
                  .filter((q) => !!q?.answer?.value)
                  .map((q) => ({ parent_id: q.id, value: q?.answer?.value })),
              },
            });
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
