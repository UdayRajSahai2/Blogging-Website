import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getPageByPath } from "../../api/page.api.js";

import PageNotFound from "../404.page.jsx";

import BannerSection from "../../components/admin/dynamicPages/BannerSection.jsx";
import ContentSection from "../../components/admin/dynamicPages/ContentSection.jsx";

/* COMPONENT MAP */
const componentMap = {
  banner: BannerSection,
  content: ContentSection,
};

const PageRenderer = () => {
  const location = useLocation();

  const [page, setPage] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPage = async () => {
      try {
        setLoading(true);

        const res = await getPageByPath(location.pathname);

        if (mounted) {
          setPage(res.data);
        }
      } catch (error) {
        console.error("Page fetch failed:", error);

        if (mounted) {
          setPage(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  /* LOADING */
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading page...</p>
      </div>
    );
  }

  /* 404 */
  if (!page) {
    return <PageNotFound />;
  }

  return (
    <div className="p-2 max-w-full mx-auto">
      {/* PAGE TITLE */}
      {page.title && (
        <h1 className="text-[14px] font-bold mb-2">{page.title}</h1>
      )}

      {/* DYNAMIC SECTION RENDERER */}
      {page.sections?.length > 0 ? (
        page.sections.map((section, index) => {
          const Component = componentMap[section.type];

          /* UNKNOWN SECTION */
          if (!Component) {
            console.warn(`Unknown section type: ${section.type}`);

            return null;
          }

          return <Component key={`${section.type}-${index}`} data={section} />;
        })
      ) : (
        <p className="text-sm text-gray-500">Coming soon...</p>
      )}
    </div>
  );
};

export default PageRenderer;
