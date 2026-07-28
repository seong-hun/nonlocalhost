import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      <p className="text-sm text-slate-400">
        아직 연결된 터널이 없습니다. CLI로 처음 연결하면 여기 표시됩니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800">
      {tunnels.map((t) => (
        <li key={t.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${t.online ? "bg-emerald-400" : "bg-slate-600"}`}
              />
              <span className="font-mono text-slate-100">{t.subdomain}</span>
            </div>
            <p className="text-xs text-slate-500">
              {t.online
                ? "연결됨"
                : t.lastConnectedAt
                  ? `마지막 연결: ${new Date(t.lastConnectedAt).toLocaleString()}`
                  : "연결된 적 없음"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeMutation.mutate(t.id)}
            className="text-sm text-red-400 hover:text-red-300"
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  );
}
