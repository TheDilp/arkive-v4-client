import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import groupBy from "lodash.groupby";
import omit from "lodash.omit";
import { MutableRefObject, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterFieldType,
  HandleChangePropsType,
  InputOnChangeValue,
  onChangeValue,
  TabType,
  TemplateStateType,
  UserHasPermissionsType,
} from "../../../types";
import { CharacterFieldTypesEnum, dialogAtom, IconEnum, MessageEnum, reorder } from "../../../utils";
import { DiceRollRegex } from "../../../utils/ui/diceRollerUtils";
import { InsertTemplateSchema, InsertTemplateType, UpdateTemplateSchema, UpdateTemplateType } from "../../../validation";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input, Search, Select, TagInput } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
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
        (field.field_type === "date" && !field.calendar_id)
    )
  )
    return true;

  if (template.character_fields_sections?.length) {
    const unique_sections = new Set(template.character_fields_sections.map((section) => section.title) || []);
    if (unique_sections.size !== template.character_fields_sections?.length) return true;
  }

  return false;
}

function FieldRow({
  index,
  field,
  isLoading,
  changeField,
}: {
  field: Omit<CharacterFieldType, "options"> & { options?: { id: string; value: string }[] };
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
            value={field.title}
            variant={field.title ? "primary" : "error"}
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
            value={field.field_type}
          />
        </div>
        {field.field_type === "select" || field.field_type === "select_multiple" ? (
          <div className="h-10 w-8 self-end">
            <Button
              hasNoBackground
              icon={IconEnum.add}
              isDisabled={isLoading}
              onClick={() =>
                changeField({
                  name: `character_fields[${index}].options`,
                  value: (field.options || []).concat({
                    id: crypto.randomUUID(),
                    value: `New option ${(field.options?.length || 0) + 1}`,
                  }),
                })
              }
              tooltip="Add new option"
              variant="info"
            />
          </div>
        ) : null}
      </div>
      {field.field_type === "select" || field.field_type === "select_multiple" ? (
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination) {
              return;
            }

            const newData = reorder(field.options || [], result.source.index, result.destination.index);
            changeField({
              name: `character_fields[${index}].options`,
              // Saving sort field is not required
              // As the order is preserved in JSON
              value: newData,
            });
          }}>
          <Droppable droppableId={`droppable_${index}_${field.field_type}`}>
            {(providedDroppable) => (
              <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                {field.options?.map((opt, optIndex) => (
                  <Draggable draggableId={opt.id || opt.value + index} index={optIndex} key={opt.id}>
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
                        <div {...provided.dragHandleProps} className="self-end pb-2">
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
                                  value: (field.options || []).filter((o) => o.id !== opt.id),
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
      {field.field_type === "dice_roll" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <div className="flex flex-col gap-y-2">
            <Input
              helperText={field.formula?.match?.(DiceRollRegex) ? "" : MessageEnum.dice_notation_not_valid}
              isDisabled={isLoading}
              label="Dice formula"
              name={`character_fields[${index}].formula`}
              onChange={changeField}
              placeholder="E.g. 4d6dl1"
              value={field.formula || ""}
              variant={field.formula?.match?.(DiceRollRegex) ? "primary" : "error"}
            />
          </div>
        </div>
      ) : null}
      {field.field_type === "random_table" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={field.random_table?.title || ""}
            isDisabled={isLoading}
            label="Random table"
            name={`character_fields[${index}].random_table_id`}
            onChange={changeField}
            searchEntity="random_tables"
            value={field.random_table_id || ""}
          />
        </div>
      ) : null}
      {field.field_type === "date" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={field.calendar?.title || ""}
            isDisabled={isLoading}
            label="Calendar"
            name={`character_fields[${index}].calendar_id`}
            onChange={changeField}
            searchEntity="calendars"
            value={field.calendar_id || ""}
          />
        </div>
      ) : null}
      {field.field_type === "blueprints_single" || field.field_type === "blueprints_multiple" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={field.blueprint?.title || ""}
            isDisabled={isLoading}
            label="Blueprint"
            name={`character_fields[${index}].blueprint_id`}
            onChange={changeField}
            searchEntity="blueprints"
            value={field.blueprint_id || ""}
          />
        </div>
      ) : null}
    </div>
  );
}

function CharacterFieldSection({
  id,
  title,
  character_fields,
  handleChange,
  isLoading,
  isInitialOpen,
}: {
  id: string;
  title: string;
  character_fields: CharacterFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
  isLoading: boolean;
  isInitialOpen: boolean;
}) {
  const setDialog = useSetAtom(dialogAtom);

  return (
    <Collapsible initialOpen={isInitialOpen} label={title}>
      {character_fields.length ? <span /> : <div className="w-full">Drop fields here</div>}
      <Droppable direction="vertical" droppableId={id} type="CHARACTER_FIELDS">
        {(providedDroppable) => (
          <div
            className={`relative flex min-h-8 flex-col rounded-md bg-zinc-800 p-1.5 ${character_fields.length ? "" : "border border-dashed border-zinc-600"}`}
            {...providedDroppable.droppableProps}
            ref={providedDroppable.innerRef}>
            {character_fields?.length
              ? character_fields.map((field, index) => (
                  <Draggable draggableId={field.id || field.title + index} index={index} key={field.id}>
                    {(provided, draggableSnapshot) => (
                      <div
                        className={`my-1 flex flex-nowrap items-center gap-x-2 ${
                          draggableSnapshot.isDragging ? "rounded shadow-sm" : ""
                        }`}
                        ref={provided.innerRef}
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
                                              value: character_fields?.filter((f) => f.id !== field.id),
                                            }),
                                        },
                                      }))
                                    : handleChange({
                                        name: "character_fields",
                                        value: character_fields?.filter((f) => f.id !== field.id),
                                      }),
                              },
                            ]}
                            initialOpen={
                              field.title === "New field" &&
                              field.field_type === "text" &&
                              index === (character_fields?.length || 1) - 1
                            }
                            label={field?.title}
                            size="lg">
                            <div
                              className={`my-1 flex flex-nowrap items-center gap-x-2 bg-zinc-950 p-2 ${
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

                              <FieldRow changeField={handleChange} field={field} index={index} isLoading={isLoading} />
                            </div>
                          </Collapsible>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              : null}
            {providedDroppable.placeholder}
          </div>
        )}
      </Droppable>
    </Collapsible>
  );
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Fields", icon: IconEnum.additional_fields },
    { id: "3", label: "Sections", icon: IconEnum.additional_fields_sections },
  ];
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "4", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function FieldTemplateDrawer({ data }: { data: { id?: string } }) {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const { project_id } = useParams();
  const fieldContainerRef = useRef() as MutableRefObject<HTMLDivElement>;
  const resetDrawerAtom = useToggledResetAtom();
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertTemplateType>("character_fields_templates");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateTemplateType>(
    "character_fields_templates",
    project_id as string
  );
  const {
    data: existingTemplate,
    isFetching,
    isInitialLoading,
  } = useGetEntity<CharacterFieldTemplateType>(
    data?.id,
    "character_fields_templates",
    {
      data: {
        id: data?.id,
      },
      fields: ["id", "title", "sort", "owner_id"],
      relations: {
        character_fields: true,
        character_fields_sections: true,
        tags: true,
      },
      permissions: true,
    },
    {
      enabled: !!data?.id,
    }
  );

  const permissions = useHasPermissions(
    ["read_character_fields_templates", "create_character_fields_templates", "update_character_fields_templates"],
    existingTemplate?.data?.owner_id
  );
  const tabs = getTabs(permissions, existingTemplate?.data?.id);

  const [template, setTemplate] = useState<TemplateStateType>({
    title: "",
    project_id: project_id as string,
    sort: 0,
    tags: [],
  });

  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });

  const isLoading = isFetching || isCreating || isUpdating;
  const [groupedFields, setGroupedFields] = useState<Record<string, CharacterFieldType[]>>({});
  useLayoutEffect(() => {
    if (existingTemplate?.data && !template?.title) {
      setTemplate(existingTemplate?.data);
      setGroupedFields(groupBy(existingTemplate?.data?.character_fields || [], "section_id"));
    }
  }, [existingTemplate]);

  useLayoutEffect(() => {
    if (template?.character_fields) {
      setGroupedFields(groupBy(template?.character_fields || [], "section_id"));
    }
  }, [template?.character_fields]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex flex-nowrap items-center gap-x-2">
            <div className="flex-1">
              <Input
                isDisabled={isLoading}
                label="Template title (required)"
                name="title"
                onChange={handleChange}
                value={template?.title || ""}
                variant={template?.title ? "primary" : "error"}
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
              variant={template?.tags?.length ? "primary" : "error"}
            />
          </div>
        </>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <div className="flex max-h-[90%] flex-col content-start gap-y-2 overflow-hidden">
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
                      section_id: null,
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
          <div className="flex h-[calc(100%)] max-h-[calc(100%)] flex-col gap-y-2 overflow-y-auto">
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) {
                  return;
                }
                const temp = structuredClone(groupedFields);
                const [removed] = temp[result.source.droppableId === "other" ? "null" : result.source.droppableId].splice(
                  result.source.index,
                  1
                );

                if (!temp?.[result.destination.droppableId === "other" ? "null" : result.destination.droppableId]) {
                  temp[result.destination.droppableId === "other" ? "null" : result.destination.droppableId] = [];
                }

                removed.section_id = result.destination.droppableId;

                temp[result.destination.droppableId === "other" ? "null" : result.destination.droppableId].splice(
                  result.destination.index,
                  0,
                  removed
                );
                setGroupedFields(temp);
              }}>
              {(template.character_fields_sections || [])?.map((section) => (
                <CharacterFieldSection
                  character_fields={groupedFields?.[section.id] || []}
                  handleChange={handleChange}
                  id={section.id}
                  isInitialOpen={false}
                  isLoading={isFetching}
                  key={section.id}
                  title={section.title}
                />
              ))}

              <CharacterFieldSection
                character_fields={groupedFields["null"] || []}
                handleChange={handleChange}
                id="other"
                isInitialOpen={!template?.id || !groupedFields?.["null"]?.length || !template.character_fields_sections?.length}
                isLoading={isFetching}
                title="Other"
              />
            </DragDropContext>
          </div>
        </div>
      ) : null}

      {tabs[selectedTab].id === "3" ? (
        <div className="flex max-h-[90%] flex-col content-start gap-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span>Insert new section:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isDisabled={isLoading}
                onClick={() => {
                  handleChange({
                    name: "character_fields_sections",
                    value: (template.character_fields_sections || []).concat({
                      id: crypto.randomUUID(),
                      title: `New section ${(template?.character_fields_sections?.length ?? 0) + 1}`,
                      sort: template?.character_fields_sections?.length ?? 0,
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

              const newData = reorder(template?.character_fields_sections || [], result.source.index, result.destination.index);
              setTemplate((prev) => ({
                ...prev,
                character_fields_sections: newData.map((char_field_section, index) => ({ ...char_field_section, sort: index })),
              }));
            }}>
            <Droppable droppableId="other" type="CHARACTER_FIELDS_SECTIONS">
              {(providedDroppable) => (
                <div className="relative flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                  {template.character_fields_sections?.length
                    ? template.character_fields_sections.map((section, index) => (
                        <Draggable draggableId={section.id || section.title + index} index={index} key={section.id}>
                          {(provided, draggableSnapshot) => (
                            <div
                              className={`my-1 flex flex-nowrap items-center gap-x-2 ${
                                draggableSnapshot.isDragging ? "rounded shadow-sm" : ""
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                right: 16,
                              }}>
                              <div {...provided.dragHandleProps} className="self-start">
                                <Icon fontSize={24} icon={IconEnum.menu} />
                              </div>
                              <Input
                                label="Section title (must be unique)"
                                name={`character_fields_sections[${index}].title`}
                                onChange={handleChange}
                                value={section.title}
                                variant={
                                  !section.title ||
                                  template.character_fields_sections?.some(
                                    (s) => s.id !== section.id && s.title === section.title
                                  )
                                    ? "error"
                                    : "primary"
                                }
                              />
                              <div className="self-end pb-2.5">
                                <Button
                                  hasNoBackground
                                  icon={IconEnum.trash}
                                  isIconOnly
                                  onClick={() => {
                                    setGroupedFields((prev) => {
                                      if (!prev?.[section.id]) return prev;

                                      const tempGrouped = { ...prev };
                                      if (tempGrouped?.[section.id]) {
                                        const temp = tempGrouped[section.id].map((field) => ({ ...field, section_id: null }));
                                        tempGrouped["null"] = (tempGrouped["null"] || []).concat(temp);

                                        return omit(tempGrouped, section.id);
                                      }
                                      return prev;
                                    });

                                    handleChange({
                                      name: "character_fields_sections",
                                      value: (template?.character_fields_sections || []).toSpliced(index, 1),
                                    });
                                  }}
                                  variant="error"
                                />
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

      {tabs[selectedTab].id === "4" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={template?.owner_id}
          permissions={template?.permissions || []}
          related_id={template?.id || null}
          selectablePermissions={[
            "read_character_fields_templates",
            "update_character_fields_templates",
            "delete_character_fields_templates",
          ]}
        />
      ) : null}
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={
            isSaveDisabled(template) ||
            isLoading ||
            (data?.id && !permissions?.update_character_fields_templates) ||
            (!data?.id && !permissions?.create_character_fields_templates)
          }
          isLoading={isLoading}
          label={data?.id ? "Update" : "Create"}
          onClick={async () => {
            if (!data?.id) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { tags, character_fields, character_fields_sections, ...rest } = template;
              const parsedData = InsertTemplateSchema.parse({
                data: rest,
                relations: {
                  tags,
                  character_fields: Object.values(groupedFields).flat(),
                  character_fields_sections,
                },
                permissions: template.permissions,
              });
              await create(parsedData, {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes("character_fields_templates"),
                  });
                  setTemplate({
                    title: "",
                    project_id: project_id as string,
                    sort: 0,
                    tags: [],
                  });
                  resetDrawerAtom();
                },
              });
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { tags, character_fields, character_fields_sections, ...rest } = template;
              const parsedData = UpdateTemplateSchema.parse({
                data: rest,
                relations: {
                  tags,
                  character_fields: Object.values(groupedFields).flat(),
                  character_fields_sections,
                },
                permissions: template.permissions,
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
    </DrawerLayout>
  );
}
