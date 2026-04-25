import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const ChatCard = () => {
  return (
    <div className="rounded-lg p-3 bg-gradient-to-br from-blue-50 via-white to-orange-50 border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-1 mb-1">
        <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
        <p className="font-semibold text-sm">Locate, Connect & Chat</p>
      </div>

      {/* Content */}
      <div className="text-[12px] text-gray-700 space-y-1">
        <div className="flex items-center gap-1">
          <UserIcon className="w-3.5 h-3.5 text-gray-500" />
          <p>One to One Chat</p>
        </div>

        <div className="flex items-center gap-1">
          <UsersIcon className="w-3.5 h-3.5 text-gray-500" />
          <p>Group Chat</p>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
