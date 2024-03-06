import { useUser } from "@clerk/clerk-react";
import { UseMutateFunction } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deepMerge } from "remirror";

import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Collapsible,
  ColorPicker,
  createColumnHelper,
  Dropdown,
  Icon,
  ImageSelect,
  Input,
  Skeleton,
  Table,
  Tabs,
  Title,
} from "../../components";
import {
  useBreakpoint,
  useDeleteEntity,
  useDeleteWebhook,
  useGetEntities,
  useGetEntity,
  useHandleChange,
  useKickMember,
  useTable,
  useUpdateEntity,
  useUpdateUser,
} from "../../hooks";
import {
  AllAvailableEntities,
  CharacterRelationshipType,
  DialogAtomType,
  DrawerAtomType,
  MapPinTypesType,
  ProjectType,
  RoleType,
  UserType,
  WebhookType,
} from "../../types";
import {
  capitalizeFirstLetter,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getFirstLetters,
  getImageURL,
  getPluralEntityType,
  getSentenceCase,
  IconEnum,
  isProjectOwnerAtom,
  MiscellaneousSettings,
  userAtom,
  UserNotificationEntities,
  UserSidebarEntitiesEnabled,
} from "../../utils";
import { UpdateProjectSchema, UpdateProjectType } from "../../validation";

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
const tabs = [
  { id: "1", label: "Project settings", icon: IconEnum.settings, isOwner: false },
  { id: "2", label: "Map pin types", icon: IconEnum.map_pin, isOwner: false },
  { id: "3", label: "Custom relationship types", icon: IconEnum.family_tree, isOwner: false },
  { id: "4", label: "Members", icon: IconEnum.users, isOwner: true },
  { id: "5", label: "Roles & permissions", icon: IconEnum.permissions, isOwner: true },
  { id: "6", label: "User settings", icon: IconEnum.user_settings, isOwner: false },
];

const mapPinTypesColumnHelper = createColumnHelper<MapPinTypesType>();
const relationshipTypesColumnHelper = createColumnHelper<CharacterRelationshipType>();
const membersColumnHelper = createColumnHelper<UserType>();
const rolesColumnHelper = createColumnHelper<RoleType>();

function mapPinTypeTableColumns(
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
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
  project_id: string,
) {
  return [
    membersColumnHelper.display({
      id: "image",
      header: "Image",
      cell: ({ row }) => <b>{row.original.image}</b>,
      minSize: 5,
      maxSize: 5,
    }),
    membersColumnHelper.display({
      id: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
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
const rolesColumns = [
  rolesColumnHelper.display({
    id: "title",
    header: "Title",
    cell: ({ row }) => row.original.title,
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
            { id: "1", title: "Edit role", icon: IconEnum.edit },
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

export function ProjectSettingsView() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const { mutate: kickUser } = useKickMember();

  const finalTabs = isProjectOwner ? tabs : tabs.filter((t) => t.isOwner === false);

  const [project, setProject] = useState<ProjectType | null>();
  const { user: authUser } = useUser();
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
      fields: ["id", "title", "image_id", "default_dice_color", "owner_id"],
      relations: {
        map_pin_types: true,
        character_relationship_types: true,
        members: true,
      },
    },
    {
      queryKeyConcat: ["settings"],
    },
  );
  const { mutateAsync: updateProject, isLoading: isUpdating } = useUpdateEntity<UpdateProjectType>(
    "projects",
    project_id as string,
  );
  const { mutate: updateUser } = useUpdateUser(user?.id || "", authUser?.id || "");
  function handleFeatureFlagChange(newValue: { name: string; value: boolean }) {
    const newFeatureFlags = deepMerge(user?.feature_flags || {}, { [newValue.name]: newValue.value });
    updateUser({
      data: {
        feature_flags: newFeatureFlags,
      },
    });
  }

  const { data: webhooks } = useGetEntities<WebhookType>(
    { data: { user_id: user?.id }, fields: ["id", "title", "user_id"] },
    "webhooks",
    { enabled: !!user?.id && finalTabs[selectedTab].label === "User settings" },
  );
  const { data: roles } = useGetEntities<RoleType>(
    { data: { project_id }, fields: ["id", "title"], relations: { permissions: true } },
    "roles",
    { enabled: !!user?.id && isProjectOwner && finalTabs[selectedTab].id === "5" },
  );
  const { mutateAsync: deleteWebhook } = useDeleteWebhook();
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
      data: null,
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
              image={getImageURL(projectData?.data?.id as string, "images", projectData?.data?.image_id)}
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
            <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={finalTabs} />
          </div>
        ) : null}

        <div className="flex h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4 lg:h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-6rem)]">
          <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
            <span className="flex items-center gap-x-2">
              <Icon icon={finalTabs[selectedTab].icon} /> {finalTabs[selectedTab].label}
            </span>
            {finalTabs[selectedTab].id === "1" ? (
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
            {finalTabs[selectedTab].id === "2" ? (
              <div className="ml-auto w-min">
                <Button icon={IconEnum.add} label="Create" onClick={handleOpenNewMapPinTypeDrawer} size="sm" variant="info" />
              </div>
            ) : null}
            {finalTabs[selectedTab].id === "3" ? (
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
            {finalTabs[selectedTab].id === "4" && isProjectOwner ? (
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
            {finalTabs[selectedTab].id === "5" && isProjectOwner ? (
              <div className="ml-auto w-min">
                <Button icon={IconEnum.add} label="Create" onClick={handleOpenRolesDrawer} size="sm" variant="info" />
              </div>
            ) : null}
          </h2>
          {finalTabs[selectedTab].id === "1" ? (
            <div className="flex h-full max-h-[calc(100%-3rem)] flex-col gap-y-4 overflow-auto">
              <div className=" grid grid-cols-12 gap-2">
                <div className="col-span-12 lg:col-span-8">
                  <Input label="Title" name="title" onChange={handleChange} value={project?.title || ""} />
                </div>
                <div className="col-span-12 lg:col-span-4">
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

              <div className="flex flex-col gap-y-2">
                <div className="flex flex-nowrap items-center justify-between border-zinc-700">
                  <span>Default dice color:</span>
                  <ColorPicker
                    name="default_dice_color"
                    onChange={handleChange}
                    value={project?.default_dice_color || DefaultTagColor}
                  />
                </div>
                <div className="flex flex-nowrap items-center justify-between border-t border-zinc-700 pt-2">
                  <span>Show images in folder view:</span>
                  <Checkbox name="show_image_folder_view" onChange={handleChange} value={false} />
                </div>
                <div className="flex flex-nowrap items-center justify-between border-t border-zinc-700 pt-2">
                  <span>Show images in table folder view:</span>
                  <Checkbox name="show_image_table_view" onChange={handleChange} value={false} />
                </div>
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
                                "Are you sure you wish to delete this project? All data aassociated with this project will be PERMANENTLY deleted.",
                              warning: "THIS ACTION IS IRREVERSABLE! ONCE DELETED DATA CANNOT BE RECOVERED!",
                              cancel: {
                                action: () => {},
                                variant: "info",
                                label: "Delete (permanent)",
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
                                    },
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
          {finalTabs[selectedTab].id === "2" ? (
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
          {finalTabs[selectedTab].id === "3" ? (
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
          {finalTabs[selectedTab].id === "4" && isProjectOwner ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={membersColumns(kickUser, setDialog, project_id as string)}
                  data={projectData?.data?.members || []}
                  dispatch={dispatch}
                  type="character_relationship_types"
                />
              </div>
            </div>
          ) : null}
          {finalTabs[selectedTab].id === "5" && isProjectOwner ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={rolesColumns}
                  config={{ expandable: true }}
                  data={roles?.data || []}
                  dispatch={dispatch}
                  type="roles"
                />
              </div>
            </div>
          ) : null}
          {finalTabs[selectedTab].id === "6" ? (
            <div className="flex max-h-[90%] flex-col gap-y-2 overflow-y-auto">
              <Collapsible label="Notifications from other project members">
                <div className="bg-zinc-900">
                  {UserNotificationEntities.map((entity) => (
                    <div
                      key={entity}
                      className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                      <span>{capitalizeFirstLetter(getSentenceCase(entity))}:</span>
                      <div className="flex w-52 items-center justify-between gap-x-2 text-center">
                        <Checkbox
                          label="Create"
                          name={`${entity}_create_notification`}
                          onChange={handleFeatureFlagChange}
                          value={user?.feature_flags?.[`${entity}_create_notification`]}
                        />
                        <Checkbox
                          label="Update"
                          name={`${entity}_update_notification`}
                          onChange={handleFeatureFlagChange}
                          value={user?.feature_flags?.[`${entity}_update_notification`]}
                        />
                        <Checkbox
                          label="Delete"
                          name={`${entity}_delete_notification`}
                          onChange={handleFeatureFlagChange}
                          value={user?.feature_flags?.[`${entity}_delete_notification`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
              <Collapsible label="Sidebar settings">
                <div className="bg-zinc-900">
                  {UserSidebarEntitiesEnabled.map((entity) => (
                    <div
                      key={entity}
                      className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                      <span>Show {getPluralEntityType(entity as AllAvailableEntities)}:</span>
                      <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                        <Checkbox
                          label="Enabled"
                          name={`${entity}_enabled`}
                          onChange={handleFeatureFlagChange}
                          value={user?.feature_flags?.[`${entity}_enabled`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
              <Collapsible label="Miscellaneous settings">
                <div className="bg-zinc-900">
                  {MiscellaneousSettings.map((setting) => (
                    <div
                      key={setting}
                      className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                      <span>{getSentenceCase(setting)}:</span>
                      <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                        <Checkbox
                          label="Enabled"
                          name={setting}
                          onChange={handleFeatureFlagChange}
                          value={user?.feature_flags?.[setting]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
              <Collapsible
                actions={[
                  {
                    icon: IconEnum.add,
                    tooltip: "Add webhook",
                    onClick: () =>
                      setDrawer((prev) => ({ ...prev, type: "webhooks", data: {}, title: "Create webhook", size: "md" })),
                  },
                ]}
                label="Webhooks">
                <div className="flex flex-col gap-y-2">
                  {webhooks?.data?.length ? (
                    (webhooks?.data || [])?.map((webhook) => (
                      <div key={webhook.id} className="flex items-center justify-between py-2">
                        <Title label={webhook.title} size="md" />
                        <div className="flex items-center">
                          <div className="h-8 w-8">
                            <Button
                              hasNoBackground
                              icon={IconEnum.edit}
                              onClick={() =>
                                setDrawer((prev) => ({
                                  ...prev,
                                  type: "webhooks",
                                  data: { id: webhook.id },
                                  title: "Create webhook",
                                  size: "md",
                                }))
                              }
                              variant="primary"
                            />
                          </div>
                          <div className="h-8 w-8">
                            <Button
                              hasNoBackground
                              icon={IconEnum.trash}
                              onClick={async () => deleteWebhook({ data: { id: webhook.id } })}
                              variant="error"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Alert label="There are no available webhooks for this user." variant="info" />
                  )}
                </div>
              </Collapsible>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
