// frontend/src/components/admin/dynamicPages/ContentSectionFormToolbar.jsx

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignRight,
  Code2,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

const ContentSectionFormToolbar = ({ editor, insertImage, toolbarBtn }) => {
  if (!editor) return null;

  const toolbarItems = [
    // HISTORY
    {
      type: "button",
      title: "Undo",
      icon: Undo2,
      action: () => editor.chain().focus().undo().run(),
    },
    {
      type: "button",
      title: "Redo",
      icon: Redo2,
      action: () => editor.chain().focus().redo().run(),
    },

    { type: "divider" },

    // HEADINGS
    {
      type: "button",
      title: "Heading 1",
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      type: "button",
      title: "Heading 2",
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      type: "button",
      title: "Heading 3",
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },

    { type: "divider" },

    // TEXT STYLES
    {
      type: "button",
      title: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      type: "button",
      title: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      type: "button",
      title: "Underline",
      icon: Underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
    },
    {
      type: "button",
      title: "Strike Through",
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      type: "button",
      title: "Inline Code",
      icon: Code2,
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },

    { type: "divider" },

    // LISTS
    {
      type: "button",
      title: "Bullet List",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      type: "button",
      title: "Ordered List",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      type: "button",
      title: "Block Quote",
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },

    { type: "divider" },

    // ALIGNMENTS
    {
      type: "button",
      title: "Align Left",
      icon: AlignLeft,
      action: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
    },

    {
      type: "button",
      title: "Align Right",
      icon: AlignRight,
      action: () => editor.chain().focus().setTextAlign("right").run(),
      active: editor.isActive({ textAlign: "right" }),
    },

    { type: "divider" },

    // ELEMENTS
    {
      type: "button",
      title: "Horizontal Rule",
      icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },

    // IMAGES
    {
      type: "button",
      title: "Image Left",
      icon: ImageIcon,
      action: () => insertImage("left"),
    },

    {
      type: "button",
      title: "Image Right",
      icon: ImageIcon,
      action: () => insertImage("right"),
    },
  ];

  return (
    <div
      className="
  sticky top-0 z-10
  flex flex-wrap items-center gap-1
  rounded-t-lg border border-b-0
  bg-gray-50 p-1.5
"
    >
      {toolbarItems.map((item, index) => {
        if (item.type === "divider") {
          return <div key={index} className="mx-1 h-6 w-px bg-gray-300" />;
        }

        const Icon = item.icon;

        return (
          <button
            key={index}
            type="button"
            title={item.title}
            onClick={item.action}
            className={toolbarBtn(item.active)}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
};

export default ContentSectionFormToolbar;
