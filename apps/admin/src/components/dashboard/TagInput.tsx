import { useState } from "react";
import { X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TagSuggestion {
  tag: string;
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  tagInput: string;                        // ← diangkat ke parent
  onTagInputChange: (val: string) => void; // ← diangkat ke parent
  suggestions?: TagSuggestion[];
  label?: string;
  placeholder?: string;
  id?: string;
}

export function TagInput({
  value,
  onChange,
  tagInput,
  onTagInputChange,
  suggestions = [],
  label = "Tag",
  placeholder = "Ketik tag lalu tekan Enter...",
  id = "tag-input",
}: TagInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    (s) => s.tag.toLowerCase().includes(tagInput.toLowerCase()) && !value.includes(s.tag)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    onTagInputChange("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-background shadow-md">
            {filteredSuggestions.slice(0, 5).map((s) => (
              <div
                key={s.tag}
                className="cursor-pointer px-3 py-2 hover:bg-muted"
                onMouseDown={(e) => { e.preventDefault(); addTag(s.tag); }}
              >
                {s.tag}
              </div>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
              <Tag className="h-3 w-3" />
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}