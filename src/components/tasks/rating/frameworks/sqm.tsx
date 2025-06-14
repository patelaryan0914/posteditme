"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface SQMRatingProps {
  ratings: Record<string, number>;
  setRatings: (ratings: Record<string, number>) => void;
  overallRating: number;
}

const SQM_CATEGORIES = [
  { id: "accuracy", label: "Accuracy", description: "Meaning transfer errors" },
  { id: "language", label: "Language", description: "Language quality issues" },
  { id: "terminology", label: "Terminology", description: "Term usage errors" },
  { id: "style", label: "Style", description: "Style guide compliance" },
  {
    id: "design",
    label: "Design",
    description: "Layout and formatting issues",
  },
];

export function SQMRating({
  ratings,
  setRatings,
  overallRating,
}: SQMRatingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Source Quality Metric Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {SQM_CATEGORIES.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{category.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <div className="w-16 text-right">
                <span className="text-2xl font-bold">
                  {ratings[category.id] || 0}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <Slider
              value={[ratings[category.id] || 0]}
              onValueChange={([value]) =>
                setRatings({ ...ratings, [category.id]: value })
              }
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Overall Quality Rating</h4>
            <div>
              <span className="text-3xl font-bold">
                {Math.round(overallRating)}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          <Progress value={overallRating} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}
