import Link from "next/link";
import { Phone, User, Heart, ShoppingCart, ChevronDown, Menu, Eye, Database } from "lucide-react";
import { getSessionId } from "@/lib/session";
import { getCartSummary } from "@/lib/db";
import SearchBar from "./SearchBar";

const navLinks = [
  { label: "Deals Today", hasDropdown: false },
  { label: "Special Prices", hasDropdown: false },
  { label: "Fresh", hasDropdown: true },
  { label: "Frozen", hasDropdown: true },
  { label: "Dairies", hasDropdown: true },
  { label: "Shop", hasDropdown: true },
  { label: "Blog", hasDropdown: true },
  { label: "Pages", hasDropdown: true },
];

export default async function Header() {
  const sessionId = await getSessionId();
  const { itemCount, subtotal } = sessionId
    ? getCartSummary(sessionId)
    : { itemCount: 0, subtotal: 0 };

  return (
    <header className="w-full border-b border-black/5">
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none shrink-0">
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            Farmart
          </span>
          <span className="text-[10px] tracking-widest text-zinc-400">
            GROCERY STORE
          </span>
        </Link>

        <div className="hidden flex-1 items-center md:flex">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-5 shrink-0">
          <div className="hidden items-center gap-2 lg:flex">
            <Phone size={22} className="text-brand" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">8 800 332 65-66</div>
              <div className="text-xs text-zinc-400">Support 24/7</div>
            </div>
          </div>

          <button aria-label="Account" className="text-zinc-600 hover:text-brand">
            <User size={22} />
          </button>
          <button aria-label="Wishlist" className="text-zinc-600 hover:text-brand">
            <Heart size={22} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="flex items-center gap-2 text-zinc-600 hover:text-brand"
          >
            <span className="relative">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-foreground">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs text-zinc-400">Your Cart</span>
              <span className="block text-sm font-semibold">
                ${subtotal.toFixed(2)}
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Nav bar */}
      <div className="hidden border-t border-black/5 bg-zinc-50 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-2 bg-brand px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark">
            <Menu size={16} />
            SHOP BY CATEGORY
          </button>

          <nav className="flex items-center gap-6 text-sm text-zinc-700">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href="#"
                className="flex items-center gap-1 py-3 hover:text-brand"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={12} />}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/schema"
              className="flex items-center gap-1 py-3 text-sm text-zinc-500 hover:text-brand"
            >
              <Database size={14} />
              DB Schema
            </Link>
            <a
              href="#"
              className="flex items-center gap-1 py-3 text-sm text-zinc-500 hover:text-brand"
            >
              <Eye size={14} />
              Recently Viewed
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
