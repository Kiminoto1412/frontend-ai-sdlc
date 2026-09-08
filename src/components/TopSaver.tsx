import { ChevronLeft, ChevronRight, Mail, Lock } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";
import Countdown from "./Countdown";

const products: Product[] = [
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
    brand: "Meat Brand",
    title: "British Beef Mince (10% Fat)",
    rating: 4,
    reviews: 9,
    price: 12.7,
    originalPrice: 15.5,
    soldPercent: 40,
    soldText: "Sold: 12/30",
  },
  {
    icon: "🍞",
    iconBg: "bg-orange-100",
    brand: "Farmart",
    title: "Farmart Farmhouse Soft White",
    rating: 5,
    reviews: 27,
    price: 12.7,
    originalPrice: 14.2,
    soldPercent: 80,
    soldText: "Sold: 24/30",
  },
  {
    icon: "🍊",
    iconBg: "bg-yellow-100",
    brand: "Ice Berg's Farm",
    title: "Ice Berg's Beer 350ml Oranges",
    rating: 4,
    reviews: 15,
    price: 12.35,
    originalPrice: 13.9,
    soldPercent: 55,
    soldText: "Sold: 16/29",
  },
];

export default function TopSaver() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold text-foreground">Top Saver Today</h2>
            <a href="#" className="text-sm text-zinc-400 hover:text-brand">
              All Offers
            </a>
            <Countdown />
            <div className="ml-auto flex items-center gap-1">
              <button
                aria-label="Previous"
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next"
                className="rounded bg-brand p-1 text-foreground hover:bg-brand-dark"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.title} product={product} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden rounded-lg bg-brand-soft p-6">
          <h3 className="text-2xl font-extrabold text-foreground">15% OFF</h3>
          <p className="mt-1 text-sm text-zinc-500">
            For new members sign up for the first time
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <label className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
              <Mail size={16} className="text-zinc-400" />
              <input
                type="email"
                placeholder="yourdomain@gmail.com"
                className="w-full text-sm outline-none placeholder:text-zinc-400"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
              <Lock size={16} className="text-zinc-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full text-sm outline-none placeholder:text-zinc-400"
              />
            </label>
            <button className="mt-2 rounded-md bg-brand py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
