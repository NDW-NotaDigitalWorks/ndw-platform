import { ui } from "@/styles/ui";

type Props = {
  params: Promise<{ routeId: string }>;
};

export default async function RouteProRoutePage({ params }: Props) {
  const { routeId } = await params;

  return (
    <section style={ui.page.section}>
      <p style={ui.page.eyebrow}>RoutePro</p>
      <h1 style={ui.page.title}>Dettaglio rotta</h1>

      <div style={{ ...ui.card.base, marginTop: 24 }}>
        <p>ID rotta: {routeId}</p>
        <p>Import stop (Step successivo)</p>
      </div>
    </section>
  );
}