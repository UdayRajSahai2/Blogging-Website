import { DONOR_API } from "../../common/api";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import AdSenseBlock from "./AdSenseBlock";
import TrendingCard from "./TrendingCard";
import TopPerformersCard from "./TopPerformersCard";
import ChatCard from "./ChatCard";
import JobsCard from "./JobsCard";
import EventsCard from "./EventsCard";
import GovtSchemesCard from "./GovtSchemesCard";
import ToursFlipCard from "./ToursFlipCard";
const RightSidebar = () => {
  const { userAuth } = useContext(UserContext);

  return (
    <div className="order-3 w-full lg:sticky lg:top-20">
      <div className="flex flex-col gap-1 w-full">
        {/* TRENDING Card  */}
        <TrendingCard />
        {/* TOP PERFORMERS */}
        <TopPerformersCard />

        {/* ADS */}
        <AdSenseBlock />
        {/* CHAT */}
        <ChatCard />

        {/* JOBS */}
        <JobsCard />

        {/* EVENTS GRID */}
        <EventsCard />

        {/* GOVT SCHEMES */}
        <GovtSchemesCard />

        {/* TOURS */}
        <ToursFlipCard />
      </div>
    </div>
  );
};

export default RightSidebar;
