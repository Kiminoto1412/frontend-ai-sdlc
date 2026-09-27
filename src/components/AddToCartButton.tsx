"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }: { productId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    if (!productId || loading) return;
    setLoading(true);
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setLoading(false);
    setAdded(true);
    router.refresh();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      disabled={!productId || loading}
      className="mt-4 rounded-md bg-brand py-2 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark disabled:opacity-50"
    >
      {added ? "Added!" : loading ? "Adding..." : "Add To Cart"}
    </button>
  );
}
