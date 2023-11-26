import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { MutableRefObject, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterFieldType,
  InputOnChangeValue,
  onChangeValue,
  TemplateStateType,
} from "../../../types";
import { CharacterFieldTypesEnum, dialogAtom, drawerAtom, IconEnum, MessageEnum, reorder } from "../../../utils";
import { DiceRollRegex } from "../../../utils/ui/diceRollerUtils";
import { InsertTemplateSchema, InsertTemplateType, UpdateTemplateSchema, UpdateTemplateType } from "../../../validation";
import { Button, Input, Search, Select, TagInput } from "../../Form";
import { Collapsible, Tabs } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";

function isSaveDisabled(template: TemplateStateType) {
  if (!template?.title) return true;
  if (!template?.character_fields?.length) return true;
  if (!template?.tags?.length) return true;
  if (
    template.character_fields.some(
      (field) =>
        !field.title ||
        !field.field_type ||
        ((field.field_type === "select_multiple" || field.field_type === "select") && !field?.options?.length) ||
        (field.field_type === "dice_roll" && !field?.formula) ||
        (field.field_type === "random_table" && !field.random_table_id) ||
        (field.field_type === "date" && !field.calendar_id),
    )
  )
    return true;

  return false;
}

function FieldRow({
  title,
  field_type,
  calendar_id,
  calendar,
  options,
  formula,
  index,
  random_table_id,
  random_table,
  isLoading,
  changeField,
}: (Omit<CharacterFieldType, "options"> & { options?: { id: string; value: string }[] }) & {
  index: number;
  changeField: ({
    name,
    value,
  }: onChangeValue | InputOnChangeValue | { name: string; value: { id: string; value: string }[] }) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-y-2">
      <div className="flex w-full items-center justify-between gap-x-2">
        <div className="h-full flex-1">
          <Input
            isDisabled={isLoading}
            label="Field title"
            name={`character_fields[${index}].title`}
            onChange={changeField}
            placeholder="Eg. Location"
            value={title}
          />
        </div>
        <div className="h-full flex-1">
          <Select
            hasSearch
            isDisabled={isLoading}
            label="Field type"
            name={`character_fields[${index}].field_type`}
            onChange={changeField}
            options={CharacterFieldTypesEnum}
            placeholder="Field type"
            value={field_type}
          />
        </div>
        {field_type === "select" || field_type === "select_multiple" ? (
          <div className="h-10 w-8 self-end">
            <Button
              hasNoBackground
              icon={IconEnum.add}
              isDisabled={isLoading}
              onClick={() =>
                changeField({
                  name: `character_fields[${index}].options`,
                  value: (options || []).concat({ id: crypto.randomUUID(), value: `New option ${(options?.length || 0) + 1}` }),
                })
              }
              tooltip="Add new option"
              variant="info"
            />
          </div>
        ) : null}
      </div>
      {field_type === "select" || field_type === "select_multiple" ? (
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination) {
              return;
            }

            const newData = reorder(options || [], result.source.index, result.destination.index);
            changeField({
              name: `character_fields[${index}].options`,
              // Saving sort field is not required
              // As the order is preserved in JSON
              value: newData,
            });
          }}>
          <Droppable droppableId={`droppable_${index}_${field_type}`}>
            {(providedDroppable) => (
              <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                {options?.map((opt, optIndex) => (
                  <Draggable key={opt.id} draggableId={opt.id || opt.value + index} index={optIndex}>
                    {(provided, draggableSnapshot) => (
                      <div
                        className={`my-1 flex w-full flex-nowrap items-center gap-x-2 ${
                          draggableSnapshot.isDragging ? "ml-8 w-full rounded bg-transparent bg-none shadow-sm" : ""
                        }`}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        style={{
                          ...provided.draggableProps.style,
                          left: "calc(100%-3px)",
                          right: 24,
                        }}>
                        <div {...provided.dragHandleProps} className="self-center">
                          <Icon fontSize={24} icon={IconEnum.menu} />
                        </div>
                        <div className="w-full">
                          <Input
                            isDisabled={isLoading}
                            name={`character_fields[${index}].options[${optIndex}].value`}
                            onChange={changeField}
                            value={opt.value}
                          />
                        </div>
                        <div className="flex flex-1 justify-end">
                          <div className="h-10 w-8">
                            <Button
                              hasNoBackground
                              icon={IconEnum.trash}
                              isDisabled={isLoading}
                              onClick={() =>
                                changeField({
                                  name: `character_fields[${index}].options`,
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
      {field_type === "dice_roll" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <div className="flex flex-col gap-y-2">
            <Input
              helperText={formula?.match?.(DiceRollRegex) ? "" : MessageEnum.dice_notation_not_valid}
              isDisabled={isLoading}
              label="Dice formula"
              name={`character_fields[${index}].formula`}
              onChange={changeField}
              placeholder="E.g. 4d6dl1"
              value={formula || ""}
              variant={formula?.match?.(DiceRollRegex) ? "primary" : "error"}
            />
          </div>
        </div>
      ) : null}
      {field_type === "random_table" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={random_table?.title || ""}
            isDisabled={isLoading}
            label="Random table"
            name={`character_fields[${index}].random_table_id`}
            onChange={changeField}
            searchEntity="random_tables"
            value={random_table_id || ""}
          />
        </div>
      ) : null}
      {field_type === "date" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={calendar?.title || ""}
            isDisabled={isLoading}
            label="Calendar"
            name={`character_fields[${index}].calendar_id`}
            onChange={changeField}
            searchEntity="calendars"
            value={calendar_id || ""}
          />
        </div>
      ) : null}
    </div>
  );
}

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Fields", icon: IconEnum.additional_fields },
];

export function FieldTemplateDrawer({ data }: { data: { id?: string } }) {
  const queryClient = useQueryClient();
  const setDialog = useSetAtom(dialogAtom);
  const [selectedTab, setSelectedTab] = useState(0);
  const { project_id } = useParams();
  const fieldContainerRef = useRef() as MutableRefObject<HTMLDivElement>;
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertTemplateType>("character_fields_templates");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateTemplateType>(
    "character_fields_templates",
    project_id as string,
  );

  const { data: existingTemplate, isFetching } = useGetEntity<CharacterFieldTemplateType>(
    data?.id,
    "character_fields_templates",
    {
      data: {
        id: data?.id,
      },
      relations: {
        character_fields: true,
        tags: true,
      },
    },
    {
      enabled: !!data?.id,
    },
  );

  const [template, setTemplate] = useState<TemplateStateType>({
    title: "",
    project_id: project_id as string,
    sort: 0,
    tags: [],
  });

  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });

  const isLoading = isFetching || isCreating || isUpdating;

  useLayoutEffect(() => {
    if (existingTemplate?.data && !template?.title) {
      setTemplate(existingTemplate?.data);
    }
  }, [existingTemplate]);

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex h-screen max-h-screen flex-col gap-y-4 overflow-hidden text-white">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <div className="flex flex-nowrap items-center gap-x-2">
            <div className="flex-1">
              <Input
                isDisabled={isLoading}
                label="Template title (required)"
                name="title"
                onChange={handleChange}
                value={template?.title || ""}
              />
            </div>
            <div className="w-20">
              <Input
                isDisabled={isLoading}
                label="Sort"
                name="sort"
                onChange={handleChange}
                type="number"
                value={template?.sort || 0}
              />
            </div>
          </div>
          <div>
            <TagInput
              handleChange={handleChange}
              label="Used for entities with these tags (required)"
              tags={template?.tags || []}
            />
          </div>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <div className="flex max-h-[90%] flex-col content-start gap-y-2 overflow-hidden">
          <h5 className="border-b border-zinc-600 text-lg">Fields</h5>
          <div className="flex items-center justify-between">
            <span>Insert new field:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isDisabled={isLoading}
                onClick={() => {
                  handleChange({
                    name: "character_fields",
                    value: (template.character_fields || []).concat({
                      id: crypto.randomUUID(),
                      title: "New field",
                      field_type: "text",
                      sort: template?.character_fields?.length ?? 0,
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
          <div className="flex h-[calc(100%)] max-h-[calc(100%)] flex-col overflow-y-auto">
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) {
                  return;
                }

                const newData = reorder(template?.character_fields || [], result.source.index, result.destination.index);
                setTemplate((prev) => ({
                  ...prev,
                  character_fields: newData.map((char_field, index) => ({ ...char_field, sort: index })),
                }));
              }}>
              <Droppable droppableId="droppable">
                {(providedDroppable) => (
                  <div
                    className="relative flex flex-col"
                    {...providedDroppable.droppableProps}
                    ref={providedDroppable.innerRef}>
                    {template.character_fields?.length
                      ? template.character_fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id || field.title + index} index={index}>
                            {(provided, draggableSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                className={`my-1 flex flex-nowrap items-center gap-x-2 bg-zinc-800 ${
                                  draggableSnapshot.isDragging ? "rounded shadow-sm" : ""
                                }`}
                                {...provided.draggableProps}
                                key={field.id}
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
                                          field?.title
                                            ? setDialog((prev) => ({
                                                ...prev,
                                                title: `Delete field "${field.title}"?`,
                                                cancel: {
                                                  label: "Cancel",
                                                  action: () => {},
                                                },
                                                isOverlay: true,
                                                confirm: {
                                                  icon: IconEnum.trash,
                                                  variant: "error",
                                                  label: "Delete",
                                                  action: () =>
                                                    handleChange({
                                                      name: "character_fields",
                                                      value: template?.character_fields?.filter((f) => f.id !== field.id),
                                                    }),
                                                },
                                              }))
                                            : handleChange({
                                                name: "character_fields",
                                                value: template?.character_fields?.filter((f) => f.id !== field.id),
                                              }),
                                      },
                                    ]}
                                    label={field?.title}>
                                    <div
                                      className={`my-1 flex flex-nowrap items-center gap-x-2 bg-zinc-900 p-2 ${
                                        draggableSnapshot.isDragging ? "rounded shadow-sm" : ""
                                      }`}
                                      {...provided.draggableProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        right: 0,
                                      }}>
                                      <div {...provided.dragHandleProps} className="mt-7 self-start">
                                        <Icon fontSize={24} icon={IconEnum.menu} />
                                      </div>

                                      <FieldRow
                                        key={field.id}
                                        calendar={field?.calendar}
                                        calendar_id={field?.calendar_id}
                                        changeField={handleChange}
                                        field_type={field.field_type}
                                        formula={field?.formula}
                                        id={field.id}
                                        index={index}
                                        isLoading={isLoading}
                                        options={field?.options || []}
                                        random_table={field?.random_table}
                                        random_table_id={field?.random_table_id}
                                        sort={field.sort}
                                        title={field.title}
                                      />
                                    </div>
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
        </div>
      ) : null}
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(template) || isLoading}
          isLoading={isLoading}
          label={data?.id ? "Update" : "Create"}
          onClick={async () => {
            if (!data?.id) {
              const { tags, character_fields, ...rest } = template;
              const parsedData = InsertTemplateSchema.parse({
                data: rest,
                relations: {
                  tags,
                  character_fields,
                },
              });
              await create(parsedData, {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes("character_fields_templates"),
                  });
                  resetDrawerAtom();
                },
              });
            } else {
              const { tags, character_fields, ...rest } = template;
              const parsedData = UpdateTemplateSchema.parse({
                data: rest,
                relations: {
                  tags,
                  character_fields,
                },
              });
              await update(parsedData, {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes("character_fields_templates"),
                  });
                  resetDrawerAtom();
                },
              });
            }
          }}
          variant="success"
        />
      </div>
    </div>
  );
}
