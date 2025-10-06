import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagsFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagsFilter({ allTags, selectedTags, onTagsChange }: TagsFilterProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
  };

  if (allTags.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-muted">Фильтр по тегам</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-text-muted hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Очистить
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="transition-all"
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "hover:bg-primary/10"
                }`}
              >
                {tag}
              </Badge>
            </button>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <p className="text-xs text-text-muted mt-2">
          Выбрано тегов: {selectedTags.length}
        </p>
      )}
    </div>
  );
}
