import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "@storybook/test";
import { ErrorMessage, ErrorPage } from "./error-message";

const meta: Meta<typeof ErrorMessage> = {
  title: "Common/ErrorMessage",
  component: ErrorMessage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: {
    message: "データの取得に失敗しました。しばらくしてから再度お試しください。",
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: "接続エラー",
    message:
      "サーバーに接続できませんでした。ネットワーク接続を確認してください。",
  },
};

export const WithRetry: Story = {
  args: {
    message: "データの取得に失敗しました。",
    onRetry: fn(),
  },
};

export const NetworkError: Story = {
  args: {
    title: "ネットワークエラー",
    message:
      "インターネット接続を確認してください。問題が解決しない場合は、しばらくしてからもう一度お試しください。",
    onRetry: fn(),
  },
};

export const PageError: Story = {
  render: () => (
    <div className="w-[500px] border rounded-lg">
      <ErrorPage
        message="ページの読み込みに失敗しました。再度お試しください。"
        onRetry={fn()}
      />
    </div>
  ),
};

export const PageErrorWithoutRetry: Story = {
  render: () => (
    <div className="w-[500px] border rounded-lg">
      <ErrorPage
        title="アクセス権限がありません"
        message="このページを表示する権限がありません。管理者にお問い合わせください。"
      />
    </div>
  ),
};

export const NotFound: Story = {
  render: () => (
    <div className="w-[500px] border rounded-lg">
      <ErrorPage
        title="ページが見つかりません"
        message="お探しのページは存在しないか、移動した可能性があります。"
      />
    </div>
  ),
};
