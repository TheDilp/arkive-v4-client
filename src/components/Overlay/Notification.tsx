import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";

import { NotificationType } from "../../types";
import { IconEnum, notificationsAtom, removeNotification } from "../../utils";
import { Button } from "../Form";
import { Icon } from "../Misc";

const ToastClasses = tv({
  slots: {
    base: "flex flex-col w-full max-w-fit overflow-hidden relative items-center border-zinc-800 box-border rounded-lg bg-zinc-700 p-4 text-white shadow ",
    title: "text-sm font-normal",
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
  },
});

export function Notification({ id, title, timer = 3, icon, variant = "primary", actions }: NotificationType) {
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

  const { base, title: titleClasses, progress, iconContainer } = ToastClasses({ variant });
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
    <div className="pointer-events-none absolute z-[999999] flex w-full flex-col items-end gap-y-4 p-4">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto w-96">
          <Notification {...n} />
        </div>
      ))}
    </div>
  );
}
