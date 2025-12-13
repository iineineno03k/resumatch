import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Briefcase, FileText, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Common/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "No data",
    description: "There is nothing to display here yet.",
  },
};

export const NoApplicants: Story = {
  args: {
    icon: <Users className="h-8 w-8 text-muted-foreground" />,
    title: "応募者がいません",
    description:
      "まだ応募者が登録されていません。新しい応募者を登録してください。",
    action: <Button>応募者を登録</Button>,
  },
};

export const NoJobs: Story = {
  args: {
    icon: <Briefcase className="h-8 w-8 text-muted-foreground" />,
    title: "求人がありません",
    description: "まだ求人が作成されていません。最初の求人を作成しましょう。",
    action: <Button>求人を作成</Button>,
  },
};

export const NoResume: Story = {
  args: {
    icon: <FileText className="h-8 w-8 text-muted-foreground" />,
    title: "履歴書が未登録です",
    description: "この応募者の履歴書はまだアップロードされていません。",
    action: (
      <Button variant="outline" size="sm">
        履歴書をアップロード
      </Button>
    ),
  },
};

export const NoSearchResults: Story = {
  args: {
    icon: <Search className="h-8 w-8 text-muted-foreground" />,
    title: "検索結果がありません",
    description:
      "条件に一致する結果が見つかりませんでした。検索条件を変更してお試しください。",
  },
};

export const WithoutAction: Story = {
  args: {
    title: "データがありません",
    description: "表示するデータがありません。",
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "データなし",
  },
};
