import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import JustLanding from "./JustLanding";

const meta = {
  component: JustLanding,
  tags: ["ai-generated"],
} satisfies Meta<typeof JustLanding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Just Landing")).toBeVisible();
    await expect(canvas.getByText(/jumbo frozen shrimp pack/i)).toBeVisible();
  },
};
