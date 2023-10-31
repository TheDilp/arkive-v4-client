import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import omit from "lodash.omit";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Button,
  Checkbox,
  ColorPicker,
  createColumnHelper,
  Dropdown,
  ImageSelect,
  Input,
  Table,
  TablePageLayout,
  Tabs,
  Title,
} from "../../components";
import { useBreakpoint, useGetEntity, useHandleChange, useTable, useUpdateEntity } from "../../hooks";
import { CharacterRelationshipType, DialogAtomType, ProjectType } from "../../types";
import {
  AllEntities,
  capitalizeFirstLetter,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getSentenceCase,
  IconEnum,
  isUserOwnerAtom,
} from "../../utils";
import { UpdateProjectType } from "../../validation";

const tabs = [
  { id: "1", label: "Project settings", icon: IconEnum.settings, isOwner: false },
  { id: "2", label: "Custom relationship types", icon: IconEnum.family_tree, isOwner: false },
  { id: "3", label: "User settings", icon: IconEnum.user_settings, isOwner: false },
  { id: "4", label: "Members", icon: IconEnum.users, isOwner: true },
];

const relationshipTypesColumnHelper = createColumnHelper<CharacterRelationshipType>();

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
                label: "Delete relationship type",
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

export function ProjectSettingsView() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();

  const [selectedTab, setSelectedTab] = useState(0);
  const [project, setProject] = useState<ProjectType | null>();

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  const isUserOwner = useAtomValue(isUserOwnerAtom);

  const { handleChange } = useHandleChange({ data: project, setData: setProject });

  const [, dispatch] = useTable({});
  const { data: projectData } = useGetEntity<ProjectType>(
    project_id as string,
    "projects",
    {
      fields: ["id", "title", "image_id", "default_dice_color", "owner_id"],
      relations: {
        character_relationship_types: true,
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

  useLayoutEffect(() => {
    if (projectData?.data) setProject(projectData.data);
  }, [projectData]);

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

  return (
    <div className="grid h-full max-h-full w-full grid-cols-5 content-start gap-4 overflow-hidden pt-0 lg:content-stretch">
      <div className="col-span-5 flex h-full min-h-fit flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-800 p-4 lg:col-span-1 lg:h-full lg:max-h-full">
        <h2 className="text-center font-merriweather text-lg">{`${projectData?.data?.title || ""}`.trimEnd()}</h2>
        <div className="w-full">
          <Tabs
            isVertical
            onChange={(_, index) => setSelectedTab(index)}
            selectedTab={selectedTab}
            tabs={isUserOwner ? tabs : tabs.filter((t) => t.isOwner === false)}
          />
        </div>
      </div>

      <div className="col-span-5 min-h-[calc(100%)] rounded-lg bg-zinc-950 p-4 lg:col-span-4">
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
          <div>
            <TablePageLayout>
              <Table
                columns={relationshipTableColumns(setDialog)}
                data={projectData?.data?.character_relationship_types || []}
                dispatch={dispatch}
                type="character_relationship_types"
              />
            </TablePageLayout>
          </div>
        ) : null}
        {selectedTab === 2 ? (
          <div className="flex max-h-[94.75%] flex-col gap-y-0 overflow-y-auto pb-6">
            <Title label="Notifications from other project members" size="xl" />
            {AllEntities.map((entity) => (
              <div key={entity} className="flex flex-nowrap items-center justify-between border-t border-zinc-700 py-1 pt-0">
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
