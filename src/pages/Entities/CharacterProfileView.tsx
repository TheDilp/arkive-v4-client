import { useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Tabs } from "../../components";
import { useGetEntity } from "../../hooks";
import { CharacterType } from "../../types";
import { getCharacterFullName, getImageURL, IconEnum } from "../../utils";

const tabs = [
  { id: "1", label: "Profile", icon: IconEnum.character },
  { id: "2", label: "Additional fields", icon: IconEnum.additional_fields },
  { id: "3", label: "Documents", icon: IconEnum.document },
  { id: "4", label: "Locations", icon: IconEnum.map_pin },
  { id: "5", label: "Images", icon: IconEnum.image },
  { id: "6", label: "Tags", icon: IconEnum.tags },
];

export function CharacterProfileView() {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: existingCharacter, isFetching } = useGetEntity<CharacterType>(item_id, "characters", {
    data: {},
    relations: { tags: true },
  });
  if (isFetching) return null;
  return (
    <div className="grid h-full max-h-[calc(100%-2rem)] w-full grid-cols-5 gap-x-4 p-4">
      <div className="col-span-1 flex h-full flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-900 p-4">
        <Avatar
          image={getImageURL(project_id as string, "images", existingCharacter?.data?.portrait_id)}
          label={getCharacterFullName(
            existingCharacter?.data?.first_name as string,
            existingCharacter?.data?.nickname || "",
            existingCharacter?.data?.last_name || "",
          )}
          size="4xl"
        />
        <div className="mt-2 flex flex-col gap-y-1">
          <h2 className="text-center font-merriweather text-lg">
            {`${existingCharacter?.data?.first_name} ${existingCharacter?.data?.last_name}`.trimEnd()}
          </h2>
          {existingCharacter?.data?.nickname ? (
            <h3 className="text-center font-lato">{existingCharacter?.data?.nickname}</h3>
          ) : null}
        </div>

        <div className="w-full">
          <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
        </div>
      </div>
      <div className="col-span-4 h-full rounded-lg bg-zinc-800 p-4">asd</div>
    </div>
  );
}
