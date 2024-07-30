import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { DiceRollType, NotificationType } from "../../types";
import { getImageURL, IconEnum, notificationsAtom, removeNotification } from "../../utils";
import { getCritColor } from "../../utils/ui/diceRollerUtils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

const NotificationClasses = tv({
  slots: {
    base: "flex flex-col overflow-hidden pointer-events-auto w-fit max-w-[30rem] relative items-center border-zinc-800 box-border rounded-lg bg-zinc-700 py-4 px-2 text-white shadow duration-300 ease-out",
    titleContainer: "text-sm font-normal truncate h-fit text-center flex items-center gap-x-2 max-w-[25rem] justify-between ",
    title: "text-base truncate",
    description: "text-center text-sm mt-1 flex-1",
    iconContainer: "flex items-center justify-center rounded w-8 h-8 ml-1 min-h-[2rem] min-w-[2rem]",
    userImage: "absolute top-8 left-6",
    progress: "absolute left-0 top-0 h-1 transition-all",
  },
  variants: {
    variant: {
      primary: {
        progress: "bg-white",
      },
      secondary: {
        progress: "bg-zinc-400",
      },
      info: {
        iconContainer: "bg-blue-600",
        progress: "bg-blue-600",
      },
      success: {
        iconContainer: "bg-green-600",
        progress: "bg-green-600",
      },
      warning: {
        iconContainer: "bg-orange-600",
        progress: "bg-orange-600",
      },
      error: {
        iconContainer: "bg-red-600",
        progress: "bg-red-600",
      },
      "primary-bordered": {},
      "secondary-bordered": {},
      "info-bordered": {},
      "success-bordered": {},
      "warning-bordered": {},
      "error-bordered": {},
    },
    position: {
      top: {
        base: "animate-in slide-in-from-top-10 mx-auto top-2",
      },
      "top-right": {
        base: "animate-in slide-in-from-right-10 ml-auto mr-2 top-2",
      },
      center: {
        base: "animate-in zoom-in m-auto",
      },
    },

    hasTitleBorder: {
      true: {
        titleContainer: "border-b border-zinc-600 pb-2",
        title: "text-xl",
      },
    },
    hasNoTruncate: {
      true: {
        title: "overflow-visible whitespace-normal",
      },
    },
    hasUserImage: {
      true: {},
      false: {},
    },
    hasEntityImage: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      hasUserImage: true,
      hasEntityImage: true,
      class: {
        iconContainer: "bg-transparent",
      },
    },
    {
      hasUserImage: true,
      hasEntityImage: false,
      class: {
        iconContainer: "rounded",
      },
    },
  ],
});

function DiceRollNotification({ id, data }: { id: string; data: DiceRollType }) {
  const setNotificationAtom = useSetAtom(notificationsAtom);
  return (
    <div className="max-w-full">
      <div className="flex max-w-full flex-nowrap items-center gap-x-2">
        <div className="max-w-full truncate">
          {(data?.dice || data?.rolls?.filter((die) => !die.drop) || []).map((die, idx) => {
            if ("rolls" in die) {
              if (die?.rolls?.length) {
                return die.rolls
                  .filter((r) => !r.drop)
                  .map((roll, rIdx) => (
                    <span key={crypto.randomUUID()}>
                      {idx > 0 && rIdx === 0 ? <span>{data?.ops?.[idx - 1]}</span> : null}
                      {rIdx > 0 ? <span>+</span> : null}
                      <span className={getCritColor(roll.critical)}>{roll.value.toString()}</span>
                    </span>
                  ));
              }
              return (
                <span key={crypto.randomUUID()}>
                  {data?.ops?.[idx - 1] || "+"}
                  <span className={getCritColor(die.critical)}>{die.value}</span>
                </span>
              );
            }

            if (data?.ops?.[idx - 1]) {
              if (!die?.drop)
                return (
                  <span key={crypto.randomUUID()}>
                    {data?.ops?.[idx - 1] || "+"}
                    <span className={getCritColor(die.critical)}>{die.value}</span>
                  </span>
                );
              return "";
            }
            if (!die?.drop)
              return (
                <span key={crypto.randomUUID()}>
                  {idx === 0 ? "" : "+"}
                  <span className={getCritColor(die.critical)}>{die.value.toString()}</span>
                </span>
              );
            return "";
          })}
        </div>
        <div className="w-min">
          <Button hasNoBackground icon={IconEnum.close} onClick={() => removeNotification(setNotificationAtom, id)} />
        </div>
      </div>

      <span className="flex items-center justify-center">
        <span className="text-2xl font-bold">= {data.value}</span>
      </span>
    </div>
  );
}

export function Notification({
  id,
  title,
  description,
  timer = 3,
  icon,
  image_id,
  image_url,
  variant = "primary",
  actions,
  position = "top-right",
  hasTitleBorder,
  hasNoTruncate,
  type,
  data,
}: NotificationType) {
  const { project_id } = useParams();
  const setNotificationAtom = useSetAtom(notificationsAtom);
  const [timeRemaining, setTimeRemaining] = useState<boolean>(true);
  useEffect(() => {
    if (timer) {
      setTimeout(
        () => {
          removeNotification(setNotificationAtom, id);
        },
        timer * 1000 + 250
      );
      const timeout2 = setTimeout(() => {
        setTimeRemaining(false);
      }, 100);
      return () => {
        clearTimeout(timeout2);
      };
    }
    return () => {};
  }, []);

  const {
    base,
    titleContainer,
    title: titleClasses,
    description: descriptionClasses,
    progress,
    userImage,
    iconContainer,
  } = NotificationClasses({
    variant,
    position,
    hasTitleBorder,
    hasNoTruncate,
    hasUserImage: !!image_url,
    hasEntityImage: !!image_id,
  });
  return (
    <div className={base()} role="alert">
      <div
        className={progress()}
        style={{
          width: `${timeRemaining ? 100 : 0}%`,
          transition: `width ${timer}s linear`,
        }}
      />
      {!type ? (
        <div className="flex w-fit flex-col items-center justify-between">
          <div className={titleContainer()}>
            {icon && !image_id ? (
              <div className={iconContainer()}>
                <Icon fontSize={22} icon={icon} />
              </div>
            ) : null}
            {image_id ? (
              <div className={iconContainer()}>
                <Avatar image={getImageURL(project_id as string, "images", image_id)} />
              </div>
            ) : null}
            {image_url ? (
              <div className={userImage()}>
                <Avatar image={image_url} size="xs" />
              </div>
            ) : null}
            <div className={titleClasses()}>{title}</div>
            <div className="w-8">
              <Button hasNoBackground icon={IconEnum.close} onClick={() => removeNotification(setNotificationAtom, id)} />
            </div>
          </div>
          {description ? <p className={descriptionClasses()}>{description}</p> : null}
        </div>
      ) : null}
      {type === "dice_roll" ? <DiceRollNotification data={data} id={id} /> : null}
      {actions?.length ? (
        <div className="flex min-w-fit gap-x-2">
          {actions.map((action) => (
            <div key={action.label}>
              <Button
                icon={action?.icon}
                isDisabled={action?.isDisabled}
                label={action?.label}
                onClick={action?.onClick}
                variant={action?.variant}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function NotificationContainer() {
  const notifications = useAtomValue(notificationsAtom);
  return (
    <div className="scrollbar-hidden pointer-events-none absolute z-[999999] flex h-full w-full flex-col gap-y-4 overflow-y-auto">
      {notifications.map((n) => (
        <Notification {...n} key={n.id} />
      ))}
    </div>
  );
}
