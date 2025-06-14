"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Tag {
  start: number;
  end: number;
  label: string;
}

interface TaggedTextProps {
  text: string;
  tags: Tag[];
  onRemoveTag?: (index: number) => void;
  onTextSelect?: (start: number, end: number, text: string) => void;
  isInteractive?: boolean;
}

interface BaseSegment {
  text: string;
  isTag: boolean;
}

interface TagSegment extends BaseSegment {
  isTag: true;
  tag: Tag;
  tagIndex: number;
}

interface TextSegment extends BaseSegment {
  isTag: false;
}

type Segment = TagSegment | TextSegment;

const TAG_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
];

export function TaggedText({
  text,
  tags,
  onRemoveTag,
  onTextSelect,
  isInteractive = true,
}: TaggedTextProps) {
  // Create segments that include both tagged and untagged text
  const segments = useMemo<Segment[]>(() => {
    const sortedTags = [...tags].sort((a, b) => a.start - b.start);
    const segments: Segment[] = [];
    let currentPos = 0;

    sortedTags.forEach((tag, index) => {
      // Add untagged text before this tag
      if (tag.start > currentPos) {
        segments.push({
          text: text.slice(currentPos, tag.start),
          isTag: false,
        } as TextSegment);
      }

      // Add the tagged text
      segments.push({
        text: text.slice(tag.start, tag.end),
        tag,
        tagIndex: index,
        isTag: true,
      } as TagSegment);

      currentPos = tag.end;
    });

    // Add any remaining untagged text
    if (currentPos < text.length) {
      segments.push({
        text: text.slice(currentPos),
        isTag: false,
      } as TextSegment);
    }

    return segments;
  }, [text, tags]);

  const handleTextSelection = () => {
    if (!isInteractive || !onTextSelect) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.parentElement;
    if (!container?.classList.contains("taggable-text")) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const start = range.startOffset;
    const end = range.endOffset;

    onTextSelect(start, end, selectedText);
  };

  // Type guard to check if a segment is a TagSegment
  // const isTagSegment = (segment: Segment): segment is TagSegment => segment.isTag;

  return (
    <div
      className="taggable-text bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-lg p-6 shadow-inner"
      onMouseUp={handleTextSelection}
    >
      {segments.map((segment, index) => {
        if (!segment.isTag) {
          return <span key={index}>{segment.text}</span>;
        }

        // TypeScript now knows this is a TagSegment
        const tag = segment.tag;
        const colorIndex = tag.label.length % TAG_COLORS.length;

        return (
          <Badge
            key={index}
            variant="secondary"
            className={`mx-1 ${TAG_COLORS[colorIndex]}`}
          >
            <span>{segment.text}</span>
            <span className="mx-1 text-xs opacity-75">({tag.label})</span>
            {onRemoveTag && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-white/20"
                onClick={() => onRemoveTag(segment.tagIndex!)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
