//frontend\src\pages\notifications.page.jsx
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import axios from "axios";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { NOTIFICATION_API } from "../common/api";

const Notification = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

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
        countRoute: `${NOTIFICATION_API}/all-notifications-count`, // ✅ MUST EXIST
        data_to_send: { filter },
        user: access_token,
        create_new_arr,
      });

      setNotifications(formattedData);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  // 🔄 Refresh safely
  const refreshNotifications = () => {
    if (access_token) {
      fetchNotifications({
        page: 1,
        create_new_arr: true,
      });
    }
  };

  // 🔥 Initial load & filter change
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
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>

      <div className="my-8 flex gap-6">
        {filters.map((filterName) => (
          <button
            key={filterName}
            data-filter={filterName}
            className={
              "py-2 " + (filter === filterName ? "btn-dark" : "btn-light")
            }
            onClick={handleFilter}
          >
            {capitalizeFilter(filterName)}
          </button>
        ))}
      </div>

      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((notification, i) => (
              <AnimationWrapper
                key={notification.id} // CRITICAL
                transition={{ delay: i * 0.08 }}
              >
                <NotificationCard
                  data={notification}
                  index={i}
                  notificationState={{ notifications, setNotifications }}
                  refreshNotifications={refreshNotifications}
                />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataMessage message="Nothing available" />
          )}

          <LoadMoreDataBtn
            state={notifications}
            fetchDataFun={fetchNotifications}
            additionalParam={{
              deletedDocCount: notifications.deletedDocCount,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Notification;
