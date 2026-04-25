import AuthActionBox from "./AuthActionBox";
import {
  BoltIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const AuthLeftActions = ({ type }) => {
  return (
    <div className="flex flex-col gap-3">
      {type === "sign-in" ? (
        <>
          <AuthActionBox
            to=""
            icon={<BoltIcon className="w-6 h-6" />}
            title="What's New"
            subtitle="See recent activity"
            gradient="from-indigo-600 to-purple-700"
            height="h-[220px]"
          />

          <AuthActionBox
            to=""
            icon={<UserGroupIcon className="w-6 h-6" />}
            title="Your Network"
            subtitle="People you connected with"
            gradient="from-green-600 to-emerald-700"
            height="h-[220px]"
          />
        </>
      ) : (
        <>
          <AuthActionBox
            to=""
            icon={<UserGroupIcon className="w-6 h-6" />}
            title="Join as"
            subtitle="Student • NGO • Professional"
            gradient="from-indigo-600 to-purple-700"
            height="h-[220px]"
          />

          <AuthActionBox
            to=""
            icon={<GlobeAltIcon className="w-6 h-6" />}
            title="Create Impact"
            subtitle="Start locally, grow globally"
            gradient="from-green-600 to-emerald-700"
            height="h-[220px]"
          />
        </>
      )}
    </div>
  );
};

export default AuthLeftActions;
