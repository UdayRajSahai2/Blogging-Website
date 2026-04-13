import AuthActionBox from "./AuthActionBox";

const AuthLeftActions = ({ type }) => {
  return (
    <div className="flex flex-col gap-3">
      {type === "sign-in" ? (
        <>
          <AuthActionBox
            to=""
            icon="fi-rr-time-fast"
            title="What's New"
            subtitle="See recent activity"
            gradient="from-indigo-600 to-purple-700"
            height="h-[220px]"
          />

          <AuthActionBox
            to=""
            icon="fi-rr-users"
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
            icon="fi-rr-users"
            title="Join as"
            subtitle="Student • NGO • Professional"
            gradient="from-indigo-600 to-purple-700"
            height="h-[220px]"
          />

          <AuthActionBox
            to=""
            icon="fi-rr-globe"
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
