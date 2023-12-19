import { useGetSubEntity } from "../../../../../hooks";
import { WordType } from "../../../../../types";
import { Spinner, Tooltip } from "../../../..";

type Props = {
  title: string;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
  isPublic?: boolean;
};

export function WordMentionTooltip({ id }: Pick<Props, "id">) {
  const { data: existingWord, isLoading } = useGetSubEntity<WordType>(
    id as string,
    "words",
    {
      data: {
        id,
      },
      fields: ["id", "title", "translation", "description"],
    },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000 },
  );
  return (
    <div className="h-fit min-h-[4rem] w-fit min-w-[10rem] rounded border border-zinc-700 bg-zinc-800 p-2 shadow-lg">
      <div className="flex flex-col whitespace-pre-line font-lato font-light">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : null}
        <span className="font-merriweather text-lg italic underline">
          {existingWord?.data?.title ? `${existingWord?.data?.title}: ${existingWord?.data?.translation}` : null}
        </span>
        {existingWord?.data?.description && !isLoading ? existingWord?.data.description : null}
      </div>
    </div>
  );
}
export function WordMention({ title, id, label, isDisabledTooltip, isPublic }: Props) {
  const { data } = useGetSubEntity<WordType>(
    id as string,
    "words",
    {
      data: {
        id,
      },
      fields: ["id", "title"],
    },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );
  return (
    <Tooltip arrowColor="#3f3f46" content={<WordMentionTooltip id={id} />} isDisabled={isDisabledTooltip ?? false}>
      <span className="cursor-pointer text-sm font-light italic">
        {data?.data?.title || title || label}
        <sup>*</sup>
      </span>
    </Tooltip>
  );
}
