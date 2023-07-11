import { useState } from "react";

import { Button, Input } from "../../Form";
import { CreateType } from "../../../types/utilTypes";
import { ProjectType } from "../../../types/EntityTypes/projectTypes";
import { useCreateProject, useHandleChange } from "../../../hooks";
import { IconEnum } from "../../../utils";

export function ProjectDrawer({ data, resetDrawerAtom }: { data: CreateType<ProjectType>; resetDrawerAtom: () => void }) {
  const ownerId = localStorage.getItem("ownerId");
  const [project, setProject] = useState<CreateType<ProjectType>>({ ...data, ownerId: ownerId as string });
  const { handleChange } = useHandleChange({ data: project, setData: setProject });
  const { mutateAsync } = useCreateProject<CreateType<ProjectType>>();
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
