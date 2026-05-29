'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import { X, Upload, Link as LinkIcon, ImageIcon } from 'lucide-react';

interface Props {
  name: string;
  initial?: string;
}

export function CategoryImagePicker({ name, initial = '' }: Props) {
  const [url, setUrl] = useState<string>(initial);
  const [draft, setDraft] = useState('');
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const cloudinaryReady =
    !!cloudName &&
    cloudName !== 'your_cloud_name' &&
    !!uploadPreset &&
    uploadPreset !== 'your_upload_preset';

  const applyDraft = () => {
    const v = draft.trim();
    if (!v) return;
    setUrl(v);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      {/* Hidden input the server action reads */}
      <input type="hidden" name={name} value={url} />

      {/* Preview */}
      <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded-md border bg-muted">
        {url ? (
          <>
            <Image
              src={url}
              alt="Category preview"
              fill
              sizes="400px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setUrl('')}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-destructive shadow-sm hover:bg-background"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">No image set</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {cloudinaryReady ? (
          <CldUploadWidget
            uploadPreset={uploadPreset!}
            options={{
              sources: ['local', 'url', 'camera'],
              multiple: false,
              folder: 'categories',
            }}
            onSuccess={(result) => {
              if (
                result.event === 'success' &&
                result.info &&
                typeof result.info === 'object' &&
                'secure_url' in result.info
              ) {
                setUrl((result.info as { secure_url: string }).secure_url);
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
                {url ? 'Replace image' : 'Upload image'}
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="w-full rounded-md border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
            Cloudinary not configured — paste a URL below instead.
          </div>
        )}
      </div>

      {/* Paste URL */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyDraft();
              }
            }}
            placeholder="…or paste an image URL"
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={applyDraft}
          disabled={!draft.trim()}
          className="rounded-sm border bg-card px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          Use
        </button>
      </div>
    </div>
  );
}
