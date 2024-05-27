import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntities, useHandleChange, useHasPermissions, useToggledResetAtom } from "../../../hooks";
import { EntityPermissionType, TagType } from "../../../types";
import { IconEnum } from "../../../utils";
import { DefaultTagColor } from "../../../utils/enums/ColorEnums";
import { InsertTagSchema, InsertTagType } from "../../../validation";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input } from "../../Form";
import { Tabs } from "../../Layout";
import { ColorPicker } from "../ColorPicker";

function isDisabled(tags: Omit<TagType, "deleted_at"> | Omit<TagType, "deleted_at">[]) {
  if (Array.isArray(tags)) {
    if (!tags.length) return true;
    if (tags.some((tag) => !tag.title)) return true;
    const tagTitles = tags.map((tag) => tag.title.toLowerCase());
    if (new Set(tagTitles).size !== tagTitles.length) return true;
  } else {
    if (!tags.title) return true;
    if (!tags.color) return true;
  }

  return false;
}

export function TagsDrawer() {
  const { project_id } = useParams();

  const permissions = useHasPermissions(["create_tags"], undefined);
  const tabs = [
    { id: "1", label: "Tags", icon: IconEnum.tags },
    { id: "2", label: "Access", icon: IconEnum.permissions },
  ];

  const [tags, setTags] = useState<Omit<TagType, "deleted_at">[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPermissions, setSelectedPermissions] = useState<{ permissions: EntityPermissionType[] }>({ permissions: [] });

  const resetDrawerAtom = useToggledResetAtom();
  const { mutateAsync: createMany, isLoading: isCreatingMany } = useCreateEntities<InsertTagType>("tags", project_id as string);

  const { handleChange } = useHandleChange({ data: tags, setData: setTags });
  const { handleChange: handleChangePermissions } = useHandleChange({
    data: selectedPermissions,
    setData: setSelectedPermissions,
  });
  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex h-8 w-full justify-between">
            <span>Insert new tag:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                onClick={() => {
                  setTags((prev) => {
                    return [
                      ...(prev || []),
                      {
                        id: crypto.randomUUID(),
                        title: "",
                        color: "",
                        permissions: [],
                        owner_id: "",
                        project_id: project_id as string,
                      },
                    ];
                  });
                }}
                tooltip="Add new tag"
                variant="info"
              />
            </div>
          </div>
          {tags.map((tag, index) => (
            <div key={tag.id} className="flex items-end gap-x-2">
              <Input
                label="Tag name (required, must be unique for entire project)"
                name={`[${index}].title`}
                onChange={handleChange}
                value={tag.title}
                variant={tag.title ? "primary" : "error"}
              />
              <div className="self-end pb-2">
                <ColorPicker name={`[${index}].color`} onChange={handleChange} value={tag.color} />
              </div>
              <div className="self-end pb-2">
                <Button
                  hasNoBackground
                  icon={IconEnum.trash}
                  isIconOnly
                  onClick={() =>
                    setTags((prev) => {
                      if (Array.isArray(prev)) {
                        return prev.filter((t) => t.id !== tag.id);
                      }
                      return prev;
                    })
                  }
                  variant="error"
                />
              </div>
            </div>
          ))}
        </>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <EntityPermission
          handleChange={handleChangePermissions}
          permissions={selectedPermissions.permissions || []}
          related_id={null}
          selectablePermissions={["read_tags", "update_tags", "delete_tags"]}
        />
      ) : null}

      <Button
        icon={IconEnum.add}
        isDisabled={isDisabled(tags) || isCreatingMany || !permissions.create_tags}
        isLoading={isCreatingMany}
        label="Create"
        onClick={async () => {
          if (Array.isArray(tags)) {
            const parsed = InsertTagSchema.parse({
              data: tags.map((tag) => ({
                title: tag.title,
                project_id: tag.project_id,
                color: tag?.color || DefaultTagColor,
              })),
              permissions: selectedPermissions.permissions,
            });

            await createMany(
              { data: parsed.data, permissions: parsed.permissions },
              {
                onSuccess: () => {
                  resetDrawerAtom();
                  setTags([]);
                },
              },
            );
          }
        }}
        variant="success"
      />
    </div>
  );
}
