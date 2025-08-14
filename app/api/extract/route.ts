import { NextRequest, NextResponse } from 'next/server';
import { extractReadingsFromImage, validateAndComputeReading } from '@/lib/ai';
import { storage } from '@/lib/storage';
import sharp from 'sharp';

export const runtime = 'nodejs'; // Can't use edge with sharp

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const savedPaths: string[] = [];
    const imageBuffers: Buffer[] = [];
    
    // Process and save all files
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Convert HEIC to JPEG if necessary
      let processedBuffer = buffer;
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        // Note: heic-convert requires additional setup
        // For production, you might want to use a service or different library
        processedBuffer = await sharp(buffer).jpeg().toBuffer();
      }
      
      // Save file
      const savedPath = await storage.save(processedBuffer, file.name);
      savedPaths.push(savedPath);
      
      // Resize for API (to reduce token usage)
      const resizedBuffer = await sharp(processedBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      imageBuffers.push(resizedBuffer);
    }
    
    // Extract readings from all images
    const extractedReading = await extractReadingsFromImage(
      imageBuffers,
      'image/jpeg'
    );
    
    // Validate and compute missing values
    const validatedReading = validateAndComputeReading(extractedReading);
    
    return NextResponse.json({
      ...validatedReading,
      sourceImages: savedPaths,
      machineNotes: extractedReading.machineNotes,
    });
  } catch (error) {
    console.error('Error in extract API:', error);
    return NextResponse.json(
      { error: 'Failed to extract readings from image' },
      { status: 500 }
    );
  }
}