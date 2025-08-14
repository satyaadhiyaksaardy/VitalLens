"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { UploadCard } from "@/components/upload-card";
import { ReviewForm } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Extract mutation
  const extractMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setIsExtracting(true);
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to extract readings");
      }

      return res.json();
    },
    onSuccess: (data) => {
      setExtractedData(data);
      setIsExtracting(false);
      toast({
        title: "Extraction successful",
        description: "Please review and confirm the extracted readings.",
      });
    },
    onError: (error) => {
      setIsExtracting(false);
      toast({
        title: "Extraction failed",
        description: "Unable to extract readings from the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save reading");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reading saved",
        description: "Your health reading has been saved successfully.",
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Unable to save the reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setExtractedData(null);
  };

  const handleExtract = () => {
    if (selectedFiles.length > 0) {
      extractMutation.mutate(selectedFiles);
    }
  };

  const handleSave = async (data: any) => {
    const saveData = {
      ...data,
      sourceImages: extractedData?.sourceImages || [],
    };
    await saveMutation.mutateAsync(saveData);
  };

  const handleDiscard = () => {
    setExtractedData(null);
    setSelectedFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Reading</h1>
        <p className="text-muted-foreground">
          Upload photos of health kiosk screens to extract your vitals
        </p>
      </div>

      {/* Upload Card */}
      {!extractedData && (
        <>
          <UploadCard
            onFilesSelected={handleFilesSelected}
            isProcessing={isExtracting}
          />

          {selectedFiles.length > 0 && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleExtract}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Extracting Readings...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Extract Readings
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Review Form */}
      {extractedData && (
        <ReviewForm
          initialData={extractedData}
          onSave={handleSave}
          onDiscard={handleDiscard}
          isSaving={saveMutation.isPending}
        />
      )}

      {/* Machine Notes */}
      {extractedData?.machineNotes && extractedData.machineNotes.length > 0 && (
        <div className="rounded-lg bg-muted p-4">
          <h3 className="text-sm font-medium mb-2">Detection Notes</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            {extractedData.machineNotes.map((note: string, index: number) => (
              <li key={index}>• {note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}