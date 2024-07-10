import cloneDeep from "lodash.clonedeep";
import React, { createContext, Dispatch, SetStateAction, useContext, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions } from "../../../hooks";
import { TabType, TagType, UserHasPermissionsType } from "../../../types";
import { ManuscriptDocumentType, ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { buildManuscript, createOrEditPermission, IconEnum } from "../../../utils";
import { InsertManuscriptSchema, InsertManuscriptType } from "../../../validation/manuscripts";
import { Button, Input, Search, TagInput, Title } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

function addById(state: ManuscriptDocumentType[], id: string, newElement: ManuscriptDocumentType) {
  // Base case: return state if it's not an array
  if (!Array.isArray(state)) return state;
  const temp = cloneDeep(state);

  // Iterate over the state array
  for (let i = 0; i < temp.length; i++) {
    // If the current element's id matches the provided id, add the new element to its children
    if (temp[i].id === id) {
      temp[i].children.push(newElement);
      return temp;
    }
    // If the current element has children, recursively check them
    if (temp[i].children && temp[i].children.length > 0) {
      temp[i].children = addById(temp[i].children, id, newElement);
      // Return early if the element was added in the children
      if (temp[i].children.some((child) => child.id === newElement.id)) {
        return temp;
      }
    }
  }

  return temp;
}
function updateById(state: ManuscriptDocumentType[], id: string, updatedElement: ManuscriptDocumentType) {
  // Base case: return state if it's not an array
  if (!Array.isArray(state)) return state;
  const temp = cloneDeep(state);

  // Iterate over the state array
  for (let i = 0; i < temp.length; i++) {
    // If the current element's id matches the provided id, update the element
    if (temp[i].id === id) {
      temp[i] = { ...temp[i], ...updatedElement };
      return temp;
    }
    // If the current element has children, recursively check them
    if (temp[i].children && temp[i].children.length > 0) {
      console.log(id, temp[i].id);
      temp[i].children = updateById(temp[i].children, id, updatedElement);
      // Return early if the element was updated in the children
      if (temp[i].children.some((child) => child.id === updatedElement.id)) {
        return temp;
      }
    }
  }

  return temp;
}
function removeById(state: ManuscriptDocumentType[], id: string) {
  if (!Array.isArray(state)) return state;
  const temp = cloneDeep(state);
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].id === id) {
      temp.splice(i, 1);
      return temp;
    }
    if (temp[i].children && temp[i].children.length > 0) {
      temp[i].children = removeById(temp[i].children, id);
      // Return early if the element was found and removed in the children
      if (temp[i].children === null) {
        temp.splice(i, 1);
        return temp;
      }
    }
  }

  return temp;
}

const ManuscriptContext = createContext<{
  documents: ManuscriptDocumentType[];
  setDocuments: Dispatch<SetStateAction<ManuscriptDocumentType[]>>;
}>({ documents: [], setDocuments: () => {} });

function ManuscriptItem({ doc, parentIndex }: { doc: ManuscriptDocumentType; parentIndex: number }) {
  const { documents, setDocuments } = useContext(ManuscriptContext);

  if (!doc.title)
    return (
      <div className="flex items-center gap-x-2">
        <Search
          label="Add document"
          name="documents"
          onChange={({ value: id, label: title }) => {
            if (title)
              setDocuments(updateById(documents, doc.id, { id, title: title || "", sort: doc.sort, children: doc.children }));
          }}
          searchEntity="documents"
          variant="secondary"
        />
        <div className="w-min self-end pb-2">
          <Button
            hasNoBackground
            icon={IconEnum.trash}
            isIconOnly
            onClick={() => setDocuments((prev) => removeById(prev, doc.id))}
            tooltip="Remove"
            variant="error"
          />
        </div>
      </div>
    );
  if (doc.children.length === 0)
    return (
      <div className="w-full" key={doc.id}>
        <Title
          actions={[
            {
              variant: "info",
              icon: IconEnum.add,
              tooltip: "Add",
              onClick: () =>
                setDocuments((prev) =>
                  addById(prev, doc.id, { id: crypto.randomUUID(), title: "", sort: doc.children.length, children: [] })
                ),
            },
            {
              variant: "error",
              icon: IconEnum.trash,
              tooltip: "Remove",
              onClick: () => setDocuments((prev) => removeById(prev, doc.id)),
            },
          ]}
          isDrawerTitle
          label={doc.title}
          size="lg"
        />
      </div>
    );

  return (
    <div className="[&>*>div]:bg-transparent">
      <Collapsible
        actions={[
          {
            variant: "info",
            icon: IconEnum.add,
            tooltip: "Add",
            onClick: () =>
              setDocuments((prev) =>
                addById(prev, doc.id, { id: crypto.randomUUID(), title: "", sort: doc.children.length, children: [] })
              ),
          },
          {
            variant: "error",
            icon: IconEnum.trash,
            tooltip: "Remove",
            onClick: () => setDocuments((prev) => removeById(prev, doc.id)),
          },
        ]}
        initialOpen
        key={doc.id}
        label={doc.title}
        size="lg">
        <div className="flex flex-col" style={{ paddingLeft: parentIndex * 10 }}>
          {doc.children.length === 0 ? null : <ManuscriptTree documents={doc.children} parentIndex={parentIndex + 1} />}
        </div>
      </Collapsible>
    </div>
  );
}

function ManuscriptTree({ documents, parentIndex }: { documents: ManuscriptDocumentType[]; parentIndex: number }) {
  return (
    <div className={`${parentIndex <= 1 ? "flex flex-col gap-y-2 p-2" : ""}`}>
      {documents.map((doc) => (
        <ManuscriptItem doc={doc} key={doc.id} parentIndex={parentIndex} />
      ))}
    </div>
  );
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined) {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];

  if (permissions?.read_tags) {
    tabs.push({ id: "2", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function ManuscriptDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(data?.preselectedTab || 0);

  const [manuscript, setManuscript] = useState<{ title: string; tags: TagType[] }>({ title: "", tags: [] });
  const [documents, setDocuments] = useState<ManuscriptDocumentType[]>([]);
  const { data: existingManuscript, isInitialLoading } = useGetEntity<ManuscriptType>(
    data?.id,
    "manuscripts",
    {
      fields: ["id", "title", "owner_id"],
      relations: { documents: true, permissions: true, tags: true },
    },
    { enabled: !!data?.id }
  );
  const permissions = useHasPermissions(
    ["create_manuscripts", "update_manuscripts", "read_tags"],
    existingManuscript?.data?.owner_id
  );
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_manuscripts,
    permissions?.update_manuscripts,
    permissions?.is_owner,
    data?.id
  );

  const { handleChange } = useHandleChange({ data: manuscript, setData: setManuscript });

  const tabs = getTabs(permissions, data?.id);
  const { mutate: create, isLoading: isCreating } = useCreateEntity<InsertManuscriptType>("manuscripts");

  useLayoutEffect(() => {
    if (existingManuscript?.data) {
      setManuscript(existingManuscript?.data);

      setDocuments(buildManuscript(existingManuscript?.data?.documents || []));
    }
  }, [existingManuscript]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Input
            isDisabled={!canCreateOrEdit || isCreating}
            label="Title (required)"
            name="title"
            onChange={handleChange}
            placeholder="Title"
            value={manuscript.title}
            variant={!manuscript.title ? "error" : "primary"}
          />

          <Search
            isDisabled={!canCreateOrEdit}
            label="Add root documents"
            name="documents"
            onChange={({ value: id, label: title }) => {
              if (title) setDocuments((prev) => [...prev, { id, title: title, sort: documents.length, children: [] }]);
            }}
            searchEntity="documents"
          />
          <ManuscriptContext.Provider value={{ documents, setDocuments }}>
            <ManuscriptTree documents={documents} parentIndex={0} />
          </ManuscriptContext.Provider>
        </>
      ) : null}
      {selectedTab === 1 ? <TagInput handleChange={handleChange} isAutofocused tags={manuscript?.tags || []} /> : null}
      <div>
        <Button
          isDisabled={!documents.length}
          label={data?.id ? "Update" : "Create"}
          onClick={() => {
            if (data?.id) {
              //
            } else {
              const parsed = InsertManuscriptSchema.parse({
                data: { title: manuscript.title, project_id },
                relations: {
                  documents,
                  tags: manuscript.tags.map((t) => ({ id: t.id })),
                },
              });
              create(parsed);
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
