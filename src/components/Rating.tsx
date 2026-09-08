import { Star } from "lucide-react";

export default function Rating({
  rating,
  reviews,
  size = "sm",
}: {
  rating: number;
  reviews: number;
  size?: "sm" | "lg";
}) {
  const starSize = size === "lg" ? 18 : 13;
  const textSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={starSize}
          className={i < rating ? "fill-brand text-brand" : "fill-zinc-200 text-zinc-200"}
        />
      ))}
      <span className={`ml-1 text-zinc-400 ${textSize}`}>({reviews})</span>
    </div>
  );
}
