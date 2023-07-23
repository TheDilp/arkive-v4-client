import { CurveStyleType } from "../../types/EntityTypes/graphTypes";

export const getCytoscapeStylesheet = (curve_style: CurveStyleType) => {
  return [
    // Nodes in general
    {
      selector: "node[classes]",
      style: {
        shape: "data(type)",
        width: "data(width)",
        height: "data(height)",
        "font-size": "data(font_size)",
        "font-family": "data(font_family)",
        label: "data(label)",
        color: "data(font_color)",
        "text-outline-color": "black",
        "text-outline-width": "2px",
        "background-image": "data(background_image)",
        "background-fit": "cover",
        "background-clip": "node",
        "background-color": "data(background_color)",
        "background-opacity": "data(background_opacity)",
        "background-image-opacity": "data(background_opacity)",
        "background-image-crossorigin": "anonymous",
        "text-halign": "data(text_h_align)",
        "text-valign": "data(text_v_align)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "z-index": "data(z_index)",
        "z-index-compare": "data(z_index_compare)",
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
        color: "data(font_color)",
        "font-family": "data(font_family)",
        "font-size": "data(font_size)",
        "text-outline-color": "black",
        "text-outline-width": "2px",
        "source-endpoint": "outside-to-node-or-label",
        "target-endpoint": "outside-to-node-or-label",
        width: "data(width)",
        "line-opacity": "data(line_opacity)",
        "line-fill": "data(line_fill)",
        "source-arrow-shape": "data(source_arrow_shape)",
        "source-arrow-fill": "data(source_arrow_fill)",
        "source-arrow-color": "data(source_arrow_color)",

        "target-arrow-shape": "data(target_arrow_shape)",
        "target-arrow-fill": "data(target_arrow_fill)",
        "target-arrow-color": "data(target_arrow_color)",

        "mid-source-arrow-shape": "data(mid_source_arrow_shape)",
        "mid-source-arrow-fill": "data(mid_source_arrow_fill)",
        "mid-source-arrow-color": "data(mid_source_arrow_color)",

        "mid-target-arrow-shape": "data(mid_target_arrow_shape)",
        "mid-target-arrow-fill": "data(mid_target_arrow_fill)",
        "mid-target-arrow-color": "data(mid_target_arrow_color)",

        "arrow-scale": "data(arrow_scale)",
        "line-color": "data(line_color)",
        "line-style": "data(line_style)",
        "line-dash-pattern": [5, 10],
        "taxi-turn": "data(taxi_turn)",
        "taxi-direction": "data(taxi_direction)",
        "curve-style": "data(curve_style)",
        "text-rotation": "autorotate",
        "control-point-distances": "data(control_point_distances)",
        "control-point-weights": "data(control_point_weights)",
        "z-index": "data(z_index)",
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
        "curve-style": curve_style,
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
        "curve-style": curve_style,
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

export const GraphFontSizesEnum = [
  {
    label: "10",
    value: "10",
  },
  {
    label: "12",
    value: "12",
  },
  {
    label: "14",
    value: "14",
  },
  {
    label: "16",
    value: "16",
  },
  {
    label: "18",
    value: "18",
  },
  {
    label: "20",
    value: "20",
  },
  {
    label: "22",
    value: "22",
  },
  {
    label: "24",
    value: "24",
  },
  {
    label: "26",
    value: "26",
  },
  {
    label: "28",
    value: "28",
  },
  {
    label: "30",
    value: "30",
  },
  {
    label: "32",
    value: "32",
  },
  {
    label: "34",
    value: "34",
  },
  {
    label: "36",
    value: "36",
  },
  {
    label: "38",
    value: "38",
  },
  {
    label: "40",
    value: "40",
  },
  {
    label: "42",
    value: "42",
  },
  {
    label: "44",
    value: "44",
  },
  {
    label: "46",
    value: "46",
  },
  {
    label: "48",
    value: "48",
  },
  {
    label: "50",
    value: "50",
  },
  {
    label: "52",
    value: "52",
  },
  {
    label: "54",
    value: "54",
  },
  {
    label: "56",
    value: "56",
  },
  {
    label: "58",
    value: "58",
  },
  {
    label: "60",
    value: "60",
  },
  {
    label: "62",
    value: "62",
  },
  {
    label: "64",
    value: "64",
  },
  {
    label: "66",
    value: "66",
  },
  {
    label: "68",
    value: "68",
  },
  {
    label: "70",
    value: "70",
  },
  {
    label: "72",
    value: "72",
  },
  {
    label: "74",
    value: "74",
  },
  {
    label: "76",
    value: "76",
  },
  {
    label: "78",
    value: "78",
  },
  {
    label: "80",
    value: "80",
  },
  {
    label: "82",
    value: "82",
  },
  {
    label: "84",
    value: "84",
  },
  {
    label: "86",
    value: "86",
  },
  {
    label: "88",
    value: "88",
  },
  {
    label: "90",
    value: "90",
  },
  {
    label: "92",
    value: "92",
  },
  {
    label: "94",
    value: "94",
  },
  {
    label: "96",
    value: "96",
  },
  {
    label: "98",
    value: "98",
  },
  {
    label: "100",
    value: "100",
  },
  {
    label: "102",
    value: "102",
  },
  {
    label: "104",
    value: "104",
  },
  {
    label: "106",
    value: "106",
  },
  {
    label: "108",
    value: "108",
  },
  {
    label: "110",
    value: "110",
  },
  {
    label: "112",
    value: "112",
  },
  {
    label: "114",
    value: "114",
  },
  {
    label: "116",
    value: "116",
  },
  {
    label: "118",
    value: "118",
  },
  {
    label: "120",
    value: "120",
  },
  {
    label: "122",
    value: "122",
  },
  {
    label: "124",
    value: "124",
  },
  {
    label: "126",
    value: "126",
  },
  {
    label: "128",
    value: "128",
  },
  {
    label: "130",
    value: "130",
  },
  {
    label: "132",
    value: "132",
  },
  {
    label: "134",
    value: "134",
  },
  {
    label: "136",
    value: "136",
  },
  {
    label: "138",
    value: "138",
  },
  {
    label: "140",
    value: "140",
  },
  {
    label: "142",
    value: "142",
  },
  {
    label: "144",
    value: "144",
  },
  {
    label: "146",
    value: "146",
  },
  {
    label: "148",
    value: "148",
  },
  {
    label: "150",
    value: "150",
  },
  {
    label: "152",
    value: "152",
  },
  {
    label: "154",
    value: "154",
  },
  {
    label: "156",
    value: "156",
  },
  {
    label: "158",
    value: "158",
  },
  {
    label: "160",
    value: "160",
  },
  {
    label: "162",
    value: "162",
  },
  {
    label: "164",
    value: "164",
  },
  {
    label: "166",
    value: "166",
  },
  {
    label: "168",
    value: "168",
  },
  {
    label: "170",
    value: "170",
  },
  {
    label: "172",
    value: "172",
  },
  {
    label: "174",
    value: "174",
  },
  {
    label: "176",
    value: "176",
  },
  {
    label: "178",
    value: "178",
  },
  {
    label: "180",
    value: "180",
  },
  {
    label: "182",
    value: "182",
  },
  {
    label: "184",
    value: "184",
  },
  {
    label: "186",
    value: "186",
  },
  {
    label: "188",
    value: "188",
  },
  {
    label: "190",
    value: "190",
  },
  {
    label: "192",
    value: "192",
  },
  {
    label: "194",
    value: "194",
  },
  {
    label: "196",
    value: "196",
  },
  {
    label: "198",
    value: "198",
  },
  {
    label: "200",
    value: "200",
  },
];
export const GraphFontFamiliesEnum = [
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
export const TextHAlignEnum = [
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
export const TextVAlignEnum = [
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
export const NodeShapesEnum = [
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
export const NodeRelationLabelEnum = [
  { label: "Character", value: "character" },
  // { label: "Document", value: "document" },
  // { label: "Location", value: "location" },
  // { label: "Event", value: "event" },
];
export const EdgeCurveStylesEnum = [
  {
    label: "Straight",
    value: "straight",
  },
  {
    label: "Curved",
    value: "unbundled-bezier",
  },
  {
    label: "Taxi",
    value: "taxi",
  },
];
export const EdgeLineStylesEnum = [
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
export const EdgeTaxiDirectionsEnum = [
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
export const EdgeArrowShapesEnum = [
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
export const EdgeArrowFillEnum = [
  { label: "Filled", value: "filled" },
  { label: "Hollow", value: "hollow" },
];

export const EdgeCapsEnum = [
  { label: "Round", value: "round" },
  { label: "Butt", value: "butt" },
  { label: "Square", value: "square" },
];
