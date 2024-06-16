import cytoscape from "cytoscape";
import { atom } from "jotai";

import { EdgeType, NodeType } from "../../types";

export const BoardReferenceAtom = atom<null | cytoscape.Core>(null);
export const BoardStateAtom = atom<{
  add_nodes: boolean;
  grid: boolean;
  draw_mode: boolean;
  curve_style: "straight" | "taxi" | "unbundled-bezier";
}>({
  add_nodes: false,
  grid: false,
  draw_mode: false,
  curve_style: "straight",
});

export const nodesAtom = atom<NodeType[]>([]);
export const edgesAtom = atom<EdgeType[]>([]);
