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

  return (
    <div className="mb-4">
      {allTags.length === 0 ? (
        <div className="text-xs text-text-muted py-2">
          Теги появятся, когда администратор добавит их к заданиям
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted">Теги:</span>
            {selectedTags.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-text-muted hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Сбросить
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
                    className={`cursor-pointer text-xs py-0.5 px-2 transition-all ${
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
        </>
      )}
    </div>
  );
}
