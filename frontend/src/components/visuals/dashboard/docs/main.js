import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Blockquote from "@tiptap/extension-blockquote";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState, useCallback } from "react";
import javascript from "highlight.js/lib/languages/javascript";
import { createLowlight } from "lowlight";
import { sanitizeURL } from "../../../../utility/sanitize_urls";
import { useOutsideAlerter } from "../../../../utility/outsideClickDetection";

const lowlight = createLowlight();
lowlight.register("js", javascript);

// In case I want to add support for more languages:
// https://tiptap.dev/docs/examples/advanced/syntax-highlighting

const MenuBar = ({ editor, setIsAddingLink }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="menu-bar d-flex">
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <span className="material-symbols-outlined inline-icon">undo</span>
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <span className="material-symbols-outlined inline-icon">redo</span>
      </button>
      <div className="vertical-line" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">format_h1</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">format_h2</span>
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          format_paragraph
        </span>
      </button>
      <div className="vertical-line" />
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          format_bold
        </span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          format_italic
        </span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          format_underlined
        </span>
      </button>
      {!editor.isActive("link") ? (
        <button
          onClick={() => setIsAddingLink(true)}
          className={editor.isActive("link") ? "is-active" : ""}
        >
          <span className="material-symbols-outlined inline-icon">link</span>
        </button>
      ) : (
        <button onClick={() => editor.chain().focus().unsetLink().run()}>
          <span className="material-symbols-outlined inline-icon">
            link_off
          </span>
        </button>
      )}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">code</span>
      </button>
      <div className="vertical-line" />
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          data_object
        </span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          format_list_bulleted
        </span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
      >
        <span className="material-symbols-outlined inline-icon">
          format_list_numbered
        </span>
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <span className="material-symbols-outlined inline-icon">
          horizontal_rule
        </span>
      </button>
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  Link.extend({ inclusive: false }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  CodeBlockLowlight.configure({ lowlight }),
  Underline,
  Blockquote,
];

function LinkMenu({ editor, setIsAddingLink }) {
  const previousUrl = editor.getAttributes("link").href;

  const setLink = useCallback(
    (event) => {
      let url = event.target.value;

      if (url === null) {
        return;
      }

      // empty
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      // update link
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: sanitizeURL(url),
          target: "_blank",
        })
        .run();
    },
    [editor]
  );

  return (
    <div>
      <p>Link to another website</p>
      <input
        type="text"
        placeholder="Insert address"
        className="form-control"
        autoFocus
        defaultValue={previousUrl || undefined}
        onBlur={() => setIsAddingLink(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            console.log(event.target.value);
            setLink(event);
            setIsAddingLink(false);
          }
        }}
      ></input>
    </div>
  );
}

export default function DocsWindow({
  updateDocsData,
  setDocsVisibility,
  docsContent,
  isEditable,
  isDocsVisible,
}) {
  const editor = useEditor({
    extensions: extensions,
    content: docsContent,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      if (editor) {
        const content = editor.getJSON();
        console.log(content);
        updateDocsData(content);
      }
    },
  });

  const [_isDocsVisible, _setIsDocsVisible] = useState(isDocsVisible);

  function setIsDocsVisible(input) {
    console.log(input);
    setDocsVisibility(input);
    _setIsDocsVisible(input);
  }
  
  const [isAddingLink, setIsAddingLink] = useState(false);
  const linkPopupRef = React.useRef(null);
  useOutsideAlerter(linkPopupRef, setIsAddingLink);

  return (
    <div>
      {isEditable && (
        <div className="d-flex flex-column docs">
          <MenuBar editor={editor} setIsAddingLink={setIsAddingLink} />
          <button
            className={`btn ${
              _isDocsVisible
                ? "btn-light btn-outline-primary publish-button"
                : "btn-light btn-outline-dark publish-button"
            }  btn-docs-vis`}
            onClick={() => setIsDocsVisible(!_isDocsVisible)}
          >
            <div className="d-flex align-items-center">
              <span className="material-symbols-outlined inline-icon ms-n1 me-1">
                {_isDocsVisible ? "visibility" : "visibility_off"}
              </span>
              {_isDocsVisible ? "Visible" : "Hidden"}
            </div>
          </button>
        </div>
      )}
      <div className="scrollable-editor">
        <EditorContent editor={editor}></EditorContent>
      </div>
      {isAddingLink && (
        <div className="edit-background">
          <div className="edit-popup" ref={linkPopupRef}>
            <LinkMenu setIsAddingLink={setIsAddingLink} editor={editor} />
          </div>
        </div>
      )}
    </div>
  );
}
