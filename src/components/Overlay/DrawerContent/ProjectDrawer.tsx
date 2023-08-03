import { useResetAtom } from "jotai/utils";
import { useState } from "react";

import { useCreateProject, useHandleChange } from "../../../hooks";
import { ProjectType } from "../../../types/EntityTypes/projectTypes";
import { CreateType } from "../../../types/utilTypes";
import { drawerAtom, IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";

export function ProjectDrawer({ data }: { data: CreateType<ProjectType> }) {
  const ownerId = localStorage.getItem("ownerId");
  const [project, setProject] = useState<CreateType<ProjectType>>({ ...data, ownerId: ownerId as string });
  const { handleChange } = useHandleChange({ data: project, setData: setProject });
  const { mutateAsync } = useCreateProject<CreateType<ProjectType>>();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  return (
    <>
      <Input
        label="Project title"
        name="title"
        onChange={handleChange}
        placeholder="New project"
        value={project?.title || ""}
      />

      <Button
        icon={IconEnum.add}
        isDisabled={!project?.title}
        label="Create project"
        onClick={async () => {
          if (project)
            await mutateAsync(project, {
              onSuccess: resetDrawerAtom,
            });
        }}
        variant="success"
      />
    </>
  );
}
