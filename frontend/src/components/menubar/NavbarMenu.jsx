import { useEffect, useState } from "react";

import { getMenu } from "../../api/menu.api";

import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

const NavbarMenu = () => {
  const [menuData, setMenuData] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    getMenu()
      .then((res) => setMenuData(res.data))
      .catch(() => setMenuData([]));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile ? (
    <MobileMenu menuData={menuData} />
  ) : (
    <DesktopMenu menuData={menuData} />
  );
};

export default NavbarMenu;
