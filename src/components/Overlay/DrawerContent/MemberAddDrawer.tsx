import { useState } from "react";
import { useParams } from "react-router-dom";

import { useInviteUserToProject, useToggledResetAtom } from "../../../hooks";
import { IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";

export function MemberAddDrawer() {
  const { project_id } = useParams();
  const [email, setEmail] = useState("");
  const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  const { mutateAsync: invite, isLoading } = useInviteUserToProject();
  const resetDrawerAtom = useToggledResetAtom();
  return (
    <DrawerLayout>
      <Input
        helperText="If a user doesn't have an account they will recieve an invitation email. They will be added to the project upon creating an account."
        name="email"
        onChange={({ value }) => setEmail(value as string)}
        placeholder="Email"
        type="text"
        value={email}
      />
      <div>
        <Button
          icon={IconEnum.user_invite}
          isDisabled={!email || !isEmailValid || isLoading}
          isLoading={isLoading}
          label="Invite"
          onClick={async () => {
            if (project_id && email && isEmailValid) {
              await invite({ data: { project_id, email } });
              resetDrawerAtom();
            }
          }}
          variant="info"
        />
      </div>
    </DrawerLayout>
  );
}
