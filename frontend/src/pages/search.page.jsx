import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import UserCard from "../components/usercard.component";

import { filterPaginationData } from "../common/filter-pagination-data";
import { BLOG_API, USER_API } from "../common/api";
import { UserIcon } from "@heroicons/react/24/outline";
const SearchPage = () => {
  const { query } = useParams();

  const [blogsState, setBlogsState] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  // ================= BLOG FETCH =================
  const searchBlogs = useCallback(
    async ({ page = 1, create_new_arr = false }) => {
      try {
        const { data } = await axios.post(`${BLOG_API}/search-blogs`, {
          query,
          page,
        });

        const formatted = await filterPaginationData({
          state: blogsState,
          data: data.blogs,
          page,
          countRoute: `${BLOG_API}/search-blogs-count`,
          data_to_send: { query },
          create_new_arr,
        });

        setBlogsState(formatted);
      } catch (err) {
        console.error(err);
        setError("Failed to load blogs");
      }
    },
    [query, blogsState],
  );

  // ================= USER FETCH =================
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.post(`${USER_API}/search-users`, {
        query,
      });
      setUsers(data.users);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  }, [query]);

  // ================= RESET =================
  useEffect(() => {
    setBlogsState(null);
    setUsers(null);
    setError(null);

    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  // ================= USER LIST =================
  const renderUsers = () => {
    if (users === null) return <Loader />;

    if (!users.length) return <NoDataMessage message="No users found" />;

    return users.map((user, i) => (
      <AnimationWrapper
        key={user._id || i}
        transition={{ duration: 0.5, delay: i * 0.05 }}
      >
        <UserCard user={user} />
      </AnimationWrapper>
    ));
  };

  // ================= BLOG LIST =================
  const renderBlogs = () => {
    if (blogsState === null) return <Loader />;

    if (!blogsState.results.length)
      return <NoDataMessage message="No blogs found" />;

    return (
      <>
        {blogsState.results.map((blog, i) => (
          <AnimationWrapper
            key={blog._id || i}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <BlogPostCard content={blog} author={blog.blogAuthor} />
          </AnimationWrapper>
        ))}

        <LoadMoreDataBtn state={blogsState} fetchDataFun={searchBlogs} />
      </>
    );
  };

  // ================= UI =================
  return (
    <section className=" h-cover flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 pt-4">
      {/* LEFT SIDE */}
      <main className="w-full lg:flex-1 min-w-0">
        {/* MOBILE USERS */}
        <div className="lg:hidden mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Accounts Matched
            <UserIcon className="w-5 h-5" />
          </h4>

          {renderUsers()}
        </div>

        {/* TABS */}
        <InPageNavigation
          routes={[`Results for "${query}"`, "Users"]}
          defaultHidden={["Users"]}
        >
          {error ? <NoDataMessage message={error} /> : renderBlogs()}
          {renderUsers()}
        </InPageNavigation>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden lg:block w-[300px] border-l pl-6 pt-2">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Accounts Matched
          <UserIcon className="w-5 h-5" />
        </h4>

        {renderUsers()}
      </aside>
    </section>
  );
};

export default SearchPage;
