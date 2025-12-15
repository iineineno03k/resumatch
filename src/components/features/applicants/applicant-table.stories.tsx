import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ApplicantListItem } from "@/features/applicants/types";
import { ApplicantTable } from "./applicant-table";

const meta: Meta<typeof ApplicantTable> = {
  title: "Features/Applicants/ApplicantTable",
  component: ApplicantTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ApplicantTable>;

const mockApplicants: ApplicantListItem[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    status: "screening",
    jobTitle: "フロントエンドエンジニア",
    appliedAt: new Date("2024-01-15"),
    hasResume: true,
    aiSummary: "React/TypeScript 5年経験。大規模ECサイト開発経験あり。",
  },
  {
    id: "2",
    name: "佐藤花子",
    email: "sato@example.com",
    status: "first_interview",
    jobTitle: "バックエンドエンジニア",
    appliedAt: new Date("2024-01-14"),
    hasResume: true,
    aiSummary: "Go/Python 3年経験。マイクロサービス構築経験あり。",
  },
  {
    id: "3",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    status: "second_interview",
    jobTitle: "フロントエンドエンジニア",
    appliedAt: new Date("2024-01-13"),
    hasResume: true,
    aiSummary: null,
  },
  {
    id: "4",
    name: "田中美咲",
    email: "tanaka@example.com",
    status: "offer",
    jobTitle: "デザイナー",
    appliedAt: new Date("2024-01-10"),
    hasResume: false,
    aiSummary: null,
  },
  {
    id: "5",
    name: "高橋健二",
    email: "takahashi@example.com",
    status: "rejected",
    jobTitle: "プロダクトマネージャー",
    appliedAt: new Date("2024-01-08"),
    hasResume: true,
    aiSummary: "PM経験5年。toBプロダクト担当。",
  },
  {
    id: "6",
    name: "伊藤さくら",
    email: "ito@example.com",
    status: "accepted",
    jobTitle: "フロントエンドエンジニア",
    appliedAt: new Date("2024-01-05"),
    hasResume: true,
    aiSummary: "Vue.js/Nuxt.js 4年経験。リーダー経験あり。",
  },
  {
    id: "7",
    name: "渡辺大輔",
    email: "watanabe@example.com",
    status: "withdrawn",
    jobTitle: "バックエンドエンジニア",
    appliedAt: new Date("2024-01-03"),
    hasResume: true,
    aiSummary: null,
  },
];

export const Default: Story = {
  args: {
    applicants: mockApplicants,
  },
};

export const FewApplicants: Story = {
  args: {
    applicants: mockApplicants.slice(0, 3),
  },
};

export const AllStatuses: Story = {
  args: {
    applicants: [
      { ...mockApplicants[0], status: "screening" },
      { ...mockApplicants[1], status: "first_interview" },
      { ...mockApplicants[2], status: "second_interview" },
      {
        ...mockApplicants[0],
        id: "8",
        name: "最終面接者",
        status: "final_interview",
      },
      { ...mockApplicants[3], status: "offer" },
      { ...mockApplicants[5], status: "accepted" },
      { ...mockApplicants[4], status: "rejected" },
      { ...mockApplicants[6], status: "withdrawn" },
    ],
  },
};
