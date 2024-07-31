import { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { CharacterForm } from "./CharacterForm";
import { IndeterminateProgressBar } from "../../../components";
import { useIsMutating } from "@tanstack/react-query";

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

  return <FormLayout>{type === "characters" ? <CharacterForm /> : <CharacterForm />}</FormLayout>;
}
