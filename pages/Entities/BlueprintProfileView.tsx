import { useAtomValue, useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";

import { AdditionalBlueprintFieldDisplay, Alert, Badge, Breadcrumbs, Button, Collapsible, Skeleton } from "../../components";
import { useBreakpoint, useGetEntity, useGetSubEntity, useHasPermissions, useNavbarTitle } from "../../hooks";
import { BlueprintInstanceType, BlueprintType } from "../../types";
import { breadcrumbsAtom, drawerAtom, hasActionPermission, IconEnum, isProjectOwnerAtom, userAtom } from "../../utils";

export function BlueprintProfileView({ id, parent_id, isViewOnly }: { id?: string; parent_id?: string; isViewOnly?: boolean }) {
  const { project_id, item_id, subitem_id } = useParams();
  const { isMd } = useBreakpoint();
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

  const { data: blueprintInstance, isLoading } = useGetSubEntity<BlueprintInstanceType>(
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
    isViewOnly ? (blueprintInstance?.data?.parent_id as string) : parent_id || item_id,
    "blueprints",
    {
      data: {
        id: isViewOnly ? blueprintInstance?.data?.parent_id : parent_id || item_id,
      },
      fields: ["id", "title", "title_name", "icon", "owner_id"],
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
      permissions: true,
    },
    { enabled: isViewOnly ? !!blueprintInstance?.data?.parent_id : true, staleTime: 3 * 60 * 1000 }
  );

  function openEditTagDrawer() {
    if (blueprintInstance?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "edit_tags",
        title: "Edit tags",
        data: {
          tags: blueprintInstance?.data?.tags || [],
          entity: { type: "blueprint_instances", id: blueprintInstance?.data?.id },
        },
      }));
    }
  }

  useLayoutEffect(() => {
    if (blueprint?.data) {
      setBreadcrumbs({
        items: [{ id: blueprint.data.id, title: blueprint.data.title, is_folder: false, parent_id: null }],
        type: "blueprints",
      });
    }
  }, [blueprint?.data]);

  useNavbarTitle(
    `Blueprints | ${blueprint?.data?.title} | ${blueprintInstance?.data?.title}`,
    !!blueprint?.data && !!blueprintInstance?.data
  );

  if (isLoading) return <Skeleton type="character_profile" />;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)] flex-col gap-y-2">
      {item_id && !IS_PUBLIC && !isViewOnly ? (
        <div className="flex h-12 min-h-[3rem] items-center justify-between">
          <Breadcrumbs />
          <div className="flex flex-nowrap gap-x-2">
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
                    user?.id === blueprintInstance?.data?.owner_id,
                    permissions,
                    blueprintInstance?.data?.permissions || [],
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
      <div className="w-full flex-1 flex-col content-start gap-4 pt-0">
        {isLoading ? <Skeleton type="character_profile" /> : null}

        <div className="flex max-h-full flex-1 flex-col overflow-auto rounded-lg bg-zinc-950 p-4 lg:col-span-4">
          <div className="flex flex-col gap-y-2">
            <Collapsible icon={IconEnum.additional_fields} initialOpen label="Fields">
              <div className="grid h-full max-h-[calc(100%-3rem)] grid-cols-6 flex-col content-start gap-y-2 overflow-auto">
                {blueprintInstance?.data
                  ? blueprintInstance?.data?.blueprint_fields
                      ?.toSorted((a, b) => a.sort - b.sort)
                      .map((blueprint_field) => {
                        const blueprintField = blueprint?.data?.blueprint_fields?.find(
                          (field) => field.id === blueprint_field.id
                        );
                        if (!blueprintField) return null;
                        return (
                          <AdditionalBlueprintFieldDisplay
                            blueprint_field={blueprintField}
                            blueprint_field_data={blueprint_field}
                            isPreview={!!id}
                            key={blueprint_field.id}
                          />
                        );
                      })
                  : null}
              </div>
            </Collapsible>

            {IS_PUBLIC ? null : (
              <Collapsible
                actions={[
                  {
                    icon: IconEnum.edit,
                    tooltip: "Edit tags",
                    onClick: openEditTagDrawer,
                  },
                ]}
                icon={IconEnum.tags}
                initialOpen={false}
                label="Tags">
                {blueprintInstance?.data?.tags?.length ? (
                  <div className="animate-in fade-in fill-mode-both mt-2 flex w-full flex-wrap gap-2">
                    {blueprintInstance.data.tags.map((tag) => (
                      <div key={tag.id}>
                        <Badge customColor={tag.color} label={tag.title} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 w-full">
                    <Alert label="There is no content." variant="info" />
                  </div>
                )}
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
