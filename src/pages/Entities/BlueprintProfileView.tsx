import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Tabs } from "../../components";
import { useGetSubEntity } from "../../hooks";
import { BlueprintInstanceType } from "../../types";
import { IconEnum } from "../../utils";

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  //   { id: "2", label: "Relationships", icon: IconEnum.family_tree },
  //   { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  //   { id: "4", label: "Conversations", icon: IconEnum.conversation },
];

export default function BlueprintProfileView() {
  const { project_id, item_id, subitem_id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  const { data: blueprintInstance } = useGetSubEntity<BlueprintInstanceType>(subitem_id, "blueprint_instances", {
    data: { id: subitem_id },
  });

  return (
    <div className="flex h-full min-h-full flex-col gap-y-2">
      <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
        <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
          <div className="mt-2 flex flex-col gap-y-1">
            <h2 className="text-center font-merriweather text-lg">{`${blueprintInstance?.data?.title || ""}`.trimEnd()}</h2>
          </div>
          <div className="w-full">
            <Tabs
              isVertical
              onChange={(tab, index) => {
                navigate(`/projects/${project_id}/blueprints/${item_id}/${subitem_id}/${tab.label.toLowerCase()}`);
                setSelectedTab(index);
              }}
              selectedTab={selectedTab}
              tabs={tabs}
            />
          </div>
        </div>
        <div className="flex h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4 lg:h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-6rem)]" />
      </div>
    </div>
  );
}
