import { Core } from "cytoscape";
import { useAtomValue } from "jotai";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { NodeType } from "../../../types";
import { getImageURL, IconEnum, nodesAtom } from "../../../utils";
import { EntityPreview, Image } from "../../DataDisplay";
import { Input } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Avatar } from "../../Misc";

type Props = {
  data: {
    cy: Core;
  };
};

export function NodeSearchDrawer({ data }: Props) {
  const { project_id } = useParams();
  const nodes = useAtomValue(nodesAtom);
  const [value, setValue] = useState("");

  const [foundNodes, setFoundNodes] = useState<NodeType[]>([]);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      if (value.length >= 3) {
        const temp = nodes
          .filter((node) => !!node.label && node.label.toLowerCase().includes(value.toLowerCase()))
          .sort((a, b) => {
            if (a.label && b.label) {
              if (a.label > b.label) return 1;
              if (a.label < b.label) return -1;
              return 0;
            }
            return 0;
          })
          .slice(0, 100);
        setFoundNodes(temp);
      }
    }, 300);
    if (!value) {
      setFoundNodes([]);
    }
    console.log(data?.cy);
    return () => {
      clearTimeout(timeout);
    };
  }, [value]);

  return (
    <DrawerLayout>
      <Input
        label="Search for node by label"
        name="value"
        onChange={({ value }) => setValue(value as string)}
        type="search"
        value={value}
      />
      <ul className="flex flex-col gap-y-2">
        {foundNodes.map((node) => (
          <li key={node.id}>
            <EntityPreview
              id={node?.id}
              image_id={node?.image?.id || node?.character?.portrait_id}
              otherAction={() => {
                data?.cy?.animate({
                  fit: {
                    padding: 0,
                    eles: data?.cy?.getElementById(node.id),
                  },
                  duration: 1250,
                });
              }}
              otherActionIcon={IconEnum.search}
              title={node?.label || ""}
              type="nodes"
            />
          </li>
        ))}
      </ul>
    </DrawerLayout>
  );
}
