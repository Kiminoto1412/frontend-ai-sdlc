import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Rating from "./Rating";

const meta = {
  component: Rating,
  tags: ["ai-generated"],
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { rating: 4, reviews: 18 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("(18)")).toBeVisible();
  },
};

export const Large: Story = {
  args: { rating: 5, reviews: 33, size: "lg" },
};
