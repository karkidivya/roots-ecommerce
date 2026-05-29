'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import { GripVertical, X, Upload, Link as LinkIcon } from 'lucide-react';

interface Props {
  name: string;
  initial?: string[];
}

export function ImageUploader({ name, initial = [] }: Props) {
  const [images, setImages] = useState<string[]>(initial);
  const [pasteUrl, setPasteUrl] = useState('');
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const remove = (i: number) =>
    setImages(images.filter((_, idx) => idx !== i));

  const addPasted = () => {
    const url = pasteUrl.trim();
    if (!url || images.includes(url)) return;
    setImages([...images, url]);
    setPasteUrl('');
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setImages(next);
  };

  const cloudinaryReady =
    !!cloudName &&
    cloudName !== 'your_cloud_name' &&
    !!uploadPreset &&
    uploadPreset !== 'your_upload_preset';

  return (
    <div className="space-y-4">
      {/* Hidden field consumed by the existing server action (comma-separated URLs) */}
      <input type="hidden" name={name} value={images.join(',')} />

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={url + i}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
                unoptimized={!url.startsWith('https://')}
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded bg-foreground/85 px-1.5 py-0.5 text-[10px] font-medium text-background">
                  Main
                </span>
              )}
              <div className="absolute inset-0 grid place-items-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-background"
                    aria-label="Move left"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-background text-destructive"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cloudinary upload */}
      <div className="flex flex-wrap items-center gap-3">
        {cloudinaryReady ? (
          <CldUploadWidget
            uploadPreset={uploadPreset!}
            options={{
              sources: ['local', 'url', 'camera'],
              multiple: true,
              maxFiles: 10,
              folder: 'products',
            }}
            onSuccess={(result) => {
              if (
                result.event === 'success' &&
                result.info &&
                typeof result.info === 'object' &&
                'secure_url' in result.info
              ) {
                const url = (result.info as { secure_url: string }).secure_url;
                setImages((prev) =>
                  prev.includes(url) ? prev : [...prev, url]
                );
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex items-center gap-2 rounded-sm border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
              >
                <Upload className="h-4 w-4" />
                Upload images
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="w-full rounded-md border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              Cloudinary not configured
            </p>
            Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{' '}
            <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in <code>.env</code>{' '}
            to enable file uploads. You can still paste URLs below.
          </div>
        )}
      </div>

      {/* Paste URL fallback */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPasted();
              }
            }}
            placeholder="Paste an image URL (Unsplash, Cloudinary, etc.)"
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={addPasted}
          disabled={!pasteUrl.trim()}
          className="rounded-sm border bg-card px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag thumbnails to reorder — the first image is shown as the main one.
      </p>
    </div>
  );
}
