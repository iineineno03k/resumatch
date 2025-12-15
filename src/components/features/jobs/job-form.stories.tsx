import type { Meta, StoryObj } from "@storybook/react";
import { JobFormStory } from "./job-form-story";

const meta = {
  title: "Features/Jobs/JobForm",
  component: JobFormStory,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JobFormStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {
    mode: "create",
  },
};

export const EditMode: Story = {
  args: {
    mode: "edit",
    job: {
      id: "job-1",
      title: "フロントエンドエンジニア",
      description:
        "React/Next.jsを使用したWebアプリケーションの開発を担当していただきます。\n\nチームは5名で、アジャイル開発を実践しています。",
      requirements:
        "【必須】\n- React/TypeScriptの実務経験3年以上\n- Gitを用いたチーム開発経験\n\n【歓迎】\n- Next.jsの経験\n- テスト駆動開発の経験",
      status: "open",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    },
  },
};

export const EditModeClosedJob: Story = {
  args: {
    mode: "edit",
    job: {
      id: "job-2",
      title: "バックエンドエンジニア",
      description: "APIの設計・開発を担当していただきます。",
      requirements: "- Node.js/TypeScriptの経験\n- データベース設計の経験",
      status: "closed",
      createdAt: new Date("2023-06-01"),
      updatedAt: new Date("2024-01-10"),
    },
  },
};

export const WithError: Story = {
  args: {
    mode: "create",
    error: "求人タイトルは必須です",
  },
};

export const Submitting: Story = {
  args: {
    mode: "create",
    isPending: true,
  },
};
