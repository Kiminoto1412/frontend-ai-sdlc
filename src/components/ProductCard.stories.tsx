import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import ProductCard, { type Product } from "./ProductCard";

const meta = {
  component: ProductCard,
  tags: ["ai-generated"],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const discounted: Product = {
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
};

export const Default: Story = {
  args: { product: discounted },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sale 12%")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /add to cart/i })
    ).toBeVisible();
  },
};

export const NoDiscount: Story = {
  args: {
    product: {
      icon: "🍋",
      iconBg: "bg-lime-100",
      brand: "Brand Name",
      title: "10 Yellow Watermelons",
      rating: 4,
      reviews: 14,
      price: 5.9,
    },
  },
};

// Regression check for the flex-1 content wrapper (DESIGN.md §4, Cards): the
// CTA must stay pinned to the same baseline even when the title wraps to 2 lines.
export const LongTitleTwoLines: Story = {
  args: {
    product: {
      icon: "🥩",
      iconBg: "bg-rose-100",
      brand: "MeatFarm",
      title: "British Beef Mince (Specially Fed, No Additives, Grass Reared)",
      rating: 5,
      reviews: 33,
      price: 9.99,
      originalPrice: 12.5,
    },
  },
};

// Proves the shared preview actually loaded Tailwind — DESIGN.md says the active
// price is always `text-brand` (#f5a623 -> rgb(245, 166, 35)).
export const CssCheck: Story = {
  args: { product: discounted },
  play: async ({ canvas }) => {
    const price = canvas.getByText("$89.90");
    await expect(getComputedStyle(price).color).toBe("rgb(245, 166, 35)");
  },
};
