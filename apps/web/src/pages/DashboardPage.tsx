import { TokenPanel } from "../components/TokenPanel";
import { TunnelList } from "../components/TunnelList";

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold">nonlocalhost</h1>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          로그아웃
        </button>
      </header>
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">터널</h2>
          <TunnelList />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            CLI 토큰
          </h2>
          <TokenPanel />
        </section>
      </main>
    </div>
  );
}
