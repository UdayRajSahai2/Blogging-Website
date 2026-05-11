// ENABLE ONLY READY PAGES HERE
//  Add routes ONLY when page/component is implemented
//  Keep "/" always enabled (Home page)

export const enabledRoutes = ["/"];

export const isRouteEnabled = (path) => {
  return enabledRoutes.some((route) => {
    if (route === "/") {
      return path === "/";
    }

    return path === route || path.startsWith(route + "/");
  });
};

// for temporarily check all tabs.
// export const isRouteEnabled = () => true;
// export const isRouteEnabled = () => false;

// Example:
// enableRoute("/news-discounts");
// If you want to enable whole section  automatically enables ALL children:/products/*

// menuData.js        builds menu (paths)
// enabledRoutes.js   defines which routes are active
// NavbarMenu.jsx     controls top-level clicks
// MenuItem.jsx      →controls nested clicks
// navbar.component.jsx  just renders NavbarMenu
