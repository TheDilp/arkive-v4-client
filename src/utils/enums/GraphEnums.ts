import { CurveStyleType } from "../../types/EntityTypes/graphTypes";

export const getCytoscapeStylesheet = (curveStyle: CurveStyleType) => {
  return [
    // Nodes in general
    {
      selector: "node[classes]",
      style: {
        shape: "data(type)",
        width: "data(width)",
        height: "data(height)",
        "font-size": "data(fontSize)",
        "font-family": "data(fontFamily)",
        label: "data(label)",
        color: "data(fontColor)",
        "text-outline-color": "black",
        "text-outline-width": "2px",
        "background-image": "data(backgroundImage)",
        "background-fit": "cover",
        "background-clip": "node",
        "background-color": "data(backgroundColor)",
        "background-opacity": "data(backgroundOpacity)",
        "background-image-crossorigin": "anonymous",
        "text-halign": "data(textHAlign)",
        "text-valign": "data(textVAlign)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "z-index": "data(zIndex)",
        "z-index-compare": "data(zIndexCompare)",
      },
    },
    {
      selector: "node[class = '.eh-presumptive-target']",
      style: {
        shape: "rectangle",
        width: "50rem",
        height: "50rem",
        "font-size": "20rem",
        color: "white",
        "text-outline-color": "black",
        "text-outline-width": "2px",
        "overlay-color": "lightblue",
        "overlay-opacity": "0",
      },
    },
    {
      selector: ".eh-ghost-node",
      style: {
        shape: "square",
        width: "50",
        height: "50",
        "font-size": "16",
        label: "New Edge",
        color: "red",
        "text-outline-color": "black",
        "text-outline-width": "2px",
        "text-halign": "center",
        "text-valign": "top",
        opacity: 0,
      },
    },
    // Edges in general
    {
      selector: "edge[classes]",
      style: {
        label: "data(label)",
        color: "data(fontColor)",
        "font-family": "data(fontFamily)",
        "font-size": "data(fontSize)",
        "text-outline-color": "black",
        "text-outline-width": "2px",
        "source-endpoint": "outside-to-node-or-label",
        "target-endpoint": "outside-to-node-or-label",
        width: "data(width)",
        "line-opacity": "data(lineOpacity)",
        "line-fill": "data(lineFill)",
        "source-arrow-shape": "data(sourceArrowShape)",
        "source-arrow-fill": "data(sourceArrowFill)",
        "source-arrow-color": "data(sourceArrowColor)",

        "target-arrow-shape": "data(targetArrowShape)",
        "target-arrow-fill": "data(targetArrowFill)",
        "target-arrow-color": "data(targetArrowColor)",

        "mid-source-arrow-shape": "data(midSourceArrowShape)",
        "mid-source-arrow-fill": "data(midSourceArrowFill)",
        "mid-source-arrow-color": "data(midSourceArrowColor)",

        "mid-target-arrow-shape": "data(midTargetArrowShape)",
        "mid-target-arrow-fill": "data(midTargetArrowFill)",
        "mid-target-arrow-color": "data(midTargetArrowColor)",

        "arrow-scale": "data(arrowScale)",
        "line-color": "data(lineColor)",
        "line-style": "data(lineStyle)",
        "line-dash-pattern": [5, 10],
        "taxi-turn": "data(taxiTurn)",
        "taxi-direction": "data(taxiDirection)",
        "curve-style": "data(curveStyle)",
        "text-rotation": "autorotate",
        "control-point-distances": "data(controlPointDistances)",
        "control-point-weights": "data(controlPointWeights)",
        "z-index": "data(zIndex)",
        "z-index-compare": "manual",
      },
    },
    {
      selector: ".eh-ghost-edge",
      style: {
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": "cyan",
        "line-color": "cyan",
        "line-style": "solid",
        "line-dash-pattern": [5, 10],
        "curve-style": curveStyle,
        "taxi-turn": "100",
        "taxi-direction": "auto",
        label: "",
        "control-point-distances": "10",
        "control-point-weights": "0.5",
      },
    },
    {
      selector: ".eh-preview",
      style: {
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": "cyan",
        "line-color": "cyan",
        "line-style": "solid",
        "line-dash-pattern": [5, 10],
        "curve-style": curveStyle,
        "taxi-turn": "100",
        "taxi-direction": "auto",
        label: "",
        "control-point-distances": "10",
        "control-point-weights": "0.5",
      },
    },

    // Classes for highlighting
    {
      selector: "node:selected",
      style: {
        "underlay-color": "green",
        "underlay-padding": 6,
        "underlay-opacity": 1,
        "border-opacity": 0.25,
        "line-color": "green",
        "target-arrow-color": "green",
      },
    },
    {
      selector: "node.selected",
      style: {
        "underlay-color": "cyan",
        "underlay-padding": 4,
        "underlay-opacity": 1,
        "border-opacity": 0.25,
      },
    },
    {
      selector: "edge:selected",
      style: {
        "underlay-color": "green",
        "underlay-padding": 2,
        "underlay-opacity": 1,
        "border-opacity": 0.25,
        "line-color": "green",
        "target-arrow-color": "green",
      },
    },
    {
      selector: "edge.selected",
      style: {
        "underlay-color": "cyan",
        "underlay-padding": 2,
        "underlay-opacity": 1,
        "border-opacity": 0.25,
        "line-color": "cyan",
        "target-arrow-color": "cyan",
      },
    },

    {
      selector: "node[classes != 'publicBoardNode']:locked, edge[classes != 'publicBoardEdge']:locked",
      style: {
        "border-opacity": 0.5,
        "border-width": 2.5,
        "border-color": "red",
      },
    },
    {
      selector: ":grabbed",
      style: {
        "line-color": "green",
        "target-arrow-color": "green",
        "overlay-color": "lightgreen",
      },
    },
    {
      selector: ".incomingEdgeHighlight",
      style: {
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": "blue",
        "line-color": "blue",
        "line-style": "dotted",
        "line-dash-pattern": [5, 10],
        "curve-style": "straight",
      },
    },
    {
      selector: ".incomingNodeHighlight",
      style: {
        "border-width": 4,
        "border-color": "blue",
        padding: "15px",
      },
    },
    {
      selector: ".outgoingEdgeHighlight",
      style: {
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": "cyan",
        "line-color": "cyan",
        "line-style": "solid",
        "line-dash-pattern": [5, 10],
        "curve-style": "straight",
      },
    },
    {
      selector: ".outgoingNodeHighlight",
      style: {
        "border-width": 4,
        "border-color": "cyan",
      },
    },
    {
      selector: ".selectedHighlight",
      style: {
        "background-image-opacity": 0,
        "background-color": "yellow",
      },
    },
  ];
};
export const cytoscapeGridOptions = {
  // On/Off Modules
  /* From the following four snap options, at most one should be true at a given time */
  snapToGridDuringDrag: true,
  snapToGridOnRelease: false, // Snap to grid on release
  snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
  snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
  distributionGuidelines: false, // Distribution guidelines
  geometricGuideline: false, // Geometric guidelines
  initPosAlignment: false, // Guideline to initial mouse position
  centerToEdgeAlignment: false, // Center to edge alignment
  resize: false, // Adjust node sizes to cell sizes
  parentPadding: false, // Adjust parent sizes to cell sizes by padding

  // General
  gridSpacing: 50, // Distance between the lines of the grid.
  snapToGridCenter: true, // Snaps nodes to center of gridlines. When false, snaps to gridlines themselves. Note that either snapToGridOnRelease or snapToGridDuringDrag must be true.

  // Draw Grid
  zoomDash: false, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
  panGrid: true, // Determines whether the grid should move then the user moves the graph if grid is drawn.
  gridStackOrder: -1, // Namely z-index
  gridColor: "rgba(255,255,255,0.25)", // Color of grid lines
  lineWidth: 1.0, // Width of grid lines

  // Guidelines
  guidelinesStackOrder: 4, // z-index of guidelines
  guidelinesTolerance: 2.0, // Tolerance distance for rendered positions of nodes' interaction.
  guidelinesStyle: {
    // Set ctx properties of line. Properties are here:
    strokeStyle: "#fff", // color of geometric guidelines
    geometricGuidelineRange: 400, // range of geometric guidelines
    range: 100, // max range of distribution guidelines
    minDistRange: 10, // min range for distribution guidelines
    distGuidelineOffset: 10, // shift amount of distribution guidelines
    horizontalDistColor: "#ff0000", // color of horizontal distribution alignment
    verticalDistColor: "#00ff00", // color of vertical distribution alignment
    initPosAlignmentColor: "#0000ff", // color of alignment to initial mouse location
    lineDash: [0, 0], // line style of geometric guidelines
    horizontalDistLine: [0, 0], // line style of horizontal distribution guidelines
    verticalDistLine: [0, 0], // line style of vertical distribution guidelines
    initPosAlignmentLine: [0, 0], // line style of alignment to initial mouse position
  },

  // Parent Padding
  parentSpacing: -1, // -1 to set paddings of parents to gridSpacing
};

export const DefaultBoardColor = "#595959";

export const BoardFonSizes = [
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
export const AvailableNodeShapes = [
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
