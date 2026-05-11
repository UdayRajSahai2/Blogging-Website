import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPageByPath } from "../../api/page.api.js";
import PageNotFound from "../404.page.jsx";

/* SECTION COMPONENTS */
const HeroSection = ({ data }) => {
  return (
    <section className="flex flex-col md:flex-row gap-6 mb-2">
      {/* LEFT IMAGE */}
      <div className="w-full md:w-[320px] shrink-0">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1">
        <h4 className="text-[14px] font-bold mt-0  mb-2">{data.title}</h4>
        <p className="text-gray-700 leading-7 mb-2">{data.description}</p>

        {/* STATS */}
        {data.stats?.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {data.stats.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 text-center">
                <h3 className="text-xl font-bold">{item.value}</h3>

                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* GALLERY */}
        {data.gallery?.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {data.gallery.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const TextSection = ({ data }) => {
  return (
    <section className="mb-4">
      <h3 className="text-xl font-semibold mb-1">{data.heading}</h3>

      <p className="text-sm leading-6 text-gray-700">{data.content}</p>
    </section>
  );
};
const CardSection = ({ data }) => {
  return (
    <section className="mb-2">
      <h2 className="text-[12px] font-bold mb-4">{data.heading}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.cards.map((card, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-2xl mb-2">{card.title}</h4>

            <p className="text-[12px] text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* COMPONENT MAP */
const componentMap = {
  hero: HeroSection,
  text: TextSection,
  cards: CardSection,
};

const PageRenderer = () => {
  const location = useLocation();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getPageByPath(location.pathname)
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!page) return <PageNotFound />;

  return (
    <div className="p-2 max-w-full mx-auto">
      <h1 className="text-[14px] font-bold ">{page.title}</h1>

      {/* NEW JSON SECTION RENDERER */}
      {page.sections?.length > 0 ? (
        <>
          {page.sections.map((section, index) => {
            const Component = componentMap[section.type];

            if (!Component) return null;

            return <Component key={index} data={section} />;
          })}
        </>
      ) : (
        <p>Coming soon...</p>
      )}

      {/* CHILD PAGES */}
      {page.children?.length > 0 && (
        <section className="mt-2">
          <h4 className="text-[12px] font-bold mb-3">Explore More</h4>

          <div className="flex flex-wrap gap-3">
            {page.children.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                className="
            px-4
            py-2
            border
            rounded-full
            hover:bg-gray-100
            transition
            text-sm
            font-medium
          "
              >
                {child.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PageRenderer;
