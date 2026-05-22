'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : ['/placeholder.svg'];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={safeImages[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={cn(
                'relative aspect-square overflow-hidden rounded border-2 bg-muted',
                active === idx ? 'border-primary' : 'border-transparent'
              )}
            >
              <Image src={img} alt="" fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
