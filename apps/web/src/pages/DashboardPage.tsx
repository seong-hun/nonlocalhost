import { KeyRound, LayoutDashboard, LogOut, Radio, Settings, Users } from "lucide-react";
import { useState } from "react";
import { AdminUserPanel } from "../components/AdminUserPanel";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { TokenPanel } from "../components/TokenPanel";
import { TunnelList } from "../components/TunnelList";
import { useCurrentUser } from "../hooks/useCurrentUser";

type View = "dashboard" | "admin" | "settings";

const PAGE_META: Record<View, { title: string; description: string }> = {
  dashboard: {
    title: "대시보드",
    description: "연결된 터널과 CLI 토큰을 관리합니다.",
  },
  admin: {
    title: "회원 관리",
    description: "멤버 계정을 생성하거나 비활성화합니다.",
  },
  settings: {
    title: "설정",
    description: "계정 비밀번호를 변경합니다.",
  },
};

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const tabs: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "dashboard", label: "대시보드", icon: LayoutDashboard },
    ...(isAdmin ? [{ key: "admin" as const, label: "회원 관리", icon: Users }] : []),
    { key: "settings", label: "설정", icon: Settings },
  ];

  const meta = PAGE_META[view];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
            <Radio className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">nonlocalhost</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          {isCurrentUserLoading ? (
            <p className="px-2 py-1 text-sm text-slate-500">불러오는 중...</p>
          ) : (
            currentUser && (
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300">
                  {currentUser.email[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">{currentUser.email}</p>
                  {isAdmin && (
                    <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                      admin
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title="로그아웃"
                  className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-slate-800 px-8 py-6">
          <h1 className="text-xl font-semibold text-slate-100">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{meta.description}</p>
        </header>

        <div className="mx-auto max-w-3xl space-y-6 px-8 py-8">
          {view === "dashboard" && (
            <>
              <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-200">터널</h2>
                </div>
                <TunnelList />
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-200">CLI 토큰</h2>
                </div>
                <TokenPanel />
              </section>
            </>
          )}
          {view === "admin" && isAdmin && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-medium text-slate-200">회원 관리</h2>
              </div>
              <AdminUserPanel />
            </section>
          )}
          {view === "settings" && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-medium text-slate-200">비밀번호 변경</h2>
              </div>
              <ChangePasswordForm />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
