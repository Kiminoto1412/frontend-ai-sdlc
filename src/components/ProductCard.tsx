import Rating from "./Rating";

export type Product = {
  badge?: string;
  icon: string;
  iconBg: string;
  brand: string;
  title: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  soldPercent?: number;
  soldText?: string;
};

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const {
    badge,
    icon,
    iconBg,
    brand,
    title,
    rating,
    reviews,
    price,
    originalPrice,
    soldPercent,
    soldText,
  } = product;

  return (
    <div className="relative flex h-full flex-col rounded-lg border border-zinc-100 p-4 transition-shadow hover:shadow-md">
      {badge && (
        <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}

      <div
        className={`mb-4 flex h-32 items-center justify-center rounded-md text-5xl ${iconBg}`}
      >
        {icon}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="text-xs text-zinc-400">{brand}</div>
        <div className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
          {title}
        </div>

        <div className="mt-2">
          <Rating rating={rating} reviews={reviews} />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-brand">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {soldPercent !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            {soldText && <div className="mt-1 text-[11px] text-zinc-400">{soldText}</div>}
          </div>
        )}
      </div>

      <button className="mt-4 rounded-md bg-brand py-2 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark">
        Add To Cart
      </button>
    </div>
  );
}
