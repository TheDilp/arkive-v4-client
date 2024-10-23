import { autoUpdate, useFloating, useTransitionStyles } from "@floating-ui/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { tv } from "tailwind-variants";

import { dialogAtom, drawerAtom, hasChangedDataAtom, IconEnum } from "../../utils";
import { FolderDrawer, GraphDrawer } from "..";
import { Button } from "../Form";
import {
  AlterNamesDrawer,
  AutomentionDrawer,
  BlueprintDrawer,
  BlueprintInstanceDrawer,
  BulkAccessDrawer,
  BulkFolderDrawer,
  BulkTagsDrawer,
  CalendarDrawer,
  CalendarFilterDrawer,
  CharacterAddDrawer,
  CharacterDrawer,
  CharacterFilterDrawer,
  CharacterRelationshipTypeDrawer,
  ConversationDrawer,
  DictionaryDrawer,
  DocumentDrawer,
  DocumentFromTemplate,
  EdgeDrawer,
  EditMessageDrawer,
  EditTagDrawer,
  EditTags,
  EntityPreviewDrawer,
  EventDrawer,
  EventManagementDrawer,
  FieldTemplateDrawer,
  GatewayAccessDrawer,
  ImageDrawer,
  ManuscriptDrawer,
  ManyEdgesDrawer,
  ManyNodesDrawer,
  MapDrawer,
  MapPinDrawer,
  MapPinManagementDrawer,
  MapPinTypeDrawer,
  MemberAddDrawer,
  MentionedInDocumentDrawer,
  MentionedInDrawer,
  NodeDrawer,
  NodeFromDrawer,
  NodeSearchDrawer,
  ProjectDrawer,
  RandomTableDrawer,
  RandomTableOptionDrawer,
  RandomTableOptionsDrawer,
  RolesAndPermissionsDrawer,
  SearchDrawer,
  TagsDrawer,
  WebhookDrawer,
  WordDrawer,
} from "./DrawerContent";

const DrawerClasses = tv({
  slots: {
    base: "transition-all ease-in-out duration-500 bg-zinc-900 absolute right-0 border-l border-zinc-700 top-0 h-full px-4 pb-4 z-[60] max-h-full",
    title:
      "font-merriweather text-white h-16 max-h-[4rem] text-2xl text-center border-b items-center border-zinc-700 mb-4 flex justify-between flex-nowrap",
  },
  variants: {
    size: {
      "4xs": "w-full md:w-[24rem]",
      "3xs": "w-full md:w-[24rem]",
      "2xs": "w-full md:w-[24rem]",
      xs: "w-full md:w-[24rem]",
      sm: "w-full md:w-[24rem]",
      md: "w-full md:w-[28rem]",
      lg: "w-full md:w-[32rem]",
      xl: "w-full md:w-[36rem]",
      "2xl": "w-full md:w-[40rem]",
      "3xl": "w-full md:w-[40rem]",
      "4xl": "w-full md:w-[40rem]",
      half: "w-full lg:w-1/2",
      full: "w-full",
    },
    isExpanded: {
      true: "w-full mg:w-full lg:w-full",
    },
  },
});

export function Drawer() {
  const drawer = useAtomValue(drawerAtom);
  const [hasChangedData, setHasChangedData] = useAtom(hasChangedDataAtom);
  const resetDrawer = useResetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(!!drawer.type);
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const { refs, context } = useFloating({
    placement: "right",
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
  });
  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      position: "absolute",
      transform: "translateX(100%)",
      width: isExpanded ? "100%" : "10rem",
    },
    common: ({ side }) => ({
      transformOrigin: {
        top: 0,
        bottom: 0,
        left: "100%",
        right: "0px",
      }[side],
    }),
  });

  const { base, title } = DrawerClasses({ size: drawer.size, isExpanded });

  // Close drawer if the location changes
  useEffect(() => {
    if (import.meta.env.PROD) resetDrawer();
    setHasChangedData(false);
  }, [pathname]);

  useEffect(() => {
    setIsOpen(!!drawer.type);
    setTimeout(() => {
      setRenderContent(!!drawer.type);
    }, 200);
  }, [drawer.type]);

  if (isMounted)
    return (
      <div ref={refs.setFloating} className={base()} style={styles}>
        <h3 className={title()}>
          <span className="truncate">{drawer.title}</span>
          <div className="flex items-center gap-x-2">
            <div className="w-min">
              <Button hasNoBackground icon={IconEnum.expand} iconSize={22} onClick={() => setIsExpanded((prev) => !prev)} />
            </div>
            {drawer.type === "nodes" ||
            drawer.type === "many_nodes" ||
            drawer.type === "edges" ||
            drawer.type === "many_edges" ? null : (
              <div className="w-min">
                <Button
                  hasNoBackground
                  icon={IconEnum.close}
                  iconSize={22}
                  onClick={() => {
                    if (!hasChangedData) {
                      resetDrawer();
                      setIsExpanded(false);
                    } else {
                      setDialog((prev) => ({
                        ...prev,
                        title: "You have unsaved changes - are you sure you want to proceed?",
                        confirm: {
                          label: "Proceed",
                          variant: "primary",
                          icon: IconEnum.chevron_right,
                          action: () => {
                            resetDrawer();
                            setHasChangedData(false);
                            setIsExpanded(false);
                          },
                        },
                        cancel: {
                          label: "Cancel",
                          variant: "info",
                          action: () => {},
                        },
                        isOverlay: true,
                      }));
                    }
                  }}
                />
              </div>
            )}
          </div>
        </h3>
        {renderContent ? (
          <div className="flex h-[calc(100%-6rem)] w-full flex-1 flex-col gap-y-4 overflow-hidden">
            {IS_PUBLIC ? (
              <span>
                {drawer.type === "entity_preview" ? <EntityPreviewDrawer data={drawer?.data} /> : null}
                {drawer.type === "node_search" ? <NodeSearchDrawer data={drawer?.data} /> : null}
              </span>
            ) : (
              <>
                {drawer.type === "project" ? <ProjectDrawer /> : null}
                {drawer.type === "characters" ? (
                  <CharacterDrawer actions={drawer?.actions} data={drawer.data} exceptions={drawer?.exceptions} />
                ) : null}
                {drawer.type === "character_fields_templates" ? <FieldTemplateDrawer data={drawer?.data} /> : null}
                {drawer.type === "folder" ? <FolderDrawer data={drawer.data} /> : null}
                {drawer.type === "documents" ? <DocumentDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "manuscripts" ? <ManuscriptDrawer data={drawer?.data} /> : null}
                {drawer.type === "from_template" ? <DocumentFromTemplate data={drawer?.data} /> : null}
                {drawer.type === "maps" ? <MapDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "map_pins" ? <MapPinDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "graphs" ? <GraphDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "nodes" ? <NodeDrawer data={drawer?.data} /> : null}
                {drawer.type === "many_nodes" ? <ManyNodesDrawer data={drawer?.data} /> : null}
                {drawer.type === "node_search" ? <NodeSearchDrawer data={drawer?.data} /> : null}
                {drawer.type === "edges" ? <EdgeDrawer data={drawer?.data} /> : null}
                {drawer.type === "many_edges" ? <ManyEdgesDrawer data={drawer?.data} /> : null}
                {drawer.type === "calendars" ? <CalendarDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "blueprints" ? <BlueprintDrawer data={drawer?.data} /> : null}
                {drawer.type === "blueprint_instances" ? (
                  <BlueprintInstanceDrawer data={drawer?.data} exceptions={drawer?.exceptions} />
                ) : null}
                {drawer.type === "events" ? <EventDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "dictionaries" ? (
                  <DictionaryDrawer data={drawer?.data} exceptions={drawer?.exceptions} />
                ) : null}
                {drawer.type === "words" ? <WordDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
                {drawer.type === "random_tables" ? (
                  <RandomTableDrawer data={drawer?.data} exceptions={drawer?.exceptions} />
                ) : null}
                {drawer.type === "random_table_option" ? <RandomTableOptionDrawer data={drawer?.data} /> : null}
                {drawer.type === "random_table_options" ? <RandomTableOptionsDrawer data={drawer?.data} /> : null}
                {drawer.type === "tags" ? <TagsDrawer /> : null}
                {drawer.type === "edit_tag" ? <EditTagDrawer data={drawer?.data} /> : null}
                {drawer.type === "map_pin_management" ? <MapPinManagementDrawer data={drawer?.data} /> : null}
                {drawer.type === "character_add" ? <CharacterAddDrawer data={drawer?.data} /> : null}
                {drawer.type === "search" ? <SearchDrawer /> : null}
                {drawer.type === "edit_tags" ? <EditTags data={drawer?.data || []} /> : null}
                {drawer.type === "alter_names" ? <AlterNamesDrawer data={drawer?.data} /> : null}
                {drawer.type === "images" ? <ImageDrawer data={drawer?.data} /> : null}
                {drawer.type === "character_relationship_types" ? <CharacterRelationshipTypeDrawer /> : null}
                {drawer.type === "map_pin_types" ? <MapPinTypeDrawer data={drawer?.data} /> : null}
                {drawer.type === "event_management" ? <EventManagementDrawer data={drawer?.data} /> : null}
                {drawer.type === "conversations" ? <ConversationDrawer data={drawer?.data} /> : null}
                {drawer.type === "edit_message" ? <EditMessageDrawer data={drawer?.data} /> : null}
                {drawer.type === "invite_to_project" ? <MemberAddDrawer /> : null}
                {drawer.type === "autolinker" ? <AutomentionDrawer data={drawer?.data} /> : null}
                {drawer.type === "mentioned_in_document" ? <MentionedInDocumentDrawer data={drawer?.data} /> : null}
                {drawer.type === "mentioned_in" ? <MentionedInDrawer data={drawer?.data} /> : null}
                {drawer.type === "webhooks" ? <WebhookDrawer data={drawer?.data} /> : null}
                {drawer.type === "character_filter" ? (
                  <CharacterFilterDrawer data={drawer.data} exceptions={drawer?.exceptions} />
                ) : null}
                {drawer.type === "calendar_filter" ? <CalendarFilterDrawer data={drawer.data} /> : null}
                {drawer.type === "entity_preview" ? <EntityPreviewDrawer data={drawer?.data} /> : null}
                {drawer.type === "bulk_tags" ? <BulkTagsDrawer data={drawer?.data} /> : null}
                {drawer.type === "bulk_folder" ? <BulkFolderDrawer data={drawer?.data} /> : null}
                {drawer.type === "roles" ? <RolesAndPermissionsDrawer data={drawer?.data} /> : null}
                {drawer.type === "bulk_access" ? <BulkAccessDrawer data={drawer?.data} /> : null}
                {drawer.type === "gateway_access" ? (
                  <GatewayAccessDrawer data={drawer?.data} exceptions={drawer?.exceptions} />
                ) : null}
                {drawer.type === "nodes_from_characters" || drawer.type === "nodes_from_images" ? (
                  <NodeFromDrawer data={{ type: drawer?.type }} />
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  return null;
}
