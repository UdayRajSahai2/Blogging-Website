// frontend/src/components/admin/pages/ContentSectionForm.jsx

import { useRef } from "react";

import axios from "axios";

import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import Image from "@tiptap/extension-image";

import { uploadImage } from "../../../common/aws";
import { compressImage } from "../../../common/compressImage";
import { UPLOAD_API } from "../../../common/api";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";

import ContentSectionFormToolbar from "../dynamicPages/ContentSectionFormToolbar";
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      align: {
        default: "left",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      {
        ...HTMLAttributes,

        class:
          HTMLAttributes.align === "right"
            ? "editor-image-right"
            : "editor-image-left",
      },
    ];
  },
});

const inputClass =
  "w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500";

const labelClass = "mb-1 block text-xs font-medium text-gray-700";

const helperClass = "mb-1 text-xs text-gray-500";

// EXTRACT IMAGES FROM HTML
const extractImagesFromHTML = (html) => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, "text/html");

  return Array.from(doc.querySelectorAll("img")).map((img) => img.src);
};

const ContentSectionForm = ({ section, onChange }) => {
  // TRACK EXISTING IMAGES
  const previousImagesRef = useRef(
    extractImagesFromHTML(section.content || ""),
  );
  const toolbarBtn = (active) =>
    `
    flex items-center gap-1
    rounded-md
    border
    px-3 py-2
    text-sm
    transition-all
    hover:bg-gray-100
    ${
      active
        ? "bg-blue-100 border-blue-300 text-blue-700"
        : "bg-white border-gray-200"
    }
  `;

  // TIPTAP EDITOR
  const editor = useEditor({
    extensions: [
      StarterKit,

      Highlight,

      Placeholder.configure({
        placeholder: "Start writing content here...",
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      CustomImage.extend({
        inline() {
          return false;
        },

        group() {
          return "block";
        },
      }).configure({
        allowBase64: false,
      }),
    ],

    content: section.content || "",

    onUpdate: async ({ editor }) => {
      let html = editor.getHTML();

      // CLEAN HTML
      html = html.replace(/<p>\s*<\/p>/gi, "");

      html = html.replace(/<p>(<img[^>]*>)<\/p>/gi, "$1");

      // SAVE CONTENT
      onChange({
        ...section,
        content: html,
      });

      // CURRENT IMAGES
      const currentImages = extractImagesFromHTML(html);

      // REMOVED IMAGES
      const removedImages = previousImagesRef.current.filter(
        (img) => !currentImages.includes(img),
      );

      // DELETE REMOVED IMAGES FROM S3
      for (const imageUrl of removedImages) {
        try {
          const key = imageUrl.split(".amazonaws.com/")[1];

          if (key) {
            await axios.delete(`${UPLOAD_API}/delete`, {
              data: { key },
            });
          }
        } catch (err) {
          console.error(err);
        }
      }

      previousImagesRef.current = currentImages;
    },
  });

  // NORMAL INPUT CHANGE
  const handleChange = (e) => {
    onChange({
      ...section,
      [e.target.name]: e.target.value,
    });
  };

  // INSERT IMAGE
  const insertImage = async (position = "left") => {
    if (!editor) return;

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*";

    input.click();

    input.onchange = async () => {
      const file = input.files[0];

      if (!file) return;

      try {
        // COMPRESS IMAGE
        const compressedFile = await compressImage(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1400,
        });

        // UPLOAD TO S3
        const uploaded = await uploadImage(
          compressedFile,
          "admin-content/content-section-images",
        );

        // INSERT IMAGE INTO EDITOR
        editor
          .chain()
          .focus()
          .setImage({
            src: uploaded.fileURL,
            align: position,
          })
          .run();
      } catch (err) {
        console.error(err);
      }
    };
  };

  return (
    <div className="space-y-4">
      {/* INFO */}
      <div
        className="
          rounded
          border
          border-blue-100
          bg-blue-50
          px-3
          py-2
          text-xs
          text-blue-700
        "
      >
        Add image and paragraph content for this page section.
      </div>

      {/* HEADING */}
      <div>
        <label className={labelClass}>Section Heading</label>

        <p className={helperClass}>Main heading shown for this content block</p>

        <input
          type="text"
          name="heading"
          value={section.heading || ""}
          onChange={handleChange}
          className={inputClass}
          placeholder="About Us"
        />
      </div>

      <ContentSectionFormToolbar
        editor={editor}
        insertImage={insertImage}
        toolbarBtn={toolbarBtn}
      />

      {/* CONTENT */}
      <div>
        <label className={labelClass}>Content</label>

        <p className={helperClass}>Rich text editor</p>

        <div
          className="
    overflow-hidden
    rounded-b-lg
    border
    border-gray-300
    bg-white
    shadow-sm

    [&_.ProseMirror]:min-h-[400px]
    [&_.ProseMirror]:p-6
    [&_.ProseMirror]:outline-none
    [&_.ProseMirror]:text-[15px]
    [&_.ProseMirror]:leading-8
    [&_.ProseMirror]:text-gray-800

    [&_.ProseMirror_h1]:text-3xl
    [&_.ProseMirror_h1]:font-bold

    [&_.ProseMirror_h2]:text-2xl
    [&_.ProseMirror_h2]:font-semibold

    [&_.ProseMirror_p]:mb-4

    [&_.ProseMirror_ul]:list-disc
    [&_.ProseMirror_ul]:pl-6

    [&_.ProseMirror_ol]:list-decimal
    [&_.ProseMirror_ol]:pl-6

    [&_.ProseMirror_blockquote]:border-l-4
    [&_.ProseMirror_blockquote]:border-gray-300
    [&_.ProseMirror_blockquote]:pl-4
    [&_.ProseMirror_blockquote]:italic

    [&_.ProseMirror_code]:rounded
    [&_.ProseMirror_code]:bg-gray-100
    [&_.ProseMirror_code]:px-1

    [&_.ProseMirror_pre]:overflow-auto
    [&_.ProseMirror_pre]:rounded-lg
    [&_.ProseMirror_pre]:bg-gray-900
    [&_.ProseMirror_pre]:p-4
    [&_.ProseMirror_pre]:text-white
  "
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default ContentSectionForm;
