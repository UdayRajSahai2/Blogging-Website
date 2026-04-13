// import { Quote } from "@editorjs/quote";

const Img = ({ url, caption }) => {
  return (
    <figure className="my-6">
      <img
        src={url}
        alt={caption || "blog image"}
        className="w-full rounded-lg object-cover"
      />

      {caption?.length ? (
        <figcaption className="text-center mt-3 text-sm text-gray-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <blockquote className="my-6 border-l-4 border-purple-500 pl-5 italic bg-purple-50 py-4 rounded-r-lg">
      <p className="text-lg md:text-xl leading-relaxed">{quote}</p>

      {caption?.length ? (
        <cite className="block mt-2 text-sm text-purple-600">— {caption}</cite>
      ) : null}
    </blockquote>
  );
};

const List = ({ style, items }) => {
  return (
    <ol
      className={`pl-6 my-6 space-y-3 ${
        style === "ordered" ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((listItem, i) => (
        <li
          key={i}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: listItem }}
        />
      ))}
    </ol>
  );
};

const BlogContent = ({ block }) => {
  const { type, data } = block;

  if (type === "paragraph") {
    return (
      <p
        className="text-[16px] md:text-[18px] leading-7 md:leading-8 text-gray-800"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    );
  }

  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          className="text-2xl md:text-3xl font-bold mt-8 mb-4"
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      );
    }

    return (
      <h2
        className="text-3xl md:text-4xl font-bold mt-10 mb-5"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    );
  }

  if (type === "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }

  if (type === "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }

  if (type === "list") {
    return <List style={data.style} items={data.items} />;
  }

  return null;
};

export default BlogContent;
