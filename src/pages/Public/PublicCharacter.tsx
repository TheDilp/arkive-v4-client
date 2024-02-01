import { useLayoutEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import { Avatar, Gallery, Select, Skeleton, Tabs } from "../../components";
import { useGetEntity } from "../../hooks";
import { CharacterType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";
import { PublicCalendar } from "./PublicCalendar";
import { PublicDocument } from "./PublicDocument";
import { PublicCharacterResourceLayout, PublicCharacterResourceLinksLayout, PublicEntityLayout } from "./PublicLayout";
import { PublicMap } from "./PublicMap";

export function PublicCharacter() {
  const { project_id, item_id } = useParams();
  const { pathname } = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const {
    data: character,
    // isLoading,
    // isFetching,
  } = useGetEntity<CharacterType>(
    item_id,
    "characters",
    {
      relations: {
        character_fields: true,
        relationships: true,
        character_relationship_types: true,
        documents: true,
        locations: true,
        events: true,
        images: true,
        tags: true,
      },
      fields: ["id", "full_name", "portrait_id", "age", "is_public"],
    },
    {
      staleTime: 60 * 1000,
      isPublic: true,
    },
  );
  const tabs = [
    { id: "documents", label: "Documents", icon: IconEnum.document },
    { id: "locations", label: "Locations", icon: IconEnum.map_pin },
    { id: "events", label: "Events", icon: IconEnum.event },
    { id: "gallery", label: "Gallery", icon: IconEnum.image },
  ];

  useLayoutEffect(() => {
    if (pathname.includes("events")) {
      setSelectedTab(2);
    }
  }, [pathname]);

  if (!character?.data) return <Skeleton type="character_profile_main" />;
  if (!character?.data?.is_public) return <Navigate to={`/public/${project_id}/characters`} />;

  return (
    <PublicEntityLayout hasImage={!!character?.data?.portrait_id} title={character?.data?.full_name || ""}>
      <div className="sticky top-0 z-10 flex items-center bg-black px-2.5">
        {character?.data?.portrait_id ? (
          <div className="absolute bottom-0 ml-auto flex w-20 flex-col">
            <Avatar hasShowImage image={getImageURL(project_id as string, "images", character?.data?.portrait_id)} size="3xl" />
          </div>
        ) : null}
        <div className={`${character?.data?.portrait_id ? "ml-20" : ""} flex-1`}>
          <Tabs
            onChange={(_, idx) => {
              setSelectedTab(idx);
              navigate("./");
            }}
            selectedTab={selectedTab}
            tabs={tabs}
          />
        </div>
      </div>
      <div className="h-full">
        {tabs[selectedTab].id === "documents" ? (
          <PublicCharacterResourceLayout>
            <PublicCharacterResourceLinksLayout>
              {(character.data?.documents || []).map((d) => (
                <Link
                  key={d.id}
                  className={`flex h-10 w-full items-center truncate border-b border-zinc-700 pl-2 text-lg hover:text-blue-400 ${
                    pathname.includes(d.id) ? "text-blue-400" : ""
                  }`}
                  to={`documents/${d.id}`}>
                  <span className="rounded px-2">{d.title}</span>
                </Link>
              ))}
            </PublicCharacterResourceLinksLayout>

            <div className="lg:hidden">
              <Select
                name="douments"
                onChange={({ value }) => navigate(`./documents/${value}`)}
                options={(character?.data?.documents || []).map((d) => ({ label: d.title, value: d.id, icon: d.icon || "" }))}
                value={pathname.split("/").at(-1)}
              />
            </div>
            <div className="h-full w-full overflow-hidden bg-zinc-800 lg:max-w-[80%] lg:flex-1">
              <Routes>
                <Route element={<PublicDocument />} path="/documents/:subitem_id" />
              </Routes>
            </div>
          </PublicCharacterResourceLayout>
        ) : null}
        {tabs[selectedTab].id === "locations" ? (
          <PublicCharacterResourceLayout>
            <PublicCharacterResourceLinksLayout>
              {(character.data?.locations || []).map((l) => (
                <Link
                  key={l.id}
                  className={`flex h-10 w-full items-center truncate border-b border-zinc-700 pl-2 text-lg last:border-none hover:text-blue-400 ${
                    pathname.includes(l.map_pin_id) ? "text-blue-400" : ""
                  }`}
                  to={`locations/${l.id}/${l.map_pin_id}`}>
                  <span className="rounded px-2">{l.title}</span>
                </Link>
              ))}
            </PublicCharacterResourceLinksLayout>
            <div className="lg:hidden">
              <Select
                name="maps"
                onChange={({ value }) => navigate(`./locations/${value}`)}
                options={(character?.data?.locations || []).map((l) => ({
                  label: l.title,
                  value: `${l.id}/${l.map_pin_id}`,
                }))}
                value={pathname.split("/").slice(-2).join("/")}
              />
            </div>
            <div className="h-full w-full flex-1 bg-zinc-800">
              <Routes>
                <Route element={<PublicMap />} path="/locations/:subitem_id/:map_pin_id" />
              </Routes>
            </div>
          </PublicCharacterResourceLayout>
        ) : null}
        {tabs[selectedTab].id === "events" ? (
          <PublicCharacterResourceLayout>
            <PublicCharacterResourceLinksLayout>
              {(character.data?.events || []).map((e) => (
                <Link
                  key={e.id}
                  className={`flex h-10 w-full items-center truncate border-b border-zinc-700 pl-2 text-lg last:border-none hover:text-blue-400 ${
                    pathname.includes(e.id) ? "text-blue-400" : ""
                  }`}
                  to={`events/${e.parent_id}/${e.id}`}>
                  <span className="rounded px-2">{e.title}</span>
                </Link>
              ))}
            </PublicCharacterResourceLinksLayout>
            <div className="lg:hidden">
              <Select
                name="maps"
                onChange={({ value }) => navigate(`./events/${value}`)}
                options={(character?.data?.events || []).map((l) => ({
                  label: l.title,
                  value: `${l.parent_id}/${l.id}`,
                }))}
                value={pathname.split("/").slice(-2).join("/")}
              />
            </div>
            <div className="h-full w-full flex-1 bg-zinc-800 px-2 lg:flex-1">
              <Routes>
                <Route element={<PublicCalendar isCharacterCalendar />} path="/events/:subitem_id/:event_id" />
              </Routes>
            </div>
          </PublicCharacterResourceLayout>
        ) : null}

        {tabs[selectedTab].id === "gallery" ? (
          <div className="h-full px-2">
            <Gallery columns={6} images={character?.data?.images || []} isOpenable type="images" />
          </div>
        ) : null}
      </div>
    </PublicEntityLayout>
  );
}
