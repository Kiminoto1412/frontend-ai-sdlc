import type { Product } from "@/components/ProductCard";
import type { GalleryImage } from "@/components/ProductGallery";

export type ProductDetail = {
  id: string;
  badge?: string;
  brand: string;
  title: string;
  category: string;
  unit: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  description: string;
  images: GalleryImage[];
  related: Product[];
};

const related: Product[] = [
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
];

export const products: ProductDetail[] = [
  {
    id: "ice-birds-beer-350ml",
    badge: "Sale 12%",
    brand: "Ice Bird's Brewery",
    title: "Ice Bird's Beer 350ml x 24 Pack",
    category: "Wines & Alcohol Drinks",
    unit: "24 cans x 350ml",
    price: 89.9,
    originalPrice: 102.0,
    rating: 4,
    reviews: 18,
    description:
      "A crisp, refreshing lager brewed in small batches. Sold as a 24-can case — perfect for stocking up before the weekend. Best served chilled.",
    images: [
      { icon: "🍺", iconBg: "bg-amber-100" },
      { icon: "🧊", iconBg: "bg-sky-100" },
      { icon: "📦", iconBg: "bg-orange-100" },
    ],
    related,
  },
  {
    id: "british-beef-mince",
    badge: "Sale 20%",
    brand: "MeatFarm",
    title: "British Beef Mince (Specially Fed)",
    category: "Raw Meats",
    unit: "500g pack",
    price: 9.99,
    originalPrice: 12.5,
    rating: 5,
    reviews: 33,
    description:
      "Specially fed British beef, minced fresh daily with 10% fat content. Ideal for burgers, bolognese, and shepherd's pie. Keep refrigerated and use within 2 days.",
    images: [
      { icon: "🥩", iconBg: "bg-rose-100" },
      { icon: "🍔", iconBg: "bg-red-50" },
    ],
    related,
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
