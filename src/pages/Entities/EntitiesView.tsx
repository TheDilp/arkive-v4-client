import { useParams } from "react-router-dom";

import { CharactersView } from "./CharactersView";

export function EntitiesView() {
  const { type } = useParams();
  return (
    <>
      {type === "characters" ? <CharactersView /> : null}
      {/* {type === "graphs" ? <BoardsView /> : null} */}
    </>
  );
}
