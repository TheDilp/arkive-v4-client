import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { SearchAllEntitiesType } from "../../../types";
import { drawerAtom, getCharacterFullName, getSentenceCase } from "../../../utils";
import { SearchCategories } from "../../../utils/enums/SearchEnums";
import { getSearchLink } from "../../../utils/ui/linkUtils";
import { CharacterPreview } from "../../DataDisplay";
import { Search, Select, Title } from "../../Form";
import { Tabs } from "../../Layout";
import { Alert } from "../../Misc";

const tabs = [
  { id: "1", label: "Title" },
  { id: "2", label: "Category" },
  { id: "3", label: "Tag" },
];

export function SearchDrawer() {
  const { project_id } = useParams();
  const queryClient = useQueryClient();
  const drawer = useAtomValue(drawerAtom);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchCategory, setSearchCategory] = useState<string | null>(null);
  const [results, setResults] = useState<SearchAllEntitiesType | null>();
  useEffect(() => {
    return () => {
      setResults(null);
      queryClient.removeQueries({ queryKey: ["search"] });
    };
  }, [drawer]);

  return (
    <div className="flex flex-col gap-y-2 overflow-hidden">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      <div className="flex w-full items-center">
        <Search
          name="searchTerm"
          onChange={() => {}}
          onSearch={(res) => setResults(res)}
          placeholder="Press enter to search entites."
          searchEntity="all"
          value={undefined}
        />
        div.
        <Select
          name="searchCategory"
          onChange={({ value }) => setSearchCategory(value as string)}
          options={SearchCategories}
          value={searchCategory}
        />
      </div>
      <ul className="flex max-h-full min-h-fit flex-col gap-y-2 overflow-y-auto">
        {(results || []).map(({ name, result }) => (
          <li key={name}>
            <Title isDrawerTitle label={getSentenceCase(name)} size="xl" />
            <ul className="flex flex-col gap-y-2 py-1">
              {result?.length ? (
                result.map((item) => (
                  <li key={item.id}>
                    <Link
                      className="transition-all hover:text-blue-400"
                      to={getSearchLink(
                        project_id as string,
                        name,
                        item.id,
                        "parent_id" in item ? item?.parent_id : undefined,
                      )}>
                      {"title" in item ? item.title : null}

                      {"first_name" in item ? (
                        <CharacterPreview
                          character_name={getCharacterFullName(item.first_name, undefined, item?.last_name)}
                          id={item.id}
                          image_id={item?.portrait_id}
                        />
                      ) : null}
                      {"label" in item ? item.label : null}
                    </Link>
                  </li>
                ))
              ) : (
                <Alert label="There is no content." variant="info" />
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
