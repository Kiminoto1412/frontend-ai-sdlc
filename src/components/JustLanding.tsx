import ProductCard, { type Product } from "./ProductCard";

const tabs = [
  "All",
  "Fruits & Vegetables",
  "Frozen Seafoods",
  "Raw Meats",
  "Coffees & Teas",
  "Milks & Dairies",
];

const products: Product[] = [
  {
    badge: "New",
    icon: "🦐",
    iconBg: "bg-orange-100",
    brand: "Ocean Farm",
    title: "Jumbo Frozen Shrimp Pack",
    rating: 5,
    reviews: 6,
    price: 14.5,
  },
  {
    icon: "🥓",
    iconBg: "bg-rose-100",
    brand: "MeatFarm",
    title: "Smoked Bacon Strips 500g",
    rating: 4,
    reviews: 12,
    price: 7.4,
  },
  {
    icon: "🍶",
    iconBg: "bg-sky-100",
    brand: "Farmart",
    title: "Cold Pressed Olive Oil 1L",
    rating: 5,
    reviews: 22,
    price: 11.2,
  },
  {
    icon: "🍯",
    iconBg: "bg-yellow-100",
    brand: "Brand Name",
    title: "Wildflower Honey Jar 350g",
    rating: 4,
    reviews: 17,
    price: 6.75,
  },
  {
    icon: "📦",
    iconBg: "bg-amber-100",
    brand: "Farmart",
    title: "Breakfast Cereal Box 400g",
    rating: 4,
    reviews: 9,
    price: 3.95,
  },
  {
    icon: "🧊",
    iconBg: "bg-teal-100",
    brand: "Brand Name",
    title: "Sparkling Water Pack x6",
    rating: 4,
    reviews: 13,
    price: 4.6,
  },
];

export default function JustLanding() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold text-foreground">Just Landing</h2>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          {tabs.map((tab, i) => (
            <a
              key={tab}
              href="#"
              className={i === 0 ? "font-semibold text-brand" : "hover:text-brand"}
            >
              {tab}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.title} product={product} />
        ))}
      </div>
    </section>
  );
}
