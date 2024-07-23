import { useAtomValue, useSetAtom } from "jotai";
import { createContext, Dispatch, SetStateAction, useContext, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumbs, Button, EntityPreviewDrawer, Icon } from "../../components";
import { useBreakpoint, useGetEntity, useHasPermissions } from "../../hooks";
import { AvailableManuscriptEntityTypes, ManuscriptEntityType, ManuscriptType } from "../../types/EntityTypes/manuscriptTypes";
import {
  breadcrumbsAtom,
  buildManuscript,
  drawerAtom,
  getDefaultEntityIcon,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  userAtom,
} from "../../utils";

const TypeContext = createContext<{
  type: AvailableManuscriptEntityTypes | null;
  setType: Dispatch<SetStateAction<AvailableManuscriptEntityTypes | null>>;
}>({ type: null, setType: () => {} });

function ManuscriptEntityPreview({ type }: { type: AvailableManuscriptEntityTypes }) {
  const { subitem_id } = useParams();

  return <EntityPreviewDrawer data={{ id: subitem_id as string, parent_id: undefined, entity_type: type, isViewOnly: true }} />;
}
function ManuscriptEntityLink({ entity }: { entity: ManuscriptEntityType }) {
  const { project_id, item_id, subitem_id } = useParams();
  const navigate = useNavigate();
  const { setType } = useContext(TypeContext);
  return (
    <li className={"text-lg font-semibold transition-colors"}>
      <span
        className={`flex w-full cursor-pointer items-center gap-x-2 hover:text-blue-300 active:text-blue-500 ${entity.related_id === subitem_id ? "text-blue-400" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/projects/${project_id}/manuscripts/${item_id}/${entity.related_id}`);
          setType(entity.type);
        }}>
        <Icon icon={getDefaultEntityIcon(entity?.type)} />
        {entity?.title}
      </span>
    </li>
  );
}

export function ManuscriptProfileView() {
  const { isMd } = useBreakpoint();
  const { project_id, item_id } = useParams();
  const [type, setType] = useState<AvailableManuscriptEntityTypes | null>(null);
  const { data: existingManuscript } = useGetEntity<ManuscriptType>(item_id, "manuscripts", {
    fields: ["id", "owner_id", "title"],
    relations: { entities: true },
  });
  const setDrawer = useSetAtom(drawerAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["read_manuscripts", "create_manuscripts", "update_manuscripts", "delete_manuscripts"],
    undefined
  );
  const user = useAtomValue(userAtom);

  useLayoutEffect(() => {
    if (existingManuscript?.data) {
      setBreadcrumbs({
        items: [{ id: existingManuscript.data.id, title: existingManuscript.data.title, is_folder: false, parent_id: null }],
        type: "manuscripts",
      });
    }
  }, [existingManuscript?.data]);

  const manuscriptTree = buildManuscript(existingManuscript?.data);

  return (
    <>
      {item_id && !IS_PUBLIC ? (
        <div className="flex h-12 min-h-[3rem] items-center justify-between">
          <Breadcrumbs />
          <div className="flex flex-nowrap gap-x-2">
            <div className="max-w-[208px] lg:w-52">
              <Button
                icon={IconEnum.edit}
                isDisabled={
                  !hasActionPermission(
                    isProjectOwner,
                    user?.id === existingManuscript?.data?.owner_id,
                    permissions,
                    existingManuscript?.data?.permissions || [],
                    "update_manuscripts",
                    user?.role?.id
                  )
                }
                label="Edit current manuscript"
                onClick={() => {
                  setDrawer((prev) => ({
                    ...prev,
                    size: "lg",
                    title: "Edit manuscript",
                    type: "manuscripts",
                    data: { id: item_id as string, project_id: project_id as string },
                  }));
                }}
                tooltip={isMd ? undefined : "Edit current manuscript"}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div className="grid h-[calc(100vh-6rem)] grid-cols-12 gap-x-2 overflow-hidden rounded-b">
        <div className="col-span-3 flex h-full flex-col rounded bg-zinc-800 p-2">
          <h2 className="text-center text-2xl font-bold">{existingManuscript?.data?.title}</h2>
          <TypeContext.Provider value={{ type, setType }}>
            <ul>
              {manuscriptTree?.length
                ? manuscriptTree?.map((entity) => {
                    return <ManuscriptEntityLink entity={entity} key={entity.id} />;
                  })
                : null}
            </ul>
          </TypeContext.Provider>
        </div>
        <div className="col-span-9 flex h-full max-h-full flex-col rounded bg-zinc-950 p-2">
          {type ? <ManuscriptEntityPreview type={type} /> : null}
        </div>
      </div>
    </>
  );
}
