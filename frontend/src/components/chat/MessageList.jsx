import { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef();
  const containerRef = useRef();
  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImage = (img) => {
    if (!img) return "/default.png";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="px-4 py-4 space-y-2 bg-gray-50 h-full overflow-y-auto"
    >
      {messages.map((msg, index) => {
        const isMe = msg.sender_id === currentUserId;

        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];

        const isSameSenderAsPrev =
          prevMsg && prevMsg.sender_id === msg.sender_id;

        const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;

        const avatar = isMe
          ? getImage(currentUser?.profile_img)
          : getImage(msg.sender?.profile_img);

        return (
          <div
            key={msg.message_id}
            className={`flex items-end gap-2 ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            {/* LEFT AVATAR (only if last in group & not me) */}
            {!isMe && isLastInGroup ? (
              <img
                src={avatar}
                onError={(e) => (e.target.src = "/default.png")}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              !isMe && <div className="w-8" /> // spacing placeholder
            )}

            {/* MESSAGE */}
            <div
              className={`max-w-[75%] px-4 py-2 shadow-none ${
                isMe
                  ? "bg-blue-600 text-white rounded-2xl rounded-br-md shadow-md"
                  : "bg-gray-200 text-gray-900 rounded-2xl rounded-bl-md"
              } ${
                // dynamic rounded corners (grouping effect)
                isMe
                  ? isSameSenderAsPrev
                    ? "rounded-none rounded-br-md"
                    : "rounded-none rounded-br-md"
                  : isSameSenderAsPrev
                    ? "rounded-none rounded-bl-md"
                    : "rounded-none rounded-bl-md"
              }`}
            >
              {/* TEXT */}
              <div className="text-sm leading-relaxed break-words">
                {msg.content}
              </div>
              {/* TIME (dim + subtle) */}
              <div
                className={`text-[10px] mt-1 text-right ${
                  isMe ? "text-gray-200" : "text-gray-400"
                }`}
              >
                {formatTime(msg.createdAt)}
              </div>
            </div>

            {/* RIGHT AVATAR (only if last in group & me) */}
            {isMe && isLastInGroup ? (
              <img
                src={avatar}
                onError={(e) => (e.target.src = "/default.png")}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              isMe && <div className="w-8" />
            )}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
