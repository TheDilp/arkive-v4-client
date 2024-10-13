import { useAtomValue, useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  AdditionalBlueprintFieldDisplay,
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  Collapsible,
  Input,
  RelatedEntityForm,
  Skeleton,
  TagInput,
} from "../../components";
import { Toggle } from "../../components/Form/Toggle";
import {
  useBreakpoint,
  useGetEntity,
  useGetSubEntity,
  useHandleChange,
  useHasPermissions,
  useNavbarTitle,
  useUpdateSubEntity,
} from "../../hooks";
import { BlueprintInstanceType, BlueprintType } from "../../types";
import {
  breadcrumbsAtom,
  drawerAtom,
  getDifferenceForBlueprintInstance,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  userAtom,
} from "../../utils";
import { UpdateBlueprintInstanceSchema } from "../../validation";

export function BlueprintProfileView({ id, parent_id, isViewOnly }: { id?: string; parent_id?: string; isViewOnly?: boolean }) {
  const { project_id, item_id, subitem_id } = useParams();
  const { isMd } = useBreakpoint();
  const [blueprintInstance, setBlueprintInstance] = useState<BlueprintInstanceType | null>(null);
  const { mutate: update, isLoading: isUpdating } = useUpdateSubEntity("blueprint_instances", project_id, item_id);
  const { handleChange } = useHandleChange({
    data: blueprintInstance,
    setData: setBlueprintInstance,
  });

  const [isEditable, setIsEditable] = useState(false);
  const setDrawer = useSetAtom(drawerAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    [
      "read_blueprints",
      "create_blueprints",
      "update_blueprints",
      "delete_blueprints",
      "read_blueprint_instances",
      "create_blueprint_instances",
      "update_blueprint_instances",
      "delete_blueprint_instances",
    ],
    undefined
  );

  const user = useAtomValue(userAtom);

  const { data: existingBlueprintInstance, isLoading } = useGetSubEntity<BlueprintInstanceType>(
    id || subitem_id,
    "blueprint_instances",
    {
      data: { id: id || subitem_id },
      fields: ["id", "title", "is_public", "parent_id", "owner_id"],
      relations: {
        blueprint_fields: true,
        tags: true,
      },
      permissions: true,
    },
    { staleTime: 3 * 60 * 1000 }
  );
  const { data: blueprint } = useGetEntity<BlueprintType>(
    isViewOnly ? (existingBlueprintInstance?.data?.parent_id as string) : parent_id || item_id,
    "blueprints",
    {
      data: {
        id: isViewOnly ? existingBlueprintInstance?.data?.parent_id : parent_id || item_id,
      },
      fields: ["id", "title", "title_name", "icon", "owner_id"],
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
      permissions: true,
    },
    { enabled: isViewOnly ? !!existingBlueprintInstance?.data?.parent_id : true, staleTime: 3 * 60 * 1000 }
  );

  function openEditTagDrawer() {
    if (existingBlueprintInstance?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "edit_tags",
        title: "Edit tags",
        data: {
          tags: existingBlueprintInstance?.data?.tags || [],
          entity: { type: "blueprint_instances", id: existingBlueprintInstance?.data?.id },
        },
      }));
    }
  }

  const canUpdate = hasActionPermission(
    isProjectOwner,
    user?.id === existingBlueprintInstance?.data?.owner_id,
    permissions,
    existingBlueprintInstance?.data?.permissions || [],
    "update_blueprint_instances",
    user?.role?.id
  );

  function handleSave() {
    if (existingBlueprintInstance?.data && blueprintInstance) {
      const dataToParse = {
        data: {
          id: blueprintInstance.id,
          title: blueprintInstance.title,
          is_public: blueprintInstance?.is_public,
          parent_id: item_id,
        },
        relations: {
          tags: blueprintInstance?.tags?.map((t) => ({ id: t.id })),
          blueprint_fields: getDifferenceForBlueprintInstance(existingBlueprintInstance?.data, blueprintInstance),
        },
        permissions: blueprintInstance?.permissions,
      };
      const parsedData = UpdateBlueprintInstanceSchema.parse(dataToParse);
      update(parsedData);
    }
  }

  useLayoutEffect(() => {
    if (blueprint?.data && existingBlueprintInstance?.data) {
      setBreadcrumbs({
        items: [
          { id: blueprint.data.id, title: blueprint.data.title, is_folder: false, parent_id: null },
          {
            id: existingBlueprintInstance.data.id,
            title: existingBlueprintInstance.data.title,
            is_folder: false,
            parent_id: null,
            url: `/projects/${project_id}/blueprints/${blueprint?.data?.id}/${existingBlueprintInstance?.data?.id}/resources`,
          },
        ],
        type: "blueprints",
      });
    }
  }, [blueprint?.data, existingBlueprintInstance?.data]);

  useLayoutEffect(() => {
    if (existingBlueprintInstance?.data) {
      setBlueprintInstance(existingBlueprintInstance?.data);
    }
  }, [existingBlueprintInstance]);

  useNavbarTitle(
    `Blueprints | ${blueprint?.data?.title} | ${existingBlueprintInstance?.data?.title}`,
    !!blueprint?.data && !!existingBlueprintInstance?.data
  );

  if (isLoading) return <Skeleton type="character_profile" />;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)] flex-col gap-y-2">
      {item_id && !IS_PUBLIC && !isViewOnly ? (
        <div className="flex h-12 min-h-[3rem] items-center justify-between">
          <Breadcrumbs />
          <div className="flex flex-nowrap gap-x-2">
            <div className="flex w-24 items-center justify-end">
              <Toggle
                allowedPlacements={["left"]}
                isDisabled={!canUpdate}
                name="isEditable"
                offIcon={IconEnum.close}
                onChange={(e) => setIsEditable(e.checked)}
                onIcon={IconEnum.edit}
                tooltip="Toggle edit mode"
                value={isEditable}
              />
            </div>
            <div className="max-w-[208px] lg:w-52">
              <Button
                icon={IconEnum.edit}
                isDisabled={
                  !hasActionPermission(
                    isProjectOwner,
                    user?.id === blueprint?.data?.owner_id,
                    permissions,
                    blueprint?.data?.permissions || [],
                    "update_blueprints",
                    user?.role?.id
                  )
                }
                label="Edit current blueprint"
                onClick={() => {
                  setDrawer((prev) => ({
                    ...prev,
                    size: "lg",
                    title: "Edit blueprint",
                    type: "blueprints",
                    data: { id: parent_id || (item_id as string), project_id: project_id as string },
                  }));
                }}
                tooltip={isMd ? undefined : "Edit current blueprint"}
              />
            </div>
            <div className="lg:w-52">
              <Button
                icon={IconEnum.edit}
                isDisabled={
                  !hasActionPermission(
                    isProjectOwner,
                    user?.id === existingBlueprintInstance?.data?.owner_id,
                    permissions,
                    existingBlueprintInstance?.data?.permissions || [],
                    "update_blueprint_instances",
                    user?.role?.id
                  )
                }
                label="Edit current instance"
                onClick={() => {
                  setDrawer((prev) => ({
                    ...prev,
                    size: "lg",
                    title: "Edit blueprint instance",
                    type: "blueprint_instances",
                    data: { id: id || (subitem_id as string), project_id: project_id as string },
                  }));
                }}
                tooltip={isMd ? undefined : "Edit current instance"}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div className="w-full flex-1 flex-col content-start gap-4 overflow-y-auto pt-0">
        {isLoading ? <Skeleton type="character_profile" /> : null}

        <div className="flex max-h-full flex-1 flex-col overflow-auto rounded-lg bg-zinc-950 p-4 lg:col-span-4">
          <div className="flex flex-col gap-y-2">
            {isEditable ? (
              <Collapsible icon={IconEnum.info_circle} label="Basic info">
                <div className="flex w-full items-center gap-x-6 p-2">
                  <div className="flex-1">
                    <Input
                      isDisabled={!permissions?.update_blueprint_instances}
                      label={`${blueprint?.data?.title_name} (required)`}
                      name="title"
                      onChange={handleChange}
                      value={blueprintInstance?.title}
                      variant={blueprintInstance?.title ? "primary" : "error"}
                    />
                  </div>
                  <div className="flex w-min items-center justify-between self-end pb-1.5">
                    <Checkbox
                      isDisabled={!permissions?.update_blueprint_instances}
                      name="is_public"
                      onChange={handleChange}
                      tooltip="Is public"
                      value={blueprintInstance?.is_public ?? false}
                    />
                  </div>
                </div>
              </Collapsible>
            ) : null}

            <Collapsible icon={IconEnum.additional_fields} initialOpen label="Fields">
              {isEditable ? (
                <div className="p-2">
                  <RelatedEntityForm
                    fields={blueprint?.data?.blueprint_fields || []}
                    fields_data={blueprintInstance?.blueprint_fields || []}
                    handleChange={handleChange}
                    hasCreateOrEdit
                    isDrawer={false}
                    isEditEnabled={isEditable}
                    type="blueprint_instances"
                  />
                </div>
              ) : (
                <div
                  className={`grid h-[calc(100%-3rem)] max-h-[calc(100%-3rem)] grid-cols-6 flex-col gap-2 overflow-auto ${IS_PUBLIC ? "" : "p-2"}`}>
                  {blueprintInstance
                    ? blueprintInstance?.blueprint_fields
                        ?.toSorted((a, b) => a.sort - b.sort)
                        .map((blueprint_field) => {
                          const blueprintField = blueprint?.data?.blueprint_fields?.find(
                            (field) => field.id === blueprint_field.id
                          );
                          if (!blueprintField) return null;
                          return (
                            <AdditionalBlueprintFieldDisplay
                              key={blueprint_field.id}
                              blueprint_field={blueprintField}
                              blueprint_field_data={blueprint_field}
                              isPreview={!!id}
                            />
                          );
                        })
                    : null}
                </div>
              )}
            </Collapsible>

            {IS_PUBLIC ? null : (
              <Collapsible
                actions={
                  isEditable
                    ? []
                    : [
                        {
                          icon: IconEnum.edit,
                          tooltip: "Edit tags",
                          onClick: openEditTagDrawer,
                        },
                      ]
                }
                icon={IconEnum.tags}
                initialOpen={false}
                label="Tags">
                <div className={`flex flex-col p-2 ${isEditable ? "" : ""}`}>
                  {blueprintInstance?.tags?.length && !isEditable ? (
                    <div className="animate-in fade-in fill-mode-both flex w-full flex-wrap gap-2">
                      {blueprintInstance.tags.map((tag) => (
                        <div key={tag.id}>
                          <Badge customColor={tag.color} label={tag.title} size="lg" />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {!blueprintInstance?.tags?.length && !isEditable ? (
                    <div className="mt-2 w-full">
                      <Alert label="There is no content." variant="info" />
                    </div>
                  ) : null}

                  {isEditable ? <TagInput handleChange={handleChange} tags={blueprintInstance?.tags || []} /> : null}
                </div>
              </Collapsible>
            )}
            {isEditable ? (
              <Button
                icon={IconEnum.save}
                isDisabled={isUpdating || !blueprintInstance?.title || !canUpdate}
                isLoading={isUpdating}
                label="Save"
                onClick={handleSave}
                variant="success"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
