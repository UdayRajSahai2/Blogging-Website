import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { connectSocket, socket } from "../../services/socket";
import {
  getConversationsAPI,
  getMessagesAPI,
  deleteConversationAPI,
} from "../../api/chat.api";
import { TrashIcon } from "@heroicons/react/24/outline";
import ChatBox from "../../components/chat/ChatBox";
import CreateGroupModal from "../../components/chat/CreateGroupModal";
const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);

  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  const currentUserId = currentUser?.user_id;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  /* ================= 📱 SCREEN DETECTION ================= */
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= 🔌 SOCKET ================= */
  useEffect(() => {
    connectSocket();
    return () => socket.disconnect();
  }, []);

  /* ================= 📦 FETCH CONVERSATIONS ================= */
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await getConversationsAPI();
      setConversations(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("online_users");
  }, []);
  useEffect(() => {
    if (conversationId) {
      socket.emit("join_conversation", { conversationId });
    }
  }, [conversationId]);

  /* ================= 🔁 LOAD CONVERSATION FROM URL ================= */
  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const conv = conversations.find(
      (c) => c.Conversation.conversation_id == conversationId,
    )?.Conversation;

    if (conv) {
      loadConversation(conv);
    }
  }, [conversationId, conversations]);

  /* ================= 💬 LOAD CHAT ================= */
  const loadConversation = async (conv) => {
    setActiveConversation(conv);

    try {
      const res = await getMessagesAPI(conv.conversation_id, null, 20);
      setMessages((res.data.data || []).slice().reverse());

      socket.emit("join_conversation", {
        conversationId: conv.conversation_id,
      });
      socket.emit("mark_seen", {
        conversationId: conv.conversation_id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= 👉 CLICK CHAT ================= */
  const openConversation = (conv) => {
    navigate(`/chat/conversation/${conv.conversation_id}`);
  };

  /* ================= 👤 GET OTHER USER ================= */
  const getOtherUser = (conv) => {
    return conv.participants?.find((p) => p.user.user_id !== currentUserId);
  };
  useEffect(() => {
    socket.on("refresh_conversations", () => {
      fetchConversations();
    });

    socket.on("conversation_updated", (data) => {
      console.log("🔥 sidebar update", data);
      fetchConversations();
    });

    return () => {
      socket.off("refresh_conversations");
      socket.off("conversation_updated");
    };
  }, []);
  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm("Delete this conversation?")) return;

    try {
      await deleteConversationAPI(conversationId);

      // remove from sidebar
      setConversations((prev) =>
        prev.filter((c) => c.Conversation.conversation_id !== conversationId),
      );

      // 🔥 if active → clear chat
      if (activeConversation?.conversation_id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        navigate("/chat");
      }
    } catch (err) {
      console.error(err);
    }
  };
  // 🔹 color generator for delete convo user
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  /* ================= 🎨 UI ================= */
  return (
    <div className="flex h-[calc(90vh-60px)] overflow-hidden bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          ${isMobileView ? "w-full" : "w-1/3"}
          bg-white border-r overflow-y-auto
          ${isMobileView && activeConversation ? "hidden" : "block"}
        `}
      >
        <div className="p-2 border-b flex justify-between items-center">
          <h4 className="font-semibold text-base">Messages</h4>

          <button
            onClick={() => setShowGroupModal(true)}
            className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
          >
            + Group
          </button>
        </div>

        {conversations.map((item) => {
          const conv = item.Conversation;
          const otherUser = getOtherUser(conv);
          const unread = item.unread_count;
          const name = conv.is_group
            ? conv.group_name
            : otherUser?.user?.fullname ||
              otherUser?.user?.username ||
              "Deleted User";
          const avatar = conv.is_group
            ? conv.group_avatar || null
            : otherUser?.user?.profile_img || null;
          const isOnline = onlineUsers.includes(otherUser?.user?.user_id);
          return (
            <div
              key={conv.conversation_id}
              className={`flex items-center justify-between gap-3 p-3 border-b hover:bg-gray-100 ${
                conv.conversation_id == conversationId ? "bg-gray-200" : ""
              }`}
            >
              {/* LEFT (CLICKABLE CHAT) */}
              <div
                onClick={() => openConversation(conv)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <div className="relative w-10 h-10">
                  {avatar ? (
                    <img
                      src={avatar}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center`}
                    >
                      {(name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage
                      ? `${
                          conv.lastMessage.sender_id === currentUserId
                            ? "You"
                            : otherUser?.user?.fullname ||
                              otherUser?.user?.username ||
                              "Deleted User"
                        }: ${conv.lastMessage.content}`
                      : "Start a conversation"}
                  </p>
                </div>
              </div>

              {/*  DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); //  VERY IMPORTANT
                  handleDeleteConversation(conv.conversation_id);
                }}
                className="text-red-500 text-sm hover:text-red-700"
                title="Delete conversation"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </button>

              <div>
                {unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= CHAT AREA ================= */}
      <div
        className={`
          w-full flex flex-col h-full overflow-hidden
          ${isMobileView && !activeConversation ? "hidden" : "block"}
        `}
      >
        {activeConversation ? (
          <>
            {/* 🔙 MOBILE HEADER */}
            {isMobileView && (
              <div className="p-3 border-b bg-white flex items-center gap-3">
                <button
                  onClick={() => navigate("/chat")}
                  className="text-blue-500 font-semibold"
                >
                  ← Back
                </button>

                <span className="font-semibold">
                  {activeConversation.group_name || "Chat"}
                </span>
              </div>
            )}

            <ChatBox
              conversation={activeConversation}
              messages={messages}
              setMessages={setMessages}
            />
          </>
        ) : (
          !isMobileView && (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a chat
            </div>
          )
        )}
      </div>
      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onSuccess={(convo) => {
            navigate(`/chat/conversation/${convo.conversation_id}`);
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;
