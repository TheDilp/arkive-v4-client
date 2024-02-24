import { useGetEntity } from "../../hooks";
import { EntitiesWithFolders, HandleChangePropsType } from "../../types";
import { IconEnum } from "../../utils";
import { EntityPreview } from "../DataDisplay";
import { Search } from "../Form";

type Props = {
  type: EntitiesWithFolders;
  parent_id: string | null;
  handleChange: (props: HandleChangePropsType) => void;
};

type EntityWithParent = { id: string; title: string; parent_id: string; is_folder: boolean };

export function FolderSelect({ handleChange, type, parent_id }: Props) {
  const { data: parentData } = useGetEntity<EntityWithParent & { parents: EntityWithParent[] }>(
    parent_id as string,
    type,
    {
      data: {},
      relations: { parents: true },
      fields: ["id", "title", "parent_id"],
    },
    {
      enabled: !!parent_id,
      queryKeyConcat: [parent_id as string],
    },
  );
  return (
    <div className="flex flex-nowrap items-center gap-x-2">
      {!!parentData?.data?.parents?.length && parent_id ? (
        <div className="flex-1 [&>div>span>a>span]:overflow-visible [&>div>span>a>span]:whitespace-normal [&>div>span>a>span]:break-words [&>div>span>a]:max-h-fit [&>div>span>a]:min-h-fit [&>div>span]:h-fit [&>div>span]:max-h-fit [&>div>span]:min-h-fit [&>div>span]:py-0">
          <EntityPreview
            clearAction={() => handleChange({ name: "parent_id", value: null })}
            icon={IconEnum.folder}
            id="parent"
            label="Folder"
            title={`${parentData?.data?.parents?.map((p) => p.title).join(" / ") || ""}`}
            type={type}
          />
        </div>
      ) : (
        <Search isFolders label="Folder" name="parent_id" onChange={handleChange} searchEntity={type} />
      )}
    </div>
  );
}
