import { UseMutateFunction } from "@tanstack/react-query";
import cytoscape, { Core } from "cytoscape";
import { saveAs } from "file-saver";

import { CurveStyleType, EdgeType, NodeType } from "../../types/EntityTypes/graphTypes";
import { getCharacterFullName, getImageURL } from "..";

export function changeLockState(
  boardContext: cytoscape.Core,
  locked: boolean,
  updateManyNodesLockState: UseMutateFunction<
    any,
    unknown,
    {
      [key: string]: any;
    }[],
    {
      old: unknown;
    }
  >,
) {
  const selected = boardContext.nodes(":selected");
  if (locked) {
    selected.lock();
  } else {
    selected.unlock();
  }
  const data = selected.map((node: any) => ({ id: node.data().id, is_locked: locked }));
  updateManyNodesLockState(data);
}

export const edgehandlesSettings = {
  canConnect(sourceNode: any, targetNode: any) {
    return (
      !sourceNode.outgoers().includes(targetNode) && !sourceNode.same(targetNode) && !targetNode.outgoers().includes(sourceNode)
    );
    // whether an edge can be created between source and target
    // e.g. disallow loops
  },
  edgeParams(sourceNode: any, targetNode: any) {
    // for edges between the specified source and target
    // return element object to be passed to cy.add() for edge
    return {
      class: "eh-ghost-edge",
      data: {
        source: sourceNode.id(),
        target: targetNode.id(),
        curve_style: "straight",
        line_style: "solid",
        line_color: "#1e1e1e",
      },
    };
  },
  hoverDelay: 150, // time spent hovering over a target node before it is considered selected
  snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
  snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
  snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
  noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
  disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
};

export function exportBoardFunction(
  boardRef: cytoscape.Core,
  view: "Graph" | "View",
  background: "Color" | "Transparent",
  type: "PNG" | "JPEG" | "JSON",
  boardTitle?: string,
) {
  if (!boardRef) return;
  if (type === "PNG") {
    saveAs(
      new Blob(
        [
          boardRef.png({
            output: "blob",
            bg: background === "Color" ? "#121212" : "transparent",
            full: view === "Graph",
          }),
        ],
        {
          type: "image/png",
        },
      ),
      `${boardTitle || "ArkiveBoard"}.png`,
    );
  } else if (type === "JPEG") {
    saveAs(
      new Blob(
        [
          boardRef.jpg({
            output: "blob",
            bg: background === "Color" ? "#121212" : "transparent",
            full: view === "Graph",
          }),
        ],
        {
          type: "image/jpg",
        },
      ),
      `${boardTitle || "ArkiveBoard"}.jpg`,
    );
  } else if (type === "JSON") {
    saveAs(
      new Blob([JSON.stringify(boardRef.json())], {
        type: "application/json",
      }),
      `${boardTitle || "ArkiveBoard"}.json`,
    );
  }
}
export function toModelPosition(boardRef: Core, pos: { x: number; y: number }) {
  const pan = boardRef.pan();
  const zoom = boardRef.zoom();
  return {
    x: (pos.x - pan.x) / zoom,
    y: (pos.y - pan.y) / zoom,
  };
}
export function toScreenPosition(boardRef: Core, pos: { x: number; y: number }) {
  const pan = boardRef.pan();
  const zoom = boardRef.zoom();
  return {
    x: pos.x * zoom + pan.x,
    y: pos.y * zoom + pan.y,
  };
}

export function getNodeLabel(node: NodeType): string {
  if (node?.label) return node.label;
  if (node?.character?.first_name) return getCharacterFullName(node?.character?.first_name, "", node?.character?.last_name);
  return "";
}

export function getNodeImage(node: NodeType, project_id: string) {
  let image = "";
  if (node?.document?.image) {
    image = node.document.image.id;
  }
  if (node?.character?.portrait_id) {
    image = node.character.portrait_id;
  }
  if (node?.image_id) {
    image = node.image_id;
  }
  if (image === null) return [];
  if (image !== "") return getImageURL(project_id as string, "images", image);
  return [];
}
export function mapNodes(nodes: NodeType[], project_id: string, isReadOnly?: boolean) {
  return nodes
    .filter((node) => !node.is_template)
    .map((node: NodeType) => ({
      data: {
        id: node.id,
        label: getNodeLabel(node),

        type: node?.type || "rectangle",
        width: node?.width || 50,
        height: node?.height || 50,
        x: node?.x ?? 0,
        y: node?.y ?? 0,

        font_size: node?.font_size || 16,
        font_color: node?.font_color || "#ffffff",
        font_family: node?.font_family || "Lato",
        text_v_align: node?.text_v_align || "top",
        text_h_align: node?.text_h_align || "center",

        is_locked: node?.is_locked ?? false,
        is_template: node?.is_template || false,
        z_index: node?.z_index ?? 1,

        background_color: node?.background_color || "#595959",
        background_opacity: node?.background_opacity ?? 1,

        classes: `${isReadOnly ? "publicBoardNode" : "boardNode"}`,
        z_index_compare: node.z_index === 0 ? "manual" : "auto",

        // Used for displaying in drawer
        image: node?.image,
        document: node?.document,

        tags: node.tags,

        background_image: getNodeImage(node, project_id) || [],
        doc_id: node?.doc_id,
      },
      locked: isReadOnly ?? node.is_locked,
      position: { x: node.x, y: node.y },
    }));
}
export function mapEdges(edges: EdgeType[], isReadOnly?: boolean) {
  return edges.map((edge: EdgeType) => ({
    data: {
      id: edge.id,

      source: edge.source_id,
      target: edge.target_id,
      classes: `boardEdge ${isReadOnly && "publicBoardEdge"}`,
      z_indexCompare: "manual",
      z_index: edge?.z_index || 1,
      label: edge?.label || "",

      curve_style: edge?.curve_style || "straight",
      line_style: edge?.line_style || "solid",
      line_color: edge?.line_color || "#595959",
      line_fill: edge?.line_fill || "solid",
      line_opacity: edge?.line_opacity || 1,
      width: edge?.width || 1,

      control_point_distances: edge?.control_point_distances || -100,
      control_point_weights: edge?.control_point_weights || 0.5,

      taxi_direction: edge?.taxi_direction || "auto",
      taxi_turn: edge?.taxi_turn || 50,

      arrow_scale: edge?.arrow_scale || 1,

      source_arrow_shape: edge?.source_arrow_shape || "none",
      source_arrow_color: edge?.source_arrow_color || "#595959",
      source_arrow_fill: edge?.source_arrow_fill || "filled",

      target_arrow_shape: edge?.target_arrow_shape || "triangle",
      target_arrow_color: edge?.target_arrow_color || "#595959",
      target_arrow_fill: edge?.target_arrow_fill || "filled",

      mid_source_arrow_shape: edge?.mid_source_arrow_shape || "none",
      mid_source_arrow_color: edge?.mid_source_arrow_color || "#595959",
      mid_source_arrow_fill: edge?.mid_source_arrow_fill || "filled",

      mid_target_arrow_shape: edge?.mid_target_arrow_shape || "none",
      mid_target_arrow_color: edge?.mid_target_arrow_color || "#595959",
      mid_target_arrow_fill: edge?.mid_target_arrow_fill || "filled",

      font_size: edge?.font_size || 16,
      font_color: edge?.font_color || "#ffffff",
      font_family: edge?.font_family || "Lato",

      tags: edge.tags,
    },
  }));
}
export const edgeArrowTypes = ["source", "target", "midsource", "mid_target"];
export const curveStyles: CurveStyleType[] = ["straight", "taxi", "unbundled-bezier"];
export function getCurveStyleIcon(curve_style: CurveStyleType): string {
  if (curve_style === "straight") return "cil:graph";
  if (curve_style === "taxi") return "icon-park-outline:chart-graph";
  if (curve_style === "unbundled-bezier") return "ph:bezier-curve";
  return "cil:graph";
}
