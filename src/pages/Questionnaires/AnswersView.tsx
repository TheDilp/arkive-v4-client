import { UseMutateFunction } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useEffect } from "react";
import { useParams } from "react-router-dom";
import { deepMerge } from "remirror";

import { Avatar, Button, Checkbox, createColumnHelper, Icon, Table, TablePageLayout } from "../../components";
import {
  CharacterColumn,
  EventColumn,
  LocationColumn,
  ShowMultipleWithBadge,
} from "../../components/DataDisplay/TableComponents/TableColumns";
import { useGetEntity, useRemoveFromEntity, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType } from "../../types";
import { AnswerType, QuestionnaireType, QuestionType } from "../../types/EntityTypes/questionnaireTypes";
import { AvailableIcons, dialogAtom, drawerAtom, getImageURL, IconEnum, navbarTitleAtom } from "../../utils";

type RemoveFromQuestionnaireType = UseMutateFunction<
  any,
  unknown,
  | {
      relations: {
        [key: string]: {
          id: string;
        }[];
      };
    }
  | {
      data: {
        [key: string]: string[];
      };
    },
  unknown
>;

const centeredColumns = [
  "images_single",
  "characters_single",
  "locations_single",
  "documents_single",
  "blueprints_single",
  "events_single",
  "boolean",
];

const columnHelper = createColumnHelper<
  QuestionType & { [key: string]: AnswerType & { type: QuestionType["type"]; options: QuestionType["options"] } } & {
    project_id: string;
    portrait_id?: string | null;
    icon?: AvailableIcons | null;
    isBlueprintInstance: boolean;
  }
>();

function getQuestionnaireColumns(
  questionnaire_id: string,
  entities: {
    id: string;
    project_id: string;
    title?: string;
    full_name?: string;
    portrait_id?: string;
    icon?: string;
    type: QuestionType["type"];
  }[],
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  removeFromQuestionnaire: RemoveFromQuestionnaireType,
) {
  const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        pinned: true,
        sortable: true,
      },
      minSize: 25,
      maxSize: 25,
      size: 15,
    }),
  ];

  for (let index = 0; index < entities.length; index += 1) {
    columns.push(
      columnHelper.accessor(entities[index].id as any, {
        header: () => {
          return (
            <div className="flex max-w-full items-center gap-x-1">
              {entities[index].portrait_id ? (
                <Avatar
                  hasShowImage
                  image={getImageURL(entities[index].project_id, "images", entities[index].portrait_id)}
                  size="sm"
                />
              ) : null}
              {entities[index].icon ? (
                <Icon fontSize={28} icon={(entities[index].icon as AvailableIcons | undefined) || IconEnum.blueprint} />
              ) : null}
              <div className="max-w-36 flex-1 truncate">{entities[index].full_name || entities[index].title || ""}</div>
              <div className="flex items-center gap-x-0.5">
                <Button
                  hasNoBackground
                  icon={IconEnum.edit}
                  iconSize={16}
                  isIconOnly
                  onClick={() =>
                    setDrawer((prev) => ({
                      ...prev,
                      title: "Fill out questionnaire",
                      type: "questionnaire_answer",
                      data: {
                        id: questionnaire_id,
                        character_id: "full_name" in entities[index] ? entities[index].id : undefined,
                        blueprint_instance_id: !("full_name" in entities[index]) ? entities[index].id : undefined,
                      },
                    }))
                  }
                  tooltip="Edit"
                />

                <Button
                  hasNoBackground
                  icon={IconEnum.trash}
                  iconSize={16}
                  isIconOnly
                  onClick={() =>
                    setDialog((prev) => ({
                      ...prev,
                      title: "Remove entity from questionniare",
                      isOverlay: true,
                      confirm: {
                        icon: IconEnum.trash,
                        variant: "error",
                        action: () =>
                          removeFromQuestionnaire({
                            data: {
                              characters: "full_name" in entities[index] ? [entities[index].id] : [],
                              blueprint_instances: !("full_name" in entities[index]) ? [entities[index].id] : [],
                            },
                          }),
                      },
                      cancel: {
                        icon: IconEnum.close,
                        variant: "primary",
                        action: () => {},
                      },
                    }))
                  }
                  tooltip="Delete"
                />
              </div>
            </div>
          );
        },
        cell: ({ row }) => {
          const questionValue = row?.original[entities[index].id];
          if (row.original?.type === "text" || row.original?.type === "number") return questionValue?.value || "";
          if (row.original?.type === "boolean")
            return (
              <Checkbox
                isReadOnly
                name="bool"
                onChange={() => {}}
                value={(questionValue?.value as boolean | undefined) ?? false}
              />
            );
          if (row.original?.type === "select_single" || row.original?.type === "select_multiple") {
            return (
              (Array.isArray(questionValue?.value) ? questionValue?.value : [questionValue?.value])
                ?.map((id) => {
                  const opt = questionValue?.options?.find((o) => o.id === id);
                  return opt?.value || "";
                })
                .join(", ") ?? ""
            );
          }
          if (row.original?.type === "characters_single" || row.original?.type === "characters_multiple") {
            return <CharacterColumn characters={questionValue?.characters || []} />;
          }
          if (row.original?.type === "blueprints_single" || row.original?.type === "blueprints_multiple") {
            return (
              <ShowMultipleWithBadge titles={(questionValue?.blueprint_instances || []).map((instance) => instance.title)} />
            );
          }
          if (row.original?.type === "documents_single" || row.original?.type === "documents_multiple") {
            return <ShowMultipleWithBadge titles={(questionValue?.documents || []).map((doc) => doc.title)} />;
          }
          if (row.original?.type === "locations_single" || row.original?.type === "locations_multiple") {
            return <LocationColumn locations={questionValue?.map_pins || []} />;
          }
          if (row.original?.type === "events_single" || row.original?.type === "events_multiple") {
            return <EventColumn locations={questionValue?.events || []} />;
          }
          if (row.original?.type === "images_single" || row.original?.type === "images_multiple") {
            return (
              <div className="flex w-full">
                {questionValue?.images?.map((image) => (
                  <div key={image.id} className="-ml-4 flex items-center first:ml-0 hover:z-10">
                    <Avatar
                      hasShowImage
                      image={getImageURL(image?.project_id as string, "images", image.id)}
                      label={image.title}
                      size="sm"
                      tooltipAllowedPlacements={["left", "right"]}
                    />
                  </div>
                ))}
              </div>
            );
          }

          return null;
        },
        meta: {
          centered: centeredColumns.includes(entities[index].type),
        },
        maxSize: 20,
        minSize: 15,
      }),
    );
  }

  return columns;
}

export function AnswersView() {
  const { questionnaire_id } = useParams();
  const setNavbarTitle = useSetAtom(navbarTitleAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const {
    data: questionnaireData,
    isLoading,
    isFetching,
  } = useGetEntity<QuestionnaireType>(questionnaire_id, "questionnaires", {
    fields: ["title", "owner_id"],
    relations: { questions: true, characters: true, blueprint_instances: true },
  });

  const { mutate: removeFromQuestionnaire } = useRemoveFromEntity("questionnaires", questionnaire_id as string, "");

  useEffect(() => {
    if (questionnaireData?.data?.title) {
      document.title = `The Arkive | Questionnaires | ${questionnaireData?.data?.title}`;
      setNavbarTitle(`The Arkive | Questionnaires | ${questionnaireData?.data?.title}`);
    }
  }, [questionnaireData, isFetching]);
  const [, dispatch] = useTable({});

  const formatted = questionnaireData?.data?.questions?.map((question) => {
    const item: Record<string, any> = { title: question.title };
    for (let index = 0; index < (question?.answers?.length || 0); index += 1) {
      if (question?.answers?.[index]?.blueprint_instance_id) {
        item.is_blueprint_instance = true;
      }
      const entity_id = question?.answers?.[index]?.character_id || question?.answers?.[index]?.blueprint_instance_id;
      if (entity_id) {
        item[entity_id] = question?.answers?.[index];
      }
    }
    item.type = question.type;
    return item;
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-end gap-x-2">
        <div className="w-fit max-w-32 lg:w-32">
          <Button
            icon={IconEnum.add}
            label="Add entity"
            onClick={() => {
              setDrawer((prev) => ({
                ...prev,
                size: "lg",
                title: "Add entity to questionnaire",
                type: "questionnaire_add",
                data: { id: questionnaire_id as string },
              }));
            }}
          />
        </div>
        <div className="w-fit max-w-64 lg:w-64">
          <Button
            icon={IconEnum.edit}
            label="Edit current questionnaire"
            onClick={() => {
              setDrawer((prev) => ({
                ...prev,
                size: "lg",
                title: "Edit questionnaire",
                type: "questionnaires",
                data: { id: questionnaire_id },
              }));
            }}
          />
        </div>
      </div>
      <TablePageLayout>
        <div className="w-full flex-1 overflow-hidden">
          <Table
            columns={
              isLoading
                ? []
                : getQuestionnaireColumns(
                    questionnaire_id as string,
                    deepMerge(questionnaireData?.data?.characters || [], questionnaireData?.data?.blueprint_instances || []),
                    setDrawer,
                    setDialog,
                    removeFromQuestionnaire,
                  )
            }
            data={formatted || []}
            dispatch={dispatch}
            isLoading={isLoading}
            skeletonLimit={10}
            type="characters"
          />
        </div>
      </TablePageLayout>
    </div>
  );
}
