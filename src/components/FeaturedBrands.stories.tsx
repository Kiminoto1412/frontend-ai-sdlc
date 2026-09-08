import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import FeaturedBrands from "./FeaturedBrands";

const meta = {
  component: FeaturedBrands,
  tags: ["ai-generated"],
} satisfies Meta<typeof FeaturedBrands>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Featured Brands")).toBeVisible();
    await expect(canvas.getByText(/new snacks release/i)).toBeVisible();
  },
};
