import { autoUpdate, useFloating, useTransitionStyles } from "@floating-ui/react";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { drawerAtom, IconEnum } from "../../utils";
import { FolderDrawer, GraphDrawer } from "..";
import { Button } from "../Form";
import {
  AutomentionDrawer,
  BlueprintDrawer,
  BlueprintInstanceDrawer,
  CalendarDrawer,
  CharacterAddDrawer,
  CharacterDrawer,
  CharacterFilterDrawer,
  CharacterRelationshipTypeDrawer,
  ConversationDrawer,
  DictionaryDrawer,
  DocumentDrawer,
  EdgeDrawer,
  EditMessageDrawer,
  EditTags,
  EntityPreviewDrawer,
  EventDrawer,
  FieldTemplateDrawer,
  ImageDrawer,
  InsertEditorImageDrawer,
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
  ProjectDrawer,
  RandomTableDrawer,
  RandomTableOptionDrawer,
  RandomTableOptionsDrawer,
  SearchDrawer,
  TagsDrawer,
  WebhookDrawer,
  WordDrawer,
} from "./DrawerContent";

const DrawerClasses = tv({
  slots: {
    base: "bg-zinc-800 absolute right-0 top-0 h-full transition-transform px-4 pb-4 z-[60] duration-500 ease-in-out max-h-full w-0",
    title:
      "font-merriweather text-white h-16 max-h-[4rem] text-2xl text-center border-b items-center border-zinc-700 mb-4 flex justify-between flex-nowrap",
  },
  variants: {
    size: {
      sm: "w-full md:w-[24rem]",
      md: "w-full md:w-[28rem]",
      lg: "w-full md:w-[32rem]",
      xl: "w-full md:w-[36rem]",
      "2xl": "w-full md:w-[40rem]",
      half: "w-full lg:w-1/2",
      full: "w-full",
    },
  },
});

export function Drawer() {
  const drawer = useAtomValue(drawerAtom);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { type, item_id } = useParams();
  const { base, title } = DrawerClasses({ size: drawer.size });

  const [isOpen, setIsOpen] = useState(!!drawer.type);
  const [renderContent, setRenderContent] = useState(false);
  const { refs, context } = useFloating({
    placement: "right",
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
  });
  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      transform: "translateX(100%)",
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
  // Close drawer if the location changes
  useEffect(() => {
    return () => {
      resetDrawerAtom();
    };
  }, [type, item_id]);

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
          <div className="w-min">
            <Button hasNoBackground icon={IconEnum.close} iconSize={22} onClick={resetDrawerAtom} />
          </div>
        </h3>
        {renderContent ? (
          <div className="flex h-[calc(100%-6rem)] w-full flex-1 flex-col gap-y-4 overflow-hidden">
            {drawer.type === "project" ? <ProjectDrawer data={drawer.data} /> : null}
            {drawer.type === "characters" ? <CharacterDrawer data={drawer.data} /> : null}
            {drawer.type === "character_fields_templates" ? <FieldTemplateDrawer data={drawer?.data} /> : null}
            {drawer.type === "folder" ? <FolderDrawer data={drawer.data} /> : null}
            {drawer.type === "documents" ? <DocumentDrawer data={drawer?.data} /> : null}
            {drawer.type === "maps" ? <MapDrawer data={drawer?.data} /> : null}
            {drawer.type === "map_pins" ? <MapPinDrawer data={drawer?.data} exceptions={drawer?.exceptions} /> : null}
            {drawer.type === "graphs" ? <GraphDrawer data={drawer?.data} /> : null}
            {drawer.type === "nodes" ? <NodeDrawer data={drawer?.data} /> : null}
            {drawer.type === "many_nodes" ? <ManyNodesDrawer data={drawer?.data} /> : null}
            {drawer.type === "edges" ? <EdgeDrawer data={drawer?.data} /> : null}
            {drawer.type === "many_edges" ? <ManyEdgesDrawer data={drawer?.data} /> : null}
            {drawer.type === "calendars" ? <CalendarDrawer data={drawer?.data} /> : null}
            {drawer.type === "blueprints" ? <BlueprintDrawer data={drawer?.data} /> : null}
            {drawer.type === "blueprint_instances" ? <BlueprintInstanceDrawer data={drawer?.data} /> : null}
            {drawer.type === "events" ? <EventDrawer data={drawer?.data} /> : null}
            {drawer.type === "dictionaries" ? <DictionaryDrawer data={drawer?.data} /> : null}
            {drawer.type === "words" ? <WordDrawer data={drawer?.data} /> : null}
            {drawer.type === "random_tables" ? <RandomTableDrawer data={drawer?.data} /> : null}
            {drawer.type === "random_table_option" ? <RandomTableOptionDrawer data={drawer?.data} /> : null}
            {drawer.type === "random_table_options" ? <RandomTableOptionsDrawer data={drawer?.data} /> : null}
            {drawer.type === "tags" ? <TagsDrawer data={drawer?.data} /> : null}
            {drawer.type === "insert_image" ? <InsertEditorImageDrawer data={drawer?.data} /> : null}
            {drawer.type === "map_pin_management" ? <MapPinManagementDrawer data={drawer?.data} /> : null}
            {drawer.type === "character_add" ? <CharacterAddDrawer data={drawer?.data} /> : null}
            {drawer.type === "search" ? <SearchDrawer /> : null}
            {drawer.type === "edit_tags" ? <EditTags data={drawer?.data || []} /> : null}
            {drawer.type === "images" ? <ImageDrawer data={drawer?.data} /> : null}
            {drawer.type === "character_relationship_types" ? <CharacterRelationshipTypeDrawer /> : null}
            {drawer.type === "map_pin_types" ? <MapPinTypeDrawer data={drawer?.data} /> : null}
            {drawer.type === "conversations" ? <ConversationDrawer data={drawer?.data} /> : null}
            {drawer.type === "edit_message" ? <EditMessageDrawer data={drawer?.data} /> : null}
            {drawer.type === "invite_to_project" ? <MemberAddDrawer /> : null}
            {drawer.type === "entity_preview" ? <EntityPreviewDrawer data={drawer?.data} /> : null}
            {drawer.type === "autolinker" ? <AutomentionDrawer data={drawer?.data} /> : null}
            {drawer.type === "mentioned_in_document" ? <MentionedInDocumentDrawer data={drawer?.data} /> : null}
            {drawer.type === "mentioned_in" ? <MentionedInDrawer data={drawer?.data} /> : null}
            {drawer.type === "webhooks" ? <WebhookDrawer data={drawer?.data} /> : null}
            {drawer.type === "character_filter" ? <CharacterFilterDrawer data={drawer.data} /> : null}
          </div>
        ) : null}
      </div>
    );
  return null;
}
