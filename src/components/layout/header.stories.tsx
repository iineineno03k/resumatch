import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./header";

const mockUser = {
  name: "開発ユーザー",
  email: "dev@example.com",
  avatarUrl: null,
};

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
  args: {
    user: mockUser,
  },
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

export const WithAvatar: Story = {
  args: {
    user: {
      name: "山田 太郎",
      email: "yamada@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=yamada",
    },
  },
};
