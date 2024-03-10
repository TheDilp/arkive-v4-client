import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { MutableRefObject, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions, useUpdateEntity } from "../../../hooks";
import { InputOnChangeValue, onChangeValue, TabType, UserHasPermissionsType } from "../../../types";
import { BlueprintFieldType, BlueprintStateType, BlueprintType } from "../../../types/EntityTypes/blueprintTypes";
import {
  BlueprintFieldTypesEnum,
  createOrEditPermission,
  dialogAtom,
  drawerAtom,
  IconEnum,
  MessageEnum,
  reorder,
} from "../../../utils";
import { DiceRollRegex } from "../../../utils/ui/diceRollerUtils";
import { InsertBlueprintSchema, InsertBlueprintType, UpdateBlueprintSchema, UpdateBlueprintType } from "../../../validation";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input, Search, Select } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";
import { IconPicker } from "../IconPicker";

function isSaveDisabled(blueprint: BlueprintStateType) {
  if (!blueprint?.title) return true;
  if (!blueprint?.title_name) return true;
  if (
    blueprint?.blueprint_fields?.length &&
    blueprint.blueprint_fields.some(
      (field) =>
        !field.title ||
        !field.field_type ||
        ((field.field_type === "select_multiple" || field.field_type === "select") && !field?.options?.length) ||
        (field.field_type === "dice_roll" && !field?.formula) ||
        (field.field_type === "random_table" && !field.random_table_id) ||
        (field.field_type === "date" && !field?.calendar_id),
    )
  )
    return true;

  return false;
}

function getTabs(permissions: UserHasPermissionsType) {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Fields", icon: IconEnum.additional_fields },
  ];

  if (permissions?.is_owner) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
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
  isDisabled,
  blueprint_id,
  blueprint,
  changeField,
}: (Omit<BlueprintFieldType, "options"> & { options?: { id: string; value: string }[] }) & {
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
            name={`blueprint_fields[${index}].title`}
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
            name={`blueprint_fields[${index}].field_type`}
            onChange={changeField}
            options={BlueprintFieldTypesEnum}
            placeholder="Field type"
            value={field_type}
          />
        </div>

        {field_type === "select" || field_type === "select_multiple" ? (
          <div className="h-10 w-8 self-end">
            <Button
              hasNoBackground
              icon={IconEnum.add}
              isDisabled={isLoading || isDisabled}
              onClick={() =>
                changeField({
                  name: `blueprint_fields[${index}].options`,
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
              name: `blueprint_fields[${index}].options`,
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
                            name={`blueprint_fields[${index}].options[${optIndex}].value`}
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
                                  name: `blueprint_fields[${index}].options`,
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
              isDisabled={isLoading || isDisabled}
              label="Dice formula"
              name={`blueprint_fields[${index}].formula`}
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
            isDisabled={isLoading || isDisabled}
            label="Random table"
            name={`blueprint_fields[${index}].random_table_id`}
            onChange={changeField}
            searchEntity="random_tables"
            value={random_table_id || ""}
          />
        </div>
      ) : null}
      {field_type === "blueprints_single" || field_type === "blueprints_multiple" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={blueprint?.title || ""}
            isDisabled={isLoading || isDisabled}
            label="Blueprint"
            name={`blueprint_fields[${index}].blueprint_id`}
            onChange={changeField}
            searchEntity="blueprints"
            value={blueprint_id || ""}
          />
        </div>
      ) : null}
      {field_type === "date" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <Search
            hasShownOption
            initialDisplayValue={calendar?.title || ""}
            isDisabled={isLoading || isDisabled}
            label="Calendar"
            name={`blueprint_fields[${index}].calendar_id`}
            onChange={changeField}
            searchEntity="calendars"
            value={calendar_id || ""}
          />
        </div>
      ) : null}
    </div>
  );
}

export function BlueprintDrawer({ data }: { data: { id?: string } }) {
  const queryClient = useQueryClient();
  const { project_id } = useParams();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const setDialogAtom = useSetAtom(dialogAtom);
  const [selectedTab, setSelectedTab] = useState(0);

  const fieldContainerRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertBlueprintType>("blueprints");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateBlueprintType>(
    "blueprints",
    project_id as string,
  );

  const { data: existingBlueprint, isFetching } = useGetEntity<BlueprintType>(
    data?.id,
    "blueprints",
    {
      data: {
        id: data?.id,
      },
      fields: ["id", "title", "project_id", "icon", "title_name", "owner_id"],
      relations: {
        blueprint_fields: true,
      },
      permissions: true,
    },
    {
      enabled: !!data?.id,
      queryKeyConcat: ["drawer"],
    },
  );
  const permissions = useHasPermissions(["create_blueprints", "update_blueprints"], existingBlueprint?.data?.owner_id);
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_blueprints,
    permissions?.update_blueprints,
    permissions?.is_owner,
    data?.id,
  );
  const tabs = getTabs(permissions);
  const [blueprint, setBlueprint] = useState<BlueprintStateType>({
    title: "",
    project_id: project_id as string,
    blueprint_fields: [],
  });

  const { handleChange } = useHandleChange({ data: blueprint, setData: setBlueprint });
  const isLoading = isFetching || isCreating || isUpdating;

  useLayoutEffect(() => {
    if (existingBlueprint?.data && !blueprint.title) {
      setBlueprint(existingBlueprint?.data);
    }
  }, [existingBlueprint?.data]);

  if (isFetching) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex flex-nowrap items-center gap-x-2">
            <div className="flex flex-1 flex-nowrap items-center gap-x-2">
              <Input
                isDisabled={isLoading || !canCreateOrEdit}
                label="Blueprint title (required)"
                name="title"
                onChange={handleChange}
                placeholder="Eg. Organizations"
                value={blueprint?.title || ""}
              />
              <div className="self-end pb-1.5">
                <IconPicker
                  icon={blueprint?.icon || IconEnum.blueprint}
                  isDisabled={!canCreateOrEdit}
                  name="icon"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-x-2">
              <div className="h-full flex-1">
                <Input
                  isDisabled={isLoading || !canCreateOrEdit}
                  label="Field title"
                  name="title_name"
                  onChange={handleChange}
                  placeholder="Eg. Name / Title / First name / etc."
                  value={blueprint.title_name || ""}
                />
              </div>
              <div className="h-full w-1/4">
                <Select
                  isDisabled
                  label="Field type"
                  name="title_type"
                  onChange={() => {}}
                  options={BlueprintFieldTypesEnum}
                  placeholder="Field type"
                  value="text"
                />
              </div>
            </div>
            <span className="text-sm text-zinc-400">
              This field is required but can be renamed. It is used to display the blueprint instance in the table of all
              instances for this blueprint, and is used for searching, sorting, etc.
            </span>
          </div>
        </>
      ) : null}

      {tabs[selectedTab].id === "2" ? (
        <>
          {canCreateOrEdit ? (
            <div className="flex items-center justify-between">
              <span>Insert new field:</span>
              <div className="h-8 w-8">
                <Button
                  icon={IconEnum.add}
                  isDisabled={isLoading || !canCreateOrEdit}
                  onClick={() => {
                    handleChange({
                      name: "blueprint_fields",
                      value: (blueprint.blueprint_fields || []).concat({
                        id: crypto.randomUUID(),
                        title: "New field",
                        field_type: "text",
                        // width: "half",
                        sort: blueprint?.blueprint_fields?.length ?? 0,
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
          ) : null}
          <DragDropContext
            onDragEnd={
              canCreateOrEdit
                ? (result) => {
                    if (!result.destination) {
                      return;
                    }

                    const newData = reorder(blueprint?.blueprint_fields || [], result.source.index, result.destination.index);
                    setBlueprint((prev) => ({
                      ...prev,
                      blueprint_fields: newData.map((blue_field, index) => ({ ...blue_field, sort: index })),
                    }));
                  }
                : () => {}
            }>
            <Droppable droppableId="droppable" isDropDisabled={!canCreateOrEdit}>
              {(providedDroppable) => (
                <div
                  className="flex max-h-[75%] flex-col content-start justify-start overflow-y-auto"
                  {...providedDroppable.droppableProps}
                  ref={providedDroppable.innerRef}>
                  {blueprint.blueprint_fields?.length
                    ? blueprint.blueprint_fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id || field.title + index}
                          index={index}
                          isDragDisabled={!canCreateOrEdit}>
                          {(provided, draggableSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              className={`my-1 flex flex-nowrap items-center gap-x-2 ${
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
                                      isDisabled: !canCreateOrEdit,
                                      variant: "error",
                                      onClick: () =>
                                        field?.title
                                          ? setDialogAtom((prev) => ({
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
                                                    name: "blueprint_fields",
                                                    value: blueprint?.blueprint_fields?.filter((f) => f.id !== field.id),
                                                  }),
                                              },
                                            }))
                                          : handleChange({
                                              name: "blueprint_fields",
                                              value: blueprint?.blueprint_fields?.filter((f) => f.id !== field.id),
                                            }),
                                    },
                                  ]}
                                  initialOpen={
                                    field.title === "New field" &&
                                    field.field_type === "text" &&
                                    index === (blueprint?.blueprint_fields?.length || 1) - 1
                                  }
                                  label={field?.title}>
                                  <FieldRow
                                    blueprint={field?.blueprint}
                                    blueprint_id={field?.blueprint_id}
                                    calendar={field?.calendar}
                                    calendar_id={field?.calendar_id}
                                    changeField={handleChange}
                                    field_type={field.field_type}
                                    formula={field?.formula}
                                    id={field.id}
                                    index={index}
                                    isDisabled={!canCreateOrEdit}
                                    isLoading={isLoading}
                                    options={field?.options || []}
                                    random_table={field?.random_table}
                                    random_table_id={field?.random_table_id}
                                    sort={field.sort}
                                    title={field.title}
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
        </>
      ) : null}

      {tabs[selectedTab].id === "3" && permissions.is_owner ? (
        <EntityPermission
          handleChange={handleChange}
          permissions={blueprint?.permissions || []}
          related_id={blueprint?.id || ""}
          selectablePermissions={["read_documents", "update_documents", "delete_documents"]}
          type="documents"
        />
      ) : null}
      <div className="mt-auto">
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(blueprint) || isLoading || !canCreateOrEdit}
          isLoading={isLoading}
          label={data?.id ? "Update" : "Create"}
          onClick={async () => {
            if (!data?.id) {
              const { blueprint_fields, ...rest } = blueprint;

              const parsedData = InsertBlueprintSchema.parse({
                data: { ...rest, project_id },
                permissions: rest?.permissions,
                relations: {
                  blueprint_fields,
                },
              });
              await create(parsedData, {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes("blueprints"),
                  });
                  resetDrawerAtom();
                },
              });
            } else {
              const { blueprint_fields, ...rest } = blueprint;

              const parsedData = UpdateBlueprintSchema.parse({
                data: rest,
                permissions: rest?.permissions,
                relations: {
                  blueprint_fields,
                },
              });
              await update(parsedData, {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes("blueprints"),
                  });
                  queryClient.invalidateQueries(["allEntities", project_id, "blueprint_instances"]);
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
