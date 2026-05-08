import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const POLL_MS = 25000;

/**
 * Polls unread notification count when token is set (near–real-time without WebSockets).
 */
export function useNotificationPoll(token) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    async function tick() {
      try {
        const data = await apiFetch("/notifications/unread-count", { token });
        if (!cancelled) setUnreadCount(data.count ?? 0);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    }

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  return { unreadCount, setUnreadCount };
}
