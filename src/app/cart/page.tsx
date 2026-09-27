import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import CartItemRow from "@/components/CartItemRow";
import { getSessionId } from "@/lib/session";
import { getCartItems } from "@/lib/db";

export const metadata: Metadata = {
  title: "Your Cart — Farmart",
};

export default async function CartPage() {
  const sessionId = await getSessionId();
  const items = sessionId ? getCartItems(sessionId) : [];
  const subtotal = items.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );
  const isFreeDelivery = subtotal >= 50;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold text-foreground">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <ShoppingBag size={48} className="text-zinc-300" />
            <p className="text-zinc-500">Your cart is empty.</p>
            <Link
              href="/"
              className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-brand-dark"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="divide-y divide-zinc-100">
                {items.map(({ product, quantity }) => (
                  <CartItemRow
                    key={product.id}
                    product={{
                      id: product.id,
                      icon: product.icon,
                      iconBg: product.icon_bg,
                      brand: product.brand,
                      title: product.title,
                      price: product.price,
                    }}
                    initialQuantity={quantity}
                  />
                ))}
              </div>
              <div className="mt-4">
                <Link href="/" className="text-sm text-zinc-400 hover:text-brand">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="h-fit rounded-xl bg-zinc-50 p-6">
              <h2 className="text-base font-bold text-foreground">Order Summary</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Delivery</span>
                  <span className={isFreeDelivery ? "text-green-600" : ""}>
                    {isFreeDelivery ? "FREE" : `$${(50 - subtotal).toFixed(2)} away`}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-200 pt-4 flex justify-between font-extrabold text-foreground">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {!isFreeDelivery && (
                <p className="mt-3 text-center text-xs text-zinc-400">
                  Add ${(50 - subtotal).toFixed(2)} more for free delivery
                </p>
              )}

              <button className="mt-5 w-full rounded-md bg-brand py-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark">
                Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
