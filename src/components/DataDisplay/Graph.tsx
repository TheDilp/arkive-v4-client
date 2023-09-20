/* eslint-disable func-names */
import { useQueryClient } from "@tanstack/react-query";
import { Collection, Core, EventObject } from "cytoscape";
import { useAtom, useSetAtom } from "jotai";
import set from "lodash.set";
import { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useParams } from "react-router-dom";

import {
  useChangeNavbarTitle,
  useCreateSubEntity,
  useDeleteMany,
  useDeleteSubEntity,
  useGetEntity,
  useUpdateManySubEntities,
} from "../../hooks";
import { useBatchUpdateNodePositions } from "../../hooks/graphs/useBatchDragEvents";
import { GraphType } from "../../types";
import { IconEnum, useNotifications } from "../../utils";
import {
  BoardReferenceAtom,
  BoardStateAtom,
  breadcrumbsAtom,
  contextMenuAtom,
  drawerAtom,
  edgesAtom,
  nodesAtom,
} from "../../utils/atoms";
import { cytoscapeGridOptions, DefaultNode, getCytoscapeStylesheet } from "../../utils/enums/GraphEnums";
import { changeLockState, edgehandlesSettings, mapEdges, mapNodes } from "../../utils/ui/graphUtils";
import { InsertEdgeType, InsertNodeType } from "../../validation";
import { Quickbar } from "..";

type Props = {
  data?: Partial<GraphType>;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  center_on?: string;
};

export function Graph({ data, isReadOnly, isViewOnly, center_on }: Props) {
  const { project_id, item_id, subitem_id } = useParams();
  const queryClient = useQueryClient();
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  const { data: existingGraphData } = useGetEntity<GraphType>(
    item_id,
    "graphs",
    {
      fields: ["default_node_shape", "default_node_color", "default_edge_color"],
      relations: { nodes: true, edges: true, parents: true },
    },
    { enabled: !data },
  );

  useLayoutEffect(() => {
    if (!item_id) {
      setBreadcrumbs({ items: [], type: "graphs" });
    } else if (existingGraphData?.data?.parents && existingGraphData?.data?.parents?.length) {
      setBreadcrumbs({ items: existingGraphData?.data?.parents, type: "graphs" });
    }
  }, [existingGraphData, setBreadcrumbs, item_id]);

  const graph = existingGraphData?.data || data;

  useChangeNavbarTitle(`The Arkive | Graphs | ${graph?.title}`, !isReadOnly && !isViewOnly && !!graph);
  const { mutate: createNode } = useCreateSubEntity<InsertNodeType>("nodes", project_id);
  const { mutate: createEdges } = useCreateSubEntity<InsertEdgeType>("edges", project_id);
  const cyRef = useRef() as any;
  const ehRef = useRef(undefined) as any;
  const firstRender = useRef(true) as MutableRefObject<boolean>;
  const [drawer, setDrawer] = useAtom(drawerAtom);
  const createNotification = useNotifications();
  const [boardState, setBoardState] = useAtom(BoardStateAtom);
  const setBoardRef = useSetAtom(BoardReferenceAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);

  const { mutate: deleteNode } = useDeleteSubEntity("nodes", project_id as string);
  const { mutate: deleteManyNodes } = useDeleteMany("nodes");
  const { mutate: deleteManyEdges } = useDeleteMany("edges");

  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const { addOrUpdateNode } = useBatchUpdateNodePositions();
  const { mutate: updateManyNodes } = useUpdateManySubEntities("nodes", item_id as string);

  const styleSheet = useMemo(
    () => getCytoscapeStylesheet(boardState.curve_style),

    [boardState.curve_style],
  );

  const makeEdgeCallback = (source: string, target: string, color?: string) => {
    cyRef?.current?._cy?.remove(".eh-ghost-edge");
    const newEdge = {
      id: crypto.randomUUID(),
      source_id: source,
      target_id: target,
      line_color: color,
      curve_style: boardState.curve_style,
      target_arrow_color: color,
      parent_id: item_id as string,
    };

    createEdges(
      { data: newEdge },
      {
        onSuccess: (d) => {
          setEdges((prev) => [...prev, { ...newEdge, ...d.data }]);
        },
      },
    );
  };

  useEffect(() => {
    if (graph?.nodes && graph?.nodes.length > 0 && !nodes.length) {
      setNodes(graph?.nodes);
    }
    if (graph?.edges && graph?.edges.length > 0 && !edges.length) {
      setEdges(graph?.edges);
    }
  }, [graph?.nodes, graph?.edges]);
  useEffect(() => {
    if (!cyRef || !ehRef) return () => {};
    if (firstRender && firstRender.current) {
      firstRender.current = false;
    }

    return () => {
      const refVariable = cyRef?.current;
      firstRender.current = true;
      if (ehRef?.current) {
        ehRef.current.destroy();
        ehRef.current = undefined;
      }
      if (refVariable?._cy) {
        setBoardState((prev) => ({ ...prev, draw_mode: false }));
      }
      setNodes([]);
      setEdges([]);
      queryClient.removeQueries(["graphs", item_id]);
    };
  }, [item_id]);
  // Board Events
  useEffect(() => {
    if (cyRef?.current?._cy && !isReadOnly && !isViewOnly) {
      cyRef?.current?._cy.on("grabon", function (evt: any) {
        const selected = cyRef?.current?._cy.elements(":selected");
        if (selected?.length === 1) {
          cyRef?.current?._cy.elements(":selected").unselect();
          evt.target.select();
        }
      });
      // Right click
      cyRef?.current?._cy.on("cxttap", function (evt: any) {
        // If the target is the background of the canvas
        if (evt.target === cyRef?.current?._cy) {
          setContextMenu({
            event: evt.originalEvent,
            items: [
              {
                title: "New node",
                icon: IconEnum.add,
                onClick: () => {
                  createNode({
                    data: {
                      id: crypto.randomUUID(),
                      parent_id: item_id as string,
                      x: parseFloat(evt.position.x.toFixed(2)),
                      y: parseFloat(evt.position.y.toFixed(2)),
                    },
                  });
                },
              },
              {
                title: "Go to center of graph",
                onClick: () => cyRef?.current?._cy?.center(),
                icon: IconEnum.center,
              },
              {
                title: "Fit view to nodes",
                icon: IconEnum.fit,
                onClick: () => {
                  if (cyRef?.current?._cy)
                    cyRef?.current?._cy.animate(
                      {
                        fit: {
                          padding: 0,
                          eles: cyRef?.current?._cy.nodes(),
                        },
                      },
                      {
                        duration: 1250,
                      },
                    );
                },
              },
              { title: "Quick create from document", icon: IconEnum.document_template },
              { title: "Quick create from image", icon: IconEnum.image_template },
            ],
          });
        }
        // Else - the target is a node or an edge
        else {
          const { group } = evt.target._private;
          const selected = group === "nodes" ? cyRef?.current?._cy.nodes(":selected") : cyRef?.current?._cy.edges(":selected");
          // If the current target is not in the selected group, make it the only selected item
          // This mimics a desktop mouse experience
          // Otherwise, do nothing
          if (!cyRef?.current?._cy.elements(":selected").contains(evt.target)) {
            cyRef?.current?._cy.elements(":selected").unselect();
            evt.target.select();
          }

          if (group === "nodes") {
            const {
              data: { id, label },
              locked,
            } = evt.target._private;
            setContextMenu({
              event: evt.originalEvent,
              items:
                selected.length <= 1
                  ? [
                      {
                        title: "Edit node",
                        icon: IconEnum.edit,
                        onClick: () =>
                          setDrawer((prev) => ({
                            ...prev,
                            title: `Edit node ${label ? " - ".concat(label) : ""}`,
                            type: "nodes",
                            data: {
                              id,
                              parent_id: item_id as string,
                            },
                          })),
                      },
                      {
                        title: "Highlight connected nodes",
                        icon: IconEnum.board,
                        onClick: () => {
                          const incomers = evt.target.incomers();
                          const outgoers = evt.target.outgoers();

                          incomers.nodes().flashClass("incomingNodeHighlight", 1500);
                          incomers.edges().flashClass("incomingEdgeHighlight", 1500);
                          outgoers.nodes().flashClass("outgoingNodeHighlight", 1500);
                          outgoers.edges().flashClass("outgoingEdgeHighlight", 1500);
                        },
                      },
                      {
                        title: locked ? "Unlock node" : "Lock node",
                        icon: locked ? IconEnum.unlock : IconEnum.lock,
                        onClick: () => changeLockState(cyRef?.current?._cy, !locked, updateManyNodes, item_id as string),
                      },
                      {
                        title: "Center on node",
                        icon: IconEnum.center,
                        onClick: () => cyRef?.current?._cy.center(evt.target),
                      },
                      // { title: "Template from node" },
                      // !ADD OPTION TO DELETE MULTIPLE NODES
                      {
                        title: "Delete node",
                        icon: IconEnum.trash,
                        onClick: () =>
                          deleteNode(
                            { data: { id, parent_id: item_id as string } },
                            {
                              onSuccess: () => {
                                setEdges((prev) => prev.filter((e) => e.source_id !== id && e.target_id !== id));

                                setNodes((prev) => prev.filter((n) => n.id !== id));
                              },
                            },
                          ),
                      },
                    ]
                  : [
                      {
                        title: "Edit multiple nodes",
                        icon: IconEnum.edit,
                        onClick: () => {
                          setDrawer((prev) => ({
                            ...prev,
                            title: "Edit nodes",
                            type: "many_nodes",
                            data: {
                              ids: selected.map((el: any) => el.id()) as string[],
                              parent_id: item_id as string,
                            },
                          }));
                        },
                      },
                      {
                        title: locked ? "Unlock nodes" : "Lock nodes",
                        icon: locked ? IconEnum.unlock : IconEnum.lock,
                        onClick: () => changeLockState(cyRef?.current?._cy, !locked, updateManyNodes, item_id as string),
                      },
                      {
                        title: "Center on nodes",
                        icon: IconEnum.center,
                        onClick: () => cyRef?.current?._cy.center(evt.target),
                      },
                      {
                        title: "Delete multiple nodes",
                        icon: IconEnum.trash,
                        onClick: () => {
                          // @ts-ignore
                          const ids: string[] = selected.map((el) => el.id());
                          deleteManyNodes(
                            { data: ids.map((i) => ({ id: i })) },
                            {
                              onSuccess: () => {
                                setEdges((prev) =>
                                  prev.filter((e) => !ids.includes(e.source_id) && !ids.includes(e.target_id)),
                                );

                                setNodes((prev) => prev.filter((n) => !ids.includes(n.id)));
                              },
                            },
                          );
                        },
                      },
                    ],
            });
          } else if (group === "edges") {
            const {
              data: { id },
            } = evt.target._private;
            setContextMenu({
              event: evt.originalEvent,
              items:
                selected.length <= 1
                  ? [
                      {
                        title: "Edit edge",
                        icon: IconEnum.edit,
                        onClick: () => {
                          if (edges) {
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Edit edge",
                              type: "edges",
                              data: {
                                id,
                                parent_id: item_id as string,
                              },
                            }));
                          }
                        },
                      },
                      {
                        title: "Highlight connected nodes",
                        icon: IconEnum.board,
                        onClick: () => {
                          if (edges) {
                            evt.target.sources().flashClass("incomingNodeHighlight", 2000);
                            evt.target.targets().flashClass("outgoingNodeHighlight", 2000);
                          }
                        },
                      },
                      // !DELETE MULTIPLE OR SINGLE EDGE
                      {
                        title: "Delete selected edge",
                        icon: IconEnum.trash,
                        onClick: () => {
                          if (edges) {
                            const ids: string[] = cyRef?.current?._cy?.edges(":selected").map((edge: any) => edge.id());
                            deleteManyEdges({ data: ids.map((i) => ({ id: i })) });
                            setEdges((prev) => prev.filter((e) => !ids.includes(e.id)));
                          }
                        },
                      },
                    ]
                  : [
                      {
                        title: "Edit many edges",
                        icon: IconEnum.edit,
                        onClick: () => {
                          if (edges) {
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Edit edges",
                              type: "many_edges",
                              data: {
                                ids: selected.map((el: any) => el.id()) as string[],
                                parent_id: item_id as string,
                              },
                            }));
                          }
                        },
                      },
                      {
                        title: "Delete selected edges",
                        icon: IconEnum.trash,
                        onClick: () => {
                          if (edges) {
                            const ids: string[] = cyRef?.current?._cy?.edges(":selected").map((edge: any) => edge.id());
                            deleteManyEdges({ data: ids.map((i) => ({ id: i })) });
                            setEdges((prev) => prev.filter((e) => !ids.includes(e.id)));
                          }
                        },
                      },
                    ],
            });
          }
        }
      });

      // Moving nodes
      cyRef?.current?._cy.on("free", "node", function (evt: EventObject) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        const target = evt.target._private;
        cyRef?.current?._cy.elements(":selected").select();
        evt.target.select();
        // Grid extenstion messes with the "grab events"
        // "Freeon" event triggers on double clicking
        // This is a safeguard to prevent the node position from being changed on anything EXCEPT dragging

        if (target.position.x !== target?.data.x || target.position.y !== target.data?.y) {
          setNodes((prev) => {
            const idx = prev.findIndex((n) => n.id === target.data.id);

            if (idx !== -1) {
              const newNodes = [...prev];
              const foundNode = newNodes[idx];
              if (foundNode.x !== target.position.x) {
                set(foundNode, "x", target.position.x);
              }
              if (foundNode.y !== target.position.y) {
                set(foundNode, "y", target.position.y);
              }
              addOrUpdateNode({ id: target.data.id, ...target.position });
              newNodes[idx] = foundNode;
              return newNodes;
            }
            return prev;
          });
        }
      });
      // Double Click
      cyRef?.current?._cy.on("dbltap", "node", function (evt: any) {
        const target = evt.target._private;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { backgroundImage, classes, document, locked, parent, zIndexCompare, ...rest } = target.data;
        setDrawer((prev) => {
          if (prev?.data && "id" in prev.data) {
            if (prev?.data?.id === rest.id) return prev;
            createNotification({
              title: "Please close the current drawer before editing another.",
              variant: "info",
              timer: 5,
            });
            return prev;
          }
          return {
            ...prev,
            data: { id: rest.id, parent_id: item_id as string },
            position: "right",
            title: `Edit node ${rest?.label ? "-".concat(rest.label) : ""}`,
            type: "nodes",
            size: "md",
          };
        });
      });
      cyRef?.current?._cy.on("dbltap", "edge", function (evt: any) {
        const targetEdge = evt.target._private;
        setDrawer((prev) => {
          if (prev?.data && "id" in prev.data) {
            if (prev?.data?.id === targetEdge.data.id) return prev;
            createNotification({
              title: "Please close the current drawer before editing another.",
              variant: "info",
              timer: 5,
            });
            return prev;
          }
          return {
            ...prev,
            data: { id: targetEdge.data.id, parent_id: item_id as string },
            position: "right",
            title: `Edit edge ${targetEdge?.data?.label ? "-".concat(targetEdge?.data.label) : ""}`,
            type: "edges",
            size: "md",
          };
        });
      });
    }
    return () => {
      cyRef?.current?._cy.removeListener("mousedown cxttap dbltap free");
    };
  }, [cyRef?.current?._cy, nodes, edges, item_id]);
  useEffect(() => {
    // Creating edges
    // @ts-ignore
    cyRef?.current?._cy.on("ehcomplete", function (_, sourceNode: any, targetNode: any, addedEdge: any) {
      const sourceData = sourceNode._private.data;
      const targetData = targetNode._private.data;

      // Check due to weird edgehandles behavior when toggling drawmode
      // When drawmode is turned on and then off and then back on
      // It can add an edges to a node that doesn't exist
      try {
        cyRef?.current?._cy.remove(addedEdge);
      } catch (error) {
        createNotification({ variant: "warning", title: "Edge couldn't be removed, there was an error.", timer: 3 });
      }
      makeEdgeCallback(sourceData.id, targetData.id, existingGraphData?.data?.default_edge_color);
    });

    return () => {
      if (cyRef?.current?._cy) {
        cyRef?.current?._cy.removeListener("ehcomplete");
      }
    };
  }, [cyRef?.current?._cy, item_id, boardState.curve_style]);
  useEffect(() => {
    // Creating edges
    // @ts-ignore
    cyRef?.current?._cy.on("click", function (evt: any) {
      // If the target is the background of the canvas
      if (evt.target === cyRef?.current?._cy && boardState.add_nodes) {
        createNode({
          data: {
            id: crypto.randomUUID(),
            parent_id: item_id as string,
            x: parseFloat(evt.position.x.toFixed(2)),
            y: parseFloat(evt.position.y.toFixed(2)),
            background_color: existingGraphData?.data?.default_node_color || DefaultNode.background_color,
          },
        });
      }
    });

    return () => {
      if (cyRef?.current?._cy) {
        cyRef?.current?._cy.removeListener("click");
      }
    };
  }, [cyRef?.current?._cy, item_id, boardState.add_nodes]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If there is a node id in the URL navigate to that node
      if ((subitem_id || center_on) && cyRef?.current?._cy) {
        const node = cyRef?.current?._cy.getElementById(subitem_id || center_on);

        if (node)
          cyRef?.current?._cy?.animate({
            center: {
              eles: node,
            },
          });
      } else if (!subitem_id && cyRef?.current?._cy) {
        cyRef?.current?._cy?.animate({
          center: {
            eles: cyRef?.current?._cy?.nodes(),
          },
        });
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
    };
  }, [subitem_id, cyRef?.current?._cy]);
  useEffect(() => {
    if (cyRef?.current?._cy) {
      if (ehRef?.current) {
        if (!boardState.draw_mode) {
          ehRef?.current.disable();
          ehRef?.current.disableDrawMode();
          cyRef?.current?._cy.autoungrabify(false);
          cyRef?.current?._cy.autounselectify(false);
          cyRef?.current?._cy.autolock(false);
          cyRef?.current?._cy.zoomingEnabled(true);
          cyRef?.current?._cy.userZoomingEnabled(true);
          cyRef?.current?._cy.panningEnabled(true);
        } else {
          ehRef?.current.enable();
          ehRef?.current.enableDrawMode();
        }
      } else {
        ehRef.current = cyRef?.current?._cy?.edgehandles?.(edgehandlesSettings);
      }
    }
  }, [boardState.draw_mode, cyRef?.current?._cy, ehRef?.current]);
  useEffect(() => {
    if (cyRef?.current?._cy) {
      cyRef?.current?._cy?.gridGuide?.({
        ...cytoscapeGridOptions,
        snapToGridDuringDrag: boardState.grid,
        drawGrid: boardState.grid,
      });
    }
  }, [boardState.grid, cyRef?.current?._cy]);
  useEffect(() => {
    if (cyRef?.current?._cy) {
      if (drawer.type === "edges" || drawer.type === "nodes" || drawer.type === "many_nodes" || drawer.type === "many_edges") {
        const selectedElements: Collection = cyRef.current._cy.elements(".selected");
        if (drawer.type === "edges" || drawer.type === "nodes") {
          if (selectedElements && selectedElements.length > 0) {
            const t = selectedElements.map((el) => `#${el.id()}`).join(", ");
            cyRef?.current?._cy.$(t).removeClass("selected");
          }
          const singleEl = cyRef.current._cy.getElementById(drawer?.data?.id);
          if (singleEl) singleEl.addClass("selected");
        } else if (drawer.type === "many_nodes" || drawer.type === "many_edges") {
          if (selectedElements && selectedElements.length > 0) {
            const t = selectedElements.map((el) => `#${el.id()}`).join(", ");
            cyRef?.current?._cy.$(t).addClass("selected");
          }
        }
      }
    }
    if (drawer.type === null) {
      if (cyRef?.current?._cy) {
        const selectedElements: Collection = cyRef.current._cy.elements(".selected");
        if (selectedElements && selectedElements.length > 0) {
          const t = selectedElements.map((el) => `#${el.id()}`).join(", ");
          cyRef?.current?._cy.$(t).removeClass("selected");
        }
      }
    }
    return () => {};
  }, [drawer]);
  return (
    <div
      className="relative flex h-[calc(100%)] w-full flex-1 justify-center"
      // onDrop={(e) => {
      //   const stringData = e.dataTransfer.getData("item_id");
      //   if (!stringData) return;
      //   const data: BoardDragItemType = JSON.parse(e.dataTransfer.getData("item_id"));
      //   if (!data || !cyRef?.current?._cy) return;
      //   const { image } = data;
      //   const { top, left } = e.currentTarget.getBoundingClientRect();
      //   const { x, y } = toModelPosition(cyRef?.current?._cy, {
      //     x: e.clientX - left,
      //     y: e.clientY - top,
      //   });

      //   if (data.type === "documents") {
      //     const { id: doc_id, title: label } = data;
      //     createNodeMutation.mutate(
      //       {
      //         x,
      //         y,
      //         parentId: item_id,
      //         type: board?.defaultNodeShape,
      //         backgroundColor: board?.defaultNodeColor,
      //         id: crypto.randomUUID(),
      //         label,
      //         image,
      //         doc_id,
      //       },
      //       {
      //         onSuccess: (res) => {
      //           setNodes((prev) => [
      //             ...prev,
      //             {
      //               data: {
      //                 label,
      //                 backgroundImage: ImageURL(image || "") || "",
      //                 doc_id,
      //                 ...DefaultNode,
      //                 id: res.id,
      //                 classes: "boardNode",
      //                 type: board?.defaultNodeShape || "rectangle",
      //                 backgroundColor: board?.defaultNodeColor || "#595959",
      //                 zIndexCompare: res.zIndex === 0 ? "manual" : "auto",
      //               },
      //               position: {
      //                 x,
      //                 y,
      //               },
      //             },
      //           ]);
      //         },
      //       },
      //     );
      //   } else if (data.type === "images") {
      //     createNodeMutation.mutate(
      //       {
      //         x,
      //         y,
      //         parentId: item_id,
      //         type: board?.defaultNodeShape,
      //         backgroundColor: board?.defaultNodeColor,
      //         id: crypto.randomUUID(),
      //         image,
      //       },
      //       {
      //         onSuccess: (res) => {
      //           setNodes((prev) => [
      //             ...prev,
      //             {
      //               data: {
      //                 backgroundImage: formatImageURL(image || "") || "",
      //                 ...DefaultNode,
      //                 label: "",
      //                 id: res.id,
      //                 classes: "boardNode",
      //                 type: board?.defaultNodeShape || "rectangle",
      //                 backgroundColor: board?.defaultNodeColor || "#595959",
      //                 zIndexCompare: res.zIndex === 0 ? "manual" : "auto",
      //               },
      //               position: {
      //                 x,
      //                 y,
      //               },
      //             },
      //           ]);
      //         },
      //       },
      //     );
      //   }
      // }}
    >
      <CytoscapeComponent
        ref={cyRef}
        className="h-full w-full"
        cy={(cy: Core) => {
          setBoardRef(cy);
        }}
        elements={CytoscapeComponent.normalizeElements({
          nodes: mapNodes(nodes || [], project_id as string),
          edges: mapEdges(edges || []),
        })}
        maxZoom={5}
        minZoom={0.1}
        stylesheet={styleSheet}
        wheelSensitivity={0.1}
        zoom={0.6}
      />
      {isViewOnly || isReadOnly ? null : <Quickbar isViewOnly={isViewOnly ?? false} />}
    </div>
  );
}
