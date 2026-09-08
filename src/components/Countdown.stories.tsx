import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Countdown from "./Countdown";

const meta = {
  component: Countdown,
  tags: ["ai-generated"],
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/expires in:/i)).toBeVisible();
  },
};
