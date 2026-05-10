import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ChatBox({ claimId, onEnd }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  const bottomRef = useRef(null);

  async function loadMessages() {
    try {
      const data = await apiFetch(`/messages/${claimId}`, { token });
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!body.trim()) return;
    try {
      await apiFetch(`/messages/${claimId}`, {
        method: "POST",
        body: { body },
        token,
      });
      setBody("");
      loadMessages();
    } catch (e) {
      console.error(e);
    }
  }

  async function endChat() {
    setEnding(true);
    try {
      await apiFetch(`/claims/${claimId}/resolve`, {
        method: "POST",
        token,
      });
      setShowConfirm(false);
      if (onEnd) onEnd();
    } catch (e) {
      console.error(e);
    } finally {
      setEnding(false);
    }
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 6000);
    return () => clearInterval(interval);
  }, [claimId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mt-6 rounded-2xl border border-brand-gray-light bg-white shadow-sm">
      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-dark">End Chat?</h3>
            <p className="mt-2 text-sm text-brand-gray">
              Are you sure you want to end this chat? This will mark the item as resolved and close the listing.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-brand-gray-light px-4 py-2 text-sm font-semibold text-dark-2 hover:bg-brand-gray-bg"
              >
                Cancel
              </button>
              <button
                onClick={endChat}
                disabled={ending}
                className="flex-1 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {ending ? "Ending..." : "Yes, end chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-brand-gray-light px-4 py-3">
        <div>
          <h3 className="font-semibold text-dark">Chat</h3>
          <p className="text-xs text-brand-gray">Messages between you and the other party</p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-lg border border-brand-red/30 bg-brand-red-pale px-3 py-1.5 text-xs font-semibold text-brand-red hover:bg-brand-red hover:text-white transition"
        >
          End Chat
        </button>
      </div>

      <div className="flex h-64 flex-col gap-2 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-sm text-brand-gray">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-brand-gray">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-green text-white" : "bg-gray-100 text-dark"}`}>
{!isMe && <p className="mb-1 text-xs font-semibold opacity-70">{msg.sender_name?.split(" ")[0]}</p>}
                  <p>{msg.body}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-brand-gray-light p-3">
        <input
          className="flex-1 rounded-xl border border-brand-gray-light px-3 py-2 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/25"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-light"
        >
          Send
        </button>
      </div>
    </div>
  );
}