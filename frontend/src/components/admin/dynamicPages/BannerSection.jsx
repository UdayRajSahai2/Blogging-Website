const BannerSection = ({ data }) => {
  return (
    <section className="space-y-5">
      {/* TOP SECTION */}
      <div
        className="
          grid
          gap-8
          items-start
          md:grid-cols-[420px_1fr]
        "
      >
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* MAIN IMAGE */}
          <div
            className="
    h-[320px]
    overflow-hidden
    rounded-2xl
    bg-gray-50
    flex
    items-center
    justify-center
    p-2
  "
          >
            <img
              src={data.image}
              alt={data.title}
              className="
      max-h-full
      max-w-full
      object-contain
    "
            />
          </div>
          {/* GALLERY */}
          {data.gallery?.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {data.gallery.map((img, index) => (
                <div
                  key={index}
                  className="
                    h-24
                    overflow-hidden
                    rounded-xl
                    bg-gray-50
                  "
                >
                  <img
                    src={img}
                    alt={`gallery-${index}`}
                    className="
                      h-full
                      w-full
                      object-fill
                    "
                  />
                </div>
              ))}
            </div>
          )}

          {/* STATS */}
          {data.stats?.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {data.stats.map((item, index) => (
                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    p-4
                    text-center
                  "
                >
                  <h3 className="text-lg font-bold">{item.value}</h3>

                  <p className="mt-1 text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div
          className="
            flex
            h-full
            flex-col
            justify-start
          "
        >
          <h4
            className="
              
              text-2xl
              font-bold
              leading-tight
              text-gray-900
            "
          >
            {data.title}
          </h4>

          <p
            className="
              text-[14px]
              leading-8
              text-gray-700
              text-justify
            "
          >
            {data.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
