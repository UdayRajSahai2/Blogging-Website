const CommunityList = () => {
  // Would fetch from API in real implementation
  const communities = [
    "Food Lovers",
    "Tech Enthusiasts",
    "Health & Wellness",
    "Travel Buddies"
  ];

  return (
    <ul className="community-list">
      {communities.map((community, i) => (
        <li key={i} className="community-item">
          {community}
          <button className="join-btn">Join</button>
        </li>
      ))}
    </ul>
  );
};

export default CommunityList;