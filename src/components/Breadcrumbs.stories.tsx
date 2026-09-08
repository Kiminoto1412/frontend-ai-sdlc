import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Breadcrumbs from "./Breadcrumbs";

const meta = {
  component: Breadcrumbs,
  tags: ["ai-generated"],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Raw Meats", href: "/" },
      { label: "British Beef Mince (Specially Fed)" },
    ],
  },
  play: async ({ canvas }) => {
    const current = canvas.getByText("British Beef Mince (Specially Fed)");
    await expect(current).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Home" })).toBeVisible();
  },
};
