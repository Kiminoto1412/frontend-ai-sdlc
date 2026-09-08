import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import CategoryGrid from "./CategoryGrid";

const meta = {
  component: CategoryGrid,
  tags: ["ai-generated"],
} satisfies Meta<typeof CategoryGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Browse by Category")).toBeVisible();
    await expect(canvas.getByText("Fruits & Vegetables")).toBeVisible();
    await expect(canvas.getByText("Pet Foods")).toBeVisible();
  },
};
