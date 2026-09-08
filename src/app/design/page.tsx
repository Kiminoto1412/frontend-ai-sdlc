import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Mail,
  Heart,
  ShoppingCart,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Trash2,
  Info,
} from "lucide-react";
import ProductCard, { type Product } from "@/components/ProductCard";
import Dialog from "@/components/Dialog";
import Rating from "@/components/Rating";
import QuantitySelector from "@/components/QuantitySelector";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";

export const metadata: Metadata = {
  title: "Farmart Design System",
  description: "Style guide generated from DESIGN.md",
};

const navItems = [
  { href: "#theme", label: "1. Theme & Atmosphere" },
  { href: "#colors", label: "2. Color Palette" },
  { href: "#typography", label: "3. Typography" },
  { href: "#components", label: "4. Components" },
  { href: "#layout", label: "5. Layout Principles" },
  { href: "#elevation", label: "6. Depth & Elevation" },
  { href: "#guardrails", label: "7. Do's and Don'ts" },
  { href: "#responsive", label: "8. Responsive Behavior" },
  { href: "#agent", label: "9. Agent Prompt Guide" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-zinc-100 pt-12 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ColorSwatch({
  name,
  value,
  role,
  swatchClassName,
  style,
}: {
  name: string;
  value: string;
  role: string;
  swatchClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-100">
      <div
        className={`h-16 w-full ${swatchClassName ?? ""}`}
        style={style}
      />
      <div className="p-3">
        <div className="text-sm font-semibold text-foreground">{name}</div>
        <div className="text-xs text-zinc-400">{value}</div>
        <div className="mt-1 text-xs text-zinc-500">{role}</div>
      </div>
    </div>
  );
}

function TypeSample({
  label,
  className,
  code,
  sample,
}: {
  label: string;
  className: string;
  code: string;
  sample: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 py-4 sm:flex-row sm:items-center sm:justify-between last:border-b-0">
      <div className="w-40 shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      <div className={`flex-1 ${className}`}>{sample}</div>
      <code className="shrink-0 rounded bg-zinc-100 px-2 py-1 text-[11px] text-zinc-500">
        {code}
      </code>
    </div>
  );
}

const sampleProducts: Product[] = [
  {
    badge: "Sale 12%",
    icon: "🍺",
    iconBg: "bg-amber-100",
    brand: "Ice Bird's Brewery",
    title: "Ice Bird's Beer 350ml x 24 Pack",
    rating: 4,
    reviews: 18,
    price: 89.9,
    originalPrice: 102.0,
    soldPercent: 62,
    soldText: "Sold: 20/32",
  },
  {
    icon: "🥩",
    iconBg: "bg-rose-100",
    brand: "MeatFarm",
    title: "British Beef Mince (Specially Fed, No Additives)",
    rating: 5,
    reviews: 33,
    price: 9.99,
    originalPrice: 12.5,
  },
];

const tints = [
  { name: "amber-100", className: "bg-amber-100" },
  { name: "rose-100", className: "bg-rose-100" },
  { name: "sky-100", className: "bg-sky-100" },
  { name: "lime-100", className: "bg-lime-100" },
  { name: "violet-100", className: "bg-violet-100" },
  { name: "teal-100", className: "bg-teal-100" },
  { name: "yellow-100", className: "bg-yellow-100" },
  { name: "orange-100", className: "bg-orange-100" },
];

export default function DesignSystemPage() {
  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/" className="text-xs font-semibold text-brand hover:underline">
            ← Back to Farmart
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold text-foreground">
            Farmart Design System
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            A living style guide generated from{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
              DESIGN.md
            </code>{" "}
            — read that file before adding new UI. Every pattern below is pulled
            from components actually used on the site, not aspirational examples.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-8 flex flex-col gap-1 text-sm">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded px-2 py-1.5 text-zinc-500 hover:bg-zinc-50 hover:text-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-12">
          <Section id="theme" title="1. Visual Theme & Atmosphere">
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              Farmart reads as a <strong>bright, high-density grocery marketplace</strong>{" "}
              — closer to a big e-commerce catalog than a boutique storefront. The
              mood is energetic and promo-driven: warm orange accents against a
              clean white/light-gray canvas, small red sale badges, and star
              ratings everywhere to build trust at a glance.
            </p>
            <ul className="mt-4 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["Density over whitespace", "Product grids pack 4–8 cards per row for browsability."],
                ["Promotion-first", "Discounts, countdowns and sold-bars are first-class UI."],
                ["Flat and functional", "No gradients or skeuomorphism — color and light shadow build hierarchy."],
                ["One accent, used consistently", "Orange marks every actionable or \"hot\" element."],
              ].map(([title, desc]) => (
                <li key={title} className="rounded-lg border border-zinc-100 p-4">
                  <div className="text-sm font-semibold text-foreground">{title}</div>
                  <div className="mt-1 text-xs text-zinc-500">{desc}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="colors" title="2. Color Palette & Roles">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Brand & surfaces
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <ColorSwatch name="brand" value="#f5a623" role="Primary actions, prices, active states" swatchClassName="bg-brand" />
              <ColorSwatch name="brand-dark" value="#e0940f" role="Hover/pressed state" swatchClassName="bg-brand-dark" />
              <ColorSwatch name="brand-soft" value="#fff4e0" role="Soft accent surfaces" swatchClassName="bg-brand-soft" />
              <ColorSwatch name="foreground" value="#1f2530" role="Primary text, headings" swatchClassName="bg-foreground" />
              <ColorSwatch name="background" value="#ffffff" role="Page canvas" style={{ background: "#fff", border: "1px solid #e4e4e7" }} />
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Neutrals (Tailwind zinc)
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {[
                ["zinc-50", "bg-zinc-50", "Section separation"],
                ["zinc-100", "bg-zinc-100", "Input/search fill, track"],
                ["zinc-200", "bg-zinc-200", "Borders"],
                ["zinc-300", "bg-zinc-300", "Dividers"],
                ["zinc-400", "bg-zinc-400", "Muted text"],
                ["zinc-600", "bg-zinc-600", "Icon default"],
                ["zinc-700", "bg-zinc-700", "Nav link text"],
              ].map(([name, cls, role]) => (
                <ColorSwatch key={name} name={name} value={role} role="" swatchClassName={cls} />
              ))}
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Semantic (non-brand)
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <ColorSwatch name="red-600" value="Sale badge, destructive dialog action" role="White text on red-600 = 4.83:1 (AA)" swatchClassName="bg-red-600" />
              <ColorSwatch name="red-700" value="Text on red-50 or white" role="Never red-500 for text — fails WCAG AA" swatchClassName="bg-red-700" />
              <ColorSwatch name="red-50" value="Countdown chip background" role="Paired with text-red-700" swatchClassName="bg-red-50" />
              <ColorSwatch name="black/40" value="Dialog backdrop scrim" role="backdrop:bg-black/40 on <dialog>" swatchClassName="bg-black/40" />
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Product placeholder tints
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Rotate across product tiles to keep a dense grid visually distinct. Always{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5">*-100</code>, never dark, never brand.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
              {tints.map((tint) => (
                <div key={tint.name} className="overflow-hidden rounded-lg border border-zinc-100">
                  <div className={`h-12 w-full ${tint.className}`} />
                  <div className="px-2 py-1.5 text-center text-[10px] text-zinc-500">
                    {tint.name}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="typography" title="3. Typography Rules">
            <p className="text-xs text-zinc-500">
              Font: <code className="rounded bg-zinc-100 px-1 py-0.5">--font-geist-sans</code> (Geist), with{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5">--font-geist-mono</code> reserved for code.
            </p>
            <div className="mt-4">
              <TypeSample label="Page/Hero" className="text-3xl font-extrabold text-foreground" code="text-3xl font-extrabold" sample="Active Summer With Juice Milk" />
              <TypeSample label="Section heading" className="text-xl font-bold text-foreground" code="text-xl font-bold" sample="Top Saver Today" />
              <TypeSample label="Card title" className="text-sm font-medium text-foreground" code="text-sm font-medium line-clamp-2" sample="Farmart Farmhouse Soft White" />
              <TypeSample label="Body/subtext" className="text-sm text-zinc-500" code="text-sm text-zinc-500" sample="New formula with natural fruits, and milks" />
              <TypeSample label="Meta/label" className="text-xs text-zinc-400" code="text-xs text-zinc-400" sample="MeatFarm" />
              <TypeSample label="Micro label" className="text-[10px] tracking-widest text-zinc-400" code="text-[10px]" sample="GROCERY STORE" />
              <TypeSample label="Price (active)" className="text-base font-bold text-brand" code="text-base font-bold text-brand" sample="$9.99" />
              <TypeSample label="Price (hero)" className="text-3xl font-extrabold text-brand" code="text-3xl font-extrabold text-brand" sample="$9.99" />
              <TypeSample label="Price (struck)" className="text-xs text-zinc-400 line-through" code="text-xs text-zinc-400 line-through" sample="$12.50" />
            </div>
          </Section>

          <Section id="components" title="4. Component Stylings">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Buttons
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark">
                Primary — Add To Cart
              </button>
              <button className="rounded-md bg-white px-6 py-3 text-sm font-semibold shadow-sm ring-1 ring-black/5 transition-colors hover:bg-zinc-50">
                Secondary — Shop Now
              </button>
              <button aria-label="Wishlist" className="rounded p-2 text-zinc-600 hover:text-brand">
                <Heart size={22} />
              </button>
              <button aria-label="Cart" className="rounded bg-brand p-2 text-foreground hover:bg-brand-dark">
                <ShoppingCart size={18} />
              </button>
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Cards — reusing the real{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 normal-case">ProductCard</code>
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-zinc-500">
              Note the CTA sits on the same baseline in both cards below despite the
              second title wrapping to two lines — that&apos;s the <code className="rounded bg-zinc-100 px-1 py-0.5">flex-1</code>{" "}
              content wrapper described in §4 of DESIGN.md. Don&apos;t remove it.
            </p>
            <div className="mt-3 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:w-2/3">
              {sampleProducts.map((product) => (
                <ProductCard key={product.title} product={product} />
              ))}
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Inputs / search bar
            </h3>
            <div className="mt-3 max-w-xl">
              <div className="flex w-full items-center rounded-lg bg-zinc-100 pr-2">
                <button className="flex shrink-0 items-center gap-1 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:text-brand">
                  All Categories
                  <ChevronDown size={14} />
                </button>
                <span className="h-5 w-px shrink-0 bg-zinc-300" />
                <input
                  type="text"
                  placeholder="Search anything for..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
                />
                <button aria-label="Search" className="flex shrink-0 items-center justify-center px-3 text-zinc-500 hover:text-brand">
                  <Search size={18} />
                </button>
              </div>
              <label className="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
                <Mail size={16} className="text-zinc-400" />
                <input
                  type="email"
                  placeholder="yourdomain@gmail.com"
                  className="w-full text-sm outline-none placeholder:text-zinc-400"
                />
              </label>
              <div className="mt-1 text-xs text-zinc-500">
                Labeled form input pattern from the signup panel — leading icon, no
                inner label text, placeholder carries the meaning.
              </div>
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Navigation states
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-6 text-sm">
              <span className="font-semibold text-brand">Active tab</span>
              <span className="text-zinc-400 hover:text-brand">Inactive tab</span>
              <span className="rounded bg-brand px-4 py-2 text-sm font-semibold text-foreground">
                Next arrow (only solid nav button)
              </span>
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Dialog / Modal
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-zinc-500">
              Built on the native <code className="rounded bg-zinc-100 px-1 py-0.5">&lt;dialog&gt;</code> element —
              free focus trap, ESC-to-close, and top-layer stacking. Panel uses{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5">shadow-xl</code>, the one
              sanctioned exception to the flat-elevation rule (see §6). Click a trigger below.
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <Dialog
                title="Product Details"
                trigger={
                  <button className="flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold shadow-sm ring-1 ring-black/5 transition-colors hover:bg-zinc-50">
                    <Info size={16} />
                    Open info dialog
                  </button>
                }
                footer={
                  <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark">
                    Got it
                  </button>
                }
              >
                Farmart Farmhouse Soft White is baked fresh daily and delivered same-day
                in most areas. Store at room temperature and use within 5 days.
              </Dialog>

              <Dialog
                title="Remove item from cart?"
                trigger={
                  <button className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200 transition-colors hover:text-red-600">
                    <Trash2 size={16} />
                    Open destructive dialog
                  </button>
                }
                footer={
                  <>
                    <button className="rounded-md px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100">
                      Cancel
                    </button>
                    <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                      Remove
                    </button>
                  </>
                }
              >
                This will remove &ldquo;Ice Bird&apos;s Beer 350ml x 24 Pack&rdquo; from your cart.
                This can&apos;t be undone.
              </Dialog>
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Rating
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-zinc-500">
              Shared by <code className="rounded bg-zinc-100 px-1 py-0.5 normal-case">ProductCard</code> and
              the product detail page — two sizes only, don&apos;t invent a third.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-8">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wide text-zinc-400">size=&quot;sm&quot; (card)</div>
                <Rating rating={4} reviews={18} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wide text-zinc-400">size=&quot;lg&quot; (detail page)</div>
                <Rating rating={4} reviews={18} size="lg" />
              </div>
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Quantity Selector
            </h3>
            <div className="mt-3">
              <QuantitySelector />
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Breadcrumbs
            </h3>
            <div className="mt-3">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Raw Meats", href: "/" },
                  { label: "British Beef Mince (Specially Fed)" },
                ]}
              />
            </div>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Product Gallery
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-zinc-500">
              Click a thumbnail — same placeholder-tint convention as{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 normal-case">ProductCard</code> until
              real photography exists.
            </p>
            <div className="mt-3 max-w-sm">
              <ProductGallery
                images={[
                  { icon: "🍺", iconBg: "bg-amber-100" },
                  { icon: "🧊", iconBg: "bg-sky-100" },
                  { icon: "📦", iconBg: "bg-orange-100" },
                ]}
              />
            </div>
          </Section>

          <Section id="layout" title="5. Layout Principles">
            <ul className="max-w-3xl space-y-3 text-sm text-zinc-600">
              <li>
                <strong className="text-foreground">Container:</strong> every section
                wraps <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">mx-auto max-w-7xl px-4 sm:px-6 lg:px-8</code>.
              </li>
              <li>
                <strong className="text-foreground">Vertical rhythm:</strong> sections
                use <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">py-8</code>; a
                section needing separation gets a full-bleed{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">bg-zinc-50</code> wrapper.
              </li>
              <li>
                <strong className="text-foreground">Grid density:</strong> category grid
                is 8 → 4 → 2 columns; product grids are 6 → 3 → 2, or 4-up next to the
                signup panel. Gap is <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">gap-4</code> for
                grids, <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">gap-6</code> for structural blocks.
              </li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex h-16 items-center justify-center rounded-md bg-zinc-100 text-xs text-zinc-400">
                  gap-4
                </div>
              ))}
            </div>
          </Section>

          <Section id="elevation" title="6. Depth & Elevation">
            <p className="max-w-2xl text-sm text-zinc-600">
              Flat by default — elevation only indicates interactivity, never decoration.
              Hover the cards below.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-zinc-100 p-6 text-center text-sm text-zinc-500">
                Level 0 — resting
                <div className="mt-1 text-xs text-zinc-400">border only, no shadow</div>
              </div>
              <div className="rounded-lg border border-zinc-100 p-6 text-center text-sm text-zinc-500 transition-shadow hover:shadow-md">
                Level 1 — hover me
                <div className="mt-1 text-xs text-zinc-400">hover:shadow-md</div>
              </div>
              <div className="rounded-lg p-6 text-center text-sm text-zinc-500 ring-1 ring-black/5">
                Ring — subtle
                <div className="mt-1 text-xs text-zinc-400">ring-1 ring-black/5</div>
              </div>
              <div className="rounded-lg p-6 text-center text-sm text-zinc-500 shadow-xl">
                Level 2 — overlay
                <div className="mt-1 text-xs text-zinc-400">shadow-xl — Dialog panel only</div>
              </div>
            </div>
          </Section>

          <Section id="guardrails" title="7. Do's and Don'ts">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 size={16} /> Do
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                  <li>Reuse ProductCard for any new product-listing section.</li>
                  <li>Keep brand orange reserved for CTAs, prices, active states.</li>
                  <li>Use line-clamp-2 on product titles.</li>
                  <li>Keep section headers to the h2 + muted-link/tabs pattern.</li>
                  <li>Use lucide-react for all icons.</li>
                  <li>Build modals on the native &lt;dialog&gt; element — it&apos;s the one place shadow-xl is allowed.</li>
                  <li>Use the shared Rating component for any star display.</li>
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <XCircle size={16} /> Don&apos;t
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                  <li>Don&apos;t introduce a second accent color besides brand orange.</li>
                  <li>Don&apos;t give the sale badge the brand color.</li>
                  <li>Don&apos;t put mt-auto directly on a card&apos;s CTA button.</li>
                  <li>Don&apos;t add drop shadows to resting (non-hover) cards.</li>
                  <li>Don&apos;t use font-semibold for section-level h2 headings.</li>
                  <li>Don&apos;t open more than one Dialog at a time — close the current one first.</li>
                  <li>Don&apos;t use white text on bg-brand — it fails WCAG AA (2.03:1); use text-foreground instead (~7.6:1).</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="responsive" title="8. Responsive Behavior">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400">
                    <th className="py-2 pr-4">Breakpoint</th>
                    <th className="py-2 pr-4">Width</th>
                    <th className="py-2">What changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-3 pr-4 font-medium">sm</td>
                    <td className="py-3 pr-4 text-zinc-500">640px</td>
                    <td className="py-3 text-zinc-500">Category/product grids grow from 2 columns.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">md</td>
                    <td className="py-3 pr-4 text-zinc-500">768px</td>
                    <td className="py-3 text-zinc-500">Search bar and full nav bar appear; hero banners go 3-column.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">lg</td>
                    <td className="py-3 pr-4 text-zinc-500">1024px</td>
                    <td className="py-3 text-zinc-500">Phone number block appears; grids reach full column count.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Grids collapse by column count, never by hiding product cards — items wrap instead.
            </p>
          </Section>

          <Section id="agent" title="9. Agent Prompt Guide">
            <p className="max-w-2xl text-sm text-zinc-600">
              Quick reference for generating new Farmart UI without re-reading the whole file.
            </p>
            <div className="mt-4 space-y-3">
              {[
                'Add a new product-listing section called X → copy BestSeller.tsx/JustLanding.tsx: h2 + tab header, grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4, map Product[] into <ProductCard />.',
                'Add a new promo banner → follow HeroBanners.tsx: rounded-xl container, one CTA button, optional icon/emoji circle.',
                'Add a form or signup box → follow the TopSaver.tsx signup panel: bg-brand-soft rounded-lg p-6, labeled inputs with a leading icon, single brand-colored submit button.',
                'Style a new interactive element → resting = flat, hover = hover:shadow-md or hover:text-brand, active = text-brand font-semibold or bg-brand text-foreground.',
                'Add a confirmation/detail dialog → use <Dialog>: native <dialog> element, backdrop:bg-black/40, panel rounded-lg shadow-xl max-w-md, header/body/footer split by hairlines, footer is secondary button then primary (or bg-red-600 destructive) button.',
                'Build a product/entity detail page → Breadcrumbs above the fold, then grid-cols-1 lg:grid-cols-2 gap-10: ProductGallery left, right column is brand text → h1 title → Rating size="lg" → hero price (text-3xl font-extrabold text-brand) → description → QuantitySelector + primary Add To Cart + icon wishlist button. Close with a "You Might Also Like" ProductCard grid.',
              ].map((prompt) => (
                <pre
                  key={prompt}
                  className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100"
                >
                  {prompt}
                </pre>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
