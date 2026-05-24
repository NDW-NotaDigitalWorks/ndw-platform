import OpsAttentionBlock from "./OpsAttentionBlock";

type Props = {
  label?: string;
};

export default function OpsPlaceholderAction({
  label = "Azione placeholder",
}: Props) {
  return (
    <OpsAttentionBlock
      title={label}
      description="Questa azione è già prevista nella UX, ma verrà collegata a server actions e database nei prossimi blocchi."
    />
  );
}