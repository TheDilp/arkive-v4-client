import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import omit from "lodash.omit";
import { Dispatch, useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Collapsible,
  ColorPicker,
  createColumnHelper,
  Dropdown,
  ImageSelect,
  Input,
  Skeleton,
  Table,
  Tabs,
  Title,
} from "../../components";
import {
  useBreakpoint,
  useDeleteWebhook,
  useGetEntities,
  useGetEntity,
  useHandleChange,
  useTable,
  useUpdateEntity,
} from "../../hooks";
import { CharacterRelationshipType, DialogAtomType, ProjectType, UserType, WebhookType } from "../../types";
import {
  AllEntities,
  capitalizeFirstLetter,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getFirstLetters,
  getImageURL,
  getSentenceCase,
  IconEnum,
  isProjectOwnerAtom,
  userAtom,
} from "../../utils";
import { UpdateProjectType } from "../../validation";

const tabs = [
  { id: "1", label: "Project settings", icon: IconEnum.settings, isOwner: false },
  { id: "2", label: "Custom relationship types", icon: IconEnum.family_tree, isOwner: false },
  { id: "3", label: "Members", icon: IconEnum.users, isOwner: true },
  { id: "4", label: "User settings", icon: IconEnum.user_settings, isOwner: false },
];

const relationshipTypesColumnHelper = createColumnHelper<CharacterRelationshipType>();
const membersColumnHelper = createColumnHelper<UserType>();

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
                    title: "Delete character",
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
function membersColumns() {
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
    membersColumnHelper.display({
      id: "nickname",
      header: "Nickname",
      cell: ({ row }) => row.original.nickname,
    }),
    relationshipTypesColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: () => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "remove_member",
                title: "Remove member from project",
                icon: IconEnum.user_remove,
                onClick: () => {
                  // setDialog((prev) => ({
                  //   ...prev,
                  //   data: {
                  //     ...row.original,
                  //     entity_title: "character_relationship_types",
                  //   },
                  //   title: "Delete character",
                  //   size: "sm",
                  //   type: "delete_entity",
                  // }));
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

export function ProjectSettingsView() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();

  const [selectedTab, setSelectedTab] = useState(0);
  const [project, setProject] = useState<ProjectType | null>();
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  const isProjectOwner = useAtomValue(isProjectOwnerAtom);

  const { handleChange } = useHandleChange({ data: project, setData: setProject });

  const [, dispatch] = useTable({});
  const { data: projectData, isLoading } = useGetEntity<ProjectType>(
    project_id as string,
    "projects",
    {
      fields: ["id", "title", "image_id", "default_dice_color", "owner_id"],
      relations: {
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

  const { data: webhooks } = useGetEntities<WebhookType>({ data: { user_id: user?.id } }, "webhooks", { enabled: !!user?.id });
  const { mutateAsync: deleteWebhook } = useDeleteWebhook();

  useLayoutEffect(() => {
    if (projectData?.data) setProject(projectData.data);
  }, [projectData]);

  useEffect(() => {
    if (selectedTab === 3 && !isProjectOwner) {
      setSelectedTab(0);
    }
  }, [selectedTab, isProjectOwner]);

  async function handleSave() {
    if (project) await updateProject({ data: omit(project, ["character_relationship_types"]) });
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
  const finalTabs = isProjectOwner ? tabs : tabs.filter((t) => t.isOwner === false);
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
            {tabs[selectedTab].label}
            {selectedTab === 0 ? (
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
            {selectedTab === 1 ? (
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
            {selectedTab === 2 ? (
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
          </h2>
          {selectedTab === 0 ? (
            <div className="flex h-full max-h-[calc(100%-3rem)] flex-col gap-y-4 overflow-auto">
              <div className=" grid grid-cols-12 gap-2">
                <div className="col-span-12 lg:col-span-9">
                  <Input label="Title" name="title" onChange={handleChange} value={project?.title || ""} />
                </div>
                <div className="col-span-12 lg:col-span-3">
                  <ImageSelect
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
            </div>
          ) : null}
          {selectedTab === 1 ? (
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
          {selectedTab === 2 ? (
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={membersColumns()}
                  data={projectData?.data?.members || []}
                  dispatch={dispatch}
                  type="character_relationship_types"
                />
              </div>
            </div>
          ) : null}
          {selectedTab === 3 ? (
            <div className="flex max-h-[90%] flex-col gap-y-2 overflow-y-auto">
              <Collapsible label="Notifications from other project members">
                {AllEntities.map((entity) => (
                  <div
                    key={entity}
                    className="flex flex-nowrap items-center justify-between border-t border-zinc-700 py-1 pt-0 first:border-t-0">
                    <span>{capitalizeFirstLetter(getSentenceCase(entity))}:</span>
                    <div className="flex w-52 items-center justify-between gap-x-2 text-center">
                      <Checkbox
                        isDisabled
                        label="Create"
                        name={`${entity}_create_notification`}
                        onChange={() => {}}
                        value={false}
                      />
                      <Checkbox
                        isDisabled
                        label="Update"
                        name={`${entity}_update_notification`}
                        onChange={() => {}}
                        value={false}
                      />
                      <Checkbox
                        isDisabled
                        label="Delete"
                        name={`${entity}_delete_notification`}
                        onChange={() => {}}
                        value={false}
                      />
                    </div>
                  </div>
                ))}
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
