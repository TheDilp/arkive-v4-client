import { UseMutateFunction } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useEffect } from "react";
import { useParams } from "react-router-dom";
import { deepMerge } from "remirror";

import { Avatar, Button, Checkbox, createColumnHelper, Dropdown, Icon, Table, TablePageLayout } from "../../components";
import {
  CharacterColumn,
  EventColumn,
  LocationColumn,
  ShowMultipleWithBadge,
} from "../../components/DataDisplay/TableComponents/TableColumns";
import { useGetEntity, useRemoveFromEntity, useTable } from "../../hooks";
import { DrawerAtomType } from "../../types";
import { AnswerType, QuestionnaireType, QuestionType } from "../../types/EntityTypes/questionnaireTypes";
import { AvailableIcons, drawerAtom, getImageURL, getQuestionColumnWidth, IconEnum, navbarTitleAtom } from "../../utils";

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
  }
>();

function getQuestionnaireColumns(
  questionnaire_id: string,
  questions: QuestionType[],
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  removeFromQuestionnaire: RemoveFromQuestionnaireType,
) {
  const columns: ColumnDef<any, any>[] = [
    columnHelper.display({
      id: "portrait_id",
      header: "",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          {row.original.portrait_id ? (
            <Avatar hasShowImage image={getImageURL(row.original.project_id, "images", row.original.portrait_id)} size="sm" />
          ) : (
            <Icon fontSize={28} icon={row.original.icon || IconEnum.blueprint} />
          )}
        </div>
      ),
      meta: {
        pinned: true,
        noLink: true,
        centered: true,
      },
      minSize: 4,
      maxSize: 4,
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        pinned: true,
        sortable: true,
      },
      minSize: 12,
      size: 12,
    }),
  ];

  for (let index = 0; index < questions.length; index += 1) {
    const { minSize, maxSize } = getQuestionColumnWidth(questions[index]?.type || "text");

    columns.push(
      columnHelper.accessor(questions[index].id as any, {
        header: questions[index].title,
        cell: ({ row }) => {
          const questionValue = row?.original[questions[index].id];

          if (questionValue?.type === "text" || questionValue?.type === "number") return questionValue?.value || "";
          if (questionValue?.type === "boolean")
            return (
              <Checkbox
                isReadOnly
                name="bool"
                onChange={() => {}}
                value={(questionValue?.value as boolean | undefined) ?? false}
              />
            );
          if (questionValue?.type === "select_single" || questionValue?.type === "select_multiple") {
            return (
              (Array.isArray(questionValue?.value) ? questionValue?.value : [questionValue?.value])
                ?.map((id) => {
                  const opt = questionValue?.options?.find((o) => o.id === id);
                  return opt?.value || "";
                })
                .join(", ") ?? ""
            );
          }
          if (questionValue?.type === "characters_single" || questionValue?.type === "characters_multiple") {
            return <CharacterColumn characters={questionValue?.characters || []} />;
          }
          if (questionValue?.type === "blueprints_single" || questionValue?.type === "blueprints_multiple") {
            return (
              <ShowMultipleWithBadge titles={(questionValue?.blueprint_instances || []).map((instance) => instance.title)} />
            );
          }
          if (questionValue?.type === "documents_single" || questionValue?.type === "documents_multiple") {
            return <ShowMultipleWithBadge titles={(questionValue?.documents || []).map((doc) => doc.title)} />;
          }
          if (questionValue?.type === "locations_single" || questionValue?.type === "locations_multiple") {
            return <LocationColumn locations={questionValue?.map_pins || []} />;
          }
          if (questionValue?.type === "events_single" || questionValue?.type === "events_multiple") {
            return <EventColumn locations={questionValue?.events || []} />;
          }
          if (questionValue?.type === "images_single" || questionValue?.type === "images_multiple") {
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
          centered: centeredColumns.includes(questions[index].type),
        },
        minSize,
        maxSize,
      }),
    );
  }
  columns.push(
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 5,
      maxSize: 5,
      minSize: 5,
      meta: { centered: true, noLink: true },
      cell: ({ row }) => (
        <Dropdown
          allowedPlacements={["left", "left-end", "left-start"]}
          items={[
            {
              id: "1",
              title: "Fill out questionnaire",
              icon: IconEnum.check_circle,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Fill out questionnaire",
                  type: "questionnaire_answer",
                  data: {
                    id: questionnaire_id,
                    character_id: "full_name" in row.original ? row.original.id : undefined,
                    blueprint_instance_id: "icon" in row.original ? row.original.id : undefined,
                  },
                })),
            },
            {
              id: "2",
              title: "Delete",
              icon: IconEnum.trash,
              onClick: () =>
                removeFromQuestionnaire({
                  data: {
                    characters: "full_name" in row.original ? [row.original.id] : [],
                    blueprint_instances: "icon" in row.original ? [row.original.id] : [],
                  },
                }),
            },
          ]}>
          <div>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} isIconOnly onClick={undefined} />
          </div>
        </Dropdown>
      ),
    }),
  );
  return columns;
}

export function AnswersView() {
  const { questionnaire_id } = useParams();
  const setNavbarTitle = useSetAtom(navbarTitleAtom);
  const setDrawer = useSetAtom(drawerAtom);
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
  const [{ selection }, dispatch] = useTable({ selection: {} });

  const formatted = (
    deepMerge(questionnaireData?.data?.characters || [], questionnaireData?.data?.blueprint_instances || []) as
      | QuestionnaireType["characters"]
      | QuestionnaireType["blueprint_instances"]
  ).map((item) => {
    const answers: Record<string, any> = {};
    for (let index = 0; index < item.answers.length; index += 1) {
      const question = questionnaireData?.data?.questions.find((q) => q.id === item.answers[index].parent_id);
      if (question) {
        answers[item.answers[index].parent_id] = item.answers[index];
        answers[item.answers[index].parent_id].type = question.type;
      }
    }

    return {
      id: item.id,
      title: "full_name" in item ? item.full_name : item.title,
      project_id: item.project_id,
      portrait_id: "portrait_id" in item ? item.portrait_id : null,
      icon: "icon" in item ? item.icon : null,
      ...answers,
    };
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
                    questionnaireData?.data?.questions || [],
                    setDrawer,
                    removeFromQuestionnaire,
                  )
            }
            config={{
              hasSelect: true,
              selection,
            }}
            data={formatted}
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
