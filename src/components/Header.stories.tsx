import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Header from "./Header";

const meta = {
  component: Header,
  tags: ["ai-generated"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /farmart/i })).toBeVisible();
    await expect(
      canvas.getByPlaceholderText(/search anything for/i)
    ).toBeVisible();
  },
};
