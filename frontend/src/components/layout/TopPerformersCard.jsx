const TopPerformersCard = ({ performers = [], leaders = [] }) => {
  //  DUMMY DATA (REMOVE AFTER API)
  const dummyPerformers = [{ name: "Reach Foundation" }];
  const dummyLeaders = [{ name: "Reach Foundation" }];

  // fallback
  const performersData = performers.length ? performers : dummyPerformers;
  const leadersData = leaders.length ? leaders : dummyLeaders;

  return (
    <div className="rounded-md p-0.5 bg-gradient-to-br from-blue-50 via-white to-orange-50 border shadow-sm">
      <div className="flex gap-2">
        {/*  TOP PERFORMERS */}
        <div className="flex-1 min-w-0 bg-blue-50/30 rounded-md pt-1 px-1.5 pb-1">
          <p className="font-semibold text-[10px] text-gray-500 uppercase leading-tight">
            Top Performers
          </p>

          <div className="flex flex-wrap gap-1 mt-1">
            {performersData.map((item, i) => (
              <span
                key={i}
                className="text-[11px] px-1.5 py-[2px] text-blue-700 rounded-full break-words"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* TOP LEADERS */}
        <div className="flex-1 min-w-0 bg-orange-50/30 rounded-md pt-1 px-1.5 pb-1">
          <p className="font-semibold text-[10px] text-gray-500 uppercase leading-tight">
            Top Leaders
          </p>

          <div className="flex flex-wrap gap-1 mt-1">
            {leadersData.map((item, i) => (
              <span
                key={i}
                className="text-[11px] px-1.5 py-[2px]  text-orange-700 rounded-full  break-words"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformersCard;
