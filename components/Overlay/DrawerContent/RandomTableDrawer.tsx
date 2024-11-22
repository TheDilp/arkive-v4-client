import omit from "lodash.omit";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import { DrawerAtomType, HandleChangePropsType, TabType, UserHasPermissionsType } from "../../../types";
import { RandomTableOptionType, RandomTableType } from "../../../types/EntityTypes/randomTableTypes";
import { IconEnum, optionRelatedEntities } from "../../../utils";
import {
  InsertRandomTableSchema,
  InsertRandomTableType,
  UpdateRandomTableSchema,
  UpdateRandomTableType,
} from "../../../validation/random_tables";
import { FolderSelect } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { EntityPreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Select, Textarea } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data?: {
    id?: string;
  };
  exceptions: DrawerAtomType["exceptions"];
};

function isSaveDisabled(random_table: Partial<RandomTableType>) {
  if (!random_table.title) return true;
  if (!random_table?.random_table_options?.length) return true;
  return random_table?.random_table_options?.some((opt) => !opt.title);
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    {
      id: "2",
      label: "Options",
      icon: IconEnum.random_table,
    },
  ];
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function OptionInput({
  name,
  title,
  description,
  related_data,
  handleChange,
}: {
  name: string;
  title: string;
  description: string;
  related_data: RandomTableOptionType["related_data"];
  handleChange: (newValue: HandleChangePropsType) => void;
}) {
  return (
    <>
      <div className="flex w-full items-center gap-x-2">
        {!related_data || related_data?.type === "text" ? (
          <Input
            label="Title (required)"
            name={`${name}.title`}
            onChange={handleChange}
            value={title || ""}
            variant={title ? "primary" : "error"}
          />
        ) : null}

        {related_data && !related_data?.id && related_data?.type !== "text" ? (
          <Search
            label="Entity (required)"
            name="related_id"
            onBrowserChange={(props) => {
              const itemToChange: {
                name: string;
                value: string;
                label?: string;
                image?: string | undefined;
                icon?: string | undefined;
              } = props?.[0];

              handleChange([
                { name: `${name}.title`, value: itemToChange?.label },
                {
                  name: `${name}.related_data`,
                  value: {
                    id: itemToChange.value,
                    title: itemToChange.label,
                    icon: itemToChange?.icon,
                    image_id: itemToChange?.image,
                    type: related_data.type,
                  },
                },
              ]);

              handleChange(itemToChange);
            }}
            onChange={(e) => {
              handleChange([
                { name: `${name}.title`, value: e.label },
                {
                  name: `${name}.related_data`,
                  value: { id: e.value, title: e.label, icon: e.icon, image_id: e.image, type: related_data.type },
                },
              ]);
            }}
            searchEntity={related_data.type}
            variant={related_data.id ? "primary" : "error"}
          />
        ) : null}
        {!!related_data?.id && related_data?.type !== "text" ? (
          <div className="flex-1">
            <EntityPreview
              clearAction={() => {
                handleChange([
                  { name: `${name}.title`, value: null },
                  {
                    name: `${name}.related_data`,
                    value: { type: related_data.type },
                  },
                ]);
              }}
              icon={related_data?.icon}
              id={related_data?.id || ""}
              image_id={related_data?.image_id || null}
              label="Entity"
              title={related_data?.title || ""}
              type={related_data.type}
            />
          </div>
        ) : null}
        <div className="min-w-[33%]">
          <Select
            label="Type"
            name={`${name}.related_data.type`}
            onChange={(e) => {
              handleChange({ name: `${name}.related_data`, value: { type: e.value } });
            }}
            options={optionRelatedEntities}
            value={related_data?.type || "text"}
          />
        </div>
      </div>
      <div>
        <Textarea
          label="Description (optional)"
          name={`${name}.description`}
          onChange={handleChange}
          value={description || ""}
        />
      </div>
    </>
  );
}

export function RandomTableDrawer({ data, exceptions }: Props) {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [areAllOpen, setAreAllOpen] = useState(false);
  const resetDrawerAtom = useToggledResetAtom();

  const { data: existingRandomTable, isInitialLoading } = useGetEntity<RandomTableType>(
    data?.id,
    "random_tables",
    {
      data: { project_id },
      relations: {
        random_table_options: true,
      },
      permissions: true,
      fields: ["id", "title", "description", "icon", "is_public"],
    },
    { enabled: !!data?.id, queryKeyConcat: ["drawer"] }
  );
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertRandomTableType>("random_tables");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateRandomTableType>(
    "random_tables",
    project_id as string
  );

  const [randomTable, setRandomTable] = useState<Partial<RandomTableType> & { project_id: string }>(
    existingRandomTable?.data || { project_id: project_id as string, parent_id: exceptions?.globalCreate ? null : item_id }
  );

  const { changedData, handleChange } = useHandleChange({ data: randomTable, setData: setRandomTable });

  const permissions = useHasPermissions(
    ["read_random_tables", "create_random_tables", "update_random_tables"],
    randomTable?.owner_id
  );
  const tabs = getTabs(permissions, data?.id);

  useLayoutEffect(() => {
    if (existingRandomTable?.data && !randomTable?.title) {
      setRandomTable(existingRandomTable?.data);
    }
  }, [existingRandomTable]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="w-full">
            <Input
              label="Random table title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Eg. Character classes"
              value={randomTable?.title || ""}
              variant={randomTable?.title ? "primary" : "error"}
            />
          </div>
          <div className="w-full">
            <Textarea
              label="Random table description (optional)"
              name="description"
              onChange={handleChange}
              value={randomTable?.description || ""}
            />
          </div>
          <FolderSelect handleChange={handleChange} parent_id={randomTable?.parent_id ?? null} type="random_tables" />
          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={randomTable?.is_public ?? false} />
          </div>
        </>
      ) : null}

      {tabs[selectedTab].id === "2" ? (
        <>
          <div className="flex w-full items-center justify-between">
            <span>Insert new option:</span>
            <div className="flex flex-nowrap gap-x-2">
              <div className="h-8 w-8">
                <Button
                  icon={IconEnum.add}
                  onClick={() =>
                    handleChange({
                      name: "random_table_options",
                      value: (randomTable?.random_table_options || []).concat({
                        id: crypto.randomUUID(),
                        title: "New option",
                        description: "",
                        parent_id: randomTable.id,
                      } as RandomTableOptionType),
                    })
                  }
                  variant="info"
                />
              </div>
              <div className="h-8 w-8">
                <Button
                  icon={areAllOpen ? IconEnum.chevron_down : IconEnum.chevron_up}
                  isDisabled={isInitialLoading}
                  onClick={() => setAreAllOpen((prev) => !prev)}
                  tooltip={"Open/Close all"}
                  variant="info"
                />
              </div>
            </div>
          </div>
          <div className="flex max-h-full flex-col gap-y-2 overflow-y-auto">
            {randomTable.random_table_options?.map((option, optionIndex) => (
              <Collapsible
                key={option.id}
                actions={[
                  {
                    icon: IconEnum.trash,
                    variant: "error",
                    onClick: () => {
                      handleChange({
                        name: "random_table_options",
                        value: randomTable.random_table_options?.filter((opt) => opt.id !== option.id),
                      });
                    },
                    isIconOnly: true,
                    hasNoBackground: true,
                  },
                ]}
                initialOpen={areAllOpen}
                label={option.title}
                variant={option?.title ? "primary" : "error"}>
                <div className="flex flex-col gap-y-2 p-2">
                  <OptionInput
                    description={option?.description || ""}
                    handleChange={handleChange}
                    name={`random_table_options[${optionIndex}]`}
                    related_data={option?.related_data}
                    title={option.title}
                  />
                </div>
              </Collapsible>
            ))}
          </div>
        </>
      ) : null}

      {tabs[selectedTab].id === "3" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          permissions={randomTable?.permissions || []}
          related_id={randomTable?.id || null}
          selectablePermissions={["read_random_tables", "update_random_tables", "delete_random_tables"]}
        />
      ) : null}
      <div>
        <Button
          icon={randomTable?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(randomTable) || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={randomTable?.id ? "Save" : "Create"}
          onClick={async () => {
            if (changedData) {
              if (randomTable?.id) {
                const parsed = UpdateRandomTableSchema.parse({
                  data: randomTable,
                  relations: {
                    random_table_options: (randomTable?.random_table_options || [])?.map((opt) => {
                      const temp = omit(opt, "related_data");
                      if (opt.related_data?.type === "characters") temp.character_id = opt.related_data.id;
                      else if (opt.related_data?.type === "blueprint_instances")
                        temp.blueprint_instance_id = opt.related_data.id;
                      else if (opt.related_data?.type === "documents") temp.document_id = opt.related_data.id;
                      else if (opt.related_data?.type === "maps") temp.map_id = opt.related_data.id;
                      else if (opt.related_data?.type === "map_pins") temp.map_pin_id = opt.related_data.id;
                      else if (opt.related_data?.type === "graphs") temp.graph_id = opt.related_data.id;
                      else if (opt.related_data?.type === "events") temp.event_id = opt.related_data.id;
                      else if (opt.related_data?.type === "words") temp.word_id = opt.related_data.id;
                      else if (opt.related_data?.type === "images") temp.image_id = opt.related_data.id;

                      return { data: temp };
                    }),
                  },
                  permissions: randomTable.permissions,
                });
                await update(parsed, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              } else {
                const parsed = InsertRandomTableSchema.parse({
                  data: randomTable,
                  relations: {
                    random_table_options: (randomTable?.random_table_options || [])?.map((opt) => {
                      const temp = omit(opt, "related_data");
                      if (opt.related_data?.type === "characters") temp.character_id = opt.related_data.id;
                      else if (opt.related_data?.type === "blueprint_instances")
                        temp.blueprint_instance_id = opt.related_data.id;
                      else if (opt.related_data?.type === "documents") temp.document_id = opt.related_data.id;
                      else if (opt.related_data?.type === "maps") temp.map_id = opt.related_data.id;
                      else if (opt.related_data?.type === "map_pins") temp.map_pin_id = opt.related_data.id;
                      else if (opt.related_data?.type === "graphs") temp.graph_id = opt.related_data.id;
                      else if (opt.related_data?.type === "events") temp.event_id = opt.related_data.id;
                      else if (opt.related_data?.type === "words") temp.word_id = opt.related_data.id;
                      else if (opt.related_data?.type === "images") temp.image_id = opt.related_data.id;

                      return { data: temp };
                    }),
                  },
                  permissions: randomTable.permissions,
                });
                await create(parsed, {
                  onSuccess: (res) => {
                    if (res?.ok) {
                      resetDrawerAtom();
                      setRandomTable({
                        project_id: project_id as string,
                        parent_id: exceptions?.globalCreate ? null : item_id,
                      });
                    }
                  },
                });
              }
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
