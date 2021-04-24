import * as React from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { io } from "socket.io-client";
import { useParams } from "react-router";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
  const { documentId } = useParams();
  const intervalRef = React.useRef(null);
  const socketRef = React.useRef(null);
  const quillRef = React.useRef(null);
  const wrapperRef = React.useCallback((wrapper) => {
    if (wrapper === null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    quillRef.current = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    quillRef.current.disable();
    quillRef.current.setText("Loading...");
  }, []);
  React.useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("get-document", documentId);
    socketRef.current.on("load-document", (document) => {
      quillRef.current.setContents(document);
      quillRef.current.enable();
    });
    const handler = (delta, _, source) => {
      if (source !== "user") return;
      socketRef.current.emit("send-changes", delta);
    };
    quillRef.current.on("text-change", handler);
    return () => {
      socketRef.current.disconnect();
      quillRef.current.off("text-change");
    };
  }, []);
  React.useEffect(() => {
    intervalRef.current = setInterval(() => {
      socketRef.current.emit("save-changes", quillRef.current.getContents());
    }, 2000);
  }, []);
  React.useEffect(() => {
    const handle = (delta) => {
      quillRef.current.updateContents(delta);
    };
    socketRef.current.on("receive-changes", handle);
    return () => {
      socketRef.current.off("receive-changes", handle);
    };
  }, []);
  return <div className="container" ref={wrapperRef} />;
}
