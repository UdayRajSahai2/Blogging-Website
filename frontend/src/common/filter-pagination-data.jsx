import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
  user,
}) => {
  const config = {};

  if (user) {
    config.headers = {
      Authorization: `Bearer ${user}`,
    };
  }

  // 🔑 SAFE dynamic unique key resolver
  const getUniqueKey = (item) => item?.blog_id ?? item?._id ?? item?.id ?? null;

  // ✅ APPEND MODE
  if (state !== null && !create_new_arr) {
    const merged = [...state.results, ...data].reduce((acc, item) => {
      const key = getUniqueKey(item);

      // 🚨 If no key, push anyway (prevents data loss)
      if (!key || !acc.some((n) => getUniqueKey(n) === key)) {
        acc.push(item);
      }
      return acc;
    }, []);

    return {
      ...state,
      results: merged,
      page,
    };
  }

  // ✅ SAFETY
  if (!countRoute) {
    console.error("countRoute is missing in filterPaginationData");
    return {
      results: data,
      page: 1,
      totalDocs: data.length,
    };
  }

  // ✅ RESET MODE
  try {
    const response = await axios.post(countRoute, data_to_send, config);

    return {
      results: data,
      page: 1,
      totalDocs: response.data.totalDocs ?? 0,
    };
  } catch (err) {
    console.error("Error fetching total docs:", err);
    return {
      results: data,
      page: 1,
      totalDocs: 0,
    };
  }
};
