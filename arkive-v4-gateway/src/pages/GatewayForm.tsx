import { useIsMutating } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useParams } from "react-router-dom";

import { Dialog, IndeterminateProgressBar } from "../../../components";
import { BlueprintInstanceForm } from "./BlueprintInstanceForm";
import { CharacterForm } from "./CharacterForm";

function FormLayout({ children }: { children: ReactNode }) {
  const isMutating = useIsMutating();
  return (
    <>
      {isMutating ? <IndeterminateProgressBar /> : null}

      <div
        className="grid h-full grid-cols-12 overflow-hidden rounded-md p-4"
        style={{
          gridTemplateRows: "auto 1fr",
        }}>
        {children}
      </div>
    </>
  );
}

export default function GatewayForm() {
  const { type } = useParams();

  return (
    <FormLayout>
      <Dialog />
      {type === "characters" ? <CharacterForm /> : null}
      {type === "blueprint_instances" ? <BlueprintInstanceForm /> : null}
    </FormLayout>
  );
}
