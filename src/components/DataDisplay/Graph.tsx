import { Collection, Core, EdgeDefinition, EventObject, NodeDefinition } from "cytoscape";
import { useAtom, useSetAtom } from "jotai";
import set from "lodash.set";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useParams } from "react-router-dom";

import { useChangeNavbarTitle, useCreateSubEntity, useDeleteSubEntity, useUpdateManySubEntities } from "../../hooks";
import { useBatchUpdateNodePositions } from "../../hooks/graphs/useBatchDragEvents";
import { GraphType } from "../../types/EntityTypes/graphTypes";
import { IconEnum, useNotifications } from "../../utils";
import { BoardReferenceAtom, BoardStateAtom, contextMenuAtom, drawerAtom, edgesAtom, nodesAtom } from "../../utils/atoms";
import { cytoscapeGridOptions, DefaultNode, getCytoscapeStylesheet } from "../../utils/enums/GraphEnums";
import { changeLockState, edgehandlesSettings, mapEdges, mapNodes } from "../../utils/ui/graphUtils";
import { Quickbar } from "..";

type Props = {
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  data: Omit<GraphType, "tags" | "project_id" | "parent_id" | "id" | "is_folder" | "is_public" | "icon">;
};

export function Graph({ data: graph, isReadOnly, isViewOnly }: Props) {
  useChangeNavbarTitle("The Arkive | Graphs", !(!isReadOnly && !isViewOnly));

  const { mutate: createNode } = useCreateSubEntity("nodes");
  const { mutate: createEdges } = useCreateSubEntity("edges");
  const cyRef = useRef() as any;
  const ehRef = useRef(undefined) as any;
  const firstRender = useRef(true) as MutableRefObject<boolean>;
  const { project_id, item_id, subitem_id } = useParams();
  const [drawer, setDrawer] = useAtom(drawerAtom);
  const createNotification = useNotifications();
  const [boardState, setBoardState] = useAtom(BoardStateAtom);
  const setBoardRef = useSetAtom(BoardReferenceAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);

  const { mutate: deleteNode } = useDeleteSubEntity("nodes");

  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const { addOrUpdateNode } = useBatchUpdateNodePositions(item_id as string);
  const { mutate } = useUpdateManySubEntities(item_id as string);

  const styleSheet = useMemo(
    () => getCytoscapeStylesheet(boardState.curve_style),

    [boardState.curve_style],
  );

  const makeEdgeCallback = (source: string, target: string, color?: string) => {
    cyRef?.current?._cy?.remove(".eh-ghost-edge");

    const newEdge = {
      parentId: item_id as string,
      source_id: source,
      target_id: target,
      line_color: color,
      curve_style: boardState.curve_style,
      target_arrow_color: color,
      parent_id: item_id as string,
    };

    createEdges(newEdge, {
      onSuccess: (data) => {
        setEdges((prev) => [...prev, { ...newEdge, ...data.data }]);
      },
    });
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
        refVariable?._cy.removeListener("click mousedown cxttap dbltap free");
        setBoardState((prev) => ({ ...prev, draw_mode: false }));
      }
      setNodes([]);
      setEdges([]);
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
                  createNode(
                    { parent_id: item_id, x: evt.position.x, y: evt.position.y },
                    {
                      onSuccess: (data: { data: { id: string } }) => {
                        setNodes((prev) => [
                          ...prev,
                          {
                            ...DefaultNode,
                            id: data.data.id,
                            x: evt.position.x,
                            y: evt.position.y,
                            label: "",
                            parent_id: item_id as string,
                          },
                        ]);
                      },
                    },
                  );
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
              items: [
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
                        parent_id: item_id,
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
                  onClick: () => changeLockState(cyRef?.current?._cy, !locked, mutate),
                },
                {
                  title: "Center on node",
                  icon: IconEnum.center,
                  onClick: () => cyRef?.current?._cy.center(evt.target),
                },
                // { title: "Template from node" },
                {
                  title: "Delete node",
                  icon: IconEnum.trash,
                  onClick: () =>
                    deleteNode(
                      { data: { id } },
                      {
                        onSuccess: () => {
                          setEdges((prev) => prev.filter((e) => e.source_id !== id && e.target_id !== id));

                          setNodes((prev) => prev.filter((n) => n.id !== id));
                        },
                      },
                    ),
                },
              ],
            });
          } else if (group === "edges") {
            setContextMenu({
              event: evt.originalEvent,
              items: [
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
                {
                  title: "Delete selected edge",
                  icon: IconEnum.trash,
                  onClick: () => {
                    if (edges) {
                      // const ids = edges.map((edge: any) => edge.id());
                      // deleteManyEdges.mutate(ids);
                      // setEdges((prev) => prev.filter((e) => !ids.includes(e.data.id)));
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
          if (prev?.data?.id) {
            createNotification({
              title: "Please close the drawer for the current node before editing another.",
              variant: "info",
              timer: 5,
            });
            return prev;
          }
          return {
            ...prev,
            data: { id: rest.id, parent_id: item_id },
            position: "right",
            title: `Edit node ${rest?.label ? "-".concat(rest.label) : ""}`,
            type: "nodes",
            size: "md",
          };
        });
      });
      cyRef?.current?._cy.on("dbltap", "edge", function (evt: any) {
        const targetEdge = evt.target._private;
        setDrawer((prev) => ({
          ...prev,
          data: { id: targetEdge.data.id, parent_id: item_id },
          position: "right",
          title: `Edit edge ${targetEdge?.data?.label ? "-".concat(targetEdge.data.label) : ""}`,
          type: "edges",
          size: "md",
        }));
      });
    }
  }, [cyRef?.current?._cy, item_id]);

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
        //! CRITICAL toaster("warning", "Cytoedge couldn't be removed, there was an error.");
      }
      makeEdgeCallback(sourceData.id, targetData.id, graph?.default_edge_color);
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
        createNode(
          { parent_id: item_id, x: evt.position.x, y: evt.position.y },
          {
            onSuccess: (data: { data: { id: string } }) => {
              setNodes((prev) => [
                ...prev,
                {
                  ...DefaultNode,
                  id: data.data.id,
                  x: evt.position.x,
                  y: evt.position.y,
                  label: "",
                  parent_id: item_id as string,
                },
              ]);
            },
          },
        );
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
      if (subitem_id && cyRef?.current?._cy) {
        const node = cyRef?.current?._cy.getElementById(subitem_id);

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
      if (drawer.type === "edges" || drawer.type === "nodes") {
        const selectedElements: Collection = cyRef.current._cy.elements(".selected");
        if (selectedElements && selectedElements.length > 0) {
          const t = selectedElements.map((el) => `#${el.id()}`).join(", ");
          cyRef?.current?._cy.$(t).removeClass("selected");
        }

        const singleEl = cyRef.current._cy.getElementById(drawer?.data?.id);
        if (singleEl) singleEl.addClass("selected");
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
      //                 backgroundImage: formatImageURL(image || "") || "",
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
      <Quickbar isViewOnly={isViewOnly ?? false} />
    </div>
  );
}
