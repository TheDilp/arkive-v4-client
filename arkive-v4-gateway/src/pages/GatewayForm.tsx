import { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { CharacterForm } from "./CharacterForm";

function FormLayout({ children }: { children: ReactNode }) {
  return <div className="grid h-full grid-cols-12 overflow-hidden rounded-md p-4">{children}</div>;
}

export default function GatewayForm() {
  const { type } = useParams();

  return <FormLayout>{type === "characters" ? <CharacterForm /> : <CharacterForm />}</FormLayout>;
}
