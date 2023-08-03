import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useCreateSubEntity, useGetEntity, useHandleChange } from "../../../hooks";
import { DocumentType, InsertDocumentType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { InsertDocumentSchema } from "../../../validation";
import { ImageSelect } from "../../Complex";
import { Button, Input, Search } from "../../Form";
import { Tabs } from "../../Layout";
import { Badge } from "../../Misc";

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
  { id: "2", label: "Links", icon: IconEnum.link },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];
export function DocumentDrawer({ data }: Props) {
  const { project_id } = useParams();
  const createNotification = useNotifications();
  const [selectedTab, setSelectedTab] = useState(0);

  const { data: existingDocument } = useGetEntity<DocumentType>(
    data?.id,
    "documents",
    {
      data: {},
      relations: { alter_names: true, tags: true },
      fields: ["id", "title", "image_id"],
    },
    {
      enabled: !!data?.id,
    },
  );

  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: Partial<InsertDocumentType> & { project_id: string };
    relations?: documentRelationsType;
  }>("documents");
  const { mutate: createAlterName } = useCreateSubEntity("alter_names");

  const [document, setDocument] = useState<Partial<DocumentType | InsertDocumentType> & { project_id: string }>(
    existingDocument?.data || { project_id: project_id as string },
  );
  const [alterNameInput, setAlterNameInput] = useState("");

  const currentAlterNames = document?.alter_names?.map((alter_name) => alter_name.title);

  const { changedData, handleChange } = useHandleChange({ data: document, setData: setDocument });
  return (
    <>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <div className="flex flex-col gap-y-2">
          <Input
            label="Document title (required)"
            name="title"
            onChange={handleChange}
            placeholder="E.g. Important document"
            value={document.title}
          />
          <ImageSelect
            label="Document image (optional)"
            name="image_id"
            onChange={handleChange}
            type="images"
            value={document.image_id}
          />
          <Input
            label="Alternative names"
            name="alter_names"
            onChange={({ value }) => setAlterNameInput(value as string)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (typeof value === "string" && currentAlterNames?.includes(value)) {
                  createNotification({
                    title: "Cannot add the same alternative name twice.",
                    variant: "warning",
                    icon: IconEnum.info_circle,
                    timer: 3,
                  });
                } else if (typeof value === "string" && !currentAlterNames?.includes(value)) {
                  if (data?.id) {
                    const newAlterName = createAlterName({ title: value, parent_id: data.id, project_id });
                  } else {
                    handleChange({
                      name: "alter_names",
                      value: (document?.alter_names || []).concat({
                        title: alterNameInput,
                      }),
                    });
                  }
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
        </div>
      ) : null}

      {selectedTab === 2 ? (
        <div className="flex flex-col gap-y-2">
          <Search
            name="tags"
            onChange={({ name, label, value, color }) => {
              if ((document?.tags || [])?.some((tag) => tag.id === value)) {
                createNotification({
                  title: "Cannot add the same tag twice.",
                  variant: "warning",
                  icon: IconEnum.info_circle,
                  timer: 3,
                });
                return;
              }

              handleChange({
                name,
                value: (document?.tags || []).concat({
                  title: label as string,
                  id: value,
                  project_id: project_id as string,
                  color: color as string,
                }),
              });
            }}
            placeholder="Press enter to search tags"
            searchEntity="tags"
          />

          <div className="flex flex-wrap gap-2">
            {document?.tags?.length
              ? document.tags.map((tag) => (
                  <div key={tag.id} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({ name: "tags", value: (document?.tags || []).filter((t) => t.id !== tag.id) });
                      }}
                      customColor={tag.color}
                      label={tag.title}
                      size="lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
      <Button
        icon={document?.id ? IconEnum.save : IconEnum.add}
        // isDisabled={isSaveDisabled(character) || isCreating || isUpdating}
        isLoading={isCreating}
        label={document?.id ? "Update" : "Create"}
        onClick={async () => {
          if (changedData) {
            // if (document?.id) {
            //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
            //   const documentToUpdate = { ...(changedData || {}), id: document.id };
            //   const { related_to, related_from, tags, ...rest } = documentToUpdate;
            //   const parsedData = UpdateDocumentSchema.parse({
            //     data: { ...rest, portrait_id: rest?.portrait?.id },
            //     relations: { character_fields: character?.character_fields || [], related_from, related_to, tags },
            //   });
            //   await update(parsedData, {
            //     onSuccess: (res) => {
            //       if (res?.ok) resetDrawerAtom();
            //     },
            //   });
            // }
            const dataToParse = {
              data: document,
              relations: {
                alter_names: document?.alter_names,
                tags: document?.tags,
              },
            };
            const parsedData = InsertDocumentSchema.parse(dataToParse);
            await create(parsedData, {
              onSuccess: (res) => {
                // if (res?.ok) resetDrawerAtom();
              },
            });
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
    </>
  );
}
