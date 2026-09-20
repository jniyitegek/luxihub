import { NextResponse } from 'next/server';
import { handleRouteError, jsonError, requireUser } from '@/lib/api';
import { storageAdapter } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    await requireUser();

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return jsonError('Please select a valid image file to upload', 400);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError('Invalid file format. Allowed formats: JPG, PNG, WEBP, AVIF', 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonError('File size exceeds 5MB limit. Please choose a smaller image.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileUrl = await storageAdapter.upload(buffer, file.name, file.type);

    return NextResponse.json({ success: true, url: fileUrl }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'api/upload POST');
  }
}
