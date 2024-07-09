import React, { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { Input, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

function ManuscriptTree({ documents, parentIndex }: { documents: ManuscriptType["documents"]; parentIndex: number }) {
  return (
    <div className={parentIndex <= 1 ? "p-2" : ""}>
      {documents.map((doc, index) =>
        doc.children.length === 0 ? (
          <div className="w-full" key={doc.id}>
            <Title isDrawerTitle label={doc.title} size="xl" />
          </div>
        ) : (
          <Collapsible initialOpen key={doc.id} label={doc.title} size="xl">
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
  const { handleChange } = useHandleChange({ data: manuscript, setData: setManuscript });

  const documents = [
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
  ];

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
      <ManuscriptTree documents={documents} parentIndex={0} />
    </DrawerLayout>
  );
}
