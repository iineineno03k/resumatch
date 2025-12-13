import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { OnboardingForm } from "./onboarding-form";

const meta = {
  title: "Features/Teams/OnboardingForm",
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
    const input = canvas.getByLabelText("チーム名");
    await userEvent.type(input, "株式会社サンプル");
  },
};

export const ValidationError: Story = {
  args: {
    onSubmit: fn(async () => ({ success: true })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "チームを作成" });
    await userEvent.click(button);
    await expect(
      canvas.getByText("チーム名を入力してください"),
    ).toBeInTheDocument();
  },
};

export const ServerError: Story = {
  args: {
    onSubmit: fn(async () => ({
      success: false,
      error: "このチーム名はすでに使用されています",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("チーム名");
    await userEvent.type(input, "既存のチーム");
    const button = canvas.getByRole("button", { name: "チームを作成" });
    await userEvent.click(button);
    await expect(
      canvas.getByText("このチーム名はすでに使用されています"),
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
    const input = canvas.getByLabelText("チーム名");
    await userEvent.type(input, "新しいチーム");
    const button = canvas.getByRole("button", { name: "チームを作成" });
    await userEvent.click(button);
  },
};
