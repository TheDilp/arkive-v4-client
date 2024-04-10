import { SetStateAction } from "jotai";
import ls from "localstorage-slim";
import { Dispatch } from "react";

import { DrawerAtomType, SidebarItemType } from "../../types";
import { IconEnum } from "./IconEnums";

export function getProjectsViewNavItems(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setView: Dispatch<SetStateAction<boolean | null>>,
  view: boolean | null,
): SidebarItemType[] {
  return [
    {
      icon: IconEnum.add,
      tooltip: "Create project",
      navigate: "#",

      onClick: () =>
        setDrawer((prev: DrawerAtomType) => ({
          ...prev,
          type: "project",
          title: "Create new project",
          data: null,
        })),
    },
    {
      icon: IconEnum.questionnaires,
      tooltip: "Questionnaires",
      navigate: "../../questionnaires",
    },
    {
      icon: view ? IconEnum.table : IconEnum.card,
      tooltip: "Change view",
      navigate: "#",
      onClick: () => {
        setView((prev) => {
          ls.set("projects_view", !prev);
          return !prev;
        });
      },
    },
    {
      icon: IconEnum.user_settings,
      tooltip: "User settings",
      navigate: "/user_settings/webhooks",
    },
  ];
}

export function getQuestionnairesViewNavItems(setDrawer: Dispatch<SetStateAction<DrawerAtomType>>): SidebarItemType[] {
  return [
    {
      icon: IconEnum.add,
      tooltip: "Create questionnaire",
      navigate: "#",

      onClick: () =>
        setDrawer((prev: DrawerAtomType) => ({
          ...prev,
          type: "questionnaires",
          title: "Create new questionnaire",
          data: {},
          size: "lg",
        })),
    },
    {
      icon: IconEnum.project,
      tooltip: "Projects",
      navigate: "../../projects",
    },
    {
      icon: IconEnum.user_settings,
      tooltip: "User settings",
      navigate: "/user_settings/webhooks",
    },
  ];
}

export const projectNavItems: SidebarItemType[] = [
  { icon: IconEnum.character, navigate: "characters", tooltip: "Characters" },
  { icon: IconEnum.blueprint, navigate: "blueprints", tooltip: "Blueprints" },
  { icon: IconEnum.document, navigate: "documents", tooltip: "Documents" },
  { icon: IconEnum.map, navigate: "maps", tooltip: "Maps" },
  { icon: IconEnum.graph, navigate: "graphs", tooltip: "Graphs" },
  { icon: IconEnum.calendar, navigate: "calendars", tooltip: "Calendars" },
  // { icon: IconEnum.timeline, navigate: "timelines", tooltip: "Timelines" },
  // { icon: IconEnum.screen, navigate: "screens", tooltip: "Screens" },
  { icon: IconEnum.dictionary, navigate: "dictionaries", tooltip: "Dictionaries" },
  { icon: IconEnum.random_table, navigate: "random_tables", tooltip: "Random tables" },
  { icon: IconEnum.tags, navigate: "tags", tooltip: "Tags" },
  { icon: IconEnum.additional_fields, navigate: "character_fields_templates", tooltip: "Character field templates" },
  { icon: IconEnum.image, navigate: "assets", tooltip: "Assets" },
  { icon: IconEnum.settings, navigate: "settings", tooltip: "Settings" },
];

export const projectCardNavItems = projectNavItems.slice(0, -1);
