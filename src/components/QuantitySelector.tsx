"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  min = 1,
  max = 99,
  defaultValue = 1,
  onChange,
}: {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  function update(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    setValue(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="inline-flex items-center rounded-md border border-zinc-200">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => update(value - 1)}
        disabled={value <= min}
        className="flex h-10 w-10 items-center justify-center text-zinc-500 hover:text-brand disabled:cursor-not-allowed disabled:text-zinc-200"
      >
        <Minus size={16} />
      </button>
      <span className="w-10 text-center text-sm font-semibold text-foreground">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => update(value + 1)}
        disabled={value >= max}
        className="flex h-10 w-10 items-center justify-center text-zinc-500 hover:text-brand disabled:cursor-not-allowed disabled:text-zinc-200"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
