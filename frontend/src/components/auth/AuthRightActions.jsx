import AuthActionBox from "./AuthActionBox";
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const AuthRightActions = ({ type }) => {
  return (
    <div className="flex flex-col gap-3">
      {type === "sign-in" ? (
        <>
          <AuthActionBox
            to=""
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
            title="Active Discussions"
            subtitle="Join conversations"
            gradient="from-orange-500 to-pink-600"
            height="h-[220px]"
          />

          <AuthActionBox
            to=""
            icon={<LightBulbIcon className="w-6 h-6" />}
            title="Your Projects"
            subtitle="Continue your work"
            gradient="from-blue-600 to-cyan-700"
            height="h-[220px]"
          />
        </>
      ) : (
        <>
          <AuthActionBox
            to=""
            icon={<LightBulbIcon className="w-6 h-6" />}
            title="Start a Project"
            subtitle="Turn ideas into action"
            gradient="from-orange-500 to-pink-600"
            height="h-[220px]"
          />

          <AuthActionBox
            to=""
            icon={<UserGroupIcon className="w-6 h-6" />}
            title="Collaborate"
            subtitle="Work with like-minded people"
            gradient="from-blue-600 to-cyan-700"
            height="h-[220px]"
          />
        </>
      )}
    </div>
  );
};

export default AuthRightActions;
