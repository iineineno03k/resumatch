import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./header";

const meta = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/jobs",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-[200px]">
        <Story />
        <div className="p-6">
          <p className="text-muted-foreground">Page content goes here...</p>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const JobsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/jobs",
      },
    },
  },
};

export const ApplicantsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/applicants",
      },
    },
  },
};

export const SettingsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
      },
    },
  },
};
