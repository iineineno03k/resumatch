import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { OnboardingForm } from "./onboarding-form";

const meta = {
  title: "Features/Companies/OnboardingForm",
  component: OnboardingForm,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        push: fn(),
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OnboardingForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: fn(async () => ({ success: true })),
  },
};

export const WithInput: Story = {
  args: {
    onSubmit: fn(async () => ({ success: true })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("会社名");
    await userEvent.type(input, "株式会社サンプル");
  },
};

export const ValidationError: Story = {
  args: {
    onSubmit: fn(async () => ({ success: true })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "会社を登録" });
    await userEvent.click(button);
    await expect(
      canvas.getByText("会社名を入力してください"),
    ).toBeInTheDocument();
  },
};

export const ServerError: Story = {
  args: {
    onSubmit: fn(async () => ({
      success: false,
      error: "この会社名はすでに使用されています",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("会社名");
    await userEvent.type(input, "既存の会社");
    const button = canvas.getByRole("button", { name: "会社を登録" });
    await userEvent.click(button);
    await expect(
      canvas.getByText("この会社名はすでに使用されています"),
    ).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: {
    onSubmit: fn(
      async () =>
        new Promise<{ success: boolean }>((resolve) =>
          setTimeout(() => resolve({ success: true }), 10000),
        ),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("会社名");
    await userEvent.type(input, "新しい会社");
    const button = canvas.getByRole("button", { name: "会社を登録" });
    await userEvent.click(button);
  },
};
