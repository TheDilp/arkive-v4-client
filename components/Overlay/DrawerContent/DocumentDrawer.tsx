import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useAtomValue } from "jotai";
import set from "lodash.set";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import {
  useCreateEntity,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import { DocumentType, DrawerAtomType, InsertDocumentType, TabType, UserHasPermissionsType } from "../../../types";
import {
  AvailableIcons,
  createOrEditPermission,
  DefaultTagColor,
  getSentenceCase,
  IconEnum,
  reorder,
  useNotifications,
  userAtom,
} from "../../../utils";
import { InsertDocumentSchema, UpdateDocumentSchema, UpdateDocumentType } from "../../../validation";
import { FolderSelect, ImageSelect, MatchField } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, TagInput } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Badge, Icon, Skeleton } from "../../Misc";
import { ColorPicker } from "../ColorPicker";
import { IconPicker } from "../IconPicker";

function isSaveDisabled(document: Partial<DocumentType | InsertDocumentType>, is_template?: boolean) {
  if (!document.title) return true;
  if (is_template) {
    for (let index = 0; index < (document?.template_fields?.length || 0); index++) {
      if (document.template_fields?.[index]?.entity_type === "custom" && !document.template_fields?.[index]?.value) {
        return true;
      }
      if (document.template_fields?.[index]?.entity_type === "dice_roll" && !document.template_fields?.[index]?.formula) {
        return true;
      }
      if (
        document.template_fields?.[index]?.entity_type === "derived" &&
        (!document.template_fields?.[index]?.derive_formula || !document.template_fields?.[index]?.derive_from)
      ) {
        return true;
      }
      if (
        document.template_fields?.[index]?.entity_type === "blueprint_instances" &&
        !document?.template_fields?.[index]?.blueprint_id
      )
        return true;
      if (document.template_fields?.[index]?.entity_type === "map_pins" && !document?.template_fields?.[index]?.map_id)
        return true;
      if (document.template_fields?.[index]?.entity_type === "events" && !document?.template_fields?.[index]?.calendar_id)
        return true;
      if (document.template_fields?.[index]?.entity_type === "words" && !document?.template_fields?.[index]?.dictionary_id)
        return true;
    }
  }

  return false;
}

type Props = {
  data: {
    id?: string;
    title?: string;
    preselectedTab?: number;
    getContext?: ReactFrameworkOutput<Remirror.Extensions>;
    range?: { from: number | undefined; to: number | undefined };
  };
  exceptions: DrawerAtomType["exceptions"];
};

type documentRelationsType = {
  tags?: { id: string }[];
  alter_names?: { title: string }[];
};

function getTabs(permissions: UserHasPermissionsType, isTemplate: boolean | null | undefined, id: string | undefined) {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];
  if (isTemplate) {
    tabs.push({ id: "template", label: "Template keys", icon: IconEnum.document_templates });
  }

  if (permissions?.read_tags) {
    tabs.push({ id: "2", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}
export function DocumentDrawer({ data, exceptions }: Props) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const [selectedTab, setSelectedTab] = useState(data?.preselectedTab || 0);
  const [createMention, setCreateMention] = useState(true);
  const user = useAtomValue(userAtom);
  const resetDrawerAtom = useToggledResetAtom();

  const {
    data: existingDocument,
    isFetching,
    isInitialLoading,
  } = useGetEntity<DocumentType>(
    data?.id,
    "documents",
    {
      data: {},
      relations: { alter_names: true, tags: true, image: true, template_fields: true },
      permissions: true,
      fields: ["id", "title", "icon", "parent_id", "is_template", "dice_color", "is_public", "owner_id"],
    },
    {
      enabled: !!data?.id,
      queryKeyConcat: ["drawer"],
    }
  );
  const permissions = useHasPermissions(
    ["create_documents", "update_documents", "read_tags"],
    existingDocument?.data?.owner_id
  );
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_documents,
    permissions?.update_documents,
    permissions?.is_owner,
    data?.id
  );
  const [document, setDocument] = useState<Partial<DocumentType | InsertDocumentType> & { project_id: string }>(
    existingDocument?.data || {
      title: data.title,
      parent_id: exceptions?.globalCreate ? null : item_id,
      project_id: project_id as string,
    }
  );

  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: Partial<InsertDocumentType> & { project_id: string };
    relations?: documentRelationsType;
  }>("documents", exceptions?.createTemplate);

  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateDocumentType>("documents", project_id as string);

  const [alterNameInput, setAlterNameInput] = useState("");
  const tabs = getTabs(permissions, document?.is_template || exceptions?.createTemplate, data?.id);
  const currentAlterNames = document?.alter_names?.map((alter_name) => alter_name.title);

  const { changedData, handleChange } = useHandleChange({ data: document, setData: setDocument });

  useLayoutEffect(() => {
    if (existingDocument?.data) setDocument(existingDocument?.data);
  }, [existingDocument]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-nowrap gap-x-2">
            <Input
              isDisabled={!canCreateOrEdit}
              label="Document title (required)"
              name="title"
              onChange={handleChange}
              placeholder="E.g. Important document"
              value={document?.title || ""}
              variant={document?.title ? "primary" : "error"}
            />
            <div className="self-end pb-1.5">
              <IconPicker
                icon={document?.icon || IconEnum.document}
                isDisabled={!canCreateOrEdit}
                name="icon"
                onChange={handleChange}
              />
            </div>
          </div>
          {!document?.image?.id ? (
            <ImageSelect
              isDisabled={!canCreateOrEdit}
              isIconOnly
              name="image"
              onChange={({ name, label, value }) => {
                handleChange({ name, value: { id: value, title: label } });
              }}
              type="images"
              value={document?.image?.id ?? ""}
            />
          ) : (
            <ImagePreview
              clearAction={!canCreateOrEdit ? undefined : () => handleChange({ name: "image", value: null })}
              id={document?.image?.id}
              title={document?.image?.title}
            />
          )}
          {exceptions?.createTemplate ? null : (
            <Input
              helperText={exceptions?.createTemplate ? "Templates cannot use alternative names" : ""}
              isDisabled={exceptions?.createTemplate || !canCreateOrEdit}
              label="Alternative names"
              name="alter_names"
              onChange={({ value }) => setAlterNameInput(value as string)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && alterNameInput) {
                  if (currentAlterNames?.includes(alterNameInput)) {
                    createNotification({
                      title: "Cannot add the same alternative name twice.",
                      variant: "warning",
                      icon: IconEnum.info_circle,
                      timer: 3,
                    });
                  } else {
                    handleChange({
                      name: "alter_names",
                      value: (document?.alter_names || []).concat({
                        title: alterNameInput,
                      }),
                    });
                    setAlterNameInput("");
                  }
                }
              }}
              placeholder={exceptions?.createTemplate ? "" : "Press enter to add an alternative name"}
              value={alterNameInput}
            />
          )}

          <div className="flex flex-wrap gap-2">
            {document?.alter_names?.length
              ? document.alter_names.map((alter_name) => (
                  <div className="w-fit" key={alter_name.title}>
                    <Badge
                      clearAction={
                        canCreateOrEdit
                          ? () => {
                              handleChange({
                                name: "alter_names",
                                value: (document?.alter_names || []).filter((a_n) => a_n.title !== alter_name.title),
                              });
                            }
                          : undefined
                      }
                      label={alter_name.title}
                      size="lg"
                    />
                  </div>
                ))
              : null}
          </div>
          <FolderSelect
            handleChange={handleChange}
            isDisabled={!canCreateOrEdit}
            parent_id={document?.parent_id ?? null}
            type="documents"
          />

          <div className="flex gap-x-2">
            <span>Dice color:</span>
            <div className="ml-auto self-end pb-2">
              <ColorPicker
                isDisabled={!canCreateOrEdit}
                name="dice_color"
                onChange={handleChange}
                value={document?.dice_color || DefaultTagColor}
              />
            </div>
          </div>

          {document?.is_template ? null : (
            <div className="flex w-full items-center justify-between">
              <span>Is public:</span>
              <Checkbox
                isDisabled={!canCreateOrEdit}
                name="is_public"
                onChange={handleChange}
                value={document?.is_public ?? false}
              />
            </div>
          )}
          {exceptions?.mention ? (
            <li className="flex w-full items-center justify-between">
              <span>Create mention:</span>
              <Checkbox
                isDisabled={!canCreateOrEdit}
                name="create_mention"
                onChange={(e) => setCreateMention(e.value)}
                value={createMention}
              />
            </li>
          ) : null}
        </div>
      ) : null}

      {tabs[selectedTab].id === "template" ? (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg">Add key:</span>
            <div className="ml-auto h-8 w-8">
              <Button
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: "template_fields",
                    value: (document?.template_fields || []).concat({
                      id: crypto.randomUUID(),
                      key: "",
                      value: "",
                      formula: null,
                      derive_formula: null,
                      derive_from: null,
                      parent_id: "",
                      entity_type: "documents",
                      related: [],
                      is_randomized: null,
                      random_count: "single",
                      sort: document?.template_fields?.length || 0,
                      additional_data: null,
                    }),
                  })
                }
                variant="info"
              />
            </div>
          </div>
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) {
                return;
              }

              const newData = reorder(document?.template_fields || [], result.source.index, result.destination.index).map(
                (f, i) => ({ ...f, sort: i })
              );
              handleChange({
                name: "template_fields",
                // Saving sort field is not required
                // As the order is preserved in JSON
                value: newData,
              });
            }}>
            <Droppable droppableId="template_droppable">
              {(providedDroppable) => (
                <div className="flex w-full flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                  {(document?.template_fields || [])?.map((f, idx) => (
                    <Draggable draggableId={f.id || f.key + idx} index={idx} key={f.id}>
                      {(providedDraggable) => (
                        <div
                          className="my-1 flex w-full flex-nowrap gap-x-2"
                          {...providedDraggable.draggableProps}
                          ref={providedDraggable.innerRef}>
                          <div {...providedDraggable.dragHandleProps} className="mt-1 self-start">
                            <Icon fontSize={24} icon={IconEnum.menu} />
                          </div>
                          <div className="w-full">
                            <Collapsible
                              actions={[
                                {
                                  icon: IconEnum.trash,
                                  onClick: () => {
                                    const newFields = (document?.template_fields || []).filter((_, i) => i !== idx);
                                    handleChange({ name: "template_fields", value: newFields });
                                  },
                                  variant: "error",
                                  isIconOnly: true,
                                  hasNoBackground: true,
                                },
                              ]}
                              initialOpen={f.key === "New key" || !f.key}
                              isIgnoringOpenChanges
                              label={getSentenceCase(f.key) || "New key"}>
                              <div
                                className="flex max-h-[80%] max-w-full flex-col gap-y-2 overflow-auto overflow-x-auto p-2"
                                key={f.id}>
                                <MatchField
                                  additional_data={f.additional_data}
                                  allMatches={document?.template_fields || []}
                                  blueprint_id={f.blueprint_id}
                                  calendar_id={f.calendar_id}
                                  derive_formula={f.derive_formula}
                                  derive_from={f.derive_from}
                                  dictionary_id={f.dictionary_id}
                                  entity_type={f?.entity_type}
                                  formula={f.formula}
                                  handleChange={handleChange}
                                  idx={idx}
                                  isEditable
                                  is_randomized={f?.is_randomized}
                                  map_id={f.map_id}
                                  match={f?.key}
                                  random_count={f.random_count}
                                  related={f.related}
                                  value={f?.value}
                                />
                              </div>
                            </Collapsible>
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
        </div>
      ) : null}

      {tabs[selectedTab].id === "2" && permissions?.read_tags ? (
        <TagInput handleChange={handleChange} isDisabled={!canCreateOrEdit} isMultiple tags={document?.tags || []} />
      ) : null}
      {tabs[selectedTab].id === "3" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={document?.owner_id}
          permissions={document?.permissions || []}
          related_id={document?.id || null}
          selectablePermissions={["read_documents", "update_documents", "delete_documents"]}
        />
      ) : null}
      <div>
        <Button
          icon={document?.id ? IconEnum.save : IconEnum.add}
          isDisabled={
            isSaveDisabled(document, exceptions?.createTemplate) || !canCreateOrEdit || isFetching || isCreating || isUpdating
          }
          isLoading={isCreating || isUpdating}
          label={document?.id ? "Update" : "Create"}
          onClick={async () => {
            if (changedData || data?.title) {
              if (document?.id) {
                const documentToUpdate = {
                  ...(changedData || {}),
                  id: document.id,
                  parent_id: document.parent_id,
                } as DocumentType;
                const { alter_names, template_fields, tags, image, ...rest } = documentToUpdate;

                const dataToParse = {
                  data: { ...rest, image_id: image?.id },
                  relations: {},
                  permissions: document?.permissions,
                };

                if (tags) {
                  set(dataToParse, "relations.tags", tags);
                }
                if (alter_names) {
                  set(dataToParse, "relations.alter_names", alter_names);
                }
                if (template_fields) {
                  set(
                    dataToParse,
                    "relations.template_fields",
                    (template_fields || []).map((f) => ({ ...f, key: f.key.trim() }))
                  );
                }

                const parsedData = UpdateDocumentSchema.parse(dataToParse);
                await update(
                  {
                    ...parsedData,
                    data: {
                      ...parsedData.data,
                      icon: parsedData.data.icon as AvailableIcons | null,
                      content: parsedData.data.content as RemirrorJSON,
                    },
                    relations: dataToParse.relations || {},
                    permissions: document?.permissions,
                  },
                  {
                    onSuccess: resetDrawerAtom,
                  }
                );
              } else {
                const dataToParse = {
                  data: { ...document, image_id: document?.image?.id },
                  relations: {
                    alter_names: (document?.alter_names || [])?.map((alter) => ({ title: alter?.title })),
                    tags: document?.tags,
                    template_fields: (document?.template_fields || []).map((f) => {
                      return { ...f, key: f.key.trim() };
                    }),
                  },
                  permissions: document?.permissions,
                };
                dataToParse.data.parent_id = exceptions?.globalCreate ? null : item_id;
                dataToParse.data.owner_id = user?.id;
                const parsedData = InsertDocumentSchema.parse(dataToParse);
                await create(
                  {
                    ...parsedData,
                    data: {
                      ...parsedData.data,
                      icon: parsedData.data.icon as AvailableIcons | null,
                      content: parsedData.data.content as RemirrorJSON,
                    },
                  },
                  {
                    onSuccess: (res) => {
                      if (res?.ok && createMention) {
                        if (
                          exceptions?.mention &&
                          data?.getContext &&
                          typeof data.range?.from === "number" &&
                          typeof data.range?.to === "number" &&
                          res?.data?.id
                        ) {
                          data.getContext.chain
                            .delete({ from: Number(data.range.from), to: Number(data.range.to) })
                            .createMentionAtom(
                              {
                                name: "documents",
                                range: {
                                  from: data.range.from,
                                  cursor: data.range.to,
                                  to: data.range.to,
                                },
                              },
                              {
                                id: res?.data?.id,
                                label: data?.title || "",
                                name: "documents",
                                icon: undefined,
                                projectId: project_id,
                                parent_id: undefined,
                              }
                            )
                            .run();
                        }
                      }
                      resetDrawerAtom();
                    },
                  }
                );
              }
            } else {
              createNotification({
                variant: "info",
                icon: IconEnum.info_circle,
                title: "No data was changed.",
                timer: 3,
              });
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
