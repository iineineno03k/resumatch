import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "@storybook/test";
import { FileUpload } from "./file-upload";

const meta = {
  title: "Common/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onFileSelect: fn(),
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    accept: ".pdf",
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const SmallMaxSize: Story = {
  args: {
    accept: ".pdf",
    maxSize: 1 * 1024 * 1024, // 1MB
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const ImageUpload: Story = {
  args: {
    accept: ".jpg,.png,.gif",
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};
