"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";

type CartProduct = {
  id: string;
  icon: string;
  iconBg: string;
  brand: string;
  title: string;
  price: number;
};

export default function CartItemRow({
  product,
  initialQuantity,
}: {
  product: CartProduct;
  initialQuantity: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(initialQuantity);
  const [removing, setRemoving] = useState(false);

  async function handleQtyChange(next: number) {
    setQty(next);
    await fetch(`/api/cart/items/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: next }),
    });
    router.refresh();
  }

  async function handleRemove() {
    setRemoving(true);
    await fetch(`/api/cart/items/${product.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className={`flex items-center gap-4 py-4 transition-opacity ${removing ? "opacity-40" : ""}`}>
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-3xl ${product.iconBg}`}
      >
        {product.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-xs text-zinc-400">{product.brand}</div>
        <div className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">
          {product.title}
        </div>
        <div className="mt-1 text-sm font-bold text-brand">
          ${(product.price * qty).toFixed(2)}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <QuantitySelector defaultValue={qty} onChange={handleQtyChange} />
        <button
          onClick={handleRemove}
          disabled={removing}
          aria-label="Remove item"
          className="text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
