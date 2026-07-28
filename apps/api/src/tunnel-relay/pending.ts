export interface PendingRequest {
  resolveHead: (head: { status: number; headers: Record<string, string> }) => void;
  push: (chunk: Uint8Array) => void;
  end: () => void;
  fail: (message: string) => void;
}

// 공개 HTTP 요청 id -> 응답을 스트리밍으로 조립 중인 콜백. proxy.ts가 등록하고
// ws-handler.ts가 CLI로부터 온 response-* 프레임을 여기로 전달한다.
const pending = new Map<string, PendingRequest>();

export function registerPending(id: string, entry: PendingRequest): void {
  pending.set(id, entry);
}

export function getPending(id: string): PendingRequest | undefined {
  return pending.get(id);
}

export function removePending(id: string): void {
  pending.delete(id);
}
