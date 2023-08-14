import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";

import { DiceRollType, NotificationType } from "../../types";
import { IconEnum, notificationsAtom, removeNotification } from "../../utils";
import { getCritColor } from "../../utils/ui/diceRollerUtils";
import { Button } from "../Form";
import { Icon } from "../Misc";

const NotificationClasses = tv({
  slots: {
    base: "flex flex-col pointer-events-auto w-fit max-w-[30rem] relative items-center border-zinc-800 box-border rounded-lg bg-zinc-700 py-4 px-2 text-white shadow duration-300 ease-out",
    titleContainer: "text-sm font-normal h-fit text-center flex items-center gap-x-2 w-full justify-between",
    title: "text-base",
    description: "text-center text-sm mt-1 flex-1",
    iconContainer: "flex mr-2 h-8 w-8 min-w-[2rem] min-h-[2rem] max-w-fit items-center justify-center rounded",
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
  },
});

function DiceRollNotification({ data }: { data: DiceRollType }) {
  return (
    <div>
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
      <span> = {data.value}</span>
    </div>
  );
}

export function Notification({
  id,
  title,
  description,
  timer = 3,
  icon,
  variant = "primary",
  actions,
  position = "top-right",
  hasTitleBorder,
  type,
  data,
}: NotificationType) {
  const setNotificationAtom = useSetAtom(notificationsAtom);
  const [timeRemaining, setTimeRemaining] = useState<boolean>(true);
  useEffect(() => {
    if (timer) {
      setTimeout(() => {
        removeNotification(setNotificationAtom, id);
      }, timer * 1000 + 250);
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
    iconContainer,
  } = NotificationClasses({ variant, position, hasTitleBorder });
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
            {icon ? (
              <div className={iconContainer()}>
                <Icon fontSize={22} icon={icon} />
              </div>
            ) : null}
            <span className={titleClasses()}>{title}</span>
            <div className=" w-min">
              <Button hasNoBackground icon={IconEnum.close} onClick={() => removeNotification(setNotificationAtom, id)} />
            </div>
          </div>
          {description ? <p className={descriptionClasses()}>{description}</p> : null}
        </div>
      ) : null}
      {type === "dice_roll" ? <DiceRollNotification data={data} /> : null}
      {actions?.length ? (
        <div className="flex min-w-fit gap-x-2">
          {actions.map((action) => (
            <div key={action.label}>
              <Button icon={action?.icon} label={action?.label} onClick={action?.onClick} variant={action?.variant} />
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
        <Notification key={n.id} {...n} />
      ))}
    </div>
  );
}
