export interface TunnelSocketData {
  userId: string | null;
  tokenId: string | null;
  subdomain: string | null;
  pingInterval?: ReturnType<typeof setInterval>;
  helloTimeout?: ReturnType<typeof setTimeout>;
}
