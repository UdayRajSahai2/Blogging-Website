//frontend\src\context\blog.context.jsx
import { createContext } from "react";

export const blogStructure = {
  title: "",
  des: "",
  content: { time: 0, blocks: [], version: "" },
  tags: [],
  blogAuthor: {},
  banner: "",
  publishedAt: "",
  status: "",
  is_deleted: false,
  review_note: "",
};

export const BlogContext = createContext({});
