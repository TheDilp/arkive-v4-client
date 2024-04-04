/* eslint-disable func-names */
import { Collection, Core, EventObject, LayoutOptions, NodeSingular } from "cytoscape";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import uniqBy from "lodash.uniqby";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useParams } from "react-router-dom";

import {
  useChangeNavbarTitle,
  useCreateSubEntity,
  useDeleteMany,
  useDeleteSubEntity,
  useGenerateGraph,
  useGetEntity,
  useHasPermissions,
  useUpdateManySubEntities,
} from "../../hooks";
import { useBatchUpdateNodePositions } from "../../hooks/graphs/useBatchDragEvents";
import { GraphType } from "../../types";
import { hasActionPermission, IconEnum, useNotifications } from "../../utils";
import {
  BoardReferenceAtom,
  BoardStateAtom,
  breadcrumbsAtom,
  contextMenuAtom,
  dialogAtom,
  drawerAtom,
  edgesAtom,
  isProjectOwnerAtom,
  nodesAtom,
  userAtom,
} from "../../utils/atoms";
import { cytoscapeGridOptions, dagreLayoutOptions, DefaultNode, getCytoscapeStylesheet } from "../../utils/enums/GraphEnums";
import { changeLockState, edgehandlesSettings, mapEdges, mapNodes } from "../../utils/ui/graphUtils";
import { InsertEdgeType, InsertNodeType } from "../../validation";
import { Button, Quickbar, Spinner } from "..";

type Props = {
  data?: Partial<GraphType>;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  isPublic?: boolean;
  center_on?: string;
  isFamilyTreeView?: boolean;
  layoutOptions?: Partial<LayoutOptions> & { rankDir?: "LR" | "TB" };
};

export function Graph({ data, isReadOnly, isViewOnly, isPublic, center_on, isFamilyTreeView, layoutOptions }: Props) {
  const { project_id, item_id, subitem_id } = useParams();
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  const dialogValue = useAtomValue(dialogAtom);

  const { data: existingGraphData, isFetching } = useGetEntity<GraphType>(
    item_id,
    "graphs",
    {
      fields: ["owner_id", "title", "is_public", "default_node_shape", "default_node_color", "default_edge_color"],
      relations: { nodes: true, edges: true, parents: true },
      permissions: true,
    },
    { enabled: !data, queryKeyOverwrite: data ? undefined : ["graph_view", item_id as string], isPublic },
  );

  useLayoutEffect(() => {
    if (!item_id) {
      setBreadcrumbs({ items: [], type: "graphs" });
    } else if (existingGraphData?.data?.parents && existingGraphData?.data?.parents?.length) {
      setBreadcrumbs({ items: existingGraphData?.data?.parents, type: "graphs" });
    }
  }, [existingGraphData, setBreadcrumbs, item_id]);

  const graph = existingGraphData?.data || data;
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(["read_graphs", "update_graphs", "delete_graphs", "read_tags"], graph?.owner_id);
  const updateGraphActionPermission = hasActionPermission(
    isProjectOwner,
    user?.id === graph?.owner_id,
    permissions,
    graph?.permissions || [],
    "update_graphs",
    user?.role?.id,
  );

  useChangeNavbarTitle(`Graphs | ${graph?.title}`, !isReadOnly && !isViewOnly && !!graph);
  const { mutate: createNode } = useCreateSubEntity<InsertNodeType>("nodes", project_id);
  const { mutate: createEdges } = useCreateSubEntity<InsertEdgeType>("edges", project_id);
  const { mutateAsync: generateGraph, isLoading: isMutating } = useGenerateGraph<{
    data: Partial<GraphType> & { project_id: string };
    relations: { nodes: any[]; edges: any[] };
  }>();
  const cyRef = useRef() as any;
  const ehRef = useRef(undefined) as any;
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
  const { addOrUpdateNode } = useBatchUpdateNodePositions(item_id as string);
  const { mutate: updateManyNodes } = useUpdateManySubEntities("nodes", item_id as string);

  const styleSheet = useMemo(
    () => getCytoscapeStylesheet(boardState.curve_style),

    [boardState.curve_style],
  );

  function makeEdgeCallback(source: string, target: string, color?: string) {
    cyRef?.current?._cy?.remove(".eh-ghost-edge");
    if (!updateGraphActionPermission) return;
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
  }

  useEffect(() => {
    if (graph?.nodes && nodes.length === 0) {
      setNodes(graph?.nodes);
    }
    if (graph?.edges && edges.length === 0) {
      setEdges(graph?.edges);
    }
  }, [graph?.nodes, graph?.edges]);
  useEffect(() => {
    if (!cyRef || !ehRef) return () => {};

    return () => {
      const refVariable = cyRef?.current;
      if (ehRef?.current) {
        ehRef.current.destroy();
        ehRef.current = undefined;
      }
      if (refVariable?._cy) {
        setBoardState((prev) => ({ ...prev, draw_mode: false }));
      }
      setNodes([]);
      setEdges([]);
      // queryClient.removeQueries(["graph_view", item_id]);
    };
  }, [item_id]);
  // Board Events
  useEffect(() => {
    if (cyRef?.current?._cy && !isReadOnly && !isViewOnly) {
      cyRef?.current?._cy.removeListener("grabon grab");
      // cyRef?.current?._cy.on("grabon", function (evt: any) {
      //   const selected = cyRef?.current?._cy.elements(":selected");
      //   if (selected?.length === 1) {
      //     cyRef?.current?._cy.elements(":selected").unselect();
      //     evt.target.select();
      //   }
      // });
      // Right click
      cyRef?.current?._cy.on("cxttap", function (evt: any) {
        // If the target is the background of the canvas
        if (evt.target === cyRef?.current?._cy) {
          setContextMenu({
            event: evt.originalEvent,
            items: [
              {
                id: "1",
                title: "New node",
                icon: IconEnum.add,
                isDisabled: !hasActionPermission(
                  isProjectOwner,
                  user?.id === graph?.owner_id,
                  permissions,
                  graph?.permissions || [],
                  "update_graphs",
                  user?.role?.id,
                ),
                onClick: () => {
                  createNode({
                    data: {
                      id: crypto.randomUUID(),
                      parent_id: item_id as string,
                      x: parseFloat(evt.position.x.toFixed(2)),
                      y: parseFloat(evt.position.y.toFixed(2)),
                      type: existingGraphData?.data?.default_node_shape || "rectangle",
                    },
                  });
                },
              },
              {
                id: "2",
                title: "Go to center of graph",
                onClick: () => cyRef?.current?._cy?.center(),
                icon: IconEnum.center,
              },
              {
                id: "3",
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
                        id: "1",
                        title: "Edit node",
                        icon: IconEnum.edit,
                        isDisabled: !updateGraphActionPermission,
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
                        id: "2",
                        title: "Highlight connected nodes",
                        icon: IconEnum.graph,
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
                        id: "3",
                        title: locked ? "Unlock node" : "Lock node",
                        icon: locked ? IconEnum.unlock : IconEnum.lock,
                        onClick: () => changeLockState(cyRef?.current?._cy, !locked, updateManyNodes, item_id as string),
                        isDisabled: !updateGraphActionPermission,
                      },
                      {
                        id: "4",
                        title: "Center on node",
                        icon: IconEnum.center,
                        onClick: () => cyRef?.current?._cy.center(evt.target),
                      },
                      // { title: "Template from node" },
                      // !ADD OPTION TO DELETE MULTIPLE NODES
                      {
                        id: "5",
                        title: "Delete node",
                        icon: IconEnum.trash,
                        isDisabled: !updateGraphActionPermission,
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
                        id: "6",
                        title: "Edit multiple nodes",
                        isDisabled: !updateGraphActionPermission,
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
                        id: "7",
                        title: locked ? "Unlock nodes" : "Lock nodes",
                        isDisabled: !updateGraphActionPermission,
                        icon: locked ? IconEnum.unlock : IconEnum.lock,
                        onClick: () => changeLockState(cyRef?.current?._cy, !locked, updateManyNodes, item_id as string),
                      },
                      {
                        id: "8",
                        title: "Center on nodes",
                        icon: IconEnum.center,
                        onClick: () => cyRef?.current?._cy.center(evt.target),
                      },
                      {
                        id: "9",
                        title: "Delete multiple nodes",
                        isDisabled: !updateGraphActionPermission,
                        icon: IconEnum.trash,
                        onClick: () => {
                          // @ts-ignore
                          const ids: string[] = selected.map((el) => el.id());
                          deleteManyNodes(
                            { data: { ids: ids.map((i) => i) } },
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
                        id: "1",
                        title: "Edit edge",
                        icon: IconEnum.edit,
                        isDisabled: !updateGraphActionPermission,
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
                        id: "2",
                        title: "Highlight connected nodes",
                        icon: IconEnum.graph,
                        onClick: () => {
                          if (edges) {
                            evt.target.sources().flashClass("incomingNodeHighlight", 2000);
                            evt.target.targets().flashClass("outgoingNodeHighlight", 2000);
                          }
                        },
                      },
                      // !DELETE MULTIPLE OR SINGLE EDGE
                      {
                        id: "3",
                        title: "Delete selected edge",
                        icon: IconEnum.trash,
                        isDisabled: !updateGraphActionPermission,
                        onClick: () => {
                          if (edges) {
                            const ids: string[] = cyRef?.current?._cy?.edges(":selected").map((edge: any) => edge.id());
                            deleteManyEdges({ data: { ids: ids.map((i) => i) } });
                            setEdges((prev) => prev.filter((e) => !ids.includes(e.id)));
                          }
                        },
                      },
                    ]
                  : [
                      {
                        id: "4",
                        title: "Edit many edges",
                        icon: IconEnum.edit,
                        isDisabled: !updateGraphActionPermission,
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
                        id: "5",
                        title: "Delete selected edges",
                        isDisabled: !updateGraphActionPermission,
                        icon: IconEnum.trash,
                        onClick: () => {
                          if (edges) {
                            const ids: string[] = cyRef?.current?._cy?.edges(":selected").map((edge: any) => edge.id());
                            deleteManyEdges({ data: { ids: ids.map((i) => i) } });
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
      cyRef?.current?._cy.on("mouseup", "node", function (evt: EventObject) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        const grabbedNodes: Collection<NodeSingular> = cyRef?.current?._cy.nodes(":grabbed");

        if (grabbedNodes.length === 0) {
          evt.target.select();
        } else {
          grabbedNodes.select();
        }

        cyRef?.current?._cy.nodes(":grabbed").forEach((el: NodeSingular) => {
          if (el.grabbed()) {
            const oldPosition = { x: el.data().x, y: el.data().y };
            const newPosition = el.position();
            if (oldPosition.x !== newPosition.x || oldPosition.y !== newPosition.y) {
              addOrUpdateNode({ id: el.id(), ...el.position() });
              el.select();
            }
          }
        });
        grabbedNodes.select();
      });

      // Double Click
      cyRef?.current?._cy.on("dbltap", "node", function (evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!updateGraphActionPermission) return;
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
        if (!updateGraphActionPermission) return;
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
      cyRef?.current?._cy.removeListener("mousedown cxttap dbltap mouseup");
    };
  }, [cyRef?.current?._cy, boardState.grid, nodes, edges, item_id]);
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
      if (!updateGraphActionPermission) return;
      // If the target is the background of the canvas
      if (evt.target === cyRef?.current?._cy && boardState.add_nodes) {
        createNode({
          data: {
            id: crypto.randomUUID(),
            parent_id: item_id as string,
            x: parseFloat(evt.position.x.toFixed(2)),
            y: parseFloat(evt.position.y.toFixed(2)),
            type: existingGraphData?.data?.default_node_shape || "rectangle",
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
    if (!isFetching) {
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
            fit: {
              eles: cyRef?.current?._cy?.nodes(),
            },
          });
        }
      }, 250);
      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [subitem_id, cyRef?.current?._cy, isFetching]);
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
      cyRef?.current?._cy?.gridGuide?.(cytoscapeGridOptions);
    }
  }, [boardState.grid, cyRef?.current?._cy]);
  useEffect(() => {
    if (cyRef?.current?._cy) {
      if (drawer.type === "edges" || drawer.type === "nodes" || drawer.type === "many_nodes" || drawer.type === "many_edges") {
        const selectedElements: Collection = cyRef.current._cy.elements(":selected");
        const selectedClassElements: Collection = cyRef.current._cy.elements(".selected");

        if (drawer.type === "edges" || drawer.type === "nodes") {
          if (selectedElements && selectedElements.length > 0) {
            const t = selectedClassElements.map((el) => `#${el.id()}`).join(", ");
            cyRef?.current?._cy.$(t).removeClass("selected");
          }
          const singleEl = cyRef.current._cy.getElementById(drawer?.data?.id);
          if (singleEl) singleEl.addClass("selected");
        } else if (drawer.type === "many_nodes" || drawer.type === "many_edges") {
          if (selectedElements && selectedElements.length > 0) {
            const t = selectedClassElements.map((el) => `#${el.id()}`).join(", ");
            cyRef?.current?._cy.$(t).removeClass("selected");
            if (drawer.type === "many_nodes") {
              const toHighlight = selectedElements
                .nodes()
                .map((el) => `#${el.id()}`)
                .join(", ");
              cyRef?.current?._cy.$(toHighlight).addClass("selected");
            }
            if (drawer.type === "many_edges") {
              const toHighlight = selectedElements
                .edges()
                .map((el) => `#${el.id()}`)
                .join(", ");
              cyRef?.current?._cy.$(toHighlight).addClass("selected");
            }
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
  cyRef?.current?._cy.removeListener("grabon grab");

  return (
    <div className="relative flex h-[calc(100%)] w-full flex-1 flex-col justify-center">
      <div className={`absolute z-10 flex h-full w-full items-center justify-center bg-black ${isFetching ? "" : "hidden"}`}>
        {isFetching ? <Spinner /> : null}
      </div>
      {isFamilyTreeView && !isPublic ? (
        <div className="ml-auto w-min">
          <Button
            icon={IconEnum.add}
            isDisabled={isMutating}
            isLoading={isMutating}
            label="Create graph from tree"
            onClick={async () => {
              const nodesToGenerate = (cyRef?.current?._cy as Core).nodes().map((n) => {
                const d = n.data();
                const position = n.position();
                return { data: { id: d.id, character_id: d.character_id, label: d.label, ...position } };
              });
              if (nodesToGenerate.length <= 1) {
                createNotification({
                  title: "Tree must contain at least two nodes.",
                  variant: "warning",
                  timer: 3,
                  icon: IconEnum.warning,
                });
                return;
              }
              const edgesToGenerate = (cyRef?.current?._cy as Core).edges().map((e) => {
                const d = e.data();
                return { data: { source_id: d.source, target_id: d.target, curve_style: "taxi", taxi_direction: "vertical" } };
              });

              const uniqueEdges = uniqBy(edgesToGenerate, (edge) => [edge.data.source_id, edge.data.target_id]);

              await generateGraph({
                data: { project_id: project_id as string, title: dialogValue?.title || "Family tree" },
                relations: { nodes: nodesToGenerate, edges: uniqueEdges },
              });
            }}
            variant="info"
          />
        </div>
      ) : null}
      <CytoscapeComponent
        ref={cyRef}
        className="h-full w-full"
        cy={(cy: Core) => {
          setBoardRef(cy);
          if (isFamilyTreeView) {
            cy.layout({
              ...(layoutOptions || {}),
              ...dagreLayoutOptions,
              name: "dagre",
            }).run();
            cy.nodes().lock();
          }
          if (!isFamilyTreeView && layoutOptions) {
            // @ts-ignore
            cy.layout(layoutOptions).run();
          }
        }}
        elements={CytoscapeComponent.normalizeElements({
          nodes: mapNodes(nodes || [], project_id as string, isReadOnly),
          edges: mapEdges(edges || []),
        })}
        maxZoom={5}
        minZoom={0.1}
        stylesheet={styleSheet}
        wheelSensitivity={0.1}
        zoom={0.6}
      />
      {isViewOnly || isReadOnly ? null : (
        <div className="relative flex w-full justify-center">
          <Quickbar
            graphTitle={existingGraphData?.data?.title || ""}
            hasPermission={updateGraphActionPermission}
            isViewOnly={isViewOnly ?? false}
          />
        </div>
      )}
    </div>
  );
}
