"use client";

import { useState } from "react";

export type GalleryImage = {
  icon: string;
  iconBg: string;
};

export default function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex h-80 items-center justify-center rounded-lg text-9xl sm:h-96 ${active.iconBg}`}
      >
        {active.icon}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={`flex h-16 w-16 items-center justify-center rounded-md text-2xl transition-shadow ${image.iconBg} ${
                i === activeIndex
                  ? "ring-2 ring-brand"
                  : "ring-1 ring-black/5 hover:ring-zinc-300"
              }`}
            >
              {image.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
