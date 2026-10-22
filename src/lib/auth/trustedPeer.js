// x-mm-real-ip is only trustworthy when custom-server.js stamped it from the TCP socket.
// It proves that by echoing the per-process secret it generated at boot, which a client
// cannot guess. Without the proof the header is just attacker-supplied input.
export function hasTrustedPeerHeaders(request) {
  const token = process.env.PANEL_PEER_TOKEN;
  return Boolean(token) && request.headers.get("x-mm-peer-token") === token;
}
