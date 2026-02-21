// importing tools
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import { uploadImage } from "../common/aws";

// Upload image from file input
const uploadImageByFile = async (file) => {
  try {
    const url = await uploadImage(file);
    return {
      success: 1,
      file: { url },
    };
  } catch (err) {
    console.error("EditorJS file upload failed:", err.message);
    return {
      success: 0,
      error: err.message || "File upload failed",
    };
  }
};

// Upload image by URL (already hosted image)
const uploadImageByURL = async (url) => {
  try {
    return {
      success: 1,
      file: { url },
    };
  } catch (err) {
    console.error("EditorJS URL upload failed:", err.message);
    return {
      success: 0,
      error: err.message || "URL upload failed",
    };
  }
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByFile: uploadImageByFile,
        uploadByUrl: uploadImageByURL,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading .......",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
