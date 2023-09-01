import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { MutableRefObject, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { drawerAtom, IconEnum } from "../../utils";
import { FolderDrawer, GraphDrawer } from "..";
import { Button } from "../Form";
import {
  CharacterAddDrawer,
  CharacterDrawer,
  DocumentDrawer,
  EdgeDrawer,
  FieldTemplateDrawer,
  InsertEditorImageDrawer,
  MapDrawer,
  MapPinDrawer,
  MapPinManagementDrawer,
  NodeDrawer,
  ProjectDrawer,
  RandomTableDrawer,
  RandomTableOptionDrawer,
  RandomTableOptionsDrawer,
  TagsDrawer,
} from "./DrawerContent";

const DrawerClasses = tv({
  slots: {
    base: "bg-zinc-800 absolute right-0 top-0 h-full transition-transform px-4 pb-4 z-50 duration-300 ease-in-out max-h-full",
    title:
      "font-merriweather text-white h-16 max-h-[4rem] text-2xl text-center border-b items-center border-zinc-700 mb-4 flex justify-between flex-nowrap",
  },
  variants: {
    size: {
      sm: "w-full md:w-[24rem]",
      md: "w-full md:w-[28rem]",
      lg: "w-full md:w-[32rem]",
    },
    isOpen: {
      true: "translate-x-0 animate-drawer",
      false: "translate-x-full",
    },
  },
});

// const DrawerRandomTableContent = lazy(() => import("./DrawerContent/DrawerRandomTableContent"));
// const DrawerRandomTableOptionContent = lazy(() => import("./DrawerContent/DrawerRandomTableOption"));
// const DrawerBoardContent = lazy(() => import("./DrawerContent/DrawerBoardContent"));
// const DrawerBulkBoardEdit = lazy(() => import("./DrawerContent/DrawerBulkBoardEdit"));
// const DrawerCardContent = lazy(() => import("./DrawerContent/DrawerCardContent"));
// const DrawerDictionaryContent = lazy(() => import("./DrawerContent/DrawerDictionaryContent"));
// const DrawerDocumentContent = lazy(() => import("./DrawerContent/DrawerDocumentContent"));
// const DrawerEdgeContent = lazy(() => import("./DrawerContent/DrawerEdgeContent"));
// const DrawerFromTemplateContent = lazy(() => import("./DrawerContent/DrawerFromTemplateContent"));
// const DrawerFullSearch = lazy(() => import("./DrawerContent/DrawerFullSearch"));
// const DrawerMapContent = lazy(() => import("./DrawerContent/DrawerMapContent"));
// const DrawerMapPinContent = lazy(() => import("./DrawerContent/DrawerMapPinContent"));
// const DrawerMentionContent = lazy(() => import("./DrawerContent/DrawerMentionContent"));
// const DrawerNodeContent = lazy(() => import("./DrawerContent/DrawerNodeContent"));
// const DrawerScreensContent = lazy(() => import("./DrawerContent/DrawerScreensContent"));
// const DrawerSectionContent = lazy(() => import("./DrawerContent/DrawerSectionContent"));
// const DrawerWordContent = lazy(() => import("./DrawerContent/DrawerWordContent"));
// const DrawerInsertWord = lazy(() => import("./DrawerContent/DrawerInsertWord"));
// const DrawerCalendarContent = lazy(() => import("./DrawerContent/DrawerCalendarContent"));
// const DrawerTimelineContent = lazy(() => import("./DrawerContent/DrawerTimelineContent"));
// const DrawerEraContent = lazy(() => import("./DrawerContent/DrawerEraContent"));
// const DrawerMonthContent = lazy(() => import("./DrawerContent/DrawerMonthContent"));
// const DrawerEventContent = lazy(() => import("./DrawerContent/DrawerEventContent"));
// const DrawerEventDescription = lazy(() => import("./DrawerContent/DrawerEventDescription"));
// const DrawerSwatchContent = lazy(() => import("./DrawerContent/DrawerSwatchContent"));
// const DrawerContentPreview = lazy(() => import("./DrawerContent/DrawerContentPreview"));

export function Drawer() {
  const drawer = useAtomValue(drawerAtom);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { type, item_id } = useParams();
  const { base, title } = DrawerClasses({ size: drawer.size, isOpen: !!drawer.data });
  const drawerRef = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    return () => {
      resetDrawerAtom();
    };
  }, [type, item_id]);
  /* {drawer.type === "documents" && !drawer.exceptions?.fromTemplate ? <DrawerDocumentContent /> : null}
        {drawer.type === "documents" && drawer.exceptions?.fromTemplate ? <DrawerFromTemplateContent /> : null}
        {drawer.type === "maps" ? <DrawerMapContent /> : null}
        {drawer.type === "map_pins" ? <DrawerMapPinContent /> : null}
        {drawer.type === "boards" ? <DrawerBoardContent /> : null}
        {drawer.type === "nodes" ? <DrawerNodeContent /> : null}
        {drawer.type === "edges" ? <DrawerEdgeContent /> : null}
        {drawer.type === "many_nodes" || drawer.type === "many_edges" ? <DrawerBulkBoardEdit /> : null}
        {drawer.type === "full_search" ? <DrawerFullSearch /> : null}
        {drawer.type === "mention" ? <DrawerMentionContent /> : null}
        {drawer.type === "screens" ? <DrawerScreensContent /> : null}
        {drawer.type === "sections" ? <DrawerSectionContent /> : null}
        {drawer.type === "cards" ? <DrawerCardContent /> : null}
        {drawer.type === "dictionaries" ? <DrawerDictionaryContent /> : null}
        {drawer.type === "words" ? <DrawerWordContent /> : null}
        {drawer.type === "insert_word" ? <DrawerInsertWord /> : null}
        {drawer.type === "calendars" ? <DrawerCalendarContent /> : null}
        {drawer.type === "eras" ? <DrawerEraContent /> : null}
        {drawer.type === "months" ? <DrawerMonthContent /> : null}
        {drawer.type === "events" && !drawer.exceptions?.eventDescription ? <DrawerEventContent /> : null}
        {drawer.type === "events" && drawer.exceptions?.eventDescription ? <DrawerEventDescription /> : null}
        {drawer.type === "timelines" ? <DrawerTimelineContent /> : null}
        {drawer.type === "randomtables" ? <DrawerRandomTableContent /> : null}
        {drawer.type === "randomtableoptions" ? <DrawerRandomTableOptionContent /> : null}
        {drawer.type === "swatches" ? <DrawerSwatchContent /> : null}
        {drawer.type === "content_preview" ? <DrawerContentPreview type={drawer?.data?.type} /> : null}
        {drawer.type === "roles" ? <DrawerRolesContent /> : null} */
  return (
    <div ref={drawerRef} className={base()}>
      <h3 className={title()}>
        <span className="truncate">{drawer.title}</span>
        <div className="w-min">
          <Button hasNoBackground icon={IconEnum.close} iconSize={22} onClick={resetDrawerAtom} />
        </div>
      </h3>
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
        {drawer.type === "edges" ? <EdgeDrawer data={drawer?.data} /> : null}
        {drawer.type === "random_tables" ? <RandomTableDrawer data={drawer?.data} /> : null}
        {drawer.type === "random_table_option" ? <RandomTableOptionDrawer data={drawer?.data} /> : null}
        {drawer.type === "random_table_options" ? <RandomTableOptionsDrawer data={drawer?.data} /> : null}
        {drawer.type === "tags" ? <TagsDrawer data={drawer?.data} /> : null}
        {drawer.type === "insert_image" ? <InsertEditorImageDrawer getContext={drawer?.data?.getContext} /> : null}
        {drawer.type === "map_pin_management" ? <MapPinManagementDrawer data={drawer?.data} /> : null}
        {drawer.type === "character_add" ? <CharacterAddDrawer data={drawer?.data} /> : null}
      </div>
    </div>
  );
}
