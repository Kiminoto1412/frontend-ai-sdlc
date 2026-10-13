import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import RegisterForm from "./RegisterForm";

const meta = {
  component: RegisterForm,
  tags: ["ai-generated"],
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Replace window.fetch for one story; returns the undo. */
function stubFetch(status: number, body: unknown) {
  const original = window.fetch;
  window.fetch = (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as typeof window.fetch;
  return () => {
    window.fetch = original;
  };
}

export const Default: Story = {};

/**
 * Regression guard: the register response carries a 24h JWT, and this form used
 * to persist it to localStorage, where any XSS on the origin could read it for
 * its full lifetime. Nothing ever consumed it. It must stay unpersisted.
 */
export const DoesNotPersistToken: Story = {
  play: async ({ canvas }) => {
    localStorage.clear();
    const restore = stubFetch(201, { token: "a.fake.jwt", expiresIn: 86400 });
    try {
      await userEvent.type(canvas.getByPlaceholderText(/yourdomain@gmail.com/i), "a@b.com");
      await userEvent.type(canvas.getByPlaceholderText(/password/i), "securepass");
      await userEvent.click(canvas.getByRole("button", { name: /register now/i }));

      await waitFor(() => expect(canvas.getByText(/15% discount/i)).toBeVisible());
      expect(localStorage.getItem("farmart_token")).toBeNull();
      expect(localStorage.length).toBe(0);
    } finally {
      restore();
    }
  },
};

export const ShowsServerError: Story = {
  play: async ({ canvas }) => {
    const restore = stubFetch(400, { message: "Email already registered" });
    try {
      await userEvent.type(canvas.getByPlaceholderText(/yourdomain@gmail.com/i), "a@b.com");
      await userEvent.type(canvas.getByPlaceholderText(/password/i), "securepass");
      await userEvent.click(canvas.getByRole("button", { name: /register now/i }));

      await waitFor(() => expect(canvas.getByText(/already registered/i)).toBeVisible());
    } finally {
      restore();
    }
  },
};
