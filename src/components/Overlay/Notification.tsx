import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";

import { NotificationType } from "../../types";
import { IconEnum, notificationsAtom, removeNotification } from "../../utils";
import { Button } from "../Form";
import { Icon } from "../Misc";

const ToastClasses = tv({
  slots: {
    base: "flex flex-col pointer-events-auto w-fit max-w-[30rem] overflow-hidden relative items-center border-zinc-800 box-border rounded-lg bg-zinc-700 py-4 px-2 text-white shadow  duration-300 ease-out",
    title: "text-sm font-normal text-center",
    iconContainer: "flex mr-2 h-8 w-8 min-w-[2rem] min-h-[2rem] items-center justify-center rounded",
    progress: "absolute left-0 top-0 h-1  transition-all",
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
        base: "animate-in slide-in-from-right-10 right-4 top-2",
      },
      center: {
        base: "animate-in zoom-in m-auto",
      },
    },
  },
});

export function Notification({
  id,
  title,
  timer = 3,
  icon,
  variant = "primary",
  actions,
  position = "top-right",
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

  const { base, title: titleClasses, progress, iconContainer } = ToastClasses({ variant, position });
  return (
    <div className={base()} role="alert">
      <div
        className={progress()}
        style={{
          width: `${timeRemaining ? 100 : 0}%`,
          transition: `width ${timer}s linear`,
        }}
      />
      <div className="flex w-fit items-center justify-between">
        {icon ? (
          <div className={iconContainer()}>
            <Icon fontSize={22} icon={icon} />
          </div>
        ) : null}
        <div className={titleClasses()}>{title}</div>
        <div className="ml-auto">
          <Button hasNoBackground icon={IconEnum.close} onClick={() => removeNotification(setNotificationAtom, id)} />
        </div>
      </div>
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
    <div className="pointer-events-none absolute z-[999999] flex h-full w-full flex-col items-end gap-y-4 ">
      {notifications.map((n) => (
        <Notification key={n.id} {...n} />
      ))}
    </div>
  );
}
