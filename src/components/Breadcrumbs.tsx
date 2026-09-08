import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} className="text-zinc-300" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-zinc-400 hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-foreground" : "text-zinc-400"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
