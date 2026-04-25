import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
import AdSenseBlock from "./AdSenseBlock";
import YourSpaceCard from "./YourSpaceCard";
import ReachInitiativesCard from "./ReachInitiativesCard";
import HelplineCard from "./HelplineCard";
import EducationPanelCard from "./EducationPanelCard";
import MatrimonyCard from "./MatrimonyCard";
import ProductsCard from "./ProductsCard";
import ServicesCard from "./ServicesCard";
const LeftSidebar = ({ trendingBlogs }) => {
  const { userAuth } = useContext(UserContext);
  const [donorProfile, setDonorProfile] = useState(null);

  return (
    <aside className="order-2 lg:order-1 w-full lg:sticky lg:top-20">
      <div className="flex flex-col gap-1 w-full">
        <YourSpaceCard />
        {/* REACH INITIATIVES */}
        <ReachInitiativesCard userAuth={userAuth} donorProfile={donorProfile} />

        {/* ADSENSE */}
        <AdSenseBlock />
        {/* HELP LINE */}
        <HelplineCard />

        {/* FLIPPING PANELS */}
        <EducationPanelCard />

        {/* MATRIMONY */}
        <MatrimonyCard />

        {/* PRODUCTS */}
        <ProductsCard />

        {/* SERVICES */}
        <ServicesCard />
      </div>
    </aside>
  );
};

export default LeftSidebar;
