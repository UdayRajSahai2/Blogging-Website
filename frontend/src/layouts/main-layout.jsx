// frontend\src\layouts\main-layout.jsx
import { Outlet } from "react-router-dom";

const MainLayout = ({ left, right }) => {
  return (
    <section className="w-full px-0.5 md:px-1 lg:px-1 mt-1">
      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)_250px] gap-1">
        {/* LEFT */}
        <aside className="order-2 xl:order-1 w-full xl:sticky xl:top-20 h-fit">
          {left}
        </aside>

        {/* CENTER */}
        <main className="order-1 xl:order-2 w-full min-w-0">
          <Outlet />
        </main>

        {/* RIGHT */}
        <aside className="order-3 w-full xl:sticky xl:top-20 h-fit">
          {right}
        </aside>
      </div>
    </section>
  );
};

export default MainLayout;
