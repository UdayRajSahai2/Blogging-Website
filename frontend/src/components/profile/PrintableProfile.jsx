import ProfileHeader from "./ProfileHeader";
import AboutUser from "./AboutUser";

const PrintableProfile = ({ profile, interests, isOwner }) => {
  return (
    <div className="bg-white text-black w-full print:w-full print:p-0 p-6">
      <ProfileHeader profile={profile} isOwner={isOwner} printMode />

      <AboutUser
        bio={profile.bio}
        joinedAt={profile.createdAt}
        details={profile.details}
        addresses={profile.addresses}
        experiences={profile.experiences}
        academics={profile.academics}
        interests={interests || []}
        isOwner={isOwner}
        printMode
      />
    </div>
  );
};

export default PrintableProfile;
