export default function HeroBanners() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <div className="relative flex items-center justify-between overflow-hidden rounded-xl bg-sky-50 px-8 py-10 md:col-span-2">
        <div className="max-w-xs">
          <h2 className="text-3xl font-extrabold leading-tight text-foreground">
            Active Summer With Juice Milk 300ml
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            New formula with natural fruits, and milks, sweeten our lives
          </p>
          <button className="mt-6 rounded-md bg-white px-6 py-3 text-sm font-semibold shadow-sm ring-1 ring-black/5 transition-colors hover:bg-zinc-50">
            Shop Now
          </button>
        </div>
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-white text-7xl shadow-inner sm:h-48 sm:w-48">
          🧃
        </div>
      </div>

      <div className="relative flex items-center justify-between overflow-hidden rounded-xl bg-brand px-8 py-10">
        <div>
          <h2 className="text-2xl font-extrabold leading-tight text-foreground">
            20% SALE OFF
          </h2>
          <p className="mt-3 text-sm text-foreground/85">Synthetic seeds Net 2.0 OZ</p>
          <button className="mt-6 rounded-md bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-zinc-50">
            Shop Now
          </button>
        </div>
        <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/20 text-5xl sm:flex">
          📦
        </div>
      </div>
    </section>
  );
}
