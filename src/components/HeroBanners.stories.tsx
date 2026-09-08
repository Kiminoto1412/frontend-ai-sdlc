import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import HeroBanners from "./HeroBanners";

const meta = {
  component: HeroBanners,
  tags: ["ai-generated"],
} satisfies Meta<typeof HeroBanners>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/active summer with juice milk/i)
    ).toBeVisible();
    await expect(canvas.getByText(/20% sale off/i)).toBeVisible();
  },
};
