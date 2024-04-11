import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Table, TablePageLayout } from "../../components";
import { useGetEntity, useTable } from "../../hooks";
import { QuestionnaireType, QuestionType } from "../../types/EntityTypes/questionnaireTypes";
import { drawerAtom, IconEnum, navbarTitleAtom } from "../../utils";

const columnHelper = createColumnHelper<QuestionType>();

function getQuestionnaireColumns(questions: QuestionType[]) {
  const columns = [];

  for (let index = 0; index < questions.length; index += 1) {
    columns.push(columnHelper.display({ header: questions[index].title }));
  }
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
    relations: { questions: true },
  });

  useEffect(() => {
    if (questionnaireData?.data?.title) {
      document.title = `The Arkive | Questionnaires | ${questionnaireData?.data?.title}`;
      setNavbarTitle(`The Arkive | Questionnaires | ${questionnaireData?.data?.title}`);
    }
  }, [questionnaireData, isFetching]);
  const [{ selection }, dispatch] = useTable({ selection: {} });
  return (
    <div className="flex flex-col gap-y-2">
      <div className="ml-auto w-fit max-w-64 lg:w-64">
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
      <TablePageLayout>
        <div className="w-full flex-1 overflow-hidden">
          <Table
            columns={isLoading ? [] : getQuestionnaireColumns(questionnaireData?.data?.questions || [])}
            config={{
              hasSelect: true,
              // orderBy,
              // filters,
              selection,
            }}
            data={[]}
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
