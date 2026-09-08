const brands = [
  {
    brand: "FOODVASH",
    title: "New Snacks Release",
    icon: "🍟",
    bg: "bg-violet-100",
  },
  {
    brand: "ITEM JSC",
    title: "Happy Tea 100% Organic, From $29.9",
    icon: "🍵",
    bg: "bg-teal-100",
  },
  {
    brand: "SODA BRAND",
    title: "Soda Can Box 24 Pieces - 30% Off",
    icon: "🥫",
    bg: "bg-sky-100",
  },
  {
    brand: "FARMART",
    title: "Fresh Meat Sausage. BUY 2 GET 1!",
    icon: "🌭",
    bg: "bg-lime-100",
  },
];

export default function FeaturedBrands() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Featured Brands</h2>
        <a href="#" className="text-sm text-zinc-400 hover:text-brand">
          All Offers
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brands.map((item) => (
          <a
            key={item.title}
            href="#"
            className="overflow-hidden rounded-lg border border-zinc-100 transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-40 items-center justify-center text-6xl ${item.bg}`}
            >
              {item.icon}
            </div>
            <div className="p-4">
              <div className="text-xs font-semibold tracking-wide text-zinc-400">
                {item.brand}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {item.title}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
