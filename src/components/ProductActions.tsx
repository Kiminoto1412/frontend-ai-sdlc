"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import QuantitySelector from "./QuantitySelector";

export default function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    if (loading) return;
    setLoading(true);
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setLoading(false);
    setAdded(true);
    router.refresh();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <QuantitySelector onChange={setQty} />
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="flex-1 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark disabled:opacity-50 sm:flex-none"
      >
        {added ? "Added to Cart!" : loading ? "Adding..." : "Add To Cart"}
      </button>
      <button
        aria-label="Add to wishlist"
        className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 ring-1 ring-zinc-200 hover:text-brand"
      >
        <Heart size={18} />
      </button>
    </div>
  );
}
