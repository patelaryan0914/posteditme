"use client";

import { AdequacyRating } from "./adequacy";
import { DirectAssessment } from "./da";
import { FluencyRating } from "./fluency";
import { SQMRating } from "./sqm";
import { CustomRating } from "./custom";
import { Project } from "@/types/type";

interface RatingFrameworkProps {
  framework: string;
  ratings: Record<string, number>;
  setRatings: (ratings: Record<string, number>) => void;
  overallRating: number;
  project: Project;
}

export function RatingFramework({
  framework,
  ratings,
  setRatings,
  overallRating,
  project,
}: RatingFrameworkProps) {
  switch (framework) {
    case "adequacy":
      return (
        <AdequacyRating
          ratings={ratings}
          setRatings={setRatings}
          overallRating={overallRating}
        />
      );
    case "da":
      return (
        <DirectAssessment
          ratings={ratings}
          setRatings={setRatings}
          overallRating={overallRating}
        />
      );
    case "fluency":
      return (
        <FluencyRating
          ratings={ratings}
          setRatings={setRatings}
          overallRating={overallRating}
        />
      );
    case "sqm":
      return (
        <SQMRating
          ratings={ratings}
          setRatings={setRatings}
          overallRating={overallRating}
        />
      );
    case "custom":
      return (
        <CustomRating
          ratings={ratings}
          setRatings={setRatings}
          overallRating={overallRating}
          project={project}
        />
      );
    default:
      return null;
  }
}
