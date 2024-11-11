import { useAtomValue, useSetAtom } from "jotai";
import { createContext, Dispatch, SetStateAction, useContext, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumbs, Button, EntityPreviewDrawer, Icon, Tabs } from "../../components";
import { useBreakpoint, useGetEntity, useHasPermissions, useNavbarTitle } from "../../hooks";
import { TabType } from "../../types";
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

function ManuscriptEntityPreview({ entity, base_id }: { base_id?: string; entity: ManuscriptEntityType | undefined }) {
  if (!entity) return null;

  return entity?.type === "images" ? (
    <div className="mx-auto w-96 max-w-96">
      <EntityPreviewDrawer
        data={{
          id: (entity?.related_id || base_id) as string,
          parent_id: undefined,
          image_type: "images",
          entity_type: entity?.type,
          isViewOnly: true,
        }}
      />
    </div>
  ) : (
    <EntityPreviewDrawer
      data={{
        id: (entity?.related_id || base_id) as string,
        parent_id: undefined,
        image_type: "images",
        entity_type: entity?.type,
        isViewOnly: false,
      }}
    />
  );
}
function ManuscriptEntityLink({ entity, isBase }: { isBase: boolean; entity: ManuscriptEntityType }) {
  const { project_id, item_id, subitem_id } = useParams();
  const navigate = useNavigate();
  const { setType } = useContext(TypeContext);
  return (
    <li className={"text-lg font-semibold transition-colors"}>
      <span
        className={`flex w-full cursor-pointer items-center gap-x-2 hover:text-blue-300 active:text-blue-500 ${(!!subitem_id && entity.related_id === subitem_id) || (!subitem_id && isBase) ? "text-blue-400" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          navigate(`${IS_PUBLIC ? "" : "/projects"}/${project_id}/manuscripts/${item_id}/${entity.related_id}`);
          setType(entity.type);
        }}>
        <Icon icon={entity?.icon || getDefaultEntityIcon(entity?.type)} />
        <div className="line-clamp-1">{entity?.title}</div>
      </span>
    </li>
  );
}

function getTabs(entities: ManuscriptEntityType[]): TabType[] {
  return entities.map((entity) => ({
    id: `${entity.id}___${entity.related_id}`,
    icon: getDefaultEntityIcon(entity.type),
    label: entity.title,
  }));
}

export function ManuscriptProfileView({ data }: { data?: ManuscriptType }) {
  const { isMd } = useBreakpoint();
  const { project_id, item_id, subitem_id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [type, setType] = useState<AvailableManuscriptEntityTypes | null>(null);
  const { data: existingManuscript } = useGetEntity<ManuscriptType>(
    item_id,
    "manuscripts",
    {
      fields: ["id", "owner_id", "title"],
      relations: { entities: true },
    },
    {
      enabled: !data,
    }
  );
  const setDrawer = useSetAtom(drawerAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["read_manuscripts", "create_manuscripts", "update_manuscripts", "delete_manuscripts"],
    undefined
  );
  const user = useAtomValue(userAtom);

  const manuscriptTree = buildManuscript(existingManuscript?.data || data);
  const canUpdate = hasActionPermission(
    isProjectOwner,
    user?.id === existingManuscript?.data?.owner_id,
    permissions,
    existingManuscript?.data?.permissions || [],
    "update_manuscripts",
    user?.role?.id
  );
  useNavbarTitle(`Manuscripts | ${existingManuscript?.data?.title}`, !!existingManuscript?.data);

  useLayoutEffect(() => {
    if (existingManuscript?.data) {
      setBreadcrumbs({
        items: [
          {
            id: existingManuscript?.data?.id || "",
            title: existingManuscript?.data?.title,
            is_folder: false,
            parent_id: null,
          },
        ],
        type: "manuscripts",
      });
    } else if (data) {
      setBreadcrumbs({
        items: [
          {
            id: data?.id,
            title: data?.title,
            is_folder: false,
            parent_id: null,
          },
        ],
        type: "manuscripts",
      });
    }
  }, [existingManuscript?.data, data]);

  useLayoutEffect(() => {
    if (manuscriptTree.length && subitem_id) {
      const idx = manuscriptTree.findIndex((item) => item.related_id === subitem_id);
      if (idx > -1) {
        setSelectedTab(idx);
      }
    } else if (manuscriptTree.length && manuscriptTree?.[0]) {
      setSelectedTab(0);
    }
  }, [subitem_id, manuscriptTree]);

  return (
    <div className={"flex h-full flex-col gap-y-2 lg:gap-y-0"}>
      {item_id && !IS_PUBLIC ? (
        <div className="flex h-12 min-h-[3rem] items-center justify-between">
          <Breadcrumbs />
          <div className="flex flex-nowrap gap-x-2">
            <div className="max-w-[208px] lg:w-52">
              <Button
                icon={IconEnum.edit}
                isDisabled={!canUpdate}
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
      <div className="lg:hidden">
        <Tabs
          hasArrowNav
          onChange={(tab) => {
            const related_id = tab.id.split("___");
            if (related_id?.[1])
              navigate(`${IS_PUBLIC ? "" : "/projects"}/${project_id}/manuscripts/${item_id}/${related_id[1]}`);
          }}
          selectedTab={selectedTab}
          tabs={getTabs(manuscriptTree)}
        />
      </div>
      <div className="grid h-full grid-cols-12 gap-x-2 gap-y-2 overflow-hidden rounded-b lg:content-stretch lg:gap-y-0">
        <div className="col-span-3 hidden h-full flex-col rounded bg-zinc-800 p-2 lg:flex">
          {IS_PUBLIC ? null : (
            <h2 className="text-center text-2xl font-bold">{existingManuscript?.data?.title || data?.title}</h2>
          )}
          <TypeContext.Provider value={{ type, setType }}>
            <ul>
              {manuscriptTree?.length
                ? manuscriptTree?.map((entity, idx) => {
                    return <ManuscriptEntityLink key={entity.id} entity={entity} isBase={!idx} />;
                  })
                : null}
            </ul>
          </TypeContext.Provider>
        </div>
        <div className="col-span-12 flex h-full flex-col rounded bg-zinc-950 p-2 lg:col-span-9">
          {subitem_id || manuscriptTree?.[0]?.related_id ? (
            <ManuscriptEntityPreview base_id={manuscriptTree?.at(0)?.related_id} entity={manuscriptTree?.at(selectedTab)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
