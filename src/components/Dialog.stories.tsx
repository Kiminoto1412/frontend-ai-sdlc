import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Dialog from "./Dialog";

const meta = {
  component: Dialog,
  tags: ["ai-generated"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InfoDialog: Story = {
  args: {
    title: "Product Details",
    trigger: <button>Open info dialog</button>,
    children:
      "Farmart Farmhouse Soft White is baked fresh daily and delivered same-day.",
    footer: <button>Got it</button>,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /open info dialog/i })
    );

    const dialog = await canvas.findByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(canvas.getByText("Product Details")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /close/i }));
    await expect(dialog).not.toBeVisible();
  },
};

export const DestructiveDialog: Story = {
  args: {
    title: "Remove item from cart?",
    trigger: <button>Open destructive dialog</button>,
    children:
      'This will remove "Ice Bird\'s Beer 350ml x 24 Pack" from your cart. This can\'t be undone.',
    footer: (
      <>
        <button>Cancel</button>
        <button>Remove</button>
      </>
    ),
  },
};
