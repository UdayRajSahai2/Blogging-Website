import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { createContext } from "react";
import Loader from "../components/loader.component";
import axios from "axios";

const blogStructure = {
  title: "",
  banner: "",
  content: { blocks: [] }, // EditorJS expects this format
  tags: [],
  des: "",
  author: {},
};

export const EditorContext = createContext({});
const Editor = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  useEffect(() => {
    if (!blog_id) {
      return setLoading(false);
    }
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        console.log("Raw API response:", blog);
        console.log("Content type:", typeof blog.content);
        const parsedContent = typeof blog.content === 'string' 
        ? JSON.parse(blog.content) 
        : blog.content;
        const parsedTags = typeof blog.tags === 'string' 
        ? JSON.parse(blog.tags) 
        : Array.isArray(blog.tags) ? blog.tags : [];
        setBlog({
          ...blog,
          content: parsedContent || { blocks: [] }, // Fallback if empty
          tags: parsedTags // Ensure tags is always an array
        });
        setLoading(false);
      })
      .catch(err => {
        console.log("Error fetching blog:", err);
        setBlog(blogStructure);
        setLoading(false);
      })
  }, [blog_id]);
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
      {access_token === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
