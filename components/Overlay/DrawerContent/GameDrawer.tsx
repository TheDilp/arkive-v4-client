import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
  };
};

export default function GameDrawer({ data }: Props) {
  return <DrawerLayout>GameDrawer {data?.id || ""}</DrawerLayout>;
}
