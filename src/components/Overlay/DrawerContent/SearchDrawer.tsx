import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useSearch } from "../../../hooks";
import {
  AvailableEntityType,
  AvailableSubEntityType,
  SearchableEntities,
  SearchAllEntitiesType,
  SearchResultType,
  TagType,
} from "../../../types";
import { drawerAtom, getDefaultEntityIcon, getSentenceCase, IconEnum, useNotifications } from "../../../utils";
import { SearchCategories } from "../../../utils/enums/SearchEnums";
import { getSearchLink } from "../../../utils/ui/linkUtils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select, Title } from "../../Form";
import { Tabs } from "../../Layout";
import { Alert, Badge } from "../../Misc";

const tabs = [
  { id: "1", label: "Title" },
  { id: "2", label: "Category" },
  { id: "3", label: "Tag" },
];

function isSearchDisabled(selectedTab: number, searchCategory: string | null) {
  if (selectedTab === 0) return false;
  if (selectedTab === 1 && searchCategory) return false;
  return true;
}

export function SearchDrawer() {
  const { project_id } = useParams();
  const queryClient = useQueryClient();
  const drawer = useAtomValue(drawerAtom);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchCategory, setSearchCategory] = useState<SearchableEntities | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [results, setResults] = useState<SearchAllEntitiesType | SearchResultType | null>();
  const [match, setMatch] = useState<"all" | "any">("all");
  const createNotification = useNotifications();

  const {
    data: searchByTagsData,
    refetch,
    remove,
  } = useSearch<SearchAllEntitiesType | SearchResultType | null>(
    { data: { tag_ids: selectedTags.map((tag) => tag.id), match }, limit: 100 },
    "by_tags",
    project_id as string,
    {
      enabled: false,
    },
  );

  useLayoutEffect(() => {
    return () => {
      setResults(null);
      queryClient.removeQueries({ queryKey: ["search"] });
    };
  }, [drawer, searchCategory, selectedTab]);

  useEffect(() => {
    if (selectedTags.length && selectedTab === 2) {
      const timeout = setTimeout(() => {
        refetch();
      }, 300);
      return () => clearTimeout(timeout);
    }
    remove();

    return () => {};
  }, [selectedTags, match]);

  useEffect(() => {
    if (selectedTags.length) {
      setSelectedTags([]);
    }
  }, [selectedTab]);

  return (
    <div className="flex flex-col gap-y-2 overflow-hidden">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      <div className="flex w-full items-center gap-x-2">
        {selectedTab <= 1 ? (
          <>
            <Search
              helperText={selectedTab === 0 ? "Shows the top 5 results per category." : ""}
              isAutofocused
              isDisabled={isSearchDisabled(selectedTab, searchCategory)}
              isOptionsHidden
              label="Search"
              limit={selectedTab === 0 ? 5 : 500}
              name="searchTerm"
              onChange={() => {}}
              onSearch={(res) => setResults(res)}
              placeholder="Press enter to search entites."
              searchEntity={selectedTab === 1 && searchCategory ? searchCategory : "all"}
              value={undefined}
            />
            {selectedTab === 1 ? (
              <div className="w-1/3">
                <Select
                  label="Entity"
                  name="searchCategory"
                  onChange={({ value }) => setSearchCategory(value as SearchableEntities)}
                  options={SearchCategories}
                  value={searchCategory}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex w-full flex-nowrap gap-x-2">
            <div className="flex-1">
              <Search
                isAutofocused
                label="Search"
                name="searchTerm"
                onChange={({ label, value, color }) => {
                  if ((selectedTags || [])?.some((tag) => tag.id === value)) {
                    createNotification({
                      title: "Cannot add the same tag twice.",
                      variant: "warning",
                      icon: IconEnum.info_circle,
                      timer: 3,
                    });
                    return;
                  }
                  setSelectedTags((prev) =>
                    prev.concat({
                      title: label as string,
                      id: value,
                      project_id: project_id as string,
                      color: color as string,
                    }),
                  );
                }}
                placeholder="Press enter to add tags for searching."
                searchEntity="tags"
                value={undefined}
              />
            </div>

            <div className="w-1/5">
              <Select
                label="Match"
                name="match"
                onChange={({ value }) => setMatch(value as "all" | "any")}
                options={[
                  { label: "All", value: "all" },
                  { label: "Any", value: "any" },
                ]}
                value={match}
              />
            </div>
          </div>
        )}
      </div>
      {selectedTab === 2 ? (
        <ul className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div key={tag.id} className="w-min">
              <Badge
                clearAction={() => setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id))}
                customColor={tag.color}
                label={tag.title}
              />
            </div>
          ))}
        </ul>
      ) : null}
      <ul className="flex max-h-full min-h-fit flex-col gap-y-2 overflow-y-auto">
        {results?.length || searchByTagsData?.data?.length
          ? (results || searchByTagsData?.data || []).map((item) => {
              if (!item) return null;
              if ("name" in item) {
                const { name, result } = item;
                if (result.length === 0) return null;
                return (
                  <li key={name}>
                    <Title isDrawerTitle label={getSentenceCase(name)} size="xl" />
                    <ul className="flex flex-col gap-y-2 py-1">
                      {result?.length ? (
                        result.map((result_item) => (
                          <li key={result_item.id}>
                            {"full_name" in result_item && (name === "characters" || name === "nodes") ? (
                              <EntityPreview
                                icon={IconEnum.character}
                                id={result_item.id}
                                image_id={result_item?.portrait_id}
                                link={getSearchLink(project_id as string, name, result_item.id, undefined)}
                                title={`${result_item.full_name}
                                ${
                                  "parent_title" in result_item && result_item?.parent_title
                                    ? `(${result_item.parent_title})`
                                    : ""
                                }`}
                                type={name}
                              />
                            ) : (
                              <EntityPreview
                                icon={
                                  "icon" in result_item
                                    ? result_item.icon || getDefaultEntityIcon(name)
                                    : getDefaultEntityIcon(name)
                                }
                                id={result_item.id}
                                image_id={"portrait_id" in result_item ? result_item?.portrait_id : undefined}
                                link={getSearchLink(
                                  project_id as string,
                                  name,
                                  result_item.id,
                                  "parent_id" in result_item ? result_item.parent_id : undefined,
                                )}
                                title={`${"title" in result_item ? result_item.title : ""} ${
                                  "label" in result_item ? result_item?.label || "(No label)" : ""
                                } ${
                                  "parent_title" in result_item && result_item?.parent_title
                                    ? `(${result_item.parent_title})`
                                    : ""
                                }`}
                                type={name}
                              />
                            )}
                          </li>
                        ))
                      ) : (
                        <Alert label="There is no content." variant="info" />
                      )}
                    </ul>
                  </li>
                );
              }
              return (
                <li key={item.value}>
                  {searchCategory === "characters" ? (
                    <EntityPreview
                      id={item.value}
                      image_id={item?.image}
                      link={getSearchLink(
                        project_id as string,
                        searchCategory || "",
                        item.value,
                        "parent_id" in item ? item?.parent_id : undefined,
                      )}
                      title={item.label}
                      type="characters"
                    />
                  ) : (
                    <EntityPreview
                      id={item.value}
                      image_id={item.image}
                      link={getSearchLink(
                        project_id as string,
                        searchCategory || "",
                        item.value,
                        "parent_id" in item ? item?.parent_id : undefined,
                      )}
                      title={`${item.label} ${"parent_title" in item && item?.parent_title ? `(${item.parent_title})` : ""}`}
                      type={searchCategory as AvailableEntityType | AvailableSubEntityType}
                    />
                  )}
                </li>
              );
            })
          : null}

        {Array.isArray(results) && results?.length === 0 ? <Alert label="No matching items found." /> : null}
      </ul>
    </div>
  );
}
