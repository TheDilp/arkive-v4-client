import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { SearchableEntities, SearchAllEntitiesType, SearchResultType } from "../../../types";
import { drawerAtom, getCharacterFullName, getSentenceCase } from "../../../utils";
import { SearchCategories } from "../../../utils/enums/SearchEnums";
import { getSearchLink } from "../../../utils/ui/linkUtils";
import { CharacterPreview, ItemPreview } from "../../DataDisplay";
import { Search, Select, Title } from "../../Form";
import { Tabs } from "../../Layout";
import { Alert } from "../../Misc";

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
  const [results, setResults] = useState<SearchAllEntitiesType | SearchResultType | null>();

  useEffect(() => {
    return () => {
      setResults(null);
      queryClient.removeQueries({ queryKey: ["search"] });
    };
  }, [drawer]);

  return (
    <div className="flex flex-col gap-y-2 overflow-hidden">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      <div className="flex w-full items-center gap-x-2">
        <Search
          isDisabled={isSearchDisabled(selectedTab, searchCategory)}
          isOptionsHidden
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
              name="searchCategory"
              onChange={({ value }) => setSearchCategory(value as SearchableEntities)}
              options={SearchCategories}
              value={searchCategory}
            />
          </div>
        ) : null}
      </div>
      <ul className="flex max-h-full min-h-fit flex-col gap-y-2 overflow-y-auto">
        {(results || []).map((item) => {
          if ("name" in item) {
            const { name, result } = item;
            return (
              <li key={name}>
                <Title isDrawerTitle label={getSentenceCase(name)} size="xl" />
                <ul className="flex flex-col gap-y-2 py-1">
                  {result?.length ? (
                    result.map((result_item) => (
                      <li key={result_item.id}>
                        <Link
                          className="transition-all hover:text-blue-400"
                          to={getSearchLink(
                            project_id as string,
                            name,
                            result_item.id,
                            "parent_id" in result_item ? result_item?.parent_id : undefined,
                          )}>
                          {"title" in result_item ? result_item.title : null}

                          {"first_name" in result_item ? (
                            <CharacterPreview
                              character_name={getCharacterFullName(result_item.first_name, undefined, result_item?.last_name)}
                              id={result_item.id}
                              image_id={result_item?.portrait_id}
                            />
                          ) : null}
                          {"label" in result_item ? result_item.label : null}
                        </Link>
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
              <Link
                className="transition-all hover:text-blue-400"
                to={getSearchLink(
                  project_id as string,
                  searchCategory || "",
                  item.value,
                  "parent_id" in item ? item?.parent_id : undefined,
                )}>
                {searchCategory === "characters" ? (
                  <CharacterPreview character_name={item.label} id={item.value} image_id={item?.image} />
                ) : (
                  <ItemPreview id={item.value} title={item.label} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
