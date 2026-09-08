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
    icon: "🍌",
    iconBg: "bg-yellow-100",
    brand: "Brand Name",
    title: "Aloe Sweet Bananas",
    rating: 4,
    reviews: 21,
    price: 18.29,
  },
  {
    badge: "Sale 20%",
    icon: "🥩",
    iconBg: "bg-rose-100",
    brand: "MeatFarm",
    title: "British Beef Mince (Specially Fed)",
    rating: 5,
    reviews: 33,
    price: 9.99,
    originalPrice: 12.5,
  },
  {
    icon: "🍋",
    iconBg: "bg-lime-100",
    brand: "Brand Name",
    title: "10 Yellow Watermelons",
    rating: 4,
    reviews: 14,
    price: 5.9,
  },
  {
    icon: "🌾",
    iconBg: "bg-amber-100",
    brand: "Farmart",
    title: "Organic Foods & Pastry Sifted",
    rating: 4,
    reviews: 8,
    price: 3.29,
  },
  {
    icon: "🍪",
    iconBg: "bg-orange-100",
    brand: "Farmart",
    title: "Oatmeal Cookies",
    rating: 5,
    reviews: 19,
    price: 4.28,
  },
  {
    icon: "🥫",
    iconBg: "bg-sky-100",
    brand: "Brand Name",
    title: "Canned Royal White Tofu",
    rating: 4,
    reviews: 11,
    price: 2.15,
  },
];

export default function BestSeller() {
  return (
    <section className="bg-zinc-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">Best Seller</h2>
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
      </div>
    </section>
  );
}
