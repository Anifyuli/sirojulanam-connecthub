
import { useState, useCallback } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Link2, Image, Quote, Code, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MdxEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Simple markdown to HTML preview
function renderMarkdownPreview(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto text-sm my-3"><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3">$1</blockquote>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline underline-offset-2 hover:text-primary/80">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-3" />')
    // Unordered list
    .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    // Ordered list
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/\n/g, '<br />');
  
  return `<div class="prose prose-sm max-w-none"><p class="my-3">${html}</p></div>`;
}

const toolbarButtons = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { icon: Italic, label: "Italic", prefix: "*", suffix: "*", placeholder: "italic text" },
  { icon: Heading1, label: "Heading 1", prefix: "# ", suffix: "", placeholder: "Heading 1" },
  { icon: Heading2, label: "Heading 2", prefix: "## ", suffix: "", placeholder: "Heading 2" },
  { icon: List, label: "Bullet List", prefix: "- ", suffix: "", placeholder: "List item" },
  { icon: ListOrdered, label: "Numbered List", prefix: "1. ", suffix: "", placeholder: "List item" },
  { icon: Quote, label: "Quote", prefix: "> ", suffix: "", placeholder: "Quote" },
  { icon: Code, label: "Code", prefix: "`", suffix: "`", placeholder: "code" },
  { icon: Link2, label: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
  { icon: Image, label: "Image", prefix: "![", suffix: "](url)", placeholder: "alt text" },
];

export function MdxEditor({ value, onChange, placeholder = "Write your content in Markdown...", minHeight = "300px" }: MdxEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");

  const insertMarkdown = useCallback((prefix: string, suffix: string, placeholder: string) => {
    const textarea = document.querySelector<HTMLTextAreaElement>("#mdx-textarea");
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    onChange(newValue);
    
    // Refocus and select the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }, [value, onChange]);

  return (
    <div className="border border-input rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        {toolbarButtons.map((btn) => (
          <Button
            key={btn.label}
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertMarkdown(btn.prefix, btn.suffix, btn.placeholder)}
            title={btn.label}
            disabled={mode === "preview"}
          >
            <btn.icon className="w-3.5 h-3.5" />
          </Button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2.5 rounded-none text-xs gap-1.5",
              mode === "write" && "bg-background shadow-sm"
            )}
            onClick={() => setMode("write")}
          >
            <Edit3 className="w-3 h-3" />
            Write
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2.5 rounded-none text-xs gap-1.5",
              mode === "preview" && "bg-background shadow-sm"
            )}
            onClick={() => setMode("preview")}
          >
            <Eye className="w-3 h-3" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor / Preview */}
      {mode === "write" ? (
        <Textarea
          id="mdx-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm"
          style={{ minHeight }}
        />
      ) : (
        <div 
          className="p-4 text-sm overflow-auto"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) || '<p class="text-muted-foreground italic">Nothing to preview yet...</p>' }}
        />
      )}
    </div>
  );
}
