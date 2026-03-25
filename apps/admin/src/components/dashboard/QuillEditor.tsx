import { useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  [{ align: [] }],
  ["clean"],
];

export function QuillEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel...",
  minHeight = "300px",
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  onChangeRef.current = onChange;
  valueRef.current = value;

  // Initialize Quill once
  useLayoutEffect(() => {
    if (!editorRef.current) return;

    // Prevent double toolbar: clear container before init
    const container = editorRef.current;
    container.innerHTML = "";

    const quill = new Quill(container, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder,
    });

    quillRef.current = quill;

    // Set initial value
    if (valueRef.current) {
      quill.root.innerHTML = valueRef.current;
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChangeRef.current(html === "<p><br></p>" ? "" : html);
    });

    return () => {
      quillRef.current = null;
      // Remove all Quill DOM nodes from the wrapper
      const wrapper = container.parentElement;
      if (wrapper) {
        const toolbar = wrapper.querySelector(".ql-toolbar");
        if (toolbar) toolbar.remove();
      }
      container.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value prop
  useEffect(() => {
    if (!quillRef.current) return;
    const current = quillRef.current.root.innerHTML;
    const normalized = current === "<p><br></p>" ? "" : current;
    if (value !== normalized) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div className="rounded-xl border border-input overflow-hidden bg-background">
      <div ref={editorRef} style={{ minHeight }} />
    </div>
  );
}
