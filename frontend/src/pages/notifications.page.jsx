//frontend\src\pages\notifications.page.jsx
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import axios from "axios";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { NOTIFICATION_API } from "../common/api";

const Notification = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);
  const notificationState = { notifications, setNotifications };

  const filters = ["all", "like", "comment", "reply"];

  const fetchNotifications = async ({
    page,
    deletedDocCount = 0,
    create_new_arr = false,
  }) => {
    try {
      const { data } = await axios.post(
        `${NOTIFICATION_API}/notifications`,
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const formattedData = await filterPaginationData({
        state: create_new_arr ? null : notifications,
        data: data.notifications,
        page,
        countRoute: `${NOTIFICATION_API}/all-notifications-count`, // MUST EXIST
        data_to_send: { filter },
        user: access_token,
        create_new_arr,
      });

      setNotifications(formattedData);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  //  Refresh safely
  const refreshNotifications = () => {
    if (access_token) {
      fetchNotifications({
        page: 1,
        create_new_arr: true,
      });
    }
  };

  // Initial load & filter change
  useEffect(() => {
    if (access_token) {
      fetchNotifications({
        page: 1,
        create_new_arr: true,
      });
    }
  }, [access_token, filter]);

  const handleFilter = (e) => {
    setFilter(e.target.dataset.filter);
  };

  const capitalizeFilter = (name) =>
    name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* 🔹 Header */}
      <h1 className="hidden md:block text-xl font-semibold text-gray-800">
        Recent Notifications
      </h1>

      {/* 🔹 Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filters.map((filterName) => (
          <button
            key={filterName}
            data-filter={filterName}
            onClick={handleFilter}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition
            ${
              filter === filterName
                ? "bg-black text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFilter(filterName)}
          </button>
        ))}
      </div>

      {/* 🔹 Content */}
      <div className="flex flex-col gap-4">
        {notifications === null ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : notifications?.results?.length ? (
          <>
            {notifications.results.map((notification) => (
              <AnimationWrapper key={notification._id}>
                <NotificationCard
                  data={notification}
                  notificationState={notificationState}
                  refreshNotifications={refreshNotifications}
                />
              </AnimationWrapper>
            ))}

            {/* 🔹 Load More */}
            <div className="flex justify-center mt-4">
              <LoadMoreDataBtn
                state={notifications}
                fetchDataFun={fetchNotifications}
                additionalParam={{
                  deletedDocCount: notifications.deletedDocCount,
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center py-10 text-gray-500 text-sm">
            <NoDataMessage message="Nothing available" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
