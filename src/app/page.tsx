import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
            NDW Core
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Modular SaaS platform
          </h1>

          <p className="mt-4 max-w-xl text-slate-300">
            NDW Core is the central workspace for modules, access management and
            business tools.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Login
          </Link>

          <Link
            href="/app"
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white"
          >
            Open workspace
          </Link>

          <Link
            href="/app/routepro"
            className="rounded-xl border border-cyan-400/40 px-5 py-3 text-sm font-semibold text-cyan-200"
          >
            Test RoutePro
          </Link>
        </div>
      </div>
    </main>
  );
}