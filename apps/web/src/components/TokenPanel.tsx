import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { tokensApi } from "../services/tokensApi";
import { CopyButton } from "./CopyButton";

export function TokenPanel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const { data: tokens } = useQuery({ queryKey: ["tokens"], queryFn: tokensApi.list });

  const createMutation = useMutation({
    mutationFn: tokensApi.create,
    onSuccess: (token) => {
      setJustCreated(token);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: tokensApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tokens"] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) createMutation.mutate(name.trim());
  }

  const installCommand = justCreated
    ? `nonlocalhost 5173 --subdomain myapp --server ${window.location.host} --token ${justCreated} --save`
    : "";

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: macbook"
          className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          토큰 발급
        </button>
      </form>

      {justCreated && (
        <div className="space-y-2 rounded border border-emerald-800 bg-emerald-950/40 p-4">
          <p className="text-sm text-emerald-300">
            토큰은 지금 한 번만 표시됩니다. 안전한 곳에 복사해두세요.
          </p>
          <div className="flex items-start gap-2 rounded bg-slate-950 p-2">
            <code className="block flex-1 break-all text-xs text-slate-200">{justCreated}</code>
            <CopyButton text={justCreated} />
          </div>
          <p className="text-sm text-emerald-300">맥북 등에서 실행할 명령 (최초 1회, 토큰 저장):</p>
          <div className="flex items-start gap-2 rounded bg-slate-950 p-2">
            <code className="block flex-1 break-all text-xs text-slate-200">{installCommand}</code>
            <CopyButton text={installCommand} />
          </div>
          <p className="text-xs text-slate-500">
            --server에는 스킴(https://, wss://) 없이 도메인만 입력합니다. 이후에는{" "}
            <code className="text-slate-400">~/.config/nonlocalhost/config.json</code>에 저장된 값을
            자동으로 쓰므로 --server, --token 없이 다시 실행할 수 있습니다.
          </p>
        </div>
      )}

      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800">
        {tokens?.map((t) => (
          <li key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-slate-100">{t.name}</p>
              <p className="text-xs text-slate-500">
                {t.revokedAt
                  ? "폐기됨"
                  : t.lastUsedAt
                    ? `마지막 사용: ${new Date(t.lastUsedAt).toLocaleString()}`
                    : "아직 사용 안 함"}
              </p>
            </div>
            {!t.revokedAt && (
              <button
                type="button"
                onClick={() => removeMutation.mutate(t.id)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                폐기
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
