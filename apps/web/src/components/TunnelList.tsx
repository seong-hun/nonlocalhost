import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Radio, Trash2 } from "lucide-react";
import { tunnelsApi } from "../services/tunnelsApi";

export function TunnelList() {
  const queryClient = useQueryClient();

  const { data: tunnels, isLoading } = useQuery({
    queryKey: ["tunnels"],
    queryFn: tunnelsApi.list,
    refetchInterval: 5000,
  });

  const removeMutation = useMutation({
    mutationFn: tunnelsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tunnels"] }),
  });

  if (isLoading) return <p className="text-sm text-slate-400">불러오는 중...</p>;

  if (!tunnels?.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-800 py-10 text-center">
        <Radio className="h-5 w-5 text-slate-600" />
        <p className="text-sm text-slate-400">
          아직 연결된 터널이 없습니다. CLI로 처음 연결하면 여기 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
      {tunnels.map((t) => (
        <li
          key={t.id}
          className="group flex items-center justify-between px-4 py-3 hover:bg-slate-800/30"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2 shrink-0">
              {t.online && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${t.online ? "bg-emerald-400" : "bg-slate-600"}`}
              />
            </span>
            <div>
              <span className="font-mono text-sm text-slate-100">{t.subdomain}</span>
              <p className="text-xs text-slate-500">
                {t.online
                  ? "연결됨"
                  : t.lastConnectedAt
                    ? `마지막 연결: ${new Date(t.lastConnectedAt).toLocaleString()}`
                    : "연결된 적 없음"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeMutation.mutate(t.id)}
            title="삭제"
            className="rounded-md p-1.5 text-slate-500 opacity-0 transition-opacity hover:bg-red-950/40 hover:text-red-400 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
