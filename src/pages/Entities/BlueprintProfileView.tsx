import { useAtomValue, useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AdditionalBlueprintFieldDisplay,
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Collapsible,
  Skeleton,
  Tabs,
} from "../../components";
import { useBreakpoint, useGetEntity, useGetSubEntity, useHasPermissions, useNavbarTitle } from "../../hooks";
import { BlueprintInstanceType, BlueprintType } from "../../types";
import { breadcrumbsAtom, drawerAtom, hasActionPermission, IconEnum, isProjectOwnerAtom, userAtom } from "../../utils";

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  //   { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  //   { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  //   { id: "4", label: "Conversations", icon: IconEnum.conversation },
];

export default function BlueprintProfileView({
  id,
  parent_id,
  isPublic,
}: {
  id?: string;
  parent_id?: string;
  isPublic?: boolean;
}) {
  const { project_id, item_id, subitem_id } = useParams();
  const { isMd, isLg } = useBreakpoint();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
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
    undefined,
  );
  const user = useAtomValue(userAtom);
  const { data: blueprint } = useGetEntity<BlueprintType>(
    parent_id || item_id,
    "blueprints",
    {
      data: {
        id: parent_id || item_id,
      },
      fields: ["id", "title", "title_name", "icon", "owner_id"],
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
      permissions: true,
    },
    { isPublic, staleTime: 3 * 60 * 1000 },
  );

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
    { isPublic, enabled: !!blueprint?.data, staleTime: 3 * 60 * 1000 },
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
    !!blueprint?.data && !!blueprintInstance?.data,
  );

  return (
    <div className="flex max-h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)] flex-col gap-y-2 ">
      {item_id && !isPublic ? (
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
                    user?.role?.id,
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
                    user?.role?.id,
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
      <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div
            className={`${id ? "" : "p-4"} flex max-h-full flex-col items-center gap-y-2 rounded-lg bg-zinc-800 lg:col-span-1`}>
            <div className="mt-2 flex flex-col gap-y-1">
              <h2 className="text-center font-merriweather text-lg">{`${blueprintInstance?.data?.title || ""}`.trimEnd()}</h2>
            </div>
            <div className="w-full">
              <Tabs
                isVertical
                onChange={(tab, index) => {
                  navigate(
                    `/projects/${project_id}/blueprints/${parent_id || item_id}/${id || subitem_id}/${tab.label.toLowerCase()}`,
                  );
                  setSelectedTab(index);
                }}
                selectedTab={selectedTab}
                tabs={tabs}
              />
            </div>
          </div>
        ) : null}
        {!isLoading && !isLg ? (
          <div className="mb-2 w-full">
            <Tabs
              onChange={(tab, index) => {
                navigate(`/projects/${project_id}/characters/${item_id}/${tab.label.toLowerCase()}`);
                setSelectedTab(index);
              }}
              selectedTab={selectedTab}
              tabs={tabs}
            />
          </div>
        ) : null}
        <div className="flex max-h-full flex-1 flex-col overflow-auto rounded-lg bg-zinc-950 p-4 lg:col-span-4">
          <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
            <span className="flex">{tabs[selectedTab].label}</span>
          </h2>
          <div className="flex flex-col gap-y-2">
            <Collapsible icon={IconEnum.additional_fields} initialOpen label="Fields">
              <div className="grid h-full max-h-[calc(100%-3rem)] grid-cols-6 flex-col content-start gap-y-2 overflow-auto">
                {blueprintInstance?.data
                  ? blueprintInstance?.data?.blueprint_fields
                      ?.toSorted((a, b) => a.sort - b.sort)
                      .map((blueprint_field) => {
                        const blueprintField = blueprint?.data?.blueprint_fields?.find(
                          (field) => field.id === blueprint_field.id,
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
            </Collapsible>

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
                <div className="mt-2 flex w-full flex-wrap gap-2 animate-in fade-in fill-mode-both">
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
          </div>
        </div>
      </div>
    </div>
  );
}
