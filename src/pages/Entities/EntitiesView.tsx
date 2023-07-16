import { useParams } from "react-router-dom";

import { GraphsView } from ".";
import { CharactersView } from "./CharactersView";

export function EntitiesView() {
  const { type } = useParams();
  return (
    <>
      {type === "characters" ? <CharactersView /> : null}
      {type === "graphs" ? <GraphsView /> : null}
    </>
  );
}
