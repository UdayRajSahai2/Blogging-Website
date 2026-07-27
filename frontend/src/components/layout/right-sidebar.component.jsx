import React from "react";

import AdSenseBlock from "./AdSenseBlock";
import TrendingCard from "./TrendingCard";
import TopPerformersCard from "./TopPerformersCard";
import ChatCard from "./ChatCard";
import JobsCard from "./JobsCard";
import EventsCard from "./EventsCard";
import GovtSchemesCard from "./GovtSchemesCard";
import ToursFlipCard from "./ToursFlipCard";

const RightSidebar = () => {
  return (
    <div className="order-3 w-full lg:sticky lg:top-20">
      <div className="flex flex-col gap-1 w-full">
        <TrendingCard />
        <TopPerformersCard />
        <AdSenseBlock />
        <ChatCard />
        <JobsCard />
        <EventsCard />
        <GovtSchemesCard />
        <ToursFlipCard />
      </div>
    </div>
  );
};

export default React.memo(RightSidebar);
