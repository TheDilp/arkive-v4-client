import { useParams } from "react-router-dom";

import { CharacterPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/characterPreviewTypes";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar, Button } from "..";

export function CharacterPreview({ id, image_id, character_name, clearAction }: CharacterPreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex flex-nowrap items-center gap-x-2 p-1">
      <Avatar image={getImageURL(project_id as string, "images", image_id)} label={character_name} size="sm" />
      <span className="font-medium italic">{character_name}</span>
      {clearAction ? (
        <div className="ml-auto">
          <Button hasNoBackground icon={IconEnum.close} onClick={() => clearAction(id)} />
        </div>
      ) : null}
    </div>
  );
}
