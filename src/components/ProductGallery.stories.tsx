import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import ProductGallery from "./ProductGallery";

const meta = {
  component: ProductGallery,
  tags: ["ai-generated"],
} satisfies Meta<typeof ProductGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const images = [
  { icon: "🍺", iconBg: "bg-amber-100" },
  { icon: "🧊", iconBg: "bg-sky-100" },
  { icon: "📦", iconBg: "bg-orange-100" },
];

export const Default: Story = {
  args: { images },
  play: async ({ canvas, userEvent }) => {
    const second = canvas.getByRole("button", { name: /view image 2/i });
    await expect(second).toHaveAttribute("aria-current", "false");

    await userEvent.click(second);
    await expect(second).toHaveAttribute("aria-current", "true");
  },
};

export const SingleImage: Story = {
  args: { images: [images[0]] },
};
