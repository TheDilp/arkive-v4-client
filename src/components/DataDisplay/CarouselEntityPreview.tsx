import { useSetAtom } from "jotai";
import { useParams } from "react-router-dom";

import { AvailableEntityType, ItemPreviewType } from "../../types";
import { drawerAtom, getEntityLink } from "../../utils";
import { Alert } from "../Misc";
import { EntityPreview } from "./EntityPreview";

type Props = {
  items: ItemPreviewType[];
  field_label: string;
};

export function CarouselEntityPreview({ items, field_label }: Props) {
  const { project_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <div className="col-span-6 flex flex-col">
      <span className="w-full text-sm text-zinc-200">{field_label}</span>
      {items.length === 0 ? (
        <div className="overflow-hidden [&>div>div:nth-child(2)]:truncate">
          <Alert label="There is no content." />
        </div>
      ) : null}
      <div className={`grid ${items.length <= 1 ? "grid-cols-1" : "grid-cols-3"} gap-1 `}>
        {items.map((item) => (
          <div key={item?.id}>
            <EntityPreview
              icon={item ? item?.icon : undefined}
              id={item?.id}
              image_id={item?.image_id}
              link={getEntityLink(project_id as string, item.type, item.id, item.parent_id)}
              previewAction={
                items.length
                  ? () => {
                      setDrawer((prev) => ({
                        ...prev,
                        title: "Preview",
                        data:
                          item.type === "images"
                            ? { id: item.id, entity_type: "images", image_type: "images" }
                            : { id: item.id, parent_id: item.parent_id, entity_type: item.type as AvailableEntityType },
                        type: "entity_preview",
                        size: "half",
                      }));
                    }
                  : undefined
              }
              title={item.title}
              type={item.type}
              variant="primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
