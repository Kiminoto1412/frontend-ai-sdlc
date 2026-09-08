import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import BestSeller from "./BestSeller";

const meta = {
  component: BestSeller,
  tags: ["ai-generated"],
} satisfies Meta<typeof BestSeller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Best Seller")).toBeVisible();
    await expect(canvas.getByText(/aloe sweet bananas/i)).toBeVisible();
  },
};
