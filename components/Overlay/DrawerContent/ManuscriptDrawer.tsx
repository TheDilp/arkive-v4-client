import cloneDeep from "lodash.clonedeep";
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

import { useHandleChange } from "../../../hooks";
import { ManuscriptDocumentType, ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { IconEnum } from "../../../utils";
import { Button, Input, Search, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";

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
      <div className="my-2 flex flex-col" style={{ paddingLeft: parentIndex * 10 }}>
        {doc.children.length === 0 ? null : <ManuscriptTree documents={doc.children} parentIndex={parentIndex + 1} />}
      </div>
    </Collapsible>
  );
}

function ManuscriptTree({ documents, parentIndex }: { documents: ManuscriptType["documents"]; parentIndex: number }) {
  return (
    <div className={`${parentIndex <= 1 ? "p-2" : ""}`}>
      {documents.map((doc) => (
        <ManuscriptItem doc={doc} key={doc.id} parentIndex={parentIndex} />
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ManuscriptDrawer({ data }: Props) {
  const [manuscript, setManuscript] = useState({ title: "" });
  const [documents, setDocuments] = useState<ManuscriptDocumentType[]>([
    {
      id: "1",
      title: "Document title A",
      sort: 0,
      children: [
        {
          id: "2",
          title: "Document title B",
          sort: 0,
          children: [
            {
              id: "3",
              title: "C",
              sort: 0,
              children: [{ id: "5", title: "The trials and tribulations of Taryon Darrington", children: [], sort: 0 }],
            },
          ],
        },
        { id: "4", title: "D", sort: 1, children: [] },
      ],
    },
  ]);
  const { handleChange } = useHandleChange({ data: manuscript, setData: setManuscript });

  return (
    <DrawerLayout>
      <Input
        label="Title (required)"
        name="title"
        onChange={handleChange}
        placeholder="Title"
        value={manuscript.title}
        variant={!manuscript.title ? "error" : "primary"}
      />

      <Search
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
    </DrawerLayout>
  );
}
