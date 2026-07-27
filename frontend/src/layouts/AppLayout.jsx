//frontend\src\layouts\AppLayout.jsx
import Navbar from "../components/home/navbar.component";
import MainLayout from "./main-layout";
import LeftSidebar from "../components/layout/left-sidebar.component";
import RightSidebar from "../components/layout/right-sidebar.component";
import Footer from "../components/home/footer.component";
import HomeTopSection from "../components/home/home-top-section";
import { useContext, useEffect } from "react";
import { UserContext } from "../App";
import { useLocation } from "react-router-dom";
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      if (pathname === "/") {
        // Homepage → instant (feels correct)
        window.scrollTo({ top: 0, behavior: "auto" });
      } else {
        // Other pages → smooth scroll
        window.scrollTo({ top: 400, behavior: "smooth" });
      }
    });
  }, [pathname]);

  return null;
};

// Global App Layout (Navbar + Sidebars + Center)
const AppLayout = ({ loadBlogByCategory, pageState }) => {
  const { userAuth, profile } = useContext(UserContext);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* NAVBAR */}
      <Navbar
        onInterestClick={loadBlogByCategory}
        activeInterest={pageState}
        profile={profile}
      />

      {/*TOP SECTION */}
      <div className="shrink-0">
        <HomeTopSection pageState={pageState} />
      </div>
      {/* MAIN CONTENT */}
      <div id="top-section" className="flex-1">
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
