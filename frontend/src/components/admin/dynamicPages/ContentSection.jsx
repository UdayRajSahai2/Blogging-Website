// frontend/src/components/menubar/ContentSection.jsx

const ContentSection = ({ data }) => {
  const imageBlock = data.image && (
    <div className="w-full shrink-0 md:w-[320px]">
      <div className="overflow-hidden rounded-lg border bg-gray-100">
        <img
          src={data.image}
          alt={data.heading}
          className="
            max-h-[420px]
            w-full
            object-contain
          "
        />
      </div>
    </div>
  );

  const contentBlock = (
    <div className="flex-1 min-w-0">
      {data.heading && (
        <h3
          className="

          text-[20px]
          font-semibold
          text-gray-900
        "
        >
          {data.heading}
        </h3>
      )}

      {data.content && (
        <div
          className="
          content-editor
          break-words
          leading-8
          text-gray-700
          text-justify
        "
          dangerouslySetInnerHTML={{
            __html: data.content,
          }}
        />
      )}
    </div>
  );

  /* DEFAULT LEFT */
  return (
    <section className="py-2">
      <div
        className="
        flex
        flex-col
        gap-8
      "
      >
        {contentBlock}
      </div>
    </section>
  );
};

export default ContentSection;
