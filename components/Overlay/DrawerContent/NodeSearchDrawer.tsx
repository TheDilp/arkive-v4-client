import { Core } from "cytoscape";
import { useAtomValue } from "jotai";
import { useLayoutEffect, useState } from "react";

import { NodeType } from "../../../types";
import { nodesAtom } from "../../../utils";
import { Input } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    cy: Core;
  };
};

export function NodeSearchDrawer({ data }: Props) {
  const nodes = useAtomValue(nodesAtom);
  const [value, setValue] = useState("");

  const [foundNodes, setFoundNodes] = useState<NodeType[]>([]);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      if (value.length >= 3) {
        const temp = nodes.filter((node) => !!node.label && node.label.toLowerCase().includes(value.toLowerCase()));
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

      {foundNodes.map((node) => node.label)}
    </DrawerLayout>
  );
}
