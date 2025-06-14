"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface DirectAssessmentProps {
  ratings: Record<string, number>;
  setRatings: (ratings: Record<string, number>) => void;
  overallRating: number;
}

export function DirectAssessment({
  ratings,
  setRatings,
  overallRating,
}: DirectAssessmentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Direct Assessment Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Overall Translation Quality</h4>
              <p className="text-sm text-muted-foreground">
                Rate the overall quality of the translation
              </p>
            </div>
            <div className="w-16 text-right">
              <span className="text-2xl font-bold">{ratings.quality || 0}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <Slider
            value={[ratings.quality || 0]}
            onValueChange={([value]) => setRatings({ quality: value })}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Overall Rating</h4>
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
