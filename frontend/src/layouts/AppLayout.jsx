//frontend\src\layouts\AppLayout.jsx
import Navbar from "../components/home/navbar.component";
import MainLayout from "./main-layout";
import LeftSidebar from "../components/layout/left-sidebar.component";
import RightSidebar from "../components/layout/right-sidebar.component";
import Footer from "../components/home/footer.component";
import HomeTopSection from "../components/home/home-top-section";
import { useContext } from "react";
import { UserContext } from "../App";
// 🌐 Global App Layout (Navbar + Sidebars + Center)
const AppLayout = ({ loadBlogByCategory, pageState }) => {
  const { userAuth } = useContext(UserContext);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <Navbar onInterestClick={loadBlogByCategory} activeInterest={pageState} />

      {/*TOP SECTION */}
      <div className="shrink-0">
        <HomeTopSection pageState={pageState} />
      </div>
      {/* MAIN CONTENT */}
      <div className="flex-1">
        <MainLayout
          left={<LeftSidebar userAuth={userAuth} />}
          right={<RightSidebar userAuth={userAuth} />}
        />
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default AppLayout;
