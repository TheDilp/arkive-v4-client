import { MutableRefObject, useEffect, useRef } from "react";

import { useGetSubEntity } from "../../../../../hooks";
import { WordType } from "../../../../../types";
import { Spinner, Tooltip } from "../../../..";

type Props = {
  title: string;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
};

function WordMentionTooltip({ id }: Pick<Props, "id">) {
  const { data: existingWord, isLoading } = useGetSubEntity<WordType>(
    id as string,
    "words",
    {
      data: {
        id,
      },
      fields: ["id", "title", "translation", "description"],
    },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], retry: false, staleTime: 5 * 60 * 1000 }
  );
  return (
    <div className="h-fit min-h-[4rem] w-fit min-w-[10rem] rounded border border-zinc-600 bg-zinc-700 p-2 shadow-lg">
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
export function WordMention({ title, id, label, isDisabledTooltip }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isFetched, isPaused, refetch } = useGetSubEntity<WordType>(
    id as string,
    "words",
    {
      data: {
        id,
      },
      fields: ["id", "title"],
    },
    { enabled: false, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false }
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!!id && !data && entry.isIntersecting) refetch();
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1, // 100% of target visible
      }
    );

    if (mentionRef.current) {
      observer.observe(mentionRef.current);
    }

    return () => {
      if (mentionRef.current) {
        observer.unobserve(mentionRef.current);
      }
    };
  }, []);

  if (id) {
    if (!data?.data && !isPaused && isFetched)
      return (
        <span ref={mentionRef} className="font-lato">
          {label}
        </span>
      );
    if (IS_PUBLIC && data?.data?.is_public) return <span ref={mentionRef}>{label}</span>;
    if (!data)
      return (
        <span ref={mentionRef} className="font-lato underline decoration-wavy">
          {label}
        </span>
      );

    return (
      <Tooltip arrowColor="#3f3f46" content={<WordMentionTooltip id={id} />} isDisabled={isDisabledTooltip ?? false}>
        <span ref={mentionRef} className="cursor-pointer text-base font-light italic leading-4">
          {data?.data?.title || title || label}
          <sup>*</sup>
        </span>
      </Tooltip>
    );
  }
}
