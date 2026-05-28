import AuthActionBox from "./AuthActionBox";
import FireIcon from "@heroicons/react/24/outline/FireIcon";
import BellIcon from "@heroicons/react/24/outline/BellIcon";
import UserPlusIcon from "@heroicons/react/24/outline/UserPlusIcon";
import StarIcon from "@heroicons/react/24/outline/StarIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import GlobeAltIcon from "@heroicons/react/24/outline/GlobeAltIcon";
import LightBulbIcon from "@heroicons/react/24/outline/LightBulbIcon";
import HeartIcon from "@heroicons/react/24/outline/HeartIcon";

const AuthBottomActions = ({ type }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 mt-1">
      {type === "sign-in" ? (
        <>
          <AuthActionBox
            icon={<FireIcon className="w-5 h-5" />}
            title="Trending"
            subtitle="Hot topics"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
          <AuthActionBox
            icon={<BellIcon className="w-5 h-5" />}
            title="Updates"
            subtitle="New activity"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
          <AuthActionBox
            icon={<UserPlusIcon className="w-5 h-5" />}
            title="Connections"
            subtitle="New requests"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
          <AuthActionBox
            icon={<StarIcon className="w-5 h-5" />}
            title="Highlights"
            subtitle="Top contributions"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
        </>
      ) : (
        <>
          <AuthActionBox
            icon={<UserGroupIcon className="w-5 h-5" />}
            title="10K+"
            subtitle="Active users"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
          <AuthActionBox
            icon={<GlobeAltIcon className="w-5 h-5" />}
            title="50+"
            subtitle="Cities connected"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
          <AuthActionBox
            icon={<LightBulbIcon className="w-5 h-5" />}
            title="500+"
            subtitle="Projects created"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
          <AuthActionBox
            icon={<HeartIcon className="w-5 h-5" />}
            title="Real Impact"
            subtitle="Stories that matter"
            height="h-[90px] sm:h-[110px] md:h-[120px]"
          />
        </>
      )}
    </div>
  );
};

export default AuthBottomActions;
