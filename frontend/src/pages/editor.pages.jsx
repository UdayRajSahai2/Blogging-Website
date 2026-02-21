import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../App";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import { BLOG_API } from "../common/api";

/* ---------------- SAFE BLOG STRUCTURE ---------------- */

const blogStructure = {
  title: "",
  banner: "",
  content: { blocks: [] }, // EditorJS expects this
  tags: [],
  des: "",
  author: {},
};

/* ---------------- CONTEXT ---------------- */

export const EditorContext = createContext({
  blog: blogStructure,
  setBlog: () => {},
  editorState: "editor",
  setEditorState: () => {},
  textEditor: { isReady: false },
  setTextEditor: () => {},
});

/* ---------------- PAGE ---------------- */

const Editor = () => {
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  /* ---------------- FETCH BLOG (EDIT MODE) ---------------- */

  useEffect(() => {
    let ignore = false;

    const fetchBlog = async () => {
      // New blog
      if (!blog_id) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.post(`${BLOG_API}/get-blog`, {
          blog_id,
          draft: true,
          mode: "edit",
        });

        if (ignore) return;

        const apiBlog = data?.blog;

        if (!apiBlog) {
          setBlog(blogStructure);
          setLoading(false);
          return;
        }

        // Safe parsing
        const parsedContent =
          typeof apiBlog.content === "string"
            ? JSON.parse(apiBlog.content)
            : apiBlog.content || { blocks: [] };

        const parsedTags =
          typeof apiBlog.tags === "string"
            ? JSON.parse(apiBlog.tags)
            : Array.isArray(apiBlog.tags)
              ? apiBlog.tags
              : [];

        setBlog({
          ...apiBlog,
          content: parsedContent,
          tags: parsedTags,
        });
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(blogStructure);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBlog();

    return () => {
      ignore = true;
    };
  }, [blog_id]);

  /* ---------------- AUTH GUARD ---------------- */

  if (access_token === null) {
    return <Navigate to="/signin" replace />;
  }

  /* ---------------- LOADER ---------------- */

  if (loading) {
    return <Loader />;
  }

  /* ---------------- PROVIDER ---------------- */

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {editorState === "editor" ? <BlogEditor /> : <PublishForm />}
    </EditorContext.Provider>
  );
};

export default Editor;
