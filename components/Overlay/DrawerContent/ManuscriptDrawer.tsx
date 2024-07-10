import cloneDeep from "lodash.clonedeep";
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

import { useHandleChange } from "../../../hooks";
import { ManuscriptDocumentType, ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { IconEnum } from "../../../utils";
import { Input, Search, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

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

function ManuscriptTree({ documents, parentIndex }: { documents: ManuscriptType["documents"]; parentIndex: number }) {
  const { setDocuments } = useContext(ManuscriptContext);

  return (
    <div className={`${parentIndex <= 1 ? "p-2" : ""}`}>
      {documents.map((doc, index) =>
        doc.children.length === 0 ? (
          <div className="w-full" key={doc.id}>
            <Title
              actions={[
                {
                  variant: "error",
                  icon: IconEnum.close,
                  tooltip: "Remove",
                  onClick: () => setDocuments((prev) => removeById(prev, doc.id)),
                },
              ]}
              isDrawerTitle
              label={doc.title}
              size="lg"
            />
          </div>
        ) : (
          <Collapsible
            actions={[
              {
                variant: "error",
                icon: IconEnum.close,
                tooltip: "Remove",
                onClick: () => setDocuments((prev) => removeById(prev, doc.id)),
              },
            ]}
            initialOpen
            key={doc.id}
            label={doc.title}
            size="lg">
            <div className="my-2 flex flex-col" style={{ paddingLeft: parentIndex * 10 }}>
              {doc.children.length === 0 ? null : (
                <ManuscriptTree documents={doc.children} parentIndex={parentIndex + index + 1} />
              )}
            </div>
          </Collapsible>
        )
      )}
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
