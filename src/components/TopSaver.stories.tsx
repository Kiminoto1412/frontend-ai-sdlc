import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import TopSaver from "./TopSaver";

const meta = {
  component: TopSaver,
  tags: ["ai-generated"],
} satisfies Meta<typeof TopSaver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Top Saver Today")).toBeVisible();
    await expect(canvas.getByText("15% OFF")).toBeVisible();
    await expect(canvas.getByText(/expires in:/i)).toBeVisible();
  },
};
