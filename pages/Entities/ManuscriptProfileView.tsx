import { useParams } from "react-router-dom";

import { Icon } from "../../components";
import { useGetEntity } from "../../hooks";
import { ManuscriptType } from "../../types/EntityTypes/manuscriptTypes";
import { getDefaultEntityIcon } from "../../utils";

export function ManuscriptProfileView() {
  const { item_id } = useParams();
  const { data: existingManuscript } = useGetEntity<ManuscriptType>(item_id, "manuscripts", {
    fields: ["id", "owner_id", "title"],
    relations: { entities: true },
  });

  return (
    <div className="grid h-full grid-cols-12 gap-x-2">
      <div className="col-span-3 flex h-full flex-col rounded bg-zinc-800 p-2">
        <h2 className="text-center text-2xl font-bold">{existingManuscript?.data?.title}</h2>
        <ul>
          {existingManuscript?.data?.entities?.length
            ? existingManuscript?.data?.entities?.map((entity) => (
                <li className="flex items-center gap-x-2 text-lg font-semibold" key={entity?.id}>
                  <Icon icon={getDefaultEntityIcon(entity?.type)} />
                  {entity?.title}
                </li>
              ))
            : null}
        </ul>
      </div>
      <div className="col-span-9 flex h-full flex-col rounded bg-zinc-950 p-2"></div>
    </div>
  );
}
