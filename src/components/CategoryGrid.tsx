import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  { label: "Fruits & Vegetables", icon: "🍊" },
  { label: "Breads & Sweets", icon: "🍞", active: true },
  { label: "Frozen Seafoods", icon: "🦐" },
  { label: "Raw Meats", icon: "🥩" },
  { label: "Wines & Alcohol Drinks", icon: "🍷" },
  { label: "Coffees and Teas", icon: "☕" },
  { label: "Milks and Dairies", icon: "🥛" },
  { label: "Pet Foods", icon: "🐾" },
];

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Browse by Category</h2>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-zinc-400 hover:text-brand">
            All Categories
          </a>
          <div className="flex items-center gap-1">
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
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => (
          <a
            key={category.label}
            href="#"
            className={`flex flex-col items-center gap-3 rounded-lg border px-3 py-6 text-center transition-colors ${
              category.active
                ? "border-transparent bg-white shadow-md ring-1 ring-black/5"
                : "border-transparent bg-zinc-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-black/5"
            }`}
          >
            <span className="text-4xl">{category.icon}</span>
            <span className="text-xs font-medium leading-tight text-zinc-600">
              {category.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
