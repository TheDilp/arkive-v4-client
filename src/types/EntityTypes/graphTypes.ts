import cytoscape, { EdgeCollection, NodeCollection } from "cytoscape";

import { BaseEntityType, CharacterType, EventType, ImageType, MapPinType, MapType, TagType } from ".";
import { DocumentType } from "./documentTypes";

type ArrowShape =
  | "none"
  | "triangle"
  | "triangle-tee"
  | "triangle-cross"
  | "triangle-backcurve"
  | "circle-triangle"
  | "vee"
  | "tee"
  | "circle"
  | "diamond"
  | "chevron";

type ArrowFill = "filled" | "hollow";
export type CurveStyleType = "straight" | "taxi" | "unbundled-bezier";
type NodeShape =
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "barrel"
  | "rhomboid"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "heptagon"
  | "octagon"
  | "star"
  | "cut-rectangle"
  | "round-triangle"
  | "round-rectangle"
  | "bottom-round-rectangle"
  | "round-diamond"
  | "round-pentagon"
  | "round-hexagon"
  | "round-heptagon"
  | "round-octagon";

export type NodeType = {
  id: string;
  label: string | null;
  type: string | null;
  width: number | null;
  height: number | null;
  x: number | null;
  y: number | null;
  font_size: number | null;
  font_color: string | null;
  font_family: string | null;
  text_v_align: string | null;
  text_h_align: string | null;
  background_color: string | null;
  background_opacity: number | null;
  is_locked: boolean | null;
  is_template: boolean | null;
  z_index: number | null;
  parent_id: string;
  doc_id?: string | null;
  character_id?: string | null;
  event_id?: string | null;
  image_id?: string | null;
  map_id?: string | null;
  map_pin_id?: string | null;

  document?: DocumentType;
  character?: CharacterType;
  event?: EventType;
  map?: MapType;
  map_pin?: MapPinType;
  image?: ImageType;

  tags: TagType[];
};
export type EdgeType = {
  id: string;
  label: string | null;
  curve_style: string | null;
  line_style: string | null;
  line_color: string | null;
  line_fill: string | null;
  line_opacity: number | null;
  width: number | null;
  control_point_distances: number | null;
  control_point_weights: number | null;
  taxi_direction: string | null;
  taxi_turn: number | null;
  arrow_scale: number | null;
  target_arrow_shape: string | null;
  target_arrow_fill: string | null;
  target_arrow_color: string | null;
  source_arrow_shape: string | null;
  source_arrow_fill: string | null;
  source_arrow_color: string | null;
  mid_target_arrow_shape: string | null;
  mid_target_arrow_fill: string | null;
  mid_target_arrow_color: string | null;
  mid_source_arrow_shape: string | null;
  mid_source_arrow_fill: string | null;
  mid_source_arrow_color: string | null;
  font_size: number | null;
  font_color: string | null;
  font_family: string | null;
  z_index: number | null;
  source_id: string;
  target_id: string;
  parent_id: string;
  tags: TagType[];
};
export interface GraphType extends BaseEntityType {
  default_node_shape: string;
  default_node_color: string;
  default_edge_color: string;
  nodes: NodeType[];
  edges: EdgeType[];
  tags: TagType[];
}

export type CytoscapeNodeType = cytoscape.NodeDefinition;
export type CytoscapeEdgeType = cytoscape.EdgeDefinition;

export type BoardContextType = null | "board" | "nodes" | "edges";

export type BoardContext = {
  x: null | number;
  y: null | number;
  type: BoardContextType;
  nodes: NodeCollection | null;
  edges: EdgeCollection | null;
};

export type BoardExportType = {
  view: "Graph" | "View";
  background: "Color" | "Transparent";
  type: "PNG" | "JPEG" | "JSON";
};
