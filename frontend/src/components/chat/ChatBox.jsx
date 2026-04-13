import { useEffect, useState } from "react";
import { socket } from "../../services/socket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatBox = ({ conversation, messages, setMessages }) => {
  const [typingUser, setTypingUser] = useState(null);
  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  const currentUserId = currentUser?.user_id;

  useEffect(() => {
    //  NEW MESSAGE
    socket.on("new_message", (msg) => {
      if (!msg) {
        return;
      }

      if (msg.conversation_id === conversation.conversation_id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.message_id === msg.message_id);
          if (exists) return prev;
          return [...prev, msg];
        });

        socket.emit("mark_seen", {
          conversationId: conversation.conversation_id,
        });
      }
    });

    // 👀 SEEN
    socket.on("messages_seen", ({ userId }) => {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          seenUsers: [...(msg.seenUsers || []), { user_id: userId }],
        })),
      );
    });

    // ✍️ typing
    socket.on("typing_start", ({ userId }) => {
      setTypingUser(userId);
    });

    socket.on("typing_stop", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("new_message");
      socket.off("typing_start");
      socket.off("typing_stop");
      socket.off("messages_seen");
    };
  }, [conversation]);
  const users = (conversation.participants || []).map((p) => p.user);

  const otherUsers = users.filter(
    (u) => String(u.user_id) !== String(currentUserId),
  );

  const names = otherUsers.map((u) => u.fullname || u.username || "User");

  const displayTitle = conversation.is_group
    ? conversation.group_name
    : ["You", ...names].join(" • ");
  return (
    <div className="flex flex-col h-[600px] w-full overflow-hidden">
      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-white flex items-center justify-between shadow-sm">
        {/* LEFT: Avatar + Name */}
        <div className="flex items-center gap-3">
          <img
            src={
              conversation.is_group
                ? "/group.png"
                : users[0]?.profile_img || "/default.png"
            }
            className="w-9 h-9 rounded-full object-cover"
          />

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-900 text-sm">
              {displayTitle}
            </span>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      {/* 🔵 TYPING UI */}
      {typingUser && (
        <div className="px-4 text-sm text-gray-500">Typing...</div>
      )}

      {/* INPUT */}
      <div className="border-t bg-white p-2 sm:p-3">
        <MessageInput conversationId={conversation.conversation_id} />
      </div>
    </div>
  );
};

export default ChatBox;
