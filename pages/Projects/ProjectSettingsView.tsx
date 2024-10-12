import { UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Avatar,
  Button,
  Checkbox,
  Collapsible,
  createColumnHelper,
  Dropdown,
  Icon,
  ImageSelect,
  Input,
  Select,
  Skeleton,
  Table,
  Tabs,
  Textarea,
  Tooltip,
} from "../../components";
import {
  useAssignRole,
  useBreakpoint,
  useDeleteEntity,
  useGetEntities,
  useGetEntity,
  useGetProjectAPIKey,
  useHandleChange,
  useKickMember,
  useResetProjectAPIKey,
  useTable,
  useUpdateEntity,
  useUpdateUser,
} from "../../hooks";
import {
  AllAvailableEntities,
  CharacterRelationshipType,
  DialogAtomType,
  DrawerAtomType,
  GameSystem,
  MapPinTypesType,
  ProjectType,
  RoleType,
  TabType,
  UserType,
} from "../../types";
import { GatewayConfigType, GatewayEntityType } from "../../types/EntityTypes/gatewayTypes";
import {
  capitalizeFirstLetter,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  getFirstLetters,
  getPluralEntityType,
  getSentenceCase,
  IconEnum,
  isProjectOwnerAtom,
  MiscellaneousSettings,
  useNotifications,
  userAtom,
  UserNotificationEntities,
  UserSidebarEntitiesEnabled,
} from "../../utils";
import { UpdateProjectSchema, UpdateProjectType } from "../../validation";
import { CharacterTemplatesView, TagView } from "../Entities";

type kickUserMutationType = UseMutateFunction<
  any,
  unknown,
  {
    data: {
      user_id: string;
      project_id: string;
    };
  },
  unknown
>;

type assignRoleMutationType = UseMutateFunction<
  any,
  unknown,
  {
    data: {
      user_id: string;
      role_id: string;
    };
  },
  unknown
>;
const tabs: TabType[] = [
  { id: "project_settings", label: "Project settings", icon: IconEnum.settings, isOwner: false },
  { id: "tags", label: "Tags", icon: IconEnum.tags, isOwner: false },
  { id: "character_fields_templates", label: "Character field templates", icon: IconEnum.additional_fields, isOwner: false },
  { id: "map_pin_types", label: "Map pin types", icon: IconEnum.map_pin, isOwner: false },
  {
    id: "custom_relationship_types",
    label: "Custom relationship types",
    icon: IconEnum.family_tree,
    isOwner: false,
    hasDivider: true,
  },
  { id: "members", label: "Members", icon: IconEnum.users, isOwner: true },
  { id: "roles_permissions", label: "Roles & permissions", icon: IconEnum.permissions, isOwner: true },
  { id: "integrations", label: "Integrations", icon: IconEnum.integration, isOwner: true },
  { id: "gateway_configuration", label: "Gateway configuration", icon: IconEnum.gateway || IconEnum.character, isOwner: true },
  { id: "feature_settings", label: "Feature settings", icon: IconEnum.feature_flag, isOwner: false },
];

const mapPinTypesColumnHelper = createColumnHelper<MapPinTypesType>();
const relationshipTypesColumnHelper = createColumnHelper<CharacterRelationshipType>();
const membersColumnHelper = createColumnHelper<UserType>();
const rolesColumnHelper = createColumnHelper<RoleType>();
const gatewayColumnHelper = createColumnHelper<GatewayConfigType>();

function mapPinTypeTableColumns(
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>
) {
  return [
    mapPinTypesColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <b>{row.original.title}</b>,
    }),
    mapPinTypesColumnHelper.display({
      id: "default_icon",
      header: "Default icon",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (row.original.default_icon ? <Icon fontSize={24} icon={row.original.default_icon} /> : null),
      maxSize: 1.75,
    }),
    mapPinTypesColumnHelper.display({
      id: "default_icon_color",
      header: "Default icon color",
      cell: ({ row }) => (
        <div className="flex w-full justify-center">
          <div
            className="h-6 w-6 select-none rounded-full shadow"
            style={{ backgroundColor: row.original.default_icon_color || DefaultTagColor }}
          />
        </div>
      ),
      meta: {
        centered: true,
      },
      maxSize: 2,
    }),

    mapPinTypesColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "update_map_pin_type",
                title: "Edit map pin type",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: {
                      id: row.original.id,
                      title: row.original.title,
                    },
                    title: "Edit map pin type",
                    size: "sm",
                    type: "map_pin_types",
                  }));
                },
              },
              {
                id: "delete_map_pin_type",
                title: "Delete map pin type",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "map_pin_types",
                    },
                    title: "Delete map pin type",
                    size: "sm",
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function relationshipTableColumns(setDialog: Dispatch<SetStateAction<DialogAtomType>>) {
  return [
    relationshipTypesColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <b>{row.original.title}</b>,
    }),
    relationshipTypesColumnHelper.display({
      id: "ascendant_title",
      header: "Ascendant",
      cell: ({ row }) => row.original?.ascendant_title || "",
    }),
    relationshipTypesColumnHelper.display({
      id: "descendant_title",
      header: "Descendant",
      cell: ({ row }) => row.original?.descendant_title || "",
    }),

    relationshipTypesColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "delete_relationship_type",
                title: "Delete relationship type",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "character_relationship_types",
                    },
                    title: "Delete relationship type",
                    size: "sm",
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function membersColumns(
  kickUser: kickUserMutationType,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  roles: RoleType[],
  assignRole: assignRoleMutationType,
  project_id: string
) {
  return [
    membersColumnHelper.display({
      id: "image",
      header: "Image",
      cell: ({ row }) => (row.original?.image ? <Avatar image_id={row.original.image} size="sm" /> : null),
      meta: {
        centered: true,
      },
      minSize: 5,
      maxSize: 5,
    }),
    membersColumnHelper.display({
      id: "nickname",
      header: "Nickname",
      cell: ({ row }) => row.original.nickname,
      maxSize: 20,
    }),
    membersColumnHelper.display({
      id: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    }),
    membersColumnHelper.display({
      id: "role",
      header: "Role",
      cell: ({ row }) => (
        <Tooltip content={row?.original?.role?.title || ""}>
          <div>
            <Button
              hasNoBackground
              icon={row?.original?.role?.icon || IconEnum.permissions}
              isDisabled
              isIconOnly
              onClick={undefined}
            />
          </div>
        </Tooltip>
      ),
      maxSize: 2,
      size: 2,
      meta: {
        centered: true,
      },
    }),
    membersColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "assign_role_user",
                title: "Assign role",
                icon: IconEnum.permissions,
                subItems: roles.map((role) => ({
                  id: role.id,
                  title: role.title,
                  onClick: () => assignRole({ data: { user_id: row.original.id, role_id: role.id } }),
                })),
              },
              {
                id: "remove_member",
                title: "Remove member from project",
                icon: IconEnum.user_remove,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    title: "Are you sure you wish to remove this member from this project?",
                    cancel: { action: () => {} },
                    isOverlay: true,
                    confirm: {
                      variant: "info-bordered",
                      action: () => {
                        kickUser({ data: { project_id, user_id: row.original.id } });
                      },
                    },
                    size: "sm",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function rolesColumns(setDrawer: Dispatch<SetStateAction<DrawerAtomType>>) {
  return [
    rolesColumnHelper.display({
      id: "icon",
      cell: ({ row }) => <Icon fontSize={24} icon={row.original?.icon || getDefaultEntityIcon("roles")} />,
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
      },
    }),
    rolesColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    }),
    rolesColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "1",
                title: "Edit role",
                icon: IconEnum.edit,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    size: "xl",
                    title: "Edit role",
                    data: { id: row.original.id },
                    type: "roles",
                  })),
              },
              {
                id: "expand",
                title: `${!row.getIsExpanded() ? "Show" : "Hide"} permissions`,
                icon: IconEnum.permissions,
                onClick: row.getToggleExpandedHandler(),
              },
              { id: "3", title: "Delete role", icon: IconEnum.trash },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}

function gatewayColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>
) {
  return [
    rolesColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    }),
    gatewayColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "1",
                title: "Edit configuration",
                icon: IconEnum.edit,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    size: "half",
                    title: "Edit configuration",
                    data: { configuration_id: row.original.id, type: row.original.gateway_type },
                    type: "gateway_access",
                    exceptions: { gatewayConfiguration: true },
                  })),
              },
              {
                id: "expand",
                title: `${!row.getIsExpanded() ? "Show" : "Hide"} entities`,
                icon: IconEnum.gateway,
                onClick: row.getToggleExpandedHandler(),
              },
              {
                id: "3",
                title: "Delete configuration",
                icon: IconEnum.trash,
                onClick: () =>
                  setDialog((prev) => ({
                    ...prev,
                    title: "Delete gateway configuration",
                    data: { entity_title: "gateway_configurations", id: row.original.id, title: row.original.title },
                    type: "delete_entity",
                  })),
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}

export function ProjectSettingsView() {
  const { project_id } = useParams();
  const queryClient = useQueryClient();
  const { isLg } = useBreakpoint();
  const createNotification = useNotifications();
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const { mutate: kickUser } = useKickMember();

  const finalTabs = isProjectOwner ? tabs : tabs.filter((t) => t.isOwner === false);

  const [project, setProject] = useState<ProjectType | null>();
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  const { handleChange } = useHandleChange({ data: project, setData: setProject });

  const [, dispatch] = useTable({});
  const {
    data: projectData,
    isLoading,
    isFetching,
  } = useGetEntity<ProjectType>(
    project_id as string,
    "projects",
    {
      fields: ["id", "title", "image_id", "owner_id", "is_public", "description", "game_system_id"],
      relations: {
        map_pin_types: true,
        character_relationship_types: true,
        members: true,
        feature_flags: true,
      },
    },
    {
      queryKeyConcat: ["settings"],
    }
  );
  const { mutateAsync: updateProject, isLoading: isUpdating } = useUpdateEntity<UpdateProjectType>(
    "projects",
    project_id as string
  );
  const { mutate: assignRole } = useAssignRole();
  const { mutate: updateUser } = useUpdateUser(user?.id as string);
  const { mutate: resetAPIKey } = useResetProjectAPIKey({
    onSuccess: () =>
      createNotification({
        title: "API Key successfully reset.",
        hasNoTruncate: true,
        timer: 10,
        variant: "success",
      }),
  });
  const { mutateAsync: getAPIKey } = useGetProjectAPIKey();
  const { data: roles } = useGetEntities<RoleType>(
    {
      data: { project_id },
      fields: ["id", "title", "icon"],
      orderBy: [{ field: "title", sort: "asc" }],
      relations: { permissions: true },
    },
    "roles",
    {
      enabled:
        !!user?.id &&
        isProjectOwner &&
        (finalTabs?.[selectedTab]?.id === "members" || finalTabs?.[selectedTab]?.id === "roles_permissions"),
    }
  );
  const { data: gateway_configurations } = useGetEntities<GatewayConfigType>(
    { data: { project_id }, fields: ["id", "title"] },
    "gateway_configurations",
    { enabled: !!user?.id && isProjectOwner && finalTabs?.[selectedTab]?.id === "gateway_configuration" }
  );
  const { data: gameSystems } = useGetEntities<GameSystem>({ fields: ["id", "title", "code"] }, "game_systems", {
    enabled: tabs[selectedTab].id === "integrations",
  });
  const { mutateAsync: deleteProject } = useDeleteEntity("projects", project?.id || "", false);

  useLayoutEffect(() => {
    if (projectData?.data) setProject(projectData.data);
  }, [projectData, isFetching]);

  async function handleSave() {
    if (project) {
      const parsedData = UpdateProjectSchema.parse({ data: project });
      await updateProject(parsedData);
    }
  }
  function handleOpenNewMapPinTypeDrawer() {
    setDrawer((prev) => ({
      ...prev,
      title: "Create new map pin type",
      type: "map_pin_types",
      data: { project_id },
    }));
  }
  function handleOpenNewRelationshipTypeDrawer() {
    setDrawer((prev) => ({
      ...prev,
      title: "Create new relationship type",
      type: "character_relationship_types",
      data: { project_id },
    }));
  }
  function handleOpenInviteToProjectDrawer() {
    setDrawer((prev) => ({
      ...prev,
      title: "Invite to project",
      type: "invite_to_project",
      data: null,
    }));
  }
  function handleOpenRolesDrawer() {
    setDrawer((prev) => ({
      ...prev,
      title: "Role",
      type: "roles",
      size: "xl",
      data: {},
    }));
  }
  function handleOpenGatewayConfigDrawer(type: GatewayEntityType = "characters") {
    setDrawer((prev) => ({
      ...prev,
      title: "Create gateway configuration",
      type: "gateway_access",
      size: "half",
      data: { type },
      exceptions: { gatewayConfiguration: true },
    }));
  }
  return (
    <div className="flex h-full min-h-full flex-col gap-y-2">
      <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
            <Avatar
              hasShowImage
              image_id={projectData?.data?.image_id}
              initials={getFirstLetters(projectData?.data?.title as string)}
              isTooltipDisabled
              size="4xl"
            />

            <div className="mt-2 flex flex-col gap-y-1">
              <h2 className="text-center font-merriweather text-lg">{`${projectData?.data?.title || ""}`.trimEnd()}</h2>
            </div>

            <div className="w-full">
              <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={finalTabs} />
            </div>
          </div>
        ) : null}
        {!isLoading && !isLg ? (
          <div className="w-full">
            <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={finalTabs} />
          </div>
        ) : null}

        <div className="flex h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4 lg:h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-6rem)]">
          <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
            {finalTabs?.[selectedTab]?.icon ? (
              <span className="flex items-center gap-x-2">
                <Icon icon={finalTabs?.[selectedTab]?.icon} /> {finalTabs?.[selectedTab]?.label}
              </span>
            ) : null}
            {finalTabs?.[selectedTab]?.id === "project_settings" ? (
              <div className="ml-auto w-min">
                <Button
                  icon={IconEnum.save}
                  isDisabled={isUpdating}
                  isLoading={isUpdating}
                  label="Save"
                  onClick={handleSave}
                  size="sm"
                  variant="success"
                />
              </div>
            ) : null}

            {finalTabs?.[selectedTab]?.id === "map_pin_types" ? (
              <div className="ml-auto w-min">
                <Button icon={IconEnum.add} label="Create" onClick={handleOpenNewMapPinTypeDrawer} size="sm" variant="info" />
              </div>
            ) : null}
            {finalTabs?.[selectedTab]?.id === "custom_relationship_types" ? (
              <div className="ml-auto w-min">
                <Button
                  icon={IconEnum.add}
                  label="Create"
                  onClick={handleOpenNewRelationshipTypeDrawer}
                  size="sm"
                  variant="info"
                />
              </div>
            ) : null}
            {finalTabs?.[selectedTab]?.id === "members" && isProjectOwner ? (
              <div className="ml-auto w-min">
                <Button
                  icon={IconEnum.user_invite}
                  label="Invite"
                  onClick={handleOpenInviteToProjectDrawer}
                  size="sm"
                  variant="info"
                />
              </div>
            ) : null}
            {finalTabs?.[selectedTab]?.id === "roles_permissions" && isProjectOwner ? (
              <div className="ml-auto w-min">
                <Button icon={IconEnum.add} label="Create" onClick={handleOpenRolesDrawer} size="sm" variant="info" />
              </div>
            ) : null}
            {finalTabs?.[selectedTab]?.id === "gateway_configuration" && isProjectOwner ? (
              <div className="ml-auto w-min">
                <Button icon={IconEnum.add} label="Create" onClick={handleOpenGatewayConfigDrawer} size="sm" variant="info" />
              </div>
            ) : null}
          </h2>
          {finalTabs?.[selectedTab]?.id === "project_settings" ? (
            <div className="flex h-full max-h-[calc(100%-3rem)] flex-col gap-y-4 overflow-auto">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 lg:col-span-8">
                  <Input label="Title" name="title" onChange={handleChange} value={project?.title || ""} />
                </div>
                <div className="col-span-12 self-end lg:col-span-4">
                  <ImageSelect
                    helperText="Ideal image size is 56x56"
                    isIconOnly={isLg}
                    label="Project image"
                    name="image_id"
                    onChange={handleChange}
                    type="images"
                    value={project?.image_id || ""}
                  />
                </div>
              </div>
              <div className="h-80">
                <Textarea
                  label="Description (max 2500 characters)"
                  maxLength={2500}
                  name="description"
                  onChange={handleChange}
                  value={project?.description || ""}
                />
              </div>
              <hr className="border-zinc-700" />

              <div className="flex flex-nowrap items-center justify-between">
                <span>Public:</span>
                <Checkbox
                  allowedPlacements={["left"]}
                  name="is_public"
                  onChange={handleChange}
                  tooltip="Marking a project as public will make it appear on the Arkive's wiki homepage and be viewable by all."
                  value={!!project?.is_public}
                />
              </div>

              {isProjectOwner ? (
                <div>
                  <Collapsible label="Delete project" size="xl">
                    <div className="flex items-center justify-end py-2">
                      <div>
                        <Button
                          icon={IconEnum.trash}
                          label="Delete project (permanent)"
                          onClick={() => {
                            setDialog((prev) => ({
                              ...prev,
                              title: `Delete project - ${project?.title || ""}`,
                              description:
                                "Are you sure you wish to delete this project? All data associated with this project will be PERMANENTLY deleted.",
                              warning: "THIS ACTION IS IRREVERSABLE! ONCE DELETED DATA CANNOT BE RECOVERED!",
                              cancel: {
                                action: () => {},
                                variant: "info",
                                label: "Cancel",
                                icon: IconEnum.close,
                              },
                              confirm: {
                                action: async () => {
                                  await deleteProject(
                                    { data: { id: project_id as string } },
                                    {
                                      onSuccess: () => {
                                        navigate("/");
                                      },
                                    }
                                  );
                                },
                                variant: "error-bordered",
                                label: "Delete (permanent)",
                                icon: IconEnum.trash,
                              },
                              isOverlay: true,
                            }));
                          }}
                          variant="error"
                        />
                      </div>
                    </div>
                  </Collapsible>
                </div>
              ) : (
                false
              )}
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "tags" ? (
            <div className="max-h-[95%]">
              <TagView />
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "character_fields_templates" ? (
            <div className="max-h-[95%]">
              <CharacterTemplatesView />
            </div>
          ) : null}

          {finalTabs?.[selectedTab]?.id === "map_pin_types" ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={mapPinTypeTableColumns(setDialog, setDrawer)}
                  data={projectData?.data?.map_pin_types || []}
                  dispatch={dispatch}
                  type="map_pin_types"
                />
              </div>
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "custom_relationship_types" ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={relationshipTableColumns(setDialog)}
                  data={projectData?.data?.character_relationship_types || []}
                  dispatch={dispatch}
                  type="character_relationship_types"
                />
              </div>
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "members" && isProjectOwner ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={membersColumns(kickUser, setDialog, roles?.data || [], assignRole, project_id as string)}
                  data={projectData?.data?.members || []}
                  dispatch={dispatch}
                  type="character_relationship_types"
                />
              </div>
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "roles_permissions" && isProjectOwner ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={rolesColumns(setDrawer)}
                  config={{ expandable: true }}
                  data={roles?.data || []}
                  dispatch={dispatch}
                  type="roles"
                />
              </div>
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "integrations" && isProjectOwner ? (
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-nowrap items-center justify-between">
                <span>Game System:</span>
                <div className="w-56">
                  <Select
                    name="game_system_id"
                    onChange={({ value }) => {
                      updateProject({ data: { game_system_id: value as string, id: project_id as string } });
                    }}
                    options={(gameSystems?.data || []).map((sys) => ({ label: sys.title, value: sys.id }))}
                    value={projectData?.data?.game_system_id}
                  />
                </div>
              </div>
              <hr className="border-zinc-700" />
              <div className="flex flex-nowrap items-center justify-between">
                <span>API Key:</span>
                <div className="flex items-center gap-x-2">
                  <Button
                    icon={IconEnum.api_key}
                    label="Show API key"
                    onClick={async () => {
                      const p = await (getAPIKey() as Promise<{ data: string }>);
                      if (p.data) {
                        createNotification({
                          title: "API Key",
                          hasNoTruncate: true,
                          description: "Do not share the API Key for your project with anyone.",
                          timer: 15,
                          variant: "info",
                          actions: [
                            { label: "Copy", icon: IconEnum.copy, onClick: () => window.navigator.clipboard.writeText(p.data) },
                          ],
                        });
                      }
                    }}
                    variant="info"
                  />
                  <div>
                    <Button
                      icon={IconEnum.api_key_reset}
                      label="Reset API key"
                      onClick={resetAPIKey}
                      tooltip="If you believe your API key has been compromised, please reset it. Any application or extension using the API key will stop working until you update your key."
                      variant="error-bordered"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {finalTabs?.[selectedTab]?.id === "gateway_configuration" && isProjectOwner ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={gatewayColumns(setDrawer, setDialog)}
                  config={{ expandable: true }}
                  data={gateway_configurations?.data || []}
                  dispatch={dispatch}
                  type="gateway_configurations"
                />
              </div>
            </div>
          ) : null}

          {finalTabs?.[selectedTab]?.id === "feature_settings" ? (
            <div className="flex max-h-[90%] flex-col gap-y-2 overflow-y-auto">
              <Collapsible
                actions={[
                  {
                    icon: IconEnum.check_circle,
                    tooltip: "Select all",
                    variant: "primary",
                    onClick: () => {
                      handleChange(
                        UserNotificationEntities.flatMap((entity) => [
                          { name: `feature_flags.${entity}_create_notification`, value: true },
                          { name: `feature_flags.${entity}_update_notification`, value: true },
                          { name: `feature_flags.${entity}_delete_notification`, value: true },
                        ])
                      );
                    },
                  },
                  {
                    icon: IconEnum.save,
                    variant: "success",
                    onClick: () =>
                      updateUser(
                        {
                          relations: {
                            feature_flags: { project_id: project_id as string, feature_flags: project?.feature_flags || {} },
                          },
                        },
                        { onSuccess: () => queryClient.invalidateQueries(["projects"]) }
                      ),
                  },
                ]}
                label="Notifications from other project members">
                <div className="bg-zinc-900">
                  {UserNotificationEntities.map((entity) => (
                    <div
                      key={entity}
                      className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                      <span>{capitalizeFirstLetter(getSentenceCase(entity))}:</span>
                      <div className="flex w-52 items-center justify-between gap-x-2 text-center">
                        <Checkbox
                          label="Create"
                          name={`feature_flags.${entity}_create_notification`}
                          onChange={handleChange}
                          value={project?.feature_flags?.[`${entity}_create_notification`]}
                        />
                        <Checkbox
                          label="Update"
                          name={`feature_flags.${entity}_update_notification`}
                          onChange={handleChange}
                          value={project?.feature_flags?.[`${entity}_update_notification`]}
                        />
                        <Checkbox
                          label="Delete"
                          name={`feature_flags.${entity}_delete_notification`}
                          onChange={handleChange}
                          value={project?.feature_flags?.[`${entity}_delete_notification`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
              <Collapsible
                actions={[
                  {
                    icon: IconEnum.check_circle,
                    tooltip: "Select all",
                    variant: "primary",
                    onClick: () => {
                      handleChange(
                        UserSidebarEntitiesEnabled.map((entity) => ({ name: `feature_flags.${entity}_enabled`, value: true }))
                      );
                    },
                  },

                  {
                    icon: IconEnum.save,
                    variant: "success",
                    onClick: () =>
                      updateUser(
                        {
                          relations: {
                            feature_flags: { project_id: project_id as string, feature_flags: project?.feature_flags || {} },
                          },
                        },
                        { onSuccess: () => queryClient.invalidateQueries(["projects"]) }
                      ),
                  },
                ]}
                label="Entity settings">
                <div className="bg-zinc-900">
                  {UserSidebarEntitiesEnabled.map((entity) => (
                    <div
                      key={entity}
                      className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                      <span>Show {getPluralEntityType(entity as AllAvailableEntities)}:</span>
                      <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                        <Checkbox
                          label="Enabled"
                          name={`feature_flags.${entity}_enabled`}
                          onChange={handleChange}
                          value={project?.feature_flags?.[`${entity}_enabled`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
              <Collapsible
                actions={[
                  {
                    icon: IconEnum.save,
                    variant: "success",
                    onClick: () =>
                      updateUser(
                        {
                          relations: {
                            feature_flags: { project_id: project_id as string, feature_flags: project?.feature_flags || {} },
                          },
                        },
                        { onSuccess: () => queryClient.invalidateQueries(["projects"]) }
                      ),
                  },
                ]}
                label="Miscellaneous settings">
                <div className="bg-zinc-900">
                  {MiscellaneousSettings.map((setting) => (
                    <div
                      key={setting}
                      className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                      <span>{getSentenceCase(setting)}:</span>
                      <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                        <Checkbox
                          label="Enabled"
                          name={`feature_flags.${setting}`}
                          onChange={handleChange}
                          value={project?.feature_flags?.[setting]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
