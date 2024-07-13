import { Link, useParams } from "react-router-dom";

import { EntityPreviewDrawer, Icon } from "../../components";
import { useGetEntity } from "../../hooks";
import { AvailableManuscriptEntityTypes, ManuscriptEntityType, ManuscriptType } from "../../types/EntityTypes/manuscriptTypes";
import { buildManuscript, getDefaultEntityIcon } from "../../utils";

function getEntityId(entity: ManuscriptEntityType) {
  return (
    entity.character_id ||
    entity.blueprint_instance_id ||
    entity.document_id ||
    entity.map_id ||
    entity.map_pin_id ||
    entity.graph_id ||
    entity.event_id ||
    entity.image_id
  );
}

function ManuscriptEntityPreview({ type }: { type: AvailableManuscriptEntityTypes }) {
  const { subitem_id } = useParams();

  return <EntityPreviewDrawer data={{ id: subitem_id as string, parent_id: undefined, entity_type: type }} />;
}

export function ManuscriptProfileView() {
  const { project_id, item_id, subitem_id } = useParams();
  const { data: existingManuscript } = useGetEntity<ManuscriptType>(item_id, "manuscripts", {
    fields: ["id", "owner_id", "title"],
    relations: { entities: true },
  });
  const manuscriptTree = buildManuscript(existingManuscript?.data?.entities || []);

  return (
    <div className="grid h-full grid-cols-12 gap-x-2">
      <div className="col-span-3 flex h-full flex-col rounded bg-zinc-800 p-2">
        <h2 className="text-center text-2xl font-bold">{existingManuscript?.data?.title}</h2>
        <ul>
          {manuscriptTree?.length
            ? manuscriptTree?.map((entity) => {
                const relatedEntityId = getEntityId(entity);

                return (
                  <li
                    className={`text-lg font-semibold transition-colors hover:text-blue-300 active:text-blue-500 ${relatedEntityId === subitem_id ? "text-blue-400" : ""}`}
                    key={entity?.id}>
                    <Link
                      className="flex w-full items-center gap-x-2"
                      to={`/projects/${project_id}/manuscripts/${item_id}/${relatedEntityId}`}>
                      <Icon icon={getDefaultEntityIcon(entity?.type)} />
                      {entity?.title}
                    </Link>
                  </li>
                );
              })
            : null}
        </ul>
      </div>
      <div className="col-span-9 flex h-full flex-col rounded bg-zinc-950 p-2">
        <ManuscriptEntityPreview type="documents" />
      </div>
    </div>
  );
}
