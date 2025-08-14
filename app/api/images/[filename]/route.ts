import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const imageBuffer = await storage.get(params.filename);
    
    // Determine content type based on file extension
    const ext = params.filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    
    if (ext === 'png') {
      contentType = 'image/png';
    } else if (ext === 'heic') {
      contentType = 'image/heic';
    }
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Image not found' },
      { status: 404 }
    );
  }
}