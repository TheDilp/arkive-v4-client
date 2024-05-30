import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useAtomValue } from "jotai";
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
import {
  DocumentType,
  DrawerAtomType,
  InsertDocumentType,
  TabType,
  UpdateDocumentType,
  UserHasPermissionsType,
} from "../../../types";
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
import { InsertDocumentSchema, UpdateDocumentSchema } from "../../../validation";
import { FolderSelect, ImageSelect, MatchField } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, TagInput } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Badge, Icon, Skeleton } from "../../Misc";
import { ColorPicker } from "../ColorPicker";
import { IconPicker } from "../IconPicker";

function isSaveDisabled(document: Partial<DocumentType>) {
  if (!document.title) return true;

  return false;
}

type Props = {
  data: {
    id?: string;
    title?: string;
    preselectedTab?: number;
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
    },
  );
  const permissions = useHasPermissions(
    ["create_documents", "update_documents", "read_tags"],
    existingDocument?.data?.owner_id,
  );
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_documents,
    permissions?.update_documents,
    permissions?.is_owner,
    data?.id,
  );
  const [document, setDocument] = useState<Partial<DocumentType | InsertDocumentType> & { project_id: string }>(
    existingDocument?.data || {
      title: data.title,
      parent_id: exceptions?.globalCreate ? null : item_id,
      project_id: project_id as string,
    },
  );

  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: Partial<InsertDocumentType> & { project_id: string };
    relations?: documentRelationsType;
  }>("documents", exceptions?.createTemplate);

  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{
    data: UpdateDocumentType;
  }>("documents", project_id as string);

  const [alterNameInput, setAlterNameInput] = useState("");
  const tabs = getTabs(permissions, document?.is_template, data?.id);
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

          <div className="flex flex-wrap gap-2">
            {document?.alter_names?.length
              ? document.alter_names.map((alter_name) => (
                  <div key={alter_name.title} className="w-fit">
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

          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox
              isDisabled={!canCreateOrEdit}
              name="is_public"
              onChange={handleChange}
              value={document?.is_public ?? false}
            />
          </div>
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
                      parent_id: "",
                      value: "",
                      formula: null,
                      derive_formula: null,
                      derive_from: null,
                      entity_type: null,
                      is_randomized: null,
                      sort: document?.template_fields?.length || 0,
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
                (f, i) => ({ ...f, sort: i }),
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
                    <Draggable key={f.id} draggableId={f.id || f.key + idx} index={idx}>
                      {(providedDraggable) => (
                        <div
                          className="my-1 flex w-full flex-nowrap gap-x-2"
                          {...providedDraggable.draggableProps}
                          ref={providedDraggable.innerRef}>
                          <div {...providedDraggable.dragHandleProps} className="self-center">
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
                              label={getSentenceCase(f.key) || "New key"}>
                              <div key={f.id} className="flex max-h-[80%] flex-col gap-y-2 overflow-auto p-2">
                                <MatchField
                                  allMatches={document?.template_fields || []}
                                  derive_formula={f.derive_formula}
                                  derive_from={f.derive_from}
                                  entity_type={f?.entity_type}
                                  formula={f.formula}
                                  handleChange={handleChange}
                                  idx={idx}
                                  is_randomized={f?.is_randomized}
                                  isEditable
                                  match={f?.key}
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
          isDisabled={isSaveDisabled({ title: document?.title }) || !canCreateOrEdit || isFetching || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={document?.id ? "Update" : "Create"}
          onClick={async () => {
            if (changedData) {
              if (document?.id) {
                const documentToUpdate = {
                  ...(changedData || {}),
                  id: document.id,
                  parent_id: document.parent_id,
                } as DocumentType;
                const { alter_names, template_fields, tags, image, ...rest } = documentToUpdate;

                const parsedData = UpdateDocumentSchema.parse({
                  data: { ...rest, image_id: image?.id },
                  relations: {
                    tags,
                    alter_names: (alter_names || []).map((alter_name: { title: string }) => ({ ...alter_name, project_id })),
                    template_fields: template_fields.map((f) => ({ ...f, key: f.key.trim() })),
                  },
                  permissions: document?.permissions,
                });
                await update(
                  {
                    ...parsedData,
                    data: {
                      ...parsedData.data,
                      icon: parsedData.data.icon as AvailableIcons | null,
                      content: parsedData.data.content as RemirrorJSON,
                    },
                  },
                  {
                    onSuccess: resetDrawerAtom,
                  },
                );
              } else {
                const dataToParse = {
                  data: { ...document, image_id: document?.image?.id },
                  relations: {
                    alter_names: document?.alter_names,
                    tags: document?.tags,
                    template_fields: (document?.template_fields || []).map((f) => ({ ...f, key: f.key.trim() })),
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
                    onSuccess: resetDrawerAtom,
                  },
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
