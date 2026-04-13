import AuthActionBox from "./AuthActionBox";

const AuthBottomActions = ({ type }) => {
  return (
    <div className="grid grid-cols-4 gap-3 mt-1">
      {type === "sign-in" ? (
        <>
          <AuthActionBox
            icon="fi-rr-fire"
            title="Trending"
            subtitle="Hot topics"
            height="h-[120px]"
          />
          <AuthActionBox
            icon="fi-rr-bell"
            title="Updates"
            subtitle="New activity"
            height="h-[120px]"
          />
          <AuthActionBox
            icon="fi-rr-user-add"
            title="Connections"
            subtitle="New requests"
            height="h-[120px]"
          />
          <AuthActionBox
            icon="fi-rr-star"
            title="Highlights"
            subtitle="Top contributions"
            height="h-[120px]"
          />
        </>
      ) : (
        <>
          <AuthActionBox
            icon="fi-rr-users"
            title="10K+"
            subtitle="Active users"
            height="h-[120px]"
          />
          <AuthActionBox
            icon="fi-rr-globe"
            title="50+"
            subtitle="Cities connected"
            height="h-[120px]"
          />
          <AuthActionBox
            icon="fi-rr-lightbulb"
            title="500+"
            subtitle="Projects created"
            height="h-[120px]"
          />
          <AuthActionBox
            icon="fi-rr-heart"
            title="Real Impact"
            subtitle="Stories that matter"
            height="h-[120px]"
          />
        </>
      )}
    </div>
  );
};

export default AuthBottomActions;
