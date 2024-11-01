import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";

import { FieldDataType, FieldTypes, GatewayConfigOptionType, HandleChangePropsType, RelatedFieldType } from "../../../types";
import { getAssetURL, getEntityFromFieldType, getEntityLink, getSingularEntityType, IconEnum, reorder } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select } from "../../Form";
import { Icon } from "../../Misc";
import { RelationFieldContainer } from "./RelationFieldContainer";
import { TemplateFieldContainer } from "./TemplateFieldContainer";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: FieldTypes;
  isCollapsible?: boolean;
  isOpen?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isGlobal?: boolean;
  isDrawer?: boolean;
  presetOptions: GatewayConfigOptionType[];
  currentValue: FieldDataType[RelatedFieldType];
  parent_id?: string | null | undefined;
};
type SingleRelatedEntityType = "character" | "blueprint_instance" | "document" | "map_pin" | "image" | "event";
function getValue(value: Props["currentValue"][number], single_entity: SingleRelatedEntityType) {
  if (single_entity === "character" && single_entity in value)
    return {
      id: value?.character?.id,
      title: value?.character?.full_name,
      project_id: value?.character?.project_id,
      image_id: value?.character?.portrait_id,
      icon: null,
      parent_id: null,
    };
  if (single_entity === "blueprint_instance" && single_entity in value)
    return {
      id: value?.blueprint_instance?.id,
      title: value?.blueprint_instance?.title,
      project_id: value?.blueprint_instance?.project_id,
      parent_id: value?.blueprint_instance?.parent_id,
      image_id: null,
      icon: value?.blueprint_instance?.icon,
    };
  if (single_entity === "document" && single_entity in value)
    return {
      id: value?.document?.id,
      title: value?.document?.title,
      project_id: value?.document?.project_id,
      parent_id: null,
      image_id: value?.document?.image_id,
      icon: value?.document?.icon,
    };
  if (single_entity === "map_pin" && single_entity in value)
    return {
      id: value?.map_pin?.id,
      title: value?.map_pin?.title,
      project_id: value?.map_pin?.project_id,
      parent_id: value?.map_pin?.parent_id,
      image_id: value?.map_pin?.image_id,
      icon: value?.map_pin?.icon,
    };
  if (single_entity === "event" && single_entity in value)
    return {
      id: value?.event?.id,
      title: value?.event?.title,
      project_id: value?.event?.project_id,
      parent_id: value?.event?.parent_id,
      image_id: null,
      icon: null,
    };
  if (single_entity === "image" && single_entity in value)
    return {
      id: value?.image?.id,
      title: value?.image?.title,
      project_id: value?.image?.project_id,
      parent_id: null,
      image_id: value?.image?.id,
      icon: null,
    };
  return {
    id: null,
    title: null,
    project_id: null,
    parent_id: null,
    image_id: null,
    icon: null,
  };
}

export function TemplateRelatedField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  isCollapsible,
  isDisabled,
  isDrawer,
  isGlobal,
  isReadOnly,
  presetOptions = [],
  parent_id,
  isOpen,
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  const entity = getEntityFromFieldType(fieldType);
  const isMultiple = fieldType.includes("_multiple");
  if (!entity) return null;
  const single_entity = getSingularEntityType(entity).toLowerCase().replace(" ", "_") as
    | "character"
    | "blueprint_instance"
    | "document"
    | "map_pin"
    | "image"
    | "event";
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <RelationFieldContainer isMultiple={isMultiple}>
        {isDisabled || IS_GATEWAY || (currentValue?.length === 1 && !isMultiple) ? null : (
          <div className="sticky top-0">
            <Search
              isDisabled={isDisabled}
              isGlobal={isGlobal}
              isMultiple={isMultiple}
              isReadOnly={isReadOnly}
              label={title}
              name={name}
              onBrowserChange={(props) => {
                const itemsToChange: { name: string; value: string | Record<string, any> }[] = props.map(
                  ({ value, label, image, icon }, index) => ({
                    name: `${name}.${entity}[${isMultiple ? index || 0 : 0}]`,
                    value: {
                      related_id: value,
                      sort: index,
                      [single_entity]:
                        single_entity === "character"
                          ? {
                              id: value,
                              full_name: label,
                              portrait_id: image,
                            }
                          : {
                              id: value,
                              title: label,
                              image: entity === "images" ? value : image,
                              icon,
                            },
                    },
                  })
                );
                itemsToChange.push({ name: `${name}.id`, value: id });
                handleChange(itemsToChange);
              }}
              onChange={({ value, label, image, icon }) => {
                if ((currentValue || [])?.some((entity) => entity.related_id === value)) {
                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.${entity}`,
                      value: (currentValue || []).filter((t) => t.related_id !== value),
                    },
                  ]);
                  return;
                }
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.${entity}[${isMultiple ? currentValue?.length || 0 : 0}]`,
                    value: {
                      related_id: value,
                      sort: currentValue.length,
                      [single_entity]:
                        single_entity === "character"
                          ? {
                              id: value,
                              full_name: label,
                              portrait_id: image,
                            }
                          : {
                              id: value,
                              title: label,
                              image: entity === "images" ? value : image,
                              icon,
                            },
                    },
                  },
                ]);
              }}
              parent_id={parent_id || undefined}
              placeholder="Type at least 2 characters"
              searchEntity={entity}
              value={isMultiple ? currentValue?.map((c) => c.related_id) : undefined}
              variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
            />
          </div>
        )}
        {currentValue?.length === 1 && !isMultiple && !IS_GATEWAY ? (
          <EntityPreview
            clearAction={
              isDisabled
                ? undefined
                : (char_id) => {
                    handleChange([
                      {
                        name: `${name}.${entity}`,
                        value: currentValue.filter((c) => c.related_id !== char_id),
                      },
                    ]);
                  }
            }
            id={currentValue?.[0].related_id}
            image_id={getValue(currentValue?.[0], single_entity)?.image_id || ""}
            label={title}
            manual_project_id={project_id}
            title={getValue(currentValue?.[0], single_entity)?.title || ""}
            type={entity}
          />
        ) : null}
        {IS_GATEWAY && !isDisabled ? (
          <Select
            isClearable
            isMultiple={isMultiple}
            isReadOnly={isReadOnly}
            label={title}
            name={name}
            onChange={({ value, label, image, icon }) => {
              if (isMultiple && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.${entity}`,
                    value: [],
                  },
                ]);
                return;
              }

              if (
                (currentValue || [])?.some((char) => {
                  if (isMultiple) {
                    return value?.includes(char.related_id);
                  }
                  return char.related_id === value;
                })
              ) {
                if (isMultiple) {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.${entity}`,
                      value: selectedValues.map((opt, index) => ({
                        related_id: opt.value,
                        sort: index,
                        [single_entity]:
                          entity === "characters"
                            ? {
                                id: opt.value,
                                full_name: opt?.label,
                                portrait_id: opt?.image,
                              }
                            : {
                                id: value,
                                title: label,
                                image,
                                icon,
                              },
                      })),
                    },
                  ]);
                  return;
                } else {
                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.${entity}[0]`,
                      value: {
                        related_id: value,
                        sort: 0,
                        [single_entity]:
                          entity === "characters"
                            ? {
                                id: value,
                                full_name: label,
                                portrait_id: image?.id,
                              }
                            : {
                                id: value,
                                title: label,
                                image: image?.id,
                                icon,
                              },
                      },
                    },
                  ]);
                }
                return;
              }
              if (isMultiple) {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.${entity}`,
                    value: selectedValues.map((opt, index) => ({
                      related_id: opt.value,
                      sort: index,
                      [single_entity]:
                        entity === "characters"
                          ? {
                              id: value,
                              full_name: label,
                              portrait_id: image?.id,
                            }
                          : {
                              id: value,
                              title: label,
                              image: image?.id,
                              icon,
                            },
                    })),
                  },
                ]);
              } else {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.${entity}`,
                    value: [
                      {
                        related_id: value,
                        sort: 0,
                        [single_entity]:
                          entity === "characters"
                            ? {
                                id: value,
                                full_name: label,
                                portrait_id: image?.id,
                              }
                            : {
                                id: value,
                                title: label,
                                image: image?.id,
                                icon,
                              },
                      },
                    ],
                  },
                ]);
              }
            }}
            options={presetOptions.map((opt) => ({
              ...opt,
              image:
                projectId && opt.image
                  ? { id: opt.image, shape: "circle", link: getAssetURL(projectId, "images", opt.image) }
                  : undefined,
            }))}
            value={!isMultiple ? currentValue?.[0]?.related_id : (currentValue || []).map((c) => c.related_id)}
            variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
          />
        ) : null}
        {isMultiple ? (
          <DragDropContext
            onDragEnd={
              isDisabled || isReadOnly
                ? () => {}
                : (result) => {
                    if (!result.destination) {
                      return;
                    }
                    const newData = reorder<{ sort: number }>(
                      currentValue || [],
                      result.source.index,
                      result.destination.index
                    );

                    handleChange([
                      {
                        name: `${name}.${entity}`,
                        value: newData.map((item, idx) => ({ ...item, sort: idx })),
                      },
                    ]);
                  }
            }>
            <Droppable droppableId={id}>
              {(providedDroppable) => (
                <div
                  className={IS_GATEWAY ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4" : "flex flex-col"}
                  {...providedDroppable.droppableProps}
                  ref={providedDroppable.innerRef}>
                  {(currentValue || [])?.map((val, index) => {
                    const entity_value = getValue(val, single_entity);
                    return (
                      <Draggable
                        key={val.related_id}
                        draggableId={val.related_id}
                        index={index}
                        isDragDisabled={isDisabled || isReadOnly}>
                        {(provided) => (
                          <div
                            className="my-1 flex w-full flex-1 items-center gap-x-0.5"
                            {...provided.draggableProps}
                            ref={provided.innerRef}>
                            <span {...provided.dragHandleProps}>
                              <Icon fontSize={20} icon={IconEnum.drag} />
                            </span>
                            <div className="w-full">
                              <EntityPreview
                                key={entity_value?.id}
                                clearAction={
                                  isDisabled || isReadOnly
                                    ? undefined
                                    : (char_id) => {
                                        handleChange([
                                          {
                                            name: `${name}.${entity}`,
                                            value: currentValue.filter((c) => c.related_id !== char_id),
                                          },
                                        ]);
                                      }
                                }
                                id={entity_value?.id || ""}
                                image_id={entity_value?.image_id}
                                link={IS_GATEWAY ? undefined : getEntityLink(projectId || "", entity, id, undefined)}
                                manual_project_id={projectId}
                                title={entity_value?.title || ""}
                                type={entity}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {providedDroppable.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : null}
      </RelationFieldContainer>
    </TemplateFieldContainer>
  );
}
