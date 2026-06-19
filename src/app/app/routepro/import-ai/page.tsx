import Link from "next/link";
import { AiScreenshotImportClient } from "@/modules/routepro/ui/AiScreenshotImportClient";

export default function RouteProAiImportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-3">
          <Link
            href="/app/routepro/new"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            ← Torna a Nuova Rotta
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              RoutePro AI
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              AI Screenshot Import
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Carica gli screenshot Amazon Flex. RoutePro analizzerà gli stop,
              manterrà il numero originale e segnalerà automaticamente stop a
              bassa confidenza o placeholder da correggere.
            </p>
          </div>
        </header>

        <AiScreenshotImportClient />
      </div>
    </main>
  );
}