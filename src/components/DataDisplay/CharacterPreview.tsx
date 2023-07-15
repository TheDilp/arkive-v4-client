import { useParams } from "react-router-dom";

import { CharacterPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/characterPreviewTypes";
import { getImageURL } from "../../utils";
import { Avatar } from "..";

export function CharacterPreview({ image_id, character_name }: CharacterPreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex flex-nowrap items-center gap-x-2 p-1">
      <Avatar image={getImageURL(project_id as string, "images", image_id)} label={character_name} size="sm" />
      <span className="font-medium italic">{character_name}</span>
    </div>
  );
}
