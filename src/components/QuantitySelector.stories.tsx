import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import QuantitySelector from "./QuantitySelector";

const meta = {
  component: QuantitySelector,
  tags: ["ai-generated"],
} satisfies Meta<typeof QuantitySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /increase quantity/i })
    );
    await expect(canvas.getByText("2")).toBeVisible();
  },
};

export const AtMinimum: Story = {
  args: { defaultValue: 1, min: 1 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /decrease quantity/i })
    ).toBeDisabled();
  },
};
