import type { Meta, StoryObj } from "@storybook/react";
import { JobCard } from "./job-card";

const meta: Meta<typeof JobCard> = {
  title: "Common/JobCard",
  component: JobCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof JobCard>;

export const Open: Story = {
  args: {
    id: "job-1",
    title: "フロントエンドエンジニア",
    status: "open",
    applicantCount: 12,
    createdAt: new Date("2024-01-15"),
  },
};

export const Closed: Story = {
  args: {
    id: "job-2",
    title: "バックエンドエンジニア",
    status: "closed",
    applicantCount: 25,
    createdAt: new Date("2024-01-10"),
  },
};

export const NoApplicants: Story = {
  args: {
    id: "job-3",
    title: "デザイナー",
    status: "open",
    applicantCount: 0,
    createdAt: new Date("2024-01-20"),
  },
};

export const LongTitle: Story = {
  args: {
    id: "job-4",
    title: "シニアフルスタックエンジニア（React/TypeScript/Node.js）",
    status: "open",
    applicantCount: 8,
    createdAt: new Date("2024-01-18"),
  },
};

export const ManyApplicants: Story = {
  args: {
    id: "job-5",
    title: "プロダクトマネージャー",
    status: "open",
    applicantCount: 156,
    createdAt: new Date("2023-12-01"),
  },
};
