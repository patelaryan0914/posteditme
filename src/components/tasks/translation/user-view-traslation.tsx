"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check } from "lucide-react";

interface TranslationSegment {
  sourceText: string;
  translatedText?: string;
  comments?: string;
  reviewNotes?: string;
}

interface Task {
  _id: string;
  name: string;
  translationData: TranslationSegment[];
}

interface TranslationUserViewProps {
  task: Task;
  onSaveTranslation: (taskId: string,index:number, translationData: TranslationSegment) => void;
}

const segmentsPerPage = 10;

export function TranslationUserView({ task, onSaveTranslation }: TranslationUserViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [segments, setSegments] = useState<TranslationSegment[]>(task.translationData || []);

  useEffect(() => {
    setSegments(task.translationData || []);
  }, [task.translationData]);

  const handleTranslationChange = (index: number, value: string) => {
    const newSegments = [...segments];
    const globalIndex = (currentPage - 1) * segmentsPerPage + index;
    if (newSegments[globalIndex]) {
      newSegments[globalIndex].translatedText = value;
      setSegments(newSegments);
    }
  };

  const handleSave = (index:number,segment: TranslationSegment) => {
    onSaveTranslation(task._id,index, segment);
  };

  const totalPages = Math.ceil(segments.length / segmentsPerPage);
  const startIndex = (currentPage - 1) * segmentsPerPage;
  const endIndex = startIndex + segmentsPerPage;
  const currentSegments = segments.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Source text</TableHead>
      <TableHead>Translated Text</TableHead>
      <TableHead className="text-right">Save</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
  {currentSegments.map((segment, index) => {
            const globalSegmentIndex = startIndex + index;
            return (
              <TableRow key={globalSegmentIndex} >
                <TableCell className="font-medium w-3/5"> <p className="text-muted-foreground break-words text-wrap text-xl">{segment.sourceText}</p></TableCell>
                  <TableCell className="w-3/5"> 
                  <Textarea
                    id={`translation-${globalSegmentIndex}`}
                    value={segment.translatedText || ""}
                    onChange={(e) => handleTranslationChange(index, e.target.value)}
                    placeholder="Enter your translation here"
                    className="text-xl"
                  /></TableCell>
    <TableCell className="w-1/6"><Button variant="ghost" onClick={()=>handleSave(index,segment)}><Check /></Button></TableCell>
    </TableRow>
            );
          })}
  </TableBody>
</Table>
     {segments.length > segmentsPerPage && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    // disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    // disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
      {/* <Card>
        <CardHeader>
          <CardTitle>{task.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSegments.map((segment, index) => {
            const globalSegmentIndex = startIndex + index;
            return (
              <div key={globalSegmentIndex} className="border rounded-md p-4 space-y-3">
                <div>
                  <Label htmlFor={`source-${globalSegmentIndex}`}>Source Text (Segment {globalSegmentIndex + 1})</Label>
                  <p className="text-muted-foreground break-words">{segment.sourceText}</p>
                </div>
                <div>
                  <Label htmlFor={`translation-${globalSegmentIndex}`}>Your Translation</Label>
                  <Textarea
                    id={`translation-${globalSegmentIndex}`}
                    value={segment.translatedText || ""}
                    onChange={(e) => handleTranslationChange(index, e.target.value)}
                    placeholder="Enter your translation here"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            );
          })}

          {segments.length > segmentsPerPage && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    // disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    // disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Translation</Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}