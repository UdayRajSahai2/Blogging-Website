import { useState, useRef } from "react";
import { socket } from "../../services/socket";

const MessageInput = ({ conversationId }) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit(
      "send_message",
      {
        conversationId,
        content: message,
        messageType: "text",
      },
      (res) => {
        if (res?.error) {
          console.error(res.error);
        }
      },
    );

    setMessage("");
  };

  const handleTyping = () => {
    socket.emit("typing_start", { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId });
    }, 1000);
  };

  return (
    <div className="p-0 flex gap-2">
      <input
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!message.trim()) return;
            sendMessage();
          }
        }}
        className="flex-1 border rounded px-3 py-2 outline-none"
        placeholder="Type a message..."
      />

      <button
        onClick={sendMessage}
        disabled={!message.trim()}
        className={`px-4 rounded text-white transition ${
          message.trim()
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
