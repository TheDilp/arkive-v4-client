import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { DocumentType, UpdateDocumentType } from "../../../types";
import { DefaultTagColor, drawerAtom, IconEnum, useNotifications } from "../../../utils";
import { InsertDocumentSchema, UpdateDocumentSchema } from "../../../validation";
import { ImageSelect } from "../../Complex";
import { Button, Checkbox, Input, TagInput } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Badge, Skeleton } from "../../Misc";
import { ColorPicker } from "../ColorPicker";
import { IconPicker } from "../IconPicker";

interface InsertDocumentType extends Omit<DocumentType, "alter_names"> {
  alter_names: { title: string }[];
}

function isSaveDisabled(document: Partial<DocumentType>) {
  if (!document.title) return true;
  return false;
}

type Props = {
  data: {
    id?: string;
  };
};

type documentRelationsType = {
  tags?: { id: string }[];
  alter_names?: { title: string }[];
};

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Tags", icon: IconEnum.tags },
];
export function DocumentDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawerAtom = useResetAtom(drawerAtom);

  const { data: existingDocument, isFetching } = useGetEntity<DocumentType>(
    data?.id,
    "documents",
    {
      data: {},
      relations: { alter_names: true, tags: true },
      fields: ["id", "title", "icon", "parent_id", "image_id", "dice_color", "is_public"],
    },
    {
      enabled: !!data?.id,
    },
  );

  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: Partial<InsertDocumentType> & { project_id: string };
    relations?: documentRelationsType;
  }>("documents");

  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{
    data: UpdateDocumentType;
  }>("documents", project_id as string);

  const [document, setDocument] = useState<Partial<DocumentType | InsertDocumentType> & { project_id: string }>(
    existingDocument?.data || { project_id: project_id as string },
  );
  const [alterNameInput, setAlterNameInput] = useState("");

  const currentAlterNames = document?.alter_names?.map((alter_name) => alter_name.title);

  const { changedData, handleChange } = useHandleChange({ data: document, setData: setDocument });

  useLayoutEffect(() => {
    if (existingDocument?.data) setDocument(existingDocument?.data);
  }, [existingDocument]);

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-nowrap gap-x-2">
            <Input
              label="Document title (required)"
              name="title"
              onChange={handleChange}
              placeholder="E.g. Important document"
              value={document?.title || ""}
            />
            <div className="self-end pb-1.5">
              <IconPicker icon={document?.icon || IconEnum.document} name="icon" onChange={handleChange} />
            </div>
          </div>
          <ImageSelect
            isIconOnly
            label="Document image (optional)"
            name="image_id"
            onChange={handleChange}
            type="images"
            value={document?.image_id}
          />
          <Input
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
            placeholder="Press enter to add an alternative name"
            value={alterNameInput}
          />

          <div className="flex flex-wrap gap-2">
            {document?.alter_names?.length
              ? document.alter_names.map((alter_name) => (
                  <div key={alter_name.title} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({
                          name: "alter_names",
                          value: (document?.alter_names || []).filter((a_n) => a_n.title !== alter_name.title),
                        });
                      }}
                      label={alter_name.title}
                      size="lg"
                    />
                  </div>
                ))
              : null}
          </div>
          <div className="flex gap-x-2">
            <span>Dice color:</span>
            <div className="ml-auto self-end pb-2">
              <ColorPicker name="dice_color" onChange={handleChange} value={document?.dice_color || DefaultTagColor} />
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={document?.is_public ?? false} />
          </div>
        </div>
      ) : null}

      {selectedTab === 1 ? (
        <div className="flex flex-col gap-y-2">
          <TagInput handleChange={handleChange} isMultiple tags={document?.tags || []} />
        </div>
      ) : null}
      <Button
        icon={document?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled({ title: document?.title }) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={document?.id ? "Update" : "Create"}
        onClick={async () => {
          if (changedData) {
            if (document?.id) {
              const documentToUpdate = { ...(changedData || {}), id: document.id, parent_id: document.parent_id };
              const { alter_names, tags, ...rest } = documentToUpdate;
              const parsedData = UpdateDocumentSchema.parse({
                data: rest,
                relations: {
                  tags,
                  alter_names: (alter_names || []).map((alter_name: { title: string }) => ({ ...alter_name, project_id })),
                },
              });
              await update(
                { ...parsedData, data: { ...parsedData.data, content: parsedData.data.content as RemirrorJSON } },
                {
                  onSuccess: resetDrawerAtom,
                },
              );
            } else {
              const dataToParse = {
                data: document,
                relations: {
                  alter_names: document?.alter_names,
                  tags: document?.tags,
                },
              };
              dataToParse.data.parent_id = item_id;
              const parsedData = InsertDocumentSchema.parse(dataToParse);
              await create(
                { ...parsedData, data: { ...parsedData.data, content: parsedData.data.content as RemirrorJSON } },
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
    </DrawerLayout>
  );
}
