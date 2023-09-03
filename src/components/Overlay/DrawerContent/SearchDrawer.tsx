import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { SearchAllEntitiesType } from "../../../types";
import { drawerAtom, getCharacterFullName, getSentenceCase } from "../../../utils";
import { getSearchLink } from "../../../utils/ui/linkUtils";
import { CharacterPreview } from "../../DataDisplay";
import { Search, Title } from "../../Form";
import { Alert } from "../../Misc";

export function SearchDrawer() {
  const { project_id } = useParams();
  const queryClient = useQueryClient();
  const drawer = useAtomValue(drawerAtom);
  const [results, setResults] = useState<SearchAllEntitiesType | null>();
  useEffect(() => {
    return () => {
      setResults(null);
      queryClient.removeQueries({ queryKey: ["search"] });
    };
  }, [drawer]);

  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="searchTerm"
        onChange={() => {}}
        onSearch={(res) => setResults(res)}
        placeholder="Press enter to search entites"
        searchEntity="all"
        value={undefined}
      />

      <ul className="flex max-h-[65%] min-h-fit flex-col gap-y-2 overflow-y-auto">
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
