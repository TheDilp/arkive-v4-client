import { SetStateAction, useSetAtom } from "jotai";
import omit from "lodash.omit";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Button,
  ColorPicker,
  createColumnHelper,
  Dropdown,
  ImageSelect,
  Input,
  Table,
  TablePageLayout,
  Tabs,
} from "../../components";
import { useGetEntity, useHandleChange, useTable, useUpdateEntity } from "../../hooks";
import { CharacterRelationshipType, DialogAtomType, ProjectType } from "../../types";
import { DefaultTagColor, dialogAtom, drawerAtom, IconEnum } from "../../utils";
import { UpdateProjectType } from "../../validation";

const tabs = [
  { id: "1", label: "Project settings", icon: IconEnum.settings },
  { id: "2", label: "Custom relationship types", icon: IconEnum.family_tree },
  // { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  // { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [project, setProject] = useState<ProjectType | null>();
  const setDialog = useSetAtom(dialogAtom);
  const { handleChange } = useHandleChange({ data: project, setData: setProject });
  const [, dispatch] = useTable({});
  const setDrawer = useSetAtom(drawerAtom);
  const { data: projectData } = useGetEntity<ProjectType>(project_id as string, "projects", {
    fields: ["id", "title", "image_id", "default_dice_color"],
    relations: {
      character_relationship_types: true,
    },
  });

  const { mutateAsync: updateProject } = useUpdateEntity<UpdateProjectType>("projects", project_id as string);

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
        <h2 className="text-center font-merriweather text-lg">{`${projectData?.data?.title}`.trimEnd()}</h2>
        <div className="w-full">
          <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
        </div>
      </div>

      <div className="col-span-5 min-h-[calc(100%)] rounded-lg bg-zinc-950 p-4 lg:col-span-4">
        <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 font-merriweather text-2xl">
          {tabs[selectedTab].label}
          {selectedTab === 0 ? (
            <div className="ml-auto w-min">
              <Button icon={IconEnum.save} label="Save" onClick={handleSave} size="sm" variant="success" />
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
            <div className="flex flex-nowrap gap-x-2">
              <div className="w-3/4">
                <Input label="Title" name="title" onChange={handleChange} value={project?.title || ""} />
              </div>
              <div className="w-1/4">
                <ImageSelect
                  isIconOnly
                  label="Project image"
                  name="image_id"
                  onChange={handleChange}
                  type="images"
                  value={project?.image_id || ""}
                />
              </div>
            </div>
            <div className="flex flex-nowrap justify-between">
              <span>Default dice color:</span>
              <ColorPicker
                name="default_dice_color"
                onChange={handleChange}
                value={project?.default_dice_color || DefaultTagColor}
              />
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
      </div>
    </div>
  );
}
