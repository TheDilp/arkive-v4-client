import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { MutableRefObject, useLayoutEffect, useRef, useState } from "react";

import { useCreateQuestionnaire, useGetEntity, useHandleChange } from "../../../hooks";
import { InputOnChangeValue, onChangeValue, TabType } from "../../../types";
import { QuestionnaireType, QuestionType } from "../../../types/EntityTypes/questionnaireTypes";
import { drawerAtom, IconEnum, QuestionnaireQuestionTypesEnum, reorder, userAtom } from "../../../utils";
import { InsertQuestionnaireSchema, UpdateQuestionnaireSchema } from "../../../validation/questionnaires";
import { Button, Input, Search, Select } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Icon } from "../../Misc";
import { IconPicker } from "../IconPicker";

type Props = {
  data: {
    id?: string;
  };
};

const tabs: TabType[] = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Questions", icon: IconEnum.questionnaires },
];

function isSaveDisabled(questionnaire: Partial<QuestionnaireType> | null | undefined) {
  if (!questionnaire?.title) return true;
  if (!questionnaire?.questions?.length) return true;
  if (
    questionnaire?.questions?.length &&
    questionnaire.questions.some(
      (question) =>
        !question.title ||
        !question.type ||
        ((question.type === "select_multiple" || question.type === "select_single") && !question?.options?.length) ||
        ((question.type === "blueprints_single" || question.type === "blueprints_multiple") && !question.blueprint_id),
    )
  )
    return true;
  return false;
}

function QuestionRow({
  title,
  type,
  index,
  options,
  isLoading,
  isDisabled,
  changeField,
  blueprint_id,
  blueprint,
}: QuestionType & {
  index: number;
  changeField: ({
    name,
    value,
  }: onChangeValue | InputOnChangeValue | { name: string; value: { id: string; value: string }[] }) => void;
  isLoading: boolean;
  isDisabled: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-y-2 p-2">
      <div className="flex w-full items-center justify-between gap-x-2">
        <div className="h-full flex-1">
          <Input
            isDisabled={isLoading || isDisabled}
            label="Field title"
            name={`questions[${index}].title`}
            onChange={changeField}
            placeholder="Eg. Location"
            value={title}
          />
        </div>
        <div className="h-full flex-1">
          <Select
            hasSearch
            isDisabled={isLoading || isDisabled}
            label="Field type"
            name={`questions[${index}].type`}
            onChange={changeField}
            options={QuestionnaireQuestionTypesEnum}
            placeholder="Field type"
            value={type}
          />
        </div>

        {type === "select_single" || type === "select_multiple" ? (
          <div className="h-10 w-8 self-end">
            <Button
              hasNoBackground
              icon={IconEnum.add}
              isDisabled={isLoading || isDisabled}
              onClick={
                () => {} // changeField({
                //   name: `questions[${index}].options`,
                //   value: (options || []).concat({ id: crypto.randomUUID(), value: `New option ${(options?.length || 0) + 1}` }),
                // })
              }
              tooltip="Add new option"
              variant="info"
            />
          </div>
        ) : null}
      </div>

      {type === "select_single" || type === "select_multiple" ? (
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination) {
              return;
            }

            const newData = reorder(options || [], result.source.index, result.destination.index);
            changeField({
              name: `questions[${index}].options`,
              // Saving sort field is not required
              // As the order is preserved in JSON
              value: newData,
            });
          }}>
          <Droppable droppableId={`droppable_${index}_${type}`}>
            {(providedDroppable) => (
              <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                {options?.map((opt, optIndex) => (
                  <Draggable key={opt.id} draggableId={opt.id || opt.value + index} index={optIndex}>
                    {(provided, draggableSnapshot) => (
                      <div
                        className={`my-1 flex w-full flex-nowrap items-center gap-x-2 rounded px-1 ${
                          draggableSnapshot.isDragging ? "ml-8 w-full rounded bg-transparent bg-none shadow-sm" : ""
                        }`}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        style={{
                          ...provided.draggableProps.style,
                          left: "calc(100%-1px)",
                          right: 24,
                        }}>
                        <div {...provided.dragHandleProps} className="self-center">
                          <Icon fontSize={24} icon={IconEnum.menu} />
                        </div>
                        <div className="w-full">
                          <Input
                            isDisabled={isLoading || isDisabled}
                            name={`questions[${index}].options[${optIndex}].value`}
                            onChange={changeField}
                            value={opt.value}
                          />
                        </div>

                        <div className="flex flex-1 justify-end">
                          <div className="h-10 w-8">
                            <Button
                              hasNoBackground
                              icon={IconEnum.trash}
                              isDisabled={isLoading || isDisabled}
                              onClick={() =>
                                changeField({
                                  name: `questions[${index}].options`,
                                  value: (options || []).filter((o) => o.id !== opt.id),
                                })
                              }
                              variant="error"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : null}

      {type === "blueprints_single" || type === "blueprints_multiple" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={blueprint?.title || ""}
            isDisabled={isLoading || isDisabled}
            isGlobal
            label="Blueprint"
            name={`questions[${index}].blueprint_id`}
            onChange={changeField}
            searchEntity="blueprints"
            value={blueprint_id || ""}
          />
        </div>
      ) : null}
    </div>
  );
}

export function QuestionnaireDrawer({ data }: Props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const user = useAtomValue(userAtom);
  const fieldContainerRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [questionnaire, setQuestionnaire] = useState<Partial<QuestionnaireType> | null>({
    id: "",
    icon: undefined,
    title: "",
    user_id: user?.id || "",
    questions: [],
  });
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutate: create, isLoading: isCreating } = useCreateQuestionnaire();
  const { mutate: update, isLoading: isUpdating } = useCreateQuestionnaire();
  const { handleChange, changedData } = useHandleChange({ data: questionnaire, setData: setQuestionnaire });
  const { data: existingQuestionnaire, isFetching } = useGetEntity<QuestionnaireType>(
    data?.id,
    "questionnaires",
    {
      fields: ["id", "title", "user_id", "icon"],
      relations: {
        questions: true,
      },
    },
    {
      enabled: !!data?.id,
    },
  );

  useLayoutEffect(() => {
    if (existingQuestionnaire?.data) setQuestionnaire(existingQuestionnaire?.data);
  }, [existingQuestionnaire]);

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <div className="flex-1">
          <div className="flex items-center gap-x-2">
            <Input
              label="Title (required)"
              name="title"
              onChange={handleChange}
              placeholder="E.g. Personal questions"
              value={questionnaire?.title}
            />
            <span className="mb-1 self-end">
              <IconPicker icon={questionnaire?.icon || IconEnum.questionnaires} name="icon" onChange={handleChange} />
            </span>
          </div>
        </div>
      ) : null}

      {tabs[selectedTab].id === "2" ? (
        <div className="flex flex-1 flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <span>Insert new field:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isDisabled={isFetching}
                onClick={() => {
                  handleChange({
                    name: "questions",
                    value: (questionnaire?.questions || []).concat({
                      id: crypto.randomUUID(),
                      title: "New question",
                      type: "text",
                      parent_id: "",
                      sort: (questionnaire?.questions?.length || 0) + 1,
                      options: [],
                      blueprint_id: null,
                    }),
                  });
                  setTimeout(() => {
                    fieldContainerRef.current.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                variant="info"
              />
            </div>
          </div>
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) {
                return;
              }
              const newData = reorder(questionnaire?.questions || [], result.source.index, result.destination.index);
              setQuestionnaire((prev) => ({
                ...prev,
                questions: newData,
              }));
            }}>
            <Droppable droppableId="droppable">
              {(providedDroppable) => (
                <div
                  className="flex max-h-[75%] flex-col content-start justify-start overflow-y-auto"
                  {...providedDroppable.droppableProps}
                  ref={providedDroppable.innerRef}>
                  {questionnaire?.questions?.length
                    ? questionnaire?.questions.map((question, index) => (
                        <Draggable key={question.id} draggableId={question.id || question.title + index} index={index}>
                          {(provided, draggableSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              className={`my-1 flex flex-nowrap items-center gap-x-2 ${
                                draggableSnapshot.isDragging ? "rounded shadow-sm" : ""
                              }`}
                              {...provided.draggableProps}
                              key={question.id}
                              style={{
                                ...provided.draggableProps.style,
                                right: 16,
                              }}>
                              <div {...provided.dragHandleProps} className="mt-1 self-start">
                                <Icon fontSize={24} icon={IconEnum.menu} />
                              </div>
                              <div className="w-full">
                                <Collapsible
                                  actions={[
                                    {
                                      icon: IconEnum.trash,
                                      isIconOnly: true,
                                      variant: "error",
                                      onClick: () =>
                                        handleChange({
                                          name: "questions",
                                          value: questionnaire?.questions?.filter((f) => f.id !== question.id),
                                        }),
                                    },
                                  ]}
                                  initialOpen={
                                    question.title === "New question" &&
                                    question.type === "text" &&
                                    index === (questionnaire?.questions?.length || 1) - 1
                                  }
                                  label={question?.title}>
                                  <QuestionRow
                                    blueprint={question?.blueprint}
                                    blueprint_id={question?.blueprint_id}
                                    changeField={handleChange}
                                    id={question.id}
                                    index={index}
                                    isDisabled={false}
                                    isLoading={false}
                                    options={question?.options || []}
                                    parent_id={question.parent_id}
                                    sort={question.sort}
                                    title={question.title}
                                    type={question.type}
                                  />
                                </Collapsible>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    : null}
                  {providedDroppable.placeholder}
                  <div ref={fieldContainerRef} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : null}
      <div>
        <Button
          icon={questionnaire?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(questionnaire) || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={questionnaire?.id ? "Update" : "Create"}
          onClick={async () => {
            if (changedData) {
              if (questionnaire?.id && existingQuestionnaire?.data) {
                const dataToParse = {
                  data: questionnaire,
                  relations: {
                    questions: [],
                  },
                };
                const parsedData = UpdateQuestionnaireSchema.parse(dataToParse);
                // @ts-ignore
                update(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              } else {
                const dataToParse = {
                  data: questionnaire,
                  relations: {
                    questions: (questionnaire?.questions || []).map((q) => ({ data: { title: q.title, type: q.type } })),
                  },
                };

                const parsedData = InsertQuestionnaireSchema.parse(dataToParse);
                // @ts-ignore
                create(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              }
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
