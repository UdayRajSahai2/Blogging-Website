const ProfileContainer = ({ children, embedded }) => {
  return (
    <div
      className={
        embedded
          ? "w-full px-2 sm:px-4 lg:px-6"
          : "w-full max-w-full px-0.5 sm:px-6 lg:px-0 border border-gray-200 shadow-md rounded-xl bg-white"
      }
    >
      {children}
    </div>
  );
};

export default ProfileContainer;
