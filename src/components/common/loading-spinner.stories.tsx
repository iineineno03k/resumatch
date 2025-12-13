import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingOverlay, LoadingSpinner } from "./loading-spinner";

const meta = {
  title: "Common/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-xs text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="md" />
        <span className="text-xs text-muted-foreground">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-xs text-muted-foreground">Large</span>
      </div>
    </div>
  ),
};

export const Overlay: Story = {
  render: () => (
    <div className="w-[400px] border rounded-lg">
      <LoadingOverlay />
    </div>
  ),
};

export const OverlayWithCustomMessage: Story = {
  render: () => (
    <div className="w-[400px] border rounded-lg">
      <LoadingOverlay message="データを取得中..." />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button
      type="button"
      disabled
      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
    >
      <LoadingSpinner size="sm" className="mr-2 text-primary-foreground" />
      処理中...
    </button>
  ),
};
