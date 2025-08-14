"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UploadCardProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing?: boolean;
  maxFiles?: number;
}

export function UploadCard({ onFilesSelected, isProcessing = false, maxFiles = 3 }: UploadCardProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic', '.HEIC'],
    },
    maxFiles,
    disabled: isProcessing,
  });

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const clearAll = () => {
    previews.forEach(p => URL.revokeObjectURL(p.url));
    setPreviews([]);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {previews.length === 0 ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? "Drop the images here" : "Drag & drop kiosk photos here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files (JPG, PNG, HEIC)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Up to {maxFiles} images
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePreview(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {preview.file.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearAll}
                variant="outline"
                disabled={isProcessing}
              >
                Clear All
              </Button>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button variant="outline" disabled={isProcessing}>
                  Add More
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}