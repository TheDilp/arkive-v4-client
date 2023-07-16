import cytoscape, { EdgeDefinition, NodeDefinition } from "cytoscape";
import { atom } from "jotai";

export const BoardReferenceAtom = atom<null | cytoscape.Core>(null);
export const BoardStateAtom = atom<{
  addNodes: boolean;
  grid: boolean;
  drawMode: boolean;
  curveStyle: "straight" | "taxi" | "unbundled-bezier";
}>({
  addNodes: false,
  grid: false,
  drawMode: false,
  curveStyle: "straight",
});

export const NodesAtom = atom<NodeDefinition[]>([]);
export const EdgesAtom = atom<EdgeDefinition[]>([]);
