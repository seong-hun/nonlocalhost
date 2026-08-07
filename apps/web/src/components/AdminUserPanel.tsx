import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { usersApi } from "../services/usersApi";

function extractErrorMessage(error: unknown): string {
  const code = (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data
    ?.error?.code;
  if (code === "EMAIL_TAKEN") return "이미 사용 중인 이메일입니다";
  if (code === "INVALID_BODY") return "이메일과 8자 이상의 비밀번호를 입력하세요";
  return "계정을 생성하지 못했습니다";
}

export function AdminUserPanel() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: members, isLoading } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(email, password),
    onSuccess: () => {
      setEmail("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.reset();
    if (email.trim() && password.trim()) createMutation.mutate();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="초기 비밀번호 (8자 이상)"
          className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <UserPlus className="h-4 w-4" />
          계정 생성
        </button>
      </form>
      <p className="text-xs text-slate-500">
        생성 후 표시되는 비밀번호는 저장되지 않으므로, 위에 입력한 비밀번호를 해당 사용자에게 직접
        전달해야 합니다. 사용자는 로그인 후 설정 화면에서 직접 변경할 수 있습니다.
      </p>

      {createMutation.isError && (
        <p className="text-sm text-red-400">{extractErrorMessage(createMutation.error)}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">불러오는 중...</p>
      ) : !members?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-800 py-10 text-center">
          <Users className="h-5 w-5 text-slate-600" />
          <p className="text-sm text-slate-400">아직 생성된 멤버 계정이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
          {members.map((m) => (
            <li
              key={m.id}
              className={`group flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 ${m.disabledAt ? "opacity-50" : ""}`}
            >
              <div>
                <p className="text-sm text-slate-100">{m.email}</p>
                <p className="text-xs text-slate-500">
                  {m.disabledAt
                    ? "비활성화됨"
                    : `가입일: ${new Date(m.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              {!m.disabledAt && (
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(m.id)}
                  title="비활성화"
                  className="rounded-md p-1.5 text-slate-500 opacity-0 transition-opacity hover:bg-red-950/40 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
