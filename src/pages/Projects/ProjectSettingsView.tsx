import { useState } from "react";
import { useParams } from "react-router-dom";

import { Tabs } from "../../components";
import { useGetEntity } from "../../hooks";
import { ProjectType } from "../../types";
import { IconEnum } from "../../utils";

const tabs = [
  { id: "1", label: "Project settings", icon: IconEnum.settings },
  { id: "2", label: "Custom relationship types", icon: IconEnum.family_tree },
  // { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  // { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
];

export function ProjectSettingsView() {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: projectData } = useGetEntity<ProjectType>(project_id as string, "projects", {
    fields: ["id", "title", "image_id"],
  });
  return (
    <div className="grid h-full max-h-full w-full grid-cols-5 content-start gap-4 overflow-hidden pt-0 lg:content-stretch">
      <div className="col-span-5 flex h-full min-h-fit flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-800 p-4 lg:col-span-1 lg:h-full lg:max-h-full">
        <h2 className="text-center font-merriweather text-lg">{`${projectData?.data?.title}`.trimEnd()}</h2>
        <div className="w-full">
          <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
        </div>
      </div>

      <div className="col-span-5 min-h-[calc(100%)] rounded-lg bg-zinc-950 p-4 lg:col-span-4">B</div>
    </div>
  );
}
