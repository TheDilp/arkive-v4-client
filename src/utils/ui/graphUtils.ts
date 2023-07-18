import { UseMutationResult } from "@tanstack/react-query";
import cytoscape, { Core } from "cytoscape";
import { saveAs } from "file-saver";

import { AvailableSubEntityType } from "../../types";
import { CurveStyleType, EdgeType, NodeType } from "../../types/EntityTypes/graphTypes";
import { getImageURL } from "..";

export function changeLockState(
  boardContext: cytoscape.Core,
  locked: boolean,
  updateManyNodesLockState: UseMutationResult<
    Response | null,
    unknown,
    {
      ids: string[];
      data: Partial<AvailableSubEntityType>;
    },
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
  const ids = selected.map((node: any) => node.data().id);
  // updateManyNodesLockState.mutate({ ids, data: { is_loced:locked } });
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
export const Boardfont_sizes = [
  10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70,
  72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126,
  128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 170, 172, 174, 176,
  178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200,
];
export const BoardFontFamilies = [
  {
    label: "Arial",
    value: "Arial",
  },
  {
    label: "Brush Script MT",
    value: "Brush Script MT",
  },
  {
    label: "Courier New",
    value: "Courier New",
  },
  {
    label: "Garamond",
    value: "Garamond",
  },
  {
    label: "Georgia",
    value: "Georgia",
  },
  {
    label: "Helvetica",
    value: "Helvetica",
  },
  {
    label: "Lato",
    value: "Lato",
  },
  {
    label: "Merriweather",
    value: "Merriweather",
  },
  {
    label: "Tahoma",
    value: "Tahoma",
  },
  {
    label: "Times New Roman",
    value: "Times New Roman",
  },
  {
    label: "Trebuchet MS",
    value: "Trebuchet MS",
  },
  {
    label: "Verdana",
    value: "Verdana",
  },
];
export const textHAlignOptions = [
  {
    label: "Left",
    value: "left",
  },
  {
    label: "Center",
    value: "center",
  },
  {
    label: "Right",
    value: "right",
  },
];
export const textVAlignOptions = [
  {
    label: "Top",
    value: "top",
  },
  {
    label: "Center",
    value: "center",
  },
  {
    label: "Bottom",
    value: "bottom",
  },
];
export const boardNodeShapes = [
  {
    label: "Rectangle",
    value: "rectangle",
  },
  {
    label: "Ellipse",
    value: "ellipse",
  },
  {
    label: "Triangle",
    value: "triangle",
  },
  {
    label: "Barrel",
    value: "barrel",
  },
  {
    label: "Rhomboid",
    value: "rhomboid",
  },

  {
    label: "Diamond",
    value: "diamond",
  },
  {
    label: "Pentagon",
    value: "pentagon",
  },
  {
    label: "Hexagon",
    value: "hexagon",
  },
  {
    label: "Heptagon",
    value: "heptagon",
  },
  {
    label: "Octagon",
    value: "octagon",
  },
  {
    label: "Star",
    value: "star",
  },
  {
    label: "Cut Rectangle",
    value: "cut-rectangle",
  },
  {
    label: "Round Triangle",
    value: "round-triangle",
  },
  {
    label: "Round Rectangle",
    value: "round-rectangle",
  },
  {
    label: "Bottom Round Rectangle",
    value: "bottom-round-rectangle",
  },

  {
    label: "Round Diamond",
    value: "round-diamond",
  },
  {
    label: "Round Pentagon",
    value: "round-pentagon",
  },
  {
    label: "Round Hexagon",
    value: "round-hexagon",
  },
  {
    label: "Round Heptagon",
    value: "round-heptagon",
  },
  {
    label: "Round Octagon",
    value: "round-octagon",
  },
];
export const boardEdgeCurveStyles = [
  {
    label: "Straight",
    value: "straight",
  },
  {
    label: "Bezier",
    value: "unbundled-bezier",
  },
  {
    label: "Taxi",
    value: "taxi",
  },
];
export const boardEdgeLineStyles = [
  {
    label: "Solid",
    value: "solid",
  },
  {
    label: "Dashed",
    value: "dashed",
  },
  {
    label: "Dotted",
    value: "dotted",
  },
];
export const boardEdgeTaxiDirections = [
  {
    label: "Auto",
    value: "auto",
  },
  {
    label: "Vertical",
    value: "vertical",
  },
  {
    label: "Horizontal",
    value: "horizontal",
  },
  {
    label: "Upward",
    value: "upward",
  },
  {
    label: "Downward",
    value: "downward",
  },
  {
    label: "Leftward",
    value: "leftward",
  },
  {
    label: "Rightward",
    value: "rightward",
  },
];
export const boardEdgeArrowShapes = [
  {
    label: "None",
    value: "none",
  },
  {
    label: "Triangle",
    value: "triangle",
  },
  {
    label: "Triangle-tee",
    value: "triangle-tee",
  },
  {
    label: "Triangle-cross",
    value: "triangle-cross",
  },
  {
    label: "Triangle-backcurve",
    value: "triangle-backcurve",
  },
  {
    label: "Circle-triangle",
    value: "circle-triangle",
  },
  {
    label: "Vee",
    value: "vee",
  },
  {
    label: "Tee",
    value: "tee",
  },
  {
    label: "Circle",
    value: "circle",
  },
  {
    label: "Diamond",
    value: "diamond",
  },
  {
    label: "Chevron",
    value: "chevron",
  },
];
export const boardEdgeCaps = [
  { label: "Round", value: "round" },
  { label: "Butt", value: "butt" },
  { label: "Square", value: "square" },
];
export function updateColor(
  boardRef: cytoscape.Core,
  color: string | { nodeColor: string; edgeColor: string },
  updateManyNodes: UseMutationResult<
    Response | null,
    unknown,
    {
      ids: string[];
      data: Partial<AvailableSubEntityType>;
    },
    {
      old: unknown;
    }
  >,
  updateManyEdges: UseMutationResult<
    Response | null,
    unknown,
    {
      ids: string[];
      data: Partial<AvailableSubEntityType>;
    },
    {
      old: unknown;
    }
  >,
) {
  if (boardRef.elements(":selected")?.length > 0) {
    const nodes = boardRef.elements(":selected").nodes();
    const edges = boardRef.elements(":selected").edges();
    if (nodes.length) {
      // updateManyNodes.mutate({
      //   ids: nodes.map((node) => node.id()),
      //   data: { background_color: typeof color === "object" ? color.nodeColor : color },
      // });
    }
    // if (edges.length)
    // updateManyEdges.mutate(
    //   {
    //     ids: edges.map((edge) => edge.id()),
    //     data: {
    //       line_color: typeof color === "object" ? color.edgeColor : color,
    //       target_arrow_color: typeof color === "object" ? color.edgeColor : color,
    //       source_arrow_color: typeof color === "object" ? color.edgeColor : color,
    //       midtarget_arrow_color: typeof color === "object" ? color.edgeColor : color,
    //       midsource_arrow_color: typeof color === "object" ? color.edgeColor : color,
    //     },
    //   },
    //   {
    //     onSuccess: () => toaster("success", "Edge colors successfully updated."),
    //   },
    // );
    // }
  }
}
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
export function getNodeImage(node: NodeType, project_id: string) {
  let image = "";
  if (node.document?.image) {
    image = node.document.image.id;
  }
  if (node.image) {
    image = node.image.id;
  }
  if (image !== "") return getImageURL(project_id as string, "images", image);
  return [];
}
export function mapNodes(nodes: NodeType[], project_id: string, isReadOnly?: boolean) {
  return nodes
    .filter((node) => !node.is_template)
    .map((node: NodeType) => ({
      data: {
        id: node.id,
        label: node?.label || "",

        type: node?.type || "rectangle",
        width: node?.width || 50,
        height: node?.height || 50,
        x: node?.x || 0,
        y: node?.y || 0,

        font_size: node?.font_size || 16,
        font_color: node?.font_color ?? "#ffffff",
        font_family: node?.font_family || "Lato",
        text_v_align: node?.text_v_align || "top",
        text_h_align: node?.text_h_align || "center",

        is_locked: node?.is_locked || false,
        is_template: node?.is_template || false,
        z_index: node?.z_index || 1,

        background_color: node?.background_color || "#595959",
        background_opacity: node?.background_opacity || 1,

        classes: `${isReadOnly ? "publicBoardNode" : "boardNode"}`,
        z_index_compare: node.z_index === 0 ? "manual" : "auto",

        // Used for displaying in drawer
        image: node?.image,
        document: node?.document,

        tags: node.tags,

        backgroundImage: getNodeImage(node, project_id) || [],
        doc_id: node?.doc_id,
      },
      is_locked: isReadOnly || node.is_locked,
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

      target_arrow_shape: edge?.target_arrow_shape || "none",
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
export const curve_styles: CurveStyleType[] = ["straight", "taxi", "unbundled-bezier"];
export function getcurve_styleIcon(curve_style: CurveStyleType): string {
  if (curve_style === "straight") return "cil:graph";
  if (curve_style === "taxi") return "icon-park-outline:chart-graph";
  if (curve_style === "unbundled-bezier") return "ph:bezier-curve";
  return "cil:graph";
}
